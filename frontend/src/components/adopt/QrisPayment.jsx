import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { ShieldCheck, Timer, Info } from "lucide-react";
import { idr } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const MERCHANT = { name: "REEFORA", holder: "[Account Holder Name]", bank: "[Bank Name]", nmid: "[NMID]" };

export const QrisPayment = ({ adoption, onConfirm, busy }) => {
  const { L } = useLang();
  const [left, setLeft] = useState(15 * 60);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  const payload = `00020101021226-QRIS-DEMO|${MERCHANT.name}|${adoption.qris_ref}|${adoption.amount}`;
  const mm = String(Math.floor(left / 60)).padStart(2, "0");
  const ss = String(left % 60).padStart(2, "0");

  return (
    <div data-testid="step-payment">
      <h2 className="font-serif text-4xl font-light">{L("Pay with QRIS", "Bayar dengan QRIS")}</h2>
      <p className="mt-2 flex items-center gap-2 text-sm text-gold" data-testid="payment-demo-notice"><Info className="h-4 w-4" />{L("Demo mode — simulated payment, no real money moves.", "Mode demo — pembayaran simulasi, tidak ada uang yang ditransfer.")}</p>
      <div className="mt-8 grid items-center gap-8 rounded-[1.75rem] border border-white/10 bg-ivory p-6 text-ink sm:grid-cols-2 sm:p-8">
        <motion.div initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.9 }} className="mx-auto rounded-2xl border border-ink/10 bg-white p-4">
          <p className="mb-2 text-center text-[11px] font-bold tracking-[0.3em]">QRIS</p>
          <QRCodeSVG value={payload} size={200} fgColor="#061026" level="M" data-testid="qris-code" />
          <p className="mt-2 text-center font-mono text-[10px] text-slate-500">{adoption.qris_ref}</p>
        </motion.div>
        <div>
          <p className="eyebrow text-teal">{L("Merchant", "Merchant")}</p>
          <p className="mt-1 font-serif text-2xl">{MERCHANT.name}</p>
          <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
            <div className="flex justify-between gap-4"><dt>{L("Account holder", "Pemilik rekening")}</dt><dd className="text-ink">{MERCHANT.holder}</dd></div>
            <div className="flex justify-between gap-4"><dt>Bank</dt><dd className="text-ink">{MERCHANT.bank}</dd></div>
            <div className="flex justify-between gap-4"><dt>NMID</dt><dd className="font-mono text-ink">{MERCHANT.nmid}</dd></div>
          </dl>
          <p className="mt-6 text-xs text-slate-500">{L("Amount", "Jumlah")}</p>
          <p className="font-serif text-4xl" data-testid="qris-amount">{idr(adoption.amount)}</p>
          <p className="mt-3 flex items-center gap-2 text-sm text-coral"><Timer className="h-4 w-4" />{L("Expires in", "Berakhir dalam")} <span className="font-mono" data-testid="qris-timer">{mm}:{ss}</span></p>
        </div>
      </div>
      <ol className="mt-6 grid gap-2 text-sm text-slate-400 sm:grid-cols-3">
        {[L("Open any bank or e-wallet app", "Buka aplikasi bank / e-wallet"), L("Scan the QRIS code", "Pindai kode QRIS"), L("Confirm the amount", "Konfirmasi jumlah")].map((s, i) => <li key={s}><span className="font-mono text-coral">0{i + 1}</span> {s}</li>)}
      </ol>
      <button onClick={onConfirm} disabled={busy || left === 0} className="btn-coral mt-8 w-full justify-center py-4 disabled:opacity-50" data-testid="qris-pay-button">
        <ShieldCheck className="h-4 w-4" />{busy ? L("Verifying payment…", "Memverifikasi pembayaran…") : L("I've paid — simulate confirmation", "Sudah bayar — simulasikan konfirmasi")}
      </button>
    </div>
  );
};
