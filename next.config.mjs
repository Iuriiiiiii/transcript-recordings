/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    AUTHORIZATION_KEY: process.env.AUTHORIZATION_KEY,
  },
};

export default nextConfig;
