import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // CRITICAL: This enables the lightweight production build for Azure
  output: "standalone", 
  
  /* config options here */
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "picsum.photos", 
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;