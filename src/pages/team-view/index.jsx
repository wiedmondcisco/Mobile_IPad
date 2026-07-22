import { useState } from "react";
import { Calendar, ChevronDown, Layers, Menu, Target, X } from "lucide-react";
import { IPadHeader } from "../../app/ipad.jsx";
import { PE_COLOR, peBadgeStyle } from "../../lib/brand.js";
import { REFRESH_NOTE, cvt } from "../../lib/core.js";
import { HistPage } from "./history.jsx";
import { MobileHeader } from "../../shared/chrome.jsx";
import { AttainDonut, Expandable, FullScreenPopup } from "../../shared/primitives.jsx";

export const TEAM_AS_OF = "All data as of May 26, 2026, 6:00 AM";

export const STATUS_COLOR = {
  "Exceeding":"#74bf4b", "On Track":"#0077c2", "Watch":"#fbab2c", "At Risk":"#e3241b"
};

/* earned = Earned vs Target Incentive %, bookings = Bookings Attainment %,
   revAtt = card revenue attainment, figures in $ */

export const teamSellers = [
  {name:"Sarah Chen",    earned:107.1, bookings:115.6},
  {name:"Lisa Kumar",    earned:106.3, bookings:112.0},
  {name:"Mike Torres",   earned:97.3,  bookings:107.5},
  {name:"Maya Chen",     earned:94.2,  bookings:96.4},
  {name:"Priya Shah",    earned:90.4,  bookings:92.5},
  {name:"Jordan Rivera", earned:78.6,  bookings:81.3},
  {name:"Bob Wilson",    earned:71.3,  bookings:70.0},
  {name:"John Smith",    earned:69.3,  bookings:71.3},
  {name:"Daniel Kim",    earned:67.0,  bookings:66.2},
  {name:"Rachel Lee",    earned:65.3,  bookings:65.0},
  {name:"Marcus Green",  earned:54.4,  bookings:54.4}
];

/* Seller performance cards — Top 5 shown first, expandable to all 10.
   Each member carries per-PE attainment for the three chip tiles. */

export const GS_PERIOD = "GS: 26-Jan-2026 – 26-Jul-2026";

export const MEMBER_PE_META = [
  {id:"PE1", label:"Prod+Services"},
  {id:"PE2", label:"Annuity"},
  {id:"PE3", label:"Strategic"}
];

/* tones = per-PE tier color for chip + % (g green, b blue, a amber, r red) */
export const TONE_COLOR = {g:"#74bf4b", b:"#0077c2", a:"#fbab2c", r:"#e3241b"};

export const teamMembers = [
  {name:"Sarah Chen",    initials:"SC", status:"Exceeding", att:107, pe:[115,116,117], tones:["g","g","g"]},
  {name:"Lisa Kumar",    initials:"LK", status:"Exceeding", att:106, pe:[112,113,110], tones:["g","g","g"]},
  {name:"Mike Torres",   initials:"MT", status:"On Track",  att:97,  pe:[108,104,113], tones:["g","g","g"]},
  {name:"Maya Chen",     initials:"MC", status:"On Track",  att:94,  pe:[96,93,94],    tones:["g","g","g"]},
  {name:"Priya Shah",    initials:"PS", status:"On Track",  att:90,  pe:[92,90,87],    tones:["g","g","b"]},
  {name:"Jordan Rivera", initials:"JR", status:"On Track",  att:78,  pe:[81,76,74],    tones:["g","b","a"]},
  {name:"Bob Wilson",    initials:"BW", status:"Watch",     att:71,  pe:[64,76,77],    tones:["r","a","b"]},
  {name:"John Smith",    initials:"JS", status:"Watch",     att:69,  pe:[65,76,80],    tones:["r","a","b"]},
  {name:"Daniel Kim",    initials:"DK", status:"Watch",     att:67,  pe:[63,74,69],    tones:["a","a","a"]},
  {name:"Rachel Lee",    initials:"RL", status:"Watch",     att:65,  pe:[61,69,70],    tones:["r","a","a"]},
  {name:"Marcus Green",  initials:"MG", status:"At Risk",   att:54,  pe:[50,56,63],    tones:["r","r","r"]}
];

/* Team Insights — Canvas cards (supportive coaching tone; dismissible) */
export const teamInsights = [
  {title:"4 Sellers Need Coaching", tag:"Coaching", metric:"4 need support", color:"#fbab2c",
    desc:"Four sellers are currently below the expected attainment pace (below 70%). Early coaching can improve attainment and increase payout opportunities before period end.",
    action:"Recommended focus: John Smith, Daniel Kim, Rachel Lee, Marcus Green — Review pipeline, backlog, and upcoming opportunities with these sellers.",
    names:"John Smith, Daniel Kim, Rachel Lee +1 more"},
  {title:"Goal Coverage Health", tag:"Coverage", metric:"74%", color:"#0077c2",
    desc:"Your team has achieved $2.33M in bookings toward a $3.15M combined goal. You're building strong momentum — only $0.82M remains to reach full goal coverage.",
    action:"Keep the momentum going! Focus on advancing high-probability opportunities and converting qualified pipeline to close the remaining gap before period end."},
  {title:"Performance Spread — Opportunity to Level Up", tag:"Performance", metric:"Level up", color:"#fbab2c",
    desc:"Your team is making solid progress. Top performers are leading the way at 107%, while emerging sellers at 54% have strong opportunities to increase attainment with focused coaching and collaboration.",
    action:"Encourage peer mentoring, pipeline reviews, and deal strategy sessions to help more sellers achieve their goals this period. Pair top performers with emerging sellers: connect Sarah Chen with John Smith, Lisa Kumar with Bob Wilson.",
    names:"John Smith, Bob Wilson, Marcus Green +1 more"},
  {title:"Team Attainment Distribution", tag:"Attainment", metric:"81.9%", color:"#74bf4b",
    desc:"Team of 11 averaging 81.9% attainment. Distribution: 2 exceeding goal, 4 on track (75–100%), 5 building momentum.",
    action:"5 sellers building momentum — review deal strategy to accelerate this period."},
  {title:"Top Performers — Celebrate & Scale", tag:"Recognition", metric:"2 exceeding goal", color:"#74bf4b",
    desc:"2 team members exceeding goal at 106.7% average attainment. Great opportunity to share winning strategies across the team.",
    action:"Recognize excellence: Sarah Chen, Lisa Kumar. Consider peer-led knowledge sharing.",
    names:"Sarah Chen, Lisa Kumar"},
  {title:"Forecasted End-of-Period Attainment", tag:"Forecast", metric:"96.2%", color:"#0077c2",
    desc:"Based on current pace (66% of period elapsed), team is projected to finish at 96.2% — close to full goal.",
    action:"Accelerate 3–4 deals in late stages to push team over 100% by period close."}
];

/* Team chart row derivations (shared by mobile + iPad) */
export function teamEarnedRows() {
  return [...teamSellers].map(sel=>({...sel, val:sel.earned})).sort((a,b)=>b.val-a.val);
}

export const TEAM_PE_FACTOR = {PE1:1, PE2:0.93, PE3:1.05};

export function teamBookingRows(pe) {
  return [...teamSellers].map(sel=>({...sel, val:Math.min(130, sel.bookings*TEAM_PE_FACTOR[pe])})).sort((a,b)=>b.val-a.val);
}
/* Status pill (theme-agnostic — color-tinted from the tier color);
   optionally carries the overall attainment: "Exceeding · 107%" */

export function StatusPill({status, att}) {
  const c = STATUS_COLOR[status];
  return <span className="m-tstat" style={{color:c, borderColor:c+"66", background:c+"1f"}}>{status}{att!=null && ` · ${att}%`}</span>;
}

/* Tier color from a metric value (matches the desktop's per-chart coloring) */
export function tierColor(v) {
  if (v >= 100) return STATUS_COLOR["Exceeding"];
  if (v >= 75)  return STATUS_COLOR["On Track"];
  if (v >= 60)  return STATUS_COLOR["Watch"];
  return STATUS_COLOR["At Risk"];
}

/* Horizontal attainment bars, one per seller, colored by that chart's value.
   Highest-first, collapsed to the first 5 rows of the active view. "Show All"
   works on every view, not just the main one — expanding always reveals the
   whole team so a filtered view can still be compared in context. */

export function AttainmentChart({title, subtitle, rows, allRows=rows, control}) {
  const SCALE = 120;                       // bar axis maxes at 120%
  const markerPos = (100/SCALE)*100;
  const [expanded, setExpanded] = useState(false);
  const sorted = [...(expanded ? allRows : rows)].sort((a,b)=> b.val-a.val);
  const visible = expanded ? sorted : sorted.slice(0,5);
  return <div className="m-section">
    <div className="m-section-hdr"><h2>{title}</h2>{control}</div>
    <div className="m-team-chart-controls">
      <small className="m-team-chart-sub">{subtitle}</small>
    </div>
    {!expanded && rows.length===0 && <div className="m-pb-empty">No sellers match this view.</div>}
    <div className="m-abars">
      {visible.map(r=>{
        const c = tierColor(r.val);
        return <div key={r.name} className="m-abar-row">
          <span className="m-abar-name">{r.name}</span>
          <div className="m-abar-track">
            <div className="m-abar-fill" style={{width:Math.min(r.val,SCALE)/SCALE*100+"%", background:c}}/>
            <div className="m-abar-goal" style={{left:markerPos+"%"}}/>
          </div>
          <span className="m-abar-val" style={{color:c}}>{r.val.toFixed(1)}%</span>
        </div>;
      })}
    </div>
    <div className="m-abar-legend">
      {Object.keys(STATUS_COLOR).map(s=><span key={s}><i style={{background:STATUS_COLOR[s]}}/>{s}</span>)}
      <span><i className="m-abar-goal-key"/>Goal</span>
    </div>
    {allRows.length > Math.min(rows.length, 5) && <button className="m-showall m-showall-tight" onClick={()=>setExpanded(!expanded)}>
      {expanded ? "Show Fewer" : `Show All ${allRows.length} Sellers`}
      <ChevronDown size={14} className={expanded?"up":""}/>
    </button>}
  </div>;
}

/* One seller performance card (reference design: status·att pill, goal
   sheet period, three per-PE attainment tiles). Whole card opens the
   member's breakdown popup. */

export function MemberCard({m, onOpen, onView}) {
  const [open, setOpen] = useState(false);   // collapsed row by default; chevron expands details
  return <div className={`m-member-card ${open?"m-member-open":""}`} role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-member-top">
      <span className="m-seller-av">{m.initials}</span>
      <div className="m-member-id">
        {/* the highlighted name drills into the seller's At A Glance (manager seller view) */}
        <b className="m-member-name-link" role="link" tabIndex={0} title={`View ${m.name}'s data`}
          onClick={e=>{ e.stopPropagation(); onView(); }}
          onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); e.stopPropagation(); onView(); } }}>{m.name}</b>
        <StatusPill status={m.status} att={m.att}/>
      </div>
      <ChevronDown size={16} className={`m-member-chev ${open?"open":""}`}/>
    </div>
    {open && <>
      <div className="m-member-gs">{GS_PERIOD}</div>
      <div className="m-member-pes">
        {MEMBER_PE_META.map((meta,i)=>{
          const tone = TONE_COLOR[m.tones[i]];
          return <div key={meta.id} className="m-member-pe">
            <span className="m-member-pe-chip" style={{color:tone, borderColor:tone+"88"}}>{meta.id}</span>
            <small>{meta.label}</small>
            <b style={{color:tone}}>{m.pe[i]}%</b>
          </div>;
        })}
      </div>
      <button className="m-member-breakdown" onClick={e=>{e.stopPropagation(); onOpen();}}>Full breakdown →</button>
    </>}
  </div>;
}

/* Per-member PE breakdown popup (opened from a seller card) */
export function SellerBreakdownPopup({s, onClose}) {
  return <FullScreenPopup title={s.name} subtitle={`Plan-element breakdown · ${GS_PERIOD}`} onClose={onClose}>
    <div className="m-sb-summary">
      <div><small>Status</small><b style={{color:STATUS_COLOR[s.status]}}>{s.status}</b></div>
      <div><small>Attainment</small><b style={{color:STATUS_COLOR[s.status]}}>{s.att}%</b></div>
      <div><small>Plan Elements</small><b>{s.pe.length}</b></div>
    </div>
    {MEMBER_PE_META.map((meta,i)=><div key={meta.id} className="m-gs-row">
      <div className="m-gs-row-top">
        <AttainDonut pct={s.pe[i]} color={PE_COLOR[meta.id]} size={64} stroke={9} sub=""/>
        <div className="m-gs-row-info">
          <div className="m-gs-row-hdr"><span className="m-pe-badge" style={peBadgeStyle(meta.id)}>{meta.id}</span><b>{meta.label}</b></div>
          <span className="m-gs-goal">{s.pe[i]}% attainment</span>
        </div>
      </div>
    </div>)}
    <p className="m-gs-note">Read-only manager view · figures reflect the current selling period.</p>
  </FullScreenPopup>;
}

/* ── Shared Team Dashboard sections (mobile + iPad render the same
      content; only the wrapping grid class differs) ── */

export function TeamControls({s}) {
  return <div className="m-team-controls">
    <span className="m-team-period">Period</span>
    <button className="m-team-ctl">H1 2026 <ChevronDown size={13}/></button>
    <button className="m-team-ctl" onClick={()=>s.setHistView(true)}>Historical Trend</button>
  </div>;
}

/* ── Team views — preset filters plus user-saved views (name + delete).
   "My Watch List" is the coaching-focus roster from the team insight;
   Top Performers = ≥100% on the metric; At Risk Focus = under 60% on
   charts / under 72% attainment for seller cards. */

export const TEAM_WATCH_LIST = ["John Smith","Daniel Kim","Rachel Lee","Marcus Green"];

export const TEAM_VIEW_PRESETS = [
  {id:"watch", label:"My Watch List"},
  {id:"top", label:"Top Performers"},
  {id:"risk", label:"At Risk Focus"}
];

export function teamViewFilters(s) {
  const saved = s.savedViews.find(v=>v.id===s.teamView);
  const view = saved ? saved.view : s.teamView;
  return {
    row: r => view==="watch" ? TEAM_WATCH_LIST.includes(r.name) : view==="top" ? r.val>=100 : view==="risk" ? r.val<60 : true,
    member: m => view==="watch" ? TEAM_WATCH_LIST.includes(m.name) : view==="top" ? m.att>=100 : view==="risk" ? m.att<72 : true
  };
}

export function TeamViewsBar({s}) {
  const [naming, setNaming] = useState(false);
  const [name, setName] = useState("");
  const active = s.teamView;
  const save = () => {
    const nm = name.trim();
    if (!nm) return;
    /* snapshot resolves a saved view back to its underlying preset */
    const view = s.savedViews.find(x=>x.id===active)?.view || active;
    s.setSavedViews(v=>[...v, {id:"sv-"+Date.now(), name:nm, view, pe:s.teamPe}]);
    setNaming(false); setName("");
  };
  const remove = id => {
    s.setSavedViews(v=>v.filter(x=>x.id!==id));
    if (active===id) s.setTeamView("all");
  };
  return <div className="m-tviews">
    <span className="m-tviews-lbl">Views:</span>
    {TEAM_VIEW_PRESETS.map(p=><button key={p.id} className={`m-tview-chip ${active===p.id?"on":""}`}
      onClick={()=>s.setTeamView(active===p.id ? "all" : p.id)} aria-pressed={active===p.id}>
      {active===p.id && <i className="m-tview-dot"/>}{p.label}
    </button>)}
    {s.savedViews.map(v=><span key={v.id} className={`m-tview-chip m-tview-saved ${active===v.id?"on":""}`}>
      <button className="m-tview-name" onClick={()=>{s.setTeamView(v.id); s.setTeamPe(v.pe);}}>
        {active===v.id && <i className="m-tview-dot"/>}{v.name}
      </button>
      <button className="m-tview-x" aria-label={`Delete view ${v.name}`} onClick={()=>remove(v.id)}><X size={11}/></button>
    </span>)}
    <button className="m-tview-chip m-tview-reset" disabled={active==="all"} onClick={()=>s.setTeamView("all")}>Reset</button>
    {naming
      ? <span className="m-tview-savebar">
          <input value={name} onChange={e=>setName(e.target.value)} placeholder="View name..." autoFocus
            onKeyDown={e=>{ if (e.key==="Enter") save(); if (e.key==="Escape") { setNaming(false); setName(""); } }}/>
          <button className="m-tview-save" onClick={save}>Save</button>
          <button className="m-tview-cancel" onClick={()=>{setNaming(false); setName("");}}>Cancel</button>
        </span>
      : <button className="m-tview-add" onClick={()=>setNaming(true)}>+ Save Current View</button>}
  </div>;
}

export function TeamMembersSection({s, gridClass="", members=teamMembers}) {
  /* Highest attainment first (reference order); the views bar handles who
     to focus on, so there's no separate sort control here */
  const sorted = [...members].sort((a,b)=> b.att-a.att);
  const list = s.teamExpanded ? sorted : sorted.slice(0,2);
  return <>
    <div className="m-section-label"><Menu size={13} className="m-section-icon"/> SELLER PERFORMANCE
      <span className="m-label-right">{list.length} of {members.length}</span></div>
    <div className={gridClass}>
      {list.map(m=><MemberCard key={m.name} m={m} onOpen={()=>s.setSellerItem(m)} onView={()=>s.enterSellerView(m)}/>)}
    </div>
    {members.length===0 && <div className="m-pb-empty">No sellers match this view.</div>}
    {members.length>2 && <button className="m-showall" onClick={()=>s.setTeamExpanded(!s.teamExpanded)}>
      {s.teamExpanded ? "Show Fewer" : `Show All ${members.length} Sellers`}
      <ChevronDown size={14} className={s.teamExpanded?"up":""}/>
    </button>}
  </>;
}

/* One team insight — styled like the At A Glance insight cards: badge chip
   top-left, colored headline stat top-right, title + chevron below. Expanding
   reveals nested sub-dropdowns for the details and the recommended action. */

export function TeamInsightCard({c, onDismiss}) {
  const [open, setOpen] = useState(false);
  return <div className="m-tinsight" role="button" tabIndex={0} aria-expanded={open}
    onClick={()=>setOpen(o=>!o)}
    onKeyDown={e=>{ if (e.target!==e.currentTarget) return;
      if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
    <div className="m-insight-top">
      <span className="m-insight-badge" style={{color:c.color, borderColor:c.color}}>{c.tag}</span>
      <span className="m-tinsight-stat">
        <span className="m-insight-tag" style={{color:c.color}}>{cvt(c.metric)} ★</span>
        <button className="m-tinsight-x" aria-label="Dismiss insight" onClick={e=>{e.stopPropagation(); onDismiss();}}><X size={14}/></button>
      </span>
    </div>
    <div className="m-insight-title-row">
      <b className="m-insight-title">{c.title}</b>
      <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
    </div>
    {open && <div className="m-tinsight-body" onClick={e=>e.stopPropagation()}>
      <Expandable title="Details">
        <p className="m-tinsight-desc">{c.desc}</p>
      </Expandable>
      <Expandable title="Recommended action">
        <p className="m-tinsight-action">{c.action}</p>
        {c.names && <p className="m-tinsight-names">{c.names}</p>}
      </Expandable>
    </div>}
  </div>;
}

export function TeamInsightsSection({s, gridClass=""}) {
  const visible = teamInsights.map((c,i)=>({c,i})).filter(x=>!s.dismissedInsights.includes(x.i));
  return <>
    <div className="m-section-label" style={{marginTop:6}}><span className="m-section-icon">✦</span> TEAM INSIGHTS — CANVAS
      <span className="m-canvas-chip"><Layers size={11}/> Canvas ({visible.length})</span></div>
    <div className={gridClass}>
      {visible.map(({c,i})=><TeamInsightCard key={i} c={c}
        onDismiss={()=>s.setDismissedInsights([...s.dismissedInsights, i])}/>)}
    </div>
  </>;
}

/* TEAM DASHBOARD page (mobile) */
export function TeamPage({s}) {
  const pe = s.teamPe, setPe = s.setTeamPe;
  const vf = teamViewFilters(s);
  const allEarned = teamEarnedRows(), earnedRows = allEarned.filter(vf.row);
  const allBookings = teamBookingRows(pe), bookingRows = allBookings.filter(vf.row);

  if (s.histView) return <div className="m-page"><HistPage s={s}/></div>;

  return <div className="m-page">
    <MobileHeader s={s}/>
    <h1 className="m-page-title" style={{marginBottom:4}}>Team Dashboard</h1>
    <p className="m-team-sub">Overview of your team's performance for H1 2026</p>
    <div className="m-asof-banner"><span className="m-pcal-badge m-pcb-asof"><Calendar size={14}/></span><div className="m-asof-text"><span>{TEAM_AS_OF}</span><small>{REFRESH_NOTE}</small></div></div>

    {/* Period / trend / export controls */}
    <TeamControls s={s}/>

    {/* Preset + saved views filter everything below */}
    <TeamViewsBar s={s}/>

    {/* Earned vs Target Incentive */}
    <AttainmentChart title="Earned vs Target Incentive" subtitle="Current period, sorted highest to lowest earned." rows={earnedRows} allRows={allEarned}/>

    {/* Bookings Attainment (per plan element) */}
    <AttainmentChart title="Bookings Attainment" subtitle="Sorted by bookings. Bar shows progress toward individual goal." rows={bookingRows} allRows={allBookings}
      control={<div className="m-pe-select">{["PE1","PE2","PE3"].map(p=><button key={p} className={p===pe?"on":""} onClick={()=>setPe(p)}>{p}</button>)}</div>}/>

    <TeamMembersSection s={s} members={teamMembers.filter(vf.member)}/>
    <TeamInsightsSection s={s}/>
  </div>;
}


export function IPadTeam({s}) {
  const vf = teamViewFilters(s);
  const allEarned = teamEarnedRows(), earnedRows = allEarned.filter(vf.row);
  const allBookings = teamBookingRows(s.teamPe), bookingRows = allBookings.filter(vf.row);
  if (s.histView) return <div className="i-page"><HistPage s={s}/></div>;
  return <div className="i-page">
    <IPadHeader title="Team Dashboard" sub={`${TEAM_AS_OF} · ${REFRESH_NOTE}`} s={s}/>
    <TeamControls s={s}/>
    <TeamViewsBar s={s}/>
    <div className="i-split">
      <AttainmentChart title="Earned vs Target Incentive" subtitle="Current period, sorted highest to lowest earned." rows={earnedRows} allRows={allEarned}/>
      <AttainmentChart title="Bookings Attainment" subtitle="Sorted by bookings. Bar shows progress toward individual goal." rows={bookingRows} allRows={allBookings}
        control={<div className="m-pe-select">{["PE1","PE2","PE3"].map(pp=><button key={pp} className={pp===s.teamPe?"on":""} onClick={()=>s.setTeamPe(pp)}>{pp}</button>)}</div>}/>
    </div>
    <TeamMembersSection s={s} gridClass="i-grid-3" members={teamMembers.filter(vf.member)}/>
    <TeamInsightsSection s={s} gridClass="i-grid-3"/>
  </div>;
}

/* iPad Safari toolbar (top, iPadOS layout): back/forward on the left,
   centered address pill, share/new-tab/tabs on the right. Collapses to
   a slim domain strip on scroll-down, same as the phone. */
