import React, { useState } from "react";
import { X, Trash2 } from "lucide-react";
import { Field } from "./Field";
import { AmountInput } from "./AmountInput";
import { TwoTapButton } from "./TwoTapButton";
import { todayISO } from "../lib/helpers";
import { inputCls } from "../lib/constants";

const TYPES = ["Renewal", "New FD", "New RD"];

export function AgentPaymentSheet({ agentName, initial, onClose, onSave, onDelete }) {
  const [type, setType] = useState(initial?.type || "Renewal");
  const [amount, setAmount] = useState(initial ? String(initial.amount ?? "") : "");
  const [date, setDate] = useState(initial?.date?.slice(0, 10) || todayISO());

  const canSave = amount && Number(amount) > 0;

  return (
    <div className="fixed inset-0 z-40 flex items-end justify-center bg-black/40" onClick={onClose}>
      <div className="bg-white rounded-t-3xl w-full max-w-[480px] p-5 pb-7" onClick={(e) => e.stopPropagation()}>
        <div className="w-10 h-1 bg-[#D1D5DB] rounded-full mx-auto mb-4" />
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-serif text-lg text-[#000000]" style={{ fontFamily: "'Fraunces', serif" }}>
            {initial ? "Edit payment" : "Add payment"}{agentName ? ` — ${agentName}` : ""}
          </h3>
          <button onClick={onClose}><X size={20} className="text-[#6B7280]" /></button>
        </div>

        <Field label="Type">
          <div className="grid grid-cols-3 gap-2">
            {TYPES.map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                className={`py-2.5 rounded-xl text-sm font-semibold border ${type === t ? "bg-[#000000] text-white border-[#000000]" : "bg-white text-[#374151] border-[#D1D5DB]"}`}
              >
                {t}
              </button>
            ))}
          </div>
        </Field>

        <Field label="Amount">
          <AmountInput className={inputCls} value={amount} onChange={setAmount} placeholder="e.g. 1000" />
        </Field>

        <Field label="Date">
          <input type="date" className={inputCls} value={date} onChange={(e) => setDate(e.target.value)} />
        </Field>

        <button
          disabled={!canSave}
          onClick={() => onSave({ type, amount: Number(amount), date })}
          className="w-full py-3 rounded-xl bg-[#111827] text-white font-semibold disabled:opacity-40 mb-2"
        >
          {initial ? "Save changes" : "Save payment"}
        </button>

        {initial && onDelete && (
          <TwoTapButton onConfirm={onDelete} label="Delete this payment" confirmLabel="Tap again to delete" icon={<Trash2 size={14} />} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#F3F4F6] text-[#111827]" />
        )}
      </div>
    </div>
  );
}