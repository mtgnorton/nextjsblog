import Nav from "@/app/ui/components/nav";
import Title from "@/app/ui/components/title";
import Footer from "@/app/ui/components/footer";
export default function Layout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div className="text-primary flex flex-col min-h-screen max-w-[calc(700px-2*env(safe-area-inset-left))] mx-auto p-5 ">
       <div >
       <Title />
       </div>
        {/* menu */}
        <div className="mt-10 mb-5">
          <Nav />
          </div> 



        {/* content */}
        <div className="">
            {children}
        </div>

        {/* footer */}
        <div className=" mt-auto flex items-center justify-center">
            <Footer />
        </div>
    </div>
  )
}
