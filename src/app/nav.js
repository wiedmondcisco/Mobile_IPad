import { Calculator, CheckCircle2, DollarSign, Home, Layers, Search, Target } from "lucide-react";
import { orders } from "../data/orders.js";

export const NAV_TABS = [
  {id:"glance", label:"At A Glance", Icon:Home},
  {id:"payments", label:"Payments", Icon:DollarSign},
  {id:"goals", label:"Goals", Icon:CheckCircle2},
  {id:"orders", label:"Order Search", Icon:Search},
  {id:"spiff", label:"SPIFF & Bonus", Icon:Target},
  {id:"backlog", label:"Backlog", Icon:Layers},
  {id:"estimator", label:"Pay Estimator", short:"Estimator", Icon:Calculator}
];
/* Mobile bottom bar: core tabs only — Order Search moved behind the header
   magnifier (quick-search popup) and the More sheet */

export const MOBILE_TAB_IDS = ["glance","payments","goals"];

export const MOBILE_MORE_IDS = ["spiff","backlog","estimator"];   // Order Search: header magnifier only

export const MOBILE_TABS = NAV_TABS.filter(t=>MOBILE_TAB_IDS.includes(t.id));

export const MOBILE_MORE = NAV_TABS.filter(t=>MOBILE_MORE_IDS.includes(t.id));

