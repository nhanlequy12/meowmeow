"use strict";
/* ============ ĐIỆN NĂNG: LUẬT (không đụng DOM) ============
   Nạp sau js/wx.js, trước js/ui.js. Cấu hình ở js/pw-data.js. Giao diện ở js/pw-ui.js.
   Bộ quản lý năng lượng tập trung: mọi thay đổi pin, phí sạc, điện mặt trời, máy phát, mất điện và nỗi sợ của mèo đều đi qua pwTick (gọi một lần mỗi tick
   từ wxTick) và các hàm pwStartCharge / pwStopCharge / pwGenCharge. Không chỗ nào khác trừ xu hay trừ pin, nên không tính trùng.
   Trạng thái:
   - Món điện: i.currentBattery (Wh), i.chargingState ('idle' | 'charging' | 'paused'), i.charge={o: iid ổ, q: Wh đã trả tiền còn chưa nạp, q0, paid, sol},
     i.lw (đã báo pin yếu trong lần xả này). Cấu hình của món: FURN[id].pw={batteryCapacity, powerConsumption, chargingCost, chargingDuration, requiresElectricity, mode}.
   - Máy phát: i.ge (0..1 năng lượng), i.gu (đã chạy dự phòng trong lần mất điện này: có điện lại thì về 0, cần sạc).
   - S.pw={out:{s,e,ep} lần mất điện đang diễn ra, last, sch:{t,ep} sét đã định giờ, ep: đợt giông đã xét, sol: điện mặt trời đang lưu, saved: xu tiết kiệm, torch:{phòng: tới lúc}}.
   - Mèo: c.fr nỗi sợ (0..100), c.frp lần vỗ về kế tiếp được tính. */
const pwOpen=()=>typeof wxOpen==='function'&&wxOpen();
const pwS=()=>S.pw||(S.pw={sol:0,saved:0,torch:{}});
const PWAWAY={dead:[],strike:0,restore:0};       // lúc vắng mặt: gom lại để giao diện báo một lần
const isElec=f=>!!(f&&f.pw);
const pwCap=i=>FURN[i.fid].pw.batteryCapacity;
const pwCur=i=>i.currentBattery==null?pwCap(i):i.currentBattery;
const pwPct=i=>pwCur(i)/pwCap(i);
const pwDead=i=>{const f=FURN[i.fid];return !!(f&&f.pw)&&pwCur(i)<=0};
const pwWet=rid=>PWC.wet.includes(rid);
const pwDayK=()=>{const t=wxClock(),h=WXO.hr!=null?WXO.hr+.5:((t+TZMS)%DAYMS)/3600000,[a,b]=PWC.solar.day;return h>=a&&h<b?Math.sin(Math.PI*(h-a)/(b-a)):0};

/* ---------- lưới điện, mất điện, máy phát ---------- */
const pwOut=()=>{const o=S.pw&&S.pw.out;return o&&now()>=o.s&&now()<o.e?o:null};
const gridOn=()=>!pwOut();
const pwGens=()=>S.items.filter(i=>i.room==='basement'&&FURN[i.fid].gen&&!i.broken);
const genOn=()=>!!pwOut()&&pwGens().some(i=>(i.ge||0)>0);
const powerOn=()=>gridOn()||genOn();
const pwTorch=rid=>((S.pw&&S.pw.torch)||{})[rid]>now();
// phòng có đèn khẩn cấp còn pin, hoặc đang soi đèn pin
const pwLit=rid=>pwTorch(rid)||S.items.some(i=>i.room===rid&&i.fid==='elamp'&&!i.broken&&pwCur(i)>0);
// phòng tối: mất điện, máy phát không chạy, không có đèn pin hay đèn khẩn cấp, và không phải phòng ngoài trời lúc ban ngày
const pwDark=rid=>!!pwOut()&&!genOn()&&!pwLit(rid)&&!((ROOM_CLIMATE[rid]||{}).out&&pwDayK()>0);
// món mất tác dụng vì điện: đèn điện lưới khi mất điện (trừ khi máy phát chạy), thiết bị chạy pin khi hết pin. game.js và wx.js gọi hàm này.
function pwOff(i){const f=FURN[i.fid];if(!f)return false;if(f.grid)return !!pwOut()&&!genOn();if(f.pw)return pwDead(i);return false}
const pwCanStrike=()=>pwOpen()&&!!(S.tut&&S.tut.done&&S.tut.pw);

/* ---------- ổ điện ---------- */
const pwOutletOk=o=>{const f=FURN[o.fid];return !!(f.outlet&&o.room!=null&&!o.broken&&(!pwWet(o.room)||f.outlet.wet))};
const pwPlugged=oid=>S.items.filter(i=>i.charge&&i.charge.o===oid);
const pwFree=o=>FURN[o.fid].outlet.ports-pwPlugged(o.iid).length;
const pwOutlets=rid=>S.items.filter(i=>i.room===rid&&FURN[i.fid].outlet);
const pwSpeed=o=>(FURN[o.fid].outlet.speed||1);
// lý do ổ không dùng được cho một thiết bị (rỗng là dùng được)
function pwOutletWhy(o,it){
  const f=FURN[o.fid];if(o.broken)return 'ổ đang hỏng';if(it&&o.room!==it.room)return 'khác phòng';
  if(pwWet(o.room)&&!f.outlet.wet)return 'chỗ ẩm, cần ổ chống nước';if(!powerOn())return 'mất nguồn điện';
  if(pwFree(o)<=0&&!(it&&it.charge&&it.charge.o===o.iid))return 'hết cổng trống';return '';
}

/* ---------- điện mặt trời ---------- */
function pwSolarItems(){
  const L=[];['balcony','rooftop'].forEach(rid=>{if(!S.rooms[rid])return;let n=0,sm=0;
    S.items.filter(i=>i.room===rid&&!i.broken&&FURN[i.fid].solar).forEach(i=>{const s=FURN[i.fid].solar;
      if(s.smart){if(sm++<1)L.push(i)}else if(s.rate){if(n++<(PWC.room[rid]||0))L.push(i)}})});
  return L;   // các tấm, bộ đang có tác dụng (đúng chỗ, chưa quá số lượng)
}
const pwSolarWx=t=>(PWC.solar.wx[wxAt(t).type]!=null?PWC.solar.wx[wxAt(t).type]:.5);
const pwSolarMax=()=>pwSolarItems().reduce((a,i)=>a+(FURN[i.fid].solar.rate||0),0);           // đơn vị mỗi giờ lúc nắng đẹp giữa trưa
const pwSolarRate=()=>pwSolarMax()*pwSolarWx(wxClock())*pwDayK();                            // đơn vị mỗi giờ lúc này
function pwSolarCap(){
  const L=pwSolarItems();if(!L.length)return 0;
  const st=S.items.filter(i=>i.room!=null&&!i.broken&&i.fid==='solarbat').length;
  return PWC.solar.base+Math.min(PWC.solar.storMax,st)*PWC.solar.stor+L.reduce((a,i)=>a+(FURN[i.fid].solar.smart?FURN[i.fid].solar.stor:0),0);
}
const pwSol=()=>Math.min(pwS().sol||0,pwSolarCap());

/* ---------- báo giá và sạc ---------- */
// báo giá sạc đầy từ mức pin hiện tại: Wh cần nạp, phí gốc (làm tròn lên theo phần pin nạp), phần điện mặt trời gánh, phí phải trả
function pwQuote(it){
  const f=FURN[it.fid],P=f.pw,need=Math.max(0,P.batteryCapacity-pwCur(it));
  if(need<.5)return {need:0,fee:0,cost:0,disc:0,solar:false,min:0};
  const fee=Math.max(1,Math.ceil(P.chargingCost*need/P.batteryCapacity-1e-9)),half=Math.ceil(fee*(1-PWC.solar.cut)),disc=fee-half;
  const solar=disc>0&&pwSol()>=disc;
  return {need,fee,cost:solar?half:fee,disc:solar?disc:0,solarNeed:disc,solar,min:P.chargingDuration*need/P.batteryCapacity};
}
// bắt đầu sạc thiết bị it ở ổ o: trừ xu một lần duy nhất ở đây
function pwStartCharge(iid,oid){
  const it=S.items.find(i=>i.iid===iid),o=S.items.find(i=>i.iid===oid);
  if(!it||!isElec(FURN[it.fid]))return {err:'Món này không dùng điện, không cần sạc.'};
  if(it.room==null)return {err:'Đặt thiết bị vào phòng rồi mới sạc được.'};
  if(it.charge)return {err:'Thiết bị đang cắm sạc rồi.'};
  if(!o||!FURN[o.fid].outlet)return {err:'Chưa chọn ổ điện.'};
  const why=pwOutletWhy(o,it);if(why)return {err:'Không sạc được: '+why+'.'};
  const q=pwQuote(it);if(!q.need)return {err:'Pin đang đầy.'};
  if(S.coins<q.cost)return {err:'Không đủ xu: cần '+q.cost+' xu.'};
  S.coins-=q.cost;const p=pwS();
  if(q.solar){p.sol=pwSol()-q.disc;p.saved=(p.saved||0)+q.disc}
  it.charge={o:oid,q:q.need,q0:q.need,paid:q.cost,sol:q.disc,t:now()};it.chargingState='charging';
  save();return {ok:1,cost:q.cost,disc:q.disc,min:q.min/pwSpeed(o)};
}
// rút sạc giữa chừng (người chơi rút, thiết bị hay ổ bị cất, bán, đổi phòng): hoàn lại phần xu của lượng pin chưa nạp, làm tròn xuống
function pwStopCharge(it,why,sim){
  const c=it&&it.charge;if(!c)return 0;
  const back=Math.floor(c.paid*Math.max(0,c.q)/c.q0+1e-9);S.coins+=back;if(c.sol&&S.pw)S.pw.saved=Math.max(0,(S.pw.saved||0)-Math.floor(c.sol*Math.max(0,c.q)/c.q0));delete it.charge;it.chargingState='idle';
  if(why&&!sim)notify(FURN[it.fid].n+': '+why+(back?'. Hoàn '+back+' xu cho phần pin chưa nạp.':'.'),{icon:'🔌',title:'Sạc điện',key:'pwstop'});
  return back;
}
// thời gian sạc còn lại (ms) nếu có điện
const pwChargeLeft=it=>{const c=it.charge,o=c&&S.items.find(i=>i.iid===c.o);if(!c||!o)return 0;const P=FURN[it.fid].pw;return c.q/(P.batteryCapacity/(P.chargingDuration*60)*pwSpeed(o))*1000};
// thời gian chạy còn lại (ms) với mức tiêu thụ đầy đủ
const pwRunLeft=it=>{const P=FURN[it.fid].pw;return pwCur(it)/P.powerConsumption*3600000};

/* ---------- máy phát dự phòng ---------- */
const pwGenFee=i=>FURN[i.fid].gen.fee;
function pwGenCharge(iid){
  const g=S.items.find(i=>i.iid===iid),f=g&&FURN[g.fid];
  if(!g||!f.gen)return {err:'Không phải máy phát.'};
  if(g.room!=='basement')return {err:'Máy phát chỉ dùng được khi đặt ở Tầng hầm.'};
  if(g.broken)return {err:'Máy đang hỏng.'};
  if((g.ge||0)>=1)return {err:'Máy phát đang đầy.'};
  if(!gridOn())return {err:'Đang mất điện lưới, chưa sạc máy phát được.'};
  if(S.coins<f.gen.fee)return {err:'Không đủ xu: cần '+f.gen.fee+' xu.'};
  S.coins-=f.gen.fee;g.ge=1;delete g.gu;save();return {ok:1,cost:f.gen.fee};
}

/* ---------- sét đánh, mất điện, có điện lại ---------- */
function pwStrike(at,sim){
  const p=pwS();if(p.out&&now()<p.out.e)return false;
  at=at||now();p.out={s:at,e:at+PWC.outage.min*MIN,ep:p.ep||0};p.sch=null;
  S.cats.forEach(c=>{if(onTrip(c.uid))return;c.fr=100;c.frp=0;c.hp=clamp(c.hp-PWC.fear.hit,0,100);
    if(c.bed!=null){delete c.bed;delete c.bk;delete c.bm}});   // giật mình: mất vui, bé đang ngủ bị đánh thức
  if(typeof wxDirty==='function')wxDirty();
  if(sim)PWAWAY.strike=1;else{notify('Sét đánh! Ngôi nhà bị mất điện trong 15 phút!',{icon:'⚡',title:'Mất điện',key:'pwout',ms:9000});if(typeof pwStrikeFx==='function')pwStrikeFx()}
  save();return true;
}
function pwRestore(sim){
  const p=pwS(),o=p.out;if(!o)return;p.last={s:o.s,e:o.e};p.out=null;
  S.items.forEach(                                            // máy đã chạy dự phòng: về 0%, cần sạc (không tự trừ xu)
    g=>{if(FURN[g.fid].gen&&g.gu){g.ge=0;delete g.gu}});
  if(typeof wxDirty==='function')wxDirty();
  if(sim)PWAWAY.restore=1;else notify('Đã có điện lại! Đèn và ổ điện hoạt động bình thường; máy phát đã dùng cần sạc lại.',{icon:'💡',title:'Có điện',key:'pwout'});
}
// xét sét một lần mỗi đợt giông; định giờ sét đánh trong đợt đó
function pwStorm(sim){
  const p=pwS(),t=now();
  if(p.out)return;                 // có điện lại: pwTick gọi pwRestore sau khi đã tính máy phát cho phần cuối của lần mất điện
  if(p.sch){if(!pwCanStrike()){p.sch=null;return}if(t>=p.sch.t+PWC.outage.min*MIN){p.sch=null;return}if(t>=p.sch.t){const at=p.sch.t;pwStrike(at,sim)}return} // sét lẽ ra đã đánh và đã qua hẳn trước khoảng được bù (vắng quá 8 giờ): bỏ
  if(!pwCanStrike())return;
  const o=wxAt(wxClock());if(!PWC.outage.types.includes(o.type)||p.ep===o.s)return;
  p.ep=o.s;
  if(Math.random()<PWC.outage.p){const left=(o.e-wxClock())/MIN,[a,b]=PWC.outage.delay,d=Math.min(rnd(a,b),Math.max(.5,left*.6));p.sch={t:t+d*MIN,ep:o.s}}
  save();
}

/* ---------- mỗi tick ---------- */
// chuyển bản lưu cũ: thiết bị pin kiểu cũ (i.bat phút chạy trên 720, i.chg đang tự sạc) đổi sang % pin; đồ vốn cắm điện nay có pin tích hợp, bắt đầu đầy
function pwMigrate(){
  if(!S||S.pwMig)return;
  S.items.forEach(i=>{const f=FURN[i.fid];if(!f)return;
    if(f.pw){const cap=f.pw.batteryCapacity;i.currentBattery=i.bat!=null?Math.round(cap*clamp(i.bat/720,0,1)):cap;i.chargingState='idle'}
    delete i.bat;delete i.chg});
  if(S.tut&&S.tut.wx)S.pwOld=1;   // đã xem hướng dẫn thời tiết trước bản cập nhật: hướng dẫn điện năng hỏi trước (Xem ngay / Để sau)
  S.pwMig=1;
}
function pwTick(dt,sim){
  pwMigrate();
  if(!pwOpen())return;
  const p=pwS(),t1=now(),t0=t1-dt*1000;p.torch=p.torch||{};
  pwStorm(sim);
  // số giây trong bước này mà lưới điện bị cắt
  const o=p.out||p.last,cut=o?Math.max(0,Math.min(t1,o.e)-Math.max(t0,o.s))/1000:0;
  // máy phát: chạy dự phòng trong những giây bị cắt điện, lần lượt từng máy
  let genSec=0;
  if(cut>0){let rem=cut;pwGens().forEach(g=>{const R=FURN[g.fid].gen.run*60,av=(g.ge||0)*R;if(av<=0||rem<=0)return;const u=Math.min(av,rem);g.ge=Math.max(0,g.ge-u/R);rem-=u;genSec+=u;
    if(!g.gu){g.gu=1;if(!sim)notify(FURN[g.fid].n+' đã chuyển sang nguồn dự phòng.',{icon:'🔋',title:'Máy phát',key:'pwgen'})}
    if(g.ge<=1e-6){g.ge=0;if(!sim)notify(FURN[g.fid].n+' đã hết năng lượng.',{icon:'🪫',title:'Máy phát',key:'pwgen'});if(typeof wxDirty==='function')wxDirty()}})}
  const powSec=dt-cut+genSec;            // số giây có điện (lưới hoặc máy phát)
  if(p.out&&t1>=p.out.e)pwRestore(sim);  // hết 15 phút: có điện lại, máy phát đã chạy về 0%
  // điện mặt trời: tạo năng lượng theo nắng, kể cả lúc vắng (chỉ tích vào bộ lưu trữ, không tự sạc thiết bị nào)
  const cap=pwSolarCap();p.sol=Math.min(cap,(p.sol||0)+pwSolarRate()*dt/3600);
  // sạc: thiết bị đang cắm nhận điện khi có điện; mất nguồn thì tạm dừng (giữ phần đã trả tiền)
  S.items.forEach(it=>{
    const c=it.charge;if(!c)return;const f=FURN[it.fid],ol=S.items.find(i=>i.iid===c.o);
    if(!f.pw||it.room==null||!ol||ol.room!==it.room||!pwOutletOk(ol)){pwStopCharge(it,'đã rút khỏi ổ điện',sim);return}
    if(powSec<=0){it.chargingState='paused';return}
    const P=f.pw,add=Math.min(c.q,P.batteryCapacity/(P.chargingDuration*60)*pwSpeed(ol)*powSec,P.batteryCapacity-pwCur(it));
    const was=pwDead(it);it.currentBattery=pwCur(it)+add;c.q-=add;it.chargingState='charging';
    if(was&&!pwDead(it)&&typeof wxDirty==='function')wxDirty();
    if(pwPct(it)>=PWC.low)delete it.lw;
    if(c.q<=1e-6||pwCur(it)>=P.batteryCapacity-1e-6){if(pwCur(it)>=P.batteryCapacity-1e-6)it.currentBattery=P.batteryCapacity;delete it.charge;it.chargingState='idle';
      if(!sim)notify(f.n+' ở '+ROOM[it.room].n+' đã sạc xong'+(FURN[ol.fid].outlet.smart?' ('+Math.round(pwPct(it)*100)+'%), ổ thông minh đã ngắt.':'.'),{icon:'🔋',title:'Sạc điện',key:'pwdone'})}
  });
  // tiêu thụ: thiết bị đang chạy trừ pin; đang cắm sạc và có điện thì chạy bằng điện của ổ, không trừ pin
  const run=pwRunning();
  run.forEach(it=>{
    if(it.charge&&powSec>0)return;
    const P=FURN[it.fid].pw,b0=pwCur(it),b=Math.max(0,b0-P.powerConsumption*dt/3600);it.currentBattery=b;
    const nm=FURN[it.fid].n+' ở '+ROOM[it.room].n;
    if(b<=0&&b0>0){if(typeof wxDirty==='function')wxDirty();if(sim)PWAWAY.dead.push(nm);else notify(nm+' đã hết pin, ngừng chạy. Bấm vào máy rồi chọn Sạc thiết bị.',{icon:'🪫',title:'Hết pin',key:'pwdead'})}
    else if(b/P.batteryCapacity<PWC.low&&!it.lw){it.lw=1;if(!sim)notify(nm+' sắp hết pin ('+Math.round(b/P.batteryCapacity*100)+'%).',{icon:'🪫',title:'Pin yếu',key:'pwlow'})}
  });
  pwFear(dt,sim,powSec>0);
}
// các thiết bị đang chạy (tốn pin) lúc này
function pwRunning(){
  const out=[],D={},th={};
  S.items.forEach(it=>{
    const f=FURN[it.fid];if(!f.pw||it.room==null||it.broken||pwDead(it))return;const P=f.pw,rid=it.room;
    if(P.mode==='out'){if(pwOut()&&!genOn())out.push(it);return}
    if(P.mode==='bed'){if(typeof bedCats==='function'&&bedCats(it.iid).length)out.push(it);return}
    const w=f.wx;
    if(!w||!Object.keys(w).length){out.push(it);return}            // máy cho ăn, máy lọc nước: luôn chạy khi đặt trong phòng
    if(!D[rid]){D[rid]=wxDevices(rid);th[rid]=D[rid].on.some(d=>d.f.wx.thermo)}
    if(!D[rid].on.some(d=>d.i===it))return;                         // đang tắt, sai phòng, quá số lượng
    if(P.mode==='auto'||(th[rid]&&(w.heat||w.cool)&&!w.thermo)){const rc=roomClimate(rid),T=rc.T0!=null?rc.T0:rc.T;
      if(!((w.heat&&T<21)||(w.cool&&T>25)))return}                    // máy tự động: chỉ tốn pin khi phòng cần sưởi hoặc làm mát
    out.push(it);
  });
  return out;
}
// nỗi sợ của mèo: mất vui mỗi phút, tốn năng lượng hơn, giảm dần khi có điện; phòng tối thì sợ lâu hơn; đèn, chỗ trú, vỗ về làm dịu
function pwFear(dt,sim,pow){
  const F=PWC.fear,m=dt/60;
  S.cats.forEach(c=>{if(!(c.fr>0)||onTrip(c.uid))return;
    const rid=c.room,dark=pwDark(rid),lamp=!!pwOut()&&!genOn()&&pwLit(rid),sh=typeof bedItem==='function'&&!!bedItem(c);
    const loss=F.hp*(dark?F.darkK:1)*(lamp?F.litK:1)*(sh?F.shK:1)*m,fl=sim?Math.min(c.hp,F.awayHp):0;
    c.hp=Math.max(fl,c.hp-loss);c.en=Math.max(sim?Math.min(c.en,F.awayHp):0,c.en-F.en*(sh?F.shK:1)*m);
    const dec=(pow&&powerOn()?F.decOn:dark?F.decDark:F.decLit)+(sh?F.shelter:0);
    c.fr=Math.max(0,c.fr-dec*m);if(c.fr<=0){delete c.fr;delete c.frp}});
}
// vỗ về bé đang sợ: giảm ngay một phần nỗi sợ (mỗi bé 20 giây một lần); trả true nếu có tác dụng
function pwCalm(c){if(!(c&&c.fr>0)||now()<(c.frp||0))return false;c.fr=Math.max(0,c.fr-PWC.fear.pet);c.frp=now()+PWC.fear.petCd*1000;if(c.fr<=0){delete c.fr;delete c.frp}return true}
// đèn pin (vật phẩm sinh tồn) dùng ở nhà khi mất điện: soi sáng một phòng 15 phút
function pwUseTorch(rid){
  if(!pwOut())return {err:'Đang có điện, chưa cần đèn pin.'};if(!S.rooms[rid])return {err:'Không có phòng này.'};
  if(typeof invN!=='function'||invN('flashlight')<1)return {err:'Túi đồ không còn Đèn pin. Mua ở Cửa hàng, mục Sinh tồn.'};
  S.inv.flashlight--;const p=pwS();p.torch=p.torch||{};p.torch[rid]=now()+PWC.fear.torch*MIN;save();return {ok:1};
}

/* ---------- chỗ đặt: ổ bám tường, tấm pin không chồng lên đồ khác, đúng phòng ---------- */
const pwRect=(i,x,y)=>{const f=FURN[i.fid],X=x==null?i.x:x,Y=y==null?i.y:y;return [X-f.w/2,Y-f.h,X+f.w/2,Y]};
const pwHit=(a,b)=>a[0]<b[2]-.01&&a[2]>b[0]+.01&&a[1]<b[3]-.01&&a[3]>b[1]+.01;
const pwClear=(it,x,y)=>{const r=pwRect(it,x,y);return !S.items.some(o=>o!==it&&o.room!=null&&o.room===it.room&&FURN[o.fid].kind!=='rug'&&pwHit(r,pwRect(o)))};
const PW_OUT_Y=WALL_Y-5;   // ổ điện gắn sát chân tường, ngay trên gờ chân tường
function pwSnap(it){
  const f=FURN[it.fid];if(!(f.outlet||f.solar||f.gen))return;
  if(f.outlet)it.y=PW_OUT_Y;
  const lo=f.w/2,hi=WORLD_W-f.w/2,ys=f.outlet?[it.y]:[it.y,it.y-4,it.y+4,it.y-8,it.y+8,it.y-12,it.y+12].filter(y=>y>=FLOOR_MIN&&y<=FLOOR_MAX+2);
  for(let d=0;d<=WORLD_W;d+=4)for(const s of d?[1,-1]:[1])for(const y of ys){const x=clamp(it.x+s*d,lo,hi);if(pwClear(it,x,y)){it.x=x;it.y=y;return}}
}
// phòng đặt được (máy phát: tầng hầm; tấm pin: ban công, sân thượng)
const pwRoomOk=(fid,rid)=>{const r=FURN[fid].rooms;return !r||r.includes(rid)};
function pwRoomWhy(fid){const f=FURN[fid],r=f.rooms;if(!r)return '';return f.n+' chỉ đặt được ở '+r.map(x=>ROOM[x].n).join(' hoặc ')+'.'}
{const c0=clampItem;clampItem=function(it){c0.apply(this,arguments);pwSnap(it)}}
{const b0=buyItem;buyItem=function(fid,rid,x){const f=FURN[fid];
  if(f&&f.gen&&!S.rooms.basement)return null;                                    // máy phát: phải mở Tầng hầm trước
  if(f&&f.rooms&&!f.rooms.some(r=>S.rooms[r]))return null;                        // tấm pin: phải có Ban công hoặc Sân thượng
  const it=b0.apply(this,arguments);if(!it)return it;
  if(f.pw)it.currentBattery=f.pw.batteryCapacity,it.chargingState='idle';
  if(f.rooms&&!f.rooms.includes(rid))it.room=null;                                 // mua khi đang ở phòng khác: cất vào kho
  else pwSnap(it);
  save();return it}}
{const s0=sellItem;sellItem=function(iid){const it=S.items.find(i=>i.iid===iid);if(it){pwStopCharge(it,'',true);if(FURN[it.fid].outlet)pwPlugged(it.iid).forEach(d=>pwStopCharge(d,'ổ điện đã bị xóa'))}return s0.apply(this,arguments)}}
// mèo đang hoảng sợ: độ vui đứng yên theo mức mong muốn, chỉ tụt theo nỗi sợ ở pwFear (đúng 1 mỗi phút, phòng tối nhanh hơn, có đèn hay chỗ trú chậm hơn)
{const h0=happyTarget;happyTarget=function(c){const t=h0.apply(this,arguments);return c.fr>0?c.hp:t}}
