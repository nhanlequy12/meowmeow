"use strict";
/* Kiểm thử luật Chơi với bé (chạy: node tools/playtest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js, play.js.
   Kiểm: mở khóa theo cấp, ai được chơi, thời gian chờ 10 phút, phần thưởng, onAct('play'), bản lưu cũ. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
const FILES=['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/play.js'];
(0,eval)(FILES.filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},set S(v){S=v},fresh,newCat,load,save,tick,SP,FURNS,FEATS,unlocksAt,PLAYC,playOpen,playWhy,playCd,playReward,playBegin,playRoster,
    setToff:v=>{TOFF=v},get TOFF(){return TOFF},setAct:f=>{onAct=f},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000,ACT=[];T.setAct((k,v)=>ACT.push(k+':'+v));T.setNotify(()=>{});
const reset=lv=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.level=lv==null?5:lv;S.xp=0;S.cats=[];ACT.length=0;return S};
const cat=(room,nm)=>{const c=T.newCat(T.SP.muop,1);c.traits=[];c.room=room||'living';c.en=80;c.hp=50;c.full=90;c.wa=90;c.he=90;if(nm)c.name=nm;T.S.cats.push(c);return c};

// 1. mở khóa
{const S=reset(1);
  ok('Cấp 1: chưa mở',!T.playOpen());
  const a=cat();ok('Cấp 1: vồ trúng không được thưởng',T.playReward(a,'feather')===null&&a.hp===50);
  S.level=2;ok('Cấp 2: đã mở',T.playOpen());
  const f=T.FEATS.find(x=>x.id==='play');ok('Có dòng trong FEATS ở cấp 2 (Lộ trình, thông báo lên cấp)',f&&f.lv===2&&T.unlocksAt(2).includes(f.n));
}
// 2. ai được chơi
{const S=reset(),a=cat('living','A');
  ok('Bé khỏe, rảnh: chơi được',T.playWhy(a)==='');
  a.en=T.PLAYC.en-1;ok('Năng lượng dưới '+T.PLAYC.en+': mệt',T.playWhy(a)==='Mệt');a.en=80;
  const bf=T.FURNS.find(f=>f.bed);S.items.push({iid:S.nid++,fid:bf.id,room:'living',x:120,y:140,flip:false,broken:false});a.bed=S.items[S.items.length-1].iid;a.bk=0;
  ok('Đang ngủ trong ổ: không chơi',T.playWhy(a)==='Đang ngủ');delete a.bed;delete a.bk;
  a.meal={k:'f',iid:1,st:'go',t:Date.now()};ok('Đang đi ăn: không chơi',T.playWhy(a)==='Đang ăn');
  a.meal={k:'w',iid:1,st:'eat',t:Date.now()};ok('Đang uống nước: không chơi',T.playWhy(a)==='Đang uống nước');delete a.meal;
  S.hosp={[a.uid]:{t0:Date.now(),until:Date.now()+3600000,eids:[],ks:[]}};ok('Nằm viện: không chơi',T.playWhy(a)==='Đang nằm viện');S.hosp={};
  S.stray={[a.uid]:{at:Date.now(),why:['đói'],room:'living'}};ok('Đi lạc: không chơi',T.playWhy(a)==='Đang đi lạc');S.stray={};
  S.trips[0]={uid:a.uid,did:'alley',start:Date.now(),end:Date.now()+600000};ok('Đi viễn chinh: không chơi',T.playWhy(a)==='Đang đi vắng');S.trips[0]=null;
  a.ill=[{eid:1,k:'sprain',t:Date.now()}];ok('Bong gân: đau chân, không chơi',T.playWhy(a)==='Đau chân');
  a.ill=[{eid:2,k:'fracH',t:Date.now()}];ok('Gãy chân: không chơi',T.playWhy(a)==='Đau chân');
  a.ill=[{eid:3,k:'scratch',t:Date.now()}];ok('Trầy xước nhẹ: vẫn chơi được',T.playWhy(a)==='');
  a.ill=[{eid:4,k:'cold',t:Date.now()}];ok('Cảm lạnh: vẫn chơi được',T.playWhy(a)==='');delete a.ill;
  ok('Không có bé: có lý do',!!T.playWhy(null));
}
// 3. phần thưởng và thời gian chờ
{const S=reset(),a=cat('living','A'),hp=a.hp,en=a.en,xp=S.xp,c0=S.coins;
  const r=T.playReward(a,'feather');
  ok('Lông vũ: +'+T.PLAYC.hp.feather+' vui',r&&r.hp===T.PLAYC.hp.feather&&a.hp===hp+T.PLAYC.hp.feather,a.hp);
  ok('Mất '+T.PLAYC.cost+' năng lượng',a.en===en-T.PLAYC.cost,a.en);
  ok('+'+T.PLAYC.xp+' kinh nghiệm',S.xp===xp+T.PLAYC.xp,S.xp);
  ok("Gọi onAct('play',1) cho nhiệm vụ, thành tựu",ACT.includes('play:1'),ACT.join(','));
  ok('Không cho xu',S.coins===c0&&r.coins===undefined);
  ok('Ghi lúc được thưởng vào S.play.at',S.play&&S.play.at[a.uid]>0&&S.play.n===1);
  const h1=a.hp,r2=T.playReward(a,'feather');
  ok('Vồ lần nữa ngay: chờ, không cộng gì',r2&&r2.hp===0&&r2.cd>0&&a.hp===h1&&S.play.n===1,r2&&Math.round(r2.cd/1000)+' giây');
  ok('Thời gian chờ 10 phút',Math.abs(T.playCd(a)-T.PLAYC.cd)<2000,Math.round(T.playCd(a)/MIN)+' phút');
  T.setToff(9*MIN);ok('Sau 9 phút vẫn chờ',T.playReward(a,'laser').hp===0);
  T.setToff(10*MIN+1000);const r3=T.playReward(a,'laser');ok('Sau 10 phút: được thưởng lại, laser +'+T.PLAYC.hp.laser,r3.hp===T.PLAYC.hp.laser&&S.play.n===2);
  const b=cat('living','B');ok('Thời gian chờ tính riêng từng bé',T.playReward(b,'feather').hp===T.PLAYC.hp.feather);
  const c=cat('living','C');c.hp=97;T.playReward(c,'feather');ok('Độ vui tối đa 100',c.hp===100);
  const d=cat('living','D');d.en=T.PLAYC.en-2;const h=d.hp;ok('Bé mệt vồ (không xảy ra trong phòng): không thưởng',T.playReward(d,'feather')===null&&d.hp===h);
}
// 4. danh sách theo phòng, lượt chơi
{const S=reset(),a=cat('living','A'),b=cat('living','B'),c=cat('living','C'),d=cat('bedroom','D');
  T.playReward(b,'feather');c.en=5;
  const r=T.playRoster('living');
  ok('Danh sách phòng: sẵn sàng, đang chờ, không chơi được',r.ok.length===1&&r.ok[0].c===a&&r.wait.length===1&&r.wait[0].c===b&&r.no.length===1&&r.no[0].why==='Mệt');
  ok('Bé phòng khác không có trong danh sách',![...r.ok,...r.wait,...r.no].some(o=>o.c===d));
  S.trips[0]={uid:a.uid,did:'alley',start:Date.now(),end:Date.now()+600000};
  ok('Bé đi vắng hiện ở nhóm không chơi được',T.playRoster('living').no.some(o=>o.c===a&&o.why==='Đang đi vắng'));S.trips[0]=null;
  T.setToff(11*MIN);ok('Bắt đầu lượt: đếm lượt và dọn dấu thời gian đã hết hạn',T.playBegin()&&S.play.s===1&&!(b.uid in S.play.at));
  S.level=1;ok('Cấp 1: không bắt đầu được',!T.playBegin());
}
// 5. bản lưu cũ và lưu, tải lại
{const S=reset(),a=cat('living','A');delete S.play;T.save();T.load();
  const a2=T.S.cats.find(c=>c.name==='A');ok('Bản lưu cũ không có S.play: vẫn chơi được',T.playCd(a2)===0&&T.playReward(a2,'feather').hp===T.PLAYC.hp.feather);
  T.save();T.load();const a3=T.S.cats.find(c=>c.name==='A');ok('Lưu và tải lại: còn thời gian chờ',T.playCd(a3)>0&&T.S.play.n===1);
  T.S.play={at:'hỏng'};ok('S.play hỏng: tự sửa, không lỗi',(()=>{try{T.playBegin();return typeof T.S.play.at==='object'}catch(e){return false}})());
}
// 6. kinh tế: cả đàn 150 bé chơi đủ mỗi 10 phút trong 1 giờ chỉ được ít kinh nghiệm, không xu
{const S=reset(18);for(let i=0;i<150;i++)cat('living','M'+i);const x0=S.xp,l0=S.level,c0=S.coins;let n=0;
  for(let m=0;m<6;m++){T.setToff(m*10*MIN+m*1000);S.cats.forEach(c=>{c.en=80;const r=T.playReward(c,'feather');if(r&&r.hp)n++})}
  ok('150 bé × 6 lần mỗi giờ: '+n+' lần thưởng, '+(n*T.PLAYC.xp)+' kinh nghiệm, 0 xu',n===900&&S.coins===c0&&(S.level>l0||S.xp-x0===900));
}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều ĐẠT');process.exit(fail?1:0);
