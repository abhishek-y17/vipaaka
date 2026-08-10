import { redirect } from "next/navigation";

import { WHATSAPP_URL } from "@/content/crew";

/**
 * Masks the WhatsApp number in link previews.
 *
 * Pointing the icon straight at `wa.me/<number>` put a personal phone number
 * in the browser's status bar the moment anyone hovered it, in the raw HTML
 * for any scraper, and in the clipboard on "copy link address" — all before a
 * visitor had chosen to contact anyone. This route is what the icon points at,
 * so the preview reads as our own domain.
 *
 * It masks the preview, not the number: following the redirect still lands on
 * `wa.me`, which is the point. Anyone determined to read it can, in one more
 * step; the goal is that it is not published by default.
 *
 * ── Why 307 and not 308 ─────────────────────────────────────────────────────
 * 307 is temporary, so nothing caches it permanently. A 308 is written into
 * browser caches more or less forever, and if the number ever changes, every
 * visitor who had followed the old one would keep going there with no way for
 * us to correct it short of changing the path.
 *
 * ── Why a Route Handler and not a rewrite in next.config ────────────────────
 * The number stays in `content/crew.ts` with every other fact, and this file
 * imports it. A `next.config.ts` rewrite would put the phone number in build
 * configuration, away from the registry that is supposed to own it.
 *
 * The icon stays a real `<a href>`, so right-click "open in new tab",
 * middle-click and "copy link address" all behave normally — a JS-only
 * `onClick` would silently break every one of them.
 */

// Never prerendered into a static asset: this must run per request so the
// destination is read at request time rather than frozen at build.
export const dynamic = "force-dynamic";

export function GET(): never {
  // `redirect()` issues a 307 by default.
  redirect(WHATSAPP_URL);
}
