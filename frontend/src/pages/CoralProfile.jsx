import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG } from "qrcode.react";
import { HeartPulse, TrendingUp, ShieldCheck, CalendarCheck, MapPin, Thermometer, Award } from "lucide-react";
import { api, fmtDate, profileUrl, mediaSrc } from "@/lib/api";
import { FieldUpdates } from "@/components/coral/FieldUpdates";
import { Reveal, Counter } from "@/components/site/Bits";
import { useLang, STATUS_LABEL, HEALTH_LABEL } from "@/lib/i18n";

const Stat = ({ Icon, label, value, testid, tone = "text-seafoam" }) => (
  <div className="rounded-2xl border border-white/10 bg-navy/80 p-5 backdrop-blur" data-testid={testid}>
    <Icon className={`h-5 w-5 ${tone}`} strokeWidth={1.5} />
    <p className="mt-4 text-[11px] uppercase tracking-[0.2em] text-slate-400">{label}</p>
    <p className="mt-1 font-serif text-3xl">{value}</p>
  </div>
);

const Timeline = ({ items, L, lang }) => (
  <div className="relative mt-10 grid gap-6 sm:grid-cols-5" data-testid="growth-timeline">
    <div className="absolute left-0 right-0 top-[38%] hidden h-px bg-gradient-to-r from-seafoam via-coral to-white/10 sm:block" />
    {items.map((s, i) => (
      <Reveal key={s.label} delay={i * 0.12}>
        <div className={`relative ${s.status === "upcoming" ? "opacity-45" : ""}`} data-testid={`timeline-${i}`}>
          <div className="overflow-hidden rounded-2xl border border-white/10">
            <img src={s.image} alt={s.label} className={`aspect-square w-full object-cover ${s.status === "upcoming" ? "grayscale" : ""}`} />
          </div>
          <p className="mt-4 font-serif text-2xl">{s.label}</p>
          <p className="font-mono text-[11px] text-seafoam">{s.status === "done" ? fmtDate(s.date, lang) : L("Upcoming", "Mendatang")} · +{s.growth}%</p>
          <p className="mt-2 text-xs leading-relaxed text-slate-400">{s.note}</p>
        </div>
      </Reveal>
    ))}
  </div>
);

export default function CoralProfile() {
  const { coralId } = useParams();
  const { L, lang } = useLang();
  const [d, setD] = useState(null);
  useEffect(() => { api.get(`/profile/${coralId}`).then((r) => setD(r.data)).catch(() => setD(false)); }, [coralId]);

  if (d === false) return <div className="bg-abyss px-6 pb-40 pt-48 text-center font-serif text-4xl text-ivory" data-testid="profile-not-found">{L("Coral not found.", "Karang tidak ditemukan.")}</div>;
  if (!d) return <div className="min-h-screen bg-abyss" />;
  const { coral, adoption, timeline, monitoring, updates } = d;
  const hl = (v) => L(...(HEALTH_LABEL[v] || [v, v]));

  if (!adoption) return (
    <div className="bg-abyss pb-32 pt-40 text-ivory" data-testid="profile-unadopted">
      <div className="container-x grid items-center gap-12 lg:grid-cols-2">
        <img src={coral.image} alt="" className="aspect-square w-full rounded-[2rem] object-cover" />
        <div>
          <p className="font-mono text-sm text-seafoam">CORAL #{coral.coral_id}</p>
          <h1 className="display mt-4 text-5xl italic sm:text-6xl">{coral.scientific_name}</h1>
          <p className="mt-4 text-slate-300">{coral.site_name} · {coral.location}</p>
          <p className="mt-6 font-serif text-2xl">{L("This coral is still waiting for its adopter.", "Karang ini masih menunggu pengadopsinya.")}</p>
          {coral.adoption_status === "available" && <Link to={`/adopt/${coral.coral_id}`} className="btn-coral mt-8" data-testid="profile-adopt-btn">{L("Adopt this coral", "Adopsi karang ini")}</Link>}
        </div>
      </div>
    </div>
  );

  return (
    <div className="bg-abyss text-ivory" data-testid="coral-profile">
      <section className="relative overflow-hidden pb-20 pt-36">
        <img src={mediaSrc(monitoring.photo)} alt="" className="water absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-b from-abyss/60 via-abyss/70 to-abyss" />
        <div className="rays absolute inset-0" />
        <div className="container-x relative grid gap-12 lg:grid-cols-12">
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1 }} className="lg:col-span-8">
            <p className="eyebrow text-seafoam">{L("Your Coral", "Karangmu")}</p>
            <h1 className="display mt-4 text-5xl sm:text-7xl" data-testid="profile-welcome">{L("Welcome to Coral", "Selamat datang di Karang")}<br /><span className="font-mono text-4xl tracking-wide text-coral sm:text-6xl">{coral.coral_id}</span></h1>
            {adoption.coral_name && <p className="mt-4 font-serif text-4xl italic" data-testid="profile-coral-name">“{adoption.coral_name}”</p>}
            <div className="mt-8 grid max-w-2xl grid-cols-2 gap-6 text-sm sm:grid-cols-4">
              <div><p className="text-slate-500">{L("Adopted by", "Diadopsi oleh")}</p><p className="mt-1 font-serif text-xl" data-testid="profile-adopter">{adoption.adopter_name}</p></div>
              <div><p className="text-slate-500">{L("Species", "Spesies")}</p><p className="mt-1 font-serif text-xl italic">{coral.scientific_name}</p></div>
              <div><p className="text-slate-500">{L("Location", "Lokasi")}</p><p className="mt-1 flex items-center gap-1"><MapPin className="h-3.5 w-3.5 text-coral" />{coral.location}</p></div>
              <div><p className="text-slate-500">{L("Adoption date", "Tanggal adopsi")}</p><p className="mt-1" data-testid="profile-date">{fmtDate(adoption.adopted_at, lang)}</p></div>
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.4, duration: 0.9 }} className="self-end lg:col-span-4">
            <div className="glass flex items-center gap-5 rounded-3xl p-5">
              <div className="rounded-xl bg-ivory p-2"><QRCodeSVG value={profileUrl(coral.coral_id)} size={92} fgColor="#061026" data-testid="profile-qr" /></div>
              <div className="text-xs text-slate-300">
                <p className="eyebrow text-coral">Coral QR</p>
                <p className="mt-2">{L("Attached to the coral's tag at", "Terpasang pada tag karang di")} {coral.site_name}.</p>
                <Link to={`/certificate/${adoption.id}`} className="mt-3 flex items-center gap-1.5 text-seafoam hover:text-ivory" data-testid="profile-cert-link"><Award className="h-4 w-4" />{L("View certificate", "Lihat sertifikat")}</Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="container-x pb-24">
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <Stat Icon={HeartPulse} label={L("Coral Health", "Kesehatan Karang")} value={hl(monitoring.health)} testid="stat-health" />
          <Stat Icon={TrendingUp} label={L("Growth", "Pertumbuhan")} value={<Counter to={monitoring.growth} prefix="+" suffix="%" />} testid="stat-growth" tone="text-coral" />
          <Stat Icon={ShieldCheck} label={L("Survival Status", "Status Bertahan")} value={hl(monitoring.survival)} testid="stat-survival" />
          <Stat Icon={CalendarCheck} label={L("Last Monitoring", "Pemantauan Terakhir")} value={<span className="text-2xl">{fmtDate(monitoring.last_monitoring, lang)}</span>} testid="stat-last" tone="text-gold" />
        </div>

        <div className="mt-24">
          <p className="eyebrow text-seafoam">{L("Growth Timeline", "Linimasa Pertumbuhan")}</p>
          <h2 className="display mt-3 text-4xl sm:text-5xl">{L("Day 01 → Month 24", "Hari 01 → Bulan 24")}</h2>
          <Timeline items={timeline} L={L} lang={lang} />
          <p className="mt-6 text-xs text-slate-500">{L("Monitoring photos shown are representative placeholders until field photos are uploaded.", "Foto pemantauan adalah placeholder representatif hingga foto lapangan diunggah.")}</p>
        </div>

        <div className="mt-24 grid gap-6 lg:grid-cols-3">
          <div className="overflow-hidden rounded-[1.75rem] border border-white/10 lg:col-span-1">
            <img src={mediaSrc(monitoring.photo)} alt="" className="aspect-[4/3] w-full object-cover" data-testid="profile-recent-photo" />
            <div className="p-6"><p className="eyebrow text-coral">{L("Recent photo", "Foto terbaru")}</p><p className="mt-2 text-sm text-slate-300">{updates?.[0]?.note || timeline.filter((t) => t.status === "done").slice(-1)[0]?.note}</p></div>
          </div>
          <div className="rounded-[1.75rem] border border-white/10 bg-teal/60 p-8 lg:col-span-2" data-testid="profile-impact">
            <p className="eyebrow text-seafoam">{L("Your impact", "Dampakmu")}</p>
            <div className="mt-8 grid grid-cols-2 gap-8 sm:grid-cols-4">
              <div><p className="font-serif text-4xl"><Counter to={monitoring.impact.reef_area_cm2} /></p><p className="text-xs text-slate-300">cm² {L("living reef", "terumbu hidup")}</p></div>
              <div><p className="font-serif text-4xl"><Counter to={monitoring.impact.polyps_est} /></p><p className="text-xs text-slate-300">{L("polyps (est.)", "polip (perkiraan)")}</p></div>
              <div><p className="font-serif text-4xl"><Counter to={monitoring.impact.community_hours} /></p><p className="text-xs text-slate-300">{L("community work hours", "jam kerja komunitas")}</p></div>
              <div><p className="flex items-center gap-1 font-serif text-4xl"><Thermometer className="h-6 w-6 text-gold" />{monitoring.water_temp}°</p><p className="text-xs text-slate-300">{L("site water temp", "suhu air lokasi")}</p></div>
            </div>
            <p className="mt-8 text-sm text-slate-300">{L("Restoration status", "Status restorasi")}: <span className="text-ivory">{L(...STATUS_LABEL[coral.restoration_status])}</span> · {L("Package", "Paket")}: <span className="text-ivory">{adoption.package_name}</span> · <span className="font-mono">{adoption.certificate_no}</span></p>
          </div>
        </div>
        <FieldUpdates updates={updates} />
      </section>
    </div>
  );
}
