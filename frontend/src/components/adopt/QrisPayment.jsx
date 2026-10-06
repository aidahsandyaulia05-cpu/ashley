import { useEffect, useState } from "react";
import { QRCodeSVG } from "qrcode.react";
import { motion } from "framer-motion";
import { ShieldCheck, Timer, Info, QrCode, Wallet, Landmark, Copy } from "lucide-react";
import { toast } from "sonner";
import { idr } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const MERCHANT = { name: "REEFORA", holder: "[Account Holder Name]", bank: "[Bank Name]", nmid: "[NMID]" };
const BANKS = ["BCA", "BNI", "BRI", "Mandiri", "Permata"];

const Countdown = ({ L }) => {
  const [left, setLeft] = useState(15 * 60);
  useEffect(() => {
    const t = setInterval(() => setLeft((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(t);
  }, []);
  return (
    <p className="mt-3 flex items-center gap-2 text-sm text-coral"><Timer className="h-4 w-4" />{L("Expires in", "Berakhir dalam")}{" "}
      <span className="font-mono" data-testid="qris-timer">{String(Math.floor(left / 60)).padStart(2, "0")}:{String(left % 60).padStart(2, "0")}</span></p>
  );
};

const DemoDetail = ({ method, adoption, L }) => {
  const [bank, setBank] = useState("BCA");
  const va = `8808${adoption.qris_ref.replace(/\D/g, "").padEnd(12, "0").slice(0, 12)}`;
  if (method === "bank") return (
    <div data-testid="bank-va-panel">
      <div className="flex flex-wrap gap-2">{BANKS.map((b) => <button key={b} onClick={() => setBank(b)} data-testid={`bank-${b}`} className={`chip border px-3 py-1.5 ${bank === b ? "border-teal bg-teal text-ivory" : "border-ink/15"}`}>{b}</button>)}</div>
      <p className="mt-5 text-xs text-slate-500">{bank} Virtual Account</p>
      <button onClick={() => { navigator.clipboard.writeText(va); toast.success(L("VA number copied", "Nomor VA disalin")); }} className="mt-1 flex items-center gap-2 font-mono text-2xl tracking-wider" data-testid="va-number">{va}<Copy className="h-4 w-4 text-slate-400" /></button>
    </div>
  );
  return (
    <motion.div key={method} initial={{ opacity: 0, scale: 0.85, filter: "blur(8px)" }} animate={{ opacity: 1, scale: 1, filter: "blur(0px)" }} transition={{ duration: 0.8 }} className="mx-auto w-fit rounded-2xl border border-ink/10 bg-white p-4">
      <p className="mb-2 text-center text-[11px] font-bold tracking-[0.3em]">{method === "shopeepay" ? "SHOPEEPAY" : "QRIS"}</p>
      <QRCodeSVG value={`DEMO|${method}|${MERCHANT.name}|${adoption.qris_ref}|${adoption.amount}`} size={190} fgColor={method === "shopeepay" ? "#c2410c" : "#061026"} data-testid="qris-code" />
      <p className="mt-2 text-center font-mono text-[10px] text-slate-500">{adoption.qris_ref}</p>
    </motion.div>
  );
};

export const PaymentStep = ({ adoption, mode, onConfirm, onLivePay, busy }) => {
  const { L } = useLang();
  const [method, setMethod] = useState("qris");
  const methods = [["qris", QrCode, "QRIS"], ["shopeepay", Wallet, "ShopeePay"], ["bank", Landmark, L("Bank transfer (VA)", "Transfer bank (VA)")]];
  const live = mode === "midtrans";
  return (
    <div data-testid="step-payment">
      <h2 className="font-serif text-4xl font-light">{L("Payment", "Pembayaran")}</h2>
      {live ? (
        <p className="mt-2 text-sm text-slate-400" data-testid="payment-live-notice">{L("Secure checkout by Midtrans — QRIS, ShopeePay and bank virtual accounts.", "Pembayaran aman oleh Midtrans — QRIS, ShopeePay, dan virtual account bank.")}</p>
      ) : (
        <p className="mt-2 flex items-center gap-2 text-sm text-gold" data-testid="payment-demo-notice"><Info className="h-4 w-4" />{L("Demo mode — simulated payment, no real money moves.", "Mode demo — pembayaran simulasi, tidak ada uang yang ditransfer.")}</p>
      )}
      <div className="mt-6 grid grid-cols-3 gap-2">
        {methods.map(([k, Icon, l]) => (
          <button key={k} onClick={() => setMethod(k)} data-testid={`pay-method-${k}`} className={`flex flex-col items-center gap-2 rounded-2xl border p-4 text-xs transition-colors ${method === k ? "border-coral bg-coral/10" : "border-white/10 hover:border-white/30"}`}>
            <Icon className="h-5 w-5 text-seafoam" strokeWidth={1.5} />{l}
          </button>
        ))}
      </div>
      <div className="mt-6 grid items-center gap-8 rounded-[1.75rem] bg-ivory p-6 text-ink sm:grid-cols-2 sm:p-8">
        {live ? <p className="text-sm text-slate-600">{L("You'll choose and complete your payment in the secure Midtrans window.", "Anda akan memilih dan menyelesaikan pembayaran di jendela aman Midtrans.")}</p> : <DemoDetail method={method} adoption={adoption} L={L} />}
        <div>
          <p className="eyebrow text-teal">Merchant</p>
          <p className="mt-1 font-serif text-2xl">{MERCHANT.name}</p>
          <dl className="mt-4 space-y-1.5 text-sm text-slate-600">
            <div className="flex justify-between gap-4"><dt>{L("Account holder", "Pemilik rekening")}</dt><dd className="text-ink">{MERCHANT.holder}</dd></div>
            <div className="flex justify-between gap-4"><dt>Bank</dt><dd className="text-ink">{MERCHANT.bank}</dd></div>
            <div className="flex justify-between gap-4"><dt>NMID</dt><dd className="font-mono text-ink">{MERCHANT.nmid}</dd></div>
          </dl>
          <p className="mt-6 text-xs text-slate-500">{L("Amount", "Jumlah")}</p>
          <p className="font-serif text-4xl" data-testid="qris-amount">{idr(adoption.amount)}</p>
          <Countdown L={L} />
        </div>
      </div>
      {live ? (
        <button onClick={() => onLivePay(method)} disabled={busy} className="btn-coral mt-8 w-full justify-center py-4 disabled:opacity-50" data-testid="live-pay-button">
          <ShieldCheck className="h-4 w-4" />{busy ? L("Waiting for payment…", "Menunggu pembayaran…") : L("Pay now", "Bayar sekarang")}
        </button>
      ) : (
        <button onClick={() => onConfirm(method)} disabled={busy} className="btn-coral mt-8 w-full justify-center py-4 disabled:opacity-50" data-testid="qris-pay-button">
          <ShieldCheck className="h-4 w-4" />{busy ? L("Verifying payment…", "Memverifikasi pembayaran…") : L("I've paid — simulate confirmation", "Sudah bayar — simulasikan konfirmasi")}
        </button>
      )}
    </div>
  );
};
