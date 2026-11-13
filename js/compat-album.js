"use strict";
/* ============ GỢI Ý TƯƠNG THÍCH: LỌC VÀ SẮP XẾP Ở TAB MÈO, SƯU TẬP (2026-11-13) ============
   Nạp sau js/ui.js, js/face.js, js/unlock.js. Luật lấy hết từ CP (js/compat.js); file này chỉ dựng giao diện.
   js/ui.js gọi ba hàm ở đây (mỗi chỗ gọi có kiểm tra typeof, thiếu file này game vẫn chạy như cũ):
     cpaCats(base, SORT)   PANEL.cats: base là danh sách bé đã lọc theo phòng (mg.room). Trả {list, btn, bar, on, tag(c), none}:
                           list đã sắp xếp (đang lọc thì chỉ còn bé hợp, hợp nhất đứng đầu), btn nút Xếp gợi ý, bar thanh lọc,
                           on đang lọc (ui.js ẩn hàng Sắp xếp), tag(c) nhãn trên thẻ, none câu báo khi danh sách rỗng.
                           Hàm còn thêm SORT.fit ("Hợp nhất": bé đang ở sai phòng đứng đầu) vào hàng Sắp xếp.
     cpaAlbum(list0)       PANEL.album (trừ nhóm Màu hiếm): list0 là các loài của nhóm đang xem. Trả {bar, list|null, tag(s)}
     cpaBreed(id)          openBreed: khối "Hợp với loài này"
   Trạng thái lọc (CPA) chỉ nằm trong bộ nhớ, không vào bản lưu. Mỗi lúc một tiêu chí.
   Hợp đồng với hướng dẫn tân thủ: nút Xếp gợi ý có lớp cp-arr, thanh lọc có lớp cp-filter. */
// chữ của file này (hằng CPA_TX) nằm ở js/compat-data.js
// c: lọc ở tab Mèo {k:'room'|'food'|'drink', id}; a: lọc ở Sưu tập {k:'room'|'food', id, all: xem mọi nhóm, g: nhóm lúc bật all}
const CPA={k:null,id:null,a:{k:null,id:null,all:false,g:null}};
const cpaSrc=k=>k==='room'?ROOM:k==='food'?FOOD:typeof DRINK!=='undefined'?DRINK:{};
const cpaName=(k,id)=>(cpaSrc(k)[id]||{}).n||'';
function cpaSet(k,id){CPA.k=id?k:null;CPA.id=id||null;hideTip();renderPanel()}
function cpaSetA(k,id){CPA.a.k=id?k:null;CPA.a.id=id||null;if(!id)CPA.a.all=false;hideTip();renderPanel()}
function cpaAll(){CPA.a.all=!CPA.a.all;CPA.a.g=albumG;renderPanel()}
// một ô chọn của thanh lọc; ô đang có hiệu lực được viền vàng
function cpaSel(fn,k,label,L,cur){
  const on=cur.k===k;
  return '<label class="cpa-f'+(on?' on':'')+'"><span>'+label+'</span><select aria-label="'+esc(CP_TEXT.ui.filter+': '+label)+'" onchange="'+fn+'(\''+k+'\',this.value)"><option value="">'+CPA_TX.off+'</option>'+
    L.map(x=>'<option value="'+x.id+'"'+(on&&cur.id===x.id?' selected':'')+'>'+esc(x.n)+'</option>').join('')+'</select></label>';
}
// nhãn mức có lý do; mb: "hay có" (viền nét đứt, không chắc)
const cpaTag=(lv,text,tip,mb,pre)=>'<span class="cpa-tg'+(mb?' cpa-mb':'')+'" tabindex="0" data-tip="'+esc(tip)+'">'+(pre||'')+cpLabel(lv,text)+'</span>';

/* ---------- tab Mèo ---------- */
// CP.misfit của cả đàn (mỗi bé một lần gọi). Kết quả chỉ đổi khi mèo đổi phòng, vắng nhà hoặc nội thất đổi, nên giữ lại theo khóa trạng thái:
// các lần vẽ lại tab (chọn nhiều, đổi lọc phòng) không phải tính lại cho 150 bé
let CPA_MF={key:'',m:{}};
function cpaMisfits(){
  const key=Object.keys(S.rooms).join()+'|'+S.cats.map(c=>c.uid+c.room+(onTrip(c.uid)?'!':'')+c.traits.length).join()+'|'+S.items.map(i=>i.fid+(i.room||'')+(i.broken?'!':'')).join();
  if(key!==CPA_MF.key){const m={};S.cats.forEach(c=>{m[c.uid]=CP.misfit(c)});CPA_MF={key,m}}
  return CPA_MF.m;
}
function cpaCats(base,SORT){
  const T=CP_TEXT.ui,X=CPA_TX,ft=CP.ft;
  SORT.fit=[T.sortFit,()=>0];
  if(CPA.k&&!(cpaSrc(CPA.k)[CPA.id]&&(CPA.k!=='room'||S.rooms[CPA.id]))){CPA.k=CPA.id=null}
  const k=CPA.k,id=CPA.id,tags={},where=mg.room!=='all'&&ROOM[mg.room]?ROOM[mg.room].n:'';
  let list,sum='',none=null;
  if(k){
    // mỗi bé đúng một lần chấm điểm; chỉ giữ bé từ mức Hợp
    const fn=k==='room'?CP.room:k==='food'?CP.food:CP.drink,nm=cpaName(k,id),L=[];
    base.forEach((c,i)=>{const r=fn(c,id);if(r.lv>=1)L.push({c,r,i})});
    L.sort((a,b)=>b.r.lv-a.r.lv||b.r.score-a.r.score||b.r.total-a.r.total||b.c.star-a.c.star||a.i-b.i);
    L.forEach(x=>{tags[x.c.uid]=cpaTag(x.r.lv,'',CP.tip(nm,x.r))});
    list=L.map(x=>x.c);
    const K=k==='room'?'Room':k==='food'?'Food':'Drink';
    if(L.length)sum='<b>'+esc(ft(X['cats'+K],{v:L.length,f:nm}))+'</b><span class="dim">'+(where?esc(ft(X.among,{r:where}))+' · ':'')+X.order+'</span>';
    else none='<div class="dim cpa-none">'+esc(ft(X['no'+K],{f:nm,w:where?ft(X.noWhere,{r:where}):''}))+(k==='drink'?' '+esc(T.drinkNote):'')+'</div>';
  }else if(mg.sort==='fit'){
    // bé ở phòng không hợp đứng đầu, rồi bé có phòng hợp hơn hẳn, rồi các bé còn lại theo sao
    const mf=cpaMisfits(),L=base.map((c,i)=>{const m=mf[c.uid]||null;return {c,m,i,g:!m?2:m.kind==='bad'?0:1}});
    L.sort((a,b)=>a.g-b.g||(a.g===0?a.m.cur.total-b.m.cur.total:a.g===1?b.m.gain-a.m.gain:b.c.star-a.c.star)||a.i-b.i);
    let nb=0,nt=0;
    L.forEach(x=>{const m=x.m,c=x.c;if(!m)return;const rn=ROOM[c.room].n,go=m.best?'. '+X.hint+': '+ft(T.moveTo,{r:m.best.n}):'';
      if(m.kind==='bad'){nb++;tags[c.uid]=cpaTag(-1,'',ft(T.misfit,{c:c.name,r:rn})+(m.cur.tip?'. '+m.cur.tip:'')+go)}
      else{nt++;tags[c.uid]=cpaTag(m.best.lv,ft(X.betterTag,{r:m.best.n}),ft(T.better,{c:c.name,r:m.best.n})+(m.best.tip?'. '+m.best.tip:''))}});
    list=L.map(x=>x.c);
    sum='<span class="dim"><b>'+X.fitLead+':</b> '+(nb||nt?[nb?ft(X.fitBad,{v:nb}):'',nt?ft(X.fitBetter,{v:nt}):''].filter(Boolean).join(', ')+'.':X.fitOk)+'</span>';
  }else list=base.sort((SORT[mg.sort]||SORT.star)[1]);
  if(!list.length&&!none&&!where)none='<div class="dim cpa-none">'+X.noCats+'</div>'; // nhà chưa có bé nào: câu báo gốc của ui.js cần một phòng đang lọc
  const cur={k,id};
  const bar='<div class="cp-filter cpa-bar"><b class="cpa-h">'+T.filter+'</b>'+
    cpaSel('cpaSet','room',T.filterRoom,ownedRooms(),cur)+cpaSel('cpaSet','food',T.filterFood,FOODS,cur)+(typeof DRINKS!=='undefined'?cpaSel('cpaSet','drink',T.filterDrink,DRINKS,cur):'')+
    (k||sum?'<div class="cpa-sum">'+sum+(k?'<button class="sm cpa-x" onclick="cpaSet()">'+X.clear+'</button>':'')+'</div>':'')+'</div>';
  return {list,bar,on:!!k,none,tag:c=>tags[c.uid]||'',
    btn:'<button class="sm cp-arr" onclick="if(typeof openArrange===\'function\')openArrange()">'+T.arrange+'</button>'};
}

/* ---------- tab Sưu tập ---------- */
function cpaAlbum(list0){
  const T=CP_TEXT.ui,X=CPA_TX,ft=CP.ft,A=CPA.a;
  if(A.k&&!cpaSrc(A.k)[A.id]){A.k=A.id=null}
  if(A.all&&(A.g!==albumG||!A.k))A.all=false; // bấm sang nhóm khác thì về lại xem từng nhóm
  const tags={};let list=null,sum='';
  if(A.k){
    const fn=A.k==='room'?CP.spRoom:CP.spFood,nm=cpaName(A.k,A.id),L=[];
    (A.all?BREEDS.concat(VARIANTS):list0).forEach((s,i)=>{const r=fn(s.id,A.id);if(r.lv>=1)L.push({s,r,i})});
    L.sort((a,b)=>b.r.lv-a.r.lv||(a.r.maybe?1:0)-(b.r.maybe?1:0)||b.r.score-a.r.score||b.s.r-a.s.r||a.i-b.i);
    // nhãn xuống dòng riêng dưới hàng sao (ô loài hẹp). Loài chưa gặp: chỉ ghi mức, không ghi lý do (tên thuộc tính riêng sẽ lộ ra bé là ai)
    L.forEach(x=>{const r=x.r,seen=S.seen[x.s.id],mb=!!r.maybe;
      tags[x.s.id]='<br>'+cpaTag(r.lv,mb?CP_LV[r.lv].n+' · '+X.maybe:'',seen?CP.tip(nm,r)+(mb?'. '+X.maybeTip:''):CP.tip(nm,{lv:r.lv,tip:''})+(mb?' ('+X.maybe+')':'')+'. '+T.notSeen,mb)});
    list=L.map(x=>x.s);
    sum=(L.length?'<b>'+esc(ft(A.k==='room'?X.spRoom:X.spFood,{v:L.length,f:nm}))+'</b><span class="dim">'+X.spOrder+'</span>'
      :'<span class="dim">'+esc(ft(X.noSp,{f:nm,g:A.all?X.everyGroup:X.thisGroup}))+'</span>')+
      '<button class="sm'+(A.all?' on':'')+'" onclick="cpaAll()">'+X.allGroups+'</button>';
  }
  const bar='<div class="cp-filter cpa-bar"><b class="cpa-h">'+T.filter+'</b>'+cpaSel('cpaSetA','room',T.filterRoom,ROOMS,A)+cpaSel('cpaSetA','food',T.filterFood,FOODS,A)+
    (A.k?'<div class="cpa-sum">'+sum+'<button class="sm cpa-x" onclick="cpaSetA()">'+X.clear+'</button></div>':'')+'<div class="cpa-note">'+T.drinkNote+'</div></div>';
  return {bar,list,tag:s=>tags[s.id]||''};
}

/* ---------- hộp thoại một loài ---------- */
function cpaBreed(id){
  if(!SP[id])return '';
  const T=CP_TEXT.ui,X=CPA_TX,I=CP.spInfo(id),mbt=x=>x.maybe?'. '+X.maybeTip:'',mbn=x=>x.n+(x.maybe?' · '+X.maybe:'');
  const row=(h,b)=>'<div class="cpa-r"><span class="cpa-k">'+h+'</span><span class="cpa-v">'+b+'</span></div>';
  // phòng: tối đa 4 mục, giữ một chỗ cho phòng không hợp (nếu có) vì đó là điều người chơi cần tránh
  const pos=I.rooms.filter(r=>r.lv>0),neg=I.rooms.filter(r=>r.lv<0),show=pos.slice(0,4-Math.min(1,neg.length)).concat(neg.slice(0,1)),rest=I.rooms.filter(r=>!show.includes(r));
  const one=r=>cpaTag(r.lv,mbn(r),CP.tip(r.n,r)+mbt(r),r.maybe);
  const rooms=show.length?show.map(one).join('')+(rest.length?'<span class="cpa-more" tabindex="0" data-tip="'+esc(X.moreTip+': '+rest.map(r=>r.n).join(', '))+'">'+CP.ft(T.more,{v:rest.length})+'</span>':''):'<span class="dim">'+T.anyRoom+'</span>';
  const foods=I.foods.length?I.foods.map(one).join(''):'<span class="dim">'+X.anyFood+'</span>';
  const likes=I.likes.map(l=>cpaTag(CP.lvOf(l.pts),mbn(l),CP.ft(T.toyTip,{n:l.tn,v:l.pts,f:l.n})+mbt(l),l.maybe,furnTag(l.fid,'',28,22))).join('');
  return '<div class="cd-sec cpa-sp"><h4>'+X.spTitle+'</h4>'+row(T.bestRoom,rooms)+row(T.bestFood,foods)+(likes?row(T.bestToy,likes):'')+'</div>';
}

if(typeof document!=='undefined')document.head.insertAdjacentHTML('beforeend','<style id="cpa-css">'+
  '.cpa-bar{display:flex;flex-wrap:wrap;gap:6px 10px;align-items:center;margin:8px 0;padding:7px 10px;background:var(--panel);border:2px solid var(--soft,#d9c3a5);border-radius:12px;font-size:13px}'+
  '.cpa-h{flex:none}'+
  '.cpa-f{display:inline-flex;align-items:center;gap:5px;min-width:0;max-width:100%}.cpa-f>span{flex:none;color:var(--dim);font-weight:700}'+
  '.cpa-f select{min-width:64px;max-width:200px;padding:4px 6px;font-size:13px}'+
  '.cpa-f.on>span{color:var(--ink)}.cpa-f.on select{border-color:var(--gold);box-shadow:0 0 0 2px var(--gold)}'+
  '.cpa-x{flex:none}'+
  '@media (max-height:520px){.cpa-bar{padding:6px 8px;gap:5px 8px}.cpa-h{display:none}.cpa-f{flex:1 1 150px}.cpa-f select{flex:1;max-width:none}}'+
  '.cpa-sum{flex:1 1 100%;display:flex;flex-wrap:wrap;gap:4px 10px;align-items:center;min-width:0}'+
  '.cpa-note{flex:1 1 100%;font-size:12px;color:var(--dim)}'+
  '.cpa-none{padding:6px 2px}'+
  '.row.cpa-off{display:none}'+
  '.cpa-tg{display:inline-flex;align-items:center;gap:4px;vertical-align:middle;margin-left:4px;max-width:100%;border-radius:9px;cursor:help}'+
  '.cpa-tg:focus-visible,.cpa-more:focus-visible{outline:3px solid var(--gold);outline-offset:1px}'+
  '.cpa-tg .cpl{white-space:normal;text-align:left}'+
  '.cpa-mb .cpl{border-style:dashed}'+
  '.cell .cpa-tg{margin:2px 0 1px}'+
  '.cpa-sp .cpa-r{display:flex;gap:8px;align-items:flex-start;margin-top:6px}.cpa-sp .cpa-r:first-of-type{margin-top:0}'+
  '.cpa-k{flex:none;width:86px;font-size:12.5px;font-weight:700;color:var(--dim);line-height:1.9}'+
  '.cpa-v{flex:1;min-width:0;display:flex;flex-wrap:wrap;gap:5px 6px;align-items:center;font-size:13px}'+
  '.cpa-v .cpa-tg{margin-left:0}.cpa-v .cpa-tg img{flex:none}'+
  '.cpa-more{font-size:12.5px;font-weight:800;color:var(--dim);cursor:help;border-radius:9px;padding:0 3px}'+
  '</style>');
