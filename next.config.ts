import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["isomorphic-dompurify"],
  // Use the system trust store when Turbopack fetches Google Fonts during
  // the build. Some sandboxed/CI networks otherwise fail the TLS handshake
  // to fonts.googleapis.com. Harmless in normal environments.
  experimental: {
    turbopackUseSystemTlsCerts: true,
  },
};

export default nextConfig;
