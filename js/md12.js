"use strict";
/* ============ TRẠNG THÁI ĐẶC TRƯNG 60 GIÂY CỦA 12 BÉ 5★ THÊM SAU ============
   Nối tiếp bảng MD trong ui.js (Zenitsu Thần tốc, Gojo Vô Hạn, Harry cưỡi chổi...). Diễn xong hành động riêng (chính, phụ alt, hoặc form của
   trang phục hiếm) thì bé vào trạng thái này trong 60 giây: e.fm = {t, key, aura, md}; hết giờ mã lõi tự cho nghỉ 90–180 giây (e.cd).
   Chỉ là hình: không cộng xu, không đổi chỉ số. File nạp sau ui.js, pack18.js, shrine.js, rare-room.js và chỉ gán thêm trường md vào S5.
   Phần hình chính vẽ thẳng trong under/over (vài ô và đạo cụ mỗi khung hình); hạt chỉ điểm thêm, mỗi bé dưới khoảng 8 hạt mỗi giây
   vì trạng thái kéo dài cả phút mà trần hạt của phòng là PMAX. Trang phục hiếm rẽ nhánh theo formOf(c) / c.coat. */
(()=>{
const TAU=6.283,hs=n=>{const s=Math.sin(n*127.1+31.7)*43758.5453;return s-Math.floor(s)};   // số ngẫu nhiên cố định theo mốc thời gian (không nhấp nháy mỗi khung)
const dir=e=>e.flip?1:-1,mov=e=>(e.state==='walk'||e.state==='run')&&!(e.pre>0),rd=v=>Math.round(v*2)/2,gnd=p=>p.gy||p.y;
const side=p=>/^(stand|walk|run|crouch|leap|land)/.test(p.pose||'sit');                      // sprite nhìn ngang (đầu ở phía trước) hay ngồi nhìn thẳng

/* ---------- đạo cụ nhỏ (bảng PROP của pack18.js nằm trong phạm vi riêng nên ở đây có bản gọn) ---------- */
const INK=[70,52,60],WHT=[255,255,255],GOLD=[242,201,74],GOLDD=[201,150,42],SIL=[217,222,232],SILD=[164,173,190];
const dogD=(C,E)=>b=>{b.ell(7,6.6,5,2.8,C);b.ell(12.4,4.4,2.8,2.5,C);b.tri(11,2.4,11.6,.4,12.8,2.2,C);b.tri(13,2.2,14,.6,14.6,2.8,C);b.rect(3,8.4,1.4,2.4,C);b.rect(5.6,8.6,1.4,2.2,C);b.rect(8.6,8.6,1.4,2.2,C);b.rect(10.8,8.4,1.4,2.4,C);b.cap(2.2,5.6,.8,3,.7,C);b.set(13,4,E,'x')};
const starD=C=>b=>{b.tri(4.5,.4,2.6,5,6.4,5,C);b.tri(.4,3.4,8.6,3.4,4.5,6.4,C);b.tri(2,8.4,2.8,4.6,5,6,C);b.tri(7,8.4,6.2,4.6,4,6,C)};
const bowD=(C,D)=>b=>{b.tri(8,5,1,1,1,9,C);b.tri(8,5,15,1,15,9,C);b.ell(8,5,2,2,D)};
const batD=P=>(b,f)=>{if(f){b.tri(5,3,.6,6.4,3,1.8,P);b.tri(7,3,11.4,6.4,9,1.8,P)}else{b.tri(5,3,.4,.8,2.6,6,P);b.tri(7,3,11.6,.8,9.4,6,P)}b.ell(6,3.6,1.7,2.1,P);b.tri(5,2,5.2,.6,6,1.8,P);b.tri(7,2,6.8,.6,6,1.8,P)};
const P12={
  star:{w:9,h:9,d:starD(GOLD)},starW:{w:9,h:9,ol:[150,120,60],d:starD([255,252,240])},
  cupW:{w:14,h:14,d:b=>{b.ell(7,4.6,4.4,3.6,SIL);b.rect(2.6,1.2,8.8,1.8,SIL);b.cap(2.2,3,1,5.4,.6,SILD);b.cap(1,5.4,3.6,7,.6,SILD);b.cap(11.8,3,13,5.4,.6,SILD);b.cap(13,5.4,10.4,7,.6,SILD);b.rect(6,8,2,2.6,SILD);b.rect(4,10.6,6,1.4,SIL);b.rect(3,12,8,1.6,SILD);b.rect(4.6,2.8,1,3,WHT,'x')}},
  dogW:{w:16,h:11,d:dogD([238,238,240],INK)},
  dogX:{w:20,h:14,ol:[96,14,28],d:b=>{const C=[24,20,30],RED=[240,40,50];b.ell(8.6,8.4,6.2,3.4,C);b.ell(15.4,5.6,3.4,3,C);b.tri(13.6,3.2,14.2,.2,15.8,2.8,C);b.tri(16,2.8,17.6,.4,18.2,3.8,C);
    b.rect(17,5.6,2.8,1.8,C);b.rect(16.4,8.6,3,1,C);b.rect(17.4,7.4,.6,1.2,WHT,'x');b.rect(18.6,7.4,.6,1.2,WHT,'x');
    b.rect(3.6,10.6,1.8,3.2,C);b.rect(6.8,10.8,1.8,3,C);b.rect(10.6,10.8,1.8,3,C);b.rect(13,10.6,1.8,3.2,C);b.cap(2.6,7,.8,2.6,.9,C);
    b.tri(5,5.8,6,2.8,7,5.4,C);b.tri(8,5.2,9,2.2,10,5.2,C);b.tri(11,5.4,12,3,12.8,5.6,C);b.rect(15.4,4.6,1.8,1,RED,'x');b.rect(6,8,5,.8,[86,22,38],'x')}},
  tiger:{w:16,h:14,d:b=>{const O=[240,150,60],K=[70,44,40];b.tri(2,6,2.4,1,6,3.6,O);b.tri(14,6,13.6,1,10,3.6,O);b.ell(8,8,6.2,5,O);b.ell(8,10.4,3,2.2,[252,240,224]);b.rect(7.4,3,1.2,2.6,K,'x');b.rect(5,3.6,1,2,K,'x');b.rect(10,3.6,1,2,K,'x');b.rect(2,8,2,1,K,'x');b.rect(12,8,2,1,K,'x');b.rect(5,7,1.6,1.2,[255,230,120],'x');b.rect(9.4,7,1.6,1.2,[255,230,120],'x');b.set(8,10,K,'x')}},
  // hổ của Lee Sin: lông trắng xanh, vằn đỏ, mắt đỏ
  tigerX:{w:16,h:14,ol:[52,70,120],d:b=>{const O=[214,232,250],K=[196,44,64];b.tri(2,6,2.4,1,6,3.6,O);b.tri(14,6,13.6,1,10,3.6,O);b.ell(8,8,6.2,5,O);b.ell(8,10.4,3,2.2,WHT);b.rect(7.4,3,1.2,2.6,K,'x');b.rect(5,3.6,1,2,K,'x');b.rect(10,3.6,1,2,K,'x');b.rect(2,8,2,1,K,'x');b.rect(12,8,2,1,K,'x');b.rect(5,7,1.6,1.2,[255,96,110],'x');b.rect(9.4,7,1.6,1.2,[255,96,110],'x');b.set(8,10,[60,70,110],'x')}},
  shield:{w:9,h:10,ol:[150,104,30],d:b=>{b.rect(1,1,7,4.4,GOLD);b.tri(1,5,8,5,4.5,9.4,GOLD);b.rect(2.2,2.2,4.6,2.6,[255,244,200],'x');b.rect(4,2,1,4.4,[224,48,66],'x');b.rect(2.6,3.4,3.8,1,[224,48,66],'x')}},
  meep:{w:7,h:7,d:b=>{b.ell(3.5,3.8,2.8,2.8,[250,240,214]);b.set(2,3,[90,200,224],'x');b.set(4,3,[90,200,224],'x');b.tri(2.6,1.6,3.5,.2,4.4,1.6,[199,164,97])}},
  heart:{w:12,h:11,d:b=>{const R=[224,48,66];b.ell(3.6,3.6,3,3,R);b.ell(8.4,3.6,3,3,R);b.tri(.8,5,11.2,5,6,10.6,R);b.rect(2.4,2.4,1.2,1.2,[255,170,180],'x')}},
  heartP:{w:12,h:11,ol:[190,90,130],d:b=>{const R=[255,150,186];b.ell(3.6,3.6,3,3,R);b.ell(8.4,3.6,3,3,R);b.tri(.8,5,11.2,5,6,10.6,R);b.rect(2.4,2.4,1.2,1.2,WHT,'x')}},
  bow:{w:16,h:10,d:bowD([223,38,60],[168,24,44])},bowP:{w:16,h:10,d:bowD([237,152,183],[210,112,143])},
  apple:{w:8,h:9,d:b=>{b.ell(4,5.6,3.3,2.9,[226,52,58]);b.rect(3.6,1.4,.9,1.8,[122,84,62]);b.ell(5.6,1.8,1.3,.8,[110,190,96]);b.set(2,4,[255,170,170],'x')}},
  berry:{w:8,h:9,d:b=>{const R=[236,62,84];b.ell(4,4.2,3.2,2.2,R);b.tri(.8,4.4,7.2,4.4,4,8.8,R);b.rect(1.6,1.2,4.8,1.4,[110,190,96]);b.rect(3.6,.2,.9,1.2,[80,150,76]);[[2,4],[5,4],[3,6],[5,6]].forEach(q=>b.set(q[0],q[1],[255,236,150],'x'))}},
  skull:{w:10,h:9,d:b=>{const P=[242,162,210];b.ell(5,3.8,4,3.4,P);b.rect(3,6,4,2.2,P);b.rect(2.6,3,1.6,1.8,INK,'x');b.rect(5.8,3,1.6,1.8,INK,'x');b.set(4,6,INK,'x')}},
  bat:{w:12,h:7,ol:[136,96,190],d:batD([58,36,80])},batX:{w:12,h:7,ol:[150,90,220],d:batD([30,18,44])},
  moonP:{w:14,h:14,d:b=>{for(let y=0;y<14;y+=.5)for(let x=0;x<14;x+=.5){const a=Math.hypot(x-7,y-7),c=Math.hypot(x-10,y-5.6);if(a<=6.2&&c>5)b.rect(x,y,.5,.5,[185,139,255])}}},
  donut:{w:12,h:12,d:b=>{b.ell(6,6.4,5.4,5,[200,138,84]);b.ell(6,5.6,5,4.4,[245,154,181]);b.ell(6,6,1.6,1.4,[122,84,62],'x');[[3,4,[255,255,255]],[8,3,[140,196,255]],[9,7,[255,226,122]],[3,8,[140,220,160]],[6,9,[255,255,255]]].forEach(q=>b.set(q[0],q[1],q[2],'x'))}},
  cookie:{w:10,h:10,d:b=>{b.ell(5,5,4.3,4.3,[222,170,104]);[[3,3],[6,3],[4,5],[7,6],[3,7],[5,7]].forEach(q=>b.set(q[0],q[1],[110,70,46],'x'))}},
  cupcake:{w:10,h:11,d:b=>{b.tri(1.6,6,8.4,6,5,13,[255,187,210]);b.rect(1.6,6,6.8,1,[255,187,210]);b.ell(5,4.8,3.8,2.4,[255,250,240]);b.ell(5,2.8,2.4,1.8,[255,250,240]);b.ell(5,1.4,1.2,1.2,[224,48,66])}},
  cake:{w:12,h:11,d:b=>{[[255,143,163],[255,179,122],[255,226,122],[143,214,160],[127,183,255],[185,139,255]].forEach((c,i)=>b.rect(1,3+i*1.2,10,1.2,c));b.ell(6,3,5,1.4,[255,250,240]);b.set(6,1,[224,48,66],'x')}},
  rose:{w:9,h:10,d:b=>{const R=[232,96,140],D=[190,56,100];b.rect(4,6,1,3.6,[80,150,76]);b.ell(6.4,7.6,1.5,.9,[110,190,96]);b.ell(4.5,3.8,3.5,3.3,R);b.ell(4.5,3.8,1.8,1.6,D,'x');b.set(4,3,[255,190,210],'x');b.set(2,3,[255,170,196],'x')}},
  box:{w:20,h:13,d:b=>{const C=[206,164,112],D=[168,124,78];b.rect(1.4,3.4,17.2,9,C);b.tri(1.4,3.4,.2,.8,6,3.4,D);b.tri(18.6,3.4,19.8,.8,14,3.4,D);b.rect(9.2,3.4,1.6,9,[232,206,160],'x');b.rect(1.4,3.4,17.2,1,D,'x')}},
  // rương thám hiểm mở nắp (bản hiếm của hộp giấy)
  chest:{w:20,h:13,d:b=>{const C=[150,98,58],D=[110,70,40];b.rect(1.4,3.4,17.2,9,C);b.rect(1.4,3.4,17.2,1.4,GOLD,'x');b.rect(1.4,7.6,17.2,1,D,'x');b.rect(8.8,4.8,2.4,3.2,GOLD,'x');b.rect(9.4,5.6,1.2,1.2,INK,'x');b.rect(1.4,11.4,17.2,1,D,'x');b.rect(1.4,3.4,1.4,9,D,'x');b.rect(17.2,3.4,1.4,9,D,'x')}},
};
const PC={};
function pcv(name,f){const q=fk(BS),key=name+'|'+(f||0)+'|'+q;if(PC[key])return PC[key];const P=P12[name],b=new Art.Buf(P.w,P.h);P.d(b,f||0);b.pastel(.05);b.shade(.13);b.outline(P.ol||[112,74,52]);return PC[key]=bufCanvas(b,q)}
// tâm ngang x, tâm dọc y (ô thế giới). o: f khung, s cỡ, a độ mờ, flip
function pa(g,name,x,y,o){
  o=o||{};const P=P12[name],cv=pcv(name,o.f),s=o.s||1,w=P.w*s,h=P.h*s,px=Math.round((x-w/2)*ZC)/ZC,py=Math.round((y-h/2)*ZC)/ZC;
  if(o.a!=null){if(o.a<=0)return;g.globalAlpha=Math.min(1,o.a)}
  if(o.flip){g.save();g.translate(px+w,py);g.scale(-1,1);g.drawImage(cv,0,0,w,h);g.restore()}else g.drawImage(cv,px,py,w,h);
  g.globalAlpha=1;
}
// các món xoay quanh bé: nửa vòng phía sau vẽ trước sprite (front=false), nửa phía trước vẽ đè lên. q: r, ry bán kính, cy độ cao tâm, sp tốc độ, bob độ nhún
function ring(g,e,p,items,front,q){
  const n=items.length,t=e.wt*(q.sp||1.4);
  for(let i=0;i<n;i++){const a=t+i*TAU/n,z=Math.sin(a);if((z>=0)!==front)continue;const it=items[i];
    pa(g,it.n,p.x+Math.cos(a)*(q.r||20),p.y-(q.cy||18)+z*(q.ry||7)+(q.bob?Math.sin(e.wt*3+i*1.7)*q.bob:0),{s:(it.s||1)*(.92+.08*z),f:it.f?it.f(e,i):0,flip:it.flip&&Math.cos(a)>0})}
}
// vật chạy theo sau bé (chó ngọc, hổ khí, bướm): nhớ vị trí trong e[key], mỗi khung hình trượt dần về điểm đích
function follow(e,key,tx,ty,rate){
  let f=e[key];if(!f||Math.abs(f.x-tx)>90||Math.abs(f.y-ty)>70)f=e[key]={x:tx,y:ty,fl:e.flip,m:0};
  const k=Math.min(1,FDT*rate),ox=f.x;f.x+=(tx-f.x)*k;f.y+=(ty-f.y)*k;const v=(f.x-ox)/Math.max(FDT,.001);f.m=Math.abs(v)>4?1:0;f.fl=f.m?v>0:e.flip;return f;
}
// các bé đứng gần thả tim (như Hoàng Gia)
const love=(e,r)=>{if(on(.6)){const o=ents.find(o=>o!==e&&!o.clone&&!o.ghost&&Math.hypot(o.x-e.x,o.y-e.y)<r&&!(o.emoT>0));if(o)o.emoT=1.4}};
// ngọn lửa nhỏ bập bùng: C = [viền, thân, lõi]
function flame(g,x,y,ph,C,a){
  const f=Math.floor(ph*11),top=hs(f)<.5?7:8,sw=hs(f+3)<.5?-1:0;x=Math.round(x);y=Math.round(y);g.globalAlpha=a||1;
  for(let pass=0;pass<2;pass++){g.fillStyle=C[pass];
    for(let r=pass;r<=top-pass;r++){const w=FLW[r+(8-top)]-pass*2;if(w<=0)continue;const ox=r>3?sw*(r>5?1:.5):0;g.fillRect(x-w/2+ox,y+2-r,w,1)}}   // hình giọt lửa: đáy tròn, ngọn thuôn và lắc lư
  g.fillStyle=C[2];g.fillRect(x-1,y,2,2);g.fillRect(x-.5,y-2,1,2);g.globalAlpha=1;
}
const FLW=[5,7,7,6,5,4,3,2,1];
// ngọn lửa chú lực lớn của Itadori: ba lớp đen, đỏ, hồng lồng nhau, cao khoảng 15 ô, ngọn lắc lư và có hai lưỡi lửa phụ tách ra hai bên
function bigFlame(g,x,y,ph){
  const f=Math.floor(ph*10),sw=(hs(f)-.5)*3,sw2=(hs(f+5)-.5)*2,h=14+Math.round(hs(f+2)*3);x=Math.round(x);y=Math.round(y);
  const lay=(c,w0,hh,dx)=>{g.fillStyle=c;for(let r=0;r<hh;r++){const u=r/hh,w=Math.max(1,Math.round(w0*(u<.25?.7+1.2*u:1-(u-.25)/.75*.92)));g.fillRect(Math.round(x+dx+sw*u*u+sw2*Math.sin(u*5)-w/2),y-r,w,1)}};
  g.globalAlpha=.95;lay('#16080c',9,h,0);lay('#16080c',4,Math.round(h*.6),-4.5);lay('#16080c',4,Math.round(h*.5),4.5);
  lay('#e0283a',6,Math.round(h*.74),0);lay('#ff7a86',3,Math.round(h*.42),0);g.fillStyle='#ffe0e4';g.fillRect(x-1,y-2,2,2);g.globalAlpha=1;
}
// dải nước / dải lửa của Tanjiro: đứng yên thì cuộn xoắn quanh thân, di chuyển thì uốn sóng kéo dài phía sau. C = [viền, thân, bọt/lưỡi lửa]
function ribbon(g,e,p,C,front,fire){
  const t=e.wt,d=dir(e),mv=mov(e),N=30,ft=Math.floor(t*10);
  for(let pass=0;pass<3;pass++){g.fillStyle=C[pass];
    for(let i=0;i<N;i++){const u=i/(N-1);let x,y,z;
      if(mv){const a=t*9-u*6;x=p.x-d*(5+u*36);y=p.y-13+Math.sin(a)*(1.5+4.5*u);z=1}
      else{const a=t*2.8-u*4.8;x=p.x+Math.cos(a)*(19-3*u);y=p.y-4-u*19+Math.sin(a)*4.5;z=Math.sin(a)}
      if((z>=0)!==front)continue;
      const w=.8+2.7*Math.pow(Math.sin(Math.PI*Math.min(1,u*1.08+.07)),.7);
      if(pass===0)g.fillRect(rd(x-w/2-.5),rd(y-w/2-.5),w+1,w+1);
      else if(pass===1)g.fillRect(rd(x-w/2),rd(y-w/2),w,w);
      else if(fire){if(i%2===0){const h=1+Math.floor(hs(i+ft)*3);g.fillRect(rd(x),rd(y-w/2-h+.5),1,h)}}
      else if(i%3===0)g.fillRect(rd(x-.5),rd(y-w/2),1.5,1);
    }}
  if(front){const u=.07,a=mv?t*9:t*2.8;                                                  // đầu sóng: mảng bọt trắng (hoặc lõi lửa sáng) ở đầu dải
    const hx=mv?p.x-d*5:p.x+Math.cos(a)*19,hy=mv?p.y-13+Math.sin(a)*1.5:p.y-4+Math.sin(a)*4.5;
    if(mv||Math.sin(a)>=0){g.fillStyle=C[2];g.fillRect(rd(hx-1),rd(hy-1),2,2)}}
}
let boxRare=0;                                                                            // hộp của Chi: under() ghi lại bé đang vẽ có mang trang phục hiếm không, ride.cv đọc ngay sau đó
const NOTE=["..##","..#.","..#.","###.","###."];
function note(g,x,y,col,edge,a){
  x=Math.round(x);y=Math.round(y);g.globalAlpha=a;
  g.fillStyle=edge;NOTE.forEach((r,j)=>{for(let i=0;i<4;i++)if(r[i]==='#')g.fillRect(x+i-.5,y+j-.5,2,2)});
  g.fillStyle=col;NOTE.forEach((r,j)=>{for(let i=0;i<4;i++)if(r[i]==='#')g.fillRect(x+i,y+j,1,1)});g.globalAlpha=1;
}
function butterfly(g,x,y,t,C){
  x=Math.round(x);y=Math.round(y);const o=Math.floor(t*9)%2;
  g.fillStyle=C[1];if(o){g.fillRect(x-3,y-2,3,2);g.fillRect(x+1,y-2,3,2);g.fillRect(x-2,y,2,2);g.fillRect(x+1,y,2,2)}else{g.fillRect(x-1,y-3,1,3);g.fillRect(x+1,y-3,1,3);g.fillRect(x-1,y,1,2);g.fillRect(x+1,y,1,2)}
  g.fillStyle=C[0];if(o){g.fillRect(x-2,y-1,1,1);g.fillRect(x+2,y-1,1,1)}
  g.fillStyle='#4a3a3a';g.fillRect(x,y-2,1,4);
}

const MD12={
  // Tanjiro: Hơi thở của Nước, dải nước cuộn quanh thân rồi uốn theo sau khi di chuyển. Điệu múa Hỏa Thần: dải lửa
  v_tanjiro:{n:'Hơi thở của Nước',sp:1.15,run:.4,
    under(g,e,p,c){const f=formOf(c);ribbon(g,e,p,f?TJF:TJW,false,f)},
    over(g,e,p,c){const f=formOf(c);ribbon(g,e,p,f?TJF:TJW,true,f)},
    fx(e,p,c){const f=formOf(c),d=dir(e),m=mov(e);
      if(f){if(on(4))rp(p.x+(m?-d*rnd(8,36):rnd(-16,16)),p.y-rnd(6,26),pick(['#ff9a2a','#ffd24a']),{vy:-rnd(14,30),life:rnd(.3,.5)})}
      else if(on(5))rp(p.x+(m?-d*rnd(8,36):rnd(-17,17)),p.y-rnd(6,24),pick(['#bfe2ff','#ffffff','#5aa9ff']),{vy:rnd(6,16),g:70,gy:e.y-1,life:rnd(.4,.6)})}},
  // Itadori: Chú lực bọc hai nắm đấm, chạy nhanh hơn, thỉnh thoảng lóe tia Hắc Thiểm. Sukuna chiếm xác: các vệt chém nhỏ quanh thân, vũng đỏ dưới chân
  v_itadori:{n:'Chú lực bùng phát',sp:1.35,run:.6,
    under(g,e,p,c){if(formOf(c))glowAt(g,p.x,gnd(p)-1,19+Math.sin(e.wt*3),4.6,'#5a0612',.5)},
    over(g,e,p,c){const t=e.wt,d=dir(e);
      if(formOf(c)){                                                                        // ba vệt chém so le, mỗi vệt quét nhanh rồi mờ
        for(let k=0;k<3;k++){const s=t/.5+k/3,n=Math.floor(s),q=s-n,id=n*3+k;if(q>.62)continue;
          const a=hs(id)*TAU,len=10+hs(id+1)*9,cx=p.x+(hs(id+2)-.5)*34,cy=p.y-17+(hs(id+3)-.5)*30,L=len*Math.min(1,q/.16),f=1-Math.max(0,(q-.16)/.46),dx=Math.cos(a),dy=Math.sin(a),x0=cx-dx*len/2,y0=cy-dy*len/2;
          g.globalAlpha=.75*f;g.strokeStyle='#8a0e1c';g.lineWidth=2;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+dx*L,y0+dy*L);g.stroke();
          g.globalAlpha=f;g.strokeStyle='#ffffff';g.lineWidth=.7;g.beginPath();g.moveTo(x0,y0);g.lineTo(x0+dx*L,y0+dy*L);g.stroke()}
        g.globalAlpha=1;
      }else{const F=side(p)?[[d*12,-5+Math.sin(t*9)],[d*5,-4-Math.sin(t*9)]]:[[-6,-5],[6,-5]];
        F.forEach((q,i)=>{glowAt(g,p.x+q[0],p.y+q[1]-5,9,10,'#e0283a',.3+.08*Math.sin(t*8+i));bigFlame(g,p.x+q[0],p.y+q[1]+1,t+i*.37)})}},
    fx(e,p,c){const d=dir(e);
      if(formOf(c)){if(on(3))rp(p.x+rnd(-16,16),p.y-rnd(2,30),pick(['#e0283a','#ffb0b0','#3a0308']),{vx:rnd(-14,14),vy:-rnd(4,16),life:rnd(.25,.45)})}
      else{if(on(2.2))rp(p.x+(side(p)?d*10:rnd(-6,6)),p.y-rnd(4,10),pick(['#0a0a0a','#e0283a']),{sh:'bolt',pts:zig(ch(.5)?1:-1,rnd(7,11),3,5),life:.1});
        if(on(4))rp(p.x+(side(p)?d*rnd(4,12):rnd(-7,7)),p.y-rnd(4,9),pick(['#e0283a','#1a0a10']),{vy:-rnd(12,26),life:rnd(.25,.4)})}}},
  // Fushiguro: Thập Chủng Ảnh Pháp, bóng đen loang rộng dưới chân, Ngọc Khuyển trắng chạy theo. Vật chứa Sukuna: sói đen mắt đỏ, bóng ánh đỏ
  v_fushiguro:{n:'Thập Chủng Ảnh Pháp',
    under(g,e,p,c){const R=formOf(c),t=e.wt,y=gnd(p)-1,w=23+2*Math.sin(t*2.2);
      glowAt(g,p.x,y,w,6,R?'#1a060c':'#0b0a14',.5);glowAt(g,p.x,y,w*.62,3.6,R?'#3a0a16':'#17152a',.5);
      g.fillStyle=R?'rgba(58,10,22,.6)':'rgba(16,14,30,.6)';for(let i=0;i<6;i++){const a=i*1.047+t*.5,r=1+.12*Math.sin(t*3+i*2);g.fillRect(rd(p.x+Math.cos(a)*w*r-1),rd(y+Math.sin(a)*6*r-.5),2.5,1)}   // rìa bóng lăn tăn
      const f=follow(e,'m12d',p.x-dir(e)*(R?25:22),gnd(p)+1.5,3.2);f.dr=R?'dogX':'dogW';glowAt(g,f.x,f.y-.5,R?9:7,2,'#0b0a14',.4)},
    over(g,e,p){const f=e.m12d;if(f)pa(g,f.dr,f.x,f.y-(f.dr==='dogX'?7:5.5)-(f.m?Math.abs(Math.sin(e.wt*11))*2.2:0),{flip:!f.fl})},
    fx(e,p,c){if(on(4))rp(p.x+rnd(-20,20),gnd(p)-rnd(0,3),formOf(c)?pick(['#3a0a16','#87182e']):pick(['#15151f','#2a2740']),{vy:-rnd(5,12),life:rnd(.4,.7),sz:2,a:.6})}},
  // Chi: mê hộp giấy, di chuyển thì ngồi trong hộp trượt đi đuổi theo bướm vàng. Thám Hiểm: rương gỗ và bướm xanh
  v_chi:{n:'Hộp giấy đuổi bướm',sp:1.25,run:.7,ride:{cv:()=>pcv(boxRare?'chest':'box'),w:20,h:13,off:10,dy:-9,lift:2},
    under(g,e,p,c){boxRare=formOf(c)?1:0;const d=dir(e),t=e.wt,m=mov(e);
      follow(e,'m12b',m?p.x+d*(21+3*Math.sin(t*2.3)):p.x+Math.cos(t*1.2)*19,m?p.y-25+5*Math.sin(t*3.1):p.y-27+6*Math.sin(t*2.4),m?9:3)},
    over(g,e,p,c){const f=e.m12b;if(f)butterfly(g,f.x,f.y+Math.sin(e.wt*13),e.wt,formOf(c)?['#bfe8ff','#3a9af0']:['#fff3a0','#f2b430'])},
    fx(e,p,c){const f=e.m12b;if(f&&on(3))rp(f.x+rnd(-2,2),f.y+2,formOf(c)?'#bfe8ff':'#fff08c',{vy:rnd(4,10),life:.5});
      if(p.ride&&e.state==='run'&&on(6))rp(p.x-dir(e)*rnd(9,13),e.y-1,'#d8c8b0',{vx:-dir(e)*rnd(6,18),vy:-rnd(4,12),g:30,life:.35,sz:2})}},
  // Faker: Quỷ Vương Bất Tử, sáu ngôi sao vô địch xoay chậm trên đầu, đi thong thả. White Legacy: sao trắng và cúp nhỏ; Ahri: sáu đốm hồ ly hỏa
  v_faker:{n:'Sáu sao Quỷ Vương',sp:.8,
    under(g,e,p,c){fkStars(g,e,p,c,false)},
    over(g,e,p,c){fkStars(g,e,p,c,true);if(c.coat==='fkWhite2026')pa(g,'cupW',p.x,p.y-58+Math.sin(e.wt*2),{s:.7})},
    fx(e,p,c){if(on(3))rp(p.x+rnd(-18,18),p.y-rnd(26,42),c.coat==='fkAhriHall'?pick(['#ff6a7a','#ffd98a']):pick(['#f6d987','#ffffff']),{sh:'star',life:.5})}},
  // Oner: hổ khí hiện sau lưng, chạy khắp phòng. Lee Sin Quyền Vương: bạch hổ vằn đỏ với khí hồng lam
  v_oner:{n:'Hổ khí',sp:1.4,run:.7,
    under(g,e,p,c){const R=formOf(c),t=e.wt,d=dir(e),f=follow(e,'m12t',p.x-d*(side(p)?19:16),p.y-(side(p)?22:25)+Math.sin(t*2.6)*1.5,7),s=R?1.7:1.5;
      glowAt(g,f.x,f.y,13*s/1.5,12*s/1.5,R?'#5aa9ff':'#ff8a2a',.2+.05*Math.sin(t*5));
      const C=R?ONX:ONC;[-9,-3,4,9].forEach((o,i)=>flame(g,f.x+o*s/1.5,f.y-8*s/1.5+(i%3?1:-1),t+i*.23,C,.75));
      pa(g,R?'tigerX':'tiger',f.x,f.y,{s,a:.74+.08*Math.sin(t*4)})},
    fx(e,p,c){const R=formOf(c),f=e.m12t;if(f&&on(4))rp(f.x+rnd(-10,10),f.y-rnd(4,14),R?pick(['#ff5a8a','#5aa9ff']):pick(['#ff7a2a','#ffd24a']),{vy:-rnd(12,26),life:rnd(.3,.5),sz:ch(.4)?2:1});
      if(e.state==='run'&&on(4))rp(p.x+rnd(-12,12),p.y-rnd(4,24),'#fff3d0',{sh:'line',len:rnd(6,11),bd:e.flip?-1:1,life:.2})}},
  // Keria: ba tấm khiên hỗ trợ xoay quanh trong vòng bảo hộ, các bé đứng gần thả tim. Bard: ba linh thể Meep và vòng ngân hà xanh
  v_keria:{n:'Khiên hộ vệ',
    under(g,e,p,c){const R=formOf(c),C=R?'#7fd8e4':'#f6d987';glowAt(g,p.x,p.y-17,22,23,C,.1+.03*Math.sin(e.wt*3));ring(g,e,p,R?KRB:KRS,false,KRQ)},
    over(g,e,p,c){const R=formOf(c);g.globalAlpha=.5+.15*Math.sin(e.wt*3);g.strokeStyle=R?'#7fd8e4':'#e8c460';g.lineWidth=.8;g.beginPath();g.ellipse(p.x,p.y-17,22,23,0,0,TAU);g.stroke();g.globalAlpha=1;ring(g,e,p,R?KRB:KRS,true,KRQ)},
    fx(e,p,c){love(e,50);if(on(2.5))rp(p.x+rnd(-10,10),p.y-rnd(30,38),formOf(c)?'#7fd8e4':'#ff8fa3',{sh:formOf(c)?'star':'heart',vy:-8,life:.7})}},
  // Hackclaw: ngụy trang quang học, thân chập chờn lúc ẩn lúc hiện, khung ngắm và các vạch nhiễu. Mặc Ảnh: nhiễu đen trắng và vũng mực
  v_hackclaw:{n:'Ngụy trang quang học',sp:1.1,run:.3,
    alpha:e=>{const h=hs(Math.floor(e.wt*8));return h>.85?.9:h<.14?.1:.34+.08*Math.sin(e.wt*5)},
    under(g,e,p,c){if(formOf(c)){const y=gnd(p)-1;glowAt(g,p.x,y,17,4.2,'#14141a',.5);glowAt(g,p.x-13,y+1.5,4,1.4,'#14141a',.5);glowAt(g,p.x+14,y-1,3,1.2,'#14141a',.5)}},
    over(g,e,p,c){const R=formOf(c),t=e.wt,A=R?'#f0eeea':'#67e5be',B=R?'#1b1b20':'#2a8f73',n=Math.floor(t*8);
      for(let k=0;k<4;k++){const id=n*5+k*17;if(hs(id)<.45)continue;const w=5+hs(id+1)*13,x=p.x-15+hs(id+2)*(30-w),y=p.y-34+Math.floor(hs(id+3)*32);       // vạch nhiễu ngang
        g.globalAlpha=.75;g.fillStyle=k%2?B:A;g.fillRect(Math.round(x),y,Math.round(w),1);if(hs(id+4)>.6){g.fillStyle=A;g.fillRect(Math.round(x+w),y-1,2,2)}}
      const s=15+Math.sin(t*4),cy=p.y-17,L=4;g.globalAlpha=.7;g.fillStyle=A;                                                                                 // bốn góc khung ngắm
      [[-1,-1],[1,-1],[-1,1],[1,1]].forEach(q=>{const x=Math.round(p.x+q[0]*s),y=Math.round(cy+q[1]*(s+3));g.fillRect(q[0]<0?x:x-L+1,y,L,1);g.fillRect(x,q[1]<0?y:y-L+1,1,L)});
      const sy=p.y-36+(t*26)%38;g.globalAlpha=.3;g.fillRect(Math.round(p.x-s),Math.round(sy),Math.round(s*2),1);g.globalAlpha=1},                             // vạch quét chạy dọc thân
    fx(e,p,c){if(on(4))rp(p.x+rnd(-13,13),p.y-rnd(2,32),formOf(c)?pick(['#1b1b20','#e6e3e0']):pick(['#67e5be','#2a8f73','#ffffff']),{vy:-rnd(4,14),life:.3,sz:2})}},
  // Hello Kitty: nơ đỏ, trái tim và táo bay quanh, các bé đứng gần thả tim. Công Chúa Dâu Tây: nơ hồng và dâu tây
  v_hellokitty:{n:'Vòng nơ yêu thương',
    under(g,e,p,c){ring(g,e,p,formOf(c)?HKB:HKA,false,HKQ)},
    over(g,e,p,c){ring(g,e,p,formOf(c)?HKB:HKA,true,HKQ)},
    fx(e,p,c){love(e,54);if(on(3))rp(p.x+rnd(-14,14),p.y-rnd(26,40),formOf(c)?'#ffbbd2':'#ff9db5',{sh:'heart',vy:-9,life:.8})}},
  // Kuromi: đêm tinh nghịch, hai chú dơi vỗ cánh và đầu lâu hồng xoay quanh. Nữ Hoàng Hắc Nguyệt: thêm vầng trăng tím sau lưng, dơi viền tím
  v_kuromi:{n:'Đêm tinh nghịch',
    under(g,e,p,c){const R=formOf(c);glowAt(g,p.x,gnd(p)-1,19,4.6,'#3a1a5a',.34+.06*Math.sin(e.wt*3));
      if(R){const x=p.x-dir(e)*11,y=p.y-37+Math.sin(e.wt*1.6);glowAt(g,x,y,10,10,'#b98bff',.2);pa(g,'moonP',x,y,{flip:e.flip})}
      ring(g,e,p,R?KMB:KMA,false,KMQ)},
    over(g,e,p,c){ring(g,e,p,formOf(c)?KMB:KMA,true,KMQ)},
    fx(e,p,c){if(on(3))rp(p.x+rnd(-17,17),p.y-rnd(4,38),pick(['#b98bff','#f2a2d2']),{sh:'star',life:.5})}},
  // Pusheen: tiệc ngọt, donut, bánh quy và cupcake trôi quanh, đi lững thững. Kỳ Lân: thêm bánh kem cầu vồng và sao bảy màu
  v_pusheen:{n:'Tiệc ngọt',sp:.7,
    under(g,e,p,c){ring(g,e,p,formOf(c)?PSB:PSA,false,PSQ)},
    over(g,e,p,c){ring(g,e,p,formOf(c)?PSB:PSA,true,PSQ)},
    fx(e,p,c){if(formOf(c)){if(on(4))rp(p.x+rnd(-20,20),p.y-rnd(4,38),pick(RBW),{sh:'star',life:.6})}
      else if(on(3))rp(p.x+rnd(-18,18),p.y-rnd(10,30),pick(['#d69c60','#fae4b4','#f59ab5']),{vy:rnd(8,18),g:60,gy:e.y-1,life:.7})}},
  // Marie: tiểu thư Paris, ba nốt nhạc bay lên theo sau và cánh hoa hồng rơi, bước đi ngẩng cao đầu. Vũ Hội Paris: nốt vàng và hai đóa hồng xoay quanh
  v_marie:{n:'Khúc nhạc tiểu thư',sp:.85,
    tilt:e=>mov(e)?(e.flip?-.07:.07):0,
    under(g,e,p,c){if(formOf(c))ring(g,e,p,MRR,false,MRQ)},
    over(g,e,p,c){const R=formOf(c),t=e.wt,d=dir(e);if(R)ring(g,e,p,MRR,true,MRQ);
      for(let i=0;i<3;i++){const ph=(t*.36+i/3)%1,x=p.x-d*(9+ph*15)+Math.sin(ph*9+i*2)*2.5,y=p.y-22-ph*24;note(g,x,y,R?(i%2?'#fff3b0':'#f2c230'):(i%2?'#ffffff':'#ffd6e4'),R?'#9a6a14':'#c2507e',Math.min(1,Math.sin(Math.PI*ph)*1.6))}},
    fx(e,p,c){if(on(4))rp(p.x+rnd(-18,18),p.y-rnd(26,42),pick(formOf(c)?['#f5b8d1','#ffffff','#e8608c']:['#ed98b7','#ffd6e0','#e8608c']),{vx:rnd(-6,6),vy:rnd(8,18),life:rnd(.7,1),sz:2});
      if(formOf(c)&&on(2))rp(p.x+rnd(-16,16),p.y-rnd(8,38),'#fff3b0',{sh:'star',life:.5})}},
};
/* ---------- bảng màu và các bộ món xoay quanh ---------- */
const TJW=['#1c4f9e','#3f93ea','#eaf6ff'],TJF=['#b8321a','#ff8a2a','#ffe27a'],ITC=['#16080c','#e0283a','#ffb0b8'],ONC=['#ff7a2a','#ffc04a','#fff3b0'],ONX=['#ff5a8a','#5aa9ff','#ffffff'];
const KRS=[{n:'shield'},{n:'shield'},{n:'shield'}],KRB=[{n:'meep',s:1.15},{n:'meep',s:1.15},{n:'meep',s:1.15}],KRQ={r:22,ry:8,cy:17,sp:1.6,bob:1};
const HKA=[{n:'bow',s:.7},{n:'heart',s:.6},{n:'apple',s:.9},{n:'heart',s:.6}],HKB=[{n:'bowP',s:.7},{n:'berry',s:.9},{n:'heartP',s:.6},{n:'berry',s:.9}],HKQ={r:21,ry:7,cy:16,sp:1.3,bob:1.4};
const flap=(e,i)=>Math.floor(e.wt*8+i)%2;
const KMA=[{n:'bat',f:flap,s:.95},{n:'skull',s:.85},{n:'bat',f:flap,s:.95}],KMB=[{n:'batX',f:flap},{n:'skull',s:.85},{n:'batX',f:flap},{n:'skull',s:.7}],KMQ={r:22,ry:8,cy:17,sp:1.7,bob:2};
const PSA=[{n:'donut',s:.8},{n:'cookie',s:.8},{n:'cupcake',s:.8}],PSB=[{n:'cake',s:.85},{n:'donut',s:.8},{n:'cupcake',s:.8},{n:'cookie',s:.8}],PSQ={r:22,ry:7,cy:16,sp:.75,bob:2};
const MRR=[{n:'rose',s:.9},{n:'rose',s:.9}],MRQ={r:20,ry:6,cy:14,sp:1.1,bob:1.2};
// sáu ngôi sao của Faker: xoay chậm thành vòng trên đầu; Ahri thì là sáu đốm lửa hồ ly
function fkStars(g,e,p,c,front){
  const t=e.wt*.7,ah=c.coat==='fkAhriHall',wh=c.coat==='fkWhite2026',cy=p.y-(ah?36:35);
  for(let i=0;i<6;i++){const a=t+i*TAU/6,z=Math.sin(a);if((z>=0)!==front)continue;const x=p.x+Math.cos(a)*(wh?22:21),y=cy+z*5+Math.sin(e.wt*2+i)*.6;
    if(ah){glowAt(g,x,y,3.4,3.4,'#b92137',.4);glowAt(g,x,y,2,2,'#e8405a',1);g.fillStyle='#e8405a';g.fillRect(rd(x-.5),rd(y-3.5-hs(Math.floor(e.wt*9)+i)),1,2);glowAt(g,x,y+.2,1,1,'#ffd98a',1)}
    else pa(g,wh?'starW':'star',x,y,{s:(wh?.8:.72)*(.92+.08*z)})}
}

// gắn cho cả hành động chính, hành động phụ (alt) và hành động của trang phục hiếm (form): sigOf trả về một trong ba, cái nào diễn xong cũng vào trạng thái
Object.keys(MD12).forEach(k=>{const s=S5[k];if(s)[s,s.alt,s.form].forEach(x=>{if(x&&!x.md)x.md=MD12[k]})});
})();
