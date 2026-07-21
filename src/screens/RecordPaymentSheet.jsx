import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { Field } from "../components/Field";
import { AmountInput } from "../components/AmountInput";
import { todayISO } from "../lib/helpers";
import { MODE_MONTHS, inputCls } from "../lib/constants";

export function RecordPaymentSheet({ customer, cell, onClose, onSave }) {
  const defaultMonths = MODE_MONTHS[customer.mode] || 1;
  const remaining = (customer.termMonths || 12) - cell.index;
  const [months, setMonths] = useState(Math.min(defaultMonths, remaining));
  const [amount, setAmount] = useState(Math.min(defaultMonths, remaining) * customer.amount);
  const [date, setDate] = useState(todayISO());

  useEffect(() => setAmount(months * customer.amount), [months, customer.amount]);

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="w-full max-w-[480px] rounded-t-3xl bg-[#FFFFFF] p-5 pb-7 shadow-2xl" onClick={(event) => event.stopPropagation()}>
        <div className="mx-auto mb-4 h-1 w-10 rounded-full bg-[#D1D5DB]" />
        <div className="mb-4 flex items-center justify-between">
          <h3 className="font-serif text-lg text-[#000000]" style={{ fontFamily: "'Fraunces', serif" }}>Record payment</h3>
          <button onClick={onClose} className="flex h-9 w-9 items-center justify-center rounded-full hover:bg-[#F3F4F6]"><X size={20} className="text-[#6B7280]" /></button>
        </div>
        <Field label="Months covered">
          <div className="flex gap-2">
            {[1, 2, 3, 6, 12].filter((item) => item <= remaining).map((item) => (
              <button key={item} onClick={() => setMonths(item)} className={`soft-transition flex-1 rounded-xl border py-2 text-sm font-semibold ${months === item ? "border-[#111827] bg-[#111827] text-white" : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#9CA3AF]"}`}>{item}</button>
            ))}
          </div>
        </Field>
        <Field label="Amount received">
          <AmountInput className={inputCls} value={amount} onChange={(v) => setAmount(Number(v))} />
        </Field>
        <Field label="Date paid">
          <input type="date" className={inputCls} value={date} onChange={(event) => setDate(event.target.value)} />
        </Field>
        {months > 1 && <div className="mb-3 rounded-xl bg-[#F3F4F6] px-3 py-2 text-xs text-[#374151]">Covers {months} months; {months - 1} of them will be marked paid in advance.</div>}
        <button onClick={() => onSave({ months, amount, date })} className="soft-transition w-full rounded-xl bg-[#111827] py-3 font-semibold text-white hover:shadow-md">Save payment</button>
      </div>
    </div>
  );
}