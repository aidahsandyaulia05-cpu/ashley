import { PageHero } from "@/components/site/PageHero";
import { SectionHead, Reveal, CoralArt } from "@/components/site/Bits";
import Community from "@/components/home/Community";
import { GetInvolved } from "@/components/home/Programs";
import { useLang } from "@/lib/i18n";

export default function About() {
  const { L } = useLang();
  const values = [
    [L("Personal", "Personal"), L("Every coral has an ID, an adopter and a story.", "Setiap karang punya ID, pengadopsi, dan cerita.")],
    [L("Measurable", "Terukur"), L("Monitoring data for every coral, every quarter.", "Data pemantauan untuk setiap karang, setiap kuartal.")],
    [L("Shareable", "Dapat dibagikan"), L("Certificates and QR profiles made to be shared.", "Sertifikat dan profil QR yang dibuat untuk dibagikan.")],
  ];
  return (
    <div data-testid="about-page">
      <PageHero testid="about-hero" image="/img/reef1.jpg" eyebrow={L("About REEFORA", "Tentang REEFORA")} title={<>Reef <span className="text-coral">+</span> Aura.</>}
        sub={L("The life, energy, beauty and hope radiating from coral reef ecosystems. REEFORA is an Indonesian coral restoration platform where conservation becomes personal, measurable and shareable.", "Kehidupan, energi, keindahan, dan harapan yang terpancar dari ekosistem terumbu karang. REEFORA adalah platform restorasi karang Indonesia di mana konservasi menjadi personal, terukur, dan dapat dibagikan.")} />
      <section className="relative overflow-hidden bg-ivory py-24 sm:py-32">
        <CoralArt className="pointer-events-none absolute -left-10 top-10 h-[420px] w-[340px] text-gold/30" />
        <div className="container-x relative">
          <SectionHead eyebrow={L("Our approach", "Pendekatan kami")} title={L("Restoring Reefs, Reviving Life.", "Memulihkan Terumbu, Menghidupkan Kehidupan.")} />
          <div className="mt-16 grid gap-10 md:grid-cols-3">
            {values.map(([t, d], i) => <Reveal key={t} delay={i * 0.08}><div className="border-t border-ink/15 pt-6"><span className="font-mono text-xs text-coral">0{i + 1}</span><p className="mt-3 font-serif text-4xl text-ink">{t}</p><p className="mt-3 text-slate-600">{d}</p></div></Reveal>)}
          </div>
        </div>
      </section>
      <Community />
      <GetInvolved />
    </div>
  );
}
