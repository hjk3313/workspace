import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

function authorized(req: NextRequest): boolean {
  return isValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const res = await supabaseAdminFetch("submissions?select=*&order=created_at.desc&limit=200");
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return NextResponse.json({ rows: await res.json() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// 승인: submissions 행을 spots에 옮기고 원본은 지움. 제보 폼엔 좌표 입력이 없어서
// (지오코딩 API 안 붙임 - ponytail: 필요해지면 주소->좌표 변환 붙이기) 관리자가 승인 시 직접 입력.
export async function POST(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => null);
  const { id, lat, lng } = body || {};
  if (!id || typeof lat !== "number" || typeof lng !== "number") {
    return NextResponse.json({ error: "id, lat, lng 필요" }, { status: 400 });
  }

  try {
    const subRes = await supabaseAdminFetch(`submissions?id=eq.${encodeURIComponent(id)}&select=*`);
    if (!subRes.ok) throw new Error(`upstream ${subRes.status}`);
    const [submission] = await subRes.json();
    if (!submission) return NextResponse.json({ error: "제보를 찾을 수 없습니다." }, { status: 404 });

    const insertRes = await supabaseAdminFetch("spots", {
      method: "POST",
      headers: { Prefer: "return=minimal" },
      body: JSON.stringify({
        name: submission.name,
        type: submission.type,
        region: submission.region,
        lat,
        lng,
        depth: submission.depth || "medium",
        note: submission.note || "",
        address: submission.address,
      }),
    });
    if (!insertRes.ok) throw new Error(`spots insert ${insertRes.status}`);

    const delRes = await supabaseAdminFetch(`submissions?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    if (!delRes.ok) throw new Error(`submissions delete ${delRes.status}`);

    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

// 거절: submissions 행만 삭제.
export async function DELETE(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 파라미터 필요" }, { status: 400 });

  try {
    const res = await supabaseAdminFetch(`submissions?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
