const { i18n } = require('./next-i18next.config');
const { version } = require('./package.json');
/** @type {import('next').NextConfig} */

const removeImports = require('next-remove-imports')();
const nextConfig = {
  // i18n,
  output: 'export',
  reactStrictMode: true,
  publicRuntimeConfig: {
    version,
  },
  webpack(config, { isServer, dev }) {
    config.experiments = {
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: false,
  },
  typescript: {
    // !! WARN !!
    // Dangerously allow production builds to successfully complete even if
    // your project has type errors.
    // !! WARN !!
    ignoreBuildErrors: true,
  },
};

module.exports = {...nextConfig};
