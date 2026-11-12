"use strict";
/* ============ BÉ BỎ NHÀ ĐI: giao diện (2026-11-12) ============
   Luật ở js/stray.js. Nạp ngay sau js/tut-text.js (để thêm chương Sổ tay trước khi tut-wx.js bọc danh sách chương). CSS: css/stray.css.
   - Ô "🎒 N bé đi lạc" trên cùng (bấm mở bé đầu tiên). Nhãn 😾 Giận dỗi / 🎒 Đi lạc / 🔍 Đi tìm bạn trên thẻ mèo (bọc wxBadges).
   - Màn chi tiết bé đi lạc (bọc openCat): khung "Bé đã bỏ nhà đi" với lý do, thời gian, nhờ bạn đi tìm, đặt bát mồi, lúc bé tự về.
   - Báo lúc tải game nếu trong lúc vắng có bé bỏ đi hoặc đã về. Sổ tay thêm chương "Bé giận dỗi và bỏ nhà đi". Admin có thẻ thử. */
const fmtM=ms=>{const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h?h+' giờ'+(m%60?' '+m%60+' phút':''):m+' phút'};
const strayHunter=uid=>S.stray?Object.entries(S.stray).find(([k,s])=>s.hunt&&s.hunt.by===uid):null;
// nhãn trên thẻ mèo
function strayTag(c,full){
  const s=strayOf(c.uid);
  if(s)return '<span class="tag stg st-go" tabindex="0" data-tip="Bỏ nhà đi vì '+esc(s.why.join(', '))+'. Bấm vào bé để nhờ bạn đi tìm hoặc đặt bát mồi.">🎒'+(full?' Đi lạc':'')+'</span> ';
  const h=strayHunter(c.uid);
  if(h){const o=catBy(+h[0]);return '<span class="tag stg st-hunt" tabindex="0" data-tip="Đang đi tìm '+esc(o?o.name:'bạn')+', về sau '+fmtM(h[1].hunt.end-now())+'.">🔍'+(full?' Đi tìm bạn':'')+'</span> '}
  if(strayOpen()&&strayMood(c))return '<span class="tag stg st-sulk" tabindex="0" data-tip="Giận dỗi vì '+esc(strayWhy(c).join(', ')||'bị bỏ bê')+'. Chăm bé ngay (cho ăn, đổ nước, vuốt ve), không thì bé sẽ bỏ nhà đi.">😾'+(full?' Giận dỗi':'')+'</span> ';
  return '';
}
if(typeof wxBadges==='function'){const W0=wxBadges;wxBadges=function(c,full){return strayTag(c,full)+W0.apply(this,arguments)}}

// ô trên cùng
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);
  const L=strayList();if(!L.length)return;
  const el=document.createElement('div');el.className='chip tap stchip';el.setAttribute('onclick','openCat('+L[0].uid+')');el.setAttribute('role','button');el.setAttribute('aria-label',L.length+' bé bỏ nhà đi');
  el.setAttribute('data-tip',L.map(c=>c.name).join(', ')+' đã bỏ nhà đi. Bấm để tìm bé về.');el.innerHTML='🎒 <b>'+L.length+'</b>';const top=$('top'),xp=top.querySelector('.xp');top.insertBefore(el,xp||null);
}}

// khung trong màn chi tiết bé đi lạc
function straySec(c){
  const s=strayOf(c.uid),t=now(),R=ROOM[s.room]||ROOM.living;
  const bar=(a,b)=>'<div class="bar"><i style="width:'+Math.round(clamp((t-a)/(b-a),0,1)*100)+'%;background:#e8b83a"></i></div>';
  const helpers=S.cats.filter(o=>o!==c&&!onTrip(o.uid)).sort((a,b)=>b.en-a.en);
  const ok=o=>o.full>=STRAY.hunt.full&&o.en>=STRAY.hunt.en;
  const hunt=s.hunt?(()=>{const by=catBy(s.hunt.by);return '<div class="st-row"><b>🔍 '+esc(by?by.name:'Một bé')+' đang đi tìm</b> · còn '+fmtM(s.hunt.end-t)+bar(s.hunt.end-STRAY.hunt.min*60000,s.hunt.end)+'</div>'})():
    '<div class="st-row"><b>🔍 Nhờ một bé ở nhà đi tìm</b> <small>· '+STRAY.hunt.min+' phút, bé đi tìm tốn '+STRAY.hunt.en+'⚡</small>'+
      (helpers.length?'<div class="st-pick">'+helpers.slice(0,8).map(o=>'<button class="sm'+(ok(o)?'':' st-no')+'" onclick="doStrayHunt('+c.uid+','+o.uid+')"'+(ok(o)?'':' data-tip="'+(o.full<STRAY.hunt.full?'Đang đói':'Không đủ sức')+'"')+'>'+esc(o.name)+' <small>⚡'+Math.round(o.en)+'</small></button>').join('')+'</div>':'<div class="dim">Không có bé nào ở nhà để đi tìm.</div>')+'</div>';
  const fv=favs(c),foods=FOODS.filter(f=>f.full>0).sort((a,b)=>(fv.includes(b.id)?1:0)-(fv.includes(a.id)?1:0)||a.price-b.price);
  const lure=s.lure?'<div class="st-row"><b>🍲 Bát '+FOOD[s.lure.food].n.toLowerCase()+' đang chờ ở '+R.n+'</b> · bé về sau '+fmtM(s.lure.end-t)+'</div>':
    '<div class="st-row"><b>🍲 Đặt bát mồi ở '+R.n+'</b> <small>· món khoái khẩu ❤️ '+STRAY.lure.fav+' phút, món khác '+STRAY.lure.other+' phút</small><div class="st-pick">'+
      foods.slice(0,5).map(f=>{const cost=f.price*STRAY.lure.mult;return '<button class="sm" '+(S.coins<cost?'disabled ':'')+'onclick="doStrayLure('+c.uid+',\''+f.id+'\')">'+(fv.includes(f.id)?'❤️ ':'')+f.ic+' '+f.n+' <small>'+cost+' xu</small></button>'}).join('')+'</div></div>';
  return '<div class="cd-sec st-box"><h4>🎒 '+esc(c.name)+' đã bỏ nhà đi</h4>'+
    '<div class="st-why">Vì <b>'+esc(s.why.join(', '))+'</b> · đi được '+fmtM(t-s.at)+' · <b>bé vẫn an toàn</b>, không bao giờ mất hẳn.</div>'+
    hunt+lure+'<div class="dim st-self">🏠 Không làm gì thì bé tự về sau '+fmtM(s.at+STRAY.back-t)+'.</div></div>';
}
{const O0=openCat;openCat=function(uid){O0.apply(this,arguments);const c=catBy(uid),mb=$('mbox');if(!c||!mb)return;
  const s=strayOf(uid),h=strayHunter(uid);
  if(s||h)mb.querySelectorAll('.cd-grid div').forEach(d=>{if(d.textContent==='Đang đi viễn chinh')d.textContent=s?'🎒 Bỏ nhà đi, đang lang thang':'🔍 Đang đi tìm '+((catBy(+h[0])||{}).name||'bạn')});
  if(!s)return;
  const d=document.createElement('div');d.innerHTML=emo(straySec(c));const el=d.firstElementChild;
  const ref=mb.querySelector('.cd-sec');if(ref)ref.parentElement.insertBefore(el,ref);else mb.appendChild(el);
}}
function doStrayHunt(uid,uid2){const e=strayHunt(uid,uid2);if(e){toast(e,{type:'warn'});return}const o=catBy(uid2),c=catBy(uid);
  toast(o.name+' đã đi tìm '+c.name+'. Khoảng '+STRAY.hunt.min+' phút nữa hai bé về.',{icon:'🔍',title:'Đi tìm bạn',key:'hunt'});if(typeof syncEnts==='function')syncEnts();render();openCat(uid)}
function doStrayLure(uid,food){const r=strayLure(uid,food);if(r.err){toast(r.err,{type:'warn'});return}const c=catBy(uid);
  toast('Đã đặt bát '+FOOD[food].n.toLowerCase()+' (−'+r.cost+' xu). '+c.name+' sẽ ngửi thấy và về sau khoảng '+r.min+' phút.',{icon:'🍲',title:'Bát mồi',key:'lure'});render();openCat(uid)}

// bé về hoặc bỏ đi khi đang mở game: cập nhật mèo trong phòng
{const L0=strayLeave,H0=strayHome;
  strayLeave=function(){L0.apply(this,arguments);if(!TOFF&&typeof syncEnts==='function'){syncEnts();render()}};
  strayHome=function(){H0.apply(this,arguments);if(!TOFF&&typeof syncEnts==='function'){syncEnts();render()}};}

// lúc tải game: báo chuyện xảy ra trong lúc vắng
setTimeout(()=>{if(!S||!S.stray)return;let n=0;
  strayList().forEach(c=>{const s=S.stray[c.uid];if(!s.seen){s.seen=1;n++;toast(c.name+' đã bỏ nhà đi trong lúc bạn vắng vì '+s.why.join(', ')+'. Bấm ô 🎒 trên cùng để tìm bé về.',{icon:'🎒',title:'Bỏ nhà đi',key:'strayld'+c.uid,ms:10000})}});
  (S.strayBack||[]).forEach(b=>{if(!b.seen){b.seen=1;n++;toast(b.msg,{icon:'🏠',title:'Bé đã về nhà',key:'backld'+b.uid,ms:9000})}});
  if(n)save()},2500);

// Sổ tay
// file này nạp ngay sau js/tut-text.js, trước tut-wx.js, tut-med.js (hai file đó bọc danh sách chương bằng getter lọc theo cấp)
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='stray'))return;
  const i=P.findIndex(p=>p.id==='health');P.splice(i<0?P.length:i+1,0,{id:'stray',ic:'🎒',t:'Bé giận dỗi và bỏ nhà đi',p:[
    'Mèo không bao giờ chết hay mất hẳn. Nhưng nếu bị bỏ bê lâu (từ cấp '+STRAY.lv+'), bé sẽ giận rồi bỏ nhà đi lang thang một thời gian.',
    'Bé khổ khi đói (no dưới 5%), khát, buồn (vui dưới 25) hoặc yếu (sức khỏe dưới 30). Có từ hai điều khổ cùng lúc thì bé tích giận; ba điều thì giận nhanh gấp đôi; lúc bạn vắng thì giận chậm bằng một nửa. Được chăm tử tế thì bé nguôi dần.',
    'Khoảng 2,5 giờ vừa đói vừa buồn (hoặc một đêm bạn vắng mà bát trống), bé hiện nhãn 😾 Giận dỗi và game báo trước. Bị bỏ bê tổng cộng khoảng 6 giờ (hai đêm vắng liền mà bát trống) thì bé bỏ nhà đi. Nhà luôn còn ít nhất một bé, và mỗi lần chỉ một bé bỏ đi.',
    'Bé đi lạc không ở trong phòng, không đi viễn chinh được, chỉ số đứng yên. Ô 🎒 trên cùng cho biết có bao nhiêu bé đi lạc.',
    'Đưa bé về: nhờ một bé khác ở nhà đi tìm ('+STRAY.hunt.min+' phút, tốn '+STRAY.hunt.en+' năng lượng, bé đi tìm phải không đói), hoặc đặt bát mồi (giá gấp '+STRAY.lure.mult+' giá món; món khoái khẩu về sau '+STRAY.lure.fav+' phút, món khác '+STRAY.lure.other+' phút). Không làm gì thì bé tự về sau 2 ngày.',
    'Về nhà bé được ăn uống tạm và vui lại một nửa. Nhớ cho bé ăn, đổ nước để bé không giận lần nữa.']})})();

// Admin: thử nhanh
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🎒 Bé bỏ nhà đi</b><div class="dim">'+strayList().length+' bé đi lạc · '+S.cats.filter(c=>strayMood(c)).length+' bé giận dỗi</div>'+
    '<div class="row wrap">'+B('admStray(1)','😾 Một bé giận dỗi')+B('admStray(2)','🎒 Một bé bỏ đi ngay')+B('admStray(3)','⏩ Tua: mọi chuyến tìm, bát mồi xong')+B('admStray(0)','🏠 Gọi mọi bé về')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admStray(k){
  const home=S.cats.filter(c=>!onTrip(c.uid));
  if(k===1&&home[0]){home[0].ng=STRAY.warn;admDone(home[0].name+' đang giận dỗi',1);return}
  if(k===2){if(home.length<2){admDone('Cần ít nhất 2 bé ở nhà',1);return}strayLeave(home[home.length-1]);admDone(home[home.length-1].name+' đã bỏ nhà đi',1);return}
  if(k===3){for(const u in S.stray){const s=S.stray[u];if(s.hunt)s.hunt.end=now();if(s.lure)s.lure.end=now()}strayTick(0,false);admDone('Đã tua',1);return}
  strayList().forEach(c=>strayHome(c,'self'));admDone('Mọi bé đã về',1);
}
