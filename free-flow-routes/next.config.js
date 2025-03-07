/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  disable: process.env.NODE_ENV === 'development',
  register: true,
  skipWaiting: true,
});

const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ['www.tfl.gov.uk'],
  },
  // Enable SWC minification
  swcMinify: true,
  // Configure compiler options for better performance
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

module.exports = withPWA(nextConfig); 