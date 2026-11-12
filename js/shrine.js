"use strict";
/* ============ PHỤC MA NGỰ TRÙ TỬ: lãnh địa của Mèo Itadori dạng Sukuna ============
   Nạp sau ui.js và pack18.js. Hai phần dùng chung một hình đền (SVG dựng một lần, đưa vào ảnh):
     shrineIntro(T, t0, k, clear)  cảnh trong intro gacha, 5 giai đoạn, dựng trong #gfx (INTRO.v_itadori gọi khi bé mang trang phục Sukuna)
     shrineRoom                    hành động riêng trong phòng (S5.v_itadori.form): vẽ thẳng lên canvas phòng
   Keyframe và lớp CSS (tiền tố sk-) nằm ở css/shrine.css. Chỉ đổi transform, opacity, translate và dùng canvas hạt có sẵn. */
const shrineIntro=(()=>{
const OL='#24120f',BONE='#eadfc4',RED='#8a1020';
const mir=s=>s+'<g transform="translate(200 0) scale(-1 1)">'+s+'</g>';   // vẽ một bên rồi lật sang bên kia (đền đối xứng qua x=100)
// một tầng mái cong: y là mép dưới, wt bề ngang nóc, wb bề ngang mái hiên, h chiều cao; hai đầu hiên vểnh lên và gắn sừng xương
function roof(y,wt,wb,h){
  const L=100-wb/2,R=100+wb/2,l=100-wt/2,r=100+wt/2,ty=y-h,my=y-h*.5;let s='';
  s+='<path d="M'+(L-9)+' '+my+' Q'+(L+4)+' '+(y-1)+' '+(L+24)+' '+y+' L'+(R-24)+' '+y+' Q'+(R-4)+' '+(y-1)+' '+(R+9)+' '+my+' Q'+(r+12)+' '+(y-h*.45)+' '+r+' '+ty+' L'+l+' '+ty+' Q'+(l-12)+' '+(y-h*.45)+' '+(L-9)+' '+my+'Z" fill="#33242e" stroke="'+OL+'" stroke-width="3" stroke-linejoin="round"/>';
  for(let i=-2;i<=2;i++)s+='<path d="M'+(100+i*wt/5)+' '+(ty+4)+' L'+(100+i*wb/5.6)+' '+(y-6)+'" stroke="#4d3a48" stroke-width="2" stroke-linecap="round"/>';
  s+='<path d="M'+(L+5)+' '+(y-7)+' Q'+(L+12)+' '+(y-3.5)+' '+(L+24)+' '+(y-3.5)+' L'+(R-24)+' '+(y-3.5)+' Q'+(R-12)+' '+(y-3.5)+' '+(R-5)+' '+(y-7)+'" fill="none" stroke="'+RED+'" stroke-width="3.5" stroke-linecap="round"/>';
  s+='<rect x="'+(l-4)+'" y="'+(ty-3)+'" width="'+(wt+8)+'" height="6" rx="3" fill="#5a4454" stroke="'+OL+'" stroke-width="2"/>';
  s+=mir('<path d="M'+(L-10)+' '+(my+1)+' q-8 -7 -4 -19 q5 9 13 12z" fill="'+BONE+'" stroke="'+OL+'" stroke-width="2" stroke-linejoin="round"/>');
  return s;
}
// lit=0: ngôi đền (mắt, miệng còn tối); lit=1: chỉ lớp phát sáng (mắt đỏ rực, họng lửa, đèn lồng) để chồng lên khi lãnh địa mở
function svg(lit){
  let s='<svg xmlns="http://www.w3.org/2000/svg" width="400" height="500" viewBox="0 0 200 250">';
  const eyeB='M73 107 L95 115 L93 120 Q82 122 73 115Z',eyeS='M87 63 L97 68 L96 71.5 Q90 72.5 87 67.5Z';
  if(lit){
    s+=mir('<path d="'+eyeB+'" fill="#ff3a50" stroke="#ffb0a0" stroke-width="1.5"/><path d="M80 111 L89 117" stroke="#fff0c0" stroke-width="2.4" stroke-linecap="round"/>');
    s+=mir('<path d="'+eyeS+'" fill="#ff3a50" stroke="#ffb0a0" stroke-width="1"/>');
    s+='<ellipse cx="100" cy="204" rx="19" ry="13" fill="#e0283a" opacity=".85"/><ellipse cx="100" cy="208" rx="11" ry="7" fill="#ff9a6a"/><ellipse cx="100" cy="210" rx="5" ry="3" fill="#fff0c0"/>';
    s+=mir('<circle cx="36" cy="166" r="7" fill="#ff5a4a" opacity=".55"/><rect x="32" y="161" width="8" height="10" rx="3" fill="#ffb060"/>');
    return s+'</svg>';
  }
  // ngà xương lớn hai bên, mọc lên từ đất và cong vào trong
  s+=mir('<path d="M6 250 Q-3 206 22 176 Q13 210 25 250Z" fill="'+BONE+'" stroke="'+OL+'" stroke-width="3" stroke-linejoin="round"/><path d="M25 250 Q21 224 37 206 Q33 228 40 250Z" fill="#d6c8a8" stroke="'+OL+'" stroke-width="2.5" stroke-linejoin="round"/>');
  // bậc thềm ba cấp
  s+='<rect x="34" y="236" width="132" height="14" fill="#4c3742" stroke="'+OL+'" stroke-width="3"/><rect x="42" y="224" width="116" height="12" fill="#57404c" stroke="'+OL+'" stroke-width="3"/><rect x="48" y="213" width="104" height="11" fill="#634a57" stroke="'+OL+'" stroke-width="3"/>';
  // ba tầng thân
  s+='<rect x="50" y="152" width="100" height="62" fill="#3b2630" stroke="'+OL+'" stroke-width="3"/>';
  s+='<rect x="66" y="100" width="68" height="28" fill="#3b2630" stroke="'+OL+'" stroke-width="3"/>';
  s+='<rect x="83" y="54" width="34" height="26" fill="#3b2630" stroke="'+OL+'" stroke-width="3"/>';
  // cột đỏ sẫm và xà ngang
  s+=mir('<rect x="50" y="156" width="10" height="57" fill="#7a1420" stroke="'+OL+'" stroke-width="2.5"/><rect x="52.5" y="160" width="2.5" height="50" fill="#b02434"/><rect x="64" y="160" width="7" height="53" fill="#5e1019" stroke="'+OL+'" stroke-width="2"/>');
  s+='<rect x="46" y="156" width="108" height="8" fill="#541019" stroke="'+OL+'" stroke-width="2.5"/>';
  // miệng quỷ: cửa vòm đen, họng đỏ, nanh trên dưới
  s+='<path d="M74 214 V188 Q74 166 100 166 Q126 166 126 188 V214Z" fill="#0c0003" stroke="'+OL+'" stroke-width="3" stroke-linejoin="round"/>';
  s+='<ellipse cx="100" cy="206" rx="17" ry="10" fill="#5a0a14"/>';
  s+=mir('<path d="M78 187 L86 178 L84 197Z M88 176 L97 170.5 L93 188Z M80 214 L88 214 L84 201Z M93 214 L99 214 L96 206Z" fill="#f1e6c8" stroke="'+OL+'" stroke-width="1.6" stroke-linejoin="round"/>');
  // bốn con mắt (hai lớn ở tầng giữa, hai nhỏ ở tầng trên), lúc chưa mở lãnh địa còn tối
  s+=mir('<path d="'+eyeB+'" fill="#5a0a14" stroke="'+OL+'" stroke-width="2" stroke-linejoin="round"/>');
  s+=mir('<path d="'+eyeS+'" fill="#5a0a14" stroke="'+OL+'" stroke-width="1.5" stroke-linejoin="round"/>');
  s+='<path d="M100 104 L104 112 L100 122 L96 112Z" fill="'+BONE+'" stroke="'+OL+'" stroke-width="1.6"/>';
  // ba tầng mái
  s+=roof(156,84,150,32)+roof(104,42,112,28)+roof(58,14,76,28);
  // đèn lồng treo dưới hiên, đầu lâu dưới chân đền
  s+=mir('<path d="M36 150 V160" stroke="'+OL+'" stroke-width="2"/><rect x="31" y="160" width="10" height="12" rx="3.5" fill="#8a2a1a" stroke="'+OL+'" stroke-width="2"/>');
  s+=mir('<circle cx="42" cy="243" r="6" fill="'+BONE+'" stroke="'+OL+'" stroke-width="2"/><rect x="38.4" y="241.5" width="2.6" height="3" fill="'+OL+'"/><rect x="43" y="241.5" width="2.6" height="3" fill="'+OL+'"/>');
  // nóc: đầu lâu có hai sừng dài
  s+=mir('<path d="M93 20 Q79 16 80 2 Q87 11 97 12Z" fill="'+BONE+'" stroke="'+OL+'" stroke-width="2.2" stroke-linejoin="round"/>');
  s+='<path d="M90 21 Q90 11 100 11 Q110 11 110 21 Q110 27 106 28 L106 32 L94 32 L94 28 Q90 27 90 21Z" fill="'+BONE+'" stroke="'+OL+'" stroke-width="2.2" stroke-linejoin="round"/>';
  s+=mir('<path d="M93.5 19 L98 21 L97 24.5 Q94 24.5 93.5 22Z" fill="#b01828" stroke="'+OL+'" stroke-width="1"/>');
  return s+'</svg>';
}
const url=l=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg(l));
const U0=url(0),U1=url(1),IM0=new Image(),IM1=new Image();IM0.src=U0;IM1.src=U1;   // nạp sẵn: intro dùng thẻ <img>, phòng dùng drawImage
// hai bàn tay kết ấn (chắp lại, ngón đan vào nhau), cổ tay có hai vòng đen của Sukuna
const SEAL='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 40 40"><g stroke="'+OL+'" stroke-width="2.4" stroke-linejoin="round" fill="#f6dfb8"><path d="M5 34 L11 12 Q14 6 19 9 L20 30 Q14 38 5 34Z"/><path d="M35 34 L29 12 Q26 6 21 9 L20 30 Q26 38 35 34Z"/></g><path d="M14 13 L18 15 M13.5 18 L18.5 20 M26 13 L22 15 M26.5 18 L21.5 20" stroke="'+OL+'" stroke-width="1.6" stroke-linecap="round"/><path d="M7 27 L16 31 M33 27 L24 31" stroke="#16121a" stroke-width="2.6" stroke-linecap="round"/></svg>');
const calm=()=>!!(window.matchMedia&&matchMedia('(prefers-reduced-motion:reduce)').matches);
// rung lớp #gfx một lần ngắn (nút Bỏ qua và thẻ kết quả không rung); fxClear tự gỡ khi Bỏ qua
function shake(name,ms,n){if(calm())return;const f=$('gfx');f.style.animation='none';void f.offsetWidth;f.style.animation=name+' '+ms+'ms linear '+(n||1)}
const el=(cls,css,html)=>{const d=fxEl(css,html);d.className=cls;return d};
const DEB=['#ffffff','#ffb0b0','#e0283a','#3a0308','#1a0004'];

/* Một nhát chém từ (x,y) theo góc ang (độ), dài len. Đầu sáng chạy dọc đường chém, đường cắt lưu lại rồi tách đôi,
   hai dải méo trượt ngược chiều nhau, mảnh vụn bắn vuông góc ra hai bên (hạt canvas). */
function slash(T,x,y,ang,len,big){
  const W=innerWidth,Hh=innerHeight,r=ang*Math.PI/180,dx=Math.cos(r),dy=Math.sin(r),sw=big?150:170,life=big?750:850,u=Math.max(1,Math.min(W,Hh)/420);
  const d=el('sk-sl'+(big?' sk-big':''),'left:'+x.toFixed(1)+'px;top:'+y.toFixed(1)+'px;width:'+len.toFixed(1)+'px;transform:rotate('+ang.toFixed(2)+'deg);--len:'+len.toFixed(1)+'px',(big?'':'<i class="sk-wp"></i>')+'<i class="sk-hd"></i>');
  const n=big?4:5;
  for(let i=0;i<n;i++)T(sw*(i+.6)/n,()=>{const q=(i+rnd(.3,.9))/n,px=x+dx*len*q,py=y+dy*len*q;if(px<0||px>W||py<0||py>Hh)return;
    for(let j=0;j<(big?3:4);j++){const sd=j%2?1:-1,v=rnd(1.5,5.5)*u,a=rnd(-.5,.5);
      part({x:px,y:py,vx:(-dy*sd*v+dx*rnd(.5,3)*u)*Math.cos(a),vy:dy*rnd(.5,3)*u+dx*sd*v-rnd(0,1.2),g:.14,life:rnd(16,34),col:pick(DEB),sz:pick([3,4,6])*(u>1.4?1.5:1)})}});
  T(life+60,()=>d.remove());
  glide(rnd(1900,2700),rnd(420,620),.09,'sawtooth',big?.03:.022);
}
// chém ngẫu nhiên: tâm đường chém rơi trong màn hình, hướng bất kỳ
function slashRnd(T){
  const W=innerWidth,Hh=innerHeight,ang=rnd(0,360),r=ang*Math.PI/180,len=rnd(.5,.95)*Math.max(W,Hh),cx=rnd(.12,.88)*W,cy=rnd(.12,.82)*Hh;
  slash(T,cx-Math.cos(r)*len/2,cy-Math.sin(r)*len/2,ang,len);
}

function intro(T,t0,k,clear){
  const d=cell(k),W=innerWidth,Hh=innerHeight,cx=W*.5,cy=Hh*.66,by=cy-2*d,fy=cy+16*d; // by: chân đền (sau lưng bé, cao ngang thân để bé không che miệng quỷ); fy: mặt đất dưới chân bé
  const SH=Math.round(Math.min(Hh*.62,W*.96/.8,by-6)),SW=Math.round(SH*.8),sx=cx-SW/2,sy=by-SH,scy=by-SH*.48;
  const at=(ms,f)=>T(t0+ms,f),EMB=['#e0283a','#8a1020','#1a0004','#ff6a6a'];
  let cat,seal,aura,dom,floor,halo,pool,shw,ttl,sub;
  const ring=(x,y,sz,cls,ms)=>{const r=el(cls||'sk-ring','left:'+(x-sz/2)+'px;top:'+(y-sz/2)+'px;width:'+sz+'px;height:'+sz+'px');T(ms||1000,()=>r.remove());return r};
  const rip=()=>{const w=SW*2.4,h=w*.2,r=el('sk-rip','left:'+(cx-w/2)+'px;top:'+(fy-h/2)+'px;width:'+w+'px;height:'+h+'px');T(1150,()=>r.remove())};
  const txt=(s,y,css,anim)=>{const t=fxTxt(s,50,y,css,anim);t.style.zIndex=8;return t};

  /* --- 1. Kết ấn (0–900): bé ngồi thu mình, hai bàn tay chắp trước ngực, ánh đỏ đen toả ra, đất rung nhẹ --- */
  at(0,()=>{if(clear)clear();
    aura=el('sk-aura','left:'+(cx-26*d)+'px;top:'+(cy-22*d)+'px;width:'+52*d+'px;height:'+52*d+'px');
    cat=fxSpr('sit',k,50,66,'z-index:4;filter:drop-shadow(0 0 10px #e0283a)');
    seal=el('sk-seal','left:'+(cx-4.5*d)+'px;top:'+(cy+5.5*d)+'px;width:'+9*d+'px;height:'+9*d+'px;background-image:url(\''+SEAL+'\')');
    sub=txt('LÃNH ĐỊA TRIỂN KHAI',88.5,'color:#ffb0b0;font-size:min(5.4vw,7vh,28px);letter-spacing:3px;text-shadow:0 0 12px #e0283a,2px 2px 0 #1a0004','pop .45s ease-out both');
    shake('sk-rum',220,4);glide(58,36,1.1,'sawtooth',.06);seq([98,0,92,0,87],.16,.2,'square',.035)});
  [80,360,640].forEach(t=>at(t,()=>ring(cx,cy+4*d,Math.min(W,Hh)*.9,'sk-ring',1000)));
  every(T,t0,t0+2000,55,()=>part({x:cx+rnd(-20,20)*d,y:fy+rnd(-4,2)*d,vx:rnd(-.6,.6),vy:-rnd(1,3.6),life:rnd(22,46),col:pick(EMB),sz:pick([4,6,8])}));

  /* --- 2. Đền trồi lên (900–2000): khung cắt ở mặt đất nên đền mọc từ dưới lên, bụi đất văng hai bên chân --- */
  at(900,()=>{
    halo=el('sk-halo','left:'+(cx-SH*.8)+'px;top:'+(scy-SH*.8)+'px;width:'+SH*1.6+'px;height:'+SH*1.6+'px');
    shw=el('sk-shw','left:'+sx+'px;top:'+sy+'px;width:'+SW+'px;height:'+SH+'px','<div class="sk-shi"><img alt="" src="'+U0+'"><img alt="" class="sk-lit" src="'+U1+'"></div>');
    shake('sk-rum',200,5);glide(46,120,1.05,'sawtooth',.07)});
  every(T,t0+900,t0+1950,38,()=>{for(let i=0;i<2;i++){const sd=Math.random()<.5?-1:1;part({x:cx+sd*rnd(.1,.55)*SW,y:by+rnd(-3,3),vx:sd*rnd(.5,4),vy:-rnd(1.5,6),g:.2,life:rnd(18,36),col:pick(['#6a4a44','#3a2420','#a88a78','#8a1020']),sz:pick([4,6,9])})}});
  at(1950,()=>{shake('sk-shk',200,1);glide(110,38,.5,'sawtooth',.08);
    for(let i=0;i<34;i++){const sd=i%2?1:-1;part({x:cx+sd*rnd(.2,.56)*SW,y:by,vx:sd*rnd(1,7),vy:-rnd(.5,4.5),g:.16,life:rnd(20,40),col:pick(['#6a4a44','#a88a78','#3a2420']),sz:pick([4,6,9])})}});

  /* --- 3. Mở lãnh địa (2000–2900): không gian chuyển đỏ đen, sóng lan từ đền, đất loang máu, vài vệt chém đầu tiên --- */
  at(2000,()=>{if(sub)sub.remove();
    {const f=el('sk-fl r','');T(400,()=>f.remove())}dom=el('sk-dom','');
    floor=el('sk-floor','top:'+(by-2)+'px');
    pool=el('sk-pool','left:'+(cx-SW*1.25)+'px;top:'+(fy-SW*.2)+'px;width:'+SW*2.5+'px;height:'+SW*.4+'px');
    shw.classList.add('sk-on');shake('sk-shk',240,1);glide(150,30,1.2,'sawtooth',.08);seq([65,62,58,55],.11,.4,'sawtooth',.045);
    ttl=txt('PHỤC MA NGỰ TRÙ TỬ',88.5,'color:#fff;font-size:min(7vw,11vh,52px);letter-spacing:1px;text-shadow:0 0 16px #ff2a3a,4px 4px 0 #3a0004','pop .5s ease-out both');
    for(let i=0;i<40;i++){const a=rnd(0,6.283),v=rnd(3,10);part({x:cx,y:scy,vx:Math.cos(a)*v,vy:Math.sin(a)*v*.7,life:rnd(20,44),col:pick(EMB),sz:pick([4,8])})}});
  [2000,2230,2460].forEach(t=>at(t,()=>ring(cx,scy,Math.max(W,Hh)*1.5,'sk-ring',1000)));
  [2150,2550].forEach(t=>at(t,rip));
  [2380,2620,2800].forEach(t=>at(t,()=>slashRnd(T)));
  every(T,t0+2100,t0+5600,70,()=>part({x:rnd(0,W),y:Hh+6,vx:rnd(-.4,.4),vy:-rnd(1.5,5),life:rnd(40,80),col:pick(EMB),sz:pick([3,5,7])}));

  /* --- 4. Tấn công (2900–4600): chém dồn dập từ mọi hướng; cứ vài nhát mới rung một lần ngắn --- */
  let n=0;
  for(let t=2900;t<4480;t+=rnd(85,125))at(t,()=>{slashRnd(T);if(++n%4===0)shake('sk-shk',170,1)});
  [3300,4000].forEach(t=>at(t,rip));

  /* --- 5. Kết thúc (4650–6100): lưới chém chéo dày + chớp, đền bị xẻ đôi rồi tan, lãnh địa lui, bé ngồi lại --- */
  const L=Math.hypot(W,Hh)*1.15,A=Math.atan2(Hh,W)*180/Math.PI*.8;
  for(let i=0;i<7;i++){const f=(i+.5)/7,off=(f-.5)*Math.hypot(W,Hh)*1.05;
    [[A,1],[180-A,-1]].forEach((g,j)=>at(4650+i*26+j*13,()=>{const r=g[0]*Math.PI/180,px=cx-Math.sin(r)*off,py=Hh*.5+Math.cos(r)*off;slash(T,px-Math.cos(r)*L/2,py-Math.sin(r)*L/2,g[0],L,1)}))}
  at(4650,()=>glide(2600,90,.55,'sawtooth',.05));
  at(4900,()=>{const f=el('sk-fl','');T(400,()=>f.remove());shake('sk-shk2',320,1);glide(180,28,.9,'sawtooth',.09);
    for(let i=0;i<70;i++){const a=rnd(0,6.283),v=rnd(3,13);part({x:cx+rnd(-.3,.3)*W,y:Hh*.45+rnd(-.25,.25)*Hh,vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:.1,life:rnd(20,46),col:pick(DEB),sz:pick([4,6,10])})}});
  // nhát cuối xẻ đôi ngôi đền theo đúng đường cắt của hai nửa (từ mép trái 62% lên mép phải 30% chiều cao)
  at(5080,()=>{const ax=sx-SW*.45,ay=sy+SH*(.62+.32*.45),bx=sx+SW*1.45,b2=sy+SH*(.30-.32*.45),ln=Math.hypot(bx-ax,b2-ay);
    slash(T,ax,ay,Math.atan2(b2-ay,bx-ax)*180/Math.PI,ln,1)});
  at(5230,()=>{shw.classList.add('sk-open');shw.innerHTML='<div class="sk-half a" style="background-image:url(\''+U0+'\')"></div><div class="sk-half b" style="background-image:url(\''+U0+'\')"></div>';
    shake('sk-shk',200,1);glide(90,32,.8,'sawtooth',.07);
    [dom,floor,pool,halo,aura].forEach(e=>e&&e.classList.add('sk-out'));if(ttl)ttl.firstChild.style.animation='ghost .6s ease-out forwards';
    for(let i=0;i<46;i++)part({x:sx+rnd(0,SW),y:sy+rnd(.2,1)*SH,vx:rnd(-3,3),vy:-rnd(0,4),g:.16,life:rnd(24,50),col:pick(['#33242e','#5a4454','#8a1020','#eadfc4']),sz:pick([5,8,11])})});
  at(5560,()=>{if(seal)seal.remove();if(cat)cat.remove();
    fxSpr('sit',k,50,66,'z-index:4;animation:pop .45s ease-out both;filter:drop-shadow(0 0 14px #e0283a)');seq([196,147,98],.1,.3,'triangle',.05)});
  at(6050,()=>{[dom,floor,pool,halo,aura,shw,ttl].forEach(e=>e&&e.remove())});
  every(T,t0+5300,t0+6050,60,()=>fount(['#0a0a0a','#e0283a','#0a0a0a','#ff6a6a'],2));
}
intro.END=6100;       // độ dài cảnh tính từ t0 (ms)
intro.img=[IM0,IM1];intro.OL=OL;
return intro;
})();

/* ---------- bản trong phòng: vẽ lên canvas phòng, đơn vị là ô của phòng ----------
   draw (sau lưng bé): quầng đỏ, vũng máu, ngôi đền nhỏ trồi lên rồi vỡ đôi; over (đè lên bé): tay kết ấn, các nhát chém.
   Mốc theo giây của hành động (t = k × dur). Mỗi nhát chém: đầu sáng chạy, đường cắt lưu lại rồi tách đôi, hai dải méo, bụi (hạt rp). */
const shrineRoom=(()=>{
const DUR=5.6,SH=66,SW=52.8,RISE0=.7,RISE1=1.7,OUT0=4.75,END=5.5,SWP=.12,LIFE=.62;
const ease=x=>{x=clamp(x,0,1);return 1-(1-x)*(1-x)*(1-x)},env=t=>clamp((t-.15)/.8,0,1)*clamp((END-t)/.7,0,1);
const DUST=['#ffffff','#ffb0b0','#e0283a','#3a0308'];
function addSlash(e,p,t,big){
  const a=rnd(0,6.283),len=big?rnd(84,104):rnd(40,72),cx=p.x+(big?0:rnd(-30,30)),cy=p.y-24+(big?0:rnd(-26,22));
  e.skS.push({x:cx-Math.cos(a)*len/2,y:cy-Math.sin(a)*len/2,a,len,t,big});
}
function drawSlash(g,s,age){
  const q=Math.min(1,age/SWP),L=s.len*q,f=1-clamp((age-SWP)/(LIFE-SWP),0,1),w=s.big?1.6:1,o=Math.max(0,age-.26)*9,sh=Math.max(0,age-SWP)*16;
  g.save();g.translate(s.x,s.y);g.rotate(s.a);
  if(age>SWP*.5){g.globalAlpha=f*.2;g.fillStyle='#ffe4e4';g.fillRect(sh,-2.6*w,L,2.2*w);g.globalAlpha=f*.3;g.fillStyle='#0a0002';g.fillRect(-sh,.4*w,L,2.2*w)}   // hai dải méo trượt ngược chiều
  g.globalAlpha=f*.9;g.fillStyle='#2a0006';g.fillRect(0,-.35*w,L,.7*w);                                                                                           // vết cắt sẫm lưu lại
  g.globalAlpha=Math.min(1,f*1.6);g.fillStyle='#ffffff';g.fillRect(0,-.55*w-o,L,.55*w);g.fillRect(0,o,L,.55*w);                                                    // hai mép sáng tách ra
  if(q<1){g.globalAlpha=.75;g.fillStyle='#ff8a94';g.fillRect(Math.max(0,L-13),-.9*w,Math.min(L,13),1.8*w);g.globalAlpha=1;g.fillStyle='#ffffff';g.fillRect(Math.max(0,L-5),-1.3*w,Math.min(L,5),2.6*w)} // đầu sáng
  g.restore();g.globalAlpha=1;
}
function drawShrine(g,x,y,im,a){if(!im.complete||!im.naturalWidth)return;g.globalAlpha=a;g.drawImage(im,x,y,SW,SH)}
return {
  n:'kết ấn mở Phục Ma Ngự Trù Tử',dur:DUR,pose:'sit',
  start(e){e.skS=[];e.skT=1.9;e.sgB=0},
  end(e){e.skS=null;e.cd=rnd(90,180)},
  draw(g,e,p,k){
    const t=k*DUR,v=env(t),IM=shrineIntro.img,by=p.y-13,x0=p.x-SW/2;   // chân đền cao ngang thân bé để bé không che miệng quỷ
    if(v>0){   // quầng đỏ đen quanh bé và vũng máu dưới chân
      const gr=g.createRadialGradient(p.x,p.y-24,2,p.x,p.y-24,54);gr.addColorStop(0,'rgba(224,40,58,'+(.55*v).toFixed(3)+')');gr.addColorStop(.55,'rgba(70,4,12,'+(.42*v).toFixed(3)+')');gr.addColorStop(1,'rgba(20,0,2,0)');
      g.fillStyle=gr;g.fillRect(p.x-56,p.y-80,112,96);
      const s=ease((t-1.5)/.8)*v;if(s>0){g.fillStyle='rgba(36,18,15,'+(.8*v).toFixed(3)+')';g.beginPath();g.ellipse(p.x,p.y,35*s+.8,6.5*s+.8,0,0,6.283);g.fill();g.fillStyle='rgba(138,14,28,'+(.85*v).toFixed(3)+')';g.beginPath();g.ellipse(p.x,p.y,35*s,6.5*s,0,0,6.283);g.fill();
        g.fillStyle='rgba(210,40,56,'+(.6*v).toFixed(3)+')';g.beginPath();g.ellipse(p.x-6*s,p.y-1,14*s,2.2*s,0,0,6.283);g.fill()}
    }
    if(t<RISE0)return;
    const sm=g.imageSmoothingEnabled;g.imageSmoothingEnabled=true;
    if(t<OUT0){   // trồi lên: cắt ở mặt đất để đền mọc từ dưới
      const r=ease((t-RISE0)/(RISE1-RISE0)),jit=r<1?Math.sin(t*70)*.5:0;
      g.save();g.beginPath();g.rect(x0-6,by-SH-6,SW+12,SH+6);g.clip();
      drawShrine(g,x0+jit,by-SH+(1-r)*SH,IM[0],1);if(t>RISE1)drawShrine(g,x0,by-SH,IM[1],clamp((t-RISE1)/.3,0,1)*(.8+.2*Math.sin(t*14)));
      g.restore();g.globalAlpha=1;
      if(r<1&&on(40)){const sd=ch(.5)?1:-1;rp(p.x+sd*rnd(6,24),by,pick(['#6a4a44','#a88a78','#8a1020']),{vx:sd*rnd(6,26),vy:-rnd(10,34),g:90,life:rnd(.3,.55),sz:ch(.4)?2:1})}
    }else{        // vỡ đôi theo đường chéo, hai nửa trượt xa nhau và mờ dần
      const q=clamp((t-OUT0)/(END-OUT0),0,1),a=1-q,y0=by-SH;
      [[-1,[[0,0],[SW,0],[SW,SH*.3],[0,SH*.62]]],[1,[[0,SH*.62],[SW,SH*.3],[SW,SH],[0,SH]]]].forEach(h=>{
        const ox=h[0]*q*9,oy=h[0]*q*(h[0]<0?5:9);g.save();g.translate(x0+ox,y0+oy);g.beginPath();h[1].forEach((c,i)=>i?g.lineTo(c[0],c[1]):g.moveTo(c[0],c[1]));g.closePath();g.clip();drawShrine(g,0,0,IM[0],a);g.restore()});
      g.globalAlpha=1;
      if(on(30))rp(p.x+rnd(-22,22),by-rnd(4,SH),pick(['#33242e','#5a4454','#8a1020','#eadfc4']),{vx:rnd(-14,14),vy:-rnd(0,20),g:80,life:rnd(.3,.6),sz:ch(.5)?2:1});
    }
    g.imageSmoothingEnabled=sm;
  },
  over(g,e,p,k){
    const t=k*DUR,S=e.skS||(e.skS=[]),hx=p.x,hy=p.y-12;
    if(t>.1&&t<OUT0+.3){   // tay kết ấn trước ngực và vòng ấn xoay
      const a=clamp((t-.1)/.3,0,1)*clamp((OUT0+.3-t)/.3,0,1),rt=t*4;
      g.globalAlpha=a*.5;g.fillStyle='#ff5a6a';g.beginPath();g.arc(hx,hy,4.6+Math.sin(t*12)*.5,0,6.283);g.fill();
      g.globalAlpha=a;g.strokeStyle='#ff3a50';g.lineWidth=.8;for(let i=0;i<4;i++){g.beginPath();g.arc(hx,hy,7,rt+i*1.571,rt+i*1.571+1);g.stroke()}
      g.fillStyle='#24120f';g.fillRect(hx-2.5,hy-1.5,5,4.5);g.fillRect(hx-1.5,hy-2.5,3,1);g.fillStyle='#f6dfb8';g.fillRect(hx-2,hy-1,1.8,3.5);g.fillRect(hx+.2,hy-1,1.8,3.5);g.fillRect(hx-1,hy-2,2,1);g.fillStyle='#16121a';g.fillRect(hx-2,hy+1.5,4,.6);
      g.globalAlpha=1;
    }
    // mốc một lần: sóng lan khi đền lên xong, loạt chém lớn cuối
    if(e.sgB<1&&t>RISE1){e.sgB=1;rp(p.x,p.y-26,'#ff3a50',{sh:'ring',r:6,vr:95,life:.6});rp(p.x,p.y-26,'#1a0004',{sh:'ring',r:3,vr:80,life:.7})}
    if(e.sgB<2&&t>RISE1+.3){e.sgB=2;rp(p.x,p.y-1,'#ff6a78',{sh:'ring',r:8,vr:60,life:.7})}
    if(e.sgB<3&&t>4.35){e.sgB=3;for(let i=0;i<5;i++)addSlash(e,p,t+i*.035,1);rp(p.x,p.y-24,'#ffffff',{sh:'ring',r:5,vr:130,life:.5})}
    // chém thưa lúc đầu, dày dần
    while(t>e.skT&&e.skT<4.25){addSlash(e,p,e.skT);e.skT+=e.skT<2.5?rnd(.24,.34):rnd(.11,.17)}
    for(let i=S.length-1;i>=0;i--){const s=S[i],age=t-s.t;if(age<0)continue;if(age>LIFE){S.splice(i,1);continue}
      drawSlash(g,s,age);
      if(age<SWP&&ch(.85)){const q=age/SWP,px=s.x+Math.cos(s.a)*s.len*q,py=s.y+Math.sin(s.a)*s.len*q,sd=ch(.5)?1:-1,v=rnd(14,44);   // bụi bắn vuông góc ở chỗ đầu sáng vừa cắt qua
        rp(px,py,pick(DUST),{vx:-Math.sin(s.a)*sd*v,vy:Math.cos(s.a)*sd*v-6,g:60,life:rnd(.2,.42),sz:ch(.3)?2:1})}}
    if(t>1.2&&t<OUT0&&on(9))rp(p.x+rnd(-20,20),p.y-rnd(0,8),pick(['#8a1020','#e0283a','#1a0004']),{vy:-rnd(14,34),life:rnd(.3,.55)});
  },
};
})();
