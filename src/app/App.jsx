import { useState } from "react";
import { MobileFrame } from "./MobileFrame.jsx";
import { DeviceToggle } from "./device.jsx";
import { IPadFrame } from "./ipad.jsx";
import { useCompXState } from "./state.js";

export function App() {
  const s = useCompXState();
  const [device, setDevice] = useState("mobile");
  const [orientation, setOrientation] = useState("portrait");   // iPad only
  const land = device==="ipad" && orientation==="landscape";
  return <div className={`app-root app-${device} ${land?"app-land":""}`}>
    <DeviceToggle device={device} setDevice={setDevice} orientation={orientation}
      onRotate={()=>setOrientation(o=>o==="portrait"?"landscape":"portrait")}/>
    <div className={`frame-stage frame-stage-${device} ${land?"land":""}`}>
      {device === "mobile" ? <MobileFrame s={s}/> : <IPadFrame s={s} landscape={land}/>}
    </div>
  </div>;
}
