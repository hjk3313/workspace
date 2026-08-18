// 카카오 앱 심사 끝날 때까지 버튼만 숨김. 심사 통과하면 true로.
export const KAKAO_SHARE_ENABLED = false;

declare global {
  interface Window {
    Kakao?: any;
  }
}

const KAKAO_JS_KEY = process.env.NEXT_PUBLIC_KAKAO_JS_KEY || "";

function loadKakaoSdk(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.Kakao?.isInitialized?.()) return resolve();
    if (!KAKAO_JS_KEY) return reject(new Error("NEXT_PUBLIC_KAKAO_JS_KEY 미설정"));

    const existing = document.getElementById("kakao-sdk") as HTMLScriptElement | null;
    if (existing) {
      existing.addEventListener("load", () => {
        window.Kakao.init(KAKAO_JS_KEY);
        resolve();
      });
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-sdk";
    script.src = "https://developers.kakao.com/sdk/js/kakao.min.js";
    script.onload = () => {
      window.Kakao.init(KAKAO_JS_KEY);
      resolve();
    };
    script.onerror = () => reject(new Error("카카오 SDK 로드 실패"));
    document.head.appendChild(script);
  });
}

export async function shareSpotToKakao(spot: { name: string; note: string; region: string }) {
  await loadKakaoSdk();
  const link = `https://www.pungdeong.com/?q=${encodeURIComponent(spot.name)}`;
  window.Kakao.Share.sendDefault({
    objectType: "text",
    text: `${spot.name} - 풍덩\n${spot.region} · ${spot.note}`,
    link: { mobileWebUrl: link, webUrl: link },
  });
}
