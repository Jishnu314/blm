import React from "react";

export function StatCard({ label, value, sub, onClick, accent = "#000000", icon }) {
  const Comp = onClick ? "button" : "div";
  return (
    <Comp onClick={onClick} className={`soft-transition min-w-0 flex-1 rounded-2xl border border-[#E5E7EB] bg-white p-4 text-left shadow-sm ${onClick ? "hover:-translate-y-0.5 hover:border-[#CBD5E1] hover:shadow-md active:scale-[0.98]" : ""}`}>
      <div className="flex items-center justify-between mb-1">
        <span className="text-[11px] uppercase tracking-wider text-[#6B7280] font-semibold">{label}</span>
        {icon ? <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-[#F8FAFC]">{icon}</span> : null}
      </div>
      <div className="font-mono text-xl font-bold tracking-normal truncate" style={{ color: accent }}>{value}</div>
      {sub ? <div className="text-[11px] text-[#6B7280] mt-0.5">{sub}</div> : null}
    </Comp>
  );
}
