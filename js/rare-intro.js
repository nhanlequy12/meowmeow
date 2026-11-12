"use strict";
/* ============ INTRO GACHA CỦA TRANG PHỤC HIẾM (bé 5★) ============
   Nạp sau ui.js, pack18.js, shrine.js. Không dựng lại cảnh: bọc INTRO[sp].run, cảnh gốc chạy y nguyên,
   rồi CHỈ KHI bé đang mang đúng trang phục hiếm thì thêm vài chi tiết theo chủ đề của trang phục đó
   (đổi tông nền, thêm đạo cụ, hạt, một dòng chữ phụ). Trang phục thường không đi qua nhánh nào ở đây.
   Thời lượng (dur) của mọi intro giữ nguyên. Mọi hẹn giờ đi qua T nên bấm Bỏ qua là dừng ngay;
   mọi phần tử thêm nằm trong #gfx (mang lớp ri-el) nên fxClear dọn sạch. Keyframe riêng mang tiền tố ri-. */
(()=>{
if(typeof INTRO==='undefined')return;
const st=document.createElement('style');st.id='ri-style';
st.textContent=
  '@keyframes ri-in{from{transform:scale(.6);opacity:0}to{transform:scale(1);opacity:1}}'+
  '@keyframes ri-sub{0%{transform:translateY(10px) scale(.85);opacity:0}18%{transform:none;opacity:1}80%{transform:none;opacity:1}100%{transform:translateY(-8px);opacity:0}}'+
  '@keyframes ri-up{from{transform:translateY(100%)}to{transform:translateY(0)}}'+
  '@keyframes ri-pulse{from{transform:scale(.94);opacity:.75}to{transform:scale(1.08);opacity:1}}'+
  '@keyframes ri-flap{from{transform:rotate(-38deg)}to{transform:rotate(38deg)}}'+
  '@keyframes ri-snitch{0%{transform:translate(-44vw,-26vh)}12%{transform:translate(-12vw,8vh)}25%{transform:translate(30vw,-22vh)}38%{transform:translate(38vw,16vh)}50%{transform:translate(6vw,26vh)}62%{transform:translate(-34vw,10vh)}75%{transform:translate(-22vw,-28vh)}88%{transform:translate(18vw,-14vh)}100%{transform:translate(0,var(--ey))}}'+
  '@keyframes ri-launch{from{transform:translateY(0)}to{transform:translateY(-150vh)}}'+
  '@keyframes ri-sweep{0%{transform:translateX(-100%);opacity:1}55%{transform:translateX(0);opacity:1}100%{transform:translateX(0);opacity:0}}';
document.head.appendChild(st);

const mark=e=>{e.classList.add('ri-el');return e},
  el=(css,html)=>mark(fxEl(css,html)),
  txt=(t,x,y,css,anim)=>mark(fxTxt(t,x,y,css,anim)),
  // dòng chữ phụ nhỏ; stay: ở lại tới hết cảnh, không thì hiện rồi tan
  sub=(t,y,col,glow,stay)=>txt(t,50,y,'color:'+col+';font-size:min(5vw,26px);letter-spacing:3px;text-shadow:0 0 10px '+glow+',0 0 3px '+glow+',2px 2px 0 rgba(0,0,0,.55)',stay?'ri-in .4s ease-out both':'ri-sub 1.5s ease-out both'),
  d5=()=>cell(K5()),W=()=>innerWidth,Hh=()=>innerHeight,
  // hạt bay lên quanh điểm (x, y) tính bằng px
  rise=(x,y,r,cols,o)=>part(Object.assign({x:x+rnd(-r,r),y:y+rnd(-r,r),vx:rnd(-.8,.8),vy:-rnd(.8,3),life:rnd(22,44),col:pick(cols),sz:ch(.5)?4:8},o)),
  // nổ hạt toả tròn từ (x, y)
  boom=(x,y,n,cols,v)=>{for(let i=0;i<n;i++){const a=rnd(0,6.283),s=rnd(1.5,v||6);part({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(26,50),col:pick(cols),sz:ch(.5)?4:8})}},
  glow=(x,y,w,h,c,css)=>el('left:'+x+';top:'+y+';width:'+w+'px;height:'+h+'px;margin:'+(-h/2)+'px 0 0 '+(-w/2)+'px;border-radius:50%;background:radial-gradient(ellipse,'+c+' 0,transparent 70%);'+(css||''));
// bọc run của một bé: cảnh gốc chạy trước, phần thêm chỉ chạy khi trang phục khớp
function wrap(sp,map){
  const I=INTRO[sp];if(!I||!I.run)return;
  const r0=I.run;
  I.run=function(T){r0.call(this,T);const f=map[gz.cat&&gz.cat.coat];if(f){try{f(T)}catch(e){console.error('rare-intro '+sp,e)}}};
}

/* ---------- Khao Manee · Mão vàng hoàng cung: nền ánh vàng, hai tháp vàng mọc lên hai bên, vầng hào quang, bụi vàng ---------- */
wrap('khaomanee',{kmChada(T){
  const d=d5();fxTint('radial-gradient(circle,#3a2a0c 0,#0c0803 75%)');
  const spire='polygon(50% 0,54% 30%,62% 36%,58% 42%,70% 60%,64% 64%,86% 86%,100% 100%,0 100%,14% 86%,36% 64%,30% 60%,42% 42%,38% 36%,46% 30%)';
  [27,73].forEach((x,i)=>el('left:'+x+'%;bottom:0;width:min(24vw,150px);height:min(52vh,330px);margin-left:max(-12vw,-75px);z-index:-1;background:linear-gradient(#ffe9a0,#f2c230 40%,#8a5a10);clip-path:'+spire+';animation:ri-up .7s '+(1.4+i*.12)+'s cubic-bezier(.2,.8,.3,1) both'));
  T(1550,()=>glow('50%','52%',58*d,58*d,'rgba(255,224,122,.75)','z-index:-1;animation:ri-pulse .8s ease-in-out infinite alternate'));
  every(T,1500,3200,70,()=>rise(W()/2,Hh()*.52,24*d,['#ffe07a','#f2c230','#fff3b0']));
  T(2100,()=>{sub('MÃO VÀNG HOÀNG CUNG',86,'#ffe9a0','#c98a12',1);seq([1319,1568,1976,2637],.09,.35,'sine',.05)});
}});

/* ---------- Lykoi · Khăn đỏ: trăng ửng đỏ, cánh hoa đỏ bay, cuối cảnh có giỏ mây và một câu thoại ---------- */
wrap('lykoi',{lyHood(T){
  const d=d5(),moon=[...$('gfx').children].find(e=>/moon/.test(e.style.animation));
  fxTint('linear-gradient(#1a0714,#4a1830)');
  if(moon){moon.style.background='#ffd9cc';moon.style.boxShadow='0 0 60px 22px rgba(255,90,90,.5)'}
  every(T,0,3400,110,()=>part({x:rnd(0,W()*1.2),y:-8,vx:rnd(-2.5,-.5),vy:rnd(1.5,3.5),g:.02,life:150,col:pick(['#c8323c','#e85a64','#8a1f2a']),sz:ch(.5)?4:8}));
  T(2700,()=>{
    el('left:50%;top:56%;width:'+12*d+'px;height:'+11*d+'px;margin:'+8*d+'px 0 0 '+15*d+'px;animation:pop .4s ease-out both',
      '<div style="position:absolute;box-sizing:border-box;left:'+1.5*d+'px;top:0;width:'+9*d+'px;height:'+8*d+'px;border:'+1.2*d+'px solid #8a5a2a;border-bottom:0;border-radius:'+4.5*d+'px '+4.5*d+'px 0 0"></div>'+
      '<div style="position:absolute;left:0;top:'+5*d+'px;width:100%;height:'+6*d+'px;border-radius:0 0 '+3*d+'px '+3*d+'px;background:repeating-linear-gradient(90deg,#c08a4a 0 '+d+'px,#9a6a32 '+d+'px '+2*d+'px)"></div>'+
      '<div style="position:absolute;left:'+d+'px;top:'+4*d+'px;width:'+10*d+'px;height:'+2.4*d+'px;border-radius:'+d+'px;background:#c8323c"></div>');
    boom(W()/2,Hh()*.56,22,['#c8323c','#ff8a8a','#fff'],5);
    sub('Khăn Đỏ đi thăm bà đây!',80,'#ffb0b0','#c8323c',1)});
}});

/* ---------- Savannah · Mèo của Pharaoh: kim tự tháp ở chân trời, bụi vàng, chữ thập ankh vàng hiện trên đầu lúc tiếp đất ---------- */
wrap('savannah',{svEgypt(T){
  const d=d5(),pyr=(x,w,h,dl)=>el('left:'+x+'%;bottom:20%;width:'+w+';height:'+h+';z-index:-1;background:linear-gradient(100deg,#9a5a20 0 50%,#5e2c0e 50%);clip-path:polygon(50% 0,100% 100%,0 100%);animation:fadeIn .7s '+dl+'s ease-out both');
  pyr(42,'min(46vw,300px)','min(26vh,190px)',0);pyr(27,'min(28vw,180px)','min(16vh,116px)',.2);
  every(T,0,3200,90,()=>part({x:rnd(0,W()),y:rnd(Hh()*.3,Hh()*.8),vx:rnd(.5,2),vy:-rnd(.2,1),life:rnd(30,60),col:pick(['#ffe07a','#fff3b0','#f2c230']),sz:4}));
  T(350,()=>sub('MÈO CỦA PHARAOH',10,'#fff3c8','#7a3a12'));
  T(2250,()=>{const b='position:absolute;background:#ffd24a;border-radius:'+.6*d+'px;';
    el('left:calc(30% + 40vw);top:calc(80% - '+18*d+'px);width:'+8*d+'px;height:'+14*d+'px;margin:'+(-37*d)+'px 0 0 '+(-4*d)+'px;filter:drop-shadow(0 0 8px #fff3b0);animation:pop .4s ease-out both',
      '<div style="position:absolute;box-sizing:border-box;left:'+d+'px;top:0;width:'+6*d+'px;height:'+6.4*d+'px;border:'+1.6*d+'px solid #ffd24a;border-radius:50%"></div>'+
      '<div style="'+b+'left:'+3.2*d+'px;top:'+5.6*d+'px;width:'+1.6*d+'px;height:'+8.4*d+'px"></div><div style="'+b+'left:0;top:'+7*d+'px;width:'+8*d+'px;height:'+1.6*d+'px"></div>');
    boom(W()*.7,Hh()*.8-18*d,26,['#ffd24a','#fff3b0','#3aa6c8'],6);seq([1568,2093,2637],.08,.3,'sine',.05)});
}});

/* ---------- Sokoke · Thần rừng: đom đóm, hoa nở trên bụi cây lúc đôi mắt hiện ra, tiếp đất thì hoa lá bung thành vòng ---------- */
wrap('sokoke',{skForest(T){
  const d=d5(),BX=30,DXL=Math.max(.26*W(),56*d),FL=['#fff','#ffd6e6','#ffe07a','#b5e08a'];
  every(T,0,4000,120,()=>part({x:rnd(0,W()),y:rnd(Hh()*.15,Hh()*.85),vx:rnd(-.5,.5),vy:-rnd(.1,.6),life:rnd(40,80),col:pick(['#eaff8a','#b5ffb0','#fff7b0']),sz:4}));
  T(350,()=>sub('THẦN RỪNG',14,'#d8ffb0','#2c7236'));
  T(2050,()=>[[-24,18],[-14,34],[4,38],[20,32],[27,16]].forEach((p,i)=>el('left:'+BX+'%;bottom:calc(17% + '+p[1]*d+'px);width:'+5*d+'px;height:'+5*d+'px;margin-left:'+(p[0]-2.5)*d+'px;z-index:4;border-radius:50%;background:radial-gradient(circle,#ffd24a 0 26%,'+(i%2?'#ffd6e6':'#fff')+' 30% 62%,transparent 66%);animation:pop .35s '+(i*.09).toFixed(2)+'s ease-out both')));
  T(3600,()=>{const x=W()*BX/100+DXL,y=Hh()*.83-18*d;
    el('left:'+x+'px;top:'+(y+14*d)+'px;width:'+12*d+'px;height:'+4*d+'px;margin:'+(-2*d)+'px 0 0 '+(-6*d)+'px;z-index:1;border-radius:50%;border:'+d+'px solid #b5e08a;box-shadow:0 0 12px #8ee08a;animation:burst .7s ease-out forwards');
    boom(x,y,30,FL,6)});
  every(T,3600,4000,70,()=>rain(FL,2));
}});

/* ---------- Suphalak · Vòng hoa nhài: khi vỏ vỡ, một vòng hoa nhài trắng xoay quanh bé, cánh hoa trắng rơi ---------- */
wrap('suphalak',{spMalai(T){
  const d=d5(),R=27*d,n=12,PT=['#fff','#fff3c4','#ffe9a0'];
  T(2050,()=>{
    el('left:50%;top:50%;width:'+2*R+'px;height:'+2*R+'px;margin:'+(-R)+'px 0 0 '+(-R)+'px;z-index:-1;animation:ri-in .5s ease-out both',
      '<div style="position:relative;width:100%;height:100%;animation:spin 7s linear infinite">'+Array.from({length:n},(_,i)=>'<span style="position:absolute;left:'+(50+50*Math.cos(i*6.283/n)).toFixed(1)+'%;top:'+(50+50*Math.sin(i*6.283/n)).toFixed(1)+'%;width:'+5*d+'px;height:'+5*d+'px;margin:'+(-2.5*d)+'px;border-radius:50%;background:radial-gradient(circle,#ffe07a 0 24%,#fff 28% 60%,transparent 66%);filter:drop-shadow(0 0 4px #fff3c4)"></span>').join('')+'</div>');
    boom(W()/2,Hh()/2,24,PT,5)});
  every(T,2050,3700,70,()=>rain(PT,2));
  T(2500,()=>sub('VÒNG HOA NHÀI',87,'#fff','#b5652f',1));
}});

/* ---------- Naruto: Tiên nhân Cửu Vĩ (chakra vàng cam, sáu Cầu Đạo Ngọc đen) và Hokage Đệ Thất (gió cuốn lá, ấn "火") ---------- */
wrap('v_naruto',{
  nrKurama(T){
    const d=d5(),gy=Hh()*.8-18*d,RX=W()*.52,EX=W()*.86,CH=['#ffd83a','#ff9a28','#fff2a6'];
    every(T,0,1000,60,()=>rise(W()*.26,gy+6*d,14*d,CH));
    T(900,()=>sub('TIÊN NHÂN CỬU VĨ',10,'#fff2a6','#f08a2a'));
    T(2500,()=>glow(RX+'px',gy+'px',50*d,54*d,'rgba(255,200,60,.6)','z-index:1;animation:auraUp .4s ease-out both'));
    every(T,2500,5100,60,()=>rise(RX,gy+8*d,15*d,CH,{vy:-rnd(1.5,4)}));
    T(3760,()=>{el('left:'+(EX-8*d)+'px;top:'+(gy-8*d)+'px;width:'+16*d+'px;height:'+16*d+'px;z-index:3;border-radius:50%;border:'+d+'px solid #ffb432;animation:ring .6s ease-out forwards');boom(EX,gy,24,CH,8)});
    T(4350,()=>{for(let i=0;i<6;i++){const a=(200+i*28)*Math.PI/180,s=5*d;
      el('left:'+(RX+Math.cos(a)*27*d-s/2)+'px;top:'+(gy+Math.sin(a)*27*d-s/2)+'px;width:'+s+'px;height:'+s+'px;z-index:1;border-radius:50%;background:radial-gradient(circle at 35% 30%,#6a6a6a,#0a0a0a 60%);box-shadow:0 0 '+1.5*d+'px '+.4*d+'px #ffd83a;animation:pop .3s '+(i*.05).toFixed(2)+'s ease-out both')}
      boom(RX,gy,26,CH,7)});
  },
  nrHokage(T){
    const d=d5(),gy=Hh()*.8-18*d,RX=W()*.52,LF=['#6fd26f','#3f9a55','#b5e08a','#fff'];
    every(T,0,5100,45,()=>{for(let i=0;i<2;i++)part({x:-10,y:rnd(0,Hh()*.8),vx:rnd(6,11),vy:rnd(-1,1.5),life:160,col:pick(LF),sz:ch(.5)?4:8})});
    T(900,()=>sub('HOKAGE ĐỆ THẤT',10,'#fff','#d8342c'));
    T(4350,()=>{const s=15*d;
      el('left:'+(RX-s/2)+'px;top:'+(gy-40*d)+'px;width:'+s+'px;height:'+s+'px;z-index:1;box-sizing:border-box;border-radius:50%;background:#fff;border:'+1.2*d+'px solid #d8342c;color:#d8342c;font-weight:900;font-size:'+9.5*d+'px;line-height:'+(s-2.4*d)+'px;text-align:center;box-shadow:0 0 14px #fff;animation:pop .4s ease-out both','火');
      for(let i=0;i<30;i++){const a=i*.42,v=3+i*.12;part({x:RX,y:gy,vx:Math.cos(a)*v,vy:Math.sin(a)*v,life:rnd(26,46),col:pick(LF),sz:ch(.5)?4:8})}});
  }});

/* ---------- Zenitsu · Hỏa Lôi Thần: nền ngả đỏ, rồng lửa sét lượn theo nhát chém, sét đỏ cam, tàn lửa ---------- */
wrap('v_thunder',{ztGod(T){
  const d=d5(),FR=['#ff5a2a','#ff9a28','#ffe14a'];
  T(1250,()=>{fxTint('radial-gradient(circle,#4a1404 0,#150402 75%)');
    let p='M0 10';for(let i=1;i<=15;i++)p+=' Q'+(i*6-3)+' '+(i%2?1:19)+' '+i*6+' 10';
    el('left:0;top:56%;width:100%;height:'+16*d+'px;margin-top:'+(-8*d)+'px;z-index:1;animation:ri-sweep .75s ease-out both',
      '<svg viewBox="0 0 100 20" preserveAspectRatio="none" width="100%" height="100%" style="overflow:visible;filter:drop-shadow(0 0 6px #ff5a2a)"><path d="'+p+'" fill="none" stroke="#ff5a2a" stroke-width="3.2" stroke-linecap="round"/><path d="'+p+'" fill="none" stroke="#ffe14a" stroke-width="1.2"/><polygon points="89,2 99,10 89,18 92,10" fill="#ffe14a" stroke="#ff5a2a" stroke-width=".8"/></svg>')});
  [[1330,.34],[1580,.9],[1820,.44]].forEach(b=>T(b[0],()=>bolt(W()*b[1],'#ff4a1a')));
  T(1750,()=>sub('HỎA LÔI THẦN',15,'#ffd0a0','#ff4a1a'));
  every(T,1250,3200,50,()=>part({x:rnd(0,W()),y:Hh()+6,vx:rnd(-.8,.8),vy:-rnd(3,7),life:rnd(40,90),col:pick(FR),sz:ch(.5)?4:8}));
  T(2250,()=>{glow('50%','56%',12*d,12*d,'#ff9a28','z-index:-1;animation:ring .8s ease-out forwards');boom(W()/2,Hh()*.56,24,FR,7)});
}});

/* ---------- Gojo · Lục Nhãn giác ngộ: sau khi đỏ và xanh nhập lại, quả cầu tím Hư Thức hiện ra, hút hạt rồi nổ nhẹ ---------- */
wrap('v_gojo',{gjSix(T){
  const PU=['#b46aff','#e6d0ff','#7a3ae0','#fff'],ox=()=>W()/2,oy=()=>Hh()*.28;let orb;
  T(2450,()=>{orb=el('left:50%;top:28%;width:min(22vw,84px);height:min(22vw,84px);transform:translate(-50%,-50%)','<div style="width:100%;height:100%;border-radius:50%;background:radial-gradient(circle at 40% 35%,#fff 0,#d9a6ff 18%,#8a3ae0 55%,#3a0a8a 82%);box-shadow:0 0 30px 10px #b46aff;animation:kame .5s ease-out both"></div>');
    sub('HƯ THỨC: TỬ',13,'#f0e0ff','#8a3ae0',1)});
  every(T,2500,3250,45,()=>{const a=rnd(0,6.283),r=rnd(70,130);part({x:ox()+Math.cos(a)*r,y:oy()+Math.sin(a)*r,vx:-Math.cos(a)*r/11,vy:-Math.sin(a)*r/11,life:11,col:pick(PU),sz:4})});
  T(3250,()=>{orb.firstChild.style.animation='burst .45s ease-out forwards';
    el('left:50%;top:28%;width:60px;height:60px;margin:-30px;box-sizing:border-box;border-radius:50%;border:5px solid #d9a6ff;animation:ring .7s ease-out forwards');
    boom(ox(),oy(),40,PU,8);glide(700,60,.5,'sawtooth',.05)});
}});

/* ---------- Harry · Tầm thủ Gryffindor: nền đỏ Gryffindor, trái Snitch vàng bay lượn khắp màn hình rồi đậu ngay trên đầu bé ---------- */
wrap('v_harry',{hpSeeker(T){
  const d=d5(),s=Math.max(12,3.6*d),GD=['#ffd24a','#fff3b0','#f2c230'];
  fxTint('radial-gradient(circle at 50% 40%,#5e1a28 0,#16060a 78%)');
  const wing=(side,r)=>'<div style="position:absolute;'+side+':'+s*.4+'px;top:'+(-s*.3)+'px;width:'+s*1.7+'px;height:'+s*.55+'px;border-radius:'+r+';background:linear-gradient(#fff,#ffe9a0);transform-origin:'+(side==='left'?'0':'100%')+' 50%;animation:ri-flap .07s linear infinite alternate'+(side==='left'?'':'-reverse')+'"></div>';
  const sn=el('left:50%;top:40%;width:0;height:0;z-index:3;--ey:'+Math.round(Hh()*.22-29*d)+'px;animation:ri-snitch 3.1s linear both',
    wing('left','0 80% 80% 0')+wing('right','80% 0 0 80%')+'<div style="position:absolute;left:'+(-s/2)+'px;top:'+(-s/2)+'px;width:'+s+'px;height:'+s+'px;border-radius:50%;background:radial-gradient(circle at 35% 30%,#fff3b0,#f2c230 55%,#b87a12);box-shadow:0 0 '+s*.8+'px #ffd24a"></div>');
  every(T,0,4000,60,()=>{const r=sn.getBoundingClientRect();part({x:r.left+rnd(-4,4),y:r.top+rnd(-4,4),vx:rnd(-.6,.6),vy:rnd(.2,1.2),life:rnd(16,30),col:pick(GD),sz:4})});
  T(3150,()=>{const r=sn.getBoundingClientRect();boom(r.left,r.top,24,GD,5);
    sub('BẮT ĐƯỢC SNITCH!  +150',32,'#ffe9a0','#c0303a',1);seq([1568,1976,2349,3136],.08,.3,'sine',.05)});
}});

/* ---------- Vader Trắng: nền xanh băng, viền sương giá, tuyết rơi; lúc lộ diện thì mảnh băng bắn ra ---------- */
wrap('v_vader',{vdWhite(T){
  const d=d5(),IC=['#fff','#bfe6ff','#8cc8f0'];
  fxTint('radial-gradient(circle,#0e2636 0,#02070c 75%)');
  el('inset:0;box-shadow:inset 0 0 16vmin 4vmin rgba(200,235,255,.42);animation:fadeIn 1.6s ease-out both');
  every(T,0,3600,70,()=>part({x:rnd(0,W()),y:-8,vx:rnd(-1,.4),vy:rnd(1,2.6),life:170,col:pick(IC),sz:ch(.6)?4:8}));
  T(2850,()=>{
    glow('50%','54%',14*d,14*d,'#bfe6ff','z-index:-1;animation:ring .8s ease-out forwards');
    for(let i=0;i<6;i++){const a=i*1.047+.5,ds=rnd(26,38)*d;
      el('left:50%;top:54%;width:'+3*d+'px;height:'+9*d+'px;margin:'+(-4.5*d)+'px 0 0 '+(-1.5*d)+'px;z-index:-1;background:linear-gradient(#fff,#8cc8f0);clip-path:polygon(50% 0,100% 50%,50% 100%,0 50%);--tx:'+Math.round(Math.cos(a)*ds)+'px;--ty:'+Math.round(Math.sin(a)*ds)+'px;--rot:'+Math.round(rnd(-200,200))+'deg;animation:shard .9s ease-out both')}
    boom(W()/2,Hh()*.54,30,IC,7);sub('VADER TRẮNG',13,'#e8f6ff','#3a8cc8',1);seq([2093,2637,3136],.07,.3,'sine',.04)});
}});

/* ---------- Tac Nayn: bay ngược chiều (phải sang trái), cầu vồng đảo màu tối, nền đỏ đen, chữ chạy thành "NAYN" ---------- */
wrap('v_nyan',{nyTac(T){
  fxTint('linear-gradient(#16040a,#3a0a16)');
  const f=$('gfly'),fl=f.firstElementChild,mq=[...$('gfx').children].find(e=>/marq/.test(e.style.animation));
  if(fl){const rb=fl.querySelector('.rb');if(rb)rb.style.filter='invert(1) hue-rotate(180deg) saturate(1.4) brightness(.72)';
    const w=document.createElement('div');w.className='ri-el';w.style.transform='scaleX(-1)';f.insertBefore(w,fl);w.appendChild(fl)} // lật cả đường bay; #gfly được dựng lại ở lần chạy sau nên không sót gì
  if(mq){mq.textContent='NAYN NAYN NAYN NAYN NAYN NAYN NAYN~';mq.style.color='#e0dce6';mq.style.textShadow='3px 3px 0 #a01830'}
  every(T,0,2600,90,()=>{for(let k=0;k<3;k++)part({x:rnd(0,W()),y:rnd(0,Hh()),vx:rnd(3,7),life:rnd(20,40),col:pick(['#ff3a3a','#a070f0','#5a2a8a']),sz:ch(.5)?4:8})});
  T(300,()=>sub('TAC NAYN',16,'#ffb0b0','#a01830'));
}});

/* ---------- Thần Tài · Vàng ròng: nền vàng, tia vàng xoay, viền vàng, thỏi vàng rơi dày hơn, chữ "VÀNG RÒNG 9999" ---------- */
wrap('v_maneki',{mkGold(T){
  fxTint('radial-gradient(circle,#b08214 0,#2e1e04 78%)');
  el('left:50%;top:50%;width:170vmax;height:170vmax;margin:-85vmax 0 0 -85vmax;z-index:-1;background:repeating-conic-gradient(#fff3b0 0 6deg,transparent 6deg 20deg);opacity:.2;animation:spin 16s linear infinite');
  el('inset:0;box-sizing:border-box;border:6px solid #f2c230;box-shadow:inset 0 0 0 3px #a86a08,inset 0 0 70px rgba(255,210,74,.6);animation:fadeIn .5s ease-out both');
  every(T,0,4250,60,()=>{money('bar');if(ch(.5))money('bar',{sz:rnd(18,24)})});
  T(3300,()=>{txt('VÀNG RÒNG 9999',50,15,'color:#fff3b0;font-size:min(8vw,44px);letter-spacing:3px;text-shadow:0 0 14px #ffd24a,3px 3px 0 #8a5a08','pop .4s ease-out both');
    for(let i=0;i<18;i++)money('bar',{x:W()/2+rnd(-40,40),y:Hh()*.5,vx:rnd(-8,8),vy:-rnd(6,13),g:.25,sz:rnd(16,22)})});
}});

/* ---------- Phi Hành Gia · Bộ đồ phóng tàu cam: đếm ngược 3-2-1, tên lửa phóng vút lên phía sau, khói lửa cam ---------- */
wrap('v_astro',{asOrange(T){
  const d=1.6*d5(),OR=['#ffb347','#ff6a3a','#fff3b0']; // d: cỡ ô của tên lửa (to hơn bé một chút)
  fxTint('linear-gradient(#04061a,#101a44 68%,#5a2a14)');
  ['3','2','1'].forEach((n,i)=>T(250+i*750,()=>{txt(n,50,15,'color:#ffb347;font-size:min(13vw,68px);text-shadow:0 0 16px #ff6a3a,3px 3px 0 #5a2a00','count .7s ease-out both');snd(t=>tone(660,t,.12,'square',.04))}));
  T(2500,()=>{txt('PHÓNG!',50,15,'color:#fff3b0;font-size:min(11vw,56px);letter-spacing:4px;text-shadow:0 0 16px #ff6a3a,3px 3px 0 #5a2a00','count .85s ease-out both');glide(90,420,.8,'sawtooth',.05);
    const a='position:absolute;',rk=el('left:80%;top:100%;width:'+10*d+'px;height:'+24*d+'px;margin-left:'+(-5*d)+'px;z-index:-1;animation:ri-launch .95s cubic-bezier(.5,0,.9,.6) both',
      '<div style="'+a+'left:0;top:'+12*d+'px;width:'+3*d+'px;height:'+7*d+'px;background:#f08a3a;clip-path:polygon(100% 0,100% 100%,0 100%)"></div><div style="'+a+'right:0;top:'+12*d+'px;width:'+3*d+'px;height:'+7*d+'px;background:#f08a3a;clip-path:polygon(0 0,100% 100%,0 100%)"></div>'+
      '<div style="'+a+'left:'+3*d+'px;top:'+17.5*d+'px;width:'+4*d+'px;height:'+7*d+'px;border-radius:0 0 50% 50%;background:linear-gradient(#fff3b0,#ffb347 40%,#ff6a3a 75%,transparent);transform-origin:50% 0;animation:flick .08s linear infinite alternate"></div>'+
      '<div style="'+a+'left:'+2.5*d+'px;top:0;width:'+5*d+'px;height:'+18*d+'px;border-radius:50% 50% 12% 12%/38% 38% 6% 6%;background:linear-gradient(90deg,#c8ccd8,#fff 45%,#a8aec0)"></div>'+
      '<div style="'+a+'left:'+2.5*d+'px;top:'+11*d+'px;width:'+5*d+'px;height:'+2*d+'px;background:#f08a3a"></div>'+
      '<div style="'+a+'box-sizing:border-box;left:'+3.6*d+'px;top:'+5*d+'px;width:'+2.8*d+'px;height:'+2.8*d+'px;border-radius:50%;background:#5ab4ff;border:'+.5*d+'px solid #6a7088"></div>');
    every(T,2500,3350,35,()=>{const r=rk.getBoundingClientRect();for(let i=0;i<2;i++)part({x:r.left+r.width/2+rnd(-2,2)*d,y:r.bottom,vx:rnd(-1.5,1.5),vy:rnd(2,5),life:rnd(18,34),col:pick(OR),sz:ch(.5)?4:8})})});
  T(3300,()=>boom(W()/2,Hh()*.52,30,OR,7));
}});

/* ---------- Hoàng Gia · Hoàng bào tím: thảm và nền chuyển tím, hai lá cờ đuôi nheo tím viền vàng buông xuống, hoa giấy tím ---------- */
wrap('v_royal',{ryPurple(T){
  const cp=[...$('gfx').children].find(e=>/unroll/.test(e.style.animation)),PP=['#b98bff','#7a3ad2','#e6c8ff'];
  fxTint('radial-gradient(circle,#3c1a66 0,#0e0518 75%)');
  if(cp)cp.style.background='linear-gradient(#8a4ad2,#3e1a8a)';
  T(900,()=>[24,76].forEach((x,i)=>el('left:'+x+'%;top:0;width:min(11vw,64px);height:34vh;margin-left:max(-5.5vw,-32px);z-index:-1;box-sizing:border-box;background:linear-gradient(#7a3ad2,#4a1a9a);border:3px solid #f2c230;border-top:0;clip-path:polygon(0 0,100% 0,100% 100%,50% 86%,0 100%);animation:drop .7s '+(i*.12)+'s cubic-bezier(.34,1.4,.64,1) both',
    '<div style="position:absolute;left:50%;top:44%;width:44%;aspect-ratio:1;transform:translate(-50%,-50%) rotate(45deg);background:#f2c230;box-shadow:0 0 8px #fff3b0"></div>')));
  every(T,900,3400,80,()=>rain(PP,2));
  T(2400,()=>{boom(W()/2,Hh()/2,30,PP.concat('#ffd24a'),7);sub('HOÀNG BÀO TÍM',87,'#ecdcff','#7a3ad2',1)});
}});
})();
