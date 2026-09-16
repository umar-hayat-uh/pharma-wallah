/**
 * The PharmaWallah team roster — the single source of truth for /about-us.
 *
 * Moved here from `src/app/api/team-members.tsx` on 2026-09-16. It is a data
 * module, not a route handler, and `src/app/api/` already holds too many of
 * those (MEMORY.md gotcha 6). The old file's `imgSrc` field was dropped: it
 * pointed at three stock photographs (`/images/mentor/user{1,2,3}.png`) shared
 * between sixteen people, and the page has never rendered them. Monograms are
 * derived from the name instead; a person with a real portrait gets a `photo`
 * (under `public/images/team/`), which the card shows in place of the plate.
 *
 * ROSTER is the part a maintainer edits: one line per person, the name and role
 * exactly as they should read on screen. Everything else the page shows — the
 * group each person is filed under, the monogram, the per-person plate angle,
 * every count — is DERIVED below, so adding a member is a one-line change and
 * no figure on the page can drift out of step with the list (gotcha 47).
 */

export type TeamGroupId =
    | "leadership"
    | "research"
    | "representatives"
    | "marketing"
    | "crew";

/** The default campus. Only people who study elsewhere need an override. */
const DEFAULT_CAMPUS = "University of Karachi";

type RosterEntry = {
    name: string;
    role: string;
    campus?: string;
    /** A portrait under `public/images/team/`, shown in place of the monogram plate. */
    photo?: string;
    /**
     * "portrait" (default): a head-and-shoulders square, cropped to fill.
     * "sticker": a whole captioned sticker, shown uncropped and larger so the
     * caption stays readable (user request, 2026-09-16).
     */
    photoStyle?: "portrait" | "sticker";
};

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
    { name: "Sumaiya Saeed", role: "Research & Content Collector" },
    { name: "Syed M. Ali", role: "Research & Content Collector" },
    { name: "Rumaisa Farooqui", role: "Research & Content Collector" },
    { name: "Misbah Yameen", role: "Research & Content Collector" },
    { name: "Saleem Ferozi", role: "Research & Content Collector" },
    { name: "Nawal Mirza", role: "Research & Content Collector" },
    { name: "Syed Tanzeel Ali", role: "Fourth Year Representative" },
    { name: "Abdul Rafay", role: "Second Year Representative" },
    { name: "Muhammad Salman", role: "Info-Graphics Creator" },
    { name: "Muhammad Dayyan", role: "Social Media Manager" },
    // Added 2026-09-16 at the user's request. No campus was given for these
    // six, so they take the default like everyone else; the page does not
    // print campuses.
    { name: "Kinza Zafar", role: "Digital Marketing Ambassador" },
    { name: "Farwah Perwaiz", role: "Digital Marketing Ambassador" },
    { name: "Syeda Khoula", role: "Research & Content Creator" },
    { name: "Neha Shah", role: "Research & Content Creator" },
    { name: "Kashef Latif", role: "Research & Content Creator" },
    { name: "Saman Hamza", role: "Research & Content Creator" },
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
        id: "research",
        label: "Research & content creation",
        blurb: "Work through the syllabus and the sources, and write what lands on the page.",
    },
    {
        id: "representatives",
        label: "Year representatives",
        blurb: "Carry back what each year is actually stuck on, paper by paper.",
    },
    {
        // One section since 2026-09-16 (user request): design, social media and
        // the ambassadors were "Design & outreach" + "Digital marketing ambassadors".
        id: "marketing",
        label: "Marketing",
        blurb: "Infographics, social channels and ambassadors — getting the work in front of the students who need it.",
    },
    { id: "crew", label: "Team", blurb: "Everyone else keeping the project moving." },
];

/** Role → group. Keyed lowercase so a casing slip in ROSTER still files correctly. */
const ROLE_GROUP: Record<string, TeamGroupId> = {
    "founder & project team lead": "leadership",
    "co-founder & lead software engineer": "leadership",
    "research & content collector": "research",
    "fourth year representative": "representatives",
    "third year representative": "representatives",
    "second year representative": "representatives",
    "info-graphics creator": "marketing",
    "social media manager": "marketing",
    "research & content creator": "research",
    "digital marketing ambassador": "marketing",
};

/**
 * The line under each person's name on the team cards: what the role does on
 * this project. It describes the job, not the person — there are no verified
 * bios, and a made-up one per student would be worse than none. A role with no
 * entry here gets the group's blurb instead, so no card is ever blank.
 */
const ROLE_NOTE: Record<string, string> = {
    "founder & project team lead":
        "Started PharmaWallah, sets its direction, and gives everything a last read before it goes live.",
    "co-founder & lead software engineer":
        "Builds and runs the platform — the calculators, the course reader, the labs and the Android app.",
    "research & content collector":
        "Gathers notes, references and past-paper material, and checks them before they become a lesson.",
    "research & content creator":
        "Researches topics from the syllabus and writes them up as clear lesson content and questions.",
    "fourth year representative":
        "Speaks for final-year students — which papers, practicals and topics they need help with most.",
    "third year representative":
        "Brings the third year's questions and weak spots back to the team, subject by subject.",
    "second year representative":
        "Keeps the second year's courses and practicals on the list, and tells us what is missing.",
    "info-graphics creator":
        "Turns dense pharmacology and chemistry into diagrams and graphics that read at a glance.",
    "social media manager":
        "Runs PharmaWallah's social channels, so students hear when something new is published.",
    "digital marketing ambassador":
        "Represents PharmaWallah online and on campus, growing the community that uses it.",
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
    photo?: string;
    photoStyle: "portrait" | "sticker";
    /** What the role does here — the card's description line. */
    description: string;
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
const GROUP_BLURB = new Map(TEAM_GROUPS.map((g) => [g.id, g.blurb]));

export const TEAM: TeamMember[] = ROSTER.map((entry) => {
    const key = entry.role.toLowerCase();
    const group = ROLE_GROUP[key] ?? "crew";
    return {
        id: idOf(entry.name),
        name: entry.name,
        role: entry.role,
        campus: entry.campus ?? DEFAULT_CAMPUS,
        group,
        photo: entry.photo,
        photoStyle: entry.photoStyle ?? "portrait",
        description: ROLE_NOTE[key] ?? GROUP_BLURB.get(group) ?? "",
        initials: initialsOf(entry.name),
        plateAngle: plateAngleOf(entry.name),
    };
}).sort((a, b) => (GROUP_ORDER.get(a.group) ?? 99) - (GROUP_ORDER.get(b.group) ?? 99));

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
