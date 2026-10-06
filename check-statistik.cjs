// node check-statistik.cjs — echte app.js + Statistik mit kontrollierter aktiver Zeit.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict'),{webcrypto}=require('node:crypto');
const PREFIX='mathe-statistik-runde-v1:';
function boot(memory=new Map(),broken=false) {
  let time=0,id=0,confirmed=true;const frames=new Map(),timers=new Map(),intervals=[],listeners={},elements={};
  const element=key=>elements[key]||={value:'',textContent:'',innerHTML:'',style:{},classList:{toggle(){},add(){},remove(){}},reportValidity(){},focus(){},addEventListener(){},showModal(){},close(){},setAttribute(){}};
  const document={hidden:false,getElementById:element,querySelectorAll:()=>[],getAnimations:()=>[],body:{classList:{add(){},remove(){}}},addEventListener:(name,fn)=>listeners[name]=fn};
  const ctx=vm.createContext({console,Math,Uint8Array,crypto:webcrypto,performance:{now:()=>time},document,
    window:{addEventListener:(name,fn)=>listeners[name]=fn},confirm:()=>confirmed,
    requestAnimationFrame:fn=>{frames.set(++id,fn);return id;},cancelAnimationFrame:id=>frames.delete(id),
    setTimeout:fn=>{timers.set(++id,fn);return id;},clearTimeout:id=>timers.delete(id),setInterval:fn=>intervals.push(fn),
    localStorage:{get length(){return memory.size;},key:n=>[...memory.keys()][n],getItem:k=>{if(broken)throw Error('blocked');return memory.get(k)||null;},setItem:(k,v)=>{if(broken)throw Error('quota');memory.set(k,v);},removeItem:k=>memory.delete(k)},
    DOMParser:class{parseFromString(v){return {body:{textContent:v.replace(/<[^>]*>/g,'')}};}}
  });
  const run=code=>vm.runInContext(code,ctx);
  run('function reward(){} function prepareReward(){} function finish(){screen("finish");showNextStageSettings();}');
  for(const f of ['themen.js','aufgaben.js','etappen.js','statistik.js','app.js']) run(fs.readFileSync(f,'utf8'));
  const paint=()=>{for(let n=0;n<2;n++){const jobs=[...frames.values()];frames.clear();jobs.forEach(f=>f());}};
  return {run,memory,paint,document,elements,advance:ms=>time+=ms,confirm:v=>confirmed=v,
    records:()=>[...memory].filter(([k])=>k.startsWith(PREFIX)).map(([,v])=>JSON.parse(v)),
    event:name=>listeners[name](),heartbeat:()=>intervals.forEach(f=>f()),
    tick(){const jobs=[...timers.values()];timers.clear();jobs.forEach(f=>f());paint();},
    start(theme='dino',type='tens',range=100,amount=1){run(`$('taskType').value='${type}';$('range').value=${range};$('amount').value=${amount};start('${theme}')`);paint();},
    answer(correct=true){run(`$('ans').value=String(${correct?"taskType==='split'?q.steps[stepIndex].r:q.r":'9999'});check()`);paint();}
  };
}
// Pflichtschritte, alle Welten/Typen/Zahlenräume, abgeschlossene Runden und Zeit.
for(const world of ['dino','space','mine']) for(const type of ['tens','ones','split']) for(const range of [20,100,1000]) {
  const b=boot();b.start(world,type,range,2);
  for(let n=0;n<2;n++) {
    const steps=b.run("taskType==='split'?q.steps.length:1");
    for(let s=0;s<steps;s++) {b.advance(1000);b.answer();b.advance(2400);b.tick();}
  }
  const [r]=b.records();assert.equal(r.status,'completed');assert.equal(r.worked,2);assert.equal(r.tasks.length,2);
  assert(r.tasks.every(t=>t.attempts===1&&t.wrong===0&&t.firstTry&&t.solved));
  assert.equal(r.activeMs,r.tasks.reduce((s,t)=>s+t.submissions*1000,0));
  assert.equal(b.run('currentScreen'),'finish');
}
let b=boot();b.start('mine','split',100,2);b.advance(2000);b.answer(false);b.advance(3000);b.answer(false);
let r=b.records()[0];assert.equal(r.tasks[0].attempts,2);assert.equal(r.tasks[0].wrong,2);assert.equal(r.tasks[0].ms,5000);
// Leere Eingabe und doppelte Prüfklicks werden nicht erfasst.
b.run("$('ans').value='';check()");assert.equal(b.records()[0].tasks[0].submissions,2);
const steps=b.run('q.steps.length');
for(let s=0;s<steps;s++){b.advance(1000);b.answer();b.run('check()');b.advance(1100);b.tick();}
r=b.records()[0];assert.equal(r.tasks[0].attempts,3);assert.equal(r.tasks[0].submissions,2+steps);assert(!r.tasks[0].firstTry);
assert.equal(r.tasks[0].ms,5000+steps*1000);
// Einstellungen und verborgener Browser zählen nicht zur aktiven Zeit.
b.advance(1000);b.run('openSettings()');b.advance(60000);b.run('closeSettings()');b.paint();
b.advance(2000);b.document.hidden=true;b.event('visibilitychange');b.advance(60000);b.document.hidden=false;b.event('visibilitychange');b.paint();
b.advance(3000);b.run('home()');r=b.records()[0];assert.equal(r.status,'interrupted');assert.equal(r.tasks[1].ms,6000);assert.equal(r.worked,1);
const id=r.id,device=b.memory.get('mathe-statistik-geraet-v1');
b=boot(b.memory);b.start('mine','split',100,2);assert.equal(b.records().length,1);assert.equal(b.records()[0].id,id);
b.advance(1000);b.answer(false);b.run('home()');assert.equal(b.records()[0].tasks[1].ms,7000);
b.run("statistics('open')");assert(b.elements.statsTitle.textContent.includes(device));
for(const view of ['overview','worlds','types','ranges']) {b.run(`statistics('tab','${view}')`);assert(b.elements.statsContent.innerHTML.includes('von'));}
// Wiederaufnahme behält ID; finaler Prüfklick zählt bereits vor der Abschlussanimation.
b.run("statistics('close');start('mine')");b.paint();
while(!b.run('locked')) {b.advance(500);b.answer();if(!b.run('locked')) b.tick();}
assert.equal(b.records()[0].status,'completed');b=boot(b.memory);assert.equal(b.records()[0].status,'completed');
b.start('mine','split',100,2);b.tick();assert.equal(b.records().length,1);
b.run("$('nextAmount').value='1';startNextStage()");b.paint();assert.equal(b.records().length,2);
// Periodische Sicherung und Wiederöffnung ohne Abschlussereignis.
b.advance(4321);b.heartbeat();const mem=b.memory;b=boot(mem);assert.equal(b.records()[1].status,'interrupted');assert.equal(b.records()[1].activeMs,4321);
assert.equal(mem.get('mathe-statistik-geraet-v1'),device);
// Zurücksetzen: Abbrechen erhält Daten, Bestätigung löscht nur Statistik, ID bleibt.
b.run("statistics('open')");b.confirm(false);b.run("statistics('reset')");assert.equal(b.records().length,2);
const journeys=mem.get('mathe-abenteuer-reisen-v2');b.confirm(true);b.run("statistics('reset')");assert.equal(b.records().length,0);
assert.equal(mem.get('mathe-statistik-geraet-v1'),device);assert.equal(mem.get('mathe-abenteuer-reisen-v2'),journeys);
b.run("statistics('close');start('mine')");b.paint();b.answer();assert.equal(b.records().length,0);
// Ein anderes Gerät bekommt unabhängig eine andere zufällige ID.
assert.notEqual(boot().memory.get('mathe-statistik-geraet-v1'),device);
// Speicherfehler blockieren keine Rechnung und werden sichtbar gemeldet.
b=boot(new Map(),true);b.start();b.answer();b.tick();assert.equal(b.run('currentScreen'),'finish');b.run("home();statistics('open')");assert(b.elements.statsWarning.textContent.length>0);
// Ungültige Rohdaten werden nicht überschrieben, andere Daten bleiben lesbar.
const damaged=new Map([[PREFIX+'BROKEN','{kaputt']]);b=boot(damaged);b.start();b.answer();b.tick();assert.equal(damaged.get(PREFIX+'BROKEN'),'{kaputt');assert.equal(b.run('score'),1);
// Vorhandenes Speicherformat: gleiche kleine Rechnung in unterschiedlichen gewählten Zahlenräumen.
// Der Filter darf NICHT anhand der Operanden oder als Obergrenze filtern.
const filterMemory=new Map();let fixtureId=0;
for(const [typeIndex,type] of ['tens','ones','split'].entries()) for(const [rangeIndex,range] of [20,100,1000].entries()) {
  const id=String.fromCharCode(65+fixtureId++).repeat(24);
  const tasks=Array.from({length:rangeIndex+1},(_,index)=>({index,equation:'10 + 5',solution:15,
    submissions:range===100&&index===1?1:index===0?1:3,wrong:range===100&&index===1?1:index===0?0:2,
    solved:!(range===100&&index===1),ms:(typeIndex+1)*(rangeIndex+1)*1000}));
  filterMemory.set(PREFIX+id,JSON.stringify({id,theme:['dino','space','mine'][typeIndex],range,type,total:tasks.length,status:range===100?'interrupted':'completed',tasks}));
}
b=boot(filterMemory);b.run("statistics('open');statistics('tab','types')");
const storedBefore=JSON.stringify([...filterMemory]);
const expected={all:{count:6,first:3,solved:5,attempts:10,ms:12000},20:{count:1,first:1,solved:1,attempts:1,ms:1000},100:{count:2,first:1,solved:1,attempts:2,ms:2000},1000:{count:3,first:1,solved:3,attempts:7,ms:9000}};
const fmt=(n,d=0)=>n.toLocaleString('de-CH',{minimumFractionDigits:d,maximumFractionDigits:d});
for(const filter of ['all','20','100','1000','all']) {
  b.run(`statistics('filterRange','${filter}')`);
  assert.equal(b.elements.statsViewTitle.textContent,`Aufgabentypen – ${filter==='all'?'Alle Zahlenräume':'bis '+filter}`);
  const cards=b.elements.statsContent.innerHTML.match(/<article[\s\S]*?<\/article>/g);assert.equal(cards.length,3);
  cards.forEach((card,n)=>{
    const e=expected[filter],values=[...card.matchAll(/<strong>(.*?)<\/strong>/g)].map(m=>m[1]);
    assert.deepEqual(values,[fmt(e.count),`${e.first} von ${e.count} (${fmt(e.first/e.count*100,1)} %)`,`${e.solved} von ${e.count} (${fmt(e.solved/e.count*100,1)} %)`,fmt(e.attempts/e.count,2),`${fmt(e.ms*(n+1)/e.solved/1000,1)} s`]);
    assert(card.includes(`Summe: ${e.attempts} / ${e.count} Aufgaben`));
    assert(card.includes(`Summe: ${fmt(e.ms*(n+1)/1000,1)} s / ${e.solved} gelöst`));
  });
}
// Andere Ansichten sind unabhängig vom zuletzt verwendeten Filter.
for(const view of ['overview','worlds','ranges']) {
  b.run(`statistics('tab','${view}')`);const all=b.elements.statsContent.innerHTML;
  b.run("statistics('filterRange','100')");assert.equal(b.elements.statsContent.innerHTML,all);
}
assert.equal(JSON.stringify([...filterMemory]),storedBefore,'Filter verändert keine gespeicherten Daten');
b.run("statistics('tab','types');statistics('filterRange','1000');statistics('close');statistics('open');statistics('tab','types')");
assert.equal(b.elements.statsViewTitle.textContent,'Aufgabentypen – Alle Zahlenräume');
// Ein leerer Zahlenraum behält die drei Karten mit 0 / 0 und ohne NaN/Infinity.
const only100=new Map([...filterMemory].filter(([key,value])=>!key.startsWith(PREFIX)||JSON.parse(value).range===100));
b=boot(only100);b.run("statistics('open');statistics('tab','types');statistics('filterRange','20')");
assert.equal((b.elements.statsContent.innerHTML.match(/0 von 0 \(–\)/g)||[]).length,6);
assert(!/NaN|Infinity/.test(b.elements.statsContent.innerHTML));
console.log('OK: Statistikabläufe und Zahlenraumfilter: exakte Trennung, alle Typen, Quoten, Summen, Mittelwerte, leere Filter, unveränderte Speicherdaten und übrige Ansichten.');
