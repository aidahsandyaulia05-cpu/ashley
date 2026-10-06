import { Link } from "react-router-dom";
import { ArrowUpRight } from "lucide-react";
import { SectionHead, Reveal } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

export const Programs = () => {
  const { L } = useLang();
  const items = [
    ["/business", "/img/nursery.jpg", "Coral for Business", L("CSR + ESG programs that grow.", "Program CSR + ESG yang bertumbuh.")],
    ["/idol", "/img/reef4.jpg", "IDOL × REEF", L("Fandom-powered coral gardens.", "Taman karang dari kekuatan fandom.")],
    ["/science", "/img/polyps.jpg", L("Science", "Sains"), L("Data behind every coral.", "Data di balik setiap karang.")],
    ["/about#community", "/img/reef_farmers.jpg", L("Coastal Community", "Komunitas Pesisir"), L("Livelihoods from restoration.", "Mata pencaharian dari restorasi.")],
  ];
  return (
    <section className="bg-ivory py-24 sm:py-32" data-testid="programs">
      <div className="container-x">
        <SectionHead eyebrow={L("Program & Impact", "Program & Dampak")} title={L("Collaboration for a better ocean.", "Kolaborasi untuk laut yang lebih baik.")} />
        <div className="mt-16 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {items.map(([to, img, t, d], i) => (
            <Reveal key={to} delay={i * 0.07}>
              <Link to={to} className="group block" data-testid={`program-${i}`}>
                <div className="aspect-[3/4] overflow-hidden rounded-[1.5rem]"><img src={img} alt={t} loading="lazy" className="img-zoom h-full w-full object-cover" /></div>
                <div className="mt-5 flex items-start justify-between">
                  <div><p className="font-serif text-2xl text-ink">{t}</p><p className="mt-1 text-sm text-slate-600">{d}</p></div>
                  <ArrowUpRight className="h-5 w-5 text-coral" />
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export const GetInvolved = () => {
  const { L } = useLang();
  const paths = [
    ["ADOPT", L("Adopt a coral.", "Adopsi karang."), "/adopt"],
    ["PARTNER", L("Corporate, CSR and tourism partnerships.", "Kemitraan korporat, CSR, dan pariwisata."), "/business"],
    ["RESEARCH", L("Scientific collaboration.", "Kolaborasi ilmiah."), "/science#research"],
    ["VISIT", L("Experience restoration on-site.", "Rasakan restorasi langsung di lokasi."), "/visit"],
  ];
  return (
    <section className="relative overflow-hidden bg-abyss py-24 text-ivory sm:py-32" data-testid="get-involved">
      <img src="/img/reef4.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-30" />
      <div className="absolute inset-0 bg-gradient-to-b from-abyss via-abyss/80 to-abyss" />
      <div className="container-x relative">
        <SectionHead dark eyebrow={L("Get Involved", "Ikut Terlibat")} title={L("Be part of the reef's comeback.", "Jadi bagian dari kebangkitan terumbu.")} />
        <div className="mt-16 grid border-t border-white/15 md:grid-cols-4">
          {paths.map(([t, d, to], i) => (
            <Link key={t} to={to} data-testid={`involve-${t.toLowerCase()}`} className="group border-b border-white/15 py-10 transition-colors duration-500 hover:bg-white/[0.03] md:border-b-0 md:border-r md:px-8 md:first:pl-0 md:last:border-r-0">
              <span className="font-mono text-xs text-coral">0{i + 1}</span>
              <p className="mt-4 font-serif text-4xl tracking-wide">{t}</p>
              <p className="mt-3 text-sm text-slate-300">{d}</p>
              <ArrowUpRight className="mt-8 h-5 w-5 text-seafoam transition-transform duration-300 group-hover:-translate-y-1 group-hover:translate-x-1" />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};
