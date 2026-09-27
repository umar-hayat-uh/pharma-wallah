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
