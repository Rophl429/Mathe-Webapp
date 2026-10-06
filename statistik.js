// Nur lokale Statistik. Keine Netzwerkanfragen, Geräteinformationen oder Konten.
// Pro Runde ein Speichereintrag: Beim Antworten wird nicht die ganze Historie geschrieben.
const localStats = (() => {
  const PREFIX='mathe-statistik-runde-v1:', DEVICE='mathe-statistik-geraet-v1';
  let rounds=[], active=null, task=null, since=null, frame=null, issue='', view='overview';
  let snapshot='', device='', typeRange='all';
  const el=id=>document.getElementById(id);
  const warn=()=>{issue='Statistik konnte nicht zuverlässig gespeichert oder gelesen werden. Bitte diese Ansicht sichern und die Browser-Speicherung prüfen. Das Rechnen funktioniert weiterhin.';};
  const random=length=>{
    const bytes=new Uint8Array(length);crypto.getRandomValues(bytes);
    const alphabet='ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
    return Array.from(bytes,b=>alphabet[b%32]).join('');
  };
  function write(round) {
    round.activeMs=round.tasks.reduce((s,t)=>s+t.ms,0);
    round.worked=round.tasks.filter(t=>t.submissions>0).length;
    round.tasks.forEach(t=>{
      t.attempts=t.wrong+(t.submissions>t.wrong?1:0);
      t.firstTry=t.solved&&t.wrong===0;
    });
    try {localStorage.setItem(PREFIX+round.id,JSON.stringify(round));} catch(_) {warn();}
  }
  function valid(r) {
    return r && /^[A-Z2-9]{24}$/.test(r.id) && ['dino','space','mine'].includes(r.theme)
      && [20,100,1000].includes(r.range) && ['tens','ones','split','legacy'].includes(r.type)
      && Number.isInteger(r.total) && r.total>0 && r.total<=50
      && ['running','interrupted','completed'].includes(r.status) && Array.isArray(r.tasks)
      && r.tasks.length<=r.total && new Set(r.tasks.map(t=>t?.index)).size===r.tasks.length && r.tasks.every(t=>t && Number.isInteger(t.index) && t.index>=0 && t.index<r.total
        && typeof t.equation==='string' && t.equation.length<80 && Number.isFinite(t.solution)
        && Number.isInteger(t.submissions) && t.submissions>=0 && Number.isInteger(t.wrong) && t.wrong>=0
        && t.wrong<=t.submissions && Number.isFinite(t.ms) && t.ms>=0 && typeof t.solved==='boolean');
  }
  try {
    device=localStorage.getItem(DEVICE);
    if(!/^[A-Z2-9]{6}$/.test(device||'')) {device=random(6);localStorage.setItem(DEVICE,device);}
    for(let n=0;n<localStorage.length;n++) {
      const key=localStorage.key(n);if(!key?.startsWith(PREFIX)) continue;
      try {
        const r=JSON.parse(localStorage.getItem(key));
        if(!valid(r)||key!==PREFIX+r.id) {warn();continue;}
        // Nach einem Neuladen ist noch keine Runde wieder aufgenommen worden.
        if(r.status==='running') {r.status='interrupted';write(r);}
        rounds.push(r);
      } catch(_) {warn();}
    }
  } catch(_) {warn();}
  if(!device) {try {device=random(6);} catch(_) {device='NICHT VERFÜGBAR';}}

  function flush() {
    if(since!==null && task && active) {
      task.ms+=Math.max(0,performance.now()-since);since=performance.now();
    }
    if(active) write(active);
  }
  function pause(interrupted=false) {
    if(frame!==null) cancelAnimationFrame(frame);frame=null;
    flush();since=null;
    if(interrupted && active && active.status!=='completed') {active.status='interrupted';write(active);}
  }
  function begin(meta) {
    pause(true);active=null;task=null;
    active={id:random(24),...meta,status:'running',tasks:[]};task=null;
    rounds.push(active);write(active);return active.id;
  }
  function resume(id) {
    pause(true);active=rounds.find(r=>r.id===id)||null;task=null;
    if(active && active.status!=='completed') {active.status='running';write(active);}
  }
  function show(index,q,editable) {
    pause();
    if(!active || active.status==='completed') return;
    task=active.tasks.find(t=>t.index===index);
    if(!task) {
      task={index,equation:`${q.a} ${q.op} ${q.b}`,solution:q.r,submissions:0,wrong:0,solved:false,ms:0};
      active.tasks.push(task);write(active);
    }
    if(editable && !task.solved && !document.hidden) {
      // Nach dem Zeichnen starten; keine Belohnungs-/Schrittwartezeiten mitzählen.
      frame=requestAnimationFrame(()=>{
        frame=requestAnimationFrame(()=>{
          frame=null;if(document.hidden || !active || !task || task.solved) return;
          active.status='running';since=performance.now();write(active);
        });
      });
    }
  }
  function answer(correct,complete) {
    if(!active || !task || task.solved || active.status==='completed') return;
    flush();task.submissions++;if(!correct) task.wrong++;
    if(complete) {
      task.solved=true;pause();
      if(active.tasks.filter(t=>t.solved).length===active.total) active.status='completed';
    }
    write(active);
  }
  function metrics(selected) {
    const all=selected.flatMap(r=>r.tasks).filter(t=>t.submissions>0);
    const solved=all.filter(t=>t.solved),first=solved.filter(t=>t.wrong===0);
    // Korrekte Pflichtschritte zusammen nur einmal; kein erfundener Erfolg bei Abbruch.
    const attempts=all.reduce((s,t)=>s+t.wrong+(t.submissions>t.wrong?1:0),0),ms=solved.reduce((s,t)=>s+t.ms,0);
    return {count:all.length,solved:solved.length,first:first.length,attempts,ms,
      unfinishedMs:all.filter(t=>!t.solved).reduce((s,t)=>s+t.ms,0),
      activeMs:selected.reduce((s,r)=>s+r.tasks.reduce((v,t)=>v+t.ms,0),0)};
  }
  const number=(n,d=0)=>n.toLocaleString('de-CH',{minimumFractionDigits:d,maximumFractionDigits:d});
  const ratio=(n,d)=>`${number(n)} von ${number(d)} (${d?number(n/d*100,1)+' %':'–'})`;
  const seconds=ms=>`${number(ms/1000,1)} s`;
  const metric=(label,value,detail='')=>`<div class="stat-metric"><span>${label}</span><strong>${value}</strong>${detail?`<small>${detail}</small>`:''}</div>`;
  function taskMetrics(m) {
    return metric('Bearbeitete Aufgaben',number(m.count))
      +metric('Beim ersten Versuch richtig',ratio(m.first,m.count))
      +metric('Letztlich gelöst',ratio(m.solved,m.count))
      +metric('Ø Versuche',m.count?number(m.attempts/m.count,2):'–',`Summe: ${number(m.attempts)} / ${number(m.count)} Aufgaben`)
      +metric('Ø Zeit gelöster Aufgaben',m.solved?seconds(m.ms/m.solved):'–',`Summe: ${seconds(m.ms)} / ${number(m.solved)} gelöst`);
  }
  function render() {
    el('statsTitle').textContent=`Statistik – Gerät ${device}`;
    el('statsStamp').textContent=`Nur dieser Browser · Stand ${snapshot}`;
    el('statsWarning').textContent=issue;
    document.querySelectorAll('[data-stat-view]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.statView===view)));
    const names={overview:'Gesamtübersicht',worlds:'Themenwelten',types:'Aufgabentypen',ranges:'Zahlenräume'};
    el('statsViewTitle').textContent=names[view]+(view==='types'?` – ${typeRange==='all'?'Alle Zahlenräume':'bis '+typeRange}`:'');
    el('statsRangeFilter').classList.toggle('hidden',view!=='types');
    document.querySelectorAll('[data-stat-range]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.statRange===typeRange)));
    const content=el('statsContent');content.className='stat-panels';
    if(view==='overview') {
      const done=rounds.filter(r=>r.status==='completed').length,stopped=rounds.filter(r=>r.status==='interrupted').length,m=metrics(rounds);
      content.innerHTML=`<div class="stat-overview">${metric('Gestartete Runden',number(rounds.length))}${metric('Abgeschlossen · Abschlussquote',ratio(done,rounds.length))}${metric('Unterbrochen',ratio(stopped,rounds.length))}${metric('Läuft',number(rounds.length-done-stopped))}${taskMetrics(m)}${metric('Aktive Zeit aller Runden',seconds(m.activeMs))}${metric('Zeit ungelöster bearbeiteter Aufgaben',seconds(m.unfinishedMs),'Separat, nicht im Durchschnitt gelöster Aufgaben')}</div>`;
    } else if(view==='worlds') {
      content.innerHTML=Object.entries({mine:'Minecraft',space:'Weltraum',dino:'Dinosaurier'}).map(([key,name])=>{
        const selected=rounds.filter(r=>r.theme===key),done=selected.filter(r=>r.status==='completed').length;
        return `<article class="stat-panel"><h3>${name}</h3><div class="stat-world-bar" aria-hidden="true"><i style="width:${rounds.length?selected.length/rounds.length*100:0}%"></i></div>${metric('Gewählt · gestartete Runden',ratio(selected.length,rounds.length))}${metric('Abgeschlossen · Abschlussquote',ratio(done,selected.length))}</article>`;
      }).join('');
    } else {
      const groups=view==='types'?{tens:'Zehner + Zahl',ones:'Einer ergänzen',split:'Zahlen zerlegen'}:{100:'Hunderterraum',1000:'Tausenderraum'};
      if(view==='ranges' && rounds.some(r=>r.range===20)) groups[20]='Zahlenraum bis 20';
      if(view==='types' && rounds.some(r=>r.type==='legacy')) groups.legacy='Bisherige Aufgaben';
      content.innerHTML=Object.entries(groups).map(([key,name])=>`<article class="stat-panel"><h3>${name}</h3>${taskMetrics(metrics(rounds.filter(r=>view==='types'?r.type===key&&(typeRange==='all'||r.range===Number(typeRange)):r.range===Number(key))))}</article>`).join('');
    }
  }
  function open() {
    pause(true);snapshot=new Date().toLocaleString('de-CH');view='overview';typeRange='all';
    screen('stats');document.body.classList.add('statistics-open');render();el('statsTitle').focus();
  }
  function tab(name) {if(['overview','worlds','types','ranges'].includes(name)) {view=name;render();}}
  function filterRange(value) {if(['all','20','100','1000'].includes(value)) {typeRange=value;render();}}
  function close() {document.body.classList.remove('statistics-open');home();el('statsButton').focus();}
  function reset() {
    if(!confirm('Möchtest du wirklich alle auf diesem Gerät gespeicherten Statistikdaten löschen? Diese Aktion kann nicht rückgängig gemacht werden. Spielstände und Geräte-ID bleiben erhalten.')) return;
    pause();
    try {
      const keys=[];for(let n=0;n<localStorage.length;n++) {const key=localStorage.key(n);if(key?.startsWith(PREFIX)) keys.push(key);}
      keys.forEach(k=>localStorage.removeItem(k));rounds=[];active=null;task=null;issue='';
    } catch(_) {warn();}
    snapshot=new Date().toLocaleString('de-CH');render();
  }
  // Regelmässige Sicherung begrenzt Zeitverlust bei einem abrupten Browserabbruch.
  setInterval(()=>{try {if(since!==null) flush();} catch(_) {warn();}},5000);
  return {begin,resume,show,answer,pause,flush,open,tab,filterRange,close,reset,metrics,fail:warn};
})();

// Fehler in der Erfassung dürfen die Mathematik und ihre Animationen nie blockieren.
function statEvent(method,...args) {
  try {return localStats[method](...args);} catch(_) {
    try {localStats.fail();} catch(_) {}
    const notice=document.getElementById('statsWarning');
    if(notice) notice.textContent='Statistikerfassung ist gestört. Das Rechnen bleibt möglich.';
    return null;
  }
}
