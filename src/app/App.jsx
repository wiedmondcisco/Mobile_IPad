import { useEffect, useState } from "react";
import { MobileFrame } from "./MobileFrame.jsx";
import { BareFrame } from "./MobileShell.jsx";
import { DeviceToggle } from "./device.jsx";
import { BareIPad, IPadFrame } from "./ipad.jsx";
import { useCompXState } from "./state.js";

/* The app always renders bare (no mock device shell): phones get the phone
   layout, tablet-width and up gets the sidebar (iPad) layout, wide screens
   use its landscape variant. The framed iPhone/iPad demo stage is still
   reachable with ?frame for presentations. */
const FORCE_FRAME = new URLSearchParams(window.location.search).has("frame");
const vwNow = () => window.innerWidth > 0 ? window.innerWidth : 1280;

export function App() {
  const s = useCompXState();
  const [device, setDevice] = useState("mobile");
  const [orientation, setOrientation] = useState("portrait");   // framed iPad only
  const [vw, setVw] = useState(vwNow());
  useEffect(() => {
    if (FORCE_FRAME) return;
    const sync = () => setVw(vwNow());
    sync();                                   // re-check once layout has settled
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
  useEffect(() => { document.body.classList.toggle("bare-body", !FORCE_FRAME); }, []);

  if (!FORCE_FRAME) {
    return <div className="app-root app-bare">
      {vw >= 768 ? <BareIPad s={s} landscape={vw >= 1000}/> : <BareFrame s={s}/>}
    </div>;
  }

  const land = device==="ipad" && orientation==="landscape";
  return <div className={`app-root app-${device} ${land?"app-land":""}`}>
    <DeviceToggle device={device} setDevice={setDevice} orientation={orientation}
      onRotate={()=>setOrientation(o=>o==="portrait"?"landscape":"portrait")}/>
    <div className={`frame-stage frame-stage-${device} ${land?"land":""}`}>
      {device === "mobile" ? <MobileFrame s={s}/> : <IPadFrame s={s} landscape={land}/>}
    </div>
  </div>;
}
