(function () {
  if (window.Air2DemoTriggers && window.Air2DemoTriggers.version === 54) return;
  var CAP = 6.09;
  var BASE_FLOW = 0.002 * 28.3495;
  var DEMO_MILK_ACCEL = 14;
  var LETDOWN_STEP_MS = 650;
  var SWITCH_CONFIRM_MS = 1200;
  var END_CONFIRM_MS = 1200;
  var fitTimers = [];
  var triggers = [
    ['air-leak','Air leak',true,'air-leak'],
    ['fit-ok','Wearing OK',true,'air-leak'],
    ['minor-leak','Minor leak',false,'air-leak'],
    ['letdown-start','Let-down starts',true,'letdown'],
    ['letdown-end','Let-down ends',true,'letdown'],
    ['low-battery','Low battery',false,'battery'],
    ['critical-battery','Critical low battery',true,'battery']
  ];
  function st(){ return (typeof state !== 'undefined') ? state : (window.state || null); }
  function clearFit(){ for(var i=0;i<fitTimers.length;i++) clearTimeout(fitTimers[i]); fitTimers=[]; }
  function patchNotice(){ var s=st(), n=s&&s.controlNotice, box=document.querySelector('#demo .c36-notice'), screen=document.querySelector('#demo .v4-control'), p=document.querySelector('#demo .c36-critical-battery p')||document.querySelector('#demo .c36-notice p'); if(n&&p) p.textContent=n.text||''; if(screen){ screen.classList.toggle('has-c36-notice',!!n); screen.classList.toggle('air2-warm-notice',!!(n&&n.backdrop)); } if(box) box.classList.remove('air2-warm-copy'); }
  function paint(){ if(typeof window.v4View==='function') window.v4View(); else if(typeof window.view==='function') window.view(); patchNotice(); sync(); }
  function notify(s,k,t,persist,backdrop){ var warm=!!backdrop||k==='auto'||k==='ending'||k==='suggestion'||k==='critical-battery'||String(t||'').length>44; s.controlNotice={kind:k,text:t,id:Date.now(),startedAt:Date.now(),persistent:!!persist,backdrop:warm}; if(!persist){ setTimeout(function(){ if(s.controlNotice&&s.controlNotice.id&&s.controlNotice.kind===k){ s.controlNotice=null; paint(); } },5000); } }
  function isActive(s){ return !!(s && s.running && !s.modal); }
  function ignored(s,id){ s.lastIgnoredTrigger=id+' requires active pumping'; sync(); return false; }
  function beginSession(s){ s.page='control'; s.modal=null; s.running=true; s.paused=false; s.timer=0; s.milkL=0; s.milkR=0; s.mode='stimulation'; s.letdownPhase='baseline'; s.flowRate=BASE_FLOW; s.flowKind='low'; s.air2LastPhysicsAt=Date.now(); s.air2SessionEnded=false; s.controlNotice=null; if(window.air2DemoRun) window.air2DemoRun={prompted:false,autoMoved:false,finishing:false,lastMilkTick:0}; }
  function nextPhase(s){ var seq=s.rhythmSequence||['stimulation','expression','stimulation','expression']; var idx=isFinite(Number(s.rhythmIndex))?Number(s.rhythmIndex):1; s.rhythmSequence=seq; s.rhythmIndex=Math.min(seq.length-1,idx+1); s.mode=seq[s.rhythmIndex]||'stimulation'; }
  function resetBasePlan(s){ s.mode='stimulation'; s.selectedProgram=null; s.rhythmIndex=0; s.rhythmSequence=['stimulation','expression','stimulation','expression']; s.letdownPhase='baseline'; s.letdownEventAt=null; s.letdownStableSince=null; s.noMilkSince=null; s.letdownSuggestionShown=false; s.manualEndSuggestionShown=false; s.flowRate=BASE_FLOW; s.flowKind='low'; }
  function captureSession(s){ var total,id,existing,record; if(s.microLeakDuringSession) s.air2SessionSummaryKind='minor-leak'; else if(!s.air2SessionSummaryKind) s.air2SessionSummaryKind='stable'; s.hasLogged=true; s.lastSessionL=Number(s.milkL)||0; s.lastSessionR=Number(s.milkR)||0; total=Math.round((s.lastSessionL+s.lastSessionR)*100)/100; s.lastSessionTotal=total; if(!Array.isArray(s.air2SessionHistory)) s.air2SessionHistory=[]; id=s.air2ActiveSessionId||('session-'+Date.now()); record={id:id,left:s.lastSessionL,right:s.lastSessionR,total:total}; existing=s.air2SessionHistory.find?s.air2SessionHistory.find(function(item){return item.id===id;}):null; if(existing){ existing.left=record.left; existing.right=record.right; existing.total=record.total; } else s.air2SessionHistory.push(record); s.air2ActiveSessionId=id; }
  function prepareSummaryLog(s){ s.air2AutoSubmitPending=true; s.air2AutoSubmitCancelled=false; s.microLeakDuringSession=false; }
  function settle(s,msg){ captureSession(s); prepareSummaryLog(s); resetBasePlan(s); s.running=false; s.paused=false; s.modal='log'; s.air2SessionEnded=true; if(msg) notify(s,'ending',msg,false); }
  function flowNow(s){
    var age, step;
    if(!s) return BASE_FLOW;
    if(s.letdownPhase==='rising'){
      age=Math.max(0,Date.now()-(s.letdownEventAt||Date.now()));
      step=Math.floor(age/LETDOWN_STEP_MS);
      return Math.min(.005,.001+step*.001) * 28.3495;
    }
    if(s.letdownPhase==='active') return .006 * 28.3495;
    if(s.letdownPhase==='falling'){
      age=Math.max(0,Date.now()-(s.letdownEventAt||Date.now()));
      step=Math.floor(age/LETDOWN_STEP_MS);
      return Math.max(.0005,.006-step*.001) * 28.3495;
    }
    if(s.letdownPhase==='ended') return .0005 * 28.3495;
    return BASE_FLOW;
  }
  function physics(){ var s=st(), now=Date.now(), flow, elapsed, add; if(!s||!s.running||s.paused) return; flow=flowNow(s); s.flowRate=Math.round(flow*1000)/1000; s.flowKind=flow<=0?'none':(flow<.003*28.3495?'low':(flow<.005*28.3495?'medium':'high')); elapsed=Math.max(.25,Math.min(2,(now-(s.air2LastPhysicsAt||now))/1000)); s.air2LastPhysicsAt=now; add=(flow/28.3495)*elapsed*DEMO_MILK_ACCEL; s.milkL=Math.min(CAP,Math.round(((Number(s.milkL)||0)+add*.98)*1000)/1000); s.milkR=Math.min(CAP,Math.round(((Number(s.milkR)||0)+add*1.02)*1000)/1000);
    if(s.letdownPhase==='rising'&&flow>=.005*28.3495){ if(!s.letdownStableSince) s.letdownStableSince=now; if(now-s.letdownStableSince>=SWITCH_CONFIRM_MS){ s.letdownPhase='active'; if(s.selectedProgram){ s.mode='expression'; s.rhythmIndex=Math.max(1,Number(s.rhythmIndex)||1); notify(s,'auto','Let-down detected. Moving into the Expression phase.',false); } else if(s.auto){ s.mode='expression'; notify(s,'auto','Let-down detected. Switched to Expression mode.',false); } else if(!s.letdownSuggestionShown){ s.letdownSuggestionShown=true; notify(s,'suggestion','Let-down detected. You can switch to Expression when you are ready.',false); } } }
    if(s.letdownPhase==='falling'&&flow<=.001*28.3495){ if(!s.noMilkSince) s.noMilkSince=now; if(now-s.noMilkSince>=END_CONFIRM_MS){ s.letdownPhase='ended'; if(s.selectedProgram&&s.auto){ nextPhase(s); notify(s,'ending','Let-down has eased. Moving to the next program phase.',false); } else if(s.auto){ notify(s,'ending','Milk flow has ended. This session will be settled shortly.',false,true); setTimeout(function(){ var c=st(); if(c&&c.letdownPhase==='ended'&&c.running&&!c.modal){ c.controlNotice=null; settle(c); paint(); } },5200); } else if(!s.manualEndSuggestionShown){ s.manualEndSuggestionShown=true; notify(s,'suggestion','Milk flow has slowed. You can finish pumping when you are ready.',false); } } }
    if(s.milkL>=CAP||s.milkR>=CAP){ s.milkL=CAP; s.milkR=CAP; settle(s,'Milk level is high. Pumping stopped automatically to prevent overflow.'); }
  }
  function install(){
    window.v4RunFit = v4RunFit = function(){ var s=st(); if(!s) return; clearFit(); s.page='control'; s.modal='fit'; s.running=false; s.paused=false; s.fitStage=0; s.fitAdjust=true; paint(); fitTimers.push(setTimeout(function(){s.fitStage=1;paint();},360)); fitTimers.push(setTimeout(function(){s.fitStage=2;s.fitAdjust=true;paint();},980)); };
    window.air2FlowAt=function(){ return flowNow(st()); };
    window.air2PaintRun=physics;
  }
  function fitOk(){ var s=st(); if(!s) return false; if(s.modal==='fit'){ clearFit(); s.fitAdjust=false; s.fitStage=3; paint(); fitTimers.push(setTimeout(function(){s.fitStage=4;paint();},650)); fitTimers.push(setTimeout(function(){s.fitStage=5;paint();},1300)); fitTimers.push(setTimeout(function(){s.fitStage=6;paint();},1900)); fitTimers.push(setTimeout(function(){beginSession(s);paint();},2500)); return true; } if(s.paused&&(s.severeLeak||s.leakAdjusting)){ s.severeLeak=false; s.leakAdjusting=false; s.leakSide=null; s.paused=false; s.air2LastPhysicsAt=Date.now(); s.controlNotice=null; paint(); setTimeout(function(){ var c=st(); if(!c) return; c.controlNotice={kind:'leak',phase:'recovered',text:'Suction pressure normal',id:Date.now()}; paint(); },160); setTimeout(function(){ var c=st(); if(c&&c.controlNotice&&c.controlNotice.kind==='leak'&&c.controlNotice.phase==='recovered'){ c.controlNotice={kind:'leak',phase:'closing-recovered',text:'Suction pressure normal',id:c.controlNotice.id}; paint(); } },2960); setTimeout(function(){ var c=st(); if(c&&c.controlNotice&&c.controlNotice.kind==='leak'){ c.controlNotice=null; paint(); } },3320); return true; } return false; }
  function criticalBattery(){ var s=st(), left=5, start=Date.now(), id=Date.now(); if(!s) return false; s.batteryL=3; s.batteryR=2; s.air2ShutdownAfterSave=true; s.air2CriticalBatteryActive=true; s.air2AutoSubmitPending=false; s.air2AutoSubmitCancelled=true; function setText(text){ var c=st(); if(!c||!c.air2CriticalBatteryActive) return; c.controlNotice={kind:'critical-battery',text:text,id:id,startedAt:start,duration:6500,backdrop:true,steady:true}; paint(); setTimeout(patchNotice,30); } function tick(){ if(left>=1){ setText('Battery is too low for this session. It will save and shut down in '+left+'s.'); left-=1; setTimeout(tick,1000); return; } setText('Please charge, see you later.'); setTimeout(function(){ var a=st(); if(!a) return; a.air2CriticalBatteryActive=false; a.controlNotice=null; captureSession(a); resetBasePlan(a); a.running=false; a.paused=false; a.modal='log'; a.air2SessionEnded=true; prepareSummaryLog(a); paint(); },1200); } tick(); return true; }

  function trigger(id){ var s=st(); if(!s) return false; s.lastIgnoredTrigger=''; if(id==='fit-ok') return fitOk(); if(!isActive(s)) return ignored(s,id); if(id==='letdown-start'){ s.letdownPhase='rising'; s.letdownEventAt=Date.now(); s.letdownStableSince=null; s.noMilkSince=null; paint(); return true; } if(id==='letdown-end'){ s.letdownPhase='falling'; s.letdownEventAt=Date.now(); s.noMilkSince=null; s.manualEndSuggestionShown=false; paint(); return true; } if(id==='air-leak'){ s.paused=true; s.severeLeak=true; s.leakSide='r'; s.leakAdjusting=true; s.flowRate=0; s.flowKind='paused'; s.controlNotice={kind:'leak',phase:'warning',text:'Air leak detected',id:Date.now()}; paint(); return true; } if(id==='low-battery'){ s.batteryL=12; s.batteryR=10; notify(s,'low-battery','Battery is running low. You can finish this session, then charge Air 2 soon.',false); paint(); return true; } if(id==='critical-battery') return criticalBattery(); if(id==='minor-leak'){ s.microLeakDuringSession=true; return true; } return false; }
  document.addEventListener('pointerdown',function(e){ var finish=e.target.closest&&e.target.closest('#demo [data-v4="finish"],#demo [data-action="finish"]'), s=st(); if(!finish||!s) return; if(s.microLeakDuringSession) s.air2SessionSummaryKind='minor-leak'; else s.air2SessionSummaryKind='stable'; s.air2ShowSessionSummary=true; },true);
  document.addEventListener('click',function(e){ var done=e.target.closest&&e.target.closest('#demo [data-air2-logged-done]'), s=st(); if(!done||!s) return; e.preventDefault(); e.stopImmediatePropagation(); s.air2ShowLoggedSummary=false; var offline=!!s.air2ShutdownAfterSave; s.modal=null; s.running=false; s.paused=false; s.controlNotice=null; if(offline){ s.page='control'; s.air2Offline=true; } else { s.page='home'; } paint(); },true);
  document.addEventListener('click',function(e){ var guide=e.target.closest&&e.target.closest('#demo [data-air2-wear-guide]'); if(!guide) return; e.preventDefault(); e.stopImmediatePropagation(); var card=guide.closest('.air2-logged-summary'); if(card) card.classList.add('is-guide-open'); },true);
  var air2GuideSwipe=null; document.addEventListener('pointerdown',function(e){ var card=e.target.closest&&e.target.closest('#demo .air2-logged-summary'); if(!card) return; air2GuideSwipe={id:e.pointerId,x:e.clientX,card:card}; },true); document.addEventListener('pointerup',function(e){ if(!air2GuideSwipe||e.pointerId!==air2GuideSwipe.id) return; var dx=e.clientX-air2GuideSwipe.x, card=air2GuideSwipe.card; if(dx<-28) card.classList.add('is-guide-open'); if(dx>28) card.classList.remove('is-guide-open'); air2GuideSwipe=null; },true); document.addEventListener('pointercancel',function(){ air2GuideSwipe=null; },true);
  document.addEventListener('click',function(e){ var save=e.target.closest&&e.target.closest('#demo [data-v4="save"]'), s=st(); if(!save||!s) return; captureSession(s); resetBasePlan(s); if(s.air2SessionSummaryKind==='minor-leak'||s.air2ShutdownAfterSave){ e.preventDefault(); e.stopImmediatePropagation(); s.hasLogged=true; s.modal='logged'; s.air2ShowLoggedSummary=true; s.running=false; s.paused=false; s.controlNotice=null; paint(); } },true);
  document.addEventListener('click',function(e){ var save=e.target.closest&&e.target.closest('#demo [data-v4="save"]'), s=st(); if(!save||!s||!s.air2ShutdownAfterSave) return; e.preventDefault(); e.stopImmediatePropagation(); captureSession(s); resetBasePlan(s); s.hasLogged=true; s.modal=null; s.page='control'; s.running=false; s.paused=false; s.controlNotice=null; s.air2Offline=true; paint(); },true);

  document.addEventListener('click',function(e){ var exit=e.target.closest&&e.target.closest('[data-air2-offline-exit]'), s=st(); if(!exit||!s) return; e.preventDefault(); e.stopImmediatePropagation(); s.air2Offline=false; s.air2ShutdownAfterSave=false; s.air2CriticalBatteryActive=false; s.controlNotice=null; s.modal=null; s.page='home'; s.running=false; s.paused=false; paint(); },true);

  function wrapLogged(){ if(window.__air2LoggedSummaryWrapped||typeof window.v4Logged!=='function') return; var old=window.v4Logged; window.v4Logged=v4Logged=function(){ var html=old.apply(this,arguments), s=st(), copy, summary; if(!s||!s.air2ShowLoggedSummary) return html; copy=s.air2SessionSummaryKind==='minor-leak'?'A slight air leak was detected during this session. Air 2 compensated automatically.':'Air 2 stayed stable throughout this session.'; summary='<div class="air2-logged-summary"><div class="air2-logged-summary-main"><b>Session summary</b><p>'+copy+'</p><button type="button" data-air2-wear-guide>How to get the best fit?</button></div><div class="air2-logged-guide"><b>Wear guide</b><p>Swipe through the fit guide here. This is the last page.</p></div></div><button class="air2-logged-done" type="button" data-air2-logged-done>Got it</button>'; return html.replace('v4-logged','v4-logged air2-abnormal-logged').replace('<i class="v4-home-indicator"></i>',summary+'<i class="v4-home-indicator"></i>'); }; window.__air2LoggedSummaryWrapped=true; }


  function wrapView(){ if(window.__air2TriggerViewWrapped||typeof window.v4View!=='function') return; var old=window.v4View; window.v4View=v4View=function(){ old.apply(this,arguments); var s=st(), root=document.getElementById('demo'), screen, n, started, age; if(!s||!root) return; screen=root.querySelector('.v4-control.has-c36-notice'); n=s.controlNotice; if(screen){ screen.classList.toggle('air2-warm-notice',!!(n&&n.backdrop)); } patchNotice(); if(screen&&n){ started=Number(n.startedAt||n.id||Date.now()); age=Math.max(0,Math.min(5,(Date.now()-started)/1000)); screen.style.setProperty('--notice-age',age.toFixed(3)+'s'); } if(s.air2Offline) root.insertAdjacentHTML('beforeend','<div class="air2-offline-screen" role="status"><button class="air2-offline-exit" type="button" data-air2-offline-exit>×</button><div><b>Device Offline</b><span><i></i>Reconnecting</span></div></div>');  }; window.__air2TriggerViewWrapped=true; }
  function sync(){ var b=document.querySelector('[data-demo-trigger-state]'), s=st(); if(b) b.textContent=s?((s.running?(s.paused?'paused':'pumping'):'not pumping')+' · flow '+(((Number(s.flowRate)||0)/28.3495).toFixed(3))+(s.lastIgnoredTrigger?' · '+s.lastIgnoredTrigger:'')):'Waiting for Demo...'; }
  function mount(){
    if(document.querySelector('.demo-trigger-root')) return;
    var host=document.createElement('aside'), html, i;
    function group(title,key){
      var out='<section class="demo-trigger-group"><h3>'+title+'</h3><div class="demo-trigger-grid">';
      for(i=0;i<triggers.length;i++){
        if(triggers[i][3]!==key) continue;
        out+='<button class="demo-trigger-action '+(triggers[i][2]?'is-primary':'')+'" type="button" data-demo-trigger="'+triggers[i][0]+'"><b>'+triggers[i][1]+'</b></button>';
      }
      return out+'</div></section>';
    }
    host.className='demo-trigger-root';
    html='<button class="demo-trigger-toggle" type="button" aria-expanded="false"><span>Triggers</span></button><section class="demo-trigger-panel" role="dialog"><header class="demo-trigger-head"><div><h2 class="demo-trigger-title">Event Triggers</h2></div><button class="demo-trigger-close" type="button">×</button></header><div class="demo-trigger-content">';
    html+=group('Air leak','air-leak');
    html+=group('Let-down','letdown');
    html+=group('Battery','battery');
    html+='</div></section>';
    host.innerHTML=html;
    document.body.appendChild(host);
    var t=host.querySelector('.demo-trigger-toggle'), x=host.querySelector('.demo-trigger-close');
    function open(v){host.classList.toggle('is-open',v);t.setAttribute('aria-expanded',v?'true':'false');sync();}
    var drag=null, dragged=false;
    function place(x,y){ var w=host.offsetWidth||92, h=host.offsetHeight||48; x=Math.max(8,Math.min(window.innerWidth-w-8,x)); y=Math.max(8,Math.min(window.innerHeight-h-8,y)); host.style.left=x+'px'; host.style.top=y+'px'; host.style.right='auto'; host.style.bottom='auto'; }
    function dragStart(e){ if(e.button!=null&&e.button!==0) return; var r=host.getBoundingClientRect(); drag={id:e.pointerId,x:e.clientX,y:e.clientY,left:r.left,top:r.top}; dragged=false; t.setPointerCapture&&t.setPointerCapture(e.pointerId); }
    function dragMove(e){ if(!drag||e.pointerId!==drag.id) return; var dx=e.clientX-drag.x, dy=e.clientY-drag.y; if(Math.abs(dx)+Math.abs(dy)>4) dragged=true; if(dragged){ e.preventDefault(); place(drag.left+dx,drag.top+dy); } }
    function dragEnd(e){ if(drag&&e.pointerId===drag.id){ drag=null; setTimeout(function(){dragged=false;},0); } }
    t.addEventListener('pointerdown',dragStart);
    t.addEventListener('pointermove',dragMove);
    t.addEventListener('pointerup',dragEnd);
    t.addEventListener('pointercancel',dragEnd);
    t.addEventListener('click',function(e){e.preventDefault(); if(dragged) return; open(!host.classList.contains('is-open'));});
    x.addEventListener('click',function(e){e.preventDefault();open(false);});
    host.addEventListener('click',function(e){var b=e.target.closest&&e.target.closest('[data-demo-trigger]'); if(!b) return; e.preventDefault(); trigger(b.getAttribute('data-demo-trigger')); open(false);});
    sync();
  }
  function boot(){ install(); wrapLogged(); wrapView(); mount(); window.Air2DemoTriggers={version:54,trigger:trigger,list:function(){return triggers;},sync:sync}; }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot); else boot(); setTimeout(boot,700); setTimeout(boot,1800);
}());
