"use client";

import { Clock, Play } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

import { GoldRule } from "@/components/motion/GoldRule";
import { Reveal } from "@/components/motion/Reveal";
import { SplitText } from "@/components/motion/SplitText";
import { TheaterShell } from "@/components/player/TheaterShell";
import { extractVideoId } from "@/lib/youtube";
import { trailers, type Trailer } from "@/content/trailers";
import { STAGGER } from "@/lib/motion";

/**
 * Trailers — three rows, one shared theater modal.
 *
 * // DECISION: page title is white, not gold. CLAUDE.md §3 is explicit that
 * the mockup's gold TRAILERS heading is the outlier being corrected here, not
 * a pattern — page titles are content, gold marks skeleton.
 */
export default function TrailersPage() {
  const [open, setOpen] = useState<Trailer | null>(null);

  /**
   * Trailers whose YouTube thumbnail came back 404.
   *
   * A video that is scheduled as a premiere and has not gone live yet has no
   * thumbnail on i.ytimg.com — both `maxresdefault` and `hqdefault` 404 until
   * the premiere runs. `next/image` then renders a 0×0 broken image inside
   * the frame and logs an error, so the row loses its poster and keeps the
   * play ring floating over nothing.
   *
   * The empty state below already exists for trailers with no URL at all;
   * this just makes a failed fetch reach it. Keyed off the actual network
   * result rather than a hardcoded "trailer 2 has no thumb", so it heals
   * itself the moment YouTube starts serving the frame — no edit, same as
   * `isSocialConfigured`.
   */
  const [posterFailed, setPosterFailed] = useState<ReadonlySet<string>>(
    () => new Set(),
  );

  return (
    <main>
      <section className="relative flex h-[38vh] min-h-[280px] items-center justify-center overflow-hidden">
        <div className="relative z-10 px-6 text-center">
          <SplitText
            as="h1"
            text="Trailers"
            trim={0.16}
            trigger="mount"
            className="font-display text-display-lg text-hi uppercase"
          />
          <div className="mt-6 flex justify-center">
            <GoldRule variant="center" width={140} />
          </div>
          <Reveal delay={0.2}>
            <p className="font-eyebrow text-eyebrow-sm text-hi mt-6 uppercase">
              Three Glimpses. One Story.
            </p>
          </Reveal>
        </div>
      </section>

      <section className="mx-auto max-w-4xl divide-y divide-white/10 border-t border-white/10 px-6 sm:px-10">
        {trailers.map((trailer, i) => {
          const videoId = extractVideoId(trailer.url);
          const poster = posterFailed.has(trailer.id)
            ? null
            : (trailer.poster ??
              (videoId
                ? `https://i.ytimg.com/vi/${videoId}/hqdefault.jpg`
                : null));

          return (
            <Reveal key={trailer.id} delay={i * STAGGER.children}>
              <button
                type="button"
                onClick={() => setOpen(trailer)}
                className="group/row flex w-full flex-col gap-5 py-10 text-left sm:flex-row sm:items-center sm:gap-8"
              >
                <span className="border-hairline group-hover/row:border-gold-dim/50 relative aspect-video w-full shrink-0 overflow-hidden rounded-md border transition-colors sm:w-72">
                  {poster ? (
                    <Image
                      src={poster}
                      alt=""
                      fill
                      sizes="(max-width: 640px) 100vw, 288px"
                      className="ease-cinema dur-slow object-cover transition-transform group-hover/row:scale-[1.03]"
                      onError={() =>
                        setPosterFailed((prev) => {
                          if (prev.has(trailer.id)) return prev;
                          const next = new Set(prev);
                          next.add(trailer.id);
                          return next;
                        })
                      }
                    />
                  ) : (
                    <span className="bg-surface-2 absolute inset-0" />
                  )}
                  <span aria-hidden="true" className="absolute inset-0 bg-black/25" />
                  {/* White ring, white triangle — withheld list. */}
                  <span className="border-hi/90 ease-cinema dur-base absolute top-1/2 left-1/2 flex size-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border-2 bg-black/30 backdrop-blur-sm transition-transform group-hover/row:scale-110">
                    <Play className="text-hi ml-0.5 size-5 fill-current" aria-hidden="true" />
                  </span>
                </span>

                <span className="min-w-0 flex-1">
                  <span className="font-display text-nav-lg text-gold block uppercase">
                    {trailer.title}
                  </span>
                  <span className="mt-1 block h-px w-10 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
                  <span className="text-mid text-body-sm mt-3 block">
                    {trailer.tagline}
                  </span>
                  <span className="text-mid text-meta mt-3 flex items-center gap-1.5">
                    <Clock className="size-3.5" aria-hidden="true" />
                    {trailer.duration}
                  </span>
                </span>
              </button>
            </Reveal>
          );
        })}
      </section>

      <TheaterShell
        open={open !== null}
        onClose={() => setOpen(null)}
        url={open?.url ?? ""}
        title={open?.title ?? ""}
      />
    </main>
  );
}
