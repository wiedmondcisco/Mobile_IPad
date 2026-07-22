import { useState, useEffect, useRef } from "react";
import { ArrowUp, Calculator, Calendar, ChevronDown, ChevronLeft, ChevronRight, ExternalLink, FileText, Info, RotateCw } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { revenueTxns } from "../../data/orders.js";
import { ACCENT_AMT_SECTIONS, OTB_CALC, PAYCAL_MONTHS, PAYCAL_SHORT, PAYMENT_HISTORY, SECTION_CHIP, fullPaymentPeriods, paycalInfo, paymentDonutItems, paymentSections } from "../../data/payments.js";
import { PE_COLOR } from "../../lib/brand.js";
import { DATA_AS_OF, REFRESH_NOTE, amt } from "../../lib/core.js";
import { MobileHeader } from "../../shared/chrome.jsx";
import { FullScreenPopup, HideBtn, SegmentDonut } from "../../shared/primitives.jsx";

export function PeriodChips({s}) {
  /* Chronological chips (oldest → newest). Collapsed shows April · May ·
     June-upcoming so the open statement sits front and center; the compact
     chevron toggle expands to the last 12 months. */
  const wrapRef = useRef(null);
  /* Current + past statements only — the upcoming month (no statement yet)
     is reachable from At A Glance but doesn't take a chip here. */
  const all = fullPaymentPeriods.map((pr,i)=>({pr,i})).filter(({pr})=>pr.status!=="Upcoming");
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
  </div>;
}

/* Upcoming statement placeholder — there's no breakdown to chart until the
   revenue window opens, so the click-in leads with the schedule: the lock
   date and payday the seller came looking for. */

export function UpcomingPaymentCard({p}) {
  return <div className="m-section">
    <div className="m-section-hdr"><h2>Payment Breakdown · {p.month}</h2><span className="m-pay-status m-status-upcoming">Upcoming</span></div>
    <div className="m-upc-body">
      <span className="m-pcal-badge m-pcb-upcoming m-upc-badge"><Calendar size={16}/></span>
      <b className="m-upc-amt">{amt(p.amount)} <small>USD (Est.)</small></b>
      <p className="m-upc-note">Projected from your current attainment run rate. The statement hasn't opened yet — bookings and revenue from <b>{p.revDates}</b> will start appearing after the first data refresh.</p>
      <div className="m-upc-dates">
        <span>Lock: <b>{p.lockDate}</b></span><i>·</i><span>Pay: <b>{p.payDate}</b></span>
      </div>
    </div>
  </div>;
}

/* compact: legend rows under 5% of the total fold into a "N more items"
   toggle so small line items don't eat the page (mobile). iPad has room,
   so it renders fully expanded. The donut always shows every slice. */

export function PaymentBreakdownCard({p, s, donutSize=180, compact=false}) {
  const total = parseFloat(p.amount.replace(/,/g,''));
  const donutItems = paymentDonutItems(p, s.theme==="dark");
  const hasDed = donutItems.some(d=>d.deduction);
  /* slice size = |amount|; legend percentages stay signed vs the net total */
  const slices = donutItems.map(d=>({...d, value:Math.abs(d.value)}));
  const sliceTotal = slices.reduce((a,d)=>a+d.value,0);
  const [showAll, setShowAll] = useState(false);
  const minor = compact ? donutItems.filter(d=>Math.abs(d.value)/total < .05) : [];
  const fold = minor.length >= 2;
  const rows = fold && !showAll ? donutItems.filter(d=>Math.abs(d.value)/total >= .05) : donutItems;
  const minorSum = minor.reduce((a,d)=>a+d.value,0);
  const legRow = (d,i) => {
    const pct = ((d.value/total)*100).toFixed(0);
    return <div key={i} className="m-leg2" style={{borderLeftColor:d.color}}>
      <span className="m-leg2-badge" style={{background:d.color}}>{pct}%</span>
      <span className="m-leg2-label">{d.label}{d.deduction && <i className="m-leg2-ded">Deduction</i>}</span>
      <b className={`m-leg2-val ${d.deduction ? "m-leg2-neg" : ""}`}>
        {d.deduction ? <>-{amt("$"+Math.abs(d.value).toLocaleString(undefined,{minimumFractionDigits:2}))}</>
          : amt("$"+d.value.toLocaleString(undefined,{minimumFractionDigits:2}))}
      </b>
    </div>;
  };
  return <div className="m-section">
    <div className="m-section-hdr"><h2>Payment Breakdown · {p.month}</h2><span className={`m-pay-status m-status-${p.status.toLowerCase()}`}>{p.status}</span></div>
    <div className="m-donut-hero">
      <SegmentDonut items={slices} total={sliceTotal} size={donutSize} stroke={Math.round(donutSize*0.145)} centerTop={amt(`$${p.amount}`)} centerSub={hasDed ? "Net" : "Total"} interactive/>
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

/* Key schedule dates as a compact strip at the top of Payments — the seller
   sees Next Payment / Lock / Revenue dates first; the calendar popup and the
   Pay Estimator stay one tap away on the same strip. */

export function PaymentDatesStrip({p, s}) {
  return <div className="m-pdates">
    <div className="m-pdates-row">
      <div className="m-pdate"><small>Next Payment</small><b>{p.payDate}</b></div>
      <div className="m-pdate"><small>Lock Date</small><b>{p.lockDate}</b></div>
      <div className="m-pdate"><small>Revenue Dates</small><b>{p.revDates}</b></div>
    </div>
    <div className="m-pdates-actions">
      <button className="m-pdates-btn" onClick={()=>s.setShowPayCal(true)}>Full Payment Calendar <ExternalLink size={11}/></button>
      <button className="m-pdates-btn m-pdates-btn-dim" onClick={()=>s.setTab("estimator")}>Estimate a future paycheck <Calculator size={11}/></button>
    </div>
  </div>;
}

/* Full Payment Calendar popup — a statement month as a seller would see it:
   revenue capture window, data refresh, lock, statement, and payday, on a
   month grid with a key-dates list. The ◀ ▶ arrows browse to previous and
   future months; months with a real statement use that period's dates, the
   rest follow the standard cadence (demo). */

export function PaymentCalendarPopup({onClose}) {
  const [view, setView] = useState({y:2026, m:4});       // opens on the current statement month (May 2026)
  const {y, m} = view;
  const info = paycalInfo(y, m);
  const startDow = new Date(y, m, 1).getDay();
  const daysIn = new Date(y, m+1, 0).getDate();
  const daysPrev = new Date(y, m, 0).getDate();
  const cells = Array.from({length:42}, (_,i)=>{
    const d = i - startDow + 1;
    return d < 1 ? {d:daysPrev+d, out:true, next:false}
      : d > daysIn ? {d:d-daysIn, out:true, next:true}
      : {d, out:false, next:false};
  });
  const mark = c =>
    !c.out ? (c.d===info.refresh ? "refresh" : c.d===info.lock ? "lock" : c.d===info.stmt ? "stmt" : c.d>=info.revStart && c.d<=info.revEnd ? "rev" : "")
    : c.next && c.d===info.pay ? "pay" : "";
  const move = dir => setView(v=>{ const m2 = v.m + dir; return {y: v.y + Math.floor(m2/12), m: ((m2%12)+12)%12}; });
  /* viewed month vs the open statement month (May 2026): Paid ← Current → Upcoming */
  const rel = (y*12 + m) - (2026*12 + 4);
  const status = rel===0 ? {label:"Current", cls:"open"} : rel>0 ? {label:"Upcoming", cls:"upcoming"} : {label:"Paid", cls:"paid"};
  const keyDates = [
    {cls:"rev",     label:"Revenue Capture Window", date:`${PAYCAL_SHORT[m]} ${info.revStart} – ${info.revEnd}`, desc:"Bookings & revenue credited to this statement"},
    {cls:"refresh", label:"Data Refresh",           date:`${PAYCAL_SHORT[m]} ${info.refresh}`,                   desc:"Attainment data refreshed at 6:00 AM"},
    {cls:"lock",    label:"Lock Date",              date:`${PAYCAL_SHORT[m]} ${info.lock}`,                      desc:"Statement locks for payroll processing"},
    {cls:"stmt",    label:"Statement Available",    date:`${PAYCAL_SHORT[m]} ${info.stmt}`,                      desc:"Final statement posted in CompX"},
    {cls:"pay",     label:"Payday",                 date:`${PAYCAL_SHORT[(m+1)%12]} ${info.pay}`,                desc:"Incentive payment via direct deposit"},
  ];
  return <FullScreenPopup title="Payment Calendar" subtitle={`${PAYCAL_MONTHS[m]} ${y} Statement Period`} onClose={onClose}>
    <div className="m-section">
      <div className="m-paycal-monthhdr">
        <button className="m-paycal-nav" aria-label="Previous month" onClick={()=>move(-1)}><ChevronLeft size={16}/></button>
        <div className="m-paycal-month">
          <div className="m-paycal-month-row"><b>{PAYCAL_MONTHS[m]} {y}</b><span className={`m-pay-status m-status-${status.cls}`}>{status.label}</span></div>
          <span>{info.sheet} Goal Sheet</span>
        </div>
        <button className="m-paycal-nav" aria-label="Next month" onClick={()=>move(1)}><ChevronRight size={16}/></button>
      </div>
      <div className="m-paycal-grid">
        {["S","M","T","W","T","F","S"].map((d,i)=><span key={"d"+i} className="m-paycal-dow">{d}</span>)}
        {cells.map((c,i)=><span key={i} className={`m-paycal-day ${c.out?"out":""} ${mark(c)}`}>{c.d}</span>)}
      </div>
    </div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>Key Dates</h2></div>
      {keyDates.map(k=><div key={k.label} className="m-paycal-key">
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

export function PbAttBar({item}) {
  /* Two-tone fill matching the desktop reference: blue = attainment before
     the recent change, green = the change itself. Both segments share the
     track's % scale, so total fill = pct and the green width = attChange. */
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

export function GoalSheetItemRow({item, onOpenCalc, onOpenPdf, onOpenKso}) {
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
          {revenueTxns[kid.txnKey || kid.pe] && <button className="m-pb-pe-pdf m-pb-pe-pdf-sm" aria-label={`${kid.label} revenue transactions`}
            onClick={()=>onOpenPdf(kid)}><FileText size={13}/></button>}
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
   statement month carries reconciliation from a swapped-out sheet.
   Desktop reference: neutral header with the reconciliation note inline,
   gray "Paid up to" pills, orange only on the negative amounts, and the
   PE1 row expanding into its component lines. */

export function ReplacedRow({it, child=false}) {
  const [open, setOpen] = useState(false);
  const color = it.color || PE_COLOR[it.pe];
  const kids = it.children;
  return <>
    <div className={`m-replaced-row ${child?"m-replaced-childrow":""} ${kids?"m-replaced-expandable":""}`}
      onClick={kids ? ()=>setOpen(o=>!o) : undefined}
      role={kids?"button":undefined} tabIndex={kids?0:undefined} aria-expanded={kids?open:undefined}
      onKeyDown={kids ? (e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }) : undefined}>
      <span className="m-pb-pe-badge" style={{background:color+"22", color}}>{it.pe}</span>
      <span className="m-replaced-name">{it.label}</span>
      {kids && <ChevronDown size={13} className={`m-insight-chev ${open?"open":""}`}/>}
      <b className="m-replaced-amt">{amt(it.amount)}</b>
      <span className="m-replaced-paid">{it.paidNote}: <b>{amt(it.paid)}</b></span>
    </div>
    {kids && open && <div className="m-replaced-kids">
      {kids.map((k,i)=><ReplacedRow key={i} it={k} child/>)}
    </div>}
  </>;
}

export function ReplacedGoalSheet({r}) {
  return <div className="m-replaced">
    <div className="m-replaced-hdr">
      <span className="m-replaced-icon"><RotateCw size={13}/></span>
      <div className="m-replaced-hdr-text">
        <b className="m-replaced-title">Replaced Goal Sheet</b>
        <small className="m-replaced-period">{r.period}</small>
      </div>
      {r.total && <b className="m-replaced-total">{amt(r.total)}</b>}
    </div>
    <div className="m-replaced-banner">
      <Info size={13}/>
      <p>Payments already made under your previous goal sheet for <b>{r.period}</b> are included in this replacement goal sheet, ensuring your payments are accurately reflected.</p>
    </div>
    <div className="m-replaced-rows">
      {r.items.map((it,i)=><ReplacedRow key={i} it={it}/>)}
    </div>
  </div>;
}

/* Expand All / Collapse All for the Payments accordion (desktop reference).
   Opens every section at once so sellers don't have to tap through six
   headers; flips to Collapse All when everything is open. */

export function ExpandAllBtn({s, p}) {
  const keys = paymentSections(p).map(x=>x.key);
  const allOpen = keys.every(k=>s.expanded[k]);
  return <button className="m-expandall-btn" onClick={()=>s.setExpanded(allOpen ? {} : Object.fromEntries(keys.map(k=>[k,true])))}>
    {allOpen ? "Collapse All" : "Expand All"}
  </button>;
}

export function PaymentAccordion({p, s}) {
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
            const open = (sec.key==="otb" && (item.calc || OTB_CALC[item.name])) ? ()=>s.setOtbCalcItem(item)
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
      {sec.key==="otb" && p.otb.replaced && <div className="m-otb-replaced">
        <div className="m-otb-replaced-hdr">
          <b>Replaced Goal Sheet</b>
          <small>{p.otb.replaced.period}</small>
          <span className="m-otb-replaced-note">{p.otb.replaced.note}</span>
        </div>
        {p.otb.replaced.items.map((it,k)=><div key={k} className="m-pb-detail-row">
          <span className="m-pb-detail-name"><span className="m-pb-chip">OTB</span>{it.name}</span>
          <b className="m-otb-replaced-amt">{amt(it.amount)}</b>
        </div>)}
      </div>}
    </div>}
  </div>)}</>;
}

export function PaymentsPage({s}) {
  const p = fullPaymentPeriods[s.periodIdx];
  return <div className="m-page">
    <MobileHeader s={s}/>
    <div className="m-page-title-row">
      <h1 className="m-page-title">Payments</h1>
      <button className="m-goalsheet-btn" onClick={()=>s.setShowRecovBal(true)}>Recoverable Balance History</button>
    </div>
    <div className="m-asof-banner"><span className="m-pcal-badge m-pcb-asof"><Calendar size={14}/></span><div className="m-asof-text"><span>{DATA_AS_OF}</span><small>{REFRESH_NOTE}</small></div><HideBtn s={s}/></div>
    <PaymentDatesStrip p={p} s={s}/>
    <PeriodChips s={s}/>
    {p.status === "Upcoming"
      ? <UpcomingPaymentCard p={p}/>
      : <>
        <PaymentBreakdownCard p={p} s={s} compact/>
        <div className="m-expandall-row"><ExpandAllBtn s={s} p={p}/></div>
        <PaymentAccordion p={p} s={s}/>
      </>}
  </div>;
}

export function IPadPayments({s}) {
  const p = fullPaymentPeriods[s.periodIdx];
  return <div className="i-page">
    <IPadHeader title="Payments" sub={`${DATA_AS_OF} · ${REFRESH_NOTE}`} s={s}
      right={<><button className="m-goalsheet-btn" onClick={()=>s.setShowRecovBal(true)}>Recoverable Balance History</button><ExpandAllBtn s={s} p={fullPaymentPeriods[s.periodIdx]}/><HideBtn s={s}/></>}/>
    <PaymentDatesStrip p={p} s={s}/>
    <PeriodChips s={s}/>
    {p.status === "Upcoming"
      ? <UpcomingPaymentCard p={p}/>
      : <div className="i-split">
        <div className="i-col-a">
          <PaymentBreakdownCard p={p} s={s} donutSize={188}/>
        </div>
        <div className="i-col-b">
          <PaymentAccordion p={p} s={s}/>
        </div>
      </div>}
  </div>;
}

/* iPad Goals — plan elements shown together as a grid (no one-at-a-time
   chips); KSO / OTB / NDR keep their own views behind chips. */
