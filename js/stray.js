"use strict";
/* ============ BÉ BỎ NHÀ ĐI (2026-11-12): luật ============
   Mèo không bao giờ chết hay mất hẳn. Bị bỏ bê lâu (đói, khát, buồn, yếu cùng lúc) thì bé giận, rồi bỏ nhà đi lang thang:
   vẫn nằm trong S.cats và bộ sưu tập, chỉ vắng mặt (onTrip trả true: không ở phòng, không viễn chinh, chỉ số đứng yên).
   Đưa bé về: nhờ một bé khác ở nhà đi tìm (chuyến ngắn), đặt bát mồi (trả xu, món khoái khẩu thì về nhanh hơn), hoặc bé tự về sau STRAY.back.
   Nạp sau js/meal.js, trước js/ui.js (để phần bù thời gian vắng mặt lúc tải game cũng tính). Giao diện: js/stray-ui.js.
   Trạng thái: c.ng = điểm giận (0..STRAY.leave); S.stray[uid] = {at, why:[...], room, seen, hunt:{by,end}, lure:{food,end}}.
   game.js gọi: strayCat(c) (bỏ qua bé đi lạc khi tính chỉ số), strayAway(uid) (trong onTrip), strayTick(dt,sim) (cuối tick). */
const STRAY={
  lv:4,                 // mở từ cấp 4 (người mới chưa bị)
  leave:360,            // điểm giận đủ để bỏ đi: khoảng 6 giờ vừa đói vừa buồn (hoặc 3 giờ đói, khát, buồn cùng lúc)
  warn:150,             // từ mức này bé "Giận dỗi" (khoảng 2,5 giờ vừa đói vừa buồn, hoặc một đêm bỏ đói lúc vắng): báo trước để người chơi kịp chăm
  calm:4,               // khi được chăm tử tế: giảm 4 điểm mỗi phút (6 giờ giận nguôi trong 1,5 giờ)
  away:.5,              // lúc người chơi vắng (bù thời gian khi tải game): giận chậm bằng một nửa; một đêm bỏ đói thì giận dỗi, hai đêm liền mới bỏ đi
  back:48*3600000,      // bé tự về sau 2 ngày thật dù không làm gì
  hunt:{min:20,en:20,full:20}, // nhờ bạn đi tìm: 20 phút, bạn tốn 20 năng lượng, bạn phải không đói
  lure:{fav:30,other:90,mult:2}, // bát mồi: món khoái khẩu 30 phút, món khác 90 phút; giá gấp 2 giá món
  home:{full:60,hp:55,wa:60}, // về nhà: được ăn uống tạm, vui vừa phải
};
const strayOpen=()=>S.level>=STRAY.lv&&!!(S.tut&&S.tut.done);
const strayOf=uid=>S.stray&&S.stray[uid]||null;
const strayCat=c=>!!strayOf(c.uid);
// bé đi lạc, hoặc bé đang đi tìm bạn: đều không có mặt ở nhà
const strayAway=uid=>!!S.stray&&(!!S.stray[uid]||Object.values(S.stray).some(s=>s.hunt&&s.hunt.by===uid));
const strayList=()=>S.stray?S.cats.filter(c=>S.stray[c.uid]):[];
// tên món của bát mồi: món ăn (FOOD) hoặc rau vườn 'g:<cây>' (js/garden.js)
const lureName=f=>FOOD[f]?FOOD[f].n:(typeof GCROP!=='undefined'&&/^g:/.test(f)&&GCROP[f.slice(2)])?GCROP[f.slice(2)].n:'mồi';
// các lý do khổ của bé lúc này (rỗng = ổn)
function strayWhy(c){
  const L=[];
  if(c.full<=5)L.push('đói');
  if(c.wa!=null&&typeof WXC!=='undefined'&&c.wa<=WXC.water.low)L.push('khát');
  if(c.hp<25)L.push('buồn');
  if(c.he!=null&&c.he<30)L.push('yếu');
  return L;
}
const strayMood=c=>(c.ng||0)>=STRAY.warn; // đang giận dỗi
function strayTick(dt,sim){
  if(!S.stray)S.stray={};
  const t=now(),m=dt/60;
  // bé đi lạc trở về: bạn tìm thấy, bát mồi, hoặc đủ 2 ngày
  for(const k in S.stray){const s=S.stray[k],c=catBy(+k);
    if(!c){delete S.stray[k];continue}
    if(s.hunt&&!catBy(s.hunt.by))delete s.hunt;
    const how=s.hunt&&t>=s.hunt.end?'hunt':s.lure&&t>=s.lure.end?'lure':t>=s.at+STRAY.back?'self':'';
    if(how)strayHome(c,how);
  }
  if(!strayOpen())return;
  const home=S.cats.filter(c=>!onTrip(c.uid));
  home.forEach(c=>{
    const n=strayWhy(c).length,old=c.ng||0;
    c.ng=clamp(old+(n>=2?(n-1)*m*(sim?STRAY.away:1):n?0:-STRAY.calm*m),0,STRAY.leave);
    if(!c.ng)delete c.ng;
    if(old<STRAY.warn&&c.ng>=STRAY.warn&&!sim)notify('đang giận dỗi vì '+strayWhy(c).join(', ')+'. Cho ăn, đổ nước, vuốt ve ngay, không thì bé sẽ bỏ nhà đi!',{icon:'😾',title:c.name,key:'sulk'+c.uid,mtitle:'Giận dỗi'});
  });
  // bỏ đi: luôn giữ ít nhất một bé ở nhà; mỗi lần chỉ một bé
  const left=S.cats.filter(c=>!strayCat(c)).length,go=home.filter(c=>(c.ng||0)>=STRAY.leave).sort((a,b)=>b.ng-a.ng)[0];
  if(go&&left>1)strayLeave(go);
}
function strayLeave(c){
  const why=strayWhy(c);
  if(c.bed!=null){delete c.bed;delete c.bk;delete c.bm}
  S.stray[c.uid]={at:now(),why:why.length?why:['buồn'],room:c.room,seen:TOFF?0:1};
  c.ng=0;c.strayN=(c.strayN||0)+1;
  if(typeof wxDirty==='function')wxDirty();
  notify('đã bỏ nhà đi vì '+S.stray[c.uid].why.join(', ')+'. Bé vẫn an toàn: nhờ một bé khác đi tìm hoặc đặt bát mồi để bé về.',{icon:'🎒',title:c.name,key:'stray'+c.uid,mtitle:'Bỏ nhà đi'});
  save();
}
function strayHome(c,how){
  const s=S.stray[c.uid];delete S.stray[c.uid];
  const H=STRAY.home;c.full=Math.max(c.full,H.full);c.hp=Math.max(c.hp,H.hp);if(c.wa!=null)c.wa=Math.max(c.wa,H.wa);c.ng=0;delete c.ng;
  if(!S.rooms[c.room])c.room=freeRoom();
  const by=s&&s.hunt&&catBy(s.hunt.by);
  const msg=how==='hunt'&&by?by.name+' đã tìm thấy '+c.name+' và dẫn bé về nhà.':how==='lure'?c.name+' ngửi thấy bát '+lureName(s.lure.food).toLowerCase()+' và đã tự về nhà.':c.name+' đã tự tìm đường về nhà sau chuyến lang thang.';
  S.strayBack=S.strayBack||[];S.strayBack.push({uid:c.uid,msg,t:now(),seen:TOFF?0:1}); // về trong lúc vắng (seen 0): báo khi tải game (js/stray-ui.js)if(S.strayBack.length>5)S.strayBack.shift();
  notify(msg+' Nhớ cho bé ăn uống đầy đủ nhé.',{icon:'🏠',title:'Bé đã về nhà',key:'home'+c.uid});
  if(typeof wxDirty==='function')wxDirty();
  save();
}
// nhờ bé uid2 đi tìm bé uid: trả lý do không được, hoặc '' nếu đã đi
function strayHunt(uid,uid2){
  const s=strayOf(uid),h=catBy(uid2);if(!s)return 'Bé không đi lạc.';if(s.hunt)return 'Đang có bé đi tìm rồi.';
  if(!h||strayCat(h)||onTrip(uid2))return 'Bé này đang không ở nhà.';
  if(h.full<STRAY.hunt.full)return h.name+' đang đói, cho bé ăn trước đã.';
  if(h.en<STRAY.hunt.en)return h.name+' không đủ sức (cần '+STRAY.hunt.en+'⚡).';
  h.en-=STRAY.hunt.en;if(h.bed!=null){delete h.bed;delete h.bk;delete h.bm}
  s.hunt={by:uid2,end:now()+STRAY.hunt.min*60000};save();return '';
}
// đặt bát mồi: trả {err} hoặc {cost, min}
function strayLure(uid,food){
  const s=strayOf(uid),c=catBy(uid),f=FOOD[food];if(!s||!c||!f)return {err:'Không đặt được.'};
  if(s.lure)return {err:'Đã đặt bát mồi rồi.'};
  const cost=f.price*STRAY.lure.mult;if(S.coins<cost)return {err:'Không đủ xu (cần '+cost+').'};
  const min=favs(c).includes(food)?STRAY.lure.fav:STRAY.lure.other;
  S.coins-=cost;s.lure={food,end:now()+min*60000};save();return {cost,min};
}
