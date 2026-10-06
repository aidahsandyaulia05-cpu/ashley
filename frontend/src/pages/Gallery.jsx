import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Instagram, Image as ImageIcon, Video } from "lucide-react";
import { api, fmtDate, INSTAGRAM_URL, INSTAGRAM_HANDLE } from "@/lib/api";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/site/Bits";
import { Media } from "@/components/coral/Media";
import { useLang } from "@/lib/i18n";

const FALLBACK = ["/img/acropora.jpg", "/img/nursery.jpg", "/img/fragment.jpg", "/img/polyps.jpg", "/img/hero_coral.jpg", "/img/blue_acropora.jpg"];

export default function Gallery() {
  const { L, lang } = useLang();
  const [kind, setKind] = useState("");
  const [items, setItems] = useState(null);
  useEffect(() => { api.get("/gallery", { params: kind ? { kind } : {} }).then((r) => setItems(r.data)); }, [kind]);
  const tabs = [["", L("All", "Semua")], ["image", L("Photos", "Foto")], ["video", L("Videos", "Video")]];
  return (
    <div className="bg-abyss text-ivory" data-testid="gallery-page">
      <PageHero testid="gallery-hero" image="/img/blue_acropora.jpg" eyebrow={L("Reef Gallery", "Galeri Terumbu")} title={L("Live from the reef.", "Langsung dari terumbu.")}
        sub={L("Photos and short videos captured by our field teams during coral monitoring dives.", "Foto dan video pendek yang direkam tim lapangan saat penyelaman pemantauan karang.")}>
        <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="gallery-instagram-btn"><Instagram className="h-4 w-4" />{INSTAGRAM_HANDLE}</a>
      </PageHero>
      <section className="container-x pb-28">
        <div className="flex gap-2" data-testid="gallery-tabs">
          {tabs.map(([k, l]) => (
            <button key={k || "all"} onClick={() => setKind(k)} data-testid={`gallery-tab-${k || "all"}`} className={`flex items-center gap-2 rounded-full border px-4 py-2 text-xs ${kind === k ? "border-coral bg-coral/10" : "border-white/15 text-slate-300"}`}>
              {k === "image" && <ImageIcon className="h-3.5 w-3.5" />}{k === "video" && <Video className="h-3.5 w-3.5" />}{l}
            </button>
          ))}
        </div>
        {items && items.length > 0 && (
          <div className="mt-10 columns-1 gap-5 sm:columns-2 lg:columns-3">
            {items.map((m, i) => (
              <Reveal key={m.url} delay={(i % 3) * 0.06} className="mb-5 break-inside-avoid">
                <figure className="overflow-hidden rounded-[1.5rem] border border-white/10 bg-navy" data-testid={`gallery-item-${i}`}>
                  <Media item={m} className="w-full" />
                  <figcaption className="flex items-center justify-between p-4 text-xs">
                    <Link to={`/coral/${m.coral_id}`} className="font-mono text-seafoam hover:text-ivory">CORAL #{m.coral_id}</Link>
                    <span className="text-slate-500">{fmtDate(m.date, lang)}</span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </div>
        )}
        {items && items.length === 0 && (
          <div className="mt-10" data-testid="gallery-empty">
            <p className="font-serif text-2xl text-slate-400">{L("New field media will appear here after the next monitoring dive.", "Media lapangan baru akan muncul di sini setelah penyelaman pemantauan berikutnya.")}</p>
            <div className="mt-8 grid grid-cols-2 gap-4 opacity-60 sm:grid-cols-3">{FALLBACK.map((s) => <img key={s} src={s} alt="" className="aspect-square w-full rounded-2xl object-cover" />)}</div>
          </div>
        )}
      </section>
    </div>
  );
}
