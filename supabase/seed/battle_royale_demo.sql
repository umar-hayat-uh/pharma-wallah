-- ============================================================================
-- Battle Royale — DEMO data. DO NOT RUN ON THE PRODUCTION PROJECT.
-- ============================================================================
-- Three sessions and ten fictitious participants (example.com addresses) for
-- rehearsing the desk, the battle and the leaderboard. Every demo participant
-- is paid and checked in, so any of them can start a battle with the game code
-- printed below. Remove it all with the delete at the bottom.
-- ============================================================================

insert into public.br_sessions (name, event_date, start_time, end_time, capacity, status)
select v.name, (now() at time zone 'Asia/Karachi')::date,
       ((now() at time zone 'Asia/Karachi')::date + v.starts) at time zone 'Asia/Karachi',
       ((now() at time zone 'Asia/Karachi')::date + v.ends) at time zone 'Asia/Karachi',
       40, 'open'
from (values ('Session 1', time '10:00', time '12:00'),
             ('Session 2', time '12:00', time '14:00'),
             ('Session 3', time '14:00', time '16:00')) as v(name, starts, ends)
where not exists (select 1 from public.br_sessions where name = v.name);

insert into public.br_participants (name, email, phone, university, pharm_year, source, payment_status,
                                    check_in_status, checked_in_at, game_code, slot_id)
select v.name, v.email, '0300-0000000', v.uni, v.yr, 'desk', 'paid', 'checked_in', now(), v.code,
       (select id from public.br_sessions where name = v.sess)
from (values
    ('Ayesha Khan',     'demo01@example.com', 'University of Karachi',       'Year 3', 'DEMO01', 'Session 1'),
    ('Bilal Ahmed',     'demo02@example.com', 'Dow University',              'Year 2', 'DEMO02', 'Session 1'),
    ('Sana Tariq',      'demo03@example.com', 'Ziauddin University',         'Year 4', 'DEMO03', 'Session 1'),
    ('Hamza Siddiqui',  'demo04@example.com', 'University of Karachi',       'Year 5', 'DEMO04', 'Session 2'),
    ('Mariam Iqbal',    'demo05@example.com', 'Jinnah Sindh Medical University', 'Year 1', 'DEMO05', 'Session 2'),
    ('Usman Raza',      'demo06@example.com', 'Hamdard University',          'Year 3', 'DEMO06', 'Session 2'),
    ('Fatima Noor',     'demo07@example.com', 'Dow University',              'Year 4', 'DEMO07', 'Session 3'),
    ('Ali Hassan',      'demo08@example.com', 'Ziauddin University',         'Year 2', 'DEMO08', 'Session 3'),
    ('Hira Malik',      'demo09@example.com', 'University of Karachi',       'Year 5', 'DEMO09', 'Session 3'),
    ('Zain Qureshi',    'demo10@example.com', 'Hamdard University',          'Year 1', 'DEMO10', null)
) as v(name, email, uni, yr, code, sess)
on conflict do nothing;

update public.br_settings set competition_open = true where id = 1;

-- Clean up:
--   delete from public.br_participants where email like 'demo%@example.com';
--   delete from public.br_sessions where name in ('Session 1', 'Session 2', 'Session 3');
