import { useCallback, useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { toast } from "sonner";
import { LogOut, ShieldAlert, Trash2, ExternalLink } from "lucide-react";
import { api, fmtDate } from "@/lib/api";
import { UpdateForm } from "@/components/field/UpdateForm";
import { TeamManager } from "@/components/field/TeamManager";
import { Media } from "@/components/coral/Media";
import { useLang } from "@/lib/i18n";

const login = () => {
  // REMINDER: DO NOT HARDCODE THE URL, OR ADD ANY FALLBACKS OR REDIRECT URLS, THIS BREAKS THE AUTH
  const redirectUrl = window.location.origin + "/field";
  window.location.href = `https://auth.emergentagent.com/?redirect=${encodeURIComponent(redirectUrl)}`;
};

const Gate = ({ error, L }) => (
  <div className="min-h-screen bg-abyss px-6 pb-32 pt-44 text-ivory" data-testid="field-login">
    <div className="mx-auto max-w-lg text-center">
      <p className="eyebrow text-seafoam">{L("Field Team", "Tim Lapangan")}</p>
      <h1 className="display mt-4 text-5xl">{L("Reef monitoring console.", "Konsol pemantauan terumbu.")}</h1>
      <p className="mt-5 text-slate-400">{L("For approved REEFORA field staff only. Sign in with your Google account.", "Khusus staf lapangan REEFORA yang disetujui. Masuk dengan akun Google Anda.")}</p>
      {error && <p className="mt-6 flex items-center justify-center gap-2 rounded-2xl border border-coral/40 bg-coral/10 p-4 text-sm text-coral" data-testid="field-auth-error"><ShieldAlert className="h-4 w-4" />{error}</p>}
      <button onClick={login} className="btn-coral mt-10" data-testid="google-login-btn">{L("Sign in with Google", "Masuk dengan Google")}</button>
    </div>
  </div>
);

export default function Field() {
  const { L, lang } = useLang();
  const { state } = useLocation();
  const [user, setUser] = useState(state?.user || null);
  const [checked, setChecked] = useState(!!state?.user);
  const [error, setError] = useState(state?.authError || "");
  const [updates, setUpdates] = useState([]);

  useEffect(() => {
    if (state?.user || state?.authError) { setChecked(true); return; }
    api.get("/auth/me").then((r) => setUser(r.data)).catch((e) => e.response?.status === 403 && setError(e.response.data.detail)).finally(() => setChecked(true));
  }, [state]);
  const load = useCallback(() => api.get("/monitoring").then((r) => setUpdates(r.data)), []);
  useEffect(() => { if (user) load(); }, [user, load]);

  if (!checked) return <div className="min-h-screen bg-abyss" />;
  if (!user) return <Gate error={error} L={L} />;

  const logout = async () => { await api.post("/auth/logout"); setUser(null); };
  const del = async (id) => { await api.delete(`/monitoring/${id}`); toast.success(L("Update removed", "Update dihapus")); load(); };

  return (
    <div className="min-h-screen bg-abyss pb-32 pt-32 text-ivory" data-testid="field-dashboard">
      <div className="container-x">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="eyebrow text-seafoam">{L("Field Team", "Tim Lapangan")} · {user.role}</p>
            <h1 className="display mt-3 text-5xl">{L("Hello,", "Halo,")} {user.name?.split(" ")[0] || user.email}</h1>
          </div>
          <button onClick={logout} className="btn-ghost" data-testid="field-logout-btn"><LogOut className="h-4 w-4" />{L("Sign out", "Keluar")}</button>
        </div>
        <div className="mt-12 grid gap-8 lg:grid-cols-12">
          <div className="space-y-8 lg:col-span-7">
            <UpdateForm onSaved={load} />
            {user.role === "admin" && <TeamManager />}
          </div>
          <div className="lg:col-span-5">
            <p className="font-serif text-3xl">{L("Published updates", "Update terpublikasi")}</p>
            <div className="mt-6 space-y-4" data-testid="field-updates-list">
              {updates.length === 0 && <p className="text-sm text-slate-500">{L("No updates yet.", "Belum ada update.")}</p>}
              {updates.map((u) => (
                <div key={u.id} className="rounded-2xl border border-white/10 bg-navy p-5" data-testid={`field-item-${u.id}`}>
                  <div className="flex items-center justify-between text-xs">
                    <Link to={`/coral/${u.coral_id}`} className="flex items-center gap-1 font-mono text-seafoam">{u.coral_id}<ExternalLink className="h-3 w-3" /></Link>
                    <span className="text-slate-500">{fmtDate(u.date, lang)}</span>
                  </div>
                  <p className="mt-2 text-sm">{u.health} · +{u.growth_pct}% · {u.survival}</p>
                  {u.note && <p className="mt-1 line-clamp-2 text-xs text-slate-400">{u.note}</p>}
                  {u.media.length > 0 && <div className="mt-3 grid grid-cols-4 gap-2">{u.media.map((m) => <Media key={m.url} item={m} controls={false} className="aspect-square w-full rounded-lg object-cover" />)}</div>}
                  {(user.role === "admin" || u.created_by === user.email) && (
                    <button onClick={() => del(u.id)} className="mt-3 flex items-center gap-1 text-xs text-coral" data-testid={`field-delete-${u.id}`}><Trash2 className="h-3.5 w-3.5" />{L("Remove", "Hapus")}</button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
