"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { markReturn, readSpot } from "@/lib/scroll";

// "All work" on a project page. If the visitor came from the home page, take them back to exactly where they were;
// otherwise (direct link, no JS) it falls back to the top of the work section.
export default function ReturnLink({ className, children }: { className?: string; children: React.ReactNode }) {
  const router = useRouter();
  const onClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0 || !readSpot()) return;
    e.preventDefault();
    markReturn();
    router.push("/", { scroll: false });
  };
  return (
    <Link href="/#work" onClick={onClick} className={className}>
      {children}
    </Link>
  );
}
