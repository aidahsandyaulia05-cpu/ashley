import { useEffect, useState } from "react";
import { ResponsiveContainer, LineChart, Line, AreaChart, Area, BarChart, Bar, ComposedChart, PieChart, Pie, Cell, XAxis, YAxis, Tooltip, CartesianGrid, Legend } from "recharts";
import { Sprout, HeartPulse, Droplets, Layers, Info } from "lucide-react";
import { api } from "@/lib/api";
import { PageHero } from "@/components/site/PageHero";
import { SectionHead } from "@/components/site/Bits";
import { EnquiryForm } from "@/components/site/Enquiry";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLang } from "@/lib/i18n";

const TT = { contentStyle: { background: "#061026", border: "1px solid #ffffff20", borderRadius: 12, color: "#fff" } };
const AX = { stroke: "#64748b", fontSize: 11 };
const PIE = ["#FF6B6B", "#5EEAD4", "#D4AF37", "#06B6D4", "#F97316"];

const Panel = ({ title, children }) => (
  <div className="h-[360px] rounded-2xl border border-white/10 bg-navy p-6">
    <p className="text-sm text-slate-400">{title}</p>
    <ResponsiveContainer width="100%" height="90%">{children}</ResponsiveContainer>
  </div>
);

export default function Science() {
  const { L } = useLang();
  const [d, setD] = useState(null);
  useEffect(() => { api.get("/science").then((r) => setD(r.data)); }, []);
  const kpis = [[Sprout, L("Coral Growth", "Pertumbuhan Karang"), "+16.8%"], [HeartPulse, L("Survival Rate", "Tingkat Bertahan"), "87.4%"], [Droplets, L("Water Quality", "Kualitas Air"), L("Good", "Baik")], [Layers, L("Species Monitored", "Spesies Dipantau"), "142"]];
  return (
    <div className="bg-abyss text-ivory" data-testid="science-page">
      <PageHero testid="science-hero" image="/img/polyps.jpg" eyebrow={L("Research & Science", "Riset & Sains")} title={L("Science Behind the Reef.", "Sains di Balik Terumbu.")}
        sub={L("Every coral is measured, photographed and logged. Our data guides which species we grow, where we plant and how we respond to bleaching.", "Setiap karang diukur, difoto, dan dicatat. Data kami menentukan spesies yang ditumbuhkan, lokasi penanaman, dan respons terhadap pemutihan.")}>
        <a href="#research" className="btn-coral" data-testid="science-research-cta">{L("Research with REEFORA", "Riset bersama REEFORA")}</a>
      </PageHero>
      <section className="container-x pb-24">
        <p className="mb-6 flex items-center gap-2 text-sm text-gold" data-testid="science-sample-badge"><Info className="h-4 w-4" />{L("Sample / demo data — shown until live monitoring data is connected.", "Data contoh / demo — ditampilkan hingga data pemantauan langsung terhubung.")}</p>
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          {kpis.map(([Icon, l, v]) => (
            <div key={l} className="rounded-2xl border border-white/10 bg-navy p-6"><Icon className="h-5 w-5 text-seafoam" strokeWidth={1.4} /><p className="mt-4 text-xs uppercase tracking-[0.2em] text-slate-400">{l}</p><p className="mt-1 font-serif text-4xl">{v}</p></div>
          ))}
        </div>
        {d && (
          <Tabs defaultValue="growth" className="mt-10">
            <TabsList className="flex h-auto flex-wrap justify-start gap-1 rounded-full bg-white/5 p-1" data-testid="science-tabs">
              {[["growth", L("Growth", "Pertumbuhan")], ["survival", L("Survival", "Bertahan")], ["bleaching", L("Bleaching", "Pemutihan")], ["water", L("Water quality", "Kualitas air")], ["species", L("Species", "Spesies")], ["recovery", L("Reef recovery", "Pemulihan terumbu")]].map(([v, l]) => (
                <TabsTrigger key={v} value={v} data-testid={`science-tab-${v}`} className="rounded-full px-4 py-2 text-xs text-slate-300 data-[state=active]:bg-ivory data-[state=active]:text-abyss">{l}</TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="growth"><Panel title={L("Average colony size (cm) by month", "Rata-rata ukuran koloni (cm) per bulan")}><LineChart data={d.growth}><CartesianGrid stroke="#ffffff10" vertical={false} /><XAxis dataKey="m" {...AX} /><YAxis {...AX} /><Tooltip {...TT} /><Legend /><Line dataKey="acropora" stroke="#FF6B6B" strokeWidth={2} dot={false} /><Line dataKey="pocillopora" stroke="#5EEAD4" strokeWidth={2} dot={false} /><Line dataKey="porites" stroke="#D4AF37" strokeWidth={2} dot={false} /></LineChart></Panel></TabsContent>
            <TabsContent value="survival"><Panel title={L("Survival rate (%) of outplanted fragments", "Tingkat bertahan (%) fragmen yang ditanam")}><AreaChart data={d.survival}><defs><linearGradient id="sv" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5EEAD4" stopOpacity={0.5} /><stop offset="100%" stopColor="#5EEAD4" stopOpacity={0} /></linearGradient></defs><CartesianGrid stroke="#ffffff10" vertical={false} /><XAxis dataKey="m" {...AX} /><YAxis domain={[80, 100]} {...AX} /><Tooltip {...TT} /><Area dataKey="rate" stroke="#5EEAD4" fill="url(#sv)" strokeWidth={2} /></AreaChart></Panel></TabsContent>
            <TabsContent value="bleaching"><Panel title={L("Sea surface temp (°C) vs bleached colonies (%)", "Suhu permukaan laut (°C) vs koloni memutih (%)")}><ComposedChart data={d.bleaching}><CartesianGrid stroke="#ffffff10" vertical={false} /><XAxis dataKey="week" {...AX} /><YAxis yAxisId="l" {...AX} /><YAxis yAxisId="r" orientation="right" domain={[27, 31]} {...AX} /><Tooltip {...TT} /><Legend /><Bar yAxisId="l" dataKey="bleached" fill="#F97316" radius={[6, 6, 0, 0]} /><Line yAxisId="r" dataKey="sst" stroke="#06B6D4" strokeWidth={2} dot={false} /></ComposedChart></Panel></TabsContent>
            <TabsContent value="water">
              <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{d.water.map((w) => <div key={w.param} className="rounded-2xl border border-white/10 bg-navy p-6"><p className="text-xs text-slate-400">{w.param}</p><p className="mt-2 font-serif text-5xl">{w.value}</p><p className="mt-2 text-xs text-seafoam">{L("Healthy range", "Rentang sehat")}: {w.ok}</p></div>)}</div>
            </TabsContent>
            <TabsContent value="species"><Panel title={L("Species composition across nurseries (%)", "Komposisi spesies di pembibitan (%)")}><PieChart><Pie data={d.species} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="85%" paddingAngle={2} stroke="none">{d.species.map((s, i) => <Cell key={s.name} fill={PIE[i]} />)}</Pie><Tooltip {...TT} /><Legend /></PieChart></Panel></TabsContent>
            <TabsContent value="recovery"><Panel title={L("Live coral cover (%) — before vs after restoration", "Tutupan karang hidup (%) — sebelum vs sesudah restorasi")}><BarChart data={d.recovery}><CartesianGrid stroke="#ffffff10" vertical={false} /><XAxis dataKey="site" {...AX} /><YAxis {...AX} /><Tooltip {...TT} /><Legend /><Bar dataKey="before" fill="#475569" radius={[6, 6, 0, 0]} /><Bar dataKey="after" fill="#FF6B6B" radius={[6, 6, 0, 0]} /></BarChart></Panel></TabsContent>
          </Tabs>
        )}
      </section>
      <section id="research" className="bg-navy py-24 sm:py-32">
        <div className="container-x grid gap-14 lg:grid-cols-2">
          <SectionHead dark eyebrow={L("Research with REEFORA", "Riset bersama REEFORA")} title={L("Open reefs. Open data.", "Terumbu terbuka. Data terbuka.")}
            sub={L("Universities, institutes and independent scientists can access our sites, nurseries and monitoring datasets.", "Universitas, lembaga, dan ilmuwan independen dapat mengakses lokasi, pembibitan, dan dataset pemantauan kami.")} />
          <EnquiryForm kind="research" program="Research collaboration" />
        </div>
      </section>
    </div>
  );
}
