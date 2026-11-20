"use strict";
/* ============ CỠ CHỮ PIXEL KHỚP LƯỚI MÀN HÌNH (2026-11-20) ============
   Font "MeoXu Pixel" (css/fonts.css) có cỡ gốc 12px: ở cỡ m × 12px, mỗi điểm ảnh của font là m điểm ảnh CSS. Màn có hệ số điểm ảnh
   (devicePixelRatio) không nguyên thì m × dpr lẻ, chữ bị nhòe; nên đặt lại --px1, --px2, --px3 = round(m × dpr) × 12 / dpr
   (hệ số 1,5: 16px, 24px, 40px; hệ số 1, 2, 3: giữ 12, 24, 36px). Tính lại khi đổi cỡ cửa sổ, kéo sang màn khác hay phóng to trang.
   Không đổi luật chơi, không ghi gì vào S. Nạp ngay sau js/dialog.js. */
(function(){
  const root=document.documentElement;let last=0;
  const snap=(m,d)=>{const n=m*d;return Math.abs(n-Math.round(n))<.01?12*m:Math.max(1,Math.round(n))*12/d};
  function apply(){
    const d=window.devicePixelRatio||1;if(d===last)return;last=d;
    [1,2,3].forEach(m=>root.style.setProperty('--px'+m,+snap(m,d).toFixed(4)+'px'));
    root.classList.toggle('fx-frac',snap(1,d)!==12);   // cỡ 1 khác 12px: vài chỗ quá chật giữ chữ Nunito (css/fonts-apply.css)
    watch(d);
  }
  // matchMedia theo đúng hệ số hiện tại: đổi hệ số (kéo cửa sổ sang màn khác, Ctrl + / −) thì báo
  let mq=null;
  function watch(d){
    try{if(mq)mq.removeEventListener('change',apply);mq=matchMedia('(resolution: '+d+'dppx)');mq.addEventListener('change',apply)}catch(e){}
  }
  apply();addEventListener('resize',apply);
  window.fontFxPx=m=>snap(m,window.devicePixelRatio||1);
})();
