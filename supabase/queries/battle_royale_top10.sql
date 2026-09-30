-- Battle Royale — Top 10 winners with contact details, for the organisers.
-- Paste into the Supabase SQL editor (read-only: it changes nothing).
--
-- Uses the official board (br_leaderboard): disqualified/cancelled players are
-- excluded, scores after a freeze are ignored, and the order is total score,
-- then the shorter battle time. rank() gives tied players the same rank, so an
-- exact tie on 10th place returns more than 10 rows — deliberately, so nobody
-- is dropped silently. Contains emails and phone numbers: don't share it publicly.

select
    lb.rank,
    lb.participant_code                                        as player_id,
    lb.name,
    p.email,
    p.phone,
    lb.university,
    p.pharm_year,
    p.student_id,
    lb.round1_score                                            as r1,
    lb.round2_score                                            as r2,
    lb.round3_score                                            as r3,
    lb.total_score                                             as total,
    lb.correct_count || '/' || lb.total_questions              as correct,
    to_char(make_interval(secs => lb.total_time_ms / 1000.0), 'MI:SS.MS') as battle_time,
    lb.final_status,
    lb.completed_at at time zone 'Asia/Karachi'                as finished_at_pkt
from public.br_leaderboard lb
join public.br_participants p on p.id = lb.participant_id
where lb.rank <= 10
order by lb.rank, lb.completed_at;
