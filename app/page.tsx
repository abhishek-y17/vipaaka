import { VipakaWordmark } from "@/components/brand/VipakaWordmark";
import { Hero } from "@/components/home/Hero";
import { NavCards } from "@/components/home/NavCards";

/**
 * Home. `VipakaWordmark` is rendered here — a server component — and passed
 * into `Hero` (a client component) as a prop; see the note at the top of
 * Hero.tsx for why it cannot be imported directly from inside a "use client"
 * file. Title and description are the root layout's defaults; Home needs
 * nothing more specific.
 */
export default function HomePage() {
  return (
    <main>
      <Hero
        wordmark={
          <VipakaWordmark
            width="100%"
            className="drop-shadow-[0_2px_24px_rgba(0,0,0,0.5)]"
          />
        }
      />
      <NavCards />
    </main>
  );
}
