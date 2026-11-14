"use strict";
/* Kiểm thử độ thân thiết và kết thân mèo trùng (chạy: node tools/bondtest.js). Dùng đúng mã game; thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/bond.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,homeCats,happyTarget,coinCalc,petCat,claimTrip,startTrip,tripInfo,mealGain,bondLv,bondProg,bondAdd,bondMerge,bondDups,bondPts,bondDay,BOND,SP,DEST,FURN,FOOD,favs,favDrink,
    releaseGift,rehome,setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f},setUp:f=>{onBondUp=f},setAct:f=>{onAct=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
const reset=()=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=100000;S.level=6;S.cats=[];return S};
const cat=(sp,star,room)=>{const c=T.newCat(T.SP[sp||'muop'],star||1);c.traits=[];c.room=room||'living';c.full=90;c.en=90;c.hp=70;T.S.cats.push(c);return c};

// 1. bậc tim
{reset();const c=cat();
  ok('Bé mới 0 tim',T.bondLv(c)===0);
  const L=T.BOND.lv;c.bond=L[1]-1;ok('Dưới ngưỡng tim 1 vẫn 0 tim',T.bondLv(c)===0);
  c.bond=L[1];ok('Đủ ngưỡng thì 1 tim',T.bondLv(c)===1);
  c.bond=L[5]+999;ok('Tối đa 5 tim',T.bondLv(c)===5&&T.bondProg(c).max===1);
  c.bond=L[2]+5;const p=T.bondProg(c);ok('Tiến độ tính từ đầu tim hiện tại',p.h===2&&p.cur===5&&p.need===L[3]-L[2]);
}
// 2. giới hạn ngày, sang ngày, cộng tự do
{reset();const c=cat();let up=[];T.setUp((x,h)=>up.push(h));
  let s=0;for(let i=0;i<100;i++)s+=T.bondAdd(c,1);ok('Chăm thường ngày tối đa '+T.BOND.day+' điểm mỗi ngày',s===T.BOND.day&&T.bondPts(c)===T.BOND.day,s);
  ok('Lên tim thì báo',up.join()==='1',up.join());
  T.setToff(T.TOFF+86400000);ok('Sang ngày mới nhận tiếp',T.bondAdd(c,5)===5);
  ok('Cộng tự do (kết thân) không tính giới hạn',T.bondAdd(c,500,1)===500);
  T.setUp(()=>{});
}
// 3. vuốt ve: +1 điểm, thêm xu theo tim
{const S=reset();const c=cat('muop',1);c.bond=T.BOND.lv[4];const x0=S.coins;const n=T.petCat(c);
  ok('Vuốt ve 4 tim cho thêm '+T.BOND.pet[4]+' xu',n===1+T.BOND.pet[4]&&S.coins-x0===n,n);
  ok('Vuốt ve +1 điểm',T.bondPts(c)===T.BOND.lv[4]+1);
  ok('Vuốt ve lần hai trong 10 phút không cho xu, không điểm',T.petCat(c)===0&&T.bondPts(c)===T.BOND.lv[4]+1);
}
// 4. độ vui mục tiêu và xu viễn chinh
{reset();const a=cat(),b=cat();b.bond=T.BOND.lv[3];
  ok('Mỗi tim +'+T.BOND.happy+' vui mục tiêu',T.happyTarget(b)-T.happyTarget(a)===3*T.BOND.happy,T.happyTarget(b)-T.happyTarget(a));
  const d=T.DEST.near||Object.values(T.DEST)[0],ctx={hf:1},ca=T.coinCalc(a,d,ctx).coins,cb=T.coinCalc(b,d,ctx).coins;
  ok('3 tim: xu viễn chinh +'+Math.round(T.BOND.coin*300)+'%',Math.abs(cb/ca-(1+3*T.BOND.coin))<1e-9,(cb/ca).toFixed(3));
  ok('Ước tính chuyến đi cũng tính tim',T.tripInfo(b,d.id).est>T.tripInfo(a,d.id).est);
}
// 5. viễn chinh về +2 điểm
{const S=reset();const c=cat();S.trips=[null];const d=Object.values(T.DEST)[0];ok('Gửi đi được',T.startTrip(0,c.uid,d.id));
  T.setToff(T.TOFF+3*3600000);const r=T.claimTrip(0);ok('Về nhà +'+T.BOND.gain.trip+' điểm',r&&T.bondPts(c)===T.BOND.gain.trip,T.bondPts(c));
}
// 6. ăn món khoái khẩu +3, món khác 0; nước khoái khẩu +1
{reset();const c=cat();const fav=T.favs(c)[0],other=Object.keys(T.FOOD).find(f=>!T.favs(c).includes(f));const bowl={fid:'bowl'};
  T.mealGain(c,bowl,'f',other,1);ok('Ăn món thường không có điểm',T.bondPts(c)===0);
  T.mealGain(c,bowl,'f',fav,1);ok('Ăn món khoái khẩu +'+T.BOND.gain.fav,T.bondPts(c)===T.BOND.gain.fav);
  T.mealGain(c,bowl,'f',fav,.3);ok('Ăn dở dưới nửa suất không có điểm',T.bondPts(c)===T.BOND.gain.fav);
  {const wb={fid:'waterbowl'};T.mealGain(c,wb,'w',T.favDrink(c),1);ok('Uống nước khoái khẩu +'+T.BOND.gain.favw,T.bondPts(c)===T.BOND.gain.fav+T.BOND.gain.favw)}
}
// 7. kết thân
{const S=reset();let acts=[];T.setAct((k,n)=>acts.push(k));
  const a=cat('muop',1),b=cat('muop',1),x=cat('vang',1);b.star=3;
  ok('Bé trùng loài được liệt kê',T.bondDups(a).length===1&&T.bondDups(a)[0]===b);
  ok('Khác loài thì không kết thân',!!T.bondMerge(a.uid,x.uid).err);
  ok('Không tự kết thân với chính mình',!!T.bondMerge(a.uid,a.uid).err);
  const x0=S.coins,rel=S.released|0,r=T.bondMerge(a.uid,b.uid);
  ok('Kết thân: bé kia rời nhà',!r.err&&!S.cats.includes(b)&&S.cats.length===2);
  ok('Nhận điểm theo sao bé trùng (3★ +'+T.BOND.dup[3]+')',T.bondPts(a)===T.BOND.dup[3]&&r.pts===T.BOND.dup[3]);
  ok('Không nhận xu, không tính phóng sinh',S.coins===x0&&(S.released|0)===rel);
  ok('Đếm số lần kết thân và báo nhiệm vụ',S.bondN===1&&acts.includes('bond'));
  const c=cat('muop',1);S.trips=[null];T.startTrip(0,c.uid,Object.values(T.DEST)[0].id);
  ok('Bé đang viễn chinh không bị gộp',!!T.bondMerge(a.uid,c.uid).err&&T.bondDups(a).length===0);
  T.setAct(()=>{});
}
// 8. lưu và tải lại
{const S=reset();const a=cat();T.bondAdd(a,37);T.save();const uid=a.uid;T.load();const b=T.S.cats.find(c=>c.uid===uid);
  ok('Lưu và tải lại giữ điểm',b&&T.bondPts(b)===37);
}
// 9. trọng tài máy chủ nhận bản lưu sau khi kết thân
{const G=(()=>{const cp=require('child_process');return cp})();
  const S=reset();S.rq=[];const a=cat('muop',1),b=cat('muop',2);const old=JSON.parse(JSON.stringify(S));T.bondMerge(a.uid,b.uid);const neu=JSON.parse(JSON.stringify(T.S));
  const out=G.spawnSync(process.execPath,[path.join(R,'tools/guard.js')],{input:JSON.stringify({old,neu,dt:60,issued:[],ack:0,pity:0,gift:{coins:0,tickets:0,cats:[]}})+'\n',encoding:'utf8'});
  const lines=out.stdout.trim().split('\n'),res=JSON.parse(lines[lines.length-1]);
  ok('Trọng tài nhận bản lưu có kết thân',res.ok===1,res.why);
  neu.coins+=50000;const out2=G.spawnSync(process.execPath,[path.join(R,'tools/guard.js')],{input:JSON.stringify({old,neu,dt:60,issued:[],ack:0,pity:0,gift:{coins:0,tickets:0,cats:[]}})+'\n',encoding:'utf8'});
  const l2=out2.stdout.trim().split('\n');ok('Kết thân rồi tự cộng xu vẫn bị bắt',JSON.parse(l2[l2.length-1]).ok===0);
}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
