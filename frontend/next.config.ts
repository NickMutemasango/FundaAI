import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname, "..") },
  ...(process.env.GITHUB_PAGES === "true" ? {
    output: "export",
    basePath: "/FundaAI",
    trailingSlash: true,
    env: { NEXT_PUBLIC_STATIC_STORIES: "true" },
  } : {}),
};

export default nextConfig;
