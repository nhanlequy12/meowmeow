"use strict";
/* ============ HƯỚNG DẪN NHÀ THUỐC & BỆNH VIỆN THÚ Y (mở ở cấp MED_LV) ============
   Một luồng phụ của js/tutorial.js (TUT.addFlow), id 'med'. Chạy đúng một lần khi Nhà thuốc vừa mở khóa, sau hướng dẫn thời tiết và điện:
   - Người chơi lên cấp 3 trong lúc chơi: chạy ngay (có nút Bỏ qua, vẫn nhận đủ quà).
   - Người chơi đã qua cấp 3 từ trước bản cập nhật: thẻ mời "Xem ngay / Để sau". Nhận biết: bản lưu chưa từng được thấy ở trạng thái
     "Nhà thuốc còn khóa" bằng bản game này (cờ S.tut.medN, đặt mỗi giây khi medOpen() còn sai).
   Cờ: S.tut.med = 1 khi xong hoặc bỏ qua; S.tut.got.medgift (quà một lần: 1 Thuốc cơ bản, 1 Thuốc hỗ trợ đường hô hấp, 5 Nước lọc, tổng 95 xu);
   S.tut.medN = 1 (đã thấy lúc còn khóa). Xem lại: Sổ tay › "▶ Xem lại hướng dẫn Nhà thuốc" (không phát quà).
   File này cũng thêm ba chương Sổ tay (Nước uống, Bệnh và chấn thương, Nhà thuốc & Bệnh viện thú y; số liệu sinh từ js/med-data.js)
   và thẻ Admin "🏥 Nước, bệnh tật, bệnh viện" (chỉ để thử). Giao diện Nhà thuốc ở js/med-ui.js (openMed, closeMed, medOn, #medchip, #mt-*). */
(()=>{
  const TX=TUT_TEXT,st=()=>S.tut||(S.tut={done:1,hints:{}}),got=k=>!!(st().got&&st().got[k]),live=()=>!TUT.replaying();
  const GIFT=[['t_basic',1],['m_resp',1],['w_plain',5]];   // tổng 95 xu, đã khai với trọng tài máy chủ: đừng đổi
  const has=()=>typeof openMed==='function',on=()=>typeof medOn==='function'&&medOn();
  const vn=n=>Number(n).toLocaleString('vi-VN'),pct=x=>vn(Math.round(x*1000)/10)+'%';
  TX.med={
    offerTitle:'🏥 Tính năng mới: Nhà thuốc & Bệnh viện thú y',
    offer:'Bản cập nhật thêm bệnh tật, thuốc và bệnh viện cho các bé. Tiến độ của bạn giữ nguyên. Xem hướng dẫn ngắn (khoảng 1 phút) để nhận thuốc và nước miễn phí nhé?',
    offerYes:'Xem ngay',offerNo:'Để sau',
    giftTitle:'🎁 Túi thuốc đầu tiên',giftBtn:'Nhận quà',giftGot:'Đã nhận quà này',
    skip:'Bạn vẫn nhận đủ thuốc và nước tặng. Xem lại lúc nào cũng được trong Sổ tay ở ⚙ Cài đặt.',
    replay:'▶ Xem lại hướng dẫn Nhà thuốc',
    locked:'🔒 Chương bệnh tật và Nhà thuốc mở ở cấp ',
    note:'Đây là luật chơi của game, không phải hướng dẫn thú y ngoài đời.'
  };
  Object.assign(TX.steps,{
    med_offer:['Chào bạn! Nhà mình vừa có Nhà thuốc đó.'],
    med_hi:['Nhà thuốc & Bệnh viện thú y đã mở cửa! Từ giờ các bé có thể ốm hoặc bị thương.','Đừng lo, tớ chỉ nhanh cách chăm các bé nhé.'],
    med_chip:['Nút 🏥 Nhà thuốc ở thanh bên trái báo có bao nhiêu bé đang cần chăm sóc.'],
    med_open:['Bấm nút 🏥 Nhà thuốc ở thanh bên trái để mở Nhà thuốc & Bệnh viện thú y.'],
    med_care:['Mục Mèo cần chăm sóc liệt kê các bé đang ốm, bị thương hoặc nằm viện.','Bấm vào một bé để xem bệnh và cách chữa.'],
    med_shop:['Mục Mua thuốc có hai loại. Thuốc giảm triệu chứng rẻ, giúp bé dễ chịu một lúc nhưng không chữa khỏi.','Thuốc điều trị có tỉ lệ khỏi ghi sẵn. Mỗi đợt bệnh chỉ thử được tối đa '+MEDC.tries+' lần.'],
    med_treat:['Mục Điều trị: chọn bé, chọn bệnh rồi chọn thuốc đang có trong kho.','Thử đủ '+MEDC.tries+' lần mà chưa khỏi thì đưa bé đến bệnh viện.'],
    med_hosp:['Bệnh viện chữa khỏi chắc chắn, mất '+MEDC.hospMin+' phút thật. Thời gian vẫn trôi khi bạn thoát game.','Ca nghiêm trọng như sốc nhiệt, gãy chân thì phải vào viện, thuốc không chữa được.'],
    med_gift:['Tớ tặng bạn ít thuốc và nước để phòng khi cần.'],
    med_bye:['Thấy nút 🏥 Nhà thuốc hiện số thì ghé xem ngay nhé. Cần xem lại thì mở Sổ tay trong ⚙ Cài đặt. Chúc các bé luôn khỏe!']
  });

  /* ---------- quà một lần ---------- */
  const item=id=>DRINK[id]||MED[id]||SUP[id];
  function give(){
    return TUT.once('medgift',()=>{
      S.inv=S.inv||{};GIFT.forEach(([id,n])=>{S.inv[id]=invN(id)+n});
      toast(GIFT.map(([id,n])=>n+' '+item(id).n).join(', ')+' đã vào kho.',{icon:'🎁',title:TX.guide.name,ms:4200});
    });
  }

  /* ---------- người chơi cũ: chưa từng thấy lúc Nhà thuốc còn khóa ---------- */
  const mark=()=>{if(typeof S!=='undefined'&&S&&S.tut&&!medOpen()&&!S.tut.medN)S.tut.medN=1};
  mark();setInterval(mark,1000);
  const isOld=()=>!st().medN;

  /* ---------- thẻ giữa màn ---------- */
  const offerCard=()=>'<h3>'+TX.med.offerTitle+'</h3><div style="text-align:left;line-height:1.45">'+TX.med.offer+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="go" onclick="TUT._fa(1)">'+TX.med.offerYes+'</button><button onclick="TUT._fa(0)">'+TX.med.offerNo+'</button></div>';
  const giftCard=()=>'<h3>'+TX.med.giftTitle+'</h3><div class="tut-gift">'+GIFT.map(([id,n])=>{const m=item(id);
      return '<div><span style="font-size:22px">'+m.ic+'</span><span><b>'+n+' × '+m.n+'</b><br><small>'+(m.kind==='cure'?'Thuốc điều trị, tỉ lệ khỏi '+pct(m.rate)+'.':m.kind==='sym'?'Giảm triệu chứng '+MEDC.relief+' phút. '+m.d:m.d)+'</small></span></div>'}).join('')+'</div>'+
    (!live()||got('medgift')?'<div class="dim">'+TX.med.giftGot+'</div>':'<button class="go tut-giftbtn" onclick="TUT._fa()">🎁 '+TX.med.giftBtn+'</button>');

  /* ---------- các bước ---------- */
  const shut=()=>{if(TUT.modalOn())closeModal();if(on()&&typeof closeMed==='function')closeMed()};
  const chip=()=>{const e=$('medchip');return e&&(e.offsetParent!==null||getComputedStyle(e).position==='fixed')?e:null};
  // mở đúng mục của Nhà thuốc; khoanh nút tab cùng phần nội dung bên dưới (không có thì khoanh cả sách)
  const show=t=>()=>{if(!has())return;if(TUT.modalOn())closeModal();openMed(t)};
  const body=()=>$('md-body');
  const tgt=t=>()=>{if(!on())return null;const b=$('mt-'+t),p=body();if(!b||!p)return b||$('medbook');
    // hàm đích phải trả một khung chữ nhật (engine không gộp mảng do hàm trả về): gộp nút mục với phần nội dung
    const A=b.getBoundingClientRect(),B=p.getBoundingClientRect(),l=Math.min(A.left,B.left),tp=Math.min(A.top,B.top);
    return {left:l,top:tp,width:Math.max(A.right,B.right)-l,height:Math.max(A.bottom,B.bottom)-tp}};
  const noUI=()=>!has();
  const STEPS=[
    {id:'med_offer',say:'med_offer',card:offerCard,btn:1,replayOff:1,skip:()=>!isOld(),tap(i){if(!i){TUT._skipYes();return false}}},
    {id:'med_hi',say:'med_hi',guide:1,enter:shut},
    {id:'med_chip',say:'med_chip',tab:'home',target:'#medchip',enter:shut,skip:()=>!chip()},
    {id:'med_open',say:'med_open',tab:'home',target:'#medchip',act:'openMed',done:()=>on(),enter:shut,skip:()=>!chip()||noUI()},
    {id:'med_care',say:'med_care',target:tgt('care'),enter:show('care'),skip:noUI},
    {id:'med_shop',say:'med_shop',target:tgt('shop'),enter:show('shop'),skip:noUI},
    {id:'med_treat',say:'med_treat',target:tgt('treat'),enter:show('treat'),skip:noUI},
    {id:'med_hosp',say:'med_hosp',target:tgt('hosp'),enter:show('hosp'),skip:noUI},
    {id:'med_gift',say:'med_gift',tab:'home',card:giftCard,btn:1,enter:shut,tap(){give()},skip:()=>live()&&got('medgift')},
    {id:'med_bye',say:'med_bye',guide:1,enter:shut}
  ];
  // trong chế độ xem lại, thẻ có nút thành thẻ xem (chạm để sang câu)
  STEPS.forEach(s=>{if(s.btn){const b=1;Object.defineProperty(s,'btn',{get:()=>live()?b:0})}});

  const after=(open,k)=>typeof window[open]!=='function'||!window[open]()||!!st()[k];   // chờ hướng dẫn thời tiết và điện xong trước
  TUT.addFlow('med',{
    steps:STEPS,skipText:TX.med.skip,
    when:()=>medOpen()&&!st().med&&after('wxOpen','wx')&&after('pwOpen','pw')&&!on(),
    // xong hoặc bỏ qua: phát quà (cờ riêng), đánh dấu để không lặp lại
    end(){give();st().med=1},
    close:shut
  });
  // phòng khi openMed không móc được (không phải khai báo function toàn cục): thấy sách đã mở ở bước bấm thì báo cho engine
  setInterval(()=>{if(TUT.step()==='med_open'&&on())TUT.fire('openMed',[])},300);

  /* ---------- Sổ tay: ba chương sinh từ bảng cấu hình ---------- */
  const css=document.createElement('style');css.id='tut-med-css';
  css.textContent=`
    .tm-list{display:grid;gap:5px;margin:8px 0}
    .tm-row{background:var(--panel);border-radius:10px;padding:6px 9px;min-width:0;overflow-wrap:anywhere}
    .tm-row .h{display:flex;flex-wrap:wrap;align-items:baseline;gap:2px 8px}
    .tm-row .h b{flex:1 1 auto;min-width:0}
    .tm-row .h span{flex:0 0 auto;font-size:12px;white-space:nowrap}
    .tm-row small{display:block;color:var(--dim);font-size:12px;line-height:1.35}
    .tm-h{margin:12px 0 4px;font-weight:700}
    .tm-note{margin:10px 0 0;padding:6px 9px;border:2px dashed var(--line);border-radius:10px;font-size:12px}
  `;
  if(!document.getElementById(css.id))document.head.appendChild(css);
  const P=s=>'<p>'+s+'</p>',Hd=s=>'<div class="tm-h">'+s+'</div>',L=a=>'<div class="tm-list">'+a.join('')+'</div>';
  const row=(ic,n,r,sm)=>'<div class="tm-row"><div class="h"><b>'+ic+' '+n+'</b>'+(r?'<span>'+r+'</span>':'')+'</div>'+(sm?'<small>'+sm+'</small>':'')+'</div>';
  const note=()=>'<div class="tm-note">ℹ️ '+TX.med.note+'</div>';
  const low=s=>s.charAt(0).toLowerCase()+s.slice(1);
  const names=a=>a.map(m=>m.n).join(', ');
  // cách xử lý một bệnh, suy từ cấu hình
  function fix(D){
    const a=[];
    if(D.hosp)a.push('chỉ bệnh viện chữa được');
    else if(D.inj){const c=MEDS.filter(m=>m.cure&&m.cure.includes(D.id));if(c.length)a.push(names(c)+' chữa khỏi ngay');a.push('hoặc bệnh viện')}
    else a.push('thuốc điều trị hoặc bệnh viện');
    const sp=MEDS.filter(m=>m.splint&&m.splint.includes(D.id));if(sp.length)a.push(names(sp)+' giúp đỡ đau');
    if(D.self)a.push('tự khỏi sau khoảng '+D.self+' phút '+(D.inj?'nghỉ ở nhà':D.id==='dehyd'?'khi được uống đủ nước':'nghỉ ở phòng dễ chịu, đủ nước'));
    const s=a.join('; ').replace('; hoặc',' hoặc');return s.charAt(0).toUpperCase()+s.slice(1)+'.';
  }
  function waterPage(){
    const wf=FURN.waterfilter,wb=FURN.waterbowl;
    return P('Nước uống phải mua ở Cửa hàng, mục 🥤 Nước uống. Nước cất trong kho, dùng chung cho mọi phòng. Lúc bắt đầu bạn được tặng '+MEDC.starter+' chai '+DRINK.w_plain.n+'.')+
      L(DRINKS.map(w=>row(w.ic,w.n,'<b>'+vn(w.price)+' xu</b>',w.d)))+
      P('<b>Bát nước.</b> Bát nước là đồ riêng, không dùng chung với bát ăn. Nước mua vào kho rồi mới rót vào bát. Ở tab Phòng bấm 💧 Cho uống (cạnh nút Cho ăn) và chọn loại nước: game gợi ý số chai vừa đủ, bấm ✎ Tùy chỉnh số lượng để đổi. Chai trong kho rót trước, thiếu thì mua thêm đúng số còn thiếu. Mỗi chai là một lượt uống'+(wb&&wb.water?', '+wb.n+' chứa '+wb.water.cap+' lượt':'')+'.')+
      P('<b>Chia vào bát.</b> Phòng có nhiều bát nước thì chọn Chia đều, Ưu tiên bát 1 hoặc Tự chọn. Chạm vào một bát nước trong phòng để rót riêng cho bát đó.')+
      P('<b>Bé uống thế nào.</b> Khi nước dưới '+WXC.water.drinkAt+', bé tự đi tới bát. Uống hết một lượt thì bát mới vơi và bé mới đỡ khát.')+
      (wf&&wf.water?P('<b>'+wf.n+'.</b> Cứ 10 phút máy tự rót nước đang có trong kho cho đầy '+wf.water.cap+' lượt, loại rẻ trước, kể cả lúc bạn vắng. Máy không tự tạo ra nước: kho hết thì bát cũng cạn.'):'')+
      P('<b>Cảnh báo.</b> Game báo khi kho còn dưới '+MEDC.lowStock+' chai, hoặc khi bát cạn mà có bé đang khát.')+
      P('<b>Lúc bạn vắng mặt.</b> Các bé không bị nguy hiểm vì khát: nước của bé không tụt dưới '+WXC.away.water+' và không phát bệnh mới.');
  }
  function disPage(){
    const D=Object.values(DIS),sec=(t,f)=>Hd(t)+L(D.filter(f).map(d=>row(d.ic,d.n,SEV[d.sev].ic+' '+SEV[d.sev].n,'Do: '+low(d.cause)+'. '+fix(d))));
    return P('Từ cấp '+MED_LV+', các bé có thể ốm khi bị chăm sóc thiếu, hoặc bị thương khi viễn chinh. Bệnh chỉ phát sinh lúc bạn đang mở game, không phát sinh lúc vắng mặt.')+
      sec('Bệnh',d=>!d.inj)+sec('Chấn thương khi viễn chinh',d=>d.inj)+
      P('Mỗi bé mắc cùng lúc tối đa '+MEDC.maxIll+' bệnh. Vừa khỏi thì được miễn bệnh mới trong '+MEDC.immune+' phút.')+
      P('Để lâu bệnh nặng thêm: '+low(DIS.cold.n)+' có thể thành '+low(DIS.fever.n)+', '+low(DIS.digest.n)+' có thể thành '+low(DIS.diarrhea.n)+'.')+
      P('Bé bị '+D.filter(d=>d.noTrip).map(d=>low(d.n)).join(', ')+' không đi viễn chinh được. '+D.filter(d=>d.slow).map(d=>d.n+' làm chuyến đi lâu hơn '+Math.round((d.slow-1)*100)+'%.').join(' '))+note();
  }
  function shopPage(){
    const of=k=>MEDS.filter(m=>m.kind===k),D=Object.values(DIS);
    const dest=Object.keys(DEST_CLIMATE),dg=k=>DEST_CLIMATE[k].danger||0,dn=k=>(typeof DEST!=='undefined'&&DEST[k]&&DEST[k].n)||DEST_CLIMATE[k].n;
    const hi=dest.reduce((a,k)=>dg(k)>dg(a)?k:a,dest[0]),lo=dest.reduce((a,k)=>dg(k)<dg(a)?k:a,dest[0]);
    const od=k=>{const o=injOdds(k,[],40,{});return 'tai nạn nhẹ '+pct(o.minor)+', bong gân '+pct(o.sprain)+', gãy chân '+pct(o.frac)};
    const maxBad=Math.max(0,...Object.values(WX).map(w=>w.bad||0));
    return P('Mở bằng nút 🏥 Nhà thuốc ở thanh bên trái, từ cấp '+MED_LV+'. Thuốc mua xong nằm trong kho, dùng ở mục Điều trị.')+
      Hd('Thuốc giảm triệu chứng')+P('Trong '+MEDC.relief+' phút, triệu chứng chỉ còn '+pct(MEDC.reliefK)+'. Không chữa khỏi và không cộng dồn.')+
      L(of('sym').map(m=>row(m.ic,m.n,'<b>'+vn(m.price)+' xu</b>','Cho bệnh về '+m.grp.map(g=>GRP_N[g]).join('; ')+'.')))+
      Hd('Thuốc điều trị')+P('Có tỉ lệ chữa khỏi. Mỗi đợt bệnh thử tối đa '+MEDC.tries+' lần; hết lượt mà chưa khỏi thì phải đến bệnh viện. Không dùng cho chấn thương và ca nghiêm trọng chỉ bệnh viện chữa được.')+
      L(of('cure').map(m=>row(m.ic,m.n,'<b>'+vn(m.price)+' xu</b>','Tỉ lệ khỏi '+pct(m.rate)+'.')))+
      Hd('Dụng cụ y tế')+L(of('tool').map(m=>row(m.ic,m.n,'<b>'+vn(m.price)+' xu</b>',m.d)))+
      Hd('Bệnh viện')+P('Chữa khỏi chắc chắn mọi bệnh bé đang có, mất '+MEDC.hospMin+' phút thật; thời gian vẫn trôi khi bạn thoát game. Bé nằm viện không ở trong phòng và không đi viễn chinh. Ra viện bé còn hơi mệt (năng lượng ít nhất '+MEDC.out.en+').')+
      L(D.map(d=>row(d.ic,d.n,'<b>'+vn(d.cost)+' xu</b>',d.hosp?'Chỉ bệnh viện chữa được.':'')).concat(row('🦴','Chấn thương phức tạp','<b>'+vn(MED_COMPLEX)+' xu</b>','Từ hai chấn thương trở lên mà có gãy chân: tính gộp một giá.')))+
      P('<b>Quỹ cứu trợ.</b> Ca nghiêm trọng mà bạn thiếu xu vẫn được nhận: trả số xu đang có, bé nằm viện '+MEDC.hospMin*MEDC.charityK+' phút.')+
      Hd('Đồ bảo hộ viễn chinh')+P('Mua ở Nhà thuốc, chọn mang theo khi cho bé đi viễn chinh.')+
      L(GEAR.map(g=>row(g.ic,g.n,'<b>'+vn(g.price)+' xu</b>',g.d)))+
      Hd('Tai nạn khi viễn chinh')+
      P('Chuyến 40 phút, trời đẹp, không đồ bảo hộ: ở '+dn(hi)+' (nguy hiểm nhất) '+od(hi)+'; ở '+dn(lo)+' (an toàn nhất) '+od(lo)+'.')+
      P('Trời xấu làm rủi ro tăng thêm tới '+pct(INJ.wx*maxBad)+', chuyến càng dài càng rủi ro. Đồ bảo hộ giảm tối đa '+pct(WXC.resCap)+'. Gãy chân chỉ có ở: '+dest.filter(k=>dg(k)>=INJ.fracFrom).map(dn).join(', ')+'.')+note();
  }
  const PAGES=[
    {id:'water',ic:'🥤',t:'Nước uống',p:[],html:waterPage,at:'feed'},
    {id:'disease',ic:'🤒',t:'Bệnh và chấn thương',p:[],html:disPage,at:'supply',lock:1},
    {id:'medshop',ic:'🏥',t:'Nhà thuốc & Bệnh viện thú y',p:[],html:shopPage,at:'disease',lock:1}
  ];
  const mine=id=>PAGES.find(p=>p.id===id);
  if(typeof THB_BOOK!=='undefined'){
    // danh sách chương: chèn sau chương mốc (không có mốc thì nối cuối); hai chương bệnh ẩn trước khi Nhà thuốc mở
    const d0=Object.getOwnPropertyDescriptor(TX.book,'pages'),get0=d0.get?()=>d0.get.call(TX.book):()=>d0.value;
    Object.defineProperty(TX.book,'pages',{configurable:true,get(){
      const l=get0().slice();
      PAGES.forEach(p=>{if(p.lock&&!medOpen())return;let i=l.findIndex(x=>x.id===p.at);if(i<0&&p.at==='supply')i=l.findIndex(x=>x.id==='water');
        if(i<0)i=l.findIndex(x=>x.id==='shop')-1;if(i<-1)i=l.length-1;l.splice(i+1,0,p)});
      return l}});
    const open0=THB_BOOK.open;
    THB_BOOK.open=function(id){
      const pg=mine(id);
      if(pg&&pg.lock&&!medOpen()){toast(TX.med.locked+MED_LV+'.',{icon:'🔒'});return}
      open0.apply(this,arguments);
      const bk=document.querySelector('#mbox .thb-book');if(!bk)return;
      if(pg){ // trang của file này: nội dung là HTML sinh từ cấu hình; gỡ nút xem lại mà các file khác chèn nhầm vào trang chương
        const el=bk.querySelector('.thb-page');if(el)el.innerHTML=emo(pg.html());
        bk.querySelectorAll('.thb-actions .thb-replay,.thb-actions button[disabled]').forEach(b=>b.remove());return}
      if(id&&TX.book.pages.some(p=>p.id===id))return;
      const a=bk.querySelector('.thb-actions');if(!a||a.querySelector('.med-replay'))return;
      const rp=[...a.querySelectorAll('.thb-replay')].pop(),h=medOpen()?'<button class="thb-replay med-replay" onclick="closeModal();TUT.startReplay(\'med\')">'+TX.med.replay+'</button>':'<button class="med-replay" disabled>'+TX.med.locked+MED_LV+'</button>';
      if(rp)rp.insertAdjacentHTML('afterend',h);else a.insertAdjacentHTML('afterbegin',h);
    };
  }
})();

/* ============ ADMIN (chỉ để thử): thẻ "🏥 Nước, bệnh tật, bệnh viện" ============ */
let ADM_MED_K='cold';
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const d=document.createElement('div');d.innerHTML=emo(medAdmBox());const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function medAdmBox(){
  const sel='font:inherit;color:var(--ink);background:var(--panel);border:2px solid var(--line);border-radius:10px;padding:6px;min-width:0;flex:1';
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>';
  const sick=S.cats.filter(c=>ills(c).length).length,hos=Object.keys(S.hosp||{}).length;
  return '<div class="card" id="admmed" style="flex-direction:column;align-items:stretch;gap:6px"><b>🏥 Nước, bệnh tật, bệnh viện</b>'+
    '<div class="dim">Nhà thuốc: '+(medOpen()?'đã mở':'còn khóa (cấp '+MED_LV+')')+' · '+sick+' bé đang bệnh · '+hos+' bé nằm viện · kho '+drinkStock()+' chai nước</div>'+
    '<div class="row"><select id="admmedk" style="'+sel+'" onchange="ADM_MED_K=this.value">'+Object.values(DIS).map(d=>'<option value="'+d.id+'"'+(d.id===ADM_MED_K?' selected':'')+'>'+d.ic+' '+d.n+' ('+SEV[d.sev].n.toLowerCase()+')</option>').join('')+'</select></div>'+
    '<div class="row wrap">'+B('admMedIll()','Gây bệnh cho mèo ở phòng đang xem ('+ROOM[cur].n+')')+B('admMedWell()','Khỏi hết bệnh')+B('admMedOut()','Cho ra viện ngay')+'</div>'+
    '<div class="row wrap">'+B('admMedGive()','+5 mỗi loại thuốc, dụng cụ, đồ bảo hộ')+B('admMedDrink()','+10 mỗi loại nước')+B('admMedDry()','Các bé ở phòng này khát (nước = 0)')+'</div>'+
    '<div class="row wrap">'+B('admMedUnlock()','Mở khóa Nhà thuốc ngay')+B('admMedTut()','Chạy lại hướng dẫn Nhà thuốc')+'</div>'+
    '<div class="dim">Gây bệnh không cần Nhà thuốc đã mở. "Khát" đặt nước của các bé về 0 và làm cạn bát nước của phòng. Chạy lại hướng dẫn không phát quà lần nữa.</div></div>';
}
function admMedIll(){const D=DIS[ADM_MED_K],L=homeCats(cur);let n=0;if(!D)return;L.forEach(c=>{if(medAdd(c,D.id,1))n++});
  admDone(L.length?n+'/'+L.length+' bé ở '+ROOM[cur].n+' '+(D.inj?'bị ':'mắc ')+D.n.toLowerCase():'Phòng này không có bé nào',1)}
function admMedWell(){let n=0;S.cats.forEach(c=>{if(ills(c).length)n++;delete c.ill;wxs(c).sk=0});admDone(n?n+' bé đã khỏi hết bệnh':'Không có bé nào đang bệnh',1)}
function admMedOut(){const H=S.hosp||{},L=Object.keys(H);L.forEach(u=>{H[u].until=now()});admDone(L.length?L.length+' bé sẽ ra viện trong giây lát':'Không có bé nào nằm viện',1)}
function admMedGive(){S.inv=S.inv||{};MEDS.concat(GEAR).forEach(m=>{S.inv[m.id]=invN(m.id)+5});admDone('Mỗi loại thuốc, dụng cụ, đồ bảo hộ +5',1)}
function admMedDrink(){S.inv=S.inv||{};DRINKS.forEach(w=>{S.inv[w.id]=invN(w.id)+10});admDone('Mỗi loại nước +10 chai',1)}
function admMedDry(){const L=homeCats(cur);L.forEach(c=>{c.wa=0});wbowls(cur).forEach(b=>{b.w=0;b.wl=[]});admDone(L.length+' bé ở '+ROOM[cur].n+' đang khát, bát nước đã cạn',1)}
function admMedUnlock(){S.medU=1;admDone('Nhà thuốc & Bệnh viện thú y đã mở',1)}
function admMedTut(){const t=S.tut||(S.tut={done:1,hints:{}});delete t.med;if(t.fl&&t.fl.id==='med')delete t.fl;S.medU=1;save();closeModal();render();
  toast('Hướng dẫn Nhà thuốc sẽ chạy lại sau giây lát (cần đã xong hướng dẫn thời tiết và điện).',{icon:'🛠',title:'Admin'})}
