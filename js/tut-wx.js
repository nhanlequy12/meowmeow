"use strict";
/* ============ HƯỚNG DẪN THỜI TIẾT (mở ở cấp WX_LV) ============
   Một luồng phụ của js/tutorial.js (TUT.addFlow). Chạy đúng một lần khi thời tiết vừa mở khóa và luồng tân thủ đã xong:
   - Người chơi mới lên cấp 2: chạy ngay (bắt buộc, vẫn có nút Bỏ qua và vẫn nhận đủ quà).
   - Người chơi đã qua cấp 2 từ trước bản cập nhật (cờ S.wxOld do load() đặt): hiện lời mời "Xem ngay" hoặc "Để sau", tiến độ giữ nguyên.
   Cờ: S.tut.wx = 1 khi đã xong hoặc đã bỏ qua (không lặp lại); S.tut.got.wxdev (thiết bị tặng), S.tut.got.wxrw (thưởng hoàn thành);
   S.tut.wxd = {fid, iid} thiết bị đã tặng. Xem lại: Sổ tay › "Xem lại hướng dẫn thời tiết" (TUT.startReplay('wx'), không phát quà lần nữa).
   Chữ của luồng nằm ngay trong file này (TUT_TEXT.steps.wx_*, TUT_TEXT.wx). */
(()=>{
  const TX=TUT_TEXT,st=()=>S.tut||(S.tut={done:1,hints:{}}),got=k=>!!(st().got&&st().got[k]);
  const RW={coins:200,tickets:1};
  TX.wx={
    offerTitle:'🌦 Tính năng mới: Thời tiết',
    offer:'Bản cập nhật thêm thời tiết, khí hậu từng phòng và thiết bị sưởi, làm mát. Tiến độ của bạn giữ nguyên. Xem hướng dẫn ngắn (khoảng 1 phút) để nhận một thiết bị miễn phí và quà nhé?',
    offerYes:'Xem ngay',offerNo:'Để sau',
    fxTitle:'Thời tiết ảnh hưởng tới mèo thế nào?',
    fx:[['🔥','Nóng (trên 28°C)','Năng lượng hồi chậm, mau khát, độ Vui giảm.'],
        ['❄️','Lạnh (dưới 16°C)','Mau đói hơn (tốn Thức ăn), độ Vui giảm, lâu ngày dễ ốm.'],
        ['☔','Mưa, gió ở phòng ngoài trời','Mèo bị ướt và lạnh: Vui và Năng lượng đều tụt.'],
        ['😌','Phòng 20–26°C, đủ nước','Mèo vui hơn, ngủ ngon, hồi Năng lượng nhanh.']],
    devTitle:'🎁 Thiết bị đầu tiên, miễn phí',
    devBtn:'Nhận và đặt vào phòng',devGot:'Đã nhận thiết bị này',
    rwTitle:'🎉 Hoàn thành hướng dẫn thời tiết',rwBtn:'Nhận thưởng',rwGot:'Đã nhận thưởng',
    skip:'Bạn vẫn nhận thiết bị miễn phí và phần thưởng. Xem lại lúc nào cũng được trong Sổ tay ở ⚙ Cài đặt.',
    replay:'▶ Xem lại hướng dẫn thời tiết',
    locked:'🔒 Các chương về thời tiết mở ở cấp '
  };
  Object.assign(TX.steps,{
    wx_offer:['Chào bạn! Nhà mình vừa có thêm thời tiết đó.'],
    wx_hi:['Lên cấp '+WX_LV+' rồi! Từ giờ ngoài trời có nắng, mưa, gió, tuyết, và mỗi phòng có khí hậu riêng.','Tớ chỉ nhanh cách xem thời tiết và giữ cho các bé dễ chịu nhé.'],
    wx_chip:['Ô này là thời tiết ngoài trời: biểu tượng trời đang thế nào và nhiệt độ hiện tại.','Khi sắp có thời tiết nguy hiểm, ô này hiện dấu ⚠ để báo trước.'],
    wx_open:['Bấm vào ô thời tiết để mở Sách khí hậu.'],
    wx_left:['Trang bên trái là dự báo: trời bây giờ, mùa, các đợt sắp tới và cảnh báo nếu trời sắp xấu.','Dòng cuối trang nói ngắn gọn trời này ảnh hưởng gì tới mèo và viễn chinh.'],
    wx_right:['Trang bên phải là các phòng của bạn: nhiệt độ, độ ẩm, độ thoải mái, thiết bị đang chạy và cảnh báo quá nóng, quá lạnh.','Nhiều phòng thì lật trang bằng nút ◀ ▶. Bấm vào một phòng để xem chi tiết và thiết bị của phòng đó.'],
    wx_fx:['Nóng, lạnh, mưa, gió đều tác động lên ba chỉ số Vui, Năng lượng và Thức ăn của mèo.'],
    wx_stab:['Giờ mình ghé Cửa hàng xem đồ giữ ấm và làm mát nhé. Bấm vào tab Cửa hàng.'],
    wx_cat:['Cửa hàng có thêm các mục Giữ ấm, Làm mát, Chống thời tiết, Tiện nghi và Sinh tồn.','Máy sưởi làm phòng ấm lên, quạt và điều hòa làm phòng mát đi. Món nào chưa đủ cấp sẽ ghi 🔒 kèm cấp cần đạt.'],
    wx_gift:['Tớ tặng bạn một thiết bị chạy pin hợp với thời tiết lúc này. Bấm nút để nhận, tớ đặt luôn vào phòng cho.'],
    wx_dev:['Máy đã nằm trong phòng rồi đó. Chạm vào máy để bật hoặc tắt; máy chạy pin 12 giờ rồi tự sạc 1 giờ.','Muốn dời chỗ thì bấm ✏ Sắp xếp đồ rồi kéo máy đi.'],
    wx_room:['Đây là trang chi tiết của phòng: thiết bị vừa đặt đã có tác dụng, nhiệt độ phòng đổi theo.','Phòng nào hay quá nóng hoặc quá lạnh thì mua thêm thiết bị cho phòng đó nhé.'],
    wx_done:['Xong rồi! Quà nhỏ cho bạn đây.'],
    wx_bye:['Nhớ ngó ô thời tiết mỗi lần ghé nhà. Cần xem lại thì mở Sổ tay trong ⚙ Cài đặt. Chúc các bé luôn dễ chịu!']
  });

  /* ---------- thiết bị tặng: chọn theo thời tiết lúc nhận, đặt vào phòng đang xem ---------- */
  const homeRoom=()=>S.rooms[cur]&&cur!=='wait'?cur:'living';
  const pickDev=()=>{const d=st().wxd;if(d&&FURN[d.fid])return d.fid;return roomClimate(homeRoom()).T>WXC.ideal[1]?'bfan':'bheater'};
  function giveDev(){
    return TUT.once('wxdev',()=>{
      const fid=pickDev(),f=FURN[fid],rid=homeRoom();
      const it={iid:S.nid++,fid,room:rid,x:clamp(Math.round((camX+VW/2)/4)*4,f.w/2+8,WORLD_W-f.w/2-8),y:150,flip:false,broken:false};
      S.items.push(it);if(typeof clampItem==='function')clampItem(it);st().wxd={fid,iid:it.iid};wxDirty();
      toast(f.n+' đã đặt ở '+ROOM[rid].n,{icon:'🎁',title:TX.guide.name,ms:4200});
    });
  }
  function giveRw(){
    return TUT.once('wxrw',()=>{S.coins+=RW.coins;S.tickets+=RW.tickets;
      toast('+'+RW.tickets+' vé 🎟',{type:'coin',title:TX.wx.rwTitle,coins:RW.coins,ms:4200})});
  }
  const devItem=()=>{const d=st().wxd;return d&&S.items.find(i=>i.iid===d.iid&&i.room!=null)};
  function devRect(){
    const it=devItem();if(!it||tab!=='home'||it.room!==cur)return null;
    const f=FURN[it.fid],r=room.getBoundingClientRect(),s=room.clientWidth/VW,x0=r.left+room.clientLeft,y0=r.top+room.clientTop;
    const R={left:x0+(it.x-f.w/2-camX)*s,top:y0+(it.y-f.h-camY)*s,width:f.w*s,height:f.h*s};
    return R.left<r.left||R.left+R.width>r.right||R.top<r.top||R.top+R.height>r.bottom?null:R;
  }
  function showDev(){const it=devItem();if(!it)return;if(tab!=='home')setTab('home');if(cur!==it.room)setRoom(it.room);if(fol)unfollow(false);
    const f=FURN[it.fid];camX=it.x-VW/2;camY=it.y-f.h/2-VHV/2;clampCam()}

  /* ---------- thẻ giữa màn ---------- */
  const offerCard=()=>'<h3>'+TX.wx.offerTitle+'</h3><div style="text-align:left;line-height:1.45">'+TX.wx.offer+'</div>'+
    '<div class="row" style="justify-content:center;margin-top:10px"><button class="go" onclick="TUT._fa(1)">'+TX.wx.offerYes+'</button><button onclick="TUT._fa(0)">'+TX.wx.offerNo+'</button></div>';
  const fxCard=()=>'<h3>'+TX.wx.fxTitle+'</h3><div class="tut-gift">'+TX.wx.fx.map(r=>'<div><span style="font-size:22px">'+r[0]+'</span><span><b>'+r[1]+'</b><br><small>'+r[2]+'</small></span></div>').join('')+'</div>';
  const devCard=()=>{const f=FURN[pickDev()];
    return '<h3>'+TX.wx.devTitle+'</h3><div class="tut-gift"><div>'+furnTag(f.id,'',44,40)+'<span><b>'+f.n+'</b><br><small>'+f.d+'</small></span></div></div>'+
      (TUT.replaying()||got('wxdev')?'<div class="dim">'+TX.wx.devGot+'</div>':'<button class="go tut-giftbtn" onclick="TUT._fa()">🎁 '+TX.wx.devBtn+'</button>')};
  const rwCard=()=>'<h3>'+TX.wx.rwTitle+'</h3><div class="tut-gift"><div>🪙 <b>'+RW.coins+'</b> xu</div><div>🎟 <b>'+RW.tickets+'</b> vé gacha</div></div>'+
    (TUT.replaying()||got('wxrw')?'<div class="dim">'+TX.wx.rwGot+'</div>':'<button class="go tut-giftbtn" onclick="TUT._fa()">🎁 '+TX.wx.rwBtn+'</button>');

  const shut=()=>{if(TUT.modalOn())closeModal();if(typeof closeBook==='function')closeBook()};
  const live=()=>!TUT.replaying();
  const STEPS=[
    {id:'wx_offer',say:'wx_offer',card:offerCard,btn:1,replayOff:1,skip:()=>!S.wxOld,tap(i){if(!i){TUT._skipYes();return false}}},
    {id:'wx_hi',say:'wx_hi',guide:1,enter:shut},
    {id:'wx_chip',say:'wx_chip',tab:'home',target:'#top .wxchip',enter:shut},
    {id:'wx_open',say:'wx_open',tab:'home',target:'#top .wxchip',act:'openBook',done:()=>bookOn(),enter:shut},
    {id:'wx_left',say:'wx_left',target:'#wxbook .wb-l',enter(){if(!bookOn())openBook();else if(WB.rid)bookRoom(null)}},
    {id:'wx_right',say:'wx_right',target:'#wxbook .wb-r',enter(){if(!bookOn())openBook();else if(WB.rid)bookRoom(null)}},
    {id:'wx_fx',say:'wx_fx',card:fxCard,enter:shut},
    {id:'wx_stab',say:'wx_stab',target:TUT.tabBtn('shop'),act:'setTab',done:()=>tab==='shop',enter:shut},
    {id:'wx_cat',say:'wx_cat',tab:'shop',target:'#panel > .row.wrap',enter(){shut();shopT='warm';shopSel=null;renderPanel()}},
    {id:'wx_gift',say:'wx_gift',tab:'home',card:devCard,btn:1,enter:shut,tap(){giveDev()},skip:()=>live()&&got('wxdev')},
    {id:'wx_dev',say:'wx_dev',tab:'home',target:()=>devRect()||$('roomwrap'),enter(){shut();showDev()},skip:()=>!devItem()},
    {id:'wx_room',say:'wx_room',target:'#wxbook .wb-r',enter(){const it=devItem();openClimate(it?it.room:homeRoom())}},
    {id:'wx_done',say:'wx_done',tab:'home',card:rwCard,btn:1,enter:shut,tap(){giveRw()},skip:()=>live()&&got('wxrw')},
    {id:'wx_bye',say:'wx_bye',guide:1,enter:shut}
  ];
  // trong chế độ xem lại, thẻ có nút thành thẻ xem (chạm để sang câu)
  STEPS.forEach(s=>{if(s.btn){const b=1;Object.defineProperty(s,'btn',{get:()=>live()?b:0})}});

  TUT.addFlow('wx',{
    steps:STEPS,skipText:TX.wx.skip,
    when:()=>typeof wxOpen==='function'&&wxOpen()&&!st().wx,
    // xong hoặc bỏ qua: phát đủ quà (mỗi phần một cờ), đánh dấu để không lặp lại
    end(){giveDev();giveRw();st().wx=1;delete S.wxOld},
    close:shut
  });

  /* ---------- Sổ tay: nút xem lại; trước cấp WX_LV thì ẩn các chương thời tiết ---------- */
  const WXP=['weather','climate','climstat','climfix','health','supply'];
  if(typeof THB_BOOK!=='undefined'){
    const all=TX.book.pages;
    Object.defineProperty(TX.book,'pages',{get:()=>wxOpen()?all:all.filter(p=>!WXP.includes(p.id))});
    const open0=THB_BOOK.open;
    THB_BOOK.open=function(id){
      if(id&&!wxOpen()&&WXP.includes(id)){toast(TX.wx.locked+WX_LV+'.',{icon:'🔒'});return}
      open0.apply(this,arguments);
      if(id&&all.some(p=>p.id===id))return;
      const a=document.querySelector('#mbox .thb-book .thb-actions');if(!a)return;
      a.insertAdjacentHTML('afterbegin',wxOpen()?'<button class="thb-replay" onclick="closeModal();TUT.startReplay(\'wx\')">'+TX.wx.replay+'</button>':'<button disabled>'+TX.wx.locked+WX_LV+'</button>');
    };
  }
})();
