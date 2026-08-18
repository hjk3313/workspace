import type { Metadata } from "next";
import Header from "@/components/Header";
import RegisterClient from "@/components/RegisterClient";

const TITLE = "장소 등록";
const DESCRIPTION = "아직 지도에 없는 계곡·해수욕장을 제보해주세요. 확인 후 지도에 반영됩니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/register" },
  openGraph: { title: `${TITLE} - 풍덩`, description: DESCRIPTION, url: "https://www.pungdeong.com/register" },
};

export default function Page() {
  return (
    <>
      <Header />
      <RegisterClient />
      <footer>
        <a href="/about">사이트 소개</a> · <a href="/privacy">개인정보처리방침</a>
      </footer>
    </>
  );
}
