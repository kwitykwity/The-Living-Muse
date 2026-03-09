import type { Metadata } from 'next';
import './globals.css';
import TopNav from '../components/TopNav';

export const metadata: Metadata = {
  title: 'The Living Muse — AI Poetry That Comes Alive',
  description:
    'Transform your photos into stylized Orchid Muse avatars. Generate emotionally adaptive poetry. Watch your verses come alive with lip-sync video and music.',
  keywords: ['AI poetry', 'avatar generator', 'creative AI', 'poetry platform', 'orchid muse'],
  openGraph: {
    title: 'The Living Muse',
    description: 'Your story deserves to bloom.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <TopNav />
        {children}
      </body>
    </html>
  );
}
