// Next.js Config Trigger Rebuild 2
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'aqvhaxxeswmpxthepxby.supabase.co',
        port: '',
        pathname: '/storage/v1/object/public/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '5mb', // 画像アップロード用に5MBに拡張
    },
  },
};

export default nextConfig;
