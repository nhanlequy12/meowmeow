"use strict";
/* ============ ĐIỆN NĂNG: GIAO DIỆN ============
   Nạp sau js/wx-ui.js. Luật ở js/pw.js (không trừ xu, không trừ pin ở file này: mọi việc đi qua pwStartCharge, pwStopCharge, pwGenCharge, pwUseTorch).
   - Ô ⚡ trên cùng: trạng thái điện, số thiết bị pin yếu, đếm ngược khi mất điện; bấm mở Sách điện (openPower).
   - Chạm thiết bị điện trong phòng (hoặc chọn trong chế độ Sắp xếp, hoặc trong sách): bảng pin và nút "🔌 Sạc thiết bị" → chọn ổ còn trống → xem phí → xác nhận.
   - Trong phòng: dây cắm từ ổ tới thiết bị đang sạc, tia sét nhỏ nhấp nháy, vạch pin trên máy pin yếu, nhãn % và thời gian của ổ thông minh,
     phòng tối khi mất điện (đèn khẩn cấp, đèn pin, máy phát làm sáng lại), tia sét lớn, chớp, rung và tiếng sấm lúc sét đánh.
   - Mèo hoảng sợ: giật mình, run, cúi rạp (cụp tai), chạy trốn vào ổ ngủ hoặc góc phòng; vuốt ve để vỗ về.
   - Sách điện hai trang (cùng kiểu Sách khí hậu, css/pwbook.css): trang trái là nguồn điện, trang phải là danh sách thiết bị (chia trang, lật giấy).
   - Admin: gây mất điện, có điện lại, sạc đầy, xả pin, pin yếu, điện mặt trời, máy phát. */
const PWU={bolt:0,bx:0,flash:0,pg:0,per:5,dir:'',fit:0};
const mmss=ms=>{const s=Math.max(0,Math.ceil(ms/1000));return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')};
const pwElecIn=rid=>S.items.filter(i=>i.room===rid&&FURN[i.fid].pw);
const pwAllDev=()=>S.items.filter(i=>i.room!=null&&FURN[i.fid].pw);
const pwLow=()=>pwAllDev().filter(i=>pwPct(i)<PWC.low&&!i.charge);
const pwCol=p=>p<PWC.low?'#ff6b6b':p<.5?'#ffb347':'#5fd08a';
const pwBookOn=()=>{const e=$('pwbook');return !!(e&&e.classList.contains('on'))};
// trạng thái chạy của một thiết bị: [chữ, màu]
function pwStat(i){
  const f=FURN[i.fid],P=f.pw;if(i.broken)return ['Đang hỏng','var(--bad)'];if(pwDead(i))return ['Hết pin, ngừng chạy','var(--bad)'];
  if(pwRunning().includes(i))return [i.charge&&powerOn()?'Đang chạy bằng điện của ổ':'Đang chạy','var(--good)'];
  if(i.off)return ['Đang tắt','var(--dim)'];
  if(P.mode==='out')return ['Chờ: tự sáng khi mất điện','var(--dim)'];if(P.mode==='bed')return ['Chờ: chạy khi có bé nằm','var(--dim)'];
  const off=f.wx&&wxDevices(i.room).off.find(d=>d.i===i);if(off)return ['Không chạy: '+off.why,'var(--bad)'];
  return ['Chờ: tự chạy khi phòng cần','var(--dim)'];
}
function pwBatTxt(i){
  const p=Math.round(pwPct(i)*100);
  if(i.charge)return p+'% · '+(powerOn()?'đang sạc, đầy sau khoảng '+fmtL(pwChargeLeft(i)):'tạm dừng sạc vì mất điện');
  if(pwDead(i))return '0% · hết pin';
  return p+'% · chạy liên tục được khoảng '+fmtL(pwRunLeft(i))+(p<PWC.low*100?' · ⚠ pin yếu':'');
}
const pwBar=(p,col)=>'<div class="bar" style="margin:3px 0 0"><i style="width:'+Math.round(clamp(p*100,0,100))+'%;background:'+(col||pwCol(p))+'"></i></div>';
// biến thể hình: đồ điện mới (ổ, đèn khẩn cấp, tấm pin, máy phát) có khung 'a1' khi đang chạy
function pwVar(i){
  const f=FURN[i.fid],k=Math.floor(performance.now()/260+i.iid)%2?'a1':'';if(!f.anim||i.broken)return '';
  if(f.outlet)return pwPlugged(i.iid).length&&powerOn()?k:'';
  if(f.solar)return pwSolarItems().includes(i)&&pwDayK()>0&&pwSolarWx(wxClock())>=.5?k:'';
  if(f.gen)return genOn()&&(i.ge||0)>0?k:(i.ge||0)>=1?'a1':'';
  if(f.pw&&f.pw.mode==='out')return pwOut()&&!genOn()&&pwCur(i)>0?k:'';   // đèn khẩn cấp: kiểm nhanh, không gọi pwRunning mỗi khung hình
  if(f.pw)return pwRunning().includes(i)?k:'';
  return '';
}

/* ---------- ô ⚡ trên cùng ---------- */
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);if(!pwOpen())return;
  const o=pwOut(),low=pwLow().length,el=document.createElement('div');el.className='chip tap pwchip'+(o?' out':'');el.setAttribute('onclick','openPower()');
  el.setAttribute('data-tip',o?'Mất điện vì sét đánh. Bấm để xem nguồn dự phòng.':'Sách điện: pin thiết bị, ổ điện, điện mặt trời, máy phát.');
  el.innerHTML=o?'⚡ <b class="lbl">Mất điện</b> <b>'+mmss(o.e-now())+'</b>'+(genOn()?' <span class="dim">· 🔋</span>':''):'⚡ <b>Điện</b>'+(low?' <span style="color:var(--bad)">🪫'+low+'</span>':'');
  emoEl(el);const top=$('top'),ref=top.querySelector('.wxchip');top.insertBefore(el,ref?ref.nextSibling:top.querySelector('.xp'));
}}

/* ---------- bảng một thiết bị, ổ, tấm pin, máy phát ---------- */
const pwHasRoom=i=>i&&i.room!=null;
function openPw(iid){
  const i=S.items.find(x=>x.iid===iid);if(!pwHasRoom(i)){closeModal();return}
  const f=FURN[i.fid];
  if(f.outlet)return pwOutletBox(i);if(f.solar)return pwSolarBox(i);if(f.gen)return pwGenBox(i);if(!f.pw){closeModal();return}
  const P=f.pw,st=pwStat(i),q=pwQuote(i),w=f.wx||{},man=(w.heat||w.cool)&&!w.auto,ol=i.charge&&S.items.find(o=>o.iid===i.charge.o);
  modal('<h3>'+f.n+'</h3><div style="text-align:center">'+furnTag(f.id,pwRunning().includes(i)&&f.anim?'a1':'',96,72)+'</div>'+
    '<div class="cd-sec"><div class="cd-grid"><div class="k">Trạng thái</div><div><b style="color:'+st[1]+'">'+st[0]+'</b></div>'+
    '<div class="k">🔋 Pin</div><div>'+pwBatTxt(i)+pwBar(pwPct(i))+'</div>'+
    '<div class="k">Tiêu thụ</div><div>'+P.powerConsumption+' W · đầy pin '+P.batteryCapacity+' Wh chạy được '+fmtL(P.batteryCapacity/P.powerConsumption*3600000)+'</div>'+
    '<div class="k">Sạc đầy</div><div>'+P.chargingCost+' xu · '+P.chargingDuration+' phút ở ổ thường</div>'+
    (ol?'<div class="k">🔌 Đang cắm</div><div>'+FURN[ol.fid].n+(FURN[ol.fid].outlet.smart?' · còn '+fmtL(pwChargeLeft(i)):'')+'</div>':'')+
    '<div class="k">Phòng</div><div>'+ROOM[i.room].n+'</div></div></div>'+
    (pwPct(i)<PWC.low&&!i.charge?'<div class="pw-warn">🪫 Pin dưới '+Math.round(PWC.low*100)+'%: sạc sớm để máy không ngừng chạy.</div>':'')+
    '<div class="row wrap" style="justify-content:center;margin-top:8px">'+
      (i.charge?'<button class="sm" onclick="doPwUnplug('+iid+')">⏏ Rút sạc</button>':'<button class="go pw-chg" '+(q.need?'':'disabled')+' onclick="pwPick('+iid+')">🔌 Sạc thiết bị'+(q.need?' · '+q.cost+' xu':' (đầy)')+'</button>')+
      (man&&!i.broken&&!pwDead(i)?'<button class="sm '+(i.off?'on':'')+'" onclick="wxToggle('+iid+',1)">'+(i.off?'▶ Bật':'⏸ Tắt')+'</button>':'')+
      (f.wx&&Object.keys(f.wx).length?'<button class="sm" onclick="openClimate(\''+i.room+'\')">🌡 Khí hậu</button>':'')+
      '<button class="sm" onclick="openPower()">⚡ Sách điện</button></div>'+
    '<div class="dim" style="margin-top:6px">'+f.d+'</div>');
}
{const d0=openDev;openDev=function(iid){const i=S.items.find(x=>x.iid===iid);if(i&&FURN[i.fid].pw)return openPw(iid);return d0.apply(this,arguments)}}
// chọn ổ điện còn trống trong cùng phòng
function pwPick(iid){
  const i=S.items.find(x=>x.iid===iid);if(!pwHasRoom(i)||!FURN[i.fid].pw){closeModal();return}
  const f=FURN[i.fid],q=pwQuote(i),L=pwOutlets(i.room);
  if(!q.need){toast('Pin đang đầy, chưa cần sạc.',{icon:'🔋',title:f.n});return}
  const row=o=>{const F=FURN[o.fid],why=pwOutletWhy(o,i),fr=pwFree(o);
    return '<div class="card pw-ol'+(why?' off':'')+'">'+furnTag(o.fid,'',36,30)+'<div class="g"><b>'+F.n+'</b><br><small>'+fr+'/'+F.outlet.ports+' cổng trống'+(F.outlet.speed?' · sạc nhanh ×'+F.outlet.speed:'')+(F.outlet.wet?' · chống nước':'')+(why?' · <b style="color:var(--bad)">'+why+'</b>':'')+'</small></div>'+
      (why?'':'<button class="go sm" onclick="pwConfirm('+iid+','+o.iid+')">Chọn</button>')+'</div>'};
  modal('<h3>🔌 Sạc '+f.n+'</h3><div class="card">'+furnTag(f.id,'',40,32)+'<div class="g">'+ROOM[i.room].n+'<br><small>'+pwBatTxt(i)+'</small>'+pwBar(pwPct(i))+'</div></div>'+
    (!powerOn()?'<div class="pw-warn">⛈ Đang mất điện và không có máy phát chạy dự phòng: chưa sạc được. Có điện lại sau '+mmss(pwOut().e-now())+'.</div>':'')+
    '<div class="dim" style="margin:6px 0">Nạp '+Math.round(q.need/f.pw.batteryCapacity*100)+'% pin · phí '+(q.solar?'<s>'+q.fee+'</s> <b>'+q.cost+' xu</b> (☀️ điện mặt trời giảm 50%)':'<b>'+q.fee+' xu</b>')+'. Chọn một ổ còn cổng trống trong '+ROOM[i.room].n+':</div>'+
    (L.length?L.map(row).join(''):'<div class="pw-warn">Phòng này chưa có ổ điện. Mua ổ ở Cửa hàng, mục ⚡ Điện năng, rồi gắn lên tường phòng này.'+(pwWet(i.room)?' Đây là chỗ ẩm hoặc ngoài trời: cần Ổ điện chống nước.':'')+'</div>')+
    '<div class="row wrap" style="justify-content:center;margin-top:8px">'+(L.length?'':'<button class="sm" onclick="pwShop()">🛒 Mua ổ điện</button>')+'<button class="sm" onclick="openPw('+iid+')">‹ Quay lại</button></div>');
}
function pwConfirm(iid,oid){
  const i=S.items.find(x=>x.iid===iid),o=S.items.find(x=>x.iid===oid);if(!i||!o)return pwPick(iid);
  const f=FURN[i.fid],F=FURN[o.fid],q=pwQuote(i),why=pwOutletWhy(o,i);if(why){toast('Không sạc được: '+why+'.',{type:'warn'});return pwPick(iid)}
  const a=Math.round(pwPct(i)*100);
  modal('<h3>Xác nhận sạc</h3><div class="card">'+furnTag(f.id,'',40,32)+'<div class="g"><b>'+f.n+'</b><br><small>'+a+'% → 100% · cắm vào '+F.n+'</small></div></div>'+
    '<div class="cd-sec"><div class="cd-grid">'+
    '<div class="k">Lượng pin nạp</div><div>'+Math.round(q.need)+' Wh ('+(100-a)+'%)</div>'+
    '<div class="k">Phí theo lượng nạp</div><div>'+q.fee+' xu <small class="dim">(sạc đầy '+f.pw.chargingCost+' xu)</small></div>'+
    '<div class="k">☀️ Điện mặt trời</div><div>'+(q.solar?'gánh '+q.disc+' đơn vị → giảm 50%':pwSolarCap()?'không đủ: cần '+q.solarNeed+', đang có '+Math.floor(pwSol()):'chưa lắp tấm pin')+'</div>'+
    '<div class="k">Phải trả</div><div><b style="font-size:17px">'+q.cost+' xu</b> <small class="dim">(bạn có '+S.coins.toLocaleString('vi-VN')+')</small></div>'+
    '<div class="k">Thời gian</div><div>khoảng '+fmtL(q.min/pwSpeed(o)*MIN)+(F.outlet.speed?' (ổ sạc nhanh)':'')+'</div></div></div>'+
    '<div class="dim" style="margin-top:6px">Xu trừ một lần khi xác nhận. Mất điện thì sạc tạm dừng và chạy tiếp khi có điện. Rút sạc giữa chừng được hoàn phần xu của lượng pin chưa nạp.</div>'+
    '<div class="row wrap" style="justify-content:center;margin-top:8px"><button class="go pw-ok" '+(S.coins<q.cost?'disabled':'')+' onclick="doPwCharge('+iid+','+oid+','+q.cost+')">✓ Xác nhận sạc · −'+q.cost+' xu</button><button class="sm" onclick="pwPick('+iid+')">‹ Chọn ổ khác</button></div>');
}
function doPwCharge(iid,oid,shown){
  const it0=S.items.find(x=>x.iid===iid);if(shown!=null&&it0&&pwQuote(it0).cost!==shown){toast('Pin vừa tụt thêm nên phí đổi thành '+pwQuote(it0).cost+' xu. Xem lại rồi xác nhận.',{type:'warn'});return pwConfirm(iid,oid)}  // không trừ khác số đã hiện
  const r=pwStartCharge(iid,oid);if(r.err){toast(r.err,{type:'warn'});return}
  const f=FURN[S.items.find(x=>x.iid===iid).fid];
  toast('Đã cắm sạc · −'+r.cost+' xu'+(r.disc?' (☀️ tiết kiệm '+r.disc+' xu)':'')+'. Đầy sau khoảng '+fmtL(r.min*MIN)+'.',{icon:'🔌',title:f.n,key:'pwchg'});
  render();if(pwBookOn())pwBookDraw();openPw(iid);
}
function doPwUnplug(iid){const i=S.items.find(x=>x.iid===iid);if(!i)return;const b=pwStopCharge(i,'',true);save();toast('Đã rút sạc'+(b?', hoàn '+b+' xu cho phần pin chưa nạp':'')+'.',{icon:'⏏',title:FURN[i.fid].n});render();openPw(iid)}
function pwOutletBox(o){
  const F=FURN[o.fid],L=pwPlugged(o.iid),why=o.broken?'đang hỏng':pwWet(o.room)&&!F.outlet.wet?'chỗ ẩm hoặc ngoài trời, cần ổ chống nước':!powerOn()?'mất nguồn điện':'';
  modal('<h3>'+F.n+'</h3><div style="text-align:center">'+furnTag(F.id,pwVar(o),72,54)+'</div>'+
    '<div class="cd-sec"><div class="cd-grid"><div class="k">Cổng</div><div>'+L.length+'/'+F.outlet.ports+' đang dùng</div>'+
    '<div class="k">Nguồn</div><div><b style="color:'+(why?'var(--bad)':'var(--good)')+'">'+(why?'Không dùng được: '+why:'Có điện')+'</b></div></div></div>'+
    (L.length?'<h4 style="text-align:left;margin:10px 0 4px">Đang sạc</h4>'+L.map(i=>'<div class="card tap" onclick="openPw('+i.iid+')">'+furnTag(i.fid,'',36,28)+'<div class="g"><b>'+FURN[i.fid].n+'</b><br><small>'+(F.outlet.smart?pwBatTxt(i):Math.round(pwPct(i)*100)+'% · đang sạc')+'</small>'+pwBar(pwPct(i))+'</div></div>').join(''):'<div class="dim" style="margin-top:6px">Chưa cắm thiết bị nào. Chạm vào một thiết bị điện trong phòng rồi chọn 🔌 Sạc thiết bị.</div>')+
    '<div class="dim" style="margin-top:6px">'+F.d+'</div><div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="openPower()">⚡ Sách điện</button></div>');
}
function pwSolarBox(s){
  const F=FURN[s.fid],eff=pwSolarItems().includes(s),cap=pwSolarCap(),o=wxNow();
  modal('<h3>'+F.n+'</h3><div style="text-align:center">'+furnTag(F.id,pwVar(s),96,72)+'</div>'+
    '<div class="cd-sec"><div class="cd-grid">'+(F.solar.rate?'<div class="k">Tấm này</div><div>'+(eff?'<b style="color:var(--good)">Đang có tác dụng</b>':'<b style="color:var(--bad)">Không có tác dụng: '+(s.broken?'đang hỏng':'quá số tấm cho phép ở chỗ này')+'</b>')+'</div>':'')+
    '<div class="k">Công suất lúc này</div><div>'+o.w.ic+' '+Math.round(pwSolarRate()*10)/10+' / '+pwSolarMax()+' đơn vị mỗi giờ'+(pwDayK()?'':' (ban đêm)')+'</div>'+
    '<div class="k">Lưu trữ</div><div>'+Math.floor(pwSol())+' / '+cap+' đơn vị'+pwBar(cap?pwSol()/cap:0,'#f2c230')+'</div>'+
    '<div class="k">Đã tiết kiệm</div><div>'+((S.pw&&S.pw.saved)||0).toLocaleString('vi-VN')+' xu</div></div></div>'+
    '<div class="dim" style="margin-top:6px">'+F.d+' Ban công tối đa '+PWC.room.balcony+' tấm, sân thượng '+PWC.room.rooftop+' tấm có tác dụng. Nhiều tấm chỉ làm đầy bộ lưu trữ nhanh hơn, mức giảm phí vẫn là 50%.</div>'+
    '<div class="row" style="justify-content:center;margin-top:8px"><button class="sm" onclick="openPower()">⚡ Sách điện</button></div>');
}
function pwGenBox(g){
  const F=FURN[g.fid],e=g.ge||0,run=genOn()&&e>0,st=g.room!=='basement'?'Chỉ chạy khi đặt ở Tầng hầm':run?'Đang chạy dự phòng':e>=1?'Sẵn sàng (đầy)':e>0?'Còn '+Math.round(e*100)+'%':'Cần sạc';
  modal('<h3>'+F.n+'</h3><div style="text-align:center">'+furnTag(F.id,pwVar(g),96,72)+'</div>'+
    '<div class="cd-sec"><div class="cd-grid"><div class="k">Trạng thái</div><div><b style="color:'+(run||e>=1?'var(--good)':'var(--bad)')+'">'+st+'</b></div>'+
    '<div class="k">Năng lượng</div><div>'+Math.round(e*100)+'% · chạy được '+fmtL(e*F.gen.run*MIN)+pwBar(e,'#7ad08a')+'</div>'+
    '<div class="k">Sạc đầy</div><div>'+F.gen.fee+' xu · chạy '+F.gen.run+' phút</div></div></div>'+
    '<div class="dim" style="margin-top:6px">Máy không bao giờ tự sạc (kể cả lúc bạn vắng). Khi mất điện, máy đã sạc tự chuyển sang nguồn dự phòng: đèn sáng lại, ổ điện sạc tiếp được, các bé đỡ sợ. Có điện lại thì máy đã chạy về 0% và cần sạc lại. '+F.d+'</div>'+
    '<div class="row wrap" style="justify-content:center;margin-top:8px"><button class="go" '+(e>=1||!gridOn()||g.room!=='basement'?'disabled':'')+' onclick="doPwGen('+g.iid+')">🔋 Sạc máy phát · '+F.gen.fee+' xu</button><button class="sm" onclick="openPower()">⚡ Sách điện</button></div>');
}
function doPwGen(iid){const r=pwGenCharge(iid);if(r.err){toast(r.err,{type:'warn'});return}const g=S.items.find(x=>x.iid===iid);toast('Máy phát đã đầy · −'+r.cost+' xu. Sẵn sàng khi mất điện.',{icon:'🔋',title:FURN[g.fid].n});render();if(pwBookOn())pwBookDraw();if($('modal').style.display==='flex')openPw(iid)}
function doPwTorch(){const r=pwUseTorch(cur);if(r.err){toast(r.err,{type:'warn'});return}toast('Đã soi đèn pin ở '+ROOM[cur].n+' trong '+PWC.fear.torch+' phút: các bé đỡ sợ hơn.',{icon:'🔦',title:'Đèn pin'});render();if(pwBookOn())pwBookDraw()}
function pwShop(){closeModal();if(pwBookOn())closePower();shopT='power';shopSel=null;setTab('shop')}

/* ---------- ổ ngủ chạy điện, chế độ Sắp xếp, cửa hàng, đặt đồ ---------- */
{const b0=openBed;openBed=function(iid){b0.apply(this,arguments);const it=S.items.find(i=>i.iid===iid);if(!it||!FURN[it.fid].pw||$('modal').style.display!=='flex')return;
  const q=pwQuote(it),d=document.createElement('div');d.className='cd-sec';d.style.marginTop='8px';
  d.innerHTML=emo('<h4>🔋 Pin</h4><div>'+pwBatTxt(it)+pwBar(pwPct(it))+'</div><div class="row wrap" style="justify-content:center;margin-top:6px">'+(it.charge?'<button class="sm" onclick="doPwUnplug('+iid+')">⏏ Rút sạc</button>':'<button class="go sm" '+(q.need?'':'disabled')+' onclick="pwPick('+iid+')">🔌 Sạc thiết bị'+(q.need?' · '+q.cost+' xu':'')+'</button>')+'</div>'+(pwDead(it)?'<div class="dim">Hết pin: vẫn là ổ ngủ nhưng không còn sưởi.</div>':''));
  $('mbox').appendChild(d)}}
{const H0=PANEL.home;PANEL.home=function(){let h=H0.apply(this,arguments);
  if(edit){const it=S.items.find(i=>i.iid===sel),k='<button style="flex:1" onclick="doFlip()">↔ Xoay</button>';
    if(it&&it.room!=null&&h.includes(k)){const f=FURN[it.fid];const b=f.pw?'<button style="flex:1" class="go" onclick="pwPick('+it.iid+')">🔌 Sạc thiết bị</button>':f.gen||f.outlet||f.solar?'<button style="flex:1" onclick="openPw('+it.iid+')">⚡ Xem</button>':'';h=h.replace(k,b+k)}
    return h}
  if(!pwOpen())return h;
  const L=pwElecIn(cur),low=L.filter(i=>pwPct(i)<PWC.low&&!i.charge),ch=L.filter(i=>i.charge),o=pwOut();
  if(!L.length&&!o)return h;
  const line='<div class="wxline pwline"><div class="g tap" onclick="openPower()">'+(o?'⛈ <b style="color:var(--bad)">Mất điện · '+mmss(o.e-now())+'</b>'+(genOn()?' · 🔋 máy phát':pwDark(cur)?' · phòng tối':'')+' · ':'')+'🔌 '+L.length+' thiết bị điện'+(ch.length?' · ⚡ '+ch.length+' đang sạc':'')+(low.length?' · <b style="color:var(--bad)">🪫 '+low.length+' pin yếu</b>':'')+'</div>'+
    (low.length?'<button class="sm" onclick="pwPick('+low[0].iid+')">🔌 Sạc '+FURN[low[0].fid].n+'</button>':'')+(o&&invN('flashlight')&&!pwTorch(cur)&&!genOn()?'<button class="sm" onclick="doPwTorch()">🔦 Đèn pin</button>':'')+'</div>';
  const wl=typeof wxLine==='function'?wxLine(cur):'',i=wl?h.indexOf(wl):-1;return i<0?line+h:h.slice(0,i+wl.length)+line+h.slice(i+wl.length)}}
{const P0=PANEL.shop;PANEL.shop=function(){let h=P0.apply(this,arguments);
  if(!pwOpen())h=h.replace('>⚡ Điện năng</button>','>🔒 ⚡ Điện năng</button>');
  if(shopT==='power')h+='<div class="dim" style="margin-top:8px">🔌 Ổ điện gắn lên tường (tự bám sát chân tường, không chồng lên đồ khác). Chỗ ẩm và ngoài trời cần ổ chống nước. ☀️ Tấm pin chỉ lắp ở Ban công hoặc Sân thượng. 🔋 Máy phát chỉ đặt ở Tầng hầm'+(S.rooms.basement?'':' (bạn chưa mở Tầng hầm)')+'. Mua khi đang ở phòng khác thì món được cất vào Kho đồ.</div>';
  return h}}
{const d0=doBuy;doBuy=function(fid){const f=FURN[fid];if(!f||!f.pwx)return d0.apply(this,arguments);
  if(!pwOpen()){toast('Điện năng mở khóa ở cấp '+WX_LV+'.',{type:'warn'});return}
  if(locked(f)){toast('🔒 Mở khóa ở cấp '+f.ul+'.',{type:'warn',title:f.n});return}
  if(f.gen&&!S.rooms.basement){toast('Cần mở Tầng hầm trước (Cửa hàng › Phòng, cấp '+ROOM.basement.ul+'). Máy phát chỉ đặt ở tầng hầm.',{type:'warn',title:f.n});return}
  if(f.rooms&&!f.rooms.some(r=>S.rooms[r])){toast(pwRoomWhy(fid)+' Bạn chưa có phòng nào như vậy.',{type:'warn',title:f.n});return}
  const it=buyItem(fid,cur,camX+VW/2);if(!it){toast('Không đủ xu.',{type:'warn'});return}
  if(it.room==null)toast('Đã cất vào Kho đồ. '+pwRoomWhy(fid)+' Sang phòng đó, bấm Sắp xếp đồ rồi Đặt vào phòng.',{type:'shop',title:f.n,ms:6000});
  else toast('Đã đặt vào '+ROOM[cur].n+(f.outlet?', gắn sát chân tường':'')+'. Bấm Sắp xếp ở tab Nhà để di chuyển.',{type:'shop',title:f.n});
  render()}}
{const p0=doPlace;doPlace=function(iid){const it=S.items.find(i=>i.iid===iid);if(it&&!pwRoomOk(it.fid,cur)){toast(pwRoomWhy(it.fid),{type:'warn',title:FURN[it.fid].n});return}return p0.apply(this,arguments)}}
// vuốt ve bé đang sợ: vỗ về
{const p0=petCat;petCat=function(c){const calm=pwCalm(c),n=p0.apply(this,arguments);if(calm){save();toast(c.fr>0?'được vỗ về, bớt sợ hơn rồi':'đã hết sợ',{icon:'🫂',title:c.name,key:'pwcalm'})}return n}}

/* ---------- vẽ trong phòng ---------- */
const PWBOLT=[[0,0],[-3,8],[2,9],[-4,20],[1,21],[-3,32]];
function pwDrawPip(g,x,y,p,ch){ // vạch pin nhỏ trên đầu thiết bị
  const w=9;x=Math.round(x-w/2);y=Math.round(y);g.fillStyle='#4e3026';g.fillRect(x-.5,y-.5,w+1,4);g.fillRect(x+w+.5,y+.5,1,2);
  g.fillStyle='#fff8ec';g.fillRect(x,y,w,3);g.fillStyle=pwCol(p);g.fillRect(x,y,Math.max(p>0?1:0,Math.round(w*p)),3);
  if(ch&&Math.floor(performance.now()/350)%2){g.fillStyle='#ffd83a';g.fillRect(x+w+2,y-2,2,3);g.fillRect(x+w+1,y,2,1);g.fillRect(x+w+1,y+1,2,3)}
}
function pwDrawRoom(g){
  if(!pwOpen())return;
  const its=itemsIn(cur),t=performance.now()/1000;
  // dây cắm: từ ổ trên tường xuống chân tường rồi võng nhẹ trên sàn tới thiết bị
  its.forEach(i=>{const c=i.charge,o=c&&S.items.find(x=>x.iid===c.o&&x.room===cur);if(!o)return;const f=FURN[i.fid],side=o.x<i.x?-1:1,ex=i.x+side*f.w*.35,ey=i.y-2,oy=o.y-3;
    g.lineCap='round';[['#3e2a22',1.3],['#7d6458',.5]].forEach(([col,lw])=>{g.strokeStyle=col;g.lineWidth=lw;g.beginPath();g.moveTo(o.x,oy);g.lineTo(o.x,WALL_Y+1);g.quadraticCurveTo((o.x+ex)/2,Math.max(WALL_Y+1,ey)+5,ex,ey);g.stroke()});
    g.fillStyle='#3e2a22';g.fillRect(Math.round(o.x)-1,oy-1,2,3);g.fillRect(Math.round(ex)-1,ey-1,2,2);
    if(powerOn()&&Math.floor(t*3+i.iid)%2){g.fillStyle='#ffe066';const k=(t*.8+i.iid*.3)%1,px=o.x+(ex-o.x)*k;g.fillRect(Math.round(px),Math.round(WALL_Y+1+(ey-WALL_Y)*k+Math.sin(k*Math.PI)*4),1,1)}});
  // vạch pin: thiết bị đang sạc, pin yếu hoặc hết pin
  its.forEach(i=>{const f=FURN[i.fid];if(!f.pw||i.broken)return;const p=pwPct(i);if(!(i.charge||p<PWC.low))return;pwDrawPip(g,i.x,i.y-f.h-6-(f.bowl?8:0),p,!!i.charge&&powerOn());
    if(p<=0){g.fillStyle='#d94a4a';g.font='bold 5px system-ui,sans-serif';g.textBaseline='top';g.fillText('!',i.x+7,i.y-f.h-8)}});
  // ổ thông minh: nhãn % và thời gian sạc còn lại
  its.filter(o=>FURN[o.fid].outlet&&FURN[o.fid].outlet.smart).forEach(o=>{const L=pwPlugged(o.iid);if(!L.length)return;const i=L[0],tx=Math.round(pwPct(i)*100)+'% '+(powerOn()?Math.ceil(pwChargeLeft(i)/60000)+'p':'⏸');
    g.font='bold 4.5px system-ui,sans-serif';const tw=Math.ceil(g.measureText(tx).width)+3,nx=Math.round(o.x-tw/2),ny=Math.round(o.y-FURN[o.fid].h)-8;
    g.fillStyle='#1f6b66';g.fillRect(nx-.5,ny-.5,tw+1,7);g.fillStyle='#e6fffb';g.fillRect(nx,ny,tw,6);g.fillStyle='#1f6b66';g.textBaseline='top';g.fillText(tx,nx+1.5,ny+.6)});
  // tia sét lớn lúc sét đánh
  if(PWU.bolt>0){const a=Math.min(1,PWU.bolt*2.5),x0=PWU.bx;g.globalAlpha=a;
    for(const [col,w] of [['rgba(255,250,200,.55)',5],['#fff6c0',2.4],['#ffffff',1]]){g.strokeStyle=col;g.lineWidth=w;g.lineJoin='miter';g.beginPath();
      let x=x0,y=camY-4;g.moveTo(x,y);for(let k=0;y<WALL_Y+40;k++){x+=PWBOLT[k%6][0]*1.6+Math.sin(k*7.1+x0)*3;y+=11;g.lineTo(x,y)}g.stroke()}
    g.globalAlpha=1}
  // mất điện: phòng tối (đèn khẩn cấp, đèn pin, máy phát làm sáng lại; phòng ngoài trời ban ngày chỉ tối nhẹ)
  if(pwOut()){
    const R=ROOM_CLIMATE[cur]||{},dk=genOn()?.12:pwDark(cur)?.62:(R.out&&pwDayK()>0)?.16:.42;
    g.fillStyle='rgba(10,12,34,'+dk+')';g.fillRect(camX,camY,VW,VHV);
    if(!genOn()){g.globalCompositeOperation='lighter';
      const glow=(x,y,r,a)=>{const gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,214,140,'+a+')');gr.addColorStop(1,'rgba(255,214,140,0)');g.fillStyle=gr;g.fillRect(x-r,y-r,2*r,2*r)};
      its.filter(i=>i.fid==='elamp'&&!i.broken&&pwCur(i)>0).forEach(i=>glow(i.x,i.y-10,52,.28+.03*Math.sin(t*3)));
      if(pwTorch(cur)){const x=camX+VW*(.5+.3*Math.sin(t*.7)),y=WALL_Y+30+Math.sin(t*1.3)*10;glow(x,y,40,.3)}
      g.globalCompositeOperation='source-over'}
  }
  if(PWU.flash>0){g.fillStyle='rgba(255,255,240,'+Math.min(.95,PWU.flash)+')';g.fillRect(camX,camY,VW,VHV)}
}
function pwStepRoom(dt){
  if(PWU.bolt>0)PWU.bolt=Math.max(0,PWU.bolt-dt);if(PWU.flash>0)PWU.flash=Math.max(0,PWU.flash-dt*1.4);
  // mèo sợ: giọt mồ hôi, run
  if(Math.random()<dt*4)ents.forEach(e=>{const c=entCat(e);if(!c||!(c.fr>0)||e.clone)return;const p=entPos(e);rp(p.x+rnd(-8,8),p.y-rnd(22,30),'rgba(150,200,255,.95)',{vy:10,g:30,life:.5,sz:1})});
}
{const s0=critStep,d0=critDraw;critStep=dt=>{s0(dt);pwStepRoom(dt)};critDraw=g=>{d0(g);pwDrawRoom(g)}}

/* ---------- sét đánh: chớp toàn màn hình, tia sét, rung, tiếng sấm, mèo giật mình ---------- */
function pwThunder(){snd(t=>{
  const n=AC.sampleRate*2.4,buf=AC.createBuffer(1,n,AC.sampleRate),d=buf.getChannelData(0);let v=0;
  for(let i=0;i<n;i++){v=v*.97+(Math.random()*2-1)*.3;const k=i/n;d[i]=v*(k<.03?k/.03:Math.pow(1-k,1.6))*(1+.6*Math.sin(k*40))}
  const s=AC.createBufferSource(),lp=AC.createBiquadFilter(),gn=AC.createGain();s.buffer=buf;lp.type='lowpass';lp.frequency.setValueAtTime(900,t);lp.frequency.exponentialRampToValueAtTime(140,t+2);
  gn.gain.value=.9;s.connect(lp);lp.connect(gn);gn.connect(AC.destination);s.start(t);
  const c=AC.createBufferSource(),hp=AC.createBiquadFilter(),g2=AC.createGain();c.buffer=buf;hp.type='highpass';hp.frequency.value=1800;g2.gain.setValueAtTime(.5,t);g2.gain.exponentialRampToValueAtTime(.001,t+.25);c.connect(hp);hp.connect(g2);g2.connect(AC.destination);c.start(t);
})}
function pwStrikeFx(){
  PWU.bolt=.7;PWU.flash=1;PWU.bx=camX+VW*rnd(.25,.75);if(typeof WXU!=='undefined'){WXU.flash=1;WXU.bolt=9}
  const fx=document.createElement('div');fx.className='pwfx';
  fx.innerHTML='<svg viewBox="0 0 100 160" preserveAspectRatio="none" aria-hidden="true"><path d="M58 0 L36 62 L52 64 L30 118 L46 120 L24 160 L74 92 L56 90 L80 40 L62 38 Z" fill="#fff6b0" stroke="#ffffff" stroke-width="2"/></svg>';
  document.body.appendChild(fx);setTimeout(()=>fx.remove(),1400);
  const rw=$('roomwrap');if(rw){rw.classList.remove('pwshake');void rw.offsetWidth;rw.classList.add('pwshake');setTimeout(()=>rw.classList.remove('pwshake'),700)}
  pwThunder();
  // mèo trong phòng đang xem giật mình: bé đang ngủ bị đánh thức và nhảy ra, bé khác nhảy dựng lên rồi chạy đi trốn
  ents.forEach(e=>{const c=entCat(e);if(!c||e.clone||e.ghost)return;
    if(e.state==='bed'){e.kick=1;return}
    if(['idle','walk','run','groom','nap','hide'].includes(e.state)){e.j={fx:e.x,fy:e.y,tx:clamp(e.x+rnd(-8,8),14,WORLD_W-14),ty:e.y,sy:e.y,next:'flee'};e.jt=0;e.jd=.42;e.state='jump';e.goal=null}
    e.emo='excl'});
  render();
}

/* ---------- mèo hoảng sợ: run, cúi rạp, trốn vào ổ hoặc góc phòng ---------- */
const pwScared=c=>!!c&&c.fr>0&&pwOpen();
{const C0=choose;choose=function(e){const c=entCat(e);
  if(pwScared(c)&&!e.clone&&Math.random()<.75){
    const bed=c.en<100&&itemsIn(cur).find(i=>{const f=FURN[i.fid];return f.bed&&!i.broken&&bedCats(i.iid).length<f.bed.at.length});
    if(bed&&putBed(c.uid,bed.iid).ok)return;                                         // trốn vào ổ, nhà mèo
    const cx=e.x<WORLD_W/2?16:WORLD_W-16;
    if(Math.abs(e.x-cx)<8){e.state='hide';e.t=rnd(4,9);e.emo=Math.random()<.4?'excl':null;e.goal=null;return}   // trong góc: cúi rạp, run
    e.state='run';e.tx=cx;e.ty=clamp(FLOOR_MAX-6+rnd(-6,4),FLOOR_MIN,FLOOR_MAX);e.goal=null;e.pre=0;e.acc=.5;e.left=0;return}
  return C0.apply(this,arguments)}}
{const S0=stepEnt;stepEnt=function(e,dt){if(e.state==='hide'){e.wt+=dt;if(e.emoT>0)e.emoT-=dt;e.t-=dt;const c=entCat(e);if(e.t<=0||!pwScared(c)){e.state='idle';e.t=.4;e.emo=null}return}return S0.apply(this,arguments)}}
{const E0=entPos;entPos=function(e){
  if(e.state==='hide')return {x:e.x+Math.sin(performance.now()/28+e.uid)*.45,y:e.y,sy:e.y,pose:'crouch'+(Math.floor(e.wt*3)%2)};
  const p=E0.apply(this,arguments),c=entCat(e);
  if(pwScared(c)&&e.state!=='jump'&&e.state!=='walk'&&e.state!=='run'&&e.state!=='bed'){p.x+=Math.sin(performance.now()/26+e.uid)*.4;if(e.state==='idle'&&!p.look)p.pose='crouch'+(Math.floor(e.wt*2)%2)}
  return p}}

/* ---------- SÁCH ĐIỆN: trang trái nguồn điện, trang phải thiết bị ---------- */
function pwLeft(){
  const o=pwOut(),p=pwS(),cap=pwSolarCap(),gens=pwGens(),low=pwLow(),t=wxClock(),w=wxNow(),bas=!!S.rooms.basement;
  const gRow=g=>{const F=FURN[g.fid],e=g.ge||0;return '<div class="pw-fr">'+furnTag(g.fid,'',26,22)+'<div class="g"><b>'+F.n.replace('Máy phát dự phòng ','')+'</b> · '+(genOn()&&e>0?'đang chạy':e>=1?'sẵn sàng':e>0?Math.round(e*100)+'%':'cần sạc')+pwBar(e,'#7ad08a')+'</div>'+
    (e<1?'<button class="sm" '+(gridOn()?'':'disabled')+' onclick="doPwGen('+g.iid+')">'+F.gen.fee+' xu</button>':'<b>'+F.gen.run+'p</b>')+'</div>'};
  const smart=pwSolarItems().some(i=>FURN[i.fid].solar.smart);
  return '<h3>Nguồn điện</h3>'+
    (o?'<div class="pw-out"><div class="t">⛈ MẤT ĐIỆN</div><div>Có điện lại sau <b>'+mmss(o.e-now())+'</b></div>'+pwBar((now()-o.s)/(o.e-o.s),'#ffd83a')+
      '<small>'+(genOn()?'🔋 Máy phát đang cấp điện dự phòng: đèn sáng, ổ điện sạc được.':'Không sạc được bằng điện lưới. Đồ chạy pin vẫn chạy tới khi hết pin; đồ không dùng điện vẫn bình thường.')+'</small>'+
      (!genOn()?'<div class="row wrap" style="margin-top:4px">'+(invN('flashlight')?'<button class="sm" '+(pwTorch(cur)?'disabled':'')+' onclick="doPwTorch()">🔦 Soi đèn pin ở '+ROOM[cur].n+' ('+invN('flashlight')+')</button>':'<small>🔦 Mua Đèn pin ở mục Sinh tồn để soi sáng phòng tối.</small>')+'</div>':'')+'</div>'
     :'<div class="wb-now"><div class="pw-big">⚡</div><div><div class="n">Điện lưới: có điện</div><small>'+(p.last?'Lần mất điện gần nhất: '+hhmm(p.last.s)+' ngày '+new Date(p.last.s).getDate()+'/'+(new Date(p.last.s).getMonth()+1):'Chưa từng bị mất điện')+'</small></div></div>')+
    '<h4>☀️ Điện mặt trời</h4>'+(cap?'<div class="pw-fr">'+wxIcon(w.type,26)+'<div class="g">Đang tạo <b>'+Math.round(pwSolarRate()*10)/10+'</b> đơn vị/giờ'+(pwDayK()?'':' (ban đêm)')+' · lưu <b>'+Math.floor(pwSol())+'/'+cap+'</b>'+pwBar(pwSol()/cap,'#f2c230')+'</div></div>'+
        '<div class="dim">Đã tiết kiệm <b>'+(p.saved||0).toLocaleString('vi-VN')+' xu</b>. Mỗi lần sạc giảm 50% (làm tròn lên) nếu bộ lưu trữ đủ điện.</div>'+
        (smart?'<div class="dim">Dự báo sản lượng: '+wxForecast(3).map(x=>x.w.ic+' ×'+String(PWC.solar.wx[x.type]!=null?PWC.solar.wx[x.type]:.5).replace('.',',')).join(' · ')+'</div>':'')
       :'<div class="dim">'+(S.level>=SOLAR_LV?'Chưa lắp tấm pin. Lắp ở Ban công hoặc Sân thượng (Cửa hàng › ⚡ Điện năng).':'🔒 Mở ở cấp '+SOLAR_LV+': tấm pin ở Ban công, Sân thượng giảm 50% phí sạc.')+'</div>')+
    '<h4>🔋 Máy phát dự phòng</h4>'+(gens.length?'<div class="pw-gl">'+gens.map(gRow).join('')+'</div>':'<div class="dim">'+(S.level<GEN_LV?'🔒 Mở ở cấp '+GEN_LV+' cùng Tầng hầm.':bas?'Chưa có máy phát ở Tầng hầm.':'Cần mở Tầng hầm trước, máy phát chỉ đặt ở đó.')+'</div>')+
    (low.length?'<div class="wb-warn">🪫 '+low.length+' thiết bị sắp hết pin: '+low.slice(0,3).map(i=>FURN[i.fid].n+' ('+Math.round(pwPct(i)*100)+'%)').join(', ')+(low.length>3?'…':'')+'</div>':'')+
    '<div class="row wrap pw-bk"><button class="sm" onclick="closePower();openClimate()">🌡 Sách khí hậu</button><button class="sm" onclick="pwShop()">🛒 Mua đồ điện</button>'+(typeof openHandbook==='function'?'<button class="sm" onclick="openHandbook(\'power\')">📖 Hướng dẫn</button>':'')+'</div>';
}
function pwRight(){
  const L=pwAllDev().sort((a,b)=>(a.charge?1:0)-(b.charge?1:0)||pwPct(a)-pwPct(b)),n=Math.max(1,Math.ceil(L.length/PWU.per));PWU.pg=clamp(PWU.pg,0,n-1);
  const outs=S.items.filter(i=>i.room!=null&&FURN[i.fid].outlet),used=outs.reduce((a,o)=>a+pwPlugged(o.iid).length,0),ports=outs.reduce((a,o)=>a+FURN[o.fid].outlet.ports,0);
  const row=i=>{const f=FURN[i.fid],p=pwPct(i),q=pwQuote(i),ol=i.charge&&S.items.find(o=>o.iid===i.charge.o);
    return '<div class="wb-room pw-row '+(p<PWC.low?'hot':p<.5?'meh':'ok')+'" onclick="openPw('+i.iid+')" role="button" tabindex="0"><div class="pw-ic">'+furnTag(f.id,'',30,26)+'</div><div class="g"><div class="nm">'+f.n+' <small>· '+ROOM[i.room].n+'</small></div>'+
      '<div class="ln">🔋 <b style="color:'+(p<PWC.low?'#c0503a':'inherit')+'">'+Math.round(p*100)+'%</b> · '+(i.charge?(powerOn()?'⚡ sạc, còn '+fmtL(pwChargeLeft(i)):'⏸ tạm dừng')+' · '+FURN[ol.fid].n:pwDead(i)?'hết pin':'còn '+fmtL(pwRunLeft(i)))+'</div>'+pwBar(p)+'</div>'+
      (i.charge?'<span class="pw-plug">🔌</span>':'<button class="sm" '+(q.need?'':'disabled')+' onclick="event.stopPropagation();pwPick('+i.iid+')">'+(q.need?'Sạc '+q.cost+' xu':'Đầy')+'</button>')+'</div>'};
  return '<div class="wb-sheet"><h3>Thiết bị điện</h3><div class="dim pw-sum">🔌 '+outs.length+' ổ điện · '+used+'/'+ports+' cổng đang sạc · '+L.length+' thiết bị</div>'+
    '<div class="wb-list">'+(L.length?L.slice(PWU.pg*PWU.per,(PWU.pg+1)*PWU.per).map(row).join(''):'<div class="dim" style="padding:10px">Chưa đặt thiết bị điện nào. Quạt, máy sưởi, điều hòa, máy lọc không khí… đều chạy pin và phải sạc tay ở ổ điện.</div>')+'</div>'+
    '<div class="wb-nav"><button class="sm" '+(PWU.pg<=0?'disabled':'')+' onclick="pwPage(-1)" aria-label="Trang trước">◀</button><span class="pg">Trang '+(PWU.pg+1)+' / '+n+'</span><button class="sm" '+(PWU.pg>=n-1?'disabled':'')+' onclick="pwPage(1)" aria-label="Trang sau">▶</button></div></div>';
}
function pwBookDraw(part){
  const e=$('pwbook');if(!e||!pwBookOn())return;
  if(part!=='r')e.querySelector('.wb-l').innerHTML=emo(pwLeft());
  if(part!=='l'){const r=e.querySelector('.wb-r'),old=r.innerHTML,d=PWU.dir;r.innerHTML=emo(pwRight());PWU.dir='';
    const L=r.querySelector('.wb-list');
    if(L&&!PWU.fit&&L.firstElementChild&&L.firstElementChild.classList.contains('pw-row')){PWU.fit=1;const rh=Math.max(48,...[...L.children].map(c=>c.offsetHeight)),per=Math.max(1,Math.floor((L.clientHeight+6)/(rh+6)));
      if(per!==PWU.per){const first=PWU.pg*PWU.per;PWU.per=per;PWU.pg=Math.floor(first/per);r.innerHTML=emo(pwRight())}}
    bookFlip(r,old,d)}
}
function openPower(){
  if(!pwOpen()){toast('Điện năng mở khóa ở cấp '+WX_LV+'.',{icon:'🔒',title:'Chưa mở khóa',key:'pwlock'});return}
  if($('modal').style.display==='flex'&&!$('modal').classList.contains('lock'))closeModal();
  if(typeof closeBook==='function')closeBook();
  let e=$('pwbook');
  if(!e){e=document.createElement('div');e.id='pwbook';e.addEventListener('click',ev=>{if(ev.target===e)closePower()});document.body.appendChild(e)}
  if(pwBookOn()){pwBookDraw();return}
  e.innerHTML='<div class="wb-book pw-book" role="dialog" aria-label="Sách điện"><div class="wb-mark"></div><button class="wb-x sm" aria-label="Đóng" onclick="closePower()">✕</button><div class="wb-page wb-l"></div><div class="wb-spine"></div><div class="wb-page wb-r"></div></div>';
  e.classList.add('on');PWU.fit=0;pwBookDraw();
}
function closePower(){const e=$('pwbook');if(e)e.classList.remove('on')}
function pwPage(d){PWU.pg+=d;PWU.dir=d>0?'fl':'fr';pwBookDraw('r')}
addEventListener('keydown',ev=>{if(ev.key==='Escape'&&pwBookOn()&&$('modal').style.display!=='flex')closePower()});
addEventListener('resize',()=>{if(pwBookOn()){PWU.fit=0;pwBookDraw('r')}});
setInterval(()=>{if(pwBookOn()&&$('modal').style.display!=='flex')pwBookDraw()},2000);
// sách khí hậu có nút sang sách điện (sách quản lý nhà)
{const B0=openBook;openBook=function(){B0.apply(this,arguments);const e=$('wxbook');if(!e||!pwOpen()||e.querySelector('.pw-tab'))return;const b=e.querySelector('.wb-book');if(!b)return;
  const t=document.createElement('button');t.className='sm pw-tab';t.textContent='⚡ Sách điện';t.setAttribute('aria-label','Mở sách điện');t.onclick=()=>{closeBook();openPower()};b.appendChild(t)}}
{const C0=closeBook;closeBook=function(){C0.apply(this,arguments);const t=document.querySelector('#wxbook .pw-tab');if(t)t.remove()}}

/* ---------- lúc vắng mặt ---------- */
setTimeout(()=>{if(!S||!pwOpen())return;const L=[];
  if(PWAWAY.strike)L.push('⚡ Sét đánh làm mất điện 15 phút'+(pwOut()?' (còn '+mmss(pwOut().e-now())+')':', nay đã có điện lại'));
  if(PWAWAY.dead.length)L.push('🪫 Hết pin: '+[...new Set(PWAWAY.dead)].slice(0,4).join(', '));
  const low=pwLow().filter(i=>!pwDead(i));if(low.length)L.push('🔋 '+low.length+' thiết bị pin dưới '+Math.round(PWC.low*100)+'%');
  if(L.length)toast(L.join(' · '),{icon:'⚡',title:'Điện năng lúc bạn vắng',ms:9000,key:'pwaway'});PWAWAY.dead=[];PWAWAY.strike=0},2500);

/* ---------- Admin: thử mất điện, pin, điện mặt trời, máy phát ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const d=document.createElement('div');d.innerHTML=pwAdmBox();const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function pwAdmBox(){
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',o=pwOut(),p=pwS();
  return '<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>⚡ Điện năng</b>'+
    '<div class="dim">'+(o?'Đang mất điện, còn '+mmss(o.e-now()):'Có điện')+' · điện mặt trời '+Math.floor(pwSol())+'/'+pwSolarCap()+' · tiết kiệm '+(p.saved||0)+' xu'+(p.sch?' · sét định giờ lúc '+hhmm(p.sch.t):'')+'</div>'+
    '<div class="row wrap">'+B('admPwOut()','⛈ Gây mất điện (sét đánh)')+B('admPwEnd()','💡 Có điện lại ngay')+'</div>'+
    '<div class="row wrap">'+B('admPwBat(1)','🔋 Sạc đầy mọi thiết bị')+B('admPwBat(0)','🪫 Xả pin về 0%')+B('admPwBat(.15)','Pin 15% (thử cảnh báo)')+'</div>'+
    '<div class="row wrap">'+B('admPwSol()','☀️ Đầy bộ lưu trữ mặt trời')+B('admPwGen()','🔋 Sạc đầy máy phát')+B('admPwGive()','Nhận đủ đồ điện')+'</div>'+
    '<div class="dim">Gây mất điện chạy đúng như sét thật (mèo sợ, phòng tối, 15 phút). Sạc đầy và xả pin không trừ xu.</div></div>';
}
function admPwOut(){closeModal();if(!pwStrike(now(),false))toast('Đang mất điện rồi.',{type:'warn'});render()}
function admPwEnd(){const p=pwS();if(p.out){p.out.e=now();pwRestore(false)}admDone('Đã có điện lại',1)}
function admPwBat(k){let n=0;S.items.forEach(i=>{const f=FURN[i.fid];if(!f.pw||i.room==null)return;n++;i.currentBattery=f.pw.batteryCapacity*k;if(k>=PWC.low)delete i.lw;if(k>=1&&i.charge){delete i.charge;i.chargingState='idle'}});wxDirty();admDone(n+' thiết bị điện: pin '+Math.round(k*100)+'%',1)}
function admPwSol(){const p=pwS();p.sol=pwSolarCap();admDone(p.sol?'Bộ lưu trữ đầy '+p.sol+' đơn vị':'Chưa có tấm pin nào có tác dụng',1)}
function admPwGen(){let n=0;S.items.forEach(g=>{if(FURN[g.fid].gen){g.ge=1;delete g.gu;n++}});admDone(n?n+' máy phát đã đầy':'Chưa có máy phát',1)}
function admPwGive(){let n=0;PWITEMS.forEach(f=>{if(!S.items.some(i=>i.fid===f.id)){const it={iid:S.nid++,fid:f.id,room:null,x:120,y:140,flip:false,broken:false};if(f.pw)it.currentBattery=f.pw.batteryCapacity;S.items.push(it);n++}});admDone(n?'Đã thêm '+n+' đồ điện vào Kho đồ':'Đã có đủ đồ điện',1)}
