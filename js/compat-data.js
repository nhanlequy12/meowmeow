"use strict";
/* ============ GỢI Ý TƯƠNG THÍCH: SỐ VÀ CHỮ (2026-11-12) ============
   Nạp cùng các file dữ liệu (sau js/garden-data.js). Luật ở js/compat.js; file này chỉ có hằng số và chữ để dễ sửa.
   Mọi quy tắc đều đọc từ dữ liệu có sẵn của game (TRAITS, ROOMS, FOODS, DRINKS, trạng thái của bé), không thêm thuộc tính mới.

   Bốn mức (CP_LV): 2 Rất hợp (xanh lục, ♥) · 1 Hợp (xanh biển, ✓) · 0 Bình thường (không dấu) · −1 Không hợp (đỏ, !).
   Dấu là ký tự chữ thường (không phải emoji) để hiện giống nhau trong nhãn, trên icon mặt mèo và trong tooltip.
   Mức tính từ điểm: điểm >= CPC.love là Rất hợp, >= CPC.like là Hợp, <= CPC.bad là Không hợp.
   Điểm của quy tắc lấy thẳng từ số của game khi game có số (ví dụ Tắm nắng +12 vui); quy tắc chỉ là "cùng điều kiện" thì dùng điểm nhỏ ở đây. */
const CPC={
  love:10, like:3, bad:-5,          // ngưỡng điểm của ba mức có dấu
  // --- mèo × phòng ---
  waterUp:10, waterDn:-10,          // Hồ bơi: bé thích nước +10 vui, sợ nước −10 vui (đúng số trong happyTarget)
  wait:-10,                         // Phòng chờ: −10 vui (roomHappy)
  nightRoom:4,                      // bé có thưởng xu đêm ở phòng cộng xu chuyến đêm (Tầng hầm): cùng điều kiện nên là Hợp
  hungerRoom:4,                     // bé mau đói ở phòng làm đói chậm (Bếp, Nhà kính): Hợp
  bigAt:6,                          // Hay ghen: phòng từ 6 mèo (đúng số trong happyTarget)
  better:10,                        // phòng khác hơn phòng đang ở từ ngần này điểm thì gợi ý chuyển
  maybe:.5,                         // thuộc tính "giống này hay có" (không chắc): điểm nhân hệ số này và mức tối đa là Hợp
  // --- mèo × món ăn ---
  fav:20,                           // món khoái khẩu (no hơn 20%, +10 vui, buff lâu gấp rưỡi)
  picky:-25,                        // Kén ăn × Hạt khô: chỉ no một nửa. Thắng cả món khoái khẩu (20 − 25 = −5: Không hợp)
  tired:{at:40,en:15,pts:5},        // năng lượng dưới 40 và món cho từ +15 năng lượng
  sad:{at:40,hp:15,pts:5},          // độ vui dưới 40 và món cho từ +15 vui
  hungry:{at:30,full:45,pts:4},     // độ no dưới 30 và món no từ 45
  drain:{at:25,pts:-6},             // năng lượng dưới 25 mà món trừ năng lượng (Cỏ mèo)
  // --- mèo × nước uống (theo trạng thái; game chưa có sở thích nước theo giống) ---
  hot:12,                           // bé đang nóng × nước có hạ nhiệt
  weak:{at:60,pts:6},               // sức khỏe dưới 60 hoặc đang ốm × nước cộng sức khỏe
  uncomf:{at:40,pts:5},             // thoải mái dưới 40 × nước cộng thoải mái
  parched:{wa:50,pts:5},            // rất khát × nước từ +50
  // --- xếp gợi ý ---
  moveCost:.6,                      // mỗi bé phải chuyển phòng bị trừ ngần này điểm, để không chuyển khi lợi quá ít
  planMs:600, planIter:12           // giới hạn thời gian (ms) và số lượt đi qua cả đàn của bộ xếp
};
const CP_LV={
  '2':{n:'Rất hợp',ic:'♥',cls:'cp2'},
  '1':{n:'Hợp',ic:'✓',cls:'cp1'},
  '0':{n:'Bình thường',ic:'',cls:'cp0'},
  '-1':{n:'Không hợp',ic:'!',cls:'cpx'}
};
/* Chữ. Chỗ giữ: {n} tên thuộc tính, {v} số, {f} tên nội thất, món hoặc nước, {r} tên phòng, {c} tên mèo. */
const CP_TEXT={
  // lý do mèo × phòng
  room:{
    // mỗi lý do ghép thành "<tên thuộc tính>: <mô tả>"; thuộc tính không chắc có thì thành "<maybe>: <mô tả>"
    outdoor:'+{v} vui ở phòng ngoài trời',
    waterUp:'+{v} vui ở {r}',
    waterDn:'−{v} vui ở {r}',
    like:'+{v} vui vì phòng có {f}',
    likeAny:'đồ leo trèo',
    big:'−{v} vui khi phòng có từ {k} mèo',
    pal:'+{v} vui vì ở cùng {c}',
    night:'{r} cộng thêm {v}% xu cho chuyến đêm của bé',
    hunger:'bé mau đói, {r} giúp đói chậm hơn {v}%',
    wait:'Phòng chờ: −{v} vui, không được cho ăn',
    fixed:'độ vui của bé không đổi theo phòng',
    auraUp:'Bạn cùng phòng làm bé vui thêm +{v}',
    auraDn:'Bạn cùng phòng làm bé kém vui −{v}',
    maybe:'Giống này hay có {n}',
    yield:'Nhường chỗ cho bé hợp phòng hơn',
    leave:'Rời phòng không hợp',
    none:'Không có gì đặc biệt với phòng này'
  },
  // lý do mèo × món ăn
  food:{
    fav:'Món khoái khẩu: no hơn 20%, +10 vui, buff lâu gấp rưỡi',
    picky:'Kén ăn: ăn Hạt khô chỉ no một nửa',
    tired:'Đang mệt: món này +{v} năng lượng',
    sad:'Đang buồn: món này +{v} vui',
    hungry:'Đang đói: món này no nhiều (+{v})',
    drain:'Đang kiệt sức: món này trừ {v} năng lượng',
    maybe:'Giống này hay có {n} (thích {f})',
    none:'Bé ăn được, không có gì đặc biệt'
  },
  // lý do mèo × nước uống
  drink:{
    hot:'Đang nóng: nước này hạ nhiệt',
    weak:'Sức khỏe thấp: nước này +{v} sức khỏe',
    uncomf:'Kém thoải mái: nước này +{v} thoải mái',
    parched:'Rất khát: nước này +{v} nước',
    none:'Bé uống được, không có gì đặc biệt'
  },
  // nhãn dùng chung cho mọi màn hình
  ui:{
    roomFit:'Mèo hợp với phòng này',
    roomFitNone:'Chưa có bé nào đặc biệt hợp phòng này',
    roomHere:'đang ở đây',
    roomPut:'Bấm để chuyển bé vào phòng này',
    roomFull:'Phòng đã đầy',
    notOwned:'Chưa có bé này. Bấm để xem trong Sưu tập',
    notSeen:'Chưa gặp bé này',
    misfit:'{c} không hợp {r}',
    better:'{c} hợp {r} hơn',
    moveTo:'Chuyển sang {r}',
    arrange:'✨ Xếp gợi ý',
    arrangeTitle:'Xếp gợi ý',
    arrangeSub:'Đây là cách xếp tớ tính là vui nhất cho cả đàn. Chưa có gì thay đổi cho tới khi bạn bấm Áp dụng.',
    arrangeNone:'Cả đàn đang ở chỗ hợp rồi, không cần chuyển bé nào.',
    arrangeGo:'Áp dụng',
    arrangeNo:'Thôi',
    arrangeDone:'Đã chuyển {v} bé theo gợi ý',
    arrangeStale:'Nhà vừa có thay đổi, bấm Xếp gợi ý lại nhé.',
    foodFans:'Bé thích món này',
    drinkFans:'Bé đang cần loại nước này',
    forCat:'Hợp nhất với {c}',
    best:'Hợp với bé',
    bestRoom:'Phòng',
    bestFood:'Đồ ăn',
    bestDrink:'Nước uống',
    bestToy:'Đồ bé thích',
    bestPal:'Bạn thân',
    toyTip:'{n}: +{v} vui khi phòng bé ở có {f}',
    roomLocked:'chưa mua',
    foodLocked:'mở ở cấp {v}',
    anyRoom:'Phòng nào cũng được',
    anyDrink:'Nước nào cũng được',
    drinkNote:'Game chưa có sở thích nước theo giống. Nước được gợi ý theo tình trạng của bé lúc này.',
    more:'+{v}',
    less:'Thu gọn',
    filter:'Lọc theo sự phù hợp',
    filterAll:'Tất cả',
    filterRoom:'Hợp phòng',
    filterFood:'Thích món',
    filterDrink:'Cần nước',
    sortFit:'Hợp nhất'
  }
};

/* Chữ riêng của tab Phòng và hộp Xếp gợi ý (js/compat-room.js) */
const CPR_TX={
  at:'Đang ở {r}',
  away:'Bé ở {r}, {t}',
  stray:'đang đi lạc',
  hunt:'đang đi tìm bạn',
  unk:'{s}★ · {l}',
  tryRoom:'Thử chuyển bé sang {r}',
  hint:'→ {r}',
  moreCats:'+{v} bé nữa',
  moved:'đã chuyển sang {r}',
  cantAway:'Bé {t}, chưa chuyển phòng được.',
  cantFull:'{r} đã đầy ({n}/{k}).',
  sum:'{n} bé đổi phòng · cả đàn {g} vui',
  grp:'{n} bé',
  gain:'{v} 😊',
  gainTip:'Độ vui của bé thay đổi {v} sau khi chuyển',
  arrangeTip:'Xem trước cách xếp cả đàn vào các phòng cho vui nhất. Chưa đổi gì cho tới khi bạn bấm Áp dụng.'
};

/* Chữ riêng của bảng Cho ăn, Cho uống (js/compat-meal.js) */
const CPF_TX={
  away:'{c} đang vắng nhà, chưa cho ăn hay cho uống được.',
  wait:'{c} đang ở Phòng chờ. Chuyển bé vào một phòng rồi mới cho ăn, cho uống được.',
  titleF:'Cho ăn',
  titleW:'Nước uống',
  clear:'Bỏ chọn bé, về danh sách thường',
  anyFood:'Món nào cũng được',
  misfit:'Không hợp'
};

/* Chữ riêng của khung "Hợp với bé" ở màn chi tiết (js/compat-cat.js) */
const CPD_TX={
  here:'đang ở',
  full:'đầy',
  hereTip:'Bé đang ở phòng này',
  roomGo:'Bấm để tới xem phòng',
  roomBuy:'Chưa mua phòng này. Bấm để tới Cửa hàng',
  roomLv:'Phòng mở ở cấp {v}',
  foodGo:'Bấm để cho phòng của bé ăn',
  drinkGo:'Bấm để cho phòng của bé uống',
  away:'Bé đang vắng nhà nên chưa cho ăn, uống được',
  waitNo:'Bé ở Phòng chờ không được cho ăn, uống. Chuyển bé vào một phòng trước',
  toyAdd:'+{v} vui',
  toyHas:'Phòng bé ở đang có món này',
  toyBuy:'Phòng bé ở chưa có. Bấm để xem trong Cửa hàng',
  palHere:'{c} ({s}) đang ở cùng phòng với bé',
  palElse:'{c} ({s}) đang ở {r}. Chuyển hai bé về cùng phòng để có thưởng',
  palAway:'{c} ({s}) đang vắng nhà',
  palNone:'Chưa có {s}',
  palGrp:'Chủ đề {g}: {v} bé cùng phòng',
  betterMark:'↑'
};

/* Chữ riêng của tab Mèo, Sưu tập, hộp thoại loài (js/compat-album.js) */
const CPA_TX={
  off:'—',
  clear:'✕ Bỏ lọc',
  order:'hợp nhất đứng đầu',
  catsRoom:'{v} bé hợp {f}',
  catsFood:'{v} bé thích {f}',
  catsDrink:'{v} bé đang cần {f}',
  among:'trong {r}',
  noRoom:'Chưa có bé nào đặc biệt hợp {f}{w}.',
  noFood:'Chưa có bé nào đặc biệt thích {f}{w}.',
  noDrink:'Không bé nào đang cần riêng {f}{w}.',
  noWhere:' trong số các bé ở {r}',
  noCats:'Nhà chưa có bé nào.',
  fitBad:'{v} bé đang ở phòng không hợp',
  fitBetter:'{v} bé có phòng khác hợp hơn hẳn',
  fitOk:'Bé nào cũng đang ở chỗ ổn.',
  fitLead:'Xếp Hợp nhất',
  betterTag:'Hợp {r} hơn',
  hint:'Gợi ý',
  spRoom:'{v} loài hợp {f}',
  spFood:'{v} loài thích {f}',
  spOrder:'chắc chắn trước, "hay có" sau',
  noSp:'Không có loài nào đặc biệt hợp {f} trong {g}.',
  thisGroup:'nhóm này',
  everyGroup:'mọi nhóm',
  allGroups:'Xem mọi nhóm',
  maybe:'hay có',
  maybeTip:'Không chắc: chỉ đúng khi bé nhận được thuộc tính này',
  spTitle:'Hợp với loài này',
  anyFood:'Món nào cũng được',
  moreTip:'Còn hợp'
};
