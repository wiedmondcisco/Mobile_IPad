import { Search } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { ORDER_PES, ORDER_PE_LABEL, ORDER_SEARCH_TYPES, ORDER_STATUSES, deriveOrders, orderDetailMeta, orders } from "../../data/orders.js";
import { PE_COLOR } from "../../lib/brand.js";
import { amt } from "../../lib/core.js";
import { MobileHeader } from "../../shared/chrome.jsx";
import { FullScreenPopup } from "../../shared/primitives.jsx";

/* Single order result card (shared by search results + recent-order list) */
export const ORDER_STATUS_CHIP = {"Backlog":"m-status-upcoming", "Partial":"m-status-open", "Full Revenue":"m-status-paid"};

export function OrderCard({o, onOpen}) {
  return <div className="m-order-card">
    <div className="m-order-top">
      <span className="m-pb-pe-badge" style={{background:PE_COLOR[o.pe]+"22", color:PE_COLOR[o.pe]}}>{o.pe}</span>
      <button className="m-order-id m-order-id-link" onClick={onOpen} title={`View ${o.id} order details`}>{o.id}</button>
      <span className={`m-pay-status ${ORDER_STATUS_CHIP[o.status]||"m-status-paid"}`}>{o.status}</span>
    </div>
    <div className="m-order-mid"><b>{o.customer}</b><span>{o.partner}</span></div>
    <div className="m-order-figs">
      <div><small>Bookings</small><b>{amt(o.bookings)}</b></div>
      <div><small>Backlog</small><b>{amt(o.backlog)}</b></div>
      <div><small>Revenue</small><b>{amt(o.revenue)}</b></div>
    </div>
  </div>;
}

/* ── Sales Order drilldown (desktop reference) — the blue SO number on any
   order card opens the full order: header IDs, order details, and the
   plan-element bookings/backlog/revenue summary. Web/PO/Deal IDs and the
   book date derive deterministically from the SO (demo data). */

export function OrderDetailPopup({o, onClose}) {
  const m = orderDetailMeta(o);
  return <FullScreenPopup title={`Sales Order ${o.id}`}
    subtitle={`Web ID: ${m.webId} · P.O. Number: ${m.po} · Deal ID: ${m.deal}`} onClose={onClose}>
    <div className="m-section">
      <div className="m-section-hdr"><h2>Order Details</h2></div>
      <div className="m-od-grid">
        <div className="m-od-item"><b>{o.customer}</b><small>End Customer</small></div>
        <div className="m-od-item"><b>{o.partner}</b><small>Partner Name</small></div>
        <div className="m-od-item"><b>{m.booked}</b><small>Comp Book Date</small></div>
        <div className="m-od-item"><span className={`m-pay-status ${ORDER_STATUS_CHIP[o.status]||"m-status-paid"}`}>{o.status}</span><small>Commission Status</small></div>
        <div className="m-od-item"><b>{amt(o.bookings)}</b><small>TCV</small></div>
      </div>
    </div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>Plan Element Summary</h2><span className="m-od-gs">Goal Sheet: H1 FY2026</span></div>
      <div className="m-od-tr m-od-th"><span/><span className="r">Bookings</span><span className="r">Backlog</span><span className="r">Revenue</span></div>
      <div className="m-od-tr">
        <span className="m-od-pe"><span className="m-pb-pe-badge" style={{background:PE_COLOR[o.pe]+"22", color:PE_COLOR[o.pe]}}>{o.pe}</span>{ORDER_PE_LABEL[o.pe] || o.pe}</span>
        <span className="r m-od-num">{amt(o.bookings)}</span>
        <span className={`r m-od-num ${o.backlog !== "$0" ? "m-od-backlog" : ""}`}>{amt(o.backlog)}</span>
        <span className="r m-od-num">{amt(o.revenue)}</span>
      </div>
    </div>
  </FullScreenPopup>;
}

/* Search controls (desktop reference): [type ▾][query][go] plus Status /
   Plan Element filters with Submit + Clear. Shared by mobile + iPad. */

export function OrderSearchControls({s, ipad=false}) {
  const submit = () => s.setOrderSubmitted(true);
  const clear = () => {
    s.setOrderQuery(""); s.setOrderStatus("All Statuses");
    s.setOrderPe("All Plan Elements"); s.setOrderSubmitted(false);
  };
  return <>
    <div className={`m-os-bar ${ipad?"i-os-bar":""}`}>
      <select className="m-os-type" value={s.orderType} onChange={e=>s.setOrderType(e.target.value)} aria-label="Search by">
        {ORDER_SEARCH_TYPES.map(t=><option key={t}>{t}</option>)}
      </select>
      <input className="m-os-input" placeholder={`Enter ${s.orderType}...`} value={s.orderQuery}
        onChange={e=>s.setOrderQuery(e.target.value)} onKeyDown={e=>e.key==="Enter"&&submit()}/>
      <button className="m-os-go" aria-label="Search" onClick={submit}><Search size={15}/></button>
    </div>
    <div className={`m-os-filters ${ipad?"i-os-filters":""}`}>
      <label className="m-os-flt"><small>Status</small>
        <select value={s.orderStatus} onChange={e=>s.setOrderStatus(e.target.value)} aria-label="Status filter">
          {ORDER_STATUSES.map(o=><option key={o}>{o}</option>)}
        </select>
      </label>
      <label className="m-os-flt"><small>Plan Element</small>
        <select value={s.orderPe} onChange={e=>s.setOrderPe(e.target.value)} aria-label="Plan element filter">
          {ORDER_PES.map(o=><option key={o}>{o}</option>)}
        </select>
      </label>
      <button className="m-os-submit" onClick={submit}>Submit</button>
      <button className="m-os-clear2" onClick={clear}>Clear</button>
    </div>
  </>;
}

export function OrderSearchPage({s}) {
  const {q, list} = deriveOrders(s.orderQuery, s.orderType, s.orderStatus, s.orderPe);
  const show = q || s.orderSubmitted;
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title">Order Search</h1>
    <OrderSearchControls s={s}/>
    {show ? <>
      <div className="m-os-results-hdr">
        <p className="m-search-count">{list.length} order{list.length===1?"":"s"} found</p>
      </div>
      {list.map(o=><OrderCard key={o.id} o={o} onOpen={()=>s.setOrderDetail(o)}/>)}
      {list.length===0 && <div className="m-search-empty"><Search size={30}/><b>No orders found</b><span>Try a different {s.orderType} or loosen the filters.</span></div>}
    </> : <div className="m-search-empty">
      <Search size={30}/>
      <b>Search a seller's orders</b>
      <span>Pick a field, choose filters, and hit Submit to look up orders.</span>
    </div>}
  </div>;
}


export function IPadOrders({s}) {
  const {q, list} = deriveOrders(s.orderQuery, s.orderType, s.orderStatus, s.orderPe);
  const show = q || s.orderSubmitted;
  return <div className="i-page">
    <IPadHeader title="Order Search" sub="Look up a seller's orders" s={s}/>
    <OrderSearchControls s={s} ipad/>
    {show ? <>
      <div className="m-os-results-hdr">
        <p className="m-search-count">{list.length} order{list.length===1?"":"s"} found</p>
      </div>
      {list.length>0 ? <div className="i-grid-3">{list.map(o=><OrderCard key={o.id} o={o} onOpen={()=>s.setOrderDetail(o)}/>)}</div>
        : <div className="m-search-empty"><Search size={30}/><b>No orders found</b><span>Try a different {s.orderType} or loosen the filters.</span></div>}
    </> : <div className="m-search-empty">
      <Search size={30}/>
      <b>Search a seller's orders</b>
      <span>Pick a field, choose filters, and hit Submit to look up orders.</span>
    </div>}
  </div>;
}
