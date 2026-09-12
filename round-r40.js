/* Unified 0–15 rails and an isolated transient BOSS gesture. */
(function(){
  var rail=null,boss=null;
  function clamp(v){return Math.max(0,Math.min(15,Math.round(Number(v)||0)));}
  function renderRailValues(){
    document.querySelectorAll('#demo .v4-track[data-side]').forEach(function(track){
      var key=track.dataset.side==='r'?'levelR':'levelL',value=clamp(state[key]),pill=track.querySelector('.v4-level-value');
      if(!pill)return;
      pill.textContent=String(value);
      pill.style.top=Math.round((15-value)/15*134)+'px';
    });
  }
  function paintBoss(delta){
    if(!boss)return;
    boss.el.dataset.drag=String(delta);
    var toast=boss.el.querySelector('.r43-boss-toast');
    if(toast){
      toast.textContent=(delta>0?'+':'')+delta;
      toast.classList.toggle('visible',delta!==0);
    }
  }
  function railValue(event){
    if(!rail||event.pointerId!==rail.id)return;
    event.preventDefault();event.stopImmediatePropagation();
    var rect=rail.el.getBoundingClientRect();
    state[rail.key]=clamp(15*Math.max(0,Math.min(1,(event.clientY-rect.top)/rect.height))*(-1)+15);
    renderRailValues();
  }
  function bossValue(event){
    if(!boss||event.pointerId!==boss.id)return;
    event.preventDefault();event.stopImmediatePropagation();
    var distance=boss.startY-event.clientY;
    var delta=distance===0?0:Math.sign(distance)*Math.max(0,Math.min(3,Math.floor(Math.abs(distance)/18)));
    if(delta===boss.delta)return;
    boss.delta=delta;paintBoss(delta);
  }
  window.addEventListener('pointerdown',function(event){
    var bossHit=event.target.closest&&event.target.closest('#demo [data-r43-boss]');
    var railHit=event.target.closest&&event.target.closest('#demo [data-v4-drag="level"]');
    if((!bossHit&&!railHit)||document.body.classList.contains('review-static'))return;
    event.preventDefault();event.stopImmediatePropagation();
    if(railHit){
      rail={id:event.pointerId,el:railHit,key:railHit.dataset.side==='r'?'levelR':'levelL'};
      railHit.setPointerCapture&&railHit.setPointerCapture(event.pointerId);railValue(event);return;
    }
    boss={id:event.pointerId,el:bossHit,startY:event.clientY,baseL:clamp(state.levelL),baseR:clamp(state.levelR),delta:0};
    bossHit.setPointerCapture&&bossHit.setPointerCapture(event.pointerId);paintBoss(0);
  },true);
  window.addEventListener('pointermove',function(event){railValue(event);bossValue(event);},true);
  function release(event){
    var redraw=false;
    if(rail&&(!event||event.pointerId===rail.id)){rail=null;redraw=true;}
    if(boss&&(!event||event.pointerId===boss.id)){
      var active=boss,delta=active.delta;
      if(delta){state.levelL=clamp(active.baseL+delta);state.levelR=clamp(active.baseR+delta);}
      active.el.dataset.drag='0';
      var toast=active.el.querySelector('.r43-boss-toast');if(toast)toast.classList.remove('visible');
      boss=null;redraw=true;
    }
    if(redraw){event&&event.preventDefault();event&&event.stopImmediatePropagation();v4View();}
  }
  window.addEventListener('pointerup',release,true);
  window.addEventListener('pointercancel',release,true);
})();
