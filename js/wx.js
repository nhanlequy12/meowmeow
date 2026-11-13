"use strict";
/* ============ THỜI TIẾT: LUẬT (không đụng DOM) ============
   Nạp sau game.js, trước ui.js (vì ui.js gọi load() lúc khởi động, và phần bù thời gian vắng mặt cần các luật này). Cấu hình ở js/wx-data.js.
   - Thời tiết là hàm thuần của đồng hồ (wxAt): chia thời gian thành mốc 10 phút, mỗi đợt dài 2–4 mốc, kiểu thời tiết bốc theo mùa bằng băm của hạt giống chung,
     nên mọi người chơi thấy cùng một trời, kể cả khi chơi một mình không có máy chủ. Sau một đợt xấu thì đợt sau ít khi xấu (không để xấu liên tục).
   - Khí hậu phòng (roomClimate): nhiệt độ ngoài trời lọt vào theo mức hở của phòng, trừ phần cách nhiệt; rồi cộng máy sưởi, trừ máy làm mát
     (máy tự động chỉ chạy khi cần); độ ẩm, mưa tạt, gió lùa, tiếng ồn; ra độ thoải mái của phòng. Thiết bị được tính trước khi tác động lên mèo.
   - Mèo (wxCat, gọi trong tick): nhiệt độ cảm nhận (phòng, ổ đang nằm, ướt, gió), phơi lạnh/nóng, ướt, ốm, sức khỏe, nước uống, độ thoải mái, trạng thái.
     Lúc bù thời gian vắng mặt (TOFF khác 0) chỉ số không bị kéo xuống dưới các mức WXC.away và không phát bệnh mới.
   - Viễn chinh: wxTripInfo (dự báo, rủi ro, tỉ lệ thành công trước khi đi), wxTripStart (giữ vật phẩm mang theo), wxTripClaim (sự cố, vật phẩm tự kích hoạt, nhật ký). */
let WX_OFF=0;                                   // độ lệch đồng hồ so với máy chủ (ms), net.js gán khi ping
const wxClock=()=>Date.now()+WX_OFF+TOFF;
const MIN=60000,BMS=WXC.block*MIN,DAYMS=86400000,TZMS=WXC.tz*3600000;
// Admin ghi đè để thử (chỉ trên máy này, lưu ở localStorage 'meoxu_wxo'): se mùa (0–3), ty kiểu thời tiết, hr giờ trong ngày
const WXO=(()=>{try{return JSON.parse(localStorage.getItem('meoxu_wxo'))||{}}catch(e){return {}}})();
function wxOverride(k,v){if(v===''||v==null)delete WXO[k];else WXO[k]=v;try{localStorage.setItem('meoxu_wxo',JSON.stringify(WXO))}catch(e){}Object.keys(WXE).forEach(x=>delete WXE[x]);wxDirty()}
const wxh=(...k)=>{let h=WXC.seed|0;for(const x of k){h=Math.imul(h^(x|0),0x9E3779B1);h^=h>>>15;h=Math.imul(h,0x85EBCA77);h^=h>>>13}return ((h>>>0)%1000003)/1000003};
const wxDay=t=>Math.floor((t+WXC.tz*3600000)/DAYMS);
const wxSeason=t=>SEASONS[WXO.se!=null?WXO.se:((wxDay(t)%4)+4)%4];
const wxHour=t=>WXO.hr!=null?WXO.hr:Math.floor(((t+TZMS)%DAYMS)/3600000);
// chọn kiểu thời tiết cho một đợt: theo mùa; vừa xấu xong thì giảm mạnh khả năng xấu tiếp; cực đoan chỉ khi đợt trước tốt
function wxPick(se,a,k,prev,run){
  const W=Object.entries(se.w).map(([id,w])=>{const b=WX[id].bad;return [id,w*(run>=WXC.maxBad&&b>=1?0:prev>=2&&b>=1?.12:prev===1&&b>=2?.35:1)*(WX[id].rare&&prev>0?0:1)]}).filter(x=>x[1]>0);
  let r=wxh(a,k,2)*W.reduce((s,x)=>s+x[1],0);for(const [id,w] of W){r-=w;if(r<0)return id}return W[0][0];
}
const WXE={};                                    // bộ nhớ đệm: ngày -> danh sách đợt (mốc tính theo giờ Việt Nam: mốc b bắt đầu lúc b*BMS-TZMS)
function wxRaw(a,prev,run){
  const A=a*WXC.anchor,out=[];let b=A,k=0;
  while(b<A+WXC.anchor){const L=WXC.lens[Math.floor(wxh(a,k,1)*WXC.lens.length)],e=Math.min(b+L,A+WXC.anchor),se=wxSeason(b*BMS-TZMS),ty=wxPick(se,a,k,prev,run);
    out.push({s:b*BMS-TZMS,e:e*BMS-TZMS,type:ty,run});prev=WX[ty].bad;run=prev>=1?run+1:0;b=e;k++}
  return out;
}
function wxEpisodes(a){
  if(WXE[a])return WXE[a];
  const pv=wxRaw(a-1,0,0),lt=pv[pv.length-1],lb=WX[lt.type].bad,out=wxRaw(a,lb,lb>=1?lt.run+1:0); // nối với ngày trước (ước lượng một bậc)
  const ks=Object.keys(WXE);if(ks.length>40)delete WXE[ks[0]];
  return WXE[a]=out;
}
// thời tiết tại thời điểm t: kiểu, đợt (bắt đầu, kết thúc), mùa, nhiệt độ, độ ẩm, mưa, gió, ồn
function wxAt(t){
  const b=Math.floor((t+TZMS)/BMS),a=Math.floor(b/WXC.anchor),ep=wxEpisodes(a).find(x=>t>=x.s&&t<x.e),ty=WXO.ty&&WX[WXO.ty]?WXO.ty:ep.type,w=WX[ty],se=wxSeason(t);
  const temp=Math.round((se.base+w.t+WXDAY[wxHour(t)]+(wxh(b,7)-.5)*2)*10)/10,hum=Math.round(clamp(w.h+(wxh(b,9)-.5)*10,10,100));
  return {type:ty,w,s:ep.s,e:ep.e,season:se,temp,hum,rain:w.r,wind:w.w,noise:w.n0};
}
const wxNow=()=>wxAt(wxClock());
// máy chủ gửi hạt giống chung và giờ của nó: cả nhóm bạn cùng một trời, kể cả khi đồng hồ máy lệch nhau
function wxReseed(seed,t){WXC.seed=seed|0;WX_OFF=(t||Date.now())-Date.now();Object.keys(WXE).forEach(k=>delete WXE[k]);if(typeof wxDirty==='function')wxDirty();if(typeof render==='function'&&S)render()}
// dự báo n đợt tới (sau đợt hiện tại), mỗi đợt kèm nhiệt độ ở giữa đợt
function wxForecast(n){const out=[];let t=wxNow().e;for(let i=0;i<n;i++){const o=wxAt(t+1);o.temp=wxAt(Math.floor((o.s+o.e)/2)).temp;out.push(o);t=o.e}return out}
const wxHasStation=()=>S.items.some(i=>i.room&&FURN[i.fid].wx&&FURN[i.fid].wx.station&&!i.broken&&!(typeof pwOff==='function'&&pwOff(i)));
const wxDanger=o=>o.w.bad>=2;

/* ---------- khí hậu phòng ---------- */
const devOk=(f,rid)=>{const r=f.wx.rooms,C=ROOM_CLIMATE[rid]||{};return !r||(r==='out'?!!C.out:r==='in'?!C.out:r.includes(rid))};
// các thiết bị đang có tác dụng trong phòng: đặt trong phòng, không hỏng, đang bật, đúng loại phòng, chưa quá số lượng cho phép
function wxDevices(rid){
  const n={},on=[],off=[];
  itemsIn(rid).forEach(i=>{const f=FURN[i.fid];if(!f.wx||!Object.keys(f.wx).length||f.bed&&!f.wx.heat&&!f.wx.cool&&!f.wx.comfort&&!f.wx.shelter)return;
    const why=i.broken?'đang hỏng':!devOk(f,rid)?'không hợp phòng này':(n[f.id]=(n[f.id]||0)+1)>(f.max||99)?'quá số lượng':i.off?'đang tắt':(typeof pwOff==='function'&&pwOff(i))?'hết pin':'';
    (why?off:on).push({i,f,why})});
  return {on,off};
}
const RCC={};let WXV=0;                          // bộ nhớ đệm khí hậu phòng: tính lại mỗi 20 giây, khi đồ trong phòng đổi, hoặc khi gọi wxDirty()
const wxDirty=()=>{WXV++};
function roomClimate(rid){
  const t=wxClock(),its=itemsIn(rid),k=rid+'|'+Math.floor(t/20000)+'|'+WXV+'|'+its.length+'|'+its.reduce((a,i)=>a+(i.off?1:0)+(i.broken?2:0)+((typeof pwOff==='function'&&pwOff(i))?4:0),0);if(RCC[k])return RCC[k];
  const R=ROOM_CLIMATE[rid]||ROOM_CLIMATE.living,o=wxAt(t),D=wxDevices(rid),out=!!R.out;
  let ins=R.ins||0,H=0,K=0,Ha=0,Ka=0,sh=0,wb=0,hum=0,cf=0,quiet=0,dry=0,bath=0,health=0,sensor=0;
  const thermo=D.on.some(d=>d.f.wx.thermo);
  D.on.forEach(({f})=>{const w=f.wx,o2=out&&!w.outok?.5:1; // máy sưởi, máy làm mát kém hiệu quả ngoài trời trừ loại dùng được ngoài trời
    if(w.ins)ins+=w.ins;if(w.sun&&o.temp>26)ins+=w.sun;
    if(w.heat){if(w.auto||thermo)Ha+=w.heat*o2;else H+=w.heat*o2}
    if(w.cool){if(w.auto||thermo)Ka+=w.cool*o2;else K+=w.cool*o2}
    if(w.shelter)sh+=w.shelter;if(w.wind)wb+=w.wind;if(w.hum)hum+=w.hum;if(w.comfort)cf+=w.comfort;if(w.quiet)quiet=1;if(w.dry)dry+=w.dry;if(w.bath)bath=1;if(w.health)health+=w.health;if(w.sensor)sensor=1});
  ins=Math.min(.85,ins);sh=Math.min(1,sh);wb=Math.min(1,wb);cf=Math.min(WXC.comfort.devCap,cf);
  const exp=R.exp*(1-ins);
  let T=R.base+(o.temp-R.base)*exp+H-K;const T0=T; // T0: nhiệt độ trước khi máy tự động chạy (js/pw.js biết máy tự động có đang tốn pin không)
  if(T<21&&Ha)T=Math.min(21,T+Ha);if(T>25&&Ka)T=Math.max(25,T-Ka);
  T=Math.round(T*10)/10;
  const H2=Math.round(clamp(R.hum+(o.hum-R.hum)*exp+hum,10,100)),rain=o.rain*(out?1:R.exp*.15)*(1-sh),wind=o.wind*(out?1:R.exp*.3)*(1-wb),noise=o.noise*(quiet?0:out?1:.6);
  const dist=(v,b)=>v<b[0]?b[0]-v:v>b[1]?v-b[1]:0,C=WXC.comfort;
  const comfort=Math.round(clamp(100-C.degPen*dist(T,WXC.ideal)-C.humPen*dist(H2,WXC.comfyHum)-C.wind*wind-C.rain*rain-C.noise*noise+cf,0,100));
  const r={rid,T,T0,hum:H2,rain,wind,noise,comfort,exp,ins,heat:H+Ha,cool:K+Ka,shelter:sh,dry,bath,health,sensor,out,o,D};
  const ks=Object.keys(RCC);if(ks.length>200)ks.slice(0,100).forEach(x=>delete RCC[x]);
  return RCC[k]=r;
}

/* ---------- mèo ---------- */
const wxs=c=>c.wxs||(c.wxs={cx:0,hx:0,wet:0,sk:0,ex:0});
// nhiệt độ cảm nhận của bé: phòng, cộng hiệu ứng ổ đang nằm (sưởi, mát, tự chỉnh), trừ khi ướt và gió lùa
function wxFeel(c){
  const rc=roomClimate(c.room),bi=typeof bedItem==='function'&&bedItem(c),bw=bi&&!(typeof pwOff==='function'&&pwOff(bi))&&FURN[bi.fid].wx||{},x=wxs(c);
  let T=rc.T;if(bw.lheat)T+=bw.lheat;if(bw.lcool)T-=bw.lcool;if(bw.lauto){if(T<22)T=Math.min(22,T+bw.lauto);else if(T>25)T=Math.max(25,T-bw.lauto)}
  const sh=!!bw.lshelter,rain=sh?0:rc.rain,wind=sh?0:rc.wind;
  return {rc,bi,T,rain,wind,feel:T-(x.wet>=WXC.wetSt?WXC.wetFeel:0)-wind*4+wxFur(c)};
}
// độ lệch nhiệt độ cảm nhận theo bộ lông của giống (WXC.fur): lông dài +2°C, không lông −3°C, còn lại 0
function wxFur(c){const s=c&&SP[c.sp];return !s||!WXC.fur?0:s.hl?WXC.fur.bare:s.fur?WXC.fur.long:0}
const wxSt=c=>{const x=wxs(c),L=[];if(c.fr>0)L.push('scared');if(x.sk>0)L.push('sick');if(x.cx>=WXC.coldSt)L.push('cold');if(x.hx>=WXC.hotSt)L.push('hot');if(x.wet>=WXC.wetSt)L.push('wet');if(x.ex)L.push('exhausted');
  if(c.wa!=null&&c.wa<WXC.water.low)L.push('thirsty');if((c.cf||0)>=75)L.push('comfy');if((x.rest||0)>now())L.push('rested');return L};
const wxHas=(c,k)=>wxSt(c).includes(k);
function wxCat(c,dt,sim){ // sim: đang bù thời gian vắng mặt (load() gọi tick(…, true))
  if(c.he==null)c.he=100;if(c.wa==null)c.wa=100;if(c.cf==null)c.cf=60;
  const x=wxs(c),m=dt/60,W=WXC,away=!!sim;
  if(away)x.fl={hp:Math.min(c.hp,W.away.hp),en:Math.min(c.en,W.away.en),he:Math.min(c.he,W.away.health),wa:Math.min(c.wa,W.away.water)};else delete x.fl;
  if(onTrip(c.uid)){c.wa=clamp(c.wa-W.water.decay*m*W.water.trip,away?Math.min(c.wa,W.away.water):0,100);return} // đang viễn chinh: chỉ mất nước, phần còn lại tính lúc về
  const F=wxFeel(c),rc=F.rc,feel=F.feel;
  x.wet=clamp(x.wet+(F.rain*W.wetRate-W.dryRate*(F.T>24?1.5:1)-rc.dry-(rc.bath?W.dryRate*2:0))*m,0,100);
  const dc=Math.max(0,W.coldAt-feel),dh=Math.max(0,feel-W.hotAt);x.dc=dc;x.dh=dh;
  let dHp=-(W.coldHp*dc+W.hotHp*dh)*m,dEn=-(W.coldEn*dc+W.hotEn*dh)*m;
  if(ROOM_CLIMATE[c.room]&&ROOM_CLIMATE[c.room].bath&&!rc.bath&&feel<18){dHp-=.5*m;x.cx+=.5*m} // phòng tắm lạnh mà không có nước nóng
  if(rc.noise)dHp-=rc.noise*.3*m;                                                                  // sấm sét
  x.cx=dc>0?Math.min(400,x.cx+W.coldExpo*dc*m):Math.max(0,x.cx-W.expoDecay*m);
  x.hx=dh>0?Math.min(400,x.hx+W.hotExpo*dh*m):Math.max(0,x.hx-W.expoDecay*m);
  c.wa=clamp(c.wa-W.water.decay*(1+W.hotWater*dh)*(x.hx>=W.hotSt?1.5:1)*m,away?Math.min(c.wa,W.away.water):0,100);
  // ốm: phơi lạnh lâu, hoặc ướt mà lạnh; nghỉ chỗ ấm, khô, thoải mái thì khỏi dần
  if(!x.sk){
    let p=x.cx>W.sickAt?W.sickP*(x.cx-W.sickAt)/100:0;if(x.wet>=W.wetSt&&feel<16)p+=.002;
    if(!away&&p&&Math.random()<1-Math.pow(1-p,m)){x.sk=W.sick.start;notify('bị cảm vì lạnh. Cho bé vào chỗ ấm, khô, hoặc dùng thuốc chống cảm.',{icon:'🤒',title:c.name,key:'wxsick'})}
  }else{
    const good=feel>=19&&feel<=28&&x.wet<W.wetSt&&rc.comfort>=60;
    if(good)x.sk-=W.sick.heal*(F.bi?2:1)*m;
    if(x.sk<=0){x.sk=0;if(!away)notify('đã khỏi ốm.',{icon:'😺',title:c.name,key:'wxwell'})}
    c.he-=W.sick.health*m;dHp-=W.sick.happy*m;
  }
  if(feel<W.freezeAt)c.he-=W.extremeHealth*(W.freezeAt-feel)*m;if(feel>W.scorchAt)c.he-=W.extremeHealth*(feel-W.scorchAt)*m;
  if(c.wa<=0)c.he-=W.water.zeroHealth*m;
  if(!x.sk&&!(c.ill&&c.ill.length)&&c.wa>W.water.low&&rc.comfort>=40)c.he+=(W.health.regen*(F.bi?W.health.bedX:1)+rc.health)*m;
  if(c.wa<W.water.low)dHp-=W.water.lowHappy*m;
  c.he=clamp(c.he,away?Math.min(c.he,W.away.health):0,100);
  // độ thoải mái của bé tiến dần về mức của phòng, trừ khi bé ướt, lạnh, nóng, ốm, khát
  const cfT=clamp(rc.comfort-(x.wet>=W.wetSt?25:0)-(x.cx>=W.coldSt?15:0)-(x.hx>=W.hotSt?15:0)-(x.sk?20:0)-(c.wa<W.water.low?10:0)+(F.bi?5:0),0,100);
  c.cf+=Math.sign(cfT-c.cf)*Math.min(Math.abs(cfT-c.cf),W.comfort.rate*m);
  if(c.en<W.exhaustAt)x.ex=1;else if(c.en>=W.exhaustOff)x.ex=0;
  c.hp=clamp(c.hp+dHp,away?Math.min(c.hp,W.away.hp):0,100);
  c.en=clamp(c.en+dEn,away?Math.min(c.en,W.away.en):0,100);
}
// hệ số cho tick của game.js
const wxHunger=c=>1+WXC.coldHunger*((c.wxs&&c.wxs.dc)||0);
function wxRegen(c){
  if(onTrip(c.uid))return 1;const st=wxSt(c);let k=.75+.5*(c.cf==null?60:c.cf)/100;
  if(st.includes('cold'))k*=.85;if(st.includes('hot'))k*=.85;if(st.includes('sick'))k*=.6;if(st.includes('comfy'))k*=1.1;if(st.includes('thirsty'))k*=.7;
  const bi=typeof bedItem==='function'&&bedItem(c);if(bi){const T=wxFeel(c).T,b=WXC.ideal,dd=T<b[0]?b[0]-T:T>b[1]?T-b[1]:0;k*=dd?Math.max(.5,1-.05*dd):1.15;if(roomClimate(c.room).noise===0&&wxDevices(c.room).on.some(d=>d.f.wx.quiet))k*=1.1}
  return k;
}
function wxHappy(c){
  if(onTrip(c.uid))return 0;const st=wxSt(c);let h=((c.cf==null?60:c.cf)-50)*WXC.comfort.happy;
  if(st.includes('cold'))h-=5;if(st.includes('hot'))h-=5;if(st.includes('exhausted'))h-=5;if(st.includes('sick'))h-=10;if(st.includes('comfy'))h+=5;
  if((c.he==null?100:c.he)<WXC.health.tripMin)h-=WXC.health.lowHappy;
  return h;
}

/* ---------- nước uống ---------- */
const wbowls=rid=>itemsIn(rid).filter(i=>FURN[i.fid].water);
function giveWater(rid){const f=FURN.waterbowl;S.items.push({iid:S.nid++,fid:'waterbowl',room:rid,x:100,y:158,flip:false,broken:false,w:f.water.cap})}
// đổ đầy mọi bát nước trong phòng (miễn phí); trả số bát đã đổ
function fillWater(rid){let n=0;wbowls(rid).forEach(b=>{const cap=FURN[b.fid].water.cap;if((b.w||0)<cap){b.w=cap;n++}});if(n)save();return n}
function wxDrink(rid){
  const bs=wbowls(rid).filter(b=>!b.broken);if(!bs.length)return;
  bs.forEach(b=>{const W=FURN[b.fid].water;if(W.auto&&!(typeof pwOff==='function'&&pwOff(b))&&now()>=(b.wat||0)){b.w=W.cap;b.wat=now()+600000}});
  homeCats(rid).filter(c=>(c.wa==null?100:c.wa)<WXC.water.drinkAt).sort((a,b)=>a.wa-b.wa).forEach(c=>{
    const b=bs.find(b=>(b.w||0)>0);if(!b)return;const W=FURN[b.fid].water,hotNow=roomClimate(rid).T>WXC.hotAt;
    b.w--;c.wa=Math.min(100,c.wa+WXC.water.drink+(W.cool&&hotNow?10:0));const x=wxs(c);x.hx=Math.max(0,x.hx-(W.cool?40:20));if(W.happy)c.hp=clamp(c.hp+W.happy,0,100);
    c.drink={iid:b.iid,t:now()};
  });
}
// gọi cuối mỗi tick của game.js: tặng bát nước một lần, cho mèo uống nước
function wxTick(dt,sim){
  if(!S.wxMig){ownedRooms().forEach(r=>{if(!wbowls(r.id).length)giveWater(r.id)});S.wxMig=1}
  S.inv=S.inv||{};S.tlog=S.tlog||[];
  ownedRooms().forEach(r=>wxDrink(r.id));
  if(typeof pwTick==='function')pwTick(dt,sim); // điện năng: pin, sạc, điện mặt trời, máy phát, mất điện (js/pw.js)
  if(sim)S.cats.forEach(c=>{const f=c.wxs&&c.wxs.fl;if(!f)return;c.hp=Math.max(c.hp,f.hp);c.en=Math.max(c.en,f.en);c.he=Math.max(c.he,f.he);c.wa=Math.max(c.wa,f.wa)}); // vắng mặt: không xuống dưới mức sàn
}

// thiết bị chạy pin: từ 2026-11-12 không còn tự sạc; pin, sạc tay, ổ điện nằm ở js/pw.js

/* ---------- vật phẩm sinh tồn ---------- */
const invN=id=>(S.inv&&S.inv[id])||0;
function buySupply(id,n){
  const s=SUP[id];n=Math.max(1,n|0);if(!s)return {err:'Không có vật phẩm này.'};if(!wxOpen())return {err:'Vật phẩm sinh tồn mở ở cấp '+WX_LV+'.'};const cost=s.price*n;
  if(S.coins<cost)return {err:'Không đủ xu: cần '+cost.toLocaleString('vi-VN')+' xu.'};
  S.coins-=cost;S.inv=S.inv||{};S.inv[id]=invN(id)+n;save();return {n,cost};
}
// dùng một vật phẩm cho một bé ở nhà
function useSupply(id,uid){
  const s=SUP[id],c=catBy(uid);if(!s||!s.home||!c)return {err:'Không dùng được.'};if(invN(id)<1)return {err:'Hết '+s.n+'.'};if(onTrip(uid))return {err:'Bé đang đi viễn chinh.'};
  const h=s.home,x=wxs(c);S.inv[id]--;
  if(h.en)c.en=clamp(c.en+h.en,0,100);if(h.full)c.full=clamp(c.full+h.full,0,100);if(h.water)c.wa=clamp((c.wa||0)+h.water,0,100);if(h.health)c.he=clamp((c.he||0)+h.health,0,100);
  if(h.cure==='sick')x.sk=0;if(h.cure==='cold')x.cx=0;if(h.cure==='hot')x.hx=0;
  save();return {ok:1};
}
// các hiệu ứng của bộ vật phẩm mang theo, có giới hạn cộng dồn
function kitFx(kit){
  const r={res:{},sick:0,exhaust:0,water:0,dry:0,luck:0,lost:0,save:0};
  Object.entries(kit||{}).forEach(([id,q])=>{const s=SUP[id];if(!s||!q)return;q=Math.min(q,s.max);
    if(s.res)for(const k in s.res)r.res[k]=(r.res[k]||0)+s.res[k]*q;['sick','exhaust','water','dry','luck','lost','save'].forEach(k=>{if(s[k])r[k]+=s[k]*(k==='luck'||k==='save'?1:q)})});
  for(const k in r.res)r.res[k]=Math.min(WXC.resCap,r.res[k]);['sick','exhaust','water','dry','lost','save'].forEach(k=>r[k]=Math.min(WXC.resCap,r[k]));r.luck=Math.min(WXC.luckCap,r.luck);
  return r;
}

/* ---------- viễn chinh ---------- */
// thời tiết ở điểm đến tại thời điểm t: thời tiết chung, đổi theo khí hậu điểm đến
function destWx(did,t){
  const o=wxAt(t),D=DEST_CLIMATE[did]||{},b=Math.floor(t/BMS);let type=o.type;
  const temp=Math.round((o.temp+(D.t||0))*10)/10;
  if(D.snowAt!=null&&temp<=D.snowAt){if(type==='drizzle')type='snow';else if(type==='storm')type='blizzard'}
  if(D.dry)type={drizzle:'hot',storm:'wind',fog:'sunny',snow:'cold',blizzard:'wind'}[type]||(type==='sunny'&&temp>=36?'hot':type);
  if(D.fog&&type==='drizzle'&&wxh(b,11)<.5)type='fog';
  if(D.wind&&type==='sunny'&&wxh(b,12)<.3)type='wind';
  return {type,w:WX[type],temp};
}
// rủi ro của bé ở một chặng 10 phút: rủi ro của thời tiết và điểm đến, trừ phần kháng của vật phẩm, nhân theo tình trạng bé
function legRisk(c,did,cp,fx){
  const w=WX[cp.type],x=wxs(c),res=w.res?(fx.res[w.res]||0)+(w.res==='storm'?(fx.res.rain||0)*.5:0):0;
  let mod=1;if(x.sk>0)mod+=.5;if((c.he==null?100:c.he)<50)mod+=.3;if(x.ex)mod+=.3;
  if(w.res==='cold'&&has(c,'coldfear'))mod+=.3;if(w.res==='rain'&&tE(c,'water')<0)mod+=.3;if(w.res==='rain'&&tE(c,'water')>0)mod-=.2;
  return clamp((w.risk+((DEST_CLIMATE[did]||{}).danger||0))*(1-Math.min(WXC.resCap,res))*mod,0,.6);
}
// gọi trong tripInfo: dự báo theo chặng, chỉnh thời gian và năng lượng theo thời tiết lúc xuất phát, tỉ lệ thành công, vật phẩm nên mang
function wxTripInfo(c,did,o,kit){
  const t0=wxClock(),fx=kitFx(kit),start=destWx(did,t0),x=wxs(c);
  o.dur*=start.w.dur;o.cost=Math.round(o.cost*start.w.cost*(1-fx.save)*((x.rest||0)>now()?.9:1));
  const n=Math.max(1,Math.round(o.dur/MIN/10)),cps=[];for(let i=0;i<n;i++)cps.push(destWx(did,t0+i*10*MIN+5*MIN));
  let ok=1,minor=0;cps.forEach(cp=>{const h=legRisk(c,did,cp,fx);ok*=1-h*.25;minor+=h});
  const kinds={};cps.forEach(cp=>{if(cp.w.res)kinds[cp.w.res]=1});
  const recs=SUPPLY.filter(s=>(s.res&&Object.keys(s.res).some(k=>kinds[k]||(k==='rain'&&kinds.storm)))||(s.id==='coldmed'&&kinds.cold)||(s.id==='heatmed'&&kinds.heat)||(s.id==='compass'&&kinds.fog)||(s.id==='rescuekit'&&cps.some(cp=>cp.w.bad>=2))).map(s=>s.id);
  if(!o.why){if((c.he==null?100:c.he)<WXC.health.tripMin)o.why='Đang yếu (sức khỏe dưới '+WXC.health.tripMin+')';else if(x.ex)o.why='Đang kiệt sức';}
  o.wx={start,cps,succ:Math.round(ok*100),minor:Math.min(.99,minor),recs,temp:start.temp,danger:Math.max(...cps.map(cp=>cp.w.bad))};
  return o;
}
// gọi trong startTrip: giữ các vật phẩm mang theo (trừ khỏi túi đồ), ghi dự báo chặng vào chuyến
function wxTripStart(p,c,kit,inf){
  const k={};Object.entries(kit||{}).slice(0,WXC.kitSlots).forEach(([id,q])=>{const s=SUP[id];q=Math.min(q|0,s?s.max:0,invN(id));if(q>0){k[id]=q;S.inv[id]-=q}});
  p.kit=k;p.cps=inf&&inf.wx?inf.wx.cps.map(cp=>cp.type):[];
}
// gọi khi bé ngủ đủ giấc trên ổ: phòng thoải mái thì có trạng thái Ngủ ngon
function wxWake(c){if((c.cf||0)>=60)wxs(c).rest=now()+WXC.restMin*MIN}
// gọi trong claimTrip trước khi cộng xu: sự cố theo chặng, vật phẩm tự kích hoạt, phần thưởng thêm, trạng thái của bé, nhật ký
function wxTripClaim(p,c,res,d){
  if(!p.cps)return;
  const kit=Object.assign({},p.kit||{}),fx=kitFx(kit),x=wxs(c),L=[],used={},use=id=>{if(kit[id]>0){kit[id]--;used[id]=(used[id]||0)+1;return SUP[id]}return null};
  let mult=1,out='ok',idealN=0,inj=0;
  if(c.he==null)c.he=100;if(c.wa==null)c.wa=100;
  for(let i=0;i<p.cps.length;i++){
    const type=p.cps[i],w=WX[type],h=legRisk(c,p.dest,{type},fx);if(w.coin>1)idealN++;
    if(Math.random()<h*.25){ // sự cố lớn: rút lui sớm, giữ một phần phần thưởng
      if(use('rescuekit')){mult*=.75;L.push('🛟 '+w.ic+' '+w.n+': phải rút lui, Bộ cứu hộ đưa bé về an toàn (giữ 75% phần thưởng).')}
      else{mult*=1-(1-.45)*(1-fx.dry);inj+=20;L.push('⚠ '+w.ic+' '+w.n+': gặp sự cố, phải rút lui sớm (giữ '+Math.round((1-(1-.45)*(1-fx.dry))*100)+'% phần thưởng).')}
      out='retreat';break;
    }
    if(Math.random()<h){
      out='minor';
      if(w.res==='cold'){x.cx+=60;c.en-=6;L.push('🥶 '+w.n+': bé bị lạnh cóng (-6⚡).');const s=use('hotsoup');if(s){c.en+=s.en;x.cx=Math.max(0,x.cx-40);L.push('🍲 Tự dùng Súp nóng: +'+s.en+'⚡, đỡ lạnh.')}}
      else if(w.res==='heat'){x.hx+=60;c.en-=8;c.wa-=15*(1-fx.water);L.push('🥵 '+w.n+': bé mệt lả vì nóng (-8⚡).');if(Math.random()<.25*(1-fx.exhaust)){if(use('heatmed'))L.push('💉 Tự dùng Thuốc chống say nắng: không bị kiệt sức.');else{c.en-=15;x.ex=1;L.push('😵 Bé bị kiệt sức (-15⚡).')}}}
      else if(w.res==='rain'||w.res==='storm'){x.wet=Math.min(100,x.wet+60);mult*=1-.1*(1-fx.dry);L.push('💦 '+w.n+': bé bị ướt sũng'+(fx.dry?', túi chống nước giữ được đồ':'')+'.')}
      else if(w.res==='fog'){if(Math.random()>=fx.lost){mult*=.85;L.push('🌫️ '+w.n+': bé lạc đường một lúc (-15% xu).')}else L.push('🧭 La bàn giúp bé không lạc trong sương mù.')}
      else{c.en-=5;mult*=.95;L.push(w.ic+' '+w.n+': đường khó đi (-5⚡).')}
      if((w.res==='cold'||w.res==='rain'||w.res==='storm')&&Math.random()<.15*(1-fx.sick)){if(use('coldmed'))L.push('💊 Tự dùng Thuốc chống cảm: bé không bị ốm.');else if(!x.sk){x.sk=WXC.sick.start;L.push('🤒 Bé bị cảm lạnh.')}}
    }
  }
  if(inj){if(use('firstaid')){c.he=Math.min(100,c.he+30);L.push('🩹 Tự dùng Bộ sơ cứu: không bị thương, +30 sức khỏe.')}else{c.he=Math.max(10,c.he-inj);L.push('🤕 Bé bị thương nhẹ (-'+inj+' sức khỏe).')}}
  if(idealN&&out!=='retreat'){const b=1+.15*idealN/p.cps.length;mult*=b;L.push('🌈 Thời tiết lý tưởng: +'+Math.round((b-1)*100)+'% xu.')}
  if((x.rest||0)>now()){mult*=1.05;L.push('🌙 Bé ngủ ngon trước khi đi: +5% xu.')}
  if(fx.luck){mult*=1+fx.luck*.6;if(Math.random()<fx.luck){res.ticket++;L.push('🍀 Bùa may mắn: nhặt thêm 1 vé.')}}
  const rl=(d.rareLoot||0)+fx.luck;if(out!=='retreat'&&Math.random()<rl){const s=pick(SUPPLY.filter(s=>s.rare>=2));S.inv[s.id]=invN(s.id)+1;L.push('🎁 Nhặt được vật phẩm hiếm: '+s.ic+' '+s.n+'.')}
  c.wa=clamp(c.wa,10,100);c.en=clamp(c.en,0,100);
  if(c.en<25){const s=use('energybar');if(s){c.en+=s.en;L.push('🍫 Tự dùng Thanh năng lượng: +'+s.en+'⚡.')}}
  if(c.full<30){const s=use('rations');if(s){c.full=Math.min(100,c.full+s.full);L.push('🥫 Tự dùng Hộp thức ăn dự phòng: +'+s.full+' no.')}}
  // trả lại túi đồ các vật phẩm tự kích hoạt mà chưa dùng; vật phẩm dùng lúc xuất phát thì đã hết
  Object.entries(kit).forEach(([id,q])=>{if(q>0&&SUP[id].on==='auto')S.inv[id]=invN(id)+q});
  Object.entries(p.kit||{}).forEach(([id,q])=>{if(SUP[id].on==='start')L.push(SUP[id].ic+' Đã dùng '+SUP[id].n+(q>1?' ×'+q:'')+'.')});
  res.coins=Math.round(res.coins*mult);res.bonus=Math.round(res.bonus*mult);
  res.wx={out,lines:L,mult};
  S.tlog=S.tlog||[];S.tlog.unshift({t:now(),uid:c.uid,name:c.name,dest:d.n,ic:d.ic,out,lines:L,coins:res.coins+res.bonus,cps:p.cps.slice(0,8)});S.tlog.length=Math.min(S.tlog.length,15);
  if(out!=='ok')notify(out==='retreat'?'phải rút lui sớm vì thời tiết. Xem Nhật ký viễn chinh.':'gặp sự cố nhỏ trên đường. Xem Nhật ký viễn chinh.',{icon:'📜',title:c.name+' · '+d.n,key:'wxtrip'});
}
