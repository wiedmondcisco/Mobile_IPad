import { useState } from "react";
import { peBadgeStyle } from "../../lib/brand.js";
import { Calendar, ChevronDown, Menu } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { monthlyPayCards } from "../../data/payments.js";
import { goalSheetOptions, planElements } from "../../data/plans.js";
import { spiffBonus } from "../../data/spiffs.js";
import { ACTIVE_CUR, DATA_AS_OF, amt, cvt } from "../../lib/core.js";
import { AagInsightsSection } from "./insights.jsx";
import { PaymentsPage } from "../payments/index.jsx";
import { MobileHeader } from "../../shared/chrome.jsx";
import { BookingsBar, HeroAmt, HideBtn, PayCalBadge } from "../../shared/primitives.jsx";

export function AagSpiffSection({s}) {
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

/* Goal-sheet selector on Plan Elements (concept only — numbers stay on the
   demo month; the chip + date range swap to sell the interaction). Options
   and menu styling shared with the Goals-page selector; the open menu
   highlights the selected sheet with the blue pill (desktop reference). */

export function AtAGlancePage({s}) {
  const hero = monthlyPayCards.find(c=>c.current);
  const context = monthlyPayCards.filter(c=>!c.current);
  const [sheetIdx, setSheetIdx] = useState(0);
  const [sheetOpen, setSheetOpen] = useState(false);
  const sheet = goalSheetOptions[sheetIdx];

  /* Widgets render in the order set from the Settings popover; hidden ones
     drop out entirely. "payments" = hero + prev/next strip. */
  const paymentsBlock = <>
    {/* HERO — current month payment is the single largest element on the page; opens Payments */}
    <div className="m-hero" role="button" tabIndex={0} title="View Payments"
      onClick={()=>s.openPayPeriod(hero.period)} onKeyDown={e=>e.key==="Enter"&&s.openPayPeriod(hero.period)}>
      <PayCalBadge hero/>
      <div className="m-hero-body">
        <div className="m-hero-top">
          <span className="m-hero-label">Current Payment · {hero.month}</span>
          <span className="m-hero-pills">
            <span className="m-pay-status m-status-current">CURRENT</span>
            <span className={`m-pay-status m-status-${(hero.payState||"Unpaid").toLowerCase()}`}>{hero.payState||"Unpaid"}</span>
          </span>
        </div>
        <div className="m-hero-amt-row">
          <HeroAmt value={hero.amount}/>
          <span className="m-hero-usd">USD <i className="m-hero-est">(Est.)</i></span>
        </div>
        <div className="m-hero-meta">
          <span className="m-hero-asof"><Calendar size={11}/> {DATA_AS_OF}<HideBtn s={s} light/></span>
          <span className="m-hero-change">{hero.change} vs Apr · {hero.payDate}</span>
        </div>
      </div>
    </div>

    {/* Prev / next context — de-emphasized strip */}
    <div className="m-context-strip">
      {context.map((c,i)=><div key={i} className={`m-context-card ${c.period?"m-context-click":""}`}
        role={c.period?"button":undefined} tabIndex={c.period?0:undefined} title={c.period?`View ${c.month} payment`:undefined}
        onClick={c.period?()=>s.openPayPeriod(c.period):undefined}
        onKeyDown={c.period?(e=>e.key==="Enter"&&s.openPayPeriod(c.period)):undefined}>
        <PayCalBadge status={c.status}/>
        <div className="m-context-body">
          <span className="m-context-month">{c.month}</span>
          <b className="m-context-amt">{amt(c.amount)} <small>USD</small></b>
          <span className={`m-pay-status m-status-${c.status.toLowerCase()}`}>{c.status}</span>
          <small className="m-context-dates">{c.lock ? <>Lock: {c.lock} · {c.payDate}</> : c.payDate}</small>
        </div>
      </div>)}
    </div>
  </>;

  return <div className="m-page">
    <MobileHeader s={s}/>
    {paymentsBlock}
    {planBlock(s, sheet, sheetIdx, setSheetIdx, sheetOpen, setSheetOpen)}
    <AagInsightsSection s={s}/>
  </div>;
}

/* "Plan Elements & Incentives" widget — PE cards + SPIFF section (kept as a
   plain function so the goal-sheet dropdown state stays in AtAGlancePage) */

export function planBlock(s, sheet, sheetIdx, setSheetIdx, sheetOpen, setSheetOpen) {
  return <>
    <div className="m-section-label"><Menu size={13} className="m-section-icon"/> PLAN ELEMENTS & INCENTIVES</div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>PLAN ELEMENTS</h2>
        <div className="m-gsel-wrap m-gsel-chip">
          <button className="m-badge-chip" onClick={()=>setSheetOpen(o=>!o)} aria-expanded={sheetOpen} aria-haspopup="listbox" aria-label="Goal sheet">
            {sheet.fy} {sheet.code} <ChevronDown size={11} className={`m-insight-chev ${sheetOpen?"open":""}`}/>
          </button>
          {sheetOpen && <>
            <div className="m-gsel-backdrop" onClick={()=>setSheetOpen(false)}/>
            <div className="m-gsel-menu m-gsel-menu-anchored" role="listbox" aria-label="Goal sheets">
              {goalSheetOptions.map((o,i)=><button key={i} role="option" aria-selected={i===sheetIdx}
                className={i===sheetIdx?"on":""} onClick={()=>{ setSheetIdx(i); setSheetOpen(false); }}>
                <span className="m-gsel-check">{i===sheetIdx ? "✓" : ""}</span>
                <span className="m-gsel-opt">{o.fy} {o.code} {o.dates} ({o.half})</span>
              </button>)}
            </div>
          </>}
        </div>
      </div>
      <small className="m-pe-sub">All values in {ACTIVE_CUR.code} · {sheet.dates}</small>
      {planElements.map((pe,i)=><div key={i} className="m-pe-card m-pe-flat m-pe-click" role="button" tabIndex={0}
        aria-label={`Open ${pe.id} on Goals`} onClick={()=>s.openGoal(pe.id)}
        onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); s.openGoal(pe.id); } }}>
        <div className="m-pe-top">
          <div className="m-pe-left"><span className="m-pe-badge" style={peBadgeStyle(pe.id, pe.color)}>{pe.id}</span><b>{pe.name}</b></div>
          <span className="m-pe-goal">{cvt(pe.goal)}</span>
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
  </>;
}

/* Shared payment sub-components (consumed by mobile PaymentsPage + iPad) */
/* Circular calendar badge on the monthly payment cards (desktop reference);
   tint follows the payment status — the hero variant sits on the blue gradient. */

export function IPadGlance({s}) {
  /* Payment timeline — cards read chronologically left→right (Apr · May · Jun),
      with the current month as the dominant hero in the middle */
  const paymentsBlock = <div className="i-glance-top">
      {monthlyPayCards.map((c,i)=> c.current
        ? <div key={i} className="m-hero i-hero" role="button" tabIndex={0} title="View Payments"
            onClick={()=>s.openPayPeriod(c.period)} onKeyDown={e=>e.key==="Enter"&&s.openPayPeriod(c.period)}>
            <PayCalBadge hero/>
            <div className="m-hero-body">
              <div className="m-hero-top">
                <span className="m-hero-label">Current Payment · {c.month}</span>
                <span className="m-hero-pills">
                  <span className="m-pay-status m-status-current">CURRENT</span>
                  <span className={`m-pay-status m-status-${(c.payState||"Unpaid").toLowerCase()}`}>{c.payState||"Unpaid"}</span>
                </span>
              </div>
              <div className="m-hero-amt-row"><HeroAmt value={c.amount}/><span className="m-hero-usd">USD <i className="m-hero-est">(Est.)</i></span></div>
              <div className="m-hero-meta">
                <span className="m-hero-asof"><Calendar size={12}/> {DATA_AS_OF}<HideBtn s={s} light/></span>
                <span className="m-hero-change">{c.change} vs Apr · {c.payDate}</span>
              </div>
            </div>
          </div>
        : <div key={i} className={`m-context-card i-timeline-card ${c.period?"m-context-click":""}`}
            role={c.period?"button":undefined} tabIndex={c.period?0:undefined} title={c.period?`View ${c.month} payment`:undefined}
            onClick={c.period?()=>s.openPayPeriod(c.period):undefined}
            onKeyDown={c.period?(e=>e.key==="Enter"&&s.openPayPeriod(c.period)):undefined}>
            <PayCalBadge status={c.status}/>
            <div className="m-context-body">
              <span className="m-context-month">{c.month}</span>
              <b className="m-context-amt">{amt(c.amount)} <small>USD</small></b>
              <span className={`m-pay-status m-status-${c.status.toLowerCase()}`}>{c.status}</span>
              <small className="i-timeline-date">{c.lock ? <>Lock: {c.lock} · {c.payDate}</> : c.payDate}</small>
            </div>
          </div>)}
    </div>;

  /* Desktop reference layout: plan elements stacked left, SPIFF panel right —
      the columns stay height-matched so no dead space opens up under PE3 */
  const planIpadBlock = <>
    <div className="m-section-label"><Menu size={13} className="m-section-icon"/> PLAN ELEMENTS & INCENTIVES</div>
    <div className="i-glance-cols">
      <div className="i-glance-pes">
        {planElements.map((pe,i)=><div key={i} className="m-pe-card i-pe-card m-pe-flat m-pe-click" role="button" tabIndex={0}
          aria-label={`Open ${pe.id} on Goals`} onClick={()=>s.openGoal(pe.id)}
          onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); s.openGoal(pe.id); } }}>
          <div className="m-pe-top">
            <div className="m-pe-left"><span className="m-pe-badge" style={peBadgeStyle(pe.id, pe.color)}>{pe.id}</span><b>{pe.name}</b></div>
            <span className="m-pe-goal">{cvt(pe.goal)}</span>
          </div>
          <div className="m-pe-att-row">
            <b className="m-pe-att-big" style={{color:pe.color}}>{pe.attPct}%</b>
            <span className="m-pe-att-lbl">REVENUE ATT.</span>
          </div>
          <BookingsBar pe={pe}/>
        </div>)}
      </div>
      <AagSpiffSection s={s}/>
    </div>
  </>;

  return <div className="i-page">
    <IPadHeader title="At A Glance" sub="Your compensation snapshot · H1 2026" s={s}/>
    {paymentsBlock}
    {planIpadBlock}
    <AagInsightsSection s={s} defaultOpen className="i-insights"/>
  </div>;
}
