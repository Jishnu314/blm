import React, { useState } from "react";
import { ChevronLeft, ChevronRight, FileSpreadsheet } from "lucide-react";
import { TopBar } from "../components/TopBar";
import { RankBadge } from "../components/RankBadge";
import { EmptyState } from "../components/EmptyState";
import { todayISO, sameMonth, fmtMoney, fmtDate, fmtMonthYear, shiftMonthKey, customerTotals, addMonths } from "../lib/helpers";

// Map an agent-fund payment type to the same FD/RD/Renewal buckets used for customer transactions
const FUND_CATEGORY = { "New FD": "FD", "New RD": "RD", Renewal: "Renewal" };
const monthShort = (d) => new Date(d).toLocaleDateString("en-IN", { month: "short" });
const monthShortWithYear = (d) => new Date(d).toLocaleDateString("en-IN", { month: "short", year: "2-digit" });

export function ReportsView({ data, self }) {
  const [monthKey, setMonthKey] = useState(todayISO().slice(0, 7));
  const allAgents = [{ id: self.id, name: self.name, rank: self.rank }, ...data.agents];

  // Customer-linked transactions (deposits / RD installments) for the selected month
  const rows = [];
  data.customers.forEach((c) => {
    if (c.schemeType === "FD") {
      if (sameMonth(c.depositDate, monthKey)) {
        rows.push({ customerId: c.id, customer: c.name, agentId: c.agentId, scheme: c.schemeName, type: "FD", category: "FD", amount: c.amount, date: c.depositDate, source: "customer" });
      }
    } else {
      (c.paidMonths || []).filter((p) => sameMonth(p.date, monthKey)).forEach((p) => {
        rows.push({ customerId: c.id, customer: c.name, agentId: c.agentId, scheme: c.schemeName, type: p.advance ? "RD Advance" : "RD", category: "RD", amount: p.amount, date: p.date, index: p.index, source: "customer" });
      });
    }
  });

  // Agent-level "fund" payments (Renewal / New FD / New RD) recorded directly on the agent, not tied to a customer
  data.agents.forEach((a) => {
    (a.payments || []).filter((p) => sameMonth(p.date, monthKey)).forEach((p) => {
      rows.push({ customerId: null, customer: null, agentId: a.id, scheme: null, type: p.type, category: FUND_CATEGORY[p.type] || "Renewal", amount: Number(p.amount || 0), date: p.date, source: "agent" });
    });
  });

  const fdRows = rows.filter((r) => r.category === "FD");
  const rdRows = rows.filter((r) => r.category === "RD");
  const renewalRows = rows.filter((r) => r.category === "Renewal");
  const fdTotal = fdRows.reduce((s, r) => s + r.amount, 0);
  const collected = rdRows.reduce((s, r) => s + r.amount, 0);
  const renewalTotal = renewalRows.reduce((s, r) => s + r.amount, 0);
  const agentFundRows = rows.filter((r) => r.source === "agent");
  const grandTotal = fdTotal + collected + renewalTotal;

  const agentLabel = (agentId) => (agentId === self.id ? "You" : allAgents.find((a) => a.id === agentId)?.name || "—");
  const nameList = (categoryRows) => {
    const seen = new Set();
    const names = [];
    categoryRows.forEach((r) => {
      if (r.customerId) {
        const key = "c:" + r.customerId;
        if (seen.has(key)) return;
        seen.add(key);
        names.push(`${r.customer} (${agentLabel(r.agentId)})`);
      } else {
        // Agent-level fund entry (New FD / New RD recorded directly on the agent, no customer attached)
        const key = "a:" + r.agentId;
        if (seen.has(key)) return;
        seen.add(key);
        const agent = allAgents.find((a) => a.id === r.agentId);
        names.push(`${agentLabel(r.agentId)} (${agent?.rank || "—"})`);
      }
    });
    return names;
  };
  const fdNames = nameList(fdRows);
  const rdNames = nameList(rdRows);

  // Group customer-linked rows by customer, so a customer who paid several months at once
  // (e.g. current + advance months) shows as ONE line: name, scheme, months covered, amount, total
  const customerGroups = (() => {
    const byCustomer = {};
    rows.filter((r) => r.source === "customer").forEach((r) => {
      if (!byCustomer[r.customerId]) byCustomer[r.customerId] = [];
      byCustomer[r.customerId].push(r);
    });
    return Object.values(byCustomer).map((entries) => {
      const customer = data.customers.find((c) => c.id === entries[0].customerId);
      const dueDates = entries
        .map((e) => (e.index != null ? addMonths(customer.joinedOn, e.index) : new Date(e.date)))
        .sort((a, b) => a - b);
      const spansMultipleYears = new Set(dueDates.map((d) => d.getFullYear())).size > 1;
      const months = dueDates.map(spansMultipleYears ? monthShortWithYear : monthShort);
      const total = entries.reduce((s, e) => s + e.amount, 0);
      const perAmount = customer?.amount ?? entries[0].amount;
      const latestDate = entries.reduce((max, e) => (new Date(e.date) > new Date(max) ? e.date : max), entries[0].date);
      return {
        customerId: entries[0].customerId,
        name: entries[0].customer,
        scheme: `${entries[0].scheme} (${entries[0].category})`,
        category: entries[0].category,
        months,
        amount: perAmount,
        total,
        date: latestDate,
        agentId: entries[0].agentId,
      };
    }).sort((a, b) => new Date(a.date) - new Date(b.date));
  })();

  // All-time totals per agent, split by category — combines customer transactions + agent fund payments
  const agentAllTimeTotals = (agentId) => {
    const custs = data.customers.filter((c) => c.agentId === agentId);
    const custFd = custs.filter((c) => c.schemeType === "FD").reduce((s, c) => s + customerTotals(c).totalPaid, 0);
    const custRd = custs.filter((c) => c.schemeType !== "FD").reduce((s, c) => s + customerTotals(c).totalPaid, 0);
    const agent = data.agents.find((a) => a.id === agentId);
    const payments = agent?.payments || [];
    const fundFd = payments.filter((p) => p.type === "New FD").reduce((s, p) => s + Number(p.amount || 0), 0);
    const fundRd = payments.filter((p) => p.type === "New RD").reduce((s, p) => s + Number(p.amount || 0), 0);
    const fundRenewal = payments.filter((p) => p.type === "Renewal").reduce((s, p) => s + Number(p.amount || 0), 0);
    return { fd: custFd + fundFd, rd: custRd + fundRd, renewal: fundRenewal };
  };

  const byAgent = allAgents.map((a) => {
    const agentRows = rows.filter((r) => r.agentId === a.id);
    const fd = agentRows.filter((r) => r.category === "FD").reduce((s, r) => s + r.amount, 0);
    const rd = agentRows.filter((r) => r.category === "RD").reduce((s, r) => s + r.amount, 0);
    const renewal = agentRows.filter((r) => r.category === "Renewal").reduce((s, r) => s + r.amount, 0);
    return { agent: a, fd, rd, renewal, total: fd + rd + renewal };
  }).filter((x) => x.total > 0 || data.customers.some((c) => c.agentId === x.agent.id));

  const exportExcel = async () => {
    const XLSX = await import("xlsx");
    const wb = XLSX.utils.book_new();
    // --- Customers sheet: name, scheme, month, cash, total (grouped, one row per customer) ---
    const customerRows = [
      ["Customer", "Scheme", "Month", "Cash", "Total"],
      ...customerGroups.map((g) => [g.name, g.scheme, g.months.join(", "), g.amount, g.total]),
    ];
    const wsCustomers = XLSX.utils.aoa_to_sheet(customerRows);
    XLSX.utils.book_append_sheet(wb, wsCustomers, "Customers");

    // --- Agents sheet: name, mode, cash, total (includes agent fund payments) + grand total footer ---
    const agentRows = [["Agent", "Mode", "Cash", "Total"]];
    byAgent.forEach((x) => {
      const allTime = agentAllTimeTotals(x.agent.id);
      const label = x.agent.id === self.id ? "Self" : x.agent.name;
      if (x.fd > 0) agentRows.push([label, "FD", x.fd, allTime.fd]);
      if (x.rd > 0) agentRows.push([label, "RD", x.rd, allTime.rd]);
      if (x.renewal > 0) agentRows.push([label, "Renewal", x.renewal, allTime.renewal]);
    });
    agentRows.push([]);
    agentRows.push(["", "", "Grand total", grandTotal]);
    const wsAgents = XLSX.utils.aoa_to_sheet(agentRows);
    XLSX.utils.book_append_sheet(wb, wsAgents, "Agents");

    XLSX.writeFile(wb, `report-${monthKey}.xlsx`);
  };

  return (
    <div>
      <TopBar title="Reports" />
      <div className="px-4 py-4">
        <div className="flex items-center justify-between bg-white rounded-2xl border border-[#E5E7EB] p-3 mb-4">
          <button onClick={() => setMonthKey((m) => shiftMonthKey(m, -1))} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F3F4F6]"><ChevronLeft size={18} className="text-[#000000]" /></button>
          <span className="font-serif text-base text-[#000000]" style={{ fontFamily: "'Fraunces', serif" }}>{fmtMonthYear(monthKey + "-01")}</span>
          <button onClick={() => setMonthKey((m) => shiftMonthKey(m, 1))} className="w-9 h-9 rounded-full flex items-center justify-center hover:bg-[#F3F4F6]"><ChevronRight size={18} className="text-[#000000]" /></button>
        </div>

        {/* Single consolidated summary card */}
        <div className="bg-white rounded-2xl border border-[#E5E7EB] p-4 mb-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Total customers</div>
              <div className="font-mono text-2xl font-bold text-[#000000]">{data.customers.length}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Total agents</div>
              <div className="font-mono text-2xl font-bold text-[#000000]">{data.agents.length}</div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4 mt-4 pt-4 border-t border-[#F3F4F6]">
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">New FD (team)</div>
              <div className="font-mono text-xl font-bold text-[#000000]">{fmtMoney(fdTotal)}</div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">{fdNames.length > 0 ? fdNames.join(", ") : "No customers yet"}</div>
            </div>
            <div>
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">New RD (team)</div>
              <div className="font-mono text-xl font-bold text-[#000000]">{fmtMoney(collected)}</div>
              <div className="text-[11px] text-[#6B7280] mt-0.5">{rdNames.length > 0 ? rdNames.join(", ") : "No customers yet"}</div>
            </div>
          </div>

          {renewalTotal > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
              <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">Renewals (agent fund)</span>
              <span className="font-mono text-sm font-bold text-[#000000]">{fmtMoney(renewalTotal)}</span>
            </div>
          )}

          {byAgent.length > 0 && (
            <div className="mt-4 pt-4 border-t border-[#F3F4F6]">
              <div className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold mb-2">By agent</div>
              <div className="divide-y divide-[#F3F4F6]">
                {byAgent.map((x) => (
                  <div key={x.agent.id} className="flex items-center justify-between py-2 text-sm">
                    <span className="flex items-center gap-2 text-[#000000]">{x.agent.id === self.id ? "Self" : x.agent.name} <RankBadge rank={x.agent.rank} size="sm" /></span>
                    <span className="flex items-center gap-3 font-mono text-[#000000]">
                      <span className="text-[11px] text-[#6B7280]">FD {fmtMoney(x.fd)}</span>
                      <span className="text-[11px] text-[#6B7280]">RD {fmtMoney(x.rd)}</span>
                      <span className="text-[11px] text-[#6B7280]">Renewal {fmtMoney(x.renewal)}</span>
                      <span className="font-semibold">{fmtMoney(x.total)}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="mt-4 pt-4 border-t border-[#F3F4F6] flex items-center justify-between">
            <span className="text-sm font-semibold text-[#6B7280]">Grand total</span>
            <span className="font-mono text-2xl font-bold text-[#000000]">{fmtMoney(grandTotal)}</span>
          </div>
        </div>

        <div className="text-xs uppercase tracking-wider text-[#6B7280] font-semibold mb-2">Transactions this month</div>
        {customerGroups.length === 0 && agentFundRows.length === 0 ? (
          <EmptyState icon={<FileSpreadsheet size={20} />} title="No transactions" sub="No payments recorded for this month yet." />
        ) : (
          <div className="bg-white rounded-2xl border border-[#E5E7EB] divide-y divide-[#F3F4F6] mb-4">
            {customerGroups.map((g) => (
              <div key={g.customerId} className="flex items-center justify-between px-4 py-2.5 text-sm">
                <div>
                  <div className="text-[#000000]">{g.name}</div>
                  <div className="text-[11px] text-[#6B7280]">
                    {g.scheme} · {g.months.join(", ")} · {fmtMoney(g.amount)}{g.category !== "FD" && "/mo"}
                  </div>
                </div>
                <span className="font-mono font-semibold text-[#000000]">{fmtMoney(g.total)}</span>
              </div>
            ))}
            {agentFundRows.map((r, i) => {
              const agent = allAgents.find((a) => a.id === r.agentId);
              return (
                <div key={"fund-" + i} className="flex items-center justify-between px-4 py-2.5 text-sm">
                  <div>
                    <div className="text-[#000000] flex items-center gap-2">{r.agentId === self.id ? "You" : agent?.name || "Agent"} <RankBadge rank={agent?.rank} size="sm" /></div>
                    <div className="text-[11px] text-[#6B7280]">{r.type} · {fmtDate(r.date)}</div>
                  </div>
                  <span className="font-mono font-semibold text-[#000000]">{fmtMoney(r.amount)}</span>
                </div>
              );
            })}
          </div>
        )}

        <button onClick={exportExcel} className="w-full py-3 rounded-xl bg-[#111827] text-white font-semibold flex items-center justify-center gap-2">
          <FileSpreadsheet size={16} /> Export this month as Excel
        </button>
      </div>
    </div>
  );
}
