/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  images: {
    unoptimized: true,
  },
  // Add trailingSlash if needed
  trailingSlash: false,
};

module.exports = nextConfig;
