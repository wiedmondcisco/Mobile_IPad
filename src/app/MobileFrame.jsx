import { Moon, MoreHorizontal, Sparkles, Sun, User, Users, X } from "lucide-react";
import { FramePopups } from "./FramePopups.jsx";
import { CiscoLogo, SafariBar, StatusBar, useUrlBarCollapse } from "./device.jsx";
import { MOBILE_MORE, MOBILE_MORE_IDS, MOBILE_TABS } from "./nav.js";
import { orders } from "../data/orders.js";
import { AtAGlancePage } from "../pages/at-a-glance/index.jsx";
import { BacklogPage } from "../pages/backlog/index.jsx";
import { GoalsPage } from "../pages/goals/index.jsx";
import { OrderSearchPage } from "../pages/order-search/index.jsx";
import { PayEstimatorPage } from "../pages/pay-estimator/index.jsx";
import { PaymentsPage } from "../pages/payments/index.jsx";
import { SpiffBonusPage } from "../pages/spiff-bonus/index.jsx";
import { TeamPage } from "../pages/team-view/index.jsx";

export function MobileFrame({s}) {
  const [urlMini, setUrlMini, onScroll] = useUrlBarCollapse();
  return <div className="m-device">
    <span className="m-btn m-btn-mute"/>
    <span className="m-btn m-btn-volup"/>
    <span className="m-btn m-btn-voldn"/>
    <span className="m-btn m-btn-power"/>

    <div className="m-phone">
      <div className="m-screen" style={{"--safari-h": urlMini ? "30px" : "64px"}}>
        <StatusBar/>
        <div className="m-island"/>

        <div className="m-brandbar">
          <CiscoLogo className="m-cisco m-brand-cisco"/>
          <span className="m-compx">Comp<em>X</em></span>
          <div className="m-brand-actions">
            <button className="m-askiq-open" onClick={()=>s.setShowAskIQ(true)} aria-label="Ask SalesComp IQ"><Sparkles size={16}/></button>
            <button className="m-theme-toggle" onClick={s.toggleTheme} aria-label={s.theme==="dark"?"Switch to light mode":"Switch to dark mode"}>
              {s.theme==="dark" ? <Sun size={17}/> : <Moon size={17}/>}
            </button>
          </div>
        </div>
        {/* Me/Team toggle lives on At A Glance only (team view keeps it so you can switch back) */}
        {(s.tab==="glance" || s.viewMode==="team") && <div className="m-viewbar">
          <div className="m-viewtoggle">
            <button className={s.viewMode==="me"?"on":""} onClick={()=>{ s.setSellerView(null); s.setViewMode("me"); }}><User size={14}/> My Compensation</button>
            <button className={s.viewMode==="team"?"on":""} onClick={()=>{ s.setSellerView(null); s.setViewMode("team"); }}><Users size={14}/> Team View</button>
          </div>
        </div>}

        <div className="m-content" onScroll={onScroll}>
          {s.viewMode==="team"
            ? <TeamPage s={s}/>
            : <>
                {s.tab==="glance"   && <AtAGlancePage s={s}/>}
                {s.tab==="payments" && <PaymentsPage s={s}/>}
                {s.tab==="goals"    && <GoalsPage s={s}/>}
                {s.tab==="orders"   && <OrderSearchPage s={s}/>}
                {s.tab==="spiff"    && <SpiffBonusPage s={s}/>}
                {s.tab==="backlog"  && <BacklogPage s={s}/>}
                {s.tab==="estimator" && <PayEstimatorPage s={s}/>}
              </>}
        </div>

        {s.viewMode==="me" && <nav className="m-tabbar">
          {MOBILE_TABS.map(t=><button key={t.id} className={`m-tab ${s.tab===t.id?"m-tab-on":""}`} onClick={()=>{s.setTab(t.id); s.setMoreOpen(false);}}>
            <t.Icon size={18}/><span>{t.short||t.label}</span>
          </button>)}
          <button className={`m-tab ${MOBILE_MORE_IDS.includes(s.tab)?"m-tab-on":""}`} onClick={()=>s.setMoreOpen(!s.moreOpen)} aria-expanded={s.moreOpen}>
            <MoreHorizontal size={18}/><span>More</span>
          </button>
        </nav>}

        {s.viewMode==="me" && s.moreOpen && <>
          <div className="m-more-backdrop" onClick={()=>s.setMoreOpen(false)}/>
          <div className="m-more-sheet">
            {MOBILE_MORE.map(t=><button key={t.id} className={s.tab===t.id?"on":""}
              onClick={()=>{s.setTab(t.id); s.setMoreOpen(false);}}>
              <t.Icon size={16}/>{t.label}
            </button>)}
          </div>
        </>}

        <SafariBar mini={urlMini} onExpand={()=>setUrlMini(false)}/>
        <div className="m-home"/>
        <FramePopups s={s} variant="mobile"/>
      </div>
    </div>
  </div>;
}

