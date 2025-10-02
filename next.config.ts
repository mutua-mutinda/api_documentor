import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "http",
        hostname: "localhost",
        port: "1337",
        pathname: "/uploads/**",
      },
      {
        protocol: "https",
        hostname: "your-strapi-domain.com",
        pathname: "/uploads/**",
      },
    ],
  },
  // Turbopack optimizations for better development experience
  turbopack: {
    rules: {
      "*.svg": {
        loaders: ["@svgr/webpack"],
        as: "*.js",
      },
    },
    resolveAlias: {
      // Optimize common imports for faster builds
      "@": "./",
    },
  },
  experimental: {
    // Enable optimized package imports for better tree shaking
    optimizePackageImports: [
      "lucide-react",
      "@radix-ui/react-checkbox",
      "@radix-ui/react-dropdown-menu",
      "@radix-ui/react-label",
      "@radix-ui/react-slot",
    ],
  },
  // Enable Server Components optimizations
  serverExternalPackages: [],
  // Turbopack development server optimizations
  devIndicators: {
    position: "bottom-right",
  },
  // Reduce development server noise
  logging: {
    fetches: {
      fullUrl: false,
    },
  },
};

export default nextConfig;
