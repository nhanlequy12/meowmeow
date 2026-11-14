"use strict";
/* ============ PHỤ KIỆN ĐỘI: DỮ LIỆU (2026-11-14) ============
   Mũ, nơ, kính (ô ĐẦU) và vòng cổ, khăn (ô CỔ) cho mọi bé. Thuần trang trí: không đổi thuộc tính, chỉ +1 hoặc +2 độ vui
   (tổng tối đa ACC_HP_CAP mỗi bé). Mua bằng xu ở Cửa hàng › 🎀 Phụ kiện, đeo ở màn chi tiết mèo.
   Nạp sau js/garden-data.js (cần FEATS, FCATS). Luật: js/acc.js. Hình: js/acc-art.js. Giao diện: js/acc-ui.js. */
const ACC_LV=4;          // cấp mở tính năng
const ACC_HP_CAP=2;      // độ vui cộng thêm tối đa mỗi bé (đeo cả hai ô)
// sl: 'h' ô đầu, 'n' ô cổ. ul: cấp mở. hp: độ vui khi đeo. ic: biểu tượng chữ (ảnh thật vẽ bằng js/acc-art.js).
const ACCS=[
  {id:'bow',     sl:'h',n:'Nơ cài tai',        ic:'🎀',price:150, ul:4, hp:1,d:'Chiếc nơ hồng cài bên tai.'},
  {id:'bell',    sl:'n',n:'Vòng cổ chuông',    ic:'🔔',price:180, ul:4, hp:1,d:'Vòng cổ đỏ có quả chuông vàng nhỏ.'},
  {id:'party',   sl:'h',n:'Mũ sinh nhật',      ic:'🎉',price:250, ul:5, hp:1,d:'Mũ chóp sọc xanh có quả bông trên đỉnh.'},
  {id:'bandana', sl:'n',n:'Khăn yếm',          ic:'🔻',price:220, ul:5, hp:1,d:'Khăn tam giác chấm bi buộc quanh cổ.'},
  {id:'beanie',  sl:'h',n:'Mũ len',            ic:'🧶',price:320, ul:6, hp:1,d:'Mũ len nhỏ có quả bông, ấm đầu mùa lạnh (chỉ để đẹp).'},
  {id:'bowtie',  sl:'n',n:'Nơ cổ',             ic:'🎩',price:300, ul:6, hp:1,d:'Nơ con bướm lịch lãm đeo trước cổ.'},
  {id:'shades',  sl:'h',n:'Kính râm',          ic:'🕶️',price:450, ul:7, hp:1,d:'Kính râm tròng đen, ngầu hết nấc.'},
  {id:'scarf',   sl:'n',n:'Khăn quàng len',    ic:'🧣',price:420, ul:7, hp:1,d:'Khăn len sọc, đuôi khăn bay theo bước chạy.'},
  {id:'flowers', sl:'h',n:'Vòng hoa',          ic:'🌸',price:600, ul:8, hp:1,d:'Vòng hoa nhỏ đội trên đầu.'},
  {id:'straw',   sl:'h',n:'Mũ cói',            ic:'👒',price:650, ul:8, hp:2,d:'Mũ cói vành rộng có dải ruy băng.'},
  {id:'pearls',  sl:'n',n:'Chuỗi ngọc trai',   ic:'📿',price:1200,ul:10,hp:2,d:'Chuỗi ngọc trai trắng có mặt đá hồng.'},
  {id:'crown',   sl:'h',n:'Vương miện nhỏ',    ic:'👑',price:2400,ul:12,hp:2,d:'Vương miện vàng ba chóp nạm đá.'}
];
const ACC=Object.fromEntries(ACCS.map(a=>[a.id,a]));
const ACC_SL={h:'Đầu',n:'Cổ'};

/* Mèo trang phục đã có đồ ở đầu hay cổ thì ẩn phụ kiện ô đó (vẫn đeo, vẫn tính độ vui, chỉ không vẽ).
   Xét theo tên bộ phận trong s.cos (bộ kiểu cũ) và danh sách id cho các bé mà module CatKit tự vẽ đồ (không ghi trong cos). */
const ACC_HEAD_PARTS=['spk','nbandT','nband','hcap','haircap','strawhat','halo','spikes','blindfold','horns','tiara','tricorn','hood','fullmask','faceplate',
  'vhelm','pointhat','leaf','glasses','lenses','buns','twintails','longhair','qmark','chada','wreath','crown','rcrown','kcape','hhat','hcape','hveil','hbangs',
  'astro','astroF','helmet','royal','chef','ninja','bread','dj'];
const ACC_NECK_PARTS=['collar','scarf','tie','cravat','bow','sailor','cape','vcape','beard','usekh','malai','kcloak','hcloak','astro','astroF','helmet','royal','bread','ninja','npoptart'];
// id giống/trang phục: luôn ẩn ô đầu / ô cổ (module CatKit vẽ thêm mũ, nơ, tóc, vòng cổ không ghi trong cos)
const ACC_HIDE={h:['v_hellokitty','v_kuromi','v_marie','v_itadori','v_phineas','v_ferb','v_fushiguro','v_nobara','v_inumaki','v_faker','v_oner','v_keria','v_hackclaw','v_huh','v_totoro'],
  n:['v_maneki','v_toulouse','v_berlioz','v_marie','v_stormy','v_pip','v_luna','v_chi','v_dora','v_nyan','v_hellokitty','v_kuromi']};
// trang phục hiếm (khóa màu lông `ct`) có đồ ở đầu / cổ
const ACC_HIDE_CT={h:['kmChada','lyHood','skForest','psUnicorn','hkStrawberry','krmDarkMoon','fkAhriHall','fkWhite2026','onLeeSin','krBard','fgSukuna','itSukuna','tjKagura','gkGod','gkSSJ'],
  n:['svEgypt','spMalai','skForest','lyHood','kmChada','ryPurple','vdWhite','asOrange','hpSeeker']};

FEATS.push({lv:ACC_LV,id:'acc',ic:'🎀',n:'Phụ kiện cho mèo',d:'Mua mũ, nơ, kính, vòng cổ, khăn ở Cửa hàng › Phụ kiện rồi đeo cho bé ở màn chi tiết mèo. Mỗi bé một món ở đầu và một món ở cổ.'});
FCATS.push(['acc','🎀 Phụ kiện']);
// garden-data.js đã xếp FCATS theo bảng chữ cái tiếng Việt; thêm mục ở file nạp sau thì xếp lại (cùng cách)
{const key=c=>c[1].replace(/^[^\p{L}]+/u,''),col=new Intl.Collator('vi',{sensitivity:'base'});FCATS.sort((a,b)=>col.compare(key(a),key(b)))}
