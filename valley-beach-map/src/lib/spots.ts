"use client";

import { useEffect, useState } from "react";
import { fetchSpots } from "./fetchSpots";
import type { Spot } from "./data";

export { fetchSpots };

export function useSpots(initialSpots?: Spot[]) {
  const [spots, setSpots] = useState<Spot[] | null>(initialSpots ?? null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchSpots()
      .then(setSpots)
      .catch(() => setError(true));
  }, []);

  return { spots: spots ?? [], loading: spots === null && !error, error };
}
