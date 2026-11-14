"use strict";
/* ============ CHỤP ẢNH PHÒNG, ALBUM VÀ STICKER: giao diện (2026-11-14) ============
   Nạp ngay sau js/garden-ui.js (để thêm chương Sổ tay trước khi tut-wx.js bọc danh sách chương), sau js/photo-store.js. CSS: css/photo.css.
   - Nút 📷 (#photob) gắn vào cột nút phóng to (#zoomb) ở góc trên phải khung phòng, chỉ hiện từ cấp PHOTO_LV, tắt khi đang Sắp xếp đồ.
   - Bấm máy (photoShoot): chớp màn trập, vẽ lại phòng một lần không có mũi tên cuộn và viền sáng của bé đang theo dõi (phGrab),
     thu nhỏ theo hệ số nguyên, không làm mượt; ảnh chụp trạng thái các bé đang thấy trong khung (phSnap) để xét sticker (phMatch).
   - Album (#phalb, openAlbum): lưới ảnh khung polaroid, lọc Yêu thích, xem lớn, ‹ ›, đặt yêu thích, tải về (PNG có khung, ngày giờ,
     tên phòng, tên các bé), xóa (bấm hai lần). Tab Sticker: sổ sticker theo trang, ô chưa có là bóng đen kèm gợi ý.
   - Sổ tay thêm chương "Chụp ảnh và sổ sticker"; mẹo lần đầu trỏ vào nút 📷; Admin có thẻ thử. */
const PA={tab:'ph',f:'all',v:null,pg:'day',del:0,tmp:null};
const PH_URL=new Map();
let phBusy=0,phLast=0;
const phUrl=r=>{if(!r||!r.blob)return '';let u=PH_URL.get(r.id);if(!u){u=URL.createObjectURL(r.blob);PH_URL.set(r.id,u)}return u};
const phDate=t=>{const d=new Date(t),z=n=>String(n).padStart(2,'0');return z(d.getDate())+'/'+z(d.getMonth()+1)+'/'+d.getFullYear()+' '+z(d.getHours())+':'+z(d.getMinutes())};
const phNames=(L,max)=>!L||!L.length?'Phòng vắng tanh':L.length<=max?L.join(', '):L.slice(0,max).join(', ')+' và '+(L.length-max)+' bé khác';
const phMB=b=>(b/1048576).toLocaleString('vi-VN',{maximumFractionDigits:1});

/* ---------- nút chụp ---------- */
// cột nút riêng #photobar nằm ngay bên trái cột ＋ － (#zoomb), không đổi chỗ nút phóng to
function phBtn(){
  const w=$('roomwrap');if(!w)return;let bar=$('photobar');
  if(!bar){bar=document.createElement('div');bar.id='photobar';
    bar.innerHTML='<button id="photob" aria-label="Chụp ảnh phòng" data-tip="Chụp ảnh phòng (lưu vào album, có thể nhận sticker)">📷</button><button id="photoa" aria-label="Mở album ảnh" data-tip="Album ảnh và sổ sticker">🖼️</button>';
    bar.querySelector('#photob').onclick=()=>photoShoot();bar.querySelector('#photoa').onclick=()=>openAlbum();w.appendChild(bar);emoEl(bar)}
  bar.style.display=photoOpen()?'':'none';const b=$('photob');b.disabled=!!edit;b.setAttribute('data-tip',edit?'Đang sắp xếp đồ: bấm Xong để chụp ảnh':'Chụp ảnh phòng (lưu vào album, có thể nhận sticker)');
}
{const R0=renderTop;renderTop=function(){R0.apply(this,arguments);phBtn()}}

/* ---------- trạng thái lúc bấm máy ---------- */
function phSnap(){
  const x0=camX,x1=camX+VW,y0=camY,y1=camY+VHV,cats=[],names=[],seen=new Set(),wxo=typeof wxOpen==='function'&&wxOpen();
  ents.forEach(e=>{
    if(e.ghost||e.dead)return;const c=catBy(e.uid);if(!c)return;
    const p=entPos(e);if(p.x+12<x0||p.x-12>x1||p.y<y0+6||p.y-30>y1)return;   // thân bé (rộng khoảng 24, cao 30 ô) phải lộ ra trong khung
    const m=c.meal,meal=e.state==='meal'&&m&&m.st==='eat';
    cats.push({uid:c.uid,sp:c.sp,star:c.star,v:String(c.sp).startsWith('v_'),rare:typeof isRb==='function'&&isRb(c),form:typeof formOf==='function'&&!!formOf(c),
      age:ageStage(c),st:e.state,sleep:String(p.pose||'').startsWith('sleep'),bed:e.state==='bed',groom:e.state==='groom',
      eat:!!(meal&&m.k==='f'),drink:!!(meal&&m.k==='w'),jump:e.state==='jump',run:e.state==='run'&&!(e.pre>0),
      lv:e.state==='use'&&e.goal&&e.goal.lv!=null?(e.goal.at|0):-1,heart:e.emoT>0,chase:!!e.chase,sig:e.state==='sig',
      md:!!e.fm,clone:!!e.clone,wx:wxo&&typeof wxSt==='function'?wxSt(c):[],x:p.x});
    if(!e.clone&&!seen.has(c.uid)){seen.add(c.uid);names.push({n:c.name,x:p.x,uid:c.uid})}
  });
  names.sort((a,b)=>a.x-b.x);
  const crit=typeof crits!=='undefined'&&Array.isArray(crits)&&crits.some(r=>!r.gone&&r.x>x0-4&&r.x<x1+4&&r.y>y0&&r.y<y1+10);
  const hr=typeof wxHour==='function'&&typeof wxClock==='function'?wxHour(wxClock()):new Date().getHours();
  return {room:cur,out:!!(ROOM[cur]&&ROOM[cur].outdoor),wx:wxo&&typeof wxNow==='function'?wxNow().type:null,hr,crit,cats,names:names.map(o=>o.n),uids:names.map(o=>o.uid)};
}

/* ---------- lấy ảnh từ khung phòng ---------- */
function phGrab(){
  const f0=fol,ARW='rgba(150, 100, 70, 0.5)';fol=null;   // không vẽ viền sáng của bé đang theo dõi
  RX.fillRect=function(){if(this.fillStyle===ARW)return;return CanvasRenderingContext2D.prototype.fillRect.apply(this,arguments)}; // bỏ hai mũi tên cuộn ở mép
  try{drawRoom()}finally{delete RX.fillRect;fol=f0}
  const W=room.width,H=room.height,z=Math.max(1,Math.round(ZC));
  let f=1;while(W/f>PHC.maxW)f++;
  for(let g=f;g<=z;g++)if(z%g===0){f=g;break}            // ưu tiên hệ số chia hết số điểm ảnh mỗi ô: mỗi ô vẫn là khối vuông đều
  const w=Math.max(1,Math.floor(W/f)),h=Math.max(1,Math.floor(H/f)),cv=document.createElement('canvas');cv.width=w;cv.height=h;
  const g=cv.getContext('2d');g.imageSmoothingEnabled=false;g.drawImage(room,0,0,w*f,h*f,0,0,w,h);
  return cv;
}
const phBlob=(cv,type,q)=>new Promise(ok=>{try{cv.toBlob(b=>ok(b),type,q)}catch(e){ok(null)}});
async function phEncode(cv){
  let b=await phBlob(cv,'image/webp',PHC.q);
  if(!b||b.type!=='image/webp')b=await phBlob(cv,'image/jpeg',PHC.q);
  return b;
}

/* ---------- bấm máy ---------- */
function phFlash(){
  const w=$('roomwrap');if(!w)return;const d=document.createElement('div');d.className='ph-flash';w.appendChild(d);setTimeout(()=>d.remove(),650);
  if(typeof snd==='function'&&typeof tone==='function')snd(t=>{tone(2100,t,.025,'square',.035);tone(700,t+.035,.05,'square',.03);tone(1500,t+.09,.03,'triangle',.03)});
}
async function photoShoot(){
  if(!photoOpen()){toast('Chụp ảnh mở từ cấp '+PHOTO_LV+'.',{type:'warn'});return}
  if(phBusy||tab!=='home'||edit||Date.now()-phLast<PHC.cd)return;
  phBusy=1;phLast=Date.now();
  try{
    const snap=phSnap();phFlash();
    const cv=phGrab(),blob=await phEncode(cv);
    if(!blob)throw new Error('enc');
    await PHDB.ready;
    const L=PHDB.list(),full=L.length>=PHC.max||PHDB.bytes()+blob.size>PHC.mb*1048576;
    const t=now(),id=t.toString(36)+Math.random().toString(36).slice(2,6),ids=phMatch(snap);
    const rec={id,t,room:cur,rn:(ROOM[cur]||{}).n||'',names:snap.names,stk:ids,nw:[],fav:0,w:cv.width,h:cv.height,size:blob.size,type:blob.type,blob};
    let saved=!full;
    if(saved){try{await PHDB.put(rec)}catch(e){saved=false}}
    const r=photoAward(ids,saved?id:null,t);rec.nw=r.nw;
    if(saved&&r.nw.length)PHDB.patch(id,{nw:r.nw}).catch(()=>{});
    save();
    phThumb(rec,saved);
    if(!saved)toast(full?'Album đầy ('+PHC.max+' ảnh hoặc '+PHC.mb+' MB). Xóa bớt ảnh cũ để lưu ảnh mới; tấm này vẫn tải về được.':'Không lưu được ảnh vào máy (bộ nhớ trình duyệt đầy hoặc bị chặn).',{type:'warn',title:'Album',key:'phfull'});
    if(r.nw.length)toast(r.nw.map(k=>PH_STK_BY[k].n).join(', '),{icon:PH_STK_BY[r.nw[0]].ic,title:'Sticker mới',coins:r.coins,key:'phstk'});
    r.pages.forEach(pid=>{const pg=PH_PAGES.find(p=>p.id===pid);toast('Đủ trang "'+pg.n+'" trong sổ sticker: +'+PHC.page+' vé',{icon:'🎟',title:'Sổ sticker',key:'phpg'+pid})});
    if(r.book)toast('Đủ cả sổ sticker! Thưởng thêm +'+PHC.book+' vé',{icon:'🏆',title:'Sổ sticker',key:'phbook'});
    if(r.coins||r.tickets)render();
    if(phOn())phDraw();
  }catch(e){toast('Không chụp được ảnh lúc này.',{type:'warn',title:'Chụp ảnh'})}
  finally{phBusy=0}
}
// ảnh nhỏ vừa chụp: rơi xuống góc dưới phải khung phòng, bấm để xem
function phThumb(rec,saved){
  const w=$('roomwrap');if(!w)return;w.querySelectorAll('.ph-thumb').forEach(x=>x.remove());
  const b=document.createElement('button');b.className='ph-thumb';b.setAttribute('aria-label','Xem ảnh vừa chụp');
  if(!saved){PA.tmp=rec}
  const u=saved?phUrl(rec):URL.createObjectURL(rec.blob);if(!saved)rec._u=u;
  b.innerHTML='<img alt="" src="'+u+'"><span>'+(rec.nw.length?rec.nw.map(k=>PH_STK_BY[k].ic).join(''):'📷')+'</span>';
  b.onclick=()=>{b.remove();openAlbum(saved?rec.id:'tmp')};
  w.appendChild(b);setTimeout(()=>{b.classList.add('out');setTimeout(()=>b.remove(),400)},PHC.thumbMs);
}

/* ---------- album ---------- */
const phOn=()=>{const e=$('phalb');return !!(e&&e.classList.contains('on'))};
function phRoot(){
  let e=$('phalb');if(e)return e;
  e=document.createElement('div');e.id='phalb';e.setAttribute('role','dialog');e.setAttribute('aria-label','Album ảnh');
  e.innerHTML='<div class="ph-book"><div class="ph-hd"><div class="ph-tabs"></div><button class="ph-x" aria-label="Đóng album" onclick="closeAlbum()">✕</button></div><div class="ph-body"></div></div>';
  e.addEventListener('pointerdown',ev=>{if(ev.target===e)closeAlbum()});
  document.body.appendChild(e);return e;
}
function openAlbum(v,tabk){
  if(!photoOpen()){toast('Album ảnh mở từ cấp '+PHOTO_LV+'.',{type:'warn'});return}
  const e=phRoot();PA.tab=tabk||'ph';PA.v=v||null;PA.del=0;
  e.classList.add('on');if(typeof hideTip==='function')hideTip();
  PHDB.ready.then(phDraw);
}
function closeAlbum(){const e=$('phalb');if(e)e.classList.remove('on');PA.v=null;PA.del=0;if(PA.tmp&&PA.tmp._u){URL.revokeObjectURL(PA.tmp._u)}PA.tmp=null}
addEventListener('keydown',ev=>{if(!phOn()||$('modal').style.display==='flex')return;
  if(ev.key==='Escape'){if(PA.v){PA.v=null;PA.del=0;phDraw()}else closeAlbum()}
  else if(PA.v&&PA.v!=='tmp'&&(ev.key==='ArrowLeft'||ev.key==='ArrowRight'))phNav(ev.key==='ArrowLeft'?-1:1)});
const phShown=()=>PHDB.list().filter(r=>PA.f!=='fav'||r.fav);
function phTabs(){
  const c=phCount(),n=PHDB.list().length;
  return '<button class="'+(PA.tab==='ph'?'on':'')+'" onclick="phTab(\'ph\')">📷 Ảnh <small>'+n+'</small></button>'+
    '<button class="'+(PA.tab==='st'?'on':'')+'" onclick="phTab(\'st\')">🏷️ Sticker <small>'+c.got+'/'+c.all+'</small></button>';
}
function phTab(k){PA.tab=k;PA.v=null;PA.del=0;phDraw()}
function phDraw(){
  const e=phRoot();if(!phOn())return;
  e.querySelector('.ph-tabs').innerHTML=emo(phTabs());
  const b=e.querySelector('.ph-body');
  b.innerHTML=emo(PA.tab==='st'?phBook():PA.v?phView():phGrid());
  b.scrollTop=0;
}
function phGrid(){
  const L=PHDB.list(),S2=phShown(),by=PHDB.bytes(),fv=L.filter(r=>r.fav).length;
  const head='<div class="ph-bar"><span class="ph-cap">'+L.length+'/'+PHC.max+' ảnh · '+phMB(by)+'/'+PHC.mb+' MB'+(PHDB.mem?' · <b class="ph-warn" data-tip="Trình duyệt không cho lưu ảnh lâu dài: ảnh mất khi tắt game.">chỉ lưu tạm</b>':'')+'</span>'+
    '<span class="ph-fil"><button class="sm'+(PA.f==='all'?' on':'')+'" onclick="PA.f=\'all\';phDraw()">Tất cả</button><button class="sm'+(PA.f==='fav'?' on':'')+'" onclick="PA.f=\'fav\';phDraw()">⭐ Yêu thích <small>'+fv+'</small></button></span></div>';
  if(!S2.length)return head+'<div class="ph-empty">'+(L.length?'Chưa có ảnh yêu thích. Mở một ảnh rồi bấm ⭐ để đánh dấu.':'Chưa có ảnh nào.<br>Bấm 📷 ở góc khung phòng để chụp các bé. Chụp đúng khoảnh khắc đặc biệt thì nhận sticker!')+'</div>';
  return head+'<div class="ph-grid">'+S2.map((r,i)=>'<button class="ph-pol" style="--r:'+((i%5)-2)*.6+'deg" onclick="phOpenV(\''+r.id+'\')" aria-label="Ảnh '+esc(r.rn)+' '+phDate(r.t)+'">'+
    '<img alt="" loading="lazy" src="'+phUrl(r)+'"><span class="ph-pc">'+esc(r.rn)+'<small>'+phDate(r.t)+'</small></span>'+(r.fav?'<i class="ph-fv">⭐</i>':'')+(r.nw&&r.nw.length?'<i class="ph-sk">'+r.nw.map(k=>PH_STK_BY[k]?PH_STK_BY[k].ic:'').join('')+'</i>':'')+'</button>').join('')+'</div>';
}
function phOpenV(id){PA.v=id;PA.del=0;phDraw()}
function phCur(){return PA.v==='tmp'?PA.tmp:PHDB.get(PA.v)}
function phNav(d){const L=phShown(),i=L.findIndex(r=>r.id===PA.v);if(i<0||!L.length)return;PA.v=L[(i+d+L.length)%L.length].id;PA.del=0;phDraw()}
function phView(){
  const r=phCur();if(!r){PA.v=null;return phGrid()}
  const tmp=PA.v==='tmp',L=phShown(),i=L.findIndex(x=>x.id===r.id),u=tmp?r._u:phUrl(r);
  const stk=(r.stk||[]).filter(k=>PH_STK_BY[k]).map(k=>'<span class="ph-chip'+((r.nw||[]).includes(k)?' nw':'')+'" data-tip="'+esc(PH_STK_BY[k].h)+'">'+PH_STK_BY[k].ic+' '+esc(PH_STK_BY[k].n)+((r.nw||[]).includes(k)?' <b>mới</b>':'')+'</span>').join('');
  return '<div class="ph-view">'+
    '<div class="ph-vbar"><button class="sm" onclick="PA.v=null;PA.del=0;phDraw()">‹ Album</button>'+(tmp?'<span class="ph-warn">Chưa lưu: album đầy</span>':L.length>1?'<span class="ph-nav"><button class="sm" aria-label="Ảnh trước" onclick="phNav(-1)">◀</button><small>'+(i+1)+'/'+L.length+'</small><button class="sm" aria-label="Ảnh sau" onclick="phNav(1)">▶</button></span>':'')+'</div>'+
    '<figure class="ph-big"><img alt="Ảnh phòng '+esc(r.rn)+'" src="'+u+'" style="aspect-ratio:'+r.w+'/'+r.h+'"><figcaption><b>📷 '+esc(r.rn)+'</b><span>'+phDate(r.t)+'</span><span class="ph-nm">🐾 '+esc(phNames(r.names,6))+'</span></figcaption></figure>'+
    (stk?'<div class="ph-chips">'+stk+'</div>':'')+
    '<div class="ph-act">'+(tmp?'':'<button onclick="phFav()">'+(r.fav?'⭐ Bỏ yêu thích':'☆ Yêu thích')+'</button>')+
      '<button onclick="phDown()">⬇ Tải về</button>'+(tmp?'':'<button class="'+(PA.del?'bad':'')+'" onclick="phDel()">'+(PA.del?'🗑 Bấm lần nữa để xóa':'🗑 Xóa')+'</button>')+'</div></div>';
}
function phFav(){const r=phCur();if(!r||PA.v==='tmp')return;PHDB.patch(r.id,{fav:r.fav?0:1}).then(phDraw,phDraw)}
function phDel(){
  const r=phCur();if(!r||PA.v==='tmp')return;
  if(!PA.del){PA.del=1;phDraw();setTimeout(()=>{if(PA.del&&PA.v===r.id){PA.del=0;if(phOn())phDraw()}},4000);return}
  const L=phShown(),i=L.findIndex(x=>x.id===r.id),nx=L[i+1]||L[i-1];
  PHDB.del(r.id).then(()=>{const u=PH_URL.get(r.id);if(u){URL.revokeObjectURL(u);PH_URL.delete(r.id)}phUnlink(r.id);save();PA.v=nx?nx.id:null;PA.del=0;phDraw();toast('Đã xóa ảnh. Sticker đã nhận vẫn giữ.',{icon:'🗑',title:'Album',key:'phdel'})},()=>toast('Không xóa được ảnh.',{type:'warn'}));
}

/* ---------- tải về: ảnh có khung polaroid, ngày giờ, tên phòng, tên các bé ---------- */
const phImg=u=>new Promise((ok,no)=>{const i=new Image();i.onload=()=>ok(i);i.onerror=no;i.src=u});
function phCompose(r,img){
  const s=img.width<720?2:1,iw=img.width*s,ih=img.height*s,pad=Math.max(16,Math.round(iw*.035)),cap=Math.max(96,Math.round(iw*.15));
  const cv=document.createElement('canvas');cv.width=iw+2*pad;cv.height=ih+pad+cap;const g=cv.getContext('2d'),W=cv.width,H=cv.height;
  g.fillStyle='#fff8ec';g.fillRect(0,0,W,H);
  // viền hạt cườm nâu đậm
  const bd=Math.max(4,Math.round(pad*.28));g.fillStyle='#5a3a28';g.fillRect(0,0,W,bd);g.fillRect(0,H-bd,W,bd);g.fillRect(0,0,bd,H);g.fillRect(W-bd,0,bd,H);
  g.fillStyle='#e8c9a8';for(let x=bd*1.5;x<W-bd;x+=bd*2.2){g.beginPath();g.arc(x,bd/2,bd*.28,0,6.3);g.arc(x,H-bd/2,bd*.28,0,6.3);g.fill()}
  g.fillStyle='#3a2a20';g.fillRect(pad-3,pad-3,iw+6,ih+6);
  g.imageSmoothingEnabled=false;g.drawImage(img,pad,pad,iw,ih);
  const fs=Math.round(cap*.2),fam=' "Nunito","Quicksand",system-ui,sans-serif',x=pad,y1=pad+ih+Math.round(cap*.32);
  g.textBaseline='alphabetic';g.fillStyle='#523828';g.font='800 '+fs+'px'+fam;g.fillText('📷 '+(r.rn||''),x,y1);
  g.font='700 '+Math.round(fs*.8)+'px'+fam;g.textAlign='right';g.fillText(phDate(r.t),W-pad,y1);g.textAlign='left';
  let nm='🐾 '+phNames(r.names,8);g.font='700 '+Math.round(fs*.78)+'px'+fam;g.fillStyle='#725b4a';
  const maxw=W-2*pad;while(g.measureText(nm).width>maxw&&nm.length>8)nm=nm.slice(0,-2);if(nm!=='🐾 '+phNames(r.names,8))nm=nm.replace(/.$/,'…');
  g.fillText(nm,x,y1+Math.round(fs*1.15));
  const sk=(r.stk||[]).filter(k=>PH_STK_BY[k]).map(k=>PH_STK_BY[k].ic).join(' ');
  g.font='700 '+Math.round(fs*.75)+'px'+fam;if(sk)g.fillText(sk,x,y1+Math.round(fs*2.15));
  g.textAlign='right';g.fillStyle='#a07654';g.font='800 '+Math.round(fs*.7)+'px'+fam;g.fillText('Mèo Xu',W-pad,y1+Math.round(fs*2.15));
  return cv;
}
const phFile=r=>{const d=new Date(r.t),z=n=>String(n).padStart(2,'0');return 'meoxu-'+d.getFullYear()+z(d.getMonth()+1)+z(d.getDate())+'-'+z(d.getHours())+z(d.getMinutes())+z(d.getSeconds())+'-'+(r.room||'phong')+'.png'};
async function phDown(){
  const r=phCur();if(!r)return;
  try{
    const img=await phImg(PA.v==='tmp'?r._u:phUrl(r)),cv=phCompose(r,img),b=await phBlob(cv,'image/png');if(!b)throw 0;
    const a=document.createElement('a');a.href=URL.createObjectURL(b);a.download=phFile(r);a.style.display='none';document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},3000);
    toast('Đã tạo tệp '+a.download,{icon:'⬇',title:'Tải ảnh',key:'phdown'});
  }catch(e){toast('Không tải được ảnh.',{type:'warn'})}
}

/* ---------- sổ sticker ---------- */
function phBook(){
  const p=phS(),c=phCount(),pg=PH_PAGES.find(x=>x.id===PA.pg)||PH_PAGES[0],pp=phPage(pg.id);
  const tabs=PH_PAGES.map(x=>{const q=phPage(x.id);return '<button class="sm'+(x.id===pg.id?' on':'')+'" onclick="PA.pg=\''+x.id+'\';phDraw()">'+x.ic+' '+esc(x.n)+' <small>'+(q.done?'✓':q.got+'/'+q.all)+'</small></button>'}).join('');
  const cells=PH_STK.filter(k=>k.pg===pg.id).map((k,i)=>{
    const g=p.st[k.id];
    if(!g)return '<div class="ph-st no" tabindex="0" data-tip="'+esc(k.h)+'"><i class="ph-sic">'+k.ic+'</i><b>???</b><small>'+esc(k.h)+'</small></div>';
    const has=g.p&&PHDB.get(g.p);
    return '<button class="ph-st got" style="--r:'+(((i*7)%5)-2)*2+'deg" onclick="phStk(\''+k.id+'\')" data-tip="'+esc(k.h)+(has?' Bấm để xem ảnh.':'')+'"><i class="ph-sic">'+k.ic+'</i><b>'+esc(k.n)+'</b><small>'+phDate(g.t).slice(0,10)+(has?' · 📷':'')+'</small></button>';
  }).join('');
  return '<div class="ph-bar"><span class="ph-cap">Sticker '+c.got+'/'+c.all+' · mỗi sticker mới +'+PHC.coin+' xu · đủ một trang +'+PHC.page+' vé · đủ cả sổ thêm +'+PHC.book+' vé'+(p.all?' ✓':'')+'</span></div>'+
    '<div class="ph-pgs">'+tabs+'</div><div class="ph-stg">'+cells+'</div>'+
    '<div class="ph-foot">'+(p.pg[pg.id]?'🎟 Đã nhận thưởng trang này':'🎟 Đủ '+pp.all+' sticker trang này: +'+PHC.page+' vé (còn '+(pp.all-pp.got)+')')+'</div>';
}
function phStk(id){const g=phS().st[id];if(g&&g.p&&PHDB.get(g.p)){PA.tab='ph';PA.f='all';PA.v=g.p;PA.del=0;phDraw()}else toast('Ảnh nhận sticker này đã bị xóa hoặc không được lưu. Sticker vẫn giữ.',{icon:'🏷️',title:'Sổ sticker',key:'phnop'})}

/* ---------- Sổ tay ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const P=TUT_TEXT.book.pages;if(P.some(p=>p.id==='photo'))return;
  const i=P.findIndex(p=>p.id==='garden');P.splice(i<0?P.length:i+1,0,{id:'photo',ic:'📷',t:'Chụp ảnh và sổ sticker',p:[
    'Từ cấp '+PHOTO_LV+', góc trên phải khung phòng có nút 📷 Chụp ảnh và 🖼️ Album. Bấm 📷 để chụp đúng phần phòng đang thấy; kéo, phóng to trước để chọn khung hình.',
    'Album giữ tối đa '+PHC.max+' ảnh (khoảng '+PHC.mb+' MB). Mở một ảnh để xem lớn, đánh dấu ⭐ Yêu thích, ⬇ Tải về máy (tệp PNG có khung, ngày giờ, tên phòng và tên các bé) hoặc 🗑 Xóa. Album đầy thì ảnh mới không được lưu, hãy xóa bớt.',
    'Ảnh chỉ lưu trên trình duyệt của máy này, không lên máy chủ: chuyển sang máy khác thì sticker đi theo, ảnh thì không. Muốn giữ ảnh lâu dài, hãy tải về.',
    'Chụp đúng khoảnh khắc đặc biệt thì nhận sticker: bé ngủ trong ổ, 3 bé cùng ăn, bé 5★ đang diễn, mèo con cạnh mèo già, trời mưa, bé bị lạnh… Ô chưa có hiện bóng đen kèm gợi ý.',
    'Mỗi sticker mới +'+PHC.coin+' xu. Đủ một trang sticker +'+PHC.page+' vé, đủ cả sổ thêm +'+PHC.book+' vé. Xóa ảnh không làm mất sticker.']})})();

/* ---------- mẹo lần đầu ---------- */
setInterval(()=>{
  if(typeof TUT==='undefined'||!TUT.hint||!S||!S.tut||!S.tut.done||S.tut.fl||!photoOpen()||tab!=='home'||edit)return;
  if((S.tut.hints||{}).photo||(S.tut.hints||{}).all||(TUT.active&&TUT.active())||(TUT.replaying&&TUT.replaying()))return;
  if($('modal').style.display==='flex'||document.querySelector('.tut-tip.on')||($('gz')&&$('gz').className)||document.hidden)return;
  const b=$('photob');if(!b||!b.offsetParent)return;
  TUT.hint('photo',{target:()=>tab==='home'&&b.offsetParent?b.getBoundingClientRect():null,lines:['Có nút 📷 mới ở góc khung phòng! Chụp các bé để lưu vào album.','Chụp đúng khoảnh khắc đặc biệt (bé ngủ trong ổ, 3 bé cùng ăn, bé 5★ đang diễn…) để nhận sticker và xu. Nút 🖼️ ngay dưới mở album và sổ sticker.']});
},2500);

/* ---------- Admin ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n)=>'<button class="sm" onclick="'+f+'">'+n+'</button>',d=document.createElement('div'),c=phCount();
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>📷 Chụp ảnh và sticker</b><div class="dim">'+PHDB.list().length+' ảnh · '+phMB(PHDB.bytes())+' MB · sticker '+c.got+'/'+c.all+'</div>'+
    '<div class="row wrap">'+B('admPhoto(1)','🏷️ Nhận 1 sticker')+B('admPhoto(2)','🏷️ Nhận hết sticker')+B('admPhoto(3)','↺ Xóa sticker')+B('admPhoto(4)','🗑 Xóa hết ảnh')+B('admPhoto(5)','🖼️ Mở album')+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admPhoto(k){
  if(k===1){const m=PH_STK.find(x=>!phHas(x.id));if(!m){admDone('Đã đủ sticker',1);return}const r=photoAward([m.id],null);admDone('Sticker '+m.n+' (+'+r.coins+' xu'+(r.tickets?', +'+r.tickets+' vé':'')+')',1);return}
  if(k===2){const r=photoAward(PH_STK.map(x=>x.id),null);admDone('Đã nhận hết sticker (+'+r.coins+' xu, +'+r.tickets+' vé)',1);return}
  if(k===3){S.photo={n:(S.photo&&S.photo.n)|0,st:{},pg:{}};admDone('Đã xóa sổ sticker',1);return}
  if(k===4){PHDB.clear().then(()=>{PH_URL.forEach(u=>URL.revokeObjectURL(u));PH_URL.clear();Object.values(phS().st).forEach(g=>g.p=null);admDone('Đã xóa hết ảnh',1)});return}
  closeModal();openAlbum();
}
setTimeout(phBtn,0);
