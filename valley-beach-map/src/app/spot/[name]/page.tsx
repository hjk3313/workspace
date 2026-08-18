import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Header from "@/components/Header";
import { fetchSpots, fetchSpotByName } from "@/lib/fetchSpots";
import { fetchReviewsForSpot, crowdLabel } from "@/lib/reviews";
import { depthLabel, typeLabel, hasRiskNote, naverWebMapUrl, nearbyPensionsUrl } from "@/lib/common";

export const revalidate = 300;

export async function generateStaticParams() {
  const spots = await fetchSpots().catch(() => []);
  return spots.map((s) => ({ name: s.name }));
}

async function loadSpot(nameParam: string) {
  const name = decodeURIComponent(nameParam);
  return fetchSpotByName(name).catch(() => null);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ name: string }>;
}): Promise<Metadata> {
  const { name: nameParam } = await params;
  const spot = await loadSpot(nameParam);
  if (!spot) return { title: "장소를 찾을 수 없습니다" };

  const title = `${spot.name} - ${spot.region} ${typeLabel[spot.type]} 수심·주소 정보`;
  const description = `${spot.name}(${spot.address}) 수심 ${depthLabel[spot.depth]}, ${spot.note}`;
  const url = `https://www.pungdeong.com/spot/${encodeURIComponent(spot.name)}`;

  return {
    title,
    description,
    alternates: { canonical: `/spot/${encodeURIComponent(spot.name)}` },
    openGraph: { title, description, url, type: "article" },
  };
}

export default async function SpotDetailPage({
  params,
}: {
  params: Promise<{ name: string }>;
}) {
  const { name: nameParam } = await params;
  const spot = await loadSpot(nameParam);
  if (!spot) notFound();

  const reviews = await fetchReviewsForSpot(spot.name).catch(() => []);
  const avgRating = reviews.length
    ? reviews.reduce((a, r) => a + r.rating, 0) / reviews.length
    : null;

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "Place",
            name: spot.name,
            address: spot.address,
            geo: { "@type": "GeoCoordinates", latitude: spot.lat, longitude: spot.lng },
            ...(avgRating != null
              ? {
                  aggregateRating: {
                    "@type": "AggregateRating",
                    ratingValue: avgRating.toFixed(1),
                    reviewCount: reviews.length,
                  },
                }
              : {}),
          }),
        }}
      />
      <Header />

      <main>
        <div className="register-page-header">
          <h1 style={{ fontFamily: "inherit", fontSize: 20, margin: "0 0 4px" }}>
            {spot.name}
          </h1>
          <p className="admin-muted" style={{ margin: 0 }}>
            {spot.region} · {typeLabel[spot.type]}
          </p>
        </div>

        <div className="page-list">
          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <div className="info-grid">
              <div className="info-box">
                <div className="info-label">수심 정보</div>
                <div className="info-value">{depthLabel[spot.depth]}</div>
              </div>
              <div className={`info-box type-${spot.type}`}>
                <div className="info-label">유형</div>
                <div className="info-value">{typeLabel[spot.type]}</div>
              </div>
            </div>
            <p style={{ marginTop: 12 }}>
              <b>주소</b> {spot.address}
            </p>
            <p>{spot.note}</p>
            <div className="badges" style={{ marginTop: 8 }}>
              {hasRiskNote(spot) && <span className="badge danger">⚠ 주의</span>}
              <a
                className="directions-btn"
                href={naverWebMapUrl(spot)}
                target="_blank"
                rel="noopener noreferrer"
              >
                🧭 지도
              </a>
              <a
                className="directions-btn"
                href={nearbyPensionsUrl(spot)}
                target="_blank"
                rel="noopener noreferrer"
              >
                🏡 근처 펜션
              </a>
            </div>
          </div>

          <div className="item" style={{ cursor: "default", padding: "18px 20px" }}>
            <h2>
              방문자 후기{" "}
              {avgRating != null && (
                <span className="admin-muted" style={{ fontWeight: 400, fontSize: 14 }}>
                  평균 {avgRating.toFixed(1)}점 · {reviews.length}개
                </span>
              )}
            </h2>
            {reviews.length === 0 ? (
              <p className="admin-muted">아직 등록된 후기가 없습니다.</p>
            ) : (
              reviews.map((r, i) => (
                <div key={i} style={{ padding: "10px 0", borderTop: i > 0 ? "1px solid #eee" : "none" }}>
                  <div>
                    <b>{r.nickname || "익명"}</b>{" "}
                    <span className="admin-muted">
                      · {"★".repeat(r.rating)}
                      {r.crowd ? ` · ${crowdLabel[r.crowd]}` : ""}
                    </span>
                  </div>
                  <p style={{ margin: "4px 0 0" }}>{r.comment}</p>
                </div>
              ))
            )}
            <p style={{ marginTop: 12 }}>
              <Link href={`/reviews`}>전체 후기 보기</Link> · 방문 후 <Link href="/">지도</Link>에서
              후기를 남겨보세요.
            </p>
          </div>
        </div>
      </main>

      <footer>
        <Link href="/">지도로 돌아가기</Link> · <a href="/guide">물놀이 안전가이드</a>
      </footer>
    </>
  );
}
