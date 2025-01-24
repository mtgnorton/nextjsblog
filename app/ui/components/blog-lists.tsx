import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface BlogPost {
  title: string;
  updatedAt: string;
  fileName: string;
}

interface BlogListsProps {
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export async function getBlogPosts(props?: BlogListsProps): Promise<BlogPost[]> {
  const postsDirectory = path.join(process.cwd(), 'md');
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames.map((fileName) => {
    // 假设文件名格式为: YYYY-MM-DD-title.mdx
    const match = fileName.match(/^(\d{4}-\d{2}-\d{2})-(.+)\.mdx$/);
    

    if (!match) {
      // 如果文件名不符合格式，使用当前时间
      return {
        title: fileName.replace(/\.mdx$/, ''),
        updatedAt: new Date().toISOString().split('T')[0],
        fileName: fileName.replace(/\.mdx$/, '')
      };
    }

    const [, date, title] = match;
    return {
      title: title,
      updatedAt: `${date}`,
      fileName: `${date}-${title}`
    };
  });

  // 根据 sortOrder 参数排序
  const sortedPosts = posts.sort((a, b) => {
    const order = props?.sortOrder === 'asc' ? 1 : -1;
    return order * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  // 如果设置了 limit，返回指定数量的文章
  if (props?.limit) {
    return sortedPosts.slice(0, props.limit);
  }

  return sortedPosts;
}

export default async function BlogLists({ limit, sortOrder = 'asc' }: BlogListsProps = {}) {
    const posts = await getBlogPosts({ limit, sortOrder });
    return (
      <div className="flex flex-col w-full">
        {posts.map((post) => (
          <div key={post.fileName} className="flex flex-row mt-4">
            <span className="w-36 flex-shrink-0">{post.updatedAt}</span>
            <Link 
              href={`/blog/${post.fileName}`}
              className="text-link border-b-2 border-b-underline hover:text-hover"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    );
}
