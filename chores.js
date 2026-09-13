let choreWeek='';
const choreAreas=['客厅清洁','厨房台面与灶台','卫生间清洁','倒垃圾 & 更换垃圾袋'];
const choreColors={'小夏':'mint','林一':'amber','陈可':'violet','周舟':'blue'};
function choreDate(value){return new Date(value+'T12:00:00')}
function mondayOf(value){const d=choreDate(value),day=d.getDay()||7;d.setDate(d.getDate()-day+1);return d.toLocaleDateString('sv-SE')}
function addDays(value,n){const d=choreDate(value);d.setDate(d.getDate()+n);return d.toLocaleDateString('sv-SE')}
function weekDates(start){return Array.from({length:7},(_,i)=>addDays(start,i))}
function initChores(){
  state.tasks.forEach(t=>{t.status ||= t.done?'done':'todo';t.area ||= choreAreas.includes(t.title)?t.title:'其他任务'});
  choreWeek ||= mondayOf(today());
}
function choreStatus(t){return t.status||(t.done?'done':'todo')}
function choreBoardView(){
  const days=weekDates(choreWeek),weekTasks=state.tasks.filter(t=>days.includes(t.date));
  const done=weekTasks.filter(t=>choreStatus(t)==='done').length,mine=weekTasks.filter(t=>t.person===state.user&&choreStatus(t)!=='done').length;
  return `<div class="chore-heading"><div><h1>清洁值日</h1><div class="chore-stats"><span><strong>${done}</strong> / ${weekTasks.length} 已完成</span><span><strong>${mine}</strong> 项轮到我</span></div></div><button class="primary" data-add="task">＋ 安排值日</button></div>
  <section class="chore-board card"><div class="board-toolbar"><div class="right"><button class="secondary" data-chore-week="-7" aria-label="上一周">‹</button><button class="secondary current-week" data-chore-today="1">本周</button><button class="secondary" data-chore-week="7" aria-label="下一周">›</button></div><strong>${choreDate(choreWeek).toLocaleDateString('zh-CN',{month:'long',day:'numeric'})} — ${choreDate(addDays(choreWeek,6)).toLocaleDateString('zh-CN',{month:'long',day:'numeric'})}</strong><button class="secondary" data-chore-copy="1">排下周</button></div>
  <div class="chore-scroll"><div class="chore-calendar" style="--chore-days:7"><div class="corner-cell"><span>公共区域</span></div>${days.map(d=>{const dt=choreDate(d),isToday=d===today();return `<div class="day-head ${isToday?'today':''}"><span>周${'日一二三四五六'[dt.getDay()]}</span><strong>${dt.getDate()}</strong>${isToday?'<i>今天</i>':''}</div>`}).join('')}${choreAreas.map(area=>`<div class="area-head"><span class="area-icon">${{'客厅清洁':'⌂','厨房台面与灶台':'♨','卫生间清洁':'≈','倒垃圾 & 更换垃圾袋':'♻'}[area]}</span><strong>${area.replace(' & 更换垃圾袋','')}</strong></div>${days.map(date=>{const tasks=weekTasks.filter(t=>t.area===area&&t.date===date);return `<div class="chore-cell ${date===today()?'today':''}">${tasks.map(choreCard).join('')}<button class="cell-add" data-chore-new="1" data-area="${esc(area)}" data-date="${date}" aria-label="安排${esc(area)}">＋</button></div>`}).join('')}`).join('')}</div></div>
  <div class="board-legend">${people.map(p=>`<span><i class="${choreColors[p]}"></i>${p}</span>`).join('')}<span class="legend-done">✓ 已完成</span></div></section>`;
}
function choreCard(t){const status=choreStatus(t);return `<button class="chore-card ${choreColors[t.person]||'mint'} ${status}" data-chore-open="${t.id}"><span>${esc(t.person)}</span><strong>${status==='done'?'已完成':status==='skipped'?'已跳过':'待完成'}</strong>${status==='done'?'<i>✓</i>':''}</button>`}
function openChoreEditor(id,area='',date=''){
  const task=state.tasks.find(t=>t.id===Number(id));
  modal(task?'编辑值日':'安排值日',`<label>区域<select name="area">${choreAreas.map(a=>`<option ${a===(task?.area||area)?'selected':''}>${a}</option>`).join('')}</select></label>${select('负责人','person',task?.person||state.user)}${input('日期','date','date',task?.date||date||today())}<label>状态<select name="status"><option value="todo" ${choreStatus(task||{})==='todo'?'selected':''}>待完成</option><option value="done" ${choreStatus(task||{})==='done'?'selected':''}>已完成</option><option value="skipped" ${choreStatus(task||{})==='skipped'?'selected':''}>跳过</option></select></label>`,f=>{
    const next={area:f.get('area'),title:f.get('area'),person:f.get('person'),date:f.get('date'),status:f.get('status'),done:f.get('status')==='done'};
    if(task)Object.assign(task,next);else state.tasks.push({id:Date.now(),...next});
    choreWeek=mondayOf(f.get('date'));
  });
}
function copyChoreWeek(){
  const next=addDays(choreWeek,7),current=state.tasks.filter(t=>weekDates(choreWeek).includes(t.date));
  if(!current.length){toast('本周还没有排班');return}
  current.forEach((t,i)=>{const date=addDays(t.date,7);if(!state.tasks.some(x=>x.area===t.area&&x.date===date))state.tasks.push({...t,id:Date.now()+i,date,person:people[(people.indexOf(t.person)+1)%people.length],status:'todo',done:false})});
  choreWeek=next;save();toast('下周已排好');
}
document.addEventListener('click',e=>{const d=e.target.closest('button')?.dataset;if(!d)return;if(d.choreWeek){choreWeek=addDays(choreWeek,Number(d.choreWeek));render()}if(d.choreToday){choreWeek=mondayOf(today());render()}if(d.choreNew)openChoreEditor(null,d.area,d.date);if(d.choreOpen)openChoreEditor(d.choreOpen);if(d.choreCopy)copyChoreWeek()});
