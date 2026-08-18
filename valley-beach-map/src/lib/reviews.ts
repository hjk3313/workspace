import { supabaseFetch } from "./supabase";

export type Crowd = "quiet" | "normal" | "busy";

export const crowdLabel: Record<Crowd, string> = {
  quiet: "한적함",
  normal: "보통",
  busy: "붐빔",
};

export interface Review {
  spot_name: string;
  rating: number;
  nickname: string | null;
  comment: string;
  crowd: Crowd | null;
  created_at: string;
}

export interface ReviewStat {
  count: number;
  avgRating: number;
}

export async function loadReviewStats(): Promise<Record<string, ReviewStat>> {
  try {
    const res = await supabaseFetch("reviews?select=spot_name,rating");
    if (!res.ok) throw new Error("failed");
    const rows: { spot_name: string; rating: number }[] = await res.json();
    const grouped: Record<string, number[]> = {};
    rows.forEach(r => {
      if (!grouped[r.spot_name]) grouped[r.spot_name] = [];
      grouped[r.spot_name].push(r.rating);
    });
    const stats: Record<string, ReviewStat> = {};
    Object.keys(grouped).forEach(name => {
      const ratings = grouped[name];
      stats[name] = {
        count: ratings.length,
        avgRating: ratings.reduce((a, b) => a + b, 0) / ratings.length,
      };
    });
    return stats;
  } catch {
    return {};
  }
}

export function reviewStatsText(stats: Record<string, ReviewStat>, name: string): string {
  const stat = stats[name];
  if (!stat) return "후기 없음";
  return `후기 ${stat.count}개 · 평균 ${stat.avgRating.toFixed(1)}점`;
}

export async function fetchReviewsForSpot(name: string): Promise<Review[]> {
  const res = await supabaseFetch(
    `reviews?spot_name=eq.${encodeURIComponent(name)}&order=created_at.desc&limit=50`
  );
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export async function fetchAllReviews(): Promise<Review[]> {
  const res = await supabaseFetch("reviews?select=*&order=created_at.desc&limit=200");
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export async function submitReview(payload: {
  spotName: string;
  rating: number;
  nickname: string;
  comment: string;
  crowd: Crowd | null;
}): Promise<void> {
  const res = await supabaseFetch("reviews", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify({
      spot_name: payload.spotName,
      rating: payload.rating,
      nickname: payload.nickname || "익명",
      comment: payload.comment,
      crowd: payload.crowd,
    }),
  });
  if (!res.ok) throw new Error("failed");
}

export async function submitSpotSuggestion(payload: {
  name: string;
  type: string;
  region: string;
  address: string;
  depth: string | null;
  note: string | null;
  nickname: string;
}): Promise<void> {
  const res = await supabaseFetch("submissions", {
    method: "POST",
    headers: { Prefer: "return=minimal" },
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error("failed");
}
