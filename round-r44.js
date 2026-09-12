/* R44 follow-up overrides. */
(function(){
  var fallback=window.v4AutoCard;
  function clock(seconds){var n=Math.max(0,Math.floor(Number(seconds)||0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
  function timing(){return state.running?clock(state.timer||0)+' / 20:00':'20:00';}
  function header(){return '<div class="r43-boost-head"><span class="r43-boost-title">Milk Boost <em class="r43-boost-time">'+timing()+'</em></span><button class="r43-boost-arrow" data-v4="list" aria-label="Open program list"><span aria-hidden="true">›</span></button></div>';}
  function manualCard(){return '<section class="v4-auto-card r43-boost-card r43-boost-manual">'+header()+'<div class="r43-boost-program" aria-label="Milk Boost program sequence"><i class="r43-program-start"></i><i class="r43-program-middle"></i></div><div class="r43-boost-switch">Auto Switch '+v4Switch()+'</div></section>';}
  window.v4AutoCard=function(kind,title){
    if(!window.state||state.selectedProgram!=='Milk Boost')return fallback.apply(this,arguments);
    if(!state.auto)return manualCard();
    var expression=state.mode==='expression',phase=expression?'Expression':state.mode==='mixed'?'Mixed':'Stimulation';
    return '<section class="v4-auto-card r43-boost-card '+(expression?'r43-boost-expression':'r43-boost-stimulation')+'">'+header()+'<p class="r43-boost-phase">'+phase+'</p><div class="r43-boost-switch">Auto Switch '+v4Switch()+'</div></section>';
  };
  window.h7Battery=function(side,value){return '<span class="h7-battery r43-dock-battery"><b>'+side+'</b><i><span class="r43-battery-body"><strong>'+value+'</strong></span><em></em></i></span>';};
  if(typeof window.v4View==='function')window.v4View();
})();
