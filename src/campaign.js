import {LEVELS, WORLDS, WEAPONS, CHARMS, levelById} from './content.js';

export const SAVE_KEY = 'ink-and-trouble-campaign-v2';
export function freshCampaign() {
  return {version:2, coins:4, owned:['inkshot','spread'], charms:['none'], loadout:['inkshot','spread'], charm:'none', super:'blast', completed:{}, collected:{}, rewarded:[], selected:'root-trouble', difficulty:'regular'};
}
export function worldUnlocked(save, world) {
  return world === 0 || !!save.completed[WORLDS[world-1]?.gate];
}
export function levelUnlocked(save, id) {
  const l=levelById(id);
  return !!l && worldUnlocked(save,l.world) && l.requires.every(key=>!!save.completed[key]);
}
export function superUnlocked(save,id) {
  return id==='blast'||(id==='shield'&&!!save.completed['orchard-king'])||(id==='storm'&&!!save.completed['deep-encore']);
}
const rank={S:4,A:3,B:2,C:1};
export function completeLevel(save,id,result,coinIds=[]) {
  if(!levelById(id)||!levelUnlocked(save,id))return 0;
  let reward=0;
  if(!save.rewarded.includes(id)){reward+=2;save.rewarded.push(id);}
  const prior=new Set(save.collected[id]||[]);
  for(const coin of (levelById(id).type==='run'?coinIds:[]))if(Number.isInteger(coin)&&coin>=0&&coin<5&&!prior.has(coin)){prior.add(coin);reward++;}
  if(levelById(id).type==='run')save.collected[id]=[...prior];
  const key=result.difficulty==='gentle'?'gentle':'regular';
  save.completed[id]??={};
  const old=save.completed[id][key];
  if(!old||rank[result.grade]>rank[old.grade]||(result.grade===old.grade&&result.time<old.time))save.completed[id][key]={grade:result.grade,time:Math.max(.1,Math.round(result.time*10)/10)};
  save.coins+=reward;
  return reward;
}
export function purchase(save,kind,id) {
  const catalog=kind==='weapon'?WEAPONS:kind==='charm'?CHARMS:null;
  const owned=kind==='weapon'?save.owned:save.charms;
  if(!catalog?.[id]||owned.includes(id)||save.coins<catalog[id].price)return false;
  save.coins-=catalog[id].price;owned.push(id);return true;
}
export function equip(save,slot,id) {
  if(![0,1].includes(slot)||!save.owned.includes(id))return false;
  const other=1-slot;
  if(save.loadout[other]===id)[save.loadout[slot],save.loadout[other]]=[save.loadout[other],save.loadout[slot]];
  else save.loadout[slot]=id;
  return true;
}
export function loadCampaign(raw,legacyRaw=null) {
  const save=freshCampaign();
  let value;
  try{value=JSON.parse(raw);}catch{}
  if(value?.version===2){
    if(Number.isInteger(value.coins)&&value.coins>=0&&value.coins<=999)save.coins=value.coins;
    save.owned=[...new Set([...save.owned,...(Array.isArray(value.owned)?value.owned.filter(id=>Object.hasOwn(WEAPONS,id)):[])])];
    save.charms=[...new Set(['none',...(Array.isArray(value.charms)?value.charms.filter(id=>Object.hasOwn(CHARMS,id)):[])])];
    if(Array.isArray(value.loadout)&&value.loadout.length===2&&value.loadout.every(id=>save.owned.includes(id))&&value.loadout[0]!==value.loadout[1])save.loadout=[...value.loadout];
    if(save.charms.includes(value.charm))save.charm=value.charm;
    for(const l of LEVELS){
      const record=value.completed?.[l.id];
      if(record&&typeof record==='object')for(const mode of ['gentle','regular']){const r=record[mode];if(r&&Object.hasOwn(rank,r.grade)&&Number.isFinite(r.time)&&r.time>0){save.completed[l.id]??={};save.completed[l.id][mode]={grade:r.grade,time:r.time};}}
      if(Array.isArray(value.collected?.[l.id])&&l.type==='run')save.collected[l.id]=[...new Set(value.collected[l.id].filter(c=>Number.isInteger(c)&&c>=0&&c<5))];
    }
    save.rewarded=Array.isArray(value.rewarded)?[...new Set(value.rewarded.filter(id=>!!save.completed[id]))]:Object.keys(save.completed);
    if(superUnlocked(save,value.super))save.super=value.super;
    if(levelUnlocked(save,value.selected))save.selected=value.selected;
    if(value.difficulty==='gentle')save.difficulty='gentle';
  }else{
    // Preserve the three original boss records without erasing the old save.
    try{const old=JSON.parse(legacyRaw);for(const [i,id]of ['root-trouble','fishy-business','midnight-flutter'].entries())for(const mode of ['gentle','regular']){const r=old?.[`${i}-${mode}`];if(r&&Object.hasOwn(rank,r.grade)&&Number.isFinite(r.time)&&r.time>0){save.completed[id]??={};save.completed[id][mode]={grade:r.grade,time:r.time};}}}catch{}
    save.rewarded=Object.keys(save.completed);save.coins+=save.rewarded.length*2;
  }
  return save;
}
