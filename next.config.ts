import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Use standalone output only in Docker builds (Windows has filename issues with standalone)
  ...(process.env.DOCKER_BUILD === "1" ? { output: "standalone" as const } : {}),
  serverExternalPackages: ["better-sqlite3", "@prisma/adapter-better-sqlite3"],
};

export default nextConfig;
