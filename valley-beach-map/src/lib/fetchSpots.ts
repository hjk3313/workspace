import { supabaseFetch } from "./supabase";
import type { Spot } from "./data";

export async function fetchSpots(): Promise<Spot[]> {
  const res = await supabaseFetch("spots?select=name,type,region,lat,lng,depth,note,address&order=id.asc");
  if (!res.ok) throw new Error("failed");
  return res.json();
}

export async function fetchSpotByName(name: string): Promise<Spot | null> {
  const res = await supabaseFetch(
    `spots?select=name,type,region,lat,lng,depth,note,address&name=eq.${encodeURIComponent(name)}&limit=1`
  );
  if (!res.ok) throw new Error("failed");
  const rows: Spot[] = await res.json();
  return rows[0] ?? null;
}
