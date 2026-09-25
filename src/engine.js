import {BOSSES, WEAPONS, levelById} from './content.js';
export const WIDTH=960, HEIGHT=540, FLOOR=448;
export const ACTS=BOSSES;
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const overlap=(a,b)=>a.x<b.x+b.w&&a.x+a.w>b.x&&a.y<b.y+b.h&&a.y+a.h>b.y;

export function createGame(act=0,difficulty='regular',options={}) {
  act=clamp(Math.floor(Number(act)||0),0,BOSSES.length-1);
  const gentle=difficulty==='gentle', charm=['heart','coffee','dash'].includes(options.charm)?options.charm:'none';
  const maxHp=(gentle?6:3)+(charm==='heart'?1:0), def=BOSSES[act];
  const loadout=Array.isArray(options.loadout)&&options.loadout.length===2&&options.loadout.every(id=>Object.hasOwn(WEAPONS,id))?[...options.loadout]:['inkshot','spread'];
  const flying=!!def.flying;
  return {
    act,world:def.world,levelId:null,type:flying?'flight':'boss',difficulty:gentle?'gentle':'regular',mode:'intro',intro:2.4,time:0,elapsed:0,phase:0,attackIn:1.6,attackCount:0,warning:'',warningTime:0,shake:0,
    player:{x:140,y:flying?260:FLOOR-64,w:flying?48:34,h:flying?32:64,vx:0,vy:0,facing:1,hp:maxHp,maxHp,grounded:!flying,invuln:0,dash:0,dashCooldown:0,shootCooldown:0,parry:0,parryCooldown:0,ink:0,chargeTime:0,loadout,slot:0,charm,super:['shield','storm'].includes(options.super)?options.super:'blast',lastSafe:140},
    boss:{x:735,y:flying?170:238,w:160,h:210,hp:def.hp,maxHp:def.hp,flash:0},
    camera:0,worldWidth:WIDTH,platforms:[],ground:[],enemies:[],coins:[],collected:[],shots:[],hazards:[],particles:[],events:[],hits:0,parries:0,specials:0,seed:31+act,previous:{},
  };
}
export function createLevelGame(id,difficulty='regular',options={}) {
  const level=levelById(id);
  if(!level)throw new Error('Unknown level: '+id);
  const g=createGame(level.boss??level.world,difficulty,options);
  g.levelId=id;g.type=level.type;g.world=level.world;
  if(level.type==='run') {
    g.worldWidth=3900+level.world*300;
    g.player.w=34;g.player.h=64;g.player.y=FLOOR-64;g.player.grounded=true;
    const layouts=[
      {ground:[[0,990],[1100,2040],[2150,3120],[3230,3900]],platforms:[[490,354,180],[760,286,180],[1290,350,190],[1740,300,180],[2350,350,170],[2680,285,190],[3410,345,180]],coins:[[425,325],[833,235],[1640,325],[2750,235],[3470,295]]},
      {ground:[[0,780],[900,1730],[1850,2640],[2760,3540],[3670,4200]],platforms:[[460,354,150],[1160,344,220],[1390,272,170],[2080,345,190],[2390,278,175],[2990,340,180],[3810,340,200]],coins:[[350,325],[1450,225],[2230,295],[3030,287],[3910,285]]},
      {ground:[[0,1130],[1250,2210],[2330,3450],[3570,4500]],platforms:[[560,340,190],[840,270,190],[1440,350,180],[1750,275,190],[2500,345,190],[2790,270,180],[3100,345,190],[3790,340,200],[4070,265,190]],coins:[[615,290],[1820,225],[2840,220],[3180,295],[4140,215]]},
    ];
    const layout=layouts[level.world];
    g.ground=layout.ground;
    g.platforms=layout.platforms.map(([x,y,w])=>({x,y,w,h:18}));
    g.enemies=Array.from({length:10+level.world*2},(_,i)=>{
      let x=580+i*245;
      if(!g.ground.some(([start,end])=>x>=start+60&&x<end-80))x=(g.ground.find(([start])=>start>x)?.[0]??g.worldWidth-230)+70;
      return {x,y:FLOOR-40,w:38,h:40,hp:8+level.world*2,maxHp:8+level.world*2,home:x,phase:i,kind:i%3===1?'turret':i%3===2?'hopper':'walker',fire:1+i*.13,flash:0};
    });
    g.coins=layout.coins.map(([x,y],id)=>({id,x,y,w:22,h:26,collected:false,banked:Array.isArray(options.collected)&&options.collected.includes(id)}));
  }
  return g;
}
function random(g){g.seed=(g.seed*1664525+1013904223)>>>0;return g.seed/4294967296;}
function event(g,name){g.events.push(name);}
function burst(g,x,y,color,n=10){for(let i=0;i<n;i++)g.particles.push({x,y,vx:(random(g)-.5)*260,vy:(random(g)-.6)*250,life:.35+random(g)*.35,color,r:2+random(g)*5});}
export function damagePlayer(g){const p=g.player;if(p.invuln>0||p.dash>0||g.mode!=='playing')return false;p.hp--;g.hits++;p.invuln=1.5;g.shake=.2;burst(g,p.x+p.w/2,p.y+25,'#f7e5b8');event(g,'hurt');if(p.hp<=0){g.mode='defeat';event(g,'defeat');}return true;}
function hazard(g,x,y,vx,vy,r=13,pink=false,kind='seed',extra={}){g.hazards.push({x,y,w:r*2,h:r*2,vx,vy,r,pink,kind,life:8,age:0,...extra});}
function aimed(g,x,y,speed,pink=false,kind='seed',offset=0){const p=g.player,a=Math.atan2(p.y+p.h/2-y,p.x+p.w/2-x)+offset;hazard(g,x,y,Math.cos(a)*speed,Math.sin(a)*speed,12,pink,kind);}
function attack(g){
  const b=g.boss,slow=g.difficulty==='gentle'?.78:1,phase=g.phase;
  g.attackCount++;const n=g.attackCount,pattern=BOSSES[g.act].pattern;
  switch(pattern){
    case 'seeds':
      if(phase>0&&n%3===0){for(let i=0;i<3+phase;i++)hazard(g,220+i*130,30,-22,180*slow,16,i===1,'drop');}
      else for(let i=0;i<3+phase;i++)hazard(g,b.x-15,330+i*23,-(255+phase*40)*slow,(i-1.4)*38,11,i===1&&n%2===0);
      break;
    case 'bubbles':
      for(let i=0;i<3+phase;i++)hazard(g,b.x-20+i*38,280+i*20,-(195+phase*35)*slow,-(100+i*38)*slow,18,i===1,'bubble');
      if(phase===2&&n%2===0)hazard(g,950,FLOOR-26,-300*slow,0,13,false,'wave');
      break;
    case 'stars':
      if(n%2===0){for(let i=0;i<4+phase;i++)hazard(g,170+i*125,-20-i*26,-25,200*slow,14,i===2,'star');}
      else for(let i=-1;i<=1+phase;i++)aimed(g,b.x-10,b.y+70,245*slow,i===0,'star',i*.19);
      break;
    case 'clock':
      for(let i=0;i<3+phase;i++)hazard(g,150+i*145,-30-i*32,Math.sin(n)*30,210*slow,16,i===1,'gear');
      if(phase>0)hazard(g,b.x,FLOOR-28,-(270+phase*30)*slow,0,14,false,'gear');
      break;
    case 'storm': {
      const gap=(n%3)*110+110;
      for(let y=80;y<450;y+=60)if(Math.abs(y-gap)>60)hazard(g,930,y,-(220+phase*35)*slow,Math.sin(n)*15,14,y===380,'rain');
      if(phase>0)aimed(g,b.x,b.y+60,210*slow,true,'star');
      break;
    }
    case 'frog':
      for(let i=0;i<3+phase;i++)hazard(g,b.x+i*26,FLOOR-30,-(230+phase*30)*slow,-(200+i*60),15,i===1,'bubble');
      if(phase===2)for(let i=0;i<2;i++)hazard(g,200+i*240,-20,0,190*slow,18,false,'drop');
      break;
    case 'crab':
      for(let i=0;i<2+phase;i++)hazard(g,b.x+i*105,FLOOR-28,-280*slow,0,14,i===1,'shell');
      if(n%2===0)for(let i=0;i<3;i++)aimed(g,b.x,b.y+55,225*slow,false,'shell',(i-1)*.28);
      break;
    case 'feathers':
      for(let i=0;i<5+phase;i++){const a=Math.PI+(i-(4+phase)/2)*.19;hazard(g,b.x,b.y+90,Math.cos(a)*260*slow,Math.sin(a)*260*slow,12,i===2,'feather');}
      if(phase>0)for(let i=0;i<3;i++)hazard(g,200+i*190,-20,45,210*slow,14,i===1,'feather');
      break;
    case 'tentacles':
      if(n%2===0)for(let i=0;i<3+phase;i++)hazard(g,150+i*140,FLOOR-20,-60,-380,16,i===1,'inkarc');
      else for(let i=0;i<3+phase;i++)aimed(g,b.x,b.y+65,220*slow,i===0,'ink',(i-1)*.2);
      break;
    case 'flame':
      for(let i=0;i<3+phase;i++)hazard(g,b.x+i*80,FLOOR-28,-(270+phase*30)*slow,0,14,i===1,'fire');
      if(phase>0)for(let i=0;i<3;i++)hazard(g,190+i*180,-10,0,230*slow,17,false,'drop');
      break;
    case 'orbit':
      for(let i=0;i<9+phase*3;i++){const a=i/(9+phase*3)*Math.PI*2+n*.29;hazard(g,b.x+35,b.y+90,Math.cos(a)*190*slow,Math.sin(a)*190*slow,12,i===4,'star');}
      if(phase===2)aimed(g,b.x,b.y+90,310*slow,true,'star');
      break;
    case 'film':
      if(phase===0){for(let i=0;i<4;i++)hazard(g,b.x+i*60,390-i*60,-260*slow,0,14,i===2,'gear');}
      else if(phase===1){for(let i=0;i<5;i++)hazard(g,140+i*145,-10-i*30,20,245*slow,15,i===2,'star');}
      else{for(let i=-2;i<=2;i++)aimed(g,b.x,b.y+75,260*slow,i===0,'ink',i*.2);hazard(g,b.x,FLOOR-26,-320*slow,0,13,false,'fire');}
      break;
  }
  event(g,'attack');
}
function targets(g){return g.type==='run'?g.enemies.filter(e=>e.hp>0&&Math.abs(e.x-g.player.x)<850):[g.boss];}
function nearest(g,x,y){return targets(g).reduce((best,e)=>!best||Math.hypot(e.x+e.w/2-x,e.y+e.h/2-y)<Math.hypot(best.x+best.w/2-x,best.y+best.h/2-y)?e:best,null);}
function addShot(g,id,x,y,angle,damage,extra={}){
  const w=WEAPONS[id];g.shots.push({x,y,w:20,h:10,vx:Math.cos(angle)*w.speed,vy:Math.sin(angle)*w.speed,damage:damage*(g.player.charm==='heart'?.9:1),weapon:id,color:w.color,life:w.life,age:0,special:false,...extra});
}
function shoot(g,input,charged=0,ex=false){
  const p=g.player,id=p.loadout[p.slot],w=WEAPONS[id],target=nearest(g,p.x,p.y);
  const dir=g.type==='run'?p.facing:target&&target.x<p.x?-1:1;
  let angle=dir===1?0:Math.PI;
  if(input.up)angle=(input.left||input.right)?(dir===1?-Math.PI/4:-Math.PI*3/4):-Math.PI/2;
  else if(input.down&&g.type==='flight')angle=(input.left||input.right)?(dir===1?Math.PI/4:Math.PI*3/4):Math.PI/2;
  const x=p.x+(dir===1?p.w:-20),y=p.y+(g.type==='flight'?12:24),mult=ex?4:1;
  if(id==='spread'){for(let i=-2;i<=2;i++)addShot(g,id,x,y,angle+i*.19,w.damage*mult,{life:ex?.8:w.life,w:ex?26:13,h:ex?18:9,special:ex});}
  else if(id==='lobber')addShot(g,id,x,y,angle,w.damage*mult,{vy:-260,gravity:650,w:ex?42:22,h:ex?42:22,special:ex});
  else if(id==='seeker'){for(let i=0;i<(ex?3:1);i++)addShot(g,id,x,y+i*12,angle,w.damage*(ex?7:1),{homing:true,special:ex,w:ex?27:15,h:ex?22:11});}
  else if(id==='charge')addShot(g,id,x,y,angle,(charged>=.9?20:w.damage)*(ex?1.8:1),{w:charged>=.9?52:22,h:charged>=.9?30:10,special:ex,life:1.4});
  else addShot(g,id,x,y,angle,w.damage*mult,{w:ex?48:20,h:ex?30:10,special:ex,...(ex&&id==='inkshot'?{pierce:true,hitTargets:[]}: {})});
  p.shootCooldown=w.rate;event(g,ex?'special':'shoot');
}
function superAttack(g){
  const p=g.player;p.ink=0;g.specials++;p.invuln=Math.max(p.invuln,.65);g.shake=.2;
  if(p.super==='shield')p.invuln=6;
  else if(p.super==='storm'){for(let i=0;i<10;i++)addShot(g,'seeker',p.x-80+i*23,p.y-80,0,8,{homing:true,special:true,w:24,h:20,life:4});}
  else{const dir=g.type==='run'?p.facing:g.boss.x>p.x?1:-1;addShot(g,'inkshot',p.x,p.y-4,dir>0?0:Math.PI,42,{w:120,h:78,vx:dir*1050,vy:0,special:true,pierce:true,hitTargets:[],life:1.5});}
  event(g,'special');
}
function movePlayer(g,input,dt,pressed){
  const p=g.player,moving=(input.right?1:0)-(input.left?1:0),flying=g.type==='flight';
  if(moving&&p.dash<=0)p.facing=moving;
  if(pressed('jump')&&p.grounded&&!flying){p.vy=-640;p.grounded=false;event(g,'jump');}
  if(!input.jump&&g.previous.jump&&p.vy<-250&&!flying)p.vy=-250;
  if(pressed('dash')&&p.dashCooldown<=0){p.dash=.18;p.dashCooldown=p.charm==='dash'?.47:.72;event(g,'dash');burst(g,p.x,p.y+25,'#eee2c1',6);}
  if(pressed('parry')&&(flying||!p.grounded)&&p.parryCooldown<=0){p.parry=.22;p.parryCooldown=.35;event(g,'parryTry');}
  p.vx=p.dash>0?p.facing*780:moving*(flying?300:285);
  const oldBottom=p.y+p.h;
  if(flying){p.vy=((input.down?1:0)-(input.up?1:0))*300;p.grounded=false;}
  else if(p.dash<=0)p.vy+=1700*dt;else p.vy=0;
  p.x=clamp(p.x+p.vx*dt,20,g.worldWidth-p.w-20);p.y+=p.vy*dt;
  if(flying)p.y=clamp(p.y,65,HEIGHT-p.h-35);
  else{
    p.grounded=false;
    const surfaces=g.type==='run'?[...g.platforms,...g.ground.map(([x,end])=>({x,y:FLOOR,w:end-x}))]:[{x:0,y:FLOOR,w:WIDTH}];
    const landing=surfaces.filter(s=>p.vy>=0&&oldBottom<=s.y+1&&p.y+p.h>=s.y&&p.x+p.w>s.x&&p.x<s.x+s.w).sort((a,b)=>a.y-b.y)[0];
    if(landing){p.y=landing.y-p.h;p.vy=0;p.grounded=true;if(g.type==='run')p.lastSafe=p.x;}
    if(g.type==='run'&&p.y>HEIGHT+70){damagePlayer(g);p.x=p.lastSafe;p.y=FLOOR-p.h-100;p.vy=0;p.invuln=Math.max(p.invuln,1);event(g,'fall');}
  }
  g.camera=clamp(p.x-310,0,g.worldWidth-WIDTH);
}
function updateRun(g,dt){
  const p=g.player;
  for(const e of g.enemies){
    if(e.hp<=0||Math.abs(e.x-p.x)>850)continue;
    e.flash=Math.max(0,e.flash-dt);
    if(e.kind==='walker')e.x=e.home+Math.sin(g.time*1.5+e.phase)*60;
    if(e.kind==='hopper')e.y=FLOOR-e.h-Math.abs(Math.sin(g.time*2+e.phase))*100;
    if(e.kind==='turret'){e.fire-=dt;if(e.fire<=0){aimed(g,e.x,e.y+10,g.difficulty==='gentle'?170:230,e.phase%2===0,'seed');e.fire=2.6-g.world*.25;}}
    if(overlap({x:p.x+5,y:p.y+7,w:p.w-10,h:p.h-10},e))damagePlayer(g);
  }
  for(const coin of g.coins)if(!coin.collected&&overlap(p,coin)){coin.collected=true;if(!coin.banked)g.collected.push(coin.id);burst(g,coin.x,coin.y,'#e9c766',12);event(g,'coin');}
  if(p.x>=g.worldWidth-140&&g.mode==='playing'){g.mode='victory';g.hazards=[];event(g,'victory');}
}
function updateShots(g,dt){
  for(const s of g.shots){
    s.age=(s.age||0)+dt;s.life=(s.life??2)-dt;
    if(s.homing){const target=nearest(g,s.x,s.y);if(target){const a=Math.atan2(target.y+target.h/2-s.y,target.x+target.w/2-s.x),speed=WEAPONS.seeker.speed;s.vx+=(Math.cos(a)*speed-s.vx)*Math.min(1,dt*7);s.vy+=(Math.sin(a)*speed-s.vy)*Math.min(1,dt*7);}}
    if(s.weapon==='boomerang'&&s.age>.42){s.vx-=(s.returnDir??=Math.sign(s.vx))*1400*dt;s.vx=clamp(s.vx,-820,820);}
    if(s.gravity){s.vy+=s.gravity*dt;if(s.y+s.h>FLOOR&&s.vy>0){s.y=FLOOR-s.h;s.vy=-330;}}
    s.x+=s.vx*dt;s.y+=(s.vy||0)*dt;
    for(const target of targets(g))if(overlap(s,target)&&!s.hitTargets?.includes(target)){
      target.hp=Math.max(0,target.hp-s.damage);target.flash=.09;
      if(s.pierce)s.hitTargets.push(target);else s.dead=true;
      g.player.ink=clamp(g.player.ink+(s.special?0:.09),0,5);
      burst(g,s.x,s.y,s.color||'#fbe5a1',s.special?18:4);event(g,'hit');
      if(target.hp<=0&&g.type==='run'){burst(g,target.x,target.y,'#f1d298',14);event(g,'enemyDown');}
      if(s.dead)break;
    }
  }
  g.shots=g.shots.filter(s=>!s.dead&&s.life>0&&s.x>g.camera-200&&s.x<g.camera+WIDTH+250&&s.y>-200&&s.y<HEIGHT+150);
}
function updateHazards(g,dt){
  const p=g.player,hurtbox={x:p.x+5,y:p.y+7,w:p.w-10,h:p.h-10};
  for(const h of g.hazards){
    h.age+=dt;h.life-=dt;h.x+=h.vx*dt;h.y+=h.vy*dt;
    if(h.kind==='bubble'){h.vy+=380*dt;if(h.y+h.h>FLOOR){h.y=FLOOR-h.h;h.vy=-310;}}
    if(h.kind==='inkarc')h.vy+=620*dt;
    if(h.kind==='drop'&&h.y+h.h>=FLOOR){h.y=FLOOR-h.h;h.vy=0;h.vx=-210;h.kind='seed';}
    const parryBox={x:p.x-14,y:p.y-14,w:p.w+28,h:p.h+28};
    if(h.pink&&p.parry>0&&(g.type==='flight'||!p.grounded)&&overlap(parryBox,h)){h.dead=true;if(g.type!=='flight')p.vy=-520;p.ink=clamp(p.ink+1,0,5);p.parry=0;p.invuln=Math.max(p.invuln,.3);g.parries++;burst(g,h.x,h.y,'#f398bd',16);event(g,'parry');}
    else if(overlap(hurtbox,h)&&damagePlayer(g))h.dead=true;
  }
  if(g.type!=='run'){const b=g.boss;if(overlap(hurtbox,{x:b.x+20,y:b.y+25,w:b.w-40,h:b.h-30}))damagePlayer(g);}
  g.hazards=g.hazards.filter(h=>!h.dead&&h.life>0&&h.x>g.camera-120&&h.x<g.camera+WIDTH+250&&h.y<HEIGHT+80);
}
export function step(g,input={},dt=1/60){
  dt=clamp(dt,0,1/30);g.events=[];if(g.mode==='paused')return;
  g.time+=dt;g.shake=Math.max(0,g.shake-dt);
  for(const p of g.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=380*dt;p.life-=dt;}g.particles=g.particles.filter(p=>p.life>0);
  if(g.mode==='intro'){if(input.switch&&!g.previous.switch){g.player.slot=1-g.player.slot;event(g,'switch');}g.intro-=dt;if(g.intro<=0){g.mode='playing';event(g,'begin');}g.previous={...input};return;}
  if(g.mode!=='playing')return;
  g.elapsed+=dt;const p=g.player,b=g.boss,pressed=k=>input[k]&&!g.previous[k];
  for(const key of ['invuln','dash','dashCooldown','shootCooldown','parry','parryCooldown'])p[key]=Math.max(0,p[key]-dt);
  b.flash=Math.max(0,b.flash-dt);
  if(p.charm==='coffee')p.ink=clamp(p.ink+dt*.12,0,5);
  if(pressed('switch')){p.slot=1-p.slot;p.chargeTime=0;event(g,'switch');}
  movePlayer(g,input,dt,pressed);
  if(g.mode!=='playing'){g.previous={...input};return;}
  const weapon=p.loadout[p.slot];
  if(weapon==='charge'){
    if(input.shoot)p.chargeTime=Math.min(1.2,p.chargeTime+dt);
    else if(g.previous.shoot&&p.shootCooldown<=0){shoot(g,input,p.chargeTime);p.chargeTime=0;}
  }else if(input.shoot&&p.shootCooldown<=0)shoot(g,input);
  if(pressed('ex')&&p.ink>=1){p.ink-=1;shoot(g,input,1,true);}
  if(pressed('special')&&p.ink>=5)superAttack(g);
  if(g.type!=='run'){
    const phase=b.hp/b.maxHp>.66?0:b.hp/b.maxHp>.33?1:2;
    if(phase!==g.phase){g.phase=phase;g.warning='PHASE '+(phase+1)+' — '+BOSSES[g.act].warning[phase];g.warningTime=1.6;g.attackIn=Math.max(g.attackIn,1.7);event(g,'phase');}
    if(g.act===2)b.y=215+Math.sin(g.time*1.8)*65;
    else if(g.type==='flight')b.y=160+Math.sin(g.time*1.25)*95;
    else if(BOSSES[g.act].pattern==='frog')b.y=238-Math.max(0,Math.sin(g.time*2))*60;
    else if(BOSSES[g.act].pattern==='crab')b.x=735+Math.sin(g.time)*60;
    g.attackIn-=dt;g.warningTime=Math.max(0,g.warningTime-dt);
    if(g.attackIn<.65&&g.warningTime<=0){g.warning=BOSSES[g.act].warning[g.phase];g.warningTime=Math.max(.05,g.attackIn);}
    if(g.attackIn<=0){attack(g);g.attackIn=(2.05-g.phase*.3)*(g.difficulty==='gentle'?1.22:1);}
  }
  updateShots(g,dt);
  if(g.type!=='run'&&b.hp<=0){g.mode='victory';g.hazards=[];g.shake=.4;burst(g,b.x+70,b.y+80,'#f6d68d',65);event(g,'victory');g.previous={...input};return;}
  if(g.type==='run')updateRun(g,dt);
  if(g.mode==='playing')updateHazards(g,dt);
  g.previous={...input};
}
export function grade(g){if(g.hits===0&&g.elapsed<95)return 'S';if(g.hits<=1)return 'A';if(g.hits<=3)return 'B';return 'C';}
// Kept for v1 tools and migration tests. Campaign saves use campaign.js.
export function readSave(raw){try{const value=JSON.parse(raw);if(!value||typeof value!=='object')return {};const out={};for(const [key,v]of Object.entries(value)){if(/^[0-2]-(regular|gentle)$/.test(key)&&v&&['S','A','B','C'].includes(v.grade)&&Number.isFinite(v.time)&&v.time>0)out[key]={grade:v.grade,time:v.time};}return out;}catch{return {};}}
