import { useState } from "react";
import { ArrowUpRight } from "lucide-react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { SectionHead, Reveal } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

export default function Stories() {
  const { L } = useLang();
  const [open, setOpen] = useState(null);
  const stories = [
    ["/img/fragment.jpg", L("A Coral's First 100 Days", "100 Hari Pertama Sebuah Karang"), L("From a 5 cm fragment to its first new branch tips — what happens in the nursery.", "Dari fragmen 5 cm hingga ujung cabang pertamanya — apa yang terjadi di pembibitan."), "6 min"],
    ["/img/nursery.jpg", L("Inside a Coral Nursery", "Di Dalam Pembibitan Karang"), L("Rope frames, tables and daily care: how nurseries give corals a head start.", "Rangka tali, meja, dan perawatan harian: cara pembibitan memberi karang awal yang baik."), "5 min"],
    ["/img/reef_farmers.jpg", L("Meet the Reef Farmers", "Kenali Petani Terumbu"), L("The coastal teams who grow, plant and monitor every adopted coral.", "Tim pesisir yang menumbuhkan, menanam, dan memantau setiap karang adopsi."), "7 min"],
    ["/img/acropora.jpg", L("From Adoption to Restoration", "Dari Adopsi ke Restorasi"), L("Follow one adoption from checkout to outplanting on the reef.", "Ikuti satu adopsi dari pembayaran hingga penanaman di terumbu."), "4 min"],
    ["/img/polyps.jpg", L("Understanding Coral Growth", "Memahami Pertumbuhan Karang"), L("Polyps, calcification and why some species grow 10× faster.", "Polip, kalsifikasi, dan mengapa beberapa spesies tumbuh 10× lebih cepat."), "8 min"],
    ["/img/reef3.jpg", L("How Coral Restoration Works", "Bagaimana Restorasi Karang Bekerja"), L("The science of fragmenting, nursing and outplanting coral at scale.", "Sains fragmentasi, pembibitan, dan penanaman karang dalam skala besar."), "6 min"],
  ];
  return (
    <section className="bg-navy py-24 text-ivory sm:py-32" data-testid="stories">
      <div className="container-x">
        <SectionHead dark eyebrow={L("Stories", "Cerita")} title={L("Stories beneath the surface.", "Cerita di bawah permukaan.")} />
        <div className="mt-16 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {stories.map(([img, t, d, m], i) => (
            <Reveal key={t} delay={(i % 3) * 0.08} className={i === 0 ? "lg:row-span-2" : ""}>
              <button onClick={() => setOpen(i)} data-testid={`story-${i}`} className="group relative block h-full min-h-[300px] w-full overflow-hidden rounded-[1.5rem] text-left">
                <img src={img} alt={t} loading="lazy" className="img-zoom absolute inset-0 h-full w-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-abyss via-abyss/40 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-7">
                  <p className="font-mono text-[11px] text-seafoam">{m} · {L("Story", "Cerita")} 0{i + 1}</p>
                  <p className={`mt-2 font-serif leading-tight ${i === 0 ? "text-4xl" : "text-2xl"}`}>{t}</p>
                  <p className="mt-2 max-w-sm text-sm text-slate-300 opacity-90">{d}</p>
                </div>
                <ArrowUpRight className="absolute right-6 top-6 h-5 w-5 opacity-0 transition-opacity group-hover:opacity-100" />
              </button>
            </Reveal>
          ))}
        </div>
      </div>
      <Dialog open={open !== null} onOpenChange={() => setOpen(null)}>
        <DialogContent className="max-w-2xl overflow-hidden border-white/10 bg-navy p-0 text-ivory" data-testid="story-dialog">
          {open !== null && (
            <>
              <img src={stories[open][0]} alt="" className="h-64 w-full object-cover" />
              <div className="p-8">
                <DialogTitle className="font-serif text-4xl font-light">{stories[open][1]}</DialogTitle>
                <DialogDescription className="mt-4 text-base leading-relaxed text-slate-300">{stories[open][2]}</DialogDescription>
                <p className="mt-4 text-sm leading-relaxed text-slate-400">{L("Full story coming soon. Adopt a coral to receive field notes from our restoration teams directly in your My Coral profile.", "Cerita lengkap segera hadir. Adopsi karang untuk menerima catatan lapangan dari tim restorasi kami langsung di profil Karangku.")}</p>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </section>
  );
}
