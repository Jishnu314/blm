import React, { useState } from "react";
import { Edit2, Plus } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { TwoTapButton } from "../components/TwoTapButton";
import { RankBadge } from "../components/RankBadge";
import { AgentPaymentSheet } from "../components/AgentPaymentSheet";
import { fmtDate, fmtMoney, uid } from "../lib/helpers";
import { RANKS, inputCls } from "../lib/constants";

const TYPE_STYLE = {
  Renewal: { bg: "#F3F4F6", fg: "#374151" },
  "New FD": { bg: "#DBEAFE", fg: "#1D4ED8" },
  "New RD": { bg: "#DCFCE7", fg: "#15803D" },
};

export function AgentDetailView({ data, update, agentId, back, showToast }) {
  const agent = data.agents.find((a) => a.id === agentId);
  const [editing, setEditing] = useState(false);
  const [paying, setPaying] = useState(false);
  if (!agent) return <div className="p-6 text-[#6B7280]">Agent not found.</div>;

  const payments = agent.payments || [];
  const totalPaid = payments.reduce((s, p) => s + Number(p.amount || 0), 0);

  const updateAgent = (patch) => {
    update((d) => ({ ...d, agents: d.agents.map((a) => (a.id === agentId ? { ...a, ...patch } : a)) }));
  };

  const recordPayment = ({ type, amount, date, reportMonth }) => {
    const entry = { id: uid(), type, amount, date, reportMonth: reportMonth || date.slice(0, 7) };
    updateAgent({ payments: [...payments, entry] });
    setPaying(false);
    showToast("Payment recorded");
  };

  return (
    <div>
      <TopBar title={agent.name} onBack={back} right={
        <TwoTapButton onConfirm={() => setEditing((e) => !e)} label="Edit" confirmLabel="Confirm edit" icon={<Edit2 size={13} />} className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1 ${editing ? "bg-[#000000] text-white" : "bg-[#F3F4F6] text-[#374151]"}`} />
      } />
      <div className="px-4 py-4">
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
          {editing ? (
            <div className="space-y-2">
              <input className={inputCls} defaultValue={agent.name} onBlur={(e) => updateAgent({ name: e.target.value })} placeholder="Name" />
              <input className={inputCls} defaultValue={agent.phone} onBlur={(e) => updateAgent({ phone: e.target.value })} placeholder="Phone" />
              <input className={inputCls} defaultValue={agent.agentIdNumber} onBlur={(e) => updateAgent({ agentIdNumber: e.target.value })} placeholder="Agent ID" />
              <div className="flex gap-2 pt-1">
                {RANKS.map((r) => (
                  <button key={r} onClick={() => updateAgent({ rank: r })} className={`flex-1 py-2 rounded-xl text-xs font-semibold border ${agent.rank === r ? "bg-[#000000] text-white border-[#000000]" : "bg-white text-[#374151] border-[#D1D5DB]"}`}>{r}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-full bg-[#F3F4F6] flex items-center justify-center text-[#374151] font-serif text-lg font-semibold">{agent.name[0]?.toUpperCase()}</div>
              <div>
                <div className="font-semibold text-[#000000] flex items-center gap-2">{agent.name} <RankBadge rank={agent.rank} size="sm" /></div>
                <div className="text-xs text-[#6B7280]">{agent.phone || "No phone"} · ID {agent.agentIdNumber || "—"}</div>
              </div>
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
          <div className="text-xs text-[#6B7280] mb-1">Total collected all-time</div>
          <div className="font-mono font-bold text-2xl text-[#000000] mb-3">{fmtMoney(totalPaid)}</div>
          <button onClick={() => setPaying(true)} className="w-full py-2.5 rounded-xl bg-[#111827] text-white font-semibold text-sm flex items-center justify-center gap-1.5">
            <Plus size={16} /> Add payment
          </button>
        </div>

        <div className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold mb-2">Payment history</div>
        {payments.length === 0 ? (
          <div className="text-sm text-[#6B7280]">No payments recorded yet.</div>
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F3F4F6]">
            {payments.slice().reverse().map((p) => {
              const s = TYPE_STYLE[p.type] || TYPE_STYLE.Renewal;
              return (
                <div key={p.id} className="flex items-center justify-between px-4 py-3 text-sm">
                  <div>
                    <span className="inline-block px-2 py-0.5 rounded-full text-[11px] font-semibold mb-1" style={{ background: s.bg, color: s.fg }}>{p.type}</span>
                    <div className="text-[#6B7280] text-[11px]">{fmtDate(p.date)}</div>
                  </div>
                  <span className="font-mono font-semibold text-[#000000]">{fmtMoney(p.amount)}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {paying && (
        <AgentPaymentSheet
          agentName={agent.name}
          onClose={() => setPaying(false)}
          onSave={recordPayment}
        />
      )}
    </div>
  );
}
