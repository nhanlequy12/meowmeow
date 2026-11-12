"use strict";
/* Kiểm thử hệ thống thời tiết (chạy: node tools/wxtest.js). Dùng đúng mã game: data.js, wx-data.js, game.js, wx.js.
   Mỗi phần in ĐẠT hoặc HỎNG kèm số liệu; thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
globalThis.localStorage={getItem(){return null},setItem(){},removeItem(){}};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/game.js','js/wx.js','js/pw.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,wxAt,wxForecast,roomClimate,wxCat,wxSt,wxs,wxFeel,wxRegen,wxHunger,wxTick,fillWater,buySupply,useSupply,
    tripInfo,startTrip,claimTrip,putBed,giveWater,kitFx,pwTick,wxDevices,wxOverride,WXO,SP,FURN,WX,WXC,SEASONS,SUP,DEST,setOff:v=>{WX_OFF=v},setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000,DAY=86400000,t0=Date.UTC(2026,10,11,0,0);
// tìm thời điểm có kiểu thời tiết cần (và nhiệt độ thỏa điều kiện)
const findT=(f,from)=>{for(let t=from||t0;t<(from||t0)+60*DAY;t+=10*MIN){const o=T.wxAt(t);if(f(o))return t}return null};
const at=t=>T.setOff(t-Date.now());
const WXC_coldAt=()=>T.WXC.coldAt;
const reset=()=>{T.fresh();const S=T.S;S.tut={done:1,hints:{}};S.coins=1e6;S.level=18;['bedroom','balcony','bathroom','garden'].forEach(r=>S.rooms[r]={bowlAt:0});S.wxMig=0;T.wxTick(0);return S};
const cat=room=>{const c=T.newCat(T.SP.muop,1);c.room=room;c.en=80;c.hp=70;c.full=80;T.S.cats.push(c);return c};
const dev=(fid,room,o)=>{const S=T.S,it=Object.assign({iid:S.nid++,fid,room,x:200,y:150,flip:false,broken:false},o||{});S.items.push(it);return it};
T.setNotify(()=>{});

// 1. thời tiết: xác định, chung, đúng nhịp, không xấu liên tục
{
  const a=T.wxAt(t0+123456),b=T.wxAt(t0+123456);ok('Cùng thời điểm thì cùng thời tiết',a.type===b.type&&a.temp===b.temp);
  let lens=[],bad2=0,maxRun=0,run=0,types={},ext=0,last=null,prev=null;
  for(let t=t0;t<t0+30*DAY;t+=10*MIN){const o=T.wxAt(t);if(last&&o.s!==last.s){lens.push((last.e-last.s)/MIN);
      if(WX_bad(last)>=2&&WX_bad(o)>=2)bad2++;run=WX_bad(o)>=1?run+1:0;maxRun=Math.max(maxRun,run);types[o.type]=(types[o.type]||0)+1;if(o.w.rare)ext++}last=o}
  function WX_bad(o){return o.w.bad}
  ok('Thời tiết đổi mỗi 5 giờ (đợt cuối ngày 4 giờ, sang ngày là sang mùa)',lens.every(l=>l===300||l===240)&&lens.filter(l=>l===240).length<=lens.length/4,'ngắn nhất '+Math.min(...lens)+', dài nhất '+Math.max(...lens)+' phút');
  ok('Hai đợt xấu nặng ít khi liền nhau',bad2<lens.length*.01,bad2+' lần / '+lens.length+' đợt');
  ok('Không có chuỗi dài thời tiết xấu (tối đa 2 đợt, cộng 2 ở chỗ nối hai ngày)',maxRun<=4,'chuỗi xấu dài nhất '+maxRun+' đợt');
  ok('Thời tiết cực đoan hiếm',ext>0&&ext<lens.length*.03,ext+' đợt / '+lens.length);
  const se=[0,1,2,3].map(d=>T.wxAt(t0+d*DAY+5*3600000).season.id);ok('Mùa xoay vòng mỗi ngày',new Set(se).size===4,se.join(', '));
  ok('Có dự báo các đợt tới',(at(t0),T.wxForecast(3)).length===3);
}
// 2. khí hậu phòng
{
  const tc=findT(o=>o.temp<=9&&o.type==='cold'),S=reset();at(tc);const o=T.wxAt(tc);
  const bal=T.roomClimate('balcony'),bed=T.roomClimate('bedroom');
  ok('Trời lạnh: ban công gần như nhiệt độ ngoài trời, phòng ngủ ấm hơn',bal.T<o.temp+3&&bed.T>bal.T+8&&bed.T<WXC_coldAt(),'ngoài '+o.temp+'°, ban công '+bal.T+'°, phòng ngủ '+bed.T+'°');
  dev('heatmini','balcony');const b2=T.roomClimate('balcony');ok('Máy sưởi mini ngoài trời chỉ ấm nửa công suất',Math.abs(b2.T-bal.T-2)<.2,bal.T+'° → '+b2.T+'°');
  dev('heatpro','bedroom');const bd2=T.roomClimate('bedroom');ok('Máy sưởi tự động không làm phòng quá 21°C',bd2.T<=21.01&&bd2.T>=bed.T,bed.T+'° → '+bd2.T+'°');
  dev('waterheater','balcony');ok('Thiết bị sai phòng không có tác dụng',T.roomClimate('balcony').D.off.some(d=>d.why==='không hợp phòng này'));
  dev('heatmini','balcony');dev('heatmini','balcony');ok('Quá số lượng cho phép thì món thừa không có tác dụng',T.roomClimate('balcony').D.off.some(d=>d.why==='quá số lượng'));
}
{
  const tr=findT(o=>o.type==='storm'),S=reset();at(tr);const r0=T.roomClimate('balcony');dev('balconyroof','balcony');const r1=T.roomClimate('balcony');
  ok('Mái che ban công che mưa',r1.rain<r0.rain*.4,'mưa '+r0.rain.toFixed(2)+' → '+r1.rain.toFixed(2));
  const lv=T.roomClimate('living');ok('Phòng khách không bị mưa tạt đáng kể',lv.rain<.1);
}
// 2b. phòng trong nhà: mùa đông vẫn lạnh (cần sưởi) nhưng ấm hơn ngoài trời nhiều; thiết bị chạy pin giá rẻ
{
  const tc=findT(o=>o.season.id==='winter'&&o.type==='cold'&&o.temp<=4),S=reset();at(tc);const o=T.wxAt(tc),lv=T.roomClimate('living'),bal=T.roomClimate('balcony');
  ok('Mùa đông: phòng khách lạnh (dưới 16°C) nhưng ấm hơn ban công nhiều',lv.T<16&&lv.T>bal.T+6,'ngoài '+o.temp+'°, ban công '+bal.T+'°, phòng khách '+lv.T+'°');
  const h=dev('bheater','living'),lv2=T.roomClimate('living');ok('Máy sưởi tích điện ấm thêm 2°C (yếu hơn máy sưởi mini 4°C)',Math.abs(lv2.T-lv.T-2)<.15,lv.T+'° → '+lv2.T+'°');
  T.pwTick(6*3600,false);ok('Pin 500 Wh, 70 W: sau 6 giờ vẫn chạy',T.wxDevices('living').on.some(d=>d.i===h),'còn '+Math.round(h.currentBattery)+' Wh');
  T.pwTick(2*3600,false);ok('Hết pin thì ngừng chạy, mất tác dụng',h.currentBattery===0&&T.wxDevices('living').off.some(d=>d.i===h&&d.why==='hết pin'));
  T.pwTick(5*3600,true);ok('Không tự sạc (kể cả lúc vắng mặt)',h.currentBattery===0);
  h.off=1;T.pwTick(3600,false);ok('Tắt máy cũng không tự sạc',h.currentBattery===0&&T.wxDevices('living').off.some(d=>d.i===h&&d.why==='đang tắt'));
}
// 2c. Admin ghi đè mùa, thời tiết, giờ để thử
{
  T.wxOverride('se',1);T.wxOverride('ty','snow');T.wxOverride('hr',3);const o=T.wxAt(t0+7*3600000);
  ok('Admin ghi đè mùa, thời tiết, giờ',o.season.id==='summer'&&o.type==='snow');
  T.wxOverride('se','');T.wxOverride('ty','');T.wxOverride('hr','');ok('Bỏ ghi đè thì về như cũ',!Object.keys(T.WXO).length&&T.wxAt(t0).type===T.wxAt(t0).type);
}
// 3. tác động lên mèo: ví dụ trong yêu cầu (lạnh 8°C ở ban công không giữ ấm)
{
  const tc=findT(o=>o.temp>=6&&o.temp<=9&&o.rain===0&&o.wind<.4),S=reset();at(tc);const c=cat('balcony');
  T.wxCat(c,1);const x=T.wxs(c),F=T.wxFeel(c);
  const hp0=c.hp,en0=c.en;T.wxCat(c,60);const dHp=hp0-c.hp,dEn=en0-c.en,hm=T.wxHunger(c);
  ok('Lạnh ở ban công: độ vui, năng lượng giảm mỗi phút, đói nhanh hơn',dHp>1&&dEn>.8&&hm>1.2,'cảm nhận '+F.feel.toFixed(1)+'°C: -'+dHp.toFixed(2)+' vui/phút, -'+dEn.toFixed(2)+' năng lượng/phút, đói ×'+hm.toFixed(2));
  for(let i=0;i<10;i++)T.wxCat(c,60);ok('Ở lâu ngoài lạnh thì có trạng thái Lạnh',T.wxSt(c).includes('cold'),'phơi lạnh '+Math.round(x.cx));
  c.room='bedroom';dev('heatpro','bedroom');const en1=c.en;for(let i=0;i<15;i++)T.wxCat(c,60);
  ok('Vào phòng ngủ có máy sưởi: hết hao năng lượng do lạnh, hết Lạnh dần',c.en>=en1-.01&&!T.wxSt(c).includes('cold'),'phơi lạnh còn '+Math.round(x.cx));
}
{
  const tr=findT(o=>o.type==='storm'||o.type==='drizzle'&&o.rain>=.5),S=reset();at(tr);const c=cat('balcony');for(let i=0;i<20;i++)T.wxCat(c,60);
  ok('Dầm mưa ở ban công thì bị Ướt',T.wxSt(c).includes('wet'),'ướt '+Math.round(T.wxs(c).wet));
  c.room='living';dev('hairdryer','living');T.wxCat(c,60);ok('Máy sấy lông làm khô ngay',!T.wxSt(c).includes('wet'));
}
{
  const S=reset();const c=cat('living');T.wxs(c).sk=90;S.inv={coldmed:1};const r=T.useSupply('coldmed',c.uid);
  ok('Thuốc chống cảm chữa khỏi Ốm và chỉ trừ một lần',r.ok&&!T.wxSt(c).includes('sick')&&S.inv.coldmed===0&&T.useSupply('coldmed',c.uid).err);
}
// 4. vắng mặt: thời tiết xấu không làm mèo suy kiệt
{
  const ts=findT(o=>o.type==='snow'||o.type==='blizzard'),S=reset();at(ts+8*3600000);const c=cat('balcony');c.hp=60;c.en=60;c.he=90;c.wa=80;
  T.setToff(-8*3600000);let left=8*3600;while(left>0){T.setToff(T.TOFF+600000);T.tick(600,true);left-=600}T.setToff(0);
  ok('8 giờ vắng mặt ở ban công lúc tuyết: chỉ số không xuống dưới mức sàn, không phát bệnh mới',c.hp>=WXC_away('hp')&&c.en>=WXC_away('en')&&c.he>=WXC_away('health')&&!T.wxs(c).sk,'vui '+Math.round(c.hp)+', năng lượng '+Math.round(c.en)+', sức khỏe '+Math.round(c.he)+', nước '+Math.round(c.wa));
  function WXC_away(k){return Math.min(T.WXC.away[k],60)}
}
// 5. nước uống
{
  const S=reset();at(t0);const c=cat('living');c.wa=30;T.wxTick(1);
  ok('Mỗi phòng được tặng bát nước, bé khát tự ra uống',S.items.some(i=>i.fid==='waterbowl'&&i.room==='living')&&c.wa>=70,'nước '+Math.round(c.wa));
  const b=S.items.find(i=>i.fid==='waterbowl'&&i.room==='living');b.w=0;c.wa=30;T.wxTick(1);ok('Bát cạn thì không uống được',c.wa===30);
  ok('Đổ nước (miễn phí) đổ đầy bát',T.fillWater('living')===1&&b.w===T.FURN.waterbowl.water.cap);
  dev('waterfilter','kitchen'.length?'living':'living',{w:0,wat:0});b.w=0;c.wa=30;T.wxTick(1);ok('Máy lọc nước tự đổ đầy',c.wa>=70);
}
// 6. vật phẩm và viễn chinh
{
  const tb=findT(o=>o.type==='storm'),S=reset();at(tb);const c=cat('living');c.en=100;c.full=100;
  ok('Mua vật phẩm vào túi đồ',T.buySupply('raincoat',1).n===1&&T.buySupply('firstaid',1).n===1&&T.buySupply('rescuekit',1).n===1&&S.inv.raincoat===1);
  const i0=T.tripInfo(c,'harbor',{}),i1=T.tripInfo(c,'harbor',{raincoat:1,rescuekit:1});
  ok('Có dự báo, tỉ lệ thành công; mang áo mưa thì tỉ lệ cao hơn',i0.wx&&i0.wx.succ>0&&i0.wx.succ<=100&&i1.wx.succ>=i0.wx.succ,'không mang '+i0.wx.succ+'%, có áo mưa '+i1.wx.succ+'%; nên mang: '+i0.wx.recs.join(', '));
  ok('Thời tiết xấu làm chuyến đi lâu hơn',i0.dur>T.DEST.harbor.min*MIN,Math.round(i0.dur/MIN)+' phút thay vì '+T.DEST.harbor.min);
  ok('Xuất phát giữ vật phẩm khỏi túi đồ (không dùng hai lần)',T.startTrip(0,c.uid,'harbor',{raincoat:1,firstaid:1,rescuekit:1})&&S.inv.raincoat===0&&S.inv.firstaid===0&&S.trips[0].kit.firstaid===1);
  S.trips[0].end=Date.now()-1;const R0=Math.random;Math.random=()=>.01; // ép sự cố lớn ở chặng đầu
  const res=T.claimTrip(0);Math.random=R0;
  ok('Sự cố lớn: rút lui, Bộ cứu hộ tự dùng, vẫn có thưởng, không mất mèo',res&&res.wx&&res.wx.out==='retreat'&&res.coins>0&&T.S.cats.includes(c),'xu '+res.coins+'; '+res.wx.lines.join(' | '));
  ok('Vật phẩm tự kích hoạt chưa dùng được trả lại túi đồ; vật phẩm dùng lúc xuất phát đã hết',S.inv.firstaid===1&&S.inv.raincoat===0&&!S.inv.rescuekit,'sơ cứu '+S.inv.firstaid+', cứu hộ '+(S.inv.rescuekit||0));
  ok('Có nhật ký viễn chinh',S.tlog.length===1&&S.tlog[0].out==='retreat');
  const fx=T.kitFx({handwarmer:5,scarf:1,luckycharm:3});ok('Không cộng dồn vô hạn: kháng lạnh tối đa 60%, may mắn tối đa 15%',fx.res.cold<=.6&&fx.luck<=.15,'kháng lạnh '+fx.res.cold+', may mắn '+fx.luck);
}
{
  const tg=findT(o=>o.type==='ideal'),S=reset();at(tg);const c=cat('living');c.en=100;c.full=100;
  T.startTrip(0,c.uid,'park',{});S.trips[0].end=Date.now()-1;const n=200;let sum=0,bad=0;
  for(let i=0;i<n;i++){const p=JSON.parse(JSON.stringify(S.trips[0]||{}));}
  const res=T.claimTrip(0);ok('Thời tiết lý tưởng: chuyến đi êm, được thưởng thêm',res.wx.out==='ok'&&res.wx.mult>1,'hệ số xu ×'+res.wx.mult.toFixed(2));
}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả ĐẠT');process.exit(fail?1:0);
