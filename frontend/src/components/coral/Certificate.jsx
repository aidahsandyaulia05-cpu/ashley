import { QRCodeSVG } from "qrcode.react";
import { CoralArt, Logo } from "@/components/site/Bits";
import { useLang } from "@/lib/i18n";
import { fmtDate, profileUrl } from "@/lib/api";

const Field = ({ label, value, testid }) => (
  <div>
    <p className="text-[10px] uppercase tracking-[0.25em] text-[#8a7a52]">{label}</p>
    <p className="mt-1 font-serif text-lg text-navy" data-testid={testid}>{value}</p>
  </div>
);

export const Certificate = ({ adoption, coral }) => {
  const { L, lang } = useLang();
  return (
    <div id="certificate-print" data-testid="certificate" className="paper relative mx-auto aspect-[1.414/1] w-full max-w-4xl overflow-hidden rounded-sm p-[3%] shadow-[0_40px_120px_-30px_rgba(0,0,0,0.6)]">
      <div className="relative h-full w-full border border-gold/60 p-[1.2%]">
        <div className="relative flex h-full w-full flex-col items-center justify-between border border-gold/30 px-[6%] py-[4%] text-center">
          <CoralArt className="absolute -left-4 bottom-0 h-[70%] text-coral/25" />
          <CoralArt className="absolute -right-4 bottom-0 h-[60%] -scale-x-100 text-gold/40" />
          <div className="flex flex-col items-center text-navy">
            <Logo className="scale-[0.8] sm:scale-100" />
            <p className="mt-2 text-[9px] tracking-[0.4em] text-[#8a7a52] sm:text-[11px]">CERTIFICATE OF CORAL ADOPTION</p>
            {L(null, <p className="text-[9px] tracking-[0.3em] text-[#8a7a52]/80">SERTIFIKAT ADOPSI KARANG</p>)}
          </div>
          <div className="relative">
            <p className="font-serif text-sm italic text-slate-600 sm:text-lg">{L("This certifies that", "Dengan ini menyatakan bahwa")}</p>
            <p className="font-serif text-3xl text-navy sm:text-6xl" data-testid="cert-adopter">{adoption.adopter_name}</p>
            <p className="mt-1 font-serif text-sm italic text-slate-600 sm:text-lg">{L("has adopted", "telah mengadopsi")}</p>
            <p className="mt-1 font-mono text-sm tracking-widest text-navy sm:text-xl" data-testid="cert-coral-id">CORAL #{adoption.coral_id}{adoption.coral_name ? ` · “${adoption.coral_name}”` : ""}</p>
          </div>
          <div className="relative grid w-full grid-cols-3 items-end gap-2 sm:gap-6">
            <div className="hidden space-y-3 text-left sm:block">
              <Field label={L("Species", "Spesies")} value={<i>{coral?.scientific_name}</i>} testid="cert-species" />
              <Field label={L("Location", "Lokasi")} value={`${coral?.site_name}, ${coral?.location}`} />
            </div>
            <div className="col-span-2 flex flex-col items-center sm:col-span-1">
              <div className="rounded-sm border border-gold/50 bg-white/70 p-2"><QRCodeSVG value={profileUrl(adoption.coral_id)} size={84} fgColor="#061026" bgColor="transparent" data-testid="cert-qr" /></div>
              <p className="mt-1.5 text-[8px] tracking-[0.2em] text-[#8a7a52]">{L("SCAN TO FOLLOW YOUR CORAL", "PINDAI UNTUK MELIHAT KARANGMU")}</p>
            </div>
            <div className="space-y-3 text-right">
              <Field label={L("Adoption Date", "Tanggal Adopsi")} value={fmtDate(adoption.adopted_at, lang)} testid="cert-date" />
              <Field label={L("Certificate No.", "No. Sertifikat")} value={<span className="font-mono text-sm">{adoption.certificate_no}</span>} />
            </div>
          </div>
          <div className="absolute right-[5%] top-[6%] hidden h-16 w-16 items-center justify-center rounded-full border-2 border-gold/70 text-center text-[7px] font-semibold leading-tight tracking-widest text-gold sm:flex">REEFORA<br />SEAL<br />2026</div>
        </div>
      </div>
    </div>
  );
};
