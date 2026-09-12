/* Small dynamic chart refinement kept separate because review-round2 is an override layer. */
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
  return `<div class="r2-trend-wrap"><div class="r2-y-axis"><span>30</span><span>20</span><span>10</span><span>0</span></div><div class="r2-trend-scroll" data-r2-scroll="latest"><div class="r2-trend-track">${days}</div></div><b class="r2-latest">14.2 oz</b></div>${state.r2DayDetail ? `<div class="r2-day-detail"><b>Jul ${state.r2DayDetail.day}</b><span>${state.r2DayDetail.value ? `${state.r2DayDetail.value} oz · 20 min` : 'No pumping record'}</span></div>` : ''}`;
};
v4View();
