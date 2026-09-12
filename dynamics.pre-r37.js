/* 55-second mock: physiological flow is independent from the selected pumping mode.
   One bowl holds 180 ml = 6.09 oz; this mock ends the session at its full capacity. */
var AIR2_BOWL_CAPACITY_OZ = 6.09;
var air2DemoRun = { prompted:false, autoMoved:false, finishing:false };
function air2Round(value){return Math.round(value*100)/100;}
function air2FlowAt(second){var t=Math.max(0,second||0);if(t<8)return 0;if(t<18)return .012+(t-8)*.006;if(t<31)return .10+(t-18)*.022;if(t<43)return .386-(t-31)*.018;return Math.max(.018,.17-(t-43)*.024);}
function air2FlowKind(flow){return flow<.01?'none':flow<.09?'low':flow<.22?'medium':'high';}
function air2IntegratedMilk(second,side){var total=0,t=Math.max(0,Math.floor(second||0));for(var s=0;s<t;s+=1)total+=air2FlowAt(s);return Math.min(AIR2_BOWL_CAPACITY_OZ,total*(side==='r'?1.025:.985));}
function air2ShowNotice(kind,text){state.controlNotice={kind:kind,text:text,id:Date.now()};setTimeout(function(){if(state.controlNotice&&state.controlNotice.kind===kind){state.controlNotice=null;v4View();}},3600);}
function air2FinishFullBowl(){if(air2DemoRun.finishing)return;air2DemoRun.finishing=true;state.running=false;state.paused=false;air2ShowNotice('complete','One bowl is full. Pumping has finished.');setTimeout(function(){state.controlNotice=null;state.modal='log';state.timer=0;air2DemoRun.finishing=false;v4View();},750);}
function air2PaintRun(){if(!state.running||state.paused)return;var t=state.timer||0,flow=air2FlowAt(t);state.flowKind=air2FlowKind(flow);state.flowRate=flow;state.milkL=air2Round(air2IntegratedMilk(t,'l'));state.milkR=air2Round(air2IntegratedMilk(t,'r'));if(!air2DemoRun.autoMoved&&t>=18&&state.auto&&state.mode==='stimulation'){air2DemoRun.autoMoved=true;state.mode='expression';air2ShowNotice('auto','Let-down detected. Switched to Expression mode.');}if(!air2DemoRun.prompted&&t>=18&&!state.auto&&state.mode==='stimulation'){air2DemoRun.prompted=true;air2ShowNotice('suggestion','Let-down detected. We recommend switching to Expression mode.');}if(state.milkL>=AIR2_BOWL_CAPACITY_OZ||state.milkR>=AIR2_BOWL_CAPACITY_OZ)air2FinishFullBowl();}
/* The original demo ticker is loaded earlier. Correct its premature 8s switch and replace its amounts. */
setInterval(function(){if(!state.running||state.paused)return;var t=state.timer||0;if(t<18&&air2DemoRun.autoMoved===false&&state.auto&&state.mode==='expression')state.mode='stimulation';air2PaintRun();v4View();},1000);
document.addEventListener('click',function(event){var start=event.target.closest('#demo [data-v4="start"]');if(!start)return;air2DemoRun={prompted:false,autoMoved:false,finishing:false};state.controlNotice=null;state.flowKind='none';state.milkL=0;state.milkR=0;state.timer=0;},true);
