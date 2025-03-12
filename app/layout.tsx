import '@/app/ui/global.css';
import { inter } from '@/app/ui/font';
import { Metadata } from 'next';
import { ThemeProvider } from '@/app/provider/theme';
import '@/app/(blog)/blog/atom-one-dark.css';
import Nav from "@/app/ui/components/nav";
import Title from "@/app/ui/components/title";
import Footer from "@/app/ui/components/footer";
export const metadata: Metadata = {
  title: {
    template: '%s | Blog',
    default: 'Blog',
  },
  description: "It's mtgnorton's blog",
  metadataBase: new URL('https://mtgnorton.cn'),
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  
  return (
    <html lang="en" className='h-100 w-100 overflow-x-hidden' >
     
      <body className={`${inter.className} antialiased h-100 w-100 overflow-x-hidden`} >
        <ThemeProvider>
        <div className="text-primary flex flex-col min-h-screen max-w-[calc(700px-2*env(safe-area-inset-left))] mx-auto p-5 ">
       <div >
       <Title />
       </div>
        {/* menu */}
        <div className="mt-10 mb-5">
          <Nav />
          </div> 

        {/* content */}
        <div className="w-full">
            {children}
        </div>

        {/* footer */}
        <div className=" mt-auto flex items-center justify-center">
            <Footer />
        </div>
    </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
