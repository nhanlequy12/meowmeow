"use strict";
/* ============ MÈO TRONG PHÒNG ĐI TỚI BÁT RỒI MỚI ĂN, UỐNG (2026-11-12) ============
   Nạp sau ui.js, wx-ui.js, pw-ui.js, water-ui.js, med-ui.js, meal-art*.js, meal-fx.js. Lõi ở js/meal.js (c.meal, mealArrive, mealStop...).
   Chỉ bọc hàm có sẵn của ui.js (stepEnt, arrive, entPos, drawEnt, drawItem, critDraw) và putBed của game.js, không sửa file khác.

   Mèo trong phòng đang xem có c.meal:
   - st 'go': đi (xa hoặc đói thì chạy) tới chỗ ăn của mình ở hai bên bát (chỗ trái, phải; bát nhiều chỗ hơn thì thêm vòng ngoài).
     Hết chỗ thì tới hàng chờ, lệch ra sau bát. Tới nơi thì gọi mealArrive(c) và đứng quay mặt vào bát.
   - st 'wait': ngồi ở hàng chờ, có dấu "…" nhấp nháy; được lên ăn thì đi sang chỗ trống.
   - st 'eat': đứng ở chỗ ăn, cúi đầu vào bát (nửa trên sprite xoay quanh hông, chân giữ nguyên trên sàn).
     Ăn: nhịp nhai chậm, thỉnh thoảng ngẩng lên, rơi vụn. Uống: nhịp liếm nhanh, giọt nước bắn, thỉnh thoảng hiện giọt 💧 trên đầu.
   - c.meal biến mất: ăn xong (tiến độ đã đủ) thì hiện tim rồi về hành vi bình thường; bị hủy thì về luôn.
   Chờ cho xong rồi mới đi: đang nhảy, đang diễn hành động riêng (sig), đang chào tạm biệt (bye), đang trốn (hide, sấm sét).
   Đang ở trên đồ leo trèo thì nhảy xuống sớm. Đang ngủ trong ổ: lõi chỉ giao bát cho bé trong ổ khi bé đói hoặc khát nặng,
   nên bé dậy (kickBed) rồi đi ăn; nếu chờ bé ngủ tới đầy năng lượng thì lõi hết hạn rồi lại giao bát, giữ chỗ lặp mãi.
   Bị cho đi ngủ (putBed) giữa bữa thì mealStop(c,'bed'). Bị nhấc, kéo đi (e.held / e.drag / state 'held' | 'drag'; ui.js hiện
   chưa có thao tác kéo mèo trong phòng) thì mealStop(c,'drag'). Phân thân của Naruto tan khi bản thể có bữa (như cũ).
   Móc cũ chạy ra bát theo c.eat (ui.js) và c.drink (wx-ui.js) bị tắt bằng e.eatT / e.drinkT rất lớn. */
{
const MEW={hw:b=>FURN[b.fid].w/2,
  cut:31,pvx:44,                 // nửa trên sprite nhìn ngang (hàng 0..30) xoay quanh hông (cột 44, hàng 31); chân giữ nguyên
  run:45,                        // xa hơn 45 ô thì chạy, để kịp tới trước khi lõi hết hạn chờ
  stand:11,                      // chỗ ăn cách mép bát 11 ô: miệng mèo cúi xuống vừa chạm mép bát
  near:22,                       // nhưng cách tâm bát ít nhất 22 ô, để đầu hai bé hai bên bát nhỏ không chạm nhau
  queue:36,                      // hàng chờ lùi thêm 36 ô: bé đang ăn chiếm khoảng 30 ô phía sau chỗ ăn
};
const meBowl=m=>S.items.find(i=>i.iid===m.iid&&i.room===cur);
const meHungry=(c,k)=>k==='f'?c.full<35:(c.wa==null?100:c.wa)<35;
// các chỗ ăn của một bát: k chẵn bên trái (quay mặt sang phải), k lẻ bên phải; vòng ngoài lùi ra và lùi về sau
function meSlots(b){
  const n=mSlots(b),hw=MEW.hw(b),out=[];
  for(let k=0;k<n;k++){const side=k%2?1:-1,ring=k>>1;out.push({k,side,x:clamp(b.x+side*(Math.max(hw+MEW.stand,MEW.near)+ring*12),14,WORLD_W-14),y:clamp(b.y+1-ring*4,FLOOR_MIN,FLOOR_MAX)})}
  return out;
}
// chỗ đứng trong hàng chờ: lệch ra sau bát, xen kẽ hai bên, bắt đầu từ phía giữa phòng
function meQueue(b,i){
  const pref=b.x<WORLD_W/2?1:-1,side=i%2?-pref:pref,row=i>>1,hw=MEW.hw(b);
  return {x:clamp(b.x+side*(Math.max(hw+MEW.stand,MEW.near)+MEW.queue+row*16),14,WORLD_W-14),y:clamp(b.y-6+(row%2)*3,FLOOR_MIN,FLOOR_MAX)};
}
const meOthers=(e,b)=>ents.filter(o=>o!==e&&!o.clone&&!o.ghost&&!o.dead).map(o=>{const oc=entCat(o);return {o,m:oc&&mealOf(oc)}}).filter(x=>x.m&&x.m.iid===b.iid);
// chỗ của bé: giữ chỗ ăn (e.ms) nếu còn hợp lệ, không thì lấy chỗ trống gần nhất; bé đang ăn được ưu tiên hơn bé đang đi tới
function meSpot(e,c,m,b){
  const os=meOthers(e,b),sl=meSlots(b);
  const usedEat=new Set(os.filter(x=>x.m.st==='eat'&&x.o.ms!=null).map(x=>x.o.ms)),usedGo=new Set(os.filter(x=>x.m.st==='go'&&x.o.ms!=null).map(x=>x.o.ms));
  if(m.st==='eat'||m.st==='go'){
    const ok=e.ms!=null&&e.ms<sl.length&&!usedEat.has(e.ms)&&(m.st==='eat'||!usedGo.has(e.ms));
    if(!ok){let fr=sl.filter(s=>!usedEat.has(s.k)&&!usedGo.has(s.k));if(!fr.length&&m.st==='eat')fr=sl.filter(s=>!usedEat.has(s.k));
      e.ms=fr.length?fr.sort((p,q)=>Math.abs(p.x-e.x)-Math.abs(q.x-e.x))[0].k:null}
  }else e.ms=null;
  if(e.ms!=null){const s=sl[e.ms];return {x:s.x,y:s.y,flip:s.side<0,slot:1}}
  const q=os.filter(x=>x.o.ms==null&&x.m.st!=='eat').map(x=>({m:x.m,u:x.o.uid})).concat([{m,u:e.uid}]).sort((p,r)=>(p.m.t-r.m.t)||(p.u-r.u));
  const p=meQueue(b,q.findIndex(x=>x.u===e.uid));return {x:p.x,y:p.y,flip:p.x<b.x,slot:0};
}
function meWalk(e,c,m,sp){
  const d=Math.hypot(sp.x-e.x,sp.y-e.y),moving=e.state==='walk'||e.state==='run';
  e.goal={meal:1};e.chase=0;e.tx=sp.x;e.ty=sp.y;e.left=0;e.emo=null;
  if(!moving){e.state=d>MEW.run||meHungry(c,m.k)?'run':'walk';e.pre=.12;e.acc=0}
  else if(e.state==='walk'&&d>MEW.run)e.state='run';
}
function meArrive(e){
  const c=entCat(e),m=c&&mealOf(c);
  if(!m){e.goal=null;e.state='idle';e.t=rnd(.4,1);return}
  e.state='meal';e.t=99;e.emo=null;e.mea=0;
  const b=meBowl(m);if(b){const sp=meSpot(e,c,m,b);e.flip=sp.flip}
  if(m.st==='go')mealArrive(c);
}
// bữa vừa kết thúc (c.meal không còn)
function meDone(e,c){
  const ok=e.mst==='eat'&&e.mpr>.97,inMeal=e.state==='meal'||(e.goal&&e.goal.meal);
  e.mk=null;e.ms=null;e.mst=null;e.mpr=0;
  if(!inMeal)return;
  e.goal=null;e.state='idle';e.emo=null;e.t=ok?rnd(.9,1.6):rnd(.3,.8);
  if(ok){e.emoT=1.6;const q=entPos(e);for(let i=0;i<5;i++)rp(q.x+rnd(-7,7),q.y-rnd(18,30),pick(['#f59ab5','#ffd1dc']),{sh:'heart',vx:rnd(-10,10),vy:rnd(-30,-12),g:40,life:rnd(.6,.9)})}
}
// mỗi khung: trả 1 nếu ent đã bị gỡ (phân thân tan)
function meStep(e,c,dt){
  const m=mealOf(c);
  if(e.clone){if(m){const q=entPos(e);poof(q.x,q.y);e.dead=1;return 1}return 0}
  if(m&&(e.held||e.drag||e.state==='held'||e.state==='drag')){mealStop(c,'drag');return 0}   // bị nhấc, kéo đi: trả suất
  if(!m){if(e.mk)meDone(e,c);return 0}
  const key=m.iid+':'+m.t;
  if(e.mk!==key){                                             // bữa mới (hoặc lần đầu thấy bữa này, ví dụ vừa mở phòng)
    const first=e.mk==null;e.mk=key;e.ms=null;e.mea=0;
    if(c.bed!=null)kickBed(c.uid);                            // lõi chỉ giao bát cho bé trong ổ khi bé đói, khát nặng: dậy đi ăn
    if(first&&m.st!=='go'&&e.state!=='jump'&&e.state!=='bed'){const b=meBowl(m);if(b){const sp=meSpot(e,c,m,b);e.x=sp.x;e.y=sp.y;e.flip=sp.flip;e.goal={meal:1};e.state='meal';e.t=99;e.emo=null}} // đang xếp hàng hoặc đang ăn sẵn: đứng luôn ở chỗ
  }
  e.mst=m.st;e.mpr=mealProg(m);
  if(e.state==='bed'||e.state==='jump'||e.state==='sig'||e.state==='bye'||e.state==='hide')return 0;  // chờ xong việc đang làm
  if(e.state==='use'&&e.goal&&e.goal.at>=0){if(!e.goal.down&&e.t>.25)e.t=.25;return 0}              // đang ở trên đồ leo trèo: nhảy xuống sớm
  const b=meBowl(m);
  if(!b){if(e.state==='meal'){e.goal=null;e.state='idle';e.t=.6}return 0}                           // bát vừa bị cất: lõi sẽ hủy
  const sp=meSpot(e,c,m,b),d=Math.hypot(sp.x-e.x,sp.y-e.y);
  if(e.state==='meal'){
    e.t=99;e.goal={meal:1};
    if(d>2){meWalk(e,c,m,sp);return 0}
    e.flip=sp.flip;e.mea=m.st==='eat'&&sp.slot?(e.mea||0)+dt:0;
    if(m.st==='go'&&!m.arr)mealArrive(c);
    return 0;
  }
  if((e.state==='walk'||e.state==='run')&&e.goal&&e.goal.meal){e.tx=sp.x;e.ty=sp.y;if(e.state==='walk'&&d>MEW.run*2)e.state='run';return 0}
  if(d<1.5){e.x=sp.x;e.y=sp.y;e.goal={meal:1};meArrive(e);return 0}
  meWalk(e,c,m,sp);return 0;
}

{const S0=stepEnt;stepEnt=function(e,dt){
  const c=entCat(e);
  if(c&&!e.ghost){e.eatT=e.drinkT=9e15;if(meStep(e,c,dt))return}   // tắt móc cũ c.eat / c.drink
  return S0.apply(this,arguments);
}}
{const A0=arrive;arrive=function(e){if(e.goal&&e.goal.meal){meArrive(e);return}return A0.apply(this,arguments)}}
// cho đi ngủ giữa bữa: bỏ bữa (chưa ăn thì trả giữ chỗ, đang ăn thì tính phần đã ăn)
if(typeof putBed==='function'){const P0=putBed;putBed=function(uid){const r=P0.apply(this,arguments);if(r&&r.ok){const c=catBy(uid);if(c&&mealOf(c))mealStop(c,'bed')}return r}}

// tư thế: xếp hàng thì ngồi, tới chỗ ăn thì đứng quay mặt vào bát, đang ăn thì cúi đầu theo nhịp
{const E0=entPos;entPos=function(e){
  if(e.state!=='meal')return E0.apply(this,arguments);
  const c=entCat(e),m=c&&mealOf(c);
  if(!m||e.ms==null)return {x:e.x,y:e.y,sy:e.y,pose:idlePose(e),mw:m?m.st:null};
  if(m.st!=='eat')return {x:e.x,y:e.y,sy:e.y,pose:'stand'};
  const t=e.mea||0,ease=clamp(t/.35,0,1),w=m.k==='w';
  // ăn: nhai chậm và thỉnh thoảng ngẩng lên một chút; uống: liếm nhanh, đầu gần như không rời bát
  const a=w?.23+.03*Math.sin(t*Math.PI*2*4.6):.19+.05*Math.sin(t*Math.PI*2*1.7)-.12*Math.pow(Math.max(0,Math.sin(t*Math.PI*2/3.6)),10);
  return {x:e.x,y:e.y,sy:e.y,pose:'stand',meal:{a:a*ease,k:m.k}};
}}

// vẽ cúi đầu: nửa trên sprite xoay quanh hông, nửa dưới (chân) vẽ nguyên chỗ
function meTilt(g,di,img,dx,dy,dw,dh,a){
  const ky=img.height/img.lh,sx=dw/img.lw,sy=dh/img.lh,cut=MEW.cut,pv=MEW.pvx;
  di.call(g,img,0,cut*ky,img.width,img.height-cut*ky,dx,dy+cut*sy,dw,dh-cut*sy);
  g.save();g.translate(dx+pv*sx,dy+cut*sy);g.rotate(-a);di.call(g,img,0,0,img.width,cut*ky,-pv*sx,-cut*sy,dw,cut*sy);g.restore();
}
EMO.drop=["..#..",".###.","#####","#####",".###."];EMOC.drop='#5ab0e8';
{const D0=drawEnt;drawEnt=function(e,p){
  if(e.state!=='meal'||!p)return D0.apply(this,arguments);
  const c=entCat(e);if(!c)return D0.apply(this,arguments);
  const ml=p.meal;let f0=null,cv=null;
  if(ml){
    if(c.full<20){f0=c.full;c.full=20}                       // đang ăn: tạm ẩn dấu chấm than đói của ui.js
    const k0=lk(c),key=p.look||(e.fm&&e.fm.key)||RKEY[k0]||k0;cv=catCv(key,p.pose);
  }
  const di=RX.drawImage;let done=!cv;
  if(cv)RX.drawImage=function(img){if(!done&&img===cv&&arguments.length===5){done=true;return meTilt(this,di,img,arguments[1],arguments[2],arguments[3],arguments[4],ml.a)}return di.apply(this,arguments)};
  try{D0.apply(this,arguments)}finally{if(cv)delete RX.drawImage;if(f0!=null)c.full=f0}
  const t=performance.now()/1000,ex=Math.round(p.x),by=Math.round(p.y-39+Math.sin(t*3+ex));
  if(ml){
    const dir=e.flip?1:-1,mx=p.x+dir*15,my=p.y-7;              // miệng (đã cúi) nằm trên mép bát
    if(ml.k==='w'){
      if(on(5))rp(mx+rnd(-2,2),my,pick(['#8fd0f4','#bfe6fb','#5ab0e8']),{vx:rnd(-12,12),vy:-rnd(14,30),g:120,life:rnd(.25,.45),sz:1});
      if(e.emoT<=0&&(t+e.uid*.37)%2.6<.8)drawEmo('drop',ex+8,by);
    }else if(on(2.2))rp(mx+rnd(-2,2),my,pick(['#c8955a','#a8743e','#e0b47a']),{vx:rnd(-10,10),vy:-rnd(8,18),g:110,life:rnd(.3,.5),sz:1});
  }else if(p.mw==='wait'&&e.emoT<=0&&c.full>=20){              // xếp hàng: "…" nhấp nháy
    const n=1+Math.floor(t*2.2+e.uid)%3;RX.fillStyle='#a58e7a';for(let i=0;i<n;i++)RX.fillRect(ex+8+i*2,by+4,1,1);
  }
}}

/* ---------- bát: hình theo mức đầy, nhãn số suất ---------- */
// bát ăn: mealVarF(i) của js/meal-art.js ('mf<0..8>:<món>'); bát nước: mealVarW(i) của js/meal-artw.js ('mw<0..8>:<loại>[|a1]').
// Lúc đang đổ, js/meal-fx.js cho mức mượt mealFxRatio(i, mức thật): thay số mức trong khóa bằng r>0 ? max(1, round(r*8)) : 0.
function meLv(i,v){
  if(typeof mealFxRatio!=='function'||!/^m[fw]\d+:/.test(v))return v;
  const real=fillRatio(i),r=mealFxRatio(i,real);if(r===real)return v;
  const n=r>0?Math.max(1,Math.min(8,Math.round(r*8))):0;return v.replace(/^(m[fw])\d+/,'$1'+n);
}
function meVar(i){
  const f=FURN[i.fid];if(i.broken)return 'broken';
  if(f.bowl){if(typeof mealVarF==='function')return meLv(i,mealVarF(i));return mShow('f',i)>.01?'full':''}
  if(f.water){if(typeof mealVarW==='function')return meLv(i,mealVarW(i));return typeof wxVar==='function'?wxVar(i):''}
  return typeof wxVar==='function'?wxVar(i):'';
}
// số trên nhãn: suất nguyên + phần dở (+ phần bé đang ăn chưa hết), làm tròn: còn trên một phần tư suất thì tính là một suất
function meCount(k,i){const v=mShow(k,i);return v<=.01?0:Math.max(1,Math.ceil(v-.25))}
const MEL={f:{ok:'#8a4a12',bd:'#b0702e',bg:'#fff3e2'},w:{ok:'#1d5f86',bd:'#3a8cba',bg:'#eaf6ff'},no:'#8a3040'};
drawItem=function(i){
  const f=FURN[i.fid],cv=furnCv(i.fid,meVar(i)),x0=Math.round(i.x-f.w/2),y0=Math.round(i.y-f.h);
  if(i.flip){RX.save();RX.translate(x0+f.w,y0);RX.scale(-1,1);RX.drawImage(cv,0,0,f.w,f.h);RX.restore()}else RX.drawImage(cv,x0,y0,f.w,f.h);
  if(edit&&sel===i.iid){RX.strokeStyle='#e58aa0';RX.lineWidth=1;RX.setLineDash([3,2]);RX.strokeRect(x0-1.5,y0-1.5,f.w+3,f.h+3);RX.setLineDash([])}
};
// nhãn số suất còn lại trên sức chứa, đặt ngay DƯỚI chân bát (bát ăn tông cam nâu; bát nước tông xanh, có 💧).
// Vẽ ở lượt critDraw (sau mèo và đồ) nên không bị che, và nằm dưới bát nên không che mặt bé đang cúi ăn.
function meLabel(i){
  const k=mbOf(i);if(!k||i.broken)return;
  const n=meCount(k,i),L=MEL[k],tx=(k==='w'?'💧':'')+n+'/'+MK[k].cap(i);RX.font='bold 4.5px system-ui,sans-serif';
  const tw=Math.ceil(RX.measureText(tx).width)+3,nx=Math.round(i.x-tw/2),ny=Math.round(i.y)+2,fg=n>0?L.ok:MEL.no;
  RX.fillStyle=n>0?L.bd:MEL.no;RX.fillRect(nx-.5,ny-.5,tw+1,7);RX.fillStyle=L.bg;RX.fillRect(nx,ny,tw,6);RX.fillStyle=fg;RX.textBaseline='top';RX.fillText(tx,nx+1.5,ny+.6);
}
{const C0=critDraw;critDraw=function(g){
  const r=C0.apply(this,arguments);
  itemsIn(cur).forEach(meLabel);return r;
}}
}
