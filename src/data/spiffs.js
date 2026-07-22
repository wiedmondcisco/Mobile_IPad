export const spiffBonus = [
  {status:"Active", statusColor:"#0077c2", name:"Q2 Cloud Migration SPIFF", sub:"Cloud deals ≥ $15K TCV", amount:"$5,000", date:"Apr 1 – Jun 30, 2026", pct:25},
  {status:"Active", statusColor:"#0077c2", name:"Partner Acceleration Q2", sub:"Partner-sourced bookings", amount:"$3,500", date:"Apr 1 – Jun 30, 2026", pct:25},
  {status:"Achieved", statusColor:"#74bf4b", name:"FY25 H2 Attainment Milestone", sub:"Bonus earned", amount:"$7,560", date:"Paid Apr 16, 2026", pct:100}
];

/* ── SPIFF & Bonus page — every strategic incentive program (desktop reference).
   Projected = open programs (Active + Eligible): 5,000+12,000+3,500+4,200 = 24,700.
   Paid YTD = FY25 H2 milestone 7,560 + Splunk 8,330 + Q2 progress paid 2,125 = 18,015. ── */

export const SPIFF_TYPE_COLOR = {SPIFF:"#0051af", Accelerator:"#e3241b", Bonus:"#b08a1d", Uplift:"#3e7bd6"};

export const SPIFF_STATUS_COLOR = {Active:"#74bf4b", Eligible:"#0077c2", Completed:"#16a34a", Expired:"#6b7280"};

export const spiffPrograms = [
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

export const SPIFF_PERIODS  = ["All", "Q2 2026", "H1 2026", "FY25 H2", "Q4 FY24"];

export const SPIFF_STATUSES = ["All", "Active", "Eligible", "Completed", "Expired"];

export const SPIFF_TYPES    = ["All Types", "SPIFF", "Accelerator", "Bonus", "Uplift"];

export const SPIFF_PROJECTED = "$24,700", SPIFF_PAID_YTD = "$18,015";

export function filterSpiffs(f) {
  return spiffPrograms.filter(p =>
    (f.period==="All" || p.period===f.period) &&
    (f.status==="All" || p.status===f.status) &&
    (f.type==="All Types" || p.type===f.type));
}
