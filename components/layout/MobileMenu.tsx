"use client";

import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef } from "react";

import { DatadorksMark } from "@/components/brand/DatadorksMark";
import { SOCIAL_GLYPH } from "@/components/brand/SocialIcons";
import { isSocialConfigured, socials } from "@/content/crew";
import { isNavItemActive, nav } from "@/content/nav";
import {
  DUR,
  STAGGER,
  ease,
  motionDuration,
  useReducedMotion,
} from "@/lib/motion";
import { cn } from "@/lib/utils";

/**
 * Full-screen glass overlay for narrow viewports. Cinzel throughout, the same
 * face as the desktop nav (CLAUDE.md §3) — this is the same navigation in a
 * different shape, not a second menu.
 *
 * Four behaviours a menu overlay is expected to have, all present:
 *   · **Focus trap** — Tab/Shift+Tab cycle within the panel only.
 *   · **Escape closes it.**
 *   · **Route change closes it** — a link tap navigates and dismisses in one
 *     motion rather than leaving the overlay up over the new page.
 *   · **Body scroll is locked** while open, and released on every exit path
 *     (close, Escape, route change, unmount) so a killed animation can never
 *     leave scrolling disabled.
 *
 * `scrollbar-gutter: stable` on `html` (globals.css) means locking scroll does
 * not also shift the page width — the gutter is already reserved.
 */

export type MobileMenuProps = {
  open: boolean;
  onClose: () => void;
};

export function MobileMenu({ open, onClose }: MobileMenuProps) {
  const pathname = usePathname();
  const reduced = useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);

  // Route change closes the menu. Guarded so mount does not fire it.
  const mounted = useRef(false);
  useEffect(() => {
    if (!mounted.current) {
      mounted.current = true;
      return;
    }
    onClose();
    // Deliberately pathname-only: closing on every render of onClose would
    // fight the parent's own state update.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pathname]);

  useEffect(() => {
    if (!open) return;

    openerRef.current = document.activeElement;
    closeRef.current?.focus();

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = previousOverflow;
      if (openerRef.current instanceof HTMLElement) openerRef.current.focus();
    };
  }, [open, onClose]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          id="mobile-menu"
          ref={panelRef}
          role="dialog"
          aria-modal="true"
          aria-label="Menu"
          className="glass fixed inset-0 z-[100] flex flex-col rounded-none border-none md:hidden"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration(DUR.fast, reduced) }}
        >
          <div className="flex h-(--nav-h) items-center justify-between px-6">
            <DatadorksMark />
            <button
              ref={closeRef}
              type="button"
              onClick={onClose}
              aria-label="Close menu"
              className="text-hi hover:text-gold ease-cinema dur-fast -mr-2 flex size-10 items-center justify-center rounded-md transition-colors"
            >
              <X className="size-6" strokeWidth={1.75} aria-hidden="true" />
            </button>
          </div>

          <nav aria-label="Primary" className="flex flex-1 flex-col justify-center px-8">
            <ul className="space-y-2">
              {nav.map((item, i) => {
                const active = isNavItemActive(pathname, item.href);
                return (
                  <motion.li
                    key={item.href}
                    initial={reduced ? { opacity: 1, x: 0 } : { opacity: 0, x: -16 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{
                      duration: motionDuration(DUR.base, reduced),
                      delay: motionDuration(0.08 + i * STAGGER.menu, reduced),
                      ease: ease("cinema"),
                    }}
                  >
                    <Link
                      href={item.href}
                      aria-current={active ? "page" : undefined}
                      className={cn(
                        "font-display text-nav-lg block py-2 uppercase",
                        active ? "text-gold" : "text-hi",
                      )}
                    >
                      {item.label}
                    </Link>
                  </motion.li>
                );
              })}
            </ul>
          </nav>

          <div className="border-hairline flex items-center justify-center gap-5 border-t px-8 py-8">
            {socials.map((social) => {
              const Glyph = SOCIAL_GLYPH[social.id];
              // Inert until a real handle lands — see Footer.tsx. Keeping it
              // out of the focus trap matters more here than anywhere: this
              // menu cycles Tab, and four dead stops is four wasted presses.
              if (!isSocialConfigured(social.href)) {
                return (
                  <span
                    key={social.id}
                    aria-hidden="true"
                    className="border-hairline/60 text-low/50 flex size-16 items-center justify-center rounded-full border"
                  >
                    <Glyph className="size-6" />
                  </span>
                );
              }
              return (
                <a
                  key={social.id}
                  href={social.href}
                  aria-label={social.label}
                  target={social.id === "email" ? undefined : "_blank"}
                  rel={social.id === "email" ? undefined : "noopener noreferrer"}
                  className="border-hairline text-hi hover:border-gold-dim ease-cinema dur-fast flex size-16 items-center justify-center rounded-full border transition-colors"
                >
                  <Glyph className="size-6" />
                </a>
              );
            })}
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default MobileMenu;
