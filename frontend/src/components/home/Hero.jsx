import { useMemo } from "react";
import { Link } from "react-router-dom";
import { motion, useMotionValue, useSpring, useTransform, useScroll } from "framer-motion";
import { ArrowRight, PlayCircle } from "lucide-react";
import { useLang } from "@/lib/i18n";

const Particles = () => {
  const ps = useMemo(() => Array.from({ length: 34 }, (_, i) => ({
    left: `${(i * 37) % 100}%`, size: 1 + (i % 4), dur: 14 + (i % 7) * 3, delay: -(i * 1.7), bottom: `${(i * 23) % 40 - 10}%`,
  })), []);
  return ps.map((p, i) => (
    <span key={i} className="particle" style={{ left: p.left, bottom: p.bottom, width: p.size, height: p.size, animationDuration: `${p.dur}s`, animationDelay: `${p.delay}s` }} />
  ));
};

export default function Hero() {
  const { L } = useLang();
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 40, damping: 20 });
  const sy = useSpring(my, { stiffness: 40, damping: 20 });
  const bgX = useTransform(sx, (v) => v * -18);
  const bgY = useTransform(sy, (v) => v * -12);
  const fgX = useTransform(sx, (v) => v * 8);
  const { scrollY } = useScroll();
  const fade = useTransform(scrollY, [0, 600], [1, 0.2]);
  const lift = useTransform(scrollY, [0, 600], [0, 120]);

  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section onMouseMove={onMove} className="grain relative h-[100svh] min-h-[640px] overflow-hidden bg-abyss text-ivory" data-testid="hero">
      <motion.div style={{ x: bgX, y: bgY }} className="absolute -inset-8">
        <img src="/img/hero_coral_hd.jpg" alt={L("Coral garden with nursery frames", "Taman karang dengan rangka pembibitan")} fetchpriority="high" decoding="async" className="h-full w-full object-cover object-[60%_75%]" />
      </motion.div>
      <div className="absolute inset-0 bg-gradient-to-r from-abyss/85 via-abyss/30 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-b from-abyss/60 via-transparent to-abyss/70" />
      <div className="rays absolute inset-0" />
      <div className="pointer-events-none absolute inset-0"><Particles /></div>

      <motion.div style={{ opacity: fade, y: lift }} className="container-x relative flex h-full flex-col justify-center pb-16">
        <motion.div style={{ x: fgX }} className="max-w-3xl">
          <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2, duration: 1 }} className="eyebrow text-seafoam">
            REEFORA · {L("Coral Adoption", "Adopsi Karang")}
          </motion.p>
          <h1 className="display mt-6 text-[3.4rem] sm:text-7xl lg:text-[7.2rem]" data-testid="hero-title">
            {[L("Adopt a Coral.", "Adopt a Coral."), L("Restore a Reef.", "Restore a Reef.")].map((line, i) => (
              <motion.span key={line} className="block" initial={{ opacity: 0, y: 40 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 + i * 0.18, duration: 1.1, ease: [0.22, 1, 0.36, 1] }}>
                {i === 1 ? <>Restore a <em className="text-coral">Reef.</em></> : line}
              </motion.span>
            ))}
          </h1>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.9, duration: 1 }}>
            <p className="mt-6 text-[11px] uppercase tracking-[0.45em] text-ivory/70">Restoring Reefs, Reviving Life.</p>
            <p className="mt-6 max-w-lg text-sm leading-relaxed text-slate-200/90 sm:text-base" data-testid="hero-sub">
              Setiap karang yang diadopsi adalah satu langkah untuk menghidupkan kembali ekosistem terumbu, mendukung masyarakat pesisir, dan menjaga masa depan laut.
            </p>
            <div className="mt-10 flex flex-wrap gap-3">
              <Link to="/adopt" className="btn-coral" data-testid="hero-adopt-btn">{L("Adopt a Coral", "Adopsi Karang")} <ArrowRight className="h-4 w-4" /></Link>
              <a href="#how" className="btn-ghost" data-testid="hero-how-btn"><PlayCircle className="h-4 w-4" />{L("How It Works", "Cara Kerja")}</a>
            </div>
          </motion.div>
        </motion.div>
      </motion.div>

      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.6 }}
        className="glass absolute bottom-28 right-6 hidden rounded-2xl px-5 py-4 lg:block" data-testid="hero-coral-tag">
        <p className="font-serif text-lg italic">Acropora tenuis</p>
        <p className="font-mono text-[11px] text-seafoam">CORAL ID · RF-02481 · {L("Site A", "Situs A")}</p>
      </motion.div>

      <a href="#how" className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3 text-[10px] uppercase tracking-[0.3em] text-ivory/60 sm:left-16 sm:translate-x-0 sm:flex-row" data-testid="scroll-indicator">
        <span className="flex h-9 w-5 justify-center rounded-full border border-ivory/40 pt-2"><span className="scroll-dot h-1.5 w-1 rounded-full bg-ivory" /></span>
        {L("Scroll to explore", "Gulir untuk menjelajah")}
      </a>
    </section>
  );
}
