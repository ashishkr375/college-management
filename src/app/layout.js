import { Inter } from 'next/font/google';
import './globals.css';
import { getServerSession } from 'next-auth';
import SessionProvider from '@/components/SessionProvider';
import { Toaster } from "@/components/ui/toaster"

const inter = Inter({ subsets: ['latin'] });

export const metadata = {
  title: 'Student Portal',
  description: 'A comprehensive student management system',
};

export default async function RootLayout({ children }) {
  const session = await getServerSession();

  return (
    <html lang="en">
      <body className={inter.className}>
        <SessionProvider session={session}>
          {children}
          <Toaster />
        </SessionProvider>
      </body>
    </html>
  );
}
