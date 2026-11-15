/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // مطلوب لدعم RTL في بعض المتصفحات
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
};

export default nextConfig;
