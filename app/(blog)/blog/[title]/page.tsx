import { Metadata } from 'next';
import { getBlogPosts } from '@/app/ui/components/blog-lists';

import '@/app/(blog)/blog/atom-one-dark.css';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function Page({
    params,
  }: {
    params: Promise<{ title: string }>
  }) {
    const title = (await params).title
    const decodeTitle = decodeURIComponent(title)
    const { default: Post } = await import(`@/md/${decodeTitle}.mdx`)
   
    return (
        
        <div className="flex flex-col mt-20">
      
            <div className='flex justify-center items-center '>
            <h1 className="text-4xl font-bold ">{decodeTitle}</h1>
            </div>
            <article className="prose prose-lg dark:prose-invert max-w-none">
                <Post />
            </article>
        </div>
    )
}

export async function generateStaticParams() {
    const posts = await getBlogPosts()
    return posts.map((post) => ({
        fileName: post.fileName,
    }))
}
   
export const dynamicParams = false;

