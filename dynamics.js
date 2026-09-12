/* Event-triggered physiology helpers. No automatic timeline mock runs here. */
var AIR2_BOWL_CAPACITY_OZ=6.09;
var air2DemoRun={prompted:false,autoMoved:false,finishing:false};
function air2Round(v){return Math.round(v*100)/100;}
function air2FlowAt(second){var t=Math.max(0,second||0),boost=state&&state.letdownActive;if(boost){if(t<8)return .09;if(t<24)return .18;return .11;}return .012;}
function air2FlowKind(flow){return flow<.006?'none':flow<.05?'low':flow<.16?'medium':'high';}
function air2IntegratedMilk(second,side){var total=0,t=Math.max(0,Math.floor(second||0));for(var s=0;s<t;s++)total+=air2FlowAt(s);return Math.min(AIR2_BOWL_CAPACITY_OZ,total*(side==='r'?1.025:.985));}
function air2ShowNotice(kind,text){state.controlNotice={kind:kind,text:text,id:Date.now()};setTimeout(function(){if(state.controlNotice&&state.controlNotice.kind===kind){state.controlNotice=null;v4View();}},3600);}
function air2FinishFullBowl(){if(air2DemoRun.finishing)return;air2DemoRun.finishing=true;state.running=false;state.paused=false;air2ShowNotice('complete','One bowl is full. Pumping has finished.');setTimeout(function(){state.controlNotice=null;state.modal='log';air2DemoRun.finishing=false;v4View();},750);}
function air2PaintRun(){if(!state.running||state.paused)return;var t=state.timer||0,flow=air2FlowAt(t);state.flowKind=air2FlowKind(flow);state.flowRate=flow;state.milkL=air2Round(air2IntegratedMilk(t,'l'));state.milkR=air2Round(air2IntegratedMilk(t,'r'));if(state.milkL>=AIR2_BOWL_CAPACITY_OZ||state.milkR>=AIR2_BOWL_CAPACITY_OZ){state.milkL=AIR2_BOWL_CAPACITY_OZ;state.milkR=AIR2_BOWL_CAPACITY_OZ;air2FinishFullBowl();}}
setInterval(function(){if(!state.running||state.paused)return;air2PaintRun();v4View();},1000);
document.addEventListener('click',function(event){var start=event.target.closest('#demo [data-v4="start"]');if(!start)return;air2DemoRun={prompted:false,autoMoved:false,finishing:false};state.controlNotice=null;state.flowKind='none';state.milkL=0;state.milkR=0;state.timer=0;},true);
