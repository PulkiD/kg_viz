import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  experimental: {
    webVitalsAttribution: ['CLS', 'LCP']
  },
  
  // Disable feedback button
  useFileSystemPublicRoutes: true,
  devIndicators: {
    buildActivity: false,
  },
};

export default nextConfig;
