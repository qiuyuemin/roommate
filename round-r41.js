/* r41: 90-second physiological mock.  Flow never resets on a mode switch. */
(function(){
  window.air2FlowAt=function(second){
    var t=Math.max(0,Number(second)||0);
    if(t<12)return 0;
    if(t<28)return .006;
    if(t<52)return .045;
    if(t<70)return .135;
    if(t<82)return .160;
    if(t<90)return .060;
    return 0;
  };
  window.air2IntegratedMilk=function(second,side){
    var total=0,t=Math.max(0,Math.floor(Number(second)||0));
    for(var s=0;s<t;s++)total+=window.air2FlowAt(s);
    return Math.min(AIR2_BOWL_CAPACITY_OZ,total*(side==='r'?1.018:.992));
  };
  window.air2FinishFullBowl=function(){
    if(air2DemoRun.finishing)return;
    air2DemoRun.finishing=true;state.running=false;state.paused=false;
    air2ShowNotice('complete','One bowl is full. Pumping has finished.');
    setTimeout(function(){state.controlNotice=null;state.modal='log';air2DemoRun.finishing=false;v4View();},750);
  };
  window.air2PaintRun=function(){
    if(!state.running||state.paused)return;
    var t=state.timer||0,flow=window.air2FlowAt(t);
    state.flowKind=air2FlowKind(flow);state.flowRate=flow;
    state.milkL=air2Round(window.air2IntegratedMilk(t,'l'));
    state.milkR=air2Round(window.air2IntegratedMilk(t,'r'));
    if(!air2DemoRun.autoMoved&&t>=28&&state.auto&&state.mode==='stimulation'){
      air2DemoRun.autoMoved=true;state.mode='expression';air2ShowNotice('auto','Let-down detected. Switched to Expression mode.');
    }
    if(!air2DemoRun.prompted&&t>=28&&!state.auto&&state.mode==='stimulation'){
      air2DemoRun.prompted=true;air2ShowNotice('suggestion','Let-down detected. We recommend switching to Expression mode.');
    }
    /* Settle only when both displayed bowls are actually full.  Using OR here
       allowed the faster right-hand simulation to end a session while the
       left-hand amount was still visibly below capacity. */
    if(state.milkL>=AIR2_BOWL_CAPACITY_OZ-.005&&state.milkR>=AIR2_BOWL_CAPACITY_OZ-.005)window.air2FinishFullBowl();
  };
  var fitRender=window.v4Fit;
  window.v4Fit=function(){
    var html=fitRender();
    if(!state.fitAdjust||state.fitStage>=3)html=html.replace(/<p class="v4-fit-copy">(?:Checking your fit…|Everything is ok!)<\\/p>/g,'<p class="v4-fit-copy"></p>');
    return html;
  };
  var logRender=window.v4Log;
  window.v4Log=function(){
    var values=[Math.max(0,Math.min(AIR2_BOWL_CAPACITY_OZ,state.milkL||0)),Math.max(0,Math.min(AIR2_BOWL_CAPACITY_OZ,state.milkR||0))],n=0;
    return logRender().replace(/<div class="r37-log-vessel" style="--fill:([^%]+)%">/g,function(_,fill){
      var ratio=values[n++]/AIR2_BOWL_CAPACITY_OZ,top=(84-ratio*68).toFixed(2);
      return '<div class="r37-log-vessel" style="--fill:'+fill+'%;--knob-top:'+top+'%">';
    });
  };
  if(!state.reviewFrozen)state.listExpanded=null;
  window.addEventListener('click',function(event){if(event.target.closest('[data-v4="list"]'))state.listExpanded=null;},true);
})();
