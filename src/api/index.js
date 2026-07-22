import { apiConfigured, apiGet } from "./client.js";
import { monthlyPayCards, fullPaymentPeriods, PAYMENT_HISTORY } from "../data/payments.js";
import { planElements, goalTabs, goalSheetOptions } from "../data/plans.js";
import { spiffBonus, spiffPrograms } from "../data/spiffs.js";
import { orders, revenueTxns } from "../data/orders.js";
import { insightCards, notifications } from "../data/insights.js";
import { teamMembers, teamSellers } from "../pages/team-view/index.jsx";

/* Endpoint contract — each GET returns the same JSON shape as the demo
   value it replaces (the src/data/ modules ARE the contract; see README).
   Arrays are replaced in place; keyed objects are cleared and reassigned,
   so every module that imported the store sees the hydrated data. */
const replaceArray = (store) => (rows) => { if (Array.isArray(rows)) store.splice(0, store.length, ...rows); };
const replaceObject = (store) => (obj) => {
  if (obj && typeof obj === "object") {
    Object.keys(store).forEach(k => delete store[k]);
    Object.assign(store, obj);
  }
};

const ENDPOINTS = [
  { path: "/payment-cards",        apply: replaceArray(monthlyPayCards) },
  { path: "/payment-periods",      apply: replaceArray(fullPaymentPeriods) },
  { path: "/payment-history",      apply: replaceObject(PAYMENT_HISTORY) },
  { path: "/plan-elements",        apply: replaceArray(planElements) },
  { path: "/goal-tabs",            apply: replaceArray(goalTabs) },
  { path: "/goal-sheets",          apply: replaceArray(goalSheetOptions) },
  { path: "/spiff-programs",       apply: replaceArray(spiffPrograms) },
  { path: "/spiff-highlights",     apply: replaceArray(spiffBonus) },
  { path: "/orders",               apply: replaceArray(orders) },
  { path: "/revenue-transactions", apply: replaceObject(revenueTxns) },
  { path: "/insights",             apply: replaceArray(insightCards) },
  { path: "/notifications",        apply: replaceArray(notifications) },
  { path: "/team/members",         apply: replaceArray(teamMembers) },
  { path: "/team/sellers",         apply: replaceArray(teamSellers) },
];

/* Fetch every domain in parallel before first render (see src/main.jsx).
   Each endpoint is independent and optional: a missing or failing route
   keeps that domain's demo data — the app never blocks on a partial API. */
export async function hydrateAppData() {
  if (!apiConfigured()) return { hydrated: false, failed: [] };
  const failed = [];
  await Promise.all(ENDPOINTS.map(async ({ path, apply }) => {
    try {
      apply(await apiGet(path));
    } catch (err) {
      failed.push(path);
      console.warn(`[CompX] ${path} unavailable — keeping demo data.`, err);
    }
  }));
  return { hydrated: true, failed };
}
