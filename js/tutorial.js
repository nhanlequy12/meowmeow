"use strict";
/* ============ HƯỚNG DẪN TÂN THỦ: LÕI ============
   Lớp phủ #tut (z-index 45: trên hộp thoại, gacha và popup viễn chinh; dưới thông báo và tooltip):
   làm tối màn hình, khoanh sáng chỗ cần bấm, bàn chân mèo chỉ vào, khung thoại của Xoài chạy chữ, nút Bỏ qua.
   - Bước [bấm] (có act): chỉ bấm được vào chỗ khoanh sáng; phím Esc, Tab, Enter ra ngoài bị chặn.
   - Bước [xem]: chạm bất kỳ đâu để hiện hết chữ, chạm nữa để sang câu.
   - Tiến độ lưu trong S.tut {step, got:{starter,ticket,gift}, hints:{}, cat, gcat, done}. Mỗi phần quà có cờ riêng trong got.
   - Chế độ xem lại (TUT.replay): không lưu bước, không phát quà, bước tốn xu/vé thành bước xem.
   API cho js/tut-starter.js và js/tut-hints.js: TUT.on, TUT.hook, TUT.hint, TUT.seen, TUT.resetHints, TUT.busy, TUT.active,
   TUT.anim, TUT.fill, TUT.startReplay. Chữ ở js/tut-text.js. Thiết kế: docs/tutorial-plan.md. */
const TUT=(()=>{
  const TX=TUT_TEXT,Q=s=>document.querySelector(s),QA=s=>[...document.querySelectorAll(s)];
  const st=()=>S.tut||(S.tut={done:1,hints:{}});
  let skipAsk=false,E=null,cs=null,line=0,typ=null,rp=false,raf=0,shownAt=0,scrolled=false,waiting=false,rpCat=null;
  const subs={};

  /* ---------- móc vào hàm có sẵn của game (khai báo function toàn cục) ---------- */
  function hook(name){
    const f=window[name]; if(typeof f!=='function'||f.__tut)return;
    const w=function(){const r=f.apply(this,arguments);fire(name,[...arguments],r);return r};
    w.__tut=1;w.__orig=f;window[name]=w;
  }
  function on(name,cb){hook(name);(subs[name]=subs[name]||[]).push(cb)}
  function fire(name,args,ret){(subs[name]||[]).forEach(cb=>{try{cb(args,ret)}catch(e){console.error(e)}})}

  /* ---------- sprite chuyển động trên khung Xoài ---------- */
  // anim(key, poses, fps, k): thẻ <img> đổi khung theo dãy tư thế CatKit (vd 'walk0s'..'walk7s'); k = điểm ảnh CSS mỗi ô gốc như catTag
  const AN={};let anN=0;
  const frameSrc=(key,pose,k)=>{const n=kk(k),id=key+'|'+pose+'|'+n+'|tut';return CI[id]||(CI[id]=catCv(key,pose,n).toDataURL())};
  function anim(key,poses,fps,k,cls){
    const id='a'+(++anN),fr=poses.map(p=>frameSrc(key,p,k)),cv=catCv(key,poses[0],kk(k)),d=DPR();
    AN[id]={fr,i:0,ms:1000/(fps||6),t:0,miss:0};
    return '<img class="px tut-anim'+(cls?' '+cls:'')+'" data-a="'+id+'" alt="" draggable="false" width="'+cv.lw*kk(k)/d+'" height="'+cv.lh*kk(k)/d+'" src="'+fr[0]+'">';
  }
  let anLast=performance.now();
  setInterval(()=>{const t=performance.now(),dt=t-anLast;anLast=t;
    for(const id in AN){const a=AN[id],els=QA('img[data-a="'+id+'"]');if(!els.length){if(++a.miss>30)delete AN[id];continue}a.miss=0;
      a.t+=dt;if(a.t<a.ms)continue;a.t%=a.ms;a.i=(a.i+1)%a.fr.length;els.forEach(e=>{e.src=a.fr[a.i]})}},50);
  const SEQ={sit:['sit0s','sit0s','sit0s','sit0s','sit2s','sit0s'],tail:['sit0s','sit3s','sit3s','sit0s'],groom:['groom0s','groom1s','groom2s','groom3s','groom4s','groom5s'],
    sleep:['sleep0s','sleep1s','sleep2s','sleep3s'],walk:[0,1,2,3,4,5,6,7].map(i=>'walk'+i+'s'),run:[0,1,2,3,4,5,6,7].map(i=>'run'+i+'s'),jump:[0,1,2,3,4,5,6,7].map(i=>'jump'+i+'s')};
  const FPS={sit:3,tail:3,groom:6,sleep:2,walk:8,run:12,jump:8};
  const pose=(key,p,k,cls)=>anim(key,SEQ[p],FPS[p],k,cls);

  /* ---------- chữ ---------- */
  const starter=()=>catBy(st().cat)||S.cats[0];
  const gcat=()=>catBy(st().gcat)||rpCat||S.cats[S.cats.length-1];
  function fill(s,o){o=o||{};const a=starter(),b=gcat();
    return String(s).replace(/\{cat\}/g,o.cat||(a?a.name:'bé')).replace(/\{new\}/g,o.new||(b?b.name:'bé')).replace(/\{breed\}/g,o.breed||'')}
  // tách câu thành từng "ký tự" để chạy chữ; emoji có icon thì thành một ảnh
  function toks(s){const out=[];let last=0;s=esc(s);s.replace(EMO_RE,(m,k,i)=>{for(const ch of s.slice(last,i))out.push(ch);out.push(icoTag(EMO_IC[k]));last=i+m.length;return m});
    for(const ch of s.slice(last))out.push(ch);return out}

  /* ---------- các bước của luồng chính ---------- */
  const tabBtn=t=>'#tabs button[onclick="setTab(\''+t+'\')"]';
  const modalOn=()=>$('modal').style.display==='flex';
  const isCat=()=>modalOn()&&$('mbox').querySelector('.cd-head');
  const cdSec=i=>()=>QA('#mbox .cd-sec')[i];
  function ensureTab(t){if(tab!==t)setTab(t)}
  function catRect(){
    const c=starter();if(!c||tab!=='home')return null;
    const e=ents.find(e=>e.uid===c.uid&&!e.clone);if(!e)return null;
    const p=entPos(e),r=room.getBoundingClientRect(),s=room.clientWidth/VW,x0=r.left+room.clientLeft,y0=r.top+room.clientTop;
    return {left:x0+(p.x-camX-24)*s,top:y0+(p.y-camY-38)*s,width:48*s,height:40*s};
  }
  const STEPS=[
    {id:'hi',say:'hi',guide:1},
    {id:'pick',pick:1,noSkip:1,replayOff:1,skip:()=>!!(st().got&&st().got.starter&&catBy(st().cat))},
    {id:'room',say:'room',tab:'home',target:'#roomwrap',pass:1,enter(){const c=starter();if(c&&c.room!=='wait'&&c.room!==cur)setRoom(c.room)}},
    {id:'pet',say:'pet',tab:'home',target:catRect,act:'petCat',enter(){const c=starter();$('roomwrap').scrollIntoView({block:'nearest'});if(c&&!onTrip(c.uid))follow(c.uid)},skip:()=>!starter()||onTrip(starter().uid)||starter().room!==cur},
    {id:'fol',say:'fol',tab:'home',target:'#folcard',enter(){const c=starter();if(c&&!fol&&!onTrip(c.uid)&&c.room===cur)follow(c.uid)}},
    {id:'poses',say:'poses',card:'poses'},
    {id:'view',say:'view',tab:'home',target:['#roomwrap','#zoomb'],pass:1,enter(){if(fol)unfollow(true)}},
    {id:'feed',say:'feed',tab:'home',target:'#panel button[onclick="openFeed()"]',act:'openFeed',done:()=>modalOn(),skip:()=>!bowlReady(cur)||!homeCats(cur).length},
    {id:'food',say:'food',target:'#mbox button[onclick="doFeed(\'kibble\')"]',act:'doFeed',enter(){if(!modalOn())openFeed()},skip:()=>!bowlReady(cur)||!homeCats(cur).length,close:1},
    {id:'fed',say:'fed',tab:'home',target:'#panel > .row',enter(){if(modalOn())closeModal()}},
    {id:'ticket',say:'ticket',replayOff:1,enter(){grant('ticket')}},
    {id:'gtab',say:'gtab',target:tabBtn('gacha'),act:'setTab',done:()=>tab==='gacha',enter(){if(modalOn())closeModal()}},
    {id:'stars',say:'stars',card:'stars',tab:'gacha'},
    {id:'pull',say:'pull',tab:'gacha',target:'#panel button[onclick="doGacha(true)"]',act:'pull',skip:()=>!rp&&!!catBy(st().gcat)},
    {id:'reveal',say:'reveal',sayTop:1,target:['#grev .gv-row','#grev .gv-btn'],act:'gachaDone',wait:'gReveal',replayOff:1,
      skip:()=>!$('gz').classList.contains('on'),leave(){const c=catBy(st().gcat);if(c)delete c.isNew}},
    {id:'dhead',say:'dhead',target:'#mbox .cd-head',enter(){if(!isCat())openCat(gcat().uid)}},
    {id:'dprof',say:'dprof',target:cdSec(0),enter(){if(!isCat())openCat(gcat().uid)}},
    {id:'dtrait',say:'dtrait',target:cdSec(2),pass:1,enter(){if(!isCat())openCat(gcat().uid)}},
    {id:'atab',say:'atab',target:tabBtn('album'),act:'setTab',done:()=>tab==='album',enter(){if(modalOn())closeModal()}},
    {id:'album',say:'album',tab:'album',target:'#panel > .row.wrap',enter(){if(albumG!=='breed'){albumG='breed';renderPanel()}}},
    {id:'rare',say:'rare',tab:'album',target:'#panel button[onclick*="albumG=\'rare\'"]'},
    {id:'ttab',say:'ttab',target:tabBtn('trip'),act:'setTab',done:()=>tab==='trip'},
    {id:'slot',say:'slot',tab:'trip',target:'#panel button[onclick="openPicker(0)"]',act:'openPicker',done:()=>modalOn(),skip:()=>!rp&&!!S.trips[0]},
    {id:'trip',say:'trip',target:'#mbox .card.tap',act:'doTrip',done:()=>!!S.trips[0],enter(){if(!modalOn())openPicker(0)},skip:()=>!rp&&!!S.trips[0],close:1},
    {id:'tinfo',say:'tinfo',tab:'trip',target:()=>Q('#panel > .card'),enter(){if(modalOn())closeModal()}},
    {id:'stab',say:'stab',target:tabBtn('shop'),act:'setTab',done:()=>tab==='shop'},
    {id:'shop',say:'shop',tab:'shop',target:['#panel > .row.wrap','#panel > .dim'],enter(){if(shopT!=='rooms'){shopT='rooms';renderPanel()}}},
    {id:'level',say:'level',target:'#top .chip.xp'},
    {id:'gift',say:'gift',tab:'home',card:'gift',act:'gift',enter(){if(modalOn())closeModal()},skip:()=>!rp&&!!(st().got&&st().got.gift)},
    {id:'next',say:'next',card:'next'},
    {id:'bye',say:'bye',guide:1}
  ];
  const SI=Object.fromEntries(STEPS.map((s,i)=>[s.id,i]));

  /* ---------- quà: mỗi phần một cờ, không phát hai lần ---------- */
  const GIFT={coins:300,tickets:2,item:'mouse'};
  function grant(k){
    const t=st();t.got=t.got||{};if(t.got[k])return false;t.got[k]=1;
    if(k==='ticket'){S.tickets+=1;save();renderTop();toast(TX.gift.ticketToast,{icon:'🎟',title:TX.guide.name});return true}
    if(k==='gift'){S.coins+=GIFT.coins;S.tickets+=GIFT.tickets;S.items.push({iid:S.nid++,fid:GIFT.item,room:null,x:120,y:150,flip:false,broken:false});save();render();
      toast('+'+GIFT.tickets+' vé 🎟 · '+FURN[GIFT.item].n+' (trong Kho đồ)',{type:'coin',title:TX.gift.got,coins:GIFT.coins,ms:4200});return true}
    return false;
  }
  const giftRows=()=>['🪙 <b>'+GIFT.coins+'</b> xu','🎟 <b>'+GIFT.tickets+'</b> vé gacha',furnTag(GIFT.item,'',40,28)+' <b>'+FURN[GIFT.item].n+'</b> <span class="dim">(+'+FURN[GIFT.item].happy+' vui)</span>'];

  /* ---------- tạo mèo khởi đầu ---------- */
  function makeStarter(i,name){
    const t=st();if(t.got&&t.got.starter&&catBy(t.cat))return catBy(t.cat);
    const o=TX.starters[i],sp=SP[o.sp],c=newCat(sp,2,o.coat);
    c.traits=o.traits.filter(x=>TRAITS[x]);c.name=String(name||o.names[0]).trim().slice(0,16)||o.names[0];
    c.room='living';c.born=now();c.full=45;c.hp=60;c.en=100;
    S.cats.push(c);markSeen(c);t.cat=c.uid;t.got=t.got||{};t.got.starter=1;
    save();syncEnts();render();return c;
  }

  /* ---------- dựng lớp phủ ---------- */
  function build(){
    if(E)return;
    const d=document.createElement('div');d.id='tut';
    d.innerHTML='<div class="tut-dim"></div><div class="tut-hole"></div>'+
      '<div class="tut-blk" data-b="t"></div><div class="tut-blk" data-b="b"></div><div class="tut-blk" data-b="l"></div><div class="tut-blk" data-b="r"></div>'+
      '<div class="tut-paw" aria-hidden="true"></div><div class="tut-card"></div>'+
      '<div class="tut-say" role="dialog" aria-live="polite"><div class="tut-face"></div><div class="tut-body"><div class="tut-who"></div><div class="tut-txt"></div><div class="tut-more"></div></div></div>'+
      '<button class="tut-skip sm"></button>'+
      '<div class="tut-tip" role="status"></div>';
    document.body.appendChild(d);
    E={root:d,dim:d.querySelector('.tut-dim'),hole:d.querySelector('.tut-hole'),blk:[...d.querySelectorAll('.tut-blk')],paw:d.querySelector('.tut-paw'),
      card:d.querySelector('.tut-card'),say:d.querySelector('.tut-say'),face:d.querySelector('.tut-face'),who:d.querySelector('.tut-who'),
      txt:d.querySelector('.tut-txt'),more:d.querySelector('.tut-more'),skip:d.querySelector('.tut-skip'),tip:d.querySelector('.tut-tip')};
    E.paw.innerHTML='<img class="px" alt="" src="'+bufCanvas(Art.icon('paw'),3).toDataURL()+'">';
    E.who.textContent=TX.guide.name;
    E.skip.textContent=TX.ui.skip;E.skip.onclick=askSkip;
    E.say.addEventListener('click',tapNext);
    E.blk.forEach(b=>b.addEventListener('click',tapBlock));
    E.dim.addEventListener('click',tapBlock);
    E.card.addEventListener('click',ev=>{if(cs&&cs.card&&!skipAsk&&!isAct()&&!ev.target.closest('button,input,select,a'))tapNext(ev)});
  }
  const vw=()=>document.documentElement.clientWidth,vh=()=>window.innerHeight;

  /* ---------- chạy một bước ---------- */
  function go(id){
    if(id==null){finish();return}
    let i=SI[id];
    while(i<STEPS.length){const s=STEPS[i];
      if(rp&&s.replayOff){i++;continue}
      if(s.skip&&s.skip()){if(s.leave)s.leave();i++;continue}
      break}
    if(i>=STEPS.length){finish();return}
    cs=STEPS[i];line=0;scrolled=false;skipAsk=false;waiting=!!(cs.wait&&!rp);
    if(!rp){st().step=cs.id;save()}
    if(cs.tab)ensureTab(cs.tab);
    if(cs.enter)cs.enter();
    E.root.classList.add('on');E.root.classList.toggle('replay',rp);
    E.skip.style.display=cs.noSkip?'none':'';E.skip.textContent=rp?'✕ '+TX.ui.skip:TX.ui.skip;
    E.card.innerHTML='';E.card.className='tut-card';E.card.style.cssText='';
    if(cs.pick)return showPick();
    if(cs.card)showCard(cs.card);
    E.face.innerHTML=pose(TX.guide.key,cs.guide?'tail':'sit',cs.guide?2.5:1.5);
    E.root.classList.toggle('big',!!cs.guide);
    say();
    if(!raf)raf=requestAnimationFrame(frame);
  }
  function next(){
    const s=cs;if(!s)return;if(s.leave)s.leave();
    const i=SI[s.id]+1;go(i<STEPS.length?STEPS[i].id:null);
  }
  const isAct=()=>!!(cs&&cs.act&&!rp);
  const lines=()=>{const L=(TX.steps[cs.say]||['']).map(x=>fill(x));return rp&&cs.id==='hi'?L.slice(0,2):L};
  function say(){
    const L=lines(),txt=L[Math.min(line,L.length-1)],tk=toks(txt);let n=0;
    clearInterval(typ);E.say.style.display='';
    const last=line>=L.length-1;
    E.more.textContent=last&&isAct()?'':(last&&cs.card==='gift'&&!rp?'':TX.ui.tap+' ▸');
    const draw=()=>{E.txt.innerHTML=tk.slice(0,n).join('')+'<span class="tut-ghost">'+tk.slice(n).join('')+'</span>'};
    draw();typ=setInterval(()=>{n=Math.min(tk.length,n+2);draw();if(n>=tk.length){clearInterval(typ);typ=null}},28);
    E.txt.dataset.full=tk.join('');
  }
  function tapNext(ev){
    if(ev)ev.stopPropagation();if(!cs||cs.pick||skipAsk)return;
    if(typ){clearInterval(typ);typ=null;E.txt.innerHTML=E.txt.dataset.full;return}
    const L=lines();
    if(line<L.length-1){line++;say();return}
    if(isAct()){nudge();return}
    if(cs.card==='gift'&&!rp)return nudge();
    next();
  }
  function tapBlock(ev){ev.stopPropagation();ev.preventDefault();tapNext()}
  function nudge(){E.hole.classList.remove('nudge');void E.hole.offsetWidth;E.hole.classList.add('nudge');E.paw.classList.remove('nudge');void E.paw.offsetWidth;E.paw.classList.add('nudge')}

  /* ---------- thẻ giữa màn: màu sao, các dáng, quà, việc nên làm ---------- */
  function showCard(k){
    const c=E.card;c.className='tut-card on k-'+k;let h='';
    if(k==='stars'){
      const S_=TX.stars;
      h='<h3>'+S_.title+'</h3><div class="tut-stars">'+[1,2,3,4,5].map(n=>'<div class="r"><span class="s">'+starsOf(n)+'</span><b style="color:'+scol(n)+'">'+STAR[n].n+'</b><span class="dim">'+S_.colors[n-1]+'</span><span class="p">'+String(STAR[n].p).replace('.',',')+'%</span></div>').join('')+
        '<div class="r rb"><span class="s">'+starsOf(4,1)+'</span><b>'+S_.rainbowP+'</b><span class="dim">'+S_.rainbow+'</span><span class="p"></span></div></div>'+
        '<div class="tut-pity">🛡 '+S_.pity+': '+Math.min(S.pity,PITY)+'/'+PITY+'</div>';
    }else if(k==='poses'){
      const a=starter();
      if(typeof tutPosesUI==='function'){c.innerHTML='';tutPosesUI(c,a);emoEl(c);return}
      h='<h3>'+esc(fill(TX.poses.title))+'</h3><div class="tut-poses">'+TX.poses.list.map(p=>'<div class="pz">'+pose(lk(a),p[0],1.5)+'<span>'+p[1]+'</span></div>').join('')+'</div>';
    }else if(k==='gift'){
      const got=st().got&&st().got.gift;
      h='<h3>'+TX.gift.title+'</h3><div class="tut-gift">'+giftRows().map(r=>'<div>'+r+'</div>').join('')+'</div>'+
        (rp||got?'<div class="dim">'+TX.gift.got+'</div>':'<button class="go tut-giftbtn" onclick="TUT._gift()">🎁 '+TX.gift.btn+'</button>');
    }else if(k==='next'){
      h='<h3>'+TX.nextTitle+'</h3><ul class="tut-next">'+TX.nextList.map(x=>'<li>'+esc(x)+'</li>').join('')+'</ul>';
    }
    c.innerHTML=emo(h);
  }
  function giftTap(){if(!cs||cs.id!=='gift')return;grant('gift');showCard('gift');next()}

  /* ---------- chọn mèo khởi đầu ---------- */
  function showPick(){
    E.say.style.display='none';E.root.classList.remove('big');
    const c=E.card;c.className='tut-card on k-pick';c.innerHTML='';
    const done=o=>{const cat=makeStarter(o.i,o.name);if(cat){if(st().skip){finishSkip();return}next()}};
    if(typeof tutPickUI==='function'){tutPickUI(c,done);emoEl(c);}
    else{ // bản dự phòng gọn khi chưa có js/tut-starter.js
      let sel=0;
      c.innerHTML=emo('<h3>'+TX.pick.title+'</h3><div class="dim">'+TX.pick.sub+'</div><div class="tut-pk">'+TX.starters.map((o,i)=>
        '<button class="tut-pkc'+(i?'':' on')+'" data-tut-starter="'+i+'">'+pose(o.sp+'~'+o.coat,'walk',1.5)+'<b>'+o.name+'</b><small>'+o.role+'</small></button>').join('')+'</div>'+
        '<div class="row"><input data-tut-name maxlength="16" placeholder="'+TX.pick.namePh+'" style="flex:1"><button class="go" data-tut-confirm>'+TX.pick.yes+'</button></div>');
      c.querySelectorAll('.tut-pkc').forEach(b=>b.onclick=()=>{sel=+b.dataset.tutStarter;c.querySelectorAll('.tut-pkc').forEach(x=>x.classList.toggle('on',x===b))});
      c.querySelector('[data-tut-confirm]').onclick=()=>{const v=c.querySelector('[data-tut-name]').value.trim()||TX.starters[sel].names[0];done({i:sel,name:v})};
    }
    if(!raf)raf=requestAnimationFrame(frame);
  }

  /* ---------- bỏ qua ---------- */
  function askSkip(ev){
    if(ev)ev.stopPropagation();
    if(rp){endReplay_();return}
    const need=!(st().got&&st().got.starter);
    skipAsk=true;E.card.style.cssText='';E.card.className='tut-card on k-skip';E.say.style.display='none';
    E.card.innerHTML=emo('<h3>'+TX.ui.skipTitle+'</h3><div>'+TX.ui.skipText+(need?'<br><b>'+TX.ui.skipNeedPick+'</b>':'')+'</div>'+
      '<div class="row" style="justify-content:center;margin-top:10px"><button class="bad" onclick="TUT._skipYes()">'+TX.ui.skipYes+'</button><button class="go" onclick="TUT._skipNo()">'+TX.ui.skipNo+'</button></div>');
    waiting=false;
  }
  function skipYes(){
    const t=st();t.skip=1;save();
    if(!(t.got&&t.got.starter)){go('pick');return}
    finishSkip();
  }
  function finishSkip(){grant('ticket');grant('gift');finish()}
  function skipNo(){go(cs.id)}

  /* ---------- kết thúc ---------- */
  function finish(){
    clearInterval(typ);typ=null;cs=null;waiting=false;
    if(rp){rp=false;rpCat=null;hide();toast(TX.ui.replayEnd,{icon:'📖',title:TX.guide.name,ms:4200});return}
    const t=st();t.done=1;t.step=null;delete t.skip;save();hide();render();
  }
  function hide(){if(E){E.root.classList.remove('on','big','replay');E.card.innerHTML='';E.card.className='tut-card'}cancelAnimationFrame(raf);raf=0;if(tipOn)raf=requestAnimationFrame(frame)}
  function endReplay_(){if(modalOn()&&cs&&(cs.close||/^d/.test(cs.id)))closeModal();finish()}

  /* ---------- vị trí: khoanh sáng, chặn bấm, bàn chân, khung thoại ---------- */
  function rectOf(t){
    if(!t)return null;
    if(typeof t==='function'){const r=t();return r&&r.nodeType?rectOf(r):r}
    if(Array.isArray(t)){let u=null;t.forEach(x=>{const r=rectOf(x);if(!r)return;u=u?{left:Math.min(u.left,r.left),top:Math.min(u.top,r.top),right:Math.max(u.right,r.left+r.width),bottom:Math.max(u.bottom,r.top+r.height)}:{left:r.left,top:r.top,right:r.left+r.width,bottom:r.top+r.height}});
      return u&&{left:u.left,top:u.top,width:u.right-u.left,height:u.bottom-u.top}}
    const els=typeof t==='string'?QA(t):[t];
    const vis=els.filter(e=>e.offsetParent!==null||getComputedStyle(e).position==='fixed');
    if(!vis.length)return null;
    if(vis.length>1)return rectOf(vis);
    const r=vis[0].getBoundingClientRect();if(!r.width&&!r.height)return null;
    // lần đầu thấy đích: cuộn cho lộ hẳn ra (cả trong khung cuộn của hộp thoại, không chỉ cửa sổ)
    if(!scrolled){scrolled=true;const vis0=r.top<0||r.bottom>vh()||r.left<0||r.right>vw();vis[0].scrollIntoView({block:vis0?'center':'nearest',inline:'nearest'});return null}
    return {left:r.left,top:r.top,width:r.width,height:r.height};
  }
  function place(el,r){el.style.left=r.left+'px';el.style.top=r.top+'px';el.style.width=Math.max(0,r.width)+'px';el.style.height=Math.max(0,r.height)+'px'}
  function frame(){
    raf=requestAnimationFrame(frame);
    if(tipOn)tipFrame();
    if(!cs||!E.root.classList.contains('on'))return;
    const W=vw(),H=vh(),pk=cs.pick||skipAsk;
    // đang chờ (vd hoạt ảnh mở hộp): ẩn hết lớp phủ
    E.root.classList.toggle('wait',waiting);if(waiting)return;
    let r=pk||cs.card?null:rectOf(cs.target);
    if(r){const p=6;r={left:Math.max(2,r.left-p),top:Math.max(2,r.top-p),width:Math.min(W-4,r.width+2*p),height:Math.min(H-4,r.height+2*p)};
      if(r.left+r.width>W-2)r.width=W-2-r.left;if(r.top+r.height>H-2)r.height=H-2-r.top}
    E.root.classList.toggle('has',!!r);
    const thru=r&&(isAct()||cs.pass);   // chỗ khoanh sáng có cho bấm xuyên xuống không
    if(r){place(E.hole,r);
      const b=E.blk,R=r.left+r.width,B=r.top+r.height;
      if(thru){place(b[0],{left:0,top:0,width:W,height:r.top});place(b[1],{left:0,top:B,width:W,height:H-B});place(b[2],{left:0,top:r.top,width:r.left,height:r.height});place(b[3],{left:R,top:r.top,width:W-R,height:r.height})}
      else{place(b[0],{left:0,top:0,width:W,height:H});[1,2,3].forEach(i=>place(b[i],{left:0,top:0,width:0,height:0}))}
      // bàn chân chỉ: dưới chỗ khoanh nếu còn chỗ, không thì phía trên
      const below=B+52<H,pw=E.paw;pw.classList.toggle('up',below);pw.style.display=isAct()?'':'none';
      pw.style.left=clamp(r.left+r.width/2-20,4,W-44)+'px';pw.style.top=(below?B+2:r.top-44)+'px';
    }else{place(E.blk[0],{left:0,top:0,width:W,height:H});[1,2,3].forEach(i=>place(E.blk[i],{left:0,top:0,width:0,height:0}));E.paw.style.display='none'}
    // khung thoại: nằm phía còn nhiều chỗ hơn, không đè lên chỗ khoanh nếu tránh được
    const sy=E.say;if(sy.style.display==='none')return;
    const h=sy.offsetHeight,m=8,sk=E.skip.offsetParent?E.skip.getBoundingClientRect().bottom+6:m;let top;  // sk: không đè lên nút Bỏ qua
    if(cs.card){const ch=E.card.offsetHeight;top=H-h-m;E.card.style.maxHeight=Math.max(120,H-h-3*m)+'px';E.card.style.top=Math.max(m,(H-h-m-ch)/2)+'px'}
    else if(r&&cs.sayTop)top=sk;
    else if(r){const up=r.top,down=H-(r.top+r.height);top=down>=h+2*m+(isAct()?44:0)?r.top+r.height+m+(isAct()&&E.paw.classList.contains('up')?44:0):up>=h+2*m?r.top-h-m:(down>up?H-h-m:m);
      top=clamp(top,m,H-h-m)}
    else top=cs.guide?Math.max(m,H/2-h/2+40):H-h-m;
    sy.style.top=Math.max(top,Math.min(sk,H-h-m))+'px';
  }

  /* ---------- mẹo theo ngữ cảnh: bong bóng nhỏ, không chặn bấm ---------- */
  let tipOn=null;const tipQ=[];
  const seen=id=>{const h=st().hints||{};return !!(h[id]||h.all)};
  const busy=()=>!!cs||!!$('gz').className||modalOn();
  // hint(id, {target, lines, modal}) : hiện mẹo id một lần. target: selector, mảng selector, hàm, hoặc bỏ trống (giữa màn).
  // modal:1 cho phép hiện khi đang mở hộp thoại (mẹo gắn với chính hộp thoại đó). Đang bận thì xếp hàng, thử lại mỗi giây.
  function hint(id,o){
    o=o||{};if(seen(id)&&!o.force)return false;if(tipOn&&tipOn.id===id)return false;
    if(tipQ.some(x=>x.id===id))return false;
    tipQ.push({id,o,t:Date.now()});pump();return true;
  }
  function pump(){
    if(tipOn||!tipQ.length)return;build();
    const i=tipQ.findIndex(x=>!cs&&!$('gz').className&&(x.o.modal||!modalOn()));if(i<0)return;
    const x=tipQ.splice(i,1)[0];if(seen(x.id)&&!x.o.force)return pump();
    tipOn=x;const L=(x.o.lines||TX.hints[x.id]||[]).map(s=>fill(s));
    E.tip.innerHTML=emo('<div class="tut-tface">'+pose(TX.guide.key,'sit',1)+'</div><div class="tut-tbody">'+L.map(s=>'<p>'+esc(s)+'</p>').join('')+'<button class="sm go">'+TX.ui.ok+'</button></div>');
    E.tip.querySelector('button').onclick=closeTip;
    E.tip.classList.add('on');E.root.classList.add('tipon');
    if(!raf)raf=requestAnimationFrame(frame);
  }
  function closeTip(){
    if(!tipOn)return;const t=st();t.hints=t.hints||{};t.hints[tipOn.id]=1;save();
    tipOn=null;E.tip.classList.remove('on');E.root.classList.remove('tipon');E.hole.classList.remove('soft');setTimeout(pump,400);
  }
  function tipFrame(){
    const W=vw(),H=vh(),m=8,el=E.tip;
    if(tipOn.o.modal?false:modalOn()){/* hộp thoại khác vừa mở đè lên: tạm cất mẹo */tipQ.unshift(tipOn);tipOn=null;el.classList.remove('on');E.root.classList.remove('tipon');return}
    let r=null;const t=tipOn.o.target;
    if(t){const s=scrolled;scrolled=true;r=rectOf(t);scrolled=s}
    E.root.classList.toggle('tiphole',!!r&&!cs);
    if(r&&!cs){E.hole.classList.add('soft');place(E.hole,{left:r.left-4,top:r.top-4,width:r.width+8,height:r.height+8})}
    const w=Math.min(340,W-2*m);el.style.width=w+'px';const h=el.offsetHeight;
    let left,top;
    if(r){left=clamp(r.left+r.width/2-w/2,m,W-w-m);top=r.top+r.height+10+h<=H-m?r.top+r.height+10:r.top-h-10>=m?r.top-h-10:H-h-m}
    else{left=(W-w)/2;top=H-h-m-(document.querySelector('.tabs')&&getComputedStyle(document.querySelector('.tabs')).position==='fixed'&&W<1024?70:0)}
    el.style.left=left+'px';el.style.top=clamp(top,m,H-h-m)+'px';
  }
  setInterval(()=>{if(!tipOn&&tipQ.length)pump()},1000);
  // ván mới giữa chừng (Chơi lại từ đầu, quản trị viên đặt lại): S.tut mới chưa xong thì chạy lại hướng dẫn
  setInterval(()=>{if(!cs&&!rp&&S.tut&&!S.tut.done)start()},1000);
  function resetHints(){const t=st();t.hints={};save()}

  /* ---------- phím: chặn Esc, Tab, Enter ra ngoài ở bước bắt buộc ---------- */
  addEventListener('keydown',ev=>{
    if(!cs||!E||!E.root.classList.contains('on')||waiting)return;
    const inTut=E.root.contains(ev.target);
    if(ev.key==='Escape'){ev.stopImmediatePropagation();ev.preventDefault();return}
    if(inTut)return;
    const tgt=typeof cs.target==='string'?QA(cs.target):[];
    const ok=isAct()&&tgt.some(e=>e.contains(ev.target));
    if(!ok&&(ev.key==='Enter'||ev.key===' '||ev.key==='Tab')){ev.preventDefault();ev.stopImmediatePropagation();if(ev.key!=='Tab')tapNext()}
  },true);
  addEventListener('resize',()=>{scrolled=false});

  /* ---------- sự kiện của game ---------- */
  function act(name,args,ret){
    if(!cs||rp||!isAct())return;
    if(cs.act!==name)return;
    if(cs.done&&!cs.done())return;
    next();
  }
  ['petCat','openFeed','doFeed','setTab','openPicker','doTrip','gachaDone'].forEach(n=>on(n,(a,r)=>act(n,a,r)));
  on('gReveal',()=>{if(cs&&cs.wait==='gReveal'&&waiting){waiting=false;line=0;say()}});
  // lượt gacha đầu tiên: dùng vé, chắc chắn từ 3★ trở lên
  hook('doGacha');
  {const g=window.doGacha;window.doGacha=function(t){
    if(cs&&cs.id==='pull'&&!rp){const r=gachaRoll(true,{min:3});if(r.err){toast(r.err,{type:'warn'});return}
      st().gcat=r.cat.uid;save();render();playGacha(r.cat);go('reveal');return}
    if(cs&&!rp&&isAct())return; // đang ở bước bắt buộc khác thì không cho quay
    return g.apply(this,arguments)}}

  /* ---------- khởi động ---------- */
  function start(){
    build();const t=st();
    if(t.done&&S.cats.length)return;
    if(!t.step)t.step='hi';
    if(!S.cats.length){t.done=0;if(SI[t.step]==null||SI[t.step]>SI.pick)t.step='pick'} // bản lưu chưa có mèo: quay lại bước chọn mèo
    go(t.step);
  }
  function startReplay(){
    build();if(cs)return;
    if(modalOn())closeModal();
    rp=true;rpCat=S.cats.slice().sort((a,b)=>b.star-a.star)[0]||null;
    go('hi');
  }
  return {start,startReplay,on,hook,fire,hint,seen,resetHints,anim,pose,fill,grant,
    active:()=>!!cs&&!rp,replaying:()=>rp,busy,step:()=>cs&&cs.id,
    _gift:giftTap,_skipYes:skipYes,_skipNo:skipNo};
})();

// chạy sau khi mọi script (kể cả js/tut-starter.js, js/tut-hints.js) đã nạp
if(document.readyState==='loading')addEventListener('DOMContentLoaded',()=>TUT.start());else setTimeout(()=>TUT.start());
