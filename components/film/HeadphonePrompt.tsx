"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useCallback, useEffect, useRef, useState } from "react";

import {
  DUR,
  ease,
  motionDuration,
  useIsomorphicLayoutEffect,
  useReducedMotion,
} from "@/lib/motion";

/**
 * The one thing this page asks of a visitor before it starts.
 *
 * ── It never touches Supabase ───────────────────────────────────────────────
 * The "seen" flag is localStorage and nothing else. This must not call
 * `ensureAnonSession()`, must not import the Supabase client, and must not
 * cause a single auth request — every anonymous sign-in is a monthly active
 * user against a 50,000 free-tier cap, and a modal that fires on arrival would
 * bill every visitor who never touches the review form. Same category of flag
 * as the already-rated one in `lib/anon-id.ts`: a UI hint, not identity.
 *
 * ── One action ──────────────────────────────────────────────────────────────
 * No close cross, no "don't show again" checkbox. It is shown once per device
 * and dismissing it IS the "don't show again" — a checkbox next to a button
 * that already does that is a second decision for no reason. Escape does the
 * same thing as Okay, because a modal with one action should not have two
 * outcomes.
 *
 * ── Mounted, then shown ─────────────────────────────────────────────────────
 * `open` starts false and is set in a layout effect after reading
 * localStorage. Reading storage during render would both break prerendering
 * and produce a first client render that disagreed with the server's.
 */

const SEEN_KEY = "vipaka:headphones-seen";

function hasSeen(): boolean {
  if (typeof window === "undefined") return true;
  try {
    return window.localStorage.getItem(SEEN_KEY) === "1";
  } catch {
    // Private mode / storage disabled: show it, never crash the page.
    return false;
  }
}

function markSeen(): void {
  try {
    window.localStorage.setItem(SEEN_KEY, "1");
  } catch {
    /* nothing to do — worst case it appears again next visit */
  }
}

export type HeadphonePromptProps = {
  /** Called on dismiss, so the page can resume anything it paused. */
  onDismiss?: () => void;
  /** Called when it opens, so a playing video can be paused under it. */
  onOpen?: () => void;
};

export function HeadphonePrompt({ onDismiss, onOpen }: HeadphonePromptProps) {
  const reduced = useReducedMotion();
  const [open, setOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);
  const okRef = useRef<HTMLButtonElement>(null);
  const openerRef = useRef<Element | null>(null);

  useIsomorphicLayoutEffect(() => {
    if (hasSeen()) return;
    openerRef.current = document.activeElement;
    setOpen(true);
    onOpen?.();
    // Deliberately mount-only: this is a once-per-device prompt, not a
    // reactive dialog. Re-running it on a changed callback identity would
    // reopen it mid-session.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = useCallback(() => {
    markSeen();
    setOpen(false);
    onDismiss?.();
  }, [onDismiss]);

  // Focus trap, Escape, body scroll lock, focus restore.
  useEffect(() => {
    if (!open) return;

    okRef.current?.focus();
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        dismiss();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = panelRef.current?.querySelectorAll<HTMLElement>(
        "button:not([disabled]), a[href]",
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
  }, [open, dismiss]);

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-[220] flex items-center justify-center px-6"
          initial={reduced ? { opacity: 1 } : { opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: motionDuration(DUR.base, reduced) }}
        >
          {/* Backdrop. Blurs the page rather than blacking it out — the film
              stays visible behind, which is what the line is about. */}
          <div
            aria-hidden="true"
            className="absolute inset-0 bg-black/70 backdrop-blur-md"
            onClick={dismiss}
          />

          <motion.div
            ref={panelRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="headphone-prompt-copy"
            className="glass border-gold-dim/50 relative w-full max-w-md rounded-lg border px-8 py-10 text-center sm:px-10 sm:py-12"
            initial={
              reduced ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.96 }
            }
            animate={{ opacity: 1, scale: 1 }}
            exit={reduced ? { opacity: 0 } : { opacity: 0, scale: 0.98 }}
            transition={{
              // Slow on purpose: a hush, not an alert.
              duration: motionDuration(DUR.slow, reduced),
              ease: ease("glass"),
            }}
          >
            <p
              id="headphone-prompt-copy"
              className="font-display text-display-sm text-hi leading-relaxed"
            >
              Every sound has a consequence. Use earphones to follow every
              thread.
            </p>

            <button
              ref={okRef}
              type="button"
              onClick={dismiss}
              className="bg-gold-bright text-void font-eyebrow text-eyebrow ease-cinema dur-base hover:bg-gold focus-visible:ring-gold-bright focus-visible:ring-offset-void mt-8 rounded-md px-10 py-3 uppercase transition-colors focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:outline-none"
            >
              Okay
            </button>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}

export default HeadphonePrompt;
