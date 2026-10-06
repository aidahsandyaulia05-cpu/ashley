import { Fragment } from "react";
import { Users, Sprout, Waves, Shell, Store, ArrowRight } from "lucide-react";
import { SectionHead, Reveal } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

export default function Community() {
  const { L } = useLang();
  const roles = [
    L("Coastal farmers", "Petani pesisir"), L("Fishers transitioning to reef-friendly livelihoods", "Nelayan yang beralih ke mata pencaharian ramah terumbu"),
    L("Coral nursery workers", "Pekerja pembibitan karang"), L("Local restoration teams", "Tim restorasi lokal"), L("Community educators", "Pendidik komunitas"),
  ];
  const flow = [
    [Users, L("Community", "Komunitas")], [Sprout, L("Coral Nursery", "Pembibitan Karang")], [Waves, L("Restoration", "Restorasi")],
    [Shell, L("Healthy Reef", "Terumbu Sehat")], [Store, L("Tourism & Local Economy", "Pariwisata & Ekonomi Lokal")],
  ];
  return (
    <section id="community" className="bg-ivory py-24 sm:py-36" data-testid="community">
      <div className="container-x grid items-center gap-16 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <SectionHead eyebrow={L("Coastal Community", "Komunitas Pesisir")} title={<>{L("Restoring reefs.", "Memulihkan terumbu.")}<br /><em>{L("Supporting coastal lives.", "Menghidupi masyarakat pesisir.")}</em></>}
            sub={L("Every adoption funds paid work in coastal villages. Conservation here creates ecological and economic value at the same time.", "Setiap adopsi mendanai pekerjaan berbayar di desa pesisir. Konservasi di sini menciptakan nilai ekologis sekaligus ekonomi.")} />
          <ul className="mt-10 space-y-3">
            {roles.map((r, i) => (
              <Reveal key={r} delay={i * 0.05}><li className="flex items-center gap-4 border-b border-ink/10 pb-3 text-ink"><span className="font-mono text-xs text-coral">0{i + 1}</span>{r}</li></Reveal>
            ))}
          </ul>
        </div>
        <Reveal className="lg:col-span-6">
          <div className="relative overflow-hidden rounded-[2rem]">
            <img src="/img/reef_farmers.jpg" alt={L("Reef farmers preparing coral frames", "Petani terumbu menyiapkan rangka karang")} className="aspect-[4/3.2] w-full object-cover" />
            <span className="glass absolute bottom-5 left-5 rounded-full px-4 py-2 text-xs text-ivory">{L("Meet the reef farmers", "Kenali petani terumbu")}</span>
          </div>
        </Reveal>
      </div>
      <div className="container-x mt-20">
        <div className="flex flex-col items-stretch gap-3 rounded-[2rem] bg-navy p-6 text-ivory sm:p-10 lg:flex-row lg:items-center" data-testid="community-flow">
          {flow.map(([Icon, t], i) => (
            <Fragment key={t}>
              <Reveal delay={i * 0.1} className="flex flex-1 items-center gap-4 lg:flex-col lg:text-center">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-seafoam/30 bg-seafoam/10"><Icon className="h-6 w-6 text-seafoam" strokeWidth={1.4} /></span>
                <span className="font-serif text-xl">{t}</span>
              </Reveal>
              {i < flow.length - 1 && <ArrowRight className="mx-auto h-5 w-5 rotate-90 text-coral lg:rotate-0" />}
            </Fragment>
          ))}
        </div>
      </div>
    </section>
  );
}
