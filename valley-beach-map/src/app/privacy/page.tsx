import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

const TITLE = "개인정보처리방침";
const DESCRIPTION = "풍덩 사이트의 개인정보처리방침입니다.";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/privacy" },
  openGraph: { title: `${TITLE} - 풍덩`, description: DESCRIPTION, url: "https://www.pungdeong.com/privacy" },
};

export default function Page() {
  return (
    <>
      <Header />

      <main>
        <div className="register-page-header">
          <h1 style={{ fontFamily: "inherit", fontSize: 20, margin: "0 0 4px" }}>{TITLE}</h1>
        </div>
        <div className="page-list">
          <div className="item" style={{ cursor: "default" }}>
            <p>
              <b>광고</b>
              <br />
              이 사이트는 Google AdSense를 통해 광고를 게재합니다. Google 및 광고 파트너는 쿠키를 사용해
              이용자의 이전 방문 기록을 바탕으로 광고를 게재할 수 있습니다. 맞춤 광고를 원하지 않으면{" "}
              <a href="https://adssettings.google.com" target="_blank" rel="noopener">
                Google 광고 설정
              </a>
              에서 끌 수 있습니다.
            </p>

            <p>
              <b>즐겨찾기</b>
              <br />
              즐겨찾기한 장소는 서버로 전송되지 않고 이 브라우저의 localStorage에만 저장됩니다. 브라우저
              데이터를 삭제하면 함께 사라집니다.
            </p>

            <p>
              <b>후기</b>
              <br />
              후기 등록 시 입력한 닉네임(선택), 평점, 댓글, 등록 시각이 Supabase 데이터베이스에 저장되며
              누구나 조회할 수 있습니다. 실명이나 개인정보를 남기지 마세요.
            </p>

            <p>
              <b>지도</b>
              <br />
              지도 표시에는 네이버 클라우드 플랫폼(Naver Cloud Platform) Maps API를 사용합니다.
            </p>

            <p>
              <b>날씨/특보</b>
              <br />
              기상특보 정보는 공공데이터포털(data.go.kr) 기상청 API를 서버에서 조회해 보여줍니다. 이
              과정에서 이용자의 개인정보는 수집되지 않습니다.
            </p>

            <p>
              <b>문의</b>
              <br />이 방침에 대한 문의는{" "}
              <a href="mailto:hjk3313@gmail.com">hjk3313@gmail.com</a>으로 연락해주세요.
            </p>
          </div>
        </div>
      </main>

      <footer>
        <Link href="/">지도로 돌아가기</Link> · <a href="/about">사이트 소개</a>
      </footer>
    </>
  );
}
