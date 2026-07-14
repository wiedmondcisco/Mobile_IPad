import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Home, DollarSign, Target, Search, ChevronRight, ChevronDown, ChevronLeft, Bell, X, FileText, Calendar, ArrowUp, RefreshCw, Moon, Sun, Users, User, Layers, Sparkles, Send, Smartphone, Tablet, RotateCw, Share, Copy, Plus, ExternalLink, Eye, EyeOff, CheckCircle2, Trophy, Calculator, MoreHorizontal, HelpCircle, LayoutGrid, AlertTriangle, Check, Info, Menu } from "lucide-react";
import "./styles.css";

/* ════════════════════════════════════════════════════════════════
   DATA (colors/type/components from the desktop/browser version;
   layout & rhythm from the old mobile design)
   PE color map: PE1 Prod+Services = gold, PE2 Recurring Software = green,
   PE3 Services = blue/purple — kept consistent across all pages.
   ════════════════════════════════════════════════════════════════ */
const DATA_AS_OF = "Data as of May 26, 2026, 6:00 AM";
const REFRESH_NOTE = "Refreshes daily at 6:00 AM PST";

/* Hide-amounts (seller privacy): when on, payment/earnings figures render
   as dots. Module mirror avoids threading state through every amount render
   site — safe because the whole tree re-renders from App when it flips. */
let AMOUNTS_HIDDEN = false;
const DOTS = "•••••";
const amt = v => AMOUNTS_HIDDEN ? (String(v).startsWith("$") ? "$" + DOTS : DOTS) : v;
const maskText = t => AMOUNTS_HIDDEN ? t.replace(/\$\d[\d.,]*[KMk]?/g, "$" + DOTS) : t;

/* StratComp IQ assistant — canned responses keyed by keyword (from original build) */
const botResponses = {
  "attainment":"You're at 24% on PRI (CX-SVC RENEW), 71% on NPR (RRA-SW), and 44% on NPR2 (SEC PRD). Overall weighted: ~42%. You need significant revenue growth on PRI to hit accelerator.",
  "earnings":"YTD earnings: $25,409 paid (Jan–Apr). Current month (May 2026): $8,408.25 — Goal Sheet $5,859.75, SPIFFs $2,125, Draws $50, Adj $73.50, OTB $100, Past $200.",
  "accelerator":"Accelerator kicks in at 100% attainment. Rate jumps from 1% to 2% per 1% attainment! Your best positioned PE is NPR at 71%.",
  "close":"Your best positioned PE is NPR (Recurring Software) at 71%. You need about $25K more revenue to reach 100%. PRI is at 24% needing ~$83K.",
  "payment":"Next payment: $8,408.25 on Jun 2, 2026. Previous: $6,830 (Apr). Lock date: May 28.",
  "backlog":"$115K in backlog. Estimated additional paycheck impact: +$1,200. Orders pending fulfillment across multiple months.",
  "goal":"Goal Sheet H1: PRI $109K (50% weight), NPR $87K (30%), NPR2 $90K (20%). Total target incentive: $75,500.",
  "spiff":"Active: Q2 Cloud Migration SPIFF ($5,000 potential, 25% progress), Partner Acceleration Q2 ($3,500, 25%). Projected SPIFF earnings this period: $2,125.",
  "best":"NPR (RRA-SW) is at 71% attainment — closest to the 100% accelerator threshold. NPR2 (SEC PRD) trails at 44%.",
  "default":"I can help with: attainment, earnings, payments, accelerators, backlog, goals, or SPIFFs. What would you like to know?"
};

/* Theme: manual choice (localStorage) overrides system preference on first load */
function getInitialTheme() {
  try {
    const stored = localStorage.getItem("compx-theme");
    if (stored === "light" || stored === "dark") return stored;
  } catch (e) { /* ignore */ }
  return (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches) ? "dark" : "light";
}

const PE_COLOR = { PE1:"#f59e0b", PE2:"#10b981", PE3:"#3b82f6", KSO:"#6366f1", OTB:"#8b5cf6", NDR:"#06b6d4" };

const monthlyPayCards = [
  {month:"APR 2026", period:"April 2026", status:"Paid", amount:"6,830.00", change:"▲ 10.4%", payDate:"Paid May 2, 2026"},
  {month:"MAY 2026", period:"May 2026", status:"Open", current:true, amount:"8,408.25", change:"▲ 23.1%", payDate:"Pay: Jun 2, 2026"},
  {month:"JUN 2026", status:"Upcoming", amount:"0.00", payDate:"Pay: Jul 2, 2026"}   // no statement period yet — card stays inert
];

const planElements = [
  {id:"PE1", name:"Prod+Services", goal:"$109k Goal", bookingsAmt:"$68k", bookingsPct:63, revenueAmt:"$26k", revenuePct:24, backlogAmt:"$42k", backlogPct:39, attPct:24, color:PE_COLOR.PE1, blColor:"#fbbf24"},
  {id:"PE2", name:"Recurring Software", goal:"$87k Goal", bookingsAmt:"$90k", bookingsPct:103, revenueAmt:"$62k", revenuePct:71, backlogAmt:"$28k", backlogPct:32, attPct:71, color:PE_COLOR.PE2, blColor:"#6ee7b7"},
  {id:"PE3", name:"Services", goal:"$90k Goal", bookingsAmt:"$85k", bookingsPct:94, revenueAmt:"$40k", revenuePct:44, backlogAmt:"$45k", backlogPct:50, attPct:44, color:PE_COLOR.PE3, blColor:"#93c5fd"}
];

/* Glance section shows the two active programs + the latest completed one;
   the full catalog lives on the SPIFF & Bonus page (spiffPrograms). */
const spiffBonus = [
  {status:"Active", statusColor:"#3b82f6", name:"Q2 Cloud Migration SPIFF", sub:"Cloud deals ≥ $15K TCV", amount:"$5,000", date:"Apr 1 – Jun 30, 2026", pct:25},
  {status:"Active", statusColor:"#3b82f6", name:"Partner Acceleration Q2", sub:"Partner-sourced bookings", amount:"$3,500", date:"Apr 1 – Jun 30, 2026", pct:25},
  {status:"Achieved", statusColor:"#10b981", name:"FY25 H2 Attainment Milestone", sub:"Bonus earned", amount:"$7,560", date:"Paid Apr 16, 2026", pct:100}
];

/* ── SPIFF & Bonus page — every strategic incentive program (desktop reference).
   Projected = open programs (Active + Eligible): 5,000+12,000+3,500+4,200 = 24,700.
   Paid YTD = FY25 H2 milestone 7,560 + Splunk 8,330 + Q2 progress paid 2,125 = 18,015. ── */
const SPIFF_TYPE_COLOR = {SPIFF:"#049fd9", Accelerator:"#dc2626", Bonus:"#b08a1d", Uplift:"#8b5cf6"};
const SPIFF_STATUS_COLOR = {Active:"#10b981", Eligible:"#3b82f6", Completed:"#16a34a", Expired:"#6b7280"};
const spiffPrograms = [
  {name:"Q2 Cloud Migration SPIFF", type:"SPIFF", status:"Active", period:"Q2 2026", projected:"$5,000", earned:"$1,250", target:"$5,000", pct:25,
    desc:"Earn bonus for closing cloud migration deals over $15K TCV. Stackable with ARR quota.",
    criteria:"Close 3+ cloud migration deals ≥ $15K TCV each.", dates:"Apr 1, 2026 – Jun 30, 2026"},
  {name:"ARR 100%+ Accelerator", type:"Accelerator", status:"Eligible", period:"H1 2026", projected:"$12,000", earned:"$0", target:"$12,000", pct:0,
    desc:"Achieve 100%+ ARR attainment to unlock 1.5× commission multiplier for the remainder of H1.",
    criteria:"Reach 100% ARR attainment before Jun 30, 2026.", dates:"Jan 1, 2026 – Jun 30, 2026"},
  {name:"FY25 H2 Attainment Milestone", type:"Bonus", status:"Completed", period:"FY25 H2", projected:"$7,560", earned:"$7,560", target:"$7,560", pct:100,
    desc:"Bonus awarded for exceeding 80% combined attainment in FY25 H2.",
    criteria:"Combined PE attainment ≥ 80% for FY25 H2.", dates:"Jul 1, 2025 – Dec 31, 2025"},
  {name:"Partner Acceleration Q2", type:"SPIFF", status:"Active", period:"Q2 2026", projected:"$3,500", earned:"$875", target:"$3,500", pct:25,
    desc:"Drive partner-sourced bookings to qualify for quarterly SPIFF payout. Rewards collaborative deal origination.",
    criteria:"$60K+ partner-sourced TCV in Q2.", dates:"Apr 1, 2026 – Jun 30, 2026"},
  {name:"Services Attach Uplift", type:"Uplift", status:"Eligible", period:"H1 2026", projected:"$4,200", earned:"$0", target:"$4,200", pct:0,
    desc:"Earn 10% uplift on services revenue when attached to a qualifying product deal.",
    criteria:"Attach services on 5+ product deals in H1 2026.", dates:"Jan 1, 2026 – Jun 30, 2026"},
  {name:"Q4FY24 Slam Dunk with Splunk", type:"Bonus", status:"Expired", period:"Q4 FY24", projected:"$8,330", earned:"$8,330", target:"$8,330", pct:100,
    desc:"Special promotion for Splunk + Cisco Security bundles in Q4 FY24.",
    criteria:"3+ Splunk bundle deals closed in Q4 FY24.", dates:"Oct 1, 2024 – Dec 31, 2024"}
];
const SPIFF_PERIODS  = ["All", "Q2 2026", "H1 2026", "FY25 H2", "Q4 FY24"];
const SPIFF_STATUSES = ["All", "Active", "Eligible", "Completed", "Expired"];
const SPIFF_TYPES    = ["All Types", "SPIFF", "Accelerator", "Bonus", "Uplift"];
const SPIFF_PROJECTED = "$24,700", SPIFF_PAID_YTD = "$18,015";
function filterSpiffs(f) {
  return spiffPrograms.filter(p =>
    (f.period==="All" || p.period===f.period) &&
    (f.status==="All" || p.status===f.status) &&
    (f.type==="All Types" || p.type===f.type));
}

const insightCards = [
  {peBadge:"Prod+Services", peColor:PE_COLOR.PE1, tag:"$18K ★", tagColor:"#dc2626", title:"High Value Booking", desc:"Stargate AI ($18K) is your largest eligible booking this period. Top backlog: Cortex Financial ($23K), Helix Networks ($14K). Clearing both pushes PE1 past the 50% threshold."},
  {peBadge:"Services", peColor:PE_COLOR.PE3, tag:"$38K ★", tagColor:"#dc2626", title:"Services Backlog Opportunity", desc:"Services sits at 44% attainment — $5K from the 50% tier. GlobalNet Inc ($38K backlog, PE3) clearing alone would lift you past the 75% tier."},
  {peBadge:"CA Review", peColor:"#6b7280", tag:"✓ Clear ★", tagColor:"#10b981", title:"Comp Assurance", desc:"No CA review triggered this period. Your May payment of $8,408 is 91% below the $100K threshold."}
];

/* ── Insight Canvas catalog (from the desktop reference) ──
   Sellers pin up to MAX_PINS insights for their At A Glance feed;
   with no pins, the AI-selected `insightCards` above are shown. */
const MAX_PINS = 6;
const INSIGHT_CATS = [
  {name:"Fast Start", color:"#f59e0b", fast:true, items:[
    {id:"what-selling", title:"What Am I Selling?", live:true, tags:["Seller"], cta:"View Plan", ctaTab:"goals", desc:"Review your active plan elements and quota targets for the current goal sheet period."},
    {id:"who-selling-to", title:"Who Am I Selling To?", live:true, tags:["Seller"], cta:"View Territory", ctaTab:"orders", desc:"Explore your territory accounts, named customers, and top opportunities for this period."},
    {id:"how-make-money", title:"How Do I Make Money?", live:true, tags:["Seller"], cta:"View Incentives", ctaTab:"payments", desc:"Understand your compensation structure, active SPIFs, and fastest paths to higher payout tiers."}]},
  {name:"Attainment & Tiers", color:"#3b82f6", items:[
    {id:"gap-next-tier", title:"Gap to Next Tier", live:true, tags:["Seller"], desc:"The % and $ needed to reach your next payout tier based on current revenue attainment."},
    {id:"strongest-pe", title:"Strongest Plan Element", live:true, tags:["Seller"], desc:"Your top-performing plan element by attainment percentage this period."},
    {id:"tier-milestone", title:"Tier Milestone", live:true, tags:["Seller"], desc:"You just crossed into a new attainment tier — your payout rate has increased accordingly."},
    {id:"weakest-pe", title:"Weakest Plan Element", tags:["Seller"], desc:"The plan element most at risk of missing target — focus here to maximize payout."},
    {id:"excellence-points", title:"Excellence Point Proximity", tags:["Seller"], desc:"How close you are to earning Excellence Points and what actions can accelerate them."},
    {id:"proration-impact", title:"Proration Impact", tags:["Seller","Ops"], desc:"How mid-period plan changes or territory adjustments have affected your prorated quota."}]},
  {name:"Payments & Payout", color:"#049fd9", items:[
    {id:"payment-change", title:"Payment Change", live:true, tags:["Seller"], desc:"Month-over-month delta in your payout — what drove the change and what to expect next."},
    {id:"payout-rate", title:"Current Payout Rate", live:true, tags:["Seller"], desc:"Your effective payout rate at current attainment levels across all active plan elements."},
    {id:"adjustment-applied", title:"Adjustment Applied", live:true, tags:["Seller"], desc:"A compensation adjustment was applied to your account — review the change and reason code."},
    {id:"payment-locked", title:"Payment Locked", live:true, tags:["Seller"], desc:"Your payment for this period has been locked — no further changes will affect this payout."},
    {id:"lock-pay-date", title:"Lock / Pay Date", live:true, tags:["Seller"], desc:"Upcoming revenue lock and payment dates with estimated amounts based on current trajectory."},
    {id:"adjustment-explain", title:"Adjustment Explanation", tags:["Seller","Ops"], desc:"Details on any manual adjustments applied this period and their impact on your payout."},
    {id:"comp-velocity", title:"Compensation Velocity", tags:["Seller"], desc:"Your rate of earnings acceleration compared to the same point in prior periods."}]},
  {name:"Orders & Pipeline", color:"#f97316", items:[
    {id:"recent-order", title:"Recent Order", live:true, tags:["Seller"], desc:"Your most recent booked order, its plan element classification, and revenue recognition status."},
    {id:"backlog-conversion", title:"Backlog Conversion", live:true, tags:["Seller"], desc:"Orders in backlog and their expected clearance timeline — shows estimated paycheck impact."},
    {id:"backlog-converted", title:"Backlog Converted", live:true, tags:["Seller"], desc:"An order moved from backlog to revenue — see the payout impact on your current period."},
    {id:"high-value-booking", title:"High-Value Booking", live:true, tags:["Seller"], desc:"A high-value order was recently booked to your plan — review its classification and impact."},
    {id:"order-debooked", title:"Order Debooked", live:true, tags:["Seller"], desc:"A previously booked order was debooked — understand the revenue and payout impact."},
    {id:"orders-summary", title:"Orders Summary", tags:["Seller"], desc:"Aggregate view of bookings, backlog, and revenue by plan element for the current period."},
    {id:"pipeline-health", title:"Pipeline Health", tags:["Seller","Manager"], desc:"Assessment of your open opportunities and likelihood to close against remaining quota gap."}]},
  {name:"Manager & Team", color:"#8b5cf6", items:[
    {id:"team-attainment", title:"Team Attainment Distribution", live:true, tags:["Manager"], desc:"Breakdown of your team's attainment spread — who is ahead, on track, or at risk."},
    {id:"at-risk-sellers", title:"At-Risk Sellers", live:true, tags:["Manager"], desc:"Team members unlikely to hit target based on current pace — suggested coaching actions included."},
    {id:"top-performers", title:"Top Performers", live:true, tags:["Manager"], desc:"Your highest-attaining reps this period with deal composition and momentum details."},
    {id:"member-milestone", title:"Team Member Milestone", live:true, tags:["Manager"], desc:"A team member crossed a significant attainment or tier milestone — worth recognizing."},
    {id:"coaching-priority", title:"Coaching Priority", tags:["Manager"], desc:"AI-ranked list of team members by highest coaching ROI based on gap and close probability."},
    {id:"team-momentum", title:"Team Momentum", tags:["Manager"], desc:"Week-over-week booking momentum across your team and which deals are driving growth."}]},
  {name:"Ops & System", color:"#64748b", items:[
    {id:"system-health", title:"System Health", tags:["Ops","Sio"], desc:"Status of data feeds, integration pipelines, and any known data quality issues affecting payroll."},
    {id:"access-status", title:"Access Status", tags:["Ops"], desc:"Current provisioning status for sellers in your plan — flags missing access or stale profiles."},
    {id:"dispute-volume", title:"Dispute Volume", tags:["Ops","Sio"], desc:"Open compensation disputes by age, plan element, and priority with resolution timeline."}]},
  {name:"Self-Service", color:"#06b6d4", items:[
    {id:"self-validation", title:"Self-Service Validation", tags:["Seller"], desc:"Verify your own attainment calculations and flag discrepancies before the lock date."},
    {id:"fix-verification", title:"Fix Verification", tags:["Seller","Ops"], desc:"Confirm that a previously reported data fix has been applied correctly to your comp record."},
    {id:"predictive-attainment", title:"Predictive Attainment", tags:["Seller","Manager"], desc:"ML-based projection of your period-end attainment given current pace, pipeline, and seasonality."}]}
];
const INSIGHT_INDEX = INSIGHT_CATS.flatMap(c=>c.items.map(it=>({...it, cat:c.name, catColor:c.color})));

const notifications = [
  {type:"amber", title:"Goal Sheet acceptance due", desc:"Please review and accept your H2 FY26 Goal Sheet by Jun 15, 2026.", action:"Accept Goal Sheet", nav:"goals"},
  {type:"green", title:"Q2 Bonus Eligible", desc:"You are on track to earn a quarterly bonus.", action:"View Details", nav:"spiff"},
  {type:"blue", title:"New Compensation Plan Released", desc:"H2 FY26 Compensation Plan is now available.", action:"View Plan", nav:"goals"}
];

/* My Reminders (second tab of the bell dropdown) — user-managed notes */
const REMINDERS_SEED = [
  {id:1, text:"Follow up on PE2 deal with BlueStar Solutions", date:"2026-06-10", done:false},
  {id:2, text:"Review H2 goal sheet before acceptance window closes", date:"2026-06-15", done:false}
];
const fmtRemDate = iso => iso
  ? new Date(iso+"T12:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
  : "No date";

/* Payments — periods with full breakdown + per-PE calculation data */
const recentPaymentPeriods = [
  {month:"May 2026", amount:"8,408.25", status:"Open", payDate:"Jun 2, 2026", lockDate:"May 28, 2026", revDates:"May 1 – May 18, 2026",
    goalSheet:{period:"Jan 26, 2026 - Jul 26, 2026", total:"5,859.75", items:[
      {pe:"PE1", name:"CX-SVC RENEW ANN|PRI", label:"Prod+Services", weight:"50%", pct:24, attChange:4, payout:"1,585.50", color:PE_COLOR.PE1,
        calc:{incrementalAtt:"4%", totalAtt:"24%", weight:"50%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"4.2%", result:"1,585.50", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"20%", incr:"4%", mult:"4.2%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"24%", mult:"4.2%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]},
        /* PE1 splits into product-line components — the parent total is
           display-only; each child opens its own calc breakdown */
        children:[
          {pe:"PE1", label:"Prod+Services", color:PE_COLOR.PE1, pct:24, attChange:4, payout:"1,359.00",
            calc:{incrementalAtt:"4%", totalAtt:"24%", weight:"45%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"4%", totalEarned:"1,359.00", prevPaid:"0", result:"1,359.00"}},
          {pe:"CU", label:"Security Comp Uplift", color:"#8b5cf6", pct:4, attChange:3, payout:"90.60",
            calc:{incrementalAtt:"3%", totalAtt:"4%", weight:"2%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"6%", totalEarned:"90.60", prevPaid:"0", result:"90.60"}},
          {pe:"CU", label:"Collab Comp Uplift", color:"#8b5cf6", pct:4, attChange:3, payout:"90.60",
            calc:{incrementalAtt:"3%", totalAtt:"4%", weight:"2%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"6%", totalEarned:"90.60", prevPaid:"0", result:"90.60"}},
          {pe:"MY", label:"Services MY", color:"#3b82f6", pct:5, attChange:1, payout:"45.30",
            calc:{incrementalAtt:"1%", totalAtt:"5%", weight:"1%", targetIncentive:"75,500.00", proration:"50%", payoutRate:"12%", totalEarned:"45.30", prevPaid:"0", result:"45.30"}}
        ]},
      {pe:"PE2", name:"RRA-SW WO SEC_ACV|AG|WM|NPR", label:"Recurring Software", weight:"30%", pct:71, attChange:6, payout:"1,019.25", color:PE_COLOR.PE2,
        calc:{incrementalAtt:"6%", totalAtt:"71%", weight:"30%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"4.5%", result:"1,019.25", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"-", incr:"-", mult:"-"},
            {range:"50 – 75 %", peRate:".75%", prior:"65%", incr:"6%", mult:"4.5%", active:true},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"-", mult:"-"},
            {range:"50 – 75 %", peRate:".75%", rev:"71%", mult:"4.5%", active:true},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}},
      {pe:"PE3", name:"SEC PRD ACV|WM|NPR", label:"Services", weight:"20%", pct:44, attChange:5, payout:"755.00", color:PE_COLOR.PE3,
        calc:{incrementalAtt:"5%", totalAtt:"44%", weight:"20%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"5%", result:"755.00", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:"1%", prior:"39%", incr:"5%", mult:"5%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:"1%", rev:"44%", mult:"5%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}},
      {pe:"KSO", name:"Key Sales Objectives", label:"KSO", weight:"—", pct:100, payout:"2,500.00", color:PE_COLOR.KSO}
    ]},
    spiff:{total:"2,125.00", items:[{name:"Q2 Cloud Migration SPIFF", amount:"$1,250.00"},{name:"Partner Acceleration Q2", amount:"$875.00"}]},
    draws:{total:"50.00", items:[{chip:"MIPS", name:"Monthly Incentive Payment", amount:"$35.00"},{chip:"Draw", name:"Recoverable Draw", amount:"$15.00"}]},
    adj:{total:"73.50", items:[{chip:"ICC", name:"Payment Adjustment", amount:"$73.50"}]},
    otb:{total:"100.00", items:[{name:"PIOT PRODUCT RR|PL", amount:"$100.00", pct:65, attChange:25}]},
    past:{total:"200.00", groups:[
      {fy:"FY23", half:"H2", dates:"Jul 1, 2023 – Dec 31, 2023", rate:"CS402", total:"120.00", items:[
        {pe:"PE1", name:"Product & Services Annual", amount:"75.00"},
        {pe:"PE2", name:"Renewable Software & Customer Success (iACV)", amount:"45.00"}]},
      {fy:"FY23", half:"H1", dates:"Jan 1, 2023 – Jun 30, 2023", rate:"CS402", total:"50.00", items:[
        {pe:"PE1", name:"Product & Services Annual", amount:"50.00"}]},
      {fy:"FY22", half:"H2", dates:"Jul 1, 2022 – Dec 31, 2022", rate:"CS402", total:"30.00", items:[
        {pe:"PE1", name:"Product & Services Annual", amount:"15.00"},
        {pe:"PE2", name:"Renewable Software & Customer Success (iACV)", amount:"10.00"},
        {pe:"PE3", name:"Renewable Software (SRenewed)", amount:"5.00"}]}
    ]}
  },
  {month:"April 2026", amount:"6,830.00", status:"Paid", payDate:"May 2, 2026", lockDate:"Apr 28, 2026", revDates:"Apr 1 – Apr 30, 2026",
    goalSheet:{period:"Jan 26, 2026 - Jul 26, 2026", total:"4,605.00", items:[
      {pe:"PE1", name:"CX-SVC RENEW ANN|PRI", label:"Prod+Services", weight:"50%", pct:22, attChange:3, payout:"1,320.00", color:PE_COLOR.PE1,
        calc:{incrementalAtt:"3%", totalAtt:"22%", weight:"50%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"4%",
          totalEarned:"1,510.00", prevPaid:"$190.00", result:"1,320.00", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"19%", incr:"3%", mult:"4%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"22%", mult:"4%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}},
      {pe:"PE2", name:"RRA-SW WO SEC_ACV|AG|WM|NPR", label:"Recurring Software", weight:"30%", pct:65, attChange:5, payout:"1,985.00", color:PE_COLOR.PE2,
        calc:{incrementalAtt:"5%", totalAtt:"65%", weight:"30%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"9%",
          totalEarned:"2,038.50", prevPaid:"$53.50", result:"1,985.00", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"-", incr:"-", mult:"-"},
            {range:"50 – 75 %", peRate:".75%", prior:"60%", incr:"5%", mult:"9%", active:true},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"-", mult:"-"},
            {range:"50 – 75 %", peRate:".75%", rev:"65%", mult:"9%", active:true},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}},
      {pe:"PE3", name:"SEC PRD ACV|WM|NPR", label:"Services", weight:"20%", pct:39, attChange:4, payout:"1,300.00", color:PE_COLOR.PE3,
        calc:{incrementalAtt:"4%", totalAtt:"39%", weight:"20%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"9%",
          totalEarned:"1,359.00", prevPaid:"$59.00", result:"1,300.00", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:"2.25%", prior:"35%", incr:"4%", mult:"9%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:"2.25%", rev:"39%", mult:"9%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}}
    ]},
    /* Goal sheet swapped mid-period: amounts already paid on the prior
       sheet are reconciled into the current one (desktop reference) */
    replaced:{period:"Jan 26, 2026 - Jul 26, 2026", total:"$-850.00",
      note:"Reconciled from previous goal sheet. Not a negative payment — these amounts were already paid and are netted into your Current Goal Sheet above.",
      items:[
        {pe:"PE1", label:"Prod+Services", paidNote:"Paid up to Mar", paid:"$650.00", amount:"$-650.00"},
        {pe:"PE2", label:"Recurring Software", paidNote:"Paid up to Mar", paid:"$100.00", amount:"$-100.00"},
        {pe:"PE3", label:"Services", paidNote:"Paid up to Mar", paid:"$100.00", amount:"$-100.00"}
      ]},
    spiff:{total:"2,125.00", items:[{name:"Q4FY24 Slam Dunk", amount:"$2,125.00"}]},
    draws:{total:"50.00", items:[{chip:"MIPS", name:"Monthly Incentive Payment", amount:"$50.00"}]}, adj:{total:"50.00", items:[{chip:"ICC", name:"Payment Adjustment", amount:"$50.00"}]}, otb:{total:"0.00", items:[]}, past:{total:"0.00", items:[]}
  },
  {month:"March 2026", amount:"6,189.00", status:"Paid", payDate:"Apr 2, 2026", lockDate:"Mar 28, 2026", revDates:"Mar 1 – Mar 31, 2026",
    goalSheet:{period:"Jan 26, 2026 - Jul 26, 2026", total:"3,964.00", items:[
      {pe:"PE1", label:"Prod+Services", weight:"50%", pct:20, attChange:2, payout:"1,100.00", color:PE_COLOR.PE1},
      {pe:"PE2", label:"Recurring Software", weight:"30%", pct:60, attChange:3, payout:"1,764.00", color:PE_COLOR.PE2},
      {pe:"PE3", label:"Services", weight:"20%", pct:35, attChange:5, payout:"1,100.00", color:PE_COLOR.PE3}
    ]},
    spiff:{total:"2,125.00", items:[]}, draws:{total:"50.00", items:[]}, adj:{total:"50.00", items:[]}, otb:{total:"0.00", items:[]}, past:{total:"0.00", items:[]}
  }
];

/* Older statement months (fake data) so Payments can show the last 12 months.
   amount = goal sheet + SPIFF + $50 draws + $50 adj, so the breakdown donut sums. */
const fmtAmt = n => n.toLocaleString("en-US", {minimumFractionDigits:2, maximumFractionDigits:2});
function pastStatement([month, gsTotal, spiffTotal, pcts, payDate, lockDate, revDates, gsPeriod]) {
  const g = parseFloat(gsTotal.replace(/,/g,""));
  const sp = parseFloat(spiffTotal.replace(/,/g,""));
  return {month, amount:fmtAmt(g+sp+100), status:"Paid", payDate, lockDate, revDates,
    goalSheet:{period:gsPeriod, total:gsTotal, items:[
      {pe:"PE1", label:"Prod+Services", weight:"50%", pct:pcts[0], attChange:2, payout:fmtAmt(g*0.5), color:PE_COLOR.PE1},
      {pe:"PE2", label:"Recurring Software", weight:"30%", pct:pcts[1], attChange:3, payout:fmtAmt(g*0.3), color:PE_COLOR.PE2},
      {pe:"PE3", label:"Services", weight:"20%", pct:pcts[2], attChange:2, payout:fmtAmt(g*0.2), color:PE_COLOR.PE3}
    ]},
    spiff:{total:spiffTotal, items:[{name:"Quarterly SPIFF", amount:"$"+spiffTotal}]},
    draws:{total:"50.00", items:[{chip:"MIPS", name:"Monthly Incentive Payment", amount:"$50.00"}]},
    adj:{total:"50.00", items:[{chip:"ICC", name:"Payment Adjustment", amount:"$50.00"}]},
    otb:{total:"0.00", items:[]}, past:{total:"0.00", items:[]}
  };
}
const H2_FY25 = "Jul 25, 2025 - Jan 25, 2026", H1_FY26 = "Jan 26, 2026 - Jul 26, 2026";
const olderPaymentPeriods = [
  ["June 2025",     "3,412.00", "1,900.00", [18,42,28], "Jul 2, 2025", "Jun 28, 2025", "Jun 1 – Jun 30, 2025", H2_FY25],
  ["July 2025",     "4,120.50", "1,827.00", [21,48,31], "Aug 2, 2025", "Jul 28, 2025", "Jul 1 – Jul 31, 2025", H2_FY25],
  ["August 2025",   "3,845.00", "1,375.00", [24,51,33], "Sep 2, 2025", "Aug 28, 2025", "Aug 1 – Aug 31, 2025", H2_FY25],
  ["September 2025","4,610.00", "2,090.00", [29,57,38], "Oct 2, 2025", "Sep 28, 2025", "Sep 1 – Sep 30, 2025", H2_FY25],
  ["October 2025",  "3,988.00", "1,152.00", [33,61,41], "Nov 2, 2025", "Oct 28, 2025", "Oct 1 – Oct 31, 2025", H2_FY25],
  ["November 2025", "5,240.00", "1,730.00", [38,68,46], "Dec 2, 2025", "Nov 28, 2025", "Nov 1 – Nov 30, 2025", H2_FY25],
  ["December 2025", "4,455.00", "2,485.00", [45,74,52], "Jan 2, 2026", "Dec 28, 2025", "Dec 1 – Dec 31, 2025", H2_FY25],
  ["January 2026",  "3,610.00", "1,240.00", [12,48,22], "Feb 2, 2026", "Jan 28, 2026", "Jan 1 – Jan 31, 2026", H1_FY26],
  ["February 2026", "4,206.00", "1,425.00", [16,54,28], "Mar 2, 2026", "Feb 28, 2026", "Feb 1 – Feb 28, 2026", H1_FY26]
].map(pastStatement);

/* Chronological (oldest → newest): June 2025 … May 2026 */
const fullPaymentPeriods = [...olderPaymentPeriods, ...recentPaymentPeriods.slice().reverse()];

/* Goals — one entry per plan element tab (PE1, PE2, PE3, KSO, OTB, NDR) */
/* blColor = the lighter backlog segment tint, matching planElements so the
   revenue/backlog distinction reads the same on Goals as on At A Glance */
const goalTabs = [
  {id:"PE1", name:"Prod+Services",       color:PE_COLOR.PE1, blColor:"#fbbf24", goal:"$109k", attPct:24,   bookingsAmt:"$68k", bookingsPct:63,  revenueAmt:"$26k", revenuePct:24,  backlogAmt:"$42k", backlogPct:39, incentive:"$1,585.50"},
  {id:"PE2", name:"Recurring Software",  color:PE_COLOR.PE2, blColor:"#6ee7b7", goal:"$87k",  attPct:71, bookingsAmt:"$90k", bookingsPct:103, revenueAmt:"$62k", revenuePct:71,  backlogAmt:"$28k", backlogPct:32, incentive:"$1,019.25"},
  {id:"PE3", name:"Services",            color:PE_COLOR.PE3, blColor:"#93c5fd", goal:"$90k",  attPct:44,   bookingsAmt:"$85k", bookingsPct:94,  revenueAmt:"$40k", revenuePct:44,  backlogAmt:"$45k", backlogPct:50, incentive:"$755.00"},
  {id:"KSO", name:"Key Sales Objectives",color:PE_COLOR.KSO, goal:"$2.5k", attPct:100,  bookingsAmt:"—",    bookingsPct:100, revenueAmt:"—",    revenuePct:100, backlogAmt:"—",    backlogPct:0,  incentive:"$2,500.00"},
  {id:"OTB", name:"On-Top Bonus",        color:PE_COLOR.OTB, blColor:"#c4b5fd", goal:"$5k",   attPct:65,   bookingsAmt:"$3.3k",bookingsPct:65,  revenueAmt:"$2.1k",revenuePct:42,  backlogAmt:"$1.2k",backlogPct:24, incentive:"$100.00"},
  {id:"NDR", name:"Net Dollar Retention",color:PE_COLOR.NDR, blColor:"#67e8f9", goal:"110%",  attPct:88,   bookingsAmt:"104%", bookingsPct:88,  revenueAmt:"102%", revenuePct:82,  backlogAmt:"6%",   backlogPct:12, incentive:"$0.00"}
];

/* Example goal sheet rendered inside the View Goal Sheet popup */
const goalSheetExample = {
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
const orders = [
  {id:"SO-105488", pe:"PE3", status:"Full Revenue", customer:"GlobalNet Inc",      partner:"Direct",           bookings:"$9,600",  backlog:"$0",      revenue:"$9,600"},
  {id:"SO-105310", pe:"PE2", status:"Full Revenue", customer:"BlueStar Solutions", partner:"Insight Enterpr.", bookings:"$17,800", backlog:"$0",      revenue:"$17,800"},
  {id:"SO-105188", pe:"PE1", status:"Full Revenue", customer:"Vertex Dynamics",    partner:"SHI Internat.",    bookings:"$14,500", backlog:"$0",      revenue:"$14,500"},
  {id:"SO-105078", pe:"PE1", status:"Partial",      customer:"Helix Networks",     partner:"CDW Corp.",        bookings:"$21,000", backlog:"$14,000", revenue:"$7,000"},
  {id:"SO-104821", pe:"PE1", status:"Full Revenue", customer:"Acme Corp",          partner:"Direct",           bookings:"$12,500", backlog:"$0",      revenue:"$12,500"},
  {id:"SO-104650", pe:"PE1", status:"Backlog",      customer:"Cortex Financial",   partner:"Direct",           bookings:"$23,000", backlog:"$23,000", revenue:"$0"},
  {id:"SO-104512", pe:"PE3", status:"Full Revenue", customer:"Summit Digital",     partner:"CDW Corp.",        bookings:"$8,850",  backlog:"$0",      revenue:"$8,850"}
];
const ORDER_STATUSES = ["All Statuses", "Backlog", "Full Revenue", "Partial"];
const ORDER_PES = ["All Plan Elements", "PE1 - Prod+Services", "PE2 - Recurring Software", "PE3 - Services"];

/* Order Search — searchable field types (from the desktop reference).
   Demo data only carries SO number / customer / partner, so each type maps
   to its closest field; unmapped types search across all of them. */
const ORDER_SEARCH_TYPES = ["SO Number", "Deal ID", "PO Number", "Subscription Reference ID", "Book Date Range", "End Customer", "Account Name (UCD C4)", "Account ID (UCD C4)"];
const ORDER_TYPE_FIELDS = {"SO Number":["id"], "End Customer":["customer"], "Account Name (UCD C4)":["customer","partner"], "Account ID (UCD C4)":["customer","partner"]};

/* Revenue Transactions — shown by the PDF/breakdown icon on Payments (per plan element) */
const revenueTxns = {
  PE1:{total:"26,000.00", rows:[
    {so:"SO-105201", date:"May 12, 2026", customer:"Meridian Corp",   rev:"$11,500.00"},
    {so:"SO-105189", date:"May 8, 2026",  customer:"Apex Healthcare", rev:"$8,200.00"},
    {so:"SO-104998", date:"Apr 28, 2026", customer:"NovaTech Inc",    rev:"$6,300.00"}
  ]},
  PE2:{total:"62,000.00", rows:[
    {so:"SO-105144", date:"Apr 22, 2026", customer:"ClearPath Systems",  rev:"$18,500.00"},
    {so:"SO-105044", date:"Apr 7, 2026",  customer:"Quantum Analytics",  rev:"$12,000.00"},
    {so:"SO-104515", date:"Mar 8, 2026",  customer:"BlueStar Solutions", rev:"$15,500.00"},
    {so:"SO-104089", date:"Feb 22, 2026", customer:"Vector Systems",     rev:"$16,000.00"}
  ]},
  PE3:{total:"40,000.00", rows:[
    {so:"SO-105112", date:"Apr 15, 2026", customer:"Summit Digital", rev:"$15,000.00"},
    {so:"SO-104876", date:"Mar 20, 2026", customer:"Orion Networks", rev:"$14,500.00"},
    {so:"SO-104655", date:"Mar 1, 2026",  customer:"Phoenix Labs",   rev:"$10,500.00"}
  ]}
};

/* ════════════════════════════════════════════════════════════════
   DERIVATIONS (pure; shared by the mobile + iPad layouts so the two
   presentations never duplicate business logic)
   ════════════════════════════════════════════════════════════════ */
/* Payment Breakdown donut slices — validated categorical palette in fixed
   CVD-safe order (blue, aqua, yellow, green, violet, red), with per-theme
   steps so each hue clears the card surface it actually renders on. The
   legend rows carry every slice's label + value, covering the two light-mode
   hues that sit under 3:1 contrast. */
const DONUT_LIGHT = ["#2a78d6","#1baf7a","#eda100","#008300","#4a3aa7","#e34948"];
const DONUT_DARK  = ["#3987e5","#199e70","#c98500","#008300","#9085e9","#e66767"];
function paymentDonutItems(p, dark) {
  const pal = dark ? DONUT_DARK : DONUT_LIGHT;
  return [
    {label:"Goal Sheet", value:parseFloat(p.goalSheet.total.replace(/,/g,'')), color:pal[0]},
    {label:"SPIFF & Bonus", value:parseFloat(p.spiff.total.replace(/,/g,'')), color:pal[1]},
    {label:"Draws", value:parseFloat(p.draws.total.replace(/,/g,'')), color:pal[2]},
    {label:"Adjustments", value:parseFloat(p.adj.total.replace(/,/g,'')), color:pal[3]},
    {label:"On-Top Bonus", value:parseFloat(p.otb.total.replace(/,/g,'')), color:pal[4]},
    {label:"Past Goal Sheets", value:parseFloat(p.past.total.replace(/,/g,'')), color:pal[5]}
  ].filter(d=>d.value>0);
}

/* Little type chips on accordion detail rows (desktop reference) */
const SECTION_CHIP = {spiff:"SPIFF", otb:"OTB"};
/* sections whose item amounts render in accent blue on the web */
const ACCENT_AMT_SECTIONS = {spiff:true, adj:true, otb:true, draws:true};

/* ── Payment History popups (per line item, keyed by item name) ──
   Blue amounts in the payment dropdowns open these. `mb` = calendar
   months back from the demo today (May 26, 2026): Past 6 Months = mb≤5,
   Past Year = mb≤12. Totals stay consistent with the statement data
   (e.g. ICC adjustments were $50 in every prior statement; the plan
   advance nets to the $35 MIPS line after its full reversal pair). */
const PAYMENT_HISTORY = {
  "Q2 Cloud Migration SPIFF": {
    current:{book:"01-May-2026", processed:"10-May-2026", bonus:"1,250.00", payment:"1,250.00", comments:"Q2 Cloud Migration SPIFF – Milestone 1", createdBy:"askg2c", program:"WW_CLOUD_SPIFF"},
    rows:[
      {date:"Apr 14, 2026", details:"Q2 Cloud Migration SPIFF", amount:1250.00, mb:1},
      {date:"Nov 14, 2025", details:"Q1FY26 Cloud Migration SPIFF", amount:1100.00, mb:6},
      {date:"Apr 14, 2025", details:"Q4FY25 Cloud Migration SPIFF", amount:950.00, mb:13}
    ]},
  "Partner Acceleration Q2": {
    current:{book:"01-May-2026", processed:"10-May-2026", bonus:"875.00", payment:"875.00", comments:"Partner-sourced bookings payout", createdBy:"askg2c", program:"WW_PARTNER_ACCEL"},
    rows:[
      {date:"Apr 14, 2026", details:"Partner Acceleration Q2", amount:875.00, mb:1},
      {date:"Oct 15, 2025", details:"Partner Acceleration Q1", amount:640.00, mb:7},
      {date:"Apr 14, 2025", details:"Partner Acceleration FY25", amount:590.00, mb:13}
    ]},
  "Monthly Incentive Payment (MIPS)": {
    current:{book:"01-May-2026", processed:"10-May-2026", bonus:"35.00", payment:"35.00", comments:"FY26 Plan Advance", createdBy:"askg2c", program:"WW_PLAN_ADVANCE"},
    rows:[
      {date:"May 9, 2026", details:"FY26 Plan Advance", amount:35.00, mb:0},
      {date:"Oct 15, 2025", details:"FY26H1 Plan advance payment reversal", amount:-8230.77, mb:7},
      {date:"Sep 16, 2025", details:"FY26P01-P02 Plan advance payment", amount:8230.77, mb:8}
    ]},
  "Recoverable Draw": {
    current:{book:"01-May-2026", processed:"10-May-2026", bonus:"15.00", payment:"15.00", comments:"Recoverable draw – H1 balance", createdBy:"askg2c", program:"WW_RECOV_DRAW"},
    rows:[
      {date:"May 9, 2026", details:"Recoverable Draw", amount:15.00, mb:0},
      {date:"Apr 9, 2026", details:"Recoverable Draw", amount:15.00, mb:1},
      {date:"Mar 9, 2026", details:"Recoverable Draw", amount:15.00, mb:2},
      {date:"Nov 7, 2025", details:"Recoverable Draw", amount:15.00, mb:6}
    ]},
  "ICC True-up Adjustment": {
    current:{book:"03-May-2026", processed:"12-May-2026", bonus:"73.50", payment:"73.50", comments:"ICC true-up for April revenue", createdBy:"askg2c", program:"WW_ICC_TRUEUP"},
    rows:[
      {date:"May 2, 2026", details:"ICC True-up Adjustment", amount:50.00, mb:0},
      {date:"Apr 2, 2026", details:"ICC True-up Adjustment", amount:50.00, mb:1},
      {date:"Mar 2, 2026", details:"ICC True-up Adjustment", amount:50.00, mb:2},
      {date:"Feb 2, 2026", details:"ICC True-up Adjustment", amount:50.00, mb:3},
      {date:"Jan 2, 2026", details:"ICC True-up Adjustment", amount:50.00, mb:4},
      {date:"Dec 2, 2025", details:"ICC True-up Adjustment", amount:50.00, mb:5},
      {date:"Nov 2, 2025", details:"ICC True-up Adjustment", amount:50.00, mb:6},
      {date:"Oct 2, 2025", details:"ICC True-up Adjustment", amount:50.00, mb:7},
      {date:"Sep 2, 2025", details:"ICC True-up Adjustment", amount:50.00, mb:8},
      {date:"Aug 2, 2025", details:"ICC True-up Adjustment", amount:50.00, mb:9},
      {date:"Jul 2, 2025", details:"ICC True-up Adjustment", amount:50.00, mb:10}
    ]},
  "Q4FY24 Slam Dunk": {
    rows:[
      {date:"Apr 14, 2026", details:"Q4FY24 Slam Dunk true-up", amount:2125.00, mb:1},
      {date:"Aug 15, 2024", details:"Q4FY24 Slam Dunk", amount:1875.00, mb:21}
    ]}
};
PAYMENT_HISTORY["MIPS"] = PAYMENT_HISTORY["Monthly Incentive Payment (MIPS)"];
PAYMENT_HISTORY["Monthly Incentive Payment"] = PAYMENT_HISTORY["Monthly Incentive Payment (MIPS)"];
PAYMENT_HISTORY["ICC Adj"] = PAYMENT_HISTORY["ICC True-up Adjustment"];
PAYMENT_HISTORY["Payment Adjustment"] = PAYMENT_HISTORY["ICC True-up Adjustment"];

/* ── On-Top Bonus calc popups (keyed by item name) ── Formula follows the
   desktop OTB reference: TI rate × OTB target incentive × proration ×
   payout multiplier = payment. 10% × 4,000 × 100% × 25% = 100.00, and
   prior 40% + incremental 25% = the 65% OTB attainment on the Goals tab. */
const OTB_CALC = {
  "PIOT PRODUCT RR|PL": {
    tiRate:"10%", targetIncentive:"4,000.00", proration:"100%", payoutRate:"25%", result:"100.00", incrementalAtt:"25%", rateName:"CS402",
    rows:[
      {range:"0 – 125 %", peRate:"1%", prior:"40%", incr:"25%", mult:"25%", active:true},
      {range:"125+ %", peRate:"0%", prior:"-", incr:"-", mult:"-"}
    ]}
};

/* ── KSO Calculation popup (goal-sheet KSO row) ── Fixed bonus: total
   earned − previously paid = monthly payment. Aligned with the Goals-tab
   KSO quarters: Q1 2026's reviewed $2,500 is the amount paying out in the
   May statement (nothing previously paid this FY), Q2 is still in pending
   review, and prior history is the FY25 bonuses. */
const KSO_CALC = {
  earned:"2,500.00", prevPaid:"0.00", result:"2,500.00",
  history:[
    {date:"Aug 4, 2025", details:"FY25 H2 KSO Bonus", amount:2200.00, mb:9},
    {date:"Feb 3, 2025", details:"FY25 H1 KSO Bonus", amount:1800.00, mb:15}
  ]
};

function paymentSections(p) {
  return [
    {key:"goalSheet", label:"Current Goal Sheet", amount:"$"+p.goalSheet.total, period:p.goalSheet.period},
    {key:"spiff", label:"SPIFF & Bonus", amount:"$"+p.spiff.total},
    {key:"draws", label:"Draws & Guarantees", amount:"$"+p.draws.total},
    {key:"adj", label:"Payment Adjustments", amount:"$"+p.adj.total},
    {key:"otb", label:"On-Top Bonuses", amount:"$"+p.otb.total},
    {key:"past", label:"Past Goal Sheets", amount:"$"+p.past.total}
  ];
}

function deriveOrders(query, type, status="All Statuses", pe="All Plan Elements") {
  const q = query.trim().toLowerCase();
  const fields = ORDER_TYPE_FIELDS[type] || ["id", "customer", "partner"];
  let list = q ? orders.filter(o => fields.some(f => o[f].toLowerCase().includes(q))) : orders;
  if (status !== "All Statuses") list = list.filter(o => o.status === status);
  if (pe !== "All Plan Elements") list = list.filter(o => o.pe === pe.slice(0, 3));
  return {q, list};
}

/* ════════════════════════════════════════════════════════════════
   SHARED VISUAL PRIMITIVES
   ════════════════════════════════════════════════════════════════ */

/* Single-value attainment donut with center label (pie-first language) */
function AttainDonut({pct, color, size=104, stroke=13, sub="ATTAINMENT"}) {
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  const dash = Math.min(pct, 100) / 100 * circ;
  return <div className="m-donut2" style={{width:size, height:size}}>
    <svg width={size} height={size}>
      <circle className="m-donut-track-ring" cx={c} cy={c} r={r} fill="none" strokeWidth={stroke}/>
      <circle cx={c} cy={c} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeLinecap="round"
        strokeDasharray={`${dash} ${circ - dash}`} transform={`rotate(-90 ${c} ${c})`}
        style={{transition:"stroke-dasharray .8s cubic-bezier(.4,0,.2,1)"}}/>
    </svg>
    <div className="m-donut2-center">
      <b style={{color, fontSize:size*0.22}}>{pct}%</b>
      {sub && <small>{sub}</small>}
    </div>
  </div>;
}

/* Multi-segment donut for proportional breakdowns (payment breakdown).
   Hovering a slice dims the others and shows a cursor-following tooltip. */
function SegmentDonut({items, total, size=180, stroke=26, centerTop, centerSub, interactive=false}) {
  const r = (size - stroke) / 2, c = size / 2, circ = 2 * Math.PI * r;
  const [hover, setHover] = useState(null);
  const [pos, setPos] = useState({x:0, y:0});
  const wrapRef = useRef(null);
  /* 2px of surface between slices — keeps adjacent hues separated (each
     slice draws slightly short of its arc; offsets still use the full arc) */
  const GAP = items.length > 1 ? 2 : 0;
  let offset = 0;
  const segs = items.map(d => {
    const dash = (d.value / total) * circ;
    const seg = {dash: Math.max(dash - GAP, 1), gap: circ - Math.max(dash - GAP, 1), offset, color: d.color};
    offset += dash;
    return seg;
  });
  const onMove = e => {
    if (!wrapRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    setPos({x:e.clientX - rect.left, y:e.clientY - rect.top});
  };
  const hv = hover !== null ? items[hover] : null;

  return <div className="m-donut2" style={{width:size, height:size}} ref={wrapRef}
    onMouseMove={interactive ? onMove : undefined} onMouseLeave={()=>setHover(null)}>
    <svg width={size} height={size}>
      {segs.map((s,i)=><circle key={i} cx={c} cy={c} r={r} fill="none" strokeWidth={stroke}
        strokeDasharray={`${s.dash} ${s.gap}`} strokeDashoffset={-s.offset} transform={`rotate(-90 ${c} ${c})`}
        onMouseEnter={interactive ? ()=>setHover(i) : undefined}
        style={{stroke:s.color, cursor:interactive?"pointer":"default",
          opacity: hover===null || hover===i ? 1 : 0.35,
          filter: hover===i ? "drop-shadow(0 0 6px "+s.color+")" : "none",
          transition:"opacity .15s, filter .15s"}}/>)}
    </svg>
    <div className="m-donut2-center">
      <b style={{fontSize:size*0.125}}>{centerTop}</b>
      {centerSub && <small>{centerSub}</small>}
    </div>
    {hv && <div className="m-donut-tip" style={{left:pos.x, top:pos.y}}>
      <span className="m-donut-tip-dot" style={{background:hv.color}}/>
      <div className="m-donut-tip-txt">
        <b>{hv.label}</b>
        <span>${hv.value.toLocaleString(undefined,{minimumFractionDigits:2})} · {((hv.value/total)*100).toFixed(0)}%</span>
      </div>
    </div>}
  </div>;
}

/* Bookings / Revenue / Backlog dual-bar (kept from desktop, narrowed) */
function BookingsBar({pe}) {
  const scale = Math.max(pe.bookingsPct, 105);
  const bookingsW = (pe.bookingsPct / scale) * 100;
  const revW = (pe.revenuePct / pe.bookingsPct) * 100;
  const blW = (pe.backlogPct / pe.bookingsPct) * 100;
  const markerPos = (100 / scale) * 100;
  return <div className="m-pe-bar-section">
    <div className="m-pe-book-row"><span className="m-pe-book-icon"></span> Bookings <b>{pe.bookingsAmt}</b> {pe.bookingsPct}%</div>
    <div className="m-pe-bar-track">
      <div className="m-pe-bar-bookings" style={{width:bookingsW+"%"}}>
        <div className="m-pe-bar-rev" style={{width:revW+"%", background:pe.color}}></div>
        <div className="m-pe-bar-bl" style={{width:blW+"%", background:pe.blColor||pe.color}}></div>
      </div>
      {/* tick marks 100% of the bookings GOAL — labeled so it isn't read
          against the revenue-attainment % shown in the donut next to it */}
      <div className="m-pe-bar-100" style={{left:markerPos+"%"}}><span>Goal</span></div>
    </div>
    <div className="m-pe-legend">
      <span><i className="m-dot" style={{background:pe.color}}></i> Revenue <b>{pe.revenueAmt}</b> {pe.revenuePct}%</span>
      <span><i className="m-dot" style={{background:pe.blColor||pe.color}}></i> Backlog <b>{pe.backlogAmt}</b> {pe.backlogPct}%</span>
    </div>
  </div>;
}

/* Full-screen popup takeover (100% of the phone screen, opaque, no bleed-through) */
function FullScreenPopup({title, subtitle, tabs, activeTab, onTab, onClose, children}) {
  return <div className="m-fs">
    <div className="m-fs-hdr">
      <div className="m-fs-hdr-text">
        <b>{title}</b>
        {subtitle && <small>{subtitle}</small>}
      </div>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    {tabs && <div className="m-fs-tabs">
      {tabs.map(t=><button key={t} className={`m-fs-tab ${activeTab===t?"on":""}`} onClick={()=>onTab(t)}>{t}</button>)}
    </div>}
    <div className="m-fs-body">{children}</div>
  </div>;
}

/* Horizontal formula: Weight × Target Incentive × Proration × Payout Rate = Result.
   weightLabel overrides the first factor's label (OTB uses "On Top Bonus TI Rate"). */
function FormulaStrip({weight, targetIncentive, proration, payoutRate, result, totalEarned, prevPaid, weightLabel="Weight"}) {
  const factors = [
    {v:weight, l:weightLabel},
    {v:amt(targetIncentive), l:"Target Incentive"},
    {v:proration, l:"Proration"},
    {v:payoutRate, l:"Payout Rate Multiplier"}
  ];
  return <div className="m-formula">
    {factors.map((f,i)=><React.Fragment key={i}>
      {i>0 && <span className="m-formula-op">×</span>}
      <div className="m-formula-factor"><b>{f.v}</b><small>{f.l}</small></div>
    </React.Fragment>)}
    <span className="m-formula-op m-formula-eq">=</span>
    {prevPaid !== undefined
      ? <>
        <div className="m-formula-factor"><b>{amt(totalEarned)}</b><small>Total Earned</small></div>
        <span className="m-formula-op">−</span>
        <div className="m-formula-factor"><b>{amt(prevPaid)}</b><small>Previously Paid</small></div>
        <span className="m-formula-op m-formula-eq">=</span>
        <div className="m-formula-factor"><b className="m-formula-result">{amt(result)}</b><small>Monthly Payment</small></div>
      </>
      : <div className="m-formula-result">{amt(result)}</div>}
  </div>;
}

function Expandable({title, defaultOpen=false, children}) {
  const [open, setOpen] = useState(defaultOpen);
  return <div className="m-exp">
    <div className="m-exp-hdr" onClick={()=>setOpen(!open)}>
      <span>{title}</span>
      <ChevronDown size={16} className={open?"m-exp-chev open":"m-exp-chev"}/>
    </div>
    {open && <div className="m-exp-body">{children}</div>}
  </div>;
}

/* Hide/Show pill — dots out payment figures so a seller can screen-share
   without exposing their pay. `light` = on-gradient (hero) variant.
   The zone wrapper absorbs clicks/Enter in a buffer around the button so a
   near-miss inside a clickable card (hero → Payments) doesn't navigate. */
function HideBtn({s, light=false}) {
  const Icon = s.hideAmts ? Eye : EyeOff;
  return <span className="m-hide-zone" onClick={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}>
    <button className={`m-hide-btn ${light?"m-hide-btn-light":""}`} aria-pressed={s.hideAmts}
      onClick={()=>s.setHideAmts(!s.hideAmts)}>
      <Icon size={13}/> {s.hideAmts ? "Show" : "Hide"}
    </button>
  </span>;
}

/* One collapsible insight card — details stay hidden behind a chevron
   dropdown so the feed shows a clean list of titles. */
function InsightCard({badge, badgeColor, tag, title, children}) {
  const [open, setOpen] = useState(false);
  return <div className="m-insight-card" role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-insight-top">
      <span className="m-insight-badge" style={{color:badgeColor, borderColor:badgeColor}}>{badge}</span>
      {tag}
    </div>
    <div className="m-insight-title-row">
      <b className="m-insight-title">{title}</b>
      <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    {open && <p className="m-insight-desc">{children}</p>}
  </div>;
}

/* Insights section body (mobile + iPad): the seller's pinned Insight Canvas
   picks, or the AI-selected cards when nothing is pinned. */
function InsightCardsList({s}) {
  const pinned = INSIGHT_INDEX.filter(it=>s.pinnedInsights.includes(it.id));
  if (!pinned.length) return <>{insightCards.map((c,i)=>
    <InsightCard key={i} badge={c.peBadge} badgeColor={c.peColor} title={c.title}
      tag={<span className="m-insight-tag" style={{color:c.tagColor}}>{c.tag}</span>}>
      {maskText(c.desc)}
    </InsightCard>)}</>;
  return <>{pinned.map(it=>
    <InsightCard key={it.id} badge={it.cat} badgeColor={it.catColor} title={it.title}
      tag={it.live ? <span className="ic-live">LIVE</span> : null}>
      {it.desc}
    </InsightCard>)}</>;
}

/* Section header button that opens the Insight Canvas */
function InsightCanvasBtn({s}) {
  return <button className="m-goalsheet-btn" onClick={()=>s.setInsightCanvasOpen(true)}>
    <Layers size={13}/> Insight Canvas{s.pinnedInsights.length>0 && ` · ${s.pinnedInsights.length}`}
  </button>;
}

/* Bell dropdown — Notifications | My Reminders tabs (desktop reference).
   Reminders live in app state so they persist across pages and devices. */
function NotifDropdown({s, onClose, ipad=false}) {
  const [tab, setTab] = useState("notifications");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const add = () => {
    if (!note.trim()) return;
    s.setReminders(prev=>[...prev, {id:Date.now(), text:note.trim(), date, done:false}]);
    setNote(""); setDate("");
  };
  const toggle = id => s.setReminders(prev=>prev.map(r=>r.id===id ? {...r, done:!r.done} : r));
  const remove = id => s.setReminders(prev=>prev.filter(r=>r.id!==id));
  return <div className={`m-notif-dropdown ${ipad?"i-notif-dropdown":""}`}>
    <div className="m-ntabs">
      <button className={tab==="notifications"?"on":""} onClick={()=>setTab("notifications")}>Notifications</button>
      <button className={tab==="reminders"?"on":""} onClick={()=>setTab("reminders")}>My Reminders</button>
      <button className="m-ntabs-close" onClick={onClose} aria-label="Close"><X size={15}/></button>
    </div>
    {tab==="notifications" && (s.notifs.length === 0
      ? <div className="m-rem-empty">You're all caught up — no new notifications.</div>
      : s.notifs.map(n=>{
        const Ic = {amber:AlertTriangle, green:Check, blue:Info}[n.type] || Info;
        return <div key={n.title} className={`m-notif m-notif-${n.type}`}>
          <Ic size={16} className="m-notif-ic"/>
          <div className="m-notif-body">
            <b>{n.title}</b>
            <span>{n.desc}</span>
            <button className="m-notif-action" onClick={()=>{ s.setTab(n.nav); onClose(); }}>{n.action}</button>
          </div>
          <button className="m-notif-x" onClick={()=>s.setNotifs(list=>list.filter(x=>x!==n))} aria-label={`Dismiss ${n.title}`}><X size={13}/></button>
        </div>;
      }))}
    {tab==="reminders" && <>
      <div className="m-rem-add">
        <input className="m-rem-note" placeholder="Add a reminder note..." value={note}
          onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
        <input className="m-rem-date" type="date" value={date} onChange={e=>setDate(e.target.value)} aria-label="Reminder date"/>
        <button className="m-rem-addbtn" onClick={add}>Add</button>
      </div>
      {s.reminders.map(r=><div key={r.id} className={`m-rem-row ${r.done?"done":""}`}>
        <button className={`m-rem-check ${r.done?"on":""}`} onClick={()=>toggle(r.id)}
          role="checkbox" aria-checked={r.done} aria-label="Mark complete">
          {r.done ? <CheckCircle2 size={21}/> : <span className="m-rem-circle"/>}
        </button>
        <div className="m-rem-txt">
          <b>{r.text}</b>
          <span><Calendar size={11}/> {fmtRemDate(r.date)}</span>
        </div>
        <button className="m-rem-x" onClick={()=>remove(r.id)} aria-label="Delete reminder"><X size={13}/></button>
      </div>)}
      {s.reminders.length===0 && <div className="m-rem-empty">No reminders yet — add one above.</div>}
    </>}
  </div>;
}

/* Utility icons (desktop reference), folded into two buttons to keep the
   header uncluttered. Popovers are informational only — no live links yet. */
const UTIL_ITEMS = [
  {id:"support", Icon:HelpCircle, label:"Support", items:["Help","Open Case"]},
  {id:"dash", Icon:LayoutGrid, label:"Dashboards",
    items:["Next Gen Claiming","Sales Incentive Calendar","MBR","Sales Comp Portal"]},
];
function UtilityIcons({ipad=false}) {
  const [open, setOpen] = useState(null);
  const cur = UTIL_ITEMS.find(u=>u.id===open);
  return <div className={`m-utils ${ipad?"i-utils":""}`}>
    {UTIL_ITEMS.map(u=>
      <button key={u.id} className={`m-util-btn ${open===u.id?"on":""}`} aria-label={u.label}
        aria-expanded={open===u.id} onClick={()=>setOpen(open===u.id?null:u.id)}>
        <u.Icon size={ipad?17:15}/>
      </button>)}
    {cur && <>
      <div className="m-notif-overlay m-util-overlay" onClick={()=>setOpen(null)}/>
      <div className="m-util-pop">
        {cur.items
          ? <><b className="m-util-pop-title">{cur.label}</b>
              {cur.items.map(d=><span key={d} className="m-util-pop-item">{d}</span>)}</>
          : <span className="m-util-pop-label">{cur.label}</span>}
      </div>
    </>}
  </div>;
}

/* Universal mobile header — avatar, name/role, bell with unread count.
   Shown on every mobile page so the top of the app reads consistently. */
function MobileHeader({s}) {
  return <>
    <div className="m-header">
      <div className="m-header-left">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" className="m-avatar" alt=""/>
        <h1>Alex Johnson</h1>
      </div>
      <div className="m-header-actions">
        <UtilityIcons/>
        <div className="m-bell" onClick={()=>s.setNotifOpen(!s.notifOpen)}>
          <Bell size={18}/>{s.notifs.length>0 && <span className="m-bell-count">{s.notifs.length}</span>}
        </div>
      </div>
    </div>
    {s.notifOpen && <><div className="m-notif-overlay" onClick={()=>s.setNotifOpen(false)}/>
      <NotifDropdown s={s} onClose={()=>s.setNotifOpen(false)}/></>}
  </>;
}

/* ════════════════════════════════════════════════════════════════
   AT A GLANCE
   ════════════════════════════════════════════════════════════════ */
/* At A Glance · SPIFF & Bonus — first 2 programs with a see-more toggle,
   shared by the mobile and iPad pages */
function AagSpiffSection({s}) {
  const visible = s.aagSpiffExpanded ? spiffBonus : spiffBonus.slice(0,2);
  return <div className="m-section">
    <div className="m-section-hdr"><h2>SPIFF & BONUS</h2></div>
    {visible.map((sp,i)=><div key={i} className="m-spiff-card m-pe-click" role="button" tabIndex={0}
      aria-label={`Open ${sp.name} on SPIFF & Bonus`} onClick={()=>s.openSpiff(sp.name)}
      onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); s.openSpiff(sp.name); } }}>
      <div className="m-spiff-top">
        <span className="m-spiff-status" style={{color:sp.statusColor, borderColor:sp.statusColor}}>{sp.status}</span>
        <b className="m-spiff-amt" style={{color:sp.statusColor}}>{amt(sp.amount)}</b>
      </div>
      <b className="m-spiff-name">{sp.name}</b>
      <span className="m-spiff-sub">{sp.sub}</span>
      {sp.pct < 100 && <div className="m-spiff-bar-wrap">
        <div className="m-spiff-bar" style={{width:sp.pct+"%", background:sp.statusColor}}></div>
        {sp.prog && <span className="m-spiff-prog">{sp.prog}</span>}
      </div>}
      <small className="m-spiff-date">{sp.date}</small>
    </div>)}
    {spiffBonus.length > 2 && <button className="m-showall m-showall-tight" onClick={()=>s.setAagSpiffExpanded(!s.aagSpiffExpanded)}>
      {s.aagSpiffExpanded ? "Show Fewer" : `See All ${spiffBonus.length} Incentives`}
      <ChevronDown size={14} className={s.aagSpiffExpanded?"up":""}/>
    </button>}
  </div>;
}

/* Goal-sheet period selector (concept only — numbers stay on the demo
   month; the chip + date range swap to sell the interaction) */
const GOAL_SHEET_PERIODS = {
  "H1 2026": "Jan 26, 2026 – Jul 26, 2026",
  "H2 2025": "Jul 27, 2025 – Jan 25, 2026",
};

function AtAGlancePage({s}) {
  const hero = monthlyPayCards.find(c=>c.current);
  const context = monthlyPayCards.filter(c=>!c.current);
  const [sheet, setSheet] = useState("H1 2026");

  return <div className="m-page">
    <MobileHeader s={s}/>

    {/* HERO — current month payment is the single largest element on the page; opens Payments */}
    <div className="m-hero" role="button" tabIndex={0} title="View Payments"
      onClick={()=>s.openPayPeriod(hero.period)} onKeyDown={e=>e.key==="Enter"&&s.openPayPeriod(hero.period)}>
      <div className="m-hero-top">
        <span className="m-hero-label">Current Payment · {hero.month}</span>
        <span className={`m-pay-status m-status-${hero.status.toLowerCase()}`}>{hero.status}</span>
      </div>
      <div className="m-hero-amt-row">
        <span className="m-hero-amt">{amt("$"+hero.amount)}</span>
        <span className="m-hero-usd">USD</span>
      </div>
      <div className="m-hero-meta">
        <span className="m-hero-asof"><Calendar size={11}/> {DATA_AS_OF}<HideBtn s={s} light/></span>
        <span className="m-hero-change">{hero.change} vs Apr · {hero.payDate}</span>
      </div>
    </div>

    {/* Prev / next context — de-emphasized strip */}
    <div className="m-context-strip">
      {context.map((c,i)=><div key={i} className={`m-context-card ${c.period?"m-context-click":""}`}
        role={c.period?"button":undefined} tabIndex={c.period?0:undefined} title={c.period?`View ${c.month} payment`:undefined}
        onClick={c.period?()=>s.openPayPeriod(c.period):undefined}
        onKeyDown={c.period?(e=>e.key==="Enter"&&s.openPayPeriod(c.period)):undefined}>
        <span className="m-context-month">{c.month}</span>
        <b className="m-context-amt">{amt("$"+c.amount)}</b>
        <span className={`m-pay-status m-status-${c.status.toLowerCase()}`}>{c.status}</span>
      </div>)}
    </div>

    {/* Plan Elements — donut is the dominant visual per card */}
    <div className="m-section-label"><Menu size={13} className="m-section-icon"/> PLAN ELEMENTS & INCENTIVES</div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>PLAN ELEMENTS</h2>
        <span className="m-badge-selwrap">
          <select className="m-badge-select" value={sheet} onChange={e=>setSheet(e.target.value)} aria-label="Goal sheet period">
            {Object.keys(GOAL_SHEET_PERIODS).map(k=><option key={k}>{k}</option>)}
          </select>
          <ChevronDown size={11}/>
        </span>
      </div>
      <small className="m-pe-sub">All values in USD · {GOAL_SHEET_PERIODS[sheet]}</small>
      {planElements.map((pe,i)=><div key={i} className="m-pe-card m-pe-flat m-pe-click" role="button" tabIndex={0}
        aria-label={`Open ${pe.id} on Goals`} onClick={()=>s.openGoal(pe.id)}
        onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); s.openGoal(pe.id); } }}>
        <div className="m-pe-top">
          <div className="m-pe-left"><span className="m-pe-badge" style={{background:pe.color}}>{pe.id}</span><b>{pe.name}</b></div>
          <span className="m-pe-goal">{pe.goal}</span>
        </div>
        <div className="m-pe-att-row">
          <b className="m-pe-att-big" style={{color:pe.color}}>{pe.attPct}%</b>
          <span className="m-pe-att-lbl">REVENUE ATT.</span>
        </div>
        <BookingsBar pe={pe}/>
      </div>)}
    </div>

    {/* SPIFF & Bonus — first 2 programs, expandable */}
    <AagSpiffSection s={s}/>

    {/* Insights — single column, image/chart-forward; pinned via Insight Canvas */}
    <div className="m-section">
      <div className="m-section-hdr"><h2>Insights</h2><InsightCanvasBtn s={s}/></div>
      <InsightCardsList s={s}/>
    </div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   PAYMENTS
   ════════════════════════════════════════════════════════════════ */
/* Shared payment sub-components (consumed by mobile PaymentsPage + iPad) */
function PeriodChips({s}) {
  /* Chronological chips (oldest → newest). Collapsed shows April · May ·
     June-upcoming so the open statement sits front and center; the compact
     chevron toggle expands to the last 12 months. */
  const wrapRef = useRef(null);
  const all = fullPaymentPeriods.map((pr,i)=>({pr,i}));
  const visible = s.showAllPeriods ? all : all.slice(-2);
  useEffect(()=>{
    if (!wrapRef.current) return;
    if (s.showAllPeriods) wrapRef.current.querySelector(".m-period-active")?.scrollIntoView({inline:"nearest", block:"nearest"});
    else wrapRef.current.scrollLeft = 0;   // keep the toggle visible at the left edge
  }, [s.showAllPeriods]);
  return <div className="m-period-scroll" ref={wrapRef}>
    <button className="m-period-more m-period-mini" onClick={()=>s.setShowAllPeriods(!s.showAllPeriods)}
      aria-label={s.showAllPeriods ? "Show last 3 months" : "Show last 12 months"}
      title={s.showAllPeriods ? "Last 3 months" : "Last 12 months"}>
      <ChevronRight size={15} className={s.showAllPeriods?"back":""}/>
    </button>
    {visible.map(({pr,i})=><div key={pr.month} className={`m-period-item ${i===s.periodIdx?"m-period-active":""}`} onClick={()=>s.setPeriodIdx(i)}>
      <span className="m-period-month">{pr.month}</span>
      <b className="m-period-amt">{amt("$"+pr.amount)}</b>
      <span className={`m-pay-status m-status-${pr.status.toLowerCase()}`}>{pr.status}</span>
    </div>)}
    {/* upcoming month (no statement yet) — keeps the open month centered */}
    <div className="m-period-item m-period-ghost" aria-disabled="true">
      <span className="m-period-month">June 2026</span>
      <b className="m-period-amt">{amt("$0.00")}</b>
      <span className="m-pay-status m-status-upcoming">Upcoming</span>
    </div>
  </div>;
}

/* compact: legend rows under 5% of the total fold into a "N more items"
   toggle so small line items don't eat the page (mobile). iPad has room,
   so it renders fully expanded. The donut always shows every slice. */
function PaymentBreakdownCard({p, s, donutSize=180, compact=false}) {
  const total = parseFloat(p.amount.replace(/,/g,''));
  const donutItems = paymentDonutItems(p, s.theme==="dark");
  const [showAll, setShowAll] = useState(false);
  const minor = compact ? donutItems.filter(d=>d.value/total < .05) : [];
  const fold = minor.length >= 2;
  const rows = fold && !showAll ? donutItems.filter(d=>d.value/total >= .05) : donutItems;
  const minorSum = minor.reduce((a,d)=>a+d.value,0);
  const legRow = (d,i) => {
    const pct = ((d.value/total)*100).toFixed(0);
    return <div key={i} className="m-leg2" style={{borderLeftColor:d.color}}>
      <span className="m-leg2-badge" style={{background:d.color}}>{pct}%</span>
      <span className="m-leg2-label">{d.label}</span>
      <b className="m-leg2-val">{amt("$"+d.value.toLocaleString(undefined,{minimumFractionDigits:2}))}</b>
    </div>;
  };
  return <div className="m-section">
    <div className="m-section-hdr"><h2>Payment Breakdown · {p.month}</h2><span className={`m-pay-status m-status-${p.status.toLowerCase()}`}>{p.status}</span></div>
    <div className="m-donut-hero">
      <SegmentDonut items={donutItems} total={total} size={donutSize} stroke={Math.round(donutSize*0.145)} centerTop={amt(`$${p.amount}`)} centerSub="Total" interactive/>
    </div>
    <div className="m-leg2-list">
      {rows.map(legRow)}
      {fold && <button className="m-leg2 m-leg2-more" onClick={()=>setShowAll(v=>!v)} aria-expanded={showAll}>
        <span className="m-leg2-badge m-leg2-more-badge">{((minorSum/total)*100).toFixed(0)}%</span>
        <span className="m-leg2-label">{showAll ? "Show less" : `${minor.length} more items`}</span>
        {!showAll && <b className="m-leg2-val">{amt("$"+minorSum.toLocaleString(undefined,{minimumFractionDigits:2}))}</b>}
        <ChevronDown size={15} className={`m-insight-chev ${showAll?"open":""}`}/>
      </button>}
    </div>
  </div>;
}

function PaymentScheduleCard({p, s}) {
  return <div className="m-section">
    <div className="m-section-hdr"><h2>Payment Schedule</h2></div>
    <div className="m-sched-row"><Calendar size={13}/><span>Next Payment</span><b>{p.payDate}</b></div>
    <div className="m-sched-row"><Calendar size={13}/><span>Lock Date</span><b>{p.lockDate}</b></div>
    <div className="m-sched-row"><Calendar size={13}/><span>Revenue Dates</span><b>{p.revDates}</b></div>
    <button className="m-sched-cal" onClick={()=>s.setShowPayCal(true)}>View Full Payment Calendar <ExternalLink size={13}/></button>
  </div>;
}

/* Full Payment Calendar popup — the current statement month as a seller
   would see it: revenue capture window, data refresh, lock, statement,
   and payday, on a month grid with a key-dates list. Demo data (May 2026). */
const PAYCAL_KEY_DATES = [
  {cls:"rev",     label:"Revenue Capture Window", date:"May 1 – 18", desc:"Bookings & revenue credited to this statement"},
  {cls:"refresh", label:"Data Refresh",           date:"May 26",     desc:"Attainment data refreshed at 6:00 AM"},
  {cls:"lock",    label:"Lock Date",              date:"May 28",     desc:"Statement locks for payroll processing"},
  {cls:"stmt",    label:"Statement Available",    date:"May 30",     desc:"Final statement posted in CompX"},
  {cls:"pay",     label:"Payday",                 date:"Jun 2",      desc:"Incentive payment via direct deposit"},
];
function PaymentCalendarPopup({onClose}) {
  /* 6 Sunday-start weeks around May 2026: Apr 26 – Jun 6 (May 1 = Friday) */
  const cells = Array.from({length:42}, (_,i)=>
    i<5 ? {d:26+i, mo:"Apr", out:true} : i<36 ? {d:i-4, mo:"May", out:false} : {d:i-35, mo:"Jun", out:true});
  const mark = c =>
    c.mo==="May" ? (c.d<=18 ? "rev" : c.d===26 ? "refresh" : c.d===28 ? "lock" : c.d===30 ? "stmt" : "")
    : c.mo==="Jun" && c.d===2 ? "pay" : "";
  return <FullScreenPopup title="Payment Calendar" subtitle="May 2026 Statement Period" onClose={onClose}>
    <div className="m-section">
      <div className="m-paycal-monthhdr"><b>May 2026</b><span>H1 2026 Goal Sheet</span></div>
      <div className="m-paycal-grid">
        {["S","M","T","W","T","F","S"].map((d,i)=><span key={"d"+i} className="m-paycal-dow">{d}</span>)}
        {cells.map((c,i)=><span key={i} className={`m-paycal-day ${c.out?"out":""} ${mark(c)}`}>{c.d}</span>)}
      </div>
    </div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>Key Dates</h2></div>
      {PAYCAL_KEY_DATES.map(k=><div key={k.label} className="m-paycal-key">
        <span className={`m-paycal-key-dot ${k.cls}`}/>
        <div className="m-paycal-key-txt"><b>{k.label}</b><span>{k.desc}</span></div>
        <span className="m-paycal-key-date">{k.date}</span>
      </div>)}
    </div>
    <p className="m-paycal-note">ⓘ Dates are estimates and may shift with payroll processing. Payday deposits typically post by 9:00 AM local time.</p>
  </FullScreenPopup>;
}

/* Goal-sheet attainment bar with hover tooltips (desktop-reference style):
   green "Revenue Attainment" above the cursor, blue "Attainment Change"
   below. Follows the pointer, clamped to the bar's width. */
/* Goal-sheet attainment bar. Hover pins a compact tooltip stack to the right
   end of the bar — the emptiest spot — instead of chasing the pointer. */
function PbAttBar({item}) {
  /* Two-tone fill matching the desktop reference: green = attainment before
     the recent change, blue = the change itself. Both segments share the
     track's % scale, so total fill = pct and the blue width = attChange. */
  const attW = Math.min(item.pct, 100);
  const chg = Math.min(item.attChange || 0, attW);
  const [hover, setHover] = useState(false);
  return <div className="m-pb-pe-bar-wrap" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
    <div className="m-pb-pe-bar-track">
      <div className="m-pb-pe-bar-fill" style={{width:(attW-chg)+"%"}}></div>
      {chg > 0 && <div className="m-pb-pe-bar-chg" style={{width:chg+"%"}}></div>}
    </div>
    <div className="m-pb-pe-bar-marker" style={{left:"100%"}}></div>
    {hover && <div className="m-pbtips">
      <div className="m-pbtip m-pbtip-rev">Revenue Attainment: {item.pct}%</div>
      {item.attChange > 0 && <div className="m-pbtip m-pbtip-chg">Attainment Change: ↑{item.attChange}%</div>}
    </div>}
  </div>;
}

/* One goal-sheet row. A row with `children` becomes a dropdown of component
   rows — its parent total is display-only (not clickable); each child opens
   its own Compensation Calculation popup. */
function GoalSheetItemRow({item, onOpenCalc, onOpenPdf, onOpenKso}) {
  const [open, setOpen] = useState(false);
  const kids = item.children;
  return <div className="m-pb-pe-row">
    <div className={`m-pb-pe-top ${kids?"m-pb-pe-expandable":""}`}
      onClick={kids ? ()=>setOpen(o=>!o) : undefined}
      role={kids?"button":undefined} tabIndex={kids?0:undefined} aria-expanded={kids?open:undefined}
      onKeyDown={kids ? (e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }) : undefined}>
      <span className="m-pb-pe-badge" style={{background:item.color+"22", color:item.color}}>{item.pe}</span>
      <span className="m-pb-pe-name">{item.label || item.pe}</span>
      {kids && <ChevronDown size={13} className={`m-insight-chev ${open?"open":""}`}/>}
      <span className="m-pb-pe-weight">{item.weight}</span>
    </div>
    {item.pe!=="KSO" && <>
      <PbAttBar item={item}/>
      <div className="m-pb-pe-stats">
        <span className="m-pb-pe-att"><b>{item.pct}%</b> attainment</span>
        {item.attChange > 0 && <span className="m-pb-pe-change"><ArrowUp size={10}/> +{item.attChange}%</span>}
      </div>
    </>}
    <div className="m-pb-pe-actions">
      {kids
        ? <span className="m-pb-pe-payout-static" role="button" tabIndex={0} aria-expanded={open}
            onClick={()=>setOpen(o=>!o)}
            onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
            {amt("$"+item.payout)}
          </span>
        : <span className={`m-pb-pe-payout-link ${item.calc || (item.pe==="KSO" && onOpenKso) ? "" : "m-no-link"}`}
            onClick={()=>item.calc ? onOpenCalc(item) : (item.pe==="KSO" && onOpenKso && onOpenKso())}>
            {amt("$"+item.payout)}
          </span>}
      {item.calc && <button className="m-pb-pe-pdf" aria-label="Payment statement" onClick={()=>onOpenPdf(item)}>
        <FileText size={14}/>
      </button>}
      {kids && <button className="m-pb-breakdown-btn" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>
        {open ? "Hide breakdown" : "Show me a breakdown"}
        <ChevronDown size={12} className={`m-insight-chev ${open?"open":""}`}/>
      </button>}
    </div>
    {kids && open && <div className="m-pb-kids">
      {kids.map((kid,k)=><div key={k} className="m-pb-kid">
        <div className="m-pb-kid-top">
          <span className="m-pb-pe-badge" style={{background:kid.color+"22", color:kid.color}}>{kid.pe}</span>
          <span className="m-pb-pe-name">{kid.label}</span>
          <span className="m-pb-pe-payout-link" onClick={()=>onOpenCalc(kid)}>{amt("$"+kid.payout)}</span>
        </div>
        <PbAttBar item={kid}/>
        <div className="m-pb-kid-stats">
          <span className="m-pb-pe-att"><b>{kid.pct}%</b> attainment</span>
          {kid.attChange > 0 && <span className="m-pb-pe-change"><ArrowUp size={10}/> +{kid.attChange}%</span>}
        </div>
      </div>)}
    </div>}
  </div>;
}

/* Replaced Goal Sheet — shown under the Current Goal Sheet rows when a
   statement month carries reconciliation from a swapped-out sheet. The
   amber frame + indent + dashed connector make "replaced, but still
   feeding your current sheet" impossible to miss. */
function ReplacedGoalSheet({r}) {
  return <div className="m-replaced">
    <div className="m-replaced-hdr">
      <div className="m-replaced-hdr-l1">
        <span className="m-replaced-tag">Replaced</span>
        <b className="m-replaced-title">Replaced Goal Sheet</b>
      </div>
      <div className="m-replaced-hdr-l2">
        <small className="m-replaced-period">{r.period}</small>
        <b className="m-replaced-total">{amt(r.total)}</b>
      </div>
    </div>
    {r.items.map((it,i)=><div key={i} className="m-replaced-row">
      <span className="m-pb-pe-badge" style={{background:PE_COLOR[it.pe]+"22", color:PE_COLOR[it.pe]}}>{it.pe}</span>
      <span className="m-replaced-name">{it.label}</span>
      <b className="m-replaced-amt">{amt(it.amount)}</b>
      <span className="m-replaced-paid">{it.paidNote}: <b>{amt(it.paid)}</b></span>
    </div>)}
    <p className="m-replaced-note">ⓘ {r.note}</p>
  </div>;
}

function PaymentAccordion({p, s}) {
  const expanded = s.expanded;
  const toggle = key => s.setExpanded(prev=>({...prev,[key]:!prev[key]}));
  const onOpenCalc = s.setCalcItem, onOpenPdf = s.setPdfItem;
  const sections = paymentSections(p);
  return <>{sections.map((sec,i)=><div key={i} className="m-pb-section">
    <div className="m-pb-hdr" onClick={()=>toggle(sec.key)}>
      <ChevronRight size={14} className={`m-pb-chev ${expanded[sec.key]?"open":""}`}/>
      <div className="m-pb-hdr-text"><b>{sec.label}</b>{sec.period && <small>{sec.period}</small>}</div>
      <b className="m-pb-amt">{amt(sec.amount)}</b>
    </div>

    {expanded[sec.key] && sec.key==="goalSheet" && <div className="m-pb-body">
      {p.goalSheet.items.map((item,j)=><GoalSheetItemRow key={j} item={item} onOpenCalc={onOpenCalc} onOpenPdf={onOpenPdf}
        onOpenKso={()=>s.setShowKsoCalc(true)}/>)}
      {p.replaced && <ReplacedGoalSheet r={p.replaced}/>}
    </div>}

    {expanded[sec.key] && sec.key!=="goalSheet" && <div className="m-pb-body">
      {sec.key==="past" && p.past.groups
        ? p.past.groups.map((g,j)=><div key={j} className="m-pb-past-group">
            <div className="m-pb-past-hdr">
              <span className="m-pb-chip">{g.fy}</span>
              <span className="m-pb-chip">{g.half}</span>
              <span className="m-pb-past-dates">{g.dates}</span>
              <b className="m-pb-past-rate">{g.rate}</b>
              <b className="m-pb-past-total">{amt(g.total)}</b>
            </div>
            {g.items.map((it,k)=><div key={k} className="m-pb-detail-row">
              <span className="m-pb-detail-name">
                <span className="m-pb-pe-badge" style={{background:PE_COLOR[it.pe]+"22", color:PE_COLOR[it.pe]}}>{it.pe}</span>
                {it.name}
              </span>
              <b className="m-pb-sub-amt">{amt(it.amount)}</b>
            </div>)}
          </div>)
        : p[sec.key].items.length>0 ? p[sec.key].items.map((item,j)=>{
            /* Blue amounts drill in: OTB items open their Compensation
               Calculation; SPIFF/draw/adjustment items open Payment History */
            const open = OTB_CALC[item.name] ? ()=>s.setOtbCalcItem(item)
              : PAYMENT_HISTORY[item.name] ? ()=>s.setHistItem({...item, sect:sec.key}) : null;
            /* OTB items render like goal-sheet rows (desktop reference):
               chip + name, attainment bar, % + change, blue amount */
            if (sec.key==="otb" && item.pct != null) return <div key={j} className="m-pb-pe-row">
              <div className="m-pb-pe-top">
                <span className="m-pb-chip">OTB</span>
                <span className="m-pb-pe-name">{item.name}</span>
              </div>
              <PbAttBar item={item}/>
              <div className="m-pb-pe-stats">
                <span className="m-pb-pe-att"><b>{item.pct}%</b> attainment</span>
                {item.attChange > 0 && <span className="m-pb-pe-change"><ArrowUp size={10}/> +{item.attChange}%</span>}
              </div>
              <div className="m-pb-pe-actions">
                <span className="m-pb-pe-payout-link" role="button" tabIndex={0} onClick={open}
                  onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); open(); } }}>
                  {amt(item.amount)}
                </span>
              </div>
            </div>;
            return <div key={j} className="m-pb-detail-row">
              <span className="m-pb-detail-name">
                {(item.chip || SECTION_CHIP[sec.key]) && <span className="m-pb-chip">{item.chip || SECTION_CHIP[sec.key]}</span>}
                {item.name}
              </span>
              <b className={`${ACCENT_AMT_SECTIONS[sec.key] ? "m-pb-sub-amt" : ""} ${open ? "m-pb-amt-link" : ""}`}
                {...(open ? {role:"button", tabIndex:0, onClick:open,
                  onKeyDown:e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); open(); } }} : {})}>
                {amt(item.amount)}
              </b>
            </div>;
          })
        : <div className="m-pb-empty">No items this period.</div>}
    </div>}
  </div>)}</>;
}

function PaymentsPage({s}) {
  const p = fullPaymentPeriods[s.periodIdx];
  return <div className="m-page">
    <MobileHeader s={s}/>
    <div className="m-page-title-row">
      <h1 className="m-page-title">Payments</h1>
      <button className="m-goalsheet-btn" onClick={()=>s.setShowRecovBal(true)}>Recoverable Balance History</button>
    </div>
    <div className="m-asof-banner"><Calendar size={13}/><div className="m-asof-text"><span>{DATA_AS_OF}</span><small>{REFRESH_NOTE}</small></div><HideBtn s={s}/></div>
    <PeriodChips s={s}/>
    <PaymentBreakdownCard p={p} s={s} compact/>
    <PaymentScheduleCard p={p} s={s}/>
    <PaymentAccordion p={p} s={s}/>
  </div>;
}

/* Outlined PE pill used inside popups */
function PePill({pe, label, color}) {
  return <span className="m-calc-pe-pill">
    <span className="m-calc-pe-id" style={{color}}>{pe}</span>
    <b>{label}</b>
  </span>;
}

/* Compensation Calculation popup — the MONEY-value trigger. Full-screen, two tabs. */
function CompCalcPopup({item, month, onClose}) {
  const [tab, setTab] = useState("Payment Calculation");
  const c = item.calc;

  return <FullScreenPopup title="Compensation Calculation" subtitle={`Calculations for ${month} payment`}
    tabs={["Payment Calculation","TI Calculation"]} activeTab={tab} onTab={setTab} onClose={onClose}>

    <div className="m-calc-badge-row"><PePill pe={item.pe} label={item.label} color={item.color}/></div>

    {tab==="Payment Calculation" && <>
      <p className="m-calc-summary">Based on your incremental attainment of <b>{c.incrementalAtt}</b> of your goal, your incentive payment for {item.label || item.pe} is <b>{amt(c.result)}</b>.</p>

      <FormulaStrip weight={c.weight} targetIncentive={c.targetIncentive} proration={c.proration} payoutRate={c.payoutRate} result={c.result} totalEarned={c.totalEarned} prevPaid={c.prevPaid}/>

      <Expandable title="How is the Payout Rate Multiplier determined?" defaultOpen={!!c.rateIncremental}>
        <p className="m-exp-text">The payout rate multiplier is based on your incremental goal attainment for the month and the payout multiplier associated with your overall goal attainment for the goal period.</p>
        {c.rateIncremental && <>
          <p className="m-rate-name">Rate Table: {c.rateName}</p>
          <div className="m-rate-scroll">
            <table className="m-rate-table m-rate-wide">
              <thead><tr><th>Attainment</th><th>Pay Rate</th><th>Prior Att.</th><th>Incr. Att.</th><th>Multiplier</th></tr></thead>
              <tbody>{c.rateIncremental.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
                <td>{r.range}</td><td>{r.peRate}</td><td>{r.prior}</td><td>{r.incr}</td><td>{r.mult}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <div className="m-rate-total-row">Total: <b>{c.payoutRate}</b></div>
        </>}
      </Expandable>

      <Expandable title="Why is my proration not 100%?">
        <p className="m-exp-text">Your proration may be less than 100% if you were hired mid-period, transferred roles, or had a change in your compensation plan during the goal period.</p>
      </Expandable>

      <Expandable title="What is my Total Payment against this Plan?">
        <p className="m-exp-text">Based on your total attainment of <b>{c.totalAtt}</b> of your goal, your incentive payment for {item.label || item.pe} is <b>{amt(c.result)}</b>.</p>
        <FormulaStrip weight={c.weight} targetIncentive={c.targetIncentive} proration={c.proration} payoutRate={c.payoutRate} result={c.result} totalEarned={c.totalEarned} prevPaid={c.prevPaid}/>
        {c.rateTotal && <>
          <p className="m-rate-name">Payout Rate Table</p>
          <div className="m-rate-scroll">
            <table className="m-rate-table m-rate-wide">
              <thead><tr><th>Attainment</th><th>Pay Rate</th><th>Rev. Att.</th><th>Multiplier</th></tr></thead>
              <tbody>{c.rateTotal.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
                <td>{r.range}</td><td>{r.peRate}</td><td>{r.rev}</td><td>{r.mult}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </>}
      </Expandable>
    </>}

    {tab==="TI Calculation" && <>
      <p className="m-calc-summary">Your Target Incentive is your annual variable comp target, weighted to {item.pe} and prorated for the goal period.</p>
      <div className="m-calc-formula-card">
        <div className="m-calc-rows" style={{width:"100%"}}>
          <div className="m-calc-row"><span>Annual Target Incentive</span><b>{amt(c.targetIncentive)}</b></div>
          <div className="m-calc-row"><span>Plan Weight</span><b>{c.weight}</b></div>
          <div className="m-calc-row"><span>Proration</span><b>{c.proration}</b></div>
          <div className="m-calc-row m-calc-total"><span>Weighted TI (this period)</span><b>{amt(c.result)}</b></div>
        </div>
      </div>
    </>}
  </FullScreenPopup>;
}

/* On-Top Bonus Compensation Calculation — the OTB blue-amount trigger.
   Same shell as CompCalcPopup but with the OTB formula (TI rate × OTB
   target incentive × proration × payout multiplier) and single rate table. */
function OtbCalcPopup({item, month, onClose}) {
  const c = OTB_CALC[item.name];
  return <FullScreenPopup title="Compensation Calculation" subtitle={`Calculations for ${month} payment`}
    tabs={["Payment Calculation"]} activeTab="Payment Calculation" onTab={()=>{}} onClose={onClose}>
    <div className="m-calc-badge-row"><PePill pe="OTB" label={item.name} color={PE_COLOR.OTB}/></div>
    <p className="m-calc-summary">Based on your incremental attainment of <b>{c.incrementalAtt}</b> of your goal, your incentive payment for {item.name} is <b>{amt(c.result)}</b>.</p>
    <FormulaStrip weight={c.tiRate} weightLabel="On Top Bonus TI Rate" targetIncentive={c.targetIncentive}
      proration={c.proration} payoutRate={c.payoutRate} result={c.result}/>
    <Expandable title="How is the Payout Rate Multiplier determined?" defaultOpen>
      <p className="m-exp-text">The payout rate multiplier is based on your incremental goal attainment for the month and the payout multiplier associated with your overall goal attainment for the goal period.</p>
      <p className="m-rate-name">Rate Table: {c.rateName}</p>
      <div className="m-rate-scroll">
        <table className="m-rate-table m-rate-wide">
          <thead><tr><th>Attainment</th><th>Pay Rate</th><th>Prior Att.</th><th>Incr. Att.</th><th>Multiplier</th></tr></thead>
          <tbody>{c.rows.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
            <td>{r.range}</td><td>{r.peRate}</td><td>{r.prior}</td><td>{r.incr}</td><td>{r.mult}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <button className="m-rate-more">More rows →</button>
      <div className="m-rate-total-row">Total: <b>{c.payoutRate}</b></div>
    </Expandable>
    <Expandable title="Why is my proration not 100%?">
      <p className="m-exp-text">Proration reflects mid-period plan changes, transfers, or start dates. Your plan was active for the full period, so your proration is 100%.</p>
    </Expandable>
  </FullScreenPopup>;
}

/* KSO Calculation — the goal-sheet KSO amount trigger. Fixed bonus, so the
   formula is just earned − previously paid; tabs add the payment history and
   a jump to the Goals-tab KSO quarters (the in-app "KSO Tool"). */
function KsoCalcPopup({month, onClose, onKsoTool}) {
  const [tab, setTab] = useState("Calculation");
  const rows = KSO_CALC.history;
  const total = rows.reduce((a,r)=>a+r.amount,0);
  return <FullScreenPopup title="KSO Calculation" subtitle={`Key Sales Objectives for ${month}`}
    tabs={["Calculation","Payment History","View in KSO Tool"]} activeTab={tab}
    onTab={t=> t==="View in KSO Tool" ? onKsoTool() : setTab(t)} onClose={onClose}>
    {tab==="Calculation" && <>
      <div className="m-calc-badge-row"><PePill pe="KSO" label="Key Sales Objectives" color={PE_COLOR.KSO}/></div>
      <p className="m-calc-summary">Your KSO payment for {month}.</p>
      <div className="m-formula">
        <div className="m-formula-factor"><b>{amt(KSO_CALC.earned)}</b><small>Total Earned</small></div>
        <span className="m-formula-op">−</span>
        <div className="m-formula-factor"><b>{amt(KSO_CALC.prevPaid)}</b><small>Previously Paid</small></div>
        <span className="m-formula-op m-formula-eq">=</span>
        <div className="m-formula-factor"><b className="m-formula-result">{amt("$"+KSO_CALC.result)}</b><small>Monthly Payment</small></div>
      </div>
      <div className="m-kso-note"><b>Note:</b> KSO payments are not subject to proration or payout rate multipliers. This is a fixed bonus for meeting all qualifying objectives during the measurement period.</div>
    </>}
    {tab==="Payment History" && <div className="m-ph-table">
      <div className="m-ph-tr m-ph-th"><span>Pay Date ↓</span><span>Details</span><span className="m-ph-amt">Amount</span><span>Status</span></div>
      {rows.map((r,i)=><div key={i} className="m-ph-tr">
        <span className="m-ph-date">{r.date}</span>
        <span className="m-ph-details">{r.details}</span>
        <span className="m-ph-amt">{amt(fmtAmt(r.amount))}</span>
        <span className="m-pay-status m-status-paid">Paid</span>
      </div>)}
      <div className="m-ph-total"><span>Total</span><b>{amt(fmtAmt(total))}</b></div>
    </div>}
  </FullScreenPopup>;
}

/* Payment History — SPIFF / draw / adjustment blue-amount trigger.
   Two desktop-reference styles: SPIFF items use underline tabs with the
   three past ranges; draws/adjustments use range pills including Current
   Month, which switches to the Bonus Details card (the desktop's wide
   table, stacked for mobile). */
const HIST_RANGES = ["Current Month","Past 6 Months","Past Year","All Time"];
function PaymentHistoryPopup({item, onClose}) {
  const h = PAYMENT_HISTORY[item.name];
  const tabsStyle = item.sect === "spiff";                 // underline tabs, no Current Month
  const ranges = tabsStyle || !h.current ? HIST_RANGES.slice(1) : HIST_RANGES;
  const [range, setRange] = useState(ranges[0]);
  const lim = range==="Past 6 Months" ? 5 : range==="Past Year" ? 12 : Infinity;
  const rows = h.rows.filter(r=>r.mb<=lim);
  const total = rows.reduce((a,r)=>a+r.amount,0);
  return <FullScreenPopup title="Payment History" subtitle={item.name} onClose={onClose}
    {...(tabsStyle ? {tabs:ranges, activeTab:range, onTab:setRange} : {})}>
    {!tabsStyle && <div className="m-ph-ranges">
      {ranges.map(r=><button key={r} className={r===range?"on":""} onClick={()=>setRange(r)}>{r}</button>)}
    </div>}
    {range==="Current Month"
      ? <>
        <p className="m-ph-label">Bonus Details</p>
        <div className="m-ph-bonus">
          <div><small>Book Date</small><b>{h.current.book}</b></div>
          <div><small>Processed Date</small><b>{h.current.processed}</b></div>
          <div><small>Bonus Amount</small><b>{amt(h.current.bonus)}</b></div>
          <div><small>Payment Amount (USD)</small><b>{amt(h.current.payment)}</b></div>
          <div><small>User Comments</small><b>{h.current.comments}</b></div>
          <div><small>Created By</small><b>{h.current.createdBy}</b></div>
          <div><small>Program Name</small><b>{h.current.program}</b></div>
        </div>
      </>
      : <div className="m-ph-table">
        <div className="m-ph-tr m-ph-th"><span>Pay Date ↓</span><span>Details</span><span className="m-ph-amt">Amount</span><span>Status</span></div>
        {rows.map((r,i)=><div key={i} className="m-ph-tr">
          <span className="m-ph-date">{r.date}</span>
          <span className="m-ph-details">{r.details}</span>
          <span className={`m-ph-amt ${r.amount<0?"neg":""}`}>{amt(fmtAmt(r.amount))}</span>
          <span className="m-pay-status m-status-paid">Paid</span>
        </div>)}
        {rows.length===0 && <div className="m-pb-empty">No payments in this range.</div>}
        <div className="m-ph-total"><span>Total</span><b>{amt(fmtAmt(total))}</b></div>
      </div>}
  </FullScreenPopup>;
}

/* PDF / breakdown-icon trigger — Revenue Transactions popup (full-screen),
   per the desktop reference: snapshot banner, "N transactions contributing"
   line with the period total, SO links, green revenue, and a bottom total.
   No export (removed app-wide). */
function PdfPopup({item, onClose}) {
  const t = revenueTxns[item.pe];
  if (!t) return null;
  const n = t.rows.length;
  return <div className="m-fs">
    <div className="m-fs-hdr">
      <div className="m-fs-hdr-text"><b>{item.pe} - {item.label} - H1 2026 Revenue Transactions</b></div>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    <div className="m-fs-body">
      <div className="m-txn-note">ⓘ Values shown are <b>payment-date snapshots</b>. Live order values may differ due to subsequent changes.</div>
      <div className="m-txn-count">
        <span><b>{n} transaction{n===1?"":"s"}</b> contributing to this payment</span>
        <span className="m-txn-count-total">Period Total: <b>{amt("$"+t.total)}</b></span>
      </div>
      <div className="m-txn-list">
        <div className="m-txn-list-hdr"><span>SO Number</span><span className="r">Revenue</span></div>
        {t.rows.map((r,i)=><div key={i} className="m-txn-row2">
          <div className="m-txn-line1">
            <span className="m-txn-so">{r.so}</span>
            <span className="m-txn-rev">{amt(r.rev)}</span>
          </div>
          <div className="m-txn-line2">{r.date} · {r.customer}</div>
        </div>)}
        <div className="m-txn-total">
          <span>Total ({n} order{n===1?"":"s"})</span>
          <b className="m-txn-total-amt">{amt("$"+t.total)}</b>
        </div>
        <div className="m-txn-foot">
          <span>Showing 1–{n} of {n}</span>
          <i>Click any SO to view full order details</i>
        </div>
      </div>
    </div>
  </div>;
}

/* Recoverable Balance History — what the seller owes back to Cisco, with the
   payment transactions that created and cleared the balance (desktop reference) */
function RecovBalancePopup({onClose}) {
  const [open, setOpen] = useState(true);
  return <div className="m-fs">
    <div className="m-fs-hdr">
      <div className="m-fs-hdr-text"><b>Recoverable Balance History</b></div>
      <span className="m-recov-badge">● {amt("$0.00")}</span>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    <div className="m-fs-body">
      <p className="m-recov-desc">Your recoverable balance is the amount of incentive compensation that you owe back to Cisco.</p>
      <p className="m-recov-desc">These are previous payment transactions that contributed to your recoverable balance.</p>
      <p className="m-recov-asof">Total Recoverable Balance as of Nov 2025 (Cleared)</p>

      <div className="m-section m-recov-card">
        <div className="m-recov-hdr" role="button" tabIndex={0} aria-expanded={open}
          onClick={()=>setOpen(o=>!o)}
          onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
          <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
          <div className="m-recov-hdr-text">
            <b>Oct 2025</b>
            <span>Negative Earnings (No Recovery)</span>
          </div>
          <div className="m-recov-remaining">
            <b>{amt("$0.00")}</b>
            <small>Remaining Balance</small>
          </div>
          <CheckCircle2 size={20} className="m-recov-check"/>
        </div>
        <div className="m-recov-progress">
          <small>{amt("$5000.00")} of {amt("$5000.00")} Paid</small>
          <div className="m-recov-bar"><div className="m-recov-bar-fill" style={{width:"100%"}}/></div>
        </div>

        {open && <>
          <div className="m-recov-txn">
            <div><b>Oct 2025</b><span>Negative earnings — recoverable balance created</span></div>
            <b className="m-recov-neg">−{amt("$5000.00")}</b>
          </div>
          <div className="m-recov-txn">
            <div><b>Nov 2025</b><span>Final Recovery (Balance Cleared)</span></div>
            <b className="m-recov-pos">{amt("$5000.00")}</b>
          </div>
          <div className="m-recov-total"><b>Remaining Draw Balance</b><b>{amt("$0.00")}</b></div>
          <div className="m-rate-scroll">
            <table className="m-rate-table m-rate-wide">
              <thead><tr><th>Period</th><th>Description</th><th>Opening Balance</th><th>Recovery</th><th>Closing Balance</th></tr></thead>
              <tbody>
                <tr><td>Oct 2025</td><td>Negative Earnings (No Recovery)</td><td>—</td><td>—</td><td>{amt("−5,000.00")}</td></tr>
                <tr><td>Nov 2025</td><td>Final Recovery (Balance Cleared)</td><td>{amt("−5,000.00")}</td><td>{amt("5,000.00")}</td><td>{amt("0.00")}</td></tr>
              </tbody>
            </table>
          </div>
        </>}
      </div>
    </div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   SPIFF & BONUS (dedicated page — desktop reference)
   ════════════════════════════════════════════════════════════════ */
function SpiffStatPills() {
  return <div className="m-spf-pills">
    <div className="m-spf-pill"><small>Projected Earnings</small><b>{amt(SPIFF_PROJECTED)}</b></div>
    <div className="m-spf-pill m-spf-pill-paid"><small>Paid YTD</small><b>{amt(SPIFF_PAID_YTD)}</b></div>
  </div>;
}

function SpiffFilterRow({s}) {
  const f = s.spiffFilters;
  const set = k => e => s.setSpiffFilters(prev=>({...prev, [k]:e.target.value}));
  const count = filterSpiffs(f).length;
  return <div className="m-spf-filters">
    <label>Period: <select value={f.period} onChange={set("period")}>{SPIFF_PERIODS.map(o=><option key={o}>{o}</option>)}</select></label>
    <label>Status: <select value={f.status} onChange={set("status")}>{SPIFF_STATUSES.map(o=><option key={o}>{o}</option>)}</select></label>
    <label>Type: <select value={f.type} onChange={set("type")}>{SPIFF_TYPES.map(o=><option key={o}>{o}</option>)}</select></label>
    <span className="m-spf-count">{count} incentive{count===1?"":"s"}</span>
  </div>;
}

/* One incentive program. Collapsed keeps the essentials (name, projected,
   chips, progress bar); tapping the card expands the description and
   criteria fine print — same dropdown pattern as the insight cards. */
function SpiffProgramCard({p}) {
  const [open, setOpen] = useState(false);
  return <div className="m-spf-card" style={{borderLeftColor:SPIFF_TYPE_COLOR[p.type]}}
    role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-spf-card-top">
      <b className="m-spf-name">{p.name}</b>
      <div className="m-spf-proj"><b>{amt(p.projected)}</b><small>Projected Earnings</small></div>
    </div>
    <div className="m-spf-tags">
      <span className="m-spf-type" style={{color:SPIFF_TYPE_COLOR[p.type], background:SPIFF_TYPE_COLOR[p.type]+"1a"}}>{p.type}</span>
      <span className="m-spf-status" style={{color:SPIFF_STATUS_COLOR[p.status], borderColor:SPIFF_STATUS_COLOR[p.status]+"66", background:SPIFF_STATUS_COLOR[p.status]+"14"}}>{p.status}</span>
      <span className="m-spf-more">Details <ChevronDown size={12} className={`m-insight-chev ${open?"open":""}`}/></span>
    </div>
    <div className="m-spf-prog-row"><span>Progress</span><b>{amt(p.earned)} / {amt(p.target)}</b></div>
    <div className="m-spf-bar"><div className="m-spf-fill" style={{width:p.pct+"%", background:p.pct===100?"var(--green)":"var(--accent)"}}/></div>
    <small className="m-spf-pct">{p.pct}% complete</small>
    {open && <div className="m-spf-details">
      <p className="m-spf-desc">{p.desc}</p>
      <div className="m-spf-crit">
        <span><b>Criteria:</b> {p.criteria}</span>
        <small>{p.dates}</small>
      </div>
    </div>}
  </div>;
}

function SpiffBonusPage({s}) {
  const list = filterSpiffs(s.spiffFilters);
  const visible = s.spiffExpanded ? list : list.slice(0,2);
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>SPIFF & Bonus</h1>
    <p className="m-team-sub">SPIFFs, uplifts, bonuses, and other strategic incentive programs.</p>
    <SpiffStatPills/>
    <SpiffFilterRow s={s}/>
    {visible.map(p=><SpiffProgramCard key={p.name} p={p}/>)}
    {list.length>2 && <button className="m-showall" onClick={()=>s.setSpiffExpanded(!s.spiffExpanded)}>
      {s.spiffExpanded ? "Show Fewer" : `See All ${list.length} Incentives`}
      <ChevronDown size={14} className={s.spiffExpanded?"up":""}/>
    </button>}
    {list.length===0 && <div className="m-search-empty"><Trophy size={30}/><b>No incentives match</b><span>Loosen the filters to see more programs.</span></div>}
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   BACKLOG INSIGHTS (compressed mobile take on the desktop page)
   Orders awaiting revenue recognition. Sums stay consistent with the
   rest of the app: bucket backlogs total $115K (PE1 $42k + PE2 $28k +
   PE3 $45k, matching the goals bars) and est. paycheck impacts total
   the +$1,200 the assistant quotes. Helix/Cortex rows reuse their
   Order Search SO numbers and amounts.
   ════════════════════════════════════════════════════════════════ */
const backlogOrders = [
  {id:"SO-105078", customer:"Helix Networks",   pe:"PE1", booked:"Apr 2, 2026",  bookings:"$21,000", backlog:"$14,000", revenue:"$7,000",  fulfil:"Jun 18, 2026", days:23,   pay:"Jul 2026", bucket:"Jun"},
  {id:"SO-104650", customer:"Cortex Financial", pe:"PE1", booked:"Mar 20, 2026", bookings:"$23,000", backlog:"$23,000", revenue:"—",       fulfil:"Jul 15, 2026", days:50,   pay:"Aug 2026", bucket:"Jul"},
  {id:"SO-104930", customer:"Apex Industries",  pe:"PE2", booked:"Apr 10, 2026", bookings:"$12,000", backlog:"$12,000", revenue:"—",       fulfil:"Jul 28, 2026", days:63,   pay:"Aug 2026", bucket:"Jul"},
  {id:"SO-104788", customer:"GlobalNet Inc",    pe:"PE3", booked:"Mar 28, 2026", bookings:"$52,000", backlog:"$38,000", revenue:"$14,000", fulfil:"Aug 22, 2026", days:88,   pay:"Sep 2026", bucket:"Aug"},
  {id:"SO-105102", customer:"Nova Telecom",     pe:"PE1", booked:"Apr 20, 2026", bookings:"$8,000",  backlog:"$5,000",  revenue:"$3,000",  fulfil:"Sep 10, 2026", days:107,  pay:"Oct 2026", bucket:"Sep"},
  {id:"SO-104415", customer:"Cascade Systems",  pe:"PE2", booked:"Feb 25, 2026", bookings:"$16,000", backlog:"$16,000", revenue:"—",       fulfil:"Sep 25, 2026", days:122,  pay:"Oct 2026", bucket:"Sep"},
  {id:"SO-104220", customer:"Orion Tech",       pe:"PE3", booked:"Feb 12, 2026", bookings:"$10,000", backlog:"$7,000",  revenue:"$3,000",  fulfil:"—",            days:null, pay:"—",        bucket:"Beyond"}
];
const backlogBuckets = [
  {id:"All",    label:"Total Backlog",  amt:"$115K", orders:7, est:"+$1,200 est. paycheck", color:"var(--accent)"},
  {id:"Jun",    label:"June 2026",      amt:"$14K",  orders:1, est:"+$145 est.",  color:"var(--green)"},
  {id:"Jul",    label:"July 2026",      amt:"$35K",  orders:2, est:"+$365 est.",  color:"var(--green)"},
  {id:"Aug",    label:"August 2026",    amt:"$38K",  orders:1, est:"+$395 est.",  color:"var(--amber)"},
  {id:"Sep",    label:"September 2026", amt:"$21K",  orders:2, est:"+$220 est.",  color:"var(--red)"},
  {id:"Beyond", label:"Beyond",         amt:"$7K",   orders:1, est:"+$75 est.",   color:"#8b5cf6", note:"Oct+ or no date"}
];
const daysTone = d => d==null ? "var(--muted)" : d<=90 ? "var(--green)" : d<=140 ? "var(--amber)" : "var(--red)";

/* Month filter chips (horizontal scroll) — the compressed stand-in for the
   desktop page's bucket cards; tapping filters the order list */
function BacklogBucketChips({s}) {
  return <div className="m-blg-chips">
    {backlogBuckets.map(b=><button key={b.id} className={`m-blg-chip ${s.backlogFilter===b.id?"on":""}`} onClick={()=>s.setBacklogFilter(b.id)}>
      <small>{b.label}</small>
      <b style={{color:b.color}}>{amt(b.amt)}</b>
      <span>{b.orders} order{b.orders===1?"":"s"}</span>
    </button>)}
  </div>;
}

/* Selected bucket's est. paycheck impact, in the data-banner style */
function BacklogSummaryStrip({s}) {
  const b = backlogBuckets.find(x=>x.id===s.backlogFilter);
  return <div className="m-blg-summary">
    <span>{b.id==="All" ? "All periods" : b.label}{b.note ? ` · ${b.note}` : ""} · {b.orders} order{b.orders===1?"":"s"}</span>
    <b>{maskText(b.est)}</b>
  </div>;
}

/* One backlog order — collapsed to customer/SO/backlog/payment month;
   tapping expands the remaining desktop-table fields */
function BacklogOrderCard({o}) {
  const [open, setOpen] = useState(false);
  return <div className="m-blg-card" role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(v=>!v)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(v=>!v); } }}>
    <div className="m-blg-top">
      <span className="m-pb-pe-badge" style={{background:PE_COLOR[o.pe]+"22", color:PE_COLOR[o.pe]}}>{o.pe}</span>
      <div className="m-blg-who"><b>{o.customer}</b><small>{o.id}</small></div>
      <div className="m-blg-amt"><b>{amt(o.backlog)}</b><small>Backlog</small></div>
      <ChevronDown size={14} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    <div className="m-blg-meta">
      <span style={{color:daysTone(o.days)}}>{o.days==null ? "No fulfilment date" : `${o.days}d to fulfilment`}</span>
      <span className="m-blg-pay">{o.pay==="—" ? "Payment TBD" : `Est. pay ${o.pay}`}</span>
    </div>
    {open && <div className="m-blg-details">
      <div><small>Bookings</small><b>{amt(o.bookings)}</b></div>
      <div><small>Revenue</small><b>{amt(o.revenue)}</b></div>
      <div><small>Comp Book Date</small><b>{o.booked}</b></div>
      <div><small>Expected Fulfilment</small><b>{o.fulfil}</b></div>
    </div>}
  </div>;
}

function BacklogPage({s}) {
  const list = s.backlogFilter==="All" ? backlogOrders : backlogOrders.filter(o=>o.bucket===s.backlogFilter);
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Backlog Insights</h1>
    <p className="m-team-sub">Orders awaiting revenue recognition. Payment dates and amounts are estimates.</p>
    <BacklogBucketChips s={s}/>
    <BacklogSummaryStrip s={s}/>
    {list.map(o=><BacklogOrderCard key={o.id} o={o}/>)}
  </div>;
}

function IPadBacklog({s}) {
  const list = s.backlogFilter==="All" ? backlogOrders : backlogOrders.filter(o=>o.bucket===s.backlogFilter);
  return <div className="i-page">
    <IPadHeader title="Backlog Insights" sub="Orders awaiting revenue recognition. Payment dates and amounts are estimates." s={s}/>
    <BacklogBucketChips s={s}/>
    <BacklogSummaryStrip s={s}/>
    <div className="i-grid-2">{list.map(o=><BacklogOrderCard key={o.id} o={o}/>)}</div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   PAY ESTIMATOR (compressed mobile take on the desktop page)
   One plan element at a time behind PE chips instead of three stacked
   estimators. Seller-scale numbers stay consistent with the rest of
   the app: goals/revenue match the goal-sheet rows (24/71/44% att.)
   and each PE's target-incentive share follows the goal-sheet weights
   (50/30/20 of the $75,500 TI). All three PEs share the same rate
   table, confirmed against the desktop reference's PE1/PE2/PE3 pages.
   ════════════════════════════════════════════════════════════════ */
const EST_BRACKETS = [
  {from:0,   to:50,       rate:0.75},
  {from:50,  to:75,       rate:1.5},
  {from:75,  to:100,      rate:1},
  {from:100, to:120,      rate:5.25},
  {from:120, to:200,      rate:2.5},
  {from:200, to:Infinity, rate:1.5}
];
const estPlans = [
  {pe:"PE1", name:"Prod+Services",      color:PE_COLOR.PE1, goal:109000, revenue:26000, ti:37750},
  {pe:"PE2", name:"Recurring Software", color:PE_COLOR.PE2, goal:87000,  revenue:62000, ti:22650},
  {pe:"PE3", name:"Services",           color:PE_COLOR.PE3, goal:90000,  revenue:40000, ti:15100}
];
/* Cumulative payout (% of TI share) at a given attainment % */
const estPayoutPct = att => EST_BRACKETS.reduce((sum,b)=> sum + Math.max(0, Math.min(att,b.to)-b.from)*b.rate, 0);
const estEarned = (p, addRev=0) => estPayoutPct((p.revenue+addRev)/p.goal*100)/100 * p.ti;
const estUsd = n => "$" + Math.round(n).toLocaleString("en-US");
const fmtGoalK = n => "$" + Math.round(n/1000) + "k";

/* Payout curve — 5%-step bars to 150%; current attainment in the PE color,
   the modeled additional attainment in amber, the rest unattained */
function EstChart({p, addRev}) {
  const attBase = p.revenue/p.goal*100;
  const attNew = (p.revenue+addRev)/p.goal*100;
  const maxPct = estPayoutPct(150);
  return <div className="m-est-chart">
    <div className="m-est-bars">
      {Array.from({length:30},(_,i)=>(i+1)*5).map(st=>{
        const cls = st<=attBase ? "cur" : st<=attNew ? "add" : "";
        return <div key={st} className={`m-est-bar ${cls}`}
          style={{height:Math.max(3, estPayoutPct(st)/maxPct*100)+"%", ...(cls==="cur"?{background:p.color}:{})}}/>;
      })}
    </div>
    <div className="m-est-axis"><span>0%</span><span>50%</span><span>100%</span><span>150%</span></div>
  </div>;
}

/* Collapsible rate table with the live attainment breakdown, like the
   desktop's "Show Rate Table" */
function EstRateTable({p, addRev}) {
  const [open, setOpen] = useState(false);
  const att = (p.revenue+addRev)/p.goal*100;
  return <div className="m-est-rt">
    <button className="m-est-rt-btn" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>
      {open?"Hide Rate Table":"Show Rate Table"} <ChevronDown size={12} className={`m-insight-chev ${open?"open":""}`}/>
    </button>
    {open && <div className="m-est-table">
      <div className="m-est-tr m-est-th"><span>Quota %</span><span>Rate / 1%</span><span>Yours ({att.toFixed(1)}%)</span><span>Value</span></div>
      {EST_BRACKETS.map((b,i)=>{
        const seg = Math.max(0, Math.min(att,b.to)-b.from);
        return <div key={i} className={`m-est-tr ${att>b.from && att<=b.to ? "on":""}`}>
          <span>{b.to===Infinity ? `${b.from}+ %` : `${b.from}–${b.to}%`}</span>
          <span>{b.rate}%</span>
          <span>{seg>0 ? seg.toFixed(seg%1 ? 2 : 0) : "—"}</span>
          <span>{seg>0 ? (seg*b.rate).toFixed(2) : "—"}</span>
        </div>;
      })}
    </div>}
  </div>;
}

/* The estimator for the selected PE: stats, additional-attainment input +
   slider, computed additional earnings, payout curve, rate table */
function EstimatorCard({s}) {
  const p = estPlans[s.estPe];
  const addRev = s.estAdd[p.pe] || 0;
  const attBase = p.revenue/p.goal*100;
  const base = estEarned(p);
  const extra = estEarned(p, addRev) - base;
  const max = Math.round(p.goal*1.5 - p.revenue);
  const setAdd = v => s.setEstAdd(prev=>({...prev, [p.pe]: Math.max(0, Math.min(max, v))}));
  return <div className="m-section m-est-card" style={{borderLeftColor:p.color}}>
    <div className="m-section-hdr">
      <div className="m-pe-left"><span className="m-pe-badge" style={{background:p.color}}>{p.pe}</span><b>{p.name}</b></div>
      <span className="m-pe-goal">{fmtGoalK(p.goal)} Goal</span>
    </div>
    <div className="m-goal-stats m-est-stats">
      <div><small>Revenue Att.</small><span style={{color:p.color}}>{Math.round(attBase)}%</span></div>
      <div><small>Revenue</small><span>{amt(fmtGoalK(p.revenue))}</span></div>
      <div><small>Est. Incentive (H1)</small><span className="m-goal-earn">{amt(estUsd(base))}</span></div>
    </div>
    <div className="m-est-inputs">
      <label className="m-est-input"><small>Additional Attainment</small>
        <div className="m-est-field"><span>$</span>
          <input type="number" inputMode="numeric" min="0" max={max} step="1000" value={addRev||""} placeholder="0"
            onChange={e=>setAdd(Number(e.target.value)||0)}/>
        </div>
      </label>
      <div className="m-est-input"><small>Additional Earnings</small>
        <b className="m-est-extra">{maskText(`+${estUsd(extra)}`)}</b>
      </div>
    </div>
    <input type="range" className="m-est-slider" min="0" max={max} step="1000" value={addRev}
      onChange={e=>setAdd(Number(e.target.value))} aria-label="Additional attainment"/>
    <div className="m-est-slider-lbls"><span>$0</span><b>{addRev>0 ? `+${fmtGoalK(addRev)}` : ""}</b><span>{fmtGoalK(max)}</span></div>
    <EstChart p={p} addRev={addRev}/>
    <EstRateTable p={p} addRev={addRev}/>
  </div>;
}

/* Estimated Earnings across all PEs — base + modeled additional per row */
function EstSummary({s}) {
  const rows = estPlans.map(p=>{
    const base = estEarned(p);
    const extra = estEarned(p, s.estAdd[p.pe]||0) - base;
    return {p, extra, total: base+extra};
  });
  const grandExtra = rows.reduce((a,r)=>a+r.extra,0);
  const grand = rows.reduce((a,r)=>a+r.total,0);
  return <div className="m-section m-est-sum">
    <div className="m-section-hdr"><h2>Estimated Earnings</h2><span className="m-badge">H1 2026</span></div>
    {rows.map(({p,extra,total})=><div key={p.pe} className="m-est-sum-row">
      <span className="m-pe-badge" style={{background:p.color}}>{p.pe}</span>
      <span className="m-est-sum-name">{p.name}</span>
      <span className={`m-est-sum-add ${extra>0?"pos":""}`}>{maskText(`+${estUsd(extra)}`)}</span>
      <b>{amt(estUsd(total))}</b>
    </div>)}
    <div className="m-est-sum-total">
      <span>Total</span>
      <span className={`m-est-sum-add ${grandExtra>0?"pos":""}`}>{maskText(`+${estUsd(grandExtra)}`)}</span>
      <b>{amt(estUsd(grand))}</b>
    </div>
  </div>;
}

function PayEstimatorPage({s}) {
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Pay Estimator</h1>
    <p className="m-team-sub">Use this estimator to estimate your potential incentive compensation. This is not a commitment of the compensation you will receive.</p>
    <div className="m-goaltab-scroll">
      {estPlans.map((p,i)=><button key={p.pe} className={`m-goaltab ${i===s.estPe?"on":""}`} onClick={()=>s.setEstPe(i)}
        style={i===s.estPe?{background:p.color, color:"#fff", borderColor:p.color}:{}}>{p.pe}</button>)}
    </div>
    <EstimatorCard s={s}/>
    <EstSummary s={s}/>
  </div>;
}

function IPadEstimator({s}) {
  return <div className="i-page">
    <IPadHeader title="Pay Estimator" sub="Use this estimator to estimate your potential incentive compensation. This is not a commitment of the compensation you will receive." s={s}/>
    <div className="i-goaltab-row">
      {estPlans.map((p,i)=><button key={p.pe} className={`m-goaltab ${i===s.estPe?"on":""}`} onClick={()=>s.setEstPe(i)}
        style={i===s.estPe?{background:p.color, color:"#fff", borderColor:p.color}:{}}>{p.pe}</button>)}
    </div>
    <div className="i-split">
      <div className="i-col-a"><EstimatorCard s={s}/></div>
      <div className="i-col-b"><EstSummary s={s}/></div>
    </div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   GOALS
   ════════════════════════════════════════════════════════════════ */
/* Comp Uplift Plans — PE1 (Prod+Services) only for now. Expandable row
   revealing per-product uplift progress toward the same $109k goal. */
const compUpliftPlans = [
  {name:"PREM-SERVICES|COMP UPLIFT",   earned:"$17,061.00", pct:15.7, rev:"$14k",  back:"$3k",  gap:"$92k"},
  {name:"COLLAB-DEVICES|COMP UPLIFT",  earned:"$4,597.00",  pct:4.2,  rev:"$4k",   back:"$1k",  gap:"$104k"},
  {name:"I-AND-MI-OPTICS|COMP UPLIFT", earned:"$159.00",    pct:0.1,  rev:"$109",  back:"$50",  gap:"$109k"}
];
const UPLIFT_GOAL = "$109,000.00";

function CompUpliftSection({s}) {
  return <div className="m-uplift">
    <button className="m-uplift-toggle" onClick={()=>s.setUpliftOpen(!s.upliftOpen)} aria-expanded={s.upliftOpen}>
      View Comp Uplift Plans
      <ChevronDown size={15} className={s.upliftOpen?"up":""}/>
    </button>
    {s.upliftOpen && compUpliftPlans.map((p,i)=><div key={i} className="m-uplift-card">
      <div className="m-uplift-hdr">
        <b className="m-uplift-name">{p.name}</b>
        <b className="m-uplift-pct">{p.pct}%</b>
      </div>
      <span className="m-uplift-sub">{amt(p.earned)} of {UPLIFT_GOAL} goal</span>
      <div className="m-uplift-bar">
        <div className="m-uplift-track"><div className="m-uplift-fill" style={{width:Math.max(p.pct,0.6)+"%"}}/></div>
        <div className="m-uplift-100"><span>100%</span></div>
      </div>
      <div className="m-uplift-legend">
        <span><i/>Revenue <b>{p.rev}</b></span>
        <span><i/>Backlog <b>{p.back}</b></span>
        <span><i/>Gap <b>{p.gap}</b></span>
      </div>
    </div>)}
  </div>;
}

/* ── KSO TAB (Goals) — quarterly objective cards, per desktop reference ──
   Statuses, dates, and bar tones match the reference exactly. One deliberate
   fix: Q3's New Conversions weight is 50% (the reference's 100% would make
   the quarter's weights sum to 150). */
const KSO_STATUS = {"Reviewed":"#64748b", "In Pending Review":"#d97706", "On Going":"#16a34a", "Upcoming":"#8b5cf6"};
const KSO_TONE = {gold:"#b08a1d", green:"#16a34a", blue:"#4f5ff5", grey:null};
const ksoQuarters = [
  {q:"Q1 2026", status:"Reviewed", cap:"125%", bonusLabel:"Bonus Earned", bonus:"$2,500.00", date:"16 Nov 2025", dateLabel:"Reviewed",
    rows:[
      {name:"New Conversions", desc:"6 New logo territory for Q1 FY26", bonus:"$1,000.00", weight:"50%", prog:"14 of 13 targets", pct:100, tone:"gold"},
      {name:"Attainment Rate", desc:"Reach 100% target attainment to be included as part of goal sheet", bonus:"$500.00", weight:"10%", prog:"10% of 20% attainment", pct:50, tone:"blue"},
      {name:"Conversion Rate", desc:"60% rate, conversion rate for Q1 FY26", bonus:"$1,000.00", weight:"40%", prog:"10% of 13% conversion rate", pct:77, tone:"gold"}
    ]},
  {q:"Q2 2026", status:"In Pending Review", cap:"125%", bonusLabel:"Bonus Potential", bonus:"$4,100.00", date:"9 Feb 2026", dateLabel:"Review Period Opens",
    rows:[
      {name:"New Conversions", desc:"6 New logo territory for Q2 FY26", bonus:"$2,500.00", weight:"60%", prog:"5 of 5 targets", pct:100, tone:"green"},
      {name:"Conversion Rate", desc:"60% rate, conversion rate for Q2 FY26", bonus:"$1,600.00", weight:"40%", prog:"5% of 5% conversion rate", pct:100, tone:"green"}
    ]},
  {q:"Q3 2026", status:"On Going", cap:"125%", bonusLabel:"Bonus Potential", bonus:"$4,900.00", date:"16 May 2026", dateLabel:"Review Period Opens",
    rows:[
      {name:"Conversion Rate", desc:"60% rate, conversion rate for Q3 FY26", bonus:"$1,250.00", weight:"25%", prog:"5% of 5% conversion rate", pct:100, tone:"green"},
      {name:"Attainment Rate", desc:"Reach 100% target attainment to be included as part of goal sheet", bonus:"$1,250.00", weight:"25%", prog:"0% of 25% attainment", pct:0, tone:"grey"},
      {name:"New Conversions", desc:"6 New logo territory for Q3 FY26", bonus:"$2,400.00", weight:"50%", prog:"5 of 5 targets", pct:100, tone:"green"}
    ]},
  {q:"Q4 2026", status:"Upcoming", cap:"125%", bonusLabel:"Bonus Potential", bonus:"$3,000.00", date:"11 Aug 2026", dateLabel:"Review Period Opens",
    rows:[
      {name:"New Conversions", desc:"6 New logo territory for Q4 FY26", bonus:"$1,500.00", weight:"50%", prog:"5 of 10 targets", pct:50, tone:"blue"},
      {name:"Attainment Rate", desc:"Reach 100% target attainment to be included as part of goal sheet", bonus:"$1,500.00", weight:"50%", prog:"0% of 5% attainment", pct:0, tone:"grey"}
    ]}
];

function KsoSection() {
  /* Quarter accordions (reference-style expand arrows) — the current
     quarter's detail matters most, so only one opens at a time. The fine
     print is hidden by default; one "More info" toggle at the top reveals
     every objective's description at once. */
  const [openQ, setOpenQ] = useState(0);
  const [showInfo, setShowInfo] = useState(false);
  return <>
    <div className="m-kso-info">
      <div className="m-kso-info-top">
        <h2>Key Sales Objectives (KSOs)</h2>
        <div className="m-kso-info-btns">
          <button className={`m-kso-more ${showInfo?"on":""}`} onClick={()=>setShowInfo(v=>!v)} aria-pressed={showInfo}>
            {showInfo ? "Hide info" : "More info"} <ChevronDown size={12} className={`m-insight-chev ${showInfo?"open":""}`}/>
          </button>
          <button className="m-kso-tool">View in KSO Tool <ExternalLink size={13}/></button>
        </div>
      </div>
      {showInfo && <p className="m-kso-info-note">Your plan elements represents 20% of your target Incentive (Compensation for the CS402 FY26 goal sheet)</p>}
    </div>
    {ksoQuarters.map((qt,qi)=>{
      const sc = KSO_STATUS[qt.status];
      const open = qi===openQ;
      return <div key={qt.q} className={`m-kso-card ${open?"m-kso-open":""}`}>
        <div className="m-kso-hdr" role="button" tabIndex={0} aria-expanded={open}
          onClick={()=>setOpenQ(open ? -1 : qi)}
          onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpenQ(open ? -1 : qi); } }}>
          <div className="m-kso-hdr-left">
            <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
            <span className="m-kso-q">{qt.q}</span>
            <span className="m-kso-pill" style={{color:sc, borderColor:sc+"66", background:sc+"1a"}}>{qt.status}</span>
            <span className="m-kso-cap">Achievement Cap: <b>{qt.cap}</b></span>
          </div>
          <div className="m-kso-hdr-right">
            <div className="m-kso-bonus-blk"><small>{qt.bonusLabel}</small><b>{amt(qt.bonus)}</b></div>
            <div className="m-kso-date"><b>{qt.date}</b><span>{qt.dateLabel}</span></div>
          </div>
        </div>
        {open && qt.rows.map((r,i)=>{
          const tone = KSO_TONE[r.tone];
          return <div key={i} className="m-kso-row">
            <div className="m-kso-cell-name"><b>{r.name}</b>{showInfo && <span className="m-kso-row-desc">{r.desc}</span>}</div>
            <div className="m-kso-fig"><small>{qt.bonusLabel}</small><b>{amt(r.bonus)}</b></div>
            <div className="m-kso-fig"><small>KSO Weight</small><b>{r.weight}</b></div>
            <div className="m-kso-prog">
              <span className="m-kso-prog-lbl">{r.prog}</span>
              <div className="m-kso-bar">{tone && <div className="m-kso-fill" style={{width:r.pct+"%", background:tone}}/>}</div>
            </div>
          </div>;
        })}
      </div>;
    })}
  </>;
}

/* ── Net Dollar Retention tab (reference-matched) ── */
const NDR_TEAL = "#0d9488";
const ndrStats = [
  {label:"Baseline ATR", value:"$3,520,090.00"},
  {label:"Eligible ACV Bookings", value:"$452,330.00"},
  {label:"Achievement", value:"12.85%", hot:true},
  {label:"Target", value:"100%"}
];
const ndrTrend = [["Jan",1.65],["Feb",3.64],["Mar",6.05],["Apr",9.16],["May",12.85]];
const ndrAcv   = [["Jan",58],["Feb",70],["Mar",85],["Apr",109.33],["May",130]];
const ndrTxns = [
  {cat:"NET DOLLAR RETENTION Plan", atr:"$3,520,090.00", acv:"$452,330.00", kind:"plan"},
  {cat:"View Node Summary", kind:"link"},
  {cat:"View All Transactions", kind:"bold"},
  {cat:"Systematic Transactions", atr:"$3,520,090.00", acv:"$420,330.00", kind:"sub"},
  {cat:"Manual Transactions", acv:"$32,000.00", kind:"sub"}
];
const ndrNodes = [
  {node:"West Region",    atr:"$1,280,040.00", acv:"$185,200.00", pct:"14.47%"},
  {node:"East Region",    atr:"$1,120,025.00", acv:"$142,800.00", pct:"12.75%"},
  {node:"Central Region", atr:"$680,015.00",   acv:"$78,330.00",  pct:"11.52%"},
  {node:"APAC Region",    atr:"$440,010.00",   acv:"$46,000.00",  pct:"10.45%"}
];

/* Shared chart frame: 320×150 viewBox, hover resolves to the nearest data index */
const NDR_CH = {W:320, H:150, L:36, R:12, T:10, B:22};
function useNdrHover(xOf, count) {
  const [hov, setHov] = useState(null);
  const onMouseMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) * (NDR_CH.W / r.width);
    let best = 0;
    for (let i = 1; i < count; i++) if (Math.abs(xOf(i)-x) < Math.abs(xOf(best)-x)) best = i;
    setHov(best);
  };
  return [hov, {onMouseMove, onMouseLeave:()=>setHov(null)}];
}
function NdrTip({x, y, label, value}) {
  const {W, H} = NDR_CH;
  return <div className={`m-ndr-tip ${x > W*0.62 ? "flip" : ""}`} style={{left:`${(x/W)*100}%`, top:`${(y/H)*100}%`}}>
    <small>{label}</small><b>{value}</b>
  </div>;
}

function NdrTrendChart() {
  const {W, H, L, R, T, B} = NDR_CH, plotW = W-L-R, plotH = H-T-B, MAX = 16;
  const px = i => L + (i/(ndrTrend.length-1))*plotW;
  const py = v => T + plotH - (v/MAX)*plotH;
  const [hov, hoverProps] = useNdrHover(px, ndrTrend.length);
  const line = ndrTrend.map((d,i)=>`${i?"L":"M"}${px(i)},${py(d[1])}`).join(" ");
  return <div className="m-ndr-chart" {...hoverProps}>
    <svg viewBox={`0 0 ${W} ${H}`} aria-label="NDR achievement trend by month">
      <defs><linearGradient id="ndrTrendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={NDR_TEAL} stopOpacity=".16"/><stop offset="100%" stopColor={NDR_TEAL} stopOpacity="0"/>
      </linearGradient></defs>
      {[0,4,8,12,16].map(v=><g key={v}>
        <line x1={L} x2={W-R} y1={py(v)} y2={py(v)} stroke="var(--border)" strokeDasharray="3 3" strokeWidth=".7"/>
        <text x={L-5} y={py(v)+2.5} textAnchor="end" className="m-ndr-axis">{v}%</text>
      </g>)}
      {ndrTrend.map((d,i)=><text key={d[0]} x={px(i)} y={H-6} textAnchor={i===0?"start":i===ndrTrend.length-1?"end":"middle"} className="m-ndr-axis">{d[0]}</text>)}
      <path d={`${line} L${px(ndrTrend.length-1)},${T+plotH} L${px(0)},${T+plotH} Z`} fill="url(#ndrTrendFill)"/>
      {hov!=null && <line x1={px(hov)} x2={px(hov)} y1={T} y2={T+plotH} stroke="var(--muted)" strokeWidth=".8" opacity=".55"/>}
      <path d={line} fill="none" stroke={NDR_TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {ndrTrend.map((d,i)=><circle key={i} cx={px(i)} cy={py(d[1])} r="3.6"
        fill={hov===i?NDR_TEAL:"var(--card)"} stroke={NDR_TEAL} strokeWidth="1.7"/>)}
    </svg>
    {hov!=null && <NdrTip x={px(hov)} y={py(ndrTrend[hov][1])} label={ndrTrend[hov][0]} value={`NDR % : ${ndrTrend[hov][1]}%`}/>}
  </div>;
}

function NdrAcvChart() {
  const {W, H, L, R, T, B} = NDR_CH, plotW = W-L-R, plotH = H-T-B, MAX = 140, bw = 15;
  const slot = plotW/ndrAcv.length;
  const bx = i => L + slot*i + slot/2;
  const py = v => T + plotH - (v/MAX)*plotH;
  const [hov, hoverProps] = useNdrHover(bx, ndrAcv.length);
  return <div className="m-ndr-chart" {...hoverProps}>
    <svg viewBox={`0 0 ${W} ${H}`} aria-label="Monthly eligible ACV">
      {[0,35,70,105,140].map(v=><g key={v}>
        <line x1={L} x2={W-R} y1={py(v)} y2={py(v)} stroke="var(--border)" strokeDasharray="3 3" strokeWidth=".7"/>
        <text x={L-5} y={py(v)+2.5} textAnchor="end" className="m-ndr-axis">${v}K</text>
      </g>)}
      {ndrAcv.map((d,i)=><g key={d[0]}>
        <rect x={bx(i)-bw/2} y={py(d[1])} width={bw} height={plotH+T-py(d[1])} rx="2" fill={NDR_TEAL} opacity={hov==null||hov===i?1:.5}/>
        <text x={bx(i)} y={H-6} textAnchor="middle" className="m-ndr-axis">{d[0]}</text>
      </g>)}
    </svg>
    {hov!=null && <NdrTip x={bx(hov)} y={py(ndrAcv[hov][1])} label={ndrAcv[hov][0]} value={`Eligible ACV : $${ndrAcv[hov][1]}K`}/>}
  </div>;
}

function NdrSection() {
  return <>
    <div className="m-ndr-hero">
      <div className="m-ndr-hero-txt"><h2>Net Dollar Retention</h2><small>Retention &amp; expansion of existing customer revenue</small></div>
      <div className="m-ndr-badge"><b>12.85%</b><span>NDR Achievement</span></div>
    </div>
    <div className="m-ndr-stats">
      {ndrStats.map(st=><div key={st.label} className={`m-ndr-stat ${st.hot?"on":""}`}><small>{st.label}</small><b>{st.value}</b></div>)}
    </div>
    <div className="m-ndr-grid">
      <div className="m-section m-ndr-sec"><div className="m-section-hdr"><h2>Achievement Trend</h2></div><NdrTrendChart/></div>
      <div className="m-section m-ndr-sec"><div className="m-section-hdr"><h2>Monthly Eligible ACV</h2></div><NdrAcvChart/></div>
    </div>
    <div className="m-ndr-grid m-ndr-tables">
      <div className="m-section m-ndr-sec">
        <div className="m-section-hdr"><h2>Transaction Breakdown</h2></div>
        <div className="m-hist-tablewrap"><table className="m-ndr-table">
          <thead><tr><th>Category</th><th>Baseline ATR</th><th>Eligible ACV Bookings</th></tr></thead>
          <tbody>{ndrTxns.map((t,i)=><tr key={i} className={`ndr-${t.kind}`}>
            <td>{t.cat}</td>
            <td>{t.kind==="plan" && t.atr ? <u>{t.atr}</u> : (t.atr||"")}</td>
            <td>{t.kind==="plan" && t.acv ? <u>{t.acv}</u> : (t.acv||"")}</td>
          </tr>)}</tbody>
        </table></div>
      </div>
      <div className="m-section m-ndr-sec">
        <div className="m-section-hdr"><h2>Node Summary</h2></div>
        <div className="m-hist-tablewrap"><table className="m-ndr-table">
          <thead><tr><th>Node</th><th>Baseline ATR</th><th>Eligible ACV</th><th>NDR %</th></tr></thead>
          <tbody>{ndrNodes.map(n=><tr key={n.node}>
            <td className="ndr-node">{n.node}</td><td>{n.atr}</td><td>{n.acv}</td><td>{n.pct}</td>
          </tr>)}</tbody>
        </table></div>
      </div>
    </div>
  </>;
}

/* Goal-sheet selector (Goals page) — UI mockup only: the menu lists the
   seller's goal sheets with the current one checked; picking another sheet
   doesn't swap the page data. Halves match the Team trend periods. */
const goalSheetOptions = [
  {code:"CS402", dates:"Jan 26, 2026 – Jul 26, 2026", half:"H1 2026", current:true},
  {code:"CS402", dates:"Jul 25, 2025 – Jan 25, 2026", half:"H2 2025"},
  {code:"CS402", dates:"Jan 26, 2025 – Jul 26, 2025", half:"H1 2025"},
  {code:"CS380", dates:"Jul 27, 2024 – Jan 25, 2025", half:"H2 2024"}
];
function GoalSheetSelect() {
  const [open, setOpen] = useState(false);
  const cur = goalSheetOptions.find(o=>o.current);
  return <div className="m-gsel-wrap">
    <button className="m-gsel" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-haspopup="listbox">
      <small>Goal Sheet</small>
      <b>{cur.code} · {cur.dates} <span>({cur.half})</span></b>
      <ChevronDown size={14} className={`m-insight-chev ${open?"open":""}`}/>
    </button>
    {open && <>
      <div className="m-gsel-backdrop" onClick={()=>setOpen(false)}/>
      <div className="m-gsel-menu" role="listbox" aria-label="Goal sheets">
        {goalSheetOptions.map((o,i)=><button key={i} role="option" aria-selected={!!o.current}
          className={o.current?"on":""} onClick={()=>setOpen(false)}>
          <span className="m-gsel-check">{o.current ? "✓" : ""}</span>
          <span className="m-gsel-opt"><b>{o.code}</b> {o.dates} <small>({o.half})</small></span>
        </button>)}
      </div>
    </>}
  </div>;
}

function GoalsPage({s}) {
  const tabIdx = s.goalIdx, setTabIdx = s.setGoalIdx;
  const g = goalTabs[tabIdx];

  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title">Goals</h1>
    <GoalSheetSelect/>

    {/* PE tab row */}
    <div className="m-goaltab-scroll">
      {goalTabs.map((t,i)=><button key={t.id} className={`m-goaltab ${i===tabIdx?"on":""}`} onClick={()=>setTabIdx(i)}
        style={i===tabIdx?{background:t.color, color:"#fff", borderColor:t.color}:{}}>{t.id}</button>)}
    </div>

    {g.id==="KSO" ? <KsoSection/> : g.id==="NDR" ? <NdrSection/> : <>
    {/* Selected goal — big attainment stat + full-width bar (matches At A Glance).
        Section rail, stat, and bar all bind to the active PE color. */}
    <div className="m-section m-pe-flat m-pe-solo" style={{borderLeftColor:g.color}}>
      <div className="m-section-hdr">
        <div className="m-pe-left"><span className="m-pe-badge" style={{background:g.color}}>{g.id}</span><b>{g.name}</b></div>
        <span className="m-pe-goal">{g.goal} Goal</span>
      </div>
      <div className="m-pe-att-row">
        <b className="m-pe-att-big" style={{color:g.color}}>{g.attPct}%</b>
        <span className="m-pe-att-lbl">REVENUE ATT.</span>
      </div>
      <BookingsBar pe={g}/>
      {g.id==="PE1" && <CompUpliftSection s={s}/>}
      <div className="m-goal-stats">
        <div><small>Goal</small><span>{g.goal}</span></div>
        <div><small>Attainment</small><span style={{color:g.color}}>{g.attPct}%</span></div>
        <div><small>Incentive</small><span className="m-goal-earn">{amt(g.incentive)}</span></div>
      </div>
    </div>
    </>}
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   ORDER SEARCH
   ════════════════════════════════════════════════════════════════ */
/* Single order result card (shared by search results + recent-order list) */
const ORDER_STATUS_CHIP = {"Backlog":"m-status-upcoming", "Partial":"m-status-open", "Full Revenue":"m-status-paid"};
function OrderCard({o}) {
  return <div className="m-order-card">
    <div className="m-order-top">
      <span className="m-pb-pe-badge" style={{background:PE_COLOR[o.pe]+"22", color:PE_COLOR[o.pe]}}>{o.pe}</span>
      <span className="m-order-id">{o.id}</span>
      <span className={`m-pay-status ${ORDER_STATUS_CHIP[o.status]||"m-status-paid"}`}>{o.status}</span>
    </div>
    <div className="m-order-mid"><b>{o.customer}</b><span>{o.partner}</span></div>
    <div className="m-order-figs">
      <div><small>Bookings</small><b>{o.bookings}</b></div>
      <div><small>Backlog</small><b>{o.backlog}</b></div>
      <div><small>Revenue</small><b>{o.revenue}</b></div>
    </div>
  </div>;
}

/* Search controls (desktop reference): [type ▾][query][go] plus Status /
   Plan Element filters with Submit + Clear. Shared by mobile + iPad. */
function OrderSearchControls({s, ipad=false}) {
  const submit = () => s.setOrderSubmitted(true);
  const clear = () => {
    s.setOrderQuery(""); s.setOrderStatus("All Statuses");
    s.setOrderPe("All Plan Elements"); s.setOrderSubmitted(false);
  };
  return <>
    <div className={`m-os-bar ${ipad?"i-os-bar":""}`}>
      <select className="m-os-type" value={s.orderType} onChange={e=>s.setOrderType(e.target.value)} aria-label="Search by">
        {ORDER_SEARCH_TYPES.map(t=><option key={t}>{t}</option>)}
      </select>
      <input className="m-os-input" placeholder={`Enter ${s.orderType}...`} value={s.orderQuery}
        onChange={e=>s.setOrderQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
      <button className="m-os-go" aria-label="Search" onClick={submit}><Search size={15}/></button>
    </div>
    <div className={`m-os-filters ${ipad?"i-os-filters":""}`}>
      <label className="m-os-flt"><small>Status</small>
        <select value={s.orderStatus} onChange={e=>s.setOrderStatus(e.target.value)} aria-label="Status filter">
          {ORDER_STATUSES.map(o=><option key={o}>{o}</option>)}
        </select>
      </label>
      <label className="m-os-flt"><small>Plan Element</small>
        <select value={s.orderPe} onChange={e=>s.setOrderPe(e.target.value)} aria-label="Plan element filter">
          {ORDER_PES.map(o=><option key={o}>{o}</option>)}
        </select>
      </label>
      <button className="m-os-submit" onClick={submit}>Submit</button>
      <button className="m-os-clear2" onClick={clear}>Clear</button>
    </div>
  </>;
}

function OrderSearchPage({s}) {
  const {q, list} = deriveOrders(s.orderQuery, s.orderType, s.orderStatus, s.orderPe);
  const show = q || s.orderSubmitted;
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title">Order Search</h1>
    <OrderSearchControls s={s}/>
    {show ? <>
      <div className="m-os-results-hdr">
        <p className="m-search-count">{list.length} order{list.length===1?"":"s"} found</p>
      </div>
      {list.map(o=><OrderCard key={o.id} o={o}/>)}
      {list.length===0 && <div className="m-search-empty"><Search size={30}/><b>No orders found</b><span>Try a different {s.orderType} or loosen the filters.</span></div>}
    </> : <div className="m-search-empty">
      <Search size={30}/>
      <b>Search a seller's orders</b>
      <span>Pick a field, choose filters, and hit Submit to look up orders.</span>
    </div>}
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   TEAM VIEW  (manager's roll-up — mobile translation of Team Dashboard)
   Performance tiers keep their semantic colors (green/blue/amber/red);
   structure/brand stays on the purple-blue accent system.
   ════════════════════════════════════════════════════════════════ */
const TEAM_AS_OF = "All data as of May 26, 2026, 6:00 AM";

const STATUS_COLOR = {
  "Exceeding":"#10b981", "On Track":"#3b82f6", "Watch":"#f59e0b", "At Risk":"#ef4444"
};

/* earned = Earned vs Target Incentive %, bookings = Bookings Attainment %,
   revAtt = card revenue attainment, figures in $ */
const teamSellers = [
  {name:"Sarah Chen",    earned:107.1, bookings:115.6},
  {name:"Lisa Kumar",    earned:106.3, bookings:112.0},
  {name:"Mike Torres",   earned:97.3,  bookings:107.5},
  {name:"Maya Chen",     earned:94.2,  bookings:96.4},
  {name:"Priya Shah",    earned:90.4,  bookings:92.5},
  {name:"Jordan Rivera", earned:78.6,  bookings:81.3},
  {name:"Bob Wilson",    earned:71.3,  bookings:70.0},
  {name:"John Smith",    earned:69.3,  bookings:71.3},
  {name:"Daniel Kim",    earned:67.0,  bookings:66.2},
  {name:"Rachel Lee",    earned:65.3,  bookings:65.0},
  {name:"Marcus Green",  earned:54.4,  bookings:54.4}
];

/* Seller performance cards — Top 5 shown first, expandable to all 10.
   Each member carries per-PE attainment for the three chip tiles. */
const GS_PERIOD = "GS: 26-Jan-2026 – 26-Jul-2026";
const MEMBER_PE_META = [
  {id:"PE1", label:"Prod+Services"},
  {id:"PE2", label:"Annuity"},
  {id:"PE3", label:"Strategic"}
];
/* tones = per-PE tier color for chip + % (g green, b blue, a amber, r red) */
const TONE_COLOR = {g:"#10b981", b:"#3b82f6", a:"#f59e0b", r:"#ef4444"};
const teamMembers = [
  {name:"Sarah Chen",    initials:"SC", status:"Exceeding", att:107, pe:[115,116,117], tones:["g","g","g"]},
  {name:"Lisa Kumar",    initials:"LK", status:"Exceeding", att:106, pe:[112,113,110], tones:["g","g","g"]},
  {name:"Mike Torres",   initials:"MT", status:"On Track",  att:97,  pe:[108,104,113], tones:["g","g","g"]},
  {name:"Maya Chen",     initials:"MC", status:"On Track",  att:94,  pe:[96,93,94],    tones:["g","g","g"]},
  {name:"Priya Shah",    initials:"PS", status:"On Track",  att:90,  pe:[92,90,87],    tones:["g","g","b"]},
  {name:"Jordan Rivera", initials:"JR", status:"On Track",  att:78,  pe:[81,76,74],    tones:["g","b","a"]},
  {name:"Bob Wilson",    initials:"BW", status:"Watch",     att:71,  pe:[64,76,77],    tones:["r","a","b"]},
  {name:"John Smith",    initials:"JS", status:"Watch",     att:69,  pe:[65,76,80],    tones:["r","a","b"]},
  {name:"Daniel Kim",    initials:"DK", status:"Watch",     att:67,  pe:[63,74,69],    tones:["a","a","a"]},
  {name:"Rachel Lee",    initials:"RL", status:"Watch",     att:65,  pe:[61,69,70],    tones:["r","a","a"]},
  {name:"Marcus Green",  initials:"MG", status:"At Risk",   att:54,  pe:[50,56,63],    tones:["r","r","r"]}
];

/* Team Insights — Canvas cards (supportive coaching tone; dismissible) */
const teamInsights = [
  {title:"4 Sellers Need Coaching", tag:"Coaching", metric:"4 need support", color:"#f59e0b",
    desc:"Four sellers are currently below the expected attainment pace (below 70%). Early coaching can improve attainment and increase payout opportunities before period end.",
    action:"Recommended focus: John Smith, Daniel Kim, Rachel Lee, Marcus Green — Review pipeline, backlog, and upcoming opportunities with these sellers.",
    names:"John Smith, Daniel Kim, Rachel Lee +1 more"},
  {title:"Goal Coverage Health", tag:"Coverage", metric:"74%", color:"#3b82f6",
    desc:"Your team has achieved $2.33M in bookings toward a $3.15M combined goal. You're building strong momentum — only $0.82M remains to reach full goal coverage.",
    action:"Keep the momentum going! Focus on advancing high-probability opportunities and converting qualified pipeline to close the remaining gap before period end."},
  {title:"Performance Spread — Opportunity to Level Up", tag:"Performance", metric:"Level up", color:"#f59e0b",
    desc:"Your team is making solid progress. Top performers are leading the way at 107%, while emerging sellers at 54% have strong opportunities to increase attainment with focused coaching and collaboration.",
    action:"Encourage peer mentoring, pipeline reviews, and deal strategy sessions to help more sellers achieve their goals this period. Pair top performers with emerging sellers: connect Sarah Chen with John Smith, Lisa Kumar with Bob Wilson.",
    names:"John Smith, Bob Wilson, Marcus Green +1 more"},
  {title:"Team Attainment Distribution", tag:"Attainment", metric:"81.9%", color:"#10b981",
    desc:"Team of 11 averaging 81.9% attainment. Distribution: 2 exceeding goal, 4 on track (75–100%), 5 building momentum.",
    action:"5 sellers building momentum — review deal strategy to accelerate this period."},
  {title:"Top Performers — Celebrate & Scale", tag:"Recognition", metric:"2 exceeding goal", color:"#10b981",
    desc:"2 team members exceeding goal at 106.7% average attainment. Great opportunity to share winning strategies across the team.",
    action:"Recognize excellence: Sarah Chen, Lisa Kumar. Consider peer-led knowledge sharing.",
    names:"Sarah Chen, Lisa Kumar"},
  {title:"Forecasted End-of-Period Attainment", tag:"Forecast", metric:"96.2%", color:"#3b82f6",
    desc:"Based on current pace (66% of period elapsed), team is projected to finish at 96.2% — close to full goal.",
    action:"Accelerate 3–4 deals in late stages to push team over 100% by period close."}
];

/* Team chart row derivations (shared by mobile + iPad) */
function teamEarnedRows() {
  return [...teamSellers].map(sel=>({...sel, val:sel.earned})).sort((a,b)=>b.val-a.val);
}
const TEAM_PE_FACTOR = {PE1:1, PE2:0.93, PE3:1.05};
function teamBookingRows(pe) {
  return [...teamSellers].map(sel=>({...sel, val:Math.min(130, sel.bookings*TEAM_PE_FACTOR[pe])})).sort((a,b)=>b.val-a.val);
}
/* Status pill (theme-agnostic — color-tinted from the tier color);
   optionally carries the overall attainment: "Exceeding · 107%" */
function StatusPill({status, att}) {
  const c = STATUS_COLOR[status];
  return <span className="m-tstat" style={{color:c, borderColor:c+"66", background:c+"1f"}}>{status}{att!=null && ` · ${att}%`}</span>;
}

/* Tier color from a metric value (matches the desktop's per-chart coloring) */
function tierColor(v) {
  if (v >= 100) return STATUS_COLOR["Exceeding"];
  if (v >= 75)  return STATUS_COLOR["On Track"];
  if (v >= 60)  return STATUS_COLOR["Watch"];
  return STATUS_COLOR["At Risk"];
}

/* Horizontal attainment bars, one per seller, colored by that chart's value.
   Collapsed to the first 5 rows; the sort select flips between worst-first
   (coaching candidates) and best-first, matching Seller Performance. */
function AttainmentChart({title, subtitle, rows, control}) {
  const SCALE = 120;                       // bar axis maxes at 120%
  const markerPos = (100/SCALE)*100;
  const [sort, setSort] = useState("best");        // highest-first default (reference); "need" flips to coaching-first
  const [expanded, setExpanded] = useState(false);
  const sorted = [...rows].sort((a,b)=> sort==="best" ? b.val-a.val : a.val-b.val);
  const visible = expanded ? sorted : sorted.slice(0,5);
  return <div className="m-section">
    <div className="m-section-hdr"><h2>{title}</h2>{control}</div>
    <div className="m-team-chart-controls">
      <small className="m-team-chart-sub">{subtitle}</small>
      <select className="m-seller-sort" value={sort} onChange={e=>setSort(e.target.value)} aria-label="Sort sellers">
        <option value="best">Top performers first</option>
        <option value="need">Most coaching needed</option>
      </select>
    </div>
    {rows.length===0 && <div className="m-pb-empty">No sellers match this view.</div>}
    <div className="m-abars">
      {visible.map(r=>{
        const c = tierColor(r.val);
        return <div key={r.name} className="m-abar-row">
          <span className="m-abar-name">{r.name}</span>
          <div className="m-abar-track">
            <div className="m-abar-fill" style={{width:Math.min(r.val,SCALE)/SCALE*100+"%", background:c}}/>
            <div className="m-abar-goal" style={{left:markerPos+"%"}}/>
          </div>
          <span className="m-abar-val" style={{color:c}}>{r.val.toFixed(1)}%</span>
        </div>;
      })}
    </div>
    <div className="m-abar-legend">
      {Object.keys(STATUS_COLOR).map(s=><span key={s}><i style={{background:STATUS_COLOR[s]}}/>{s}</span>)}
      <span><i className="m-abar-goal-key"/>Goal</span>
    </div>
    {rows.length > 5 && <button className="m-showall m-showall-tight" onClick={()=>setExpanded(!expanded)}>
      {expanded ? "Show Fewer" : `Show All ${rows.length} Sellers`}
      <ChevronDown size={14} className={expanded?"up":""}/>
    </button>}
  </div>;
}

/* One seller performance card (reference design: status·att pill, goal
   sheet period, three per-PE attainment tiles). Whole card opens the
   member's breakdown popup. */
function MemberCard({m, onOpen}) {
  const [open, setOpen] = useState(false);   // collapsed row by default; chevron expands details
  return <div className={`m-member-card ${open?"m-member-open":""}`} role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-member-top">
      <span className="m-seller-av">{m.initials}</span>
      <div className="m-member-id"><b>{m.name}</b><StatusPill status={m.status} att={m.att}/></div>
      <ChevronDown size={16} className={`m-member-chev ${open?"open":""}`}/>
    </div>
    {open && <>
      <div className="m-member-gs">{GS_PERIOD}</div>
      <div className="m-member-pes">
        {MEMBER_PE_META.map((meta,i)=>{
          const tone = TONE_COLOR[m.tones[i]];
          return <div key={meta.id} className="m-member-pe">
            <span className="m-member-pe-chip" style={{color:tone, borderColor:tone+"88"}}>{meta.id}</span>
            <small>{meta.label}</small>
            <b style={{color:tone}}>{m.pe[i]}%</b>
          </div>;
        })}
      </div>
      <button className="m-member-breakdown" onClick={e=>{e.stopPropagation(); onOpen();}}>Full breakdown →</button>
    </>}
  </div>;
}

/* Per-member PE breakdown popup (opened from a seller card) */
function SellerBreakdownPopup({s, onClose}) {
  return <FullScreenPopup title={s.name} subtitle={`Plan-element breakdown · ${GS_PERIOD}`} onClose={onClose}>
    <div className="m-sb-summary">
      <div><small>Status</small><b style={{color:STATUS_COLOR[s.status]}}>{s.status}</b></div>
      <div><small>Attainment</small><b style={{color:STATUS_COLOR[s.status]}}>{s.att}%</b></div>
      <div><small>Plan Elements</small><b>{s.pe.length}</b></div>
    </div>
    {MEMBER_PE_META.map((meta,i)=><div key={meta.id} className="m-gs-row">
      <div className="m-gs-row-top">
        <AttainDonut pct={s.pe[i]} color={PE_COLOR[meta.id]} size={64} stroke={9} sub=""/>
        <div className="m-gs-row-info">
          <div className="m-gs-row-hdr"><span className="m-pe-badge" style={{background:PE_COLOR[meta.id]}}>{meta.id}</span><b>{meta.label}</b></div>
          <span className="m-gs-goal">{s.pe[i]}% attainment</span>
        </div>
      </div>
    </div>)}
    <p className="m-gs-note">Read-only manager view · figures reflect the current selling period.</p>
  </FullScreenPopup>;
}

/* ── Shared Team Dashboard sections (mobile + iPad render the same
      content; only the wrapping grid class differs) ── */

function TeamControls({s}) {
  return <div className="m-team-controls">
    <span className="m-team-period">Period</span>
    <button className="m-team-ctl">H1 2026 <ChevronDown size={13}/></button>
    <button className="m-team-ctl" onClick={()=>s.setHistView(true)}>Historical Trend</button>
  </div>;
}

/* ── Team views — preset filters plus user-saved views (name + delete).
   "My Watch List" is the coaching-focus roster from the team insight;
   Top Performers = ≥100% on the metric; At Risk Focus = under 60% on
   charts / under 72% attainment for seller cards. */
const TEAM_WATCH_LIST = ["John Smith","Daniel Kim","Rachel Lee","Marcus Green"];
const TEAM_VIEW_PRESETS = [
  {id:"watch", label:"My Watch List"},
  {id:"top", label:"Top Performers"},
  {id:"risk", label:"At Risk Focus"}
];
function teamViewFilters(s) {
  const saved = s.savedViews.find(v=>v.id===s.teamView);
  const view = saved ? saved.view : s.teamView;
  return {
    row: r => view==="watch" ? TEAM_WATCH_LIST.includes(r.name) : view==="top" ? r.val>=100 : view==="risk" ? r.val<60 : true,
    member: m => view==="watch" ? TEAM_WATCH_LIST.includes(m.name) : view==="top" ? m.att>=100 : view==="risk" ? m.att<72 : true
  };
}

function TeamViewsBar({s}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const active = s.teamView;
  const save = () => {
    const nm = name.trim();
    if (!nm) return;
    /* snapshot resolves a saved view back to its underlying preset */
    const view = s.savedViews.find(x=>x.id===active)?.view || active;
    s.setSavedViews(v=>[...v, {id:"sv-"+Date.now(), name:nm, view, pe:s.teamPe}]);
    setNaming(false); setName("");
  };
  const remove = id => {
    s.setSavedViews(v=>v.filter(x=>x.id!==id));
    if (active===id) s.setTeamView("all");
  };
  return <div className="m-tviews">
    <span className="m-tviews-lbl">Views:</span>
    {TEAM_VIEW_PRESETS.map(p=><button key={p.id} className={`m-tview-chip ${active===p.id?"on":""}`}
      onClick={()=>s.setTeamView(active===p.id ? "all" : p.id)} aria-pressed={active===p.id}>
      {active===p.id && <i className="m-tview-dot"/>}{p.label}
    </button>)}
    {s.savedViews.map(v=><span key={v.id} className={`m-tview-chip m-tview-saved ${active===v.id?"on":""}`}>
      <button className="m-tview-name" onClick={()=>{s.setTeamView(v.id); s.setTeamPe(v.pe);}}>
        {active===v.id && <i className="m-tview-dot"/>}{v.name}
      </button>
      <button className="m-tview-x" aria-label={`Delete view ${v.name}`} onClick={()=>remove(v.id)}><X size={11}/></button>
    </span>)}
    <button className="m-tview-chip m-tview-reset" disabled={active==="all"} onClick={()=>s.setTeamView("all")}>Reset</button>
    {naming
      ? <span className="m-tview-savebar">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="View name..." autoFocus
            onKeyDown={e=>{ if (e.key==="Enter") save(); if (e.key==="Escape") { setNaming(false); setName(""); } }}/>
          <button className="m-tview-save" onClick={save}>Save</button>
          <button className="m-tview-cancel" onClick={()=>{setNaming(false); setName("");}}>Cancel</button>
        </span>
      : <button className="m-tview-add" onClick={()=>setNaming(true)}>+ Save Current View</button>}
  </div>;
}

function TeamMembersSection({s, gridClass="", members=teamMembers}) {
  /* Highest attainment first (reference order); the views bar handles who
     to focus on, so there's no separate sort control here */
  const sorted = [...members].sort((a,b)=> b.att-a.att);
  const list = s.teamExpanded ? sorted : sorted.slice(0,2);
  return <>
    <div className="m-section-label"><Menu size={13} className="m-section-icon"/> SELLER PERFORMANCE
      <span className="m-label-right">{list.length} of {members.length}</span></div>
    <div className={gridClass}>
      {list.map(m=><MemberCard key={m.name} m={m} onOpen={()=>s.setSellerItem(m)}/>)}
    </div>
    {members.length===0 && <div className="m-pb-empty">No sellers match this view.</div>}
    {members.length>2 && <button className="m-showall" onClick={()=>s.setTeamExpanded(!s.teamExpanded)}>
      {s.teamExpanded ? "Show Fewer" : `Show All ${members.length} Sellers`}
      <ChevronDown size={14} className={s.teamExpanded?"up":""}/>
    </button>}
  </>;
}

/* One team insight — styled like the At A Glance insight cards: badge chip
   top-left, colored headline stat top-right, title + chevron below. Expanding
   reveals nested sub-dropdowns for the details and the recommended action. */
function TeamInsightCard({c, onDismiss}) {
  const [open, setOpen] = useState(false);
  return <div className="m-tinsight" role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.target!==e.currentTarget) return;
      if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-insight-top">
      <span className="m-insight-badge" style={{color:c.color, borderColor:c.color}}>{c.tag}</span>
      <span className="m-tinsight-stat">
        <span className="m-insight-tag" style={{color:c.color}}>{c.metric} ★</span>
        <button className="m-tinsight-x" aria-label="Dismiss insight" onClick={e=>{e.stopPropagation(); onDismiss();}}><X size={14}/></button>
      </span>
    </div>
    <div className="m-insight-title-row">
      <b className="m-insight-title">{c.title}</b>
      <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    {open && <div className="m-tinsight-body" onClick={e=>e.stopPropagation()}>
      <Expandable title="Details">
        <p className="m-tinsight-desc">{c.desc}</p>
      </Expandable>
      <Expandable title="Recommended action">
        <p className="m-tinsight-action">{c.action}</p>
        {c.names && <p className="m-tinsight-names">{c.names}</p>}
      </Expandable>
    </div>}
  </div>;
}

function TeamInsightsSection({s, gridClass=""}) {
  const visible = teamInsights.map((c,i)=>({c,i})).filter(x=>!s.dismissedInsights.includes(x.i));
  return <>
    <div className="m-section-label" style={{marginTop:6}}><span className="m-section-icon">✦</span> TEAM INSIGHTS — CANVAS
      <span className="m-canvas-chip"><Layers size={11}/> Canvas ({visible.length})</span></div>
    <div className={gridClass}>
      {visible.map(({c,i})=><TeamInsightCard key={i} c={c}
        onDismiss={()=>s.setDismissedInsights([...s.dismissedInsights, i])}/>)}
    </div>
  </>;
}

/* TEAM DASHBOARD page (mobile) */
function TeamPage({s}) {
  const pe = s.teamPe, setPe = s.setTeamPe;
  const vf = teamViewFilters(s);
  const earnedRows = teamEarnedRows().filter(vf.row);
  const bookingRows = teamBookingRows(pe).filter(vf.row);

  if (s.histView) return <div className="m-page"><HistPage s={s}/></div>;

  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Team Dashboard</h1>
    <p className="m-team-sub">Overview of your team's performance for H1 2026</p>
    <div className="m-asof-banner"><Calendar size={13}/><div className="m-asof-text"><span>{TEAM_AS_OF}</span><small>{REFRESH_NOTE}</small></div></div>

    {/* Period / trend / export controls */}
    <TeamControls s={s}/>

    {/* Preset + saved views filter everything below */}
    <TeamViewsBar s={s}/>

    {/* Earned vs Target Incentive */}
    <AttainmentChart title="Earned vs Target Incentive" subtitle="Current period, sorted highest to lowest earned." rows={earnedRows}/>

    {/* Bookings Attainment (per plan element) */}
    <AttainmentChart title="Bookings Attainment" subtitle="Sorted by bookings. Bar shows progress toward individual goal." rows={bookingRows}
      control={<div className="m-pe-select">{["PE1","PE2","PE3"].map(p=><button key={p} className={p===pe?"on":""} onClick={()=>setPe(p)}>{p}</button>)}</div>}/>

    <TeamMembersSection s={s} members={teamMembers.filter(vf.member)}/>
    <TeamInsightsSection s={s}/>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   HISTORICAL PERFORMANCE TREND (Team View → Historical Trend)
   Single-member table + trend bars, or all-member comparison.
   Base data is PE1 (from the desktop reference); PE2/PE3 derive
   deterministically via weight/attainment factors.
   ════════════════════════════════════════════════════════════════ */
const HIST_PERIODS = ["H2 2024","H1 2025","H2 2025","H1 2026"];
const HIST_SHADE = {"H2 2024":"#8ecdf7","H1 2025":"#4aabf2","H2 2025":"#1e88e5","H1 2026":"#1565c0"};
/* per member: [earned, target, bookings, goal, att%] per period */
const histData = {
  "Sarah Chen":   {trend:8.5, p:[[36800,38000,1320000,1400000,94.3],[40970,40500,1480000,1440000,102.8],[48200,45000,1850000,1600000,115.6],[24500,45000,980000,1600000,61.3]]},
  "Mike Torres":  {trend:5.6, p:[[33100,38000,1260000,1400000,90],[37230,40500,1376000,1440000,95.6],[43800,45000,1720000,1600000,107.5],[22800,45000,890000,1600000,55.6]]},
  "Lisa Kumar":   {trend:8.8, p:[[31400,34000,1180000,1300000,90.8],[36125,36000,1344000,1350000,99.6],[42500,40000,1680000,1500000,112],[22400,40000,840000,1500000,56]]},
  "Maya Chen":  {trend:7,   p:[[28200,34000,1080000,1300000,83.1],[33065,36000,1216000,1350000,90.1],[38900,40000,1520000,1500000,101.3],[19800,40000,760000,1500000,50.7]]},
  "Priya Shah": {trend:7.2, p:[[30500,38000,1050000,1400000,75],[35020,40500,1184000,1440000,82.2],[41200,45000,1480000,1600000,92.5],[20100,45000,720000,1600000,45]]},
  "Jordan Rivera":   {trend:6.2, p:[[26800,34000,960000,1300000,73.8],[30260,36000,1080000,1350000,80],[35600,40000,1350000,1500000,90],[17900,40000,680000,1500000,45.3]]},
  "John Smith":   {trend:3.3, p:[[23100,38000,840000,1400000,60],[26520,40500,912000,1440000,63.3],[31200,45000,1140000,1600000,71.3],[15200,45000,560000,1600000,35]]},
  "Bob Wilson":   {trend:2.2, p:[[21500,34000,780000,1300000,60],[24225,36000,840000,1350000,62.2],[28500,40000,1050000,1500000,70],[13800,40000,510000,1500000,34]]},
  "Rachel Lee":   {trend:4.3, p:[[19800,34000,700000,1300000,53.8],[22780,36000,784000,1350000,58.1],[26800,40000,980000,1500000,65.3],[12400,40000,460000,1500000,30.7]]},
  "Marcus Green": {trend:5.4, p:[[16200,38000,600000,1400000,42.9],[18785,40500,696000,1440000,48.3],[24300,45000,864000,1600000,54],[11250,45000,400000,1600000,25]]}
};
const HIST_PE = {PE1:{name:"Prod+Services", f:1, w:1}, PE2:{name:"Recurring Software", f:.93, w:.6}, PE3:{name:"Services", f:1.06, w:.42}};
const histRow = (member, pi, pe) => {
  const [e,t,b,g,a] = histData[member].p[pi];
  const {f,w} = HIST_PE[pe];
  return {earned:Math.round(e*w), target:Math.round(t*w), book:Math.round(b*f), goal:g, att:+Math.min(125, a*f).toFixed(1)};
};
const fmtUsd = n => amt("$" + n.toLocaleString("en-US"));
const histTier = a => a >= 100 ? "#16a34a" : a >= 70 ? "#d97706" : "#dc2626";

function HistSingle({s}) {
  const pe = s.histPe, meta = HIST_PE[pe];
  const rows = HIST_PERIODS.map((p,i)=>({p, ...histRow(s.histMember, i, pe)})).filter(r=>s.histPeriods.includes(r.p));
  return <>
    <div className="m-section">
      <div className="m-section-hdr"><h2>{pe} — {meta.name}</h2></div>
      <div className="m-hist-tablewrap"><table className="m-hist-table">
        <thead><tr><th>Period</th><th>Earned</th><th>Target</th><th>{pe} Bookings</th><th>{pe} Goal</th><th className="r">{pe} Attainment %</th></tr></thead>
        <tbody>{rows.map(r=><tr key={r.p}>
          <td>{r.p}</td><td>{fmtUsd(r.earned)}</td><td>{fmtUsd(r.target)}</td><td>{fmtUsd(r.book)}</td><td>{fmtUsd(r.goal)}</td>
          <td className="r" style={{color:histTier(r.att), fontWeight:700}}>{r.att}%</td>
        </tr>)}</tbody>
      </table></div>
    </div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>{pe} Attainment Trend</h2></div>
      <div className="m-hist-chart">
        {rows.map(r=><div key={r.p} className="m-hist-bargrp">
          <span className="m-hist-barlbl" style={{color:histTier(r.att)}}>{r.att}%</span>
          <div className="m-hist-bar" style={{height:Math.max(6, r.att/125*160)+"px"}}/>
          <span className="m-hist-barcap">{r.p}</span>
        </div>)}
      </div>
    </div>
  </>;
}

function HistCompare({s}) {
  const pe = s.histPe;
  const members = s.histCmpMember==="All" ? Object.keys(histData) : [s.histCmpMember];
  const periods = HIST_PERIODS.map((p,i)=>({p,i})).filter(x=>s.histPeriods.includes(x.p));
  return <>
    <div className="m-section">
      <div className="m-section-hdr"><h2>{pe} Attainment Comparison</h2></div>
      <div className="m-hist-cmp-scroll"><div className="m-hist-cmp">
        {members.map(m=><div key={m} className="m-hist-cmp-grp">
          <div className="m-hist-cmp-bars">
            {periods.map(({p,i})=>{const r=histRow(m,i,pe);
              return <div key={p} className="m-hist-cmp-col">
                <span style={{color:histTier(r.att)}}>{Math.round(r.att)}%</span>
                <div style={{height:Math.max(4, r.att/125*110)+"px", background:HIST_SHADE[p]}}/>
              </div>;})}
          </div>
          <span className="m-hist-cmp-name">{m}</span>
        </div>)}
      </div></div>
      <div className="m-hist-legend">{periods.map(({p})=><span key={p}><i style={{background:HIST_SHADE[p]}}/>{p}</span>)}</div>
    </div>
    <div className="m-section">
      <div className="m-hist-tablewrap"><table className="m-hist-table m-hist-wide">
        <thead><tr><th>Team Member</th><th>Period</th><th>Earned</th><th>Target</th><th>{pe} Bookings</th><th>{pe} Goal</th><th className="r">{pe} Att %</th><th className="r">Trend</th></tr></thead>
        <tbody>{members.map(m=>periods.map(({p,i},idx)=>{const r=histRow(m,i,pe);
          return <tr key={m+p} className={idx===0?"m-hist-grp":""}>
            {idx===0 && <td rowSpan={periods.length} className="m-hist-member">{m}</td>}
            <td><span className={`m-hist-pchip ${p.startsWith("H1")?"h1":"h2"}`}>{p}</span></td>
            <td>{fmtUsd(r.earned)}</td><td>{fmtUsd(r.target)}</td><td>{fmtUsd(r.book)}</td><td>{fmtUsd(r.goal)}</td>
            <td className="r" style={{color:histTier(r.att), fontWeight:700}}>{r.att}%</td>
            {idx===0 && <td rowSpan={periods.length} className="r"><span className="m-hist-trendpill">▲ {histData[m].trend}%</span></td>}
          </tr>;}))}</tbody>
      </table></div>
    </div>
  </>;
}

function HistPage({s}) {
  const mode = s.histMode;
  const togglePeriod = p => {
    const on = s.histPeriods.includes(p);
    s.setHistPeriods(on ? s.histPeriods.filter(x=>x!==p) : HIST_PERIODS.filter(x=>x===p||s.histPeriods.includes(x)));
  };
  return <>
    <div className="m-hist-top">
      <div>
        <h1 className="m-page-title" style={{marginBottom:2}}>Historical Performance Trend</h1>
        <p className="m-team-sub">{mode==="single" ? "Compare seller performance across goal sheet periods" : "Half-year comparisons side-by-side for easier analysis"}</p>
      </div>
      <button className="m-hist-back" onClick={()=>s.setHistView(false)}><ChevronLeft size={14}/> Back to Manager View</button>
    </div>
    <div className="m-hist-mode">
      <button className={mode==="single"?"on":""} onClick={()=>s.setHistMode("single")}>Single Member</button>
      <button className={mode==="compare"?"on":""} onClick={()=>s.setHistMode("compare")}>Compare Members</button>
    </div>
    <div className="m-hist-filters">
      <div className="m-hist-fgroup">
        <span className="m-hist-flbl">{mode==="single" ? "Goal Sheet Periods:" : "Select goal sheets to compare:"}</span>
        <div className="m-hist-periods">
          {HIST_PERIODS.map(p=>{const on=s.histPeriods.includes(p);
            return <button key={p} className={`m-hist-chk ${on?"on":""}`} onClick={()=>togglePeriod(p)}>
              <span className="m-hist-box">{on?"✓":""}</span>{p}
            </button>;})}
        </div>
      </div>
      <label className="m-hist-fgroup">
        <span className="m-hist-flbl">Team Member:</span>
        {mode==="single"
          ? <select className="m-hist-select" value={s.histMember} onChange={e=>s.setHistMember(e.target.value)}>
              {Object.keys(histData).map(m=><option key={m}>{m}</option>)}
            </select>
          : <select className="m-hist-select" value={s.histCmpMember} onChange={e=>s.setHistCmpMember(e.target.value)}>
              <option>All</option>{Object.keys(histData).map(m=><option key={m}>{m}</option>)}
            </select>}
      </label>
      <label className="m-hist-fgroup">
        <span className="m-hist-flbl">{mode==="single" ? "View PE:" : "Plan Element:"}</span>
        <select className="m-hist-select" value={s.histPe} onChange={e=>s.setHistPe(e.target.value)}>
          {Object.keys(HIST_PE).map(p=><option key={p}>{p}</option>)}
        </select>
      </label>
    </div>
    {mode==="single" ? <HistSingle s={s}/> : <HistCompare s={s}/>}
  </>;
}

/* ════════════════════════════════════════════════════════════════
   COMPX IQ — AI compensation assistant (full-screen chat popup)
   Restored from the original build; opens from the top bar.
   ════════════════════════════════════════════════════════════════ */
function AskIQPopup({onClose}) {
  const [messages, setMessages] = useState([{from:"bot", text:"Hi Alex! I'm StratComp IQ. Ask me about your attainment, earnings, payments, or goals."}]);
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const endRef = useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);

  const send = (text) => {
    const msg = text || input.trim();
    if(!msg) return;
    setMessages(p=>[...p,{from:"user",text:msg}]);
    setInput(""); setShowQuick(false);
    const lower = msg.toLowerCase();
    const key = Object.keys(botResponses).find(k=>lower.includes(k))||"default";
    setTimeout(()=>setMessages(p=>[...p,{from:"bot",text:botResponses[key]}]),500);
  };

  const quickQ = ["How close to accelerator?","What are my earnings?","Next payment?","Backlog status?","Active SPIFFs?","Which PE is best?"];

  return <div className="m-fs m-askiq">
    <div className="m-fs-hdr">
      <div className="m-askiq-title"><span className="m-askiq-spark"><Sparkles size={16}/></span>
        <div className="m-fs-hdr-text"><b>StratComp IQ</b><small>AI compensation assistant</small></div>
      </div>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    <div className="m-askiq-body">
      {showQuick && <div className="m-quick-grid">{quickQ.map((q,i)=><button key={i} className="m-quick-btn" onClick={()=>send(q)}>{q}</button>)}</div>}
      <div className="m-chat-msgs">
        {messages.map((m,i)=><div key={i} className={`m-msg m-msg-${m.from}`}>
          {m.from==="bot"&&<div className="m-msg-av"><Sparkles size={12}/></div>}
          <div className="m-msg-bub">{m.text}</div>
        </div>)}
        <div ref={endRef}/>
      </div>
    </div>
    <div className="m-chat-input">
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your comp…"/>
      <button className="m-chat-send" onClick={()=>send()}><Send size={16}/></button>
    </div>
  </div>;
}

/* Cisco logo — bar geometry from the official mark: short/medium bars share a common
   baseline, the two towers extend both above and below it */
/* ════════════════════════════════════════════════════════════════
   INSIGHT CANVAS — pin up to MAX_PINS insights for At A Glance.
   No pins → the AI keeps selecting insights automatically.
   ════════════════════════════════════════════════════════════════ */
function InsightCanvasCard({it, cat, s, onClose}) {
  const pinned = s.pinnedInsights.includes(it.id);
  const full = !pinned && s.pinnedInsights.length >= MAX_PINS;
  /* cap enforced inside the updater — render-time `full` is stale under rapid taps */
  const toggle = () => s.setPinnedInsights(prev =>
    prev.includes(it.id) ? prev.filter(x=>x!==it.id)
    : prev.length >= MAX_PINS ? prev
    : [...prev, it.id]);
  return <div className={`ic-card ${cat.fast?"ic-card-fast":""} ${pinned?"ic-pinned":""} ${full?"ic-maxed":""}`}
    style={cat.fast?{borderLeftColor:cat.color}:undefined}
    role="checkbox" aria-checked={pinned} tabIndex={0}
    onClick={toggle}
    onKeyDown={e=>{ /* target check: ignore keydown bubbling up from the CTA button */
      if (e.target!==e.currentTarget) return;
      if (e.key==="Enter"||e.key===" ") { e.preventDefault(); toggle(); }
    }}>
    <div className="ic-card-top">
      <span className={`ic-pin ${pinned?"on":""}`}/>
      <b>{it.title}</b>
      {it.live && <span className="ic-live">LIVE</span>}
    </div>
    {cat.fast && <span className="ic-fast-lbl" style={{color:cat.color}}>FAST START</span>}
    <p className="ic-desc">{it.desc}</p>
    <div className="ic-tags">{it.tags.map(t=><span key={t}>{t}</span>)}</div>
    {it.cta && <button className="ic-cta" onClick={e=>{e.stopPropagation(); onClose(); s.setTab(it.ctaTab);}}>{it.cta} →</button>}
  </div>;
}

function InsightCanvasPopup({s, onClose}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All Categories");
  const [requested, setRequested] = useState(false);
  const q = query.trim().toLowerCase();
  const nPins = s.pinnedInsights.length;
  return <div className="m-fs ic-fs">
    <div className="ic-hdr">
      <div className="ic-hdr-text">
        <b>Insight Canvas</b>
        <p>Pin up to <b>{MAX_PINS}</b> insights. No pins — AI selects {insightCards.length} insights for you.</p>
      </div>
      <button className="ic-close" onClick={onClose} aria-label="Close"><X size={17}/></button>
    </div>
    <div className="ic-tools">
      <div className="ic-search"><Search size={14}/><input placeholder="Search insights..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <select className="ic-catsel" value={cat} onChange={e=>setCat(e.target.value)} aria-label="Filter by category">
        <option>All Categories</option>
        {INSIGHT_CATS.map(c=><option key={c.name}>{c.name}</option>)}
      </select>
    </div>
    <div className="m-fs-body ic-body">
      {INSIGHT_CATS.filter(c=>cat==="All Categories"||c.name===cat).map(c=>{
        const items = c.items.filter(it=>!q || (it.title+" "+it.desc).toLowerCase().includes(q));
        if (!items.length) return null;
        return <div key={c.name} className="ic-cat">
          <div className="ic-cat-hdr"><i style={{background:c.color}}/><h3>{c.name}</h3><span>({items.length})</span></div>
          <div className="ic-grid">
            {items.map(it=><InsightCanvasCard key={it.id} it={it} cat={c} s={s} onClose={onClose}/>)}
          </div>
        </div>;
      })}
      <div className="ic-cat">
        <div className="ic-cat-hdr"><i style={{background:"var(--accent)"}}/><h3>Request a Custom Insight</h3></div>
        <div className="ic-request">
          <span>{requested ? "Request submitted — the comp team will follow up." : "Don't see what you need? Submit a request for a custom insight tailored to your workflow."}</span>
          <button className="ic-req-btn" disabled={requested} onClick={()=>setRequested(true)}>
            {requested ? "✓ Request Sent" : "+ Request Custom Insight"}
          </button>
        </div>
      </div>
    </div>
    <div className="ic-foot">
      <span>{nPins===0 ? `No pins — AI selects ${insightCards.length} insights for you` : `${nPins} of ${MAX_PINS} pinned${nPins===MAX_PINS?" · max reached":""}`}</span>
      <button className="ic-done" onClick={onClose}>Done</button>
    </div>
  </div>;
}

function CiscoLogo({className=""}) {
  const S = {y:10.24, h:6.41}, M = {y:5.93, h:10.72}, T = {y:0.03, h:19.74};
  return <div className={`cisco-logo ${className}`} aria-label="Cisco">
    <svg viewBox="0 0 72 19.8" fill="none" aria-hidden="true">
      {[S,M,T,M,S,M,T,M,S].map((b,i)=><rect key={i} x={(i*8.609).toFixed(2)} y={b.y} width="3.14" height={b.h} rx="1.57" fill="currentColor"/>)}
    </svg>
    <span>cisco</span>
  </div>;
}

/* iOS status bar (time + signal / wifi / battery) */
function StatusBar() {
  return <div className="m-statusbar">
    <span className="m-sb-time">7:37</span>
    <div className="m-sb-icons">
      {/* signal */}
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
        {[[0,4],[4.5,6],[9,8.5],[13.5,11]].map(([x,h],i)=>
          <rect key={i} x={x} y={11-h} width="3" height={h} rx="1" fill="currentColor"/>)}
      </svg>
      {/* wifi */}
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
        <path d="M8.5 2.4c2.8 0 5.4 1.1 7.3 2.9l1.2-1.4C14.8 1.7 11.8.5 8.5.5S2.2 1.7 0 3.9l1.2 1.4C3.1 3.5 5.7 2.4 8.5 2.4Z"/>
        <path d="M8.5 5.6c1.7 0 3.2.7 4.4 1.8l1.2-1.4C12.6 4.6 10.6 3.8 8.5 3.8s-4.1.8-5.6 2.2l1.2 1.4C5.3 6.3 6.8 5.6 8.5 5.6Z"/>
        <path d="M8.5 8.7c.8 0 1.6.3 2.1.9l-2.1 2.4-2.1-2.4c.5-.6 1.3-.9 2.1-.9Z"/>
      </svg>
      {/* battery */}
      <div className="m-sb-batt"><div className="m-sb-batt-fill"/></div>
    </div>
  </div>;
}

/* iPad status bar (time + date on the left, radios on the right) */
function IPadStatusBar() {
  return <div className="i-statusbar">
    <span className="i-sb-time">9:41 AM · Tue May 26</span>
    <div className="m-sb-icons">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
        {[[0,4],[4.5,6],[9,8.5],[13.5,11]].map(([x,h],i)=><rect key={i} x={x} y={11-h} width="3" height={h} rx="1" fill="currentColor"/>)}
      </svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
        <path d="M8.5 2.4c2.8 0 5.4 1.1 7.3 2.9l1.2-1.4C14.8 1.7 11.8.5 8.5.5S2.2 1.7 0 3.9l1.2 1.4C3.1 3.5 5.7 2.4 8.5 2.4Z"/>
        <path d="M8.5 5.6c1.7 0 3.2.7 4.4 1.8l1.2-1.4C12.6 4.6 10.6 3.8 8.5 3.8s-4.1.8-5.6 2.2l1.2 1.4C5.3 6.3 6.8 5.6 8.5 5.6Z"/>
        <path d="M8.5 8.7c.8 0 1.6.3 2.1.9l-2.1 2.4-2.1-2.4c.5-.6 1.3-.9 2.1-.9Z"/>
      </svg>
      <div className="m-sb-batt"><div className="m-sb-batt-fill"/></div>
    </div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   SHARED STATE + POPUPS  (live above both frames so toggling the
   device never resets the tab, filters, inputs, or open modals)
   ════════════════════════════════════════════════════════════════ */
function useCompXState() {
  const [tab, setTab] = useState("glance");
  const [viewMode, setViewMode] = useState("me");        // "me" | "team"
  const [theme, setTheme] = useState(getInitialTheme);
  const [calcItem, setCalcItem] = useState(null);
  const [pdfItem, setPdfItem] = useState(null);
  const [sellerItem, setSellerItem] = useState(null);
  const [showAskIQ, setShowAskIQ] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [reminders, setReminders] = useState(REMINDERS_SEED);
  const [periodIdx, setPeriodIdx] = useState(fullPaymentPeriods.length-1);   // newest (current) month
  const [showAllPeriods, setShowAllPeriods] = useState(false);               // last 3 ↔ last 12 months
  const [expanded, setExpanded] = useState({goalSheet:true});
  const [goalIdx, setGoalIdx] = useState(0);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderType, setOrderType] = useState(ORDER_SEARCH_TYPES[0]);   // search-by field
  const [orderStatus, setOrderStatus] = useState("All Statuses");      // order status filter
  const [orderPe, setOrderPe] = useState("All Plan Elements");         // order PE filter
  const [orderSubmitted, setOrderSubmitted] = useState(false);         // filters-only searches show results
  const [spiffFilters, setSpiffFilters] = useState({period:"All", status:"All", type:"All Types"});
  const [spiffExpanded, setSpiffExpanded] = useState(false);        // SPIFF page: first 2 ↔ all incentives
  const [aagSpiffExpanded, setAagSpiffExpanded] = useState(false);  // At A Glance SPIFF section: first 2 ↔ all
  const [backlogFilter, setBacklogFilter] = useState("All");        // Backlog Insights month bucket
  const [estPe, setEstPe] = useState(0);                            // Pay Estimator selected plan element
  const [estAdd, setEstAdd] = useState({PE1:0, PE2:0, PE3:0});      // Pay Estimator additional attainment $ per PE
  const [moreOpen, setMoreOpen] = useState(false);                  // mobile bottom-nav More sheet
  const [histItem, setHistItem] = useState(null);                   // Payment History popup (payment line item)
  const [otbCalcItem, setOtbCalcItem] = useState(null);             // OTB Compensation Calculation popup
  const [showKsoCalc, setShowKsoCalc] = useState(false);            // KSO Calculation popup
  const [teamPe, setTeamPe] = useState("PE1");
  const [teamExpanded, setTeamExpanded] = useState(false);          // first 2 ↔ all members
  const [teamView, setTeamView] = useState("all");                  // team views: all | watch | top | risk | saved id
  const [savedViews, setSavedViews] = useState([]);                 // user-saved team views {id, name, view, pe}
  const [dismissedInsights, setDismissedInsights] = useState([]);   // canvas card indices
  const [upliftOpen, setUpliftOpen] = useState(false);              // Goals · PE1 comp uplift plans
  const [histView, setHistView] = useState(false);                  // Team → Historical Performance Trend
  const [histMode, setHistMode] = useState("single");               // "single" | "compare"
  const [histMember, setHistMember] = useState("Sarah Chen");
  const [histCmpMember, setHistCmpMember] = useState("All");
  const [histPeriods, setHistPeriods] = useState([...HIST_PERIODS]);
  const [histPe, setHistPe] = useState("PE1");
  const [sideCollapsed, setSideCollapsed] = useState(false);        // iPad sidebar rail mode
  const [hideAmts, setHideAmts] = useState(false);                  // dot out payment figures (privacy)
  AMOUNTS_HIDDEN = hideAmts;
  const [insightCanvasOpen, setInsightCanvasOpen] = useState(false);
  const [pinnedInsights, setPinnedInsights] = useState([]);         // insight ids, max MAX_PINS
  const [showRecovBal, setShowRecovBal] = useState(false);          // Recoverable Balance History popup
  const [showPayCal, setShowPayCal] = useState(false);              // Full Payment Calendar popup
  const [notifs, setNotifs] = useState(notifications);              // dismissible notification list

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("compx-theme", theme); } catch (e) { /* ignore */ }
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  /* Deep-link: open Payments with a specific statement period selected */
  const openPayPeriod = month => {
    const idx = fullPaymentPeriods.findIndex(p => p.month === month);
    if (idx >= 0) setPeriodIdx(idx);
    setTab("payments");
  };

  /* Deep-link: open Goals with a specific plan-element tab selected */
  const openGoal = peId => {
    const idx = goalTabs.findIndex(t => t.id === peId);
    if (idx >= 0) setGoalIdx(idx);
    setTab("goals");
  };

  /* Deep-link: open SPIFF & Bonus with the target program visible —
     clears filters and expands past the first-2 fold when needed */
  const openSpiff = name => {
    setSpiffFilters({period:"All", status:"All", type:"All Types"});
    if (spiffPrograms.findIndex(sp => sp.name === name) >= 2) setSpiffExpanded(true);
    setTab("spiff");
  };

  return {
    tab, setTab, viewMode, setViewMode, theme, toggleTheme,
    calcItem, setCalcItem, pdfItem, setPdfItem,
    sellerItem, setSellerItem, showAskIQ, setShowAskIQ, notifOpen, setNotifOpen, reminders, setReminders,
    periodIdx, setPeriodIdx, openPayPeriod, openGoal, openSpiff, showAllPeriods, setShowAllPeriods, expanded, setExpanded, goalIdx, setGoalIdx,
    orderQuery, setOrderQuery, orderType, setOrderType, orderStatus, setOrderStatus, orderPe, setOrderPe,
    orderSubmitted, setOrderSubmitted, spiffFilters, setSpiffFilters, spiffExpanded, setSpiffExpanded,
    aagSpiffExpanded, setAagSpiffExpanded, backlogFilter, setBacklogFilter,
    estPe, setEstPe, estAdd, setEstAdd, moreOpen, setMoreOpen,
    histItem, setHistItem, otbCalcItem, setOtbCalcItem, showKsoCalc, setShowKsoCalc,
    teamPe, setTeamPe, teamExpanded, setTeamExpanded, teamView, setTeamView, savedViews, setSavedViews,
    dismissedInsights, setDismissedInsights,
    upliftOpen, setUpliftOpen,
    histView, setHistView, histMode, setHistMode, histMember, setHistMember,
    histCmpMember, setHistCmpMember, histPeriods, setHistPeriods, histPe, setHistPe,
    sideCollapsed, setSideCollapsed, hideAmts, setHideAmts,
    insightCanvasOpen, setInsightCanvasOpen, pinnedInsights, setPinnedInsights,
    showRecovBal, setShowRecovBal, showPayCal, setShowPayCal, notifs, setNotifs,
    currentMonth: fullPaymentPeriods[fullPaymentPeriods.length-1].month
  };
}

/* All overlays. On iPad the same popups render inside a centered modal
   shell (CSS neutralizes the phone's full-screen positioning). */
function FramePopups({s, variant="mobile"}) {
  const ipad = variant === "ipad";
  const shell = (node, onClose, cls="") => ipad
    ? <div className="i-modal-scrim" onClick={onClose}><div className={`i-modal-shell ${cls}`} onClick={e=>e.stopPropagation()}>{node}</div></div>
    : node;
  /* Calc popups describe the statement period being viewed, not always the newest month */
  const selMonth = fullPaymentPeriods[s.periodIdx].month;
  return <>
    {s.calcItem && shell(<CompCalcPopup item={s.calcItem} month={selMonth} onClose={()=>s.setCalcItem(null)}/>, ()=>s.setCalcItem(null))}
    {s.pdfItem && shell(<PdfPopup item={s.pdfItem} onClose={()=>s.setPdfItem(null)}/>, ()=>s.setPdfItem(null))}
    {s.sellerItem && shell(<SellerBreakdownPopup s={s.sellerItem} onClose={()=>s.setSellerItem(null)}/>, ()=>s.setSellerItem(null))}
    {s.showAskIQ && shell(<AskIQPopup onClose={()=>s.setShowAskIQ(false)}/>, ()=>s.setShowAskIQ(false), "i-modal-lg")}
    {s.insightCanvasOpen && shell(<InsightCanvasPopup s={s} onClose={()=>s.setInsightCanvasOpen(false)}/>, ()=>s.setInsightCanvasOpen(false), "i-modal-xl")}
    {s.showRecovBal && shell(<RecovBalancePopup onClose={()=>s.setShowRecovBal(false)}/>, ()=>s.setShowRecovBal(false))}
    {s.showPayCal && shell(<PaymentCalendarPopup onClose={()=>s.setShowPayCal(false)}/>, ()=>s.setShowPayCal(false))}
    {s.histItem && shell(<PaymentHistoryPopup item={s.histItem} onClose={()=>s.setHistItem(null)}/>, ()=>s.setHistItem(null))}
    {s.otbCalcItem && shell(<OtbCalcPopup item={s.otbCalcItem} month={selMonth} onClose={()=>s.setOtbCalcItem(null)}/>, ()=>s.setOtbCalcItem(null))}
    {s.showKsoCalc && shell(<KsoCalcPopup month={s.currentMonth} onClose={()=>s.setShowKsoCalc(false)}
      onKsoTool={()=>{s.setShowKsoCalc(false); s.openGoal("KSO");}}/>, ()=>s.setShowKsoCalc(false))}
  </>;
}

const NAV_TABS = [
  {id:"glance", label:"At A Glance", Icon:Home},
  {id:"payments", label:"Payments", Icon:DollarSign},
  {id:"goals", label:"Goals", Icon:Target},
  {id:"orders", label:"Order Search", Icon:Search},
  {id:"spiff", label:"SPIFF & Bonus", Icon:Trophy},
  {id:"backlog", label:"Backlog", Icon:Layers},
  {id:"estimator", label:"Pay Estimator", short:"Estimator", Icon:Calculator}
];
/* Mobile bottom bar: the four core tabs; the rest live in the More sheet */
const MOBILE_TAB_IDS = ["glance","payments","goals","orders"];
const MOBILE_MORE_IDS = ["spiff","backlog","estimator"];
const MOBILE_TABS = NAV_TABS.filter(t=>MOBILE_TAB_IDS.includes(t.id));
const MOBILE_MORE = NAV_TABS.filter(t=>MOBILE_MORE_IDS.includes(t.id));

/* ════════════════════════════════════════════════════════════════
   MOBILE FRAME (iPhone — CompX runs as a website in Safari, so the
   frame carries Safari's bottom address bar; it collapses to just
   the domain on scroll-down, iOS style)
   ════════════════════════════════════════════════════════════════ */
const SITE_DOMAIN = "sed-stage.cisco.com";

function SafariBar({mini, onExpand}) {
  return <div className={`m-safari ${mini?"mini":""}`} onClick={mini?onExpand:undefined}>
    {mini
      ? <span className="m-safari-mini-domain">{SITE_DOMAIN}</span>
      : <>
        <button className="m-safari-nav" aria-label="Back"><ChevronLeft size={20}/></button>
        <button className="m-safari-nav dim" aria-label="Forward"><ChevronRight size={20}/></button>
        <div className="m-safari-pill">
          <span className="m-safari-aa">AA</span>
          <span className="m-safari-domain">{SITE_DOMAIN}</span>
          <RefreshCw size={13} className="m-safari-refresh"/>
        </div>
        <button className="m-safari-nav" aria-label="Share"><Share size={18}/></button>
        <button className="m-safari-nav" aria-label="Tabs"><Copy size={18}/></button>
      </>}
  </div>;
}

/* URL-bar collapse driver. Collapsing/expanding the bar resizes the scroll
   container, and near the bottom of a long page the browser then clamps
   scrollTop, firing a reverse scroll event that re-toggles the bar — an
   oscillation that shakes the whole screen. Guards: never collapse without
   ample room left to scroll, and ignore events while a flip's layout
   change (and its .25s animation) settles. */
function useUrlBarCollapse() {
  const [mini, setMini] = useState(false);
  const lastY = useRef(0);
  const lastFlip = useRef(0);
  const onScroll = e => {
    const el = e.currentTarget;
    const y = el.scrollTop;
    const dy = y - lastY.current;
    lastY.current = y;

    const flip = next => { lastFlip.current = performance.now(); setMini(next); };
    if (y < 24) { if (mini) flip(false); return; }              // at top: always expanded
    if (performance.now() - lastFlip.current < 320) return;     // let the last flip settle

    const room = el.scrollHeight - el.clientHeight - y;          // distance to bottom
    if (!mini && dy > 8 && room > 140) flip(true);               // collapse only with room to spare
    else if (mini && dy < -10) flip(false);
  };
  return [mini, setMini, onScroll];
}

function MobileFrame({s}) {
  const [urlMini, setUrlMini, onScroll] = useUrlBarCollapse();
  return <div className="m-device">
    <span className="m-btn m-btn-mute"/>
    <span className="m-btn m-btn-volup"/>
    <span className="m-btn m-btn-voldn"/>
    <span className="m-btn m-btn-power"/>

    <div className="m-phone">
      <div className="m-screen" style={{"--safari-h": urlMini ? "30px" : "64px"}}>
        <StatusBar/>
        <div className="m-island"/>

        <div className="m-brandbar">
          <div className="m-brand-lockup">
            <CiscoLogo className="m-cisco"/>
            <span className="m-compx">Comp<em>X</em></span>
          </div>
          <div className="m-brand-actions">
            <button className="m-askiq-open" onClick={()=>s.setShowAskIQ(true)} aria-label="Ask StratComp IQ"><Sparkles size={16}/></button>
            <button className="m-theme-toggle" onClick={s.toggleTheme} aria-label={s.theme==="dark"?"Switch to light mode":"Switch to dark mode"}>
              {s.theme==="dark" ? <Sun size={17}/> : <Moon size={17}/>}
            </button>
          </div>
        </div>
        {/* Me/Team toggle lives on At A Glance only (team view keeps it so you can switch back) */}
        {(s.tab==="glance" || s.viewMode==="team") && <div className="m-viewbar">
          <div className="m-viewtoggle">
            <button className={s.viewMode==="me"?"on":""} onClick={()=>s.setViewMode("me")}><User size={14}/> My Compensation</button>
            <button className={s.viewMode==="team"?"on":""} onClick={()=>s.setViewMode("team")}><Users size={14}/> Team View</button>
          </div>
        </div>}

        <div className="m-content" onScroll={onScroll}>
          {s.viewMode==="team"
            ? <TeamPage s={s}/>
            : <>
                {s.tab==="glance"   && <AtAGlancePage s={s}/>}
                {s.tab==="payments" && <PaymentsPage s={s}/>}
                {s.tab==="goals"    && <GoalsPage s={s}/>}
                {s.tab==="orders"   && <OrderSearchPage s={s}/>}
                {s.tab==="spiff"    && <SpiffBonusPage s={s}/>}
                {s.tab==="backlog"  && <BacklogPage s={s}/>}
                {s.tab==="estimator" && <PayEstimatorPage s={s}/>}
              </>}
        </div>

        {s.viewMode==="me" && <nav className="m-tabbar">
          {MOBILE_TABS.map(t=><button key={t.id} className={`m-tab ${s.tab===t.id?"m-tab-on":""}`} onClick={()=>{s.setTab(t.id); s.setMoreOpen(false);}}>
            <t.Icon size={18}/><span>{t.short||t.label}</span>
          </button>)}
          <button className={`m-tab ${MOBILE_MORE_IDS.includes(s.tab)?"m-tab-on":""}`} onClick={()=>s.setMoreOpen(!s.moreOpen)} aria-expanded={s.moreOpen}>
            <MoreHorizontal size={18}/><span>More</span>
          </button>
        </nav>}

        {s.viewMode==="me" && s.moreOpen && <>
          <div className="m-more-backdrop" onClick={()=>s.setMoreOpen(false)}/>
          <div className="m-more-sheet">
            {MOBILE_MORE.map(t=><button key={t.id} className={s.tab===t.id?"on":""}
              onClick={()=>{s.setTab(t.id); s.setMoreOpen(false);}}>
              <t.Icon size={16}/>{t.label}
            </button>)}
          </div>
        </>}

        <SafariBar mini={urlMini} onExpand={()=>setUrlMini(false)}/>
        <div className="m-home"/>
        <FramePopups s={s} variant="mobile"/>
      </div>
    </div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   IPAD FRAME — sidebar split-view, multi-column pages
   ════════════════════════════════════════════════════════════════ */
function IPadHeader({title, sub, s, right}) {
  return <div className="i-head">
    <div className="i-head-titles">
      <h1 className="i-title">{title}</h1>
      {sub && <p className="i-sub">{sub}</p>}
    </div>
    <div className="i-head-actions">
      {right}
      <UtilityIcons ipad/>
      <button className="i-iconbtn" onClick={()=>s.setNotifOpen(!s.notifOpen)} aria-label="Notifications"><Bell size={19}/>{s.notifs.length>0 && <span className="m-bell-count">{s.notifs.length}</span>}</button>
      {s.notifOpen && <><div className="m-notif-overlay" onClick={()=>s.setNotifOpen(false)}/>
        <NotifDropdown s={s} onClose={()=>s.setNotifOpen(false)} ipad/></>}
    </div>
  </div>;
}

function IPadGlance({s}) {
  return <div className="i-page">
    <IPadHeader title="At A Glance" sub="Your compensation snapshot · H1 2026" s={s}/>
    {/* Payment timeline — cards read chronologically left→right (Apr · May · Jun),
        with the current month as the dominant hero in the middle */}
    <div className="i-glance-top">
      {monthlyPayCards.map((c,i)=> c.current
        ? <div key={i} className="m-hero i-hero" role="button" tabIndex={0} title="View Payments"
            onClick={()=>s.openPayPeriod(c.period)} onKeyDown={e=>e.key==="Enter"&&s.openPayPeriod(c.period)}>
            <div className="m-hero-top">
              <span className="m-hero-label">Current Payment · {c.month}</span>
              <span className={`m-pay-status m-status-${c.status.toLowerCase()}`}>{c.status}</span>
            </div>
            <div className="m-hero-amt-row"><span className="m-hero-amt">{amt("$"+c.amount)}</span><span className="m-hero-usd">USD</span></div>
            <div className="m-hero-meta">
              <span className="m-hero-asof"><Calendar size={12}/> {DATA_AS_OF}<HideBtn s={s} light/></span>
              <span className="m-hero-change">{c.change} vs Apr · {c.payDate}</span>
            </div>
          </div>
        : <div key={i} className={`m-context-card i-timeline-card ${c.period?"m-context-click":""}`}
            role={c.period?"button":undefined} tabIndex={c.period?0:undefined} title={c.period?`View ${c.month} payment`:undefined}
            onClick={c.period?()=>s.openPayPeriod(c.period):undefined}
            onKeyDown={c.period?(e=>e.key==="Enter"&&s.openPayPeriod(c.period)):undefined}>
            <span className="m-context-month">{c.month}</span>
            <b className="m-context-amt">{amt("$"+c.amount)}</b>
            <span className={`m-pay-status m-status-${c.status.toLowerCase()}`}>{c.status}</span>
            <small className="i-timeline-date">{c.payDate}</small>
          </div>)}
    </div>
    <div className="m-section-label"><Menu size={13} className="m-section-icon"/> PLAN ELEMENTS & INCENTIVES</div>
    <div className="i-grid-3">
      {planElements.map((pe,i)=><div key={i} className="m-pe-card i-pe-card m-pe-flat m-pe-click" role="button" tabIndex={0}
        aria-label={`Open ${pe.id} on Goals`} onClick={()=>s.openGoal(pe.id)}
        onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); s.openGoal(pe.id); } }}>
        <div className="m-pe-top">
          <div className="m-pe-left"><span className="m-pe-badge" style={{background:pe.color}}>{pe.id}</span><b>{pe.name}</b></div>
          <span className="m-pe-goal">{pe.goal}</span>
        </div>
        <div className="m-pe-att-row">
          <b className="m-pe-att-big" style={{color:pe.color}}>{pe.attPct}%</b>
          <span className="m-pe-att-lbl">REVENUE ATT.</span>
        </div>
        <BookingsBar pe={pe}/>
      </div>)}
    </div>

    <div className="i-grid-2">
      <AagSpiffSection s={s}/>
      <div className="m-section">
        <div className="m-section-hdr"><h2>Insights</h2><InsightCanvasBtn s={s}/></div>
        <InsightCardsList s={s}/>
      </div>
    </div>
  </div>;
}

function IPadPayments({s}) {
  const p = fullPaymentPeriods[s.periodIdx];
  return <div className="i-page">
    <IPadHeader title="Payments" sub={`${DATA_AS_OF} · ${REFRESH_NOTE}`} s={s}
      right={<><button className="m-goalsheet-btn" onClick={()=>s.setShowRecovBal(true)}>Recoverable Balance History</button><HideBtn s={s}/></>}/>
    <PeriodChips s={s}/>
    <div className="i-split">
      <div className="i-col-a">
        <PaymentBreakdownCard p={p} s={s} donutSize={188}/>
        <PaymentScheduleCard p={p} s={s}/>
      </div>
      <div className="i-col-b">
        <PaymentAccordion p={p} s={s}/>
      </div>
    </div>
  </div>;
}

function IPadGoals({s}) {
  const g = goalTabs[s.goalIdx];
  return <div className="i-page">
    <IPadHeader title="Goals" sub="Plan-element attainment · H1 2026" s={s}/>
    <div className="i-gsel-row"><GoalSheetSelect/></div>
    <div className="i-goaltab-row">
      {goalTabs.map((t,i)=><button key={t.id} className={`m-goaltab ${i===s.goalIdx?"on":""}`} onClick={()=>s.setGoalIdx(i)}
        style={i===s.goalIdx?{background:t.color, color:"#fff", borderColor:t.color}:{}}>{t.id}</button>)}
    </div>
    {g.id==="KSO" ? <KsoSection/> : g.id==="NDR" ? <NdrSection/> : <div className="i-split i-goals-split">
      <div className="i-col-a">
        <div className="m-section m-pe-flat m-pe-solo" style={{borderLeftColor:g.color}}>
          <div className="m-section-hdr">
            <div className="m-pe-left"><span className="m-pe-badge" style={{background:g.color}}>{g.id}</span><b>{g.name}</b></div>
            <span className="m-pe-goal">{g.goal} Goal</span>
          </div>
          <div className="m-pe-att-row">
            <b className="m-pe-att-big" style={{color:g.color}}>{g.attPct}%</b>
            <span className="m-pe-att-lbl">REVENUE ATT.</span>
          </div>
          <div className="m-goal-stats">
            <div><small>Goal</small><span>{g.goal}</span></div>
            <div><small>Attainment</small><span style={{color:g.color}}>{g.attPct}%</span></div>
            <div><small>Incentive</small><span className="m-goal-earn">{amt(g.incentive)}</span></div>
          </div>
        </div>
      </div>
      <div className="i-col-b">
        <div className="m-section m-pe-flat m-pe-solo">
          <div className="m-section-hdr"><h2>Bookings vs Revenue</h2></div>
          <BookingsBar pe={g}/>
          {g.id==="PE1" && <CompUpliftSection s={s}/>}
        </div>
      </div>
    </div>}
  </div>;
}

function IPadOrders({s}) {
  const {q, list} = deriveOrders(s.orderQuery, s.orderType, s.orderStatus, s.orderPe);
  const show = q || s.orderSubmitted;
  return <div className="i-page">
    <IPadHeader title="Order Search" sub="Look up a seller's orders" s={s}/>
    <OrderSearchControls s={s} ipad/>
    {show ? <>
      <div className="m-os-results-hdr">
        <p className="m-search-count">{list.length} order{list.length===1?"":"s"} found</p>
      </div>
      {list.length>0 ? <div className="i-grid-3">{list.map(o=><OrderCard key={o.id} o={o}/>)}</div>
        : <div className="m-search-empty"><Search size={30}/><b>No orders found</b><span>Try a different {s.orderType} or loosen the filters.</span></div>}
    </> : <div className="m-search-empty">
      <Search size={30}/>
      <b>Search a seller's orders</b>
      <span>Pick a field, choose filters, and hit Submit to look up orders.</span>
    </div>}
  </div>;
}

function IPadSpiff({s}) {
  const list = filterSpiffs(s.spiffFilters);
  const visible = s.spiffExpanded ? list : list.slice(0,2);
  return <div className="i-page">
    <IPadHeader title="SPIFF & Bonus" sub="SPIFFs, uplifts, bonuses, and other strategic incentive programs." s={s} right={<SpiffStatPills/>}/>
    <SpiffFilterRow s={s}/>
    {list.length>0 ? <div className="i-grid-3">{visible.map(p=><SpiffProgramCard key={p.name} p={p}/>)}</div>
      : <div className="m-search-empty"><Trophy size={30}/><b>No incentives match</b><span>Loosen the filters to see more programs.</span></div>}
    {list.length>2 && <button className="m-showall" onClick={()=>s.setSpiffExpanded(!s.spiffExpanded)}>
      {s.spiffExpanded ? "Show Fewer" : `See All ${list.length} Incentives`}
      <ChevronDown size={14} className={s.spiffExpanded?"up":""}/>
    </button>}
  </div>;
}

function IPadTeam({s}) {
  const vf = teamViewFilters(s);
  const earnedRows = teamEarnedRows().filter(vf.row);
  const bookingRows = teamBookingRows(s.teamPe).filter(vf.row);
  if (s.histView) return <div className="i-page"><HistPage s={s}/></div>;
  return <div className="i-page">
    <IPadHeader title="Team Dashboard" sub={`${TEAM_AS_OF} · ${REFRESH_NOTE}`} s={s}/>
    <TeamControls s={s}/>
    <TeamViewsBar s={s}/>
    <div className="i-split">
      <AttainmentChart title="Earned vs Target Incentive" subtitle="Current period, sorted highest to lowest earned." rows={earnedRows}/>
      <AttainmentChart title="Bookings Attainment" subtitle="Sorted by bookings. Bar shows progress toward individual goal." rows={bookingRows}
        control={<div className="m-pe-select">{["PE1","PE2","PE3"].map(pp=><button key={pp} className={pp===s.teamPe?"on":""} onClick={()=>s.setTeamPe(pp)}>{pp}</button>)}</div>}/>
    </div>
    <TeamMembersSection s={s} gridClass="i-grid-3" members={teamMembers.filter(vf.member)}/>
    <TeamInsightsSection s={s} gridClass="i-grid-3"/>
  </div>;
}

/* iPad Safari toolbar (top, iPadOS layout): back/forward on the left,
   centered address pill, share/new-tab/tabs on the right. Collapses to
   a slim domain strip on scroll-down, same as the phone. */
function IPadSafariBar({mini, onExpand}) {
  return <div className={`i-safari ${mini?"mini":""}`} onClick={mini?onExpand:undefined}>
    {mini
      ? <span className="i-safari-mini-domain">{SITE_DOMAIN}</span>
      : <>
        <div className="i-safari-cluster">
          <button className="i-safari-nav" aria-label="Back"><ChevronLeft size={19}/></button>
          <button className="i-safari-nav dim" aria-label="Forward"><ChevronRight size={19}/></button>
        </div>
        <div className="i-safari-pill">
          <span className="m-safari-aa">AA</span>
          <span className="i-safari-domain">{SITE_DOMAIN}</span>
          <RefreshCw size={13} className="m-safari-refresh"/>
        </div>
        <div className="i-safari-cluster">
          <button className="i-safari-nav" aria-label="Share"><Share size={17}/></button>
          <button className="i-safari-nav" aria-label="New tab"><Plus size={19}/></button>
          <button className="i-safari-nav" aria-label="Tabs"><Copy size={17}/></button>
        </div>
      </>}
  </div>;
}

function IPadFrame({s, landscape=false}) {
  const team = s.viewMode === "team";
  const [urlMini, setUrlMini, onScroll] = useUrlBarCollapse();
  return <div className={`i-device ${landscape?"land":""}`}>
    <span className="i-cam"/>
    <div className="i-screen" style={{"--isafari-h": urlMini ? "26px" : "53px"}}>
      <IPadStatusBar/>
      <IPadSafariBar mini={urlMini} onExpand={()=>setUrlMini(false)}/>
      <div className="i-shell">
        <aside className={`i-sidebar ${s.sideCollapsed?"closed":""}`}>
          <div className="i-brand">
            <CiscoLogo className="i-cisco"/>
            <div className="i-brand-txt"><b>Comp<em>X</em></b><small>Compensation IQ</small></div>
            <button className="i-side-collapse" onClick={()=>s.setSideCollapsed(!s.sideCollapsed)}
              aria-label={s.sideCollapsed?"Expand sidebar":"Collapse sidebar"} title={s.sideCollapsed?"Expand":"Collapse"}>
              {s.sideCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
            </button>
          </div>
          <p className="i-brand-tag">Your source for compensation information</p>
          <div className="i-profile" title="Alex Johnson · Enterprise AE">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" className="i-avatar" alt=""/>
            <div className="i-profile-txt"><b>Hi Alex!</b><small>Enterprise AE</small></div>
          </div>
          <div className="i-viewtoggle">
            <button className={!team?"on":""} onClick={()=>s.setViewMode("me")} title="My Compensation"><User size={15}/><span>My Compensation</span></button>
            <button className={team?"on":""} onClick={()=>s.setViewMode("team")} title="Team View"><Users size={15}/><span>Team View</span></button>
          </div>
          <nav className="i-nav">
            {!team
              ? NAV_TABS.map(t=><button key={t.id} className={`i-navitem ${s.tab===t.id?"on":""}`} onClick={()=>s.setTab(t.id)} title={t.label}>
                  <t.Icon size={19}/><span>{t.label}</span>
                </button>)
              : <div className="i-navitem on" title="Team Dashboard"><Users size={19}/><span>Team Dashboard</span></div>}
          </nav>
          <div className="i-side-foot">
            <button className="i-side-askiq" onClick={()=>s.setShowAskIQ(true)} title="Ask StratComp IQ"><Sparkles size={16}/><span>Ask StratComp IQ</span></button>
            <button className="i-side-theme" onClick={s.toggleTheme} title={s.theme==="dark"?"Light mode":"Dark mode"}>
              {s.theme==="dark" ? <Sun size={17}/> : <Moon size={17}/>}<span>{s.theme==="dark"?"Light mode":"Dark mode"}</span>
            </button>
          </div>
        </aside>

        <main className="i-main" onScroll={onScroll}>
          {team ? <IPadTeam s={s}/> : <>
            {s.tab==="glance"   && <IPadGlance s={s}/>}
            {s.tab==="payments" && <IPadPayments s={s}/>}
            {s.tab==="goals"    && <IPadGoals s={s}/>}
            {s.tab==="orders"   && <IPadOrders s={s}/>}
            {s.tab==="spiff"    && <IPadSpiff s={s}/>}
            {s.tab==="backlog"  && <IPadBacklog s={s}/>}
            {s.tab==="estimator" && <IPadEstimator s={s}/>}
          </>}
        </main>
      </div>
      <FramePopups s={s} variant="ipad"/>
    </div>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   STANDALONE DEVICE TOGGLE (dev/demo control, outside the app frame)
   ════════════════════════════════════════════════════════════════ */
function DeviceToggle({device, setDevice, orientation, onRotate}) {
  return <div className="dev-toggle" role="group" aria-label="Preview device">
    <span className="dev-toggle-lbl">Preview</span>
    <div className="dev-toggle-pills">
      <button className={device==="mobile"?"on":""} onClick={()=>setDevice("mobile")}><Smartphone size={14}/> Mobile</button>
      <button className={device==="ipad"?"on":""} onClick={()=>setDevice("ipad")}><Tablet size={14}/> iPad</button>
    </div>
    {device==="ipad" && <button className="dev-rotate" onClick={onRotate} aria-label="Rotate iPad">
      <RotateCw size={13} className={orientation==="landscape"?"turned":""}/> {orientation==="portrait"?"Landscape":"Portrait"}
    </button>}
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   APP — shared state; the toggle swaps the frame without losing it
   ════════════════════════════════════════════════════════════════ */
function App() {
  const s = useCompXState();
  const [device, setDevice] = useState("mobile");
  const [orientation, setOrientation] = useState("portrait");   // iPad only
  const land = device==="ipad" && orientation==="landscape";
  return <div className={`app-root app-${device} ${land?"app-land":""}`}>
    <DeviceToggle device={device} setDevice={setDevice} orientation={orientation}
      onRotate={()=>setOrientation(o=>o==="portrait"?"landscape":"portrait")}/>
    <div className={`frame-stage frame-stage-${device} ${land?"land":""}`}>
      {device === "mobile" ? <MobileFrame s={s}/> : <IPadFrame s={s} landscape={land}/>}
    </div>
  </div>;
}

createRoot(document.getElementById("root")).render(<App/>);
