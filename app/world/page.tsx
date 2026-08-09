import type { Metadata } from "next";

import { GoldRule } from "@/components/motion/GoldRule";
import { SplitText } from "@/components/motion/SplitText";
import { WorldReel } from "@/components/world/WorldReel";
import { pageMetadata } from "@/lib/seo";

export const metadata: Metadata = pageMetadata({
  title: "World of Vipāka",
  description:
    "Five pages of graphic-novel art telling the origin of Vipaaka — where it all began.",
  path: "/world",
});

/**
 * The five-page graphic novel. Header band is the page title and nothing else
 * — no `plate` backdrop, no eyebrow. The art in `WorldReel` carries its own
 * captions in the pixels and says everything the page has to say; anything
 * written above it is a second voice competing with the first.
 */
export default function WorldPage() {
  return (
    <main>
      <section className="relative flex h-[38vh] min-h-[280px] items-center justify-center overflow-hidden">
        <div className="relative z-10 px-6 text-center">
          <SplitText
            as="h1"
            text="World of Vipāka"
            trim={0.16}
            trigger="mount"
            className="font-display text-display-lg text-hi uppercase"
          />
          <div className="mt-6 flex justify-center">
            <GoldRule variant="center" width={140} />
          </div>
        </div>
      </section>

      <WorldReel />
    </main>
  );
}
