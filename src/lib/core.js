import { App } from "../app/App.jsx";

export const DATA_AS_OF = "Data as of May 26, 2026, 6:00 AM";

export const REFRESH_NOTE = "Refreshes daily at 6:00 AM PST";

/* Hide-amounts (seller privacy): when on, payment/earnings figures render
   as dots. Module mirror avoids threading state through every amount render
   site — safe because the whole tree re-renders from App when it flips. */

export let AMOUNTS_HIDDEN = false;

export const DOTS = "•••••";

/* Display currency — payments are always MADE in USD; the seller can flip the
   on-screen figures to CAD / EUR / JPY from the hero's currency chip. Fixed
   demo rates; module mirror for the same reason as AMOUNTS_HIDDEN. */

export const CURRENCIES = [
  {code:"USD", sym:"$",   rate:1,    dec:2, name:"US Dollar",       note:"Base currency"},
  {code:"CAD", sym:"CA$", rate:1.37, dec:2, name:"Canadian Dollar", note:"1 USD ≈ CA$1.37"},
  {code:"EUR", sym:"€",   rate:0.92, dec:2, name:"Euro",            note:"1 USD ≈ €0.92"},
  {code:"JPY", sym:"¥",   rate:157,  dec:0, name:"Japanese Yen",    note:"1 USD ≈ ¥157"},
];

export let ACTIVE_CUR = CURRENCIES[0];

/* Rewrites every $-amount inside a string to the active display currency,
   preserving k/M abbreviations ($109k → ¥17.1M). USD is a no-op. The
   lookbehind keeps already-converted "CA$…" from converting twice. */

export const cvt = t => {
  const c = ACTIVE_CUR;
  if (c.rate === 1 || typeof t !== "string") return t;
  return t.replace(/(?<![A-Za-z])\$(\d[\d,]*(?:\.\d+)?)([kKM]?)/g, (_, num, suf) => {
    let v = parseFloat(num.replace(/,/g, "")) * c.rate;
    if (suf) v *= suf === "M" ? 1e6 : 1e3;
    if (suf && v >= 999500) return c.sym + (v/1e6 >= 10 ? Math.round(v/1e6) : (v/1e6).toFixed(1)) + "M";
    if (suf) return c.sym + Math.round(v/1e3) + "k";
    const dec = num.includes(".") ? c.dec : 0;
    return c.sym + v.toLocaleString("en-US", {minimumFractionDigits:dec, maximumFractionDigits:dec});
  });
};

/* Seller-money amounts render bare-number + "USD" (desktop reference style:
   "8,434.23 USD", no $ prefix). Goal/scale figures that don't flow through
   amt()/maskText() (e.g. "$109k Goal") keep their $ prefix. */

export const bareUsd = s => typeof s === "string" ? s.replace(/^([+-]?)\$([+-]?\d.+)$/, "$1$2 USD") : s;

export const amt = v => AMOUNTS_HIDDEN ? (String(v).startsWith("$") ? DOTS + " USD" : DOTS) : bareUsd(cvt(v));

export const maskText = t => AMOUNTS_HIDDEN
  ? t.replace(/\$\d[\d.,]*[KMk]?/g, DOTS + " USD")
  : cvt(t).replace(/(?<![A-Za-z])\$(\d[\d.,]*[KMk]?)/g, "$1 USD");

/* Theme: manual choice (localStorage) overrides system preference on first load */
export function getInitialTheme() {
  try {
    const stored = localStorage.getItem("compx-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) { /* ignore */ }
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}

export const fmtAmt = n => n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});

/* Module-mutable mirrors are owned here; other modules update them through
   these setters (ES module imports are read-only bindings). */
export const setAmountsHidden = v => { AMOUNTS_HIDDEN = v; };
export const setActiveCur = code => { ACTIVE_CUR = CURRENCIES.find(c => c.code === code) || CURRENCIES[0]; };
