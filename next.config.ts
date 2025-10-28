import nextPwa from "next-pwa";

// @ts-ignore

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        port: "",
      },
    ],
  },
};

const withPWA = nextPwa({
  dest: "public",
  register: true,
});

export default withPWA(nextConfig);
