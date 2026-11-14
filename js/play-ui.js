"use strict";
/* ============ CHƠI VỚI BÉ: giao diện và hành vi trong phòng (2026-11-14) ============
   Luật ở js/play.js. Nạp ngay sau js/garden-ui.js (sau tut-text.js để chèn chương Sổ tay, trước tut-wx.js bọc danh sách chương;
   sau meal-ent.js, wx-ui.js để bọc stepEnt, choose, entPos ở ngoài cùng; sau quest.js, achieve.js để thêm nhiệm vụ, thành tựu). CSS: css/play.css.
   Không sửa ui.js: chỉ bọc PANEL.home, stepEnt, choose, critStep, critDraw, setRoom, openAdmin, và chặn sự kiện chuột/chạm của
   khung phòng ở pha capture của #roomwrap trong lúc đang chơi (để kéo là vẫy đồ chơi chứ không cuộn phòng).
   - Nút 🪶 Chơi nằm trên hàng nút dưới phòng (sau Cho uống, trước Sắp xếp đồ), chỉ hiện từ cấp PLAYC.lv. Bấm mở bảng chọn trò;
     đang chơi thì nút thành ⏹ Dừng. Trên khung phòng có thanh nhỏ #plbar ở góc dưới trái: tên trò, giây còn lại, nút Dừng.
   - PL giữ lượt chơi đang diễn ra (không lưu). Mèo đang chơi có e.pl = {off, cd, jmp, dir, ex}: off là khoảng đứng chờ cạnh đồ chơi,
     cd là giây chờ trước cú vồ kế tiếp, jmp là đang bay trong cú vồ.
   - Bé đuổi theo: chạy (trạng thái run, nhanh hơn một chút) tới cạnh đồ chơi; đủ gần và đồ chơi trong tầm với thì vồ (trạng thái jump
     của ui.js); tiếp đất mà đồ chơi còn ở dưới chân trước thì là trúng: playReward (luật), tim, hạt lông vũ hoặc tia đỏ.
   - Lượt chơi dừng khi hết PLAYC.dur giây, bấm Dừng, đổi phòng, đổi tab, bật Sắp xếp đồ hoặc ẩn trang. */
const PL={on:0,k:'feather',t:0,rid:null,ax:0,ay:0,fx:0,fy:0,px:0,py:0,lx:0,ly:0,lvx:0,tx:0,ty:0,wait:0,man:0,ptr:null,act:0,idle:9,scan:0,hits:0,got:[],ph:0,force:0};
const PL_OK=['idle','walk','run','groom'];
const plToy=()=>PL.k==='laser'?{x:PL.lx,y:PL.ly,vx:PL.lvx}:{x:PL.fx,y:PL.fy+5,vx:0};
const plFloor=T=>clamp(T.y+3,FLOOR_MIN+1,FLOOR_MAX-1);
// bé này có đuổi đồ chơi được không (đang đuổi thì cho phép cả lúc đang vồ)
function plCan(e){
  if(e.ghost||e.clone||e.dead)return false;
  const c=entCat(e);if(!c||playWhy(c))return false;
  if(e.state==='jump')return !!(e.pl&&e.pl.jmp);
  return PL_OK.includes(e.state);
}
function plFree(e){
  if(!e.pl)return;const j=e.pl.jmp;delete e.pl;e.boost=0;
  if(!j&&(e.state==='run'||e.state==='walk'||e.state==='idle')){e.state='idle';e.t=rnd(.4,1.2);e.goal=null;e.emo=null}
}
function plJoin(e){
  e.pl={off:PL.k==='laser'?rnd(2,7):rnd(7,15),cd:rnd(.3,.9),jmp:0,dir:1,ex:.9};
  e.goal=null;e.emo='excl';
}
// mỗi 0,4 giây: chọn tối đa PLAYC.max bé gần đồ chơi nhất
function plScan(){
  const T=plToy(),L=ents.filter(e=>(e.pl||PL_OK.includes(e.state))&&plCan(e)).map(e=>({e,d:Math.abs(e.x-T.x)})).filter(o=>o.d<=PLAYC.near||o.e.pl).sort((a,b)=>a.d-b.d);
  const keep=new Set(L.slice(0,PLAYC.max).map(o=>o.e));
  ents.forEach(e=>{if(e.pl&&!keep.has(e))plFree(e)});
  keep.forEach(e=>{if(!e.pl)plJoin(e)});
}
// điều khiển một bé đang đuổi, chạy trước stepEnt gốc
function plDrive(e,dt){
  const p=e.pl;p.cd-=dt;if(p.ex>0)p.ex-=dt;
  if(e.state==='jump')return;
  const T=plToy(),fy=plFloor(T),dx=T.x-e.x,ady=Math.abs(fy-e.y),reach=T.y>=fy-44;
  e.goal=null;if(p.ex<=0)e.emo=null;
  if(Math.abs(dx)<24&&ady<12&&reach&&p.cd<=0){ // vồ
    const dir=dx>=0?1:-1;
    e.j={fx:e.x,fy:e.y,tx:clamp(T.x-dir*10+T.vx*.25,14,WORLD_W-14),ty:fy,sy:e.y,next:'idle'};
    e.jt=0;e.jd=clamp(.3+Math.abs(e.j.tx-e.x)/120,.3,.55);e.flip=dir>0;e.state='jump';p.jmp=1;p.dir=dir;e.emo=null;return;
  }
  const side=e.x<T.x?-1:1,gx=clamp(T.x+side*p.off,14,WORLD_W-14);
  if(Math.abs(gx-e.x)>4||ady>5){
    if(e.state!=='run'){e.state='run';e.pre=.1;e.acc=0}
    e.tx=gx;e.ty=fy;e.left=0;e.boost=PL.k==='laser'?1.3:1.1;
  }else{e.state='idle';e.t=1;if(Math.abs(dx)>.5)e.flip=dx>0}   // đứng rình cạnh đồ chơi
}
// tiếp đất sau cú vồ: đồ chơi còn ở dưới chân trước thì trúng
function plLand(e){
  const p=e.pl,T=plToy(),hit=Math.abs(T.x-(e.x+p.dir*10))<=10&&T.y>=e.y-46&&T.y<=e.y+8;
  p.cd=hit?rnd(1.1,2):rnd(.35,.8);
  if(hit)plCatch(e,T);
  else for(let i=0;i<4;i++)rp(e.x+p.dir*8+rnd(-4,4),e.y-1,'#c9b49c',{vx:rnd(-12,12),vy:-rnd(4,12),g:40,life:rnd(.25,.45)});
}
function plCatch(e,T){
  const c=entCat(e);if(!c)return;PL.hits++;e.emoT=1.4;
  const cols=PL.k==='laser'?['#ff4a4a','#ff9a9a','#fff']:['#f59ab5','#ffd6e2','#fff','#9ad9cf'];
  for(let i=0;i<10;i++)rp(T.x+rnd(-4,4),T.y-rnd(0,6),pick(cols),{vx:rnd(-22,22),vy:-rnd(10,34),g:46,life:rnd(.4,.8),sz:ch(.3)?2:1});
  if(PL.k==='feather'){PL.vx+=(e.flip?1:-1)*40;PL.vy-=60}   // lông vũ bị vồ trúng giật lên
  const r=playReward(c,PL.k);
  if(r&&r.hp>0){if(!PL.got.includes(c.name))PL.got.push(c.name);
    toast('vồ trúng '+(PL.k==='laser'?'chấm đỏ':'lông vũ')+'! ❤️ +'+r.hp+' độ vui',{type:'pet',title:c.name,key:'play',mtitle:'Chơi với bé',icon:PL.k==='laser'?'🔴':'🪶'})}
}

/* ---------- đồ chơi chuyển động ---------- */
function plViewY(){const top=Math.max(FLOOR_MIN+2,camY+8),bot=Math.min(FLOOR_MAX-2,camY+VHV-6);return bot>top?[top,bot]:[FLOOR_MIN+2,FLOOR_MIN+12]}
function plLaserPick(){
  const [y0,y1]=plViewY(),x0=camX+18,x1=camX+VW-18;let x=rnd(x0,x1);
  if(Math.abs(x-PL.lx)<30)x=clamp(PL.lx+(Math.random()<.5?-1:1)*rnd(40,120),x0,x1);
  PL.tx=x;PL.ty=ch(.15)?rnd(FLOOR_MIN-24,FLOOR_MIN-6):rnd(y0,y1);PL.sp=rnd(60,135);
}
function plStepLaser(dt){
  const tx=PL.tx,ty=PL.ty,dx=tx-PL.lx,dy=ty-PL.ly,d=Math.hypot(dx,dy),man=PL.man>0;if(man)PL.man-=dt;
  if(!man&&PL.wait>0){PL.wait-=dt;PL.lvx=0;PL.lx+=rnd(-.4,.4);PL.ly+=rnd(-.3,.3);if(PL.wait<=0)plLaserPick();return}
  const sp=man?220:PL.sp||100;
  if(d<=sp*dt+.5){PL.lx=tx;PL.ly=ty;PL.lvx=0;if(!man){PL.wait=ch(.35)?rnd(1.2,2.2):rnd(.35,1)}}
  else{const n=Math.sin(PL.ph*13)*.6;PL.lvx=dx/d*sp;PL.lx+=dx/d*sp*dt-dy/d*n;PL.ly+=dy/d*sp*dt+dx/d*n*.5}
  PL.lx=clamp(PL.lx,8,WORLD_W-8);PL.ly=clamp(PL.ly,FLOOR_MIN-30,FLOOR_MAX);
}
function plStepFeather(dt){
  PL.idle+=dt;
  if(PL.ptr!=null||PL.hov){ // đang cầm cần câu: lông vũ theo con trỏ; con trỏ sát mép thì cuộn phòng theo
    if(PL.px<14){camX-=80*dt;clampCam()}else if(PL.px>VW-14){camX+=80*dt;clampCam()}
    PL.ax=PL.px+camX;PL.ay=PL.py+camY;PL.hx=PL.ax;PL.hy=PL.ay;
  }else if(PL.idle>1.6){ // không ai vẫy thì lông vũ tự đung đưa quanh chỗ cũ
    const t=PL.ph;PL.ax=PL.hx+Math.sin(t*1.7)*34;PL.ay=PL.hy+Math.sin(t*3.4)*9;
  }
  PL.ax=clamp(PL.ax,6,WORLD_W-6);PL.ay=clamp(PL.ay,camY+2,FLOOR_MAX-4);
  // lông vũ treo vào dây dài 16 ô, rơi theo trọng lực và đung đưa
  const L=16;
  PL.vy+=260*dt;PL.vx*=1-.9*dt;PL.vy*=1-.9*dt;
  PL.fx+=PL.vx*dt;PL.fy+=PL.vy*dt;
  let dx=PL.fx-PL.ax,dy=PL.fy-PL.ay,d=Math.hypot(dx,dy);
  if(d>L){const nx=dx/d,ny=dy/d,vr=PL.vx*nx+PL.vy*ny;PL.fx=PL.ax+nx*L;PL.fy=PL.ay+ny*L;if(vr>0){PL.vx-=vr*nx;PL.vy-=vr*ny}}
  if(PL.fy>FLOOR_MAX+2){PL.fy=FLOOR_MAX+2;PL.vy=Math.min(0,PL.vy);PL.vx*=.8}
}
function plStep(dt){
  if(!PL.on)return;
  if(cur!==PL.rid||edit||document.hidden){plStop();return}
  PL.t-=dt;PL.ph+=dt;if(PL.t<=0){plStop('time');return}
  if(PL.k==='laser')plStepLaser(dt);else plStepFeather(dt);
  if((PL.scan-=dt)<=0){PL.scan=.4;plScan()}
  plBar();
}

/* ---------- vẽ ---------- */
// lông vũ: chùm hồng lớn và một sợi xanh ngọc nhỏ, buộc vào dây ở hàng đầu (o viền nâu, p hồng, w sáng, t xanh ngọc, q cuống)
const PL_FEATHER=['...o...','..opo..','.oppwo.','.opwpo.','oppwppo','opwpppo','oppwppo','opwpppo','.opwpo.','.oppwo.','..opo..','..opo..','...o...','...q...','...q...'];
const PL_TEAL=['.o.','oto','oto','oto','.o.','.q.'];
function plDraw(g){
  if(!PL.on)return;
  if(PL.k==='laser'){
    const x=PL.lx,y=PL.ly,f=.85+.15*Math.sin(PL.ph*30);
    g.globalAlpha=.18*f;g.fillStyle='#ff3030';g.beginPath();g.arc(x,y,6.5,0,6.283);g.fill();
    g.globalAlpha=.4*f;g.beginPath();g.arc(x,y,3.4,0,6.283);g.fill();
    const rx=Math.round(x),ry=Math.round(y);g.globalAlpha=1;g.fillStyle='#ff2020';g.fillRect(rx-1,ry-2,2,4);g.fillRect(rx-2,ry-1,4,2);g.fillStyle='#fff';g.fillRect(rx-1,ry-1,1,1);
    return;
  }
  const ax=PL.ax,ay=PL.ay;
  // cần câu đi chéo lên từ chỗ cầm, dây treo lông vũ
  g.lineCap='round';g.strokeStyle='#4e3026';g.lineWidth=2.2;g.beginPath();g.moveTo(ax,ay);g.lineTo(ax+30,ay-40);g.stroke();
  g.strokeStyle='#b07a4c';g.lineWidth=1;g.beginPath();g.moveTo(ax,ay);g.lineTo(ax+30,ay-40);g.stroke();
  g.strokeStyle='rgba(90,60,45,.85)';g.lineWidth=.5;g.beginPath();g.moveTo(ax,ay);g.lineTo(PL.fx,PL.fy);g.stroke();
  const C={o:'#4e3026',p:'#f59ab5',w:'#fff4f8',q:'#8a5a3c',t:'#7fcfc2'},sh=clamp(-PL.vx/160,-.6,.6),fx=Math.round(PL.fx),fy=Math.round(PL.fy);
  const put=(P,x0,y0,s)=>P.forEach((row,j)=>{const ox=Math.round(j*s);for(let i=0;i<row.length;i++){const k=row[i];if(k!=='.'){g.fillStyle=C[k];g.fillRect(x0+i+ox,y0+j,1,1)}}});
  put(PL_TEAL,fx-4,fy+1,sh-.35);put(PL_FEATHER,fx-3,fy,sh);   // chùm lông lật ngược: buộc ở đầu dây, xòe xuống dưới
}

/* ---------- thanh trên khung phòng và nút dưới phòng ---------- */
let plBarEl=null;
function plBar(){
  if(!plBarEl){const w=$('roomwrap');if(!w)return;plBarEl=document.createElement('div');plBarEl.id='plbar';w.appendChild(plBarEl)}
  if(!PL.on){plBarEl.classList.remove('on');return}
  const K=PLAY_KIND[PL.k],s=Math.max(0,Math.ceil(PL.t)),h='<span class="pl-ic">'+K.ic+'</span><span class="pl-tx"><b>'+K.n+'</b><small>'+(PL.k==='laser'?'Chạm vào phòng để chỉ chỗ':'Rê chuột hoặc kéo ngón tay để vẫy')+'</small></span><b class="pl-s">'+s+'s</b><button class="sm" onclick="plStop(1)" aria-label="Dừng chơi">⏹ Dừng</button>';
  if(plBarEl.dataset.k!==h){plBarEl.dataset.k=h;plBarEl.innerHTML=emo(h)}
  plBarEl.classList.add('on');
}
function plBtn(){
  if(!playOpen())return '';
  if(PL.on)return '<button class="plgo on" onclick="plStop(1)" data-tip="Dừng trò chơi">⏹ <span class="pl-l">Dừng chơi</span><span class="pl-sh">Dừng</span> <small>'+Math.max(0,Math.ceil(PL.t))+'s</small></button>';
  const r=playRoster(cur),n=r.ok.length;
  return '<button class="plgo'+(n?' go':'')+'" onclick="openPlay()" aria-label="Chơi với bé" data-tip="Chơi với bé: cần câu lông vũ hoặc đèn laser. '+(n?n+' bé sẵn sàng được thưởng.':'Chưa bé nào được thưởng lúc này, nhưng vẫn chơi được.')+'">🪶 <span class="pl-l">Chơi với bé</span><span class="pl-sh">Chơi</span></button>';
}
{const H0=PANEL.home;PANEL.home=function(){
  const h=H0.apply(this,arguments);if(edit)return h;const b=plBtn();if(!b)return h;
  const k='<button onclick="toggleEdit()">',i=h.indexOf(k);return i<0?h:h.slice(0,i)+b+h.slice(i);
}}

/* ---------- bảng chọn trò ---------- */
function openPlay(){
  if(!playOpen()){toast('Mở khóa ở cấp '+PLAYC.lv+'.',{icon:'🔒'});return}
  const r=playRoster(cur),can=r.ok.length+r.wait.length,R=ROOM[cur]||{n:''};
  const nm=L=>L.map(o=>esc(o.c.name)).join(', ');
  const card=k=>{const K=PLAY_KIND[k];return '<div class="card pl-card"><div class="pl-big">'+K.ic+'</div><div class="g"><b>'+K.n+'</b><br><small>'+K.d+' Vồ trúng: +'+PLAYC.hp[k]+' vui.</small></div>'+
    '<button class="on" '+(can?'':'disabled ')+'onclick="closeModal();plStart(\''+k+'\')">▶ Chơi</button></div>'};
  modal('<div class="pl"><h3>🪶 Chơi với bé · '+esc(R.n)+'</h3>'+
    '<div class="dim pl-intro">Một lượt '+PLAYC.dur+' giây. Các bé ở gần đuổi theo và nhảy vồ. Mỗi bé được thưởng '+Math.round(PLAYC.cd/60000)+' phút một lần: thêm độ vui và '+PLAYC.xp+' kinh nghiệm, mất '+PLAYC.cost+' năng lượng.</div>'+
    card('feather')+card('laser')+
    '<div class="pl-ros">'+
      (r.ok.length?'<div><b class="pl-g">✓ Sẵn sàng ('+r.ok.length+')</b> '+nm(r.ok)+'</div>':'')+
      (r.wait.length?'<div><b>⏳ Vừa chơi, chưa được thưởng lại</b> '+r.wait.map(o=>esc(o.c.name)+' <small class="dim">'+Math.ceil(o.cd/60000)+' phút</small>').join(', ')+'</div>':'')+
      (r.no.length?'<div><b class="pl-b">✕ Không chơi được</b> '+r.no.map(o=>esc(o.c.name)+' <small class="dim">('+esc(o.why)+')</small>').join(', ')+'</div>':'')+
      (!can?'<div class="pl-none">Không bé nào trong phòng này chơi được lúc này. Bé mệt thì cho ngủ, bé đang ăn thì chờ ăn xong.</div>':'')+
    '</div></div>');
}
function plStart(k,force){
  if(!playOpen()&&!force)return;
  if(PL.on)plStop();
  if(tab!=='home')setTab('home');if(edit)toggleEdit();if(fol)unfollow(false);
  Object.assign(PL,{on:1,k:k==='laser'?'laser':'feather',t:PLAYC.dur,rid:cur,ptr:null,act:0,hov:0,idle:9,scan:0,hits:0,got:[],ph:0,wait:.3,man:0,force:!!force});
  const cx=camX+VW/2,[y0,y1]=plViewY();
  PL.ax=PL.hx=cx;PL.ay=PL.hy=Math.min(y0+4,FLOOR_MAX-20)-12;PL.fx=cx;PL.fy=PL.ay+16;PL.vx=PL.vy=0;
  PL.lx=cx;PL.ly=(y0+y1)/2;PL.tx=PL.lx;PL.ty=PL.ly;PL.lvx=0;
  if(playOpen())playBegin();
  plBar();renderPanel();
}
function plStop(why){   // why: 1 bấm Dừng, 'time' hết giờ, bỏ trống là tự dừng (đổi phòng, đổi tab...)
  if(!PL.on)return;PL.on=0;
  ents.forEach(plFree);plBar();
  if(PL.hits||why==='time')toast(PL.hits?'Các bé vồ trúng '+PL.hits+' lần'+(PL.got.length?', '+PL.got.length+' bé vui hơn: '+PL.got.slice(0,4).join(', ')+(PL.got.length>4?'…':''):'')+'.':'Chưa bé nào vồ trúng. Lần sau đưa đồ chơi lại gần các bé hơn nhé.',{icon:PLAY_KIND[PL.k].ic,title:'Hết lượt chơi',key:'playend'});
  if(tab==='home')renderPanel();
}
// đổi tab, ẩn trang: dừng (critStep chỉ chạy ở tab Phòng)
setInterval(()=>{if(PL.on&&(tab!=='home'||edit||document.hidden||cur!==PL.rid))plStop()},500);

/* ---------- bọc hàm của ui.js ---------- */
{const E0=stepEnt;stepEnt=function(e,dt){
  if(e.pl){if(!PL.on||!plCan(e))plFree(e);else plDrive(e,dt)}
  E0.apply(this,arguments);
  if(e.pl&&e.pl.jmp&&e.state!=='jump'){e.pl.jmp=0;plLand(e)}
}}
// đang chơi: bé rảnh ở gần không đi chỗ khác mà nhập cuộc ngay
{const C0=choose;choose=function(e){
  if(PL.on&&!e.pl&&!e.clone&&!e.ghost){const c=entCat(e),T=plToy();if(c&&!playWhy(c)&&Math.abs(e.x-T.x)<=PLAYC.near&&ents.filter(o=>o.pl).length<PLAYC.max){e.state='idle';e.t=1;plJoin(e);return}}
  return C0.apply(this,arguments);
}}
{const S0=critStep;critStep=function(dt){S0.apply(this,arguments);plStep(dt)}}
{const D0=critDraw;critDraw=function(g){D0.apply(this,arguments);plDraw(g)}}
{const R0=setRoom;setRoom=function(){if(PL.on)plStop();return R0.apply(this,arguments)}}

/* ---------- chuột và chạm: chặn ở pha capture của #roomwrap để khung phòng không cuộn ---------- */
(()=>{
  const rw=$('roomwrap');if(!rw)return;
  const aim=(ev,down)=>{const p=ppos(ev);PL.px=p.x;PL.py=p.y;PL.idle=0;PL.act=1;
    if(PL.k==='laser'){if(down||PL.ptr!=null){PL.tx=clamp(p.x+camX,8,WORLD_W-8);PL.ty=clamp(p.y+camY,FLOOR_MIN-30,FLOOR_MAX);PL.man=down?1.4:1}}
    else{PL.ax=p.x+camX;PL.ay=p.y+camY;PL.hx=PL.ax;PL.hy=PL.ay}};
  rw.addEventListener('pointerdown',ev=>{if(!PL.on||ev.target!==room)return;ev.stopPropagation();ev.preventDefault();PL.ptr=ev.pointerId;try{room.setPointerCapture(ev.pointerId)}catch(e){}aim(ev,1)},true);
  rw.addEventListener('pointermove',ev=>{if(!PL.on||ev.target!==room)return;ev.stopPropagation();if(ev.pointerType==='mouse'){PL.hov=1;if(PL.k!=='laser'||PL.ptr!=null)aim(ev,0)}else if(PL.ptr===ev.pointerId)aim(ev,0)},true);
  const up=ev=>{if(!PL.on||ev.target!==room)return;ev.stopPropagation();if(PL.ptr===ev.pointerId)PL.ptr=null};
  rw.addEventListener('pointerup',up,true);rw.addEventListener('pointercancel',up,true);
  room.addEventListener('pointerleave',()=>{PL.hov=0});
})();

/* ---------- nhiệm vụ ngày và thành tựu ---------- */
if(typeof Q_DEF!=='undefined'&&!Q_DEF.play){
  Q_DEF.play={ic:'🪶',t:n=>'Chơi với bé '+n+' lần (bé vồ trúng đồ chơi)',d:()=>3};
  Q_DAY.push('play');
  const Q0=qRoll;qRoll=function(pool,n,kind){return Q0.call(this,playOpen()?pool:pool.filter(k=>k!=='play'),n,kind)};
}
if(typeof achSer==='function')achSer('care','play',stv('play'),n=>'Chơi với mèo '+fN(n)+' lần (bé vồ trúng đồ chơi và được thưởng).',[[1,0,'Bạn chơi của mèo'],[50,1,'Cần thủ lông vũ'],[300,2,'Vua đồ chơi']]);

/* ---------- Sổ tay (file nạp trước tut-wx.js) ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='play'))return;
  let i=P.findIndex(p=>p.id==='bed');if(i<0)i=P.findIndex(p=>p.id==='room');
  P.splice(i<0?P.length:i+1,0,{id:'play',ic:'🪶',t:'Chơi với bé',p:[
    'Từ cấp '+PLAYC.lv+', tab Phòng có nút 🪶 Chơi ngay cạnh nút Cho uống. Chọn một trong hai trò, mỗi lượt '+PLAYC.dur+' giây; bấm ⏹ Dừng để thôi sớm.',
    PLAY_KIND.feather.ic+' Cần câu lông vũ: lông vũ bay theo chuột (máy tính) hoặc theo ngón tay khi bạn kéo trên khung phòng. Đưa lông vũ sát sàn để các bé với tới; giật lên đúng lúc để trêu bé.',
    PLAY_KIND.laser.ic+' Đèn laser: chấm đỏ tự chạy khắp phòng, các bé lao theo rất nhanh. Chạm vào phòng để chỉ chỗ cho chấm đỏ.',
    'Tối đa '+PLAYC.max+' bé ở gần nhất cùng chơi. Bé vồ trúng thì được thêm độ vui (lông vũ +'+PLAYC.hp.feather+', laser +'+PLAYC.hp.laser+') và '+PLAYC.xp+' kinh nghiệm, mất '+PLAYC.cost+' năng lượng. Mỗi bé được thưởng '+Math.round(PLAYC.cd/60000)+' phút một lần; trong lúc chờ bé vẫn chơi, chỉ không cộng gì.',
    'Bé không chơi: đang ngủ, đang ăn uống, mệt (năng lượng dưới '+PLAYC.en+'), đau chân, đi lạc, nằm viện hoặc đi vắng. Bảng chọn trò ghi rõ lý do từng bé.']})})();
if(typeof TUT_TEXT!=='undefined'&&TUT_TEXT.hints)TUT_TEXT.hints.play=[
  'Bấm 🪶 Chơi để chơi với các bé: cần câu lông vũ hoặc đèn laser.',
  'Bé vồ trúng đồ chơi thì vui hơn. Mỗi bé được thưởng 10 phút một lần.'];

/* ---------- mẹo lần đầu (TUT nạp sau file này nên đợi trang nạp xong) ---------- */
addEventListener('load',()=>{
  if(typeof TUT==='undefined'||!TUT.hint)return;
  const q=s=>document.querySelector(s);
  setInterval(()=>{
    const st=S&&S.tut;if(!st||!st.done||st.fl||(st.hints&&st.hints.all)||TUT.seen('play'))return;
    if(TUT.active()||TUT.replaying()||q('.tut-tip.on')||document.hidden||q('#gz').className||$('modal').style.display==='flex')return;
    if(typeof needLandscape==='function'&&needLandscape())return;
    if(tab!=='home'||edit||!playOpen()||PL.on||!homeCats(cur).length)return;
    const b=q('#panel .plgo');if(!b||!b.getClientRects().length)return;
    const r=b.getBoundingClientRect();if(r.bottom<0||r.top>innerHeight)return;
    const live=()=>tab==='home'&&!edit&&!PL.on?q('#panel .plgo'):null;
    TUT.hint('play',{target:live});
  },1500);
});

/* ---------- Admin ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div'),p=S.play||{};
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🪶 Chơi với bé</b><div class="dim">'+(p.s|0)+' lượt chơi · '+(p.n|0)+' lần được thưởng · '+Object.keys(p.at||{}).length+' bé đang chờ 10 phút</div>'+
    '<div class="row wrap">'+B('admPlay(1)','🪶 Chơi lông vũ ngay')+B('admPlay(2)','🔴 Chơi laser ngay')+B('admPlay(3)','⏱ Xóa thời gian chờ')+B('admPlay(4)','⚡ Bé trong phòng đầy năng lượng')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admPlay(k){
  if(k===1||k===2){closeModal();plStart(k===1?'feather':'laser',1);return}
  if(k===3){if(S.play)S.play.at={};admDone('Mọi bé được thưởng chơi lại ngay',1);return}
  homeCats(cur).forEach(c=>{c.en=100});admDone('Các bé trong phòng đã đầy năng lượng',1);
}
