import { ChevronLeft, Target } from "lucide-react";
import { amt } from "../../lib/core.js";

export const HIST_PERIODS = ["H2 2024","H1 2025","H2 2025","H1 2026"];

export const HIST_SHADE = {"H2 2024":"#8ecdf7","H1 2025":"#4aabf2","H2 2025":"#1e88e5","H1 2026":"#1565c0"};

/* per member: [earned, target, bookings, goal, att%] per period */
export const histData = {
  "Sarah Chen":   {trend:8.5, p:[[36800,38000,1320000,1400000,94.3],[40970,40500,1480000,1440000,102.8],[48200,45000,1850000,1600000,115.6],[24500,45000,980000,1600000,61.3]]},
  "Mike Torres":  {trend:5.6, p:[[33100,38000,1260000,1400000,90],[37230,40500,1376000,1440000,95.6],[43800,45000,1720000,1600000,107.5],[22800,45000,890000,1600000,55.6]]},
  "Lisa Kumar":   {trend:8.8, p:[[31400,34000,1180000,1300000,90.8],[36125,36000,1344000,1350000,99.6],[42500,40000,1680000,1500000,112],[22400,40000,840000,1500000,56]]},
  "Maya Chen":  {trend:7,   p:[[28200,34000,1080000,1300000,83.1],[33065,36000,1216000,1350000,90.1],[38900,40000,1520000,1500000,101.3],[19800,40000,760000,1500000,50.7]]},
  "Priya Shah": {trend:7.2, p:[[30500,38000,1050000,1400000,75],[35020,40500,1184000,1440000,82.2],[41200,45000,1480000,1600000,92.5],[20100,45000,720000,1600000,45]]},
  "Jordan Rivera":   {trend:6.2, p:[[26800,34000,960000,1300000,73.8],[30260,36000,1080000,1350000,80],[35600,40000,1350000,1500000,90],[17900,40000,680000,1500000,45.3]]},
  "John Smith":   {trend:3.3, p:[[23100,38000,840000,1400000,60],[26520,40500,912000,1440000,63.3],[31200,45000,1140000,1600000,71.3],[15200,45000,560000,1600000,35]]},
  "Bob Wilson":   {trend:2.2, p:[[21500,34000,780000,1300000,60],[24225,36000,840000,1350000,62.2],[28500,40000,1050000,1500000,70],[13800,40000,510000,1500000,34]]},
  "Rachel Lee":   {trend:4.3, p:[[19800,34000,700000,1300000,53.8],[22780,36000,784000,1350000,58.1],[26800,40000,980000,1500000,65.3],[12400,40000,460000,1500000,30.7]]},
  "Marcus Green": {trend:5.4, p:[[16200,38000,600000,1400000,42.9],[18785,40500,696000,1440000,48.3],[24300,45000,864000,1600000,54],[11250,45000,400000,1600000,25]]}
};

export const HIST_PE = {PE1:{name:"Prod+Services", f:1, w:1}, PE2:{name:"Recurring Software", f:.93, w:.6}, PE3:{name:"Services", f:1.06, w:.42}};

export const histRow = (member, pi, pe) => {
  const [e,t,b,g,a] = histData[member].p[pi];
  const {f,w} = HIST_PE[pe];
  return {earned:Math.round(e*w), target:Math.round(t*w), book:Math.round(b*f), goal:g, att:+Math.min(125, a*f).toFixed(1)};
};

export const fmtUsd = n => amt("$" + n.toLocaleString("en-US"));

export const histTier = a => a >= 100 ? "#16a34a" : a >= 70 ? "#d97706" : "#e3241b";

export function HistSingle({s}) {
  const pe = s.histPe, meta = HIST_PE[pe];
  const rows = HIST_PERIODS.map((p,i)=>({p, ...histRow(s.histMember, i, pe)})).filter(r=>s.histPeriods.includes(r.p));
  return <>
    <div className="m-section">
      <div className="m-section-hdr"><h2>{pe} — {meta.name}</h2></div>
      <div className="m-hist-tablewrap"><table className="m-hist-table">
        <thead><tr><th>Period</th><th>Earned</th><th>Target</th><th>{pe} Bookings</th><th>{pe} Goal</th><th className="r">{pe} Attainment %</th></tr></thead>
        <tbody>{rows.map(r=><tr key={r.p}>
          <td>{r.p}</td><td>{fmtUsd(r.earned)}</td><td>{fmtUsd(r.target)}</td><td>{fmtUsd(r.book)}</td><td>{fmtUsd(r.goal)}</td>
          <td className="r" style={{color:histTier(r.att), fontWeight:700}}>{r.att}%</td>
        </tr>)}</tbody>
      </table></div>
    </div>
    <div className="m-section">
      <div className="m-section-hdr"><h2>{pe} Attainment Trend</h2></div>
      <div className="m-hist-chart">
        {rows.map(r=><div key={r.p} className="m-hist-bargrp">
          <span className="m-hist-barlbl" style={{color:histTier(r.att)}}>{r.att}%</span>
          <div className="m-hist-bar" style={{height:Math.max(6, r.att/125*160)+"px"}}/>
          <span className="m-hist-barcap">{r.p}</span>
        </div>)}
      </div>
    </div>
  </>;
}

export function HistCompare({s}) {
  const pe = s.histPe;
  const members = s.histCmpMember==="All" ? Object.keys(histData) : [s.histCmpMember];
  const periods = HIST_PERIODS.map((p,i)=>({p,i})).filter(x=>s.histPeriods.includes(x.p));
  return <>
    <div className="m-section">
      <div className="m-section-hdr"><h2>{pe} Attainment Comparison</h2></div>
      <div className="m-hist-cmp-scroll"><div className="m-hist-cmp">
        {members.map(m=><div key={m} className="m-hist-cmp-grp">
          <div className="m-hist-cmp-bars">
            {periods.map(({p,i})=>{const r=histRow(m,i,pe);
              return <div key={p} className="m-hist-cmp-col">
                <span style={{color:histTier(r.att)}}>{Math.round(r.att)}%</span>
                <div style={{height:Math.max(4, r.att/125*110)+"px", background:HIST_SHADE[p]}}/>
              </div>;})}
          </div>
          <span className="m-hist-cmp-name">{m}</span>
        </div>)}
      </div></div>
      <div className="m-hist-legend">{periods.map(({p})=><span key={p}><i style={{background:HIST_SHADE[p]}}/>{p}</span>)}</div>
    </div>
    <div className="m-section">
      <div className="m-hist-tablewrap"><table className="m-hist-table m-hist-wide">
        <thead><tr><th>Team Member</th><th>Period</th><th>Earned</th><th>Target</th><th>{pe} Bookings</th><th>{pe} Goal</th><th className="r">{pe} Att %</th><th className="r">Trend</th></tr></thead>
        <tbody>{members.map(m=>periods.map(({p,i},idx)=>{const r=histRow(m,i,pe);
          return <tr key={m+p} className={idx===0?"m-hist-grp":""}>
            {idx===0 && <td rowSpan={periods.length} className="m-hist-member">{m}</td>}
            <td><span className={`m-hist-pchip ${p.startsWith("H1")?"h1":"h2"}`}>{p}</span></td>
            <td>{fmtUsd(r.earned)}</td><td>{fmtUsd(r.target)}</td><td>{fmtUsd(r.book)}</td><td>{fmtUsd(r.goal)}</td>
            <td className="r" style={{color:histTier(r.att), fontWeight:700}}>{r.att}%</td>
            {idx===0 && <td rowSpan={periods.length} className="r"><span className="m-hist-trendpill">▲ {histData[m].trend}%</span></td>}
          </tr>;}))}</tbody>
      </table></div>
    </div>
  </>;
}

export function HistPage({s}) {
  const mode = s.histMode;
  const togglePeriod = p => {
    const on = s.histPeriods.includes(p);
    s.setHistPeriods(on ? s.histPeriods.filter(x=>x!==p) : HIST_PERIODS.filter(x=>x===p||s.histPeriods.includes(x)));
  };
  return <>
    <div className="m-hist-top">
      <div>
        <h1 className="m-page-title" style={{marginBottom:2}}>Historical Performance Trend</h1>
        <p className="m-team-sub">{mode==="single" ? "Compare seller performance across goal sheet periods" : "Half-year comparisons side-by-side for easier analysis"}</p>
      </div>
      <button className="m-hist-back" onClick={()=>s.setHistView(false)}><ChevronLeft size={14}/> Back to Manager View</button>
    </div>
    <div className="m-hist-mode">
      <button className={mode==="single"?"on":""} onClick={()=>s.setHistMode("single")}>Single Member</button>
      <button className={mode==="compare"?"on":""} onClick={()=>s.setHistMode("compare")}>Compare Members</button>
    </div>
    <div className="m-hist-filters">
      <div className="m-hist-fgroup">
        <span className="m-hist-flbl">{mode==="single" ? "Goal Sheet Periods:" : "Select goal sheets to compare:"}</span>
        <div className="m-hist-periods">
          {HIST_PERIODS.map(p=>{const on=s.histPeriods.includes(p);
            return <button key={p} className={`m-hist-chk ${on?"on":""}`} onClick={()=>togglePeriod(p)}>
              <span className="m-hist-box">{on?"✓":""}</span>{p}
            </button>;})}
        </div>
      </div>
      <label className="m-hist-fgroup">
        <span className="m-hist-flbl">Team Member:</span>
        {mode==="single"
          ? <select className="m-hist-select" value={s.histMember} onChange={e=>s.setHistMember(e.target.value)}>
              {Object.keys(histData).map(m=><option key={m}>{m}</option>)}
            </select>
          : <select className="m-hist-select" value={s.histCmpMember} onChange={e=>s.setHistCmpMember(e.target.value)}>
              <option>All</option>{Object.keys(histData).map(m=><option key={m}>{m}</option>)}
            </select>}
      </label>
      <label className="m-hist-fgroup">
        <span className="m-hist-flbl">{mode==="single" ? "View PE:" : "Plan Element:"}</span>
        <select className="m-hist-select" value={s.histPe} onChange={e=>s.setHistPe(e.target.value)}>
          {Object.keys(HIST_PE).map(p=><option key={p}>{p}</option>)}
        </select>
      </label>
    </div>
    {mode==="single" ? <HistSingle s={s}/> : <HistCompare s={s}/>}
  </>;
}

