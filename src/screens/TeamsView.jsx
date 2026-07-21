import React, { useState } from "react";
import { Plus, UserPlus } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { RankBadge } from "../components/RankBadge";
import { AgentPaymentSheet } from "../components/AgentPaymentSheet";
import { todayISO, fmtMoney, uid } from "../lib/helpers";

const amount = (value) => Number(value || 0);
const paymentMonth = (payment) => payment.reportMonth || payment.date?.slice(0, 7);

export function TeamsView({ data, update, go, back, showToast }) {
  const monthKey = todayISO().slice(0, 7);
  const [payingAgent, setPayingAgent] = useState(null);

  const recordPayment = ({ type, amount: paymentAmount, date, reportMonth }) => {
    const entry = { id: uid(), type, amount: paymentAmount, date, reportMonth: reportMonth || date.slice(0, 7) };
    update((d) => ({
      ...d,
      agents: d.agents.map((agent) =>
        agent.id === payingAgent.id ? { ...agent, payments: [...(agent.payments || []), entry] } : agent
      ),
    }));
    setPayingAgent(null);
    showToast("Payment recorded");
  };

  const totalThisMonth = data.agents.reduce((sum, agent) => {
    return sum + (agent.payments || [])
      .filter((payment) => paymentMonth(payment) === monthKey)
      .reduce((paymentSum, payment) => paymentSum + amount(payment.amount), 0);
  }, 0);

  return (
    <div className="lg:pb-8">
      <TopBar title="Team" onBack={back} />
      <div className="px-4 py-4 lg:px-0 lg:py-5">
        <div className="mb-4 flex items-center justify-around rounded-2xl bg-[#111827] p-5 text-center">
          <div>
            <div className="font-mono text-3xl font-bold text-white">{data.agents.length}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-white/60">Agents</div>
          </div>
          <div className="h-10 w-px bg-white/20" />
          <div>
            <div className="font-mono text-3xl font-bold text-white">{fmtMoney(totalThisMonth)}</div>
            <div className="mt-1 text-[11px] uppercase tracking-wide text-white/60">This month</div>
          </div>
        </div>

        <button onClick={() => go("addAgent")} className="soft-transition mb-4 flex w-full items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white py-3 text-sm font-semibold text-[#000000] hover:border-[#9CA3AF]">
          <UserPlus size={17} /> Invite agent
        </button>

        <div className="grid gap-2.5 lg:grid-cols-2">
          {data.agents.map((agent) => {
            const payments = agent.payments || [];
            const thisMonth = payments.filter((payment) => paymentMonth(payment) === monthKey);
            const total = thisMonth.reduce((sum, payment) => sum + amount(payment.amount), 0);
            return (
              <div key={agent.id} className="card p-3.5">
                <button onClick={() => go("agentDetail", { id: agent.id })} className="mb-2 flex w-full items-center gap-3 text-left">
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] text-sm font-semibold text-[#374151]">
                    {agent.name[0]?.toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5 truncate font-semibold text-[#000000]">
                      {agent.name} <RankBadge rank={agent.rank} size="sm" />
                    </div>
                    <div className="mt-0.5 text-[11px] text-[#6B7280]">
                      {total > 0 ? `${fmtMoney(total)} this month - ${thisMonth.length} payment(s)` : "No payments this month"}
                    </div>
                  </div>
                </button>
                <button onClick={() => setPayingAgent(agent)} className="soft-transition flex w-full items-center justify-center gap-1.5 rounded-xl bg-[#F3F4F6] py-2 text-sm font-semibold text-[#111827] hover:bg-[#E5E7EB]">
                  <Plus size={15} /> Add payment
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {payingAgent && (
        <AgentPaymentSheet
          agentName={payingAgent.name}
          onClose={() => setPayingAgent(null)}
          onSave={recordPayment}
        />
      )}
    </div>
  );
}
