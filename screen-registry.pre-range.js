var AIR2_SCREEN_REGISTRY = [
  { id:'device', title:'01 设备已连接', group:'入口', figma:'1:13028', state:{ page:'device' }, next:['home-empty'] },
  { id:'home-empty', title:'02 吸奶器子首页 / 空状态', group:'入口', figma:'1:13118', state:{ page:'home', hasLogged:false }, previous:['device'], next:['control-manual-idle','fit-check'] },
  { id:'control-manual-idle', title:'03 手动刺激 / 未开始', group:'手动控制', figma:'1:18104', state:{ page:'control', mode:'stimulation', auto:false, running:false }, previous:['home-empty'], next:['fit-check','control-manual-running'] },
  { id:'control-expression-idle', title:'03b 手动表达 / 未开始', group:'手动控制', state:{ page:'control', mode:'expression', auto:false, running:false, levelL:5, levelR:9 }, previous:['control-manual-idle'], next:['fit-check','control-manual-running'] },
  { id:'control-auto-idle', title:'03c 自动刺激 / 未开始', group:'自动控制', state:{ page:'control', mode:'stimulation', auto:true, running:false, levelL:2, levelR:4 }, previous:['control-manual-idle'], next:['fit-check','control-auto-stimulation'] },
  { id:'fit-check', title:'04 佩戴检测', group:'佩戴检测', figma:'1:14443', state:{ page:'control', modal:'fit', fitStage:2, fitAdjust:true }, previous:['control-manual-idle','home-empty'], next:['control-manual-running'] },
  { id:'fit-success', title:'05 佩戴检测 / 完成', group:'佩戴检测', state:{ page:'control', modal:'fit', fitStage:6 }, previous:['fit-check'], next:['control-manual-running'] },
  { id:'control-manual-running', title:'06 手动刺激 / 运行中', group:'手动控制', figma:'1:18307', state:{ page:'control', mode:'stimulation', auto:false, running:true, timer:8, milkL:.1, milkR:.1 }, previous:['fit-success'], next:['control-auto-stimulation'] },
  { id:'control-auto-stimulation', title:'07 自动刺激', group:'自动控制', figma:'1:15525', state:{ page:'control', mode:'stimulation', auto:true, running:true, timer:8, milkL:0, milkR:0 }, previous:['control-manual-running'], next:['control-auto-expression'] },
  { id:'control-auto-expression', title:'08 自动表达', group:'自动控制', figma:'1:15286', state:{ page:'control', mode:'expression', auto:true, running:true, timer:121, milkL:1.1, milkR:1.3 }, previous:['control-auto-stimulation'], next:['program-list'] },
  { id:'program-list', title:'09 方案列表 / Milk Boost 展开', group:'方案', figma:'1:16863', state:{ page:'list', mode:'expression', auto:true, running:true, listExpanded:'Milk Boost' }, previous:['control-auto-expression'], next:['program-confirm'] },
  { id:'program-confirm', title:'10 切换方案确认', group:'方案', figma:'1:19722', state:{ page:'list', modal:'confirm', mode:'expression', auto:true, running:true, listExpanded:'Milk Boost' }, previous:['program-list'], next:['milkboost-stimulation'] },
  { id:'milkboost-stimulation', title:'11 Milk Boost / 刺激', group:'方案运行', figma:'1:16020', state:{ page:'control', mode:'stimulation', auto:true, running:true, selectedProgram:'Milk Boost', timer:8, milkL:5.1, milkR:6.3 }, previous:['program-confirm'], next:['milkboost-expression'] },
  { id:'milkboost-expression', title:'12 Milk Boost / 表达', group:'方案运行', figma:'1:16254', state:{ page:'control', mode:'expression', auto:true, running:true, selectedProgram:'Milk Boost', timer:128, milkL:6.5, milkR:6.9 }, previous:['milkboost-stimulation'], next:['log-amount'] },
  { id:'log-amount', title:'13 保存奶量', group:'结果', figma:'1:13633', state:{ page:'control', modal:'log', mode:'expression', auto:true, running:false, selectedProgram:'Milk Boost', timer:1200, milkL:7.1, milkR:7.1 }, previous:['milkboost-expression'], next:['logged'] },
  { id:'logged', title:'14 保存成功', group:'结果', figma:'3:5292', state:{ page:'control', modal:'logged', mode:'expression', running:false, timer:1200, milkL:7.1, milkR:7.1 }, previous:['log-amount'], next:['home-result'] },
  { id:'home-result', title:'15 子首页 / 完成结果', group:'结果', state:{ page:'home', hasLogged:true, running:false, timer:1200, milkL:7.1, milkR:7.1 }, previous:['logged'], next:[] }
];

var AIR2_SCREEN_RELATIONS = AIR2_SCREEN_REGISTRY.reduce((map, screen) => {
  map[screen.id] = { previous:screen.previous || [], next:screen.next || [] };
  return map;
}, {});
