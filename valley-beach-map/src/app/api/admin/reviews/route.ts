import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

function authorized(req: NextRequest): boolean {
  return isValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  try {
    const res = await supabaseAdminFetch("reviews?select=*&order=created_at.desc&limit=500");
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return NextResponse.json({ rows: await res.json() });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const id = req.nextUrl.searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id 파라미터 필요" }, { status: 400 });

  try {
    // ponytail: PK 컬럼명이 실제로 'id'인지 미확인 (기존 코드가 한번도 select 안 함) -
    // 안 지워지면 Supabase 테이블의 실제 PK 컬럼명 확인해서 여기 쿼리만 바꾸면 됨.
    const res = await supabaseAdminFetch(`reviews?id=eq.${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: { Prefer: "return=minimal" },
    });
    if (!res.ok) throw new Error(`upstream ${res.status}`);
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
