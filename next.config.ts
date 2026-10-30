import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Local-only assets under /public/media. No remote patterns are permitted.
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
