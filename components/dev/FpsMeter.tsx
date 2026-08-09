"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Dev-only frame counter for the kitchen sink. Samples `requestAnimationFrame`
 * over one-second windows and reports the mean, the worst frame in the window,
 * and a running count of long frames (>50ms — the point at which a dropped
 * frame becomes perceptible rather than merely measurable).
 *
 * It costs one rAF callback per frame, which is what it is measuring, so read
 * it as a floor rather than a precise figure. The authoritative numbers come
 * from a CDP trace with CPU throttling, not from this.
 */
export function FpsMeter() {
  const [fps, setFps] = useState(0);
  const [worst, setWorst] = useState(0);
  const [long, setLong] = useState(0);
  const frames = useRef(0);
  const worstFrame = useRef(0);
  const longFrames = useRef(0);
  const last = useRef(0);
  const windowStart = useRef(0);

  useEffect(() => {
    let raf = 0;
    const tick = (now: number) => {
      if (last.current) {
        const delta = now - last.current;
        if (delta > worstFrame.current) worstFrame.current = delta;
        if (delta > 50) longFrames.current += 1;
      }
      last.current = now;
      frames.current += 1;

      if (!windowStart.current) windowStart.current = now;
      if (now - windowStart.current >= 1000) {
        setFps(Math.round((frames.current * 1000) / (now - windowStart.current)));
        setWorst(Math.round(worstFrame.current));
        setLong(longFrames.current);
        frames.current = 0;
        worstFrame.current = 0;
        windowStart.current = now;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);

  const tone = fps >= 55 ? "text-gold" : fps >= 40 ? "text-hi" : "text-destructive";

  return (
    <div className="border-hairline bg-surface-2/90 text-meta fixed right-4 bottom-4 z-[400] rounded-md border px-3 py-2 font-mono backdrop-blur">
      <div className={tone}>{fps} fps</div>
      <div className="text-low">worst {worst}ms</div>
      <div className="text-low">long {long}</div>
    </div>
  );
}

export default FpsMeter;
