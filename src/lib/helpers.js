export const uid = () =>
  crypto.randomUUID ? crypto.randomUUID() : "id-" + Math.random().toString(36).slice(2) + Date.now();

export const todayISO = () => new Date().toISOString().slice(0, 10);

export function fmtMoney(n) {
  const value = Math.round(Number(n) || 0);
  return "Rs " + value.toLocaleString("en-IN");
}

export function fmtDate(iso) {
  if (!iso) return "-";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

export function fmtMonthYear(iso) {
  const date = new Date(iso);
  return date.toLocaleDateString("en-IN", { month: "long", year: "numeric" });
}

export function addMonths(dateStr, n) {
  const date = new Date(dateStr);
  const day = date.getDate();
  date.setDate(1);
  date.setMonth(date.getMonth() + n);
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();
  date.setDate(Math.min(day, lastDay));
  return date;
}

export function daysBetween(a, b) {
  const ms = 1000 * 60 * 60 * 24;
  const first = new Date(a);
  const second = new Date(b);
  first.setHours(0, 0, 0, 0);
  second.setHours(0, 0, 0, 0);
  return Math.round((second - first) / ms);
}

export function sameMonth(iso, monthKey) {
  if (!iso) return false;
  return iso.slice(0, 7) === monthKey;
}

export function monthKeyOf(date) {
  return new Date(date).toISOString().slice(0, 7);
}

export function shiftMonthKey(monthKey, delta) {
  const [year, month] = monthKey.split("-").map(Number);
  const date = new Date(year, month - 1 + delta, 1);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

export function computeMonthlyState(customer, today = new Date()) {
  const term = customer.termMonths || 12;
  const start = customer.joinedOn;
  const paid = customer.paidMonths || [];
  const paidByIndex = {};
  paid.forEach((payment) => {
    paidByIndex[payment.index] = payment;
  });

  let firstUnpaid = 0;
  while (firstUnpaid < term && paidByIndex[firstUnpaid]) firstUnpaid += 1;

  const cells = [];
  let advanceCount = 0;
  let lastPaidDate = null;

  for (let i = 0; i < term; i += 1) {
    const due = addMonths(start, i);
    const entry = paidByIndex[i];
    let status = "not-due";
    if (entry) {
      status = entry.advance ? "advance" : "paid";
      if (entry.advance) advanceCount += 1;
      if (!lastPaidDate || new Date(entry.date) > new Date(lastPaidDate)) lastPaidDate = entry.date;
    } else if (i === firstUnpaid) {
      const daysUntilDue = daysBetween(today, due);
      if (daysUntilDue < 0) status = "overdue";
      else if (daysUntilDue <= 7) status = "due-soon";
      else status = "upcoming";
    }
    cells.push({ index: i, due, status, entry: entry || null });
  }

  const overdueCount = cells.filter((cell) => !cell.entry && daysBetween(today, cell.due) < 0).length;
  const nextDue = firstUnpaid < term ? addMonths(start, firstUnpaid) : null;
  const isDueThisWeek = nextDue ? daysBetween(today, nextDue) >= 0 && daysBetween(today, nextDue) <= 7 : false;
  const isOverdue = overdueCount > 0;
  const completed = firstUnpaid >= term;

  return { cells, overdueCount, advanceCount, lastPaidDate, nextDue, isDueThisWeek, isOverdue, firstUnpaid, completed };
}

export function customerTotals(customer) {
  if (customer.schemeType === "FD") return { totalPaid: customer.amount || 0, totalDue: 0 };
  const term = customer.termMonths || 12;
  const paidCount = (customer.paidMonths || []).length;
  const totalPaid = (customer.paidMonths || []).reduce((sum, payment) => sum + Number(payment.amount || 0), 0);
  const remaining = Math.max(term - paidCount, 0);
  const totalDue = remaining * Number(customer.amount || 0);
  return { totalPaid, totalDue };
}

export function maturityDate(customer) {
  return addMonths(customer.depositDate || customer.joinedOn, customer.termMonths || 12);
}
