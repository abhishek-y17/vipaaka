import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Reveal } from "@/components/motion/Reveal";
import { GlassCard } from "@/components/ui/GlassCard";
import { homeNavCards } from "@/content/home";
import { STAGGER } from "@/lib/motion";

/**
 * The five destination cards below the hero. This is the Phase 1 gold-budget
 * decision, applied for real:
 *
 * **Monochrome at rest, gold as wayfinding, gold-as-response on hover.** The
 * card itself never carries gold at rest — its border is `.glass`'s ordinary
 * translucent hairline, same as any other glass surface. The one gold thing
 * present before any interaction is the destination *word*, matching the
 * mobile mockup, where all five destination labels sit in gold simultaneously.
 * Five short gold words is a trivial gold area next to five gold borders —
 * this is why the ratio holds. Hover escalates what is already there: the
 * label brightens, the arrow warms and translates, the border warms, the
 * spotlight glow arrives. Nothing here adds a gold element that wasn't
 * already present in some form at rest.
 *
 * A server component — `GlassCard` and `Reveal` are the only client code this
 * needs, and they ship themselves.
 */
export function NavCards() {
  return (
    <section className="relative px-6 py-24 sm:px-10 sm:py-28">
      <div className="mx-auto grid max-w-6xl gap-5 sm:grid-cols-2 lg:grid-cols-5">
        {homeNavCards.map((card, i) => (
          <Reveal key={card.href} delay={i * STAGGER.children}>
            <Link href={card.href} className="block h-full">
              <GlassCard spotlight className="hover:border-gold-dim/50 h-full">
                <div className="flex h-full flex-col gap-6 p-6">
                  <div className="flex items-center justify-between">
                    <span className="font-display text-nav text-gold group-hover:text-gold-bright ease-cinema dur-fast uppercase transition-colors">
                      {card.label}
                    </span>
                    <ArrowRight
                      className="text-hi group-hover:text-gold-bright ease-cinema dur-fast size-4 transition-all group-hover:translate-x-1"
                      strokeWidth={1.75}
                      aria-hidden="true"
                    />
                  </div>
                  <p className="text-mid text-body-sm">{card.prompt}</p>
                </div>
              </GlassCard>
            </Link>
          </Reveal>
        ))}
      </div>
    </section>
  );
}

export default NavCards;
