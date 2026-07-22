import { useState, useRef } from "react";
import { ChevronLeft, ChevronRight, Copy, Plus, RefreshCw, RotateCw, Share, Smartphone, Tablet } from "lucide-react";

export function CiscoLogo({className=""}) {
  const S = {y:10.24, h:6.41}, M = {y:5.93, h:10.72}, T = {y:0.03, h:19.74};
  return <div className={`cisco-logo ${className}`} aria-label="Cisco">
    <svg viewBox="0 0 72 19.8" fill="none" aria-hidden="true">
      {[S,M,T,M,S,M,T,M,S].map((b,i)=><rect key={i} x={(i*8.609).toFixed(2)} y={b.y} width="3.14" height={b.h} rx="1.57" fill="currentColor"/>)}
    </svg>
    <span>cisco</span>
  </div>;
}

/* iOS status bar (time + signal / wifi / battery) */
export function StatusBar() {
  return <div className="m-statusbar">
    <span className="m-sb-time">7:37</span>
    <div className="m-sb-icons">
      {/* signal */}
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
        {[[0,4],[4.5,6],[9,8.5],[13.5,11]].map(([x,h],i)=>
          <rect key={i} x={x} y={11-h} width="3" height={h} rx="1" fill="currentColor"/>)}
      </svg>
      {/* wifi */}
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
        <path d="M8.5 2.4c2.8 0 5.4 1.1 7.3 2.9l1.2-1.4C14.8 1.7 11.8.5 8.5.5S2.2 1.7 0 3.9l1.2 1.4C3.1 3.5 5.7 2.4 8.5 2.4Z"/>
        <path d="M8.5 5.6c1.7 0 3.2.7 4.4 1.8l1.2-1.4C12.6 4.6 10.6 3.8 8.5 3.8s-4.1.8-5.6 2.2l1.2 1.4C5.3 6.3 6.8 5.6 8.5 5.6Z"/>
        <path d="M8.5 8.7c.8 0 1.6.3 2.1.9l-2.1 2.4-2.1-2.4c.5-.6 1.3-.9 2.1-.9Z"/>
      </svg>
      {/* battery */}
      <div className="m-sb-batt"><div className="m-sb-batt-fill"/></div>
    </div>
  </div>;
}

/* iPad status bar (time + date on the left, radios on the right) */
export function IPadStatusBar() {
  return <div className="i-statusbar">
    <span className="i-sb-time">9:41 AM · Tue May 26</span>
    <div className="m-sb-icons">
      <svg width="18" height="12" viewBox="0 0 18 12" fill="none">
        {[[0,4],[4.5,6],[9,8.5],[13.5,11]].map(([x,h],i)=><rect key={i} x={x} y={11-h} width="3" height={h} rx="1" fill="currentColor"/>)}
      </svg>
      <svg width="17" height="12" viewBox="0 0 17 12" fill="currentColor">
        <path d="M8.5 2.4c2.8 0 5.4 1.1 7.3 2.9l1.2-1.4C14.8 1.7 11.8.5 8.5.5S2.2 1.7 0 3.9l1.2 1.4C3.1 3.5 5.7 2.4 8.5 2.4Z"/>
        <path d="M8.5 5.6c1.7 0 3.2.7 4.4 1.8l1.2-1.4C12.6 4.6 10.6 3.8 8.5 3.8s-4.1.8-5.6 2.2l1.2 1.4C5.3 6.3 6.8 5.6 8.5 5.6Z"/>
        <path d="M8.5 8.7c.8 0 1.6.3 2.1.9l-2.1 2.4-2.1-2.4c.5-.6 1.3-.9 2.1-.9Z"/>
      </svg>
      <div className="m-sb-batt"><div className="m-sb-batt-fill"/></div>
    </div>
  </div>;
}



export const SITE_DOMAIN = "sed-stage.cisco.com";

export function SafariBar({mini, onExpand}) {
  return <div className={`m-safari ${mini?"mini":""}`} onClick={mini?onExpand:undefined}>
    {mini
      ? <span className="m-safari-mini-domain">{SITE_DOMAIN}</span>
      : <>
        <button className="m-safari-nav" aria-label="Back"><ChevronLeft size={20}/></button>
        <button className="m-safari-nav dim" aria-label="Forward"><ChevronRight size={20}/></button>
        <div className="m-safari-pill">
          <span className="m-safari-aa">AA</span>
          <span className="m-safari-domain">{SITE_DOMAIN}</span>
          <RefreshCw size={13} className="m-safari-refresh"/>
        </div>
        <button className="m-safari-nav" aria-label="Share"><Share size={18}/></button>
        <button className="m-safari-nav" aria-label="Tabs"><Copy size={18}/></button>
      </>}
  </div>;
}

/* URL-bar collapse driver. Collapsing/expanding the bar resizes the scroll
   container, and near the bottom of a long page the browser then clamps
   scrollTop, firing a reverse scroll event that re-toggles the bar — an
   oscillation that shakes the whole screen. Guards: never collapse without
   ample room left to scroll, and ignore events while a flip's layout
   change (and its .25s animation) settles. */

export function useUrlBarCollapse() {
  const [mini, setMini] = useState(false);
  const lastY = useRef(0);
  const lastFlip = useRef(0);
  const onScroll = e => {
    const el = e.currentTarget;
    const y = el.scrollTop;
    const dy = y - lastY.current;
    lastY.current = y;

    const flip = next => { lastFlip.current = performance.now(); setMini(next); };
    if (y < 24) { if (mini) flip(false); return; }              // at top: always expanded
    if (performance.now() - lastFlip.current < 320) return;     // let the last flip settle

    const room = el.scrollHeight - el.clientHeight - y;          // distance to bottom
    if (!mini && dy > 8 && room > 140) flip(true);               // collapse only with room to spare
    else if (mini && dy < -10) flip(false);
  };
  return [mini, setMini, onScroll];
}

export function IPadSafariBar({mini, onExpand}) {
  return <div className={`i-safari ${mini?"mini":""}`} onClick={mini?onExpand:undefined}>
    {mini
      ? <span className="i-safari-mini-domain">{SITE_DOMAIN}</span>
      : <>
        <div className="i-safari-cluster">
          <button className="i-safari-nav" aria-label="Back"><ChevronLeft size={19}/></button>
          <button className="i-safari-nav dim" aria-label="Forward"><ChevronRight size={19}/></button>
        </div>
        <div className="i-safari-pill">
          <span className="m-safari-aa">AA</span>
          <span className="i-safari-domain">{SITE_DOMAIN}</span>
          <RefreshCw size={13} className="m-safari-refresh"/>
        </div>
        <div className="i-safari-cluster">
          <button className="i-safari-nav" aria-label="Share"><Share size={17}/></button>
          <button className="i-safari-nav" aria-label="New tab"><Plus size={19}/></button>
          <button className="i-safari-nav" aria-label="Tabs"><Copy size={17}/></button>
        </div>
      </>}
  </div>;
}

export function DeviceToggle({device, setDevice, orientation, onRotate}) {
  return <div className="dev-toggle" role="group" aria-label="Preview device">
    <span className="dev-toggle-lbl">Preview</span>
    <div className="dev-toggle-pills">
      <button className={device==="mobile"?"on":""} onClick={()=>setDevice("mobile")}><Smartphone size={14}/> Mobile</button>
      <button className={device==="ipad"?"on":""} onClick={()=>setDevice("ipad")}><Tablet size={14}/> iPad</button>
    </div>
    {device==="ipad" && <button className="dev-rotate" onClick={onRotate} aria-label="Rotate iPad">
      <RotateCw size={13} className={orientation==="landscape"?"turned":""}/> {orientation==="portrait"?"Landscape":"Portrait"}
    </button>}
  </div>;
}

