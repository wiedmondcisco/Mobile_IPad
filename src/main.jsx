import React, { useState, useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import { Home, DollarSign, Target, Search, ChevronRight, ChevronDown, ChevronLeft, Bell, X, FileText, Filter, Calendar, ArrowUp, RefreshCw, Moon, Sun, Users, User, Layers, Sparkles, Send, Smartphone, Tablet, RotateCw, Share, Copy, Plus, ExternalLink, Eye, EyeOff, CheckCircle2 } from "lucide-react";
import "./styles.css";

/* ════════════════════════════════════════════════════════════════
   DATA (colors/type/components from the desktop/browser version;
   layout & rhythm from the old mobile design)
   PE color map: PE1 Prod+Services = gold, PE2 Recurring Software = green,
   PE3 Services = blue/purple — kept consistent across all pages.
   ════════════════════════════════════════════════════════════════ */
const DATA_AS_OF = "Data as of Jun 30, 2026, 2:45 PM";
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
  "attainment":"You're at 24% on PRI (CX-SVC RENEW), 71% on NPR (RRA-SW), and 44% on NPR2 (SEC PRD). Overall weighted: ~46%. You need significant revenue growth on PRI to hit accelerator.",
  "earnings":"YTD earnings: $50,328. Current month (May 2026): $8,408.25 — Goal Sheet $5,858, SPIFFs $2,125, Draws $50, Adj $75, OTB $100, Past $200.",
  "accelerator":"Accelerator kicks in at 100% attainment. Rate jumps from 1% to 5.25% per 1% attainment! Your best positioned PE is NPR at 71%.",
  "close":"Your best positioned PE is NPR (Recurring Software) at 71%. You need about $8.8M more to reach 100%. PRI is at 24% needing ~$2.9M.",
  "payment":"Next payment: $8,408.25 on Jun 2, 2026. Previous: $6,830 (Apr). Lock date: May 28.",
  "backlog":"$207K in backlog. Estimated additional paycheck impact: +$3,200. Orders pending fulfillment across multiple months.",
  "goal":"Goal Sheet H2: PRI $3.81M (50% weight), NPR $12.65M (30%), NPR2 $735K (20%). Total target incentive: $31,759.",
  "spiff":"Active: Q2 Cloud Migration SPIFF ($5K potential, 25% progress), Partner Acceleration Q2 ($3,500, 25%). Total projected SPIFF earnings: $2,125.",
  "best":"NPR2 (SEC PRD ACV) is at 167.59% attainment — already in accelerator zone! NPR (RRA-SW) is at 71%, closest to the 100% accelerator threshold.",
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
  {month:"MAY 2026", period:"May 2026", status:"Open", current:true, amount:"8,408.25", change:"▲ 37.5%", payDate:"Pay: Jun 2, 2026"},
  {month:"JUN 2026", status:"Upcoming", amount:"0.00", payDate:"Pay: Jul 2, 2026"}   // no statement period yet — card stays inert
];

const planElements = [
  {id:"PE1", name:"Prod+Services", goal:"$109k Goal", bookingsAmt:"$68k", bookingsPct:63, revenueAmt:"$26k", revenuePct:24, backlogAmt:"$42k", backlogPct:39, attPct:24, color:PE_COLOR.PE1, blColor:"#fbbf24"},
  {id:"PE2", name:"Recurring Software", goal:"$87k Goal", bookingsAmt:"$90k", bookingsPct:103, revenueAmt:"$62k", revenuePct:71, backlogAmt:"$28k", backlogPct:32, attPct:71, color:PE_COLOR.PE2, blColor:"#6ee7b7"},
  {id:"PE3", name:"Services", goal:"$90k Goal", bookingsAmt:"$85k", bookingsPct:94, revenueAmt:"$40k", revenuePct:44, backlogAmt:"$45k", backlogPct:50, attPct:44, color:PE_COLOR.PE3, blColor:"#93c5fd"}
];

const spiffBonus = [
  {status:"Achieved", statusColor:"#10b981", name:"FY26 Attainment Milestone 1", sub:"Bonus earned", amount:"$7,560", date:"Paid Jun 16, 2026", pct:100},
  {status:"Active", statusColor:"#3b82f6", name:"FY26 Attainment Milestone 2", sub:"$400k from 80%", amount:"$15,250", date:"Est. Jun 16, 2026", pct:65},
  {status:"Active", statusColor:"#3b82f6", name:"Q4FY24 Slam Dunk with Splunk", sub:"Partner incentive", amount:"$8,330", date:"Est. July 2026", pct:75, prog:"3/4"}
];

const insightCards = [
  {peBadge:"Prod+Services", peColor:PE_COLOR.PE1, tag:"$320K ★", tagColor:"#dc2626", title:"High Value Booking", desc:"Stargate AI ($320K) is your largest eligible booking this period. Top backlog: Cortex Financial ($230K), Helix Networks ($210K). Clearing either pushes PE1 past the 50% threshold."},
  {peBadge:"Services", peColor:PE_COLOR.PE3, tag:"$92K ★", tagColor:"#dc2626", title:"Services Backlog Opportunity", desc:"Services sits at 44% attainment — $5.4K from the 50% tier. GlobalNet Inc ($92K backlog, PE3) clearing alone would jump you to 1.5x rate."},
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
  {type:"amber", title:"Goal Sheet acceptance due", desc:"Review and accept Q4 FY26 Goal Sheet by Jun 15."},
  {type:"green", title:"Q2 Bonus Eligible", desc:"On track to earn quarterly bonus."},
  {type:"blue", title:"New Comp Plan Released", desc:"Q4 FY26 Plan is now available."}
];

/* My Reminders (second tab of the bell dropdown) — user-managed notes */
const REMINDERS_SEED = [
  {id:1, text:"Follow up on PE2 deal with BlueStar Solutions", date:"2026-06-10", done:false},
  {id:2, text:"Review Q4 goal sheet before acceptance window closes", date:"2026-06-15", done:false}
];
const fmtRemDate = iso => iso
  ? new Date(iso+"T12:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
  : "No date";

/* Payments — periods with full breakdown + per-PE calculation data */
const recentPaymentPeriods = [
  {month:"May 2026", amount:"8,408.25", status:"Open", payDate:"Jun 2, 2026", lockDate:"May 28, 2026", revDates:"May 1 – May 18, 2026",
    goalSheet:{period:"Jan 26, 2026 - Jul 26, 2026", total:"5,858.25", items:[
      {pe:"PE1", name:"CX-SVC RENEW ANN|PRI", label:"Prod+Services", weight:"50%", pct:24, attChange:4, payout:"1,585.54", color:PE_COLOR.PE1,
        calc:{incrementalAtt:"4%", totalAtt:"24%", weight:"50%", targetIncentive:"31,759.05", proration:"100%", payoutRate:"18%", result:"1,585.54", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"20%", incr:"4%", mult:"18%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"24%", mult:"18%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]},
        /* PE1 splits into product-line components — the parent total is
           display-only; each child opens its own calc breakdown */
        children:[
          {pe:"PE1", label:"Prod+Services", color:PE_COLOR.PE1, pct:24, attChange:4, payout:"1,359.00",
            calc:{incrementalAtt:"4%", totalAtt:"24%", weight:"60%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"3%", totalEarned:"1,359.00", prevPaid:"0", result:"1,359.00"}},
          {pe:"CU", label:"Security Comp Uplift", color:"#8b5cf6", pct:4, attChange:3, payout:"90.64",
            calc:{incrementalAtt:"3%", totalAtt:"4%", weight:"2%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"15%", totalEarned:"90.64", prevPaid:"0", result:"90.64"}},
          {pe:"CU", label:"Collab Comp Uplift", color:"#8b5cf6", pct:4, attChange:3, payout:"90.64",
            calc:{incrementalAtt:"3%", totalAtt:"4%", weight:"2%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"15%", totalEarned:"90.64", prevPaid:"0", result:"90.64"}},
          {pe:"MY", label:"Services MY", color:"#3b82f6", pct:5, attChange:1, payout:"45.26",
            calc:{incrementalAtt:"1%", totalAtt:"5%", weight:"1%", targetIncentive:"75,500.00", proration:"50%", payoutRate:"12%", totalEarned:"45.26", prevPaid:"0", result:"45.26"}}
        ]},
      {pe:"PE2", name:"RRA-SW WO SEC_ACV|AG|WM|NPR", label:"Recurring Software", weight:"30%", pct:71, attChange:6, payout:"1,019.25", color:PE_COLOR.PE2,
        calc:{incrementalAtt:"6%", totalAtt:"71%", weight:"30%", targetIncentive:"31,759.05", proration:"100%", payoutRate:"53.25%", result:"1,019.25", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"65%", incr:"6%", mult:"37.5%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"6%", mult:"15.75%", active:true},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"-", mult:"-"},
            {range:"50 – 75 %", peRate:"1.5%", rev:"71%", mult:"53.25%", active:true},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}},
      {pe:"PE3", name:"SEC PRD ACV|WM|NPR", label:"Services", weight:"20%", pct:44, attChange:5, payout:"980.00", color:PE_COLOR.PE3,
        calc:{incrementalAtt:"5%", totalAtt:"44%", weight:"20%", targetIncentive:"31,759.05", proration:"100%", payoutRate:"33%", result:"980.00", rateName:"CS402",
          rateIncremental:[
            {range:"0 – 50 %", peRate:".75%", prior:"39%", incr:"5%", mult:"33%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".75%", rev:"44%", mult:"33%", active:true},
            {range:"50 – 75 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:"1%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"2%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:"1.5%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:"1%", rev:"-", mult:"-"}]}},
      {pe:"KSO", name:"Key Sales Objectives", label:"KSO", weight:"—", pct:100, payout:"2,500.00", color:PE_COLOR.KSO}
    ]},
    spiff:{total:"2,125.00", items:[{name:"Q4FY24 Slam Dunk with Splunk", amount:"$1,625.00"},{name:"Cloud Migration Accelerator", amount:"$500.00"}]},
    draws:{total:"50.00", items:[{name:"Monthly Incentive Payment (MIPS)", amount:"$35.00"},{name:"Recoverable Draw", amount:"$15.00"}]},
    adj:{total:"75.00", items:[{name:"ICC True-up Adjustment", amount:"$75.00"}]},
    otb:{total:"100.00", items:[{name:"Security iACV Plan", amount:"$100.00"}]},
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
  {month:"April 2026", amount:"6,830.00", status:"Paid", payDate:"May 8, 2026", lockDate:"May 1, 2026", revDates:"Apr 1 – Apr 30, 2026",
    goalSheet:{period:"Jan 26, 2026 - Jul 26, 2026", total:"4,605.00", items:[
      {pe:"PE1", label:"Prod+Services", weight:"50%", pct:22, attChange:3, payout:"1,320.00", color:PE_COLOR.PE1},
      {pe:"PE2", label:"Recurring Software", weight:"30%", pct:65, attChange:5, payout:"1,985.00", color:PE_COLOR.PE2},
      {pe:"PE3", label:"Services", weight:"20%", pct:39, attChange:4, payout:"1,300.00", color:PE_COLOR.PE3}
    ]},
    spiff:{total:"2,125.00", items:[{name:"Q4FY24 Slam Dunk", amount:"$2,125.00"}]},
    draws:{total:"50.00", items:[{name:"MIPS", amount:"$50.00"}]}, adj:{total:"50.00", items:[{name:"ICC Adj", amount:"$50.00"}]}, otb:{total:"0.00", items:[]}, past:{total:"0.00", items:[]}
  },
  {month:"March 2026", amount:"6,189.00", status:"Paid", payDate:"Apr 8, 2026", lockDate:"Apr 1, 2026", revDates:"Mar 1 – Mar 31, 2026",
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
    draws:{total:"50.00", items:[{name:"MIPS", amount:"$50.00"}]},
    adj:{total:"50.00", items:[{name:"ICC Adj", amount:"$50.00"}]},
    otb:{total:"0.00", items:[]}, past:{total:"0.00", items:[]}
  };
}
const H2_FY25 = "Jul 25, 2025 - Jan 25, 2026", H1_FY26 = "Jan 26, 2026 - Jul 26, 2026";
const olderPaymentPeriods = [
  ["June 2025",     "3,412.00", "1,900.00", [18,42,28], "Jul 8, 2025", "Jul 1, 2025", "Jun 1 – Jun 30, 2025", H2_FY25],
  ["July 2025",     "4,120.50", "1,827.00", [21,48,31], "Aug 8, 2025", "Aug 1, 2025", "Jul 1 – Jul 31, 2025", H2_FY25],
  ["August 2025",   "3,845.00", "1,375.00", [24,51,33], "Sep 8, 2025", "Sep 1, 2025", "Aug 1 – Aug 31, 2025", H2_FY25],
  ["September 2025","4,610.00", "2,090.00", [29,57,38], "Oct 8, 2025", "Oct 1, 2025", "Sep 1 – Sep 30, 2025", H2_FY25],
  ["October 2025",  "3,988.00", "1,152.00", [33,61,41], "Nov 8, 2025", "Nov 1, 2025", "Oct 1 – Oct 31, 2025", H2_FY25],
  ["November 2025", "5,240.00", "1,730.00", [38,68,46], "Dec 8, 2025", "Dec 1, 2025", "Nov 1 – Nov 30, 2025", H2_FY25],
  ["December 2025", "4,455.00", "2,485.00", [45,74,52], "Jan 8, 2026", "Jan 2, 2026", "Dec 1 – Dec 31, 2025", H2_FY25],
  ["January 2026",  "3,610.00", "1,240.00", [12,48,22], "Feb 8, 2026", "Feb 2, 2026", "Jan 1 – Jan 31, 2026", H1_FY26],
  ["February 2026", "4,206.00", "1,425.00", [16,54,28], "Mar 8, 2026", "Mar 2, 2026", "Feb 1 – Feb 28, 2026", H1_FY26]
].map(pastStatement);

/* Chronological (oldest → newest): June 2025 … May 2026 */
const fullPaymentPeriods = [...olderPaymentPeriods, ...recentPaymentPeriods.slice().reverse()];

/* Goals — one entry per plan element tab (PE1, PE2, PE3, KSO, OTB, NDR) */
const goalTabs = [
  {id:"PE1", name:"Prod+Services",       color:PE_COLOR.PE1, goal:"$109k", attPct:24,   bookingsAmt:"$68k", bookingsPct:63,  revenueAmt:"$26k", revenuePct:24,  backlogAmt:"$42k", backlogPct:39, incentive:"$1,585.54"},
  {id:"PE2", name:"Recurring Software",  color:PE_COLOR.PE2, goal:"$87k",  attPct:71, bookingsAmt:"$90k", bookingsPct:103, revenueAmt:"$62k", revenuePct:71,  backlogAmt:"$28k", backlogPct:32, incentive:"$1,019.25"},
  {id:"PE3", name:"Services",            color:PE_COLOR.PE3, goal:"$90k",  attPct:44,   bookingsAmt:"$85k", bookingsPct:94,  revenueAmt:"$40k", revenuePct:44,  backlogAmt:"$45k", backlogPct:50, incentive:"$980.00"},
  {id:"KSO", name:"Key Sales Objectives",color:PE_COLOR.KSO, goal:"$2.5k", attPct:100,  bookingsAmt:"—",    bookingsPct:100, revenueAmt:"—",    revenuePct:100, backlogAmt:"—",    backlogPct:0,  incentive:"$2,500.00"},
  {id:"OTB", name:"On-Top Bonus",        color:PE_COLOR.OTB, goal:"$5k",   attPct:65,   bookingsAmt:"$3.3k",bookingsPct:65,  revenueAmt:"$2.1k",revenuePct:42,  backlogAmt:"$1.2k",backlogPct:24, incentive:"$100.00"},
  {id:"NDR", name:"Net Dollar Retention",color:PE_COLOR.NDR, goal:"110%",  attPct:88,   bookingsAmt:"104%", bookingsPct:88,  revenueAmt:"102%", revenuePct:82,  backlogAmt:"6%",   backlogPct:12, incentive:"$0.00"}
];

/* Example goal sheet rendered inside the View Goal Sheet popup */
const goalSheetExample = {
  period:"H1 FY26 · Jan 26 – Jul 26, 2026",
  target:"$31,759.05",
  rows:[
    {id:"PE1", name:"CX-SVC RENEW ANN|PRI", label:"Prod+Services",      goal:"$109,000", weight:"50%", att:24,   book:"$68k", rev:"$26k", back:"$42k", color:PE_COLOR.PE1},
    {id:"PE2", name:"RRA-SW WO SEC_ACV|NPR",label:"Recurring Software", goal:"$87,000",  weight:"30%", att:71, book:"$90k", rev:"$62k", back:"$28k", color:PE_COLOR.PE2},
    {id:"PE3", name:"SEC PRD ACV|WM|NPR",   label:"Services",           goal:"$90,000",  weight:"20%", att:44,   book:"$85k", rev:"$40k", back:"$45k", color:PE_COLOR.PE3},
    {id:"KSO", name:"Key Sales Objectives", label:"KSO",                goal:"$2,500",   weight:"—",   att:100,  book:"—",    rev:"—",    back:"—",    color:PE_COLOR.KSO},
    {id:"OTB", name:"On-Top Bonus",         label:"OTB",                goal:"$5,000",   weight:"—",   att:65,   book:"$3.3k",rev:"$2.1k",back:"$1.2k",color:PE_COLOR.OTB},
    {id:"NDR", name:"Net Dollar Retention", label:"NDR",                goal:"110%",     weight:"—",   att:88,   book:"104%", rev:"102%", back:"6%",   color:PE_COLOR.NDR}
  ]
};

/* Order Search — seller's orders (only shown after a search) */
const orders = [
  {id:"SO-105488", status:"Full Revenue", customer:"GlobalNet Inc",      partner:"Direct",           bookings:"$96,000",  backlog:"$0",       revenue:"$96,000"},
  {id:"SO-105310", status:"Full Revenue", customer:"BlueStar Solutions", partner:"Insight Enterpr.", bookings:"$178,000", backlog:"$0",       revenue:"$178,000"},
  {id:"SO-105188", status:"Full Revenue", customer:"Vertex Dynamics",    partner:"SHI Internat.",    bookings:"$145,000", backlog:"$0",       revenue:"$145,000"},
  {id:"SO-105078", status:"Backlog",      customer:"Helix Networks",     partner:"CDW Corp.",        bookings:"$210,000", backlog:"$140,000", revenue:"$70,000"},
  {id:"SO-104821", status:"Full Revenue", customer:"Acme Corp",          partner:"Direct",           bookings:"$125,000", backlog:"$0",       revenue:"$125,000"},
  {id:"SO-104650", status:"Backlog",      customer:"Cortex Financial",   partner:"Direct",           bookings:"$230,000", backlog:"$230,000", revenue:"$0"},
  {id:"SO-104512", status:"Full Revenue", customer:"Summit Digital",     partner:"CDW Corp.",        bookings:"$88,500",  backlog:"$0",       revenue:"$88,500"}
];

/* Order Search — searchable field types (from the desktop reference).
   Demo data only carries SO number / customer / partner, so each type maps
   to its closest field; unmapped types search across all of them. */
const ORDER_SEARCH_TYPES = ["SO Number", "Deal ID", "PO Number", "Subscription Reference ID", "Book Date Range", "End Customer", "Account Name (UCD C4)", "Account ID (UCD C4)"];
const ORDER_TYPE_FIELDS = {"SO Number":["id"], "End Customer":["customer"], "Account Name (UCD C4)":["customer","partner"], "Account ID (UCD C4)":["customer","partner"]};

/* Revenue Transactions — shown by the PDF/breakdown icon on Payments (per plan element) */
const revenueTxns = {
  PE1:{total:"145,500.00", rows:[
    {so:"SO-105201", date:"May 12, 2026", customer:"Meridian Corp",   rev:"$62,000.00"},
    {so:"SO-105189", date:"May 8, 2026",  customer:"Apex Healthcare", rev:"$45,000.00"},
    {so:"SO-104998", date:"Apr 28, 2026", customer:"NovaTech Inc",    rev:"$38,500.00"}
  ]},
  PE2:{total:"317,000.00", rows:[
    {so:"SO-105144", date:"Apr 22, 2026", customer:"ClearPath Systems",  rev:"$88,500.00"},
    {so:"SO-105044", date:"Apr 7, 2026",  customer:"Quantum Analytics",  rev:"$52,000.00"},
    {so:"SO-104512", date:"Mar 8, 2026",  customer:"BlueStar Solutions", rev:"$78,500.00"},
    {so:"SO-104089", date:"Feb 22, 2026", customer:"Vector Systems",     rev:"$98,000.00"}
  ]},
  PE3:{total:"131,500.00", rows:[
    {so:"SO-105112", date:"Apr 15, 2026", customer:"Summit Digital", rev:"$42,000.00"},
    {so:"SO-104876", date:"Mar 20, 2026", customer:"Orion Networks", rev:"$55,500.00"},
    {so:"SO-104650", date:"Mar 1, 2026",  customer:"Phoenix Labs",   rev:"$34,000.00"}
  ]}
};

/* ════════════════════════════════════════════════════════════════
   DERIVATIONS (pure; shared by the mobile + iPad layouts so the two
   presentations never duplicate business logic)
   ════════════════════════════════════════════════════════════════ */
/* Payment Breakdown donut slices — colors match the desktop/web palette:
   indigo goal sheet, gold SPIFF, sky draws, lavender adjustments,
   orange on-top, near-black past goal sheets */
function paymentDonutItems(p) {
  return [
    {label:"Goal Sheet", value:parseFloat(p.goalSheet.total.replace(/,/g,'')), color:"#3f3f9c"},
    {label:"SPIFF & Bonus", value:parseFloat(p.spiff.total.replace(/,/g,'')), color:"#c9a232"},
    {label:"Draws", value:parseFloat(p.draws.total.replace(/,/g,'')), color:"#7ec8f0"},
    {label:"Adjustments", value:parseFloat(p.adj.total.replace(/,/g,'')), color:"#b9aede"},
    {label:"On-Top Bonus", value:parseFloat(p.otb.total.replace(/,/g,'')), color:"#ed7024"},
    /* near-black on the web; lifted in dark mode so the slice stays visible on the dark card */
    {label:"Past Goal Sheets", value:parseFloat(p.past.total.replace(/,/g,'')),
      color:document.documentElement.getAttribute("data-theme")==="dark" ? "#4b5670" : "#1e2430"}
  ].filter(d=>d.value>0);
}

/* Little type chips on accordion detail rows (desktop reference) */
const SECTION_CHIP = {spiff:"SPIFF", otb:"OTB"};
/* sections whose item amounts render in accent blue on the web */
const ACCENT_AMT_SECTIONS = {spiff:true, adj:true, otb:true};

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

function deriveOrders(query, type) {
  const q = query.trim().toLowerCase();
  const fields = ORDER_TYPE_FIELDS[type] || ["id", "customer", "partner"];
  const list = q ? orders.filter(o => fields.some(f => o[f].toLowerCase().includes(q))) : orders;
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
  let offset = 0;
  const segs = items.map(d => {
    const dash = (d.value / total) * circ;
    const seg = {dash, gap: circ - dash, offset, color: d.color};
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

/* Horizontal formula: Weight × Target Incentive × Proration × Payout Rate = Result */
function FormulaStrip({weight, targetIncentive, proration, payoutRate, result, totalEarned, prevPaid}) {
  const factors = [
    {v:weight, l:"Weight"},
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
        <div className="m-formula-factor"><b>{prevPaid}</b><small>Previously Paid</small></div>
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
    {tab==="notifications" && notifications.map((n,i)=><div key={i} className={`m-notif m-notif-${n.type}`}>
      <div className="m-notif-dot"></div>
      <div><b>{n.title}</b><span>{n.desc}</span></div>
    </div>)}
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

/* Universal mobile header — avatar, name/role, bell with unread count.
   Shown on every mobile page so the top of the app reads consistently. */
function MobileHeader({s}) {
  return <>
    <div className="m-header">
      <div className="m-header-left">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" className="m-avatar" alt=""/>
        <div>
          <h1>Alex Johnson</h1>
          <span className="m-role">Enterprise Account Executive</span>
        </div>
      </div>
      <div className="m-header-actions">
        <div className="m-bell" onClick={()=>s.setNotifOpen(!s.notifOpen)}>
          <Bell size={18}/><span className="m-bell-count">{notifications.length}</span>
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
function AtAGlancePage({s}) {
  const hero = monthlyPayCards.find(c=>c.current);
  const context = monthlyPayCards.filter(c=>!c.current);

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
    <div className="m-section-label"><span className="m-section-icon">⁘</span> PLAN ELEMENTS & INCENTIVES</div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>PLAN ELEMENTS</h2><span className="m-badge">H1 2026</span></div>
      <small className="m-pe-sub">All values in USD · Jan 1, 2026 – Jun 30, 2026</small>
      {planElements.map((pe,i)=><div key={i} className="m-pe-card m-pe-flat">
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

    {/* SPIFF & Bonus — vertical list of cards */}
    <div className="m-section">
      <div className="m-section-hdr"><h2>SPIFF & BONUS</h2></div>
      {spiffBonus.map((s,i)=><div key={i} className="m-spiff-card">
        <div className="m-spiff-top">
          <span className="m-spiff-status" style={{color:s.statusColor, borderColor:s.statusColor}}>{s.status}</span>
          <b className="m-spiff-amt" style={{color:s.statusColor}}>{amt(s.amount)}</b>
        </div>
        <b className="m-spiff-name">{s.name}</b>
        <span className="m-spiff-sub">{s.sub}</span>
        {s.pct < 100 && <div className="m-spiff-bar-wrap">
          <div className="m-spiff-bar" style={{width:s.pct+"%", background:s.statusColor}}></div>
          {s.prog && <span className="m-spiff-prog">{s.prog}</span>}
        </div>}
        <small className="m-spiff-date">{s.date}</small>
      </div>)}
    </div>

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
  /* Chronological chips (oldest → newest); last 3 months by default,
     toggle reveals the last 12. Keeps the selected chip in view. */
  const wrapRef = useRef(null);
  const all = fullPaymentPeriods.map((pr,i)=>({pr,i}));
  const visible = s.showAllPeriods ? all : all.slice(-3);
  useEffect(()=>{
    if (!wrapRef.current) return;
    if (s.showAllPeriods) wrapRef.current.querySelector(".m-period-active")?.scrollIntoView({inline:"nearest", block:"nearest"});
    else wrapRef.current.scrollLeft = 0;   // keep the toggle visible at the left edge
  }, [s.showAllPeriods]);
  return <div className="m-period-scroll" ref={wrapRef}>
    <button className="m-period-more" onClick={()=>s.setShowAllPeriods(!s.showAllPeriods)}>
      {s.showAllPeriods ? "Last 3 months" : "Last 12 months"}
      <ChevronRight size={13} className={s.showAllPeriods?"back":""}/>
    </button>
    {visible.map(({pr,i})=><div key={pr.month} className={`m-period-item ${i===s.periodIdx?"m-period-active":""}`} onClick={()=>s.setPeriodIdx(i)}>
      <span className="m-period-month">{pr.month}</span>
      <b className="m-period-amt">{amt("$"+pr.amount)}</b>
      <span className={`m-pay-status m-status-${pr.status.toLowerCase()}`}>{pr.status}</span>
    </div>)}
  </div>;
}

function PaymentBreakdownCard({p, donutSize=180}) {
  const total = parseFloat(p.amount.replace(/,/g,''));
  const donutItems = paymentDonutItems(p);
  return <div className="m-section">
    <div className="m-section-hdr"><h2>Payment Breakdown · {p.month}</h2><span className={`m-pay-status m-status-${p.status.toLowerCase()}`}>{p.status}</span></div>
    <div className="m-donut-hero">
      <SegmentDonut items={donutItems} total={total} size={donutSize} stroke={Math.round(donutSize*0.145)} centerTop={amt(`$${p.amount}`)} centerSub="Total" interactive/>
    </div>
    <div className="m-leg2-list">
      {donutItems.map((d,i)=>{
        const pct = ((d.value/total)*100).toFixed(0);
        return <div key={i} className="m-leg2" style={{borderLeftColor:d.color}}>
          <span className="m-leg2-badge" style={{background:d.color}}>{pct}%</span>
          <span className="m-leg2-label">{d.label}</span>
          <b className="m-leg2-val">{amt("$"+d.value.toLocaleString(undefined,{minimumFractionDigits:2}))}</b>
        </div>;
      })}
    </div>
  </div>;
}

function PaymentScheduleCard({p}) {
  return <div className="m-section">
    <div className="m-section-hdr"><h2>Payment Schedule</h2></div>
    <div className="m-sched-row"><Calendar size={13}/><span>Next Payment</span><b>{p.payDate}</b></div>
    <div className="m-sched-row"><Calendar size={13}/><span>Lock Date</span><b>{p.lockDate}</b></div>
    <div className="m-sched-row"><Calendar size={13}/><span>Revenue Dates</span><b>{p.revDates}</b></div>
  </div>;
}

/* Goal-sheet attainment bar with hover tooltips (desktop-reference style):
   green "Revenue Attainment" above the cursor, blue "Attainment Change"
   below. Follows the pointer, clamped to the bar's width. */
/* Goal-sheet attainment bar. Hover pins a compact tooltip stack to the right
   end of the bar — the emptiest spot — instead of chasing the pointer. */
function PbAttBar({item}) {
  const attW = Math.min(item.pct, 100);
  const [hover, setHover] = useState(false);
  return <div className="m-pb-pe-bar-wrap" onMouseEnter={()=>setHover(true)} onMouseLeave={()=>setHover(false)}>
    <div className="m-pb-pe-bar-track"><div className="m-pb-pe-bar-fill" style={{width:attW+"%", background:item.color}}></div></div>
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
function GoalSheetItemRow({item, onOpenCalc, onOpenPdf}) {
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
        : <span className={`m-pb-pe-payout-link ${item.calc?"":"m-no-link"}`} onClick={()=>item.calc && onOpenCalc(item)}>
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
        {/* green revenue-attainment bar, matching the desktop child rows */}
        <PbAttBar item={{...kid, color:"var(--green)"}}/>
        <div className="m-pb-kid-stats">
          <span className="m-pb-pe-att"><b>{kid.pct}%</b> attainment</span>
          {kid.attChange > 0 && <span className="m-pb-pe-change"><ArrowUp size={10}/> +{kid.attChange}%</span>}
        </div>
      </div>)}
    </div>}
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
      {p.goalSheet.items.map((item,j)=><GoalSheetItemRow key={j} item={item} onOpenCalc={onOpenCalc} onOpenPdf={onOpenPdf}/>)}
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
        : p[sec.key].items.length>0 ? p[sec.key].items.map((item,j)=><div key={j} className="m-pb-detail-row">
            <span className="m-pb-detail-name">
              {SECTION_CHIP[sec.key] && <span className="m-pb-chip">{SECTION_CHIP[sec.key]}</span>}
              {item.name}
            </span>
            <b className={ACCENT_AMT_SECTIONS[sec.key] ? "m-pb-sub-amt" : undefined}>{amt(item.amount)}</b>
          </div>)
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
    <PaymentBreakdownCard p={p}/>
    <PaymentScheduleCard p={p}/>
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

/* PDF / breakdown-icon trigger — Revenue Transactions popup (full-screen) */
function PdfPopup({item, onClose}) {
  const t = revenueTxns[item.pe];
  if (!t) return null;
  return <div className="m-fs">
    <div className="m-fs-hdr m-txn-hdr">
      <div className="m-txn-hdr-top">
        <b className="m-txn-title">{item.pe} - {item.label} - H1 2026 Revenue Transactions</b>
        <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
      </div>
      <div className="m-txn-actions">
        <button className="m-txn-iconbtn" aria-label="Filter"><Filter size={15}/></button>
        <button className="m-txn-iconbtn" aria-label="Refresh"><RefreshCw size={15}/></button>
      </div>
    </div>
    <div className="m-fs-body">
      <div className="m-txn-list">
        <div className="m-txn-list-hdr"><span>SO Number</span><span className="r">Revenue</span></div>
        {t.rows.map((r,i)=><div key={i} className="m-txn-row2">
          <div className="m-txn-line1">
            <span className="m-txn-so">{r.so}</span>
            <span className="m-txn-rev">{r.rev}</span>
          </div>
          <div className="m-txn-line2">{r.date} · {r.customer}</div>
        </div>)}
        <div className="m-txn-total">
          <span>Total</span>
          <b>${t.total}</b>
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
   Statuses and bar tones are hand-matched to the reference. */
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
      {name:"New Conversions", desc:"6 New logo territory for Q3 FY26", bonus:"$2,400.00", weight:"100%", prog:"5 of 5 targets", pct:100, tone:"green"}
    ]},
  {q:"Q4 2026", status:"Upcoming", cap:"125%", bonusLabel:"Bonus Potential", bonus:"$3,000.00", date:"11 Aug 2026", dateLabel:"Review Period Opens",
    rows:[
      {name:"New Conversions", desc:"6 New logo territory for Q4 FY26", bonus:"$1,500.00", weight:"50%", prog:"5 of 10 targets", pct:50, tone:"blue"},
      {name:"Attainment Rate", desc:"Reach 100% target attainment to be included as part of goal sheet", bonus:"$1,500.00", weight:"50%", prog:"0% of 5% attainment", pct:0, tone:"grey"}
    ]}
];

function KsoSection() {
  return <>
    <div className="m-kso-info">
      <div className="m-kso-info-top">
        <h2>Key Sales Objectives (KSOs)</h2>
        <button className="m-kso-tool">View in KSO Tool <ExternalLink size={13}/></button>
      </div>
      <p className="m-kso-info-note">Your plan elements represents 20% of your target Incentive (Compensation for the CS402 FY26 goal sheet)</p>
    </div>
    {ksoQuarters.map(qt=>{
      const sc = KSO_STATUS[qt.status];
      return <div key={qt.q} className="m-kso-card">
        <div className="m-kso-hdr">
          <div className="m-kso-hdr-left">
            <span className="m-kso-q">{qt.q}</span>
            <span className="m-kso-pill" style={{color:sc, borderColor:sc+"66", background:sc+"1a"}}>{qt.status}</span>
            <span className="m-kso-cap">Achievement Cap: <b>{qt.cap}</b></span>
          </div>
          <div className="m-kso-hdr-right">
            <div className="m-kso-bonus-blk"><small>{qt.bonusLabel}</small><b>{amt(qt.bonus)}</b></div>
            <div className="m-kso-date"><b>{qt.date}</b><span>{qt.dateLabel}</span></div>
          </div>
        </div>
        {qt.rows.map((r,i)=>{
          const tone = KSO_TONE[r.tone];
          return <div key={i} className="m-kso-row">
            <div className="m-kso-cell-name"><b>{r.name}</b><span className="m-kso-row-desc">{r.desc}</span></div>
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
const ndrTrend = [["Jan",8.2],["Feb",9.3],["Mar",10.3],["Apr",11.4],["May",12.85]];
const ndrAcv   = [["Jan",58],["Feb",70],["Mar",85],["Apr",97],["May",130]];
const ndrTxns = [
  {cat:"NET DOLLAR RETENTION Plan", atr:"$3,520,090.00", acv:"$452,330.00", kind:"plan"},
  {cat:"View Node Summary", kind:"link"},
  {cat:"View All Transactions", kind:"bold"},
  {cat:"Systematic Transactions", atr:"$3,520,090.00", acv:"$420,330.00", kind:"sub"},
  {cat:"Manual Transactions", acv:"$30,000.00", kind:"sub"}
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

function GoalsPage({s}) {
  const tabIdx = s.goalIdx, setTabIdx = s.setGoalIdx;
  const onOpenGoalSheet = () => s.setShowGoalSheet(true);
  const g = goalTabs[tabIdx];

  return <div className="m-page">
    <MobileHeader s={s}/>
    <div className="m-page-title-row">
      <h1 className="m-page-title">Goals</h1>
      <button className="m-goalsheet-btn" onClick={onOpenGoalSheet}><FileText size={13}/> View Goal Sheet</button>
    </div>

    {/* PE tab row */}
    <div className="m-goaltab-scroll">
      {goalTabs.map((t,i)=><button key={t.id} className={`m-goaltab ${i===tabIdx?"on":""}`} onClick={()=>setTabIdx(i)}
        style={i===tabIdx?{background:t.color, color:"#fff", borderColor:t.color}:{}}>{t.id}</button>)}
    </div>

    {g.id==="KSO" ? <KsoSection/> : g.id==="NDR" ? <NdrSection/> : <>
    {/* Selected goal — big attainment stat + full-width bar (matches At A Glance).
        Section rail, stat, and bar all bind to the active PE color. */}
    <div className="m-section m-pe-flat" style={{borderLeftColor:g.color}}>
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

    {/* Backlog Insights mini-list (compact preview, not the full page) */}
    <div className="m-section">
      <div className="m-section-hdr"><h2>Backlog Insights</h2><span className="m-badge">Preview</span></div>
      {[
        {cust:"Helix Networks", pe:"PE1", amt:"$210K", color:PE_COLOR.PE1},
        {cust:"Cortex Financial", pe:"PE1", amt:"$230K", color:PE_COLOR.PE1},
        {cust:"GlobalNet Inc", pe:"PE3", amt:"$92K", color:PE_COLOR.PE3}
      ].map((b,i)=><div key={i} className="m-backlog-mini">
        <span className="m-pe-badge" style={{background:b.color}}>{b.pe}</span>
        <span className="m-backlog-cust">{b.cust}</span>
        <b className="m-backlog-amt">{b.amt}</b>
      </div>)}
    </div>
    </>}
  </div>;
}

/* View Goal Sheet popup — full-screen, read-only example goal sheet */
function GoalSheetPopup({onClose}) {
  return <FullScreenPopup title="Goal Sheet" onClose={onClose}>
    <div className="m-gs-meta">
      <div><small>Goaling Period</small><b>{goalSheetExample.period}</b></div>
      <div><small>Target Incentive</small><b>{amt(goalSheetExample.target)}</b></div>
    </div>
    {goalSheetExample.rows.map((r,i)=><div key={i} className="m-gs-row">
      <div className="m-gs-row-top">
        <AttainDonut pct={r.att} color={r.color} size={64} stroke={9} sub=""/>
        <div className="m-gs-row-info">
          <div className="m-gs-row-hdr"><span className="m-pe-badge" style={{background:r.color}}>{r.id}</span><b>{r.label}</b><span className="m-gs-weight">{r.weight}</span></div>
          <span className="m-gs-name">{r.name}</span>
          <span className="m-gs-goal">Goal {r.goal}</span>
        </div>
      </div>
      <div className="m-gs-splits">
        <div><small>Bookings</small><b>{r.book}</b></div>
        <div><small>Revenue</small><b>{r.rev}</b></div>
        <div><small>Backlog</small><b>{r.back}</b></div>
      </div>
    </div>)}
    <p className="m-gs-note">Read-only reference · figures reflect the current selling period.</p>
  </FullScreenPopup>;
}

/* ════════════════════════════════════════════════════════════════
   ORDER SEARCH
   ════════════════════════════════════════════════════════════════ */
/* Single order result card (shared by search results + recent-order list) */
function OrderCard({o}) {
  return <div className="m-order-card">
    <div className="m-order-top">
      <span className="m-order-id">{o.id}</span>
      <span className={`m-pay-status ${o.status==="Backlog"?"m-status-upcoming":"m-status-paid"}`}>{o.status}</span>
    </div>
    <div className="m-order-mid"><b>{o.customer}</b><span>{o.partner}</span></div>
    <div className="m-order-figs">
      <div><small>Bookings</small><b>{o.bookings}</b></div>
      <div><small>Backlog</small><b>{o.backlog}</b></div>
      <div><small>Revenue</small><b>{o.revenue}</b></div>
    </div>
  </div>;
}

function OrderSearchPage({s}) {
  const {q, list} = deriveOrders(s.orderQuery, s.orderType);
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title">Order Search</h1>

    {/* Search-by-field bar (desktop reference): [type ▾] [query] [go] */}
    <div className="m-os-bar">
      <select className="m-os-type" value={s.orderType} onChange={e=>s.setOrderType(e.target.value)} aria-label="Search by">
        {ORDER_SEARCH_TYPES.map(t=><option key={t}>{t}</option>)}
      </select>
      <input className="m-os-input" placeholder={`Enter ${s.orderType}...`} value={s.orderQuery} onChange={e=>s.setOrderQuery(e.target.value)}/>
      <button className="m-os-go" aria-label="Search"><Search size={15}/></button>
    </div>

    {q ? <>
      <div className="m-os-results-hdr">
        <p className="m-search-count">{list.length} order{list.length===1?"":"s"} found</p>
        <button className="m-os-clear" onClick={()=>s.setOrderQuery("")}>Clear</button>
      </div>
      {list.map(o=><OrderCard key={o.id} o={o}/>)}
      {list.length===0 && <div className="m-search-empty"><Search size={30}/><b>No orders found</b><span>Try a different {s.orderType} or search type.</span></div>}
    </> : <div className="m-search-empty">
      <Search size={30}/>
      <b>Search a seller's orders</b>
      <span>Pick a field and enter a value above to look up orders.</span>
    </div>}
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   TEAM VIEW  (manager's roll-up — mobile translation of Team Dashboard)
   Performance tiers keep their semantic colors (green/blue/amber/red);
   structure/brand stays on the purple-blue accent system.
   ════════════════════════════════════════════════════════════════ */
const TEAM_AS_OF = "All data as of Jul 2, 2026, 10:24 AM";

const STATUS_COLOR = {
  "Exceeding":"#10b981", "On Track":"#3b82f6", "Watch":"#f59e0b", "At Risk":"#ef4444"
};

const teamSummary = {avgAtt:"88.2%", aboveGoal:4, onTrack:2, below75:4, size:10};

/* earned = Earned vs Target Incentive %, bookings = Bookings Attainment %,
   revAtt = card revenue attainment, figures in $ */
const teamSellers = [
  {name:"Sarah Chen",   initials:"SC", status:"Exceeding", earned:107.1, bookings:115.6, revAtt:107, quota:"$1.6M", bookingsAmt:"$1.85M", payout:"$48.2K"},
  {name:"Lisa Kumar",   initials:"LK", status:"Exceeding", earned:106.3, bookings:112.0, revAtt:106, quota:"$1.5M", bookingsAmt:"$1.68M", payout:"$42.5K"},
  {name:"Mike Torres",  initials:"MT", status:"Exceeding", earned:97.3,  bookings:107.5, revAtt:97,  quota:"$1.6M", bookingsAmt:"$1.72M", payout:"$43.8K"},
  {name:"Emily Davis",  initials:"ED", status:"Exceeding", earned:97.3,  bookings:101.3, revAtt:101, quota:"$1.8M", bookingsAmt:"$1.82M", payout:"$51.0K"},
  {name:"Alex Johnson", initials:"AJ", status:"On Track",  earned:91.6,  bookings:92.5,  revAtt:92,  quota:"$2.1M", bookingsAmt:"$1.94M", payout:"$58.0K"},
  {name:"David Park",   initials:"DP", status:"On Track",  earned:89.0,  bookings:90.0,  revAtt:90,  quota:"$1.7M", bookingsAmt:"$1.53M", payout:"$34.0K"},
  {name:"John Smith",   initials:"JS", status:"Watch",     earned:69.3,  bookings:71.3,  revAtt:71,  quota:"$1.6M", bookingsAmt:"$1.14M", payout:"$31.2K"},
  {name:"Bob Wilson",   initials:"BW", status:"Watch",     earned:71.3,  bookings:70.0,  revAtt:70,  quota:"$1.5M", bookingsAmt:"$1.05M", payout:"$28.5K"},
  {name:"Rachel Lee",   initials:"RL", status:"Watch",     earned:67.0,  bookings:65.3,  revAtt:65,  quota:"$1.5M", bookingsAmt:"$980K",  payout:"$26.8K"},
  {name:"Marcus Green", initials:"MG", status:"At Risk",   earned:49.1,  bookings:54.4,  revAtt:54,  quota:"$1.6M", bookingsAmt:"$870K",  payout:"$22.1K"}
];

/* Seller performance cards — Top 5 shown first, expandable to all 10.
   Each member carries per-PE attainment for the three chip tiles. */
const GS_PERIOD = "GS: 25-Jan-2026 – 25-Jul-2026";
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
  {name:"Bob Wilson",    initials:"BW", status:"At Risk",   att:71,  pe:[64,76,77],    tones:["r","a","b"]},
  {name:"John Smith",    initials:"JS", status:"At Risk",   att:69,  pe:[65,76,80],    tones:["r","a","b"]},
  {name:"Daniel Kim",    initials:"DK", status:"Watch",     att:67,  pe:[63,74,69],    tones:["a","a","a"]},
  {name:"Rachel Lee",    initials:"RL", status:"At Risk",   att:65,  pe:[61,69,70],    tones:["r","a","a"]},
  {name:"Marcus Green",  initials:"MG", status:"At Risk",   att:54,  pe:[50,56,63],    tones:["r","r","r"]}
];

/* Team Insights — Canvas cards (supportive coaching tone; dismissible) */
const teamInsights = [
  {title:"3 Sellers Need Coaching", tag:"Coaching", metric:"3 need support", color:"#f59e0b",
    desc:"Three sellers are currently below the expected attainment pace (below 65%). Early coaching can improve attainment and increase payout opportunities before period end.",
    action:"Recommended focus: John Smith, Bob Wilson, Rachel Lee — Review pipeline, backlog, and upcoming opportunities with these sellers.",
    names:"John Smith, Bob Wilson, Rachel Lee"},
  {title:"Goal Coverage Health", tag:"Coverage", metric:"74%", color:"#3b82f6",
    desc:"Your team has achieved $14.6M in bookings toward a $15.5M combined goal. You're building strong momentum — only $0.9M remains to reach full goal coverage.",
    action:"Keep the momentum going! Focus on advancing high-probability opportunities and converting qualified pipeline to close the remaining gap before period end."},
  {title:"Performance Spread — Opportunity to Level Up", tag:"Performance", metric:"Level up", color:"#f59e0b",
    desc:"Your team is making solid progress. Top performers are leading the way at 118%, while emerging sellers at 54% have strong opportunities to increase attainment with focused coaching and collaboration.",
    action:"Encourage peer mentoring, pipeline reviews, and deal strategy sessions to help more sellers achieve their goals this period. Pair top performers with emerging sellers: connect Sarah Chen with John Smith, Lisa Kumar with Bob Wilson.",
    names:"John Smith, Bob Wilson, Rachel Lee +1 more"},
  {title:"Team Attainment Distribution", tag:"Attainment", metric:"89.6%", color:"#10b981",
    desc:"Team of 10 averaging 89.6% attainment. Distribution: 4 exceeding goal, 2 on track (80–100%), 4 building momentum.",
    action:"4 sellers building momentum — review deal strategy to accelerate this period."},
  {title:"Top Performers — Celebrate & Scale", tag:"Recognition", metric:"4 exceeding goal", color:"#10b981",
    desc:"4 team members exceeding goal at 109.8% average attainment. Great opportunity to share winning strategies across the team.",
    action:"Recognize excellence: Sarah Chen, Mike Torres, Lisa Kumar, Emily Davis. Consider peer-led knowledge sharing.",
    names:"Sarah Chen, Mike Torres, Lisa Kumar +1 more"},
  {title:"Forecasted End-of-Period Attainment", tag:"Forecast", metric:"96.2%", color:"#3b82f6",
    desc:"Based on current pace (76% of period elapsed), team is projected to finish at 96.2% — close to full goal.",
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

/* Horizontal attainment bars, one per seller, colored by that chart's value */
function AttainmentChart({title, subtitle, rows, control}) {
  const SCALE = 120;                       // bar axis maxes at 120%
  const markerPos = (100/SCALE)*100;
  return <div className="m-section">
    <div className="m-section-hdr"><h2>{title}</h2>{control}</div>
    <small className="m-team-chart-sub">{subtitle}</small>
    <div className="m-abars">
      {rows.map(r=>{
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

function TeamMembersSection({s, gridClass=""}) {
  /* Default surfaces the two sellers who most need coaching (lowest overall
     attainment); the sort control flips to top performers first. */
  const sorted = [...teamMembers].sort((a,b)=> s.teamSort==="best" ? b.att-a.att : a.att-b.att);
  const list = s.teamExpanded ? sorted : sorted.slice(0,2);
  return <>
    <div className="m-section-label"><span className="m-section-icon">⁘</span> SELLER PERFORMANCE
      <span className="m-label-right">{list.length} of {teamMembers.length}</span>
      <select className="m-seller-sort" value={s.teamSort} onChange={e=>s.setTeamSort(e.target.value)} aria-label="Sort sellers">
        <option value="need">Most coaching needed</option>
        <option value="best">Top performers first</option>
      </select></div>
    <div className={gridClass}>
      {list.map(m=><MemberCard key={m.name} m={m} onOpen={()=>s.setSellerItem(m)}/>)}
    </div>
    <button className="m-showall" onClick={()=>s.setTeamExpanded(!s.teamExpanded)}>
      {s.teamExpanded ? "Show Fewer" : `Show All ${teamMembers.length} Sellers`}
      <ChevronDown size={14} className={s.teamExpanded?"up":""}/>
    </button>
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
  const onOpenSeller = s.setSellerItem;
  const earnedRows = teamEarnedRows();
  const bookingRows = teamBookingRows(pe);

  if (s.histView) return <div className="m-page"><HistPage s={s}/></div>;

  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Team Dashboard</h1>
    <p className="m-team-sub">Overview of your team's performance for H1 2026</p>
    <div className="m-asof-banner"><Calendar size={13}/><div className="m-asof-text"><span>{TEAM_AS_OF}</span><small>{REFRESH_NOTE}</small></div></div>

    {/* Period / trend / export controls */}
    <TeamControls s={s}/>

    {/* Earned vs Target Incentive */}
    <AttainmentChart title="Earned vs Target Incentive" subtitle="Current period · highest to lowest earned" rows={earnedRows}/>

    {/* Bookings Attainment (per plan element) */}
    <AttainmentChart title="Bookings Attainment" subtitle="Sorted by bookings · bar shows progress toward goal" rows={bookingRows}
      control={<div className="m-pe-select">{["PE1","PE2","PE3"].map(p=><button key={p} className={p===pe?"on":""} onClick={()=>setPe(p)}>{p}</button>)}</div>}/>

    <TeamMembersSection s={s}/>
    <TeamInsightsSection s={s}/>
  </div>;
}

/* ════════════════════════════════════════════════════════════════
   HISTORICAL PERFORMANCE TREND (Team View → Historical Trend)
   Single-member table + trend bars, or all-member comparison.
   Base data is PE1 (from the desktop reference); PE2/PE3 derive
   deterministically via weight/attainment factors.
   ════════════════════════════════════════════════════════════════ */
const HIST_PERIODS = ["H1 2025","H2 2025","H1 2026","H2 2026"];
const HIST_SHADE = {"H1 2025":"#8ecdf7","H2 2025":"#4aabf2","H1 2026":"#1e88e5","H2 2026":"#1565c0"};
/* per member: [earned, target, bookings, goal, att%] per period */
const histData = {
  "Sarah Chen":   {trend:8.5, p:[[36800,38000,1320000,1400000,94.3],[40970,40500,1480000,1440000,102.8],[48200,45000,1850000,1600000,115.6],[24500,45000,980000,1600000,61.3]]},
  "Mike Torres":  {trend:5.6, p:[[33100,38000,1260000,1400000,90],[37230,40500,1376000,1440000,95.6],[43800,45000,1720000,1600000,107.5],[22800,45000,890000,1600000,55.6]]},
  "Lisa Kumar":   {trend:8.8, p:[[31400,34000,1180000,1300000,90.8],[36125,36000,1344000,1350000,99.6],[42500,40000,1680000,1500000,112],[22400,40000,840000,1500000,56]]},
  "Emily Davis":  {trend:7,   p:[[28200,34000,1080000,1300000,83.1],[33065,36000,1216000,1350000,90.1],[38900,40000,1520000,1500000,101.3],[19800,40000,760000,1500000,50.7]]},
  "Alex Johnson": {trend:7.2, p:[[30500,38000,1050000,1400000,75],[35020,40500,1184000,1440000,82.2],[41200,45000,1480000,1600000,92.5],[20100,45000,720000,1600000,45]]},
  "David Park":   {trend:6.2, p:[[26800,34000,960000,1300000,73.8],[30260,36000,1080000,1350000,80],[35600,40000,1350000,1500000,90],[17900,40000,680000,1500000,45.3]]},
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
    <span className="i-sb-time">9:41 AM · Tue Jul 2</span>
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
  const [showGoalSheet, setShowGoalSheet] = useState(false);
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
  const [teamPe, setTeamPe] = useState("PE1");
  const [teamExpanded, setTeamExpanded] = useState(false);          // first 2 ↔ all members
  const [teamSort, setTeamSort] = useState("need");                 // "need" = most coaching first | "best"
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

  return {
    tab, setTab, viewMode, setViewMode, theme, toggleTheme,
    calcItem, setCalcItem, pdfItem, setPdfItem, showGoalSheet, setShowGoalSheet,
    sellerItem, setSellerItem, showAskIQ, setShowAskIQ, notifOpen, setNotifOpen, reminders, setReminders,
    periodIdx, setPeriodIdx, openPayPeriod, showAllPeriods, setShowAllPeriods, expanded, setExpanded, goalIdx, setGoalIdx,
    orderQuery, setOrderQuery, orderType, setOrderType,
    teamPe, setTeamPe, teamExpanded, setTeamExpanded, teamSort, setTeamSort, dismissedInsights, setDismissedInsights,
    upliftOpen, setUpliftOpen,
    histView, setHistView, histMode, setHistMode, histMember, setHistMember,
    histCmpMember, setHistCmpMember, histPeriods, setHistPeriods, histPe, setHistPe,
    sideCollapsed, setSideCollapsed, hideAmts, setHideAmts,
    insightCanvasOpen, setInsightCanvasOpen, pinnedInsights, setPinnedInsights,
    showRecovBal, setShowRecovBal,
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
  return <>
    {s.calcItem && shell(<CompCalcPopup item={s.calcItem} month={s.currentMonth} onClose={()=>s.setCalcItem(null)}/>, ()=>s.setCalcItem(null))}
    {s.pdfItem && shell(<PdfPopup item={s.pdfItem} onClose={()=>s.setPdfItem(null)}/>, ()=>s.setPdfItem(null))}
    {s.showGoalSheet && shell(<GoalSheetPopup onClose={()=>s.setShowGoalSheet(false)}/>, ()=>s.setShowGoalSheet(false))}
    {s.sellerItem && shell(<SellerBreakdownPopup s={s.sellerItem} onClose={()=>s.setSellerItem(null)}/>, ()=>s.setSellerItem(null))}
    {s.showAskIQ && shell(<AskIQPopup onClose={()=>s.setShowAskIQ(false)}/>, ()=>s.setShowAskIQ(false), "i-modal-lg")}
    {s.insightCanvasOpen && shell(<InsightCanvasPopup s={s} onClose={()=>s.setInsightCanvasOpen(false)}/>, ()=>s.setInsightCanvasOpen(false), "i-modal-xl")}
    {s.showRecovBal && shell(<RecovBalancePopup onClose={()=>s.setShowRecovBal(false)}/>, ()=>s.setShowRecovBal(false))}
  </>;
}

const NAV_TABS = [
  {id:"glance", label:"At A Glance", Icon:Home},
  {id:"payments", label:"Payments", Icon:DollarSign},
  {id:"goals", label:"Goals", Icon:Target},
  {id:"orders", label:"Order Search", Icon:Search}
];

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

        <div className="m-viewbar">
          <CiscoLogo className="m-cisco"/>
          {/* Me/Team toggle lives on At A Glance only (team view keeps it so you can switch back) */}
          {(s.tab==="glance" || s.viewMode==="team")
            ? <div className="m-viewtoggle">
                <button className={s.viewMode==="me"?"on":""} onClick={()=>s.setViewMode("me")}><User size={14}/> My Compensation</button>
                <button className={s.viewMode==="team"?"on":""} onClick={()=>s.setViewMode("team")}><Users size={14}/> Team View</button>
              </div>
            : <div className="m-viewbar-spacer"/>}
          <button className="m-askiq-open" onClick={()=>s.setShowAskIQ(true)} aria-label="Ask StratComp IQ"><Sparkles size={16}/></button>
          <button className="m-theme-toggle" onClick={s.toggleTheme} aria-label={s.theme==="dark"?"Switch to light mode":"Switch to dark mode"}>
            {s.theme==="dark" ? <Sun size={17}/> : <Moon size={17}/>}
          </button>
        </div>

        <div className="m-content" onScroll={onScroll}>
          {s.viewMode==="team"
            ? <TeamPage s={s}/>
            : <>
                {s.tab==="glance"   && <AtAGlancePage s={s}/>}
                {s.tab==="payments" && <PaymentsPage s={s}/>}
                {s.tab==="goals"    && <GoalsPage s={s}/>}
                {s.tab==="orders"   && <OrderSearchPage s={s}/>}
              </>}
        </div>

        {s.viewMode==="me" && <nav className="m-tabbar">
          {NAV_TABS.map(t=><button key={t.id} className={`m-tab ${s.tab===t.id?"m-tab-on":""}`} onClick={()=>s.setTab(t.id)}>
            <t.Icon size={18}/><span>{t.label}</span>
          </button>)}
        </nav>}

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
      <button className="i-iconbtn" onClick={()=>s.setNotifOpen(!s.notifOpen)} aria-label="Notifications"><Bell size={19}/><span className="m-bell-count">{notifications.length}</span></button>
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
    <div className="m-section-label"><span className="m-section-icon">⁘</span> PLAN ELEMENTS & INCENTIVES</div>
    <div className="i-grid-3">
      {planElements.map((pe,i)=><div key={i} className="m-pe-card i-pe-card m-pe-flat">
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
      <div className="m-section">
        <div className="m-section-hdr"><h2>SPIFF & BONUS</h2></div>
        {spiffBonus.map((sp,i)=><div key={i} className="m-spiff-card">
          <div className="m-spiff-top"><span className="m-spiff-status" style={{color:sp.statusColor, borderColor:sp.statusColor}}>{sp.status}</span><b className="m-spiff-amt" style={{color:sp.statusColor}}>{amt(sp.amount)}</b></div>
          <b className="m-spiff-name">{sp.name}</b><span className="m-spiff-sub">{sp.sub}</span>
          {sp.pct<100 && <div className="m-spiff-bar-wrap"><div className="m-spiff-bar" style={{width:sp.pct+"%", background:sp.statusColor}}></div>{sp.prog && <span className="m-spiff-prog">{sp.prog}</span>}</div>}
          <small className="m-spiff-date">{sp.date}</small>
        </div>)}
      </div>
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
        <PaymentBreakdownCard p={p} donutSize={188}/>
        <PaymentScheduleCard p={p}/>
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
    <IPadHeader title="Goals" sub="Plan-element attainment · H1 2026" s={s}
      right={<button className="m-goalsheet-btn" onClick={()=>s.setShowGoalSheet(true)}><FileText size={14}/> View Goal Sheet</button>}/>
    <div className="i-goaltab-row">
      {goalTabs.map((t,i)=><button key={t.id} className={`m-goaltab ${i===s.goalIdx?"on":""}`} onClick={()=>s.setGoalIdx(i)}
        style={i===s.goalIdx?{background:t.color, color:"#fff", borderColor:t.color}:{}}>{t.id}</button>)}
    </div>
    {g.id==="KSO" ? <KsoSection/> : g.id==="NDR" ? <NdrSection/> : <div className="i-split">
      <div className="i-col-a">
        <div className="m-section m-pe-flat" style={{borderLeftColor:g.color}}>
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
        <div className="m-section m-pe-flat">
          <div className="m-section-hdr"><h2>Bookings vs Revenue</h2></div>
          <BookingsBar pe={g}/>
          {g.id==="PE1" && <CompUpliftSection s={s}/>}
        </div>
        <div className="m-section">
          <div className="m-section-hdr"><h2>Backlog Insights</h2><span className="m-badge">Preview</span></div>
          {[{cust:"Helix Networks",pe:"PE1",amt:"$210K",color:PE_COLOR.PE1},{cust:"Cortex Financial",pe:"PE1",amt:"$230K",color:PE_COLOR.PE1},{cust:"GlobalNet Inc",pe:"PE3",amt:"$92K",color:PE_COLOR.PE3}].map((b,i)=><div key={i} className="m-backlog-mini">
            <span className="m-pe-badge" style={{background:b.color}}>{b.pe}</span><span className="m-backlog-cust">{b.cust}</span><b className="m-backlog-amt">{b.amt}</b>
          </div>)}
        </div>
      </div>
    </div>}
  </div>;
}

function IPadOrders({s}) {
  const {q, list} = deriveOrders(s.orderQuery, s.orderType);
  return <div className="i-page">
    <IPadHeader title="Order Search" sub="Look up a seller's orders" s={s}/>
    <div className="m-os-bar i-os-bar">
      <select className="m-os-type" value={s.orderType} onChange={e=>s.setOrderType(e.target.value)} aria-label="Search by">
        {ORDER_SEARCH_TYPES.map(t=><option key={t}>{t}</option>)}
      </select>
      <input className="m-os-input" placeholder={`Enter ${s.orderType}...`} value={s.orderQuery} onChange={e=>s.setOrderQuery(e.target.value)}/>
      <button className="m-os-go" aria-label="Search"><Search size={16}/></button>
    </div>
    {q ? <>
      <div className="m-os-results-hdr">
        <p className="m-search-count">{list.length} order{list.length===1?"":"s"} found</p>
        <button className="m-os-clear" onClick={()=>s.setOrderQuery("")}>Clear</button>
      </div>
      {list.length>0 ? <div className="i-grid-3">{list.map(o=><OrderCard key={o.id} o={o}/>)}</div>
        : <div className="m-search-empty"><Search size={30}/><b>No orders found</b><span>Try a different {s.orderType} or search type.</span></div>}
    </> : <div className="m-search-empty">
      <Search size={30}/>
      <b>Search a seller's orders</b>
      <span>Pick a field and enter a value above to look up orders.</span>
    </div>}
  </div>;
}

function IPadTeam({s}) {
  const earnedRows = teamEarnedRows();
  const bookingRows = teamBookingRows(s.teamPe);
  if (s.histView) return <div className="i-page"><HistPage s={s}/></div>;
  return <div className="i-page">
    <IPadHeader title="Team Dashboard" sub={`${TEAM_AS_OF} · ${REFRESH_NOTE}`} s={s}/>
    <TeamControls s={s}/>
    <div className="i-split">
      <AttainmentChart title="Earned vs Target Incentive" subtitle="Current period · highest to lowest earned" rows={earnedRows}/>
      <AttainmentChart title="Bookings Attainment" subtitle="Sorted by bookings · progress toward goal" rows={bookingRows}
        control={<div className="m-pe-select">{["PE1","PE2","PE3"].map(pp=><button key={pp} className={pp===s.teamPe?"on":""} onClick={()=>s.setTeamPe(pp)}>{pp}</button>)}</div>}/>
    </div>
    <TeamMembersSection s={s} gridClass="i-grid-3"/>
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
            <div className="i-brand-txt"><b>CompX</b><small>Compensation IQ</small></div>
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
