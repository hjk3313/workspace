import Link from "next/link";
import Nav from "./Nav";

export default function Header() {
  return (
    <header>
      <div className="header-inner">
        <Link href="/" className="logo" aria-label="메인 지도로 이동">
          <svg width="34" height="34" viewBox="0 0 32 32" aria-hidden="true">
            <path d="M4 20 L12 8 L18 17 L22 11 L28 20 Z" fill="#15803d" />
            <path d="M2 24 Q8 20 14 24 T26 24 T32 22 V28 H0 V24 Z" fill="#2563eb" />
          </svg>
          <span className="logo-text">풍덩</span>
        </Link>
        <Nav />
      </div>
    </header>
  );
}
