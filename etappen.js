// Jede Etappe umfasst einen vollständigen Durchgang mit frei gewählter Aufgabenanzahl.
const JOURNEYS = {
  dino: ['Start → Dschungel', 'Dschungel → Vulkan', 'Vulkan → Dino-Nest', 'Dino-Nest → grosser Schatz'],
  space: ['Erde → Mond', 'Mond → Mars', 'Mars → Jupiter', 'Jupiter → Raumstation'],
  mine: ['Haus', 'Netherportal', 'Nether-Festung', 'Endportal', 'Drache']
};
const WORLD_NAMES = { dino: 'Dinosaurier', space: 'Weltraum', mine: 'Minecraft' };
function stageTitle() { return JOURNEYS[theme][stage]; }
function fern(x,y,size=1) {
  return `<g transform="translate(${x} ${y}) scale(${size})" stroke="#347250" stroke-width="5" fill="none"><path d="M0 0v-48m0 20-20-15m20 7 18-20M0-9l-24-12M0-3l22-16"/></g>`;
}
function volcano(x,size=1) {
  return `<g transform="translate(${x} 155) scale(${size})"><path d="M-90 0-27-96H20L96 0Z" fill="#665753"/><path d="M-27-96H20L37-68 13-77 8-45-4-67-17-61Z" fill="#fda052"/><path d="M0-85 13-34 37 0" fill="none" stroke="#eb7541" stroke-width="9"/><path d="M-6-106q-25-24 4-39t-8-23" fill="none" stroke="#9b8c88" stroke-width="18" stroke-linecap="round" opacity=".45"/></g>`;
}
function dinoStageScene() {
  const palettes=[['#f7e9c8','#d7ebc2','#dec18a','#7eae75'],['#d7ebc2','#edd0b1','#7eae75','#87665a'],['#edd0b1','#e4efc8','#87665a','#91b97a'],['#e4efc8','#fff0c8','#91b97a','#dcb773']][stage];
  let decor='';
  if(stage===0||stage===1) {
    const xs=stage===0?[445,535,605,765]:[25,135,240,335];
    decor+=xs.map((x,n)=>fern(x,155,1+n*.16)).join('');
    decor+=`<g fill="#52855a"><ellipse cx="${stage===0?620:140}" cy="68" rx="57" ry="26"/><rect x="${stage===0?615:135}" y="83" width="10" height="65" fill="#917149"/></g>`;
  }
  if(stage===1||stage===2) {
    decor+=volcano(stage===1?650:110,.9);
    decor+=`<path d="${stage===1?'M550 240l15-34 63 10 22-38 78 13 55-32':'M0 224l58-20 40 15 32-40 45 17 38-33'}" fill="none" stroke="#ed9250" stroke-width="13"/><path d="${stage===1?'M620 234l54-17 45 13':'M12 190l38-15 25 12'}" fill="none" stroke="#ffd17b" stroke-width="5"/>`;
  }
  if(stage>=2) {
    const xs=stage===2?[450,530,620,765]:[40,145,245,345];
    decor+=xs.map((x,n)=>`<g transform="translate(${x} ${125+n%2*17}) scale(.38)">${dinoDrawing}</g>`).join('');
    const nestX=stage===2?655:190;
    decor+=`<g transform="translate(${nestX} 150)"><ellipse rx="40" ry="12" fill="#ab8555"/><path d="M-35 0q35 17 70 0" stroke="#d3b075" stroke-width="5" fill="none"/><g fill="#fff2cf" stroke="#ccb58c"><ellipse cx="-15" cy="-8" rx="8" ry="12"/><ellipse cy="-12" rx="8" ry="12"/><ellipse cx="15" cy="-8" rx="8" ry="12"/></g></g>`;
  }
  return svg(`<defs><linearGradient id="dino-sky"><stop stop-color="${palettes[0]}"/><stop offset="1" stop-color="${palettes[1]}"/></linearGradient><linearGradient id="dino-ground" gradientUnits="userSpaceOnUse" x1="0" x2="800"><stop stop-color="${palettes[2]}"/><stop offset="1" stop-color="${palettes[3]}"/></linearGradient></defs><rect width="800" height="240" fill="url(#dino-sky)"/><circle cx="400" cy="40" r="20" fill="#ffedaa"/><path d="M0 130Q140 60 270 132T540 125T800 125V240H0Z" fill="url(#dino-ground)" opacity=".5"/><path d="M0 170Q200 130 400 160T800 151V240H0Z" fill="url(#dino-ground)"/>${decor}<path d="M80 190H660" stroke="#b49a74" stroke-width="31" stroke-linecap="round"/><path d="M80 190H660" stroke="url(#dino-ground)" stroke-width="21" stroke-linecap="round"/><g class="stations"></g><g class="treasure" transform="translate(725 175) scale(${stage===3?1.25:.85})"><rect x="-25" y="-7" width="50" height="30" rx="5" fill="#a46536" stroke="#673e28" stroke-width="3"/><g class="lid"><path d="M-26-7v-10q26-25 52 0v10Z" fill="#c58b43" stroke="#673e28" stroke-width="3"/></g><path d="M-20-4v23m40-23v23" stroke="#efc55f" stroke-width="5"/><rect x="-5" y="-9" width="10" height="15" rx="2" fill="#ffe193"/><path class="treasure-spark" fill="#ffe9a3" d="M0-65l5 14 14 5-14 5-5 14-5-14-14-5 14-5Z"/></g><g class="traveller">${dinoDrawing}</g>`);
}
function planetDrawing(index,x) {
  const name=['Erde','Mond','Mars','Jupiter','Raumstation'][index];
  let drawing;
  if(index===4) drawing='<path d="M-48-20h28v48h-28Zm68 0h28v48H20Z" fill="#518cb5" stroke="#b4dbe9" stroke-width="3"/><path d="M-20 0H20" stroke="#b8cdd9" stroke-width="8"/><rect x="-14" y="-36" width="28" height="76" rx="9" fill="#e3ebed"/><circle r="8" fill="#65cbd5"/>';
  else {
    const color=['#63a9d5','#c7cbd3','#cd8165','#d8b189'][index];
    drawing=`<circle r="37" fill="${color}"/>`;
    if(index===0) drawing+='<path d="M-25-21l20-10 12 13-8 18-20 2-7-12M12 8l20-3-7 19-14 7-5-12" fill="#a4cb83"/>';
    if(index===1||index===2) drawing+='<g fill="#000" opacity=".13"><circle cx="-14" cy="-10" r="10"/><circle cx="14" cy="14" r="7"/><circle cx="14" cy="-17" r="4"/></g>';
    if(index===3) drawing+='<path d="M-29-20q29 10 58 0M-36-3q36 12 72 0M-29 20q29-10 58 0" fill="none" stroke="#ae795c" stroke-width="9"/><ellipse cx="14" cy="13" rx="10" ry="6" fill="#bb6c50"/>';
  }
  return `<g transform="translate(${x} 80)">${drawing}<text y="62" text-anchor="middle" fill="#e4edf8" font-size="16">${name}</text></g>`;
}
function spaceStageScene() {
  return svg(`<rect width="800" height="240" fill="#172841"/>${Array.from({length:40},(_,n)=>`<circle cx="${(n*137+29)%800}" cy="${(n*71+17)%230}" r="${n%3===0?2:1}" fill="#b9d5ea"/>`).join('')}<path d="M80 183H660" stroke="#8297bf" stroke-dasharray="5 10" fill="none"/>${planetDrawing(stage,85)}${planetDrawing(stage+1,695)}<g class="traveller">${rocketDrawing}</g>`);
}
// Selbst gezeichnete Blockbauten. Die Reihenfolge der Teile bestimmt den Bauablauf.
function stageBuildParts(level) {
  if(level===0) return houseParts();
  const parts=[];
  function block(x,y,w,h,color,detail='',depth=7) {
    parts.push(`<g><path d="M${x} ${y}l${depth}-${depth}h${w}l-${depth} ${depth}Z" fill="${color}" style="filter:brightness(1.32)"/><path d="M${x+w} ${y}l${depth}-${depth}v${h}l-${depth} ${depth}Z" fill="${color}" style="filter:brightness(.62)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="#15122455"/><path d="M${x+3} ${y+3}h${w-6}" stroke="#ffffff16"/>${detail}</g>`);
  }
  if(level===1) {
    // Sockel, Säulen, Schlusssteine, dann die magische Portalfläche.
    for(let row=0;row<2;row++) for(let col=0;col<12;col++) block(273+col*21,211-row*14,21,14,['#625276','#514662'][col%2]);
    for(let row=0;row<8;row++) for(const col of [0,1,8,9]) {
      const x=294+col*21,y=181-row*19;
      block(x,y,21,19,(row+col)%3===0?'#635078':'#403850',`<path d="M${x+5} ${y+5}l7 4-3 7" fill="none" stroke="#a789c6" stroke-width="1.3"/>`);
    }
    for(let col=0;col<10;col++) block(294+col*21,29,21,19,col%2?'#514060':'#6b5181');
    for(let row=6;row>=0;row--) for(let col=0;col<6;col++) {
      const x=336+col*21,y=48+row*21;
      parts.push(`<g data-celebrate="portal"><rect x="${x}" y="${y}" width="21.5" height="21.5" fill="url(#portal-magic)"/>${(row+col)%3===0?`<path d="M${x+3} ${y+15}q10-14 17-3" stroke="#eac9ff" stroke-width="2" fill="none" opacity=".65"/>`:''}</g>`);
    }
    parts.push('<g fill="#f0d7ff"><path d="M317 76l4 6-4 6-4-6Zm169 78 4 6-4 6-4-6Z"/><path d="M349 20h84" stroke="#c39cdd" stroke-width="3"/></g>');
  } else if(level===2) {
    // Massive Pfeiler und Brücke über Lava, dann Tor, Mauern und Türme.
    for(let row=0;row<3;row++) for(const col of [0,1,5,6,10,11,15,16]) block(237+col*19,214-row*13,19,13,'#70494d');
    for(let col=0;col<21;col++) block(207+col*19,174,19,15,'#a16c5c');
    for(let row=0;row<5;row++) for(let col=0;col<19;col++) {
      if(row<3&&col>=8&&col<=10) continue;
      block(225+col*19,155-row*16,19,16,(row+col)%3===0?'#965d59':'#78454d');
    }
    // Heller Torbogen, dessen Mitte offen bleibt.
    for(const [x,y] of [[365,154],[365,138],[370,122],[385,111],[403,111],[421,122],[426,138],[426,154]]) block(x,y,15,14,'#bb8270');
    for(const base of [220,514]) {
      for(let row=0;row<7;row++) for(let col=0;col<4;col++) block(base+col*17,148-row*16,17,16,(col+row)%2?'#804853':'#9d6062');
      for(let col=0;col<5;col++) block(base-7+col*17,36,17,col%2?9:21,'#bd8470');
      for(const x of [base+10,base+43]) parts.push(`<g><rect x="${x}" y="69" width="12" height="30" rx="5" fill="#422e3d"/><path d="M${x+4} 91V76" stroke="#ffd28b" stroke-width="4"/></g>`);
    }
    for(let col=0;col<12;col++) block(299+col*17,69,17,col%2?9:17,'#b27b6d');
    for(const x of [338,449]) parts.push(`<g><path d="M${x} 144v-16" stroke="#412e3a" stroke-width="4"/><path d="M${x-5} 127l5-13 5 13Z" fill="#ffcf83"/></g>`);
  }
  return parts;
}
function stageBuildScene() {
  if(stage===3) return endPortalScene();
  if(stage===4) return endDragonScene();
  if(stage===0) return buildScene();
  const lava=stage<3;
  const backdrop= lava ? `<rect width="800" height="240" fill="#332c3d"/><path d="M0 125 70 60 150 139 239 76 320 134 445 55 535 136 654 67 800 126V240H0Z" fill="#51404c"/><path d="M0 185Q170 150 310 196T800 174V240H0Z" fill="#704a4b"/><path d="M0 216Q180 189 380 224T800 207V240H0Z" fill="#d97849"/><path d="M0 229Q180 205 380 234T800 221" fill="none" stroke="#ffd081" stroke-width="6"/>` : `<rect width="800" height="240" fill="#202b43"/>${Array.from({length:30},(_,n)=>`<circle cx="${(n*137+35)%800}" cy="${(n*53+14)%190}" r="${n%5?1:2}" fill="#adc3dd"/>`).join('')}<circle cx="676" cy="43" r="20" fill="#d8d7ab"/><path d="M140 204 238 184 550 185 645 208 538 227 483 237 276 231Z" fill="#919583"/><path d="M140 204 276 231 360 239 230 232Z" fill="#606d71"/><path d="M645 208 483 237 440 240 550 232Z" fill="#475666"/>`;
  return svg(`<defs><linearGradient id="portal-magic" gradientUnits="userSpaceOnUse" x1="336" y1="48" x2="462" y2="195"><stop stop-color="#562d82"/><stop offset=".5" stop-color="#b579dc"/><stop offset="1" stop-color="#6c429b"/></linearGradient></defs>${backdrop}${stageBuildParts(stage).map((part,n)=>`<g class="house-piece" data-piece="${n}">${part}</g>`).join('')}`);
}

// Feste Weltkoordinaten: Geometrie und Grösse hängen niemals von total ab.
const END_EYE_SLOTS=12;
function endProgress(correct,amount) {
  const done=Math.max(0,Math.min(amount,correct));
  return {eyes:Math.floor(done*END_EYE_SLOTS/amount),health:(amount-done)*100/amount,complete:done===amount};
}
function endSky() {
  return `<rect width="800" height="280" fill="#20263d"/>${Array.from({length:26},(_,n)=>`<circle cx="${(n*131+27)%800}" cy="${(n*43+17)%170}" r="${n%5?1:1.8}" fill="#b5b4d5" opacity=".6"/>`).join('')}<path d="M110 215 275 188 590 194 739 222 580 251 281 249Z" fill="#8c9381"/><path d="M110 215 281 249 398 273 225 249Z" fill="#586673"/><path d="M739 222 580 251 398 273 609 263Z" fill="#465463"/>`;
}
function endPortalScene() {
  const project=(u,v)=>[400+(u-v)*47,42+(u+v)*17];
  const polygon=points=>points.map(p=>p.join(',')).join(' ');
  const slots=[];
  for(let n=1;n<=3;n++) slots.push([n,0]);
  for(let n=1;n<=3;n++) slots.push([4,n]);
  for(let n=3;n>=1;n--) slots.push([n,4]);
  for(let n=3;n>=1;n--) slots.push([0,n]);
  const aperture=[project(1,1),project(4,1),project(4,4),project(1,4)];
  const blocks=slots.map(([u,v],index)=>{
    const a=project(u,v),b=project(u+1,v),c=project(u+1,v+1),d=project(u,v+1),lower=p=>[p[0],p[1]+21];
    const [x,y]=project(u+.5,v+.5);
    return {depth:u+v,markup:`<g class="end-frame-block" data-slot="${index}"><polygon points="${polygon([d,c,lower(c),lower(d)])}" fill="#41685d" stroke="#293f3c"/><polygon points="${polygon([b,c,lower(c),lower(b)])}" fill="#304f49" stroke="#293f3c"/><polygon points="${polygon([a,b,c,d])}" fill="${index%2?'#8baf96':'#9ab49a'}" stroke="#d0d6a5" stroke-width="1.5"/><path d="M${d[0]+4} ${d[1]+10}l${c[0]-d[0]-8} ${c[1]-d[1]}" stroke="#82a68b" opacity=".5"/><ellipse cx="${x}" cy="${y}" rx="23" ry="8" fill="#263e3c" stroke="#c1cc99" stroke-width="3"/><ellipse cx="${x}" cy="${y+1}" rx="15" ry="4" fill="#142e30"/></g>`};
  }).sort((a,b)=>a.depth-b.depth).map(b=>b.markup).join('');
  const eyes=slots.map(([u,v],n)=>{const [x,y]=project(u+.5,v+.5);return `<g class="end-eye" data-eye="${n}" style="opacity:0"><g transform="translate(${x} ${y-4})"><path d="M-20 0-10-9 10-9 20 0 10 7-10 7Z" fill="#b8d6a0" stroke="#325d4c" stroke-width="2"/><ellipse rx="11" ry="7" fill="#62b69b"/><path d="M0-6l3 6-3 6-3-6Z" fill="#182d37"/><circle cx="-4" cy="-3" r="2" fill="#efffd5"/></g></g>`;}).join('');
  const stars=Array.from({length:14},(_,n)=>`<circle class="end-star" cx="${270+(n*43)%260}" cy="${85+(n*29)%95}" r="${n%3?1.5:2.3}" fill="${n%2?'#c3a0ed':'#ddd7ff'}" style="animation-delay:${-n*.43}s"/>`).join('');
  return svg(`${endSky()}<defs><clipPath id="end-aperture"><polygon points="${polygon(aperture)}"/></clipPath></defs><polygon points="${polygon(aperture)}" fill="#111923"/><g class="end-portal-surface" style="opacity:0" clip-path="url(#end-aperture)"><rect x="220" y="64" width="370" height="130" fill="#18152e"/><ellipse cx="400" cy="129" rx="99" ry="26" fill="#453164" opacity=".32"/>${stars}</g><g class="end-portal-frame">${blocks}</g>${eyes}`);
}
function voxelBox(x,y,w,h,color,depth=9) {
  return `<g><path d="M${x} ${y}l${depth}-${depth}h${w}l-${depth} ${depth}Z" fill="${color}" style="filter:brightness(1.4)"/><path d="M${x+w} ${y}l${depth}-${depth}v${h}l-${depth} ${depth}Z" fill="${color}" style="filter:brightness(.65)"/><rect x="${x}" y="${y}" width="${w}" height="${h}" fill="${color}" stroke="#171421"/></g>`;
}
function endDragonScene() {
  let dragon='';
  // Zwei hintere Beine, langer segmentierter Schwanz und hinterer Flügel.
  for(const x of [451,560]) dragon+=voxelBox(x,167,18,47,'#302b43')+voxelBox(x-9,211,30,11,'#3c334d');
  for(let n=0;n<12;n++) dragon+=voxelBox(573+n*14,174+Math.sin(n/11*Math.PI)*29,20-n*.8,18-n*.7,n%2?'#393148':'#463952',5);
  dragon+='<path d="M497 155 585 42 704 124 661 117 625 133 588 128 550 155Z" fill="#34283f" stroke="#776083" stroke-width="3"/><path d="M497 155 585 42 550 155M585 42 588 128M585 42 625 133M585 42 661 117" fill="none" stroke="#8b6b9c" stroke-width="2"/>';
  dragon+=voxelBox(407,140,165,48,'#373043',16);
  // Grosser Vorderflügel mit eckiger Kontur und violetten Flügelhäuten.
  dragon+='<path d="M439 159 389 34 276 56 303 87 335 89 350 118 389 120Z" fill="#60456f" stroke="#a580b6" stroke-width="3"/><path d="M439 159 389 34 335 89M389 34 350 118M389 34 389 120M389 34 303 87" fill="none" stroke="#9970ae" stroke-width="2"/>';
  for(let n=0;n<5;n++) dragon+=voxelBox(354+n*13,139-n*2,19,26,'#42344f',7);
  // Länglicher Kopf zur Spielerfigur gerichtet; violette Augen und zwei Hörner.
  dragon+=voxelBox(277,117,86,41,'#40334e',12)+voxelBox(255,142,72,25,'#4b3b5a',10);
  dragon+='<path d="M332 117l8-27 9 24m8-2 12-23 5 20" fill="#b4a6bd" stroke="#62536e" stroke-width="2"/><rect x="301" y="130" width="20" height="7" fill="#d299ff"/><rect x="302" y="131" width="6" height="5" fill="#f4ddff"/><path d="M321 126l19-5" stroke="#c393e6" stroke-width="4"/><rect x="263" y="150" width="5" height="4" fill="#221e30"/><path d="M260 161h44" stroke="#221e30" stroke-width="2"/>';
  for(const x of [416,529]) dragon+=voxelBox(x,182,23,41,'#493954',9)+voxelBox(x-13,222,37,11,'#52405f',7);
  for(let n=0;n<8;n++) dragon+=`<path d="M${401+n*21} 136l7-13 8 13Z" fill="#9f81b1"/>`;
  const hero=`<g transform="translate(113 232)"><g class="end-hero"><rect x="-13" y="-31" width="11" height="30" fill="#3c4d71"/><rect x="3" y="-31" width="11" height="30" fill="#465780"/><rect x="-16" y="-3" width="15" height="7" fill="#2c3043"/><rect x="3" y="-3" width="16" height="7" fill="#2c3043"/><path d="M-15-53h31v27h-31Z" fill="#559e9d"/><path d="M-15-53l5-5h31l-5 5Z" fill="#81bcad"/><rect x="-12" y="-76" width="27" height="24" fill="#d7ad83"/><path d="M-12-76h27v8H-5v5h-7Z" fill="#59433f"/><rect x="6" y="-65" width="4" height="4" fill="#313149"/><rect x="-22" y="-49" width="9" height="24" fill="#d7ad83"/><g transform="translate(17 -39)"><g class="end-sword"><path d="M-2 0l31-39 9-1 1 8L8 6Z" fill="#cfdfdf" stroke="#688c99" stroke-width="2"/><path d="M0 2l-8 12" stroke="#8c694e" stroke-width="6"/><path d="M-6-4l18 13" stroke="#71b6b5" stroke-width="5"/></g></g></g></g>`;
  const sparks=Array.from({length:8},(_,n)=>`<rect class="end-hit-spark" x="${265+n%3*14}" y="${135+Math.floor(n/3)*12}" width="5" height="5" fill="${n%2?'#c9aceb':'#f1dba1'}" style="opacity:0"/>`).join('');
  const farewell=Array.from({length:14},(_,n)=>`<rect class="end-farewell" x="${280+(n*31)%340}" y="${85+(n*29)%135}" width="${n%2?6:9}" height="${n%2?6:9}" fill="#ba96db" style="opacity:0"/>`).join('');
  return `<div class="boss-hud"><span>ENDERDRACHE</span><span class="boss-percent">100 %</span><div class="boss-health" role="progressbar" aria-label="Lebensenergie des Enderdrachen" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100"><div class="boss-health-fill"></div></div></div>`+svg(`${endSky()}<g class="end-boss-dragon"><g class="end-boss-hit">${dragon}</g></g>${hero}${sparks}${farewell}<text class="end-victory" x="430" y="132" text-anchor="middle" fill="#e6d9ff" font-size="34" font-weight="bold" style="opacity:0">Geschafft!</text>`);
}


