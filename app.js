// Ein gemeinsamer lokaler Spielstand pro iPad/Browser; jede Welt hat ihre eigene Reise.
const $ = id => document.getElementById(id);
const SAVE_KEY = 'mathe-abenteuer-reisen-v2';
const SETTINGS_KEY = 'mathe-abenteuer-settings-v1';
const LEGACY_KEY = 'mathe-abenteuer-session-v1';
let theme = '', stage = 0, i = 0, score = 0, total = 10, range = 100, q = null, locked = false;
let statisticsRoundId=null;
// Optionales Modul: Auch bei Lade-/Speicherfehlern bleibt das Rechnen möglich.
function statistics(method,...args) {if(typeof statEvent==='function') return statEvent(method,...args);return null;}
function syncStatistics() {
  if(currentScreen==='game' && !settingsOpen && !document.hidden) statistics('show',i,q,!locked&&!stepWaiting);
  else statistics('pause',document.hidden);
}
let tasks = [], advanceTimer = null, currentScreen = 'start', pendingTheme = null;
let settingsOpen = false, pausedAnimations = [];
let taskType='tens', roundOperation='mixed', stepIndex=0, stepWaiting=false;
let settings = { range: 100, amount: 10, operation: 'mixed', taskType:'tens' };
let journeys = { dino: { nextStage: 0, session: null }, space: { nextStage: 0, session: null }, mine: { nextStage: 0, session: null } };
function rnd(a,b) { return Math.floor(Math.random()*(b-a+1))+a; }
function cancelAdvance() { if(advanceTimer!==null) clearTimeout(advanceTimer); advanceTimer=null; }
function screen(id) {
  currentScreen=id;
  ['start','game','finish','stats'].forEach(name=>$(name).classList.toggle('hidden',name!==id));
  $('statsButton').classList.toggle('hidden',id!=='start');
}
function storage(action,key,value) {
  try {
    if(action==='get') return JSON.parse(localStorage.getItem(key));
    if(action==='set') localStorage.setItem(key,JSON.stringify(value));
    if(action==='remove') localStorage.removeItem(key);
  } catch(_) { $('storageNotice').textContent='Speichern ist gerade nicht möglich. Bitte lasse diese Seite geöffnet, damit der Fortschritt erhalten bleibt.'; }
  return null;
}
function validSettings(s) {
  return s && [20,100,1000].includes(s.range) && Number.isInteger(s.amount) && s.amount>=1 && s.amount<=50 && ['mixed','plus','minus'].includes(s.operation) && Object.hasOwn(TASK_TYPES,s.taskType);
}
function persistJourneys() { storage('set',SAVE_KEY,{version:2,journeys}); }
function showSettings() {
  $('range').value=settings.range; $('amount').value=settings.amount; $('operation').value=settings.operation;
  $('taskType').value=settings.taskType;showTaskTypeHelp();
  $('settingsSummary').textContent=`${TASK_TYPES[settings.taskType]} · bis ${settings.range} · ${settings.amount} Aufgaben pro Etappe · ${{mixed:'Addition und Subtraktion',plus:'Addition',minus:'Subtraktion'}[settings.operation]}`;
}
function showTaskTypeHelp() {
  $('taskTypeHelp').textContent={tens:'Die erste Zahl ist ein voller Zehner. Beispiel: 30 + 15 oder 40 − 7.',ones:'Eine zweistellige Zahl und 1 bis 9. Ohne Zehnerübergang, auch beim Abziehen. Beispiel: 23 + 5 oder 48 − 6. Auch bei „bis 1000“ bleiben die Ausgangszahlen zweistellig.',split:'Rechne in kleinen Schritten: zuerst die Zehner, dann die Einer. Bei Bedarf führt ein zusätzlicher Schritt zum nächsten oder unteren Zehner. Eine vollständige Rechnung zählt als eine Aufgabe.'}[$('taskType').value];
}
function applySettings() {
  const candidate={range:+$('range').value,amount:+$('amount').value,operation:$('operation').value,taskType:$('taskType').value};
  if(!validSettings(candidate)) { $('amount').reportValidity(); return false; }
  settings=candidate; storage('set',SETTINGS_KEY,settings); showSettings();
  pendingTheme=null;$('amountConflict').classList.add('hidden');return true;
}
function openSettings() {
  if(settingsOpen) return;
  showSettings();
  if(currentScreen==='finish') $('amount').value=$('nextAmount').value;
  if(theme) $('resetTheme').value=theme;
  statistics('pause');settingsOpen=true;cancelAdvance();
  pausedAnimations=document.getAnimations().filter(animation=>animation.playState==='running');
  pausedAnimations.forEach(animation=>animation.pause());
  $('teacher').showModal();
}
function closeSettings(continueGame=true) {
  if(!settingsOpen) return;
  settingsOpen=false;$('teacher').close();showSettings();
  pausedAnimations.forEach(animation=>animation.play());pausedAnimations=[];
  $('settingsGear').focus();
  if(continueGame && currentScreen==='game' && (locked||stepWaiting)) scheduleAdvance();
  if(continueGame) syncStatistics();
}
function saveSettingsDialog() {
  if(!applySettings()) return;
  if(currentScreen==='finish') $('nextAmount').value=settings.amount;
  closeSettings();
}
function save(completed=false) {
  journeys[theme].session={version:1,statisticsRoundId,theme,stage,i,score,total,range,tasks,locked,taskType,operation:roundOperation,stepIndex,stepWaiting,answer:$('ans').value,completed};
  persistJourneys();
}
function validJourney(j,t) {
  if(!j || !Number.isInteger(j.nextStage) || j.nextStage<0 || j.nextStage>=JOURNEYS[t].length) return false;
  const s=j.session;
  if(s===null) return true;
  return validSave(s) && s.theme===t && Number.isInteger(s.stage) && s.stage>=0 && s.stage<JOURNEYS[t].length && typeof s.completed==='boolean' && (s.completed ? s.score===s.total && s.locked && j.nextStage===(s.stage+1)%JOURNEYS[t].length : j.nextStage===s.stage);
}
function start(t) {
  cancelAdvance();
  if(!applySettings()) return;
  const existing=journeys[t].session;
  if(existing && !existing.completed) {
    if(existing.total===settings.amount && existing.range===settings.range && existing.taskType===settings.taskType && existing.operation===settings.operation) { resume(t); return; }
    if(existing.score>0 || existing.i>0 || existing.answer!=='' || existing.stepIndex>0 || existing.stepWaiting) {
      home();pendingTheme=t;
      $('amountConflictText').textContent=`${WORLD_NAMES[t]}: Gespeichert sind ${existing.total} Aufgaben (${TASK_TYPES[existing.taskType]||'bisherige Aufgaben'}, bis ${existing.range}); ${existing.score} sind gelöst. Neu: ${settings.amount} Aufgaben, ${TASK_TYPES[settings.taskType]}, bis ${settings.range}, ${{plus:'Addition',minus:'Subtraktion',mixed:'gemischt'}[settings.operation]}. Beim Neustart beginnt nur diese Etappe bei 0. Erreichte Reiseziele bleiben erhalten.`;
      $('restartWithAmount').textContent='Mit neuen Einstellungen starten';
      $('continueWithAmount').textContent='Gespeicherte Aufgaben fortsetzen';
      $('amountConflict').classList.remove('hidden');
      $('restartWithAmount').focus();
      return;
    }
    // Noch keine Eingabe oder Lösung: Die neue Anzahl direkt übernehmen.
  }
  beginStage(t);
}
function beginStage(t) {
  theme=t; stage=journeys[t].nextStage; i=0; score=0; locked=false;
  taskType=settings.taskType;roundOperation=settings.operation;stepIndex=0;stepWaiting=false;
  total=settings.amount; range=settings.range;
  tasks=createTasks(settings);
  tasks.forEach(task=>{q=task;task.story=text();});
  statisticsRoundId=statistics('begin',{theme,range,type:taskType,total,operation:roundOperation,stage});
  prepareReward(); renderTask(''); save();
}
function resolveAmountChange(restart) {
  if(!pendingTheme) return;
  const t=pendingTheme;
  pendingTheme=null;$('amountConflict').classList.add('hidden');
  if(restart) beginStage(t); else resume(t);
}
function renderTask(answer,animate=false) {
  q=tasks[i]; screen('game');
  $('tot').textContent=total; $('n').textContent=i+1; $('score').textContent=score;
  $('world').textContent=`${WORLD_NAMES[theme]} · Etappe ${stage+1}/${JOURNEYS[theme].length}`;
  $('stageName').textContent=stageTitle();
  const parsed=new DOMParser().parseFromString(q.story,'text/html');
  $('story').textContent=parsed.body.textContent;
  const split=taskType==='split', current=split?q.steps[stepIndex]:q;
  $('game').classList.toggle('strategy-mode',split);
  $('taskTypeLabel').textContent=TASK_TYPES[taskType]||'Bisherige Aufgaben';
  $('strategy').classList.toggle('hidden',!split);
  $('story').classList.toggle('hidden',split&&stepIndex>0);
  $('originEq').textContent=split?`Deine Aufgabe: ${q.a} ${q.op} ${q.b} = ?`:'';
  $('originEq').classList.toggle('hidden',locked);
  $('splitPlan').textContent=split?`${q.b} = ${Math.floor(q.b/10)*10}${q.b%10?' + '+q.b%10:''}${q.steps.length===3?'\n'+(q.b%10)+' = '+q.steps[1].b+' + '+q.steps[2].b:''}`:'';
  $('solvedSteps').textContent=split?q.steps.slice(0,locked?q.steps.length:stepIndex).map(s=>`✓ ${s.a} ${s.op} ${s.b} = ${s.r}`).join('\n'):'';
  $('stepLabel').textContent=split?(locked?'Die ganze Aufgabe ist gelöst!':`Schritt ${stepIndex+1} von ${q.steps.length} · ${current.label}`):'';
  $('eq').textContent=split&&locked?`${q.a} ${q.op} ${q.b} = ${q.r}`:`${current.a} ${current.op} ${current.b} = ?`;
  const busy=locked||stepWaiting;
  $('ans').value=answer; $('ans').disabled=busy; $('checkButton').disabled=busy;
  document.querySelectorAll('#keypad button').forEach(button=>button.disabled=busy);
  $('fb').textContent=locked?'✓ Richtig! Schau, wie dein Abenteuer weitergeht.':stepWaiting?'✓ Dieser Schritt stimmt! Gleich geht es weiter.':'';
  $('bar').style.width=`${score/total*100}%`; reward(animate);
  syncStatistics();
}
function scheduleAdvance() {
  cancelAdvance();
  // Belohnungen: regulär bis 1450 ms, Finale bis 2000 ms; danach Betrachtungszeit.
  advanceTimer=setTimeout(()=>{advanceTimer=null;if(currentScreen==='game' && (locked||stepWaiting)) next();},stepWaiting?1100:score===total?2400:1900);
}
function check() {
  if(locked || stepWaiting || currentScreen!=='game' || settingsOpen) return;
  const value=$('ans').value;
  if(!/^\d{1,4}$/.test(value)) { $('fb').textContent='Gib zuerst eine Zahl ein.'; return; }
  const expected=taskType==='split'?q.steps[stepIndex].r:q.r;
  statistics('answer',Number(value)===expected,Number(value)===expected && !(taskType==='split'&&stepIndex<q.steps.length-1));
  if(Number(value)===expected) {
    const moreSteps=taskType==='split'&&stepIndex<q.steps.length-1;
    if(moreSteps) stepWaiting=true;
    else {score++;locked=true;}
    renderTask(value,!moreSteps);save();scheduleAdvance();
  }
  else { $('ans').value='';$('fb').textContent='Das stimmt noch nicht. Versuche es nochmals.';save();$('ans').focus(); }
}
function next() {
  if(!(locked||stepWaiting) || currentScreen!=='game' || settingsOpen) return;
  cancelAdvance();
  if(stepWaiting) {stepIndex++;stepWaiting=false;renderTask('');save();return;}
  if(i+1>=total) {
    // Fortschritt und Abschluss gemeinsam speichern: Neuladen schaltet nichts doppelt frei.
    journeys[theme].nextStage=(stage+1)%JOURNEYS[theme].length;
    save(true); finish(); return;
  }
  i++;locked=false;stepIndex=0;stepWaiting=false;renderTask('');save();
}
function home() {
  statistics('pause',true);
  cancelAdvance();screen('start');
  pendingTheme=null;$('amountConflict').classList.add('hidden');
  const active=Object.keys(journeys).filter(t=>journeys[t].session&&!journeys[t].session.completed);
  $('resumePanel').classList.toggle('hidden',active.length===0);
  $('resumeText').textContent=active.length?'Wähle eine Themenwelt, um ihre angefangene Etappe fortzusetzen.':'';
  for(const t of Object.keys(journeys)) {
    const s=journeys[t].session;
    $(t+'Progress').textContent=s&&!s.completed?`${s.score}/${s.total} · ${JOURNEYS[t][s.stage]}`:`Nächste Etappe: ${JOURNEYS[t][journeys[t].nextStage]}`;
  }
}
function resume(t) {
  cancelAdvance();
  const s=journeys[t].session;
  if(!s) return;
  ({theme,stage,i,score,total,range,tasks,locked}=s);
  taskType=s.taskType||'legacy';roundOperation=s.operation||'mixed';stepIndex=s.stepIndex||0;stepWaiting=s.stepWaiting||false;
  statisticsRoundId=s.statisticsRoundId||null;statistics('resume',statisticsRoundId);
  prepareReward();renderTask(s.answer);
  if(s.completed) finish(); else if(locked||stepWaiting) scheduleAdvance();
}
function restartStage(t=$('resetTheme').value) {
  const j=journeys[t];
  if(!applySettings()) return;
  if(!confirm(`${WORLD_NAMES[t]}: Die aktuelle Etappe mit neuen Aufgaben beginnen? Die bisherigen Reiseziele bleiben erhalten.`)) return;
  closeSettings(false);
  cancelAdvance();
  // Nach einem Abschluss ist die nächste, noch nicht begonnene Etappe aktuell.
  j.session=null;persistJourneys();home();start(t);
}
function resetJourney(t=$('resetTheme').value) {
  if(!confirm(`${WORLD_NAMES[t]}: Die ganze Reise und die angefangene Etappe zurücksetzen?`)) return;
  closeSettings(false);
  cancelAdvance();journeys[t]={nextStage:0,session:null};persistJourneys();home();
}
function showNextStageSettings() {
  const nextStage=journeys[theme].nextStage;
  $('nextStageText').textContent=nextStage===0?'Alle Etappen geschafft! Die nächste Reise beginnt wieder am Anfang.':`Als Nächstes: ${JOURNEYS[theme][nextStage]}`;
  $('nextAmount').value=settings.amount;
  $('nextStageButton').textContent=nextStage===0?'Neue Reise starten →':'Nächste Etappe →';
}
function startNextStage() {
  const amount=Number($('nextAmount').value);
  if(!Number.isInteger(amount)||amount<1||amount>50) {$('nextAmount').reportValidity();return;}
  settings.amount=amount;showSettings();storage('set',SETTINGS_KEY,settings);start(theme);
}
function enterKey(key) {
  if(currentScreen!=='game'||locked||stepWaiting||settingsOpen) return;
  let value=$('ans').value;
  if(key==='erase') value=value.slice(0,-1);
  else if(key==='clear') value='';
  else if(/^\d$/.test(key) && value.length<4) value=(value==='0'?'':value)+key;
  $('ans').value=value;$('fb').textContent='';save();
}
const oldSettings=storage('get',SETTINGS_KEY);
const storedSettings=oldSettings?{...oldSettings,taskType:oldSettings.taskType||'tens'}:null;
if(validSettings(storedSettings)) settings=storedSettings;
const stored=storage('get',SAVE_KEY);
if(stored && stored.version===2 && stored.journeys) {
  for(const t of Object.keys(journeys)) if(validJourney(stored.journeys[t],t)) journeys[t]=stored.journeys[t];
} else if(!stored) {
  const legacy=storage('get',LEGACY_KEY);
  if(validSave(legacy)) { journeys[legacy.theme].session={...legacy,stage:0,completed:false};persistJourneys(); }
}
showSettings();home();
$('teacher').addEventListener('cancel',event=>{event.preventDefault();closeSettings();});
document.addEventListener('keydown',event=>{
  if(currentScreen!=='game'||settingsOpen||event.ctrlKey||event.metaKey||event.altKey) return;
  // Enter auf einer fokussierten Bildschirmtaste darf keine zweite Aktion auslösen.
  if(event.key==='Enter' && event.target?.tagName==='BUTTON') return;
  if(/^\d$/.test(event.key)) {event.preventDefault();enterKey(event.key);}
  else if(event.key==='Backspace') {event.preventDefault();enterKey('erase');}
  else if(event.key==='Delete') {event.preventDefault();enterKey('clear');}
  else if(event.key==='Enter') {event.preventDefault();check();}
});
// Sichtbarkeit statt unzuverlässigem unload: pausieren und aktiv fortsetzen.
document.addEventListener('visibilitychange',()=>{if(document.hidden) statistics('pause',true);else syncStatistics();});
if(typeof window!=='undefined') {
  window.addEventListener('pagehide',()=>statistics('pause',true));
  window.addEventListener('pageshow',()=>syncStatistics());
}
