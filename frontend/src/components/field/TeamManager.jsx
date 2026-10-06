import { useEffect, useState } from "react";
import { toast } from "sonner";
import { Trash2, UserPlus } from "lucide-react";
import { api, errMsg } from "@/lib/api";
import { useLang } from "@/lib/i18n";

export const TeamManager = () => {
  const { L } = useLang();
  const [team, setTeam] = useState({ admins: [], members: [] });
  const [email, setEmail] = useState("");
  const load = () => api.get("/team").then((r) => setTeam(r.data));
  useEffect(() => { load(); }, []);
  const add = async (e) => {
    e.preventDefault();
    try {
      await api.post("/team", { email });
      setEmail("");
      toast.success(L("Team member added", "Anggota tim ditambahkan"));
      load();
    } catch (err) {
      toast.error(errMsg(err));
    }
  };
  const remove = async (m) => { await api.delete(`/team/${encodeURIComponent(m)}`); load(); };
  return (
    <div className="rounded-[1.75rem] border border-gold/30 bg-navy p-6" data-testid="team-manager">
      <p className="eyebrow text-gold">{L("Admin · Field team access", "Admin · Akses tim lapangan")}</p>
      <p className="mt-2 text-sm text-slate-400">{L("Only these Google accounts can sign in and publish updates.", "Hanya akun Google ini yang bisa masuk dan mempublikasikan update.")}</p>
      <form onSubmit={add} className="mt-5 flex gap-2">
        <input required type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="name@gmail.com" data-testid="team-email-input"
          className="flex-1 rounded-full border border-white/15 bg-white/5 px-4 py-2 text-sm text-ivory focus:outline-none" />
        <button className="btn-coral py-2" data-testid="team-add-btn"><UserPlus className="h-4 w-4" /></button>
      </form>
      <ul className="mt-5 space-y-2 text-sm">
        {team.admins.map((a) => <li key={a} className="flex justify-between text-slate-300">{a}<span className="text-xs text-gold">admin</span></li>)}
        {team.members.map((m) => (
          <li key={m.email} className="flex items-center justify-between text-slate-300" data-testid={`team-member-${m.email}`}>
            {m.email}
            <button onClick={() => remove(m.email)} data-testid={`team-remove-${m.email}`}><Trash2 className="h-4 w-4 text-coral" /></button>
          </li>
        ))}
      </ul>
    </div>
  );
};
