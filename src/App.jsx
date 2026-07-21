import React, { useState } from "react";
import {
  FileSpreadsheet,
  Home as HomeIcon,
  PiggyBank,
  Settings as SettingsIcon,
  ShieldCheck,
  Users,
} from "lucide-react";

import { useCloudStore } from "./lib/useCloudStore";
import { RANK_ORDER } from "./lib/constants";

import { CloudAuthScreen } from "./screens/CloudAuthScreen";
import { HomeView } from "./screens/HomeView";
import { AddCustomerView } from "./screens/AddCustomerView";
import { CustomersView } from "./screens/CustomersView";
import { CustomerDetailView } from "./screens/CustomerDetailView";
import { AddAgentView } from "./screens/AddAgentView";
import { TeamsView } from "./screens/TeamsView";
import { AgentDetailView } from "./screens/AgentDetailView";
import { ReportsView } from "./screens/ReportsView";
import { SettingsView } from "./screens/SettingsView";

export default function CollectionLedgerApp() {
  const { authUser, profile, data, update, loaded, createTeam, joinTeam, logIn, logOut, resetPassword } = useCloudStore();
  const [view, setView] = useState({ name: "home" });
  const [toast, setToast] = useState(null);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(null), 2200);
  };
  const go = (name, params = {}) => setView({ name, params });
  const back = () => setView({ name: "home" });

  // Still figuring out whether we're logged in at all
  if (authUser === undefined) {
    return <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-[#6B7280] text-sm">Loading your ledger...</div>;
  }

  // Not logged in — show sign in / create team / join team
  if (!authUser) {
    return <CloudAuthScreen createTeam={createTeam} logIn={logIn} resetPassword={resetPassword} />;
  }

  // Logged in, but still fetching profile/team data from Firestore
  if (!loaded || !profile) {
    return <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center text-[#6B7280] text-sm">Setting up your team...</div>;
  }

  const self = profile.role === "self" ? data.self : data.agents.find((a) => a.id === profile.memberId);

  if (!self) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex flex-col items-center justify-center gap-3 text-[#6B7280] text-sm px-6 text-center">
        <p>We couldn't find your profile in this team's data. Try logging out and back in.</p>
        <button onClick={logOut} className="rounded-xl bg-[#111827] px-4 py-2 text-sm font-semibold text-white">Log out</button>
      </div>
    );
  }

  const myCustomers = data.customers.filter((customer) => customer.agentId === self.id);
  const canAddAgents = RANK_ORDER[self.rank] >= 2;

  const navItems = [
    { key: "home", icon: HomeIcon, label: "Home" },
    { key: "customers", icon: Users, label: "Customers", params: { title: "Customers" } },
    ...(data.agents.length > 0 ? [{ key: "teams", icon: ShieldCheck, label: "Team" }] : []),
    { key: "reports", icon: FileSpreadsheet, label: "Reports" },
    { key: "settings", icon: SettingsIcon, label: "Settings" },
  ];

  const activeFor = (key) => (
    view.name === key
    || (key === "customers" && view.name === "customerDetail")
    || (key === "teams" && view.name === "agentDetail")
  );

  return (
    <div className="min-h-screen bg-[#F6F7F9] text-[#111827]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .font-mono { font-family: 'IBM Plex Mono', monospace; }
      `}</style>

      <div className="mx-auto flex min-h-screen w-full max-w-[1440px]">
        <aside className="hidden w-[260px] shrink-0 border-r border-[#E5E7EB] bg-white/95 px-4 py-5 lg:flex lg:flex-col">
          <div className="mb-7 flex items-center gap-3 px-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#111827] text-white">
              <PiggyBank size={21} />
            </div>
            <div>
              <div className="font-serif text-lg leading-5" style={{ fontFamily: "'Fraunces', serif" }}>Ledger</div>
              <div className="text-xs text-[#6B7280]">Collection workspace</div>
            </div>
          </div>

          <nav className="grid gap-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = activeFor(item.key);
              return (
                <button key={item.key} onClick={() => go(item.key, item.params || {})} className={`soft-transition flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-semibold ${active ? "bg-[#111827] text-white shadow-sm" : "text-[#374151] hover:bg-[#F3F4F6]"}`}>
                  <Icon size={18} />
                  <span>{item.label}</span>
                </button>
              );
            })}
          </nav>

          <div className="mt-auto rounded-2xl bg-[#F8FAFC] p-3">
            <div className="truncate text-sm font-semibold text-[#111827]">{self.name}</div>
            <div className="mt-0.5 truncate text-xs text-[#6B7280] font-mono">ID {self.agentIdNumber}</div>
          </div>
        </aside>

        <main className="app-scroll flex-1 overflow-y-auto pb-24 lg:pb-0">
          <div className="mx-auto min-h-screen w-full max-w-[980px] lg:px-6">
            {view.name === "home" && <HomeView data={data} self={self} myCustomers={myCustomers} canAddAgents={canAddAgents} go={go} />}
            {view.name === "addCustomer" && <AddCustomerView data={data} self={self} update={update} onDone={() => { showToast("Customer added"); go("home"); }} onCancel={back} />}
            {view.name === "customers" && <CustomersView data={data} update={update} showToast={showToast} customers={view.params.agentId ? data.customers.filter((customer) => customer.agentId === view.params.agentId) : myCustomers} self={self} initialFilter={view.params.filter} title={view.params.title} go={go} back={back} />}
            {view.name === "customerDetail" && <CustomerDetailView data={data} update={update} customerId={view.params.id} go={go} back={() => go(view.params.from || "customers", view.params.fromParams)} showToast={showToast} />}
            {view.name === "addAgent" && <AddAgentView self={self} update={update} onDone={() => { showToast("Agent added"); go("home"); }} onCancel={back} />}
            {view.name === "teams" && <TeamsView data={data} update={update} go={go} back={back} showToast={showToast} />}
            {view.name === "agentDetail" && <AgentDetailView data={data} update={update} agentId={view.params.id} back={() => go("teams")} showToast={showToast} />}
            {view.name === "reports" && <ReportsView data={data} self={self} />}
            {view.name === "settings" && <SettingsView data={data} update={update} showToast={showToast} onLock={logOut} />}
          </div>
        </main>
      </div>

      {toast && (
        <div className="fixed bottom-24 left-1/2 z-50 -translate-x-1/2 rounded-full bg-[#111827] px-4 py-2.5 text-sm font-semibold text-white shadow-lg lg:bottom-6">{toast}</div>
      )}

      <nav className="fixed bottom-0 left-0 right-0 z-30 flex items-stretch border-t border-[#E5E7EB] bg-white/95 backdrop-blur lg:hidden">
        {navItems.map((item) => {
          const active = activeFor(item.key);
          const Icon = item.icon;
          return (
            <button key={item.key} onClick={() => go(item.key, item.params || {})} className="soft-transition flex-1 flex flex-col items-center gap-0.5 py-2.5">
              <Icon size={20} color={active ? "#111827" : "#6B7280"} />
              <span className="text-[10px] font-semibold" style={{ color: active ? "#111827" : "#6B7280" }}>{item.label}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}