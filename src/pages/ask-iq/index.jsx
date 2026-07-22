import { useState, useEffect, useRef } from "react";
import { Send, Sparkles, X } from "lucide-react";

/* SalesComp IQ assistant — canned responses keyed by keyword (from original build) */
export const botResponses = {
  "attainment":"You're at 24% on PRI (CX-SVC RENEW), 71% on NPR (RRA-SW), and 44% on NPR2 (SEC PRD). Overall weighted: ~42%. You need significant revenue growth on PRI to hit accelerator.",
  "earnings":"YTD earnings: $27,267 paid (Jan–Apr). Current month (May 2026): $8,434.23 — Goal Sheet $5,885.73, SPIFFs $2,125, Draws $50, Adj $73.50, OTB $100, Past $200.",
  "accelerator":"Accelerator kicks in at 100% attainment. Rate jumps from 1% to 2% per 1% attainment! Your best positioned PE is NPR at 71%.",
  "close":"Your best positioned PE is NPR (Recurring Software) at 71%. You need about $25K more revenue to reach 100%. PRI is at 24% needing ~$83K.",
  "payment":"Next payment: $8,434.23 on Jun 2, 2026. Previous: $8,688.08 (Apr). Lock date: May 28.",
  "backlog":"$115K in backlog. Estimated additional paycheck impact: +$1,200. Orders pending fulfillment across multiple months.",
  "goal":"Goal Sheet H1: PRI $109K (50% weight), NPR $87K (30%), NPR2 $90K (20%). Total target incentive: $75,500.",
  "spiff":"Active: Q2 Cloud Migration SPIFF ($5,000 potential, 25% progress), Partner Acceleration Q2 ($3,500, 25%). Projected SPIFF earnings this period: $2,125.",
  "best":"NPR (RRA-SW) is at 71% attainment — closest to the 100% accelerator threshold. NPR2 (SEC PRD) trails at 44%.",
  "default":"I can help with: attainment, earnings, payments, accelerators, backlog, goals, or SPIFFs. What would you like to know?"
};

export function AskIQPopup({onClose}) {
  const [messages, setMessages] = useState([{from:"bot", text:"Hi Alex! I'm SalesComp IQ. Ask me about your attainment, earnings, payments, or goals."}]);
  const [input, setInput] = useState("");
  const [showQuick, setShowQuick] = useState(true);
  const endRef = useRef(null);
  useEffect(()=>{endRef.current?.scrollIntoView({behavior:"smooth"})},[messages]);

  const send = (text) => {
    const msg = text || input.trim();
    if(!msg) return;
    setMessages(p=>[...p,{from:"user",text:msg}]);
    setInput(""); setShowQuick(false);
    const lower = msg.toLowerCase();
    const key = Object.keys(botResponses).find(k=>lower.includes(k))||"default";
    setTimeout(()=>setMessages(p=>[...p,{from:"bot",text:botResponses[key]}]),500);
  };

  const quickQ = ["How close to accelerator?","What are my earnings?","Next payment?","Backlog status?","Active SPIFFs?","Which PE is best?"];

  return <div className="m-fs m-askiq">
    <div className="m-fs-hdr">
      <div className="m-askiq-title"><span className="m-askiq-spark"><Sparkles size={16}/></span>
        <div className="m-fs-hdr-text"><b>SalesComp IQ</b><small>AI compensation assistant</small></div>
      </div>
      <button className="m-fs-close" onClick={onClose} aria-label="Close"><X size={18}/></button>
    </div>
    <div className="m-askiq-body">
      {showQuick && <div className="m-quick-grid">{quickQ.map((q,i)=><button key={i} className="m-quick-btn" onClick={()=>send(q)}>{q}</button>)}</div>}
      <div className="m-chat-msgs">
        {messages.map((m,i)=><div key={i} className={`m-msg m-msg-${m.from}`}>
          {m.from==="bot"&&<div className="m-msg-av"><Sparkles size={12}/></div>}
          <div className="m-msg-bub">{m.text}</div>
        </div>)}
        <div ref={endRef}/>
      </div>
    </div>
    <div className="m-chat-input">
      <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==="Enter"&&send()} placeholder="Ask about your comp…"/>
      <button className="m-chat-send" onClick={()=>send()}><Send size={16}/></button>
    </div>
  </div>;
}

/* Cisco logo — bar geometry from the official mark: short/medium bars share a common
   baseline, the two towers extend both above and below it */
