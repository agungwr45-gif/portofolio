import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/portofolio',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
