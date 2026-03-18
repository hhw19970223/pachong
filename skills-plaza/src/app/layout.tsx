import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI Skills Plaza - Discover & Install AI Agent Skills",
  description: "Explore the world's largest collection of AI agent skills. Discover, compare, and install powerful skills to enhance your AI agents.",
  keywords: ["AI", "skills", "agents", "artificial intelligence", "automation", "tools", "Skills.sh"],
  authors: [{ name: "AI Skills Plaza" }],
  viewport: "width=device-width, initial-scale=1",
  themeColor: "#3b82f6",
  robots: "index, follow",
  openGraph: {
    title: "AI Skills Plaza - Discover & Install AI Agent Skills",
    description: "Explore the world's largest collection of AI agent skills. Discover, compare, and install powerful skills to enhance your AI agents.",
    type: "website",
    locale: "en_US",
    siteName: "AI Skills Plaza",
  },
  twitter: {
    card: "summary_large_image",
    title: "AI Skills Plaza - Discover & Install AI Agent Skills",
    description: "Explore the world's largest collection of AI agent skills. Discover, compare, and install powerful skills to enhance your AI agents.",
  },
  manifest: "/manifest.json",
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180" },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased font-sans bg-gray-50 text-gray-900`}
      >
        <div id="root" className="min-h-screen">
          {children}
        </div>
        
        {/* Development indicators */}
        {process.env.NODE_ENV === 'development' && (
          <div className="fixed bottom-4 left-4 z-50 bg-black/80 text-white px-3 py-1 rounded-full text-xs font-mono">
            DEV
          </div>
        )}
      </body>
    </html>
  );
}