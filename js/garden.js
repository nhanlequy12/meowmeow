"use strict";
/* ============ VƯỜN NHỎ (2026-11-12): luật, không đụng DOM ============
   Dữ liệu và số cân bằng: js/garden-data.js. Nạp sau js/stray.js, trước js/ui.js (để phần bù thời gian vắng lúc tải game cũng tính).
   game.js gọi gardenTick(dt,sim) cuối tick. Mỗi chậu, luống đọc khí hậu thật của phòng (roomClimate): nhiệt độ (đã tính sưởi, quạt),
   mưa (đã trừ mái che), gió, và thời tiết ngoài trời (nắng ban ngày). Hồ cá: it.fp. Giỏ vườn: S.gd={inv:{cây:số}, h: số lần thu hoạch}. */
const gdOpen=()=>S.level>=GD_LV||!!(S.gd&&S.gd.u);
const gdBox=()=>S.gd||(S.gd={inv:{},h:0});
const gdPlanter=it=>!!(it&&FURN[it.fid]&&FURN[it.fid].gd);
const gdPond=it=>!!(it&&FURN[it.fid]&&FURN[it.fid].pond);
const gdRoomOk=rid=>GD_ROOMS.includes(rid);
// khởi tạo trạng thái (món mua mới, quà quản trị, bản lưu cũ)
function gdInit(it){
  if(gdPlanter(it)&&!it.gd)it.gd={c:null,p:0,wa:60,hp:100};
  if(gdPond(it)&&!it.fp)it.fp={n:GDC.fish.start,fed:0,b:0};
  return it;
}
const gdItems=()=>S.items.filter(i=>i.room!=null&&(gdPlanter(i)||gdPond(i))&&gdRoomOk(i.room));
// điều kiện lúc này cho chậu ở phòng rid: hệ số lớn, hệ số khô, các tác hại; why = danh sách lý do để giao diện kể ra
function gdEnv(rid){
  const rc=roomClimate(rid),o=rc.o,T=rc.T,day=typeof pwDayK==='function'?pwDayK()>0:true,se=wxSeason(wxClock()).id;
  const sunny=day&&/^(sunny|ideal|hot|heatwave)$/.test(o.type)&&rc.out;
  const why=[];
  let grow=GDC.season[se]||1,dry=1,dmg=0,fill=rc.rain>=.15?rc.rain*GDC.rainFill:0;
  if(se==='spring')why.push(['g','🌸 Mùa xuân: cây lớn nhanh hơn']);else if(se==='winter')why.push(['y','⛄ Mùa đông: cây lớn chậm']);
  if(!day){grow*=GDC.night;why.push(['b','🌙 Ban đêm: cây lớn chậm một nửa'])}
  else if(sunny){grow*=GDC.sun;why.push(['g','☀️ Có nắng: cây lớn nhanh hơn'])}
  if(fill)why.push(['g','🌧️ Mưa đang tưới cây']);
  if(T<=0){grow=0;dmg+=GDC.frost;why.push(['r','🥶 '+T+'°C: rét đậm, cây bị dập lá'])}
  else if(T<8){grow*=.3;why.push(['y','❄️ '+T+'°C: lạnh, cây gần như không lớn'])}
  else if(T<14){grow*=.6;why.push(['y','🌡️ '+T+'°C: hơi lạnh, cây lớn chậm'])}
  else if(T>=38){grow*=.3;dmg+=GDC.scorch;dry*=2.2;why.push(['r','🔥 '+T+'°C: nóng gắt, cây bị cháy lá, đất khô rất nhanh'])}
  else if(T>32){grow*=.7;dry*=1.8;why.push(['y','🔥 '+T+'°C: nóng, đất khô nhanh'])}
  else if(T>27){dry*=1.3}
  if(sunny)dry*=1.2;
  if(rc.wind>=.4){dry*=1+rc.wind*.5;why.push(['y','💨 Gió: đất khô nhanh hơn'])}
  if(rc.rain>=.7&&rc.wind>=.5){dmg+=GDC.storm;grow*=.5;why.push(['r','⛈️ Mưa to gió lớn quật cây'])}
  if(!rc.out&&rid==='greenhouse')why.push(['g','🪴 Nhà kính che mưa gió, nhưng phải tự tưới']);
  return {rc,T,grow,dry,dmg,fill,why,day,sunny};
}
const gdStage=g=>!g.c?0:g.p>=1?3:g.p>=.34?2:1;
const gdThirsty=g=>g.wa<15||(g.c&&g.hp<40);
// biến thể hình (js/furn/gd-*.js): '', 'dry', <cây><1..3>[d], 'dead'; hồ: f<n>[a], 'ice'
function gdVar(it){
  if(gdPond(it)){const fp=it.fp||{n:0};if(it.room&&roomClimate(it.room).T<=0)return 'ice';return 'f'+Math.min(6,fp.n)+(Math.floor(performance.now()/650+it.iid)%2?'a':'')}
  const g=it.gd;if(!g)return '';if(g.dead)return 'dead';
  if(!g.c)return g.wa<25?'dry':'';
  return g.c+gdStage(g)+(gdThirsty(g)?'d':'');
}
// tốc độ lớn mỗi phút lúc này (0..), và số phút còn lại tới khi chín theo tốc độ đó (null nếu đang không lớn)
function gdRate(it,env){const g=it.gd,C=GCROP[g.c];if(!C||g.dead||g.wa<=0)return 0;return env.grow*(g.hp<30?.5:1)/C.grow}
function gdEta(it){const g=it.gd;if(!g||!g.c||g.dead||g.p>=1)return 0;const r=gdRate(it,gdEnv(it.room));return r>0?Math.ceil((1-g.p)/r):null}
function gardenTick(dt,sim){
  if(!gdOpen())return;
  if(S.level>=GD_LV&&!gdBox().u)S.gd.u=1;
  const m=dt/60,t=now(),EN={};
  for(const it of gdItems()){
    gdInit(it);const env=EN[it.room]||(EN[it.room]=gdEnv(it.room));
    if(it.gd){const g=it.gd;
      g.wa=clamp(g.wa+(env.fill?env.fill:-GDC.dry*env.dry)*m,0,100);
      if(!g.c||g.dead)continue;
      let hurt=env.dmg;if(g.wa<=0)hurt+=GDC.thirst;
      if(hurt)g.hp=clamp(g.hp-hurt*m,0,100);else if(g.wa>20)g.hp=clamp(g.hp+GDC.heal*m,0,100);
      if(g.hp<=0){g.dead=1;g.p=Math.min(g.p,.99);if(!sim)notify(GCROP[g.c].n+' trong '+FURN[it.fid].n.toLowerCase()+' ('+ROOM[it.room].n+') đã chết khô. Dọn chậu rồi gieo lại nhé.',{icon:'🥀',title:'Vườn nhỏ',key:'gddead'});continue}
      if(g.p<1){g.p=Math.min(1,g.p+gdRate(it,env)*m);
        if(g.p>=1&&!g.rn){g.rn=1;notify(GCROP[g.c].ic+' '+GCROP[g.c].n+' ở '+ROOM[it.room].n+' đã chín, chạm vào để thu hoạch.',{icon:'🧺',title:'Vườn nhỏ',key:'gdripe',mtitle:'Rau chín'})}}
      if(!sim&&g.wa<=0&&!g.tw){g.tw=1;notify('Đất khô kiệt, '+GCROP[g.c].n.toLowerCase()+' ở '+ROOM[it.room].n+' đang héo. Chạm vào chậu để tưới.',{icon:'🥀',title:'Vườn nhỏ',key:'gdthirst'})}
      if(g.wa>20)delete g.tw;
    }
    if(it.fp){const fp=it.fp,F=GDC.fish;
      if(fp.fed>t&&fp.n<F.max&&env.T>0){fp.b=(fp.b||0)+m/F.breed;
        if(fp.b>=1){fp.b=0;fp.n++;notify('Hồ cá ở '+ROOM[it.room].n+' có thêm một chú cá con ('+fp.n+' con).',{icon:'🐟',title:'Vườn nhỏ',key:'gdfish'})}}
    }
  }
}
/* ---------- hành động: trả '' nếu được, hoặc lý do không được ---------- */
const gdIt=iid=>S.items.find(i=>i.iid===iid&&i.room!=null);
function gdPlant(iid,cid){
  const it=gdIt(iid),C=GCROP[cid];if(!gdPlanter(it)||!C)return 'Không gieo được.';gdInit(it);
  if(it.gd.c&&!it.gd.dead)return 'Chậu đang có cây.';
  if(S.level<C.ul)return C.n+' mở ở cấp '+C.ul+'.';
  if(S.coins<C.seed)return 'Không đủ xu (cần '+C.seed+').';
  S.coins-=C.seed;it.gd={c:cid,p:0,wa:Math.max(it.gd.wa,30),hp:100,t:now()};onAct('plant',1);save();return '';
}
function gdWater(iid){const it=gdIt(iid);if(!gdPlanter(it))return 'Không tưới được.';gdInit(it);if(it.gd.wa>=95)return 'Đất còn ẩm, chưa cần tưới.';it.gd.wa=100;delete it.gd.tw;onAct('water_g',1);save();return ''}
function gdWaterAll(rid){let n=0;gdItems().filter(i=>i.gd&&(!rid||i.room===rid)&&i.gd.wa<95).forEach(i=>{i.gd.wa=100;delete i.gd.tw;n++});if(n){onAct('water_g',n);save()}return n}
function gdClear(iid){const it=gdIt(iid);if(!gdPlanter(it))return 'Không dọn được.';gdInit(it);it.gd={c:null,p:0,wa:it.gd.wa,hp:100};save();return ''}
// số quả nhận được: số của cây × hệ số chậu, cây khỏe (sức ≥ 80) thêm một nửa, cây yếu (dưới 40) còn một nửa; ít nhất 1
function gdYield(it){const g=it.gd,C=GCROP[g.c];const k=g.hp>=80?1.5:g.hp<40?.5:1;return Math.max(1,Math.round(C.yield*FURN[it.fid].gd.mult*k))}
function gdHarvest(iid){
  const it=gdIt(iid);if(!gdPlanter(it)||!it.gd||!it.gd.c||it.gd.dead)return {err:'Chưa có gì để thu hoạch.'};
  if(it.gd.p<1)return {err:'Cây chưa chín.'};
  const cid=it.gd.c,n=gdYield(it),B=gdBox();B.inv[cid]=(B.inv[cid]||0)+n;B.h=(B.h||0)+1;
  it.gd={c:null,p:0,wa:it.gd.wa,hp:100};addXp(GDC.xp);onAct('harvest',1);save();return {cid,n};
}
const gdHas=need=>Object.entries(need).every(([k,q])=>(gdBox().inv[k]||0)>=q);
function gdCook(rid){
  const R=GRECIPES.find(r=>r.id===rid);if(!R)return {err:'Không có món này.'};
  if(!gdHas(R.need))return {err:'Chưa đủ nguyên liệu.'};
  const B=gdBox();Object.entries(R.need).forEach(([k,q])=>{B.inv[k]-=q;if(!B.inv[k])delete B.inv[k]});
  S.fdinv=S.fdinv||{};S.fdinv[R.food]=(S.fdinv[R.food]||0)+R.q;onAct('cook',1);save();return {food:R.food,n:R.q};
}
/* ---------- hồ cá ---------- */
function gdFeedFish(iid){const it=gdIt(iid);if(!gdPond(it))return 'Không có hồ.';gdInit(it);const F=GDC.fish;
  if(it.fp.fed-now()>F.fed*60000*.5)return 'Cá còn no.';if(S.coins<F.feed)return 'Không đủ xu.';
  S.coins-=F.feed;it.fp.fed=now()+F.fed*60000;save();return ''}
function gdSellFish(iid){const it=gdIt(iid);if(!gdPond(it))return 'Không có hồ.';gdInit(it);if(it.fp.n<=1)return 'Giữ lại ít nhất một chú cá.';it.fp.n--;S.coins+=GDC.fish.sell;save();return ''}
function gdBuyFish(iid){const it=gdIt(iid);if(!gdPond(it))return 'Không có hồ.';gdInit(it);const F=GDC.fish;if(it.fp.n>=F.max)return 'Hồ đã đủ '+F.max+' chú cá.';if(S.coins<F.buy)return 'Không đủ xu (cần '+F.buy+').';S.coins-=F.buy;it.fp.n++;save();return ''}
/* ---------- bát mồi bằng rau vườn cho bé đi lạc (js/stray.js) ---------- */
function gdLure(uid,cid){
  const s=typeof strayOf==='function'&&strayOf(uid);if(!s)return {err:'Bé không đi lạc.'};if(s.lure)return {err:'Đã đặt bát mồi rồi.'};
  const B=gdBox();if(!GLURE[cid]||!(B.inv[cid]>0))return {err:'Không còn '+(GCROP[cid]||{n:'rau'}).n.toLowerCase()+' trong giỏ vườn.'};
  B.inv[cid]--;if(!B.inv[cid])delete B.inv[cid];const min=GLURE[cid];
  s.lure={food:'g:'+cid,end:now()+min*60000};save();return {min};
}
