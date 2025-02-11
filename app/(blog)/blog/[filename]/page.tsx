import { Metadata } from 'next';
import { getPosts } from '@/app/ui/components/blog-lists';
import '@/app/(blog)/blog/atom-one-dark.css';
import TOCWrapper from '@/app/ui/components/toc-wrapper';

export const metadata: Metadata = {
  title: 'Blog',
};

export default async function Page(props: { params: Promise<{ filename: string }> }) {
  const params = await props.params
  const filename = params.filename
  const decodefilename = decodeURIComponent(filename)
  const { default: Post } = await import(`@/md/${decodefilename}.mdx`)
  const title = decodefilename.replace(/^\d{4}-\d{2}-\d{2}-/, '')


  return (
   <>
    <div className="">
        
        <TOCWrapper />
    </div>
  <div className="flex flex-col  mt-20">
    <div className="flex justify-center items-center">
      <h1 className="text-4xl font-bold">{title}</h1>
    </div>
    <article className="blog-content prose prose-lg dark:prose-invert max-w-none overflow-x-scroll">
      <Post />
    </article>
  </div>
  </>
  );
}

export async function generateStaticParams() {
    const posts = await getPosts()
    return posts.posts.map((post) => ({
        filename: post.filename,
    }))
}
   
export const dynamicParams = false;

