import type { NextConfig } from "next";

const isGitHubPages = process.env.GITHUB_PAGES === "true";

const nextConfig: NextConfig = {
  basePath: isGitHubPages ? "/pulse" : "",
  assetPrefix: isGitHubPages ? "/pulse" : "",
  images: { unoptimized: true },
};

export default nextConfig;
