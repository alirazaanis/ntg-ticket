import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import { Providers } from '../components/providers/Providers';
import { ConditionalLayout } from '@/components/layouts/ConditionalLayout';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'NTG Ticket System',
  description: 'IT Support Ticket Management System',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang='en'>
      <body className={inter.className}>
        <Providers>
          <ConditionalLayout>{children}</ConditionalLayout>
        </Providers>
      </body>
    </html>
  );
}
