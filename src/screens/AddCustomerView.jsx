import React, { useState } from "react";
import { TopBar } from "../components/TopBar";
import { Field } from "../components/Field";
import { AmountInput } from "../components/AmountInput";
import { uid, todayISO } from "../lib/helpers";
import { MODE_LABEL, MODE_MONTHS, inputCls } from "../lib/constants";

export function AddCustomerView({ data, self, update, onDone, onCancel }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [joinedOn, setJoinedOn] = useState(todayISO());
  const [idNum, setIdNum] = useState("");
  const [assignedAgentId, setAssignedAgentId] = useState(self.id);
  const [schemeName, setSchemeName] = useState(data.schemes[0] || "MIS");
  const [newScheme, setNewScheme] = useState("");
  const [addingScheme, setAddingScheme] = useState(false);
  const [schemeType, setSchemeType] = useState("Monthly");
  const [mode, setMode] = useState("monthly");
  const [amount, setAmount] = useState("");
  const [termMonths, setTermMonths] = useState(12);
  const [termYears, setTermYears] = useState(1);
  const [customTerm, setCustomTerm] = useState(false);
  const [maturityAmount, setMaturityAmount] = useState("");

  const finalScheme = addingScheme ? newScheme.trim() : schemeName;
  const canSave = name.trim() && finalScheme && amount && (schemeType !== "FD" || maturityAmount);

  const save = () => {
    const schemes = [...data.schemes];
    if (addingScheme && finalScheme && !schemes.includes(finalScheme)) schemes.push(finalScheme);
    const customer = {
      id: uid(),
      agentId: assignedAgentId,
      name: name.trim(),
      phone,
      joinedOn,
      idNum,
      schemeName: finalScheme,
      schemeType,
      mode: schemeType === "Monthly" ? mode : null,
      amount: Number(amount),
      termMonths: Number(termMonths),
      depositDate: schemeType === "FD" ? joinedOn : null,
      maturityAmount: schemeType === "FD" ? Number(maturityAmount) : null,
      paidMonths: [],
      createdAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, schemes, customers: [...d.customers, customer] }));
    onDone();
  };

  const TermPicker = () => (
    <Field label="Term (years)">
      {!customTerm ? (
        <div className="grid grid-cols-4 gap-2">
          {[1, 2, 3, 4, 5, 6].map((y) => (
            <button
              key={y}
              onClick={() => { setTermYears(y); setTermMonths(y * 12); }}
              className={`rounded-xl py-2.5 text-sm font-semibold border ${termYears === y && !customTerm ? "bg-[#000000] text-white border-[#000000]" : "bg-white text-[#374151] border-[#D1D5DB]"}`}
            >
              {y}yr
            </button>
          ))}
          <button
            onClick={() => setCustomTerm(true)}
            className="rounded-xl py-2.5 text-sm font-semibold border bg-white text-[#374151] border-[#D1D5DB] col-span-2"
          >
            Custom
          </button>
        </div>
      ) : (
        <div className="flex gap-2">
          <input
            type="text"
            inputMode="numeric"
            className={inputCls}
            value={termMonths}
            onChange={(e) => setTermMonths(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter months"
          />
          <button
            onClick={() => setCustomTerm(false)}
            className="px-3 rounded-xl bg-[#F3F4F6] text-[#374151] text-sm font-semibold whitespace-nowrap"
          >
            Cancel
          </button>
        </div>
      )}
    </Field>
  );

  return (
    <div>
      <TopBar title="Add customer" onBack={onCancel} />
      <div className="px-4 py-4">
        <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Customer name" /></Field>
        <Field label="Phone"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" /></Field>
        <Field label="Joined on"><input type="date" className={inputCls} value={joinedOn} onChange={(e) => setJoinedOn(e.target.value)} /></Field>
        <Field label="ID (optional)"><input className={inputCls} value={idNum} onChange={(e) => setIdNum(e.target.value)} placeholder="Aadhaar / customer ID" /></Field>

        {data.agents.length > 0 && (
          <Field label="Handled by">
            <select className={inputCls} value={assignedAgentId} onChange={(e) => setAssignedAgentId(e.target.value)}>
              <option value={self.id}>{self.name} (You)</option>
              {data.agents.map((a) => (
                <option key={a.id} value={a.id}>{a.name}</option>
              ))}
            </select>
          </Field>
        )}

        <Field label="Scheme">
          {!addingScheme ? (
            <select
              className={inputCls}
              value={schemeName}
              onChange={(e) => {
                if (e.target.value === "__custom__") setAddingScheme(true);
                else setSchemeName(e.target.value);
              }}
            >
              {(data.schemes.length > 0 ? data.schemes : ["MIS"]).map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
              <option value="__custom__">+ Add custom scheme</option>
            </select>
          ) : (
            <div className="flex gap-2">
              <input
                className={inputCls}
                value={newScheme}
                onChange={(e) => setNewScheme(e.target.value)}
                placeholder="New scheme name"
                autoFocus
              />
              <button
                onClick={() => setAddingScheme(false)}
                className="px-3 rounded-xl bg-[#F3F4F6] text-[#374151] text-sm font-semibold"
              >
                Cancel
              </button>
            </div>
          )}
        </Field>

        <Field label="Scheme type">
          <div className="grid grid-cols-2 gap-2">
            {["Monthly", "FD"].map((t) => (
              <button key={t} onClick={() => setSchemeType(t)} className={`rounded-xl py-2.5 text-sm font-semibold border ${schemeType === t ? "bg-[#000000] text-white border-[#000000]" : "bg-white text-[#374151] border-[#D1D5DB]"}`}>
                {t === "Monthly" ? "Monthly (RD)" : "Fixed deposit"}
              </button>
            ))}
          </div>
        </Field>

        {schemeType === "Monthly" ? (
          <>
            <Field label="Payment mode">
              <div className="grid grid-cols-4 gap-2">
                {Object.keys(MODE_LABEL).map((m) => (
                  <button key={m} onClick={() => setMode(m)} className={`rounded-xl py-2 text-xs font-semibold border ${mode === m ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#374151] border-[#D1D5DB]"}`}>
                    {MODE_LABEL[m]}
                  </button>
                ))}
              </div>
              <div className="text-xs text-[#6B7280] mt-2">Customer typically pays every {MODE_MONTHS[mode]} month(s) at once.</div>
            </Field>
            <Field label="Monthly installment amount">
              <AmountInput className={inputCls} value={amount} onChange={setAmount} placeholder="e.g. 2000" />
            </Field>
            <TermPicker />
          </>
        ) : (
          <>
            <Field label="Deposit amount">
              <AmountInput className={inputCls} value={amount} onChange={setAmount} placeholder="e.g. 100000" />
            </Field>
            <TermPicker />
            <Field label="Maturity amount">
              <AmountInput className={inputCls} value={maturityAmount} onChange={setMaturityAmount} placeholder="e.g. 130000" />
            </Field>
          </>
        )}

        <button disabled={!canSave} onClick={save} className="w-full mt-2 py-3 rounded-xl bg-[#111827] text-white font-semibold disabled:opacity-40">Save customer</button>
      </div>
    </div>
  );
}