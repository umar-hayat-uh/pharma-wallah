-- ============================================================================
-- PharmaWallah — Community (Reddit-shaped, pharmacy-scoped)
-- ============================================================================
-- Run this ONCE in the Supabase SQL editor (Dashboard → SQL → New query).
--
-- It is IDEMPOTENT: re-running it is safe. Every object is created with
-- `if not exists`, every policy is dropped before being recreated, and the
-- backfill at the bottom keys on `legacy_question_id` / `legacy_answer_id`
-- so it can never duplicate rows.
--
-- It is ADDITIVE: the existing `questions`, `answers`, `votes` and `profiles`
-- tables are NOT dropped, altered or emptied. The old Q&A data is *copied*
-- into the new tables; the originals stay exactly as they are, so the change
-- is reversible by ignoring the new tables.
--
-- Everything the community needs lives in the `community_*` namespace, so it
-- does not depend on the shape of `profiles` (which is not in the repo).
-- ============================================================================


-- ─── 1. Members ─────────────────────────────────────────────────────────────
-- The community's own profile row. Kept separate from `profiles` on purpose:
-- PostgREST embedding needs a real foreign key, and `profiles`' structure is
-- not version-controlled, so the community owns its author records outright.
-- The app upserts this row on the member's first write (`ensureMember`).

create table if not exists public.community_members (
    user_id        uuid primary key references auth.users (id) on delete cascade,
    handle         text unique,
    display_name   text,
    avatar_url     text,
    bio            text,
    -- Karma is maintained by trigger from vote activity; never written by the app.
    post_karma     integer     not null default 0,
    comment_karma  integer     not null default 0,
    post_count     integer     not null default 0,
    comment_count  integer     not null default 0,
    created_at     timestamptz not null default now(),
    updated_at     timestamptz not null default now()
);

create index if not exists community_members_handle_idx on public.community_members (handle);


-- ─── 2. Spaces (the "subreddits") ───────────────────────────────────────────

create table if not exists public.community_spaces (
    id           uuid primary key default gen_random_uuid(),
    slug         text unique not null,
    name         text        not null,
    tagline      text,
    description  text,
    -- `icon` is a lucide-react icon name; `accent` a hex the UI tints with.
    icon         text        not null default 'MessageSquare',
    accent       text        not null default '#1C7BD9',
    -- Flairs a post in this space may carry. Empty array = no flairs.
    flairs       text[]      not null default '{}',
    rules        text[]      not null default '{}',
    sort_order   integer     not null default 100,
    is_default   boolean     not null default false,
    member_count integer     not null default 0,
    post_count   integer     not null default 0,
    created_at   timestamptz not null default now()
);

create index if not exists community_spaces_sort_idx on public.community_spaces (sort_order, name);


-- ─── 3. Posts ───────────────────────────────────────────────────────────────

create table if not exists public.community_posts (
    id            uuid primary key default gen_random_uuid(),
    space_id      uuid        not null references public.community_spaces (id) on delete cascade,
    user_id       uuid        not null references public.community_members (user_id) on delete cascade,
    kind          text        not null default 'discussion'
                  check (kind in ('discussion', 'question', 'link', 'image')),
    title         text        not null,
    body          text        not null default '',
    link_url      text,
    image_url     text,
    flair         text,
    tags          text[]      not null default '{}',
    -- Maintained by trigger from community_votes. Never written by the app.
    score         integer     not null default 0,
    up_count      integer     not null default 0,
    down_count    integer     not null default 0,
    comment_count integer     not null default 0,
    view_count    integer     not null default 0,
    -- Reddit's hot ranking, recomputed whenever score changes (see trigger).
    hot_rank      double precision not null default 0,
    -- Question posts only: the comment the asker marked as the answer.
    accepted_comment_id uuid,
    is_pinned     boolean     not null default false,
    is_locked     boolean     not null default false,
    -- Soft delete: the row stays so its comment thread keeps its shape.
    is_deleted    boolean     not null default false,
    created_at    timestamptz not null default now(),
    updated_at    timestamptz not null default now(),
    edited_at     timestamptz,
    -- Set only by the one-time backfill below; lets it stay idempotent.
    legacy_question_id uuid unique
);

create index if not exists community_posts_hot_idx     on public.community_posts (hot_rank desc)  where not is_deleted;
create index if not exists community_posts_new_idx     on public.community_posts (created_at desc) where not is_deleted;
create index if not exists community_posts_top_idx     on public.community_posts (score desc)      where not is_deleted;
create index if not exists community_posts_space_idx   on public.community_posts (space_id, hot_rank desc) where not is_deleted;
create index if not exists community_posts_author_idx  on public.community_posts (user_id, created_at desc);
create index if not exists community_posts_tags_idx    on public.community_posts using gin (tags);
-- Feed search ("q="): title and body, one index.
create index if not exists community_posts_search_idx  on public.community_posts
    using gin (to_tsvector('english', title || ' ' || coalesce(body, '')));


-- ─── 4. Comments ────────────────────────────────────────────────────────────
-- Nesting is parent_id + depth. `depth` is denormalised so the API can cap how
-- deep a thread renders without walking the tree first.

create table if not exists public.community_comments (
    id         uuid primary key default gen_random_uuid(),
    post_id    uuid        not null references public.community_posts (id) on delete cascade,
    parent_id  uuid references public.community_comments (id) on delete cascade,
    user_id    uuid        not null references public.community_members (user_id) on delete cascade,
    body       text        not null,
    depth      integer     not null default 0,
    score      integer     not null default 0,
    up_count   integer     not null default 0,
    down_count integer     not null default 0,
    reply_count integer    not null default 0,
    -- Soft delete: "[removed]" keeps the replies underneath readable.
    is_deleted boolean     not null default false,
    created_at timestamptz not null default now(),
    updated_at timestamptz not null default now(),
    edited_at  timestamptz,
    legacy_answer_id uuid unique
);

create index if not exists community_comments_post_idx   on public.community_comments (post_id, score desc);
create index if not exists community_comments_parent_idx on public.community_comments (parent_id);
create index if not exists community_comments_author_idx on public.community_comments (user_id, created_at desc);

-- The accepted answer must be a comment (added after both tables exist).
do $$
begin
    if not exists (
        select 1 from pg_constraint where conname = 'community_posts_accepted_comment_fkey'
    ) then
        alter table public.community_posts
            add constraint community_posts_accepted_comment_fkey
            foreign key (accepted_comment_id)
            references public.community_comments (id) on delete set null;
    end if;
end $$;


-- ─── 5. Votes ───────────────────────────────────────────────────────────────
-- One row per (member, target). `value` is +1 / -1; removing a vote deletes
-- the row. The composite primary key is what makes the upsert in
-- community_vote() atomic.

create table if not exists public.community_votes (
    user_id     uuid     not null references public.community_members (user_id) on delete cascade,
    target_type text     not null check (target_type in ('post', 'comment')),
    target_id   uuid     not null,
    value       smallint not null check (value in (-1, 1)),
    created_at  timestamptz not null default now(),
    primary key (user_id, target_type, target_id)
);

create index if not exists community_votes_target_idx on public.community_votes (target_type, target_id);


-- ─── 6. Saves, memberships, reports ─────────────────────────────────────────

create table if not exists public.community_saves (
    user_id    uuid not null references public.community_members (user_id) on delete cascade,
    post_id    uuid not null references public.community_posts (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, post_id)
);

create table if not exists public.community_memberships (
    user_id    uuid not null references public.community_members (user_id) on delete cascade,
    space_id   uuid not null references public.community_spaces (id) on delete cascade,
    created_at timestamptz not null default now(),
    primary key (user_id, space_id)
);

create table if not exists public.community_reports (
    id          uuid primary key default gen_random_uuid(),
    reporter_id uuid not null references public.community_members (user_id) on delete cascade,
    target_type text not null check (target_type in ('post', 'comment')),
    target_id   uuid not null,
    reason      text not null,
    details     text,
    status      text not null default 'open' check (status in ('open', 'reviewed', 'actioned', 'dismissed')),
    created_at  timestamptz not null default now(),
    -- One open report per member per target; re-reporting is a no-op.
    unique (reporter_id, target_type, target_id)
);


-- ─── 7. Functions ───────────────────────────────────────────────────────────

-- Reddit's "hot" ranking: the sign-aware log of the score plus an age term, so
-- a post needs ~10x the votes to hold its place as it gets a day older.
create or replace function public.community_hot_rank(p_score integer, p_created timestamptz)
returns double precision
language sql
immutable
as $$
    -- round() has no (double precision, int) overload, so the arithmetic is
    -- done in numeric and cast back.
    select round(
        ( sign(p_score)::numeric * log(greatest(abs(p_score), 1)::numeric) )
        + ( extract(epoch from p_created)::numeric - 1700000000 ) / 45000.0
    , 7)::double precision;
$$;

-- Keeps hot_rank in step with score. Fires on insert and on any score change.
create or replace function public.community_posts_touch_rank()
returns trigger
language plpgsql
as $$
begin
    new.hot_rank := public.community_hot_rank(new.score, new.created_at);
    return new;
end;
$$;

-- Recomputes a vote target's tallies and the author's karma from the votes
-- table. Recomputing (rather than incrementing) means a double-fired trigger
-- or a manual row edit can never drift the counter away from the truth.
create or replace function public.community_apply_vote_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
    v_type   text;
    v_target uuid;
    v_up     integer;
    v_down   integer;
    v_author uuid;
begin
    v_type   := coalesce(new.target_type, old.target_type);
    v_target := coalesce(new.target_id,   old.target_id);

    select coalesce(sum(case when value =  1 then 1 else 0 end), 0),
           coalesce(sum(case when value = -1 then 1 else 0 end), 0)
      into v_up, v_down
      from public.community_votes
     where target_type = v_type and target_id = v_target;

    if v_type = 'post' then
        update public.community_posts
           set up_count = v_up, down_count = v_down, score = v_up - v_down
         where id = v_target
        returning user_id into v_author;

        if v_author is not null then
            update public.community_members m
               set post_karma = (
                       select coalesce(sum(p.score), 0)
                         from public.community_posts p
                        where p.user_id = v_author and not p.is_deleted
                   ),
                   updated_at = now()
             where m.user_id = v_author;
        end if;
    else
        update public.community_comments
           set up_count = v_up, down_count = v_down, score = v_up - v_down
         where id = v_target
        returning user_id into v_author;

        if v_author is not null then
            update public.community_members m
               set comment_karma = (
                       select coalesce(sum(c.score), 0)
                         from public.community_comments c
                        where c.user_id = v_author and not c.is_deleted
                   ),
                   updated_at = now()
             where m.user_id = v_author;
        end if;
    end if;

    return null;
end;
$$;

-- Post counters on the space and the author.
create or replace function public.community_posts_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        update public.community_spaces  set post_count = post_count + 1 where id = new.space_id;
        update public.community_members set post_count = post_count + 1 where user_id = new.user_id;
    elsif tg_op = 'DELETE' then
        update public.community_spaces  set post_count = greatest(post_count - 1, 0) where id = old.space_id;
        update public.community_members set post_count = greatest(post_count - 1, 0) where user_id = old.user_id;
    elsif tg_op = 'UPDATE' and new.is_deleted is distinct from old.is_deleted then
        -- A soft delete leaves the row but should not keep inflating the counts.
        update public.community_spaces
           set post_count = greatest(post_count + (case when new.is_deleted then -1 else 1 end), 0)
         where id = new.space_id;
        update public.community_members
           set post_count = greatest(post_count + (case when new.is_deleted then -1 else 1 end), 0)
         where user_id = new.user_id;
    end if;
    return null;
end;
$$;

-- Comment counters on the post, the parent comment and the author.
create or replace function public.community_comments_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        update public.community_posts   set comment_count = comment_count + 1 where id = new.post_id;
        update public.community_members set comment_count = comment_count + 1 where user_id = new.user_id;
        if new.parent_id is not null then
            update public.community_comments set reply_count = reply_count + 1 where id = new.parent_id;
        end if;
    elsif tg_op = 'DELETE' then
        update public.community_posts   set comment_count = greatest(comment_count - 1, 0) where id = old.post_id;
        update public.community_members set comment_count = greatest(comment_count - 1, 0) where user_id = old.user_id;
        if old.parent_id is not null then
            update public.community_comments set reply_count = greatest(reply_count - 1, 0) where id = old.parent_id;
        end if;
    elsif tg_op = 'UPDATE' and new.is_deleted is distinct from old.is_deleted then
        update public.community_posts
           set comment_count = greatest(comment_count + (case when new.is_deleted then -1 else 1 end), 0)
         where id = new.post_id;
        update public.community_members
           set comment_count = greatest(comment_count + (case when new.is_deleted then -1 else 1 end), 0)
         where user_id = new.user_id;
    end if;
    return null;
end;
$$;

-- Space member counter.
create or replace function public.community_memberships_counts()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
    if tg_op = 'INSERT' then
        update public.community_spaces set member_count = member_count + 1 where id = new.space_id;
    elsif tg_op = 'DELETE' then
        update public.community_spaces set member_count = greatest(member_count - 1, 0) where id = old.space_id;
    end if;
    return null;
end;
$$;

-- Sets `depth` from the parent, and refuses a reply whose parent belongs to a
-- different post. Depth is capped at 8 so a pathological thread cannot nest
-- past what the UI can indent — deeper replies attach as siblings at 8.
create or replace function public.community_comments_set_depth()
returns trigger
language plpgsql
as $$
declare
    v_parent_post  uuid;
    v_parent_depth integer;
begin
    if new.parent_id is null then
        new.depth := 0;
        return new;
    end if;

    select post_id, depth into v_parent_post, v_parent_depth
      from public.community_comments where id = new.parent_id;

    if v_parent_post is null then
        raise exception 'parent comment % does not exist', new.parent_id;
    end if;
    if v_parent_post <> new.post_id then
        raise exception 'parent comment belongs to a different post';
    end if;

    new.depth := least(v_parent_depth + 1, 8);
    return new;
end;
$$;

-- View counter. Fire-and-forget from the post route; never blocks a read.
create or replace function public.increment_community_post_views(p_post_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
    update public.community_posts set view_count = view_count + 1 where id = p_post_id;
$$;

-- Server-authoritative voting. The app sends a direction, never a score: this
-- function decides whether that means cast, switch or toggle-off, and returns
-- the score it actually stored. Runs as the caller (security invoker), so RLS
-- still decides whether the member may vote at all.
create or replace function public.community_vote(
    p_target_type text,
    p_target_id   uuid,
    p_value       smallint
)
returns jsonb
language plpgsql
as $$
declare
    v_user     uuid := auth.uid();
    v_existing smallint;
    v_score    integer;
    v_final    smallint;
begin
    if v_user is null then
        raise exception 'not authenticated' using errcode = '42501';
    end if;
    if p_target_type not in ('post', 'comment') then
        raise exception 'invalid target type';
    end if;
    if p_value not in (-1, 1) then
        raise exception 'invalid vote value';
    end if;

    select value into v_existing
      from public.community_votes
     where user_id = v_user and target_type = p_target_type and target_id = p_target_id;

    if v_existing = p_value then
        -- Same direction again = take the vote back.
        delete from public.community_votes
         where user_id = v_user and target_type = p_target_type and target_id = p_target_id;
        v_final := null;
    else
        insert into public.community_votes (user_id, target_type, target_id, value)
        values (v_user, p_target_type, p_target_id, p_value)
        on conflict (user_id, target_type, target_id)
        do update set value = excluded.value, created_at = now();
        v_final := p_value;
    end if;

    if p_target_type = 'post' then
        select score into v_score from public.community_posts    where id = p_target_id;
    else
        select score into v_score from public.community_comments where id = p_target_id;
    end if;

    return jsonb_build_object('score', coalesce(v_score, 0), 'value', v_final);
end;
$$;

-- Returns a page of top-level comments together with every descendant, flat.
-- The API builds the tree from this; one round trip instead of one per level.
create or replace function public.community_comment_tree(
    p_post_id     uuid,
    p_sort        text    default 'top',
    p_root_limit  integer default 30,
    p_root_offset integer default 0
)
returns jsonb
language sql
stable
as $$
    with recursive roots as (
        select c.id
          from public.community_comments c
         where c.post_id = p_post_id and c.parent_id is null
         order by
            case when p_sort = 'new' then extract(epoch from c.created_at) end desc,
            case when p_sort = 'old' then extract(epoch from c.created_at) end asc,
            case when p_sort not in ('new', 'old') then c.score end desc,
            c.created_at asc
         limit greatest(p_root_limit, 1) offset greatest(p_root_offset, 0)
    ),
    tree as (
        select c.* from public.community_comments c join roots r on r.id = c.id
        union all
        select c.* from public.community_comments c join tree t on c.parent_id = t.id
    )
    select coalesce(jsonb_agg(
        jsonb_build_object(
            'id',          t.id,
            'post_id',     t.post_id,
            'parent_id',   t.parent_id,
            'user_id',     t.user_id,
            'body',        case when t.is_deleted then '' else t.body end,
            'depth',       t.depth,
            'score',       t.score,
            'reply_count', t.reply_count,
            'is_deleted',  t.is_deleted,
            'created_at',  t.created_at,
            'edited_at',   t.edited_at,
            'author', jsonb_build_object(
                'handle',        m.handle,
                'display_name',  m.display_name,
                'avatar_url',    m.avatar_url,
                'karma',         m.post_karma + m.comment_karma
            )
        ) order by t.score desc, t.created_at asc
    ), '[]'::jsonb)
      from tree t
      left join public.community_members m on m.user_id = t.user_id;
$$;


-- Column guards.
--
-- RLS is ROW-level, not column-level: the `update` policies above let a member
-- edit *their own* row, which — through a direct PostgREST call, bypassing this
-- app's route handlers entirely — would also let them set their own `score`,
-- `karma`, `is_pinned` or `view_count`. These triggers close that: on any
-- update from an ordinary member, every database-owned column is forced back to
-- its previous value. Editable fields (title, body, tags, flair, the accepted
-- answer, soft-delete) pass through untouched.
--
-- The counter/karma/view functions are SECURITY DEFINER, so inside them
-- `current_user` is the function owner and the guard lets their writes through.
-- A service-role key (the dashboard, a future moderator route) is also allowed,
-- which is what makes pinning and locking possible at all.
create or replace function public.community_is_privileged()
returns boolean
language plpgsql
stable
as $$
declare
    v_role text;
begin
    if current_user in ('postgres', 'supabase_admin') then
        return true;
    end if;
    begin
        v_role := current_setting('request.jwt.claims', true)::jsonb ->> 'role';
    exception when others then
        v_role := null;
    end;
    return coalesce(v_role, '') = 'service_role';
end;
$$;

create or replace function public.community_posts_guard()
returns trigger
language plpgsql
as $$
begin
    if public.community_is_privileged() then
        return new;
    end if;
    -- Owned by the database, never by the member.
    new.score              := old.score;
    new.up_count           := old.up_count;
    new.down_count         := old.down_count;
    new.comment_count      := old.comment_count;
    new.view_count         := old.view_count;
    new.hot_rank           := old.hot_rank;
    -- Moderation and identity.
    new.is_pinned          := old.is_pinned;
    new.is_locked          := old.is_locked;
    new.user_id            := old.user_id;
    new.space_id           := old.space_id;
    new.legacy_question_id := old.legacy_question_id;
    new.created_at         := old.created_at;
    return new;
end;
$$;

create or replace function public.community_comments_guard()
returns trigger
language plpgsql
as $$
begin
    if public.community_is_privileged() then
        return new;
    end if;
    new.score            := old.score;
    new.up_count         := old.up_count;
    new.down_count       := old.down_count;
    new.reply_count      := old.reply_count;
    new.user_id          := old.user_id;
    new.post_id          := old.post_id;
    new.parent_id        := old.parent_id;
    new.depth            := old.depth;
    new.legacy_answer_id := old.legacy_answer_id;
    new.created_at       := old.created_at;
    return new;
end;
$$;

create or replace function public.community_members_guard()
returns trigger
language plpgsql
as $$
begin
    if public.community_is_privileged() then
        return new;
    end if;
    -- A member may edit their handle, display name, avatar and bio. Reputation
    -- is earned, so it is restored from the previous row on every self-update.
    new.post_karma    := old.post_karma;
    new.comment_karma := old.comment_karma;
    new.post_count    := old.post_count;
    new.comment_count := old.comment_count;
    new.user_id       := old.user_id;
    new.created_at    := old.created_at;
    return new;
end;
$$;


-- ─── 8. Triggers ────────────────────────────────────────────────────────────

drop trigger if exists community_posts_guard_trg on public.community_posts;
create trigger community_posts_guard_trg
    before update on public.community_posts
    for each row execute function public.community_posts_guard();

drop trigger if exists community_comments_guard_trg on public.community_comments;
create trigger community_comments_guard_trg
    before update on public.community_comments
    for each row execute function public.community_comments_guard();

drop trigger if exists community_members_guard_trg on public.community_members;
create trigger community_members_guard_trg
    before update on public.community_members
    for each row execute function public.community_members_guard();

drop trigger if exists community_posts_rank_trg on public.community_posts;
create trigger community_posts_rank_trg
    before insert or update of score on public.community_posts
    for each row execute function public.community_posts_touch_rank();

drop trigger if exists community_votes_counts_trg on public.community_votes;
create trigger community_votes_counts_trg
    after insert or update or delete on public.community_votes
    for each row execute function public.community_apply_vote_counts();

drop trigger if exists community_posts_counts_trg on public.community_posts;
create trigger community_posts_counts_trg
    after insert or update or delete on public.community_posts
    for each row execute function public.community_posts_counts();

drop trigger if exists community_comments_depth_trg on public.community_comments;
create trigger community_comments_depth_trg
    before insert on public.community_comments
    for each row execute function public.community_comments_set_depth();

drop trigger if exists community_comments_counts_trg on public.community_comments;
create trigger community_comments_counts_trg
    after insert or update or delete on public.community_comments
    for each row execute function public.community_comments_counts();

drop trigger if exists community_memberships_counts_trg on public.community_memberships;
create trigger community_memberships_counts_trg
    after insert or delete on public.community_memberships
    for each row execute function public.community_memberships_counts();


-- ─── 9. Row Level Security ──────────────────────────────────────────────────
-- Every community route uses the anon key + the member's cookies, so these
-- policies — not the handler — are what protect the data. (MEMORY.md §3,
-- "Model B".) Reads are public because the community is public; every write
-- is restricted to the row's own author.

alter table public.community_members     enable row level security;
alter table public.community_spaces      enable row level security;
alter table public.community_posts       enable row level security;
alter table public.community_comments    enable row level security;
alter table public.community_votes       enable row level security;
alter table public.community_saves       enable row level security;
alter table public.community_memberships enable row level security;
alter table public.community_reports     enable row level security;

-- Members: world-readable (author cards), self-writable.
drop policy if exists community_members_read   on public.community_members;
drop policy if exists community_members_insert on public.community_members;
drop policy if exists community_members_update on public.community_members;
create policy community_members_read   on public.community_members for select using (true);
create policy community_members_insert on public.community_members for insert with check (auth.uid() = user_id);
create policy community_members_update on public.community_members for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

-- Spaces: world-readable, created only by a service-role key (seeded below).
drop policy if exists community_spaces_read on public.community_spaces;
create policy community_spaces_read on public.community_spaces for select using (true);

-- Posts: world-readable; authored, edited and deleted only by their author.
drop policy if exists community_posts_read   on public.community_posts;
drop policy if exists community_posts_insert on public.community_posts;
drop policy if exists community_posts_update on public.community_posts;
drop policy if exists community_posts_delete on public.community_posts;
create policy community_posts_read   on public.community_posts for select using (true);
create policy community_posts_insert on public.community_posts for insert with check (auth.uid() = user_id);
create policy community_posts_update on public.community_posts for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy community_posts_delete on public.community_posts for delete using (auth.uid() = user_id);

-- Comments: same rule.
drop policy if exists community_comments_read   on public.community_comments;
drop policy if exists community_comments_insert on public.community_comments;
drop policy if exists community_comments_update on public.community_comments;
drop policy if exists community_comments_delete on public.community_comments;
create policy community_comments_read   on public.community_comments for select using (true);
create policy community_comments_insert on public.community_comments for insert with check (auth.uid() = user_id);
create policy community_comments_update on public.community_comments for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy community_comments_delete on public.community_comments for delete using (auth.uid() = user_id);

-- Votes: a member may only ever see or touch their own vote rows. Tallies
-- reach the UI through the counters on the post/comment, never through here.
drop policy if exists community_votes_read   on public.community_votes;
drop policy if exists community_votes_write  on public.community_votes;
drop policy if exists community_votes_update on public.community_votes;
drop policy if exists community_votes_delete on public.community_votes;
create policy community_votes_read   on public.community_votes for select using (auth.uid() = user_id);
create policy community_votes_write  on public.community_votes for insert with check (auth.uid() = user_id);
create policy community_votes_update on public.community_votes for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy community_votes_delete on public.community_votes for delete using (auth.uid() = user_id);

-- Saves: private to the member.
drop policy if exists community_saves_read   on public.community_saves;
drop policy if exists community_saves_write  on public.community_saves;
drop policy if exists community_saves_delete on public.community_saves;
create policy community_saves_read   on public.community_saves for select using (auth.uid() = user_id);
create policy community_saves_write  on public.community_saves for insert with check (auth.uid() = user_id);
create policy community_saves_delete on public.community_saves for delete using (auth.uid() = user_id);

-- Memberships: readable by anyone (member counts are public), self-writable.
drop policy if exists community_memberships_read   on public.community_memberships;
drop policy if exists community_memberships_write  on public.community_memberships;
drop policy if exists community_memberships_delete on public.community_memberships;
create policy community_memberships_read   on public.community_memberships for select using (true);
create policy community_memberships_write  on public.community_memberships for insert with check (auth.uid() = user_id);
create policy community_memberships_delete on public.community_memberships for delete using (auth.uid() = user_id);

-- Reports: a member may file one and see their own. Moderators read them in
-- the Supabase dashboard (or via a service-role route), never through here.
drop policy if exists community_reports_read  on public.community_reports;
drop policy if exists community_reports_write on public.community_reports;
create policy community_reports_read  on public.community_reports for select using (auth.uid() = reporter_id);
create policy community_reports_write on public.community_reports for insert with check (auth.uid() = reporter_id);


-- ─── 10. Seed the pharmacy spaces ───────────────────────────────────────────
-- Named after what a Pharm-D student actually studies and does, and matched to
-- the subjects the rest of the app already teaches. `on conflict (slug)`
-- refreshes the copy without touching member/post counts or existing posts.

insert into public.community_spaces (slug, name, tagline, description, icon, accent, flairs, rules, sort_order, is_default)
values
    ('pharmacology', 'Pharmacology', 'Mechanisms, receptors, drug classes',
     'Anything about how drugs act on the body — receptor pharmacology, drug classes, autonomic and CNS agents, dose–response, and the reasoning behind a mechanism.',
     'Brain', '#1C7BD9', array['Mechanism','Drug class','Exam prep','Study notes','Discussion'],
     array['Explain the mechanism, do not just name it.','Cite a textbook or paper for any claim that is not standard teaching.'], 10, true),

    ('pharmaceutics', 'Pharmaceutics', 'Dosage forms, formulation, dispensing',
     'Formulation and dosage-form design: tablets, capsules, emulsions, suspensions, ointments, master formulae, and the practical side of compounding.',
     'FlaskConical', '#21B67A', array['Formulation','Compounding','Practical','Study notes','Discussion'],
     array['Post the full formula when asking about a preparation.'], 20, true),

    ('clinical-pharmacy', 'Clinical Pharmacy', 'Cases, therapeutics, patient care',
     'Therapeutics and patient-facing practice — case discussions, regimen review, counselling points, and clinical reasoning.',
     'Stethoscope', '#0EA5E9', array['Case discussion','Therapeutics','Counselling','Guideline','Discussion'],
     array['De-identify every case. No names, no record numbers, no dates of birth.',
           'Teaching discussion only — this is not a place to seek or give treatment advice for a real patient.'], 30, true),

    ('pharmaceutical-chemistry', 'Pharmaceutical Chemistry', 'Structure, synthesis, SAR',
     'Medicinal and organic chemistry: structure–activity relationships, synthesis routes, functional groups, stability and drug design.',
     'Atom', '#8B5CF6', array['SAR','Synthesis','Structure','Study notes','Discussion'],
     array['Draw or link the structure you are asking about — the Molecular Lab exports a shareable link.'], 40, false),

    ('pharmacognosy', 'Pharmacognosy', 'Crude drugs, phytochemistry, natural products',
     'Plant and natural-product drugs — crude drug identification, powder microscopy, phytochemical tests, alkaloids and glycosides.',
     'Leaf', '#16A34A', array['Identification','Phytochemistry','Spotting','Study notes','Discussion'],
     array['For identification posts, say what you already observed before asking.'], 50, false),

    ('pharmaceutical-analysis', 'Pharmaceutical Analysis', 'Assays, instrumentation, QC',
     'Analytical methods and quality control — titrimetry, UV/HPLC, TLC, calibration curves, validation and limit tests.',
     'LineChart', '#F97316', array['Method','Instrumentation','Calculation','Practical','Discussion'],
     array['Show your raw readings and your working when a result looks wrong.'], 60, false),

    ('pharmacy-calculations', 'Calculations', 'Doses, dilutions, and the maths behind them',
     'Every calculation a pharmacy student meets: doses, dilutions, isotonicity, infusion rates, alligation and pharmacokinetics. Show your working.',
     'Calculator', '#0D9488', array['Dosage','Dilution','Pharmacokinetics','Check my working','Discussion'],
     array['Show your working. A bare answer request will be removed.',
           'Link the calculator you used where one exists.'], 70, true),

    ('hospital-pharmacy', 'Hospital & Community Practice', 'On the ward, behind the counter',
     'Hospital and community practice — ward rounds, dispensing workflow, inventory, prescription handling and the realities of the job.',
     'Building2', '#2563EB', array['Ward','Dispensing','Workflow','Question','Discussion'],
     array['No patient-identifiable information, ever.'], 80, false),

    ('exams-and-study', 'Exams & Study', 'Papers, revision, and how to get through them',
     'Exam preparation, past papers, revision strategy, viva and spotting practice, and surviving the semester.',
     'GraduationCap', '#DB2777', array['Past paper','Revision','Viva','Resource','Discussion'],
     array['Do not post copyrighted material you do not have the right to share.'], 90, true),

    ('career-and-licensing', 'Career & Licensing', 'After the degree',
     'Internships, registration and licensing exams, higher study, industry versus practice, and career questions.',
     'Briefcase', '#CA8A04', array['Internship','Licensing','Higher study','Industry','Discussion'],
     array['Say which country or council you are asking about — requirements differ.'], 100, false),

    ('lab-and-spotting', 'Lab & Spotting', 'Slides, plates, and bench work',
     'Bench and lab work — histology and pathology slides, powder microscopy, culture plates, TLC plates and identification practice.',
     'Microscope', '#7C3AED', array['Spotting','Histology','Microbiology','Technique','Discussion'],
     array['Post the clearest image you can and say the magnification and stain.'], 110, false),

    ('general', 'General', 'Everything else pharmacy',
     'Anything pharmacy-related that does not fit another space — news, ethics, student life and introductions.',
     'MessageSquare', '#64748B', array['News','Student life','Introduction','Discussion'],
     array['Keep it pharmacy-related.'], 120, true)
on conflict (slug) do update set
    name        = excluded.name,
    tagline     = excluded.tagline,
    description = excluded.description,
    icon        = excluded.icon,
    accent      = excluded.accent,
    flairs      = excluded.flairs,
    rules       = excluded.rules,
    sort_order  = excluded.sort_order,
    is_default  = excluded.is_default;


-- ─── 11. Backfill the existing Q&A ──────────────────────────────────────────
-- Copies `questions` → `community_posts` (as Question posts) and `answers` →
-- top-level `community_comments`. Non-destructive: the source tables are read
-- only. Idempotent: `legacy_question_id` / `legacy_answer_id` are unique, so a
-- second run inserts nothing.
--
-- Wrapped in a guard because a fresh project may not have the old tables at
-- all — this migration must succeed either way.

do $$
declare
    v_general uuid;
begin
    if to_regclass('public.questions') is null then
        raise notice 'no legacy questions table — skipping backfill';
        return;
    end if;

    select id into v_general from public.community_spaces where slug = 'general';

    -- Members first: every legacy author needs a community_members row, because
    -- posts and comments are foreign-keyed to it.
    insert into public.community_members (user_id, display_name, avatar_url)
    select distinct q.user_id,
           coalesce(
               nullif(btrim(p.display_name), ''),
               split_part(coalesce(p.email, ''), '@', 1),
               'Member'
           ),
           p.avatar_url
      from public.questions q
      left join public.profiles p on p.id = q.user_id
     where q.user_id is not null
    on conflict (user_id) do nothing;

    if to_regclass('public.answers') is not null then
        insert into public.community_members (user_id, display_name, avatar_url)
        select distinct a.user_id,
               coalesce(
                   nullif(btrim(p.display_name), ''),
                   split_part(coalesce(p.email, ''), '@', 1),
                   'Member'
               ),
               p.avatar_url
          from public.answers a
          left join public.profiles p on p.id = a.user_id
         where a.user_id is not null
        on conflict (user_id) do nothing;
    end if;

    -- Questions → Question posts. Each lands in the space its first recognised
    -- tag maps to, otherwise General.
    insert into public.community_posts
        (space_id, user_id, kind, title, body, tags, score, view_count, created_at, updated_at, legacy_question_id)
    select coalesce(
               (select s.id from public.community_spaces s
                 where s.slug = any (
                     select case t
                         when 'pharmacology'      then 'pharmacology'
                         when 'biochemistry'      then 'pharmaceutical-chemistry'
                         when 'physiology'        then 'pharmacology'
                         when 'clinical'          then 'clinical-pharmacy'
                         when 'calculations'      then 'pharmacy-calculations'
                         when 'drug-interactions' then 'clinical-pharmacy'
                         else null
                     end
                     from unnest(q.tags) as t
                 )
                 limit 1),
               v_general
           ),
           q.user_id,
           'question',
           left(coalesce(nullif(btrim(q.title), ''), 'Untitled question'), 300),
           coalesce(q.content, ''),
           coalesce(q.tags, '{}'),
           coalesce(q.score, 0),
           coalesce(q.views, 0),
           q.created_at,
           coalesce(q.updated_at, q.created_at),
           q.id
      from public.questions q
     where q.user_id is not null
    on conflict (legacy_question_id) do nothing;

    if to_regclass('public.answers') is not null then
        insert into public.community_comments
            (post_id, parent_id, user_id, body, score, created_at, updated_at, legacy_answer_id)
        select p.id, null, a.user_id, coalesce(a.content, ''), coalesce(a.score, 0),
               a.created_at, coalesce(a.created_at, now()), a.id
          from public.answers a
          join public.community_posts p on p.legacy_question_id = a.question_id
         where a.user_id is not null
        on conflict (legacy_answer_id) do nothing;
    end if;

    -- The counter triggers maintained post_count/comment_count as those rows
    -- went in, but `score` was inserted directly (not through a vote), so the
    -- hot ranks need one pass to catch up.
    update public.community_posts
       set hot_rank = public.community_hot_rank(score, created_at)
     where legacy_question_id is not null;

    raise notice 'community backfill complete';
end $$;

-- Karma is normally maintained by the vote trigger, which only fires when
-- somebody votes. Backfilled rows carry a score that arrived by direct insert,
-- so without this pass every legacy author would show 0 karma despite having
-- well-scored posts. Runs unconditionally: it is a full recompute from the
-- posts/comments tables, so it is correct and idempotent on a fresh project too.
update public.community_members m
   set post_karma = coalesce((
           select sum(p.score) from public.community_posts p
            where p.user_id = m.user_id and not p.is_deleted
       ), 0),
       comment_karma = coalesce((
           select sum(c.score) from public.community_comments c
            where c.user_id = m.user_id and not c.is_deleted
       ), 0),
       updated_at = now();


-- ─── 12. Done ───────────────────────────────────────────────────────────────
-- Verify with:
--   select slug, name, post_count from public.community_spaces order by sort_order;
--   select count(*) from public.community_posts;
--   select count(*) from public.community_comments;
