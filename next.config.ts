import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/map", destination: "/", permanent: false },
      { source: "/explore", destination: "/", permanent: false },
      { source: "/waterbodies", destination: "/", permanent: false },
      { source: "/waterbodies/:lid", destination: "/?lid=:lid", permanent: false },
      { source: "/locations/:slug", destination: "/", permanent: false },
      { source: "/gear", destination: "/trips", permanent: false },
      { source: "/regulations", destination: "/rules", permanent: false },
      { source: "/trips/new", destination: "/", permanent: false },
    ];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        pathname: "/wikipedia/commons/**",
      },
      {
        protocol: "https",
        hostname: "www.fws.gov",
        pathname: "/sites/default/files/**",
      },
    ],
  },
};

export default nextConfig;
