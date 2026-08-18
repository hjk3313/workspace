// Supabase 프로젝트 URL과 anon public 키.
// https://supabase.com > 프로젝트 > Project Settings > API
const SUPABASE_URL = "https://ewyttwzexgupzytssbhi.supabase.co";
const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV3eXR0d3pleGd1cHp5dHNzYmhpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3ODUxMjUzMTQsImV4cCI6MjEwMDcwMTMxNH0.dMqfIpdGmLbON3ZgoZ26Fr4PUVh1ZLP_rYiPI5QpHPk";

const depthLabel = { shallow: "얕음", medium: "보통", deep: "깊음" };
const typeLabel = { beach: "해수욕장", valley: "계곡" };
const typeColor = { beach: "#2563eb", valley: "#15803d" };

const PIN_ICON = '<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" style="vertical-align:-1px;margin-right:4px;"><path d="M12 21s-7-6.5-7-11a7 7 0 1 1 14 0c0 4.5-7 11-7 11z"/><circle cx="12" cy="10" r="2.3"/></svg>';

const SPOT_BY_NAME = Object.fromEntries(SPOTS.map(s => [s.name, s]));
const REGIONS = [...new Set(SPOTS.map(s => s.region))].sort();

// note에 위험 관련 표현이 있으면 주의 뱃지를 띄운다.
// 새 위험도 데이터를 만드는 대신, 이미 사람이 써둔 note 문구를 그대로 근거로 쓴다.
const RISK_PATTERN = /위험|급류|이안류|다이빙 명소|급경사/;
function hasRiskNote(spot) {
  return RISK_PATTERN.test(spot.note);
}

// 두 좌표 사이 거리(km). 하버사인 공식.
function distanceKm(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// index.html과 favorites.html이 공유하는 장소 카드 마크업.
// reviewStatsText는 reviews-widget.js에서 정의되지만, 이 함수는 호출 시점에만
// 참조하므로 스크립트 로드 순서(data.js -> common.js -> reviews-widget.js)와 무관하게 동작한다.
// dist(km)를 넘기면 주소 옆에 거리를 표시한다 (거리순 정렬용, 선택값).
function spotCardHTML(spot, isFav, dist) {
  return `
    <div class="row1">
      <span class="name"><span class="dot ${spot.type}"></span>${spot.name}</span>
      <span class="region">${spot.region}</span>
    </div>
    <div class="pin">${PIN_ICON}${spot.address}${dist != null ? ` · ${dist.toFixed(1)}km` : ""}</div>
    <div class="info-grid">
      <div class="info-box">
        <div class="info-label">수심 정보</div>
        <div class="info-value">${depthLabel[spot.depth]}</div>
      </div>
      <div class="info-box type-${spot.type}">
        <div class="info-label">유형</div>
        <div class="info-value">${typeLabel[spot.type]}</div>
      </div>
    </div>
    <div class="note">${spot.note}</div>
    <div class="badges">
      ${hasRiskNote(spot) ? '<span class="badge danger">⚠ 주의</span>' : ""}
      <button class="fav-btn ${isFav ? "active" : ""}">${isFav ? "즐겨찾기됨" : "즐겨찾기"}</button>
      <button class="review-btn">후기</button>
    </div>
    <div class="stats">${reviewStatsText(spot.name)}</div>
  `;
}

const FAV_KEY = "valley-beach-favorites";

function getFavorites() {
  return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
}

function setFavorites(set) {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}

async function supabaseFetch(path, options = {}) {
  if (!SUPABASE_URL.startsWith("http")) throw new Error("Supabase 설정이 안 되어 있습니다.");
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}
