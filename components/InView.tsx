"use client";
import { PropsWithChildren, useEffect, useRef, useState } from "react";

type Props = PropsWithChildren<{
  threshold?: number;
  once?: boolean;
  className?: string;
  inClass?: string;
  outClass?: string;
}>;

export default function InView({
  threshold = 0.2,
  once = true,
  className = "",
  inClass = "opacity-100 translate-y-0",
  outClass = "opacity-0 translate-y-6",
  children
}: Props) {
  const ref = useRef<HTMLDivElement | null>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            setVisible(true);
            if (once) obs.disconnect();
          } else if (!once) {
            setVisible(false);
          }
        });
      },
      { threshold }
    );
    obs.observe(node);
    return () => obs.disconnect();
  }, [threshold, once]);

  return (
    <div
      ref={ref}
      className={`${className} will-change-transform transition-all duration-700 ease-out ${visible ? inClass : outClass}`}
    >
      {children}
    </div>
  );
}
