import type { Metadata, Viewport } from 'next';
import { Fraunces, IBM_Plex_Mono, Manrope } from 'next/font/google';
import { siteConfig } from '@/config/site';
import './globals.css';

const bodyFont = Manrope({
  variable: '--font-body',
  subsets: ['latin'],
});

const displayFont = Fraunces({
  variable: '--font-display',
  subsets: ['latin'],
});

const monoFont = IBM_Plex_Mono({
  variable: '--font-mono',
  subsets: ['latin'],
  weight: ['400', '500'],
});

export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: `${siteConfig.name} | Curated AI Agent Skill Market`,
  description: siteConfig.description,
  keywords: [...siteConfig.keywords],
  authors: [{ name: siteConfig.name }],
  openGraph: {
    title: `${siteConfig.name} | Curated AI Agent Skill Market`,
    description: siteConfig.description,
    url: siteConfig.url,
    siteName: siteConfig.name,
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: `${siteConfig.name} | Curated AI Agent Skill Market`,
    description: siteConfig.description,
  },
  manifest: '/manifest.webmanifest',
  icons: {
    icon: [{ url: '/icon.svg', type: 'image/svg+xml' }],
  },
};

export const viewport: Viewport = {
  themeColor: '#08111f',
};

const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: siteConfig.name,
  url: siteConfig.url,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <body
        className={`${bodyFont.variable} ${displayFont.variable} ${monoFont.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        {children}
      </body>
    </html>
  );
}