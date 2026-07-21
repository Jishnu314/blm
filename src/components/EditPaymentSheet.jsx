import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Field } from "./Field";
import { AmountInput } from "./AmountInput";
import { TwoTapButton } from "./TwoTapButton";
import { inputCls } from "../lib/constants";

export function EditPaymentSheet({ entry, onClose, onSave, onDelete }) {
  const [amount, setAmount] = useState(String(entry.amount ?? ""));
  const [date, setDate] = useState((entry.date || "").slice(0, 10));

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-t-3xl bg-white p-5 pb-7 shadow-2xl" onClick={(e) => e.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D1D5DB]" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#000000]" style={{ fontFamily: "'Fraunces', serif" }}>Edit payment</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F3F4F6]"><X size={20} className="text-[#6B7280]" /></button>
        </div>

        <Field label="Amount"><AmountInput className={inputCls} value={amount} onChange={setAmount} /></Field>
        <Field label="Date paid"><input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} /></Field>

        <button onClick={() => onSave({ amount: Number(amount), date })} className="w-full py-3 rounded-xl bg-[#111827] text-white font-semibold mb-2">
          Save changes
        </button>
        <TwoTapButton onConfirm={onDelete} label="Undo this payment" confirmLabel="Tap again to undo" icon={<Trash2 size={14} />} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#F3F4F6] text-[#111827]" />
      </div>
    </div>
  );
}
