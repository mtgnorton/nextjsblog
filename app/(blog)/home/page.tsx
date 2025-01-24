import { Metadata } from 'next';
import BlogLists from "@/app/ui/components/blog-lists";
import Profile from "@/app/ui/components/profile";
export const metadata: Metadata = {
  title: 'Home',
};

export default async function BlogPage() {
  return <div className="">
    <Profile />
    <div className="mt-10">
      <h3 className="text-2xl font-bold mb-4">Recent posts</h3>
      <BlogLists limit={5} sortOrder="asc" />
    </div>
  </div>;
}

