import type { NextConfig } from "next";
import { fa } from "zod/v4/locales";

const nextConfig: NextConfig = {
  devIndicators: false,
  output: "standalone", // Enable standalone output for Docker
  reactStrictMode: false,
  // Add empty turbopack config to silence the warning
  turbopack: {},
  // typedRoutes: true,
  // compiler: {
  //   styledComponents: true, // Enable SWC transform for styled-components
  // },
  // experimental: {
  //   optimizePackageImports: ["@mui/material", "@mui/icons-material"],
  // },
  images: {
    // loader: "custom",
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lms-api.onairdev.com",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
      {
        protocol: "https",
        hostname: "dev-event-files-bucket.s3.ap-southeast-1.amazonaws.com",
        port: "",
        pathname: "/**",
      },
      // {
      //   protocol: 'https',
      //   hostname: 'xyzsupabase.co',
      //   pathname: '/storage/v1/object/public/**',
      // },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
    // dirs: ['pages', 'utils']
  },
  webpack: (config, options) => {
    config.resolve.alias = {
      ...config.resolve.alias,
    };
    return config;
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
