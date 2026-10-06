// Kontrollierte Animationen: Abschlussreihenfolge, Mehrfachaugen, doppelte Aufrufe und Reset.
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
function setup(stage,total,reduced=false) {
  const animations=[];
  class Element {
    constructor(name){this.name=name;this.style={};this.attributes={};const classes=new Set();this.classList={add:n=>classes.add(n),remove:n=>classes.delete(n),toggle:(n,on)=>on?classes.add(n):classes.delete(n),contains:n=>classes.has(n)};}
    setAttribute(k,v){this.attributes[k]=v;}
    animate(frames,options){
      let resolve,reject,settled=false;
      const animation={element:this,frames,options,playState:'running',finished:new Promise((a,b)=>{resolve=a;reject=b;}),
        finish(){if(!settled&&this.playState==='running'){settled=true;this.playState='finished';resolve();}},
        cancel(){if(!settled){settled=true;this.playState='idle';reject(new Error('cancelled'));}},
        pause(){this.playState='paused';},play(){if(!settled)this.playState='running';}};
      animations.push(animation);return animation;
    }
  }
  const host=new Element('host');let elements,eyes,hits,farewell;
  Object.defineProperty(host,'innerHTML',{set(value){
    elements=new Map();host.markup=value;
    eyes=Array.from({length:12},(_,n)=>new Element('eye'+n));hits=Array.from({length:8},()=>new Element('hit'));farewell=Array.from({length:14},()=>new Element('farewell'));
  }});
  host.querySelector=selector=>{if(!elements.has(selector))elements.set(selector,new Element(selector));return elements.get(selector);};
  host.querySelectorAll=selector=>selector==='.end-eye'?eyes:selector==='.end-hit-spark'?hits:selector==='.end-farewell'?farewell:[];
  const c=vm.createContext({theme:'mine',stage,total,score:0,$:()=>host,window:{matchMedia:()=>({matches:reduced})}});
  for(const name of ['etappen.js','belohnungen.js']) vm.runInContext(fs.readFileSync(name,'utf8'),c);
  const run=code=>vm.runInContext(code,c);
  async function settle(){for(let turn=0;turn<5;turn++){animations.filter(a=>a.playState==='running').forEach(a=>a.finish());await new Promise(resolve=>setImmediate(resolve));}}
  return {run,host,animations,settle};
}
async function main(){
  for(const total of [5,10,12,20]) for(const stage of [3,4]) {
    const b=setup(stage,total);b.run('reward()');assert.equal(b.animations.length,0);
    let lastEyes=0;
    for(let score=1;score<=total;score++) {
      const before=b.animations.length;
      b.run(`score=${score};reward(true)`);
      const created=b.animations.slice(before);
      b.run('reward(true);reward(false)');assert.equal(b.animations.length,before+created.length,'keine doppelte Animation');
      if(stage===3) {
        const count=Math.floor(score*12/total),flights=created.filter(a=>a.element.name.startsWith('eye'));
        assert.equal(flights.length,count-lastEyes);
        flights.forEach((a,n)=>assert.equal(a.options.delay,n*80));
        if(score===total) assert.equal(b.run('rewardState.portalActive'),false,'erst nach letztem gelandeten Auge');
        const latestLanding=flights.length?600+(flights.length-1)*80:0;
        assert(latestLanding+(score===total?450:0)<(score===total?2400:1900));
        lastEyes=count;
      } else {
        assert.equal(created.filter(a=>a.element.name==='.end-hero').length,1);
        assert(Math.abs(parseFloat(b.host.querySelector('.boss-health-fill').style.width)-(total-score)*100/total)<1e-9);
        assert(Math.max(...created.map(a=>(a.options.delay||0)+a.options.duration))<(score===total?2400:1900));
      }
      await b.settle();
      if(stage===3) assert.equal(b.run('rewardState.portalActive'),score===total);
    }
    if(stage===3) assert.equal(b.host.querySelectorAll('.end-eye').filter(e=>e.style.opacity==='1').length,12);
    else {assert.equal(b.host.querySelector('.boss-health').attributes['aria-valuenow'],'0');assert.equal(b.host.querySelector('.end-boss-dragon').style.opacity,'0');}
    // Wiederaufnahme: Zustand sofort korrekt, aber keine Treffer/Flüge erneut abspielen.
    const before=b.animations.length;b.run('resetReward();reward(false)');assert.equal(b.animations.length,before);
    b.run('score=0;resetReward();reward(false)');
    if(stage===3)assert.equal(b.host.querySelectorAll('.end-eye').filter(e=>e.style.opacity==='1').length,0);
    else assert.equal(b.host.querySelector('.boss-health').attributes['aria-valuenow'],'100');
  }
  for(const stage of [3,4]) {
    const b=setup(stage,1);b.run('reward();score=1;reward(true)');
    b.animations.forEach(a=>a.pause());await b.settle();
    if(stage===3)assert.equal(b.run('rewardState.portalActive'),false);
    b.animations.forEach(a=>a.play());
    b.run('score=0;resetReward();reward()');await b.settle();
    assert.equal(b.run('rewardState.score'),0);
    if(stage===3)assert.equal(b.run('rewardState.portalActive'),false);
    else assert.equal(b.host.querySelector('.boss-health').attributes['aria-valuenow'],'100');
    const reduced=setup(stage,1,true);reduced.run('reward();score=1;reward(true)');assert.equal(reduced.animations.length,0);
    if(stage===3)assert.equal(reduced.run('rewardState.portalActive'),true);
    else assert.equal(reduced.host.querySelector('.boss-health').attributes['aria-valuenow'],'0');
  }
  console.log('OK: Portal/Boss mit 5, 10, 12, 20 Aufgaben; proportionale Augen, Aktivierung nach Landung, Animationstiming, Doppelaufrufe, Pause, Reset während Animation, Wiederaufnahme und reduzierte Bewegung.');
}
main().catch(error=>{console.error(error);process.exitCode=1;});
