import { Link } from "react-router-dom";
import { Instagram } from "lucide-react";
import { INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/api";
import { Logo, CoralArt } from "./Bits";
import { useLang } from "@/lib/i18n";

export default function Footer() {
  const { L } = useLang();
  const cols = [
    [L("Adopt", "Adopsi"), [["/adopt", L("Choose Your Coral", "Pilih Karangmu")], ["/my-coral", L("My Coral", "Karangku")], ["/visit", L("Adopt On-Site", "Adopsi di Lokasi")]]],
    [L("Programs", "Program"), [["/business", L("Coral for Business", "Karang untuk Bisnis")], ["/idol", "IDOL × REEF"], ["/about#community", L("Coastal Community", "Komunitas Pesisir")]]],
    [L("Explore", "Jelajahi"), [["/science", L("Science", "Sains")], ["/visit", L("Visit the Reef", "Kunjungi Terumbu")], ["/gallery", L("Reef Gallery", "Galeri Terumbu")], ["/about", L("About", "Tentang")], ["/field", L("Field Team", "Tim Lapangan")]]],
  ];
  return (
    <footer className="relative overflow-hidden bg-abyss pb-28 pt-24 text-ivory md:pb-12" data-testid="site-footer">
      <CoralArt className="pointer-events-none absolute -right-10 -top-10 h-[420px] w-[360px] text-coral/10" />
      <div className="container-x relative grid gap-14 md:grid-cols-12">
        <div className="md:col-span-5">
          <Logo />
          <p className="mt-6 max-w-sm font-serif text-3xl font-light leading-tight">Restoring Reefs, Reviving Life.</p>
          <p className="mt-4 max-w-sm text-sm text-slate-400">{L("Reef + Aura — the life, energy, beauty and hope radiating from coral reef ecosystems.", "Reef + Aura — kehidupan, energi, keindahan, dan harapan yang terpancar dari ekosistem terumbu karang.")}</p>
          <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="mt-6 inline-flex items-center gap-2 rounded-full border border-white/20 px-4 py-2 text-sm text-ivory transition-colors hover:border-coral hover:text-coral" data-testid="footer-instagram"><Instagram className="h-4 w-4" />{INSTAGRAM_HANDLE}</a>
        </div>
        {cols.map(([h, items]) => (
          <div key={h} className="md:col-span-2">
            <p className="eyebrow text-seafoam">{h}</p>
            <ul className="mt-5 space-y-3 text-sm text-slate-300">
              {items.map(([to, t]) => <li key={t}><Link to={to} className="transition-colors hover:text-coral">{t}</Link></li>)}
            </ul>
          </div>
        ))}
      </div>
      <div className="container-x relative mt-20 flex flex-col justify-between gap-3 border-t border-white/10 pt-6 text-xs text-slate-500 sm:flex-row">
        <span>© 2026 REEFORA. {L("All rights reserved.", "Hak cipta dilindungi.")}</span>
        <span>{L("Adopt a Coral. Restore a Reef.", "Adopsi Karang. Pulihkan Terumbu.")}</span>
      </div>
    </footer>
  );
}
