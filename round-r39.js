/* r39 notification lifecycle and live Boss value painting. */
(function(){
  var noticeTimer;
  window.air2ShowNotice=function(kind,text){
    var now=Date.now();
    state.controlNotice={kind:kind,text:text,id:now,startedAt:now,duration:3300};
    clearTimeout(noticeTimer);
    noticeTimer=setTimeout(function(){if(state.controlNotice&&state.controlNotice.id===now){state.controlNotice=null;v4View();}},3300);
    v4View();
  };
  var control=v4Control;
  v4Control=function(){
    var markup=control(),n=state.controlNotice;
    if(!n)return markup;
    var started=Number(n.startedAt||n.id||Date.now()),age=Math.max(0,Math.min(3.3,(Date.now()-started)/1000));
    return markup.replace(/<section class="c36-notice([^>]*)>/,function(all,attrs){return '<section class="c36-notice'+attrs+' style="--notice-age:'+age.toFixed(3)+'s">';});
  };
  var paint=function(){
    var values=[state.levelL,state.levelR];
    document.querySelectorAll('#demo .v4-track[data-side]').forEach(function(track,index){
      var value=Math.max(0,Math.min(15,Number(values[index])||0)),pill=track.querySelector('.v4-level-value');
      if(!pill)return;
      pill.textContent=String(value);
      pill.style.top=Math.round((15-value)/15*134)+'px';
    });
  };
  window.air2PaintBossLevels=paint;
  v4View();
})();
