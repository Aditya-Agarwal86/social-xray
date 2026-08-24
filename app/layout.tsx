import type { Metadata, Viewport } from 'next';
import './globals.css';
import { ThemeProvider } from '@/lib/theme/ThemeProvider';

export const metadata: Metadata = {
  title: 'SOCIAL X-RAY | Social Content Attention Forensics',
  description:
    'Find the moment your audience stops caring. Attention diagnosis, engagement friction mapping, post autopsies, and surgical repairs for social content.',
  keywords: [
    'social media forensics',
    'attention drop',
    'engagement friction',
    'post autopsy',
    'content optimization',
    'copywriting analysis',
  ],
  authors: [{ name: 'SOCIAL X-RAY' }],
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fcfcfd' },
    { media: '(prefers-color-scheme: dark)', color: '#0d1117' },
  ],
};

const themeScript = `
  try {
    var stored = localStorage.getItem('social_xray_theme_preference');
    var isDark = stored === 'dark' || (!stored && window.matchMedia('(prefers-color-scheme: dark)').matches) || (stored === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    if (isDark) {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
      document.documentElement.style.colorScheme = 'dark';
    } else {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
      document.documentElement.style.colorScheme = 'light';
    }
  } catch (e) {}
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="min-h-screen bg-app text-content-primary antialiased">
        <ThemeProvider>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
