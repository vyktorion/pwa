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
  dest: "public",
  register: true,
});

// @ts-ignore
export default withPWA(nextConfig);
