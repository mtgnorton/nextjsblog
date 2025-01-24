import { Metadata } from 'next';
import PostsComponents from "@/app/ui/components/blog-lists";
import Profile from "@/app/ui/components/profile";
import { getPosts } from "@/app/ui/components/blog-lists";
export const metadata: Metadata = {
  title: 'Home',
};

export default async function BlogPage() {
  const { posts, totalPages } = await getPosts({ sort: 'desc', page: 1,limit:5 });
  return <div className="">
    <Profile />
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-4">Recent posts</h3>
      <PostsComponents posts={posts} totalPages={totalPages} />
    </div>
  </div>;
}

