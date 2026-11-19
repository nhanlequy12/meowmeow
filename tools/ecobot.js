#!/usr/bin/env node
/* Bot đo nhịp kiếm xu (kế hoạch mục 5, 2026-11-11). Chạy bằng đúng mã của game (js/data.js, js/game.js, js/meal.js, js/quest.js, js/achieve.js, js/wish.js), không cần trình duyệt.

   node tools/ecobot.js [--h=240] [--runs=3] [--new=1] [--watch=.3] [--day=4] [--catch=.85] [--wish=.75] [--k1=4] [--ks=.15] [--k0=1.5] [--f0=1.5] [--json]

   Cách chơi của bot (giống bot ở mục 18 của CLAUDE.md): ghé 10 phút một lần, nhận viễn chinh, cho mọi phòng ăn hạt khô, vuốt mọi bé,
   gửi viễn chinh xu mỗi phút cao nhất, mua bát cho đủ suất, quay gacha khi còn chỗ (dùng vé trước), mua phòng kế tiếp khi nhà gần đầy,
   còn dư thì mua mỗi món nội thất một cái (rẻ trước).
   --new=1 thêm các nguồn xu có từ mục 19, 20, 24:
     nhiệm vụ trong giờ và trong ngày (tiến độ do chính việc bot làm, nhận ngay khi xong; nhiệm vụ "mua 1 món" thì mua món rẻ nhất),
     điểm danh mỗi ngày, thành tựu, khách lạ, ước muốn.
   --watch  phần thời gian người chơi để tab Phòng mở (khách lạ và ước muốn chỉ xuất hiện lúc đó). 0,3 = 3 phút mỗi lần ghé; 1 = nhìn suốt.
   --day    số giờ chơi mỗi ngày (cứ bấy nhiêu giờ chơi thì tính là sang ngày mới: nhiệm vụ ngày đổi, được điểm danh).
   --catch  tỉ lệ bắt kịp khách lạ; --wish tỉ lệ làm kịp ước muốn.
   --k1, --ks, --k0, --f0  thử hệ số giá khác (ROOM_K1, FURN_KS, ROOM_K0, FURN_K0) mà không sửa data.js.
   Cho ăn theo luật bát ăn mới (mục 36 của CLAUDE.md, js/meal.js): feedRoom mua đúng số suất gợi ý vào kho rồi chia đều vào các bát;
   mèo được giao bát, đi tới, ăn xong mới cảm ơn. Bot tua bằng tick(…, true) nên mèo tới và ăn xong ngay trong lần tua, xu cảm ơn
   cộng trong lúc tua (đếm vào mục "cảm ơn bữa ăn"). Không có js/med.js nên nước uống không chạy (như trước).
   --old=1  giả lập luật cho ăn cũ (trước 2026-11-12) để so sánh: mỗi phòng 10 phút đổ một lần, trả tiền đúng số suất,
            mọi bé ở nhà ăn ngay một suất và cảm ơn ngay (dùng chung mealGain nên cùng công thức no và xu).
   --full=1 (mặc định, 2026-11-13) nạp thêm luật thời tiết, điện, nước uống, bệnh tật, bé bỏ nhà đi (wx-data, pw-data, med-data, wx.js, pw.js, med.js, stray.js)
     và bot chơi như một người chơi chăm mà tiết kiệm:
       nước: mỗi lần ghé mua Nước lọc (rẻ nhất) đúng số chai gợi ý rồi rót vào bát nước của mọi phòng;
       khí hậu: phòng có mèo mà lạnh hơn ngưỡng lạnh thì mua thêm máy sưởi chạy pin (Máy sưởi mini, không thì Máy sưởi tích điện), nóng hơn ngưỡng nóng
         thì mua quạt chạy pin (Quạt mini, không thì Quạt tích điện), tối đa 3 máy mỗi loại mỗi phòng; phòng có máy chạy pin thì mua một ổ điện;
         bật tắt máy theo nhiệt độ phòng (sưởi tắt khi từ 24°C, bật lại dưới 19°C; quạt tắt khi từ 24°C, bật lại trên 27°C); pin dưới 35% thì cắm sạc (trả phí sạc);
       bệnh: Trầy xước dùng Băng gạc; bệnh chữa bằng thuốc thì dùng Thuốc tốt (120 xu, 50%); ca chỉ bệnh viện chữa, chấn thương, hay thuốc đã hỏng 2 lần thì nhập viện;
       không mang vật phẩm sinh tồn khi đi viễn chinh, không trồng vườn.
     Ở chế độ này mỗi lần ghé tua 10 bước 1 phút như lúc đang mở game (không phải chế độ bù vắng mặt), nên bệnh và thời tiết chạy đủ.
     --full=0: như bot cũ (chỉ data.js, game.js, meal.js; tua theo chế độ bù vắng mặt), để so với số đo cũ.
   --b=1 (mặc định, 2026-11-14, cần --full=1) nạp thêm các tính năng đợt B (CLAUDE.md mục 42–49) có ảnh hưởng tới xu:
       độ thân thiết (js/bond.js: thêm xu viễn chinh, vuốt ve, độ vui); --merge=1 thì mỗi lần ghé kết thân mọi bé trùng loài vào bé nhiều sao nhất
         (chỗ trống mới lại được lấp bằng gacha như thường);
       cuộc thi hằng ngày (js/contest.js): đầu mỗi ngày chơi gửi đội ctBest, cuối ngày nhận thưởng; ngày thi tính theo ngày chơi của bot;
       sự kiện (js/event.js): mỗi ngày chơi của bot ứng với một ngày lịch cách nhau --evstep ngày (mặc định 6, nên 60 ngày chơi đi hết một năm và
         tỉ lệ ngày có sự kiện đúng như lịch thật); nhận quà, nhiệm vụ, đổi vé trước, rồi món bộ mùa chưa có; tiền còn lại tự quy đổi khi hết đợt;
       nâng cấp phòng (js/roomup.js): khi không để dành mua phòng thì nâng cấp rẻ nhất, tối đa 2 cấp mỗi lần ghé, chừa 200 xu;
       --fr=N số nhà bạn bè ghé mỗi ngày chơi (chỉ khi chơi qua server.py; mặc định 0): khách nhận 15 + 5 × cấp xu (tối đa 105),
         chủ nhà nhận 10 + 3 × cấp mỗi lượt khách (tối đa 8), 5 tem đổi 1 vé + 50 xu (bot giả định có đúng N nhà ghé lại mình).
     Không mô phỏng: ảnh và sticker (thưởng một lần, tổng tối đa 640 xu + 6 vé), mèo ghé nhận nuôi, phụ kiện (chỉ tiêu xu, trang trí), chơi với bé (không cho xu).
   Không mô phỏng: ghép đôi (tốn xu chứ không sinh xu), thời gian vắng mặt giữa các ngày, món ăn có buff. */
const fs=require('fs'),path=require('path'),repo=path.join(__dirname,'..');
const A={h:240,runs:3,new:1,full:1,b:1,merge:1,fr:0,evstep:6,watch:.3,day:4,catch:.85,wish:.75};
process.argv.slice(2).forEach(a=>{const m=/^--(\w+)(?:=(.*))?$/.exec(a);if(m)A[m[1]]=m[2]==null?1:isNaN(+m[2])?m[2]:+m[2]});
const CYC=Math.round(A.h*6),NEW=!!A.new,FULL=!!A.full,B=FULL&&!!A.b;
globalThis.localStorage={getItem(){return null},setItem(){}};
globalThis.setTimeout=()=>0;globalThis.setInterval=()=>0;globalThis.clearTimeout=()=>{};   // hẹn giờ của giao diện không chạy; bot tự gọi các bước cần thiết
globalThis.BOT={min:0,dayH:A.day,dis:{}};
const rd=f=>fs.readFileSync(path.join(repo,'js',f),'utf8');
const rep=(s,a,b)=>{if(s.split(a).length!==2)throw new Error('ecobot: mã game đã đổi, không còn đúng một chỗ khớp: '+a.slice(0,70));return s.replace(a,b)};
let data=rd('data.js');
{const re=/const ROOM_K0=([\d.]+),ROOM_K1=([\d.]+),FURN_K0=([\d.]+),FURN_KS=([\d.]+),BOWL_K=([\d.]+);/,m=re.exec(data);if(!m)throw new Error('ecobot: không thấy dòng hệ số giá trong data.js');
  A.k0=A.k0==null?+m[1]:A.k0;A.k1=A.k1==null?+m[2]:A.k1;A.f0=A.f0==null?+m[3]:A.f0;A.ks=A.ks==null?+m[4]:A.ks;
  data=data.replace(re,'const ROOM_K0='+A.k0+',ROOM_K1='+A.k1+',FURN_K0='+A.f0+',FURN_KS='+A.ks+',BOWL_K='+m[5]+';')}
// đợt B: sự kiện theo ngày chơi của bot (BOT.evT), cuộc thi theo ngày chơi của bot, sự kiện vẫn tính tiền khi đang tua (TOFF của bot luôn khác 0)
function bsrc(){
  let ev=rep(rd('event.js'),"const evNow=()=>EVO?EVO.t+(Date.now()-EVO.at):now();","const evNow=()=>BOT.evT;");
  ev=rep(ev,"if(TOFF||!evOpen())return;","if(!evOpen())return;");
  let ct=rep(rd('contest.js'),"const ctDay=t=>{const d=new Date(t==null?now():t);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};","const ctDay=t=>'2026-1-'+(1+Math.floor(BOT.min/(BOT.dayH*60)));");
  ct=rep(ct,"const ctClosed=()=>{const c=ctS();return now()>=ctCloseAt(c.d)||!!(c.ov&&c.ov.d===c.d&&c.ov.cl)};","const ctClosed=()=>BOT.min%(BOT.dayH*60)>=BOT.dayH*60-10;");
  return [rd('garden.js'),rd('bond.js'),ev,rd('roomup.js'),ct,rd('compat.js')];
}
let src=FULL?[data,rd('wx-data.js'),rd('pw-data.js'),rd('med-data.js'),...(B?[rd('garden-data.js'),rd('event-data.js'),rd('compat-data.js')]:[]),rd('game.js'),rd('wx.js'),rd('pw.js'),rd('med.js'),rd('meal.js'),rd('stray.js'),...(B?bsrc():[])].join('\n;')+'\n;save=()=>{};\n'
  :data+'\n'+rd('game.js')+'\n;'+rd('meal.js')+'\n;save=()=>{};\n';
// đếm từng loại bệnh, chấn thương phát sinh (bọc medAdd của js/med.js)
if(FULL)src+=`;{const _ma=medAdd;medAdd=function(c,k,q){const e=_ma(c,k,q);if(e)BOT.dis[k]=(BOT.dis[k]||0)+1;return e}}
`;
if(NEW){
  // những thứ của ui.js mà quest.js, achieve.js, wish.js đụng tới
  src+=`let renderTop=()=>{},critStep=()=>{},critDraw=()=>{},critHit=()=>false,tab='home',cur='living',ents=[],edit=false;
const toast=()=>{},render=()=>{},renderPanel=()=>{},modal=()=>{},rp=()=>{},ch=p=>Math.random()<p,emo=x=>x,$=()=>({style:{},classList:{contains:()=>false},appendChild(){}});
const document={hidden:false,createElement:()=>({setAttribute(){},style:{}})};\n`;
  let q=rd('quest.js');
  // "ngày" và "giờ" theo đồng hồ của bot: cứ BOT.dayH giờ chơi là một ngày
  q=rep(q,"const qDate=()=>new Date(now()),qDay=()=>{const d=qDate();return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()},qHour=()=>qDay()+'-'+qDate().getHours();",
    "const qDate=()=>new Date(now()),qDay=()=>'d'+Math.floor(BOT.min/(BOT.dayH*60)),qHour=()=>'h'+Math.floor(BOT.min/60);");
  q=rep(q,"const ciYest=()=>{const d=qDate();d.setDate(d.getDate()-1);return d.getFullYear()+'-'+(d.getMonth()+1)+'-'+d.getDate()};","const ciYest=()=>'d'+(Math.floor(BOT.min/(BOT.dayH*60))-1);");
  src+=q+'\n'+rd('achieve.js')+'\n'+rd('wish.js')+`
;globalThis.N={qSync,qClaim:(w,i)=>qClaim(w,i),ciClaim,ciReady,achCheck,get q(){return S.q},
  catchOne(){const tot=Object.values(CRIT).reduce((a,c)=>a+c.wt,0);let r=Math.random()*tot,kind='mouse';for(const k in CRIT){r-=CRIT[k].wt;if(r<0){kind=k;break}}crits=[{id:1,kind,x:0,y:0}];return critHit(0,0)},
  wishOne(c){cur=c.room;wish={uid:c.uid,rid:c.room,k:'pet',end:now()+1e9};wishDone()}};\n`;
}
if(B)src+=';evHook();\n';
src+=`;globalThis.G={get S(){return S},fresh,tick,feedRoom:(r,f)=>feedRoom(r,f),petCat:c=>petCat(c),bowlsIn,bowlCap,homeCats,catsIn,ownedRooms,totalCap,gachaRoll,ROOMS,ROOM,FURNS,FURN,DESTS,
  get AWAY(){return AWAY},mealGain,mPrice,`+(FULL?`
  wxOpen,roomClimate,wxDirty,WXC,devOk,medOpen,ills,DIS,MED,medCan,medUse,buyMed,hospPlan,hospAdmit,inHosp,mSuggest,mealBuy,mealPour,mealPlan,invN,
  pwCur,pwCap,pwStartCharge,pwOutletWhy,pwWet,strayList,happyTarget,`:'')+(B?`
  bondMerge,bondLv,bondPts,evSync,evGiftReady,evGift,evClaim,evShop,evBuy,evBought,evSt,evOpen,ctOpen,ctSync,ctBest,ctEnter,ctClaim,ctS,ctClosed,rupOpen,rupLv,rupPrice,rupBuy,RUP,`:'')+`now:()=>now(),feedAct:()=>{addXp(5);onAct('feed',1)},tripInfo,startTrip,claimTrip,buyRoom,buyItem,locked,onTrip,newCat,SP,markSeen,rehome,setOff(v){TOFF=v},setNotify(f){notify=f}};`;
(0,eval)(src);
const G=globalThis.G,N=globalThis.N;G.setNotify(()=>{});
const CRIT_GAP=115;                                   // giây giữa hai vị khách khi đang nhìn tab Phòng: 70–150 giây chờ, cộng lúc khách còn trên màn hình
const WISH_GAP=225+A.wish*45+(1-A.wish)*240;          // giây cho một vòng ước muốn: 150–300 giây chờ, cộng lúc làm (hoặc lúc chờ hết giờ nếu không kịp)
const rndN=x=>Math.floor(x+Math.random());            // làm tròn ngẫu nhiên để số lần trung bình đúng bằng x
const FALL=G.FURNS.filter(f=>!f.bowl&&f.cat!=='event'); // món độc quyền của sự kiện chỉ đổi bằng tiền sự kiện

function run(){
  G.fresh();const S=G.S;let off=0,cyc=0;globalThis.BOT.dis={};
  // trạng thái ngay sau hướng dẫn tân thủ: bé khởi đầu 1★ ở Phòng khách, quà 300 xu và 3 vé
  {const c=G.newCat(G.SP.muop,1);c.room='living';S.cats.push(c);G.markSeen(c);S.tut={done:1,old:1,hints:{all:1},got:{}};S.coins+=300;S.tickets+=3}
  const inc={trip:0,feed:0,pet:0,quest:0,daily:0,checkin:0,crit:0,wish:0,ach:0,contest:0,event:0,fr:0,rel:0},tix={quest:0,daily:0,checkin:0,crit:0,contest:0,event:0,fr:0},spent={gacha:0,room:0,furn:0,water:0,dev:0,power:0,med:0,hosp:0,rup:0};
  const bx={merge:0,medal:{g:0,s:0,b:0,k:0},ctDays:0,evFurn:0,evDays:0,rupAt:null,stamps:0};
  const EV0=Date.UTC(2026,0,1)-7*3600000;
  const ev={sick:0,hosp:0,stray:0,hpSum:0,hpN:0,cold:0,hot:0,roomN:0};
  const pay=(k,f)=>{const c0=S.coins,r=f();spent[k]+=c0-S.coins;return r};
  const its=rid=>S.items.filter(i=>i.room===rid);
  const has=(rid,f)=>its(rid).filter(i=>!i.broken&&G.FURN[i.fid].wx&&G.FURN[i.fid].wx[f]).length;
  // nước: mua Nước lọc đúng số chai gợi ý còn thiếu rồi rót
  function water(){G.ownedRooms().forEach(r=>{if(!G.homeCats(r.id).length)return;const n=G.mSuggest('w',r.id);if(!n)return;
    const need=n-G.invN('w_plain');if(need>0&&pay('water',()=>G.mealBuy('w','w_plain',need)).err)return;
    const P=G.mealPlan('w',r.id,n,'even');if(P.plan.length)G.mealPour('w',r.id,'w_plain',P.plan)})}
  // khí hậu: máy sưởi, quạt chạy pin; ổ điện; bật tắt; sạc
  function climate(){
    if(!G.wxOpen())return;
    G.ownedRooms().forEach(r=>{const rid=r.id;if(!G.homeCats(rid).length)return;
      let T=G.roomClimate(rid).T;ev.roomN++;if(T<G.WXC.coldAt)ev.cold++;if(T>G.WXC.hotAt)ev.hot++;
      const buy=L=>{const f=L.map(id=>G.FURN[id]).find(f=>f&&!G.locked(f)&&G.devOk(f,rid)&&S.coins>=f.price+50);if(!f)return false;
        const it=pay('dev',()=>G.buyItem(f.id,rid,60+(S.nid*29)%360));if(it){G.wxDirty();return true}return false};
      if(T<G.WXC.coldAt&&has(rid,'heat')<3)buy(['heatmini','bheater']);
      if(T>G.WXC.hotAt&&has(rid,'cool')<3)buy(['fanmini','bfan']);
      const ele=its(rid).filter(i=>G.FURN[i.fid].pw&&!i.broken);if(!ele.length)return;
      let outs=its(rid).filter(i=>G.FURN[i.fid].outlet&&!i.broken);
      if(!outs.length){const o=pay('dev',()=>G.buyItem(G.pwWet(rid)?'outwet':'out2',rid,40));if(o)outs=[o]}
      // bật tắt theo nhiệt độ phòng
      T=G.roomClimate(rid).T;
      ele.forEach(i=>{const w=G.FURN[i.fid].wx||{};if(w.heat&&!w.cool){if(T>=24)i.off=true;else if(T<19)i.off=false}else if(w.cool&&!w.heat){if(T<=24)i.off=true;else if(T>27)i.off=false}});
      G.wxDirty();
      // sạc máy sắp hết pin
      ele.forEach(i=>{if(i.charge||G.pwCur(i)/G.pwCap(i)>=.35)return;const o=outs.find(o=>!G.pwOutletWhy(o,i));if(o)pay('power',()=>G.pwStartCharge(i.iid,o.iid))});
    });
  }
  // bệnh: băng gạc cho trầy xước, Thuốc tốt cho bệnh chữa được bằng thuốc, còn lại nhập viện
  function health(){
    S.cats.forEach(c=>{ev.hpSum+=c.hp;ev.hpN++});
    if(!G.medOpen())return;
    S.cats.forEach(c=>{if(G.inHosp(c.uid)||G.onTrip(c.uid))return;
      for(const e of G.ills(c).slice()){
        const D=G.DIS[e.k];
        // bệnh nhẹ tự khỏi (mức 1, có thời gian tự khỏi) thì để bé tự khỏi, không tốn xu; bong gân thì nẹp rồi chờ tự khỏi
        if(D.sev<=1&&D.self>0&&!D.inj)continue;
        if(e.k==='sprain'){if(!e.sp){if(!G.invN('splint')&&pay('med',()=>G.buyMed('splint',1)).err)continue;G.medUse(c.uid,e.eid,'splint')}continue}
        const tool=Object.values(G.MED).find(m=>m.kind==='tool'&&m.cure&&!G.medCan(c,e,m));
        const m=tool||(!G.medCan(c,e,G.MED.t_good)?G.MED.t_good:null);
        if(m){if(!G.invN(m.id)&&pay('med',()=>G.buyMed(m.id,1)).err)continue;G.medUse(c.uid,e.eid,m.id);continue}
        const P=G.hospPlan(c.uid);if(!P.err){pay('hosp',()=>G.hospAdmit(c.uid));ev.hosp++}break}});
  }
  const lvAt={},roomAt=[],hist=[];let feedCost=0,meals=0;let furnAt=null,own=new Set(S.items.map(i=>i.fid)),rr=0;
  const earn=(k,f)=>{const c0=S.coins,t0=S.tickets,r=f();inc[k]+=S.coins-c0;if(k in tix)tix[k]+=S.tickets-t0;return r};
  const buyF=f=>{const rs=G.ownedRooms(),c0=S.coins,it=G.buyItem(f.id,rs[rr++%rs.length].id,100+(rr*37)%280);if(it){spent.furn+=c0-S.coins;own.add(f.id)}return it};
  for(cyc=0;cyc<CYC;cyc++){
    globalThis.BOT.min=cyc*10;const T=Date.now()+off;
    const bday=Math.floor(cyc*10/(A.day*60)),bfirst=cyc%(A.day*6)===0;
    if(B){globalThis.BOT.evT=EV0+((bday*A.evstep)%365)*864e5+(8*60+cyc*10%(A.day*60))*60000;earn('event',()=>G.evSync())}
    if(NEW){earn('quest',()=>N.qSync());if(N.ciReady())earn('checkin',()=>N.ciClaim())}
    // 1) nhận viễn chinh
    S.trips.forEach((p,i)=>{if(p&&T>=p.end)earn('trip',()=>G.claimTrip(i))});
    // 2) cho mọi phòng ăn hạt khô
    //    (luật mới: không còn chờ 10 phút giữa hai lần đổ; feedRoom tự mua số suất gợi ý còn thiếu, không bé nào cần thì trả null)
    if(A.old)G.ownedRooms().forEach(r=>{const bs=G.bowlsIn(r.id).filter(b=>!b.broken),cs=G.homeCats(r.id).sort((a,b)=>a.full-b.full),st=S.rooms[r.id];
      if(!bs.length||!cs.length||G.now()<(st.oldAt||0))return;const n=Math.min(cs.length,G.bowlCap(r.id)),cost=G.mPrice('f','kibble',n);if(S.coins<cost)return;
      st.oldAt=G.now()+600000;S.coins-=cost;feedCost+=cost;const c0=S.coins,a0=G.AWAY.n;cs.slice(0,n).forEach(c=>G.mealGain(c,bs[0],'f','kibble',1));G.feedAct();inc.feed+=S.coins-c0-cost;meals+=n});
    else G.ownedRooms().forEach(r=>{if(G.bowlsIn(r.id).some(b=>!b.broken)&&G.homeCats(r.id).length){const c0=S.coins;const x=earn('feed',()=>G.feedRoom(r.id,'kibble'));if(x)feedCost+=c0-S.coins}});
    // 3) vuốt mỗi bé ở nhà một lần
    S.cats.forEach(c=>{if(!G.onTrip(c.uid)&&c.room!=='wait')earn('pet',()=>G.petCat(c))});
    // 3b) luật thời tiết, nước, bệnh (chỉ khi --full=1)
    if(FULL){water();climate();health()}
    // 4) gửi viễn chinh: mỗi ô chọn cặp (mèo, điểm đến) có xu mỗi phút cao nhất
    S.trips.forEach((p,i)=>{if(p)return;let best=null;
      S.cats.filter(c=>!G.onTrip(c.uid)&&c.room!=='wait'&&c.en>=60&&c.full>=20).sort((a,b)=>b.star-a.star).slice(0,6).forEach(c=>{G.DESTS.forEach(d=>{if(d.lvl>S.level)return;const inf=G.tripInfo(c,d.id);if(inf.why)return;const v=inf.est/(inf.dur/60000);if(!best||v>best.v)best={v,c,d}})});
      if(best)G.startTrip(i,best.c.uid,best.d.id)});
    // 5) nguồn xu mới
    if(NEW){
      for(let n=rndN(600*A.watch/CRIT_GAP*A.catch);n>0;n--)earn('crit',()=>N.catchOne());
      for(let n=rndN(600*A.watch/WISH_GAP*A.wish);n>0;n--){const L=S.cats.filter(c=>c.room!=='wait'&&!G.onTrip(c.uid));if(L.length)earn('wish',()=>N.wishOne(L[Math.floor(Math.random()*L.length)]))}
      const q=N.q;
      if(q.d.some(x=>x.k==='buy'&&x.p<x.n)){const f=FALL.filter(f=>!G.locked(f)).sort((a,b)=>a.price-b.price)[0];if(f&&S.coins>=f.price)buyF(f)}
      q.h.forEach((x,i)=>{if(x.p>=x.n&&!x.got)earn('quest',()=>N.qClaim('h',i))});
      q.d.forEach((x,i)=>{if(x.p>=x.n&&!x.got)earn('daily',()=>N.qClaim('d',i))});
      if(q.d.every(x=>x.got)&&!q.all)earn('daily',()=>N.qClaim('all'));
    }
    // 5b) đợt B: sự kiện, cuộc thi, bạn bè, kết thân mèo trùng
    if(B){
      if(G.evOpen()){const L=G.evSync();if(L.length&&bfirst)bx.evDays++;
        L.forEach(x=>{const k=x.key;if(G.evGiftReady(k))G.evGift(k);
          const st=G.evSt(k);(st.q||[]).forEach((q,i)=>{if(q.p>=q.n&&!q.got)G.evClaim(k,i)});if(st.q&&st.q.length&&st.q.every(q=>q.got)&&!st.qa)G.evClaim(k,'all');
          const sh=G.evShop(x.E.id);
          sh.filter(e=>e.k==='tk').forEach(e=>{while(G.evBought(k,e.sid)<e.lim&&G.evSt(k).c>=e.p)earn('event',()=>G.evBuy(k,e.sid))});
          sh.filter(e=>(e.k==='f'||e.k==='x')&&!own.has(e.fid)).forEach(e=>{if(G.evBought(k,e.sid)<e.lim&&G.evSt(k).c>=e.p){const r=G.evBuy(k,e.sid,G.ownedRooms()[0].id,200);if(r&&r.fid){own.add(r.fid);bx.evFurn+=G.FURN[r.fid].price}}})})}
      if(G.ctOpen()){earn('contest',()=>G.ctSync());const c=G.ctS();
        if(!G.ctClosed()&&!c.e){const L=G.ctBest(c.th);if(L.length&&!G.ctEnter(L.map(x=>x.uid)).err)bx.ctDays++}
        if(G.ctClosed()&&c.e&&!(c.r&&c.r.got)){const r=earn('contest',()=>G.ctClaim());if(r&&r.m)bx.medal[r.m]++}}
      if(A.fr&&S.level>=3&&bfirst){const L=Math.min(S.level,18);earn('fr',()=>{S.coins+=A.fr*Math.min(105,15+5*L)+Math.min(8,A.fr)*(10+3*L)});bx.stamps+=A.fr;
        while(bx.stamps>=5){bx.stamps-=5;earn('fr',()=>{S.coins+=50;S.tickets+=1})}}
      if(A.rel){const g={};S.cats.forEach(c=>{if(!G.onTrip(c.uid))(g[c.sp]=g[c.sp]||[]).push(c)});   // --rel=1 --merge=0: phóng sinh bé trùng thay cho kết thân (để so)
        Object.values(g).forEach(L=>{if(L.length<2)return;L.sort((a,b)=>b.star-a.star);L.slice(1).forEach(o=>{if(S.cats.length>1&&earn('rel',()=>G.rehome(o.uid)))bx.merge++})})}
      if(A.merge){const g={};S.cats.forEach(c=>{if(!G.onTrip(c.uid))(g[c.sp]=g[c.sp]||[]).push(c)});
        Object.values(g).forEach(L=>{if(L.length<2)return;L.sort((a,b)=>b.star-a.star||G.bondPts(b)-G.bondPts(a));L.slice(1).forEach(o=>{if(!G.bondMerge(L[0].uid,o.uid).err)bx.merge++})})}
    }
    // 6) tiêu xu: bát cho đủ suất, phòng mới khi nhà gần đầy, gacha khi còn chỗ, còn dư thì nội thất
    G.ownedRooms().forEach(r=>{const n=G.catsIn(r.id).length;let guard=0;
      while(G.bowlCap(r.id)<n&&guard++<4){const f=['bowlsteel','bowl'].map(id=>G.FURN[id]).find(f=>!G.locked(f)&&S.coins>=f.price);if(!f)break;const c0=S.coins;G.buyItem(f.id,r.id,100);spent.furn+=c0-S.coins}});
    const next=G.ROOMS.filter(r=>r.price&&!S.rooms[r.id]).sort((a,b)=>a.price-b.price)[0];
    const free=G.totalCap()-S.cats.filter(c=>c.room!=='wait').length,want=next&&!G.locked(next)&&free<=2;
    if(want&&S.coins>=next.price){const c0=S.coins;if(G.buyRoom(next.id)){spent.room+=c0-S.coins;roomAt.push({id:next.id,c:cyc,lv:S.level})}}
    for(let g=0;g<8&&S.cats.length<G.totalCap();g++){if(S.tickets>0)G.gachaRoll(true);else if(S.coins>=120){G.gachaRoll(false);spent.gacha+=100}else break}
    if(!(want&&!S.rooms[next.id])){for(let k=0;k<4;k++){const f=FALL.filter(f=>!own.has(f.id)&&!G.locked(f)).sort((a,b)=>a.price-b.price)[0];if(!f||S.coins<f.price+200||!buyF(f))break}
      // nâng cấp phòng (đợt B): cấp rẻ nhất trước, tối đa 2 cấp mỗi lần ghé
      if(B&&G.rupOpen())for(let k=0;k<2;k++){const o=G.ownedRooms().filter(r=>G.rupLv(r.id)<G.RUP.max).map(r=>({id:r.id,p:G.rupPrice(r.id,G.rupLv(r.id)+1)})).sort((a,b)=>a.p-b.p)[0];
        if(!o||S.coins<o.p+200)break;const c0=S.coins;if(G.rupBuy(o.id).err)break;spent.rup+=c0-S.coins}}
    if(B&&bx.rupAt==null&&G.ownedRooms().length>=17&&G.ownedRooms().every(r=>G.rupLv(r.id)>=G.RUP.max))bx.rupAt=cyc;
    if(furnAt==null&&FALL.every(f=>own.has(f.id)))furnAt=cyc;
    if(NEW)earn('ach',()=>N.achCheck());
    if(!lvAt[S.level])lvAt[S.level]=cyc;
    if(cyc%6===5)hist.push(Object.values(inc).reduce((a,b)=>a+b,0));
    if(furnAt!=null&&roomAt.length>=16&&S.level>=18&&cyc>furnAt+60&&(!B||bx.rupAt!=null))break;
    if(FULL){const M=S.med;if(M&&M.n!=null)ev.sick=M.n-1;ev.stray=S.cats.reduce((a,c)=>a+(c.strayN||0),0)}
    // 7) trôi 10 phút
    //    mèo đi tới bát và ăn trong lúc tua: xu cảm ơn đến lúc này, tính vào "cảm ơn bữa ăn"
    if(FULL)for(let k=0;k<10;k++){off+=60000;G.setOff(off);const a0=G.AWAY.n;earn('feed',()=>G.tick(60,false));meals+=G.AWAY.n-a0}
    else for(let k=0;k<2;k++){off+=300000;G.setOff(off);const a0=G.AWAY.n;earn('feed',()=>G.tick(300,true));meals+=G.AWAY.n-a0}
  }
  const tot=Object.values(inc).reduce((a,b)=>a+b,0),hrs=hist.length,last=hrs>10?(hist[hrs-1]-hist[hrs-11])/10:0;
  const h6=Math.min(cyc,36); // 6 giờ đầu: đo riêng để so với luật cũ (lúc này nhà còn ít mèo nên nhìn rõ nhịp cho ăn)
  const hearts=B?S.cats.map(c=>G.bondLv(c)):[];bx.h5=hearts.filter(h=>h>=5).length;bx.hAvg=hearts.length?hearts.reduce((a,b)=>a+b,0)/hearts.length:0;
  return {bx,dis:Object.assign({},globalThis.BOT.dis),lvAt,roomAt,furnAt,inc,tix,spent,ev,tot,hours:cyc/6,feedH:inc.feed/(cyc/6),feedCost,meals,
    perMeal:meals?inc.feed/meals:0,level:S.level,cats:S.cats.length,rooms:G.ownedRooms().length,perHour:Math.round(last)};
}
const rs=[];for(let i=0;i<A.runs;i++)rs.push(run());
const med=a=>{a=a.filter(x=>x!=null).sort((x,y)=>x-y);return a.length>=Math.ceil(rs.length/2)?a[Math.floor(a.length/2)]:null},hh=c=>c==null?null:Math.round(c/6*10)/10;
const roomH=k=>hh(med(rs.map(r=>r.roomAt[k]&&r.roomAt[k].c)));
const out={args:A,level:{},room:{},furnAll:hh(med(rs.map(r=>r.furnAt))),perHourEnd:med(rs.map(r=>r.perHour)),inc:{},tix:{},
  feedH:Math.round(med(rs.map(r=>r.feedH))),perMeal:Math.round(med(rs.map(r=>r.perMeal))*100)/100,mealsH:Math.round(med(rs.map(r=>r.meals/r.hours)))};
[5,9,13,18].forEach(l=>out.level[l]=hh(med(rs.map(r=>r.lvAt[l]))));
[[4,'Phòng thứ 5 (Phòng chơi)'],[8,'Phòng thứ 9 (Thư viện)'],[15,'Phòng hoàng gia']].forEach(([k,n])=>out.room[n]=roomH(k));
out.rupAll=hh(med(rs.map(r=>r.bx.rupAt)));
const T=rs.reduce((a,r)=>a+r.tot,0);Object.keys(rs[0].inc).forEach(k=>out.inc[k]=Math.round(rs.reduce((a,r)=>a+r.inc[k],0)/T*1000)/10);
Object.keys(rs[0].tix).forEach(k=>out.tix[k]=Math.round(rs.reduce((a,r)=>a+r.tix[k],0)/rs.length));
// chi tiêu cho luật mới: xu mỗi giờ chơi (trung bình các lượt) và phần trăm trên tổng xu kiếm được
out.cost={};['water','dev','power','med','hosp'].forEach(k=>{const v=rs.reduce((a,r)=>a+r.spent[k]/r.hours,0)/rs.length;out.cost[k]={h:Math.round(v),pct:Math.round(rs.reduce((a,r)=>a+r.spent[k],0)/T*1000)/10}});
out.ev={sickH:Math.round(rs.reduce((a,r)=>a+r.ev.sick/r.hours,0)/rs.length*100)/100,hospH:Math.round(rs.reduce((a,r)=>a+r.ev.hosp/r.hours,0)/rs.length*100)/100,
  stray:Math.round(rs.reduce((a,r)=>a+r.ev.stray,0)/rs.length*10)/10,hp:Math.round(rs.reduce((a,r)=>a+(r.ev.hpN?r.ev.hpSum/r.ev.hpN:0),0)/rs.length),
  cold:Math.round(rs.reduce((a,r)=>a+(r.ev.roomN?r.ev.cold/r.ev.roomN:0),0)/rs.length*100),hot:Math.round(rs.reduce((a,r)=>a+(r.ev.roomN?r.ev.hot/r.ev.roomN:0),0)/rs.length*100)};
if(A.json){console.log(JSON.stringify(out));process.exit(0)}
const f=v=>v==null?'chưa tới':String(v).replace('.',',')+' giờ';
console.log((A.old?'[LUẬT CHO ĂN CŨ, giả lập] ':'')+(FULL?'[ĐỦ LUẬT: thời tiết, điện, nước, bệnh] ':'[luật cũ, không thời tiết] ')+'Bot '+(NEW?'CÓ nguồn xu mới (nhìn tab Phòng '+Math.round(A.watch*100)+'% thời gian, '+A.day+' giờ chơi mỗi ngày)':'KHÔNG tính nguồn xu mới')+' · ROOM_K1='+A.k1+' FURN_KS='+A.ks+' · '+A.runs+' lượt, tối đa '+A.h+' giờ');
console.log('Cấp 5: '+f(out.level[5])+' · cấp 9: '+f(out.level[9])+' · cấp 13: '+f(out.level[13])+' · cấp 18: '+f(out.level[18]));
Object.entries(out.room).forEach(([n,v])=>console.log(n+': '+f(v)));
console.log('Đủ mọi món nội thất: '+f(out.furnAll));
console.log('Thu nhập cuối game: khoảng '+(out.perHourEnd||0).toLocaleString('vi-VN')+' xu mỗi giờ');
const NM={trip:'viễn chinh',feed:'cảm ơn bữa ăn (đã trừ tiền hạt)',pet:'vuốt ve',quest:'nhiệm vụ trong giờ',daily:'nhiệm vụ ngày',checkin:'điểm danh',crit:'khách lạ',wish:'ước muốn',ach:'thành tựu',contest:'cuộc thi',event:'sự kiện (quy đổi)',fr:'bạn bè',rel:'phóng sinh bé trùng'};
if(B){const av=k=>rs.reduce((a,r)=>a+k(r),0)/rs.length;
  console.log('[đợt B] Nâng cấp hết 17 phòng: '+f(out.rupAll)+' · tiền nâng cấp '+Math.round(av(r=>r.spent.rup/r.hours)).toLocaleString('vi-VN')+' xu/giờ · kết thân '+Math.round(av(r=>r.bx.merge))+' bé mỗi lượt · cuối lượt '+Math.round(av(r=>r.bx.h5))+' bé 5 tim, trung bình '+String(Math.round(av(r=>r.bx.hAvg)*10)/10).replace('.',',')+' tim');
  console.log('[đợt B] Cuộc thi '+Math.round(av(r=>r.bx.ctDays))+' ngày: Vàng '+Math.round(av(r=>r.bx.medal.g))+', Bạc '+Math.round(av(r=>r.bx.medal.s))+', Đồng '+Math.round(av(r=>r.bx.medal.b))+', Khuyến khích '+Math.round(av(r=>r.bx.medal.k))+
    ' · sự kiện '+Math.round(av(r=>r.bx.evDays))+' ngày chơi, đổi được món nội thất trị giá '+Math.round(av(r=>r.bx.evFurn)).toLocaleString('vi-VN')+' xu · vé thêm: cuộc thi '+out.tix.contest+', sự kiện '+out.tix.event+', bạn bè '+out.tix.fr)}
console.log('Cho ăn: lãi khoảng '+out.feedH.toLocaleString('vi-VN')+' xu mỗi giờ chơi, '+out.mealsH.toLocaleString('vi-VN')+' suất ăn có cảm ơn mỗi giờ, lãi '+String(out.perMeal).replace('.',',')+' xu mỗi suất (đã trừ tiền hạt)');
console.log('Tỉ trọng xu kiếm được: '+Object.entries(out.inc).filter(([k,v])=>v).map(([k,v])=>NM[k]+' '+String(v).replace('.',',')+'%').join(', '));
if(FULL){const C=out.cost,x=k=>C[k].h.toLocaleString('vi-VN')+' xu/giờ ('+String(C[k].pct).replace('.',',')+'%)';
  console.log('Chi cho luật mới (% so với tổng xu kiếm được): nước '+x('water')+', thiết bị và ổ điện '+x('dev')+', sạc điện '+x('power')+', thuốc '+x('med')+', bệnh viện '+x('hosp'));
  console.log('Mèo: '+String(out.ev.sickH).replace('.',',')+' lần bệnh mỗi giờ, '+String(out.ev.hospH).replace('.',',')+' lần nhập viện mỗi giờ, '+String(out.ev.stray).replace('.',',')+' lần bỏ nhà đi mỗi lượt chơi, độ vui trung bình '+out.ev.hp+
    '; phòng có mèo quá lạnh '+out.ev.cold+'% số lần ghé, quá nóng '+out.ev.hot+'%');
  const DS={};rs.forEach(r=>Object.entries(r.dis).forEach(([k,v])=>DS[k]=(DS[k]||0)+v/rs.length));
  console.log('Bệnh mỗi lượt chơi (trung bình): '+Object.entries(DS).sort((a,b)=>b[1]-a[1]).map(([k,v])=>k+' '+Math.round(v)).join(', '))}
if(NEW)console.log('Vé nhận thêm mỗi lượt chơi: nhiệm vụ trong giờ '+out.tix.quest+', nhiệm vụ ngày '+out.tix.daily+', điểm danh '+out.tix.checkin+', khách lạ '+out.tix.crit);
process.exit(0);
