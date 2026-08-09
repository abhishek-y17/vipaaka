import Link from "next/link";

import { VipakaWordmark } from "@/components/brand/VipakaWordmark";
import { Button } from "@/components/ui/button";
import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";

/**
 * Themed 404. A server component — nothing here needs scroll or pointer
 * state, so it doesn't pay for a client bundle. `Reveal` is a client
 * component but that's fine to render from a server tree; it just can't be
 * the file's own top-level directive.
 */
export default function NotFound() {
  return (
    <main className="flex min-h-dvh flex-col items-center justify-center px-6 pt-(--nav-h) text-center">
      <Reveal>
        <VipakaWordmark width={200} className="mx-auto opacity-80" />
      </Reveal>

      <Reveal delay={0.1}>
        <p className="font-eyebrow text-eyebrow text-mid mt-10 uppercase">
          Page Not Found
        </p>
      </Reveal>

      <Reveal delay={0.16}>
        <h1 className="font-display text-display-xl text-hi mt-4 uppercase">
          404
        </h1>
      </Reveal>

      <Reveal delay={0.22}>
        <div className="mt-6 flex justify-center">
          <GoldRule variant="center" width={140} />
        </div>
      </Reveal>

      <Reveal delay={0.28}>
        <p className="text-mid text-body-lg mt-6 max-w-md">
          This page hasn&apos;t ripened yet. Whatever you were looking for isn&apos;t
          here.
        </p>
      </Reveal>

      <Reveal delay={0.36}>
        <Button asChild className="mt-10">
          <Link href="/">Back to Home</Link>
        </Button>
      </Reveal>
    </main>
  );
}
