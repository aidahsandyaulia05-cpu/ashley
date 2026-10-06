import { useEffect, useMemo, useState } from "react";
import { toast } from "sonner";
import { Upload, X } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { useLang, HEALTH_LABEL } from "@/lib/i18n";

const inputCls = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-ivory placeholder:text-slate-500 focus:border-seafoam/60 focus:outline-none";
const MAX = { image: 10, video: 50 };
const today = () => new Date().toISOString().slice(0, 10);

const Previews = ({ files, remove }) => {
  const urls = useMemo(() => files.map((f) => URL.createObjectURL(f)), [files]);
  useEffect(() => () => urls.forEach((u) => URL.revokeObjectURL(u)), [urls]);
  return (
    <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
      {files.map((f, i) => (
        <div key={urls[i]} className="relative aspect-square overflow-hidden rounded-xl bg-abyss">
          {f.type.startsWith("video") ? <video src={urls[i]} muted className="h-full w-full object-cover" /> : <img src={urls[i]} alt="" className="h-full w-full object-cover" />}
          <button type="button" onClick={() => remove(i)} className="absolute right-1 top-1 rounded-full bg-abyss/80 p-1" data-testid={`remove-file-${i}`}><X className="h-3 w-3" /></button>
        </div>
      ))}
    </div>
  );
};

export const UpdateForm = ({ onSaved }) => {
  const { L } = useLang();
  const [corals, setCorals] = useState([]);
  const [files, setFiles] = useState([]);
  const [busy, setBusy] = useState(false);
  const blank = { coral_id: "", health: "Healthy", survival: "Active", growth_pct: "", water_temp: "", date: today(), note: "" };
  const [f, setF] = useState(blank);
  useEffect(() => { api.get("/corals").then((r) => setCorals([...r.data].sort((a, b) => (a.adoption_status === "adopted" ? -1 : 1) - (b.adoption_status === "adopted" ? -1 : 1)))); }, []);
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });

  const addFiles = (e) => {
    const ok = [...e.target.files].filter((x) => {
      const kind = x.type.startsWith("video") ? "video" : "image";
      if (x.size > MAX[kind] * 1024 * 1024) { toast.error(`${x.name}: max ${MAX[kind]} MB`); return false; }
      return true;
    });
    setFiles((prev) => [...prev, ...ok].slice(0, 8));
    e.target.value = "";
  };

  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    const fd = new FormData();
    Object.entries(f).forEach(([k, v]) => v !== "" && fd.append(k, v));
    files.forEach((x) => fd.append("files", x));
    try {
      await api.post("/monitoring", fd);
      toast.success(L("Update published to the coral's QR page", "Update dipublikasikan ke halaman QR karang"));
      setF({ ...blank, coral_id: f.coral_id });
      setFiles([]);
      onSaved();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };

  return (
    <form onSubmit={submit} className="space-y-4 rounded-[1.75rem] border border-white/10 bg-navy p-6 sm:p-8" data-testid="monitoring-form">
      <p className="font-serif text-3xl">{L("New monitoring update", "Update pemantauan baru")}</p>
      <select required value={f.coral_id} onChange={on("coral_id")} className={inputCls} data-testid="mon-coral">
        <option value="">{L("Select coral…", "Pilih karang…")}</option>
        {corals.map((c) => <option key={c.coral_id} value={c.coral_id}>{c.coral_id} · {c.scientific_name} · {c.adoption_status}</option>)}
      </select>
      <div className="grid gap-4 sm:grid-cols-2">
        <select value={f.health} onChange={on("health")} className={inputCls} data-testid="mon-health">
          {["Healthy", "Monitoring", "Bleaching", "Recovering"].map((h) => <option key={h} value={h}>{L(...HEALTH_LABEL[h])}</option>)}
        </select>
        <select value={f.survival} onChange={on("survival")} className={inputCls} data-testid="mon-survival">
          {["Active", "At Risk", "Lost"].map((h) => <option key={h} value={h}>{L(...HEALTH_LABEL[h])}</option>)}
        </select>
        <input required type="number" step="0.1" value={f.growth_pct} onChange={on("growth_pct")} placeholder={L("Growth since planting (%)", "Pertumbuhan sejak tanam (%)")} className={inputCls} data-testid="mon-growth" />
        <input type="number" step="0.1" value={f.water_temp} onChange={on("water_temp")} placeholder={L("Water temp (°C)", "Suhu air (°C)")} className={inputCls} data-testid="mon-temp" />
        <input required type="date" value={f.date} max={today()} onChange={on("date")} className={inputCls} data-testid="mon-date" />
      </div>
      <textarea rows={3} value={f.note} onChange={on("note")} placeholder={L("Field note for the adopter", "Catatan lapangan untuk pengadopsi")} className={inputCls} data-testid="mon-note" />
      <label className="flex cursor-pointer flex-col items-center gap-2 rounded-2xl border border-dashed border-white/20 p-6 text-center text-sm text-slate-400 hover:border-seafoam/50">
        <Upload className="h-6 w-6 text-seafoam" />
        {L("Add photos or short videos (max 8 · images 10 MB · videos 50 MB)", "Tambah foto atau video pendek (maks 8 · foto 10 MB · video 50 MB)")}
        <input type="file" multiple accept="image/jpeg,image/png,image/webp,video/mp4,video/quicktime,video/webm" onChange={addFiles} className="hidden" data-testid="mon-files" />
      </label>
      {files.length > 0 && <Previews files={files} remove={(i) => setFiles(files.filter((_, j) => j !== i))} />}
      <button disabled={busy} className="btn-coral w-full justify-center disabled:opacity-50" data-testid="mon-submit">{busy ? L("Uploading…", "Mengunggah…") : L("Publish update", "Publikasikan update")}</button>
    </form>
  );
};
