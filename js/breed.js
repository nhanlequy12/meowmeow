"use strict";
/* ============ GHÉP ĐÔI RA MÈO CON (2026-11-11) ============
   Ổ ghép đôi nằm đầu tab Mèo, mở từ cấp NEST_LV; có 1 ổ, từ cấp NEST_LV2 có 2 ổ.
   Chọn một bé cái và một bé đực: giống thật (không phải mèo trang phục), đã trưởng thành, đang ở nhà (không ở Phòng chờ, không viễn chinh),
   chưa ở ổ nào. Tốn xu nestCost, đợi nestHours giờ thật. Bố mẹ vẫn sinh hoạt bình thường trong lúc chờ.
   Mèo con (born = lúc đón, nên là "mèo con" 3 ngày đầu):
     - giống của bố hoặc mẹ (mỗi bên 50%), số sao theo giống như gacha;
     - màu lông: 60% lấy màu của bố hoặc mẹ nếu màu đó có ở giống được chọn, còn lại chọn ngẫu nhiên như gacha;
     - màu hiếm: bố hoặc mẹ mang màu hiếm thì 25% con thừa hưởng, ngoài ra 2% ra một màu hiếm bất kỳ; mèo màu hiếm luôn 4★ như gacha;
     - thuộc tính: tung lại theo sao, 50% thừa hưởng một thuộc tính tốt của bố mẹ.
   Ổ lưu ở S.nest[i] = {a, b (ảnh chụp bố mẹ lúc ghép: uid, tên, giống, màu, sao, thuộc tính), start, end}; bố mẹ có bị phóng sinh thì vẫn ra mèo con. */
const NEST_LV=5,NEST_LV2=12;
const BREED_SET=new Set(BREEDS.map(b=>b.id));
const nestSlots=()=>S.level>=NEST_LV2?2:S.level>=NEST_LV?1:0;
const nestCost=(a,b)=>r10(150*(a.star+b.star)*(1+qLv()/6));
const nestHours=(a,b)=>a.star+b.star;
const nests=()=>{S.nest=S.nest||[];while(S.nest.length<nestSlots())S.nest.push(null);return S.nest};
const inNest=uid=>nests().some(n=>n&&(n.a.uid===uid||n.b.uid===uid));
const canBreed=c=>BREED_SET.has(c.sp)&&ageStage(c)===1&&c.room!=='wait'&&!onTrip(c.uid)&&!inNest(c.uid);
const nestReady=()=>qOn()&&nests().some(n=>n&&now()>=n.end);
const snap=c=>({uid:c.uid,name:c.name,sp:c.sp,coat:c.coat,star:c.star,sex:c.sex,traits:c.traits.slice()});
const hms=ms=>{const s=Math.max(0,Math.ceil(ms/1000)),h=Math.floor(s/3600),m=Math.floor(s%3600/60);return h?h+' giờ '+m+' phút':m?m+' phút '+(s%60)+' giây':s+' giây'};

function makeKitten(a,b){
  const pa=Math.random()<.5?a:b,sp=SP[pa.sp];
  const rareP=[a,b].filter(p=>RARE[p.coat]).map(p=>p.coat);
  let coat=null;
  if(!sp.noRare&&rareP.length&&ch(.25))coat=pick(rareP);
  else if(!sp.noRare&&ch(.02))coat=pick(RARES).id;
  const rare=!!coat;
  if(!coat&&sp.coats){const own=[a,b].map(p=>p.coat).filter(k=>k&&sp.coats.includes(k));if(own.length&&ch(.6))coat=pick(own)}
  const c=newCat(sp,rare?4:sp.r,coat||undefined);
  // 50%: thay thuộc tính tung ngẫu nhiên cuối cùng bằng một thuộc tính tốt của bố mẹ (không đụng thuộc tính cố định của giống, của màu hiếm; không trùng, không xung khắc)
  const fixed=[sp.xt,sp.bt,coat&&ALLCOAT[coat]&&ALLCOAT[coat].tr].filter(Boolean).length;
  if(ch(.5)&&c.traits.length>fixed){const keep=c.traits.slice(0,-1),good=[...new Set(a.traits.concat(b.traits))].filter(t=>TRAITS[t]&&TRAITS[t].k==='g'&&!c.traits.includes(t)&&!keep.some(o=>conflict(o,t)));
    if(good.length)c.traits[c.traits.length-1]=pick(good)}
  c.born=now();c.ma=a.name;c.pa=b.name;c.isNew=!S.seen[sp.id]||(rare?!(S.seenRare||{})[coat]:(sp.coats&&!(S.seenCoat||{})[lk(c)]));
  return c;
}
function nestStart(fu,mu,slot){
  const f=catBy(fu),m=catBy(mu),N=nests();
  if(!f||!m||f.sex!=='f'||m.sex!=='m'||!canBreed(f)||!canBreed(m))return toast('Hai bé này chưa ghép đôi được.',{type:'warn'});
  if(slot==null)slot=N.findIndex(n=>!n);if(slot<0||N[slot])return toast('Các ổ đang bận.',{type:'warn'});
  const cost=nestCost(f,m);if(S.coins<cost)return toast('Không đủ xu.',{type:'warn'});
  S.coins-=cost;N[slot]={a:snap(f),b:snap(m),start:now(),end:now()+nestHours(f,m)*3600000};addXp(5);onAct('nest',1);save();
  closeModal();toast(f.name+' và '+m.name+' đã vào ổ. Mèo con chào đời sau '+nestHours(f,m)+' giờ.',{type:'cat',title:'💞 Ghép đôi',icon:'💞'});render();
}
function nestClaim(i){
  const N=nests(),n=N[i];if(!n||now()<n.end)return;
  const c=makeKitten(n.a,n.b);c.room=freeRoom();S.cats.push(c);markSeen(c);N[i]=null;addXp(10);onAct('kitten',1);save();
  syncEnts();render();
  toast('Con của '+n.a.name+' và '+n.b.name+': '+c.name+', '+SP[c.sp].n+(isRare(c)?' màu hiếm '+coatOf(c).n:'')+(c.room==='wait'?'. Hết chỗ nên bé đang ở Phòng chờ.':'.'),{type:'cat',title:'🍼 Mèo con chào đời!',icon:'🍼',ms:10000});
  openCat(c.uid);
}
function nestCancel(i){const N=nests();if(!N[i])return;N[i]=null;save();closeModal();toast('Đã hủy ghép đôi. Xu đã trả không hoàn lại.',{type:'warn'});render()}
function askNestCancel(i){modal('<h3>Hủy ghép đôi?</h3><div class="dim">Xu đã trả không được hoàn lại.</div><div class="row" style="margin-top:10px"><button style="flex:1" class="bad" onclick="nestCancel('+i+')">Hủy ổ</button><button style="flex:1" onclick="closeModal()">Thôi</button></div>')}

/* ---------- giao diện: thẻ ổ ở đầu tab Mèo, hộp chọn đôi ---------- */
function nestCard(){
  if(!qOn())return '';
  if(!nestSlots())return '<div class="card"><div style="font-size:24px">💞</div><div class="g"><b>Ổ ghép đôi</b><br><small>Mở ở cấp '+NEST_LV+': ghép một bé cái và một bé đực để có mèo con.</small></div></div>';
  const N=nests();
  return '<div class="card nestc" style="flex-direction:column;align-items:stretch"><div><b>💞 Ổ ghép đôi</b> <small class="dim">· '+N.length+' ổ'+(N.length<2?', thêm ổ thứ hai ở cấp '+NEST_LV2:'')+'</small></div>'+
    N.map((n,i)=>!n?'<div class="row"><span class="dim" style="flex:1">Ổ '+(i+1)+' đang trống.</span><button class="sm on" onclick="openNest('+i+')">💞 Ghép đôi</button></div>'
      :now()>=n.end?'<div class="row"><span style="flex:1">Ổ '+(i+1)+': <b>'+esc(n.a.name)+'</b> ♀ và <b>'+esc(n.b.name)+'</b> ♂ · mèo con đã chào đời!</span><button class="sm go" onclick="nestClaim('+i+')">🍼 Đón mèo con</button></div>'
      :'<div><div class="row"><span style="flex:1">Ổ '+(i+1)+': <b>'+esc(n.a.name)+'</b> ♀ và <b>'+esc(n.b.name)+'</b> ♂ · còn '+hms(n.end-now())+'</span><button class="sm" aria-label="Hủy ổ" onclick="askNestCancel('+i+')">✕</button></div><div class="bar"><i style="width:'+Math.min(100,(now()-n.start)/(n.end-n.start)*100)+'%"></i></div></div>').join('')+'</div>';
}
let nsel={f:null,m:null,slot:0};
function openNest(slot){nsel={f:null,m:null,slot};nestModal()}
function nestModal(){
  const L=S.cats.filter(canBreed).sort((a,b)=>b.star-a.star||SP[a.sp].n.localeCompare(SP[b.sp].n,'vi')),F=L.filter(c=>c.sex==='f'),M=L.filter(c=>c.sex==='m');
  const f=catBy(nsel.f),m=catBy(nsel.m);
  const col=(arr,k,lb)=>'<div class="qhd"><b>'+lb+'</b> <small class="dim">· '+arr.length+' bé</small></div>'+(arr.length?'<div class="nestl">'+arr.map(c=>'<div class="card tap'+(nsel[k]===c.uid?' sel':'')+'" onclick="nsel.'+k+'='+c.uid+';nestModal()">'+catTag(lk(c),1)+'<div class="g"><b>'+esc(c.name)+'</b> '+starsC(c)+'<br><small>'+SP[c.sp].n+(coatOf(c)?' · '+coatOf(c).n:'')+'</small></div></div>').join('')+'</div>':'<div class="dim">Chưa có bé nào đủ điều kiện.</div>');
  let pre='<div class="dim">Chọn một bé cái và một bé đực.</div>',btn='';
  if(f&&m){const sp=[...new Set([SP[f.sp].n,SP[m.sp].n])].join(' hoặc '),cost=nestCost(f,m);
    pre='<div class="card" style="flex-direction:column;align-items:stretch"><b>'+esc(f.name)+' ♀ + '+esc(m.name)+' ♂</b><small>Mèo con: '+sp+(f.coat&&RARE[f.coat]||m.coat&&RARE[m.coat]?' · có thể thừa hưởng màu hiếm':'')+' · chờ '+nestHours(f,m)+' giờ · 🪙 '+fmtN(cost)+'</small></div>';
    btn='<button class="go" style="width:100%" '+(S.coins<cost?'disabled':'')+' onclick="nestStart('+f.uid+','+m.uid+','+nsel.slot+')">💞 Ghép đôi · 🪙 '+fmtN(cost)+'</button>'}
  modal('<h3>💞 Ghép đôi</h3><div class="dim" style="margin-bottom:6px">Chỉ ghép được mèo giống thật, đã trưởng thành, đang ở nhà. Mèo con mang giống của bố hoặc mẹ, có khi thừa hưởng màu lông và một thuộc tính tốt.</div>'+
    pre+btn+col(F,'f','♀ Bé cái')+col(M,'m','♂ Bé đực'));
}
// thẻ ổ ở đầu tab Mèo; đồng hồ đếm ngược cập nhật mỗi giây mà không vẽ lại cả tab
{const pc=PANEL.cats;PANEL.cats=function(){return nestCard()+pc.apply(this,arguments)}}
{const rt=renderTop;renderTop=function(){rt.apply(this,arguments);if(tab!=='cats')return;const el=document.querySelector('#panel > .nestc');if(el&&nests().some(Boolean)){const h=emo(nestCard());if(el.outerHTML!==h)el.outerHTML=h}}}
// giới thiệu ba tính năng mới một lần cho người chơi đã xong hướng dẫn
if(typeof S!=='undefined'&&S&&qOn()&&!S.nf3){S.nf3=1;save();const nf=()=>{if($('modal').style.display==='flex'||$('gz').classList.contains('on'))return setTimeout(nf,2000);toast('Bé trong phòng có ước muốn 💭, điểm danh 7 ngày ở bảng 📜 Nhiệm vụ, ghép đôi ra mèo con ở đầu tab Mèo (từ cấp '+NEST_LV+').',{type:'level',title:'Mới: ước muốn, điểm danh, ghép đôi',icon:'💞',ms:10000})};setTimeout(nf,2500)}
