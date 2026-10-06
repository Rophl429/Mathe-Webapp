// Kurze Geschichten zur unveränderten Ausgangsrechnung, auch bei der Zerlegung.
function text() {
  const {a,b,op}=q,plus=op==='+';
  const count=(n,one,many)=>`${n} ${n===1?one:many}`;
  let stories;
  if(theme==='dino') stories=plus?[
    `Im Nest ${a===1?'liegt':'liegen'} ${count(a,'Dino-Ei','Dino-Eier')}. ${count(b,'Ei kommt','Eier kommen')} dazu. Wie viele Eier sind es jetzt?`,
    `Du findest ${count(a,'Knochen','Knochen')}. Dann findest du noch ${b}. Wie viele sind es zusammen?`,
    `Du zählst ${count(a,'Dinosaurier','Dinosaurier')}. ${b===1?'Einer kommt':b+' kommen'} dazu. Wie viele sind es jetzt?`
  ]:[
    `Du findest ${count(a,'Fussabdruck','Fussabdrücke')}. ${b} ${b===1?'ist':'sind'} schon untersucht. Wie viele fehlen noch?`,
    `Im Tal ${a===1?'lebt':'leben'} ${count(a,'Dinosaurier','Dinosaurier')}. ${b===1?'Einer zieht':b+' ziehen'} weiter. Wie viele bleiben?`,
    `Du hast ${count(a,'Fossil','Fossilien')}. Du gibst ${b} ins Museum. Wie viele bleiben?`
  ];
  else if(theme==='space') stories=plus?[
    `Die Rakete hat ${count(a,'Energiepunkt','Energiepunkte')}. Du lädst ${b} dazu. Wie viele sind es jetzt?`,
    `Du hast ${count(a,'Mondstein','Mondsteine')}. Du sammelst noch ${b}. Wie viele sind es zusammen?`,
    `Du entdeckst ${count(a,'Stern','Sterne')}. Dann entdeckst du noch ${b}. Wie viele sind es zusammen?`
  ]:[
    `Die Rakete hat ${count(a,'Energiepunkt','Energiepunkte')}. Beim Flug verbraucht sie ${b}. Wie viele bleiben?`,
    `Du hast ${count(a,'Vorratspaket','Vorratspakete')}. Du verbrauchst ${b}. Wie viele bleiben?`,
    `Du hast ${count(a,'Mondstein','Mondsteine')}. Du gibst ${b} ab. Wie viele bleiben?`
  ];
  else stories=plus?[
    `Du hast ${count(a,'Steinblock','Steinblöcke')}. Du sammelst noch ${b}. Wie viele hast du jetzt?`,
    `In der Truhe ${a===1?'liegt':'liegen'} ${count(a,'Block','Blöcke')}. Du legst ${b} dazu. Wie viele sind es jetzt?`,
    `Du hast ${count(a,'Holzblock','Holzblöcke')}. Du findest noch ${b}. Wie viele sind es zusammen?`
  ]:[
    `Du hast ${count(a,'Block','Blöcke')}. Du verbaust ${b}. Wie viele bleiben?`,
    `In der Truhe ${a===1?'liegt':'liegen'} ${count(a,'Block','Blöcke')}. Du nimmst ${b} heraus. Wie viele bleiben?`,
    `Du hast ${count(a,'Brot','Brote')}. Du verbrauchst ${b}. Wie viele bleiben?`
  ];
  return stories[rnd(0,stories.length-1)];
}
