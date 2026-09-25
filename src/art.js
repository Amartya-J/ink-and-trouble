import {ACTS,FLOOR,WIDTH,HEIGHT} from './engine.js';
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
  const run=Math.abs(p.vx)>0?Math.sin(t*20):Math.sin(t*3)*.13;c.save();c.translate(p.x+p.w/2,p.y+p.h);if(large)c.scale(1.7,1.7);c.scale(p.facing,1);
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
export function render(c,g,{menu=false,reducedMotion=false}={}){
  const t=reducedMotion?0:g.time;c.save();if(g.shake>0&&!reducedMotion)c.translate(Math.sin(t*89)*g.shake*15,Math.cos(t*73)*g.shake*9);background(c,g.act,t,!reducedMotion);
  drawBoss(c,g.act,g.boss,t,g.phase,g.warningTime>0);
  if(menu){drawPlayer(c,{...g.player,x:553,y:378,vx:0,invuln:0},t,true);}else drawPlayer(c,g.player,t);
  for(const s of g.shots){ellipse(c,s.x+s.w/2,s.y+s.h/2,s.w/2,s.h/2,s.special?'#76cfc5':'#f9e2a0',ink,2);line(c,[[s.x-8,s.y+s.h/2],[s.x-21,s.y+s.h/2]],s.special?'#75cfc3':'#f9e2a0',3);}
  for(const h of g.hazards){const x=h.x+h.r,y=h.y+h.r,color=h.pink?'#ef91b4':g.act===0?'#66523b':g.act===1?'#afd7cd':'#ebcd83';if(h.kind==='star')star(c,x,y,h.r,color,t*2);else{ellipse(c,x,y,h.r,h.r,color,ink,2);ellipse(c,x-h.r*.3,y-h.r*.3,h.r*.24,h.r*.32,'#fff4d4',null);}if(h.pink){star(c,x+h.r+4,y-h.r,5,'#ffd8e7');}}
  for(const p of g.particles){c.globalAlpha=Math.min(1,p.life*2);ellipse(c,p.x,p.y,p.r,p.r,p.color,null);}c.globalAlpha=1;
  if(!menu&&g.mode==='intro'){c.save();c.translate(480,215);c.rotate(-.06);text(c,g.intro>1.15?'Ready for trouble?':'GIVE ’EM INK!',0,0,g.intro>1.15?52:69,paper);c.restore();}
  if(!menu&&g.warningTime>0&&g.mode==='playing'){c.fillStyle='#f5e6cacc';c.fillRect(275,79,410,29);c.fillStyle='#733e32';c.textAlign='center';c.font='bold 12px monospace';c.fillText(g.warning,480,98);}
  c.restore();
}
