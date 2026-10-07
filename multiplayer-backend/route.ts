import { env } from "cloudflare:workers";

type Room = { code:string; host_token:string; phase:string; boss:number; boss_hp:number; boss_max:number; turn:number; actor_index:number; max_turns:number; deadline:number; snapshot:string|null; created_at:number };
type Player = { token:string; name:string; joined_at:number; damage:number };
type Support = { id:number; player_token:string; kind:string; turn:number };
const TIME = 35;
const BOSS_HP = [190,240,275];
const db = () => { if (!env.DB) throw Error("Room storage is unavailable"); return env.DB; };
const now = () => Math.floor(Date.now()/1000);
async function retryBusy<T>(operation:()=>Promise<T>):Promise<T> {
  for(let attempt=0;;attempt++)try{return await operation();}
  catch(error){if(attempt>=3||!/SQLITE_BUSY|database is locked/i.test(String(error)))throw error;
    await new Promise(resolve=>setTimeout(resolve,20*(attempt+1)**2));}
}
const reply = (body:unknown,status=200) => Response.json(body,{status,headers:{"Cache-Control":"no-store"}});
const nameOf = (value:unknown) => String(value||"").trim().replace(/\s+/g," ").slice(0,20);
const codeOf = (value:unknown) => String(value||"").trim().toUpperCase();
const playerList = async(code:string) => (await db().prepare("SELECT token, name, joined_at, damage FROM relay_players WHERE room_code = ? ORDER BY joined_at, rowid").bind(code).all<Player>()).results;

async function advance(room:Room):Promise<Room> {
  if (room.phase!=="active" || room.deadline>now()) return room;
  const players=await playerList(room.code);
  const nextTurn=room.turn+1;
  await retryBusy(()=>db().prepare("UPDATE relay_rooms SET phase = ?, turn = ?, actor_index = ?, deadline = ?, snapshot = NULL WHERE code = ? AND phase = 'active' AND turn = ?")
    .bind(nextTurn>=room.max_turns?"lost":"active",nextTurn,(room.actor_index+1)%Math.max(1,players.length),now()+TIME,room.code,room.turn).run());
  return (await db().prepare("SELECT * FROM relay_rooms WHERE code = ?").bind(room.code).first<Room>())!;
}

async function roomState(code:string,token:string) {
  let room=await db().prepare("SELECT * FROM relay_rooms WHERE code = ?").bind(code).first<Room>();
  if(!room)return reply({error:"Room not found"},404);
  room=await advance(room);
  const players=await playerList(code);
  const index=players.findIndex(p=>p.token===token);
  if(index<0)return reply({error:"This device is not in the room"},403);
  const supports=(await db().prepare("SELECT rowid AS id, player_token, kind, turn FROM relay_supports WHERE room_code = ? AND turn = ? ORDER BY rowid").bind(code,room.turn).all<Support>()).results;
  let snapshot=null;
  if(room.snapshot)try{snapshot=JSON.parse(room.snapshot)}catch{}
  return reply({code,phase:room.phase,boss:room.boss,bossHp:room.boss_hp,bossMax:room.boss_max,turn:room.turn,maxTurns:room.max_turns,deadline:room.deadline,serverTime:now(),isHost:room.host_token===token,isActor:room.phase==="active"&&players[room.actor_index]?.token===token,actorName:players[room.actor_index]?.name||"",me:{name:players[index].name},players:players.map((p,i)=>({name:p.name,damage:Math.round(p.damage),isHost:p.token===room.host_token,isActor:i===room.actor_index})),supports:supports.map(s=>({id:s.id,name:players.find(p=>p.token===s.player_token)?.name||"Teammate",kind:s.kind})),mySupport:supports.find(s=>s.player_token===token)?.kind||null,snapshot});
}

export async function GET(request:Request) {
  try{const url=new URL(request.url);return await roomState(codeOf(url.searchParams.get("code")),request.headers.get("X-Relay-Token")||url.searchParams.get("token")||"");}
  catch(error){console.error(error);return reply({error:"Could not load the relay. Try again."},500);}
}

export async function POST(request:Request) {
  try{
    const input=await request.json() as Record<string,unknown>;
    const action=String(input.action||"");const code=codeOf(input.code);const token=String(input.token||"");const d=db();
    if(action==="create"){
      const name=nameOf(input.name);const boss=Number(input.boss);
      if(!name)return reply({error:"Enter your name"},400);
      if(!Number.isInteger(boss)||boss<0||boss>2)return reply({error:"Choose a headliner"},400);
      const playerToken=crypto.randomUUID();const alphabet="ABCDEFGHJKLMNPQRSTUVWXYZ23456789";
      for(let i=0;i<5;i++){
        const bytes=crypto.getRandomValues(new Uint8Array(6));const newCode=Array.from(bytes,b=>alphabet[b%alphabet.length]).join("");
        try{await retryBusy(()=>d.batch([
          d.prepare("INSERT INTO relay_rooms (code,host_token,phase,boss,boss_hp,boss_max,turn,actor_index,max_turns,deadline,created_at) VALUES (?,?,'lobby',?,0,0,0,0,0,0,?)").bind(newCode,playerToken,boss,now()),
          d.prepare("INSERT INTO relay_players (token,room_code,name,joined_at,damage) VALUES (?,?,?,?,0)").bind(playerToken,newCode,name,now()),
        ]));
          return reply({code:newCode,token:playerToken});}catch(error){if(i===4)throw error;}
      }
    }
    if(!/^[A-Z2-9]{6}$/.test(code))return reply({error:"Enter a six-character room code"},400);
    let room=await d.prepare("SELECT * FROM relay_rooms WHERE code = ?").bind(code).first<Room>();
    if(!room)return reply({error:"Room not found"},404);
    room=await advance(room);
    if(action==="join"){
      const name=nameOf(input.name);if(!name)return reply({error:"Enter your name"},400);
      if(room.phase!=="lobby")return reply({error:"This relay has already started"},409);
      const playerToken=crypto.randomUUID();
      const joined=await retryBusy(()=>d.prepare("INSERT INTO relay_players (token,room_code,name,joined_at,damage) SELECT ?,?,?,?,0 WHERE EXISTS (SELECT 1 FROM relay_rooms WHERE code=? AND phase='lobby') AND (SELECT COUNT(*) FROM relay_players WHERE room_code=?)<6")
        .bind(playerToken,code,name,now(),code,code).run());
      if(!joined.meta.changes)return reply({error:"This room has started or is full"},409);
      return reply({code,token:playerToken});
    }
    const players=await playerList(code);const me=players.find(p=>p.token===token);
    if(!me)return reply({error:"This device is not in the room"},403);
    if(action==="leave"){
      if(room.phase==="active")return reply({error:"Finish this relay before leaving the cast"},409);
      const allowed="('lobby','won','lost')";
      const result=await retryBusy(()=>d.batch([
        d.prepare(`DELETE FROM relay_supports WHERE player_token=? AND room_code=? AND EXISTS (SELECT 1 FROM relay_rooms WHERE code=? AND phase IN ${allowed})`).bind(token,code,code),
        d.prepare(`DELETE FROM relay_players WHERE token=? AND room_code=? AND EXISTS (SELECT 1 FROM relay_rooms WHERE code=? AND phase IN ${allowed})`).bind(token,code,code),
        d.prepare(`UPDATE relay_rooms SET host_token=(SELECT token FROM relay_players WHERE room_code=? ORDER BY joined_at,rowid LIMIT 1) WHERE code=? AND host_token=? AND phase IN ${allowed} AND EXISTS (SELECT 1 FROM relay_players WHERE room_code=?)`).bind(code,code,token,code),
        d.prepare(`DELETE FROM relay_rooms WHERE code=? AND phase IN ${allowed} AND NOT EXISTS (SELECT 1 FROM relay_players WHERE room_code=?)`).bind(code,code),
      ]));
      if(!result[1].meta.changes)return reply({error:"This relay is already underway"},409);
      return reply({left:true});
    }
    if(action==="start"){
      if(room.host_token!==token)return reply({error:"Only the host can start"},403);
      if(room.phase!=="lobby")return reply({error:"The relay has already started"},409);
      const count="(SELECT COUNT(*) FROM relay_players WHERE room_code=relay_rooms.code)";
      const scale=`(3.7+1.4*(${count}-2))`;
      const started=await retryBusy(()=>d.prepare(`UPDATE relay_rooms SET phase='active',boss_hp=ROUND(?*${scale}),boss_max=ROUND(?*${scale}),turn=0,actor_index=0,max_turns=${count}*3,deadline=?,snapshot=NULL WHERE code=? AND phase='lobby' AND ${count} BETWEEN 2 AND 6`)
        .bind(BOSS_HP[room.boss],BOSS_HP[room.boss],now()+TIME,code).run());
      if(!started.meta.changes)return reply({error:"At least two players are needed to start"},409);
      return roomState(code,token);
    }
    if(action==="support"){
      const kind=String(input.kind||"");if(!["shield","heal","super"].includes(kind))return reply({error:"Choose a support card"},400);
      if(room.phase!=="active"||room.deadline<=now())return reply({error:"This turn has ended"},409);
      if(players[room.actor_index]?.token===token)return reply({error:"The active player cannot send support"},403);
      await retryBusy(()=>d.prepare("INSERT OR IGNORE INTO relay_supports (room_code,player_token,turn,kind) VALUES (?,?,?,?)").bind(code,token,room.turn,kind).run());
      return roomState(code,token);
    }
    if(action==="snapshot"){
      if(room.phase!=="active"||room.deadline<=now())return reply({error:"This turn has ended"},409);
      if(players[room.actor_index]?.token!==token)return reply({error:"Only the active player can update the fight"},403);
      const snapshot=input.snapshot;
      const serialized=JSON.stringify(snapshot);
      if(!serialized||serialized.length>80000||typeof snapshot!=="object"||!snapshot)return reply({error:"Invalid fight update"},400);
      const fighter=snapshot as {act?:number;boss?:{hp?:number;maxHp?:number};player?:{hp?:number;x?:number;y?:number};mode?:string;shots?:unknown[];hazards?:unknown[];particles?:unknown[]};
      if(fighter.act!==room.boss||!["intro","playing","victory","defeat"].includes(fighter.mode||"")||
        !fighter.player||![fighter.player.hp,fighter.player.x,fighter.player.y].every(v=>Number.isFinite(v))||
        !Array.isArray(fighter.shots)||!Array.isArray(fighter.hazards)||!Array.isArray(fighter.particles))return reply({error:"Invalid fight update"},400);
      const reported=Number(fighter.boss?.hp);
      if(!Number.isFinite(reported))return reply({error:"Invalid boss health"},400);
      const hp=Math.max(0,Math.min(room.boss_hp,reported));const delta=Math.max(0,room.boss_hp-hp);
      fighter.boss!.hp=hp;fighter.boss!.maxHp=room.boss_max;
      const done=fighter.mode==="defeat"||fighter.mode==="victory";
      const phase=hp<=0?"won":done&&room.turn+1>=room.max_turns?"lost":"active";
      const nextTurn=done&&hp>0?room.turn+1:room.turn;
      const updated=await retryBusy(()=>d.prepare("UPDATE relay_rooms SET boss_hp=?,phase=?,turn=?,actor_index=?,deadline=?,snapshot=? WHERE code=? AND phase='active' AND turn=? AND boss_hp=?")
        .bind(hp,phase,nextTurn,done&&hp>0?(room.actor_index+1)%players.length:room.actor_index,done&&hp>0?now()+TIME:room.deadline,done&&hp>0?null:JSON.stringify(fighter),code,room.turn,room.boss_hp).run());
      if(updated.meta.changes&&delta)await retryBusy(()=>d.prepare("UPDATE relay_players SET damage=damage+? WHERE token=? AND room_code=?").bind(delta,token,code).run());
      return roomState(code,token);
    }
    if(action==="rematch"){
      if(room.host_token!==token)return reply({error:"Only the host can restart"},403);
      if(!["won","lost"].includes(room.phase))return reply({error:"Finish this relay first"},409);
      await retryBusy(()=>d.batch([d.prepare("DELETE FROM relay_supports WHERE room_code=?").bind(code),d.prepare("UPDATE relay_players SET damage=0 WHERE room_code=?").bind(code),d.prepare("UPDATE relay_rooms SET phase='lobby',boss_hp=0,boss_max=0,turn=0,actor_index=0,max_turns=0,deadline=0,snapshot=NULL WHERE code=?").bind(code)]));
      return roomState(code,token);
    }
    return reply({error:"Unknown action"},400);
  }catch(error){console.error(error);return reply({error:"Something went wrong. Please try again."},500);}
}
