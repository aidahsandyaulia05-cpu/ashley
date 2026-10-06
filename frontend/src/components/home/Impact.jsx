import { useEffect, useState } from "react";
import { Counter, Reveal, CoralArt } from "@/components/site/Bits";
import { api } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function Impact() {
  const { L } = useLang();
  const [s, setS] = useState({ corals_adopted: 1200, restoration_sites: 12, coastal_workers: 50, research_collaborations: 18, people_reached: 3000 });
  useEffect(() => { api.get("/stats").then((r) => setS(r.data)); }, []);
  const items = [
    ["corals", s.corals_adopted, "+", "", L("Corals Adopted", "Karang Diadopsi")],
    ["sites", s.restoration_sites, "", "", L("Restoration Sites", "Lokasi Restorasi")],
    ["workers", s.coastal_workers, "+", "", L("Coastal Workers Involved", "Pekerja Pesisir Terlibat")],
    ["research", s.research_collaborations, "", "", L("Research Collaborations", "Kolaborasi Riset")],
    ["people", s.people_reached, "", "+", L("People Reached", "Orang Terjangkau")],
  ];
  return (
    <section id="impact" className="relative overflow-hidden bg-teal py-24 text-ivory sm:py-36" data-testid="impact">
      <CoralArt className="pointer-events-none absolute -bottom-10 left-[-60px] h-[460px] w-[380px] text-seafoam/10" />
      <div className="absolute right-0 top-0 h-[480px] w-[480px] rounded-full bg-plum/40 blur-[140px]" />
      <div className="container-x relative">
        <Reveal>
          <p className="eyebrow text-seafoam">{L("Impact", "Dampak")}</p>
          <h2 className="display mt-4 text-5xl sm:text-6xl lg:text-8xl">Every Coral <em className="text-coral">Counts.</em></h2>
        </Reveal>
        <div className="mt-20 grid grid-cols-2 gap-y-14 border-t border-white/15 pt-14 md:grid-cols-5">
          {items.map(([k, v, pre, suf, label], i) => (
            <Reveal key={k} delay={i * 0.08} className={i % 2 === 1 ? "md:border-l md:border-white/10 md:pl-8" : i > 0 ? "md:border-l md:border-white/10 md:pl-8" : ""}>
              <p className="font-serif text-5xl font-light sm:text-6xl"><Counter to={v} prefix={pre} suffix={suf} testid={`impact-${k}`} /></p>
              <p className="mt-3 max-w-[10rem] text-xs uppercase tracking-[0.2em] text-slate-300">{label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
