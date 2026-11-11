"use strict";
/* ============ ƯỚC MUỐN CỦA MÈO (2026-11-11) ============
   Đang xem tab Phòng thì cứ 2,5–5 phút một bé trong phòng nảy ra một ước muốn, hiện bong bóng trên đầu:
     pet   muốn được vuốt ve (chạm vào bé),
     food  thèm một món (cho phòng ăn đúng món đó; chỉ ra khi bát đã đổ lại được),
     catch muốn xem bắt khách lạ (bắt một vị khách lạ trong phòng này).
   Làm đúng trước khi hết giờ: xu (5 + 2 × cấp, nhân hệ số xu), +8 độ vui cho bé, 2 kinh nghiệm, onAct('wish').
   Hết giờ thì bong bóng tắt, không phạt. Mỗi lúc chỉ có một ước muốn; không lưu vào bản lưu.
   Móc: nối thêm vào critStep / critDraw (quest.js), bọc petCat và feedRoom (game.js), bọc onAct; ui.js gọi wishLine() trong tab Phòng. */
const WISH={
  pet:{t:'mong được vuốt ve',h:'Chạm vào bé trong phòng.',ic:'paw',dur:180},
  food:{t:f=>'thèm '+FOOD[f].n.toLowerCase(),h:f=>'Cho phòng này ăn '+FOOD[f].n+'.',dur:300},
  catch:{t:'muốn xem bạn bắt khách lạ',h:'Bắt một vị khách lạ chạy qua phòng này.',ic:'bfly',dur:240},
};
let wish=null,wishNext=rnd(60,120);
const wishRew=()=>Math.max(1,Math.round((5+2*qLv())*gMult()));
const wishCat=()=>wish&&catBy(wish.uid);
function wishOn(){const c=wishCat();return !!(c&&c.room===wish.rid&&!onTrip(c.uid))}
function wishSpawn(){
  const L=homeCats(cur).filter(c=>ents.some(e=>e.uid===c.uid&&!e.ghost&&!e.clone));if(!L.length)return;
  const c=pick(L),k=[];
  if(now()-(c.petAt||0)>=PET_CD)k.push('pet','pet');
  if(bowlsIn(cur).length&&bowlReady(cur))k.push('food','food');
  k.push('catch');
  const kind=pick(k),w={uid:c.uid,rid:cur,k:kind,end:now()+WISH[kind].dur*1000};
  if(kind==='food'){const ok=FOODS.filter(f=>!locked(f)).map(f=>f.id),fv=favs(c).filter(f=>ok.includes(f));w.food=fv.length&&ch(.6)?pick(fv):pick(ok)}
  wish=w;const e=ents.find(e=>e.uid===c.uid);if(e)e.emoT=1;
  if(tab==='home')renderPanel();
}
function wishDone(){
  const c=wishCat();if(!c){wish=null;return}
  const n=wishRew();S.coins+=n;c.hp=clamp(c.hp+8,0,100);addXp(2);
  const e=ents.find(e=>e.uid===c.uid);if(e){e.emoT=2;const p=entPos(e);for(let i=0;i<12;i++)rp(p.x+rnd(-8,8),p.y-rnd(20,40),pick(['#f59ab5','#ffd1dc','#ffe07a']),{sh:ch(.5)?'heart':'star',vx:rnd(-20,20),vy:rnd(-40,-15),g:60,life:rnd(.6,1)})}
  wish=null;wishNext=rnd(150,300);onAct('wish',1);save();
  toast(c.name+' vui lắm! +8 độ vui',{type:'pet',title:'💭 Ước muốn thành sự thật',coins:n,key:'wish'});render();
}
// dòng nhắc trong tab Phòng (ui.js gọi ngay dưới hàng Cho ăn)
function wishLine(){
  if(!wish||!wishOn()||wish.rid!==cur)return '';
  const c=wishCat(),W=WISH[wish.k],t=typeof W.t==='function'?W.t(wish.food):W.t,h=typeof W.h==='function'?W.h(wish.food):W.h,left=Math.max(0,Math.ceil((wish.end-now())/1000));
  return '<div class="card"><div style="font-size:24px">💭</div><div class="g"><b>'+esc(c.name)+'</b> '+t+'. <small>'+h+'</small><br><small>còn '+Math.floor(left/60)+':'+String(left%60).padStart(2,'0')+' · thưởng 🪙 '+wishRew()+' và +8 độ vui</small></div></div>';
}
{const cs=critStep;critStep=function(dt){cs(dt);
  if(!qOn()||edit||document.hidden)return;
  if(wish&&(now()>wish.end||!wishOn())){wish=null;wishNext=rnd(150,300);if(tab==='home')renderPanel()}
  if(!wish&&(wishNext-=dt)<=0){wishNext=rnd(150,300);wishSpawn()}
}}
/* bong bóng trên đầu bé: khung hạt cườm trắng, giữa là biểu tượng việc bé muốn */
const WCV={};
function wishCv(name){
  const k=fk(BS),key=name+'|'+k;if(WCV[key])return WCV[key];
  const b=new Art.Buf(16,16),W=[253,248,238];b.ell(8,7,7.4,6.4,W);b.tri(4,11,8,12,3.4,15.4,W);b.ell(1.6,14.6,1,1,W);b.outline([112,74,52]);
  const bc=bufCanvas(b,k),ic=bufCanvas(Art.icon(name),k),c=document.createElement('canvas');c.width=bc.width;c.height=bc.height;
  const u=bc.width/16,g=c.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(bc,0,0);g.drawImage(ic,Math.round(2.5*u),Math.round(1.2*u),Math.round(11*u),Math.round(11*u));   // u: số điểm ảnh canvas cho mỗi ô của bong bóng
  return WCV[key]=c;
}
{const cd=critDraw;critDraw=function(g){cd(g);
  if(!wish||wish.rid!==cur||!wishOn())return;const e=ents.find(e=>e.uid===wish.uid&&!e.ghost&&!e.clone);if(!e)return;
  const p=entPos(e),W=WISH[wish.k],name=wish.k==='food'?(EMO_IC[FOOD[wish.food].ic]||'bowl'):W.ic,t=performance.now()/1000;
  const x=Math.round((p.x-3)*ZC)/ZC,y=Math.round((p.y-58+Math.sin(t*2.4)*1.5)*ZC)/ZC,left=(wish.end-now())/1000;
  if(left<20&&Math.floor(t*4)%2)return;   // sắp hết giờ thì nhấp nháy
  g.drawImage(wishCv(name),x,y,16,16);
}}
// làm đúng ước muốn
{const pc=petCat;petCat=function(c){const n=pc.apply(this,arguments);if(n&&wish&&wish.k==='pet'&&c&&c.uid===wish.uid&&wishOn())wishDone();return n}}
{const fr=feedRoom;feedRoom=function(rid,fid){const r=fr.apply(this,arguments);if(r&&wish&&wish.k==='food'&&wish.food===fid&&wish.rid===rid&&wishOn())setTimeout(wishDone,600);return r}}
{const oa=onAct;onAct=(k,v)=>{oa(k,v);if(k==='catch'&&wish&&wish.k==='catch'&&wish.rid===cur&&wishOn())setTimeout(wishDone,400)}}
