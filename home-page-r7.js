/* Home-empty reviewed directly against Figma nodes 7:9786, 13:10845, 7:9876 and 13:10849. */
function h7Asset(name) { return `./assets/figma-home-r7/${name}`; }
function h7ReviewedAsset(name) { return `./assets/figma-device-r3/${name}`; }

function h7Battery(side, value) {
  const level = Math.max(0, Math.min(100, Number(value) || 0));
  return `<span class="h7-battery r49-battery"><b>${side}</b><i style="--battery-level:${level}"><span class="r49-battery-track"><span class="r49-battery-fill"></span></span><img class="r49-battery-shell" src="./assets/figma-r49/battery-shell.svg" alt=""><strong class="r49-battery-label">${level}</strong></i></span>`;
}

function h7Dock(running) {
  const pumps = h7Asset('dock-pumps-13-10849.png');
  return `<section class="v4-home-dock h7-home-dock"><div class="h7-dock-device"><span class="h7-pump-pair"><i><img src="${pumps}" alt="Air 2 left pump"></i><i><img src="${pumps}" alt="Air 2 right pump"></i></span><span class="h7-dock-copy"><b>Air 2 <img src="${h7Asset('dock-switch.svg')}" alt="Switch device"></b><small>${h7Battery('L',80)}${h7Battery('R',75)}</small></span><button class="h7-dock-chevron" data-v4="control" aria-label="Open pump control"><img src="${h7Asset('dock-chevron.svg')}" alt=""></button></div><img class="h7-dock-divider" src="${h7Asset('dock-divider.svg')}" alt=""><div class="h7-dock-mode"><span><img src="${h7Asset('dock-heart.svg')}" alt="">Stimulation</span><button data-quick-start="${running ? 'pause' : 'start'}" aria-label="${running ? 'Pause' : 'Start pumping'}"><img src="${h7Asset('dock-play.svg')}" alt=""></button></div></section>`;
}

v4Home = function () {
  const data = state.hasLogged;
  const running = state.running && !state.paused;
  const trend = data ? r2TrendResult() : r2EmptyTrend();
  const lactation = data ? r2LactationResult() : `<img class="mother" src="./assets/figma-v2/home-group-b.svg" alt=""><div class="v4-lactation-record">No breast feeding record available</div><button class="v4-record-pill">Record</button>`;
  const records = state.r2RecordsOpen ? `<div class="r2-records"><button data-r2="close-records">×</button><h2>Pumping Records</h2><p>Apr 1 · 14.2 oz · 20 min</p><p>Mar 31 · 12.6 oz · 18 min</p></div>` : '';
  return `<section class="v4 v4-home h7-home ${data ? 'r2-home-result' : 'r2-home-empty'}">${v4Status()}<header class="v4-top">${v4Back('device')}<h1>Breast Pump</h1></header><main class="v4-home-cards"><section class="v4-home-card v4-trend"><div class="v4-card-title"><button class="r2-title-link" data-r2="records"><span><img src="${r2Asset('trend-icon.svg')}" alt="">Pumping Trend</span></button><button class="h7-trend-open" data-r2="records" aria-label="Open pumping trend"><img src="${h7ReviewedAsset('home-empty-trend-chevron.svg')}" alt=""></button></div>${trend}</section><section class="v4-home-card v4-lactation"><div class="v4-card-title"><button class="r2-title-link" data-r2="records"><span><img src="${r2Asset('lactation-icon.svg')}" alt="">Lactation</span></button><button class="v4-add h7-add-plan"><img src="${h7ReviewedAsset('home-empty-add-plus.svg')}" alt="">Add Plan</button></div>${data ? '' : '<small>Free AI-based plan from data and needs.</small>'}${lactation}</section></main>${h7Dock(running)}${records}</section>`;
};
