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
  title: "Top 8 Friends - Farcaster Analyzer",
  description: "Discover your most interactive friends on Farcaster",
  other: {
    "fc:frame": JSON.stringify({
      version: "vNext",
      image: "https://quicktop8-6tvw43wfu-chipagosfinests-projects.vercel.app/og-image.png",
      buttons: [
        {
          label: "Launch QuickTop8",
          action: "launch_miniapp",
          target: "https://quicktop8-6tvw43wfu-chipagosfinests-projects.vercel.app"
        }
      ],
      postUrl: "https://quicktop8-6tvw43wfu-chipagosfinests-projects.vercel.app/api/frame"
    })
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
        <meta name="fc:frame" content={JSON.stringify({
          version: "vNext",
          image: "https://quicktop8-6tvw43wfu-chipagosfinests-projects.vercel.app/og-image.png",
          buttons: [
            {
              label: "Launch QuickTop8",
              action: "launch_miniapp",
              target: "https://quicktop8-6tvw43wfu-chipagosfinests-projects.vercel.app"
            }
          ],
          postUrl: "https://quicktop8-6tvw43wfu-chipagosfinests-projects.vercel.app/api/frame"
        })} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
