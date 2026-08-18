"use client";

import { useEffect, useMemo, useState } from "react";
import { getFavorites, setFavorites } from "@/lib/common";
import { reviewStatsText } from "@/lib/reviews";
import { useReviewStats } from "@/lib/useReviewStats";
import { useSpots } from "@/lib/spots";
import SpotCard from "./SpotCard";
import ReviewModal from "./ReviewModal";

export default function FavoritesClient() {
  const [favorites, setFavoritesState] = useState<Set<string>>(new Set());
  const [loaded, setLoaded] = useState(false);
  const [openReviewSpot, setOpenReviewSpot] = useState<string | null>(null);
  const { stats, refresh: refreshStats } = useReviewStats();
  const { spots, loading: spotsLoading } = useSpots();

  const spotByName = useMemo(() => Object.fromEntries(spots.map((s) => [s.name, s])), [spots]);

  useEffect(() => {
    setFavoritesState(getFavorites());
    setLoaded(true);
  }, []);

  function removeFavorite(name: string) {
    const next = new Set(favorites);
    next.delete(name);
    setFavorites(next);
    setFavoritesState(next);
  }

  const names = [...favorites].filter((name) => spotByName[name]);

  return (
    <main>
      <div className="page-list">
        {!loaded || spotsLoading ? null : names.length === 0 ? (
          <div className="empty-state">
            아직 즐겨찾기한 장소가 없어요.
            <br />
            <a href="/">지도에서 둘러보고</a> 마음에 드는 곳을 즐겨찾기해보세요.
          </div>
        ) : (
          names.map((name) => (
            <SpotCard
              key={name}
              spot={spotByName[name]}
              isFav
              reviewText={reviewStatsText(stats, name)}
              onToggleFav={() => removeFavorite(name)}
              onOpenReview={() => setOpenReviewSpot(name)}
            />
          ))
        )}
      </div>

      <ReviewModal spotName={openReviewSpot} onClose={() => setOpenReviewSpot(null)} onSubmitted={refreshStats} />
    </main>
  );
}
