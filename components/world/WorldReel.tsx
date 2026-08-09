"use client";

import Image from "next/image";
import { useEffect, useRef } from "react";

import { WORLD_PAGE_SIZE, worldPages } from "@/content/world";
import { clamp, cn } from "@/lib/utils";

/**
 * One continuous vertical strip — five pages stacked flush, read by native
 * scroll. No pin, no scrub, no per-page beats.
 *
 * // DECISION: no parallax. It was offered as optional-if-cheap, and the only
 * way to drift a page inside a fixed box is to over-scale it and clip the
 * overflow — which crops the panel borders at the page edges and puts a
 * moving edge exactly where two pages meet. Seamlessness was the stated
 * priority, so the effect that costs it is the one that goes.
 *
 * // DECISION: `-mt-px` on pages 2–5. At `min(92vw, 1150px)` the 4:5 pages
 * land on fractional heights (1150 → 1437.5px), and browsers round those
 * independently, which is how a one-pixel light seam appears between two
 * images that are supposed to be one strip. A 1px overlap out of ~1437 is
 * invisible and makes the seam impossible rather than unlikely.
 *
 * Nothing here is motion, so there is nothing for `prefers-reduced-motion` to
 * suppress: the strip is static and the rail tracks scroll position the way a
 * scrollbar does. The reduced-motion page is the same page.
 */
export function WorldReel() {
  const stripRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLDivElement>(null);

  // Progress rail. Written straight to the DOM through a ref and throttled to
  // one rAF — routing scroll position through React state would re-render the
  // whole strip on every frame of every scroll.
  useEffect(() => {
    const strip = stripRef.current;
    const fill = fillRef.current;
    if (!strip || !fill) return;

    let frame = 0;

    const update = () => {
      frame = 0;
      const rect = strip.getBoundingClientRect();
      const scrollable = rect.height - window.innerHeight;
      const progress = scrollable > 0 ? clamp(-rect.top / scrollable, 0, 1) : 0;
      fill.style.transform = `scaleY(${progress})`;
    };

    const schedule = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);

    return () => {
      if (frame !== 0) cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
    };
  }, []);

  return (
    <section className="relative pb-24">
      {/* 1150px against 1600px of native art — a downscale, with headroom. */}
      <div ref={stripRef} className="mx-auto w-[min(92vw,1150px)]">
        {worldPages.map((page, i) => (
          <Image
            key={page.id}
            src={page.src}
            alt={`World of Vipāka, page ${page.page} of ${worldPages.length}`}
            width={WORLD_PAGE_SIZE.width}
            height={WORLD_PAGE_SIZE.height}
            // Pages 1–2 eager, 3–5 lazy. Measured, not assumed: on a 390–412px
            // viewport the header band is 38vh, so page 1 does not fill the
            // fold on its own and Lighthouse resolves page 2 as the LCP
            // element. Leaving it lazy put a 2.8s load-delay in front of the
            // largest paint. Only page 1 gets `priority` — page 2 should ride
            // along with the page, not compete with it for the preload slot.
            priority={i === 0}
            loading={i <= 1 ? "eager" : "lazy"}
            sizes="(max-width: 1250px) 92vw, 1150px"
            className={cn("block h-auto w-full", i > 0 && "-mt-px")}
          />
        ))}
      </div>

      {/* Progress rail — continuous fill. The only gold on this page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-y-0 right-1 z-10 w-[2px] md:right-5"
      >
        <div className="bg-gold-dim/25 sticky top-[50vh] h-[36vh] -translate-y-1/2 overflow-hidden rounded-full">
          <div
            ref={fillRef}
            className="bg-gold-bright h-full w-full origin-top rounded-full"
            style={{ transform: "scaleY(0)" }}
          />
        </div>
      </div>
    </section>
  );
}

export default WorldReel;
