import { Link } from "react-router-dom";
import { ArrowUpRight, MonitorSmartphone, MapPinned } from "lucide-react";
import { SectionHead, Reveal } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

export const AdoptionTypes = () => {
  const { L } = useLang();
  const types = [
    ["individual", "/img/acropora.jpg", L("Individual", "Individu"), L("Adopt a coral personally — for yourself, a loved one, or a memory.", "Adopsi karang secara pribadi — untuk dirimu, orang tersayang, atau sebuah kenangan."), "/adopt?type=individual"],
    ["corporate", "/img/nursery.jpg", "Corporate CSR", L("Adopt coral colonies for sustainability and CSR programs.", "Adopsi koloni karang untuk program keberlanjutan dan CSR."), "/business"],
    ["idol", "/img/polyps.jpg", L("Idol / Artist / Creator", "Idola / Artis / Kreator"), L("Campaign-based adoption for artists, idols, influencers and fandoms.", "Adopsi berbasis kampanye untuk artis, idola, influencer, dan fandom."), "/idol"],
    ["tourism", "/img/reef1.jpg", L("Tourism Partner", "Mitra Pariwisata"), L("Coral adoption for hotels, resorts, dive operators and destinations.", "Adopsi karang untuk hotel, resor, operator selam, dan destinasi."), "/visit"],
  ];
  return (
    <section className="bg-pearl py-24 sm:py-32" data-testid="adoption-types">
      <div className="container-x">
        <SectionHead eyebrow={L("Adoption Types", "Tipe Adopsi")} title={L("Four ways to grow a reef.", "Empat cara menumbuhkan terumbu.")} />
        <div className="mt-16 grid gap-6 md:grid-cols-2 lg:grid-cols-4">
          {types.map(([k, img, t, d, to], i) => (
            <Reveal key={k} delay={i * 0.08}>
              <Link to={to} data-testid={`adoption-type-${k}`} className="group block overflow-hidden rounded-[1.5rem] bg-ivory shadow-[0_30px_60px_-40px_rgba(6,16,38,0.5)]">
                <div className="aspect-[4/3] overflow-hidden"><img src={img} alt={t} loading="lazy" className="img-zoom h-full w-full object-cover" /></div>
                <div className="p-7">
                  <div className="flex items-start justify-between"><p className="font-serif text-2xl text-ink">{t}</p><ArrowUpRight className="h-5 w-5 text-coral transition-transform duration-300 group-hover:-translate-y-0.5 group-hover:translate-x-0.5" /></div>
                  <p className="mt-3 text-sm leading-relaxed text-slate-600">{d}</p>
                </div>
              </Link>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export const OnlineOnsite = () => {
  const { L } = useLang();
  return (
    <section className="bg-pearl pb-24 sm:pb-32" data-testid="online-onsite">
      <div className="container-x grid gap-6 lg:grid-cols-2">
        {[
          [MonitorSmartphone, "/img/blue_acropora.jpg", L("Adopt Online", "Adopsi Online"), L("From anywhere in the world, in under three minutes. Certificate and QR delivered instantly.", "Dari mana saja di dunia, kurang dari tiga menit. Sertifikat dan QR langsung diterbitkan."), "/adopt", L("Start now", "Mulai sekarang"), "online"],
          [MapPinned, "/img/diver.jpg", L("Adopt Your Coral in the Real Reef", "Adopsi Karangmu di Terumbu Nyata"), L("Visit a restoration site, plant your coral with our team, and scan its QR tag underwater.", "Kunjungi lokasi restorasi, tanam karangmu bersama tim kami, dan pindai tag QR-nya di bawah air."), "/visit#onsite", L("Find a Coral Site", "Temukan Lokasi Karang"), "onsite"],
        ].map(([Icon, img, t, d, to, cta, k]) => (
          <Reveal key={k}>
            <div className="group relative h-[420px] overflow-hidden rounded-[2rem] text-ivory" data-testid={`mode-${k}`}>
              <img src={img} alt="" className="img-zoom absolute inset-0 h-full w-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/50 to-transparent" />
              <div className="absolute inset-x-0 bottom-0 p-8 sm:p-10">
                <Icon className="h-7 w-7 text-seafoam" strokeWidth={1.3} />
                <p className="mt-5 max-w-md font-serif text-4xl font-light leading-tight">{t}</p>
                <p className="mt-3 max-w-md text-sm text-slate-300">{d}</p>
                <Link to={to} className="btn-coral mt-7" data-testid={`mode-${k}-cta`}>{cta}</Link>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
};
