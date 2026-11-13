"use strict";
/* ============ GỢI Ý TƯƠNG THÍCH Ở TAB PHÒNG VÀ NÚT "XẾP GỢI Ý" (2026-11-13) ============
   Nạp sau js/unlock.js (tức sau js/ui.js, js/face.js, js/water-ui.js, js/meal-ui.js). Luật ở js/compat.js (CP), chữ chung ở CP_TEXT.ui; file này chỉ vẽ.
   Bọc PANEL.home (không thêm gì khi đang ở chế độ sắp xếp đồ):
     .cp-room   dòng "Mèo hợp với phòng này" ngay sau khối .feedbar: icon mặt các bé đang có mà hợp phòng (bấm bé ở phòng khác là đặt nhanh vào phòng đang xem),
                rồi các loài chưa có mà hợp (mờ; chưa từng gặp thì bóng đen), cuối dòng là nút .cp-arr "Xếp gợi ý"
     .cp-warn   mỗi bé đang ở phòng không hợp (hoặc có phòng hợp hơn hẳn) một dòng cảnh báo kèm nút chuyển phòng; thẻ của bé đó bên dưới có thêm một dấu nhỏ
   Tên lớp cp-room, cp-warn, cp-arr là hợp đồng với hướng dẫn tân thủ (js/tut-more.js), đừng đổi.
   Hàm toàn cục: cpPut(uid, rid) chuyển một bé; openArrange() mở bản XEM TRƯỚC của CP.plan(), chỉ áp dụng khi bấm "Áp dụng".
   Tab Phòng vẽ lại mỗi giây nên kết quả được giữ đệm theo cprKey() (phòng đang xem, bé nào ở phòng nào, đồ đang đặt...) và HTML không chứa số đổi theo thời gian. */
// chữ của file này (hằng CPR_TX) nằm ở js/compat-data.js
const CPR={k:null,h:'',mk:{},wopen:{},plan:null,spMax:12,RI:null};

const cprFt=(s,o)=>CP.ft(s,o);
// ui.js hiện lại tooltip của nút vừa bấm (trình xử lý click ở document, chạy sau onclick), nên phải ẩn thêm một lần sau cú bấm, kẻo tooltip nằm đè lên hộp thoại vừa mở
const cprHide=()=>{hideTip();setTimeout(hideTip,0)};
function cprCat(uid){cprHide();openCat(uid)}
function cprSp(id){cprHide();openBreed(id)}
const cprAway=c=>S.stray&&S.stray[c.uid]?CPR_TX.stray:typeof strayAway==='function'&&strayAway(c.uid)?CPR_TX.hunt:awayTxt(c);
// số icon tối đa trên một hàng: màn hẹp thì ít hơn để dòng không xuống hàng
const cprMax=()=>innerWidth>=1000?6:innerWidth>=780?5:4;
const cprSign=v=>{const n=Math.round(v);return (n>0?'+':n<0?'−':'')+Math.abs(n)};
const cprUnkTip=r=>CP_TEXT.ui.notSeen+' · '+cprFt(CPR_TX.unk,{s:SP[r.id].r,l:CP.label(r.lv)});
function cprUnk(id){const r=CP.spRoom(id,cur,{live:1});cprHide();toast(cprUnkTip(Object.assign(r,{id})),{type:'info',icon:'🔒'})}

/* ---------- khóa trạng thái: rẻ, tính mỗi giây; đổi thì mới tính lại gợi ý ---------- */
function cprKey(){
  if(!CPR.RI){CPR.RI={};ROOMS.forEach((r,i)=>CPR.RI[r.id]=i+1);CPR.RI.wait=99}
  let k=cur+'|'+S.level+'|'+cprMax()+'|'+DPR()+'|'+(FACE_OPEN['cpr-'+cur]?1:0)+(CPR.wopen[cur]?1:0)+'|'+Object.keys(S.rooms).length+'|'+Object.keys(S.seen||{}).length+'|',h=7;
  for(const i of S.items)if(i.room&&!i.broken)h=(h*33+i.iid*17+(CPR.RI[i.room]||0))>>>0;
  k+=h+'|';
  for(const c of S.cats)k+=c.uid+':'+c.room+(onTrip(c.uid)?'a':'')+c.traits.length+c.name+';';
  return k;
}

/* ---------- dòng A: mèo hợp với phòng này ---------- */
function cprFit(){
  const T=CP_TEXT.ui,R=ROOM[cur],full=catsIn(cur).length>=R.cap;
  const items=CP.fitCats(cur).map(r=>{const c=r.c;let tip=CP.tip(c.name,r)+'. ',on='cprCat('+c.uid+')';
    if(r.away)tip+=cprFt(CPR_TX.away,{r:ROOM[c.room]?ROOM[c.room].n:'',t:cprAway(c)});
    else if(r.here)tip+=T.roomHere.charAt(0).toUpperCase()+T.roomHere.slice(1);
    else{tip+=cprFt(CPR_TX.at,{r:ROOM[c.room].n})+'. '+(full?T.roomFull:T.roomPut);on='cpPut('+c.uid+',\''+cur+'\')'}
    return {key:lk(c),lv:r.lv,tip,on,here:r.here&&!r.away,tk:'rf'+c.uid}});
  const own=items.length;
  CP.fitSpecies(cur).slice(0,CPR.spMax).forEach((r,j)=>{const i=j||!own;items.push(r.seen?
    {key:r.id,lv:r.lv,dim:1,tip:CP.tip(SP[r.id].n,r)+'. '+T.notOwned,on:'cprSp(\''+r.id+'\')',tk:'rs'+r.id,cls:i?'':'cpr-s0'}:
    {key:r.id,lv:r.lv,dim:1,unk:1,tip:cprUnkTip(r),on:'cprUnk(\''+r.id+'\')',tk:'rs'+r.id,cls:i?'':'cpr-s0'})});
  const arr=ownedRooms().length>=2||catsIn('wait').length>0;
  return '<div class="cp-room cpr-fit"><b class="cpr-lb">'+T.roomFit+'</b>'+
    (items.length?faceRow(items,{id:'cpr-'+cur,max:cprMax()}):'<span class="dim cpr-none">'+T.roomFitNone+'</span>')+
    (arr?'<button type="button" class="cp-arr cpr-arr sm" data-tip="'+esc(CPR_TX.arrangeTip)+'" onclick="openArrange()">'+T.arrange+'</button>':'')+'</div>';
}

/* ---------- dòng B: bé đang ở phòng không hợp; kèm dấu cho thẻ của bé đó ---------- */
function cprWarn(){
  const T=CP_TEXT.ui,R=ROOM[cur],L=[];CPR.mk={};
  catsIn(cur).forEach(c=>{if(onTrip(c.uid))return;const m=CP.misfit(c);if(m)L.push({c,m})});
  if(!L.length)return '';
  L.sort((a,b)=>(a.m.kind==='bad'?0:1)-(b.m.kind==='bad'?0:1)||b.m.gain-a.m.gain);
  const rows=L.map(x=>{
    const c=x.c,m=x.m,bad=m.kind==='bad',b=m.best;
    // lý do: phòng không hợp thì nêu điều xấu nhất của phòng đang ở; có phòng hợp hơn thì nêu điều tốt nhất của phòng đó
    const why=bad?m.cur.why.slice().sort((p,q)=>p.s-q.s)[0]:b.why.slice().sort((p,q)=>q.s-p.s)[0];
    const head=bad?cprFt(T.misfit,{c:c.name,r:R.n}):cprFt(T.better,{c:c.name,r:b.n}),wt=why?why.t:'';
    const tip=head+(wt?'. '+wt:'')+(bad&&b?'. '+cprFt(CPR_TX.tryRoom,{r:b.n}):'');
    CPR.mk[c.uid]=bad?'<span class="cpr-mk" data-tip="'+esc(tip)+'" data-tk="rm'+c.uid+'">'+cpMark(-1)+'</span>':
      '<span class="cpl cp1 cpr-mk" data-tip="'+esc(tip)+'" data-tk="rm'+c.uid+'">'+esc(cprFt(CPR_TX.hint,{r:b.n}))+'</span>';
    return '<div class="cp-warn cpr-w '+(bad?'cpx':'cp1')+'">'+faceChip({key:lk(c),lv:bad?-1:b.lv,tip,on:'cprCat('+c.uid+')',tk:'rw'+c.uid})+
      '<div class="cpr-wt" data-tip="'+esc(tip)+'" data-tk="rx'+c.uid+'"><b>'+esc(head)+'</b>'+(wt?'<small>'+esc(wt)+'</small>':'')+'</div>'+
      (b?'<button type="button" class="sm" onclick="cpPut('+c.uid+',\''+b.id+'\')">'+esc(cprFt(T.moveTo,{r:b.n}))+'</button>':'')+'</div>'});
  const open=CPR.wopen[cur]||rows.length<=2,more=rows.length-2;
  return '<div class="cpr-ws">'+(open?rows:rows.slice(0,2)).join('')+
    (more>0?'<button type="button" class="cpr-more sm" onclick="cprMore('+(open?0:1)+')">'+(open?T.less:cprFt(CPR_TX.moreCats,{v:more}))+'</button>':'')+'</div>';
}
function cprMore(v){if(v)CPR.wopen[cur]=1;else delete CPR.wopen[cur];cprHide();renderPanel()}

{const H0=PANEL.home;PANEL.home=function(){
  let h=H0.apply(this,arguments);if(edit||!S.cats.length||!ROOM[cur])return h;
  try{
    const k=cprKey();if(k!==CPR.k){CPR.h=cprFit()+cprWarn();CPR.k=k}
    // dấu trên thẻ của bé: chèn ngay sau tên, trước khi thêm dòng gợi ý (dòng gợi ý cũng có onclick="openCat(...)")
    for(const uid in CPR.mk){
      const a=h.indexOf('<div class="card tap" onclick="openCat('+uid+')">');if(a<0)continue;
      const g=h.indexOf('<div class="g">',a),nx=h.indexOf('<div class="card',a+10),e=g<0?-1:h.indexOf('</b>',g);
      if(e<0||(nx>0&&e>nx))continue;
      h=h.slice(0,e+4)+' '+CPR.mk[uid]+h.slice(e+4);
    }
    // mốc: hết khối .feedbar (nút Sắp xếp đồ là nút cuối của khối)
    const a=h.indexOf('<button onclick="toggleEdit()">'),e=a<0?-1:h.indexOf('</div></div>',a);
    if(e<0)return h;
    return h.slice(0,e+12)+CPR.h+h.slice(e+12);
  }catch(err){console.error(err);return h}
}}

/* ---------- đặt nhanh một bé vào phòng ---------- */
function cpPut(uid,rid){
  const c=catBy(uid);cprHide();if(!c||!ROOM[rid]||c.room===rid){renderPanel();return}
  if(moveCat(uid,rid)){syncEnts();render();toast(cprFt(CPR_TX.moved,{r:ROOM[rid].n}),{type:'room',title:c.name})}
  else{toast(onTrip(uid)?cprFt(CPR_TX.cantAway,{t:cprAway(c)}):cprFt(CPR_TX.cantFull,{r:ROOM[rid].n,n:catsIn(rid).length,k:ROOM[rid].cap}),{type:'warn'});renderPanel()}
}

/* ---------- Xếp gợi ý: xem trước, bấm Áp dụng mới đổi ---------- */
function openArrange(){
  cprHide();
  const T=CP_TEXT.ui,p=CPR.plan=CP.plan(),mv=p.moves;
  if(!mv.length){modal('<div class="cpr-dlg"><h3>'+T.arrangeTitle+'</h3><div class="cpr-nomv">'+T.arrangeNone+'</div></div>');return}
  const G={};mv.forEach(m=>(G[m.to]=G[m.to]||[]).push(m));
  const row=m=>{const c=catBy(m.uid),g=cprSign(m.gain);
    return '<div class="cpr-mv">'+faceChip({key:lk(c),lv:m.lv,tip:c.name+' · '+CP.label(m.lv)})+
      '<div class="cpr-mt"><div class="cpr-m1"><b>'+esc(c.name)+'</b><span class="cpr-rt"><span class="dim">'+ROOM[m.from].n+' →</span> '+ROOM[m.to].n+'</span></div><small>'+esc(m.why)+'</small></div>'+
      '<b class="cpr-gn '+(Math.round(m.gain)<0?'dn':'up')+'" data-tip="'+esc(cprFt(CPR_TX.gainTip,{v:g}))+'">'+cprFt(CPR_TX.gain,{v:g})+'</b></div>'};
  modal('<div class="cpr-dlg"><h3>'+T.arrangeTitle+'</h3><div class="dim cpr-sub">'+T.arrangeSub+'</div>'+
    '<div class="cpr-sum">'+cprFt(CPR_TX.sum,{n:mv.length,g:cprSign(p.gain)})+'</div>'+
    ROOMS.concat([ROOM.wait]).filter(r=>G[r.id]).map(r=>'<div class="cpr-gh">🚪 <b>'+r.n+'</b> <small>· '+cprFt(CPR_TX.grp,{n:G[r.id].length})+'</small></div><div class="cpr-gl">'+G[r.id].map(row).join('')+'</div>').join('')+
    '<div class="cpr-ac"><button type="button" class="go cpr-go" onclick="cprGo()">'+T.arrangeGo+'</button><button type="button" onclick="cprNo()">'+T.arrangeNo+'</button></div></div>');
}
function cprNo(){CPR.plan=null;closeModal()}
function cprGo(){
  const T=CP_TEXT.ui,p=CPR.plan;CPR.plan=null;cprHide();closeModal();if(!p)return;
  const r=CP.apply(p);
  if(r.err){toast(r.err,{type:'warn',title:T.arrangeTitle});renderPanel();return}
  syncEnts();render();toast(cprFt(T.arrangeDone,{v:r.n}),{type:'room',title:T.arrangeTitle});
}

document.head.insertAdjacentHTML('beforeend','<style id="cpr-css">'+
'.cpr-fit{display:flex;align-items:center;flex-wrap:wrap;gap:4px 8px;margin-bottom:8px;padding:3px 8px;min-height:44px;border:2px dotted var(--line);border-radius:12px;background:var(--panel)}'+
'.cpr-lb{flex:none;font-size:13.5px}.cpr-none{font-size:13px}'+
'.cpr-fit .fcr{flex:1 1 0;min-width:120px}.cpr-fit .cpr-none{flex:1 1 0;min-width:120px}'+
'.cpr-fit .fc.cpr-s0{margin-left:8px}'+
'button.cpr-arr{flex:none;margin-left:auto;min-height:38px;padding:3px 12px;font-weight:700;white-space:nowrap}'+
'.cpr-ws{display:flex;flex-wrap:wrap;gap:6px 8px;margin-bottom:8px;align-items:center}'+
'.cpr-w{flex:1 1 400px;display:flex;align-items:center;gap:8px;min-width:0;padding:3px 6px 3px 8px;border:2px solid var(--cp1);border-radius:12px;background:var(--cp1b)}'+
'.cpr-w.cpx{border-color:var(--cpx);background:var(--cpxb)}'+
'.cpr-wt{flex:1;min-width:0;font-size:13px;line-height:1.25}.cpr-wt b{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--cp1)}.cpr-w.cpx .cpr-wt b{color:var(--cpx)}'+
'.cpr-wt small{display:block;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:12px;color:var(--ink);opacity:.85}'+
'.cpr-w button{flex:none;min-height:36px;padding:3px 9px;font-size:12.5px;white-space:nowrap}'+
'button.cpr-more{flex:none;min-height:36px;padding:3px 12px;white-space:nowrap}'+
'.cpr-mk{position:relative;display:inline-block;vertical-align:middle;font-size:11px;line-height:1.4;padding:0 6px}'+
'span.cpr-mk:not(.cpl){padding:0}.cpr-mk .cpm{position:static;display:inline-block;vertical-align:middle;border:0}'+
'.mwrap:has(>#mbox>.cpr-dlg),#modal .box:has(>.cpr-dlg){max-width:min(660px,100%)}'+
'.cpr-dlg{text-align:left}.cpr-dlg h3{margin:0 0 4px;padding-right:30px}'+
'.cpr-sub{font-size:13px;line-height:1.35}.cpr-nomv{margin:10px 0 4px;font-size:14.5px}'+
'.cpr-sum{margin:6px 0 2px;font-size:13.5px;font-weight:700}'+
'.cpr-gh{margin:8px 0 4px;font-size:14px}.cpr-gh small{color:var(--dim)}'+
'.cpr-gl{display:grid;grid-template-columns:repeat(auto-fill,minmax(270px,1fr));gap:4px 8px}'+
'.cpr-mv{display:flex;align-items:center;gap:8px;min-width:0;padding:4px 8px 4px 6px;border:2px solid var(--soft,#d9c3a5);border-radius:12px;background:var(--panel)}'+
'.cpr-mt{flex:1;min-width:0;font-size:13px;line-height:1.25}.cpr-mt small{display:block;font-size:12px;color:var(--dim)}'+
'.cpr-m1{display:flex;flex-wrap:wrap;align-items:baseline;gap:0 7px}.cpr-m1 b{font-size:13.5px}.cpr-rt{white-space:nowrap;font-size:12.5px}'+
'.cpr-gn{flex:none;font-size:13.5px;white-space:nowrap;color:var(--cp2)}.cpr-gn.dn{color:var(--cpx)}'+
'.cpr-ac{display:flex;gap:8px;position:sticky;bottom:-14px;z-index:1;margin:10px 0 -14px;padding:6px 0 14px;background:var(--bg);box-shadow:0 -8px 8px -6px var(--bg)}'+
'.cpr-ac button{flex:1 1 0;min-height:44px}.cpr-ac .cpr-go{flex:2 1 0;font-weight:700}'+
'@media(pointer:coarse){button.cpr-arr,.cpr-w button,button.cpr-more{min-height:44px}.cpr-fit{padding-top:2px;padding-bottom:2px}}'+
'@media(orientation:landscape) and (max-height:520px){.cpr-fit{margin-bottom:6px}.cpr-lb{font-size:13px}.cpr-ws{gap:5px 8px;margin-bottom:6px}.cpr-w{flex-basis:360px}'+
  '.cpr-gh{margin:6px 0 3px}.cpr-ac{margin-top:6px}}'+
'</style>');
