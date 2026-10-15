"use client";

import { useEffect, useRef, useState } from "react";

// Pause a WebGL canvas when it scrolls out of view: observe the canvas element
// and flip R3F's frameloop between "always" and "never". Saves GPU/battery and
// keeps scrolling smooth when the 3D isn't on screen. rootMargin keeps it warm
// just before it enters the viewport.
export function useInView<T extends Element>(rootMargin = "250px") {
  const ref = useRef<T>(null);
  const [inView, setInView] = useState(true);

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === "undefined") return;
    const io = new IntersectionObserver(
      ([entry]) => setInView(entry.isIntersecting),
      { rootMargin },
    );
    io.observe(el);

    // Rotating the phone changes the observer root's geometry; some mobile
    // browsers don't reliably re-fire, which can leave a gated canvas paused
    // (cans/3D vanish). Re-observe once the new orientation settles to force a
    // fresh intersection read.
    let t: ReturnType<typeof setTimeout>;
    let lastW = window.innerWidth;
    const onResize = () => {
      if (window.innerWidth === lastW) return; // ignore mobile toolbar (height-only)
      lastW = window.innerWidth;
      clearTimeout(t);
      t = setTimeout(() => {
        io.unobserve(el);
        io.observe(el);
      }, 250);
    };
    window.addEventListener("resize", onResize);

    return () => {
      io.disconnect();
      window.removeEventListener("resize", onResize);
      clearTimeout(t);
    };
  }, [rootMargin]);

  return { ref, inView };
}
