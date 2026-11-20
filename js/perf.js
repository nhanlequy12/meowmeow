"use strict";
/* ============ TIẾT KIỆM PIN: 30 KHUNG/GIÂY (2026-11-20) ============
   Cài đặt › "🔋 Tiết kiệm pin": S.set.fps30 (mặc định tắt). Bật thì vòng lặp của ui.js chỉ VẼ phòng mỗi khung thứ hai
   (khoảng 30 khung/giây trên màn 60 Hz). Mèo, camera, hạt, khách lạ vẫn tính mỗi khung theo thời gian thật (dt), nên tốc độ
   đi lại, nhảy, hoạt ảnh không đổi, chỉ thưa khung hơn. Khung bị bỏ thì canvas giữ nguyên hình khung trước: trình duyệt không
   phải vẽ lại, đỡ CPU và GPU.
   - Chỉ bỏ lời gọi drawRoom() của vòng lặp. Các chỗ khác tự gọi drawRoom() (chụp ảnh phòng của js/photo-ui.js) vẫn vẽ ngay.
   - Thẻ Cài đặt thêm bằng cách bọc pwaCard như js/petcue.js. Nạp ngay sau js/bg.js (sau js/app.js), trước js/petcue.js. */
const PF={odd:0,skip:false};
const pfOn=()=>!!(S&&S.set&&S.set.fps30);
{const L0=loop;loop=function(t){PF.skip=pfOn()&&(PF.odd^=1)===1;try{return L0.apply(this,arguments)}finally{PF.skip=false}}}
{const D0=drawRoom;drawRoom=function(){if(PF.skip)return;return D0.apply(this,arguments)}}
function pfSet(on){S.set.fps30=!!on;save();const mb=$('mbox');if(mb){const y=mb.scrollTop;openSettings();$('mbox').scrollTop=y}}
if(typeof pwaCard==='function'){const P0=pwaCard;pwaCard=function(){const on=pfOn();
  return '<div class="card" style="flex-direction:column;align-items:stretch"><b>🔋 Tiết kiệm pin</b>'+
    '<div class="row"><button style="flex:1" class="'+(on?'on':'')+'" onclick="pfSet(1)">Bật (30 khung/giây)</button><button style="flex:1" class="'+(on?'':'on')+'" onclick="pfSet(0)">Tắt</button></div>'+
    '<small>Phòng chỉ vẽ lại 30 lần mỗi giây thay vì 60: đỡ tốn pin và đỡ nóng máy, mèo vẫn đi lại đúng tốc độ, chỉ hơi kém mượt.</small></div>'+P0.apply(this,arguments)}}
