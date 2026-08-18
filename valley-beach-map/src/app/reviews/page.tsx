import type { Metadata } from "next";
import Header from "@/components/Header";
import ReviewsClient from "@/components/ReviewsClient";

const TITLE = "전체 후기";
const DESCRIPTION = "풍덩 방문자들이 남긴 후기를 최신순으로 모아봤어요.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/reviews" },
  openGraph: { title: `${TITLE} - 풍덩`, description: DESCRIPTION, url: "https://www.pungdeong.com/reviews" },
};

export default function Page() {
  return (
    <>
      <Header />
      <h1 className="sr-only">{TITLE}</h1>
      <ReviewsClient />
      <footer>
        <a href="/about">사이트 소개</a> · <a href="/privacy">개인정보처리방침</a>
      </footer>
    </>
  );
}
