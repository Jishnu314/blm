import React from "react";
import { CheckCircle2, Zap } from "lucide-react";
import { computeMonthlyState, fmtDate } from "../lib/helpers";
import { STATUS_STYLE } from "../lib/constants";

export function PassbookGrid({ customer, onPayCell }) {
  const state = computeMonthlyState(customer);
  return (
    <div>
      <div className="grid grid-cols-6 gap-2.5">
        {state.cells.map((c) => {
          const s = STATUS_STYLE[c.status];
          const clickable = c.status === "overdue" || c.status === "due-soon" || c.status === "upcoming" || c.status === "paid" || c.status === "advance";
          return (
            <button
              key={c.index}
              disabled={!clickable}
              onClick={() => clickable && onPayCell(c)}
              className="flex flex-col items-center gap-1 group"
              title={c.status === "paid" || c.status === "advance" ? `${fmtDate(c.due)} · tap to edit or undo` : fmtDate(c.due)}
            >
              <div
                className="w-full aspect-square rounded-full flex items-center justify-center text-[11px] font-bold border-2 transition-transform group-active:scale-90"
                style={{ background: s.bg, color: s.fg, borderColor: s.bg }}
              >
                {c.status === "paid" && <CheckCircle2 size={16} />}
                {c.status === "advance" && <Zap size={15} />}
                {c.status !== "paid" && c.status !== "advance" && (c.index + 1)}
              </div>
              <span className="text-[9px] text-[#6B7280]">{new Date(c.due).toLocaleDateString("en-IN", { month: "short" })}</span>
            </button>
          );
        })}
      </div>
      <div className="flex flex-wrap gap-3 mt-4 text-[11px] text-[#6B7280]">
        {Object.entries(STATUS_STYLE).map(([k, v]) => (
          <div key={k} className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full inline-block" style={{ background: v.bg }} />{v.label}</div>
        ))}
      </div>
    </div>
  );
}