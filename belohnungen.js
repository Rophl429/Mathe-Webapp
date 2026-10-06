// Eigene SVG-Zeichnungen. Die Szene bleibt bestehen; nur Fortschritt und Position ändern sich.
let rewardState = null;
const svg = content => `<svg viewBox="0 0 800 240" aria-hidden="true">${content}</svg>`;
const dinoDrawing = `<g class="dino-body"><path fill="#39876b" d="M-30 0 Q-62 1-72-26 L-38-14 Q-26-42 1-28 L12-55 Q20-68 42-61 Q57-56 52-39 L31-30 26-3 Q4 18-30 0"/><path fill="#83bd70" d="M-28-24l-8-17 17 6 2-17 15 14 11-18 4 20"/><ellipse fill="#a6d993" cx="-4" cy="-5" rx="20" ry="12"/><circle cx="39" cy="-51" r="4" fill="#fff"/><circle cx="40" cy="-51" r="2" fill="#213d36"/><path d="M38-38q8 3 12-3" fill="none" stroke="#213d36" stroke-width="2"/><path class="leg leg-one" d="M-20 0v20h15"/><path class="leg leg-two" d="M12 0v20h15"/></g>`;
const rocketDrawing = `<g class="flame"><path d="M-30-12Q-90 0-30 12" fill="#ff9148"/><path d="M-30-7Q-65 0-30 7" fill="#ffe79b"/></g><path fill="#ed735e" d="M-23-10l-12-23 31 17v32l-31 17 12-23"/><path fill="#eaf3f6" d="M-30-14Q10-28 42 0 10 28-30 14Z"/><path fill="#ed735e" d="M24-14Q35-8 42 0L24 14Z"/><circle r="10" fill="#63c5dc" stroke="#334b72" stroke-width="4"/>`;
// Mehr als 50 Bauteile: Bei jeder unterstützten Aufgabenanzahl wächst das Haus sichtbar.
function houseParts() {
  const parts = [];
  function block(x,y,color,detail='') {
    parts.push(`<g><path d="M${x} ${y}l10-7h24l-10 7Z" fill="${color}" style="filter:brightness(1.2)"/><path d="M${x+24} ${y}l10-7v22l-10 7Z" fill="${color}" style="filter:brightness(.72)"/><rect x="${x}" y="${y}" width="24" height="22" fill="${color}" stroke="#463a3426"/>${detail}</g>`);
  }
  for(let x=0;x<9;x++) block(280+x*24,199,'#899489');
  for(let row=0;row<4;row++) for(let col=0;col<9;col++) {
    const x=280+col*24,y=177-row*22;
    const door=col===4&&row<3, window=(col===1||col===2||col===6||col===7)&&row===2;
    block(x,y,door?'#674630':window?'#96d7e6':col>=7?'#a3774d':'#bf925e',window?`<path d="M${x+12} ${y}v22m-12-11h24" stroke="#faf1cf" stroke-width="3"/>`:door&&row===1?`<circle cx="${x+19}" cy="${y+12}" r="2" fill="#f5d17a"/>`:'');
  }
  for(let row=0;row<3;row++) for(let col=0;col<11-row*2;col++) block(256+row*24+col*24,89-row*20,'#98624b');
  for(let n=0;n<4;n++) block(378-n*5,219+n*3,'#b7ad95');
  parts.push('<g fill="#477753"><rect x="230" y="183" width="8" height="34" fill="#89633f"/><path d="M209 187v-24h47v24Zm6-24v-20h36v20Z"/></g>');
  parts.push('<g><path d="M550 215v-41" stroke="#735c42" stroke-width="5"/><rect x="542" y="169" width="16" height="19" fill="#ffe094" stroke="#735c42" stroke-width="3"/></g>');
  return parts;
}
function buildScene() {
  return svg(`<rect width="800" height="240" fill="#dfeff0"/><path d="M0 154h100v-24h100v36h115v-32h160v29h125v-41h120v26h80v92H0Z" fill="#bed4b2"/><path d="M0 209H800V240H0Z" fill="#8aab77"/><ellipse cx="403" cy="222" rx="180" ry="12" fill="#71915d"/>${houseParts().map((part,n)=>`<g class="house-piece" data-piece="${n}">${part}</g>`).join('')}`);
}
function resetReward() {
  // Abgebrochene Augenflüge/Angriffe dürfen nach einem Neustart nichts verändern.
  if(rewardState?.animations) for(const animation of rewardState.animations) animation.cancel();
  rewardState=null;
}
function endAnimation(state,element,frames,options) {
  const animation=element.animate(frames,{fill:'backwards',...options});
  state.animations.add(animation);
  animation.finished.then(()=>state.animations.delete(animation),()=>state.animations.delete(animation));
  return animation;
}
function activateEndPortal(state,celebrate) {
  if(rewardState!==state || state.portalActive) return;
  state.portalActive=true;
  const surface=state.host.querySelector('.end-portal-surface');
  surface.style.opacity='1';
  state.host.querySelector('.reward-scene').classList.add('portal-active');
  state.host.querySelector('.reward-caption').textContent='Alle 12 Augen eingesetzt – das Endportal ist aktiv!';
  if(celebrate && !reducedMotion()) {
    endAnimation(state,surface,[{opacity:0},{opacity:1}],{duration:450});
    endAnimation(state,state.host.querySelector('.end-portal-frame'),[{filter:'brightness(1)'},{filter:'brightness(1.6)',offset:.45},{filter:'brightness(1)'}],{duration:450});
  }
}
function renderEndPortal(state,previous,moving) {
  const old=endProgress(previous,total),now=endProgress(score,total),flights=[];
  state.host.querySelectorAll('.end-eye').forEach((eye,n)=>{
    eye.style.opacity=n<now.eyes?'1':'0';
    if(moving && !reducedMotion() && n>=old.eyes && n<now.eyes) flights.push(endAnimation(state,eye,[
      {transform:'translate(-32px,-100px)',opacity:0},
      {transform:'translate(-15px,-65px)',opacity:1,offset:.25},
      {transform:'translate(0,0)',opacity:1,offset:.84},
      {transform:'translate(0,-3px)',opacity:1,offset:.93},
      {transform:'translate(0,0)',opacity:1}
    ],{duration:600,delay:(n-old.eyes)*80,easing:'ease-in-out'}).finished);
  });
  state.host.querySelector('.reward-caption').textContent=state.portalActive?'Alle 12 Augen eingesetzt – das Endportal ist aktiv!':now.complete?'Das letzte Auge öffnet das Portal …':`${now.eyes} von 12 Augen eingesetzt. Jede gelöste Aufgabe bringt dich weiter.`;
  if(now.complete) {
    if(flights.length) {
      state.portalPending=true;
      Promise.all(flights).then(()=>{state.portalPending=false;activateEndPortal(state,true);}).catch(()=>{});
    } else if(!state.portalPending) activateEndPortal(state,false);
  }
}
function renderEndDragon(state,previous,moving) {
  const host=state.host,now=endProgress(score,total),old=endProgress(previous,total);
  const health=host.querySelector('.boss-health'),fill=host.querySelector('.boss-health-fill');
  health.setAttribute('aria-valuenow',String(now.health));
  host.querySelector('.boss-percent').textContent=`${Math.round(now.health)} %`;
  fill.style.width=`${now.health}%`;
  const dragon=host.querySelector('.end-boss-dragon'),victory=host.querySelector('.end-victory');
  dragon.style.opacity=now.complete?'0':'1';victory.style.opacity=now.complete?'1':'0';
  host.querySelector('.reward-caption').textContent=now.complete?'Geschafft! Du hast alle Aufgaben gelöst.':'Jede richtige Aufgabe löst einen Schwertangriff aus.';
  if(!moving || reducedMotion()) return;
  // Ein normaler Treffer dauert 1,45 s; das Finale endet nach 2 s (< 2,4 s Aufgabenpause).
  endAnimation(state,host.querySelector('.end-hero'),[
    {transform:'translate(0,0)'},{transform:'translate(125px,-23px)',offset:.3},
    {transform:'translate(125px,-8px)',offset:.52},{transform:'translate(0,0)'}
  ],{duration:1450,easing:'ease-in-out'});
  endAnimation(state,host.querySelector('.end-sword'),[
    {transform:'rotate(-35deg)'},{transform:'rotate(55deg)',offset:.6},{transform:'rotate(0deg)'}
  ],{duration:420,delay:330,easing:'ease-in-out'});
  endAnimation(state,host.querySelector('.end-boss-hit'),[
    {transform:'translate(0,0)',filter:'brightness(1)'},
    {transform:'translate(13px,-3px)',filter:'brightness(1.5)',offset:.35},
    {transform:'translate(0,0)',filter:'brightness(1)'}
  ],{duration:440,delay:450});
  endAnimation(state,fill,[{width:`${old.health}%`},{width:`${now.health}%`}],{duration:650,delay:450,easing:'ease-out'});
  host.querySelectorAll('.end-hit-spark').forEach((spark,n)=>endAnimation(state,spark,[
    {opacity:0,transform:'translate(0,0)'},{opacity:.9,offset:.2},
    {opacity:0,transform:`translate(${(n%3-1)*25}px,${-22-n*3}px)`}
  ],{duration:430,delay:470}));
  if(now.complete) {
    endAnimation(state,dragon,[{opacity:1},{opacity:0}],{duration:650,delay:1100,easing:'ease-in'});
    host.querySelectorAll('.end-farewell').forEach((particle,n)=>endAnimation(state,particle,[
      {opacity:0,transform:'translate(0,0)'},{opacity:.8,offset:.2},
      {opacity:0,transform:`translate(${(n%3-1)*20}px,-35px)`}
    ],{duration:800,delay:1100}));
    endAnimation(state,victory,[{opacity:0},{opacity:1}],{duration:200,delay:1800});
  }
}
function reward(animate = false) {
  const host = $('reward');
  if (!rewardState || rewardState.theme !== theme || rewardState.total !== total || rewardState.stage !== stage) {
    resetReward();
    host.innerHTML = `<div class="reward-heading"><span>${stageTitle()}</span><span class="reward-count"></span></div><div class="reward-scene ${theme} ${theme==='mine'&&stage>=3?'end-stage':''}">${theme==='mine'?stageBuildScene():theme==='dino'?dinoStageScene():spaceStageScene()}</div><div class="reward-caption" aria-live="polite"></div>`;
    rewardState = { theme, total, stage, score: score, host, animations:new Set(), portalActive:false };
    if(theme==='dino') host.querySelector('.stations').innerHTML = Array.from({length:total},(_,n)=>`<circle cx="${80+(n+1)/total*580}" cy="190" r="${total>25?3:6}" fill="#b59568"/>`).join('');
  }
  const previous = rewardState.score, progress = score/total;
  const moving = animate && score > previous;
  host.querySelector('.reward-count').textContent = `${score} / ${total}`;
  const scene = host.querySelector('.reward-scene');
  if(theme==='mine' && stage>=3) {
    if(stage===3) renderEndPortal(rewardState,previous,moving);
    else renderEndDragon(rewardState,previous,moving);
    scene.classList.toggle('complete',score===total);
    rewardState.score=score;
    return;
  } else if(theme==='mine') {
    const pieces = [...host.querySelectorAll('.house-piece')], count = Math.floor(progress*pieces.length);
    const oldCount = Math.floor(previous/total*pieces.length);
    pieces.forEach((piece,n)=>{
      piece.classList.toggle('placed',n<count);
      if(moving && n>=oldCount && n<count) piece.animate([
        {transform:'translateY(-180px)',opacity:0}, {transform:'translateY(-135px)',opacity:1,offset:.2},
        {transform:'translateY(0)',opacity:1,offset:.78}, {transform:'translateY(-7px)',offset:.88}, {transform:'translateY(0)',opacity:1}
      ], { duration: reducedMotion()?0:650, delay: reducedMotion()?0:(n-oldCount)*Math.min(65,450/Math.max(1,count-oldCount)), easing:'ease-in', fill:'backwards' });
    });
    if(moving && score===total && !reducedMotion()) {
      host.querySelectorAll('[data-celebrate="portal"]').forEach(part=>part.animate([
        {filter:'brightness(1)'},{filter:'brightness(1.8)',offset:.45},{filter:'brightness(1)'}
      ],{duration:800,delay:1100,easing:'ease-in-out'}));
      host.querySelectorAll('.dragon-wing').forEach(wing=>wing.animate([
        {transform:'scaleY(.7)'},{transform:'scaleY(1.12)',offset:.55},{transform:'scaleY(1)'}
      ],{duration:850,delay:1100,easing:'ease-in-out'}));
    }
  } else {
    const traveller=host.querySelector('.traveller');
    const x=80+progress*580,y=theme==='dino'?163:183;
    let movement;
    if(moving && !reducedMotion()) movement=traveller.animate([{transform:`translate(${80+previous/total*580}px, ${y}px)`},{transform:`translate(${x}px, ${y}px)`}],{duration:1000,easing:'ease-in-out'});
    traveller.style.transform=`translate(${x}px, ${y}px)`;
    if(moving && !reducedMotion()) {
      scene.classList.remove('moving'); void scene.offsetWidth; scene.classList.add('moving');
      movement.finished.then(()=>scene.classList.remove('moving')).catch(()=>{});
    }
    if(theme==='dino') host.querySelectorAll('.stations circle').forEach((station,n)=>station.setAttribute('fill',n<score?'#47876c':'#b59568'));
  }
  scene.classList.toggle('complete',score===total);
  let caption = theme==='dino'?'Jede richtige Antwort bringt dich dem Schatz näher.':theme==='space'?`Nächster Halt: ${stageTitle().split(' → ')[1]}.`:'Mit jeder richtigen Antwort wächst dein Bauprojekt.';
  if(score===total) caption=theme==='mine'?stageTitle()+' fertig!':stageTitle().split(' → ')[1]+' erreicht!';
  host.querySelector('.reward-caption').textContent=caption;
  rewardState.score=score;
}
function reducedMotion() { return window.matchMedia('(prefers-reduced-motion: reduce)').matches; }
function finish() {
  screen('finish');
  $('finIcon').textContent='';
  $('finIcon').appendChild($('reward')); // Originalszene behalten, auch eine laufende Animation.
  $('finTitle').textContent=theme==='mine'?(stage===4?'Geschafft! Der Enderdrache ist besiegt.':stage===3?'Das Endportal ist aktiviert!':stageTitle()+' fertig!'):stageTitle().split(' → ')[1]+' erreicht!';
  $('finText').textContent=total===1?'Du hast die Aufgabe dieser Etappe gelöst.':`Du hast alle ${total} Aufgaben dieser Etappe gelöst.`;
  showNextStageSettings();
}
function prepareReward() {
  $('game').insertBefore($('reward'),$('game').querySelector('.task'));
  resetReward();
}

