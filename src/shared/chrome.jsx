import { useState } from "react";
import { AlertTriangle, Bell, Calendar, Check, CheckCircle2, HelpCircle, Info, LayoutGrid, Search, X } from "lucide-react";
import { fmtRemDate, notifications } from "../data/insights.js";
import { orders } from "../data/orders.js";
import { OrderQuickSearch } from "../pages/order-search/quick-search.jsx";

export function NotifDropdown({s, onClose, ipad=false}) {
  const [tab, setTab] = useState("notifications");
  const [note, setNote] = useState("");
  const [date, setDate] = useState("");
  const add = () => {
    if (!note.trim()) return;
    s.setReminders(prev=>[...prev, {id:Date.now(), text:note.trim(), date, done:false}]);
    setNote(""); setDate("");
  };
  const toggle = id => s.setReminders(prev=>prev.map(r=>r.id===id ? {...r, done:!r.done} : r));
  const remove = id => s.setReminders(prev=>prev.filter(r=>r.id!==id));
  return <div className={`m-notif-dropdown ${ipad?"i-notif-dropdown":""}`}>
    <div className="m-ntabs">
      <button className={tab==="notifications"?"on":""} onClick={()=>setTab("notifications")}>Notifications</button>
      <button className={tab==="reminders"?"on":""} onClick={()=>setTab("reminders")}>My Reminders</button>
      <button className="m-ntabs-close" onClick={onClose} aria-label="Close"><X size={15}/></button>
    </div>
    {tab==="notifications" && (s.notifs.length === 0
      ? <div className="m-rem-empty">You're all caught up — no new notifications.</div>
      : s.notifs.map(n=>{
        const Ic = {amber:AlertTriangle, green:Check, blue:Info}[n.type] || Info;
        return <div key={n.title} className={`m-notif m-notif-${n.type}`}>
          <Ic size={16} className="m-notif-ic"/>
          <div className="m-notif-body">
            <b>{n.title}</b>
            <span>{n.desc}</span>
            <button className="m-notif-action" onClick={()=>{ s.setTab(n.nav); onClose(); }}>{n.action}</button>
          </div>
          <button className="m-notif-x" onClick={()=>s.setNotifs(list=>list.filter(x=>x!==n))} aria-label={`Dismiss ${n.title}`}><X size={13}/></button>
        </div>;
      }))}
    {tab==="reminders" && <>
      <div className="m-rem-add">
        <input className="m-rem-note" placeholder="Add a reminder note..." value={note}
          onChange={e=>setNote(e.target.value)} onKeyDown={e=>e.key==="Enter"&&add()}/>
        <input className="m-rem-date" type="date" value={date} onChange={e=>setDate(e.target.value)} aria-label="Reminder date"/>
        <button className="m-rem-addbtn" onClick={add}>Add</button>
      </div>
      {s.reminders.map(r=><div key={r.id} className={`m-rem-row ${r.done?"done":""}`}>
        <button className={`m-rem-check ${r.done?"on":""}`} onClick={()=>toggle(r.id)}
          role="checkbox" aria-checked={r.done} aria-label="Mark complete">
          {r.done ? <CheckCircle2 size={21}/> : <span className="m-rem-circle"/>}
        </button>
        <div className="m-rem-txt">
          <b>{r.text}</b>
          <span><Calendar size={11}/> {fmtRemDate(r.date)}</span>
        </div>
        <button className="m-rem-x" onClick={()=>remove(r.id)} aria-label="Delete reminder"><X size={13}/></button>
      </div>)}
      {s.reminders.length===0 && <div className="m-rem-empty">No reminders yet — add one above.</div>}
    </>}
  </div>;
}

/* Utility icons (desktop reference), folded into two buttons to keep the
   header uncluttered. Popovers are informational only — no live links yet. */

export const UTIL_ITEMS = [
  {id:"support", Icon:HelpCircle, label:"Support", items:["Help","Open Case"]},
  {id:"dash", Icon:LayoutGrid, label:"Dashboards",
    items:["Sales Incentive Calendar","Sales Comp Portal"]},
];

export function UtilityIcons({ipad=false}) {
  const [open, setOpen] = useState(null);
  const cur = UTIL_ITEMS.find(u=>u.id===open);
  return <div className={`m-utils ${ipad?"i-utils":""}`}>
    {UTIL_ITEMS.map(u=>
      <button key={u.id} className={`m-util-btn ${open===u.id?"on":""}`} aria-label={u.label}
        aria-expanded={open===u.id} onClick={()=>setOpen(open===u.id?null:u.id)}>
        <u.Icon size={ipad?17:15}/>
      </button>)}
    {cur && <>
      <div className="m-notif-overlay m-util-overlay" onClick={()=>setOpen(null)}/>
      <div className="m-util-pop">
        {cur.items
          ? <><b className="m-util-pop-title">{cur.label}</b>
              {cur.items.map(d=><span key={d} className="m-util-pop-item">{d}</span>)}</>
          : <span className="m-util-pop-label">{cur.label}</span>}
      </div>
    </>}
  </div>;
}

/* Manager "seller view" strip — shown under the header while viewing a
   team member's data from Team View (desktop reference: blue banner with
   the seller's initials and an Exit Seller View action). */

export function SellerViewBanner({s}) {
  if (!s.sellerView || s.viewMode!=="me") return null;
  return <div className="m-sellerview">
    <span className="m-sellerview-av">{s.sellerView.initials}</span>
    <span className="m-sellerview-txt">Viewing data for <b>{s.sellerView.name}</b></span>
    <button className="m-sellerview-exit" onClick={s.exitSellerView}><X size={13}/> Exit Seller View</button>
  </div>;
}

/* Universal mobile header — avatar, name/role, bell with unread count.
   Shown on every mobile page so the top of the app reads consistently. */

export function MobileHeader({s}) {
  return <>
    <div className="m-header">
      <div className="m-header-left">
        <img src="https://randomuser.me/api/portraits/men/32.jpg" className="m-avatar" alt=""/>
        <h1>Alex Johnson</h1>
      </div>
      <div className="m-header-actions">
        <button className="m-util-btn" aria-label="Search orders" onClick={()=>s.setOrderPopOpen(true)}><Search size={16}/></button>
        <UtilityIcons/>
        <div className="m-bell" onClick={()=>s.setNotifOpen(!s.notifOpen)}>
          <Bell size={18}/>{s.notifs.length>0 && <span className="m-bell-count">{s.notifs.length}</span>}
        </div>
      </div>
    </div>
    <SellerViewBanner s={s}/>
    {s.notifOpen && <><div className="m-notif-overlay" onClick={()=>s.setNotifOpen(false)}/>
      <NotifDropdown s={s} onClose={()=>s.setNotifOpen(false)}/></>}
    {s.orderPopOpen && <OrderQuickSearch s={s} onClose={()=>s.setOrderPopOpen(false)}/>}
  </>;
}

/* Quick order search — header magnifier on every mobile page. Replaces the
   Order Search nav tab for the common case: search here, land on results.
   The full page (all 8 search-by types + filters) stays one tap away. */
