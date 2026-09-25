import {createLevelGame,step,grade} from './engine.js';
import {render,renderMap} from './art.js';
import {AudioBus} from './audio.js';
import {LEVELS,WORLDS,WEAPONS,CHARMS,SUPERS,TYPE_LABELS,levelById,BOSSES} from './content.js';
import {SAVE_KEY,loadCampaign,levelUnlocked,worldUnlocked,superUnlocked,completeLevel,purchase,equip} from './campaign.js';

const $=id=>document.getElementById(id),canvas=$('game'),ctx=canvas.getContext('2d'),overlay=$('overlay'),audio=new AudioBus();
let campaign;
try{campaign=loadCampaign(localStorage.getItem(SAVE_KEY),localStorage.getItem('ink-and-trouble-v1'));}catch{campaign=loadCampaign(null);}
let selected=campaign.selected,world=levelById(selected).world,game=createLevelGame(selected,campaign.difficulty,{...campaign,collected:campaign.collected[selected]}),screen='map';
let input={},keys=new Set(),touches=new Map(),latched=new Set(),last=0,accumulator=0,shownResult=false,mapTime=0,storageOK=true,armoryMode='shop';
let reducedMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const bindings={ArrowLeft:'left',KeyA:'left',ArrowRight:'right',KeyD:'right',ArrowUp:'up',KeyW:'up',ArrowDown:'down',KeyS:'down',Space:'jump',KeyZ:'shoot',KeyJ:'shoot',KeyX:'dash',ShiftLeft:'dash',ShiftRight:'dash',KeyC:'parry',KeyK:'parry',KeyV:'special',KeyL:'special',KeyF:'ex',KeyQ:'switch',KeyE:'switch'};
const symbol={boss:'⚑',flight:'✈',run:'➜'};
function syncInput(){input={};for(const code of keys)if(bindings[code])input[bindings[code]]=true;for(const action of touches.values())input[action]=true;for(const action of latched)input[action]=true;}
function clearInput(){keys.clear();touches.clear();latched.clear();input={};}
function persist(){try{localStorage.setItem(SAVE_KEY,JSON.stringify(campaign));storageOK=true;}catch{storageOK=false;}}
function setStatus(text){$('status-text').textContent=text;}
function button(id,label,kind='primary-button',disabled=false){return `<button id="${id}" class="${kind}" ${disabled?'disabled':''}>${label}</button>`;}
function panel(html,center=false){overlay.classList.toggle('center',center);overlay.innerHTML=`<div class="menu-card">${html}</div>`;overlay.hidden=false;}
function hideHud(){$('hud').hidden=true;$('charge').hidden=true;$('weapon-hud').hidden=true;}
function best(id){return campaign.completed[id]?.[campaign.difficulty];}
function updateChrome(){
  $('wallet').textContent='¢ '+campaign.coins;
  const count=Object.keys(campaign.completed).length;
  $('campaign-progress').innerHTML=`<span>${count} / ${LEVELS.length} STAGES CLEARED</span><div><i style="width:${count/LEVELS.length*100}%"></i></div>`;
  $('loadout-preview').innerHTML=`<span>YOUR POCKETS</span><strong>${WEAPONS[campaign.loadout[0]].icon} ${WEAPONS[campaign.loadout[0]].name} <b> / </b> ${WEAPONS[campaign.loadout[1]].icon} ${WEAPONS[campaign.loadout[1]].name}</strong><small>${CHARMS[campaign.charm].name} · ${SUPERS[campaign.super].name}</small>`;
  $('level-list').innerHTML=LEVELS.filter(l=>l.world===world).map((l,i)=>{const done=!!campaign.completed[l.id],unlocked=levelUnlocked(campaign,l.id),record=best(l.id);return `<button class="act-card ${l.id===selected?'selected':''} ${unlocked?'':'locked'}" data-level="${l.id}" aria-pressed="${l.id===selected}"><span class="act-number">${done?'✓':String(i+1).padStart(2,'0')}</span><span><small>${TYPE_LABELS[l.type]} ${unlocked?'':'· LOCKED'}</small><strong>${l.title}</strong><em>${record?`BEST ${record.grade} · ${record.time.toFixed(1)}s`:l.type==='run'?'5 collectible coins':BOSSES[l.boss].name}</em></span><b>${symbol[l.type]}</b></button>`;}).join('');
  for(const b of document.querySelectorAll('[data-level]'))b.onclick=()=>{selected=b.dataset.level;showMap();};
  $('map-button').classList.toggle('active',screen==='map');
}
function lockedReason(l){
  if(!worldUnlocked(campaign,l.world))return `Clear ${levelById(WORLDS[l.world-1].gate).title} to reach this island.`;
  return 'Clear '+l.requires.filter(id=>!campaign.completed[id]).map(id=>levelById(id).title).join(' and ')+' to open this route.';
}
function selectLevel(id){selected=id;if(levelUnlocked(campaign,id)){campaign.selected=id;persist();}showMap();}
function showMap(){
  screen='map';clearInput();hideHud();overlay.hidden=true;$('map-ui').hidden=false;$('map-summary').hidden=false;$('stage').classList.add('is-map');$('act-label').textContent='THE INKWELL ISLES · ISLAND '+(world+1);
  const l=levelById(selected);if(l.world!==world)selected=LEVELS.find(x=>x.world===world).id;
  const current=levelById(selected),unlocked=levelUnlocked(campaign,selected),record=best(selected);
  $('map-ui').innerHTML=`<div class="island-tabs" aria-label="Select island">${WORLDS.map(w=>`<button data-world="${w.id}" class="${w.id===world?'active':''}" aria-pressed="${w.id===world}"><small>ISLAND ${['I','II','III'][w.id]} ${worldUnlocked(campaign,w.id)?'':'· LOCKED'}</small><strong>${w.name}</strong></button>`).join('')}</div><div class="map-caption">SELECT A STAGE · FOLLOW THE TRAIL</div>${LEVELS.filter(l=>l.world===world).map((l,i)=>`<button class="map-node ${l.id===selected?'selected':''} ${campaign.completed[l.id]?'cleared':''} ${levelUnlocked(campaign,l.id)?'':'locked'}" data-node="${l.id}" style="left:${l.node[0]}%;top:${l.node[1]}%" aria-label="${l.title}, ${TYPE_LABELS[l.type]}, ${campaign.completed[l.id]?'cleared':levelUnlocked(campaign,l.id)?'available':'locked'}" aria-pressed="${l.id===selected}"><span>${campaign.completed[l.id]?'✓':symbol[l.type]}</span><small>${i+1}</small>${l.id===selected?`<em>${l.title}</em>`:''}</button>`).join('')}<div class="map-pip" style="left:${current.node[0]}%;top:${current.node[1]+8}%" aria-hidden="true"><svg viewBox="0 0 40 58"><path d="M20 2 5 24 9 37h22l4-13Z" fill="#f5e7c7" stroke="#30362e" stroke-width="3"/><path d="M20 3v13" stroke="#30362e" stroke-width="2"/><ellipse cx="15" cy="27" rx="3" ry="5" fill="#30362e"/><ellipse cx="25" cy="27" rx="3" ry="5" fill="#30362e"/><path d="M12 39h16v9H12Z" fill="#bb4e35" stroke="#30362e" stroke-width="2"/><path d="M14 49v6H7m19-6v6h7" fill="none" stroke="#30362e" stroke-width="4"/></svg></div><button class="map-shop" id="map-shop">¢ SHOP</button>`;
  $('map-summary').innerHTML=`<div><span class="eyebrow">${TYPE_LABELS[current.type]} · ${record?'BEST '+record.grade+' / '+record.time.toFixed(1)+'s':campaign.completed[selected]?'CLEARED':'FIRST CLEAR +2 COINS'}</span><h2>${current.title}</h2><p>${unlocked?current.tip:lockedReason(current)}</p></div><div class="summary-action"><label for="difficulty">DIFFICULTY</label><select id="difficulty" aria-label="Difficulty"><option value="regular" ${campaign.difficulty==='regular'?'selected':''}>Regular · 3 hearts</option><option value="gentle" ${campaign.difficulty==='gentle'?'selected':''}>Gentle · 6 hearts</option></select>${button('enter-stage',unlocked?'ENTER STAGE →':'ROUTE LOCKED','primary-button',!unlocked)}</div>`;
  $('difficulty').onchange=e=>{campaign.difficulty=e.target.value;persist();showMap();};$('enter-stage').onclick=levelMenu;$('map-shop').onclick=()=>openArmory('shop');
  for(const b of document.querySelectorAll('[data-world]'))b.onclick=()=>{world=Number(b.dataset.world);selected=LEVELS.find(l=>l.world===world).id;showMap();};
  for(const b of document.querySelectorAll('[data-node]'))b.onclick=()=>selectLevel(b.dataset.node);
  updateChrome();setStatus(Object.keys(campaign.completed).length===LEVELS.length?'The whole show is yours. Replay any stage for a better grade.':'Choose your next adventure. Q / E switches weapons in combat.');
}
function levelMenu(){
  if(!levelUnlocked(campaign,selected))return;
  campaign.selected=selected;persist();
  const l=levelById(selected);screen='menu';clearInput();game=createLevelGame(selected,campaign.difficulty,{...campaign,collected:campaign.collected[selected]});shownResult=false;
  hideHud();$('map-ui').hidden=true;$('map-summary').hidden=true;$('stage').classList.remove('is-map');$('act-label').textContent=l.title.toUpperCase();
  panel(`<p class="eyebrow">${TYPE_LABELS[l.type]} · ISLAND ${l.world+1}</p><div class="ornament">— ✦ —</div><h2>${l.title}</h2><p>${l.type==='run'?'Five coins. One finish line.':`Starring ${BOSSES[l.boss].name}`}<br>${campaign.difficulty==='gentle'?'GENTLE':'REGULAR'} · ${game.player.maxHp} HEARTS</p><div class="menu-loadout">${WEAPONS[campaign.loadout[0]].name} + ${WEAPONS[campaign.loadout[1]].name}</div>${button('start','LET’S MAKE TROUBLE →')}${button('back-map','BACK TO THE MAP','secondary-button')}`);
  $('start').onclick=start;$('back-map').onclick=showMap;updateChrome();$('start').focus({preventScroll:true});
}
function start(){
  game=createLevelGame(selected,campaign.difficulty,{...campaign,collected:campaign.collected[selected]});screen='game';shownResult=false;accumulator=0;clearInput();overlay.hidden=true;
  $('map-ui').hidden=true;$('map-summary').hidden=true;$('hud').hidden=false;$('charge').hidden=false;$('weapon-hud').hidden=false;
  setStatus(game.type==='flight'?'Arrow keys / WASD to fly · Z fire · Q switch · C parry':game.type==='run'?'Reach the exit · Collect coins · Z fire · Q switch · Space jump':'Q switches weapons · F spends one ink · V uses your super');
  canvas.focus({preventScroll:true});updateHUD();
}
function pause(){
  if(screen!=='game'||!['intro','playing'].includes(game.mode))return;
  game.resumeMode=game.mode;game.mode='paused';clearInput();
  panel(`<p class="eyebrow">A BRIEF INTERMISSION</p><h2>Hold that thought.</h2><p>${WEAPONS[game.player.loadout[0]].name} + ${WEAPONS[game.player.loadout[1]].name}<br>${game.type==='run'?'Coins are banked when you reach the exit.':'Take a breath. The show can wait.'}</p>${button('resume','BACK TO THE SHOW →')}${button('retry','RESTART STAGE','secondary-button')} ${button('quit','WORLD MAP','secondary-button')}`,true);
  $('resume').onclick=resume;$('retry').onclick=start;$('quit').onclick=showMap;setStatus('Paused. Take your time.');$('resume').focus({preventScroll:true});
}
function resume(){if(game.mode!=='paused')return;game.mode=game.resumeMode;game.previous={};overlay.hidden=true;clearInput();canvas.focus({preventScroll:true});setStatus('Back in the picture. Q / E to switch weapons.');}
function result(){
  shownResult=true;clearInput();
  if(game.mode==='victory'){
    const wasWorldOpen=world<2&&worldUnlocked(campaign,world+1);
    const reward=completeLevel(campaign,selected,{difficulty:campaign.difficulty,grade:grade(game),time:game.elapsed},game.collected);persist();updateChrome();
    const all=Object.keys(campaign.completed).length===LEVELS.length,newIsland=world<2&&!wasWorldOpen&&worldUnlocked(campaign,world+1);
    panel(`<p class="eyebrow">${all?'THE WHOLE SHOW IS YOURS':newIsland?'NEW ISLAND & SUPER UNLOCKED':'THAT’S A WRAP!'}</p><h2>${all?'A grand curtain call!':'A knockout performance!'}</h2><p>${newIsland?WORLDS[world+1].name+' is now open.':levelById(selected).title+' — cleared!'}</p><div class="result-stats"><span>GRADE<strong>${grade(game)}</strong></span><span>TIME<strong>${game.elapsed.toFixed(1)}s</strong></span><span>COINS<strong>+${reward}</strong></span></div>${button('next',newIsland?'SAIL TO ISLAND '+(world+2)+' →':'BACK TO THE MAP →')}${button('again','PLAY IT AGAIN','secondary-button')}`,true);
    $('next').onclick=()=>{if(newIsland){world++;selected=LEVELS.find(l=>l.world===world).id;}showMap();};$('again').onclick=start;
    setStatus(storageOK?(all?'All 15 stages cleared. Take a bow!':'Progress, rewards, and best performance saved.'):'Victory! Browser storage is unavailable; keep this page open to retain progress.');$('next').focus({preventScroll:true});
  }else{
    const progress=Math.round(game.type==='run'?game.player.x/game.worldWidth*100:(1-game.boss.hp/game.boss.maxHp)*100);
    panel(`<p class="eyebrow">A TEMPORARY INK-CIDENT</p><h2>Down, but not out.</h2><p>${progress}% of the way there.<br>${game.type==='run'?'Watch the gaps. Jump from the very edge.':'Try a different loadout, or switch to Gentle.'}</p>${button('retry','ONE MORE TAKE →')}${button('quit','WORLD MAP','secondary-button')}<p class="menu-note">R TO RETRY · SHOP FOR A NEW STRATEGY</p>`,true);
    $('retry').onclick=start;$('quit').onclick=showMap;setStatus('The show isn’t over. Try another take.');$('retry').focus({preventScroll:true});
  }
}
function updateHUD(){
  const p=game.player,l=levelById(selected);
  $('health').textContent='♥'.repeat(Math.max(0,p.hp))+'♡'.repeat(p.maxHp-Math.max(0,p.hp));$('health').setAttribute('aria-label',`${p.hp} of ${p.maxHp} health`);
  $('boss-name').textContent=game.type==='run'?`EXIT ${Math.min(100,Math.floor(p.x/game.worldWidth*100))}% · COINS ${game.coins.filter(c=>c.collected).length}/5`:BOSSES[l.boss].name.toUpperCase();
  $('boss-health').style.width=(game.type==='run'?100*p.x/game.worldWidth:100*game.boss.hp/game.boss.maxHp)+'%';
  const cards=Array.from({length:5},(_,i)=>`<i class="${p.ink>=i+1?'filled':''}"></i>`).join('');if($('charge-cards').innerHTML!==cards)$('charge-cards').innerHTML=cards;
  $('charge-hint').textContent=p.ink>=5?'V · SUPER READY':p.ink>=1?'F · EX READY':'HIT & PARRY';
  const weapon=p.loadout[p.slot];$('weapon-hud').innerHTML=`<strong style="color:${WEAPONS[weapon].color}">${WEAPONS[weapon].icon}</strong><span>${WEAPONS[weapon].name}${weapon==='charge'?` · ${Math.round(p.chargeTime/1.2*100)}%`:''}<small>Q / E → ${WEAPONS[p.loadout[1-p.slot]].name}</small></span>`;
}
function armory(){
  const owned=campaign.owned;
  $('armory-content').innerHTML=`<p class="eyebrow">${armoryMode==='shop'?'INK & CO. · FINE GOODS, QUESTIONABLE PRICES':'YOUR TOOLS OF THE TRADE'}</p><div class="armory-heading"><h2>${armoryMode==='shop'?'A little retail trouble.':'Make it your loadout.'}</h2><span>¢ ${campaign.coins}</span></div><p class="armory-intro">Equip two weapons and one charm. Switch weapons with <kbd>Q</kbd> or <kbd>E</kbd>. ${screen==='game'?'Equipment changes apply when you restart or enter the next stage.':'First clears pay two coins. Run-and-gun stages hide five more.'}</p><div class="equipped-slots"><span>A <strong>${WEAPONS[campaign.loadout[0]].name}</strong></span><span>B <strong>${WEAPONS[campaign.loadout[1]].name}</strong></span></div><h3>THE ARSENAL <small>6 DISTINCT WAYS TO MAKE A MESS</small></h3><div class="shop-grid">${Object.entries(WEAPONS).map(([id,w])=>{const has=owned.includes(id);return `<article class="shop-card ${has?'owned':''}"><div class="weapon-icon" style="--weapon-color:${w.color}">${w.icon}</div><div><h4>${w.name} <small>${has?'OWNED':'¢ '+w.price}</small></h4><p>${w.description}</p><small class="ex-note">EX: ${w.special}</small><div class="shop-actions">${has?[0,1].map(slot=>`<button data-equip="${id}" data-slot="${slot}" class="${campaign.loadout[slot]===id?'equipped':''}" aria-label="Equip ${w.name} in slot ${slot===0?'A':'B'}" aria-pressed="${campaign.loadout[slot]===id}">${campaign.loadout[slot]===id?'✓ ':''}SLOT ${slot===0?'A':'B'}</button>`).join(''):`<button data-buy="${id}" data-kind="weapon" ${campaign.coins<w.price?'disabled':''}>BUY · ¢ ${w.price}</button>`}</div></div></article>`;}).join('')}</div><h3>CHARMS <small>ONE SMALL ADVANTAGE</small></h3><div class="charm-grid">${Object.entries(CHARMS).map(([id,c])=>`<article class="charm-card"><h4>${c.name}</h4><p>${c.description}</p>${campaign.charms.includes(id)?`<button data-charm="${id}" class="${campaign.charm===id?'equipped':''}" aria-pressed="${campaign.charm===id}">${campaign.charm===id?'✓ EQUIPPED':'EQUIP'}</button>`:`<button data-buy="${id}" data-kind="charm" ${campaign.coins<c.price?'disabled':''}>BUY · ¢ ${c.price}</button>`}</article>`).join('')}</div><h3>SUPER ARTS <small>SPEND FIVE CARDS WITH V</small></h3><div class="super-grid">${Object.entries(SUPERS).map(([id,s])=>`<article class="charm-card"><h4>${s.name}</h4><p>${s.description}</p><button data-super="${id}" class="${campaign.super===id?'equipped':''}" ${superUnlocked(campaign,id)?'':'disabled'} aria-pressed="${campaign.super===id}">${campaign.super===id?'✓ EQUIPPED':superUnlocked(campaign,id)?'EQUIP':'LOCKED'}</button></article>`).join('')}</div><p id="shop-status" role="status">${storageOK?'Purchases and equipment save automatically.':'Storage unavailable. Purchases last for this session.'}</p>`;
  for(const b of document.querySelectorAll('[data-buy]'))b.onclick=()=>{if(purchase(campaign,b.dataset.kind,b.dataset.buy)){persist();updateChrome();armory();$('shop-status').textContent='Purchased '+(WEAPONS[b.dataset.buy]||CHARMS[b.dataset.buy]).name+'. Choose a slot to equip it.';}};
  for(const b of document.querySelectorAll('[data-equip]'))b.onclick=()=>{equip(campaign,Number(b.dataset.slot),b.dataset.equip);persist();updateChrome();armory();};
  for(const b of document.querySelectorAll('[data-charm]'))b.onclick=()=>{campaign.charm=b.dataset.charm;persist();updateChrome();armory();};
  for(const b of document.querySelectorAll('[data-super]'))b.onclick=()=>{if(superUnlocked(campaign,b.dataset.super)){campaign.super=b.dataset.super;persist();updateChrome();armory();}};
}
function openArmory(mode){pause();clearInput();armoryMode=mode;armory();$('armory').showModal();}
$('armory').addEventListener('close',()=>{if(screen==='menu')levelMenu();});
$('close-armory').onclick=()=>$('armory').close();$('shop-button').onclick=()=>openArmory('shop');$('loadout-button').onclick=()=>openArmory('loadout');$('map-button').onclick=showMap;
$('fullscreen').onclick=async()=>{try{if(document.fullscreenElement)await document.exitFullscreen();else await $('stage').requestFullscreen();}catch{setStatus('Fullscreen is unavailable in this browser.');}};

document.addEventListener('keydown',e=>{
  if($('instructions').open||$('armory').open||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;
  if(screen==='map'&&!e.repeat){
    const levels=LEVELS.filter(l=>l.world===world),i=levels.findIndex(l=>l.id===selected);
    if(['ArrowRight','ArrowDown','KeyD','KeyS','ArrowLeft','ArrowUp','KeyA','KeyW'].includes(e.code)){e.preventDefault();const dir=['ArrowRight','ArrowDown','KeyD','KeyS'].includes(e.code)?1:-1;selectLevel(levels[(i+dir+levels.length)%levels.length].id);}
    if(e.code==='Enter'&&!['BUTTON','A'].includes(e.target.tagName)){e.preventDefault();levelMenu();}
  }
  if(bindings[e.code]&&screen==='game'&&['playing','intro'].includes(game.mode)){e.preventDefault();keys.add(e.code);if(!e.repeat)latched.add(bindings[e.code]);syncInput();}
  if(e.repeat)return;
  if(e.code==='Escape'||e.code==='KeyP'){e.preventDefault();if(game.mode==='paused'&&screen==='game')resume();else if(screen==='menu')showMap();else pause();}
  if(e.code==='KeyR'&&screen==='game'&&game.mode==='defeat')start();
});
document.addEventListener('keyup',e=>{keys.delete(e.code);syncInput();});
for(const b of document.querySelectorAll('[data-key]')){
  b.addEventListener('pointerdown',e=>{e.preventDefault();b.setPointerCapture(e.pointerId);touches.set(e.pointerId,b.dataset.key);latched.add(b.dataset.key);syncInput();});
  for(const name of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(name,e=>{touches.delete(e.pointerId);syncInput();});
}
$('pause').onclick=pause;$('how-to').onclick=()=>{pause();clearInput();$('instructions').showModal();};$('close-help').onclick=()=>$('instructions').close();
$('sound').onclick=async()=>{const on=await audio.toggle();$('sound').textContent='Sound: '+(on?'on':'off');$('sound').setAttribute('aria-pressed',String(on));};
function motionLabel(){$('motion').textContent='Motion: '+(reducedMotion?'reduced':'full');$('motion').setAttribute('aria-pressed',String(reducedMotion));document.body.classList.toggle('reduced-motion',reducedMotion);}
motionLabel();$('motion').onclick=()=>{reducedMotion=!reducedMotion;motionLabel();};
window.addEventListener('blur',()=>{clearInput();pause();});document.addEventListener('visibilitychange',()=>{if(document.hidden){clearInput();pause();}});
function frame(now){
  const delta=Math.min((now-last)/1000||0,.1);last=now;
  if(screen==='map'){mapTime+=delta;renderMap(ctx,world,mapTime,reducedMotion);}
  else{
    if(screen==='menu')game.time+=delta;
    else{accumulator+=delta;while(accumulator>=1/60){step(game,input,1/60);latched.clear();syncInput();for(const e of game.events)audio.play(e);accumulator-=1/60;}if(!shownResult&&['victory','defeat'].includes(game.mode))result();updateHUD();}
    render(ctx,game,{menu:screen==='menu',reducedMotion});
  }
  requestAnimationFrame(frame);
}
showMap();requestAnimationFrame(frame);
