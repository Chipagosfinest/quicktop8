import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { MiniAppProvider } from "@/components/MiniAppProvider";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Reply Guy - Discover Your Biggest Fans",
  description: "Find out who your biggest fans are on Farcaster and show them some love!",
  openGraph: {
    title: "Reply Guy - Discover Your Biggest Fans",
    description: "Find out who your biggest fans are on Farcaster and show them some love!",
    images: ['https://quicktop8-alpha.vercel.app/og-image.png'],
  },
  icons: {
    icon: [
      { url: '/icon.png', type: 'image/png' },
      { url: '/favicon.ico', type: 'image/x-icon' }
    ],
    shortcut: '/icon.png',
    apple: '/icon.png'
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <meta property="fc:frame" content="vNext" />
        <meta property="fc:frame:image" content="https://quicktop8-alpha.vercel.app/og-image.png" />
        <meta property="fc:frame:button:1" content="🎯 Discover My Fans" />
        <meta property="fc:frame:post_url" content="https://quicktop8-alpha.vercel.app" />
        <meta property="fc:miniapp" content="Reply Guy" />
        <meta property="fc:miniapp:domain" content="quicktop8-alpha.vercel.app" />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <MiniAppProvider>
          {children}
        </MiniAppProvider>
      </body>
    </html>
  );
}
