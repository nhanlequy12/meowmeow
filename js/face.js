"use strict";
/* ============ ICON MẶT MÈO VÀ NHÃN TƯƠNG THÍCH (2026-11-12) ============
   Nạp ngay sau js/ui.js. Phần giao diện dùng chung của hệ gợi ý tương thích (luật ở js/compat.js).

   Icon mặt mèo: cắt một ô vuông cố định quanh đầu của khung ngồi nhìn thẳng (hình CatKit, đúng hình game đang vẽ), nên mọi bé cùng cỡ, cùng khung.
   Khóa ngoại hình giống catTag: 'giống', 'giống~màu' (lk(c) của một bé) nên giữ đúng màu lông, màu mắt, màu hiếm, trang phục hiếm.
   Ảnh được dựng một lần cho mỗi khóa và mỗi cỡ rồi giữ trong bộ nhớ đệm (FACE_B, FACE_S); các lần sau chỉ dùng lại đường dẫn blob.

     faceBuf(key)            ô cắt dạng Buf {W, H, w, h, c, r} (chạy được trong Node: tools/facetest.js)
     faceTag(key, {sz})      thẻ <img>. sz 's' (khoảng 26–42px, mặc định) hoặc 'm' (khoảng 35–52px); luôn phóng theo bội số nguyên
     faceChip(o)             một icon bấm được, có dấu mức tương thích ở góc:
                             o = {key, lv, tip, on, dim, unk, here, sz, tk, cls}
                             lv: mức của CP (2, 1, 0, −1); tip: chữ cho data-tip; on: mã JS chạy khi bấm (bỏ trống thì không bấm được);
                             dim: bé chưa có (mờ); unk: chưa từng gặp (bóng đen); here: viền "đang ở đây"; tk: khóa giữ tooltip qua các lần vẽ lại
     faceRow(items, {id, max, sz, re})   một hàng icon; quá max (mặc định 6) thì hiện nút "+N", bấm để xem hết (id là khóa nhớ trạng thái mở,
                             re là mã JS vẽ lại, mặc định 'renderPanel()')
     cpMark(lv)              dấu nhỏ của mức: ♥ xanh lục, ✓ xanh biển, ! đỏ; mức 0 không có dấu
     cpLabel(lv, text)       nhãn có chữ: "♥ Rất hợp", "✓ Hợp", "! Không hợp" (không chỉ dựa vào màu)
   Nhấn giữ một icon trên màn cảm ứng thì hiện lý do (tooltip data-tip sẵn có) mà không kích hoạt nút. */
const FACE={x:14,y:7,n:52};            // ô cắt trên lưới mịn 72×80 của khung ngồi: cột 14–65, hàng 7–58 (đầu Xoài chiếm cột 16–63, hàng 13–56)
const FACE_B={},FACE_S={},FACE_OPEN={};
function faceBuf(key){
  if(key in FACE_B)return FACE_B[key];
  const b=Art.cat(look(key),'sit');if(!b)return FACE_B[key]=null;
  const n=FACE.n,o={W:n,H:n,w:n/2,h:n/2,c:new Array(n*n).fill(null),r:new Array(n*n).fill(null)};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){const sx=x+FACE.x,sy=y+FACE.y;if(sx<0||sy<0||sx>=b.W||sy>=b.H)continue;const j=sy*b.W+sx;o.c[y*n+x]=b.c[j]||null;o.r[y*n+x]=b.r[j]||null}
  return FACE_B[key]=o;
}
// cỡ hiển thị: f điểm ảnh thật cho mỗi ô mịn, css là cạnh tính bằng px CSS; soft: màn thường (1 điểm ảnh mỗi px) thì cỡ 's' thu còn một nửa, để trình duyệt làm mượt
function faceDim(sz){
  const d=DPR(),n=FACE.n;let f=1;
  if(sz==='m'){while(n*f/d<34)f++;return {f,css:n*f/d,soft:0}}
  while(n*f/d<24)f++;let css=n*f/d,soft=0;if(css>44){css/=2;soft=1}
  return {f,css,soft};
}
function faceSrc(key,f){const k=key+'|'+f;if(FACE_S[k])return FACE_S[k];const b=faceBuf(key);return FACE_S[k]=b?cvURL(bufCanvas(b,f)):''}
const faceRare=key=>String(key).indexOf('~r_')>0||!!(COATS[String(key).split('~')[1]]||{}).form;
function faceTag(key,o){
  o=o||{};const d=faceDim(o.sz),s=Math.round(d.css*100)/100;
  return '<img class="face'+(d.soft?'':' px')+(faceRare(key)?' rareglow':'')+(o.cls?' '+o.cls:'')+'" alt="" draggable="false" width="'+s+'" height="'+s+'" src="'+faceSrc(key,d.f)+'">';
}
const CP_MK={'2':CP_LV[2].ic,'1':CP_LV[1].ic,'-1':CP_LV[-1].ic};   // dấu của ba mức có dấu, lấy từ js/compat-data.js
const cpCls=lv=>(CP_LV[lv]||CP_LV[0]).cls;
const cpMark=lv=>CP_MK[lv]?'<i class="cpm '+cpCls(lv)+'" aria-hidden="true">'+CP_MK[lv]+'</i>':'';
const cpLabel=(lv,text)=>'<span class="cpl '+cpCls(lv)+'">'+(CP_MK[lv]?'<i aria-hidden="true">'+CP_MK[lv]+'</i> ':'')+esc(text||(CP_LV[lv]||CP_LV[0]).n)+'</span>';
function faceChip(o){
  const cls='fc '+cpCls(o.lv||0)+(o.dim?' dim':'')+(o.unk?' unk':'')+(o.here?' here':'')+(o.cls?' '+o.cls:'');
  const at=(o.tip?' data-tip="'+esc(o.tip)+'"':'')+(o.tk?' data-tk="'+esc(o.tk)+'"':'');
  const body=faceTag(o.key,{sz:o.sz})+cpMark(o.lv||0);
  return o.on?'<button type="button" class="'+cls+'"'+at+' onclick="'+esc(o.on)+'">'+body+'</button>':'<span class="'+cls+'" tabindex="0"'+at+'>'+body+'</span>';
}
function faceRow(items,o){
  o=o||{};const max=o.max||6,open=!!(o.id&&FACE_OPEN[o.id]),show=open?items:items.slice(0,max),more=items.length-show.length,re=o.re||'renderPanel()',T=CP_TEXT.ui;
  return '<span class="fcr">'+show.map(i=>faceChip(Object.assign({sz:o.sz},i))).join('')+
    (more>0&&o.id?'<button type="button" class="fc-more" data-tip="Xem hết '+items.length+' bé" onclick="FACE_OPEN[\''+o.id+'\']=1;hideTip();'+esc(re)+'">'+CP.ft(T.more,{v:more})+'</button>':more>0?'<span class="fc-more">'+CP.ft(T.more,{v:more})+'</span>':'')+
    (open&&items.length>max?'<button type="button" class="fc-more" onclick="delete FACE_OPEN[\''+o.id+'\'];hideTip();'+esc(re)+'">'+T.less+'</button>':'')+'</span>';
}

if(typeof document!=='undefined'){
  document.head.insertAdjacentHTML('beforeend','<style id="face-css">'+
  ':root{--cp2:#23804a;--cp1:#2a6fb5;--cpx:#c23b3b;--cp2b:#d9f1e0;--cp1b:#dceafa;--cpxb:#fbdada}'+
  'html[data-theme=dark]{--cp2:#6fd79a;--cp1:#7fb9f2;--cpx:#ff8a8a;--cp2b:#1f3d2c;--cp1b:#1f3350;--cpxb:#4a2424}'+
  'img.face{display:block;border-radius:9px}img.face.px{image-rendering:pixelated}'+
  '.fcr{display:inline-flex;flex-wrap:wrap;gap:4px;align-items:center;vertical-align:middle}'+
  '.fc{position:relative;display:inline-flex;align-items:center;justify-content:center;flex:none;padding:2px;margin:0;min-height:0;min-width:0;width:auto;line-height:0;border:2px solid var(--soft,#d9c3a5);border-radius:11px;background:var(--panel);cursor:default;box-shadow:none}'+
  'button.fc{cursor:pointer}button.fc:hover{background:var(--panel2)}.fc:focus-visible{outline:3px solid var(--gold);outline-offset:1px}'+
  '.fc.cp2{border-color:var(--cp2)}.fc.cp1{border-color:var(--cp1)}.fc.cpx{border-color:var(--cpx)}'+
  '.fc.here{box-shadow:0 0 0 2px var(--gold)}'+
  '.fc.dim{border-style:dashed}.fc.dim img{opacity:.5;filter:grayscale(.55)}'+
  '.fc.unk img{filter:brightness(0);opacity:.32}html[data-theme=dark] .fc.unk img{filter:brightness(0) invert(.6);opacity:.45}'+
  '.cpm{position:absolute;right:-5px;bottom:-5px;min-width:15px;height:15px;padding:0 2px;border-radius:8px;font:900 10.5px/15px system-ui,sans-serif;font-style:normal;text-align:center;color:#fff;border:1.5px solid var(--panel)}'+
  '.cpm.cp2{background:var(--cp2)}.cpm.cp1{background:var(--cp1)}.cpm.cpx{background:var(--cpx)}html[data-theme=dark] .cpm{color:#16100b}'+
  '.cpl{display:inline-flex;align-items:center;gap:2px;padding:1px 7px;border-radius:9px;font-size:12px;font-weight:700;line-height:1.5;white-space:nowrap;border:1.5px solid var(--soft,#d9c3a5);color:var(--ink)}'+
  '.cpl i{font-style:normal;font-weight:900}'+
  '.cpl.cp2{color:var(--cp2);border-color:var(--cp2);background:var(--cp2b)}.cpl.cp1{color:var(--cp1);border-color:var(--cp1);background:var(--cp1b)}.cpl.cpx{color:var(--cpx);border-color:var(--cpx);background:var(--cpxb)}'+
  '.fc-more{flex:none;min-height:30px;min-width:34px;width:auto;padding:2px 8px;margin:0;border-radius:11px;font-size:12.5px;font-weight:800;line-height:1.2}span.fc-more{display:inline-flex;align-items:center;color:var(--dim)}'+
  '</style>');
  // nhấn giữ trên màn cảm ứng: hiện lý do, và bỏ cú bấm ngay sau đó để không kích hoạt nút
  let hold=0,held=null,hx=0,hy=0;
  document.addEventListener('pointerdown',e=>{
    if(e.pointerType==='mouse')return;const t=e.target.closest&&e.target.closest('.fc[data-tip]');clearTimeout(hold);held=null;if(!t)return;hx=e.clientX;hy=e.clientY;
    hold=setTimeout(()=>{if(t.isConnected){held=t;showTip(t)}},420);
  },true);
  ['pointerup','pointercancel','pointermove'].forEach(n=>document.addEventListener(n,e=>{if(n==='pointermove'&&Math.abs(e.clientX-hx)+Math.abs(e.clientY-hy)<12)return;clearTimeout(hold)},true));
  document.addEventListener('click',e=>{if(held&&e.target.closest&&e.target.closest('.fc')===held){e.preventDefault();e.stopPropagation()}held=null},true);
  document.addEventListener('contextmenu',e=>{if(e.target.closest&&e.target.closest('.fc[data-tip]')&&matchMedia('(pointer:coarse)').matches)e.preventDefault()});
}
