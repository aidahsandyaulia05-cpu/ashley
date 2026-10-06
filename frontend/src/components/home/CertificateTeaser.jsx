import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Certificate } from "@/components/coral/Certificate";
import { SectionHead } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";

const SAMPLE = {
  adoption: { adopter_name: "Aidah", coral_id: "RF-02481", coral_name: "Lumi", adopted_at: "2026-10-12T00:00:00Z", certificate_no: "REEF-2026-000001" },
  coral: { scientific_name: "Acropora tenuis", site_name: "Restoration Site A", location: "Pulau Menjangan, Bali" },
};

export default function CertificateTeaser() {
  const { L } = useLang();
  return (
    <section className="overflow-hidden bg-ivory py-24 sm:py-32" data-testid="certificate-teaser">
      <div className="container-x grid items-center gap-14 lg:grid-cols-12">
        <div className="lg:col-span-4">
          <SectionHead eyebrow={L("Certificate & QR", "Sertifikat & QR")} title={L("A certificate worth sharing.", "Sertifikat yang layak dibagikan.")}
            sub={L("Every adoption is sealed with a personal certificate and a QR code. Scan it anytime to open your coral's living profile.", "Setiap adopsi disertai sertifikat pribadi dan kode QR. Pindai kapan saja untuk membuka profil hidup karangmu.")} />
          <div className="mt-10 flex flex-wrap gap-3">
            <Link to="/coral/RF-02481" className="btn-ink" data-testid="teaser-view-profile">{L("Scan demo coral", "Lihat contoh karang")} <ArrowRight className="h-4 w-4" /></Link>
            <Link to="/my-coral" className="btn-outline-ink" data-testid="teaser-my-coral">{L("Find my coral", "Cari karangku")}</Link>
          </div>
        </div>
        <motion.div className="lg:col-span-8" initial={{ opacity: 0, rotateX: 18, y: 60 }} whileInView={{ opacity: 1, rotateX: 0, y: 0 }} viewport={{ once: true, margin: "-80px" }} transition={{ duration: 1.3, ease: [0.22, 1, 0.36, 1] }} style={{ perspective: 1200 }}>
          <div className="-rotate-1 transition-transform duration-700 hover:rotate-0"><Certificate {...SAMPLE} /></div>
        </motion.div>
      </div>
    </section>
  );
}
