"use strict";
/* Kiểm thử Mèo ghé chơi (chạy: node tools/visittest.js).
   Dùng đúng mã game: data.js, wx-data.js, pw-data.js, med-data.js, garden-data.js, visit-data.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js, garden.js, visit.js,
   cùng trọng tài tools/guard.js. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
globalThis.performance=globalThis.performance||{now:()=>Date.now()};
(0,eval)(['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/visit-data.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/visit.js']
  .filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},set S(v){S=v},fresh,newCat,tick,load,save,buyItem,giveBowl,freeRoom,VIS,FEATS,SP,BREEDS,VARIANTS,RARE,FURN,FOOD,TRAITS,
    visGen,visParse,visDay,visSlot,visS,visCat,visAttract,visBest,visNewId,visStart,visEnd,visPet,visFeed,visAdopt,visLetGo,visTick,visKnown,visOpen,favs,
    setToff:v=>{TOFF=v},get TOFF(){return TOFF},setNotify:f=>{notify=f},now:()=>now()};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const MIN=60000,N=[];T.setNotify((m,o)=>N.push((o&&o.mtitle||o&&o.title||'')+': '+m));
const mkCat=(sp,room)=>{const c=T.newCat(T.SP[sp],T.SP[sp].r);c.traits=[];c.room=room||'living';c.name='Nhà '+c.uid;T.S.cats.push(c);return c};
const reset=lv=>{STORE=null;T.setToff(0);T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=5000;S.level=lv||6;S.wxU=1;
  mkCat('muop');mkCat('muop');N.length=0;return S};
const run=(min,sim)=>{for(let i=0;i<min;i++){T.setToff(T.TOFF+MIN);T.tick(60,sim)}};
const today=()=>T.visDay(T.now());

// 1. dữ liệu và hàm sinh bé lạ
{ok('Tính năng Mèo ghé chơi mở ở cấp 5 (lộ trình)',T.FEATS.some(f=>f.id==='visit'&&f.lv===5));
 const a=T.visGen('20400.0.1'),b=T.visGen('20400.0.1');ok('Cùng mã khách luôn ra cùng một bé',JSON.stringify(a)===JSON.stringify(b),a.sp+' '+a.star+'★');
 ok('Mã sai dạng, lượt hoặc ứng viên quá giới hạn thì không sinh',T.visGen('abc')===null&&T.visGen('20400.2.0')===null&&T.visGen('20400.0.3')===null&&T.visParse('20400.1.2').s===1);
 const st=[0,0,0,0,0,0];let bad=0,rare=0,variant=0,n=6000;
 for(let i=0;i<n;i++){const g=T.visGen((20000+Math.floor(i/6))+'.'+(i%2)+'.'+(Math.floor(i/2)%3));st[g.star]++;if(g.star>4)bad++;if(T.RARE[g.coat])rare++;if(!T.BREEDS.some(x=>x.id===g.sp))variant++;if(g.traits.length!==g.star)bad++}
 ok('Bé lạ không bao giờ 5★, không màu hiếm, không mèo trang phục; số thuộc tính bằng số sao',!bad&&!rare&&!variant,bad+'/'+rare+'/'+variant);
 ok('Tỉ lệ sao gần 52/32/14/2%',Math.abs(st[1]/n-.52)<.03&&Math.abs(st[2]/n-.32)<.03&&Math.abs(st[3]/n-.14)<.02&&st[4]/n>.008&&st[4]/n<.035,st.slice(1,5).map(x=>(x/n*100).toFixed(1)+'%').join(' '));
 const S0=T.S;T.S={nid:777};T.visGen('20401.1.1');ok('visGen không đụng bản lưu thật (S.nid giữ nguyên)',T.S.nid===777);T.S=S0;}
// 2. khóa theo cấp và hướng dẫn
{const S=reset(4);run(120);ok('Cấp 4: chưa có bé lạ nào ghé',!S.vis);
 const S2=reset(6);S2.tut={step:'feed',got:{},hints:{}};run(120);ok('Đang hướng dẫn tân thủ: chưa có bé lạ',!S2.vis);
 const S3=reset(5);run(10);ok('Cấp 5: bé lạ đầu tiên ghé sau vài phút',!!(S3.vis&&S3.vis.cur),S3.vis&&S3.vis.n);}
// 3. tần suất và giới hạn mỗi ngày (đang mở game và lúc vắng)
{for(const sim of [false,true]){
  const S=reset(8);T.setToff(0);const d0=today();const per={},nw={};let maxNew=0;
  // bắt đầu ngay đầu một ngày theo giờ Việt Nam để đếm theo ngày cho gọn
  const st=(d0+1)*86400000-7*3600000-Date.now()+MIN;T.setToff(st);
  for(let i=0;i<3*24*60;i++){T.setToff(T.TOFF+MIN);const before=S.vis?S.vis.n:0,cu0=S.vis&&S.vis.cur;T.tick(60,sim);
    const V=S.vis,d=today();if(V&&V.cur&&V.cur!==cu0){per[d]=(per[d]||0)+1}}
  const days=Object.keys(per),max=Math.max(...days.map(d=>per[d]));
  const V=S.vis,us={};V.us.forEach(x=>{const d=x.split('.')[0];us[d]=(us[d]||0)+1});maxNew=Math.max(0,...Object.values(us));
  ok((sim?'Lúc vắng':'Đang mở game')+': mỗi ngày tối đa '+T.VIS.perDay+' lượt ghé, và có ghé',max<=T.VIS.perDay&&days.length>=3&&days.every(d=>per[d]>=3),JSON.stringify(per));
  ok((sim?'Lúc vắng':'Đang mở game')+': mỗi ngày tối đa '+T.VIS.newPerDay+' bé lạ mới',maxNew<=T.VIS.newPerDay&&maxNew>=1,JSON.stringify(us));
 }}
// 4. độ hút: bát có món khoái khẩu, đồ bé thích
{const S=reset(8);S.rooms.bedroom={bowlAt:0,at:1};T.giveBowl('bedroom');
 const id=T.visNewId(today()),c=T.visCat(id),fv=T.favs(c)[0];
 const b=S.items.find(i=>i.room==='bedroom'&&T.FURN[i.fid].bowl);
 const a0=T.visAttract(id,'bedroom');b.fl=[fv||'kibble'];b.left=1;const a1=T.visAttract(id,'bedroom');
 ok('Bát có món khoái khẩu làm phòng hút bé hơn',a1>=a0+2.9,a0+' → '+a1+' ('+fv+')');
 ok('Bé vào phòng hút nhất',T.visBest(id).rid==='bedroom');
 const r=T.visStart(null,null,false);ok('Lượt ghé chọn đúng phòng hút nhất',r&&r.rid===T.visBest(r.id).rid,r&&r.rid);
 // ứng viên được chọn là ứng viên bị nhà hút nhất
 const d=today(),sl=d+'.1';let best=-1,bk='';for(let k=0;k<3;k++){const x=T.visBest(sl+'.'+k).sc;if(x>best){best=x;bk=sl+'.'+k}}
 ok('Bé lạ mới là ứng viên bị nhà hút nhất trong '+T.VIS.cand+' ứng viên',T.visNewId(d)===bk,bk);}
// 5. làm quen: ghé, vuốt ve, mời ăn, đủ điểm thì muốn ở lại
{const S=reset(8);const r=T.visStart(null,'living',false);const g=S.vis.g[r.id];
 ok('Mỗi lần ghé được '+T.VIS.pts.visit+'–'+(T.VIS.pts.visit+T.VIS.pts.attr)+' điểm',g.pts>=T.VIS.pts.visit&&g.pts<=T.VIS.pts.visit+T.VIS.pts.attr,g.pts);
 ok('Lần đầu ghé để lại kỷ vật (xu hoặc món đồ rẻ trong kho)',!!r.gift&&(r.gift.coins>0||(r.gift.fid&&S.items.some(i=>i.fid===r.gift.fid&&i.room===null))),JSON.stringify(r.gift));
 const p0=g.pts;ok('Vuốt ve +'+T.VIS.pts.pet+' một lần mỗi lượt',T.visPet()===T.VIS.pts.pet&&T.visPet()===0&&g.pts===p0+T.VIS.pts.pet);
 const fv=T.favs(T.visCat(r.id))[0]||'kibble',c0=S.coins;S.fdinv={};const f=T.visFeed(fv);
 ok('Mời ăn món khoái khẩu: thêm điểm, trả giá một suất khi kho trống',!f.err&&f.n>=T.VIS.pts.feed&&S.coins===c0-f.cost&&f.cost>0,JSON.stringify(f));
 ok('Mời ăn một lần mỗi lượt',!!T.visFeed('kibble').err);
 T.visEnd();ok('Bé về: hết lượt ghé, hẹn lượt sau',!S.vis.cur&&S.vis.next>T.now());
 S.fdinv={kibble:3};S.vis.n=0;const r2=T.visStart(r.id,'living',false);const c1=S.coins,f2=T.visFeed('kibble');
 ok('Bé quen quay lại; mời ăn lấy từ kho thức ăn trước (không trừ xu)',r2&&r2.id===r.id&&!r2.gift&&S.fdinv.kibble===2&&S.coins===c1&&f2.cost===0);
 N.length=0;g.pts=95;T.visPet();ok('Đủ '+T.VIS.need+' điểm: bé muốn ở lại, game báo',g.st==='ready'&&g.pts===T.VIS.need&&N.some(m=>/muốn ở lại/.test(m)),N.join(' | '));}
// 6. nhận nuôi và để bé đi
{const S=reset(8);const r=T.visStart(null,'living',false),id=r.id,n0=S.cats.length;
 ok('Chưa đủ thân thì không nhận nuôi được',!!T.visAdopt(id).err);
 S.vis.g[id].pts=100;S.vis.g[id].st='ready';const a=T.visAdopt(id),c=a.cat,gen=T.visGen(id);
 ok('Nhận nuôi: thành mèo thường mang mã khách, đúng giống, sao, màu, thuộc tính',c&&S.cats.length===n0+1&&c.vq===id&&c.sp===gen.sp&&c.star===gen.star&&(c.coat||'')===(gen.coat||'')&&JSON.stringify(c.traits)===JSON.stringify(gen.traits));
 ok('Bé vào phòng còn chỗ, được ghi đã gặp; lượt ghé kết thúc',c.room==='living'&&S.seen[c.sp]&&!S.vis.cur&&S.vis.ad.includes(id)&&!S.vis.g[id]);
 ok('Không nhận nuôi lại được cùng một bé',!!T.visAdopt(id).err);
 // phòng đầy: vào Phòng chờ
 const S2=reset(8);while(S2.cats.length<8)mkCat('muop');const r2=T.visStart(null,'living',false);S2.vis.g[r2.id].pts=100;S2.vis.g[r2.id].st='ready';
 ok('Phòng đã đầy: bé nhận nuôi vào Phòng chờ',T.visAdopt(r2.id).cat.room==='wait');
 const S3=reset(8);const r3=T.visStart(null,'living',false);ok('Để bé đi: bé không còn trong danh sách, lượt ghé kết thúc',T.visLetGo(r3.id)&&!S3.vis.g[r3.id]&&!S3.vis.cur);}
// 7. bé quen quá hạn thì đi xa; bản lưu cũ
{const S=reset(8);const r=T.visStart(null,'living',false);T.visEnd();const id=r.id;
 T.setToff(T.TOFF+(T.VIS.life+1)*86400000);T.tick(1);ok('Quá '+T.VIS.life+' ngày: bé đi xa, không ghé nữa',!S.vis.g[id]);
 STORE=JSON.stringify(Object.assign(JSON.parse(JSON.stringify(reset(8))),{last:Date.now()}));T.setToff(0);delete JSON.parse(STORE).vis;
 const o=JSON.parse(STORE);delete o.vis;STORE=JSON.stringify(o);T.load();ok('Bản lưu cũ (không có S.vis) tải được, tick tạo trạng thái mới',(T.tick(1),!!T.S.vis&&Array.isArray(T.S.vis.ad)));
 STORE=JSON.stringify(T.S);T.load();ok('Lưu và tải lại giữ nguyên trạng thái mèo ghé chơi',!!T.S.vis&&T.S.vis.day===today());}
// 8. trọng tài máy chủ
{const q=o=>{const r=require('child_process').spawnSync('node',[path.join(R,'tools/guard.js')],{input:o.map(x=>JSON.stringify(x)).join('\n')+'\n',encoding:'utf8'});
   try{return r.stdout.trim().split('\n').slice(1).map(l=>JSON.parse(l))}catch(e){return [{err:r.stderr.slice(0,300)}]}};
 const S=reset(8);T.setToff(0);const r=T.visStart(null,'living',false),id=r.id;S.vis.g[id].pts=100;S.vis.g[id].st='ready';S.nid+=0;
 const OLD=JSON.parse(JSON.stringify(S));T.visAdopt(id);const NEU=JSON.parse(JSON.stringify(S)),c=NEU.cats.find(x=>x.vq===id);
 const base={old:OLD,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}};
 const W=(f,extra)=>{const n=JSON.parse(JSON.stringify(NEU));f(n,n.cats.find(x=>x.vq===id));return Object.assign({neu:n},base,extra||{})};
 const [a,b1,b2,b3,b4,b5,b6,b7]=q([Object.assign({neu:NEU},base),
   W((n,x)=>{x.star=Math.min(4,x.star+1)}),
   W((n,x)=>{x.sp=x.sp==='muop'?'xiem':'muop'}),
   W((n,x)=>{x.traits=['lucky'].concat(x.traits.slice(1))}),
   W((n,x)=>{n.vis.ad=[]}),
   W((n,x)=>{const p=T.visParse(id);x.vq=(p.d+5)+'.'+p.s+'.'+p.k;n.vis.ad=[x.vq]}),
   W((n,x)=>{const y=JSON.parse(JSON.stringify(x));y.uid=n.nid++;n.cats.push(y)}),
   W((n,x)=>{const p=T.visParse(id),o=p.d+'.'+p.s+'.'+((p.k+1)%3),g=T.visGen(o);const y=Object.assign(JSON.parse(JSON.stringify(x)),{uid:n.nid++,vq:o,sp:g.sp,star:g.star,sex:g.sex,traits:g.traits});if(g.coat)y.coat=g.coat;else delete y.coat;n.cats.push(y);n.vis.ad.push(o)})]);
 ok('Trọng tài nhận bé nhận nuôi hợp lệ',a&&a.ok===1,JSON.stringify(a).slice(0,200));
 ok('Từ chối bé nhận nuôi bị sửa sao',b1&&b1.ok===0,b1&&b1.why);
 ok('Từ chối bé nhận nuôi bị đổi giống',b2&&b2.ok===0,b2&&b2.why);
 ok('Từ chối bé nhận nuôi bị đổi thuộc tính',b3&&b3.ok===0,b3&&b3.why);
 ok('Từ chối bé không ghi trong danh sách nhận nuôi',b4&&b4.ok===0,b4&&b4.why);
 ok('Từ chối mã khách của ngày chưa tới',b5&&b5.ok===0,b5&&b5.why);
 ok('Từ chối bé nhận nuôi nhân đôi (cùng mã)',b6&&b6.ok===0,b6&&b6.why);
 ok('Từ chối hai bé cùng một lượt (ngày.lượt)',b7&&b7.ok===0,b7&&b7.why);
 // lần đồng bộ sau: phóng sinh rồi nhận nuôi lại cùng bé, xóa dấu, đổi mã bé đã có
 const O2=NEU,base2={old:O2,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}};
 const W2=f=>{const n=JSON.parse(JSON.stringify(O2));f(n);return Object.assign({neu:n},base2)};
 const [o1,c1,c2,c3,c4]=q([Object.assign({neu:O2},base2),
   W2(n=>{const x=n.cats.find(y=>y.vq===id);n.cats=n.cats.filter(y=>y!==x);n.released=(n.released||0)+1;const y=Object.assign({},x,{uid:n.nid++});n.cats.push(y)}),
   W2(n=>{n.vis.ad=n.vis.ad.filter(x=>x!==id)}),
   W2(n=>{const x=n.cats.find(y=>y.vq===id);delete x.vq}),
   Object.assign(W2(n=>{n.vis.ad=n.vis.ad.filter(x=>x!==id)}),{now:Date.now()+(T.VIS.keep+3)*86400000})]);
 ok('Lần sau: bản lưu không đổi vẫn hợp lệ',o1&&o1.ok===1,JSON.stringify(o1).slice(0,160));
 ok('Từ chối phóng sinh rồi nhận nuôi lại cùng bé',c1&&c1.ok===0,c1&&c1.why);
 ok('Từ chối xóa dấu bé đã nhận nuôi',c2&&c2.ok===0,c2&&c2.why);
 ok('Từ chối đổi mã của bé đã có',c3&&c3.ok===0,c3&&c3.why);
 ok('Quá hạn trọng tài: dấu cũ được phép rơi khỏi danh sách',c4&&c4.ok===1,JSON.stringify(c4).slice(0,160));
 // bản lưu không có mèo ghé chơi vẫn qua
 const S5=reset(8);delete S5.vis;const P=JSON.parse(JSON.stringify(S5)),Q=JSON.parse(JSON.stringify(S5));Q.coins+=50;
 const [z]=q([{old:P,neu:Q,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}}]);ok('Bản lưu không có S.vis vẫn hợp lệ',z&&z.ok===1,JSON.stringify(z).slice(0,160));}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
