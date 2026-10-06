import { useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription } from "@/components/ui/dialog";
import { api, errMsg } from "@/lib/api";
import { useLang } from "@/lib/i18n";

const inputCls = "w-full rounded-xl border border-white/15 bg-white/5 px-4 py-3 text-sm text-ivory placeholder:text-slate-500 focus:border-seafoam/60 focus:outline-none";

export const EnquiryForm = ({ kind, program, onDone }) => {
  const { L } = useLang();
  const [f, setF] = useState({ name: "", email: "", organization: "", message: "" });
  const [busy, setBusy] = useState(false);
  const submit = async (e) => {
    e.preventDefault();
    setBusy(true);
    try {
      await api.post("/enquiries", { ...f, kind, program });
      toast.success(L("Thank you — our team will reach out within 2 working days.", "Terima kasih — tim kami akan menghubungi dalam 2 hari kerja."));
      setF({ name: "", email: "", organization: "", message: "" });
      onDone?.();
    } catch (err) {
      toast.error(errMsg(err));
    } finally {
      setBusy(false);
    }
  };
  const on = (k) => (e) => setF({ ...f, [k]: e.target.value });
  return (
    <form onSubmit={submit} className="space-y-3" data-testid={`enquiry-form-${kind}`}>
      <div className="grid gap-3 sm:grid-cols-2">
        <input required value={f.name} onChange={on("name")} placeholder={L("Full name", "Nama lengkap")} className={inputCls} data-testid="enquiry-name" />
        <input required type="email" value={f.email} onChange={on("email")} placeholder="Email" className={inputCls} data-testid="enquiry-email" />
      </div>
      <input value={f.organization} onChange={on("organization")} placeholder={L("Organization (optional)", "Organisasi (opsional)")} className={inputCls} data-testid="enquiry-org" />
      <textarea rows={4} value={f.message} onChange={on("message")} placeholder={L("Tell us about your goals", "Ceritakan tujuan Anda")} className={inputCls} data-testid="enquiry-message" />
      <button disabled={busy} className="btn-coral w-full justify-center disabled:opacity-60" data-testid="enquiry-submit">
        {busy ? L("Sending…", "Mengirim…") : L("Send enquiry", "Kirim permintaan")}
      </button>
    </form>
  );
};

export const EnquiryDialog = ({ kind, program, title, trigger }) => {
  const [open, setOpen] = useState(false);
  const { L } = useLang();
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>{trigger}</DialogTrigger>
      <DialogContent className="max-w-lg border-white/10 bg-navy text-ivory" data-testid={`enquiry-dialog-${kind}`}>
        <DialogHeader>
          <DialogTitle className="font-serif text-3xl font-light">{title}</DialogTitle>
          <DialogDescription className="text-slate-400">{program || L("We reply within 2 working days.", "Kami membalas dalam 2 hari kerja.")}</DialogDescription>
        </DialogHeader>
        <EnquiryForm kind={kind} program={program} onDone={() => setOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};
