import type { NextConfig } from "next";
import path from "node:path";

const githubPages = process.env.GITHUB_PAGES === "true";
const staticStories = githubPages || process.env.FUNDAAI_STATIC_EXPORT === "true";

const nextConfig: NextConfig = {
  turbopack: { root: path.resolve(__dirname, "..") },
  ...(staticStories ? {
    output: "export",
    basePath: githubPages ? "/FundaAI" : "",
    trailingSlash: true,
    env: { NEXT_PUBLIC_STATIC_STORIES: "true" },
  } : {}),
};

export default nextConfig;
