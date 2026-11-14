"use strict";
/* ============ SỰ KIỆN CÓ THỜI HẠN THEO LỊCH THẬT (2026-11-14): dữ liệu và số cân bằng ============
   Mỗi sự kiện chạy theo ngày thật, giờ Việt Nam (UTC+7), không theo đồng hồ máy người chơi.
   Trong lúc sự kiện diễn ra: ô sự kiện trên thanh trên cùng, nhiệm vụ sự kiện mỗi ngày, tiền sự kiện riêng (nhận từ nhiệm vụ và việc chơi thường),
   cửa hàng sự kiện đổi tiền lấy món của bộ theo mùa (rẻ hơn mua bằng xu), món độc quyền và vé gacha. Hết sự kiện: tiền còn lại tự đổi thành ít xu.
   Bộ theo mùa cũ (Tết, Halloween, Trung thu, Noel) VẪN bán bằng xu quanh năm như trước: không món nào bị khóa hay bị lấy lại.
   Nạp sau js/garden-data.js (cần FURNS, FURN, FEATS, FOOD). Luật: js/event.js. Giao diện: js/event-ui.js. Hình món độc quyền: js/furn/ev-01.js.
   Trọng tài máy chủ (tools/guard.js) phải nạp file này, vì bản lưu có món độc quyền (fid evmam, evcauldron, evcarp, evsleigh). */
const EV_LV=3;
const EVC={
  tz:7,            // giờ Việt Nam: UTC+7
  disc:.6,         // món bộ theo mùa trong cửa hàng sự kiện: 60% giá xu, quy theo giá trị một đồng tiền sự kiện
  xu:8,            // giá trị một đồng tiền sự kiện khi định giá món đồ (xu); món bộ mùa giá = giá xu × disc / xu (làm tròn 5)
  conv:2,          // hết sự kiện: mỗi đồng tiền còn lại đổi thành 2 xu
  dayCap:80,       // tiền nhận từ việc chơi thường tối đa mỗi ngày
  earn:{trip:4,feed:2,pet:1,catch:3,gacha:2,wish:2,fav:1,harvest:2}, // tiền mỗi lần làm việc (onAct)
  qRew:25,qAll:30,gift:15, // nhiệm vụ sự kiện: mỗi cái 25, xong cả ba thêm 30; quà ghé thăm mỗi ngày 15
  tk:50,tkLim:10,  // vé gacha: 50 tiền một vé, tối đa 10 vé mỗi đợt sự kiện
  food:20,foodLim:5,// một hộp 8 suất Hộp cao cấp vào kho thức ăn: 20 tiền, tối đa 5 hộp mỗi đợt
  xp:2,            // kinh nghiệm mỗi lần nhận thưởng nhiệm vụ sự kiện
};
// Tết Nguyên đán và Trung thu theo âm lịch: ngày dương lịch của mùng 1 Tết và rằm tháng Tám (giờ Việt Nam). Năm không có trong bảng thì sự kiện đó không diễn ra.
const EV_LUNAR={
  tet:{2026:[2,17],2027:[2,6],2028:[1,26],2029:[2,13],2030:[2,3],2031:[1,23],2032:[2,11]},
  moon:{2026:[9,25],2027:[9,15],2028:[10,3],2029:[9,22],2030:[9,12],2031:[10,1],2032:[9,19]},
};
// Mỗi sự kiện: ngày bắt đầu và kết thúc (gồm cả hai ngày). Âm lịch: lunar + from/to (số ngày lệch so với ngày lễ). Dương lịch: from:[tháng, ngày], to:[tháng, ngày] (to < from là sang năm sau).
// cur: tiền sự kiện; set: bộ theo mùa bán trong cửa hàng sự kiện (giá giảm); x: món độc quyền; extra: món thường bán thêm; col: màu chủ đạo của ô và bảng.
const EVENTS=[
  {id:'tet',n:'Tết Nguyên đán',ic:'🧧',lunar:'tet',from:-7,to:7,cur:{n:'Lì xì',ic:'🧧'},set:'Tết',x:['evmam'],col:'#d8443c',
    d:'Đón năm mới cùng các bé: dọn nhà, bày mâm ngũ quả, nhận lì xì.'},
  {id:'valentine',n:'Lễ Tình nhân',ic:'💌',from:[2,11],to:[2,15],cur:{n:'Thiệp tim',ic:'💌'},extra:['strawplush','donutbed','rocker','sofapink'],col:'#e0607e',
    d:'Mèo nào cũng cần được thương: vuốt ve, cho ăn món khoái khẩu để nhận thiệp tim.'},
  {id:'catday',n:'Ngày của mèo',ic:'🐾',from:[8,5],to:[8,11],cur:{n:'Cá khô',ic:'🐟'},extra:['wand','paperbag','springmouse','ballpit','minitower'],col:'#e39a4a',
    d:'Ngày Quốc tế Mèo 8/8: cả tuần dành cho các bé, cá khô rơi khắp nhà.'},
  {id:'moon',n:'Tết Trung thu',ic:'🏮',lunar:'moon',from:-9,to:2,cur:{n:'Lồng đèn',ic:'🏮'},set:'Trung thu',x:['evcarp'],col:'#e88a2a',
    d:'Rước đèn phá cỗ: treo đèn ông sao, đèn cá chép, bày bánh trung thu.'},
  {id:'halloween',n:'Halloween',ic:'🎃',from:[10,20],to:[11,3],cur:{n:'Kẹo',ic:'🍬'},set:'Halloween',x:['evcauldron'],col:'#8a5ac0',
    d:'Mèo ma, bí ngô và vạc phù thủy. Cho kẹo hay bị ghẹo?'},
  {id:'noel',n:'Giáng sinh',ic:'🎄',from:[12,15],to:[1,2],cur:{n:'Chuông',ic:'🔔'},set:'Noel',x:['evsleigh'],col:'#3f9a5a',
    d:'Cây thông, người tuyết, chồng quà. Đón năm mới trên xe trượt tuyết.'},
];
const EVENT=Object.fromEntries(EVENTS.map(e=>[e.id,e]));
// Nhiệm vụ sự kiện mỗi ngày (3 cái bốc từ danh sách). n(): số cần đạt theo nhà của người chơi.
const EV_Q={
  trip:{ic:'🎒',t:n=>'Hoàn thành '+n+' chuyến viễn chinh',n:()=>1+slotCount()},
  feed:{ic:'🍖',t:n=>'Cho mèo ăn '+n+' lần',n:()=>3},
  pet:{ic:'🤚',t:n=>'Vuốt ve mèo '+n+' lần',n:()=>Math.min(20,4+S.cats.length)},
  catch:{ic:'🦋',t:n=>'Bắt '+n+' vị khách lạ trong phòng',n:()=>3},
  gacha:{ic:'🥚',t:n=>'Quay gacha '+n+' lượt',n:()=>2},
  fav:{ic:'❤',t:n=>'Cho bé ăn đúng món khoái khẩu '+n+' lần',n:()=>2},
  wish:{ic:'💭',t:n=>'Làm theo '+n+' ước muốn của mèo',n:()=>2},
};
FEATS.push({lv:EV_LV,id:'event',ic:'🎉',n:'Sự kiện theo mùa',d:'Tết, Trung thu, Halloween, Giáng sinh và các ngày lễ nhỏ diễn ra theo lịch thật: nhiệm vụ sự kiện, tiền sự kiện, cửa hàng đổi món độc quyền và vé gacha.'});
/* Món độc quyền: chỉ đổi bằng tiền sự kiện trong đúng sự kiện đó. Mục 'event' không có trong FCATS nên không hiện ở cửa hàng xu.
   Không gắn trường set (để không đổi điều kiện thành tựu "bộ trọn" của người chơi cũ). price là giá trị quy đổi (bán lại được 25% như mọi món). */
{
  const X=(id,n,price,kind,w,h,ev,o)=>Object.assign({id,n,price,kind,w,h,cat:'event',art:id,a:[],ul:EV_LV,ev},o);
  [
    X('evmam','Mâm ngũ quả',2400,'floor',26,18,'tet',{happy:5,g:{coin:.02},d:'Món độc quyền Tết. +5 độ vui, +2% xu viễn chinh.'}),
    X('evcarp','Đèn cá chép',2400,'wall',28,20,'moon',{happy:5,g:{night:.03},d:'Món độc quyền Trung thu. +5 độ vui, +3% xu ban đêm.'}),
    X('evcauldron','Vạc phù thủy',2400,'floor',22,20,'halloween',{happy:5,g:{ticket:.02},d:'Món độc quyền Halloween. +5 độ vui, +2% cơ hội nhặt vé gacha.',use:{dx:15,dy:1,front:1,emo:'excl'}}),
    X('evsleigh','Xe trượt tuyết',3200,'floor',40,22,'noel',{happy:6,regen:1.05,d:'Món độc quyền Giáng sinh. +6 độ vui, hồi năng lượng nhanh hơn 5%. Mèo thích ngồi lên ghế xe.',use:{dx:-4,dy:-11,front:1,sleep:1,emo:'z'}}),
  ].forEach(f=>{if(FURN[f.id])throw new Error('trùng id nội thất '+f.id);FURNS.push(f);FURN[f.id]=f});
}
// giá trong cửa hàng sự kiện (tiền sự kiện) của món độc quyền; giá trị quy đổi (price) = giá này × EVC.xu
const EV_XP={evmam:300,evcarp:300,evcauldron:300,evsleigh:400};
