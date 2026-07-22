import { useState } from "react";
import { Target } from "lucide-react";
import { cvt } from "../../lib/core.js";

/* ── Net Dollar Retention tab (reference-matched) ── */
export const NDR_TEAL = "#0083c9";

export const ndrStats = [
  {label:"Baseline ATR", value:"$3,520,090.00"},
  {label:"Eligible ACV Bookings", value:"$452,330.00"},
  {label:"Achievement", value:"12.85%", hot:true},
  {label:"Target", value:"100%"}
];

export const ndrTrend = [["Jan",1.65],["Feb",3.64],["Mar",6.05],["Apr",9.16],["May",12.85]];

export const ndrAcv   = [["Jan",58],["Feb",70],["Mar",85],["Apr",109.33],["May",130]];

export const ndrTxns = [
  {cat:"NET DOLLAR RETENTION Plan", atr:"$3,520,090.00", acv:"$452,330.00", kind:"plan"},
  {cat:"View Node Summary", kind:"link"},
  {cat:"View All Transactions", kind:"bold"},
  {cat:"Systematic Transactions", atr:"$3,520,090.00", acv:"$420,330.00", kind:"sub"},
  {cat:"Manual Transactions", acv:"$32,000.00", kind:"sub"}
];

export const ndrNodes = [
  {node:"West Region",    atr:"$1,280,040.00", acv:"$185,200.00", pct:"14.47%"},
  {node:"East Region",    atr:"$1,120,025.00", acv:"$142,800.00", pct:"12.75%"},
  {node:"Central Region", atr:"$680,015.00",   acv:"$78,330.00",  pct:"11.52%"},
  {node:"APAC Region",    atr:"$440,010.00",   acv:"$46,000.00",  pct:"10.45%"}
];

/* Shared chart frame: 320×150 viewBox, hover resolves to the nearest data index */
export const NDR_CH = {W:320, H:150, L:36, R:12, T:10, B:22};

export function useNdrHover(xOf, count) {
  const [hov, setHov] = useState(null);
  const onMouseMove = e => {
    const r = e.currentTarget.getBoundingClientRect();
    const x = (e.clientX - r.left) * (NDR_CH.W / r.width);
    let best = 0;
    for (let i = 1; i < count; i++) if (Math.abs(xOf(i)-x) < Math.abs(xOf(best)-x)) best = i;
    setHov(best);
  };
  return [hov, {onMouseMove, onMouseLeave:()=>setHov(null)}];
}

export function NdrTip({x, y, label, value}) {
  const {W, H} = NDR_CH;
  return <div className={`m-ndr-tip ${x > W*0.62 ? "flip" : ""}`} style={{left:`${(x/W)*100}%`, top:`${(y/H)*100}%`}}>
    <small>{label}</small><b>{value}</b>
  </div>;
}

export function NdrTrendChart() {
  const {W, H, L, R, T, B} = NDR_CH, plotW = W-L-R, plotH = H-T-B, MAX = 16;
  const px = i => L + (i/(ndrTrend.length-1))*plotW;
  const py = v => T + plotH - (v/MAX)*plotH;
  const [hov, hoverProps] = useNdrHover(px, ndrTrend.length);
  const line = ndrTrend.map((d,i)=>`${i?"L":"M"}${px(i)},${py(d[1])}`).join(" ");
  return <div className="m-ndr-chart" {...hoverProps}>
    <svg viewBox={`0 0 ${W} ${H}`} aria-label="NDR achievement trend by month">
      <defs><linearGradient id="ndrTrendFill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={NDR_TEAL} stopOpacity=".16"/><stop offset="100%" stopColor={NDR_TEAL} stopOpacity="0"/>
      </linearGradient></defs>
      {[0,4,8,12,16].map(v=><g key={v}>
        <line x1={L} x2={W-R} y1={py(v)} y2={py(v)} stroke="var(--border)" strokeDasharray="3 3" strokeWidth=".7"/>
        <text x={L-5} y={py(v)+2.5} textAnchor="end" className="m-ndr-axis">{v}%</text>
      </g>)}
      {ndrTrend.map((d,i)=><text key={d[0]} x={px(i)} y={H-6} textAnchor={i===0?"start":i===ndrTrend.length-1?"end":"middle"} className="m-ndr-axis">{d[0]}</text>)}
      <path d={`${line} L${px(ndrTrend.length-1)},${T+plotH} L${px(0)},${T+plotH} Z`} fill="url(#ndrTrendFill)"/>
      {hov!=null && <line x1={px(hov)} x2={px(hov)} y1={T} y2={T+plotH} stroke="var(--muted)" strokeWidth=".8" opacity=".55"/>}
      <path d={line} fill="none" stroke={NDR_TEAL} strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"/>
      {ndrTrend.map((d,i)=><circle key={i} cx={px(i)} cy={py(d[1])} r="3.6"
        fill={hov===i?NDR_TEAL:"var(--card)"} stroke={NDR_TEAL} strokeWidth="1.7"/>)}
    </svg>
    {hov!=null && <NdrTip x={px(hov)} y={py(ndrTrend[hov][1])} label={ndrTrend[hov][0]} value={`NDR % : ${ndrTrend[hov][1]}%`}/>}
  </div>;
}

export function NdrAcvChart() {
  const {W, H, L, R, T, B} = NDR_CH, plotW = W-L-R, plotH = H-T-B, MAX = 140, bw = 15;
  const slot = plotW/ndrAcv.length;
  const bx = i => L + slot*i + slot/2;
  const py = v => T + plotH - (v/MAX)*plotH;
  const [hov, hoverProps] = useNdrHover(bx, ndrAcv.length);
  return <div className="m-ndr-chart" {...hoverProps}>
    <svg viewBox={`0 0 ${W} ${H}`} aria-label="Monthly eligible ACV">
      {[0,35,70,105,140].map(v=><g key={v}>
        <line x1={L} x2={W-R} y1={py(v)} y2={py(v)} stroke="var(--border)" strokeDasharray="3 3" strokeWidth=".7"/>
        <text x={L-5} y={py(v)+2.5} textAnchor="end" className="m-ndr-axis">{cvt(`$${v}K`)}</text>
      </g>)}
      {ndrAcv.map((d,i)=><g key={d[0]}>
        <rect x={bx(i)-bw/2} y={py(d[1])} width={bw} height={plotH+T-py(d[1])} rx="2" fill={NDR_TEAL} opacity={hov==null||hov===i?1:.5}/>
        <text x={bx(i)} y={H-6} textAnchor="middle" className="m-ndr-axis">{d[0]}</text>
      </g>)}
    </svg>
    {hov!=null && <NdrTip x={bx(hov)} y={py(ndrAcv[hov][1])} label={ndrAcv[hov][0]} value={`Eligible ACV : $${ndrAcv[hov][1]}K`}/>}
  </div>;
}

export function NdrSection() {
  return <>
    <div className="m-ndr-hero">
      <div className="m-ndr-hero-txt"><h2>Net Dollar Retention</h2><small>Retention &amp; expansion of existing customer revenue</small></div>
      <div className="m-ndr-badge"><b>12.85%</b><span>NDR Achievement</span></div>
    </div>
    <div className="m-ndr-stats">
      {ndrStats.map(st=><div key={st.label} className={`m-ndr-stat ${st.hot?"on":""}`}><small>{st.label}</small><b>{st.value}</b></div>)}
    </div>
    <div className="m-ndr-grid">
      <div className="m-section m-ndr-sec"><div className="m-section-hdr"><h2>Achievement Trend</h2></div><NdrTrendChart/></div>
      <div className="m-section m-ndr-sec"><div className="m-section-hdr"><h2>Monthly Eligible ACV</h2></div><NdrAcvChart/></div>
    </div>
    <div className="m-ndr-grid m-ndr-tables">
      <div className="m-section m-ndr-sec">
        <div className="m-section-hdr"><h2>Transaction Breakdown</h2></div>
        <div className="m-hist-tablewrap"><table className="m-ndr-table">
          <thead><tr><th>Category</th><th>Baseline ATR</th><th>Eligible ACV Bookings</th></tr></thead>
          <tbody>{ndrTxns.map((t,i)=><tr key={i} className={`ndr-${t.kind}`}>
            <td>{t.cat}</td>
            <td>{t.kind==="plan" && t.atr ? <u>{t.atr}</u> : (t.atr||"")}</td>
            <td>{t.kind==="plan" && t.acv ? <u>{t.acv}</u> : (t.acv||"")}</td>
          </tr>)}</tbody>
        </table></div>
      </div>
      <div className="m-section m-ndr-sec">
        <div className="m-section-hdr"><h2>Node Summary</h2></div>
        <div className="m-hist-tablewrap"><table className="m-ndr-table">
          <thead><tr><th>Node</th><th>Baseline ATR</th><th>Eligible ACV</th><th>NDR %</th></tr></thead>
          <tbody>{ndrNodes.map(n=><tr key={n.node}>
            <td className="ndr-node">{n.node}</td><td>{n.atr}</td><td>{n.acv}</td><td>{n.pct}</td>
          </tr>)}</tbody>
        </table></div>
      </div>
    </div>
  </>;
}

/* Goal-sheet selector (Goals page) — UI mockup only: the menu lists the
   seller's goal sheets with the current one checked; picking another sheet
   doesn't swap the page data. Labels follow the desktop reference:
   "<FY> <code> <start> to <end> (Semi-Annual:H1|H2)". */
