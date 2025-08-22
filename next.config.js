// Bundle analyzer configuration
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
})

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Configure page-specific runtimes
  experimental: {
    // Disable Edge Runtime for specific pages that use Node.js APIs
    serverComponentsExternalPackages: ['@supabase/supabase-js'],
  },
  
  // Configure which pages should be server-side rendered
  // and which should be client-side rendered
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
  
  webpack: (config, { isServer, dev }) => {
    // Handle Node.js module polyfills for the browser
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    return config;
  },
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      's.gravatar.com',
      '*.supabase.co',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840]
  },
  experimental: {
    // No experimental features enabled
  },
  // Enable static exports for SSG
  output: 'standalone',
  // Enable production browser source maps
  productionBrowserSourceMaps: false,
  // Enable React DevTools in production
  reactProductionProfiling: true,
  // Enable webpack optimizations
  webpack: (config, { isServer, dev }) => {
    // Resolve fallbacks
    config.resolve.fallback = { 
      fs: false, 
      net: false, 
      tls: false,
      dns: false,
      child_process: false,
    };

    // Optimize image loading
    config.module.rules.push({
      test: /\.(jpe?g|png|webp|avif|gif|svg)$/i,
      use: [
        {
          loader: 'next-image-loader',
          options: {
            // Enable WebP for all images
            webp: {
              quality: 80,
            },
            // Enable AVIF if supported
            avif: {
              quality: 70,
            },
            // Optimize GIFs
            gif: {
              optimizationLevel: 3,
            },
            // Optimize SVGs
            svg: {
              plugins: [
                {
                  removeViewBox: false,
                },
                {
                  cleanupIDs: true,
                },
              ],
            },
          },
        },
      ],
    });

    // Add rule for SVG files
    const fileLoaderRule = config.module.rules.find((rule) =>
      rule.test?.test?.('.svg')
    );

    config.module.rules.push(
      {
        ...fileLoaderRule,
        test: /\.svg$/i,
        resourceQuery: /url/, // *.svg?url
      },
      {
        test: /\.svg$/i,
        issuer: /\.[jt]sx?$/,
        resourceQuery: { not: /url/ }, // exclude if *.svg?url
        use: ['@svgr/webpack'],
      }
    );

    fileLoaderRule.exclude = /\.svg$/i;

    return config;
  },
  // Configure security headers
  async headers() {
    // Define CSP directives - Updated for Cloudflare Pages and scriptgenius.app
    const ContentSecurityPolicy = `
      default-src 'self' scriptgenius.app www.scriptgenius.app;
      script-src 'self' 'unsafe-inline' 'unsafe-eval' *.googletagmanager.com *.google-analytics.com *.google.com *.gstatic.com *.cloudflare.com *.cloudflareinsights.com;
      style-src 'self' 'unsafe-inline' *.googleapis.com *.cloudflare.com;
      img-src 'self' data: blob: https: *.scriptgenius.app *.cloudflare.com *.google-analytics.com *.google.com *.gstatic.com;
      font-src 'self' data: https: *.scriptgenius.app *.googleapis.com *.gstatic.com;
      connect-src 'self' *.scriptgenius.app *.supabase.co *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.cloudflare.com *.cloudflareinsights.com;
      frame-src 'self' *.youtube.com *.google.com *.cloudflare.com;
      media-src 'self' *.scriptgenius.app;
      object-src 'none';
      base-uri 'self';
      form-action 'self' https://scriptgenius.app https://www.scriptgenius.app;
      frame-ancestors 'none';
      block-all-mixed-content;
      upgrade-insecure-requests;
    `.replace(/\s{2,}/g, ' ').trim();

    const securityHeaders = [
      // Prevent MIME type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Prevent clickjacking
      {
        key: 'X-Frame-Options',
        value: 'DENY',
      },
      // Enable XSS filtering
      {
        key: 'X-XSS-Protection',
        value: '1; mode=block',
      },
      // Enable Strict Transport Security (HSTS)
      {
        key: 'Strict-Transport-Security',
        value: 'max-age=63072000; includeSubDomains; preload',
      },
      // Enable Content Security Policy
      {
        key: 'Content-Security-Policy',
        value: ContentSecurityPolicy,
      },
      // Prevent content type sniffing
      {
        key: 'X-Content-Type-Options',
        value: 'nosniff',
      },
      // Prevent MIME sniffing
      {
        key: 'X-DNS-Prefetch-Control',
        value: 'on',
      },
      // Disable IE compatibility mode
      {
        key: 'X-Download-Options',
        value: 'noopen',
      },
      // Disable IE compatibility mode
      {
        key: 'X-Permitted-Cross-Domain-Policies',
        value: 'none',
      },
      // Disable referrer information when navigating to a different origin
      {
        key: 'Referrer-Policy',
        value: 'strict-origin-when-cross-origin',
      },
      // Feature policy
      {
        key: 'Permissions-Policy',
        value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
      },
    ];

    return [
      // Apply to all routes
      {
        source: '/(.*)',
        headers: securityHeaders,
      },
      // Additional security headers for API routes
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,OPTIONS,PATCH,DELETE,POST,PUT' },
          { 
            key: 'Access-Control-Allow-Headers',
            value: 'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization' 
          },
        ],
      },
    ];
  },
  // Configure redirects
  async redirects() {
    return [
      {
        source: '/',
        destination: '/dashboard',
        permanent: true,
      },
    ];
  },
};

// Injected content via Sentry wizard below
const { withSentryConfig } = require('@sentry/nextjs');

const sentryWebpackPluginOptions = {
  // Suppresses source map uploading logs during build
  silent: true,
  org: "tamsen-de-beer",
  project: "scriptgenius"
};

// Create Sentry config
const sentryConfig = withSentryConfig(nextConfig, sentryWebpackPluginOptions, {
  // For all available options, see:
  // https://docs.sentry.io/platforms/javascript/guides/nextjs/manual-setup/

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Transpiles SDK to be compatible with IE11 (increases bundle size)
  transpileClientSDK: true,

  // Routes browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers (increases server load)
  tunnelRoute: "/monitoring",

  // Hides source maps from generated client bundles
  hideSourceMaps: true,

  // Automatically tree-shake Sentry logger statements to reduce bundle size
  disableLogger: true,
});

// Apply bundle analyzer on top of Sentry config
module.exports = process.env.ANALYZE 
  ? withBundleAnalyzer(sentryConfig)
  : sentryConfig;
