-- Battle Royale — "Close tournament" (2026-09-29).
--
-- One flag on the settings row. When an admin closes the tournament the app
-- also turns off registration and battles and freezes the board; this flag is
-- what tells the public pages to hide everything except the leaderboard and
-- "My result & certificate". Idempotent: safe to run more than once.

alter table public.br_settings
    add column if not exists event_closed boolean not null default false;

notify pgrst, 'reload schema';
