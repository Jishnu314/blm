import React from "react";
import { RANK_COLOR } from "../lib/constants";

export function RankBadge({ rank, size = "md" }) {
  const c = RANK_COLOR[rank] || RANK_COLOR.LIA;
  const pad = size === "sm" ? "px-2 py-0.5 text-[11px]" : "px-2.5 py-1 text-xs";
  return (
    <span className={`inline-flex items-center gap-1 rounded-full font-semibold tracking-wide ${pad}`} style={{ background: c.bg, color: c.fg, border: `1px solid ${c.ring}` }}>
      {rank}
    </span>
  );
}
