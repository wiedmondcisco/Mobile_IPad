import { useEffect, useState } from "react";
import { MobileFrame } from "./MobileFrame.jsx";
import { BareFrame } from "./MobileShell.jsx";
import { DeviceToggle } from "./device.jsx";
import { IPadFrame } from "./ipad.jsx";
import { useCompXState } from "./state.js";

/* Bare mode: on a real phone-sized viewport the app renders full-bleed —
   no mock bezel or Safari chrome. Overrides: ?bare forces it (testing on
   desktop), ?frame forces the framed demo (e.g. screenshots on a phone). */
const QUERY = new URLSearchParams(window.location.search);
const FORCE_BARE = QUERY.has("bare"), FORCE_FRAME = QUERY.has("frame");
const isBareViewport = () => window.innerWidth > 0 && window.innerWidth <= 520;

export function App() {
  const s = useCompXState();
  const [device, setDevice] = useState("mobile");
  const [orientation, setOrientation] = useState("portrait");   // iPad only
  const [bare, setBare] = useState(FORCE_BARE || (!FORCE_FRAME && isBareViewport()));
  useEffect(() => {
    if (FORCE_BARE || FORCE_FRAME) return;
    const sync = () => setBare(isBareViewport());
    sync();                                   // re-check once layout has settled
    window.addEventListener("resize", sync);
    return () => window.removeEventListener("resize", sync);
  }, []);
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
