"use strict";
/* Kiểm thử hệ thống điện năng (chạy: node tools/pwtest.js). Dùng đúng mã game: data.js, wx-data.js, pw-data.js, game.js, wx.js, pw.js.
   Đồng hồ giả: Date.now() đọc biến NOW nên tua thời gian được. Mỗi phần in ĐẠT hoặc HỎNG; thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
const STORE={};globalThis.localStorage={getItem:k=>STORE[k]==null?null:STORE[k],setItem:(k,v)=>{STORE[k]=String(v)},removeItem:k=>{delete STORE[k]}};
let NOW=Date.UTC(2026,10,12,5,0);Date.now=()=>NOW;
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/game.js','js/wx.js','js/pw.js','js/meal.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},set S(v){S=v},fresh,newCat,tick,load,save,wxAt,roomClimate,wxDevices,putBed,bedItem,roomHappy,buyItem,clampItem,sellItem,
   pwTick,pwStartCharge,pwStopCharge,pwQuote,pwStrike,pwRestore,pwGenCharge,pwOut,genOn,powerOn,pwDark,pwCur,pwPct,pwDead,pwSolarCap,pwSol,pwSolarRate,pwRunning,pwCalm,pwOutletWhy,pwRoomOk,pwMigrate,
   PW_OUT_Y,PWC,PWAWAY,FURN,SP,WXO,setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000,H=3600000;let NT=[];T.setNotify((m)=>NT.push(m));
const step=(sec,sim)=>{let left=sec;while(left>0){const d=Math.min(sim?600:60,left);NOW+=d*1000;T.tick(d,!!sim);left-=d}};   // tua bằng đúng tick của game
const pwStep=(sec,sim)=>{let left=sec;while(left>0){const d=Math.min(60,left);NOW+=d*1000;T.pwTick(d,!!sim);left-=d}};
function reset(){
  T.fresh();const S=T.S;S.tut={done:1,hints:{},wx:1,pw:1,got:{}};S.coins=100000;S.level=18;S.wxU=1;S.pwMig=1;
  ['bedroom','balcony','bathroom','basement','rooftop'].forEach(r=>S.rooms[r]={bowlAt:0});S.wxMig=1;S.pw={sol:0,saved:0,torch:{}};
  Object.keys(T.WXO).forEach(k=>delete T.WXO[k]);return S;
}
const put=(fid,room,o)=>{const S=T.S,f=T.FURN[fid],it=Object.assign({iid:S.nid++,fid,room,x:200,y:f.kind==='wall'?T.PW_OUT_Y:150,flip:false,broken:false},o||{});if(f.pw&&it.currentBattery==null)it.currentBattery=f.pw.batteryCapacity;S.items.push(it);return it};
const cat=room=>{const c=T.newCat(T.SP.muop,1);c.room=room;c.en=60;c.hp=80;c.full=90;T.S.cats.push(c);return c};
const setHour=h=>{T.WXO.hr=h};const setWx=t=>{T.WXO.ty=t};

// 1. bản lưu cũ: i.bat (phút chạy trên 720), i.chg (đang tự sạc) chuyển sang % pin; đồ vốn cắm điện có pin đầy
{
  reset();const S=T.S;delete S.pwMig;
  const a=put('bheater','living',{bat:360}),b=put('bfan','living',{bat:0,chg:1}),c=put('heatmini','living'),d=put('sofa','living');delete a.currentBattery;delete b.currentBattery;delete c.currentBattery;
  T.pwMigrate();
  ok('Migration: pin cũ 360/720 phút thành 50%',a.currentBattery===250&&a.bat==null&&a.chg==null,a.currentBattery+' Wh');
  ok('Migration: máy đang tự sạc với 0 phút thành 0%, bỏ cờ tự sạc',b.currentBattery===0&&b.chg==null&&b.chargingState==='idle');
  ok('Migration: máy vốn cắm điện nay có pin tích hợp, đầy',c.currentBattery===T.FURN.heatmini.pw.batteryCapacity);
  ok('Migration: đồ không dùng điện không có pin',d.currentBattery==null&&!T.FURN.sofa.pw&&!T.FURN.furblanket.pw&&!T.FURN.thermcurtain.pw&&!T.FURN.balconyroof.pw);
  ok('Migration chạy đúng một lần',S.pwMig===1);
  ok('Mọi thiết bị có đủ thuộc tính điện',Object.values(T.FURN).filter(f=>f.pw).every(f=>['batteryCapacity','powerConsumption','chargingCost','chargingDuration'].every(k=>f.pw[k]>0)&&f.pw.requiresElectricity===true));
  ok('Phí sạc đầy đúng bảng',[['fanmini',10],['fanstand',20],['heatlamp',25],['airpurifier',30],['dehumid',35],['heatmini',45],['waterheater',50],['ac1',70],['ac2',90],['heatpro',120]].every(([id,v])=>T.FURN[id].pw.chargingCost===v));
}
// 2. tiêu thụ, hết pin, không tự sạc, cảnh báo dưới 20%
{
  reset();const h=put('heatmini','living');NT=[];
  pwStep(5.5*3600);ok('Đang chạy thì tụt pin (100 W)',Math.abs(h.currentBattery-150)<1,Math.round(h.currentBattery)+' Wh');
  pwStep(2*3600);ok('Dưới 20% thì báo đúng một lần',NT.filter(m=>/sắp hết pin/.test(m)).length===1);ok('Hết pin thì ngừng chạy và mất hiệu ứng',T.pwDead(h)&&!T.wxDevices('living').on.some(d=>d.i===h)&&T.roomClimate('living').heat===0);
  pwStep(8*3600,true);ok('Không tự sạc khi vắng mặt',h.currentBattery===0);
  const a=put('ac1','living');T.WXO.ty='sunny';T.WXO.se=3;setHour(3);   // mùa đông, đêm: phòng không nóng, điều hòa tự động không chạy
  pwStep(3600);ok('Máy tự động chỉ tốn pin khi đang làm mát hoặc sưởi',a.currentBattery===T.FURN.ac1.pw.batteryCapacity);
  const off=put('fanmini','living',{off:1});pwStep(3600);ok('Máy đang tắt không tốn pin',off.currentBattery===240);
  const bl=put('eblanket','living');pwStep(3600);ok('Chăn điện chỉ tốn pin khi có bé nằm',bl.currentBattery===300);
}
// 3. ổ nhiều cổng
{
  reset();const S=T.S,o2=put('out2','living',{x:100}),o4=put('out4','living',{x:300});
  const L=[0,1,2,3,4,5].map(k=>put('fanmini','living',{x:60+k*60,currentBattery:100}));
  const r1=T.pwStartCharge(L[0].iid,o2.iid),r2=T.pwStartCharge(L[1].iid,o2.iid),r3=T.pwStartCharge(L[2].iid,o2.iid);
  ok('Ổ đôi sạc được 2 thiết bị cùng lúc',r1.ok&&r2.ok);
  ok('Ổ đôi hết cổng thì từ chối thiết bị thứ ba',!!r3.err&&/hết cổng/.test(r3.err),r3.err);
  const r4=[2,3,4,5].map(k=>T.pwStartCharge(L[k].iid,o4.iid));ok('Ổ 4 cổng nhận đủ 4 thiết bị',r4.every(r=>r.ok));
  const x=put('fanmini','living',{currentBattery:10});ok('Không còn ổ trống thì không sạc được',!!T.pwStartCharge(x.iid,o4.iid).err);
  const other=put('fanmini','bedroom',{currentBattery:10});ok('Không cắm được ổ ở phòng khác',/khác phòng/.test(T.pwStartCharge(other.iid,o4.iid).err||''));
}
// 4. sạc một phần: phí theo lượng nạp, trừ xu đúng một lần, không quá dung lượng
{
  reset();const S=T.S,o=put('out1','living',{x:100}),h=put('heatmini','living',{x:200,currentBattery:350,off:1});
  const q=T.pwQuote(h),c0=S.coins;ok('Pin 50%: phí bằng nửa phí sạc đầy, làm tròn lên',q.cost===23&&q.fee===23,q.cost+' xu');
  const r=T.pwStartCharge(h.iid,o.iid);ok('Xác nhận thì trừ xu đúng một lần',r.ok&&S.coins===c0-23);
  ok('Đang sạc thì không bấm sạc lần nữa',!!T.pwStartCharge(h.iid,o.iid).err);
  step(29*60);ok('Sạc dần theo thời gian (60 phút cho đầy, nửa pin mất 30 phút)',h.currentBattery<700&&h.currentBattery>600&&h.chargingState==='charging',Math.round(h.currentBattery)+' Wh');
  step(3*60);ok('Đầy thì tự rút, không vượt dung lượng',h.currentBattery===700&&!h.charge&&h.chargingState==='idle');
  ok('Không trừ thêm xu trong lúc sạc',S.coins===c0-23);
  ok('Pin đầy thì không sạc nữa',!!T.pwStartCharge(h.iid,o.iid).err);
  const p=put('outpro','living',{x:380}),f=put('fanmini','living',{x:340,currentBattery:0,off:1});T.pwStartCharge(f.iid,p.iid);step(15*60+30);ok('Ổ cao cấp sạc nhanh gấp 2 (quạt mini đầy sau 15 phút)',f.currentBattery===240);
  const w=put('waterheater','bathroom',{currentBattery:0}),ob=put('out2','bathroom',{x:80}),ow=put('outwet','bathroom',{x:300});
  ok('Chỗ ẩm: ổ thường không dùng được',/chống nước/.test(T.pwStartCharge(w.iid,ob.iid).err||''));ok('Chỗ ẩm: ổ chống nước dùng được',!!T.pwStartCharge(w.iid,ow.iid).ok);
}
// 5. rút sạc giữa chừng: hoàn phần chưa nạp, làm tròn xuống; cắm rút liên tục không sinh xu
{
  reset();const S=T.S,o=put('out1','living',{x:100}),h=put('ac2','living',{x:200,currentBattery:0,off:1});
  let c0=S.coins;for(let k=0;k<50;k++){const r=T.pwStartCharge(h.iid,o.iid);if(!r.ok)break;step(60);T.pwStopCharge(T.S.items.find(i=>i.iid===h.iid),'',true)}
  ok('Cắm rút 50 lần không sinh ra xu',S.coins<=c0,'chênh '+(S.coins-c0)+' xu, pin '+Math.round(T.pwPct(h)*100)+'%');
  const it=put('fanmini','living',{x:300,currentBattery:0}),o2=put('out1','living',{x:420});T.pwStartCharge(it.iid,o2.iid);c0=S.coins;it.room=null;step(2);
  ok('Cất thiết bị đang sạc: tự rút và hoàn phần chưa nạp',!it.charge&&S.coins>=c0&&S.coins<=c0+10);
}
// 6. mất điện: không sạc bằng điện lưới, đồ đang cắm tạm dừng, đồ pin vẫn chạy
{
  reset();const S=T.S,o=put('out2','living',{x:100}),h=put('heatmini','living',{x:200,currentBattery:100,off:1}),f=put('fanmini','living',{x:300,currentBattery:240});
  T.pwStartCharge(h.iid,o.iid);T.pwStrike(NOW,true);const b=h.currentBattery;step(5*60);
  ok('Mất điện: thiết bị đang cắm tạm dừng, giữ phần đã trả tiền',h.chargingState==='paused'&&h.charge&&Math.abs(h.currentBattery-b)<.01);
  const g=put('fanmini','living',{x:400,currentBattery:50});const r=T.pwStartCharge(g.iid,o.iid);ok('Mất điện không có máy phát: không sạc được',/mất nguồn/.test(r.err||''),r.err);
  ok('Đồ chạy pin vẫn chạy khi mất điện',f.currentBattery<240&&!T.pwDead(f));
  step(11*60);ok('Có điện lại sau 15 phút, sạc chạy tiếp',!T.pwOut()&&h.chargingState==='charging'&&h.currentBattery>b);
  ok('Đèn điện lưới tắt khi mất điện và mất hiệu ứng',(()=>{put('lamppink','living',{x:440});const h0=T.roomHappy('living');T.pwStrike(NOW,true);const h1=T.roomHappy('living');T.pwRestore(true);return h1===h0-2})());
}
// 7. điện mặt trời: giảm 50% làm tròn lên khi bộ lưu trữ đủ, hết năng lượng thì giá thường, ban đêm không tạo điện
{
  reset();const S=T.S;put('solar1','balcony',{x:100});const o=put('out1','living',{x:100}),h=put('heatmini','living',{x:200,currentBattery:0,off:1});
  ok('Có tấm pin thì có bộ lưu trữ 80 đơn vị',T.pwSolarCap()===80);
  ok('Bộ lưu trữ trống: không giảm',T.pwQuote(h).cost===45);
  setHour(12);T.WXO.ty='sunny';pwStep(3600);ok('Nắng giữa trưa: tạo khoảng 20 đơn vị mỗi giờ',Math.abs(S.pw.sol-20)<1.5,S.pw.sol.toFixed(1));pwStep(1800);
  const q=T.pwQuote(h),c0=S.coins;ok('Đủ điện mặt trời: 45 xu còn 23 xu',q.solar&&q.cost===23&&q.disc===22);
  T.pwStartCharge(h.iid,o.iid);const sb=q.solar?0:0;ok('Trừ đúng 23 xu và 22 đơn vị, cộng 22 xu tiết kiệm',S.coins===c0-23&&Math.abs(S.pw.sol-(29.7-22))<1&&S.pw.saved===22,'còn '+S.pw.sol.toFixed(1));
  const h2=put('heatmini','living',{x:300,currentBattery:0,off:1});ok('Điện mặt trời không đủ: trả giá thường',!T.pwQuote(h2).solar&&T.pwQuote(h2).cost===45);
  setHour(23);const s0=S.pw.sol;pwStep(3600);ok('Ban đêm không tạo điện',S.pw.sol===s0);
  setHour(12);T.WXO.ty='drizzle';const s1=S.pw.sol;pwStep(3600);ok('Mưa giảm mạnh công suất',S.pw.sol-s1<8&&S.pw.sol-s1>0,(S.pw.sol-s1).toFixed(1)+' đơn vị/giờ');
  put('solar1','balcony',{x:200});put('solar1','balcony',{x:300});T.WXO.ty='sunny';ok('Ban công chỉ tính tối đa 2 tấm',T.pwSolarRate()<=40.5);
  S.pw.sol=80;const h3=put('ac2','living',{x:400,currentBattery:0,off:1});ok('Nhiều tấm không giảm quá 50%',T.pwQuote(h3).cost===45);
  put('solarbat','living',{x:100});ok('Bộ lưu trữ nâng cấp +150',T.pwSolarCap()===230);
  ok('Tấm pin không lắp được trong nhà, tầng hầm',!T.pwRoomOk('solar1','living')&&!T.pwRoomOk('solar1','basement')&&T.pwRoomOk('solar1','rooftop'));
}
// 8. máy phát: chỉ tầng hầm, sạc bằng xu, tự chuyển nguồn, dùng xong về 0%, không tự sạc
{
  reset();const S=T.S,g=put('gen2','basement',{x:100}),o=put('out1','living',{x:100}),h=put('heatmini','living',{x:200,currentBattery:0,off:1});
  ok('Máy phát mới chưa có năng lượng',!(g.ge>0));
  const c0=S.coins;ok('Sạc máy phát trừ đúng 150 xu',T.pwGenCharge(g.iid).ok&&S.coins===c0-150&&g.ge===1);
  T.pwStrike(NOW,true);ok('Mất điện: máy đã sạc tự chuyển sang nguồn dự phòng',T.genOn()&&T.powerOn()&&!T.pwDark('living'));
  ok('Có máy phát chạy thì sạc được',!!T.pwStartCharge(h.iid,o.iid).ok);
  ok('Đang mất điện thì không sạc máy phát',!!T.pwGenCharge(g.iid).err);
  const c1=S.coins;step(16*60);ok('Có điện lại: máy đã dùng về 0%, cần sạc, không tự trừ xu',!T.pwOut()&&g.ge===0&&!g.gu&&S.coins===c1);
  step(8*3600,true);ok('Máy phát không tự sạc kể cả khi vắng',g.ge===0);
  const m=put('gen1','basement',{x:300});T.pwGenCharge(m.iid);T.pwStrike(NOW,true);step(6*60);ok('Máy mini chạy 5 phút rồi hết, phòng tối lại',m.ge===0&&!T.genOn()&&T.pwDark('living'));
  T.pwRestore(true);ok('Máy phát chỉ chạy ở tầng hầm',(()=>{const x=put('gen3','living',{x:100,ge:1});T.pwStrike(NOW,true);const r=!T.genOn()&&/Tầng hầm/.test(T.pwGenCharge(x.iid).err||'');T.pwRestore(true);return r})());
}
// 8b. nhiều máy phát: máy chưa dùng tới không bị chạy phần cuối lần mất điện (đang chơi và lúc vắng)
for(const sim of [false,true]){
  reset();const gs=['gen1','gen2','gen3'].map((id,k)=>put(id,'basement',{x:80+k*120,ge:1}));T.pwStrike(NOW,sim);step(16*60,sim);
  ok('Có điện lại: máy đã dùng về 0%, máy chưa dùng giữ đầy'+(sim?' (lúc vắng)':''),gs[0].ge===0&&gs[1].ge===0&&gs[2].ge===1&&!gs[2].gu,gs.map(g=>Math.round(g.ge*100)+'%').join(' '));
}
// 8c. sét định giờ nhưng đã qua hẳn trước khoảng được bù: bỏ, mèo không bị dọa
{
  reset();const c=cat('living');T.S.pw.sch={t:NOW-40*MIN,ep:1};T.pwTick(1,true);ok('Sét quá hạn sau khi vắng lâu: bỏ qua',!T.S.pw.out&&!T.S.pw.sch&&!(c.fr>0));
}
// 9. sét đánh: chỉ khi mưa giông, mỗi đợt xét một lần, khoảng 5%, không khi đang mất điện
{
  reset();const S=T.S;let hits=0,eps=0;const t00=NOW;
  for(let k=0;k<4000;k++){S.pw={sol:0,saved:0,torch:{}};T.WXO.ty='storm';const o=T.wxAt(NOW);S.pw.ep=null;T.pwTick(1,false);eps++;if(S.pw.sch)hits++;}
  ok('Khoảng 5% mỗi đợt giông',hits/eps>.035&&hits/eps<.065,(hits/eps*100).toFixed(1)+'% trên '+eps+' đợt');
  S.pw={sol:0,saved:0,torch:{}};T.WXO.ty='sunny';for(let k=0;k<500;k++){S.pw.ep=null;T.pwTick(1,false)}ok('Trời không giông thì không bao giờ có sét',!S.pw.sch&&!S.pw.out);
  T.WXO.ty='storm';S.pw={sol:0,saved:0,torch:{}};const Mr=Math.random;Math.random=()=>.9;T.pwTick(1,false);const ep=S.pw.ep;Math.random=()=>0;for(let k=0;k<200;k++)T.pwTick(1,false);Math.random=Mr;
  ok('Mỗi đợt giông chỉ xét một lần',S.pw.ep===ep&&!S.pw.sch&&!S.pw.out);
  S.tut.pw=0;S.pw.ep=null;Math.random=()=>0;T.pwTick(1,false);Math.random=Mr;ok('Chưa học xong hướng dẫn điện thì không có sét',!S.pw.sch&&!S.pw.out);
  S.tut.pw=1;T.pwStrike(NOW,true);const e0=S.pw.out.e;ok('Đang mất điện thì không đánh thêm',T.pwStrike(NOW+MIN,true)===false&&S.pw.out.e===e0);
  NOW=t00;
}
// 10. lưu, thoát game, đăng nhập lại: 15 phút vẫn trôi, không đánh lại cùng một lần sét
{
  reset();const S=T.S,c=cat('living');T.WXO.ty='storm';S.pw.ep=T.wxAt(NOW).s;T.pwStrike(NOW,false);T.save();const id=S.pw.out.s;
  NOW+=6*MIN;T.load();ok('Tải lại sau 6 phút: vẫn mất điện, còn 9 phút',!!T.pwOut()&&Math.round((T.S.pw.out.e-NOW)/MIN)===9&&T.S.pw.out.s===id);
  T.save();NOW+=20*MIN;T.load();ok('Tải lại sau 20 phút nữa: đã có điện lại',!T.pwOut()&&!!T.S.pw.last&&T.S.pw.last.s===id);
  const Mr=Math.random;Math.random=()=>0;T.tick(1,false);Math.random=Mr;ok('Tải lại không kích hoạt lại cùng đợt giông',!T.S.pw.out&&!T.S.pw.sch);
  // vắng mặt: sét đã định giờ rơi vào lúc vắng
  reset();cat('living');T.WXO.ty='storm';T.S.pw.sch={t:NOW+5*MIN,ep:1};T.save();NOW+=12*MIN;T.load();ok('Sét định giờ rơi vào lúc vắng: vẫn mất điện đúng giờ',!!T.pwOut()&&Math.round((T.S.pw.out.e-NOW)/MIN)===8&&T.PWAWAY.strike===1);
}
// 11. mèo hoảng sợ
{
  reset();const S=T.S,a=cat('living'),b=cat('living');const bed=put('bed','living',{x:300});b.en=40;T.putBed(b.uid,bed.iid);a.hp=80;
  T.pwStrike(NOW,false);ok('Sét đánh: mất 5 vui, hoảng sợ, bé đang ngủ bị đánh thức',a.hp===75&&a.fr===100&&b.bed==null);
  const h0=a.hp;step(5*60);ok('Hoảng sợ trong phòng tối: mất khoảng 1,5 vui mỗi phút',h0-a.hp>6&&h0-a.hp<9,(h0-a.hp).toFixed(1)+' vui / 5 phút');
  const f0=a.fr;ok('Vỗ về giảm ngay nỗi sợ',T.pwCalm(a)&&a.fr===f0-30&&!T.pwCalm(a));
  step(11*60);step(20*60);ok('Có điện lại thì hết sợ dần',!(a.fr>0),'nỗi sợ còn '+(a.fr||0));
  reset();const c=cat('living');c.hp=3;T.pwStrike(NOW,false);step(15*60);ok('Không bao giờ âm vui, mèo không mất',c.hp>=0&&T.S.cats.includes(c));
  reset();const d=cat('living');put('elamp','living',{x:100});T.pwStrike(NOW,false);ok('Đèn khẩn cấp làm phòng không tối',!T.pwDark('living'));const h1=d.hp;step(5*60);ok('Có đèn: mất vui chậm hơn',h1-d.hp<4,(h1-d.hp).toFixed(1));
}
// 12. chỗ đặt: ổ bám tường, không chồng lên đồ; tấm pin không chồng lên đồ; đồ mua ở phòng sai thì vào kho
{
  reset();const S=T.S;put('tower5','living',{x:200,y:150});
  const o=T.buyItem('out2','living',200);ok('Ổ điện bám sát chân tường',o.y===T.PW_OUT_Y);
  const r=[o.x-6,o.y-9,o.x+6,o.y],t=T.FURN.tower5,tr=[200-t.w/2,150-t.h,200+t.w/2,150];ok('Ổ không chồng lên đồ nội thất',!(r[0]<tr[2]&&r[2]>tr[0]&&r[1]<tr[3]&&r[3]>tr[1]),'x='+o.x);
  o.x=200;o.y=40;T.clampItem(o);ok('Kéo lên cao vẫn bám chân tường, tránh đồ',o.y===T.PW_OUT_Y&&Math.abs(o.x-200)>=t.w/2);
  const p1=T.buyItem('solar1','balcony',200),p2=T.buyItem('solar1','balcony',200);const R1=[p1.x-14,p1.y-20,p1.x+14,p1.y],R2=[p2.x-14,p2.y-20,p2.x+14,p2.y];
  ok('Hai tấm pin không chồng lên nhau',!(R1[0]<R2[2]&&R1[2]>R2[0]&&R1[1]<R2[3]&&R1[3]>R2[1]));
  const p3=T.buyItem('solar1','living',200);ok('Mua tấm pin khi đang ở phòng khách: cất vào kho',p3&&p3.room===null);
  delete S.rooms.basement;ok('Chưa có tầng hầm thì không mua được máy phát',T.buyItem('gen1','living',200)===null);
}
// 13. máy cho ăn tự động hết pin thì không tự đổ
{
  reset();const S=T.S;cat('living');const f=put('feeder','living',{x:300,currentBattery:0,at:0});const c0=S.coins;T.tick(1,false);
  ok('Máy cho ăn hết pin: không tự đổ hạt',!(f.left>0)&&S.coins===c0);
  f.currentBattery=480;f.at=0;T.tick(1,false);ok('Có pin thì tự đổ như cũ',f.left>0);
}
console.log(fail?fail+' phần HỎNG':'Tất cả ĐẠT');process.exit(fail?1:0);
