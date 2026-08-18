"use client";

import { useEffect, useState } from "react";

const coordInputStyle: React.CSSProperties = {
  width: 110,
  padding: "4px 8px",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
};

interface Submission {
  id: string | number;
  name: string;
  type: string;
  region: string;
  address: string;
  depth: string | null;
  note: string | null;
  nickname: string | null;
  created_at: string;
}

export default function AdminSubmissionsClient() {
  const [rows, setRows] = useState<Submission[] | null>(null);
  const [error, setError] = useState("");
  const [coords, setCoords] = useState<Record<string, { lat: string; lng: string }>>({});
  const [busyId, setBusyId] = useState<string | number | null>(null);
  const [geocodingId, setGeocodingId] = useState<string | number | null>(null);

  function load() {
    setError("");
    fetch("/api/admin/submissions")
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

  function setCoord(id: string | number, field: "lat" | "lng", value: string) {
    setCoords((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function approve(id: string | number) {
    const c = coords[id];
    const lat = parseFloat(c?.lat ?? "");
    const lng = parseFloat(c?.lng ?? "");
    if (isNaN(lat) || isNaN(lng)) {
      alert("위도/경도를 숫자로 입력해주세요.");
      return;
    }
    setBusyId(id);
    try {
      const res = await fetch("/api/admin/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, lat, lng }),
      });
      if (!res.ok) throw new Error("승인 실패");
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function geocode(s: Submission) {
    setGeocodingId(s.id);
    try {
      const res = await fetch(`/api/admin/geocode?address=${encodeURIComponent(s.address)}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "좌표를 찾지 못했습니다.");
      setCoords((prev) => ({ ...prev, [s.id]: { lat: String(data.lat), lng: String(data.lng) } }));
    } catch (err) {
      alert(String(err instanceof Error ? err.message : err));
    } finally {
      setGeocodingId(null);
    }
  }

  async function reject(id: string | number) {
    if (!confirm("이 제보를 거절(삭제)할까요?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/submissions?id=${encodeURIComponent(String(id))}`, { method: "DELETE" });
      if (!res.ok) throw new Error("거절 실패");
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      setError(String(err));
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="admin-empty">{error}</div>;
  if (rows === null) return <div className="admin-empty">불러오는 중...</div>;
  if (rows.length === 0) return <div className="admin-empty">대기 중인 제보가 없습니다.</div>;

  return (
    <div className="admin-card-list">
      {rows.map((s) => (
        <div className="admin-card" key={s.id}>
          <div className="admin-card-top">
            <b><span className={`dot ${s.type}`} />{s.name}</b>
            <span className="admin-muted">{s.region}</span>
          </div>
          <div className="admin-muted">{s.address}</div>
          <div className="admin-muted">
            {s.nickname || "익명"} · 수심: {s.depth || "모름"} ·{" "}
            {new Date(s.created_at).toLocaleString("ko-KR", { timeZone: "Asia/Seoul" })}
          </div>
          {s.note && <p>{s.note}</p>}

          <div className="admin-row">
            <button className="admin-btn" onClick={() => geocode(s)} disabled={geocodingId === s.id}>
              {geocodingId === s.id ? "찾는 중..." : "주소로 좌표 찾기"}
            </button>
            <input
              type="number"
              step="any"
              placeholder="위도(lat)"
              style={coordInputStyle}
              value={coords[s.id]?.lat ?? ""}
              onChange={(e) => setCoord(s.id, "lat", e.target.value)}
            />
            <input
              type="number"
              step="any"
              placeholder="경도(lng)"
              style={coordInputStyle}
              value={coords[s.id]?.lng ?? ""}
              onChange={(e) => setCoord(s.id, "lng", e.target.value)}
            />
            <button className="admin-btn admin-btn-primary" onClick={() => approve(s.id)} disabled={busyId === s.id}>
              {busyId === s.id ? "처리 중..." : "승인"}
            </button>
            <button className="admin-btn admin-btn-danger" onClick={() => reject(s.id)} disabled={busyId === s.id}>
              거절
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
