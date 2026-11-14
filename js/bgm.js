"use strict";
/* ============ NHẠC NỀN (2026-11-14) ============
   Nhạc chiptune tự viết bằng WebAudio, không dùng file. Nạp sau js/pwa.js (bọc pwaCard để thêm thẻ Cài đặt) và sau js/tut-text.js
   (thêm một dòng vào chương Sổ tay "Cài đặt"); thứ tự gợi ý: ngay sau js/play-ui.js.
   - Sáu bản ngắn lặp lại (BGM_T): day (ban ngày), eve (chiều tà 17–21 giờ), night (đêm 21–5 giờ), rain (mưa, giông, sương mù),
     snow (tuyết, trời lạnh, mùa đông), fest (lễ hội: thời tiết lý tưởng, hoặc do tính năng khác chọn qua bgmHook). bgmPick() chọn
     theo giờ máy, và theo thời tiết khi thời tiết đã mở (wxOpen, wxNow), theo thứ tự: Admin ép, bgmHook, tuyết → snow, mưa/giông/sương
     → rain, đêm → night, lý tưởng → fest, lạnh hoặc mùa đông → snow, 17–21 giờ → eve, còn lại day. Đổi bản chỉ ở cuối một vòng lặp.
   - Mặc định TẮT. Cài đặt có thẻ 🎵 Nhạc nền: Bật/Tắt (S.set.bgm) và âm lượng (S.set.bgmv, 0,05–1, mặc định 0,6).
   - Trình duyệt chỉ cho phát âm thanh sau một cú chạm: AudioContext riêng của nhạc nền (không dùng chung AC của intro) chỉ được tạo
     trong lần chạm, bấm phím đầu tiên sau khi nhạc được bật (hoặc ngay lúc bấm nút Bật).
   - Tạm dừng (giảm dần âm lượng rồi suspend) khi: tab ẩn, đang mở lớp gacha #gz (hộp quà và intro có âm thanh riêng), điện thoại
     đang dọc (màn nhắc xoay ngang). Hết lý do thì phát tiếp đúng chỗ cũ.
   - bgmRender(ctx, id, giây, âm lượng): xếp lịch một bản vào một BaseAudioContext bất kỳ, dùng để kiểm thử bằng OfflineAudioContext.
   Ký hiệu nốt: "C5" (đô quãng 5), "F#4", "Bb2"; "." là nghỉ; "-" là ngân thêm một nhịp con; "A3+C4+E4" là hợp âm. */
const BGM_T={
  day:{n:'Nắng trong phòng',bpm:104,sub:2,parts:[
    {w:'triangle',v:.072,r:1.1,notes:'E5 . G5 . C6 - B5 A5  A5 - E5 . C5 . E5 D5  F5 . A5 . C6 - A5 F5  G5 - - . D5 E5 F5 D5'},
    {w:'triangle',v:.1,r:.9,notes:'C3 . . . G3 . . .  A2 . . . E3 . . .  F2 . . . C3 . . .  G2 . . . D3 . B2 .'},
    {w:'square',v:.016,r:.6,notes:'. E4 . G4 . E4 . G4  . C4 . E4 . C4 . E4  . A3 . C4 . A3 . C4  . B3 . D4 . B3 . D4'},
  ],hat:{v:.007,p:'. . x . . . x .'}},
  eve:{n:'Chiều tà lười biếng',bpm:92,sub:2,parts:[
    {w:'square',v:.03,r:1,notes:'B4 . D5 . G5 - . E5  D5 - B4 . G4 . A4 B4  C5 . E5 . G5 . E5 C5  D5 - - . F#5 . A5 .'},
    {w:'triangle',v:.1,r:.8,notes:'G2 . . G2 D3 . . .  E2 . . E2 B2 . . .  C3 . . C3 G2 . . .  D3 . . D3 A2 . F#2 .'},
    {w:'sine',v:.03,a:.08,r:1,notes:'G3+B3+D4 - - - - - - -  E3+G3+B3 - - - - - - -  C4+E4+G4 - - - - - - -  D4+F#4+A4 - - - - - - -'},
  ],hat:{v:.006,p:'. . x . . . x x'}},
  night:{n:'Đêm yên giấc',bpm:72,sub:2,parts:[
    {w:'sine',v:.085,r:.9,bell:1,notes:'A5 . E5 . C6 . B5 .  A5 . . . F5 . G5 .  E5 . G5 . C6 . D6 .  B5 - . . G5 . . .'},
    {w:'sine',v:.1,r:.6,notes:'A2 - - - - - - -  F2 - - - - - - -  C3 - - - - - - -  G2 - - - - - - -'},
    {w:'triangle',v:.02,a:.25,r:1,notes:'A3+C4+E4 - - - - - - -  F3+A3+C4 - - - - - - -  E3+G3+C4 - - - - - - -  D3+G3+B3 - - - - - - -'},
  ]},
  rain:{n:'Mưa rơi bên cửa',bpm:84,sub:2,parts:[
    {w:'triangle',v:.065,r:1,echo:.36,notes:'D5 . F5 . A5 . . G5  F5 . D5 . . . C5 .  D5 . F5 . Bb5 . A5 G5  A5 - - . E5 . . .'},
    {w:'sine',v:.11,r:.8,notes:'D3 . . . A2 . . .  G2 . . . D3 . . .  Bb2 . . . F2 . . .  A2 . . . E2 . C#3 .'},
    {w:'triangle',v:.02,a:.2,r:1,notes:'D4+F4+A4 - - - - - - -  D4+G4+Bb4 - - - - - - -  D4+F4+Bb4 - - - - - - -  C#4+E4+A4 - - - - - - -'},
  ],drop:{v:.012,p:.35}},
  snow:{n:'Tuyết đầu mùa',bpm:76,sub:2,parts:[
    {w:'sine',v:.075,r:1.2,bell:1,notes:'C6 . A5 . F5 . G5 A5  B5 . G5 . D5 . . .  C6 . E6 . A5 . G5 E5  F5 - - . . . . .'},
    {w:'triangle',v:.085,r:.9,notes:'F2 . . . C3 . . .  G2 . . . D3 . . .  A2 . . . E3 . . .  C3 . . . G2 . . .'},
    {w:'sine',v:.018,r:.5,notes:'. F5 . A5 . C6 . A5  . G5 . B5 . D6 . B5  . A5 . C6 . E6 . C6  . C6 . E6 . G6 . E6'},
  ]},
  fest:{n:'Lễ hội nhà mèo',bpm:126,sub:2,parts:[
    {w:'square',v:.032,r:.8,notes:'C5 E5 G5 E5 C6 . G5 .  A5 . F5 . C5 F5 A5 .  B5 . G5 . D5 G5 B5 D6  C6 . . G5 C6 . . .'},
    {w:'triangle',v:.1,r:.6,notes:'C3 . C3 . G2 . G2 .  F2 . F2 . C3 . C3 .  G2 . G2 . D3 . D3 .  C3 . G2 . C3 . . .'},
    {w:'triangle',v:.025,r:.5,notes:'. E4 . E4 . E4 . E4  . F4 . F4 . A4 . A4  . D4 . D4 . G4 . G4  . E4 . G4 . E4 . .'},
  ],hat:{v:.009,p:'x . x x x . x x'}},
};
Object.keys(BGM_T).forEach(k=>BGM_T[k].id=k);
const BGM_VOLK=1.2;   // âm lượng thật = S.set.bgmv × BGM_VOLK × độ to từng nốt: mức mặc định 0,6 cho đỉnh khoảng 0,09–0,14, tối đa (1) khoảng 0,15–0,24
const BGM_HOOKS=[];   // tính năng khác (ví dụ sự kiện) đẩy vào một hàm trả id bản nhạc muốn phát, hoặc rỗng
const bgmHook=f=>{BGM_HOOKS.push(f)};

/* ---------- đọc nốt ---------- */
const BGM_NN={C:0,D:2,E:4,F:5,G:7,A:9,B:11};
function bgmHz(s){const m=/^([A-G])([#b]?)(\d)$/.exec(s);if(!m)throw new Error('nốt lạ '+s);const n=BGM_NN[m[1]]+(m[2]==='#'?1:m[2]==='b'?-1:0)+(+m[3]+1)*12;return 440*Math.pow(2,(n-69)/12)}
function bgmParse(str){
  const tk=str.trim().split(/\s+/),out=[];let last=null;
  tk.forEach((k,i)=>{if(k==='.'){last=null;return}if(k==='-'){if(last)last.len++;return}last={i,fs:k.split('+').map(bgmHz),len:1};out.push(last)});
  return {ev:out,n:tk.length};
}
Object.values(BGM_T).forEach(T=>{let n=0;T.parts.forEach(p=>{const r=bgmParse(p.notes);p.ev=r.ev;n=Math.max(n,r.n)});T.steps=n;T.dt=60/T.bpm/T.sub;
  T.at=Array.from({length:n},()=>[]);T.parts.forEach(p=>p.ev.forEach(e=>T.at[e.i].push([p,e])));
  if(T.hat)T.hat.x=T.hat.p.split(/\s+/);});

/* ---------- nhạc cụ ---------- */
const BGM_NOISE=new WeakMap();
function bgmNoise(ctx){let b=BGM_NOISE.get(ctx);if(!b){b=ctx.createBuffer(1,Math.floor(ctx.sampleRate*.08),ctx.sampleRate);const d=b.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;BGM_NOISE.set(ctx,b)}return b}
// chuỗi ra: âm lượng tổng → lọc trầm cho tiếng mềm → loa
function bgmChain(ctx,dst,vol){const m=ctx.createGain(),lp=ctx.createBiquadFilter();lp.type='lowpass';lp.frequency.value=3400;lp.Q.value=.5;m.gain.value=vol;m.connect(lp);lp.connect(dst);return m}
function bgmTone(ctx,out,f,t,d,w,v,a){
  const o=ctx.createOscillator(),g=ctx.createGain();o.type=w;o.frequency.value=f;
  g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(v,t+a);g.gain.exponentialRampToValueAtTime(.0005,t+a+d);
  o.connect(g);g.connect(out);o.start(t);o.stop(t+a+d+.05);
}
function bgmNote(ctx,out,p,e,t,T){
  const d=Math.max(.12,e.len*T.dt*(p.r||1)),a=p.a||.008,v=p.v/Math.sqrt(e.fs.length);
  e.fs.forEach(f=>{
    bgmTone(ctx,out,f,t,d,p.w,v,a);
    if(p.bell)bgmTone(ctx,out,f*2,t,d*.35,'sine',v*.22,.004);          // tiếng chuông: thêm bồi âm quãng tám, tắt nhanh
    if(p.echo)bgmTone(ctx,out,f,t+T.dt*2,d*.8,p.w,v*p.echo,a);         // tiếng vọng như giọt mưa trên kính
  });
}
function bgmHat(ctx,out,t,v){const s=ctx.createBufferSource(),h=ctx.createBiquadFilter(),g=ctx.createGain();s.buffer=bgmNoise(ctx);h.type='highpass';h.frequency.value=7000;
  g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.0003,t+.045);s.connect(h);h.connect(g);g.connect(out);s.start(t);s.stop(t+.06)}
// một nhịp con của bản T vào chuỗi out lúc t
function bgmStep(ctx,out,T,i,t){
  T.at[i].forEach(([p,e])=>bgmNote(ctx,out,p,e,t,T));
  if(T.hat&&T.hat.x[i%T.hat.x.length]==='x')bgmHat(ctx,out,t,T.hat.v);
  if(T.drop&&Math.random()<T.drop.p)bgmTone(ctx,out,1700+Math.random()*1700,t+Math.random()*T.dt*.5,.07,'sine',T.drop.v,.003);
}
// kiểm thử: xếp lịch bản id trong secs giây vào ctx (OfflineAudioContext), âm lượng như thanh trượt trong Cài đặt
function bgmRender(ctx,id,secs,vol){const T=BGM_T[id],out=bgmChain(ctx,ctx.destination,(vol==null?.6:vol)*BGM_VOLK);let i=0,t=.05;while(t<secs){bgmStep(ctx,out,T,i,t);i=(i+1)%T.steps;t+=T.dt}}

/* ---------- chọn bản theo giờ và thời tiết ---------- */
function bgmPick(){
  if(BGM.force&&BGM_T[BGM.force])return BGM.force;
  for(const f of BGM_HOOKS){try{const id=f();if(id&&BGM_T[id])return id}catch(e){}}
  const h=new Date(now()).getHours(),night=h>=21||h<5;
  let w=null;try{if(typeof wxOpen==='function'&&wxOpen()&&typeof wxNow==='function')w=wxNow()}catch(e){}
  if(w){
    if(['snow','blizzard'].includes(w.type))return 'snow';
    if(['drizzle','storm','fog'].includes(w.type))return 'rain';
  }
  if(night)return 'night';
  if(w&&w.type==='ideal')return 'fest';
  if(w&&(w.type==='cold'||(w.season&&w.season.id==='winter')))return 'snow';
  return h>=17?'eve':'day';
}

/* ---------- phát trực tiếp ---------- */
const BGM={ac:null,out:null,cur:null,pos:0,t:0,run:0,force:null,off:0,offT:0};
const bgmVolOf=()=>{const v=S&&S.set&&S.set.bgmv;return typeof v==='number'?clamp(v,.05,1):.6};
const bgmGz=()=>{const g=document.getElementById('gz');return !!(g&&g.classList.contains('on'))};
const bgmWant=()=>!!(S&&S.set&&S.set.bgm)&&!document.hidden&&!bgmGz()&&!(typeof needLandscape==='function'&&needLandscape());
// tạo AudioContext (chỉ gọi trong một cú chạm, bấm phím của người chơi)
function bgmEnsure(){
  if(!BGM.ac){try{BGM.ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return false}BGM.out=bgmChain(BGM.ac,BGM.ac.destination,0)}
  if(BGM.ac.state==='suspended'&&bgmWant())BGM.ac.resume().catch(()=>{});
  return true;
}
function bgmTick(){
  const ac=BGM.ac;if(!ac||!BGM.run||ac.state!=='running')return;
  if(!BGM.cur){BGM.cur=bgmPick();BGM.pos=0;BGM.t=ac.currentTime+.1}
  if(BGM.t<ac.currentTime)BGM.t=ac.currentTime+.05;   // vừa chạy tiếp sau khi máy chậm: không dồn nốt
  while(BGM.t<ac.currentTime+.3){
    const T=BGM_T[BGM.cur];bgmStep(ac,BGM.out,T,BGM.pos,BGM.t);BGM.t+=T.dt;
    if(++BGM.pos>=T.steps){BGM.pos=0;const n=bgmPick();if(n!==BGM.cur){BGM.cur=n;BGM.t+=T.dt*2}}   // hết một vòng mới đổi bản
  }
}
// mỗi 0,25 giây: phát, tạm dừng hay dừng hẳn theo cài đặt và tình trạng trang
function bgmCheck(){
  const ac=BGM.ac;if(!ac)return;
  const on=!!(S&&S.set&&S.set.bgm),want=bgmWant(),g=BGM.out.gain,t=ac.currentTime;
  if(want){
    if(ac.state==='suspended')ac.resume().catch(()=>{});
    if(!BGM.run||BGM.off){BGM.run=1;BGM.off=0;g.cancelScheduledValues(t);g.setTargetAtTime(bgmVolOf()*BGM_VOLK,t,.25)}
  }else if(BGM.run&&!BGM.off){
    BGM.off=1;BGM.offT=performance.now();g.cancelScheduledValues(t);g.setTargetAtTime(0,t,.12);
  }
  if(BGM.off&&performance.now()-BGM.offT>600&&ac.state==='running'){ac.suspend().catch(()=>{});if(!on){BGM.run=0;BGM.cur=null}}
}
setInterval(bgmTick,60);setInterval(bgmCheck,250);
document.addEventListener('visibilitychange',bgmCheck);
// cú chạm, bấm phím đầu tiên sau khi nhạc đã bật: mở âm thanh (chính sách tự phát của trình duyệt)
['pointerdown','keydown','touchend'].forEach(n=>addEventListener(n,()=>{if(S&&S.set&&S.set.bgm&&(!BGM.ac||BGM.ac.state!=='running')&&bgmWant()){bgmEnsure();bgmCheck()}},true));

/* ---------- Cài đặt ---------- */
function bgmSet(on){
  S.set.bgm=!!on;if(S.set.bgmv==null)S.set.bgmv=.6;save();
  if(on){bgmEnsure();BGM.cur=null;bgmCheck()}else bgmCheck();
  const y=$('mbox').scrollTop;openSettings();$('mbox').scrollTop=y;
}
function bgmVol(v){S.set.bgmv=clamp(+v,.05,1);if(BGM.ac&&BGM.run&&!BGM.off){const g=BGM.out.gain;g.cancelScheduledValues(BGM.ac.currentTime);g.setTargetAtTime(bgmVolOf()*BGM_VOLK,BGM.ac.currentTime,.05)}}
function bgmCard(){
  const on=!!(S.set&&S.set.bgm),v=Math.round(bgmVolOf()*100),cur=BGM_T[(on&&BGM.cur)||bgmPick()];
  return '<div class="card bgm-card" style="flex-direction:column;align-items:stretch"><b>🎵 Nhạc nền</b>'+
    '<div class="row"><button style="flex:1" class="'+(on?'on':'')+'" onclick="bgmSet(1)">🎵 Bật</button><button style="flex:1" class="'+(on?'':'on')+'" onclick="bgmSet(0)">🔇 Tắt</button></div>'+
    '<label class="row" style="align-items:center;gap:8px"><span style="flex:none">Âm lượng</span><input type="range" min="5" max="100" value="'+v+'" oninput="bgmVol(this.value/100)" onchange="save()" style="flex:1;min-width:0" aria-label="Âm lượng nhạc nền"></label>'+
    '<small>Nhạc chiptune nhẹ nhàng, đổi theo giờ trong ngày'+(typeof wxOpen==='function'&&wxOpen()?' và thời tiết':'')+'. '+(on?'Đang phát':'Bật lên sẽ phát')+': <b>'+cur.n+'</b>. Nhạc tự tạm dừng khi bạn ẩn trang và khi mở hộp gacha.</small></div>';
}
if(typeof pwaCard==='function'){const P0=pwaCard;pwaCard=function(){return bgmCard()+P0.apply(this,arguments)}}else window.pwaCard=bgmCard;

/* ---------- Sổ tay: một dòng trong chương Cài đặt ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const pg=TUT_TEXT.book.pages.find(p=>p.id==='settings');
  if(pg&&!pg.p.some(s=>/Nhạc nền/.test(s)))pg.p.splice(1,0,'Nhạc nền 🎵 (mặc định tắt): bật trong Cài đặt, chỉnh âm lượng. Có sáu bản nhạc ngắn đổi theo giờ (ngày, chiều tà, đêm) và theo thời tiết (mưa, tuyết, ngày đẹp trời). Nhạc tạm dừng khi bạn ẩn trang hoặc mở hộp gacha.')})();

/* ---------- Admin: nghe thử từng bản ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n,on)=>'<button class="sm'+(on?' on':'')+'" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🎵 Nhạc nền</b><div class="dim">'+(S.set.bgm?'Đang bật':'Đang tắt')+' · theo giờ, thời tiết: '+BGM_T[bgmPick()].n+(BGM.force?' · đang ép: '+BGM_T[BGM.force].n:'')+'</div>'+
    '<div class="row wrap">'+Object.values(BGM_T).map(T=>B('admBgm(\''+T.id+'\')',T.n,BGM.force===T.id)).join('')+B('admBgm(null)','Theo giờ và thời tiết',!BGM.force)+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admBgm(id){BGM.force=id;if(!S.set.bgm){S.set.bgm=true;if(S.set.bgmv==null)S.set.bgmv=.6}bgmEnsure();if(BGM.ac){BGM.cur=null;bgmCheck()}admDone(id?'Nhạc nền: '+BGM_T[id].n:'Nhạc nền chọn theo giờ và thời tiết',1)}

// nối với sự kiện theo mùa (js/event.js): đang có sự kiện thì phát bản lễ hội
if(typeof evList==='function'&&typeof evOpen==='function')bgmHook(()=>{try{return evOpen()&&evList().length?'fest':''}catch(e){return ''}});
