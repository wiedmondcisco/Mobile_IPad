import { USERS } from "../data/users.js";
import { useState, useEffect } from "react";
import { Calendar, Search } from "lucide-react";
import { MAX_PINS, REMINDERS_SEED, notifications } from "../data/insights.js";
import { ORDER_SEARCH_TYPES, orders } from "../data/orders.js";
import { fullPaymentPeriods } from "../data/payments.js";
import { goalTabs } from "../data/plans.js";
import { spiffPrograms } from "../data/spiffs.js";
import { getInitialTheme, setActiveCur, setAmountsHidden } from "../lib/core.js";
import { HIST_PERIODS } from "../pages/team-view/history.jsx";

export function useCompXState() {
  const [tab, setTab] = useState("glance");
  const [viewMode, setViewMode] = useState("me");        // "me" | "team"
  const [theme, setTheme] = useState(getInitialTheme);
  const [calcItem, setCalcItem] = useState(null);
  const [pdfItem, setPdfItem] = useState(null);
  const [sellerItem, setSellerItem] = useState(null);
  const [sellerView, setSellerView] = useState(null);    // manager drill-in: team member whose data is being viewed
  const [orderDetail, setOrderDetail] = useState(null);  // sales-order drilldown (blue SO number on order cards)
  const [showAskIQ, setShowAskIQ] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [reminders, setReminders] = useState(REMINDERS_SEED);
  const [periodIdx, setPeriodIdx] = useState(
    Math.max(0, fullPaymentPeriods.findIndex(p => p.status === "Open")));    // open (current) month, not the upcoming ghost
  const [showAllPeriods, setShowAllPeriods] = useState(false);               // last 3 ↔ last 12 months
  const [expanded, setExpanded] = useState({});   // payment sections start collapsed — Expand All / per-section taps open them
  const [goalIdx, setGoalIdx] = useState(0);
  const [orderQuery, setOrderQuery] = useState("");
  const [orderType, setOrderType] = useState(ORDER_SEARCH_TYPES[0]);   // search-by field
  const [orderStatus, setOrderStatus] = useState("All Statuses");      // order status filter
  const [orderPe, setOrderPe] = useState("All Plan Elements");         // order PE filter
  const [orderSubmitted, setOrderSubmitted] = useState(false);         // filters-only searches show results
  const [spiffFilters, setSpiffFilters] = useState({period:"All", status:"All", type:"All Types"});
  const [spiffExpanded, setSpiffExpanded] = useState(false);        // SPIFF page: first 2 ↔ all incentives
  const [aagSpiffExpanded, setAagSpiffExpanded] = useState(false);  // At A Glance SPIFF section: first 2 ↔ all
  const [backlogFilter, setBacklogFilter] = useState("All");        // Backlog Insights month bucket
  const [estPe, setEstPe] = useState(0);                            // Pay Estimator selected plan element
  const [estAdd, setEstAdd] = useState({PE1:0, PE2:0, PE3:0});      // Pay Estimator additional attainment $ per PE
  const [estMode, setEstMode] = useState("usd");                    // Pay Estimator input mode: "usd" | "pct"
  const [moreOpen, setMoreOpen] = useState(false);                  // mobile bottom-nav More sheet
  const [histItem, setHistItem] = useState(null);                   // Payment History popup (payment line item)
  const [otbCalcItem, setOtbCalcItem] = useState(null);             // OTB Compensation Calculation popup
  const [showKsoCalc, setShowKsoCalc] = useState(false);            // KSO Calculation popup
  const [teamPe, setTeamPe] = useState("PE1");
  const [teamExpanded, setTeamExpanded] = useState(false);          // first 2 ↔ all members
  const [teamView, setTeamView] = useState("all");                  // team views: all | watch | top | risk | saved id
  const [savedViews, setSavedViews] = useState([]);                 // user-saved team views {id, name, view, pe}
  const [dismissedInsights, setDismissedInsights] = useState([]);   // canvas card indices
  const [upliftOpen, setUpliftOpen] = useState(false);              // Goals · PE1 comp uplift plans
  const [histView, setHistView] = useState(false);                  // Team → Historical Performance Trend
  const [histMode, setHistMode] = useState("single");               // "single" | "compare"
  const [histMember, setHistMember] = useState("Sarah Chen");
  const [histCmpMember, setHistCmpMember] = useState("All");
  const [histPeriods, setHistPeriods] = useState([...HIST_PERIODS]);
  const [histPe, setHistPe] = useState("PE1");
  const [sideCollapsed, setSideCollapsed] = useState(false);        // iPad sidebar rail mode
  const [user, setUser] = useState(USERS[0]);                       // signed-in (or switched-to) user
  const [hideAmts, setHideAmts] = useState(true);                   // privacy default: figures dotted out until the seller taps Show
  setAmountsHidden(hideAmts);
  const [cur, setCur] = useState("USD");                            // display currency (demo conversion, USD base)
  setActiveCur(cur);
  const [insightCanvasOpen, setInsightCanvasOpen] = useState(false);
  const [pinnedInsights, setPinnedInsights] = useState([]);         // insight ids, max MAX_PINS
  const [showRecovBal, setShowRecovBal] = useState(false);          // Recoverable Balance History popup
  const [showPayCal, setShowPayCal] = useState(false);              // Full Payment Calendar popup
  const [orderPopOpen, setOrderPopOpen] = useState(false);          // quick order search (header magnifier)
  const [notifs, setNotifs] = useState(notifications);              // dismissible notification list

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    try { localStorage.setItem("compx-theme", theme); } catch (e) { /* ignore */ }
  }, [theme]);
  const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark");

  /* Manager drill-in: a highlighted seller name on Team View opens their
     At A Glance as a "seller view"; Exit returns to the Team View */
  const enterSellerView = m => { setSellerView(m); setViewMode("me"); setTab("glance"); };
  const exitSellerView = () => { setSellerView(null); setViewMode("team"); };

  /* Deep-link: open Payments with a specific statement period selected */
  const openPayPeriod = month => {
    const idx = fullPaymentPeriods.findIndex(p => p.month === month);
    if (idx >= 0) setPeriodIdx(idx);
    setTab("payments");
  };

  /* Deep-link: open Goals with a specific plan-element tab selected */
  const openGoal = peId => {
    const idx = goalTabs.findIndex(t => t.id === peId);
    if (idx >= 0) setGoalIdx(idx);
    setTab("goals");
  };

  /* Deep-link: open Order Search pre-filtered to one SO (Revenue Transactions
     popup — "Click any SO to view full order details") */
  const openOrder = so => {
    setOrderType("SO Number");
    setOrderQuery(so);
    setOrderStatus("All Statuses");
    setOrderPe("All Plan Elements");
    setOrderSubmitted(true);
    setTab("orders");
  };

  /* Deep-link: open SPIFF & Bonus with the target program visible —
     clears filters and expands past the first-2 fold when needed */
  const openSpiff = name => {
    setSpiffFilters({period:"All", status:"All", type:"All Types"});
    if (spiffPrograms.findIndex(sp => sp.name === name) >= 2) setSpiffExpanded(true);
    setTab("spiff");
  };

  return {
    tab, setTab, viewMode, setViewMode, theme, toggleTheme,
    calcItem, setCalcItem, pdfItem, setPdfItem,
    sellerItem, setSellerItem, sellerView, setSellerView, enterSellerView, exitSellerView,
    orderDetail, setOrderDetail,
    showAskIQ, setShowAskIQ, notifOpen, setNotifOpen, reminders, setReminders,
    periodIdx, setPeriodIdx, openPayPeriod, openGoal, openSpiff, openOrder, showAllPeriods, setShowAllPeriods, expanded, setExpanded, goalIdx, setGoalIdx,
    orderQuery, setOrderQuery, orderType, setOrderType, orderStatus, setOrderStatus, orderPe, setOrderPe,
    orderSubmitted, setOrderSubmitted, spiffFilters, setSpiffFilters, spiffExpanded, setSpiffExpanded,
    aagSpiffExpanded, setAagSpiffExpanded, backlogFilter, setBacklogFilter,
    estPe, setEstPe, estAdd, setEstAdd, estMode, setEstMode, moreOpen, setMoreOpen,
    histItem, setHistItem, otbCalcItem, setOtbCalcItem, showKsoCalc, setShowKsoCalc,
    teamPe, setTeamPe, teamExpanded, setTeamExpanded, teamView, setTeamView, savedViews, setSavedViews,
    dismissedInsights, setDismissedInsights,
    upliftOpen, setUpliftOpen,
    histView, setHistView, histMode, setHistMode, histMember, setHistMember,
    histCmpMember, setHistCmpMember, histPeriods, setHistPeriods, histPe, setHistPe,
    sideCollapsed, setSideCollapsed, hideAmts, setHideAmts, cur, setCur, user, setUser,
    insightCanvasOpen, setInsightCanvasOpen, pinnedInsights, setPinnedInsights,
    showRecovBal, setShowRecovBal, showPayCal, setShowPayCal, notifs, setNotifs,
    orderPopOpen, setOrderPopOpen,
    currentMonth: (fullPaymentPeriods.find(p => p.status === "Open") || fullPaymentPeriods[fullPaymentPeriods.length-1]).month
  };
}

/* All overlays. On iPad the same popups render inside a centered modal
   shell (CSS neutralizes the phone's full-screen positioning). */
