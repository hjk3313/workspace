import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";

export async function GET(req: NextRequest) {
  if (!isValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const address = req.nextUrl.searchParams.get("address");
  const clientId = process.env.NAVER_GEOCODING_CLIENT_ID;
  const clientSecret = process.env.NAVER_GEOCODING_CLIENT_SECRET;

  if (!address) return NextResponse.json({ error: "address 파라미터 필요" }, { status: 400 });
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "NAVER_GEOCODING_CLIENT_ID/SECRET 미설정" }, { status: 500 });
  }

  const url = `https://maps.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(address)}`;
  try {
    const res = await fetch(url, {
      headers: {
        Accept: "application/json",
        "x-ncp-apigw-api-key-id": clientId,
        "x-ncp-apigw-api-key": clientSecret,
      },
    });
    if (!res.ok) {
      const bodyText = await res.text().catch(() => "");
      throw new Error(`upstream ${res.status}: ${bodyText}`);
    }
    const data = await res.json();
    const first = data?.addresses?.[0];
    if (!first) return NextResponse.json({ error: "주소를 찾을 수 없습니다." }, { status: 404 });

    return NextResponse.json({ lat: parseFloat(first.y), lng: parseFloat(first.x) });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
