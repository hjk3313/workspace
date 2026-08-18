import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <>
      <Header />
      <main>
        <div className="register-page-header">
          <h1 style={{ fontFamily: "inherit", fontSize: 20, margin: "0 0 4px" }}>
            페이지를 찾을 수 없습니다
          </h1>
        </div>
        <div className="page-list">
          <div className="item" style={{ cursor: "default" }}>
            <p>요청하신 페이지가 존재하지 않거나 이동되었습니다.</p>
          </div>
        </div>
      </main>
      <footer>
        <Link href="/">지도로 돌아가기</Link>
      </footer>
    </>
  );
}
