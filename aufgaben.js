const TASK_TYPES = { tens: 'Zehner + Zahl', ones: 'Einer ergänzen', split: 'Zahlen zerlegen' };

// Positive Teilbeträge, keine künstlichen +0/-0-Schritte. Bei Subtraktion zuerst
// die Zehner abziehen, dann bei Bedarf bis zum unteren Zehner und weiter rechnen.
function decomposition(a,b,op) {
  const steps=[];let current=a;
  function add(part,label) {
    if(part===0) return;
    const r=op==='+'?current+part:current-part;
    steps.push({a:current,b:part,op,r,label});current=r;
  }
  add(Math.floor(b/10)*10,'Zuerst die Zehner');
  const ones=b%10, distance=op==='+'?10-current%10:current%10;
  if(ones>distance && distance>0) {
    add(distance,op==='+'?'Bis zum nächsten Zehner':'Bis zum unteren Zehner');
    add(ones-distance,'Jetzt der Rest');
  } else add(ones,'Jetzt die Einer');
  return steps;
}
function makeTask(a,b,op,type) {
  const task={a,b,op,r:op==='+'?a+b:a-b,type};
  if(type==='split') task.steps=decomposition(a,b,op);
  return task;
}
function taskFits(a,b,op,type,range) {
  const r=op==='+'?a+b:a-b;
  if(a<1||a>range||b<1||b>99||r<0||r>range) return false;
  if(type==='tens') return a%10===0;
  if(type==='ones') return a>=10&&a<=99&&b<=9&&(op==='+'?a%10+b<10:a%10>=b);
  if(type==='split') return a>=(range===20?1:10)&&b>=10;
  return false;
}
// Pro Rechenart ohne Zurücklegen ziehen. Nur wenn der Vorrat erschöpft ist,
// beginnt ein neuer Vorrat; direkte Wiederholungen bleiben ausgeschlossen.
function createTasks(s) {
  const type=s.taskType||'tens';
  const extraPlus=Math.random()<.5;
  const operations=Array.from({length:s.amount},(_,n)=>s.operation==='mixed'?((n+Number(extraPlus))%2===0?'+':'−'):s.operation==='plus'?'+':'−');
  for(let n=operations.length-1;n>0;n--){const j=rnd(0,n);[operations[n],operations[j]]=[operations[j],operations[n]];}
  const source={},decks={},result=[];
  for(const op of new Set(operations)) {
    source[op]=[];
    const maxA=type==='ones'?Math.min(99,s.range):s.range;
    for(let a=1;a<=maxA;a++) for(let b=1;b<=(type==='ones'?9:99);b++) {
      if(taskFits(a,b,op,type,s.range)) source[op].push(a*100+b);
    }
    if(!source[op].length) throw new Error('Für diese Einstellungen sind keine Aufgaben möglich.');
    decks[op]=source[op].slice();
  }
  for(const op of operations) {
    if(!decks[op].length) decks[op]=source[op].slice();
    const deck=decks[op],previous=result[result.length-1];
    let index=rnd(0,deck.length-1);
    if(previous && previous.op===op && deck[index]===previous.a*100+previous.b && deck.length>1) index=(index+1)%deck.length;
    const code=deck[index];deck[index]=deck[deck.length-1];deck.pop();
    result.push(makeTask(Math.floor(code/100),code%100,op,type));
  }
  return result;
}
function validSave(s) {
  if(!(s && s.version===1 && ['dino','space','mine'].includes(s.theme) && [20,100,1000].includes(s.range) && Number.isInteger(s.total) && s.total>=1 && s.total<=50 && Array.isArray(s.tasks) && s.tasks.length===s.total && Number.isInteger(s.i) && s.i>=0 && s.i<s.total && typeof s.locked==='boolean' && s.score===s.i+Number(s.locked) && typeof s.answer==='string')) return false;
  if(!s.tasks.every(t=>t && Number.isInteger(t.a)&&Number.isInteger(t.b)&&t.a>=0&&t.b>=0&&t.a<=s.range&&t.b<=s.range&&['+','−'].includes(t.op)&&t.r===(t.op==='+'?t.a+t.b:t.a-t.b)&&t.r>=0&&t.r<=s.range&&typeof t.story==='string')) return false;
  // Alte Spielstände ohne Typ bleiben als bisherige Aufgaben fortsetzbar.
  if(s.taskType===undefined || s.taskType==='legacy') return true;
  if(!Object.hasOwn(TASK_TYPES,s.taskType)||!['plus','minus','mixed'].includes(s.operation)) return false;
  if(!s.tasks.every(t=>t.type===s.taskType&&taskFits(t.a,t.b,t.op,t.type,s.range)&&(s.operation==='mixed'||t.op===(s.operation==='plus'?'+':'−'))&&(t.type!=='split'||JSON.stringify(t.steps)===JSON.stringify(decomposition(t.a,t.b,t.op))))) return false;
  const step=s.stepIndex,wait=s.stepWaiting;
  if(!Number.isInteger(step)||typeof wait!=='boolean') return false;
  if(s.taskType!=='split') return step===0&&!wait;
  const length=s.tasks[s.i].steps.length;
  return step>=0&&step<length&&(!wait||(!s.locked&&step<length-1))&&(!s.locked||step===length-1);
}
