"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import AdminLoginClient from "./AdminLoginClient";
import AdminSubmissionsClient from "./AdminSubmissionsClient";
import AdminSpotsClient from "./AdminSpotsClient";
import AdminReviewsClient from "./AdminReviewsClient";
import AdminVisitsClient from "./AdminVisitsClient";

type Tab = "submissions" | "spots" | "reviews" | "visits";

const TABS: { value: Tab; label: string }[] = [
  { value: "submissions", label: "제보 승인" },
  { value: "spots", label: "장소 관리" },
  { value: "reviews", label: "후기 관리" },
  { value: "visits", label: "방문자 통계" },
];

export default function AdminShell({ authed }: { authed: boolean }) {
  const [tab, setTab] = useState<Tab>("submissions");
  const router = useRouter();

  if (!authed) return <AdminLoginClient />;

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="admin-shell">
      <div className="admin-topbar">
        <h1>관리자 대시보드</h1>
        <button className="admin-btn" onClick={logout}>로그아웃</button>
      </div>

      <div className="admin-tabs">
        {TABS.map((t) => (
          <button key={t.value} className={tab === t.value ? "active" : ""} onClick={() => setTab(t.value)}>
            {t.label}
          </button>
        ))}
      </div>

      <div className="admin-panel">
        {tab === "submissions" && <AdminSubmissionsClient />}
        {tab === "spots" && <AdminSpotsClient />}
        {tab === "reviews" && <AdminReviewsClient />}
        {tab === "visits" && <AdminVisitsClient />}
      </div>
    </div>
  );
}
