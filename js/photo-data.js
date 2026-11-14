"use strict";
/* ============ CHỤP ẢNH PHÒNG, ALBUM VÀ STICKER: dữ liệu (2026-11-14) ============
   Nạp sau js/compat-data.js (cần FEATS của data.js). Luật ở js/photo.js, kho ảnh ở js/photo-store.js, giao diện ở js/photo-ui.js.
   Mọi số cân bằng nằm ở PHC. Sticker khai báo ở PH_STK: mỗi cái có hàm thuần t(snap) nhận "ảnh chụp trạng thái" lúc bấm máy:
     snap={room, out (phòng ngoài trời), wx (kiểu thời tiết hoặc null khi chưa mở), hr (giờ 0–23), crit (có khách lạ trong khung),
           cats:[{uid, sp, star, v (mèo trang phục), rare (sao cầu vồng), form (trang phục hiếm), age (0 con, 1 lớn, 2 già),
                  st (trạng thái ent), sleep, bed, groom, eat, drink, jump, run, lv (tầng đang ngồi, -1 là sàn), heart (vừa được vuốt),
                  chase (đuổi khách lạ), sig (5★ đang diễn), md (5★ trong trạng thái đặc trưng), clone (phân thân), wx:['cold','hot','wet',…]}]}
   Thêm sticker: thêm một dòng vào PH_STK (id mới, đúng trang). Đổi id thì người chơi đã có sticker cũ mất ô đó. */
const PHOTO_LV=2;
const PHC={
  max:60,          // số ảnh tối đa trong album
  mb:24,           // tổng dung lượng tối đa của album (MB); ảnh lưu ở IndexedDB, không nằm trong bản lưu S
  maxW:960,        // bề ngang tối đa của ảnh lưu (điểm ảnh); ảnh thu nhỏ theo hệ số nguyên để hạt cườm vẫn sắc
  q:.9,            // chất lượng nén WebP (trình duyệt không nén được WebP thì dùng JPEG cùng chất lượng)
  coin:20,         // xu thưởng mỗi sticker mới
  page:1,          // vé thưởng khi đủ một trang sticker
  book:2,          // vé thưởng thêm khi đủ cả sổ
  cd:900,          // nghỉ giữa hai lần bấm máy (ms)
  thumbMs:3800     // ảnh nhỏ vừa chụp nằm ở góc khung phòng bao lâu
};
const PH_PAGES=[
  {id:'day',ic:'🏠',n:'Thường ngày'},
  {id:'pal',ic:'🐾',n:'Bạn bè'},
  {id:'leg',ic:'⭐',n:'Huyền thoại'},
  {id:'wx', ic:'🌦️',n:'Thời tiết'}
];
const phN=(s,f)=>s.cats.filter(f).length;     // số bé trong ảnh thỏa điều kiện (không tính phân thân trừ khi điều kiện hỏi)
const phReal=c=>!c.clone;
const PH_STK=[
  // Thường ngày
  {id:'first', pg:'day',ic:'📸',n:'Tấm ảnh đầu tiên', h:'Chụp một tấm bất kỳ.',                              t:s=>true},
  {id:'nap',   pg:'day',ic:'💤',n:'Giấc ngủ trưa',    h:'Chụp lúc có bé đang ngủ.',                           t:s=>s.cats.some(c=>c.sleep)},
  {id:'bed',   pg:'day',ic:'🛏️',n:'Ổ ấm',            h:'Cho một bé ngủ trong ổ rồi chụp.',                   t:s=>s.cats.some(c=>c.bed)},
  {id:'groom', pg:'day',ic:'🧼',n:'Chải chuốt',       h:'Chụp lúc một bé đang liếm lông.',                    t:s=>s.cats.some(c=>c.groom)},
  {id:'feast', pg:'day',ic:'🍽️',n:'Bữa tiệc',        h:'Đổ đầy bát rồi chụp lúc 3 bé cùng ăn.',              t:s=>phN(s,c=>c.eat&&phReal(c))>=3},
  {id:'drink', pg:'day',ic:'💧',n:'Ngụm nước mát',    h:'Chụp lúc một bé đang uống nước.',                    t:s=>s.cats.some(c=>c.drink)},
  {id:'jump',  pg:'day',ic:'🦘',n:'Bay lên nào',      h:'Chụp đúng lúc một bé đang nhảy.',                    t:s=>s.cats.some(c=>c.jump)},
  {id:'high',  pg:'day',ic:'🗼',n:'Trên đỉnh cao',    h:'Chụp bé đang ngồi trên tầng cao của tháp mèo.',      t:s=>s.cats.some(c=>c.lv>=1)},
  // Bạn bè
  {id:'crowd', pg:'pal',ic:'👨‍👩‍👧',n:'Cả nhà',          h:'Chụp 5 bé trở lên trong một tấm.',                   t:s=>phN(s,phReal)>=5},
  {id:'pet',   pg:'pal',ic:'💕',n:'Được cưng',        h:'Vuốt ve một bé rồi chụp ngay lúc tim còn bay.',      t:s=>s.cats.some(c=>c.heart)},
  {id:'kitten',pg:'pal',ic:'🍼',n:'Mèo con',          h:'Chụp một bé mèo con.',                               t:s=>s.cats.some(c=>c.age===0)},
  {id:'elder', pg:'pal',ic:'👴',n:'Mèo già',          h:'Chụp một bé mèo già.',                               t:s=>s.cats.some(c=>c.age===2)},
  {id:'family',pg:'pal',ic:'👪',n:'Ông cháu',         h:'Chụp mèo con và mèo già trong cùng một tấm.',        t:s=>s.cats.some(c=>c.age===0)&&s.cats.some(c=>c.age===2)},
  {id:'zoom',  pg:'pal',ic:'💨',n:'Chạy loạn',        h:'Chụp lúc 2 bé cùng chạy.',                           t:s=>phN(s,c=>c.run&&phReal(c))>=2},
  {id:'hunt',  pg:'pal',ic:'🐭',n:'Đi săn',           h:'Chụp lúc một bé đang đuổi khách lạ.',                t:s=>s.cats.some(c=>c.chase)},
  {id:'guest', pg:'pal',ic:'🦋',n:'Khách lạ',         h:'Chụp lúc có chuột, bướm hay cuộn len trong phòng.',  t:s=>!!s.crit},
  // Huyền thoại
  {id:'star5', pg:'leg',ic:'⭐',n:'Huyền thoại',      h:'Chụp một bé 5★.',                                    t:s=>s.cats.some(c=>c.star===5)},
  {id:'sig',   pg:'leg',ic:'✨',n:'Khoảnh khắc vàng',  h:'Chụp lúc một bé 5★ đang diễn hành động riêng.',      t:s=>s.cats.some(c=>c.sig)},
  {id:'aura',  pg:'leg',ic:'🌟',n:'Sức mạnh bùng nổ', h:'Chụp bé 5★ trong trạng thái đặc biệt 60 giây.',      t:s=>s.cats.some(c=>c.md&&phReal(c))},
  {id:'clone', pg:'leg',ic:'🍥',n:'Phân thân',        h:'Chụp lúc Mèo Naruto đang phân thân.',                t:s=>s.cats.some(c=>c.clone)},
  {id:'rare',  pg:'leg',ic:'🌈',n:'Sao cầu vồng',     h:'Chụp một bé có sao cầu vồng (màu hiếm, mắt quý).',   t:s=>s.cats.some(c=>c.rare)},
  {id:'form',  pg:'leg',ic:'👑',n:'Trang phục hiếm',  h:'Chụp một bé 5★ mang trang phục hiếm.',               t:s=>s.cats.some(c=>c.form)},
  {id:'trio5', pg:'leg',ic:'🏆',n:'Hội tụ',           h:'Chụp 3 bé 5★ trong cùng một tấm.',                   t:s=>phN(s,c=>c.star===5&&phReal(c))>=3},
  {id:'party', pg:'leg',ic:'🎭',n:'Dạ hội hóa trang', h:'Chụp 4 bé mặc trang phục trong cùng một tấm.',       t:s=>phN(s,c=>c.v&&phReal(c))>=4},
  // Thời tiết
  {id:'rain',  pg:'wx', ic:'🌧️',n:'Ngày mưa',        h:'Chụp lúc trời đang mưa.',                            t:s=>s.wx==='drizzle'||s.wx==='storm'},
  {id:'snow',  pg:'wx', ic:'❄️',n:'Tuyết trắng',      h:'Chụp lúc trời có tuyết.',                            t:s=>s.wx==='snow'||s.wx==='blizzard'},
  {id:'sun',   pg:'wx', ic:'☀️',n:'Nắng đẹp',         h:'Chụp ở phòng ngoài trời lúc nắng đẹp, ban ngày.',     t:s=>s.out&&(s.wx==='sunny'||s.wx==='ideal')&&s.hr>=6&&s.hr<18},
  {id:'night', pg:'wx', ic:'🌙',n:'Đêm yên',          h:'Chụp lúc đêm khuya (từ 22 giờ tới 5 giờ sáng).',     t:s=>s.hr>=22||s.hr<5},
  {id:'cold',  pg:'wx', ic:'🥶',n:'Run cầm cập',      h:'Chụp lúc một bé đang bị lạnh.',                      t:s=>s.cats.some(c=>c.wx.includes('cold'))},
  {id:'hot',   pg:'wx', ic:'🥵',n:'Nóng hầm hập',     h:'Chụp lúc một bé đang bị nóng.',                      t:s=>s.cats.some(c=>c.wx.includes('hot'))},
  {id:'wet',   pg:'wx', ic:'💦',n:'Mèo ướt',          h:'Chụp lúc một bé bị ướt lông.',                       t:s=>s.cats.some(c=>c.wx.includes('wet'))},
  {id:'garden',pg:'wx', ic:'🌳',n:'Dã ngoại',         h:'Chụp 3 bé trở lên ở phòng ngoài trời.',              t:s=>s.out&&phN(s,phReal)>=3}
];
const PH_STK_BY=Object.fromEntries(PH_STK.map(k=>[k.id,k]));
if(typeof FEATS!=='undefined')FEATS.push({lv:PHOTO_LV,id:'photo',ic:'📷',n:'Chụp ảnh phòng',d:'Nút 📷 ở khung phòng: chụp lại khoảnh khắc của các bé, lưu vào album, tải ảnh về máy và sưu tầm sticker.'});
