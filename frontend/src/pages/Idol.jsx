import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "sonner";
import { Share2, Link2, MessageCircle, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/site/PageHero";
import { SectionHead, Reveal, Counter } from "@/components/site/Bits";
import { EnquiryDialog } from "@/components/site/Enquiry";
import { Certificate } from "@/components/coral/Certificate";
import { useLang } from "@/lib/i18n";

export default function Idol() {
  const { L } = useLang();
  const [c, setC] = useState(null);
  useEffect(() => { api.get("/campaign/idol").then((r) => setC(r.data)); }, []);
  const pageUrl = `${window.location.origin}/idol`;
  const text = L("Our fandom is growing a coral reef! Adopt a coral with REEFORA →", "Fandom kita sedang menumbuhkan terumbu karang! Adopsi karang bersama REEFORA →");
  const copy = async () => { await navigator.clipboard.writeText(`${text} ${pageUrl}`); toast.success(L("Campaign link copied", "Tautan kampanye disalin")); };
  const pct = c ? (c.adopted / c.goal) * 100 : 0;
  const maxF = c ? Math.max(...c.fandoms.map((f) => f.count)) : 1;

  return (
    <div className="bg-abyss text-ivory" data-testid="idol-page">
      <PageHero testid="idol-hero" image="/img/reef4.jpg" eyebrow="IDOL × REEF" title={L("Your Fandom Can Help a Reef Grow.", "Fandom-mu Bisa Menumbuhkan Terumbu.")}
        sub={L("Artists, idols and creators launch an official coral garden. Fans adopt individual corals — together they build a living reef.", "Artis, idola, dan kreator meluncurkan taman karang resmi. Fans mengadopsi karang satu per satu — bersama mereka membangun terumbu yang hidup.")}>
        <Link to="/adopt?type=idol" className="btn-coral" data-testid="idol-adopt-cta">{L("Adopt for the campaign", "Adopsi untuk kampanye")} <ArrowRight className="h-4 w-4" /></Link>
        <EnquiryDialog kind="idol" title={L("Launch a campaign", "Luncurkan kampanye")} program="IDOL × REEF campaign" trigger={<button className="btn-ghost" data-testid="idol-launch-btn">{L("Launch a campaign", "Luncurkan kampanye")}</button>} />
      </PageHero>

      <section className="container-x pb-24" data-testid="idol-dashboard">
        <div className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-gradient-to-br from-plum via-navy to-teal p-8 sm:p-12">
          <div className="absolute -right-20 -top-20 h-80 w-80 rounded-full bg-coral/25 blur-[100px]" />
          <div className="relative grid gap-12 lg:grid-cols-12">
            <div className="lg:col-span-7">
              <p className="eyebrow text-gold">{c?.garden || "Official Coral Garden"}</p>
              <p className="mt-3 font-serif text-5xl sm:text-6xl" data-testid="idol-artist">{c?.artist}</p>
              <p className="mt-10 font-serif text-6xl font-light sm:text-8xl" data-testid="idol-progress-count">
                {c ? <Counter to={c.adopted} /> : "—"}<span className="text-3xl text-slate-400 sm:text-4xl"> / {c?.goal.toLocaleString("en-US")}</span>
              </p>
              <p className="mt-2 text-sm uppercase tracking-[0.2em] text-slate-300">{L("Corals Adopted", "Karang Diadopsi")}</p>
              <div className="mt-8 h-3 overflow-hidden rounded-full bg-white/10">
                <motion.div className="h-full rounded-full bg-gradient-to-r from-coral via-ember to-gold" initial={{ width: 0 }} whileInView={{ width: `${pct}%` }} viewport={{ once: true }} transition={{ duration: 2.2, ease: [0.22, 1, 0.36, 1] }} data-testid="idol-progress-bar" />
              </div>
              <p className="mt-3 text-xs text-slate-400">{pct.toFixed(1)}% {L("of the reef goal", "dari target terumbu")}</p>
              <div className="mt-10 flex flex-wrap gap-3">
                <button onClick={copy} className="btn-ghost" data-testid="idol-copy-link"><Link2 className="h-4 w-4" />{L("Copy link", "Salin tautan")}</button>
                <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="idol-share-x"><Share2 className="h-4 w-4" />X</a>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${text} ${pageUrl}`)}`} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="idol-share-wa"><MessageCircle className="h-4 w-4" />WhatsApp</a>
              </div>
            </div>
            <div className="lg:col-span-5">
              <p className="eyebrow text-seafoam">{L("Fandom leaderboard", "Papan peringkat fandom")}</p>
              <div className="mt-6 space-y-5">
                {c?.fandoms.map((f, i) => (
                  <div key={f.name} data-testid={`fandom-${i}`}>
                    <div className="flex justify-between text-sm"><span><span className="font-mono text-coral">0{i + 1}</span> {f.name}</span><span className="font-mono">{f.count.toLocaleString("en-US")}</span></div>
                    <div className="mt-2 h-1.5 rounded-full bg-white/10"><motion.div className="h-full rounded-full bg-seafoam" initial={{ width: 0 }} whileInView={{ width: `${(f.count / maxF) * 100}%` }} viewport={{ once: true }} transition={{ duration: 1.6, delay: i * 0.15 }} /></div>
                  </div>
                ))}
              </div>
              <p className="mt-8 text-xs text-slate-500">{L("Artist and fandom names are placeholders until a campaign goes live.", "Nama artis dan fandom adalah placeholder hingga kampanye berjalan.")}</p>
            </div>
          </div>
        </div>
      </section>

      <section className="bg-ivory py-24 text-ink sm:py-32">
        <div className="container-x grid items-center gap-14 lg:grid-cols-12">
          <div className="lg:col-span-5">
            <SectionHead eyebrow={L("How fans join", "Cara fans bergabung")} title={L("One fan. One coral. One reef.", "Satu fan. Satu karang. Satu terumbu.")} />
            <ol className="mt-10 space-y-5">
              {[L("Open the campaign and pick a coral", "Buka kampanye dan pilih karang"), L("Adopt with your fan name", "Adopsi dengan nama fan-mu"), L("Get a personalised campaign certificate", "Dapatkan sertifikat kampanye personal"), L("Share it — and watch the counter grow", "Bagikan — dan lihat penghitung bertambah")].map((s, i) => (
                <Reveal key={s} delay={i * 0.06}><li className="flex gap-4 border-b border-ink/10 pb-4"><span className="font-mono text-coral">0{i + 1}</span><span className="font-serif text-2xl">{s}</span></li></Reveal>
              ))}
            </ol>
          </div>
          <Reveal className="lg:col-span-7">
            <Certificate adoption={{ adopter_name: "[Fan Name]", coral_id: "RF-02490", coral_name: "[Artist] Garden", adopted_at: new Date().toISOString(), certificate_no: "IDOL-REEF-0002482" }}
              coral={{ scientific_name: "Acropora hyacinthus", site_name: "Restoration Site D", location: "Raja Ampat, Papua Barat" }} />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
