"use strict";
/* ============ GỢI Ý TƯƠNG THÍCH: LUẬT (2026-11-12) ============
   Một module dùng chung tính độ hợp của mèo × phòng, mèo × món ăn, mèo × nước uống. Không đụng DOM, chạy được trong Node
   (tools/compattest.js). Số và chữ ở js/compat-data.js (CPC, CP_LV, CP_TEXT). Nạp sau js/garden.js, trước js/ui.js.
   MỌI màn hình gọi module này, không viết luật riêng ở từng nơi. Module chỉ ĐỌC dữ liệu có sẵn của game:
   TRAITS (outdoor, water, like, bigRoom, pal, aura, night, hunger, fav, picky), ROOMS (outdoor, water, night, hunger, wait),
   favs(c), FOODS (en, hp, full), DRINKS (cool, he, cf, wa) và trạng thái hiện tại của bé. Thứ duy nhất nó ghi là phòng của mèo, trong CP.apply.

   Kết quả của mọi hàm chấm điểm có cùng dạng:
     {lv, score, amb, total, why:[{s, t, amb?, maybe?}], tip}
     lv: 2 Rất hợp · 1 Hợp · 0 Bình thường · −1 Không hợp (tra CP_LV[lv] lấy tên, biểu tượng, lớp CSS)
     score: điểm riêng của bé với phòng/món đó; amb: điểm chung do bạn cùng phòng (aura), không tính vào lv; total = score + amb
     why: các lý do, mạnh nhất đứng đầu; tip: các lý do nối thành một câu để đưa vào data-tip

   API:
     CP.room(c, rid)            bé c (đang có) nếu ở phòng rid: xét cả nội thất đang có và các bé đang ở phòng đó
     CP.rooms(c, {all})         mọi phòng đang có (all: mọi phòng của game), hợp nhất đứng đầu; thêm {id, n, owned, cur, full}
     CP.misfit(c)               null, hoặc {kind:'bad'|'better', cur, best, gain}: bé đang ở phòng không hợp / có phòng còn chỗ hợp hơn hẳn
     CP.fitCats(rid)            các bé đang có hợp phòng rid (lv >= 1), hợp nhất đứng đầu: [{c, here, away, ...kết quả}]
     CP.fitSpecies(rid)         các loài CHƯA có mà hợp phòng rid: [{id, seen, maybe, ...kết quả}]
     CP.food(c, fid) / CP.foods(c)      món ăn; foods() xếp hợp nhất đứng đầu, thêm {id, locked}
     CP.drink(c, did) / CP.drinks(c)    nước uống (theo trạng thái lúc này)
     CP.foodFans(fid, cats) / CP.drinkFans(did, cats)   trong danh sách cats, bé nào hợp món/nước đó (lv >= 1)
     CP.likes(c)                nội thất bé thích: [{fid, n, pts, tn, has}]
     CP.pals(c)                 bạn thân của bé: [{tn, ids, grp, here:[tên bé đang ở cùng phòng]}]
     CP.spRoom(sid, rid, {traits, exact, live}) / CP.spFood(sid, fid, {traits, exact})   theo LOÀI (chưa có bé cụ thể): thuộc tính chắc chắn
                                (xt, bt, traits) tính đủ điểm; thuộc tính "giống này hay có" (trường t) chỉ tính một nửa và tối đa là Hợp (maybe).
                                exact: bỏ phần "hay có" (mèo khởi đầu chỉ có đúng traits); live: xét cả nội thất đang có trong phòng
     CP.spInfo(sid, {traits})   tóm tắt theo loài cho thẻ mèo khởi đầu và Sưu tập: {rooms, foods, likes}
     CP.tutFood(c)              món đã mở khóa hợp nhất với bé (hướng dẫn tân thủ chọn sẵn món này)
     CP.plan()                  đề xuất cách xếp mèo vào phòng: {moves:[{uid, from, to, gain, why}], gain}. KHÔNG thay đổi gì
     CP.apply(plan)             thực hiện một đề xuất: {n} hoặc {err}
     CP.label(lv), CP.tip(name, res), CP.lvOf(score) */
const CP=(()=>{
  const C=CPC,TX=CP_TEXT;
  const ft=(s,o)=>String(s).replace(/\{(\w+)\}/g,(m,k)=>o&&o[k]!=null?o[k]:'');
  const lvOf=s=>s>=C.love?2:s>=C.like?1:s<=C.bad?-1:0;
  const pct=v=>Math.round(v*100);
  const label=lv=>{const L=CP_LV[lv]||CP_LV[0];return (L.ic?L.ic+' ':'')+L.n};
  function pack(why,x){
    let score=0,amb=0;why.forEach(e=>{if(e.amb)amb+=e.s;else score+=e.s});
    why.sort((a,b)=>(a.amb?1:0)-(b.amb?1:0)||Math.abs(b.s)-Math.abs(a.s));
    return Object.assign({lv:lvOf(score),score,amb,total:score+amb,why,tip:why.map(e=>e.t).join('. ')},x);
  }
  const tip=(name,r,none)=>name+' · '+label(r.lv)+(r.tip?'. '+r.tip:none?'. '+none:'');

  /* ---------- mèo × phòng ---------- */
  // phòng có món nội thất fid không (đồ hỏng không tính; 'tree' tính cả mọi đồ leo trèo nhiều tầng, đúng như happyTarget)
  const hasItem=rid=>fid=>roomHas(rid,fid)||(fid==='tree'&&itemsIn(rid).some(i=>FURN[i.fid].lv&&!i.broken));
  const itemName=(rid,fid)=>fid==='tree'&&rid&&!roomHas(rid,'tree')?TX.room.likeAny:FURN[fid].n;
  // bạn cùng phòng của một thuộc tính pal, tính trên danh sách L (giống palN, palBoth trong js/game.js)
  function palOf(p,self,mates){
    const L=mates.filter(o=>o!==self),fr=p.grp?L.filter(o=>SP[o.sp].g===p.grp):L.filter(o=>p.ids.includes(o.sp));
    const n=p.grp?fr.length:p.ids.filter(id=>L.some(o=>o.sp===id)).length;let both=false;
    if(p.both&&n){if(!p.plus)both=n>=2;else{const M=L.filter(o=>!(p.ids||[]).includes(o.sp));both=p.plus.grp?M.some(o=>SP[o.sp].g===p.plus.grp):M.some(o=>p.plus.ids.includes(o.sp))}}
    return {n,both,names:fr.map(o=>o.name).filter((v,i,a)=>a.indexOf(v)===i).slice(0,2)};
  }
  // các lý do riêng của một bộ thuộc tính với phòng rid. x: {has(fid), mates, count, self}; thiếu phần nào thì bỏ quy tắc cần phần đó
  // trả [{s, n, d}]: điểm, tên thuộc tính, mô tả
  function roomWhy(tr,rid,x){
    const R=ROOM[rid],T=TX.room,out=[],E=tr.map(id=>TRAITS[id]).filter(Boolean);
    const fx=E.find(t=>t.e.fixedHappy);if(fx)return [{s:0,n:fx.n,d:T.fixed,fixed:1}];
    if(R.wait)out.push({s:C.wait,n:'',d:ft(T.wait,{v:-C.wait})});
    let w=0,ng=0,hg=1;const wn=[],nn=[],hn=[];
    E.forEach(t=>{const e=t.e;
      if(e.outdoor&&R.outdoor)out.push({s:e.outdoor,n:t.n,d:ft(T.outdoor,{v:e.outdoor})});
      if(e.like&&x.has&&x.has(e.like[0]))out.push({s:e.like[1],n:t.n,d:ft(T.like,{v:e.like[1],f:itemName(rid,e.like[0])})});
      if(e.bigRoom&&x.count!=null&&x.count>=C.bigAt)out.push({s:e.bigRoom,n:t.n,d:ft(T.big,{v:-e.bigRoom,k:C.bigAt})});
      if(e.pal&&x.mates){const p=palOf(e.pal,x.self,x.mates),v=p.both?e.pal.both:p.n?e.pal.happy||0:0;if(v)out.push({s:v,n:t.n,d:ft(T.pal,{v,c:p.names.join(', ')})})}
      if(e.water){w+=e.water;wn.push(t.n)}if(e.night>0){ng+=e.night;nn.push(t.n)}if(e.hunger>1){hn.push(t.n)}hg*=e.hunger||1});
    if(R.water&&w>0)out.push({s:C.waterUp,n:wn.join(', '),d:ft(T.waterUp,{v:C.waterUp,r:R.n})});
    if(R.water&&w<0)out.push({s:C.waterDn,n:wn.join(', '),d:ft(T.waterDn,{v:-C.waterDn,r:R.n})});
    if(R.night&&ng>0)out.push({s:C.nightRoom,n:nn.join(', '),d:ft(T.night,{v:pct(R.night),r:R.n})});
    if(R.hunger&&R.hunger<1&&hg>1)out.push({s:C.hungerRoom,n:hn.join(', '),d:ft(T.hunger,{v:pct(1-R.hunger),r:R.n})});
    return out;
  }
  const sure=e=>({s:e.s,t:(e.n?e.n+': ':'')+e.d});
  function room(c,rid,o){
    o=o||{};const st=o.static,mates=st?null:(o.mates||homeCats(rid)).filter(x=>x!==c);
    const raw=roomWhy(c.traits,rid,st?{}:{has:o.has||hasItem(rid),mates,count:o.count!=null?o.count:catsIn(rid).length+(c.room===rid?0:1),self:c});
    const why=raw.map(sure);
    if(mates&&!(raw[0]&&raw[0].fixed)){const a=mates.reduce((s,m)=>s+tE(m,'aura'),0);if(a)why.push({s:a,amb:1,t:ft(a>0?TX.room.auraUp:TX.room.auraDn,{v:Math.abs(a)})})}
    return pack(why,{rid});
  }
  function rooms(c,o){
    o=o||{};const L=(o.all?ROOMS:ownedRooms()).map((r,i)=>Object.assign(room(c,r.id,o.all&&!S.rooms[r.id]?{static:1}:o),
      {id:r.id,n:r.n,i,owned:!!S.rooms[r.id],cur:c.room===r.id,full:c.room!==r.id&&catsIn(r.id).length>=r.cap}));
    return L.sort((a,b)=>b.total-a.total||b.score-a.score||(b.cur?1:0)-(a.cur?1:0)||a.i-b.i);
  }
  function misfit(c){
    if(!c||onTrip(c.uid)||!ROOM[c.room])return null;
    const cur=room(c,c.room);
    const best=rooms(c).filter(r=>!r.cur&&!r.full&&r.total>cur.total)[0]||null,gain=best?best.total-cur.total:0;
    if(cur.total<=C.bad)return {kind:'bad',cur,best,gain};
    if(best&&gain>=C.better&&best.lv>=1)return {kind:'better',cur,best,gain};
    return null;
  }
  const byFit=(a,b)=>b.score-a.score||b.total-a.total;
  function fitCats(rid){
    return S.cats.map(c=>Object.assign(room(c,rid),{c,here:c.room===rid,away:onTrip(c.uid)})).filter(r=>r.lv>=1).sort((a,b)=>byFit(a,b)||b.c.star-a.c.star);
  }

  /* ---------- theo loài (chưa có bé cụ thể) ---------- */
  // thuộc tính chắc chắn của loài: xt (mèo trang phục), bt (giống thật 5★), cộng danh sách truyền vào (mèo khởi đầu); còn lại trong t là "hay có"
  function spTraits(sid,o){
    const sp=SP[sid],cert=[sp.xt,sp.bt].concat((o&&o.traits)||[]).filter(t=>t&&TRAITS[t]);
    return {cert,maybe:o&&o.exact?[]:String(sp.t||'').split(' ').filter(t=>t&&TRAITS[t]&&!cert.includes(t))};
  }
  function spPack(cw,mw,x){
    const cs=cw.reduce((a,e)=>a+e.s,0),r=pack(cw.concat(mw),x),hi=lvOf(cs);
    if(r.lv>hi&&r.lv>0){r.lv=Math.min(1,r.lv);r.maybe=hi<1} // phần "hay có" không tự mình đẩy lên Rất hợp
    if(r.lv<hi)r.lv=hi;
    return r;
  }
  function spRoom(sid,rid,o){
    const t=spTraits(sid,o),x=o&&o.live&&S.rooms[rid]?{has:hasItem(rid)}:{},cw=roomWhy(t.cert,rid,x).map(sure),mw=[];
    t.maybe.forEach(id=>roomWhy([id],rid,x).forEach(e=>{if(e.s>0)mw.push({s:e.s*C.maybe,maybe:1,t:ft(TX.room.maybe,{n:e.n||TRAITS[id].n})+': '+e.d})}));
    return spPack(cw,mw,{rid,id:sid});
  }
  function fitSpecies(rid){
    const own={};S.cats.forEach(c=>own[c.sp]=1);
    return Object.keys(SP).filter(id=>!own[id]).map(id=>Object.assign(spRoom(id,rid,{live:1}),{seen:!!(S.seen&&S.seen[id])})).filter(r=>r.lv>=1)
      .sort((a,b)=>(a.maybe?1:0)-(b.maybe?1:0)||(b.seen?1:0)-(a.seen?1:0)||b.score-a.score||SP[b.id].r-SP[a.id].r);
  }

  /* ---------- mèo × món ăn ---------- */
  function food(c,fid,o){
    const f=FOOD[fid],T=TX.food,why=[];o=o||{};if(!f)return pack(why,{id:fid});
    if(favs(c).includes(fid))why.push({s:C.fav,t:T.fav});
    if(fid==='kibble'&&tE(c,'picky'))why.push({s:C.picky,t:T.picky});
    if(!o.static){
      if(c.en<C.tired.at&&(f.en||0)>=C.tired.en)why.push({s:C.tired.pts,t:ft(T.tired,{v:f.en})});
      if(c.hp<C.sad.at&&(f.hp||0)>=C.sad.hp)why.push({s:C.sad.pts,t:ft(T.sad,{v:f.hp})});
      if(c.full<C.hungry.at&&f.full>=C.hungry.full)why.push({s:C.hungry.pts,t:ft(T.hungry,{v:f.full})});
      if(c.en<C.drain.at&&(f.en||0)<0)why.push({s:C.drain.pts,t:ft(T.drain,{v:-f.en})});
    }
    return pack(why,{id:fid,locked:locked(f)});
  }
  const foods=(c,o)=>FOODS.map((f,i)=>Object.assign(food(c,f.id,o),{i})).sort((a,b)=>b.score-a.score||(a.locked?1:0)-(b.locked?1:0)||a.i-b.i);
  function spFood(sid,fid,o){
    const sp=SP[sid],t=spTraits(sid,o),T=TX.food,cw=[],mw=[];
    if(sp.fav===fid||t.cert.some(id=>TRAITS[id].e.fav===fid))cw.push({s:C.fav,t:T.fav});
    if(fid==='kibble'&&t.cert.some(id=>TRAITS[id].e.picky))cw.push({s:C.picky,t:T.picky});
    if(!cw.length)t.maybe.forEach(id=>{if(TRAITS[id].e.fav===fid)mw.push({s:C.fav*C.maybe,maybe:1,t:ft(T.maybe,{n:TRAITS[id].n,f:FOOD[fid].n})})});
    return spPack(cw,mw,{id:fid,locked:locked(FOOD[fid])});
  }
  const foodFans=(fid,cats)=>(cats||[]).map(c=>Object.assign(food(c,fid),{c})).filter(r=>r.lv>=1).sort(byFit);
  function tutFood(c){const L=c?foods(c,{static:1}).filter(r=>!r.locked&&r.lv>=1):[];return L.length?L[0].id:'kibble'}

  /* ---------- mèo × nước uống (theo trạng thái; game chưa có sở thích nước theo giống) ---------- */
  function drink(c,did){
    const d=typeof DRINK!=='undefined'?DRINK[did]:null,T=TX.drink,why=[];if(!d)return pack(why,{id:did});
    const wx=typeof wxOpen==='function'&&wxOpen()&&typeof wxHas==='function';
    if(d.cool&&wx&&wxHas(c,'hot'))why.push({s:C.hot,t:T.hot});
    if(d.he&&((c.he!=null&&c.he<C.weak.at)||(wx&&wxHas(c,'sick'))))why.push({s:C.weak.pts,t:ft(T.weak,{v:d.he})});
    if(d.cf&&wx&&c.cf!=null&&c.cf<C.uncomf.at)why.push({s:C.uncomf.pts,t:ft(T.uncomf,{v:d.cf})});
    if(typeof WXC!=='undefined'&&c.wa!=null&&c.wa<WXC.water.low&&d.wa>=C.parched.wa)why.push({s:C.parched.pts,t:ft(T.parched,{v:d.wa})});
    return pack(why,{id:did});
  }
  const drinks=c=>(typeof DRINKS!=='undefined'?DRINKS:[]).map((d,i)=>Object.assign(drink(c,d.id),{i})).sort((a,b)=>b.score-a.score||a.i-b.i);
  const drinkFans=(did,cats)=>(cats||[]).map(c=>Object.assign(drink(c,did),{c})).filter(r=>r.lv>=1).sort(byFit);

  /* ---------- nội thất bé thích, bạn thân ---------- */
  function likesOf(tr,rid){
    const m={};tr.forEach(id=>{const t=TRAITS[id],e=t&&t.e.like;if(!e||!FURN[e[0]])return;if(!m[e[0]]||m[e[0]].pts<e[1])m[e[0]]={fid:e[0],n:FURN[e[0]].n,pts:e[1],tn:t.n,has:!!rid&&ROOM[rid]&&hasItem(rid)(e[0])}});
    return Object.values(m).sort((a,b)=>b.pts-a.pts);
  }
  const likes=c=>likesOf(c.traits,c.room);
  function pals(c){
    const L=ROOM[c.room]?homeCats(c.room):[];
    return c.traits.map(id=>{const t=TRAITS[id],p=t&&t.e.pal;if(!p)return null;const r=palOf(p,c,L);return {tn:t.n,ids:p.ids||[],grp:p.grp||null,n:r.n,both:r.both,here:r.names,happy:p.happy||0,max:p.both||p.happy||0}}).filter(Boolean);
  }
  // tóm tắt theo loài: phòng (xét mọi phòng của game, chỉ theo đặc điểm cố định của phòng), món ăn, nội thất thích
  function spInfo(sid,o){
    const t=spTraits(sid,o);
    return {rooms:ROOMS.map((r,i)=>Object.assign(spRoom(sid,r.id,o),{n:r.n,i,owned:!!S.rooms[r.id]})).filter(r=>r.lv!==0).sort((a,b)=>b.score-a.score||a.i-b.i),
      foods:FOODS.map((f,i)=>Object.assign(spFood(sid,f.id,o),{n:f.n,i})).filter(r=>r.lv!==0).sort((a,b)=>b.score-a.score||a.i-b.i),
      likes:likesOf(t.cert).concat(likesOf(t.maybe).map(x=>Object.assign(x,{maybe:1}))).filter((x,i,a)=>a.findIndex(y=>y.fid===x.fid)===i)};
  }

  /* ---------- xếp gợi ý ---------- */
  // Tìm cách xếp mèo vào các phòng đang có sao cho tổng điểm (điểm riêng + aura của bạn cùng phòng) cao nhất, bằng tìm kiếm cục bộ:
  // mỗi lượt thử chuyển từng bé sang phòng còn chỗ, hoặc đổi chỗ với một bé ở phòng đầy,
  // và làm ngay bước lợi nhất của bé đó; lặp tới khi không còn bước nào có lợi. Không dồn thêm bé vào phòng quá số suất bát ăn đang có. Bé đang vắng nhà (viễn chinh, nằm viện, đi lạc) giữ nguyên phòng. Mỗi bé phải chuyển bị trừ CPC.moveCost điểm.
  function plan(){
    const t0=Date.now(),own=ownedRooms().map(r=>r.id),ids=own.concat(['wait']);
    const all=S.cats.filter(c=>ids.includes(c.room)),A={},orig={};all.forEach(c=>{A[c.uid]=orig[c.uid]=c.room});
    const fixed={};all.forEach(c=>{if(onTrip(c.uid))fixed[c.uid]=1});
    const sens=c=>c.traits.some(t=>{const e=(TRAITS[t]||{e:{}}).e;return e.outdoor||e.like||e.bigRoom||e.pal||e.water||e.aura||e.night>0||e.hunger>1});
    const SN={},AU={},FX={};all.forEach(c=>{SN[c.uid]=sens(c);AU[c.uid]=tE(c,'aura');FX[c.uid]=!!tE(c,'fixedHappy')});
    const HAS={};ids.forEach(r=>{const h=hasItem(r),m={};HAS[r]=fid=>fid in m?m[fid]:(m[fid]=h(fid))});
    const score=(rid,L)=>{let s=0,au=0;L.forEach(c=>au+=AU[c.uid]);
      L.forEach(c=>{if(FX[c.uid])return;if(SN[c.uid]||ROOM[rid].wait)roomWhy(c.traits,rid,{has:HAS[rid],mates:L,count:L.length,self:c}).forEach(e=>s+=e.s);s+=au-AU[c.uid]});return s};
    const M={},RS={};ids.forEach(r=>{M[r]=all.filter(c=>A[c.uid]===r);RS[r]=score(r,M[r])});
    // sức chứa khi xếp: không vượt sức chứa phòng, và không dồn thêm bé vào phòng quá số suất của các bát ăn đang có (kẻo xếp xong lại thiếu bát); bé đang ở Phòng chờ thì vẫn được vào, vì ở Phòng chờ còn không được cho ăn
    const CAP={};own.forEach(r=>{const bc=typeof bowlCap==='function'?bowlCap(r):Infinity;CAP[r]=Math.min(ROOM[r].cap,Math.max(M[r].length,bc))});
    const before=ids.reduce((a,r)=>a+RS[r],0),mv=c=>A[c.uid]!==orig[c.uid]?1:0;
    // mỗi lượt đi qua từng bé nhạy: tìm bước lợi nhất của riêng bé đó (chuyển sang phòng còn chỗ, hoặc đổi chỗ với một bé ở phòng đầy) và làm ngay
    let out=false;
    for(let it=0;it<C.planIter&&!out;it++){
      let any=false;
      for(const c of all){
        if(fixed[c.uid])continue;
        if(Date.now()-t0>C.planMs){out=true;break}
        const a=A[c.uid],La=M[a].filter(x=>x!==c);let best=null;
        for(const b of own){if(b===a)continue;const base=RS[a]+RS[b];
          if(M[b].length<(a==='wait'?ROOM[b].cap:CAP[b])){
            const sa=score(a,La),sb=score(b,M[b].concat([c])),g=sa+sb-base-C.moveCost*((b!==orig[c.uid]?1:0)-mv(c));
            if(!best||g>best.g)best={g,b,sa,sb};
          }else if(a!=='wait'){
            let neutral=0;
            for(const d of M[b]){if(fixed[d.uid])continue;if(!SN[d.uid]){if(neutral)continue;neutral=1}
              const sa=score(a,La.concat([d])),sb=score(b,M[b].filter(x=>x!==d).concat([c]));
              const g=sa+sb-base-C.moveCost*((b!==orig[c.uid]?1:0)-mv(c)+(a!==orig[d.uid]?1:0)-mv(d));
              if(!best||g>best.g)best={g,b,d,sa,sb}}
          }
        }
        if(!best||best.g<=.01)continue;
        const {b,d}=best;A[c.uid]=b;if(d)A[d.uid]=a;
        M[a]=La;M[b]=M[b].filter(x=>x!==d).concat([c]);if(d)M[a].push(d);RS[a]=best.sa;RS[b]=best.sb;any=true;
      }
      if(!any)break;
    }
    const after=ids.reduce((a,r)=>a+RS[r],0),T=TX.room;
    const moves=all.filter(mv).map(c=>{
      const to=A[c.uid],from=orig[c.uid],r1=room(c,to,{mates:M[to],count:M[to].length}),r0=room(c,from);
      const pos=r1.why.find(e=>e.s>0&&!e.amb),neg=r0.why.find(e=>e.s<0);
      return {uid:c.uid,name:c.name,from,to,lv:r1.lv,gain:r1.total-r0.total,why:pos?pos.t:ROOM[from].wait?ft(T.wait,{v:-C.wait}):neg?T.leave+' ('+neg.t+')':T.yield};
    }).sort((x,y)=>y.gain-x.gain);
    return {moves,gain:after-before,before,after,ms:Date.now()-t0};
  }
  function apply(p){
    const mv=(p&&p.moves)||[],bad={err:TX.ui.arrangeStale};if(!mv.length)return {n:0};
    if(mv.some(m=>{const c=catBy(m.uid);return !c||c.room!==m.from||onTrip(m.uid)||!S.rooms[m.to]}))return bad;
    const to={},cnt={};mv.forEach(m=>to[m.uid]=m.to);S.cats.forEach(c=>{const r=to[c.uid]||c.room;cnt[r]=(cnt[r]||0)+1});
    if(Object.keys(cnt).some(r=>!ROOM[r]||(!ROOM[r].wait&&cnt[r]>ROOM[r].cap)))return bad;
    mv.forEach(m=>{catBy(m.uid).room=m.to});save();
    return {n:mv.length};
  }

  return {lvOf,label,tip,room,rooms,misfit,fitCats,fitSpecies,food,foods,foodFans,tutFood,drink,drinks,drinkFans,likes,pals,spRoom,spFood,spInfo,spTraits,plan,apply,ft};
})();
