"use client";
import { useState } from "react";
import {
  CreditCard, Target, BarChart2, ChevronRight, ChevronDown,
  Search, Award, Calculator, Eye, EyeOff, Download,
  Moon, Sun, X, Menu, RefreshCw, ArrowUpRight,
  Package, ChevronLeft,
} from "lucide-react";
import {
  PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  BarChart, Bar, XAxis, YAxis, ReferenceLine,
} from "recharts";

// ─── Colors ──────────────────────────────────────────────────────────────────
const BLUE   = "#0070F3";
const GREEN  = "#16A34A";
const AMBER  = "#D97706";
const RED    = "#DC2626";
const INDIGO = "#4F46E5";
const PURPLE = "#7C3AED";
const CYAN   = "#0891B2";

// ─── Types ───────────────────────────────────────────────────────────────────
type Screen = "payments" | "goaling" | "attainment" | "orders" | "spiff" | "backlog" | "estimator";

// ─── Typography ──────────────────────────────────────────────────────────────
const SF: React.CSSProperties = {
  fontFamily: "-apple-system,BlinkMacSystemFont,'SF Pro Text','SF Pro Display','Helvetica Neue',Arial,sans-serif",
};
const NUM: React.CSSProperties = { fontVariantNumeric: "tabular-nums" };

// ════════════════════════════════════════════════════════════════════════════
// PRIMITIVES
// ════════════════════════════════════════════════════════════════════════════

function Card({ children, className = "", style = {} }: {
  children: React.ReactNode; className?: string; style?: React.CSSProperties;
}) {
  return (
    <div className={`rounded-2xl ${className}`} style={{
      backgroundColor: "var(--ios-card)", border: "0.5px solid var(--ios-sep)",
      boxShadow: "0 1px 4px rgba(0,0,0,0.07),0 0.5px 1px rgba(0,0,0,0.04)", ...style,
    }}>{children}</div>
  );
}

function HDivider({ className = "" }: { className?: string }) {
  return <div className={`mx-4 ${className}`} style={{ height: "0.5px", backgroundColor: "var(--ios-sep)" }} />;
}

function ProgressBar({ value, max = 100, color = BLUE, className = "" }: {
  value: number; max?: number; color?: string; className?: string;
}) {
  const pct = Math.min((value / max) * 100, 100);
  return (
    <div className={`rounded-full overflow-hidden ${className}`}
      style={{ height: 6, backgroundColor: "rgba(120,120,128,0.16)" }}>
      <div className="h-full rounded-full" style={{
        width: `${pct}%`, backgroundColor: color,
        transition: "width 0.6s cubic-bezier(0.4,0,0.2,1)",
      }} />
    </div>
  );
}

function Badge({ label, variant }: { label: string; variant: "green" | "blue" | "gray" | "red" | "amber" | "purple" }) {
  return (
    <span className="text-[11px] font-semibold px-2.5 py-[3px] rounded-full"
      style={{ backgroundColor: `var(--bdg-${variant}-bg)`, color: `var(--bdg-${variant}-fg)`, ...SF }}>
      {label}
    </span>
  );
}

// ─── SVG Donut ───────────────────────────────────────────────────────────────
function Donut({ value, max = 100, color, size = 88, stroke = 9, label, sub, isDark }: {
  value: number; max?: number; color: string; size?: number; stroke?: number;
  label?: string; sub?: string; isDark?: boolean;
}) {
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const circ = 2 * Math.PI * r;
  const dash = Math.min(value / max, 1) * circ;
  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={cx} cy={cx} r={r} fill="none"
          stroke={isDark ? "rgba(255,255,255,0.1)" : "rgba(120,120,128,0.14)"} strokeWidth={stroke} />
        <circle cx={cx} cy={cx} r={r} fill="none" stroke={color} strokeWidth={stroke}
          strokeLinecap="round" strokeDasharray={`${dash} ${circ - dash}`}
          style={{ transition: "stroke-dasharray 0.9s cubic-bezier(0.4,0,0.2,1)" }} />
      </svg>
      {(label || sub) && (
        <div className="absolute flex flex-col items-center justify-center text-center">
          {label && <span style={{ fontSize: size < 80 ? 13 : 18, fontWeight: 700, color, ...SF, ...NUM }}>{label}</span>}
          {sub && <span style={{ fontSize: 9, color: "#8E8E93", ...SF }}>{sub}</span>}
        </div>
      )}
    </div>
  );
}

// ─── Pie slice % label rendered inside slice ──────────────────────────────────
function SliceLabel(props: { cx?: number; cy?: number; midAngle?: number; outerRadius?: number; percent?: number }) {
  const { cx = 0, cy = 0, midAngle = 0, outerRadius = 0, percent = 0 } = props;
  if (percent < 0.05) return null;
  const rad = Math.PI / 180;
  const rx = cx + (outerRadius + 18) * Math.cos(-midAngle * rad);
  const ry = cy + (outerRadius + 18) * Math.sin(-midAngle * rad);
  return (
    <text x={rx} y={ry} fill="#8E8E93" textAnchor={rx > cx ? "start" : "end"}
      dominantBaseline="central" style={{ fontSize: 10, fontWeight: 600 }}>
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
}

// ─── Refresh Banner ──────────────────────────────────────────────────────────
function RefreshBanner({ isDark }: { isDark: boolean }) {
  return (
    <div className="mx-4 mb-3 mt-2 rounded-2xl px-4 py-3 flex items-center gap-3"
      style={{ background: `linear-gradient(135deg,${BLUE}14,${BLUE}06)`, border: `1px solid ${BLUE}28` }}>
      <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0"
        style={{ backgroundColor: `${BLUE}18` }}>
        <RefreshCw size={14} style={{ color: BLUE }} />
      </div>
      <div>
        <p style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#fff" : "#111", ...SF }}>
          Updated every 24h
        </p>
        <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 1, ...SF }}>
          Current selling period: <span style={{ fontWeight: 600, color: BLUE }}>H1 2026 (Jan 1 – Jun 30)</span>
        </p>
      </div>
    </div>
  );
}

// ─── Sidebar Drawer ───────────────────────────────────────────────────────────
const SIDEBAR_SCREENS: Screen[] = ["orders", "spiff", "backlog", "estimator"];

const SIDEBAR_NAV = [
  { screen: "orders"    as Screen, icon: Package,    label: "Orders",        desc: "All bookings & deal activity"   },
  { screen: "spiff"     as Screen, icon: Award,      label: "SPIFF & Bonus", desc: "Incentive programs & bonuses"   },
  { screen: "backlog"   as Screen, icon: BarChart2,  label: "Backlog",       desc: "Orders awaiting recognition"    },
  { screen: "estimator" as Screen, icon: Calculator, label: "Pay Estimator", desc: "Simulate projected earnings"    },
];

function Sidebar({ open, onClose, onNavigate, isDark }: {
  open: boolean; onClose: () => void; onNavigate: (s: Screen) => void; isDark: boolean;
}) {
  if (!open) return null;
  return (
    <div className="absolute inset-0 z-50 flex"
      style={{ backgroundColor: "rgba(0,0,0,0.5)", backdropFilter: "blur(6px)", WebkitBackdropFilter: "blur(6px)" }}
      onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        width: "80%", maxWidth: 300, height: "100%",
        backgroundColor: isDark ? "#1C1C1E" : "#F2F2F7",
        display: "flex", flexDirection: "column",
        boxShadow: "4px 0 32px rgba(0,0,0,0.25)",
      }}>
        <div className="flex items-center justify-between px-5 pt-10 pb-4">
          <div>
            <p style={{ fontSize: 20, fontWeight: 800, color: isDark ? "#fff" : "#111", ...SF }}>CompX</p>
            <p style={{ fontSize: 12, color: "#8E8E93", ...SF }}>Jordan Parker · Mid-Market AE</p>
          </div>
          <button onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center active:opacity-60"
            style={{ backgroundColor: isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)" }}>
            <X size={15} style={{ color: isDark ? "#fff" : "#333" }} />
          </button>
        </div>
        <div style={{ height: "0.5px", backgroundColor: "var(--ios-sep)", margin: "0 20px" }} />
        <div className="flex flex-col gap-1 px-3 py-4 flex-1 overflow-y-auto">
          {SIDEBAR_NAV.map(item => (
            <button key={item.screen} onClick={() => { onNavigate(item.screen); onClose(); }}
              className="flex items-center gap-3 px-3 py-3.5 rounded-xl text-left active:opacity-60 transition-opacity">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0"
                style={{ backgroundColor: `${BLUE}18` }}>
                <item.icon size={19} style={{ color: BLUE }} />
              </div>
              <div className="flex-1">
                <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#111", ...SF }}>{item.label}</p>
                <p style={{ fontSize: 12, color: "#8E8E93", ...SF }}>{item.desc}</p>
              </div>
              <ChevronRight size={14} style={{ color: "#C7C7CC" }} />
            </button>
          ))}
        </div>
        <div className="px-5 py-5" style={{ borderTop: "0.5px solid var(--ios-sep)" }}>
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-full flex items-center justify-center text-white text-[13px] font-bold flex-shrink-0"
              style={{ background: `linear-gradient(145deg,${BLUE},#0050B3)` }}>JP</div>
            <div>
              <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#fff" : "#111", ...SF }}>Jordan Parker</p>
              <div className="flex items-center gap-1.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: GREEN }} />
                <span style={{ fontSize: 11, color: GREEN, fontWeight: 600, ...SF }}>H1 FY2026 Active</span>
              </div>
            </div>
          </div>
          <button style={{ fontSize: 13, color: RED, fontWeight: 500, ...SF }}>Sign Out</button>
        </div>
      </div>
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// LAYOUT CHROME
// ════════════════════════════════════════════════════════════════════════════

function StatusBar({ isDark }: { isDark: boolean }) {
  const fg = isDark ? "#fff" : "#000";
  return (
    <div className="relative flex-shrink-0" style={{ height: 59 }}>
      <div style={{ position: "absolute", top: 11, left: "50%", transform: "translateX(-50%)", width: 126, height: 37, borderRadius: 20, backgroundColor: "#000", zIndex: 30 }} />
      <div style={{ position: "absolute", left: 24, top: 0, height: 59, display: "flex", alignItems: "center" }}>
        <span style={{ color: fg, fontSize: 15, fontWeight: 600, letterSpacing: "-0.3px", ...SF, ...NUM }}>9:41</span>
      </div>
      <div style={{ position: "absolute", right: 24, top: 0, height: 59, display: "flex", alignItems: "center", gap: 6 }}>
        <svg width="17" height="12" viewBox="0 0 17 12" fill="none">
          {[{ x: 0, h: 4 }, { x: 4, h: 6.5 }, { x: 8, h: 9 }, { x: 12, h: 12 }].map((b, i) => (
            <rect key={i} x={b.x} y={12 - b.h} width={3} height={b.h} rx={1} fill={i < 3 ? fg : `${fg}40`} />
          ))}
        </svg>
        <svg width="16" height="12" viewBox="0 0 16 12" fill={fg}>
          <circle cx="8" cy="10.5" r="1.5" />
          <path d="M8 6C5.8 6 3.8 6.9 2.3 8.4l1.4 1.4C4.9 8.6 6.3 8 8 8s3.1.6 4.3 1.8l1.4-1.4C12.2 6.9 10.2 6 8 6Z" opacity=".7" />
          <path d="M8 2.5C4.5 2.5 1.4 4 .1 6.5l1.5 1.1C2.9 5.5 5.3 4.5 8 4.5s5.1 1 6.4 3.1l1.5-1.1C14.6 4 11.5 2.5 8 2.5Z" opacity=".4" />
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 1 }}>
          <div style={{ width: 25, height: 12, borderRadius: 3.5, border: `1.5px solid ${isDark ? "rgba(255,255,255,0.35)" : "rgba(0,0,0,0.35)"}`, padding: 1.5, display: "flex", alignItems: "center" }}>
            <div style={{ width: "75%", height: "100%", borderRadius: 2, backgroundColor: fg }} />
          </div>
          <div style={{ width: 2, height: 5, borderRadius: "0 1px 1px 0", backgroundColor: isDark ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)" }} />
        </div>
      </div>
    </div>
  );
}

function Header({ screen, onBack, onMenu, isDark, onToggleDark }: {
  screen: Screen; onBack: () => void; onMenu: () => void; isDark: boolean; onToggleDark: () => void;
}) {
  const isSub = SIDEBAR_SCREENS.includes(screen);
  return (
    <header className="flex items-center justify-between px-4 flex-shrink-0" style={{
      height: 56, backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)",
      backgroundColor: "var(--ios-nav-bg)", borderBottom: "0.5px solid var(--ios-sep)", ...SF,
    }}>
      <div className="flex items-center gap-2">
        {isSub ? (
          <button onClick={onBack} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 active:opacity-50">
            <ChevronLeft size={24} style={{ color: "#8E8E93" }} />
          </button>
        ) : (
          <button onClick={onMenu} className="min-w-[44px] min-h-[44px] flex items-center justify-center -ml-2 active:opacity-50">
            <Menu size={20} style={{ color: isDark ? "#fff" : "#333" }} />
          </button>
        )}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-[10px] flex items-center justify-center text-white text-[12px] font-black"
            style={{ background: `linear-gradient(145deg,${BLUE},#0050B3)`, boxShadow: `0 2px 8px ${BLUE}55` }}>CX</div>
          <span style={{ fontSize: 17, fontWeight: 700, letterSpacing: "-0.3px", color: isDark ? "#fff" : "#111" }}>CompX</span>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <button onClick={onToggleDark}
          className="w-[34px] h-[34px] rounded-full flex items-center justify-center active:scale-90 transition-transform"
          style={{ backgroundColor: "var(--ios-fill)", border: "0.5px solid var(--ios-sep)" }}>
          {isDark ? <Sun size={15} style={{ color: "#FF9F0A" }} /> : <Moon size={15} style={{ color: "#8E8E93" }} />}
        </button>
        <div className="w-8 h-8 rounded-full flex items-center justify-center text-white text-[12px] font-bold"
          style={{ background: `linear-gradient(145deg,${BLUE},#0050B3)` }}>JP</div>
      </div>
    </header>
  );
}

// ─── 3-Tab Bottom Nav ─────────────────────────────────────────────────────────
const NAV_ITEMS = [
  { screen: "payments"   as Screen, icon: CreditCard, label: "Payments"   },
  { screen: "goaling"    as Screen, icon: Target,     label: "Goaling"    },
  { screen: "attainment" as Screen, icon: BarChart2,  label: "Attainment" },
];

function BottomNav({ active, onNavigate, isDark }: {
  active: Screen; onNavigate: (s: Screen) => void; isDark: boolean;
}) {
  const tab = SIDEBAR_SCREENS.includes(active) ? "payments" : active;
  return (
    <nav className="flex-shrink-0" style={{
      backdropFilter: "blur(20px) saturate(180%)", WebkitBackdropFilter: "blur(20px) saturate(180%)",
      backgroundColor: "var(--ios-nav-bg)", borderTop: "0.5px solid var(--ios-sep)",
    }}>
      <div className="flex items-center justify-around" style={{ height: 64 }}>
        {NAV_ITEMS.map(item => {
          const on = tab === item.screen;
          return (
            <button key={item.screen} onClick={() => onNavigate(item.screen)}
              className="flex flex-col items-center justify-center gap-1 active:scale-90 transition-transform"
              style={{ minWidth: 90, minHeight: 56 }}>
              <item.icon size={26} style={{ color: on ? BLUE : "#8E8E93", strokeWidth: on ? 2.5 : 1.75 }} />
              <span style={{ fontSize: 11, color: on ? BLUE : "#8E8E93", fontWeight: on ? 700 : 400 }}>{item.label}</span>
            </button>
          );
        })}
      </div>
      <div className="flex justify-center pb-1" style={{ height: 18 }}>
        <div className="rounded-full" style={{ width: 134, height: 5, backgroundColor: isDark ? "rgba(255,255,255,0.22)" : "rgba(0,0,0,0.18)" }} />
      </div>
    </nav>
  );
}

function SideButtons({ isDark }: { isDark: boolean }) {
  const grad  = isDark ? "linear-gradient(90deg,#4A4A4E,#3A3A3C)" : "linear-gradient(90deg,#B8B8BC,#A8A8AC)";
  const gradR = isDark ? "linear-gradient(270deg,#4A4A4E,#3A3A3C)" : "linear-gradient(270deg,#B8B8BC,#A8A8AC)";
  const shL   = isDark ? "inset -1px 0 2px rgba(0,0,0,0.5)" : "inset -1px 0 2px rgba(0,0,0,0.2)";
  const shR   = isDark ? "inset 1px 0 2px rgba(0,0,0,0.5)"  : "inset 1px 0 2px rgba(0,0,0,0.2)";
  const base  = { position: "absolute" as const, width: 5 };
  return (
    <>
      <div style={{ ...base, left: -5, top: 130, height: 34, borderRadius: "3px 0 0 3px", background: grad, boxShadow: shL }} />
      <div style={{ ...base, left: -5, top: 186, height: 44, borderRadius: "3px 0 0 3px", background: grad, boxShadow: shL }} />
      <div style={{ ...base, left: -5, top: 244, height: 44, borderRadius: "3px 0 0 3px", background: grad, boxShadow: shL }} />
      <div style={{ ...base, right: -5, top: 196, height: 72, borderRadius: "0 3px 3px 0", background: gradR, boxShadow: shR }} />
    </>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN — PAYMENTS
// ════════════════════════════════════════════════════════════════════════════
const PAY_PIE = [
  { name: "Goal Sheet",    value: 5858.25, color: BLUE   },
  { name: "SPIFF & Bonus", value: 2125.00, color: AMBER  },
  { name: "On-Top Bonus",  value: 100.00,  color: GREEN  },
  { name: "Adjustments",   value: 75.00,   color: PURPLE },
  { name: "Draws",         value: 50.00,   color: CYAN   },
  { name: "Other",         value: 200.00,  color: "#8E8E93" },
];

const PAY_HISTORY = [
  { month: "April 2026",    amount: "$6,830.00", v: "green" as const },
  { month: "March 2026",    amount: "$6,189.00", v: "green" as const },
  { month: "February 2026", amount: "$6,740.00", v: "green" as const },
  { month: "January 2026",  amount: "$5,912.00", v: "green" as const },
];

function PaymentsScreen({ isDark }: { isDark: boolean }) {
  const [hide, setHide] = useState(false);
  const total = PAY_PIE.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col" style={SF}>
      <RefreshBanner isDark={isDark} />

      {/* ── HERO: biggest element on screen ── */}
      <div className="px-4 pt-2 pb-6 mx-4 mb-4 rounded-3xl" style={{
        background: `linear-gradient(160deg,${BLUE}1A 0%,${BLUE}08 60%,transparent 100%)`,
        border: `1px solid ${BLUE}22`,
      }}>
        <div className="flex items-start justify-between mb-1">
          <div>
            <p style={{ fontSize: 11, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.08em" }}>
              Estimated Payout
            </p>
            <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>This Period · May 2026</p>
          </div>
          <button onClick={() => setHide(!hide)}
            className="w-9 h-9 rounded-xl flex items-center justify-center active:scale-90 mt-1"
            style={{ backgroundColor: "var(--ios-fill)" }}>
            {hide ? <EyeOff size={15} style={{ color: "#8E8E93" }} /> : <Eye size={15} style={{ color: "#8E8E93" }} />}
          </button>
        </div>

        {/* Giant hero number */}
        <div className="flex items-end gap-1 my-3">
          <span style={{ fontSize: 60, fontWeight: 900, letterSpacing: "-2.5px", color: BLUE, lineHeight: 1, ...NUM }}>
            {hide ? "••••••" : "$8,408"}
          </span>
          {!hide && <span style={{ fontSize: 26, fontWeight: 800, color: BLUE, marginBottom: 7, ...NUM }}>.25</span>}
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <div className="flex items-center gap-1">
            <ArrowUpRight size={14} style={{ color: GREEN }} />
            <span style={{ fontSize: 14, fontWeight: 700, color: GREEN }}>+37.5% vs April</span>
          </div>
          <span style={{ fontSize: 12, color: "#8E8E93" }}>· Pay date Jun 2, 2026</span>
        </div>

        <div className="mt-4">
          <div className="flex justify-between mb-1" style={{ fontSize: 11, color: "#8E8E93" }}>
            <span style={{ fontWeight: 600 }}>Period progress · 76%</span>
            <span style={NUM}>138 / 181 days</span>
          </div>
          <ProgressBar value={76} color={BLUE} />
        </div>
      </div>

      {/* Date strip */}
      <Card className="mx-4 mb-4">
        <div className="grid grid-cols-3 px-4 py-3 gap-2">
          {[["Pay Date", "Jun 2, 2026"], ["Lock Date", "May 28"], ["Rev Period", "May 1–18"]].map(([l, v]) => (
            <div key={l}>
              <p style={{ fontSize: 10, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 2 }}>{l}</p>
              <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{v}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Full-width Pie chart */}
      <Card className="mx-4 mb-4 p-4">
        <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 12 }}>Payment Breakdown</p>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={PAY_PIE} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                dataKey="value" startAngle={90} endAngle={-270}
                strokeWidth={2} stroke={isDark ? "#1C1C1E" : "#fff"}
                labelLine={false} label={SliceLabel}>
                {PAY_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`$${Number(v).toLocaleString("en-US", { minimumFractionDigits: 2 })}`, ""]}
                contentStyle={{ fontSize: 11, borderRadius: 12, border: "none", backgroundColor: isDark ? "#2C2C2E" : "#fff", color: isDark ? "#fff" : "#111", boxShadow: "0 4px 20px rgba(0,0,0,0.18)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Legend */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          {PAY_PIE.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span style={{ fontSize: 11, color: isDark ? "#EBEBF5" : "#555", ...SF }} className="truncate">{item.name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? "#fff" : "#333", marginLeft: "auto", flexShrink: 0, ...NUM }}>
                {Math.round((item.value / total) * 100)}%
              </span>
            </div>
          ))}
        </div>
        <div style={{ borderTop: "0.5px solid var(--ios-sep)", paddingTop: 10, marginTop: 10 }}
          className="flex justify-between items-center">
          <span style={{ fontSize: 13, fontWeight: 700, color: isDark ? "#fff" : "#111" }}>Total</span>
          <span style={{ fontSize: 16, fontWeight: 800, color: BLUE, ...NUM }}>
            ${total.toLocaleString("en-US", { minimumFractionDigits: 2 })}
          </span>
        </div>
      </Card>

      {/* Payment History */}
      <div className="px-4 pb-4">
        <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 8 }}>History</p>
        <Card>
          {PAY_HISTORY.map((p, i) => (
            <div key={i}>
              {i > 0 && <HDivider />}
              <div className="flex items-center justify-between px-4 py-3.5">
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{p.month}</p>
                  <Badge label="Paid" variant={p.v} />
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: isDark ? "#fff" : "#111", ...NUM }}>{p.amount}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div className="h-4" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN — GOALING
// ════════════════════════════════════════════════════════════════════════════
const PE_TABS = [
  { id: "PE1", label: "Prod+Services",    color: BLUE,   goal: 109000, achieved: 26000, bookings: 68000, backlog: 42000 },
  { id: "PE2", label: "Recurring Softw.", color: INDIGO, goal: 87000,  achieved: 62000, bookings: 90000, backlog: 28000 },
  { id: "PE3", label: "Services",         color: AMBER,  goal: 90000,  achieved: 40000, bookings: 85000, backlog: 45000 },
  { id: "KSO", label: "Key Sales Obj.",   color: GREEN,  goal: 2500,   achieved: 2500,  bookings: 0,     backlog: 0    },
];

const BACKLOG_ROWS = [
  { month: "July 2026", orders: 2, estPay: "+$2,100", amount: "$280K", color: BLUE  },
  { month: "Aug 2026",  orders: 2, estPay: "+$2,250", amount: "$300K", color: BLUE  },
  { month: "Sep 2026",  orders: 3, estPay: "+$1,575", amount: "$210K", color: AMBER },
  { month: "Oct 2026",  orders: 2, estPay: "+$1,500", amount: "$200K", color: BLUE  },
  { month: "Beyond",    orders: 4, estPay: "+$3,075", amount: "$410K", color: RED   },
];

function GoalingScreen({ isDark }: { isDark: boolean }) {
  const [tabIdx, setTabIdx] = useState(0);
  const pe = PE_TABS[tabIdx];
  const attainPct = Math.round((pe.achieved / pe.goal) * 100);
  const remaining = pe.goal - pe.achieved;

  const goalPieData = [
    { name: "Achieved", value: pe.achieved, color: pe.color },
    { name: "Remaining", value: Math.max(remaining, 0), color: isDark ? "rgba(255,255,255,0.09)" : "rgba(120,120,128,0.14)" },
  ];

  return (
    <div className="flex flex-col" style={SF}>
      <RefreshBanner isDark={isDark} />

      {/* Tab pills */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3" style={{ scrollbarWidth: "none" }}>
        {PE_TABS.map((t, i) => (
          <button key={t.id} onClick={() => setTabIdx(i)}
            className="flex-shrink-0 flex items-center gap-1.5 px-3 py-2 rounded-full text-[13px] font-semibold min-h-[40px] active:scale-95 transition-all"
            style={tabIdx === i ? { backgroundColor: t.color, color: "#fff" } : { backgroundColor: "var(--ios-fill)", color: "var(--bdg-gray-fg)" }}>
            <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.8 }}>{t.id}</span>{t.label}
          </button>
        ))}
      </div>

      {/* Full-width Pie: quota vs achievement */}
      <Card className="mx-4 mb-3 p-4">
        <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 4 }}>{pe.label}</p>
        <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 10 }}>Goal: ${pe.goal.toLocaleString()} · Period H1 2026</p>

        {/* Pie chart full width */}
        <div style={{ width: "100%", height: 190, position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={goalPieData} cx="50%" cy="50%" innerRadius={56} outerRadius={82}
                dataKey="value" startAngle={90} endAngle={-270} strokeWidth={0}>
                {goalPieData.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center label */}
          <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", pointerEvents: "none" }}>
            <span style={{ fontSize: 32, fontWeight: 900, color: pe.color, ...NUM, lineHeight: 1 }}>{attainPct}%</span>
            <span style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>Revenue</span>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-3 mt-3" style={{ borderTop: "0.5px solid var(--ios-sep)", paddingTop: 14 }}>
          {[
            ["Achieved", `$${(pe.achieved / 1000).toFixed(0)}k`, GREEN],
            ["Remaining", remaining > 0 ? `$${(remaining / 1000).toFixed(0)}k` : "Done", remaining > 0 ? RED : GREEN],
            ["Bookings", `$${(pe.bookings / 1000).toFixed(0)}k`, BLUE],
          ].map(([l, v, c]) => (
            <div key={l as string} className="flex flex-col items-center">
              <p style={{ fontSize: 10, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 3 }}>{l}</p>
              <p style={{ fontSize: 16, fontWeight: 700, color: c as string, ...NUM }}>{v}</p>
            </div>
          ))}
        </div>
        <ProgressBar value={attainPct} color={pe.color} className="mt-3" />
      </Card>

      {/* All periods mini donuts */}
      <Card className="mx-4 mb-3 p-4">
        <p style={{ fontSize: 13, fontWeight: 600, color: "#8E8E93", marginBottom: 10 }}>All Periods</p>
        <div className="grid grid-cols-4 gap-1">
          {PE_TABS.map((t, i) => {
            const pct = Math.round((t.achieved / t.goal) * 100);
            return (
              <button key={t.id} onClick={() => setTabIdx(i)}
                className="flex flex-col items-center gap-1 active:scale-95 transition-transform py-1">
                <Donut value={t.achieved} max={t.goal} color={t.color} size={56} stroke={6} label={`${pct}%`} isDark={isDark} />
                <span style={{ fontSize: 10, fontWeight: 700, color: t.color }}>{t.id}</span>
              </button>
            );
          })}
        </div>
      </Card>

      {/* Backlog */}
      <div className="px-4 pb-4">
        <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 8 }}>Backlog Pipeline</p>
        <Card>
          {BACKLOG_ROWS.map((b, i) => (
            <div key={i}>
              {i > 0 && <HDivider />}
              <div className="flex items-center justify-between px-4 py-3">
                <div>
                  <p style={{ fontSize: 14, fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{b.month}</p>
                  <p style={{ fontSize: 12, color: "#8E8E93" }}>{b.orders} orders · {b.estPay}</p>
                </div>
                <span style={{ fontSize: 18, fontWeight: 700, color: b.color, ...NUM }}>{b.amount}</span>
              </div>
            </div>
          ))}
        </Card>
      </div>
      <div className="h-4" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SCREEN — ATTAINMENT
// ════════════════════════════════════════════════════════════════════════════
const ATTAIN_PIE = [
  { name: "Prod+Services",    value: 26, color: BLUE   },
  { name: "Recurring Softw.", value: 62, color: INDIGO },
  { name: "Services",         value: 40, color: AMBER  },
  { name: "KSO",              value: 2,  color: GREEN  },
];

function AttainmentScreen({ isDark }: { isDark: boolean }) {
  const totalRev  = 26000 + 62000 + 40000 + 2500;
  const totalGoal = 109000 + 87000 + 90000 + 2500;
  const overallPct = Math.round((totalRev / totalGoal) * 100);
  const attainTotal = ATTAIN_PIE.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col" style={SF}>
      <RefreshBanner isDark={isDark} />

      {/* Overall hero */}
      <div className="px-4 mb-4">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.08em" }}>Overall Attainment</p>
            <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 2 }}>H1 2026 · Jan 1 – Jun 30</p>
          </div>
          <span style={{ fontSize: 44, fontWeight: 900, color: BLUE, ...NUM }}>{overallPct}%</span>
        </div>
        <ProgressBar value={overallPct} color={BLUE} />
        <p style={{ fontSize: 11, color: "#8E8E93", marginTop: 5, ...NUM }}>
          ${(totalRev / 1000).toFixed(0)}k of ${(totalGoal / 1000).toFixed(0)}k goal
        </p>
      </div>

      {/* Revenue mix — full-width pie */}
      <Card className="mx-4 mb-3 p-4">
        <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 2 }}>Revenue Mix</p>
        <p style={{ fontSize: 12, color: "#8E8E93", marginBottom: 8 }}>By plan element · current period</p>
        <div style={{ width: "100%", height: 200 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={ATTAIN_PIE} cx="50%" cy="50%" innerRadius={52} outerRadius={80}
                dataKey="value" startAngle={90} endAngle={-270}
                strokeWidth={2} stroke={isDark ? "#1C1C1E" : "#fff"}
                labelLine={false} label={SliceLabel}>
                {ATTAIN_PIE.map((e, i) => <Cell key={i} fill={e.color} />)}
              </Pie>
              <Tooltip
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                formatter={(v: any) => [`$${Number(v)}k`, ""]}
                contentStyle={{ fontSize: 11, borderRadius: 12, border: "none", backgroundColor: isDark ? "#2C2C2E" : "#fff", color: isDark ? "#fff" : "#111", boxShadow: "0 4px 16px rgba(0,0,0,0.15)" }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-2">
          {ATTAIN_PIE.map((item, i) => (
            <div key={i} className="flex items-center gap-1.5">
              <div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: item.color }} />
              <span style={{ fontSize: 11, color: isDark ? "#EBEBF5" : "#555" }} className="truncate">{item.name}</span>
              <span style={{ fontSize: 11, fontWeight: 600, color: isDark ? "#fff" : "#333", marginLeft: "auto", flexShrink: 0, ...NUM }}>
                {Math.round((item.value / attainTotal) * 100)}%
              </span>
            </div>
          ))}
        </div>
      </Card>

      {/* PE rows with donut */}
      <div className="px-4 mb-4">
        <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", marginBottom: 8 }}>Plan Elements</p>
        <Card>
          {PE_TABS.map((pe, i) => {
            const pct = Math.round((pe.achieved / pe.goal) * 100);
            return (
              <div key={pe.id}>
                {i > 0 && <HDivider />}
                <div className="flex items-center gap-3 px-4 py-3">
                  <Donut value={pe.achieved} max={pe.goal} color={pe.color} size={52} stroke={6} isDark={isDark} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span style={{ fontSize: 10, fontWeight: 800, color: "#fff", backgroundColor: pe.color, padding: "1.5px 6px", borderRadius: 5, flexShrink: 0 }}>{pe.id}</span>
                      <span style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#fff" : "#111" }} className="truncate">{pe.label}</span>
                    </div>
                    <p style={{ fontSize: 11, color: "#8E8E93", ...NUM }}>
                      ${(pe.achieved / 1000).toFixed(0)}k / ${(pe.goal / 1000).toFixed(0)}k goal
                    </p>
                    <ProgressBar value={pct} color={pe.color} className="mt-1.5" />
                  </div>
                  <span style={{ fontSize: 22, fontWeight: 800, color: pe.color, flexShrink: 0, ...NUM }}>{pct}%</span>
                </div>
              </div>
            );
          })}
        </Card>
      </div>

      {/* Estimated payout teaser */}
      <Card className="mx-4 mb-4 p-4" style={{ background: `linear-gradient(135deg,${BLUE}14,${BLUE}06)`, border: `1px solid ${BLUE}28` }}>
        <div className="flex items-center justify-between">
          <div>
            <p style={{ fontSize: 11, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.07em", fontWeight: 600, marginBottom: 4 }}>Estimated Payout</p>
            <span style={{ fontSize: 32, fontWeight: 900, color: BLUE, ...NUM }}>$8,408.25</span>
            <p style={{ fontSize: 12, color: GREEN, fontWeight: 600, marginTop: 3 }}>↑ 37.5% vs last period</p>
          </div>
          <ChevronRight size={22} style={{ color: BLUE }} />
        </div>
      </Card>
      <div className="h-4" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// SIDEBAR SCREENS
// ════════════════════════════════════════════════════════════════════════════
const ORDERS_DATA = [
  { id: "SO-105488", customer: "GlobalNet Inc",      partner: "Direct",          date: "May 14", status: "Full Revenue", tcv: "$96,000",  acv: "$96,000"  },
  { id: "SO-105310", customer: "BlueStar Solutions", partner: "Insight Enterpr.", date: "May 2",  status: "Full Revenue", tcv: "$178,000", acv: "$178,000" },
  { id: "SO-105188", customer: "Vertex Dynamics",    partner: "SHI Internatio.",  date: "Apr 28", status: "Full Revenue", tcv: "$145,000", acv: "$145,000" },
  { id: "SO-105078", customer: "Helix Networks",     partner: "CDW Corporat.",   date: "Apr 10", status: "Backlog",      tcv: "$210,000", acv: "$70,000"  },
  { id: "SO-104821", customer: "Acme Corp",          partner: "Direct",          date: "Mar 15", status: "Full Revenue", tcv: "$125,000", acv: "$125,000" },
];

function OrdersScreen({ isDark }: { isDark: boolean }) {
  const [search, setSearch] = useState("");
  const filtered = ORDERS_DATA.filter(o =>
    o.customer.toLowerCase().includes(search.toLowerCase()) ||
    o.id.toLowerCase().includes(search.toLowerCase())
  );
  return (
    <div className="flex flex-col gap-3 px-4 py-4" style={SF}>
      <div className="flex items-center justify-between">
        <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: isDark ? "#fff" : "#111" }}>Orders</h1>
        <button className="flex items-center gap-1.5 px-3 h-[36px] rounded-xl"
          style={{ backgroundColor: "var(--ios-fill)", color: BLUE, fontSize: 13, fontWeight: 600 }}>
          <Download size={13} /> Export
        </button>
      </div>
      <div className="flex items-center gap-2 rounded-2xl px-3 min-h-[44px]" style={{ backgroundColor: "var(--ios-fill)" }}>
        <Search size={15} style={{ color: "#8E8E93" }} />
        <input className="flex-1 bg-transparent text-[15px] outline-none placeholder-[#8E8E93]"
          style={{ color: isDark ? "#fff" : "#111" }} placeholder="Search orders…"
          value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <p style={{ fontSize: 13, color: "#8E8E93", ...NUM }}>{filtered.length} results</p>
      <div className="flex flex-col gap-2">
        {filtered.map(order => (
          <Card key={order.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>{order.id}</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{order.customer}</p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>{order.partner}</p>
              </div>
              <div className="flex flex-col items-end gap-1.5">
                <Badge label={order.status} variant={order.status === "Full Revenue" ? "green" : "amber"} />
                <p style={{ fontSize: 12, color: "#8E8E93" }}>{order.date}</p>
              </div>
            </div>
            <HDivider className="mb-3" />
            <div className="flex gap-6">
              {[["TCV", order.tcv], ["ACV", order.acv]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ fontSize: 11, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{l}</p>
                  <p style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111", ...NUM }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}

const SPIFF_ITEMS = [
  { name: "Q2 Cloud Migration SPIFF",     type: "SPIFF",       status: "Active",    proj: "$5,000",  pct: 25,  desc: "Close 5+ cloud migration deals over $250K TCV." },
  { name: "ARR 100%+ Accelerator",        type: "Accelerator", status: "Active",    proj: "$12,000", pct: 0,   desc: "Hit 100%+ ARR attainment to unlock 1.5x multiplier." },
  { name: "FY25 H2 Attainment Milestone", type: "Bonus",       status: "Completed", proj: "$7,560",  pct: 100, desc: "Bonus for exceeding 80% combined attainment in FY25 H2." },
  { name: "Partner Acceleration Q2",      type: "SPIFF",       status: "Active",    proj: "$3,500",  pct: 25,  desc: "Drive partner-sourced bookings to qualify." },
];

function SpiffScreen({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4" style={SF}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: isDark ? "#fff" : "#111" }}>SPIFF & Bonus</h1>
      <div className="grid grid-cols-2 gap-3">
        {[["Projected", "$24,700", BLUE], ["Paid YTD", "$18,015", isDark ? "#fff" : "#111"]].map(([l, v, c]) => (
          <Card key={l as string} className="p-4">
            <p style={{ fontSize: 11, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.06em", fontWeight: 600, marginBottom: 4 }}>{l}</p>
            <p style={{ fontSize: 22, fontWeight: 700, color: c as string, ...NUM }}>{v}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {SPIFF_ITEMS.map((item, i) => (
          <Card key={i} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 pr-3">
                <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{item.name}</p>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  <Badge label={item.type} variant="blue" />
                  <Badge label={item.status} variant={item.status === "Active" ? "green" : item.status === "Completed" ? "purple" : "gray"} />
                </div>
              </div>
              <p style={{ fontSize: 20, fontWeight: 700, color: BLUE, ...NUM }}>{item.proj}</p>
            </div>
            <ProgressBar value={item.pct} color={item.status === "Expired" ? "#8E8E93" : BLUE} className="mb-2" />
            <div className="flex justify-between" style={{ fontSize: 12, color: "#8E8E93" }}>
              <span>{item.pct}% complete</span>
            </div>
            <p style={{ fontSize: 12, color: "#8E8E93", marginTop: 6, lineHeight: 1.5 }}>{item.desc}</p>
          </Card>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}

const BACKLOG_ORDERS = [
  { id: "SO-105078", customer: "Helix Networks",   book: "Apr 17", backlog: "$210,000", fulfill: "Jul 15", days: 50,   daysColor: AMBER, pay: "Aug 2026" },
  { id: "SO-103544", customer: "Beacon Health",    book: "Feb 4",  backlog: "$152,000", fulfill: "Sep 18", days: 115,  daysColor: RED,   pay: "Oct 2026" },
  { id: "SO-103220", customer: "Cortex Financial", book: "Jan 17", backlog: "$115,000", fulfill: "Oct 15", days: 142,  daysColor: RED,   pay: "Nov 2026" },
  { id: "SO-103105", customer: "Summit Logistics", book: "Jan 12", backlog: "$142,000", fulfill: "—",      days: null, daysColor: BLUE,  pay: "—"       },
];

function BacklogScreen({ isDark }: { isDark: boolean }) {
  return (
    <div className="flex flex-col gap-3 px-4 py-4" style={SF}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: isDark ? "#fff" : "#111" }}>Backlog</h1>
      <div className="grid grid-cols-3 gap-2">
        {[["Total", "$1.4M", BLUE], ["Soonest", "$280k", GREEN], ["At Risk", "$267k", RED]].map(([l, v, c]) => (
          <Card key={l as string} className="p-3">
            <p style={{ fontSize: 10, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 3 }}>{l}</p>
            <p style={{ fontSize: 16, fontWeight: 700, color: c as string, ...NUM }}>{v}</p>
          </Card>
        ))}
      </div>
      <div className="flex flex-col gap-2">
        {BACKLOG_ORDERS.map(order => (
          <Card key={order.id} className="p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <p style={{ fontSize: 13, fontWeight: 600, color: BLUE }}>{order.id}</p>
                <p style={{ fontSize: 16, fontWeight: 600, color: isDark ? "#fff" : "#111" }}>{order.customer}</p>
                <p style={{ fontSize: 12, color: "#8E8E93" }}>Booked {order.book}</p>
              </div>
              {order.days !== null && (
                <div className="text-right">
                  <span style={{ fontSize: 22, fontWeight: 700, color: order.daysColor, ...NUM }}>{order.days}d</span>
                  <p style={{ fontSize: 11, color: "#8E8E93" }}>to fulfill</p>
                </div>
              )}
            </div>
            <HDivider className="mb-3" />
            <div className="grid grid-cols-2 gap-3">
              {[["Backlog", order.backlog], ["Fulfillment", order.fulfill], ["Est. Pay", order.pay]].map(([l, v]) => (
                <div key={l}>
                  <p style={{ fontSize: 10, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>{l}</p>
                  <p style={{ fontSize: 13, fontWeight: 600, color: isDark ? "#fff" : "#111", ...NUM }}>{v}</p>
                </div>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <div className="h-4" />
    </div>
  );
}

const EST_DATA = [
  { rev: "$4.4M",  earnings: 20000,  current: false, attained: true  },
  { rev: "$8M",    earnings: 38000,  current: false, attained: true  },
  { rev: "$12M",   earnings: 56000,  current: false, attained: true  },
  { rev: "$15.7M", earnings: 74332,  current: true,  attained: true  },
  { rev: "$17M",   earnings: 84000,  current: false, attained: false },
  { rev: "$19M",   earnings: 96000,  current: false, attained: false },
  { rev: "$21M",   earnings: 108000, current: false, attained: false },
  { rev: "$24M",   earnings: 130000, current: false, attained: false },
];

function EstimatorScreen({ isDark }: { isDark: boolean }) {
  const [addRev, setAddRev] = useState("0");
  return (
    <div className="flex flex-col gap-3 px-4 py-4" style={SF}>
      <h1 style={{ fontSize: 28, fontWeight: 800, letterSpacing: "-0.5px", color: isDark ? "#fff" : "#111" }}>Pay Estimator</h1>
      <div className="grid grid-cols-3 gap-2">
        {[["Revenue", "$15.7M", BLUE], ["Incentive", "$74,332", INDIGO], ["Goal", "$21.8M", GREEN]].map(([l, v, c]) => (
          <Card key={l as string} className="p-3">
            <p style={{ fontSize: 10, color: "#8E8E93", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, marginBottom: 3 }}>{l}</p>
            <p style={{ fontSize: 14, fontWeight: 700, color: isDark ? "#fff" : "#111", ...NUM }}>{v}</p>
          </Card>
        ))}
      </div>
      <Card className="p-4">
        <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#111", marginBottom: 10 }}>Simulate Additional Revenue</p>
        <div className="flex items-center gap-2 rounded-2xl px-3 min-h-[48px]"
          style={{ backgroundColor: "var(--ios-fill)", border: "0.5px solid var(--ios-sep)" }}>
          <span style={{ color: "#8E8E93", fontSize: 15 }}>$</span>
          <input type="number" value={addRev} onChange={e => setAddRev(e.target.value)}
            className="flex-1 bg-transparent text-[15px] outline-none"
            style={{ color: isDark ? "#fff" : "#111", ...NUM }} placeholder="0" />
        </div>
      </Card>
      <Card className="p-4">
        <p style={{ fontSize: 15, fontWeight: 600, color: isDark ? "#fff" : "#111", marginBottom: 10 }}>Earnings Curve</p>
        <div style={{ height: 160 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={EST_DATA} barSize={14} margin={{ top: 4, right: 4, bottom: 4, left: 4 }}>
              <XAxis dataKey="rev" tick={{ fontSize: 8, fill: "#8E8E93" }} />
              <YAxis tick={{ fontSize: 8, fill: "#8E8E93" }} tickFormatter={v => `$${(Number(v) / 1000).toFixed(0)}k`} width={32} />
              <Tooltip formatter={(v: unknown) => [`$${Number(v).toLocaleString()}`, "Earnings"]}
                contentStyle={{ fontSize: 11, borderRadius: 12, backgroundColor: isDark ? "#1C1C1E" : "#fff", borderColor: "transparent", color: isDark ? "#fff" : "#111", boxShadow: "0 4px 20px rgba(0,0,0,0.15)" }} />
              <ReferenceLine x="$15.7M" stroke={BLUE} strokeDasharray="3 3" />
              <Bar dataKey="earnings" radius={[4, 4, 0, 0]}>
                {EST_DATA.map((e, i) => <Cell key={i} fill={e.current ? BLUE : e.attained ? "#FBBF24" : isDark ? "#3A3A3C" : "#E5E5EA"} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>
      <Card className="p-4">
        <div className="flex items-center justify-between">
          <span style={{ fontSize: 15, fontWeight: 700, color: isDark ? "#fff" : "#111" }}>Total Estimated</span>
          <span style={{ fontSize: 22, fontWeight: 800, color: BLUE, ...NUM }}>$113,382</span>
        </div>
      </Card>
      <div className="h-4" />
    </div>
  );
}

// ════════════════════════════════════════════════════════════════════════════
// ROOT APP
// ════════════════════════════════════════════════════════════════════════════
export default function App() {
  const [screen,  setScreen]  = useState<Screen>("payments");
  const [isDark,  setIsDark]  = useState(false);
  const [sidebar, setSidebar] = useState(false);

  const bezel = isDark
    ? "linear-gradient(160deg,#5A5A5E 0%,#2C2C2E 35%,#4A4A4E 65%,#3A3A3C 100%)"
    : "linear-gradient(160deg,#E2E2E4 0%,#A8A8AA 35%,#CECECE 65%,#B8B8BC 100%)";

  const screenMap: Record<Screen, React.ReactNode> = {
    payments:   <PaymentsScreen   isDark={isDark} />,
    goaling:    <GoalingScreen    isDark={isDark} />,
    attainment: <AttainmentScreen isDark={isDark} />,
    orders:     <OrdersScreen     isDark={isDark} />,
    spiff:      <SpiffScreen      isDark={isDark} />,
    backlog:    <BacklogScreen    isDark={isDark} />,
    estimator:  <EstimatorScreen  isDark={isDark} />,
  };

  return (
    <div className="flex items-center justify-center min-h-screen"
      style={{ backgroundColor: isDark ? "#111" : "#E8E8ED", ...SF }}>
      <div style={{ position: "relative" }}>
        <SideButtons isDark={isDark} />
        <div style={{
          borderRadius: 57, padding: 3, background: bezel,
          boxShadow: [
            "0 0 0 0.5px rgba(0,0,0,0.25)",
            `0 30px 80px rgba(0,0,0,${isDark ? 0.7 : 0.45})`,
            `0 10px 30px rgba(0,0,0,${isDark ? 0.4 : 0.2})`,
            "0 2px 8px rgba(0,0,0,0.3)",
          ].join(","),
        }}>
          <div className={isDark ? "dark" : ""} style={{
            width: 393, height: 852, borderRadius: 54,
            overflow: "hidden", display: "flex", flexDirection: "column",
            backgroundColor: "var(--ios-bg)", position: "relative",
          }}>
            <StatusBar isDark={isDark} />
            <Header
              screen={screen}
              onBack={() => setScreen("payments")}
              onMenu={() => setSidebar(true)}
              isDark={isDark}
              onToggleDark={() => setIsDark(d => !d)}
            />
            <main style={{ flex: 1, overflowY: "auto", backgroundColor: "var(--ios-bg)", WebkitOverflowScrolling: "touch", position: "relative" }}>
              {screenMap[screen]}
              <Sidebar
                open={sidebar}
                onClose={() => setSidebar(false)}
                onNavigate={s => { setScreen(s); setSidebar(false); }}
                isDark={isDark}
              />
            </main>
            <BottomNav active={screen} onNavigate={s => setScreen(s)} isDark={isDark} />
          </div>
        </div>
      </div>
    </div>
  );
}
