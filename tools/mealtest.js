"use strict";
/* Kiểm thử bát ăn, bát nước, kho riêng, chia suất, giữ chỗ, ăn uống vơi dần (chạy: node tools/mealtest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, game.js, wx.js, pw.js, med.js, meal.js. Thoát mã 1 nếu có phần hỏng.
   Phần 13 trở đi phủ danh sách kiểm thử của người dùng (một và nhiều bát, mua theo gợi ý, chia 3–3, 4–2, tự chọn, hàng chờ, gián đoạn,
   vơi dần, không trừ hai lần, nằm viện, bữa ảo, lưu và tải lại, bù giờ vắng mặt, máy lọc nước, bát hỏng, bát bị dời, đổ chéo, nhịp 10 phút). */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,wxOverride,bowlsIn,wbowls,invN,fdN,mFree,mAvail,mHave,mShow,fillRatio,mSuggest,mealPlan,mealPour,mealBuy,mealCall,mealTick,mealArrive,mealStop,mealOf,mealRes,mealEaters,feedRoom,mPrice,
    favs,bowlList,fdList,mealLoad,homeCats,itemsIn,get AWAY(){return AWAY},WXC,SP,FURN,FOOD,DRINK,MEALC,setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
const reset=()=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=100000;S.level=5;S.wxU=1;T.wxOverride('ty','sunny');T.wxOverride('se',0);T.wxOverride('hr',12);T.tick(0);return S};
const cat=(full)=>{const c=T.newCat(T.SP.muop,1);c.room='living';c.en=80;c.hp=70;c.full=full==null?90:full;c.wa=100;T.S.cats.push(c);return c};
const sec=s=>{T.setToff(T.TOFF+s*1000);T.tick(s)};
const addBowl=()=>{const S=T.S;S.items.push({iid:S.nid++,fid:'bowl',room:'living',x:200,y:158,flip:false,broken:false,left:0,fl:[]});return S.items[S.items.length-1]};

// 1. kho riêng, mua vào kho chưa đổ
{const S=reset();const c0=S.coins,r=T.mealBuy('f','kibble',6);
  ok('Mua 6 suất hạt khô vào kho, trừ đúng giá',r.n===6&&T.fdN('kibble')===6&&S.coins===c0-T.mPrice('f','kibble',6),'giá '+T.mPrice('f','kibble',6));
  ok('Mua thức ăn không đụng kho nước',T.invN('kibble')===0);
  ok('Mua vào kho chưa đổ vào bát',T.bowlsIn('living')[0].fl.length===0);}
// 2. chia 6 suất cho 2 bát 4 suất
{reset();addBowl();T.mealBuy('f','kibble',20);
  let p=T.mealPlan('f','living',6,'even');ok('Chia đều 6 suất cho 2 bát: 3 và 3',p.n===6&&p.plan.every(x=>x.add===3),JSON.stringify(p.plan));
  p=T.mealPlan('f','living',6,'first');ok('Ưu tiên bát đầu: 4 và 2',p.plan[0].add===4&&p.plan[1].add===2);
  const bs=T.bowlsIn('living'),cu={};cu[bs[0].iid]=1;cu[bs[1].iid]=9;p=T.mealPlan('f','living',0,'custom',cu);ok('Tự chọn không vượt sức chứa từng bát',p.plan.find(x=>x.iid===bs[1].iid).add===4);
  bs[0].fl=['pate','pate'];bs[0].left=2;p=T.mealPlan('f','living',8,'even');ok('Bát còn 2/4 chỉ được thêm 2',p.plan.find(x=>x.iid===bs[0].iid).add===2&&p.n===6);
  const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',6,'even').plan);ok('Đổ không làm mất phần còn trong bát',bs[0].fl.filter(x=>x==='pate').length===2&&r.n===6&&T.fdN('kibble')===14);}
// 3. đổ một phần, phần còn lại ở kho
{reset();T.mealBuy('f','kibble',6);const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',2,'even').plan);
  ok('Đổ 2 trong 6 suất: kho còn 4',r.n===2&&T.fdN('kibble')===4);}
// 4. mèo phải tới bát rồi mới trừ suất, vơi dần, cộng chỉ số khi ăn
{reset();const c=cat(30);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',4);T.mealPour('f','living','kibble',[{iid:b.iid,add:4}]);
  ok('Đổ xong bé được giao bát, đang đi',T.mealOf(c)&&c.meal.st==='go'&&b.fl.length===4);
  ok('Đang đi: suất chưa bị trừ, nhưng đã giữ chỗ',T.mHave('f',b)===4&&T.mAvail('f',b)===3);
  const f0=c.full;sec(7);ok('Tới bát (hết eta) thì bắt đầu ăn và mới trừ suất',c.meal&&c.meal.st==='eat'&&b.fl.length===3,c.meal&&c.meal.st);
  ok('Đang ăn: chưa cộng no',c.full<=f0);
  sec(3);const sh=T.mShow('f',b);ok('Lượng trong bát vơi dần theo tiến độ',sh<4&&sh>3,sh.toFixed(2));
  sec(4);ok('Ăn xong thì cộng no',!c.meal&&c.full>f0,f0+' → '+c.full.toFixed(1));}
// 5. hai bé không ăn cùng một suất
{reset();const a=cat(20),b2=cat(20);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',1);T.mealPour('f','living','kibble',[{iid:b.iid,add:1}]);
  ok('Một suất chỉ giao cho một bé',[a,b2].filter(c=>T.mealOf(c)).length===1);}
// 6. gián đoạn
{reset();const c=cat(30);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  T.mealStop(c,'drag');ok('Bị gọi đi trước khi ăn: giữ nguyên suất',b.fl.length===2&&!c.meal);
  T.mealCall('living','f',false);sec(7);sec(3);const f0=c.full;T.mealStop(c,'drag');
  ok('Đang ăn bị gián đoạn: chỉ tính phần đã ăn, phần còn lại thành phần dở trong bát',c.full>f0&&b.fp&&b.fp.r>0.2&&b.fp.r<0.8&&b.fl.length===1,'dở '+(b.fp&&b.fp.r.toFixed(2)));
  ok('Phần dở chiếm một chỗ',T.mFree('f',b)===2);}
// 7. viễn chinh hủy
{reset();const c=cat(30);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  T.S.trips[0]={uid:c.uid,end:Date.now()+3600000};sec(1);ok('Đi viễn chinh thì hủy, không trừ',!c.meal&&b.fl.length===2);}
// 8. nước độc lập
{reset();const c=cat(90);c.wa=30;const w=T.wbowls('living')[0];w.w=0;w.wl=[];T.S.inv.w_plain=5;
  const r=T.mealPour('w','living','w_plain',T.mealPlan('w','living',3,'even').plan);ok('Rót 3 chai: kho nước còn 2, kho thức ăn không đổi',r.n===3&&T.invN('w_plain')===2&&T.fdN('w_plain')===0);
  ok('Bé khát được giao bát nước',T.mealOf(c)&&c.meal.k==='w');sec(7);sec(5);ok('Uống xong mới cộng nước',!c.meal&&c.wa>40&&w.wl.length===2,'nước '+c.wa);}
// 9. lưu và tải lại
{reset();const c=cat(30);const b=T.bowlsIn('living')[0];T.mealBuy('f','pate',5);T.mealPour('f','living','pate',[{iid:b.iid,add:3}]);T.save();
  const st=JSON.parse(STORE);const sb=st.items.find(i=>i.iid===b.iid);ok('Bản lưu giữ danh sách suất, kho và bữa đang đi',sb.fl.length===3&&st.fdinv.pate===2&&st.cats.find(x=>x.uid===c.uid).meal);
  T.load();const c2=T.S.cats.find(x=>x.uid===c.uid),b2=T.bowlsIn('living').find(i=>i.iid===b.iid);ok('Tải lại: bé đi lại từ đầu, suất còn nguyên',c2.meal&&c2.meal.st==='go'&&b2.fl.length===3);}
// 10. chuyển dữ liệu bát cũ
{reset();cat(95);const b=T.bowlsIn('living')[0];delete b.fl;b.food='tuna';b.left=3;T.save();T.load();const b2=T.bowlsIn('living')[0];
  ok('Bát cũ (food + left) thành danh sách 3 suất cá ngừ',Array.isArray(b2.fl)&&b2.fl.length===3&&b2.fl[0]==='tuna',JSON.stringify({fl:b2.fl,left:b2.left,food:b2.food}));}
// 11. gợi ý
{reset();cat(20);cat(20);addBowl();ok('Gợi ý theo số bé cần ăn, không ép đầy 8',T.mSuggest('f','living')===2,T.mSuggest('f','living'));
  const b=T.bowlsIn('living')[1];ok('Chọn một bát: gợi ý trong chỗ trống của bát đó',T.mSuggest('f','living',b.iid)<=4);}
// 12. cho ăn nhanh (feedRoom)
{const S=reset();const c=cat(30);const c0=S.coins,r=T.feedRoom('living','kibble');ok('Cho ăn nhanh: mua đúng số thiếu, bé ra ăn',r&&r.n===1&&c.meal&&S.coins<c0,JSON.stringify(r));}
/* ======== Mở rộng (2026-11-12): danh sách kiểm thử của người dùng ======== */
const addItem=(fid,room,extra)=>{const S=T.S;const it=Object.assign({iid:S.nid++,fid,room:room||'living',x:120+S.nid*6,y:158,flip:false,broken:false},extra||{});S.items.push(it);return it};
const plain=c=>{c.traits=[];return c}; // bỏ thuộc tính ngẫu nhiên để tính được độ no cộng thêm
const gainOf=(c,id)=>T.FOOD[id].full*(T.favs(c).includes(id)?1.2:1);
const busy=cs=>cs.some(c=>T.mealOf(c));
const waitDone=(cs,max)=>{for(let i=0;i<(max||60)&&busy(cs);i++)sec(1)};
const tot=b=>T.mHave('f',b)+[b.fp].concat(b.fpx||[]).reduce((a,p)=>a+(p&&p.r>T.MEALC.minPart?p.r:0),0); // lượng thức ăn còn trong bát (suất nguyên + mọi phần dở b.fp, b.fpx; không tính phần bé đang ăn)
const near=(a,b,e)=>Math.abs(a-b)<(e||.05);
const nowT=()=>Date.now()+T.TOFF;

// 13. một bát và nhiều bát
{reset();const cs=[cat(20),cat(20),cat(20)];const b=T.bowlsIn('living')[0];
  ok('Một bát, 3 bé đói: gợi ý 3 suất',T.mSuggest('f','living')===3,T.mSuggest('f','living'));
  T.mealBuy('f','kibble',3);const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',3,'even').plan);
  ok('Một bát: cả 3 suất vào bát duy nhất, 3 bé cùng được giao bát đó',r.n===3&&b.fl.length===3&&cs.every(c=>T.mealOf(c)&&c.meal.iid===b.iid));}
{reset();addBowl();addBowl();const bs=T.bowlsIn('living');
  let p=T.mealPlan('f','living',12,'even');ok('Ba bát trống chia đều 12 suất: 4, 4, 4',p.n===12&&p.plan.every(x=>x.add===4));
  p=T.mealPlan('f','living',5,'even');const ad=bs.map(b=>(p.plan.find(x=>x.iid===b.iid)||{add:0}).add);
  ok('Ba bát chia đều 5 suất: chênh nhau không quá 1',p.n===5&&Math.max(...ad)-Math.min(...ad)<=1,ad.join('–'));
  p=T.mealPlan('f','living',20,'even');ok('Chia nhiều hơn sức chứa: chỉ chia tới khi đầy (12)',p.n===12);}

// 14. bát trống, bát đầy, bát còn một phần
{reset();const b=T.bowlsIn('living')[0];
  ok('Bát trống: còn 4 chỗ',T.mFree('f',b)===4);
  b.fl=['kibble','kibble','kibble','kibble'];b.left=4;T.mealBuy('f','kibble',3);const c0=T.fdN('kibble');
  const r=T.mealPour('f','living','kibble',[{iid:b.iid,add:3}]);
  ok('Bát đầy: không đổ được, kho không bị trừ',r.full===1&&T.fdN('kibble')===c0&&b.fl.length===4);
  ok('Bát đầy: gợi ý 0 khi chọn bát đó',T.mSuggest('f','living',b.iid)===0);
  b.fl=['pate'];b.left=1;b.fp={id:'kibble',r:.5};
  ok('Bát còn 1 suất và nửa suất dở: còn 2 chỗ',T.mFree('f',b)===2);
  T.mealPour('f','living','kibble',[{iid:b.iid,add:9}]);
  ok('Đổ vào bát còn một phần: chỉ thêm đủ chỗ, giữ suất cũ và phần dở',b.fl.length===3&&b.fl[0]==='pate'&&b.fp&&b.fp.r===.5&&T.fdN('kibble')===1);}

// 15. mua đúng gợi ý, mua ít hơn, mua nhiều hơn
{reset();addBowl();for(let i=0;i<5;i++)cat(20);const n=T.mSuggest('f','living');
  T.mealBuy('f','kibble',n);const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',n,'even').plan);
  ok('Mua đúng gợi ý (5): đổ hết, kho về 0',n===5&&r.n===5&&T.fdN('kibble')===0,'gợi ý '+n);}
{reset();addBowl();for(let i=0;i<5;i++)cat(20);T.mealBuy('f','kibble',3);
  const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',5,'even').plan);
  ok('Mua ít hơn gợi ý (3/5): đổ được 3, kho về 0, không báo lỗi',!r.err&&r.n===3&&T.fdN('kibble')===0,JSON.stringify(r.bowls));}
{reset();addBowl();for(let i=0;i<5;i++)cat(20);T.mealBuy('f','kibble',10);
  const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',5,'even').plan);
  ok('Mua nhiều hơn gợi ý (10/5): đổ 5, kho còn 5',r.n===5&&T.fdN('kibble')===5);
  const r2=T.mealPour('f','living','kibble',T.mealPlan('f','living',99,'even').plan);
  ok('Đổ tiếp phần còn trong kho: chỉ tới khi đầy 8, kho còn 2',r2.n===3&&T.fdN('kibble')===2,'đổ thêm '+r2.n);}
{reset();T.mealBuy('f','kibble',0);ok('Mua 0 suất vẫn tính là 1 suất (không mua không)',T.fdN('kibble')===1);
  const S=T.S;S.coins=0;const r=T.mealBuy('f','kibble',8);ok('Thiếu xu thì không mua được, kho không đổi',!!r.err&&T.fdN('kibble')===1);}

// 16. mua 6 khi sức chứa 8 (2 bát 4 suất): 3–3, 4–2, tự chọn
for(const [mode,cu,want] of [['even',null,[3,3]],['first',null,[4,2]],['custom','2,4',[2,4]],['custom','5,5',[4,2]]]){
  reset();addBowl();const bs=T.bowlsIn('living');T.mealBuy('f','kibble',6);let c=null;
  if(cu){const v=cu.split(',').map(Number);c={};c[bs[0].iid]=v[0];c[bs[1].iid]=v[1]}
  const r=T.mealPour('f','living','kibble',T.mealPlan('f','living',6,mode,c).plan);
  ok('Mua 6, sức chứa 8, chế độ '+mode+(cu?' ('+cu+')':'')+': '+want.join('–'),bs[0].fl.length===want[0]&&bs[1].fl.length===want[1]&&T.fdN('kibble')===0&&r.n===6,bs.map(b=>b.fl.length).join('–'));}
{reset();addBowl();const bs=T.bowlsIn('living');for(let i=0;i<6;i++)cat(20);
  ok('6 bé đói, sức chứa 8: gợi ý 6',T.mSuggest('f','living')===6);
  const c={};c[bs[1].iid]=3;const p=T.mealPlan('f','living',0,'custom',c);T.mealBuy('f','tuna',3);T.mealPour('f','living','tuna',p.plan);
  ok('Chạm một bát (tự chọn chỉ bát 2): chỉ bát đó được đổ',bs[0].fl.length===0&&bs[1].fl.length===3);}

// 17. hai bé cùng tới một bát; ba bé một bát có hàng chờ
{reset();const a=plain(cat(20)),c2=plain(cat(20));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  ok('Hai bé, hai suất: cả hai được giao cùng một bát, không còn suất trống để giao',[a,c2].every(c=>T.mealOf(c)&&c.meal.iid===b.iid)&&T.mAvail('f',b)===0);
  sec(7);ok('Hai bé tới bát cùng lúc: cả hai cùng ăn (2 chỗ), bát hết suất nguyên',[a,c2].every(c=>c.meal&&c.meal.st==='eat')&&b.fl.length===0&&T.mealEaters(b).length===2);
  ok('Hai bé ăn cùng một bát: lượng hiển thị vẫn đủ 2 suất lúc bắt đầu',T.mShow('f',b)>1.5);
  waitDone([a,c2]);ok('Hai bé ăn xong, mỗi bé no hơn đúng một suất',a.full>40&&c2.full>40&&b.fl.length===0&&!b.fp,a.full.toFixed(1)+', '+c2.full.toFixed(1));}
{reset();const cs=[plain(cat(20)),plain(cat(21)),plain(cat(22))];const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',3);T.mealPour('f','living','kibble',[{iid:b.iid,add:3}]);
  ok('Mỗi bát cho tối đa '+T.MEALC.slots+' bé ăn cùng lúc',T.MEALC.slots===2);
  sec(7);const st=cs.map(c=>c.meal&&c.meal.st);
  ok('Ba bé, một bát: 2 bé ăn, 1 bé xếp hàng chờ',st.filter(x=>x==='eat').length===2&&st.filter(x=>x==='wait').length===1&&b.fl.length===1,st.join(','));
  const w=cs.find(c=>c.meal&&c.meal.st==='wait');ok('Bé đang chờ vẫn giữ chỗ suất cuối',T.mealRes(b)===1&&T.mAvail('f',b)===0);
  sec(6);sec(1);ok('Có chỗ trống thì bé đang chờ vào ăn',w.meal&&w.meal.st==='eat'&&b.fl.length===0,w.meal&&w.meal.st);
  waitDone(cs);ok('Ba bé đều ăn xong, bát trống',cs.every(c=>!c.meal&&c.full>40)&&b.fl.length===0);}

// 18. gián đoạn khi đang đi và khi đang ăn, gọi mealStop hai lần
{reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  const f0=c.full;T.mealStop(c,'drag');T.mealStop(c,'drag');
  ok('Đang đi, dừng hai lần: suất và độ no không đổi',b.fl.length===2&&c.full===f0&&T.mealRes(b)===0);
  T.mealCall('living','f',false);sec(7);sec(3);const p=c.meal.por*T.MEALC.eat;
  T.mealStop(c,'drag');const f1=c.full,r1=b.fp&&b.fp.r;T.mealStop(c,'drag');
  ok('Đang ăn, dừng lần hai không cộng thêm và không trả thêm',c.full===f1&&b.fp&&b.fp.r===r1&&b.fl.length===1);
  ok('Đang ăn bị dừng: tổng lượng còn + phần đã ăn = 2 suất',near(tot(b)+(1-r1),2),'còn '+tot(b).toFixed(2));
  T.mealStop(c);c.full=20;T.mealCall('living','f',false);ok('Bé đói gọi lại thì nhận phần dở trước',T.mealOf(c));sec(7);
  ok('Ăn phần dở: lấy phần dở (không lấy suất nguyên)',c.meal&&c.meal.st==='eat'&&near(c.meal.por,r1)&&!b.fp&&b.fl.length===1,c.meal&&c.meal.por.toFixed(2));
  waitDone([c]);ok('Ăn xong phần dở: bát còn đúng 1 suất nguyên',b.fl.length===1&&!b.fp);}
{reset();const a=plain(cat(30)),c2=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',3);T.mealPour('f','living','kibble',[{iid:b.iid,add:3}]);
  sec(7);sec(2);T.mealStop(a,'drag');T.mealStop(c2,'drag');const left=tot(b),eaten=(a.full-30)/gainOf(a,'kibble')+(c2.full-30)/gainOf(c2,'kibble');
  ok('Hai bé cùng bị dừng giữa bữa: không sinh thêm thức ăn (còn + đã ăn = 3)',near(left+eaten,3,.1),'còn '+left.toFixed(2)+' + đã ăn '+eaten.toFixed(2));}

{reset();const a=plain(cat(30)),c2=plain(cat(30));const b=T.bowlsIn('living')[0];b.fl=['pate','kibble'];b.left=2;T.S.fdinv={};
  T.mealCall('living','f',true);sec(7);sec(2);const ids=[a,c2].map(c=>c.meal&&c.meal.id).sort().join(',');T.mealStop(a,'drag');T.mealStop(c2,'drag');
  const parts=[b.fp].concat(b.fpx||[]).filter(Boolean);
  ok('Hai phần dở khác món: giữ riêng từng món, mỗi phần chiếm một chỗ',ids==='kibble,pate'&&parts.length===2&&new Set(parts.map(p=>p.id)).size===2&&T.mFree('f',b)===2,ids+' · '+JSON.stringify(parts));}

// 19. vơi dần đúng theo tiến độ
{reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  sec(7);const m=c.meal,sh=[];let good=true;
  for(let i=0;i<5;i++){const pr=Math.min(1,(nowT()-m.t0)/(m.dur*1000)),want=1+(1-pr);sh.push(T.mShow('f',b));if(!near(sh[i],want,.02))good=false;sec(1)}
  ok('Lượng hiển thị = suất còn + phần chưa ăn của bé đang ăn',good,sh.map(x=>x.toFixed(2)).join(' → '));
  ok('Lượng hiển thị giảm dần, không tăng',sh.every((x,i)=>!i||x<=sh[i-1]));
  ok('Mức đầy của bát theo lượng hiển thị',near(T.fillRatio(b),T.mShow('f',b)/4,.001));
  waitDone([c]);ok('Ăn xong: hiển thị đúng 1 suất',near(T.mShow('f',b),1));}

// 20. đồng bộ kho, bát và chỉ số, không trừ hai lần
{const S=reset();const a=plain(cat(30)),c2=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',5);T.mealPour('f','living','kibble',[{iid:b.iid,add:4}]);
  sec(7);const fl=b.fl.length,fa=a.full,co=S.coins;for(let i=0;i<20;i++)T.mealTick(0);
  ok('Gọi mealTick 20 lần không qua giờ: bát, độ no, xu không đổi',b.fl.length===fl&&a.full===fa&&S.coins===co&&a.meal.st==='eat');
  const fs=[a.full,c2.full];waitDone([a,c2]);const ga=a.full-fs[0],gc=c2.full-fs[1];
  ok('Ăn xong: mỗi bé cộng đúng một suất',near(ga,gainOf(a,'kibble'),.3)&&near(gc,gainOf(c2,'kibble'),.3),ga.toFixed(2)+' / '+gainOf(a,'kibble'));
  const snap=JSON.stringify([b.fl,a.full,c2.full,S.coins,T.fdN('kibble')]);for(let i=0;i<20;i++){T.mealTick(0);T.mealStop(a);T.mealStop(c2)}
  ok('Sau khi ăn xong, gọi lại mealTick và mealStop không cộng trừ gì',JSON.stringify([b.fl,a.full,c2.full,S.coins,T.fdN('kibble')])===snap);
  ok('Kho + bát + đã ăn = số đã mua (5)',T.fdN('kibble')+b.fl.length+2===5,T.fdN('kibble')+' + '+b.fl.length+' + 2');}

// 21. nằm viện, viễn chinh: không ra bát
{const S=reset();const a=cat(20),c2=cat(20);S.hosp=S.hosp||{};S.hosp[a.uid]={t0:nowT(),until:nowT()+3600000,eids:[],ks:[],cost:0,ch:0};
  S.trips[0]={uid:c2.uid,end:nowT()+3600000};const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  ok('Bé nằm viện và bé đi viễn chinh không được giao bát',!a.meal&&!c2.meal&&T.mAvail('f',b)===2);
  sec(10);ok('Bát vẫn nguyên 2 suất',b.fl.length===2);}
{const S=reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  sec(7);sec(3);S.hosp=S.hosp||{};S.hosp[c.uid]={t0:nowT(),until:nowT()+3600000,eids:[],ks:[],cost:0,ch:0};const f0=c.full;sec(1);
  ok('Đang ăn thì nhập viện: dừng bữa, phần còn lại trả về bát',!c.meal&&b.fl.length===1&&b.fp&&b.fp.r>.2&&b.fp.r<.8,'còn '+tot(b).toFixed(2));} // viện giữ độ no tối thiểu nên không đo bằng độ no
{const S=reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',1);T.mealPour('f','living','kibble',[{iid:b.iid,add:1}]);
  sec(7);sec(3);S.trips[0]={uid:c.uid,end:nowT()+3600000};sec(1);
  ok('Đang ăn thì đi viễn chinh: dừng bữa, phần dở nằm lại bát',!c.meal&&b.fp&&b.fp.r>.2&&b.fp.r<.8);}

// 22. bát hết thì không có bữa ảo
{const S=reset();const cs=[cat(20),cat(20)];const b=T.bowlsIn('living')[0];
  ok('Bát trống: không bé nào được giao bát',T.mealCall('living','f',true)===0&&cs.every(c=>!c.meal));
  T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);const fs=cs.map(c=>c.full),co=S.coins;
  b.fl=[];b.left=0;sec(7);
  ok('Suất biến mất trước khi bé tới: bé về tay không, không cộng no, không cộng xu',cs.every((c,i)=>!c.meal&&c.full<=fs[i])&&S.coins===co);}
{const S=reset();const cs=[plain(cat(20)),plain(cat(20)),plain(cat(20))];const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',1);T.mealPour('f','living','kibble',[{iid:b.iid,add:1}]);
  T.setToff(T.TOFF+600000);T.tick(600,true);
  ok('Bù giờ: 1 suất chỉ cho đúng 1 bé ăn',cs.filter(c=>c.full>20).length===1&&b.fl.length===0&&!b.fp,cs.map(c=>c.full.toFixed(0)).join(','));}

// 23. lưu và tải lại giữa lúc ăn, phần dở trong bản lưu
{reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  sec(7);sec(2);const t0=c.meal.t0;T.save();T.load();
  const c2=T.S.cats.find(x=>x.uid===c.uid),b2=T.bowlsIn('living').find(i=>i.iid===b.iid);
  ok('Tải lại lúc đang ăn: bé ăn tiếp theo đồng hồ, bát không bị trừ thêm',c2.meal&&c2.meal.st==='eat'&&c2.meal.t0===t0&&b2.fl.length===1);
  const f0=c2.full;waitDone([c2]);ok('Ăn xong sau khi tải lại: cộng đúng một suất',near(c2.full-f0,gainOf(c2,'kibble'),.3)&&b2.fl.length===1,(c2.full-f0).toFixed(2));}
{reset();cat(90);const b=T.bowlsIn('living')[0];b.fl=['pate'];b.left=1;b.fp={id:'tuna',r:.4};T.S.fdinv={kibble:3,pate:1};T.save();T.load();const b2=T.bowlsIn('living')[0];
  ok('Bản lưu giữ phần ăn dở và kho thức ăn',b2.fp&&b2.fp.id==='tuna'&&b2.fp.r===.4&&T.fdN('kibble')===3&&T.fdN('pate')===1);}

// 24. bù giờ vắng mặt: máy cho ăn tự đổ, bé đói vẫn được ăn
{const S=reset();const fd=addItem('feeder','living',{fl:[],left:0,at:0});const b=T.bowlsIn('living').find(x=>x.fid==='bowl');b.fl=['pate','pate'];b.left=2;
  const a=cat(90),c2=cat(40);T.save();const st=JSON.parse(STORE);st.last-=3*3600000;STORE=JSON.stringify(st);const co=st.coins;T.load();
  const S2=T.S,a2=S2.cats.find(x=>x.uid===a.uid),c3=S2.cats.find(x=>x.uid===c2.uid),fd2=S2.items.find(i=>i.iid===fd.iid),b2=S2.items.find(i=>i.iid===b.iid);
  ok('Vắng 3 giờ: máy cho ăn tự đổ và trừ xu',T.AWAY.cost>0&&S2.coins<co+T.AWAY.coins,'máy tiêu '+T.AWAY.cost+' xu');
  ok('Vắng 3 giờ: bé đói tự ra ăn (đếm trong "Lúc bạn vắng")',T.AWAY.n>=3,'ăn '+T.AWAY.n+' suất, cảm ơn '+T.AWAY.coins+' xu');
  ok('Vắng 3 giờ: không bé nào bị đói lả',a2.full>25&&c3.full>25,a2.full.toFixed(0)+', '+c3.full.toFixed(0));
  ok('Vắng 3 giờ: bát thường đã được ăn, máy không vượt sức chứa',b2.fl.length<2&&fd2.fl.length<=4,'bát '+b2.fl.length+', máy '+fd2.fl.length);
  ok('Sau khi bù giờ không còn bé kẹt giữa đường',S2.cats.every(c=>!c.meal||c.meal.st==='go'));}

// 25. máy lọc nước, đổ chéo
{const S=reset();const c=cat(90);c.wa=30;const w=T.wbowls('living')[0];w.w=0;w.wl=[];const f=addItem('waterfilter','living',{w:0,wl:[],wat:0});S.inv={w_plain:5};
  T.tick(1);ok('Máy lọc nước rót từ kho: 5 chai vào máy, kho về 0',T.bowlList(f).length+(c.meal?1:0)>=5&&T.invN('w_plain')===0&&w.wl.length===0,'máy '+f.wl.length);
  ok('Bé khát được giao máy lọc nước',T.mealOf(c)&&c.meal.k==='w'&&c.meal.iid===f.iid);
  const h0=c.hp;waitDone([c]);ok('Uống ở máy lọc: cộng nước (Nước lọc +20), máy còn 4',c.wa>45&&f.wl.length===4,'nước '+c.wa.toFixed(0));
  f.wat=0;f.w=0;f.wl=[];T.tick(1);ok('Kho hết thì máy lọc không tự sinh nước',f.wl.length===0);}
{reset();const b=T.bowlsIn('living')[0],w=T.wbowls('living')[0];w.w=0;w.wl=[];T.mealBuy('f','kibble',3);T.S.inv={w_plain:3};
  const r1=T.mealPour('f','living','kibble',[{iid:w.iid,add:3}]);ok('Đổ thức ăn vào bát nước: không đổ, kho không đổi',!!r1.err&&w.wl.length===0&&T.fdN('kibble')===3);
  const r2=T.mealPour('w','living','w_plain',[{iid:b.iid,add:3}]);ok('Rót nước vào bát ăn: không rót, kho nước không đổi',!!r2.err&&b.fl.length===0&&T.invN('w_plain')===3);
  ok('Đổ nhầm loại: hạt khô không phải nước, nước không phải thức ăn',!!T.mealPour('w','living','kibble',[{iid:w.iid,add:1}]).err&&!!T.mealPour('f','living','w_plain',[{iid:b.iid,add:1}]).err);
  ok('Kế hoạch chia thức ăn chỉ gồm bát ăn, chia nước chỉ gồm bát nước',T.mealPlan('f','living',3,'even').plan.every(p=>p.iid!==w.iid)&&T.mealPlan('w','living',3,'even').plan.every(p=>p.iid!==b.iid));}

// 26. bát hỏng, bát bị dời phòng giữa chừng
{reset();const c=cat(30);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  b.broken=true;sec(1);ok('Bát hỏng khi bé đang đi: hủy, suất còn nguyên',!c.meal&&b.fl.length===2);
  ok('Bát hỏng không được tính vào gợi ý, kế hoạch, giao bát',T.mealPlan('f','living',4,'even').n===0&&T.mealCall('living','f',true)===0);}
{reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  sec(7);sec(3);const f0=c.full;b.broken=true;sec(1);const eaten=(c.full-f0)/gainOf(c,'kibble');
  ok('Bát hỏng khi bé đang ăn: phần chưa ăn không mất (còn + đã ăn = 2)',!c.meal&&near(tot(b)+eaten,2,.15),'còn '+tot(b).toFixed(2)+', đã ăn '+eaten.toFixed(2));}
{reset();const c=cat(30);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  b.room='bedroom';sec(1);ok('Bát bị dời phòng khi bé đang đi: hủy, suất theo bát',!c.meal&&b.fl.length===2);}
{reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  sec(7);sec(3);const f0=c.full;b.room='bedroom';sec(1);const eaten=(c.full-f0)/gainOf(c,'kibble');
  ok('Bát bị dời sang phòng khác khi bé đang ăn: dừng bữa, phần còn lại theo bát sang phòng mới',!c.meal&&b.fp&&near(tot(b)+eaten,2,.15),'còn '+tot(b).toFixed(2)+', đã ăn '+eaten.toFixed(2));}
{reset();const c=plain(cat(30));const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',2);T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);
  sec(7);sec(3);const f0=c.full;b.room=null;let err=null;try{sec(1)}catch(e){err=e.message;delete c.meal}const eaten=(c.full-f0)/gainOf(c,'kibble');
  ok(err?'Bát bị cất vào kho khi bé đang ăn: tick lỗi ('+err+')':'Bát bị cất vào kho khi bé đang ăn: dừng bữa, phần còn lại theo bát',!err&&!c.meal&&near(tot(b)+eaten,2,.15),'còn '+tot(b).toFixed(2)+', đã ăn '+eaten.toFixed(2));}

// 27. nhịp kinh tế: vừa đổ thì mọi bé ra ăn, mỗi bé tối đa một lần mỗi 10 phút
{const S=reset();const a=cat(90),c2=cat(90);const b=T.bowlsIn('living')[0];T.mealBuy('f','kibble',8);
  T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);ok('Vừa đổ: bé no (90) cũng ra ăn',T.mealOf(a)&&T.mealOf(c2));waitDone([a,c2]);
  const xp=S.xp;T.mealPour('f','living','kibble',[{iid:b.iid,add:2}]);ok('Đổ lại trong 10 phút: bé no không ra ăn lần nữa',!a.meal&&!c2.meal);
  ok('Đổ lại trong 10 phút: không cộng thêm kinh nghiệm cho ăn',S.xp===xp);
  sec(601);ok('Không đổ thêm thì bé no không tự ra ăn',!a.meal&&!c2.meal);
  T.mealBuy('f','kibble',1);T.mealPour('f','living','kibble',[{iid:b.iid,add:1}]);ok('Sau 10 phút đổ lại: bé no ra ăn lần nữa',T.mealOf(a)||T.mealOf(c2));}

console.log(fail?'\nCÓ '+fail+' PHẦN HỎNG':'\nTất cả ĐẠT');process.exit(fail?1:0);
