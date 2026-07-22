import { useState } from "react";
import { CheckCircle2, ChevronDown, Target, User, X } from "lucide-react";
import { revenueTxns } from "../../data/orders.js";
import { OTB_CALC, PAYMENT_HISTORY, TI_CALC } from "../../data/payments.js";
import { PE_COLOR } from "../../lib/brand.js";
import { amt, fmtAmt } from "../../lib/core.js";
import { Expandable, FormulaStrip, FullScreenPopup, PePill } from "../../shared/primitives.jsx";

/* Compensation Calculation popup — the MONEY-value trigger. Full-screen, two tabs. */
export function CompCalcPopup({item, month, onClose}) {
  const [tab, setTab] = useState("Payment Calculation");
  const c = item.calc;

  return <FullScreenPopup title="Compensation Calculation" subtitle={`Calculations for ${month} payment`}
    tabs={["Payment Calculation","TI Calculation"]} activeTab={tab} onTab={setTab} onClose={onClose}>

    <div className="m-calc-badge-row"><PePill pe={item.pe} label={item.label} color={item.color}/></div>

    {tab==="Payment Calculation" && <>
      <p className="m-calc-summary">Based on your incremental attainment of <b>{c.incrementalAtt}</b> of your goal, your incentive payment for {c.shortName || item.label || item.pe} is <b>{amt(c.result)}</b>.</p>

      <FormulaStrip weight={c.weight} targetIncentive={c.targetIncentive} proration={c.proration} payoutRate={c.payoutRate} result={c.result} totalEarned={c.totalEarned} prevPaid={c.prevPaid}/>

      <Expandable title="How is the Payout Rate Multiplier determined?" defaultOpen={!!(c.rateIncremental || c.rateNP)}>
        {c.nonPrimary ? <>
          <p className="m-exp-text">This is a <b>Non-Primary Plan Element</b>. The payout rate multiplier depends on both your NPR attainment AND the attainment of the primary PE ({c.nonPrimary.primaryName}).</p>
          <div className="m-dep-banner"><b>Dependent on:</b> {c.nonPrimary.primaryName} Attainment: <b>{c.nonPrimary.primaryAtt}</b> <span>({c.nonPrimary.note})</span></div>
          <p className="m-rate-name">Rate Table: {c.rateName} (Non-Primary)</p>
          <div className="m-rate-scroll">
            <table className="m-rate-table m-rate-wide m-rate-np">
              <thead><tr><th>NPR Attainment</th><th>Pri Attainment</th><th>PE Pay Rate</th><th>Prior Attainment</th><th>Incremental Attainment</th><th>Payout Multiplier</th></tr></thead>
              <tbody>{c.rateNP.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
                <td>{r.npr} <span className="m-rate-and">and</span></td><td>{r.pri}</td><td>{r.peRate}</td><td>{r.prior}</td>
                <td className={r.active && r.incr!=="-" ? "m-rate-hot" : ""}>{r.incr}</td><td>{r.mult}</td>
              </tr>)}</tbody>
            </table>
          </div>
          <button className="m-rate-more">More rows →</button>
          <div className="m-rate-total-row">Total: <b>{c.payoutRate}</b></div>
        </> : <>
          <p className="m-exp-text">The payout rate multiplier is based on your incremental goal attainment for the month and the payout multiplier associated with your overall goal attainment for the goal period.</p>
          {c.rateIncremental && <>
            <p className="m-rate-name">Rate Table: {c.rateName}</p>
            <div className="m-rate-scroll">
              <table className="m-rate-table m-rate-wide">
                <thead><tr><th>Attainment</th><th>PE Pay Rate</th><th>Prior Attainment</th><th>Incremental Attainment</th><th>Payout Multiplier</th></tr></thead>
                <tbody>{c.rateIncremental.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
                  <td>{r.range}</td><td>{r.peRate}</td><td>{r.prior}</td>
                  <td className={r.active && r.incr!=="-" ? "m-rate-hot" : ""}>{r.incr}</td><td>{r.mult}</td>
                </tr>)}</tbody>
              </table>
            </div>
            {c.moreRows && <button className="m-rate-more">More rows →</button>}
            <div className="m-rate-total-row">{c.totalLabel || "Total:"} <b>{c.payoutRate}</b></div>
          </>}
        </>}
      </Expandable>

      <Expandable title="Why is my proration not 100%?">
        <p className="m-exp-text">{c.proration==="100%"
          ? <>Your proration is <b>100%</b> because you were active for the full goaling interval (182/182 days). Proration is reduced when a seller joins mid-period or has a territory change during the interval.</>
          : <>Your proration is <b>{c.proration}</b> because you were active for only part of the goaling interval. Proration is reduced when a seller joins mid-period or has a territory change during the interval.</>}</p>
      </Expandable>

      <Expandable title="What is my Total Payment against this Plan?">
        {c.rateTotal ? <>
          <p className="m-exp-text">Based on your total attainment of <b>{c.totalAtt}</b> of your goal, your incentive payment for {c.shortName || item.label || item.pe} is <b>{amt(c.result)}</b>.</p>
          <FormulaStrip weight={c.weight} targetIncentive={c.targetIncentive} proration={c.proration} payoutRate={c.payoutRate} result={c.result} totalEarned={c.totalEarned} prevPaid={c.prevPaid}/>
          <p className="m-rate-name">Payout Rate Table</p>
          <div className="m-rate-scroll">
            <table className="m-rate-table m-rate-wide">
              <thead><tr><th>Attainment</th><th>PE Pay Rate</th><th>Revenue Attainment</th><th>Payout Multiplier</th></tr></thead>
              <tbody>{c.rateTotal.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
                <td>{r.range}</td><td>{r.peRate}</td><td>{r.rev}</td><td>{r.mult}</td>
              </tr>)}</tbody>
            </table>
          </div>
        </> : <p className="m-exp-text">Your total GPTD (Goal Period to Date) incentive for {item.label || item.pe} is <b>{amt("$"+(c.gptd || c.result))}</b>. This reflects all payments earned against this plan element from the start of the goal period through the current payment.</p>}
      </Expandable>
    </>}

    {tab==="TI Calculation" && <>
      <div className="m-calc-badge-row"><PePill pe="TI" label="Target Incentive Calculation" color="#0077c2"/></div>
      <p className="m-calc-summary">Your Semi-Annual Target Incentive is derived from your base salary and variable pay percentage. This is the maximum incentive payout at 100% goal attainment before multipliers.</p>

      <div className="m-ti-step"><b>Step 1: Calculate Semi-Annual OTE</b></div>
      <p className="m-ti-eq">Semi-Annual OTE = Semi-Annual Base Salary × (1 - Variable Pay %)</p>
      <div className="m-ti-card">
        <div className="m-ti-part"><b>{amt("$"+TI_CALC.semiBase)}</b><small>Semi-Annual Base</small></div>
        <span className="m-ti-op">×</span>
        <div className="m-ti-part"><b>(1 - {TI_CALC.varPct})</b><small>1 - Variable Pay %</small></div>
        <span className="m-ti-op">=</span>
        <div className="m-ti-part m-ti-res"><b>{amt("$"+TI_CALC.ote)}</b><small>Semi-Annual OTE</small></div>
      </div>

      <div className="m-ti-step"><b>Step 2: Calculate Target Incentive</b></div>
      <p className="m-ti-eq">Target Incentive = Semi-Annual OTE - Semi-Annual Base Salary</p>
      <div className="m-ti-card">
        <div className="m-ti-part"><b>{amt("$"+TI_CALC.ote)}</b><small>Semi-Annual OTE</small></div>
        <span className="m-ti-op">−</span>
        <div className="m-ti-part"><b>{amt("$"+TI_CALC.semiBase)}</b><small>Semi-Annual Base</small></div>
        <span className="m-ti-op">=</span>
        <div className="m-ti-part m-ti-res"><b>{amt("$"+TI_CALC.ti)}</b><small>Target Incentive</small></div>
      </div>

      <div className="m-ti-step"><b>Compensation Summary</b></div>
      <div className="m-ti-tablewrap">
        <table className="m-ti-table">
          <thead><tr><th>Component</th><th>Value</th><th>Details</th></tr></thead>
          <tbody>
            <tr><td>Annual Base Salary</td><td>{amt("$"+TI_CALC.annualBase)}</td><td>Gross annual base compensation</td></tr>
            <tr><td>Variable Pay %</td><td>{TI_CALC.varPct}</td><td>Target variable as % of OTE</td></tr>
            <tr><td>Goaling Interval</td><td>{TI_CALC.interval}</td><td>Semi-Annual proration</td></tr>
            <tr><td>Semi-Annual Base Salary</td><td>{amt("$"+TI_CALC.semiBase)}</td><td>Base for the goal period</td></tr>
            <tr><td>Semi-Annual OTE</td><td>{amt("$"+TI_CALC.ote)}</td><td>On-Target Earnings for period</td></tr>
            <tr className="m-ti-hot"><td>Semi-Annual Target Incentive</td><td>{amt("$"+TI_CALC.ti)}</td><td>Maximum incentive at 100% attainment</td></tr>
            <tr><td>Active Days / Total Days</td><td>{TI_CALC.days}</td><td>Proration factor = 100%</td></tr>
          </tbody>
        </table>
      </div>

      <Expandable title="How is my Variable Pay % determined?">
        <p className="m-exp-text">Your variable pay percentage is set by your compensation plan and role level. It represents the portion of your On-Target Earnings (OTE) that is performance-based. A {TI_CALC.varPct} variable pay means {TI_CALC.varPct} of your OTE is at risk and tied to goal attainment.</p>
      </Expandable>
      <Expandable title="Why are calculations semi-annual?">
        <p className="m-exp-text">Your goaling interval is <b>{TI_CALC.interval}</b> with <b>Semi-Annual</b> proration. Target Incentive is calculated for the 6-month goal period (182 active days out of 182 total days).</p>
      </Expandable>
    </>}
  </FullScreenPopup>;
}

/* On-Top Bonus Compensation Calculation — the OTB blue-amount trigger.
   Same shell as CompCalcPopup but with the OTB formula (TI rate × OTB
   target incentive × proration × payout multiplier) and single rate table. */

export function OtbCalcPopup({item, month, onClose}) {
  const c = item.calc || OTB_CALC[item.name];
  return <FullScreenPopup title="Compensation Calculation" subtitle={`Calculations for ${month} payment`}
    tabs={["Payment Calculation"]} activeTab="Payment Calculation" onTab={()=>{}} onClose={onClose}>
    <div className="m-calc-badge-row"><PePill pe="OTB" label={item.name} color={PE_COLOR.OTB}/></div>
    <p className="m-calc-summary">Based on your incremental attainment of <b>{c.incrementalAtt}</b> of your goal, your incentive payment for {item.name} is <b>{amt(c.result)}</b>.</p>
    <FormulaStrip weight={c.tiRate} weightLabel="On Top Bonus TI Rate" targetIncentive={c.targetIncentive}
      proration={c.proration} payoutRate={c.payoutRate} result={c.result}/>
    <Expandable title="How is the Payout Rate Multiplier determined?" defaultOpen>
      <p className="m-exp-text">The payout rate multiplier is based on your incremental goal attainment for the month and the payout multiplier associated with your overall goal attainment for the goal period.</p>
      <p className="m-rate-name">Rate Table: {c.rateName}</p>
      <div className="m-rate-scroll">
        <table className="m-rate-table m-rate-wide">
          <thead><tr><th>Attainment</th><th>PE Pay Rate</th><th>Prior Attainment</th><th>Incremental Attainment</th><th>Payout Multiplier</th></tr></thead>
          <tbody>{c.rows.map((r,ri)=><tr key={ri} className={r.active?"m-rate-active":""}>
            <td>{r.range}</td><td>{r.peRate}</td><td>{r.prior}</td><td>{r.incr}</td><td>{r.mult}</td>
          </tr>)}</tbody>
        </table>
      </div>
      <button className="m-rate-more">More rows →</button>
      <div className="m-rate-total-row">Total: <b>{c.payoutRate}</b></div>
    </Expandable>
    <Expandable title="Why is my proration not 100%?">
      <p className="m-exp-text">Proration reflects mid-period plan changes, transfers, or start dates. Your plan was active for the full period, so your proration is 100%.</p>
    </Expandable>
  </FullScreenPopup>;
}

/* KSO Calculation — the goal-sheet KSO amount trigger. Fixed bonus, so the
   formula is just earned − previously paid; tabs add the payment history and
   a jump to the Goals-tab KSO quarters (the in-app "KSO Tool"). */
/* KSO popup — desktop reference: per-tab titles, earned − paid strip with the
   monthly payment in a filled chip, ranged Payment History, and a View in
   KSO Tool panel (the button lands on the Goals KSO view — our stand-in
   for the external KSO Management Tool). */

export const HIST_RANGES = ["Current Month","Past 6 Months","Past Year","All Time"];

export function PaymentHistoryPopup({item, onClose}) {
  const h = PAYMENT_HISTORY[item.name];
  const tabsStyle = item.sect === "spiff";                 // underline tabs, no Current Month
  const ranges = tabsStyle || !h.current ? HIST_RANGES.slice(1) : HIST_RANGES;
  const [range, setRange] = useState(ranges[0]);
  const lim = range==="Past 6 Months" ? 5 : range==="Past Year" ? 12 : Infinity;
  const rows = h.rows.filter(r=>r.mb<=lim);
  const total = rows.reduce((a,r)=>a+r.amount,0);
  return <FullScreenPopup title="Payment History" subtitle={item.name} onClose={onClose}
    {...(tabsStyle ? {tabs:ranges, activeTab:range, onTab:setRange} : {})}>
    {!tabsStyle && <div className="m-ph-ranges">
      {ranges.map(r=><button key={r} className={r===range?"on":""} onClick={()=>setRange(r)}>{r}</button>)}
    </div>}
    {range==="Current Month"
      ? <>
        <p className="m-ph-label">Bonus Details</p>
        <div className="m-ph-bonus">
          <div><small>Book Date</small><b>{h.current.book}</b></div>
          <div><small>Processed Date</small><b>{h.current.processed}</b></div>
          <div><small>Bonus Amount</small><b>{amt(h.current.bonus)}</b></div>
          <div><small>Payment Amount</small><b>{amt(h.current.payment)}</b></div>
          <div><small>User Comments</small><b>{h.current.comments}</b></div>
          <div><small>Created By</small><b>{h.current.createdBy}</b></div>
          <div><small>Program Name</small><b>{h.current.program}</b></div>
        </div>
      </>
      : <div className="m-ph-table">
        <div className="m-ph-tr m-ph-th"><span>Pay Date ↓</span><span>Details</span><span className="m-ph-amt">Amount</span><span>Status</span></div>
        {rows.map((r,i)=><div key={i} className="m-ph-tr">
          <span className="m-ph-date">{r.date}</span>
          <span className="m-ph-details">{r.details}</span>
          <span className={`m-ph-amt ${r.amount<0?"neg":""}`}>{amt(fmtAmt(r.amount))}</span>
          <span className="m-pay-status m-status-paid">Paid</span>
        </div>)}
        {rows.length===0 && <div className="m-pb-empty">No payments in this range.</div>}
        <div className="m-ph-total"><span>Total</span><b>{amt(fmtAmt(total))}</b></div>
      </div>}
  </FullScreenPopup>;
}

/* PDF / breakdown-icon trigger — Revenue Transactions popup (full-screen),
   per the desktop reference: snapshot banner, "N transactions contributing"
   line with the period total, SO links, green revenue, and a bottom total.
   No export (removed app-wide). */

export function PdfPopup({item, onClose, onOpenOrder}) {
  const t = revenueTxns[item.txnKey || item.pe];
  if (!t) return null;
  const n = t.rows.length;
  return <div className="m-fs">
    <div className="m-fs-hdr">
      <div className="m-fs-hdr-text"><b>{item.pe} - {item.label} - H1 2026 Revenue Transactions</b></div>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    <div className="m-fs-body">
      <div className="m-txn-note">ⓘ Values shown are <b>payment-date snapshots</b>. Live order values may differ due to subsequent changes.</div>
      <div className="m-txn-count">
        <span><b>{n} transaction{n===1?"":"s"}</b> contributing to this payment</span>
        <span className="m-txn-count-total">Period Total: <b>{amt("$"+t.total)}</b></span>
      </div>
      <div className="m-txn-list">
        <div className="m-txn-list-hdr"><span>SO Number</span><span className="r">Revenue</span></div>
        {t.rows.map((r,i)=><div key={i} className="m-txn-row2">
          <div className="m-txn-line1">
            <button className="m-txn-so" onClick={()=>onOpenOrder(r.so)} title={`View ${r.so} order details`}>{r.so}</button>
            <span className="m-txn-rev">{amt(r.rev)}</span>
          </div>
          <div className="m-txn-line2">{r.date} · {r.customer}</div>
        </div>)}
        <div className="m-txn-total">
          <span>Total ({n} order{n===1?"":"s"})</span>
          <b className="m-txn-total-amt">{amt("$"+t.total)}</b>
        </div>
        <div className="m-txn-foot">
          <span>Showing 1–{n} of {n}</span>
          <i>Click any SO to view full order details</i>
        </div>
      </div>
    </div>
  </div>;
}

/* Recoverable Balance History — what the seller owes back to Cisco, with the
   payment transactions that created and cleared the balance (desktop reference) */

export function RecovBalancePopup({onClose}) {
  const [open, setOpen] = useState(true);
  return <div className="m-fs">
    <div className="m-fs-hdr">
      <div className="m-fs-hdr-text"><b>Recoverable Balance History</b></div>
      <span className="m-recov-badge">● {amt("$0.00")}</span>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    <div className="m-fs-body">
      <p className="m-recov-desc">Your recoverable balance is the amount of incentive compensation that you owe back to Cisco.</p>
      <p className="m-recov-desc">These are previous payment transactions that contributed to your recoverable balance.</p>
      <p className="m-recov-asof">Total Recoverable Balance as of Nov 2025 (Cleared)</p>

      <div className="m-section m-recov-card">
        <div className="m-recov-hdr" role="button" tabIndex={0} aria-expanded={open}
          onClick={()=>setOpen(o=>!o)}
          onKeyDown={e=>{ if (e.key==="Enter"||e.key===" ") { e.preventDefault(); setOpen(o=>!o); } }}>
          <ChevronDown size={15} className={`m-insight-chev ${open?"open":""}`}/>
          <div className="m-recov-hdr-text">
            <b>Oct 2025</b>
            <span>Negative Earnings (No Recovery)</span>
          </div>
          <div className="m-recov-remaining">
            <b>{amt("$0.00")}</b>
            <small>Remaining Balance</small>
          </div>
          <CheckCircle2 size={20} className="m-recov-check"/>
        </div>
        <div className="m-recov-progress">
          <small>{amt("$5000.00")} of {amt("$5000.00")} Paid</small>
          <div className="m-recov-bar"><div className="m-recov-bar-fill" style={{width:"100%"}}/></div>
        </div>

        {open && <>
          <div className="m-recov-txn">
            <div><b>Oct 2025</b><span>Negative earnings — recoverable balance created</span></div>
            <b className="m-recov-neg">−{amt("$5000.00")}</b>
          </div>
          <div className="m-recov-txn">
            <div><b>Nov 2025</b><span>Final Recovery (Balance Cleared)</span></div>
            <b className="m-recov-pos">{amt("$5000.00")}</b>
          </div>
          <div className="m-recov-total"><b>Remaining Draw Balance</b><b>{amt("$0.00")}</b></div>
          <div className="m-rate-scroll">
            <table className="m-rate-table m-rate-wide">
              <thead><tr><th>Period</th><th>Description</th><th>Opening Balance</th><th>Recovery</th><th>Closing Balance</th></tr></thead>
              <tbody>
                <tr><td>Oct 2025</td><td>Negative Earnings (No Recovery)</td><td>—</td><td>—</td><td>{amt("−5,000.00")}</td></tr>
                <tr><td>Nov 2025</td><td>Final Recovery (Balance Cleared)</td><td>{amt("−5,000.00")}</td><td>{amt("5,000.00")}</td><td>{amt("0.00")}</td></tr>
              </tbody>
            </table>
          </div>
        </>}
      </div>
    </div>
  </div>;
}

