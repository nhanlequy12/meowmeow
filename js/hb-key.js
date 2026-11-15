"use strict";
/* Sổ tay dễ đọc: chia nhóm, ô tìm kiếm, nhãn MỚI cho chương chưa đọc, khung "Điều cần nhớ" ở đầu mỗi chương,
   phần chi tiết gập lại khi dài, in đậm nhãn đầu đoạn và các con số.
   Nạp SAU mọi file thêm chương hoặc bọc THB_BOOK.open (tut-wx, tut-pw, tut-med) để lớp bọc này ở ngoài cùng.
   Thêm chương mới: thêm một dòng vào HB_KEY (g: nhóm, h: một dòng mô tả ngắn, k: 2–3 ý chính, **chữ** để in đậm).
   Chương không có trong HB_KEY vẫn hiện, nằm ở nhóm "Khác", không có khung Điều cần nhớ. */
const HB_GRP=[
  ['start','🌱 Bắt đầu'],['cats','🎁 Gacha và mèo'],['trip','🧭 Viễn chinh và tiến độ'],['wx','🌦 Thời tiết và sức khỏe'],
  ['pw','⚡ Điện năng'],['home','🏠 Nhà cửa'],['fun','✨ Hoạt động thêm'],['net','🌐 Chơi cùng bạn'],['set','⚙ Cài đặt'],['etc','📚 Khác']];
const HB_KEY={
  start:{g:'start',h:'Vòng chơi 10 phút',k:['Khoảng **10 phút** ghé một lần: nhận viễn chinh, cho ăn, vuốt ve.','Xu 🪙 mua mọi thứ; vé 🎟 quay một lượt gacha.','Game **tự lưu**, không cần bấm lưu.']},
  room:{g:'start',h:'Xem phòng, vuốt ve',k:['Chạm **một lần** vào mèo: vuốt ve (10 phút/bé, xu = số sao).','Chạm **hai lần**: camera theo dõi bé.','Kéo để xem khắp phòng; ＋ － hoặc Ctrl + lăn để phóng to.']},
  stats:{g:'start',h:'No, năng lượng, vui',k:['**No dưới 20**: bé đói, không đi viễn chinh được.','**Năng lượng** trả cho mỗi chuyến đi; ở nhà hồi khoảng 1 điểm/phút.','**Vui** nhân xu viễn chinh từ ×0,8 tới ×1,2.']},
  feed:{g:'start',h:'Mua vào kho, đổ vào bát',k:['Bấm **Cho ăn** → chọn món → game gợi ý số suất vừa đủ.','Bé ăn xong một suất thì **cảm ơn 4 xu**.','Thiếu suất thì có bé nhịn: **mua thêm bát**.']},
  water:{g:'start',h:'Rót nước cho bát nước',k:['Bấm **💧 Cho uống** cạnh nút Cho ăn; nước phải mua, mỗi chai một lượt.','Bé tự đi uống khi nước **dưới 60**.','Máy lọc nước chỉ rót nước **có sẵn trong kho**.']},
  play:{g:'start',h:'Cần câu lông vũ, đèn laser',k:['Từ **cấp 2**, nút 🪶 Chơi trên tab Phòng, mỗi lượt 20 giây.','Bé vồ trúng: **+6 tới +8 vui**, 10 phút/bé một lần.','Bé mệt, đang ngủ, đang ăn thì không chơi.']},
  bed:{g:'start',h:'Cho bé ngủ hồi sức',k:['**Chạm vào ổ** trong phòng → Cho ngủ.','Ngủ ổ hồi năng lượng **nhanh 2,5–5 lần**.','Cần bé dậy sớm: **Đuổi ra** hoặc Đánh thức.']},
  gacha:{g:'cats',h:'Tỉ lệ và bảo hiểm',k:['**100 xu hoặc 1 vé** một lượt; 5★ chỉ 1%.','**10 lượt** chắc chắn có từ 4★.','**40 lượt** chắc chắn có 5★; tab Gacha ghi còn bao nhiêu.']},
  trait:{g:'cats',h:'Nhãn xanh, hồng, vàng',k:['Số thuộc tính = số sao.','**Xanh** tốt, **hồng** tật xấu, **vàng** độc quyền.','Chạm vào nhãn để đọc tác dụng.']},
  detail:{g:'cats',h:'Mọi thứ về một bé',k:['**Chạm vào thẻ mèo** để mở.','Có hồ sơ, chỉ số, thuộc tính, phòng hợp, phụ kiện.','Đổi tên, chuyển phòng, phóng sinh ở cuối.']},
  five:{g:'cats',h:'Intro, hoạt ảnh, trang phục hiếm',k:['Mỗi 5★ có **intro riêng** và hành động riêng trong phòng.','Khoảng **10%** ra trang phục hiếm: sao 7 màu, thuộc tính riêng.','Màu lông hiếm chỉ có ở giống thật, luôn 4★.']},
  cats:{g:'cats',h:'Đổi phòng, phóng sinh',k:['Tab **Mèo**: lọc, sắp xếp, kéo thẻ để đổi phòng.','Hết chỗ thì bé vào **Phòng chờ** (−10 vui).','Phóng sinh cho xu theo sao; 4★–5★ được hỏi lại.']},
  bond:{g:'cats',h:'Tim, mèo trùng',k:['Chăm bé để lên **tim** (tối đa 5); mỗi tim **+4% xu** viễn chinh.','Tối đa **40 điểm/ngày** từ chăm sóc.','Mèo trùng loài: **Kết thân** thay vì phóng sinh.']},
  compat:{g:'cats',h:'Bé nào hợp phòng, món nào',k:['**♥ Rất hợp**, **✓ Hợp**, không dấu là bình thường, **! Không hợp**.','Nút **✨ Xếp gợi ý** ở tab Mèo xếp cả đàn cho vui nhất.','Tab Phòng ghi sẵn **nên cho phòng này ăn, uống gì**.']},
  album:{g:'cats',h:'Bộ sưu tập',k:['Mọi giống và mèo trang phục đã gặp.','Chạm để xem các màu lông, trang phục.','Bé 5★ có nút **xem lại intro**.']},
  acc:{g:'cats',h:'Mũ, nơ, vòng cổ',k:['Từ **cấp 4**, Cửa hàng › 🎀 Phụ kiện.','Mỗi bé **một món đầu, một món cổ**, +1 tới +2 vui.','Tháo ra thì món về kho, đeo cho bé khác được.']},
  trip:{g:'trip',h:'Nguồn xu chính',k:['Chọn ô → điểm đến → chạm vào bé; bé cần **no trên 20** và đủ năng lượng.','Chuyến ngắn **nhiều xu mỗi phút**, chuyến dài đỡ phải ghé.','Ô viễn chinh mở thêm ở **cấp 3, 5, 7, 9**.']},
  supply:{g:'trip',h:'Chuẩn bị trước chuyến đi',k:['Màn chọn mèo ghi **thời tiết điểm đến** và tỉ lệ thành công.','Trời xấu có thể **rút lui sớm**, bé vẫn về an toàn.','Mang **vật phẩm sinh tồn** (tối đa 4 loại) để giảm rủi ro.']},
  level:{g:'trip',h:'Lộ trình mở khóa',k:['Mọi việc đều cho kinh nghiệm; cấp tối đa **18**.','**Bấm ô Cấp** trên cùng để xem mỗi cấp mở gì.','Thứ đã mở thì không khóa lại.']},
  quest:{g:'trip',h:'Việc mỗi giờ, mỗi ngày',k:['**2 nhiệm vụ mỗi giờ**, **3 nhiệm vụ mỗi ngày**.','Quên nhận vẫn được **cộng tự động**.','Chạm **khách lạ** chạy qua phòng để lấy xu, có khi có vé.']},
  wish:{g:'trip',h:'Bong bóng 💭',k:['Bé hiện 💭: muốn vuốt ve, thèm món, muốn xem bắt khách.','Làm đúng trước khi hết giờ: **xu và +8 vui**.','Hết giờ thì thôi, **không bị phạt**.']},
  checkin:{g:'trip',h:'Quà 7 ngày',k:['Mỗi ngày bấm **Điểm danh** trong bảng 📜 Nhiệm vụ.','**Ngày 7 có 3 vé**.','Bỏ lỡ một ngày thì về Ngày 1.']},
  ach:{g:'trip',h:'Mục tiêu lâu dài',k:['Hơn 100 thành tựu, mỗi cái **30 xu**.','Tự cộng, **không cần bấm nhận**.','Xem tiến độ ở tab 🏆.']},
  contest:{g:'trip',h:'Mỗi ngày một chủ đề',k:['Từ **cấp 6**, gửi bé **trước 21 giờ**.','Điểm chốt **lúc gửi**: chăm bé tốt rồi hãy gửi.','Bấm **✨ Chọn giúp** để game chọn đội mạnh nhất.']},
  weather:{g:'wx',h:'Đổi mỗi 5 giờ',k:['Từ **cấp 2**. Thời tiết **đổi mỗi 5 giờ**, mỗi mùa một ngày.','Bấm **chip thời tiết** trên cùng để mở sách khí hậu.','Chip có dấu **⚠** là trời sắp xấu.']},
  climate:{g:'wx',h:'Nhiệt độ từng phòng',k:['Dòng **🌡** dưới nút Cho ăn cho biết phòng lạnh hay nóng.','Mùa đông phòng trong nhà **11–15°C**: cần sưởi.','Phòng ngoài trời chịu thời tiết **mạnh nhất**.']},
  climstat:{g:'wx',h:'Các con số có nghĩa gì',k:['Dễ chịu: **20–26°C**, độ ẩm **35–65%**.','Bé **dưới 16°C** thì lạnh, **trên 28°C** thì nóng (tính theo nhiệt độ bé cảm thấy).','Phòng thoải mái **từ 40** bé tự hồi sức khỏe, **từ 60** bé ốm khỏi dần.']},
  climfix:{g:'wx',h:'Lạnh, nóng, ướt thì làm gì',k:['Lạnh: **tắt quạt**, đặt máy sưởi, rèm giữ nhiệt.','Nóng: **tắt sưởi**, đặt quạt, rót nước.','Ướt: **mái che**, rèm chắn mưa, máy sấy lông.']},
  health:{g:'wx',h:'Sức khỏe, nước, trạng thái',k:['Thêm **Sức khỏe ❤️**, **Nước 💧**, **Thoải mái**.','Nhãn trạng thái (🥶 🥵 💦 🤒…) trên thẻ mèo cho biết bé đang bị gì.','Lúc bạn vắng, bé **không tụt quá sâu**, không ốm mới.']},
  disease:{g:'wx',h:'16 bệnh và chấn thương',k:['Từ **cấp 3**; bệnh chỉ phát sinh **lúc đang mở game**.','Bệnh nhẹ **tự khỏi** khi bé nghỉ ở phòng dễ chịu, đủ nước.','Bệnh nghiêm trọng (🔴) **chỉ bệnh viện chữa được**.']},
  medshop:{g:'wx',h:'Thuốc, bệnh viện, đồ bảo hộ',k:['Nút **🏥 Nhà thuốc** ở thanh bên trái.','Thuốc điều trị **thử tối đa 2 lần**; bệnh viện **chắc chắn khỏi** sau 60 phút.','Thiếu xu vẫn được nhận: **quỹ cứu trợ**.']},
  stray:{g:'wx',h:'Đừng bỏ bê quá lâu',k:['Từ **cấp 4**: vừa đói vừa buồn khoảng **6 giờ** thì một bé bỏ đi.','Mèo **không bao giờ chết**, bé chỉ đi lạc tạm.','Đưa về: nhờ bé khác **đi tìm** hoặc đặt **bát mồi**.']},
  power:{g:'pw',h:'Pin không bao giờ tự sạc',k:['Máy điện chạy **pin**; hết pin thì mất tác dụng.','Pin **không tự sạc**, kể cả lúc bạn vắng.','Chạm vào máy → **🔌 Sạc** ở ổ điện cùng phòng, trả xu.']},
  solar:{g:'pw',h:'Giảm 50% phí sạc',k:['Từ **cấp 6**, chỉ lắp ở **Ban công** hoặc **Sân thượng**.','Bộ lưu trữ đủ điện thì sạc **giảm 50%**.','Ban đêm và trời mưa tạo ít điện.']},
  outage:{g:'pw',h:'Mưa giông có thể mất điện',k:['Sét đánh: cả nhà **mất điện 15 phút**.','Mèo **hoảng sợ**, mất vui dần.','Làm dịu: **vuốt ve**, đèn khẩn cấp, ổ ngủ, máy phát.']},
  generator:{g:'pw',h:'Điện dự phòng ở tầng hầm',k:['Từ **cấp 14**, chỉ đặt ở **Tầng hầm**.','Tự bật khi mất điện; **tự sạc bằng xu** trước.','Máy mini không đủ cho cả 15 phút.']},
  shop:{g:'home',h:'Phòng và nội thất',k:['**17 phòng**, phòng sau chứa nhiều mèo hơn.','Vui từ nội thất **tối đa +35** mỗi phòng.','Mỗi loại đồ chỉ tính hiệu ứng **một lần**.']},
  edit:{g:'home',h:'Kéo thả đồ',k:['Bấm **✏ Sắp xếp đồ** ở tab Phòng.','Chạm một món để **xoay, cất kho, xóa** (hoàn 25%).','Trụ cào giảm khả năng **sofa bị cào**.']},
  roomup:{g:'home',h:'Thêm chỗ, thêm bonus',k:['Từ **cấp 10**, mỗi phòng nâng được **3 cấp**.','Mỗi cấp **+1 chỗ** và tăng bonus của phòng.','Nâng trọn một phòng tốn khoảng **1,4 lần** giá phòng.']},
  garden:{g:'home',h:'Trồng rau, nuôi cá',k:['Từ **cấp 4**, chỉ đặt ở phòng ngoài trời hoặc Nhà kính.','**Nhớ tưới**: đất khô lâu thì cây chết.','Nấu rau thành **suất ăn miễn phí**.']},
  photo:{g:'fun',h:'Sổ sticker',k:['Từ **cấp 2**, nút 📷 góc trên phải khung phòng.','Chụp đúng khoảnh khắc: **sticker +20 xu**, đủ trang **+1 vé**.','Ảnh chỉ ở máy này: **tải về** để giữ lâu.']},
  event:{g:'fun',h:'Lễ theo lịch thật',k:['Từ **cấp 3**: Tết, Tình nhân, Ngày của mèo, Trung thu, Halloween, Giáng sinh.','Tiền sự kiện đổi **món độc quyền**, vé, đồ theo mùa giá rẻ.','Hết sự kiện, tiền còn lại thành **2 xu mỗi đồng**.']},
  visit:{g:'fun',h:'Nhận nuôi miễn phí',k:['Từ **cấp 5**, mèo lạ ghé tối đa **4 lượt mỗi ngày**.','**Vuốt ve, mời ăn** để làm quen (đủ 100 điểm).','Bé muốn ở lại: **Nhận nuôi** hoặc để bé đi.']},
  net:{g:'net',h:'Máy chủ chung',k:['Lần đầu vào đặt **tên**.','Tự đồng bộ **30 giây** một lần.','Quà quản trị viên tới ngay khi đồng bộ.']},
  xfer:{g:'net',h:'Đổi máy giữ tiến độ',k:['Máy cũ: Cài đặt › **Chuyển sang máy khác** → mã 8 ký tự.','Mã **dùng một lần**, hết hạn sau **10 phút**.','Tạo sẵn **mã khôi phục** phòng khi mất máy.']},
  friend:{g:'net',h:'Ghé nhà, sổ tem',k:['Từ **cấp 3**, ô 👥 Bạn bè trên cùng.','Ghé mỗi nhà **một lần mỗi ngày**: xu và một tem.','**5 tem** đổi được vé và xu.']},
  settings:{g:'set',h:'Giao diện, nhạc nền',k:['Giao diện sáng, tối; **cỡ hạt cườm**.','**Nhạc nền** mặc định tắt, bật trong Cài đặt.','Chuyển máy, Sổ tay, thông báo cũng ở đây.']}
};
(()=>{
  const RK='meoxu_hbread';
  const rd=()=>{try{return JSON.parse(localStorage.getItem(RK))||{}}catch(e){return {}}};
  const mark=id=>{try{const o=rd();if(o[id])return;o[id]=1;localStorage.setItem(RK,JSON.stringify(o))}catch(e){}};
  const pages=()=>TUT_TEXT.book.pages.filter(p=>!p.net||(typeof NET!=='undefined'&&NET.on));
  const T=s=>esc(TUT.fill(s));
  const md=s=>emo(T(s).replace(/\*\*(.+?)\*\*/g,'<b>$1</b>'));
  const strip=s=>String(s).normalize('NFD').replace(/[̀-ͯ]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
  const st=document.createElement('style');st.textContent=`
    .hb-q{width:100%;box-sizing:border-box;margin:0 0 8px;padding:8px 10px;font:inherit;font-size:14px;color:var(--ink);background:var(--panel);border:2px solid var(--line);border-radius:10px}
    .hb-sec{margin:10px 0 4px;font-size:13px;font-weight:800;color:var(--ink);letter-spacing:.2px}
    .hb-sec:first-of-type{margin-top:2px}
    .thb-chapter .hb-tx{display:flex;flex-direction:column;gap:1px;min-width:0}
    .thb-chapter .hb-h{font-size:11px;color:var(--dim);font-weight:400;overflow-wrap:anywhere}
    .hb-new{display:inline-block;margin-left:5px;vertical-align:1px;font-size:9px;font-weight:800;line-height:1;padding:2px 4px;border-radius:6px;background:#e5484d;color:#fff}
    .hb-none{margin:12px 0;color:var(--dim);text-align:center}
    .hb-key{margin:4px 0 10px;padding:9px 11px 9px 12px;border:2px solid var(--line);border-left:6px solid #e0a43a;border-radius:12px;background:color-mix(in srgb,#ffd36b 22%,var(--panel))}
    .hb-key h4{margin:0 0 5px;font-size:14px}
    .hb-key ul{margin:0;padding-left:18px}
    .hb-key li{margin:3px 0;line-height:1.4}
    .hb-key b,.thb-page .hb-n{color:#a3401f}
    html[data-theme=dark] .hb-key b,html[data-theme=dark] .thb-page .hb-n{color:#ffb38a}
    .hb-more>summary{cursor:pointer;list-style:none;padding:8px 10px;border:2px dashed var(--line);border-radius:10px;font-weight:700;font-size:13px;text-align:center}
    .hb-more>summary::-webkit-details-marker{display:none}
    .hb-more[open]>summary{margin-bottom:4px}
    .thb-page>p{padding:6px 0 6px 10px;border-left:3px solid var(--line);margin:8px 0}
    .thb-page .hb-lead{display:block;margin-bottom:1px}
    @media (max-height:520px) and (orientation:landscape){.hb-key{padding:7px 9px}.hb-key li{margin:1px 0}.thb-grid{grid-template-columns:repeat(3,minmax(0,1fr))}}
  `;document.head.appendChild(st);
  // in đậm nhãn đầu đoạn ("Phòng lạnh (dưới 20°C): …") và các con số có đơn vị, chỉ trong nút chữ nên không làm hỏng HTML
  const NUM=/([+−\-]?\d[\d.,]*\s?(?:–\s?\d[\d.,]*\s?)?(?:%|°C|xu|vé|phút|giờ|ngày|lượt|chai|suất|điểm|tim|bé|lần|cổng|tấm)(?![\p{L}]))|(cấp \d+)/gu;
  function deco(el){
    el.querySelectorAll(':scope>p').forEach(p=>{
      const f=p.firstChild;
      if(f&&f.nodeType===3){const m=f.nodeValue.match(/^([^.:!?]{2,48}):\s/);
        if(m){const b=document.createElement('b');b.className='hb-lead';b.textContent=m[1];const r=f.nodeValue.slice(m[0].length);f.nodeValue=r.charAt(0).toUpperCase()+r.slice(1);p.insertBefore(b,f)}}
      const w=document.createTreeWalker(p,NodeFilter.SHOW_TEXT),L=[];let n;while((n=w.nextNode()))if(!n.parentElement.closest('b'))L.push(n);
      L.forEach(t=>{const s=t.nodeValue;NUM.lastIndex=0;if(!NUM.test(s))return;
        const sp=document.createElement('span');sp.innerHTML=esc(s).replace(NUM,x=>'<b class="hb-n">'+x+'</b>');t.replaceWith(...sp.childNodes)});
    });
  }
  function index(bk){
    const g=bk.querySelector('.thb-grid');if(!g)return;
    const list=pages(),by={};let R=rd();
    // lần đầu mở: mọi chương đang có coi như đã thấy; về sau chương mới mở khóa (thời tiết, Nhà thuốc…) mới có nhãn MỚI
    if(!R._){R={_:1};list.forEach(p=>R[p.id]=1);try{localStorage.setItem(RK,JSON.stringify(R))}catch(e){}}
    list.forEach((p,i)=>{const k=(HB_KEY[p.id]&&HB_KEY[p.id].g)||'etc';(by[k]=by[k]||[]).push([p,i])});
    const btn=([p,i])=>{const K=HB_KEY[p.id],txt=strip(p.t+' '+(K?K.h+' '+K.k.join(' '):'')+' '+(p.p||[]).join(' '));
      return '<button class="thb-chapter" data-q="'+esc(txt)+'" onclick="THB_BOOK.chapter('+i+')"><span class="thb-icon" aria-hidden="true">'+T(p.ic)+'</span>'+
        '<span class="hb-tx"><span class="thb-label">'+T(p.t)+(R[p.id]?'':'<span class="hb-new">MỚI</span>')+'</span>'+(K?'<span class="hb-h">'+T(K.h)+'</span>':'')+'</span></button>'};
    const html='<input class="hb-q" type="search" placeholder="🔎 Tìm trong Sổ tay (ví dụ: lạnh, vé, sạc)" oninput="HB_find(this.value)">'+
      HB_GRP.filter(([k])=>by[k]).map(([k,n])=>'<div class="hb-grp"><div class="hb-sec">'+emo(esc(n))+'</div><div class="thb-grid">'+by[k].map(btn).join('')+'</div></div>').join('')+
      '<div class="hb-none" style="display:none">Không tìm thấy chương nào.</div>';
    const w=document.createElement('div');w.className='hb-idx';w.innerHTML=emo(html);g.replaceWith(w);
  }
  window.HB_find=function(q){
    const s=strip(q).trim(),bk=document.querySelector('#mbox .hb-idx');if(!bk)return;let any=0;
    bk.querySelectorAll('.hb-grp').forEach(gr=>{let n=0;gr.querySelectorAll('.thb-chapter').forEach(b=>{const ok=!s||s.split(/\s+/).every(w=>b.dataset.q.includes(w));b.style.display=ok?'':'none';if(ok)n++});gr.style.display=n?'':'none';any+=n});
    bk.querySelector('.hb-none').style.display=any?'none':'';
  };
  function chapter(bk,p){
    mark(p.id);
    const pg=bk.querySelector('.thb-page');if(!pg)return;
    if(!p.html)deco(pg);
    const K=HB_KEY[p.id];if(!K)return;
    const box=document.createElement('div');box.className='hb-key';
    box.innerHTML='<h4>'+emo('⭐')+' Điều cần nhớ</h4><ul>'+K.k.map(s=>'<li>'+md(s)+'</li>').join('')+'</ul>';
    pg.before(box);
    const long=(p.html?pg.textContent.length:(p.p||[]).join('').length)>500;
    const d=document.createElement('details');d.className='hb-more';if(!long)d.open=true;
    d.innerHTML='<summary>📄 Đọc chi tiết đầy đủ</summary>';d.querySelector('summary').innerHTML=emo('📄 Đọc chi tiết đầy đủ');
    pg.before(d);d.appendChild(pg);
  }
  const open0=THB_BOOK.open;
  THB_BOOK.open=function(id){
    open0.apply(this,arguments);
    const bk=document.querySelector('#mbox .thb-book');if(!bk)return;
    const p=id&&pages().find(x=>x.id===id);
    if(p)chapter(bk,p);else index(bk);
  };
  // nút chương gọi THB_BOOK.chapter; bản gốc gọi thẳng open bên trong nên bỏ qua mọi lớp bọc (trang Nước uống từng hiện trống)
  THB_BOOK.chapter=function(i){const p=pages()[i];THB_BOOK.open(p&&p.id)};
})();
