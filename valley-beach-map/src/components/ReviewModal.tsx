"use client";

import { useEffect, useState } from "react";
import { fetchReviewsForSpot, submitReview, crowdLabel, type Review, type Crowd } from "@/lib/reviews";

export default function ReviewModal({
  spotName,
  onClose,
  onSubmitted,
}: {
  spotName: string | null;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reviews, setReviews] = useState<Review[] | null>(null);
  const [nickname, setNickname] = useState("");
  const [rating, setRating] = useState("3");
  const [comment, setComment] = useState("");
  const [crowd, setCrowd] = useState("");
  const [status, setStatus] = useState("");

  useEffect(() => {
    if (!spotName) return;
    setReviews(null);
    setStatus("");
    setNickname("");
    setRating("3");
    setComment("");
    setCrowd("");
    fetchReviewsForSpot(spotName)
      .then(setReviews)
      .catch(() => setReviews([]));
  }, [spotName]);

  if (!spotName) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("등록 중...");
    try {
      await submitReview({
        spotName: spotName as string,
        rating: Number(rating),
        nickname,
        comment,
        crowd: (crowd || null) as Crowd | null,
      });
      setStatus("등록되었습니다.");
      setNickname("");
      setComment("");
      setCrowd("");
      setReviews(await fetchReviewsForSpot(spotName as string));
      onSubmitted();
    } catch {
      setStatus("등록에 실패했습니다. Supabase 설정을 확인하세요.");
    }
  }

  return (
    <div
      className="modal-overlay open"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <div className="modal-header">
          <h3>{spotName} 후기</h3>
          <button className="modal-close-btn" onClick={onClose}>닫기</button>
        </div>
        <div>
          {reviews === null ? (
            "불러오는 중..."
          ) : reviews.length === 0 ? (
            <div className="review-item">아직 후기가 없습니다. 첫 후기를 남겨보세요.</div>
          ) : (
            reviews.map((r, i) => (
              <div className="review-item" key={i}>
                <div className="review-meta">
                  {r.nickname || "익명"} · {r.rating}점
                  {r.crowd ? ` · ${crowdLabel[r.crowd]}` : ""} · {new Date(r.created_at).toLocaleDateString("ko-KR")}
                </div>
                <div>{r.comment}</div>
              </div>
            ))
          )}
        </div>
        <form className="review-form" onSubmit={handleSubmit}>
          <input
            value={nickname}
            onChange={(e) => setNickname(e.target.value)}
            placeholder="닉네임 (선택, 비우면 익명)"
          />
          <select value={rating} onChange={(e) => setRating(e.target.value)}>
            <option value="5">5점 - 최고예요</option>
            <option value="4">4점 - 좋아요</option>
            <option value="3">3점 - 보통</option>
            <option value="2">2점 - 별로예요</option>
            <option value="1">1점 - 비추천</option>
          </select>
          <select value={crowd} onChange={(e) => setCrowd(e.target.value)}>
            <option value="">혼잡도 (선택 안 함)</option>
            <option value="quiet">한적함</option>
            <option value="normal">보통</option>
            <option value="busy">붐빔</option>
          </select>
          <textarea
            rows={3}
            required
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="후기를 남겨주세요"
          />
          <button type="submit">후기 등록</button>
          {status && <span className="review-status">{status}</span>}
        </form>
      </div>
    </div>
  );
}
