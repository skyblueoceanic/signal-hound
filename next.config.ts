import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["ioredis"],
  // Signal Hound production config
};

export default nextConfig;
