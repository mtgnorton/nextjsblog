import '@/app/ui/global.css';
import { inter } from '@/app/ui/font';
import { Metadata } from 'next';
import { ThemeProvider } from '@/app/provider/theme';

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
    <html lang="en" >
      <body className={`${inter.className} antialiased`} >
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
