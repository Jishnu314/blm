import React from "react";

export function Field({ label, children }) {
  return (
    <label className="block mb-4">
      <span className="block text-xs font-semibold uppercase tracking-wide text-[#6B7280] mb-1.5">{label}</span>
      {children}
    </label>
  );
}
