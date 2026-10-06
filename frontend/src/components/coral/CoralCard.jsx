import { Link } from "react-router-dom";
import { MapPin, ArrowUpRight } from "lucide-react";
import { useLang, STATUS_LABEL } from "@/lib/i18n";

const statusTone = {
  available: "bg-seafoam/15 text-seafoam",
  adopted: "bg-coral/15 text-coral",
  reserved: "bg-gold/15 text-gold",
};

export const CoralCard = ({ coral }) => {
  const { L } = useLang();
  const st = STATUS_LABEL[coral.adoption_status];
  const to = coral.adoption_status === "available" ? `/adopt/${coral.coral_id}` : `/coral/${coral.coral_id}`;
  return (
    <Link to={to} data-testid={`coral-card-${coral.coral_id}`}
      className="group relative flex flex-col overflow-hidden rounded-[1.5rem] border border-white/10 bg-navy transition-[border-color,transform] duration-500 hover:-translate-y-1 hover:border-coral/40">
      <div className="relative aspect-[4/3.4] overflow-hidden">
        <img src={coral.image} alt={coral.scientific_name} loading="lazy" className="img-zoom h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-navy via-navy/10 to-transparent" />
        <span className="absolute left-4 top-4 rounded-full bg-abyss/70 px-3 py-1 font-mono text-[11px] text-ivory backdrop-blur" data-testid={`coral-id-${coral.coral_id}`}>CORAL #{coral.coral_id}</span>
        <ArrowUpRight className="absolute right-4 top-4 h-5 w-5 text-ivory opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
        <div className="absolute inset-x-4 bottom-4 translate-y-3 opacity-0 transition-[opacity,transform] duration-500 group-hover:translate-y-0 group-hover:opacity-100">
          <p className="text-xs text-slate-300">{L("Depth", "Kedalaman")} {coral.depth} · {L("Growth", "Pertumbuhan")} {coral.growth_rate}</p>
        </div>
      </div>
      <div className="flex flex-1 flex-col p-5 text-ivory">
        <p className="font-serif text-2xl italic leading-tight">{coral.scientific_name}</p>
        <p className="mt-1 text-xs text-slate-400">{coral.species}</p>
        <p className="mt-4 flex items-center gap-1.5 text-xs text-slate-300"><MapPin className="h-3.5 w-3.5 text-coral" />{coral.site_name} · {coral.location}</p>
        <div className="mt-4">
          <div className="flex justify-between text-[11px] text-slate-400"><span>{L("Restoration", "Restorasi")} · {L(...STATUS_LABEL[coral.restoration_status])}</span><span>{coral.restoration_progress}%</span></div>
          <div className="mt-1.5 h-[3px] rounded-full bg-white/10"><div className="h-full rounded-full bg-gradient-to-r from-turq to-seafoam" style={{ width: `${coral.restoration_progress}%` }} /></div>
        </div>
        <span className={`chip mt-5 self-start ${statusTone[coral.adoption_status]}`} data-testid={`coral-status-${coral.coral_id}`}>{L(...st)}</span>
      </div>
    </Link>
  );
};
