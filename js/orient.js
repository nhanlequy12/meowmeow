"use strict";
/* ============ ĐIỆN THOẠI: CHỈ CHƠI MÀN HÌNH NGANG, CHIỀU CAO THẬT (2026-11-12) ============
   - Điện thoại (cảm ứng, cạnh ngắn của màn hình ≤ 600px) đang dọc: hiện #rotate che toàn bộ game, chặn mọi thao tác,
     bỏ focus ô nhập và tooltip. Xoay ngang thì tự ẩn. Máy tính và máy tính bảng không bị ảnh hưởng.
   - Trình duyệt hỗ trợ Screen Orientation API (Chrome Android): nút "Toàn màn hình và xoay ngang" xin toàn màn hình rồi khóa hướng ngang.
     Không hỗ trợ (Safari iOS): chỉ hiện lời nhắc, không giả định khóa được.
   - --vvh: chiều cao vùng nhìn thấy thật (visualViewport, đã trừ thanh địa chỉ và bàn phím) để hộp thoại, thẻ gacha, hướng dẫn không bị cắt.
   CSS: css/mobile.css */
(function(){
  const de=document.documentElement,mq=matchMedia('(pointer:coarse)');
  const phone=()=>mq.matches&&Math.min(screen.width,screen.height)<=600;
  const canLock=!!(screen.orientation&&screen.orientation.lock&&de.requestFullscreen);
  const el=document.createElement('div');el.id='rotate';el.setAttribute('role','alertdialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Xoay ngang điện thoại');
  el.innerHTML='<div class="rt-in"><div class="rt-ph" aria-hidden="true"><i></i></div><b>Vui lòng xoay ngang điện thoại để chơi game</b>'+
    '<small>Mèo Xu được thiết kế cho màn hình ngang. Xoay máy xong game hiện lại ngay, tiến độ vẫn giữ nguyên.</small>'+
    (canLock?'<button class="on" type="button" id="rtlock">⛶ Toàn màn hình và xoay ngang</button>':'')+'</div>';
  document.body.appendChild(el);
  const lock=async()=>{try{if(!document.fullscreenElement)await de.requestFullscreen({navigationUI:'hide'});await screen.orientation.lock('landscape')}catch(e){const b=document.getElementById('rtlock');if(b){b.disabled=true;b.textContent='Máy này không tự xoay được, hãy xoay tay'}}};
  if(canLock)document.getElementById('rtlock').addEventListener('click',lock);
  let last='';
  function upd(){
    const v=window.visualViewport,h=Math.round(v?v.height:innerHeight);de.style.setProperty('--vvh',h+'px');
    const port=phone()&&innerHeight>innerWidth;
    if(String(port)===last)return;last=String(port);
    de.classList.toggle('need-land',port);el.style.display=port?'flex':'none';
    if(port){const a=document.activeElement;if(a&&a.blur&&a!==document.body)a.blur();if(typeof hideTip==='function')hideTip()}
  }
  addEventListener('resize',upd);addEventListener('orientationchange',()=>setTimeout(upd,150));
  if(window.visualViewport)visualViewport.addEventListener('resize',upd);
  if(mq.addEventListener)mq.addEventListener('change',()=>{last='';upd()});
  upd();
  window.needLandscape=()=>de.classList.contains('need-land');
})();
