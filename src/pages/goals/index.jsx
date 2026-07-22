import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { goalSheetOptions, goalTabs } from "../../data/plans.js";
import { PE_COLOR, peBadgeStyle, peChipStyle } from "../../lib/brand.js";
import { amt, cvt } from "../../lib/core.js";
import { KsoSection } from "./kso.jsx";
import { NdrSection } from "./ndr.jsx";
import { MobileHeader } from "../../shared/chrome.jsx";
import { BookingsBar } from "../../shared/primitives.jsx";

export const compUpliftPlans = [
  {name:"PREM-SERVICES|COMP UPLIFT",   earned:"$17,061.00", pct:15.7, rev:"$14k",  back:"$3k",  gap:"$92k"},
  {name:"COLLAB-DEVICES|COMP UPLIFT",  earned:"$4,597.00",  pct:4.2,  rev:"$4k",   back:"$1k",  gap:"$104k"},
  {name:"I-AND-MI-OPTICS|COMP UPLIFT", earned:"$159.00",    pct:0.1,  rev:"$109",  back:"$50",  gap:"$109k"}
];

export const UPLIFT_GOAL = "$109,000.00";

export function CompUpliftSection({s}) {
  return <div className="m-uplift">
    <button className="m-uplift-toggle" onClick={()=>s.setUpliftOpen(!s.upliftOpen)} aria-expanded={s.upliftOpen}>
      Comp Uplift
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
   Each quarter lists its FY26 objectives with weight, bonus earned, target,
   result, and an achievement-% pill (green ≥100, red 0, grey otherwise;
   "-" before the quarter opens). "View Calculation" expands to the weighted
   achievement math. One deliberate fix: Q2's calc line shows the computed
   100% (the reference's 125% doesn't match its own formula). */
/* Full objective wording — the desktop shows these as hover tooltips on the
   objective names; here "More info" reveals them under each objective (and
   the name carries a title tooltip for pointer devices). Keyed by title so
   objectives repeated across quarters share one description. */

export function GoalSheetSelect() {
  const [open, setOpen] = useState(false);
  const cur = goalSheetOptions.find(o=>o.current);
  return <div className="m-gsel-wrap">
    <button className="m-gsel" onClick={()=>setOpen(o=>!o)} aria-expanded={open} aria-haspopup="listbox">
      <small>Goal Sheet</small>
      <span className="m-gsel-txt">
        <b>{cur.fy} {cur.code}</b>
        <span className="m-gsel-dates">{cur.dates} ({cur.half})</span>
      </span>
      <ChevronDown size={14} className={`m-insight-chev ${open?"open":""}`}/>
    </button>
    {open && <>
      <div className="m-gsel-backdrop" onClick={()=>setOpen(false)}/>
      <div className="m-gsel-menu" role="listbox" aria-label="Goal sheets">
        {goalSheetOptions.map((o,i)=><button key={i} role="option" aria-selected={!!o.current}
          className={o.current?"on":""} onClick={()=>setOpen(false)}>
          <span className="m-gsel-check">{o.current ? "✓" : ""}</span>
          <span className="m-gsel-opt">{o.fy} {o.code} {o.dates} ({o.half})</span>
        </button>)}
      </div>
    </>}
  </div>;
}

export function GoalsPage({s}) {
  const tabIdx = s.goalIdx, setTabIdx = s.setGoalIdx;
  const g = goalTabs[tabIdx];

  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title">Goals</h1>
    <GoalSheetSelect/>

    {/* PE tab row */}
    <div className="m-goaltab-scroll">
      {goalTabs.map((t,i)=><button key={t.id} className={`m-goaltab ${i===tabIdx?"on":""}`} onClick={()=>setTabIdx(i)}
        style={i===tabIdx?peChipStyle(t.id, t.color):{}}>{t.id}</button>)}
    </div>

    {g.id==="KSO" ? <KsoSection/> : g.id==="NDR" ? <NdrSection/> : <>
    {/* Selected goal — big attainment stat + full-width bar (matches At A Glance).
        Section rail, stat, and bar all bind to the active PE color. */}
    <div className="m-section m-pe-flat m-pe-solo" style={{borderLeftColor:g.color}}>
      <div className="m-section-hdr">
        <div className="m-pe-left"><span className="m-pe-badge" style={peBadgeStyle(g.id, g.color)}>{g.id}</span><b>{g.name}</b></div>
        <span className="m-pe-goal">{cvt(g.goal)} Goal</span>
      </div>
      <div className="m-pe-att-row">
        <b className="m-pe-att-big" style={{color:g.color}}>{g.attPct}%</b>
        <span className="m-pe-att-lbl">REVENUE ATT.</span>
      </div>
      <BookingsBar pe={g}/>
      {g.id==="PE1" && <CompUpliftSection s={s}/>}
      <div className="m-goal-stats">
        <div><small>Goal</small><span>{cvt(g.goal)}</span></div>
        <div><small>Attainment</small><span style={{color:g.color}}>{g.attPct}%</span></div>
        <div><small>Incentive</small><span className="m-goal-earn">{amt(g.incentive)}</span></div>
      </div>
    </div>
    </>}
  </div>;
}


export const IPAD_GOAL_CHIPS = [
  {id:"PE",  label:"Plan Elements", color:"var(--accent)", match:i=>i<=2, idx:0},
  {id:"KSO", label:"KSO",           color:PE_COLOR.KSO,    match:i=>i===3, idx:3},
  {id:"OTB", label:"OTB",           color:PE_COLOR.OTB,    match:i=>i===4, idx:4},
  {id:"NDR", label:"NDR",           color:PE_COLOR.NDR,    match:i=>i===5, idx:5}
];

export function IPadGoals({s}) {
  const g = goalTabs[s.goalIdx];
  const peView = s.goalIdx <= 2;
  return <div className="i-page">
    <IPadHeader title="Goals" sub="Plan-element attainment · H1 2026" s={s}/>
    <div className="i-gsel-row"><GoalSheetSelect/></div>
    <div className="i-goaltab-row">
      {IPAD_GOAL_CHIPS.map(c=>{
        const on = c.match(s.goalIdx);
        return <button key={c.id} className={`m-goaltab ${on?"on":""}`} onClick={()=>s.setGoalIdx(c.idx)}
          style={on?{background:c.color, color:"#fff", borderColor:c.color}:{}}>{c.label}</button>;
      })}
    </div>
    {peView ? <>
      <div className="i-grid-2">
        {goalTabs.slice(0,3).map(t=><div key={t.id} className="m-section m-pe-flat m-pe-solo" style={{borderLeftColor:t.color}}>
          <div className="m-section-hdr">
            <div className="m-pe-left"><span className="m-pe-badge" style={peBadgeStyle(t.id, t.color)}>{t.id}</span><b>{t.name}</b></div>
            <span className="m-pe-goal">{cvt(t.goal)} Goal</span>
          </div>
          <div className="m-pe-att-row">
            <b className="m-pe-att-big" style={{color:t.color}}>{t.attPct}%</b>
            <span className="m-pe-att-lbl">REVENUE ATT.</span>
          </div>
          <BookingsBar pe={t}/>
          <div className="m-goal-stats">
            <div><small>Goal</small><span>{cvt(t.goal)}</span></div>
            <div><small>Attainment</small><span style={{color:t.color}}>{t.attPct}%</span></div>
            <div><small>Incentive</small><span className="m-goal-earn">{amt(t.incentive)}</span></div>
          </div>
        </div>)}
        <div className="m-section i-goals-uplift"><CompUpliftSection s={s}/></div>
      </div>
    </> : g.id==="KSO" ? <KsoSection/> : g.id==="NDR" ? <NdrSection/> : <div className="i-split i-goals-split">
      <div className="i-col-a">
        <div className="m-section m-pe-flat m-pe-solo" style={{borderLeftColor:g.color}}>
          <div className="m-section-hdr">
            <div className="m-pe-left"><span className="m-pe-badge" style={peBadgeStyle(g.id, g.color)}>{g.id}</span><b>{g.name}</b></div>
            <span className="m-pe-goal">{cvt(g.goal)} Goal</span>
          </div>
          <div className="m-pe-att-row">
            <b className="m-pe-att-big" style={{color:g.color}}>{g.attPct}%</b>
            <span className="m-pe-att-lbl">REVENUE ATT.</span>
          </div>
          <div className="m-goal-stats">
            <div><small>Goal</small><span>{cvt(g.goal)}</span></div>
            <div><small>Attainment</small><span style={{color:g.color}}>{g.attPct}%</span></div>
            <div><small>Incentive</small><span className="m-goal-earn">{amt(g.incentive)}</span></div>
          </div>
        </div>
      </div>
      <div className="i-col-b">
        <div className="m-section m-pe-flat m-pe-solo">
          <div className="m-section-hdr"><h2>Bookings vs Revenue</h2></div>
          <BookingsBar pe={g}/>
        </div>
      </div>
    </div>}
  </div>;
}
