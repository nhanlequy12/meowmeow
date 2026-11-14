"use strict";
/* Kiểm thử nâng cấp phòng (chạy: node tools/rouptest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, garden-data.js, compat-data.js, game.js, wx.js, pw.js, med.js, meal.js,
   stray.js, garden.js, roomup.js, compat.js, cùng trọng tài tools/guard.js. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
globalThis.performance=globalThis.performance||{now:()=>Date.now()};
const FILES=['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/compat-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/roomup.js','js/compat.js'];
(0,eval)(FILES.filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,ROOM,ROOMS,FEATS,RUP,RUP_BASE,rupLv,rupBuy,rupWhy,rupPrice,rupTotal,rupSpent,rupSet,rupDiff,rupKinds,
    happyTarget,roomHappy,roomRegen,roomHunger,coinCalc,DEST,freeRoom,fillWait,moveCat,catsIn,totalCap,CP,unlocksAt,SP,
    setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
const reset=lv=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=5e6;S.level=lv||10;
  ['bedroom','kitchen','balcony','dining','library','basement','rooftop'].forEach((r,i)=>S.rooms[r]={bowlAt:0,at:i+1});return S};
const cat=(room,traits)=>{const c=T.newCat(T.SP.muop,1);c.traits=traits||[];c.room=room;c.hp=60;c.full=80;c.en=80;T.S.cats.push(c);return c};
const n=v=>Math.round(v*1000)/1000;

// 1. giá trị gốc không đổi khi chưa nâng
{reset();
  ok('Chưa nâng: sức chứa và bonus giữ nguyên',T.ROOM.bedroom.cap===8&&T.ROOM.bedroom.regen===1.25&&T.ROOM.kitchen.hunger===.8&&T.ROOM.library.coin===.06&&T.ROOM.royal.cap===12);
  ok('Phòng không có bonus thì trường vẫn trống (không thành 0)',T.ROOM.living.happy===undefined&&T.ROOM.bedroom.happy===undefined&&T.ROOM.living.regen===undefined);
  ok('Phòng chờ không bị đụng tới',T.ROOM.wait.cap===Infinity);
  ok('Có dòng mở khóa ở cấp 10',T.FEATS.some(f=>f.id==='roomup'&&f.lv===10)&&T.unlocksAt(10).includes('Nâng cấp phòng'));
  ok('Loại bonus được nâng đúng theo phòng',T.rupKinds('living').join()==='happy'&&T.rupKinds('bedroom').join()==='regen'&&T.rupKinds('attic').join()==='happy,regen'&&T.rupKinds('greenhouse').join()==='happy,hunger'&&T.rupKinds('rooftop').join()==='happy,ticket',T.rupKinds('attic').join());}
// 2. khóa theo cấp, phòng chưa có, đủ xu
{const S=reset(9);ok('Dưới cấp 10: chưa nâng được',/cấp 10/.test(T.rupWhy('living'))&&T.rupBuy('living').err);
  S.level=10;ok('Phòng chưa mua: không nâng được',/chưa có/.test(T.rupWhy('royal')));
  S.coins=10;ok('Thiếu xu: không nâng được',/Chưa đủ xu/.test(T.rupWhy('bedroom')));
  S.coins=5e6;ok('Đủ điều kiện: nâng được',T.rupWhy('bedroom')==='');}
// 3. mua: trừ xu đúng giá, lên cấp, sức chứa và bonus tăng
{const S=reset(),c0=S.coins,p=T.rupPrice('bedroom',1),r=T.rupBuy('bedroom');
  ok('Nâng Phòng ngủ cấp 1: trừ đúng giá',!r.err&&S.coins===c0-p&&r.cost===p&&T.rupLv('bedroom')===1,p);
  ok('Cấp 1: sức chứa +1, hồi năng lượng +5%',T.ROOM.bedroom.cap===9&&n(T.ROOM.bedroom.regen)===1.3);
  T.rupBuy('bedroom');T.rupBuy('bedroom');
  ok('Cấp 3: sức chứa 11, hồi năng lượng +40%',T.rupLv('bedroom')===3&&T.ROOM.bedroom.cap===11&&n(T.ROOM.bedroom.regen)===1.4);
  ok('Quá cấp tối đa: báo lỗi, không trừ xu',(()=>{const k=S.coins,x=T.rupBuy('bedroom');return x.err&&S.coins===k})());
  ok('Giá tăng gấp đôi mỗi cấp',T.rupPrice('bedroom',2)===2*T.rupPrice('bedroom',1)&&T.rupPrice('bedroom',3)===2*T.rupPrice('bedroom',2),[1,2,3].map(k=>T.rupPrice('bedroom',k)).join(' / '));
  ok('Đã chi ghi đúng (rupSpent)',T.rupSpent('bedroom')===[1,2,3].reduce((a,k)=>a+T.rupPrice('bedroom',k),0));}
// 4. ảnh hưởng thật lên luật chơi
{const S=reset(),a=cat('living'),b=cat('balcony');
  const h0=T.happyTarget(a),hb=T.happyTarget(b);T.rupBuy('living');T.rupBuy('living');T.rupBuy('balcony');
  ok('Phòng khách cấp 2: độ vui đích +4',T.happyTarget(a)-h0===4,h0+' → '+T.happyTarget(a));
  ok('Ban công cấp 1: độ vui đích +2',T.happyTarget(b)-hb===2);
  const k0=T.roomHunger('kitchen');T.rupBuy('kitchen');ok('Bếp cấp 1: đói chậm hơn thêm 4%',n(k0-T.roomHunger('kitchen'))===.04,k0+' → '+T.roomHunger('kitchen'));
  const r0=T.roomRegen('bedroom');T.rupBuy('bedroom');ok('Phòng ngủ cấp 1: hồi năng lượng nhanh hơn',T.roomRegen('bedroom')>r0);
  const L=cat('library'),d=T.DEST.park,ctx={night:false,monday:false,hf:1},x0=T.coinCalc(L,d,ctx).coins;T.rupBuy('library');const x1=T.coinCalc(L,d,ctx).coins;
  ok('Thư viện cấp 1: xu viễn chinh từ +6% lên +8%',Math.abs(x1/x0-1.08/1.06)<1e-9,(x1/x0).toFixed(4));
  const B=cat('basement'),y0=T.coinCalc(B,d,{night:true,hf:1}).coins;T.rupBuy('basement');ok('Tầng hầm cấp 1: xu ban đêm +3%',Math.abs(T.coinCalc(B,d,{night:true,hf:1}).coins/y0-1.13/1.10)<1e-9);
  T.rupBuy('dining');ok('Phòng ăn cấp 1: xu cảm ơn 3',T.ROOM.dining.thank===3);
  T.rupBuy('rooftop');ok('Sân thượng cấp 1: vé +4%, vui +8',n(T.ROOM.rooftop.ticket)===.04&&T.ROOM.rooftop.happy===8);}
// 5. sức chứa thật: freeRoom, moveCat, Phòng chờ tự vào phòng vừa nâng
{const S=reset();S.rooms={living:{bowlAt:0}};for(let i=0;i<8;i++)cat('living');const w=cat('wait');
  ok('Phòng khách đầy 8/8: mèo mới vào Phòng chờ',T.freeRoom()==='wait'&&!T.moveCat(w.uid,'living'));
  const r=T.rupBuy('living');ok('Nâng Phòng khách: bé ở Phòng chờ tự vào',r.moved===1&&w.room==='living'&&T.catsIn('living').length===9,'moved '+r.moved);
  T.rupBuy('living');ok('Còn chỗ thì mèo mới vào phòng',T.freeRoom()==='living'&&T.totalCap()===10);
  const c2=cat('wait');ok('moveCat theo sức chứa mới',T.moveCat(c2.uid,'living')&&T.catsIn('living').length===10);
  ok('Gợi ý tương thích thấy sức chứa mới (đầy)',T.CP.rooms(cat('wait')).find(r=>r.id==='living').full===true);}
// 6. lưu, tải lại, bản lưu cũ, phòng chưa mua
{const S=reset();cat('living');T.rupBuy('kitchen');T.rupBuy('kitchen');T.save();T.load();
  ok('Lưu và tải lại: giữ cấp phòng',T.rupLv('kitchen')===2&&T.ROOM.kitchen.cap===8);
  const o=JSON.parse(STORE);delete o.rup;STORE=JSON.stringify(o);T.load();
  ok('Bản lưu cũ không có S.rup: mọi phòng cấp 0, không lỗi',T.rupLv('kitchen')===0&&T.ROOM.kitchen.cap===6&&T.ROOM.kitchen.hunger===.8);
  T.S.rup={royal:3,kitchen:9,bedroom:-2};ok('S.rup sai (phòng chưa mua, quá tối đa, âm): bị chặn khi đọc',T.rupLv('royal')===0&&T.ROOM.royal.cap===12&&T.rupLv('kitchen')===3&&T.rupLv('bedroom')===0);}
// 7. Admin
{const S=reset(5);const c0=S.coins,r=T.rupBuy('living',1);ok('Admin nâng miễn phí, kể cả khi chưa mở khóa',!r.err&&S.coins===c0&&T.rupLv('living')===1);
  T.rupSet('living',0);ok('Admin đặt về cấp 0',T.rupLv('living')===0&&!('living' in S.rup));}
// 8. giá: tổng nâng cấp so với tổng giá phòng
{const tr=T.ROOMS.reduce((a,r)=>a+r.price,0),tu=T.rupTotal();
  ok('Tổng giá nâng cấp khoảng 1,4 lần tổng giá phòng',tu>1.3*tr&&tu<1.5*tr,'nâng cấp '+tu.toLocaleString('vi-VN')+' xu / phòng '+tr.toLocaleString('vi-VN')+' xu = ×'+(tu/tr).toFixed(2));
  ok('Phòng hoàng gia 3 cấp',[1,2,3].map(k=>T.rupPrice('royal',k)).join(' / ')==='108000 / 216000 / 432000',[1,2,3].map(k=>T.rupPrice('royal',k)).join(' / '));}
// 9. trọng tài máy chủ nhận bản lưu sau khi nâng cấp (tài sản giảm), vẫn bắt gian lận xu
{const S=reset();S.cats.push(T.newCat(T.SP.muop,1));const OLD=JSON.parse(JSON.stringify(S));T.rupBuy('library');T.rupBuy('living');
  const NEU=JSON.parse(JSON.stringify(S)),q=o=>{const r=require('child_process').spawnSync('node',[path.join(R,'tools/guard.js')],{input:JSON.stringify(o)+'\n',encoding:'utf8'});try{return JSON.parse(r.stdout.trim().split('\n').pop())}catch(e){return {err:r.stderr.slice(0,200)}}};
  const base={old:OLD,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}},a=q(Object.assign({neu:NEU},base));
  ok('tools/guard.js nhận bản lưu có nâng cấp phòng',a.ok===1,JSON.stringify(a).slice(0,160));
  const bad=JSON.parse(JSON.stringify(NEU));bad.coins+=200000;const z=q(Object.assign({neu:bad},base));ok('tools/guard.js vẫn bắt gian lận xu',z.ok===0,z.why);}
// 10. bù thời gian vắng: tick dùng hồi năng lượng đã nâng
{const S=reset(),c=cat('bedroom');c.en=10;T.tick(600);const e0=c.en;c.en=10;T.rupBuy('bedroom');T.rupBuy('bedroom');T.rupBuy('bedroom');T.tick(600);
  ok('tick: Phòng ngủ cấp 3 hồi năng lượng nhanh hơn cấp 0',c.en>e0,e0.toFixed(1)+' → '+c.en.toFixed(1));}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
