"use strict";
/* ============ SÁCH KHÍ HẬU: TRANG PHÒNG GỌN VÀ "GIẢI THÍCH NHANH" (2026-11-12) ============
   Nạp sau js/wx-ui.js. Chỉ đổi cách trình bày, không đổi công thức (js/wx.js). Mọi ngưỡng lấy từ WXC (js/wx-data.js).
   - climHtml(rid): trang chi tiết phòng: bảng trạng thái (nhiệt độ, độ ẩm, thoải mái, ngoài trời) có nhãn màu + chữ và nút ⓘ,
     thẻ "Cần xử lý" cho từng vấn đề (nguyên nhân → ảnh hưởng → nút làm ngay), số liệu chi tiết gập lại, thiết bị, các bé.
   - Trang "Giải thích nhanh" (WB.g = {t: mục, rid: phòng đang xem, k: vấn đề}) thay trang phải, lật giấy như trang phòng.
     Mục: temp, hum, comf, wx, fix. Mục "Xử lý" liệt kê thiết bị hợp phòng: đang chạy, bật, sạc (tay, ở ổ điện, trả xu), đặt từ kho, mua, hoặc cấp cần mở.
   Màu nhãn: 🟢 tốt, 🟡 cảnh báo, 🔴 nguy hiểm, 🔵 chỉ số, 💡 cách khắc phục (luôn kèm biểu tượng và chữ, không chỉ dựa vào màu). CSS: css/wxbook.css (.wl, .wg-*) */

const n1=v=>String(Math.round(v*10)/10).replace('.',','),pc=v=>Math.round(v*100)+'%';
const WL={g:'🟢',y:'🟡',r:'🔴',b:'🔵',f:'💡'};
const wl=(k,t)=>'<span class="wl wl-'+k+'">'+WL[k]+' '+t+'</span>';
const wInfo=(tip,lab)=>'<button class="wb-i" type="button" data-tip="'+tip+'" aria-label="Giải thích '+(lab||'')+'">ⓘ</button>';
const CF_HI=60,CF_LO=40; // thoải mái của phòng: từ 60 bé ốm khỏi dần, ngủ ngon; dưới 40 không tự hồi sức khỏe (js/wx.js)

// trạng thái từng chỉ số
const stTemp=T=>T<WXC.coldAt?['r','Quá lạnh']:T<WXC.ideal[0]?['y','Hơi lạnh']:T>WXC.hotAt?['r','Quá nóng']:T>WXC.ideal[1]?['y','Hơi nóng']:['g','Dễ chịu'];
const stHum=h=>h<WXC.comfyHum[0]?['y','Quá khô']:h>WXC.comfyHum[1]?['y','Quá ẩm']:['g','Dễ chịu'];
const stComf=c=>c>=75?['g','Rất cao']:c>=CF_HI?['g','Cao']:c>=CF_LO?['y','Trung bình']:['r','Thấp'];
const stWx=o=>o.w.bad>=2?['r','Nguy hiểm']:o.w.bad>=1?['y','Hơi xấu']:['g','Tốt'];

/* ---------- vấn đề của một phòng: nguyên nhân → ảnh hưởng ---------- */
function wxIssues(rid){
  const rc=roomClimate(rid),W=WXC,L=[],T=rc.T,dI=(v,b)=>v<b[0]?b[0]-v:v>b[1]?v-b[1]:0;
  if(T<W.coldAt)L.push({k:'cold',lv:'r',t:'Quá lạnh',tab:'temp',why:'Phòng '+fmtT(T)+', dưới '+W.coldAt+'°C.',eff:'<b>Giảm vui</b>, <b>giảm năng lượng</b>, nhanh đói. Lâu thì <b>Lạnh 🥶</b>, có thể <b>Ốm 🤒</b>'+(T<W.freezeAt?'; dưới '+W.freezeAt+'°C <b>mất sức khỏe</b>':'')+'.'});
  else if(T<W.ideal[0])L.push({k:'cold',lv:'y',t:'Hơi lạnh',tab:'temp',why:'Phòng '+fmtT(T)+', dưới '+W.ideal[0]+'°C.',eff:'<b>Giảm thoải mái</b> '+Math.round(W.comfort.degPen*dI(T,W.ideal))+' điểm. Chưa hại mèo.'});
  if(T>W.hotAt)L.push({k:'hot',lv:'r',t:'Quá nóng',tab:'temp',why:'Phòng '+fmtT(T)+', trên '+W.hotAt+'°C.',eff:'<b>Giảm vui</b>, <b>giảm năng lượng</b>, <b>nhanh khát</b>. Lâu thì <b>Nóng quá 🥵</b>'+(T>W.scorchAt?'; trên '+W.scorchAt+'°C <b>mất sức khỏe</b>':'')+'.'});
  else if(T>W.ideal[1])L.push({k:'hot',lv:'y',t:'Hơi nóng',tab:'temp',why:'Phòng '+fmtT(T)+', trên '+W.ideal[1]+'°C.',eff:'<b>Giảm thoải mái</b> '+Math.round(W.comfort.degPen*dI(T,W.ideal))+' điểm. Chưa hại mèo.'});
  if(rc.rain>.2)L.push({k:'wet',lv:'y',t:'Mưa tạt',tab:'wx',why:'Mưa lọt vào '+pc(rc.rain)+'.',eff:'Bé <b>bị ướt</b>: thấy lạnh thêm '+W.wetFeel+'°C, thoải mái của bé −25.'});
  if(rc.wind>.3)L.push({k:'wind',lv:'y',t:'Gió lùa',tab:'wx',why:'Gió lọt vào '+pc(rc.wind)+'.',eff:'Bé thấy <b>lạnh hơn</b> '+n1(rc.wind*4)+'°C, <b>giảm thoải mái</b>.'});
  if(rc.noise)L.push({k:'noise',lv:'y',t:'Sấm sét',tab:'wx',why:'Đang mưa giông.',eff:'Các bé <b>giảm vui</b> mỗi phút.'});
  if(rc.hum>W.comfyHum[1])L.push({k:'humhi',lv:'y',t:'Độ ẩm cao',tab:'hum',why:'Độ ẩm '+rc.hum+'%, trên '+W.comfyHum[1]+'%.',eff:'<b>Giảm thoải mái</b> '+Math.round(W.comfort.humPen*dI(rc.hum,W.comfyHum))+' điểm. Không hại gì khác.'});
  else if(rc.hum<W.comfyHum[0])L.push({k:'humlo',lv:'y',t:'Quá khô',tab:'hum',why:'Độ ẩm '+rc.hum+'%, dưới '+W.comfyHum[0]+'%.',eff:'<b>Giảm thoải mái</b> '+Math.round(W.comfort.humPen*dI(rc.hum,W.comfyHum))+' điểm. Không hại gì khác.'});
  const dead=rc.D.off.filter(d=>d.why==='hết pin');
  if(dead.length)L.push({k:'bat',lv:'y',t:'Thiết bị hết pin',tab:'fix',why:dead.map(d=>d.f.n).join(', ')+'.',eff:'Máy <b>ngừng chạy</b>, mất tác dụng tới khi sạc.'});
  return L.sort((a,b)=>(a.lv==='r'?0:1)-(b.lv==='r'?0:1));
}

/* ---------- thiết bị gợi ý cho từng vấn đề (rẻ, yếu trước; mạnh, cấp cao sau) ---------- */
const WG_DEV={
  cold:['bheater','bwarmlamp','heatmini','thermcurtain','heatlamp','furblanket','eblanket','heatmat','heatcatbed','glassdoor','heatpro','wintercathouse','fireplace','ac2','gardenhouse'],
  hot:['bfan','bicefan','fanmini','sunblind','coolmat','fanstand','coolbed','fanceiling','aircooler','mistfan','shadetree','ac1','insulcathouse','ac2'],
  wet:['raincurtain','raintent','balconyroof','hairdryer','dehumid','shadetree','gardenhouse'],
  wind:['raincurtain','winddoor','glassdoor'],
  noise:['whitenoise'],
  humhi:['dehumid'],humlo:['humidifier','bicefan','aircooler','mistfan'],
  comf:['furblanket','airpurifier','fanceiling','premiumpad','fireplace'],
};
// thiết bị đang chạy mà làm vấn đề nặng thêm (quạt lúc lạnh, sưởi lúc nóng): gợi ý tắt
const wgBad=(k,rid)=>(k==='cold'||k==='hot')?roomClimate(rid).D.on.filter(d=>{const w=d.f.wx;return !w.auto&&!(k==='cold'?w.heat:w.cool)&&(k==='cold'?w.cool:w.heat)}):[];
const dvFx=f=>{const w=f.wx,F=[];
  if(w.heat)F.push('🔥 +'+n1(w.heat)+'°C');if(w.cool)F.push('❄️ −'+n1(w.cool)+'°C');if(w.auto)F.push('tự động');if(w.ins)F.push('cách nhiệt '+pc(w.ins));if(w.sun)F.push('chống nắng');
  if(w.shelter)F.push('che mưa '+pc(w.shelter));if(w.wind)F.push('chắn gió '+pc(w.wind));if(w.hum)F.push('💧 '+(w.hum>0?'+':'−')+Math.abs(w.hum)+'%');if(w.comfort)F.push('😌 +'+w.comfort);
  if(w.lheat)F.push('ổ ấm +'+w.lheat+'°C');if(w.lcool)F.push('ổ mát −'+w.lcool+'°C');if(w.lauto)F.push('ổ tự chỉnh ±'+w.lauto+'°C');if(w.lshelter)F.push('ổ không ướt');if(w.dry)F.push('sấy khô');if(w.quiet)F.push('át tiếng sấm');
  return F.join(' · ')+(f.pw?' · 🔋 chạy pin':'')};
// trạng thái một món ở phòng rid và nút làm ngay; pri nhỏ thì làm trước
function wgAct(id,rid){
  const f=FURN[id];if(!f||!devOk(f,rid))return null;
  const D=roomClimate(rid).D,mine=S.items.filter(i=>i.fid===id),here=[...D.on,...D.off].filter(d=>d.i.fid===id);
  const on=here.find(d=>!d.why),dead=here.find(d=>d.why==='hết pin'),off=here.find(d=>d.why==='đang tắt'),brk=here.find(d=>d.why==='đang hỏng');
  if(on)return {pri:9,h:wl('g','Đang chạy')};
  if(off)return {pri:1,h:'<button class="sm on" onclick="wgToggle('+off.i.iid+')">▶ Bật</button>'};
  if(dead)return {pri:2,h:'<button class="sm" onclick="openPw('+dead.i.iid+')">🔌 Sạc</button>'};
  if(brk)return {pri:8,h:wl('y','Đang hỏng')};
  if(mine.some(i=>i.room==null))return {pri:3,h:'<button class="sm" onclick="wgPlace(\''+rid+'\')">📦 Đặt từ kho</button>'};
  if(locked(f))return {pri:7,h:'<span class="wl wl-x">🔒 Cấp '+f.ul+'</span>'};
  return {pri:4,h:'<button class="sm" onclick="wgBuy(\''+id+'\')">🛒 '+f.price.toLocaleString('vi-VN')+' xu</button>'};
}
// các dòng gợi ý cho vấn đề k ở phòng rid: món làm nặng thêm (tắt), rồi món sẵn có, mua được, cuối cùng một món còn khóa
function wgRows(k,rid){
  const R=wgBad(k,rid).map(d=>({id:d.f.id,pri:0,note:'đang làm phòng '+(k==='cold'?'lạnh':'nóng')+' thêm',h:'<button class="sm" onclick="wgToggle('+d.i.iid+')">⏸ Tắt</button>'}));
  if(k==='bat')roomClimate(rid).D.off.filter(d=>d.why==='hết pin').forEach(d=>R.push({id:d.f.id,pri:2,note:'hết pin',h:'<button class="sm on" onclick="openPw('+d.i.iid+')">🔌 Sạc</button>'}));
  let nl=0;(WG_DEV[k]||[]).forEach(id=>{const a=wgAct(id,rid);if(!a)return;if(a.pri===7){if(nl++)return}R.push({id,...a})});
  return R.sort((a,b)=>a.pri-b.pri);
}
const wgRow=r=>{const f=FURN[r.id];return '<div class="wg-dev">'+furnTag(f.id,'',34,26)+'<div class="g"><b>'+f.n+'</b>'+(r.note?' <span class="wl wl-y">'+r.note+'</span>':'')+'<br><small>'+dvFx(f)+'</small></div>'+r.h+'</div>'};
// phòng khác đang dễ chịu, để chuyển bé sang
const wgRooms=rid=>ownedRooms().filter(r=>r.id!==rid).map(r=>({r,c:roomClimate(r.id)})).filter(x=>x.c.T>=WXC.ideal[0]&&x.c.T<=WXC.ideal[1]&&x.c.comfort>=CF_HI).sort((a,b)=>b.c.comfort-a.c.comfort).slice(0,2);

/* ---------- trang chi tiết phòng ---------- */
function climHtml(rid){
  const rc=roomClimate(rid),R=ROOM_CLIMATE[rid]||{},o=rc.o,th=rc.D.on.some(d=>d.f.wx.thermo),I=wxIssues(rid),cats=homeCats(rid);
  const sRow=(ic,lab,tip,val,st,tab)=>'<div class="wg-st"><span class="k">'+ic+' '+lab+' '+wInfo(tip,lab)+'</span><span class="v">'+val+'</span><button class="wg-lv" onclick="bookGuide(\''+tab+'\',\''+rid+'\')" aria-label="Giải thích '+lab+'">'+wl(st[0],st[1])+'</button></div>';
  const card=x=>{const a=wgRows(x.k,rid).filter(r=>r.pri<7).slice(0,2);
    return '<div class="wg-card wg-'+x.lv+'"><div class="wg-ct">'+wl(x.lv,x.lv==='r'?'Nguy hiểm':'Cảnh báo')+' <b>'+x.t+'</b> <small class="dim">'+x.why+'</small></div>'+
      '<div class="wg-eff">'+x.eff+'</div>'+
      '<div class="wg-acts">'+a.map(r=>'<span class="wg-a">'+furnTag(r.id,'',22,18)+'<small>'+FURN[r.id].n+'</small>'+r.h+'</span>').join('')+
      '<button class="sm wg-more" onclick="bookGuide(\'fix\',\''+rid+'\',\''+x.k+'\')">💡 Xem cách xử lý ›</button></div></div>'};
  const dv=d=>{const w=d.f.wx,man=(w.heat||w.cool)&&!w.auto&&!th,dead=typeof pwDead==='function'&&pwDead(d.i);
    return '<div class="wg-dev">'+furnTag(d.f.id,'',34,26)+'<div class="g"><b>'+d.f.n+'</b>'+(d.why?' '+wl(d.why==='hết pin'||d.why==='đang hỏng'?'r':'y',d.why):'')+'<br><small>'+dvFx(d.f)+(d.f.pw?' · '+batTxt(d.i):'')+'</small></div>'+
      (d.why==='hết pin'?'<button class="sm on" onclick="openPw('+d.i.iid+')">🔌 Sạc</button>':man&&!d.i.broken&&!dead?'<button class="sm'+(d.i.off?'':' on')+'" onclick="wxToggle('+d.i.iid+')">'+(d.i.off?'▶ Bật':'⏸ Tắt')+'</button>':'')+'</div>'};
  return '<h3>🌡 '+ROOM[rid].n+'</h3>'+
    '<div class="wg-sts">'+
      sRow('🌡','Nhiệt độ','Dễ chịu '+WXC.ideal[0]+'–'+WXC.ideal[1]+'°C. Bé thấy lạnh dưới '+WXC.coldAt+'°C, nóng trên '+WXC.hotAt+'°C (tính cả lúc ướt, gió lùa, ổ nằm).','<b>'+fmtT(rc.T)+'</b>',stTemp(rc.T),'temp')+
      sRow('💧','Độ ẩm','Dễ chịu '+WXC.comfyHum[0]+'–'+WXC.comfyHum[1]+'%. Lệch thì chỉ giảm thoải mái, không hại mèo.','<b>'+rc.hum+'%</b>',stHum(rc.hum),'hum')+
      sRow('😌','Thoải mái','Điểm 0–100 của phòng. Từ '+CF_HI+': mèo vui hơn, ngủ ngon, bé ốm khỏi dần. Dưới '+CF_LO+': không tự hồi sức khỏe.','<b>'+rc.comfort+'</b>/100'+wxBar(rc.comfort,comfCol(rc.comfort)),stComf(rc.comfort),'comf')+
      sRow(o.w.ic,'Ngoài trời','Thời tiết chung của mọi người chơi, đổi mỗi 5 giờ. '+(R.out?'Phòng này ở ngoài trời: chịu mưa, gió trực tiếp.':'Phòng này lọt '+pc(rc.exp)+' nhiệt độ ngoài trời.'),o.w.n+' · '+fmtT(o.temp),stWx(o),'wx')+
    '</div>'+
    (I.length?'<h4>⚠ Cần xử lý ('+I.length+')</h4>'+I.map(card).join(''):'<div class="wg-ok">'+wl('g','Phòng ổn')+' Mèo sinh hoạt bình thường, không cần làm gì.</div>')+
    '<div class="row wrap wg-btns"><button class="sm" onclick="bookGuide(null,\''+rid+'\')">📖 Giải thích nhanh</button></div>'+
    '<details class="wg-more-d"><summary>📋 Số liệu chi tiết</summary><div class="cd-sec"><div class="cd-grid">'+
      '<div class="k">Ngoài trời</div><div>'+o.w.ic+' '+o.w.n+' · '+fmtT(o.temp)+' · 💧 '+o.hum+'%</div>'+
      '<div class="k">Thông với ngoài</div><div>'+(R.out?'Phòng ngoài trời':'Hở '+pc(R.exp||0))+' · cách nhiệt '+pc(rc.ins)+'</div>'+
      '<div class="k">Sưởi / làm mát</div><div>🔥 '+n1(rc.heat)+'° · ❄️ '+n1(rc.cool)+'°'+(th?' · tự động':'')+'</div>'+
      '<div class="k">Mưa, gió, ồn</div><div>'+(rc.rain>.05?'☔ '+pc(rc.rain):'không mưa tạt')+' · '+(rc.wind>.05?'🌬 '+pc(rc.wind):'không gió lùa')+(rc.noise?' · ⚡ sấm':'')+'</div></div></div></details>'+
    '<h4>Thiết bị có tác dụng ('+rc.D.on.length+')</h4>'+(rc.D.on.length?rc.D.on.map(dv).join(''):'<div class="dim">Chưa có. Xem gợi ý ở 📖 Giải thích nhanh › 💡 Xử lý.</div>')+
    (rc.D.off.length?'<h4>Không có tác dụng ('+rc.D.off.length+')</h4>'+rc.D.off.map(dv).join(''):'')+
    (cats.length?'<h4>Các bé trong phòng</h4>'+cats.map(c=>'<div class="card tap" style="padding:6px 10px" onclick="openCat('+c.uid+')">'+catTag(lk(c),1)+'<div class="g">'+nm(c)+' <small>· cảm thấy '+fmtT(wxFeel(c).feel)+'</small><br>'+wxBadges(c,1)+'</div></div>').join(''):'');
}

/* ---------- trang "Giải thích nhanh" ---------- */
const WG_TABS=[['temp','🌡','Nhiệt độ'],['hum','💧','Độ ẩm'],['comf','😌','Thoải mái'],['wx','⛈','Thời tiết'],['fix','💡','Xử lý']];
// một dòng giải thích: nhãn màu, ngưỡng, nội dung; cur = phòng đang ở đúng mức này
const gl=(k,lab,rng,txt,cur)=>'<li class="wg-li'+(cur?' cur':'')+'">'+wl(k,lab)+(rng?' <small class="wg-rng">'+rng+'</small>':'')+' <span>'+txt+'</span>'+(cur?' <b class="wg-here">◀ phòng này</b>':'')+'</li>';
function wgTab(t,rid){
  const W=WXC,rc=rid&&roomClimate(rid),T=rc&&rc.T,hm=rc&&rc.hum,cf=rc&&rc.comfort,ul='<ul class="wg-ul">',P=typeof pwOpen==='function'&&pwOpen();
  if(t==='temp')return ul+
    gl('b','Chỉ số','','<b>Nhiệt độ phòng</b> = trời ngoài lọt vào (theo mức hở) + sưởi − làm mát. Mỗi bé còn có <b>nhiệt độ cảm thấy</b>: ướt −'+W.wetFeel+'°C, gió lùa tới −4°C, nằm ổ sưởi hoặc ổ mát thì cộng trừ.')+
    gl('g','Dễ chịu',W.ideal[0]+'–'+W.ideal[1]+'°C','Mèo sinh hoạt bình thường.',rc&&T>=W.ideal[0]&&T<=W.ideal[1])+
    gl('y','Hơi lạnh / hơi nóng',W.coldAt+'–'+W.ideal[0]+'°C, '+W.ideal[1]+'–'+W.hotAt+'°C','Chỉ <b>giảm thoải mái</b> ('+W.comfort.degPen+' điểm mỗi độ), chưa hại mèo.',rc&&((T>=W.coldAt&&T<W.ideal[0])||(T>W.ideal[1]&&T<=W.hotAt)))+
    gl('r','Quá lạnh','cảm thấy dưới '+W.coldAt+'°C','<b>Giảm vui</b>, <b>giảm năng lượng</b>, nhanh đói. Lâu thì <b>Lạnh 🥶</b>, có thể <b>Ốm 🤒</b>. Dưới '+W.freezeAt+'°C <b>mất sức khỏe</b>.',rc&&T<W.coldAt)+
    gl('r','Quá nóng','cảm thấy trên '+W.hotAt+'°C','<b>Giảm vui</b>, <b>giảm năng lượng</b>, <b>nhanh khát</b>. Lâu thì <b>Nóng quá 🥵</b>. Trên '+W.scorchAt+'°C <b>mất sức khỏe</b>.',rc&&T>W.hotAt)+
    gl('f','Khắc phục','','Lạnh: <b>máy sưởi</b>, rèm giữ nhiệt, chăn ấm, <b>tắt quạt</b>. Nóng: <b>quạt</b>, điều hòa, rèm chống nắng, thảm mát, <b>tắt sưởi</b>, đổ nước. Hoặc <b>chuyển bé</b> sang phòng dễ chịu. Bé đã Lạnh: Súp nóng; Nóng quá: Gel làm mát.')+'</ul>';
  if(t==='hum')return ul+
    gl('b','Chỉ số','','<b>Độ ẩm</b> theo trời ngoài và loại phòng (phòng tắm, nhà kính ẩm hơn). Chỉ ảnh hưởng tới độ thoải mái.')+
    gl('g','Bình thường',W.comfyHum[0]+'–'+W.comfyHum[1]+'%','Mèo thoải mái.',rc&&hm>=W.comfyHum[0]&&hm<=W.comfyHum[1])+
    gl('y','Độ ẩm cao','trên '+W.comfyHum[1]+'%','<b>Giảm thoải mái</b> '+n1(W.comfort.humPen)+' điểm mỗi %. Không hại gì khác.',rc&&hm>W.comfyHum[1])+
    gl('y','Quá khô','dưới '+W.comfyHum[0]+'%','<b>Giảm thoải mái</b> '+n1(W.comfort.humPen)+' điểm mỗi %. Không hại gì khác.',rc&&hm<W.comfyHum[0])+
    gl('f','Khắc phục','','Ẩm: <b>Máy hút ẩm</b> (−20%, lông ướt khô nhanh hơn). Khô: <b>Máy tạo độ ẩm</b> (+15%) hoặc quạt hơi nước.')+'</ul>';
  if(t==='comf')return ul+
    gl('b','Chỉ số','','<b>Thoải mái</b> 0–100: bắt đầu từ 100, trừ khi nhiệt độ, độ ẩm lệch, gió lùa, mưa tạt, sấm; đồ tiện nghi cộng tối đa +'+W.comfort.devCap+'. Mỗi bé nhích dần về mức của phòng; bé ướt, lạnh, nóng, ốm, khát thì thấp hơn.')+
    gl('g','Cao','từ '+CF_HI,'Mèo <b>vui hơn</b>, hồi năng lượng nhanh, bé ốm khỏi dần, ngủ dậy được <b>Ngủ ngon 🌙</b>. Từ 75: <b>Thoải mái 😌</b> (+5 vui).',rc&&cf>=CF_HI)+
    gl('y','Trung bình',CF_LO+'–'+(CF_HI-1),'Vẫn tự hồi sức khỏe, nhưng <b>bé ốm không tự khỏi</b>; dưới 50 bắt đầu <b>giảm vui</b>.',rc&&cf>=CF_LO&&cf<CF_HI)+
    gl('r','Thấp','dưới '+CF_LO,'<b>Không tự hồi sức khỏe</b>, <b>giảm vui</b>, <b>hồi năng lượng chậm</b>.',rc&&cf<CF_LO)+
    gl('f','Khắc phục','','Sửa nhiệt độ, độ ẩm, mưa gió trước. Thêm <b>Máy lọc không khí</b>, Quạt trần, Lò sưởi, Chăn lông, Đệm cao cấp. Hoặc <b>chuyển phòng</b>.')+'</ul>';
  if(t==='wx'){const o=wxNow();return ul+
    gl('b','Chỉ số','','Thời tiết chung của mọi người chơi, đổi mỗi 5 giờ. <b>Phòng ngoài trời</b> (ban công, sân vườn, sân thượng, hồ bơi) chịu mạnh nhất. Bây giờ: '+o.w.ic+' '+o.w.n+'.')+
    ['storm','blizzard','heatwave','snow','cold','hot','drizzle','wind','fog'].map(id=>{const w=WX[id];
      return gl(w.bad>=2?'r':'y',w.ic+' '+w.n,'',w.d+(id==='storm'&&P?' Thỉnh thoảng <b>sét đánh mất điện</b>, mèo <b>hoảng sợ</b>.':''),o.type===id)}).join('')+
    gl('y','☔ Mưa tạt','','Bé <b>bị ướt</b>: thấy lạnh thêm '+W.wetFeel+'°C, thoải mái của bé −25.',rc&&rc.rain>.2)+
    gl('y','🌬 Gió lùa','','Bé thấy <b>lạnh hơn</b> tới 4°C, phòng <b>giảm thoải mái</b>.',rc&&rc.wind>.3)+
    gl('f','Khắc phục','','<b>Cho mèo vào nhà</b>. Phòng ngoài trời: mái che, rèm chắn mưa, lều trú mưa. Gió: cửa chống gió. Sấm: <b>Máy tạo tiếng ồn trắng</b>. Lắp <b>Trạm dự báo</b> để biết sớm.')+'</ul>'}
  // Xử lý: theo đúng vấn đề của phòng đang xem; không có phòng thì gợi ý chung
  const I=rid?wxIssues(rid):[],k0=WB.g&&WB.g.k,bat='<div class="wg-tip">🔋 Thiết bị hết pin: bấm <b>🔌 Sạc</b>, chọn ổ điện trong cùng phòng và trả xu. <b>Pin không tự sạc.</b></div>';
  if(rid&&I.length){const mv=wgRooms(rid);
    return I.map(x=>'<div class="wg-fix'+(x.k===k0?' cur':'')+'" data-k="'+x.k+'"><div class="wg-ct">'+wl(x.lv,x.t)+' <small class="dim">'+x.why+'</small></div>'+
      wgRows(x.k,rid).map(wgRow).join('')+(x.k==='bat'?bat:'')+'</div>').join('')+
      (mv.length?'<div class="wg-tip">🚪 Hoặc chuyển bé sang: '+mv.map(x=>'<b>'+x.r.n+'</b> ('+fmtT(x.c.T)+', thoải mái '+x.c.comfort+')').join(', ')+'. Mở bé trong tab Mèo để đổi phòng.</div>':'')}
  return (rid?'<div class="wg-ok">'+wl('g','Phòng '+ROOM[rid].n+' đang ổn')+'</div>':'')+
    [['cold','❄️ Lạnh'],['hot','🔥 Nóng'],['wet','☔ Mưa tạt'],['wind','🌬 Gió lùa'],['noise','⚡ Sấm'],['humhi','💧 Ẩm'],['humlo','🏜 Khô'],['comf','😌 Kém thoải mái']].map(([k,t])=>
      '<div class="wg-gen"><b>'+t+'</b>: '+WG_DEV[k].slice(0,5).map(id=>{const f=FURN[id];return f.n+(locked(f)?' <span class="wl wl-x">🔒 Cấp '+f.ul+'</span>':'')}).join(', ')+'</div>').join('')+bat+
    '<div class="wg-tip">Mở trang một phòng để thấy món nào đang có, món nào cần bật, sạc hay mua.</div>';
}
function guideSheet(){
  const g=WB.g,rid=g.rid&&S.rooms[g.rid]?g.rid:null;
  return '<div class="wb-sheet"><div class="wb-bar"><button class="sm wb-back" onclick="bookGuideBack()">‹ '+(rid?ROOM[rid].n:'Danh sách phòng')+'</button>'+
    (typeof openHandbook==='function'?'<button class="sm" onclick="openHandbook(\''+(g.t==='fix'?'climfix':'climstat')+'\')" data-tip="Sổ tay: công thức và số liệu đầy đủ">📖 Sổ tay</button>':'')+'</div>'+
    '<h3>Giải thích nhanh'+(rid?' · '+ROOM[rid].n:'')+'</h3>'+
    '<div class="wg-tabs" role="tablist">'+WG_TABS.map(x=>'<button class="sm'+(x[0]===g.t?' on':'')+'" role="tab" aria-selected="'+(x[0]===g.t)+'" onclick="bookGuideTab(\''+x[0]+'\')"><span>'+x[1]+'</span> <span>'+x[2]+'</span></button>').join('')+'</div>'+
    '<div class="wb-det wg-body">'+wgTab(g.t,rid)+'</div></div>';
}
{const B0=bookRight;bookRight=function(){return WB.g?guideSheet():B0.apply(this,arguments)}}
// mở trang giải thích: t mục (bỏ trống thì chọn theo vấn đề nặng nhất của phòng), rid phòng đang xem, k vấn đề cần làm nổi bật
function bookGuide(t,rid,k){
  rid=rid&&S.rooms[rid]?rid:null;
  if(!t){const I=rid?wxIssues(rid):[];t=I.length?I[0].tab:'temp'}
  WB.g={t,rid,k:k||null};WB.dir='fl';
  if(!bookOn()){openBook(rid);WB.g={t,rid,k:k||null}}
  bookDraw('r');wgFocus();
}
function bookGuideTab(t){if(!WB.g)return;WB.g.t=t;WB.g.k=null;bookDraw('r');const b=document.querySelector('#wxbook .wg-body');if(b)b.classList.add('wg-in')}
function bookGuideBack(){const g=WB.g;WB.g=null;WB.rid=g&&g.rid&&S.rooms[g.rid]?g.rid:null;WB.dir='fr';if(!WB.rid)WB.fit=0;bookDraw('r')}
const wgFocus=()=>setTimeout(()=>{const e=document.querySelector('#wxbook .wg-fix.cur');if(e)e.scrollIntoView({block:'nearest'})},60);
function wgToggle(iid){const it=S.items.find(i=>i.iid===iid);if(!it)return;it.off=!it.off;wxDirty();save();bookDraw('r');if(tab==='home')renderPanel()}
function wgBuy(id){const f=FURN[id];if(!f)return;closeBook();shopT=f.cat;shopSel=id;setTab('shop')}
function wgPlace(rid){closeBook();if(tab!=='home')setTab('home');if(cur!==rid)setRoom(rid);if(!edit)toggleEdit();toast('Chọn món trong kho đồ bên dưới rồi đặt vào '+ROOM[rid].n+'.',{icon:'📦',title:'Đặt thiết bị',key:'wgplace'})}
