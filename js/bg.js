"use strict";
/* ============ CHẠY NỀN: ĐỒNG HỒ GAME KHI TRANG BỊ ẨN (2026-11-20) ============
   Nạp ngay sau js/app.js (sau mọi file bọc tick, như js/visit.js). Không đổi luật chơi.

   Vì sao cần: nhịp 1 giây của ui.js gọi tick((now() − lastTick)/1000). Trang ẩn (thu nhỏ cửa sổ app, ẩn vào khay, tab nền) thì Chromium
   hãm hẹn giờ: 1 lần/giây, sau 5 phút còn 1 lần/phút; máy ngủ thì có thể vắng hàng giờ. Một bước tick(60) không giống 60 bước tick(1):
   bữa ăn 6 giây, máy cho ăn tự đổ mỗi 10 phút, buff hết hạn, hẹn giờ của thời tiết, bệnh, vườn... đều so now() với mốc thời gian.

   - tick(dt) với dt > BG.split (1,5 giây) và không phải chế độ bù vắng mặt: chia thành các bước đều nhau ≤ 1 giây (tối đa BG.maxN bước,
     dt dài hơn thì bước dài hơn chút), mỗi bước chạy với đồng hồ đặt đúng lúc của bước đó (Date.now tạm thay trong lúc chạy, trả lại
     ngay sau; now() và đồng hồ thời tiết đều đọc Date.now). Kết quả giống hệt khi tick đều mỗi giây (tools/bgtest.js).
     Không dùng TOFF vì TOFF khác 0 nghĩa là "đang bù lúc vắng" (event.js không cộng tiền, meal.js cộng vào tổng kết Lúc bạn vắng...).
   - dt > BG.live (10 phút: máy ngủ, tiến trình bị treo): coi như người chơi đã thoát rồi vào lại, bù y như load() của game.js
     (tối đa 8 giờ, bước 10 phút, sim=true, tắt thông báo, gom tổng kết AWAY rồi báo "Lúc bạn vắng").
   - Trang ẩn: nhịp 1 giây chỉ chạy luật chơi. renderTopSoft, showFol, renderPanel(true) bỏ qua (không ai nhìn); thông báo (toast) xếp
     hàng (tối đa BG.qmax, gộp theo key như toast) và hiện khi trang hiện lại. Trang hiện lại: bù ngay phần thời gian còn thiếu
     (không chờ nhịp 1 giây kế tiếp), vẽ lại thanh trên, panel, khung theo dõi.
   - Mèo ở phòng đang xem: lúc trang ẩn requestAnimationFrame dừng nên bé không đi tới bát được; js/meal.js coi bé là "không nằm
     trong phòng đang xem" khi document.hidden, nên bé tới bát theo eta như ở phòng khác (trước đây bé bị hủy bữa vì "kẹt").
   - Việc chỉ xảy ra khi trang hiện, vẫn đúng: hạt, hoạt ảnh mèo, khách lạ (critStep), chơi với bé (play-ui dừng khi ẩn), nhạc nền
     (bgm.js tự tạm dừng theo visibilitychange), hành động riêng 5★ trong phòng (thưởng +2 xu của Thần Tài chỉ khi bé diễn trên màn hình). */
const BG={split:1.5,step:1,maxN:300,live:600,qmax:10,q:[],n:0,away:0};
{const T0=tick;
  tick=function(dt,sim){
    if(sim||!(dt>BG.split))return T0.apply(this,arguments);
    if(dt>BG.live)return bgAway(dt,T0);
    const n=Math.min(BG.maxN,Math.ceil(dt/BG.step-1e-9)),h=dt/n,D0=Date.now,base=D0.call(Date);BG.n++;
    let r;BG.inStep=1;
    try{for(let i=1;i<=n;i++){const t=Math.round(base-(dt-i*h)*1000);Date.now=()=>t;r=T0.call(this,h,false)}}
    finally{Date.now=D0;bgSaveNow()}
    return r;
  };
}
// vắng lâu (máy ngủ): bù như lúc tải game (game.js load())
function bgAway(dt,T0){
  BG.away++;
  const el=Math.min(dt,8*3600),nt=notify;notify=()=>{};AWAY.n=AWAY.coins=AWAY.cost=0;
  let left=el;BG.inStep=1;
  try{TOFF=-el*1000;while(left>0){const st=Math.min(600,left);TOFF+=st*1000;left-=st;T0(st,true)}}
  finally{TOFF=0;notify=nt;bgSaveNow()}
  scratchTick();
  if(AWAY.n&&typeof toast==='function')toast(AWAY.n+' suất đã được các bé tự ra ăn'+(AWAY.cost?' · máy cho ăn tốn '+AWAY.cost+' xu':''),{type:'feed',title:'Lúc bạn vắng',coins:AWAY.coins,ms:5200});
}
// save() gọi giữa các bước bù (bé bỏ nhà đi, về nhà...) được hoãn tới khi bù xong: một lần ghi, `last` là giờ thật (không lùi về giờ của bước)
{const O=save;save=function(){if(BG.inStep){BG.saveP=1;return}return O.apply(this,arguments)}}
function bgSaveNow(){BG.inStep=0;if(BG.saveP){BG.saveP=0;save()}}
const bgHidden=()=>typeof document!=='undefined'&&!!document.hidden;

if(typeof document!=='undefined'&&typeof renderTopSoft==='function'){
  // trang ẩn: nhịp 1 giây của ui.js chỉ còn luật chơi
  {const F=renderTopSoft;renderTopSoft=function(){if(bgHidden())return;return F.apply(this,arguments)}}
  {const F=showFol;showFol=function(){if(bgHidden())return;return F.apply(this,arguments)}}
  {const F=renderPanel;renderPanel=function(soft){if(soft===true&&bgHidden())return;return F.apply(this,arguments)}}
  // thông báo lúc ẩn: xếp hàng, hiện lại khi người chơi quay về
  {const F=toast;toast=function(msg,o){if(!bgHidden())return F.apply(this,arguments);BG.q.push([msg,o]);if(BG.q.length>BG.qmax)BG.q.shift()};
    if(notify===F)notify=toast;
    BG.show=()=>{const q=BG.q.splice(0);q.forEach(a=>{try{F.apply(null,a)}catch(e){}})}}
  // trang hiện lại: bù ngay phần thời gian còn thiếu rồi vẽ lại
  BG.wake=function(){
    if(bgHidden())return;
    try{const n=now();if(n-lastTick>1000){tick((n-lastTick)/1000);lastTick=n}}catch(e){}
    try{renderTopSoft();if(fol)showFol();if($('modal').style.display!=='flex'&&((tab==='home'&&!edit)||tab==='trip'))renderPanel(true)}catch(e){}
    BG.show();
  };
  document.addEventListener('visibilitychange',()=>{if(!bgHidden())BG.wake()});
  addEventListener('pageshow',()=>BG.wake());
}
