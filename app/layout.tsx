import '@/app/ui/global.css';
import { inter } from '@/app/ui/font';
import { Metadata } from 'next';
import { ThemeProvider } from '@/app/provider/theme';
import '@/app/(blog)/blog/atom-one-dark.css';

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
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
