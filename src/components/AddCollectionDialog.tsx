import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { useApp } from "@/lib/store";
import { employees, TODAY } from "@/lib/demo-data";
import { toISODate } from "@/lib/format";
import { PAYMENT_TYPE_LABEL, type PaymentType } from "@/lib/types";

export function AddCollectionDialog({ companyId }: { companyId?: string }) {
  const { rows, addCollection, currentUser, role } = useApp();
  const [open, setOpen] = useState(false);
  const [company, setCompany] = useState(companyId ?? rows[0]?.id ?? "");
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(toISODate(TODAY));
  const [type, setType] = useState<PaymentType>("pul_kochirish");
  const [comment, setComment] = useState("");
  const [doc, setDoc] = useState<string | null>(null);
  const [employee, setEmployee] = useState(
    role === "masul" ? currentUser.id : (rows[0]?.responsible_employee_id ?? employees[0].id),
  );

  const submit = () => {
    const value = Number(amount.replace(/\s/g, ""));
    if (!company || !value || value <= 0) {
      toast.error("Korxona va undirilgan summani to'g'ri kiriting.");
      return;
    }
    addCollection({
      company_id: company,
      employee_id: employee,
      amount: value,
      collection_date: new Date(`${date}T${new Date().toTimeString().slice(0, 8)}`).toISOString(),
      payment_type: type,
      comment,
      document_name: doc,
    });
    toast.success("Undirish ma'lumoti muvaffaqiyatli saqlandi.");
    setOpen(false);
    setAmount("");
    setComment("");
    setDoc(null);
  };

  const inputCls =
    "h-9 w-full rounded-lg border border-border bg-muted px-3 text-[13px] outline-none focus:ring-2 focus:ring-ring";
  const labelCls = "text-[11px] uppercase tracking-wide text-muted-foreground";

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex h-9 items-center gap-2 rounded-lg bg-primary px-3 text-[13px] font-medium text-primary-foreground transition-opacity hover:opacity-90"
        >
          <Plus className="size-4" /> Undirish qo'shish
        </button>
      </DialogTrigger>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Undirish qo'shish</DialogTitle>
          <DialogDescription>
            Har bir to'lov alohida yozuv sifatida saqlanadi, boshlang'ich qarzdorlik o'zgarmaydi.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-3">
          <div className="space-y-1">
            <label className={labelCls}>Korxona</label>
            <select
              value={company}
              onChange={(e) => {
                setCompany(e.target.value);
                const r = rows.find((x) => x.id === e.target.value);
                if (r && role !== "masul") setEmployee(r.responsible_employee_id);
              }}
              className={inputCls}
              disabled={Boolean(companyId)}
            >
              {rows.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.name}
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>Undirilgan summa (so'm)</label>
              <input
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/[^\d\s]/g, ""))}
                placeholder="25 000 000"
                className={`${inputCls} font-mono`}
              />
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Sana</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className={inputCls}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className={labelCls}>To'lov turi</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as PaymentType)}
                className={inputCls}
              >
                {Object.entries(PAYMENT_TYPE_LABEL).map(([v, l]) => (
                  <option key={v} value={v}>
                    {l}
                  </option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className={labelCls}>Mas'ul</label>
              <select
                value={employee}
                onChange={(e) => setEmployee(e.target.value)}
                className={inputCls}
                disabled={role === "masul"}
              >
                {employees.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.full_name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Izoh</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={2}
              className="w-full rounded-lg border border-border bg-muted px-3 py-2 text-[13px] outline-none focus:ring-2 focus:ring-ring"
              placeholder="To'lov bo'yicha qisqacha izoh"
            />
          </div>

          <div className="space-y-1">
            <label className={labelCls}>Tasdiqlovchi hujjat (PDF, JPG, PNG)</label>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              onChange={(e) => setDoc(e.target.files?.[0]?.name ?? null)}
              className="w-full rounded-lg border border-border bg-muted px-3 py-1.5 text-[12px] file:mr-3 file:rounded-md file:border-0 file:bg-secondary file:px-2 file:py-1 file:text-[12px]"
            />
          </div>
        </div>

        <DialogFooter>
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="h-9 rounded-lg px-3 text-[13px] ring-1 ring-border hover:bg-muted"
          >
            Bekor qilish
          </button>
          <button
            type="button"
            onClick={submit}
            className="h-9 rounded-lg bg-primary px-4 text-[13px] font-medium text-primary-foreground hover:opacity-90"
          >
            Saqlash
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
