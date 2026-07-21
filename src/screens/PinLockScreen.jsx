import React, { useMemo, useState } from "react";
import { Eye, EyeOff, LockKeyhole, LogIn, ShieldAlert, UserRound } from "lucide-react";
import { inputCls } from "../lib/constants";
import { verifyPassword } from "../lib/auth";

export function PinLockScreen({ self, onUnlock }) {
  const isLegacyPin = !self.auth?.passwordHash && self.pin;
  const expectedUsername = self.auth?.username || self.agentIdNumber?.toLowerCase() || "";
  const [username, setUsername] = useState(expectedUsername);
  const [pin, setPin] = useState("");
  const [rememberSession, setRememberSession] = useState(true);
  const [showPin, setShowPin] = useState(false);
  const [error, setError] = useState("");
  const [checking, setChecking] = useState(false);
  const recoveryHint = useMemo(() => self.auth?.recoveryHint?.trim(), [self.auth?.recoveryHint]);

  const submit = async (event) => {
    event.preventDefault();
    if (checking) return;
    setChecking(true);
    setError("");
    const usernameOk = !expectedUsername || username.trim().toLowerCase() === expectedUsername;
    const pinOk = isLegacyPin ? pin === self.pin : await verifyPassword(self.auth, pin);
    if (usernameOk && pinOk) {
      onUnlock({ rememberSession });
      return;
    }
    setError("Incorrect username or PIN.");
    setPin("");
    setChecking(false);
  };

  return (
    <div className="min-h-screen bg-[#F6F7F9] lg:grid lg:grid-cols-[minmax(360px,42%)_1fr]" style={{ fontFamily: "'Inter', sans-serif" }}>
      <section className="bg-[#111827] px-6 py-10 text-white lg:flex lg:min-h-screen lg:flex-col lg:justify-between lg:px-10">
        <div>
          <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10">
            <LockKeyhole size={24} />
          </div>
          <h1 className="font-serif text-3xl text-white lg:text-4xl" style={{ fontFamily: "'Fraunces', serif" }}>Welcome back</h1>
          <p className="mt-2 max-w-sm text-sm leading-6 text-white/70">Enter your PIN to unlock collections, reports, and agent submissions.</p>
        </div>
        <div className="mt-8 hidden text-sm text-white/70 lg:block">
          Logged in as <span className="font-semibold text-white">{self.name}</span>
          <div className="mt-1 font-mono text-xs text-white/50">Agent ID {self.agentIdNumber}</div>
        </div>
      </section>

      <section className="flex px-5 py-6 lg:items-center lg:justify-center">
        <form onSubmit={submit} className="card w-full max-w-[440px] p-5 lg:p-6">
          <div className="mb-5">
            <div className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">Secure login</div>
            <div className="text-xl font-bold text-[#111827]">Enter your PIN</div>
          </div>
          <label className="mb-4 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{isLegacyPin ? "Agent ID" : "Username"}</span>
            <div className="relative">
              <UserRound size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7280]" />
              <input className={`${inputCls} pl-10`} value={username} onChange={(event) => setUsername(event.target.value.toLowerCase())} autoComplete="username" />
            </div>
          </label>
          <label className="mb-3 block">
            <span className="mb-1.5 block text-xs font-semibold uppercase tracking-wide text-[#6B7280]">{isLegacyPin ? "4-digit PIN" : "6-digit PIN"}</span>
            <div className="relative">
              <input className={`${inputCls} pr-12 tracking-[0.4em]`} value={pin} type={showPin ? "text" : "password"} inputMode="numeric" maxLength={isLegacyPin ? 4 : 6} onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))} autoComplete="current-password" placeholder={isLegacyPin ? "0000" : "000000"} />
              <button type="button" onClick={() => setShowPin((value) => !value)} className="absolute right-2 top-1/2 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-lg text-[#6B7280] hover:bg-[#F3F4F6]" aria-label={showPin ? "Hide PIN" : "Show PIN"}>
                {showPin ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </label>
          <label className="mb-4 flex items-center gap-2 text-sm text-[#374151]">
            <input type="checkbox" checked={rememberSession} onChange={(event) => setRememberSession(event.target.checked)} className="h-4 w-4 accent-[#111827]" />
            Keep me signed in for this browser session
          </label>
          {error ? (
            <div className="mb-4 flex items-start gap-2 rounded-xl bg-[#FEF2F2] px-3 py-2.5 text-sm text-[#B91C1C]">
              <ShieldAlert size={17} className="mt-0.5" />
              <span>{error}</span>
            </div>
          ) : null}
          {recoveryHint ? <div className="mb-4 text-xs text-[#6B7280]">Hint: {recoveryHint}</div> : null}
          <button type="submit" disabled={checking || !username.trim() || !pin} className="soft-transition flex w-full items-center justify-center gap-2 rounded-xl bg-[#111827] py-3 font-semibold text-white disabled:opacity-40">
            <LogIn size={18} />
            {checking ? "Checking..." : "Sign in"}
          </button>
        </form>
      </section>
    </div>
  );
}
