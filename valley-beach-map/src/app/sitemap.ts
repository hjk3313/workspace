import type { MetadataRoute } from "next";
import { fetchSpots } from "@/lib/fetchSpots";

const BASE = "https://www.pungdeong.com";

export const revalidate = 300;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const spots = await fetchSpots().catch(() => []);

  const staticEntries: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, changeFrequency: "weekly", priority: 1.0 },
    { url: `${BASE}/reviews`, changeFrequency: "daily", priority: 0.7 },
    { url: `${BASE}/guide`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${BASE}/favorites`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${BASE}/register`, changeFrequency: "monthly", priority: 0.4 },
    { url: `${BASE}/about`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${BASE}/privacy`, changeFrequency: "yearly", priority: 0.2 },
  ];

  const spotEntries: MetadataRoute.Sitemap = spots.map((s) => ({
    url: `${BASE}/spot/${encodeURIComponent(s.name)}`,
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  return [...staticEntries, ...spotEntries];
}
