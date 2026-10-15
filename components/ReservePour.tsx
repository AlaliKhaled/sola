"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";

// Reserve: a tall scroll track with a CSS-sticky viewport (robust across
// orientation / mobile toolbars — far safer than JS pinning). GSAP only scrubs
// the pour's playhead and reveals the copy line by line as you scroll, and the
// pour wipes in with a creative entrance when the section arrives.

const INFO = [
  { k: "Botanicals", v: "Blood orange · rosemary · spring water" },
  { k: "Format", v: "Hand-numbered 275ml glass" },
  { k: "Tasting", v: "Bittersweet citrus, a whisper of herb" },
];

const SCRIM_DESKTOP =
  "linear-gradient(to left, rgba(246,239,227,0.92) 0%, rgba(246,239,227,0.62) 30%, rgba(246,239,227,0.16) 52%, rgba(246,239,227,0) 70%)";
const SCRIM_MOBILE =
  "linear-gradient(to top, rgba(246,239,227,0.94) 0%, rgba(246,239,227,0.64) 36%, rgba(246,239,227,0.16) 60%, rgba(246,239,227,0) 82%)";

export default function ReservePour() {
  const sectionRef = useRef<HTMLElement>(null);
  const videoWrapRef = useRef<HTMLDivElement>(null);
  const infoRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [started, setStarted] = useState(false); // hide the scroll cue once pouring

  useEffect(() => {
    const video = videoRef.current;
    const section = sectionRef.current;
    const info = infoRef.current;
    const vwrap = videoWrapRef.current;
    if (!video || !section) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      video.loop = true;
      const pr = video.play();
      if (pr && typeof pr.then === "function") pr.catch(() => {});
      return;
    }

    gsap.registerPlugin(ScrollTrigger);

    // warm the decoder so scrubbed seeks paint (esp. on phones), then let scroll drive it
    const warm = video.play();
    if (warm && typeof warm.then === "function") {
      warm.then(() => video.pause()).catch(() => {});
    }

    const ctx = gsap.context(() => {
      // scrub the pour + reveal the copy across the scroll track. the sticky
      // child (CSS) keeps it on screen — no JS pin to break on rotation.
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: section,
          start: "top top",
          end: "bottom bottom",
          scrub: 1.5,
          onUpdate: (self) => {
            const d = video.duration;
            if (d) video.currentTime = self.progress * d;
            setStarted((s) => (s || self.progress > 0.02 ? true : s));
          },
        },
      });

      if (info) {
        const lines = info.querySelectorAll<HTMLElement>("[data-reveal]");
        tl.from(
          lines,
          { y: 30, opacity: 0, ease: "none", stagger: 0.1, duration: 0.14 },
          0.04
        );
      }

      // creative entrance: a soft zoom-settle + fade as the section arrives.
      // immediateRender:false keeps the video visible by default and only
      // applies the "from" state when the trigger fires — so the hero pour can
      // never get stuck hidden if the trigger is skipped.
      if (vwrap) {
        gsap.from(vwrap, {
          autoAlpha: 0,
          scale: 1.16,
          duration: 1.4,
          ease: "power3.out",
          immediateRender: false,
          scrollTrigger: { trigger: section, start: "top 72%", once: true },
        });
      }
    }, sectionRef);

    const onReady = () => ScrollTrigger.refresh();
    if (video.readyState >= 1) onReady();
    else video.addEventListener("loadedmetadata", onReady, { once: true });

    // re-measure on a real orientation (width) change
    let lastWidth = window.innerWidth;
    let t: ReturnType<typeof setTimeout>;
    const onResize = () => {
      if (window.innerWidth === lastWidth) return;
      lastWidth = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(() => ScrollTrigger.refresh(), 300);
    };
    window.addEventListener("resize", onResize);

    return () => {
      ctx.revert();
      video.removeEventListener("loadedmetadata", onReady);
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, []);

  return (
    <section
      ref={sectionRef}
      id="reserve"
      className="relative h-[220vh] border-y border-espresso/10 bg-cream lg:h-[300vh]"
    >
      <div className="sticky top-0 h-[100svh] overflow-hidden">
        {/* ---------- background pour (wipes in) ---------- */}
        <div ref={videoWrapRef} className="absolute inset-0">
          <video
            ref={videoRef}
            src="/reserve-pour.mp4"
            poster="/reserve-poster.jpg"
            muted
            playsInline
            preload="auto"
            aria-label="SOLA Reserve pouring into a glass"
            className="absolute inset-0 h-full w-full object-cover object-center"
            style={{ filter: "contrast(1.02) saturate(1.03)" }}
          />
        </div>

        {/* ---------- readability scrim (desktop: left · mobile: bottom) ---------- */}
        <div
          className="pointer-events-none absolute inset-0 hidden lg:block"
          style={{ background: SCRIM_DESKTOP }}
        />
        <div
          className="pointer-events-none absolute inset-0 lg:hidden"
          style={{ background: SCRIM_MOBILE }}
        />

        {/* ---------- overlaid info ---------- */}
        <div className="relative mx-auto flex h-full max-w-6xl items-end px-6 pb-20 sm:px-10 lg:items-center lg:justify-end lg:pb-0">
          <div ref={infoRef} className="max-w-md">
            <p
              data-reveal
              className="mb-4 flex items-center gap-2 text-xs font-medium tracking-[0.3em] text-terracotta"
            >
              <span className="h-px w-8 bg-terracotta" />
              LIMITED RELEASE
            </p>
            <h2
              data-reveal
              className="font-display text-4xl leading-[1.05] sm:text-5xl"
            >
              SOLA Reserve.
            </h2>
            <p
              data-reveal
              className="mt-5 max-w-sm text-lg leading-relaxed text-espresso-soft"
            >
              Our small-batch line — pressed slower and bottled in glass. The
              same honest botanicals, dressed for the table.
            </p>

            <dl className="mt-7 flex flex-col divide-y divide-espresso/10 border-t border-espresso/10">
              {INFO.map((row) => (
                <div
                  key={row.k}
                  data-reveal
                  className="flex flex-col gap-0.5 py-3"
                >
                  <dt className="text-[11px] font-medium tracking-[0.3em] text-terracotta">
                    {row.k.toUpperCase()}
                  </dt>
                  <dd className="text-sm text-espresso">{row.v}</dd>
                </div>
              ))}
            </dl>

            <a
              data-reveal
              href="#join"
              className="mt-7 inline-flex cursor-pointer rounded-full bg-espresso px-7 py-3.5 text-sm font-medium text-cream transition-colors hover:bg-terracotta"
            >
              Join the waitlist
            </a>
          </div>
        </div>

        {/* scroll cue — tells visitors the pour is scroll-driven, fades the
            moment they start scrolling through it */}
        <div
          className="pointer-events-none absolute inset-x-0 bottom-7 z-10 flex flex-col items-center gap-2 transition-opacity duration-700 sm:bottom-9"
          style={{ opacity: started ? 0 : 1 }}
          aria-hidden="true"
        >
          <span className="text-[11px] font-medium tracking-[0.35em] text-espresso/70">
            SCROLL TO POUR
          </span>
          <span
            className="flex h-9 w-9 items-center justify-center rounded-full border border-espresso/25 bg-cream/40 backdrop-blur-sm"
            style={{ animation: "scroll-bob 1.6s ease-in-out infinite" }}
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="h-4 w-4 text-espresso"
            >
              <path
                d="M12 5v14M6 13l6 6 6-6"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </span>
        </div>
      </div>
    </section>
  );
}
