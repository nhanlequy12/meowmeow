"use strict";
/* ============ NHIỆM VỤ VÀ KHÁCH LẠ TRONG PHÒNG (2026-11-11) ============
   Cho kiểu chơi liên tục: luôn có mục tiêu ngắn (nhiệm vụ trong giờ), mục tiêu trong ngày, và phần thưởng cho người đang nhìn màn hình
   (khách lạ chạy qua phòng, chạm kịp thì được xu, đôi khi có vé).
   - game.js gọi onAct(loại, số lượng) khi viễn chinh về, cho ăn, vuốt ve, quay gacha, mua đồ; file này gán onAct để cộng tiến độ.
   - ui.js gọi critStep(dt) mỗi khung khi đang ở tab Phòng, critDraw(g) lúc vẽ phòng, critHit(x, y) khi chạm vào phòng.
   - Trạng thái lưu ở S.q: {day, d:[nhiệm vụ ngày], all (đã nhận thưởng hoàn thành cả ngày), hour, h:[nhiệm vụ trong giờ], n (số khách đã bắt)}.
   Chỉ chạy sau khi xong hướng dẫn tân thủ (S.tut.done). */

/* ---------- nhiệm vụ ---------- */
const fmtN=n=>Math.round(n).toLocaleString('vi-VN');
const r10=n=>Math.max(10,Math.round(n/10)*10);
// d: số cần đạt cho nhiệm vụ ngày, h: cho nhiệm vụ trong giờ (không có h thì không ra ở loại trong giờ); tk: nhiệm vụ ngày tặng thêm 1 vé
const Q_DEF={
  trip:{ic:'🎒',t:n=>'Hoàn thành '+n+' chuyến viễn chinh',d:()=>2+slotCount()*3,h:()=>Math.max(1,slotCount())},
  feed:{ic:'🍖',t:n=>'Cho mèo ăn '+n+' lần',d:()=>6,h:()=>2},
  pet:{ic:'🤚',t:n=>'Vuốt ve mèo '+n+' lần',d:()=>Math.min(40,8+S.cats.length*2),h:()=>Math.min(8,2+S.cats.length)},
  catch:{ic:'🦋',t:n=>'Bắt '+n+' vị khách lạ trong phòng',d:()=>8,h:()=>2},
  tripcoin:{ic:'🪙',t:n=>'Kiếm '+fmtN(n)+' xu từ viễn chinh',d:()=>r10(150+130*qLv()),h:()=>r10(40+35*qLv())},
  gacha:{ic:'🥚',t:n=>'Quay gacha '+n+' lượt',d:()=>3,tk:1},
  fav:{ic:'❤',t:n=>'Cho bé ăn đúng món khoái khẩu '+n+' lần',d:()=>3},
  buy:{ic:'🛋',t:n=>'Mua '+n+' món nội thất',d:()=>1,tk:1},
};
const Q_DAY=['trip','feed','pet','catch','tripcoin','gacha','fav','buy'],Q_HOUR=['trip','feed','pet','catch','tripcoin'];
const qLv=()=>Math.min(S.level,MAX_LV);   // sau cấp 18 cấp vẫn tăng nhưng thưởng thì không
const qRewH=()=>r10(20+8*qLv()),qRewD=()=>r10(120+70*qLv()),qRewAll=()=>({coins:r10(200+120*qLv()),tickets:2});
const qOn=()=>!!(S&&S.tut&&S.tut.done);
const qDate=()=>new Date(now()),qDay=()=>{const d=qDate();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},qHour=()=>qDay()+'-'+qDate().getHours();
function qRoll(pool,n,kind){
  const a=pool.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}
  return a.slice(0,n).map(k=>({k,n:Q_DEF[k][kind](),p:0,got:0}));
}
// nhiệm vụ đã xong mà chưa bấm nhận khi hết giờ hay sang ngày: tự cộng thưởng, không để người chơi mất công
function qAuto(list,rew){let c=0,t=0;(list||[]).forEach(x=>{if(x.p>=x.n&&!x.got){x.got=1;c+=rew;if(x.tk)t++}});return {c,t}}
function qSync(){
  if(!qOn())return false;
  const first=!S.q,q=S.q||(S.q={n:0});let c=0,t=0;
  if(first&&typeof toast==='function')setTimeout(()=>toast('Mỗi giờ và mỗi ngày đều có nhiệm vụ mới, bấm 📜 Nhiệm vụ trên cùng để xem. Ở tab Phòng, chạm vào khách lạ chạy qua để bắt.',{type:'level',title:'Mới: Nhiệm vụ và khách lạ',icon:'📜',ms:6000}),1500);
  if(q.day!==qDay()){
    const a=qAuto(q.d,q.rd||0);c+=a.c;t+=a.t;
    if(q.d&&q.d.length&&q.d.every(x=>x.got)&&!q.all){const b=qRewAll();c+=b.coins;t+=b.tickets}
    q.day=qDay();q.d=qRoll(Q_DAY,3,'d');q.d.forEach(x=>{if(Q_DEF[x.k].tk)x.tk=1});q.rd=qRewD();q.all=0;
  }
  if(q.hour!==qHour()){const a=qAuto(q.h,q.rh||0);c+=a.c;t+=a.t;q.hour=qHour();q.h=qRoll(Q_HOUR,2,'h');q.rh=qRewH()}
  if(c||t){S.coins+=c;S.tickets+=t;save();if(typeof toast==='function')toast('Thưởng nhiệm vụ đã xong mà chưa nhận được cộng tự động.',{type:'coin',title:'📜 Nhiệm vụ',coins:c,icon:'📜'})}
  return true;
}
const qReady=()=>!qOn()||!S.q?0:[...(S.q.h||[]),...(S.q.d||[])].filter(x=>x.p>=x.n&&!x.got).length+(S.q.d&&S.q.d.every(x=>x.got)&&!S.q.all?1:0);
onAct=(k,v)=>{
  if(!qSync())return;
  [['h','trong giờ'],['d','hôm nay']].forEach(([w,lb])=>(S.q[w]||[]).forEach(x=>{
    if(x.k!==k||x.p>=x.n)return;x.p=Math.min(x.n,x.p+(v==null?1:v));
    if(x.p>=x.n&&typeof toast==='function')toast(Q_DEF[k].t(x.n)+'. Bấm 📜 Nhiệm vụ để nhận thưởng.',{type:'level',title:'Xong nhiệm vụ '+lb,icon:'📜'});
  }));
};
function qClaim(w,i){
  qSync();const q=S.q,x=w==='all'?null:q[w][i];
  if(w==='all'){if(q.all||!q.d.every(y=>y.got))return;q.all=1;const b=qRewAll();S.coins+=b.coins;S.tickets+=b.tickets;addXp(20);save();toast('Xong cả ba nhiệm vụ hôm nay! +'+b.tickets+' vé',{type:'level',title:'🎉 Thưởng cả ngày',coins:b.coins});openQuests();render();return}
  if(!x||x.got||x.p<x.n)return;
  x.got=1;const c=w==='h'?q.rh:q.rd;S.coins+=c;if(x.tk)S.tickets++;addXp(w==='h'?3:8);save();
  toast(Q_DEF[x.k].t(x.n)+(x.tk?' · +1 vé':''),{type:'coin',title:'Nhận thưởng nhiệm vụ',coins:c});openQuests();render();
}
function qLeft(w){const d=qDate(),e=new Date(d);if(w==='h')e.setHours(d.getHours()+1,0,0,0);else e.setHours(24,0,0,0);const m=Math.ceil((e-d)/60000);return m>60?Math.floor(m/60)+' giờ'+(m%60?' '+(m%60)+' phút':''):m+' phút'}
function qRow(w,x,i,rew){
  const D=Q_DEF[x.k],done=x.p>=x.n;
  return '<div class="card qrow'+(x.got?' qgot':'')+'"><div class="qic">'+D.ic+'</div><div class="g"><b>'+D.t(x.n)+'</b><div class="bar"><i style="width:'+Math.round(x.p/x.n*100)+'%"></i></div><small>'+(x.k==='tripcoin'?fmtN(x.p)+'/'+fmtN(x.n):x.p+'/'+x.n)+' · thưởng 🪙 '+fmtN(rew)+(x.tk?' + 1 🎟':'')+'</small></div>'+
    (x.got?'<span class="dim">✅ Đã nhận</span>':'<button class="sm'+(done?' on':'')+'" '+(done?'':'disabled')+' onclick="qClaim(\''+w+'\','+i+')">'+(done?'Nhận':Math.floor(x.p/x.n*100)+'%')+'</button>')+'</div>';
}
function openQuests(){
  if(!qSync())return;const q=S.q,all=q.d.every(x=>x.got),b=qRewAll();
  modal('<h3>📜 Nhiệm vụ</h3>'+
    '<div class="qhd"><b>Trong giờ</b> <small class="dim">· đổi mới sau '+qLeft('h')+'</small></div>'+q.h.map((x,i)=>qRow('h',x,i,q.rh)).join('')+
    '<div class="qhd"><b>Hôm nay</b> <small class="dim">· đổi mới sau '+qLeft('d')+'</small></div>'+q.d.map((x,i)=>qRow('d',x,i,q.rd)).join('')+
    '<div class="card qrow'+(q.all?' qgot':'')+'"><div class="qic">🎁</div><div class="g"><b>Xong cả ba nhiệm vụ hôm nay</b><br><small>thưởng 🪙 '+fmtN(b.coins)+' + '+b.tickets+' 🎟</small></div>'+(q.all?'<span class="dim">✅ Đã nhận</span>':'<button class="sm'+(all?' on':'')+'" '+(all?'':'disabled')+' onclick="qClaim(\'all\')">'+(all?'Nhận':q.d.filter(x=>x.got).length+'/3')+'</button>')+'</div>'+
    '<div class="dim" style="margin:6px 2px">Khách lạ (chuột, bướm, cuộn len) thỉnh thoảng chạy qua phòng: chạm vào để bắt, được xu và đôi khi có vé. Đã bắt '+(q.n||0)+' vị.</div>'+
    '<button onclick="closeModal()">Đóng</button>');
}
// nút Nhiệm vụ trên thanh trên cùng (thanh này được vẽ lại mỗi giây)
{const rt=renderTop;renderTop=function(){rt.apply(this,arguments);if(!qSync())return;const n=qReady(),el=document.createElement('div');
  el.className='chip qchip'+(n?' ready':'');el.setAttribute('onclick','openQuests()');el.innerHTML=emo('📜 <b>Nhiệm vụ</b>'+(n?' <span class="qbadge">'+n+'</span>':''));$('top').appendChild(el)}}

/* ---------- khách lạ trong phòng ---------- */
const CRIT={ // w,h: kích thước sprite theo ô gốc; air: bay trên không; sp: tốc độ (ô/giây); coin: hệ số xu; tk: xác suất được vé; wt: trọng số xuất hiện
  mouse:{n:'Chuột nhắt',w:14,h:9,sp:[30,44],coin:.8,tk:0,wt:45},
  bfly:{n:'Bướm',w:12,h:10,air:1,sp:[13,19],coin:1.2,tk:0,wt:40},
  yarn:{n:'Cuộn len vàng',w:10,h:10,sp:[20,28],coin:2.5,tk:.2,wt:11},
  gbfly:{n:'Bướm vàng',w:12,h:10,air:1,sp:[16,22],coin:4,tk:1,wt:4},
};
const CRIT_ART={
  mouse(b,f){const G=[176,182,196];b.ell(7,5.4,4.6,3,G);b.ell(3.4,5.6,2.6,2.2,G);b.ell(4.2,2.8,1.5,1.5,[250,172,188]);b.cap(11.4,5.6,13,f?3.4:4.6,.45,[250,172,188]);b.set(2,5,[120,74,54],'x');b.set(1,6,[250,172,188],'x');
    b.rect(f?4:5,7.6,1,1,G);b.rect(f?9:8,7.6,1,1,G)},
  bfly(b,f,gold){const A=gold?[255,214,90]:[246,154,174],B=gold?[248,180,60]:[170,148,216],K=[88,70,80];
    if(f){b.ell(3.4,3.6,2.8,2.8,A);b.ell(8.6,3.6,2.8,2.8,A);b.ell(4,7.2,2,1.8,B);b.ell(8,7.2,2,1.8,B)}else{b.ell(4.4,3.6,1.6,2.8,A);b.ell(7.6,3.6,1.6,2.8,A);b.ell(4.8,7.2,1.2,1.8,B);b.ell(7.2,7.2,1.2,1.8,B)}
    b.rect(5.5,2.4,1,6.4,K);b.line(5.6,2.4,4.4,.8,K);b.line(6.4,2.4,7.6,.8,K);if(f){b.set(3,3,[255,250,240],'x');b.set(8,3,[255,250,240],'x')}},
  yarn(b,f){const Y=[248,206,90];b.ell(5,5,4,4,Y);const L=[255,236,170];if(f){b.line(2.4,3.6,7.6,3.6,L,'x');b.line(2.4,6.4,7.6,6.4,L,'x')}else{b.line(3.6,2.2,3.6,7.8,L,'x');b.line(6.4,2.2,6.4,7.8,L,'x')}},
};
const CV={};
function critCv(kind,f){
  const k=fk(BS),key=kind+f+'|'+k;if(CV[key])return CV[key];
  const C=CRIT[kind],b=new Art.Buf(C.w,C.h);(CRIT_ART[kind==='gbfly'?'bfly':kind])(b,f,kind==='gbfly');b.pastel(.06);b.shade(.12);b.outline([112,74,52]);
  return CV[key]=bufCanvas(b,k);
}
let crits=[],critNext=rnd(25,45),critId=0;
function critSpawn(){
  const tot=Object.values(CRIT).reduce((a,c)=>a+c.wt,0);let r=Math.random()*tot,kind='mouse';
  for(const k in CRIT){r-=CRIT[k].wt;if(r<0){kind=k;break}}
  const C=CRIT[kind],L=Math.random()<.5,x0=L?camX-14:camX+VW+14,t0=camY+14,b0=camY+VHV-6;   // chỉ xuất hiện trong phần phòng đang nhìn thấy (điện thoại ngang chỉ thấy một dải)
  let lo=C.air?Math.max(24,t0):Math.max(FLOOR_MIN+6,t0),hi=C.air?Math.min(100,b0-16):Math.min(FLOOR_MAX-2,b0);if(hi<lo){lo=t0+C.h;hi=Math.max(lo,b0-4)}
  const y=rnd(lo,hi);
  const cr={id:++critId,kind,x:x0,y,y0:y,dir:L?1:-1,v:rnd(C.sp[0],C.sp[1]),t:0,pause:0,ph:rnd(0,6)};crits.push(cr);
  // khách chạy dưới sàn: một bé đang rảnh có khi đuổi theo cho vui
  if(!C.air&&Math.random()<.6){const e=ents.filter(e=>!e.ghost&&!e.clone&&!e.goal&&(e.state==='idle'||e.state==='walk')).sort((a,b)=>Math.abs(a.x-x0)-Math.abs(b.x-x0))[0];if(e){e.chase=cr.id;e.state='run';e.pre=.15;e.acc=0;e.emo='excl'}}
}
critStep=function(dt){
  if(!qOn()||edit||document.hidden)return;
  if(!crits.length&&(critNext-=dt)<=0){critNext=rnd(70,150);critSpawn()}
  crits.forEach(cr=>{
    const C=CRIT[cr.kind];cr.t+=dt;
    if(!C.air){if(cr.pause>0)cr.pause-=dt;else{cr.x+=cr.dir*cr.v*dt;if(Math.random()<dt*.5)cr.pause=rnd(.3,.9)}}
    else{cr.x+=cr.dir*cr.v*dt;cr.y=cr.y0+Math.sin(cr.t*2.2+cr.ph)*7+Math.sin(cr.t*7)*1.5}
    if(C.tk>=1&&Math.random()<dt*10)rp(cr.x+rnd(-5,5),cr.y-rnd(0,8),pick(['#ffe07a','#fff3b0']),{vy:-6,life:.6});
    if(cr.dir>0?cr.x>camX+VW+20:cr.x<camX-20)cr.gone=1;
  });
  ents.forEach(e=>{if(!e.chase)return;const cr=crits.find(c=>c.id===e.chase&&!c.gone);
    if(!cr||e.goal||(e.state!=='run'&&e.state!=='walk'&&e.state!=='idle')){e.chase=0;if(e.state==='run'){e.tx=e.x;e.ty=e.y}return}
    e.state='run';e.tx=clamp(cr.x,14,WORLD_W-14);e.ty=clamp(cr.y,FLOOR_MIN,FLOOR_MAX);
    if(Math.hypot(cr.x-e.x,cr.y-e.y)<10&&cr.pause>0)cr.pause=0;                  // mèo áp sát thì khách chạy tiếp
  });
  crits=crits.filter(c=>!c.gone);
};
critDraw=function(g){
  crits.forEach(cr=>{const C=CRIT[cr.kind],f=C.air?(Math.floor(cr.t*8)%2):(cr.pause>0?0:Math.floor(cr.t*10)%2),cv=critCv(cr.kind,f),x=Math.round((cr.x-C.w/2)*ZC)/ZC,y=Math.round((cr.y-C.h)*ZC)/ZC;
    if(!C.air){g.fillStyle='rgba(70,42,28,.2)';g.beginPath();g.ellipse(cr.x,cr.y-.5,C.w/2.4,1.6,0,0,6.283);g.fill()}
    if(cr.dir>0&&cr.kind==='mouse'){g.save();g.translate(x+C.w,y);g.scale(-1,1);g.drawImage(cv,0,0,C.w,C.h);g.restore()}else g.drawImage(cv,x,y,C.w,C.h)});
};
critHit=function(wx,wy){
  const cr=crits.find(c=>{const C=CRIT[c.kind];return Math.hypot(wx-c.x,wy-(c.y-C.h/2))<Math.max(12,C.w)});
  if(!cr)return false;
  const C=CRIT[cr.kind],coins=Math.max(1,Math.round((2+qLv())*C.coin*gMult())),tk=Math.random()<C.tk?1:0;
  S.coins+=coins;S.tickets+=tk;S.q.n=(S.q.n||0)+1;addXp(2);cr.gone=1;crits=crits.filter(c=>c!==cr);
  for(let i=0;i<14;i++)rp(cr.x,cr.y-C.h/2,pick(['#ffe07a','#fff3b0','#ffffff']),{sh:ch(.5)?'star':'coin',vx:rnd(-30,30),vy:rnd(-50,-15),g:90,life:rnd(.5,.9)});
  ents.forEach(e=>{if(e.chase===cr.id){e.chase=0;e.emoT=1.2}});
  onAct('catch',1);save();
  toast('Bắt được '+C.n.toLowerCase()+'!'+(tk?' +1 vé 🎟':''),{type:'coin',title:C.air?'🦋 Khách lạ':'🐭 Khách lạ',coins});render();
  return true;
};
// ui.js đã vẽ thanh trên cùng một lần trước khi file này được nạp: vẽ lại để nút Nhiệm vụ hiện ngay
if(typeof S!=='undefined'&&S){qSync();renderTop()}
