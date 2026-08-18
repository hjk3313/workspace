import type { Metadata } from "next";
import { cookies } from "next/headers";
import { ADMIN_SESSION_COOKIE, isValidSession } from "@/lib/adminAuth";
import AdminShell from "@/components/AdminShell";

export const metadata: Metadata = {
  title: "관리자",
  robots: { index: false, follow: false },
};

export default async function Page() {
  const cookieStore = await cookies();
  const authed = isValidSession(cookieStore.get(ADMIN_SESSION_COOKIE)?.value);

  return <AdminShell authed={authed} />;
}
