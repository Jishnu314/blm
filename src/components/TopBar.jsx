import React from "react";
import { ArrowLeft } from "lucide-react";

export function TopBar({ title, onBack, right }) {
  return (
    <div className="sticky top-0 z-20 flex items-center gap-2 border-b border-[#E5E7EB] bg-[#F6F7F9]/95 px-4 py-3 backdrop-blur lg:px-0 lg:pt-6">
      {onBack ? (
        <button onClick={onBack} className="soft-transition flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#000000] hover:bg-white hover:shadow-sm">
          <ArrowLeft size={20} />
        </button>
      ) : null}
      <h1 className="font-serif flex-1 truncate text-lg text-[#000000] lg:text-2xl" style={{ fontFamily: "'Fraunces', serif" }}>{title}</h1>
      {right}
    </div>
  );
}
