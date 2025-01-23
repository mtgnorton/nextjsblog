import Link from "next/link";

export default function BlogPage() {
  return <div className="flex flex-col mt-10">
    <div >
      <h3 className="text-2xl font-bold mb-4">Recent posts</h3>

      <div className="flex flex-row gap-10 mt-4">
         <Link href="/blog/active-rest" className="text-link border-b-2  border-b-underline hover:text-hover">
           Active rest
         </Link>
        <span>2025-01-22</span>
      </div>

      <div className="flex flex-row gap-10 mt-4">
         <Link href="/blog/active-rest" className="text-link border-b-2  border-b-underline hover:text-hover">
         Active rest
              </Link>
        <span>2025-01-22</span>
      </div>




    </div>


  </div>;
}

