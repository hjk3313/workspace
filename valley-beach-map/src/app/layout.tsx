import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = "전국 계곡 해수욕장 지도 - 풍덩";
const SITE_DESCRIPTION =
  "전국 계곡·해수욕장 지도. 지역과 수심별로 찾아보고 실제 후기까지 확인하세요, 풍덩!";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.pungdeong.com"),
  title: { default: SITE_NAME, template: "%s - 풍덩" },
  description: SITE_DESCRIPTION,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "32x32" },
      { url: "/assets/favicon-16.png", sizes: "16x16", type: "image/png" },
      { url: "/assets/favicon-32.png", sizes: "32x32", type: "image/png" },
      { url: "/assets/icon-512.png", sizes: "512x512", type: "image/png" },
      { url: "/assets/favicon.svg", type: "image/svg+xml" },
    ],
    apple: "/assets/apple-touch-icon.png",
  },
  openGraph: {
    siteName: "풍덩",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    type: "website",
    url: "https://www.pungdeong.com/",
    images: ["/assets/icon-512.png"],
  },
  twitter: {
    card: "summary",
    title: SITE_NAME,
    description: SITE_DESCRIPTION,
    images: ["/assets/icon-512.png"],
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ko">
      <body>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              name: "풍덩",
              alternateName: "pungdeong",
              url: "https://www.pungdeong.com/",
              logo: "https://www.pungdeong.com/assets/icon-512.png",
              description: SITE_DESCRIPTION,
              email: "hjk3313@gmail.com",
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebSite",
              name: "풍덩",
              url: "https://www.pungdeong.com/",
              inLanguage: "ko",
              publisher: { "@type": "Organization", name: "풍덩" },
            }),
          }}
        />
        {children}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1475889248445126"
          crossOrigin="anonymous"
        />
      </body>
    </html>
  );
}
