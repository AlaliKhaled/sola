"use client";

import { useRef, useState, useLayoutEffect } from "react";
import dynamic from "next/dynamic";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SHOWCASE_FLAVORS } from "./showcaseData";

const ENTRANCE = 0.16;

// scroll runway (px) the sticky stage holds for — a fixed amount per flavour so
// the pacing feels identical regardless of how many cans are in the range
const N = SHOWCASE_FLAVORS.length;
const RUNWAY = Math.round(900 + (N - 1) * 760);

const ShowcaseStage = dynamic(() => import("./ShowcaseStage"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-xs tracking-[0.3em] text-cream/30">
        INITIALISING…
      </span>
    </div>
  ),
});

export default function FlavorShowcase() {
  const section = useRef<HTMLDivElement>(null);
  const pin = useRef<HTMLDivElement>(null);
  const progress = useRef(0); // shared with the R3F stage, no re-render
  const [active, setActive] = useState(0);
  const [started, setStarted] = useState(false); // hides the scroll cue once moving
  const [tall, setTall] = useState(true); // the scroll runway; off for reduced motion

  useLayoutEffect(() => {
    const trigger = section.current;
    const pinEl = pin.current;
    if (!trigger || !pinEl) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // no scroll scrubbing: settle on the first flavour, fully composed
      progress.current = ENTRANCE;
      setStarted(true); // nothing to scrub, so don't dangle a scroll prompt
      setTall(false); // collapse the runway to a single screen
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    const ctx = gsap.context(() => {
      // CSS `sticky` (on the stage) does the pinning — robust across rotation
      // and mobile toolbars. GSAP only reads scroll progress to drive the cans.
      ScrollTrigger.create({
        trigger,
        start: "top top",
        end: "bottom bottom",
        scrub: 1, // 1s catch-up: glides the cans instead of snapping to the wheel
        onUpdate: (self) => {
          const p = self.progress;
          progress.current = p;
          setStarted((s) => (s || p > 0.015 ? true : s));
          const f = Math.max(0, (p - ENTRANCE) / (1 - ENTRANCE)) * (N - 1);
          const next = Math.min(N - 1, Math.max(0, Math.round(f)));
          setActive((prev) => (next === prev ? prev : next));
        },
      });
    }, section);

    // Fonts / the lazy 3D canvas mount *after* this effect runs and shift layout.
    // Re-measure once those settle, and again on a real orientation (width) change.
    const refresh = () => ScrollTrigger.refresh();
    const tid = window.setTimeout(refresh, 600);
    window.addEventListener("load", refresh);
    if (document.fonts?.ready) document.fonts.ready.then(refresh);

    let lastWidth = window.innerWidth;
    let rotateTimer: ReturnType<typeof setTimeout>;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(rotateTimer);
      rotateTimer = setTimeout(refresh, 300);
    };
    window.addEventListener("resize", onResize);

    return () => {
      window.clearTimeout(tid);
      window.removeEventListener("load", refresh);
      window.removeEventListener("resize", onResize);
      clearTimeout(rotateTimer);
      ctx.revert();
    };
  }, []);

  const current = SHOWCASE_FLAVORS[active];

  return (
    <section
      ref={section}
      id="flavors"
      className="relative bg-espresso"
      style={{ height: tall ? `calc(100svh + ${RUNWAY}px)` : "100svh" }}
    >
      <div
        ref={pin}
        className="sticky top-0 flex h-[100svh] w-full flex-col overflow-hidden text-cream"
      >
        {/* soft warm vignette on the dark stage */}
        <div
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            background:
              "radial-gradient(120% 90% at 50% 18%, rgba(192,89,43,0.16), transparent 55%), radial-gradient(130% 100% at 50% 120%, rgba(0,0,0,0.55), transparent 60%)",
          }}
        />

        {/* section label */}
        <div className="relative z-10 px-6 pt-10 sm:px-10 sm:pt-14">
          <p className="flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-terracotta">
            <span className="h-px w-8 bg-terracotta" />
            THE RANGE
          </p>
          <h2 className="mt-4 max-w-md font-display text-3xl leading-tight sm:text-4xl">
            Six flavours. Scroll to meet each one.
          </h2>
          <p className="mt-3 flex items-center gap-2 text-xs text-cream/50">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4"
              aria-hidden="true"
            >
              <path
                d="M3 12a9 9 0 1 0 2.6-6.3M3 4v3.5h3.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            drag a can to spin it
          </p>
        </div>

        {/* the 3D stage fills the middle */}
        <div className="relative z-0 min-h-0 flex-1">
          <ShowcaseStage progress={progress} />
        </div>

        {/* scroll cue — tells first-time visitors this section is scroll-driven,
            then fades the moment they start scrolling through the range */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-28 z-10 flex flex-col items-center gap-2.5 transition-opacity duration-700 sm:bottom-36"
          style={{ opacity: started ? 0 : 1 }}
          aria-hidden="true"
        >
          <span className="text-[11px] font-medium tracking-[0.35em] text-cream/70">
            SCROLL TO EXPLORE
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-cream/30 bg-cream/5 backdrop-blur-sm"
            style={{ animation: "scroll-bob 1.6s ease-in-out infinite" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 text-cream"
            >
              <path d="M12 5v14M6 13l6 6 6-6" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        </div>

        {/* flavour caption — crossfades with the active can */}
        <div className="relative z-10 flex items-end justify-between px-6 pb-12 sm:px-10 sm:pb-16">
          <div className="max-w-md">
            <span className="text-xs font-medium tracking-[0.3em] text-terracotta">
              {current.tagline}
            </span>
            <h3 className="mt-3 whitespace-pre-line font-display text-3xl leading-[1.05] sm:text-5xl">
              {current.name}
            </h3>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-cream/70">
              {current.note}
            </p>
          </div>

          {/* progress dots */}
          <div className="flex flex-col items-end gap-3">
            {SHOWCASE_FLAVORS.map((f, i) => (
              <span
                key={f.src}
                className="flex items-center gap-3 text-xs tracking-[0.2em] transition-opacity duration-300"
                style={{ opacity: i === active ? 1 : 0.35 }}
              >
                <span className="text-cream/60">0{i + 1}</span>
                <span
                  className="h-2.5 w-2.5 rounded-full transition-transform duration-300"
                  style={{
                    backgroundColor: f.dot,
                    transform: i === active ? "scale(1.4)" : "scale(1)",
                  }}
                />
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
