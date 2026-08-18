import { NextRequest, NextResponse } from "next/server";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";
import { supabaseAdminFetch } from "@/lib/supabaseAdmin";

function authorized(req: NextRequest): boolean {
  return isValidSession(req.cookies.get(ADMIN_SESSION_COOKIE)?.value);
}

// KST 기준 "YYYY-MM-DD HH" 시간 단위 키
function hourKeyKST(iso: string): string {
  return new Date(iso).toLocaleString("sv-SE", { timeZone: "Asia/Seoul", hour12: false }).slice(0, 13);
}

function bucketCountries<T extends { country: string | null }>(rows: T[], keyOf: (row: T) => string) {
  const buckets = new Map<string, Map<string, number>>();
  for (const row of rows) {
    const key = keyOf(row);
    const country = row.country || "알수없음";
    if (!buckets.has(key)) buckets.set(key, new Map());
    const m = buckets.get(key)!;
    m.set(country, (m.get(country) || 0) + 1);
  }
  return buckets;
}

function bucketEntry(m: Map<string, number> | undefined) {
  const countries = [...(m?.entries() ?? [])].map(([country, count]) => ({ country, count })).sort((a, b) => b.count - a.count);
  const count = countries.reduce((sum, c) => sum + c.count, 0);
  return { count, countries };
}

async function fetchHourly() {
  const cutoffISO = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const res = await supabaseAdminFetch(`page_views?select=created_at,country&created_at=gte.${cutoffISO}`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const rows: { created_at: string; country: string | null }[] = await res.json();
  const buckets = bucketCountries(rows, (r) => hourKeyKST(r.created_at));

  const result = [];
  for (let i = 23; i >= 0; i--) {
    const key = hourKeyKST(new Date(Date.now() - i * 60 * 60 * 1000).toISOString());
    result.push({ date: key, ...bucketEntry(buckets.get(key)) });
  }
  return result;
}

async function fetchDaily(days: number) {
  const cutoff = new Date(Date.now() - days * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);
  const res = await supabaseAdminFetch(`page_views?select=visit_date,country&visit_date=gte.${cutoff}&order=visit_date.desc`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const rows: { visit_date: string; country: string | null }[] = await res.json();
  const buckets = bucketCountries(rows, (r) => r.visit_date);

  return [...buckets.entries()]
    .map(([date, m]) => ({ date, ...bucketEntry(m) }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

async function fetchHourlyForDay(date: string) {
  const startISO = new Date(`${date}T00:00:00+09:00`).toISOString();
  const endISO = new Date(`${date}T23:59:59.999+09:00`).toISOString();
  const res = await supabaseAdminFetch(`page_views?select=created_at,country&created_at=gte.${startISO}&created_at=lte.${endISO}`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const rows: { created_at: string; country: string | null }[] = await res.json();
  const buckets = bucketCountries(rows, (r) => hourKeyKST(r.created_at));

  const result = [];
  for (let h = 0; h < 24; h++) {
    const key = `${date} ${String(h).padStart(2, "0")}`;
    result.push({ date: key, ...bucketEntry(buckets.get(key)) });
  }
  return result;
}

async function fetchDailyBetween(from: string, to: string) {
  const res = await supabaseAdminFetch(`page_views?select=visit_date,country&visit_date=gte.${from}&visit_date=lte.${to}&order=visit_date.desc`);
  if (!res.ok) throw new Error(`upstream ${res.status}`);
  const rows: { visit_date: string; country: string | null }[] = await res.json();
  const buckets = bucketCountries(rows, (r) => r.visit_date);

  return [...buckets.entries()]
    .map(([date, m]) => ({ date, ...bucketEntry(m) }))
    .sort((a, b) => (a.date < b.date ? 1 : -1));
}

export async function GET(req: NextRequest) {
  if (!authorized(req)) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const range = req.nextUrl.searchParams.get("range") || "30d";
  const from = req.nextUrl.searchParams.get("from");
  const to = req.nextUrl.searchParams.get("to");
  const isCustom = Boolean(from && to);
  const isSingleDay = isCustom && from === to;

  try {
    const [days, totalRes] = await Promise.all([
      isSingleDay
        ? fetchHourlyForDay(from as string)
        : isCustom
        ? fetchDailyBetween(from as string, to as string)
        : range === "24h"
        ? fetchHourly()
        : fetchDaily(range === "7d" ? 7 : 30),
      supabaseAdminFetch("page_views?select=id&limit=1", { headers: { Prefer: "count=exact" } }),
    ]);
    if (!totalRes.ok) throw new Error(`upstream ${totalRes.status}`);
    const total = Number(totalRes.headers.get("content-range")?.split("/")[1] || 0);

    return NextResponse.json({ days, total, range: isCustom ? "custom" : range });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
