const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";

export async function restFetch(path: string, key: string, options: RequestInit = {}): Promise<Response> {
  if (!SUPABASE_URL.startsWith("http") || !key) throw new Error("Supabase 설정이 안 되어 있습니다.");
  return fetch(`${SUPABASE_URL}/rest/v1/${path}`, {
    ...options,
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
      ...(options.headers || {}),
    },
  });
}

export function supabaseFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return restFetch(path, SUPABASE_ANON_KEY, options);
}
