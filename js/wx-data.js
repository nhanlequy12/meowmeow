"use strict";
/* ============ THỜI TIẾT, KHÍ HẬU PHÒNG, THIẾT BỊ, VẬT PHẨM SINH TỒN: CẤU HÌNH (2026-11-11) ============
   Mọi con số cân bằng nằm ở file này; luật nằm ở js/wx.js, giao diện ở js/wx-ui.js, hình thiết bị ở js/furn/*.js.
   Nạp ngay sau data.js. Thời tiết là hàm của đồng hồ và hạt giống chung WXC.seed nên mọi người chơi thấy cùng một trời. */

const WXC={
  seed:20261111,        // hạt giống chung; server.py gửi kèm khi ping để cả nhóm cùng một trời
  tz:7,                 // múi giờ tính ngày và mùa (giờ Việt Nam)
  block:60,             // phút: một mốc là 1 giờ
  lens:[5],             // một đợt thời tiết dài 5 mốc = 5 giờ
  anchor:24,            // mỗi ngày (theo giờ Việt Nam) tính lại từ đầu: các đợt 0–5, 5–10, 10–15, 15–20 giờ, đợt cuối 20–24 giờ ngắn hơn; sang ngày là sang mùa nên thời tiết bốc lại theo mùa mới
  maxBad:2,             // tối đa 2 đợt xấu liền nhau (10 giờ), đợt sau chắc chắn tốt
  ideal:[20,26],        // nhiệt độ dễ chịu trong phòng (°C)
  comfyHum:[35,65],     // độ ẩm dễ chịu (%)
  indoor:24,            // nhiệt độ một phòng kín hoàn toàn
  // tác động mỗi phút theo số độ lạnh dưới coldAt hoặc nóng trên hotAt (nhiệt độ cảm nhận của bé)
  coldAt:16, hotAt:28,   // dưới 16°C là lạnh. Phòng trong nhà mùa đông xuống khoảng 11–15°C: lạnh ít hơn ngoài trời nhiều nhưng vẫn cần sưởi
  coldHp:.25, coldEn:.19, coldHunger:.035, coldExpo:1,  // 8°C: -2 vui/phút, -1,5 năng lượng/phút, đói nhanh hơn 28%
  hotHp:.15, hotEn:.2, hotWater:.1, hotExpo:1,
  freezeAt:5, scorchAt:36, extremeHealth:.1,             // dưới 5°C hoặc trên 36°C: mất sức khỏe theo số độ
  expoDecay:10,         // điểm phơi lạnh/nóng giảm mỗi phút khi đã ấm/mát lại
  coldSt:60, hotSt:60,  // phơi từ mức này trở lên thì bé có trạng thái Lạnh / Nóng quá
  sickAt:260, sickP:.004, // phơi lạnh từ 260: mỗi phút có (phơi-260)/100*0,4% khả năng bị ốm
  wetRate:8, dryRate:2, wetSt:40, wetFeel:4, // ướt: dầm mưa to tăng 8/phút (mưa nhẹ 4, trừ phần khô 2); khô 2/phút; từ 40 là Ướt; ướt thì thấy lạnh thêm 4°C
  sick:{start:90, heal:1, health:.25, happy:.3},          // ốm: 90 điểm bệnh, nghỉ chỗ tốt giảm 1 mỗi phút; mất 0,25 sức khỏe/phút
  water:{decay:100/300, drinkAt:60, drink:45, low:25, lowHappy:.3, zeroHealth:.3, trip:1.5},
  health:{regen:.15, bedX:2, tripMin:30, lowHappy:15},
  comfort:{rate:3, degPen:6, humPen:.5, wind:20, rain:20, noise:10, devCap:15, happy:.25},
  exhaustAt:8, exhaustOff:35, restMin:45,
  away:{hp:30, en:15, health:40, water:25},               // lúc vắng mặt thời tiết không kéo chỉ số xuống dưới các mức này, và không phát bệnh mới
  resCap:.6, luckCap:.15, kitSlots:4,                     // vật phẩm sinh tồn: kháng cùng loại tối đa 60%, may mắn tối đa +15%, mang tối đa 4 loại
  warnAhead:1,          // báo trước bao nhiêu đợt thời tiết nguy hiểm (có Trạm dự báo thì 2, tức tới 10 giờ trước)
};

/* ---------- các kiểu thời tiết ----------
   t: lệch nhiệt độ so với nền của mùa; h: độ ẩm; r: mưa (0..1); w: gió (0..1); n: ồn (sấm);
   bad: mức xấu (0 tốt, 1 hơi xấu, 2 xấu, 3 cực đoan); risk: rủi ro mỗi 10 phút viễn chinh; dur, cost: hệ số thời gian và năng lượng chuyến đi;
   fx: hiệu ứng hình; res: loại kháng giảm rủi ro (cold, heat, rain, fog, storm); coin: hệ số xu chuyến đi */
const WX={
  sunny:  {n:'Nắng đẹp',ic:'☀️',t:2,h:50,r:0,w:.1,n0:0,bad:0,risk:.01,dur:1,cost:1,fx:'sun',coin:1,d:'Dễ chịu, mèo vui vẻ và hoạt động bình thường.'},
  hot:    {n:'Nắng nóng',ic:'🔥',t:8,h:40,r:0,w:.1,n0:0,bad:1,risk:.05,dur:1,cost:1.25,fx:'heat',res:'heat',coin:1,d:'Nóng: mèo nhanh mệt, nhanh khát.'},
  drizzle:{n:'Mưa nhẹ',ic:'🌧️',t:-3,h:85,r:.5,w:.2,n0:0,bad:1,risk:.04,dur:1.15,cost:1.05,fx:'rain',res:'rain',coin:1,d:'Mát hơn; phòng ngoài trời bị mưa tạt, mèo có thể bị ướt.'},
  storm:  {n:'Mưa giông',ic:'⛈️',t:-5,h:92,r:1,w:.7,n0:1,bad:2,risk:.1,dur:1.25,cost:1.15,fx:'storm',res:'storm',coin:1,d:'Sấm sét ồn ào làm mèo kém vui; viễn chinh dễ gặp sự cố.'},
  cold:   {n:'Trời lạnh',ic:'❄️',t:-9,h:55,r:0,w:.3,n0:0,bad:1,risk:.05,dur:1.05,cost:1.15,fx:'cold',res:'cold',coin:1,d:'Mèo dễ bị rét, tốn năng lượng và thức ăn hơn.'},
  snow:   {n:'Tuyết rơi',ic:'🌨️',t:-16,h:80,r:.6,w:.3,n0:0,bad:2,risk:.09,dur:1.3,cost:1.3,fx:'snow',res:'cold',coin:1,d:'Lạnh nghiêm trọng, nhất là phòng ngoài trời.'},
  wind:   {n:'Gió mạnh',ic:'🌪️',t:-2,h:50,r:0,w:1,n0:.3,bad:1,risk:.05,dur:1.05,cost:1.05,fx:'wind',res:'storm',coin:1,d:'Ban công và chỗ thoáng khó chịu, mèo khó nghỉ.'},
  fog:    {n:'Sương mù',ic:'🌫️',t:-2,h:95,r:.1,w:0,n0:0,bad:1,risk:.07,dur:1.1,cost:1,fx:'fog',res:'fog',coin:1,d:'Tầm nhìn kém, viễn chinh dễ lạc đường.'},
  ideal:  {n:'Thời tiết lý tưởng',ic:'🌈',t:0,h:50,r:0,w:.1,n0:0,bad:0,risk:0,dur:.9,cost:.9,fx:'ideal',coin:1.15,d:'Mèo vui hơn, hồi năng lượng nhanh hơn; viễn chinh được thưởng thêm.'},
  heatwave:{n:'Nắng như đổ lửa',ic:'🥵',t:14,h:35,r:0,w:.1,n0:0,bad:3,risk:.12,dur:1.1,cost:1.5,fx:'heat',res:'heat',coin:1,rare:1,d:'Cực đoan, hiếm gặp: nóng gay gắt, rất dễ kiệt sức.'},
  blizzard:{n:'Bão tuyết',ic:'🌬️',t:-22,h:85,r:.9,w:1,n0:.6,bad:3,risk:.14,dur:1.4,cost:1.4,fx:'blizzard',res:'cold',coin:1,rare:1,d:'Cực đoan, hiếm gặp: lạnh cắt da, phòng ngoài trời rất nguy hiểm.'},
};
// mùa: mỗi mùa kéo dài 1 ngày thật, xoay vòng xuân, hạ, thu, đông. base: nhiệt độ nền; w: trọng số các kiểu thời tiết
const SEASONS=[
  {id:'spring',n:'Xuân',ic:'🌸',base:23,w:{sunny:30,ideal:16,drizzle:20,fog:12,wind:8,storm:6,hot:5,cold:3}},
  {id:'summer',n:'Hạ',ic:'🌻',base:31,w:{sunny:28,hot:24,storm:16,drizzle:10,ideal:8,wind:6,fog:2,heatwave:2}},
  {id:'autumn',n:'Thu',ic:'🍁',base:24,w:{sunny:26,ideal:14,wind:16,drizzle:16,fog:12,cold:8,storm:6,hot:2}},
  {id:'winter',n:'Đông',ic:'⛄',base:13,w:{cold:30,sunny:18,snow:16,fog:12,wind:10,drizzle:8,ideal:4,blizzard:2}},
];
const WXDAY=[-4,-4.5,-5,-5,-4.5,-4,-3,-2,-1,0,1.5,2.5,3.5,4,4,3.5,3,2,1,0,-1,-2,-3,-3.5]; // lệch nhiệt độ theo giờ trong ngày

/* ---------- khí hậu từng phòng ----------
   exp: mức nhiệt độ ngoài trời lọt vào (0 kín, 1 ngoài trời); out: phòng ngoài trời (mưa, gió tạt thẳng); base: nhiệt độ khi kín; hum: độ ẩm khi kín;
   ins: cách nhiệt sẵn có; bath: phòng tắm (trời lạnh mà không có máy nước nóng thì mèo khó chịu) */
const ROOM_CLIMATE={
  living:{exp:.5,base:22,hum:50},bedroom:{exp:.42,base:22,hum:50,ins:.1},kitchen:{exp:.42,base:24,hum:55},balcony:{exp:.95,out:1,base:24,hum:55},
  bathroom:{exp:.45,base:22,hum:70,bath:1},playroom:{exp:.45,base:22,hum:50},dining:{exp:.45,base:23,hum:52},attic:{exp:.7,base:22,hum:45},
  garden:{exp:1,out:1,base:24,hum:60},library:{exp:.4,base:22,hum:42,ins:.1},gameroom:{exp:.4,base:24,hum:45},greenhouse:{exp:.6,base:28,hum:70},
  tatami:{exp:.45,base:22,hum:55},basement:{exp:.15,base:18,hum:65},pool:{exp:.8,out:1,base:25,hum:70},rooftop:{exp:1,out:1,base:24,hum:55},
  royal:{exp:.3,base:22,hum:48,ins:.2},wait:{exp:.5,base:22,hum:50},
};

/* ---------- cửa sổ nhìn ra ngoài (vẽ trên tường, sau lưng nội thất) ----------
   [tâm x, đỉnh y, rộng, cao, kiểu]: kiểu '' chữ nhật có song chéo, 'arch' vòm, 'round' tròn (gác mái), 'band' dải kính cả bề ngang (nhà kính).
   Không có: tầng hầm (dưới đất), ban công, sân vườn, hồ bơi, sân thượng (vốn ở ngoài trời). */
const ROOM_WIN={
  living:[[140,18,50,44],[340,18,50,44]],bedroom:[[230,20,44,40]],kitchen:[[300,16,44,34]],bathroom:[[360,12,30,22]],
  playroom:[[110,18,46,42],[370,18,46,42]],dining:[[160,14,44,46],[320,14,44,46]],attic:[[240,14,34,34,'round']],
  library:[[240,8,40,54,'arch']],gameroom:[[275,18,40,34]],tatami:[[330,8,52,48]],royal:[[140,12,36,52,'arch'],[300,12,36,52,'arch']],
  greenhouse:[[240,0,480,30,'band']],wait:[[240,20,44,38]],
};

/* ---------- trạng thái tạm thời của mèo (hiện ở thẻ mèo, màn chi tiết, khung theo dõi) ---------- */
const WXST={
  cold:{n:'Lạnh',ic:'🥶',d:'Bé run vì lạnh: hồi năng lượng chậm hơn 15%, kém vui.',cure:'Cho bé vào phòng ấm từ 20°C, đặt máy sưởi, chăn, giường sưởi; hoặc cho uống súp nóng.'},
  hot:{n:'Nóng quá',ic:'🥵',d:'Bé thở hổn hển: nhanh khát hơn 50%, hồi năng lượng chậm hơn 15%.',cure:'Cho bé vào phòng mát dưới 28°C, đặt quạt, điều hòa, thảm làm mát; hoặc dùng nước điện giải, gel làm mát.'},
  wet:{n:'Ướt',ic:'💦',d:'Lông ướt: kém thoải mái và thấy lạnh hơn 4°C.',cure:'Cho bé vào chỗ có mái che; máy sấy lông làm khô ngay; phòng ấm khô nhanh hơn.'},
  exhausted:{n:'Kiệt sức',ic:'😵',d:'Năng lượng gần cạn: chưa đi viễn chinh được, kém vui.',cure:'Cho bé ngủ trên ổ tới khi hồi 35 năng lượng, hoặc dùng thanh năng lượng.'},
  sick:{n:'Ốm',ic:'🤒',d:'Bé bị cảm: mất dần sức khỏe, hồi năng lượng chậm 40%, viễn chinh rủi ro hơn.',cure:'Dùng thuốc chống cảm, hoặc cho bé nghỉ ở phòng ấm, khô, thoải mái khoảng 1,5 giờ.'},
  comfy:{n:'Thoải mái',ic:'😌',d:'Phòng vừa ý: vui hơn, hồi năng lượng nhanh hơn 10%.',cure:''},
  rested:{n:'Ngủ ngon',ic:'🌙',d:'Vừa ngủ một giấc ngon: viễn chinh +5% xu, tốn ít năng lượng hơn 10%.',cure:''},
  thirsty:{n:'Khát',ic:'💧',d:'Thiếu nước: kém vui, hồi năng lượng chậm; hết nước thì mất sức khỏe.',cure:'Đổ nước vào bát nước trong phòng (miễn phí), hoặc đặt máy lọc nước.'},
};

/* ---------- thiết bị gia dụng: nội thất có trường wx ----------
   wx.heat / wx.cool: số độ làm ấm / làm mát phòng; auto: chỉ chạy khi cần (giữ phòng quanh 21–25°C), không thì chạy liên tục nếu đang bật;
   ins: cách nhiệt (giảm phần nhiệt độ ngoài trời lọt vào); sun: cách nhiệt chỉ khi trời nóng (rèm chống nắng); shelter: che mưa; wind: chắn gió;
   hum: thay đổi độ ẩm; comfort: cộng độ thoải mái; dry: làm khô lông mỗi phút; quiet: át tiếng sấm; bath: nước nóng phòng tắm;
   health: hồi sức khỏe thêm mỗi phút; station: trạm dự báo; thermo: biến máy sưởi, máy làm mát trong phòng thành tự động; sensor: báo khi phòng khó chịu;
   lheat / lcool / lauto: hiệu ứng riêng cho bé đang nằm trên món đó (ổ ngủ); lshelter: bé nằm trên món đó không bị ướt, không bị gió.
   rooms: các phòng món có tác dụng ('out' = phòng ngoài trời, 'in' = phòng trong nhà, thiếu là mọi phòng); max: số món cùng loại có tác dụng trong một phòng;
   rare: độ hiếm (1 thường, 2 hiếm, 3 sử thi); anim: có khung hoạt ảnh khi đang chạy (biến thể 'a1'); water: bát nước {cap, auto, cool, happy}. */
const RARE_N=['','Thường','Hiếm','Sử thi','Huyền thoại'];
const WD=(id,n,price,kind,w,h,cat,ul,rare,wx,o)=>Object.assign({id,n,price,kind,w,h,cat,art:id,a:[],ul,rare,wx:wx||{}},o||{});
const NAPA=(dx,dy)=>({dx,dy,front:1,sleep:1,emo:'z'});
const WXDEV=[
 // giữ ấm
 // giá rẻ, chạy pin: yếu hơn nhiều, bật tắt tay. Pin, phí sạc, ổ điện: js/pw-data.js (không còn tự sạc)
 WD('bheater','Máy sưởi tích điện',100,'floor',12,14,'warm',1,1,{heat:2},{max:2,anim:1,use:NAPA(10,1),d:'Rẻ, chạy pin: ấm phòng thêm 2°C khi đang bật.'}),
 WD('bwarmlamp','Đèn sưởi tích điện',140,'floor',10,20,'warm',2,1,{heat:2.5},{max:2,anim:1,use:NAPA(9,1),d:'Rẻ, chạy pin: ấm phòng thêm 2,5°C khi đang bật.'}),
 WD('bfan','Quạt tích điện mini',90,'floor',12,14,'cool',1,1,{cool:2},{max:2,anim:1,d:'Rẻ, chạy pin: mát phòng 2°C khi đang bật.'}),
 WD('bicefan','Quạt hơi đá tích điện',140,'floor',12,18,'cool',2,1,{cool:2.5,hum:3},{max:2,anim:1,d:'Rẻ, chạy pin: mát phòng 2,5°C khi đang bật, thêm chút độ ẩm.'}),
 WD('heatmini','Máy sưởi mini',300,'floor',16,18,'warm',2,1,{heat:4},{max:2,anim:1,use:NAPA(13,1),d:'Làm ấm phòng thêm 4°C khi đang bật. Mèo lạnh hay nằm cạnh.'}),
 WD('heatpro','Máy sưởi cao cấp',1400,'floor',20,26,'warm',7,2,{heat:8,auto:1},{max:1,anim:1,use:NAPA(15,1),d:'Tự sưởi khi phòng lạnh, tối đa thêm 8°C, không làm phòng nóng quá.'}),
 WD('heatlamp','Đèn sưởi',700,'floor',14,40,'warm',4,1,{heat:5,outok:1},{max:2,anim:1,d:'Làm ấm thêm 5°C, dùng được cả ngoài ban công, sân vườn.'}),
 WD('eblanket','Chăn điện',650,'floor',40,10,'warm',4,2,{lheat:8,comfort:3},{anim:1,bed:{en:3.5,at:[[-9,-3],[9,-3]]},use:NAPA(0,-3),d:'Ổ ngủ 2 chỗ: bé nằm trên chăn được sưởi thêm 8°C.'}),
 WD('furblanket','Chăn lông dày',450,'floor',44,12,'warm',3,1,{lheat:5,comfort:5},{bed:{en:3.2,at:[[-10,-4],[10,-4]]},use:NAPA(0,-4),d:'Ổ ngủ 2 chỗ: ấm thêm 5°C cho bé nằm trên, phòng thoải mái hơn.'}),
 WD('heatcatbed','Giường mèo có sưởi',900,'floor',36,18,'warm',5,2,{lheat:7},{anim:1,bed:{en:4,at:[[0,-5]]},use:NAPA(0,-5),d:'Ổ ngủ 1 chỗ có sưởi: bé nằm trên ấm thêm 7°C, hồi năng lượng nhanh gấp 4 lần.'}),
 WD('heatmat','Thảm sưởi',800,'floor',56,8,'warm',5,1,{heat:2,lheat:5},{anim:1,bed:{en:3,at:[[-16,-2],[0,-2],[16,-2]]},use:NAPA(0,-2),d:'Ấm phòng thêm 2°C; ổ ngủ 3 chỗ ấm thêm 5°C.'}),
 WD('fireplace','Lò sưởi',3200,'floor',48,44,'warm',10,3,{heat:10,comfort:8,rooms:'in'},{max:1,anim:1,use:NAPA(0,1),d:'Làm ấm phòng thêm 10°C, phòng thoải mái hơn. Mèo thích nằm sưởi trước lò.'}),
 WD('waterheater','Máy nước nóng',900,'wall',18,24,'warm',5,1,{bath:1,rooms:['bathroom']},{max:1,anim:1,d:'Chỉ dùng ở Phòng tắm: tắm nước ấm, không còn khó chịu khi trời lạnh, lông khô nhanh gấp 3.'}),
 WD('glassdoor','Cửa kính cách nhiệt',1200,'wall',32,40,'warm',6,2,{ins:.35,wind:.5},{max:2,d:'Cách nhiệt 35%, chắn gió 50%.'}),
 WD('thermcurtain','Rèm giữ nhiệt',500,'wall',30,34,'warm',3,1,{ins:.25},{max:2,d:'Cách nhiệt 25%: phòng ít bị nóng lạnh theo ngoài trời.'}),
 WD('wintercathouse','Nhà mèo chống rét',1600,'floor',40,36,'warm',8,2,{lheat:8,lshelter:1},{bed:{en:4,at:[[-8,-2],[8,-2]]},use:NAPA(0,-2),d:'Ổ ngủ 2 chỗ: ấm thêm 8°C, không bị ướt, không bị gió.'}),
 // làm mát
 WD('fanmini','Quạt mini',250,'floor',14,16,'cool',2,1,{cool:3},{max:2,anim:1,d:'Làm mát phòng 3°C khi đang bật.'}),
 WD('fanstand','Quạt đứng',600,'floor',16,34,'cool',4,1,{cool:5},{max:2,anim:1,d:'Làm mát phòng 5°C khi đang bật.'}),
 WD('fanceiling','Quạt trần',900,'wall',36,14,'cool',5,1,{cool:4,comfort:3},{max:1,anim:1,d:'Làm mát 4°C, phòng thoải mái hơn.'}),
 WD('ac1','Điều hòa một chiều',2000,'wall',40,16,'cool',8,2,{cool:10,auto:1,rooms:'in'},{max:1,anim:1,d:'Tự làm mát khi phòng nóng, tối đa 10°C.'}),
 WD('ac2','Điều hòa hai chiều',3600,'wall',40,16,'cool',11,3,{cool:10,heat:8,auto:1,rooms:'in'},{max:1,anim:1,d:'Tự làm mát (tối đa 10°C) hoặc sưởi (tối đa 8°C) để giữ phòng dễ chịu.'}),
 WD('mistfan','Quạt phun sương',1100,'floor',18,34,'cool',6,2,{cool:6,hum:10,outok:1},{max:2,anim:1,d:'Làm mát 6°C, thêm độ ẩm; dùng được cả ngoài trời.'}),
 WD('aircooler','Máy làm mát không khí',1000,'floor',22,30,'cool',6,1,{cool:6,hum:5},{max:1,anim:1,d:'Làm mát 6°C, thêm chút độ ẩm.'}),
 WD('coolmat','Thảm làm mát',500,'floor',48,8,'cool',3,1,{lcool:7},{bed:{en:3,at:[[-11,-2],[11,-2]]},use:NAPA(0,-2),d:'Ổ ngủ 2 chỗ: bé nằm trên mát thêm 7°C.'}),
 WD('coolbed','Giường làm mát',700,'floor',34,16,'cool',4,2,{lcool:8},{bed:{en:3.5,at:[[0,-5]]},use:NAPA(0,-5),d:'Ổ ngủ 1 chỗ: bé nằm trên mát thêm 8°C.'}),
 WD('airpurifier','Máy lọc không khí',900,'floor',16,28,'cool',5,1,{comfort:6,health:.05},{max:1,anim:1,d:'Phòng thoải mái hơn, mèo hồi sức khỏe nhanh hơn.'}),
 WD('sunblind','Rèm chống nắng',450,'wall',30,34,'cool',3,1,{sun:.3,cool:2},{max:2,d:'Khi trời nóng: chặn 30% hơi nóng ngoài trời và làm mát thêm 2°C.'}),
 WD('insulcathouse','Nhà mèo cách nhiệt',1800,'floor',40,36,'cool',9,2,{lauto:7,lshelter:1},{bed:{en:4,at:[[-8,-2],[8,-2]]},use:NAPA(0,-2),d:'Ổ ngủ 2 chỗ: luôn giữ nhiệt độ dễ chịu cho bé nằm trong (tối đa ±7°C), không ướt, không gió.'}),
 // chống thời tiết xấu
 WD('dehumid','Máy hút ẩm',700,'floor',16,24,'shield',4,1,{hum:-20,dry:1},{max:1,anim:1,d:'Giảm 20% độ ẩm, lông ướt khô nhanh hơn.'}),
 WD('humidifier','Máy tạo độ ẩm',500,'floor',14,20,'shield',3,1,{hum:15},{max:1,anim:1,d:'Thêm 15% độ ẩm khi không khí khô.'}),
 WD('balconyroof','Mái che ban công',1500,'wall',80,16,'shield',4,2,{shelter:.7,sun:.2,rooms:'out'},{max:1,d:'Chỉ dùng ở phòng ngoài trời: che 70% mưa tuyết, che bớt nắng.'}),
 WD('raincurtain','Rèm chắn mưa',600,'wall',36,38,'shield',4,1,{shelter:.4,wind:.3,rooms:'out'},{max:2,d:'Phòng ngoài trời: che 40% mưa, chắn 30% gió.'}),
 WD('winddoor','Cửa chống gió',900,'wall',30,40,'shield',5,1,{wind:.7,ins:.1},{max:1,d:'Chắn 70% gió, cách nhiệt thêm 10%.'}),
 WD('raintent','Lều trú mưa',900,'floor',44,30,'shield',4,1,{shelter:.2,lshelter:1,rooms:'out'},{bed:{en:3,at:[[-12,-2],[0,-2],[12,-2]]},use:NAPA(0,-2),d:'Phòng ngoài trời: ổ ngủ 3 chỗ không bị ướt, không bị gió; che thêm 20% mưa cho cả phòng.'}),
 WD('gardenhouse','Nhà kính sân vườn',4000,'floor',80,56,'shield',9,3,{shelter:.8,ins:.4,heat:3,rooms:'out'},{max:1,bed:{en:3.5,at:[[-24,-3],[-8,-3],[8,-3],[24,-3]]},use:NAPA(0,-3),d:'Phòng ngoài trời: che 80% mưa tuyết, cách nhiệt 40%, ấm thêm 3°C; ổ ngủ 4 chỗ.'}),
 WD('hairdryer','Máy sấy lông',450,'floor',14,20,'shield',2,1,{dry:80},{max:1,anim:1,d:'Bé bị ướt trong phòng được sấy khô gần như ngay.'}),
 WD('wxstation','Trạm dự báo thời tiết',1200,'floor',18,34,'shield',5,2,{station:1},{max:1,anim:1,d:'Đặt ở phòng nào cũng được: dự báo 6 đợt thời tiết tới, báo trước thời tiết nguy hiểm, hiện chính xác tỉ lệ thành công viễn chinh.'}),
 WD('shadetree','Cây che bóng',1100,'floor',40,60,'shield',6,1,{sun:.25,cool:3,shelter:.3,comfort:4,rooms:'out'},{max:2,d:'Phòng ngoài trời: che nắng, mát thêm 3°C, che 30% mưa.'}),
 // tiện nghi và chăm sóc
 WD('waterbowl','Bát nước',40,'floor',16,8,'care',1,1,{},{water:{cap:8},d:'Bát nước 8 lượt uống. Bấm "Đổ nước" (miễn phí) để đổ đầy. Mỗi phòng được tặng một bát.'}),
 WD('thermobottle','Bình nước giữ nhiệt',350,'floor',12,16,'care',3,1,{},{water:{cap:10,cool:1},d:'Giữ nước mát 10 lượt uống: trời nóng uống vào đỡ khát hơn và hạ nhiệt cho bé.'}),
 WD('waterfilter','Máy lọc nước',900,'floor',20,16,'care',4,2,{},{anim:1,water:{cap:12,auto:1,happy:3},d:'Tự đổ đầy nước mỗi 10 phút (kể cả lúc vắng); mỗi lần uống +3 độ vui.'}),
 WD('whitenoise','Máy tạo tiếng ồn trắng',400,'floor',12,12,'care',3,1,{quiet:1},{max:1,anim:1,d:'Át tiếng sấm: mưa giông không làm mèo trong phòng kém vui; ngủ ngon hơn.'}),
 WD('premiumpad','Đệm ngủ cao cấp',1400,'floor',44,14,'care',7,2,{comfort:4},{bed:{en:4.5,at:[[-10,-5],[10,-5]]},use:NAPA(0,-5),d:'Ổ ngủ 2 chỗ, hồi năng lượng nhanh gấp 4,5 lần; phòng thoải mái hơn.'}),
 WD('smartbed','Giường thông minh',3000,'floor',48,22,'care',10,3,{lauto:12},{anim:1,bed:{en:5,at:[[-11,-6],[11,-6]]},use:NAPA(0,-6),d:'Ổ ngủ 2 chỗ tự chỉnh nhiệt độ cho bé nằm trên (tối đa ±12°C), hồi năng lượng nhanh gấp 5 lần.'}),
 WD('thermostat','Bộ điều chỉnh nhiệt độ tự động',1500,'wall',10,14,'care',7,2,{thermo:1},{max:1,anim:1,d:'Máy sưởi, quạt, máy làm mát trong phòng tự bật tắt theo nhiệt độ, không cần bật tắt tay.'}),
 WD('sensor','Bộ cảm biến nhiệt độ và độ ẩm',300,'wall',10,12,'care',2,1,{sensor:1},{max:1,d:'Báo cho bạn khi phòng quá lạnh, quá nóng hoặc mèo trong phòng bị lạnh, nóng, ướt.'}),
];
// biểu tượng vật phẩm sinh tồn: hình 16x16, id hình là "sp_" + id
/* ---------- vật phẩm sinh tồn (dùng một lần) ----------
   on: 'start' trừ lúc xuất phát; 'auto' chỉ trừ khi thật sự dùng (tự kích hoạt khi tới ngưỡng), không dùng thì trả lại túi đồ khi về.
   res: kháng rủi ro theo loại thời tiết (cold, heat, rain, fog, storm), sick: giảm khả năng ốm, en/full/health/water: hồi khi kích hoạt,
   luck: thêm cơ hội vật phẩm hiếm và xu, lost: giảm lạc đường, rescue: rút lui an toàn, dry: bảo vệ phần thưởng khi mưa, save: giảm năng lượng tiêu tốn.
   max: mang tối đa mỗi chuyến; home: dùng được ở nhà cho một bé (màn chi tiết mèo). */
const SUPPLY=[
 {id:'scarf',n:'Khăn choàng giữ ấm',ic:'🧣',price:60,rare:1,on:'start',res:{cold:.3},max:1,d:'Giảm 30% tác động của trời lạnh trong một chuyến.'},
 {id:'handwarmer',n:'Túi sưởi',ic:'🔥',price:40,rare:1,on:'start',res:{cold:.2},max:2,d:'Chống rét: giảm 20% rủi ro trời lạnh (mang 2 túi thì 40%).'},
 {id:'coldmed',n:'Thuốc chống cảm',ic:'💊',price:120,rare:2,on:'auto',sick:.6,max:1,home:{cure:'sick',health:10},d:'Tự dùng khi bé bị lạnh hoặc ướt trên đường: giảm 60% khả năng bị ốm. Ở nhà: chữa khỏi Ốm, +10 sức khỏe.'},
 {id:'hotsoup',n:'Súp nóng đóng hộp',ic:'🍲',price:80,rare:1,on:'auto',en:20,res:{cold:.1},max:2,home:{en:20,cure:'cold'},d:'Tự dùng khi gặp lạnh hoặc mệt: +20 năng lượng, đỡ lạnh. Ở nhà: +20 năng lượng, hết Lạnh.'},
 {id:'cooltowel',n:'Khăn làm mát',ic:'🧊',price:60,rare:1,on:'start',res:{heat:.3},max:1,d:'Giảm 30% tác động của nắng nóng trong một chuyến.'},
 {id:'electrolyte',n:'Bình nước điện giải',ic:'🧃',price:50,rare:1,on:'start',water:.5,max:2,home:{water:40,cure:'hot'},d:'Giảm một nửa lượng nước mất trên đường. Ở nhà: +40 nước, hết Nóng quá.'},
 {id:'heatmed',n:'Thuốc chống say nắng',ic:'💉',price:120,rare:2,on:'auto',exhaust:.6,max:1,d:'Tự dùng khi gặp nóng: giảm 60% khả năng kiệt sức.'},
 {id:'coolgel',n:'Gel làm mát',ic:'🫧',price:45,rare:1,on:'start',res:{heat:.2},max:2,home:{cure:'hot'},d:'Kháng nóng 20%. Ở nhà: hết Nóng quá.'},
 {id:'raincoat',n:'Áo mưa dùng một lần',ic:'🧥',price:50,rare:1,on:'start',res:{rain:.4},max:1,d:'Giảm 40% khả năng bị ướt và sự cố khi mưa.'},
 {id:'drybag',n:'Túi chống nước',ic:'🎒',price:90,rare:2,on:'start',dry:.5,max:1,d:'Khi gặp mưa hoặc phải rút lui: giữ lại thêm một nửa phần thưởng bị mất.'},
 {id:'immunity',n:'Thuốc tăng sức đề kháng',ic:'🧪',price:100,rare:2,on:'start',sick:.3,max:1,home:{health:15},d:'Giảm 30% khả năng bị ốm trong chuyến. Ở nhà: +15 sức khỏe.'},
 {id:'flashlight',n:'Đèn pin',ic:'🔦',price:70,rare:1,on:'start',res:{fog:.4},max:1,d:'Giảm 40% bất lợi khi sương mù.'},
 {id:'energybar',n:'Thanh năng lượng',ic:'🍫',price:40,rare:1,on:'auto',en:25,max:3,home:{en:25},d:'Tự dùng khi năng lượng dưới 25: +25 năng lượng. Ở nhà: +25 năng lượng.'},
 {id:'rations',n:'Hộp thức ăn dự phòng',ic:'🥫',price:60,rare:1,on:'auto',full:30,max:2,home:{full:30},d:'Tự dùng khi đói dưới 30: +30 no. Ở nhà: +30 no.'},
 {id:'firstaid',n:'Bộ sơ cứu dùng một lần',ic:'🩹',price:150,rare:2,on:'auto',health:30,max:1,home:{health:35},d:'Tự dùng khi gặp sự cố có thương tích: không mất sức khỏe, +30 sức khỏe. Ở nhà: +35 sức khỏe.'},
 {id:'recovery',n:'Thuốc hồi sức',ic:'⚗️',price:90,rare:1,on:'start',save:.2,max:1,d:'Chuyến đi tốn ít hơn 20% năng lượng (hoàn lại khi về).'},
 {id:'luckycharm',n:'Bùa may mắn',ic:'🍀',price:200,rare:3,on:'start',luck:.08,max:1,d:'+8% cơ hội nhặt vé và vật phẩm hiếm, +5% xu.'},
 {id:'compass',n:'La bàn dùng một chuyến',ic:'🧭',price:80,rare:1,on:'start',lost:.5,max:1,d:'Giảm 50% nguy cơ lạc đường.'},
 {id:'rescuekit',n:'Bộ dụng cụ cứu hộ',ic:'🛟',price:250,rare:3,on:'auto',rescue:1,max:1,d:'Tự dùng khi phải rút lui: về an toàn, giữ lại 75% phần thưởng thay vì 45%, không bị thương.'},
];
const SUP=Object.fromEntries(SUPPLY.map(s=>[s.id,s]));

/* ---------- khí hậu điểm đến viễn chinh: lệch nhiệt độ, nguy hiểm nền, đổi kiểu thời tiết ---------- */
const DEST_CLIMATE={
  alley:{t:1,danger:0,n:'Phố xá'},park:{t:0,danger:0,n:'Đồng bằng'},market:{t:2,danger:.01,n:'Phố chợ'},
  lake:{t:-2,danger:.02,n:'Ven hồ ẩm',fog:1.5},harbor:{t:-1,danger:.03,n:'Cảng biển lộng gió',wind:1.5},
  mountain:{t:-8,danger:.05,n:'Rừng núi lạnh',snowAt:2},desert:{t:9,danger:.05,n:'Đồi cát nóng',dry:1},
};
// hai điểm đến mới cho thấy khí hậu khác nhau (xu mỗi phút ngang Bến cảng, rủi ro cao hơn nhưng dễ nhặt đồ hiếm)
DESTS.push({id:'mountain',n:'Rừng núi',ic:'⛰️',min:40,coin:220,en:60,lvl:7,tags:['nature'],d:'Lạnh hơn đồng bằng 8°C; dễ gặp tuyết, sương mù.',rareLoot:.06},
           {id:'desert',n:'Đồi cát',ic:'🏜️',min:40,coin:220,en:60,lvl:9,tags:['nature'],d:'Nóng hơn thành phố 9°C; hiếm khi mưa.',rareLoot:.06});
DESTS.forEach(d=>DEST[d.id]=d);

/* ---------- gắn vào nội thất và cửa hàng ---------- */
FCATS.push(['warm','🔥 Giữ ấm'],['cool','❄️ Làm mát'],['shield','☂️ Chống thời tiết'],['care','💧 Tiện nghi'],['supply','🎒 Sinh tồn']);
WXDEV.forEach(f=>{
  if(FURN[f.id])throw new Error('trùng id nội thất '+f.id);
  f.price=f.water&&f.id==='waterbowl'?nicePrice(f.price*BOWL_K):nicePrice(f.price*(FURN_K0+FURN_KS*(f.ul-1))); // cùng hệ số giá cày lâu với nội thất khác
  const w=f.wx,rm=w.rooms==='out'?'phòng ngoài trời':w.rooms==='in'?'phòng trong nhà':Array.isArray(w.rooms)?w.rooms.map(r=>ROOM[r].n).join(', '):'';
  f.d='['+RARE_N[f.rare]+'] '+f.d+(rm?' Chỉ có tác dụng ở '+rm+'.':'')+(f.max?' Tối đa '+f.max+' món cùng loại có tác dụng trong một phòng.':'');
  if((f.wx.heat||f.wx.cool)&&!f.wx.auto)f.d+=' Chạm vào món trong phòng để bật tắt.';
  if(f.bed)f.d+=' Ổ ngủ: chạm vào để cho '+(f.bed.at.length>1?'tối đa '+f.bed.at.length+' bé':'một bé')+' đi ngủ, hồi năng lượng nhanh gấp '+String(f.bed.en).replace('.',',')+' lần.';
  FURNS.push(f);FURN[f.id]=f;
});
// Thời tiết mở ở cấp WX_LV (2): mọi thiết bị thời tiết, kể cả ba món rẻ nhất, không mua được trước cấp đó. Đặt sau khi tính giá để giá không đổi.
WXDEV.forEach(f=>{if(f.ul<WX_LV)f.ul=WX_LV});
SUPPLY.forEach(s=>{s.price=nicePrice(s.price*1.5)}); // vật phẩm dùng một lần: giá rẻ để không bắt buộc, cùng hệ số với bát ăn
