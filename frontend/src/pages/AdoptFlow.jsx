import { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate, Link } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import { ArrowLeft, ArrowRight, Check, MapPin } from "lucide-react";
import { api, errMsg, idr } from "@/lib/api";
import { useLang, TYPE_LABEL } from "@/lib/i18n";
import { StepType, StepPackage, StepPersonal, StepDetails, PACKAGES } from "@/components/adopt/Steps";
import { QrisPayment } from "@/components/adopt/QrisPayment";

const Summary = ({ coral, form, L }) => {
  const pkg = PACKAGES[form.package];
  const total = pkg.price + Number(form.extra_donation || 0);
  return (
    <aside className="sticky top-28 overflow-hidden rounded-[1.75rem] border border-white/10 bg-navy" data-testid="adopt-summary">
      <img src={coral.image} alt={coral.scientific_name} className="aspect-[4/3] w-full object-cover" />
      <div className="p-6">
        <p className="font-mono text-xs text-seafoam">CORAL #{coral.coral_id}</p>
        <p className="mt-1 font-serif text-3xl italic">{coral.scientific_name}</p>
        {form.coral_name && <p className="font-serif text-xl text-coral">“{form.coral_name}”</p>}
        <p className="mt-3 flex items-center gap-1.5 text-xs text-slate-400"><MapPin className="h-3.5 w-3.5 text-coral" />{coral.site_name} · {coral.location}</p>
        <dl className="mt-6 space-y-2 border-t border-white/10 pt-5 text-sm">
          <div className="flex justify-between"><dt className="text-slate-400">{L("Type", "Tipe")}</dt><dd>{L(...TYPE_LABEL[form.adoption_type])}</dd></div>
          <div className="flex justify-between"><dt className="text-slate-400">{L("Package", "Paket")} · {pkg.name}</dt><dd>{idr(pkg.price)}</dd></div>
          {form.extra_donation > 0 && <div className="flex justify-between"><dt className="text-slate-400">{L("Extra support", "Dukungan tambahan")} ({form.frequency === "monthly" ? L("monthly", "bulanan") : L("one-time", "sekali")})</dt><dd>{idr(form.extra_donation)}</dd></div>}
          <div className="flex justify-between border-t border-white/10 pt-3 font-serif text-2xl"><dt>Total</dt><dd data-testid="adopt-total">{idr(total)}</dd></div>
        </dl>
      </div>
    </aside>
  );
};

export default function AdoptFlow() {
  const { coralId } = useParams();
  const [params] = useSearchParams();
  const nav = useNavigate();
  const { L } = useLang();
  const [coral, setCoral] = useState(null);
  const [step, setStep] = useState(0);
  const [adoption, setAdoption] = useState(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    adoption_type: TYPE_LABEL[params.get("type")] ? params.get("type") : "individual", package: "guardian", extra_donation: 0, frequency: "one-time",
    project: "", coral_name: "", message: "", adopter_name: "", email: "", phone: "", campaign: params.get("campaign") || "",
  });
  useEffect(() => { api.get(`/corals/${coralId}`).then((r) => { setCoral(r.data); setForm((f) => ({ ...f, project: r.data.site_code })); }).catch(() => setCoral(false)); }, [coralId]);

  const steps = [L("Adoption", "Adopsi"), L("Package", "Paket"), L("Personalize", "Personalisasi"), L("Your details", "Data diri"), L("Payment", "Pembayaran")];
  const valid = step !== 3 || (form.adopter_name.trim() && /\S+@\S+\.\S+/.test(form.email));

  const next = async () => {
    if (step < 3) return setStep(step + 1);
    setBusy(true);
    try {
      const body = { ...form, extra_donation: Number(form.extra_donation) || 0, coral_name: form.coral_name || null, phone: form.phone || null, message: form.message || null, campaign: form.campaign || null };
      const r = await api.post("/adoptions", { ...body, coral_id: coral.coral_id });
      setAdoption(r.data);
      setStep(4);
    } catch (e) {
      toast.error(errMsg(e));
    } finally {
      setBusy(false);
    }
  };

  const confirm = async () => {
    setBusy(true);
    try {
      const r = await api.post(`/adoptions/${adoption.id}/confirm`);
      nav(`/certificate/${r.data.id}?new=1`);
    } catch (e) {
      toast.error(errMsg(e));
      setBusy(false);
    }
  };

  if (coral === false) return <div className="bg-abyss px-6 pb-40 pt-48 text-center text-ivory"><p className="font-serif text-4xl">{L("Coral not found.", "Karang tidak ditemukan.")}</p><Link to="/adopt" className="btn-coral mt-8">{L("Browse corals", "Lihat karang")}</Link></div>;
  if (!coral) return <div className="min-h-screen bg-abyss" />;
  if (coral.adoption_status !== "available" && !adoption) return (
    <div className="bg-abyss px-6 pb-40 pt-48 text-center text-ivory" data-testid="coral-unavailable">
      <p className="font-serif text-4xl">{L(`Coral ${coral.coral_id} is no longer available.`, `Karang ${coral.coral_id} sudah tidak tersedia.`)}</p>
      <div className="mt-8 flex justify-center gap-3"><Link to="/adopt" className="btn-coral">{L("Choose another coral", "Pilih karang lain")}</Link><Link to={`/coral/${coral.coral_id}`} className="btn-ghost">{L("View profile", "Lihat profil")}</Link></div>
    </div>
  );

  const set = (patch) => setForm((f) => ({ ...f, ...patch }));
  const Body = [StepType, StepPackage, StepPersonal, StepDetails][step];

  return (
    <div className="min-h-screen bg-abyss pb-32 pt-32 text-ivory" data-testid="adopt-flow">
      <div className="container-x">
        <Link to="/adopt" className="flex items-center gap-2 text-sm text-slate-400 hover:text-ivory" data-testid="adopt-back-catalogue"><ArrowLeft className="h-4 w-4" />{L("All corals", "Semua karang")}</Link>
        <h1 className="display mt-6 text-5xl sm:text-6xl">{L("Adopt", "Adopsi")} <em className="text-coral">#{coral.coral_id}</em></h1>
        <ol className="mt-10 flex gap-2 overflow-x-auto pb-2" data-testid="adopt-steps">
          {steps.map((s, i) => (
            <li key={s} className={`flex shrink-0 items-center gap-2 rounded-full border px-4 py-2 text-xs ${i === step ? "border-coral bg-coral/10 text-ivory" : i < step ? "border-seafoam/40 text-seafoam" : "border-white/10 text-slate-500"}`}>
              {i < step ? <Check className="h-3.5 w-3.5" /> : <span className="font-mono">0{i + 1}</span>}{s}
            </li>
          ))}
        </ol>
        <div className="mt-10 grid gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              <motion.div key={step} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }} transition={{ duration: 0.4 }}>
                {step < 4 ? <Body form={form} set={set} coral={coral} /> : <QrisPayment adoption={adoption} onConfirm={confirm} busy={busy} />}
              </motion.div>
            </AnimatePresence>
            {step < 4 && (
              <div className="mt-10 flex items-center justify-between">
                <button onClick={() => setStep(Math.max(0, step - 1))} disabled={step === 0} className="btn-ghost disabled:opacity-30" data-testid="adopt-prev">{L("Back", "Kembali")}</button>
                <button onClick={next} disabled={!valid || busy} className="btn-coral disabled:opacity-40" data-testid="adopt-next">
                  {step === 3 ? (busy ? L("Preparing…", "Menyiapkan…") : L("Continue to payment", "Lanjut ke pembayaran")) : L("Continue", "Lanjut")} <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </div>
          <div className="lg:col-span-5"><Summary coral={coral} form={form} L={L} /></div>
        </div>
      </div>
    </div>
  );
}
