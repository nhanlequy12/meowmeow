"use strict";
/* ============ TRỌNG TÀI CHỐNG GIAN LẬN (server.py chạy nền bằng Node) ============
   Nạp đúng js/data.js và js/game.js của game, đọc mỗi dòng stdin một yêu cầu JSON, trả mỗi dòng stdout một kết quả JSON.
   server.py gọi mỗi lần người chơi đồng bộ, so bản lưu mới (neu) với bản đã được chấp nhận lần trước (old):
     1. Cấu trúc và giới hạn: số hợp lệ, giống mèo, thuộc tính, nội thất, phòng có thật; không bật "xu vô hạn".
     2. Mèo đã có không được đổi giống, sao, màu, giới tính, thuộc tính, ngày sinh.
     3. Lượt gacha phải dùng đúng thứ tự hàng lượt máy chủ phát (issued); mỗi mèo gacha phải giống hệt kết quả chạy lại gachaCore với cùng hạt giống.
        Mèo mới không qua gacha chỉ được là quà của quản trị viên (gift.cats) hoặc bé khởi đầu 1★ của hướng dẫn tân thủ.
     4. Tổng tài sản V = xu + giá vé × vé + giá mỗi món nội thất + giá phòng + giá một lượt gacha × số mèo chỉ được tăng trong "ngân sách":
        quỹ xu nạp dần theo thời gian thật (theo cấp), cộng thêm phần biết trước (quà quản trị, tiền phóng sinh, bát tặng kèm phòng, quà tân thủ).
        Mua đồ, quay gacha, mua vé không làm V tăng; bán đồ, sửa đồ, cho ăn làm V giảm. Kinh nghiệm cũng có quỹ riêng.
   Yêu cầu: {old, neu, dt (giây), issued:[{q,s}], ack, pity, gift:{coins,tickets,cats:[{sp,star}]}, first, trust, budget:{c,x}}
   Kết quả: {ok:1, used, ack, pity, budget} | {ok:0, why, fresh?, restore?} */
const fs=require('fs'),path=require('path'),readline=require('readline');
const ROOT=path.join(__dirname,'..');
globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
const src=['js/data.js','js/wx-data.js','js/pw-data.js','js/game.js'].map(f=>fs.readFileSync(path.join(ROOT,f),'utf8')).join('\n;\n')+
  '\n;globalThis.G={getS:()=>S,setS:v=>{S=v},gachaCore,prng,releaseGift,SP,FURN,ROOM,STAR,TRAITS,ALLCOAT,RARE,GACHA_COST,TICKET_COST,MAX_LV,PITY,SUP};';
(0,eval)(src);
const {SP,FURN,ROOM,TRAITS,ALLCOAT,GACHA_COST,TICKET_COST,MAX_LV,PITY}=G;

// nhịp kiếm xu, kinh nghiệm tối đa coi là chơi thật (rộng gấp vài lần bot chơi đều tay đo được: khoảng 7.000 xu mỗi giờ ở cuối game)
const RATE_C=lv=>3000+1000*lv, BASE_C=lv=>2000+600*lv, CAP_C=lv=>BASE_C(lv)+4*RATE_C(lv);
const RATE_X=lv=>3000+100*lv, CAP_X=lv=>500+4*RATE_X(lv);
const TUT_GIFT=6000; // quà tân thủ (xu, vé, món đồ) và vài lượt quay trong lúc hướng dẫn

const num=(v,lo,hi)=>typeof v==='number'&&isFinite(v)&&v>=lo&&v<=hi;
const int=(v,lo,hi)=>Number.isInteger(v)&&v>=lo&&v<=hi;
const need=l=>Math.round(30*Math.pow(1.45,Math.min(l,MAX_LV)-1)/5)*5;
const totXp=sv=>{let t=+sv.xp||0;for(let l=1;l<sv.level;l++)t+=need(l);return t};
const sameCat=(a,b)=>a.sp===b.sp&&a.star===b.star&&(a.coat||'')===(b.coat||'')&&a.sex===b.sex&&JSON.stringify(a.traits)===JSON.stringify(b.traits);
function value(sv){
  let v=sv.coins+TICKET_COST*sv.tickets+GACHA_COST*sv.cats.length;
  sv.items.forEach(i=>{v+=FURN[i.fid].price});
  for(const r in sv.rooms)v+=ROOM[r].price||0;
  const sup=(id,q)=>{const s=G.SUP[id];if(s&&q>0)v+=s.price*q};               // vật phẩm sinh tồn trong túi đồ và đang mang theo trong chuyến đi
  Object.entries(sv.inv||{}).forEach(([id,q])=>sup(id,+q||0));
  sv.trips.forEach(p=>{if(p&&p.kit)Object.entries(p.kit).forEach(([id,q])=>sup(id,+q||0))});
  return v;
}
// lỗi cấu trúc: trả lý do, hoặc '' nếu ổn
function bad(sv){
  if(!sv||typeof sv!=='object')return 'Bản lưu không đọc được';
  if(!Array.isArray(sv.cats)||!Array.isArray(sv.items)||!Array.isArray(sv.trips)||!sv.rooms||typeof sv.rooms!=='object')return 'Bản lưu thiếu phần bắt buộc';
  if(!num(sv.coins,0,2e9))return 'Số xu không hợp lệ';
  if(!int(sv.tickets,0,1e6))return 'Số vé không hợp lệ';
  if(!int(sv.level,1,200)||!num(sv.xp,0,1e7))return 'Cấp hoặc kinh nghiệm không hợp lệ';
  if(sv.cats.length>3000||sv.items.length>5000)return 'Quá nhiều mèo hoặc nội thất';
  if(sv.adm&&sv.adm.inf)return 'Bật "xu vô hạn" của bảng Admin';
  const uid=new Set();
  for(const c of sv.cats){
    if(!c||!int(c.uid,0,1e9)||uid.has(c.uid))return 'Mã mèo trùng hoặc sai';uid.add(c.uid);
    if(!SP[c.sp])return 'Giống mèo không có trong game: '+String(c.sp).slice(0,30);
    if(!int(c.star,1,5))return 'Số sao không hợp lệ';
    if(!Array.isArray(c.traits)||c.traits.length>6||c.traits.some(t=>!TRAITS[t]))return 'Thuộc tính không hợp lệ';
    if(c.coat!=null&&!ALLCOAT[c.coat])return 'Màu lông không có trong game';
    if(!num(c.full,0,100.5)||!num(c.en,0,100.5)||!num(c.hp,0,100.5))return 'Chỉ số mèo không hợp lệ';
    if((c.he!=null&&!num(c.he,0,100.5))||(c.wa!=null&&!num(c.wa,0,100.5))||(c.cf!=null&&!num(c.cf,0,100.5)))return 'Chỉ số sức khỏe, nước, thoải mái không hợp lệ';
  }
  const iid=new Set();
  for(const i of sv.items){if(!i||!FURN[i.fid]||iid.has(i.iid))return 'Nội thất không hợp lệ';iid.add(i.iid)}
  for(const r in sv.rooms)if(!ROOM[r])return 'Phòng không có trong game';
  if(sv.inv!=null&&(typeof sv.inv!=='object'||Object.entries(sv.inv).some(([id,q])=>!G.SUP[id]||!int(q,0,1e5))))return 'Túi đồ không hợp lệ';
  return '';
}
// chạy lại một lượt gacha bằng hạt giống, với bảo hiểm pity: trả mèo và pity sau lượt đó.
// pity ở máy chủ là một số gộp: bộ đếm 4★ (S.pity) + 100 × bộ đếm 5★ (S.pity5)
function replay(seed,pity,opt){
  const R0=Math.random;Math.random=G.prng(seed);
  G.setS({pity:pity%100,pity5:Math.floor(pity/100),nid:1,seen:{},seenCoat:{},seenRare:{},cats:[],rooms:{},items:[],trips:[null],level:1,xp:0,coins:0,tickets:0});
  try{const c=G.gachaCore(Object.assign({},opt)).cat;return {cat:{sp:c.sp,star:c.star,coat:c.coat,sex:c.sex,traits:c.traits},pity:G.getS().pity+100*(G.getS().pity5||0)}}
  finally{Math.random=R0}
}
function judge(o){
  const N=o.neu,O=o.old,gift=o.gift||{coins:0,tickets:0,cats:[]},iss=o.issued||[];
  let why=bad(N);if(why&&!o.trust)return {ok:0,why};
  // lượt gacha đã dùng (bỏ những lượt máy chủ đã ghi nhận ở lần trước) phải đúng thứ tự hàng lượt
  const used=(Array.isArray(N.rqUsed)?N.rqUsed:[]).filter(u=>u&&u.q>o.ack);
  if(used.length>iss.length)return {ok:0,why:'Dùng nhiều lượt gacha hơn máy chủ đã phát'};
  for(let i=0;i<used.length;i++)if(used[i].q!==iss[i].q)return {ok:0,why:'Dùng lượt gacha sai thứ tự'};
  const tutOpen=o.first||(O&&O.tut&&!O.tut.done);
  let pity=o.pity,tutRoll=tutOpen?1:0;const exp=new Map();
  for(let i=0;i<used.length;i++){
    if(used[i].t&&!tutRoll&&!o.trust)return {ok:0,why:'Lượt gacha tân thủ không hợp lệ'};
    if(used[i].t)tutRoll=0;
    const r=replay(iss[i].s,pity,used[i].t?{min:4,max:4}:{});exp.set(used[i].q,r.cat);pity=r.pity;
  }
  const res={ok:1,used:used.length,ack:used.length?used[used.length-1].q:o.ack,pity};
  if(o.trust){res.budget=o.budget;return res}
  // ván mới (hồ sơ mới hoặc vừa bị quản trị viên đặt lại): chỉ nhận bản lưu còn non, chưa có tiến độ lớn
  if(o.first||!O){
    const n5=N.cats.filter(c=>c.star===5).length,n4=N.cats.filter(c=>c.star>=4).length,nr=Object.keys(N.rooms).length;
    if(N.level>4||N.coins+TICKET_COST*N.tickets>3000||N.cats.length>8||n5>1||n4>3||N.items.length>15||nr>2)
      return {ok:0,fresh:1,why:'Bản lưu trên máy đã có sẵn tiến độ (cấp '+N.level+', '+N.cats.length+' mèo) trước khi vào máy chủ'};
    res.budget={c:BASE_C(N.level),x:500};return res;
  }
  if((N.nid|0)<(O.nid|0))return {ok:0,restore:1,why:'Bản lưu trên máy cũ hơn bản trên máy chủ'};
  // mèo đã có không được đổi giống, sao, màu, giới tính, thuộc tính, ngày sinh (trừ lúc game tự nâng cấp bản lưu)
  const mig=['mig5','mig6','mig7'].some(k=>!!O[k]!==!!N[k]);
  const om=new Map(O.cats.map(c=>[c.uid,c])),nm=new Set(N.cats.map(c=>c.uid));
  if(!mig)for(const c of N.cats){const p=om.get(c.uid);if(p&&(!sameCat(p,c)||(p.born||0)!==(c.born||0)||(p.q||0)!==(c.q||0)))return {ok:0,why:'Mèo "'+String(c.name).slice(0,16)+'" bị đổi giống, sao, màu, giới tính hoặc thuộc tính'}}
  // mèo mới: gacha thì phải khớp kết quả chạy lại; ngoài gacha chỉ có quà quản trị viên và bé khởi đầu
  const gifts=(gift.cats||[]).slice();let starter=tutOpen?1:0,nfree=0;
  for(const c of N.cats){
    if(om.has(c.uid))continue;
    if(c.q){const e=exp.get(c.q);if(!e)return {ok:0,why:'Mèo gacha không có lượt hợp lệ'};
      if(!sameCat(e,c))return {ok:0,why:'Mèo gacha khác kết quả máy chủ ('+(SP[c.sp]?SP[c.sp].n:c.sp)+' '+c.star+'★)'};exp.delete(c.q);continue}
    const gi=gifts.findIndex(g=>g.sp===c.sp&&(!g.star||g.star===c.star));
    if(gi>=0){gifts.splice(gi,1);nfree++;continue}
    if(starter&&c.star===1){starter=0;nfree++;continue}
    return {ok:0,why:'Có mèo không rõ nguồn gốc ('+SP[c.sp].n+' '+c.star+'★)'};
  }
  // mèo mất đi chỉ được tính tiền phóng sinh trong giới hạn số lần phóng sinh
  const gone=O.cats.filter(c=>!nm.has(c.uid)).concat([...exp.values()]);
  const dRel=Math.max(0,(N.released|0)-(O.released|0));
  const refund=gone.map(c=>{const g=G.releaseGift(c);return g.coins+TICKET_COST*g.ticket}).sort((a,b)=>a-b).slice(0,dRel).reduce((a,b)=>a+b,0);
  const newRooms=Object.keys(N.rooms).filter(r=>!O.rooms[r]).length;
  const water=FURN.waterbowl?FURN.waterbowl.price:0,wxMig=!O.wxMig&&N.wxMig?Object.keys(N.rooms).length:0; // bát nước tặng mỗi phòng (một lần) và kèm phòng mới
  // quà của hướng dẫn thời tiết (js/tut-wx.js): một thiết bị chạy pin và 200 xu + 1 vé, mỗi phần một lần
  const g0=(O.tut&&O.tut.got)||{},g1=(N.tut&&N.tut.got)||{};
  const wxGift=(g1.wxdev&&!g0.wxdev?Math.max(FURN.bheater.price,FURN.bfan.price):0)+(g1.wxrw&&!g0.wxrw?200+TICKET_COST:0);
  // quà hướng dẫn điện năng (js/tut-pw.js): ổ điện (đơn hoặc chống nước, có thể kèm quạt pin nếu chưa có thiết bị) + 50 xu; thưởng 150 xu
  const pwGift=(g1.pwgift&&!g0.pwgift?Math.max(FURN.out1.price,FURN.outwet.price)+FURN.bfan.price+50:0)+(g1.pwrw&&!g0.pwrw?150:0);
  const known=(gift.coins||0)+TICKET_COST*(gift.tickets||0)+GACHA_COST*nfree+refund+newRooms*(FURN.bowl.price+water)+wxMig*water+(tutOpen?TUT_GIFT:0)+wxGift+pwGift;
  const lv=Math.min(O.level,MAX_LV),hr=Math.max(0,o.dt)/3600;
  let bc=Math.min(CAP_C(lv),(o.budget&&o.budget.c!=null?o.budget.c:CAP_C(lv))+RATE_C(lv)*hr);
  const needC=value(N)-value(O)-known;
  if(needC>bc+1)return {ok:0,why:'Tài sản tăng quá nhanh: +'+Math.round(needC).toLocaleString('vi-VN')+' xu trong '+Math.round(o.dt)+' giây (quỹ cho phép '+Math.round(bc).toLocaleString('vi-VN')+')'};
  bc-=Math.max(0,needC);
  let bx=Math.min(CAP_X(lv),(o.budget&&o.budget.x!=null?o.budget.x:CAP_X(lv))+RATE_X(lv)*hr);
  const needX=totXp(N)-totXp(O)-3*used.length-20*newRooms-(tutOpen?300:0);
  if(needX>bx+1)return {ok:0,why:'Kinh nghiệm tăng quá nhanh: +'+Math.round(needX)+' trong '+Math.round(o.dt)+' giây'};
  bx-=Math.max(0,needX);
  res.budget={c:bc,x:bx};
  return res;
}
const rl=readline.createInterface({input:process.stdin,terminal:false});
rl.on('line',line=>{
  let out;
  try{out=judge(JSON.parse(line))}catch(e){out={ok:0,err:1,why:'Lỗi trọng tài: '+e.message}}
  process.stdout.write(JSON.stringify(out)+'\n');
});
process.stdout.write(JSON.stringify({ready:1,pity:PITY})+'\n');
