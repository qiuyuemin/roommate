const screens={device:"./assets/screens/00-device.png",subhome:"./assets/screens/00-subhome.png",manualIdle:"./assets/screens/01-manual-off.png",fitAdjust:"./assets/screens/02-fit-check.png",fitSuccess:"./assets/screens/03-manual-running.png",countdown:"./assets/screens/04-auto-enabled.png",manualRunning:"./assets/screens/03-manual-running-off.png",autoStimulation:"./assets/screens/05-stimulation-auto.png",autoExpression:"./assets/screens/06-expression-auto.png",list:"./assets/screens/08-rhythm-sheet-1.png",listExpanded:"./assets/screens/09-rhythm-sheet-2.png",switchConfirm:"./assets/screens/10-confirm-dialog.png",listRunning:"./assets/screens/11-rhythm-running.png",milkBoostStimulation:"./assets/screens/12-stop-session.png",milkBoostExpression:"./assets/screens/13-save-volume.png",logAmount:"./assets/screens/14-result.png",logged:"./assets/screens/14-logged.png",result:"./assets/screens/15-result-pack.png"};
const image=document.getElementById("screen-image"),hotspot=document.getElementById("hotspot"),secondary=document.getElementById("secondary-hotspot"),holdProgress=document.getElementById("hold-progress");
let current="device",stateTimer=0,holdTimer=0;
function area(el,x,y,w,h){el.style.left=`${x/402*100}%`;el.style.top=`${y/874*100}%`;el.style.width=`${w/402*100}%`;el.style.height=`${h/874*100}%`}
function clearTimers(){clearTimeout(stateTimer);clearTimeout(holdTimer);holdProgress.hidden=true;holdProgress.classList.remove("active")}
function setScreen(name){
 clearTimers();current=name;image.src=screens[name];secondary.hidden=true;hotspot.onpointerdown=null;hotspot.onpointerup=null;hotspot.onpointercancel=null;hotspot.onpointerleave=null;hotspot.onclick=null;
 if(name==="device"){area(hotspot,16,121,361,280);hotspot.onclick=()=>setScreen("subhome")}
 else if(name==="subhome"){area(hotspot,286,783,91,58);hotspot.onclick=()=>setScreen("manualIdle")}
 else if(name==="manualIdle"){area(hotspot,20,794,362,56);hotspot.onclick=()=>setScreen("fitAdjust")}
 else if(name==="fitAdjust"){area(hotspot,0,0,0,0);stateTimer=setTimeout(()=>setScreen("fitSuccess"),1800)}
 else if(name==="fitSuccess"){area(hotspot,0,0,0,0);stateTimer=setTimeout(()=>setScreen("countdown"),1300)}
 else if(name==="countdown"){area(hotspot,0,0,0,0);stateTimer=setTimeout(()=>setScreen("manualRunning"),1600)}
 else if(name==="manualRunning"){area(hotspot,318,389,58,45);hotspot.onclick=()=>setScreen("autoStimulation")}
 else if(name==="autoStimulation"){area(hotspot,16,286,370,92);hotspot.onclick=()=>setScreen("autoExpression");stateTimer=setTimeout(()=>setScreen("autoExpression"),3000)}
 else if(name==="autoExpression"){area(hotspot,16,286,370,94);hotspot.onclick=()=>setScreen("list")}
 else if(name==="list"){area(hotspot,16,532,370,62);hotspot.onclick=()=>setScreen("listExpanded")}
 else if(name==="listExpanded"){area(hotspot,326,544,59,56);hotspot.onclick=()=>setScreen("switchConfirm")}
 else if(name==="switchConfirm"){area(hotspot,66,425,270,49);hotspot.onclick=()=>setScreen("listRunning");secondary.hidden=false;area(secondary,66,483,270,49);secondary.onclick=()=>setScreen("listExpanded")}
 else if(name==="listRunning"){area(hotspot,16,68,48,62);hotspot.onclick=()=>setScreen("milkBoostStimulation");stateTimer=setTimeout(()=>setScreen("milkBoostStimulation"),900)}
 else if(name==="milkBoostStimulation"){setupHold();secondary.hidden=false;area(secondary,16,287,370,130);secondary.onclick=()=>setScreen("milkBoostExpression");stateTimer=setTimeout(()=>setScreen("milkBoostExpression"),3000)}
 else if(name==="milkBoostExpression")setupHold();
 else if(name==="logAmount"){area(hotspot,20,788,362,54);hotspot.onclick=()=>setScreen("logged")}
 else if(name==="logged"){area(hotspot,0,0,0,0);stateTimer=setTimeout(()=>setScreen("result"),2000)}
 else if(name==="result"){area(hotspot,16,66,48,48);hotspot.onclick=()=>setScreen("subhome")}
}
function setupHold(){area(hotspot,20,793,298,57);hotspot.onclick=null;hotspot.onpointerdown=()=>{holdProgress.hidden=false;requestAnimationFrame(()=>holdProgress.classList.add("active"));holdTimer=setTimeout(()=>setScreen("logAmount"),900)};const cancel=()=>{clearTimeout(holdTimer);holdProgress.classList.remove("active");holdProgress.hidden=true};hotspot.onpointerup=cancel;hotspot.onpointercancel=cancel;hotspot.onpointerleave=cancel}
image.addEventListener("error",()=>{image.alt="Unable to load the Figma screen asset"});setScreen("device");
