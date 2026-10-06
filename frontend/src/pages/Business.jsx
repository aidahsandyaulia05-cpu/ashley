import { ResponsiveContainer, AreaChart, Area, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";
import { ArrowRight, Check } from "lucide-react";
import { PageHero } from "@/components/site/PageHero";
import { SectionHead, Reveal, Counter } from "@/components/site/Bits";
import { EnquiryDialog, EnquiryForm } from "@/components/site/Enquiry";
import { useLang } from "@/lib/i18n";

const QUARTERS = [{ q: "Q1", corals: 50 }, { q: "Q2", corals: 140 }, { q: "Q3", corals: 290 }, { q: "Q4", corals: 500 }];

export default function Business() {
  const { L } = useLang();
  const programs = [
    ["Adopt 50 Corals", L("A first coral patch carrying your brand's name — ideal for teams and launches.", "Petak karang pertama dengan nama brand Anda — ideal untuk tim dan peluncuran."), ["50 Coral IDs", L("Corporate certificate", "Sertifikat korporat"), L("Quarterly report", "Laporan kuartalan")]],
    ["Adopt 100 Corals", L("A dedicated nursery table, employee adoption codes and an ESG data pack.", "Meja pembibitan khusus, kode adopsi karyawan, dan paket data ESG."), ["100 Coral IDs", L("Employee engagement", "Keterlibatan karyawan"), L("ESG data pack", "Paket data ESG")]],
    ["Adopt 500 Corals", L("A named reef zone with live dashboard and annual impact audit.", "Zona terumbu bernama dengan dasbor langsung dan audit dampak tahunan."), ["500 Coral IDs", L("Live dashboard", "Dasbor langsung"), L("Impact audit", "Audit dampak")]],
    ["Sponsor a Coral Nursery", L("Fund the nursery infrastructure and workers that produce thousands of fragments.", "Danai infrastruktur pembibitan dan pekerja yang menghasilkan ribuan fragmen."), [L("Nursery naming", "Penamaan pembibitan"), L("Worker livelihoods", "Mata pencaharian pekerja"), L("Site visits", "Kunjungan lokasi")]],
    ["Sponsor a Restoration Site", L("Long-term partnership for an entire site: restoration, research and community.", "Kemitraan jangka panjang untuk satu lokasi: restorasi, riset, dan komunitas."), [L("Multi-year program", "Program multi-tahun"), L("Research partnership", "Kemitraan riset"), L("Community programs", "Program komunitas")]],
  ];
  const kpis = [[500, "", L("Corals Restored", "Karang Dipulihkan")], [3, "", L("Restoration Sites", "Lokasi Restorasi")], [24, "", L("Coastal Workers Supported", "Pekerja Pesisir Didukung")], [2, "", L("Research Projects Supported", "Proyek Riset Didukung")], [12400, "+", L("People Reached", "Orang Terjangkau")]];
  return (
    <div className="bg-ivory" data-testid="business-page">
      <PageHero testid="business-hero" image="/img/nursery.jpg" eyebrow="Coral for Business · CSR · ESG" title={L("Turn Your CSR into Something That Grows.", "Ubah CSR Anda Menjadi Sesuatu yang Bertumbuh.")}
        sub={L("Measurable coral restoration with community development and research built in — reported in the language your board and ESG auditors understand.", "Restorasi karang terukur dengan pengembangan komunitas dan riset — dilaporkan dalam bahasa yang dipahami direksi dan auditor ESG Anda.")}>
        <a href="#partner" className="btn-coral" data-testid="business-partner-cta">{L("Partner with REEFORA", "Bermitra dengan REEFORA")} <ArrowRight className="h-4 w-4" /></a>
        <a href="#dashboard" className="btn-ghost">{L("See the dashboard", "Lihat dasbor")}</a>
      </PageHero>

      <section className="container-x py-16">
        <div className="flex flex-wrap items-center gap-3 font-serif text-2xl text-ink sm:text-3xl">
          {["CSR", "ESG", L("Coral Restoration", "Restorasi Karang"), L("Community Development", "Pengembangan Komunitas"), L("Research", "Riset")].map((t, i, a) => (
            <span key={t} className="flex items-center gap-3">{t}{i < a.length - 1 && <span className="text-coral">+</span>}</span>
          ))}
        </div>
      </section>

      <section className="container-x pb-24">
        <SectionHead eyebrow={L("Corporate Programs", "Program Korporat")} title={L("Programs built for scale.", "Program yang dibangun untuk skala.")} />
        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {programs.map(([t, d, f], i) => (
            <Reveal key={t} delay={(i % 3) * 0.07}>
              <div className={`flex h-full flex-col rounded-[1.75rem] p-8 ${i === 2 ? "bg-navy text-ivory" : "border border-ink/10 bg-pearl text-ink"}`} data-testid={`csr-program-${i}`}>
                <span className="font-mono text-xs text-coral">0{i + 1}</span>
                <p className="mt-4 font-serif text-3xl">{t}</p>
                <p className={`mt-3 text-sm ${i === 2 ? "text-slate-300" : "text-slate-600"}`}>{d}</p>
                <ul className="mt-6 flex-1 space-y-2 text-sm">{f.map((x) => <li key={x} className="flex items-center gap-2"><Check className="h-4 w-4 text-seafoam" />{x}</li>)}</ul>
                <EnquiryDialog kind="csr" program={t} title={t} trigger={<button className={`mt-8 self-start ${i === 2 ? "btn-coral" : "btn-ink"}`} data-testid={`csr-program-enquire-${i}`}>{L("Request proposal", "Minta proposal")}</button>} />
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section id="dashboard" className="bg-abyss py-24 text-ivory sm:py-32" data-testid="corporate-dashboard">
        <div className="container-x">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHead dark eyebrow={L("Corporate Dashboard", "Dasbor Korporat")} title={L("Impact your board can read.", "Dampak yang bisa dibaca direksi.")} />
            <span className="chip border border-gold/40 text-gold" data-testid="dashboard-sample-badge">{L("Sample data · [Company Name]", "Data contoh · [Nama Perusahaan]")}</span>
          </div>
          <div className="mt-14 grid grid-cols-2 gap-4 lg:grid-cols-5">
            {kpis.map(([v, s, l], i) => (
              <div key={l} className="rounded-2xl border border-white/10 bg-navy p-6">
                <p className="font-serif text-4xl sm:text-5xl"><Counter to={v} suffix={s} testid={`corp-kpi-${i}`} /></p>
                <p className="mt-2 text-[11px] uppercase tracking-[0.18em] text-slate-400">{l}</p>
              </div>
            ))}
          </div>
          <div className="mt-6 h-72 rounded-2xl border border-white/10 bg-navy p-6">
            <p className="text-sm text-slate-400">{L("Corals restored · cumulative", "Karang dipulihkan · kumulatif")}</p>
            <ResponsiveContainer width="100%" height="88%">
              <AreaChart data={QUARTERS}>
                <defs><linearGradient id="cg" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#FF6B6B" stopOpacity={0.5} /><stop offset="100%" stopColor="#FF6B6B" stopOpacity={0} /></linearGradient></defs>
                <CartesianGrid stroke="#ffffff10" vertical={false} /><XAxis dataKey="q" stroke="#64748b" fontSize={12} /><YAxis stroke="#64748b" fontSize={12} />
                <Tooltip contentStyle={{ background: "#061026", border: "1px solid #ffffff20", borderRadius: 12 }} />
                <Area type="monotone" dataKey="corals" stroke="#FF6B6B" fill="url(#cg)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section id="partner" className="bg-navy py-24 text-ivory sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <SectionHead dark eyebrow={L("Partner with REEFORA", "Bermitra dengan REEFORA")} title={L("Let's grow something together.", "Mari tumbuhkan sesuatu bersama.")}
            sub={L("Tell us about your CSR or ESG goals. We'll design a program with clear deliverables, reporting and on-site engagement.", "Ceritakan tujuan CSR atau ESG Anda. Kami akan merancang program dengan hasil, pelaporan, dan keterlibatan lapangan yang jelas.")} />
          <EnquiryForm kind="partner" program="Corporate partnership" />
        </div>
      </section>
    </div>
  );
}
