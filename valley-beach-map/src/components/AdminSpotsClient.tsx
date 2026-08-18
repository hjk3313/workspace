"use client";

import { useEffect, useState } from "react";
import type { Spot } from "@/lib/data";

interface AdminSpot extends Spot {
  id: string | number;
}

const cellInputStyle: React.CSSProperties = {
  width: "100%",
  padding: "4px 6px",
  border: "1px solid var(--border)",
  borderRadius: 6,
  fontSize: 12,
};

export default function AdminSpotsClient() {
  const [rows, setRows] = useState<AdminSpot[] | null>(null);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [editingId, setEditingId] = useState<string | number | null>(null);
  const [draft, setDraft] = useState<Partial<AdminSpot>>({});
  const [busyId, setBusyId] = useState<string | number | null>(null);

  function load() {
    setError("");
    fetch("/api/admin/spots")
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

  function startEdit(spot: AdminSpot) {
    setEditingId(spot.id);
    setDraft(spot);
  }

  async function save(id: string | number) {
    setBusyId(id);
    try {
      const { id: _omit, ...fields } = draft;
      const res = await fetch("/api/admin/spots", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...fields }),
      });
      if (!res.ok) throw new Error("저장 실패");
      setRows((prev) => (prev ? prev.map((r) => (r.id === id ? ({ ...r, ...fields } as AdminSpot) : r)) : prev));
      setEditingId(null);
    } catch (err) {
      alert(String(err));
    } finally {
      setBusyId(null);
    }
  }

  async function remove(id: string | number) {
    if (!confirm("이 장소를 지도에서 삭제할까요?")) return;
    setBusyId(id);
    try {
      const res = await fetch(`/api/admin/spots?id=${encodeURIComponent(String(id))}`, { method: "DELETE" });
      if (!res.ok) throw new Error("삭제 실패");
      setRows((prev) => (prev ? prev.filter((r) => r.id !== id) : prev));
    } catch (err) {
      alert(String(err));
    } finally {
      setBusyId(null);
    }
  }

  if (error) return <div className="admin-empty">{error}</div>;
  if (rows === null) return <div className="admin-empty">불러오는 중...</div>;

  const filtered = rows.filter(
    (s) => !search || s.name.toLowerCase().includes(search) || s.region.toLowerCase().includes(search)
  );

  return (
    <>
      <div className="admin-toolbar">
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value.toLowerCase())}
          placeholder="이름 또는 지역으로 검색..."
          style={{ ...cellInputStyle, width: 260 }}
        />
        <span className="admin-muted">{filtered.length} / {rows.length}곳</span>
      </div>

      <div className="admin-table-wrap">
        <table className="admin-table">
          <thead>
            <tr>
              <th>이름</th>
              <th>지역</th>
              <th>유형</th>
              <th>수심</th>
              <th>위도</th>
              <th>경도</th>
              <th>주소</th>
              <th>설명</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((s) =>
              editingId === s.id ? (
                <tr key={s.id}>
                  <td><input style={cellInputStyle} value={draft.name ?? ""} onChange={(e) => setDraft((d) => ({ ...d, name: e.target.value }))} /></td>
                  <td><input style={cellInputStyle} value={draft.region ?? ""} onChange={(e) => setDraft((d) => ({ ...d, region: e.target.value }))} /></td>
                  <td>
                    <select style={cellInputStyle} value={draft.type ?? "beach"} onChange={(e) => setDraft((d) => ({ ...d, type: e.target.value as Spot["type"] }))}>
                      <option value="beach">해수욕장</option>
                      <option value="valley">계곡</option>
                    </select>
                  </td>
                  <td>
                    <select style={cellInputStyle} value={draft.depth ?? "medium"} onChange={(e) => setDraft((d) => ({ ...d, depth: e.target.value as Spot["depth"] }))}>
                      <option value="shallow">얕음</option>
                      <option value="medium">보통</option>
                      <option value="deep">깊음</option>
                    </select>
                  </td>
                  <td><input style={{ ...cellInputStyle, width: 80 }} type="number" step="any" value={draft.lat ?? ""} onChange={(e) => setDraft((d) => ({ ...d, lat: parseFloat(e.target.value) }))} /></td>
                  <td><input style={{ ...cellInputStyle, width: 80 }} type="number" step="any" value={draft.lng ?? ""} onChange={(e) => setDraft((d) => ({ ...d, lng: parseFloat(e.target.value) }))} /></td>
                  <td><input style={cellInputStyle} value={draft.address ?? ""} onChange={(e) => setDraft((d) => ({ ...d, address: e.target.value }))} /></td>
                  <td><input style={cellInputStyle} value={draft.note ?? ""} onChange={(e) => setDraft((d) => ({ ...d, note: e.target.value }))} /></td>
                  <td className="admin-row" style={{ flexWrap: "nowrap" }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => save(s.id)} disabled={busyId === s.id}>
                      {busyId === s.id ? "저장 중" : "저장"}
                    </button>
                    <button className="admin-btn" onClick={() => setEditingId(null)}>취소</button>
                  </td>
                </tr>
              ) : (
                <tr key={s.id}>
                  <td><span className={`dot ${s.type}`} />{s.name}</td>
                  <td>{s.region}</td>
                  <td>{s.type === "beach" ? "해수욕장" : "계곡"}</td>
                  <td>{s.depth === "shallow" ? "얕음" : s.depth === "deep" ? "깊음" : "보통"}</td>
                  <td>{s.lat}</td>
                  <td>{s.lng}</td>
                  <td className="admin-td-ellipsis" title={s.address}>{s.address}</td>
                  <td className="admin-td-ellipsis" title={s.note}>{s.note}</td>
                  <td className="admin-row" style={{ flexWrap: "nowrap" }}>
                    <button className="admin-btn" onClick={() => startEdit(s)}>수정</button>
                    <button className="admin-btn admin-btn-danger" onClick={() => remove(s.id)} disabled={busyId === s.id}>
                      {busyId === s.id ? "삭제 중" : "삭제"}
                    </button>
                  </td>
                </tr>
              )
            )}
          </tbody>
        </table>
      </div>
    </>
  );
}
