import Link from "next/link";

import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { Button } from "@/components/ui/button";

/** Target for the PageTransition demo. Deliberately plain. */
export default function RouteA() {
  return (
    <main className="mx-auto max-w-3xl px-6 py-32 sm:px-10">
      <p className="font-eyebrow text-eyebrow-sm text-low uppercase">Route A</p>
      <SplitText
        as="h1"
        text="Arrived"
        className="font-display text-display-lg text-hi mt-6 uppercase"
        trigger="mount"
      />
      <GoldRule className="mt-7" />
      <Reveal delay={0.2}>
        <p className="text-mid text-body-lg mt-8">
          The page rose 8px and faded in. The gold line crossed the top edge.
          Nothing covered the content and nothing had to be waited out.
        </p>
      </Reveal>
      <div className="mt-12 flex gap-4">
        <Link href="/kitchen-sink/b">
          <Button variant="outline">Route B</Button>
        </Link>
        <Link href="/kitchen-sink">
          <Button variant="ghost">Back to primitives</Button>
        </Link>
      </div>
    </main>
  );
}
