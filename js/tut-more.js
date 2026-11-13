"use strict";
/* ============ MẸO "LẦN ĐẦU CHẠM TỚI" THÊM (2026-11-13) ============
   Mẹo cho các tính năng chưa có mẹo ở js/tut-hints.js: hệ gợi ý tương thích (cpfit, cpwarn, cparr, cpalbum, cpmeal),
   ổ ngủ (bed), nhiệm vụ (quest), thành tựu (achtab), ước muốn (wish), vườn nhỏ (garden), bé giận dỗi (stray).
   Chữ ở js/tut-more-text.js (TUT_TEXT.hints). Nạp sau js/tutorial.js, js/tut-hints.js.
   Cách làm giống js/tut-hints.js: mỗi 1,2 giây xét bảng HINTS theo thứ tự ưu tiên, mẹo nào đúng ngữ cảnh VÀ đích đang lộ ra
   thì giao cho TUT.hint. Chỉ TUT ghi cờ S.tut.hints[id] (mỗi mẹo hiện đúng một lần; người chơi cũ có hints.all nên không thấy).
   File này không thay đổi trạng thái hay luật chơi. Các lớp cp-* do js/compat-*.js vẽ: chưa có phần tử thì mẹo tự bỏ qua. */
(()=>{
  if(typeof TUT==='undefined'||typeof TUT_TEXT==='undefined')return;
  const q=s=>document.querySelector(s);
  const TX=TUT_TEXT.hints;
  const GAP=4000,AFTER_TUT=12000;   // nghỉ giữa hai mẹo; nghỉ lâu hơn ngay sau hướng dẫn tân thủ để người mới không bị dồn mẹo
  let holdUntil=0,strict=false;
  const modalOn=()=>q('#modal').style.display==='flex';
  const guided=()=>TUT.active()||TUT.replaying();
  const fn=n=>typeof window[n]==='function'&&window[n]();
  const bookOpen=()=>(typeof bookOn==='function'&&bookOn())||(typeof pwBookOn==='function'&&pwBookOn())||(typeof medOn==='function'&&medOn());

  // Không khoanh phần tử bị ẩn, nằm ngoài màn hình hoặc bị khung cuộn cắt gần hết (cùng cách với js/tut-hints.js).
  function visible(el){
    if(!el||!el.isConnected||!el.getClientRects().length)return null;
    const r=el.getBoundingClientRect();
    let left=Math.max(0,r.left),top=Math.max(0,r.top);
    let right=Math.min(document.documentElement.clientWidth,r.right),bottom=Math.min(innerHeight,r.bottom);
    for(let p=el;p;p=p.parentElement){
      const css=getComputedStyle(p);
      if(css.display==='none'||css.visibility==='hidden'||css.visibility==='collapse'||Number(css.opacity)===0)return null;
      if(p===el)continue;
      const b=p.getBoundingClientRect();
      if(/auto|scroll|hidden|clip/.test(css.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right)}
      if(/auto|scroll|hidden|clip/.test(css.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom)}
    }
    // đích phải lộ ra ít nhất 20px chiều cao (hoặc trọn chiều cao nếu thấp hơn), không khoanh một mép vài điểm ảnh
    if(right-left<Math.min(20,r.width)||bottom-top<Math.min(20,r.height))return null;
    // lúc xét để giao mẹo (không phải mỗi khung hình): giữa vùng lộ ra không được bị lớp khác che, ví dụ thanh chỉ số dính trên cùng
    if(strict){const e=document.elementFromPoint((left+right)/2,(top+bottom)/2);if(e&&!el.contains(e)&&!e.contains(el))return null}
    return {left,top,width:right-left,height:bottom-top};
  }
  const home=()=>tab==='home'&&!edit;
  const dom=(s,up)=>()=>{const e=q(s);return visible(e&&up?e.closest(up):e)};

  /* ---------- ngữ cảnh riêng của từng mẹo ---------- */
  const inside=(b,w)=>b.left>=w.left&&b.top>=w.top&&b.left+b.width<=w.left+w.width&&b.top+b.height<=w.top+w.height;
  // ổ ngủ đầu tiên còn dùng được trong phòng đang xem
  const bedIn=()=>S.items.find(i=>i.room===cur&&!i.broken&&FURN[i.fid]&&FURN[i.fid].bed);
  // ổ nằm trọn trong khung nhìn thì khoanh đúng cái ổ (tính như catRect của lõi), không thì khoanh cả khung phòng
  function bedRect(){
    const w=visible(q('#roomwrap')),it=w&&bedIn();if(!it)return null;
    const cv=q('#room'),f=FURN[it.fid],r=cv.getBoundingClientRect(),s=cv.clientWidth/VW;
    const b={left:r.left+cv.clientLeft+(it.x-f.w/2-camX)*s,top:r.top+cv.clientTop+(it.y-f.h-camY)*s,width:f.w*s,height:f.h*s};
    return inside(b,w)?b:w;
  }
  // dòng ước muốn dưới nút Cho ăn; dòng đó đang khuất (chưa cuộn tới) thì khoanh khung phòng, nơi bé đang hiện bong bóng 💭.
  // Không khoanh riêng bé đó: bé đi lại làm bong bóng mẹo và nút Đã hiểu chạy theo, khó bấm.
  function wishRect(){
    const d=q('#panel .card > div[style*="font-size:24px"]');
    return visible(d&&d.closest('.card'))||visible(q('#roomwrap'));
  }
  const wishHere=()=>typeof wish!=='undefined'&&!!wish&&wish.rid===cur&&typeof wishOn==='function'&&wishOn();
  const sulking=()=>typeof strayMood==='function'&&typeof strayOpen==='function'&&strayOpen()&&S.cats.some(c=>strayMood(c)&&!onTrip(c.uid));
  const gardenLv=()=>typeof GD_LV!=='undefined'&&S.level>=GD_LV;
  const gardenBox=()=>modalOn()&&!!q('#mbox .gd');
  // bảng vườn đang mở là hồ cá thì dùng lời về cá, còn lại là lời về chậu cây
  function gardenLines(){
    const it=typeof GDV!=='undefined'&&GDV&&GDV.iid!=null?S.items.find(i=>i.iid===GDV.iid):null;
    return it&&it.fp&&!it.gd?TX.gardenPond:TX.gardenBox;
  }
  const mealFans=()=>modalOn()&&!!q('#mbox .ml')&&!!q('#mbox .cp-fans .fc');

  /* ---------- bảng mẹo, xếp theo thứ tự ưu tiên ----------
     when(): ngữ cảnh (rẻ, xét trước); target(): vùng khoanh, null là đích chưa lộ ra; modal: mẹo gắn với hộp thoại đang mở;
     lines(): chữ riêng theo ngữ cảnh (bỏ trống thì lõi lấy TUT_TEXT.hints[id]);
     top: đích nằm ở thanh trên cùng, nơi thông báo hiện ra, nên đợi hết thông báo rồi mới hiện. */
  const HINTS=[
    {id:'stray',top:1,when:sulking,target:()=>{const t=q('#panel .st-sulk');return visible(t&&t.closest('.card'))||visible(q('#top > .chip:nth-child(3)'))}},
    {id:'cpmeal',modal:1,when:mealFans,target:dom('#mbox .cp-fans .fc','.cp-fans')},
    {id:'garden',modal:1,when:gardenBox,target:()=>visible(q('#mbox .gd-act')||q('#mbox .gd')),lines:gardenLines},
    {id:'wish',when:()=>home()&&wishHere(),target:wishRect},
    {id:'cpwarn',when:home,target:dom('#panel .cp-warn')},
    {id:'cparr',when:()=>tab==='cats'&&S.cats.length>=4&&ownedRooms().length>=2,target:dom('#panel .cp-arr')},
    {id:'cpalbum',when:()=>tab==='album',target:dom('#panel .cp-filter')},
    {id:'achtab',when:()=>tab==='ach',target:dom('#panel > :first-child')},
    {id:'garden',when:()=>tab==='shop'&&gardenLv(),target:dom('#panel button[onclick^="shopT=\'garden\'"]')},
    {id:'bed',when:()=>home()&&homeCats(cur).length>0&&!!bedIn(),target:bedRect},
    {id:'cpfit',when:home,target:dom('#panel .cp-room .fc','.cp-room')},
    {id:'quest',top:1,when:()=>true,target:dom('#top .qchip')}
  ];

  /* ---------- xét và giao mẹo ---------- */
  function check(){
    const t=Date.now(),st=S.tut;
    // đang hướng dẫn (luồng chính, luồng phụ, xem lại) hoặc đang có một mẹo: không chen vào, và nghỉ một nhịp sau đó
    if(guided()){holdUntil=t+AFTER_TUT;return}
    if(q('.tut-tip.on')){holdUntil=Math.max(holdUntil,t+GAP);return}
    if(!st||!st.done||st.fl||!S.cats.length||(st.hints&&st.hints.all))return;
    if(document.hidden||q('#gz').className||bookOpen()||fn('needLandscape'))return;
    const m=modalOn(),toastOn=!!q('#toast .tst:not(.out)');
    for(const h of HINTS){
      if(TUT.seen(h.id)||!!h.modal!==m)continue;
      if(!h.modal&&t<holdUntil)continue;
      if(h.top&&toastOn)continue;
      if(!h.when())continue;
      strict=true;let r;try{r=h.target()}finally{strict=false}
      if(!r)continue;
      // đích trả null khi ngữ cảnh đã đổi (đổi tab, đóng hộp thoại) để lõi thôi khoanh
      const live=()=>!guided()&&h.when()?h.target():null;
      if(TUT.hint(h.id,{target:live,modal:h.modal?1:0,lines:h.lines?h.lines():null}))holdUntil=t+GAP;
      return;
    }
  }
  setInterval(check,1200);
  // vừa đổi tab hay vừa mở bảng: xét sớm hơn nhịp 1,2 giây, sau khi giao diện vẽ xong (và sau mẹo `cats` của js/tut-hints.js)
  const soon=()=>setTimeout(check,350);
  ['setTab','openFeed','openWater','openGarden'].forEach(n=>TUT.on(n,soon));
})();
