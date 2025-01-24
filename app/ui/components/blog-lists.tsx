import Link from 'next/link';
import fs from 'fs';
import path from 'path';
import Pagination from './all-pagination';

interface PostItem {
  title: string;
  updatedAt: string;
  filename: string;
}

interface PostsPagination {
    posts: PostItem[];
    totalPages: number;
}

interface PostsArg {
  page?: number;
  limit?: number;
  sort?: 'asc' | 'desc';
}

const ITEMS_PER_PAGE = 2;

export async function getPosts(props?: PostsArg): Promise<PostsPagination> {
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
        filename: fileName.replace(/\.mdx$/, '')
      };
    }

    const [, date, title] = match;
    return {
      title: title,
      updatedAt: `${date}`,
      filename: `${date}-${title}`
    };
  });

  // 根据 sortOrder 参数排序
  const sortedPosts = posts.sort((a, b) => {
    const order = props?.sort === 'asc' ? 1 : -1;
    return order * (new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  });

  const totalPages = Math.ceil(sortedPosts.length / ITEMS_PER_PAGE);

  // 如果设置了 limit，返回指定数量的文章
  if (props?.limit) {
    return {
      posts: sortedPosts.slice(0, props.limit),
      totalPages: 1
    };
  }

  // 分页
  const currentPage = props?.page || 1;
  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedPosts = sortedPosts.slice(start, start + ITEMS_PER_PAGE);

  return {
    posts: paginatedPosts,
    totalPages
  };
}



export default async function PostsComponents({
  posts = [],
  isShowPagination = false,
  totalPages = 0
}: {
    posts: PostItem[];
    isShowPagination?: boolean;
    totalPages: number;
}) {
    
  return (
    <div className="flex flex-col w-full">
      {posts.map((post) => (
        <div key={post.filename} className="flex flex-row mt-4">
          <span className="w-36 flex-shrink-0">{post.updatedAt}</span>
          <Link 
            href={`/blog/${encodeURIComponent(post.filename)}`}
            className="text-link border-b-2 border-b-underline hover:text-hover"
          >
            {post.title}
          </Link>
        </div>
      ))}
      
      {isShowPagination && (
        <div className="mt-8 flex justify-center">
          <Pagination totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
