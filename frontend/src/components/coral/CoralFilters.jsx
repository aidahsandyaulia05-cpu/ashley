import { Search } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLang, TYPE_LABEL } from "@/lib/i18n";

const ALL = "all";

const F = ({ testid, value, onChange, placeholder, options }) => (
  <Select value={value || ALL} onValueChange={(v) => onChange(v === ALL ? "" : v)}>
    <SelectTrigger data-testid={testid} className="h-11 rounded-full border-white/15 bg-white/5 text-ivory">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent className="border-white/10 bg-navy text-ivory">
      <SelectItem value={ALL}>{placeholder}</SelectItem>
      {options.map(([v, l]) => <SelectItem key={v} value={v} data-testid={`${testid}-opt-${v.replace(/\W/g, "")}`}>{l}</SelectItem>)}
    </SelectContent>
  </Select>
);

export const CoralFilters = ({ meta, filters, setFilters }) => {
  const { L } = useLang();
  const set = (k) => (v) => setFilters((f) => ({ ...f, [k]: v }));
  const sites = meta?.sites || [];
  return (
    <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5" data-testid="coral-filters">
      <label className="relative lg:col-span-1">
        <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input value={filters.q} onChange={(e) => set("q")(e.target.value)} data-testid="filter-search"
          placeholder={L("Search ID, species…", "Cari ID, spesies…")}
          className="h-11 w-full rounded-full border border-white/15 bg-white/5 pl-10 pr-4 text-sm text-ivory placeholder:text-slate-500 focus:border-seafoam/60 focus:outline-none" />
      </label>
      <F testid="filter-species" value={filters.species} onChange={set("species")} placeholder={L("All species", "Semua spesies")}
        options={(meta?.species || []).map((s) => [s.scientific, s.scientific])} />
      <F testid="filter-location" value={filters.location} onChange={set("location")} placeholder={L("All locations", "Semua lokasi")}
        options={sites.map((s) => [s.location, s.location])} />
      <F testid="filter-type" value={filters.adoption_type} onChange={set("adoption_type")} placeholder={L("All adoption types", "Semua tipe adopsi")}
        options={Object.entries(TYPE_LABEL).map(([k, v]) => [k, L(...v)])} />
      <F testid="filter-site" value={filters.site} onChange={set("site")} placeholder={L("All restoration sites", "Semua situs restorasi")}
        options={sites.map((s) => [s.code, s.name])} />
    </div>
  );
};
