import Link from "next/link";

import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/button";

/** Target for the PageTransition demo. Deliberately plain. */
export default function RouteB() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-32 sm:px-10">
      <p className="font-eyebrow text-eyebrow-sm text-low uppercase">Route B</p>
      <div className="mt-6 text-center">
        <SplitText
          as="h1"
          text="And Back"
          trim={0.16}
          className="font-display text-display-lg text-hi uppercase"
          trigger="mount"
        />
      </div>
      <div className="mt-7 flex justify-center">
        <GoldRule variant="center" width={220} />
      </div>
      <Reveal delay={0.2}>
        <p className="text-mid text-body-lg mt-8 text-center">
          Same transition, centred heading, centre-variant rule. Navigate back
          and forth a few times and judge whether it still feels considered on
          the fifth click.
        </p>
      </Reveal>
      <div className="mt-12 flex justify-center gap-4">
        <Link href="/kitchen-sink/a">
          <Button variant="outline">Route A</Button>
        </Link>
        <Link href="/kitchen-sink">
          <Button variant="ghost">Back to primitives</Button>
        </Link>
      </div>
    </main>
  );
}
