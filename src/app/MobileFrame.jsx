import { SafariBar, StatusBar, useUrlBarCollapse } from "./device.jsx";
import { MobileShell } from "./MobileShell.jsx";

/* Framed demo — the app inside an iPhone mockup (bezel, mock status bar,
   Safari chrome). The real-device build renders BareFrame instead. */
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
        <MobileShell s={s} onScroll={onScroll}/>
        <SafariBar mini={urlMini} onExpand={()=>setUrlMini(false)}/>
        <div className="m-home"/>
      </div>
    </div>
  </div>;
}
