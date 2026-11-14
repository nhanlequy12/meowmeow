"use strict";
/* ============ CUỘC THI MÈO HẰNG NGÀY (2026-11-14): cấu hình và luật ============
   Mỗi ngày một chủ đề (giống nhau với mọi người chơi: chọn bằng hạt giống theo ngày). Trước giờ chốt (CT.close giờ) người chơi
   gửi 1 hoặc 3 bé đang ở nhà. Điểm tính lúc gửi từ chỉ số và thuộc tính có sẵn (hàm thuần ctScore), gửi lại thì thay bài cũ.
   Sau giờ chốt: điểm nhân thêm may rủi nhỏ (±CT.luck, prng theo ngày và đội dự thi) rồi xếp hạng với CT.rivals đối thủ do máy tạo
   (cũng từ hạt giống theo ngày): hạng 1 Vàng, 2 Bạc, 3 Đồng, còn lại Khuyến khích. Bấm Nhận thưởng, hoặc sang ngày thì tự nhận.
   Không đụng DOM, chạy được trong Node (tools/contesttest.js). Giao diện: js/contest-ui.js. Nạp sau js/roomup.js, trước js/ui.js.

   Trạng thái S.ct = {d: ngày đang thi, th: chủ đề, e:{u:[uid], b: điểm lúc gửi, at, nm:[tên]}, r:{rank, m, sc, got} kết quả đã nhận,
     h:[lịch sử, mới nhất đầu, tối đa CT.keep], bd:{uid:{g,s,b}} huy chương của từng bé, n:{g,s,b,k} tổng số lần, ov:{d, th, cl} Admin ghi đè}.
   Bảng xếp hạng máy chủ (sau này): ctExport() trả điểm hôm nay của người chơi, xem cuối file. */
const CT={
  lv:6,          // mở từ cấp 6
  close:21,      // giờ chốt (giờ máy): trước giờ này nhận bài, sau giờ này có kết quả
  rivals:7,      // số đối thủ do máy tạo
  luck:.08,      // may rủi ±8% điểm lúc chấm
  keep:14,       // số ngày giữ trong lịch sử
  // thưởng theo hạng; L = cấp người chơi (tối đa 18). Nhỏ so với thu nhập: cấp 18 Vàng khoảng 350 xu + 1 vé mỗi ngày
  rew:{g:{c:L=>80+15*L,t:1,xp:20},s:{c:L=>50+10*L,t:0,xp:15},b:{c:L=>30+6*L,t:0,xp:10},k:{c:L=>15+3*L,t:0,xp:5}},
};
const CT_MEDAL={g:{ic:'🥇',n:'Vàng'},s:{ic:'🥈',n:'Bạc'},b:{ic:'🥉',n:'Đồng'},k:{ic:'🎗',n:'Khuyến khích'}};
FEATS.push({lv:CT.lv,id:'contest',ic:'🏅',n:'Cuộc thi mèo hằng ngày',d:'Mỗi ngày một chủ đề: chọn bé dự thi trước '+CT.close+' giờ, so tài với các nhà khác để nhận huy chương, xu và vé. Xem ở tab Thành tựu.'});

/* ---------- chủ đề ----------
   team: số bé dự thi; sc(c): điểm một bé (0..100); bonus(list): điểm cộng cho cả đội; rv:[thấp, cao] khoảng điểm đối thủ;
   tip: mẹo chọn bé (hiện trong bảng). Điểm đội = trung bình điểm từng bé + bonus, tối đa 100. */
const ctHe=c=>c.he!=null?c.he:100,ctWa=c=>c.wa!=null?c.wa:100,ctCf=c=>c.cf!=null?c.cf:70;
const ctCoat=c=>c.coat||(SP[c.sp]&&SP[c.sp].coats?SP[c.sp].coats[0]:'sp:'+c.sp);
const ctCoatN=k=>/^sp:/.test(k)?(SP[k.slice(3)]||{}).n||'Trang phục':(ALLCOAT[k]&&ALLCOAT[k].n)||k;
const ctAgeK=(c,a)=>a[ageStage(c)];
const CT_TH=[
  {id:'happy',ic:'😊',n:'Bé vui nhất',team:1,d:'Bé nào đang vui nhất nhà?',tip:'Độ vui là chính, sao cao được cộng thêm chút.',
    sc:c=>c.hp*.82+c.star*3,rv:[56,94]},
  {id:'fit',ic:'🏠',n:'Bé hợp phòng nhất',team:1,d:'Bé ở đúng căn phòng mình thích, có nhiều thuộc tính hợp phòng.',tip:'Bé có dấu ♥ Rất hợp với phòng đang ở, càng nhiều lý do hợp càng cao.',
    sc:c=>{const r=typeof CP!=='undefined'&&!(ROOM[c.room]||{}).wait?CP.room(c,c.room):{lv:0,why:[]};const n=r.why.filter(w=>w.s>0&&!w.amb).length;return 34+r.lv*12+n*9+c.hp*.15},rv:[36,74]},
  {id:'coat',ic:'🎨',n:'Đội ba bé cùng màu lông',team:3,d:'Ba bé cùng một màu lông là đẹp đội nhất.',tip:'Cả ba cùng màu lông +25 điểm, hai bé cùng màu +10. Bé vui, no được thêm điểm.',
    sc:c=>c.hp*.45+c.full*.25+c.star*4,bonus:L=>{const m={};L.forEach(c=>{const k=ctCoat(c);m[k]=(m[k]||0)+1});const x=Math.max(0,...Object.values(m));return x>=3?25:x===2?10:0},rv:[44,84]},
  {id:'elder',ic:'👴',n:'Cụ mèo khỏe nhất',team:1,d:'Mèo già mà vẫn khỏe mạnh, đầy năng lượng.',tip:'Mèo già được tính đủ điểm, trưởng thành ×0,85, mèo con ×0,65. Sức khỏe, năng lượng và tuổi (tới 60 ngày) đều được tính.',
    sc:c=>(ctHe(c)*.45+c.en*.3+Math.min(ageDays(c),60)*.4)*ctAgeK(c,[.65,.85,1]),rv:[40,81]},
  {id:'kitten',ic:'🍼',n:'Mèo con lanh lợi',team:1,d:'Mèo con nhanh nhẹn, vui vẻ, nhiều năng lượng.',tip:'Mèo con được tính đủ điểm, trưởng thành ×0,8, mèo già ×0,6. Bé có thuộc tính đi nhanh +8.',
    sc:c=>(c.en*.45+c.hp*.35+(tE(c,'speed')>0?8:0)+c.star*2)*ctAgeK(c,[1,.8,.6]),rv:[40,77]},
  {id:'talent',ic:'🎖',n:'Bé nhiều tài nhất',team:1,d:'Bé có nhiều thuộc tính tốt nhất.',tip:'Mỗi thuộc tính tốt hoặc độc quyền +11, thuộc tính xấu −6, mỗi sao +4.',
    sc:c=>{let g=0,b=0;c.traits.forEach(t=>{const k=(TRAITS[t]||{}).k;if(k==='b')b++;else if(k)g++});return 14+g*11-b*6+c.star*4+c.hp*.1},rv:[44,90]},
  {id:'room',ic:'🛋',n:'Đội ba bé cùng phòng',team:3,d:'Ba bạn cùng phòng vui vẻ, thoải mái nhất.',tip:'Cả ba ở cùng một phòng (không tính Phòng chờ) +20 điểm. Độ vui và độ thoải mái được tính.',
    sc:c=>c.hp*.55+ctCf(c)*.2+c.star*3,bonus:L=>L.length===3&&L.every(c=>c.room===L[0].room&&c.room!=='wait')?20:0,rv:[52,96]},
  {id:'care',ic:'🧡',n:'Bé được chăm kỹ nhất',team:1,d:'No, đủ nước, khỏe mạnh và thoải mái.',tip:'Độ no, nước, sức khỏe, độ thoải mái đều được tính. Cho ăn, cho uống trước khi gửi bài.',
    sc:c=>c.full*.3+ctWa(c)*.25+ctHe(c)*.3+ctCf(c)*.15,rv:[56,94]},
];
const CT_T=Object.fromEntries(CT_TH.map(t=>[t.id,t]));

/* ---------- ngày, hạt giống, chủ đề ---------- */
const ctDay=t=>{const d=new Date(t==null?now():t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};
const ctHash=s=>{let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0};
const ctSeed=d=>ctHash('meoxu-ct|'+d);
// chủ đề của một ngày: giống nhau với mọi người chơi; không trùng chủ đề "gốc" của hôm trước
function ctThemeOf(d){
  if(typeof S!=='undefined'&&S&&S.ct&&S.ct.ov&&S.ct.ov.d===d&&CT_T[S.ct.ov.th])return S.ct.ov.th;
  const raw=x=>ctSeed(x)%CT_TH.length,p=d.split('-').map(Number),y=new Date(p[0],p[1]-1,p[2]-1);
  let i=raw(d);if(i===raw(y.getFullYear()+'-'+(y.getMonth()+1)+'-'+y.getDate()))i=(i+1)%CT_TH.length;
  return CT_TH[i].id;
}
const ctOpen=()=>!!S&&S.level>=CT.lv&&!!(S.tut&&S.tut.done);
// giờ chốt của ngày đang xem; Admin "chốt ngay" ghi ov.cl
const ctCloseAt=d=>{const p=d.split('-').map(Number);return new Date(p[0],p[1]-1,p[2],CT.close).getTime()};
const ctClosed=()=>{const c=ctS();return now()>=ctCloseAt(c.d)||!!(c.ov&&c.ov.d===c.d&&c.ov.cl)};
function ctS(){if(!S.ct)S.ct={h:[],bd:{},n:{}};const c=S.ct;if(!c.h)c.h=[];if(!c.bd)c.bd={};if(!c.n)c.n={};if(!c.d){c.d=ctDay();c.th=ctThemeOf(c.d)}return c}

/* ---------- chấm điểm ---------- */
const r1=v=>Math.round(v*10)/10;
// điểm một bé theo chủ đề (0..100)
const ctCatSc=(th,c)=>r1(clamp(CT_T[th].sc(c),0,100));
// điểm cả đội: trung bình điểm từng bé (ô trống tính 0) + bonus, tối đa 100
function ctScore(th,L){
  const T=CT_T[th];if(!T||!L.length)return 0;
  const s=L.reduce((a,c)=>a+ctCatSc(th,c),0)/T.team+(T.bonus?T.bonus(L):0);
  return r1(clamp(s,0,100));
}
// bé có thể dự thi (đang ở nhà)
const ctPool=()=>S.cats.filter(c=>!onTrip(c.uid));
// đội tốt nhất (gợi ý chọn): thử nhóm theo màu lông / theo phòng và nhóm điểm cao nhất
function ctBest(th){
  const T=CT_T[th],P=ctPool().map(c=>({c,s:ctCatSc(th,c)})).sort((a,b)=>b.s-a.s);
  if(T.team===1)return P.length?[P[0].c]:[];
  const cand=[P.slice(0,3).map(x=>x.c)],grp={};
  P.forEach(x=>{const k=th==='coat'?ctCoat(x.c):th==='room'?x.c.room:'';(grp[k]=grp[k]||[]).push(x.c)});
  Object.values(grp).forEach(g=>{if(g.length>=2){const top=g.slice(0,3),rest=P.map(x=>x.c).filter(c=>!top.includes(c));cand.push(top.concat(rest).slice(0,3))}});
  return cand.sort((a,b)=>ctScore(th,b)-ctScore(th,a))[0]||[];
}
// may rủi của một đội hôm đó: hệ số 1 ± CT.luck (cố định theo ngày và đội: gửi lại cùng đội không đổi)
const ctLuck=(d,u)=>{const r=prng(ctSeed(d)^ctHash([...u].sort((a,b)=>a-b).join(',')))();return Math.round((1+(r*2-1)*CT.luck)*1000)/1000};
// đối thủ của một ngày: [{nm, sp, sc}] điểm giảm dần (đã gồm may rủi)
function ctRivals(d,th){
  const rng=prng(ctSeed(d)^0x5bd1e995),T=CT_T[th||ctThemeOf(d)],ids=Object.keys(SP).filter(k=>SP[k].star<=4),out=[];
  for(let i=0;i<CT.rivals;i++){
    const u=rng(),sc=T.rv[0]+(T.rv[1]-T.rv[0])*Math.pow(u,.85);
    out.push({nm:NAMES[Math.floor(rng()*NAMES.length)]+' nhà '+NAMES[Math.floor(rng()*NAMES.length)],sp:ids[Math.floor(rng()*ids.length)],sc:r1(sc)});
  }
  return out.sort((a,b)=>b.sc-a.sc);
}
// kết quả hôm d cho bài e: {sc (đã nhân may rủi), luck, rank, m (g/s/b/k), board:[{nm, sc, me}]}
function ctResult(d,th,e){
  if(!e)return null;
  const luck=ctLuck(d,e.u),sc=r1(clamp(e.b*luck,0,100)),R=ctRivals(d,th);
  const rank=1+R.filter(x=>x.sc>sc).length,m=rank===1?'g':rank===2?'s':rank===3?'b':'k';
  const board=R.map(x=>Object.assign({},x)).concat([{nm:'Nhà bạn',sc,me:1,u:e.u}]).sort((a,b)=>b.sc-a.sc||(b.me?1:0)-(a.me?1:0));
  return {sc,luck,rank,m,board};
}
const ctRew=m=>{const L=Math.min(S.level,MAX_LV),R=CT.rew[m];return {coins:Math.max(10,Math.round(R.c(L)/10)*10),tickets:R.t,xp:R.xp}};

/* ---------- hành động ---------- */
// gửi bài (thay bài cũ nếu có). Trả {sc} hoặc {err}
function ctEnter(uids){
  if(!ctOpen())return {err:'Cuộc thi mở ở cấp '+CT.lv+'.'};
  ctSync();const c=ctS(),T=CT_T[c.th];
  if(ctClosed())return {err:'Hôm nay đã chốt bài lúc '+CT.close+' giờ. Cuộc thi mới mở lúc 0 giờ.'};
  const L=[...new Set(uids)].map(catBy).filter(Boolean);
  if(L.length!==T.team)return {err:'Chủ đề này cần đúng '+T.team+' bé.'};
  if(L.some(x=>onTrip(x.uid)))return {err:'Chỉ gửi được bé đang ở nhà.'};
  const b=ctScore(c.th,L);
  c.e={u:L.map(x=>x.uid),nm:L.map(x=>x.name),b,at:now()};
  save();return {sc:b};
}
function ctWithdraw(){const c=ctS();if(ctClosed()||!c.e)return false;delete c.e;save();return true}
// nhận thưởng hôm nay (sau giờ chốt). Trả {m, rank, sc, coins, tickets} hoặc {err}
function ctClaim(auto){
  const c=ctS();
  if(!c.e)return {err:'Hôm nay bạn chưa gửi bé dự thi.'};
  if(c.r&&c.r.got)return {err:'Đã nhận thưởng hôm nay.'};
  if(!auto&&!ctClosed())return {err:'Chưa tới giờ chốt ('+CT.close+' giờ).'};
  const res=ctResult(c.d,c.th,c.e),w=ctRew(res.m);
  S.coins+=w.coins;S.tickets+=w.tickets;addXp(w.xp);
  c.n[res.m]=(c.n[res.m]||0)+1;
  if(res.m!=='k')c.e.u.forEach(u=>{const b=c.bd[u]=c.bd[u]||{};b[res.m]=(b[res.m]||0)+1});
  c.r={rank:res.rank,m:res.m,sc:res.sc,got:1,coins:w.coins,tickets:w.tickets};
  c.h.unshift({d:c.d,th:c.th,u:c.e.u,nm:c.e.nm,b:c.e.b,sc:res.sc,rank:res.rank,m:res.m,coins:w.coins,tickets:w.tickets});
  if(c.h.length>CT.keep)c.h.length=CT.keep;
  if(typeof onAct==='function')onAct('contest',1);
  save();return Object.assign({rank:res.rank,m:res.m,sc:res.sc},w);
}
// sang ngày mới: bài hôm trước chưa nhận thì tự nhận, rồi mở chủ đề mới. Trả kết quả tự nhận (hoặc null)
function ctSync(){
  if(!S)return null;const c=ctS(),d=ctDay();if(c.d===d)return null;
  let got=null;
  if(c.e&&!(c.r&&c.r.got))got=Object.assign({d:c.d,th:c.th},ctClaim(true));
  c.d=d;c.th=ctThemeOf(d);delete c.e;delete c.r;if(c.ov&&c.ov.d!==d)delete c.ov;
  // bé đã phóng sinh: bỏ huy chương
  for(const u in c.bd)if(!catBy(+u))delete c.bd[u];
  save();return got;
}
const ctBadges=uid=>{const c=S&&S.ct&&S.ct.bd&&S.ct.bd[uid];return c?['g','s','b'].filter(m=>c[m]).map(m=>({m,n:c[m]})):[]};

/* ---------- xuất điểm cho bảng xếp hạng (máy chủ, làm sau) ----------
   ctExport() trả điểm hôm nay của người chơi này, hoặc null nếu chưa gửi bài:
     {day, th, sc (điểm lúc gửi, chưa nhân may rủi), fin (điểm đã nhân may rủi; null khi chưa chốt), luck, uids, names, sp:[giống], at,
      closed, rank, m (hạng so với đối thủ máy, chỉ có sau giờ chốt)}
   Mọi người chơi cùng ngày có cùng chủ đề và cùng hạt giống, nên máy chủ so được trực tiếp fin (hoặc sc) giữa các người chơi.
   Máy chủ muốn kiểm lại: chạy ctScore(th, mèo trong bản lưu) với bản lưu lúc gửi; may rủi tính lại bằng ctLuck(day, uids). */
function ctExport(){
  if(!S||!S.ct||!S.ct.e)return null;const c=S.ct,cl=ctClosed(),r=cl?ctResult(c.d,c.th,c.e):null;
  return {day:c.d,th:c.th,sc:c.e.b,fin:r?r.sc:null,luck:r?r.luck:null,uids:c.e.u.slice(),names:c.e.nm.slice(),sp:c.e.u.map(u=>(catBy(u)||{}).sp||null),at:c.e.at,closed:cl,rank:r?r.rank:null,m:r?r.m:null};
}
