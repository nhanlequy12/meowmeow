"use strict";
/* ============ TRẠNG THÁI & LOGIC (không đụng tới DOM) ============ */
const KEY='meoxu_v2';
let S, notify=()=>{};
const now=()=>Date.now(), rnd=(a,b)=>a+Math.random()*(b-a), pick=a=>a[Math.floor(Math.random()*a.length)], clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
const SP={}; BREEDS.concat(VARIANTS).forEach(s=>SP[s.id]=s);
const WORLD_W=480, WALL_Y=96, FLOOR_MIN=106, FLOOR_MAX=166;

function fresh(){
  S={v:2,coins:300,tickets:1,xp:0,level:1,cats:[],trips:[null],items:[],rooms:{living:{bowlAt:0}},pity:0,seen:{},nid:1,last:now(),scratchAt:now()+600000};
  const c=newCat(SP.muop,1); c.name='Mướp'; c.room='living'; S.cats.push(c); S.seen.muop=1;
  S.items.push({iid:S.nid++,fid:'box',room:'living',x:330,y:150,flip:false,broken:false});
}
function load(){
  let raw=null; try{raw=JSON.parse(localStorage.getItem(KEY))}catch(e){}
  if(raw&&raw.v===2&&Array.isArray(raw.cats)&&raw.cats.length){S=raw}
  else{
    fresh();
    try{const o=JSON.parse(localStorage.getItem('meoxu_v1')); if(o&&o.cats){S.coins=(o.coins||0)+100*Object.keys(o.cats).length;S.tickets=o.tickets||1;S.level=o.level||1;S.xp=o.xp||0}}catch(e){}
  }
  S.cats=S.cats.filter(c=>SP[c.sp]); S.cats.forEach(c=>{c.traits=c.traits.filter(t=>TRAITS[t]); if(!S.rooms[c.room])c.room='living'});
  S.items=S.items.filter(i=>FURN[i.fid]);
  fixSlots();
  const el=clamp((now()-(S.last||now()))/1000,0,8*3600); if(el>1)tick(el);
}
function save(){S.last=now(); try{localStorage.setItem(KEY,JSON.stringify(S))}catch(e){}}

/* ---------- cấp độ ---------- */
const slotCount=()=>Math.min(5,1+Math.floor((S.level-1)/2));
function fixSlots(){while(S.trips.length<slotCount())S.trips.push(null)}
const xpNeed=()=>30*S.level;
function addXp(n){
  S.xp+=Math.round(n);
  while(S.xp>=xpNeed()){S.xp-=xpNeed();S.level++;const b=S.trips.length;fixSlots();
    const d=DESTS.filter(x=>x.lvl===S.level).map(x=>x.n);
    notify('🎉 Lên cấp '+S.level+'!'+(S.trips.length>b?' Mở thêm 1 ô viễn chinh.':'')+(d.length?' Mở điểm mới: '+d.join(', ')+'.':''));}
}

/* ---------- mèo ---------- */
const catBy=uid=>S.cats.find(c=>c.uid===uid);
const onTrip=uid=>S.trips.some(p=>p&&p.uid===uid);
const has=(c,t)=>c.traits.includes(t);
const tE=(c,k)=>c.traits.reduce((a,t)=>a+(TRAITS[t].e[k]||0),0);
const tM=(c,k)=>c.traits.reduce((a,t)=>a*(TRAITS[t].e[k]||1),1);
const conflict=(a,b)=>CONFLICT.some(p=>(p[0]===a&&p[1]===b)||(p[0]===b&&p[1]===a));
function rollTraits(sp,star){
  const out=[]; if(sp.xt)out.push(sp.xt);
  const aff=(sp.t||'').split(' ').filter(Boolean);
  let guard=0;
  while(out.length<star&&guard++<50){
    const k=Math.random()<STAR[star].good?'g':'b';
    const pool=Object.keys(TRAITS).filter(id=>TRAITS[id].k===k&&!out.includes(id)&&!out.some(o=>conflict(o,id)));
    if(!pool.length)continue;
    const w=pool.map(id=>aff.includes(id)?6:1); let r=Math.random()*w.reduce((a,b)=>a+b,0),i=0;
    while(r>w[i]){r-=w[i];i++}
    out.push(pool[i]);
  }
  return out;
}
function newCat(sp,star){
  return {uid:S.nid++,sp:sp.id,star,sex:Math.random()<(sp.f==null?.5:sp.f)?'f':'m',name:pick(NAMES),traits:rollTraits(sp,star),full:80,en:100,hp:60,room:null,buff:null,petAt:0};
}
function favs(c){const f=[];if(SP[c.sp].fav)f.push(SP[c.sp].fav);c.traits.forEach(t=>{const x=TRAITS[t].e.fav;if(x&&!f.includes(x))f.push(x)});return f}
const buffOf=c=>(c.buff&&c.buff.until>now())?c.buff:{};

/* ---------- phòng & nội thất ---------- */
const ownedRooms=()=>ROOMS.filter(r=>S.rooms[r.id]);
const catsIn=rid=>S.cats.filter(c=>c.room===rid);
const homeCats=rid=>S.cats.filter(c=>c.room===rid&&!onTrip(c.uid));
const totalCap=()=>ownedRooms().reduce((a,r)=>a+r.cap,0);
const freeRoom=()=>{const r=ownedRooms().find(r=>catsIn(r.id).length<r.cap);return r?r.id:null};
const itemsIn=rid=>S.items.filter(i=>i.room===rid);
const roomHas=(rid,fid)=>S.items.some(i=>i.room===rid&&i.fid===fid&&!i.broken);
function gEff(){
  const e={coin:0,speed:0,ticket:0,pet:0,night:0},seen={};
  S.items.forEach(i=>{if(!i.room||i.broken||seen[i.fid])return;seen[i.fid]=1;const g=FURN[i.fid].g;if(g)for(const k in g)e[k]+=g[k]});
  return e;
}
function roomHappy(rid){
  let h=ROOM[rid].happy||0; const seen={};
  itemsIn(rid).forEach(i=>{if(i.broken||seen[i.fid])return;seen[i.fid]=1;h+=FURN[i.fid].happy||0});
  return h;
}
function happyTarget(c){
  const fx=tE(c,'fixedHappy'); if(fx)return fx;
  let h=50+roomHappy(c.room)+tE(c,'self');
  c.traits.forEach(t=>{const e=TRAITS[t].e;if(e.like&&roomHas(c.room,e.like[0]))h+=e.like[1];if(e.outdoor&&ROOM[c.room].outdoor)h+=e.outdoor;if(e.bigRoom&&catsIn(c.room).length>=6)h+=e.bigRoom});
  homeCats(c.room).forEach(o=>{if(o!==c)h+=tE(o,'aura')});
  if(c.full<20)h-=25;
  return clamp(h,0,100);
}
const auraCoin=c=>homeCats(c.room).reduce((a,o)=>a+(o!==c?tE(o,'auraCoin'):0),0);
const auraHunger=c=>homeCats(c.room).reduce((a,o)=>a*(TRAITS_M(o,'auraHunger')),1);
function TRAITS_M(c,k){return tM(c,k)}

/* ---------- thời gian trôi ---------- */
function tick(dt){
  if(S.adm&&S.adm.inf)S.coins=999999999;
  S.cats.forEach(c=>{
    const away=onTrip(c.uid),bf=buffOf(c);
    if(c.buff&&c.buff.until<=now())c.buff=null;
    c.full=clamp(c.full-dt*(100/12000)*tM(c,'hunger')*(bf.hunger||1)*auraHunger(c),0,100);
    if(!away){
      const rg=tM(c,'regen')*(ROOM[c.room].regen||1)*(roomHas(c.room,'bed')?1.15:1)*(c.full<=0?.3:1);
      c.en=clamp(c.en+dt/60*rg,0,100);
      const t=happyTarget(c),step=tE(c,'fixedHappy')?100:dt/60;
      c.hp=Math.abs(t-c.hp)<=step?t:c.hp+Math.sign(t-c.hp)*step;
    }
  });
  let n=0;
  while(now()>=S.scratchAt&&n++<3){S.scratchAt+=600000;scratchCheck()}
  if(now()>=S.scratchAt)S.scratchAt=now()+600000;
}
function scratchCheck(){
  ownedRooms().forEach(r=>{
    const sofa=S.items.find(i=>i.room===r.id&&i.fid==='sofa'&&!i.broken); if(!sofa)return;
    const guard=roomHas(r.id,'post');
    if(homeCats(r.id).some(c=>tE(c,'roomNoScratch')))return;
    for(const c of homeCats(r.id)){
      if(tE(c,'scratch')&&!tE(c,'noScratch')&&Math.random()<(guard?.04:.15)){sofa.broken=true;notify('😾 '+c.name+' đã cào rách sofa ở '+r.n+'!');break}
    }
  });
}
const gMult=()=>S.cats.some(c=>tE(c,'allCoin'))?1.3:1;
const isMonday=()=>new Date().getDay()===1;
const isNight=()=>{const h=new Date().getHours();return h>=19||h<5};

/* ---------- viễn chinh ---------- */
const happyF=c=>tE(c,'alwaysHappy')?1.2:.8+.4*c.hp/100;
function coinCalc(c,d,ctx,rf){
  const acts=[],pc=v=>(v>0?'+':'−')+Math.round(Math.abs(v)*100)+'% xu';
  let add=0,mult=1;
  const np=c.traits.find(t=>TRAITS[t].e.noPenalty);
  c.traits.forEach(t=>{
    const e=TRAITS[t].e,A=(v)=>{if(v<0&&np){acts.push({t:np,txt:'chặn '+pc(v)});return}add+=v;acts.push({t,txt:pc(v)})};
    if(e.coin)A(e.coin);
    if(e.crowd&&d.tags.includes('crowd')&&!(e.crowd<0&&tE(c,'ignoreCrowd')))A(e.crowd);
    if(e.ignoreCrowd&&d.tags.includes('crowd')&&c.traits.some(x=>(TRAITS[x].e.crowd||0)<0))acts.push({t,txt:'bỏ qua phạt đông người'});
    if(e.water&&d.tags.includes('water'))A(e.water);
    if(e.nature&&d.tags.includes('nature'))A(e.nature);
    if(e.night&&ctx.night)A(e.night);
    if(e.sleepyX2&&ctx.sleepy){mult*=2;acts.push({t,txt:'xu ×2'})}
    if(e.monday)A(ctx.monday?-.2:.15);
  });
  const g=gEff();
  add+=g.coin+(ctx.night?g.night:0)+(ctx.bc||0)+(ctx.ac||0);
  if(gMult()>1){mult*=gMult();acts.push({t:'v_maneki',txt:'+30% xu'})}
  const coins=d.coin*STAR[c.star].m*Math.max(.3,1+add)*(ctx.hf||1)*mult*(rf||1);
  return {coins,acts};
}
function tripInfo(c,did){
  const d=DEST[did],g=gEff(),bf=buffOf(c);
  const dur=d.min*60000*clamp(1-(g.speed+tE(c,'speed')+(bf.speed||0)),.4,1.6);
  const cost=Math.round(d.en*tM(c,'cost'));
  let why='';
  if(onTrip(c.uid))why='Đang đi vắng'; else if(c.full<20)why='Đang đói'; else if(c.en<cost)why='Không đủ sức (cần '+cost+'⚡)';
  const ctx={night:isNight(),monday:isMonday(),sleepy:c.en<50,hf:happyF(c),bc:bf.coin||0,ac:auraCoin(c)};
  return {dur,cost,why,ctx,est:Math.round(coinCalc(c,d,ctx).coins)};
}
function startTrip(slot,uid,did){
  const c=catBy(uid),d=DEST[did]; if(!c||S.trips[slot]||d.lvl>S.level)return false;
  const inf=tripInfo(c,did); if(inf.why)return false;
  c.en-=inf.cost;
  S.trips[slot]=Object.assign({uid,dest:did,start:now(),end:now()+inf.dur,dur:inf.dur},inf.ctx);
  save(); return true;
}
function claimTrip(slot){
  const p=S.trips[slot]; if(!p||now()<p.end)return null;
  const c=catBy(p.uid),d=DEST[p.dest];
  S.trips[slot]=null; if(!c){save();return null}
  const r=coinCalc(c,d,p,rnd(.92,1.12)),g=gEff();let m2=1,dbl=false;
  const res={cat:c,dest:d,coins:0,acts:r.acts,item:pick(LOOT),ticket:0,bonus:0,happy:Math.round(c.hp)};
  c.traits.forEach(t=>{const e=TRAITS[t].e;
    if(e.doubleCoin&&Math.random()<e.doubleCoin){m2*=2;res.acts.push({t,txt:'xu ×2'})}
    if(e.gamble){const k=rnd(e.gamble[0],e.gamble[1]);m2*=k;res.acts.push({t,txt:'xu ×'+k.toFixed(1).replace('.',',')})}
    if(e.jackpot&&Math.random()<.0456){res.bonus+=456;res.acts.push({t,txt:'trúng 456 xu!'})}
    if(e.doubleAll&&Math.random()<e.doubleAll){dbl=true;res.acts.push({t,txt:'nhân đôi phần thưởng'})}
  });
  if(Math.random()<.08+g.ticket+tE(c,'ticket')){res.ticket=1;c.traits.forEach(t=>{if(TRAITS[t].e.ticket)res.acts.push({t,txt:'nhặt được vé'})})}
  if(Math.random()<tE(c,'loot')){res.bonus+=15;c.traits.forEach(t=>{if(TRAITS[t].e.loot)res.acts.push({t,txt:'+15 xu chiến lợi phẩm'})})}
  res.coins=Math.round(r.coins*m2);
  if(dbl){res.coins*=2;res.bonus*=2;res.ticket*=2}
  S.tickets+=res.ticket;
  S.coins+=res.coins+res.bonus;
  res.xp=Math.round(10*Math.pow(d.min/10,.8)*tM(c,'xp'));
  if(tM(c,'xp')>1)c.traits.forEach(t=>{if(TRAITS[t].e.xp)res.acts.push({t,txt:'+50% kinh nghiệm'})});
  addXp(res.xp); save(); return res;
}

/* ---------- cho ăn ---------- */
const bowlReady=rid=>now()>=(S.rooms[rid].bowlAt||0);
function feedRoom(rid,fid){
  const f=FOOD[fid],cats=homeCats(rid);
  if(!bowlReady(rid)||S.coins<f.price||!cats.length)return null;
  S.coins-=f.price;
  const chef=cats.some(c=>tE(c,'chef')),thank=4+(roomHas(rid,'tank')?2:0),loved=[];
  cats.forEach(c=>{
    const fav=favs(c).includes(fid); if(fav)loved.push(c.name);
    let gain=f.full*(fav?1.2:1)*(chef?1.25:1); if(fid==='kibble'&&tE(c,'picky'))gain*=.5;
    c.full=clamp(c.full+gain,0,100);
    c.hp=clamp(c.hp+(f.hp||0)+(fav?10:0),0,100);
    c.en=clamp(c.en+(f.en||0),0,100);
    if(f.buff)c.buff=Object.assign({food:fid,until:now()+f.min*60000*(fav?1.5:1)},f.buff);
  });
  const coins=Math.round(thank*cats.length*gMult()); S.coins+=coins;
  S.rooms[rid].bowlAt=now()+600000; addXp(5); save();
  return {coins,loved,n:cats.length};
}
function petCat(c){
  if(now()-(c.petAt||0)<20000)return 0;
  c.petAt=now();
  const n=Math.round((1+gEff().pet+tE(c,'pet'))*gMult()); S.coins+=n;
  c.hp=clamp(c.hp+3*(tE(c,'petHappy')||1),0,100);
  addXp(1); save(); return n;
}

/* ---------- gacha ---------- */
function gachaRoll(useTicket,opt){
  opt=opt||{}; // opt chỉ dùng cho Admin: {free, star}
  if(!opt.free&&S.cats.length>=totalCap())return {err:'Nhà hết chỗ rồi. Hãy mở thêm phòng hoặc cho bớt mèo đi nhận nuôi.'};
  if(!opt.free){if(useTicket){if(S.tickets<1)return {err:'Hết vé.'};S.tickets--}else{if(S.coins<GACHA_COST)return {err:'Không đủ xu.'};S.coins-=GACHA_COST}}
  S.pity++;
  let r=Math.random()*100,star=1,acc=0;
  for(let s=5;s>=1;s--){acc+=STAR[s].p;if(r<acc){star=s;break}}
  if(S.pity>=PITY&&star<4)star=4;
  if(opt.star)star=opt.star;
  if(star>=4)S.pity=0;
  const vs=VARIANTS.filter(v=>v.r===star),bs=BREEDS.filter(b=>b.r===star);
  const sp=(vs.length&&Math.random()<.45)?pick(vs):pick(bs);
  const c=newCat(sp,star); c.room=freeRoom()||'living'; c.isNew=!S.seen[sp.id];
  S.cats.push(c); S.seen[sp.id]=1; addXp(3); save();
  return {cat:c};
}
function rehome(uid){
  const c=catBy(uid); if(!c||onTrip(uid)||S.cats.length<=1)return 0;
  S.cats=S.cats.filter(x=>x!==c); const v=STAR[c.star].sell; S.coins+=v; save(); return v;
}
function moveCat(uid,rid){
  const c=catBy(uid); if(!c||!S.rooms[rid]||onTrip(uid)||catsIn(rid).length>=ROOM[rid].cap)return false;
  c.room=rid; save(); return true;
}

/* ---------- mua sắm ---------- */
function buyItem(fid,rid,x){
  const f=FURN[fid]; if(S.coins<f.price)return null;
  S.coins-=f.price;
  const it={iid:S.nid++,fid,room:rid,x:clamp(x,f.w/2,WORLD_W-f.w/2),y:f.kind==='wall'?70:rnd(125,160),flip:false,broken:false};
  S.items.push(it); addXp(8); save(); return it;
}
function repairCost(it){return Math.round(FURN[it.fid].price*.3)}
function repairItem(iid){const it=S.items.find(i=>i.iid===iid);if(!it||!it.broken||S.coins<repairCost(it))return false;S.coins-=repairCost(it);it.broken=false;save();return true}
function buyRoom(rid){const r=ROOM[rid];if(S.rooms[rid]||S.coins<r.price)return false;S.coins-=r.price;S.rooms[rid]={bowlAt:0};addXp(20);save();return true}
function clampItem(it){
  const f=FURN[it.fid];
  it.x=clamp(it.x,f.w/2,WORLD_W-f.w/2);
  it.y=f.kind==='wall'?clamp(it.y,f.h+4,WALL_Y-4):clamp(it.y,FLOOR_MIN,FLOOR_MAX+2);
}
function skipTime(){
  S.trips.forEach(p=>{if(p)p.end-=600000});
  for(const k in S.rooms)S.rooms[k].bowlAt-=600000;
  S.cats.forEach(c=>{if(c.buff)c.buff.until-=600000});
  S.scratchAt-=600000; tick(600); save();
}
