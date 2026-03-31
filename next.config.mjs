import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      { source: "/sdks/:path*", destination: "/docs/sdks/:path*", permanent: true },
      { source: "/platforms/:path*", destination: "/docs/platforms/:path*", permanent: true },
      { source: "/integrations/:path*", destination: "/docs/integrations/:path*", permanent: true },
      { source: "/projects/:path*", destination: "/docs/projects/:path*", permanent: true },
      { source: "/concepts/:path*", destination: "/docs/concepts/:path*", permanent: true },
      { source: "/features/:path*", destination: "/docs/features/:path*", permanent: true },
      { source: "/environments/:path*", destination: "/docs/environments/:path*", permanent: true },
      { source: "/security/:path*", destination: "/docs/security/:path*", permanent: true },
      { source: "/api-reference/:path*", destination: "/docs/api-reference/:path*", permanent: true },
      { source: "/comparisons/:path*", destination: "/docs/comparisons/:path*", permanent: true },
      { source: "/instrumentation/:path*", destination: "/docs/sdks/:path*", permanent: true },
      { source: "/getting-started", destination: "/docs/quickstart", permanent: true },
      { source: "/quickstart", destination: "/docs/quickstart", permanent: true },
      { source: "/llms-full.txt", destination: "/llm.txt", permanent: true },
    ];
  },
};

const withMDX = createMDX();

export default withMDX(config);
