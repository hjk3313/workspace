import type { NextConfig } from "next";

// AdSense(광고)와 네이버지도/카카오 SDK가 여러 외부 도메인에서 스크립트/iframe을 불러오기 때문에
// CSP는 그 도메인들만 허용하도록 구성. 너무 좁히면 광고나 지도가 조용히 깨질 수 있어 주의.
const CSP = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com https://*.gstatic.com https://oapi.map.naver.com https://*.pstatic.net https://*.naver.net https://developers.kakao.com",
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: https:",
  "font-src 'self' data:",
  "connect-src 'self' https://*.supabase.co https://maps.apigw.ntruss.com https://oapi.map.naver.com https://*.pstatic.net https://*.naver.net https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
  "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.google.com",
  "object-src 'none'",
  "base-uri 'self'",
].join("; ");

const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "Content-Security-Policy", value: CSP },
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "geolocation=(), camera=(), microphone=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
