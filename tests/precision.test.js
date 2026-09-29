import test from 'node:test';
import assert from 'node:assert/strict';
import {createGame,step,FLOOR} from '../src/engine.js';
const play=()=>{const g=createGame();g.mode='playing';g.attackIn=10;return g;};
test('duck keeps feet planted, reduces hitbox and stops walking',()=>{
 const g=play();step(g,{down:true,right:true});assert.equal(g.player.h,36);assert.equal(g.player.y+g.player.h,FLOOR);assert.equal(g.player.x,140);
 step(g,{});assert.equal(g.player.h,64);assert.equal(g.player.y+g.player.h,FLOOR);
});
test('aim lock holds position and fires down-left diagonally',()=>{
 const g=play();step(g,{lock:true,left:true,down:true,shoot:true});assert.equal(g.player.x,140);assert.equal(g.player.h,64);assert.ok(g.shots[0].vx<0);assert.ok(g.shots[0].vy>0);
});
test('a second jump press parries airborne pink shots',()=>{
 const g=play();step(g,{jump:true});assert.equal(g.player.parry,0);step(g,{});
 const p=g.player;g.hazards.push({x:p.x,y:p.y,w:20,h:20,r:10,vx:0,vy:0,age:0,life:5,pink:true,kind:'seed'});
 step(g,{jump:true});assert.equal(g.parries,1);assert.ok(p.vy<0);assert.equal(p.hp,3);
});
test('phase transitions clear old bullets and delay the next volley',()=>{
 const g=play();g.boss.hp=g.boss.maxHp*.6;g.attackIn=0;g.hazards.push({x:900,y:0,w:20,h:20,vx:0,vy:0,life:5,age:0});step(g,{});
 assert.equal(g.phase,1);assert.ok(g.transition>0);assert.equal(g.hazards.length,0);assert.equal(g.attackCount,0);
 for(let i=0;i<110;i++)step(g,{});assert.equal(g.transition,0);assert.ok(g.attackCount>0);
});
test('ducking avoids a projectile that hits standing height',()=>{
 for(const duck of [true,false]){const g=play();g.hazards.push({x:145,y:FLOOR-60,w:12,h:12,r:6,vx:0,vy:0,life:5,age:0,kind:'seed'});step(g,{down:duck});assert.equal(g.player.hp,duck?3:2);}
});
