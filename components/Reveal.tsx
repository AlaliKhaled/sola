"use client";

import { useRef, useLayoutEffect, type ReactNode } from "react";

// Scroll-reveal using CSS transitions + IntersectionObserver.
// No animation-library timing dependency: if JS fails the content stays
// visible, and the observer fires reliably whenever the group enters view.
export default function Reveal({
  children,
  className,
  stagger = 0.1,
  y = 24,
}: {
  children: ReactNode;
  className?: string;
  stagger?: number;
  y?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const items = Array.from(el.children) as HTMLElement[];
    items.forEach((it, i) => {
      it.style.opacity = "0";
      it.style.transform = `translateY(${y}px)`;
      it.style.transition = "opacity 0.6s ease, transform 0.6s ease";
      it.style.transitionDelay = `${i * stagger}s`;
      it.style.willChange = "opacity, transform";
    });

    const io = new IntersectionObserver(
      (entries, obs) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            items.forEach((it) => {
              it.style.opacity = "1";
              it.style.transform = "translateY(0)";
            });
            obs.disconnect();
          }
        }
      },
      { threshold: 0.15 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, [stagger, y]);

  return (
    <div ref={ref} className={className}>
      {children}
    </div>
  );
}
