import type { Spot, SpotType, Depth } from "./data";

export const depthLabel: Record<Depth, string> = { shallow: "얕음", medium: "보통", deep: "깊음" };
export const typeLabel: Record<SpotType, string> = { beach: "해수욕장", valley: "계곡" };
export const typeColor: Record<SpotType, string> = { beach: "#2563eb", valley: "#15803d" };

// note에 위험 관련 표현이 있으면 주의 뱃지를 띄운다.
// 새 위험도 데이터를 만드는 대신, 이미 사람이 써둔 note 문구를 그대로 근거로 쓴다.
const RISK_PATTERN = /위험|급류|이안류|다이빙 명소|급경사/;
export function hasRiskNote(spot: Pick<Spot, "note">): boolean {
  return RISK_PATTERN.test(spot.note);
}

// 두 좌표 사이 거리(km). 하버사인 공식.
export function distanceKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

const FAV_KEY = "valley-beach-favorites";

export function getFavorites(): Set<string> {
  if (typeof window === "undefined") return new Set();
  return new Set(JSON.parse(localStorage.getItem(FAV_KEY) || "[]"));
}

export function setFavorites(set: Set<string>): void {
  localStorage.setItem(FAV_KEY, JSON.stringify([...set]));
}

// 네이버 지도 앱 URL Scheme(장소 보기). 모바일 전용, 앱 없으면 그냥 안 열림.
export function naverAppMapUrl(spot: Pick<Spot, "name" | "lat" | "lng">): string {
  const params = new URLSearchParams({
    lat: String(spot.lat),
    lng: String(spot.lng),
    name: spot.name,
    appname: "com.pungdeong.web",
  });
  return `nmap://place?${params.toString()}`;
}

// PC 웹 지도 폴백. 장소 검색 + 좌표 센터링.
export function naverWebMapUrl(spot: Pick<Spot, "name" | "lat" | "lng">): string {
  const c = `${spot.lng},${spot.lat},15,0,0,0,dh`;
  return `https://map.naver.com/p/search/${encodeURIComponent(spot.name)}?c=${c}`;
}

export function isMobileDevice(): boolean {
  if (typeof navigator === "undefined") return false;
  return /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);
}

export function naverMapUrl(spot: Pick<Spot, "name" | "lat" | "lng">): string {
  return isMobileDevice() ? naverAppMapUrl(spot) : naverWebMapUrl(spot);
}

// 좌표 주변 펜션 검색 (네이버 지도 검색, API 키 불필요).
export function nearbyPensionsUrl(spot: Pick<Spot, "lat" | "lng">): string {
  const c = `${spot.lng},${spot.lat},15,0,0,0,dh`;
  return `https://map.naver.com/p/search/${encodeURIComponent("펜션")}?c=${c}`;
}
