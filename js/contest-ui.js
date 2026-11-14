"use strict";
/* ============ CUỘC THI MÈO HẰNG NGÀY: giao diện (2026-11-14) ============
   Luật ở js/contest.js. Nạp sau js/roomup-ui.js, trước js/tutorial.js và js/tut-wx.js (chương Sổ tay). CSS: css/contest.css.
   - Tab 🏆 Thành tựu: thẻ cuộc thi hôm nay đứng ngay sau dòng tổng thành tựu (bọc PANEL.ach). ❗ trên tab khi có kết quả chưa nhận (bọc renderTop).
   - Bảng openContest(): chủ đề, giờ chốt, chọn bé (✨ Chọn giúp), gửi bài; sau giờ chốt: bảng xếp hạng với các nhà khác, Nhận thưởng; lịch sử.
   - Huy chương của bé: nhãn 🥇🥈🥉 trên thẻ mèo (bọc wxBadges) và dòng trong màn chi tiết (bọc openCat).
   - Sổ tay: chương "Cuộc thi mèo hằng ngày". Mẹo lần đầu (contest) ở tab Thành tựu. Admin: thẻ "🏅 Cuộc thi mèo". */
const CTP={sel:[],pick:false};
const ctLeft=()=>{const ms=ctCloseAt(ctS().d)-now();const m=Math.max(1,Math.ceil(ms/60000)),h=Math.floor(m/60);return h?h+' giờ'+(m%60?' '+m%60+' phút':''):m+' phút'};
const ctReady=()=>ctOpen()&&!!S.ct&&!!S.ct.e&&!(S.ct.r&&S.ct.r.got)&&ctClosed();
const ctMed=m=>CT_MEDAL[m].ic+' '+CT_MEDAL[m].n;
const ctFace=(c,sz)=>typeof faceTag==='function'?faceTag(lk(c),{sz:sz||'s'}):catTag(lk(c),2);
// báo kết quả tự nhận lúc sang ngày
function ctSyncUI(){const g=ctSync();if(g&&!g.err&&typeof toast==='function')toast('Cuộc thi "'+CT_T[g.th].n+'" hôm qua: '+ctMed(g.m)+' (hạng '+g.rank+'). Đã tự nhận '+g.coins+' xu'+(g.tickets?' và '+g.tickets+' vé':'')+'.',{icon:'🏅',title:'Cuộc thi mèo',key:'ctauto',ms:9000})}

// thẻ ở tab Thành tựu
function ctCard(){
  if(!S||!S.tut||!S.tut.done)return '';
  if(!ctOpen())return '<div class="ct-card ct-lock">🔒 <b>Cuộc thi mèo hằng ngày</b> mở ở cấp '+CT.lv+'.</div>';
  ctSyncUI();const c=ctS(),T=CT_T[c.th],cl=ctClosed(),e=c.e;
  let st;
  if(!cl)st=e?'Đã gửi '+e.nm.map(esc).join(', ')+' · <b>'+String(e.b).replace('.',',')+' điểm</b> · chốt sau '+ctLeft():'Nhận bài tới '+CT.close+' giờ (còn '+ctLeft()+')';
  else if(!e)st='Hôm nay đã chốt. Cuộc thi mới mở lúc 0 giờ.';
  else if(c.r&&c.r.got)st='Kết quả: <b>'+ctMed(c.r.m)+'</b> · hạng '+c.r.rank+' · '+String(c.r.sc).replace('.',',')+' điểm';
  else st='<b>Đã có kết quả!</b> Bấm để xem hạng và nhận thưởng.';
  const btn=cl?(e&&!(c.r&&c.r.got)?'🎁 Xem kết quả':'Xem'):e?'Đổi bài':'Chọn bé dự thi';
  return '<div class="ct-card'+(ctReady()?' ready':'')+'" onclick="openContest()" role="button" tabindex="0"><div class="ct-ic">'+T.ic+'</div><div class="g"><small class="dim">🏅 Cuộc thi hôm nay'+(T.team>1?' · đội '+T.team+' bé':'')+'</small><br><b>'+esc(T.n)+'</b><br><small>'+st+'</small></div>'+
    '<button class="sm go ct-go" onclick="event.stopPropagation();openContest()">'+btn+'</button></div>';
}
{const A0=PANEL.ach;PANEL.ach=function(){const h=A0.apply(this,arguments),k=ctCard();if(!k)return h;const i=h.indexOf('</div>');return i<0?k+h:h.slice(0,i+6)+k+h.slice(i+6)}}
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);if(!ctReady())return;const b=document.querySelector('#tabs button[onclick="setTab(\'ach\')"]');if(b&&!b.dataset.ct){b.dataset.ct=1;b.insertAdjacentHTML('beforeend',' ❗');emoEl(b)}}}

// bảng cuộc thi
function openContest(pick){
  if(!ctOpen()){toast('Cuộc thi mèo mở ở cấp '+CT.lv+'.',{type:'warn'});return}
  ctSyncUI();const c=ctS(),T=CT_T[c.th],cl=ctClosed(),e=c.e;
  if(pick!=null)CTP.pick=pick;if(cl)CTP.pick=false;
  if(!e&&!cl)CTP.pick=true;
  const head='<h3>'+T.ic+' '+esc(T.n)+'</h3><div class="ct-d">'+esc(T.d)+' <span class="dim">'+esc(T.tip)+'</span></div>'+
    '<div class="ct-time">'+(cl?'⏰ Đã chốt bài lúc '+CT.close+' giờ.':'⏰ Nhận bài tới <b>'+CT.close+' giờ</b> hôm nay (còn '+ctLeft()+'). Điểm tính lúc gửi; sau giờ chốt cộng may rủi ±'+Math.round(CT.luck*100)+'% rồi so với '+CT.rivals+' nhà khác.')+'</div>';
  let body='';
  if(cl&&e){
    const R=ctResult(c.d,c.th,e),got=c.r&&c.r.got,w=ctRew(R.m);
    body='<div class="ct-res m-'+R.m+'"><div class="ct-medal">'+CT_MEDAL[R.m].ic+'</div><div><b>'+CT_MEDAL[R.m].n+'</b> · hạng '+R.rank+'/'+(CT.rivals+1)+'<br><small>Điểm lúc gửi '+String(e.b).replace('.',',')+' × may rủi '+String(R.luck).replace('.',',')+' = <b>'+String(R.sc).replace('.',',')+'</b></small></div></div>'+
      '<ol class="ct-board">'+R.board.map((x,i)=>'<li class="'+(x.me?'me':'')+'"><span class="rk">'+(i<3?CT_MEDAL['gsb'[i]].ic:i+1)+'</span><span class="nm">'+(x.me?'🏠 Nhà bạn: '+e.nm.map(esc).join(', '):esc(x.nm))+'</span><b>'+String(x.sc).replace('.',',')+'</b></li>').join('')+'</ol>'+
      (got?'<div class="ct-got">✅ Đã nhận '+c.r.coins+' xu'+(c.r.tickets?' và '+c.r.tickets+' vé':'')+'.</div>':'<button class="go ct-claim" onclick="doCtClaim()">🎁 Nhận thưởng: '+w.coins+' xu'+(w.tickets?' + '+w.tickets+' vé':'')+'</button>');
  }else if(cl)body='<div class="ct-none">Hôm nay bạn không gửi bé dự thi. Ngày mai nhớ ghé tab Thành tựu nhé!</div>';
  else if(!CTP.pick&&e){
    body='<div class="ct-entry"><div class="ct-faces">'+e.u.map(u=>{const x=catBy(u);return x?'<div class="ct-f">'+ctFace(x,'m')+'<small>'+esc(x.name)+'</small></div>':''}).join('')+'</div>'+
      '<div>Bài đã gửi: <b>'+String(e.b).replace('.',',')+' điểm</b></div></div>'+
      '<div class="row wrap ct-act"><button class="sm" onclick="CTP.sel=[];openContest(true)">✎ Đổi bài</button><button class="sm" onclick="ctWithdraw();render();openContest(true)">Rút bài</button></div>';
  }else body=ctPicker(c.th);
  const tally=['g','s','b','k'].map(m=>CT_MEDAL[m].ic+' '+(c.n[m]||0)).join(' · ');
  const hist=c.h.length?'<details class="ct-hist"><summary>📜 Các ngày trước · '+tally+'</summary>'+c.h.slice(0,7).map(h=>'<div class="ct-hr">'+CT_MEDAL[h.m].ic+' <b>'+esc(CT_T[h.th]?CT_T[h.th].n:h.th)+'</b> <small class="dim">'+h.d.split('-').reverse().slice(0,2).join('/')+' · '+h.nm.map(esc).join(', ')+' · '+String(h.sc).replace('.',',')+' điểm · +'+h.coins+' xu'+(h.tickets?' +'+h.tickets+' vé':'')+'</small></div>').join('')+'</details>':'';
  modal('<div class="ct">'+head+body+hist+'</div>');
}
// danh sách chọn bé
function ctPicker(th){
  const T=CT_T[th],P=ctPool().map(c=>({c,s:ctCatSc(th,c)})).sort((a,b)=>b.s-a.s);
  CTP.sel=CTP.sel.filter(u=>P.some(x=>x.c.uid===u)).slice(0,T.team);
  const L=CTP.sel.map(catBy),sc=L.length?ctScore(th,L):0,full=L.length===T.team;
  if(P.length<T.team)return '<div class="ct-none">Chủ đề này cần '+T.team+' bé đang ở nhà. Hiện chỉ có '+P.length+' bé ở nhà.</div>';
  const ext=th==='coat'?c=>' · '+esc(ctCoatN(ctCoat(c))):th==='room'?c=>' · '+esc((ROOM[c.room]||{}).n||''):()=>'';
  return '<div class="ct-pk"><div class="ct-sum">Đã chọn <b>'+L.length+'/'+T.team+'</b>'+(L.length?' · điểm dự kiến <b>'+String(sc).replace('.',',')+'</b>':'')+'</div>'+
    '<div class="row wrap ct-act"><button class="sm" onclick="CTP.sel=ctBest(\''+th+'\').map(c=>c.uid);openContest(true)">✨ Chọn giúp</button>'+
    '<button class="go ct-send" '+(full?'':'disabled ')+'onclick="doCtEnter()">📨 Gửi bài'+(full?' · '+String(sc).replace('.',',')+' điểm':'')+'</button>'+
    (S.ct.e?'<button class="sm" onclick="CTP.sel=[];openContest(false)">Giữ bài cũ</button>':'')+'</div>'+
    '<div class="ct-list">'+P.slice(0,40).map(({c,s})=>{const on=CTP.sel.includes(c.uid);return '<button class="ct-c'+(on?' on':'')+'" onclick="ctTog('+c.uid+')" aria-pressed="'+on+'">'+ctFace(c)+'<span class="g"><b>'+esc(c.name)+'</b> <small>'+c.star+'★'+ext(c)+'</small><br><small class="dim">'+s.toFixed(1).replace('.',',')+' điểm</small></span>'+(on?'<i>✓</i>':'')+'</button>'}).join('')+'</div>'+
    (P.length>40?'<div class="dim">… và '+(P.length-40)+' bé điểm thấp hơn.</div>':'')+'</div>';
}
function ctTog(uid){const T=CT_T[ctS().th],i=CTP.sel.indexOf(uid);if(i>=0)CTP.sel.splice(i,1);else{if(CTP.sel.length>=T.team)CTP.sel.shift();CTP.sel.push(uid)}const y=$('mbox').scrollTop;openContest(true);$('mbox').scrollTop=y}
function doCtEnter(){const r=ctEnter(CTP.sel);if(r.err){toast(r.err,{type:'warn'});return}CTP.sel=[];CTP.pick=false;
  toast('Đã gửi bài: '+String(r.sc).replace('.',',')+' điểm. Kết quả có lúc '+CT.close+' giờ.',{icon:'📨',title:'Cuộc thi mèo',key:'ctin'});render();openContest(false)}
function doCtClaim(){const r=ctClaim();if(r.err){toast(r.err,{type:'warn'});return}
  toast(ctMed(r.m)+' · hạng '+r.rank+'! +'+r.coins+' xu'+(r.tickets?' +'+r.tickets+' vé':'')+'.',{icon:'🏅',title:'Cuộc thi mèo',coins:r.coins,key:'ctok'});
  const b=document.querySelector('#tabs button[onclick="setTab(\'ach\')"]');if(b)delete b.dataset.ct;render();openContest()}

// huy chương trên thẻ mèo và màn chi tiết
const ctTag=c=>{const B=ctBadges(c.uid);return B.length?'<span class="tag ct-tag" tabindex="0" data-tip="Huy chương cuộc thi mèo: '+B.map(b=>b.n+' '+CT_MEDAL[b.m].n).join(', ')+'.">'+B.map(b=>CT_MEDAL[b.m].ic+(b.n>1?b.n:'')).join('')+'</span> ':''};
if(typeof wxBadges==='function'){const W0=wxBadges;wxBadges=function(c){return ctTag(c)+W0.apply(this,arguments)}}
{const O0=openCat;openCat=function(uid){O0.apply(this,arguments);const c=catBy(uid),mb=$('mbox'),B=c&&ctBadges(uid);if(!B||!B.length||!mb)return;
  const d=document.createElement('div');d.innerHTML=emo('<div class="cd-sec ct-cd"><h4>🏅 Huy chương cuộc thi</h4>'+B.map(b=>CT_MEDAL[b.m].ic+' '+CT_MEDAL[b.m].n+' × '+b.n).join(' · ')+'</div>');
  const ref=mb.querySelector('.cd-tags'),sec=ref&&ref.closest('.cd-sec');if(sec&&sec.parentElement)sec.after(d.firstElementChild);else mb.appendChild(d.firstElementChild)}}

// sang ngày lúc đang mở game; giờ chốt thì vẽ lại ❗
setInterval(()=>{if(!S||!ctOpen())return;const d=S.ct&&S.ct.d;ctSyncUI();if((S.ct&&S.ct.d)!==d||ctReady())renderTop()},20000);

// Sổ tay (nạp trước tut-wx.js)
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='contest'))return;
  let i=P.findIndex(p=>p.id==='roomup');if(i<0)i=P.findIndex(p=>p.id==='garden');const R=m=>CT.rew[m];
  P.splice(i<0?P.length:i+1,0,{id:'contest',ic:'🏅',t:'Cuộc thi mèo hằng ngày',p:[
    'Từ cấp '+CT.lv+', mỗi ngày có một cuộc thi mèo với một chủ đề (mọi người chơi cùng chủ đề). Xem ở đầu tab 🏆 Thành tựu.',
    'Chủ đề: '+CT_TH.map(t=>t.ic+' '+t.n).join(', ')+'. Chủ đề đội cần gửi 3 bé, còn lại 1 bé. Bấm ✨ Chọn giúp để game chọn đội điểm cao nhất.',
    'Gửi bài trước '+CT.close+' giờ. Điểm tính ngay lúc gửi từ chỉ số và thuộc tính của bé (độ vui, no, sức khỏe, tuổi, màu lông, phòng…), nên chăm bé thật tốt rồi hãy gửi. Gửi lại thì thay bài cũ.',
    'Sau '+CT.close+' giờ: điểm cộng may rủi nhỏ (±'+Math.round(CT.luck*100)+'%) rồi so với '+CT.rivals+' nhà khác. Hạng 1 🥇 Vàng ('+R('g').c(18)+' xu + 1 vé ở cấp 18), hạng 2 🥈 Bạc, hạng 3 🥉 Đồng, còn lại 🎗 Khuyến khích. Quên nhận thì sang ngày game tự nhận giúp.',
    'Bé đoạt Vàng, Bạc, Đồng được ghi huy chương: nhãn 🥇🥈🥉 trên thẻ mèo và trong màn chi tiết.']})})();

// mẹo lần đầu
if(typeof TUT_TEXT!=='undefined'&&TUT_TEXT.hints)TUT_TEXT.hints.contest=[
  'Mỗi ngày có một cuộc thi mèo với chủ đề mới! Chọn bé hợp chủ đề và gửi bài trước '+CT.close+' giờ.',
  'Sau giờ chốt bạn được xếp hạng với các nhà khác: Vàng, Bạc, Đồng đều có xu, Vàng thêm 1 vé.'];
setInterval(()=>{
  if(typeof TUT==='undefined'||!S||!S.tut||!S.tut.done||S.tut.fl||(S.tut.hints&&S.tut.hints.all)||TUT.seen('contest'))return;
  if(document.querySelector('.tut-tip.on')||TUT.active()||TUT.replaying()||document.hidden||$('modal').style.display==='flex'||$('gz').className)return;
  if(!ctOpen()||tab!=='ach')return;const el=document.querySelector('#panel .ct-card');if(!el||!el.getClientRects().length)return;
  TUT.hint('contest',{target:()=>tab==='ach'?document.querySelector('#panel .ct-card'):null});
},1500);

// Admin
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div'),c=ctS();
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🏅 Cuộc thi mèo</b><div class="dim">Hôm nay: '+esc(CT_T[c.th].n)+' · '+(c.e?'đã gửi '+c.e.b+' điểm':'chưa gửi')+' · '+(ctClosed()?'đã chốt':'chưa chốt')+'</div>'+
    '<div class="row wrap">'+B('admCt(1)','🔄 Đổi chủ đề')+B('admCt(2)','✨ Gửi đội tốt nhất')+B('admCt(3)','⏰ Chốt ngay')+B('admCt(4)','📅 Sang ngày mới')+B('admCt(0)','🗑 Xóa dữ liệu cuộc thi')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admCt(k){const c=ctS();
  if(k===1){const i=(CT_TH.findIndex(t=>t.id===c.th)+1)%CT_TH.length;c.ov={d:c.d,th:CT_TH[i].id};c.th=c.ov.th;delete c.e;delete c.r;admDone('Chủ đề: '+CT_TH[i].n,1);return}
  if(k===2){if(ctClosed()&&c.ov)delete c.ov.cl;const r=ctEnter(ctBest(c.th).map(x=>x.uid));admDone(r.err||'Đã gửi '+r.sc+' điểm',1);return}
  if(k===3){c.ov=Object.assign(c.ov&&c.ov.d===c.d?c.ov:{d:c.d,th:c.th},{cl:1});admDone('Đã chốt hôm nay',1);return}
  if(k===4){c.d='2000-1-1';ctSyncUI();admDone('Đã sang ngày mới',1);return}
  delete S.ct;ctS();admDone('Đã xóa dữ liệu cuộc thi',1);
}
