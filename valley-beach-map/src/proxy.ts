import { NextRequest, NextResponse } from "next/server";

// 방문자 수 집계용. 세션 쿠키(pd_visit) 있으면 스킵, 없으면(=새 세션) page_views에 1회 기록.
// 브라우저/탭을 닫으면 세션 쿠키가 사라지므로 다시 들어오면 재카운트됨.
const COOKIE = "pd_visit";
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

function todayKST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

export function proxy(req: NextRequest) {
  const today = todayKST();
  const res = NextResponse.next();

  if (!req.cookies.get(COOKIE) && SUPABASE_URL && SERVICE_ROLE_KEY) {
    res.cookies.set(COOKIE, "1", { path: "/" });
    fetch(`${SUPABASE_URL}/rest/v1/page_views`, {
      method: "POST",
      headers: {
        apikey: SERVICE_ROLE_KEY,
        Authorization: `Bearer ${SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        Prefer: "return=minimal",
      },
      body: JSON.stringify({ visit_date: today, country: req.headers.get("x-vercel-ip-country") }),
    }).catch(() => {});
  }

  return res;
}

export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|assets|favicon.ico).*)"],
};
