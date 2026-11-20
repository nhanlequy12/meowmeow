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
   Ký hiệu nốt: "C5" (đô quãng 5), "F#4", "Bb2"; "." là nghỉ; "-" là ngân thêm một nhịp con; "A3+C4+E4" là hợp âm.
   CẬP NHẬT 2026-11-19: nhạc nền có ba nguồn (S.set.bgms): 'nang' bài hát "Nắng trên đệm mèo" (audio/nang-tren-dem-meo.mp3,
   MẶC ĐỊNH), 'auto' sáu bản chiptune ở trên, 'mine' một file nhạc người chơi tự chọn (lưu trong IndexedDB 'meoxu_bgm', chỉ ở máy đó).
   Bài hát phát bằng thẻ <audio> nối vào cùng AudioContext (createMediaElementSource → BGM.out) nên âm lượng, tắt dần, tạm dừng khi
   ẩn trang, mở gacha, điện thoại dọc dùng chung một đường. File lỗi (máy chủ tĩnh thiếu audio/, mất mạng) thì tự quay về chiptune.
   Nhạc nay BẬT sẵn cho người chơi chưa từng chỉnh (S.set.bgm chưa có); phát từ cú chạm đầu tiên. Nút 🎵 cạnh nút Cài đặt (#bgmq)
   bật tắt nhanh ở mọi tab. Thêm bài: thêm một mục vào BGM_SONGS và một file trong audio/. */
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
const BGM={ac:null,out:null,cur:null,pos:0,t:0,run:0,force:null,off:0,offT:0,el:null,elSrc:null,err:{},mine:null,mineName:''};
const bgmVolOf=()=>{const v=S&&S.set&&S.set.bgmv;return typeof v==='number'?clamp(v,.05,1):.6};
// bài hát (file). Âm lượng thật = S.set.bgmv × BGM_SONGK.
const BGM_SONGS={nang:{n:'Nắng trên đệm mèo',src:'audio/nang-tren-dem-meo.mp3'}};
const BGM_SONGK=.85;
const bgmSrc=()=>{const s=S&&S.set&&S.set.bgms;return s==='auto'||s==='mine'||BGM_SONGS[s]?s:'nang'};
const bgmSongMode=()=>{if(BGM.force)return false;const s=bgmSrc();return s!=='auto'&&!BGM.err[s]&&(s!=='mine'||!!BGM.mine)};
const bgmGain=()=>bgmVolOf()*(bgmSongMode()?BGM_SONGK:BGM_VOLK);
const bgmSrcName=()=>{const s=bgmSrc();return s==='auto'?'Nhạc tự động theo giờ và thời tiết':s==='mine'?(BGM.mineName||'Bài của bạn'):BGM_SONGS[s].n};
if(S&&S.set&&S.set.bgm===undefined)S.set.bgm=true;   // người chơi chưa từng chỉnh: bật sẵn (phát từ cú chạm đầu tiên)
// phát hay dừng thẻ <audio> theo trạng thái chung của nhạc nền
function bgmSongSync(){
  const ac=BGM.ac;if(!ac)return;
  const song=bgmSongMode();
  if(song&&BGM.run&&!BGM.off){
    const s=bgmSrc(),url=s==='mine'?BGM.mine:BGM_SONGS[s].src;
    if(!BGM.el){
      const el=new Audio();el.loop=true;el.preload='auto';
      el.addEventListener('error',()=>{if(!BGM.elSrc)return;BGM.err[bgmSrc()]=1;BGM.elSrc=null;BGM.cur=null;bgmGainNow();bgmQuickDraw()});
      try{ac.createMediaElementSource(el).connect(BGM.out)}catch(e){BGM.err[s]=1;return}
      BGM.el=el;
    }
    if(BGM.elSrc!==url){BGM.elSrc=url;BGM.el.src=url}
    if(BGM.el.paused&&ac.state==='running')BGM.el.play().catch(()=>{});
  }else if(BGM.el&&!BGM.el.paused&&(!song||!BGM.run||(BGM.off&&performance.now()-BGM.offT>600)))BGM.el.pause();
}
// đặt ngay âm lượng đích (đổi nguồn nhạc làm đổi hệ số)
function bgmGainNow(){if(BGM.ac&&BGM.run&&!BGM.off){const g=BGM.out.gain;g.cancelScheduledValues(BGM.ac.currentTime);g.setTargetAtTime(bgmGain(),BGM.ac.currentTime,.05)}}
const bgmGz=()=>{const g=document.getElementById('gz');return !!(g&&g.classList.contains('on'))};
// trang ẩn (thu nhỏ, ẩn vào khay của bản app: lõi báo qua window.__mxHidden) thì tạm dừng; bản app có tùy chọn "vẫn phát khi ẩn" (MXAPP.cfg.bgPlay)
const bgmBgPlay=()=>!!(window.MXAPP&&MXAPP.cfg&&MXAPP.cfg.bgPlay);
const bgmHidden=()=>!!(document.hidden||window.__mxHidden===true);
const bgmWant=()=>!!(S&&S.set&&S.set.bgm)&&!(bgmHidden()&&!bgmBgPlay())&&!bgmGz()&&!(typeof needLandscape==='function'&&needLandscape());
// tạo AudioContext (chỉ gọi trong một cú chạm, bấm phím của người chơi)
function bgmEnsure(){
  if(!BGM.ac){try{BGM.ac=new (window.AudioContext||window.webkitAudioContext)()}catch(e){return false}BGM.out=bgmChain(BGM.ac,BGM.ac.destination,0)}
  if(BGM.ac.state==='suspended'&&bgmWant())BGM.ac.resume().catch(()=>{});
  return true;
}
function bgmTick(){
  const ac=BGM.ac;if(!ac||!BGM.run||ac.state!=='running')return;
  if(bgmSongMode()){bgmSongSync();return}   // đang phát bài hát: không xếp lịch chiptune
  if(!BGM.cur){BGM.cur=bgmPick();BGM.pos=0;BGM.t=ac.currentTime+.1}
  if(BGM.t<ac.currentTime)BGM.t=ac.currentTime+.05;   // vừa chạy tiếp sau khi máy chậm: không dồn nốt
  const ahead=bgmHidden()?1.5:.3;   // trang ẩn (vẫn phát): hẹn giờ có thể bị hãm, xếp lịch xa hơn để không hụt nốt
  while(BGM.t<ac.currentTime+ahead){
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
    if(!BGM.run||BGM.off){BGM.run=1;BGM.off=0;g.cancelScheduledValues(t);g.setTargetAtTime(bgmGain(),t,.25)}
  }else if(BGM.run&&!BGM.off){
    BGM.off=1;BGM.offT=performance.now();g.cancelScheduledValues(t);g.setTargetAtTime(0,t,.12);
  }
  if(BGM.off&&performance.now()-BGM.offT>600&&ac.state==='running'){ac.suspend().catch(()=>{});if(!on){BGM.run=0;BGM.cur=null}}
}
// hai hẹn giờ chỉ chạy khi nhạc đang bật (S.set.bgm) hoặc còn đang tắt dần; tắt hẳn thì dừng, bật lại thì bgmTimers() khởi động lại
const BGM_IV={tk:0,ck:0};
function bgmTimers(){
  const need=!!(S&&S.set&&S.set.bgm)||!!(BGM.run&&BGM.ac&&BGM.ac.state==='running');
  if(need&&!BGM_IV.ck){BGM_IV.tk=setInterval(bgmTick,60);BGM_IV.ck=setInterval(bgmCheck,250)}
  else if(!need&&BGM_IV.ck){clearInterval(BGM_IV.tk);clearInterval(BGM_IV.ck);BGM_IV.tk=BGM_IV.ck=0}
}
{const C0=bgmCheck;bgmCheck=function(){C0();bgmSongSync();bgmTimers()}}
bgmTimers();
document.addEventListener('visibilitychange',bgmCheck);
// cú chạm, bấm phím đầu tiên sau khi nhạc đã bật: mở âm thanh (chính sách tự phát của trình duyệt)
['pointerdown','keydown','touchend'].forEach(n=>addEventListener(n,()=>{if(S&&S.set&&S.set.bgm&&(!BGM.ac||BGM.ac.state!=='running')&&bgmWant()){bgmEnsure();bgmCheck()}},true));

/* ---------- Cài đặt ---------- */
const bgmReSettings=()=>{const mb=$('mbox');if(!mb||!mb.querySelector('.bgm-card'))return;const y=mb.scrollTop;openSettings();$('mbox').scrollTop=y};
function bgmSet(on){
  S.set.bgm=!!on;if(S.set.bgmv==null)S.set.bgmv=.6;save();
  if(on){bgmEnsure();BGM.cur=null;bgmCheck()}else bgmCheck();
  bgmQuickDraw();bgmReSettings();
}
function bgmVol(v){S.set.bgmv=clamp(+v,.05,1);bgmGainNow();const o=$('bgmvn');if(o)o.textContent=Math.round(S.set.bgmv*100)+'%'}
// đổi nguồn nhạc: 'nang' (bài hát), 'auto' (chiptune theo giờ, thời tiết), 'mine' (file của người chơi)
function bgmUse(s){
  S.set.bgms=s;BGM.err[s]=0;BGM.cur=null;if(!S.set.bgm)S.set.bgm=true;save();
  bgmEnsure();bgmCheck();bgmGainNow();bgmQuickDraw();bgmReSettings();
}
// nút 🎵 bật tắt nhanh (cạnh nút Cài đặt, mọi tab)
function bgmQuick(){bgmSet(!(S.set&&S.set.bgm));toast(S.set.bgm?'Đang phát: '+bgmSrcName():'Đã tắt nhạc nền',{icon:S.set.bgm?'🎵':'🔇',title:'Nhạc nền',key:'bgmq',ms:2500})}
function bgmQuickDraw(){
  const h=document.querySelector('.hdr');if(!h)return;let b=$('bgmq');
  if(!b){b=document.createElement('button');b.id='bgmq';b.className='sm bgmq';b.setAttribute('onclick','bgmQuick()');const st=h.querySelector('button');h.insertBefore(b,st||null)}
  const on=!!(S.set&&S.set.bgm);
  b.innerHTML='<span class="bq" aria-hidden="true">'+(on?'🎵':'🔇')+'</span><span class="bt">Nhạc</span>';
  b.classList.toggle('on',on);b.setAttribute('aria-pressed',on?'true':'false');
  b.setAttribute('aria-label',on?'Tắt nhạc nền':'Bật nhạc nền');b.dataset.tip=on?'Nhạc đang bật · bấm để tắt':'Nhạc đang tắt · bấm để bật';
}
// nhạc của người chơi: lưu file trong IndexedDB (chỉ ở máy này), tối đa 30 MB
const BGM_MAXF=30*1024*1024;
function bgmDb(){return new Promise(r=>{try{const q=indexedDB.open('meoxu_bgm',1);q.onupgradeneeded=()=>q.result.createObjectStore('f');q.onsuccess=()=>r(q.result);q.onerror=()=>r(null)}catch(e){r(null)}})}
async function bgmDbGet(){const db=await bgmDb();if(!db)return null;return new Promise(r=>{try{const g=db.transaction('f').objectStore('f').get('mine');g.onsuccess=()=>r(g.result||null);g.onerror=()=>r(null)}catch(e){r(null)}})}
async function bgmDbPut(v){const db=await bgmDb();if(!db)return false;return new Promise(r=>{try{const t=db.transaction('f','readwrite');v?t.objectStore('f').put(v,'mine'):t.objectStore('f').delete('mine');t.oncomplete=()=>r(true);t.onerror=()=>r(false)}catch(e){r(false)}})}
function bgmSetMine(blob,name){if(BGM.mine)URL.revokeObjectURL(BGM.mine);BGM.mine=blob?URL.createObjectURL(blob):null;BGM.mineName=name||'';BGM.err.mine=0;if(bgmSrc()==='mine')BGM.elSrc=null}
bgmDbGet().then(v=>{if(v&&v.blob){bgmSetMine(v.blob,v.name);if(bgmSrc()==='mine'){BGM.elSrc=null;bgmCheck()}}});
async function bgmPickFile(inp){
  const f=inp.files&&inp.files[0];inp.value='';if(!f)return;
  if(!/^audio\//.test(f.type)&&!/\.(mp3|m4a|aac|ogg|oga|opus|wav|flac|webm)$/i.test(f.name)){toast('File này không phải nhạc',{type:'bad',icon:'⚠️'});return}
  if(f.size>BGM_MAXF){toast('File quá lớn (tối đa 30 MB)',{type:'bad',icon:'⚠️'});return}
  bgmSetMine(f,f.name.replace(/\.[^.]+$/,''));
  const ok=await bgmDbPut({blob:f,name:BGM.mineName});
  if(!ok)toast('Trình duyệt không cho lưu: bài này chỉ phát tới khi tải lại trang',{icon:'⚠️'});
  bgmUse('mine');
}
async function bgmDelMine(){await bgmDbPut(null);bgmSetMine(null,'');if(bgmSrc()==='mine')bgmUse('nang');else bgmReSettings()}
function bgmCard(){
  const on=!!(S.set&&S.set.bgm),v=Math.round(bgmVolOf()*100),s=bgmSrc(),E=x=>String(x).replace(/[&<>"']/g,c=>'&#'+c.charCodeAt(0)+';');
  const opt=(id,ic,n,sub)=>'<button class="bgm-o'+(s===id?' on':'')+'" onclick="bgmUse(\''+id+'\')" aria-pressed="'+(s===id)+'"><span class="bgm-oi">'+ic+'</span><span class="bgm-on">'+n+(sub?'<small>'+sub+'</small>':'')+'</span></button>';
  const auto=BGM_T[(on&&s==='auto'&&BGM.cur)||bgmPick()];
  return '<div class="card bgm-card" style="flex-direction:column;align-items:stretch"><b>🎵 Nhạc nền</b>'+
    '<div class="row"><button style="flex:1" class="'+(on?'on':'')+'" onclick="bgmSet(1)">🎵 Bật</button><button style="flex:1" class="'+(on?'':'on')+'" onclick="bgmSet(0)">🔇 Tắt</button></div>'+
    '<label class="row" style="align-items:center;gap:8px"><span style="flex:none">Âm lượng</span><input type="range" min="5" max="100" value="'+v+'" oninput="bgmVol(this.value/100)" onchange="save()" style="flex:1;min-width:0" aria-label="Âm lượng nhạc nền"><b id="bgmvn" style="flex:none;min-width:3.2em;text-align:right">'+v+'%</b></label>'+
    '<div class="bgm-ol">'+
      Object.keys(BGM_SONGS).map(id=>opt(id,'🎶',BGM_SONGS[id].n,BGM.err[id]?'không tải được file, đang phát nhạc tự động':'bài hát của Mèo Xu')).join('')+
      opt('auto','🎹','Nhạc tự động','đổi theo giờ'+(typeof wxOpen==='function'&&wxOpen()?' và thời tiết':'')+' · bây giờ: '+auto.n)+
      (BGM.mine?opt('mine','🎧',E(BGM.mineName||'Bài của bạn'),'bài bạn tự chọn, chỉ lưu ở máy này'):'')+
    '</div>'+
    '<div class="row wrap" style="gap:6px"><button class="sm" onclick="$(\'bgmf\').click()">📁 '+(BGM.mine?'Đổi bài của bạn':'Chọn bài của bạn')+'</button><input type="file" id="bgmf" accept="audio/*" onchange="bgmPickFile(this)" hidden>'+
      (BGM.mine?'<button class="sm" onclick="bgmDelMine()">🗑 Bỏ bài của bạn</button>':'')+'</div>'+
    '<small>'+(on?'Đang phát':'Bật lên sẽ phát')+': <b>'+E(bgmSrcName())+'</b>. Nút 🎵 cạnh Cài đặt bật tắt nhạc nhanh. Nhạc tự tạm dừng khi bạn ẩn trang và khi mở hộp gacha.</small></div>';
}
// CSS của nút nhanh và bảng chọn nhạc
(()=>{const st=document.createElement('style');st.textContent=
  '.hdr .bgmq{margin-left:auto;min-width:44px;justify-content:center;gap:4px}.hdr .bgmq .bq{font-size:18px;line-height:1}'+
  '.bgm-ol{display:flex;flex-direction:column;gap:6px}.bgm-o{display:flex;align-items:center;gap:10px;text-align:left;justify-content:flex-start;min-height:48px}'+
  '.bgm-oi{font-size:22px;flex:none}.bgm-on{display:flex;flex-direction:column;line-height:1.25}.bgm-on small{font-weight:400;opacity:.85}'+
  '.bgm-up{display:inline-flex;align-items:center;gap:4px;cursor:pointer}'+
  '@media (orientation:landscape) and (max-height:520px){.hdr{gap:6px}#app #top,#app:not([data-tab=home]) #top{margin-right:166px}}'+
  '@media (orientation:landscape) and (max-height:400px) and (max-width:1023px){.hdr .bgmq .bt{display:none}#app #top,#app:not([data-tab=home]) #top{margin-right:104px}}';
  document.head.appendChild(st)})();
bgmQuickDraw();
// lúc hướng dẫn tân thủ phủ lớp chặn (#tut .tut-blk/.tut-dim), cú bấm rơi đúng nút 🎵 vẫn bật tắt được nhạc
addEventListener('click',ev=>{
  const t=ev.target;if(!t||!t.classList||!(t.classList.contains('tut-blk')||t.classList.contains('tut-dim')))return;
  const b=$('bgmq');if(!b)return;const r=b.getBoundingClientRect();
  if(r.width&&ev.clientX>=r.left&&ev.clientX<=r.right&&ev.clientY>=r.top&&ev.clientY<=r.bottom){ev.stopImmediatePropagation();ev.preventDefault();bgmQuick()}
},true);
if(typeof pwaCard==='function'){const P0=pwaCard;pwaCard=function(){return bgmCard()+P0.apply(this,arguments)}}else window.pwaCard=bgmCard;

/* ---------- Sổ tay: một dòng trong chương Cài đặt ---------- */
(()=>{if(typeof TUT_TEXT==='undefined'||!TUT_TEXT.book)return;const pg=TUT_TEXT.book.pages.find(p=>p.id==='settings');
  if(pg&&!pg.p.some(s=>/Nhạc nền/.test(s)))pg.p.splice(1,0,'Nhạc nền 🎵 (bật sẵn, phát từ lần chạm đầu): nút 🎵 cạnh Cài đặt bật tắt nhanh. Trong Cài đặt chỉnh âm lượng và chọn nhạc: bài hát "Nắng trên đệm mèo", nhạc tự động đổi theo giờ và thời tiết, hoặc một file nhạc của bạn (chỉ lưu ở máy này). Nhạc tự động có sáu bản nhạc ngắn đổi theo giờ (ngày, chiều tà, đêm) và theo thời tiết (mưa, tuyết, ngày đẹp trời). Nhạc tạm dừng khi bạn ẩn trang hoặc mở hộp gacha.')})();

/* ---------- Admin: nghe thử từng bản ---------- */
{const A0=openAdmin;openAdmin=function(){A0.apply(this,arguments);const mb=$('mbox');if(!mb||!$('axu'))return;const rb=mb.querySelector('button.bad'),row=rb&&rb.parentElement;
  const B=(f,n,on)=>'<button class="sm'+(on?' on':'')+'" onclick="'+f+'">'+n+'</button>',d=document.createElement('div');
  d.innerHTML='<div class="card" style="flex-direction:column;align-items:stretch;gap:6px"><b>🎵 Nhạc nền</b><div class="dim">'+(S.set.bgm?'Đang bật':'Đang tắt')+' · theo giờ, thời tiết: '+BGM_T[bgmPick()].n+(BGM.force?' · đang ép: '+BGM_T[BGM.force].n:'')+'</div>'+
    '<div class="row wrap">'+Object.values(BGM_T).map(T=>B('admBgm(\''+T.id+'\')',T.n,BGM.force===T.id)).join('')+B('admBgm(null)','Theo giờ và thời tiết',!BGM.force)+'</div></div>';
  const el=d.firstElementChild;if(row&&row.parentElement)row.parentElement.insertBefore(el,row);else mb.appendChild(el)}}
function admBgm(id){BGM.force=id;if(!S.set.bgm){S.set.bgm=true;if(S.set.bgmv==null)S.set.bgmv=.6}bgmEnsure();if(BGM.ac){BGM.cur=null;bgmCheck();bgmGainNow()}admDone(id?'Nhạc nền: '+BGM_T[id].n:'Nhạc nền chọn theo giờ và thời tiết',1)}

// nối với sự kiện theo mùa (js/event.js): đang có sự kiện thì phát bản lễ hội
if(typeof evList==='function'&&typeof evOpen==='function')bgmHook(()=>{try{return evOpen()&&evList().length?'fest':''}catch(e){return ''}});
