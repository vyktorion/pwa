// @ts-ignore
import nextPwa from "next-pwa";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'utfs.io',
      },
    ],
  },
};

const withPWA = nextPwa({
  dest: "src/public",
  register: true,
  runtimeCaching: [
    {
      urlPattern: ({ url }: { url: URL }) => url.pathname === '/',
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'start-url',
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) => url.origin === self.location.origin && url.pathname.startsWith('/api/') && !url.pathname.startsWith('/api/auth/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'apis',
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: ({ url }: { url: URL }) => url.origin === self.location.origin && !url.pathname.startsWith('/api/'),
      handler: 'StaleWhileRevalidate',
      options: {
        cacheName: 'others',
        networkTimeoutSeconds: 10,
      },
    },
    {
      urlPattern: /\.js$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-js-assets',
      },
    },
    {
      urlPattern: /\.css$/,
      handler: 'CacheFirst',
      options: {
        cacheName: 'static-style-assets',
      },
    },
  ],
});

// @ts-ignore
export default withPWA(nextConfig);
