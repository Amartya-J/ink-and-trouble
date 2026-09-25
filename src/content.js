// All campaign content lives here; stable IDs keep saves compatible as art evolves.
export const WEAPONS = {
  inkshot: { name: 'Inkshot', icon: '•', color: '#64c5d4', price: 0, rate: .115, damage: 2, speed: 820, life: 1.5, description: 'Reliable, long-range ink. Hold fire and keep moving.', special: 'A piercing ribbon of ink.' },
  spread: { name: 'Scatter', icon: '⋔', color: '#ee845f', price: 0, rate: .23, damage: 1.8, speed: 650, life: .48, description: 'Five close-range pellets. Get close for big damage.', special: 'A wide fan of heavy pellets.' },
  seeker: { name: 'Firefly', icon: '✧', color: '#91c98b', price: 4, rate: .17, damage: 1.35, speed: 480, life: 2.6, description: 'Homing sparks follow targets. Lower damage, easier aim.', special: 'Three powerful seeking sparks.' },
  lobber: { name: 'Blot Bomb', icon: '●', color: '#b699d1', price: 4, rate: .4, damage: 8, speed: 520, life: 2.5, description: 'Heavy bouncing ink bombs. Best fired from mid-range.', special: 'One oversized bouncing bomb.' },
  boomerang: { name: 'Roundabout', icon: '↶', color: '#e0be64', price: 4, rate: .2, damage: 3.4, speed: 610, life: 1.9, description: 'Arcing shots turn back. Fire away, then catch enemies on the return.', special: 'A giant returning ink wheel.' },
  charge: { name: 'Pressure Pen', icon: '◆', color: '#e8a0b8', price: 5, rate: .25, damage: 3, speed: 1050, life: 1.4, description: 'Hold fire for a second, release for a heavy blast.', special: 'An instant fully charged shot.' },
};
export const CHARMS = {
  none: { name: 'No charm', price: 0, description: 'Just you and your ink.' },
  heart: { name: 'Spare Heart', price: 3, description: '+1 heart, but your shots deal 10% less damage.' },
  coffee: { name: 'Midnight Coffee', price: 4, description: 'Slowly fills your ink meter, even when you miss.' },
  dash: { name: 'Quick Soles', price: 3, description: 'Dash recovers 35% faster.' },
};
export const SUPERS = {
  blast: { name: 'Ink Express', description: 'A massive piercing beam. Costs five cards.' },
  shield: { name: 'Paper Halo', description: 'Six seconds of invulnerability. Clear island I to unlock.' },
  storm: { name: 'Inkstorm', description: 'A shower of ink homes into enemies. Clear island II to unlock.' },
};
export const WORLDS = [
  { id: 0, name: 'Bramble Borough', subtitle: 'Where the trouble takes root', color: '#8caa6c', gate: 'orchard-king' },
  { id: 1, name: 'Brinewater Bay', subtitle: 'A swell place to lose your hat', color: '#6a9f9d', gate: 'deep-encore' },
  { id: 2, name: 'Midnight Midway', subtitle: 'The show must go wrong', color: '#928399', gate: 'final-cut' },
];
export const BOSSES = [
  {name:'Rootsy the Radish',title:'The Root of All Trouble',world:0,hp:190,art:'radish',pattern:'seeds',warning:['SEED SPIT!','ROOT RUMBLE!','HARVEST HAVOC!']},
  {name:'Baron Bubbles',title:'A Fishy Business',world:1,hp:240,art:'fish',pattern:'bubbles',warning:['BUBBLE TROUBLE!','HIGH TIDE!','ALL HANDS ON DECK!']},
  {name:'Madame Moth',title:'The Midnight Flutter',world:2,hp:275,art:'moth',pattern:'stars',warning:['STAR STRUCK!','MOON DANCE!','FINAL ENCORE!']},
  {name:'Tick Tock Timber',title:'Out of the Woods',world:0,hp:210,art:'clock',pattern:'clock',warning:['TICK TOCK!','PENDULUM PANIC!','OVERTIME!']},
  {name:'Captain Cumulus',title:'Clouds of Doubt',world:0,hp:220,art:'cloud',pattern:'storm',flying:true,warning:['RAIN CHECK!','THUNDERHEAD!','STORM WARNING!']},
  {name:'King Croak',title:'A Royal Ribbit',world:0,hp:270,art:'frog',pattern:'frog',warning:['HOP TO IT!','ROYAL RICOCHET!','LONG LIVE THE KING!']},
  {name:'Clack the Crustacean',title:'Claws for Concern',world:1,hp:260,art:'crab',pattern:'crab',warning:['SHELL SHOCK!','CRAB WALK!','SNAP TO IT!']},
  {name:'Admiral Albatross',title:'Flight of the Fancy',world:1,hp:270,art:'bird',pattern:'feathers',flying:true,warning:['FEATHER FLURRY!','DIVE DIVE DIVE!','BIRDS OF A FEATHER!']},
  {name:'Maestro Inktopus',title:'Deep Sea Encore',world:1,hp:310,art:'squid',pattern:'tentacles',warning:['INKCOMING!','EIGHT ARMED ENCORE!','THE DEEP END!']},
  {name:'Cinderwick',title:'Burning the Midnight Oil',world:2,hp:280,art:'candle',pattern:'flame',warning:['HOT FOOT!','WAX ATTACK!','BURNING BRIGHT!']},
  {name:'Luna the Lantern',title:'Moonlight Mischief',world:2,hp:300,art:'moon',pattern:'orbit',flying:true,warning:['LUNAR LOOP!','ORBITAL ODDITY!','TOTAL ECLIPSE!']},
  {name:'The Projectionist',title:'The Final Cut',world:2,hp:390,art:'projector',pattern:'film',warning:['ROLL CAMERA!','CUT TO CHAOS!','THAT’S ALL, FOLKS!']},
];
const level = (id,world,title,type,boss,node,requires=[],tip='') => ({id,world,title,type,boss,node,requires,tip});
export const LEVELS = [
  level('root-trouble',0,'The Root of All Trouble','boss',0,[23,66],[],'Jump the low seeds. Pink seeds can be parried.'),
  level('bramble-scramble',0,'Bramble Scramble','run',null,[29,33],[],'Collect five coins, clear the hedgerows, and reach the exit.'),
  level('timber-time',0,'Out of the Woods','boss',3,[48,55],['root-trouble'],'Watch the falling gears and the sweeping pendulum.'),
  level('cloud-doubt',0,'Clouds of Doubt','flight',4,[55,23],['bramble-scramble'],'Fly in all directions. Dash through the rain curtain.'),
  level('orchard-king',0,'A Royal Ribbit','boss',5,[74,40],['root-trouble','bramble-scramble','timber-time','cloud-doubt'],'Defeat the king to open the crossing to Brinewater Bay.'),
  level('fishy-business',1,'A Fishy Business','boss',1,[22,65],[],'Bubbles bounce. Firefly can follow targets while you evade.'),
  level('pier-pressure',1,'Pier Pressure','run',null,[32,31],[],'Cross the docks and collect the coins above the crates.'),
  level('claws-concern',1,'Claws for Concern','boss',6,[48,59],['fishy-business'],'Stay ready to jump the shells rolling across the deck.'),
  level('flight-fancy',1,'Flight of the Fancy','flight',7,[59,24],['pier-pressure'],'Find the gaps between the rows of feathers.'),
  level('deep-encore',1,'Deep Sea Encore','boss',8,[76,43],['fishy-business','pier-pressure','claws-concern','flight-fancy'],'The maestro is conducting a rising tide of ink.'),
  level('midnight-flutter',2,'The Midnight Flutter','boss',2,[22,62],[],'Switch to Firefly when Madame Moth rises out of reach.'),
  level('backlot-dash',2,'Backlot Dash','run',null,[32,29],[],'Dodge the haunted props and escape the backlot.'),
  level('midnight-oil',2,'Burning the Midnight Oil','boss',9,[48,57],['midnight-flutter'],'Jump the embers; watch for falling wax.'),
  level('moonlight-mischief',2,'Moonlight Mischief','flight',10,[58,23],['backlot-dash'],'Keep moving between the rotating rings of stars.'),
  level('final-cut',2,'The Final Cut','boss',11,[76,42],['midnight-flutter','backlot-dash','midnight-oil','moonlight-mischief'],'The director changes tactics every phase. Bring both weapons.'),
];
export const levelById = id => LEVELS.find(l=>l.id===id);
export const TYPE_LABELS = {boss:'BOSS BATTLE',run:'RUN & GUN',flight:'AERIAL BATTLE'};
