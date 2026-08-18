// 서버 전용. service_role 키는 RLS를 우회하니 admin API 라우트에서만 쓰고 절대 클라이언트로 내려보내지 말 것.
import { restFetch } from "./supabase";

const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || "";

export function supabaseAdminFetch(path: string, options: RequestInit = {}): Promise<Response> {
  return restFetch(path, SERVICE_ROLE_KEY, options);
}
