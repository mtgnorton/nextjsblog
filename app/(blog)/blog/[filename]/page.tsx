import { Metadata } from 'next';
import { getPosts } from '@/app/ui/components/blog-lists';
import '@/app/(blog)/blog/atom-one-dark.css';
import TOCWrapper from '@/app/ui/components/toc-wrapper';



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
    <article className="blog-content prose prose-lg dark:prose-invert max-w-none overflow-x-hidden" style={{ marginTop: '20px' }}>
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

// 生成动态 metadata
export async function generateMetadata(
  props: { params: Promise<{ filename: string }> }
): Promise<Metadata> {
  const params = await props.params;
  const filename = params.filename;
  const decodefilename = decodeURIComponent(filename);
  const title = decodefilename.replace(/^\d{4}-\d{2}-\d{2}-/, '');
  
  // 获取博客内容
  const { default: Post } = await import(`@/md/${decodefilename}.mdx`);
  
  // 从博客内容中提取描述
  const content = await Post();
  
  // 递归提取文本内容
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function extractText(node: any): string {
    if (typeof node === 'string') return node;
    if (!node) return '';
    if (Array.isArray(node)) {
      return node.map(extractText).join(' ');
    }
    if (node.props?.children) {
      return extractText(node.props.children);
    }
    return '';
  }

  const textContent = extractText(content)
    .replace(/[#*`]/g, '') // 移除 Markdown 语法标记
    .replace(/\s+/g, ' ')  // 将多个空白字符替换为单个空格
    .trim();
    
  const description = textContent
    ? `${textContent.slice(0, 300)}...`  // 截取前150个字符并添加省略号
    : `阅读 ${title} 的详细内容`;

  return {
    title: `${title}`,
    description,

  };
}