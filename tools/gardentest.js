"use strict";
/* Kiểm thử vườn nhỏ (chạy: node tools/gardentest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, garden-data.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js, garden.js, cùng trọng tài tools/guard.js. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
globalThis.performance=globalThis.performance||{now:()=>Date.now()};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js'].filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,wxOverride,buyItem,roomClimate,wxDirty,gdInit,gdEnv,gdVar,gdPlant,gdWater,gdWaterAll,gdClear,gdHarvest,gdYield,gdCook,gdFeedFish,gdSellFish,gdBuyFish,gdLure,gdEta,gdOpen,
    strayLeave,strayOf,strayTick,lureName,FURN,GCROP,GDC,GRECIPES,FEATS,FCATS,SP,setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000,N=[];T.setNotify((m,o)=>N.push((o&&o.mtitle||o&&o.title||'')+': '+m));
const reset=(lv,ty)=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=100000;S.level=lv||9;S.wxU=1;
  S.rooms.balcony={bowlAt:0,at:1};S.rooms.garden={bowlAt:0,at:2};S.rooms.greenhouse={bowlAt:0,at:3};
  T.wxOverride('ty',ty||'sunny');T.wxOverride('se',2);T.wxOverride('hr',12);T.wxDirty();T.tick(0);N.length=0;return S};
const put=(fid,rid)=>{const it=T.buyItem(fid,rid,100);T.gdInit(it);T.wxDirty();return it};
const run=(min,fn)=>{for(let i=0;i<min;i++){T.setToff(T.TOFF+MIN);if(fn)fn();T.tick(60)}};
const ty=t=>{T.wxOverride('ty',t);T.wxDirty()};

// 1. dữ liệu
{ok('Ba món vườn có trong cửa hàng, mục Vườn nhỏ',['gpot','gbed','gpond'].every(id=>T.FURN[id]&&T.FURN[id].cat==='garden')&&T.FCATS.some(c=>c[0]==='garden'));
 ok('Tính năng Vườn nhỏ mở ở cấp 4 (lộ trình)',T.FEATS.some(f=>f.id==='garden'&&f.lv===4));
 ok('Chỉ đặt được ở phòng ngoài trời và Nhà kính',T.FURN.gpot.rooms.join()==='balcony,garden,greenhouse,pool,rooftop');}
// 2. gieo hạt, lớn, chín, thu hoạch
{const S=reset(),it=put('gpot','balcony'),c0=S.coins;
 ok('Chậu mới: đất trống',T.gdVar(it)===''&&it.gd.c===null,T.gdVar(it));
 ok('Gieo cỏ mèo trừ xu hạt giống',T.gdPlant(it.iid,'grass')===''&&S.coins===c0-20&&it.gd.c==='grass');
 ok('Chậu đang có cây thì không gieo chồng',T.gdPlant(it.iid,'carrot')!=='');
 ok('Mầm non: biến thể grass1',T.gdVar(it)==='grass1');
 const eta=T.gdEta(it);ok('Nắng đẹp mùa thu giữa trưa: cỏ mèo chín sau khoảng 45/1,3 ≈ 35 phút',eta>=33&&eta<=36,eta);
 run(20,()=>T.gdWater(it.iid));ok('Đang lớn: grass2',T.gdVar(it)==='grass2',T.gdVar(it));
 ok('Chưa chín thì không thu hoạch',!!T.gdHarvest(it.iid).err);
 N.length=0;run(20,()=>{it.gd.wa=100});ok('Chín: grass3 và game báo Rau chín',T.gdVar(it)==='grass3'&&N.some(m=>/Rau chín/.test(m)),N.join(' | '));
 const xp=S.xp,r=T.gdHarvest(it.iid);ok('Thu hoạch: cây khỏe được 2 × 1,5 = 3 cỏ mèo vào giỏ, +3 kinh nghiệm',r.n===3&&S.gd.inv.grass===3&&S.xp>=xp+3||S.level>9,JSON.stringify(r));
 ok('Thu hoạch xong chậu trống lại',it.gd.c===null&&T.gdVar(it)==='');}
// 3. ban đêm, mùa đông, khóa cây theo cấp
{const S=reset(5),it=put('gpot','balcony');
 ok('Bí đỏ mở ở cấp 9: cấp 5 chưa gieo được',/cấp 9/.test(T.gdPlant(it.iid,'pump')));
 T.gdPlant(it.iid,'carrot');const day=T.gdEta(it);T.wxOverride('hr',23);T.wxDirty();const night=T.gdEta(it);
 ok('Ban đêm cây lớn chậm hơn ban ngày có nắng (×0,5 so với ×1,3)',night>day*2.4,day+' → '+night);
 T.wxOverride('hr',12);T.wxOverride('se',3);ty('sunny');const win=T.gdEta(it);ok('Mùa đông chậm hơn mùa thu',win>day,win);}
// 4. mưa tưới, nắng nóng làm khô, khát thì héo rồi chết
{const S=reset(9,'drizzle'),it=put('gpot','balcony');T.gdPlant(it.iid,'grass');it.gd.wa=10;
 run(5);ok('Mưa nhẹ ở ban công tự tưới (đất ẩm lên)',it.gd.wa>25,Math.round(it.gd.wa));
 ty('sunny');it.gd.wa=100;run(60);const sw=100-it.gd.wa;
 ty('heatwave');it.gd.wa=100;run(60);const hw=100-it.gd.wa;
 ok('Nắng như đổ lửa làm đất khô nhanh hơn nắng đẹp',hw>sw*1.4,Math.round(sw)+' / '+Math.round(hw));
 ty('sunny');it.gd.wa=0;it.gd.hp=100;it.gd.p=.5;run(10);ok('Đất khô kiệt: cây héo (biến thể có d), không lớn, mất sức',/d$/.test(T.gdVar(it))&&it.gd.p===.5&&it.gd.hp<100,T.gdVar(it));
 N.length=0;run(400,()=>{it.gd.wa=0});ok('Khát lâu thì cây chết khô, game báo',it.gd.dead===1&&T.gdVar(it)==='dead'&&N.some(m=>/chết khô/.test(m)));
 ok('Cây chết không thu hoạch được; dọn chậu thì gieo lại được',!!T.gdHarvest(it.iid).err&&T.gdClear(it.iid)===''&&T.gdPlant(it.iid,'grass')==='');}
// 5. rét đậm, giông bão, mái che, nhà kính, sưởi
{const S=reset(9,'blizzard'),a=put('gpot','balcony'),g=put('gpot','greenhouse');T.wxOverride('se',3);T.wxDirty();
 T.gdPlant(a.iid,'grass');T.gdPlant(g.iid,'grass');
 const Ta=T.roomClimate('balcony').T,Tg=T.roomClimate('greenhouse').T;
 run(30,()=>{a.gd.wa=g.gd.wa=100});
 ok('Bão tuyết mùa đông: ban công dưới 0°C, cây bị dập lá, không lớn',Ta<=0&&a.gd.hp<100&&a.gd.p===0,Ta+'°C, sức '+Math.round(a.gd.hp));
 ok('Nhà kính ấm hơn, cây vẫn khỏe',Tg>Ta&&g.gd.hp===100,Tg+'°C');
 const S2=reset(9,'storm'),b=put('gpot','garden');T.gdPlant(b.iid,'grass');run(30);const open=100-b.gd.hp;
 const S3=reset(9,'storm'),c=put('gpot','garden');T.buyItem('balconyroof','garden',200);T.wxDirty();T.gdPlant(c.iid,'grass');run(30);const roof=100-c.gd.hp;
 ok('Mưa giông gió lớn quật cây ở sân vườn trống; có mái che thì đỡ hơn',open>0&&roof<open,Math.round(open)+' / '+Math.round(roof));}
// 6. luống: thu hoạch gấp 3; cây yếu thì ít hơn
{const S=reset(),b=put('gbed','garden');T.gdPlant(b.iid,'carrot');b.gd.p=1;b.gd.hp=90;
 ok('Luống: cà rốt khỏe 2 × 3 × 1,5 = 9',T.gdYield(b)===9,T.gdYield(b));b.gd.hp=30;ok('Cây yếu (sức dưới 40): còn một nửa',T.gdYield(b)===3,T.gdYield(b));
 const r=T.gdHarvest(b.iid);ok('Thu hoạch luống vào giỏ',S.gd.inv.carrot===3,JSON.stringify(r));}
// 7. nấu món vào kho thức ăn
{const S=reset();S.gd={inv:{grass:2,carrot:3,pump:1},h:0};S.fdinv={};S.gd.inv.grass=1;
 ok('Thiếu nguyên liệu thì không nấu',!!T.gdCook('r_prem').err);
 const r=T.gdCook('r_soup');ok('Súp bí đỏ: 1 bí + 1 cà rốt → 8 suất Súp thưởng vào kho thức ăn',r.n===8&&S.fdinv.churu===8&&!S.gd.inv.pump&&S.gd.inv.carrot===2);
 S.gd.inv.grass=2;T.gdCook('r_nip');ok('Cỏ mèo tươi: 2 cỏ → 4 suất Cỏ mèo',S.fdinv.catnip===4&&!S.gd.inv.grass);}
// 8. hồ cá
{const S=reset(),p=put('gpond','garden'),c0=S.coins;
 ok('Hồ mới có 2 cá, hình f2/f2a',p.fp.n===2&&/^f2a?$/.test(T.gdVar(p)),T.gdVar(p));
 run(200);ok('Không cho ăn thì cá không đẻ (nhưng không chết)',p.fp.n===2);
 ok('Cho cá ăn trừ 5 xu, no 6 giờ; còn no thì không cho thêm',T.gdFeedFish(p.iid)===''&&S.coins===c0-5&&T.gdFeedFish(p.iid)!=='');
 N.length=0;run(181);ok('Được ăn: 3 giờ đẻ thêm một chú, game báo',p.fp.n===3&&N.some(m=>/cá con/.test(m)),p.fp.n);
 const c1=S.coins;ok('Bán một cá +60 xu',T.gdSellFish(p.iid)===''&&p.fp.n===2&&S.coins===c1+60);
 p.fp.n=1;ok('Giữ lại ít nhất một chú cá',T.gdSellFish(p.iid)!=='');
 p.fp.n=6;ok('Đủ 6 thì không mua thêm',T.gdBuyFish(p.iid)!=='');
 ty('blizzard');T.wxOverride('se',3);T.wxDirty();ok('Rét dưới 0°C: mặt hồ đóng băng',T.gdVar(p)==='ice');
 p.fp.n=3;p.fp.b=0;p.fp.fed=Date.now()+T.TOFF+600*MIN;run(200);ok('Hồ đóng băng thì cá không đẻ',p.fp.n===3);}
// 9. bát mồi bằng rau vườn
{const S=reset(),a=T.newCat(T.SP.muop,1),b=T.newCat(T.SP.muop,1);a.room=b.room='living';S.cats.push(a,b);S.stray={};T.strayLeave(a);
 S.gd={inv:{grass:1},h:0};const c0=S.coins,r=T.gdLure(a.uid,'grass');
 ok('Bát mồi cỏ mèo: không tốn xu, trừ 1 cỏ, bé về sau 25 phút',r.min===25&&S.coins===c0&&!S.gd.inv.grass&&/^g:grass$/.test(T.strayOf(a.uid).lure.food));
 ok('Không còn rau thì báo',!!T.gdLure(a.uid,'carrot').err);
 ok('Tên bát mồi đọc được',T.lureName('g:grass')==='Cỏ mèo'&&T.lureName('tuna')==='Cá ngừ');
 N.length=0;run(26);ok('Bé ngửi thấy cỏ mèo và về nhà',!T.strayOf(a.uid)&&N.some(m=>/cỏ mèo/.test(m)),N.join(' | '));}
// 10. vắng mặt: bù thời gian, lưu và tải lại
{const S=reset(),it=put('gpot','balcony');S.cats.push(T.newCat(T.SP.muop,1));T.gdPlant(it.iid,'grass');T.save();
 const S2=JSON.parse(STORE);S2.last=Date.now()-3*3600000;STORE=JSON.stringify(S2);T.load();
 const it2=T.S.items.find(i=>i.iid===it.iid);ok('Tải lại sau 3 giờ vắng: cây vẫn lớn (bù thời gian), trạng thái giữ nguyên',it2&&it2.gd.c==='grass'&&it2.gd.p>0,it2&&it2.gd.p.toFixed(2));
 const S3=reset(3);const p=put('gpot','balcony');ok('Dưới cấp 4: vườn chưa mở, không chạy',!T.gdOpen());}
// 11. trọng tài máy chủ nhận bản lưu có vườn (mua chậu, luống, hồ, gieo, thu hoạch, nấu, cho cá ăn, bán cá), vẫn bắt gian lận xu
{const S=reset();S.cats.push(T.newCat(T.SP.muop,1));const OLD=JSON.parse(JSON.stringify(S));
 const p=put('gpot','balcony'),b=put('gbed','garden'),d=put('gpond','garden');T.gdPlant(p.iid,'grass');p.gd.p=1;T.gdHarvest(p.iid);S.gd.inv.grass=2;T.gdCook('r_nip');T.gdFeedFish(d.iid);T.gdSellFish(d.iid);
 const NEU=JSON.parse(JSON.stringify(S)),q=o=>{const r=require('child_process').spawnSync('node',[path.join(R,'tools/guard.js')],{input:JSON.stringify(o)+'\n',encoding:'utf8'});try{return JSON.parse(r.stdout.trim().split('\n').pop())}catch(e){return {err:r.stderr.slice(0,200)}}};
 const base={old:OLD,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}},a=q(Object.assign({neu:NEU},base));
 ok('tools/guard.js nhận bản lưu có vườn',a.ok===1,JSON.stringify(a).slice(0,160));
 const bad=JSON.parse(JSON.stringify(NEU));bad.coins+=200000;const z=q(Object.assign({neu:bad},base));ok('tools/guard.js vẫn bắt gian lận xu',z.ok===0,z.why);}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
