import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { RotateCcw, Box, MousePointerClick, ZoomIn } from "lucide-react";
import { createCoralScene, webglOK } from "@/lib/coralScene";
import { SectionHead } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

const INFO = {
  acropora: { sci: "Acropora tenuis", en: "Branching coral", id: "Karang bercabang", rate: "8–12 cm / yr", depth: "3–15 m", img: "/img/acropora.jpg",
    roleEn: "Fast-growing architect that builds the reef's 3D habitat — the backbone of restoration.", roleId: "Arsitek yang tumbuh cepat dan membangun habitat 3D terumbu — tulang punggung restorasi." },
  pocillopora: { sci: "Pocillopora damicornis", en: "Cauliflower coral", id: "Karang kembang kol", rate: "4–7 cm / yr", depth: "1–10 m", img: "/img/polyps.jpg",
    roleEn: "Compact, resilient coral that recolonises damaged reef quickly and shelters juvenile life.", roleId: "Karang kompak dan tangguh yang cepat mengkolonisasi terumbu rusak dan melindungi kehidupan muda." },
  porites: { sci: "Porites lutea", en: "Lobe coral", id: "Karang lobus", rate: "1–2 cm / yr", depth: "1–20 m", img: "/img/reef2.jpg",
    roleEn: "Slow, massive coral that can live for centuries — a natural archive of ocean climate.", roleId: "Karang masif yang lambat tumbuh dan dapat hidup berabad-abad — arsip alami iklim laut." },
};
const STAGES = ["Day 01", "Month 03", "Month 06", "Month 12", "Month 24"];

const isLowPower = () => window.matchMedia("(max-width: 767px)").matches && ((navigator.hardwareConcurrency || 8) <= 4 || (navigator.deviceMemory || 8) <= 3);

const Viewer = ({ stage, onSelect, apiRef }) => {
  const ref = useRef(null);
  const [tip, setTip] = useState(null);
  useEffect(() => {
    const s = createCoralScene(ref.current, { onHover: (sp, x, y) => setTip(sp ? { sp, x, y } : null), onSelect });
    apiRef.current = s;
    return () => s.dispose();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => { apiRef.current?.setStage(stage); }, [stage, apiRef]);
  return (
    <div ref={ref} className="absolute inset-0 touch-none" data-testid="coral-3d-canvas">
      {tip && <span className="pointer-events-none absolute z-10 rounded-full bg-abyss/80 px-3 py-1 font-serif text-sm italic text-ivory backdrop-blur" style={{ left: tip.x + 14, top: tip.y - 10 }}>{INFO[tip.sp].sci}</span>}
    </div>
  );
};

const Fallback = ({ stage, onSelect, selected }) => (
  <div className="absolute inset-0" data-testid="coral-3d-fallback">
    <motion.img key={selected || "all"} src={INFO[selected || "acropora"].img} alt="" initial={{ opacity: 0 }} animate={{ opacity: 0.9, scale: 0.85 + stage * 0.05 }} transition={{ duration: 0.8 }} className="h-full w-full object-cover" />
    <div className="absolute inset-x-4 top-4 flex gap-2">
      {Object.keys(INFO).map((k) => (
        <button key={k} onClick={() => onSelect(k)} data-testid={`fallback-species-${k}`} className={`chip ${selected === k ? "bg-coral text-abyss" : "bg-abyss/70 text-ivory"}`}>{INFO[k].sci.split(" ")[0]}</button>
      ))}
    </div>
  </div>
);

export default function CoralLab() {
  const { L } = useLang();
  const [stage, setStage] = useState(4);
  const [selected, setSelected] = useState(null);
  const [mode3d, setMode3d] = useState(() => webglOK() && !isLowPower());
  const apiRef = useRef(null);
  const info = selected && INFO[selected];

  return (
    <section className="relative overflow-hidden bg-navy py-24 text-ivory sm:py-32" id="explore" data-testid="coral-lab">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 lg:flex-row lg:items-end">
          <SectionHead dark eyebrow={L("Interactive 3D · Virtual Nursery", "3D Interaktif · Pembibitan Virtual")}
            title={L("Step inside a coral nursery.", "Masuki pembibitan karang.")}
            sub={L("Rotate, zoom and select each coral to reveal its species, its role on the reef and how it grows from fragment to colony.", "Putar, perbesar, dan pilih setiap karang untuk melihat spesies, perannya di terumbu, dan pertumbuhannya dari fragmen menjadi koloni.")} />
          <div className="flex gap-5 text-xs text-slate-400">
            <span className="flex items-center gap-2"><RotateCcw className="h-4 w-4 text-seafoam" />{L("Drag to rotate", "Geser untuk memutar")}</span>
            <span className="flex items-center gap-2"><ZoomIn className="h-4 w-4 text-seafoam" />{L("Scroll / pinch", "Gulir / cubit")}</span>
            <span className="flex items-center gap-2"><MousePointerClick className="h-4 w-4 text-seafoam" />{L("Click a coral", "Klik karang")}</span>
          </div>
        </div>

        <div className="relative mt-14 h-[520px] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-b from-ocean to-abyss sm:h-[620px]">
          {mode3d ? <Viewer stage={stage} onSelect={setSelected} apiRef={apiRef} /> : <Fallback stage={stage} onSelect={setSelected} selected={selected} />}
          <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(94,234,212,0.12),transparent_60%)]" />

          <AnimatePresence>
            {info && (
              <motion.aside key={selected} initial={{ opacity: 0, x: 30 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 30 }} transition={{ duration: 0.5 }}
                className="glass absolute bottom-24 right-4 top-auto w-[calc(100%-2rem)] rounded-3xl p-6 sm:right-6 sm:top-6 sm:bottom-auto sm:w-80" data-testid="species-panel">
                <p className="eyebrow text-coral">{L("Species", "Spesies")}</p>
                <p className="mt-2 font-serif text-3xl italic" data-testid="species-panel-name">{info.sci}</p>
                <p className="text-sm text-slate-400">{L(info.en, info.id)}</p>
                <p className="mt-4 text-sm leading-relaxed text-slate-300">{L(info.roleEn, info.roleId)}</p>
                <dl className="mt-5 grid grid-cols-2 gap-3 border-t border-white/10 pt-4 text-xs">
                  <div><dt className="text-slate-500">{L("Growth", "Pertumbuhan")}</dt><dd className="mt-1 font-mono">{info.rate}</dd></div>
                  <div><dt className="text-slate-500">{L("Depth", "Kedalaman")}</dt><dd className="mt-1 font-mono">{info.depth}</dd></div>
                </dl>
                <button onClick={() => { setSelected(null); apiRef.current?.reset(); }} className="mt-5 text-xs text-seafoam hover:text-ivory" data-testid="species-panel-close">{L("Back to nursery view", "Kembali ke pembibitan")}</button>
              </motion.aside>
            )}
          </AnimatePresence>

          <div className="absolute inset-x-4 bottom-4 flex flex-col gap-3 sm:inset-x-6 sm:bottom-6 sm:flex-row sm:items-center sm:justify-between">
            <div className="glass flex overflow-x-auto rounded-full p-1" data-testid="growth-stages">
              {STAGES.map((s, i) => (
                <button key={s} onClick={() => setStage(i)} data-testid={`stage-${i}`}
                  className={`whitespace-nowrap rounded-full px-3 py-2 text-[11px] font-medium transition-colors sm:px-4 ${stage === i ? "bg-ivory text-abyss" : "text-ivory/70 hover:text-ivory"}`}>{s}</button>
              ))}
            </div>
            {!mode3d && webglOK() && (
              <button onClick={() => setMode3d(true)} className="btn-ghost self-start py-2 text-xs" data-testid="load-3d-btn"><Box className="h-4 w-4" />{L("Load 3D view", "Muat tampilan 3D")}</button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
