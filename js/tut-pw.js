"use strict";
/* ============ HƯỚNG DẪN ĐIỆN NĂNG (cấp WX_LV, sau hướng dẫn thời tiết) ============
   Ba luồng phụ của js/tutorial.js (TUT.addFlow), mỗi luồng chạy đúng một lần:
   - 'pw': ngay sau hướng dẫn thời tiết ở cấp 2 (người chơi cũ thì có lời mời "Xem ngay / Để sau"): thiết bị điện phải sạc tay,
     tặng một Ổ điện đơn gắn vào tường cạnh thiết bị và tiền sạc lần đầu, chạm thiết bị → Sạc thiết bị → chọn ổ → xác nhận, dây cắm, ô ⚡ và Sách điện.
     Cờ S.tut.pw = 1 khi xong hoặc bỏ qua (sét đánh mất điện chỉ xảy ra sau đó). Quà: S.tut.got.pwgift, pwrw.
   - 'pwout': lần đầu gặp mất điện (S.tut.pwo). - 'pwgen': lần đầu có máy phát dự phòng (S.tut.pwg).
   Xem lại: Sổ tay › "▶ Xem lại hướng dẫn điện năng". */
(()=>{
  const TX=TUT_TEXT,st=()=>S.tut||(S.tut={done:1,hints:{}}),got=k=>!!(st().got&&st().got[k]),live=()=>!TUT.replaying();
  const GIFT={coins:50},RW={coins:150};
  TX.pw={
    offerTitle:'🔌 Tính năng mới: Điện năng',
    offer:'Từ bản này mọi thiết bị điện chạy pin và KHÔNG tự sạc nữa: bạn cắm vào ổ điện gắn tường và trả xu để sạc. Xem hướng dẫn ngắn để nhận một ổ điện miễn phí và tiền sạc lần đầu nhé?',
    offerYes:'Xem ngay',offerNo:'Để sau',
    ruleTitle:'Điện trong nhà hoạt động thế nào?',
    rules:[['🔋','Thiết bị chạy pin','Quạt, máy sưởi, điều hòa, máy lọc không khí, máy hút ẩm, máy cho ăn tự động… tốn pin khi chạy. Hết pin thì ngừng chạy và mất tác dụng.'],
      ['🚫','Không tự sạc','Pin không bao giờ tự đầy, kể cả lúc bạn vắng. Dưới 20% game sẽ báo.'],
      ['🔌','Ổ điện gắn tường','Mỗi ổ sạc được số thiết bị bằng số cổng. Chỗ ẩm, ngoài trời cần ổ chống nước.'],
      ['🪙','Trả xu theo lượng pin nạp','Pin còn một nửa thì chỉ trả khoảng nửa phí sạc đầy. Chăn, rèm, giường gỗ, mái che không dùng điện.']],
    giftTitle:'🎁 Ổ điện đầu tiên',giftBtn:'Nhận và gắn lên tường',giftGot:'Đã nhận ổ điện',
    stormTitle:'⛈ Sét đánh và nguồn dự phòng',
    storm:[['⚡','Hiếm khi có sét','Khi mưa giông, đôi khi sét đánh làm cả nhà mất điện 15 phút: đèn tắt, không sạc được, các bé hoảng sợ.'],
      ['🔦','Làm dịu các bé','Đèn khẩn cấp dùng pin, đèn pin, ổ ngủ và vuốt ve giúp các bé đỡ sợ.'],
      ['☀️','Cấp '+SOLAR_LV,'Tấm pin mặt trời ở ban công, sân thượng giảm 50% phí sạc.'],
      ['🔋','Cấp '+GEN_LV,'Máy phát ở tầng hầm tự cấp điện dự phòng khi mất điện.']],
    rwTitle:'🎉 Hoàn thành hướng dẫn điện năng',rwBtn:'Nhận thưởng',rwGot:'Đã nhận thưởng',
    skip:'Bạn vẫn nhận ổ điện, tiền sạc và phần thưởng. Xem lại lúc nào cũng được trong Sổ tay ở ⚙ Cài đặt.',
    replay:'▶ Xem lại hướng dẫn điện năng',
    outTitle:'⛈ Mất điện rồi!',
    out:[['⏳','15 phút','Ô ⚡ trên cùng đếm ngược tới lúc có điện lại. Thời gian vẫn trôi khi bạn thoát game.'],
      ['🔋','Đồ chạy pin vẫn chạy','Quạt, máy sưởi… chạy tiếp tới khi hết pin. Đồ không dùng điện vẫn bình thường. Chỉ là chưa sạc được bằng điện lưới.'],
      ['😱','Các bé hoảng sợ','Mất vui dần, tốn năng lượng hơn, trốn vào ổ hoặc góc phòng. Phòng tối thì sợ lâu hơn.'],
      ['🫂','Cách làm dịu','Vuốt ve từng bé, soi đèn pin, đặt đèn khẩn cấp dùng pin, có máy phát dự phòng thì đèn sáng lại.']],
    genTitle:'🔋 Máy phát dự phòng',
    gen:[['🏚','Chỉ ở tầng hầm','Máy chỉ chạy khi đặt trong Tầng hầm. Mua ở phòng khác thì máy nằm trong Kho đồ chờ bạn đặt.'],
      ['🪙','Sạc bằng xu','Bấm vào máy rồi Sạc máy phát. Máy không bao giờ tự sạc, kể cả lúc bạn vắng.'],
      ['⚡','Tự chuyển nguồn','Khi mất điện, máy đã sạc tự cấp điện: đèn sáng, ổ điện sạc tiếp, các bé đỡ sợ.'],
      ['0️⃣','Dùng xong về 0%','Có điện lại thì máy đã chạy về 0% và cần sạc lại. Máy mini chạy 5 phút, không đủ cho cả 15 phút mất điện.']]
  };
  Object.assign(TX.steps,{
    pw_offer:['Chào bạn! Nhà mình đổi cách dùng điện đó.'],
    pw_hi:['Thiết bị thời tiết của bạn chạy pin. Từ giờ pin không tự sạc nữa: bạn cắm vào ổ điện trên tường và trả xu để sạc.','Tớ chỉ cách làm một lần nhé.'],
    pw_rule:['Nhớ bốn điều này về điện trong nhà.'],
    pw_gift:['Tớ tặng bạn một ổ điện và chút xu để sạc lần đầu. Bấm nút, tớ gắn ổ lên tường cạnh thiết bị cho.'],
    pw_out:['Ổ điện đã bám sát chân tường đây. Ổ không được lơ lửng hay chồng lên đồ khác; muốn dời thì bấm ✏ Sắp xếp đồ rồi kéo dọc tường.'],
    pw_dev:['Thiết bị này đã chạy một lúc nên pin còn ít. Chạm vào nó để xem pin.'],
    pw_btn:['Đây là pin, thời gian chạy còn lại và phí sạc. Bấm 🔌 Sạc thiết bị.'],
    pw_pick:['Chọn một ổ còn cổng trống trong phòng. Ổ hết cổng, ổ không chống nước ở chỗ ẩm, hay lúc mất điện thì không chọn được.'],
    pw_ok:['Xem lại lượng pin nạp và số xu phải trả rồi bấm Xác nhận. Xu chỉ bị trừ một lần ở đây.'],
    pw_cable:['Dây cắm nối ổ với thiết bị, tia sét nhỏ nhấp nháy là đang sạc. Đầy thì tự rút.','Máy nào dưới 20% sẽ hiện vạch pin đỏ, và game báo cho bạn.'],
    pw_chip:['Ô ⚡ trên cùng mở Sách điện. Số 🪫 bên cạnh là số thiết bị sắp hết pin. Bấm vào nhé.'],
    pw_left:['Trang trái là nguồn điện: điện lưới, điện mặt trời, máy phát dự phòng và cảnh báo pin yếu.'],
    pw_right:['Trang phải là mọi thiết bị điện: % pin, còn chạy bao lâu, ổ đang cắm và nút Sạc kèm số xu.'],
    pw_storm:['Còn chuyện sấm sét nữa.'],
    pw_done:['Xong rồi! Quà nhỏ cho bạn đây.'],
    pw_bye:['Ghé nhà thì ngó ô ⚡ một chút. Chúc nhà mình luôn đủ điện!'],
    pwo_hi:['Ối, sét đánh trúng nhà mình rồi!'],
    pwo_chip:['Ô ⚡ đang đếm ngược tới lúc có điện lại.'],
    pwo_book:['Trang trái của Sách điện cho biết còn bao lâu, máy phát có chạy không, và có nút soi đèn pin nếu bạn có.'],
    pwo_bye:['Bình tĩnh nhé, 15 phút là có điện lại. Vuốt ve các bé cho đỡ sợ!'],
    pwg_hi:['Bạn vừa có máy phát dự phòng!'],
    pwg_show:['Máy phát đây. Chạm vào máy để xem năng lượng và sạc bằng xu.'],
    pwg_bye:['Sạc sẵn máy phát, lần mất điện tới nhà mình sẽ sáng đèn ngay.']
  });

  /* ---------- món dùng trong hướng dẫn ---------- */
  const devItem=()=>{const d=st().wxd,a=d&&S.items.find(i=>i.iid===d.iid&&i.room!=null&&FURN[i.fid].pw);if(a)return a;const p=st().pwd;return p&&S.items.find(i=>i.iid===p&&i.room!=null)||S.items.find(i=>i.room===cur&&FURN[i.fid].pw)||S.items.find(i=>i.room!=null&&FURN[i.fid].pw)};
  const outItem=()=>{const p=st().pwol;return p&&S.items.find(i=>i.iid===p&&i.room!=null)};
  function giveGift(){
    return TUT.once('pwgift',()=>{
      let d=devItem(),fresh=0;
      if(!d){fresh=1;const rid=S.rooms[cur]&&cur!=='wait'?cur:'living',f=FURN.bfan;d={iid:S.nid++,fid:'bfan',room:rid,x:clamp(Math.round((camX+VW/2)/4)*4,f.w/2+8,WORLD_W-f.w/2-8),y:150,flip:false,broken:false,currentBattery:f.pw.batteryCapacity};S.items.push(d);clampItem(d)}
      st().pwd=d.iid;
      if(!d.charge&&(fresh||(st().wxd&&st().wxd.iid===d.iid)))d.currentBattery=Math.min(pwCur(d),Math.round(FURN[d.fid].pw.batteryCapacity*.35));   // máy tặng đã chạy một lúc: còn 35% pin để tập sạc
      const fid=pwWet(d.room)?'outwet':'out1',o={iid:S.nid++,fid,room:d.room,x:d.x+(d.x<WORLD_W/2?24:-24),y:PW_OUT_Y,flip:false,broken:false};
      S.items.push(o);clampItem(o);st().pwol=o.iid;S.coins+=GIFT.coins;if(typeof wxDirty==='function')wxDirty();
      toast(FURN[fid].n+' đã gắn ở '+ROOM[d.room].n+' · +'+GIFT.coins+' xu tiền sạc',{icon:'🎁',title:TX.guide.name,ms:4200});
    });
  }
  const giveRw=()=>TUT.once('pwrw',()=>{S.coins+=RW.coins;toast('Cảm ơn bạn đã học cách dùng điện!',{type:'coin',title:TX.pw.rwTitle,coins:RW.coins,ms:4200})});
  function rectOf(it){
    if(!it||tab!=='home'||it.room!==cur)return null;
    const f=FURN[it.fid],r=room.getBoundingClientRect(),s=room.clientWidth/VW,x0=r.left+room.clientLeft,y0=r.top+room.clientTop;
    const R={left:x0+(it.x-f.w/2-camX)*s-4,top:y0+(it.y-f.h-camY)*s-4,width:f.w*s+8,height:f.h*s+8};
    return R.left<r.left-6||R.left+R.width>r.right+6||R.top<r.top-6||R.top+R.height>r.bottom+6?null:R;
  }
  function look(it,k){if(!it)return;if(tab!=='home')setTab('home');if(cur!==it.room)setRoom(it.room);if(fol)unfollow(false);
    const o=k&&outItem(),x=o&&o.room===it.room?(it.x+o.x)/2:it.x;camX=x-VW/2;camY=it.y-FURN[it.fid].h/2-VHV/2;clampCam()}
  const shut=()=>{if(TUT.modalOn())closeModal();if(typeof closeBook==='function')closeBook();if(typeof closePower==='function')closePower()};
  const rows=L=>'<div class="tut-gift">'+L.map(r=>'<div><span style="font-size:22px">'+r[0]+'</span><span><b>'+r[1]+'</b><br><small>'+r[2]+'</small></span></div>').join('')+'</div>';
  const offerCard=()=>'<h3>'+TX.pw.offerTitle+'</h3><div style="text-align:left;line-height:1.45">'+TX.pw.offer+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="go" onclick="TUT._fa(1)">'+TX.pw.offerYes+'</button><button onclick="TUT._fa(0)">'+TX.pw.offerNo+'</button></div>';
  const giftCard=()=>'<h3>'+TX.pw.giftTitle+'</h3><div class="tut-gift"><div>'+furnTag('out1','',36,36)+'<span><b>'+FURN.out1.n+'</b><br><small>'+FURN.out1.d+'</small></span></div><div>🪙 <span><b>'+GIFT.coins+' xu</b><br><small>đủ cho lần sạc đầu tiên</small></span></div></div>'+
    (!live()||got('pwgift')?'<div class="dim">'+TX.pw.giftGot+'</div>':'<button class="go tut-giftbtn" onclick="TUT._fa()">🎁 '+TX.pw.giftBtn+'</button>');
  const rwCard=()=>'<h3>'+TX.pw.rwTitle+'</h3><div class="tut-gift"><div>🪙 <b>'+RW.coins+'</b> xu</div></div>'+
    (!live()||got('pwrw')?'<div class="dim">'+TX.pw.rwGot+'</div>':'<button class="go tut-giftbtn" onclick="TUT._fa()">🎁 '+TX.pw.rwBtn+'</button>');
  const modalHas=s=>TUT.modalOn()&&!!$('mbox').querySelector(s);

  const STEPS=[
    {id:'pw_offer',say:'pw_offer',card:offerCard,btn:1,replayOff:1,skip:()=>!S.pwOld,tap(i){if(!i){TUT._skipYes();return false}}},
    {id:'pw_hi',say:'pw_hi',guide:1,enter:shut},
    {id:'pw_rule',say:'pw_rule',card:()=>'<h3>'+TX.pw.ruleTitle+'</h3>'+rows(TX.pw.rules),enter:shut},
    {id:'pw_gift',say:'pw_gift',tab:'home',card:giftCard,btn:1,enter:shut,tap(){giveGift()},skip:()=>live()&&got('pwgift')&&!!outItem()},
    {id:'pw_out',say:'pw_out',tab:'home',target:()=>rectOf(outItem())||$('roomwrap'),enter(){shut();look(devItem(),1)},skip:()=>!outItem()},
    {id:'pw_dev',say:'pw_dev',tab:'home',target:()=>rectOf(devItem())||$('roomwrap'),act:'openPw',done:()=>modalHas('.pw-chg,.pw-ok'),enter(){shut();look(devItem(),1)},skip:()=>!devItem()||!!devItem().charge},
    {id:'pw_btn',say:'pw_btn',target:'#mbox .pw-chg',act:'pwPick',done:()=>modalHas('.pw-ol'),enter(){const d=devItem();if(d&&!modalHas('.pw-chg'))openPw(d.iid)},skip:()=>!devItem()||!!devItem().charge||!pwQuote(devItem()).need},
    {id:'pw_pick',say:'pw_pick',target:'#mbox .pw-ol:not(.off) .go',act:'pwConfirm',done:()=>modalHas('.pw-ok'),enter(){const d=devItem();if(d&&!modalHas('.pw-ol'))pwPick(d.iid)},skip:()=>!devItem()||!!devItem().charge||!pwOutlets(devItem().room).some(o=>!pwOutletWhy(o,devItem()))},
    {id:'pw_ok',say:'pw_ok',target:'#mbox .pw-ok',act:'doPwCharge',done:()=>!!(devItem()&&devItem().charge),close:1,enter(){const d=devItem(),o=outItem();if(d&&!modalHas('.pw-ok'))o&&!pwOutletWhy(o,d)?pwConfirm(d.iid,o.iid):pwPick(d.iid)},skip:()=>!devItem()||!!devItem().charge||!pwOutlets(devItem().room).some(o=>!pwOutletWhy(o,devItem()))},
    {id:'pw_cable',say:'pw_cable',tab:'home',target:()=>$('roomwrap'),enter(){shut();look(devItem(),1)}},
    {id:'pw_chip',say:'pw_chip',tab:'home',target:'#top .pwchip',act:'openPower',done:()=>pwBookOn(),enter:shut},
    {id:'pw_left',say:'pw_left',target:'#pwbook .wb-l',enter(){if(!pwBookOn())openPower()}},
    {id:'pw_right',say:'pw_right',target:'#pwbook .wb-r',enter(){if(!pwBookOn())openPower()}},
    {id:'pw_storm',say:'pw_storm',card:()=>'<h3>'+TX.pw.stormTitle+'</h3>'+rows(TX.pw.storm),enter:shut},
    {id:'pw_done',say:'pw_done',tab:'home',card:rwCard,btn:1,enter:shut,tap(){giveRw()},skip:()=>live()&&got('pwrw')},
    {id:'pw_bye',say:'pw_bye',guide:1,enter:shut}
  ];
  const OSTEPS=[
    {id:'pwo_hi',say:'pwo_hi',card:()=>'<h3>'+TX.pw.outTitle+'</h3>'+rows(TX.pw.out),enter:shut},
    {id:'pwo_chip',say:'pwo_chip',tab:'home',target:'#top .pwchip',enter:shut,skip:()=>live()&&!pwOut()},
    {id:'pwo_book',say:'pwo_book',target:'#pwbook .wb-l',enter(){if(!pwBookOn())openPower()}},
    {id:'pwo_bye',say:'pwo_bye',guide:1,enter:shut}
  ];
  const genItem=()=>S.items.find(i=>FURN[i.fid].gen&&i.room==='basement')||S.items.find(i=>FURN[i.fid].gen);
  const GSTEPS=[
    {id:'pwg_hi',say:'pwg_hi',card:()=>'<h3>'+TX.pw.genTitle+'</h3>'+rows(TX.pw.gen),enter:shut},
    {id:'pwg_show',say:'pwg_show',tab:'home',target:()=>rectOf(genItem())||$('roomwrap'),enter(){shut();const g=genItem();if(g&&g.room)look(g)},skip:()=>!genItem()||genItem().room!=='basement'},
    {id:'pwg_bye',say:'pwg_bye',guide:1,enter:shut}
  ];
  [STEPS,OSTEPS,GSTEPS].forEach(L=>L.forEach(s=>{if(s.btn){const b=1;Object.defineProperty(s,'btn',{get:()=>live()?b:0})}}));

  TUT.addFlow('pw',{steps:STEPS,skipText:TX.pw.skip,
    when:()=>pwOpen()&&!!st().wx&&!st().pw,
    end(){giveGift();giveRw();st().pw=1;delete S.pwOld},close:shut});
  TUT.addFlow('pwout',{steps:OSTEPS,skipText:'Xem lại lúc nào cũng được trong Sổ tay, chương Mất điện.',
    when:()=>pwOpen()&&!!st().pw&&!!pwOut()&&!st().pwo,end(){st().pwo=1},close:shut});
  TUT.addFlow('pwgen',{steps:GSTEPS,skipText:'Xem lại lúc nào cũng được trong Sổ tay, chương Máy phát dự phòng.',
    when:()=>pwOpen()&&!!st().pw&&S.items.some(i=>FURN[i.fid].gen)&&!st().pwg,end(){st().pwg=1},close:shut});

  /* ---------- Sổ tay: nút xem lại (cạnh nút xem lại hướng dẫn thời tiết) ---------- */
  if(typeof THB_BOOK!=='undefined'){
    const open0=THB_BOOK.open;
    THB_BOOK.open=function(id){open0.apply(this,arguments);if(id)return;
      const a=document.querySelector('#mbox .thb-book .thb-actions');if(!a||!pwOpen()||a.querySelector('.pw-replay'))return;
      a.insertAdjacentHTML('afterbegin','<button class="thb-replay pw-replay" onclick="closeModal();TUT.startReplay(\'pw\')">'+TX.pw.replay+'</button>')};
  }
})();
