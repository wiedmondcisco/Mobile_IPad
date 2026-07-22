import { Search } from "lucide-react";
import { orders } from "./orders.js";
import { spiffPrograms } from "./spiffs.js";
import { PE_COLOR } from "../lib/brand.js";

export const planElements = [
  {id:"PE1", name:"Prod+Services", goal:"$109k Goal", bookingsAmt:"$68k", bookingsPct:63, revenueAmt:"$26k", revenuePct:24, backlogAmt:"$42k", backlogPct:39, attPct:24, color:PE_COLOR.PE1, blColor:"#fcc661"},
  {id:"PE2", name:"Recurring Software", goal:"$87k Goal", bookingsAmt:"$90k", bookingsPct:103, revenueAmt:"$62k", revenuePct:71, backlogAmt:"$28k", backlogPct:32, attPct:71, color:PE_COLOR.PE2, blColor:"#a8d98d"},
  {id:"PE3", name:"Services", goal:"$90k Goal", bookingsAmt:"$85k", bookingsPct:94, revenueAmt:"$40k", revenuePct:44, backlogAmt:"$45k", backlogPct:50, attPct:44, color:PE_COLOR.PE3, blColor:"#c7d2fe"}
];

/* Glance section shows the two active programs + the latest completed one;
   the full catalog lives on the SPIFF & Bonus page (spiffPrograms). */

export const goalTabs = [
  {id:"PE1", name:"Prod+Services",       color:PE_COLOR.PE1, blColor:"#fcc661", goal:"$109k", attPct:24,   bookingsAmt:"$68k", bookingsPct:63,  revenueAmt:"$26k", revenuePct:24,  backlogAmt:"$42k", backlogPct:39, incentive:"$1,386.18"},
  {id:"PE2", name:"Recurring Software",  color:PE_COLOR.PE2, blColor:"#a8d98d", goal:"$87k",  attPct:71, bookingsAmt:"$90k", bookingsPct:103, revenueAmt:"$62k", revenuePct:71,  backlogAmt:"$28k", backlogPct:32, incentive:"$1,019.47"},
  {id:"PE3", name:"Services",            color:PE_COLOR.PE3, blColor:"#c7d2fe", goal:"$90k",  attPct:44,   bookingsAmt:"$85k", bookingsPct:94,  revenueAmt:"$40k", revenuePct:44,  backlogAmt:"$45k", backlogPct:50, incentive:"$980.08"},
  {id:"KSO", name:"Key Sales Objectives",color:PE_COLOR.KSO, goal:"$2.5k", attPct:100,  bookingsAmt:"—",    bookingsPct:100, revenueAmt:"—",    revenuePct:100, backlogAmt:"—",    backlogPct:0,  incentive:"$2,500.00"},
  {id:"OTB", name:"On-Top Bonus",        color:PE_COLOR.OTB, blColor:"#9db9e8", goal:"$5k",   attPct:65,   bookingsAmt:"$3.3k",bookingsPct:65,  revenueAmt:"$2.1k",revenuePct:42,  backlogAmt:"$1.2k",backlogPct:24, incentive:"$100.00"},
  {id:"NDR", name:"Net Dollar Retention",color:PE_COLOR.NDR, blColor:"#7ee1f7", goal:"110%",  attPct:88,   bookingsAmt:"104%", bookingsPct:88,  revenueAmt:"102%", revenuePct:82,  backlogAmt:"6%",   backlogPct:12, incentive:"$0.00"}
];

/* Example goal sheet rendered inside the View Goal Sheet popup */
export const goalSheetExample = {
  period:"H1 FY26 · Jan 26 – Jul 26, 2026",
  target:"$75,500.00",
  rows:[
    {id:"PE1", name:"CX-SVC RENEW ANN|PRI", label:"Prod+Services",      goal:"$109,000", weight:"50%", att:24,   book:"$68k", rev:"$26k", back:"$42k", color:PE_COLOR.PE1},
    {id:"PE2", name:"RRA-SW WO SEC_ACV|NPR",label:"Recurring Software", goal:"$87,000",  weight:"30%", att:71, book:"$90k", rev:"$62k", back:"$28k", color:PE_COLOR.PE2},
    {id:"PE3", name:"SEC PRD ACV|WM|NPR",   label:"Services",           goal:"$90,000",  weight:"20%", att:44,   book:"$85k", rev:"$40k", back:"$45k", color:PE_COLOR.PE3},
    {id:"KSO", name:"Key Sales Objectives", label:"KSO",                goal:"$2,500",   weight:"—",   att:100,  book:"—",    rev:"—",    back:"—",    color:PE_COLOR.KSO},
    {id:"OTB", name:"On-Top Bonus",         label:"OTB",                goal:"$5,000",   weight:"—",   att:65,   book:"$3.3k",rev:"$2.1k",back:"$1.2k",color:PE_COLOR.OTB},
    {id:"NDR", name:"Net Dollar Retention", label:"NDR",                goal:"110%",     weight:"—",   att:88,   book:"104%", rev:"102%", back:"6%",   color:PE_COLOR.NDR}
  ]
};

/* Order Search — seller's orders (only shown after a search). Statuses per
   the desktop reference: Full Revenue (all recognized), Partial (revenue +
   backlog mix), Backlog (nothing recognized yet). PE tags stay consistent
   with the backlog/insight data (Helix + Cortex = PE1, GlobalNet = PE3). */

export const KSO_CALC = {
  earned:"2,500.00", prevPaid:"0.00", result:"2,500.00",
  history:[
    {date:"Apr 1, 2026", details:"Q2 Bonus", amount:2500.00, mb:1},
    {date:"Aug 4, 2025", details:"FY25 H2 KSO Bonus", amount:2200.00, mb:9},
    {date:"Feb 3, 2025", details:"FY25 H1 KSO Bonus", amount:1800.00, mb:15}
  ]
};

export const goalSheetOptions = [
  {fy:"2026", code:"CS532", dates:"25-Jan-2026 to 25-Jul-2026", half:"Semi-Annual:H2", current:true},
  {fy:"2026", code:"CS532", dates:"27-Jul-2025 to 24-Jan-2026", half:"Semi-Annual:H1"},
  {fy:"2025", code:"CS532", dates:"26-Jan-2025 to 26-Jul-2025", half:"Semi-Annual:H2"},
  {fy:"2025", code:"CS580", dates:"28-Jul-2024 to 25-Jan-2025", half:"Semi-Annual:H1"}
];
