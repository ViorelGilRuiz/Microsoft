import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Avoid covering the mobile navigation while developing at narrow widths.
  devIndicators: false,
};

export default nextConfig;
