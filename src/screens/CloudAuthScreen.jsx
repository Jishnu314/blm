import React, { useState } from "react";
import { PiggyBank, ShieldCheck } from "lucide-react";
import { Field } from "../components/Field";
import { RANKS, RANK_LABEL, inputCls } from "../lib/constants";

export function CloudAuthScreen({ createTeam, logIn, resetPassword }) {
  const [mode, setMode] = useState("login"); // "login" | "create"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [rank, setRank] = useState("LIA");
  const [agentIdNumber, setAgentIdNumber] = useState("");
  const [phone, setPhone] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [info, setInfo] = useState("");
  const [createdCode, setCreatedCode] = useState(null);

  const submit = async () => {
    setError("");
    setInfo("");
    setBusy(true);
    try {
      if (mode === "login") {
        await logIn({ email, password });
      } else {
        const code = await createTeam({ email, password, name, rank, agentIdNumber, phone });
        setCreatedCode(code);
      }
    } catch (e) {
      setError(e.message || "Something went wrong");
    }
    setBusy(false);
  };

  const forgotPassword = async () => {
    setError("");
    setInfo("");
    if (!email) {
      setError("Enter your email above first, then tap this again.");
      return;
    }
    try {
      await resetPassword(email);
      setInfo("Password reset email sent — check your inbox.");
    } catch (e) {
      setError(e.message || "Couldn't send reset email");
    }
  };

  if (createdCode) {
    return (
      <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
        <div className="max-w-sm w-full bg-white rounded-2xl border border-[#E5E7EB] p-6 text-center">
          <ShieldCheck size={28} className="mx-auto mb-3 text-[#111827]" />
          <h2 className="font-serif text-xl text-[#000000] mb-2" style={{ fontFamily: "'Fraunces', serif" }}>Team created</h2>
          <p className="text-sm text-[#6B7280] mb-4">You're all set — this account holds your shared ledger.</p>
          <button onClick={() => window.location.reload()} className="w-full py-3 rounded-xl bg-[#111827] text-white font-semibold">Continue to app</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F7F9] flex items-center justify-center p-6" style={{ fontFamily: "'Inter', sans-serif" }}>
      <div className="max-w-sm w-full">
        <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-[#111827] text-white">
          <PiggyBank size={24} />
        </div>
        <h1 className="font-serif text-2xl text-[#000000] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>
          {mode === "login" ? "Log in" : "Create your account"}
        </h1>
        <p className="text-sm text-[#6B7280] mb-5">
          {mode === "login" ? "Access your shared team ledger from any device." : "Set up your workspace."}
        </p>

        <div className="flex gap-2 mb-5 text-xs font-semibold">
          {[["login", "Log in"], ["create", "Create account"]].map(([m, label]) => (
            <button key={m} onClick={() => { setMode(m); setError(""); setInfo(""); }} className={`px-3 py-1.5 rounded-full ${mode === m ? "bg-[#111827] text-white" : "bg-white border border-[#E5E7EB] text-[#374151]"}`}>{label}</button>
          ))}
        </div>

        <div className="space-y-3 bg-white rounded-2xl border border-[#E5E7EB] p-4">
          <Field label="Email"><input type="email" className={inputCls} value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@gmail.com" /></Field>
          <Field label="Password"><input type="password" className={inputCls} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" /></Field>

          {mode === "login" && (
            <button type="button" onClick={forgotPassword} className="text-xs font-semibold text-[#111827] underline underline-offset-2">Forgot password?</button>
          )}

          {mode === "create" && (
            <>
              <Field label="Your name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" /></Field>
              <Field label="Rank">
                <select className={inputCls} value={rank} onChange={(e) => setRank(e.target.value)}>
                  {RANKS.map((r) => <option key={r} value={r}>{RANK_LABEL[r] || r}</option>)}
                </select>
              </Field>
              <Field label="Agent ID (optional)"><input className={inputCls} value={agentIdNumber} onChange={(e) => setAgentIdNumber(e.target.value)} /></Field>
              <Field label="Phone (optional)"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} /></Field>
            </>
          )}

          {error && <div className="text-xs text-red-600">{error}</div>}
          {info && <div className="text-xs text-green-700">{info}</div>}

          <button disabled={busy} onClick={submit} className="w-full py-3 rounded-xl bg-[#111827] text-white font-semibold disabled:opacity-60">
            {busy ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </div>
      </div>
    </div>
  );
}