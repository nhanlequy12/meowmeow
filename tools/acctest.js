"use strict";
/* Kiểm thử phụ kiện đội (chạy: node tools/acctest.js [--quick]).
   Dùng đúng mã game: data.js … garden-data.js, acc-data.js, sprites.js, art.js, catkit.js, js/cats/*, acc-art.js, game.js, wx.js, pw.js, med.js, meal.js, stray.js, garden.js, acc.js,
   cùng trọng tài tools/guard.js. Phần vẽ: mọi phụ kiện × 5 giống mẫu × mọi khung; mọi giống và mèo trang phục × mọi khung với hai cặp phụ kiện xoay vòng
   (--quick: bỏ phần này). Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..'),QUICK=process.argv.includes('--quick');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
globalThis.performance=globalThis.performance||{now:()=>Date.now()};
const files=['js/data.js','js/wx-data.js','js/pw-data.js','js/med-data.js','js/garden-data.js','js/acc-data.js','js/sprites.js','js/art.js','js/catkit.js'];
fs.readdirSync(path.join(R,'js/cats')).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push('js/cats/'+f));
files.push('js/acc-art.js','js/game.js','js/wx.js','js/pw.js','js/med.js','js/meal.js','js/stray.js','js/garden.js','js/acc.js');
(0,eval)(files.filter(f=>fs.existsSync(path.join(R,f))).map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,newCat,tick,load,save,lk,lk0,happyTarget,rehome,catBy,look,Art,CatKit,ACC,ACCS,ACC_LV,ACC_HP_CAP,FEATS,FCATS,SP,BREEDS,VARIANTS,COATS,
    accS,accOpen,accOwn,accWorn,accTotal,accOf,accSfx,accKey,accBase,accHp,accBuy,accWear,accOff,accStrip,accFix,accHidden,accParse,ACCART,setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
const reset=lv=>{STORE=null;T.fresh();const S=T.S;S.tut={done:1,hints:{},got:{}};S.coins=100000;S.level=lv||12;
  while(S.cats.length<3){const c=T.newCat(T.SP.muop,1);c.room='living';S.cats.push(c)}return S};

// 1. dữ liệu
ok('Có 10–14 phụ kiện, id không trùng, đủ hai ô',T.ACCS.length>=10&&T.ACCS.length<=14&&new Set(T.ACCS.map(a=>a.id)).size===T.ACCS.length&&T.ACCS.some(a=>a.sl==='h')&&T.ACCS.some(a=>a.sl==='n'),T.ACCS.length);
ok('Mở từ cấp 4, món sớm nhất cấp 4, độ vui 1–2',T.ACC_LV===4&&Math.min(...T.ACCS.map(a=>a.ul))===4&&T.ACCS.every(a=>a.hp>=1&&a.hp<=2&&a.price>0));
ok('FEATS có dòng phụ kiện cấp 4, FCATS có mục acc',T.FEATS.some(f=>f.id==='acc'&&f.lv===4)&&T.FCATS.some(c=>c[0]==='acc'));
ok('Mọi món có hình ở đúng ô',T.ACCS.every(a=>(a.sl==='h'?T.ACCART.HEAD:T.ACCART.NECK)[a.id]));

// 2. bản lưu cũ, khóa cấp
{const S=reset(3);delete S.acc;ok('Bản lưu cũ không có S.acc: accS() tạo kho rỗng',T.accOwn('bow')===0&&S.acc&&S.acc.own);
 ok('Dưới cấp 4: chưa mở, mua bị từ chối',!T.accOpen()&&!!T.accBuy('bow').err&&S.coins===100000);
 S.level=4;ok('Cấp 4: mở; món cấp 10 vẫn khóa',T.accOpen()&&!!T.accBuy('pearls').err&&S.coins===100000);}

// 3. mua, đeo, đổi, tháo
{const S=reset(12),c=S.cats[0],c2=S.cats[1],u=c.uid;
 const r=T.accBuy('bow');ok('Mua Nơ cài tai: trừ đúng giá, vào kho',r.n===1&&S.coins===100000-T.ACC.bow.price&&T.accOwn('bow')===1);
 const r2=T.accBuy('crown',2);ok('Mua 2 vương miện',r2.n===2&&T.accOwn('crown')===2&&S.coins===100000-T.ACC.bow.price-2*T.ACC.crown.price);
 S.coins=10;ok('Thiếu xu thì không mua được',!!T.accBuy('bell').err&&S.coins===10);S.coins=100000;
 ok('Đeo món chưa có trong kho bị từ chối',!!T.accWear(u,'bell').err);
 ok('Đeo nơ: kho về 0, bé có c.acc.h',!T.accWear(u,'bow').err&&T.accOwn('bow')===0&&c.acc.h==='bow'&&T.accWorn('bow')===1&&T.accTotal('bow')===1);
 ok('Kho hết thì bé khác không đeo được',!!T.accWear(c2.uid,'bow').err);
 T.accWear(u,'crown');ok('Đổi sang vương miện: nơ về kho',c.acc.h==='crown'&&T.accOwn('bow')===1&&T.accOwn('crown')===1);
 T.accBuy('scarf');T.accWear(u,'scarf');ok('Ô cổ độc lập ô đầu',c.acc.h==='crown'&&c.acc.n==='scarf');
 ok('Hậu tố khóa ngoại hình','~@crown.scarf'===T.accSfx(c)&&T.accKey(c)===T.accBase(c)+'~@crown.scarf');
 ok('lk() của game gộp hậu tố phụ kiện, lk0() thì không (seenCoat dùng lk0)',String(T.lk(c)).endsWith('~@crown.scarf')&&!String(T.lk0(c)).includes('~@'));
 T.accOff(u,'n');ok('Tháo khăn: về kho, bé chỉ còn ô đầu',T.accOwn('scarf')===1&&!c.acc.n&&c.acc.h==='crown');
 T.accOff(u,'h');ok('Tháo hết: c.acc bị xóa',!c.acc&&T.accOwn('crown')===2);
 S.trips.push({uid:c2.uid,did:'alley',start:Date.now(),end:Date.now()+600000});ok('Bé đang vắng nhà không đeo được',!!T.accWear(c2.uid,'bow').err);S.trips.length=0;}

// 4. độ vui
{const S=reset(12),c=S.cats[0],u=c.uid;c.full=80;const h0=T.happyTarget(c);
 T.accBuy('bow');T.accWear(u,'bow');ok('Nơ (+1 vui) cộng vào độ vui hướng tới',T.happyTarget(c)===Math.min(100,h0+1),h0+' → '+T.happyTarget(c));
 T.accBuy('pearls');T.accWear(u,'pearls');ok('Tổng tối đa +'+T.ACC_HP_CAP,T.accHp(c)===T.ACC_HP_CAP&&T.happyTarget(c)===Math.min(100,h0+T.ACC_HP_CAP));}

// 5. phóng sinh trả món về kho
{const S=reset(12),c=S.cats[2],u=c.uid;T.accBuy('party');T.accBuy('bell');T.accWear(u,'party');T.accWear(u,'bell');
 const g=T.rehome(u);ok('Phóng sinh: bé đi, phụ kiện về kho',!!g&&!T.catBy(u)&&T.accOwn('party')===1&&T.accOwn('bell')===1);}

// 6. lưu, tải lại, dọn id lạ
{const S=reset(12),c=S.cats[0],u=c.uid;T.accBuy('beanie');T.accWear(u,'beanie');T.accBuy('flowers',3);S.cats[1].acc={h:'khongco',n:'bow',x:1};S.acc.own.zz=4;S.acc.own.flowers=3;T.save();
 T.load();const S2=T.S,c1=T.catBy(u),c2=S2.cats[1];
 ok('Tải lại: kho và món đang đeo giữ nguyên',c1.acc&&c1.acc.h==='beanie'&&T.accOwn('flowers')===3);
 ok('Tải lại: bỏ id lạ, món sai ô, khóa lạ',!c2.acc&&!S2.acc.own.zz);
 const old=JSON.parse(STORE);delete old.acc;old.cats.forEach(x=>delete x.acc);STORE=JSON.stringify(old);T.load();ok('Bản lưu cũ (không có phụ kiện) tải được',T.accOwn('bow')===0&&T.S.cats.every(x=>!x.acc));}

// 7. khóa ngoại hình và danh sách ẩn
{const p=T.accParse('muop~mackerel~@bow.bell');ok('Đọc hậu tố',p&&p.base==='muop~mackerel'&&p.h==='bow'&&p.n==='bell');
 const s=T.look('muop~@bow.');ok('look() hiểu hậu tố, giữ ngoại hình gốc',s.acc&&s.acc.h==='bow'&&s.id==='muop'&&T.look('muop').acc===undefined);
 const g=T.look('v_gojo~@crown.scarf');ok('Gojo (băng mắt), Naruto (băng trán), Vader (mũ): ẩn ô đầu',T.accHidden(g,'h')&&T.accHidden(T.look('v_naruto'),'h')&&T.accHidden(T.look('v_vader'),'h'));
 ok('Giống thật không ẩn gì',T.BREEDS.every(b=>!T.accHidden(T.look(b.id),'h')&&!T.accHidden(T.look(b.id),'n')));
 const k='v_gojo~'+T.SP.v_gojo.coats[0],a=T.Art.cat(T.look(k),'sit'),b=T.Art.cat(T.look(k+'~@crown.'),'sit');
 ok('Ô bị ẩn thì không vẽ gì thêm',a&&b&&a.c.every((x,i)=>String(x)===String(b.c[i])));}

// 8. vẽ: mọi phụ kiện bám theo đầu, cổ ở mọi khung; không vẽ dưới hàng 77; không đổi ô nào ngoài vùng của phụ kiện
const POSES=[...[0,1,2,3].map(i=>'sit'+i+'s'),...[0,1,2,3].map(i=>'sleep'+i+'s'),...[0,1,2,3,4,5].map(i=>'groom'+i+'s'),'stand',...[0,1,2,3,4,5,6,7].map(i=>'walk'+i+'s'),...[0,1,2,3,4,5,6,7].map(i=>'run'+i+'s'),...[0,1,2,3,4,5,6,7].map(i=>'jump'+i+'s')];
function check(key,pose,sfx,want){
  const s0=T.look(key),s1=T.look(key+sfx),a=T.Art.cat(s0,pose),b=T.Art.cat(s1,pose);if(!a||!b)return 'không dựng được';
  const F=T.CatKit.frameOf(s1,pose),A=F.A,W=b.W,side=F.view==='side';let n=0,low=0,bad=0;
  const hx=side?(A.earN[0]+A.earF[0])/2:A.crown[0],top=Math.min(A.crown[1],side?Math.min(A.earN[1],A.earF[1]):Math.min(A.earL[1],A.earR[1]))-20;
  for(let i=0;i<W*80;i++){if(String(a.c[i])===String(b.c[i]))continue;n++;const xf=i%W,y=(i-xf)/W,x=side?W-1-xf:xf;if(y>77)low++;
    // vùng cho phép: đồ đầu quanh đầu (từ trên chóp tai 20 ô tới cằm), đồ cổ quanh cổ (từ dưới mắt tới đáy)
    if(want==='h'&&(y<top||y>A.chin[1]+4||Math.abs(x-hx)>32))bad++;
    if(want==='n'&&(y<(side?A.eye[1]:A.eyeL[1])||Math.abs(x-(side?A.neck[0]+10:A.neck[0]))>30))bad++}
  return {n,low,bad}}
if(!QUICK){
  const B5=['muop','munchkin','persian','scottish','sphynx'];let errs=[],cnt=0,empty=[];
  T.ACCS.forEach(a=>B5.forEach(k=>POSES.forEach(p=>{const sfx=a.sl==='h'?'~@'+a.id+'.':'~@.'+a.id,r=check(k,p,sfx,a.sl);cnt++;
    if(typeof r==='string'||r.low||r.bad)errs.push(a.id+' '+k+' '+p+' '+JSON.stringify(r));
    else if(!r.n&&!(a.sl==='n'&&/^sleep/.test(p)))empty.push(a.id+' '+k+' '+p)})));
  ok('Mọi phụ kiện × 5 giống (thường, chân ngắn, lông dài, tai cụp, không lông) × '+POSES.length+' khung: vẽ được, trong vùng đầu/cổ, không dưới hàng 77',!errs.length,cnt+' hình'+(errs.length?'; '+errs.slice(0,4).join(' | '):''));
  ok('Phụ kiện luôn hiện (trừ đồ cổ lúc ngủ có thể bị đầu che)',!empty.length,empty.slice(0,6).join(' | '));
  const H=T.ACCS.filter(a=>a.sl==='h'),N=T.ACCS.filter(a=>a.sl==='n'),looks=[];
  T.BREEDS.forEach(b=>looks.push(b.id));T.VARIANTS.forEach(v=>{looks.push(v.id);(v.coats||[]).forEach(ct=>{if((T.COATS[ct]||{}).form)looks.push(v.id+'~'+ct)})});
  T.BREEDS.filter(b=>b.r===5).forEach(b=>b.coats.forEach(ct=>{if((T.COATS[ct]||{}).form)looks.push(b.id+'~'+ct)}));
  let e2=[],c2=0;const t0=Date.now();
  looks.forEach((k,j)=>[0,1].forEach(q=>{const h=H[(j*2+q)%H.length].id,n=N[(j*2+q)%N.length].id;POSES.forEach(p=>{c2++;try{const b=T.Art.cat(T.look(k+'~@'+h+'.'+n),p),b0=T.Art.cat(T.look(k),p);if(!b)e2.push(k+' '+p+' null');else{for(let y=78;y<80;y++)for(let x=0;x<b.W;x++)if(String(b.c[y*b.W+x])!==String(b0.c[y*b.W+x])){e2.push(k+' '+p+' dưới đáy');y=99;break}}}catch(e){e2.push(k+' '+p+' '+e.message)}})}));
  ok('Mọi giống và mèo trang phục ('+looks.length+' ngoại hình) × '+POSES.length+' khung × 2 cặp phụ kiện: không lỗi',!e2.length,c2+' hình, '+((Date.now()-t0)/1000).toFixed(0)+' giây'+(e2.length?'; '+e2.slice(0,4).join(' | '):''));
}

// 9. trọng tài máy chủ nhận bản lưu có phụ kiện, vẫn bắt gian lận xu
{const S=reset(12);const OLD=JSON.parse(JSON.stringify(S));T.accBuy('bow');T.accBuy('scarf');T.accWear(S.cats[0].uid,'bow');T.accWear(S.cats[1].uid,'scarf');
 const NEU=JSON.parse(JSON.stringify(S)),q=o=>{const r=require('child_process').spawnSync('node',[path.join(R,'tools/guard.js')],{input:JSON.stringify(o)+'\n',encoding:'utf8'});try{return JSON.parse(r.stdout.trim().split('\n').pop())}catch(e){return {err:r.stderr.slice(0,200)}}};
 const base={old:OLD,dt:600,issued:[],ack:0,pity:0,gift:{},budget:{c:5000,x:200}},a=q(Object.assign({neu:NEU},base));
 ok('tools/guard.js nhận bản lưu có phụ kiện',a.ok===1,JSON.stringify(a).slice(0,160));
 const bad=JSON.parse(JSON.stringify(NEU));bad.coins+=200000;const z=q(Object.assign({neu:bad},base));ok('tools/guard.js vẫn bắt gian lận xu',z.ok===0,z.why);}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
