import {FLOOR,WIDTH,HEIGHT} from './engine.js';
import {BOSSES, WORLDS, WEAPONS} from './content.js';
const ink='#30362e',paper='#f6e8c8';
function ellipse(c,x,y,rx,ry,fill,stroke=ink,lw=3){c.beginPath();c.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,Math.PI*2);c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function path(c,points,fill,stroke=ink,lw=3){c.beginPath();for(let i=0;i<points.length;i++){const p=points[i];if(i===0)c.moveTo(...p);else c.lineTo(...p);}c.closePath();if(fill){c.fillStyle=fill;c.fill();}if(stroke){c.strokeStyle=stroke;c.lineWidth=lw;c.stroke();}}
function line(c,points,color=ink,lw=4){c.beginPath();c.moveTo(...points[0]);for(const p of points.slice(1))c.lineTo(...p);c.strokeStyle=color;c.lineWidth=lw;c.lineCap='round';c.lineJoin='round';c.stroke();}
function curve(c,start,cp1,cp2,end,color=ink,lw=5){c.beginPath();c.moveTo(...start);c.bezierCurveTo(...cp1,...cp2,...end);c.lineWidth=lw;c.strokeStyle=color;c.lineCap='round';c.stroke();}
function text(c,s,x,y,size=20,color=ink){c.fillStyle=color;c.font=`bold ${size}px Georgia`;c.textAlign='center';c.fillText(s,x,y);}
function eyes(c,x,y,scale=1,angry=false){c.save();c.translate(x,y);c.scale(scale,scale);for(const dx of [-20,20]){ellipse(c,dx,0,17,25,paper);ellipse(c,dx-5,3,6,13,ink,null);ellipse(c,dx-7,-2,2,4,paper,null);}if(angry){line(c,[[-39,-23],[-6,-13]],ink,5);line(c,[[7,-13],[38,-23]],ink,5);}c.restore();}
function glove(c,x,y,s=1){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,0,15,12,paper);for(let i=-1;i<=1;i++)line(c,[[i*5,-5],[i*5,1]],ink,1.4);c.restore();}
function cloud(c,x,y,s,fill){c.save();c.translate(x,y);c.scale(s,s);c.beginPath();c.moveTo(-55,15);c.bezierCurveTo(-80,-8,-45,-28,-30,-17);c.bezierCurveTo(-27,-55,22,-53,25,-23);c.bezierCurveTo(55,-40,77,-9,62,14);c.closePath();c.fillStyle=fill;c.fill();c.restore();}
function flower(c,x,y,t){line(c,[[x,y],[x+Math.sin(t)*3,y-30]],'#56704b',3);for(let k=0;k<5;k++){const a=k/5*Math.PI*2;ellipse(c,x+Math.cos(a)*8,y-32+Math.sin(a)*8,6,6,'#dbc37c',ink,1);}ellipse(c,x,y-32,5,5,ink,null);}
export function background(c,act,t,motion=true){
  const palettes=[['#c7d1b0','#aeba88','#788d62'],['#c0d2c6','#92b5a6','#628f82'],['#454e65','#77758b','#5b5c75']];const [sky,hill,back]=palettes[act];
  c.fillStyle=sky;c.fillRect(0,0,WIDTH,HEIGHT);
  if(act===2){for(let i=0;i<55;i++){const x=(i*173+31)%960,y=(i*87+19)%330;ellipse(c,x,y,1+(i%3)*.6,1+(i%3)*.6,'#ddd7b3',null);}ellipse(c,665,91,46,46,'#ecdbaf',ink,2);ellipse(c,683,81,40,40,sky,null);}
  else {ellipse(c,175,102,51,51,'#e8dba5',null);eyes(c,176,96,.35);curve(c,[164,112],[171,120],[180,120],[185,111],ink,2);for(let i=0;i<5;i++)cloud(c,((i*263+80+(motion?t*4:0))%1250)-140,75+(i%3)*37,.75+(i%2)*.4,act===0?'#e4e1bd':'#dce4ce');}
  for(let i=0;i<7;i++)ellipse(c,i*185-60,365,180,120+(i%3)*35,hill,null);
  if(act===0){
    for(let i=0;i<11;i++){const x=i*101;line(c,[[x,374],[x,292]],'#a8ac7c',12);path(c,[[x-7,293],[x,280],[x+7,293]],'#a8ac7c',null);}line(c,[[0,324],[960,324]],'#a8ac7c',8);line(c,[[0,355],[960,355]],'#a8ac7c',8);
    for(let i=0;i<7;i++){const x=i*170-30;ellipse(c,x,402,99,61,back,ink,1.5);for(let k=0;k<3;k++)curve(c,[x-50+k*34,380],[x-20+k*20,365],[x-10+k*20,400],[x+10+k*20,390],'#9aaa77',2);}
    for(const x of [35,77,544,587,931])flower(c,x,426,t);
  }else if(act===1){
    c.fillStyle='#679d99';c.fillRect(0,320,960,130);for(let row=0;row<4;row++)for(let i=0;i<9;i++)curve(c,[i*125-25,row*29+332],[i*125+5,row*29+348],[i*125+25,row*29+348],[i*125+55,row*29+332],'#a5c2ae',2);
    path(c,[[325,263],[465,263],[437,297],[346,297]],'#645f4b');line(c,[[397,263],[397,139]],ink,4);path(c,[[390,152],[337,250],[390,250]],'#e2d9b6');path(c,[[404,168],[449,246],[404,246]],'#bc7454');
    for(const x of [45,590,930]){c.fillStyle='#8e8260';c.fillRect(x,370,17,100);ellipse(c,x+8,370,13,6,'#b6a77d');line(c,[[x+1,390],[x+16,390]],'#d4c6a1',6);}
  }else{
    for(const x of [0,900]){c.fillStyle='#713e49';c.fillRect(x,0,60,448);for(let i=0;i<4;i++)line(c,[[x+i*20,0],[x+i*20,440]],'#9a5960',4);}
    for(let i=0;i<10;i++)ellipse(c,i*110,0,76,66,'#713e49',ink,2);
    for(let i=0;i<5;i++){c.fillStyle='#c3af7d';c.globalAlpha=.05;c.beginPath();c.moveTo(150+i*190,0);c.lineTo(10+i*170,448);c.lineTo(270+i*170,448);c.fill();c.globalAlpha=1;}
  }
  c.fillStyle=act===0?'#c3af7f':act===1?'#b3a27a':'#98836d';c.fillRect(0,FLOOR,960,92);line(c,[[0,FLOOR],[960,FLOOR]],ink,4);
  for(let i=0;i<22;i++){if(act===0){const x=(i*73)%960;line(c,[[x,FLOOR+16+(i%3)*25],[x+10,FLOOR+18+(i%3)*25]],'#9b895f',2);}else{line(c,[[i*90,FLOOR],[i*90-35,540]],'#716b53',2);}}
  if(act===0)for(let i=0;i<50;i++){const x=i*20;line(c,[[x,FLOOR],[x+3,FLOOR-7-(i%4)*2]],'#65754e',2);}
  // Fixed grain keeps the image textured without distracting flicker.
  c.fillStyle='#243125';c.globalAlpha=.065;for(let i=0;i<650;i++)c.fillRect((i*139.7)%960,(i*89.3)%540,1,1);c.globalAlpha=1;
}
export function drawBoss(c,act,b,t,phase=0,warning=false){
  if(act>2){drawCampaignBoss(c,act,b,t,phase,warning);return;}
  const bob=Math.sin(t*3)*4;c.save();c.translate(b.x+b.w/2,b.y+b.h);const scale=act===2?.95:1;c.scale(scale,scale);
  ellipse(c,0,4,86,12,'#30362e25',null);
  if(act===0){
    curve(c,[-42,-35],[-60,-10],[-53,-8],[-63,0],ink,12);curve(c,[40,-35],[65,-15],[60,-8],[67,0],ink,12);ellipse(c,-66,-1,30,13,'#4b4939');ellipse(c,69,-1,30,13,'#4b4939');
    c.translate(0,bob);curve(c,[-65,-139],[-106,-140],[-107,-78],[-125,-93],ink,10);glove(c,-125,-93,1.35);curve(c,[67,-138],[113,-125],[109,-82],[127,-96],ink,10);glove(c,128,-96,1.35);
    path(c,[[-19,-199],[-56,-238],[-26,-242],[-4,-213],[-7,-259],[18,-245],[15,-210],[45,-243],[60,-226],[28,-192]],'#5c8155',ink,4);
    c.beginPath();c.moveTo(0,-205);c.bezierCurveTo(-124,-205,-99,-55,-6,-30);c.bezierCurveTo(11,-5,19,-24,11,-37);c.bezierCurveTo(104,-62,115,-203,0,-205);c.fillStyle=b.flash>0?'#fff1bc':'#c96e55';c.fill();c.strokeStyle=ink;c.lineWidth=4;c.stroke();
    curve(c,[-73,-151],[-78,-180],[-44,-191],[-29,-189],'#eaa077',7);eyes(c,-3,-138,1,phase>0);ellipse(c,-4,-103,17,12,'#dc9470');
    if(warning){ellipse(c,-6,-70,27,30,ink);ellipse(c,-6,-60,16,8,'#b45c54',null);}else{c.beginPath();c.moveTo(-42,-85);c.quadraticCurveTo(0,-35,39,-86);c.closePath();c.fillStyle=ink;c.fill();path(c,[[-34,-81],[30,-82],[18,-69],[-22,-67]],paper,null);}
    for(const x of [-57,46]){line(c,[[x,-103],[x+11,-100]],'#91493c',2);line(c,[[x-1,-96],[x+9,-94]],'#91493c',2);}
  }else if(act===1){
    curve(c,[-45,-40],[-50,-20],[-50,-13],[-62,-6],ink,12);curve(c,[45,-40],[50,-20],[60,-15],[62,-6],ink,12);ellipse(c,-64,-3,30,13,'#64543d');ellipse(c,63,-3,30,13,'#64543d');
    c.translate(0,bob);path(c,[[61,-172],[113,-191],[99,-148],[125,-111],[74,-100]],'#a2b797');ellipse(c,0,-120,86,92,b.flash>0?'#fff1bc':'#59958e',ink,4);ellipse(c,-4,-95,64,62,'#aac1a0',null);
    curve(c,[-76,-143],[-110,-158],[-93,-85],[-115,-84],ink,9);glove(c,-116,-86,1.2);curve(c,[73,-130],[112,-147],[103,-80],[123,-85],ink,9);glove(c,122,-85,1.2);
    eyes(c,-9,-139,1,phase>0);ellipse(c,-13,-97,30,16,ink);ellipse(c,-14,-95,18,9,'#d3a68e',null);
    path(c,[[-20,-60],[-49,-71],[-47,-42],[-20,-51],[12,-71],[16,-42]],'#ba6654');ellipse(c,-18,-55,8,8,'#d7916c');
    c.fillStyle='#313f3b';c.fillRect(-39,-256,70,57);ellipse(c,-4,-198,61,12,'#313f3b');c.fillStyle='#bb6b4b';c.fillRect(-39,-222,70,13);ellipse(c,-4,-256,35,8,'#4f6457');
    for(const [x,y,r]of [[-66,-185,7],[62,-167,5],[58,-89,7],[-54,-75,5]])ellipse(c,x,y,r,r,'#d4dcc0',null);
  }else{
    c.translate(0,-25+bob);const flap=Math.sin(t*6)*.07;c.save();c.rotate(flap);ellipse(c,-65,-110,70,95,b.flash>0?'#fff1bc':'#b08292',ink,4);ellipse(c,-70,-135,37,49,'#d1ad9c');ellipse(c,-68,-135,18,25,'#656882');ellipse(c,-52,-55,47,42,'#b08292');c.restore();c.save();c.rotate(-flap);ellipse(c,65,-110,70,95,b.flash>0?'#fff1bc':'#b08292',ink,4);ellipse(c,70,-135,37,49,'#d1ad9c');ellipse(c,68,-135,18,25,'#656882');ellipse(c,52,-55,47,42,'#b08292');c.restore();
    ellipse(c,0,-82,34,70,'#626c78',ink,4);for(let i=0;i<3;i++)curve(c,[-29,-92+i*20],[-8,-81+i*20],[13,-81+i*20],[30,-92+i*20],'#c9bdaa',4);
    curve(c,[-35,-111],[-63,-98],[-57,-70],[-76,-63],ink,7);glove(c,-77,-63);curve(c,[32,-113],[62,-97],[60,-64],[77,-67],ink,7);glove(c,77,-67);
    ellipse(c,0,-168,44,44,'#d1b8a1',ink,4);eyes(c,0,-173,.7,phase>0);curve(c,[-14,-143],[0,-130],[12,-140],[15,-145],ink,3);
    curve(c,[-15,-207],[-35,-247],[-52,-232],[-41,-223],ink,4);curve(c,[15,-207],[32,-247],[52,-236],[41,-223],ink,4);ellipse(c,-40,-226,6,6,'#d8b985');ellipse(c,41,-226,6,6,'#d8b985');
  }
  c.restore();
}
export function drawPlayer(c,p,t,large=false){
  if(p.invuln>0&&Math.floor(t*17)%2===0)return;
  const run=Math.abs(p.vx)>0?Math.sin(t*20):Math.sin(t*3)*.13;c.save();c.translate(p.x+p.w/2,p.y+p.h);if(large)c.scale(1.7,1.7);c.scale(p.facing,p.crouching?.56:1);
  if(p.dash>0){for(let i=1;i<4;i++)line(c,[[-30-i*8,-35+i*9],[-60-i*10,-35+i*9]],paper,3);}
  if(p.parry>0){ellipse(c,0,-34,39,43,'#f09abe44','#f69abd',3);}
  ellipse(c,0,1,24,5,'#30362e22',null);
  curve(c,[-8,-18],[-10-run*8,-8],[-13-run*9,-9],[-13-run*9,-3],ink,6);curve(c,[8,-18],[10+run*8,-8],[13+run*9,-9],[13+run*9,-3],ink,6);ellipse(c,-14-run*9,-3,13,6,'#ae533d',ink,2);ellipse(c,16+run*9,-3,13,6,'#ae533d',ink,2);
  ellipse(c,0,-27,17,18,ink,ink,2);path(c,[[-16,-31],[16,-31],[15,-20],[-15,-20]],'#c45d43',ink,2);ellipse(c,-6,-25,2,2,paper,null);ellipse(c,6,-25,2,2,paper,null);
  curve(c,[-14,-38],[-28,-26],[-24,-21],[-29,-23],ink,5);glove(c,-29,-23,.6);curve(c,[13,-37],[24,-35],[27,-37],[32,-38],ink,5);glove(c,33,-38,.7);
  path(c,[[0,-88],[-24,-53],[-17,-34],[15,-34],[25,-53]],paper,ink,3);line(c,[[0,-86],[0,-69]],ink,2);ellipse(c,0,-65,3,4,ink,null);eyes(c,2,-51,.36);curve(c,[-5,-38],[1,-33],[7,-36],[9,-39],ink,1.8);
  c.restore();
}
function star(c,x,y,r,color,rotation=0){const pts=[];for(let i=0;i<10;i++){const a=i*Math.PI/5-Math.PI/2+rotation;pts.push([x+Math.cos(a)*(i%2?r*.45:r),y+Math.sin(a)*(i%2?r*.45:r)]);}path(c,pts,color,ink,2);}
function drawCampaignBoss(c,act,b,t,phase,warning){
  const def=BOSSES[act],kind=def.art,bob=Math.sin(t*3)*4;
  c.save();c.translate(b.x+b.w/2,b.y+b.h+bob);
  const hurt=b.flash>0?'#fff1bc':null;
  ellipse(c,0,5,80,11,'#30362e22',null);
  if(phase===2){c.globalAlpha=.18;ellipse(c,0,-110,107,119,'#f1c577',null);c.globalAlpha=1;}
  switch(kind){
    case 'clock':
      curve(c,[-45,-50],[-80,-25],[-72,-10],[-84,-2],ink,12);curve(c,[43,-50],[70,-25],[65,-10],[83,-2],ink,12);
      path(c,[[-70,-5],[-66,-190],[-90,-221],[-53,-205],[-35,-239],[-18,-209],[40,-209],[70,-234],[64,-192],[73,-5]],hurt||'#96764f',ink,4);
      for(let i=0;i<5;i++)curve(c,[-50+i*25,-180],[-65+i*25,-100],[-40+i*25,-90],[-52+i*25,-20],'#69573e',3);
      ellipse(c,0,-129,59,65,'#ddcda0',ink,4);for(let i=0;i<12;i++){const a=i*Math.PI/6;line(c,[[Math.cos(a)*46,-129+Math.sin(a)*50],[Math.cos(a)*51,-129+Math.sin(a)*56]],ink,2);}
      eyes(c,0,-141,.68,phase>0);line(c,[[0,-119],[Math.sin(t)*21,-98]],ink,4);curve(c,[-19,-96],[0,-84],[15,-87],[24,-101],ink,3);
      ellipse(c,0,-45,20,24,'#453c2e');line(c,[[0,-62],[Math.sin(t*4)*13,-29]],'#dfbb67',4);ellipse(c,Math.sin(t*4)*13,-28,8,8,'#d4ac55');
      break;
    case 'cloud':
      cloud(c,0,-115,1.35,hurt||'#e6dfc5');cloud(c,-48,-94,.6,'#d1d4be');cloud(c,54,-96,.6,'#d1d4be');eyes(c,0,-134,.95,phase>0);
      path(c,[[-22,-197],[-36,-225],[35,-225],[23,-197]],'#a65c4d');ellipse(c,0,-199,48,8,'#6b5548');
      curve(c,[-35,-91],[-15,-70],[0,-105],[0,-93],ink,5);curve(c,[35,-91],[15,-70],[0,-105],[0,-93],ink,5);
      for(let i=0;i<3;i++)path(c,[[-46+i*42,-61],[-55+i*42,-32],[-42+i*42,-32],[-53+i*42,-6],[-20+i*42,-41],[-35+i*42,-41]],'#d9ac52',ink,2);
      break;
    case 'frog':
      ellipse(c,-64,-17,40,20,'#618957');ellipse(c,64,-17,40,20,'#618957');ellipse(c,0,-100,91,99,hurt||'#73945b',ink,4);ellipse(c,0,-67,60,57,'#bcbe82',null);
      ellipse(c,-36,-190,30,28,'#73945b');ellipse(c,36,-190,30,28,'#73945b');eyes(c,0,-185,1.25,phase>0);
      path(c,[[-49,-222],[-58,-258],[-25,-240],[0,-268],[23,-240],[53,-258],[44,-220]],'#dcb767',ink,3);for(const x of [-28,0,28])ellipse(c,x,-229,4,5,'#ba5f49',null);
      curve(c,[-66,-127],[-28,-83],[32,-83],[67,-129],ink,5);if(warning)ellipse(c,0,-109,28,19,'#62403b');
      curve(c,[-69,-109],[-100,-95],[-103,-60],[-112,-65],ink,8);glove(c,-112,-65,1.2);curve(c,[71,-107],[100,-98],[102,-66],[112,-63],ink,8);glove(c,112,-63,1.2);
      break;
    case 'crab':
      for(const sign of [-1,1]){for(let i=0;i<3;i++)line(c,[[sign*50,-58+i*15],[sign*(95+i*8),-45+i*15],[sign*(108+i*10),-9]],ink,7);curve(c,[sign*62,-112],[sign*106,-120],[sign*98,-155],[sign*114,-162],ink,9);ellipse(c,sign*121,-176,35,40,'#be6b50');path(c,[[sign*121,-178],[sign*144,-207],[sign*112,-216]],'#d7b694',ink,2);}
      ellipse(c,0,-97,83,72,hurt||'#c77657',ink,4);for(const sign of [-1,1])line(c,[[sign*26,-151],[sign*30,-193]],ink,9);eyes(c,0,-190,1.13,phase>0);curve(c,[-35,-91],[0,-67],[23,-82],[35,-97],ink,4);
      for(let i=0;i<6;i++)ellipse(c,-50+i*19,-120+(i%2)*12,4,4,'#e4a374',null);
      break;
    case 'bird':
      c.save();c.rotate(Math.sin(t*5)*.13);ellipse(c,-69,-114,75,35,'#8c9e9a',ink,4);c.restore();c.save();c.rotate(-Math.sin(t*5)*.13);ellipse(c,69,-114,75,35,'#8c9e9a',ink,4);c.restore();
      ellipse(c,0,-97,61,85,hurt||'#d4d4bb',ink,4);ellipse(c,0,-171,51,47,'#e6ddbd',ink,3);eyes(c,-9,-178,.8,phase>0);path(c,[[-20,-157],[-65,-142],[-12,-130],[15,-145]],'#d0a453',ink,3);
      path(c,[[-41,-209],[-33,-238],[32,-238],[44,-209]],'#405d66');ellipse(c,0,-209,51,8,'#405d66');star(c,0,-224,9,'#ddbc64');
      for(const x of [-22,22]){line(c,[[x,-21],[x,-2]],'#b99144',5);line(c,[[x-15,0],[x+15,0]],'#b99144',5);}
      break;
    case 'squid':
      for(let i=0;i<8;i++){const x=(i-3.5)*20;curve(c,[x*.7,-67],[x*1.7,-23],[x*1.9,16],[x*1.7+Math.sin(t*3+i)*14,-8],ink,18);curve(c,[x*.7,-67],[x*1.7,-23],[x*1.9,16],[x*1.7+Math.sin(t*3+i)*14,-8],'#a17495',12);}
      ellipse(c,0,-143,77,102,hurt||'#a17495',ink,4);eyes(c,-6,-132,1.1,phase>0);ellipse(c,-10,-92,22,17,'#463b4f');
      path(c,[[-21,-42],[-44,-57],[-42,-28],[-20,-39],[7,-58],[10,-30]],'#dec78f');line(c,[[85,-94],[124,-165]],paper,4);glove(c,86,-93);
      break;
    case 'candle':
      ellipse(c,0,-9,89,19,'#8a7359');c.fillStyle=hurt||'#d8be87';c.fillRect(-53,-171,106,150);c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(-53,-171,106,150);ellipse(c,0,-171,53,13,'#e4d4a2');
      for(let i=0;i<5;i++)ellipse(c,-43+i*21,-163,11,21+(i%3)*12,'#e4d4a2',null);
      path(c,[[0,-275],[-35,-230],[-25,-199],[0,-188],[31,-207],[34,-227]],'#d87843',ink,3);path(c,[[0,-247],[-15,-215],[0,-198],[16,-215]],'#edd57e',null);
      eyes(c,0,-131,.84,phase>0);curve(c,[-25,-93],[0,-74],[23,-78],[27,-99],ink,4);curve(c,[-55,-122],[-89,-111],[-86,-76],[-102,-80],ink,8);glove(c,-102,-80);curve(c,[55,-122],[90,-117],[85,-80],[101,-85],ink,8);glove(c,101,-85);
      break;
    case 'moon':
      ellipse(c,0,-125,93,103,hurt||'#d4c58f',ink,4);for(const [x,y,r]of [[-50,-185,15],[51,-98,16],[-37,-71,12],[40,-184,8]])ellipse(c,x,y,r,r,'#adab81',null);
      eyes(c,-6,-144,1,phase>0);curve(c,[-37,-99],[-10,-68],[23,-75],[35,-108],ink,4);
      c.save();c.translate(0,-130);c.rotate(-.32);ellipse(c,0,0,127,30,'#ffffff00','#90819f',13);c.restore();star(c,107,-182,18,'#e2b76b',t*.4);
      break;
    case 'projector':
      for(const x of [-43,43]){line(c,[[x,-31],[x,-6]],ink,12);ellipse(c,x+(x<0?-10:10),-4,32,12,'#55534e');}
      c.fillStyle=hurt||'#6c7973';c.fillRect(-70,-181,140,153);c.strokeStyle=ink;c.lineWidth=4;c.strokeRect(-70,-181,140,153);
      for(const x of [-48,48]){ellipse(c,x,-216,43,43,'#a2a894',ink,4);for(let i=0;i<5;i++){const a=i/5*Math.PI*2+t*(phase+1);ellipse(c,x+Math.cos(a)*25,-216+Math.sin(a)*25,9,9,'#53665f');}ellipse(c,x,-216,7,7,'#cfc4a3');}
      eyes(c,-1,-147,.93,phase>0);ellipse(c,0,-87,35,25,'#303d38');ellipse(c,0,-87,24,16,warning?'#f6db8e':'#acc5b4');
      curve(c,[-73,-142],[-115,-129],[-100,-75],[-124,-82],ink,10);glove(c,-126,-82,1.3);curve(c,[73,-144],[109,-126],[103,-76],[125,-82],ink,10);glove(c,126,-82,1.3);
      break;
  }
  c.restore();
}
function drawPlane(c,p,t){
  if(p.invuln>0&&Math.floor(t*17)%2===0)return;
  c.save();c.translate(p.x+p.w/2,p.y+p.h/2);c.scale(p.facing,1);
  if(p.parry>0)ellipse(c,0,0,49,38,'#ef91b444','#ef91b4',3);
  ellipse(c,0,3,36,15,'#b8523a');path(c,[[-28,0],[-46,-21],[-47,8]],'#c76247');path(c,[[-8,-7],[-21,-19],[19,-19],[11,-6]],paper);ellipse(c,4,-7,11,10,paper);eyes(c,5,-9,.2);
  line(c,[[31,0],[42,0]],ink,4);ellipse(c,43,0,3,12+Math.abs(Math.sin(t*40))*13,'#ddd6b4',ink,2);path(c,[[-13,10],[14,10],[1,27],[-25,27]],'#d7915d');
  if(p.dash>0)line(c,[[-55,0],[-87,0]],paper,5);c.restore();
}
function drawRun(c,g,t){
  const camera=g.camera;
  c.save();c.translate(-camera,0);
  // Cut actual pits out of the continuous scenery floor.
  for(let i=0;i<g.ground.length-1;i++){const x=g.ground[i][1],end=g.ground[i+1][0];c.fillStyle=g.world===0?'#434d36':g.world===1?'#49767a':'#393546';c.fillRect(x,FLOOR-1,end-x,100);line(c,[[x,FLOOR],[x,FLOOR+90]],ink,4);line(c,[[end,FLOOR],[end,FLOOR+90]],ink,4);}
  for(const p of g.platforms){c.fillStyle=g.world===0?'#76865a':g.world===1?'#958366':'#9c7785';c.fillRect(p.x,p.y,p.w,p.h);c.strokeStyle=ink;c.lineWidth=3;c.strokeRect(p.x,p.y,p.w,p.h);for(let x=p.x+15;x<p.x+p.w;x+=28)line(c,[[x,p.y+5],[x+12,p.y+5]],'#d5c99f',2);}
  for(const coin of g.coins)if(!coin.collected){c.globalAlpha=coin.banked?.35:1;ellipse(c,coin.x+11,coin.y+13+Math.sin(t*4+coin.id)*3,10,14,'#e5c064',ink,2);text(c,coin.banked?'✓':'¢',coin.x+11,coin.y+18,15);c.globalAlpha=1;}
  for(const e of g.enemies)if(e.hp>0){const x=e.x+e.w/2,y=e.y+e.h;ellipse(c,x,y,24,5,'#30362e22',null);line(c,[[x-10,y-10],[x-15,y]],ink,4);line(c,[[x+10,y-10],[x+15,y]],ink,4);ellipse(c,x,y-22,22,23,e.flash>0?'#fff1bc':['#ad6c50','#668a80','#aa8194'][g.world],ink,2);if(e.kind==='turret')path(c,[[x-18,y-39],[x-26,y-54],[x,y-49],[x+18,y-56],[x+22,y-37]],'#687850',ink,2);else if(e.kind==='hopper'){line(c,[[x-8,y-41],[x-14,y-55]],ink,3);line(c,[[x+8,y-41],[x+14,y-55]],ink,3);}eyes(c,x,y-28,.38,true);curve(c,[x-8,y-11],[x,y-17],[x+8,y-13],[x+10,y-9],ink,2);}
  const end=g.worldWidth-125;line(c,[[end,FLOOR],[end,FLOOR-158]],ink,6);path(c,[[end,FLOOR-159],[end+90,FLOOR-147],[end+90,FLOOR-93],[end,FLOOR-105]],'#e2c981');text(c,'EXIT',end+44,FLOOR-122,19);c.restore();
}
export function render(c,g,{menu=false,reducedMotion=false}={}){
  const t=reducedMotion?0:g.time;
  c.save();if(g.shake>0&&!reducedMotion)c.translate(Math.sin(t*89)*g.shake*15,Math.cos(t*73)*g.shake*9);
  background(c,g.world,t,!reducedMotion);
  if(g.type==='flight'){
    // Flight scenes have open sky instead of a ground collision plane.
    c.fillStyle=['#b7c9b3','#a4c3c1','#454b63'][g.world];c.fillRect(0,0,960,540);
    if(g.world===2){for(let i=0;i<70;i++)ellipse(c,(i*173+19)%960,(i*89+23)%540,1.5,1.5,'#e3d9b5',null);}
    else{ellipse(c,170,110,52,52,'#e7d9a9',null);eyes(c,170,108,.35);curve(c,[158,125],[170,134],[179,131],[185,122],ink,2);}
    for(let i=0;i<10;i++)cloud(c,((i*203-t*25)%1300+1300)%1300-140,90+(i%4)*130,.65+(i%3)*.2,g.world===2?'#6c6b82':'#d8dfc3');
    if(g.world===1){c.fillStyle='#6c9899';c.fillRect(0,493,960,47);for(let i=0;i<12;i++)curve(c,[i*90,510],[i*90+10,520],[i*90+25,520],[i*90+38,510],'#a9c4b5',2);}
  }
  if(g.type==='run')drawRun(c,g,t);else {
    c.save();
    if(g.transition>0&&!reducedMotion){const b=g.boss,a=Math.sin(g.transition/1.1*Math.PI)*.16;c.translate(b.x+b.w/2,b.y+b.h);c.scale(1+a,1-a);c.translate(-b.x-b.w/2,-b.y-b.h);}
    drawBoss(c,g.act,g.boss,t,g.phase,g.warningTime>0);c.restore();
    if(g.transition>0){for(let i=0;i<7;i++){const a=i/7*Math.PI*2+t*2;star(c,g.boss.x+80+Math.cos(a)*110,g.boss.y+100+Math.sin(a)*100,10,paper,a);}}
  }
  c.save();c.translate(-g.camera,0);
  if(g.type==='flight')drawPlane(c,g.player,t);
  else if(menu)drawPlayer(c,{...g.player,x:g.camera+553,y:378,vx:0,invuln:0},t,true);
  else drawPlayer(c,g.player,t);
  if(g.player.aimLocked){c.strokeStyle=paper;c.lineWidth=2;c.beginPath();c.arc(g.player.x+g.player.w/2,g.player.y+g.player.h/2,29,0,Math.PI*2);c.stroke();}
  if(g.player.chargeTime>.1){c.globalAlpha=.35;ellipse(c,g.player.x+g.player.w/2,g.player.y+20,18+g.player.chargeTime*15,20+g.player.chargeTime*15,WEAPONS.charge.color,null);c.globalAlpha=1;}
  for(const s of g.shots){if(s.weapon==='boomerang')star(c,s.x+s.w/2,s.y+s.h/2,s.w/2,s.color,t*14);else ellipse(c,s.x+s.w/2,s.y+s.h/2,s.w/2,s.h/2,s.color||'#f9e2a0',ink,2);}
  for(const h of g.hazards){const x=h.x+h.r,y=h.y+h.r,color=h.pink?'#ef91b4':h.kind==='fire'?'#de8655':g.world===0?'#77603d':g.world===1?'#97c4bb':'#dbc180';
    if(['star','gear'].includes(h.kind))star(c,x,y,h.r,color,t*2);
    else if(h.kind==='feather'||h.kind==='rain')path(c,[[x,y-h.r],[x+h.r*.6,y],[x,y+h.r],[x-h.r*.6,y]],color,ink,2);
    else{ellipse(c,x,y,h.r,h.r,color,ink,2);ellipse(c,x-h.r*.3,y-h.r*.3,h.r*.24,h.r*.32,'#fff4d4',null);}
    if(h.pink)star(c,x+h.r+4,y-h.r,5,'#ffd8e7');
  }
  for(const p of g.particles){c.globalAlpha=Math.min(1,p.life*2);ellipse(c,p.x,p.y,p.r,p.r,p.color,null);}c.globalAlpha=1;c.restore();
  if(!menu&&g.mode==='intro'){c.save();c.translate(480,215);c.rotate(-.06);text(c,g.intro>1.15?(g.type==='run'?'Off to the races!':g.type==='flight'?'Chocks away!':'Ready for trouble?'):'GIVE ’EM INK!',0,0,g.intro>1.15?52:69,paper);c.restore();}
  if(!menu&&g.warningTime>0&&g.mode==='playing'){c.fillStyle='#f5e6cacc';c.fillRect(255,79,450,29);c.fillStyle='#733e32';c.textAlign='center';c.font='bold 12px monospace';c.fillText(g.warning,480,98);}
  c.restore();
}
export function renderMap(c,world,t=0,reducedMotion=false){
  const worldDef=WORLDS[world];c.fillStyle=['#91b8ad','#83aaa8','#737b92'][world];c.fillRect(0,0,960,540);
  for(let row=0;row<9;row++)for(let col=0;col<13;col++){const x=col*87+(row%2)*35+(reducedMotion?0:Math.sin(t*.6)*5),y=row*67+12;curve(c,[x,y],[x+10,y+6],[x+20,y+6],[x+30,y],'#e6e1bd44',2);}
  c.save();c.translate(8,12);path(c,[[91,349],[115,230],[202,135],[322,98],[429,127],[510,91],[627,112],[707,168],[806,176],[860,259],[823,337],[745,380],[627,416],[502,401],[402,457],[276,443],[182,401]],'#d2bd86',ink,4);c.restore();
  path(c,[[91,349],[115,230],[202,135],[322,98],[429,127],[510,91],[627,112],[707,168],[806,176],[860,259],[823,337],[745,380],[627,416],[502,401],[402,457],[276,443],[182,401]],['#bac58c','#b5c1a0','#b3a9ad'][world],ink,3);
  // Contour lines and small hillocks turn the board into a hand-inked island.
  for(const [x,y,s]of [[390,177,1],[652,320,.8],[170,280,.6],[551,359,.7]]){ellipse(c,x,y,60*s,24*s,['#a6b57a','#96b0a0','#9c91a1'][world],null);curve(c,[x-35*s,y],[x,y-22*s],[x+25*s,y-13*s],[x+40*s,y],worldDef.color,2);}
  c.save();c.setLineDash([7,7]);line(c,[[220,356],[278,178],[461,297],[528,124],[710,220]],'#807655',7);c.restore();
  for(const [x,y]of [[155,329],[196,192],[344,325],[376,143],[639,168],[702,329],[524,384],[317,390]]){
    if(world===2){path(c,[[x-21,y],[x-21,y-47],[x+21,y-47],[x+21,y]],'#7c6374',ink,2);path(c,[[x-28,y-47],[x,y-78],[x+28,y-47]],'#9c5e68',ink,2);c.fillStyle='#e0c47d';c.fillRect(x-5,y-34,10,14);}
    else{line(c,[[x,y],[x,y-28]],'#756349',5);for(const [dx,dy]of [[0,-42],[-13,-30],[13,-30]])ellipse(c,x+dx,y+dy,19,23,world===0?'#72915d':'#74978a',ink,1.5);}
  }
  // Shop building on the western shoreline.
  c.fillStyle='#e2d3aa';c.fillRect(86,365,74,58);c.strokeStyle=ink;c.lineWidth=2;c.strokeRect(86,365,74,58);path(c,[[78,365],[94,343],[154,343],[167,365]],'#b6674f',ink,2);for(let x=84;x<160;x+=15){c.fillStyle=(x-84)%30===0?'#ecd7a8':'#b6674f';c.fillRect(x,365,15,12);}c.fillStyle='#756247';c.fillRect(113,392,20,31);text(c,'INK & CO.',124,339,12);
  c.save();c.translate(857,427);star(c,0,0,29,'#e3d7ae');text(c,'N',0,-34,13);c.restore();
  text(c,worldDef.name.toUpperCase(),480,482,25,'#30362e');c.font='11px monospace';c.fillStyle='#37483e';c.textAlign='center';c.fillText(worldDef.subtitle,480,503);
}
