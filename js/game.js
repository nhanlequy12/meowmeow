"use strict";
/* ============ TRẠNG THÁI & LOGIC (không đụng tới DOM) ============ */
const KEY='meoxu_v2';
let S, notify=()=>{};
let onAct=()=>{};         // js/quest.js gán lại để cộng tiến độ nhiệm vụ: onAct(loại, số lượng)
let TOFF=0;                 // độ lệch đồng hồ (ms), chỉ khác 0 khi đang bù thời gian vắng mặt lúc tải game
const AWAY={n:0,coins:0,cost:0}; // tổng kết lúc vắng: số suất mèo tự ăn, xu cảm ơn, xu máy cho ăn đã tiêu
const now=()=>Date.now()+TOFF, rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)], clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SP={}; BREEDS.concat(VARIANTS).forEach(s=>SP[s.id]=s);
const WORLD_W=480, WALL_Y=96, FLOOR_MIN=106, FLOOR_MAX=166;

// Ván mới: chưa có mèo, chưa có vé. Hướng dẫn tân thủ (js/tutorial.js) cho chọn bé khởi đầu, tặng vé và quà; tiến độ lưu ở S.tut.
function fresh(){
  S={v:2,coins:300,tickets:0,xp:0,level:1,cats:[],trips:[null],items:[],rooms:{living:{bowlAt:0}},pity:0,seen:{},nid:1,last:now(),scratchAt:now()+600000,tut:{step:'hi',got:{},hints:{}}};
  S.items.push({iid:S.nid++,fid:'box',room:'living',x:330,y:150,flip:false,broken:false});
  giveBowl('living');S.bowlMig=1;
}
function load(){
  let raw=null; try{raw=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  // bản lưu hợp lệ: đã có mèo, hoặc đang ở giữa hướng dẫn tân thủ (chưa chọn bé khởi đầu)
  if(raw&&raw.v===2&&Array.isArray(raw.cats)&&(raw.cats.length||(raw.tut&&!raw.tut.done))){S=raw}
  else{
    fresh();
    try{const o=JSON.parse(localStorage.getItem('meoxu_v1')); if(o&&o.cats){S.coins=(o.coins||0)+100*Object.keys(o.cats).length;S.tickets=o.tickets||1;S.level=o.level||1;S.xp=o.xp||0;
      const c=newCat(SP.muop,1);c.name='Mướp';c.room='living';c.born=now();S.cats.push(c);markSeen(c);S.tut={done:1,old:1,hints:{all:1}}}}catch(e){}
  }
  // người chơi cũ (bản lưu có từ trước khi có hướng dẫn): không bắt chơi lại, không hiện mẹo; xem lại được trong Sổ tay
  if(!S.tut)S.tut={done:1,old:1,hints:{all:1}};
  S.tut.hints=S.tut.hints||{};S.tut.got=S.tut.got||{};
  S.cats=S.cats.filter(c=>SP[c.sp]); S.cats.forEach(c=>{c.traits=c.traits.filter(t=>TRAITS[t]); if(!S.rooms[c.room])c.room='wait'});
  S.items=S.items.filter(i=>FURN[i.fid]);
  S.cats.forEach(c=>{if(!c.born)c.born=now()-(5+(c.uid*7)%20)*DAY}); // bản lưu cũ chưa có tuổi: coi như mèo trưởng thành 5–24 ngày
  // Khao Manee nay luôn hai mắt hai màu: các màu cũ (trắng, trắng mắt vàng, trắng mắt hai màu) chuyển về cặp mắt mặc định
  S.cats.forEach(c=>{if(c.sp==='khaomanee'&&!RARE[c.coat]&&!/^km/.test(c.coat||''))c.coat='kmIce'});
  // Naruto và Goku lên 5★ (2026-11-10): bé 4★ trong bản lưu cũ được nâng lên 5★ và nhận thêm một trait cho đủ 5
  if(!S.mig5){S.cats.forEach(c=>{if((c.sp==='v_goku'||c.sp==='v_naruto')&&c.star===4){c.star=5;const t=rollTraits(SP[c.sp],5).find(t=>!c.traits.includes(t)&&!c.traits.some(o=>conflict(o,t)));if(t)c.traits.push(t)}});S.mig5=1}
  // Tanjiro lên 5★ (2026-11-11): bé 4★ trong bản lưu cũ được nâng lên 5★ và nhận thêm một thuộc tính
  delete S.nest; // ổ ghép đôi đã gỡ khỏi game (người dùng không yêu cầu tính năng này)
  if(!S.mig7){S.cats.forEach(c=>{if(c.sp==='v_tanjiro'&&c.star===4){c.star=5;if(!c.coat)c.coat='v_tanjiro_0';const t=rollTraits(SP[c.sp],5).find(t=>!c.traits.includes(t)&&!c.traits.some(o=>conflict(o,t)));if(t)c.traits.push(t)}});S.mig7=1}
  // năm giống thật 5★ có thuộc tính riêng: bé đang có được thêm vào đầu danh sách, đổi chỗ cho một thuộc tính xấu (nếu không có thì thuộc tính cuối) để số thuộc tính vẫn bằng số sao
  if(!S.mig6){S.cats.forEach(c=>{const bt=SP[c.sp]&&SP[c.sp].bt;if(bt&&!c.traits.includes(bt)){let i=-1;c.traits.forEach((t,j)=>{if(TRAITS[t]&&TRAITS[t].k==='b')i=j});if(i<0)for(let j=c.traits.length-1;j>=0;j--)if(TRAITS[c.traits[j]].k!=='x'){i=j;break}if(i>=0)c.traits.splice(i,1);c.traits.unshift(bt)}});S.mig6=1}
  S.cats.forEach(c=>{if(c.coat&&!(SP[c.sp].coats&&ALLCOAT[c.coat]))delete c.coat;markSeen(c)});
  if(S.level>=WX_LV&&!S.wxU){S.wxU=1;S.wxOld=1} // người chơi đã qua cấp 2 trước bản cập nhật: thời tiết tự mở, tiến độ giữ nguyên (hướng dẫn thời tiết hiện một lần, cờ S.tut.wx)
  if(!S.bowlMig){for(const rid in S.rooms)giveBowl(rid,S.rooms[rid].bowlAt);S.bowlMig=1} // bản cũ: mỗi phòng có 1 bát cố định, nay thành món đồ
  if(typeof pwMigrate==='function')pwMigrate(); // thiết bị pin kiểu cũ (i.bat, i.chg) sang pin sạc tay (js/pw.js)
  if(typeof mealLoad==='function')mealLoad(); // bát ăn kiểu cũ (b.food + b.left) sang danh sách suất; bé đang đi tới bát thì đi lại (js/meal.js)
  fixSlots();
  // Bù thời gian vắng mặt (tối đa 8 giờ) theo từng bước 10 phút, để máy cho ăn tự đổ và mèo đói tự ra ăn đúng như lúc đang mở game.
  const el=clamp((now()-(S.last||now()))/1000,0,8*3600);
  if(el>1){
    const nt=notify;notify=()=>{};AWAY.n=AWAY.coins=AWAY.cost=0;
    let left=el;TOFF=-el*1000;
    while(left>0){const st=Math.min(600,left);TOFF+=st*1000;left-=st;tick(st,true)}
    TOFF=0;notify=nt;scratchTick();
  }
}
let SAVE_OFF=false; // net.js bật khi đang khôi phục bản lưu từ máy chủ, để trang sắp tải lại không ghi đè bản vừa khôi phục
function save(){if(SAVE_OFF)return;S.last=now(); try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- cấp độ ---------- */
const slotCount=()=>Math.min(5,1+Math.floor((S.level-1)/2));
function fixSlots(){while(S.trips.length<slotCount())S.trips.push(null)}
// Kinh nghiệm cần để lên cấp kế: 30 ở cấp 1, mỗi cấp nhiều hơn cấp trước 45% (làm tròn tới 5). Đo bằng bot chơi đều tay: cấp 5 sau hơn 1 giờ, cấp 9 sau khoảng 3,5 giờ,
// cấp 18 sau khoảng 32 giờ, tức mỗi căn phòng vừa đủ tiền mua không lâu sau khi được mở khóa. Sau cấp 18 (mở hết cửa hàng) thì không tăng nữa.
const xpNeed=()=>Math.round(30*Math.pow(1.45,Math.min(S.level,MAX_LV)-1)/5)*5;
const locked=x=>!!x&&S.level<(x.ul||1);   // phòng, món ăn hay nội thất chưa đủ cấp để mua
// Thời tiết mở ở cấp WX_LV. Cờ S.wxU ghi vào bản lưu lúc mở, nên đã mở thì không bao giờ khóa lại.
const wxOpen=()=>!!(S&&(S.wxU||S.level>=WX_LV));
function addXp(n){
  S.xp+=Math.round(n);
  while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;const b=S.trips.length;fixSlots();if(S.level>=WX_LV&&!S.wxU){S.wxU=1;if(typeof wxDirty==='function')wxDirty()}
    const d=DESTS.filter(x=>x.lvl===S.level).map(x=>x.n);
    const un=unlocksAt(S.level);
    notify('🎉 Lên cấp '+S.level+'!'+(S.trips.length>b?' Mở thêm 1 ô viễn chinh.':'')+(d.length?' Mở điểm mới: '+d.join(', ')+'.':'')+(un.length?' Cửa hàng mở: '+un.slice(0,4).join(', ')+(un.length>4?' và '+(un.length-4)+' món khác':'')+'.':''));}
}

/* ---------- mèo ---------- */
// Tuổi tính theo ngày thật kể từ c.born. Mèo mới về có tuổi ngẫu nhiên: một nửa là mèo con, phần lớn còn lại trưởng thành, số ít đã già.
// Tuổi chỉ đổi cách bé sinh hoạt trong phòng (mèo con hiếu động, mèo già ít trèo và hay ngủ), không đổi xu hay chỉ số.
const DAY=86400000,AGE_ADULT=3,AGE_OLD=30,AGE_N=['Mèo con','Trưởng thành','Mèo già'],AGE_IC=['🍼','🐈','🧓'];
const rollAge=()=>{const r=Math.random();return r<.5?rnd(0,2):r<.92?rnd(AGE_ADULT,24):rnd(AGE_OLD,45)};
const ageDays=c=>Math.max(0,(now()-(c.born||now()))/DAY);
const ageStage=c=>{const d=ageDays(c);return d<AGE_ADULT?0:d<AGE_OLD?1:2};
const catBy=uid=>S.cats.find(c=>c.uid===uid);
const onTrip=uid=>S.trips.some(p=>p&&p.uid===uid)||!!(S.hosp&&S.hosp[uid])||(typeof strayAway==='function'&&strayAway(uid)); // đi viễn chinh, nằm viện (js/med.js), bỏ nhà đi hoặc đang đi tìm bạn (js/stray.js): đều không có mặt ở nhà
const awayTxt=c=>S.hosp&&S.hosp[c.uid]?'đang nằm viện':'đang viễn chinh';
const has=(c,t)=>c.traits.includes(t);
const tE=(c,k)=>c.traits.reduce((a,t)=>a+(TRAITS[t].e[k]||0),0);
const tM=(c,k)=>c.traits.reduce((a,t)=>a*(TRAITS[t].e[k]||1),1);
const conflict=(a,b)=>CONFLICT.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
function rollTraits(sp,star,first){
  const out=[]; if(sp.xt)out.push(sp.xt); if(sp.bt)out.push(sp.bt); if(first)out.push(first);
  const aff=(sp.t||'').split(' ').filter(Boolean);
  let guard=0;
  while(out.length<star&&guard++<50){
    const k=Math.random()<STAR[star].good?'g':'b';
    const pool=Object.keys(TRAITS).filter(id=>TRAITS[id].k===k&&!out.includes(id)&&!out.some(o=>conflict(o,id)));
    if(!pool.length)continue;
    const w=pool.map(id=>aff.includes(id)?6:1); let r=Math.random()*w.reduce((a,b)=>a+b,0),i=0;
    while(r>w[i]){r-=w[i];i++}
    out.push(pool[i]);
  }
  return out;
}
// chọn màu lông cho một giống: màu ít gặp (u) có trọng số thấp
function pickCoat(sp){
  const w=sp.coats.map(id=>COATS[id].rw||(COATS[id].u?.35:1));let r=Math.random()*w.reduce((a,b)=>a+b,0),i=0;
  while(r>w[i]){r-=w[i];i++}
  return sp.coats[i];
}
function newCat(sp,star,coatId){
  const coat=sp.coats?ALLCOAT[coatId||pickCoat(sp)]:null,cid=coat?(coatId||Object.keys(COATS).find(k=>COATS[k]===coat)):undefined;
  const f=coat&&coat.f!=null?coat.f:(sp.f==null?.5:sp.f),sex=coat&&coat.sex?coat.sex:(Math.random()<f?'f':'m');
  const c={uid:S.nid++,sp:sp.id,star,sex,name:pick(NAMES),traits:rollTraits(sp,star,coat&&coat.tr),full:80,en:100,hp:60,room:null,buff:null,petAt:0,born:now()-rollAge()*DAY};
  if(cid)c.coat=cid;
  return c;
}
const coatOf=c=>{const sp=SP[c.sp];return sp.coats?(ALLCOAT[c.coat]||COATS[sp.coats[0]]):null};
const isRare=c=>!!RARE[c.coat];
const lk0=c=>SP[c.sp].coats?c.sp+'~'+(c.coat||SP[c.sp].coats[0]):c.sp;
const lk=c=>lk0(c)+(typeof accSfx==='function'?accSfx(c):'');   // hậu tố phụ kiện đang đeo (js/acc.js); lk0 là khóa ngoại hình gốc
function markSeen(c){
  S.seen[c.sp]=1;S.seenCoat=S.seenCoat||{};S.seenRare=S.seenRare||{};
  if(!SP[c.sp].coats)return;
  if(isRare(c)){if(!S.seenRare[c.coat])S.seenRare[c.coat]=c.sp}else S.seenCoat[lk0(c)]=1;
}
function favs(c){const f=[];if(SP[c.sp].fav)f.push(SP[c.sp].fav);c.traits.forEach(t=>{const x=TRAITS[t].e.fav;if(x&&!f.includes(x))f.push(x)});return f}
const buffOf=c=>(c.buff&&c.buff.until>now())?c.buff:{};

/* ---------- phòng & nội thất ---------- */
const ownedRooms=()=>ROOMS.filter(r=>S.rooms[r.id]);
const catsIn=rid=>S.cats.filter(c=>c.room===rid);
const homeCats=rid=>S.cats.filter(c=>c.room===rid&&!onTrip(c.uid));
const totalCap=()=>ownedRooms().reduce((a,r)=>a+r.cap,0);
const freeRoom=()=>{const r=roomsByBuy().find(r=>catsIn(r.id).length<r.cap);return r?r.id:'wait'}; // phòng mua trước được lấp trước (cùng thứ tự với fillWait); hết chỗ thì vào Phòng chờ
const roomHunger=rid=>{let m=ROOM[rid].hunger||1;const seen={};itemsIn(rid).forEach(i=>{const h=FURN[i.fid].hunger;if(h&&!i.broken&&!seen[i.fid]){seen[i.fid]=1;m*=h}});return Math.max(.5,m)};
const roomRegen=rid=>{let m=ROOM[rid].regen||1;const seen={};itemsIn(rid).forEach(i=>{const h=FURN[i.fid].regen;if(h&&!i.broken&&!seen[i.fid]&&!(typeof pwOff==='function'&&pwOff(i))){seen[i.fid]=1;m*=h}});return Math.min(2,m)};
const itemsIn=rid=>S.items.filter(i=>i.room===rid);
/* ---------- ổ ngủ: c.bed = iid của ổ, c.bk = chỗ nằm (chỉ số trong FURN[..].bed.at). Ngủ thì hồi năng lượng nhanh gấp bed.en lần, đầy thì tự dậy.
   Ổ bị cất, bán, hỏng, bé đổi phòng hay đi viễn chinh thì bé tự thôi ngủ (bedItem trả null, tick xóa c.bed). */
const bedItem=c=>{if(c.bed==null)return null;const it=S.items.find(i=>i.iid===c.bed);return it&&it.room===c.room&&!it.broken&&FURN[it.fid].bed&&!onTrip(c.uid)?it:null};
const bedCats=iid=>S.cats.filter(c=>c.bed===iid&&bedItem(c));
function putBed(uid,iid,man){ // man: người chơi tự cho đi ngủ (có thông báo lúc dậy); không có là bé tự vào ổ nằm
  const c=catBy(uid),it=S.items.find(i=>i.iid===iid),f=it&&FURN[it.fid];
  if(!c||!f||!f.bed)return {err:'Không tìm thấy ổ.'};
  if(it.room!==c.room||onTrip(uid))return {err:c.name+' không ở phòng này.'};
  if(c.en>=100)return {err:c.name+' đang đầy năng lượng, chưa buồn ngủ.'};
  const used=bedCats(iid).filter(o=>o!==c).map(o=>o.bk),k=f.bed.at.findIndex((_,i)=>!used.includes(i));
  if(k<0)return {err:f.n+' đã hết chỗ.'};
  c.bed=iid;c.bk=k;if(man)c.bm=1;else delete c.bm;save();return {ok:1};
}
function kickBed(uid){const c=catBy(uid);if(!c||c.bed==null)return false;delete c.bed;delete c.bk;delete c.bm;save();return true}
const roomHas=(rid,fid)=>S.items.some(i=>i.room===rid&&i.fid===fid&&!i.broken);
function gEff(){
  const e={coin:0,speed:0,ticket:0,pet:0,night:0},seen={};
  S.items.forEach(i=>{if(!i.room||i.broken||seen[i.fid]||(typeof pwOff==='function'&&pwOff(i)))return;seen[i.fid]=1;const g=FURN[i.fid].g;if(g)for(const k in g)e[k]+=g[k]});
  return e;
}
function roomHappy(rid){
  let h=0; const seen={};
  itemsIn(rid).forEach(i=>{if(i.broken||seen[i.fid]||(typeof pwOff==='function'&&pwOff(i)))return;seen[i.fid]=1;h+=FURN[i.fid].happy||0});
  return Math.min(HAPPY_CAP,h)+(ROOM[rid].happy||0)-(ROOM[rid].wait?10:0);
}
function happyTarget(c){
  const fx=tE(c,'fixedHappy'); if(fx)return fx;
  let h=50+roomHappy(c.room)+tE(c,'self');
  c.traits.forEach(t=>{const e=TRAITS[t].e;if(e.like&&(roomHas(c.room,e.like[0])||(e.like[0]==='tree'&&itemsIn(c.room).some(i=>FURN[i.fid].lv&&!i.broken))))h+=e.like[1];if(e.outdoor&&ROOM[c.room].outdoor)h+=e.outdoor;if(e.indoor&&!ROOM[c.room].outdoor&&!ROOM[c.room].wait)h+=e.indoor;if(e.bigRoom&&catsIn(c.room).length>=6)h+=e.bigRoom});
  homeCats(c.room).forEach(o=>{if(o!==c)h+=tE(o,'aura')});
  h+=palHappy(c);
  if(ROOM[c.room].water){const w=tE(c,'water');h+=w>0?10:w<0?-10:0}
  if(c.full<20)h-=25;
  if(typeof wxHappy==='function'&&wxOpen())h+=wxHappy(c);
  if(typeof medHappy==='function')h+=medHappy(c); // khát nước (trước khi có thời tiết), bệnh tật
  return clamp(h,0,100);
}
// "Bạn cùng phòng": thuộc tính có e.pal={ids, happy, both, hunger} chỉ có tác dụng khi trong phòng có mèo thuộc danh sách ids (không tính bé đang viễn chinh)
// số "bạn" cùng phòng của một thuộc tính pal: p.ids là danh sách mèo (đếm số loại có mặt), p.grp là mọi bé cùng chủ đề (đếm số bé, không tính chính mình)
const palN=(c,p)=>{const L=homeCats(c.room).filter(o=>o!==c);return p.grp?L.filter(o=>SP[o.sp].g===p.grp).length:p.ids.filter(id=>L.some(o=>o.sp===id)).length};
// mức "both": thường là có từ hai bạn; nếu có p.plus thì cần một bạn trong p.ids VÀ một bé khác thuộc p.plus (danh sách ids hoặc chủ đề grp)
const palBoth=(c,p)=>{const n=palN(c,p);if(!p.both||!n)return false;if(!p.plus)return n>=2;
  const L=homeCats(c.room).filter(o=>o!==c&&!(p.ids||[]).includes(o.sp));return p.plus.grp?L.some(o=>SP[o.sp].g===p.plus.grp):L.some(o=>p.plus.ids.includes(o.sp))};
const palHappy=c=>c.traits.reduce((a,t)=>{const p=TRAITS[t].e.pal;if(!p)return a;const n=palN(c,p);return a+(palBoth(c,p)?p.both:n?p.happy||0:0)},0);
const palHunger=c=>c.traits.reduce((a,t)=>{const p=TRAITS[t].e.pal;return a*(p&&p.hunger&&palN(c,p)?p.hunger:1)},1);
const auraCoin=c=>homeCats(c.room).reduce((a,o)=>a+(o!==c?tE(o,'auraCoin'):0),0);
const auraHunger=c=>homeCats(c.room).reduce((a,o)=>a*(TRAITS_M(o,'auraHunger')),1);
function TRAITS_M(c,k){return tM(c,k)}

/* ---------- thời gian trôi ---------- */
function tick(dt,sim){
  if(S.adm&&S.adm.inf)S.coins=999999999;
  const WXON=typeof wxCat==='function'&&wxOpen(); // thời tiết, khí hậu phòng, sức khỏe, nước uống (js/wx.js); thiếu file thì game chạy như cũ
  const MEDON=typeof medCat==='function'; // nước uống, bệnh tật, bệnh viện (js/med.js)
  S.cats.forEach(c=>{
    if(MEDON&&inHosp(c.uid)){medHospCat(c);return} // đang nằm viện: bệnh viện lo ăn uống, chỉ số không tụt
    if(typeof strayCat==='function'&&strayCat(c))return; // bỏ nhà đi (js/stray.js): chỉ số đứng yên tới khi bé về
    const away=onTrip(c.uid),bf=buffOf(c);
    if(c.buff&&c.buff.until<=now())c.buff=null;
    if(WXON)wxCat(c,dt,sim);
    if(MEDON)medCat(c,dt,sim);
    c.full=clamp(c.full-dt*(100/12000)*tM(c,'hunger')*(bf.hunger||1)*auraHunger(c)*palHunger(c)*roomHunger(c.room)*(WXON?wxHunger(c):1),0,100);
    const bi=bedItem(c); if(c.bed!=null&&!bi){delete c.bed;delete c.bk;delete c.bm}
    if(!away){
      const rg=tM(c,'regen')*roomRegen(c.room)*(c.full<=0?.3:1)*(bi?FURN[bi.fid].bed.en:1)*(WXON?wxRegen(c):1)*(MEDON?medRegen(c):1);
      c.en=clamp(c.en+dt/60*rg,0,100);
      if(bi&&c.en>=100){const m=c.bm;delete c.bed;delete c.bk;delete c.bm;if(WXON)wxWake(c);if(m)notify('ngủ đủ giấc, năng lượng đã đầy',{icon:'😴',title:c.name,key:'wake',mtitle:'Ngủ dậy'})}
      const t=happyTarget(c),step=tE(c,'fixedHappy')?100:dt/60;
      c.hp=Math.abs(t-c.hp)<=step?t:c.hp+Math.sign(t-c.hp)*step;
    }
  });
  // máy cho ăn tự đổ hạt khô cho đầy chỗ trống (trả xu trực tiếp, không qua kho); mèo đói được giao bát và tự đi tới ăn (js/meal.js)
  if(typeof mealCall==='function')ownedRooms().forEach(r=>{ // công cụ kiểm thử không nạp js/meal.js thì bỏ qua phần ăn
    const bs=bowlsIn(r.id); if(!bs.length)return;
    bs.forEach(b=>{if(FURN[b.fid].bowl.auto&&!b.broken&&!(typeof pwOff==='function'&&pwOff(b))&&now()>=(b.at||0)&&homeCats(r.id).length){const n=mFree('f',b),p=mPrice('f','kibble',n);
      if(n>0&&S.coins>=p){S.coins-=p;if(TOFF)AWAY.cost+=p;const l=fdList(b);for(let i=0;i<n;i++)l.push('kibble');b.left=l.length;b.food='kibble';b.at=now()+600000}}});
    mealCall(r.id,'f',false);
    const st=S.rooms[r.id];
    if(homeCats(r.id).some(c=>c.full<20)&&!bs.some(b=>mAvail('f',b)>0)&&bowlCap(r.id)<homeCats(r.id).length&&now()>=(st.warnAt||0)){st.warnAt=now()+300000;notify('🍽️ Thiếu bát ăn ở '+r.n+': '+homeCats(r.id).length+' bé nhưng chỉ có '+bowlCap(r.id)+' suất. Mua thêm bát ở Cửa hàng.')}
  });
  if(WXON)wxTick(dt,sim);
  if(MEDON)medTick(dt,sim);
  if(typeof mealTick==='function')mealTick(dt,sim); // mèo đi tới bát, ăn uống vơi dần (js/meal.js)
  if(typeof strayTick==='function')strayTick(dt,sim); // giận dỗi, bỏ nhà đi, tìm về (js/stray.js)
  if(typeof gardenTick==='function')gardenTick(dt,sim); // vườn nhỏ: cây lớn theo nắng mưa, cá đẻ (js/garden.js)
  if(!sim)scratchTick();
}
// kiểm tra cào sofa 10 phút một lần; sau khi vắng lâu chỉ bù tối đa 3 lần
function scratchTick(){
  let n=0;
  while(now()>=S.scratchAt&&n++<3){S.scratchAt+=600000;scratchCheck()}
  if(now()>=S.scratchAt)S.scratchAt=now()+600000;
}
function scratchCheck(){
  ownedRooms().forEach(r=>{
    const sofa=S.items.find(i=>i.room===r.id&&i.fid==='sofa'&&!i.broken); if(!sofa)return;
    const guard=roomHas(r.id,'post');
    if(homeCats(r.id).some(c=>tE(c,'roomNoScratch')))return;
    for(const c of homeCats(r.id)){
      if(tE(c,'scratch')&&!tE(c,'noScratch')&&Math.random()<(guard?.04:.15)){sofa.broken=true;notify('😾 '+c.name+' đã cào rách sofa ở '+r.n+'!');break}
    }
  });
}
const gMult=()=>S.cats.some(c=>tE(c,'allCoin'))?1.3:1;
const isMonday=()=>new Date().getDay()===1;
const isNight=()=>{const h=new Date().getHours();return h>=19||h<5};

/* ---------- viễn chinh ---------- */
const happyF=c=>tE(c,'alwaysHappy')?1.2:.8+.4*c.hp/100;
function coinCalc(c,d,ctx,rf){
  const acts=[],pc=v=>(v>0?'+':'−')+Math.round(Math.abs(v)*100)+'% xu';
  let add=0,mult=1;
  const np=c.traits.find(t=>TRAITS[t].e.noPenalty);
  c.traits.forEach(t=>{
    const e=TRAITS[t].e,A=(v)=>{if(v<0&&np){acts.push({t:np,txt:'chặn '+pc(v)});return}add+=v;acts.push({t,txt:pc(v)})};
    if(e.coin)A(e.coin);
    if(e.crowd&&d.tags.includes('crowd')&&!(e.crowd<0&&tE(c,'ignoreCrowd')))A(e.crowd);
    if(e.ignoreCrowd&&d.tags.includes('crowd')&&c.traits.some(x=>(TRAITS[x].e.crowd||0)<0))acts.push({t,txt:'bỏ qua phạt đông người'});
    if(e.water&&d.tags.includes('water'))A(e.water);
    if(e.nature&&d.tags.includes('nature'))A(e.nature);
    if(e.night&&ctx.night)A(e.night);
    if(e.sleepyX2&&ctx.sleepy){mult*=2;acts.push({t,txt:'xu ×2'})}
    if(e.monday)A(ctx.monday?-.2:.15);
  });
  const g=gEff();
  const rm=ROOM[c.room]||{};
  add+=g.coin+(ctx.night?g.night+(rm.night||0):0)+(ctx.bc||0)+(ctx.ac||0)+(rm.coin||0);
  if(gMult()>1){mult*=gMult();acts.push({t:'v_maneki',txt:'+30% xu'})}
  const coins=d.coin*STAR[c.star].m*Math.max(.3,1+add)*(ctx.hf||1)*mult*(rf||1);
  return {coins,acts};
}
function tripInfo(c,did,kit){
  const d=DEST[did],g=gEff(),bf=buffOf(c);
  const o={dur:d.min*60000*clamp(1-(g.speed+tE(c,'speed')+(bf.speed||0)),.4,1.6),cost:Math.round(d.en*tM(c,'cost')),why:''};
  if(typeof wxTripInfo==='function'&&wxOpen())wxTripInfo(c,did,o,kit); // thời tiết ở điểm đến: thời gian, năng lượng, rủi ro, tỉ lệ thành công
  if(typeof medTripSlow==='function')o.dur*=medTripSlow(c); // bong gân: đi chậm hơn
  const mw=typeof medTripWhy==='function'?medTripWhy(c):'';
  if(mw)o.why=mw; else if(onTrip(c.uid))o.why='Đang đi vắng'; else if(c.full<20)o.why='Đang đói'; else if(!o.why&&c.en<o.cost)o.why='Không đủ sức (cần '+o.cost+'⚡)';
  const ctx={night:isNight(),monday:isMonday(),sleepy:c.en<50,hf:happyF(c),bc:bf.coin||0,ac:auraCoin(c)};
  const cc=coinCalc(c,d,ctx);
  return {dur:o.dur,cost:o.cost,why:o.why,wx:o.wx,ctx,est:Math.round(cc.coins),acts:cc.acts};
}
function startTrip(slot,uid,did,kit){
  const c=catBy(uid),d=DEST[did]; if(!c||S.trips[slot]||d.lvl>S.level)return false;
  const inf=tripInfo(c,did,kit); if(inf.why)return false;
  c.en-=inf.cost;
  S.trips[slot]=Object.assign({uid,dest:did,start:now(),end:now()+inf.dur,dur:inf.dur,cost:inf.cost},inf.ctx);
  if(typeof wxTripStart==='function'&&wxOpen())wxTripStart(S.trips[slot],c,kit,inf); // giữ vật phẩm mang theo, ghi dự báo từng chặng
  save(); return true;
}
function claimTrip(slot){
  const p=S.trips[slot]; if(!p||now()<p.end)return null;
  const c=catBy(p.uid),d=DEST[p.dest];
  S.trips[slot]=null; if(!c){save();return null}
  if(c.room==='wait')fillWait(); // bé ở Phòng chờ đi viễn chinh về: vào phòng còn chỗ, phòng mua trước trước
  const r=coinCalc(c,d,p,rnd(.92,1.12)),g=gEff();let m2=1,dbl=false;
  const res={cat:c,dest:d,coins:0,acts:r.acts,item:pick(LOOT),ticket:0,bonus:0,happy:Math.round(c.hp)};
  c.traits.forEach(t=>{const e=TRAITS[t].e;
    if(e.doubleCoin&&Math.random()<e.doubleCoin){m2*=2;res.acts.push({t,txt:'xu ×2'})}
    if(e.gamble){const k=rnd(e.gamble[0],e.gamble[1]);m2*=k;res.acts.push({t,txt:'xu ×'+k.toFixed(1).replace('.',',')})}
    if(e.jackpot&&Math.random()<.0456){res.bonus+=456;res.acts.push({t,txt:'trúng 456 xu!'})}
    if(e.doubleAll&&Math.random()<e.doubleAll){dbl=true;res.acts.push({t,txt:'nhân đôi phần thưởng'})}
  });
  if(Math.random()<.08+g.ticket+tE(c,'ticket')+(ROOM[c.room].ticket||0)){res.ticket=1;c.traits.forEach(t=>{if(TRAITS[t].e.ticket)res.acts.push({t,txt:'nhặt được vé'})})}
  if(Math.random()<tE(c,'loot')){res.bonus+=15;c.traits.forEach(t=>{if(TRAITS[t].e.loot)res.acts.push({t,txt:'+15 xu chiến lợi phẩm'})})}
  res.coins=Math.round(r.coins*m2);
  if(dbl){res.coins*=2;res.bonus*=2;res.ticket*=2}
  if(typeof wxTripClaim==='function'&&wxOpen())wxTripClaim(p,c,res,d); // sự cố do thời tiết, vật phẩm tự kích hoạt, nhật ký viễn chinh
  if(typeof medTripClaim==='function')medTripClaim(p,c,res,d); // tai nạn, chấn thương khi viễn chinh
  S.tickets+=res.ticket;
  S.coins+=res.coins+res.bonus;
  res.xp=Math.round(10*Math.pow(d.min/10,.8)*tM(c,'xp'));
  if(tM(c,'xp')>1)c.traits.forEach(t=>{if(TRAITS[t].e.xp)res.acts.push({t,txt:'+50% kinh nghiệm'})});
  addXp(res.xp); onAct('trip',1); onAct('tripcoin',res.coins+res.bonus); save(); return res;
}

/* ---------- cho ăn ---------- */
const bowlsIn=rid=>S.items.filter(i=>i.room===rid&&FURN[i.fid].bowl);
const bowlCap=rid=>bowlsIn(rid).reduce((a,b)=>a+FURN[b.fid].bowl.cap,0);
// bát còn chỗ để đổ thêm (không còn thời gian chờ 10 phút giữa hai lần đổ: kho và suất trong bát giờ tính riêng, js/meal.js)
const bowlReady=rid=>bowlsIn(rid).some(b=>!b.broken&&mFree('f',b)>0);
const bowlNext=rid=>now();
const bowlNeed=(b,fid)=>mFree('f',b);
const bowlCost=(b,fid)=>mPrice('f',fid,mFree('f',b));
function giveBowl(rid,at){S.items.push({iid:S.nid++,fid:'bowl',room:rid,x:70,y:158,flip:false,broken:false,left:0,fl:[],at:at||0})}
let pickBowl=(c,bs)=>bs[0]; // giao diện thay bằng hàm chọn bát gần bé nhất
// Cho ăn nhanh (nút gợi ý, hướng dẫn tân thủ, bot cân bằng): mua đúng số suất gợi ý còn thiếu trong kho rồi chia đều vào các bát.
// Mèo được giao bát và tự đi tới ăn; xu cảm ơn đến lúc bé ăn xong một suất (js/meal.js mealGain).
function feedRoom(rid,fid){
  const cats=homeCats(rid);if(!bowlsIn(rid).length||!cats.length||locked(FOOD[fid]))return null;
  const n=mSuggest('f',rid);if(n<1)return null;
  const lack=Math.max(0,n-fdN(fid));let cost=0;if(lack){const r=mealBuy('f',fid,lack);if(r.err)return null;cost=r.cost}
  const was=new Set(S.cats.filter(c=>mealOf(c)).map(c=>c.uid));
  const pl=mealPlan('f',rid,n,'even'),r=mealPour('f',rid,fid,pl.plan);if(r.err)return null;
  const go=cats.filter(c=>mealOf(c)&&c.meal.k==='f'&&!was.has(c.uid));
  const loved=go.filter(c=>favs(c).includes(fid)).map(c=>c.name);
  return {coins:0,loved,n:go.length,bowls:r.bowls.length,poured:r.n,miss:Math.max(0,cats.filter(c=>c.full<MEALC.hungry).length-go.length-cats.filter(c=>mealOf(c)&&c.meal.k==='f'&&was.has(c.uid)).length),cost};
}
const PET_CD=600000; // mỗi bé nhận xu vuốt ve 10 phút một lần (trước là 20 giây: bấm liên tục kiếm xu và kinh nghiệm nhanh hơn cả viễn chinh)
function petCat(c){
  if(now()-(c.petAt||0)<PET_CD)return 0;
  c.petAt=now();
  const n=Math.round((c.star+gEff().pet+tE(c,'pet'))*gMult()); S.coins+=n;   // mỗi bé cho số xu bằng số sao, cùng nhịp 10 phút với bát ăn và viễn chinh
  c.hp=clamp(c.hp+3*(tE(c,'petHappy')||1),0,100);
  addXp(1); onAct('pet',1); save(); return n;
}

/* ---------- gacha ---------- */
// mua n vé gacha bằng xu, TICKET_COST xu mỗi vé; trả {n, cost} hoặc {err}
function buyTickets(n){
  n=Math.max(1,Math.floor(n)||1);const cost=n*TICKET_COST;
  if(S.coins<cost)return {err:'Không đủ xu: cần '+cost.toLocaleString('vi-VN')+' xu.'};
  S.coins-=cost;S.tickets+=n;save();return {n,cost};
}
/* Chống gian lận khi chơi qua server.py (js/net.js bật RQ_ON): máy chủ phát sẵn hàng lượt gacha S.rq = [{q: số thứ tự, s: hạt giống}].
   Mỗi lượt (trừ lượt Admin miễn phí) lấy lượt đầu hàng, chạy gachaCore với Math.random thay bằng prng(hạt giống), ghi c.q và S.rqUsed.
   Máy chủ chạy lại đúng gachaCore với cùng hạt giống (tools/guard.js) để kiểm mèo ra có đúng không, nên sửa mã gacha ở máy người chơi không ép ra mèo hiếm được. */
let RQ_ON=false;
const prng=a=>()=>{a=(a+0x6D2B79F5)|0;let t=Math.imul(a^(a>>>15),1|a);t=(t+Math.imul(t^(t>>>7),61|t))^t;return ((t^(t>>>14))>>>0)/4294967296}; // mulberry32
function gachaRoll(useTicket,opt){
  opt=opt||{}; // opt.free, opt.star, opt.rare chỉ dùng cho Admin; opt.min, opt.max cho lượt đầu của hướng dẫn tân thủ
  const q=RQ_ON&&!opt.free; if(q&&!(S.rq&&S.rq.length))return {err:'Đang kết nối máy chủ, thử lại sau vài giây.'};
  if(!opt.free){if(useTicket){if(S.tickets<1)return {err:'Hết vé.'};S.tickets--}else{if(S.coins<GACHA_COST)return {err:'Không đủ xu.'};S.coins-=GACHA_COST}}
  if(!q)return gachaCore(opt);
  const r=S.rq.shift(),R0=Math.random;let res;
  Math.random=prng(r.s);try{res=gachaCore(opt)}finally{Math.random=R0}
  res.cat.q=r.q;(S.rqUsed=S.rqUsed||[]).push({q:r.q,t:opt.min?1:0});save();
  if(S.rq.length<12&&typeof netSync==='function')setTimeout(netSync,50); // hàng lượt sắp hết: đồng bộ để máy chủ phát thêm
  return res;
}
function gachaCore(opt){
  // Hai bảo hiểm chạy song song: S.pity đếm lượt liền nhau chưa ra 4★ trở lên (lượt thứ PITY chắc chắn từ 4★, có từ trước);
  // S.pity5 đếm lượt liền nhau chưa ra 5★ (lượt thứ PITY5 chắc chắn 5★). Bản lưu cũ chưa có pity5 thì bắt đầu từ 0, pity cũ giữ nguyên.
  S.pity++;S.pity5=(S.pity5||0)+1;
  let r=Math.random()*100,star=1,acc=0;
  for(let s=5;s>=1;s--){acc+=STAR[s].p;if(r<acc){star=s;break}}
  // lượt bảo hiểm: ra 4★ TRỞ LÊN, bốc lại giữa 4★ và 5★ theo đúng tỉ lệ gốc của hai bậc (5%:1%, tức khoảng 17% là 5★), không ép cứng 4★
  if(S.pity>=PITY&&star<4)star=Math.random()*(STAR[4].p+STAR[5].p)<STAR[5].p?5:4;
  // opt.min (lượt gacha đầu của hướng dẫn tân thủ): dưới mức này thì rút lại trong các bậc từ min trở lên, giữ đúng tỉ lệ giữa các bậc đó
  if(opt.min&&star<opt.min){let t=0;for(let s=opt.min;s<=5;s++)t+=STAR[s].p;let r2=Math.random()*t;star=opt.min;for(let s=5;s>=opt.min;s--){r2-=STAR[s].p;if(r2<0){star=s;break}}}
  if(opt.max&&star>opt.max)star=opt.max;
  const sure5=S.pity5>=PITY5&&!opt.max&&!opt.star&&!opt.rare; // đủ PITY5 lượt chưa có 5★: lượt này chắc chắn 5★ (không bị màu hiếm 4★ thế chỗ)
  if(sure5)star=5;
  if(opt.star)star=opt.star;
  let c;
  if(opt.rare||(!opt.star&&!sure5&&Math.random()<RARE_P)){
    // màu hiếm: luôn 4★ dù giống gốc ở cấp nào, trait đầu tiên là trait của màu
    const sp=pick(BREEDS.filter(b=>!b.noRare)),rc=typeof opt.rare==='string'?opt.rare:pick(RARES).id;
    star=4;c=newCat(sp,4,rc);c.isNew=!(S.seenRare||{})[rc];
  }else{
    const vs=VARIANTS.filter(v=>v.r===star),bs=BREEDS.filter(b=>b.r===star);
    const sp=(vs.length&&Math.random()<.45)?pick(vs):pick(bs);
    c=newCat(sp,star);c.isNew=!S.seen[sp.id]||(sp.coats&&!(S.seenCoat||{})[lk0(c)]);
  }
  if(star>=4)S.pity=0;
  if(star===5)S.pity5=0;
  c.room=freeRoom();
  S.cats.push(c); markSeen(c); addXp(3); onAct('gacha',1); save();
  return {cat:c};
}
// phóng sinh: nhận lại ít xu theo sao, mèo 5★ tặng thêm 1 vé gacha. Bộ sưu tập vẫn ghi nhận đã từng sở hữu.
const releaseGift=c=>({coins:STAR[c.star].sell,ticket:c.star===5?1:0});
function rehome(uid){
  const c=catBy(uid); if(!c||onTrip(uid)||S.cats.length<=1)return null;
  S.cats=S.cats.filter(x=>x!==c); const g=releaseGift(c); S.coins+=g.coins; S.tickets+=g.ticket; S.released=(S.released||0)+1; save(); return g;
}
function moveCat(uid,rid){
  const c=catBy(uid); if(!c||!(S.rooms[rid]||rid==='wait')||onTrip(uid)||catsIn(rid).length>=ROOM[rid].cap)return false;
  c.room=rid; save(); return true;
}

/* ---------- mua sắm ---------- */
function buyItem(fid,rid,x){
  const f=FURN[fid]; if(locked(f)||S.coins<f.price)return null;
  S.coins-=f.price;
  const it={iid:S.nid++,fid,room:rid,x:clamp(x,f.w/2,WORLD_W-f.w/2),y:f.kind==='wall'?70:rnd(125,160),flip:false,broken:false};
  S.items.push(it); addXp(8); onAct('buy',1); save(); return it;
}
function sellItem(iid){const it=S.items.find(i=>i.iid===iid);if(!it)return 0;S.items=S.items.filter(i=>i!==it);const v=Math.round(FURN[it.fid].price*.25);S.coins+=v;save();return v}
function repairCost(it){return Math.round(FURN[it.fid].price*.3)}
function repairItem(iid){const it=S.items.find(i=>i.iid===iid);if(!it||!it.broken||S.coins<repairCost(it))return false;S.coins-=repairCost(it);it.broken=false;save();return true}
// phòng theo thứ tự mua (S.rooms[id].at); phòng chưa ghi lúc mua (Phòng khách, bản lưu cũ) đứng trước, giữa chúng theo thứ tự ROOMS
const roomsByBuy=()=>ownedRooms().map((r,i)=>[r,S.rooms[r.id].at||0,i]).sort((a,b)=>a[1]-b[1]||a[2]-b[2]).map(x=>x[0]);
// chuyển mèo ở Phòng chờ (trừ bé đang viễn chinh) vào chỗ trống, lấp phòng mua trước rồi mới tới phòng mua sau; trả về số bé đã chuyển
function fillWait(){let n=0;catsIn('wait').filter(c=>!onTrip(c.uid)).forEach(c=>{const r=roomsByBuy().find(r=>catsIn(r.id).length<r.cap);if(r){c.room=r.id;n++}});return n}
function buyRoom(rid){const r=ROOM[rid];if(S.rooms[rid]||locked(r)||S.coins<r.price)return false;S.coins-=r.price;S.rooms[rid]={bowlAt:0,at:now()};giveBowl(rid);if(typeof giveWater==='function')giveWater(rid);addXp(20);const moved=fillWait();save();return {moved}}
function clampItem(it){
  const f=FURN[it.fid];
  it.x=clamp(it.x,f.w/2,WORLD_W-f.w/2);
  it.y=f.kind==='wall'?clamp(it.y,f.h+4,WALL_Y-4):clamp(it.y,FLOOR_MIN,FLOOR_MAX+2);
}
function skipTime(){
  S.trips.forEach(p=>{if(p)p.end-=600000});
  S.items.forEach(i=>{if(i.at)i.at-=600000});
  S.cats.forEach(c=>{if(c.buff)c.buff.until-=600000});
  S.scratchAt-=600000; tick(600); save();
}
