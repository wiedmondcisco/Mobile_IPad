import { orders } from "./orders.js";
import { PE_COLOR } from "../lib/brand.js";

export const insightCards = [
  {peBadge:"Prod+Services", peColor:PE_COLOR.PE1, tag:"$18K ★", tagColor:"#e3241b", title:"High Value Booking", desc:"Stargate AI ($18K) is your largest eligible booking this period. Top backlog: Cortex Financial ($23K), Helix Networks ($14K). Clearing both pushes PE1 past the 50% threshold."},
  {peBadge:"Services", peColor:PE_COLOR.PE3, tag:"$38K ★", tagColor:"#e3241b", title:"Services Backlog Opportunity", desc:"Services sits at 44% attainment — $5K from the 50% tier. GlobalNet Inc ($38K backlog, PE3) clearing alone would lift you past the 75% tier."},
  {peBadge:"CA Review", peColor:"#6b7280", tag:"✓ Clear ★", tagColor:"#74bf4b", title:"Comp Assurance", desc:"No CA review triggered this period. Your May payment of $8,434 is 92% below the $100K threshold."}
];

/* ── Insight Canvas catalog (from the desktop reference) ──
   Sellers pin up to MAX_PINS insights for their At A Glance feed;
   with no pins, the AI-selected `insightCards` above are shown. */

export const MAX_PINS = 6;

export const INSIGHT_CATS = [
  {name:"Fast Start", color:"#fbab2c", fast:true, items:[
    {id:"what-selling", title:"What Am I Selling?", live:true, tags:["Seller"], cta:"View Plan", ctaTab:"goals", desc:"Review your active plan elements and quota targets for the current goal sheet period."},
    {id:"who-selling-to", title:"Who Am I Selling To?", live:true, tags:["Seller"], cta:"View Territory", ctaTab:"orders", desc:"Explore your territory accounts, named customers, and top opportunities for this period."},
    {id:"how-make-money", title:"How Do I Make Money?", live:true, tags:["Seller"], cta:"View Incentives", ctaTab:"payments", desc:"Understand your compensation structure, active SPIFs, and fastest paths to higher payout tiers."}]},
  {name:"Attainment & Tiers", color:"#0077c2", items:[
    {id:"gap-next-tier", title:"Gap to Next Tier", live:true, tags:["Seller"], desc:"The % and $ needed to reach your next payout tier based on current revenue attainment."},
    {id:"strongest-pe", title:"Strongest Plan Element", live:true, tags:["Seller"], desc:"Your top-performing plan element by attainment percentage this period."},
    {id:"tier-milestone", title:"Tier Milestone", live:true, tags:["Seller"], desc:"You just crossed into a new attainment tier — your payout rate has increased accordingly."},
    {id:"weakest-pe", title:"Weakest Plan Element", tags:["Seller"], desc:"The plan element most at risk of missing target — focus here to maximize payout."},
    {id:"excellence-points", title:"Excellence Point Proximity", tags:["Seller"], desc:"How close you are to earning Excellence Points and what actions can accelerate them."},
    {id:"proration-impact", title:"Proration Impact", tags:["Seller","Ops"], desc:"How mid-period plan changes or territory adjustments have affected your prorated quota."}]},
  {name:"Payments & Payout", color:"#0051af", items:[
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
  {name:"Manager & Team", color:"#3e7bd6", items:[
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
  {name:"Self-Service", color:"#00bceb", items:[
    {id:"self-validation", title:"Self-Service Validation", tags:["Seller"], desc:"Verify your own attainment calculations and flag discrepancies before the lock date."},
    {id:"fix-verification", title:"Fix Verification", tags:["Seller","Ops"], desc:"Confirm that a previously reported data fix has been applied correctly to your comp record."},
    {id:"predictive-attainment", title:"Predictive Attainment", tags:["Seller","Manager"], desc:"ML-based projection of your period-end attainment given current pace, pipeline, and seasonality."}]}
];

export const INSIGHT_INDEX = INSIGHT_CATS.flatMap(c=>c.items.map(it=>({...it, cat:c.name, catColor:c.color})));

export const notifications = [
  {type:"amber", title:"Goal Sheet acceptance due", desc:"Please review and accept your H2 FY26 Goal Sheet by Jun 15, 2026.", action:"Accept Goal Sheet", nav:"goals"},
  {type:"green", title:"Q2 Bonus Eligible", desc:"You are on track to earn a quarterly bonus.", action:"View Details", nav:"spiff"},
  {type:"blue", title:"New Compensation Plan Released", desc:"H2 FY26 Compensation Plan is now available.", action:"View Plan", nav:"goals"}
];

/* My Reminders (second tab of the bell dropdown) — user-managed notes */
export const REMINDERS_SEED = [
  {id:1, text:"Follow up on PE2 deal with BlueStar Solutions", date:"2026-06-10", done:false},
  {id:2, text:"Review H2 goal sheet before acceptance window closes", date:"2026-06-15", done:false}
];

export const fmtRemDate = iso => iso
  ? new Date(iso+"T12:00:00").toLocaleDateString("en-US", {month:"short", day:"numeric", year:"numeric"})
  : "No date";
