import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  typescript: {
    ignoreBuildErrors: true,
  },
  async redirects() {
    return [
      // Ancienne page À propos, fusionnée dans l'accueil — évite un 404 sur les liens existants.
      { source: "/a-propos", destination: "/#a-propos", permanent: true },
      // Ancienne page Contact, fusionnée dans le pied de page (visible sur tout le site).
      { source: "/contact", destination: "/#contact", permanent: true },
    ];
  },
};

export default nextConfig;