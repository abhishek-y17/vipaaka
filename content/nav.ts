/**
 * The navigation. Six items, in this order, at every breakpoint.
 *
 * CLAUDE.md §2 rule 7: do not add, remove, rename or reorder these. The mobile
 * overlay renders the same list — it is not a different menu.
 */

export type NavItem = {
  href: string;
  label: string;
};

// DECISION: Synopsis dropped from the nav — it is a section on /about now
// (CLAUDE.md §0 scope cuts) — but /world is a real new route (build
// instruction, not a mockup section), so the count is back to six. World
// sits right after About: it's origin/lore, a natural step between "the
// film" and "watch the trailers."
export const nav: readonly NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/world", label: "World" },
  { href: "/trailers", label: "Trailers" },
  { href: "/film", label: "Film" },
  { href: "/contact", label: "Contact" },
] as const;

/**
 * Exactly one item is active at a time — the sliding underline depends on it.
 * `/` only matches itself; every other route matches its own subtree so a
 * future `/trailers/announcement` still lights up "Trailers".
 */
export function isNavItemActive(pathname: string, href: string): boolean {
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}
