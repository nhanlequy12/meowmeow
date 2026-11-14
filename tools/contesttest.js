"use strict";
/* Kiểm thử cuộc thi mèo hằng ngày (chạy: node tools/contesttest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, garden-data.js, compat-data.js, game.js, wx.js, pw.js, med.js, meal.js,
   stray.js, garden.js, roomup.js, contest.js, compat.js, cùng trọng tài tools/guard.js. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
globalThis.performance=globalThis.performance||{now:()=>Date.now()};
const FILES=['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/compat-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/roomup.js','js/contest.js','js/compat.js'];
(0,eval)(FILES.filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},TRAITS,fresh,newCat,tick,load,save,catBy,FEATS,unlocksAt,SP,DAY,CT,CT_TH,CT_T,ctDay,ctThemeOf,ctOpen,ctClosed,ctS,ctCatSc,ctScore,ctBest,ctLuck,ctRivals,ctResult,ctRew,
    ctEnter,ctWithdraw,ctClaim,ctSync,ctBadges,ctExport,ctCoat,startTrip,
    setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
// đặt đồng hồ game tới giờ h của ngày (y, m, d) theo giờ máy
const at=(y,m,d,h)=>T.setToff(new Date(y,m-1,d,h,0,0).getTime()-Date.now());
const reset=lv=>{STORE=null;T.setToff(0);at(2026,12,5,10);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=1000;S.tickets=0;S.level=lv||8;S.xp=0;return S};
const cat=(o,sp,coat)=>{const c=T.newCat(T.SP[sp||'muop'],1);c.traits=[];c.room='living';c.hp=70;c.full=80;c.en=80;c.he=90;c.wa=90;c.cf=70;if(coat)c.coat=coat;Object.assign(c,o||{});T.S.cats.push(c);return c};

// 1. chủ đề theo ngày
{reset();const days=[];for(let i=1;i<=90;i++){const d=new Date(2026,0,i);days.push(d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate())}
  const th=days.map(T.ctThemeOf),set=new Set(th);
  ok('Có dòng mở khóa ở cấp 6',T.FEATS.some(f=>f.id==='contest'&&f.lv===6)&&T.unlocksAt(6).includes('Cuộc thi mèo hằng ngày'));
  ok('Chủ đề cố định theo ngày (gọi lại ra như cũ)',days.every((d,i)=>T.ctThemeOf(d)===th[i]));
  ok('Hai ngày liền nhau không trùng chủ đề',th.every((t,i)=>!i||t!==th[i-1]));
  ok('90 ngày ra đủ '+T.CT_TH.length+' chủ đề',set.size===T.CT_TH.length,[...set].join(','));}
// 2. mở khóa
{const S=reset(5);ok('Dưới cấp 6: chưa mở, không gửi được',!T.ctOpen()&&T.ctEnter([cat().uid]).err);
  S.level=6;S.tut.done=0;ok('Chưa xong hướng dẫn tân thủ: chưa mở',!T.ctOpen());S.tut.done=1;ok('Cấp 6 đã xong hướng dẫn: mở',T.ctOpen());}
// 3. gửi bài
{const S=reset(),c=T.ctS();c.th='happy';const a=cat({hp:90}),b=cat({hp:40}),x=cat();
  ok('Sai số bé: báo lỗi',/đúng 1 bé/.test(T.ctEnter([a.uid,b.uid]).err||''));
  const r=T.ctEnter([a.uid]);ok('Gửi 1 bé: lưu bài và điểm lúc gửi',!r.err&&c.e.u[0]===a.uid&&c.e.b===r.sc&&r.sc===T.ctScore('happy',[a]),r.sc);
  a.hp=10;ok('Điểm chốt lúc gửi, bé đổi chỉ số sau đó không đổi điểm',c.e.b===r.sc);
  T.ctEnter([b.uid]);ok('Gửi lại: thay bài cũ',c.e.u.length===1&&c.e.u[0]===b.uid);
  ok('Rút bài trước giờ chốt',T.ctWithdraw()&&!c.e);
  S.trips=[{uid:x.uid,dest:'park',start:Date.now(),end:Date.now()+9e9}];ok('Bé đang vắng nhà: không gửi được',/ở nhà/.test(T.ctEnter([x.uid]).err||''));}
// 4. chấm điểm từng chủ đề
{reset();const A=cat({hp:95}),B=cat({hp:50});ok('Vui nhất: bé vui hơn điểm cao hơn',T.ctCatSc('happy',A)>T.ctCatSc('happy',B));
  const c1=cat({},'muop','tabby'),c2=cat({},'muop','tabby'),c3=cat({},'muop','tabby'),c4=cat({},'muop','orange');
  const s3=T.ctScore('coat',[c1,c2,c3]),s2=T.ctScore('coat',[c1,c2,c4]);
  ok('Cùng màu lông: ba bé +25, hai bé +10',Math.abs(s3-s2-15)<.2,s3+' / '+s2);
  ok('Gợi ý chọn đội: ra ba bé cùng màu',T.ctBest('coat').every(c=>T.ctCoat(c)==='tabby'));
  const r1=cat({room:'living'}),r2=cat({room:'living'}),r3=cat({room:'living'}),r4=cat({room:'bedroom'});
  ok('Cùng phòng: +20',Math.abs(T.ctScore('room',[r1,r2,r3])-T.ctScore('room',[r1,r2,r4])-20)<.2);
  const old=cat({born:Date.now()+T.TOFF-40*T.DAY}),kit=cat({born:Date.now()+T.TOFF-1*T.DAY});[old,kit].forEach(c=>{c.en=80;c.he=90;c.hp=70});
  ok('Cụ mèo khỏe nhất: mèo già hơn mèo con',T.ctCatSc('elder',old)>T.ctCatSc('elder',kit));
  ok('Mèo con lanh lợi: mèo con hơn mèo già',T.ctCatSc('kitten',kit)>T.ctCatSc('kitten',old));
  const G=Object.keys(T.TRAITS).filter(t=>T.TRAITS[t].k==='g'),Bd=Object.keys(T.TRAITS).filter(t=>T.TRAITS[t].k==='b'),t3=cat({traits:G.slice(0,3)}),t0=cat({traits:Bd.slice(0,2)});
  ok('Nhiều tài: 3 thuộc tính tốt hơn 2 thuộc tính xấu',T.ctCatSc('talent',t3)-T.ctCatSc('talent',t0)>40,T.ctCatSc('talent',t3)+' / '+T.ctCatSc('talent',t0));
  ok('Điểm luôn trong 0..100',T.CT_TH.every(t=>T.S.cats.every(c=>{const s=T.ctCatSc(t.id,c);return s>=0&&s<=100})));
  ok('Chấm điểm thuần: gọi lại ra như cũ',T.CT_TH.every(t=>T.ctScore(t.id,[A])===T.ctScore(t.id,[A])));}
// 5. đối thủ, may rủi
{reset();const R1=T.ctRivals('2026-12-5','happy'),R2=T.ctRivals('2026-12-5','happy');
  ok('Đối thủ cố định theo ngày, '+T.CT.rivals+' nhà, điểm giảm dần',JSON.stringify(R1)===JSON.stringify(R2)&&R1.length===T.CT.rivals&&R1.every((x,i)=>!i||x.sc<=R1[i-1].sc));
  ok('Ngày khác thì đối thủ khác',JSON.stringify(T.ctRivals('2026-12-6','happy'))!==JSON.stringify(R1));
  let lo=9,hi=0;for(let i=0;i<500;i++){const l=T.ctLuck('2026-12-'+(i%28+1),[i,i+1]);lo=Math.min(lo,l);hi=Math.max(hi,l)}
  ok('May rủi trong ±8%',lo>=.92&&hi<=1.08&&hi-lo>.12,lo+' .. '+hi);
  ok('Cùng đội, cùng ngày: may rủi như nhau (thứ tự bé không quan trọng)',T.ctLuck('2026-12-5',[3,1,2])===T.ctLuck('2026-12-5',[1,2,3]));}
// 6. giờ chốt, kết quả, nhận thưởng
{const S=reset(10),c=T.ctS();c.th='happy';const a=cat({hp:100});a.star=5;T.ctEnter([a.uid]);
  ok('10 giờ: chưa chốt, chưa nhận được',!T.ctClosed()&&/Chưa tới giờ chốt/.test(T.ctClaim().err||''));
  at(2026,12,5,21);ok('21 giờ: đã chốt, không gửi bài mới',T.ctClosed()&&/đã chốt/.test(T.ctEnter([a.uid]).err||''));
  const res=T.ctResult(c.d,c.th,c.e);ok('Hạng khớp bảng xếp hạng',res.board.findIndex(x=>x.me)+1===res.rank&&res.board.length===T.CT.rivals+1,res.rank+' '+res.m);
  const c0=S.coins,t0=S.tickets,w=T.ctRew(res.m),r=T.ctClaim();
  ok('Nhận thưởng: cộng đúng xu, vé',!r.err&&S.coins===c0+w.coins&&S.tickets===t0+w.tickets,res.m+' +'+w.coins+' xu +'+w.tickets+' vé');
  ok('Nhận lần hai: báo lỗi, không cộng thêm',/Đã nhận/.test(T.ctClaim().err||'')&&S.coins===c0+w.coins);
  ok('Lịch sử và tổng số huy chương',c.h[0].m===res.m&&c.n[res.m]===1);
  ok('Huy chương ghi cho bé (trừ Khuyến khích)',res.m==='k'?!T.ctBadges(a.uid).length:T.ctBadges(a.uid)[0].m===res.m);}
// 7. thưởng nhỏ so với thu nhập
{const S=reset(18);const g=T.ctRew('g'),k=T.ctRew('k');ok('Cấp 18: Vàng 350 xu + 1 vé, Khuyến khích 70 xu',g.coins===350&&g.tickets===1&&k.coins===70,g.coins+' / '+k.coins);
  S.level=40;ok('Sau cấp 18 thưởng không tăng nữa',T.ctRew('g').coins===350);
  S.level=6;ok('Cấp 6: Vàng 170 xu',T.ctRew('g').coins===170);}
// 8. sang ngày: tự nhận, chủ đề mới
{const S=reset(),c=T.ctS();const a=cat({hp:90}),b=cat(),d=cat();const th=c.th,team=T.CT_T[th].team;T.ctEnter([a,b,d].slice(0,team).map(x=>x.uid));
  const c0=S.coins;at(2026,12,6,8);const got=T.ctSync();
  ok('Sang ngày mới: bài hôm qua tự nhận thưởng',got&&got.coins>0&&S.coins===c0+got.coins&&c.h[0].d==='2026-12-5',got&&got.m);
  ok('Sang ngày mới: chủ đề mới, chưa có bài',c.d==='2026-12-6'&&c.th===T.ctThemeOf('2026-12-6')&&!c.e&&!c.r);
  ok('Gọi lại trong cùng ngày: không làm gì',T.ctSync()===null);
  at(2026,12,9,8);ok('Bỏ mấy ngày không gửi bài: không có thưởng',T.ctSync()===null&&c.d==='2026-12-9');}
// 9. lưu, tải lại, bản lưu cũ, xuất điểm
{const S=reset(),c=T.ctS();c.th='happy';const a=cat();T.ctEnter([a.uid]);T.save();T.load();
  ok('Lưu và tải lại: giữ bài dự thi',T.S.ct.e&&T.S.ct.e.u[0]===a.uid);
  const ex=T.ctExport();ok('ctExport: điểm lúc gửi, chưa chốt',ex&&ex.day==='2026-12-5'&&ex.th==='happy'&&ex.sc===T.S.ct.e.b&&ex.fin===null&&!ex.closed&&ex.uids[0]===a.uid);
  at(2026,12,5,22);const ex2=T.ctExport();ok('ctExport sau giờ chốt: có điểm cuối và hạng',ex2.closed&&ex2.fin!=null&&ex2.rank>=1&&ex2.m);
  const o=JSON.parse(STORE);delete o.ct;STORE=JSON.stringify(o);T.load();
  ok('Bản lưu cũ không có S.ct: tự tạo, không lỗi',T.ctS().d&&T.ctExport()===null&&T.ctSync()===null);}
// 10. Admin ghi đè chủ đề, chốt ngay; bé đã phóng sinh mất huy chương
{const S=reset(),c=T.ctS();c.ov={d:c.d,th:'care'};c.th=T.ctThemeOf(c.d);ok('Admin đổi chủ đề hôm nay',c.th==='care');
  c.ov.cl=1;ok('Admin chốt ngay',T.ctClosed());
  const a=cat();c.bd[a.uid]={g:2};c.bd[99999]={s:1};at(2026,12,6,8);T.ctSync();
  ok('Sang ngày: bỏ ghi đè, bỏ huy chương của bé không còn',!c.ov&&!c.bd[99999]&&c.bd[a.uid].g===2);}
// 11. trọng tài máy chủ nhận phần thưởng cuộc thi
{const S=reset(10),c=T.ctS();c.th='happy';const a=cat({hp:100});T.save();const OLD=JSON.parse(JSON.stringify(S));T.ctEnter([a.uid]);at(2026,12,5,22);T.ctClaim();
  const NEU=JSON.parse(JSON.stringify(S)),q=o=>{const r=require('child_process').spawnSync('node',[path.join(R,'tools/guard.js')],{input:JSON.stringify(o)+'\n',encoding:'utf8'});try{return JSON.parse(r.stdout.trim().split('\n').pop())}catch(e){return {err:r.stderr.slice(0,200)}}};
  const base={old:OLD,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}},r=q(Object.assign({neu:NEU},base));
  ok('tools/guard.js nhận bản lưu sau khi nhận thưởng cuộc thi',r.ok===1,JSON.stringify(r).slice(0,160));}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
