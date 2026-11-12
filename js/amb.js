"use strict";
/* ============ HIỆU ỨNG QUANH THÂN LUÔN BẬT + VỆT CỦA GIỐNG THẬT 4★ ============
   Nạp sau js/ui.js và js/pack18.js. Không sửa ui.js: bọc drawEnt (vẽ một bé trong phòng) và trail (vệt lúc di chuyển).
   1. AMB[khóa]: hiệu ứng nhỏ quanh thân, chạy cả lúc bé đứng yên, ngồi, ngủ. Khóa là id mèo (mọi trang phục của bé đó, vd Zenitsu luôn có sét)
      hoặc 'id~coat' (riêng một trang phục hiếm 5★, vd Thần Tài vàng có tiền rơi). Có khóa 'id~coat' thì dùng nó, không thì dùng khóa id.
      Mọi trang phục hiếm 5★ đều có một mục. Mỗi mục là hàm (p, e, c) tự sinh hạt bằng rp; tần suất thấp (khoảng 2–4 hạt mỗi giây)
      vì hiệu ứng chạy suốt và phòng có trần PMAX hạt. Gần chạm trần (70%) thì tạm nghỉ để nhường hạt cho vệt và hành động riêng.
   2. Giống thật 4★ (25 giống) trước chỉ có bụi chân như mèo thường: nay lúc đi và chạy có thêm lấp lánh tím của bậc 4★. */
(()=>{
  const R=(a,b)=>a+Math.random()*(b-a),P=a=>a[Math.floor(Math.random()*a.length)];
  // các kiểu hạt dùng chung: x, y là chân bé; vùng quanh thân rộng khoảng 28 ô, cao khoảng 36 ô
  const A={
    bolt:(p,c,r)=>{if(on(r||3))rp(p.x+R(-13,13),p.y-R(6,32),P(c),{sh:'bolt',pts:zig(Math.random()<.5?1:-1,R(6,11),3,4),life:R(.1,.18)})},
    fall:(p,c,r,o)=>{if(on(r||2.5))rp(p.x+R(-15,15),p.y-R(30,42),P(c),Object.assign({vy:R(10,22),vx:R(-5,5),life:R(.8,1.2),sz:2},o))},          // rơi nhẹ từ trên đầu (lá, hoa, tuyết)
    rise:(p,c,r,o)=>{if(on(r||3))rp(p.x+R(-12,12),p.y-R(0,14),P(c),Object.assign({vy:-R(14,30),vx:R(-3,3),life:R(.35,.7),sz:Math.random()<.4?2:1},o))}, // bốc lên từ chân (lửa, khí)
    star:(p,c,r)=>{if(on(r||2.5))rp(p.x+R(-15,15),p.y-R(4,36),P(c),{sh:'star',life:R(.4,.7),vy:-4})},
    gly:(p,c,g,r)=>{if(on(r||1.6))rp(p.x+R(-14,14),p.y-R(18,34),P(c),{sh:g,vy:-R(5,10),vx:R(-4,4),life:.9})},
    coin:(p,r)=>{if(on(r||2.2))rp(p.x+R(-15,15),p.y-R(32,44),'#f2c230',{sh:'coin',vx:R(-5,5),vy:R(4,16),g:150,gy:p.y-1,life:1.1})},
    ring:(p,c,r)=>{if(on(r||.8))rp(p.x,p.y-R(10,18),P(c),{sh:'ring',r:3,vr:R(18,28),life:.55})},
    line:(p,c,r)=>{if(on(r||2))rp(p.x+R(-16,16),p.y-R(4,32),P(c),{sh:'line',len:R(6,12),bd:Math.random()<.5?1:-1,life:.14})},
    orb:(p,c,r)=>{if(on(r||2)){const a=performance.now()/600+R(0,.5);rp(p.x+Math.cos(a)*15,p.y-17+Math.sin(a)*6,P(c),{life:.35,sz:2})}},       // chấm sáng chạy vòng quanh thân
    pix:(p,c,r)=>{if(on(r||3))rp(p.x+R(-14,14),p.y-R(2,34),P(c),{life:R(.15,.4),sz:2})}
  };
  const FIRE=['#ff5a1a','#ff9a2a','#ffd24a'],GOLD=['#ffd24a','#fff3b0','#f2c230'];
  const AMB={
    // ---- luôn có, mọi trang phục ----
    v_thunder:p=>A.bolt(p,['#ffd83a','#ffffff'],5),                                                   // Zenitsu: sét vàng quanh thân
    v_gojo:p=>{A.orb(p,['#5aa9ff','#b7dcff'],2.2)},                                                   // Gojo: chấm xanh của Vô Hạn chạy vòng
    v_nyan:p=>A.star(p,['#ffffff','#ffe07a','#ff9ad5'],2.2),                                          // Nyan Cat: sao pixel
    v_vader:p=>A.rise(p,['#ff3a3a','#7a0a10'],2),                                                     // Vader: tàn đỏ
    lykoi:p=>A.rise(p,['#8a90a4','#c8ccd8'],1.6,{a:.5,sz:2,vy:-6,life:.9}),                           // Lykoi: sương đêm
    v_luna:p=>A.gly(p,['#ffe07a','#fff3b0'],'moon',.9),                                               // Luna 4★: trăng khuyết
    v_dj:p=>A.gly(p,['#f06ad0','#5ad0e8','#ffd24a'],'note',1),                                        // DJ 4★: nốt nhạc
    // ---- trang phục hiếm 5★: hiệu ứng theo chủ đề ----
    'khaomanee~kmChada':p=>{A.star(p,GOLD,2.4);A.ring(p,['#ffd24a'],.5)},                              // mão vàng: lấp lánh vàng, vòng sáng
    'lykoi~lyHood':p=>{A.fall(p,['#d8303a','#8a1020'],2.2);A.rise(p,['#8a90a4'],1,{a:.5,vy:-6,life:.9})}, // khăn đỏ: cánh hoa đỏ rơi, sương
    'savannah~svEgypt':p=>{A.rise(p,['#e8c070','#f2d898'],2.6,{vy:-R(6,14),life:.8});A.star(p,['#ffd24a','#5ad0e8'],1.2)}, // Pharaoh: cát vàng, ánh ngọc lam
    'sokoke~skForest':p=>{A.fall(p,['#5fbf7a','#3f8f58','#a6d86a'],2.4);A.star(p,['#d8ff8a'],1)},      // thần rừng: lá rơi, đom đóm
    'suphalak~spMalai':p=>{A.fall(p,['#ffffff','#fff3d0'],2.4);A.rise(p,['#ffb060'],1.2)},             // vòng hoa nhài: hoa trắng rơi
    'v_naruto~nrKurama':p=>{A.rise(p,['#ffd24a','#ff9a2a','#ffe9a0'],3.2);A.orb(p,['#1a1420'],1.6)},   // Cửu Vĩ: lửa chakra, cầu đen xoay
    'v_naruto~nrHokage':p=>{A.fall(p,['#5fbf7a','#3f8f58'],2.4,{vx:R(8,16)});A.rise(p,['#ff5a1a','#ffffff'],1.2)}, // Hokage: lá bay theo gió
    'v_goku~gkGod':p=>{A.rise(p,['#ff3a4a','#ff8a8a','#ffd0d0'],3.2);A.ring(p,['#ff6a7a'],.5)},        // God: lửa đỏ
    'v_tanjiro~tjKagura':p=>{A.rise(p,FIRE,3);A.orb(p,FIRE,1.6)},                                      // Hỏa Thần: tàn lửa xoay
    'v_thunder~ztGod':p=>{A.bolt(p,['#ff5a2a','#ffd24a','#ffffff'],5.5);A.rise(p,FIRE,1.6)},           // Hỏa Lôi Thần: sét đỏ cam, tàn lửa
    'v_gojo~gjSix':p=>{A.orb(p,['#b04aff','#e0b8ff'],3);A.star(p,['#b7dcff','#ffffff'],1.2)},          // Lục Nhãn: chấm tím xoay
    'v_itadori~itSukuna':p=>{A.line(p,['#ffffff','#ffb0b0'],2.2);A.rise(p,['#8a1020','#e0283a'],1.6)}, // Sukuna: vệt chém nhỏ, khí đỏ
    'v_fushiguro~fgSukuna':p=>{A.line(p,['#ffffff','#ffb0b0'],1.6);A.rise(p,['#1c1a2c','#d2304e'],2.2,{a:.7,sz:2})}, // vật chứa: bóng đen, vệt chém
    'v_chi~chiExplorer':p=>{A.gly(p,['#f0a060','#ffffff'],'paw',1.2);A.star(p,['#ffe07a'],1.2)},       // Chi thám hiểm: dấu chân
    'v_harry~hpSeeker':p=>{A.orb(p,['#ffd24a','#fff3b0'],3);A.star(p,['#d8303a','#ffd24a'],1.2)},      // Tầm thủ: trái Snitch vàng bay vòng
    'v_vader~vdWhite':p=>{A.fall(p,['#ffffff','#bfe2ff'],2.6,{vy:R(6,12),sz:1});A.star(p,['#bfe2ff'],1)}, // Vader Trắng: bụi băng
    'v_nyan~nyTac':p=>{A.star(p,['#6a3ab0','#2a1a44','#b04aff'],2.6);A.pix(p,['#2a1a44','#6a3ab0'],1.6)}, // Tac Nayn: sao tối, nhiễu
    'v_maneki~mkGold':p=>{A.coin(p,2.6);A.star(p,GOLD,1.4)},                                            // Vàng ròng: tiền rơi quanh thân
    'v_astro~asOrange':p=>{A.rise(p,['#ff8a2a','#ffd24a','#a0a0a8'],2.6);A.star(p,['#ffffff'],1)},     // đồ phóng tàu: tia lửa, khói
    'v_royal~ryPurple':p=>{A.fall(p,['#b04aff','#ffd24a','#e0b8ff'],2.8);A.star(p,GOLD,1)},            // hoàng bào tím: hoa giấy tím vàng
    'v_faker~fkWhite2026':p=>{A.star(p,['#ffffff','#f6d987'],2.6);A.gly(p,['#f6d987'],'t1',.6)},       // White Legacy: sao trắng vàng
    'v_oner~onLeeSin':p=>{A.rise(p,['#ff8a2a','#ffd24a'],2.4);A.ring(p,['#ffd24a'],.6)},               // Lee Sin: khí quyền
    'v_keria~krBard':p=>{A.orb(p,['#ffe07a','#b7dcff'],2.6);A.gly(p,['#ffe07a','#b7dcff'],'note',.8)}, // Bard: chuông sáng xoay, nốt nhạc
    'v_hackclaw~hcInky':p=>{A.pix(p,['#12121a','#3a3a52','#8a90a4'],3);A.fall(p,['#12121a'],1.2,{sz:2})}, // Mặc Ảnh: giọt mực
    'v_hellokitty~hkStrawberry':p=>{A.gly(p,['#ff8fa3','#ff5a7a'],'heart',1.4);A.fall(p,['#ff5a7a','#ffffff'],1.6)}, // Dâu Tây: tim, cánh hoa hồng
    'v_kuromi~krmDarkMoon':p=>{A.gly(p,['#b04aff','#ff8fd0'],'moon',1);A.gly(p,['#2a1a44'],'bat',.7);A.star(p,['#e0b8ff'],1)}, // Hắc Nguyệt: trăng, dơi
    'v_pusheen~psUnicorn':p=>{A.star(p,['#ff9ad5','#b7dcff','#fff3b0','#b8f0c0'],3)},                  // Kỳ Lân: sao cầu vồng
    'v_marie~mrParis':p=>{A.fall(p,['#ff8fa3','#ffffff','#ffd0e0'],2.2);A.gly(p,['#ffd24a'],'note',.8)} // Vũ hội Paris: cánh hoa, nốt nhạc
    // Faker Ahri: chín đuôi phấp phới đã có sẵn trong LOOKFX (js/pack18.js)
  };
  window.AMB=AMB;
  const d0=drawEnt;
  drawEnt=function(e,p){
    d0.apply(this,arguments);
    if(e.clone||e.dead||rparts.length>PMAX*.7)return;
    const c=entCat(e);if(!c)return;
    const f=(c.coat&&AMB[c.sp+'~'+c.coat])||AMB[c.sp];
    if(f)f(p,e,c);
  };
  // giống thật 4★ không có vệt riêng: bụi chân kèm lấp lánh tím của bậc 4★ (mèo màu hiếm giữ vệt vàng cũ)
  const t0=trail,V4={c:['#b48cf2','#e6d8ff','#ffffff'],r:5};
  trail=function(e,c,p){
    t0.apply(this,arguments);
    if(c.star>=4&&!TRAIL[c.sp]&&!isRare(c)&&rparts.length<PMAX*.75){const bd=e.flip?-1:1;K.sparkle(e,p,p.x+bd*11,bd,e.state!=='walk',p.gy||p.y,V4)}
  };
})();
