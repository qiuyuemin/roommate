/* Behaviour corrections discovered during the 55-note cross-check. */
r2TrendResult = function () {
  const values = [8.7,11.8,null,13.4,9.6,15.1,12.2,null,16.8,10.5,17.6,14.2,12.6,18.1,null,9.4,13.8,11.7,15.6,14.9,16.3,null,12.1,17.2,13.7,18.9,15.4,11.8,16.5,14.2];
  const days = values.map((value,index) => {
    const d = new Date(2026,6,index+1);
    const letter = ['S','M','T','W','T','F','S'][d.getDay()];
    const top = value == null ? 0 : Math.round(100 - value / 30 * 100);
    const next = values[index + 1];
    const nextTop = next == null ? top : Math.round(100 - next / 30 * 100);
    const angle = Math.atan2((nextTop - top) * 1.25,46) * 180 / Math.PI;
    return `<button class="r2-day ${value == null ? 'missing' : ''} ${next == null ? 'next-missing' : ''}" data-r2-day="${index+1}" data-value="${value == null ? '' : value}" style="--point:${top}%;--angle:${angle}deg"><i></i><span>${letter}<small>7/${index+1}</small></span></button>`;
  }).join('');
  const detail = state.r2DayDetail ? `<div class="r2-day-detail"><b>Jul ${state.r2DayDetail.day}</b><span>${state.r2DayDetail.value ? `${state.r2DayDetail.value} oz · 2 sessions` : 'No pumping record'}</span></div>` : '';
  return `<div class="r2-trend-wrap"><div class="r2-y-axis"><span>30</span><span>20</span><span>10</span><span>0</span></div><div class="r2-trend-scroll" data-r2-scroll="latest"><div class="r2-trend-track">${days}</div></div><b class="r2-latest">14.2 oz</b></div>${detail}`;
};

v4Fit = function () {
  const stage = state.fitStage;
  if (stage >= 7) return `<div class="v4-overlay"><section class="v4-fit r2-fit"><h2>Fit Check</h2><div class="v4-countdown">${stage===7?'3':stage===8?'2':stage===9?'1':'Start!'}<small>${stage===10?'Pumping begins now':''}</small></div></section></div>`;
  const checks = [['Posture','fit-posture.svg'],['Alignment','fit-alignment.svg'],['Suction','auto-heart.svg'],['Battery','fit-check.svg']];
  const isDone = i => stage===6 || (i===0&&stage>=2) || (i===1&&stage>=5) || (i===2&&stage>=6) || (i===3&&stage>=6);
  const isActive = i => (i===0&&stage===1) || (i===1&&stage>=2&&stage<=4) || (i===2&&stage===5);
  const showL = stage>=3, showR=stage>=4;
  return `<div class="v4-overlay"><section class="v4-fit r2-fit"><h2>Fit Check</h2><div class="v4-fit-chips">${checks.map(([label,icon],i)=>`<span class="v4-fit-chip ${isActive(i)?'wait':''} ${isDone(i)?'done':''}" style="--delay:${i*70}ms"><img src="${r2Asset(isDone(i)?'fit-check.svg':icon)}" alt="">${label}</span>`).join('')}</div><p class="v4-fit-copy">${stage===6?'Everything is ok !':state.fitAdjust&&stage>=2&&stage<=4?'Almost there. Follow the on-screen guide to make a small adjustment.':'Checking your fit…'}</p><div class="v4-fit-pumps"><div class="v4-fit-unit"><span class="hardware"><img src="${r2Asset('control-pumps.png')}" alt=""></span><p>L ${showL?`<img src="${r2Asset('fit-check.svg')}" alt="">`:''}</p></div><div class="v4-fit-unit right"><span class="hardware ${state.fitAdjust&&stage>=2&&stage<=4?'adjusting':''}"><img src="${state.fitAdjust&&stage>=2&&stage<=4?r2Asset('fit-adjust.png'):r2Asset('control-pumps.png')}" alt=""></span>${state.fitAdjust&&stage>=2&&stage<=4?`<img class="r2-fit-guide" src="${r2Asset('fit-guide.svg')}" alt="Adjustment guide">`:''}<p>R ${showR?`<img src="${r2Asset('fit-check.svg')}" alt="">`:''}</p></div></div></section></div>`;
};

document.addEventListener('click', event => {
  if (document.body.classList.contains('review-static')) return;
  const day = event.target.closest('[data-r2-day]');
  if (day) {
    state.r2DayDetail = {day:Number(day.dataset.r2Day),value:day.dataset.value};
    v4View();
    return;
  }
  const session = event.target.closest('.r2-session.edit,.r2-session.add');
  if (session) {
    state.modal='log';
    v4View();
  }
}, true);

v4View();
