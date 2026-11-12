"use strict";
/* ============ ĐIỆN NĂNG: CẤU HÌNH (2026-11-12) ============
   Mọi con số cân bằng của hệ thống điện nằm ở file này; luật ở js/pw.js, giao diện ở js/pw-ui.js, hình ở js/furn/pw-01.js.
   Nạp ngay sau js/wx-data.js (cần FURN, FCATS, WXDEV, WX_LV, nicePrice).
   - Mọi thiết bị điện chạy pin, KHÔNG BAO GIỜ tự sạc (kể cả khi pin yếu, lúc đăng nhập hay lúc vắng). Người chơi cắm vào ổ điện gắn tường và trả xu.
   - Phí sạc tính theo lượng pin nạp vào: phí = làm tròn lên (phí sạc đầy × phần pin nạp). Không sạc quá dung lượng.
   - Điện mặt trời giảm 50% phí sạc (làm tròn lên) khi bộ lưu trữ còn đủ năng lượng; nhiều tấm chỉ tăng công suất, không giảm thêm.
   - Sét đánh mất điện 15 phút: chỉ khi mưa giông, 5% mỗi đợt, mỗi đợt xét đúng một lần. */

const PWC={
  low:.2,                 // dưới 20% pin thì cảnh báo
  outage:{p:.05,min:15,types:['storm'],delay:[1,20]}, // xác suất mỗi đợt giông; mất điện 15 phút thật; sét đánh sau 1–20 phút kể từ lúc xét (nếu đợt giông còn đủ dài)
  solar:{cut:.5,base:80,stor:150,storMax:2,day:[6,18],
    // hệ số công suất theo thời tiết: nắng bình thường, nhiều mây (gió, sương) giảm, mưa giảm mạnh; ban đêm 0
    wx:{sunny:1,ideal:1,hot:1,heatwave:1,cold:.85,wind:.7,fog:.35,drizzle:.3,storm:.1,snow:.15,blizzard:.05}},
  room:{balcony:2,rooftop:4}, // số tấm pin tối đa có tác dụng ở mỗi chỗ (Hệ mặt trời thông minh tính riêng, 1 bộ mỗi chỗ)
  wet:['balcony','garden','pool','rooftop','bathroom'], // chỗ ẩm hoặc ngoài trời: chỉ ổ chống nước dùng được
  fear:{hit:5,hp:1,en:.3,decOn:6,decLit:3,decDark:1,shelter:2,darkK:1.5,litK:.6,shK:.6,pet:30,petCd:20,awayHp:30,torch:15},
  // hit: độ vui mất lúc sét đánh; hp: độ vui mất mỗi phút khi hoảng sợ; en: năng lượng mất thêm mỗi phút;
  // dec*: mức giảm nỗi sợ mỗi phút (có điện / mất điện nhưng phòng có đèn / phòng tối); shelter: nằm trong ổ, nhà mèo giảm sợ nhanh thêm;
  // darkK: phòng tối mất vui nhanh hơn; litK, shK: đèn và chỗ trú làm mất vui chậm lại; pet: vỗ về giảm ngay 30 nỗi sợ (mỗi bé 20 giây một lần);
  // awayHp: lúc vắng mặt độ vui không bị kéo xuống dưới mức này; torch: đèn pin soi sáng một phòng trong 15 phút.
  speedPro:2,             // ổ cao cấp sạc nhanh gấp 2
};
const SOLAR_LV=6,GEN_LV=14;

/* ---------- thiết bị dùng điện: dung lượng (Wh), công suất (W), phí sạc đầy (xu), thời gian sạc đầy ở ổ thường (phút), kiểu tiêu thụ ----------
   mode: 'on' chạy khi đang bật và có tác dụng; 'auto' chỉ tốn pin khi đang thật sự sưởi hoặc làm mát; 'bed' chỉ tốn pin khi có bé nằm trên;
   'always' luôn chạy khi đặt trong phòng; 'out' chỉ sáng khi phòng bị mất điện (đèn khẩn cấp).
   Phí sạc đầy theo bảng của người dùng: quạt mini 10, quạt đứng 20, đèn sưởi 25, máy lọc không khí 30, máy hút ẩm 35, máy sưởi 45,
   máy nước nóng 50, điều hòa 70, điều hòa hai chiều 90, thiết bị khí hậu cao cấp 120; món khác xếp vào bậc gần nhất. */
const PW_DEV={
  bfan:[200,20,10,30,'on'],fanmini:[240,30,10,30,'on'],
  bicefan:[300,40,20,40,'on'],fanstand:[400,50,20,40,'on'],fanceiling:[400,50,20,40,'on'],mistfan:[450,60,25,45,'on'],
  bwarmlamp:[400,60,25,45,'on'],heatlamp:[500,80,25,45,'on'],heatmat:[400,50,25,40,'on'],eblanket:[300,40,25,40,'bed'],heatcatbed:[300,40,30,40,'bed'],
  airpurifier:[600,40,30,50,'always'],humidifier:[500,35,30,50,'always'],dehumid:[600,50,35,50,'always'],aircooler:[600,80,35,50,'on'],
  bheater:[500,70,45,50,'on'],heatmini:[700,100,45,60,'on'],waterheater:[900,60,50,60,'always'],
  ac1:[1200,200,70,75,'auto'],ac2:[1500,250,90,90,'auto'],heatpro:[2000,250,120,90,'auto'],smartbed:[1200,100,120,90,'bed'],
  hairdryer:[200,20,15,30,'always'],whitenoise:[240,10,10,30,'always'],wxstation:[480,10,15,40,'always'],thermostat:[480,10,10,30,'always'],
  sensor:[480,10,10,30,'always'],waterfilter:[480,20,20,40,'always'],feeder:[480,20,20,40,'always'],
  elamp:[120,20,10,30,'out'],
};
// đèn trang trí nối điện lưới của nhà (không có pin, không cần sạc): tắt khi mất điện, mất luôn hiệu ứng tới khi có điện lại hoặc máy phát chạy
const PW_GRID=['lamp','lamppink','lampblue','desklamp','fairylights','moonlamp'];

/* ---------- đồ mới trong mục ⚡ Điện năng ---------- */
const PD=(id,n,price,kind,w,h,ul,o)=>Object.assign({id,n,price,kind,w,h,cat:'power',art:id,a:[],ul,pwx:1},o||{});
const PWITEMS=[
  // ổ điện gắn tường: ports = số thiết bị sạc cùng lúc
  PD('out1','Ổ điện đơn',150,'wall',8,9,2,{outlet:{ports:1},d:'Ổ gắn tường 1 cổng: sạc 1 thiết bị một lúc.'}),
  PD('out2','Ổ điện đôi',300,'wall',12,9,2,{outlet:{ports:2},d:'Ổ gắn tường 2 cổng: sạc 2 thiết bị cùng lúc.'}),
  PD('out4','Ổ điện 4 cổng',700,'wall',18,9,3,{outlet:{ports:4},d:'Ổ gắn tường 4 cổng: sạc 4 thiết bị cùng lúc.'}),
  PD('outsmart','Ổ điện thông minh',900,'wall',12,11,4,{outlet:{ports:2,smart:1},anim:1,d:'Ổ 2 cổng có màn hình: hiện % pin và thời gian sạc còn lại ngay trên tường, báo khi sạc xong.'}),
  PD('outwet','Ổ điện chống nước',600,'wall',12,10,4,{outlet:{ports:2,wet:1},d:'Ổ 2 cổng có nắp che: dùng được ở chỗ ẩm (phòng tắm) và ngoài trời (ban công, sân vườn, hồ bơi, sân thượng).'}),
  PD('outpro','Ổ điện cao cấp',1800,'wall',14,10,6,{outlet:{ports:2,speed:PWC.speedPro},anim:1,d:'Ổ 2 cổng sạc nhanh gấp '+PWC.speedPro+' lần.'}),
  // đèn khẩn cấp: tự sáng khi mất điện
  PD('elamp','Đèn khẩn cấp dùng pin',350,'floor',10,16,2,{anim:1,d:'Tự sáng khi mất điện: phòng không tối, các bé đỡ sợ hơn. Chạy pin, cần sạc tay.'}),
  // điện mặt trời: chỉ lắp ở ban công hoặc sân thượng
  PD('solar1','Tấm pin mặt trời cơ bản',3000,'floor',28,20,SOLAR_LV,{solar:{rate:20},rooms:['balcony','rooftop'],anim:1,d:'Tạo khoảng 20 đơn vị điện mỗi giờ lúc nắng đẹp giữa trưa.'}),
  PD('solarbat','Bộ lưu trữ nâng cấp',2000,'floor',14,18,8,{solar:{stor:PWC.solar.stor},d:'Tăng dung lượng lưu trữ điện mặt trời thêm '+PWC.solar.stor+' đơn vị (tối đa '+PWC.solar.storMax+' bộ có tác dụng). Đặt ở phòng nào cũng được.'}),
  PD('solar2','Tấm pin mặt trời cao cấp',9000,'floor',30,22,10,{solar:{rate:45},rooms:['balcony','rooftop'],anim:1,d:'Tạo khoảng 45 đơn vị điện mỗi giờ lúc nắng đẹp giữa trưa.'}),
  PD('solarsmart','Hệ mặt trời thông minh',15000,'floor',40,28,12,{solar:{rate:60,stor:200,smart:1},rooms:['balcony','rooftop'],anim:1,d:'Trọn bộ: tạo khoảng 60 đơn vị mỗi giờ, thêm 200 đơn vị lưu trữ, sách điện hiện dự báo sản lượng các đợt thời tiết tới.'}),
  // máy phát dự phòng (bộ lưu điện an toàn, không khí thải): chỉ đặt ở tầng hầm
  PD('gen1','Máy phát dự phòng mini',3000,'floor',20,16,GEN_LV,{gen:{run:5,fee:80},rooms:['basement'],anim:1,d:'Bộ lưu điện an toàn, không khí thải. Chạy 5 phút khi mất điện (không đủ cho cả một lần mất điện 15 phút).'}),
  PD('gen2','Máy phát dự phòng tiêu chuẩn',7000,'floor',24,20,GEN_LV,{gen:{run:15,fee:150},rooms:['basement'],anim:1,d:'Bộ lưu điện an toàn, không khí thải. Chạy 15 phút khi mất điện, đủ cho một lần mất điện.'}),
  PD('gen3','Máy phát dự phòng cao cấp',14000,'floor',30,24,15,{gen:{run:30,fee:250},rooms:['basement'],anim:1,d:'Bộ lưu điện an toàn, không khí thải. Chạy 30 phút khi mất điện.'}),
];

/* ---------- gắn vào nội thất, cửa hàng, lộ trình ---------- */
FCATS.push(['power','⚡ Điện năng']);
PWITEMS.forEach(f=>{if(FURN[f.id])throw new Error('trùng id nội thất '+f.id);FURNS.push(f);FURN[f.id]=f});
Object.entries(PW_DEV).forEach(([id,a])=>{const f=FURN[id];if(!f)throw new Error('PW_DEV: không có món '+id);
  f.pw={batteryCapacity:a[0],powerConsumption:a[1],chargingCost:a[2],chargingDuration:a[3],requiresElectricity:true,mode:a[4]};
  const h=a[0]/a[1];f.d+=' 🔋 Chạy pin '+(h>=1?String(Math.round(h*10)/10).replace('.',',')+' giờ':Math.round(h*60)+' phút')+(a[4]==='auto'?' khi đang chạy':a[4]==='bed'?' khi có bé nằm':'')+', sạc đầy '+a[2]+' xu ('+a[3]+' phút). Không tự sạc: cắm vào ổ điện gắn tường để sạc.';});
PW_GRID.forEach(id=>{const f=FURN[id];if(f){f.grid=1;f.d+=' Đèn nối điện lưới: tắt khi mất điện.'}});
FEATS.push({lv:WX_LV,id:'pw',ic:'🔌',n:'Điện năng',d:'Thiết bị điện chạy pin và phải sạc tay bằng xu qua ổ điện gắn tường. Mở sách điện ở ô ⚡ trên cùng.'},
  {lv:SOLAR_LV,id:'solar',ic:'☀️',n:'Điện mặt trời',d:'Tấm pin ở ban công hoặc sân thượng: giảm 50% phí sạc khi bộ lưu trữ còn đủ điện.'},
  {lv:GEN_LV,id:'gen',ic:'🔋',n:'Máy phát dự phòng',d:'Đặt ở tầng hầm: tự cấp điện khi sét đánh mất điện.'});
// trạng thái Hoảng sợ (hiện cùng các trạng thái thời tiết trên thẻ mèo và màn chi tiết)
WXST.scared={n:'Hoảng sợ',ic:'😱',d:'Bé sợ sấm sét và mất điện: độ vui giảm khoảng 1 mỗi phút, tốn năng lượng hơn. Phòng tối thì sợ lâu hơn.',cure:'Chờ có điện lại (hoặc chạy máy phát dự phòng), đặt đèn khẩn cấp, soi đèn pin, cho bé vào ổ hoặc nhà mèo, vuốt ve vỗ về bé.'};
