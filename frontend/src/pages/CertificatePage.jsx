import { useEffect, useState } from "react";
import { useParams, useSearchParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { QRCodeSVG, QRCodeCanvas } from "qrcode.react";
import { toast } from "sonner";
import { Printer, Download, Share2, ArrowRight, MessageCircle } from "lucide-react";
import { api, profileUrl } from "@/lib/api";
import { Certificate } from "@/components/coral/Certificate";
import { useLang } from "@/lib/i18n";

export default function CertificatePage() {
  const { adoptionId } = useParams();
  const [params] = useSearchParams();
  const { L } = useLang();
  const [data, setData] = useState(null);
  useEffect(() => { api.get(`/adoptions/${adoptionId}`).then((r) => setData(r.data)).catch(() => setData(false)); }, [adoptionId]);

  if (data === false) return <div className="bg-abyss px-6 pb-40 pt-48 text-center font-serif text-4xl text-ivory">{L("Certificate not found.", "Sertifikat tidak ditemukan.")}</div>;
  if (!data) return <div className="min-h-screen bg-abyss" />;
  const { adoption, coral } = data;
  if (adoption.payment_status !== "paid") return <div className="bg-abyss px-6 pb-40 pt-48 text-center font-serif text-4xl text-ivory">{L("Payment not completed yet.", "Pembayaran belum selesai.")}</div>;

  const url = profileUrl(adoption.coral_id);
  const shareText = L(`I just adopted coral ${adoption.coral_id} with REEFORA. Adopt a Coral. Restore a Reef.`, `Aku baru mengadopsi karang ${adoption.coral_id} bersama REEFORA. Adopsi Karang. Pulihkan Terumbu.`);
  const share = async () => {
    if (navigator.share) { try { await navigator.share({ title: "REEFORA", text: shareText, url }); } catch { /* cancelled */ } return; }
    await navigator.clipboard.writeText(`${shareText} ${url}`);
    toast.success(L("Link copied", "Tautan disalin"));
  };
  const downloadQr = () => {
    const a = document.createElement("a");
    a.href = document.getElementById("qr-download-canvas").toDataURL("image/png");
    a.download = `REEFORA-${adoption.coral_id}-QR.png`;
    a.click();
  };

  return (
    <div className="min-h-screen bg-abyss pb-32 pt-32 text-ivory" data-testid="certificate-page">
      <div className="container-x">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }} className="max-w-3xl">
          <p className="eyebrow text-seafoam">{params.get("new") ? L("Adoption complete", "Adopsi selesai") : L("Your certificate", "Sertifikatmu")}</p>
          <h1 className="display mt-4 text-5xl sm:text-6xl" data-testid="certificate-heading">{L("Welcome to the reef,", "Selamat datang di terumbu,")} <em className="text-coral">{adoption.adopter_name}.</em></h1>
          <p className="mt-5 text-slate-300">{L(`Coral ${adoption.coral_id} is now officially yours. Your certificate and QR code are ready.`, `Karang ${adoption.coral_id} kini resmi milikmu. Sertifikat dan kode QR-mu sudah siap.`)}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 80, rotateX: 25 }} animate={{ opacity: 1, y: 0, rotateX: 0 }} transition={{ duration: 1.4, delay: 0.3, ease: [0.22, 1, 0.36, 1] }} style={{ perspective: 1400 }} className="mt-14">
          <Certificate adoption={adoption} coral={coral} />
        </motion.div>

        <div className="mt-14 grid gap-6 lg:grid-cols-12">
          <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 1.2, duration: 0.8 }}
            className="flex items-center gap-6 rounded-[1.75rem] border border-white/10 bg-navy p-6 lg:col-span-5" data-testid="coral-qr-card">
            <motion.div initial={{ clipPath: "inset(0 0 100% 0)" }} animate={{ clipPath: "inset(0 0 0% 0)" }} transition={{ delay: 1.5, duration: 1.2 }} className="rounded-2xl bg-ivory p-3">
              <QRCodeSVG value={url} size={120} fgColor="#061026" data-testid="coral-qr" />
            </motion.div>
            <QRCodeCanvas id="qr-download-canvas" value={url} size={1024} marginSize={4} className="hidden" />
            <div>
              <p className="eyebrow text-coral">Coral QR Code</p>
              <p className="mt-2 font-mono text-sm">{adoption.coral_id}</p>
              <p className="mt-2 text-xs text-slate-400">{L("Scan to open your coral's live profile.", "Pindai untuk membuka profil karangmu.")}</p>
              <button onClick={downloadQr} className="mt-4 flex items-center gap-2 text-sm text-seafoam hover:text-ivory" data-testid="download-qr-btn"><Download className="h-4 w-4" />{L("Download QR", "Unduh QR")}</button>
            </div>
          </motion.div>
          <div className="flex flex-wrap content-center gap-3 lg:col-span-7">
            <Link to={`/coral/${adoption.coral_id}`} className="btn-coral" data-testid="open-my-coral-btn">{L("Open My Coral", "Buka Karangku")} <ArrowRight className="h-4 w-4" /></Link>
            <button onClick={() => window.print()} className="btn-ghost" data-testid="print-cert-btn"><Printer className="h-4 w-4" />{L("Print / Save PDF", "Cetak / Simpan PDF")}</button>
            <button onClick={share} className="btn-ghost" data-testid="share-cert-btn"><Share2 className="h-4 w-4" />{L("Share", "Bagikan")}</button>
            <a href={`https://wa.me/?text=${encodeURIComponent(`${shareText} ${url}`)}`} target="_blank" rel="noreferrer" className="btn-ghost" data-testid="share-wa-btn"><MessageCircle className="h-4 w-4" />WhatsApp</a>
          </div>
        </div>
      </div>
    </div>
  );
}
