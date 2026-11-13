"use strict";
/* ============ CHỮ CỦA CÁC MẸO THÊM VÀ HAI CHƯƠNG SỔ TAY (2026-11-13) ============
   Chỉ có chữ. Nạp ngay sau js/tut-text.js, trước js/stray-ui.js, js/garden-ui.js, js/tutorial.js: chương Sổ tay phải chèn
   trước khi js/tut-wx.js bọc danh sách chương bằng getter. Logic của các mẹo ở js/tut-more.js.
   - Mẹo: thêm vào TUT_TEXT.hints (mỗi phần tử là một khung, tối đa 2 câu). gardenBox, gardenPond là chữ của mẹo `garden`
     khi mẹo hiện lần đầu ở bảng vườn thay vì ở Cửa hàng.
   - Sổ tay: chương `compat` ngay sau `detail`, chương `bed` ngay sau `room`.
   Số trong chữ đọc từ dữ liệu game (CPC, FURN, DRINKS, ACH...) để đổi cân bằng thì chữ đổi theo. */
(()=>{
  if(typeof TUT_TEXT==='undefined')return;
  const num=v=>String(v).replace('.',',');
  const achN=typeof ACH!=='undefined'?ACH.length:111,achXu=typeof ACH_XU!=='undefined'?ACH_XU:30;

  /* ---------- mẹo "lần đầu chạm tới" ---------- */
  Object.assign(TUT_TEXT.hints,{
    cpfit:[
      'Dòng này là các bé hợp với căn phòng đang xem: ♥ là rất hợp, ✓ là hợp.',
      'Mặt sáng là bé bạn đang có, bấm vào để chuyển bé sang phòng này. Rê chuột hoặc nhấn giữ để xem lý do.'],
    cpwarn:[
      'Ơ, dấu ! đỏ kìa: có bé đang ở phòng không hợp nên kém vui.',
      'Chuyển bé sang phòng mà dòng này gợi ý nhé. Nhà đông thì vào tab Mèo bấm ✨ Xếp gợi ý, tớ tính giúp cả đàn.'],
    cparr:[
      'Nhà đông vui rồi đấy! Bấm ✨ Xếp gợi ý, tớ tính xem bé nào nên ở phòng nào để cả đàn vui nhất.',
      'Bạn được xem trước danh sách chuyển phòng. Bấm Áp dụng thì các bé mới dọn đi.'],
    cpalbum:[
      'Bộ lọc này chỉ ra giống nào hợp một căn phòng hay thích một món ăn.',
      'Tiện lắm khi bạn muốn biết nên săn bé nào cho căn phòng mới mua!'],
    cpmeal:[
      'Mặt mèo cạnh mỗi món là các bé hợp món đó: ♥ thường là món khoái khẩu, ✓ là món đang có ích cho bé.',
      'Rê chuột hoặc nhấn giữ vào mặt bé để xem lý do.'],
    bed:[
      'Phòng có ổ ngủ rồi! Chạm vào ổ để chọn bé đi ngủ: ngủ trong ổ hồi năng lượng ⚡ nhanh gấp mấy lần.',
      'Bé tự dậy khi đầy năng lượng. Cần bé dậy sớm thì chạm lại vào ổ rồi bấm Đuổi ra.'],
    quest:[
      'Nút 📜 Nhiệm vụ đây: mỗi giờ có 2 việc nhanh, mỗi ngày có 3 việc lớn, làm xong được xu và vé.',
      'Trong đó còn có Điểm danh mỗi ngày. Số đỏ trên nút là phần thưởng đang chờ bạn nhận.'],
    achtab:[
      'Tủ cúp của bạn đây, có '+achN+' thành tựu! Đạt cái nào là được '+achXu+' xu ngay, không cần bấm nhận.',
      'Thanh tiến độ cho biết còn bao xa. Cứ chơi bình thường là cúp tự về.'],
    wish:[
      'Có bé đang ước một điều 💭! Dòng 💭 dưới nút Cho ăn ghi bé muốn gì và còn bao lâu.',
      'Làm đúng trước khi hết giờ thì được xu và +8 độ vui. Lỡ hết giờ cũng không bị phạt đâu.'],
    garden:[
      'Vườn nhỏ mở rồi! Mục 🌱 Vườn nhỏ bán chậu cây để trồng cỏ mèo và rau; lên cấp nữa có luống rau và hồ cá.',
      'Chậu chỉ đặt được ở phòng ngoài trời hoặc Nhà kính. Mua ở phòng khác thì chậu nằm trong Kho đồ.'],
    gardenBox:[
      'Bảng chăm vườn đây. Chậu trống thì chọn hạt để gieo, cây chín thì bấm 🧺 Thu hoạch.',
      'Đất khô thì bấm 💧 Tưới, trời mưa cây tự được tưới. Rau trong Giỏ vườn nấu được thành thức ăn cho mèo.'],
    gardenPond:[
      'Hồ cá đây! Cho cá ăn thì cứ vài giờ hồ lại có thêm một chú cá con.',
      'Cá dư bán lấy xu được. Cá không bao giờ chết đói, bạn yên tâm.'],
    stray:[
      'Có bé đang 😾 giận dỗi vì bị bỏ bê: đói, khát, buồn hoặc yếu cùng lúc.',
      'Cho ăn, cho uống, vuốt ve bé ngay nhé. Để lâu nữa bé bỏ nhà đi lang thang, phải đi tìm mới về.']
  });

  /* ---------- Sổ tay ---------- */
  if(!TUT_TEXT.book)return;
  const P=TUT_TEXT.book.pages;
  const after=(id,page)=>{if(P.some(p=>p.id===page.id))return;const i=P.findIndex(p=>p.id===id);P.splice(i<0?P.length:i+1,0,page)};

  // --- chương Gợi ý tương thích: số lấy từ CPC, tên phòng, món, nước lấy từ dữ liệu ---
  if(typeof CPC!=='undefined'&&typeof ROOMS!=='undefined'&&typeof TRAITS!=='undefined'&&typeof FOODS!=='undefined'){
    const C=CPC,T=Object.values(TRAITS),names=L=>L.map(x=>x.n).join(', ');
    const tr=k=>T.find(t=>t.e&&t.e[k]!=null),sun=tr('outdoor'),jea=tr('bigRoom'),pk=tr('picky');
    const likes=T.filter(t=>t.e&&t.e.like),lp=likes.map(t=>t.e.like[1]);
    const likeN=[...new Set(likes.map(t=>t.e.like[0]))].map(f=>f==='tree'?'tháp mèo hoặc đồ leo trèo nhiều tầng':FURN[f].n.toLowerCase()).join(', ');
    const pool=names(ROOMS.filter(r=>r.water)),night=names(ROOMS.filter(r=>r.night)),slow=names(ROOMS.filter(r=>r.hunger&&r.hunger<1));
    const D=typeof DRINKS!=='undefined'?DRINKS:[],dn=f=>names(D.filter(f))||'loại nước phù hợp';
    const low=typeof WXC!=='undefined'?WXC.water.low:25;
    after('detail',{id:'compat',ic:'❤',t:'Gợi ý tương thích',p:[
      'Dấu trên mặt mèo cho biết bé hợp tới đâu với một căn phòng, một món ăn hay một loại nước. Có bốn mức: ♥ Rất hợp (xanh lục), ✓ Hợp (xanh biển), không có dấu là Bình thường, ! Không hợp (đỏ). Mức nào cũng có dấu riêng, không chỉ khác màu.',
      'Gặp ở đâu: dòng "Mèo hợp với phòng này" dưới mỗi phòng ở tab Phòng; bảng Cho ăn và Cho uống (mặt các bé hợp từng món, từng loại nước); khung "Hợp với bé" trong màn thông tin mèo; bộ lọc theo sự phù hợp ở tab Mèo và Sưu tập.',
      'Icon sáng là bé bạn đang có: bấm vào để đặt nhanh bé vào phòng đó. Icon mờ là bé bạn chưa có, bóng đen là bé chưa từng gặp. Rê chuột, hoặc nhấn giữ trên màn cảm ứng, để xem lý do.',
      'Nút ✨ Xếp gợi ý ở tab Mèo tính cách xếp cả đàn vào các phòng đang có sao cho vui nhất. Bạn xem trước danh sách bé cần chuyển; bấm Áp dụng thì các bé mới đổi phòng. Bé đang vắng nhà giữ nguyên phòng.',
      'Quy tắc về phòng: phòng ngoài trời ('+names(ROOMS.filter(r=>r.outdoor))+') rất hợp bé '+sun.n+' (+'+sun.e.outdoor+' vui). '+pool+' rất hợp bé thích nước (+'+C.waterUp+' vui), không hợp bé sợ nước (−'+(-C.waterDn)+' vui). Phòng đang có món nội thất bé thích ('+likeN+') thì bé thêm '+Math.min(...lp)+' tới '+Math.max(...lp)+' vui; đồ hỏng không tính. Ở cùng phòng với bạn thân thì bé vui hơn. Bé '+jea.n+' không hợp phòng có từ '+C.bigAt+' mèo (−'+(-jea.e.bigRoom)+' vui). '+night+' hợp bé có thưởng xu ban đêm; '+slow+' hợp bé mau đói vì ở đó đói chậm hơn. Phòng chờ thì bé nào cũng −'+(-C.wait)+' vui.',
      'Quy tắc về món ăn: món khoái khẩu là ♥ Rất hợp (no hơn 20%, +10 vui, buff lâu gấp rưỡi). Bé '+pk.n+' không hợp Hạt khô vì ăn chỉ no một nửa. Ngoài ra game xét tình trạng của bé lúc đó: bé mệt (năng lượng dưới '+C.tired.at+') hợp món cho từ '+C.tired.en+' năng lượng ('+names(FOODS.filter(f=>(f.en||0)>=C.tired.en))+'); bé buồn (vui dưới '+C.sad.at+') hợp món cho từ '+C.sad.hp+' vui ('+names(FOODS.filter(f=>(f.hp||0)>=C.sad.hp))+'); bé đói (no dưới '+C.hungry.at+') hợp món no nhiều ('+names(FOODS.filter(f=>f.full>=C.hungry.full))+'); bé sắp kiệt sức (năng lượng dưới '+C.drain.at+') không hợp '+names(FOODS.filter(f=>(f.en||0)<0))+' vì món này trừ năng lượng.',
      'Nước uống: game chưa có sở thích nước theo giống, nên nước được gợi ý theo tình trạng của bé lúc đó. Bé đang nóng rất hợp nước hạ nhiệt ('+dn(d=>d.cool)+'); bé sức khỏe dưới '+C.weak.at+' hoặc đang ốm hợp nước cộng sức khỏe ('+dn(d=>d.he)+'); bé kém thoải mái (dưới '+C.uncomf.at+') hợp '+dn(d=>d.cf)+'; bé rất khát (nước dưới '+low+') hợp loại cho từ '+C.parched.wa+' nước. Vì xét theo tình trạng nên gợi ý món ăn và nước uống đổi theo thời gian.']});
  }

  // --- chương Ổ ngủ: số chỗ và tốc độ hồi đọc từ FURN[..].bed ---
  if(typeof FURNS!=='undefined'&&typeof FURN!=='undefined'){
    const B=FURNS.filter(f=>f.bed),en=B.map(f=>f.bed.en),cap=id=>FURN[id]&&FURN[id].bed?FURN[id].bed.at.length:0,nm=id=>FURN[id].n;
    const grp=n=>B.filter(f=>['dblbed','woodhouse','longbed','kennel','mansion'].includes(f.id)&&f.bed.at.length===n).map(f=>f.n).join(' và ');
    const big=[...new Set(['dblbed','woodhouse','longbed','kennel','mansion'].map(cap))].filter(Boolean).sort((a,b)=>a-b);
    if(B.length)after('room',{id:'bed',ic:'😴',t:'Ổ ngủ',p:[
      'Ổ ngủ là các món nệm, ổ, giỏ, lều, nhà và chuồng cho mèo ở Cửa hàng, mục Giường & nệm; mô tả món nào có chữ "Ổ ngủ" là dùng được. Ngủ trong ổ, bé hồi năng lượng ⚡ nhanh gấp '+num(Math.min(...en))+' tới '+num(Math.max(...en))+' lần tùy món.',
      'Ở tab Phòng, chạm vào ổ (chỗ không bị mèo che) để mở bảng của ổ: các bé ở nhà trong phòng, bé mệt nhất đứng đầu. Bấm Cho ngủ, bé tự đi tới ổ rồi nằm xuống. Bé đang đầy năng lượng thì chưa buồn ngủ; bé đang ngủ ở ổ khác thì bấm Chuyển sang.',
      'Bé tự dậy khi năng lượng đầy 100; bé do bạn cho đi ngủ thì game báo "Ngủ dậy". Lúc rảnh, các bé cũng tự tìm ổ còn chỗ để nằm và được hồi năng lượng y như vậy.',
      'Cần bé dậy sớm (ví dụ để đi viễn chinh): chạm vào ổ rồi bấm Đuổi ra hoặc Đuổi hết ra, hay mở màn thông tin của bé và bấm Đánh thức. Bé đổi phòng, đi viễn chinh, hoặc ổ bị cất kho, bị bán thì bé cũng thôi ngủ.',
      'Mỗi ổ có số chỗ riêng: ổ, giỏ nhỏ 1 bé; nệm 2 bé; '+big.map(n=>grp(n)+' '+n+' bé').join('; ')+'. Bảng của ổ ghi rõ ổ chứa mấy bé và đang có ai ngủ. Nhà và chuồng chỉ thêm chỗ ngủ, không làm căn phòng chứa được nhiều mèo hơn.',
      'Khi đã mở thời tiết, chăn điện, giường sưởi, thảm làm mát cũng là ổ ngủ, và còn sưởi ấm hoặc làm mát riêng cho bé nằm trên.']});
  }
})();
