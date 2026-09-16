/**
 * The PharmaWallah team roster — the single source of truth for /about-us.
 *
 * Moved here from `src/app/api/team-members.tsx` on 2026-09-16. It is a data
 * module, not a route handler, and `src/app/api/` already holds too many of
 * those (MEMORY.md gotcha 6). The old file's `imgSrc` field was dropped: it
 * pointed at three stock photographs (`/images/mentor/user{1,2,3}.png`) shared
 * between sixteen people, and the page has never rendered them. Monograms are
 * derived from the name instead — when real portraits exist, add a `photo`
 * field to ROSTER and render it in place of the plate.
 *
 * ROSTER is the part a maintainer edits: one line per person, the name and role
 * exactly as they should read on screen. Everything else the page shows — the
 * group each person is filed under, the monogram, the per-person plate angle,
 * every count — is DERIVED below, so adding a member is a one-line change and
 * no figure on the page can drift out of step with the list (gotcha 47).
 */

export type TeamGroupId =
    | "leadership"
    | "content"
    | "research"
    | "representatives"
    | "outreach"
    | "crew";

/** The default campus. Only people who study elsewhere need an override. */
const DEFAULT_CAMPUS = "University of Karachi";

type RosterEntry = { name: string; role: string; campus?: string };

/**
 * Every person, in the order they joined the project.
 *
 * Role strings are display copy AND the key the group mapping reads, so keep
 * them in the canonical casing used by ROLE_GROUP below — a role that is not in
 * that map still renders, filed under "Team", rather than disappearing.
 */
const ROSTER: RosterEntry[] = [
    { name: "Shayan Hussain", role: "Founder & Project Team Lead" },
    { name: "Umar Hayat", role: "Co-Founder & Lead Software Engineer", campus: "SMIT" },
    { name: "Abdul Wahab", role: "Co-Material Content Strategist", campus: "Hamdard University" },
    { name: "Jalal bin Junaid", role: "Co-Material Content Strategist", campus: "Hamdard University" },
    { name: "Jazil bin Kashef", role: "Co-Material Content Strategist" },
    { name: "Sumaiya Saeed", role: "Research & Content Collector" },
    { name: "Syed M. Ali", role: "Research & Content Collector" },
    { name: "Rumaisa Farooqui", role: "Research & Content Collector" },
    { name: "Misbah Yameen", role: "Research & Content Collector" },
    { name: "Saleem Ferozi", role: "Research & Content Collector" },
    { name: "Nawal Mirza", role: "Research & Content Collector" },
    { name: "Syed Tanzeel Ali", role: "Fourth Year Representative" },
    { name: "Romana Abbbas", role: "Third Year Representative" },
    { name: "Abdul Rafay", role: "Second Year Representative" },
    { name: "Muhammad Salman", role: "Info-Graphics Creator" },
    { name: "Muhammad Dayyan", role: "Social Media Manager" },
];

/**
 * How the work divides. The register renders groups in this order, and the
 * filter offers them in this order, so leadership reads first and the fallback
 * reads last.
 *
 * `blurb` is what the group actually does — it replaces the old page's
 * Production/Marketing split, which filed the founder and the research
 * collectors under one heading and said nothing about either.
 */
export const TEAM_GROUPS: { id: TeamGroupId; label: string; blurb: string }[] = [
    {
        id: "leadership",
        label: "Leadership",
        blurb: "Direction, engineering, and the last read before anything ships.",
    },
    {
        id: "content",
        label: "Content strategy",
        blurb: "Decide what a unit has to cover, and the order it makes sense in.",
    },
    {
        id: "research",
        label: "Research & content",
        blurb: "Work through the syllabus and the sources, and write what lands on the page.",
    },
    {
        id: "representatives",
        label: "Year representatives",
        blurb: "Carry back what each year is actually stuck on, paper by paper.",
    },
    {
        id: "outreach",
        label: "Design & outreach",
        blurb: "Infographics, and getting the work in front of the students who need it.",
    },
    { id: "crew", label: "Team", blurb: "Everyone else keeping the project moving." },
];

/** Role → group. Keyed lowercase so a casing slip in ROSTER still files correctly. */
const ROLE_GROUP: Record<string, TeamGroupId> = {
    "founder & project team lead": "leadership",
    "co-founder & lead software engineer": "leadership",
    "co-material content strategist": "content",
    "research & content collector": "research",
    "fourth year representative": "representatives",
    "third year representative": "representatives",
    "second year representative": "representatives",
    "info-graphics creator": "outreach",
    "social media manager": "outreach",
};

/** First letters of the first two words: "Jalal bin Junaid" → "JB". */
function initialsOf(name: string): string {
    return name
        .split(/\s+/)
        .filter(Boolean)
        .slice(0, 2)
        .map((word) => word[0])
        .join("")
        .toUpperCase();
}

/**
 * A stable gradient angle per person, so sixteen monogram plates are variations
 * of the brand rather than sixteen identical tiles. Derived from the name, so
 * it is the same on the server and in the browser (no hydration mismatch) and
 * the same on every visit. Held to 70°–200° — the range where the blue→green
 * gradient still reads as the brand.
 */
function plateAngleOf(name: string): number {
    let hash = 0;
    for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) % 9973;
    return 70 + (hash % 131);
}

export type TeamMember = {
    /** Stable, URL-safe: the anchor the hero's monogram wall scrolls to. */
    id: string;
    name: string;
    role: string;
    campus: string;
    group: TeamGroupId;
    initials: string;
    plateAngle: number;
};

const GROUP_ORDER = new Map(TEAM_GROUPS.map((g, i) => [g.id, i]));

/** "Jalal bin Junaid" → "jalal-bin-junaid". */
function idOf(name: string): string {
    return name
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/^-|-$/g, "");
}

/** The roster, enriched and sorted into group order. */
export const TEAM: TeamMember[] = ROSTER.map((entry) => ({
    id: idOf(entry.name),
    name: entry.name,
    role: entry.role,
    campus: entry.campus ?? DEFAULT_CAMPUS,
    group: ROLE_GROUP[entry.role.toLowerCase()] ?? "crew",
    initials: initialsOf(entry.name),
    plateAngle: plateAngleOf(entry.name),
})).sort((a, b) => (GROUP_ORDER.get(a.group) ?? 99) - (GROUP_ORDER.get(b.group) ?? 99));

/** Members of one group, in roster order. */
export function membersOf(group: TeamGroupId): TeamMember[] {
    return TEAM.filter((m) => m.group === group);
}

/**
 * The groups that actually have members, with their counts — what the filter
 * and the register headings read. A group with nobody in it never renders, so
 * the fallback "Team" heading only appears if a role stops being mapped.
 */
export const TEAM_SECTIONS = TEAM_GROUPS.map((group) => ({
    ...group,
    members: membersOf(group.id),
})).filter((section) => section.members.length > 0);

/** How many campuses the team spans — stated on the page, never typed by hand. */
export const TEAM_CAMPUS_COUNT = new Set(TEAM.map((m) => m.campus)).size;

/**
 * The distinct job titles on the roster, for the marquee band. Derived, so a
 * new role appears in the band the moment someone is added with it.
 */
export const TEAM_ROLES: string[] = Array.from(new Set(TEAM.map((m) => m.role)));
