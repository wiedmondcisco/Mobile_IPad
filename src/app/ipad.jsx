import { Bell, ChevronLeft, ChevronRight, Moon, Sparkles, Sun, User, Users, X } from "lucide-react";
import { FramePopups } from "./FramePopups.jsx";
import { CiscoLogo, IPadSafariBar, IPadStatusBar, useUrlBarCollapse } from "./device.jsx";
import { NAV_TABS } from "./nav.js";
import { orders } from "../data/orders.js";
import { IPadGlance } from "../pages/at-a-glance/index.jsx";
import { IPadBacklog } from "../pages/backlog/index.jsx";
import { IPadGoals } from "../pages/goals/index.jsx";
import { IPadOrders } from "../pages/order-search/index.jsx";
import { IPadEstimator } from "../pages/pay-estimator/index.jsx";
import { IPadPayments } from "../pages/payments/index.jsx";
import { IPadSpiff } from "../pages/spiff-bonus/index.jsx";
import { IPadTeam } from "../pages/team-view/index.jsx";
import { NotifDropdown, SellerViewBanner, UtilityIcons } from "../shared/chrome.jsx";

export function IPadHeader({title, sub, s, right}) {
  return <div className="i-head">
    <div className="i-head-titles">
      <h1 className="i-title">{title}</h1>
      {sub && <p className="i-sub">{sub}</p>}
    </div>
    <div className="i-head-actions">
      {right}
      <UtilityIcons ipad/>
      <button className="i-iconbtn" onClick={()=>s.setNotifOpen(!s.notifOpen)} aria-label="Notifications"><Bell size={19}/>{s.notifs.length>0 && <span className="m-bell-count">{s.notifs.length}</span>}</button>
      {s.notifOpen && <><div className="m-notif-overlay" onClick={()=>s.setNotifOpen(false)}/>
        <NotifDropdown s={s} onClose={()=>s.setNotifOpen(false)} ipad/></>}
    </div>
  </div>;
}

export function IPadFrame({s, landscape=false}) {
  const team = s.viewMode === "team";
  const [urlMini, setUrlMini, onScroll] = useUrlBarCollapse();
  return <div className={`i-device ${landscape?"land":""}`}>
    <span className="i-cam"/>
    <div className="i-screen" style={{"--isafari-h": urlMini ? "26px" : "53px"}}>
      <IPadStatusBar/>
      <IPadSafariBar mini={urlMini} onExpand={()=>setUrlMini(false)}/>
      <div className="i-shell">
        <aside className={`i-sidebar ${s.sideCollapsed?"closed":""}`}>
          <div className="i-brand">
            <CiscoLogo className="i-cisco"/>
            <div className="i-brand-txt"><b>Comp<em>X</em></b><small>Compensation IQ</small></div>
            <button className="i-side-collapse" onClick={()=>s.setSideCollapsed(!s.sideCollapsed)}
              aria-label={s.sideCollapsed?"Expand sidebar":"Collapse sidebar"} title={s.sideCollapsed?"Expand":"Collapse"}>
              {s.sideCollapsed ? <ChevronRight size={16}/> : <ChevronLeft size={16}/>}
            </button>
          </div>
          <p className="i-brand-tag">Your source for compensation information</p>
          <div className="i-profile" title="Alex Johnson · Enterprise AE">
            <img src="https://randomuser.me/api/portraits/men/32.jpg" className="i-avatar" alt=""/>
            <div className="i-profile-txt"><b>Hi Alex!</b><small>Enterprise AE</small></div>
          </div>
          <div className="i-viewtoggle">
            <button className={!team?"on":""} onClick={()=>{ s.setSellerView(null); s.setViewMode("me"); }} title="My Compensation"><User size={15}/><span>My Compensation</span></button>
            <button className={team?"on":""} onClick={()=>{ s.setSellerView(null); s.setViewMode("team"); }} title="Team View"><Users size={15}/><span>Team View</span></button>
          </div>
          <nav className="i-nav">
            {!team
              ? NAV_TABS.map(t=><button key={t.id} className={`i-navitem ${s.tab===t.id?"on":""}`} onClick={()=>s.setTab(t.id)} title={t.label}>
                  <t.Icon size={19}/><span>{t.label}</span>
                </button>)
              : <div className="i-navitem on" title="Team Dashboard"><Users size={19}/><span>Team Dashboard</span></div>}
          </nav>
          <div className="i-side-foot">
            <button className="i-side-askiq" onClick={()=>s.setShowAskIQ(true)} title="Ask SalesComp IQ"><Sparkles size={16}/><span>Ask SalesComp IQ</span></button>
            <button className="i-side-theme" onClick={s.toggleTheme} title={s.theme==="dark"?"Light mode":"Dark mode"}>
              {s.theme==="dark" ? <Sun size={17}/> : <Moon size={17}/>}<span>{s.theme==="dark"?"Light mode":"Dark mode"}</span>
            </button>
          </div>
        </aside>

        <main className="i-main" onScroll={onScroll}>
          {!team && <SellerViewBanner s={s}/>}
          {team ? <IPadTeam s={s}/> : <>
            {s.tab==="glance"   && <IPadGlance s={s}/>}
            {s.tab==="payments" && <IPadPayments s={s}/>}
            {s.tab==="goals"    && <IPadGoals s={s}/>}
            {s.tab==="orders"   && <IPadOrders s={s}/>}
            {s.tab==="spiff"    && <IPadSpiff s={s}/>}
            {s.tab==="backlog"  && <IPadBacklog s={s}/>}
            {s.tab==="estimator" && <IPadEstimator s={s}/>}
          </>}
        </main>
      </div>
      <FramePopups s={s} variant="ipad"/>
    </div>
  </div>;
}

