/* R45: make late component overrides visible in review-static screens too. */
(function(){
  function clock(seconds){var n=Math.max(0,Math.floor(Number(seconds)||0));return String(Math.floor(n/60)).padStart(2,'0')+':'+String(n%60).padStart(2,'0');}
  function timing(){return state.running?clock(state.timer||0)+' / 20:00':'20:00';}
  function header(){return '<div class="r43-boost-head"><span class="r43-boost-title">Milk Boost <em class="r43-boost-time">'+timing()+'</em></span><button class="r43-boost-arrow" data-v4="list" aria-label="Open program list"><span aria-hidden="true">›</span></button></div>';}
  function boostCard(){
    if(!state.auto)return '<section class="v4-auto-card r43-boost-card r43-boost-manual">'+header()+'<div class="r43-boost-program" aria-label="Milk Boost program sequence"><i class="r43-program-start"></i><i class="r43-program-middle"></i></div><div class="r43-boost-switch">Auto Switch '+v4Switch()+'</div></section>';
    var expression=state.mode==='expression',phase=expression?'Expression':state.mode==='mixed'?'Mixed':'Stimulation';
    return '<section class="v4-auto-card r43-boost-card '+(expression?'r43-boost-expression':'r43-boost-stimulation')+'">'+header()+'<p class="r43-boost-phase">'+phase+'</p><div class="r43-boost-switch">Auto Switch '+v4Switch()+'</div></section>';
  }
  var previousAutoCard=window.v4AutoCard;
  window.v4AutoCard=function(kind,title){return window.state&&state.selectedProgram==='Milk Boost'?boostCard():previousAutoCard.apply(this,arguments);};
  window.h7Battery=function(side,value){var level=Math.max(0,Math.min(100,Number(value)||0));return '<span class="h7-battery r43-dock-battery"><b>'+side+'</b><i><span class="r43-battery-body" style="--r44-level:'+level+'%"><strong>'+value+'</strong></span><em></em></i></span>';};
  function repaintStaticScreen(){
    if(!state.reviewFrozen||!window.root)return;
    var record=(window.AIR2_SCREEN_REGISTRY||[]).find(function(item){return item.id===state.reviewScreenId;});
    var page=record&&record.state&&record.state.page;
    if(page==='control'&&typeof window.v4Control==='function')root.innerHTML=v4Control();
    if(page==='home'&&typeof window.v4Home==='function')root.innerHTML=v4Home();
  }
  repaintStaticScreen();
})();
