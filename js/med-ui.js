"use strict";
/* ============ NHÀ THUỐC & BỆNH VIỆN THÚ Y: GIAO DIỆN ============
   Nạp sau js/pw-ui.js và js/water-ui.js, trước js/unlock.js. Luật ở js/med.js, số liệu ở js/med-data.js, CSS ở css/med.css.
   File này không trừ xu, không đổi bệnh: mọi việc đi qua buyMed, medUse, hospAdmit.
   - openMed(tab, uid): lớp phủ #medbook (z-index 19) kiểu phòng khám, 5 mục: care (Mèo cần chăm sóc), shop (Mua thuốc), treat (Điều trị),
     hosp (Bệnh viện), log (Hồ sơ). closeMed(), medOn(). Nút mục có id mt-care, mt-shop, mt-treat, mt-hosp, mt-log.
   - Ô 🏥 trên cùng (#medchip): số bé bệnh, 🔵 và thời gian ra viện gần nhất; chưa đủ cấp thì là ô khóa.
   - Thẻ mèo: bọc wxBadges để thêm đúng MỘT nhãn trạng thái y tế (không thêm danh sách bệnh hay nút vào màn chi tiết mèo).
   - Mỗi giây: chỉ cập nhật đồng hồ đếm ngược và thanh tiến độ; cả trang chỉ vẽ lại khi tình trạng bệnh, nằm viện hoặc số xu đổi (giữ vị trí cuộn). */
const MU={tab:'care',uid:0,flt:0,busy:0,res:null,sig:'',img:{}};
const MD_TABS=[['care','🩺','Chăm sóc','Mèo cần chăm sóc'],['shop','💊','Mua thuốc','Mua thuốc'],['treat','🧪','Điều trị','Điều trị'],['hosp','🏥','Bệnh viện','Bệnh viện'],['log','📋','Hồ sơ','Hồ sơ']];
const MD_COL={y:'#d9a514',o:'#e07a1f',r:'#c8372a',b:'#3f7fd0',g:'#3c9a5f'};
const medOn=()=>{const e=$('medbook');return !!(e&&e.classList.contains('on'))};
const mdXu=n=>Math.round(n).toLocaleString('vi-VN')+' xu';
const mdCoins=()=>Math.floor(S.coins);
const mdSick=()=>S.cats.filter(c=>ills(c).length&&!inHosp(c.uid)).sort((a,b)=>medSev(b)-medSev(a));
const mdTreatable=()=>mdSick().filter(c=>!onTripReal(c.uid));
const mdInHosp=()=>S.cats.filter(c=>inHosp(c.uid)).sort((a,b)=>hospLeft(a.uid)-hospLeft(b.uid));
const mdName=c=>'<span class="md-nm">'+esc(c.name)+'</span>';
const mdDot=k=>'<i class="md-dot" style="background:'+MD_COL[MEDST[k].c]+'"></i>';
const mdSevTag=D=>'<span class="md-sev" style="--c:'+MD_COL[SEV[D.sev].c]+'">'+SEV[D.sev].n+'</span>';
const mdIllTag=e=>{const D=DIS[e.k];return '<span class="md-ill">'+D.ic+' <b>'+D.n+'</b> '+mdSevTag(D)+'</span>'};
const mdItem=id=>MED[id]||SUP[id]||{n:'thuốc',ic:'💊'};
// ảnh bé ở một dáng bất kỳ (dáng ngủ cho giường bệnh); không dựng được thì dùng ảnh ngồi
function mdCatImg(c,pose,k){
  const sp=lk(c),n=kk(k),key=sp+'|'+pose+'|'+n;let o=MU.img[key];
  if(!o){try{const cv=catCv(sp,pose,n);o={src:cvURL(cv),w:cv.width,h:cv.height}}catch(e){o=0}MU.img[key]=o||{bad:1};o=MU.img[key]}
  if(o.bad)return catTag(sp,k);const d=DPR();
  return '<img class="px" width="'+o.w/d+'" height="'+o.h/d+'" src="'+o.src+'">';
}

/* ---------- ô 🏥 trên cùng ---------- */
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);
  const top=$('top');if(!top||typeof S==='undefined'||!S)return;const el=document.createElement('div');el.id='medchip';
  if(!medOpen()){el.className='chip medchip lock';el.setAttribute('data-tip','Nhà thuốc & Bệnh viện thú y mở khóa ở cấp '+MED_LV+'.');el.innerHTML='🔒 Nhà thuốc <span class="dim">· cấp '+MED_LV+'</span>'}
  else{
    const sick=mdSick(),H=mdInHosp(),sev=sick.some(c=>medSev(c)>=3);
    el.className='chip tap medchip'+(sev?' sev':'');el.setAttribute('onclick','openMed()');
    el.setAttribute('data-tip',sick.length||H.length?(sick.length?sick.length+' bé đang bệnh'+(sev?', có ca nghiêm trọng':'')+'. ':'')+(H.length?H.length+' bé đang nằm viện. ':'')+'Bấm để mở Nhà thuốc & Bệnh viện thú y.':'Nhà thuốc & Bệnh viện thú y: mua thuốc, điều trị, nhập viện.');
    el.innerHTML='🏥'+(sick.length?' <b style="color:'+(sev?'var(--bad)':'#b8690a')+'">'+sick.length+'</b>':'')+(H.length?' 🔵 <b>'+mmss(hospLeft(H[0].uid))+'</b>':'');
  }
  emoEl(el);const ref=top.querySelector('.pwchip')||top.querySelector('.wxchip');top.insertBefore(el,ref?ref.nextSibling:top.querySelector('.xp'));
}}

/* ---------- thẻ mèo: đúng một nhãn trạng thái y tế ---------- */
{const B0=wxBadges;wxBadges=function(c,full){
  let h=B0.apply(this,arguments)||'';if(!c||typeof medStatus!=='function')return h;const st=medStatus(c);if(st==='ok')return h;
  const M=MEDST[st],ks=st==='hosp'?S.hosp[c.uid].ks:ills(c).map(e=>e.k),names=ks.map(k=>DIS[k].n).join(', ');
  const tip=(st==='hosp'?'Đang nằm viện chữa '+names.toLowerCase()+', còn '+fmtL(hospLeft(c.uid)):names)+'. Chi tiết ở Nhà thuốc & Bệnh viện thú y.';
  return h+' <span class="wxst"><span class="tag medtag" style="--c:'+MD_COL[M.c]+'" tabindex="0" data-tip="'+esc(tip)+'">🩺 '+M.n+'</span></span>';
}}

/* ---------- mở, đóng, khung ---------- */
function openMed(tab,uid){
  if(!medOpen()){toast('Nhà thuốc & Bệnh viện thú y mở ở cấp '+MED_LV+'.',{icon:'🔒',title:'Chưa mở khóa',key:'medlock'});return}
  if($('modal').style.display==='flex'&&!$('modal').classList.contains('lock'))closeModal();
  if(typeof closeBook==='function')closeBook();if(typeof closePower==='function')closePower();
  let e=$('medbook');
  if(!e){e=document.createElement('div');e.id='medbook';e.addEventListener('click',ev=>{if(ev.target===e)closeMed()});document.body.appendChild(e)}
  if(MD_TABS.some(t=>t[0]===tab))MU.tab=tab;else if(!medOn())MU.tab='care';
  if(uid!=null)MU.uid=+uid;MU.res=null;
  if(!medOn()){
    e.innerHTML='<div class="md-box" role="dialog" aria-label="Nhà thuốc & Bệnh viện thú y">'+
      '<div class="md-sign"><div class="md-nurse" aria-hidden="true">'+catTag('muop',1)+'<i class="md-cap"></i></div>'+
        '<div class="md-ttl"><span class="md-t1">'+emo('🏥')+' Nhà thuốc &amp; Bệnh viện thú y</span><span class="md-t2">Bé y tá Mướp xin chào!</span></div>'+
        '<div class="md-coin" id="md-coin"></div><button class="sm md-x" aria-label="Đóng" onclick="closeMed()">✕</button></div>'+
      '<div class="md-tabs" role="tablist">'+MD_TABS.map(t=>'<button id="mt-'+t[0]+'" role="tab" title="'+t[3]+'" onclick="medTab(\''+t[0]+'\')"><span class="i">'+emo(t[1])+'</span><span class="l">'+t[2]+'</span><i class="n"></i></button>').join('')+'</div>'+
      '<div class="md-body" id="md-body"></div></div>';
    e.classList.add('on');
  }
  medDraw(1);
}
function closeMed(){const e=$('medbook');if(e)e.classList.remove('on')}
function medTab(t,uid){if(uid!=null)MU.uid=+uid;if(t!==MU.tab)MU.res=null;MU.tab=t;medDraw(1)}
addEventListener('keydown',ev=>{if(ev.key==='Escape'&&medOn()&&$('modal').style.display!=='flex')closeMed()});
// chữ ký tình trạng: đổi thì mới vẽ lại cả trang
function medSig(){
  const t=MU.tab,min=x=>now()<(x||0)?Math.ceil((x-now())/MIN):0;
  return t+'|'+Object.keys(S.hosp||{}).join(',')+'|'+S.cats.map(c=>ills(c).length?c.uid+':'+ills(c).map(e=>e.eid+'.'+e.tries+(e.fail?'f':'')+(e.sp?'s':'')+(t==='treat'?'r'+min(e.rel):'')).join(',')+(onTripReal(c.uid)?'t':''):'').join('')+
    '|'+(t==='shop'||t==='hosp'?mdCoins():'')+'|'+(t==='log'?medS().log.length+'.'+((medS().log[0]||{}).t||0):'')+'|'+(t==='treat'?S.cats.length:'');
}
function medDraw(top){
  if(!medOn())return;const b=$('md-body');if(!b)return;const y=b.scrollTop,sick=mdSick().length+mdInHosp().length;
  MD_TABS.forEach(t=>{const el=$('mt-'+t[0]);el.classList.toggle('on',t[0]===MU.tab);el.setAttribute('aria-selected',t[0]===MU.tab?'true':'false');
    const n=el.querySelector('.n'),v=t[0]==='care'?sick:t[0]==='hosp'?mdInHosp().length:0;n.textContent=v||'';n.style.display=v?'':'none'});
  b.innerHTML=emo(({care:mdCare,shop:mdShop,treat:mdTreat,hosp:mdHospPage,log:mdLog})[MU.tab]());
  b.scrollTop=top?0:y;MU.sig=medSig();medClock();
}
// mỗi giây: xu, đồng hồ đếm ngược, thanh tiến độ
function medClock(){
  const co=$('md-coin');if(co){const h=emo('🪙 ')+mdCoins().toLocaleString('vi-VN');if(co.innerHTML!==h)co.innerHTML=h}
  document.querySelectorAll('#medbook [data-hl]').forEach(el=>{const uid=+el.getAttribute('data-hl');if(!inHosp(uid))return;
    const h=S.hosp[uid],left=hospLeft(uid);
    if(el.classList.contains('bar'))el.firstElementChild.style.width=Math.round(clamp(1-left/Math.max(1,h.until-h.t0),0,1)*100)+'%';else el.textContent=mmss(left)});
}
setInterval(()=>{if(typeof S==='undefined'||!S||!medOn())return;if(medSig()!==MU.sig)medDraw();else medClock()},1000);

/* ---------- mục 1: mèo cần chăm sóc ---------- */
function mdCare(){
  const L=mdInHosp().concat(mdSick()).sort((a,b)=>(medSev(b)-medSev(a))||((inHosp(a.uid)?1:0)-(inHosp(b.uid)?1:0)));
  if(!L.length)return '<div class="md-empty"><div class="big">🟢</div>Cả nhà đều khỏe mạnh 🟢<small>Bé nào ốm hay bị thương sẽ hiện ở đây.</small></div>';
  return '<div class="md-h">Mèo cần chăm sóc <small>· ca nặng xếp trước</small></div><div class="md-list">'+L.map(c=>{
    const st=medStatus(c),M=MEDST[st],h=inHosp(c.uid),trip=!h&&onTripReal(c.uid);
    return '<div class="md-row st-'+M.c+'"><div class="md-av">'+catTag(lk(c),1)+'</div><div class="g"><div>'+mdName(c)+' <span class="md-st">'+mdDot(st)+M.n+'</span></div>'+
      '<div class="md-ills">'+(h?S.hosp[c.uid].ks.map(k=>mdIllTag({k})).join('')+'<span class="md-ill">còn <b class="md-cd" data-hl="'+c.uid+'">'+mmss(hospLeft(c.uid))+'</b></span>':ills(c).map(mdIllTag).join(''))+(trip?'<span class="md-ill dim">đang viễn chinh</span>':'')+'</div></div>'+
      '<div class="md-act">'+(h?'<button class="sm" onclick="medTab(\'hosp\')">Xem giường</button>':
        '<button class="sm go" '+(trip?'disabled':'')+' onclick="medTab(\'treat\','+c.uid+')">Điều trị</button><button class="sm" '+(trip?'disabled':'')+' onclick="medTab(\'hosp\','+c.uid+')">Bệnh viện</button>')+'</div></div>'}).join('')+'</div>';
}

/* ---------- mục 2: mua thuốc ---------- */
function mdShopItem(m,sub,extra){
  const n=invN(m.id),c=mdCoins();
  return '<div class="md-it"><div class="md-ic">'+m.ic+'</div><div class="g"><div class="n">'+m.n+(extra||'')+'</div><small>'+sub+'</small></div>'+
    '<div class="md-buy"><div class="p"><b>'+mdXu(m.price)+'</b><span class="dim"> · có '+n+'</span></div><div class="row">'+
    '<button class="sm" '+(c<m.price?'disabled':'')+' onclick="doMedBuy(\''+m.id+'\',1,this)">×1</button><button class="sm" '+(c<m.price*5?'disabled':'')+' onclick="doMedBuy(\''+m.id+'\',5,this)">×5</button></div></div></div>';
}
function mdShop(){
  const sym=MEDS.filter(m=>m.kind==='sym'),cure=MEDS.filter(m=>m.kind==='cure'),tool=MEDS.filter(m=>m.kind==='tool');
  return '<div class="md-counter"><div class="md-plank">💊 Quầy thuốc</div>'+
      '<div class="md-h2">Giảm triệu chứng <small>· dịu trong '+MEDC.relief+' phút, không chữa khỏi</small></div><div class="md-shelf">'+
        sym.map(m=>mdShopItem(m,m.d+' Hợp: '+m.grp.map(g=>GRP_N[g]).join('; ')+'.')).join('')+'</div>'+
      '<div class="md-h2">Thuốc điều trị <small>· mỗi đợt bệnh thử tối đa '+MEDC.tries+' lần</small></div><div class="md-shelf">'+
        cure.map(m=>mdShopItem(m,m.d,' <span class="md-rate">khỏi <b>'+Math.round(m.rate*100)+'%</b></span>')).join('')+'</div></div>'+
    '<div class="md-counter tool"><div class="md-plank">🩹 Quầy dụng cụ y tế</div>'+
      '<div class="md-h2">Dụng cụ</div><div class="md-shelf">'+tool.map(m=>mdShopItem(m,m.d)).join('')+'</div>'+
      '<div class="md-h2">Đồ bảo hộ <small>· mang theo khi viễn chinh</small></div><div class="md-shelf">'+GEAR.map(m=>mdShopItem(m,m.d)).join('')+'</div></div>'+
    '<div class="md-note">Thuốc và tỉ lệ khỏi là luật chơi của game, không phải hướng dẫn thú y ngoài đời.</div>';
}
function doMedBuy(id,n,btn){
  if(MU.busy)return;MU.busy=1;if(btn)btn.disabled=true;
  try{const r=buyMed(id,n),m=mdItem(id);
    if(r.err)toast(r.err,{type:'warn',title:'Nhà thuốc',key:'mederr'});
    else toast('Đã mua '+r.n+' '+m.n+' · −'+mdXu(r.cost)+'.',{icon:m.ic,title:'Nhà thuốc',key:'medbuy'});
  }finally{MU.busy=0}
  medDraw();renderTop();
}

/* ---------- mục 3: điều trị ---------- */
function mdFits(m,e){const D=DIS[e.k];if(m.kind==='sym')return m.grp.includes(D.grp);if(m.kind==='cure')return !D.hosp&&!D.inj&&!e.fail;return !!((m.cure&&m.cure.includes(e.k))||(m.splint&&m.splint.includes(e.k)))}
function mdUseRow(c,e,m){
  const n=invN(m.id),why=medCan(c,e,m),eid=e?e.eid:'null';
  const act=why?'<button class="sm" disabled>Dùng</button>':n<1?'<button class="sm" onclick="medTab(\'shop\')">Mua</button>':'<button class="sm go" onclick="doMedUse('+c.uid+','+eid+',\''+m.id+'\',this)">Dùng</button>';
  return '<div class="md-use'+(why?' off':'')+'"><span class="md-ic s">'+m.ic+'</span><div class="g">'+m.n+(m.kind==='cure'?' <span class="md-rate">khỏi <b>'+Math.round(m.rate*100)+'%</b></span>':m.kind==='sym'?' <span class="dim">· giảm triệu chứng</span>':'')+
    '<small>'+(why?'<span class="md-why">'+esc(why)+'</span>':n?'có '+n:'hết hàng')+'</small></div>'+act+'</div>';
}
function mdEpisode(c,e){
  const D=DIS[e.k],rel=now()<(e.rel||0),need=D.hosp||e.fail,L=MEDS.filter(m=>!m.tonic&&mdFits(m,e));
  return '<div class="md-ep sv'+D.sev+'"><div class="md-eph"><span class="md-ic">'+D.ic+'</span><div class="g"><b class="md-dn">'+D.n+'</b> '+mdSevTag(D)+'</div></div>'+
    '<div class="md-kv"><span>Triệu chứng</span><span>'+D.sym+'</span><span>Nguyên nhân</span><span>'+D.cause+'</span>'+
      (!D.hosp&&!D.inj?'<span>Đã thử thuốc</span><span>'+e.tries+'/'+MEDC.tries+' lần</span>':'')+'</div>'+
    '<div class="md-flags">'+(rel?'<span class="md-fl b">💧 Đang giảm triệu chứng, còn '+fmtL(e.rel-now())+'</span>':'')+(e.sp?'<span class="md-fl b">🦯 Đã nẹp cố định</span>':'')+
      (D.self>0?'<span class="md-fl g">🌿 Tự khỏi sau khoảng '+fmtL(D.self*MIN)+' khi nghỉ ở chỗ tốt</span>':'<span class="md-fl">Không tự khỏi</span>')+'</div>'+
    (need?'<div class="md-need"><div>🚑 Cần đưa đến bệnh viện<small>'+(D.hosp?'Ca này chỉ bệnh viện chữa được.':'Đã thử đủ '+MEDC.tries+' lần thuốc mà chưa khỏi.')+'</small></div><button class="sm bad" onclick="medTab(\'hosp\','+c.uid+')">Bệnh viện ›</button></div>':'')+
    (L.length?'<div class="md-uses">'+L.map(m=>mdUseRow(c,e,m)).join('')+'</div>':need?'':'<div class="dim" style="margin-top:6px">Không có thuốc nào hợp. Hãy cho bé nghỉ hoặc đưa đến bệnh viện.</div>')+'</div>';
}
function mdRes(){
  const r=MU.res;if(!r)return '';
  return '<div class="md-res '+r.t+'">'+(r.t==='ok'?'<span class="md-spk" aria-hidden="true"><i>✨</i><i>💖</i><i>✨</i><i>💖</i><i>✨</i></span>':'')+'<span class="i">'+r.ic+'</span><span>'+r.h+'</span></div>';
}
function mdTreat(){
  const L=mdTreatable(),away=mdSick().filter(c=>onTripReal(c.uid));
  let h=mdRes();
  if(!L.length)h+='<div class="md-empty"><div class="big">🧪</div>Không có bé nào cần điều trị.<small>'+(away.length?away.length+' bé bệnh đang đi viễn chinh, về nhà mới chữa được. ':'')+(mdInHosp().length?'Bé đang nằm viện xem ở mục Bệnh viện.':'')+'</small></div>';
  else{
    let c=L.find(x=>x.uid===MU.uid);if(!c){c=L[0];MU.uid=c.uid}
    h+='<div class="md-h">Chọn bé</div><div class="md-chips">'+L.map(x=>'<button class="md-chip'+(x===c?' on':'')+'" onclick="medTab(\'treat\','+x.uid+')">'+catTag(lk(x),1)+'<span>'+mdDot(medStatus(x))+esc(x.name)+'</span></button>').join('')+'</div>'+
      '<div class="md-pt"><div class="md-av">'+catTag(lk(c),1)+'</div><div class="g">'+mdName(c)+' <span class="md-st">'+mdDot(medStatus(c))+MEDST[medStatus(c)].n+'</span><small>'+ills(c).length+' bệnh đang có · '+(ROOM[c.room]?ROOM[c.room].n:'')+'</small></div>'+
      '<button class="sm" onclick="medTab(\'hosp\','+c.uid+')">🏥 Bệnh viện</button></div>'+
      '<div class="md-eps">'+ills(c).slice().sort((a,b)=>DIS[b.k].sev-DIS[a.k].sev).map(e=>mdEpisode(c,e)).join('')+'</div>';
  }
  // vật phẩm hỗ trợ phục hồi: cho bé không bệnh đang mệt
  const tn=invN('tonic'),T=MED.tonic;
  if(tn>0&&T){const W=S.cats.filter(c=>!ills(c).length&&!inHosp(c.uid)&&!onTripReal(c.uid)&&c.en<70).sort((a,b)=>a.en-b.en).slice(0,4);
    if(W.length)h+='<div class="md-h">'+T.ic+' Hỗ trợ phục hồi <small>· có '+tn+' · cho bé khỏe đang mệt</small></div><div class="md-uses">'+W.map(c=>{const why=medCan(c,null,T);
      return '<div class="md-use'+(why?' off':'')+'"><span class="md-av s">'+catTag(lk(c),1)+'</span><div class="g">'+esc(c.name)+'<small>'+(why?'<span class="md-why">'+esc(why)+'</span>':'⚡ '+Math.round(c.en)+'%')+'</small></div><button class="sm go" '+(why?'disabled':'')+' onclick="doMedUse('+c.uid+',null,\'tonic\',this)">Dùng</button></div>'}).join('')+'</div>'}
  return h;
}
function doMedUse(uid,eid,id,btn){
  if(MU.busy)return;MU.busy=1;if(btn)btn.disabled=true;
  try{
    const c=catBy(uid),r=medUse(uid,eid,id),m=mdItem(id);
    if(r.err){toast(r.err,{type:'warn',title:c?c.name:'Điều trị',key:'mederr'});MU.res={t:'bad',ic:'⚠️',h:esc(r.err)}}
    else if(m.tonic){MU.res={t:'ok',ic:m.ic,h:esc(c.name)+' đã lại sức.'};toast('đã lại sức nhờ '+m.n+'.',{icon:m.ic,title:c.name,key:'meduse'})}
    else{const D=r.D;
      if(r.cured){MU.res={t:'ok',ic:'😺',h:esc(c.name)+' đã khỏi <b>'+D.n+'</b>!'};toast('đã khỏi '+D.n.toLowerCase()+' nhờ '+m.n+'.',{icon:'😺',title:c.name,key:'medcure'})}
      else if(r.fail){const t=r.left>0?'chưa khỏi, còn '+r.left+' lần thử':'chưa khỏi, cần đến bệnh viện';
        MU.res={t:'bad',ic:'😿',h:esc(c.name)+': <b>'+D.n+'</b> '+t+'.'};toast(m.n+': '+t+'.',{type:'warn',icon:'😿',title:c.name,key:'medfail'})}
      else{const t=m.splint?'đã được nẹp cố định, đỡ đau hơn':'dịu triệu chứng trong '+MEDC.relief+' phút';
        MU.res={t:'info',ic:m.ic,h:esc(c.name)+' '+t+'.'};toast(t+'.',{icon:m.ic,title:c.name,key:'meduse'})}}
  }finally{MU.busy=0}
  medDraw();render();
}

/* ---------- mục 4: bệnh viện ---------- */
function mdBed(c){
  const h=S.hosp[c.uid],left=hospLeft(c.uid),p=clamp(1-left/Math.max(1,h.until-h.t0),0,1);
  return '<div class="md-ward"><div class="md-bed" aria-hidden="true"><i class="md-iv"><i></i></i><i class="md-hd"></i><span class="md-pat">'+mdCatImg(c,'sleep0',2)+'</span><i class="md-blk"></i><i class="md-ft"></i><span class="md-hrt">💗</span><span class="md-z">z</span></div>'+
    '<div class="g"><div>'+mdName(c)+' <span class="md-st">'+mdDot('hosp')+'Đang điều trị</span></div><div class="md-ills">'+h.ks.map(k=>mdIllTag({k})).join('')+'</div>'+
    '<div class="md-time">Ra viện sau <b class="md-cd" data-hl="'+c.uid+'">'+mmss(left)+'</b>'+(h.ch?' <span class="dim">· quỹ cứu trợ</span>':'')+'</div>'+
    '<div class="bar md-bar" data-hl="'+c.uid+'"><i style="width:'+Math.round(p*100)+'%"></i></div></div></div>';
}
function mdAdmit(c){
  const p=hospPlan(c.uid);if(!p.list)return '<div class="md-need"><div>'+esc(p.err||'Không nhập viện được.')+'</div></div>';
  const short=p.err&&!p.charity;
  return '<div class="md-plan"><div class="md-pt"><div class="md-av">'+catTag(lk(c),1)+'</div><div class="g">'+mdName(c)+' <span class="md-st">'+mdDot(medStatus(c))+MEDST[medStatus(c)].n+'</span><small>Chữa khỏi mọi bệnh bé đang có trong một lần nằm viện.</small></div></div>'+
    '<div class="md-bill">'+p.list.map(x=>'<div><span>'+x.D.ic+' <b>'+x.D.n+'</b></span><span>'+(p.complex&&x.D.inj?'<span class="dim">gộp</span>':'<b>'+mdXu(x.cost)+'</b>')+'</span></div>').join('')+
      (p.complex?'<div><span>🩻 Chấn thương phức tạp <small class="dim">(gộp các chấn thương)</small></span><span><b>'+mdXu(MED_COMPLEX)+'</b></span></div>':'')+
      '<div class="tot"><span>Tổng viện phí</span><span><b>'+mdXu(p.total)+'</b></span></div>'+
      '<div class="tot"><span>Thời gian</span><span><b>'+p.min+' phút</b></span></div></div>'+
    (p.charity?'<div class="md-char">🤝 Quỹ cứu trợ mèo nhận ca này: bạn trả <b>'+mdXu(p.pay)+'</b> đang có, nằm viện <b>'+p.min+' phút</b>.</div>':'')+
    (short?'<div class="md-need"><div>'+esc(p.err)+'<small>Bạn đang có '+mdXu(mdCoins())+'. Thử thuốc ở mục Điều trị hoặc kiếm thêm xu.</small></div></div>':'')+
    '<div class="md-note l">Trong lúc nằm viện bé không ở trong phòng và không đi viễn chinh; thời gian vẫn trôi khi bạn thoát game; ra viện năng lượng chưa hồi đủ.</div>'+
    '<div class="md-go"><button class="go md-admit" '+(short?'disabled':'')+' onclick="medAsk('+c.uid+')">🚑 Đưa đến bệnh viện</button></div></div>';
}
function mdHospPage(){
  const H=mdInHosp(),L=mdTreatable(),away=mdSick().filter(c=>onTripReal(c.uid));
  let h='<div class="md-h">Phòng bệnh <small>· '+(H.length?H.length+' bé đang nằm viện':'đang trống')+'</small></div>';
  h+=H.length?'<div class="md-wards">'+H.map(mdBed).join('')+'</div>':'<div class="md-empty sm"><div class="big">🛏️</div>Chưa có bé nào nằm viện.</div>';
  h+='<div class="md-h">Khu tiếp nhận</div>';
  if(!L.length)return h+'<div class="md-empty sm">Không có bé nào cần nhập viện.<small>'+(away.length?away.length+' bé bệnh đang đi viễn chinh, về nhà mới nhập viện được.':'')+'</small></div>';
  let c=L.find(x=>x.uid===MU.uid);if(!c){c=L[0];MU.uid=c.uid}
  return h+'<div class="md-chips">'+L.map(x=>'<button class="md-chip'+(x===c?' on':'')+'" onclick="medTab(\'hosp\','+x.uid+')">'+catTag(lk(x),1)+'<span>'+mdDot(medStatus(x))+esc(x.name)+'</span></button>').join('')+'</div>'+mdAdmit(c);
}
function medAsk(uid){
  const p=hospPlan(uid);if(!p.list||(p.err&&!p.charity)){toast(p.err||'Không nhập viện được.',{type:'warn',title:'Bệnh viện',key:'mederr'});medDraw();return}
  modal('<h3>🚑 Đưa '+esc(p.c.name)+' đến bệnh viện?</h3><div style="text-align:center">'+catTag(lk(p.c),3)+'</div>'+
    '<div class="cd-sec"><div class="cd-grid"><div class="k">Chữa</div><div>'+p.list.map(x=>x.D.ic+' <b>'+x.D.n+'</b>').join(', ')+'</div>'+
    '<div class="k">Viện phí</div><div><b>'+mdXu(p.pay)+'</b>'+(p.charity?' <small class="dim">(quỹ cứu trợ trả phần còn lại)</small>':'')+'</div>'+
    '<div class="k">Thời gian</div><div><b>'+p.min+' phút</b></div></div></div>'+
    '<div class="dim" style="margin-top:6px">Bé rời phòng và không đi viễn chinh cho tới khi ra viện.</div>'+
    '<div class="row wrap" style="justify-content:center;margin-top:8px"><button class="go" id="md-ok" onclick="doMedAdmit('+uid+','+p.pay+','+p.min+',this)">✓ Đồng ý · −'+mdXu(p.pay)+'</button><button class="sm" onclick="closeModal()">Thôi</button></div>');
}
function doMedAdmit(uid,pay,min,btn){
  if(MU.busy)return;MU.busy=1;if(btn)btn.disabled=true;
  try{
    const q=hospPlan(uid);
    if(q.list&&!(q.err&&!q.charity)&&(q.pay!==pay||q.min!==min)){toast('Viện phí vừa đổi. Xem lại rồi xác nhận.',{type:'warn',title:'Bệnh viện',key:'mederr'});MU.busy=0;return medAsk(uid)}   // không trừ khác số đã hiện
    const p=hospAdmit(uid);closeModal();
    if(p.err&&!p.list||p.err&&!p.charity)toast(p.err,{type:'warn',title:'Bệnh viện',key:'mederr'});
    else{MU.res=null;toast('đã nhập viện · −'+mdXu(p.pay)+'. Ra viện sau '+p.min+' phút.',{icon:'🏥',title:p.c.name,key:'medhosp'})}
  }finally{MU.busy=0}
  if(medOn()){MU.tab='hosp';medDraw(1)}render();
}

/* ---------- mục 5: hồ sơ ---------- */
function mdLogTxt(l){
  const D=DIS[l.k]||{n:'bệnh',ic:'🩹'},m=l.item?mdItem(l.item):null,dn='<b>'+D.n+'</b>';
  switch(l.ev){
    case 'ill':return [D.ic,(D.inj?'bị ':'mắc ')+dn];
    case 'med':return [m?m.ic:'💊','dùng '+(m?m.n:'thuốc')+(l.k?' cho '+dn:'')];
    case 'cure':return ['😺','khỏi '+dn+' nhờ '+(m?m.n:'thuốc')];
    case 'fail':return ['😿','dùng '+(m?m.n:'thuốc')+', chưa khỏi '+dn];
    case 'self':return ['🌿','tự khỏi '+dn];
    case 'hosp':return ['🏥','nhập viện (phí <b>'+mdXu(l.cost||0)+'</b>'+(l.ch?', quỹ cứu trợ':'')+'): '+(l.ks||[]).map(k=>'<b>'+(DIS[k]||D).n+'</b>').join(', ')];
    case 'out':return ['🏡','ra viện, khỏi '+dn];
  }
  return ['📋',esc(l.ev)];
}
function mdLog(){
  const A=medS().log||[],who=[];A.forEach(l=>{if(!who.some(w=>w.uid===l.uid))who.push({uid:l.uid,name:l.name})});
  if(MU.flt&&!who.some(w=>w.uid===MU.flt))MU.flt=0;
  const L=MU.flt?A.filter(l=>l.uid===MU.flt):A;
  if(!A.length)return '<div class="md-empty"><div class="big">📋</div>Chưa có hồ sơ nào<small>Mỗi lần bé ốm, dùng thuốc, nhập viện đều được ghi lại ở đây.</small></div>';
  return '<div class="md-h">Hồ sơ bệnh án <small>· mới nhất trước</small>'+(who.length>1?'<select class="md-flt" aria-label="Lọc theo bé" onchange="MU.flt=+this.value;medDraw(1)"><option value="0">Tất cả các bé</option>'+who.map(w=>'<option value="'+w.uid+'"'+(w.uid===MU.flt?' selected':'')+'>'+esc(w.name)+'</option>').join('')+'</select>':'')+'</div>'+
    '<div class="md-log">'+L.map(l=>{const t=mdLogTxt(l);return '<div class="ev-'+l.ev+'"><span class="t">'+hhmm(l.t)+'</span><span class="i">'+t[0]+'</span><span class="g"><span class="w">'+esc(l.name)+'</span> '+t[1]+'</span></div>'}).join('')+'</div>';
}
