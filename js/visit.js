"use strict";
/* ============ MÈO GHÉ CHƠI (2026-11-14): luật, không đụng DOM ============
   Dữ liệu và hàm sinh bé lạ ở js/visit-data.js; giao diện ở js/visit-ui.js.
   - Mỗi ngày tối đa VIS.perDay lượt ghé, cách nhau VIS.gap phút, mỗi lượt bé ở lại VIS.stay phút (trôi cả lúc vắng mặt, khi bù thời gian lúc tải game).
   - Một lượt ghé là một bé lạ MỚI (tối đa VIS.newPerDay bé mỗi ngày) hoặc một bé quen quay lại (xác suất VIS.back).
     Bé mới: lấy mã khách 'ngày.lượt.k' cho cả VIS.cand ứng viên, chọn ứng viên bị phòng của bạn hút nhất.
   - Độ hút của phòng (visAttract): món khoái khẩu trong bát, bát có thức ăn, nội thất bé thích (thuộc tính like), đồ chơi, ngoài trời/trong nhà, độ vui của phòng.
     Bé vào phòng hút nhất. Mỗi lần ghé cộng điểm làm quen (nhiều hơn ở phòng hút); trong lúc bé ở đây, vuốt ve một lần và mời ăn một lần được thêm điểm.
   - Đủ VIS.need điểm: bé "muốn ở lại", người chơi chọn Nhận nuôi (thành mèo thường, mang mã c.vq, vào phòng còn chỗ hoặc Phòng chờ) hoặc Để bé đi.
     Bé quen quá VIS.life ngày kể từ lần đầu ghé thì đi xa, không ghé nữa. Lần đầu ghé bé để lại kỷ vật nhỏ (ít xu hoặc một món đồ rẻ vào Kho đồ).
   Trạng thái S.vis = {day, n: lượt ghé hôm nay, next: lúc lượt sau, us: ['ngày.lượt' đã dùng], cur: lượt đang ghé {id, rid, at, end, pet, fed, add, gift},
     g: {mã: {pts, n, last, st:'on'|'ready'}}, ad: [mã đã nhận nuôi] (trọng tài máy chủ đọc), aw: tổng kết lúc vắng {n, coins, items}}.
   Bọc tick (game.js) để chạy visTick sau mỗi nhịp. Nạp sau js/garden.js, trước js/compat.js và js/ui.js (load() bù giờ vắng cũng tính). */
const VMIN=60000;
const visOpen=()=>!!(S&&S.level>=VIS.lv&&S.tut&&S.tut.done);
function visS(){
  if(!S.vis)S.vis={day:visDay(now()),n:0,next:now()+rnd(VIS.first[0],VIS.first[1])*VMIN,us:[],cur:null,g:{},ad:[]};
  const V=S.vis;V.g=V.g||{};V.ad=V.ad||[];V.us=V.us||[];return V;
}
// bé lạ dựng sẵn để vẽ trong phòng và tính độ hút (không nằm trong S.cats, uid âm)
const VCACHE={};
function visCat(id){
  if(VCACHE[id])return VCACHE[id];const g=visGen(id),p=visParse(id);if(!g)return null;
  const c={uid:-(p.d*100+p.s*10+p.k+1),sp:g.sp,star:g.star,sex:g.sex,name:g.name,traits:g.traits.slice(),full:80,en:100,hp:70,room:null,buff:null,petAt:0,born:now()-g.age*DAY,vis:id};
  if(g.coat)c.coat=g.coat;return VCACHE[id]=c;
}
const visRooms=()=>ownedRooms().filter(r=>!r.wait&&r.id!=='wait');
// độ hút của một phòng với một bé lạ (số không âm, thường 1–10)
function visAttract(id,rid){
  const c=typeof id==='string'?visCat(id):id;if(!c||!ROOM[rid])return 0;
  const its=itemsIn(rid).filter(i=>!i.broken),fv=favs(c);let sc=1;
  const bowls=its.filter(i=>FURN[i.fid].bowl).map(i=>Array.isArray(i.fl)?i.fl:(i.left>0&&i.food?[i.food]:[]));
  if(bowls.some(l=>l.some(f=>fv.includes(f))))sc+=3;else if(bowls.some(l=>l.length))sc+=1.5;
  c.traits.forEach(t=>{const e=TRAITS[t].e;if(e.like&&(roomHas(rid,e.like[0])||(e.like[0]==='tree'&&its.some(i=>FURN[i.fid].lv))))sc+=2.5;
    if(e.outdoor&&ROOM[rid].outdoor)sc+=1.5;if(e.indoor&&!ROOM[rid].outdoor)sc+=1});
  sc+=Math.min(3,new Set(its.filter(i=>FURN[i.fid].cat==='toy').map(i=>i.fid)).size*.6);
  sc+=Math.max(0,roomHappy(rid))/15;
  return Math.round(sc*10)/10;
}
// phòng hút bé nhất: {rid, sc}
function visBest(id){let b=null;visRooms().forEach(r=>{const sc=visAttract(id,r.id);if(!b||sc>b.sc)b={rid:r.id,sc}});return b}
const visSlotUsed=(V,sl)=>V.us.includes(sl)||V.ad.some(x=>visSlot(x)===sl)||Object.keys(V.g).some(x=>visSlot(x)===sl);
// mã khách cho một bé lạ MỚI của ngày d (null nếu đã hết lượt): ứng viên bị nhà bạn hút nhất
function visNewId(d){
  const V=visS();
  for(let s=0;s<VIS.newPerDay;s++){const sl=d+'.'+s;if(visSlotUsed(V,sl))continue;
    let best=null;for(let k=0;k<VIS.cand;k++){const id=sl+'.'+k,b=visBest(id),sc=b?b.sc:0;if(!best||sc>best.sc)best={id,sc}}
    return best&&best.id}
  return null;
}
const visKnown=()=>{const V=visS();return Object.keys(V.g).filter(id=>V.g[id].st==='on'||V.g[id].st==='ready')};
const visDaysLeft=id=>{const p=visParse(id);return p?p.d+VIS.life-visDay(now()):0};
// điểm làm quen; đủ thì bé muốn ở lại
function visAddPts(id,n,sim){
  const g=visS().g[id];if(!g)return 0;const old=g.pts;g.pts=Math.min(VIS.need,g.pts+n);
  if(old<VIS.need&&g.pts>=VIS.need){g.st='ready';const c=visCat(id);
    if(!sim)notify('đã quen nhà bạn và muốn ở lại! Bấm ô 🐾 trên cùng để nhận nuôi bé (hoặc để bé đi).',{icon:'🏠',title:c.name,key:'visready',mtitle:'Mèo muốn ở lại',ms:10000})}
  return g.pts-old;
}
// bắt đầu một lượt ghé. id, rid bỏ trống thì tự chọn. force: bỏ qua giới hạn số lượt ghé hôm nay (Admin)
function visStart(id,rid,sim,force){
  const V=visS(),t=now(),d=visDay(t);
  if(V.cur)return null;
  if(!force&&V.n>=VIS.perDay)return null;
  if(!visRooms().length)return null;
  if(!id){
    const known=visKnown(),nid=visNewId(d);
    if(known.length&&(!nid||Math.random()<VIS.back)){const w=known.map(k=>1+V.g[k].pts/25);let r=Math.random()*w.reduce((a,b)=>a+b,0),i=0;while(i<w.length-1&&r>w[i]){r-=w[i];i++}id=known[i]}
    else id=nid;
    // Admin: hôm nay hết bé mới mà không có bé quen thì lấy một lượt chưa dùng của mấy ngày trước (vẫn hợp lệ với trọng tài)
    if(!id&&force)for(let k=1;k<VIS.life&&!id;k++)id=visNewId(d-k);
  }
  if(!id||!visCat(id))return null;
  if(!V.g[id]){V.g[id]={pts:0,n:0,last:0,st:'on'};const sl=visSlot(id);if(!V.us.includes(sl))V.us.push(sl)}
  const g=V.g[id],first=!g.n;rid=rid&&S.rooms[rid]&&rid!=='wait'?rid:visBest(id).rid;
  g.n++;g.last=t;V.n++;
  const sc=visAttract(id,rid),add=VIS.pts.visit+Math.min(VIS.pts.attr,Math.round(sc*2));
  V.cur={id,rid,at:t,end:t+rnd(VIS.stay[0],VIS.stay[1])*VMIN,pet:0,fed:0,add,sc};
  visAddPts(id,add,sim);
  if(first){ // kỷ vật lần đầu ghé
    const c=visCat(id),G=VIS.gift,L=G.items.filter(f=>FURN[f]&&!locked(FURN[f]));
    if(Math.random()<G.coin||!L.length){const n=G.coins[0]+G.coins[1]*c.star;S.coins+=n;V.cur.gift={coins:n}}
    else{const f=L[Math.floor(Math.random()*L.length)];S.items.push({iid:S.nid++,fid:f,room:null,x:120,y:140,flip:false,broken:false});V.cur.gift={fid:f}}
  }
  if(sim){const a=V.aw=V.aw||{n:0,coins:0,items:[]};a.n++;if(V.cur.gift){a.coins+=V.cur.gift.coins||0;if(V.cur.gift.fid)a.items.push(V.cur.gift.fid)}}
  save();return V.cur;
}
// kết thúc lượt ghé (bé về)
function visEnd(){const V=visS();if(!V.cur)return;V.cur=null;V.next=now()+rnd(VIS.gap[0],VIS.gap[1])*VMIN;save()}
// vuốt ve bé lạ đang ghé: một lần mỗi lượt ghé; trả số điểm làm quen được thêm
function visPet(){
  const V=visS(),cu=V.cur;if(!cu||cu.pet||!V.g[cu.id])return 0;cu.pet=1;const n=visAddPts(cu.id,VIS.pts.pet);save();return n||0;
}
// giá mời một suất (lấy từ kho thức ăn nếu có)
const visFoodCost=fid=>(S.fdinv&&S.fdinv[fid]>0)?0:(typeof mPrice==='function'?mPrice('f',fid,1):Math.max(1,Math.round(FOOD[fid].price/8)));
// mời bé lạ ăn một suất: một lần mỗi lượt ghé; món khoái khẩu được nhiều điểm hơn
function visFeed(fid){
  const V=visS(),cu=V.cur,f=FOOD[fid];
  if(!cu||!V.g[cu.id])return {err:'Bé không còn ở đây.'};
  if(cu.fed)return {err:'Bé vừa ăn rồi, lần ghé sau mời tiếp nhé.'};
  if(!f||!(f.full>0))return {err:'Món này không mời được.'};
  if(locked(f)&&!(S.fdinv&&S.fdinv[fid]>0))return {err:'Món này chưa mở khóa.'};
  const cost=visFoodCost(fid);
  if(cost&&S.coins<cost)return {err:'Không đủ xu: cần '+cost+' xu.'};
  if(cost)S.coins-=cost;else S.fdinv[fid]--;
  const fav=favs(visCat(cu.id)).includes(fid);cu.fed=1;
  const n=visAddPts(cu.id,fav?VIS.pts.fav:VIS.pts.feed);save();return {n:n||0,cost,fav};
}
// nhận nuôi: bé thành mèo thường mang mã c.vq (trọng tài máy chủ chạy lại visGen để kiểm)
function visAdopt(id){
  const V=visS(),g=V.g[id];
  if(!g||g.st!=='ready')return {err:'Bé chưa đủ thân để về ở hẳn.'};
  if(V.ad.includes(id))return {err:'Bé đã được nhận nuôi rồi.'};
  const x=visGen(id);if(!x)return {err:'Không tìm thấy bé.'};
  const c={uid:S.nid++,sp:x.sp,star:x.star,sex:x.sex,name:x.name,traits:x.traits.slice(),full:80,en:100,hp:60,room:freeRoom(),buff:null,petAt:0,born:now()-x.age*DAY,vq:id};
  if(x.coat)c.coat=x.coat;
  S.cats.push(c);markSeen(c);V.ad.push(id);delete V.g[id];
  if(V.cur&&V.cur.id===id){V.cur=null;V.next=now()+rnd(VIS.gap[0],VIS.gap[1])*VMIN}
  addXp(VIS.xp);onAct('adopt',1);save();return {cat:c};
}
// để bé đi: bé không ghé nữa (không ép nhận mèo trùng)
function visLetGo(id){
  const V=visS(),g=V.g[id];if(!g)return false;delete V.g[id];
  if(V.cur&&V.cur.id===id)visEnd();else save();return true;
}
function visTick(dt,sim){
  if(!S||!visOpen())return;
  const V=visS(),t=now(),d=visDay(t);
  if(V.day!==d){V.day=d;V.n=0}
  V.us=V.us.filter(x=>+x.split('.')[0]>=d-VIS.keep-2);
  V.ad=V.ad.filter(x=>{const p=visParse(x);return p&&p.d>=d-VIS.keep-2});   // giữ lâu hơn hạn của trọng tài một chút
  for(const id in V.g){if(visDaysLeft(id)<0&&!(V.cur&&V.cur.id===id)){const c=visCat(id),g=V.g[id];delete V.g[id];
    if(!sim&&g.pts>0)notify('đã đi xa, không ghé nhà bạn nữa.',{icon:'👋',title:c?c.name:'Bé lạ',key:'visgone'})}}
  if(V.cur&&(!V.g[V.cur.id]||t>=V.cur.end))visEnd();
  if(!V.cur&&t>=V.next){
    if(V.n>=VIS.perDay)V.next=(d+1)*86400000-7*3600000+rnd(20,90)*VMIN;   // hết lượt hôm nay: sáng mai mới có bé ghé
    else if(!visStart(null,null,sim))V.next=t+rnd(VIS.gap[0],VIS.gap[1])*VMIN;
  }
}
{const T0=tick;tick=function(dt,sim){const r=T0.apply(this,arguments);visTick(dt,sim);return r}}
