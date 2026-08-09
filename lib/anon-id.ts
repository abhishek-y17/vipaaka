/**
 * The one thing localStorage is allowed to hold for reviews (CLAUDE.md §2
 * rule 2): a UI flag for "this device already rated `target`", so the form
 * can open collapsed/pre-filled. Never consulted for identity or RLS — that's
 * `auth.uid()`, via the Supabase session, exclusively.
 */
const PREFIX = "vipaka:rated:";

export function hasRated(target: string): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(PREFIX + target) === "1";
}

export function markRated(target: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(PREFIX + target, "1");
}

/** Rollback path for the optimistic submit — the insert failed, so the flag lied. */
export function clearRated(target: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(PREFIX + target);
}
