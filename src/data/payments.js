import { planElements } from "./plans.js";
import { DONUT_DARK, DONUT_LIGHT, PE_COLOR } from "../lib/brand.js";
import { fmtAmt } from "../lib/core.js";

export const monthlyPayCards = [
  {month:"APR 2026", period:"April 2026", status:"Paid", amount:"8,688.08", change:"▲ 40.4%", payDate:"Paid May 2, 2026"},
  {month:"MAY 2026", period:"May 2026", status:"Open", current:true, amount:"8,434.23", change:"▼ 2.9%", payDate:"Pay: Jun 2, 2026"},
  {month:"JUN 2026", period:"June 2026", status:"Upcoming", amount:"4,825.50", lock:"Jun 28, 2026", payDate:"Pay: Jul 2, 2026"}   // projected estimate — clicks into the upcoming statement (lock/pay schedule)
];

/* Payments — periods with full breakdown + per-PE calculation data */
export const recentPaymentPeriods = [
  {month:"May 2026", amount:"8,434.23", status:"Open", payDate:"Jun 2, 2026", lockDate:"May 28, 2026", revDates:"May 1 – May 18, 2026",
    goalSheet:{period:"Jan 26, 2026 - Jul 26, 2026", total:"5,885.73", items:[
      {pe:"PE1", name:"CX-SVC RENEW ANN|PRI", label:"Prod+Services", weight:"50%", pct:24, attChange:4, payout:"1,386.18", color:PE_COLOR.PE1,
        calc:{incrementalAtt:"4%", totalAtt:"24%", weight:"50%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"4.2%", result:"1,386.18", rateName:"CS402",
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
            /* Desktop reference: 60% × 75,500 × 100% × 13.0% = 5,889.00 − 4,530.00 = 1,359.00.
               Multiplier builds from the rate table: 20% prior × 0.50% = 10.0%, +4% incr × 0.75% = 3.0%. */
            calc:{incrementalAtt:"4%", totalAtt:"24%", weight:"60%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"13.0%", totalEarned:"5,889.00", prevPaid:"4,530.00", result:"1,359.00", rateName:"CS402", totalLabel:"Total Payout Rate Multiplier",
              rateIncremental:[
                {range:"0 – 20%", peRate:"0.50%", prior:"20%", incr:"-", mult:"10.0%"},
                {range:"20 – 75%", peRate:"0.75%", prior:"-", incr:"4%", mult:"3.0%", active:true},
                {range:"75 – 100%", peRate:"1.10%", prior:"-", incr:"-", mult:"-"}
              ]}},
          {pe:"CU", label:"Security Comp Uplift", color:"#3e7bd6", pct:4, attChange:1, payout:"12.08", txnKey:"CUSEC",
            /* Desktop reference: 2% × 75,500 × 100% × 2.3% = 34.73 − 22.65 = 12.08.
               Multiplier: 3% prior × 0.50% = 1.5%, +1% incr × 0.75% = 0.8%. */
            calc:{incrementalAtt:"1%", totalAtt:"4%", weight:"2%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"2.3%", totalEarned:"34.73", prevPaid:"22.65", result:"12.08", rateName:"CS402", totalLabel:"Total Payout Rate Multiplier",
              rateIncremental:[
                {range:"0 – 3%", peRate:"0.50%", prior:"3%", incr:"-", mult:"1.5%"},
                {range:"3 – 75%", peRate:"0.75%", prior:"-", incr:"1%", mult:"0.8%", active:true},
                {range:"75 – 100%", peRate:"1.10%", prior:"-", incr:"-", mult:"-"}
              ]}},
          {pe:"CU", label:"Collab Comp Uplift", color:"#3e7bd6", pct:4, attChange:1, payout:"12.08", txnKey:"CUCOLLAB",
            /* Desktop reference: same shape as Security Comp Uplift — 2% × 75,500 × 100% × 2.3% = 34.73 − 22.65 = 12.08 */
            calc:{incrementalAtt:"1%", totalAtt:"4%", weight:"2%", targetIncentive:"75,500.00", proration:"100%", payoutRate:"2.3%", totalEarned:"34.73", prevPaid:"22.65", result:"12.08", rateName:"CS402", totalLabel:"Total Payout Rate Multiplier",
              rateIncremental:[
                {range:"0 – 3%", peRate:"0.50%", prior:"3%", incr:"-", mult:"1.5%"},
                {range:"3 – 75%", peRate:"0.75%", prior:"-", incr:"1%", mult:"0.8%", active:true},
                {range:"75 – 100%", peRate:"1.10%", prior:"-", incr:"-", mult:"-"}
              ]}},
          {pe:"MY", label:"Services MY", color:"#0077c2", pct:5, attChange:1, payout:"3.02",
            /* Desktop reference: 1% × 75,500 × 50% × 2.8% = 10.57 − 7.55 = 3.02.
               Multiplier: 4% prior × 0.50% = 2.0%, +1% incr × 0.75% = 0.8%. */
            calc:{incrementalAtt:"1%", totalAtt:"5%", weight:"1%", targetIncentive:"75,500.00", proration:"50%", payoutRate:"2.8%", totalEarned:"10.57", prevPaid:"7.55", result:"3.02", rateName:"CS402", totalLabel:"Total Payout Rate Multiplier",
              rateIncremental:[
                {range:"0 – 4%", peRate:"0.50%", prior:"4%", incr:"-", mult:"2.0%"},
                {range:"4 – 75%", peRate:"0.75%", prior:"-", incr:"1%", mult:"0.8%", active:true},
                {range:"75 – 100%", peRate:"1.10%", prior:"-", incr:"-", mult:"-"}
              ]}}
        ]},
      {pe:"PE2", name:"RRA-SW WO SEC_ACV|AG|WM|NPR", label:"Recurring Software", weight:"30%", pct:71, attChange:6, payout:"1,019.47", color:PE_COLOR.PE2,
        /* Desktop reference: non-primary PE. 30% × 31,759.05 × 100% × 10.70% = 1,019.47.
           Multiplier depends on NPR attainment AND the primary PE's attainment (24% < 100% → standard rates);
           active rows 7.50% + 3.20% = 10.70%. Total-attainment view: 50% + 21% rev att = 71%. */
        calc:{incrementalAtt:"6%", totalAtt:"71%", weight:"30%", targetIncentive:"31,759.05", proration:"100%", payoutRate:"10.70%", result:"1,019.47", rateName:"CS402", shortName:"PE2",
          nonPrimary:{primaryName:"CX-SVC RENEW ANN|PRI", primaryAtt:"24%", note:"Primary PE < 100% — Standard Rates"},
          rateNP:[
            {npr:"0 – 50 %", pri:"0 – 100 %", peRate:".15%", prior:"65%", incr:"6%", mult:"7.50%", active:true},
            {npr:"0 – 50 %", pri:"100+ %", peRate:".15%", prior:"-", incr:"-", mult:"-"},
            {npr:"50 – 75 %", pri:"0 – 100 %", peRate:".15%", prior:"-", incr:"6%", mult:"3.20%", active:true},
            {npr:"50 – 75 %", pri:"100+ %", peRate:".25%", prior:"-", incr:"-", mult:"-"},
            {npr:"75 – 100 %", pri:"0 – 100 %", peRate:".20%", prior:"-", incr:"-", mult:"-"},
            {npr:"75 – 100 %", pri:"100+ %", peRate:".30%", prior:"-", incr:"-", mult:"-"},
            {npr:"100 – 130 %", pri:"0 – 100 %", peRate:".20%", prior:"-", incr:"-", mult:"-"},
            {npr:"100 – 130 %", pri:"100+ %", peRate:".40%", prior:"-", incr:"-", mult:"-"},
            {npr:"130 – 200 %", pri:"0 – 100 %", peRate:".20%", prior:"-", incr:"-", mult:"-"},
            {npr:"130 – 200 %", pri:"100+ %", peRate:".30%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".15%", rev:"50%", mult:"7.50%", active:true},
            {range:"50 – 75 %", peRate:".15%", rev:"21%", mult:"3.20%", active:true},
            {range:"75 – 100 %", peRate:".20%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:".30%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:".25%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:".15%", rev:"-", mult:"-"}]}},
      {pe:"PE3", name:"SEC PRD ACV|WM|NPR", label:"Services", weight:"20%", pct:44, attChange:5, payout:"980.08", color:PE_COLOR.PE3,
        /* Desktop reference: 20% × 31,759.05 × 100% × 15.43% = 980.08. Total view: 44% rev att → 15.43%. */
        calc:{incrementalAtt:"5%", totalAtt:"44%", weight:"20%", targetIncentive:"31,759.05", proration:"100%", payoutRate:"15.43%", result:"980.08", rateName:"CS402", shortName:"PE3", moreRows:true,
          rateIncremental:[
            {range:"0 – 50 %", peRate:".35%", prior:"39%", incr:"5%", mult:"15.43%", active:true},
            {range:"50 – 75 %", peRate:".50%", prior:"-", incr:"-", mult:"-"},
            {range:"75 – 100 %", peRate:".65%", prior:"-", incr:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"1.00%", prior:"-", incr:"-", mult:"-"},
            {range:"130 – 200 %", peRate:".75%", prior:"-", incr:"-", mult:"-"},
            {range:"200+ %", peRate:".50%", prior:"-", incr:"-", mult:"-"}],
          rateTotal:[
            {range:"0 – 50 %", peRate:".35%", rev:"44%", mult:"15.43%", active:true},
            {range:"50 – 75 %", peRate:".50%", rev:"-", mult:"-"},
            {range:"75 – 100 %", peRate:".65%", rev:"-", mult:"-"},
            {range:"100 – 130 %", peRate:"1.00%", rev:"-", mult:"-"},
            {range:"130 – 200 %", peRate:".75%", rev:"-", mult:"-"},
            {range:"200+ %", peRate:".50%", rev:"-", mult:"-"}]}},
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
  {month:"April 2026", amount:"8,688.08", status:"Paid", payDate:"May 2, 2026", lockDate:"Apr 28, 2026", revDates:"Apr 1 – Apr 30, 2026",
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
      note:"Reconciled from previous goal sheet. Not a negative payment",
      items:[
        {pe:"PE1", label:"Prod+Services", paidNote:"Previously Paid", paid:"$650.00", amount:"$-650.00", children:[
          {pe:"PE1", label:"Prod+Services", paidNote:"Previously Paid", paid:"$500.00", amount:"$-500.00"},
          {pe:"CU", label:"Security Comp Uplift", color:"#3e7bd6", paidNote:"Previously Paid", paid:"$50.00", amount:"$-50.00"},
          {pe:"CU", label:"Collab Comp Uplift", color:"#3e7bd6", paidNote:"Previously Paid", paid:"$50.00", amount:"$-50.00"},
          {pe:"MY", label:"Services MY", color:"#0077c2", paidNote:"Previously Paid", paid:"$50.00", amount:"$-50.00"}
        ]},
        {pe:"PE2", label:"Recurring Software", paidNote:"Previously Paid", paid:"$100.00", amount:"$-100.00"},
        {pe:"PE3", label:"Services", paidNote:"Previously Paid", paid:"$100.00", amount:"$-100.00"}
      ]},
    spiff:{total:"2,125.00", items:[{name:"Q2 Cloud Migration SPIFF", amount:"$1,250.00"},{name:"Partner Acceleration Q2", amount:"$875.00"}]},
    draws:{total:"50.00", items:[{chip:"MIPS", name:"Monthly Incentive Payment", amount:"$35.00"},{chip:"Draw", name:"Recoverable Draw", amount:"$15.00"}]},
    adj:{total:"50.00", items:[{name:"ICC True-up Adjustment", amount:"$50.00"}]},
    /* Desktop reference: April OTB pays 1,658.08 (10% × 31,178.57 × 100% × 53.18%),
       with a replaced-goal-sheet reconciliation line (not a negative payment) */
    otb:{total:"1,658.08", items:[
      {name:"PIOT PRODUCT RR|PL", amount:"$1,658.08", pct:53.18, attChange:53.18,
        calc:{tiRate:"10%", targetIncentive:"31,178.57", proration:"100%", payoutRate:"53.18%", result:"1,658.08", incrementalAtt:"53.18%", rateName:"CS402",
          rows:[
            {range:"0 – 125 %", peRate:"1%", prior:"-", incr:"53.18%", mult:"53.18%", active:true},
            {range:"125+ %", peRate:"0%", prior:"-", incr:"-", mult:"-"}
          ]}}],
      replaced:{period:"Jan 26, 2026 - Jul 26, 2026", note:"Reconciled from previous goal sheet. Not a negative payment",
        items:[{name:"PIOT PRODUCT RR|PL", amount:"$-50.00"}]}},
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

export function pastStatement([month, gsTotal, spiffTotal, pcts, payDate, lockDate, revDates, gsPeriod]) {
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

export const H2_FY25 = "Jul 25, 2025 - Jan 25, 2026", H1_FY26 = "Jan 26, 2026 - Jul 26, 2026";

export const olderPaymentPeriods = [
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

/* Upcoming statement — no revenue captured yet, but the schedule (lock /
   pay / revenue dates) is already known, so the seller can click in and
   see when the June statement starts moving. */

export const upcomingPaymentPeriod = {
  month:"June 2026", amount:"4,825.50", status:"Upcoming",
  payDate:"Jul 2, 2026", lockDate:"Jun 28, 2026", revDates:"Jun 1 – Jun 18, 2026",
  goalSheet:{period:H1_FY26, total:"0.00", items:[]},
  spiff:{total:"0.00", items:[]}, draws:{total:"0.00", items:[]},
  adj:{total:"0.00", items:[]}, otb:{total:"0.00", items:[]},
  past:{total:"0.00", groups:[]}
};

/* Chronological (oldest → newest): June 2025 … May 2026, then upcoming June */
export const fullPaymentPeriods = [...olderPaymentPeriods, ...recentPaymentPeriods.slice().reverse(), upcomingPaymentPeriod];

/* Goals — one entry per plan element tab (PE1, PE2, PE3, KSO, OTB, NDR) */
/* blColor = the lighter backlog segment tint, matching planElements so the
   revenue/backlog distinction reads the same on Goals as on At A Glance */

export function paymentDonutItems(p, dark) {
  const pal = dark ? DONUT_DARK : DONUT_LIGHT;
  /* A replaced goal sheet reconciles pay already issued on the old sheet, so
     it appears as a signed DEDUCTION slice; the current sheet then shows its
     gross payout, keeping the signed sum equal to the net payment. */
  const ded = p.replaced ? Math.abs(parseFloat(p.replaced.total.replace(/[^0-9.-]/g,''))) : 0;
  const items = [
    {label:"Goal Sheet", value:parseFloat(p.goalSheet.total.replace(/,/g,'')) + ded, color:pal[0]},
    {label:"SPIFF & Bonus", value:parseFloat(p.spiff.total.replace(/,/g,'')), color:pal[1]},
    {label:"Draws", value:parseFloat(p.draws.total.replace(/,/g,'')), color:pal[2]},
    {label:"Adjustments", value:parseFloat(p.adj.total.replace(/,/g,'')), color:pal[3]},
    {label:"On-Top Bonus", value:parseFloat(p.otb.total.replace(/,/g,'')), color:pal[4]},
    {label:"Past Goal Sheets", value:parseFloat(p.past.total.replace(/,/g,'')), color:pal[5]}
  ].filter(d=>d.value>0);
  if (ded > 0) items.splice(1, 0, {label:"Replaced Goal Sheet", value:-ded, deduction:true, color:dark ? "#F0564D" : "#E3241B"});
  return items;
}

/* Little type chips on accordion detail rows (desktop reference) */
export const SECTION_CHIP = {spiff:"SPIFF", otb:"OTB"};

/* sections whose item amounts render in accent blue on the web */
/* Sections whose item amounts render in accent blue; draws stay plain (desktop). */
export const ACCENT_AMT_SECTIONS = {spiff:true, adj:true, otb:true};

/* ── Payment History popups (per line item, keyed by item name) ──
   Blue amounts in the payment dropdowns open these. `mb` = calendar
   months back from the demo today (May 26, 2026): Past 6 Months = mb≤5,
   Past Year = mb≤12. Totals stay consistent with the statement data
   (e.g. ICC adjustments were $50 in every prior statement; the plan
   advance nets to the $35 MIPS line after its full reversal pair). */

export const PAYMENT_HISTORY = {
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

export const OTB_CALC = {
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

export function paymentSections(p) {
  return [
    {key:"goalSheet", label:"Current Goal Sheet", amount:"$"+p.goalSheet.total, period:p.goalSheet.period},
    {key:"spiff", label:"SPIFF & Bonus", amount:"$"+p.spiff.total},
    {key:"draws", label:"Draws & Guarantees", amount:"$"+p.draws.total},
    {key:"adj", label:"Payment Adjustments", amount:"$"+p.adj.total},
    {key:"otb", label:"On-Top Bonuses", amount:"$"+p.otb.total},
    {key:"past", label:"Past Goal Sheets", amount:"$"+p.past.total}
  ];
}

export const PAYCAL_MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

export const PAYCAL_SHORT = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

export function paycalInfo(y, m) {
  const p = fullPaymentPeriods.find(pp => pp.month === `${PAYCAL_MONTHS[m]} ${y}`);
  const nums = str => (str.match(/\d+/g) || []).map(Number);
  const rev = p ? nums(p.revDates) : null;               // [startDay, endDay, ...]
  const daysIn = new Date(y, m+1, 0).getDate();
  return {
    revStart: rev ? rev[0] : 1,
    revEnd: rev ? rev[1] : Math.min(18, daysIn),
    refresh: 26,
    lock: p ? nums(p.lockDate)[0] : 28,
    stmt: Math.min(30, daysIn),
    pay: p ? nums(p.payDate)[0] : 2,
    sheet: m===0 ? `H2 ${y-1}` : m<=6 ? `H1 ${y}` : `H2 ${y}`
  };
}

export const TI_CALC = {
  annualBase:"148,208.92", varPct:"30%", interval:"H2",
  semiBase:"74,104.46", ote:"105,863.51", ti:"31,759.05",
  days:"182 / 182"
};
