-- Battle Royale: let a player hide their name on the public leaderboard (2026-10-13).
-- Idempotent. The public board shows first names only; a hidden player is listed as
-- "Anonymous player" (src/lib/battle-royale/leaderboard.ts). Run in the Supabase SQL editor.
alter table public.br_participants
  add column if not exists hide_from_leaderboard boolean not null default false;

-- PostgREST caches the schema; make the new column visible to the API at once.
notify pgrst, 'reload schema';
