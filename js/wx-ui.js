"use strict";
/* ============ THỜI TIẾT: GIAO DIỆN ============
   Nạp sau ui.js, quest.js, achieve.js, wish.js. Bọc các hàm có sẵn (renderTop, PANEL.home, PANEL.shop, PANEL.trip, entPos, choose, stepEnt, critStep, critDraw)
   giống cách quest.js làm, nên ui.js chỉ cần vài móc nhỏ (stats, openCat, drawPicker, doTrip, drawItem).
   - Thanh thời tiết trên cùng (biểu tượng, nhiệt độ, mùa, ⚠ khi sắp có thời tiết nguy hiểm), bấm vào xem dự báo: openWeather.
   - Dòng khí hậu phòng dưới nút Cho ăn, bấm vào xem chi tiết và bật tắt thiết bị: openClimate. Nút Đổ nước (miễn phí).
   - Trạng thái mèo: biểu tượng trên thẻ (wxBadges), mục Sức khỏe và thời tiết trong màn chi tiết (wxCatSec), dùng vật phẩm ở nhà.
   - Cửa hàng: tab 🎒 Sinh tồn (vật phẩm dùng một lần). Viễn chinh: khung chuẩn bị (wxPrep), tỉ lệ thành công từng bé (wxRiskTag), nhật ký.
   - Hiệu ứng trong phòng: mưa, tuyết, sấm chớp, gió, sương, nắng nóng (phòng ngoài trời rõ, phòng trong nhà chỉ thấy nhẹ ở vùng tường);
     thiết bị đang chạy có hạt (hơi ấm, gió mát, sương, hơi nước) và khung hoạt ảnh; mèo run khi lạnh, thở dốc khi nóng, nhỏ nước khi ướt,
     tự tìm tới máy sưởi, chăn ấm khi lạnh và thảm, giường làm mát khi nóng; bé khát chạy ra bát nước. */
const WXU={warned:{},alert:{},p:[],flash:0,bolt:0,last:''};
const fmtL=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h?h+' giờ'+(m%60?' '+m%60+' phút':''):m+' phút'}; // thời lượng dài: "4 giờ 12 phút"
const fmtT=v=>String(Math.round(v*10)/10).replace('.',',')+'°C';
const hhmm=t=>{const d=new Date(t+WXC.tz*3600000);return String(d.getUTCHours()).padStart(2,'0')+':'+String(d.getUTCMinutes()).padStart(2,'0')};
const wxAhead=()=>wxForecast(wxHasStation()?WXC.warnAhead+1:WXC.warnAhead);
const wxNextDanger=()=>{const o=wxNow();return wxDanger(o)?o:wxAhead().find(wxDanger)};
const wxBar=(v,col)=>'<div class="bar" style="margin:3px 0 0"><i style="width:'+Math.round(clamp(v,0,100))+'%;background:'+col+'"></i></div>';

/* ---------- thanh thời tiết và dự báo ---------- */
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);
  const o=wxNow(),dg=wxOpen()&&wxNextDanger(),el=document.createElement('div');el.className='chip tap wxchip';el.setAttribute('onclick','openWeather()');
  if(!wxOpen()){el.className='chip wxchip lock';el.setAttribute('data-tip','Thời tiết và khí hậu phòng mở khóa ở cấp '+WX_LV+'.');el.innerHTML='🔒 Thời tiết <span class="dim">· cấp '+WX_LV+'</span>'}
  else el.innerHTML=o.w.ic+' <b>'+Math.round(o.temp)+'°</b> <span class="dim">'+o.season.ic+' '+o.season.n+'</span>'+(dg?' <b style="color:var(--bad)">⚠</b>':'');
  emoEl(el);const top=$('top'),xp=top.querySelector('.xp');top.insertBefore(el,xp||null);
}}
// openWeather, openClimate: nay mở cuốn sách khí hậu (xem mục CUỐN SÁCH KHÍ HẬU bên dưới)
// cảnh báo sớm thời tiết nguy hiểm, báo khi trời chuyển xấu, cảm biến báo phòng khó chịu
setInterval(()=>{
  if(!S||!S.tut||!S.tut.done||!wxOpen())return;
  const o=wxNow(),dg=wxNextDanger();
  if(dg&&dg.s>wxClock()&&!WXU.warned[dg.s]){WXU.warned[dg.s]=1;const out=ownedRooms().filter(r=>(ROOM_CLIMATE[r.id]||{}).out&&homeCats(r.id).length).map(r=>r.n);
    toast(dg.w.ic+' '+dg.w.n+' lúc '+hhmm(dg.s)+' (còn '+fmtL(dg.s-wxClock())+'). '+(out.length?'Đưa các bé ở '+out.join(', ')+' vào trong nhà hoặc lắp mái che.':'Chuẩn bị máy sưởi, quạt hoặc vật phẩm sinh tồn nếu sắp đi viễn chinh.'),{icon:'⚠️',title:'Cảnh báo thời tiết',key:'wxwarn',ms:10000})}
  if(WXU.last&&WXU.last!==o.type&&o.w.bad>=1)toast('Trời chuyển '+o.w.n.toLowerCase()+', '+fmtT(o.temp)+'. '+o.w.d,{icon:o.w.ic,title:'Thời tiết',key:'wxchg'});
  WXU.last=o.type;
  ownedRooms().forEach(r=>{const rc=roomClimate(r.id);if(!rc.sensor)return;const bad=homeCats(r.id).filter(c=>['cold','hot','wet','sick'].some(k=>wxHas(c,k)));
    if((bad.length||rc.comfort<35)&&now()>=(WXU.alert[r.id]||0)){WXU.alert[r.id]=now()+600000;toast(r.n+': '+fmtT(rc.T)+', thoải mái '+rc.comfort+(bad.length?'. '+bad.slice(0,3).map(c=>c.name).join(', ')+' đang '+bad.slice(0,3).map(c=>WXST[wxSt(c).find(k=>['cold','hot','wet','sick'].includes(k))].n.toLowerCase()).join(', '):'')+'.',{icon:'📟',title:'Cảm biến',key:'wxsensor'})}});
},5000);

/* ---------- khí hậu phòng ---------- */
const wxLine=rid=>{if(!wxOpen())return '';const rc=roomClimate(rid),wb=wbowls(rid),wl=wb.reduce((a,b)=>a+(b.w||0),0),wc=wb.reduce((a,b)=>a+FURN[b.fid].water.cap,0),n=rc.D.on.length;
  return '<div class="wxline"><div class="g tap" onclick="openClimate()">🌡 <b>'+fmtT(rc.T)+'</b> <span class="dim">(ngoài '+fmtT(rc.o.temp)+' '+rc.o.w.ic+')</span> · 💧 '+rc.hum+'% · 😌 <b style="color:'+(rc.comfort>=60?'var(--good)':rc.comfort>=35?'var(--gold)':'var(--bad)')+'">'+rc.comfort+'</b>'+(rc.rain>.2?' · ☔':'')+(rc.wind>.3?' · 🌬':'')+(rc.noise?' · ⚡':'')+' · '+(n?n+' thiết bị':'chưa có thiết bị')+' <span class="dim">›</span></div>'+
    (wb.length?'<button class="sm" onclick="doWater()">💧 Đổ nước '+wl+'/'+wc+'</button>':'')+'</div>'};
{const H0=PANEL.home;PANEL.home=function(){const h=H0.apply(this,arguments);if(edit)return h;const k='Sắp xếp đồ</button></div></div>',i=h.indexOf(k);return i<0?wxLine(cur)+h:h.slice(0,i+k.length)+wxLine(cur)+h.slice(i+k.length)}}
function doWater(){const n=fillWater(cur);toast(n?'Đã đổ đầy '+n+' bát nước ở '+ROOM[cur].n+'.':'Các bát nước đều đang đầy.',{icon:'💧',title:'Nước uống',key:'water'});renderPanel()}
function wxToggle(iid,dev){const it=S.items.find(i=>i.iid===iid);if(!it)return;it.off=!it.off;wxDirty();save();if(dev)openDev(iid);else openClimate()}
// thiết bị bật tắt tay (máy sưởi, quạt thường và loại chạy pin): chạm vào món trong phòng mở bảng nhỏ (ui.js ptrEnd gọi wxDevTap)
const batTxt=i=>i.chg?'đang sạc, chạy lại sau '+fmtL(batLeft(i)):'pin còn '+fmtL(batLeft(i));
function wxDevTap(it){const f=FURN[it.fid],w=f.wx;if(!w||!(f.bat||((w.heat||w.cool)&&!w.auto)))return false;openDev(it.iid);return true}
function openDev(iid){
  const i=S.items.find(x=>x.iid===iid);if(!i||!i.room){closeModal();return}
  const f=FURN[i.fid],w=f.wx,rc=roomClimate(i.room),on=rc.D.on.some(d=>d.i===i),off=rc.D.off.find(d=>d.i===i),th=rc.D.on.some(d=>d.f.wx.thermo);
  const st=i.broken?'Đang hỏng':i.chg?'Hết pin, tự ngắt để sạc':i.off?'Đang tắt':on?(th?'Đang bật · bộ điều chỉnh nhiệt độ tự chạy khi cần':'Đang chạy'):(off?off.why:'');
  const pct=f.bat?(i.bat==null?100:i.bat/f.bat.run*100):0;
  modal('<h3>'+f.n+'</h3><div style="text-align:center">'+furnTag(f.id,(!i.off&&!i.chg&&!i.broken&&f.anim)?'a1':'',96,72)+'</div>'+
    '<div class="cd-sec"><div class="cd-grid"><div class="k">Trạng thái</div><div><b style="color:'+(on?'var(--good)':'var(--bad)')+'">'+st+'</b></div>'+
    '<div class="k">Tác dụng</div><div>'+(w.heat?'🔥 ấm thêm '+String(w.heat).replace('.',',')+'°C ':'')+(w.cool?'❄️ mát '+String(w.cool).replace('.',',')+'°C':'')+'</div>'+
    (f.bat?'<div class="k">🔋 Pin</div><div>'+batTxt(i)+wxBar(pct,i.chg?'#ffb347':'#5fd08a')+'</div>':'')+
    '<div class="k">Phòng</div><div>'+ROOM[i.room].n+' · '+fmtT(rc.T)+'</div></div></div>'+
    '<div class="dim" style="margin-top:6px">'+f.d+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:8px">'+(i.broken||i.chg?'':'<button class="sm '+(i.off?'on':'')+'" onclick="wxToggle('+iid+',1)">'+(i.off?'▶ Bật':'⏸ Tắt')+'</button>')+'<button class="sm" onclick="openClimate(\''+i.room+'\')">🌡 Khí hậu phòng</button></div>');
}

function climHtml(rid){
  const rc=roomClimate(rid),R=ROOM_CLIMATE[rid]||{},o=rc.o,th=rc.D.on.some(d=>d.f.wx.thermo);
  const dv=d=>{const w=d.f.wx,man=d.f.bat||(w.heat||w.cool)&&!w.auto&&!th,fx=[];
    if(w.heat)fx.push('🔥 +'+w.heat+'°'+(w.auto||th?' (tự động)':''));if(w.cool)fx.push('❄️ −'+w.cool+'°'+(w.auto||th?' (tự động)':''));if(w.ins)fx.push('🧱 cách nhiệt '+Math.round(w.ins*100)+'%');if(w.sun)fx.push('🌤 chống nắng');if(w.shelter)fx.push('☂️ che mưa '+Math.round(w.shelter*100)+'%');
    if(w.wind)fx.push('🌬 chắn gió '+Math.round(w.wind*100)+'%');if(w.hum)fx.push('💧 '+(w.hum>0?'+':'')+w.hum+'% ẩm');if(w.comfort)fx.push('😌 +'+w.comfort);if(w.dry)fx.push('💨 sấy khô');if(w.quiet)fx.push('🎧 át tiếng sấm');if(w.lheat||w.lcool||w.lauto)fx.push('🛏 chỉnh nhiệt cho bé nằm trên');
    return '<div class="card" style="padding:6px 10px">'+furnTag(d.f.id,'',40,30)+'<div class="g"><b>'+d.f.n+'</b>'+(d.why?' <span class="dim">· '+d.why+'</span>':'')+'<br><small>'+(fx.join(' · ')||d.f.d)+(d.f.bat?' · 🔋 '+batTxt(d.i):'')+'</small></div>'+(man&&!d.i.broken&&!d.i.chg?'<button class="sm'+(d.i.off?'':' on')+'" onclick="wxToggle('+d.i.iid+')">'+(d.i.off?'Bật':'Đang bật')+'</button>':'')+'</div>'};
  const cats=homeCats(rid),tips=[];
  if(rc.T<WXC.ideal[0])tips.push('Phòng đang lạnh: đặt máy sưởi, rèm giữ nhiệt, chăn ấm, hoặc chuyển các bé sang phòng kín hơn.');
  if(rc.T>WXC.ideal[1])tips.push('Phòng đang nóng: đặt quạt, điều hòa, rèm chống nắng, thảm làm mát; nhớ đổ nước.');
  if(rc.rain>.2)tips.push('Mưa tạt vào phòng: lắp mái che, rèm chắn mưa hoặc lều trú mưa để các bé không bị ướt.');
  if(rc.wind>.3)tips.push('Gió lùa: cửa chống gió, cửa kính hoặc rèm chắn mưa giúp chắn gió.');
  if(rc.noise)tips.push('Sấm sét làm các bé kém vui: máy tạo tiếng ồn trắng át được tiếng sấm.');
  if(rc.hum<WXC.comfyHum[0]||rc.hum>WXC.comfyHum[1])tips.push(rc.hum>WXC.comfyHum[1]?'Phòng ẩm quá: máy hút ẩm giúp dễ chịu hơn.':'Phòng khô quá: máy tạo độ ẩm giúp dễ chịu hơn.');
  return '<h3>🌡 '+ROOM[rid].n+'</h3>'+
    '<div class="cd-sec"><div class="cd-grid"><div class="k">Ngoài trời</div><div>'+o.w.ic+' '+o.w.n+' · '+fmtT(o.temp)+' · 💧 '+o.hum+'%</div>'+
    '<div class="k">Trong phòng</div><div><b>'+fmtT(rc.T)+'</b> · 💧 '+rc.hum+'%</div>'+
    '<div class="k">Độ thoải mái</div><div><b>'+rc.comfort+'</b>/100'+wxBar(rc.comfort,rc.comfort>=60?'#5fd08a':rc.comfort>=35?'#ffb347':'#ff6b6b')+'</div>'+
    '<div class="k">Thông với ngoài</div><div>'+(R.out?'Phòng ngoài trời':'Hở '+Math.round((R.exp||0)*100)+'%')+' · cách nhiệt '+Math.round(rc.ins*100)+'%</div>'+
    '<div class="k">Sưởi / làm mát</div><div>🔥 '+String(Math.round(rc.heat*10)/10).replace('.',',')+'° · ❄️ '+String(Math.round(rc.cool*10)/10).replace('.',',')+'°'+(th?' · tự động':'')+'</div>'+
    '<div class="k">Mưa, gió, ồn</div><div>'+(rc.rain>.05?'☔ '+Math.round(rc.rain*100)+'%':'không mưa tạt')+' · '+(rc.wind>.05?'🌬 '+Math.round(rc.wind*100)+'%':'không gió lùa')+(rc.noise?' · ⚡ sấm':'')+'</div></div></div>'+
    (tips.length?'<div class="dim" style="text-align:left;margin-top:8px">💡 '+tips.join('<br>💡 ')+'</div>':'')+
    (typeof openHandbook==='function'?'<div class="row wrap" style="justify-content:center;margin-top:8px"><button class="sm" onclick="openHandbook(\'climstat\')">📖 Giải thích các chỉ số</button><button class="sm" onclick="openHandbook(\'climfix\')">🛠 Cách xử lý</button></div>':'')+
    '<h4 style="text-align:left;margin:12px 0 6px">Thiết bị có tác dụng ('+rc.D.on.length+')</h4>'+(rc.D.on.length?rc.D.on.map(dv).join(''):'<div class="dim">Chưa có. Mua ở Cửa hàng, các mục Giữ ấm, Làm mát, Chống thời tiết, Tiện nghi.</div>')+
    (rc.D.off.length?'<h4 style="text-align:left;margin:12px 0 6px">Không có tác dụng ('+rc.D.off.length+')</h4>'+rc.D.off.map(dv).join(''):'')+
    (cats.length?'<h4 style="text-align:left;margin:12px 0 6px">Các bé trong phòng</h4>'+cats.map(c=>'<div class="card tap" style="padding:6px 10px" onclick="openCat('+c.uid+')">'+catTag(lk(c),1)+'<div class="g">'+nm(c)+' <small>· cảm thấy '+fmtT(wxFeel(c).feel)+'</small><br>'+wxBadges(c,1)+'</div></div>').join(''):'');
}

/* ---------- CUỐN SÁCH KHÍ HẬU: trang trái dự báo thời tiết, trang phải khí hậu các phòng (chia trang nhỏ, lật giấy). CSS: css/wxbook.css ---------- */
const WXK={sunny:'sun',ideal:'bow',hot:'hot',heatwave:'hot',drizzle:'rain',storm:'storm',cold:'frost',snow:'snow',blizzard:'bliz',wind:'wind',fog:'fog'};
// biểu tượng thời tiết chuyển động (SVG 36×36): nắng, nắng nóng, cầu vồng, mưa, giông, lạnh, tuyết, bão tuyết, gió, sương mù
function wxIcon(type,sz){
  const k=WXK[type]||'sun',cloud=f=>'<path class="ol cl" fill="'+f+'" d="M5 21h3v-5h4v-4h10v3h6v4h4v6h-3v2H8v-2H5z"/>';
  const rays=c=>'<g class="rays">'+[0,45,90,135,180,225,270,315].map(a=>'<rect x="17" y="1.5" width="2" height="5" rx="1" fill="'+c+'" transform="rotate('+a+' 18 18)"/>').join('')+'</g>';
  const drops=(n,c)=>['a','b','c'].slice(0,n).map((q,i)=>'<rect class="drop '+q+'" x="'+(11+i*6)+'" y="27" width="2" height="4" rx="1" fill="'+c+'"/>').join('');
  const flakes='abc'.split('').map((q,i)=>'<rect class="flake '+q+'" x="'+(10+i*7)+'" y="27" width="2.6" height="2.6" fill="#7ab8ec"/>').join('');
  const gusts=y=>'abc'.split('').map((q,i)=>'<path class="gust '+q+'" d="M'+(7+i*2)+' '+(y+i*6)+'h'+(18-i*3)+'" stroke="#6f93b4" stroke-width="2.4" stroke-linecap="round" fill="none"/>').join('');
  let h='';
  if(k==='sun')h=rays('#f2a830')+'<circle class="ol sun" cx="18" cy="18" r="8" fill="#ffd24a"/>';
  else if(k==='hot')h=rays('#e8503a')+'<circle class="ol sun" cx="18" cy="16" r="8" fill="#ff8a3a"/><path class="hotw" d="M8 31q3-3 6 0t6 0t6 0" stroke="#e8503a" stroke-width="2" fill="none" stroke-linecap="round"/>';
  else if(k==='bow')h='<g class="bow">'+[['#e8504a',13],['#f2b030',10.5],['#5fbf7a',8],['#5a9ae0',5.5]].map(a=>'<path d="M'+(18-a[1])+' 24a'+a[1]+' '+a[1]+' 0 0 1 '+2*a[1]+' 0" stroke="'+a[0]+'" stroke-width="2.6" fill="none"/>').join('')+'</g><g transform="translate(0 7) scale(.82)" style="transform-origin:18px 18px">'+cloud('#ffffff')+'</g>';
  else if(k==='rain')h=cloud('#dbe4ee')+drops(3,'#4a9ae0');
  else if(k==='storm')h=cloud('#8a90a4')+drops(2,'#4a9ae0')+'<path class="ol bolt" fill="#ffd83a" d="M21 20l-6 8h4l-2 7 8-10h-4l3-5z"/>';
  else if(k==='frost')h='<g class="frost" stroke="#5aa6e6" stroke-width="2.4" stroke-linecap="round">'+[0,60,120].map(a=>'<path d="M18 5v26M18 9l-3-3M18 9l3-3M18 27l-3 3M18 27l3 3" transform="rotate('+a+' 18 18)" fill="none"/>').join('')+'</g>';
  else if(k==='snow')h=cloud('#ffffff')+flakes;
  else if(k==='bliz')h=cloud('#e6ecf4')+flakes+gusts(24);
  else if(k==='wind')h=gusts(10)+'<path class="gust b" d="M24 26q4-5 6 0q-3 2-6 0z" fill="#7fbf6a" stroke="#4e3026" stroke-width="1"/>';
  else h=[9,15,21,27].map((y,i)=>'<rect class="fog '+(i%2?'b':'')+'" x="'+(i%2?7:4)+'" y="'+y+'" width="'+(i%2?22:26)+'" height="3.4" rx="1.7" fill="#aab0c0"/>').join('');
  return '<svg class="wi'+(k==='bliz'?' fast':'')+'" width="'+(sz||36)+'" height="'+(sz||36)+'" viewBox="0 0 36 36" aria-hidden="true">'+h+'</svg>';
}
const WB={pg:0,rid:null,per:4,dir:''};
const bookOn=()=>{const e=$('wxbook');return !!(e&&e.classList.contains('on'))};
const comfCol=v=>v>=60?'#5fbf7a':v>=35?'#e8a83a':'#e0584a',comfTxt=v=>v>=60?'Dễ chịu':v>=35?'Tạm được':'Khó chịu';
// cảnh báo của một phòng: quá lạnh, quá nóng, mưa tạt, gió lùa, không hợp với mèo
function roomWarn(rc){
  const L=[];
  if(rc.T<WXC.coldAt)L.push(['c','❄️ Quá lạnh']);else if(rc.T<WXC.ideal[0])L.push(['w','Hơi lạnh']);
  if(rc.T>WXC.hotAt)L.push(['','🔥 Quá nóng']);else if(rc.T>WXC.ideal[1])L.push(['w','Hơi nóng']);
  if(rc.rain>.2)L.push(['c','☔ Mưa tạt']);if(rc.wind>.3)L.push(['w','🌬 Gió lùa']);
  if(rc.comfort<35)L.push(['','⚠ Không hợp với mèo']);
  return L;
}
function bookLeft(){
  const o=wxNow(),st=wxHasStation(),fc=wxForecast(st?6:3),se=o.season,t=wxClock(),nd=(wxDay(t)+1)*DAYMS-WXC.tz*3600000,ns=SEASONS[(SEASONS.indexOf(se)+1)%4];
  const dg=wxDanger(o)?o:fc.find(wxDanger),x2=v=>'×'+String(v).replace('.',',');
  const row=x=>'<div class="wb-fr'+(wxDanger(x)?' bad':'')+'">'+wxIcon(x.type,26)+'<div class="g"><b>'+hhmm(x.s)+'–'+hhmm(x.e)+'</b> · '+x.w.n+(wxDanger(x)?' <span class="wb-tag">⚠ nguy hiểm</span>':'')+'</div><b>'+fmtT(x.temp)+'</b></div>';
  return '<h3>Dự báo thời tiết</h3>'+
    '<div class="wb-now">'+wxIcon(o.type,68)+'<div><div class="t">'+fmtT(o.temp)+'</div><div class="n">'+o.w.n+'</div><small>còn '+fmtL(o.e-t)+' (tới '+hhmm(o.e)+')</small></div></div>'+
    '<div class="wb-chips"><span class="wb-chip">'+se.ic+' Mùa '+se.n+'</span><span class="wb-chip">💧 Ẩm '+o.hum+'%</span><span class="wb-chip">🌬 Gió '+(o.wind>=.7?'mạnh':o.wind>=.3?'vừa':'nhẹ')+'</span><span class="wb-chip" data-tip="Mỗi mùa kéo dài một ngày; thời tiết đổi mỗi 5 giờ và giống nhau với mọi người chơi.">'+ns.ic+' '+ns.n+' sau '+fmtL(nd-t)+'</span></div>'+
    (dg?'<div class="wb-warn">⚠ '+(dg===o?'Đang có '+o.w.n.toLowerCase()+'!':dg.w.n+' lúc '+hhmm(dg.s)+' (còn '+fmtL(dg.s-t)+').')+' Đưa các bé ở phòng ngoài trời vào nhà, bật sưởi hoặc quạt, hoãn viễn chinh nếu chưa có vật phẩm.</div>':'')+
    '<h4>'+fc.length+' đợt tới'+(st?'':' <span class="dim" style="text-transform:none;letter-spacing:0" data-tip="Lắp Trạm dự báo thời tiết (Cửa hàng, mục Chống thời tiết) để xem 6 đợt tới và được báo trước sớm hơn.">· 📡 thêm trạm để xem xa hơn</span>')+'</h4>'+
    '<div class="wb-fc">'+fc.map(row).join('')+'</div>'+
    '<div class="wb-fx"><b>🐱 Với mèo:</b> '+o.w.d+'<br><b>🎒 Viễn chinh:</b> thời gian '+x2(o.w.dur)+', năng lượng '+x2(o.w.cost)+(o.w.risk?', dễ gặp sự cố (+'+Math.round(o.w.risk*100)+'%)':', ít rủi ro')+(o.w.coin>1?', thưởng thêm xu':'')+'.</div>';
}
function bookRight(){
  const rooms=ownedRooms();
  if(WB.rid&&S.rooms[WB.rid])return '<div class="wb-sheet '+WB.dir+'"><button class="sm wb-back" onclick="bookRoom(null)">‹ Danh sách phòng</button><div class="wb-det">'+climHtml(WB.rid)+'</div></div>';
  WB.rid=null;
  const n=Math.max(1,Math.ceil(rooms.length/WB.per));WB.pg=clamp(WB.pg,0,n-1);
  const row=r=>{const rc=roomClimate(r.id),W=roomWarn(rc),on=rc.D.on,cls=rc.T<WXC.ideal[0]?'cold':rc.T>WXC.ideal[1]?'hot':rc.comfort>=60?'ok':'meh';
    return '<button class="wb-room '+cls+'" onclick="bookRoom(\''+r.id+'\')" aria-label="Khí hậu '+r.n+'"><div class="g"><div class="nm">'+(r.id===cur?'📍 ':'')+r.n+' <small>· '+homeCats(r.id).length+' bé</small></div>'+
      '<div class="ln">🌡 <b>'+fmtT(rc.T)+'</b> · 💧 '+rc.hum+'% · 😌 <b style="color:'+comfCol(rc.comfort)+'">'+rc.comfort+'</b> '+comfTxt(rc.comfort)+'</div>'+
      '<div class="bar"><i style="width:'+Math.round(clamp(rc.comfort,0,100))+'%;background:'+comfCol(rc.comfort)+'"></i></div>'+
      '<div class="ln">'+(W.length?W.map(w=>'<span class="wb-tag '+w[0]+'">'+w[1]+'</span>').join(' '):'<span class="wb-tag ok">✓ Phù hợp với mèo</span>')+'</div></div>'+
      '<div class="dv">'+(on.length?on.slice(0,3).map(d=>furnTag(d.f.id,'',24,20)).join('')+(on.length>3?'+'+(on.length-3):''):'<span class="dim">chưa có<br>thiết bị</span>')+'</div></button>'};
  return '<div class="wb-sheet '+WB.dir+'"><h3>Khí hậu các phòng</h3><div class="wb-list">'+rooms.slice(WB.pg*WB.per,(WB.pg+1)*WB.per).map(row).join('')+'</div>'+
    '<div class="wb-nav"><button class="sm" '+(WB.pg<=0?'disabled':'')+' onclick="bookPage(-1)" aria-label="Trang trước">◀</button><span class="pg">Trang '+(WB.pg+1)+' / '+n+'</span><button class="sm" '+(WB.pg>=n-1?'disabled':'')+' onclick="bookPage(1)" aria-label="Trang sau">▶</button></div></div>';
}
// vẽ lại: part = 'l' (trang trái), 'r' (trang phải) hoặc bỏ trống (cả hai). Sau khi vẽ danh sách phòng thì đo chỗ trống để biết mỗi trang nhỏ chứa được mấy phòng.
function bookDraw(part){
  const e=$('wxbook');if(!e||!bookOn())return;
  if(part!=='r'){const l=e.querySelector('.wb-l');l.innerHTML=emo(bookLeft())}
  if(part!=='l'){const r=e.querySelector('.wb-r');r.innerHTML=emo(bookRight());WB.dir='';
    const L=r.querySelector('.wb-list');
    if(L&&!WB.fit){WB.fit=1;const it=L.firstElementChild,rh=it?Math.max(50,...[...L.children].map(c=>c.offsetHeight)):62,per=Math.max(1,Math.floor((L.clientHeight+6)/(rh+6)));
      if(per!==WB.per){const first=WB.pg*WB.per;WB.per=per;WB.pg=Math.floor(first/per);r.innerHTML=emo(bookRight())}}}
}
function openBook(rid){
  if(!wxOpen()){toast('Thời tiết và khí hậu phòng mở khóa ở cấp '+WX_LV+'.',{icon:'🔒',title:'Chưa mở khóa',key:'wxlock'});return}
  if($('modal').style.display==='flex'&&!$('modal').classList.contains('lock'))closeModal();
  let e=$('wxbook');
  if(!e){e=document.createElement('div');e.id='wxbook';e.addEventListener('click',ev=>{if(ev.target===e)closeBook()});document.body.appendChild(e)}
  WB.rid=rid&&S.rooms[rid]?rid:null;
  if(!WB.rid){const i=ownedRooms().findIndex(r=>r.id===cur);if(i>=0)WB.pg=Math.floor(i/WB.per)}
  if(bookOn()){bookDraw('r');return}
  e.innerHTML='<div class="wb-book" role="dialog" aria-label="Sách khí hậu"><div class="wb-mark"></div><button class="wb-x sm" aria-label="Đóng" onclick="closeBook()">✕</button><div class="wb-page wb-l"></div><div class="wb-spine"></div><div class="wb-page wb-r"></div></div>';
  e.classList.add('on');WB.fit=0;bookDraw();
}
function closeBook(){const e=$('wxbook');if(e)e.classList.remove('on')}
function bookPage(d){WB.pg+=d;WB.dir=d>0?'fl':'fr';bookDraw('r')}
function bookRoom(rid){WB.dir=rid?'fl':'fr';if(!rid)WB.fit=0;if(!rid){const i=ownedRooms().findIndex(r=>r.id===WB.rid);if(i>=0)WB.pg=Math.floor(i/WB.per)}WB.rid=rid;bookDraw('r')}
function openWeather(){openBook()}
function openClimate(rid){openBook(rid||WB.rid||cur)}
addEventListener('keydown',ev=>{if(ev.key==='Escape'&&bookOn()&&$('modal').style.display!=='flex')closeBook()});
addEventListener('resize',()=>{if(bookOn()){WB.fit=0;bookDraw('r')}});
setInterval(()=>{if(bookOn()&&$('modal').style.display!=='flex'){bookDraw('l');if(!WB.rid)bookDraw('r')}},5000);

/* ---------- trạng thái mèo ---------- */
const wxStatusLeft=(c,k)=>{const x=wxs(c),F=wxFeel(c);
  if(k==='sick'){const good=F.feel>=19&&F.feel<=28&&x.wet<WXC.wetSt&&F.rc.comfort>=60;return good?'khỏi sau khoảng '+fmtL(x.sk/(WXC.sick.heal*(F.bi?2:1))*MIN):'chưa khỏi được ở chỗ này'}
  if(k==='wet'){const r=WXC.dryRate*(F.T>24?1.5:1)+F.rc.dry+(F.rc.bath?WXC.dryRate*2:0)-F.rain*WXC.wetRate;return r>0?'khô sau khoảng '+fmtL((x.wet-WXC.wetSt)/r*MIN):'vẫn đang bị mưa tạt'}
  if(k==='cold')return x.dc>0?'vẫn đang lạnh':'hết sau khoảng '+fmtL((x.cx-WXC.coldSt)/WXC.expoDecay*MIN);
  if(k==='hot')return x.dh>0?'vẫn đang nóng':'hết sau khoảng '+fmtL((x.hx-WXC.hotSt)/WXC.expoDecay*MIN);
  if(k==='rested')return 'còn '+fmtL(x.rest-now());
  return '';
};
function wxBadges(c,full){
  if(c.he==null)return '';const st=wxSt(c);
  return stat('💧',c.wa,c.wa<WXC.water.low?'#ff6b6b':'#6fc3e8')+(c.he<90||full?stat('❤️',c.he,c.he<30?'#ff6b6b':'#f08aa6'):'')+
    (st.length?' <span class="wxst">'+st.map(k=>'<span class="tag '+(k==='comfy'||k==='rested'?'g':'b')+'" tabindex="0" data-tip="'+esc(WXST[k].n+': '+WXST[k].d+(WXST[k].cure?' Cách chữa: '+WXST[k].cure:''))+'">'+WXST[k].ic+(full?' '+WXST[k].n:'')+'</span>').join('')+'</span>':'');
}
function wxCatSec(c){
  if(c.he==null)return '';const st=wxSt(c),away=onTrip(c.uid),F=away?null:wxFeel(c);
  const row=(ic,n,v,col)=>'<div class="k">'+ic+' '+n+'</div><div class="bar"><i style="width:'+Math.round(clamp(v,0,100))+'%;background:'+col+'"></i></div><div class="n">'+Math.round(v)+'%</div>';
  const items=SUPPLY.filter(s=>s.home&&invN(s.id)>0);
  return '<div class="cd-sec"><h4>Sức khỏe và thời tiết'+(typeof openHandbook==='function'?' <button class="sm" style="float:right" onclick="openHandbook(\'climstat\')">📖</button>':'')+'</h4><div class="cd-stats">'+row('❤️','Sức khỏe',c.he,c.he<30?'#ff6b6b':'#f08aa6')+row('💧','Nước uống',c.wa,c.wa<WXC.water.low?'#ff6b6b':'#6fc3e8')+row('😌','Thoải mái',c.cf,'#b49be0')+'</div>'+
    (F?'<div class="dim cd-note">Phòng '+fmtT(F.rc.T)+', bé cảm thấy '+fmtT(F.feel)+(F.bi?' (đang nằm trên ổ)':'')+'.'+(c.he<WXC.health.tripMin?' Sức khỏe dưới '+WXC.health.tripMin+' nên chưa đi viễn chinh được.':'')+'</div>':'')+
    (st.length?st.map(k=>{const s=WXST[k],l=away?'':wxStatusLeft(c,k);return '<div class="card" style="padding:6px 10px;margin-top:6px"><div style="font-size:22px">'+s.ic+'</div><div class="g" style="text-align:left"><b>'+s.n+'</b>'+(l?' <span class="dim">· '+l+'</span>':'')+'<br><small>'+s.d+(s.cure?'<br>💡 '+s.cure:'')+'</small></div></div>'}).join(''):'<div class="dim cd-note">Không có trạng thái đặc biệt.</div>')+
    (items.length&&!away?'<div class="row wrap" style="margin-top:8px">'+items.map(s=>'<button class="sm" onclick="doUseSupply(\''+s.id+'\','+c.uid+')" data-tip="'+esc(s.d)+'">'+s.ic+' '+s.n+' ('+invN(s.id)+')</button>').join('')+'</div>':'')+'</div>';
}
function doUseSupply(id,uid){const r=useSupply(id,uid);if(r.err){toast(r.err,{type:'warn'});return}toast('Đã dùng '+SUP[id].n,{icon:SUP[id].ic,title:catBy(uid).name});openCat(uid,catBack)}

/* ---------- cửa hàng: vật phẩm sinh tồn ---------- */
{const P0=PANEL.shop;PANEL.shop=function(){
  // trước cấp WX_LV: các mục thời tiết hiện ổ khóa; món bên trong hiện "🔒 Cấp 2" (trường ul), mục Sinh tồn hiện thông báo khóa
  const lk=!wxOpen(),lab=h=>lk?['warm','cool','shield','care','supply'].reduce((x,c)=>{const n=FCATS.find(q=>q[0]===c)[1];return x.replace('>'+n+'</button>','>🔒 '+n+'</button>')},h):h;
  if(shopT!=='supply')return lab(P0.apply(this,arguments));
  const tabs='<div class="row wrap" style="margin-bottom:8px"><button class="sm" onclick="shopT=\'rooms\';renderPanel()">🚪 Phòng</button>'+FCATS.map(c=>'<button class="sm '+(shopT===c[0]?'on':'')+'" onclick="shopT=\''+c[0]+'\';shopSel=null;renderPanel()">'+c[1]+'</button>').join('')+'</div>';
  const card=s=>'<div class="card">'+furnTag('sp_'+s.id,'',40,40)+'<div class="g"><b>'+s.ic+' '+s.n+'</b> <span class="tag '+(s.rare>=3?'x':s.rare>=2?'g':'')+'">'+RARE_N[s.rare]+'</span><br><small>'+s.d+'<br>'+(s.on==='start'?'Dùng khi xuất phát':'Tự dùng khi cần, không dùng thì trả lại túi')+' · mang tối đa '+s.max+(s.home?' · dùng được ở nhà':'')+' · đang có <b>'+invN(s.id)+'</b></small></div><div class="row" style="flex-direction:column;gap:4px"><button class="sm on" '+(S.coins<s.price?'disabled':'')+' onclick="doBuySupply(\''+s.id+'\',1)">🪙 '+s.price+'</button><button class="sm" '+(S.coins<s.price*5?'disabled':'')+' onclick="doBuySupply(\''+s.id+'\',5)">×5 · '+(s.price*5).toLocaleString('vi-VN')+'</button></div></div>';
  if(lk)return lab(tabs)+'<div class="card" style="opacity:.75"><div style="font-size:26px">🔒</div><div class="g"><b>Vật phẩm sinh tồn</b><br><small>Mở khóa ở cấp '+WX_LV+' cùng hệ thống thời tiết. Bạn đang ở cấp '+S.level+'.</small></div><button class="sm" disabled>🔒 Cấp '+WX_LV+'</button></div>';
  return tabs+'<div class="dim" style="margin-bottom:8px">🎒 Vật phẩm sinh tồn dùng một lần cho viễn chinh: chọn mang theo ở màn chọn mèo trước khi đi (tối đa '+WXC.kitSlots+' loại). Vật phẩm "dùng khi xuất phát" bị trừ lúc đi; vật phẩm "tự dùng khi cần" chỉ bị trừ khi thật sự dùng. Kháng cùng loại cộng tối đa '+Math.round(WXC.resCap*100)+'%. Không bắt buộc phải mua: thời tiết tốt thì không cần.</div>'+SUPPLY.map(card).join('');
}}
function doBuySupply(id,n){const r=buySupply(id,n);if(r.err){toast(r.err,{type:'warn'});return}toast('Đã mua '+r.n+' '+SUP[id].n+' · −'+r.cost.toLocaleString('vi-VN')+' xu',{icon:SUP[id].ic,title:'Sinh tồn',key:'buysup'});render()}

/* ---------- viễn chinh: chuẩn bị, tỉ lệ thành công, nhật ký ---------- */
pk.kit=pk.kit||{};
const DANGER_N=['Thấp','Vừa','Cao','Rất cao'];
function wxPrep(){
  if(!wxOpen())return '';
  const did=pk.dest,t0=wxClock(),d=DEST[did],D=DEST_CLIMATE[did]||{},n=Math.max(1,Math.round(d.min/10)),cps=[];for(let i=0;i<n;i++)cps.push(destWx(did,t0+i*10*MIN+5*MIN));
  const st=cps[0],dg=Math.min(3,Math.max(...cps.map(c=>c.w.bad))+(D.danger>=.05?1:0)),kinds={};cps.forEach(cp=>{if(cp.w.res)kinds[cp.w.res]=1});
  const rec=SUPPLY.filter(s=>(s.res&&Object.keys(s.res).some(k=>kinds[k]||(k==='rain'&&kinds.storm)))||(s.id==='compass'&&kinds.fog)||(s.id==='rescuekit'&&dg>=2));
  const kit=pk.kit,ks=Object.keys(kit).filter(k=>kit[k]>0),own=SUPPLY.filter(s=>invN(s.id)>0);
  const chip=s=>{const q=kit[s.id]||0,full=!q&&ks.length>=WXC.kitSlots;return '<button class="sm'+(q?' on':'')+'" '+(full?'disabled':'')+' onclick="wxKit(\''+s.id+'\')" data-tip="'+esc(s.d)+'">'+s.ic+' '+s.n+(q?' ×'+q:'')+' <span class="dim">('+invN(s.id)+')</span></button>'};
  return '<div class="cd-sec" style="text-align:left"><h4>☁️ Thời tiết ở '+d.n+'</h4>'+
    '<div>'+st.w.ic+' Lúc xuất phát: <b>'+st.w.n+'</b>, '+fmtT(st.temp)+' · khí hậu '+(D.n||'bình thường')+' · nguy hiểm <b style="color:'+(dg>=2?'var(--bad)':dg?'var(--gold)':'var(--good)')+'">'+DANGER_N[dg]+'</b></div>'+
    '<div class="dim">Từng chặng 10 phút: '+cps.map(c=>c.w.ic).join(' ')+' · thời gian ×'+String(st.w.dur).replace('.',',')+', năng lượng ×'+String(st.w.cost).replace('.',',')+(cps.some(c=>c.w.res==='heat')?', khát nhanh':'')+'</div>'+
    (rec.length?'<div class="dim">💡 Nên mang: '+rec.map(s=>s.ic+' '+s.n).join(', ')+'</div>':'<div class="dim">💡 Trời thuận lợi, không cần vật phẩm.</div>')+
    '<h4 style="margin-top:8px">🎒 Mang theo ('+ks.length+'/'+WXC.kitSlots+' loại)</h4>'+(own.length?'<div class="row wrap">'+own.map(chip).join('')+'</div>':'<div class="dim">Túi đồ trống. Mua vật phẩm ở Cửa hàng, mục 🎒 Sinh tồn.</div>')+'</div>';
}
function wxKit(id){const s=SUP[id],q=pk.kit[id]||0;pk.kit[id]=q>=Math.min(s.max,invN(id))?0:q+1;if(!pk.kit[id])delete pk.kit[id];drawPicker()}
function wxRiskTag(inf){
  if(!inf||!inf.wx)return '';const w=inf.wx,exact=wxHasStation(),p=exact?w.succ:Math.round(w.succ/5)*5;
  return ' · <span style="color:'+(p>=90?'var(--good)':p>=75?'var(--gold)':'var(--bad)')+'" data-tip="Tỉ lệ về đủ chuyến, không phải rút lui. Khả năng gặp sự cố nhỏ: '+Math.round(w.minor*100)+'%.'+(exact?'':' Có Trạm dự báo thì hiện chính xác hơn.')+'">'+(exact?'':'~')+p+'% thành công</span>';
}
{const T0=PANEL.trip;PANEL.trip=function(){
  const h=T0.apply(this,arguments),L=(S.tlog||[]).slice(0,8);if(!L.length)return h;
  const OUT={ok:['Suôn sẻ','var(--good)'],minor:['Có sự cố nhỏ','var(--gold)'],retreat:['Rút lui sớm','var(--bad)']};
  return h+'<h3 style="margin-top:12px">📜 Nhật ký viễn chinh</h3>'+L.map(e=>'<div class="card" style="flex-direction:column;align-items:stretch;padding:8px 10px"><div><b>'+esc(e.name)+'</b> · '+e.ic+' '+e.dest+' · <b style="color:'+OUT[e.out][1]+'">'+OUT[e.out][0]+'</b> <span class="dim">· '+hhmm(e.t)+' · 🪙 '+e.coins+'</span></div>'+
    (e.cps&&e.cps.length?'<div class="dim">Thời tiết từng chặng: '+e.cps.map(t=>WX[t].ic).join(' ')+'</div>':'')+(e.lines.length?'<small>'+e.lines.map(esc).join('<br>')+'</small>':'<small class="dim">Không có gì đặc biệt.</small>')+'</div>').join('');
}}

/* ---------- mèo trong phòng: hoạt ảnh theo trạng thái, tìm chỗ ấm hoặc mát, ra uống nước ---------- */
{const E0=entPos;entPos=function(e){const p=E0.apply(this,arguments),c=entCat(e);if(!c||!c.wxs||e.state==='jump'||e.state==='walk'||e.state==='run')return p;
  const st=wxSt(c),t=performance.now();
  if(st.includes('cold'))p.x+=Math.sin(t/22+e.uid)*.35;                       // run rẩy
  else if(st.includes('hot'))p.y-=Math.abs(Math.sin(t/170+e.uid))*.6;        // thở dốc
  return p}}
{const C0=choose;choose=function(e){const c=entCat(e);
  if(c&&!e.clone&&c.wxs&&Math.random()<.65){const st=wxSt(c),cold=st.includes('cold')||(c.wxs.dc||0)>3,hot=st.includes('hot')||(c.wxs.dh||0)>3;
    if(cold||hot){const it=itemsIn(cur).find(i=>{const f=FURN[i.fid],w=f.wx;if(!w||i.broken||i.off||i.chg||!(f.bed||f.use))return false;return cold?(w.lheat||w.lauto||w.heat):(w.lcool||w.lauto)});
      if(it){const f=FURN[it.fid];if(f.bed){if(bedCats(it.iid).length<f.bed.at.length&&c.en<100&&putBed(c.uid,it.iid).ok)return}else{goItem(e,it);return}}}}
  return C0.apply(this,arguments)}}
{const S0=stepEnt;stepEnt=function(e,dt){const c=entCat(e);
  if(c&&c.drink&&c.drink.t>(e.drinkT||0)&&!e.clone&&!e.ghost){e.drinkT=c.drink.t;const b=S.items.find(i=>i.iid===c.drink.iid&&i.room===cur);
    if(b&&now()-c.drink.t<4000&&e.state!=='jump'&&e.state!=='bed'&&e.state!=='sig'&&e.state!=='bye'&&!(e.state==='use'&&e.goal&&e.goal.at>=0)){e.goal={bowl:b.iid};e.tx=clamp(b.x+rnd(-10,10),14,WORLD_W-14);e.ty=clamp(b.y+rnd(1,4),FLOOR_MIN,FLOOR_MAX);e.state='walk';e.pre=.1;e.left=0;e.emo=null}}
  return S0.apply(this,arguments)}}
// khung hoạt ảnh của thiết bị đang chạy, bát nước có nước (ui.js drawItem gọi)
function wxVar(i){const f=FURN[i.fid];if(f.water)return (i.w||0)>0?'full':'';if(f.anim&&!i.off&&!i.chg&&!i.broken&&(!f.wx.rooms||devOk(f,i.room)))return Math.floor(performance.now()/220+i.iid)%2?'a1':'';return ''}

/* ---------- hiệu ứng thời tiết và thiết bị trong phòng ---------- */
const WXP=[],WXPMAX=260;
function wxStep(dt){
  const o=wxNow(),R=ROOM_CLIMATE[cur]||{},out=!!R.out,rc=roomClimate(cur),k=out?1:.3,x0=camX,x1=camX+VW,yT=camY,yB=out?camY+VHV:Math.min(camY+VHV,WALL_Y);
  const add=(n,f)=>{for(let i=0;i<n&&WXP.length<WXPMAX;i++)WXP.push(f())},r=Math.random;
  const fx=o.w.fx,wind=o.wind*(out?1:.5);
  if(out&&(fx==='rain'||fx==='storm'))add(Math.round((fx==='storm'?14:7)*k*rc.rain/Math.max(.05,o.rain)*(out?1:.6)*60*dt+r()),()=>({x:rnd(x0-10,x1),y:yT-4,vx:40+wind*80,vy:200,l:out?.9:.4,t:'r',a:out?.55:.25}));
  if(out&&(fx==='snow'||fx==='blizzard'))add(Math.round((fx==='blizzard'?10:5)*k*60*dt+r()),()=>({x:rnd(x0-20,x1),y:yT-2,vx:wind*70+rnd(-6,6),vy:rnd(14,26),l:out?5:2,t:'s',a:out?.9:.4}));
  if(out&&(fx==='wind'||wind>.6))add(Math.round(2*k*60*dt*r()+ (r()<.3?1:0)),()=>({x:x0-10,y:rnd(yT,yB),vx:rnd(120,180),vy:rnd(-5,5),l:1.6,t:r()<.15?'leaf':'w',a:out?.35:.15}));
  if(fx==='ideal'&&out&&r()<dt*3)add(1,()=>({x:rnd(x0,x1),y:rnd(yT,yB),vx:0,vy:-4,l:1.2,t:'sp',a:.9}));
  if(fx==='storm'){WXU.bolt-=dt;if(WXU.bolt<=0){WXU.bolt=rnd(5,13);WXU.flash=out?.55:.25}}
  if(WXU.flash>0)WXU.flash=Math.max(0,WXU.flash-dt*1.6);
  for(let i=WXP.length-1;i>=0;i--){const p=WXP[i];p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;if(p.l<=0||p.y>(out?camY+VHV:WALL_Y)+2||p.x>x1+20)WXP.splice(i,1)}
  // thiết bị đang chạy: hơi ấm bốc lên, gió mát, sương, hơi nước, sóng âm
  if(r()<dt*6)rc.D.on.forEach(({i,f})=>{if(i.off||!f.anim)return;const w=f.wx,top=i.y-f.h;
    if(w.heat||w.lheat){if(r()<.5)rp(i.x+rnd(-f.w/3,f.w/3),top+rnd(0,4),'rgba(255,170,90,.8)',{vy:-rnd(8,14),vx:rnd(-2,2),life:rnd(.6,1.1),sz:1})}
    if(w.cool&&!w.heat){rp(i.x+(i.flip?-1:1)*f.w/2,top+f.h/2+rnd(-3,3),'rgba(170,215,255,.85)',{vx:(i.flip?-1:1)*rnd(18,30),vy:rnd(-2,2),life:rnd(.5,.9),sz:1})}
    if(w.hum>0||f.id==='mistfan'){rp(i.x+rnd(-3,3),top+2,'rgba(240,248,255,.8)',{vy:-rnd(5,10),vx:rnd(-4,4),life:rnd(.7,1.2),sz:1})}
    if(w.bath){rp(i.x+rnd(-4,4),top,'rgba(250,250,250,.7)',{vy:-rnd(6,10),life:1,sz:1})}
    if(w.quiet&&r()<.3){rp(i.x,top-2,'rgba(200,180,255,.8)',{vy:-6,life:.8,sz:1})}});
  // mèo: nhỏ nước khi ướt, bông tuyết khi lạnh, giọt mồ hôi khi nóng, hơi bệnh khi ốm
  if(r()<dt*4)ents.forEach(e=>{const c=entCat(e);if(!c||!c.wxs||e.clone)return;const p=entPos(e),st=wxSt(c);
    if(st.includes('wet'))rp(p.x+rnd(-7,7),p.y-rnd(6,20),'rgba(120,170,230,.9)',{vy:rnd(10,20),g:40,life:.5,sz:1});
    if(st.includes('cold')&&r()<.4)rp(p.x+rnd(-8,8),p.y-rnd(18,28),'rgba(200,230,255,.95)',{vy:-3,life:.8,sz:1});
    if(st.includes('hot')&&r()<.4)rp(p.x+rnd(-6,6),p.y-rnd(20,26),'rgba(140,200,255,.95)',{vy:8,g:20,life:.6,sz:1});
    if(st.includes('sick')&&r()<.3)rp(p.x+rnd(-5,5),p.y-rnd(22,30),'rgba(150,200,120,.9)',{vy:-4,life:1,sz:1})});
}
function wxDraw(g){
  const o=wxNow(),R=ROOM_CLIMATE[cur]||{},out=!!R.out,fx=o.w.fx,x0=camX,yT=camY,yB=out?camY+VHV:Math.min(camY+VHV,WALL_Y),hh=Math.max(0,yB-yT);
  // phủ màu theo thời tiết: phòng ngoài trời phủ cả khung, trong nhà chỉ phủ nhẹ vùng tường
  const tint={heat:'rgba(255,160,80,',cold:'rgba(150,190,255,',snow:'rgba(210,225,255,',blizzard:'rgba(220,230,255,',fog:'rgba(235,235,240,',storm:'rgba(60,70,100,',rain:'rgba(90,110,140,',sun:'rgba(255,230,160,',ideal:'rgba(255,240,200,'}[fx];
  const ta={heat:.08,cold:.06,snow:.1,blizzard:.2,fog:.28,storm:.16,rain:.08,sun:.05,ideal:.05}[fx]||0;
  if(tint&&ta){g.fillStyle=tint+(ta*(out?1:.35))+')';g.fillRect(x0,yT,VW,hh)}
  if(fx==='fog'){const t=performance.now()/1000;for(let i=0;i<3;i++){g.fillStyle='rgba(240,240,245,'+(out?.16:.08)+')';const y=yT+hh*(.2+.3*i)+Math.sin(t*.4+i)*4;g.fillRect(x0,y,VW,8+i*3)}}
  if(fx==='ideal'&&out){g.globalAlpha=.18;['#ff8a8a','#ffd27a','#fff38a','#9be29b','#8ac8ff','#c79bff'].forEach((col,i)=>{g.strokeStyle=col;g.lineWidth=1.2;g.beginPath();g.arc(x0+VW*.7,yT+hh*.9,hh*.75-i*1.3,Math.PI*1.08,Math.PI*1.92);g.stroke()});g.globalAlpha=1}
  WXP.forEach(p=>{g.globalAlpha=p.a;
    if(p.t==='r'){g.fillStyle='#b8d4f0';g.fillRect(Math.round(p.x),Math.round(p.y),1,4)}
    else if(p.t==='s'){g.fillStyle='#ffffff';g.fillRect(Math.round(p.x),Math.round(p.y),1,1)}
    else if(p.t==='w'){g.fillStyle='#ffffff';g.fillRect(Math.round(p.x),Math.round(p.y),6,1)}
    else if(p.t==='leaf'){g.fillStyle=Math.random()<.5?'#d99a4a':'#8cc06e';g.fillRect(Math.round(p.x),Math.round(p.y),2,1)}
    else if(p.t==='sp'){g.fillStyle='#fff6c8';g.fillRect(Math.round(p.x),Math.round(p.y),1,1)}});
  g.globalAlpha=1;
  if(WXU.flash>0){g.fillStyle='rgba(255,255,240,'+WXU.flash+')';g.fillRect(x0,yT,VW,out?VHV:hh)}
  // số lượt nước còn trong bát nước
  wbowls(cur).forEach(b=>{const f=FURN[b.fid],tx='💧'+(b.w||0);g.font='bold 4.5px system-ui,sans-serif';const tw=Math.ceil(g.measureText(tx).width)+3,nx=Math.round(b.x-tw/2),ny=Math.round(b.y-f.h)-8;
    g.fillStyle=(b.w||0)>0?'#2a5f8a':'#8a3040';g.fillRect(nx-.5,ny-.5,tw+1,7);g.fillStyle='#f0f8ff';g.fillRect(nx,ny,tw,6);g.fillStyle=(b.w||0)>0?'#2a5f8a':'#8a3040';g.textBaseline='top';g.fillText(tx,nx+1.5,ny+.6)});
}

/* ---------- cửa sổ nhìn ra ngoài: bầu trời theo giờ và thời tiết, mây, mưa, tuyết, sấm, sương, cây và mặt đất theo mùa ----------
   Vẽ ngay sau nền tường (bọc drawBg), nên nội thất treo tường che được cửa sổ. Vị trí trong ROOM_WIN (js/wx-data.js). */
const WCUR={living:[201,142,122],bedroom:[156,143,192],kitchen:[217,179,106],bathroom:[134,184,184],playroom:[224,154,122],dining:[180,106,90],
  library:[122,90,74],gameroom:[106,98,160],tatami:[200,180,138],royal:[168,52,60],wait:[201,142,122]};
const wmix=(a,b,k)=>a.map((v,i)=>Math.round(v+(b[i]-v)*k)),wrgb=(c,al)=>al==null?'rgb('+c.join(',')+')':'rgba('+c.join(',')+','+al+')';
function wSky(fx,hr){
  const S={storm:[[84,94,116],[122,132,152]],rain:[[133,149,168],[169,182,196]],snow:[[170,182,198],[210,218,228]],blizzard:[[160,170,186],[204,212,222]],
    fog:[[201,206,212],[221,224,228]],heat:[[240,176,112],[248,220,168]],cold:[[169,203,232],[214,232,244]]}[fx]||[[134,196,234],[200,230,246]];
  let [t,b]=S;const night=hr>=19||hr<5;
  if(hr===5||hr===6||hr===17||hr===18){t=wmix(t,[232,154,122],.45);b=wmix(b,[246,207,154],.5)}
  if(night){t=wmix(t,[28,34,68],.78);b=wmix(b,[46,54,96],.72)}
  return {t,b,night};
}
function wPath(g,k,x,y,w,h,p){
  g.beginPath();const cx=x+w/2;
  if(k==='round')g.arc(cx,y+h/2,w/2+p,0,Math.PI*2);
  else if(k==='arch'){g.moveTo(x-p,y+h+p);g.lineTo(x-p,y+w/2);g.arc(cx,y+w/2,w/2+p,Math.PI,0);g.lineTo(x+w+p,y+h+p);g.closePath()}
  else g.rect(x-p,y-p,w+2*p,h+2*p);
}
function wCloud(g,cx,cy,s,col){g.fillStyle=col;const R=(a,b,c,d)=>g.fillRect(Math.round(cx+a*s),Math.round(cy+b*s),Math.ceil(c*s),Math.ceil(d*s));R(-6,0,12,3);R(-4,-2,7,2);R(-1,-3,4,1);R(2,-1,3,1)}
function drawWin(g,rid,W,k0){
  const [cx,y,w,h,k]=W,x=Math.round(cx-w/2),t=performance.now()/1000,o=wxNow(),hr=wxHour(wxClock()),fx=o.w.fx,se=o.season.id,sky=wSky(fx,hr),nt=sky.night,band=k==='band';
  const OL=[111,78,56],FR=[239,227,204],dark=c=>nt?wmix(c,[20,24,48],.55):c,sd=(i,j)=>{const s=Math.sin(i*127.1+j*311.7+k0*74.7)*43758.5453;return s-Math.floor(s)};
  if(!band){wPath(g,k,x,y,w,h,3);g.fillStyle=wrgb(OL);g.fill();wPath(g,k,x,y,w,h,2);g.fillStyle=wrgb(FR);g.fill()}
  g.save();wPath(g,k,x,y,w,h,0);g.clip();
  for(let i=0;i<6;i++){g.fillStyle=wrgb(wmix(sky.t,sky.b,i/5));g.fillRect(x,y+h*i/6,w,h/6+1)}
  const clear=o.w.r<.3&&fx!=='fog';
  if(nt&&clear){g.fillStyle='#f4efd0';for(let i=0;i<Math.max(3,w*h/90);i++)if(Math.sin(t*1.7+i*3)>-.6)g.fillRect(x+Math.floor(sd(i,1)*w),y+Math.floor(sd(i,2)*h*.6),1,1);
    const mx=x+w*.74,my=y+h*.22;g.fillStyle='#f4ecc8';g.beginPath();g.arc(mx,my,3,0,7);g.fill();g.fillStyle=wrgb(sky.t);g.beginPath();g.arc(mx+1.4,my-.8,2.6,0,7);g.fill()}
  else if(!nt&&['sun','heat','ideal','cold','wind'].includes(fx)){const sx=x+w*.76,sy=y+h*.22,r=fx==='heat'?4.5:3.2;
    g.fillStyle=fx==='heat'?'rgba(255,170,80,.35)':'rgba(255,240,170,.4)';g.beginPath();g.arc(sx,sy,r+2+Math.sin(t*2)*.5,0,7);g.fill();g.fillStyle=fx==='heat'?'#ffb050':'#ffe27a';g.beginPath();g.arc(sx,sy,r,0,7);g.fill()}
  if(fx==='ideal'&&!nt){g.globalAlpha=.55;[[255,138,138],[255,210,122],[255,243,138],[155,226,155],[138,200,255],[199,155,255]].forEach((c,i)=>{g.strokeStyle=wrgb(c);g.lineWidth=1;g.beginPath();g.arc(x+w*.35,y+h*.85,h*.55-i,Math.PI*1.05,Math.PI*1.95);g.stroke()});g.globalAlpha=1}
  const nC={sun:1,ideal:1,wind:3,cold:2,rain:3,storm:4,snow:3,blizzard:4,fog:2,heat:0}[fx],sp=fx==='wind'||fx==='blizzard'?7:1.2,
    cc=dark({storm:[106,116,136],rain:[196,204,214],snow:[232,238,244],blizzard:[220,226,234],fog:[230,232,236]}[fx]||[255,255,255]),sc=band?1.4:w<34?.7:1;
  for(let i=0;i<nC*(band?4:1);i++){const L=w+28;wCloud(g,x-14+((sd(i,3)*L+t*sp*(.7+sd(i,4)*.6))%L),y+3+sd(i,5)*h*.32,sc*(.8+sd(i,6)*.5),wrgb(cc))}
  // mặt đất và cây theo mùa (tuyết phủ khi tuyết rơi); nhà kính chỉ thấy trời
  if(!band){const gy=Math.round(y+h*.76),snow=fx==='snow'||fx==='blizzard'||se==='winter'&&fx==='cold';
    const G=dark(snow?[236,242,246]:{spring:[140,192,122],summer:[104,170,92],autumn:[200,150,86],winter:[178,186,170]}[se]);
    g.fillStyle=wrgb(dark(wmix(G,[90,110,90],.25)));for(let xx=x;xx<x+w;xx+=4)g.fillRect(xx,gy-1-Math.round(sd(xx,7)*2),4,3);
    g.fillStyle=wrgb(G);g.fillRect(x,gy,w,h);
    const crown=dark({spring:[236,170,190],summer:[80,150,80],autumn:[220,120,60],winter:[120,96,80]}[se]);
    [[.18+.1*(k0%2),0],[.66+.1*(k0%2),1]].forEach(([fx2,j])=>{const tx=Math.round(x+w*fx2),th=Math.round(h*.22),sway=fx==='wind'||fx==='storm'||fx==='blizzard'?Math.round(Math.sin(t*4+j)*1):0;
      g.fillStyle=wrgb(dark([110,82,62]));g.fillRect(tx,gy-th,2,th+1);
      if(se!=='winter'){g.fillStyle=wrgb(crown);g.fillRect(tx-4+sway,gy-th-5,10,6);g.fillRect(tx-2+sway,gy-th-7,6,2)}
      else{g.fillRect(tx-3,gy-th+1,2,1);g.fillRect(tx+3,gy-th,2,1);if(snow){g.fillStyle='#f4f8fa';g.fillRect(tx-1,gy-th-1,4,1)}}});
    if(se==='autumn'&&(fx==='wind'||fx==='sun'))for(let i=0;i<3;i++){g.fillStyle=wrgb(dark([214,130,60]));g.fillRect(x+((sd(i,9)*w+t*12)%w),y+((sd(i,10)*h+t*8)%(h*.8)),1,1)}}
  // mưa, tuyết, gió
  if(o.w.r>0&&fx!=='snow'&&fx!=='blizzard'&&fx!=='fog'){const n=Math.round(w*h/(fx==='storm'?14:26)),vx=8+o.wind*24;g.fillStyle=nt?'rgba(170,190,220,.7)':'rgba(225,238,255,.8)';
    for(let i=0;i<n;i++){const px=x-6+((sd(i,11)*(w+12)+t*vx)%(w+12)),py=y+((sd(i,12)*h+t*(fx==='storm'?90:65))%h);g.fillRect(Math.round(px),Math.round(py),1,3)}}
  if(fx==='snow'||fx==='blizzard'){const n=Math.round(w*h/(fx==='blizzard'?12:24));g.fillStyle='#ffffff';
    for(let i=0;i<n;i++){const px=x+((sd(i,13)*w+t*o.wind*22+Math.sin(t*1.5+i)*1.5+w*4)%w),py=y+((sd(i,14)*h+t*(fx==='blizzard'?24:9))%h);g.fillRect(Math.round(px),Math.round(py),1,1)}}
  if(fx==='wind')for(let i=0;i<3;i++){g.fillStyle='rgba(255,255,255,.55)';g.fillRect(Math.round(x+((sd(i,15)*w+t*60)%(w+10))-5),Math.round(y+h*(.2+.2*i)),4,1)}
  if(fx==='fog'){g.fillStyle='rgba(236,238,242,.5)';g.fillRect(x,y,w,h);for(let i=0;i<3;i++){g.fillStyle='rgba(245,246,248,.5)';g.fillRect(x,Math.round(y+h*(.25+.25*i)+Math.sin(t*.5+i)*2),w,3)}}
  if(fx==='heat'){g.fillStyle='rgba(255,170,90,.14)';g.fillRect(x,y,w,h)}
  if(WXU.flash>0){g.fillStyle='rgba(255,255,240,'+Math.min(.9,WXU.flash*1.6)+')';g.fillRect(x,y,w,h);
    if(WXU.flash>.15){let bx=x+w*(.3+.4*sd(Math.floor(WXU.bolt*10),16)),by=y;g.fillStyle='#fffbe0';while(by<y+h*.75){const nx=bx+(sd(by,bx)<.5?-1:1)*2;g.fillRect(Math.round(Math.min(bx,nx)),Math.round(by),2,1);g.fillRect(Math.round(nx),Math.round(by),1,4);bx=nx;by+=4}}}
  // phản chiếu trên kính
  if(!band){g.fillStyle='rgba(255,255,255,.16)';for(let i=0;i<h;i+=1)g.fillRect(Math.round(x+w*.12+i*.5),y+i,2,1)}
  g.restore();
  if(band){const T=THEMES.greenhouse;g.fillStyle=T.w[1];for(let xx=0;xx<WORLD_W;xx+=30)g.fillRect(xx,y,2,h);g.fillRect(0,y+h,WORLD_W,2);return}
  // song cửa, bậu cửa, rèm hai bên
  g.fillStyle=wrgb(FR);g.fillRect(Math.round(cx)-1,y,2,h);if(k!=='round')g.fillRect(x,Math.round(y+h*(k==='arch'?.58:.5))-1,w,2);else g.fillRect(x,Math.round(y+h/2)-1,w,2);
  if(k==='round')return;
  g.fillStyle=wrgb(OL);g.fillRect(x-6,y+h+3,w+12,4);g.fillStyle=wrgb(FR);g.fillRect(x-5,y+h+3,w+10,2);
  const cu=WCUR[rid];if(!cu||w<34)return;
  g.fillStyle=wrgb(OL);g.fillRect(x-11,y-6,w+22,2);
  [x-9,x+w+3].forEach((qx,j)=>{g.fillStyle=wrgb(wmix(cu,OL,.35));g.fillRect(qx-1,y-4,8,h+6);g.fillStyle=wrgb(cu);g.fillRect(qx,y-4,6,h+5);
    g.fillStyle=wrgb(wmix(cu,[255,255,255],.25));g.fillRect(qx+(j?1:3),y-4,1,h+5);g.fillStyle=wrgb(wmix(cu,OL,.25));g.fillRect(qx+(j?4:1),y-4,1,h+5);
    g.fillStyle=wrgb([217,170,80]);g.fillRect(qx-1,Math.round(y+h*.6),8,2)});
}
{const B0=drawBg;drawBg=function(g,rid){B0.apply(this,arguments);(ROOM_WIN[rid]||[]).forEach((W,i)=>drawWin(g,rid,W,i))}}

/* ---------- Admin: thử mùa, thời tiết, giờ, trạng thái mèo, thiết bị, vật phẩm (chỉ để test) ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const d=document.createElement('div');d.innerHTML=wxAdmBox();const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function wxAdmBox(){
  const sel='font:inherit;color:var(--ink);background:var(--panel);border:2px solid var(--line);border-radius:10px;padding:6px;min-width:0;flex:1',o=wxNow(),hr=wxHour(wxClock());
  const op=(v,n,on)=>'<option value="'+v+'"'+(on?' selected':'')+'>'+n+'</option>',B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>';
  return '<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🌦 Thời tiết, khí hậu, thiết bị</b>'+
    '<div class="dim">Đang: '+o.w.ic+' '+o.w.n+' · '+fmtT(o.temp)+' · '+o.season.ic+' Mùa '+o.season.n+' · '+hr+' giờ'+(Object.keys(WXO).length?' · <b style="color:var(--bad)">đang ghi đè</b>':'')+'</div>'+
    '<div class="row"><select style="'+sel+'" onchange="admWx(\'se\',this.value)">'+op('','Mùa: tự động')+SEASONS.map((s,i)=>op(i,s.ic+' '+s.n,WXO.se===i)).join('')+'</select>'+
    '<select style="'+sel+'" onchange="admWx(\'ty\',this.value)">'+op('','Thời tiết: tự động')+Object.entries(WX).map(([id,w])=>op(id,w.ic+' '+w.n,WXO.ty===id)).join('')+'</select>'+
    '<select style="'+sel+'" onchange="admWx(\'hr\',this.value)">'+op('','Giờ: theo đồng hồ')+Array.from({length:24},(_,h)=>op(h,h+' giờ',WXO.hr===h)).join('')+'</select></div>'+
    '<div class="row wrap">'+B('admWxReset()','Bỏ mọi ghi đè')+B("closeModal();setTab('home')",'Xem phòng')+'</div>'+
    '<div class="dim">Ghi đè chỉ có tác dụng trên máy này. Mùa và giờ đổi nhiệt độ nền; thời tiết đổi ngay cho mọi phòng, cửa sổ, dự báo và viễn chinh.</div>'+
    '<b>Mèo ở phòng đang xem ('+ROOM[cur].n+')</b><div class="row wrap">'+[['cold','🥶 Lạnh'],['hot','🥵 Nóng quá'],['wet','💦 Ướt'],['sick','🤒 Ốm'],['thirsty','💧 Khát'],['exhausted','😵 Kiệt sức'],['clear','✨ Khỏe lại hết']].map(([k,n])=>B("admWxCat('"+k+"')",n)).join('')+'</div>'+
    '<b>Đồ và thời gian</b><div class="row wrap">'+B('admWxDev()','Nhận đủ thiết bị thời tiết')+B('admWxSup()','+5 mỗi vật phẩm sinh tồn')+B('admWxWater()','Đổ đầy nước mọi phòng')+'</div>'+
    '<div class="row wrap">'+B('admWxBat(0)','Thiết bị pin: hết pin ngay')+B('admWxBat(1)','Thiết bị pin: sạc đầy')+B('admSkip(6)','⏩ Tua 1 giờ')+B('admSkip(72)','⏩ Tua 12 giờ')+'</div>'+
    '<div class="dim">Tua giờ chạy luật game như thời gian trôi (đói, năng lượng, pin, trạng thái, viễn chinh, bát ăn); thời tiết vẫn theo đồng hồ thật hoặc theo ghi đè ở trên.</div></div>';
}
function admWx(k,v){wxOverride(k,v===''?'':k==='ty'?v:+v);WXU.last=wxNow().type;admDone('Thời tiết: '+wxNow().w.n+', mùa '+wxNow().season.n,1)}
function admWxReset(){['se','ty','hr'].forEach(k=>wxOverride(k,''));WXU.last=wxNow().type;admDone('Đã bỏ ghi đè thời tiết',1)}
function admWxCat(k){const L=homeCats(cur);L.forEach(c=>{const x=wxs(c);if(c.he==null)c.he=100;if(c.wa==null)c.wa=100;
  if(k==='cold')x.cx=150;else if(k==='hot')x.hx=150;else if(k==='wet')x.wet=90;else if(k==='sick')x.sk=WXC.sick.start;else if(k==='thirsty')c.wa=10;else if(k==='exhausted'){c.en=4;x.ex=1}
  else{c.wxs={cx:0,hx:0,wet:0,sk:0,ex:0};c.he=100;c.wa=100;c.cf=70;if(c.en<40)c.en=60}});wxDirty();admDone(L.length+' bé ở '+ROOM[cur].n+': '+(k==='clear'?'khỏe lại hết':WXST[k].n),1)}
function admWxDev(){let n=0;WXDEV.forEach(f=>{if(!S.items.some(i=>i.fid===f.id)){S.items.push({iid:S.nid++,fid:f.id,room:null,x:120,y:140,flip:false,broken:false});n++}});admDone(n?'Đã thêm '+n+' thiết bị vào kho (Nhà → Sắp xếp để đặt)':'Đã có đủ mọi thiết bị',1)}
function admWxSup(){S.inv=S.inv||{};SUPPLY.forEach(s=>S.inv[s.id]=invN(s.id)+5);admDone('Mỗi vật phẩm sinh tồn +5',1)}
function admWxWater(){let n=0;ownedRooms().forEach(r=>n+=fillWater(r.id));admDone('Đã đổ đầy '+n+' bát nước',1)}
function admWxBat(full){let n=0;S.items.forEach(i=>{const f=FURN[i.fid];if(!f.bat||!i.room)return;n++;if(full){i.bat=f.bat.run;i.chg=0}else{i.bat=0;i.chg=1}});wxDirty();admDone(n?n+' thiết bị pin: '+(full?'sạc đầy':'hết pin, đang sạc'):'Chưa đặt thiết bị chạy pin nào trong phòng',1)}
function admSkip(n){for(let k=0;k<n;k++)skipTime();admDone('Đã tua '+(n*10>=60?n*10/60+' giờ':n*10+' phút'),1)}
{const s0=critStep,d0=critDraw;critStep=dt=>{s0(dt);wxStep(dt)};critDraw=g=>{d0(g);wxDraw(g)}}
// khách lạ ngoài trời không ra khi mưa, tuyết, bão (quest.js đọc hàm này nếu có)
const wxNoCritters=()=>{const o=wxNow();return (ROOM_CLIMATE[cur]||{}).out&&(o.rain>=.5||o.w.bad>=2)};
