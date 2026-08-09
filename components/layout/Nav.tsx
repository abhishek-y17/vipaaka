"use client";

import { motion } from "framer-motion";
import { Menu } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";

import { DatadorksMark } from "@/components/brand/DatadorksMark";
import { isNavItemActive, nav } from "@/content/nav";
import { DUR, ease, useReducedMotion } from "@/lib/motion";
import { cn } from "@/lib/utils";

import { MobileMenu } from "./MobileMenu";

/**
 * The app shell's navigation. Fixed, transparent over the hero, glass once you
 * have scrolled past it.
 *
 * ── The underline slides, it does not cross-fade ────────────────────────────
 * One `motion.span` with a shared `layoutId` exists in the tree at a time —
 * rendered inside whichever link is active. When the route changes, Framer
 * sees the same `layoutId` at a new position and interpolates between the two
 * rects, so the rule travels along the nav and resizes to the new word. This
 * is the most-seen animation on the site and the difference between it and a
 * fade is most of what makes the shell feel built rather than assembled.
 *
 * It only works while exactly one item is active, which is what
 * `isNavItemActive` guarantees.
 *
 * ── Why the glass transition cannot shift layout ────────────────────────────
 * Two details, both of which are the usual way this goes wrong:
 *
 *   · The bottom hairline is **always rendered** and only its colour changes.
 *     Adding a 1px border on scroll would grow the bar by 1px and nudge every
 *     item in it down — a jump precisely when the eye is on the nav.
 *   · The glass layer is **always mounted** and only its opacity changes.
 *     Mounting a `backdrop-filter` element mid-scroll costs a repaint at the
 *     exact moment of the threshold, which reads as a hitch every time you
 *     cross 80px.
 *
 * The threshold has hysteresis — on at 80px, off at 64px — so a scroll that
 * rests near the boundary cannot strobe the background on and off.
 */

const SCROLL_ON = 80;
const SCROLL_OFF = 64;

/** The §4 glass recipe, tuned for a bar: a dark tint under the sheen so text
 *  stays legible over a bright frame of the hero. */
const NAV_GLASS: React.CSSProperties = {
  background:
    "linear-gradient(180deg, rgb(255 255 255 / 0.05), rgb(255 255 255 / 0.02)), rgb(3 3 4 / 0.62)",
  backdropFilter: "blur(var(--glass-blur)) saturate(140%)",
  WebkitBackdropFilter: "blur(var(--glass-blur)) saturate(140%)",
  boxShadow: "inset 0 1px 0 rgb(255 255 255 / 0.06)",
};

export function Nav() {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let ticking = false;

    const read = () => {
      ticking = false;
      const y = window.scrollY;
      setScrolled((was) => {
        // Hysteresis: only flip when the relevant edge is crossed.
        if (!was && y > SCROLL_ON) return true;
        if (was && y < SCROLL_OFF) return false;
        return was;
      });
    };

    const onScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(read);
    };

    // Setting state to its current value bails out of the render, so this
    // listener costs one rAF per scroll burst and nothing else.
    window.addEventListener("scroll", onScroll, { passive: true });
    read();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <header className="fixed inset-x-0 top-0 z-50">
        <div className="relative h-(--nav-h)">
          {/* Always mounted; only opacity changes. See the note above. */}
          <div
            aria-hidden="true"
            data-on={scrolled}
            className="ease-cinema dur-base absolute inset-0 opacity-0 transition-opacity data-[on=true]:opacity-100"
            style={NAV_GLASS}
          />
          {/* Always present; only colour changes, so the bar never grows. */}
          <div
            aria-hidden="true"
            data-on={scrolled}
            className="ease-cinema dur-base data-[on=true]:bg-hairline absolute inset-x-0 bottom-0 h-px bg-transparent transition-colors"
          />

          <nav
            aria-label="Primary"
            className="relative mx-auto flex h-full max-w-7xl items-center justify-between px-6 sm:px-8"
          >
            <Link
              href="/"
              className="ease-cinema dur-fast rounded-sm opacity-90 transition-opacity hover:opacity-100"
            >
              <DatadorksMark />
            </Link>

            <ul className="hidden items-center gap-9 md:flex">
              {nav.map((item) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "font-display text-nav ease-cinema dur-fast relative block py-1 transition-colors",
                        // text-gold-bright, not text-gold: this is small text
                        // (CLAUDE.md §3 — --gold is safe only at large sizes).
                        active ? "text-gold-bright" : "text-mid hover:text-hi",
                      )}
                    >
                      {item.label}
                      {active ? (
                        reduced ? (
                          <span className="bg-gold-bright absolute inset-x-0 -bottom-1.5 h-px" />
                        ) : (
                          <motion.span
                            layoutId="nav-underline"
                            className="bg-gold-bright absolute inset-x-0 -bottom-1.5 h-px"
                            transition={{
                              duration: DUR.base,
                              ease: ease("cinema"),
                            }}
                          />
                        )
                      ) : null}
                    </Link>
                  </li>
                );
              })}
            </ul>

            <button
              type="button"
              onClick={() => setMenuOpen(true)}
              aria-label="Open menu"
              aria-expanded={menuOpen}
              aria-controls="mobile-menu"
              className="text-hi ease-cinema dur-fast -mr-2 flex size-10 items-center justify-center rounded-md transition-colors hover:text-gold md:hidden"
            >
              <Menu className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </nav>
        </div>
      </header>

      <MobileMenu open={menuOpen} onClose={() => setMenuOpen(false)} />
    </>
  );
}

export default Nav;
