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
