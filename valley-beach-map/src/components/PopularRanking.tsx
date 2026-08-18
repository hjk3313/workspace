import type { Spot } from "@/lib/data";
import type { ReviewStat } from "@/lib/reviews";

export default function PopularRanking({
  spots,
  stats,
  onSelect,
}: {
  spots: Spot[];
  stats: Record<string, ReviewStat>;
  onSelect: (name: string) => void;
}) {
  const ranked = [...spots]
    .filter((s) => stats[s.name])
    .sort((a, b) => {
      const sa = stats[a.name];
      const sb = stats[b.name];
      return sb.count - sa.count || sb.avgRating - sa.avgRating;
    })
    .slice(0, 5);

  if (ranked.length === 0) return null;

  return (
    <div className="popular-ranking">
      <span className="popular-ranking-title">🔥 인기 순위</span>
      <div className="popular-ranking-list">
        {ranked.map((spot, i) => (
          <button key={spot.name} className="popular-ranking-item" onClick={() => onSelect(spot.name)}>
            <span className="rank">{i + 1}</span>
            {spot.name}
            <span className="rank-stat">
              후기 {stats[spot.name].count}개 · {stats[spot.name].avgRating.toFixed(1)}점
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
