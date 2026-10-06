import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Search, ArrowRight, QrCode } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export default function MyCoral() {
  const { L, lang } = useLang();
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [res, setRes] = useState(null);
  const [busy, setBusy] = useState(false);
  const search = async (e) => {
    e.preventDefault();
    if (!q.trim()) return;
    setBusy(true);
    try {
      const r = await api.get("/lookup", { params: { q } });
      if (r.data.length === 1) nav(`/coral/${r.data[0].coral_id}`);
      else setRes(r.data);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div className="relative min-h-screen overflow-hidden bg-abyss pb-32 pt-40 text-ivory" data-testid="my-coral-page">
      <img src="/img/blue_acropora.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-25" />
      <div className="absolute inset-0 bg-gradient-to-b from-abyss/40 to-abyss" />
      <div className="container-x relative max-w-3xl">
        <QrCode className="h-10 w-10 text-seafoam" strokeWidth={1.2} />
        <p className="eyebrow mt-6 text-seafoam">{L("My Coral", "Karangku")}</p>
        <h1 className="display mt-4 text-5xl sm:text-7xl">{L("Find your coral.", "Temukan karangmu.")}</h1>
        <p className="mt-6 text-slate-300">{L("Scan the QR on your certificate, or search with the adopter name, Coral ID or certificate number.", "Pindai QR di sertifikatmu, atau cari dengan nama pengadopsi, Coral ID, atau nomor sertifikat.")}</p>
        <form onSubmit={search} className="mt-10 flex flex-col gap-3 sm:flex-row">
          <label className="relative flex-1">
            <Search className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={L("e.g. Aidah or RF-02481", "mis. Aidah atau RF-02481")} data-testid="mycoral-input"
              className="h-14 w-full rounded-full border border-white/15 bg-white/5 pl-14 pr-5 text-ivory placeholder:text-slate-500 focus:border-seafoam/60 focus:outline-none" />
          </label>
          <button disabled={busy} className="btn-coral h-14 justify-center" data-testid="mycoral-search-btn">{L("Open my coral", "Buka karangku")} <ArrowRight className="h-4 w-4" /></button>
        </form>
        {res && (
          <div className="mt-10 space-y-3" data-testid="mycoral-results">
            {res.length === 0 && <p className="text-slate-400" data-testid="mycoral-empty">{L("No adopted coral found. Check the spelling as written on your certificate.", "Tidak ada karang ditemukan. Periksa ejaan sesuai sertifikatmu.")}</p>}
            {res.map((r) => (
              <Link key={r.coral_id} to={`/coral/${r.coral_id}`} className="glass flex items-center justify-between rounded-2xl p-5 hover:border-coral/40" data-testid={`mycoral-result-${r.coral_id}`}>
                <span><span className="font-mono text-seafoam">{r.coral_id}</span> {r.coral_name && <span className="ml-2 font-serif text-xl italic">“{r.coral_name}”</span>}<span className="block text-xs text-slate-400">{r.adopter_name} · {fmtDate(r.adopted_at, lang)}</span></span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
