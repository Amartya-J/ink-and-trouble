import test from 'node:test';
import assert from 'node:assert/strict';
import {LEVELS,WEAPONS,WORLDS} from '../src/content.js';
import {freshCampaign,loadCampaign,completeLevel,purchase,equip,levelUnlocked,worldUnlocked,superUnlocked} from '../src/campaign.js';
import {createGame,createLevelGame,step,FLOOR} from '../src/engine.js';
const win={grade:'A',time:42,difficulty:'regular'};
const ready=(id='root-trouble',options={})=>{const g=createLevelGame(id,'regular',options);g.mode='playing';g.attackIn=999;return g;};
const advance=(g,n,input={})=>{for(let i=0;i<n;i++)step(g,input);};

test('campaign has fifteen unique stages and three distinct gameplay types',()=>{
  assert.equal(LEVELS.length,15);assert.equal(new Set(LEVELS.map(l=>l.id)).size,15);
  for(const type of ['boss','flight','run'])assert.equal(LEVELS.filter(l=>l.type===type).length,type==='boss'?9:3);
  assert.equal(new Set(LEVELS.filter(l=>l.type!=='run').map(l=>l.boss)).size,12);
});
test('route prerequisites and island gates unlock a complete campaign',()=>{
  const s=freshCampaign();assert.equal(levelUnlocked(s,'root-trouble'),true);assert.equal(levelUnlocked(s,'bramble-scramble'),true);assert.equal(levelUnlocked(s,'timber-time'),false);assert.equal(worldUnlocked(s,1),false);
  for(const l of LEVELS){assert.equal(levelUnlocked(s,l.id),true,l.id);completeLevel(s,l.id,win);}
  assert.equal(Object.keys(s.completed).length,15);assert.equal(worldUnlocked(s,2),true);assert.equal(superUnlocked(s,'shield'),true);assert.equal(superUnlocked(s,'storm'),true);
});
test('locked stages cannot pay rewards',()=>{const s=freshCampaign();assert.equal(completeLevel(s,'final-cut',win),0);assert.equal(s.coins,4);assert.deepEqual(s.completed,{});});
test('first-clear rewards and collected coins cannot be farmed',()=>{
  const s=freshCampaign();assert.equal(completeLevel(s,'bramble-scramble',win,[0,1,1,4]),5);assert.equal(s.coins,9);assert.equal(completeLevel(s,'bramble-scramble',win,[0,1,4]),0);assert.equal(completeLevel(s,'bramble-scramble',win,[0,1,2,3,4]),2);assert.equal(completeLevel(s,'bramble-scramble',{...win,difficulty:'gentle'},[2]),0);
});
test('shop checks balance, ownership and valid products',()=>{
  const s=freshCampaign();assert.equal(purchase(s,'weapon','seeker'),true);assert.equal(s.coins,0);assert.equal(purchase(s,'weapon','seeker'),false);assert.equal(purchase(s,'weapon','charge'),false);assert.equal(purchase(s,'weapon','missing'),false);assert.equal(purchase(s,'bad','heart'),false);
});
test('equip swaps occupied slots and cannot equip unowned weapons',()=>{
  const s=freshCampaign();assert.equal(equip(s,0,'spread'),true);assert.deepEqual(s.loadout,['spread','inkshot']);assert.equal(equip(s,1,'charge'),false);purchase(s,'weapon','seeker');equip(s,1,'seeker');assert.deepEqual(s.loadout,['spread','seeker']);
});
test('save roundtrip preserves purchases, grades and loadout',()=>{
  const s=freshCampaign();completeLevel(s,'root-trouble',win);purchase(s,'weapon','seeker');equip(s,1,'seeker');const restored=loadCampaign(JSON.stringify(s));assert.deepEqual(restored,s);
});
test('v1 boss scores migrate without unlocking unearned island gates',()=>{
  const s=loadCampaign(null,JSON.stringify({'0-regular':{grade:'S',time:30},'1-gentle':{grade:'A',time:40}}));assert.equal(s.completed['root-trouble'].regular.grade,'S');assert.equal(s.completed['fishy-business'].gentle.grade,'A');assert.equal(s.coins,8);assert.equal(worldUnlocked(s,1),false);assert.equal(completeLevel(s,'root-trouble',win),0);
});
test('corrupt save fields are discarded and loadout is safe',()=>{
  const s=loadCampaign(JSON.stringify({version:2,coins:-10,owned:['__proto__','nonsense'],charms:4,loadout:['charge','charge'],selected:'final-cut',super:'storm',completed:{'root-trouble':{regular:{grade:'F',time:0}}},collected:{'bramble-scramble':[0,0,-1,4,99,'2']}}));assert.equal(s.coins,4);assert.deepEqual(s.loadout,['inkshot','spread']);assert.equal(s.super,'blast');assert.equal(s.selected,'root-trouble');assert.deepEqual(s.collected['bramble-scramble'],[0,4]);assert.deepEqual(s.completed,{});
});
test('better grades win, then faster times, separately per difficulty',()=>{const s=freshCampaign();completeLevel(s,'root-trouble',win);completeLevel(s,'root-trouble',{...win,grade:'B',time:20});assert.equal(s.completed['root-trouble'].regular.grade,'A');completeLevel(s,'root-trouble',{...win,time:32});assert.equal(s.completed['root-trouble'].regular.time,32);completeLevel(s,'root-trouble',{...win,grade:'S',difficulty:'gentle'});assert.equal(s.completed['root-trouble'].gentle.grade,'S');});
test('weapon switch is edge-triggered and retains shared fire cooldown',()=>{const g=ready();step(g,{shoot:true});const cooldown=g.player.shootCooldown;step(g,{switch:true});assert.equal(g.player.slot,1);assert.ok(g.player.shootCooldown<cooldown);advance(g,5,{switch:true});assert.equal(g.player.slot,1);step(g);step(g,{switch:true});assert.equal(g.player.slot,0);});
test('scatter produces five short-range rays; inkshot produces one',()=>{const a=ready(),b=ready('root-trouble',{loadout:['spread','inkshot']});step(a,{shoot:true});step(b,{shoot:true});assert.equal(a.shots.length,1);assert.equal(b.shots.length,5);assert.equal(new Set(b.shots.map(s=>s.vy)).size,5);assert.ok(b.shots[0].life<a.shots[0].life);});
test('Firefly steers toward a target above the projectile',()=>{const g=ready('root-trouble',{loadout:['seeker','inkshot']});g.boss.y=80;step(g,{shoot:true});advance(g,8);assert.ok(g.shots[0].vy<0);});
test('Roundabout reverses direction and expires',()=>{const g=ready('root-trouble',{loadout:['boomerang','inkshot']});g.boss.y=-600;step(g,{shoot:true});advance(g,57);assert.ok(g.shots[0].vx<0);advance(g,100);assert.equal(g.shots.length,0);});
test('Blot Bomb has gravity and bounces off the ground',()=>{const g=ready('root-trouble',{loadout:['lobber','inkshot']});g.boss.y=-600;step(g,{shoot:true});const s=g.shots[0];assert.equal(s.gravity,650);s.y=FLOOR-s.h+1;s.vy=200;step(g);assert.ok(s.vy<0);});
test('Pressure Pen fires on release and rewards charging',()=>{const g=ready('root-trouble',{loadout:['charge','inkshot']});advance(g,65,{shoot:true});assert.equal(g.shots.length,0);step(g);assert.equal(g.shots.length,1);assert.equal(g.shots[0].damage,20);assert.equal(g.player.chargeTime,0);});
test('EX consumes one card and uses the equipped weapon',()=>{const g=ready('root-trouble',{loadout:['spread','inkshot']});g.player.ink=2;step(g,{ex:true});assert.equal(g.player.ink,1);assert.equal(g.shots.length,5);assert.ok(g.shots.every(s=>s.special&&s.weapon==='spread'));advance(g,3,{ex:true});assert.equal(g.player.ink,1);});
test('super arts consume five cards and have distinct effects',()=>{for(const superId of ['blast','shield','storm']){const g=ready('root-trouble',{super:superId});g.player.ink=5;step(g,{special:true});assert.equal(g.player.ink,0);if(superId==='shield')assert.equal(g.player.invuln,6);if(superId==='blast')assert.equal(g.shots[0].pierce,true);if(superId==='storm')assert.equal(g.shots.length,10);}});
test('charms affect health, damage, recharge, and dash recovery',()=>{const heart=ready('root-trouble',{charm:'heart'});assert.equal(heart.player.hp,4);step(heart,{shoot:true});assert.equal(heart.shots[0].damage,1.8);const coffee=ready('root-trouble',{charm:'coffee'});advance(coffee,60);assert.ok(coffee.player.ink>.11);const dash=ready('root-trouble',{charm:'dash'});step(dash,{dash:true});assert.equal(dash.player.dashCooldown,.47);});
test('aerial controls move vertically without gravity and stay in the arena',()=>{const g=ready('cloud-doubt');const y=g.player.y;advance(g,10);assert.equal(g.player.y,y);advance(g,200,{up:true});assert.equal(g.player.y,65);advance(g,200,{down:true});assert.equal(g.player.y,540-g.player.h-35);});
test('run stages scroll, land on one-way platforms and recover from pits',()=>{const g=ready('bramble-scramble');g.player.invuln=999;advance(g,110,{right:true});assert.ok(g.camera>0);g.player.x=520;g.player.y=270;g.player.vy=150;advance(g,10);assert.equal(g.player.y+g.player.h,354);g.player.x=1020;g.player.y=390;g.player.lastSafe=900;g.player.invuln=0;advance(g,60);assert.equal(g.player.hp,2);assert.equal(g.player.x,900);});
test('coins are collected once in-run and no new reward is issued for banked coins',()=>{const g=ready('bramble-scramble',{collected:[0]});for(const coin of g.coins){g.player.x=coin.x;g.player.y=coin.y;g.player.vy=0;step(g);}assert.deepEqual(g.collected,[1,2,3,4]);assert.ok(g.coins.every(c=>c.collected));});
test('all run-and-gun exits can be reached with movement and timed jumps',()=>{
  for(const l of LEVELS.filter(l=>l.type==='run')){const g=ready(l.id);g.player.invuln=999;
    for(let i=0;i<3600&&g.mode==='playing';i++){const p=g.player;const gap=g.ground.slice(0,-1).find((s,j)=>p.x>=s[0]&&p.x<g.ground[j+1][0]);const nearGap=gap&&gap[1]-p.x<80&&gap[1]-p.x>0;step(g,{right:true,shoot:true,jump:(p.grounded&&nearGap)||(!p.grounded&&p.vy<0)});}
    assert.equal(g.mode,'victory',l.id);assert.ok(g.camera>2000);assert.ok(g.elapsed<60);
  }
});
test('all twelve bosses can be cleared with starter shots',()=>{for(const l of LEVELS.filter(l=>l.type!=='run')){const g=ready(l.id);g.attackIn=1;g.player.invuln=999;for(let i=0;i<7200&&g.mode==='playing';i++)step(g,{shoot:true,jump:g.type==='boss'&&i%75<38,special:i%20===0});assert.equal(g.mode,'victory',l.id);}});

test('run-stage creation safely handles missing or malformed per-stage coin data',()=>{
  for(const collected of [undefined,null,{},'bad']){
    const g=createLevelGame('bramble-scramble','regular',{collected});
    assert.equal(g.coins.length,5);assert.ok(g.coins.every(c=>!c.banked));
  }
  const s=freshCampaign();s.selected='bramble-scramble';s.collected[s.selected]=[0,2];
  const loaded=loadCampaign(JSON.stringify(s));
  const g=createLevelGame(loaded.selected,loaded.difficulty,{...loaded,collected:loaded.collected[loaded.selected]});
  assert.deepEqual(g.coins.filter(c=>c.banked).map(c=>c.id),[0,2]);
});
test('switching during the intro selects the opening weapon without firing',()=>{const g=createGame();step(g,{switch:true,shoot:true});assert.equal(g.player.slot,1);assert.equal(g.shots.length,0);step(g,{switch:true});assert.equal(g.player.slot,1);});
test('Inkshot EX pierces different enemies without repeatedly damaging the same target',()=>{const g=ready('bramble-scramble');g.player.ink=1;g.enemies=[{x:200,y:380,w:38,h:40,hp:20,maxHp:20,home:200,kind:'turret',fire:100,flash:0},{x:290,y:380,w:38,h:40,hp:20,maxHp:20,home:290,kind:'turret',fire:100,flash:0}];step(g,{ex:true});advance(g,15);assert.deepEqual(g.enemies.map(e=>e.hp),[12,12]);});
