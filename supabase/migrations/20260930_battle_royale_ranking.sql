-- Battle Royale — ranking: total score, then the SHORTER battle time (2026-09-30).
--
-- Until now ties on total were broken by the higher Round 3 score first, so a
-- slower player with a better Round 3 ranked above a faster one on the same
-- total. The organisers want time to decide every tie. Idempotent: safe to run
-- more than once. Nothing is deleted; only the view's ORDER BY changes.

-- 1. The board. Same columns in the same order, so `create or replace` works.
create or replace view public.br_leaderboard with (security_invoker = true) as
select
    rank() over (order by s.total_score desc, s.total_time_ms asc) as rank,
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

-- The view still has no grants for anon/authenticated (only the service role
-- reads it) — `create or replace` keeps the existing privileges.

-- 2. The index that matches the new order.
drop index if exists public.br_scores_rank_idx;
create index if not exists br_scores_rank_idx
    on public.br_scores (total_score desc, total_time_ms asc);

-- 3. The rule text shown on the instructions page.
update public.br_settings
   set rules = (
         select coalesce(jsonb_agg(
                  case when r ilike 'Ties are broken by the higher Round 3%'
                       then to_jsonb('Ties are broken by the shorter total battle time, measured by our server.'::text)
                       else to_jsonb(r) end
                  order by ord), '[]'::jsonb)
           from jsonb_array_elements_text(rules) with ordinality as t(r, ord)),
       updated_at = now()
 where id = 1 and jsonb_typeof(rules) = 'array';

-- Winner labels (br_scores.final_status) are NOT touched: if results were
-- already finalised, a tie on the Top-N line can now fall the other way. Press
-- "Unfinalise" then "Finalise" in admin → Results to re-label from this order.

notify pgrst, 'reload schema';
