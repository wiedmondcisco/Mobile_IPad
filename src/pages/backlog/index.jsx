import { useState } from "react";
import { ChevronDown } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { orders } from "../../data/orders.js";
import { PE_COLOR } from "../../lib/brand.js";
import { amt, maskText } from "../../lib/core.js";
import { MobileHeader } from "../../shared/chrome.jsx";

export const backlogOrders = [
  {id:"SO-105078", customer:"Helix Networks",   pe:"PE1", booked:"Apr 2, 2026",  bookings:"$21,000", backlog:"$14,000", revenue:"$7,000",  fulfil:"Jun 18, 2026", days:23,   pay:"Jul 2026", bucket:"Jun"},
  {id:"SO-104650", customer:"Cortex Financial", pe:"PE1", booked:"Mar 20, 2026", bookings:"$23,000", backlog:"$23,000", revenue:"—",       fulfil:"Jul 15, 2026", days:50,   pay:"Aug 2026", bucket:"Jul"},
  {id:"SO-104930", customer:"Apex Industries",  pe:"PE2", booked:"Apr 10, 2026", bookings:"$12,000", backlog:"$12,000", revenue:"—",       fulfil:"Jul 28, 2026", days:63,   pay:"Aug 2026", bucket:"Jul"},
  {id:"SO-104788", customer:"GlobalNet Inc",    pe:"PE3", booked:"Mar 28, 2026", bookings:"$52,000", backlog:"$38,000", revenue:"$14,000", fulfil:"Aug 22, 2026", days:88,   pay:"Sep 2026", bucket:"Aug"},
  {id:"SO-105102", customer:"Nova Telecom",     pe:"PE1", booked:"Apr 20, 2026", bookings:"$8,000",  backlog:"$5,000",  revenue:"$3,000",  fulfil:"Sep 10, 2026", days:107,  pay:"Oct 2026", bucket:"Sep"},
  {id:"SO-104415", customer:"Cascade Systems",  pe:"PE2", booked:"Feb 25, 2026", bookings:"$16,000", backlog:"$16,000", revenue:"—",       fulfil:"Sep 25, 2026", days:122,  pay:"Oct 2026", bucket:"Sep"},
  {id:"SO-104220", customer:"Orion Tech",       pe:"PE3", booked:"Feb 12, 2026", bookings:"$10,000", backlog:"$7,000",  revenue:"$3,000",  fulfil:"—",            days:null, pay:"—",        bucket:"Beyond"}
];

export const backlogBuckets = [
  {id:"All",    label:"Total Backlog",  amt:"$115K", orders:7, est:"+$1,200 est. paycheck", color:"var(--accent)"},
  {id:"Jun",    label:"June 2026",      amt:"$14K",  orders:1, est:"+$145 est.",  color:"var(--green)"},
  {id:"Jul",    label:"July 2026",      amt:"$35K",  orders:2, est:"+$365 est.",  color:"var(--green)"},
  {id:"Aug",    label:"August 2026",    amt:"$38K",  orders:1, est:"+$395 est.",  color:"var(--amber)"},
  {id:"Sep",    label:"September 2026", amt:"$21K",  orders:2, est:"+$220 est.",  color:"var(--red)"},
  {id:"Beyond", label:"Beyond",         amt:"$7K",   orders:1, est:"+$75 est.",   color:"#3e7bd6", note:"Oct+ or no date"}
];

export const daysTone = d => d==null ? "var(--muted)" : d<=90 ? "var(--green)" : d<=140 ? "var(--amber)" : "var(--red)";

/* Month filter chips (horizontal scroll) — the compressed stand-in for the
   desktop page's bucket cards; tapping filters the order list */

export function BacklogBucketChips({s}) {
  return <div className="m-blg-chips">
    {backlogBuckets.map(b=><button key={b.id} className={`m-blg-chip ${s.backlogFilter===b.id?"on":""}`} onClick={()=>s.setBacklogFilter(b.id)}>
      <small>{b.label}</small>
      <b style={{color:b.color}}>{amt(b.amt)}</b>
      <span>{b.orders} order{b.orders===1?"":"s"}</span>
    </button>)}
  </div>;
}

/* Mobile: one summary card with a period dropdown instead of the
   desktop's horizontal bucket cards — kills the sideways scroll */

export function BacklogHero({s}) {
  const b = backlogBuckets.find(x=>x.id===s.backlogFilter);
  return <div className="m-section m-blg-hero">
    <div className="m-blg-hero-top">
      <small className="m-blg-hero-lbl">{b.id==="All" ? "Total Backlog" : b.label}{b.note ? ` · ${b.note}` : ""}</small>
      <span className="m-badge-selwrap">
        <select className="m-badge-select" value={s.backlogFilter} onChange={e=>s.setBacklogFilter(e.target.value)} aria-label="Backlog period">
          {backlogBuckets.map(x=><option key={x.id} value={x.id}>{x.id==="All" ? "All Periods" : x.label}</option>)}
        </select>
        <ChevronDown size={11}/>
      </span>
    </div>
    <div className="m-blg-hero-figs">
      <b className="m-blg-hero-amt" style={{color:b.color}}>{amt(b.amt)}</b>
      <span className="m-blg-hero-orders">{b.orders} order{b.orders===1?"":"s"}</span>
      <b className="m-blg-hero-est">{maskText(b.est)}</b>
    </div>
  </div>;
}

/* Selected bucket's est. paycheck impact, in the data-banner style */
export function BacklogSummaryStrip({s}) {
  const b = backlogBuckets.find(x=>x.id===s.backlogFilter);
  return <div className="m-blg-summary">
    <span>{b.id==="All" ? "All periods" : b.label}{b.note ? ` · ${b.note}` : ""} · {b.orders} order{b.orders===1?"":"s"}</span>
    <b>{maskText(b.est)}</b>
  </div>;
}

/* One backlog order — collapsed to customer/SO/backlog/payment month;
   tapping expands the remaining desktop-table fields */

export function BacklogOrderCard({o}) {
  const [open, setOpen] = useState(false);
  return <div className="m-blg-card" role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(v=>!v)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(v=>!v); } }}>
    <div className="m-blg-top">
      <span className="m-pb-pe-badge" style={{background:PE_COLOR[o.pe]+"22", color:PE_COLOR[o.pe]}}>{o.pe}</span>
      <div className="m-blg-who"><b>{o.customer}</b><small>{o.id}</small></div>
      <div className="m-blg-amt"><b>{amt(o.backlog)}</b><small>Backlog</small></div>
      <ChevronDown size={14} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    <div className="m-blg-meta">
      <span style={{color:daysTone(o.days)}}>{o.days==null ? "No fulfilment date" : `${o.days}d to fulfilment`}</span>
      <span className="m-blg-pay">{o.pay==="—" ? "Payment TBD" : `Est. pay ${o.pay}`}</span>
    </div>
    {open && <div className="m-blg-details">
      <div><small>Bookings</small><b>{amt(o.bookings)}</b></div>
      <div><small>Revenue</small><b>{amt(o.revenue)}</b></div>
      <div><small>Comp Book Date</small><b>{o.booked}</b></div>
      <div><small>Expected Fulfilment</small><b>{o.fulfil}</b></div>
    </div>}
  </div>;
}

export function BacklogPage({s}) {
  const list = s.backlogFilter==="All" ? backlogOrders : backlogOrders.filter(o=>o.bucket===s.backlogFilter);
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Backlog Insights</h1>
    <p className="m-team-sub">Orders awaiting revenue recognition. Payment dates and amounts are estimates.</p>
    <BacklogHero s={s}/>
    {list.map(o=><BacklogOrderCard key={o.id} o={o}/>)}
  </div>;
}

export function IPadBacklog({s}) {
  const list = s.backlogFilter==="All" ? backlogOrders : backlogOrders.filter(o=>o.bucket===s.backlogFilter);
  return <div className="i-page">
    <IPadHeader title="Backlog Insights" sub="Orders awaiting revenue recognition. Payment dates and amounts are estimates." s={s}/>
    <BacklogBucketChips s={s}/>
    <BacklogSummaryStrip s={s}/>
    <div className="i-grid-2">{list.map(o=><BacklogOrderCard key={o.id} o={o}/>)}</div>
  </div>;
}

