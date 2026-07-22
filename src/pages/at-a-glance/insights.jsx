import { useState } from "react";
import { Bell, ChevronDown, Layers } from "lucide-react";
import { INSIGHT_INDEX, insightCards } from "../../data/insights.js";
import { cvt, maskText } from "../../lib/core.js";

export function InsightCard({badge, badgeColor, tag, title, children}) {
  const [open, setOpen] = useState(false);
  return <div className="m-insight-card" role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-insight-top">
      <span className="m-insight-badge" style={{color:badgeColor, borderColor:badgeColor}}>{badge}</span>
      {tag}
    </div>
    <div className="m-insight-title-row">
      <b className="m-insight-title">{title}</b>
      <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    {open && <p className="m-insight-desc">{children}</p>}
  </div>;
}

/* Insights section body (mobile + iPad): the seller's pinned Insight Canvas
   picks, or the AI-selected cards when nothing is pinned. */

export function InsightCardsList({s}) {
  const pinned = INSIGHT_INDEX.filter(it=>s.pinnedInsights.includes(it.id));
  if (!pinned.length) return <>{insightCards.map((c,i)=>
    <InsightCard key={i} badge={c.peBadge} badgeColor={c.peColor} title={c.title}
      tag={<span className="m-insight-tag" style={{color:c.tagColor}}>{cvt(c.tag)}</span>}>
      {maskText(c.desc)}
    </InsightCard>)}</>;
  return <>{pinned.map(it=>
    <InsightCard key={it.id} badge={it.cat} badgeColor={it.catColor} title={it.title}
      tag={it.live ? <span className="ic-live">LIVE</span> : null}>
      {it.desc}
    </InsightCard>)}</>;
}

/* Section header button that opens the Insight Canvas */
export function InsightCanvasBtn({s}) {
  return <button className="m-goalsheet-btn" onClick={()=>s.setInsightCanvasOpen(true)}>
    <Layers size={13}/> Insight Canvas{s.pinnedInsights.length>0 && ` · ${s.pinnedInsights.length}`}
  </button>;
}

/* At A Glance Insights — collapsed to a single header row by default;
   tapping expands to the Insight Canvas button + cards (mobile + iPad) */

export function AagInsightsSection({s, defaultOpen=false, className=""}) {
  const [open, setOpen] = useState(defaultOpen);
  const count = s.pinnedInsights.length || insightCards.length;
  const toggle = () => setOpen(o=>!o);
  return <div className={`m-section ${className}`}>
    <div className={`m-section-hdr m-insights-hdr ${open?"":"closed"}`} role="button" tabIndex={0}
      aria-expanded={open} onClick={toggle}
      onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); toggle(); } }}>
      <h2>Insights</h2>
      <span className="m-badge">{count}</span>
      {open && <span className="m-insights-canvas" onClick={e=>e.stopPropagation()}><InsightCanvasBtn s={s}/></span>}
      <ChevronDown size={16} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    {open && <InsightCardsList s={s}/>}
  </div>;
}

/* Bell dropdown — Notifications | My Reminders tabs (desktop reference).
   Reminders live in app state so they persist across pages and devices. */
