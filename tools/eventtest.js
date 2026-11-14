"use strict";
/* Kiểm thử sự kiện theo mùa (chạy: node tools/eventtest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, garden-data.js, event-data.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js, garden.js, event.js,
   hình art.js + furn/ev-01.js, và trọng tài tools/guard.js (bản đã nạp thêm js/event-data.js). Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path'),os=require('os'),cp=require('child_process');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
globalThis.performance=globalThis.performance||{now:()=>Date.now()};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/event-data.js','js/sprites.js','js/art.js','js/furn/ev-01.js',
  'js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/event.js'].filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,buyItem,locked,SP,FURN,FURNS,FEATS,FCATS,EVENTS,EVENT,EVC,EV_LV,Art,
    evNow,evSetDate,evYMD,evMs,evDay,evRange,evList,evNext,evOpen,evSync,evSt,evAct,evHook,evClaim,evGift,evGiftReady,evShop,evBuy,evBought,evAdd,evParse,
    get EV_CONV(){return EV_CONV},get onAct(){return onAct},setOnAct:f=>{onAct=f},setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const H=3600000,DAY=86400000;
const vn=(y,m,d,h,mi,s)=>Date.UTC(y,m-1,d,h||0,mi||0,s||0)-7*H;   // mốc theo giờ Việt Nam
const at=t=>T.evSetDate(t);
const keys=t=>T.evList(t).map(x=>x.key).join(',');
const reset=(lv,t)=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=5000;S.level=lv==null?6:lv;S.cats.push(T.newCat(T.SP.muop,1));if(t)at(t);return S};

// 1. dữ liệu
{ok('Tính năng mở ở cấp 3 (lộ trình)',T.FEATS.some(f=>f.id==='event'&&f.lv===3)&&T.EV_LV===3);
 ok('Sáu sự kiện: Tết, Valentine, Ngày của mèo, Trung thu, Halloween, Giáng sinh',T.EVENTS.map(e=>e.id).join()==='tet,valentine,catday,moon,halloween,noel');
 const X=['evmam','evcarp','evcauldron','evsleigh'];
 ok('Bốn món độc quyền có dữ liệu, không nằm trong mục nào của cửa hàng xu',X.every(id=>T.FURN[id]&&T.FURN[id].cat==='event'&&!T.FCATS.some(c=>c[0]==='event')));
 ok('Món độc quyền không có trường set (không đổi điều kiện bộ trọn)',X.every(id=>!T.FURN[id].set));
 let bad=[];X.forEach(id=>{if(!T.Art.hasFurn(id))bad.push(id+' thiếu hình');else{try{const b=T.Art.furn(id,'');const d=b.rgba();let n=0;for(let i=3;i<d.length;i+=4)if(d[i]>10)n++;if(n<b.W*b.H*.2)bad.push(id+' quá ít điểm')}catch(e){bad.push(id+': '+e.message)}}});
 ok('Món độc quyền có hình hạt cườm, vẽ không lỗi',!bad.length,bad.join('; '));
 const ex=T.EVENTS.flatMap(e=>(e.extra||[]).concat(e.x||[]));ok('Mọi món cửa hàng sự kiện đều có thật',ex.every(id=>T.FURN[id]),ex.filter(id=>!T.FURN[id]).join());
 const sets=T.EVENTS.filter(e=>e.set).map(e=>[e.id,T.FURNS.filter(f=>f.set===e.set&&f.cat==='season').length]);ok('Bộ mùa của Tết, Trung thu, Halloween, Noel có món',sets.every(s=>s[1]>=2),JSON.stringify(sets));}
// 2. lịch, giờ Việt Nam, biên
{ok('Đầu ngày Việt Nam = 17 giờ hôm trước giờ UTC',T.evMs(2027,1,30)===Date.UTC(2027,0,29,17));
 ok('Tết 2027 (mùng 1 = 6/2): chưa diễn ra lúc 23:59:59 ngày 29/1',keys(vn(2027,1,29,23,59,59))==='');
 ok('Tết 2027: bắt đầu đúng 0 giờ 30/1 (giờ Việt Nam)',keys(vn(2027,1,30))==='tet2027');
 ok('Tết 2027 và Lễ Tình nhân trùng nhau 11–13/2: cả hai cùng diễn ra',keys(vn(2027,2,13,23,59,59))==='tet2027,valentine2027',keys(vn(2027,2,13,23,59,59)));
 ok('Tết 2027 kết thúc sau 13/2 (mùng 8): 14/2 chỉ còn Lễ Tình nhân',keys(vn(2027,2,14))==='valentine2027');
 ok('Lễ Tình nhân 11–15/2: 16/2 không còn',keys(vn(2027,2,15,23))==='valentine2027'&&keys(vn(2027,2,16))==='');
 ok('Tết 2026 (17/2): 10/2 → 24/2',keys(vn(2026,2,10))==='tet2026'&&keys(vn(2026,2,24,23,59))==='tet2026'&&keys(vn(2026,2,25))==='');
 const tt=y=>{const r=T.evRange(T.EVENT.tet,y);return T.evDay(r.s)+'→'+T.evDay(r.e-1)};
 ok('Tết 2028–2030 theo bảng âm lịch',tt(2028)==='2028-01-19→2028-02-02'&&tt(2029)==='2029-02-06→2029-02-20'&&tt(2030)==='2030-01-27→2030-02-10',[tt(2028),tt(2029),tt(2030)].join(' '));
 ok('Trung thu 2026 (rằm 25/9): 16/9 → 27/9',keys(vn(2026,9,15,23,59))===''&&keys(vn(2026,9,16))==='moon2026'&&keys(vn(2026,9,27,23,59))==='moon2026'&&keys(vn(2026,9,28))==='');
 ok('Trung thu 2028 (3/10) theo bảng',T.evDay(T.evRange(T.EVENT.moon,2028).s)==='2028-09-24');
 ok('Halloween 20/10 – 3/11 (gồm cả hai ngày)',keys(vn(2026,10,19,23,59,59))===''&&keys(vn(2026,10,20))==='halloween2026'&&keys(vn(2026,11,3,23,59,59))==='halloween2026'&&keys(vn(2026,11,4))==='');
 ok('Giáng sinh 15/12 – 2/1 qua năm mới, khóa theo năm bắt đầu',keys(vn(2026,12,14,23,59))===''&&keys(vn(2026,12,15))==='noel2026'&&keys(vn(2027,1,1,12))==='noel2026'&&keys(vn(2027,1,2,23,59,59))==='noel2026'&&keys(vn(2027,1,3))==='');
 ok('Ngày của mèo 5–11/8',keys(vn(2027,8,4,23,59))===''&&keys(vn(2027,8,8))==='catday2027'&&keys(vn(2027,8,12))==='');
 ok('Theo giờ Việt Nam, không theo giờ UTC: 16:59 UTC ngày 19/10 chưa, 17:00 UTC đã là 20/10',T.evList(Date.UTC(2026,9,19,16,59)).length===0&&T.evList(Date.UTC(2026,9,19,17,0)).length===1);
 ok('Năm ngoài bảng âm lịch (2033): không có Tết',T.evRange(T.EVENT.tet,2033)===null&&!keys(vn(2033,1,31)).includes('tet'));
 const nx=T.evNext(vn(2026,11,14));ok('Từ 14/11/2026: sự kiện tiếp theo là Giáng sinh 15/12',nx&&nx.key==='noel2026'&&T.evDay(nx.s)==='2026-12-15');
 ok('Đọc lại khóa lần: noel2026 → 15/12/2026 – 2/1/2027',(()=>{const p=T.evParse('noel2026');return p&&T.evDay(p.s)==='2026-12-15'&&T.evDay(p.e-1)==='2027-01-02'})());
 ok('Khóa lạ: không đọc được',T.evParse('abc2026')===null&&T.evParse('tet2040')===null);}
// 3. mở khóa theo cấp, ép ngày
{const S=reset(2,vn(2026,12,20,10));ok('Cấp 2: chưa mở, không có sự kiện, không nhận tiền',!T.evOpen()&&T.evSync().length===0);T.evAct('trip',1);ok('Cấp 2: không tạo trạng thái sự kiện',!S.ev||!Object.keys(S.ev.i||{}).length);
 S.level=3;ok('Cấp 3: mở, Giáng sinh đang diễn ra',T.evOpen()&&T.evSync().map(x=>x.key).join()==='noel2026');
 S.tut.done=0;ok('Đang hướng dẫn tân thủ: chưa mở',!T.evOpen());S.tut.done=1;
 ok('Ép ngày: đồng hồ sự kiện chạy tiếp từ mốc đã ép',Math.abs(T.evNow()-vn(2026,12,20,10))<5000);
 at(null);ok('Về ngày thật',Math.abs(T.evNow()-Date.now())<5000);}
// 4. tiền từ chơi thường, trần mỗi ngày, nhiệm vụ, quà ghé thăm
{const S=reset(6,vn(2026,10,25,9)),k='halloween2026';T.evSync();const st=T.evSt(k);
 ok('Ngày đầu: bốc 3 nhiệm vụ khác nhau',st.q.length===3&&new Set(st.q.map(q=>q.k)).size===3,st.q.map(q=>q.k).join());
 T.evAct('trip',1);ok('Viễn chinh về: +'+T.EVC.earn.trip,st.c===T.EVC.earn.trip,st.c);
 T.evAct('tripcoin',500);ok('Loại không có trong bảng (xu viễn chinh): không cộng',st.c===T.EVC.earn.trip);
 for(let i=0;i<200;i++)T.evAct('pet',1);ok('Trần '+T.EVC.dayCap+' mỗi ngày từ chơi thường',st.e===T.EVC.dayCap&&st.c===T.EVC.dayCap,st.c);
 const c0=st.c;ok('Quà ghé thăm: nhận được một lần',T.evGiftReady(k)&&T.evGift(k).n===T.EVC.gift&&!T.evGiftReady(k)&&T.evGift(k).err&&st.c===c0+T.EVC.gift);
 const q0=st.q[0];q0.p=0;ok('Nhiệm vụ chưa xong: không nhận được',!!T.evClaim(k,0).err);
 q0.p=0;T.evAct(q0.k,q0.n);ok('Làm đủ: tiến độ đầy',q0.p===q0.n,q0.p+'/'+q0.n);
 const c1=st.c;ok('Nhận thưởng nhiệm vụ: +'+T.EVC.qRew+', không nhận hai lần',T.evClaim(k,0).n===T.EVC.qRew&&!!T.evClaim(k,0).err&&st.c===c1+T.EVC.qRew);
 ok('Thưởng cả ba: chưa xong thì không nhận',!!T.evClaim(k,'all').err);
 st.q[1].p=st.q[1].n;T.evClaim(k,1);st.q[2].p=st.q[2].n;
 // sang ngày: nhiệm vụ đã xong mà chưa nhận được cộng tự động (25 + thưởng cả ba 30), bốc nhiệm vụ mới, trần chơi thường đặt lại
 const c2=st.c;at(vn(2026,10,26,0,0,1));T.evSync();
 ok('Sang ngày (0 giờ Việt Nam): tự cộng nhiệm vụ đã xong mà chưa nhận, kể cả thưởng cả ba',st.c===c2+T.EVC.qRew+T.EVC.qAll,st.c-c2);
 ok('Sang ngày: nhiệm vụ mới, trần chơi thường và quà ghé thăm đặt lại',st.q.every(q=>!q.got&&q.p===0)&&st.e===0&&T.evGiftReady(k));
 const c3=st.c;T.setToff(-1000);T.evAct('trip',1);T.setToff(0);ok('Lúc bù thời gian vắng mặt: không cộng tiền',st.c===c3);
 // móc vào onAct
 let base=0;T.setOnAct(()=>base++);T.evHook();T.onAct('catch',1);
 ok('evHook bọc onAct: hàm cũ vẫn chạy, có thêm tiền sự kiện',base===1&&st.c===c3+T.EVC.earn.catch);}
// 5. cửa hàng sự kiện
{const S=reset(3,vn(2026,12,18,15)),k='noel2026';T.evSync();const st=T.evSt(k);const L=T.evShop('noel');
 ok('Cửa hàng Giáng sinh: món độc quyền, cả bộ Noel, vé, hộp thức ăn',L.some(e=>e.sid==='x:evsleigh')&&['xmastree','wreath','snowman','giftpile','winsnow'].every(id=>L.some(e=>e.fid===id))&&L.some(e=>e.k==='tk')&&L.some(e=>e.k==='food'));
 const tree=L.find(e=>e.fid==='xmastree');ok('Món bộ mùa rẻ hơn mua bằng xu (quy theo giá trị tiền sự kiện)',tree.p*T.EVC.xu<T.FURN.xmastree.price,tree.p+' tiền ≈ '+tree.p*T.EVC.xu+' xu < '+T.FURN.xmastree.price);
 ok('Không bán món độc quyền của sự kiện khác',!L.some(e=>e.fid==='evmam'||e.fid==='evcauldron'));
 ok('Thiếu tiền: không đổi được',!!T.evBuy(k,'tk','living',100).err&&S.tickets===0);
 st.c=2000;const tk0=S.tickets,c0=S.coins;
 ok('Đổi vé: −'+T.EVC.tk+' tiền, +1 vé, không tốn xu',!T.evBuy(k,'tk','living',100).err&&S.tickets===tk0+1&&st.c===2000-T.EVC.tk&&S.coins===c0);
 for(let i=0;i<20;i++)T.evBuy(k,'tk','living',100);ok('Vé tối đa '+T.EVC.tkLim+' mỗi đợt',S.tickets===tk0+T.EVC.tkLim&&!!T.evBuy(k,'tk','living',100).err);
 const n0=S.items.length,r=T.evBuy(k,'x:evsleigh','living',200);
 ok('Đổi món độc quyền: đặt vào phòng đang xem, không tốn xu',!r.err&&S.items.length===n0+1&&r.it.room==='living'&&r.it.fid==='evsleigh'&&S.coins===c0,r.err);
 ok('Món bộ Noel cấp 9 vẫn đổi được ở cấp 3 (quà sự kiện), mua bằng xu thì vẫn khóa cấp như cũ',!T.evBuy(k,'f:xmastree','living',300).err&&T.locked(T.FURN.xmastree)&&T.buyItem('xmastree','living',100)===null);
 ok('Món bộ mùa: mỗi đợt đổi một lần',!!T.evBuy(k,'f:xmastree','living',300).err);
 const w=T.evBuy(k,'f:wreath','living',100);ok('Món treo tường đặt trên tường',w.it&&w.it.y===70);
 const cf=(S.fdinv||{}).premium||0;ok('Đổi hộp thức ăn: +8 suất Hộp cao cấp vào kho',!T.evBuy(k,'food','living',100).err&&S.fdinv.premium===cf+8);
 const st2=T.evSt(k);st2.c=999;const g=T.evBuy(k,'x:evsleigh',null,100);ok('Không có phòng: món cất vào Kho đồ',g.it&&g.it.room===null);
 ok('Món độc quyền tối đa 2 mỗi đợt',!!T.evBuy(k,'x:evsleigh','living',100).err);}
// 6. bộ theo mùa bằng xu không đổi
{const S=reset(9,vn(2026,6,1));S.coins=100000;const p=T.buyItem('peach','living',100);
 ok('Ngoài mùa: bộ Tết vẫn mua bằng xu như cũ',!!p&&S.coins===100000-T.FURN.peach.price);
 ok('Món bộ mùa vẫn nằm trong mục Theo mùa của cửa hàng xu',['peach','lantern','lixi','banhchung','pumpkin','batgar','xmastree','wreath','snowman','giftpile','winsnow','starlantern','mooncake','jaderabbit'].every(id=>T.FURN[id].cat==='season'));}
// 7. hết sự kiện: quy đổi tiền còn lại
{const S=reset(5,vn(2026,9,20,8)),k='moon2026';T.evSync();const st=T.evSt(k);st.c=137;st.q.forEach(q=>q.p=q.n);const c0=S.coins;
 at(vn(2026,9,27,23,59,59));T.evSync();ok('Ngày cuối: vẫn đang diễn ra, chưa quy đổi',st.cv==null&&S.coins===c0);
 at(vn(2026,9,28,0,0,1));T.EV_CONV.length=0;T.evSync();
 const want=(137+3*T.EVC.qRew+T.EVC.qAll)*T.EVC.conv;
 ok('Hết sự kiện: tiền còn lại (kể cả nhiệm vụ xong chưa nhận) đổi thành '+T.EVC.conv+' xu mỗi đồng',S.coins===c0+want&&st.c===0&&st.cv===want,S.coins-c0);
 ok('Báo cho giao diện một lần',T.EV_CONV.length===1&&T.EV_CONV[0].coins===want);
 T.evSync();T.evSync();ok('Không quy đổi hai lần',S.coins===c0+want);
 ok('Hết sự kiện: không đổi quà được nữa',!!T.evBuy(k,'tk','living',100).err);
 at(vn(2026,9,25,8));T.evAct('trip',1);ok('Lùi đồng hồ về giữa đợt đã quy đổi: không mở lại, không nhận thêm tiền',!T.evSync().some(x=>x.key===k)&&st.c===0&&!!T.evBuy(k,'tk','living',100).err);
 // dưới cấp mở mà có tiền còn sót (không thể xảy ra trong game thường): vẫn quy đổi
 const S2=reset(6,vn(2026,12,20));T.evSync();T.evSt('noel2026').c=10;S2.level=2;at(vn(2027,1,5));const c1=S2.coins;T.evSync();ok('Quy đổi cả khi tính năng chưa mở',S2.coins===c1+10*T.EVC.conv);}
// 8. lưu, tải lại, bản lưu cũ
{const S=reset(6,vn(2026,10,28,10)),k='halloween2026';T.evSync();T.evAct('trip',1);T.evSt(k).c+=400;const it=T.evBuy(k,'x:evcauldron','living',100);T.evSt(k).c+=50;T.save();
 const raw=JSON.parse(STORE);raw.last=Date.now();STORE=JSON.stringify(raw);T.load();
 ok('Tải lại: tiền sự kiện, nhiệm vụ và món độc quyền giữ nguyên',!it.err&&T.evSt(k).c===T.EVC.earn.trip+400-300+50&&T.S.items.some(i=>i.fid==='evcauldron'),T.evSt(k).c);
 STORE=null;T.fresh();T.S.tut={done:1,hints:{},got:{}};T.S.level=7;T.S.cats.push(T.newCat(T.SP.muop,1));const old=JSON.parse(JSON.stringify(T.S));delete old.ev;old.last=Date.now();STORE=JSON.stringify(old);T.load();
 ok('Bản lưu cũ không có S.ev: tải được, tạo trạng thái khi cần',!T.S.ev&&T.evSync().length===1&&!!T.S.ev.i.halloween2026);
 const o2=JSON.parse(JSON.stringify(T.S));o2.ev={i:{xyz2020:{c:40,tot:40}}};T.S.ev=o2.ev;const c0=T.S.coins;T.evSync();ok('Khóa sự kiện không còn trong game: quy đổi luôn, không lỗi',T.S.coins===c0+40*T.EVC.conv);}
// 9. trọng tài máy chủ: bản lưu có món độc quyền và tiền đã quy đổi (guard nạp thêm js/event-data.js)
{const S=reset(6,vn(2026,12,20,10)),k='noel2026';T.evSync();const OLD=JSON.parse(JSON.stringify(S));
 T.evAdd(600);T.evBuy(k,'x:evsleigh','living',100);T.evBuy(k,'f:snowman','living',200);T.evBuy(k,'tk','living',100);
 const NEU=JSON.parse(JSON.stringify(S));
 let src=fs.readFileSync(path.join(R,'tools/guard.js'),'utf8');const has=/event-data\.js/.test(src);
 if(!has)src=src.replace("'js/garden-data.js',","'js/garden-data.js','js/event-data.js',");
 src=src.replace("const ROOT=path.join(__dirname,'..');","const ROOT="+JSON.stringify(R)+";");
 const g=path.join(os.tmpdir(),'meoxu_guard_ev_'+process.pid+'.js');fs.writeFileSync(g,src);
 const q=o=>{const r=cp.spawnSync('node',[g],{input:JSON.stringify(o)+'\n',encoding:'utf8'});try{return JSON.parse(r.stdout.trim().split('\n').pop())}catch(e){return {err:r.stderr.slice(0,200)}}};
 const base={old:OLD,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:8000,x:200}},a=q(Object.assign({neu:NEU},base));
 ok('Trọng tài'+(has?'':' (bản đã thêm js/event-data.js)')+' nhận bản lưu có món đổi bằng tiền sự kiện',a.ok===1,JSON.stringify(a).slice(0,160));
 const bad=JSON.parse(JSON.stringify(NEU));bad.coins+=200000;const z=q(Object.assign({neu:bad},base));ok('Trọng tài vẫn bắt gian lận xu',z.ok===0,z.why);
 if(!has){const r=cp.spawnSync('node',[path.join(R,'tools/guard.js')],{input:JSON.stringify(Object.assign({neu:NEU},base))+'\n',encoding:'utf8'});let j={};try{j=JSON.parse(r.stdout.trim().split('\n').pop())}catch(e){}
   console.log('GHI CHÚ  tools/guard.js hiện tại chưa nạp js/event-data.js: '+(j.ok===0?'từ chối bản lưu có món độc quyền ('+j.why+')':'kết quả '+JSON.stringify(j).slice(0,80))+'. Cần thêm file này vào danh sách src của guard.js.')}
 try{fs.unlinkSync(g)}catch(e){}}
at(null);
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
