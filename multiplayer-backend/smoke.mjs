import assert from 'node:assert/strict';
import { createGame } from '../src/engine.js';

const base = new URL('/api/relay', process.env.RELAY_BASE_URL || 'http://127.0.0.1:8787');
async function post(action, body) {
  const response = await fetch(base, {method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({action,...body})});
  return {status:response.status,data:await response.json()};
}
async function get(session) {
  const url = new URL(base);url.searchParams.set('code',session.code);
  const response = await fetch(url,{headers:{'X-Relay-Token':session.token}});return {status:response.status,data:await response.json()};
}
const host = (await post('create',{name:'Smoke Host',boss:0})).data;
assert.ok(host.code && host.token);
const attempts = await Promise.all(Array.from({length:10},(_,i)=>post('join',{code:host.code,name:`Smoke Guest ${i}`})));
const guests = attempts.flatMap((result,i)=>result.status===200?[{...result.data,name:`Smoke Guest ${i}`}]:[]);
assert.equal(guests.length,5,'concurrent joins must stop at six total players');
let result = await post('start',host);
assert.equal(result.status,200);
let room=result.data;
assert.equal(room.players.length,6);
assert.equal(room.maxTurns,18);
assert.equal(room.bossMax,1767);
assert.equal(room.isActor,true);
assert.equal((await post('join',{code:host.code,name:'Late Guest'})).status,409);
assert.equal((await post('snapshot',{...host,snapshot:{boss:{hp:0},mode:'victory'}})).status,400);
const fight=createGame(0,'gentle');fight.boss.maxHp=room.bossMax;fight.boss.hp=room.bossHp-15;fight.mode='playing';
const duplicate=await Promise.all([post('snapshot',{...host,snapshot:fight}),post('snapshot',{...host,snapshot:fight})]);
assert.deepEqual(duplicate.map(x=>x.status),[200,200]);
room=(await get(host)).data;
assert.equal(room.bossHp,room.bossMax-15);
assert.equal(room.players[0].damage,15,'duplicate snapshots must count damage once');
assert.ok(room.snapshot);
result=await post('support',{...guests[0],kind:'heal'});assert.equal(result.data.mySupport,'heal');
result=await post('support',{...guests[0],kind:'super'});assert.equal(result.data.mySupport,'heal');
fight.mode='defeat';fight.boss.hp=room.bossHp;
result=await post('snapshot',{...host,snapshot:fight});assert.equal(result.status,200);
assert.equal(result.data.turn,1);
assert.equal(result.data.actorName,room.players[1].name);
room=result.data;
const sessions=[{...host,name:'Smoke Host'},...guests];
while(room.phase==='active'){
  const actor=sessions.find(session=>session.name===room.actorName);
  assert.ok(actor,'every turn needs a valid actor');
  const turnFight=createGame(0,'gentle');turnFight.boss.maxHp=room.bossMax;turnFight.boss.hp=room.bossHp;turnFight.mode='defeat';
  const finishedTurn=await post('snapshot',{...actor,snapshot:turnFight});
  assert.equal(finishedTurn.status,200);
  room=finishedTurn.data;
}
assert.equal(room.phase,'lost');
assert.equal(room.turn,room.maxTurns);
const rematch=await post('rematch',host);
assert.equal(rematch.status,200);
assert.equal(rematch.data.phase,'lobby');
assert.ok(rematch.data.players.every(player=>player.damage===0));
const encore=await post('start',host);
assert.equal(encore.status,200);
const winningFight=createGame(0,'gentle');winningFight.boss.maxHp=encore.data.bossMax;winningFight.boss.hp=0;winningFight.mode='victory';
const win=await post('snapshot',{...host,snapshot:winningFight});
assert.equal(win.status,200);
assert.equal(win.data.phase,'won');
for(let i=0;i<8;i++){
  const raceHost=(await post('create',{name:'Race Host',boss:1})).data;
  assert.equal((await post('join',{code:raceHost.code,name:'Race Guest'})).status,200);
  const [lateJoin,raceStart]=await Promise.all([
    post('join',{code:raceHost.code,name:'Maybe Guest'}),
    post('start',raceHost),
  ]);
  assert.equal(raceStart.status,200,'start must survive a simultaneous join');
  assert.ok([200,409].includes(lateJoin.status));
  const raceRoom=(await get(raceHost)).data;
  assert.equal(raceRoom.players.length,lateJoin.status===200?3:2);
  assert.equal(raceRoom.maxTurns,raceRoom.players.length*3);
}
console.log('Relay smoke test passed: capacity, health balance, snapshots, support, turn order, loss, win, rematch, join/start races.');
