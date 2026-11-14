/* ============ ĐỘ THÂN THIẾT: giao diện (luật ở js/bond.js) ============
   - Nhãn 💗 số tim trên thẻ mèo (bọc wxBadges).
   - Khung "Thân thiết" trong màn chi tiết mèo (bọc openCat): tim, tiến độ, điểm hôm nay, lợi ích, danh sách bé trùng loài để Kết thân.
   - Hộp phóng sinh: nhắc khi bé có bạn trùng loài (Kết thân thì có ích hơn nhận xu).
   - Thông báo khi lên tim; ước muốn thành sự thật cộng điểm (bọc wishDone).
   - Chương Sổ tay "Độ thân thiết" (file nạp ngay sau js/garden-ui.js, trước js/tut-wx.js), thành tựu, thẻ Admin.
   CSS: css/bond.css */
const bondHearts=(h,big)=>'<span class="bd-hearts'+(big?' big':'')+'" aria-label="'+h+' trên 5 tim">'+[1,2,3,4,5].map(i=>'<i class="'+(i<=h?'on':'')+'">'+(i<=h?'♥':'♡')+'</i>').join('')+'</span>';
function bondTip(c){
  const h=bondLv(c),pr=bondProg(c);
  return 'Thân thiết: '+BOND.names[h]+' ('+h+'/5 tim). '+(pr.max?'Đã đầy tim.':'Còn '+(pr.need-pr.cur)+' điểm nữa lên tim kế tiếp.')+(h?' Lợi ích: +'+Math.round(BOND.coin*h*100)+'% xu viễn chinh, +'+BOND.happy*h+' vui'+(BOND.pet[h]?', vuốt ve +'+BOND.pet[h]+' xu':'')+'.':'');
}
if(typeof wxBadges==='function'){const W0=wxBadges;wxBadges=function(c){const h=bondLv(c);
  return (h?'<span class="bd-tag" tabindex="0" data-tip="'+esc(bondTip(c))+'">💗'+h+'</span>':'')+W0.apply(this,arguments)}}

function bondSec(c){
  const h=bondLv(c),pr=bondProg(c),d=bondDay(),today=c.bd&&c.bd.d===d?c.bd.n:0;
  const ben=h?'<div class="bd-ben">Đang có: <b>+'+Math.round(BOND.coin*h*100)+'%</b> xu viễn chinh · <b>+'+BOND.happy*h+'</b> vui'+(BOND.pet[h]?' · vuốt ve <b>+'+BOND.pet[h]+'</b> xu':'')+'</div>'
    :'<div class="bd-ben dim">Lên 1 tim để bé được thêm xu viễn chinh và độ vui.</div>';
  const dups=bondDups(c);
  const dl=dups.length?'<div class="bd-dup"><div class="bd-h">🤝 Kết thân với bé trùng loài</div><div class="dim">Bé kia rời nhà (không nhận xu), '+esc(c.name)+' nhận điểm thân thiết.</div>'+
    dups.slice(0,8).map(o=>'<div class="bd-row">'+catTag(lk(o),1)+'<span class="g">'+esc(o.name)+' '+starsC(o)+(bondLv(o)?' '+bondHearts(bondLv(o)):'')+'</span><button class="sm go" onclick="askBond('+c.uid+','+o.uid+')">+'+(BOND.dup[o.star]||0)+' điểm</button></div>').join('')+
    (dups.length>8?'<div class="dim">… và '+(dups.length-8)+' bé khác</div>':'')+'</div>':'';
  return '<div class="cd-sec bd-sec"><h4>💗 Thân thiết</h4>'+
    '<div class="bd-top">'+bondHearts(h,1)+'<b>'+BOND.names[h]+'</b></div>'+
    (pr.max?'<div class="dim">Bé đã là tri kỷ của bạn ('+bondPts(c)+' điểm).</div>':'<div class="bd-bar"><i style="width:'+Math.round(pr.cur/pr.need*100)+'%"></i></div><div class="dim">'+pr.cur+'/'+pr.need+' điểm tới tim '+(h+1)+' · hôm nay +'+today+'/'+BOND.day+'</div>')+
    ben+'<div class="dim bd-how">Tăng điểm: vuốt ve, ăn món khoái khẩu, uống nước khoái khẩu, đi viễn chinh về, ước muốn thành sự thật; nhanh nhất là kết thân với bé trùng loài.</div>'+dl+'</div>';
}
{const O0=openCat;openCat=function(uid){
  O0.apply(this,arguments);
  try{
    const c=catBy(uid),mb=$('mbox');if(!c||!mb||!mb.querySelector('.cd-head')||mb.querySelector('.bd-sec'))return;
    const ref=mb.querySelector('.cp-sec')||(mb.querySelector('.cd-tags')&&mb.querySelector('.cd-tags').closest('.cd-sec'));
    if(!ref)return;ref.insertAdjacentHTML('afterend',emo(bondSec(c)));
  }catch(e){console.warn('bondSec',e)}
}}
function askBond(uid,uid2){
  const c=catBy(uid),o=catBy(uid2);if(!c||!o)return;
  const pts=BOND.dup[o.star]||0,h0=bondLv(c);let h1=h0;{const p=bondPts(c)+pts;for(let i=1;i<6;i++)if(p>=BOND.lv[i])h1=i}
  modal('<h3>Kết thân?</h3><div class="bd-ask"><span>'+catTag(lk(o),2)+'<br>'+esc(o.name)+' '+starsC(o)+'</span><b>→</b><span>'+catTag(lk(c),2)+'<br>'+esc(c.name)+' '+starsC(c)+'</span></div>'+
    '<div>'+esc(c.name)+' nhận <b>+'+pts+'</b> điểm thân thiết'+(h1>h0?' và lên <b>'+h1+' tim</b>':'')+'.</div>'+
    '<div class="dim">'+esc(o.name)+' sẽ rời nhà như phóng sinh nhưng không nhận xu. Bộ sưu tập vẫn ghi là đã từng sở hữu.'+(o.star>=4?' <b style="color:var(--bad)">Đây là bé hiếm '+o.star+'★.</b>':'')+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="go" onclick="doBond('+uid+','+uid2+')">🤝 Kết thân</button><button onclick="openCat('+uid+')">Thôi</button></div>');
}
function doBond(uid,uid2){
  const o=catBy(uid2);if(o&&o.room===cur&&typeof byeEnt==='function')byeEnt(o);
  const r=bondMerge(uid,uid2);if(r.err){toast(r.err,{type:'warn'});return}
  const c=catBy(uid);syncEnts();render();openCat(uid);
  toast(c.name+' +'+r.pts+' điểm thân thiết'+(r.h1>r.h0?' · lên '+r.h1+' tim':''),{icon:'💗',title:'Kết thân'});
}
onBondUp=(c,h)=>{if(TOFF)return;if(typeof toast==='function')toast(c.name+' đã lên '+h+' tim: '+BOND.names[h]+'. +'+Math.round(BOND.coin*h*100)+'% xu viễn chinh, +'+BOND.happy*h+' vui.',{icon:'💗',title:'Thân thiết hơn',key:'bondup'})};
if(typeof wishDone==='function'){const W0=wishDone;wishDone=function(){const c=typeof wishCat==='function'?wishCat():null;W0.apply(this,arguments);if(c)bondAdd(c,BOND.gain.wish)}}
// hộp phóng sinh: nhắc kết thân khi có bạn trùng loài
{const R0=askRelease;askRelease=function(uids,step){R0.apply(this,arguments);
  try{if(step===2||uids.length!==1)return;const c=catBy(uids[0]);if(!c)return;const best=S.cats.filter(o=>o!==c&&o.sp===c.sp).sort((a,b)=>bondPts(b)-bondPts(a))[0];if(!best)return;
    const mb=$('mbox'),row=mb&&mb.querySelector('.row');if(!row)return;
    row.insertAdjacentHTML('beforebegin','<div class="bd-hint">💡 '+esc(c.name)+' trùng loài với <b>'+esc(best.name)+'</b>. Kết thân thì '+esc(best.name)+' nhận <b>+'+(BOND.dup[c.star]||0)+'</b> điểm thân thiết thay cho xu. <button class="sm go" onclick="askBond('+best.uid+','+c.uid+')">🤝 Kết thân</button></div>');
  }catch(e){}}}

// Sổ tay
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='bond'))return;
  const i=P.findIndex(p=>p.id==='cats');P.splice(i<0?P.length:i+1,0,{id:'bond',ic:'💗',t:'Độ thân thiết và mèo trùng',p:[
    'Mỗi bé có độ thân thiết từ 0 tới 5 tim: '+BOND.names.map((n,h)=>h+' '+n).join(', ')+'. Cần '+BOND.lv.slice(1).join(', ')+' điểm cho tim 1 tới 5.',
    'Điểm tăng khi bạn chăm bé: vuốt ve +'+BOND.gain.pet+' (khi bé cho xu, 10 phút một lần), ăn món khoái khẩu +'+BOND.gain.fav+', uống nước khoái khẩu +'+BOND.gain.favw+', đi viễn chinh về +'+BOND.gain.trip+', ước muốn thành sự thật +'+BOND.gain.wish+'. Mỗi bé nhận tối đa '+BOND.day+' điểm mỗi ngày theo cách này.',
    'Mỗi tim cho bé thêm '+Math.round(BOND.coin*100)+'% xu viễn chinh và +'+BOND.happy+' độ vui; từ 2 tim vuốt ve cho thêm xu ('+BOND.pet.slice(1).map((v,h)=>(h+1)+' tim +'+v).join(', ')+').',
    'Mèo trùng: khi có hai bé cùng loài, mở màn thông tin của bé muốn giữ, mục Thân thiết › Kết thân với bé trùng loài. Bé kia rời nhà (không nhận xu), bé được giữ nhận điểm ngay, không tính giới hạn ngày: 1★ +'+BOND.dup[1]+', 2★ +'+BOND.dup[2]+', 3★ +'+BOND.dup[3]+', 4★ +'+BOND.dup[4]+', 5★ +'+BOND.dup[5]+' điểm.',
    'Hộp Phóng sinh cũng nhắc khi bé có bạn trùng loài. Phóng sinh cho xu ngay; kết thân cho bé còn lại mạnh hơn lâu dài.'
  ]});
})();
// thành tựu
if(typeof achSer==='function'&&typeof stv==='function'){
  achSer('care','bond',stv('bond'),n=>'Kết thân với bé trùng loài '+fN(n)+' lần.',[[1,0,'Kết bạn đầu tiên'],[10,1,'Mèo một nhà'],[50,2,'Đại gia đình']]);
  achSer('care','bond5',()=>S.cats.filter(c=>bondLv(c)>=5).length,n=>'Có '+fN(n)+' bé đạt 5 tim.',[[1,1,'Tri kỷ'],[5,2,'Năm người bạn thân'],[20,3,'Cả nhà là tri kỷ']]);
  achSer('care','bond3',()=>S.cats.filter(c=>bondLv(c)>=3).length,n=>'Có '+fN(n)+' bé từ 3 tim.',[[1,0,'Thân thiết'],[10,1,'Nhà ấm áp']]);
}
// Admin
if(typeof openAdmin==='function'){const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;
  const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement,B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>💗 Thân thiết</b><div class="row wrap">'+B('admBond(1)','+100 điểm mọi bé trong phòng')+B('admBond(2)','Tạo một bé trùng loài')+B('admBond(0)','Về 0 tim mọi bé')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admBond(k){
  const L=homeCats(cur);
  if(k===1)L.forEach(c=>bondAdd(c,100,1));
  else if(k===0)S.cats.forEach(c=>{c.bond=0;delete c.bd});
  else if(k===2){const c=(fol&&catBy(fol.uid))||L[0];if(!c)return;const n=newCat(SP[c.sp],c.star);n.room=freeRoom();S.cats.push(n);syncEnts()}
  save();render();toast('Đã chỉnh thân thiết',{icon:'💗'});
}
