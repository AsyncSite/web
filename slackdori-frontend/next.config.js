/** @type {import('next').NextConfig} */

const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

// Security headers for production
const securityHeaders = [
  {
    key: 'X-DNS-Prefetch-Control',
    value: 'on'
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload'
  },
  {
    key: 'X-XSS-Protection',
    value: '1; mode=block'
  },
  {
    key: 'X-Frame-Options',
    value: 'SAMEORIGIN'
  },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=()'
  },
  {
    key: 'X-Content-Type-Options',
    value: 'nosniff'
  },
  {
    key: 'Referrer-Policy',
    value: 'origin-when-cross-origin'
  },
  {
    key: 'Content-Security-Policy',
    value: `
      default-src 'self';
      script-src 'self' 'unsafe-eval' 'unsafe-inline' *.google-analytics.com *.googletagmanager.com *.google.com *.googleapis.com *.gstatic.com *.google-analytics.com *.googleadservices.com *.googlesyndication.com *.doubleclick.net;
      style-src 'self' 'unsafe-inline' *.googleapis.com;
      img-src 'self' blob: data: *.google-analytics.com *.googletagmanager.com raw.githubusercontent.com *.googleapis.com *.gstatic.com *.google.com *.googleusercontent.com *.googlesyndication.com *.doubleclick.net;
      font-src 'self' *.gstatic.com;
      connect-src 'self' *.google-analytics.com *.analytics.google.com *.googletagmanager.com *.google.com raw.githubusercontent.com api.asyncsite.com localhost:* *.vercel-insights.com;
      frame-src 'self' *.google.com *.doubleclick.net *.googlesyndication.com;
    `.replace(/\n/g, '').trim()
  }
];

const nextConfig = {
  // React strict mode for better development experience
  reactStrictMode: true,
  
  // SWC minification for better performance
  swcMinify: true,
  
  // Optimize production builds
  productionBrowserSourceMaps: false,
  
  // Enable experimental features for better performance
  experimental: {
    // Optimize CSS
    optimizeCss: true,
    // Optimize package imports
    optimizePackageImports: [
      '@heroicons/react',
      'lodash',
      '@tanstack/react-query',
      'zustand'
    ],
    // Server components optimizations
    serverComponentsExternalPackages: ['sharp'],
  },
  
  // Image optimization configuration
  images: {
    // External image domains
    domains: [
      'raw.githubusercontent.com',
      'github.com',
      'avatars.githubusercontent.com',
      'localhost'
    ],
    // Image formats
    formats: ['image/avif', 'image/webp'],
    // Device sizes for responsive images
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    // Image sizes for different layouts
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Minimum cache TTL in seconds (30 days)
    minimumCacheTTL: 60 * 60 * 24 * 30,
    // Disable static imports for better performance
    disableStaticImages: false,
    // Dangerously allow SVG
    dangerouslyAllowSVG: true,
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  
  // Redirects for SEO
  async redirects() {
    return [
      // Redirect www to non-www
      {
        source: '/:path*',
        has: [
          {
            type: 'host',
            value: 'www.slackdori.asyncsite.com',
          },
        ],
        destination: 'https://slackdori.asyncsite.com/:path*',
        permanent: true,
      },
      // Redirect trailing slashes
      {
        source: '/:path*/',
        destination: '/:path*',
        permanent: true,
      },
    ];
  },
  
  // Rewrites for API proxy
  async rewrites() {
    return [
      // Proxy API requests to backend
      {
        source: '/api/slack-emoji/:path*',
        destination: `${process.env.API_URL || 'http://localhost:8080'}/api/slack-emoji/:path*`,
      },
    ];
  },
  
  // Headers for security and caching
  async headers() {
    return [
      // Apply security headers to all routes
      {
        source: '/:path*',
        headers: securityHeaders,
      },
      // Cache static assets
      {
        source: '/images/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        source: '/fonts/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      // Cache Next.js static assets
      {
        source: '/_next/static/:path*',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
    ];
  },
  
  // Environment variables to expose to the browser
  env: {
    NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL || 'https://slackdori.asyncsite.com',
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL || 'https://api.asyncsite.com',
  },
  
  // Webpack configuration
  webpack: (config, { dev, isServer }) => {
    // Bundle analyzer in development
    if (dev && !isServer && process.env.ANALYZE === 'true') {
      const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
      config.plugins.push(
        new BundleAnalyzerPlugin({
          analyzerMode: 'static',
          reportFilename: './analyze.html',
          openAnalyzer: true,
        })
      );
    }
    
    // Ignore specific modules
    config.module.rules.push({
      test: /\.md$/,
      use: 'raw-loader',
    });
    
    return config;
  },
  
  // Compiler options
  compiler: {
    // Remove console logs in production
    removeConsole: process.env.NODE_ENV === 'production' ? {
      exclude: ['error', 'warn'],
    } : false,
  },
  
  // Output configuration
  output: 'standalone',
  
  // Trailing slash configuration (important for SEO)
  trailingSlash: false,
  
  // Disable x-powered-by header
  poweredByHeader: false,
  
  // Generate ETags for pages
  generateEtags: true,
  
  // Compress responses
  compress: true,
  
  // Page extensions
  pageExtensions: ['tsx', 'ts', 'jsx', 'js'],
};

module.exports = withBundleAnalyzer(nextConfig);