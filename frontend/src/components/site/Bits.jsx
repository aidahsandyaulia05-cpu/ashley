import { useEffect, useRef, useState } from "react";
import { motion, useInView, animate } from "framer-motion";

export const Reveal = ({ children, delay = 0, y = 28, className = "" }) => (
  <motion.div
    className={className}
    initial={{ opacity: 0, y }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true, margin: "-60px" }}
    transition={{ duration: 0.9, delay, ease: [0.22, 1, 0.36, 1] }}
  >
    {children}
  </motion.div>
);

export const Counter = ({ to, prefix = "", suffix = "", testid }) => {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true });
  const [val, setVal] = useState(0);
  useEffect(() => {
    if (!inView) return;
    const c = animate(0, to, { duration: 2.2, ease: [0.22, 1, 0.36, 1], onUpdate: (v) => setVal(Math.round(v)) });
    return () => c.stop();
  }, [inView, to]);
  return (
    <span ref={ref} data-testid={testid}>
      {prefix}
      {val.toLocaleString("en-US")}
      {suffix}
    </span>
  );
};

export const SectionHead = ({ eyebrow, title, sub, dark = false, className = "" }) => (
  <Reveal className={`max-w-3xl ${className}`}>
    <p className={`eyebrow ${dark ? "text-seafoam" : "text-teal"}`}>{eyebrow}</p>
    <h2 className={`display mt-4 text-4xl sm:text-5xl lg:text-6xl ${dark ? "text-ivory" : "text-ink"}`}>{title}</h2>
    {sub && <p className={`mt-6 text-base md:text-lg leading-relaxed ${dark ? "text-slate-300/90" : "text-slate-600"}`}>{sub}</p>}
  </Reveal>
);

export const CoralArt = ({ className = "", stroke = "currentColor" }) => (
  <svg viewBox="0 0 200 240" className={className} fill="none" stroke={stroke} strokeWidth="1.1" strokeLinecap="round" aria-hidden>
    <path d="M100 238 C100 200 98 170 100 140 C102 110 92 90 80 70 C72 56 70 40 74 22" />
    <path d="M100 160 C118 140 132 128 140 104 C146 86 150 66 160 50" />
    <path d="M140 104 C156 98 170 88 178 70" />
    <path d="M100 140 C84 130 64 126 50 108 C40 94 34 76 22 62" />
    <path d="M50 108 C38 110 26 104 16 92" />
    <path d="M80 70 C92 60 100 48 104 30" />
    <path d="M74 22 C70 14 72 8 76 4" />
    <path d="M160 50 C160 40 164 32 170 26" />
    <path d="M160 50 C150 44 146 34 146 24" />
    <path d="M22 62 C20 52 22 44 28 38" />
    <path d="M100 190 C120 182 136 174 150 160 C160 150 172 146 186 146" />
    <path d="M100 200 C80 194 62 186 46 172 C36 164 24 162 12 164" />
    {[[74, 22], [104, 30], [170, 26], [146, 24], [178, 70], [28, 38], [16, 92], [186, 146], [12, 164]].map(([x, y]) => (
      <circle key={`${x}-${y}`} cx={x} cy={y} r="2.2" />
    ))}
  </svg>
);

export const Logo = ({ className = "" }) => (
  <span className={`flex items-center gap-2.5 ${className}`}>
    <svg viewBox="0 0 40 40" className="h-8 w-8" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden>
      <path d="M20 38 V22 M20 22 C20 14 14 12 12 4 M20 22 C20 14 26 12 28 4 M20 28 C14 26 8 22 6 14 M20 28 C26 26 32 22 34 14 M20 16 V6" />
    </svg>
    <span className="font-serif text-2xl tracking-[0.32em] font-medium">REEFORA</span>
  </span>
);
