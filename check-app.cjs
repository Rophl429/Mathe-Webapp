// node check-app.cjs — echte Ablauf-/Speicherlogik mit kontrollierter Zeit, ohne Browser.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const memory=new Map();
function boot() {
  const elements={},timers=new Map();let timerId=0;
  const c=vm.createContext({console,Math,confirm:()=>true,
    setTimeout:fn=>{timers.set(++timerId,fn);return timerId;},clearTimeout:id=>timers.delete(id),
    document:{getElementById:id=>elements[id]||=( {value:'',textContent:'',style:{},classList:{toggle(){},add(){},remove(){}},reportValidity(){},focus(){},addEventListener(){},showModal(){this.open=true;},close(){this.open=false;}}),querySelectorAll:()=>[],addEventListener(){},getAnimations:()=>[]},
    localStorage:{getItem:k=>memory.get(k)||null,setItem:(k,v)=>memory.set(k,v),removeItem:k=>memory.delete(k)},
    DOMParser:class{parseFromString(v){return {body:{textContent:v.replace(/<[^>]*>/g,'')}};}}
  });
  vm.runInContext('let rewardMoves=0;function reward(animate){if(animate)rewardMoves++;} function prepareReward(){} function finish(){screen("finish");showNextStageSettings();}',c);
  for(const name of ['themen.js','aufgaben.js','etappen.js','app.js']) vm.runInContext(fs.readFileSync(name,'utf8'),c);
  return {run:code=>vm.runInContext(code,c),tick(){const callbacks=[...timers.values()];timers.clear();callbacks.forEach(fn=>fn());},timers};
}
let b=boot();
for(const range of [20,100,1000]) for(const operation of ['plus','minus','mixed']) for(const amount of [1,6,10,15,50]) {
  const tasks=b.run(`createTasks({range:${range},operation:'${operation}',amount:${amount}})`);
  assert.equal(tasks.length,amount);
  tasks.forEach((t,n)=>{assert(t.r>=0&&t.r<=range);assert.equal(t.r,t.op==='+'?t.a+t.b:t.a-t.b);if(n) assert.notEqual(`${t.a}${t.op}${t.b}`,`${tasks[n-1].a}${tasks[n-1].op}${tasks[n-1].b}`);});
  if(operation==='mixed') assert(Math.abs(tasks.filter(t=>t.op==='+').length-tasks.filter(t=>t.op==='−').length)<=1);
  else assert(tasks.every(t=>t.op===(operation==='plus'?'+':'−')));
}
b.run("$('amount').value='2';start('dino');enterKey('9');enterKey('9');enterKey('9');enterKey('9');check()");
assert.equal(b.run('score'),0);assert.equal(b.timers.size,0);
assert.equal(b.run("$('ans').value"),'');assert.equal(b.run('journeys.dino.session.answer'),'');
b.run("enterKey('9');enterKey('9');enterKey('9');enterKey('9');enterKey('erase')");assert.equal(b.run("$('ans').value"),'999');
const story=b.run('q.story'); b=boot();b.run("start('dino')");assert.equal(b.run('q.story'),story);assert.equal(b.run("$('ans').value"),'999');
b.run("enterKey('clear');enterKey('0');enterKey('4')");assert.equal(b.run("$('ans').value"),'4');
b.run("$('ans').value=String(q.r);check();check();enterKey('7')");assert.equal(b.run('score'),1);assert.equal(b.timers.size,1);assert.equal(b.run('i'),0);
b.run('openSettings()');assert.equal(b.timers.size,0);b.tick();assert.equal(b.run('i'),0);
b.run("$('amount').value='8';enterKey('3');next()");assert.equal(b.run('i'),0);assert.equal(b.run('score'),1);
b.run('closeSettings()');assert.equal(b.run('settings.amount'),2);assert.equal(b.run("$('amount').value"),2);assert.equal(b.timers.size,1);
b.run('home()');b.tick();assert.equal(b.run('i'),0);
b.run("start('space')");assert.equal(b.run('stage'),0);b.run("home();start('dino')");assert.equal(b.run('score'),1);
b=boot();b.run("start('dino')");b.tick();assert.equal(b.run('i'),1);
b.run("$('ans').value=String(q.r);check()");b.tick();assert.equal(b.run('currentScreen'),'finish');assert.equal(b.run('journeys.dino.nextStage'),1);
b=boot();b.run("resume('dino')");assert.equal(b.run('currentScreen'),'finish');assert.equal(b.run('journeys.dino.nextStage'),1);
b.run("$('nextAmount').value='3';startNextStage()");assert.equal(b.run('stage'),1);assert.equal(b.run('total'),3);
// Jede Welt vollständig durchlaufen; Aufgabenanzahl je Etappe ändern; zyklischer Neustart.
for(const theme of ['dino','space','mine']) {
  b.run(`home();resetJourney('${theme}')`);
  const length=b.run(`JOURNEYS.${theme}.length`);
  for(let stage=0;stage<length;stage++) {
    b.run(`$('amount').value='${stage+1}';start('${theme}')`);
    assert.equal(b.run('stage'),stage);assert.equal(b.run('total'),stage+1);
    for(let task=0;task<=stage;task++){b.run("$('ans').value=String(q.r);check()");b.tick();}
    assert.equal(b.run('currentScreen'),'finish');
    assert.equal(b.run(`journeys.${theme}.nextStage`),(stage+1)%length);
    b.run('home()');
  }
  b.run(`start('${theme}')`);assert.equal(b.run('stage'),0);b.run('home()');
}
b.run("start('dino');$('ans').value=String(q.r);check()");b.tick();
const spaceSnapshot=b.run('JSON.stringify(journeys.space)');
b.run("home();restartStage('dino')");assert.equal(b.run('score'),0);assert.equal(b.run('JSON.stringify(journeys.space)'),spaceSnapshot);
// Bestehende V1-Durchgänge werden in Etappe 1 übernommen.
const legacy=b.run('JSON.stringify(journeys.dino.session)');memory.clear();memory.set('mathe-abenteuer-session-v1',legacy);
b=boot();assert.equal(b.run('journeys.dino.session.stage'),0);assert(memory.has('mathe-abenteuer-reisen-v2'));
// Neue Aufgabenanzahl darf nicht unbemerkt von einer alten Sitzung überschrieben werden.
memory.clear();b=boot();
b.run("$('amount').value='1';start('dino');$('ans').value=String(q.r);check()");b.tick();
b.run("$('nextAmount').value='15';startNextStage();home();$('amount').value='10';applySettings();start('dino')");
assert.equal(b.run('stage'),1);assert.equal(b.run('total'),10);assert.equal(b.run('tasks.length'),10);
b.run("$('ans').value=String(q.r);check()");b.tick();
b.run("home();$('amount').value='6';start('dino')");
assert.equal(b.run('pendingTheme'),'dino');assert.equal(b.run('currentScreen'),'start');
assert.equal(b.run('journeys.dino.session.score'),1);
b.run('resolveAmountChange(false)');assert.equal(b.run('total'),10);assert.equal(b.run('score'),1);
b.run("home();start('dino');resolveAmountChange(true)");
assert.equal(b.run('total'),6);assert.equal(b.run('score'),0);assert.equal(b.run('stage'),1);assert.equal(b.run('journeys.dino.nextStage'),1);
b=boot();b.run("start('dino')");assert.equal(b.run('total'),6);assert.equal(b.run('stage'),1);
const preserved=b.run('JSON.stringify(journeys.dino)');
b.run("home();$('amount').value='0';start('dino')");assert.equal(b.run('JSON.stringify(journeys.dino)'),preserved);
// Bereits eine eingegebene Antwort erfordert die ausdrückliche Wahl statt Löschen.
b.run("$('amount').value='6';start('dino');enterKey('4');home();$('amount').value='8';start('dino')");
assert.equal(b.run('pendingTheme'),'dino');assert.equal(b.run('journeys.dino.session.answer'),'4');
// Übernehmen auf der Abschlussseite muss auch die nächste Etappe aktualisieren.
b.run("home();$('amount').value='1';start('space');$('ans').value=String(q.r);check()");b.tick();
b.run("openSettings();$('amount').value='3';saveSettingsDialog();startNextStage()");
assert.equal(b.run('total'),3);assert.equal(b.run('stage'),1);assert.equal(b.run('settingsOpen'),false);
// Die ersten drei Bauprojekte behalten ihren bisherigen Blockaufbau.
const c=vm.createContext({});for(const name of ['etappen.js','belohnungen.js']) vm.runInContext(fs.readFileSync(name,'utf8'),c);
for(let level=0;level<3;level++) {const parts=vm.runInContext(`stageBuildParts(${level}).length`,c);assert(parts>=50);for(let total=1;total<=50;total++){let before=0;for(let n=1;n<=total;n++){const after=Math.floor(n/total*parts);assert(after>before);before=after;}assert.equal(before,parts);}}
const crypto=require('node:crypto');
const originalBuilds=['9f6b91785ab18d47758bc1cbca299bffcd0faf4db4dd464380c956571e647afd','7f49fa021c48525da05dc03c455180f279ec46db269046f965d358ab73ebec52','4e00ed1479de28ea4cd8f612919b0b5481f808e39c027ce993e57b9139da4f97'];
originalBuilds.forEach((hash,n)=>assert.equal(crypto.createHash('sha256').update(vm.runInContext(`JSON.stringify(stageBuildParts(${n}))`,c)).digest('hex'),hash));
const portalMarkup=vm.runInContext('endPortalScene()',c),dragonMarkup=vm.runInContext('endDragonScene()',c);
assert.equal((portalMarkup.match(/class="end-frame-block"/g)||[]).length,12);
assert.equal((portalMarkup.match(/data-eye="/g)||[]).length,12);
for(let amount=1;amount<=50;amount++) {
  let lastEyes=0,lastHealth=100;
  for(let correct=0;correct<=amount;correct++) {
    const state=vm.runInContext(`endProgress(${correct},${amount})`,c);
    assert(state.eyes>=lastEyes&&state.eyes<=12);assert(state.health<=lastHealth&&state.health>=0);
    assert.equal(state.complete,correct===amount);
    assert(Math.abs(state.eyes-correct/amount*12)<1.00000001);
    if(correct===0){assert.equal(state.eyes,0);assert.equal(state.health,100);}
    if(correct===amount){assert.equal(state.eyes,12);assert.equal(state.health,0);}
    else assert(state.eyes<12&&state.health>0);
    lastEyes=state.eyes;lastHealth=state.health;
  }
  // Aufgabenanzahl darf keine geometrischen Werte verändern.
  vm.runInContext(`var total=${amount};var score=0;`,c);
  assert.equal(vm.runInContext('endPortalScene()',c),portalMarkup);assert.equal(vm.runInContext('endDragonScene()',c),dragonMarkup);
}
// Unabhängige mathematische Eigenschaften für alle Typen, Bereiche und Rechenarten.
for(const taskType of ['tens','ones','split']) for(const range of [20,100,1000]) for(const operation of ['plus','minus','mixed']) {
  const tasks=b.run(`createTasks({taskType:'${taskType}',range:${range},operation:'${operation}',amount:50})`);
  const used=new Set();
  for(const t of tasks) {
    assert.equal(t.type,taskType);assert(t.a>=1&&t.b>=1&&t.r>=0&&t.r<=range);
    if(taskType==='tens') assert.equal(t.a%10,0);
    if(taskType==='ones'){assert(t.a>=10&&t.a<=99&&t.b<=9);assert.equal(Math.floor(t.a/10),Math.floor(t.r/10));}
    if(taskType==='split') {
      assert(t.b>=10&&t.b<=99);assert(t.steps.length>=1&&t.steps.length<=3);
      let current=t.a,sum=0;
      t.steps.forEach(s=>{assert.equal(s.a,current);assert(s.b>0);assert.equal(s.op,t.op);current=t.op==='+'?current+s.b:current-s.b;assert.equal(s.r,current);assert(current>=0&&current<=range);sum+=s.b;});
      assert.equal(sum,t.b);assert.equal(current,t.r);
    }
    // Bis 100 und 1000 gibt es für jeden Typ mehr als 50 mögliche Rechnungen.
    if(range>=100){const key=`${t.a}${t.op}${t.b}`;assert(!used.has(key));used.add(key);}
  }
}
function steps(a,b,op){return JSON.parse(bRun(`decomposition(${a},${b},'${op}')`));}
function bRun(code){return b.run(`JSON.stringify(${code})`);}
assert.deepEqual(steps(35,58,'+').map(s=>[s.a,s.b,s.r]),[[35,50,85],[85,5,90],[90,3,93]]);
assert.deepEqual(steps(93,58,'−').map(s=>[s.a,s.b,s.r]),[[93,50,43],[43,3,40],[40,5,35]]);
for(const [a,other,op,count] of [[35,20,'+',1],[23,14,'+',2],[25,15,'+',2],[30,18,'+',2],[35,35,'−',2],[90,18,'−',2],[1000,99,'−',2],[993,98,'−',3]]) assert.equal(steps(a,other,op).length,count);
// Jede Themenwelt mit jedem Aufgabentyp, inklusive falscher Antworten und Wiederaufnahme.
for(const world of ['dino','space','mine']) for(const type of ['tens','ones','split']) {
  memory.clear();b=boot();
  b.run(`$('taskType').value='${type}';$('amount').value='2';start('${world}')`);
  if(type==='split') b.run("tasks=[makeTask(35,58,'+','split'),makeTask(93,58,'−','split')];tasks.forEach(t=>t.story='Eine Testgeschichte.');renderTask('');save()");
  while(b.run('currentScreen')==='game') {
    const oldScore=b.run('score'),oldStep=b.run('stepIndex'),oldIndex=b.run('i'),oldMoves=b.run('rewardMoves');
    const more=b.run("taskType==='split' && stepIndex<q.steps.length-1");
    b.run("$('ans').value='9999';check()");
    assert.equal(b.run('score'),oldScore);assert.equal(b.run('stepIndex'),oldStep);assert.equal(b.run('i'),oldIndex);assert.equal(b.run("$('ans').value"),'');assert.equal(b.timers.size,0);
    b.run("$('ans').value=String(taskType==='split'?q.steps[stepIndex].r:q.r);check();check()");
    assert.equal(b.run('score'),oldScore+(more?0:1));assert.equal(b.run('rewardMoves'),oldMoves+(more?0:1));
    assert.equal(b.run('validJourney(journeys[theme],theme)'),true);
    if(more) {
      // Auch die Wartephase nach einem richtigen Teilschritt muss speicherbar sein.
      b=boot();b.run(`start('${world}')`);assert.equal(b.run('stepWaiting'),true);assert.equal(b.run('stepIndex'),oldStep);
      b.run('openSettings()');b.tick();assert.equal(b.run('stepIndex'),oldStep);b.run('closeSettings()');
    }
    b.tick();
  }
  assert.equal(b.run('score'),2);assert.equal(b.run(`journeys.${world}.nextStage`),1);
}
// Ein Wechsel des Typs bei gleicher Aufgabenanzahl darf eine laufende Runde nicht verschlucken.
memory.clear();b=boot();b.run("$('amount').value='3';start('dino');enterKey('4');home();$('taskType').value='split';start('dino')");
assert.equal(b.run('pendingTheme'),'dino');b.run('resolveAmountChange(false)');assert.equal(b.run('taskType'),'tens');
b.run("home();start('dino');resolveAmountChange(true)");assert.equal(b.run('taskType'),'split');assert.equal(b.run('total'),3);
// Tatsächliches altes Speicherformat ohne Typ/Schritte: Reise und Eingabe bewahren.
memory.clear();memory.set('mathe-abenteuer-reisen-v2',JSON.stringify({version:2,journeys:{dino:{nextStage:2,session:{version:1,theme:'dino',stage:2,i:0,score:0,total:1,range:100,tasks:[{a:23,b:4,op:'+',r:27,story:'Du hast 23 Eier. 4 kommen dazu.'}],locked:false,answer:'7',completed:false}},space:{nextStage:0,session:null},mine:{nextStage:0,session:null}}}));
b=boot();b.run("start('dino');resolveAmountChange(false)");assert.equal(b.run('stage'),2);assert.equal(b.run('taskType'),'legacy');assert.equal(b.run("$('ans').value"),'7');
b.run("$('ans').value='27';check()");b.tick();assert.equal(b.run('journeys.dino.nextStage'),3);
console.log('OK: 27 Mathematik-Konfigurationen mit je 50 Aufgaben, variable Zerlegung, 9 Themen-/Typ-Kombinationen, Teilfortschritt, Neuladen, Pause, Fehler, Belohnungen sowie bisherige Reise- und Speichertests.');

