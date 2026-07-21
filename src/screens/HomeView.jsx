import React from "react";
import { AlertTriangle, CalendarClock, ChevronRight, Plus, ShieldCheck, TrendingUp, UserPlus, Users, Wallet } from "lucide-react";
import { RankBadge } from "../components/RankBadge";
import { StatCard } from "../components/StatCard";
import { todayISO, sameMonth, computeMonthlyState, customerTotals, fmtMoney } from "../lib/helpers";

const amount = (value) => Number(value || 0);
const agentReports = (agent) => (agent.payments || []).map((payment) => ({
  reportMonth: (payment.date || todayISO()).slice(0, 7),
  renewals: amount(payment.amount),
  newRd: 0,
  newFd: 0,
}));

export function HomeView({ data, self, myCustomers, canAddAgents, go }) {
  const monthKey = todayISO().slice(0, 7);
  const today = new Date();

  const collected = myCustomers.reduce((sum, customer) => {
    if (customer.schemeType === "FD") {
      return sameMonth(customer.depositDate, monthKey) ? sum + amount(customer.amount) : sum;
    }
    const paidThisMonth = (customer.paidMonths || []).filter((payment) => sameMonth(payment.date, monthKey));
    return sum + paidThisMonth.reduce((subtotal, payment) => subtotal + amount(payment.amount), 0);
  }, 0);

  let dueThisMonthAmt = 0;
  let overdueCount = 0;
  let dueThisWeekCount = 0;
  myCustomers.filter((customer) => customer.schemeType !== "FD").forEach((customer) => {
    const state = computeMonthlyState(customer, today);
    if (!state.completed) {
      if (sameMonth(new Date(state.nextDue).toISOString(), monthKey) || state.isOverdue) dueThisMonthAmt += amount(customer.amount);
      if (state.isOverdue) overdueCount += 1;
      if (state.isDueThisWeek) dueThisWeekCount += 1;
    }
  });

  const totalPaidAllTime = myCustomers.reduce((sum, customer) => sum + customerTotals(customer).totalPaid, 0);
  const agentCollectedThisMonth = data.agents.reduce((sum, agent) => sum + (agent.payments || []).filter((p) => sameMonth(p.date, monthKey)).reduce((s, p) => s + amount(p.amount), 0), 0);
  const agentMonthTotals = data.agents.map((agent) => agentReports(agent)
    .filter((entry) => entry.reportMonth === monthKey)
    .reduce((sum, entry) => sum + amount(entry.renewals) + amount(entry.newRd) + amount(entry.newFd), 0));
  const teamReportedCount = agentMonthTotals.filter((total) => total > 0).length;
  const teamReportedTotal = agentMonthTotals.reduce((sum, total) => sum + total, 0);

  return (
    <div className="px-4 py-5 lg:px-0 lg:py-6">
      <section className="mb-5 rounded-3xl bg-[#111827] p-5 text-white shadow-sm lg:p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm text-white/65">Good to see you</div>
            <div className="mt-1 font-serif text-3xl leading-tight" style={{ fontFamily: "'Fraunces', serif" }}>{self.name}</div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <RankBadge rank={self.rank} size="sm" />
              <span className="rounded-full bg-white/10 px-2.5 py-1 text-xs font-mono text-white/80">ID {self.agentIdNumber}</span>
            </div>
          </div>
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-lg font-bold text-[#111827]">
            {self.name.trim()[0]?.toUpperCase() || "A"}
          </div>
        </div>
        <div className="mt-5 grid grid-cols-2 gap-3 text-sm lg:grid-cols-4">
          <div><div className="text-white/55">Customers</div><div className="font-mono text-lg font-bold">{myCustomers.length}</div></div>
          <div><div className="text-white/55">Agents</div><div className="font-mono text-lg font-bold">{data.agents.length}</div></div>
          <div><div className="text-white/55">Collected</div><div className="font-mono text-lg font-bold">{fmtMoney(collected + agentCollectedThisMonth)}</div></div>
          <div><div className="text-white/55">Team reports</div><div className="font-mono text-lg font-bold">{fmtMoney(teamReportedTotal)}</div></div>
        </div>
      </section>

      <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">This month</div>
      <div className="mb-3 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatCard label="Collected" value={fmtMoney(collected + agentCollectedThisMonth)} sub="direct RD + FD" accent="#111827" icon={<TrendingUp size={14} className="text-[#111827]" />} onClick={() => go("customers", { title: "Paid this month", filter: { type: "paidThisMonth" } })} />
        <StatCard label="Due" value={fmtMoney(dueThisMonthAmt)} sub="expected" accent="#374151" icon={<Wallet size={14} className="text-[#374151]" />} onClick={() => go("customers", { title: "Due this month", filter: { type: "dueThisMonth" } })} />
        <StatCard label="Overdue" value={overdueCount} sub="customers behind" accent="#111827" icon={<AlertTriangle size={14} className="text-[#111827]" />} onClick={() => go("customers", { title: "Overdue", filter: { type: "overdue" } })} />
        <StatCard label="Due week" value={dueThisWeekCount} sub="customers" accent="#374151" icon={<CalendarClock size={14} className="text-[#374151]" />} onClick={() => go("customers", { title: "Due this week", filter: { type: "dueWeek" } })} />
      </div>

      <div className="mb-5 grid grid-cols-2 gap-3">
        <button onClick={() => go("addCustomer")} className="soft-transition flex items-center justify-center gap-2 rounded-xl bg-[#111827] py-3 text-sm font-semibold text-white shadow-sm hover:-translate-y-0.5 hover:shadow-md active:scale-[0.98]">
          <Plus size={17} /> Add customer
        </button>
        {canAddAgents && (
          <button onClick={() => go("addAgent")} className="soft-transition flex items-center justify-center gap-2 rounded-xl border border-[#D1D5DB] bg-white py-3 text-sm font-semibold text-[#111827] hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md active:scale-[0.98]">
            <UserPlus size={17} /> Add agent
          </button>
        )}
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <button onClick={() => go("customers", { title: "Customers" })} className="soft-transition card flex w-full items-center gap-4 p-4 text-left hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6]"><Users size={20} className="text-[#374151]" /></div>
          <div className="min-w-0 flex-1">
            <div className="font-semibold text-[#000000]">Customers</div>
            <div className="mt-0.5 truncate text-xs text-[#6B7280]">{myCustomers.length} customers - {fmtMoney(dueThisMonthAmt)} to collect this month - {fmtMoney(totalPaidAllTime)} collected</div>
          </div>
          <ChevronRight size={18} className="shrink-0 text-[#9CA3AF]" />
        </button>

        {data.agents.length > 0 && (
          <button onClick={() => go("teams")} className="soft-transition card flex w-full items-center gap-4 p-4 text-left hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#F3F4F6]"><ShieldCheck size={20} className="text-[#374151]" /></div>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-[#000000]">Team reports</div>
              <div className="mt-0.5 truncate text-xs text-[#6B7280]">{data.agents.length} agents - {teamReportedCount} reported - {fmtMoney(teamReportedTotal)} this month</div>
            </div>
            <ChevronRight size={18} className="shrink-0 text-[#9CA3AF]" />
          </button>
        )}
      </div>
    </div>
  );
}