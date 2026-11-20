"use strict";
/* ============ LINH VẬT MÈO XU VÀ THẺ "CHÀO MỪNG TRỞ LẠI" (2026-11-20) ============
   Nạp sau js/app-win.js, js/sfx.js (trước js/tutorial.js). CSS ở css/welcome.css. Không đổi luật chơi; bản lưu chỉ thêm cờ S.set.welc
   (false = tắt thẻ chào mừng, mặc định bật). Ảnh chụp lúc rời đi lưu riêng ở localStorage khóa 'meoxu_welc' (theo máy, không vào bản lưu).

   1. Linh vật: bé mèo mướp `muop` (đúng con mèo trên icon app) đeo dây đỏ có đồng xu vàng lỗ vuông (phụ kiện riêng `mxcoin`, đăng ký vào
      ACCART.NECK của js/acc-art.js, không có trong cửa hàng). mascotCv(pose, k) trả canvas hạt cườm (k = điểm ảnh mỗi ô gốc), có đệm.
   2. Thẻ chào mừng: người chơi quay lại sau ≥ 10 phút (trang ẩn rồi hiện, cửa sổ app hiện lại từ khay qua __mxOn('shown'), hoặc mở game
      khi lần rời trước đã ≥ 10 phút) thì hiện thẻ nhỏ góc dưới phải: linh vật chớp mắt, vẫy đuôi; lời chào theo giờ; tối đa 4 dòng tóm tắt
      (so ảnh chụp S lúc rời đi với lúc quay lại, cộng tổng kết AWAY "Lúc bạn vắng"). Bấm dòng là tới đúng chỗ. Tự ẩn sau 12 giây
      (rê chuột lên thẻ thì dừng đếm).
      Không hiện khi: chưa xong hướng dẫn tân thủ hoặc đang chạy hướng dẫn, đã tắt trong Cài đặt. Màn chào #appwel, gacha #gz, hộp thoại,
      các sách (khí hậu, điện, Nhà thuốc, album) hay màn nhắc xoay ngang đang mở thì chờ, đóng rồi mới hiện (chờ tối đa 10 phút).
      Thông báo "Lúc bạn vắng" (ui.js lúc tải game, bg.js khi máy ngủ) bị giữ lại và gộp vào thẻ; thẻ không hiện được thì trả lại thông báo.
   3. Cài đặt: thẻ "🐱 Linh vật Mèo Xu": linh vật vẫy đuôi, chạm thì kêu meo, thả tim và nói một mẹo; nút bật tắt thẻ chào mừng. */

/* ---------- 1. linh vật ---------- */
const MASCOT_KEY='muop';
// đồng xu vàng lỗ vuông trên dây đỏ, vẽ đè lên sprite như các phụ kiện cổ khác (toạ độ kit: lưới mịn, khung nhìn thẳng 72 ô ngang)
if(typeof ACCART!=='undefined'&&ACCART.NECK&&typeof CatKit!=='undefined'){
  ACCART.NECK.mxcoin=function(T,F){
    if(F.view==='side'||F.anim==='sleep')return;   // linh vật chỉ dùng các dáng ngồi nhìn thẳng
    const W=T.W,P=CatKit.P,part=T.F.part,OC=[78,48,38],[cx,ny]=F.A.neck;
    const isHead=i=>part[i]===P.HEAD||part[i]===P.EAR;
    const put=(x,y,c,own)=>{x=Math.round(x);y=Math.round(y);if(x<0||y<0||x>=W||y>77)return;const i=y*W+x;T.col[i]=c;T.own[i]=own||1};
    // dây đỏ: hai hàng ngay dưới cằm, chỉ trên ô thân (cằm che dây như đeo thật)
    for(let r=0;r<2;r++){const y=ny+r;for(let x=cx-16;x<=cx+16;x++){const i=y*W+x;if(T.cat[i]&&!isHead(i))put(x,y,r?[168,46,44]:[214,72,62])}}
    // đồng xu: tâm dưới dây, viền vàng sẫm, mặt vàng sáng dần lên trên, lỗ vuông giữa, một đốm sáng
    const R=4.6,ox=cx,oy=ny+6,cell=[];
    for(let y=Math.floor(oy-R-2);y<=Math.ceil(oy+R+2);y++)for(let x=Math.floor(ox-R-2);x<=Math.ceil(ox+R+2);x++){
      const d=Math.hypot(x+.5-ox,y+.5-oy);if(d<=R)cell.push([x,y,d])}
    const mine=new Set(cell.map(([x,y])=>y*W+x));
    // viền nâu đậm 1 ô quanh đồng xu (đè lên lông cũng được, cho nổi trên ngực)
    cell.forEach(([x,y])=>[[1,0],[-1,0],[0,1],[0,-1]].forEach(([dx,dy])=>{const u=x+dx,v=y+dy,j=v*W+u;if(!mine.has(j)&&!(T.own[j]===1))put(u,v,OC,2)}));
    cell.forEach(([x,y,d])=>{
      const t=(y+.5-(oy-R))/(2*R);   // 0 trên, 1 dưới
      let c=d>R-1.15?[200,146,42]:t<.3?[255,232,140]:t>.72?[230,170,50]:[246,204,80];
      const hx=Math.abs(x+.5-ox),hy=Math.abs(y+.5-oy);
      if(hx<1.1&&hy<1.1)c=[122,78,30];                               // lỗ vuông
      else if(d<=R-1.15&&Math.max(hx,hy)<2.1&&Math.max(hx,hy)>=1.1)c=[226,168,48]; // gờ quanh lỗ
      put(x,y,c,1)});
    put(ox-2.6,oy-2.4,[255,250,220]);put(ox-1.6,oy-3.2,[255,250,220]);
    put(ox,oy-R-1,[230,176,56]);   // khoen nối dây
  };
}
const MSC={c:{}};
// canvas linh vật ở tư thế pose (sit, sitb chớp mắt, sitt vẫy đuôi, groom0..3...), k điểm ảnh thật mỗi ô gốc
function mascotCv(pose,k){
  pose=pose||'sit';const f=Math.max(1,Math.round((k||4)/2)),key=pose+'|'+f;
  if(MSC.c[key])return MSC.c[key];
  let b=null;
  try{const s=Object.assign({},look(MASCOT_KEY),{acc:{h:'',n:'mxcoin'}});b=Art.cat(s,pose)}catch(e){}
  if(!b)try{b=Art.cat(look(MASCOT_KEY),pose)}catch(e){}
  const cv=b?bufCanvas(b,f):document.createElement('canvas');
  return MSC.c[key]=cv;
}
// khung bao phần có hình của cả ba dáng ngồi (để cắt bỏ lề trống của sprite, giữ chỗ gọn)
function mascotBox(k){const key='box|'+k;if(MSC.c[key])return MSC.c[key];
  let x0=1e9,y0=1e9,x1=-1,y1=-1;
  ['sit','sitb','sitt'].forEach(p=>{const c=mascotCv(p,k);if(!c.width)return;const d=c.getContext('2d').getImageData(0,0,c.width,c.height).data,W=c.width;
    for(let y=0;y<c.height;y++)for(let x=0;x<W;x++)if(d[(y*W+x)*4+3]>8){if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y}});
  return MSC.c[key]=x1<0?{x:0,y:0,w:1,h:1}:{x:x0,y:y0,w:x1-x0+1,h:y1-y0+1}}
// gắn linh vật động vào phần tử host: canvas tự đổi khung bằng setTimeout (ngồi, chớp mắt, vẫy đuôi); dừng khi host rời DOM,
// tạm nghỉ khi trang ẩn. cpf: số điểm ảnh CSS cho mỗi ô mịn (mỗi hạt cườm); ảnh luôn là bội số nguyên điểm ảnh thật, không làm mượt.
function mascotMount(host,cpf,mode){
  const dpr=window.devicePixelRatio||1,f=Math.max(2,Math.round((cpf||2)*dpr)),k=2*f,bx=mascotBox(k),cv=document.createElement('canvas');
  cv.width=bx.w;cv.height=bx.h;cv.className='msc-cv';cv.style.width=(bx.w/dpr)+'px';cv.style.height=(bx.h/dpr)+'px';
  host.appendChild(cv);const g=cv.getContext('2d');
  const draw=p=>{g.clearRect(0,0,cv.width,cv.height);g.drawImage(mascotCv(p,k),-bx.x,-bx.y)};draw('sit');
  const seq=mode==='tail'?['sitt','sit','sitt','sit','sit','sitb','sit','sitt','sit','sit']:['sit','sit','sitb','sit','sit','sitt','sit','sitt','sit','sit','sit','sitb','sit','sit'];
  let i=0;const st={stop:0,cv};
  const step=()=>{if(st.stop||!cv.isConnected){st.stop=1;return}
    const p=seq[i%seq.length];if(!document.hidden){draw(p);i++}
    st.t=setTimeout(step,p==='sitb'?170:(320+Math.random()*260))};
  st.t=setTimeout(step,500);
  st.end=()=>{st.stop=1;clearTimeout(st.t)};
  return st;
}

/* ---------- 2. thẻ chào mừng trở lại ---------- */
const WEL={min:600000,ms:12000,maxWait:600000,lsKey:'meoxu_welc',snap:null,pend:null,held:[],ate:0,thx:0,el:null,tm:0,an:null,wt:0,inSet:0};
const welOn=()=>!(S&&S.set&&S.set.welc===false);
const welTutBusy=()=>!(S&&S.tut&&S.tut.done)||(typeof TUT!=='undefined'&&(TUT.active()||TUT.replaying()));
const welFmt=ms=>{const m=Math.max(1,Math.round(ms/60000)),h=Math.floor(m/60),d=Math.floor(h/24);
  return d?d+' ngày'+(h%24?' '+h%24+' giờ':''):h?h+' giờ'+(m%60?' '+m%60+' phút':''):m+' phút'};
const welN=n=>Math.round(n).toLocaleString('vi-VN');
function welSnap(){return {t:now(),coins:Math.round(S.coins||0),tk:S.tickets||0,lv:S.level||1,nid:S.nid||0}}
function welPersist(sn){try{localStorage.setItem(WEL.lsKey,JSON.stringify(sn||welSnap()))}catch(e){}}
// rời đi: chụp trạng thái (giữ ảnh chụp sớm nhất nếu rời nhiều lần liền)
function welLeave(){
  if(!S)return;
  if(!WEL.snap){WEL.snap=welSnap();WEL.ate=0;WEL.thx=0}
  welPersist(WEL.snap);
  if(WEL.pend)welDrop();   // thẻ còn chờ mà người chơi lại đi: bỏ, trả thông báo đã giữ
  welHide(1);
}
// sắp hiện thẻ không? (để giữ lại thông báo "Lúc bạn vắng" thay vì hiện trùng)
function welWill(){
  if(!welOn()||welTutBusy())return false;
  if(WEL.pend)return true;
  return !!(WEL.snap&&now()-WEL.snap.t>=WEL.min);
}
// quay lại: so với ảnh chụp, đủ 10 phút thì lập thẻ
function welBack(){
  if(!WEL.snap||!S)return;
  if(document.hidden)return;   // cửa sổ app báo 'shown' mà trang còn ẩn: đợi visibilitychange
  try{if(typeof BG!=='undefined'&&BG.wake)BG.wake()}catch(e){}   // bù nốt thời gian (bg.js) trước khi tóm tắt
  const sn=WEL.snap;WEL.snap=null;
  const away=now()-sn.t,rec={sn,away,ate:WEL.ate,thx:WEL.thx,at:Date.now()};WEL.ate=WEL.thx=0;welPersist();
  if(away<WEL.min||!welOn()||welTutBusy()){welRelease();return}
  WEL.pend=rec;welTry();
}
function welRelease(){const h=WEL.held.splice(0);h.forEach(x=>{try{WEL.T0.apply(null,x.args)}catch(e){}})}
function welDrop(){WEL.pend=null;clearTimeout(WEL.wt);welRelease()}
// điều kiện tạm thời (chờ đóng rồi hiện)
function welBlocked(){
  const on=id=>{const e=document.getElementById(id);return !!(e&&e.classList.contains('on'))};
  if(document.getElementById('appwel'))return true;
  if(document.querySelector('.mxd-ov'))return true;   // hộp thoại pixel (js/dialog.js)
  if(on('gz'))return true;
  const m=document.getElementById('modal');if(m&&m.style.display==='flex')return true;
  if(['wxbook','pwbook','medbook','phalb'].some(on))return true;
  if(typeof needLandscape==='function'&&needLandscape())return true;
  if(document.hidden)return true;
  return false;
}
function welTry(){
  clearTimeout(WEL.wt);const r=WEL.pend;if(!r)return;
  if(!welOn()||welTutBusy()){welDrop();return}
  if(welBlocked()){if(Date.now()-r.at>WEL.maxWait){welDrop();return}WEL.wt=setTimeout(welTry,900);return}
  WEL.pend=null;welShow(r);
}

// lời chào theo giờ máy
function welGreet(away){
  const h=new Date().getHours(),pick=a=>a[Math.floor(Math.random()*a.length)];
  const hi=h>=5&&h<10?pick(['Chào buổi sáng!','Sáng rồi, dậy chơi với các bé nào!','Chào buổi sáng, ngủ ngon không?'])
    :h>=10&&h<13?pick(['Chào buổi trưa!','Trưa rồi, các bé đòi ăn nè!'])
    :h>=13&&h<18?pick(['Chào buổi chiều!','Chiều rồi, ghé thăm các bé chút nào!'])
    :h>=18&&h<22?pick(['Chào buổi tối!','Tối rồi, cả nhà đang chờ bạn!'])
    :pick(['Khuya rồi mà vẫn ghé à?','Đêm khuya, các bé sắp ngủ rồi nè.']);
  const sub=away>=6*3600000?pick(['Lâu quá mới gặp, cả nhà nhớ bạn lắm.','Bạn đi lâu ghê, các bé ngóng mãi.'])
    :pick(['Về rồi à, cả nhà nhớ bạn lắm.','Các bé ngóng bạn nãy giờ đó.','Mèo Xu trông nhà giúp bạn rồi nè.','Bạn về đúng lúc, các bé đang chờ.']);
  return {hi,sub};
}
// các dòng tóm tắt (tối đa 4), mỗi dòng {ic, t, go}
function welLines(r){
  const L=[],t=now(),add=(ic,txt,go)=>L.push({ic,t:txt,go});
  try{const done=S.trips.filter(p=>p&&t>=p.end),nw=done.filter(p=>p.end>r.sn.t);
    if(done.length){const p=(nw[0]||done[0]),c=catBy(p.uid),d=DEST[p.dest];
      add('🎒',done.length===1?(c?c.name:'Một bé')+' đi '+(d?d.n:'viễn chinh')+' đã về, chờ bạn nhận':done.length+' chuyến viễn chinh đã về, chờ bạn nhận','trip')}}catch(e){}
  try{const n=r.held.reduce((a,h)=>a+h.n,0)+r.ate,th=r.held.reduce((a,h)=>a+h.coins,0)+r.thx,cost=r.held.reduce((a,h)=>a+h.cost,0),dc=Math.round(S.coins-r.sn.coins);
    const okSig=r.sn.coins!=null&&(S.nid||0)>=r.sn.nid&&(S.level||1)>=r.sn.lv;
    const meal=n?'các bé tự ra ăn '+n+' suất, cảm ơn +'+welN(th)+' xu'+(cost?' (máy cho ăn tốn '+welN(cost)+')':''):'';
    if(okSig&&dc>0)add('🪙','Ví tăng +'+welN(dc)+' xu'+(meal?' · '+meal:''),'home');
    else if(meal)add('🍖',meal[0].toUpperCase()+meal.slice(1),'home')}catch(e){}
  try{r.held.filter(h=>h.vs).slice(-1).forEach(h=>add('🐾',h.vs.replace(/^Lúc bạn vắng, /,'').replace(/^./,c=>c.toUpperCase()).replace(/\.$/,''),'visit'))}catch(e){}
  try{ownedRooms().forEach(rm=>{if(L.length>=6)return;const hc=homeCats(rm.id);if(!hc.length)return;const bs=bowlsIn(rm.id);if(!bs.length)return;
    const av=bs.reduce((a,b)=>a+(typeof mAvail==='function'?Math.max(0,Math.floor(mAvail('f',b))):(b.left||0)),0);
    if(av===0&&hc.some(c=>c.full<50)&&!L.some(x=>x.ic==='🥣'))add('🥣','Bát ăn ở '+rm.n+' đã cạn, các bé đang đói','room:'+rm.id)})}catch(e){}
  try{const st=S.stray?Object.keys(S.stray).filter(u=>S.stray[u]):[];if(st.length){const c=catBy(+st[0]);
    add('😿',st.length===1?(c?c.name:'Một bé')+' đang đi lạc, nhờ bạn đi tìm':st.length+' bé đang đi lạc','cat:'+st[0])}}catch(e){}
  try{if(typeof visOpen==='function'&&visOpen()&&S.vis){const ready=S.vis.g&&Object.values(S.vis.g).some(g=>g&&g.st==='ready');
    if(ready)add('🐾','Có bé lạ muốn ở lại nhà bạn','visit');
    else if(S.vis.cur&&S.vis.cur.end>t){const rm=ROOM[S.vis.cur.rid];add('🐾','Có bé lạ đang ghé '+(rm?rm.n:'nhà bạn')+' chơi','room:'+S.vis.cur.rid)}}}catch(e){}
  try{if(S.level>r.sn.lv)add('🎉','Lên cấp '+S.level+', xem thứ vừa mở','lv')}catch(e){}
  return L.slice(0,4);
}
// tới đúng chỗ
function welGo(s){
  welHide();s=String(s||'home');
  const closeAll=()=>{if($('modal').style.display==='flex'&&!$('modal').classList.contains('lock'))closeModal()};
  try{
    closeAll();
    if(['home','trip','gacha','shop','cats','album','ach'].includes(s)){setTab(s);return}
    const [k,v]=s.split(':');
    if(k==='room'){setTab('home');if(v&&S.rooms[v]&&cur!==v)setRoom(v);return}
    if(k==='cat'){setTab('cats');const c=catBy(+v);if(c)openCat(c.uid);return}
    if(k==='visit'){setTab('home');if(typeof openVisits==='function')openVisits();return}
    if(k==='lv'){if(typeof openRoadmap==='function')openRoadmap();else setTab('home');return}
    setTab('home');
  }catch(e){}
}
function welShow(r){
  welHide(1);
  r.held=WEL.held.splice(0);
  const g=welGreet(r.away),L=welLines(r);
  const el=document.createElement('div');el.id='welc';el.setAttribute('role','status');el.setAttribute('aria-live','polite');
  el.innerHTML='<button class="wc-x" type="button" aria-label="Đóng" title="Đóng">✕</button>'+
    '<div class="wc-hd"><div class="wc-msc" aria-hidden="true"></div><div class="wc-tx"><small>Mèo Xu · bạn vắng '+welFmt(r.away)+'</small><b>'+esc(g.hi)+'</b><span>'+esc(g.sub)+'</span></div></div>'+
    (L.length?'<div class="wc-ls">'+L.map((x,i)=>'<button type="button" class="wc-ln" data-i="'+i+'" title="'+esc(x.t)+'"><span class="wc-ic">'+x.ic+'</span><span class="wc-lt">'+esc(x.t)+'</span><span class="wc-ar">›</span></button>').join('')+'</div>'
      :'<div class="wc-ls"><div class="wc-ok">🏡 Nhà cửa yên ổn, các bé vẫn ngoan.</div></div>')+
    '<div class="wc-ft"><button type="button" class="wc-go on">🏠 Vào nhà</button><i class="wc-bar"></i></div>';
  if(typeof emoEl==='function')try{emoEl(el)}catch(e){}
  document.body.appendChild(el);WEL.el=el;welPlace();
  WEL.an=mascotMount(el.querySelector('.wc-msc'),matchMedia('(max-height:700px)').matches?1:1.5);
  el.style.setProperty('--mw',WEL.an.cv.style.width);el.style.setProperty('--mh',WEL.an.cv.style.height);
  el.querySelector('.wc-x').onclick=()=>welHide();
  el.querySelector('.wc-go').onclick=()=>welGo('home');
  el.querySelectorAll('.wc-ln').forEach(b=>{b.onclick=()=>welGo(L[+b.dataset.i].go)});
  // tự ẩn sau 12 giây; rê chuột hoặc focus vào thẻ thì dừng đếm
  let left=WEL.ms,t0=Date.now();const bar=el.querySelector('.wc-bar');
  const run=()=>{t0=Date.now();clearTimeout(WEL.tm);WEL.tm=setTimeout(()=>welHide(),left);bar.style.transition='none';bar.style.transform='scaleX('+(left/WEL.ms)+')';
    void bar.offsetWidth;bar.style.transition='transform '+left+'ms linear';bar.style.transform='scaleX(0)'};
  let paused=0;const shown=Date.now();
  const pause=()=>{if(paused)return;paused=1;clearTimeout(WEL.tm);left=Math.max(1500,left-(Date.now()-t0));const k=getComputedStyle(bar).transform;bar.style.transition='none';bar.style.transform=k==='none'?'':k};
  const resume=()=>{if(!paused)return;paused=0;run()};
  // chuột đứng yên đúng chỗ thẻ hiện ra (trình duyệt báo pointerenter ngay) thì không tính: chỉ dừng khi người chơi rê chuột tới thẻ
  el.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&Date.now()-shown>700)pause()});
  el.addEventListener('pointerleave',e=>{if(e.pointerType==='mouse')resume()});
  el.addEventListener('focusin',pause);el.addEventListener('focusout',e=>{if(!el.contains(e.relatedTarget))resume()});
  requestAnimationFrame(()=>requestAnimationFrame(()=>{el.classList.add('on');run()}));
  setTimeout(()=>{if(WEL.el===el&&!el.classList.contains('on')){el.classList.add('on');run()}},120);   // trang chưa vẽ khung (rAF chưa chạy): dự phòng
  WEL.last=r;
}
// thêm một dòng vào thẻ đang hiện (tối đa 4 dòng); trả true nếu đã thêm
function welAddLine(x){
  const el=WEL.el;if(!el||el.classList.contains('out'))return false;let ls=el.querySelector('.wc-ls');const n=el.querySelectorAll('.wc-ln').length;if(n>=4)return false;
  const ok=ls.querySelector('.wc-ok');if(ok)ok.remove();
  const b=document.createElement('button');b.type='button';b.className='wc-ln';b.title=x.t;
  b.innerHTML='<span class="wc-ic">'+x.ic+'</span><span class="wc-lt">'+esc(x.t)+'</span><span class="wc-ar">›</span>';
  if(typeof emoEl==='function')try{emoEl(b)}catch(e){}
  b.onclick=()=>welGo(x.go);ls.appendChild(b);return true;
}
function welHide(now_){
  const el=WEL.el;if(!el)return;WEL.el=null;clearTimeout(WEL.tm);if(WEL.an)WEL.an.end();WEL.an=null;
  if(now_){el.remove();return}
  el.classList.remove('on');el.classList.add('out');setTimeout(()=>el.remove(),320);
}
// đặt thẻ: góc dưới phải; menu tab nằm dưới đáy (màn dọc, máy tính bảng) thì đặt ngay trên menu
function welPlace(){
  const el=WEL.el;if(!el)return;const tb=$('tabs');let b=0;
  if(tb){const r=tb.getBoundingClientRect();if(r.height&&r.top>innerHeight*.55&&r.width>innerWidth*.5)b=Math.max(0,innerHeight-r.top)}
  el.style.setProperty('--wcb',b+'px');
}
addEventListener('resize',welPlace);
// tiến trình hướng dẫn bắt đầu khi thẻ đang hiện: ẩn thẻ
setInterval(()=>{if(WEL.el&&welTutBusy())welHide()},1500);

// đếm bữa ăn trong lúc vắng (trang ẩn, chưa hiện thẻ); phần bù lúc tải game hay máy ngủ (TOFF) đã có AWAY đếm
if(typeof mealGain==='function'){const M0=mealGain;mealGain=function(c,b,k){const r=M0.apply(this,arguments);
  try{if(WEL.snap&&!TOFF&&k==='f'&&r&&r.coins){WEL.ate++;WEL.thx+=r.coins}}catch(e){}return r}}
// thông báo "Lúc bạn vắng": giữ lại để gộp vào thẻ (khỏi hiện trùng); thẻ không hiện được thì trả lại
{const T0=toast;WEL.T0=T0;
  toast=function(msg,o){
    if(o&&o.title==='Lúc bạn vắng'&&welWill()){WEL.held.push({args:[msg,o],n:AWAY.n||0,coins:AWAY.coins||0,cost:AWAY.cost||0});return}
    // bé lạ ghé lúc vắng (js/visit-ui.js báo 3 giây sau khi tải game): thẻ đang chờ hoặc vừa hiện thì gộp thành một dòng của thẻ
    if(o&&o.key==='vsaway'){
      if(WEL.pend&&welWill()){WEL.held.push({args:[msg,o],n:0,coins:0,cost:0,vs:msg});return}
      if(WEL.el&&welAddLine({ic:'🐾',t:String(msg).replace(/^Lúc bạn vắng, /,'').replace(/^./,c=>c.toUpperCase()).replace(/\.$/,''),go:'visit'}))return;
    }
    return T0.apply(this,arguments)};
}
// trang ẩn, hiện
document.addEventListener('visibilitychange',()=>{if(document.hidden)welLeave();else setTimeout(welBack,250)});
addEventListener('pagehide',()=>{try{if(S)welPersist(WEL.snap||welSnap())}catch(e){}});
// app Windows: cửa sổ ẩn vào khay / hiện lại (giữ nguyên xử lý cũ của js/app-win.js)
if(typeof window.__mxOn==='function'){const O=window.__mxOn;window.__mxOn=function(type,data){const r=O.apply(this,arguments);
  try{if(type==='hidden')welLeave();else if(type==='shown')setTimeout(welBack,250)}catch(e){}return r}}
// đang chơi: cứ 30 giây ghi lại lúc còn ở đây, để lần mở game sau biết đã vắng bao lâu
setInterval(()=>{if(!document.hidden&&!WEL.snap&&S)welPersist()},30000);
// mở game: lần trước rời đi đủ 10 phút thì chào (AWAY của load() đến qua thông báo "Lúc bạn vắng" ở ui.js, được giữ lại ở trên)
(()=>{
  let sn=null;try{sn=JSON.parse(localStorage.getItem(WEL.lsKey)||'null')}catch(e){}
  if(!S)return;
  // chưa có ảnh chụp (lần đầu sau bản cập nhật, dữ liệu trang bị xóa): lấy lúc lưu cuối của bản lưu (S.last, load() chưa ghi lại), không so được xu
  if((!sn||typeof sn.t!=='number')&&typeof S.last==='number'&&S.last>0)sn={t:S.last,coins:null,lv:S.level||1,nid:S.nid||0};
  if(!sn||typeof sn.t!=='number')return;
  if(document.hidden){WEL.snap=sn;return}   // mở mà trang đang ẩn (app khởi động vào khay): chờ lúc hiện
  if(now()-sn.t>=WEL.min&&welOn()&&!welTutBusy()){WEL.pend={sn,away:now()-sn.t,ate:0,thx:0,at:Date.now()};WEL.wt=setTimeout(welTry,1400)}
  welPersist();
})();

/* ---------- 3. Cài đặt: thẻ "🐱 Linh vật Mèo Xu" ---------- */
function welTips(){
  const T=['Chạm một lần vào bé để vuốt ve, chạm hai lần liền để quan sát bé.',
    'Giữ Ctrl rồi lăn chuột trên phòng để phóng to, thu nhỏ.',
    'Mỗi bé vuốt ve được 10 phút một lần, nhận số xu bằng số sao của bé.',
    'Quay gacha 10 lượt liền chắc chắn có bé từ 4★; 40 lượt chưa ra 5★ thì lượt sau chắc chắn 5★.',
    'Mua thức ăn vào kho rồi đổ vào bát; bé ăn xong cảm ơn bạn vài xu.',
    'Chợ cá cho nhiều xu mỗi phút hơn Bờ hồ và Bến cảng; chuyến dài thì đỡ tốn sức hơn.',
    'Bấm ô Cấp trên cùng để xem mỗi cấp sẽ mở thêm gì.',
    'Chuột, bướm chạy qua phòng là khách lạ: chạm trúng để nhận xu.',
    'Bé ở Phòng chờ kém vui; mua phòng mới là các bé tự chuyển vào.',
    'Có bé trùng loài? Kết thân trong màn chi tiết để bé còn lại thêm tim.',
    'Sổ tay trong Cài đặt giải thích đủ mọi tính năng.',
    'Nhiệm vụ trong giờ đổi mỗi giờ, nhiệm vụ hôm nay đổi lúc nửa đêm.'];
  if(window.MXAPP){let hk='Ctrl+Alt+M';try{if(typeof awCfg==='function')hk=awCfg().hotkey||''}catch(e){}
    if(hk)T.push('Nhấn '+hk.split('+').join(' + ')+' ở bất cứ đâu trong Windows để gọi hoặc ẩn Mèo Xu.');
    T.push('Nhấn F11 để bật tắt toàn màn hình.','Ctrl + Q lưu rồi thoát game.')}
  return T;
}
function welPet(el){
  const box=el.closest('.wcs');if(!box)return;
  const L=welTips();let i=Math.floor(Math.random()*L.length);if(L.length>1&&i===WEL.lastTip)i=(i+1)%L.length;WEL.lastTip=i;
  const bub=box.querySelector('.wcs-bub');if(bub){bub.textContent='💡 '+L[i];bub.classList.remove('pop');void bub.offsetWidth;bub.classList.add('pop')}
  const m=box.querySelector('.wcs-msc');
  if(m){m.classList.remove('hop');void m.offsetWidth;m.classList.add('hop');
    for(let k=0;k<3;k++){const h=document.createElement('i');h.className='wcs-hrt';h.textContent='♥';h.style.setProperty('--dx',((k-1)*16+Math.random()*8-4)+'px');h.style.animationDelay=(k*90)+'ms';m.appendChild(h);setTimeout(()=>h.remove(),1300)}}
  // tiếng meo theo công tắc và âm lượng "Âm thanh giao diện" (js/sfx.js); không có sfx.js thì kêu ở mức mặc định
  const vol=typeof sfxOn==='function'?(sfxOn()?(typeof sfxVol==='function'?sfxVol():.5):0):.5;
  if(vol>0&&typeof meow==='function')try{meow({f:640+Math.random()*80,d:.5,v:.36*vol})}catch(e){}
}
function welSet(on){S.set.welc=!!on;save();if(!on){welHide();welDrop()}const mb=$('mbox');if(mb&&mb.querySelector('.wcs')){const y=mb.scrollTop;openSettings();$('mbox').scrollTop=y}}
function welCard(){
  const on=welOn();
  return '<div class="card wcs" style="flex-direction:column;align-items:stretch"><b>🐱 Linh vật Mèo Xu</b>'+
    '<div class="wcs-row"><button type="button" class="wcs-msc" aria-label="Chạm vào Mèo Xu" onclick="welPet(this)"></button>'+
      '<div class="wcs-bub" aria-live="polite">Chào bạn, mình là Mèo Xu! Chạm vào mình để nghe một mẹo nhé.</div></div>'+
    '<span class="wcs-lb">Thẻ "Chào mừng trở lại"</span>'+
    '<div class="row"><button style="flex:1" class="'+(on?'on':'')+'" onclick="welSet(1)">Hiện</button><button style="flex:1" class="'+(on?'':'on')+'" onclick="welSet(0)">Ẩn</button></div>'+
    '<small>Khi bạn quay lại sau 10 phút trở lên, Mèo Xu tóm tắt những gì đã xảy ra lúc bạn vắng: xu, viễn chinh, bữa ăn, việc đang chờ.</small></div>';
}
{const O=openSettings;openSettings=function(){WEL.inSet++;let r;try{r=O.apply(this,arguments)}finally{WEL.inSet--}
  try{const m=document.querySelector('#mbox .wcs .wcs-msc');if(m&&!m.querySelector('canvas'))mascotMount(m,1.5,'tail')}catch(e){}
  return r}}
if(typeof pwaCard==='function'){const P0=pwaCard;pwaCard=function(){return (WEL.inSet?welCard():'')+P0.apply(this,arguments)}}
