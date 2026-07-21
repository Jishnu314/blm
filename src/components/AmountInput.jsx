import React from "react";

// Formats a plain digit string using the Indian numbering system: 1,00,000 not 100,000
function formatIndianCommas(digits) {
  if (!digits) return "";
  const clean = digits.replace(/^0+(?=\d)/, "");
  if (clean.length <= 3) return clean;
  const last3 = clean.slice(-3);
  const rest = clean.slice(0, -3).replace(/\B(?=(\d{2})+(?!\d))/g, ",");
  return `${rest},${last3}`;
}

// Drop-in replacement for a plain `<input type="text" inputMode="numeric">` amount field.
// `value` / `onChange` still deal in plain digit strings (e.g. "300000") — this component
// only changes what's displayed on screen (e.g. "3,00,000") so large numbers are easier to read while typing.
export function AmountInput({ value, onChange, onBlur, className, placeholder, autoFocus }) {
  const digits = String(value ?? "").replace(/\D/g, "");
  return (
    <input
      type="text"
      inputMode="numeric"
      className={className}
      placeholder={placeholder}
      autoFocus={autoFocus}
      value={formatIndianCommas(digits)}
      onChange={(e) => onChange(e.target.value.replace(/\D/g, ""))}
      onBlur={onBlur}
    />
  );
}