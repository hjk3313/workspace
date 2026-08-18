import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

const TITLE = "사이트 소개";
const DESCRIPTION = "전국 계곡·해수욕장 지도 서비스 풍덩을 소개합니다. 운영 목적과 데이터 출처, 문의 방법을 안내합니다.";
const CONTACT_EMAIL = "hjk3313@gmail.com";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/about" },
  openGraph: { title: `${TITLE} - 풍덩`, description: DESCRIPTION, url: "https://www.pungdeong.com/about" },
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
          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>풍덩은 어떤 서비스인가요</h2>
            <p>
              풍덩은 전국의 계곡과 해수욕장을 지역·수심별로 찾아볼 수 있는 지도 서비스입니다. 여름철
              물놀이 장소를 고를 때 흔히 궁금한 &quot;여기 수심이 얼마나 될까&quot;, &quot;아이 데리고 가도
              괜찮을까&quot; 같은 질문에 답이 되도록, 장소 정보와 실제 방문자 후기를 함께 보여주는 것을
              목표로 만들었습니다.
            </p>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>장소 정보는 어디서 오나요</h2>
            <p>
              공개된 지자체·관광 정보와 이용자 제보를 바탕으로 운영자가 직접 확인 후 지도에 등록합니다.
              수심 구분(얕음·보통·깊음)은 실측값이 아니라 공개 정보와 후기를 참고한 3단계 참고값이며,
              실제 수심은 계절과 강수량에 따라 달라질 수 있으니 방문 전 안전가이드를 참고해주세요.
            </p>
            <p>
              누구나 <a href="/register">장소 등록</a> 페이지에서 지도에 없는 곳을 제보할 수 있고, 방문
              후에는 <a href="/reviews">후기</a>로 최신 상태를 남겨 다른 이용자에게 도움을 줄 수 있습니다.
            </p>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>운영자 및 문의</h2>
            <p>
              풍덩은 개인이 운영하는 서비스입니다. 장소 정보 오류 제보, 광고 문의, 기타 요청 사항은
              아래 이메일로 연락해주세요.
            </p>
            <p>
              <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>
            </p>
          </div>
        </div>
      </main>

      <footer>
        <Link href="/">지도로 돌아가기</Link> · <a href="/privacy">개인정보처리방침</a>
      </footer>
    </>
  );
}
