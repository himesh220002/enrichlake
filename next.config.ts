import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: [
    'playwright',
    'playwright-extra',
    'puppeteer-extra-plugin-stealth',
    'puppeteer-extra-plugin',
    'bullmq',
    'ioredis',
    'mongodb',
  ],
};

export default nextConfig;
