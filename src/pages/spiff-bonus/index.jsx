import { useState } from "react";
import { ChevronDown, Trophy } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { SPIFF_PAID_YTD, SPIFF_PERIODS, SPIFF_PROJECTED, SPIFF_STATUSES, SPIFF_STATUS_COLOR, SPIFF_TYPES, SPIFF_TYPE_COLOR, filterSpiffs } from "../../data/spiffs.js";
import { amt } from "../../lib/core.js";
import { MobileHeader } from "../../shared/chrome.jsx";

export function SpiffStatPills() {
  return <div className="m-spf-pills">
    <div className="m-spf-pill"><small>Projected Earnings</small><b>{amt(SPIFF_PROJECTED)}</b></div>
    <div className="m-spf-pill m-spf-pill-paid"><small>Paid YTD</small><b>{amt(SPIFF_PAID_YTD)}</b></div>
  </div>;
}

export function SpiffFilterRow({s}) {
  const f = s.spiffFilters;
  const set = k => e => s.setSpiffFilters(prev=>({...prev, [k]:e.target.value}));
  const count = filterSpiffs(f).length;
  return <div className="m-spf-filters">
    <label>Period: <select value={f.period} onChange={set("period")}>{SPIFF_PERIODS.map(o=><option key={o}>{o}</option>)}</select></label>
    <label>Status: <select value={f.status} onChange={set("status")}>{SPIFF_STATUSES.map(o=><option key={o}>{o}</option>)}</select></label>
    <label>Type: <select value={f.type} onChange={set("type")}>{SPIFF_TYPES.map(o=><option key={o}>{o}</option>)}</select></label>
    <span className="m-spf-count">{count} incentive{count===1?"":"s"}</span>
  </div>;
}

/* One incentive program. Collapsed keeps the essentials (name, projected,
   chips, progress bar); tapping the card expands the description and
   criteria fine print — same dropdown pattern as the insight cards. */

export function SpiffProgramCard({p}) {
  const [open, setOpen] = useState(false);
  return <div className="m-spf-card" style={{borderLeftColor:SPIFF_TYPE_COLOR[p.type]}}
    role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-spf-card-top">
      <b className="m-spf-name">{p.name}</b>
      <div className="m-spf-proj"><b>{amt(p.projected)}</b><small>Projected Earnings</small></div>
    </div>
    <div className="m-spf-tags">
      <span className="m-spf-type" style={{color:SPIFF_TYPE_COLOR[p.type], background:SPIFF_TYPE_COLOR[p.type]+"1a"}}>{p.type}</span>
      <span className="m-spf-status" style={{color:SPIFF_STATUS_COLOR[p.status], borderColor:SPIFF_STATUS_COLOR[p.status]+"66", background:SPIFF_STATUS_COLOR[p.status]+"14"}}>{p.status}</span>
      <span className="m-spf-more">Details <ChevronDown size={12} className={`m-insight-chev ${open?"open":""}`}/></span>
    </div>
    <div className="m-spf-prog-row"><span>Progress</span><b>{amt(p.earned)} / {amt(p.target)}</b></div>
    <div className="m-spf-bar"><div className="m-spf-fill" style={{width:p.pct+"%", background:p.pct===100?"var(--green)":"var(--accent)"}}/></div>
    <small className="m-spf-pct">{p.pct}% complete</small>
    {open && <div className="m-spf-details">
      <p className="m-spf-desc">{p.desc}</p>
      <div className="m-spf-crit">
        <span><b>Criteria:</b> {p.criteria}</span>
        <small>{p.dates}</small>
      </div>
    </div>}
  </div>;
}

export function SpiffBonusPage({s}) {
  const list = filterSpiffs(s.spiffFilters);
  const visible = s.spiffExpanded ? list : list.slice(0,2);
  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>SPIFF & Bonus</h1>
    <p className="m-team-sub">SPIFFs, uplifts, bonuses, and other strategic incentive programs.</p>
    <SpiffStatPills/>
    <SpiffFilterRow s={s}/>
    {visible.map(p=><SpiffProgramCard key={p.name} p={p}/>)}
    {list.length>2 && <button className="m-showall" onClick={()=>s.setSpiffExpanded(!s.spiffExpanded)}>
      {s.spiffExpanded ? "Show Fewer" : `See All ${list.length} Incentives`}
      <ChevronDown size={14} className={s.spiffExpanded?"up":""}/>
    </button>}
    {list.length===0 && <div className="m-search-empty"><Trophy size={30}/><b>No incentives match</b><span>Loosen the filters to see more programs.</span></div>}
  </div>;
}


export function IPadSpiff({s}) {
  const list = filterSpiffs(s.spiffFilters);
  const visible = s.spiffExpanded ? list : list.slice(0,2);
  return <div className="i-page">
    <IPadHeader title="SPIFF & Bonus" sub="SPIFFs, uplifts, bonuses, and other strategic incentive programs." s={s} right={<SpiffStatPills/>}/>
    <SpiffFilterRow s={s}/>
    {list.length>0 ? <div className="i-grid-3">{visible.map(p=><SpiffProgramCard key={p.name} p={p}/>)}</div>
      : <div className="m-search-empty"><Trophy size={30}/><b>No incentives match</b><span>Loosen the filters to see more programs.</span></div>}
    {list.length>2 && <button className="m-showall" onClick={()=>s.setSpiffExpanded(!s.spiffExpanded)}>
      {s.spiffExpanded ? "Show Fewer" : `See All ${list.length} Incentives`}
      <ChevronDown size={14} className={s.spiffExpanded?"up":""}/>
    </button>}
  </div>;
}
