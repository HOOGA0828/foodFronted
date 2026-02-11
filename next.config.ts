import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* 1. 刪除 output: 'export' (除非你確定要用純靜態，否則 Vercel 預設模式更強大) */
  /* 2. 刪除 basePath，這是導致你 404 的主因 */
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: 'img-afd.7api-01.dp1.sej.co.jp',
        port: '',
        pathname: '**',
      },
      {
        protocol: 'https',
        hostname: '**',
        port: '',
        pathname: '**',
      },
    ],
  },
};

export default nextConfig;