import { useEffect, useState } from "react";
import { MobileFrame } from "./MobileFrame.jsx";
import { BareFrame } from "./MobileShell.jsx";
import { DeviceToggle } from "./device.jsx";
import { IPadFrame } from "./ipad.jsx";
import { useCompXState } from "./state.js";

/* The app always renders bare (no mock device shell) — full-bleed on phones,
   a centered column on wide screens. The framed iPhone/iPad demo stage is
   still reachable with ?frame for presentations. */
const FORCE_FRAME = new URLSearchParams(window.location.search).has("frame");

export function App() {
  const s = useCompXState();
  const [device, setDevice] = useState("mobile");
  const [orientation, setOrientation] = useState("portrait");   // iPad only
  const bare = !FORCE_FRAME;
  useEffect(() => { document.body.classList.toggle("bare-body", bare); }, [bare]);

  if (bare) return <div className="app-root app-bare"><BareFrame s={s}/></div>;

  const land = device==="ipad" && orientation==="landscape";
  return <div className={`app-root app-${device} ${land?"app-land":""}`}>
    <DeviceToggle device={device} setDevice={setDevice} orientation={orientation}
      onRotate={()=>setOrientation(o=>o==="portrait"?"landscape":"portrait")}/>
    <div className={`frame-stage frame-stage-${device} ${land?"land":""}`}>
      {device === "mobile" ? <MobileFrame s={s}/> : <IPadFrame s={s} landscape={land}/>}
    </div>
  </div>;
}
