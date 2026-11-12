"use strict";
/* Kiểm thử mở khóa thời tiết theo cấp (chạy: node tools/lvtest.js). Dùng đúng mã game: data.js, wx-data.js, game.js, wx.js.
   Cấp 1: không thời tiết, không mua được thiết bị và vật phẩm sinh tồn. Cấp WX_LV (2): mở, cờ S.wxU lưu vào bản lưu.
   Bản lưu cũ đã qua cấp 2: tự mở, giữ nguyên tiến độ, có cờ S.wxOld để mời xem hướng dẫn. Cấp mở của phòng, món ăn, nội thất cũ không đổi. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let store={};globalThis.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}};
(0,eval)(['js/data.js','js/wx-data.js','js/game.js','js/wx.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,load,save,KEY,WX_LV,FEATS,WXDEV,SUPPLY,FURN,ROOMS,FOODS,FURNS,SP,newCat,wxOpen,addXp,xpNeed,buyItem,buySupply,tick,tripInfo,unlocksAt,locked,wxHappy,happyTarget,setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info?'  ('+info+')':''));if(!cond)fail++};
const notes=[];T.setNotify(m=>notes.push(String(m)));
const start=()=>{store={};T.fresh();const S=T.S;S.tut={done:1,hints:{}};const c=T.newCat(T.SP.muop,1);c.room='living';S.cats.push(c);S.coins=1e6;return S};

{ const S=start();
  ok('Cấp 1: thời tiết chưa mở',S.level===1&&!T.wxOpen()&&!S.wxU);
  ok('Mọi thiết bị thời tiết cần ít nhất cấp '+T.WX_LV,T.WXDEV.every(f=>f.ul>=T.WX_LV),'thấp nhất '+Math.min(...T.WXDEV.map(f=>f.ul)));
  ok('Cấp 1: không mua được máy sưởi, quạt',T.buyItem('bheater','living',100)===null&&T.buyItem('bfan','living',100)===null&&T.locked(T.FURN.bheater));
  ok('Cấp 1: không mua được vật phẩm sinh tồn',!!T.buySupply(T.SUPPLY[0].id,1).err);
  const c=S.cats[0],b={he:c.he,wxs:JSON.stringify(c.wxs||null)};for(let i=0;i<600;i++)T.tick(60);
  ok('Cấp 1: 10 giờ trôi qua, thời tiết không tạo trạng thái lạnh, nóng, ướt, ốm',JSON.stringify(c.wxs||null)===b.wxs&&(c.he==null||c.he===b.he),'he '+c.he);
  const h1=T.happyTarget(c);S.wxU=1;const h2=T.happyTarget(c),d=T.wxHappy(c);delete S.wxU;
  ok('Cấp 1: độ vui không bị thời tiết cộng trừ',d===0||h1!==h2,'cấp 1: '+h1+', nếu đã mở: '+h2+' (thời tiết '+d+')');
  const inf=T.tripInfo(c,'alley');ok('Cấp 1: viễn chinh không có rủi ro thời tiết',inf&&!inf.wx,'wx='+JSON.stringify(inf&&inf.wx||null));
  ok('Thông báo lên cấp 2 có kể tính năng thời tiết',T.unlocksAt(2).includes(T.FEATS[0].n));
  notes.length=0;T.addXp(T.xpNeed()-S.xp);
  ok('Lên cấp 2: thời tiết mở và cờ được ghi',S.level===2&&T.wxOpen()&&S.wxU===1&&!S.wxOld);
  ok('Cấp 2: mua được máy sưởi tích điện',!!T.buyItem('bheater','living',100));
  ok('Cấp 2: mua được vật phẩm sinh tồn',!T.buySupply(T.SUPPLY[0].id,1).err);
  ok('Cấp 2: món mở ở cấp cao hơn vẫn khóa',T.WXDEV.filter(f=>f.ul>2).every(f=>T.buyItem(f.id,'living',100)===null));
  T.save();T.load();ok('Lưu rồi tải lại: vẫn mở, không coi là người chơi cũ',T.wxOpen()&&T.S.wxU===1&&!T.S.wxOld); }
{ const S=start();S.level=7;S.xp=33;S.coins=4321;delete S.wxU;T.save();const raw=JSON.parse(store[T.KEY]);T.load();const N=T.S;
  ok('Bản lưu cũ cấp 7: thời tiết tự mở, có cờ mời xem hướng dẫn',T.wxOpen()&&N.wxU===1&&N.wxOld===1);
  ok('Bản lưu cũ: cấp, kinh nghiệm, xu, mèo giữ nguyên',N.level===7&&N.xp===33&&N.coins===raw.coins&&N.cats.length===raw.cats.length); }
{ const S=start();S.level=1;S.wxU=1;T.save();T.load();ok('Đã mở thì không bao giờ khóa lại (kể cả khi cấp hiển thị thấp)',T.wxOpen()); }
{ // cấp mở của nội dung cũ không đổi (lấy vài mốc đã ghi trong CLAUDE.md mục 15)
  const r=Object.fromEntries(T.ROOMS.map(x=>[x.id,x.ul])),f=Object.fromEntries(T.FOODS.map(x=>[x.id,x.ul]));
  ok('Cấp mở của phòng cũ không đổi',r.bedroom===2&&r.kitchen===3&&r.balcony===4&&r.royal===18,JSON.stringify([r.bedroom,r.kitchen,r.balcony,r.royal]));
  ok('Cấp mở của món ăn cũ không đổi',f.kibble===1&&f.pate===1&&f.premium===8,JSON.stringify([f.kibble,f.pate,f.premium]));
  ok('Cấp mở của bát ăn và nội thất cũ không đổi',T.FURN.bowl.ul===1&&T.FURN.bowlsteel.ul===3&&T.FURN.feeder.ul===7&&T.FURN.bowlgold.ul===10); }
console.log(fail?'\nCÓ '+fail+' PHẦN HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
