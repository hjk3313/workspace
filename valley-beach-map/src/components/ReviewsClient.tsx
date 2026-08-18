"use client";

import { useEffect, useMemo, useState } from "react";
import { fetchAllReviews, crowdLabel, type Review } from "@/lib/reviews";
import { useSpots } from "@/lib/spots";
import ReviewModal from "./ReviewModal";

type SortMode = "latest" | "rating";

export default function ReviewsClient() {
  const [rows, setRows] = useState<Review[] | null>(null);
  const [error, setError] = useState(false);
  const [sort, setSort] = useState<SortMode>("latest");
  const [openReviewSpot, setOpenReviewSpot] = useState<string | null>(null);
  const { spots } = useSpots();
  const spotByName = useMemo(() => Object.fromEntries(spots.map((s) => [s.name, s])), [spots]);

  function load() {
    setRows(null);
    setError(false);
    fetchAllReviews()
      .then(setRows)
      .catch(() => setError(true));
  }

  useEffect(() => {
    load();
  }, []);

  const sortedRows = useMemo(() => {
    if (!rows) return rows;
    if (sort === "rating") return [...rows].sort((a, b) => b.rating - a.rating);
    return rows;
  }, [rows, sort]);

  return (
    <main>
      <p className="sr-only">
        풍덩 이용자들이 직접 방문하고 남긴 계곡·해수욕장 후기를 최신순으로 모아봤습니다. 평점, 혼잡도,
        방문 시점을 함께 확인할 수 있어 실제 수심과 물놀이 상태를 가늠하는 데 참고가 됩니다.
      </p>
      <div className="page-list">
        {rows && rows.length > 0 && (
          <div className="filter-row" style={{ padding: "16px 0 4px" }}>
            <span className="filter-label">정렬</span>
            <div className="pills">
              <button className={`pill ${sort === "latest" ? "active" : ""}`} onClick={() => setSort("latest")}>최신순</button>
              <button className={`pill ${sort === "rating" ? "active" : ""}`} onClick={() => setSort("rating")}>평점높은순</button>
            </div>
          </div>
        )}

        {error ? (
          <div className="empty-state">후기를 불러오지 못했습니다. Supabase 설정을 확인하세요.</div>
        ) : sortedRows === null ? (
          <div className="empty-state">불러오는 중...</div>
        ) : sortedRows.length === 0 ? (
          <div className="empty-state">
            아직 등록된 후기가 없어요.
            <br />
            <a href="/">지도에서 장소를 찾아</a> 첫 후기를 남겨보세요.
          </div>
        ) : (
          sortedRows.map((r, i) => {
            const spot = spotByName[r.spot_name];
            return (
              <div className="item" style={{ cursor: "default" }} key={i}>
                <div className="row1">
                  <span className="name">
                    {spot && <span className={`dot ${spot.type}`} />}
                    {r.spot_name}
                  </span>
                  <span className="region">{spot ? spot.region : ""}</span>
                </div>
                <div className="stats">
                  {r.nickname || "익명"} · {r.rating}점
                  {r.crowd ? ` · ${crowdLabel[r.crowd]}` : ""} · {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </div>
                <div className="note">{r.comment}</div>
                <div className="badges">
                  <button className="review-btn" onClick={() => setOpenReviewSpot(r.spot_name)}>
                    이 장소에 후기 남기기
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      <ReviewModal spotName={openReviewSpot} onClose={() => setOpenReviewSpot(null)} onSubmitted={load} />
    </main>
  );
}
