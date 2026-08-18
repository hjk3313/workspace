"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const LINKS = [
  { href: "/", label: "지도" },
  { href: "/reviews", label: "전체 후기" },
  { href: "/guide", label: "안전가이드" },
  { href: "/register", label: "장소 등록" },
  { href: "/about", label: "문의하기" },
];

export default function Nav() {
  const pathname = usePathname();
  return (
    <nav className="site-nav">
      {LINKS.map(link => (
        <Link key={link.href} href={link.href} className={pathname === link.href ? "current" : ""}>
          {link.label}
        </Link>
      ))}
    </nav>
  );
}
