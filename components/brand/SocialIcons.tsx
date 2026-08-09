import { Mail } from "lucide-react";

import type { SocialLink } from "@/content/crew";

/**
 * Social glyphs.
 *
 * **Lucide no longer ships brand icons** — it removed them entirely, so
 * `Instagram`, `Youtube` and anything WhatsApp-shaped simply do not exist in
 * the package (6,059 exports, zero brand marks). Only `Mail` is available.
 *
 * The three below are therefore drawn here, deliberately in Lucide's own
 * language — 24×24 viewBox, 1.5–2px stroke, round caps and joins — so the row
 * reads as one set rather than three logos and an icon. The Contact mockup
 * draws them the same way: line art, not filled brand marks.
 *
 * Substituting a generic Lucide icon (a camera for Instagram, a play button
 * for YouTube, a speech bubble for WhatsApp) was the alternative. It would be
 * immediately legible as a placeholder, which is worse than drawing them.
 */

type IconProps = {
  className?: string;
};

const STROKE = {
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.75,
  strokeLinecap: "round",
  strokeLinejoin: "round",
} as const;

function InstagramGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE}>
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="3.8" />
      <circle cx="17.2" cy="6.8" r="0.6" fill="currentColor" stroke="none" />
    </svg>
  );
}

function YoutubeGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE}>
      <rect x="2.5" y="5.5" width="19" height="13" rx="4" />
      <path d="M10.2 9.4v5.2l4.4-2.6z" />
    </svg>
  );
}

function WhatsappGlyph({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" {...STROKE}>
      {/* Bubble with the tail at the lower left, as the mark has it. */}
      <path d="M20.5 11.6a8.4 8.4 0 0 1-12.4 7.4L3.5 20.5l1.5-4.6a8.4 8.4 0 1 1 15.5-4.3z" />
      {/* Handset. */}
      <path d="M9.4 9.1c0 3 2.4 5.4 5.4 5.4a.9.9 0 0 0 .9-.7l.2-.9a.7.7 0 0 0-.5-.8l-1.3-.4a.7.7 0 0 0-.7.2l-.4.4a6.6 6.6 0 0 1-2-2l.4-.4a.7.7 0 0 0 .2-.7l-.4-1.3a.7.7 0 0 0-.8-.5l-.9.2a.9.9 0 0 0-.7.9z" />
    </svg>
  );
}

function MailGlyph({ className }: IconProps) {
  return <Mail className={className} strokeWidth={1.75} aria-hidden="true" />;
}

export const SOCIAL_GLYPH: Record<
  SocialLink["id"],
  (props: IconProps) => React.ReactElement
> = {
  instagram: InstagramGlyph,
  email: MailGlyph,
  youtube: YoutubeGlyph,
  whatsapp: WhatsappGlyph,
};
