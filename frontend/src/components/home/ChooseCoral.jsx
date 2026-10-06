import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { CoralCard } from "@/components/coral/CoralCard";
import { SectionHead, Reveal } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

export default function ChooseCoral() {
  const { L } = useLang();
  const [corals, setCorals] = useState([]);
  useEffect(() => { api.get("/corals", { params: { status: "available" } }).then((r) => setCorals(r.data.slice(0, 4))); }, []);
  return (
    <section className="relative bg-abyss py-24 text-ivory sm:py-32" data-testid="choose-coral">
      <div className="container-x">
        <div className="flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <SectionHead dark eyebrow={L("Choose Your Coral", "Pilih Karangmu")} title={L("Every coral has a name, a number, a place.", "Setiap karang punya nama, nomor, dan tempat.")} />
          <Link to="/adopt" className="btn-ghost shrink-0" data-testid="browse-all-corals">{L("Browse all corals", "Lihat semua karang")} <ArrowRight className="h-4 w-4" /></Link>
        </div>
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {corals.map((c, i) => <Reveal key={c.coral_id} delay={i * 0.08}><CoralCard coral={c} /></Reveal>)}
        </div>
      </div>
    </section>
  );
}
