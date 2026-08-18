"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginClient() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });
    if (!res.ok) {
      setError("비밀번호가 틀렸습니다.");
      return;
    }
    router.refresh();
  }

  return (
    <div className="admin-login-screen">
      <form className="admin-login-box" onSubmit={handleSubmit}>
        <h2>관리자 로그인</h2>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="비밀번호"
          autoFocus
          required
        />
        <button type="submit" className="admin-btn admin-btn-primary">입장</button>
        {error && <span className="admin-muted">{error}</span>}
      </form>
    </div>
  );
}
