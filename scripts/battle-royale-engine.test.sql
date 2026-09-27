-- ============================================================================
-- Battle Royale engine (v2) — assertion suite for a THROWAWAY local Postgres.
-- ============================================================================
-- Never run against Supabase: it creates and deletes participants.
-- Procedure (see .claude/skills/battle-royale/SKILL.md):
--   1. initdb a scratch cluster, create roles anon/authenticated/service_role
--      and a stub auth.users table;
--   2. apply both migrations (v1 then v2) and the question seed;
--   3. psql -v ON_ERROR_STOP=1 -f scripts/battle-royale-engine.test.sql
-- Every check raises on failure, so a clean exit means every assertion held.
-- ============================================================================

create or replace function pg_temp.err(stmt text) returns text language plpgsql as $$
begin
    execute stmt;
    return 'OK';
exception when others then
    return sqlerrm;
end;
$$;

-- The correct submission for a round, built from the private plan.
create or replace function pg_temp.perfect(p_token text, p_round int) returns jsonb language plpgsql as $$
declare
    a public.br_attempts;
begin
    select * into a from public.br_attempts where token_hash = p_token;
    if p_round = 1 then
        return jsonb_build_object('found', (select jsonb_agg(jsonb_build_object(
            'word', lower(w ->> 'word'),
            -- submitted end-to-start, to prove reversed selections count
            'r1', (w ->> 'r')::int + (w ->> 'dr')::int * (char_length(w ->> 'word') - 1),
            'c1', (w ->> 'c')::int + (w ->> 'dc')::int * (char_length(w ->> 'word') - 1),
            'r2', (w ->> 'r')::int, 'c2', (w ->> 'c')::int))
            from jsonb_array_elements(a.plan -> 'r1' -> 'words') w));
    elsif p_round = 2 then
        return jsonb_build_object('boards', (select jsonb_agg(jsonb_build_object('questionId', q.id,
            'matches', (select jsonb_agg(pr -> 'right' order by o) from jsonb_array_elements(q.options -> 'pairs') with ordinality t(pr, o))))
            from jsonb_array_elements_text(a.plan -> 'r2') x join public.br_questions q on q.id = x::uuid));
    else
        return jsonb_build_object('choices', (select jsonb_agg(jsonb_build_object('questionId', q.id, 'choice', q.correct_answer))
            from jsonb_array_elements_text(a.plan -> 'r3') x join public.br_questions q on q.id = x::uuid));
    end if;
end;
$$;

do $$
declare
    pa public.br_participants;
    pb public.br_participants;
    code_a text; code_b text; code_b2 text;
    s jsonb; r jsonb; sub jsonb;
    n_words int; n_pairs int;
begin
    delete from public.br_participants where email like 'test%@example.test';
    update public.br_settings set competition_open = false, round1_count = 6, round2_count = 1, round3_count = 4,
        grid_size = 10, round1_seconds = 120, sync_grace_seconds = 180,
        leaderboard_frozen_at = null, results_finalized = false, registration_open = true where id = 1;

    -- Registration creates no code
    pa := public.br_register('Test Alpha', 'TestA@Example.test', '0300', 'UoK', 'Year 3', null, null, 'online', null);
    assert pa.game_code is null, 'registration does not create a Game Code';
    assert pa.payment_status = 'unpaid', 'online registration starts unpaid';
    assert pg_temp.err($f$select public.br_register('Dup', 'TESTA@example.test', null, 'UoK', 'Year 1', null, null, 'online', null)$f$)
           = 'BR_EMAIL_TAKEN', 'duplicate email refused';
    pb := public.br_register('Test Beta', 'testb@example.test', null, 'Dow', 'Year 2', null, null, 'desk', null);

    -- Approval issues the code
    code_a := public.br_issue_code(pa.id);
    assert code_a ~ '^[A-HJ-NP-Z2-9]{6}$', 'issued code format: ' || code_a;
    select * into pa from public.br_participants where id = pa.id;
    assert pa.payment_status = 'paid' and pa.check_in_status = 'checked_in' and pa.code_issued_at is not null,
           'approval marks paid + checked in';

    -- Start gates
    assert pg_temp.err($f$select public.br_start_attempt('NOPE99', 'tokA')$f$) = 'BR_INVALID_CODE', 'unknown code';
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, 'tokA')$f$, code_a)) = 'BR_CLOSED', 'arena closed';
    update public.br_settings set competition_open = true where id = 1;
    update public.br_participants set registration_status = 'disqualified' where id = pa.id;
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, 'tokA')$f$, code_a)) = 'BR_DISQUALIFIED', 'disqualified';
    update public.br_participants set registration_status = 'registered' where id = pa.id;

    -- Start downloads the whole battle, without answers
    s := public.br_start_attempt(lower(code_a), 'tokA');
    assert s ->> 'status' = 'active' and (s ->> 'round')::int = 1, 'attempt started at round 1';
    n_words := jsonb_array_length(s -> 'plan' -> 'r1' -> 'words');
    assert n_words between 4 and 6, 'word list drawn: ' || n_words;
    assert jsonb_array_length(s -> 'plan' -> 'r1' -> 'grid') = 10
       and (select bool_and(char_length(x) = 10) from jsonb_array_elements_text(s -> 'plan' -> 'r1' -> 'grid') x), '10x10 grid';
    assert jsonb_array_length(s -> 'plan' -> 'r2') = 1 and jsonb_array_length(s -> 'plan' -> 'r3') = 4, 'boards and MCQs downloaded';
    assert not (s::text ~* 'correct_answer|correctAnswer|"pairs"|"dr"|"dc"'), 'no key, pair list or word position in the download';
    select jsonb_array_length(q.options -> 'pairs') into n_pairs from public.br_questions q where q.id = (s -> 'plan' -> 'r2' -> 0 ->> 'id')::uuid;
    assert (s ->> 'totalQuestions')::int = n_words + n_pairs + 4, 'total counts words + pairs + MCQs';
    select * into pa from public.br_participants where id = pa.id;
    assert pa.code_used_at is not null, 'code consumed at start';
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, 'tokA-again')$f$, code_a)) = 'BR_CODE_USED', 'code works once';

    -- Every word in the private plan really is in the grid
    assert (select bool_and(public.br_ws_path_spells(a.plan -> 'r1' -> 'grid', (w ->> 'r')::int, (w ->> 'c')::int,
                (w ->> 'r')::int + (w ->> 'dr')::int * (char_length(w ->> 'word') - 1),
                (w ->> 'c')::int + (w ->> 'dc')::int * (char_length(w ->> 'word') - 1), w ->> 'word'))
            from public.br_attempts a, jsonb_array_elements(a.plan -> 'r1' -> 'words') w where a.token_hash = 'tokA'),
           'every placed word spells out on its path';

    assert pg_temp.err($f$select public.br_submit_round('tokA', 2, '{}')$f$) = 'BR_ROUND_ORDER', 'rounds in order';

    -- Round 1: every word but one found, plus a forged claim for a real word
    sub := pg_temp.perfect('tokA', 1);
    sub := jsonb_build_object('found', (sub -> 'found') - 0
        || jsonb_build_array(jsonb_build_object('word', (sub -> 'found' -> 0 ->> 'word'), 'r1', 0, 'c1', 0, 'r2', 0, 'c2', 1)));
    r := public.br_submit_round('tokA', 1, sub);
    assert jsonb_array_length(r -> 'result' -> 'found') = n_words - 1, 'wrong path for a real word is not credited';
    assert jsonb_array_length(r -> 'result' -> 'missed') = 1, 'the missed word is reported';
    assert (r -> 'result' ->> 'score')::int = (n_words - 1) * 10, 'round 1 = 10 per word found';
    assert (r -> 'state' ->> 'round')::int = 2, 'moved to round 2';
    s := public.br_submit_round('tokA', 1, pg_temp.perfect('tokA', 1));
    assert (s ->> 'repeat')::boolean and s -> 'result' = r -> 'result', 'retry is idempotent';

    -- Round 2 arrives past its window: scores 0
    update public.br_attempts set round_submitted_at = jsonb_set(round_submitted_at, '{1}', to_jsonb(now() - interval '1 hour'))
     where token_hash = 'tokA';
    r := public.br_submit_round('tokA', 2, pg_temp.perfect('tokA', 2));
    assert (r -> 'result' ->> 'late')::boolean and (r -> 'result' ->> 'score')::int = 0, 'a round past its server window scores 0';
    assert r -> 'result' -> 'items' -> 0 -> 'correctAnswer' is not null, 'answers revealed after grading';

    -- Round 3: perfect
    r := public.br_submit_round('tokA', 3, pg_temp.perfect('tokA', 3));
    assert (r -> 'result' ->> 'score')::int = 40, 'round 3 = 4 x 10';
    assert r -> 'state' ->> 'status' = 'completed', 'attempt complete after round 3';
    assert (select total_score from br_scores where participant_id = pa.id) = (n_words - 1) * 10 + 40, 'score row';
    assert (select correct_count from br_scores where participant_id = pa.id) = (n_words - 1) + 0 + 4, 'correct count';
    assert (select total_time_ms from br_scores where participant_id = pa.id) >= 0, 'server-measured time';
    assert pg_temp.err($f$select public.br_submit_round('tokA', 3, '{}')$f$) = 'OK', 'retry after completion returns stored result';
    assert pg_temp.err(format($f$select public.br_issue_code(%L)$f$, pa.id)) = 'BR_ALREADY_PLAYED', 'no code after playing';

    -- Station failure: a re-issued code resumes the same attempt
    code_b := public.br_issue_code(pb.id);
    s := public.br_start_attempt(code_b, 'tokB');
    r := public.br_submit_round('tokB', 1, '{"found": []}');
    assert (r -> 'result' ->> 'score')::int = 0, 'nothing found scores 0';
    code_b2 := public.br_issue_code(pb.id);
    assert code_b2 <> code_b, 'a new code';
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, 'tokB2')$f$, code_b)) = 'BR_INVALID_CODE', 'old code dead';
    s := public.br_start_attempt(code_b2, 'tokB2');
    assert (s ->> 'resumed')::boolean and (s ->> 'round')::int = 2, 'resumed at round 2 with round 1 kept';
    assert s -> 'results' ? '1', 'round 1 results come back on resume';
    assert pg_temp.err($f$select public.br_state('tokB')$f$) = 'BR_NO_ATTEMPT', 'old station token dead';

    perform public.br_void_attempt(pb.id, 'test');
    assert (select game_code from br_participants where id = pb.id) is null, 'void clears the code';

    perform public.br_finalize_results(10);
    assert (select final_status from br_scores where participant_id = pa.id) in ('winner', 'participant'), 'finalize';
    perform public.br_unfinalize_results();

    delete from public.br_participants where email like 'test%@example.test';
    raise notice 'ENGINE v2: all assertions passed';
end;
$$;

set role anon;
do $$
begin
    begin perform 1 from public.br_participants; raise exception 'anon read participants';
    exception when insufficient_privilege then null; end;
    begin perform public.br_start_attempt('X', 'y'); raise exception 'anon executed engine';
    exception when insufficient_privilege then null; end;
    begin perform public.br_submit_round('x', 1, '{}'); raise exception 'anon executed submit';
    exception when insufficient_privilege then null; end;
    begin perform public.br_issue_code(gen_random_uuid()); raise exception 'anon issued a code';
    exception when insufficient_privilege then null; end;
    raise notice 'PRIVILEGES: anon locked out';
end;
$$;
reset role;
set role authenticated;
do $$
begin
    begin update public.br_scores set total_score = 9999; raise exception 'authenticated wrote scores';
    exception when insufficient_privilege then null; end;
    begin perform public.br_submit_round('x', 1, '{}'); raise exception 'authenticated executed engine';
    exception when insufficient_privilege then null; end;
    raise notice 'PRIVILEGES: authenticated locked out';
end;
$$;
reset role;
