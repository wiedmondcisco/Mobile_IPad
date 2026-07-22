import { fullPaymentPeriods } from "../data/payments.js";
import { AskIQPopup } from "../pages/ask-iq/index.jsx";
import { InsightCanvasPopup } from "../pages/at-a-glance/insight-canvas.jsx";
import { KsoCalcPopup } from "../pages/goals/kso.jsx";
import { OrderDetailPopup } from "../pages/order-search/index.jsx";
import { PaymentCalendarPopup } from "../pages/payments/index.jsx";
import { CompCalcPopup, OtbCalcPopup, PaymentHistoryPopup, PdfPopup, RecovBalancePopup } from "../pages/payments/popups.jsx";
import { SellerBreakdownPopup } from "../pages/team-view/index.jsx";

export function FramePopups({s, variant="mobile"}) {
  const ipad = variant === "ipad";
  const shell = (node, onClose, cls="") => ipad
    ? <div className="i-modal-scrim" onClick={onClose}><div className={`i-modal-shell ${cls}`} onClick={e=>e.stopPropagation()}>{node}</div></div>
    : node;
  /* Calc popups describe the statement period being viewed, not always the newest month */
  const selMonth = fullPaymentPeriods[s.periodIdx].month;
  return <>
    {s.calcItem && shell(<CompCalcPopup item={s.calcItem} month={selMonth} onClose={()=>s.setCalcItem(null)}/>, ()=>s.setCalcItem(null))}
    {s.pdfItem && shell(<PdfPopup item={s.pdfItem} onClose={()=>s.setPdfItem(null)}
      onOpenOrder={so=>{ s.setPdfItem(null); s.openOrder(so); }}/>, ()=>s.setPdfItem(null))}
    {s.sellerItem && shell(<SellerBreakdownPopup s={s.sellerItem} onClose={()=>s.setSellerItem(null)}/>, ()=>s.setSellerItem(null))}
    {s.orderDetail && shell(<OrderDetailPopup o={s.orderDetail} onClose={()=>s.setOrderDetail(null)}/>, ()=>s.setOrderDetail(null))}
    {s.showAskIQ && shell(<AskIQPopup onClose={()=>s.setShowAskIQ(false)}/>, ()=>s.setShowAskIQ(false), "i-modal-lg")}
    {s.insightCanvasOpen && shell(<InsightCanvasPopup s={s} onClose={()=>s.setInsightCanvasOpen(false)}/>, ()=>s.setInsightCanvasOpen(false), "i-modal-xl")}
    {s.showRecovBal && shell(<RecovBalancePopup onClose={()=>s.setShowRecovBal(false)}/>, ()=>s.setShowRecovBal(false))}
    {s.showPayCal && shell(<PaymentCalendarPopup onClose={()=>s.setShowPayCal(false)}/>, ()=>s.setShowPayCal(false))}
    {s.histItem && shell(<PaymentHistoryPopup item={s.histItem} onClose={()=>s.setHistItem(null)}/>, ()=>s.setHistItem(null))}
    {s.otbCalcItem && shell(<OtbCalcPopup item={s.otbCalcItem} month={selMonth} onClose={()=>s.setOtbCalcItem(null)}/>, ()=>s.setOtbCalcItem(null))}
    {s.showKsoCalc && shell(<KsoCalcPopup month={s.currentMonth} onClose={()=>s.setShowKsoCalc(false)}
      onKsoTool={()=>{s.setShowKsoCalc(false); s.openGoal("KSO");}}/>, ()=>s.setShowKsoCalc(false))}
  </>;
}
