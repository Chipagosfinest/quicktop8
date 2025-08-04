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
  title: "Reply Guy - Farcaster Analyzer",
  description: "Discover your most interactive friends on Farcaster",
  other: {
    "fc:miniapp": JSON.stringify({
      version: "1",
      name: "Reply Guy",
      description: "Discover your most interactive friends on Farcaster (last 45 days)",
      homeUrl: "https://quicktop8-alpha.vercel.app/app",
      iconUrl: "https://quicktop8-alpha.vercel.app/icon.png",
      imageUrl: "https://quicktop8-alpha.vercel.app/og-image.png",
      buttonTitle: "🎯 Discover",
      splashImageUrl: "https://quicktop8-alpha.vercel.app/splash.png",
      splashBackgroundColor: "#8B5CF6"
    })
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
        <meta name="fc:miniapp" content={JSON.stringify({
          version: "1",
          name: "QuickTop8",
          description: "Discover your most interactive friends on Farcaster (last 45 days)",
          homeUrl: "https://quicktop8-alpha.vercel.app/app",
          iconUrl: "https://quicktop8-alpha.vercel.app/icon.png",
          imageUrl: "https://quicktop8-alpha.vercel.app/og-image.png",
          buttonTitle: "🎯 Discover",
          splashImageUrl: "https://quicktop8-alpha.vercel.app/splash.png",
          splashBackgroundColor: "#8B5CF6"
        })} />
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
