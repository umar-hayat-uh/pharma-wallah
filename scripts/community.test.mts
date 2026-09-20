/**
 * Tests for the community's pure layer.
 *
 *   node --test scripts/community.test.mts
 *
 * No framework: Node's type stripping plus the resolve hook that lets the app's
 * extensionless imports work (scripts/lib/ts-resolve.mjs).
 *
 * These cover the logic that decides what a reader actually sees — how a flat
 * row set becomes a thread, what counts as a safe link, how a filter is
 * clamped. The route handlers themselves need a live Supabase and are verified
 * separately; the SQL is verified by running the migration against a real
 * Postgres (see the community skill).
 */
import { register } from "node:module";
import { test } from "node:test";
import assert from "node:assert/strict";

register("./lib/ts-resolve.mjs", import.meta.url);

const S = await import("../src/lib/community/pure.ts");

// ─── Helpers ────────────────────────────────────────────────────────────────

let seq = 0;
function uuid(n?: number) {
    const v = (n ?? ++seq).toString(16).padStart(12, "0");
    return `00000000-0000-4000-8000-${v}`;
}

function row(opts: {
    id: string;
    parent_id?: string | null;
    user_id?: string;
    body?: string;
    score?: number;
    depth?: number;
    created_at?: string;
    is_deleted?: boolean;
}) {
    return {
        id: opts.id,
        post_id: "post-1",
        parent_id: opts.parent_id ?? null,
        user_id: opts.user_id ?? "author-1",
        body: opts.body ?? "text",
        depth: opts.depth ?? 0,
        score: opts.score ?? 0,
        reply_count: 0,
        is_deleted: opts.is_deleted ?? false,
        created_at: opts.created_at ?? "2026-09-20T10:00:00.000Z",
        edited_at: null,
        author: { handle: "h", display_name: "Member", avatar_url: null, karma: 3 },
    };
}

// ─── buildCommentTree ───────────────────────────────────────────────────────

test("buildCommentTree nests replies under their parent", () => {
    const a = uuid(1);
    const b = uuid(2);
    const c = uuid(3);
    const tree = S.buildCommentTree(
        [
            row({ id: a }),
            row({ id: b, parent_id: a, depth: 1 }),
            row({ id: c, parent_id: b, depth: 2 }),
        ],
        null,
        {},
        null
    );

    assert.equal(tree.length, 1, "one root");
    assert.equal(tree[0].id, a);
    assert.equal(tree[0].replies.length, 1);
    assert.equal(tree[0].replies[0].id, b);
    assert.equal(tree[0].replies[0].replies[0].id, c);
});

test("buildCommentTree orders siblings by score, then oldest first", () => {
    const low = uuid(10);
    const high = uuid(11);
    const mid = uuid(12);
    const tree = S.buildCommentTree(
        [
            row({ id: low, score: 1, created_at: "2026-09-20T10:00:00.000Z" }),
            row({ id: high, score: 9, created_at: "2026-09-20T12:00:00.000Z" }),
            row({ id: mid, score: 5, created_at: "2026-09-20T11:00:00.000Z" }),
        ],
        null,
        {},
        null
    );
    assert.deepEqual(
        tree.map((t) => t.id),
        [high, mid, low]
    );
});

test("buildCommentTree floats the accepted answer above a higher-scoring reply", () => {
    const accepted = uuid(20);
    const popular = uuid(21);
    const tree = S.buildCommentTree(
        [row({ id: accepted, score: 2 }), row({ id: popular, score: 50 })],
        null,
        {},
        accepted
    );
    assert.equal(tree[0].id, accepted, "accepted answer leads");
    assert.equal(tree[0].is_accepted, true);
    assert.equal(tree[1].is_accepted, false);
});

test("buildCommentTree keeps an orphan as a root rather than dropping it", () => {
    // A root-page cut can leave a reply whose parent is not in the batch.
    // Losing a member's comment entirely would be worse than showing it high up.
    const orphan = uuid(30);
    const tree = S.buildCommentTree(
        [row({ id: orphan, parent_id: uuid(999), depth: 3 })],
        null,
        {},
        null
    );
    assert.equal(tree.length, 1);
    assert.equal(tree[0].id, orphan);
});

test("buildCommentTree blanks a deleted comment but keeps its replies", () => {
    const dead = uuid(40);
    const child = uuid(41);
    const tree = S.buildCommentTree(
        [
            row({ id: dead, is_deleted: true, body: "secret" }),
            row({ id: child, parent_id: dead, depth: 1, body: "still here" }),
        ],
        null,
        {},
        null
    );
    assert.equal(tree[0].body, "", "body withheld");
    assert.equal(tree[0].author, null, "author withheld");
    assert.equal(tree[0].replies[0].body, "still here", "reply survives");
});

test("buildCommentTree marks the viewer's own comments and votes", () => {
    const mine = uuid(50);
    const theirs = uuid(51);
    const tree = S.buildCommentTree(
        [row({ id: mine, user_id: "me" }), row({ id: theirs, user_id: "them" })],
        "me",
        { [mine]: 1, [theirs]: -1 },
        null
    );
    const byId = Object.fromEntries(tree.map((t) => [t.id, t]));
    assert.equal(byId[mine].is_author, true);
    assert.equal(byId[mine].user_vote, 1);
    assert.equal(byId[theirs].is_author, false);
    assert.equal(byId[theirs].user_vote, -1);
});

test("buildCommentTree signed out marks nothing as authored", () => {
    const id = uuid(60);
    const tree = S.buildCommentTree([row({ id, user_id: "someone" })], null, {}, null);
    assert.equal(tree[0].is_author, false);
    assert.equal(tree[0].user_vote, null);
});

test("buildCommentTree honours the New and Old sorts", () => {
    // Regression: the RPC uses `sort` only to choose WHICH roots to load, so
    // the tree builder re-sorting by score unconditionally made the New/Old
    // tabs look broken — same order as Top, every time.
    const oldest = uuid(70);
    const newest = uuid(71);
    const rows = [
        row({ id: oldest, score: 9, created_at: "2026-09-20T09:00:00.000Z" }),
        row({ id: newest, score: 1, created_at: "2026-09-20T18:00:00.000Z" }),
    ];

    assert.deepEqual(
        S.buildCommentTree(rows, null, {}, null, "new").map((c) => c.id),
        [newest, oldest],
        "new = newest first, regardless of score"
    );
    assert.deepEqual(
        S.buildCommentTree(rows, null, {}, null, "old").map((c) => c.id),
        [oldest, newest],
        "old = oldest first"
    );
    assert.deepEqual(
        S.buildCommentTree(rows, null, {}, null, "top").map((c) => c.id),
        [oldest, newest],
        "top = highest score first"
    );
    assert.deepEqual(
        S.buildCommentTree(rows, null, {}, null).map((c) => c.id),
        [oldest, newest],
        "defaults to top"
    );
});

test("the accepted answer leads even under New", () => {
    const accepted = uuid(80);
    const newer = uuid(81);
    const tree = S.buildCommentTree(
        [
            row({ id: accepted, score: 0, created_at: "2026-09-20T08:00:00.000Z" }),
            row({ id: newer, score: 0, created_at: "2026-09-20T20:00:00.000Z" }),
        ],
        null,
        {},
        accepted,
        "new"
    );
    assert.equal(tree[0].id, accepted, "endorsed answer is never buried by a sort");
});

// ─── normalizeLink ──────────────────────────────────────────────────────────

test("normalizeLink accepts http and https only", () => {
    assert.equal(S.normalizeLink("https://pubmed.ncbi.nlm.nih.gov/123"), "https://pubmed.ncbi.nlm.nih.gov/123");
    assert.ok(S.normalizeLink("http://example.com/a"));
});

test("normalizeLink rejects script and data URLs", () => {
    // These are the payloads that would otherwise reach an href attribute.
    assert.equal(S.normalizeLink("javascript:alert(1)"), null);
    assert.equal(S.normalizeLink("JavaScript:alert(1)"), null);
    assert.equal(S.normalizeLink("data:text/html,<script>alert(1)</script>"), null);
    assert.equal(S.normalizeLink("vbscript:msgbox(1)"), null);
    assert.equal(S.normalizeLink("file:///etc/passwd"), null);
});

test("normalizeLink rejects junk and non-strings", () => {
    assert.equal(S.normalizeLink("not a url"), null);
    assert.equal(S.normalizeLink(""), null);
    assert.equal(S.normalizeLink(null), null);
    assert.equal(S.normalizeLink(42), null);
});

// ─── normalizeTags ──────────────────────────────────────────────────────────

test("normalizeTags lowercases, hyphenates, dedupes and caps at 5", () => {
    const tags = S.normalizeTags([
        "  Warfarin ",
        "Drug Interactions",
        "warfarin",
        "CYP450",
        "a",
        "b",
        "c",
        "d",
    ]);
    assert.deepEqual(tags, ["warfarin", "drug-interactions", "cyp450", "a", "b"]);
});

test("normalizeTags drops non-strings and empties", () => {
    assert.deepEqual(S.normalizeTags(["ok", 5, null, "   ", {}]), ["ok"]);
    assert.deepEqual(S.normalizeTags("not an array"), []);
    assert.deepEqual(S.normalizeTags(undefined), []);
});

// ─── clampInt ───────────────────────────────────────────────────────────────

test("clampInt clamps, and falls back on junk", () => {
    assert.equal(S.clampInt("10", 1, 1, 50), 10);
    assert.equal(S.clampInt("9999", 1, 1, 50), 50, "clamped to max");
    assert.equal(S.clampInt("-4", 1, 1, 50), 1, "clamped to min");
    assert.equal(S.clampInt("abc", 7, 1, 50), 7, "fallback");
    assert.equal(S.clampInt(null, 7, 1, 50), 7);
});

// ─── isValidUUID ────────────────────────────────────────────────────────────

test("isValidUUID accepts a real id and rejects injection-shaped input", () => {
    assert.equal(S.isValidUUID("3f1b2c4d-5e6f-4a7b-8c9d-0e1f2a3b4c5d"), true);
    assert.equal(S.isValidUUID("' or 1=1 --"), false);
    assert.equal(S.isValidUUID("123"), false);
    assert.equal(S.isValidUUID(null), false);
    assert.equal(S.isValidUUID(undefined), false);
});

// ─── rangeCutoff ────────────────────────────────────────────────────────────

test("rangeCutoff returns null for all-time and a past ISO date otherwise", () => {
    assert.equal(S.rangeCutoff("all"), null);
    const day = S.rangeCutoff("day")!;
    assert.match(day, /^\d{4}-\d{2}-\d{2}T/);
    assert.ok(new Date(day).getTime() < Date.now(), "cutoff is in the past");

    const week = new Date(S.rangeCutoff("week")!).getTime();
    assert.ok(week < new Date(day).getTime(), "a week reaches further back than a day");
});

// ─── sort / kind guards ─────────────────────────────────────────────────────

test("feed and kind guards reject anything not on the allow-list", () => {
    assert.equal(S.isFeedSort("hot"), true);
    assert.equal(S.isFeedSort("rising"), true);
    assert.equal(S.isFeedSort("score desc; drop table"), false);
    assert.equal(S.isFeedSort(null), false);

    assert.equal(S.isPostKind("question"), true);
    assert.equal(S.isPostKind("admin"), false);

    assert.equal(S.isCommentSort("old"), true);
    assert.equal(S.isCommentSort("best"), false);
});

// ─── firstOf ────────────────────────────────────────────────────────────────

test("firstOf normalises PostgREST's object-or-array embed", () => {
    assert.deepEqual(S.firstOf({ a: 1 }), { a: 1 });
    assert.deepEqual(S.firstOf([{ a: 1 }, { a: 2 }]), { a: 1 });
    assert.equal(S.firstOf([]), null);
    assert.equal(S.firstOf(null), null);
});
