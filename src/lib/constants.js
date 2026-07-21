export const RANKS = ["LIA", "SLIA", "DLIA", "CLIA"];
export const RANK_ORDER = { LIA: 1, SLIA: 2, DLIA: 3, CLIA: 4 };
export const RANK_BELOW = { CLIA: "DLIA", DLIA: "SLIA", SLIA: "LIA", LIA: null };
export const RANK_LABEL = {
  LIA: "Land Investment Advisor",
  SLIA: "Senior LIA",
  DLIA: "Deputy LIA",
  CLIA: "Chief LIA",
  
};
export const RANK_COLOR = {
  LIA: { bg: "#F3F4F6", fg: "#374151", ring: "#D1D5DB" },
  SLIA: { bg: "#F3F4F6", fg: "#374151", ring: "#D1D5DB" },
  DLIA: { bg: "#F3F4F6", fg: "#374151", ring: "#D1D5DB" },
  CLIA: { bg: "#F3F4F6", fg: "#374151", ring: "#D1D5DB" },

};
export const MODE_LABEL = { monthly: "Monthly", quarterly: "Quarterly", half: "Half-yearly", yearly: "Yearly" };
export const MODE_MONTHS = { monthly: 1, quarterly: 3, half: 6, yearly: 12 };
export const STORAGE_KEY = "ledger-core-data-v1";

export const STATUS_STYLE = {
  paid: { bg: "#000000", fg: "#fff", label: "Paid" },
  advance: { bg: "#2563EB", fg: "#fff", label: "Advance" },
  overdue: { bg: "#DC2626", fg: "#fff", label: "Overdue" },
  "due-soon": { bg: "#D97706", fg: "#fff", label: "Due this week" },
  upcoming: { bg: "#F3F4F6", fg: "#6B7280", label: "Upcoming" },
  "not-due": { bg: "#F3F4F6", fg: "#9CA3AF", label: "Not due" },
};

export const inputCls = "soft-transition w-full rounded-xl border border-[#D1D5DB] bg-white px-3.5 py-2.5 text-[15px] text-[#000000] outline-none placeholder:text-[#9CA3AF] hover:border-[#CBD5E1] focus:border-[#111827] focus:ring-2 focus:ring-[#111827]/10";
