import React, { useState } from "react";
import { Search, Users } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { EmptyState } from "../components/EmptyState";
import { todayISO, sameMonth, computeMonthlyState, daysBetween, maturityDate, addMonths } from "../lib/helpers";
import { MODE_LABEL, inputCls } from "../lib/constants";

const STATUS_BTN = {
  overdue: { bg: "#FEE2E2", fg: "#B91C1C" },
  "due-soon": { bg: "#FEF3C7", fg: "#B45309" },
  advance: { bg: "#DBEAFE", fg: "#1D4ED8" },
  paid: { bg: "#DCFCE7", fg: "#15803D" },
  completed: { bg: "#F3F4F6", fg: "#6B7280" },
  fd: { bg: "#F3F4F6", fg: "#374151" },
};

export function CustomersView({ update, showToast, customers, initialFilter, title, go, back }) {
  const [search, setSearch] = useState("");
  const [chip, setChip] = useState("All");
  const [sort, setSort] = useState("Most overdue");
  const today = new Date();
  const monthKey = todayISO().slice(0, 7);

  const markPaid = (customer, event) => {
    event.stopPropagation();
    const state = computeMonthlyState(customer);
    if (state.completed) return;
    const paidByIndex = {};
    (customer.paidMonths || []).forEach((payment) => (paidByIndex[payment.index] = payment));
    let idx = 0;
    while (paidByIndex[idx]) idx++;
    if (idx >= (customer.termMonths || 12)) return;
    const due = addMonths(customer.joinedOn, idx);
    const entry = { index: idx, amount: customer.amount, date: todayISO(), advance: due > new Date() };
    update((d) => ({
      ...d,
      customers: d.customers.map((c) =>
        c.id === customer.id ? { ...c, paidMonths: [...(c.paidMonths || []), entry] } : c
      ),
    }));
    showToast("Marked as paid");
  };

  const decorated = customers.map((customer) => {
    const state = customer.schemeType === "Monthly" ? computeMonthlyState(customer, today) : null;
    return { customer, state };
  });

  let filtered = decorated.filter(({ customer, state }) => {
    const query = search.toLowerCase();
    if (query && !(customer.name.toLowerCase().includes(query) || (customer.phone || "").includes(query))) return false;
    if (chip === "Monthly" && customer.schemeType !== "Monthly") return false;
    if (chip === "Fixed deposit" && customer.schemeType !== "FD") return false;
    if (chip === "Overdue" && !(state && state.isOverdue)) return false;
    if (chip === "Due this week" && !(state && state.isDueThisWeek)) return false;
    return true;
  });

  if (initialFilter) {
    filtered = filtered.filter(({ customer, state }) => {
      if (initialFilter.type === "paidThisMonth") {
        if (customer.schemeType === "FD") return sameMonth(customer.depositDate, monthKey);
        return (customer.paidMonths || []).some((payment) => sameMonth(payment.date, monthKey));
      }
      if (initialFilter.type === "dueThisMonth") return state && !state.completed && (sameMonth(new Date(state.nextDue).toISOString(), monthKey) || state.isOverdue);
      if (initialFilter.type === "overdue") return state && state.isOverdue;
      if (initialFilter.type === "dueWeek") return state && state.isDueThisWeek;
      return true;
    });
  }

  filtered.sort((a, b) => {
    if (sort === "Name A-Z") return a.customer.name.localeCompare(b.customer.name);
    if (sort === "Recently added") return new Date(b.customer.createdAt) - new Date(a.customer.createdAt);
    return (b.state?.overdueCount || 0) - (a.state?.overdueCount || 0);
  });

  const statusFor = (customer, state) => {
    if (customer.schemeType === "FD") return { key: "fd", label: `${daysBetween(today, maturityDate(customer))}d to maturity` };
    if (state.completed) return { key: "completed", label: "Completed" };
    if (state.isOverdue) return { key: "overdue", label: `${state.overdueCount}mo overdue` };
    if (state.isDueThisWeek) return { key: "due-soon", label: "Due this week" };
    if (state.advanceCount > 0) return { key: "advance", label: `${state.advanceCount}mo advance` };
    return { key: "paid", label: "Up to date" };
  };

  return (
    <div className="lg:pb-8">
      <TopBar title={title || "Customers"} onBack={back} />
      <div className="px-4 pt-3 lg:px-0 lg:pt-5">
        <div className="card mb-4 p-3">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9CA3AF]" />
            <input className={`${inputCls} pl-9`} placeholder="Search by name or phone" value={search} onChange={(event) => setSearch(event.target.value)} />
          </div>
          <div className="mt-3 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="no-scrollbar flex gap-2 overflow-x-auto pb-1">
              {["All", "Monthly", "Fixed deposit", "Overdue", "Due this week"].map((filter) => (
                <button key={filter} onClick={() => setChip(filter)} className={`soft-transition whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-semibold ${chip === filter ? "bg-[#111827] text-white border-[#111827]" : "bg-white text-[#374151] border-[#D1D5DB] hover:border-[#9CA3AF]"}`}>{filter}</button>
              ))}
            </div>
            <select className="soft-transition rounded-lg border border-[#D1D5DB] bg-white px-2 py-1.5 text-xs font-semibold text-[#374151] outline-none focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10" value={sort} onChange={(event) => setSort(event.target.value)}>
              {["Most overdue", "Name A-Z", "Recently added"].map((item) => <option key={item}>{item}</option>)}
            </select>
          </div>
        </div>

        {filtered.length === 0 && <EmptyState icon={<Users size={22} />} title="No customers found" sub="Try a different search or filter, or add a new customer from Home." />}

        <div className="grid gap-2 pb-4 lg:grid-cols-2">
          {filtered.map(({ customer, state }) => {
            const status = statusFor(customer, state);
            const style = STATUS_BTN[status.key];
            const canMarkPaid = customer.schemeType === "Monthly" && !state.completed;
            return (
              <button key={customer.id} onClick={() => go("customerDetail", { id: customer.id, from: "customers" })} className="soft-transition card flex w-full items-center gap-3 p-3.5 text-left hover:-translate-y-0.5 hover:shadow-md active:scale-[0.99]">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F3F4F6] font-semibold text-[#374151]">{customer.name[0]?.toUpperCase()}</div>
                <div className="min-w-0 flex-1">
                  <div className="truncate font-semibold text-[#000000]">{customer.name}</div>
                  <div className="mt-0.5 text-xs text-[#6B7280]">{customer.schemeName} - {customer.schemeType === "FD" ? "Fixed deposit" : MODE_LABEL[customer.mode]}</div>
                </div>
                {canMarkPaid ? (
                  <span
                    role="button"
                    onClick={(event) => markPaid(customer, event)}
                    className="soft-transition shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold active:scale-95"
                    style={{ background: style.bg, color: style.fg }}
                  >
                    {status.label}
                  </span>
                ) : (
                  <span className="shrink-0 rounded-full px-3 py-1.5 text-[11px] font-semibold" style={{ background: style.bg, color: style.fg }}>
                    {status.label}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}