import type { Metadata } from "next";

import { film } from "@/content/film";
import { trailers } from "@/content/trailers";
import { pageMetadata } from "@/lib/seo";

/**
 * Same reason as the film route: `page.tsx` holds the open-trailer state, so
 * it is a client component and cannot export `metadata`.
 *
 * The count comes from `content/trailers.ts` rather than the word "three" —
 * a description that says three while the list says four is the kind of thing
 * nobody notices for a year.
 */
export const metadata: Metadata = pageMetadata({
  title: "Trailers",
  description: `${trailers.length} glimpses of ${film.title} — ${film.subtitle}. One story.`,
  path: "/trailers",
});

export default function TrailersLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
