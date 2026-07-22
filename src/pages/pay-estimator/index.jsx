import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { PE_COLOR } from "../../lib/brand.js";
import { ACTIVE_CUR, amt, cvt, maskText } from "../../lib/core.js";
import { MobileHeader } from "../../shared/chrome.jsx";
import { Expandable } from "../../shared/primitives.jsx";

export const EST_BRACKETS = [
  {from:0,   to:50,       rate:0.75},
  {from:50,  to:75,       rate:1.5},
  {from:75,  to:100,      rate:1},
  {from:100, to:120,      rate:5.25},
  {from:120, to:200,      rate:2.5},
  {from:200, to:Infinity, rate:1.5}
];

export const estPlans = [
  {pe:"PE1", name:"Prod+Services",      color:PE_COLOR.PE1, goal:109000, revenue:26000, ti:37750},
  {pe:"PE2", name:"Recurring Software", color:PE_COLOR.PE2, goal:87000,  revenue:62000, ti:22650},
  {pe:"PE3", name:"Services",           color:PE_COLOR.PE3, goal:90000,  revenue:40000, ti:15100}
];

/* Cumulative payout (% of TI share) at a given attainment % */
export const estPayoutPct = att => EST_BRACKETS.reduce((sum,b)=> sum + Math.max(0, Math.min(att,b.to)-b.from)*b.rate, 0);

export const estEarned = (p, addRev=0) => estPayoutPct((p.revenue+addRev)/p.goal*100)/100 * p.ti;

export const estUsd = n => "$" + Math.round(n).toLocaleString("en-US");

export const fmtGoalK = n => "$" + Math.round(n/1000) + "k";

/* Payout curve — 5%-step bars to 150%; current attainment in the PE color,
   the modeled additional attainment in amber, the rest unattained */

export function EstChart({p, addRev}) {
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

export function EstRateTable({p, addRev}) {
  const [open, setOpen] = useState(false);
  const att = (p.revenue+addRev)/p.goal*100;
  return <div className="m-est-rt">
    <button className="m-est-rt-btn" onClick={()=>setOpen(o=>!o)} aria-expanded={open}>
      {open?"Hide Rate Table":"Show Rate Table"} <ChevronDown size={12} className={`m-insight-chev ${open?"open":""}`}/>
    </button>
    {open && <div className="m-est-table">
      <div className="m-est-tr m-est-th"><span>% of Annual Quota</span><span>Multiplier per 1%</span><span>Attainment Breakdown ({att.toFixed(2)}%)</span><span>Calculated Value</span></div>
      {EST_BRACKETS.map((b,i)=>{
        const seg = Math.max(0, Math.min(att,b.to)-b.from);
        const active = att>b.from && att<=b.to;
        return <div key={i} className={`m-est-tr ${active ? "on":""}`}>
          <span><span className="m-est-range">{b.to===Infinity ? `${b.from} - ${b.from}+ %` : `${b.from} - ${b.to} %`}</span></span>
          <span className="m-est-mult">{String(b.rate).replace(/^0\./,".")}%</span>
          <span>{seg>0 ? (Number.isInteger(seg) ? seg : +seg.toFixed(5)) : ""}</span>
          <span>{seg>0 ? (seg*b.rate).toFixed(2) : ""}</span>
        </div>;
      })}
    </div>}
  </div>;
}

/* The estimator for the selected PE: stats, additional-attainment input +
   slider, computed additional earnings, payout curve, rate table */

export function EstimatorCard({s}) {
  const p = estPlans[s.estPe];
  const addRev = s.estAdd[p.pe] || 0;
  const attBase = p.revenue/p.goal*100;
  const base = estEarned(p);
  const extra = estEarned(p, addRev) - base;
  const max = Math.round(p.goal*1.5 - p.revenue);
  const setAdd = v => s.setEstAdd(prev=>({...prev, [p.pe]: Math.max(0, Math.min(max, v))}));
  /* % mode edits the same additional revenue, expressed in attainment points */
  const pct = s.estMode === "pct";
  const R = ACTIVE_CUR.rate;
  const maxPct = Math.max(1, Math.round(150 - attBase));
  const addPct = Math.round(addRev / p.goal * 100);
  const setAddPct = v => setAdd(Math.round(Math.max(0, Math.min(maxPct, v)) / 100 * p.goal));
  return <div className="m-section m-est-card" style={{borderLeftColor:p.color}}>
    <div className="m-section-hdr">
      <div className="m-pe-left"><span className="m-pe-badge" style={{background:p.color}}>{p.pe}</span><b>{p.name}</b></div>
      <span className="m-pe-goal">{cvt(fmtGoalK(p.goal))} Goal</span>
    </div>
    <div className="m-goal-stats m-est-stats">
      <div><small>Revenue</small><span>{amt(fmtGoalK(p.revenue))}</span></div>
      <div><small>Est. Incentive (H1)</small><span className="m-goal-earn">{amt(estUsd(base))}</span></div>
    </div>
    <div className="m-est-inputs">
      <label className="m-est-input"><small>Additional Attainment</small>
        {pct
          ? <div className="m-est-field"><span>%</span>
              <input type="number" inputMode="numeric" min="0" max={maxPct} step="1" value={addPct||""} placeholder="0"
                onChange={e=>setAddPct(Number(e.target.value)||0)}/>
            </div>
          : <div className="m-est-field"><span>{ACTIVE_CUR.sym}</span>
              <input type="number" inputMode="numeric" min="0" max={Math.round(max*R)} step={Math.round(1000*R)} value={addRev ? Math.round(addRev*R) : ""} placeholder="0"
                onChange={e=>setAdd(Math.round((Number(e.target.value)||0)/R))}/>
            </div>}
      </label>
      <div className="m-est-input"><small>Additional Earnings</small>
        <b className="m-est-extra">{maskText(`+${estUsd(extra)}`)}</b>
      </div>
    </div>
    {pct
      ? <>
          <input type="range" className="m-est-slider" min="0" max={maxPct} step="1" value={addPct}
            onChange={e=>setAddPct(Number(e.target.value))} aria-label="Additional attainment %"/>
          <div className="m-est-slider-lbls"><span>0%</span><b>{addPct>0 ? `+${addPct}%` : ""}</b><span>{maxPct}%</span></div>
        </>
      : <>
          <input type="range" className="m-est-slider" min="0" max={Math.round(max*R)} step={Math.round(1000*R)} value={Math.round(addRev*R)}
            onChange={e=>setAdd(Math.round(Number(e.target.value)/R))} aria-label="Additional attainment"/>
          <div className="m-est-slider-lbls"><span>{ACTIVE_CUR.sym}0</span><b>{addRev>0 ? cvt(`+${fmtGoalK(addRev)}`) : ""}</b><span>{cvt(fmtGoalK(max))}</span></div>
        </>}
    <EstChart p={p} addRev={addRev}/>
    <EstRateTable p={p} addRev={addRev}/>
  </div>;
}

/* Page-level $ / % toggle — switches the estimator's additional-attainment
   input between dollars and attainment percentage (desktop reference pill) */

export function EstModeToggle({s}) {
  return <div className="m-est-mode" role="group" aria-label="Estimator input mode">
    <button className={s.estMode==="usd" ? "on" : ""} onClick={()=>s.setEstMode("usd")} aria-pressed={s.estMode==="usd"}>$</button>
    <button className={s.estMode==="pct" ? "on" : ""} onClick={()=>s.setEstMode("pct")} aria-pressed={s.estMode==="pct"}>%</button>
  </div>;
}

/* Estimated Earnings across all PEs — base + modeled additional per row */
export function EstSummary({s}) {
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

export function PayEstimatorPage({s}) {
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Pay Estimator</h1>
    <p className="m-team-sub">Use this estimator to estimate your potential incentive compensation. This is not a commitment of the compensation you will receive.</p>
    <div className="m-est-toprow">
      <div className="m-goaltab-scroll">
        {estPlans.map((p,i)=><button key={p.pe} className={`m-goaltab ${i===s.estPe?"on":""}`} onClick={()=>s.setEstPe(i)}
          style={i===s.estPe?{background:p.color, color:"#fff", borderColor:p.color}:{}}>{p.pe}</button>)}
      </div>
      <EstModeToggle s={s}/>
    </div>
    <EstimatorCard s={s}/>
    <EstSummary s={s}/>
  </div>;
}

export function IPadEstimator({s}) {
  return <div className="i-page">
    <IPadHeader title="Pay Estimator" sub="Use this estimator to estimate your potential incentive compensation. This is not a commitment of the compensation you will receive." s={s}/>
    <div className="i-goaltab-row">
      {estPlans.map((p,i)=><button key={p.pe} className={`m-goaltab ${i===s.estPe?"on":""}`} onClick={()=>s.setEstPe(i)}
        style={i===s.estPe?{background:p.color, color:"#fff", borderColor:p.color}:{}}>{p.pe}</button>)}
      <EstModeToggle s={s}/>
    </div>
    <div className="i-split i-est-split">
      <div className="i-col-a"><EstimatorCard s={s}/></div>
      <div className="i-col-b"><EstSummary s={s}/></div>
    </div>
  </div>;
}

/* Comp Uplift Plans — PE1 (Prod+Services) only for now. Expandable row
   revealing per-product uplift progress toward the same $109k goal. */
