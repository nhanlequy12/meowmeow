"use strict";
/* ============ NƯỚC UỐNG, BỆNH TẬT, THUỐC, BỆNH VIỆN: LUẬT (không đụng DOM) ============
   Nạp sau js/pw.js, trước js/ui.js. Cấu hình ở js/med-data.js. game.js gọi: medCat (mỗi bé, sau wxCat), medTick (cuối tick), medHappy, medRegen,
   medTripWhy, medTripSlow (tripInfo), medTripClaim (claimTrip). Bé đang nằm viện được onTrip() coi như đi vắng nên không ở trong phòng, không đi viễn chinh.
   - Nước: bát nước giữ danh sách loại nước b.wl (b.w là số lượt còn lại); fillWater rót từ túi đồ; wxDrink cho bé uống đúng loại nước trong bát.
   - Bệnh: medAdd, medCure; triệu chứng mỗi phút trong medCat; bệnh nhẹ tự khỏi khi nghỉ ở chỗ tốt; lúc vắng mặt không phát bệnh mới và có mức sàn WXC.away.
   - Thuốc: medCan (dùng được không, vì sao), medUse (trừ đúng một món, lưu ngay). Bệnh viện: hospPlan (xem trước), hospAdmit, ra viện trong medTick. */
const medOpen=()=>!!(S&&(S.medU||S.level>=MED_LV));
const medS=()=>S.med||(S.med={n:1,seed:(Math.random()*0x7fffffff)|0,log:[],news:[]});
const inHosp=uid=>!!(S.hosp&&S.hosp[uid]);
const ills=c=>(c&&c.ill)||[];
const illBy=(c,eid)=>ills(c).find(e=>e.eid===eid);
const onTripReal=uid=>S.trips.some(p=>p&&p.uid===uid);
// trạng thái ngắn của bé: ok, ill (đang ốm), inj (bị thương), sev (nghiêm trọng), hosp (đang điều trị)
function medStatus(c){
  if(inHosp(c.uid))return 'hosp';const L=ills(c);if(!L.length)return 'ok';
  if(L.some(e=>DIS[e.k].sev>=3))return 'sev';return L.every(e=>DIS[e.k].inj)?'inj':'ill';
}
const medSev=c=>ills(c).reduce((a,e)=>Math.max(a,DIS[e.k].sev),0);
function medLog(c,ev,o){const M=medS();M.log.unshift(Object.assign({t:now(),uid:c.uid,name:c.name,ev},o||{}));if(M.log.length>MEDC.logMax)M.log.length=MEDC.logMax}

/* ---------- nước uống ---------- */
const drinkStock=()=>DRINKS.reduce((a,w)=>a+invN(w.id),0);
// danh sách loại nước trong bát, luôn dài đúng b.w; bát từ bản lưu cũ chưa ghi loại thì coi là Nước lọc
function bowlList(b){const n=Math.max(0,b.w|0);let l=Array.isArray(b.wl)?b.wl:[];if(l.length>n)l=l.slice(l.length-n);while(l.length<n)l.unshift('w_plain');return b.wl=l}
function pourBowl(b,did,max){
  const cap=FURN[b.fid].water.cap,l=bowlList(b),n=Math.min(cap-l.length,invN(did),max==null?99:max);if(n<=0)return 0;
  S.inv[did]-=n;for(let i=0;i<n;i++)l.push(did);b.w=l.length;return n;
}
const drinkDefault=()=>{const M=medS();return M.wd&&invN(M.wd)>0?M.wd:(DRINKS.find(w=>invN(w.id)>0)||{}).id};
const waterNeed=rid=>wbowls(rid).reduce((a,b)=>a+Math.max(0,FURN[b.fid].water.cap-(b.w|0)),0);
function buyDrink(id,n){
  const w=DRINK[id];n=Math.max(1,n|0);if(!w)return {err:'Không có loại nước này.'};const cost=w.price*n;
  if(S.coins<cost)return {err:'Không đủ xu: cần '+cost.toLocaleString('vi-VN')+' xu.'};
  S.coins-=cost;S.inv=S.inv||{};S.inv[id]=invN(id)+n;save();return {n,cost};
}
// rót nước trong kho vào mọi bát của phòng; bỏ trống did thì dùng loại lần trước, hết thì loại rẻ nhất đang có. Trả {n: số chai đã rót, id} hoặc {err}
fillWater=function(rid,did){
  S.inv=S.inv||{};const bs=wbowls(rid).filter(b=>!b.broken);if(!bs.length)return {err:'Phòng này chưa có bát nước.'};
  if(!waterNeed(rid))return {err:'Các bát nước đều đang đầy.',full:1};
  did=did&&DRINK[did]?did:drinkDefault();if(!did||invN(did)<1)return {err:'Hết nước trong kho. Mua ở Cửa hàng, mục 🥤 Nước uống.',empty:1};
  let n=0;bs.forEach(b=>{n+=pourBowl(b,did)});if(n){medS().wd=did;save()}return {n,id:did};
};
wxDrink=function(rid){
  const bs=wbowls(rid).filter(b=>!b.broken);if(!bs.length)return;S.inv=S.inv||{};
  // máy lọc nước: 10 phút một lần rót nước đang có trong kho cho đầy, loại rẻ trước; kho hết thì thôi (không tự tạo nước)
  bs.forEach(b=>{const W=FURN[b.fid].water;if(W.auto&&!(typeof pwOff==='function'&&pwOff(b))&&now()>=(b.wat||0)){b.wat=now()+600000;for(const w of DRINKS){if((b.w|0)>=W.cap)break;pourBowl(b,w.id)}}});
  homeCats(rid).filter(c=>(c.wa==null?100:c.wa)<WXC.water.drinkAt).sort((a,b)=>a.wa-b.wa).forEach(c=>{
    const b=bs.find(b=>(b.w||0)>0);if(!b)return;const W=FURN[b.fid].water,l=bowlList(b),w=DRINK[l.pop()]||DRINK.w_plain,hotNow=wxOpen()&&roomClimate(rid).T>WXC.hotAt;
    b.w=l.length;c.wa=Math.min(100,c.wa+w.wa+(W.cool&&hotNow?10:0));const x=wxs(c);x.hx=Math.max(0,x.hx-(W.cool?40:20)-(w.cool||0));
    if(w.he)c.he=clamp((c.he==null?100:c.he)+w.he,0,100);if(w.cf)c.cf=clamp((c.cf==null?60:c.cf)+w.cf,0,100);if(W.happy)c.hp=clamp(c.hp+W.happy,0,100);
    c.drink={iid:b.iid,t:now()};
  });
};

/* ---------- bệnh ---------- */
function medAdd(c,k,quiet){
  const D=DIS[k];if(!D||ills(c).some(e=>e.k===k))return null;const M=medS(),e={eid:M.n++,k,t:now(),tries:0};
  (c.ill=c.ill||[]).push(e);if(D.wx){const x=wxs(c);if(!x.sk)x.sk=WXC.sick.start}
  medLog(c,'ill',{k});
  if(!quiet)notify((D.inj?'bị ':'mắc ')+D.n.toLowerCase()+'. '+(D.hosp?'Cần đưa bé đến bệnh viện ngay.':'Ghé Nhà thuốc & Bệnh viện thú y để chữa.'),{icon:D.ic,title:c.name,key:'medill'});
  return e;
}
function medCure(c,e,how,o){
  c.ill=ills(c).filter(x=>x!==e);if(!c.ill.length)delete c.ill;if(DIS[e.k].wx)wxs(c).sk=0;
  c.imm=now()+MEDC.immune*MIN;if(how!=='quiet')medLog(c,how||'cure',Object.assign({k:e.k},o||{}));
}
// hệ số triệu chứng của một đợt bệnh: thuốc giảm triệu chứng còn tác dụng thì nhẹ đi, đã nẹp thì nhẹ đi
const illK=e=>(now()<(e.rel||0)?MEDC.reliefK:1)*(e.sp?MEDC.splintK:1);
const medHappy=c=>{let h=0;if(!wxOpen()&&(c.wa==null?100:c.wa)<WXC.water.low)h-=15;ills(c).forEach(e=>{h-=(DIS[e.k].fx.hp||0)*40*illK(e)*(DIS[e.k].wx?.4:1)});return Math.max(-30,h)};
const medRegen=c=>{let k=!wxOpen()&&(c.wa==null?100:c.wa)<WXC.water.low?.7:1;ills(c).forEach(e=>{if(DIS[e.k].wx)return;const s=[1,.9,.75,.5][DIS[e.k].sev];k=Math.min(k,1-(1-s)*illK(e))});return k};
// gọi mỗi bé mỗi tick, sau wxCat. sim: đang bù thời gian vắng mặt
function medCat(c,dt,sim){
  const m=dt/60,away=!!sim,W=WXC,trip=onTripReal(c.uid);
  if(c.he==null)c.he=100;if(c.wa==null)c.wa=100;if(c.cf==null)c.cf=60;
  if(!wxOpen()){ // trước khi có thời tiết: chỉ có khát nước, nhịp như lúc có thời tiết, không ảnh hưởng sức khỏe
    c.wa=clamp(c.wa-W.water.decay*m*(trip?W.water.trip:1),away?Math.min(c.wa,W.away.water):0,100);
    if(!trip&&c.wa<=0)c.en=clamp(c.en-.2*m,away?Math.min(c.en,W.away.en):0,100);
    return;
  }
  if(!medOpen()||trip)return;
  const x=wxs(c),F=wxFeel(c),rc=F.rc,fl=MEDC.floor;
  // cảm lạnh là trạng thái Ốm của js/wx.js: ghi thành một đợt bệnh để chữa ở nhà thuốc; wx.js tự cho khỏi khi nghỉ chỗ tốt
  const cold=ills(c).find(e=>e.k==='cold');
  if(x.sk>0&&!cold)medAdd(c,'cold',1);else if(cold&&!(x.sk>0))medCure(c,cold,'self'); // wx.js đã tự thông báo lúc bé bị cảm và lúc khỏi
  const good=rc.comfort>=60&&c.wa>=W.water.low&&F.feel>=W.coldAt&&F.feel<=W.hotAt;
  ills(c).slice().forEach(e=>{
    const D=DIS[e.k],k=illK(e);
    if(D.wx){if(k<1){c.he=clamp(c.he+W.sick.health*(1-k)*m,0,100)}return}
    const f=D.fx,lo=D.sev>=3?fl.he3:fl.he;
    if(f.en)c.en=clamp(c.en-f.en*k*m,Math.min(c.en,fl.en),100);
    if(f.wa)c.wa=clamp(c.wa-f.wa*k*m,Math.min(c.wa,fl.wa),100);
    if(f.he)c.he=clamp(c.he-f.he*k*m,Math.min(c.he,lo),100);
    // tự khỏi: chấn thương nhẹ cứ nghỉ ở nhà là lành; bệnh nhẹ cần chỗ dễ chịu, đủ nước; nằm ổ thì nhanh gấp đôi. Mất nước cần uống đủ nước trở lại
    if(D.self&&(D.inj||(e.k==='dehyd'?c.wa>=W.water.drinkAt:good))){e.sr=(e.sr||0)+m*(F.bi?2:1);if(e.sr>=D.self){medCure(c,e,'self');if(!away)notify('đã khỏi '+D.n.toLowerCase()+'.',{icon:'😺',title:c.name,key:'medwell'})}}
  });
  if(away)return;
  x.dq=c.wa<=MEDC.dryAt?(x.dq||0)+m:0;
  // bệnh nặng thêm khi để lâu
  const age=k=>{const e=ills(c).find(e=>e.k===k);return e?(now()-e.t)/MIN:-1},roll=p=>p>0&&Math.random()<1-Math.pow(1-p,m);
  if(age('cold')>120&&roll(.003))medAdd(c,'fever');
  if(age('digest')>90&&roll(.004))medAdd(c,'diarrhea');
  // bệnh mới do môi trường: không khi vừa khỏi bệnh, không quá MEDC.maxIll bệnh một bé, không khi trong nhà đã nhiều bé bệnh
  if(now()<(c.imm||0)||ills(c).filter(e=>!DIS[e.k].inj).length>=MEDC.maxIll)return;
  const sickN=S.cats.filter(o=>ills(o).some(e=>!DIS[e.k].inj)).length;
  // ca nguy hiểm do nóng lạnh cực độ và mất nước không bị giới hạn theo số bé bệnh trong nhà (nguyên nhân rõ ràng, xử lý được)
  if(F.feel>W.scorchAt&&x.hx>=330&&roll(.01)){medAdd(c,'heatstroke');return}
  if(F.feel<W.freezeAt&&x.cx>=330&&roll(.01)){medAdd(c,'hypo');return}
  if(x.dq>=MEDC.dryMin&&roll(.05)){medAdd(c,'dehyd');return}
  if(x.hx>W.sickAt&&roll(.004*(x.hx-W.sickAt)/100)){medAdd(c,'heatex');return}
  if(sickN>=Math.max(1,Math.ceil(S.cats.length*MEDC.houseCap)))return;
  const R=ROOM_CLIMATE[c.room]||{},spring=wxSeason(wxClock()).id==='spring',pure=rc.D.on.some(d=>d.f.id==='airpurifier');
  const P=[['fever',c.he<40?.0015:0],['derm',rc.hum>=80||x.wet>=W.wetSt?.0006:0],['digest',c.full<=5?.002:0],['eye',rc.wind>=.4?.0008:0],
    ['allergy',spring&&!pure&&(R.out||c.room==='greenhouse')?.0005:0],['stress',(c.fr>0?.003:0)+(rc.noise>=.5?.0008:0)]];
  for(const [k,p] of P)if(roll(p)){medAdd(c,k);break}
}

/* ---------- thuốc ---------- */
// lý do KHÔNG dùng được món m cho đợt bệnh e của bé c ('' là dùng được)
function medCan(c,e,m){
  if(!m)return 'Không có món này.';if(!medOpen())return 'Nhà thuốc mở ở cấp '+MED_LV+'.';
  if(inHosp(c.uid))return 'Bé đang nằm viện.';if(onTripReal(c.uid))return 'Bé đang đi viễn chinh.';
  if(m.tonic){if(ills(c).length)return 'Bé đang bệnh, cần chữa trước.';if(now()<(c.ton||0))return 'Vừa dùng, chờ '+Math.ceil((c.ton-now())/MIN)+' phút nữa.';return ''}
  if(!e)return 'Chọn một bệnh để chữa.';const D=DIS[e.k];
  if(m.kind==='sym'){if(!m.grp.includes(D.grp))return 'Không hợp với '+D.n.toLowerCase()+'.';if(now()<(e.rel||0))return 'Thuốc trước còn tác dụng '+Math.ceil((e.rel-now())/MIN)+' phút.';return ''}
  if(m.kind==='cure'){if(D.hosp)return 'Ca nghiêm trọng: chỉ bệnh viện chữa được.';if(D.inj)return 'Chấn thương không chữa bằng thuốc.';if(e.fail||e.tries>=MEDC.tries)return 'Đã thử đủ '+MEDC.tries+' lần: cần đưa bé đến bệnh viện.';return ''}
  if(m.cure)return m.cure.includes(e.k)?'':'Không hợp với '+D.n.toLowerCase()+'.';
  if(m.splint)return !m.splint.includes(e.k)?'Chỉ dùng cho bong gân, gãy chân.':e.sp?'Đã nẹp rồi.':'';
  return 'Không dùng được.';
}
// dùng một món cho bé; trừ đúng một món và lưu ngay. Trả {ok, cured, fail, left} hoặc {err}
function medUse(uid,eid,id){
  const c=catBy(uid),m=MED[id];if(!c||!m)return {err:'Không dùng được.'};if(invN(id)<1)return {err:'Hết '+m.n+'. Mua ở quầy thuốc.'};
  const e=eid!=null?illBy(c,eid):null,why=medCan(c,e,m);if(why)return {err:why};
  S.inv[id]--;const r={ok:1,m,c};
  if(m.tonic){c.en=clamp(c.en+MEDC.tonic.en,0,100);c.he=clamp(c.he+MEDC.tonic.he,0,100);c.ton=now()+MEDC.tonic.cd*MIN;medLog(c,'med',{item:id});save();return r}
  const D=DIS[e.k];r.D=D;
  if(m.kind==='sym'){e.rel=now()+MEDC.relief*MIN;if(m.hp)c.hp=clamp(c.hp+m.hp,0,100);if(m.en)c.en=clamp(c.en+m.en,0,100);if(m.wa)c.wa=clamp(c.wa+m.wa,0,100);medLog(c,'med',{k:e.k,item:id})}
  else if(m.kind==='cure'){
    // bốc bằng hạt giống riêng của đợt bệnh và lần thử: không phụ thuộc lúc bấm, kết quả lưu ngay
    const M=medS(),x=prng((M.seed^Math.imul(e.eid,0x9E3779B1)^Math.imul(e.tries+1,0x85EBCA77))|0)();
    if(x<m.rate){medCure(c,e,'cure',{item:id});r.cured=1}
    else{e.tries++;e.rel=Math.max(e.rel||0,now()+MEDC.relief*MIN);if(e.tries>=MEDC.tries)e.fail=1;r.fail=1;r.left=MEDC.tries-e.tries;medLog(c,'fail',{k:e.k,item:id})}
  }
  else if(m.cure){medCure(c,e,'cure',{item:id});r.cured=1}
  else if(m.splint){e.sp=1;medLog(c,'med',{k:e.k,item:id})}
  save();return r;
}
function buyMed(id,n){
  const m=MED[id]||(SUP[id]&&SUP[id].med?SUP[id]:null);n=Math.max(1,n|0);if(!m)return {err:'Không có món này.'};if(!medOpen())return {err:'Nhà thuốc mở ở cấp '+MED_LV+'.'};
  const cost=m.price*n;if(S.coins<cost)return {err:'Không đủ xu: cần '+cost.toLocaleString('vi-VN')+' xu.'};
  S.coins-=cost;S.inv=S.inv||{};S.inv[id]=invN(id)+n;save();return {n,cost};
}

/* ---------- bệnh viện ---------- */
// xem trước một lần nhập viện: chữa mọi bệnh bé đang có. Trả {c, list:[{e, D, cost}], total, pay, min, charity, complex} hoặc {err}
function hospPlan(uid){
  const c=catBy(uid);if(!c)return {err:'Không tìm thấy bé.'};if(inHosp(uid))return {err:c.name+' đang nằm viện.'};if(onTripReal(uid))return {err:c.name+' đang đi viễn chinh.'};
  const L=ills(c);if(!L.length)return {err:c.name+' đang khỏe mạnh.'};
  const inj=L.filter(e=>DIS[e.k].inj),complex=inj.length>=2&&inj.some(e=>DIS[e.k].sev>=3);
  const list=L.map(e=>({e,D:DIS[e.k],cost:complex&&DIS[e.k].inj?0:DIS[e.k].cost}));
  const total=list.reduce((a,x)=>a+x.cost,0)+(complex?MED_COMPLEX:0),sev=L.some(e=>DIS[e.k].sev>=3),coins=Math.floor(S.coins);
  const o={c,list,total,complex,pay:total,min:MEDC.hospMin,charity:0};
  if(coins<total){if(!sev)return Object.assign(o,{err:'Không đủ xu: cần '+total.toLocaleString('vi-VN')+' xu.'});o.charity=1;o.pay=coins;o.min=MEDC.hospMin*MEDC.charityK}
  return o;
}
function hospAdmit(uid){
  const p=hospPlan(uid);if(p.err)return p;const c=p.c;
  S.coins-=p.pay;S.hosp=S.hosp||{};
  S.hosp[uid]={t0:now(),until:now()+p.min*MIN,eids:p.list.map(x=>x.e.eid),ks:p.list.map(x=>x.e.k),cost:p.pay,ch:p.charity};
  delete c.bed;delete c.bk;delete c.bm;
  medLog(c,'hosp',{ks:S.hosp[uid].ks,cost:p.pay,ch:p.charity});save();return p;
}
const hospLeft=uid=>inHosp(uid)?Math.max(0,S.hosp[uid].until-now()):0;
function hospOut(uid){
  const h=S.hosp[uid],c=catBy(uid);delete S.hosp[uid];if(!c)return;
  ills(c).filter(e=>h.eids.includes(e.eid)).forEach(e=>medCure(c,e,'quiet'));medLog(c,'out',{ks:h.ks}); // một dòng hồ sơ cho cả đợt nằm viện
  const O=MEDC.out,x=wxs(c);c.en=Math.max(c.en,O.en);c.he=Math.max(c.he==null?100:c.he,O.he);c.full=Math.max(c.full,O.full);c.wa=Math.max(c.wa==null?100:c.wa,O.wa);x.cx=x.hx=x.wet=x.sk=0;x.ex=0;
  if(c.room==='wait'&&typeof fillWait==='function')fillWait();
  medS().news.push({uid,name:c.name,ks:h.ks});
}

/* ---------- viễn chinh ---------- */
const medTripWhy=c=>{if(inHosp(c.uid))return 'Đang nằm viện';const e=ills(c).find(e=>DIS[e.k].noTrip);return e?'Đang '+DIS[e.k].n.toLowerCase()+', cần đến bệnh viện':''};
const medTripSlow=c=>ills(c).reduce((a,e)=>a*(DIS[e.k].slow||1),1);
// xác suất tai nạn của một chuyến: {minor, sprain, frac}
function injOdds(did,cps,min,kit){
  const dg=(DEST_CLIMATE[did]||{}).danger||0,bad=Math.max(0,...(cps||[]).map(t=>(WX[t]||{}).bad||0)),durK=clamp(min/40,.5,1.5);
  let res=0,frac=1,soft=0,bag=0;Object.entries(kit||{}).forEach(([id,q])=>{const s=SUP[id];if(!s||!q)return;res+=s.inj||0;if(s.frac)frac*=s.frac;if(s.soft)soft=Math.max(soft,s.soft);if(s.medbag)bag=1});
  const K=(1+INJ.wx*bad)*durK*(1-Math.min(WXC.resCap,res)),P=a=>(a[0]+dg*a[1])*K;
  return {minor:P(INJ.minor),sprain:P(INJ.sprain),frac:dg>=INJ.fracFrom?P(INJ.frac)*frac:0,soft,bag};
}
// gọi trong claimTrip sau wxTripClaim: tai nạn ngẫu nhiên theo điểm đến, thời tiết, thời gian và đồ bảo hộ
function medTripClaim(p,c,res,d){
  if(!medOpen()||ills(c).some(e=>DIS[e.k].sev>=3))return;
  const o=injOdds(p.dest,p.cps,d.min,p.kit),r=Math.random(),L=res.wx?res.wx.lines:[];
  let lv=r<o.frac?3:r<o.frac+o.sprain?2:r<o.frac+o.sprain+o.minor?(Math.random()<.5?1:0):-1;if(lv<0)return;
  if(lv>0&&o.soft&&Math.random()<o.soft){lv--;L.push('🛡️ Bộ đệm chống va đập đỡ cho bé: chấn thương nhẹ đi một bậc.')}
  const bag=o.bag&&lv>=1&&lv<=2&&invN('medbag')>0;if(bag)S.inv.medbag--;
  if(c.he==null)c.he=100;
  if(lv===0){c.en=clamp(c.en-INJ.stumbleEn,0,100);L.push('💫 Bé vấp ngã trên đường (-'+INJ.stumbleEn+'⚡).')}
  else if(lv===1){if(bag)L.push('👜 Bé bị trầy xước, Túi y tế viễn chinh đã xử lý tại chỗ.');else{c.he=Math.max(10,c.he-INJ.scratchHe);medAdd(c,'scratch',1);L.push('🩹 Bé bị trầy xước (-'+INJ.scratchHe+' sức khỏe).')}}
  else if(lv===2){const e=medAdd(c,'sprain',1);if(bag){if(e)e.sp=1;L.push('👜 Bé bị bong gân, Túi y tế viễn chinh đã nẹp sẵn cho bé.')}else{c.he=Math.max(10,c.he-INJ.sprainHe);L.push('🦶 Bé bị bong gân (-'+INJ.sprainHe+' sức khỏe).')}}
  else{const k=Math.random()<.5?'fracF':'fracH';medAdd(c,k,1);c.he=Math.max(10,c.he-INJ.fracHe);L.push('🦴 Bé bị '+DIS[k].n.toLowerCase()+' (-'+INJ.fracHe+' sức khỏe). Cần đưa bé đến bệnh viện.')}
  if(lv>=1&&!(lv===1&&bag)){if(res.wx&&res.wx.out==='ok'){res.wx.out='minor';if(S.tlog&&S.tlog[0]&&S.tlog[0].lines===L)S.tlog[0].out='minor'}
    res.inj=lv;notify(lv>=3?'bị gãy chân khi viễn chinh. Cần đưa bé đến bệnh viện.':'bị thương khi viễn chinh. Ghé Nhà thuốc & Bệnh viện thú y.',{icon:lv>=3?'🦴':'🩹',title:c.name+' · '+d.n,key:'medinj'})}
}

/* ---------- mỗi tick ---------- */
function medHospCat(c){const O=MEDC.out;c.full=Math.max(c.full,O.full);if(c.wa!=null)c.wa=Math.max(c.wa,O.wa)}
function medTick(dt,sim){
  const M=medS();S.inv=S.inv||{};M.news=M.news||[];
  if(!S.wxMig){ownedRooms().forEach(r=>{if(!wbowls(r.id).length)giveWater(r.id)});S.wxMig=1}
  if(!M.gw){S.inv.w_plain=invN('w_plain')+MEDC.starter;M.gw=1} // quà một lần khi nước bắt đầu phải mua
  if(!wxOpen())ownedRooms().forEach(r=>wxDrink(r.id));
  if(S.level>=MED_LV&&!S.medU)S.medU=1;
  if(S.hosp)Object.keys(S.hosp).forEach(uid=>{if(now()>=S.hosp[uid].until)hospOut(+uid)});
  if(sim)return;
  if(M.news.length){M.news.splice(0).forEach(n=>notify('đã ra viện và về nhà, khỏi '+n.ks.map(k=>DIS[k].n.toLowerCase()).join(', ')+'.',{icon:'🏥',title:n.name,key:'medout'}));save()}
  // cảnh báo nước: kho sắp hết, hoặc có bé khát mà bát cạn
  if(S.tut&&S.tut.done&&now()>=(M.lowAt||0)){
    const st=drinkStock(),dry=ownedRooms().filter(r=>homeCats(r.id).some(c=>(c.wa==null?100:c.wa)<WXC.water.low)&&!wbowls(r.id).some(b=>(b.w|0)>0));
    if(dry.length){M.lowAt=now()+10*MIN;notify('💧 Bát nước ở '+dry.map(r=>r.n).join(', ')+' đã cạn, các bé đang khát. '+(st?'Bấm Đổ nước.':'Mua nước ở Cửa hàng, mục 🥤 Nước uống.'))}
    else if(st<MEDC.lowStock&&ownedRooms().some(r=>homeCats(r.id).length&&waterNeed(r.id)>=wbowls(r.id).reduce((a,b)=>a+FURN[b.fid].water.cap,0)/2)){M.lowAt=now()+30*MIN;notify('🥤 Nước dự trữ sắp hết (còn '+st+' chai). Mua thêm ở Cửa hàng, mục 🥤 Nước uống.')}
  }
}
