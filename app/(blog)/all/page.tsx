import { Metadata } from 'next';
import BlogLists from "@/app/ui/components/blog-lists";

export const metadata: Metadata = {
  title: 'All',
};

export default async function AllPage() {
    return (
        <div>
            <BlogLists limit={20}  />
        </div>
    )
}