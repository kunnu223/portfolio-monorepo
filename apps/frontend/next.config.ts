import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    // the old separate About page is now a section of the read-mode page
    return [{ source: "/about", destination: "/read#about", permanent: true }];
  },
};

export default nextConfig;
