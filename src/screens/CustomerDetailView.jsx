import React, { useState } from "react";
import { Edit2, Trash2 } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { TwoTapButton } from "../components/TwoTapButton";
import { PassbookGrid } from "../components/PassbookGrid";
import { RecordPaymentSheet } from "./RecordPaymentSheet";
import { EditPaymentSheet } from "../components/EditPaymentSheet";
import { AmountInput } from "../components/AmountInput";
import { computeMonthlyState, customerTotals, addMonths, fmtDate, fmtMoney, maturityDate, daysBetween, todayISO } from "../lib/helpers";
import { MODE_LABEL, inputCls } from "../lib/constants";

export function CustomerDetailView({ data, update, customerId, back, showToast }) {
  const customer = data.customers.find((c) => c.id === customerId);
  const [editing, setEditing] = useState(false);
  const [payCell, setPayCell] = useState(null);
  const [editAmount, setEditAmount] = useState("");
  const [editMaturity, setEditMaturity] = useState("");

  if (!customer) return <div className="p-6 text-[#6B7280]">Customer not found.</div>;

  const isMonthly = customer.schemeType === "Monthly";
  const st = isMonthly ? computeMonthlyState(customer) : null;
  const totals = customerTotals(customer);

  const updateCustomer = (patch) => {
    update((d) => ({ ...d, customers: d.customers.map((c) => (c.id === customerId ? { ...c, ...patch } : c)) }));
  };

  const startEditing = () => {
    setEditAmount(String(customer.amount ?? ""));
    setEditMaturity(String(customer.maturityAmount ?? ""));
    setEditing(true);
  };

  const recordPayment = ({ months, amount, date }) => {
    const paidByIndex = {};
    (customer.paidMonths || []).forEach((p) => (paidByIndex[p.index] = p));
    let idx = 0;
    while (paidByIndex[idx]) idx++;
    const newEntries = [];
    const perMonth = amount / months;
    for (let i = 0; i < months; i++) {
      const cellIndex = idx + i;
      if (cellIndex >= (customer.termMonths || 12)) break;
      const due = addMonths(customer.joinedOn, cellIndex);
      newEntries.push({ index: cellIndex, amount: perMonth, date, advance: due > new Date() && i > 0 ? true : due > new Date() });
    }
    if (newEntries.length) {
      const firstDue = addMonths(customer.joinedOn, newEntries[0].index);
      newEntries[0].advance = firstDue > new Date();
    }
    updateCustomer({ paidMonths: [...(customer.paidMonths || []), ...newEntries] });
    showToast("Payment recorded");
    setPayCell(null);
  };

  const deleteCustomer = () => {
    update((d) => ({ ...d, customers: d.customers.filter((c) => c.id !== customerId) }));
    back();
  };

  const updatePaidEntry = (index, patch) => {
    updateCustomer({ paidMonths: (customer.paidMonths || []).map((p) => (p.index === index ? { ...p, ...patch } : p)) });
  };

  const deletePaidEntry = (index) => {
    updateCustomer({ paidMonths: (customer.paidMonths || []).filter((p) => p.index !== index) });
  };

  let statusText;
  if (isMonthly) {
    if (st.overdueCount > 0) statusText = `Not paid for ${st.overdueCount} month${st.overdueCount > 1 ? "s" : ""} · last paid ${fmtDate(st.lastPaidDate)}`;
    else if (st.advanceCount > 0) statusText = `Paid ${st.advanceCount} month${st.advanceCount > 1 ? "s" : ""} in advance · next due ${fmtDate(st.nextDue)}`;
    else if (st.completed) statusText = `Scheme completed · last paid ${fmtDate(st.lastPaidDate)}`;
    else statusText = `Up to date · next due ${fmtDate(st.nextDue)}`;
  }

  return (
    <div>
      <TopBar title={customer.name} onBack={back} right={
        <TwoTapButton onConfirm={() => (editing ? setEditing(false) : startEditing())} label="Edit" confirmLabel="Confirm edit" icon={<Edit2 size={13} />} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${editing ? "bg-[#000000] text-white" : "bg-[#F3F4F6] text-[#374151]"}`} />
      } />

      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#374151] font-serif text-lg font-semibold">{customer.name[0]?.toUpperCase()}</div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[#000000] truncate">{customer.name}</div>
              <div className="text-xs text-[#6B7280]">{customer.phone || "No phone"} {customer.idNum ? `· ID ${customer.idNum}` : ""}</div>
            </div>
          </div>
          {editing ? (
            <div className="space-y-2 pt-1">
              <input className={inputCls} defaultValue={customer.name} onBlur={(e) => updateCustomer({ name: e.target.value })} placeholder="Name" />
              <input className={inputCls} defaultValue={customer.phone} onBlur={(e) => updateCustomer({ phone: e.target.value })} placeholder="Phone" />
              <input className={inputCls} defaultValue={customer.idNum} onBlur={(e) => updateCustomer({ idNum: e.target.value })} placeholder="ID" />
              {data.agents.length > 0 && (
                <div>
                  <span className="block text-[11px] text-[#6B7280] mb-1">Handled by</span>
                  <select className={inputCls} defaultValue={customer.agentId} onChange={(e) => updateCustomer({ agentId: e.target.value })}>
                    <option value={data.self.id}>{data.self.name} (You)</option>
                    {data.agents.map((a) => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          ) : (
            <div className="text-sm font-semibold rounded-xl px-3 py-2" style={{ background: isMonthly ? (st.isOverdue ? "#F3F4F6" : "#F3F4F6") : "#F3F4F6", color: isMonthly ? (st.isOverdue ? "#111827" : "#111827") : "#374151" }}>
              {isMonthly ? statusText : `Active · matures ${fmtDate(maturityDate(customer))}`}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs uppercase tracking-wide text-[#6B7280] font-semibold">{customer.schemeName}</span>
            {isMonthly && <span className="text-xs font-semibold text-[#111827]">{MODE_LABEL[customer.mode]}</span>}
          </div>
          {isMonthly ? (
            <>
              {editing ? (
                <div className="grid grid-cols-2 gap-2 mb-4">
                  <div>
                    <span className="block text-[11px] text-[#6B7280] mb-1">Monthly amount</span>
                    <AmountInput className={inputCls} value={editAmount} onChange={setEditAmount} onBlur={() => updateCustomer({ amount: Number(editAmount) })} />
                  </div>
                  <div>
                    <span className="block text-[11px] text-[#6B7280] mb-1">Term (months)</span>
                    <input type="number" className={inputCls} defaultValue={customer.termMonths} onBlur={(e) => updateCustomer({ termMonths: Number(e.target.value) })} />
                  </div>
                </div>
              ) : (
                <div className="flex gap-4 mb-4">
                  <div><div className="text-[11px] text-[#6B7280]">Installment</div><div className="font-mono font-bold text-[#000000]">{fmtMoney(customer.amount)}</div></div>
                  <div><div className="text-[11px] text-[#6B7280]">Term</div><div className="font-mono font-bold text-[#000000]">{customer.termMonths}mo</div></div>
                  <div><div className="text-[11px] text-[#6B7280]">Paid</div><div className="font-mono font-bold text-[#111827]">{fmtMoney(totals.totalPaid)}</div></div>
                  <div><div className="text-[11px] text-[#6B7280]">Due</div><div className="font-mono font-bold text-[#374151]">{fmtMoney(totals.totalDue)}</div></div>
                </div>
              )}
              <PassbookGrid customer={customer} onPayCell={(cell) => setPayCell(cell)} />

              {!st.completed && (
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => recordPayment({ months: 1, amount: customer.amount, date: todayISO() })}
                    className="py-2.5 rounded-xl bg-[#111827] text-white font-semibold text-sm"
                  >
                    Mark this month paid
                  </button>
                  <button
                    onClick={() => recordPayment({ months: 2, amount: customer.amount * 2, date: todayISO() })}
                    className="py-2.5 rounded-xl bg-[#F3F4F6] text-[#111827] font-semibold text-sm"
                  >
                    Pay advance (+1 month)
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="grid grid-cols-2 gap-3">
              {editing ? (
                <>
                  <div><span className="block text-[11px] text-[#6B7280] mb-1">Deposit amount</span><AmountInput className={inputCls} value={editAmount} onChange={setEditAmount} onBlur={() => updateCustomer({ amount: Number(editAmount) })} /></div>
                  <div><span className="block text-[11px] text-[#6B7280] mb-1">Term (months)</span><input type="number" className={inputCls} defaultValue={customer.termMonths} onBlur={(e) => updateCustomer({ termMonths: Number(e.target.value) })} /></div>
                  <div><span className="block text-[11px] text-[#6B7280] mb-1">Deposit date</span><input type="date" className={inputCls} defaultValue={customer.depositDate} onBlur={(e) => updateCustomer({ depositDate: e.target.value })} /></div>
                  <div><span className="block text-[11px] text-[#6B7280] mb-1">Maturity amount</span><AmountInput className={inputCls} value={editMaturity} onChange={setEditMaturity} onBlur={() => updateCustomer({ maturityAmount: Number(editMaturity) })} /></div>
                </>
              ) : (
                <>
                  <div><div className="text-[11px] text-[#6B7280]">Deposit amount</div><div className="font-mono font-bold text-[#000000]">{fmtMoney(customer.amount)}</div></div>
                  <div><div className="text-[11px] text-[#6B7280]">Deposit date</div><div className="font-mono font-bold text-[#000000]">{fmtDate(customer.depositDate)}</div></div>
                  <div><div className="text-[11px] text-[#6B7280]">Maturity date</div><div className="font-mono font-bold text-[#000000]">{fmtDate(maturityDate(customer))}</div></div>
                  <div><div className="text-[11px] text-[#6B7280]">Days to maturity</div><div className="font-mono font-bold text-[#374151]">{daysBetween(new Date(), maturityDate(customer))}</div></div>
                  <div className="col-span-2"><div className="text-[11px] text-[#6B7280]">Maturity amount</div><div className="font-mono font-bold text-[#111827] text-lg">{fmtMoney(customer.maturityAmount)}</div></div>
                </>
              )}
            </div>
          )}
        </div>

        <TwoTapButton onConfirm={deleteCustomer} label="Delete customer" confirmLabel="Tap again to delete permanently" icon={<Trash2 size={14} />} className="w-full py-3 rounded-xl text-sm font-semibold flex items-center justify-center gap-2 bg-[#F3F4F6] text-[#111827]" />
      </div>

      {payCell && (payCell.entry ? (
        <EditPaymentSheet
          entry={payCell.entry}
          onClose={() => setPayCell(null)}
          onSave={(patch) => { updatePaidEntry(payCell.index, patch); setPayCell(null); showToast("Payment updated"); }}
          onDelete={() => { deletePaidEntry(payCell.index); setPayCell(null); showToast("Payment undone"); }}
        />
      ) : (
        <RecordPaymentSheet
          customer={customer}
          cell={payCell}
          onClose={() => setPayCell(null)}
          onSave={recordPayment}
        />
      ))}
    </div>
  );
}