/* Render Milk Boost as its own Figma-matched program card. */
(function(){
  var fallback=window.v4AutoCard;
  function clock(seconds){var value=Math.max(0,Math.floor(Number(seconds)||0)),m=Math.floor(value/60),s=value%60;return String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');}
  window.v4AutoCard=function(kind,title){
    if(!window.state||state.selectedProgram!=='Milk Boost')return fallback.apply(this,arguments);
    var expression=state.mode==='expression';
    var phase=expression?'Expression':state.mode==='mixed'?'Mixed':'Stimulation';
    var timing=state.running?clock(state.timer||0)+' / 20:00':'20:00';
    return `<section class="v4-auto-card r43-boost-card ${expression?'r43-boost-expression':'r43-boost-stimulation'}"><div class="r43-boost-head"><span class="r43-boost-title">Milk Boost <em class="r43-boost-time">${timing}</em></span><button class="r2-card-arrow r43-boost-arrow" data-v4="list"><img src="${r2Asset('auto-chevron.svg')}" alt="Open list"></button></div><p class="r43-boost-phase">${phase}</p><div class="r43-boost-switch">Auto Switch ${v4Switch()}</div></section>`;
  };
})();
