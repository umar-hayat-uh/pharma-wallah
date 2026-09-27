-- ============================================================================
-- Battle Royale engine — assertion suite for a THROWAWAY local Postgres.
-- ============================================================================
-- Never run against Supabase: it creates and deletes participants.
-- Procedure (see .claude/skills/battle-royale/SKILL.md):
--   1. initdb a scratch cluster, create roles anon/authenticated/service_role
--      and a stub auth.users table;
--   2. apply supabase/migrations/20260927_battle_royale.sql and the question seed;
--   3. psql -v ON_ERROR_STOP=1 -f scripts/battle-royale-engine.test.sql
-- Every check raises on failure, so a clean exit means every assertion held.
-- ============================================================================

-- Helper: run a statement and return the BR_* error it raised, or 'OK'.
create or replace function pg_temp.err(stmt text) returns text language plpgsql as $$
begin
    execute stmt;
    return 'OK';
exception when others then
    return sqlerrm;
end;
$$;

-- Helper: the correct answer payload for whatever question is currently served.
create or replace function pg_temp.right_answer(p_token text) returns jsonb language plpgsql as $$
declare
    q public.br_questions;
begin
    select qq.* into q from public.br_attempts a join public.br_questions qq on qq.id = a.served_question
     where a.token_hash = p_token;
    if q.type = 'WORD' then return jsonb_build_object('word', lower(q.correct_answer));
    elsif q.type = 'MCQ' then return jsonb_build_object('choice', q.correct_answer);
    else return jsonb_build_object('matches',
        (select jsonb_agg(p -> 'right' order by o) from jsonb_array_elements(q.options -> 'pairs') with ordinality t(p, o)));
    end if;
end;
$$;

do $$
declare
    pa public.br_participants;
    pb public.br_participants;
    s jsonb;
    r jsonb;
    qid uuid;
    n integer;
    guard integer := 0;
begin
    delete from public.br_participants where email like 'test%@example.test';
    update public.br_settings set competition_open = false, round1_count = 3, round2_count = 1, round3_count = 4,
                                  speed_bonus_enabled = true, speed_bonus_max = 5, leaderboard_frozen_at = null,
                                  results_finalized = false, registration_open = true where id = 1;

    -- Registration ------------------------------------------------------------
    pa := public.br_register('Test Alpha', 'TestA@Example.test', '0300', 'UoK', 'Year 3', null, null, 'online', null);
    assert pa.email = 'testa@example.test', 'email stored lower-case';
    assert pa.participant_code ~ '^BR-\d{4}-\d{4,}$', 'participant code format: ' || pa.participant_code;
    assert pa.game_code ~ '^[A-HJ-NP-Z2-9]{6}$', 'game code alphabet: ' || pa.game_code;
    assert pg_temp.err(format($f$select public.br_register('Dup', 'TESTA@example.test', null, 'UoK', 'Year 1', null, null, 'online', null)$f$))
           = 'BR_EMAIL_TAKEN', 'duplicate email refused, case-insensitively';
    update public.br_settings set registration_open = false where id = 1;
    assert pg_temp.err($f$select public.br_register('Closed', 'testc@example.test', null, 'UoK', 'Year 1', null, null, 'online', null)$f$)
           = 'BR_REGISTRATION_CLOSED', 'online registration closed';
    pb := public.br_register('Test Beta', 'testb@example.test', null, 'Dow', 'Year 2', null, null, 'desk', 'paid');
    assert pb.payment_status = 'paid' and pb.source = 'desk', 'desk registration bypasses the closed form';
    update public.br_settings set registration_open = true where id = 1;

    -- Start gates -------------------------------------------------------------
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, 'WRONG1', 'tokA')$f$, pa.participant_code))
           = 'BR_INVALID_CREDENTIALS', 'wrong game code';
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, %L, 'tokA')$f$, pa.participant_code, pa.game_code))
           = 'BR_CLOSED', 'competition closed';
    update public.br_settings set competition_open = true where id = 1;
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, %L, 'tokA')$f$, pa.participant_code, pa.game_code))
           = 'BR_NOT_PAID', 'unpaid cannot start';
    update public.br_participants set payment_status = 'paid' where id = pa.id;
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, %L, 'tokA')$f$, pa.participant_code, pa.game_code))
           = 'BR_NOT_CHECKED_IN', 'not checked in cannot start';
    update public.br_participants set check_in_status = 'checked_in', registration_status = 'disqualified' where id = pa.id;
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, %L, 'tokA')$f$, pa.participant_code, pa.game_code))
           = 'BR_DISQUALIFIED', 'disqualified cannot start';
    update public.br_participants set registration_status = 'registered' where id = pa.id;

    -- Start by email + lower-case code ------------------------------------------
    s := public.br_start_attempt(pa.email, lower(pa.game_code), 'tokA');
    assert s ->> 'status' = 'active' and (s ->> 'resumed')::boolean = false, 'attempt started';
    assert s -> 'roundSizes' = '[3, 1, 4]'::jsonb, 'plan sizes follow settings: ' || (s -> 'roundSizes')::text;
    assert (s ->> 'totalQuestions')::int = 3 + 5 + 4, 'matching pairs counted as questions';
    assert s -> 'question' = 'null'::jsonb, 'nothing served before the player asks';

    -- Serve is idempotent and never leaks the key --------------------------------
    s := public.br_serve('tokA');
    qid := (s -> 'question' ->> 'id')::uuid;
    assert s -> 'question' ->> 'type' = 'WORD', 'round 1 serves a word';
    assert not (s::text ilike '%correct_answer%') and not (s::text ilike '%correctAnswer%'), 'no key in served state';
    assert (select string_agg(x, '' order by x) from jsonb_array_elements_text(s -> 'question' -> 'letters') x)
         = (select string_agg(x, '' order by x) from regexp_split_to_table((select correct_answer from br_questions where id = qid), '') x),
           'letters are an anagram of the answer';
    assert (select array_to_string(array(select jsonb_array_elements_text(s -> 'question' -> 'letters')), ''))
         <> (select correct_answer from br_questions where id = qid), 'letters are scrambled';
    r := public.br_serve('tokA');
    assert r -> 'question' ->> 'id' = qid::text and r -> 'question' ->> 'deadline' = s -> 'question' ->> 'deadline',
           'a second serve returns the same question and deadline';

    -- A second device resumes, the first token dies ------------------------------
    s := public.br_start_attempt(pa.participant_code, pa.game_code, 'tokA2');
    assert (s ->> 'resumed')::boolean and s -> 'question' ->> 'id' = qid::text, 'resume keeps the served question';
    assert pg_temp.err($f$select public.br_state('tokA')$f$) = 'BR_NO_ATTEMPT', 'old token revoked on resume';

    -- Wrong question id, then a correct answer, then a duplicate -----------------
    assert pg_temp.err($f$select public.br_answer('tokA2', gen_random_uuid(), '{"word":"X"}')$f$) = 'BR_WRONG_QUESTION',
           'cannot answer an unserved question';
    r := public.br_answer('tokA2', qid, pg_temp.right_answer('tokA2'));
    assert (r -> 'result' ->> 'correct')::boolean, 'lower-case correct word accepted';
    assert (r -> 'result' ->> 'basePoints')::int = 10, 'base points';
    assert (r -> 'result' ->> 'bonusPoints')::int between 4 and 5, 'instant answer earns ~full bonus';
    assert pg_temp.err(format($f$select public.br_answer('tokA2', %L, '{"word":"X"}')$f$, qid)) = 'BR_DUPLICATE',
           'second submission for the same question refused';
    assert (r -> 'state' ->> 'index')::int = 1, 'advanced to the next question';

    -- A late answer scores zero -------------------------------------------------
    s := public.br_serve('tokA2');
    qid := (s -> 'question' ->> 'id')::uuid;
    update public.br_attempts set served_at = now() - interval '10 minutes' where token_hash = 'tokA2';
    -- br_answer grades lateness itself rather than expiring first, so the
    -- answer is recorded (as late) instead of being refused.
    r := public.br_answer('tokA2', qid, pg_temp.right_answer('tokA2'));
    assert (r -> 'result' ->> 'timedOut')::boolean and (r -> 'result' ->> 'score')::int = 0, 'late correct answer scores 0';

    -- An abandoned question expires on the next read ----------------------------
    s := public.br_serve('tokA2');
    qid := (s -> 'question' ->> 'id')::uuid;
    update public.br_attempts set served_at = now() - interval '10 minutes' where token_hash = 'tokA2';
    s := public.br_state('tokA2');
    assert (s ->> 'round')::int = 2 and s -> 'question' = 'null'::jsonb, 'expired word recorded, moved to round 2';
    assert (select timed_out from br_answers where question_id = qid and participant_id = pa.id), 'timeout row written';

    -- Round 2: matching, partly right -------------------------------------------
    s := public.br_serve('tokA2');
    qid := (s -> 'question' ->> 'id')::uuid;
    assert jsonb_array_length(s -> 'question' -> 'left') = 5 and jsonb_array_length(s -> 'question' -> 'right') = 5, 'board shape';
    r := pg_temp.right_answer('tokA2');
    -- swap the first two matches: 3 of 5 right
    r := jsonb_set(jsonb_set(r, '{matches,0}', r -> 'matches' -> 1), '{matches,1}', r -> 'matches' -> 0);
    r := public.br_answer('tokA2', qid, r);
    assert (r -> 'result' ->> 'correctParts')::int = 3 and (r -> 'result' ->> 'score')::int = 15
           and (r -> 'result' ->> 'bonusPoints')::int = 0, 'partial board: 3 × 5, no bonus';

    -- Round 3: answer everything right ------------------------------------------
    loop
        guard := guard + 1; exit when guard > 20;
        s := public.br_serve('tokA2');
        exit when s ->> 'status' = 'completed';
        r := public.br_answer('tokA2', (s -> 'question' ->> 'id')::uuid, pg_temp.right_answer('tokA2'));
    end loop;
    s := public.br_state('tokA2');
    assert s ->> 'status' = 'completed', 'attempt completed';
    assert (s -> 'roundScores' ->> 2)::int between 4 * 14 and 4 * 15, 'round 3 = 4 × (10 + ~5)';
    assert (select total_score from br_scores where participant_id = pa.id) = (s ->> 'totalScore')::int, 'score row matches attempt';
    assert (select total_score from br_scores where participant_id = pa.id)
         = (select sum(score) from br_answers where participant_id = pa.id), 'score equals the answer ledger';
    assert (select correct_count from br_scores where participant_id = pa.id)
         = (select sum(correct_parts) from br_answers where participant_id = pa.id)
       and (select correct_count from br_scores where participant_id = pa.id) = 1 + 3 + 4,
           'correct count counts matching pairs, like total_questions (1 word + 3 pairs + 4 MCQs)';
    assert pg_temp.err(format($f$select public.br_answer('tokA2', %L, '{}')$f$, qid)) = 'BR_COMPLETED', 'no answers after completion';
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, %L, 'tokA3')$f$, pa.participant_code, pa.game_code))
           = 'BR_ALREADY_PLAYED', 'one official attempt';

    -- Second player, all wrong ---------------------------------------------------
    update public.br_participants set check_in_status = 'late' where id = pb.id;
    s := public.br_start_attempt(pb.participant_code, pb.game_code, 'tokB');
    guard := 0;
    loop
        guard := guard + 1; exit when guard > 30;
        s := public.br_serve('tokB');
        exit when s ->> 'status' = 'completed';
        r := public.br_answer('tokB', (s -> 'question' ->> 'id')::uuid, '{"word":"ZZZ","choice":"Z","matches":[]}');
        assert not (r -> 'result' ->> 'correct')::boolean, 'wrong answer graded wrong';
    end loop;
    assert (select total_score from br_scores where participant_id = pb.id) = 0, 'all wrong scores 0';

    -- Leaderboard, freeze, finalize ---------------------------------------------
    assert (select participant_id from br_leaderboard where rank = 1 and participant_id in (pa.id, pb.id)) = pa.id
           or (select count(*) from br_leaderboard where total_score > (select total_score from br_scores where participant_id = pa.id)) > 0,
           'higher total ranks higher';
    -- One transaction shares one now(), so date the later score explicitly.
    update public.br_scores set completed_at = completed_at + interval '1 minute' where participant_id = pb.id;
    update public.br_settings set leaderboard_frozen_at = (select completed_at from br_scores where participant_id = pa.id) where id = 1;
    assert not exists (select 1 from br_leaderboard where participant_id = pb.id), 'frozen board ignores later scores';
    update public.br_settings set leaderboard_frozen_at = null where id = 1;
    perform public.br_finalize_results(1);
    assert (select final_status from br_scores where participant_id = pb.id) = 'participant', 'finalize labels non-winners';
    assert (select results_finalized from br_settings) , 'finalized flag';
    update public.br_participants set registration_status = 'disqualified' where id = pa.id;
    assert not exists (select 1 from br_leaderboard where participant_id = pa.id), 'disqualified removed from board';
    update public.br_participants set registration_status = 'registered' where id = pa.id;
    perform public.br_unfinalize_results();

    -- Void and replay -------------------------------------------------------------
    perform public.br_void_attempt(pb.id, 'station crashed');
    assert not exists (select 1 from br_scores where participant_id = pb.id), 'void removes the score';
    assert pg_temp.err($f$select public.br_state('tokB')$f$) = 'BR_NO_ATTEMPT', 'voided token dead';
    s := public.br_start_attempt(pb.participant_code, pb.game_code, 'tokB2');
    assert s ->> 'status' = 'active', 'a voided attempt allows a new one';

    -- Slot capacity -------------------------------------------------------------
    insert into br_sessions (name, event_date, start_time, end_time, capacity, status)
    values ('Test slot', current_date, now(), now() + interval '1 hour', 1, 'open');
    perform public.br_assign_slot(pa.id, (select id from br_sessions where name = 'Test slot'));
    assert pg_temp.err(format($f$select public.br_assign_slot(%L, (select id from br_sessions where name = 'Test slot'))$f$, pb.id))
           = 'BR_SLOT_FULL', 'capacity enforced';
    update br_sessions set status = 'completed' where name = 'Test slot';
    update br_participants set slot_id = (select id from br_sessions where name = 'Test slot') where id = pb.id;
    perform public.br_void_attempt(pb.id, 'test');
    assert pg_temp.err(format($f$select public.br_start_attempt(%L, %L, 'tokB3')$f$, pb.participant_code, pb.game_code))
           = 'BR_SESSION_ENDED', 'ended session cannot start';

    -- Question deletion keeps history ---------------------------------------------
    assert public.br_delete_question(qid) = 'deactivated', 'used question retired, not deleted';

    -- Clean up --------------------------------------------------------------------
    delete from public.br_participants where email like 'test%@example.test';
    delete from public.br_sessions where name = 'Test slot';
    update public.br_questions set active = true where id = qid;
    raise notice 'ENGINE: all assertions passed';
end;
$$;

-- Privileges: the anon and authenticated roles can touch nothing.
set role anon;
do $$
begin
    begin perform 1 from public.br_participants; raise exception 'anon read participants';
    exception when insufficient_privilege then null; end;
    begin perform public.br_state('x'); raise exception 'anon executed engine';
    exception when insufficient_privilege then null; end;
    begin perform 1 from public.br_leaderboard; raise exception 'anon read leaderboard view';
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
    begin perform public.br_answer('x', gen_random_uuid(), '{}'); raise exception 'authenticated executed engine';
    exception when insufficient_privilege then null; end;
    raise notice 'PRIVILEGES: authenticated locked out';
end;
$$;
reset role;
