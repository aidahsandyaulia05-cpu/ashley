import { useRef } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Sprout, HeartHandshake, Award, QrCode, LineChart, Globe2 } from "lucide-react";
import { Reveal, SectionHead, CoralArt } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

const GrowthStage = ({ img, label, sub, i, progress }) => {
  const scale = useTransform(progress, [0, 0.25 + i * 0.12], [0.55, 1]);
  const op = useTransform(progress, [0, 0.2 + i * 0.12], [0.3, 1]);
  return (
    <div className="flex flex-col items-center text-center">
      <motion.div style={{ scale, opacity: op }} className="aspect-square w-full max-w-[180px] overflow-hidden rounded-full border-4 border-ivory shadow-[0_20px_50px_-20px_rgba(6,16,38,0.5)]">
        <img src={img} alt={label} className="h-full w-full object-cover" />
      </motion.div>
      <p className="mt-5 font-serif text-xl text-ink">{label}</p>
      <p className="text-xs text-slate-500">{sub}</p>
    </div>
  );
};

export default function Journey() {
  const { L } = useLang();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "center center"] });
  const steps = [
    [Sprout, L("Discover", "Temukan"), L("Choose a coral with its own ID", "Pilih karang dengan ID uniknya")],
    [HeartHandshake, L("Adopt", "Adopsi"), L("Online or on-site at the reef", "Online atau langsung di terumbu")],
    [Award, L("Certificate", "Sertifikat"), L("A signed digital certificate", "Sertifikat digital resmi")],
    [QrCode, L("QR Code", "Kode QR"), L("Scan to open your coral", "Pindai untuk membuka karangmu")],
    [LineChart, L("Track Growth", "Pantau Pertumbuhan"), L("Monitoring photos & health", "Foto & kesehatan pemantauan")],
    [Globe2, L("See Impact", "Lihat Dampak"), L("Reef, people, science", "Terumbu, masyarakat, sains")],
  ];
  const stages = [
    ["/img/fragment.jpg", L("Fragment", "Fragmen"), L("Day 0", "Hari 0")],
    ["/img/nursery.jpg", L("Nursery", "Pembibitan"), L("Month 1–3", "Bulan 1–3")],
    ["/img/polyps.jpg", L("Transplant", "Transplantasi"), L("Month 3–6", "Bulan 3–6")],
    ["/img/acropora.jpg", L("Growing Reef", "Terumbu Tumbuh"), L("Month 6+", "Bulan 6+")],
  ];
  return (
    <section id="how" ref={ref} className="relative overflow-hidden bg-ivory py-24 sm:py-36" data-testid="how-it-works">
      <CoralArt className="pointer-events-none absolute -right-16 top-10 h-[520px] w-[440px] text-coral/20" />
      <div className="container-x relative">
        <SectionHead eyebrow={L("How It Works", "Cara Kerja")} title={<>{L("Your coral,", "Karangmu,")}<br /><em>{L("your impact.", "dampakmu.")}</em></>}
          sub={L("With Coral Adoption you don't simply donate — you follow the life of one living coral, from a fragment in our nursery to a thriving part of the reef.", "Dengan Coral Adoption, kamu tidak hanya berdonasi — kamu menjadi bagian dari perjalanan hidup sebuah karang, dari fragmen di pembibitan hingga menjadi bagian terumbu yang hidup.")} />
        <div className="mt-20 grid grid-cols-2 gap-8 md:grid-cols-4" data-testid="growth-stages-scroll">
          {stages.map(([img, l, s], i) => <GrowthStage key={img} img={img} label={l} sub={s} i={i} progress={scrollYProgress} />)}
        </div>
        <div className="mt-24 grid gap-px overflow-hidden rounded-[2rem] border border-ink/10 bg-ink/10 sm:grid-cols-2 lg:grid-cols-6">
          {steps.map(([Icon, t, s], i) => (
            <Reveal key={t} delay={i * 0.06} className="h-full">
              <div className="group h-full bg-ivory p-7 transition-colors duration-500 hover:bg-pearl" data-testid={`journey-step-${i}`}>
                <span className="font-mono text-[11px] text-coral">0{i + 1}</span>
                <Icon className="mt-6 h-7 w-7 text-teal transition-transform duration-500 group-hover:-translate-y-1" strokeWidth={1.3} />
                <p className="mt-6 font-serif text-2xl text-ink">{t}</p>
                <p className="mt-2 text-sm text-slate-600">{s}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
