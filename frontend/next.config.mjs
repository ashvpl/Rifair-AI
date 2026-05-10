import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@react-pdf/renderer', 'playwright-core', '@sparticuz/chromium-min', 'pdf-lib', 'fontkit'],
  turbopack: {
    root: path.resolve(__dirname, ".."),
  },
  generateBuildId: async () => {
    return `build-${Date.now()}`
  },
};

export default nextConfig;
