"use strict";
/* Kiểm thử bé giận dỗi và bỏ nhà đi (chạy: node tools/straytest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js'].filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},set S(v){S=v},fresh,newCat,tick,load,save,wxOverride,homeCats,onTrip,tripInfo,strayWhy,strayMood,strayOf,strayHunt,strayLure,strayLeave,strayList,STRAY,FOOD,favs,SP,
    setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000,N=[];T.setNotify((m,o)=>N.push((o&&o.mtitle||'')+': '+m));
const reset=lv=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=100000;S.level=lv||6;S.wxU=1;T.wxOverride('ty','sunny');T.wxOverride('se',0);T.wxOverride('hr',12);T.tick(0);N.length=0;return S};
// không thuộc tính: newCat bốc ngẫu nhiên một thuộc tính (Ăn như mèo, Khó ở...) làm tốc độ đói, buồn đổi theo lượt chạy, phần 8 từng hỏng khoảng 1 trong 30 lần
const cat=(room,nm)=>{const c=T.newCat(T.SP.muop,1);c.traits=[];c.room=room||'living';c.en=80;c.hp=70;c.full=90;c.wa=90;c.he=90;if(nm)c.name=nm;T.S.cats.push(c);return c};
// bỏ bê: giữ bé đói, khát, buồn trong suốt khoảng thời gian (không có bát, không nước)
const starve=c=>{c.full=0;c.wa=5;c.hp=10};
const run=(min,fn)=>{for(let i=0;i<min;i++){T.setToff(T.TOFF+MIN);if(fn)fn();T.tick(60)}};
const ng=c=>Math.round(c.ng||0);

// 1. lý do khổ, tích giận, báo trước
{const S=reset(),a=cat('living','A'),b=cat('living','B');
  ok('Bé được chăm thì không có lý do khổ',T.strayWhy(a).length===0);
  starve(a);ok('Đói, khát, buồn: ba lý do',T.strayWhy(a).join(',')==='đói,khát,buồn');
  a.wa=90;run(60,()=>{a.full=0;a.hp=10;a.wa=90});ok('Hai lý do (đói, buồn): +1 giận mỗi phút',Math.abs(ng(a)-60)<=1,ng(a));
  run(60,()=>{a.full=0;a.hp=10;a.wa=90;a.he=90});
  a.ng=0;run(60,()=>{starve(a)});ok('Ba lý do: +2 giận mỗi phút',Math.abs(ng(a)-120)<=1,ng(a));
  a.ng=0;run(60,()=>{a.full=0;a.hp=70;a.wa=90});ok('Chỉ một lý do (đói): không tích giận',ng(a)===0,ng(a));
  a.ng=200;run(60,()=>{a.full=90;a.hp=70;a.wa=90});ok('Được chăm tử tế: nguôi 4 điểm mỗi phút',ng(a)===0&&!('ng' in a));
  a.ng=T.STRAY.warn-1;N.length=0;run(1,()=>starve(a));ok('Vượt mức cảnh báo: bé giận dỗi và game báo',T.strayMood(a)&&N.some(m=>/Giận dỗi/.test(m)),N[0]);
  ok('Bé chưa bỏ đi khi mới giận dỗi',!T.strayOf(a.uid));
}
// 2. bỏ nhà đi
{const S=reset(),a=cat('living','A'),b=cat('bedroom','B');S.rooms.bedroom={bowlAt:0,at:Date.now()};
  a.ng=T.STRAY.leave-1;N.length=0;run(2,()=>{starve(a)});
  const s=T.strayOf(a.uid);ok('Đủ giận: bé bỏ nhà đi, game báo',!!s&&N.some(m=>/Bỏ nhà đi/.test(m)),s&&s.why.join(','));
  ok('Bé đi lạc vẫn trong danh sách mèo (không mất hẳn)',S.cats.includes(a)&&T.strayList()[0]===a);
  ok('Bé đi lạc không ở phòng, không đi viễn chinh được',!T.homeCats('living').includes(a)&&T.onTrip(a.uid)&&T.tripInfo(a,'park').why==='Đang đi vắng');
  const f0=a.full,h0=a.hp;a.full=40;run(30);ok('Chỉ số bé đi lạc đứng yên',a.full===40,a.full);
  ok('Nhớ phòng bé rời đi',s.room==='living');
}
// 3. luôn giữ ít nhất một bé ở nhà; mỗi lúc chỉ một bé đi lạc
{const S=reset(),a=cat('living','A');a.ng=T.STRAY.leave;run(5,()=>starve(a));ok('Chỉ còn một bé: bé không bỏ đi',!T.strayOf(a.uid));
  const b=cat('living','B'),c=cat('living','C');a.ng=b.ng=T.STRAY.leave;c.ng=0;run(1,()=>{starve(a);starve(b)});
  ok('Hai bé cùng đủ giận: chỉ một bé đi',T.strayList().length===1);
  const gone=T.strayList()[0],stay=gone===a?b:a;
  run(120,()=>starve(stay));ok('Đang có một bé đi lạc: bé kia đủ giận vẫn ở nhà, mang nhãn Giận dỗi',T.strayList().length===1&&!T.strayOf(stay.uid)&&T.strayMood(stay),'giận '+ng(stay));
  ok('Điểm giận không vượt mức bỏ đi',ng(stay)===T.STRAY.leave,ng(stay));
  const r=T.strayLure(gone.uid,T.favs(gone)[0]);run(T.STRAY.lure.fav+1,()=>{stay.full=90;stay.wa=90;stay.hp=70;stay.he=90});
  ok('Bé đi lạc về, bé kia đã được chăm: không ai bỏ đi nữa',T.strayList().length===0&&ng(stay)<T.STRAY.leave,'giận '+ng(stay));
  stay.ng=T.STRAY.leave;T.strayLeave(gone);run(30,()=>starve(stay));ok('Lại có bé đi lạc: bé kia vẫn chưa đi',T.strayList().length===1&&!T.strayOf(stay.uid));
  S.stray[gone.uid].at-=T.STRAY.back;run(2,()=>starve(stay));
  ok('Bé đi lạc về mà bé kia vẫn bị bỏ bê: tới lượt bé kia bỏ đi, vẫn còn bé ở nhà',T.strayList().length===1&&!!T.strayOf(stay.uid)&&!T.strayOf(c.uid));
}
// 3b. cả đàn bị bỏ bê: chỉ một bé đi, kể cả khi bù thời gian vắng mặt; bản lưu cũ có nhiều bé đi lạc thì giữ nguyên, không thêm bé nào đi
{const S=reset(),L=[];for(let i=0;i<12;i++)L.push(cat('living','M'+i));L.forEach(c=>c.ng=T.STRAY.leave);
  run(600,()=>L.forEach(c=>{if(!T.strayOf(c.uid))starve(c)}));ok('12 bé cùng đủ giận suốt 10 giờ: chỉ một bé đi lạc',T.strayList().length===1,T.strayList().length);
  for(let i=0;i<48;i++){T.setToff(T.TOFF+10*MIN);L.forEach(c=>{if(!T.strayOf(c.uid))starve(c)});T.tick(600,true)}
  ok('Thêm 8 giờ vắng mặt: vẫn chỉ một bé đi lạc',T.strayList().length===1,T.strayList().length);
  const S2=reset(),K=[];for(let i=0;i<6;i++)K.push(cat('living','K'+i));T.strayLeave(K[0]);T.strayLeave(K[1]);T.strayLeave(K[2]);K[3].ng=T.STRAY.leave;
  run(60,()=>starve(K[3]));ok('Bản lưu cũ đang có ba bé đi lạc: ba bé giữ nguyên, không thêm bé nào đi',T.strayList().length===3&&!T.strayOf(K[3].uid));
}
// 4. chưa đủ cấp hoặc đang hướng dẫn thì không giận
{const S=reset(T.STRAY.lv-1),a=cat('living','A'),b=cat('living','B');run(400,()=>starve(a));ok('Dưới cấp '+T.STRAY.lv+': không giận, không bỏ đi',!a.ng&&!T.strayOf(a.uid));
  S.level=T.STRAY.lv;S.tut.done=0;run(60,()=>starve(a));ok('Đang hướng dẫn tân thủ: không giận',!a.ng);}
// 5. nhờ bạn đi tìm
{const S=reset(),a=cat('living','A'),b=cat('living','B'),c=cat('living','C');T.strayLeave(a);
  b.full=10;ok('Bạn đói thì không đi tìm được',/đói/.test(T.strayHunt(a.uid,b.uid)));b.full=90;
  b.en=5;ok('Bạn không đủ sức thì không đi tìm được',/sức/.test(T.strayHunt(a.uid,b.uid)));b.en=80;
  ok('Bé đi lạc không tự tìm chính mình',!!T.strayHunt(a.uid,a.uid));
  ok('Nhờ bạn đi tìm: được',T.strayHunt(a.uid,b.uid)===''&&b.en===80-T.STRAY.hunt.en);
  ok('Bạn đang đi tìm cũng vắng nhà',T.onTrip(b.uid)&&!T.homeCats('living').includes(b));
  ok('Đã có bạn đi tìm thì không nhờ thêm',!!T.strayHunt(a.uid,c.uid));
  N.length=0;run(T.STRAY.hunt.min-1);ok('Chưa đủ '+T.STRAY.hunt.min+' phút: chưa về',!!T.strayOf(a.uid));
  run(2);ok('Đủ thời gian: bé được tìm về, bạn cũng về',!T.strayOf(a.uid)&&!T.onTrip(a.uid)&&!T.onTrip(b.uid)&&T.homeCats('living').includes(a)&&N.some(m=>/tìm thấy/.test(m)));
  ok('Về nhà được ăn uống tạm, vui vừa phải',a.full>=T.STRAY.home.full-1&&a.hp>=T.STRAY.home.hp-1&&a.wa>=T.STRAY.home.wa-1&&!a.ng,'no '+a.full.toFixed(0)+', vui '+a.hp.toFixed(0)+', nước '+a.wa.toFixed(0));
  ok('Đếm số lần bỏ nhà đi',a.strayN===1);
}
// 6. bát mồi: món khoái khẩu nhanh hơn, trừ xu
{const S=reset(),a=cat('living','A'),b=cat('living','B');T.strayLeave(a);
  const fav=T.favs(a)[0],other=Object.keys(T.FOOD).find(k=>!T.favs(a).includes(k)&&T.FOOD[k].full>0);
  const c0=S.coins,r=T.strayLure(a.uid,fav);ok('Đặt bát món khoái khẩu: trừ gấp đôi giá, '+T.STRAY.lure.fav+' phút',r.cost===T.FOOD[fav].price*2&&r.min===T.STRAY.lure.fav&&S.coins===c0-r.cost);
  ok('Đã đặt rồi thì không đặt thêm',!!T.strayLure(a.uid,fav).err);
  run(T.STRAY.lure.fav+1);ok('Bé ngửi thấy bát và tự về',!T.strayOf(a.uid));
  T.strayLeave(a);const r2=T.strayLure(a.uid,other);ok('Món khác: '+T.STRAY.lure.other+' phút',r2.min===T.STRAY.lure.other);
  S.stray[a.uid].lure=null;S.coins=1;ok('Không đủ xu thì không đặt được',!!T.strayLure(a.uid,fav).err&&S.coins===1);
}
// 7. tự về sau 2 ngày, cả khi đang vắng (bù thời gian lúc tải game)
{const S=reset(),a=cat('living','A'),b=cat('living','B');T.strayLeave(a);S.stray[a.uid].at-=T.STRAY.back-5*MIN;
  run(6);ok('Đủ 2 ngày: bé tự về',!T.strayOf(a.uid));
  T.strayLeave(a);T.setToff(0);T.save();const st=JSON.parse(STORE);st.stray[a.uid].at-=T.STRAY.back+10*MIN;st.last-=3600000;STORE=JSON.stringify(st);T.load();
  ok('Bé tự về trong lúc người chơi vắng (bù thời gian khi tải game)',!T.S.stray[a.uid]&&(T.S.strayBack||[]).length>=1);
}
// 8. bỏ bê lúc vắng mặt: một lần vắng 8 giờ chưa đủ bỏ đi, giận được giữ lại
{const S=reset(),a=cat('living','A'),b=cat('living','B');S.items=S.items.filter(i=>!/bowl/.test(i.fid));a.full=80;b.full=80;a.wa=60;b.wa=60;
  T.setToff(0);T.save();const st=JSON.parse(STORE);st.last-=8*3600000;STORE=JSON.stringify(st);T.load();
  const A=T.S.cats.find(c=>c.name==='A');ok('Vắng một đêm (8 giờ) bát trống: bé giận dỗi nhưng chưa bỏ đi',T.strayMood(A)&&!T.S.stray[A.uid],'giận '+Math.round(A.ng||0));
  T.save();const st3=JSON.parse(STORE);st3.last-=8*3600000;STORE=JSON.stringify(st3);T.load();
  ok('Vắng đêm thứ hai vẫn bát trống: một bé bỏ nhà đi, bé kia ở lại',T.S.cats.filter(c=>T.S.stray[c.uid]).length===1,'giận '+T.S.cats.map(c=>Math.round(c.ng||0)).join('/'));
}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều ĐẠT');process.exit(fail?1:0);
