"use client";

import { useCallback, useEffect, useState } from "react";
import { loadReviewStats, type ReviewStat } from "./reviews";

export function useReviewStats() {
  const [stats, setStats] = useState<Record<string, ReviewStat>>({});
  const refresh = useCallback(() => {
    loadReviewStats().then(setStats);
  }, []);
  useEffect(() => {
    refresh();
  }, [refresh]);
  return { stats, refresh };
}
