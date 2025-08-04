export default function EmbedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
                         <meta property="fc:miniapp" content="Reply Guy" />
                 <meta property="fc:miniapp:domain" content="quicktop8-alpha.vercel.app" />
                 <meta property="fc:miniapp:icon" content="https://quicktop8-alpha.vercel.app/icon.png" />
                 <meta property="fc:miniapp:home" content="https://quicktop8-alpha.vercel.app" />
      </head>
      <body>{children}</body>
    </html>
  );
} 