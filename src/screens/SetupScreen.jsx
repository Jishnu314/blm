import React, { useState } from "react";
import { Check, Eye, EyeOff, PiggyBank, ShieldCheck, UserRound } from "lucide-react";
import { Field } from "../components/Field";
import { isValidPin, makeUsername } from "../lib/auth";
import { RANKS, RANK_LABEL, RANK_ORDER, inputCls } from "../lib/constants";

export function SetupScreen({ onComplete }) {
  const [name, setName] = useState("");
  const [rank, setRank] = useState("LIA");
  const [agentIdNumber, setAgentIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [recoveryHint, setRecoveryHint] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [saving, setSaving] = useState(false);
  const [step, setStep] = useState(1);

  const cleanUsername = (username || makeUsername(name, agentIdNumber)).trim().toLowerCase();
  const canNext = name.trim() && agentIdNumber.trim() && cleanUsername.length >= 3;
  const canFinish = isValidPin(pin) && pin === pin2;

  const finish = async () => {
    if (!canFinish || saving) return;
    setSaving(true);
    await onComplete({ name, rank, agentIdNumber, phone, username: cleanUsername, pin, recoveryHint });
    setSaving(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] lg:grid lg:grid-cols-[minmax(360px,42%)_1fr]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="bg-[#111827] px-6 py-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-10">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <PiggyBank size={24} />
          </div>
          <h1 className="font-serif text-3xl text-white lg:text-4xl" style={{ fontFamily: "'Fraunces', serif" }}>Create your ledger</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">A simple private workspace for RD collections, FD deposits, agent reports, and monthly totals.</p>
        </div>
        <div className="mt-8 hidden gap-3 text-sm text-white/80 lg:grid">
          {["Fast 6-digit PIN", "Clean monthly reports", "Local saved ledger"].map((item) => (
            <div key={item} className="flex items-center gap-3">
              <Check size={18} />
              <span>{item}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="flex px-5 py-6 lg:items-center lg:justify-center">
        <div className="card w-full max-w-[520px] p-5 lg:p-6">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Step {step} of 2</div>
              <div className="text-xl font-bold text-[#111827]">{step === 1 ? "Profile details" : "Secure access"}</div>
            </div>
            <div className="flex gap-1.5">
              {[1, 2].map((item) => <div key={item} className={`h-2 w-8 rounded-full ${step >= item ? "bg-[#111827]" : "bg-[#E5E7EB]"}`} />)}
            </div>
          </div>

          {step === 1 ? (
            <>
              <Field label="Your name"><input className={inputCls} value={name} onChange={(event) => setName(event.target.value)} placeholder="e.g. Jishnu Kumar" /></Field>
              <Field label="Agent ID"><input className={inputCls} value={agentIdNumber} onChange={(event) => setAgentIdNumber(event.target.value)} placeholder="e.g. KL-04521" /></Field>
              <Field label="Phone (optional)"><input className={inputCls} value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="10-digit mobile" /></Field>
              <Field label="Username">
                <div className="relative">
                  <UserRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
                  <input className={`${inputCls} pl-10`} value={cleanUsername} onChange={(event) => setUsername(event.target.value.replace(/[^a-zA-Z0-9._-]/g, "").toLowerCase())} />
                </div>
              </Field>
              <Field label="Your rank">
                <div className="grid grid-cols-4 gap-2">
                  {RANKS.map((item) => (
                    <button key={item} onClick={() => setRank(item)} className={`soft-transition rounded-xl border py-2.5 text-sm font-semibold ${rank === item ? "border-[#111827] bg-[#111827] text-white" : "border-[#D1D5DB] bg-white text-[#374151] hover:border-[#9CA3AF]"}`}>{item}</button>
                  ))}
                </div>
                <div className="mt-2 text-xs text-[#6B7280]">{RANK_LABEL[rank]}{RANK_ORDER[rank] === 1 ? " - you manage customers only" : " - you can recruit junior agents"}</div>
              </Field>
              <button disabled={!canNext} onClick={() => setStep(2)} className="soft-transition mt-2 w-full rounded-xl bg-[#111827] py-3 font-semibold text-white disabled:opacity-40">Continue</button>
            </>
          ) : (
            <>
              <div className="mb-4 flex items-start gap-3 rounded-xl bg-[#F3F4F6] px-3.5 py-3 text-sm text-[#374151]">
                <ShieldCheck size={18} className="mt-0.5 text-[#111827]" />
                <span>Create a 6-digit PIN. Avoid simple numbers like 123456.</span>
              </div>
              <Field label="Login PIN">
                <div className="relative">
                  <input className={`${inputCls} pr-12 tracking-[0.4em]`} value={pin} type={showPin ? "text" : "password"} inputMode="numeric" maxLength={6} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} placeholder="000000" />
                  <button type="button" onClick={() => setShowPin((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]" aria-label={showPin ? "Hide PIN" : "Show PIN"}>
                    {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
                <div className="mt-2 grid grid-cols-6 gap-1">
                  {[1, 2, 3, 4, 5, 6].map((item) => <div key={item} className={`h-1.5 rounded-full ${pin.length >= item ? "bg-[#111827]" : "bg-[#E5E7EB]"}`} />)}
                </div>
              </Field>
              <Field label="Confirm PIN"><input className={`${inputCls} tracking-[0.4em]`} value={pin2} type={showPin ? "text" : "password"} inputMode="numeric" maxLength={6} onChange={(event) => setPin2(event.target.value.replace(/\D/g, ""))} placeholder="000000" /></Field>
              <Field label="Recovery hint (optional)"><input className={inputCls} value={recoveryHint} onChange={(event) => setRecoveryHint(event.target.value)} placeholder="A clue only you understand" /></Field>
              {pin && pin2 && pin !== pin2 ? <div className="mb-3 text-xs text-[#B91C1C]">PINs do not match.</div> : null}
              <div className="flex gap-2">
                <button onClick={() => setStep(1)} className="soft-transition flex-1 rounded-xl bg-[#F3F4F6] py-3 font-semibold text-[#374151] hover:bg-[#E5E7EB]">Back</button>
                <button disabled={!canFinish || saving} onClick={finish} className="soft-transition flex-1 rounded-xl bg-[#111827] py-3 font-semibold text-white disabled:opacity-40">{saving ? "Creating..." : "Create account"}</button>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}
