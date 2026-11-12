"use strict";
/* ============ BỮA ĂN VÀ NƯỚC UỐNG: LÕI (2026-11-12) ============
   Nạp ngay sau js/med.js. Không đụng DOM. Giao diện ở js/meal-ui.js, hoạt ảnh ở js/meal-fx.js, hình bát theo mức đầy ở js/meal-art.js.

   Bát ăn và bát nước là hai loại đồ riêng (FURN[id].bowl và FURN[id].water), hai kho riêng, hai bộ đếm riêng:
   - Thức ăn: kho S.fdinv {foodId: số suất}. Bát ăn giữ danh sách suất b.fl (mỗi phần tử là id món), b.left = b.fl.length, b.food = món trên cùng.
   - Nước: kho S.inv (chai, js/med.js). Bát nước giữ danh sách b.wl, b.w = b.wl.length (như cũ).
   - Phần ăn dở: b.fp / b.wp = {id, r} với r là phần còn lại (0..1) của một suất, mỗi phần dở chiếm một chỗ trong bát.
     Hiếm khi có nhiều phần dở khác món cùng lúc (hai bé cùng bị gọi đi giữa bữa): phần thứ hai trở đi nằm ở b.fpx / b.wpx (mảng).
   Kind: 'f' là thức ăn, 'w' là nước. Mọi hàm dưới đây nhận kind để dùng chung một luật mà không trộn kho hay bộ đếm.

   Mua vào kho và đổ vào bát là hai bước riêng: mealBuy chỉ cất vào kho, mealPour rót từ kho theo kế hoạch chia (mealPlan).

   Mèo ăn/uống thật sự (c.meal):
   1. mealCall giao cho bé một bát còn suất khả dụng: c.meal={k,iid,st:'go',t,eta}. Suất được GIỮ CHỖ (đếm trong mealRes),
      chưa bị trừ khỏi bát. Hai bé không thể giữ cùng một suất: suất khả dụng = số suất trong bát − số bé đang giữ chỗ.
   2. Bé đi tới bát. Trong phòng đang xem, giao diện báo tới nơi bằng mealArrive(c); bé ở phòng khác (hoặc lúc bù giờ vắng mặt)
      thì tới nơi khi hết eta. Phòng đang xem mà quá eta + MEALC.grace vẫn chưa tới (kẹt, bị kéo đi) thì hủy, không trừ gì.
   3. Tới nơi: bát hết chỗ ăn (MEALC.slots bé cùng lúc, bát đôi 2, bát thường 2) thì xếp hàng st:'wait'. Còn chỗ thì bắt đầu:
      lấy một suất ra khỏi bát (lúc này bộ đếm mới giảm), st:'eat', ăn trong dur giây; lượng hiển thị trong bát vơi dần theo tiến độ.
   4. Ăn xong thì cộng chỉ số và xu cảm ơn. Bị gián đoạn giữa chừng (mealStop) thì chỉ tính phần đã ăn, phần còn lại trả về bát (phần ăn dở).
   Mèo đi viễn chinh, nằm viện, rời phòng, bát bị dời phòng hay hỏng: hủy, trả lại suất. Tải lại game: c.meal và danh sách suất nằm trong bản lưu;
   bé đang đi hoặc xếp hàng thì đi lại từ đầu, bé đang ăn thì ăn tiếp theo đồng hồ. Mọi cộng trừ chỉ xảy ra ở mealStart và mealEnd, mỗi suất đúng một lần. */

const MEALC={
  eat:6, drink:4,           // giây để ăn hết / uống hết một suất
  eta:[2.5,6],              // giây đi tới bát của bé không nằm trong phòng đang xem
  grace:14,                 // phòng đang xem: quá eta chừng này giây mà chưa tới bát thì hủy
  slots:2,                  // số bé ăn cùng lúc ở một bát (hai bên trái phải); bát có FURN.bowl.slots thì theo đó
  hungry:50, allMin:10,     // bé đói dưới 50 tự ra ăn; vừa đổ bát thì mọi bé ra ăn, mỗi bé tối đa một lần mỗi 10 phút (giữ nhịp kinh tế cũ)
  minPart:.15,              // phần ăn dở nhỏ hơn mức này coi như hết
  feedXpMin:10,             // kinh nghiệm và nhiệm vụ "cho ăn" tính tối đa một lần mỗi 10 phút mỗi phòng (như nhịp đổ bát cũ)
};
const MK={
  f:{inv:()=>S.fdinv||(S.fdinv={}),ok:it=>!!FURN[it.fid].bowl,cap:it=>FURN[it.fid].bowl.cap,list:it=>fdList(it),sync:it=>{it.left=it.fl.length;if(it.fl.length)it.food=it.fl[it.fl.length-1]},part:'fp',dur:()=>MEALC.eat,item:id=>FOOD[id]},
  w:{inv:()=>S.inv||(S.inv={}),ok:it=>!!FURN[it.fid].water,cap:it=>FURN[it.fid].water.cap,list:it=>bowlList(it),sync:it=>{it.w=it.wl.length},part:'wp',dur:()=>MEALC.drink,item:id=>DRINK[id]},
};
function fdList(b){if(!Array.isArray(b.fl)){const n=Math.max(0,b.left|0);b.fl=b.food&&FOOD[b.food]?Array(n).fill(b.food):[]}b.left=b.fl.length;return b.fl}
const fdN=id=>(S.fdinv&&S.fdinv[id])||0;
const fdStock=()=>FOODS.reduce((a,f)=>a+fdN(f.id),0);
const mInvN=(k,id)=>k==='f'?fdN(id):invN(id);
// giá: thức ăn niêm yết cho 8 suất (như cũ), nước niêm yết theo chai
const mPrice=(k,id,n)=>{n=Math.max(0,n|0);if(!n)return 0;return k==='f'?Math.max(1,Math.round(FOOD[id].price*n/8)):DRINK[id].price*n};
const mBowls=(k,rid)=>itemsIn(rid).filter(i=>MK[k].ok(i)&&!i.broken);
const mbOf=it=>FURN[it.fid].bowl?'f':FURN[it.fid].water?'w':null;
const mSlots=it=>{const B=FURN[it.fid].bowl||FURN[it.fid].water;return (B&&B.slots)||MEALC.slots};
// trong bát: số suất nguyên (chưa ai lấy), phần ăn dở, số bé đang giữ chỗ, số bé đang ăn
const mHave=(k,b)=>MK[k].list(b).length;
const mParts=(k,b)=>{const P=MK[k].part;return [b[P]].concat(b[P+'x']||[]).filter(p=>p&&p.r>MEALC.minPart)};
const mPart=(k,b)=>mParts(k,b)[0]||null;
const mPartN=(k,b)=>mParts(k,b).length;
function mSetParts(k,b,L){const P=MK[k].part;L=L.filter(p=>p&&p.r>MEALC.minPart);if(L[0])b[P]=L[0];else delete b[P];if(L.length>1)b[P+'x']=L.slice(1);else delete b[P+'x']}
const mealOf=c=>c.meal&&MK[c.meal.k]?c.meal:null;
const mealRes=b=>S.cats.filter(c=>{const m=mealOf(c);return m&&m.iid===b.iid&&(m.st==='go'||m.st==='wait')}).length;
const mealEaters=b=>S.cats.filter(c=>{const m=mealOf(c);return m&&m.iid===b.iid&&m.st==='eat'});
// suất còn có thể giao cho bé mới: suất nguyên + phần ăn dở − số bé đang giữ chỗ
const mAvail=(k,b)=>mHave(k,b)+mPartN(k,b)-mealRes(b);
// chỗ trống để đổ thêm: phần ăn dở chiếm một chỗ, không bao giờ ghi đè hay làm mất lượng còn trong bát
const mFree=(k,b)=>Math.max(0,MK[k].cap(b)-mHave(k,b)-mPartN(k,b)-mealEaters(b).length);
// lượng đang hiển thị (để vẽ mức đầy): suất nguyên + phần dở + phần chưa ăn của các bé đang ăn
function mShow(k,b){let v=mHave(k,b)+mParts(k,b).reduce((a,p)=>a+p.r,0);mealEaters(b).forEach(c=>{const m=c.meal;v+=m.por*(1-mealProg(m))});return Math.max(0,v)}
const fillRatio=b=>{const k=mbOf(b);return k?Math.min(1,mShow(k,b)/MK[k].cap(b)):0};
// món đang nằm trên cùng (để tô màu thức ăn / nước)
const mTop=(k,b)=>{const l=MK[k].list(b),p=mPart(k,b);if(l.length)return l[l.length-1];if(p)return p.id;const e=mealEaters(b)[0];return e?e.meal.id:null};

/* ---------- gợi ý số lượng và kế hoạch chia ---------- */
// bé cần phục vụ: thức ăn là bé dưới MEALC.hungry hoặc chưa ăn lần "vừa đổ bát" trong 10 phút; nước là bé dưới ngưỡng khát
// bé đang có bữa loại khác (đang đi uống nước chẳng hạn) vẫn tính là cần ăn; bé đã có bữa cùng loại thì đã nằm trong phần giữ chỗ
const mNeedy=(k,rid)=>homeCats(rid).filter(c=>!(mealOf(c)&&c.meal.k===k)&&(k==='f'?c.full<MEALC.hungry||now()-(c.allAt||0)>=MEALC.allMin*60000:(c.wa==null?100:c.wa)<WXC.water.drinkAt));
// số suất gợi ý: đủ cho số bé cần phục vụ trừ phần đang khả dụng, không vượt chỗ trống; không bé nào cần thì gợi ý làm đầy.
// iid: người chơi đang chọn một bát cụ thể thì chỉ tính chỗ trống của bát đó.
function mSuggest(k,rid,iid){
  const bs=mBowls(k,rid),one=iid!=null?bs.find(b=>b.iid===iid):null,pool=one?[one]:bs,free=pool.reduce((a,b)=>a+mFree(k,b),0);if(!free)return 0;
  const want=mNeedy(k,rid).length-bs.reduce((a,b)=>a+Math.max(0,mAvail(k,b)),0);
  return want>0?Math.min(free,want):free;
}
// chia n suất cho các bát: 'even' chia đều theo chỗ trống, 'first' đổ đầy bát đầu rồi tới bát sau, 'custom' theo {iid: số suất}.
// Không vượt chỗ trống từng bát. Trả [{iid, add}] và tổng.
function mealPlan(k,rid,n,mode,custom){
  const bs=mBowls(k,rid),fr=bs.map(b=>mFree(k,b)),add=bs.map(()=>0);n=Math.max(0,n|0);
  if(mode==='custom'&&custom)bs.forEach((b,i)=>{add[i]=clamp((custom[b.iid]|0),0,fr[i])});
  else if(mode==='first')bs.forEach((b,i)=>{const a=Math.min(fr[i],n);add[i]=a;n-=a});
  else while(n>0){ // chia đều: mỗi vòng thêm một suất cho bát được chia ít nhất (bằng nhau thì bát còn trống nhiều hơn), bát hết chỗ thì bỏ qua
    let j=-1;bs.forEach((b,i)=>{if(add[i]<fr[i]&&(j<0||add[i]<add[j]||(add[i]===add[j]&&fr[i]-add[i]>fr[j]-add[j])))j=i});if(j<0)break;add[j]++;n--;}
  const plan=bs.map((b,i)=>({iid:b.iid,add:add[i]})).filter(p=>p.add>0);return {plan,n:plan.reduce((a,p)=>a+p.add,0)};
}

/* ---------- mua vào kho, rót vào bát ---------- */
function mealBuy(k,id,n){
  n=Math.max(1,n|0);if(k==='w')return buyDrink(id,n);
  if(!FOOD[id])return {err:'Không có món này.'};if(locked(FOOD[id]))return {err:FOOD[id].n+' mở ở cấp '+FOOD[id].ul+'.'};
  const cost=mPrice('f',id,n);if(S.coins<cost)return {err:'Không đủ xu: cần '+cost.toLocaleString('vi-VN')+' xu.'};
  S.coins-=cost;const I=MK.f.inv();I[id]=fdN(id)+n;save();return {n,cost};
}
// rót loại id từ kho theo kế hoạch [{iid,add}]; thiếu kho thì rót tới đâu hay tới đó. Trả {n, bowls:[{iid,add}]} hoặc {err}
function mealPour(k,rid,id,plan){
  const M=MK[k],I=M.inv();if(!M.item(id))return {err:'Không có loại này.'};
  let left=mInvN(k,id),n=0;const done=[];
  if(left<1)return {err:k==='f'?'Kho hết '+FOOD[id].n+'. Mua thêm trước khi đổ.':'Hết '+DRINK[id].n+' trong kho.',empty:1};
  (plan||[]).forEach(p=>{const b=S.items.find(i=>i.iid===p.iid&&i.room===rid&&M.ok(i)&&!i.broken);if(!b)return;
    const a=Math.min(p.add|0,mFree(k,b),left);if(a<=0)return;const l=M.list(b);for(let i=0;i<a;i++)l.push(id);M.sync(b);left-=a;n+=a;done.push({iid:b.iid,add:a})});
  if(!n)return {err:'Các bát đều đang đầy.',full:1};
  I[id]=mInvN(k,id)-n;
  if(k==='f'){const st=S.rooms[rid]||{};if(now()-(st.feedXp||0)>=MEALC.feedXpMin*60000){st.feedXp=now();addXp(5);onAct('feed',1)}}
  else if(typeof medS==='function')medS().wd=id;
  mealCall(rid,k,true);save();
  if(typeof mealFx==='function')done.forEach(d=>mealFx(k,d.iid,id,d.add)); // hoạt ảnh đổ (js/meal-fx.js)
  return {n,id,bowls:done};
}

/* ---------- mèo đi ăn, ăn, xong ---------- */
const mealProg=m=>m.st!=='eat'?0:clamp((now()-m.t0)/(m.dur*1000),0,1);
const mealHome=c=>!onTrip(c.uid)&&!!ROOM[c.room];
// all: vừa đổ bát (mọi bé chưa ra ăn trong 10 phút đều ra), còn lại chỉ bé đói hoặc khát
function mealCall(rid,k,all){
  const bs=mBowls(k,rid);if(!bs.length)return 0;let n=0;
  homeCats(rid).filter(c=>!mealOf(c)&&!(bedItem(c)&&(k==='f'?c.full>=20:(c.wa==null?100:c.wa)>=WXC.water.low))&&(k==='f'?c.full<MEALC.hungry||(all&&now()-(c.allAt||0)>=MEALC.allMin*60000):(c.wa==null?100:c.wa)<WXC.water.drinkAt))
    .sort((a,b)=>k==='f'?a.full-b.full:(a.wa==null?100:a.wa)-(b.wa==null?100:b.wa)).forEach(c=>{
      const ok=bs.filter(b=>mAvail(k,b)>0);if(!ok.length)return;
      const b=pickBowl(c,ok)||ok[0]; // giao diện thay pickBowl bằng bát gần bé nhất
      c.meal={k,iid:b.iid,st:'go',t:now(),eta:now()+rnd(MEALC.eta[0],MEALC.eta[1])*1000,all:k==='f'&&all&&c.full>=MEALC.hungry?1:0};
      if(k==='f'&&all)c.allAt=now();n++;
    });
  return n;
}
// giao diện gọi khi con mèo trong phòng đang xem đã tới bát
function mealArrive(c){const m=mealOf(c);if(m&&m.st==='go')m.arr=1}
function mealStart(c,b){
  const m=c.meal,k=m.k,M=MK[k],L=mParts(k,b),p=L.shift();
  if(p){m.id=p.id;m.por=p.r;mSetParts(k,b,L)}
  else{const l=M.list(b);if(!l.length)return mealStop(c,'empty');m.id=l.pop();m.por=1;M.sync(b)}
  m.st='eat';m.t0=now();m.dur=M.dur()*m.por;delete m.arr;
}
// cộng chỉ số cho phần đã ăn (q: phần của một suất, 0..1)
function mealGain(c,b,k,id,q){
  if(q<=0)return {coins:0};
  if(k==='f'){
    const B=FURN[b.fid].bowl,f=FOOD[id],rid=c.room,fav=favs(c).includes(id),chef=homeCats(rid).some(o=>tE(o,'chef'));
    let gain=f.full*(fav?1.2:1)*(chef?1.25:1)*(B.eff||1);if(id==='kibble'&&tE(c,'picky'))gain*=.5;
    c.full=clamp(c.full+gain*q,0,100);c.hp=clamp(c.hp+((f.hp||0)+(fav?10:0)+(B.hp||0))*q,0,100);c.en=clamp(c.en+(f.en||0)*q,0,100);
    if(f.buff&&q>=.5)c.buff=Object.assign({food:id,until:now()+f.min*60000*(fav?1.5:1)},f.buff);
    const coins=q>=.5?Math.round((4+(roomHas(rid,'tank')?2:0)+(ROOM[rid].thank||0)+(B.coin||0))*gMult()):0;S.coins+=coins;
    if(TOFF&&coins){AWAY.n++;AWAY.coins+=coins}
    if(fav&&q>=.5)onAct('fav',1);
    return {coins,fav};
  }
  const W=FURN[b.fid].water,w=DRINK[id]||DRINK.w_plain,hotNow=wxOpen()&&ROOM[c.room]&&roomClimate(c.room).T>WXC.hotAt;
  c.wa=Math.min(100,(c.wa==null?100:c.wa)+(w.wa+(W.cool&&hotNow?10:0))*q);const x=wxs(c);x.hx=Math.max(0,x.hx-((W.cool?40:20)+(w.cool||0))*q);
  if(w.he)c.he=clamp((c.he==null?100:c.he)+w.he*q,0,100);if(w.cf)c.cf=clamp((c.cf==null?60:c.cf)+w.cf*q,0,100);if(W.happy)c.hp=clamp(c.hp+W.happy*q,0,100);
  return {coins:0};
}
function mealEnd(c,b){const m=c.meal;const r=mealGain(c,b,m.k,m.id,m.por);delete c.meal;if(typeof mealDone==='function')mealDone(c,b,m,r);return r}
// dừng giữa chừng: chưa bắt đầu ăn thì chỉ bỏ giữ chỗ; đang ăn thì tính phần đã ăn, phần còn lại thành phần ăn dở trong bát
function mealStop(c,why){
  const m=mealOf(c);if(!m){delete c.meal;return}
  const b=S.items.find(i=>i.iid===m.iid);
  if(m.st==='eat'&&b){const pr=mealProg(m),eaten=m.por*pr,rest=m.por-eaten;mealGain(c,b,m.k,m.id,eaten);
    // phần chưa ăn luôn trả về bát (kể cả bát hỏng hay đã cất vào kho): gộp với phần dở cùng món, đủ một suất thì thành suất nguyên
    if(rest>MEALC.minPart&&MK[m.k].ok(b)){const L=mParts(m.k,b),q=L.find(p=>p.id===m.id);
      if(q){q.r+=rest;if(q.r>=1-1e-9){q.r-=1;MK[m.k].list(b).push(m.id);MK[m.k].sync(b)}}else L.push({id:m.id,r:rest});
      mSetParts(m.k,b,L)}}
  delete c.meal;if(typeof mealDone==='function')mealDone(c,b,m,null,why||'stop');
}
// mỗi tick: kiểm tra từng bé đang có bữa; sim (bù giờ vắng mặt) thì đi và ăn xong ngay
function mealTick(dt,sim){
  S.fdinv=S.fdinv||{};
  S.cats.forEach(c=>{
    const m=mealOf(c);if(!m){if(c.meal)delete c.meal;return}
    const b=S.items.find(i=>i.iid===m.iid);
    if(!b||b.broken||b.room!==c.room||!MK[m.k].ok(b)||!mealHome(c)){mealStop(c,'cancel');return}
    if(m.st==='eat'){if(sim||mealProg(m)>=1)mealEnd(c,b);return}
    const vis=!sim&&typeof ents!=='undefined'&&typeof cur!=='undefined'&&c.room===cur&&ents.some(e=>e.uid===c.uid&&!e.clone);
    if(m.st==='go'){
      if(vis?!m.arr&&now()>m.eta+MEALC.grace*1000:false){mealStop(c,'stuck');return}
      if(!(sim||m.arr||(!vis&&now()>=m.eta)))return;
      m.st='wait';
    }
    if(m.st==='wait'){
      if(mealEaters(b).length>=mSlots(b)&&!sim)return;
      if(mHave(m.k,b)+mPartN(m.k,b)<1){mealStop(c,'empty');return}
      mealStart(c,b);if(sim)mealEnd(c,b);
    }
  });
}
// tải game: bé đang đi hoặc xếp hàng thì đi lại từ đầu (giữ chỗ vẫn còn); chuyển bát ăn cũ (b.food + b.left) sang danh sách suất
function mealLoad(){
  S.fdinv=S.fdinv||{};
  S.items.forEach(i=>{if(FURN[i.fid]&&FURN[i.fid].bowl)fdList(i)});
  S.cats.forEach(c=>{const m=mealOf(c);if(m&&m.st!=='eat'){m.st='go';m.t=now();m.eta=now()+rnd(MEALC.eta[0],MEALC.eta[1])*1000;delete m.arr}});
}
// nước: máy lọc nước vẫn tự rót nước có sẵn trong kho; bé khát được giao bát và tự đi tới uống (thay cho uống tức thì ở js/med.js)
if(typeof bowlList==='function'){ // chỉ khi có js/med.js (nước mua trong kho); các bộ kiểm thử không nạp med.js thì giữ luật nước cũ
wxDrink=function(rid){
  const bs=wbowls(rid).filter(b=>!b.broken);if(!bs.length)return;S.inv=S.inv||{};
  bs.forEach(b=>{const W=FURN[b.fid].water;if(W.auto&&!(typeof pwOff==='function'&&pwOff(b))&&now()>=(b.wat||0)){b.wat=now()+600000;for(const w of DRINKS){if(mFree('w',b)<1)break;const a=Math.min(mFree('w',b),invN(w.id));if(a>0){const l=bowlList(b);for(let i=0;i<a;i++)l.push(w.id);b.w=l.length;S.inv[w.id]-=a}}}});
  mealCall(rid,'w',false);
};
// bát nước cũ: rót tối đa số chỗ trống (phần dở chiếm chỗ); fillWater của js/med.js đi qua đây nên cũng tôn trọng phần dở
pourBowl=function(b,did,max){const n=Math.min(mFree('w',b),invN(did),max==null?99:max);if(n<=0)return 0;const l=bowlList(b);S.inv[did]-=n;for(let i=0;i<n;i++)l.push(did);b.w=l.length;return n};
}
