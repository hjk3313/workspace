"use client";

import { useEffect, useState } from "react";
import { crowdLabel, type Review } from "@/lib/reviews";

interface AdminReview extends Review {
  id: string | number;
}

export default function AdminReviewsClient() {
  const [rows, setRows] = useState<AdminReview[] | null>(null);
  const [error, setError] = useState("");
  const [deletingId, setDeletingId] = useState<string | number | null>(null);

  function load() {
    setError("");
    fetch("/api/admin/reviews")
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setRows(data.rows);
      })
      .catch((err) => setError(String(err)));
  }

  useEffect(() => {
    load();
  }, []);

  async function handleDelete(id: string | number) {
    if (!confirm("이 후기를 삭제할까요?")) return;
    setDeletingId(id);
    try {
      const res = await fetch(`/api/admin/reviews?id=${encodeURIComponent(String(id))}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      setError(String(err));
    } finally {
      setDeletingId(null);
    }
  }

  if (error) return <div className="admin-empty">{error}</div>;
  if (rows === null) return <div className="admin-empty">불러오는 중...</div>;
  if (rows.length === 0) return <div className="admin-empty">등록된 후기가 없습니다.</div>;

  return (
    <div className="admin-card-list">
      {rows.map((r) => (
        <div className="admin-card" key={r.id}>
          <div className="admin-card-top">
            <b>{r.spot_name}</b>
            <span className="admin-muted">
              {new Date(r.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
            </span>
          </div>
          <div className="admin-muted">
            {r.nickname || "익명"} · {r.rating}점{r.crowd ? ` · ${crowdLabel[r.crowd]}` : ""}
          </div>
          <p>{r.comment}</p>
          <button className="admin-btn admin-btn-danger" onClick={() => handleDelete(r.id)} disabled={deletingId === r.id}>
            {deletingId === r.id ? "삭제 중..." : "삭제"}
          </button>
        </div>
      ))}
    </div>
  );
}
