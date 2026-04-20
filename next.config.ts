import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  // Hanya gunakan basePath jika di lingkungan production (GitHub Pages)
  basePath: process.env.NODE_ENV === 'production' ? '/portofolio' : '',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
