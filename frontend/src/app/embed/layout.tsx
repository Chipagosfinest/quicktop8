export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
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
      <body>{children}</body>
    </html>
  );
} 