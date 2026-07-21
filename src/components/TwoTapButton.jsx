import React, { useState, useEffect } from "react";

export function TwoTapButton({ onConfirm, label, confirmLabel, className, icon }) {
  const [armed, setArmed] = useState(false);
  useEffect(() => {
    if (!armed) return;
    const t = setTimeout(() => setArmed(false), 3000);
    return () => clearTimeout(t);
  }, [armed]);
  return (
    <button
      onClick={() => (armed ? onConfirm() : setArmed(true))}
      className={className || `px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-1.5 ${armed ? "bg-[#111827] text-white" : "bg-[#F3F4F6] text-[#374151]"}`}
    >
      {icon}
      {armed ? (confirmLabel || "Tap again to confirm") : label}
    </button>
  );
}
