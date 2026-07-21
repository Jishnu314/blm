import React from "react";

export function EmptyState({ icon, title, sub }) {
  return (
    <div className="card flex flex-col items-center justify-center px-6 py-14 text-center text-[#6B7280]">
      <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F4F6] text-[#9CA3AF]">{icon}</div>
      <div className="font-serif text-base text-[#111827] mb-1" style={{ fontFamily: "'Fraunces', serif" }}>{title}</div>
      <div className="text-sm max-w-xs">{sub}</div>
    </div>
  );
}
