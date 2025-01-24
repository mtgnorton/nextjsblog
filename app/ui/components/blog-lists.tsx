import Link from 'next/link';
import fs from 'fs';
import path from 'path';

interface BlogPost {
  title: string;
  updatedAt: string;
}

interface BlogListsProps {
  limit?: number;
  sortOrder?: 'asc' | 'desc';
}

export async function getBlogPosts(props?: BlogListsProps): Promise<BlogPost[]> {
  const postsDirectory = path.join(process.cwd(), 'md');
  const fileNames = fs.readdirSync(postsDirectory);

  const posts = fileNames.map((fileName) => {
    const filePath = path.join(postsDirectory, fileName);
    const stats = fs.statSync(filePath);
    const mtime = stats.mtime;
    const updatedAt = `${mtime.toISOString().split('T')[0]} ${mtime.toTimeString().split(' ')[0].substring(0,5)}`;
    return {
      title: fileName.replace(/\.mdx$/, ''),
      updatedAt
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
      <div className="flex flex-col">
        {posts.map((post) => (
          <div key={post.title} className="flex flex-row gap-10 mt-4">
            <span>{post.updatedAt}</span>
            <Link 
              href={`/blog/${encodeURIComponent(post.title)}`}
              className="text-link border-b-2 border-b-underline hover:text-hover"
            >
              {post.title}
            </Link>
          </div>
        ))}
      </div>
    );
}
