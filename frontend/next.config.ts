import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static HTML export, so a static host can serve this instead of Vercel's
  // Next.js runtime. Two pages, no API routes, no server actions, no dynamic
  // segments -- nothing here needs a server.
  output: "export",
  trailingSlash: true,
  // next/image's optimiser is a server feature; export refuses to build with it.
  images: { unoptimized: true },
};

export default nextConfig;
