import React, { useState, useRef } from "react";
import { Calendar, ChevronDown, Eye, EyeOff, Target, X } from "lucide-react";
import { amt, cvt } from "../lib/core.js";

/* Single-value attainment donut with center label (pie-first language) */
export function AttainDonut({pct, color, size=104, stroke=13, sub="ATTAINMENT"}) {
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

export function SegmentDonut({items, total, size=180, stroke=26, centerTop, centerSub, interactive=false}) {
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
      <b style={{fontSize:size*(String(centerTop).length>11 ? 0.085 : String(centerTop).length>9 ? 0.105 : 0.125)}}>{centerTop}</b>
      {centerSub && <small>{centerSub}</small>}
    </div>
    {hv && <div className="m-donut-tip" style={{left:pos.x, top:pos.y}}>
      <span className="m-donut-tip-dot" style={{background:hv.color}}/>
      <div className="m-donut-tip-txt">
        <b>{hv.label}</b>
        <span>{amt("$"+hv.value.toLocaleString(undefined,{minimumFractionDigits:2}))} · {((hv.value/total)*100).toFixed(0)}%</span>
      </div>
    </div>}
  </div>;
}

/* Bookings / Revenue / Backlog dual-bar (kept from desktop, narrowed) */
export function BookingsBar({pe}) {
  const scale = Math.max(pe.bookingsPct, 105);
  const bookingsW = (pe.bookingsPct / scale) * 100;
  const revW = (pe.revenuePct / pe.bookingsPct) * 100;
  const blW = (pe.backlogPct / pe.bookingsPct) * 100;
  const markerPos = (100 / scale) * 100;
  return <div className="m-pe-bar-section">
    <div className="m-pe-book-row"><span className="m-pe-book-icon"></span> Bookings <b>{cvt(pe.bookingsAmt)}</b> {pe.bookingsPct}%</div>
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
      <span><i className="m-dot" style={{background:pe.color}}></i> Revenue <b>{cvt(pe.revenueAmt)}</b> {pe.revenuePct}%</span>
      <span><i className="m-dot" style={{background:pe.blColor||pe.color}}></i> Backlog <b>{cvt(pe.backlogAmt)}</b> {pe.backlogPct}%</span>
    </div>
  </div>;
}

/* Full-screen popup takeover (100% of the phone screen, opaque, no bleed-through) */
export function FullScreenPopup({title, subtitle, tabs, activeTab, onTab, onClose, children}) {
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

export function FormulaStrip({weight, targetIncentive, proration, payoutRate, result, totalEarned, prevPaid, weightLabel="Weight"}) {
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

export function Expandable({title, defaultOpen=false, children}) {
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

export function HideBtn({s, light=false}) {
  const Icon = s.hideAmts ? Eye : EyeOff;
  return <span className="m-hide-zone" onClick={e=>e.stopPropagation()} onKeyDown={e=>e.stopPropagation()}>
    <button className={`m-hide-btn ${light?"m-hide-btn-light":""}`} aria-pressed={s.hideAmts}
      onClick={()=>s.setHideAmts(!s.hideAmts)}>
      <Icon size={13}/> {s.hideAmts ? "Show" : "Hide"}
    </button>
  </span>;
}

/* Hero payment amount — steps the font down when a converted currency
   (CA$11,554.90 / ¥1,324,174) runs longer than the USD figure. */

export function HeroAmt({value}) {
  const a = amt(String(value));           // no $ prefix — the USD label next to it carries the currency
  const cls = a.length > 11 ? "m-hero-amt-xs" : a.length > 9 ? "m-hero-amt-sm" : "";
  return <span className={`m-hero-amt ${cls}`}>{a}</span>;
}

/* One collapsible insight card — details stay hidden behind a chevron
   dropdown so the feed shows a clean list of titles. */

export function PayCalBadge({status, hero}) {
  return <span className={`m-pcal-badge ${hero ? "m-pcb-hero" : `m-pcb-${status.toLowerCase()}`}`}>
    <Calendar size={hero ? 14 : 13}/>
  </span>;
}

/* Outlined PE pill used inside popups */
export function PePill({pe, label, color}) {
  return <span className="m-calc-pe-pill">
    <span className="m-calc-pe-id" style={{color}}>{pe}</span>
    <b>{label}</b>
  </span>;
}

/* Target Incentive derivation shown on the TI Calculation tab (desktop
   reference): annual base → semi-annual base → OTE → TI. One calculation
   for the seller, shared by every PE's popup. */
