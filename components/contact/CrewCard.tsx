"use client";

import {
  Armchair,
  Box,
  Clapperboard,
  Film,
  House,
  Music,
  Pencil,
  Phone,
  Shirt,
  User,
  Video,
  Volume2,
} from "lucide-react";

import { GlassCard } from "@/components/ui/GlassCard";
import type { CrewMember } from "@/content/crew";

/**
 * One crew card: circular gold icon ring, role in gold, name, phone, and a
 * `tel:` call button.
 *
 * The ring rotates slowly on hover; the card lift and spotlight come from
 * `GlassCard`. Gold here is correct per CLAUDE.md §3 — the Contact mockup is
 * the densest gold page in the site, and crew roles and their icons are
 * explicitly on the "gold is used for" list.
 */

const ICONS = {
  armchair: Armchair,
  clapperboard: Clapperboard,
  video: Video,
  pencil: Pencil,
  film: Film,
  house: House,
  music: Music,
  shirt: Shirt,
  "volume-2": Volume2,
  box: Box,
  user: User,
} as const;

export function CrewCard({ member }: { member: CrewMember }) {
  const Icon = ICONS[member.icon];
  const callable = member.phone.length > 0;

  return (
    <GlassCard spotlight className="h-full">
      {/* Scaled up with the two-column grid — at three columns these cards
          were a thin strip down the middle of a 1440 page. */}
      <div className="flex items-center gap-5 p-6 sm:gap-6 sm:p-7">
        <span className="border-gold-dim/60 group-hover:border-gold ease-cinema dur-slow flex size-14 shrink-0 items-center justify-center rounded-full border transition-[transform,border-color] group-hover:rotate-180 motion-reduce:group-hover:rotate-0 sm:size-16">
          <Icon
            className="text-gold size-6 sm:size-7"
            strokeWidth={1.5}
            aria-hidden="true"
          />
        </span>

        <div className="min-w-0 flex-1">
          {/* Omitted entirely when there is no role, rather than rendered
              empty. A reserved-but-blank gold label reads as a rendering
              fault; an absent one just reads as a name. */}
          {member.role ? (
            <p className="font-eyebrow text-eyebrow-sm text-gold-bright uppercase">
              {member.role}
            </p>
          ) : null}
          {/* Not truncated: "Story, Screenplay, Direction & Editing" and
              "Varun R Yattinahalli" both overflow one line in the narrow
              column, and clipping a person's name to an ellipsis is worse
              than letting the card grow. `h-full` on the card keeps the row
              even. */}
          <p className={`text-hi text-body ${member.role ? "mt-1.5" : ""}`}>
            {member.name}
          </p>
          <p className="text-mid text-body-sm mt-1 truncate">
            {member.phoneDisplay}
          </p>
        </div>

        {callable ? (
          <a
            href={`tel:${member.phone}`}
            aria-label={`Call ${member.name}`}
            className="border-gold-dim/50 text-gold hover:border-gold hover:text-gold-bright ease-cinema dur-fast flex size-11 shrink-0 items-center justify-center rounded-full border transition-colors sm:size-12"
          >
            <Phone className="size-4 sm:size-5" strokeWidth={1.75} aria-hidden="true" />
          </a>
        ) : (
          <span
            aria-hidden="true"
            title="Number not yet published"
            className="border-hairline text-low flex size-10 shrink-0 items-center justify-center rounded-full border opacity-40"
          >
            <Phone className="size-4" strokeWidth={1.75} />
          </span>
        )}
      </div>
    </GlassCard>
  );
}

export default CrewCard;
