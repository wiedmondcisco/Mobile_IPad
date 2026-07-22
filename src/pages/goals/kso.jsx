import { useState } from "react";
import { ChevronDown, ExternalLink, Target, X } from "lucide-react";
import { KSO_CALC } from "../../data/plans.js";
import { PE_COLOR } from "../../lib/brand.js";
import { amt, cvt, fmtAmt } from "../../lib/core.js";
import { FullScreenPopup, PePill } from "../../shared/primitives.jsx";

export const KSO_RANGES = ["Past 6 Months","Past Year","All Time"];

export function KsoCalcPopup({month, onClose, onKsoTool}) {
  const [tab, setTab] = useState("Calculation");
  const [range, setRange] = useState(KSO_RANGES[0]);
  const lim = range==="Past 6 Months" ? 6 : range==="Past Year" ? 12 : Infinity;
  const rows = KSO_CALC.history.filter(r=>r.mb<=lim);
  const total = rows.reduce((a,r)=>a+r.amount,0);
  return <FullScreenPopup title={tab==="Calculation" ? "KSO Calculation" : "Payment History"}
    subtitle={tab==="Calculation" ? `Key Sales Objectives for ${month}` : "Key Sales Objectives"}
    tabs={["Calculation","Payment History","View in KSO Tool"]} activeTab={tab}
    onTab={setTab} onClose={onClose}>
    {tab==="Calculation" && <>
      <div className="m-calc-badge-row"><PePill pe="KSO" label="Key Sales Objectives" color={PE_COLOR.KSO}/></div>
      <p className="m-calc-summary">Your KSO payment for {month}.</p>
      <div className="m-formula">
        <div className="m-formula-factor"><b>{amt(KSO_CALC.earned)}</b><small>Total Earned</small></div>
        <span className="m-formula-op">−</span>
        <div className="m-formula-factor m-formula-dim"><b>{amt(KSO_CALC.prevPaid)}</b><small>Previously Paid</small></div>
        <span className="m-formula-op m-formula-eq">=</span>
        <div className="m-formula-chip"><b>{amt("$"+KSO_CALC.result)}</b><small>Monthly Payment</small></div>
      </div>
      <div className="m-kso-note"><b>Note:</b> KSO payments are not subject to proration or payout rate multipliers. This is a fixed bonus for meeting all qualifying objectives during the measurement period.</div>
    </>}
    {tab==="Payment History" && <>
      <div className="m-ph-ranges">
        {KSO_RANGES.map(r=><button key={r} className={r===range?"on":""} onClick={()=>setRange(r)}>{r}</button>)}
      </div>
      <div className="m-ph-table">
        <div className="m-ph-tr m-ph-th"><span>Pay Date ?</span><span>Details</span><span className="m-ph-amt">Amount</span><span>Status</span></div>
        {rows.map((r,i)=><div key={i} className="m-ph-tr">
          <span className="m-ph-date">{r.date}</span>
          <span className="m-ph-details">{r.details}</span>
          <span className="m-ph-amt">{amt(fmtAmt(r.amount))}</span>
          <span className="m-pay-status m-status-paid">Paid</span>
        </div>)}
        <div className="m-ph-total"><span>Total</span><b>{amt(fmtAmt(total))}</b></div>
      </div>
    </>}
    {tab==="View in KSO Tool" && <div className="m-kso-tool-pane">
      <ExternalLink size={40}/>
      <p>You will be redirected to the KSO Management Tool to view detailed objectives, milestones, and approvals.</p>
      <button className="m-kso-tool-btn" onClick={onKsoTool}>Open KSO Tool <ExternalLink size={15}/></button>
    </div>}
  </FullScreenPopup>;
}

/* Payment History — SPIFF / draw / adjustment blue-amount trigger.
   Two desktop-reference styles: SPIFF items use underline tabs with the
   three past ranges; draws/adjustments use range pills including Current
   Month, which switches to the Bonus Details card (the desktop's wide
   table, stacked for mobile). */

export const KSO_OBJ_DESC = {
  "FY26 Generate [X] PERCENTAGE % Conversion Rate":
    "FY26 Generate [X] PERCENTAGE % Conversion of demand waterfall and/or sales process stage. Details around demand waterfall and/or sales process stage and PERCENTAGE % target to be provided by manager.",
  "FY26 Progress [X] NUMBER of sales initiatives to completion":
    "FY26 Progress [X] NUMBER of sales initiatives or campaigns to drive pipeline growth in assigned territory.",
  "FY26 Achieve [X] PERCENTAGE % conversion rate":
    "FY26 Achieve [X] PERCENTAGE % conversion rate from qualified opportunities to closed-won deals."
};

export const ksoQuarters = [
  {q:"Q1 2026", cap:"125%", bonus:"$2,500.00",
    rows:[
      {name:"FY26 Generate [X] PERCENTAGE % Conversion Rate", weight:"50%", bonus:"$1,000.00", target:"13", result:"14", ach:107},
      {name:"FY26 Progress [X] NUMBER of sales initiatives to completion", weight:"10%", bonus:"$500.00", target:"20%", result:"10%", ach:50},
      {name:"FY26 Achieve [X] PERCENTAGE % conversion rate", weight:"40%", bonus:"$1,000.00", target:"13%", result:"10%", ach:77}
    ],
    calc:{ach:"89.3%", inst:"( 50% * 107% ) + ( 10% * 50% ) + ( 40% * 77% )", total:"$2,500.00"}},
  {q:"Q2 2026", cap:"125%", bonus:"$4,100.00",
    rows:[
      {name:"FY26 Generate [X] NUMBER of new logo acquisitions", weight:"60%", bonus:"$2,500.00", target:"5", result:"5", ach:100,
        desc:"FY26 Generate [X] NUMBER of new logo acquisitions in assigned territory for Q2."},
      {name:"FY26 Achieve [X] PERCENTAGE % conversion rate", weight:"40%", bonus:"$1,600.00", target:"5%", result:"5%", ach:100,
        desc:"FY26 Achieve [X] PERCENTAGE % conversion rate from qualified pipeline to closed-won."}
    ],
    calc:{ach:"100%", inst:"( 60% * 100% ) + ( 40% * 100% )", total:"$4,100.00"}},
  {q:"Q3 2026", cap:"125%", bonus:"$4,900.00",
    rows:[
      {name:"FY26 Achieve [X] PERCENTAGE % conversion rate", weight:"25%", bonus:"$1,250.00", target:"5%", result:"5%", ach:100,
        desc:"FY26 Achieve [X] PERCENTAGE % conversion rate from demand waterfall stages to revenue."},
      {name:"FY26 Reach [X] PERCENTAGE % target attainment", weight:"25%", bonus:"$1,250.00", target:"25%", result:"0%", ach:0,
        desc:"FY26 Reach [X] PERCENTAGE % target attainment to be included as part of goal sheet measurement."},
      {name:"FY26 Progress [X] NUMBER of sales initiatives to completion", weight:"100%", bonus:"$2,400.00", target:"5", result:"5", ach:100,
        desc:"FY26 Progress [X] NUMBER of sales initiatives driving pipeline and territory coverage."}
    ],
    calc:{ach:"125%", inst:"( 25% * 100% ) + ( 25% * 0% ) + ( 100% * 100% )", total:"$4,900.00"}},
  {q:"Q4 2026", cap:"125%", bonus:"-",
    rows:[
      {name:"FY26 Generate [X] NUMBER of new logo territories", weight:"50%", bonus:"-", target:"10", result:"-", ach:null,
        desc:"FY26 Generate [X] NUMBER of new logo territory acquisitions for Q4 FY26 period."},
      {name:"FY26 Reach [X] PERCENTAGE % target attainment", weight:"50%", bonus:"-", target:"5%", result:"-", ach:null,
        desc:"FY26 Reach [X] PERCENTAGE % target attainment to qualify for accelerator multiplier."}
    ]}
];

/* "View Calculation" expander — desktop reference: the computed weighted
   achievement with its per-quarter arithmetic, the generic formula row,
   and the bonus total with the overachievement-cap fine print. */

export function KsoViewCalc({c, objCount}) {
  const [open, setOpen] = useState(false);
  const formula = Array.from({length:objCount}, (_,i)=>`(Obj ${i+1} Weight x Obj ${i+1} Achievement)`).join(" + ");
  return <div className="m-kso-vc">
    <button className="m-kso-viewcalc" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>
      View Calculation <ChevronDown size={12} className={`m-insight-chev ${open?"open":""}`}/>
    </button>
    {open && <div className="m-kso-calc">
      <small className="m-kso-calc-title">Calculation</small>
      <div className="m-kso-calc-row"><b className="m-kso-calc-ach">{c.ach}</b><span className="m-kso-calc-inst">{c.inst}</span></div>
      <div className="m-kso-calc-row">
        <span className="m-kso-calc-lbl">KSO Weighted Achievement<i className="m-kso-formula-chip">Formula</i></span>
        <span className="m-kso-calc-inst">{formula}</span>
      </div>
      <div className="m-kso-calc-row">
        <b className="m-kso-calc-total">Bonus Total : {amt(c.total)}</b>
        <span className="m-kso-calc-note">*Overachievement for payment of any single objective is capped at 100%, 125% or 200% in accordance with the policy of the associated Comp Plan</span>
      </div>
    </div>}
  </div>;
}

export function KsoSection() {
  /* Quarter accordions (reference-style expand arrows) — the current
     quarter's detail matters most, so only one opens at a time. The fine
     print is hidden by default; one "More info" toggle at the top reveals
     every objective's description at once. */
  const [openQ, setOpenQ] = useState(-1);   // all quarters start collapsed
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
      {showInfo && <p className="m-kso-info-note">KSOs represent 20% of your target incentive on the 2026 CS532 goal sheet. Each quarter lists its objectives with weight, bonus earned, target, result, and achievement — expand a quarter to see the detail, and use More info to read the full objective descriptions.</p>}
    </div>
    {ksoQuarters.map((qt,qi)=>{
      const open = qi===openQ;
      return <div key={qt.q} className={`m-kso-card ${open?"m-kso-open":""}`}>
        <div className="m-kso-hdr" role="button" tabIndex={0} aria-expanded={open}
          onClick={()=>setOpenQ(open ? -1 : qi)}
          onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpenQ(open ? -1 : qi); } }}>
          <div className="m-kso-hdr-left">
            <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
            <span className="m-kso-q">{qt.q}</span>
            <span className="m-kso-cap">Cap: <b>{qt.cap}</b></span>
          </div>
          <div className="m-kso-hdr-right">
            <div className="m-kso-bonus-blk"><small>Bonus Earned</small><b>{amt(qt.bonus)}</b></div>
          </div>
        </div>
        {open && <>
          {qt.rows.map((r,i)=>{
            const desc = r.desc || KSO_OBJ_DESC[r.name];
            return <div key={i} className="m-kso-row">
            <div className="m-kso-cell-name" title={desc}>
              <b>{r.name}</b>
              {showInfo && desc && <span className="m-kso-row-desc">{desc}</span>}
            </div>
            <div className="m-kso-figs">
              <div className="m-kso-fig"><small>KSO Weight</small><b>{r.weight}</b></div>
              <div className="m-kso-fig"><small>Bonus Earned</small><b>{amt(r.bonus)}</b></div>
              <div className="m-kso-fig"><small>Target</small><b>{cvt(r.target)}</b></div>
              <div className="m-kso-fig"><small>Result</small><b>{cvt(r.result)}</b></div>
              <div className="m-kso-fig"><small>Achievement %</small>
                <span className={`m-kso-ach ${r.ach==null ? "" : r.ach>=100 ? "good" : r.ach===0 ? "bad" : ""}`}>{r.ach==null ? "-" : r.ach+"%"}</span>
              </div>
            </div>
          </div>;})}
          {qt.calc && <KsoViewCalc c={qt.calc} objCount={qt.rows.length}/>}
        </>}
      </div>;
    })}
  </>;
}
