"use strict";
/* Kiểm thử nước uống, bệnh tật, thuốc, bệnh viện, chấn thương viễn chinh (chạy: node tools/medtest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, game.js, wx.js, pw.js, med.js, meal.js. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path'),cp=require('child_process');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},set S(v){S=v},fresh,newCat,tick,load,save,wxs,wxFeel,wxOverride,fillWater,wxDrink,buyDrink,drinkStock,bowlList,wbowls,invN,medAdd,medCure,medUse,medCan,buyMed,medStatus,ills,inHosp,
    hospPlan,hospAdmit,hospLeft,medTripClaim,injOdds,medTripWhy,tripInfo,startTrip,claimTrip,homeCats,onTrip,medOpen,happyTarget,medRegen,SP,FURN,DIS,MED,MEDS,DRINK,DRINKS,MEDC,INJ,WXC,DEST,MED_COMPLEX,MED_LV,
    setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000;T.setNotify(()=>{});
const reset=lv=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=100000;S.level=lv||5;if(S.level>=2)S.wxU=1;T.wxOverride('ty','sunny');T.wxOverride('se',0);T.wxOverride('hr',12);T.tick(0);return S};
const cat=(room)=>{const c=T.newCat(T.SP.muop,1);c.room=room||'living';c.en=80;c.hp=70;c.full=90;T.S.cats.push(c);return c};
const run=(min,step)=>{for(let i=0;i<min;i+=(step||1)){T.setToff(T.TOFF+(step||1)*MIN);T.tick((step||1)*60)}};
const bowl=()=>T.wbowls('living')[0];
// uống không còn tức thì (js/meal.js): bé được giao bát, đi tới bát, uống vài giây rồi mới cộng chỉ số. sip(c) tua từng giây tới khi bé uống xong.
const sec=s=>{for(let i=0;i<s;i++){T.setToff(T.TOFF+1000);T.tick(1)}};
const sip=c=>{for(let i=0;i<40&&(i<1||c.meal);i++)sec(1)};
const near=(a,b)=>Math.abs(a-b)<1; // trôi tự nhiên trong vài giây tua (khát, sức khỏe, thoải mái) nhỏ hơn 1 điểm

// 1. nước uống ở cấp 1
{
  const S=reset(1),c=cat();T.tick(1);
  ok('Cấp 1: được tặng bát nước và '+T.MEDC.starter+' chai Nước lọc một lần',bowl()&&T.invN('w_plain')===T.MEDC.starter&&S.med.gw===1);
  T.tick(1);ok('Quà nước không phát lại',T.invN('w_plain')===T.MEDC.starter);
  const w0=c.wa;run(60);ok('Cấp 1: nước của bé giảm theo thời gian',c.wa<w0-15&&c.wa>w0-25,w0.toFixed(1)+' → '+c.wa.toFixed(1));
  c.wa=50;bowl().w=2;bowl().wl=['w_plain','w_special'];T.tick(1);sip(c);
  ok('Bé khát tự uống đúng loại nước trong bát (Nước đặc biệt +60)',c.wa>=99&&bowl().w===1&&bowl().wl.length===1,'nước '+c.wa.toFixed(0)+', bát còn '+bowl().w);
  bowl().w=0;bowl().wl=[];const st=T.invN('w_plain'),r=T.fillWater('living');
  ok('Đổ nước trừ đúng số chai trong kho',r.n===8&&T.invN('w_plain')===st-8&&bowl().w===8,'rót '+r.n+', kho '+st+' → '+T.invN('w_plain'));
  ok('Bát đầy thì không rót thêm, không trừ kho',T.fillWater('living').full===1&&T.invN('w_plain')===st-8);
  bowl().w=0;bowl().wl=[];S.inv={};const r2=T.fillWater('living');ok('Hết nước trong kho thì không đổ được (nước không còn miễn phí)',r2.empty===1&&bowl().w===0);
  const b=T.buyDrink('w_mineral',3);ok('Mua nước theo số lượng, trừ đúng xu',b.cost===36&&T.invN('w_mineral')===3&&S.coins===100000-36);
  S.coins=3;ok('Thiếu xu thì không mua được',!!T.buyDrink('w_plain',1).err&&S.coins===3);
  c.wa=10;const hp=T.happyTarget(c);c.wa=90;ok('Cấp 1: khát thì kém vui và hồi năng lượng chậm',T.happyTarget(c)-hp===15&&(c.wa=10,T.medRegen(c))===.7);
}
// 2. hiệu ứng từng loại nước, máy lọc nước
{
  const S=reset(5),c=cat();
  ok('6 loại nước đúng giá và lượng nước',JSON.stringify(T.DRINKS.map(d=>[d.price,d.wa]))==='[[5,20],[12,35],[25,50],[40,50],[60,40],[100,60]]');
  c.wa=40;c.he=50;T.wxs(c).hx=100;bowl().w=1;bowl().wl=['w_electro'];T.wxDrink('living');
  ok('Gọi uống chỉ giao bát, chưa cộng nước',c.meal&&c.meal.k==='w'&&c.wa===40&&bowl().wl.length===1);sip(c);
  ok('Nước điện giải: +50 nước, hạ nhiệt',near(c.wa,90)&&T.wxs(c).hx<=40&&!bowl().wl.length,'nước '+c.wa.toFixed(1)+', phơi nóng '+T.wxs(c).hx.toFixed(0));
  c.wa=40;c.he=50;bowl().w=1;bowl().wl=['w_nutri'];T.wxDrink('living');sip(c);ok('Nước dinh dưỡng: +40 nước, +5 sức khỏe',near(c.wa,80)&&near(c.he,55),'nước '+c.wa.toFixed(1)+', sức khỏe '+c.he.toFixed(1));
  c.wa=30;c.cf=50;bowl().w=1;bowl().wl=['w_special'];T.wxDrink('living');sip(c);ok('Nước đặc biệt: +60 nước, +5 thoải mái',near(c.wa,90)&&near(c.cf,55),'nước '+c.wa.toFixed(1)+', thoải mái '+c.cf.toFixed(1));
  // máy lọc nước
  S.items=S.items.filter(i=>!T.FURN[i.fid].water);S.items.push({iid:S.nid++,fid:'waterfilter',room:'living',x:200,y:150,w:0,currentBattery:480});
  S.inv={w_plain:5};c.wa=100;T.wxDrink('living');const f=bowl();
  ok('Máy lọc nước chỉ rót nước đang có trong kho',f.w===5&&T.invN('w_plain')===0,'bát '+f.w+', kho '+T.invN('w_plain'));
  f.wat=0;T.wxDrink('living');ok('Kho hết thì máy không tự tạo ra nước',f.w===5);
}
// 3. vắng mặt 8 giờ không có nước: không nguy hiểm, không phát bệnh
{
  const S=reset(6),c=cat();S.inv={};bowl().w=0;bowl().wl=[];c.wa=30;T.save();
  const sv=JSON.parse(STORE);sv.last=Date.now()-8*3600*1000;STORE=JSON.stringify(sv);T.load();const d=T.S.cats[0];
  ok('Vắng 8 giờ hết nước: bé vẫn an toàn, không mắc bệnh mới',d.he>=T.WXC.away.health&&d.wa>=T.WXC.away.water&&!T.ills(d).length,'sức khỏe '+d.he.toFixed(0)+', nước '+d.wa.toFixed(0));
}
// 4. bệnh chỉ phát sinh khi Nhà thuốc đã mở; mất nước khi cạn nước lâu
{
  let S=reset(2),c=cat();S.inv={};bowl().w=0;bowl().wl=[];c.wa=0;run(120);
  ok('Trước cấp '+T.MED_LV+' không phát bệnh mới (không có bệnh không chữa được)',!T.ills(c).length&&!T.medOpen());
  S=reset(3);c=cat();S.inv={};bowl().w=0;bowl().wl=[];c.wa=0;run(200);
  ok('Từ cấp '+T.MED_LV+': cạn nước lâu thì mắc Mất nước',T.ills(c).some(e=>e.k==='dehyd'),T.ills(c).map(e=>e.k).join());
  ok('Mỗi đợt bệnh có mã riêng, có ghi hồ sơ',T.ills(c)[0].eid>0&&S.med.log.some(l=>l.ev==='ill'));
  S=reset(5);let n=0;for(let i=0;i<20;i++){cat()}for(let i=0;i<300;i++){T.S.cats.forEach(c=>{c.full=90;c.wa=Math.max(c.wa,70)});run(2,2)}T.S.cats.forEach(c=>{n+=T.ills(c).length});
  ok('Phòng tốt, đủ nước, trời đẹp: 20 bé sống 10 giờ không bé nào bệnh',n===0,n+' ca');
}
// 5. cảm lạnh nối với trạng thái Ốm của thời tiết
{
  const S=reset(5),c=cat();T.wxs(c).sk=90;T.tick(1);
  ok('Trạng thái Ốm thành đợt bệnh Cảm lạnh',T.ills(c).some(e=>e.k==='cold')&&T.medStatus(c)==='ill');
  T.wxs(c).sk=0;T.tick(1);ok('Hết Ốm thì đợt bệnh đóng lại (tự khỏi)',!T.ills(c).length&&S.med.log[0].ev==='self');
}
// 6. thuốc điều trị: tỉ lệ khỏi, tối đa 2 lần thử, trừ đúng một món
{
  const rates={};
  for(const m of T.MEDS.filter(m=>m.kind==='cure')){let cured=0,N=6000;const S=reset(5),c=cat();S.inv[m.id]=N;
    for(let i=0;i<N;i++){delete c.ill;const e=T.medAdd(c,'fever',1);if(T.medUse(c.uid,e.eid,m.id).cured)cured++}rates[m.id]=cured/N;
    ok(m.n+': tỉ lệ khỏi khoảng '+Math.round(m.rate*100)+'%, mỗi lần trừ đúng 1 món',Math.abs(cured/N-m.rate)<.025&&T.invN(m.id)===0,(cured/N*100).toFixed(1)+'%')}
  ok('Bảng giá và tỉ lệ thuốc đúng yêu cầu',JSON.stringify(T.MEDS.filter(m=>m.kind==='cure').map(m=>[m.price,m.rate]))==='[[50,0.3],[120,0.5],[250,0.7],[500,0.9]]');
  const S=reset(5),c=cat();S.inv.t_basic=50;let e,tries=0;
  for(let k=0;k<200&&!(e&&e.fail);k++){delete c.ill;e=T.medAdd(c,'derm',1);T.medUse(c.uid,e.eid,'t_basic');if(c.ill)T.medUse(c.uid,e.eid,'t_basic');e=c.ill&&c.ill[0]}
  const n0=T.invN('t_basic'),r=T.medUse(c.uid,e.eid,'t_basic');
  ok('Thử đủ 2 lần không khỏi: không cho thử nữa, phải đến bệnh viện, không trừ thuốc',e.tries===2&&e.fail===1&&!!r.err&&T.invN('t_basic')===n0,r.err);
  ok('Thuốc không khỏi vẫn giảm nhẹ triệu chứng',e.rel>Date.now());
  // tải lại không đổi kết quả
  const S2=reset(5),c2=cat();S2.inv.t_good=1;const e2=T.medAdd(c2,'fever',1);T.save();const snap=STORE;
  const outs=[];for(let i=0;i<8;i++){STORE=snap;T.load();const r=T.medUse(T.S.cats[0].uid,e2.eid,'t_good');outs.push(r.cured?1:0)}
  ok('Tải lại bản lưu rồi dùng thuốc: kết quả luôn như nhau (không thử lại được)',outs.every(v=>v===outs[0]),outs.join(''));
  STORE=snap;T.load();T.medUse(T.S.cats[0].uid,e2.eid,'t_good');const sv=JSON.parse(STORE);
  ok('Kết quả dùng thuốc được lưu ngay',(sv.inv.t_good|0)===0&&(sv.med.log[0].ev==='cure'||sv.med.log[0].ev==='fail'));
}
// 7. thuốc giảm triệu chứng, dụng cụ, ca chỉ bệnh viện chữa được
{
  const S=reset(5),c=cat();S.inv={m_fever:3,m_itch:2,t_special:2,bandage:1,splint:2,tonic:2};
  const e=T.medAdd(c,'fever',1),r=T.medUse(c.uid,e.eid,'m_fever');
  ok('Thuốc giảm triệu chứng: không chữa khỏi, giảm triệu chứng 30 phút',r.ok&&!r.cured&&T.ills(c).length===1&&e.rel>Date.now());
  ok('Không dùng chồng để cộng dồn',!!T.medUse(c.uid,e.eid,'m_fever').err&&T.invN('m_fever')===2);
  ok('Thuốc sai nhóm bệnh thì không dùng được',!!T.medUse(c.uid,e.eid,'m_itch').err&&T.invN('m_itch')===2);
  const en0=c.en;run(10);const d1=en0-c.en;c.ill[0].rel=0;const en1=c.en;run(10);const d2=en1-c.en;
  ok('Đang có thuốc giảm triệu chứng thì mất sức ít hơn',d1<d2,'10 phút: '+d1.toFixed(1)+' so với '+d2.toFixed(1));
  delete c.ill;const hs=T.medAdd(c,'heatstroke',1);ok('Sốc nhiệt: thuốc thường không chữa được',!!T.medUse(c.uid,hs.eid,'t_special').err&&T.invN('t_special')===2&&T.medStatus(c)==='sev');
  delete c.ill;const fr=T.medAdd(c,'fracH',1);ok('Gãy chân: thuốc không chữa được',!!T.medUse(c.uid,fr.eid,'t_special').err);
  ok('Nẹp chỉ cố định tạm, không chữa khỏi gãy chân',T.medUse(c.uid,fr.eid,'splint').ok&&fr.sp===1&&T.ills(c).length===1&&!!T.medUse(c.uid,fr.eid,'splint').err);
  ok('Gãy chân thì không đi viễn chinh được',!!T.tripInfo(c,'alley').why&&/gãy chân/.test(T.tripInfo(c,'alley').why),T.tripInfo(c,'alley').why);
  delete c.ill;const sc=T.medAdd(c,'scratch',1);ok('Băng gạc chữa khỏi trầy xước',T.medUse(c.uid,sc.eid,'bandage').cured&&!T.ills(c).length);
  c.en=20;ok('Vật phẩm hỗ trợ phục hồi: +năng lượng, có thời gian chờ',T.medUse(c.uid,null,'tonic').ok&&c.en===50&&!!T.medUse(c.uid,null,'tonic').err&&T.invN('tonic')===1);
}
// 8. bệnh viện
{
  const S=reset(5),c=cat(),o=cat();
  const want={cold:300,digest:350,diarrhea:350,derm:400,allergy:400,fever:450,dehyd:500,hypo:600,heatex:600,heatstroke:900,sprain:700,fracH:1200,fracF:1200};
  ok('Viện phí từng bệnh đúng bảng',Object.entries(want).every(([k,v])=>T.DIS[k].cost===v)&&T.MED_COMPLEX===1800);
  ok('Bé khỏe thì không nhập viện',!!T.hospPlan(c.uid).err);
  T.medAdd(c,'fever',1);T.medAdd(c,'derm',1);const p=T.hospPlan(c.uid);
  ok('Nhiều bệnh: liệt kê từng bệnh và tổng viện phí',p.list.length===2&&p.total===850&&p.min===60,p.list.map(x=>x.D.n+' '+x.cost).join(', ')+' = '+p.total);
  const coins=S.coins;T.hospAdmit(c.uid);
  ok('Nhập viện: trừ đúng viện phí một lần',S.coins===coins-850&&T.inHosp(c.uid)&&S.hosp[c.uid].until-S.hosp[c.uid].t0===60*MIN);
  ok('Không nhập viện hai lần, không trừ xu lần hai',!!T.hospAdmit(c.uid).err&&S.coins===coins-850);
  ok('Đang nằm viện: không ở trong phòng, không đi viễn chinh, không dùng thuốc',T.homeCats('living').length===1&&T.tripInfo(c,'alley').why==='Đang nằm viện'&&!T.startTrip(0,c.uid,'alley')&&!!T.medCan(c,c.ill[0],T.MED.t_basic));
  ok('Bé khác vẫn đi viễn chinh bình thường',T.startTrip(0,o.uid,'alley')===true);
  c.en=10;run(59);ok('Sau 59 phút vẫn đang điều trị',T.inHosp(c.uid)&&T.hospLeft(c.uid)>0);
  run(2);ok('Sau 60 phút: ra viện, khỏi các bệnh đã nhập viện, năng lượng chưa đầy',!T.inHosp(c.uid)&&!T.ills(c).length&&c.en>=40&&c.en<100&&T.homeCats('living').includes(c),'năng lượng '+c.en.toFixed(0));
  ok('Hồ sơ ghi nhập viện và ra viện',S.med.log.some(l=>l.ev==='hosp'&&l.cost===850)&&S.med.log.some(l=>l.ev==='out'));
  // offline
  const S2=reset(5),c2=cat();T.medAdd(c2,'fracF',1);T.hospAdmit(c2.uid);T.save();let sv=JSON.parse(STORE);
  sv.last=Date.now()-30*MIN;sv.hosp[c2.uid].t0-=30*MIN;sv.hosp[c2.uid].until-=30*MIN;STORE=JSON.stringify(sv);T.load();
  ok('Thoát game 30 phút: vẫn nằm viện, còn khoảng 30 phút',T.inHosp(c2.uid)&&Math.abs(T.hospLeft(c2.uid)-30*MIN)<5000,Math.round(T.hospLeft(c2.uid)/MIN)+' phút');
  sv=JSON.parse(STORE);sv.last=Date.now()-3*3600*1000;sv.hosp[c2.uid].until-=3*3600*1000;STORE=JSON.stringify(sv);T.load();
  ok('Thoát game 3 giờ: đã ra viện và khỏi lúc quay lại',!T.inHosp(c2.uid)&&!T.ills(T.S.cats[0]).length&&T.S.med.news.length===1);
  // phức tạp, cứu trợ
  const S3=reset(5),c3=cat();T.medAdd(c3,'fracH',1);T.medAdd(c3,'sprain',1);T.medAdd(c3,'cold',1);const p3=T.hospPlan(c3.uid);
  ok('Chấn thương phức tạp: gộp 1.800 xu, bệnh khác tính riêng',p3.complex&&p3.total===2100,p3.total);
  S3.coins=200;const p4=T.hospPlan(c3.uid);ok('Ca nghiêm trọng mà thiếu xu: quỹ cứu trợ nhận, trả số xu đang có, nằm 120 phút',p4.charity===1&&p4.pay===200&&p4.min===120&&!p4.err);
  T.hospAdmit(c3.uid);ok('Nhập viện cứu trợ không làm xu âm',S3.coins===0&&T.inHosp(c3.uid));
  const S4=reset(5),c4=cat();T.medAdd(c4,'derm',1);S4.coins=100;ok('Bệnh nhẹ mà thiếu xu: không nhập viện được, không trừ xu',!!T.hospAdmit(c4.uid).err&&S4.coins===100&&!T.inHosp(c4.uid));
}
// 9. bệnh nhẹ tự khỏi khi nghỉ chỗ tốt; miễn bệnh sau khi khỏi
{
  const S=reset(5),c=cat();T.medAdd(c,'stress',1);run(70);
  ok('Căng thẳng tự khỏi sau khoảng 1 giờ nghỉ ở phòng dễ chịu',!T.ills(c).length,T.ills(c).map(e=>e.k+':'+Math.round(e.sr||0)).join());
  ok('Vừa khỏi bệnh thì được miễn bệnh mới một thời gian',c.imm>Date.now());
  T.medAdd(c,'fever',1);const he=c.he;run(60);ok('Sốt không tự khỏi, mất dần sức khỏe nhưng không xuống dưới mức sàn',T.ills(c).length===1&&c.he<he&&c.he>=T.MEDC.floor.he,c.he.toFixed(0));
}
// 10. tai nạn viễn chinh
{
  const o1=T.injOdds('desert',['sunny','sunny','sunny','sunny'],40,{}),o0=T.injOdds('alley',['sunny'],10,{}),o2=T.injOdds('desert',['sunny'],40,{catboots:1,pawwrap:1,brace:1}),o3=T.injOdds('desert',['blizzard'],40,{});
  ok('Điểm nguy hiểm: tai nạn nhẹ 3–5%, bong gân 1–2%, gãy chân 0,2–0,5%',o1.minor>=.03&&o1.minor<=.0501&&o1.sprain>=.01&&o1.sprain<=.02&&o1.frac>=.002&&o1.frac<=.005,[o1.minor,o1.sprain,o1.frac].map(v=>(v*100).toFixed(2)+'%').join(' / '));
  ok('Điểm an toàn, chuyến ngắn: rủi ro thấp hơn nhiều, không gãy chân',o0.frac===0&&o0.minor<o1.minor/4&&o0.sprain<o1.sprain/4,[o0.minor,o0.sprain].map(v=>(v*100).toFixed(2)+'%').join(' / '));
  ok('Thời tiết xấu làm tăng rủi ro',o3.minor>o1.minor&&o3.frac>o1.frac);
  ok('Đồ bảo hộ giảm rủi ro (tối đa 60%), nẹp giảm một nửa gãy chân',Math.abs(o2.minor/o1.minor-.4)<.01&&Math.abs(o2.frac/o1.frac-.2)<.01,(o2.minor/o1.minor).toFixed(2)+' / '+(o2.frac/o1.frac).toFixed(2));
  const S=reset(5);let n={0:0,scratch:0,sprain:0,frac:0},N=200000,d=T.DEST.desert;const c=cat();
  for(let i=0;i<N;i++){delete c.ill;c.he=100;c.en=100;const res={wx:{out:'ok',lines:[]}};T.medTripClaim({dest:'desert',cps:['sunny','sunny','sunny','sunny'],kit:{}},c,res,d);
    const k=T.ills(c)[0];if(k)n[k.k.startsWith('frac')?'frac':k.k]++;else if(res.wx.lines.length)n[0]++}
  ok('200.000 chuyến ở Đồi cát: tần suất khớp xác suất',Math.abs(n.frac/N-o1.frac)<.0006&&Math.abs(n.sprain/N-o1.sprain)<.0015&&Math.abs((n.scratch+n[0])/N-o1.minor)<.002,'vấp ngã '+(n[0]/N*100).toFixed(2)+'%, trầy xước '+(n.scratch/N*100).toFixed(2)+'%, bong gân '+(n.sprain/N*100).toFixed(2)+'%, gãy chân '+(n.frac/N*100).toFixed(2)+'%');
  // túi y tế
  S.inv.medbag=1;let used=0;for(let i=0;i<4000&&!used;i++){delete c.ill;const res={wx:{out:'ok',lines:[]}};T.medTripClaim({dest:'desert',cps:['blizzard'],kit:{medbag:1}},c,res,d);if(T.invN('medbag')===0)used=1}
  ok('Túi y tế viễn chinh tự dùng khi bị thương, trừ đúng 1',used===1&&T.invN('medbag')===0&&(!T.ills(c).length||T.ills(c)[0].sp===1));
}
// 11. lưu và khôi phục
{
  const S=reset(5),a=cat(),b=cat();S.inv={w_plain:7,t_good:2,catboots:1};T.medAdd(a,'allergy',1);a.ill[0].tries=1;T.medAdd(b,'sprain',1);T.hospAdmit(b.uid);T.save();
  const before=JSON.stringify([S.inv,a.ill,S.hosp,S.med.n]);T.load();const S2=T.S;
  ok('Tải lại: bệnh, số lần thử, túi đồ, lượt nằm viện khôi phục đúng',JSON.stringify([S2.inv,S2.cats[0].ill,S2.hosp,S2.med.n])===before);
}
// 12. trọng tài máy chủ nhận bản lưu có nước, thuốc, nằm viện
{
  const S=reset(5),c=cat();T.tick(1);T.save();const O=JSON.parse(STORE);
  T.buyDrink('w_plain',20);T.buyMed('t_basic',2);T.buyMed('catboots',1);T.medAdd(c,'fever',1);T.medUse(c.uid,c.ill[0].eid,'t_basic');if(c.ill)T.hospAdmit(c.uid);T.save();const N=JSON.parse(STORE);
  const req=JSON.stringify({old:O,neu:N,dt:60,issued:[],ack:0,pity:0,gift:{coins:0,tickets:0,cats:[]},budget:{c:0,x:0}});
  const out=cp.spawnSync('node',[path.join(R,'tools/guard.js')],{input:req+'\n',encoding:'utf8'}).stdout.trim().split('\n').pop();
  ok('Trọng tài máy chủ nhận bản lưu sau khi mua nước, thuốc, đồ bảo hộ và nhập viện',JSON.parse(out).ok===1,out.slice(0,140));
  const N2=JSON.parse(JSON.stringify(N));N2.inv.t_special=(N2.inv.t_special|0)+200;
  const out2=cp.spawnSync('node',[path.join(R,'tools/guard.js')],{input:JSON.stringify({old:N,neu:N2,dt:60,issued:[],ack:0,pity:0,gift:{coins:0,tickets:0,cats:[]},budget:{c:0,x:0}})+'\n',encoding:'utf8'}).stdout.trim().split('\n').pop();
  ok('Tự cộng 200 Thuốc đặc trị vào túi thì bị trọng tài từ chối',JSON.parse(out2).ok===0,JSON.parse(out2).why);
}
console.log(fail?'\nCÓ '+fail+' PHẦN HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
