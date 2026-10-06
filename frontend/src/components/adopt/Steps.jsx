import { Check, User, Building2, Mic2, Palmtree } from "lucide-react";
import { useLang, TYPE_LABEL } from "@/lib/i18n";
import { idr } from "@/lib/api";

export const PACKAGES = {
  seed: { name: "Seed", price: 150000, en: ["Digital certificate", "Coral QR code", "My Coral profile", "6 months of updates"], id: ["Sertifikat digital", "Kode QR karang", "Profil Karangku", "Update 6 bulan"] },
  guardian: { name: "Guardian", price: 350000, en: ["Everything in Seed", "Name your coral", "Quarterly monitoring photos", "24-month growth tracking"], id: ["Semua di Seed", "Beri nama karangmu", "Foto pemantauan per kuartal", "Pelacakan pertumbuhan 24 bulan"] },
  legacy: { name: "Legacy", price: 750000, en: ["Everything in Guardian", "Printed certificate by post", "On-site visit invitation", "Annual impact report"], id: ["Semua di Guardian", "Sertifikat cetak dikirim", "Undangan kunjungan lokasi", "Laporan dampak tahunan"] },
};

const inputCls = "w-full rounded-2xl border border-white/15 bg-white/5 px-5 py-4 text-ivory placeholder:text-slate-500 focus:border-seafoam/60 focus:outline-none";
const H = ({ children, sub }) => (<><h2 className="font-serif text-4xl font-light">{children}</h2>{sub && <p className="mt-2 text-sm text-slate-400">{sub}</p>}</>);
const Opt = ({ active, onClick, children, testid, className = "" }) => (
  <button type="button" onClick={onClick} data-testid={testid}
    className={`relative rounded-2xl border p-5 text-left transition-[border-color,background-color] duration-300 ${active ? "border-coral bg-coral/[0.08]" : "border-white/10 bg-white/[0.02] hover:border-white/30"} ${className}`}>
    {active && <Check className="absolute right-4 top-4 h-4 w-4 text-coral" />}{children}
  </button>
);

export const StepType = ({ form, set, coral }) => {
  const { L } = useLang();
  const icons = { individual: User, corporate: Building2, idol: Mic2, tourism: Palmtree };
  return (
    <div data-testid="step-type">
      <H sub={L("Choose how you'd like to adopt this coral.", "Pilih cara mengadopsi karang ini.")}>{L("Adoption type", "Tipe adopsi")}</H>
      <div className="mt-8 grid gap-3 sm:grid-cols-2">
        {Object.keys(TYPE_LABEL).map((k) => {
          const Icon = icons[k];
          const ok = coral.adoption_types.includes(k);
          return (
            <Opt key={k} active={form.adoption_type === k} onClick={() => ok && set({ adoption_type: k })} testid={`type-opt-${k}`} className={ok ? "" : "cursor-not-allowed opacity-35"}>
              <Icon className="h-6 w-6 text-seafoam" strokeWidth={1.4} />
              <p className="mt-4 font-serif text-2xl">{L(...TYPE_LABEL[k])}</p>
              {!ok && <p className="mt-1 text-xs text-slate-500">{L("Not offered for this coral", "Tidak tersedia untuk karang ini")}</p>}
            </Opt>
          );
        })}
      </div>
      {form.adoption_type === "idol" && (
        <input value={form.campaign} onChange={(e) => set({ campaign: e.target.value })} className={`${inputCls} mt-5`} placeholder={L("Campaign or artist name (optional)", "Nama kampanye atau artis (opsional)")} data-testid="input-campaign" />
      )}
    </div>
  );
};

export const StepPackage = ({ form, set, coral }) => {
  const { L, lang } = useLang();
  return (
    <div data-testid="step-package">
      <H sub={L("All packages include a Coral ID, certificate and QR code.", "Semua paket termasuk Coral ID, sertifikat, dan kode QR.")}>{L("Adoption package", "Paket adopsi")}</H>
      <div className="mt-8 grid gap-3 md:grid-cols-3">
        {Object.entries(PACKAGES).map(([k, p]) => (
          <Opt key={k} active={form.package === k} onClick={() => set({ package: k })} testid={`package-opt-${k}`}>
            <p className="eyebrow text-seafoam">{p.name}</p>
            <p className="mt-3 font-serif text-3xl">{idr(p.price)}</p>
            <ul className="mt-4 space-y-1.5 text-xs text-slate-300">{p[lang].map((f) => <li key={f}>— {f}</li>)}</ul>
          </Opt>
        ))}
      </div>
      <div className="mt-10 rounded-2xl border border-white/10 p-6">
        <p className="font-serif text-2xl">{L("Add extra reef support", "Tambah dukungan terumbu")} <span className="text-sm text-slate-500">({L("optional", "opsional")})</span></p>
        <div className="mt-4 flex flex-wrap gap-2">
          {[0, 50000, 100000, 250000].map((a) => (
            <button key={a} onClick={() => set({ extra_donation: a })} data-testid={`donation-${a}`} className={`chip border px-4 py-2 text-sm ${Number(form.extra_donation) === a ? "border-coral bg-coral/10" : "border-white/15"}`}>{a ? idr(a) : L("None", "Tidak")}</button>
          ))}
          <input type="number" min={0} step={10000} value={form.extra_donation} onChange={(e) => set({ extra_donation: Math.max(0, Number(e.target.value)) })} className="w-36 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm" data-testid="donation-custom" />
        </div>
        <div className="mt-5 flex gap-2">
          {[["one-time", L("One-time", "Sekali")], ["monthly", L("Monthly", "Bulanan")]].map(([v, l]) => (
            <button key={v} onClick={() => set({ frequency: v })} data-testid={`freq-${v}`} className={`chip border px-4 py-2 text-sm ${form.frequency === v ? "border-seafoam bg-seafoam/10 text-seafoam" : "border-white/15"}`}>{l}</button>
          ))}
        </div>
        <p className="mt-5 text-sm text-slate-400">{L("Direct support to", "Salurkan ke")}: <span className="text-ivory">{coral.site_name} · {coral.location}</span></p>
      </div>
    </div>
  );
};

export const StepPersonal = ({ form, set }) => {
  const { L } = useLang();
  return (
    <div data-testid="step-personal">
      <H sub={L("Optional — this name will appear on the certificate and coral profile.", "Opsional — nama ini akan tampil di sertifikat dan profil karang.")}>{L("Give your coral a name", "Beri nama karangmu")}</H>
      <input maxLength={40} value={form.coral_name} onChange={(e) => set({ coral_name: e.target.value })} className={`${inputCls} mt-8 font-serif text-3xl`} placeholder="Lumi" data-testid="input-coral-name" />
      <textarea maxLength={280} rows={4} value={form.message} onChange={(e) => set({ message: e.target.value })} className={`${inputCls} mt-4`} placeholder={L("A personal message or dedication (optional)", "Pesan pribadi atau dedikasi (opsional)")} data-testid="input-message" />
    </div>
  );
};

export const StepDetails = ({ form, set }) => {
  const { L } = useLang();
  return (
    <div data-testid="step-details">
      <H sub={L("The adopter name is printed on the certificate. Your QR code will open your coral by this name.", "Nama pengadopsi dicetak di sertifikat. Kode QR akan membuka karangmu dengan nama ini.")}>{L("Adopter information", "Informasi pengadopsi")}</H>
      <div className="mt-8 space-y-3">
        <input required value={form.adopter_name} onChange={(e) => set({ adopter_name: e.target.value })} className={inputCls} placeholder={L("Adopter name (on certificate) *", "Nama pengadopsi (di sertifikat) *")} data-testid="input-adopter-name" />
        <input required type="email" value={form.email} onChange={(e) => set({ email: e.target.value })} className={inputCls} placeholder="Email *" data-testid="input-email" />
        <input value={form.phone} onChange={(e) => set({ phone: e.target.value })} className={inputCls} placeholder={L("WhatsApp / phone (optional)", "WhatsApp / telepon (opsional)")} data-testid="input-phone" />
      </div>
    </div>
  );
};
