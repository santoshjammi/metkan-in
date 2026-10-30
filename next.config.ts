import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Local-only assets under /public/media. No remote patterns are permitted.
    formats: ["image/avif", "image/webp"],
    // Next 16 coerces next/image `quality` to the nearest allowed value;
    // 86 is the grade used for the hero still.
    qualities: [75, 86],
  },
};

export default nextConfig;
