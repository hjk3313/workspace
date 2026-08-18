// 네이버 지도 SDK는 공식 타입 패키지가 없어서 필요한 만큼만 any로 선언.
export {};

declare global {
  interface Window {
    naver: any;
    navermap_authFailure?: () => void;
  }
}
