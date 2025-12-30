//frontend/next.config.mjs

/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    //allowedDevOrigins: ['http://172.30.28.73:3000'],
    //allowedDevOrigins: ['http://172.30.28.73:3000', 'http://localhost:3000', 'http://172.30.28.73'],
  },
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;

//frontend/next.config.mjs

///** @type {import('next').NextConfig} */
//const nextConfig = {
//  experimental: {
//    //allowedDevOrigins: ['http://172.30.28.73:3000', 'http://localhost:3000', 'http://172.30.28.73'],
//  },
//  async rewrites() {
//    return [
//      {
//        source: '/api/:path*',
//        destination: 'http://backend:8080/api/:path*',
//      },
//    ];
//  },
//};
//
//export default nextConfig;


///** @type {import('next').NextConfig} */
//const nextConfig = {
//  experimental: {
//    allowedDevOrigins: ['http://localhost:3000', 'http://172.30.28.73'],
//  },
//  async rewrites() {
//    return [
//      {
//        source: '/api/:path*',
//        destination: 'http://localhost:8080/api/:path*',
//      },
//    ];
//  },
//};
//
//export default nextConfig;

///** @type {import('next').NextConfig} */
//const nextConfig = {
//  async rewrites() {
//    return [
//      {
//        source: '/api/:path*',
//        destination: 'http://localhost:8080/api/:path*',
//      },
//    ];
//  },
//};
//
//export default nextConfig;

