// 장소 데이터는 Supabase `spots` 테이블이 원본. src/lib/spots.ts에서 읽어옴.
// (예전엔 이 파일에 84곳이 하드코딩돼 있었음 - DB로 이관 완료, 그 배열은 DB 시드용으로만 한 번 쓰고 삭제)

export type SpotType = "beach" | "valley";
export type Depth = "shallow" | "medium" | "deep";

export interface Spot {
  name: string;
  type: SpotType;
  region: string;
  lat: number;
  lng: number;
  depth: Depth;
  note: string;
  address: string;
}

// 제보 폼 지역 선택지는 DB에 아직 없는 지역도 고를 수 있어야 하니 고정 목록으로 유지.
export const REGIONS: string[] = [
  "서울", "인천", "경기", "강원", "충북", "충남",
  "전북", "전남", "경북", "경남", "부산", "대구", "울산", "광주", "대전", "세종", "제주",
];
