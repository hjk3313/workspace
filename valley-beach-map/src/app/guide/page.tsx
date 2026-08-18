import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

const TITLE = "물놀이 안전가이드";
const DESCRIPTION =
  "계곡과 해수욕장은 무엇이 다를까요? 물놀이 준비물부터 이안류·급류 대처법, 아이 동반 시 주의사항까지 안전한 여름을 위한 가이드.";
const LAST_MODIFIED = "2026-08-03";

const FAQ = [
  {
    q: "계곡과 해수욕장, 뭐가 다를까",
    a: "해수욕장은 대체로 바닥이 완만한 모래사장이라 파도만 없으면 수심 변화가 크지 않습니다. 다만 밀물·썰물에 따라 수심이 시간대별로 크게 달라지고, 일부 해변은 이안류(순간적으로 먼바다로 빨려나가는 물살)가 발생할 수 있어 깃발 표시나 안전요원 안내를 꼭 확인해야 합니다.",
  },
  {
    q: "비 온 뒤 계곡, 얼마나 기다려야 할까",
    a: "상류에 비가 내리면 계곡물이 불어나는 데는 시간차가 있습니다. 산간 지형은 빗물이 지표를 타고 빠르게 흘러 내려오기 때문에, 정작 물놀이 장소는 맑은 날씨여도 상류 쪽에 내린 비가 1~2시간 뒤 갑자기 유량과 유속을 키울 수 있습니다. 특히 좁고 깊은 협곡형 계곡일수록 위험이 큽니다.",
  },
  {
    q: "지역별 물놀이 시즌은 언제가 좋을까",
    a: "계곡은 장마가 끝나는 7월 말~8월 중순에 수량이 가장 풍부하고 물이 차가워 피서에 적합합니다. 다만 이 시기는 상류 강수 영향을 가장 많이 받는 시기이기도 하니 방문 전 날씨 확인이 특히 중요합니다.",
  },
];

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/guide" },
  openGraph: { title: `${TITLE} - 풍덩`, description: DESCRIPTION, type: "article", url: "https://www.pungdeong.com/guide" },
};

export default function Page() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Article",
            headline: TITLE,
            description: "계곡과 해수욕장의 차이, 준비물, 안전 수칙을 정리한 가이드",
            url: "https://www.pungdeong.com/guide",
            datePublished: "2026-07-28",
            dateModified: LAST_MODIFIED,
            author: { "@type": "Organization", name: "풍덩", url: "https://www.pungdeong.com/about" },
            publisher: { "@type": "Organization", name: "풍덩", url: "https://www.pungdeong.com/" },
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "FAQPage",
            mainEntity: FAQ.map((f) => ({
              "@type": "Question",
              name: f.q,
              acceptedAnswer: { "@type": "Answer", text: f.a },
            })),
          }),
        }}
      />
      <Header />

      <main>
        <div className="register-page-header">
          <h1 style={{ fontFamily: "inherit", fontSize: 20, margin: "0 0 4px" }}>{TITLE}</h1>
          <p className="admin-muted" style={{ margin: 0 }}>최종 수정: {LAST_MODIFIED} · 풍덩 운영자 작성</p>
        </div>
        <div className="page-list">
          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>계곡과 해수욕장, 뭐가 다를까</h2>
            <p>
              해수욕장은 대체로 바닥이 완만한 모래사장이라 파도만 없으면 수심 변화가 크지 않습니다.
              다만 밀물·썰물에 따라 수심이 시간대별로 크게 달라지고, 일부 해변은 이안류(순간적으로
              먼바다로 빨려나가는 물살)가 발생할 수 있어 깃발 표시나 안전요원 안내를 꼭 확인해야 합니다.
            </p>
            <p>
              계곡은 반대로 바닥이 바위나 자갈이라 겉보기엔 얕아 보여도 몇 걸음만 옮기면 갑자기
              허리~가슴 깊이의 &apos;소(沼)&apos;가 나타나는 경우가 많습니다. 상류에서 비가 오면 계곡물이
              맑아 보여도 30분~1시간 뒤 급류로 돌변할 수 있어, 날씨가 흐리거나 상류 쪽에 비 소식이
              있으면 계곡 물놀이는 피하는 게 안전합니다.
            </p>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>물놀이 준비물 체크리스트</h2>
            <ul style={{ margin: "8px 0 0", paddingLeft: 20, lineHeight: 1.9 }}>
              <li>구명조끼 또는 팔튜브 (특히 어린이·수영 미숙자는 필수)</li>
              <li>아쿠아슈즈 (계곡 바위, 해변 조개껍질에 발 다치는 것 방지)</li>
              <li>방수팩 (휴대폰·지갑 침수 방지)</li>
              <li>돗자리, 그늘막, 여벌 옷과 수건</li>
              <li>자외선 차단제, 벌레 기피제 (계곡 인근은 벌레가 많은 편)</li>
              <li>즉석밴드, 소독제 등 간단한 구급용품</li>
            </ul>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>안전 수칙</h2>
            <p>
              <b>음주 후 입수는 절대 금물입니다.</b> 매년 여름 물놀이 안전사고의 상당수가 음주 상태에서
              발생합니다. 판단력과 반응 속도가 떨어져 얕은 물에서도 사고로 이어질 수 있습니다.
            </p>
            <p>
              <b>이안류를 느꼈다면</b> 해안과 평행하게 헤엄쳐 물살에서 먼저 벗어난 뒤, 그다음 해안으로
              향하세요. 물살을 거슬러 직진하면 체력만 빠르게 소모됩니다.
            </p>
            <p>
              <b>계곡에서는</b> 상류 쪽 날씨를 함께 확인하고, 반석 위가 미끄러우니 슬리퍼보다는
              아쿠아슈즈를 착용하세요. 다이빙은 사전에 수심을 확인한 지정 구역이 아니면 하지 않는 것이
              좋습니다.
            </p>
            <p>
              <b>어린이 동반 시</b>에는 눈을 뗀 사이 사고가 나는 경우가 많으므로, 보호자 한 명은 항상
              아이 곁에서 지켜보는 &apos;지정 관찰자&apos; 역할을 정해두는 것을 추천합니다.
            </p>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>비 온 뒤 계곡, 얼마나 기다려야 할까</h2>
            <p>
              상류에 비가 내리면 계곡물이 불어나는 데는 시간차가 있습니다. 산간 지형은 빗물이 지표를
              타고 빠르게 흘러 내려오기 때문에, 정작 물놀이 장소는 맑은 날씨여도 상류 쪽에 내린 비가
              1~2시간 뒤 갑자기 유량과 유속을 키울 수 있습니다. 특히 좁고 깊은 협곡형 계곡일수록 위험이
              큽니다.
            </p>
            <p>
              집중호우·호우주의보가 발효된 지역이거나 최근 24시간 내 상류에 많은 비가 내렸다면, 물이
              맑아 보이더라도 최소 하루 이상 지난 뒤 방문하는 것이 안전합니다. 갑자기 물색이 탁해지거나
              나뭇가지·부유물이 떠내려오기 시작하면 즉시 물 밖으로 나와 고지대로 이동하세요.
            </p>
            <p>
              방문 지역에 호우·홍수 특보가 있는지는{" "}
              <a href="https://www.weather.go.kr/w/index.do" target="_blank" rel="noopener">
                기상청 날씨누리
              </a>
              에서 미리 확인하세요.
            </p>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>지역별 물놀이 시즌은 언제가 좋을까</h2>
            <p>
              <b>계곡</b>은 장마가 끝나는 7월 말~8월 중순에 수량이 가장 풍부하고 물이 차가워 피서에
              적합합니다. 다만 이 시기는 상류 강수 영향을 가장 많이 받는 시기이기도 하니 방문 전 날씨
              확인이 특히 중요합니다. 9월 초까지도 늦더위에는 계곡 물놀이가 가능하지만 수량이 줄어
              바닥 노출이 심해질 수 있습니다.
            </p>
            <p>
              <b>해수욕장</b>은 지역마다 공식 개장 기간이 다르고, 개장 기간이 아니면 안전요원이 상주하지
              않아 사고 시 대응이 늦어질 수 있습니다. 방문 전 해당 지자체 공지로 개장·폐장일을 확인하는
              것을 권장합니다.
            </p>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>지도의 수심 표기, 이렇게 참고하세요</h2>
            <p>
              풍덩 지도의 얕음·보통·깊음 구분은 실측 수심이 아니라 공개된 정보와 이용 후기를 바탕으로
              한 3단계 참고값입니다. 계절, 강수량, 정확한 위치에 따라 실제 수심은 표기와 다를 수 있으니
              현장에서 직접 확인 후 입수하시고, 방문 후에는 <a href="/reviews">후기</a>로 최신 상태를
              남겨주시면 다른 분들께 큰 도움이 됩니다.
            </p>
          </div>
        </div>
      </main>

      <footer>
        <Link href="/">지도로 돌아가기</Link> · <a href="/about">사이트 소개</a> ·{" "}
        <a href="/privacy">개인정보처리방침</a>
      </footer>
    </>
  );
}
