import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Studio+ Office Locations',
  description: 'Weekly flexible office locations for Studio+',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen relative overflow-x-hidden bg-zinc-950 text-zinc-100`}>
        <div className="fixed inset-0 pointer-events-none bg-mesh z-0"></div>
        <div className="relative z-10 min-h-screen flex flex-col">
          {children}
        </div>
      </body>
    </html>
  );
}
