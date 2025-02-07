import type { NextConfig } from "next";
import createMDX from '@next/mdx';
import rehypeHighlight from 'rehype-highlight'
import remarkGfm from 'remark-gfm'
import rehypeSlug from 'rehype-slug' // import rehype-slug
import rehypeAutolinkHeadings from 'rehype-autolink-headings' // import rehype-autolink-headings

/** @type {import('next').NextConfig} */
const nextConfig = {
  pageExtensions: ['js', 'jsx', 'md', 'mdx', 'ts', 'tsx'],
}

const withMDX = createMDX({
  // Add markdown plugins here, as desired
  extension: /\.mdx?$/,
  options: {
    rehypePlugins: [
      rehypeHighlight,
      rehypeSlug, // add rehype-slug plugin
      [rehypeAutolinkHeadings, { behavior: 'wrap' }], // wrap the heading with a link
    ],
    remarkPlugins: [remarkGfm],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
