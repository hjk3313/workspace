"use client";

import { useEffect, useState } from "react";

interface CountryCount {
  country: string;
  count: number;
}

interface DayCount {
  date: string;
  count: number;
  countries: CountryCount[];
}

const regionNames = new Intl.DisplayNames(["ko"], { type: "region" });

function countryLabel(code: string): string {
  if (code === "알수없음") return code;
  try {
    return regionNames.of(code) || code;
  } catch {
    return code;
  }
}

type Range = "24h" | "7d" | "30d" | "custom";

const RANGE_TABS: { value: Range; label: string }[] = [
  { value: "24h", label: "24시간" },
  { value: "7d", label: "7일" },
  { value: "30d", label: "30일" },
  { value: "custom", label: "기간 선택" },
];

function todayKST(): string {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
}

// 어제/오늘 사이 구간도 이어지게 from~to 전체를 0으로 채움.
function fillCustomRange(days: DayCount[], from: string, to: string): DayCount[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const filled: DayCount[] = [];
  const cursor = new Date(`${from}T00:00:00+09:00`);
  const end = new Date(`${to}T00:00:00+09:00`);
  while (cursor <= end) {
    const date = cursor.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    filled.push(byDate.get(date) || { date, count: 0, countries: [] });
    cursor.setDate(cursor.getDate() + 1);
  }
  return filled;
}

function niceStep(rough: number): number {
  if (rough <= 0) return 1;
  const pow = Math.pow(10, Math.floor(Math.log10(rough)));
  const norm = rough / pow;
  const step = norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10;
  return step * pow;
}

function formatLabel(date: string): string {
  if (date.length === 13) {
    return `${date.slice(11, 13)}시`;
  }
  return new Date(`${date}T00:00:00+09:00`).toLocaleDateString("ko-KR", {
    year: "2-digit",
    month: "numeric",
    day: "numeric",
    timeZone: "Asia/Seoul",
  });
}

// 조회 안 된 날(방문 0)도 이어지게 구간 전체를 0으로 채움. 24시간 뷰는 서버에서 이미 채워서 옴.
function fillRange(days: DayCount[], daysBack: number): DayCount[] {
  const byDate = new Map(days.map((d) => [d.date, d]));
  const today = new Date();
  const filled: DayCount[] = [];
  for (let i = daysBack - 1; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(d.getDate() - i);
    const date = d.toLocaleDateString("en-CA", { timeZone: "Asia/Seoul" });
    filled.push(byDate.get(date) || { date, count: 0, countries: [] });
  }
  return filled;
}

export default function AdminVisitsClient() {
  const [range, setRange] = useState<Range>("30d");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState(todayKST());
  const [days, setDays] = useState<DayCount[] | null>(null);
  const [total, setTotal] = useState(0);
  const [error, setError] = useState("");

  const customReady = range === "custom" && Boolean(fromDate) && Boolean(toDate) && fromDate <= toDate;

  useEffect(() => {
    if (range === "custom" && !customReady) return;
    setDays(null);
    setError("");
    const query = range === "custom" ? `from=${fromDate}&to=${toDate}` : `range=${range}`;
    fetch(`/api/admin/visits?${query}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setDays(data.days);
        setTotal(data.total ?? 0);
      })
      .catch((err) => setError(String(err)));
  }, [range, customReady, fromDate, toDate]);

  const rangeLabel =
    range === "custom"
      ? customReady
        ? fromDate === toDate
          ? fromDate
          : `${fromDate} ~ ${toDate}`
        : "기간 선택"
      : RANGE_TABS.find((t) => t.value === range)?.label ?? "";

  return (
    <div>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-top">
          <b>총 방문자</b>
        </div>
        <p style={{ fontSize: 32, fontWeight: 700 }}>{total}명</p>
      </div>

      <div className="admin-tabs" style={{ marginBottom: 12 }}>
        {RANGE_TABS.map((t) => (
          <button key={t.value} className={range === t.value ? "active" : ""} onClick={() => setRange(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      {range === "custom" && (
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 12 }}>
          <input type="date" value={fromDate} max={toDate || undefined} onChange={(e) => setFromDate(e.target.value)} />
          <span>~</span>
          <input type="date" value={toDate} min={fromDate || undefined} max={todayKST()} onChange={(e) => setToDate(e.target.value)} />
        </div>
      )}

      {error && <div className="admin-empty">{error}</div>}
      {range === "custom" && !customReady && <div className="admin-empty">시작일과 종료일을 선택하세요.</div>}
      {!error && (range !== "custom" || customReady) && days === null && <div className="admin-empty">불러오는 중...</div>}
      {!error && days !== null && days.length === 0 && <div className="admin-empty">방문 기록이 없습니다.</div>}
      {!error && days !== null && days.length > 0 && (
        <VisitsChart days={days} range={range} rangeLabel={rangeLabel} from={fromDate} to={toDate} />
      )}
    </div>
  );
}

function VisitsChart({
  days,
  range,
  rangeLabel,
  from,
  to,
}: {
  days: DayCount[];
  range: Range;
  rangeLabel: string;
  from: string;
  to: string;
}) {
  const isHourly = days.length > 0 && days[0].date.length === 13;
  const chartDays = isHourly ? days : range === "custom" ? fillCustomRange(days, from, to) : fillRange(days, range === "7d" ? 7 : 30);
  const max = Math.max(...chartDays.map((d) => d.count));
  const step = niceStep(max / 2);
  const topTick = step * 3;
  const ticks = [0, step, step * 2, step * 3];

  const W = 640;
  const H = 220;
  const padL = 28;
  const padB = 24;
  const padT = 12;
  const plotW = W - padL;
  const plotH = H - padB - padT;

  const x = (i: number) => padL + (i / (chartDays.length - 1)) * plotW;
  const y = (v: number) => padT + plotH - (v / topTick) * plotH;

  const points = chartDays.map((d, i) => `${x(i)},${y(d.count)}`).join(" ");
  const labelEvery = Math.ceil(chartDays.length / 6);

  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const toggleExpanded = (date: string) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(date) ? next.delete(date) : next.add(date);
      return next;
    });

  const [hover, setHover] = useState<number | null>(null);
  const hovered = hover !== null ? chartDays[hover] : null;
  const tooltipW = 80;
  const tooltipX = hover !== null ? Math.min(Math.max(x(hover) - tooltipW / 2, 0), W - tooltipW) : 0;

  return (
    <>
      <div className="admin-card" style={{ marginBottom: 16 }}>
        <div className="admin-card-top">
          <b>최근 {rangeLabel} 추이</b>
        </div>
        <svg viewBox={`0 0 ${W} ${H}`} style={{ width: "100%", height: "auto", marginTop: 8 }}>
          {ticks.map((t) => (
            <g key={t}>
              <line x1={padL} y1={y(t)} x2={W} y2={y(t)} stroke="var(--border)" strokeWidth={1} />
              <text x={0} y={y(t) + 4} fontSize={10} fill="var(--text-gray)">
                {t}
              </text>
            </g>
          ))}
          <polyline points={points} fill="none" stroke="var(--accent)" strokeWidth={2} />
          {chartDays.map((d, i) =>
            i % labelEvery === 0 ? (
              <text key={d.date} x={x(i)} y={H - 4} fontSize={9} fill="var(--text-gray)" textAnchor="middle">
                {formatLabel(d.date)}
              </text>
            ) : null
          )}
          {hover !== null && <line x1={x(hover)} y1={padT} x2={x(hover)} y2={padT + plotH} stroke="var(--border)" strokeWidth={1} />}
          {hover !== null && <circle cx={x(hover)} cy={y(chartDays[hover].count)} r={4} fill="var(--accent)" style={{ pointerEvents: "none" }} />}
          <rect
            x={padL}
            y={0}
            width={plotW}
            height={H}
            fill="transparent"
            onMouseMove={(e) => {
              const rect = e.currentTarget.getBoundingClientRect();
              const frac = (e.clientX - rect.left) / rect.width;
              const i = Math.round(frac * (chartDays.length - 1));
              setHover(Math.min(Math.max(i, 0), chartDays.length - 1));
            }}
            onMouseLeave={() => setHover(null)}
            style={{ cursor: "crosshair" }}
          />
          {hovered && hover !== null && (
            <g transform={`translate(${tooltipX}, ${Math.max(y(hovered.count) - 34, 0)})`} style={{ pointerEvents: "none" }}>
              <rect width={tooltipW} height={26} rx={4} fill="#fff" stroke="var(--border)" />
              <text x={tooltipW / 2} y={11} fontSize={9} fill="var(--text-gray)" textAnchor="middle">
                {formatLabel(hovered.date)}
              </text>
              <text x={tooltipW / 2} y={22} fontSize={11} fontWeight={700} textAnchor="middle">
                {hovered.count}명
              </text>
            </g>
          )}
        </svg>
      </div>

      <div className="admin-card-list">
        {[...days]
          .sort((a, b) => (a.date < b.date ? 1 : -1))
          .map((d) => {
            const isOpen = expanded.has(d.date);
            return (
              <div className="admin-card" key={d.date}>
                <div
                  className="admin-card-top"
                  onClick={() => toggleExpanded(d.date)}
                  style={{ cursor: "pointer" }}
                >
                  <b>
                    {isOpen ? "▾ " : "▸ "}
                    {d.date.length === 13 ? `${d.date.slice(0, 10)} ${d.date.slice(11, 13)}시` : d.date}
                  </b>
                  <span className="admin-muted">{d.count}명</span>
                </div>
                {isOpen && (
                  <div style={{ marginTop: 8, display: "flex", flexDirection: "column", gap: 6 }}>
                    {d.countries.length === 0 && <span className="admin-muted" style={{ fontSize: 12.5 }}>방문 기록이 없습니다.</span>}
                    {d.countries.map((c) => (
                      <div key={c.country} style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5 }}>
                        <span>{countryLabel(c.country)}</span>
                        <span className="admin-muted">{c.count}명</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
      </div>
    </>
  );
}
