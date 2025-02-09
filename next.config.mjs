/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ["firebase-admin"],
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        crypto: false,
        process: false,
        path: false,
        stream: false,
        util: false,
        buffer: false,
        http: false,
        url: false,
        zlib: false,
        querystring: false
      };
    }
    return config;
  }
};

export default nextConfig;
