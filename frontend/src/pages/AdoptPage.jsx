import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { api } from "@/lib/api";
import { PageHero } from "@/components/site/PageHero";
import { CoralFilters } from "@/components/coral/CoralFilters";
import { CoralCard } from "@/components/coral/CoralCard";
import { useLang } from "@/lib/i18n";

export default function AdoptPage() {
  const { L } = useLang();
  const [params] = useSearchParams();
  const [meta, setMeta] = useState(null);
  const [corals, setCorals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [onlyAvail, setOnlyAvail] = useState(true);
  const [filters, setFilters] = useState({ q: "", species: "", location: "", adoption_type: params.get("type") || "", site: "" });

  useEffect(() => { api.get("/meta").then((r) => setMeta(r.data)); }, []);
  useEffect(() => {
    setLoading(true);
    const p = Object.fromEntries(Object.entries(filters).filter(([, v]) => v));
    if (onlyAvail) p.status = "available";
    const t = setTimeout(() => api.get("/corals", { params: p }).then((r) => setCorals(r.data)).finally(() => setLoading(false)), 200);
    return () => clearTimeout(t);
  }, [filters, onlyAvail]);

  return (
    <div className="bg-abyss text-ivory" data-testid="adopt-page">
      <PageHero image="/img/acropora.jpg" eyebrow={L("Choose Your Coral", "Pilih Karangmu")} title={L("Find the coral that's yours.", "Temukan karang milikmu.")}
        sub={L("Each coral is grown in our nurseries, tagged with a unique Coral ID and monitored by local restoration teams.", "Setiap karang ditumbuhkan di pembibitan kami, diberi Coral ID unik, dan dipantau oleh tim restorasi lokal.")} />
      <section className="container-x pb-28 pt-4">
        <div className="rounded-[2rem] border border-white/10 bg-navy/70 p-5 sm:p-8">
          <CoralFilters meta={meta} filters={filters} setFilters={setFilters} />
          <div className="mt-5 flex flex-wrap items-center justify-between gap-3 text-sm text-slate-400">
            <span data-testid="coral-count">{corals.length} {L("corals", "karang")}</span>
            <label className="flex cursor-pointer items-center gap-2">
              <input type="checkbox" checked={onlyAvail} onChange={(e) => setOnlyAvail(e.target.checked)} className="accent-coral" data-testid="filter-available-only" />
              {L("Show available only", "Hanya yang tersedia")}
            </label>
          </div>
        </div>
        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4" data-testid="coral-grid">
          {corals.map((c) => <CoralCard key={c.coral_id} coral={c} />)}
        </div>
        {!loading && corals.length === 0 && (
          <p className="py-20 text-center font-serif text-2xl text-slate-400" data-testid="coral-empty">{L("No corals match these filters yet.", "Belum ada karang yang cocok dengan filter ini.")}</p>
        )}
      </section>
    </div>
  );
}
