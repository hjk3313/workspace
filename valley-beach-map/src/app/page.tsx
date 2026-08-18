import type { Metadata } from "next";
import MapPageClient from "@/components/MapPageClient";
import Header from "@/components/Header";
import { fetchSpots } from "@/lib/fetchSpots";

const TITLE = "전국 계곡 해수욕장 지도 - 풍덩";
const DESCRIPTION =
  "전국 계곡·해수욕장 지도. 지역과 수심별로 찾아보고 실제 후기까지 확인하세요, 풍덩!";

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: "/" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: "https://www.pungdeong.com/" },
};

// 5분마다 재검증: 검색엔진 크롤러가 항상 실제 스팟 목록이 담긴 HTML을 받도록.
export const revalidate = 300;

export default async function Page() {
  const initialSpots = await fetchSpots().catch(() => []);

  const byRegion = new Map<string, number>();
  let valleyCount = 0;
  let beachCount = 0;
  for (const s of initialSpots) {
    byRegion.set(s.region, (byRegion.get(s.region) || 0) + 1);
    if (s.type === "beach") beachCount++;
    else valleyCount++;
  }
  const regionSummary = [...byRegion.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([region, count]) => `${region} ${count}곳`)
    .join(", ");

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "WebSite",
            name: TITLE,
            alternateName: ["계곡 지도", "해수욕장 지도", "풍덩"],
            description: DESCRIPTION,
            url: "https://www.pungdeong.com/",
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "ItemList",
            name: "전국 계곡·해수욕장 목록",
            numberOfItems: initialSpots.length,
            itemListElement: initialSpots.map((s, i) => ({
              "@type": "ListItem",
              position: i + 1,
              item: {
                "@type": "Place",
                name: s.name,
                address: s.address,
                geo: { "@type": "GeoCoordinates", latitude: s.lat, longitude: s.lng },
              },
            })),
          }),
        }}
      />
      <Header />
      <h1 className="sr-only">{TITLE}</h1>
      <MapPageClient initialSpots={initialSpots} />
      <p className="sr-only">
        풍덩은 현재 전국 {initialSpots.length}곳의 계곡·해수욕장 정보를 제공합니다 (계곡 {valleyCount}곳,
        해수욕장 {beachCount}곳). 지역별로는 {regionSummary} 순으로 등록되어 있으며, 각 장소는 지역·유형·수심
        기준으로 필터링해 찾아볼 수 있고 실제 방문자 후기도 함께 확인할 수 있습니다.
      </p>
    </>
  );
}
