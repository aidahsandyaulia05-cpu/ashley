import { useEffect, useState } from "react";
import { Link, NavLink, useLocation } from "react-router-dom";
import { Menu, X, ChevronDown, Home, Sprout, QrCode, Building2, Compass } from "lucide-react";
import { Logo } from "./Bits";
import { useLang } from "@/lib/i18n";

export const useNavLinks = () => {
  const { L } = useLang();
  return [
    { to: "/", label: L("Home", "Beranda"), id: "home" },
    { to: "/adopt", label: L("Adopt", "Adopsi"), id: "adopt" },
    { to: "/#how", label: L("How It Works", "Cara Kerja"), id: "how" },
    { to: "/#impact", label: L("Impact", "Dampak"), id: "impact" },
    { to: "/science", label: L("Science", "Sains"), id: "science" },
    { to: "/visit", label: L("Visit", "Kunjungi"), id: "visit" },
    { to: "/about", label: L("About", "Tentang"), id: "about" },
  ];
};

const LangSwitch = () => {
  const { lang, setLang } = useLang();
  return (
    <div className="flex rounded-full border border-white/20 p-0.5 text-[11px] font-semibold" data-testid="lang-switch">
      {["en", "id"].map((l) => (
        <button key={l} data-testid={`lang-${l}`} onClick={() => setLang(l)}
          className={`rounded-full px-2.5 py-1 uppercase transition-colors ${lang === l ? "bg-ivory text-abyss" : "text-ivory/70 hover:text-ivory"}`}>
          {l}
        </button>
      ))}
    </div>
  );
};

const Programs = ({ L }) => (
  <div className="group relative">
    <button className="flex items-center gap-1 text-[13px] text-ivory/80 hover:text-ivory" data-testid="nav-programs">
      {L("Programs", "Program")} <ChevronDown className="h-3.5 w-3.5" />
    </button>
    <div className="invisible absolute left-1/2 top-full w-64 -translate-x-1/2 pt-4 opacity-0 transition-opacity duration-300 group-hover:visible group-hover:opacity-100">
      <div className="rounded-2xl border border-white/10 bg-navy/95 p-2 backdrop-blur-xl">
        {[["/business", L("Coral for Business", "Karang untuk Bisnis"), "CSR · ESG"], ["/idol", "IDOL × REEF", L("Fandom campaigns", "Kampanye fandom")], ["/about#community", L("Coastal Community", "Komunitas Pesisir"), L("Livelihoods", "Mata pencaharian")]].map(([to, t, s]) => (
          <Link key={to} to={to} data-testid={`nav-program-${to.replace(/\W/g, "")}`} className="block rounded-xl px-4 py-3 hover:bg-white/5">
            <span className="block text-sm text-ivory">{t}</span>
            <span className="text-xs text-slate-400">{s}</span>
          </Link>
        ))}
      </div>
    </div>
  </div>
);

export default function Nav() {
  const { L } = useLang();
  const links = useNavLinks();
  const loc = useLocation();
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const on = () => setSolid(window.scrollY > 40);
    on();
    window.addEventListener("scroll", on, { passive: true });
    return () => window.removeEventListener("scroll", on);
  }, []);
  useEffect(() => setOpen(false), [loc.pathname, loc.hash]);

  return (
    <>
      <header data-testid="site-nav"
        className={`fixed inset-x-0 top-0 z-50 transition-[background-color,border-color,padding] duration-500 ${solid || open ? "bg-abyss/90 backdrop-blur-xl border-b border-white/10 py-3" : "bg-transparent border-b border-transparent py-5"}`}>
        <div className="container-x flex items-center justify-between text-ivory">
          <Link to="/" data-testid="nav-logo"><Logo /></Link>
          <nav className="hidden items-center gap-7 xl:flex">
            {links.slice(0, 4).map((l) => (
              <NavLink key={l.id} to={l.to} end data-testid={`nav-${l.id}`} className="text-[13px] text-ivory/80 transition-colors hover:text-ivory">{l.label}</NavLink>
            ))}
            <Programs L={L} />
            {links.slice(4).map((l) => (
              <NavLink key={l.id} to={l.to} data-testid={`nav-${l.id}`} className={({ isActive }) => `text-[13px] transition-colors hover:text-ivory ${isActive ? "text-coral" : "text-ivory/80"}`}>{l.label}</NavLink>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <div className="hidden sm:block"><LangSwitch /></div>
            <Link to="/my-coral" data-testid="nav-my-coral" className="hidden text-[13px] text-ivory/80 hover:text-ivory lg:block">{L("My Coral", "Karangku")}</Link>
            <Link to="/adopt" data-testid="nav-adopt-cta" className="hidden rounded-full border border-ivory/40 px-5 py-2 text-[13px] font-medium transition-colors hover:bg-ivory hover:text-abyss sm:inline-flex">{L("Adopt a Coral", "Adopsi Karang")}</Link>
            <button className="xl:hidden" onClick={() => setOpen((o) => !o)} data-testid="nav-menu-toggle" aria-label="menu">
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
        {open && (
          <div className="container-x mt-4 flex flex-col gap-1 pb-6 text-ivory xl:hidden" data-testid="mobile-menu">
            {links.map((l) => <Link key={l.id} to={l.to} className="border-b border-white/5 py-3 font-serif text-2xl" data-testid={`mnav-${l.id}`}>{l.label}</Link>)}
            <Link to="/business" className="border-b border-white/5 py-3 font-serif text-2xl" data-testid="mnav-business">{L("Coral for Business", "Karang untuk Bisnis")}</Link>
            <Link to="/idol" className="border-b border-white/5 py-3 font-serif text-2xl" data-testid="mnav-idol">IDOL × REEF</Link>
            <Link to="/my-coral" className="border-b border-white/5 py-3 font-serif text-2xl" data-testid="mnav-my-coral">{L("My Coral", "Karangku")}</Link>
            <div className="mt-4 flex items-center justify-between"><LangSwitch /><Link to="/adopt" className="btn-coral">{L("Adopt a Coral", "Adopsi Karang")}</Link></div>
          </div>
        )}
      </header>
      <BottomBar L={L} />
    </>
  );
}

const BottomBar = ({ L }) => (
  <nav className="fixed inset-x-3 bottom-3 z-40 grid grid-cols-5 rounded-2xl border border-white/10 bg-abyss/90 py-2 text-ivory backdrop-blur-xl md:hidden" data-testid="mobile-bottom-nav">
    {[["/", Home, L("Home", "Beranda")], ["/adopt", Sprout, L("Adopt", "Adopsi")], ["/my-coral", QrCode, L("My Coral", "Karangku")], ["/business", Building2, "CSR"], ["/visit", Compass, L("Visit", "Kunjungi")]].map(([to, Icon, label]) => (
      <Link key={to} to={to} data-testid={`bnav-${label}`} className="flex flex-col items-center gap-1 text-[10px] text-ivory/80">
        <Icon className="h-5 w-5" strokeWidth={1.5} />{label}
      </Link>
    ))}
  </nav>
);
