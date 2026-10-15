import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // React Three Fiber manages its own render roots; StrictMode's double
  // mount/unmount in dev races with Canvas teardown (removeChild errors).
  reactStrictMode: false,
};

export default nextConfig;
