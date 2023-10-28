/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    dirs: ["."],
  },
  reactStrictMode: true,
  trailingSlash: true,
  pageExtensions: ["page.tsx", "page.ts", "page.jsx", "page.js"],
  // Transpile Swagger UI React. https://github.com/swagger-api/swagger-ui/issues/8245
  transpilePackages: [
    "react-syntax-highlighter",
    "swagger-client",
    "swagger-ui-react",
    "yaml",
  ],
};

module.exports = nextConfig;
