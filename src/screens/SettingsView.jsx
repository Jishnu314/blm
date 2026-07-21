import React, { useState } from "react";
import { TopBar } from "../components/TopBar";
import { Field } from "../components/Field";
import { StatCard } from "../components/StatCard";
import { RankBadge } from "../components/RankBadge";
import { createAuthRecord, isValidPin, verifyPassword } from "../lib/auth";
import { RANKS, RANK_ORDER, RANK_BELOW, inputCls } from "../lib/constants";
import { Eye, EyeOff, LockKeyhole, LogOut, Trash2 } from "lucide-react";
import { TwoTapButton } from "../components/TwoTapButton";

export function SettingsView({ data, update, showToast, onLock }) {
  const self = data.self;
  const [name, setName] = useState(self.name);
  const [agentIdNumber, setAgentIdNumber] = useState(self.agentIdNumber);
  const [rank, setRank] = useState(self.rank);
  const [currentPin, setCurrentPin] = useState("");
  const [newPin, setNewPin] = useState("");
  const [newPin2, setNewPin2] = useState("");
  const [recoveryHint, setRecoveryHint] = useState(self.auth?.recoveryHint || "");
  const [showPins, setShowPins] = useState(false);
  const [securityError, setSecurityError] = useState("");
  const [savingSecurity, setSavingSecurity] = useState(false);

  const saveProfile = () => {
    update((d) => ({ ...d, self: { ...d.self, name, agentIdNumber, rank } }));
    showToast("Profile updated");
  };

  const deleteAgent = (agentId) => {
    update((d) => ({ ...d, agents: d.agents.filter((a) => a.id !== agentId) }));
    showToast("Agent removed");
  };
  
  const saveSecurity = async () => {
    setSecurityError("");
    const oldOk = self.auth?.passwordHash ? await verifyPassword(self.auth, currentPin) : currentPin === self.pin;
    if (!oldOk) {
      setSecurityError("Current PIN is incorrect.");
      return;
    }
    if (!isValidPin(newPin) || newPin !== newPin2) {
      setSecurityError("Use a 6-digit PIN and make sure both PINs match.");
      return;
    }
    setSavingSecurity(true);
    const auth = await createAuthRecord({
      username: self.auth?.username || agentIdNumber.toLowerCase(),
      pin: newPin,
      recoveryHint,
    });
    update((d) => {
      const nextSelf = { ...d.self };
      delete nextSelf.pin;
      return { ...d, self: { ...nextSelf, auth } };
    });
    setCurrentPin("");
    setNewPin("");
    setNewPin2("");
    setSavingSecurity(false);
    showToast("PIN updated");
  };

  return (
    <div className="lg:pb-8">
      <TopBar title="Settings" />
      <div className="px-4 py-4 lg:px-0 lg:py-5">
        <div className="grid gap-4 lg:grid-cols-[1fr_360px]">
          <div>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Your profile</div>
            <div className="card mb-4 p-4">
              <Field label="Name"><input className={inputCls} value={name} onChange={(event) => setName(event.target.value)} /></Field>
              <Field label="Agent ID"><input className={inputCls} value={agentIdNumber} onChange={(event) => setAgentIdNumber(event.target.value)} /></Field>
              <Field label="Rank">
                <div className="grid grid-cols-4 gap-2">
                  {RANKS.map((item) => (
                    <button key={item} onClick={() => setRank(item)} className={`soft-transition rounded-xl border py-2 text-sm font-semibold ${rank === item ? "border-[#111827] bg-[#111827] text-white" : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#9CA3AF]"}`}>{item}</button>
                  ))}
                </div>
                {rank !== self.rank && (
                  <div className="mt-2 rounded-xl bg-[#F3F4F6] px-3 py-2 text-xs text-[#374151]">
                    {RANK_ORDER[rank] >= 2 ? `Moving to ${rank} unlocks recruiting junior agents (${RANK_BELOW[rank]} and below).` : `Moving to ${rank} disables adding new agents; your existing team stays intact.`}
                  </div>
                )}
              </Field>
              <button onClick={saveProfile} className="soft-transition w-full rounded-xl bg-[#111827] py-2.5 text-sm font-semibold text-white hover:shadow-md">Save changes</button>
            </div>

            {data.agents.length > 0 && (
              <>
                <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Team rank management</div>
                <div className="card mb-4 divide-y divide-[#F3F4F6] overflow-hidden">
                  {data.agents.map((agent) => (
                    <div key={agent.id} className="p-3.5">
                      <div className="mb-2 flex items-center justify-between">
                        <span className="text-sm font-semibold text-[#000000]">{agent.name}</span>
                        <RankBadge rank={agent.rank} size="sm" />
                      </div>
                      <div className="grid grid-cols-4 gap-1.5 mb-2">
                        {RANKS.map((item) => (
                          <button key={item} onClick={() => update((d) => ({ ...d, agents: d.agents.map((agentItem) => agentItem.id === agent.id ? { ...agentItem, rank: item } : agentItem) }))} className={`soft-transition rounded-lg border py-1.5 text-xs font-semibold ${agent.rank === item ? "border-[#111827] bg-[#111827] text-white" : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#9CA3AF]"}`}>{item}</button>
                        ))}
                      </div>
                      <TwoTapButton
                        onConfirm={() => deleteAgent(agent.id)}
                        label="Delete agent"
                        confirmLabel="Tap again to delete permanently"
                        icon={<Trash2 size={13} />}
                        className="w-full py-2 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 bg-[#FEE2E2] text-[#B91C1C]"
                      />
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>

          <aside>
            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Login security</div>
            <div className="card mb-4 p-4">
              <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#F3F4F6] px-3.5 py-3 text-sm text-[#374151]">
                <LockKeyhole size={18} className="mt-0.5 text-[#111827]" />
                <div>
                  <div className="font-semibold text-[#111827]">Username: {self.auth?.username || self.agentIdNumber}</div>
                  <div className="mt-0.5 text-xs text-[#6B7280]">{self.auth?.passwordHash ? "Secure PIN login is active." : "Legacy 4-digit PIN login is active."}</div>
                </div>
              </div>
              <Field label={self.auth?.passwordHash ? "Current PIN" : "Current 4-digit PIN"}>
                <input className={`${inputCls} tracking-[0.4em]`} type={showPins ? "text" : "password"} inputMode="numeric" maxLength={self.auth?.passwordHash ? 6 : 4} value={currentPin} onChange={(event) => setCurrentPin(event.target.value.replace(/\D/g, ""))} />
              </Field>
              <Field label="New 6-digit PIN">
                <div className="relative">
                  <input className={`${inputCls} pr-12 tracking-[0.4em]`} type={showPins ? "text" : "password"} inputMode="numeric" maxLength={6} value={newPin} onChange={(event) => setNewPin(event.target.value.replace(/\D/g, ""))} />
                  <button type="button" onClick={() => setShowPins((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]" aria-label={showPins ? "Hide PINs" : "Show PINs"}>
                    {showPins ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </Field>
              <Field label="Confirm new PIN"><input className={`${inputCls} tracking-[0.4em]`} type={showPins ? "text" : "password"} inputMode="numeric" maxLength={6} value={newPin2} onChange={(event) => setNewPin2(event.target.value.replace(/\D/g, ""))} /></Field>
              <Field label="Recovery hint"><input className={inputCls} value={recoveryHint} onChange={(event) => setRecoveryHint(event.target.value)} placeholder="Optional clue" /></Field>
              {securityError ? <div className="mb-3 text-xs text-[#B91C1C]">{securityError}</div> : null}
              <div className="grid grid-cols-2 gap-2">
                <button onClick={saveSecurity} disabled={savingSecurity || !currentPin || !newPin || !newPin2} className="soft-transition rounded-xl bg-[#111827] py-2.5 text-sm font-semibold text-white disabled:opacity-40">{savingSecurity ? "Saving..." : "Update PIN"}</button>
                <button onClick={onLock} className="soft-transition flex items-center justify-center gap-2 rounded-xl bg-[#F3F4F6] py-2.5 text-sm font-semibold text-[#374151] hover:bg-[#E5E7EB]"><LogOut size={16} /> Sign out</button>
              </div>
            </div>

            <div className="mb-2 text-xs font-semibold uppercase tracking-wider text-[#6B7280]">Overview</div>
            <div className="grid grid-cols-3 gap-3 lg:grid-cols-1">
              <StatCard label="Agents" value={data.agents.length} />
              <StatCard label="Customers" value={data.customers.length} />
              <StatCard label="Schemes" value={data.schemes.length} />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
