"use strict";
/* ============ VƯỜN NHỎ (2026-11-12): giao diện ============
   Luật: js/garden.js. Nạp ngay sau js/stray-ui.js (sau js/tut-text.js, trước tut-wx.js: chương Sổ tay phải chèn trước khi danh sách chương bị bọc getter).
   Bọc: wxVar (hình chậu theo giai đoạn, hồ theo số cá), wxDevTap (chạm chậu, hồ mở bảng vườn), buyItem (khởi tạo trạng thái), critDraw (dấu trên chậu),
   openAdmin (thẻ thử nhanh). stray-ui.js gọi gdLureBtns(uid) để thêm bát mồi bằng rau vườn. CSS: css/garden.css. */
{const v0=wxVar;wxVar=function(i){const f=FURN[i.fid];if(f&&(f.gd||f.pond))return gdVar(i);return v0.apply(this,arguments)}}
{const t0=wxDevTap;wxDevTap=function(it){const f=FURN[it.fid];if(f&&(f.gd||f.pond)){GDT=performance.now();openGarden(it.iid);return true}return t0.apply(this,arguments)}}
{const b0=buyItem;buyItem=function(){const it=b0.apply(this,arguments);if(it)gdInit(it);return it}}
// mua món vườn: báo đúng nơi đặt (đang ở phòng không trồng được thì món vào Kho đồ, js/pw.js)
{const d0=doBuy;doBuy=function(fid){const f=FURN[fid];if(!f||!(f.gd||f.pond))return d0.apply(this,arguments);
  if(!f.rooms.some(r=>S.rooms[r])){toast(pwRoomWhy(fid)+' Bạn chưa có phòng nào như vậy.',{type:'warn',title:f.n});return}
  const it=buyItem(fid,cur,camX+VW/2);if(!it){toast('Không đủ xu.',{type:'warn'});return}
  if(it.room==null)toast('Đã cất vào Kho đồ. '+pwRoomWhy(fid)+' Sang phòng đó, bấm Sắp xếp đồ rồi Đặt vào phòng.',{type:'shop',title:f.n,ms:6000});
  else toast('Đã đặt vào '+ROOM[cur].n+'. Chạm vào '+(f.pond?'hồ để cho cá ăn':'chậu để gieo hạt')+'.',{type:'shop',title:f.n});render()}}
const GDST=['Chưa trồng','🌱 Mầm non','🌿 Đang lớn','✨ Đã chín'];
const gdBar=(v,col)=>'<div class="gd-bar"><i style="width:'+Math.round(clamp(v,0,100))+'%;background:'+col+'"></i></div>';
const gdN=()=>Object.values(gdBox().inv).reduce((a,b)=>a+b,0);
let GDV=null; // bảng vườn đang mở: {iid} hoặc {basket:1, back: iid}
let GDT=0;    // lúc chạm chậu, hồ để mở bảng: trên màn cảm ứng, cú click trình duyệt sinh ra sau khi nhấc ngón tay rơi đúng vào nút của bảng vừa mở, nên bỏ qua nút bấm trong 0,45 giây đầu
function gdHead(it){
  const f=FURN[it.fid],rc=roomClimate(it.room),o=rc.o,w=WX[o.type]||{};
  return '<div class="gd-hd">'+furnTag(it.fid,gdVar(it),112,56)+'<div class="gd-ht"><b>'+f.n+'</b><div class="dim">'+ROOM[it.room].n+' · '+(typeof wxIcon==='function'?wxIcon(o.type,18):w.ic)+' '+w.n+' · '+Math.round(rc.T)+'°C</div></div></div>';
}
function gdEnvHtml(rid){const e=gdEnv(rid);return e.why.length?'<div class="gd-why">'+e.why.map(([k,t])=>wl(k,t)).join('')+'</div>':''}
function openGarden(iid){
  const it=S.items.find(i=>i.iid===iid&&i.room!=null);if(!it){closeModal();return}gdInit(it);GDV={iid};
  let h='<div class="gd">'+gdHead(it);
  if(it.gd){const g=it.gd,C=GCROP[g.c],f=FURN[it.fid];
    if(!g.c){h+='<div class="gd-sec"><b>Chậu trống</b> · chọn hạt để gieo <small class="dim">(đất '+Math.round(g.wa)+'% ẩm)</small><div class="gd-seeds">'+
      GCROPS.map(c=>{const lk=S.level<c.ul,ny=Math.max(1,Math.round(c.yield*f.gd.mult*1.5));
        return '<button class="gd-seed" '+(lk||S.coins<c.seed?'disabled ':'')+'onclick="gdDo(\'plant\','+iid+',\''+c.id+'\')"><span class="gd-ic">'+c.ic+'</span><b>'+c.n+'</b><small>'+(lk?'🔒 Cấp '+c.ul:c.seed+' xu · '+fmtM(c.grow*60000)+' · thu '+ny)+'</small></button>'}).join('')+
      '</div></div>';
    }else{const st=g.dead?'🥀 Đã chết khô':GDST[gdStage(g)],eta=gdEta(it);
      h+='<div class="gd-sec"><div class="gd-name">'+C.ic+' <b>'+C.n+'</b> <span class="gd-st'+(g.dead?' bad':g.p>=1?' ok':'')+'">'+st+'</span></div>'+
        '<div class="gd-rows"><span>💧 Đất ẩm</span>'+gdBar(g.wa,g.wa<15?'#d9705a':'#5aa9d9')+'<b>'+Math.round(g.wa)+'%</b>'+
        '<span>🌿 Sức cây</span>'+gdBar(g.hp,g.hp<40?'#d9705a':'#7cbf6a')+'<b>'+Math.round(g.hp)+'</b>'+
        '<span>⏳ Tiến độ</span>'+gdBar(g.p*100,'#e8b04a')+'<b>'+Math.floor(g.p*100)+'%</b></div>'+
        '<div class="dim gd-eta">'+(g.dead?'Cây đã chết vì '+(g.wa<=0?'khát lâu':'thời tiết khắc nghiệt')+'. Dọn chậu rồi gieo lại.':g.p>=1?'Đã chín! Thu hoạch được khoảng '+gdYield(it)+' '+C.n.toLowerCase()+(g.hp<80?' (cây khỏe, sức từ 80, được thêm một nửa)':'')+'.':eta?'Chín sau khoảng '+fmtM(eta*60000)+' nếu thời tiết giữ như bây giờ.':'Cây đang không lớn'+(g.wa<=0?' vì đất khô: tưới ngay!':'.'))+'</div></div>';
    }
    h+=gdEnvHtml(it.room);
    h+='<div class="gd-act">'+(g.c&&!g.dead&&g.p>=1?'<button class="on" onclick="gdDo(\'harvest\','+iid+')">🧺 Thu hoạch</button>':'')+
      '<button '+(g.wa>=95?'disabled ':'')+'onclick="gdDo(\'water\','+iid+')">💧 Tưới'+(g.wa>=95?' (còn ẩm)':'')+'</button>'+
      (g.c?'<button class="sm" onclick="gdDo(\'clear\','+iid+')">🗑 '+(g.dead?'Dọn cây chết':'Nhổ bỏ')+'</button>':'')+'</div>';
  }
  if(it.fp){const fp=it.fp,F=GDC.fish,t=now(),fed=fp.fed>t,ice=roomClimate(it.room).T<=0;
    h+='<div class="gd-sec"><div class="gd-name">🐟 <b>'+fp.n+' chú cá</b> <span class="gd-st'+(fed?' ok':'')+'">'+(ice?'🧊 Mặt hồ đóng băng':fed?'No tới '+fmtM(fp.fed-t)+' nữa':'Đang đói')+'</span></div>'+
      (fp.n<F.max?'<div class="gd-rows"><span>🥚 Cá con</span>'+gdBar((fp.b||0)*100,'#f2a65a')+'<b>'+Math.floor((fp.b||0)*100)+'%</b></div>':'')+
      '<div class="dim gd-eta">'+(fp.n>=F.max?'Hồ đã đủ '+F.max+' chú cá. Bán bớt để cá tiếp tục đẻ.':ice?'Băng tan (trên 0°C) cá mới đẻ tiếp.':fed?'Được cho ăn thì cứ khoảng '+fmtM(F.breed*60000)+' hồ có thêm một chú cá con.':'Cho cá ăn để cá đẻ thêm. Cá không bao giờ chết đói.')+' Mèo trong phòng thích ngồi ngắm cá: +'+FURN[it.fid].happy+' vui.</div></div>'+
      '<div class="gd-act"><button class="on" '+(fed&&fp.fed-t>F.fed*30000||S.coins<F.feed?'disabled ':'')+'onclick="gdDo(\'feed\','+iid+')">🍤 Cho cá ăn · '+F.feed+' xu</button>'+
      '<button '+(fp.n<=1?'disabled ':'')+'onclick="gdDo(\'sell\','+iid+')">💰 Bán 1 chú · +'+F.sell+' xu</button>'+
      '<button class="sm" '+(fp.n>=F.max||S.coins<F.buy?'disabled ':'')+'onclick="gdDo(\'buy\','+iid+')">➕ Mua cá · '+F.buy+' xu</button></div>';
  }
  const dry=gdItems().filter(i=>i.gd&&i.room===it.room&&i.gd.wa<95).length;
  h+='<div class="gd-foot"><button class="sm" onclick="openBasket('+iid+')">🧺 Giỏ vườn ('+gdN()+')</button>'+(dry>1?'<button class="sm" onclick="gdDo(\'waterall\','+iid+')">💧 Tưới cả '+ROOM[it.room].n+' ('+dry+')</button>':'')+'</div></div>';
  modal(h);
}
function gdDo(k,iid,x){
  if(performance.now()-GDT<450)return;
  let e='';
  if(k==='plant'){e=gdPlant(iid,x);if(!e)toast('Đã gieo '+GCROP[x].n.toLowerCase()+' (−'+GCROP[x].seed+' xu). Nhớ tưới khi đất khô.',{icon:GCROP[x].ic,title:'Vườn nhỏ',key:'gdplant'})}
  else if(k==='water'){e=gdWater(iid);if(!e)toast('Đã tưới đẫm.',{icon:'💧',title:'Vườn nhỏ',key:'gdwater'})}
  else if(k==='waterall'){const it=gdIt(iid),n=it?gdWaterAll(it.room):0;toast('Đã tưới '+n+' chậu, luống.',{icon:'💧',title:'Vườn nhỏ',key:'gdwater'})}
  else if(k==='clear')e=gdClear(iid);
  else if(k==='harvest'){const r=gdHarvest(iid);if(r.err)e=r.err;else toast('Thu hoạch '+r.n+' '+GCROP[r.cid].n.toLowerCase()+' vào giỏ vườn. Nấu thành suất ăn hoặc làm bát mồi.',{icon:'🧺',title:'Vườn nhỏ',key:'gdharv'})}
  else if(k==='feed'){e=gdFeedFish(iid);if(!e)toast('Cá đã no, sẽ đẻ thêm trong 6 giờ tới.',{icon:'🐟',title:'Hồ cá',key:'gdfish'})}
  else if(k==='sell'){e=gdSellFish(iid);if(!e)toast('Đã bán một chú cá (+'+GDC.fish.sell+' xu).',{icon:'🐟',title:'Hồ cá',key:'gdfish',coins:GDC.fish.sell})}
  else if(k==='buy')e=gdBuyFish(iid);
  if(e)toast(e,{type:'warn',title:'Vườn nhỏ'});
  render();openGarden(iid);
}
function openBasket(back){
  GDV={basket:1,back};const B=gdBox().inv;
  let h='<div class="gd"><h3>🧺 Giỏ vườn</h3><div class="gd-inv">'+GCROPS.map(c=>'<div class="gd-pc'+(B[c.id]?'':' zero')+'"><span class="gd-ic">'+c.ic+'</span><b>'+(B[c.id]||0)+'</b><small>'+c.n+'</small></div>').join('')+'</div>'+
    '<div class="gd-sec"><b>🍳 Nấu thành suất ăn</b> <small class="dim">· vào kho thức ăn, đổ vào bát bằng nút Cho ăn</small><div class="gd-rec">'+
    GRECIPES.map(r=>{const okk=gdHas(r.need),F=FOOD[r.food];
      return '<div class="gd-r"><div><b>'+F.ic+' '+r.n+'</b><small>'+Object.entries(r.need).map(([k,q])=>'<span class="'+((B[k]||0)>=q?'ok':'no')+'">'+GCROP[k].ic+' '+(B[k]||0)+'/'+q+'</span>').join(' ')+' → '+F.ic+' '+r.q+' suất '+F.n.toLowerCase()+'</small></div><button class="sm'+(okk?' on':'')+'" '+(okk?'':'disabled ')+'onclick="gdDoCook(\''+r.id+'\','+(back==null?'null':back)+')">Nấu · '+r.q+' suất</button></div>'}).join('')+
    '</div></div><div class="dim gd-eta">🎒 Bé đi lạc: rau trong giỏ đặt làm bát mồi miễn phí (cỏ mèo '+GLURE.grass+' phút, bí đỏ '+GLURE.pump+' phút, cà rốt '+GLURE.carrot+' phút), mở ở màn chi tiết của bé.</div>'+
    (back!=null?'<div class="gd-foot"><button class="sm" onclick="openGarden('+back+')">‹ Quay lại</button></div>':'')+'</div>';
  modal(h);
}
function gdDoCook(id,back){const r=gdCook(id);if(r.err)toast(r.err,{type:'warn',title:'Giỏ vườn'});else toast('Đã nấu '+r.n+' suất '+FOOD[r.food].n.toLowerCase()+' vào kho thức ăn.',{icon:FOOD[r.food].ic,title:'Giỏ vườn',key:'gdcook'});render();openBasket(back)}
// bát mồi bằng rau vườn trong màn chi tiết bé đi lạc (js/stray-ui.js)
function gdLureBtns(uid){const B=gdBox().inv;return GCROPS.filter(c=>B[c.id]>0&&GLURE[c.id]).map(c=>'<button class="sm" onclick="doGdLure('+uid+',\''+c.id+'\')">'+c.ic+' '+c.n+' vườn <small>'+GLURE[c.id]+' phút · còn '+B[c.id]+'</small></button>').join('')}
function doGdLure(uid,cid){const r=gdLure(uid,cid),c=catBy(uid);if(r.err){toast(r.err,{type:'warn'});return}
  toast('Đã đặt bát '+GCROP[cid].n.toLowerCase()+' hái từ vườn. '+c.name+' sẽ ngửi thấy và về sau khoảng '+r.min+' phút.',{icon:'🍲',title:'Bát mồi',key:'lure'});render();openCat(uid)}
// làm mới bảng vườn đang mở (cây lớn, đất khô dần)
setInterval(()=>{if(!GDV||$('modal').style.display!=='flex'||!$('mbox').querySelector('.gd'))return;const y=$('mbox').scrollTop;if(GDV.iid!=null)openGarden(GDV.iid);$('mbox').scrollTop=y},3000);
{const c0=closeModal;closeModal=function(){GDV=null;return c0.apply(this,arguments)}}
// dấu trên chậu, hồ trong phòng: chín (✨), khát (bình nước), chết (⚠), cá đói (🐟)
{const d0=critDraw;critDraw=function(g){d0(g);if(edit||!gdOpen())return;const t=performance.now()/1000;
  itemsIn(cur).forEach(i=>{const f=FURN[i.fid];let n='';
    if(i.gd){const G=i.gd;n=G.dead?'warn':G.c&&G.p>=1?'sparkle':G.c&&G.wa<15?'bottle':''}
    else if(i.fp&&!(i.fp.fed>now())&&i.fp.n<GDC.fish.max)n='fish';
    if(!n)return;const x=Math.round((i.x-8)*ZC)/ZC,y=Math.round((i.y-f.h-17+Math.sin(t*2.2+i.iid)*1.2)*ZC)/ZC;g.drawImage(wishCv(n),x,y,16,16)})}}
// Sổ tay
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='garden'))return;
  const i=P.findIndex(p=>p.id==='stray');P.splice(i<0?P.length:i+1,0,{id:'garden',ic:'🌱',t:'Vườn nhỏ: trồng rau, nuôi cá',p:[
    'Từ cấp '+GD_LV+', Cửa hàng có mục 🌱 Vườn nhỏ: Chậu cây nhỏ, Luống rau gỗ (thu hoạch gấp 3) và Hồ cá cảnh. Chỉ đặt được ở phòng ngoài trời (Ban công, Sân vườn, Hồ bơi, Sân thượng) hoặc Nhà kính.',
    'Chạm vào chậu để gieo hạt: '+GCROPS.map(c=>c.ic+' '+c.n+' ('+c.seed+' xu, khoảng '+fmtM(c.grow*60000)+', cấp '+c.ul+')').join(', ')+'. Cây lớn qua ba giai đoạn: mầm non, đang lớn, đã chín.',
    'Nắng mưa ảnh hưởng tới vườn: có nắng ban ngày cây lớn nhanh hơn 30%, ban đêm chậm một nửa; mùa xuân nhanh, mùa đông chậm. Mưa tự tưới cây. Nắng nóng, gió làm đất khô nhanh. Dưới 14°C cây lớn chậm, dưới 8°C gần như đứng yên, từ 0°C trở xuống cây bị dập lá. Mưa to gió lớn quật cây yếu đi.',
    'Đất khô kiệt thì cây héo, không lớn và yếu dần; để khô quá lâu (khoảng nửa ngày kể từ lúc tưới) cây chết khô. Tưới không tốn xu. Mái che, Rèm chắn mưa che giông bão; máy sưởi đặt cùng phòng giữ ấm cho cây; Nhà kính che mưa gió nhưng phải tự tưới.',
    'Cây khỏe (sức từ 80) cho thêm một nửa sản lượng, cây yếu (dưới 40) chỉ còn một nửa. Thu hoạch vào 🧺 Giỏ vườn, +'+GDC.xp+' kinh nghiệm mỗi lần.',
    'Nấu trong Giỏ vườn thành suất ăn trong kho thức ăn (đổ vào bát bằng nút Cho ăn): '+GRECIPES.map(r=>r.n+' ('+Object.entries(r.need).map(([k,q])=>q+' '+GCROP[k].n.toLowerCase()).join(' + ')+' → '+r.q+' suất '+FOOD[r.food].n.toLowerCase()+')').join('; ')+'. Bé đi lạc: rau trong giỏ đặt làm bát mồi miễn phí.',
    'Hồ cá có sẵn '+GDC.fish.start+' chú. Cho cá ăn ('+GDC.fish.feed+' xu, no 6 giờ) thì cứ khoảng 3 giờ có thêm một chú, tối đa '+GDC.fish.max+'. Bán bớt được '+GDC.fish.sell+' xu một chú. Cá không bao giờ chết; trời rét dưới 0°C mặt hồ đóng băng và cá thôi đẻ. Mèo thích ngồi ngắm: +'+FURN.gpond.happy+' vui cho phòng.']})})();
// Admin: thử nhanh
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div'),its=gdItems();
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🌱 Vườn nhỏ</b><div class="dim">'+its.filter(i=>i.gd).length+' chậu, luống · '+its.filter(i=>i.fp).length+' hồ cá · giỏ '+gdN()+'</div>'+
    '<div class="row wrap">'+B('admGd(1)','🪴 Đặt chậu, luống, hồ ở phòng đang xem')+B('admGd(2)','⏩ Cây chín ngay')+B('admGd(3)','🏜 Đất khô kiệt')+B('admGd(4)','🧺 +5 mỗi loại rau')+B('admGd(5)','🐟 Cá đẻ ngay')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admGd(k){
  if(k===1){if(!gdRoomOk(cur)){admDone('Sang phòng ngoài trời hoặc Nhà kính trước',1);return}
    ['gpot','gbed','gpond'].forEach((id,j)=>{const it={iid:S.nid++,fid:id,room:cur,x:camX+VW/2-50+j*50,y:150,flip:false,broken:false};S.items.push(gdInit(it))});if(typeof wxDirty==='function')wxDirty();admDone('Đã đặt',1);return}
  if(k===2){gdItems().forEach(i=>{if(i.gd&&i.gd.c&&!i.gd.dead)i.gd.p=1});gardenTick(0,false);admDone('Cây đã chín',1);return}
  if(k===3){gdItems().forEach(i=>{if(i.gd)i.gd.wa=0});admDone('Đất khô kiệt',1);return}
  if(k===4){const B=gdBox().inv;GCROPS.forEach(c=>B[c.id]=(B[c.id]||0)+5);admDone('+5 mỗi loại',1);return}
  if(k===5){gdItems().forEach(i=>{if(i.fp&&i.fp.n<GDC.fish.max){i.fp.n++;i.fp.fed=now()+GDC.fish.fed*60000}});admDone('Cá đã đẻ',1)}
}
