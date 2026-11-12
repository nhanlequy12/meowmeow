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
   Không mô phỏng: ghép đôi (tốn xu chứ không sinh xu), thời gian vắng mặt giữa các ngày, món ăn có buff. */
const fs=require('fs'),path=require('path'),repo=path.join(__dirname,'..');
const A={h:240,runs:3,new:1,watch:.3,day:4,catch:.85,wish:.75};
process.argv.slice(2).forEach(a=>{const m=/^--(\w+)(?:=(.*))?$/.exec(a);if(m)A[m[1]]=m[2]==null?1:isNaN(+m[2])?m[2]:+m[2]});
const CYC=Math.round(A.h*6),NEW=!!A.new;
globalThis.localStorage={getItem(){return null},setItem(){}};
globalThis.setTimeout=()=>0;globalThis.setInterval=()=>0;globalThis.clearTimeout=()=>{};   // hẹn giờ của giao diện không chạy; bot tự gọi các bước cần thiết
globalThis.BOT={min:0,dayH:A.day};
const rd=f=>fs.readFileSync(path.join(repo,'js',f),'utf8');
const rep=(s,a,b)=>{if(s.split(a).length!==2)throw new Error('ecobot: mã game đã đổi, không còn đúng một chỗ khớp: '+a.slice(0,70));return s.replace(a,b)};
let data=rd('data.js');
{const re=/const ROOM_K0=([\d.]+),ROOM_K1=([\d.]+),FURN_K0=([\d.]+),FURN_KS=([\d.]+),BOWL_K=([\d.]+);/,m=re.exec(data);if(!m)throw new Error('ecobot: không thấy dòng hệ số giá trong data.js');
  A.k0=A.k0==null?+m[1]:A.k0;A.k1=A.k1==null?+m[2]:A.k1;A.f0=A.f0==null?+m[3]:A.f0;A.ks=A.ks==null?+m[4]:A.ks;
  data=data.replace(re,'const ROOM_K0='+A.k0+',ROOM_K1='+A.k1+',FURN_K0='+A.f0+',FURN_KS='+A.ks+',BOWL_K='+m[5]+';')}
let src=data+'\n'+rd('game.js')+'\n;'+rd('meal.js')+'\n;save=()=>{};\n';
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
src+=`;globalThis.G={get S(){return S},fresh,tick,feedRoom:(r,f)=>feedRoom(r,f),petCat:c=>petCat(c),bowlsIn,bowlCap,homeCats,catsIn,ownedRooms,totalCap,gachaRoll,ROOMS,ROOM,FURNS,FURN,DESTS,
  get AWAY(){return AWAY},mealGain,mPrice,now:()=>now(),feedAct:()=>{addXp(5);onAct('feed',1)},tripInfo,startTrip,claimTrip,buyRoom,buyItem,locked,onTrip,newCat,SP,markSeen,setOff(v){TOFF=v},setNotify(f){notify=f}};`;
(0,eval)(src);
const G=globalThis.G,N=globalThis.N;G.setNotify(()=>{});
const CRIT_GAP=115;                                   // giây giữa hai vị khách khi đang nhìn tab Phòng: 70–150 giây chờ, cộng lúc khách còn trên màn hình
const WISH_GAP=225+A.wish*45+(1-A.wish)*240;          // giây cho một vòng ước muốn: 150–300 giây chờ, cộng lúc làm (hoặc lúc chờ hết giờ nếu không kịp)
const rndN=x=>Math.floor(x+Math.random());            // làm tròn ngẫu nhiên để số lần trung bình đúng bằng x
const FALL=G.FURNS.filter(f=>!f.bowl);

function run(){
  G.fresh();const S=G.S;let off=0,cyc=0;
  // trạng thái ngay sau hướng dẫn tân thủ: bé khởi đầu 1★ ở Phòng khách, quà 300 xu và 3 vé
  {const c=G.newCat(G.SP.muop,1);c.room='living';S.cats.push(c);G.markSeen(c);S.tut={done:1,old:1,hints:{all:1},got:{}};S.coins+=300;S.tickets+=3}
  const inc={trip:0,feed:0,pet:0,quest:0,daily:0,checkin:0,crit:0,wish:0,ach:0},tix={quest:0,daily:0,checkin:0,crit:0},spent={gacha:0,room:0,furn:0};
  const lvAt={},roomAt=[],hist=[];let feedCost=0,meals=0;let furnAt=null,own=new Set(S.items.map(i=>i.fid)),rr=0;
  const earn=(k,f)=>{const c0=S.coins,t0=S.tickets,r=f();inc[k]+=S.coins-c0;if(k in tix)tix[k]+=S.tickets-t0;return r};
  const buyF=f=>{const rs=G.ownedRooms(),c0=S.coins,it=G.buyItem(f.id,rs[rr++%rs.length].id,100+(rr*37)%280);if(it){spent.furn+=c0-S.coins;own.add(f.id)}return it};
  for(cyc=0;cyc<CYC;cyc++){
    globalThis.BOT.min=cyc*10;const T=Date.now()+off;
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
    // 6) tiêu xu: bát cho đủ suất, phòng mới khi nhà gần đầy, gacha khi còn chỗ, còn dư thì nội thất
    G.ownedRooms().forEach(r=>{const n=G.catsIn(r.id).length;let guard=0;
      while(G.bowlCap(r.id)<n&&guard++<4){const f=['bowlsteel','bowl'].map(id=>G.FURN[id]).find(f=>!G.locked(f)&&S.coins>=f.price);if(!f)break;const c0=S.coins;G.buyItem(f.id,r.id,100);spent.furn+=c0-S.coins}});
    const next=G.ROOMS.filter(r=>r.price&&!S.rooms[r.id]).sort((a,b)=>a.price-b.price)[0];
    const free=G.totalCap()-S.cats.filter(c=>c.room!=='wait').length,want=next&&!G.locked(next)&&free<=2;
    if(want&&S.coins>=next.price){const c0=S.coins;if(G.buyRoom(next.id)){spent.room+=c0-S.coins;roomAt.push({id:next.id,c:cyc,lv:S.level})}}
    for(let g=0;g<8&&S.cats.length<G.totalCap();g++){if(S.tickets>0)G.gachaRoll(true);else if(S.coins>=120){G.gachaRoll(false);spent.gacha+=100}else break}
    if(!(want&&!S.rooms[next.id])){for(let k=0;k<4;k++){const f=FALL.filter(f=>!own.has(f.id)&&!G.locked(f)).sort((a,b)=>a.price-b.price)[0];if(!f||S.coins<f.price+200||!buyF(f))break}}
    if(furnAt==null&&FALL.every(f=>own.has(f.id)))furnAt=cyc;
    if(NEW)earn('ach',()=>N.achCheck());
    if(!lvAt[S.level])lvAt[S.level]=cyc;
    if(cyc%6===5)hist.push(Object.values(inc).reduce((a,b)=>a+b,0));
    if(furnAt!=null&&roomAt.length>=16&&S.level>=18&&cyc>furnAt+60)break;
    // 7) trôi 10 phút
    //    mèo đi tới bát và ăn trong lúc tua: xu cảm ơn đến lúc này, tính vào "cảm ơn bữa ăn"
    for(let k=0;k<2;k++){off+=300000;G.setOff(off);const a0=G.AWAY.n;earn('feed',()=>G.tick(300,true));meals+=G.AWAY.n-a0}
  }
  const tot=Object.values(inc).reduce((a,b)=>a+b,0),hrs=hist.length,last=hrs>10?(hist[hrs-1]-hist[hrs-11])/10:0;
  const h6=Math.min(cyc,36); // 6 giờ đầu: đo riêng để so với luật cũ (lúc này nhà còn ít mèo nên nhìn rõ nhịp cho ăn)
  return {lvAt,roomAt,furnAt,inc,tix,spent,tot,hours:cyc/6,feedH:inc.feed/(cyc/6),feedCost,meals,
    perMeal:meals?inc.feed/meals:0,level:S.level,cats:S.cats.length,rooms:G.ownedRooms().length,perHour:Math.round(last)};
}
const rs=[];for(let i=0;i<A.runs;i++)rs.push(run());
const med=a=>{a=a.filter(x=>x!=null).sort((x,y)=>x-y);return a.length>=Math.ceil(rs.length/2)?a[Math.floor(a.length/2)]:null},hh=c=>c==null?null:Math.round(c/6*10)/10;
const roomH=k=>hh(med(rs.map(r=>r.roomAt[k]&&r.roomAt[k].c)));
const out={args:A,level:{},room:{},furnAll:hh(med(rs.map(r=>r.furnAt))),perHourEnd:med(rs.map(r=>r.perHour)),inc:{},tix:{},
  feedH:Math.round(med(rs.map(r=>r.feedH))),perMeal:Math.round(med(rs.map(r=>r.perMeal))*100)/100,mealsH:Math.round(med(rs.map(r=>r.meals/r.hours)))};
[5,9,13,18].forEach(l=>out.level[l]=hh(med(rs.map(r=>r.lvAt[l]))));
[[4,'Phòng thứ 5 (Phòng chơi)'],[8,'Phòng thứ 9 (Thư viện)'],[15,'Phòng hoàng gia']].forEach(([k,n])=>out.room[n]=roomH(k));
const T=rs.reduce((a,r)=>a+r.tot,0);Object.keys(rs[0].inc).forEach(k=>out.inc[k]=Math.round(rs.reduce((a,r)=>a+r.inc[k],0)/T*1000)/10);
Object.keys(rs[0].tix).forEach(k=>out.tix[k]=Math.round(rs.reduce((a,r)=>a+r.tix[k],0)/rs.length));
if(A.json){console.log(JSON.stringify(out));process.exit(0)}
const f=v=>v==null?'chưa tới':String(v).replace('.',',')+' giờ';
console.log((A.old?'[LUẬT CHO ĂN CŨ, giả lập] ':'')+'Bot '+(NEW?'CÓ nguồn xu mới (nhìn tab Phòng '+Math.round(A.watch*100)+'% thời gian, '+A.day+' giờ chơi mỗi ngày)':'KHÔNG tính nguồn xu mới')+' · ROOM_K1='+A.k1+' FURN_KS='+A.ks+' · '+A.runs+' lượt, tối đa '+A.h+' giờ');
console.log('Cấp 5: '+f(out.level[5])+' · cấp 9: '+f(out.level[9])+' · cấp 13: '+f(out.level[13])+' · cấp 18: '+f(out.level[18]));
Object.entries(out.room).forEach(([n,v])=>console.log(n+': '+f(v)));
console.log('Đủ mọi món nội thất: '+f(out.furnAll));
console.log('Thu nhập cuối game: khoảng '+(out.perHourEnd||0).toLocaleString('vi-VN')+' xu mỗi giờ');
const NM={trip:'viễn chinh',feed:'cảm ơn bữa ăn (đã trừ tiền hạt)',pet:'vuốt ve',quest:'nhiệm vụ trong giờ',daily:'nhiệm vụ ngày',checkin:'điểm danh',crit:'khách lạ',wish:'ước muốn',ach:'thành tựu'};
console.log('Cho ăn: lãi khoảng '+out.feedH.toLocaleString('vi-VN')+' xu mỗi giờ chơi, '+out.mealsH.toLocaleString('vi-VN')+' suất ăn có cảm ơn mỗi giờ, lãi '+String(out.perMeal).replace('.',',')+' xu mỗi suất (đã trừ tiền hạt)');
console.log('Tỉ trọng xu kiếm được: '+Object.entries(out.inc).filter(([k,v])=>v).map(([k,v])=>NM[k]+' '+String(v).replace('.',',')+'%').join(', '));
if(NEW)console.log('Vé nhận thêm mỗi lượt chơi: nhiệm vụ trong giờ '+out.tix.quest+', nhiệm vụ ngày '+out.tix.daily+', điểm danh '+out.tix.checkin+', khách lạ '+out.tix.crit);
process.exit(0);
