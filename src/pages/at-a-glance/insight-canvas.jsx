import { useState } from "react";
import { Search, X } from "lucide-react";
import { INSIGHT_CATS, MAX_PINS, insightCards } from "../../data/insights.js";

export function InsightCanvasCard({it, cat, s, onClose}) {
  const pinned = s.pinnedInsights.includes(it.id);
  const full = !pinned && s.pinnedInsights.length >= MAX_PINS;
  /* cap enforced inside the updater — render-time `full` is stale under rapid taps */
  const toggle = () => s.setPinnedInsights(prev =>
    prev.includes(it.id) ? prev.filter(x=>x!==it.id)
    : prev.length >= MAX_PINS ? prev
    : [...prev, it.id]);
  return <div className={`ic-card ${cat.fast?"ic-card-fast":""} ${pinned?"ic-pinned":""} ${full?"ic-maxed":""}`}
    style={cat.fast?{borderLeftColor:cat.color}:undefined}
    role="checkbox" aria-checked={pinned} tabIndex={0}
    onClick={toggle}
    onKeyDown={e=>{ /* target check: ignore keydown bubbling up from the CTA button */
      if (e.target!==e.currentTarget) return;
      if (e.key==="Enter"||e.key===" ") { e.preventDefault(); toggle(); }
    }}>
    <div className="ic-card-top">
      <span className={`ic-pin ${pinned?"on":""}`}/>
      <b>{it.title}</b>
      {it.live && <span className="ic-live">LIVE</span>}
    </div>
    {cat.fast && <span className="ic-fast-lbl" style={{color:cat.color}}>FAST START</span>}
    <p className="ic-desc">{it.desc}</p>
    <div className="ic-tags">{it.tags.map(t=><span key={t}>{t}</span>)}</div>
    {it.cta && <button className="ic-cta" onClick={e=>{e.stopPropagation(); onClose(); s.setTab(it.ctaTab);}}>{it.cta} →</button>}
  </div>;
}

export function InsightCanvasPopup({s, onClose}) {
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState("All Categories");
  const [requested, setRequested] = useState(false);
  const q = query.trim().toLowerCase();
  const nPins = s.pinnedInsights.length;
  return <div className="m-fs ic-fs">
    <div className="ic-hdr">
      <div className="ic-hdr-text">
        <b>Insight Canvas</b>
        <p>Pin up to <b>{MAX_PINS}</b> insights. No pins — AI selects {insightCards.length} insights for you.</p>
      </div>
      <button className="ic-close" onClick={onClose} aria-label="Close"><X size={17}/></button>
    </div>
    <div className="ic-tools">
      <div className="ic-search"><Search size={14}/><input placeholder="Search insights..." value={query} onChange={e=>setQuery(e.target.value)}/></div>
      <select className="ic-catsel" value={cat} onChange={e=>setCat(e.target.value)} aria-label="Filter by category">
        <option>All Categories</option>
        {INSIGHT_CATS.map(c=><option key={c.name}>{c.name}</option>)}
      </select>
    </div>
    <div className="m-fs-body ic-body">
      {INSIGHT_CATS.filter(c=>cat==="All Categories"||c.name===cat).map(c=>{
        const items = c.items.filter(it=>!q || (it.title+" "+it.desc).toLowerCase().includes(q));
        if (!items.length) return null;
        return <div key={c.name} className="ic-cat">
          <div className="ic-cat-hdr"><i style={{background:c.color}}/><h3>{c.name}</h3><span>({items.length})</span></div>
          <div className="ic-grid">
            {items.map(it=><InsightCanvasCard key={it.id} it={it} cat={c} s={s} onClose={onClose}/>)}
          </div>
        </div>;
      })}
      <div className="ic-cat">
        <div className="ic-cat-hdr"><i style={{background:"var(--accent)"}}/><h3>Request a Custom Insight</h3></div>
        <div className="ic-request">
          <span>{requested ? "Request submitted — the comp team will follow up." : "Don't see what you need? Submit a request for a custom insight tailored to your workflow."}</span>
          <button className="ic-req-btn" disabled={requested} onClick={()=>setRequested(true)}>
            {requested ? "✓ Request Sent" : "+ Request Custom Insight"}
          </button>
        </div>
      </div>
    </div>
    <div className="ic-foot">
      <span>{nPins===0 ? `No pins — AI selects ${insightCards.length} insights for you` : `${nPins} of ${MAX_PINS} pinned${nPins===MAX_PINS?" · max reached":""}`}</span>
      <button className="ic-done" onClick={onClose}>Done</button>
    </div>
  </div>;
}
