import React, { useState } from "react";
import { TopBar } from "../components/TopBar";
import { Field } from "../components/Field";
import { RankBadge } from "../components/RankBadge";
import { uid } from "../lib/helpers";
import { RANK_BELOW, inputCls } from "../lib/constants";

export function AddAgentView({ self, update, onDone, onCancel }) {
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [agentIdNumber, setAgentIdNumber] = useState("");
  const rank = RANK_BELOW[self.rank];

  const save = () => {
    const agent = {
      id: uid(),
      name: name.trim(),
      phone,
      agentIdNumber,
      rank,
      parentId: self.id,
      payments: [],
      createdAt: new Date().toISOString(),
    };
    update((d) => ({ ...d, agents: [...d.agents, agent] }));
    onDone();
  };

  return (
    <div>
      <TopBar title="Add agent" onBack={onCancel} />
      <div className="px-4 py-4">
        <Field label="Name"><input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} placeholder="Agent name" /></Field>
        <Field label="Phone"><input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="10-digit mobile" /></Field>
        <Field label="Agent ID"><input className={inputCls} value={agentIdNumber} onChange={(e) => setAgentIdNumber(e.target.value)} placeholder="e.g. KL-04588" /></Field>
        <Field label="Rank">
          <div className="flex items-center gap-2">
            <RankBadge rank={rank} />
            <span className="text-xs text-[#6B7280]">Assigned automatically — one level below yours ({self.rank}).</span>
          </div>
        </Field>
        <button disabled={!name.trim()} onClick={save} className="w-full mt-2 py-3 rounded-xl bg-[#111827] text-white font-semibold disabled:opacity-40">Save agent</button>
      </div>
    </div>
  );
}