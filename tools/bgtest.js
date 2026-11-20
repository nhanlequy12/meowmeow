"use strict";
/* Kiểm thử đồng hồ game khi trang bị ẩn (js/bg.js). Chạy: node tools/bgtest.js. Thoát mã 1 nếu có phần hỏng.
   Mỗi lượt chạy trong một ngữ cảnh vm riêng (Date, Math, mọi biến toàn cục của game riêng), đồng hồ giả (Date.now), Math.random có hạt giống,
   nạp đúng mã luật của game: data.js, *-data.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js, garden.js, bond.js, event.js, visit.js,
   roomup.js, contest.js, play.js, compat.js, photo.js, acc.js, rồi js/bg.js (không có DOM: chỉ phần chia bước của tick).
   1. Ẩn trang 30 phút, hẹn giờ bị hãm còn 1 lần/phút: tick(60) qua bg.js cho ra bản lưu GIỐNG HỆT 1.800 lần tick(1) mỗi giây
      (xu, no, năng lượng, vui, nước, viễn chinh, bát ăn, máy cho ăn tự động, kho, thời tiết, bệnh...). In thêm độ lệch của cách cũ (một bước tick(60)).
   2. Nhịp hãm 1 lần/giây (dt 1,0) đi thẳng, không chia; dt 2,4 giây chia 3 bước.
   3. Vắng lâu (máy ngủ 3 giờ): bù như load() (bước 10 phút, sim), không lỗi, không bù hai lần, tổng kết AWAY, save() hoãn tới cuối.
   4. save() gọi giữa các bước bù được hoãn: một lần ghi, `last` là giờ thật. */
const fs=require('fs'),path=require('path'),vm=require('vm');const R=path.join(__dirname,'..');
const FILES=['data.js','wx-data.js','pw-data.js','med-data.js','garden-data.js','event-data.js','visit-data.js','acc-data.js','compat-data.js','photo-data.js',
  'game.js','wx.js','pw.js','med.js','meal.js','stray.js','garden.js','bond.js','event.js','visit.js','roomup.js','contest.js','play.js','compat.js','photo.js','acc.js'].map(f=>'js/'+f).filter(f=>fs.existsSync(path.join(R,f)));
const SRC=FILES.map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n'),BG=fs.readFileSync(path.join(R,'js/bg.js'),'utf8');
const T0=Date.UTC(2026,10,20,3,0,0); // 10 giờ sáng giờ Việt Nam
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
// một "thế giới": ngữ cảnh vm riêng; bg=1 thì nạp thêm js/bg.js
function world(bg,state){
  const store={};const ctx={console,setTimeout,clearTimeout,localStorage:{getItem:k=>k in store?store[k]:null,setItem:(k,v)=>{store[k]=String(v)},removeItem:k=>{delete store[k]}}};
  vm.createContext(ctx);
  vm.runInContext('globalThis.CLK='+T0+';Date.now=()=>CLK;let __s=20261120;Math.random=()=>{__s=(__s*1103515245+12345)%2147483648;return __s/2147483648};',ctx);
  vm.runInContext(SRC+`\n;globalThis.G={get S(){return S},set S(v){S=v},fresh,newCat,tick,save,load,feedRoom,startTrip,claimTrip,giveBowl,homeCats,SP,FURN,DEST,
    get AWAY(){return AWAY},get TOFF(){return TOFF},setNotify:f=>{notify=f},tick0:tick};`,ctx);
  if(bg)vm.runInContext(BG+'\n;G.BG=BG;G.tick=tick;',ctx);
  const N=[];vm.runInContext('G.setNotify((m,o)=>NOTE.push(m))',Object.assign(ctx,{NOTE:N}));
  ctx.G.S=JSON.parse(state);ctx.store=store;ctx.N=N;
  return ctx;
}
// trạng thái ban đầu: cấp 8, thời tiết mở, 20 bé ở 3 phòng, bát ăn có suất, máy cho ăn tự động, 2 chuyến viễn chinh, buff sắp hết
function initState(){
  const w=world(0,'{}'),G=w.G;
  vm.runInContext(`fresh();S.tut={done:1,old:1,hints:{all:1},got:{},wx:1,med:1};S.level=8;S.xp=0;S.coins=20000;S.wxU=1;fixSlots();
    ['bedroom','kitchen'].forEach(r=>{S.rooms[r]={bowlAt:0};giveBowl(r);if(typeof giveWater==='function')giveWater(r)});
    const L=BREEDS.filter(b=>b.r<=3);
    for(let i=0;i<20;i++){const c=newCat(L[(i*5)%L.length],L[(i*5)%L.length].r);c.room=['living','bedroom','kitchen'][i%3];c.full=15+i*4;c.en=30+i*3;c.hp=50+i;c.wa=40+i*2;c.petAt=0;S.cats.push(c);markSeen(c)}
    S.items.push({iid:S.nid++,fid:'feeder',room:'kitchen',x:300,y:150,flip:false,broken:false});
    if(typeof mealLoad==='function')mealLoad();
    S.cats[3].buff={until:Date.now()+5*60000,hunger:.5};
    ['living','bedroom'].forEach(r=>feedRoom(r,'kibble'));
    const d=DESTS.filter(x=>!locked(x));S.trips=S.trips.map(()=>null);
    [S.cats[1],S.cats[2]].forEach((c,i)=>{c.en=100;c.full=90;if(!startTrip(i,c.uid,d[i%d.length].id))throw new Error('startTrip');});
    S.last=Date.now();`,w);
  return JSON.stringify(G.S);
}
const ST=initState();
const pick=S=>{const o=JSON.parse(JSON.stringify(S));delete o.last;return o};
function diffs(a,b,p,out){if(out.length>12)return out;
  if(typeof a!==typeof b||(a&&b&&typeof a==='object')!==(a&&b&&typeof b==='object')){out.push(p+': '+JSON.stringify(a)+' ≠ '+JSON.stringify(b));return out}
  if(a&&typeof a==='object'){const ks=new Set(Object.keys(a).concat(Object.keys(b)));for(const k of ks)diffs(a[k],b[k],p+'.'+k,out);return out}
  if(typeof a==='number'&&Math.abs(a-b)<=1e-9*Math.max(1,Math.abs(a)))return out;
  if(a!==b)out.push(p+': '+JSON.stringify(a)+' ≠ '+JSON.stringify(b));return out}
const sum=(S,k)=>S.cats.reduce((s,c)=>s+(c[k]||0),0);
const desc=S=>'xu '+Math.round(S.coins)+', no '+sum(S,'full').toFixed(1)+', năng lượng '+sum(S,'en').toFixed(1)+', vui '+sum(S,'hp').toFixed(1)+', nước '+sum(S,'wa').toFixed(1)+
  ', chuyến xong '+S.trips.filter(p=>p&&p.end<=T0+1800000).length+', suất trong bát '+S.items.filter(i=>i.fl).reduce((s,i)=>s+i.fl.length,0);

// 1. ẩn 30 phút, hẹn giờ 1 lần/phút
{
  const A=world(0,ST),B=world(1,ST),C=world(0,ST);
  let errA=null,errB=null,errC=null;
  try{for(let s=1;s<=1800;s++){A.CLK+=1000;A.G.tick(1)}}catch(e){errA=e}
  try{for(let m=1;m<=30;m++){B.CLK+=60000;B.G.tick(60)}}catch(e){errB=e}
  try{for(let m=1;m<=30;m++){C.CLK+=60000;C.G.tick0(60)}}catch(e){errC=e}
  ok('Tick đều mỗi giây chạy không lỗi',!errA,errA&&errA.stack);
  ok('Ẩn trang, hẹn giờ 1 lần/phút, qua js/bg.js: không lỗi',!errB,errB&&errB.stack);
  const d=diffs(pick(A.G.S),pick(B.G.S),'S',[]);
  ok('Bản lưu sau 30 phút giống hệt tick mỗi giây',d.length===0,d.length?d.slice(0,8).join(' | '):desc(B.G.S));
  ok('Thông báo trong game giống hệt (cùng nội dung, cùng thứ tự)',JSON.stringify(A.N)===JSON.stringify(B.N),A.N.length+' thông báo');
  ok('bg.js đã chia: 30 lần gọi tick(60) → mỗi lần 60 bước 1 giây',B.G.BG.n===30,B.G.BG.n);
  ok('Đồng hồ được trả lại sau khi chia bước',vm.runInContext('Date.now()',B)===B.CLK);
  const dc=diffs(pick(A.G.S),pick(C.G.S),'S',[]);
  console.log('      (tham khảo) cách cũ, một bước tick(60) mỗi phút: '+(errC?'lỗi '+errC.message:dc.length?'lệch ở '+dc.length+'+ chỗ, ví dụ '+dc.slice(0,3).join(' | '):'không lệch'));
  console.log('      tick mỗi giây: '+desc(A.G.S));
  ok('Trong 30 phút có diễn biến thật (no giảm, chuyến viễn chinh về, mèo ăn)',sum(A.G.S,'full')!==sum(JSON.parse(ST),'full')&&A.G.S.trips.some(p=>p&&p.end<=A.CLK));
}
// 2. nhịp 1 giây không chia; 2,4 giây chia 3 bước
{
  const B=world(1,ST);B.CLK+=1000;B.G.tick(1);ok('dt 1 giây: đi thẳng, không chia',B.G.BG.n===0);
  const A=world(0,ST),D=world(1,ST);
  for(let i=1;i<=3;i++){A.CLK+=800;A.G.tick(.8)}
  D.CLK+=2400;D.G.tick(2.4);
  const d=diffs(pick(A.G.S),pick(D.G.S),'S',[]);
  ok('dt 2,4 giây chia 3 bước 0,8 giây, giống 3 lần tick(0,8)',D.G.BG.n===1&&d.length===0,d.slice(0,4).join(' | '));
}
// 3. vắng lâu (máy ngủ 3 giờ): bù như load()
{
  const B=world(1,ST),L=world(0,ST);
  let err=null;try{B.CLK+=3*3600000;B.G.tick(3*3600)}catch(e){err=e}
  ok('Máy ngủ 3 giờ: không lỗi, đi đường bù vắng mặt',!err&&B.G.BG.away===1,err&&err.stack);
  ok('Bù xong: TOFF về 0, thông báo bật lại',B.G.TOFF===0);
  // so với load(): ghi bản lưu, tua đồng hồ 3 giờ rồi load() (bỏ phần chuyển đổi bản cũ không liên quan bằng cách so cùng một trạng thái đã qua load)
  L.G.S.last=L.CLK;L.store.meoxu_v2=JSON.stringify(L.G.S);L.CLK+=3*3600000;let errL=null;try{L.G.load()}catch(e){errL=e}
  const sb=B.G.S,sl=L.G.S;
  const close=(a,b,t)=>Math.abs(a-b)<=t;
  ok('Kết quả gần như load() sau 3 giờ vắng (xu, no, năng lượng, chuyến viễn chinh)',!errL&&close(sb.coins,sl.coins,sl.coins*.02+50)&&close(sum(sb,'full'),sum(sl,'full'),40)&&close(sum(sb,'en'),sum(sl,'en'),40)&&
    JSON.stringify(sb.trips)===JSON.stringify(sl.trips),'bg: '+desc(sb)+' | load: '+desc(sl));
  const c0=JSON.stringify(pick(sb));B.CLK+=1000;B.G.tick(1);
  const d=diffs(JSON.parse(c0),pick(sb),'S',[]).filter(x=>!/\.(full|en|hp|wa|he|cf|t|bat|p|wat)\b|\.ng:|\.wxs|\.ill|warnAt|\.q\.|\.vis/.test(x));
  ok('Không bù hai lần: giây kế tiếp chỉ trôi 1 giây',d.length<=3&&Math.abs(sb.coins-JSON.parse(c0).coins)<200,d.slice(0,4).join(' | '));
}
// 4. save() giữa các bước bù được hoãn
{
  const B=world(1,ST);let n=0,lasts=[];
  // gọi save() ở mỗi bước bù (giống bé bỏ nhà đi, về nhà): móc vào tick gốc qua strayTick nếu có, không thì qua gardenTick
  vm.runInContext(`{const K=typeof gardenTick==='function'?'gardenTick':'strayTick';const F=globalThis[K]||eval(K);const W=function(){const r=F.apply(this,arguments);save();return r};
     if(K==='gardenTick')gardenTick=W;else strayTick=W}`,B);
  const S0=B.localStorage.setItem;B.localStorage.setItem=(k,v)=>{if(k==='meoxu_v2'){n++;lasts.push(JSON.parse(v).last)}S0(k,v)};
  B.CLK+=60000;B.G.tick(60);
  ok('save() gọi ở 60 bước bù chỉ ghi một lần, sau khi bù xong',n===1,n+' lần ghi');
  ok('`last` của bản ghi là giờ thật (không lùi)',lasts[0]===B.CLK,lasts[0]-B.CLK+' ms');
  B.CLK+=1000;B.G.tick(1);ok('Ngoài lúc bù, save() ghi ngay như cũ',n===2);
}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đạt');process.exit(fail?1:0);
