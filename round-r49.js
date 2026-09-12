(function () {
  var assetRoot = "./assets/figma-r49/";
  function getState() { return typeof state !== "undefined" ? state : {}; }
  function clock(seconds) { seconds = Math.max(0, Number(seconds) || 0); return String(Math.floor(seconds / 60)).padStart(2, "0") + ":" + String(Math.floor(seconds % 60)).padStart(2, "0"); }
  function boostTime(s) { return s.running ? clock(s.timer) + " / 20:00" : "20:00"; }
  function card() {
    var s = getState(), expression = s.mode === "expression";
    var autoControl = typeof v4Switch === "function" ? v4Switch() : "";
    var layout = !s.auto ? "manual" : (expression ? "expression" : "stimulation");
    var head = "<div class=\"r49-boost__header\"><span class=\"r49-boost__title\">Milk Boost</span><em class=\"r49-boost__timer\">" + boostTime(s) + "</em></div><button class=\"r49-boost__arrow\" data-v4=\"list\" aria-label=\"Open list\"><img src=\"./assets/figma-r106-arrow.svg\" alt=\"\"></button>";
    var switcher = "<div class=\"r49-boost__switch\"><span>Auto Switch</span>" + autoControl + "</div>";
    var body = layout === "manual"
      ? "<div class=\"r49-boost__program\" aria-hidden=\"true\"><i></i><b></b></div>"
      : "<p class=\"r49-boost__phase\">" + (layout === "expression" ? "Expression" : "Stimulation") + "</p>";
    return "<section class=\"r49-boost-card\" data-r49-boost-state=\"" + layout + "\">" + head + body + switcher + "</section>";
  }
  // v4AutoCard calls this hook at render time. Do not monkey-patch the base
  // renderer: late overrides were allowing multiple card layouts to coexist.
  window.h7MilkBoostCard = card;
  window.h7Battery = function (side, value) {
    var level = Math.max(0, Math.min(100, Math.round(Number(value) || 0)));
    return "<span class=\"h7-battery r49-battery\"><b>" + side + "</b><i style=\"--battery-level:" + level + "\"><span class=\"r49-battery-track\"><span class=\"r49-battery-fill\"></span></span><img class=\"r49-battery-shell\" src=\"" + assetRoot + "battery-shell.svg\" alt=\"\"><strong class=\"r49-battery-label\">" + level + "</strong></i></span>";
  };
  function repaintFrozenReview() {
    var s = getState(), host = document.getElementById("demo");
    if (!s.reviewFrozen || !host) return;
    var screen = host.firstElementChild;
    if ((screen && screen.classList.contains("v4-home")) || (s.reviewScreenId && s.reviewScreenId.indexOf("home") !== -1)) { if (typeof window.v4Home === "function") host.innerHTML = window.v4Home(); }
    else if ((screen && screen.classList.contains("v4-control")) || (s.reviewScreenId && s.reviewScreenId.indexOf("control") !== -1)) { if (typeof window.v4Control === "function") host.innerHTML = window.v4Control(); }
  }
  repaintFrozenReview();
  if (typeof window.v4View === "function" && !getState().reviewFrozen) window.v4View();
}());
/* Load the consolidated 2026-08-13 review corrections after every legacy
   renderer has registered, so this layer remains the final authority. */
(function(){
  var script=document.createElement('script');
  script.src='./review-notes-813.js?v=r112';
  script.onload=function(){
    var decouple=document.createElement('script');
    decouple.src='./auto-switch-decoupled.js?v=20260817-13';
    document.body.appendChild(decouple);
  };
  document.body.appendChild(script);
}());
