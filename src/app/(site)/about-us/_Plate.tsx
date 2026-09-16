import Image from "next/image";
import { cn } from "@/lib/utils";
import type { TeamMember } from "@/lib/team";

/**
 * A person's mark: their portrait where the roster has one, otherwise a
 * monogram on the brand gradient at the person's own angle (button-strength
 * scrim, so the white initials pass contrast). No hooks — used by both the
 * server-rendered leadership cards and the client flip cards.
 *
 * Photos are stored square (public/images/team/): a "portrait" is cropped to
 * head and shoulders and fills the plate; a "sticker" is the whole captioned
 * image, shown uncropped with no frame so its own outline is the edge.
 */
export function Plate({ member, size, className }: { member: TeamMember; size: number; className?: string }) {
    const box = cn("relative shrink-0 overflow-hidden rounded-2xl", className);
    if (member.photo) {
        const sticker = member.photoStyle === "sticker";
        return (
            <span
                className={cn(box, sticker ? "overflow-visible rounded-none" : "bg-white ring-1 ring-[#16181d]/10")}
                style={{ width: size, height: size }}
            >
                <Image
                    src={member.photo}
                    alt=""
                    fill
                    sizes={`${size * 2}px`}
                    className={sticker ? "object-contain" : "object-cover"}
                />
            </span>
        );
    }
    return (
        <span
            aria-hidden="true"
            className={cn(box, "flex items-center justify-center font-semibold tracking-wide text-white")}
            style={{
                width: size,
                height: size,
                fontSize: Math.round(size * 0.3),
                background: `linear-gradient(rgba(6,18,36,.30), rgba(6,18,36,.30)), linear-gradient(${member.plateAngle}deg, #1C7BD9 0%, #21B67A 100%)`,
            }}
        >
            {member.initials}
        </span>
    );
}
