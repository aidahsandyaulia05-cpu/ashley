import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sprout, Waves, Anchor, Users, Shovel, MapPin, ArrowRight, BookOpen, Award, QrCode } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/site/PageHero";
import { SectionHead, Reveal } from "@/components/site/Bits";
import { EnquiryDialog } from "@/components/site/Enquiry";
import { useLang } from "@/lib/i18n";

const EXP = {
  nursery: [Sprout, "Coral nursery visit", "Kunjungan pembibitan"], restoration: [Shovel, "Restoration activity", "Aktivitas restorasi"],
  diving: [Anchor, "Diving", "Menyelam"], snorkeling: [Waves, "Snorkeling", "Snorkeling"], community: [Users, "Local community", "Komunitas lokal"],
};
const pos = (s) => ({ left: `${((s.lng - 94) / 48) * 100}%`, top: `${((7 - s.lat) / 18) * 100}%` });

export default function Visit() {
  const { L } = useLang();
  const [sites, setSites] = useState([]);
  const [sel, setSel] = useState(0);
  useEffect(() => { api.get("/sites").then((r) => setSites(r.data)); }, []);
  const s = sites[sel];
  const steps = [[MapPin, L("Visit the restoration site", "Kunjungi lokasi restorasi")], [BookOpen, L("Learn about coral", "Belajar tentang karang")], [Shovel, L("Join supervised restoration", "Ikut restorasi terpandu")], [Sprout, L("Adopt a coral", "Adopsi karang")], [Award, L("Physical + digital certificate", "Sertifikat fisik + digital")], [QrCode, L("Scan the QR tag on your coral", "Pindai tag QR di karangmu")]];
  return (
    <div className="bg-abyss text-ivory" data-testid="visit-page">
      <PageHero testid="visit-hero" image="/img/diver.jpg" eyebrow={L("Eco-Tourism", "Ekowisata")} title={L("Visit the Reef.", "Kunjungi Terumbu.")}
        sub={L("Travel to our restoration sites across Indonesia — see the nurseries, plant with local teams, and meet your coral in the water.", "Kunjungi lokasi restorasi kami di Indonesia — lihat pembibitan, tanam bersama tim lokal, dan temui karangmu di dalam air.")}>
        <a href="#destinations" className="btn-coral" data-testid="visit-explore-cta">{L("Explore Destinations", "Jelajahi Destinasi")} <ArrowRight className="h-4 w-4" /></a>
        <a href="#onsite" className="btn-ghost" data-testid="visit-onsite-cta">{L("Adopt On-Site", "Adopsi di Lokasi")}</a>
      </PageHero>

      <section id="destinations" className="container-x py-20">
        <SectionHead dark eyebrow={L("Coral Restoration Sites", "Lokasi Restorasi Karang")} title={L("Four reefs, one mission.", "Empat terumbu, satu misi.")} />
        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <div className="relative aspect-[16/10] overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-ocean to-teal lg:col-span-7" data-testid="sites-map">
            <div className="absolute inset-0 opacity-20" style={{ backgroundImage: "radial-gradient(#5EEAD4 1px, transparent 1px)", backgroundSize: "22px 22px" }} />
            <p className="absolute left-6 top-6 font-serif text-2xl italic text-ivory/60">Indonesia</p>
            {sites.map((x, i) => (
              <button key={x.code} onClick={() => setSel(i)} style={pos(x)} data-testid={`map-pin-${x.code}`} className="group absolute -translate-x-1/2 -translate-y-1/2">
                <span className={`absolute inset-0 animate-ping rounded-full ${i === sel ? "bg-coral/60" : "bg-seafoam/30"}`} />
                <span className={`relative block h-4 w-4 rounded-full border-2 border-ivory ${i === sel ? "bg-coral" : "bg-seafoam"}`} />
                <span className="absolute left-6 top-1/2 -translate-y-1/2 whitespace-nowrap rounded-full bg-abyss/80 px-3 py-1 text-xs opacity-80 group-hover:opacity-100">{x.location.split(",")[0]}</span>
              </button>
            ))}
          </div>
          <AnimatePresence mode="wait">
            {s && (
              <motion.div key={s.code} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.4 }} className="overflow-hidden rounded-[2rem] border border-white/10 bg-navy lg:col-span-5" data-testid="site-detail">
                <img src={s.image} alt={s.location} className="aspect-[16/9] w-full object-cover" />
                <div className="p-7">
                  <p className="eyebrow text-seafoam">{s.name}</p>
                  <p className="mt-2 font-serif text-3xl" data-testid="site-detail-name">{s.location}</p>
                  <div className="mt-5 flex gap-8 text-sm"><div><p className="font-serif text-3xl">+{s.corals}</p><p className="text-xs text-slate-400">{L("corals", "karang")}</p></div><div><p className="font-serif text-3xl">{s.years}</p><p className="text-xs text-slate-400">{L("years active", "tahun aktif")}</p></div><div><p className="font-serif text-3xl">{s.depth}</p><p className="text-xs text-slate-400">{L("depth", "kedalaman")}</p></div></div>
                  <div className="mt-6 flex flex-wrap gap-2">{s.experiences.map((e) => { const [Icon, en, id] = EXP[e]; return <span key={e} className="chip border border-white/15 text-slate-200"><Icon className="h-3.5 w-3.5 text-coral" />{L(en, id)}</span>; })}</div>
                  <EnquiryDialog kind="visit" program={`${s.name} · ${s.location}`} title={L("Plan your visit", "Rencanakan kunjungan")} trigger={<button className="btn-coral mt-7" data-testid="site-plan-visit">{L("Plan a visit", "Rencanakan kunjungan")}</button>} />
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      <section id="onsite" className="bg-ivory py-24 text-ink sm:py-32" data-testid="onsite-section">
        <div className="container-x grid items-center gap-14 lg:grid-cols-2">
          <div>
            <SectionHead eyebrow={L("On-Site Adoption", "Adopsi di Lokasi")} title={L("Adopt your coral in the real reef.", "Adopsi karangmu di terumbu nyata.")}
              sub={L("A half-day conservation experience with our reef team, open to snorkelers and divers.", "Pengalaman konservasi setengah hari bersama tim terumbu kami, terbuka untuk snorkeler dan penyelam.")} />
            <ol className="mt-10 grid gap-4 sm:grid-cols-2">
              {steps.map(([Icon, t], i) => <Reveal key={t} delay={i * 0.05}><li className="flex items-start gap-4 rounded-2xl bg-pearl p-5"><Icon className="h-5 w-5 shrink-0 text-teal" strokeWidth={1.5} /><span><span className="font-mono text-xs text-coral">0{i + 1}</span><span className="block font-serif text-xl">{t}</span></span></li></Reveal>)}
            </ol>
            <EnquiryDialog kind="tourism" program="On-site adoption" title={L("Find a Coral Site", "Temukan Lokasi Karang")} trigger={<button className="btn-ink mt-10" data-testid="find-site-cta">{L("Find a Coral Site", "Temukan Lokasi Karang")} <ArrowRight className="h-4 w-4" /></button>} />
          </div>
          <Reveal><img src="/img/fragment.jpg" alt={L("Tagged coral fragment", "Fragmen karang bertag")} className="aspect-[4/5] w-full rounded-[2rem] object-cover" /></Reveal>
        </div>
      </section>
    </div>
  );
}
