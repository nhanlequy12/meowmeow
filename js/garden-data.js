"use strict";
/* ============ VƯỜN NHỎ (2026-11-12): dữ liệu và số cân bằng ============
   Chậu cây, luống rau, hồ cá đặt ở phòng ngoài trời (Ban công, Sân vườn, Hồ bơi, Sân thượng) hoặc Nhà kính.
   Cây lớn theo khí hậu thật của phòng (roomClimate: nhiệt độ có tính sưởi, mưa sau mái che, gió) và nắng ban ngày;
   mưa tự tưới, nắng nóng làm đất khô nhanh, rét đậm làm cây chậm lớn và dập lá, giông gió làm cây yếu.
   Thu hoạch vào giỏ vườn S.gd.inv, nấu thành suất ăn trong kho thức ăn (S.fdinv) hoặc đặt làm bát mồi cho bé đi lạc.
   Nạp sau js/med-data.js (cần WD, FURNS, FURN, FCATS, FEATS). Luật: js/garden.js. Giao diện: js/garden-ui.js. Hình: js/furn/gd-*.js.
   Trạng thái món đồ: chậu, luống it.gd={c: cây|null, p: tiến độ 0..1, wa: nước 0..100, hp: sức cây 0..100, dead, rn: đã báo chín};
   hồ cá it.fp={n: số cá, fed: no tới lúc, b: tiến độ đẻ 0..1}. */
const GD_LV=4;
const GD_ROOMS=['balcony','garden','greenhouse','pool','rooftop'];
const GDC={
  dry:100/240,          // đất khô hết trong 4 giờ lúc bình thường (điểm nước mỗi phút)
  rainFill:8,           // mưa: + rain × 8 điểm nước mỗi phút (mưa nhẹ +4, mưa giông +8)
  thirst:.3,            // đất khô kiệt: cây mất 0,3 sức mỗi phút (khoảng 5,5 giờ mới chết)
  frost:.4,             // phòng ≤ 0°C: mất 0,4 sức mỗi phút
  scorch:.3,            // phòng ≥ 38°C: mất 0,3 sức mỗi phút
  storm:.25,            // mưa to kèm gió mạnh (rain ≥ .7, wind ≥ .5 sau mái che): mất 0,25 sức mỗi phút
  heal:.3,              // đủ nước, không bị hại: hồi 0,3 sức mỗi phút
  night:.5,             // ban đêm cây lớn bằng một nửa
  sun:1.3,              // nắng đẹp hoặc lý tưởng ban ngày: lớn nhanh hơn 30%
  season:{spring:1.2,summer:1,autumn:1,winter:.6},
  fish:{max:6,breed:180,fed:360,feed:5,sell:60,buy:80,start:2}, // cá: đẻ thêm một con mỗi 3 giờ khi được cho ăn trong 6 giờ qua; giá xu
  xp:3,                 // kinh nghiệm mỗi lần thu hoạch
};
// cây trồng: seed giá hạt giống (xu), grow số phút lớn từ gieo tới chín (lúc điều kiện bình thường), yield số quả cho chậu nhỏ (luống nhân mult của luống)
const GCROPS=[
  {id:'grass', n:'Cỏ mèo', ic:'🌿',seed:20,grow:45, yield:2,ul:4,d:'Lớn nhanh, mèo mê. Nấu thành suất Cỏ mèo, hoặc làm bát mồi: bé đi lạc về sau 25 phút.'},
  {id:'carrot',n:'Cà rốt', ic:'🥕',seed:35,grow:100,yield:2,ul:5,d:'Rau củ dễ trồng. Nấu thành Pate rau củ hoặc Súp thưởng.'},
  {id:'pump',  n:'Bí đỏ',  ic:'🎃',seed:60,grow:240,yield:1,ul:9,d:'Lâu chín nhưng quý: nguyên liệu của Súp thưởng và Hộp cao cấp.'},
];
const GCROP=Object.fromEntries(GCROPS.map(c=>[c.id,c]));
// món nấu từ giỏ vườn: need nguyên liệu, food món trong kho thức ăn, q số suất nhận được
const GRECIPES=[
  {id:'r_nip',  n:'Cỏ mèo tươi',     need:{grass:2},               food:'catnip', q:4},
  {id:'r_pate', n:'Pate rau củ',     need:{carrot:2},              food:'pate',   q:6},
  {id:'r_soup', n:'Súp bí đỏ',       need:{pump:1,carrot:1},       food:'churu',  q:8},
  {id:'r_prem', n:'Hộp vườn cao cấp',need:{pump:1,carrot:2,grass:2},food:'premium',q:4},
];
// bát mồi bằng rau vườn: phút để bé đi lạc tự về (không tốn xu)
const GLURE={grass:25,carrot:60,pump:45};
FEATS.push({lv:GD_LV,id:'garden',ic:'🌱',n:'Vườn nhỏ',d:'Trồng cỏ mèo, rau và nuôi cá cảnh ở ban công, sân vườn. Nắng mưa ảnh hưởng tới vườn; thu hoạch nấu thành suất ăn hoặc làm bát mồi.'});
FCATS.push(['garden','🌱 Vườn nhỏ']);
{
  const G=(id,n,price,w,h,ul,o)=>WD(id,n,price,'floor',w,h,'garden',ul,1,{},Object.assign({rooms:GD_ROOMS},o));
  [
    G('gpot', 'Chậu cây nhỏ',  240, 16,20,GD_LV,{gd:{mult:1},happy:2,d:'Trồng một cây. Chỉ đặt ở phòng ngoài trời hoặc Nhà kính. Chạm vào chậu để gieo hạt, tưới, thu hoạch.'}),
    G('gbed', 'Luống rau gỗ',  1200,44,20,7,   {gd:{mult:3},happy:3,d:'Luống lớn, thu hoạch gấp 3 chậu nhỏ. Chỉ đặt ở phòng ngoài trời hoặc Nhà kính.'}),
    G('gpond','Hồ cá cảnh',    2400,48,18,8,   {pond:1,happy:8,d:'Có sẵn 2 chú cá. Cho cá ăn thì cá đẻ thêm (tối đa 6), bán bớt được xu. Mèo thích ngồi ngắm: +8 vui. Rét dưới 0°C thì mặt hồ đóng băng.'}),
  ].forEach(f=>{if(FURN[f.id])throw new Error('trùng id nội thất '+f.id);FURNS.push(f);FURN[f.id]=f});
}
// Mục cửa hàng xếp theo bảng chữ cái tiếng Việt (bỏ biểu tượng đầu tên); món bên trong mỗi mục giữ nguyên thứ tự.
// File này là file dữ liệu cuối cùng thêm mục vào FCATS: thêm mục mới ở file nạp sau thì chuyển dòng này xuống sau đó.
{const key=c=>c[1].replace(/^[^\p{L}]+/u,''),col=new Intl.Collator('vi',{sensitivity:'base'});FCATS.sort((a,b)=>col.compare(key(a),key(b)))}
