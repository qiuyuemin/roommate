/* r42: keep a notice from rebuilding the control DOM, then isolate the BOSS. */
(function(){
  var originalView=window.v4View;
  window.v4View=function(){
    if(state.controlNotice&&document.querySelector('#demo .v4-control.has-c36-notice')){
      var timer=document.querySelector('#demo .v4-time');
      if(timer)timer.textContent=(typeof time==='function'?time(state.timer||0):timer.textContent);
      var amounts=document.querySelectorAll('#demo .c32-pump .amount');
      if(amounts[0])amounts[0].textContent=(Number(state.milkL)||0).toFixed(1)+' oz';
      if(amounts[1])amounts[1].textContent=(Number(state.milkR)||0).toFixed(1)+' oz';
      return;
    }
    return originalView.apply(this,arguments);
  };
  view=window.v4View;
  var controls=window.v4Controls;
  window.v4Controls=function(){
    var markup=controls().replace('data-v4-drag="both"','data-r43-boss="true"');
    return markup.replace(/(<div class="v4-both-hit"[^>]*>)/,function(open){
      return open+'<span class="r43-boss-toast" aria-live="polite">+0</span>';
    });
  };
})();
