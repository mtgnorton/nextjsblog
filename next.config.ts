import type { NextConfig } from "next";
import  createMDX from '@next/mdx';
import rehypeHighlight from 'rehype-highlight'

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [rehypeHighlight],
  },
})
 
// Merge MDX config with Next.js config
export default withMDX(nextConfig)