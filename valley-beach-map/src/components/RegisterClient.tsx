"use client";

import { useState } from "react";
import { REGIONS } from "@/lib/data";
import { submitSpotSuggestion } from "@/lib/reviews";

export default function RegisterClient() {
  const [name, setName] = useState("");
  const [type, setType] = useState("");
  const [region, setRegion] = useState("");
  const [address, setAddress] = useState("");
  const [depth, setDepth] = useState("");
  const [note, setNote] = useState("");
  const [nickname, setNickname] = useState("");
  const [status, setStatus] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("제보하는 중...");
    try {
      await submitSpotSuggestion({
        name: name.trim(),
        type,
        region,
        address: address.trim(),
        depth: depth || null,
        note: note.trim() || null,
        nickname: nickname.trim() || "익명",
      });
      setStatus("제보해주셔서 감사합니다! 확인 후 지도에 반영됩니다.");
      setName(""); setType(""); setRegion(""); setAddress(""); setDepth(""); setNote(""); setNickname("");
    } catch {
      setStatus("제보에 실패했습니다. Supabase 설정을 확인하세요.");
    }
  }

  return (
    <main>
      <div className="register-page-header">
        <h1 style={{ fontFamily: "inherit", fontSize: 20, margin: 0 }}>장소 등록</h1>
        <p>
          아직 지도에 없는 계곡·해수욕장을 제보해주세요. 이름, 지역, 주소와 대략적인 수심 정도만
          알려주시면 운영자가 위치를 확인한 뒤 지도에 반영합니다. 접근로가 험하거나 위험한 곳이라면
          비고란에 함께 적어주시면 다른 방문자에게 큰 도움이 됩니다.
        </p>
      </div>
      <div className="page-list">
        <div className="item register-form-card" style={{ cursor: "default" }}>
          <form className="register-form" onSubmit={handleSubmit}>
            <label>
              이름 <span className="required">*</span>
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="예: OO계곡, OO해수욕장" required />
            </label>
            <label>
              유형 <span className="required">*</span>
              <select value={type} onChange={(e) => setType(e.target.value)} required>
                <option value="">선택하세요</option>
                <option value="beach">해수욕장</option>
                <option value="valley">계곡</option>
              </select>
            </label>
            <label>
              지역 <span className="required">*</span>
              <select value={region} onChange={(e) => setRegion(e.target.value)} required>
                <option value="">선택하세요</option>
                {REGIONS.map((r) => (
                  <option key={r} value={r}>{r}</option>
                ))}
              </select>
            </label>
            <label>
              주소 <span className="required">*</span>
              <input value={address} onChange={(e) => setAddress(e.target.value)} placeholder="예: 강원특별자치도 강릉시 OO면" required />
            </label>
            <label>
              수심 <span className="optional">(선택)</span>
              <select value={depth} onChange={(e) => setDepth(e.target.value)}>
                <option value="">모름</option>
                <option value="shallow">얕음</option>
                <option value="medium">보통</option>
                <option value="deep">깊음</option>
              </select>
            </label>
            <label>
              설명 <span className="optional">(선택)</span>
              <textarea rows={3} value={note} onChange={(e) => setNote(e.target.value)} placeholder="특징이나 참고할 점을 알려주세요" />
            </label>
            <label>
              닉네임 <span className="optional">(선택, 비우면 익명)</span>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} placeholder="닉네임" />
            </label>
            <button type="submit">제보하기</button>
            {status && <span className="register-status">{status}</span>}
          </form>
        </div>
      </div>
    </main>
  );
}
