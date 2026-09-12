/* Device page only: rebuilt directly from Figma node 1:13028. */
function d4Asset(name) { return `./assets/figma-device-r3/${name}`; }

v4Status = function () {
  return `<div class="v4-status d4-status"><span>9:41</span><span class="levels"><img class="cell" src="${d4Asset('status-cell.svg')}" alt=""><img class="wifi" src="${d4Asset('status-wifi.svg')}" alt=""><img class="battery" src="${d4Asset('status-battery.svg')}" alt=""></span></div>`;
};

function d4Battery(side, value) {
  return `<span class="d4-battery"><b>${side}</b><i><img src="${d4Asset('battery-outline.svg')}" alt=""><em style="width:${value === 80 ? 15 : 14}px"></em><strong>${value}</strong></i></span>`;
}

function d4TabIcon(id) {
  const icons = {
    home:`<img src="${d4Asset('nav-home-a.svg')}" alt=""><img src="${d4Asset('nav-home-b.svg')}" alt="">`,
    device:`<img src="${d4Asset('nav-device.svg')}" alt="">`,
    community:`<img src="${d4Asset('nav-community-a.svg')}" alt=""><img src="${d4Asset('nav-community-b.svg')}" alt="">`,
    me:`<img src="${d4Asset('nav-me-a.svg')}" alt=""><img src="${d4Asset('nav-me-b.svg')}" alt="">`
  };
  return `<span class="d4-tab-icon ${id}">${icons[id]}</span>`;
}

v4Nav = function (active) {
  const tabs = [['home','Home'],['device','Device'],['community','Community'],['me','Me']];
  return `<nav class="v4-nav d4-nav">${tabs.map(([id,label]) => `<button ${id === 'home' || id === 'device' ? `data-v4="${id}"` : ''} class="${id === active ? 'active' : ''}">${d4TabIcon(id)}<small>${label}</small></button>`).join('')}</nav>`;
};

v4Device = function () {
  return `<section class="v4 v4-device d4-device"><img class="d4-page-bg" src="${d4Asset('page-bg.svg')}" alt="">${v4Status()}<header class="v4-top v4-device-title"><h1>My Device</h1><button class="v4-circle d4-add" aria-label="Add device"><img src="${d4Asset('plus-h.svg')}" alt=""><img src="${d4Asset('plus-v.svg')}" alt=""></button></header><button class="v4-device-card d4-card" data-v4="home"><img class="d4-card-glow" src="${d4Asset('card-glow.svg')}" alt=""><div class="d4-card-copy"><h2>No breast feeding<br>record available</h2></div><div class="d4-card-info"><span class="d4-device-icon"><img src="${d4Asset('device-icon.svg')}" alt=""></span><span><strong>Breast Pump</strong><small><b>Air 2</b>${d4Battery('L',80)}${d4Battery('R',75)}</small></span></div><img class="d4-chevron" src="${d4Asset('chevron.svg')}" alt=""><div class="d4-art"><div class="d4-mother"><img src="${d4Asset('mother.svg')}" alt=""></div><img class="d4-bottle-a" src="${d4Asset('bottle-a.svg')}" alt=""><img class="d4-bottle-b" src="${d4Asset('bottle-b.svg')}" alt=""><img class="d4-bottle-c" src="${d4Asset('bottle-c.svg')}" alt=""></div></button>${v4Nav('device')}</section>`;
};
