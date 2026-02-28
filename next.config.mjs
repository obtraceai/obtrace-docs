import { createMDX } from "fumadocs-mdx/next";

/** @type {import('next').NextConfig} */
const config = {
  reactStrictMode: true,
  output: "standalone",
  poweredByHeader: false
};

const withMDX = createMDX();

export default withMDX(config);
