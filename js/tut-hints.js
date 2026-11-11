"use strict";
/* Mẹo theo ngữ cảnh và Sổ tay. Nạp sau tutorial.js; chữ lấy từ TUT_TEXT.
   Chỉ TUT ghi cờ mẹo. Phần này không thay đổi trạng thái hay luật chơi. */
(()=>{
  const q=s=>document.querySelector(s);
  const guided=()=>TUT.active()||TUT.replaying();
  const modalOn=()=>q('#modal').style.display==='flex';
  const waiting=new Map();
  let scheduled=false,xpBefore=null,gacha=null;
  const awayState=S;
  let awayAt=AWAY.n>0?Date.now()+5800:0;

  // Không khoanh phần tử bị ẩn, nằm ngoài màn hình hoặc bị khung cuộn cắt hết.
  function visible(el){
    if(!el||!el.isConnected||!el.getClientRects().length)return null;
    const r=el.getBoundingClientRect();
    let left=Math.max(0,r.left),top=Math.max(0,r.top);
    let right=Math.min(document.documentElement.clientWidth,r.right),bottom=Math.min(innerHeight,r.bottom);
    for(let p=el;p;p=p.parentElement){
      const css=getComputedStyle(p);
      if(css.display==='none'||css.visibility==='hidden'||css.visibility==='collapse'||Number(css.opacity)===0)return null;
      if(p===el)continue;
      const b=p.getBoundingClientRect();
      if(/auto|scroll|hidden|clip/.test(css.overflowX)){left=Math.max(left,b.left);right=Math.min(right,b.right)}
      if(/auto|scroll|hidden|clip/.test(css.overflowY)){top=Math.max(top,b.top);bottom=Math.min(bottom,b.bottom)}
    }
    return right>left&&bottom>top?{left,top,width:right-left,height:bottom-top}:null;
  }
  const target=(selector,when)=>()=>!guided()&&(!when||when())?visible(q(selector)):null;
  const tabTarget=t=>target('#tabs button[onclick="setTab(\''+t+'\')"]');
  const home=()=>tab==='home';
  const normalHome=()=>home()&&!edit;
  const editTarget=()=>home()&&edit?visible(q('#panel button[onclick="toggleEdit()"]')?.closest('.card')):null;
  const repairTarget=()=>home()?visible(q('#panel button[onclick^="doRepair("]')?.closest('.card')):null;
  const bowlTarget=target('#panel > .feedbar > .fdinfo',normalHome);
  const roomTarget=target('#roomnav',home);

  /* Chờ ở đây cho tới khi đúng ngữ cảnh và đích đang lộ ra, rồi mới giao cho TUT.
     Không đẩy mẹo của một hộp thoại vào hàng đợi chung khi hộp đó đã đóng.
     Mỗi lần chỉ giao một mẹo để mẹo sau còn được kiểm tra lại ngữ cảnh. */
  function request(id,resolve,when,modal){
    if(guided()||TUT.seen(id))return;
    waiting.set(id,{resolve,when,modal:!!modal,state:S});
    if(!scheduled){scheduled=true;setTimeout(()=>{scheduled=false;flush()},0)}
  }
  function flush(){
    if(guided()){waiting.clear();return}
    for(const [id,o] of waiting){
      if(o.state!==S||TUT.seen(id)||(o.when&&!o.when())){waiting.delete(id);continue}
      if(q('#gz').className||(!o.modal&&TUT.busy())||q('.tut-tip.on'))continue;
      if(o.resolve&&!o.resolve())continue;
      if(TUT.hint(id,{target:o.resolve,modal:o.modal?1:0}))waiting.delete(id);
      break;
    }
  }
  // Giữ căn cước hộp thoại, vì modal:1 của lõi cho phép mọi hộp thoại.
  function dialogHint(id,selector,resolve){
    if(guided()||!modalOn()||!q(selector))return;
    const heading=q('#mbox').firstElementChild;
    const same=()=>modalOn()&&q('#mbox').firstElementChild===heading&&!!q(selector);
    request(id,resolve?()=>same()?resolve():null:target('#mbox',same),same,1);
  }

  TUT.on('toggleEdit',()=>{if(home()&&edit)request('edit',editTarget,()=>home()&&edit)});
  TUT.on('setTab',()=>{
    if(tab==='cats')request('cats',target('#panel > .rchips',()=>tab==='cats'),()=>tab==='cats');
    if(tab==='gacha'&&(S.coins>=1000||S.tickets>=10)){
      const same=()=>tab==='gacha'&&(S.coins>=1000||S.tickets>=10);
      request('x10',()=>same()?visible(q('#panel button[onclick="doGacha10(false)"]')?.parentElement):null,same);
    }
  });
  TUT.on('askRelease',()=>dialogHint('release','#mbox button[onclick="doRelease()"], #mbox button[onclick="askRelease(relQ,2)"]'));
  TUT.on('openFeed',()=>{
    if(FOODS.filter(f=>!locked(f)).length>=3)dialogHint('food','#mbox button[onclick^="doFeed("]');
  });
  TUT.on('openSettings',()=>dialogHint('settings','#mbox .tut-book',target('#mbox .tut-book',modalOn)));
  TUT.on('drawPicker',()=>dialogHint('tags','#mbox button[onclick*="drawPicker()"]',target('#mbox > .row.wrap + .dim',modalOn)));
  TUT.on('nextPop',()=>{
    if(!popOn||!q('#pop button[onclick="closePop()"]'))return;
    const heading=q('#pop').firstElementChild;
    const same=()=>popOn&&q('#pop').firstElementChild===heading;
    request('popup',target('#pop.on',same),same);
    // nextPop thêm lớp on sau hai khung hình, nên đợi đủ rồi thử ngay.
    requestAnimationFrame(()=>requestAnimationFrame(flush));
  });

  /* on chạy SAU hàm gốc. Lớp bọc nhỏ chỉ chụp cấp trước addXp, vẫn gọi
     nguyên hàm đã được TUT móc và giữ nguyên this, tham số, kết quả trả về. */
  TUT.on('addXp',()=>{
    if(xpBefore&&xpBefore.state===S&&!xpBefore.guided&&S.level>xpBefore.level){
      request('levelup',tabTarget('shop'));
    }
  });
  const addXpHook=window.addXp;
  window.addXp=function(){
    const previous=xpBefore;
    xpBefore={state:S,level:S.level,guided:guided()};
    try{return addXpHook.apply(this,arguments)}finally{xpBefore=previous}
  };
  // Giữ dấu móc để các lần TUT.on('addXp', ...) sau không bọc/fire hai lần.
  window.addXp.__tut=1;window.addXp.__orig=addXpHook;

  // playGacha còn giữ đủ gz.multi; gachaDone xóa nó trước khi phát sự kiện.
  TUT.on('playGacha',()=>{
    const c=gz.cat;
    gacha=c&&!c.replay?{cat:c,cats:(gz.multi||[c]).slice(),guided:guided()}:null;
  });
  TUT.on('gachaDone',()=>{
    const pull=gacha;gacha=null;
    if(guided()||!pull||pull.guided||pull.cat!==gz.cat)return;
    if(pull.cats.some(c=>c.star===5))request('five');
    if(pull.cats.some(c=>isRb(c)))request('rare');
  });
  TUT.on('toast',args=>{
    const o=args[1];
    if(S===awayState&&AWAY.n>0&&o&&o.title==='Lúc bạn vắng')awayAt=Date.now()+(o.ms||2600)+340;
  });

  function check(){
    if(guided()){waiting.clear();return}
    if(catsIn('wait').length)request('wait',target('#top > .chip:nth-child(3)'),()=>catsIn('wait').length>0);
    if(S.trips.some(p=>p&&now()>=p.end))request('claim',tabTarget('trip'),()=>S.trips.some(p=>p&&now()>=p.end));
    if(home()&&S.items.some(i=>i.room===cur&&i.broken)){
      request('broken',repairTarget,()=>home()&&S.items.some(i=>i.room===cur&&i.broken));
    }
    if(normalHome()&&bowlCap(cur)<homeCats(cur).length){
      request('bowl',bowlTarget,()=>normalHome()&&bowlCap(cur)<homeCats(cur).length);
    }
    if(home()&&ownedRooms().length>=2)request('room2',roomTarget,()=>home()&&ownedRooms().length>=2);
    if(S===awayState&&AWAY.n>0&&awayAt&&Date.now()>=awayAt)request('away');
    flush();
  }
  setInterval(check,1200);
})();

/* Chỉ xuất một đối tượng có tiền tố THB_ và hàm openHandbook cho Cài đặt.
   Nút chương dùng vị trí trong danh sách đã lọc, không nhúng id vào mã onclick. */
const THB_BOOK=(()=>{
  const text=s=>esc(TUT.fill(s));
  const pages=()=>TUT_TEXT.book.pages.filter(p=>!p.net||(typeof NET!=='undefined'&&NET.on));
  const style=document.createElement('style');
  style.id='tut-hints-css';
  style.textContent=`
    .thb-book{text-align:left;font-size:14px;line-height:1.45}
    .thb-book h3{margin:0 30px 6px 0;font-size:18px;line-height:1.3}
    .thb-sub{margin:0 0 10px;color:var(--dim);font-size:13px}
    .thb-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:5px}
    .thb-chapter{display:flex;align-items:center;gap:6px;min-width:0;min-height:44px;padding:5px 7px;text-align:left;font-size:12px;line-height:1.2}
    .thb-icon{display:inline-flex;align-items:center;justify-content:center;flex:0 0 24px;font-size:19px}
    .thb-label{overflow-wrap:anywhere}
    .thb-actions{display:grid;gap:5px;margin-top:10px}
    .thb-actions button,.thb-nav button{min-height:44px;padding:6px 9px;font-size:13px;line-height:1.3}
    .thb-replay{background:var(--pink)}
    .thb-page p,.thb-question{margin:10px 0;overflow-wrap:anywhere}
    .thb-nav{display:flex;gap:6px;margin-top:12px}
    .thb-nav button{flex:1;min-width:0;overflow-wrap:anywhere}
    .thb-book button:focus-visible{outline:3px solid var(--blue);outline-offset:2px}
    @media(max-width:350px){.thb-chapter{font-size:11px;padding:5px}.thb-grid{gap:4px}}
  `;
  if(!document.getElementById(style.id))document.head.appendChild(style);

  function show(html){modal('<div class="thb-book">'+html+'</div>')}
  function chapterButton(p,i){
    return '<button class="thb-chapter" onclick="THB_BOOK.chapter('+i+')"><span class="thb-icon" aria-hidden="true">'+text(p.ic)+
      '</span><span class="thb-label">'+text(p.t)+'</span></button>';
  }
  function open(id){
    const b=TUT_TEXT.book,list=pages(),i=list.findIndex(p=>p.id===id);
    if(i<0){
      show('<h3>'+text(b.title)+'</h3><p class="thb-sub">'+text(b.sub)+'</p><div class="thb-grid">'+list.map(chapterButton).join('')+'</div>'+
        '<div class="thb-actions"><button class="thb-replay" onclick="THB_BOOK.askReplay()">'+text(b.replay)+'</button>'+
        '<button onclick="THB_BOOK.reset()">'+text(b.hintsReset)+'</button></div>');
      return;
    }
    const p=list[i];
    show('<h3>'+text(p.ic)+' '+text(p.t)+'</h3><div class="thb-page">'+p.p.map(s=>'<p>'+text(s)+'</p>').join('')+'</div>'+
      '<div class="thb-actions"><button onclick="openHandbook()">'+text(b.back)+'</button></div><div class="thb-nav">'+
      (i>0?'<button onclick="THB_BOOK.chapter('+(i-1)+')">‹ '+text(list[i-1].t)+'</button>':'')+
      (i+1<list.length?'<button onclick="THB_BOOK.chapter('+(i+1)+')">'+text(list[i+1].t)+' ›</button>':'')+'</div>');
  }
  function chapter(i){const p=pages()[i];open(p&&p.id)}
  function askReplay(){
    const b=TUT_TEXT.book;
    show('<h3>'+text(b.replay)+'</h3><p class="thb-question">'+text(b.replayQ)+'</p><div class="thb-actions">'+
      '<button class="thb-replay" onclick="THB_BOOK.replay()">'+text(b.replay)+'</button><button onclick="openHandbook()">'+text(b.back)+'</button></div>');
  }
  function replay(){closeModal();TUT.startReplay()}
  function reset(){TUT.resetHints();toast(TUT_TEXT.book.hintsDone)}
  return {open,chapter,askReplay,replay,reset};
})();

function openHandbook(id){THB_BOOK.open(id)}
