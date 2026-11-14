"use strict";
/* ============ MÈO GHÉ CHƠI (2026-11-14): dữ liệu và hàm sinh bé lạ ============
   Thỉnh thoảng một bé mèo lạ (giống thật 1★–3★, hiếm khi 4★; không có 5★, mèo trang phục hay màu hiếm) ghé vào một phòng.
   Làm quen đủ điểm thì được hỏi nhận nuôi. Luật ở js/visit.js, giao diện ở js/visit-ui.js.
   File này cũng được trọng tài máy chủ (tools/guard.js) nạp: bé lạ sinh ra từ hạt giống xác định theo "mã khách",
   nên máy chủ chạy lại được và từ chối bé tự chế.
   Mã khách: 'ngày.lượt.ứng viên' (ví dụ '20406.1.2'):
     ngày = số ngày theo giờ Việt Nam (visDay), lượt = 0..VIS.newPerDay-1 (mỗi ngày tối đa bấy nhiêu bé lạ MỚI),
     ứng viên = 0..VIS.cand-1 (mỗi lượt có vài ứng viên, game chọn bé bị phòng của bạn hút nhất). Mỗi (ngày, lượt) chỉ nhận nuôi được một lần.
   Nạp ngay sau js/garden-data.js (trước game.js; các hàm chỉ gọi newCat, prng của game.js lúc chạy). */
const VIS={
  lv:5,                 // mở từ cấp 5, sau hướng dẫn tân thủ
  perDay:4,             // số lượt ghé mỗi ngày (cả bé mới lẫn bé quen quay lại)
  newPerDay:2,          // số bé lạ MỚI mỗi ngày: cũng là số bé nhận nuôi được tối đa mỗi ngày
  cand:3,               // số ứng viên của một lượt bé mới
  stars:[[1,.52],[2,.32],[3,.14],[4,.02]], // tỉ lệ sao của bé lạ (giống thật)
  stay:[6,12],          // phút bé ở lại mỗi lần ghé
  gap:[25,55],          // phút nghỉ giữa hai lượt ghé
  first:[2,6],          // lượt ghé đầu tiên sau khi mở tính năng
  back:.6,              // xác suất lượt ghé là một bé quen quay lại (khi có bé quen)
  life:5,               // bé lạ nhớ nhà bạn tối đa bấy nhiêu ngày kể từ lần đầu ghé; quá hạn thì đi xa, không ghé nữa
  keep:30,              // trọng tài nhận bé nhận nuôi có mã trong vòng bấy nhiêu ngày (rộng cho người chơi đồng bộ trễ)
  need:100,             // điểm làm quen để được hỏi nhận nuôi
  pts:{visit:12,attr:12,pet:10,feed:12,fav:25}, // điểm mỗi lần ghé (thêm theo độ hút của phòng, tối đa attr), vuốt ve, mời ăn (món khoái khẩu)
  gift:{coin:.7,coins:[6,3],items:['ballred','ballblue','paperbag','springmouse','succulent','cactus']}, // kỷ vật lần đầu ghé: 70% xu (6 + 3 × sao), còn lại một món rẻ vào Kho đồ
  xp:5,                 // kinh nghiệm khi nhận nuôi
};
FEATS.push({lv:VIS.lv,id:'visit',ic:'🐾',n:'Mèo ghé chơi',d:'Thỉnh thoảng một bé mèo lạ ghé vào phòng, bị hút bởi đồ ăn trong bát, đồ chơi và nội thất bé thích. Làm quen đủ thì nhận nuôi bé.'});

// số ngày theo giờ Việt Nam (UTC+7)
const visDay=t=>Math.floor((t+7*3600000)/86400000);
// đọc mã khách; trả {d, s, k} hoặc null nếu sai dạng
function visParse(id){
  const m=/^(\d{4,6})\.(\d)\.(\d)$/.exec(typeof id==='string'?id:'');if(!m)return null;
  const d=+m[1],s=+m[2],k=+m[3];return s<VIS.newPerDay&&k<VIS.cand?{d,s,k}:null;
}
const visSlot=id=>id.slice(0,id.lastIndexOf('.')); // 'ngày.lượt'
const visSeed=(d,s,k)=>(Math.imul(d,0x9E3779B1)^Math.imul(s*7+k+1,0x85EBCA6B)^0x7A5E11)|0;
// sinh bé lạ từ mã khách: luôn ra đúng một bé (giống, sao, màu, giới tính, thuộc tính, tên, tuổi) trên mọi máy
function visGen(id){
  const p=visParse(id);if(!p)return null;
  const R0=Math.random,S0=S;Math.random=prng(visSeed(p.d,p.s,p.k));
  try{
    S={nid:1};                                     // newCat lấy S.nid; không đụng bản lưu thật
    let r=Math.random(),star=1,acc=0;for(const [st,w] of VIS.stars){acc+=w;if(r<acc){star=st;break}}
    const pool=BREEDS.filter(b=>b.r===star),sp=pool[Math.floor(Math.random()*pool.length)];
    const c=newCat(sp,star);
    return {sp:c.sp,star:c.star,coat:c.coat,sex:c.sex,traits:c.traits,name:c.name,age:Math.round(Math.max(0,(now()-c.born)/DAY)*1000)/1000} // làm tròn: newCat đọc đồng hồ nên hai lần gọi có thể lệch 1 ms;
  }finally{Math.random=R0;S=S0}
}
