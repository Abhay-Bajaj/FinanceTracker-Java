export const parseDisplayDate = value => { const match = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(value.trim()); if (!match) return null; const [, mm, dd, yyyy] = match; const date = new Date(Number(yyyy), Number(mm) - 1, Number(dd)); if (date.getFullYear() !== Number(yyyy) || date.getMonth() !== Number(mm) - 1 || date.getDate() !== Number(dd)) return null; return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`; };
/** Only positive USD amounts in whole dollars or cents; no rounding fractional cents. */
export const isValidMoneyAmount = value => {
  const amount = String(value).trim();
  return /^(?:0|[1-9]\d*)(?:\.\d{1,2})?$/.test(amount) && Number.isFinite(Number(amount)) && Number(amount) >= 0.01;
};
