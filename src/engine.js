export const WIDTH = 960, HEIGHT = 540, FLOOR = 448;
export const ACTS = [
  {name:'Rootsy the Radish',title:'The Root of All Trouble',place:'The Garden',hp:190,color:'#ca6651',warning:['SEED SPIT!','ROOT RUMBLE!','HARVEST HAVOC!']},
  {name:'Baron Bubbles',title:'A Fishy Business',place:'The Harbor',hp:220,color:'#518c87',warning:['BUBBLE TROUBLE!','HIGH TIDE!','ALL HANDS ON DECK!']},
  {name:'Madame Moth',title:'The Midnight Flutter',place:'The Midnight Show',hp:245,color:'#af8190',warning:['STAR STRUCK!','MOON DANCE!','FINAL ENCORE!']}
];
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export function overlap(a,b){return a.x < b.x+b.w && a.x+a.w > b.x && a.y < b.y+b.h && a.y+a.h > b.y;}
export function createGame(act=0,difficulty='regular') {
  act=clamp(Math.floor(Number(act)||0),0,2);
  const gentle=difficulty==='gentle', maxHp=gentle?6:3;
  return {act,difficulty:gentle?'gentle':'regular',mode:'intro',intro:2.4,time:0,elapsed:0,phase:0,attackIn:1.6,attackCount:0,warning:'',warningTime:0,shake:0,
    player:{x:140,y:FLOOR-64,w:34,h:64,vx:0,vy:0,facing:1,hp:maxHp,maxHp,grounded:true,invuln:0,dash:0,dashCooldown:0,shootCooldown:0,parry:0,parryCooldown:0,ink:0},
    boss:{x:735,y:238,w:160,h:210,hp:ACTS[act].hp,maxHp:ACTS[act].hp,flash:0},shots:[],hazards:[],particles:[],events:[],hits:0,parries:0,specials:0,seed:31+act,previous:{}};
}
function random(g){g.seed=(g.seed*1664525+1013904223)>>>0;return g.seed/4294967296;}
function event(g,name){g.events.push(name);}
function burst(g,x,y,color,n=10){for(let i=0;i<n;i++)g.particles.push({x,y,vx:(random(g)-.5)*260,vy:(random(g)-.6)*250,life:.35+random(g)*.35,color,r:2+random(g)*5});}
export function damagePlayer(g){const p=g.player;if(p.invuln>0||p.dash>0||g.mode!=='playing')return false;p.hp--;g.hits++;p.invuln=1.5;g.shake=.2;burst(g,p.x+p.w/2,p.y+25,'#f7e5b8');event(g,'hurt');if(p.hp<=0){g.mode='defeat';event(g,'defeat');}return true;}
function hazard(g,x,y,vx,vy,r=13,pink=false,kind='seed'){g.hazards.push({x,y,w:r*2,h:r*2,vx,vy,r,pink,kind,life:8,age:0});}
function attack(g){const b=g.boss,p=g.player,slow=g.difficulty==='gentle'?.78:1;g.attackCount++;const n=g.attackCount;
  if(g.act===0){
    if(g.phase>0&&n%3===0){for(let i=0;i<3+g.phase;i++)hazard(g,220+i*130,30,-22,180*slow,16,i===1,'drop');}
    else {for(let i=0;i<3+g.phase;i++)hazard(g,b.x-15,330+i*23,-(255+g.phase*40)*slow,(i-1.4)*38,11,i===1&&n%2===0);}
  }else if(g.act===1){
    for(let i=0;i<3+g.phase;i++)hazard(g,b.x-20+i*38,280+i*20,-(195+g.phase*35)*slow,-(100+i*38)*slow,18,i===1,'bubble');
    if(g.phase===2&&n%2===0)hazard(g,950,FLOOR-26,-300*slow,0,13,false,'wave');
  }else{
    if(n%2===0){for(let i=0;i<4+g.phase;i++)hazard(g,170+i*125,-20-i*26,-25,200*slow,14,i===2,'star');}
    else {const angle=Math.atan2(p.y+25-(b.y+70),p.x-b.x);for(let i=-1;i<=1+g.phase;i++){const a=angle+i*.19;hazard(g,b.x-10,b.y+70,Math.cos(a)*245*slow,Math.sin(a)*245*slow,12,i===0,'star');}}
  }
  event(g,'attack');
}
export function step(g,input={},dt=1/60){
  dt=clamp(dt,0,1/30);g.events=[];if(g.mode==='paused')return;
  g.time+=dt;g.shake=Math.max(0,g.shake-dt);
  for(const p of g.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=380*dt;p.life-=dt;}g.particles=g.particles.filter(p=>p.life>0);
  if(g.mode==='intro'){g.intro-=dt;if(g.intro<=0){g.mode='playing';event(g,'begin');}g.previous={...input};return;}
  if(g.mode!=='playing')return;
  g.elapsed+=dt;const p=g.player,b=g.boss,pressed=k=>input[k]&&!g.previous[k];
  for(const k of ['invuln','dash','dashCooldown','shootCooldown','parry','parryCooldown'])p[k]=Math.max(0,p[k]-dt);
  b.flash=Math.max(0,b.flash-dt);
  const moving=(input.right?1:0)-(input.left?1:0);if(moving&&p.dash<=0)p.facing=moving;
  if(pressed('jump')&&p.grounded){p.vy=-640;p.grounded=false;event(g,'jump');}
  if(!input.jump&&g.previous.jump&&p.vy<-250)p.vy=-250;
  if(pressed('dash')&&p.dashCooldown<=0){p.dash=.18;p.dashCooldown=.72;event(g,'dash');burst(g,p.x,p.y+45,'#eee2c1',6);}
  if(pressed('parry')&&!p.grounded&&p.parryCooldown<=0){p.parry=.22;p.parryCooldown=.35;event(g,'parryTry');}
  p.vx=p.dash>0?p.facing*780:moving*285;
  if(p.dash<=0)p.vy+=1700*dt;else p.vy=0;
  p.x=clamp(p.x+p.vx*dt,20,WIDTH-p.w-20);p.y+=p.vy*dt;
  if(p.y+p.h>=FLOOR){p.y=FLOOR-p.h;p.vy=0;p.grounded=true;}else p.grounded=false;
  if(input.shoot&&p.shootCooldown<=0){const dir=b.x>p.x?1:-1;g.shots.push({x:p.x+(dir>0?p.w:-16),y:p.y+24,w:20,h:8,vx:dir*820,damage:2,special:false});p.shootCooldown=.115;event(g,'shoot');}
  if(pressed('special')&&p.ink>=5){p.ink=0;g.specials++;p.invuln=Math.max(p.invuln,.6);const dir=b.x>p.x?1:-1;g.shots.push({x:p.x,y:p.y+8,w:65,h:45,vx:dir*1050,damage:34,special:true});g.shake=.15;event(g,'special');}
  const phase=b.hp/b.maxHp>.66?0:b.hp/b.maxHp>.33?1:2;
  if(phase!==g.phase){g.phase=phase;g.warning='PHASE '+(phase+1)+' — '+ACTS[g.act].warning[phase];g.warningTime=1.6;g.attackIn=Math.max(g.attackIn,1.7);event(g,'phase');}
  if(g.act===2)b.y=215+Math.sin(g.time*1.8)*65;
  g.attackIn-=dt;g.warningTime=Math.max(0,g.warningTime-dt);
  if(g.attackIn<.65&&g.warningTime<=0){g.warning=ACTS[g.act].warning[g.phase];g.warningTime=Math.max(.05,g.attackIn);}
  if(g.attackIn<=0){attack(g);g.attackIn=(2.05-g.phase*.3)*(g.difficulty==='gentle'?1.22:1);}
  for(const s of g.shots){s.x+=s.vx*dt;if(overlap(s,b)){b.hp=Math.max(0,b.hp-s.damage);b.flash=.08;s.dead=true;p.ink=clamp(p.ink+(s.special?0:.09),0,5);burst(g,s.x,s.y,s.special?'#6ac2b5':'#fbe5a1',s.special?22:4);event(g,'hit');}}
  g.shots=g.shots.filter(s=>!s.dead&&s.x>-100&&s.x<WIDTH+100);
  // Victory wins a same-frame collision: a final successful shot should feel fair.
  if(b.hp<=0){g.mode='victory';g.hazards=[];g.shake=.4;burst(g,b.x+70,b.y+80,'#f6d68d',65);event(g,'victory');g.previous={...input};return;}
  const hurtbox={x:p.x+5,y:p.y+7,w:p.w-10,h:p.h-10};
  for(const h of g.hazards){h.age+=dt;h.life-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;
    if(h.kind==='bubble'){h.vy+=380*dt;if(h.y+h.h>FLOOR){h.y=FLOOR-h.h;h.vy=-310;}}
    if(h.kind==='drop'&&h.y+h.h>=FLOOR){h.y=FLOOR-h.h;h.vy=0;h.vx=-210;h.kind='seed';}
    const parryBox={x:p.x-14,y:p.y-14,w:p.w+28,h:p.h+28};
    if(h.pink&&p.parry>0&&!p.grounded&&overlap(parryBox,h)){h.dead=true;p.vy=-520;p.ink=clamp(p.ink+1,0,5);p.parry=0;p.invuln=Math.max(p.invuln,.3);g.parries++;burst(g,h.x,h.y,'#f398bd',16);event(g,'parry');}
    else if(overlap(hurtbox,h)&&damagePlayer(g)){h.dead=true;}
  }
  if(overlap(hurtbox,{x:b.x+20,y:b.y+25,w:b.w-40,h:b.h-30}))damagePlayer(g);
  g.hazards=g.hazards.filter(h=>!h.dead&&h.life>0&&h.x>-70&&h.x<WIDTH+120&&h.y<HEIGHT+80);
  g.previous={...input};
}
export function grade(g){if(g.hits===0&&g.elapsed<65)return 'S';if(g.hits<=1)return 'A';if(g.hits<=3)return 'B';return 'C';}
export function readSave(raw){try{const value=JSON.parse(raw);if(!value||typeof value!=='object')return {};const out={};for(const [key,v]of Object.entries(value)){if(/^[0-2]-(regular|gentle)$/.test(key)&&v&&['S','A','B','C'].includes(v.grade)&&Number.isFinite(v.time)&&v.time>0)out[key]={grade:v.grade,time:v.time};}return out;}catch{return {};}}
