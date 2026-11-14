"use strict";
/* ============ CHƠI VỚI BÉ: luật (2026-11-14) ============
   Hai trò chơi nhỏ trong tab Phòng: cần câu lông vũ (lông vũ theo chuột, ngón tay) và đèn laser (chấm đỏ tự chạy, chạm để chỉ chỗ).
   Các bé ở gần đuổi theo và vồ; vồ trúng thì bé vui hơn. File này chỉ có luật, không đụng DOM (chạy được trong Node).
   Giao diện, hành vi của mèo trong phòng ở js/play-ui.js. Nạp sau js/garden.js (cần game.js; med.js, meal.js, stray.js nếu có).
   - Mở từ cấp PLAYC.lv (dòng trong FEATS nên có trong Lộ trình và thông báo lên cấp).
   - Mỗi bé được thưởng tối đa một lần mỗi PLAYC.cd (10 phút, như PET_CD): +PLAYC.hp vui theo trò, +PLAYC.xp kinh nghiệm, tốn PLAYC.cost năng lượng,
     gọi onAct('play',1) để nhiệm vụ và thành tựu đếm được. Vồ trúng trong lúc chờ thì bé vẫn vui (tim) nhưng không cộng gì.
   - Không chơi được (playWhy trả lý do): đi lạc, nằm viện, đi vắng (viễn chinh, đi tìm bạn), đang ngủ trong ổ, đang ăn, uống,
     đau chân (bong gân, gãy chân), mệt (năng lượng dưới PLAYC.en). Bé đang ngủ trưa trong phòng (trạng thái nap) do play-ui.js tự bỏ qua.
   - Trạng thái lưu ở S.play = {at:{uid: lúc được thưởng gần nhất}, n: số lần được thưởng, s: số lượt chơi}. Bản lưu cũ không có thì tự tạo.
   Không cho xu: phần thưởng chỉ là độ vui và một chút kinh nghiệm, nên không đụng kinh tế (trọng tài máy chủ không cần biết). */
const PLAYC={
  lv:2,            // cấp mở
  dur:20,          // giây một lượt chơi
  cd:600000,       // mỗi bé được thưởng 10 phút một lần
  hp:{feather:8,laser:6},   // độ vui khi vồ trúng
  xp:1,            // kinh nghiệm mỗi lần được thưởng
  cost:3,          // năng lượng mất mỗi lần được thưởng (chạy nhảy mệt)
  en:25,           // dưới mức này là mệt, không chơi
  near:170,        // bé cách đồ chơi bao xa (ô, theo chiều ngang) thì chạy tới chơi
  max:6,           // tối đa bao nhiêu bé cùng đuổi một lúc
};
const PLAY_KIND={
  feather:{ic:'🪶',n:'Cần câu lông vũ',d:'Lông vũ bay theo chuột hoặc ngón tay của bạn. Các bé ở gần đuổi theo và nhảy vồ.'},
  laser:{ic:'🔴',n:'Đèn laser',d:'Chấm đỏ tự chạy khắp phòng, chạm vào phòng để chỉ chỗ cho chấm đỏ. Các bé lao theo rất hăng.'},
};
FEATS.push({lv:PLAYC.lv,id:'play',ic:'🪶',n:'Chơi với bé',d:'Tab Phòng có nút 🪶 Chơi: cần câu lông vũ và đèn laser. Bé vồ trúng thì vui hơn, mỗi bé 10 phút được thưởng một lần.'});

const playOpen=()=>!!(S&&S.level>=PLAYC.lv);
const playSt=()=>{const p=S.play||(S.play={});if(!p.at||typeof p.at!=='object')p.at={};p.n=p.n|0;p.s=p.s|0;return p};
// còn bao lâu (ms) bé mới được thưởng lần nữa
const playCd=c=>Math.max(0,((S.play&&S.play.at&&S.play.at[c.uid])||0)+PLAYC.cd-now());
const playLeg=c=>(c.ill||[]).some(x=>typeof DIS!=='undefined'&&DIS[x.k]&&DIS[x.k].inj&&(DIS[x.k].noTrip||x.k==='sprain'));
// lý do bé không chơi được, chuỗi rỗng là chơi được
function playWhy(c){
  if(!c)return 'Không có bé';
  if(S.hosp&&S.hosp[c.uid])return 'Đang nằm viện';
  if(typeof strayOf==='function'&&strayOf(c.uid))return 'Đang đi lạc';
  if(onTrip(c.uid))return 'Đang đi vắng';
  if(typeof bedItem==='function'&&bedItem(c))return 'Đang ngủ';
  if(typeof mealOf==='function'&&mealOf(c))return c.meal.k==='w'?'Đang uống nước':'Đang ăn';
  if(playLeg(c))return 'Đau chân';
  if(c.en<PLAYC.en)return 'Mệt';
  return '';
}
// bé vồ trúng đồ chơi. Trả null nếu bé không chơi được; {hp:0} nếu đang trong thời gian chờ; còn lại là phần thưởng đã cộng.
function playReward(c,kind){
  if(!playOpen()||!c||playWhy(c))return null;
  const cd=playCd(c);if(cd>0)return {hp:0,xp:0,cd};
  const p=playSt(),hp=PLAYC.hp[kind]||PLAYC.hp.feather;
  p.at[c.uid]=now();p.n++;
  c.hp=clamp(c.hp+hp,0,100);c.en=clamp(c.en-PLAYC.cost,0,100);
  addXp(PLAYC.xp);onAct('play',1);save();
  return {hp,xp:PLAYC.xp,cd:0};
}
// bắt đầu một lượt: đếm lượt chơi, dọn dấu thời gian của bé không còn trong nhà
function playBegin(){
  if(!playOpen())return false;
  const p=playSt();p.s++;
  const t=now();Object.keys(p.at).forEach(u=>{if(t-p.at[u]>PLAYC.cd||!S.cats.some(c=>c.uid===+u))delete p.at[u]});
  return true;
}
// các bé ở nhà trong phòng rid chia theo tình trạng: sẵn sàng được thưởng, đang chờ, không chơi được
function playRoster(rid){
  const ok=[],wait=[],no=[];
  S.cats.filter(c=>c.room===rid&&!onTrip(c.uid)).forEach(c=>{const w=playWhy(c);if(w)no.push({c,why:w});else if(playCd(c)>0)wait.push({c,cd:playCd(c)});else ok.push({c})});
  // bé đi lạc, nằm viện vẫn có c.room nhưng onTrip đúng: thêm vào nhóm không chơi được để người chơi biết
  S.cats.filter(c=>c.room===rid&&onTrip(c.uid)).forEach(c=>no.push({c,why:playWhy(c)||'Đang đi vắng'}));
  return {ok,wait,no};
}
