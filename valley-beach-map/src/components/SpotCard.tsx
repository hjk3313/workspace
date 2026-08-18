import Link from "next/link";
import type { Spot } from "@/lib/data";
import { depthLabel, typeLabel, hasRiskNote, naverMapUrl } from "@/lib/common";
import { shareSpotToKakao, KAKAO_SHARE_ENABLED } from "@/lib/kakao";

const PIN_ICON = (
  <svg
    width="11"
    height="11"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2.2}
    style={{ verticalAlign: "-1px", marginRight: 4 }}
  >
    <path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z" />
    <circle cx="12" cy="10" r="2.3" />
  </svg>
);

export default function SpotCard({
  spot,
  isFav,
  dist,
  reviewText,
  onClick,
  onToggleFav,
  onOpenReview,
}: {
  spot: Spot;
  isFav: boolean;
  dist?: number | null;
  reviewText: string;
  onClick?: () => void;
  onToggleFav: () => void;
  onOpenReview: () => void;
}) {
  return (
    <div className="item" onClick={onClick}>
      <div className="row1">
        <span className="name">
          <span className={`dot ${spot.type}`} />
          {spot.name}
        </span>
        <span className="region">{spot.region}</span>
      </div>
      <div className="pin">
        {PIN_ICON}
        {spot.address}
        {dist != null ? ` · ${dist.toFixed(1)}km` : ""}
      </div>
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
      <div className="note">{spot.note}</div>
      <div className="badges">
        {hasRiskNote(spot) && <span className="badge danger">⚠ 주의</span>}
        <button
          className={`fav-btn ${isFav ? "active" : ""}`}
          onClick={(e) => {
            e.stopPropagation();
            onToggleFav();
          }}
        >
          {isFav ? "★ 즐겨찾기됨" : "☆ 즐겨찾기"}
        </button>
        <button
          className="review-btn"
          onClick={(e) => {
            e.stopPropagation();
            onOpenReview();
          }}
        >
          💬 후기
        </button>
        <a
          className="directions-btn"
          href={naverMapUrl(spot)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
        >
          🧭 지도
        </a>
        <Link
          href={`/spot/${encodeURIComponent(spot.name)}`}
          className="review-btn"
          onClick={(e) => e.stopPropagation()}
        >
          📄 상세보기
        </Link>
        {KAKAO_SHARE_ENABLED && (
          <button
            className="kakao-share-btn"
            onClick={(e) => {
              e.stopPropagation();
              shareSpotToKakao(spot).catch(() => alert("카카오톡 공유를 사용할 수 없습니다."));
            }}
          >
            💬 카톡 공유
          </button>
        )}
      </div>
      <div className="stats">{reviewText}</div>
    </div>
  );
}
