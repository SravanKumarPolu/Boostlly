const withBundleAnalyzer = require("@next/bundle-analyzer")({
  enabled: process.env.ANALYZE === "true",
  openAnalyzer: false,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    optimizePackageImports: [
      "@boostlly/ui",
      "@boostlly/features",
      "lucide-react",
      "date-fns",
      "howler",
      "fuse.js",
      "html2canvas",
    ],
    esmExternals: false,
    // Enable modern bundling for better performance
    swcMinify: true,
    // Enable partial pre-rendering for better performance
    ppr: false,
    // Optimize CSS for better loading
    optimizeCss: false, // Disabled due to critters module issues
    // Note: parallelServerBuildTraces disabled in production due to static export
  },
  // Enable static export for out folder generation
  // Always export when building (not in dev mode)
  output: "export",
  trailingSlash: true,
  images: {
    // Required when using output: 'export' to avoid Next Image Optimization API
    unoptimized: true,
  },
  // Increase chunk loading timeout
  onDemandEntries: {
    // Period (in ms) where the server will keep pages in the buffer
    maxInactiveAge: 25 * 1000,
    // Number of pages that should be kept simultaneously without being disposed
    pagesBufferLength: 2,
  },
  webpack: (config, { isServer, dev }) => {
    // Add alias resolution for workspace packages
    config.resolve.alias = {
      ...config.resolve.alias,
      "@boostlly/core": require("path").resolve(
        __dirname,
        "../../packages/core/src",
      ),
      "@boostlly/ui": require("path").resolve(
        __dirname,
        "../../packages/ui/src",
      ),
      "@boostlly/features": require("path").resolve(
        __dirname,
        "../../packages/features/src",
      ),
      "@boostlly/platform": require("path").resolve(
        __dirname,
        "../../packages/platform/src",
      ),
      "@boostlly/platform-web": require("path").resolve(
        __dirname,
        "../../packages/platform-web/src",
      ),
      "@boostlly/platform-extension": require("path").resolve(
        __dirname,
        "../../packages/platform-extension/src",
      ),
    };

    // Fix chunk loading issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimize bundle splitting with more aggressive chunk splitting
    if (!isServer && !dev) {
      config.optimization.splitChunks = {
        chunks: "all",
        maxInitialRequests: 25, // Reduced for better performance
        maxAsyncRequests: 25,
        minSize: 10000, // Reduced minimum size for more granular splitting
        maxSize: 200000, // Reduced maximum size for better caching
        minChunks: 1,
        enforceSizeThreshold: 50000,
        cacheGroups: {
          // React and core libraries (highest priority)
          react: {
            test: /[\\/]node_modules[\\/](react|react-dom|scheduler)[\\/]/,
            name: "react",
            chunks: "all",
            priority: 50,
            enforce: true,
          },
          // Next.js framework
          nextjs: {
            test: /[\\/]node_modules[\\/]next[\\/]/,
            name: "nextjs",
            chunks: "all",
            priority: 45,
            enforce: true,
          },
          // Heavy libraries (async only)
          heavy: {
            test: /[\\/]node_modules[\\/](recharts|chart\.js|d3|victory|html2canvas|howler)[\\/]/,
            name: "heavy",
            chunks: "async",
            priority: 40,
            enforce: true,
          },
          // Chart and visualization libraries
          charts: {
            test: /[\\/]node_modules[\\/](chart\.js|recharts|d3|victory)[\\/]/,
            name: "charts",
            chunks: "async",
            priority: 35,
          },
          // Date and utility libraries
          utils: {
            test: /[\\/]node_modules[\\/](date-fns|fuse\.js|lodash|moment)[\\/]/,
            name: "utils",
            chunks: "all",
            priority: 30,
          },
          // UI component libraries
          ui: {
            test: /[\\/]packages[\\/]ui[\\/]/,
            name: "ui",
            chunks: "all",
            priority: 25,
          },
          // Feature modules (split by feature)
          features: {
            test: /[\\/]packages[\\/]features[\\/]/,
            name: "features",
            chunks: "async", // Changed to async for better performance
            priority: 20,
          },
          // Core platform modules
          platform: {
            test: /[\\/]packages[\\/]platform[\\/]/,
            name: "platform",
            chunks: "all",
            priority: 15,
          },
          // Core business logic
          core: {
            test: /[\\/]packages[\\/]core[\\/]/,
            name: "core",
            chunks: "all",
            priority: 18,
          },
          // Common vendor libraries (smaller chunks)
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: "vendors",
            chunks: "all",
            priority: 10,
            minChunks: 2,
            maxSize: 150000, // Limit vendor chunk size
          },
          // Shared components (more granular)
          common: {
            name: "common",
            minChunks: 2,
            chunks: "all",
            priority: 5,
            maxSize: 100000, // Limit common chunk size
            reuseExistingChunk: true,
          },
          // Default chunk
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
            maxSize: 100000,
          },
        },
      };

      // Optimize module concatenation for better tree shaking
      config.optimization.usedExports = true;
      config.optimization.sideEffects = false;

      // Enable module concatenation for better performance
      config.optimization.concatenateModules = true;

      // Optimize runtime chunk
      config.optimization.runtimeChunk = {
        name: "runtime",
      };
    }

    // Add chunk loading timeout configuration
    config.output.chunkLoadingGlobal = "webpackChunkBoostlly";
    config.output.chunkFilename = dev
      ? "static/chunks/[id].chunk.js"
      : "static/chunks/[id].[contenthash].chunk.js";

    return config;
  },
  // Increase timeout for chunk loading
  serverRuntimeConfig: {
    chunkLoadingTimeout: 30000, // 30 seconds
  },
  // Optimize for development
  devIndicators: {
    buildActivity: true,
    buildActivityPosition: "bottom-right",
  },
  // Enhanced security headers and cache optimization (production only)
  ...(process.env.NODE_ENV === "production" && {
    async headers() {
      const securityHeaders = [
        {
          key: "X-DNS-Prefetch-Control",
          value: "on",
        },
        {
          key: "Strict-Transport-Security",
          value: "max-age=63072000; includeSubDomains; preload",
        },
        {
          key: "X-XSS-Protection",
          value: "1; mode=block",
        },
        {
          key: "X-Frame-Options",
          value: "SAMEORIGIN",
        },
        {
          key: "X-Content-Type-Options",
          value: "nosniff",
        },
        {
          key: "Referrer-Policy",
          value: "origin-when-cross-origin",
        },
        {
          key: "Permissions-Policy",
          value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
        },
        {
          key: "Content-Security-Policy",
          value: [
            "default-src 'self'",
            "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
            "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
            "img-src 'self' data: https: blob:",
            "font-src 'self' https://fonts.googleapis.com https://fonts.gstatic.com",
            "connect-src 'self' https://api.quotable.io https://zenquotes.io https://quotes.rest https://favqs.com https://quotegarden.herokuapp.com",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
            "manifest-src 'self'",
          ].join("; "),
        },
      ];

      const performanceHeaders = [
        {
          key: "Cache-Control",
          value: "public, max-age=31536000, immutable",
        },
      ];

      // Force cache refresh for JavaScript files
      const jsCacheHeaders = [
        {
          key: "Cache-Control",
          value: "public, max-age=0, must-revalidate",
        },
        {
          key: "ETag",
          value: `"${Date.now()}"`,
        },
      ];

      const developmentHeaders = [
        {
          key: "Cache-Control",
          value: "no-cache, no-store, must-revalidate",
        },
        {
          key: "Pragma",
          value: "no-cache",
        },
        {
          key: "Expires",
          value: "0",
        },
      ];

      const headers = [];

      // Static assets with long cache
      headers.push({
        source: "/static/(.*)",
        headers: performanceHeaders,
      });

      
      // AGGRESSIVE CACHE BUSTING - Force refresh all JS files
      headers.push({
        source: "/_next/static/(.*)",
        headers: [
          {
            key: "Cache-Control",
            value: "no-cache, no-store, must-revalidate, max-age=0",
          },
          {
            key: "Pragma",
            value: "no-cache",
          },
          {
            key: "Expires",
            value: "0",
          },
          {
            key: "ETag",
            value: `"${Date.now()}"`,
          },
        ],
      });
      headers.push({
        source: "/_next/static/chunks/(.*).js",
        headers: jsCacheHeaders,
      });

      // API routes with security headers
      headers.push({
        source: "/api/(.*)",
        headers: securityHeaders,
      });

      // All other routes
      if (process.env.NODE_ENV === "development") {
        headers.push({
          source: "/(.*)",
          headers: [...securityHeaders, ...developmentHeaders],
        });
      } else {
        headers.push({
          source: "/(.*)",
          headers: [
            ...securityHeaders,
            {
              key: "Cache-Control",
              value: "public, max-age=3600, s-maxage=86400",
            },
          ],
        });
      }

      return headers;
    },
  }),
};

module.exports = withBundleAnalyzer(nextConfig);
