import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/portofolio',
  assetPrefix: '/portofolio/',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
