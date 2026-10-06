import { Reveal } from "@/components/site/Bits";
import { Media } from "./Media";
import { fmtDate } from "@/lib/api";
import { useLang, HEALTH_LABEL } from "@/lib/i18n";

export const FieldUpdates = ({ updates }) => {
  const { L, lang } = useLang();
  if (!updates?.length) return null;
  return (
    <div className="mt-24" data-testid="field-updates">
      <p className="eyebrow text-seafoam">{L("Field updates", "Update lapangan")}</p>
      <h2 className="display mt-3 text-4xl sm:text-5xl">{L("Notes from the reef team.", "Catatan dari tim terumbu.")}</h2>
      <div className="mt-10 space-y-6">
        {updates.map((u, i) => (
          <Reveal key={u.id} delay={i * 0.05}>
            <article className="rounded-[1.75rem] border border-white/10 bg-navy p-6" data-testid={`field-update-${u.id}`}>
              <div className="flex flex-wrap items-center gap-3 text-xs">
                <span className="font-mono text-seafoam">{fmtDate(u.date, lang)}</span>
                <span className="chip bg-seafoam/15 text-seafoam">{L(...(HEALTH_LABEL[u.health] || [u.health, u.health]))}</span>
                <span className="chip bg-coral/15 text-coral">+{u.growth_pct}%</span>
                <span className="chip bg-white/5 text-slate-300">{L(...(HEALTH_LABEL[u.survival] || [u.survival, u.survival]))}</span>
                {u.water_temp && <span className="text-slate-400">{u.water_temp}°C</span>}
                <span className="ml-auto text-slate-500">{u.author}</span>
              </div>
              {u.note && <p className="mt-4 text-sm leading-relaxed text-slate-300">{u.note}</p>}
              {u.media.length > 0 && (
                <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {u.media.map((m) => <Media key={m.url} item={m} className="aspect-square w-full rounded-xl bg-abyss object-cover" />)}
                </div>
              )}
            </article>
          </Reveal>
        ))}
      </div>
    </div>
  );
};
