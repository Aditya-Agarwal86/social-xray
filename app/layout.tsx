import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SOCIAL X-RAY | AI Social Content Forensics',
  description:
    'Find the moment your audience stops caring. Forensic attention diagnosis, engagement friction mapping, post autopsies, and surgical repairs for social content.',
  keywords: [
    'social media forensics',
    'attention drop',
    'engagement friction',
    'post autopsy',
    'content optimization',
    'copywriting analysis',
  ],
  authors: [{ name: 'SOCIAL X-RAY Lab' }],
};

export const viewport: Viewport = {
  themeColor: '#07080C',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className="min-h-screen bg-carbon-950 text-carbon-100 antialiased selection:bg-cyan-500/25 selection:text-white">
        {children}
      </body>
    </html>
  );
}
