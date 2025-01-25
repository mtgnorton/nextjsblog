import { Metadata } from 'next';
import PostsComponents from "@/app/ui/components/blog-lists";
import { getPosts } from "@/app/ui/components/blog-lists";

export const metadata: Metadata = {
  title: 'All',
};
export default async function AllPage(props: {
    searchParams?: Promise<{
      page?: string;
    }>;
  }) {
    const params = await props.searchParams;
    const currentPage = Number(params?.page) || 1;
    const { posts, totalPages } = await getPosts({ sort: 'desc', page: currentPage });
    return (
        <div className="flex flex-col mt-20">
          
            <PostsComponents 
                posts={posts} 
                totalPages={totalPages}
                isShowPagination={true} 
            />
        </div>
    )
}

export async function generateStaticParams() {
  const { totalPages } = await getPosts();
  
  return Array.from({ length: totalPages }, (_, i) => ({
    searchParams: {
      page: (i + 1).toString()
    }
  }));
} 