import type { Metadata } from "next";
import Header from "@/components/Header";
import FavoritesClient from "@/components/FavoritesClient";

const TITLE = "즐겨찾기";
const DESCRIPTION = "즐겨찾기한 계곡·해수욕장을 모아서 확인하세요. 풍덩!";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/favorites" },
  openGraph: { title: `${TITLE} - 풍덩`, description: DESCRIPTION, url: "https://www.pungdeong.com/favorites" },
};

export default function Page() {
  return (
    <>
      <Header />
      <h1 className="sr-only">{TITLE}</h1>
      <FavoritesClient />
      <footer>
        <a href="/about">사이트 소개</a> · <a href="/privacy">개인정보처리방침</a>
      </footer>
    </>
  );
}
