const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
  openAnalyzer: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  
  // Enable React's experimental features
  experimental: {
    // Enable React Server Components
    serverComponents: true,
    // Enable new styled components transform
    styledComponents: true,
    // Enable concurrent features
    concurrentFeatures: true,
  },

  // Configure webpack for bundle optimization
  webpack: (config, { isServer, dev }) => {
    // Only optimize in production
    if (!dev && !isServer) {
      // Add module federation support for better code splitting
      config.output.publicPath = '/_next/';
      
      // Optimize moment.js locales
      config.plugins.push(
        new (require('webpack').ContextReplacementPlugin)(
          /moment[/\\]locale$/,
          /en|es|fr/ // Only include necessary locales
        )
      );
      
      // Add bundle analyzer for production builds
      if (process.env.ANALYZE) {
        const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
        config.plugins.push(
          new BundleAnalyzerPlugin({
            analyzerMode: 'static',
            reportFilename: 'bundle-analyzer-report.html',
            openAnalyzer: true,
          })
        );
      }
    }

    return config;
  },
  
  // Configure images optimization
  images: {
    domains: [
      'avatars.githubusercontent.com',
      'lh3.googleusercontent.com',
      's.gravatar.com',
      '*.supabase.co',
    ],
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Enable AVIF for better compression
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },
  
  // Enable compression for better load times
  compress: true,
  
  // Enable production browser source maps
  productionBrowserSourceMaps: false, // Enable only when needed for debugging
  
  // Configure headers for security and performance
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
        ],
      },
    ];
  },
};

module.exports = withBundleAnalyzer(nextConfig);
