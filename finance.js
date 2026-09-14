const fixedTypes = {rent:'房租',electricity:'电费',water:'水费',gas:'燃气费',internet:'网费',combined:'水电燃气合并账单',other:'其他固定费用'};
let financeMonth='',historyType='',historyMonth='',historyDemo=false,financeTab='payable';
const archivedMonth=m=>m<today().slice(0,7);
function splitAmount(amount,members){const base=Math.floor(amount/members.length),rest=amount%members.length;return Object.fromEntries(members.map((id,i)=>[id,base+(i<rest?1:0)]))}
function sealBill(b){
  // App-level immutable accounting record. Payment confirmations stay separate from charge allocations.
  if(Object.isFrozen(b))return b;
  b.splitSnapshot ||= {amount:b.amount,members:[...b.members],allocations:splitAmount(b.amount,b.members)};
  b.splitSnapshot.rule ||= b.splitRule||(b.members.length===people.length?'equal':'selected');
  Object.freeze(b.splitSnapshot.members);Object.freeze(b.splitSnapshot.allocations);Object.freeze(b.splitSnapshot);
  Object.freeze(b.members);return Object.freeze(b);
}
function occupancyLocked(month){return archivedMonth(month)||state.bills.some(b=>billMonth(b)===month)}
function sealOccupancy(){for(const [month,ids] of Object.entries(state.finance.occupancy)){if(occupancyLocked(month)){Object.freeze(ids);Object.defineProperty(state.finance.occupancy,month,{value:ids,writable:false,configurable:false,enumerable:true})}}}
function myTotal(bs){return bs.reduce((sum,b)=>sum+(shares(b)[state.user]||0),0)}
const splitLabels={equal:'平均分摊',selected:'选择室友',custom:'自定义金额'};
function billRule(b){return b.splitSnapshot?.rule||b.splitRule||(b.members.length===people.length?'equal':'selected')}
function ruleDetails(b){return `<details class="bill-rule"><summary>${splitLabels[billRule(b)]}</summary><div class="rule-people">${b.members.map(id=>`<span>${occupantChips([id])}<strong>${money(shares(b)[id]||0)}</strong></span>`).join('')}</div></details>`}
function parseCents(value){return /^(?:\d+(?:\.\d{0,2})?|\.\d{1,2})$/.test(String(value))?Math.round(Number(value)*100):NaN}
function makeAllocation(rule,amount,members,custom={}){
  if(!Number.isSafeInteger(amount)||amount<=0)throw Error('请输入有效金额');
  if(!splitLabels[rule])throw Error('请选择分摊方式');
  if(rule==='equal')members=[...people];
  if(rule==='custom'){
    const amounts=Object.fromEntries(people.map(id=>[id,parseCents(custom[id]??'0')]));
    if(Object.values(amounts).some(v=>!Number.isSafeInteger(v)||v<0))throw Error('金额最多保留两位小数');
    const sum=Object.values(amounts).reduce((a,b)=>a+b,0);
    if(sum!==amount)throw Error(sum<amount?'还有 '+money(amount-sum)+' 未分配':'已超出 '+money(sum-amount));
    members=people.filter(id=>amounts[id]>0);
    return {members,allocations:Object.fromEntries(members.map(id=>[id,amounts[id]]))};
  }
  members=[...new Set(members)];
  if(!members.length)throw Error('至少选择一位室友');
  if(members.some(id=>!people.includes(id)))throw Error('请选择当前室友');
  return {members,allocations:splitAmount(amount,members)};
}
function updateSplitPreview(){
  const panel=document.querySelector('#split-preview');if(!panel)return;
  const rule=document.querySelector('#split-rule').value;
  document.querySelector('#member-options').hidden=rule!=='selected';
  document.querySelector('#custom-options').hidden=rule!=='custom';
  document.querySelectorAll('#custom-options input').forEach(el=>el.disabled=rule!=='custom');
  const amount=parseCents(document.querySelector('#fields input[name="amount"]').value);
  if(!Number.isSafeInteger(amount)||amount<=0){panel.innerHTML='';return}
  const members=[...document.querySelectorAll('#fields input[name="members"]:checked')].map(el=>el.value);
  const custom=Object.fromEntries(people.map((id,i)=>[id,document.querySelector('#custom-'+i).value]));
  try{const result=makeAllocation(rule,amount,members,custom);panel.innerHTML=`<div>${result.members.map(id=>`<span>${esc(id)} <strong>${money(result.allocations[id])}</strong></span>`).join('')}</div>`}
  catch(error){panel.textContent=error.message}
}
function residentName(id){return people.includes(id)?id:'已退租室友'}
function classifyBill(b){
  if(b.category)return;
  if(/水电|水.*燃气|电.*燃气/.test(b.title)){b.category='fixed';b.type='combined'}
  else {const found=[['rent',/房租/],['electricity',/电费/],['water',/水费/],['gas',/燃气|煤气/],['internet',/网费|宽带/]].find(([,re])=>re.test(b.title));b.category=found?'fixed':'personal';b.type=found?.[0]||'personal'}
}
function initFinance(){
  state.finance ||= {occupancy:{}};
  state.finance.occupancy ||= {};
  state.bills.forEach(b=>{classifyBill(b);b.month ||= b.date.slice(0,7)});
  // The current household is known; past occupants are never inferred from a bill's split participants.
  state.finance.occupancy[today().slice(0,7)] ||= [...people];
  state.bills.forEach(sealBill);sealOccupancy();
  financeMonth ||= today().slice(0,7);
  try{localStorage.setItem('roommate-v1',JSON.stringify(state))}catch{}
}
function monthText(m){return m.replace('-',' 年 ')+' 月'}
function shiftMonth(m,n){const [y,mo]=m.split('-').map(Number);const d=new Date(y,mo-1+n,1,12);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')}
function billMonth(b){return b.month||b.date.slice(0,7)}
function sumBills(bs){return bs.reduce((s,b)=>s+b.amount,0)}
function occupantChips(ids){return ids.map(id=>people.includes(id)?`<span class="occupant"><b>${esc(id.slice(0,1))}</b><span>${esc(id)}</span></span>`:`<span class="occupant departed" aria-label="已退租室友"><b aria-hidden="true"><svg viewBox="0 0 24 24" width="22" height="22" fill="currentColor"><circle cx="12" cy="8" r="4"/><path d="M4 22v-3a8 8 0 0 1 16 0v3z"/></svg></b></span>`).join('')}
function receivables(bs,settled=false){return bs.flatMap(b=>b.payer===state.user?b.members.filter(id=>id!==state.user&&b.paid.includes(id)===settled).map(member=>({bill:b,member,amount:shares(b)[member]||0})):[])}
function settlements(bs){return [
  ...bs.filter(b=>b.payer!==state.user&&b.paid.includes(state.user)).map(b=>({bill:b,kind:'paid',person:b.payer,amount:shares(b)[state.user]||0})),
  ...receivables(bs,true).map(r=>({bill:r.bill,kind:'received',person:r.member,amount:r.amount}))
]}
function personalLedger(bs){
  const payable=bs.filter(b=>debt(b,state.user)>0),receive=receivables(bs),settled=settlements(bs);
  const rows=financeTab==='payable'?payable:financeTab==='receivable'?receive:settled;
  return `<section class="card personal-ledger"><div class="ledger-tabs" role="tablist"><button role="tab" aria-selected="${financeTab==='payable'}" class="${financeTab==='payable'?'selected':''}" data-finance-tab="payable"><span>待付款</span><strong>${money(payable.reduce((s,b)=>s+debt(b,state.user),0))}</strong><i>${payable.length}</i></button><button role="tab" aria-selected="${financeTab==='receivable'}" class="${financeTab==='receivable'?'selected':''}" data-finance-tab="receivable"><span>待收款</span><strong>${money(receive.reduce((s,r)=>s+r.amount,0))}</strong><i>${receive.length}</i></button><button role="tab" aria-selected="${financeTab==='settled'}" class="${financeTab==='settled'?'selected':''}" data-finance-tab="settled"><span>已结清</span><strong>${money(settled.reduce((s,r)=>s+r.amount,0))}</strong><i>${settled.length}</i></button></div><div class="ledger-list">${financeTab==='payable'?payableRows(rows):financeTab==='receivable'?receiveRows(rows):settledRows(rows)}</div></section>`
}
function ledgerTitle(b){return `<div class="ledger-title"><span class="tile">${b.category==='fixed'?'⌂':'¥'}</span><div><h3>${esc(b.title)}</h3><p>${esc(b.date)} · ${splitLabels[billRule(b)]}</p></div></div>`}
function payableRows(rows){return rows.length?rows.map(b=>`<div class="ledger-row">${ledgerTitle(b)}<div class="ledger-person"><small>付给</small>${occupantChips([b.payer])}</div><div class="ledger-money"><strong>${money(debt(b,state.user))}</strong><small>我的分摊</small></div><button class="primary mini" data-pay="${b.id}">已付款</button></div>`).join(''):'<div class="ledger-empty">本月没有待付款项</div>'}
function receiveRows(rows){return rows.length?rows.map(r=>`<div class="ledger-row">${ledgerTitle(r.bill)}<div class="ledger-person"><small>来自</small>${occupantChips([r.member])}</div><div class="ledger-money receive"><strong>+${money(r.amount)}</strong><small>待收款</small></div><button class="secondary mini" data-receive="${r.bill.id}" data-member="${esc(r.member)}">已收到</button></div>`).join(''):'<div class="ledger-empty">本月没有待收款项</div>'}
function settledRows(rows){return rows.length?rows.map(r=>`<div class="ledger-row settled-row">${ledgerTitle(r.bill)}<div class="ledger-person"><small>${r.kind==='paid'?'付给':'收到'}</small>${occupantChips([r.person])}</div><div class="ledger-money"><strong>${r.kind==='received'?'+':''}${money(r.amount)}</strong><small>${r.kind==='paid'?'已付款':'已收款'}</small></div><span class="settled-mark">✓</span></div>`).join(''):'<div class="ledger-empty">本月还没有已结清记录</div>'}
function financeView(){
  const bs=state.bills.filter(b=>billMonth(b)===financeMonth),fixed=bs.filter(b=>b.category==='fixed'),personal=bs.filter(b=>b.category==='personal');
  return heading('费用 AA','','bill','记一笔')+`
    <div class="finance-month"><div class="right"><button class="secondary" data-month-step="-1" aria-label="上个月">‹</button><label><span class="sr-only">账单月份</span><input type="month" id="finance-month" value="${financeMonth}" min="2000-01" max="2100-12"></label><button class="secondary" data-month-step="1" aria-label="下个月">›</button></div><span class="tag">${archivedMonth(financeMonth)?"已归档":"本期账单"}</span></div>
    ${personalLedger(bs)}
    <div class="finance-overview"><span>全屋总费用 <strong>${money(sumBills(bs))}</strong></span><span>我的本月分摊 <strong>${money(myTotal(bs))}</strong></span></div>
    <div class="expense-columns"><section class="card"><div class="card-head"><h2>固定居住费用</h2></div>
    <div class="fixed-list">${Object.entries(fixedTypes).filter(([key])=>!['combined','other'].includes(key)||state.bills.some(b=>b.type===key)).map(([key,title])=>{const list=fixed.filter(b=>b.type===key);return `<button class="fixed-expense" data-history="${key}"><span class="row-title"><span class="tile">${{rent:'⌂',electricity:'ϟ',water:'≈',gas:'♨',internet:'⌁'}[key]||'≡'}</span><span><strong>${title}</strong><small>${list.length?list.length+' 笔账单':'本月未记录'}</small></span></span><span class="expense-total"><strong>我的 ${list.length?money(myTotal(list)):'—'}</strong><small>全屋总额 ${list.length?money(sumBills(list)):'—'}</small><small>历史账单 →</small></span></button>`}).join('')}</div></section>
    <section class="card personal-panel"><div class="card-head"><h2>其他个人费用</h2><button class="text-link" data-personal-add="1">＋ 记一笔</button></div>${personal.length?personal.map(b=>`<div class="personal-expense"><div class="row"><div><h3>${esc(b.title)}</h3><p>${esc(residentName(b.payer))}垫付 · ${b.members.length} 人参与</p></div><span class="amount">${money(shares(b)[state.user]||0)}<small>我的分摊 · 总额 ${money(b.amount)}</small></span></div><div class="personal-bottom">${ruleDetails(b)}</div></div>`).join(''):'<div class="finance-empty"><span>＋</span><h3>本月还没有其他费用</h3><button class="secondary" data-personal-add="1">记录个人费用</button></div>'}</section></div>`;
}
function paymentButton(b){return debt(b,state.user)>0?`<button class="primary mini" data-pay="${b.id}">已付款</button>`:`<span class="tag">${b.payer===state.user?'我已垫付':b.members.includes(state.user)?'已结清':'未参与'}</span>`}
function financeTable(bs,readOnly=false){return bs.length?`<div class="table-wrap"><table><thead><tr><th>费用项目</th><th>总金额</th><th>垫付人</th><th>我的金额</th>${readOnly?'':'<th>状态</th>'}</tr></thead><tbody>${bs.map(b=>`<tr><td><strong>${esc(b.title)}</strong><p class="note">${esc(b.date)} · ${b.category==='fixed'?'固定居住':'其他个人'}费用</p></td><td>${money(b.amount)}</td><td>${people.includes(b.payer)?esc(b.payer):occupantChips([b.payer])}</td><td><strong class="success">${money(shares(b)[state.user]||0)}</strong>${ruleDetails(b)}</td>${readOnly?'':`<td>${paymentButton(b)}</td>`}</tr>`).join('')}</tbody></table></div>`:'<p class="empty">该月暂无符合条件的账单</p>'}
function historySamples(type){const now=today().slice(0,7),amounts=type==='rent'?[480000,480000,480000,480000,480000,480000]:type==='electricity'?[12640,15860,22480,31820,28640,19680]:type==='water'?[6800,7200,7600,8500,8100,7400]:type==='gas'?[4600,5200,3800,4100,4400,4900]:type==='internet'?[10000,10000,10000,10000,10000,10000]:[18000,21000,26000,33000,29000,24000];return amounts.map((amount,i)=>({id:'demo-'+i,category:'fixed',type,amount,month:shiftMonth(now,i-5),date:shiftMonth(now,i-5)+'-05',title:fixedTypes[type]+'（示例）',payer:'林一',members:i<3?['小夏','林一','陈可','anonymous-1']:[...people],paid:[...people]}))}
function monthlyHistory(type,records){const actual=records.filter(b=>b.category==='fixed'&&b.type===type);const anchor=historyMonth||financeMonth;const end=actual.reduce((v,b)=>billMonth(b)>v?billMonth(b):v,anchor);const earliest=actual.reduce((v,b)=>billMonth(b)<v?billMonth(b):v,shiftMonth(end,-5));let result=[];for(let m=earliest;m<=end;m=shiftMonth(m,1)){const bills=actual.filter(b=>billMonth(b)===m);result.push({month:m,total:sumBills(bills),recorded:!!bills.length,bills})}return result}
function showHistory(type){historyType=type;historyMonth=financeMonth;historyDemo=false;const d=document.createElement('dialog');d.id='expense-history';d.className='history-dialog';d.setAttribute('aria-label',fixedTypes[type]+'历史');document.body.appendChild(d);d.addEventListener('close',()=>d.remove());drawHistory();d.showModal()}
function drawHistory(){const target=$('#expense-history');if(!target)return;const records=historyDemo?historySamples(historyType):state.bills;const months=monthlyHistory(historyType,records),selected=months.find(m=>m.month===historyMonth)||months.at(-1);historyMonth=selected.month;const max=Math.max(...months.map(m=>m.total),1),recorded=months.filter(m=>m.recorded);const previous=months.find(m=>m.month===shiftMonth(selected.month,-1));const pct=previous?.recorded&&previous.total>0&&selected.recorded?((selected.total-previous.total)/previous.total*100):null;const occupants=historyDemo?(selected.bills[0]?.members):state.finance.occupancy[historyMonth];
target.innerHTML=`<div class="dialog-head"><div><span class="history-eyebrow">302 · 固定居住费用</span><h2>${fixedTypes[historyType]}历史</h2></div><button class="icon" data-history-close="1" aria-label="关闭历史">×</button></div><div class="history-switch"><button class="${!historyDemo?'selected':''}" data-history-source="actual">实际记录</button><button class="${historyDemo?'selected':''}" data-history-source="demo">示例</button></div>${historyDemo?'<span class="tag demo-label">示例数据</span>':''}<div class="history-chart-head"><div><h3>每月总${fixedTypes[historyType]}</h3></div><span class="tag">${recorded.length} 个月有记录</span></div><div class="chart-scroll"><div class="month-chart" style="--months:${months.length}">${months.map(m=>`<button class="chart-column ${m.month===historyMonth?'selected':''}" data-history-month="${m.month}" aria-pressed="${m.month===historyMonth}" aria-label="${monthText(m.month)}，${m.recorded?money(m.total):'未记录'}"><span class="bar-space"><span class="bar" style="height:${m.recorded?Math.max(2,m.total/max*100):0}%"><span class="bar-label">${m.recorded?money(m.total):'未记录'}</span></span>${!m.recorded?'<span class="unrecorded-line"></span>':''}</span><span class="month-tick">${m.month.slice(0,4)}<br><strong>${Number(m.month.slice(5))} 月</strong></span></button>`).join('')}</div></div><p class="note chart-key">元</p><section class="history-detail"><div class="card-head"><div><h3>${monthText(historyMonth)}</h3><p class="note">${selected.bills.length} 笔账单</p></div><div class="amount"><small>全屋总费用</small>${selected.recorded?money(selected.total):'尚未记录'}<small>${pct===null?'':`较上月${pct>0?'增加':pct<0?'减少':'持平'}${pct===0?'':' '+Math.abs(pct).toFixed(1)+'%'}`}</small></div></div><div class="my-share-detail"><div><span>我的账单 · ${esc(state.user)}</span><strong>${selected.recorded?money(myTotal(selected.bills)):'—'}</strong></div></div><div class="occupancy-head"><h3>当月入住人${occupants?' · '+occupants.length+' 人':''}</h3>${historyDemo?'<span class="tag">示例</span>':occupancyLocked(historyMonth)?'<span class="tag">已归档</span>':'<button class="text-link" data-occupancy-edit="1">登记入住记录</button>'}</div><div class="occupants">${occupants?occupantChips(occupants):'<p class="note">暂无入住记录</p>'}</div></section><div class="history-bills"><h3>我的当月分摊明细</h3>${financeTable(selected.bills,true)}</div>`;
}
function openFinanceBill(personal=false){
const entryMonth=archivedMonth(financeMonth)?today().slice(0,7):financeMonth;
modal('记一笔',`<label>类别<select name="category" id="bill-category"><option value="fixed" ${personal?'':'selected'}>固定居住费用</option><option value="personal" ${personal?'selected':''}>其他个人费用</option></select></label><label id="bill-type-label" ${personal?'hidden':''}>项目<select name="type">${Object.entries(fixedTypes).filter(([k])=>k!=='combined').map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label>`+input('名称','title','text','','maxlength="50"')+input('总金额','amount','number','','min="0.01" max="1000000" step="0.01"')+input('月份','month','month',entryMonth,`min="${today().slice(0,7)}" max="2100-12"`)+select('垫付人','payer')+input('日期','date','date',today())+`<label>分摊方式<select name="splitRule" id="split-rule"><option value="equal" ${personal?'':'selected'}>平均分摊</option><option value="selected" ${personal?'selected':''}>选择室友</option><option value="custom">自定义金额</option></select></label><div id="member-options" class="checks" ${personal?'':'hidden'}>${people.map(p=>`<label><input type="checkbox" name="members" value="${p}" ${!personal||p===state.user?'checked':''}>${p}</label>`).join('')}</div><div id="custom-options" class="custom-options" hidden>${people.map((id,i)=>`<label>${id}<input type="number" name="custom-${i}" id="custom-${i}" value="0" min="0" max="1000000" step="0.01" disabled></label>`).join('')}</div><div id="split-preview" class="split-preview" aria-live="polite"></div>`,f=>{
  if(archivedMonth(f.get('month'))){toast('该月份已归档');return false}
  const amount=parseCents(f.get('amount')),rule=f.get('splitRule');let result;
  try{result=makeAllocation(rule,amount,f.getAll('members'),Object.fromEntries(people.map((id,i)=>[id,f.get('custom-'+i)])))}catch(error){toast(error.message);return false}
  const category=f.get('category');state.bills.push(sealBill({id:Date.now(),title:f.get('title').trim(),amount,payer:f.get('payer'),members:result.members,date:f.get('date'),month:f.get('month'),category,type:category==='fixed'?f.get('type'):'personal',splitRule:rule,splitSnapshot:{amount,members:[...result.members],allocations:result.allocations,rule},paid:[],recordedAt:new Date().toISOString()}));sealOccupancy();financeMonth=f.get('month')
});updateSplitPreview();
}
function editOccupancy(){if(historyDemo||occupancyLocked(historyMonth)){toast('已归档，不能修改');return}const editMonth=historyMonth;const ids=state.finance.occupancy[historyMonth]||[];modal(monthText(historyMonth)+'入住记录',`<p class="note">选择当月实际入住、现在仍住在 302 的室友。退租室友仅登记人数，不录入姓名。</p><div class="checks">${people.map(p=>`<label><input type="checkbox" name="occupants" value="${p}" ${ids.includes(p)?'checked':''}>${p}</label>`).join('')}</div>`+input('当月入住、现已退租的人数','departed','number',ids.filter(p=>!people.includes(p)).length,'min="0" max="20" step="1"'),f=>{if(occupancyLocked(editMonth)){toast('已归档，不能修改');return false}const count=Number(f.get('departed'));state.finance.occupancy[editMonth]=[...f.getAll('occupants'),...Array.from({length:count},(_,i)=>'anonymous-'+i)];drawHistory()})}
document.addEventListener('change',e=>{
  if(e.target.id==='finance-month'&&e.target.validity.valid&&e.target.value){financeMonth=e.target.value;render()}
  if(e.target.id==='bill-category')document.querySelector('#bill-type-label').hidden=e.target.value==='personal';
  if(['amount','members','splitRule'].includes(e.target.name)||e.target.name?.startsWith('custom-'))updateSplitPreview();
});
document.addEventListener('input',e=>{if(e.target.name==='amount'||e.target.name?.startsWith('custom-'))updateSplitPreview()});
document.addEventListener('click',e=>{const d=e.target.closest('button')?.dataset;if(!d)return;if(d.monthStep){financeMonth=shiftMonth(financeMonth,Number(d.monthStep));render()}if(d.financeTab){financeTab=d.financeTab;render()}if(d.personalAdd)openFinanceBill(true);if(d.receive){const bill=state.bills.find(b=>b.id==d.receive),member=d.member;if(!bill||bill.payer!==state.user||!bill.members.includes(member)||bill.paid.includes(member))return;modal('确认收款',`<p>确认收到 ${esc(residentName(member))} 的 <strong>${money(shares(bill)[member])}</strong>？</p>`,()=>{bill.paid.push(member);financeTab='receivable'})}if(d.history)showHistory(d.history);if(d.historyClose)$('#expense-history').close();if(d.historyMonth){historyMonth=d.historyMonth;drawHistory()}if(d.historySource){historyDemo=d.historySource==='demo';historyMonth=historyDemo?today().slice(0,7):financeMonth;drawHistory()}if(d.occupancyEdit)editOccupancy()});
