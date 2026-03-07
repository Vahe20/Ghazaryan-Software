import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  env: {
    BACKEND_URL: process.env.BACKEND_URL,
  },
};

export default nextConfig;
