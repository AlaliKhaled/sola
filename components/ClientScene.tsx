"use client";

import dynamic from "next/dynamic";

const Scene = dynamic(() => import("./Scene"), {
  ssr: false,
  loading: () => (
    <div className="flex h-full w-full items-center justify-center">
      <span className="text-xs tracking-[0.3em] text-white/30">
        INITIALISING…
      </span>
    </div>
  ),
});

export default function ClientScene() {
  return <Scene />;
}
