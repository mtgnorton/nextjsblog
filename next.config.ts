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
  extension: /\.mdx?$/,  // 匹配 .md 和 .mdx 文件
  options: {
    remarkPlugins: [
      [remarkGfm, { singleTilde: false ,        codeBlocks: false       }],  // 支持 GitHub Flavored Markdown 语法,如表格、任务列表等
    ],  
    rehypePlugins: [
      rehypeHighlight,   // 为代码块添加语法高亮
      rehypeSlug,        // 为标题添加 id 属性,便于目录跳转
      [rehypeAutolinkHeadings, { behavior: 'wrap' }], // 为标题添加锚点链接,使标题可点击跳转
    ],
  },
})

// Merge MDX config with Next.js config
export default withMDX(nextConfig)
