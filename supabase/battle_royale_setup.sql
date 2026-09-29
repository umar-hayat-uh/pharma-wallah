-- ============================================================================
-- PharmaWallah — Battle Royale (Pharma Fest gaming arena)
-- ============================================================================
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL → New query),
-- then run supabase/seed/20260927_battle_royale_questions.sql for the question
-- bank, then add yourself as an admin (see §10 at the bottom).
--
-- IDEMPOTENT: every object is `if not exists` / `create or replace`, so the
-- file can be re-run after an edit. ADDITIVE: it touches no existing table.
-- Everything lives in the `br_*` namespace so it cannot collide with the old
-- science-fair tournament (`entry_codes`, `tournament_*`) or anything else in
-- the project whose schema is not in this repo.
--
-- SECURITY MODEL (read before changing anything)
--   * RLS is ON for every table and there are NO policies, so the anon and
--     authenticated roles can read and write nothing. Every read and write goes
--     through a Next.js route handler holding the service-role key.
--   * The game engine is a set of plpgsql functions (§8). EXECUTE is revoked
--     from public/anon/authenticated and granted only to service_role, so a
--     browser holding the anon key cannot call them through PostgREST.
--   * The browser never sends a score, a participant id or a correct answer.
--     A running battle is identified only by a random token the server set as
--     an httpOnly cookie; the database stores its SHA-256, never the token.
--   * Grading, timers and the running total are computed here, inside a row
--     lock on the attempt, so two tabs cannot double-submit and a late answer
--     cannot score.
-- ============================================================================


-- ─── 1. Settings (one row) ──────────────────────────────────────────────────
-- Everything the organisers may want to change on the day without a deploy.

create table if not exists public.br_settings (
    id                     smallint primary key default 1 check (id = 1),
    event_title            text        not null default 'PharmaWallah Battle Royale',
    tagline                text        not null default 'Register. Play. Score. Dominate.',
    event_date             date,
    reporting_time         text        not null default '',
    venue                  text        not null default 'Pharma Fest Gaming Arena — PharmaWallah stall',
    entry_fee              integer     not null default 100 check (entry_fee >= 0),
    contact_text           text        not null default 'Ask any PharmaWallah coordinator at the stall.',
    -- Questions drawn per attempt, per round. For round 2 this is the number
    -- of matching boards, each carrying several pairs.
    round1_count           smallint    not null default 5 check (round1_count between 1 and 20),
    round2_count           smallint    not null default 1 check (round2_count between 1 and 5),
    round3_count           smallint    not null default 10 check (round3_count between 1 and 40),
    speed_bonus_enabled    boolean     not null default true,
    -- Maximum bonus for an instant, fully correct answer; it falls linearly to
    -- 0 at the question's time limit.
    speed_bonus_max        smallint    not null default 5 check (speed_bonus_max between 0 and 50),
    winners_count          smallint    not null default 10 check (winners_count between 1 and 100),
    registration_open      boolean     not null default true,
    -- Battles can only START while this is on. A battle already in progress
    -- can always be finished.
    competition_open       boolean     not null default false,
    -- Set when the leaderboard is frozen: scores completed after it are not
    -- ranked. Null = live.
    leaderboard_frozen_at  timestamptz,
    results_finalized      boolean     not null default false,
    -- false → the public board shows "Ayesha K." style names; true → full names.
    show_full_names        boolean     not null default false,
    rules                  jsonb       not null default '[]'::jsonb,
    updated_at             timestamptz not null default now()
);

insert into public.br_settings (id, rules) values (1, jsonb_build_array(
    'Entry fee: Rs. 100 per participant, paid at the PharmaWallah desk.',
    'Each participant receives one Player ID and one private Game Code.',
    'One official attempt per participant. All three rounds must be completed in the same attempt.',
    'Every question has its own timer. An answer submitted after the timer ends scores zero.',
    'Answers are final once submitted — there is no going back.',
    'Scores are calculated by the system and cannot be changed except by an authorised event administrator after verification.',
    'Ties are broken by the higher Round 3 score, then by the faster total answering time.',
    'The leaderboard closes at the announced closing time. Only verified scores in the official system are eligible for prizes.',
    'Using another person''s Game Code, or any outside help, leads to disqualification.',
    'The Top 10 participants receive a PharmaWallah Goodie Hamper.'
)) on conflict (id) do nothing;


-- ─── 2. Admins ──────────────────────────────────────────────────────────────
-- Admin rights are a row here, checked server-side on every admin request —
-- not an email string compared in code. Add one with the snippet in §10.

create table if not exists public.br_admins (
    user_id     uuid primary key references auth.users (id) on delete cascade,
    email       text        not null,
    role        text        not null default 'admin' check (role in ('admin', 'desk')),
    created_at  timestamptz not null default now()
);


-- ─── 3. Battle sessions (slots) ─────────────────────────────────────────────

create table if not exists public.br_sessions (
    id          uuid primary key default gen_random_uuid(),
    name        text        not null check (char_length(name) between 1 and 80),
    event_date  date        not null,
    start_time  timestamptz not null,
    end_time    timestamptz not null,
    capacity    integer     not null default 50 check (capacity between 1 and 10000),
    status      text        not null default 'scheduled'
                check (status in ('scheduled', 'open', 'live', 'completed', 'cancelled')),
    created_at  timestamptz not null default now(),
    updated_at  timestamptz not null default now(),
    check (end_time > start_time)
);

create index if not exists br_sessions_start_idx on public.br_sessions (start_time);


-- ─── 4. Participants ────────────────────────────────────────────────────────

create sequence if not exists public.br_participant_seq;

-- A 6-character code from an alphabet with no 0/O/1/I, so it can be read off a
-- printed slip without ambiguity. 32 symbols, so `byte % 32` is unbiased; the
-- bytes come from gen_random_uuid() (cryptographically random, core since
-- PG13 — no pgcrypto needed). Only bytes 0-5 are used: bytes 6 and 8 carry
-- the UUID version/variant bits.
create or replace function public.br_new_game_code()
returns text
language plpgsql
volatile
as $$
declare
    alphabet constant text := 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    raw bytea := uuid_send(gen_random_uuid());
    out text := '';
begin
    for i in 0..5 loop
        out := out || substr(alphabet, (get_byte(raw, i) % 32) + 1, 1);
    end loop;
    return out;
end;
$$;

create table if not exists public.br_participants (
    id                   uuid primary key default gen_random_uuid(),
    -- Public identifier: printed on the leaderboard. Sequential by design.
    participant_code     text unique not null default
                         ('BR-' || to_char(now() at time zone 'Asia/Karachi', 'YYYY') || '-' ||
                          lpad(nextval('public.br_participant_seq')::text, 4, '0')),
    -- Private: required, with the Player ID, to check in, start and view results.
    game_code            text        not null default public.br_new_game_code(),
    name                 text        not null check (char_length(name) between 2 and 100),
    -- Stored lower-case. Null only for a desk walk-in who gave no email.
    email                text        check (email is null or email = lower(email)),
    phone                text,
    university           text        not null,
    pharm_year           text        not null,
    student_id           text,
    slot_id              uuid references public.br_sessions (id) on delete set null,
    source               text        not null default 'online' check (source in ('online', 'desk')),
    registration_status  text        not null default 'registered'
                         check (registration_status in ('registered', 'disqualified', 'cancelled')),
    payment_status       text        not null default 'unpaid'
                         check (payment_status in ('unpaid', 'paid', 'waived')),
    check_in_status      text        not null default 'not_checked_in'
                         check (check_in_status in ('not_checked_in', 'checked_in', 'late')),
    checked_in_at        timestamptz,
    notes                text,
    created_at           timestamptz not null default now(),
    updated_at           timestamptz not null default now()
);

create unique index if not exists br_participants_email_key
    on public.br_participants (email) where email is not null;
create index if not exists br_participants_slot_idx     on public.br_participants (slot_id);
create index if not exists br_participants_created_idx  on public.br_participants (created_at desc);
create index if not exists br_participants_status_idx
    on public.br_participants (registration_status, payment_status, check_in_status);


-- ─── 5. Questions ───────────────────────────────────────────────────────────
-- round 1 = WORD      question = the clue; correct_answer = the word (A–Z only)
-- round 2 = MATCHING  question = the instruction; options = {"pairs":[{"left","right"}]}
--                     correct_answer unused; `points` is per correct pair
-- round 3 = MCQ       options = {"A","B","C","D"}; correct_answer = one of A–D

create table if not exists public.br_questions (
    id              uuid primary key default gen_random_uuid(),
    -- Stable key for seeded rows so the seed file can be re-run safely.
    seed_key        text unique,
    round           smallint    not null check (round in (1, 2, 3)),
    type            text        not null check (type in ('WORD', 'MATCHING', 'MCQ')),
    question        text        not null check (char_length(question) between 3 and 500),
    options         jsonb       not null default '{}'::jsonb,
    correct_answer  text,
    explanation     text,
    points          integer     not null default 10 check (points between 1 and 100),
    time_limit      integer     not null default 30 check (time_limit between 5 and 600),
    difficulty      text        not null default 'medium' check (difficulty in ('easy', 'medium', 'hard')),
    active          boolean     not null default true,
    created_at      timestamptz not null default now(),
    updated_at      timestamptz not null default now(),
    check ((round = 1 and type = 'WORD') or (round = 2 and type = 'MATCHING') or (round = 3 and type = 'MCQ')),
    check (type <> 'WORD'  or correct_answer ~ '^[A-Z]{3,16}$'),
    check (type <> 'MCQ'   or (correct_answer in ('A', 'B', 'C', 'D')
                               and options ? 'A' and options ? 'B' and options ? 'C' and options ? 'D')),
    check (type <> 'MATCHING' or (jsonb_typeof(options -> 'pairs') = 'array'
                                  and jsonb_array_length(options -> 'pairs') between 3 and 8))
);

create index if not exists br_questions_pool_idx on public.br_questions (round, active);


-- ─── 6. Attempts and answers ────────────────────────────────────────────────

create table if not exists public.br_attempts (
    id               uuid primary key default gen_random_uuid(),
    participant_id   uuid        not null references public.br_participants (id) on delete cascade,
    session_id       uuid references public.br_sessions (id) on delete set null,
    -- SHA-256 (hex) of the httpOnly cookie token. Rotated on resume.
    token_hash       text unique not null,
    status           text        not null default 'active' check (status in ('active', 'completed', 'void')),
    -- [[round-1 question ids], [round-2 ids], [round-3 ids]], drawn at start.
    plan             jsonb       not null,
    round            smallint    not null default 1,
    q_index          smallint    not null default 0,
    served_question  uuid,
    served_at        timestamptz,
    -- What the player was shown (scrambled letters, shuffled right column), so
    -- a reload shows the same board with the same deadline.
    served_payload   jsonb,
    round1_score     integer     not null default 0,
    round2_score     integer     not null default 0,
    round3_score     integer     not null default 0,
    total_score      integer     not null default 0,
    correct_count    integer     not null default 0,
    answered_count   integer     not null default 0,
    total_questions  integer     not null default 0,
    total_time_ms    integer     not null default 0,
    started_at       timestamptz not null default now(),
    completed_at     timestamptz,
    void_reason      text,
    created_at       timestamptz not null default now(),
    updated_at       timestamptz not null default now()
);

-- One official attempt per participant: a voided attempt (technical issue,
-- reset by an admin) frees the slot; nothing else does.
create unique index if not exists br_attempts_one_live
    on public.br_attempts (participant_id) where status <> 'void';
create index if not exists br_attempts_status_idx on public.br_attempts (status, started_at desc);

create table if not exists public.br_answers (
    id              uuid primary key default gen_random_uuid(),
    attempt_id      uuid        not null references public.br_attempts (id) on delete cascade,
    question_id     uuid        not null references public.br_questions (id),
    participant_id  uuid        not null references public.br_participants (id) on delete cascade,
    round           smallint    not null,
    answer          jsonb,
    is_correct      boolean     not null default false,
    correct_parts   smallint    not null default 0,
    total_parts     smallint    not null default 1,
    timed_out       boolean     not null default false,
    base_points     integer     not null default 0,
    bonus_points    integer     not null default 0,
    score           integer     not null default 0,
    time_taken_ms   integer     not null default 0,
    submitted_at    timestamptz not null default now(),
    -- The database-level guarantee against a double submission.
    unique (attempt_id, question_id)
);

create index if not exists br_answers_participant_idx on public.br_answers (participant_id);


-- ─── 7. Scores, email log ───────────────────────────────────────────────────

create table if not exists public.br_scores (
    participant_id    uuid primary key references public.br_participants (id) on delete cascade,
    attempt_id        uuid        not null references public.br_attempts (id) on delete cascade,
    round1_score      integer     not null default 0,
    round2_score      integer     not null default 0,
    round3_score      integer     not null default 0,
    total_score       integer     not null default 0,
    correct_count     integer     not null default 0,
    total_questions   integer     not null default 0,
    total_time_ms     integer     not null default 0,
    completed_at      timestamptz not null,
    final_status      text        not null default 'pending'
                      check (final_status in ('pending', 'participant', 'winner', 'qualified', 'not_qualified')),
    -- An admin set the status by hand; finalising will not overwrite it.
    status_overridden boolean     not null default false,
    updated_at        timestamptz not null default now()
);

create index if not exists br_scores_rank_idx
    on public.br_scores (total_score desc, round3_score desc, total_time_ms asc);

create table if not exists public.br_email_logs (
    id              uuid primary key default gen_random_uuid(),
    participant_id  uuid references public.br_participants (id) on delete set null,
    email_type      text        not null check (email_type in
                    ('registration', 'slot_assignment', 'reminder', 'check_in', 'qualification', 'result')),
    recipient       text        not null,
    subject         text        not null,
    status          text        not null check (status in ('sent', 'failed')),
    resend_id       text,
    error           text,
    sent_at         timestamptz not null default now()
);

create index if not exists br_email_logs_sent_idx on public.br_email_logs (sent_at desc);
create index if not exists br_email_logs_participant_idx on public.br_email_logs (participant_id);


-- ─── 8. Leaderboard view ────────────────────────────────────────────────────
-- security_invoker so the view obeys the caller's rights (a default view runs
-- as its owner and would bypass RLS). Access is revoked from anon anyway.
-- Ranking: total, then Round 3, then faster answering time (the event rules).
-- A frozen board ignores scores completed after the freeze.

create or replace view public.br_leaderboard with (security_invoker = true) as
select
    rank() over (order by s.total_score desc, s.round3_score desc, s.total_time_ms asc) as rank,
    s.participant_id,
    p.participant_code,
    p.name,
    p.university,
    s.round1_score, s.round2_score, s.round3_score, s.total_score,
    s.correct_count, s.total_questions, s.total_time_ms, s.completed_at, s.final_status
from public.br_scores s
join public.br_participants p on p.id = s.participant_id
cross join public.br_settings st
where p.registration_status = 'registered'
  and (st.leaderboard_frozen_at is null or s.completed_at <= st.leaderboard_frozen_at);


-- ─── 9. The game engine ─────────────────────────────────────────────────────
-- Errors are raised as `BR_<CODE>` messages; the route maps each to a status
-- and a sentence a participant can act on. Never surface raw SQL errors.

-- Seconds of network allowance on every per-question timer.
create or replace function public.br_grace_ms() returns integer language sql immutable as $$ select 2000 $$;

-- Letters, scrambled, never left in the right order.
create or replace function public.br_scramble(p_word text)
returns jsonb
language plpgsql
volatile
as $$
declare
    letters text[];
begin
    for i in 1..8 loop
        select array_agg(ch order by random()) into letters
        from regexp_split_to_table(p_word, '') as ch;
        exit when array_to_string(letters, '') <> p_word;
    end loop;
    return to_jsonb(letters);
end;
$$;

-- What the player sees for a question. The answer key never appears here:
-- WORD gets letters, MCQ gets the four options, MATCHING gets the left column
-- in order and the right column shuffled.
create or replace function public.br_make_payload(q public.br_questions)
returns jsonb
language plpgsql
volatile
as $$
begin
    if q.type = 'WORD' then
        return jsonb_build_object('letters', public.br_scramble(q.correct_answer));
    elsif q.type = 'MATCHING' then
        return jsonb_build_object('right', (
            select jsonb_agg(p -> 'right' order by random())
            from jsonb_array_elements(q.options -> 'pairs') p));
    else
        return '{}'::jsonb;
    end if;
end;
$$;

create or replace function public.br_public_question(q public.br_questions, p_payload jsonb, p_served_at timestamptz)
returns jsonb
language sql
stable
as $$
    select jsonb_build_object(
        'id', q.id,
        'type', q.type,
        'round', q.round,
        'prompt', q.question,
        'points', q.points,
        'timeLimit', q.time_limit,
        'difficulty', q.difficulty,
        'servedAt', p_served_at,
        'deadline', p_served_at + make_interval(secs => q.time_limit),
        'letters', case when q.type = 'WORD' then p_payload -> 'letters' end,
        'length', case when q.type = 'WORD' then char_length(q.correct_answer) end,
        'options', case when q.type = 'MCQ' then jsonb_build_array(
                        jsonb_build_object('key', 'A', 'text', q.options ->> 'A'),
                        jsonb_build_object('key', 'B', 'text', q.options ->> 'B'),
                        jsonb_build_object('key', 'C', 'text', q.options ->> 'C'),
                        jsonb_build_object('key', 'D', 'text', q.options ->> 'D')) end,
        'left', case when q.type = 'MATCHING' then (
                        select jsonb_agg(p -> 'left' order by ord)
                        from jsonb_array_elements(q.options -> 'pairs') with ordinality as t(p, ord)) end,
        'right', case when q.type = 'MATCHING' then p_payload -> 'right' end
    );
$$;

-- Recompute the attempt's totals from its answers — the answers are the
-- ledger; the attempt's columns are a cache of them.
create or replace function public.br_recount(p_attempt_id uuid)
returns void
language sql
as $$
    update public.br_attempts a set
        round1_score   = coalesce(x.r1, 0),
        round2_score   = coalesce(x.r2, 0),
        round3_score   = coalesce(x.r3, 0),
        total_score    = coalesce(x.r1, 0) + coalesce(x.r2, 0) + coalesce(x.r3, 0),
        correct_count  = coalesce(x.correct, 0),
        answered_count = coalesce(x.answered, 0),
        total_time_ms  = coalesce(x.ms, 0),
        updated_at     = now()
    from (
        select
            sum(score) filter (where round = 1) as r1,
            sum(score) filter (where round = 2) as r2,
            sum(score) filter (where round = 3) as r3,
            -- Correct gradable items: a matching board contributes its correct
            -- pairs, matching how total_questions counts it.
            sum(correct_parts)                  as correct,
            count(*)                            as answered,
            sum(time_taken_ms)                  as ms
        from public.br_answers where attempt_id = p_attempt_id
    ) x
    where a.id = p_attempt_id;
$$;

-- Move to the next question; after the last one, complete the attempt and
-- write the participant's score row.
create or replace function public.br_advance(p_attempt_id uuid)
returns void
language plpgsql
as $$
declare
    a public.br_attempts;
    round_size integer;
begin
    select * into a from public.br_attempts where id = p_attempt_id;
    round_size := jsonb_array_length(a.plan -> (a.round - 1));

    if a.q_index + 1 < round_size then
        update public.br_attempts
           set q_index = q_index + 1, served_question = null, served_at = null, served_payload = null,
               updated_at = now()
         where id = p_attempt_id;
        return;
    end if;

    if a.round < 3 then
        update public.br_attempts
           set round = round + 1, q_index = 0, served_question = null, served_at = null, served_payload = null,
               updated_at = now()
         where id = p_attempt_id;
        return;
    end if;

    update public.br_attempts
       set status = 'completed', completed_at = now(),
           served_question = null, served_at = null, served_payload = null, updated_at = now()
     where id = p_attempt_id
    returning * into a;

    insert into public.br_scores as s (participant_id, attempt_id, round1_score, round2_score, round3_score,
                                       total_score, correct_count, total_questions, total_time_ms, completed_at)
    values (a.participant_id, a.id, a.round1_score, a.round2_score, a.round3_score,
            a.total_score, a.correct_count, a.total_questions, a.total_time_ms, a.completed_at)
    on conflict (participant_id) do update set
        attempt_id = excluded.attempt_id,
        round1_score = excluded.round1_score, round2_score = excluded.round2_score,
        round3_score = excluded.round3_score, total_score = excluded.total_score,
        correct_count = excluded.correct_count, total_questions = excluded.total_questions,
        total_time_ms = excluded.total_time_ms, completed_at = excluded.completed_at,
        final_status = 'pending', status_overridden = false, updated_at = now();
end;
$$;

-- If the served question's timer has run out, record it as unanswered and
-- move on. Called at the top of every engine entry point, so a player who
-- walks away cannot come back to a question and answer it late.
create or replace function public.br_expire(p_attempt_id uuid)
returns void
language plpgsql
as $$
declare
    a public.br_attempts;
    q public.br_questions;
begin
    select * into a from public.br_attempts where id = p_attempt_id;
    if a.status <> 'active' or a.served_question is null then return; end if;
    select * into q from public.br_questions where id = a.served_question;

    if now() > a.served_at + make_interval(secs => q.time_limit) + make_interval(secs => public.br_grace_ms() / 1000.0) then
        insert into public.br_answers (attempt_id, question_id, participant_id, round, answer, is_correct,
                                       correct_parts, total_parts, timed_out, score, time_taken_ms)
        values (a.id, q.id, a.participant_id, a.round, null, false, 0,
                case when q.type = 'MATCHING' then jsonb_array_length(q.options -> 'pairs') else 1 end,
                true, 0, q.time_limit * 1000)
        on conflict (attempt_id, question_id) do nothing;
        perform public.br_recount(a.id);
        perform public.br_advance(a.id);
    end if;
end;
$$;

-- The full picture a battle screen needs. Never includes an answer key.
create or replace function public.br_state_of(p_attempt_id uuid)
returns jsonb
language plpgsql
stable
as $$
declare
    a public.br_attempts;
    p public.br_participants;
    q public.br_questions;
    served jsonb := null;
begin
    select * into a from public.br_attempts where id = p_attempt_id;
    select * into p from public.br_participants where id = a.participant_id;
    if a.served_question is not null then
        select * into q from public.br_questions where id = a.served_question;
        served := public.br_public_question(q, a.served_payload, a.served_at);
    end if;

    return jsonb_build_object(
        'status', a.status,
        'round', a.round,
        'index', a.q_index,
        'roundSizes', jsonb_build_array(
            jsonb_array_length(a.plan -> 0), jsonb_array_length(a.plan -> 1), jsonb_array_length(a.plan -> 2)),
        'roundScores', jsonb_build_array(a.round1_score, a.round2_score, a.round3_score),
        'totalScore', a.total_score,
        'correctCount', a.correct_count,
        'answeredCount', a.answered_count,
        'totalQuestions', a.total_questions,
        'totalTimeMs', a.total_time_ms,
        'startedAt', a.started_at,
        'completedAt', a.completed_at,
        'participant', jsonb_build_object('code', p.participant_code, 'name', p.name),
        'question', served,
        'now', now()
    );
end;
$$;

create or replace function public.br_lock_attempt(p_token_hash text)
returns public.br_attempts
language plpgsql
as $$
declare
    a public.br_attempts;
begin
    select * into a from public.br_attempts where token_hash = p_token_hash for update;
    if not found then raise exception 'BR_NO_ATTEMPT'; end if;
    if a.status = 'void' then raise exception 'BR_ATTEMPT_VOID'; end if;
    return a;
end;
$$;

-- Start (or resume) a battle. p_identifier is a Player ID or an email.
create or replace function public.br_start_attempt(p_identifier text, p_game_code text, p_token_hash text)
returns jsonb
language plpgsql
as $$
declare
    st public.br_settings;
    p public.br_participants;
    a public.br_attempts;
    sess_status text;
    r1 jsonb; r2 jsonb; r3 jsonb;
    pairs integer;
    ident text := trim(p_identifier);
begin
    select * into st from public.br_settings where id = 1;

    select * into p from public.br_participants
     where participant_code = upper(ident) or email = lower(ident)
     for update;
    if not found or p.game_code <> upper(trim(p_game_code)) then
        raise exception 'BR_INVALID_CREDENTIALS';
    end if;
    if p.registration_status = 'disqualified' then raise exception 'BR_DISQUALIFIED'; end if;
    if p.registration_status = 'cancelled'    then raise exception 'BR_CANCELLED'; end if;

    -- An attempt already exists: finish it on this device, never start a second.
    select * into a from public.br_attempts where participant_id = p.id and status <> 'void' for update;
    if found then
        if a.status = 'completed' then raise exception 'BR_ALREADY_PLAYED'; end if;
        update public.br_attempts set token_hash = p_token_hash, updated_at = now() where id = a.id;
        perform public.br_expire(a.id);
        return public.br_state_of(a.id) || jsonb_build_object('resumed', true);
    end if;

    if not st.competition_open then raise exception 'BR_CLOSED'; end if;
    if p.payment_status not in ('paid', 'waived') then raise exception 'BR_NOT_PAID'; end if;
    if p.check_in_status not in ('checked_in', 'late') then raise exception 'BR_NOT_CHECKED_IN'; end if;
    if p.slot_id is not null then
        select status into sess_status from public.br_sessions where id = p.slot_id;
        if sess_status in ('completed', 'cancelled') then raise exception 'BR_SESSION_ENDED'; end if;
    end if;

    select coalesce(jsonb_agg(id), '[]'::jsonb) into r1 from
        (select id from public.br_questions where active and round = 1 order by random() limit st.round1_count) x;
    select coalesce(jsonb_agg(id), '[]'::jsonb) into r2 from
        (select id from public.br_questions where active and round = 2 order by random() limit st.round2_count) x;
    select coalesce(jsonb_agg(id), '[]'::jsonb) into r3 from
        (select id from public.br_questions where active and round = 3 order by random() limit st.round3_count) x;
    if jsonb_array_length(r1) = 0 or jsonb_array_length(r2) = 0 or jsonb_array_length(r3) = 0 then
        raise exception 'BR_NO_QUESTIONS';
    end if;

    -- "Questions" counts every gradable item: a matching pair is one.
    select coalesce(sum(jsonb_array_length(options -> 'pairs')), 0) into pairs
      from public.br_questions where id in (select (jsonb_array_elements_text(r2))::uuid);

    insert into public.br_attempts (participant_id, session_id, token_hash, plan, total_questions)
    values (p.id, p.slot_id, p_token_hash, jsonb_build_array(r1, r2, r3),
            jsonb_array_length(r1) + pairs + jsonb_array_length(r3))
    returning * into a;

    return public.br_state_of(a.id) || jsonb_build_object('resumed', false);
end;
$$;

-- Read the battle. Applies any expired timer first.
create or replace function public.br_state(p_token_hash text)
returns jsonb
language plpgsql
as $$
declare
    a public.br_attempts;
begin
    a := public.br_lock_attempt(p_token_hash);
    perform public.br_expire(a.id);
    return public.br_state_of(a.id);
end;
$$;

-- Reveal the current question and start its timer. Idempotent: calling it
-- again returns the same question with the same deadline, so a reload or a
-- double tap can never restart a clock.
create or replace function public.br_serve(p_token_hash text)
returns jsonb
language plpgsql
as $$
declare
    a public.br_attempts;
    q public.br_questions;
    qid uuid;
begin
    a := public.br_lock_attempt(p_token_hash);
    perform public.br_expire(a.id);
    select * into a from public.br_attempts where id = a.id;

    if a.status = 'active' and a.served_question is null then
        qid := (a.plan -> (a.round - 1) ->> a.q_index)::uuid;
        select * into q from public.br_questions where id = qid;
        if not found then raise exception 'BR_QUESTION_MISSING'; end if;
        update public.br_attempts
           set served_question = q.id, served_at = now(), served_payload = public.br_make_payload(q),
               updated_at = now()
         where id = a.id;
    end if;
    return public.br_state_of(a.id);
end;
$$;

-- Grade one answer. p_answer shapes:
--   WORD      {"word": "ASPIRIN"}
--   MCQ       {"choice": "B"}
--   MATCHING  {"matches": ["right for left 1", "right for left 2", …]}
create or replace function public.br_answer(p_token_hash text, p_question_id uuid, p_answer jsonb)
returns jsonb
language plpgsql
as $$
declare
    st public.br_settings;
    a public.br_attempts;
    q public.br_questions;
    elapsed_ms integer;
    limit_ms integer;
    late boolean;
    correct boolean := false;
    parts integer := 1;
    right_parts integer := 0;
    base integer := 0;
    bonus integer := 0;
    given text;
    reveal jsonb;
begin
    select * into st from public.br_settings where id = 1;
    a := public.br_lock_attempt(p_token_hash);

    if a.status = 'completed' then raise exception 'BR_COMPLETED'; end if;
    if exists (select 1 from public.br_answers where attempt_id = a.id and question_id = p_question_id) then
        raise exception 'BR_DUPLICATE';
    end if;
    if a.served_question is null or a.served_question <> p_question_id then
        raise exception 'BR_WRONG_QUESTION';
    end if;

    select * into q from public.br_questions where id = p_question_id;
    limit_ms   := q.time_limit * 1000;
    elapsed_ms := floor(extract(epoch from (now() - a.served_at)) * 1000)::integer;
    late       := elapsed_ms > limit_ms + public.br_grace_ms();

    if q.type = 'WORD' then
        given := upper(regexp_replace(coalesce(p_answer ->> 'word', ''), '[^A-Za-z]', '', 'g'));
        correct := not late and given = q.correct_answer;
        right_parts := case when correct then 1 else 0 end;
        base := case when correct then q.points else 0 end;
        reveal := to_jsonb(q.correct_answer);
    elsif q.type = 'MCQ' then
        given := upper(coalesce(p_answer ->> 'choice', ''));
        correct := not late and given = q.correct_answer;
        right_parts := case when correct then 1 else 0 end;
        base := case when correct then q.points else 0 end;
        reveal := to_jsonb(q.correct_answer);
    else
        parts := jsonb_array_length(q.options -> 'pairs');
        if not late and jsonb_typeof(p_answer -> 'matches') = 'array' then
            select count(*) into right_parts
              from jsonb_array_elements(q.options -> 'pairs') with ordinality as t(pair, ord)
             where (p_answer -> 'matches' ->> (ord - 1)::integer) = (pair ->> 'right');
        end if;
        correct := right_parts = parts;
        base := right_parts * q.points;
        reveal := (select jsonb_agg(pair -> 'right' order by ord)
                     from jsonb_array_elements(q.options -> 'pairs') with ordinality as t(pair, ord));
    end if;

    if correct and st.speed_bonus_enabled and st.speed_bonus_max > 0 then
        bonus := round(st.speed_bonus_max * greatest(0, 1 - least(elapsed_ms, limit_ms)::numeric / limit_ms));
    end if;

    insert into public.br_answers (attempt_id, question_id, participant_id, round, answer, is_correct,
                                   correct_parts, total_parts, timed_out, base_points, bonus_points, score,
                                   time_taken_ms)
    values (a.id, q.id, a.participant_id, a.round, p_answer, correct, right_parts, parts, late,
            base, bonus, base + bonus, least(elapsed_ms, limit_ms));

    perform public.br_recount(a.id);
    perform public.br_advance(a.id);

    return jsonb_build_object(
        'result', jsonb_build_object(
            'questionId', q.id,
            'correct', correct,
            'timedOut', late,
            'correctParts', right_parts,
            'totalParts', parts,
            'basePoints', base,
            'bonusPoints', bonus,
            'score', base + bonus,
            'correctAnswer', reveal,
            'explanation', q.explanation),
        'state', public.br_state_of(a.id));
end;
$$;

-- Online and desk registration. Checks slot capacity under a row lock so two
-- people cannot take the last seat.
create or replace function public.br_register(
    p_name text, p_email text, p_phone text, p_university text, p_year text, p_student_id text,
    p_slot_id uuid, p_source text, p_payment_status text
)
returns public.br_participants
language plpgsql
as $$
declare
    st public.br_settings;
    sess public.br_sessions;
    taken integer;
    p public.br_participants;
begin
    select * into st from public.br_settings where id = 1;
    if p_source = 'online' and not st.registration_open then raise exception 'BR_REGISTRATION_CLOSED'; end if;

    if p_email is not null and exists (select 1 from public.br_participants where email = lower(p_email)) then
        raise exception 'BR_EMAIL_TAKEN';
    end if;

    if p_slot_id is not null then
        select * into sess from public.br_sessions where id = p_slot_id for update;
        if not found or sess.status in ('completed', 'cancelled') then raise exception 'BR_SLOT_UNAVAILABLE'; end if;
        select count(*) into taken from public.br_participants
         where slot_id = p_slot_id and registration_status <> 'cancelled';
        if taken >= sess.capacity then raise exception 'BR_SLOT_FULL'; end if;
    end if;

    insert into public.br_participants (name, email, phone, university, pharm_year, student_id, slot_id,
                                        source, payment_status)
    values (p_name, lower(p_email), p_phone, p_university, p_year, p_student_id, p_slot_id,
            p_source, coalesce(p_payment_status, 'unpaid'))
    returning * into p;
    return p;
exception
    -- The unique index is the real guard; the check above only gives a
    -- friendlier path for the common case.
    when unique_violation then raise exception 'BR_EMAIL_TAKEN';
end;
$$;

-- Assign or clear a slot, respecting capacity.
create or replace function public.br_assign_slot(p_participant_id uuid, p_slot_id uuid)
returns void
language plpgsql
as $$
declare
    sess public.br_sessions;
    taken integer;
begin
    if p_slot_id is not null then
        select * into sess from public.br_sessions where id = p_slot_id for update;
        if not found or sess.status in ('completed', 'cancelled') then raise exception 'BR_SLOT_UNAVAILABLE'; end if;
        select count(*) into taken from public.br_participants
         where slot_id = p_slot_id and registration_status <> 'cancelled' and id <> p_participant_id;
        if taken >= sess.capacity then raise exception 'BR_SLOT_FULL'; end if;
    end if;
    update public.br_participants set slot_id = p_slot_id, updated_at = now() where id = p_participant_id;
    if not found then raise exception 'BR_NOT_FOUND'; end if;
end;
$$;

-- Void an attempt (technical failure, verified by an admin). The answers are
-- kept for the record; the score row is removed and a new attempt is allowed.
create or replace function public.br_void_attempt(p_participant_id uuid, p_reason text)
returns void
language plpgsql
as $$
begin
    update public.br_attempts
       set status = 'void', void_reason = p_reason, token_hash = token_hash || ':void:' || id::text,
           updated_at = now()
     where participant_id = p_participant_id and status <> 'void';
    if not found then raise exception 'BR_NO_ATTEMPT'; end if;
    delete from public.br_scores where participant_id = p_participant_id;
end;
$$;

-- Label the Top N as winners and everyone else ranked as participants. A
-- status an admin set by hand is left alone.
create or replace function public.br_finalize_results(p_winners integer)
returns integer
language plpgsql
as $$
declare
    n integer;
begin
    update public.br_scores s
       set final_status = case when lb.rank <= p_winners then 'winner' else 'participant' end,
           updated_at = now()
      from public.br_leaderboard lb
     where lb.participant_id = s.participant_id and not s.status_overridden;
    get diagnostics n = row_count;
    update public.br_settings set results_finalized = true, updated_at = now() where id = 1;
    return n;
end;
$$;

create or replace function public.br_unfinalize_results()
returns void
language sql
as $$
    update public.br_scores set final_status = 'pending', updated_at = now() where not status_overridden;
    update public.br_settings set results_finalized = false, updated_at = now() where id = 1;
$$;

-- Delete a question only if no attempt has ever drawn it; otherwise retire it,
-- so a finished battle's record still resolves.
create or replace function public.br_delete_question(p_id uuid)
returns text
language plpgsql
as $$
begin
    if exists (select 1 from public.br_attempts where plan @> jsonb_build_array(jsonb_build_array(p_id::text)))
       or exists (select 1 from public.br_answers where question_id = p_id) then
        update public.br_questions set active = false, updated_at = now() where id = p_id;
        return 'deactivated';
    end if;
    delete from public.br_questions where id = p_id;
    return 'deleted';
end;
$$;


-- ─── 10. Lock it down ───────────────────────────────────────────────────────

alter table public.br_settings     enable row level security;
alter table public.br_admins       enable row level security;
alter table public.br_sessions     enable row level security;
alter table public.br_participants enable row level security;
alter table public.br_questions    enable row level security;
alter table public.br_attempts     enable row level security;
alter table public.br_answers      enable row level security;
alter table public.br_scores       enable row level security;
alter table public.br_email_logs   enable row level security;

revoke all on public.br_settings, public.br_admins, public.br_sessions, public.br_participants,
              public.br_questions, public.br_attempts, public.br_answers, public.br_scores,
              public.br_email_logs, public.br_leaderboard
       from anon, authenticated;
grant all on public.br_settings, public.br_admins, public.br_sessions, public.br_participants,
             public.br_questions, public.br_attempts, public.br_answers, public.br_scores,
             public.br_email_logs, public.br_leaderboard
      to service_role;
grant usage, select on sequence public.br_participant_seq to service_role;

do $$
declare
    fn text;
begin
    for fn in
        select p.oid::regprocedure::text
          from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname like 'br\_%'
    loop
        execute format('revoke all on function %s from public, anon, authenticated', fn);
        execute format('grant execute on function %s to service_role', fn);
    end loop;
end;
$$;

-- To make someone an admin (they must have signed in to PharmaWallah once):
--   insert into public.br_admins (user_id, email)
--   select id, email from auth.users where email = 'you@example.com'
--   on conflict (user_id) do nothing;
-- role 'desk' can register, check in and take payments but cannot edit
-- questions, settings or results.


-- ============================================================================
-- PharmaWallah — Battle Royale v2 (run AFTER 20260927_battle_royale.sql)
-- ============================================================================
-- What changes (user decisions, 2026-09-28):
--   1. The Game Code is issued by an admin when payment is approved, shown only
--      in the admin, handed over at the desk, and consumed the moment a battle
--      starts. Registration no longer creates one; no email ever contains one.
--   2. Round 1 is a word search: a letter grid with a visible word list, one
--      timer for the round, points per word found.
--   3. Built for bad internet: the whole battle (every question, no answer
--      keys) downloads once at start. The station stores it, plays locally, and
--      submits one round at a time. The server grades each round.
--   4. No device clock is trusted. Scores are correctness only (no speed
--      bonus). Each round must arrive within a server-side window; ties break
--      on Round 3, then on total time measured by the server.
--
-- IDEMPOTENT and safe to re-run. It keeps every table and all data; it only
-- replaces the per-question engine functions of v1 with per-round ones.
-- ============================================================================


-- ─── 1. Codes are issued, not born ─────────────────────────────────────────

alter table public.br_participants alter column game_code drop not null;
alter table public.br_participants alter column game_code drop default;
alter table public.br_participants add column if not exists code_issued_at timestamptz;
alter table public.br_participants add column if not exists code_used_at   timestamptz;

-- Codes registered under v1 were emailed; under v2 a code is handed over at
-- the desk. Clear any v1 code that was never approved or used, so an emailed
-- code can't be used to skip the desk.
update public.br_participants p
   set game_code = null
 where p.code_issued_at is null
   and p.payment_status = 'unpaid'
   and not exists (select 1 from public.br_attempts a where a.participant_id = p.id);

-- A code alone identifies a player now, so it must be unique. v1 codes were
-- random but not guaranteed unique: keep the earliest holder of any repeated
-- code and clear the rest (the desk re-issues theirs).
update public.br_participants p
   set game_code = null
  from (select id, row_number() over (partition by game_code order by created_at, id) as n
          from public.br_participants where game_code is not null) d
 where d.id = p.id and d.n > 1;

-- A code alone identifies a player now, so it must be unique.
create unique index if not exists br_participants_game_code_key
    on public.br_participants (game_code) where game_code is not null;


-- ─── 2. Settings for the new rounds ────────────────────────────────────────

alter table public.br_settings add column if not exists round1_seconds smallint not null default 120
    check (round1_seconds between 20 and 900);
alter table public.br_settings add column if not exists grid_size smallint not null default 10
    check (grid_size between 7 and 14);
-- Extra seconds each round may take to reach the server (reading the round
-- card, a slow connection). A round that arrives later than its window scores 0.
alter table public.br_settings add column if not exists sync_grace_seconds smallint not null default 180
    check (sync_grace_seconds between 30 and 1800);

-- Round 1 now draws this many words into the grid (v1's default was 5 words).
update public.br_settings set round1_count = 8 where id = 1 and round1_count = 5;
update public.br_settings set speed_bonus_enabled = false where id = 1;

-- Rules text that described v1 (Game Code emailed, speed bonus) is refreshed
-- only if it is still exactly the v1 default.
update public.br_settings set rules = jsonb_build_array(
    'Entry fee: Rs. 100 per participant, paid at the PharmaWallah desk.',
    'After your payment is approved, the desk gives you a Game Code. It works once: it starts your battle.',
    'One official attempt per participant. All three rounds must be completed in the same attempt.',
    'Round 1 has one timer for the whole grid; every Round 2 board and Round 3 question has its own timer.',
    'Answers are final once a round is submitted — there is no going back.',
    'Scores are calculated by the system and cannot be changed except by an authorised event administrator after verification.',
    'Ties are broken by the higher Round 3 score, then by the shorter total battle time.',
    'The leaderboard closes at the announced closing time. Only verified scores in the official system are eligible for prizes.',
    'Using another person''s Game Code, or any outside help, leads to disqualification.',
    'The Top 10 participants receive a PharmaWallah Goodie Hamper.'
) where id = 1 and rules ->> 1 = 'Each participant receives one Player ID and one private Game Code.';


-- ─── 3. Attempts carry the downloaded battle ───────────────────────────────

-- plan (v2): {"r1": {"grid": [...], "words": [{"id","word","points","r","c","dr","dc"}]},
--             "r2": [question ids], "r3": [question ids],
--             "limits": [r1 seconds, r2 seconds, r3 seconds]}
-- public_plan: what the station receives — the same, minus every answer.
alter table public.br_attempts add column if not exists public_plan jsonb;
-- Server time each round's submission arrived: the round-window chain.
alter table public.br_attempts add column if not exists round_submitted_at jsonb not null default '{}'::jsonb;
-- Graded results per round, returned again on a retried submit.
alter table public.br_attempts add column if not exists round_results jsonb not null default '{}'::jsonb;


-- ─── 4. Retire the v1 per-question engine ──────────────────────────────────

drop function if exists public.br_serve(text);
drop function if exists public.br_answer(text, uuid, jsonb);
drop function if exists public.br_start_attempt(text, text, text);
drop function if exists public.br_expire(uuid);
drop function if exists public.br_advance(uuid);
drop function if exists public.br_state_of(uuid);
drop function if exists public.br_public_question(public.br_questions, jsonb, timestamptz);
drop function if exists public.br_make_payload(public.br_questions);
drop function if exists public.br_scramble(text);


-- ─── 5. Word search generator ──────────────────────────────────────────────
-- Places each word in a straight line in any of 8 directions, sharing letters
-- where they agree, then fills the rest at random. A word that cannot be
-- placed after 400 tries is dropped (the caller only lists placed words).

create or replace function public.br_make_wordsearch(p_ids uuid[], p_words text[], p_points int[], p_size int)
returns jsonb
language plpgsql
volatile
as $$
declare
    g text[] := array_fill('.'::text, array[p_size * p_size]);
    dirs int[] := array[0,1, 1,0, 1,1, -1,1, 0,-1, -1,0, -1,-1, 1,-1];
    alphabet constant text := 'ABCDEFGHIJKLMNOPRSTUVWY';
    placed jsonb := '[]'::jsonb;
    out_rows jsonb := '[]'::jsonb;
    w text; len int; tries int; d int; dr int; dc int; r int; c int; ok boolean; ch text;
begin
    for k in 1..coalesce(array_length(p_words, 1), 0) loop
        w := p_words[k];
        len := char_length(w);
        continue when len > p_size or len < 3;
        tries := 0;
        loop
            tries := tries + 1;
            exit when tries > 400;
            d := floor(random() * 8)::int;
            dr := dirs[d * 2 + 1];
            dc := dirs[d * 2 + 2];
            r := floor(random() * p_size)::int;
            c := floor(random() * p_size)::int;
            continue when r + dr * (len - 1) < 0 or r + dr * (len - 1) >= p_size
                       or c + dc * (len - 1) < 0 or c + dc * (len - 1) >= p_size;
            ok := true;
            for i in 0..len - 1 loop
                ch := g[(r + dr * i) * p_size + (c + dc * i) + 1];
                if ch <> '.' and ch <> substr(w, i + 1, 1) then ok := false; exit; end if;
            end loop;
            if ok then
                for i in 0..len - 1 loop
                    g[(r + dr * i) * p_size + (c + dc * i) + 1] := substr(w, i + 1, 1);
                end loop;
                placed := placed || jsonb_build_object('id', p_ids[k], 'word', w, 'points', p_points[k],
                                                       'r', r, 'c', c, 'dr', dr, 'dc', dc);
                exit;
            end if;
        end loop;
    end loop;

    for i in 1..p_size * p_size loop
        if g[i] = '.' then g[i] := substr(alphabet, 1 + floor(random() * char_length(alphabet))::int, 1); end if;
    end loop;
    for r in 0..p_size - 1 loop
        out_rows := out_rows || to_jsonb(array_to_string(g[r * p_size + 1 : r * p_size + p_size], ''));
    end loop;
    return jsonb_build_object('grid', out_rows, 'words', placed);
end;
$$;


-- ─── 6. The v2 engine ──────────────────────────────────────────────────────

-- Totals are rebuilt from the answers ledger, as in v1.
create or replace function public.br_recount(p_attempt_id uuid)
returns void
language sql
as $$
    update public.br_attempts a set
        round1_score   = coalesce(x.r1, 0),
        round2_score   = coalesce(x.r2, 0),
        round3_score   = coalesce(x.r3, 0),
        total_score    = coalesce(x.r1, 0) + coalesce(x.r2, 0) + coalesce(x.r3, 0),
        correct_count  = coalesce(x.correct, 0),
        answered_count = coalesce(x.answered, 0),
        updated_at     = now()
    from (
        select
            sum(score) filter (where round = 1) as r1,
            sum(score) filter (where round = 2) as r2,
            sum(score) filter (where round = 3) as r3,
            sum(correct_parts)                  as correct,
            count(*)                            as answered
        from public.br_answers where attempt_id = p_attempt_id
    ) x
    where a.id = p_attempt_id;
$$;

-- The station's view of an attempt: the downloaded battle, the next round to
-- submit, and the graded results of every round already in.
create or replace function public.br_attempt_view(p_attempt_id uuid)
returns jsonb
language sql
stable
as $$
    select jsonb_build_object(
        'status', a.status,
        'round', a.round,
        'plan', a.public_plan,
        'results', a.round_results,
        'roundScores', jsonb_build_array(a.round1_score, a.round2_score, a.round3_score),
        'totalScore', a.total_score,
        'correctCount', a.correct_count,
        'totalQuestions', a.total_questions,
        'totalTimeMs', a.total_time_ms,
        'startedAt', a.started_at,
        'completedAt', a.completed_at,
        'participant', jsonb_build_object('code', p.participant_code, 'name', p.name),
        'now', now()
    )
    from public.br_attempts a
    join public.br_participants p on p.id = a.participant_id
    where a.id = p_attempt_id;
$$;

create or replace function public.br_lock_attempt(p_token_hash text)
returns public.br_attempts
language plpgsql
as $$
declare
    a public.br_attempts;
begin
    select * into a from public.br_attempts where token_hash = p_token_hash for update;
    if not found then raise exception 'BR_NO_ATTEMPT'; end if;
    if a.status = 'void' then raise exception 'BR_ATTEMPT_VOID'; end if;
    return a;
end;
$$;

-- Issue (or re-issue) a participant's Game Code. Approving payment at the desk
-- does this: it marks the fee paid and the participant checked in.
create or replace function public.br_issue_code(p_participant_id uuid, p_payment text default 'paid')
returns text
language plpgsql
as $$
declare
    p public.br_participants;
    code text;
begin
    select * into p from public.br_participants where id = p_participant_id for update;
    if not found then raise exception 'BR_NOT_FOUND'; end if;
    if p.registration_status <> 'registered' then raise exception 'BR_NOT_REGISTERED'; end if;
    if exists (select 1 from public.br_attempts where participant_id = p.id and status = 'completed') then
        raise exception 'BR_ALREADY_PLAYED';
    end if;
    loop
        code := public.br_new_game_code();
        exit when not exists (select 1 from public.br_participants where game_code = code);
    end loop;
    update public.br_participants
       set game_code = code, code_issued_at = now(), code_used_at = null,
           payment_status = case when payment_status = 'unpaid' then coalesce(p_payment, 'paid') else payment_status end,
           check_in_status = case when check_in_status = 'not_checked_in' then 'checked_in' else check_in_status end,
           checked_in_at = coalesce(checked_in_at, now()),
           updated_at = now()
     where id = p.id;
    return code;
end;
$$;

-- Enter the arena with a Game Code. The code is consumed here. A player whose
-- station failed gets a re-issued code, which resumes the same attempt.
create or replace function public.br_start_attempt(p_code text, p_token_hash text)
returns jsonb
language plpgsql
as $$
declare
    st public.br_settings;
    p public.br_participants;
    a public.br_attempts;
    sess_status text;
    words record;
    ws jsonb;
    r2 jsonb; r3 jsonb;
    boards jsonb; mcqs jsonb;
    lim2 int; lim3 int; pairs int;
begin
    select * into st from public.br_settings where id = 1;

    select * into p from public.br_participants where game_code = upper(trim(p_code)) for update;
    if not found then raise exception 'BR_INVALID_CODE'; end if;
    if p.code_used_at is not null then raise exception 'BR_CODE_USED'; end if;
    if p.registration_status = 'disqualified' then raise exception 'BR_DISQUALIFIED'; end if;
    if p.registration_status = 'cancelled'    then raise exception 'BR_CANCELLED'; end if;

    select * into a from public.br_attempts where participant_id = p.id and status <> 'void' for update;
    if found then
        if a.status = 'completed' then raise exception 'BR_ALREADY_PLAYED'; end if;
        update public.br_attempts set token_hash = p_token_hash, updated_at = now() where id = a.id;
        update public.br_participants set code_used_at = now() where id = p.id;
        return public.br_attempt_view(a.id) || jsonb_build_object('resumed', true);
    end if;

    if not st.competition_open then raise exception 'BR_CLOSED'; end if;
    if p.payment_status not in ('paid', 'waived') then raise exception 'BR_NOT_PAID'; end if;
    if p.slot_id is not null then
        select status into sess_status from public.br_sessions where id = p.slot_id;
        if sess_status in ('completed', 'cancelled') then raise exception 'BR_SESSION_ENDED'; end if;
    end if;

    -- Round 1: words that fit the grid, drawn at random.
    select array_agg(id) as ids, array_agg(correct_answer) as ws, array_agg(points) as pts into words
      from (select id, correct_answer, points from public.br_questions
             where active and round = 1 and char_length(correct_answer) <= st.grid_size
             order by random() limit st.round1_count) x;
    if words.ids is null then raise exception 'BR_NO_QUESTIONS'; end if;
    ws := public.br_make_wordsearch(words.ids, words.ws, words.pts, st.grid_size);
    if jsonb_array_length(ws -> 'words') = 0 then raise exception 'BR_NO_QUESTIONS'; end if;

    select coalesce(jsonb_agg(id), '[]'::jsonb) into r2 from
        (select id from public.br_questions where active and round = 2 order by random() limit st.round2_count) x;
    select coalesce(jsonb_agg(id), '[]'::jsonb) into r3 from
        (select id from public.br_questions where active and round = 3 order by random() limit st.round3_count) x;
    if jsonb_array_length(r2) = 0 or jsonb_array_length(r3) = 0 then raise exception 'BR_NO_QUESTIONS'; end if;

    -- Public copies: no answer anywhere. Column B shuffled once, here.
    select jsonb_agg(jsonb_build_object(
               'id', q.id, 'prompt', q.question, 'points', q.points, 'timeLimit', q.time_limit,
               'left', (select jsonb_agg(pr -> 'left' order by o) from jsonb_array_elements(q.options -> 'pairs') with ordinality t(pr, o)),
               'right', (select jsonb_agg(pr -> 'right' order by random()) from jsonb_array_elements(q.options -> 'pairs') pr)
           ) order by x.ord),
           sum(q.time_limit), sum(jsonb_array_length(q.options -> 'pairs'))
      into boards, lim2, pairs
      from jsonb_array_elements_text(r2) with ordinality x(qid, ord)
      join public.br_questions q on q.id = x.qid::uuid;

    select jsonb_agg(jsonb_build_object(
               'id', q.id, 'prompt', q.question, 'points', q.points, 'timeLimit', q.time_limit,
               'options', jsonb_build_array(
                   jsonb_build_object('key', 'A', 'text', q.options ->> 'A'),
                   jsonb_build_object('key', 'B', 'text', q.options ->> 'B'),
                   jsonb_build_object('key', 'C', 'text', q.options ->> 'C'),
                   jsonb_build_object('key', 'D', 'text', q.options ->> 'D'))
           ) order by x.ord),
           sum(q.time_limit)
      into mcqs, lim3
      from jsonb_array_elements_text(r3) with ordinality x(qid, ord)
      join public.br_questions q on q.id = x.qid::uuid;

    insert into public.br_attempts (participant_id, session_id, token_hash, plan, public_plan, total_questions)
    values (
        p.id, p.slot_id, p_token_hash,
        jsonb_build_object('r1', ws, 'r2', r2, 'r3', r3, 'limits', jsonb_build_array(st.round1_seconds, lim2, lim3)),
        jsonb_build_object(
            'r1', jsonb_build_object(
                'grid', ws -> 'grid',
                'words', (select jsonb_agg(w ->> 'word') from jsonb_array_elements(ws -> 'words') w),
                'points', (select jsonb_agg((w ->> 'points')::int) from jsonb_array_elements(ws -> 'words') w),
                'seconds', st.round1_seconds),
            'r2', boards,
            'r3', mcqs,
            'graceSeconds', st.sync_grace_seconds),
        jsonb_array_length(ws -> 'words') + pairs + jsonb_array_length(r3)
    )
    returning * into a;

    update public.br_participants set code_used_at = now() where id = p.id;
    return public.br_attempt_view(a.id) || jsonb_build_object('resumed', false);
end;
$$;

create or replace function public.br_state(p_token_hash text)
returns jsonb
language plpgsql
as $$
declare
    a public.br_attempts;
begin
    a := public.br_lock_attempt(p_token_hash);
    return public.br_attempt_view(a.id);
end;
$$;

-- Does the straight line (r1,c1)→(r2,c2) in the grid spell the word, either way?
create or replace function public.br_ws_path_spells(p_grid jsonb, r1 int, c1 int, r2 int, c2 int, p_word text)
returns boolean
language plpgsql
immutable
as $$
declare
    dr int := sign(r2 - r1);
    dc int := sign(c2 - c1);
    n int := greatest(abs(r2 - r1), abs(c2 - c1)) + 1;
    size int := jsonb_array_length(p_grid);
    s text := '';
begin
    if not (r1 = r2 or c1 = c2 or abs(r2 - r1) = abs(c2 - c1)) then return false; end if;
    if n <> char_length(p_word) then return false; end if;
    if least(r1, r2, c1, c2) < 0 or greatest(r1, r2, c1, c2) >= size then return false; end if;
    for i in 0..n - 1 loop
        s := s || substr(p_grid ->> (r1 + dr * i), c1 + dc * i + 1, 1);
    end loop;
    return s = p_word or reverse(s) = p_word;
end;
$$;

-- Submit one whole round. Shapes of p_answers:
--   round 1  {"found": [{"word":"ASPIRIN","r1":0,"c1":0,"r2":0,"c2":6}, …]}
--   round 2  {"boards": [{"questionId":…, "matches":["…","…"]}, …]}
--   round 3  {"choices": [{"questionId":…, "choice":"B" | null}, …]}
-- Idempotent: a retried submit of a round already graded returns the stored
-- result, which is what makes a flaky connection safe to retry blindly.
create or replace function public.br_submit_round(p_token_hash text, p_round int, p_answers jsonb)
returns jsonb
language plpgsql
as $$
declare
    a public.br_attempts;
    q public.br_questions;
    item jsonb;
    w jsonb;
    window_start timestamptz;
    deadline timestamptz;
    late boolean;
    grace int := coalesce((select sync_grace_seconds from public.br_settings where id = 1), 180);
    found_words text[] := '{}';
    right_parts int; parts int; score int; given text;
    results jsonb := '[]'::jsonb;
    round_score int := 0;
begin
    a := public.br_lock_attempt(p_token_hash);

    if a.round_results ? p_round::text then
        return jsonb_build_object('round', p_round, 'result', a.round_results -> p_round::text,
                                  'state', public.br_attempt_view(a.id), 'repeat', true);
    end if;
    if a.status = 'completed' then raise exception 'BR_COMPLETED'; end if;
    if p_round <> a.round then raise exception 'BR_ROUND_ORDER'; end if;

    -- The round's window opens when the previous round reached the server
    -- (or at start), and lasts the round's time plus the sync grace. Nothing
    -- here reads a device clock.
    window_start := case when p_round = 1 then a.started_at
                         else (a.round_submitted_at ->> (p_round - 1)::text)::timestamptz end;
    deadline := window_start + make_interval(secs => (a.plan -> 'limits' ->> (p_round - 1))::int + grace);
    late := now() > deadline;

    if p_round = 1 then
        if not late and jsonb_typeof(p_answers -> 'found') = 'array' then
            for item in select * from jsonb_array_elements(p_answers -> 'found') loop
                for w in select * from jsonb_array_elements(a.plan -> 'r1' -> 'words') loop
                    if w ->> 'word' = upper(coalesce(item ->> 'word', ''))
                       and not (w ->> 'word' = any(found_words))
                       and public.br_ws_path_spells(a.plan -> 'r1' -> 'grid',
                             (item ->> 'r1')::int, (item ->> 'c1')::int, (item ->> 'r2')::int, (item ->> 'c2')::int,
                             w ->> 'word') then
                        found_words := found_words || (w ->> 'word');
                    end if;
                end loop;
            end loop;
        end if;
        for w in select * from jsonb_array_elements(a.plan -> 'r1' -> 'words') loop
            score := case when w ->> 'word' = any(found_words) then (w ->> 'points')::int else 0 end;
            insert into public.br_answers (attempt_id, question_id, participant_id, round, answer, is_correct,
                                           correct_parts, total_parts, timed_out, base_points, score)
            values (a.id, (w ->> 'id')::uuid, a.participant_id, 1, to_jsonb(w ->> 'word'), score > 0,
                    case when score > 0 then 1 else 0 end, 1, late, score, score)
            on conflict (attempt_id, question_id) do nothing;
            round_score := round_score + score;
        end loop;
        results := jsonb_build_object('found', to_jsonb(found_words),
            'missed', (select coalesce(jsonb_agg(x ->> 'word'), '[]'::jsonb) from jsonb_array_elements(a.plan -> 'r1' -> 'words') x
                        where not (x ->> 'word' = any(found_words))));
    else
        for q in select qq.* from jsonb_array_elements_text(a.plan -> ('r' || p_round)) with ordinality x(qid, ord)
                   join public.br_questions qq on qq.id = x.qid::uuid order by x.ord loop
            -- this question's answer in the submission, if any
            select e into item from jsonb_array_elements(coalesce(p_answers -> (case when p_round = 2 then 'boards' else 'choices' end), '[]'::jsonb)) e
             where e ->> 'questionId' = q.id::text limit 1;
            right_parts := 0;
            if p_round = 2 then
                parts := jsonb_array_length(q.options -> 'pairs');
                if not late and item is not null and jsonb_typeof(item -> 'matches') = 'array' then
                    select count(*) into right_parts
                      from jsonb_array_elements(q.options -> 'pairs') with ordinality t(pair, ord)
                     where (item -> 'matches' ->> (ord - 1)::int) = (pair ->> 'right');
                end if;
                score := right_parts * q.points;
                results := results || jsonb_build_object('questionId', q.id, 'correctParts', right_parts, 'totalParts', parts,
                    'score', score, 'correct', right_parts = parts,
                    'correctAnswer', (select jsonb_agg(pr -> 'right' order by o) from jsonb_array_elements(q.options -> 'pairs') with ordinality t(pr, o)),
                    'given', coalesce(item -> 'matches', '[]'::jsonb), 'explanation', q.explanation);
            else
                parts := 1;
                given := upper(coalesce(item ->> 'choice', ''));
                right_parts := case when not late and given = q.correct_answer then 1 else 0 end;
                score := right_parts * q.points;
                results := results || jsonb_build_object('questionId', q.id, 'correctParts', right_parts, 'totalParts', 1,
                    'score', score, 'correct', right_parts = 1, 'correctAnswer', q.correct_answer,
                    'given', nullif(given, ''), 'explanation', q.explanation);
            end if;
            insert into public.br_answers (attempt_id, question_id, participant_id, round, answer, is_correct,
                                           correct_parts, total_parts, timed_out, base_points, score)
            values (a.id, q.id, a.participant_id, p_round, item, right_parts = parts, right_parts, parts, late, score, score)
            on conflict (attempt_id, question_id) do nothing;
            round_score := round_score + score;
            item := null;
        end loop;
        results := jsonb_build_object('items', results);
    end if;

    results := results || jsonb_build_object('score', round_score, 'late', late);
    update public.br_attempts
       set round_results = round_results || jsonb_build_object(p_round::text, results),
           round_submitted_at = round_submitted_at || jsonb_build_object(p_round::text, now()),
           round = least(p_round + 1, 3)
     where id = a.id;
    perform public.br_recount(a.id);

    if p_round = 3 then
        update public.br_attempts
           set status = 'completed', completed_at = now(),
               -- Tie-break time: server clock, start to final submission.
               total_time_ms = floor(extract(epoch from (now() - started_at)) * 1000)::int
         where id = a.id
        returning * into a;
        insert into public.br_scores as s (participant_id, attempt_id, round1_score, round2_score, round3_score,
                                           total_score, correct_count, total_questions, total_time_ms, completed_at)
        values (a.participant_id, a.id, a.round1_score, a.round2_score, a.round3_score,
                a.total_score, a.correct_count, a.total_questions, a.total_time_ms, a.completed_at)
        on conflict (participant_id) do update set
            attempt_id = excluded.attempt_id, round1_score = excluded.round1_score,
            round2_score = excluded.round2_score, round3_score = excluded.round3_score,
            total_score = excluded.total_score, correct_count = excluded.correct_count,
            total_questions = excluded.total_questions, total_time_ms = excluded.total_time_ms,
            completed_at = excluded.completed_at, final_status = 'pending', status_overridden = false,
            updated_at = now();
    end if;

    return jsonb_build_object('round', p_round, 'result', results, 'state', public.br_attempt_view(a.id), 'repeat', false);
end;
$$;

-- Registration no longer creates a code (v1's version relied on the column default).
create or replace function public.br_register(
    p_name text, p_email text, p_phone text, p_university text, p_year text, p_student_id text,
    p_slot_id uuid, p_source text, p_payment_status text
)
returns public.br_participants
language plpgsql
as $$
declare
    st public.br_settings;
    sess public.br_sessions;
    taken integer;
    p public.br_participants;
begin
    select * into st from public.br_settings where id = 1;
    if p_source = 'online' and not st.registration_open then raise exception 'BR_REGISTRATION_CLOSED'; end if;
    if p_email is not null and exists (select 1 from public.br_participants where email = lower(p_email)) then
        raise exception 'BR_EMAIL_TAKEN';
    end if;
    if p_slot_id is not null then
        select * into sess from public.br_sessions where id = p_slot_id for update;
        if not found or sess.status in ('completed', 'cancelled') then raise exception 'BR_SLOT_UNAVAILABLE'; end if;
        select count(*) into taken from public.br_participants where slot_id = p_slot_id and registration_status <> 'cancelled';
        if taken >= sess.capacity then raise exception 'BR_SLOT_FULL'; end if;
    end if;
    insert into public.br_participants (name, email, phone, university, pharm_year, student_id, slot_id, source, payment_status)
    values (p_name, lower(p_email), p_phone, p_university, p_year, p_student_id, p_slot_id, p_source, 'unpaid')
    returning * into p;
    return p;
exception
    when unique_violation then raise exception 'BR_EMAIL_TAKEN';
end;
$$;

-- Voiding also withdraws the code: continuing needs a fresh one from the desk.
create or replace function public.br_void_attempt(p_participant_id uuid, p_reason text)
returns void
language plpgsql
as $$
begin
    update public.br_attempts
       set status = 'void', void_reason = p_reason, token_hash = token_hash || ':void:' || id::text, updated_at = now()
     where participant_id = p_participant_id and status <> 'void';
    if not found then raise exception 'BR_NO_ATTEMPT'; end if;
    delete from public.br_scores where participant_id = p_participant_id;
    update public.br_participants set game_code = null, code_used_at = null, updated_at = now() where id = p_participant_id;
end;
$$;

create or replace function public.br_delete_question(p_id uuid)
returns text
language plpgsql
as $$
begin
    if exists (select 1 from public.br_answers where question_id = p_id)
       or exists (select 1 from public.br_attempts
                  where plan::text like '%' || p_id::text || '%') then
        update public.br_questions set active = false, updated_at = now() where id = p_id;
        return 'deactivated';
    end if;
    delete from public.br_questions where id = p_id;
    return 'deleted';
end;
$$;


-- ─── 7. Lock the new functions down like the old ones ─────────────────────

do $$
declare
    fn text;
begin
    for fn in
        select p.oid::regprocedure::text
          from pg_proc p join pg_namespace n on n.oid = p.pronamespace
         where n.nspname = 'public' and p.proname like 'br\_%'
    loop
        execute format('revoke all on function %s from public, anon, authenticated', fn);
        execute format('grant execute on function %s to service_role', fn);
    end loop;
end;
$$;

-- Tell PostgREST (the Supabase API) to pick up the new functions right away;
-- otherwise the API can keep answering "function not found" from its cache.
notify pgrst, 'reload schema';


-- ============================================================================
-- Battle Royale — starter question bank
-- ============================================================================
-- Run AFTER supabase/migrations/20260927_battle_royale.sql. Safe to re-run:
-- every row carries a `seed_key`, and existing keys are left alone — so an
-- admin's edits in the dashboard are never overwritten by a re-run.
--
-- 22 words (round 1), 8 matching boards of 5 pairs (round 2) and 31 MCQs
-- (round 3). Written for teaching; have a pharmacist read them before the
-- event, and edit or retire any of them from /battle-royale/admin/questions.
-- ============================================================================

-- ─── Round 1 — Word blocks ──────────────────────────────────────────────────
-- Time limit grows with length: the player has to find more letters.
insert into public.br_questions (seed_key, round, type, question, correct_answer, explanation, points, time_limit, difficulty)
values
  ('w-aspirin',     1, 'WORD', 'Irreversible COX inhibitor, used at low dose as an antiplatelet', 'ASPIRIN', 'Aspirin acetylates cyclo-oxygenase irreversibly, so its antiplatelet effect lasts the life of the platelet.', 10, 30, 'easy'),
  ('w-capsule',     1, 'WORD', 'Solid dosage form with a hard or soft gelatin shell', 'CAPSULE', null, 10, 30, 'easy'),
  ('w-tablet',      1, 'WORD', 'Solid dosage form made by compressing powder or granules', 'TABLET', null, 10, 30, 'easy'),
  ('w-dosage',      1, 'WORD', 'The amount, frequency and number of doses of a medicine', 'DOSAGE', null, 10, 30, 'easy'),
  ('w-syrup',       1, 'WORD', 'Concentrated aqueous sugar solution used as an oral vehicle', 'SYRUP', null, 10, 25, 'easy'),
  ('w-insulin',     1, 'WORD', 'Peptide hormone from pancreatic beta cells that lowers blood glucose', 'INSULIN', null, 10, 30, 'easy'),
  ('w-placebo',     1, 'WORD', 'Inert preparation given as the control in a clinical trial', 'PLACEBO', null, 10, 30, 'easy'),
  ('w-pharmacy',    1, 'WORD', 'The science and practice of preparing and dispensing medicines', 'PHARMACY', null, 10, 35, 'medium'),
  ('w-morphine',    1, 'WORD', 'The principal alkaloid of opium, a strong opioid analgesic', 'MORPHINE', null, 10, 35, 'medium'),
  ('w-heparin',     1, 'WORD', 'Parenteral anticoagulant that works by potentiating antithrombin', 'HEPARIN', 'Its antidote is protamine sulfate.', 10, 35, 'medium'),
  ('w-warfarin',    1, 'WORD', 'Oral anticoagulant that antagonises vitamin K', 'WARFARIN', 'Monitored by the INR.', 10, 35, 'medium'),
  ('w-atropine',    1, 'WORD', 'Muscarinic antagonist used for bradycardia and organophosphate poisoning', 'ATROPINE', null, 10, 35, 'medium'),
  ('w-emulsion',    1, 'WORD', 'Dispersion of one immiscible liquid in another, stabilised by an emulsifier', 'EMULSION', null, 10, 35, 'medium'),
  ('w-ointment',    1, 'WORD', 'Greasy semisolid preparation applied to the skin', 'OINTMENT', null, 10, 35, 'medium'),
  ('w-adherence',   1, 'WORD', 'How closely a patient follows the treatment plan agreed with the prescriber', 'ADHERENCE', null, 10, 40, 'medium'),
  ('w-metformin',   1, 'WORD', 'First-line biguanide for type 2 diabetes', 'METFORMIN', null, 10, 40, 'medium'),
  ('w-excipient',   1, 'WORD', 'An inactive ingredient in a formulation', 'EXCIPIENT', null, 10, 40, 'medium'),
  ('w-antibiotic',  1, 'WORD', 'A drug that kills bacteria or stops them multiplying', 'ANTIBIOTIC', null, 10, 45, 'hard'),
  ('w-amoxicillin', 1, 'WORD', 'An aminopenicillin, often combined with clavulanic acid', 'AMOXICILLIN', null, 10, 45, 'hard'),
  ('w-paracetamol', 1, 'WORD', 'Analgesic and antipyretic whose overdose damages the liver', 'PARACETAMOL', 'The antidote is N-acetylcysteine.', 10, 45, 'hard'),
  ('w-suppository', 1, 'WORD', 'Solid dosage form for rectal insertion that melts at body temperature', 'SUPPOSITORY', null, 10, 45, 'hard'),
  ('w-bioavail',    1, 'WORD', 'Fraction of a dose that reaches the systemic circulation unchanged', 'BIOAVAILABILITY', null, 10, 50, 'hard')
on conflict (seed_key) do nothing;

-- ─── Round 2 — Column matching ──────────────────────────────────────────────
-- `points` is per correct pair: a perfect board of five pairs scores 25.
insert into public.br_questions (seed_key, round, type, question, options, points, time_limit, difficulty)
values
  ('m-drug-class', 2, 'MATCHING', 'Match each drug to its class', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Metformin',    'right', 'Biguanide'),
      jsonb_build_object('left', 'Atenolol',     'right', 'Beta-blocker'),
      jsonb_build_object('left', 'Omeprazole',   'right', 'Proton pump inhibitor'),
      jsonb_build_object('left', 'Amlodipine',   'right', 'Calcium channel blocker'),
      jsonb_build_object('left', 'Atorvastatin', 'right', 'HMG-CoA reductase inhibitor'))), 5, 75, 'easy'),
  ('m-drug-indication', 2, 'MATCHING', 'Match each drug to its main use', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Salbutamol',    'right', 'Acute bronchospasm'),
      jsonb_build_object('left', 'Levothyroxine', 'right', 'Hypothyroidism'),
      jsonb_build_object('left', 'Allopurinol',   'right', 'Prevention of gout attacks'),
      jsonb_build_object('left', 'Ondansetron',   'right', 'Nausea and vomiting'),
      jsonb_build_object('left', 'Sumatriptan',   'right', 'Acute migraine'))), 5, 75, 'easy'),
  ('m-drug-mechanism', 2, 'MATCHING', 'Match each drug to its mechanism of action', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Omeprazole',    'right', 'Blocks the gastric H+/K+ ATPase'),
      jsonb_build_object('left', 'Penicillin',    'right', 'Inhibits bacterial cell-wall synthesis'),
      jsonb_build_object('left', 'Ciprofloxacin', 'right', 'Inhibits DNA gyrase'),
      jsonb_build_object('left', 'Captopril',     'right', 'Inhibits angiotensin-converting enzyme'),
      jsonb_build_object('left', 'Furosemide',    'right', 'Blocks the Na+/K+/2Cl- cotransporter'))), 5, 90, 'medium'),
  ('m-apparatus', 2, 'MATCHING', 'Match each piece of apparatus to its function', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Burette',          'right', 'Delivers measured volumes in a titration'),
      jsonb_build_object('left', 'Volumetric pipette','right', 'Transfers one fixed volume accurately'),
      jsonb_build_object('left', 'Desiccator',       'right', 'Keeps samples dry'),
      jsonb_build_object('left', 'Pycnometer',       'right', 'Measures density'),
      jsonb_build_object('left', 'Mortar and pestle','right', 'Triturates solids'))), 5, 75, 'easy'),
  ('m-dosage-route', 2, 'MATCHING', 'Match each dosage form to its route', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Suppository',          'right', 'Rectal'),
      jsonb_build_object('left', 'Pessary',              'right', 'Vaginal'),
      jsonb_build_object('left', 'Metered-dose inhaler', 'right', 'Pulmonary'),
      jsonb_build_object('left', 'Glyceryl trinitrate spray', 'right', 'Sublingual'),
      jsonb_build_object('left', 'Eye drops',            'right', 'Ophthalmic'))), 5, 75, 'easy'),
  ('m-lab-test', 2, 'MATCHING', 'Match each laboratory test to what it measures', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'HbA1c',            'right', 'Long-term glycaemic control'),
      jsonb_build_object('left', 'INR',              'right', 'Warfarin therapy'),
      jsonb_build_object('left', 'Serum creatinine', 'right', 'Kidney function'),
      jsonb_build_object('left', 'ALT',              'right', 'Liver cell injury'),
      jsonb_build_object('left', 'TSH',              'right', 'Thyroid function'))), 5, 75, 'medium'),
  ('m-vitamin', 2, 'MATCHING', 'Match each vitamin to its deficiency disease', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Vitamin C',         'right', 'Scurvy'),
      jsonb_build_object('left', 'Vitamin D',         'right', 'Rickets'),
      jsonb_build_object('left', 'Thiamine (B1)',     'right', 'Beriberi'),
      jsonb_build_object('left', 'Niacin (B3)',       'right', 'Pellagra'),
      jsonb_build_object('left', 'Cyanocobalamin (B12)', 'right', 'Megaloblastic anaemia'))), 5, 75, 'easy'),
  ('m-antidote', 2, 'MATCHING', 'Match each poisoning to its antidote', jsonb_build_object('pairs', jsonb_build_array(
      jsonb_build_object('left', 'Opioids',         'right', 'Naloxone'),
      jsonb_build_object('left', 'Paracetamol',     'right', 'N-acetylcysteine'),
      jsonb_build_object('left', 'Benzodiazepines', 'right', 'Flumazenil'),
      jsonb_build_object('left', 'Warfarin',        'right', 'Vitamin K'),
      jsonb_build_object('left', 'Heparin',         'right', 'Protamine sulfate'))), 5, 75, 'medium')
on conflict (seed_key) do nothing;

-- ─── Round 3 — Final quiz ───────────────────────────────────────────────────
insert into public.br_questions (seed_key, round, type, question, options, correct_answer, explanation, points, time_limit, difficulty)
select key, 3, 'MCQ', q, jsonb_build_object('A', a, 'B', b, 'C', c, 'D', d), ans, expl, 10, secs, diff
from (values
  ('q-loop-diuretic', 'Which of these is a loop diuretic?', 'Hydrochlorothiazide', 'Furosemide', 'Spironolactone', 'Acetazolamide', 'B', 'Furosemide blocks the Na+/K+/2Cl- cotransporter in the thick ascending limb.', 20, 'easy'),
  ('q-pcm-antidote', 'The antidote for paracetamol overdose is:', 'Naloxone', 'Flumazenil', 'N-acetylcysteine', 'Atropine', 'C', 'N-acetylcysteine replenishes glutathione.', 20, 'easy'),
  ('q-half-life', 'A drug has a half-life of 4 hours. What fraction of a dose remains after 12 hours?', '1/2', '1/4', '1/8', '1/16', 'C', '12 h is three half-lives: 1/2 × 1/2 × 1/2 = 1/8.', 30, 'medium'),
  ('q-percent-wv', 'How much drug is in 100 mL of a 2% w/v solution?', '20 mg', '200 mg', '2000 mg', '20000 mg', 'C', '2% w/v means 2 g per 100 mL, which is 2000 mg.', 30, 'medium'),
  ('q-prodrug', 'Which ACE inhibitor is a prodrug activated in the liver?', 'Enalapril', 'Captopril', 'Lisinopril', 'None of them', 'A', 'Enalapril is hydrolysed to enalaprilat.', 25, 'medium'),
  ('q-30s', 'Aminoglycosides inhibit protein synthesis by binding to:', 'The 50S subunit', 'The 30S subunit', 'DNA gyrase', 'The cell wall', 'B', null, 20, 'medium'),
  ('q-gram', 'Gram-positive bacteria appear which colour after Gram staining?', 'Pink', 'Purple', 'Green', 'Colourless', 'B', 'Their thick peptidoglycan wall retains crystal violet.', 20, 'easy'),
  ('q-autoclave', 'The standard autoclave cycle is:', '100 °C for 10 minutes', '121 °C for 15 minutes', '160 °C for 2 hours', '70 °C for 30 minutes', 'B', '160 °C for 2 hours is dry-heat sterilisation.', 20, 'easy'),
  ('q-nti', 'Which drug has a narrow therapeutic index and needs level monitoring?', 'Digoxin', 'Paracetamol', 'Amoxicillin', 'Loratadine', 'A', null, 20, 'easy'),
  ('q-first-pass', 'Which route avoids hepatic first-pass metabolism?', 'Oral tablet', 'Sublingual', 'Oral suspension', 'Enteric-coated tablet', 'B', 'Sublingual absorption drains into the systemic veins, not the portal vein.', 20, 'easy'),
  ('q-pka', 'A weak acid is exactly 50% ionised when:', 'pH = pKa', 'pH = pKa + 1', 'pH = pKa − 1', 'pH = 7', 'A', 'From Henderson–Hasselbalch, log(ionised/unionised) = 0 when pH = pKa.', 25, 'medium'),
  ('q-ace-cough', 'The dry cough caused by ACE inhibitors is due to accumulation of:', 'Histamine', 'Bradykinin', 'Angiotensin II', 'Aldosterone', 'B', null, 20, 'medium'),
  ('q-beta2', 'Which is a selective β2 agonist?', 'Propranolol', 'Salbutamol', 'Atenolol', 'Phenylephrine', 'B', null, 20, 'easy'),
  ('q-grapefruit', 'Grapefruit juice raises levels of drugs metabolised mainly by:', 'CYP2D6', 'CYP3A4', 'CYP2C9', 'CYP1A2', 'B', null, 20, 'medium'),
  ('q-wernicke', 'Wernicke''s encephalopathy is caused by deficiency of:', 'Thiamine (B1)', 'Pyridoxine (B6)', 'Cyanocobalamin (B12)', 'Ascorbic acid (C)', 'A', null, 20, 'medium'),
  ('q-disintegrant', 'Which excipient acts as a tablet disintegrant?', 'Magnesium stearate', 'Croscarmellose sodium', 'Lactose', 'Talc', 'B', 'Magnesium stearate is a lubricant, lactose a diluent and talc a glidant.', 20, 'medium'),
  ('q-hlb', 'Emulsifiers for oil-in-water emulsions typically have an HLB of:', '1–3', '3–6', '8–18', '20–25', 'C', 'Low-HLB (3–6) emulsifiers favour water-in-oil.', 25, 'hard'),
  ('q-k', 'Clearance is 5 L/h and volume of distribution is 50 L. The elimination rate constant is:', '0.1 h⁻¹', '10 h⁻¹', '0.25 h⁻¹', '250 h⁻¹', 'A', 'k = CL / Vd = 5 / 50 = 0.1 h⁻¹.', 30, 'hard'),
  ('q-h2', 'Which drug is an H2-receptor antagonist?', 'Omeprazole', 'Famotidine', 'Loratadine', 'Sucralfate', 'B', null, 20, 'easy'),
  ('q-anaphylaxis', 'The first-line drug for anaphylaxis is:', 'Intramuscular adrenaline', 'Intravenous hydrocortisone', 'Oral cetirizine', 'Inhaled salbutamol', 'A', null, 20, 'easy'),
  ('q-teratogen', 'Which drug is a potent teratogen, contraindicated in pregnancy?', 'Isotretinoin', 'Paracetamol', 'Folic acid', 'Methyldopa', 'A', null, 20, 'easy'),
  ('q-penicillin-ring', 'The ring essential to the activity of penicillins is the:', 'β-lactam ring', 'Steroid nucleus', 'Quinoline ring', 'Imidazole ring', 'A', null, 20, 'easy'),
  ('q-aspirin-chem', 'Aspirin is chemically:', 'Acetylsalicylic acid', 'Methyl salicylate', 'Salicylamide', 'Acetaminophen', 'A', null, 20, 'easy'),
  ('q-serotonin', 'Combined with an SSRI, which drug carries a risk of serotonin syndrome?', 'Tramadol', 'Paracetamol', 'Amoxicillin', 'Omeprazole', 'A', null, 20, 'medium'),
  ('q-organophosphate', 'Which drug is given with atropine in organophosphate poisoning?', 'Pralidoxime', 'Naloxone', 'Physostigmine', 'Dimercaprol', 'A', 'Pralidoxime reactivates acetylcholinesterase if given early.', 20, 'medium'),
  ('q-youngs', 'By Young''s rule, the dose for a 6-year-old when the adult dose is 300 mg is:', '50 mg', '100 mg', '150 mg', '200 mg', 'B', 'Age ÷ (age + 12) × adult dose = 6 ÷ 18 × 300 = 100 mg.', 30, 'medium'),
  ('q-ziehl', 'Which stain identifies Mycobacterium tuberculosis?', 'Gram stain', 'Ziehl–Neelsen stain', 'Giemsa stain', 'India ink', 'B', 'Mycobacteria are acid-fast.', 20, 'easy'),
  ('q-carbidopa', 'Carbidopa is given with levodopa to:', 'Inhibit peripheral dopa decarboxylase', 'Block dopamine receptors', 'Inhibit MAO-B in the brain', 'Increase renal excretion', 'A', 'More levodopa reaches the brain and peripheral side effects fall.', 25, 'medium'),
  ('q-metformin-ae', 'The rare but most serious adverse effect of metformin is:', 'Severe hypoglycaemia on its own', 'Lactic acidosis', 'Marked weight gain', 'Hyperkalaemia', 'B', null, 20, 'medium'),
  ('q-k-sparing', 'Which diuretic is potassium-sparing?', 'Furosemide', 'Hydrochlorothiazide', 'Spironolactone', 'Mannitol', 'C', null, 20, 'easy'),
  ('q-isotonic', 'Isotonic sodium chloride solution is:', '0.45% w/v', '0.9% w/v', '5% w/v', '9% w/v', 'B', null, 20, 'easy')
) as v(key, q, a, b, c, d, ans, expl, secs, diff)
on conflict (seed_key) do nothing;


-- ─── 2026-09-29: "Close tournament" flag (supabase/migrations/20260929_battle_royale_closed.sql) ───
alter table public.br_settings
    add column if not exists event_closed boolean not null default false;
notify pgrst, 'reload schema';


-- ============================================================================
-- Admins. Create each account first (Authentication → Users → Add user, or
-- sign in to pharmawallah.com once), then this grants the admin role.
-- ============================================================================
insert into public.br_admins (user_id, email, role)
select id, email, 'admin' from auth.users
where lower(email) in ('umer@mbxpro.com', 'shayanhusein@gmail.com')
on conflict (user_id) do update set role = 'admin';

select email, role from public.br_admins;
