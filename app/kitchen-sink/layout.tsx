import type { Metadata } from "next";
import Link from "next/link";

import { VipakaWordmark } from "@/components/brand/VipakaWordmark";
import { FpsMeter } from "@/components/dev/FpsMeter";
import { PageTransition } from "@/components/layout/PageTransition";
import { Preloader } from "@/components/ui/Preloader";

export const metadata: Metadata = {
  title: "Kitchen sink",
  description: "Phase 1 motion primitives.",
  robots: { index: false, follow: false },
};

/**
 * Dev-only shell. `PageTransition` and `Preloader` are mounted here rather
 * than in the root layout because wiring them into the app is Phase 2 — but
 * both need a real route tree to be judged honestly, and a simulated
 * "navigation" driven by a state toggle would prove nothing about how they
 * behave against the App Router.
 */
const ROUTES = [
  { href: "/kitchen-sink", label: "Primitives" },
  { href: "/kitchen-sink/a", label: "Route A" },
  { href: "/kitchen-sink/b", label: "Route B" },
];

export default function KitchenSinkLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Preloader mark={<VipakaWordmark className="w-[240px] sm:w-[320px]" />} />

      <nav className="border-hairline bg-void/80 sticky top-0 z-[300] border-b backdrop-blur">
        <ul className="mx-auto flex max-w-5xl gap-6 px-6 py-4">
          {ROUTES.map((route) => (
            <li key={route.href}>
              <Link
                href={route.href}
                className="font-eyebrow text-eyebrow-sm text-low hover:text-gold ease-cinema dur-fast uppercase transition-colors"
              >
                {route.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <PageTransition>{children}</PageTransition>

      <FpsMeter />
    </>
  );
}
