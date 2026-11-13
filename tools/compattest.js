"use strict";
/* Kiểm thử module gợi ý tương thích (chạy: node tools/compattest.js).
   Dùng đúng mã game: các file dữ liệu, game.js, wx.js, pw.js, med.js, meal.js, stray.js, garden.js, compat-data.js, compat.js. Thoát mã 1 nếu có phần hỏng.
   Phần chính: điểm tương thích mèo × phòng phải KHỚP với độ vui game thật sự tính (happyTarget) ở mọi phòng, cho 40 bé ngẫu nhiên. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
const FILES=['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/compat-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/compat.js'];
(0,eval)(FILES.filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,save,giveBowl,bowlCap,happyTarget,roomHappy,homeCats,catsIn,favs,tE,tM,SP,ROOMS,ROOM,FOODS,FOOD,DRINKS,TRAITS,BREEDS,VARIANTS,FURN,WXC,CP,CPC,CP_LV,CP_TEXT,wxOverride,
    setNotify:f=>{notify=f}};`);
const {CP,CPC,ROOMS,ROOM,FOODS,DRINKS,TRAITS,SP,BREEDS,VARIANTS}=T;
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
// ván thử: cấp 1 (thời tiết chưa mở nên happyTarget không lẫn thời tiết), đủ mọi phòng
function reset(lv){STORE=null;T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=1e6;S.level=lv||1;S.items=[];ROOMS.forEach(r=>{S.rooms[r.id]={bowlAt:0,at:1};T.giveBowl(r.id)});return S}
let seed=12345;const rnd=()=>{seed=(seed*1103515245+12345)&0x7fffffff;return seed/0x7fffffff};
function cat(sp,traits,room,nm){const s=SP[sp]||SP.muop,c=T.newCat(s,s.r);c.traits=(traits||[]).slice();c.room=room||'living';c.full=100;c.en=100;c.hp=70;c.wa=100;c.he=100;c.name=nm||s.n;T.S.cats.push(c);return c}
const item=(fid,room)=>{const S=T.S,i={iid:S.nid++,fid,room,x:100,y:150,flip:false,broken:false};S.items.push(i);return i};
const lv=(c,r)=>CP.room(c,r).lv;
const OUT=ROOMS.filter(r=>r.outdoor).map(r=>r.id),IN=ROOMS.filter(r=>!r.outdoor).map(r=>r.id);

// 1. ngưỡng mức
ok('Ngưỡng: 10 Rất hợp, 3 Hợp, 0 Bình thường, −5 Không hợp',CP.lvOf(10)===2&&CP.lvOf(9.9)===1&&CP.lvOf(3)===1&&CP.lvOf(2.9)===0&&CP.lvOf(-4.9)===0&&CP.lvOf(-5)===-1);
ok('Bốn mức có tên và biểu tượng riêng',[2,1,0,-1].every(l=>T.CP_LV[l]&&T.CP_LV[l].n)&&new Set([2,1,-1].map(l=>T.CP_LV[l].ic)).size===3);

// 2. ngoài trời và trong nhà
{reset();const a=cat('muop',['sunbath'],'living','Nắng'),b=cat('muop',[],'living','Thường');
  ok('Tắm nắng: Rất hợp ở cả 5 phòng ngoài trời',OUT.length===5&&OUT.every(r=>lv(a,r)===2),OUT.map(r=>lv(a,r)).join(','));
  ok('Tắm nắng: Bình thường ở mọi phòng trong nhà',IN.every(r=>lv(a,r)===0));
  ok('Bé không có thuộc tính liên quan: Bình thường ở mọi phòng',ROOMS.every(r=>lv(b,r.id)===0));
  ok('Lý do ghi tên thuộc tính và số điểm của game',/Tắm nắng: \+12 vui ở phòng ngoài trời/.test(CP.room(a,'balcony').tip),CP.room(a,'balcony').tip);
  const L=CP.rooms(a);ok('rooms(): phòng ngoài trời đứng đầu, phòng đang ở có cờ cur',L.slice(0,5).every(r=>ROOM[r.id].outdoor)&&L.find(r=>r.cur).id==='living');
  const m=CP.misfit(a);ok('misfit: bé thích nắng ở Phòng khách được gợi ý phòng ngoài trời',m&&m.kind==='better'&&ROOM[m.best.id].outdoor&&m.gain>=12,m&&m.best.id);
  a.room='garden';ok('misfit: đã ở phòng hợp thì không gợi ý nữa',CP.misfit(a)===null);
}
// 3. nước: Hồ bơi
{reset();const a=cat('muop',['swimmer'],'living'),b=cat('muop',['waterfear'],'pool'),c=cat('v_pirate',['v_pirate'],'living');
  ok('Thích nước × Hồ bơi: Rất hợp',lv(a,'pool')===2);ok('Săn kho báu × Hồ bơi: Rất hợp',lv(c,'pool')===2);
  ok('Sợ nước × Hồ bơi: Không hợp',lv(b,'pool')===-1,CP.room(b,'pool').tip);
  ok('Sợ nước ở phòng ngoài trời khác: Bình thường',OUT.filter(r=>r!=='pool').every(r=>lv(b,r)===0));
  const m=CP.misfit(b);ok('misfit: bé sợ nước đang ở Hồ bơi bị cảnh báo, có phòng khác tốt hơn',m&&m.kind==='bad'&&m.best&&m.best.id!=='pool',m&&m.kind);
}
// 4. nội thất bé thích
{const S=reset();const a=cat('muop',['boxlover'],'living'),h=cat('muop',['highup'],'living'),n=cat('v_nezuko',['v_nezuko'],'living');
  ok('Thích hộp, phòng chưa có hộp: Bình thường',lv(a,'living')===0);
  const bx=item('box','living');
  ok('Thích hộp, phòng có Thùng carton: Rất hợp (+15)',lv(a,'living')===2&&CP.room(a,'living').score===15);ok('Nezuko × phòng có hộp: Rất hợp (+20)',CP.room(n,'living').score===20);
  ok('Phòng khác không có hộp: Bình thường',lv(a,'bedroom')===0);
  bx.broken=true;ok('Hộp hỏng không tính',lv(a,'living')===0);bx.broken=false;
  ok('likes(): kể đúng món và cho biết phòng đang có',CP.likes(a)[0].fid==='box'&&CP.likes(a)[0].has===true&&CP.likes(a)[0].pts===15);
  const multi=Object.keys(T.FURN).find(id=>T.FURN[id].lv&&id!=='tree');item(multi,'bedroom');
  ok('Thích chỗ cao × phòng có đồ leo trèo nhiều tầng (không phải Tháp mèo): Rất hợp',lv(h,'bedroom')===2,multi+': '+CP.room(h,'bedroom').tip);
}
// 5. Hay ghen
{reset();const a=cat('muop',['jealous'],'living');for(let i=0;i<4;i++)cat('muop',[],'living');
  ok('Hay ghen, phòng 5 mèo: Bình thường',lv(a,'living')===0);cat('muop',[],'living');
  ok('Hay ghen, phòng 6 mèo: Không hợp',lv(a,'living')===-1,CP.room(a,'living').tip);
  ok('Hay ghen: phòng trống thì Bình thường',lv(a,'bedroom')===0);
}
// 6. bạn cùng phòng
{reset();const t=cat('v_tanjiro',['v_tanjiro'],'living'),n=cat('v_nezuko',['v_nezuko'],'bedroom','Nezuko'),z=cat('v_thunder',['v_thunder'],'kitchen','Zenitsu');
  ok('Tanjiro ở phòng không có bạn: Bình thường',lv(t,'living')===0);
  ok('Tanjiro × phòng có Nezuko: Rất hợp (+15), lý do có tên bạn',CP.room(t,'bedroom').score===15&&/Nezuko/.test(CP.room(t,'bedroom').tip),CP.room(t,'bedroom').tip);
  z.room='bedroom';ok('Có cả Nezuko và Zenitsu: +25',CP.room(t,'bedroom').score===25);
  const P=CP.pals(t);ok('pals(): danh sách bạn thân',P.length===1&&P[0].ids.includes('v_nezuko')&&P[0].max===25);
}
// 7. Tầng hầm, Bếp, Phòng chờ, độ vui cố định
{reset();const a=cat('muop',['nightowl'],'living'),g=cat('muop',['glutton'],'living'),w=cat('v_wednesday',['v_wednesday'],'living'),c=cat('muop',['coldfear'],'living');
  ok('Mèo đêm × Tầng hầm: Hợp',lv(a,'basement')===1,CP.room(a,'basement').tip);ok('Sợ lạnh (trừ xu đêm) × Tầng hầm: Bình thường',lv(c,'basement')===0);
  ok('Ham ăn × Bếp và Nhà kính: Hợp',lv(g,'kitchen')===1&&lv(g,'greenhouse')===1,CP.room(g,'kitchen').tip);
  ok('Phòng chờ: Không hợp',lv(a,'wait')===-1);
  ok('Wednesday (độ vui cố định): Bình thường ở mọi phòng, kể cả Hồ bơi và Phòng chờ',ROOMS.every(r=>lv(w,r.id)===0)&&lv(w,'wait')===0);
}
// 8. aura của bạn cùng phòng: không đổi mức, nhưng vào tổng và vào cảnh báo
{reset();const v=cat('v_voldemort',['v_voldemort'],'living'),a=cat('muop',[],'living'),b=cat('v_bread',['v_bread'],'bedroom');
  const r=CP.room(a,'living');ok('Ở cùng Voldemort: mức vẫn Bình thường, tổng −8',r.lv===0&&r.amb===-8&&r.total===-8);
  const m=CP.misfit(a);ok('misfit: bị cảnh báo vì bạn cùng phòng, gợi ý sang phòng có Bánh mì',m&&m.kind==='bad'&&m.best.id==='bedroom',m&&m.best&&m.best.id);
  ok('fitCats không kéo cả đàn vào chỉ vì aura',CP.fitCats('bedroom').length===0);
}
// 9. KHỚP VỚI GAME: 40 bé ngẫu nhiên × mọi phòng, điểm tương thích = phần độ vui riêng mà happyTarget cộng cho bé
{const S=reset();const pool=Object.keys(TRAITS).filter(t=>!TRAITS[t].e.fixedHappy),sps=Object.keys(SP);
  ['box','mouse','window','tree'].forEach((f,i)=>{item(f,['living','balcony','pool','garden'][i]);item(f,'library')});
  const cats=[];for(let i=0;i<40;i++){const tr=[];while(tr.length<3){const t=pool[Math.floor(rnd()*pool.length)];if(!tr.includes(t))tr.push(t)}cats.push(cat(sps[Math.floor(rnd()*sps.length)],tr,ROOMS[i%ROOMS.length].id,'M'+i))}
  let bad=0,n=0,clamp=0,first='';
  cats.forEach(c=>ROOMS.forEach(r=>{const from=c.room;c.room=r.id;
    const h=T.happyTarget(c),res=CP.room(c,r.id);
    // phần không phải độ vui (cùng điều kiện xu đêm, đói chậm) do test tự tính lại để trừ ra
    const extra=(r.night&&c.traits.reduce((a,t)=>a+Math.max(0,TRAITS[t].e.night||0),0)>0?CPC.nightRoom:0)+(r.hunger&&r.hunger<1&&c.traits.some(t=>TRAITS[t].e.hunger>1)&&T.tM(c,'hunger')>1?CPC.hungerRoom:0);
    const exp=50+T.roomHappy(r.id)+T.tE(c,'self')+res.total-extra;
    n++;if(h<=0||h>=100){clamp++}else if(Math.abs(h-exp)>1e-6){bad++;if(!first)first=c.traits.join('+')+' @'+r.id+': game '+h+', module '+exp}
    c.room=from}));
  ok('Điểm mèo × phòng khớp happyTarget của game ('+n+' cặp, '+clamp+' cặp chạm trần hoặc sàn nên bỏ qua)',bad===0&&n-clamp>400,first||null);
  // 12 bé ngẫu nhiên: in ra để đối chiếu bằng mắt, và kiểm lại từng quy tắc bằng cách tính độc lập
  let wrong=0;cats.slice(0,12).forEach(c=>{
    const out=tE=>c.traits.reduce((a,t)=>a+(TRAITS[t].e[tE]||0),0),w=out('water'),od=out('outdoor');
    ROOMS.forEach(r=>{const from=c.room;c.room=r.id;const res=CP.room(c,r.id);c.room=from;
      if(r.outdoor&&od>0&&!res.why.some(e=>/ngoài trời/.test(e.t)))wrong++;if(!r.outdoor&&res.why.some(e=>/ngoài trời/.test(e.t)))wrong++;
      if(r.water&&w>0&&!res.why.some(e=>e.s===CPC.waterUp))wrong++;if(r.water&&w<0&&!res.why.some(e=>e.s===CPC.waterDn))wrong++;if(!r.water&&res.why.some(e=>/Hồ bơi/.test(e.t)&&!e.amb))wrong++});
    const best=CP.rooms(c)[0],fav=CP.foods(c)[0];
    console.log('      '+c.name+' ['+c.traits.map(t=>TRAITS[t].n).join(', ')+'] → phòng: '+best.n+' ('+CP.label(best.lv)+'), món: '+T.FOOD[fav.id].n+' ('+CP.label(fav.lv)+')')});
  ok('12 bé ngẫu nhiên: quy tắc ngoài trời và nước đúng ở cả phòng ngoài trời lẫn trong nhà',wrong===0,wrong);
}
// 10. món ăn
{const S=reset();const a=cat('muop',[],'living'),p=cat('muop',['picky'],'living'),h=cat('trang',['hunter'],'living');
  ok('Món khoái khẩu của giống: Rất hợp',CP.food(a,'kibble').lv===2&&CP.food(a,'pate').lv===0);
  ok('Kén ăn × Hạt khô: Không hợp kể cả khi Hạt khô là khoái khẩu của giống',CP.food(p,'kibble').score===CPC.fav+CPC.picky&&CP.food(p,'kibble').lv===-1);
  const q=cat('vang',['picky'],'living');ok('Kén ăn (giống thích Pate) × Hạt khô: Không hợp',CP.food(q,'kibble').lv===-1&&CP.food(q,'pate').lv===2);
  ok('Thuộc tính Thợ săn thêm Ức gà vào khoái khẩu',CP.food(h,'chicken').lv===2&&CP.food(h,'churu').lv===2);
  ok('foods(): món khoái khẩu đứng đầu, khớp favs() của game',T.favs(h).every(f=>CP.foods(h).slice(0,T.favs(h).length).some(x=>x.id===f)));
  a.en=20;ok('Đang mệt: Ức gà (+25 năng lượng) là Hợp, Cỏ mèo (−10) là Không hợp',CP.food(a,'chicken').lv===1&&CP.food(a,'catnip').lv===-1,CP.food(a,'chicken').tip);a.en=100;
  a.hp=20;ok('Đang buồn: Súp thưởng (+25 vui) là Hợp',CP.food(a,'churu').lv===1);a.hp=70;
  a.full=10;ok('Đang đói: Pate, Hộp cao cấp là Hợp',CP.food(a,'pate').lv===1&&CP.food(a,'premium').lv===1);a.full=100;
  ok('static: bỏ phần theo trạng thái',(a.en=10,CP.food(a,'chicken',{static:1}).lv===0));a.en=100;
  S.level=1;ok('Hướng dẫn tân thủ: Mướp ta → Hạt khô, Mèo vàng → Pate, Mèo trắng → Hạt khô (Súp thưởng còn khóa)',
    CP.tutFood(cat('muop',['s_muop']))==='kibble'&&CP.tutFood(cat('vang',['s_vang']))==='pate'&&CP.tutFood(cat('trang',['s_trang']))==='kibble');
  S.level=2;ok('Lên cấp 2: Mèo trắng → Súp thưởng',CP.tutFood(cat('trang',['s_trang']))==='churu');
  const fans=CP.foodFans('kibble',S.cats);ok('foodFans(): chỉ các bé hợp món, hợp nhất đứng đầu',fans.length>0&&fans.every(x=>x.lv>=1)&&fans.every((x,i)=>!i||fans[i-1].score>=x.score));
}
// 11. nước uống: theo trạng thái
{const S=reset(2);S.wxU=1;const a=cat('muop',[],'living');
  ok('Bé bình thường: nước nào cũng Bình thường',DRINKS.every(d=>CP.drink(a,d.id).lv===0));
  a.wxs={cx:0,hx:T.WXC.hotSt,wet:0,sk:0,ex:0};ok('Đang nóng × nước điện giải (hạ nhiệt): Rất hợp',CP.drink(a,'w_electro').lv===2&&CP.drinks(a)[0].id==='w_electro',CP.drink(a,'w_electro').tip);a.wxs.hx=0;
  a.he=40;ok('Sức khỏe thấp × nước dinh dưỡng: Hợp',CP.drink(a,'w_nutri').lv===1&&CP.drink(a,'w_plain').lv===0);a.he=100;
  a.cf=20;ok('Kém thoải mái × nước đặc biệt: Hợp',CP.drink(a,'w_special').lv===1);a.cf=80;
  a.wa=10;ok('Rất khát × nước từ +50: Hợp',CP.drink(a,'w_pure').lv===1&&CP.drink(a,'w_plain').lv===0);a.wa=100;
  S.wxU=0;S.level=1;a.wxs.hx=T.WXC.hotSt;ok('Thời tiết chưa mở khóa: không gợi ý theo nóng lạnh',CP.drink(a,'w_electro').lv===0);
}
// 12. theo loài
{const S=reset();
  ok('Loài chắc chắn thích nước (Mèo Hải tặc) × Hồ bơi: Rất hợp, không phải "hay có"',CP.spRoom('v_pirate','pool').lv===2&&!CP.spRoom('v_pirate','pool').maybe);
  const sw=BREEDS.find(b=>/\bswimmer\b/.test(b.t||'')),sb=BREEDS.find(b=>/\bsunbath\b/.test(b.t||''));
  const r=CP.spRoom(sw.id,'pool');ok('Giống hay có Thích nước × Hồ bơi: Hợp (maybe), không lên Rất hợp',r.lv===1&&r.maybe===true&&/hay có/.test(r.tip),sw.n+': '+r.tip);
  ok('Giống hay có Tắm nắng: Hợp (maybe) ở phòng ngoài trời, Bình thường trong nhà',OUT.every(o=>CP.spRoom(sb.id,o).lv===1)&&IN.every(o=>CP.spRoom(sb.id,o).lv===0),sb.n);
  const all=Object.keys(SP);
  ok('Cả 150 loài đều có đúng món Rất hợp là món khoái khẩu của loài',all.length===150&&all.every(id=>CP.spFood(id,SP[id].fav).lv===2&&FOODS.every(f=>f.id===SP[id].fav||CP.spFood(id,f.id).lv<2)));
  ok('spInfo chạy cho cả 150 loài, có ít nhất một món',all.every(id=>{const x=CP.spInfo(id);return x.foods.length>=1&&Array.isArray(x.rooms)&&Array.isArray(x.likes)}));
  const st=[['muop','s_muop'],['vang','s_vang'],['trang','s_trang']].map(x=>CP.spInfo(x[0],{traits:[x[1]],exact:1}));
  ok('Ba mèo khởi đầu: mỗi bé đúng một món Rất hợp; Mèo trắng hợp Tầng hầm (thưởng xu đêm)',st.every(x=>x.foods.filter(f=>f.lv===2).length===1)&&st[2].rooms.some(r=>r.rid==='basement'&&r.lv===1)&&st[0].rooms.length===0,st.map(x=>x.rooms.map(r=>r.rid).join('/')||'-').join(' | '));
  item('box','living');cat('muop',[],'living');
  const F=CP.fitSpecies('living');ok('fitSpecies: không gồm loài đang có, có Mèo Nezuko (chắc chắn thích hộp) đứng trước các loài "hay có"',!F.some(x=>x.id==='muop')&&F[0].id==='v_nezuko'&&F[0].lv===2,F.slice(0,3).map(x=>x.id).join(','));
  const P=CP.fitSpecies('pool');ok('fitSpecies(Hồ bơi): loài chắc chắn đứng trước loài "hay có"',P.length>=3&&P.findIndex(x=>x.maybe)>P.findIndex(x=>!x.maybe)&&P.every((x,i)=>!i||!(P[i-1].maybe&&!x.maybe)),P.length);
}
// 13. fitCats
{reset();const a=cat('muop',['sunbath'],'living','A'),b=cat('muop',['swimmer'],'pool','B'),c=cat('muop',['sunbath','swimmer'],'living','C'),d=cat('muop',[],'pool','D');
  const F=CP.fitCats('pool');ok('fitCats(Hồ bơi): hợp nhất đứng đầu, bé đang ở đây có cờ here, bé thường không có mặt',F.map(x=>x.c.name).join('')==='CAB'&&F.find(x=>x.c===b).here&&!F.some(x=>x.c===d),F.map(x=>x.c.name+x.score).join(' '));
}
// 14. xếp gợi ý
{const S=reset();['bedroom','kitchen','bathroom','playroom','dining','attic','garden','library','gameroom','greenhouse','tatami','basement','pool','rooftop','royal'].forEach(r=>delete S.rooms[r]); // chỉ còn Phòng khách, Ban công
  const a=cat('muop',['sunbath'],'living','Nắng'),w=cat('muop',[],'wait','Chờ'),n=cat('muop',[],'living','Thường');
  const snap=JSON.stringify(S.cats.map(c=>c.room)),P=CP.plan();
  ok('plan() không thay đổi gì',JSON.stringify(S.cats.map(c=>c.room))===snap);
  ok('plan(): bé thích nắng sang Ban công, bé ở Phòng chờ vào phòng, bé thường ở yên',P.moves.length===2&&P.moves.find(m=>m.uid===a.uid).to==='balcony'&&P.moves.find(m=>m.uid===w.uid).to!=='wait'&&!P.moves.some(m=>m.uid===n.uid)&&P.gain>0,P.moves.map(m=>m.name+':'+m.from+'→'+m.to+' ('+m.why+')').join('; '));
  const h0=S.cats.reduce((s,c)=>s+T.happyTarget(c),0),r=CP.apply(P),h1=S.cats.reduce((s,c)=>s+T.happyTarget(c),0);
  ok('apply(): chuyển đúng, tổng độ vui của game tăng',r.n===2&&a.room==='balcony'&&w.room!=='wait'&&h1>h0,h0+' → '+h1);
  ok('Xếp lại lần nữa: không còn gì để chuyển',CP.plan().moves.length===0);
  ok('Đề xuất cũ không còn khớp thì từ chối',!!CP.apply(P).err);
}
{const S=reset();Object.keys(S.rooms).forEach(r=>{if(r!=='living'&&r!=='balcony')delete S.rooms[r]});
  for(let i=0;i<6;i++)cat('muop',[],'balcony','B'+i);const a=cat('muop',['sunbath'],'living','Nắng');
  const P=CP.plan();ok('Phòng hợp đã đầy: đổi chỗ với một bé không cần phòng đó',P.moves.length===2&&P.moves.some(m=>m.uid===a.uid&&m.to==='balcony')&&P.moves.some(m=>m.from==='balcony'&&m.to==='living'),P.moves.map(m=>m.name+':'+m.from+'→'+m.to).join('; '));
  CP.apply(P);ok('Sau khi áp dụng không phòng nào quá sức chứa',T.catsIn('balcony').length===6&&a.room==='balcony');
}
{const S=reset();Object.keys(S.rooms).forEach(r=>{if(r!=='living'&&r!=='balcony')delete S.rooms[r]});
  const a=cat('muop',['sunbath'],'living','Đi vắng');S.trips=[{uid:a.uid,did:'alley',end:Date.now()+6e5}];
  ok('Bé đang viễn chinh không bị xếp',CP.plan().moves.length===0);S.trips=[null];
  const v=cat('v_voldemort',['v_voldemort'],'living','Vol');for(let i=0;i<5;i++)cat('muop',[],'living','L'+i);
  const P=CP.plan();ok('Bé làm cả phòng kém vui được tách riêng (hoặc các bé khác dời đi)',P.gain>0&&P.moves.length>=1,P.moves.map(m=>m.name+':'+m.to).join('; '));
}
// 14b. xếp gợi ý không dồn bé vào phòng quá số suất bát ăn
{const S=reset();Object.keys(S.rooms).forEach(r=>{if(r!=='living'&&r!=='balcony')delete S.rooms[r]});
  for(let i=0;i<6;i++)cat('muop',['sunbath'],'living','N'+i);
  const P=CP.plan();CP.apply(P);
  ok('6 bé thích nắng, Ban công chứa 6 nhưng bát chỉ có '+T.bowlCap('balcony')+' suất: chỉ chuyển '+T.bowlCap('balcony')+' bé',T.catsIn('balcony').length===T.bowlCap('balcony')&&T.bowlCap('balcony')<ROOM.balcony.cap,T.catsIn('balcony').length+' bé');
  const w=cat('muop',[],'wait','Chờ');S.cats.filter(c=>c.room==='living').slice(0,1).forEach(c=>c.room='wait');for(let i=0;i<6;i++)cat('muop',[],'living','L'+i);
  const P2=CP.plan();CP.apply(P2);ok('Bé ở Phòng chờ vẫn được xếp vào phòng dù bát không đủ suất',T.catsIn('wait').length===0);
}
// 15. xếp gợi ý: thử nặng, ngẫu nhiên
{const S=reset();['box','mouse','window','tree'].forEach((f,i)=>item(f,['living','bedroom','kitchen','attic'][i]));
  const pool=Object.keys(TRAITS),sps=Object.keys(SP),cap=ROOMS.reduce((a,r)=>a+r.cap,0);
  for(let i=0;i<150;i++){const tr=[];const s=sps[Math.floor(rnd()*sps.length)];if(SP[s].xt)tr.push(SP[s].xt);while(tr.length<3){const t=pool[Math.floor(rnd()*pool.length)];if(!tr.includes(t))tr.push(t)}
    const free=ROOMS.filter(r=>T.catsIn(r.id).length<r.cap);cat(s,tr,free.length&&rnd()<.9?free[Math.floor(rnd()*free.length)].id:'wait','N'+i)}
  const h0=S.cats.reduce((s,c)=>s+T.happyTarget(c),0),t0=Date.now(),P=CP.plan(),ms=Date.now()-t0,r=CP.apply(P),h1=S.cats.reduce((s,c)=>s+T.happyTarget(c),0);
  ok('150 bé, 17 phòng (sức chứa '+cap+'): xếp xong trong '+ms+' ms, '+P.moves.length+' bé chuyển',ms<2500&&!r.err&&r.n===P.moves.length);
  ok('Không phòng nào quá sức chứa, không bé nào mất',ROOMS.every(x=>T.catsIn(x.id).length<=x.cap)&&S.cats.length===150);
  ok('Tổng độ vui của game sau khi xếp không giảm',h1>=h0-1e-6,Math.round(h0)+' → '+Math.round(h1));
}
console.log(fail?'\nCÓ '+fail+' PHẦN HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
