import { useState } from "react";
import { Search, X } from "lucide-react";
import { orders } from "../../data/orders.js";

export function OrderQuickSearch({s, onClose}) {
  const [type, setType] = useState("SO Number");
  const [q, setQ] = useState("");
  const go = () => {
    s.setOrderType(type); s.setOrderQuery(q.trim());
    s.setOrderStatus("All Statuses"); s.setOrderPe("All Plan Elements");
    s.setOrderSubmitted(!!q.trim());
    s.setTab("orders"); onClose();
  };
  return <>
    <div className="m-oq-overlay" onClick={onClose}/>
    <div className="m-oq" role="dialog" aria-label="Quick order search">
      <div className="m-oq-hdr"><Search size={15}/><b>Order Search</b>
        <button className="m-oq-x" onClick={onClose} aria-label="Close"><X size={16}/></button>
      </div>
      <div className="m-oq-types" role="tablist" aria-label="Search by">
        {["SO Number","Deal ID","PO Number"].map(t=>
          <button key={t} className={t===type?"on":""} onClick={()=>setType(t)}>{t}</button>)}
      </div>
      <div className="m-oq-field">
        <input placeholder={`Enter ${type}`} value={q} autoFocus
          onChange={e=>setQ(e.target.value)} onKeyDown={e=>e.key==="Enter"&&go()}/>
        <button className="m-oq-go" onClick={go}>Search</button>
      </div>
      <div className="m-oq-recent">
        <small>Recent orders</small>
        <div>{orders.slice(0,3).map(o=>
          <button key={o.id} onClick={()=>{ s.openOrder(o.id); onClose(); }}>{o.id}</button>)}</div>
      </div>
      <button className="m-oq-adv" onClick={()=>{ s.setTab("orders"); onClose(); }}>Advanced search & filters →</button>
    </div>
  </>;
}

/* At A Glance · SPIFF & Bonus — first 2 programs with a see-more toggle,
   shared by the mobile and iPad pages */
