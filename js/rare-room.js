"use strict";
/* ============ HÀNH ĐỘNG RIÊNG TRONG PHÒNG CỦA TRANG PHỤC HIẾM (5★) ============
   Mỗi bé 5★ có hành động riêng trong S5[sp] (js/ui.js). File này gán S5[sp].form cho 14 bé: khi bé mang trang phục hiếm
   (formOf(c) đúng) thì sigOf() chọn form thay cho bản thường, nên bản thường không đổi.
   Quy ước giữ hành vi kết thúc của bản gốc (xem stepEnt trong js/ui.js):
     form.md    trỏ động tới S5[sp].md  -> diễn xong bé vẫn vào trạng thái 60 giây như bản thường
     form.start gọi S5[sp].start gốc     -> Thần Tài vẫn được cộng xu
     form.end   gọi S5[sp].end gốc       -> Naruto vẫn phân thân, Zenitsu vẫn lóe sét lao đi
   draw vẽ sau lưng bé, over vẽ đè lên bé; toạ độ là ô của phòng, p.x/p.y là chân bé, k chạy 0..1, t = k × dur (giây).
   Trạng thái riêng của một lần diễn nằm ở e.rr (tạo lại ở start, bỏ ở end). Hình giữ trong khoảng 60 ô phía trên chân bé. */
(()=>{
const TAU=6.2832,PI=Math.PI,sat=x=>clamp(x,0,1),seg=(k,a,b)=>sat((k-a)/(b-a)),ease=x=>{x=sat(x);return 1-(1-x)*(1-x)},
  fd=(k,a,b,w)=>sat(Math.min(k-a,b-k)/(w||.07)),hr=(i,j)=>{const v=Math.sin(i*12.9898+(j||0)*78.233)*43758.5453;return v-Math.floor(v)},
  dir=e=>e.flip?1:-1,st=e=>e.rr||(e.rr={}),once=(e,id)=>{const r=st(e);if(r[id])return false;return r[id]=1},coatOfE=e=>{const c=entCat(e);return c?c.coat:''};
// nét vẽ cơ bản: A độ mờ, R ô chữ nhật, C hình tròn/bầu dục, P đa giác, L đoạn thẳng
const A=(g,a)=>{g.globalAlpha=sat(a)};
const R=(g,x,y,w,h,c)=>{g.fillStyle=c;g.fillRect(x,y,w,h)};
const C=(g,x,y,r,c,ry)=>{g.fillStyle=c;g.beginPath();g.ellipse(x,y,Math.max(0,r),Math.max(0,ry==null?r:ry),0,0,TAU);g.fill()};
const P=(g,q,c)=>{g.fillStyle=c;g.beginPath();for(let i=0;i<q.length;i+=2)i?g.lineTo(q[i],q[i+1]):g.moveTo(q[i],q[i+1]);g.closePath();g.fill()};
const L=(g,x0,y0,x1,y1,c,w)=>{g.strokeStyle=c;g.lineWidth=w||1;g.beginPath();g.moveTo(x0,y0);g.lineTo(x1,y1);g.stroke()};
// chùm tia hình quạt quanh tâm: n tia, dài xen kẽ r0/r1, nửa góc hw
const rays=(g,cx,cy,n,rot,r0,r1,hw,c,ry)=>{ry=ry||1;g.fillStyle=c;g.beginPath();for(let i=0;i<n;i++){const a=rot+i*TAU/n,r=i%2?r1:r0;g.moveTo(cx,cy);g.lineTo(cx+Math.cos(a-hw)*r,cy+Math.sin(a-hw)*r*ry);g.lineTo(cx+Math.cos(a+hw)*r,cy+Math.sin(a+hw)*r*ry);g.closePath()}g.fill()};
const spark=(g,x,y,r,c)=>{R(g,x-r,y-.5,2*r,1,c);R(g,x-.5,y-r,1,2*r,c);R(g,x-1,y-1,2,2,'#ffffff')};
const burst=(x,y,cols,n,s0,s1,o)=>{for(let i=0;i<n;i++){const a=rnd(0,TAU),s=rnd(s0,s1);rp(x,y,pick(cols),Object.assign({vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:rnd(.3,.55),sz:ch(.4)?2:1},o))}};
const ring=(x,y,c,vr,life)=>rp(x,y,c,{sh:'ring',r:4,vr:vr||60,life:life||.5});

/* Bé đứng sát tường thì hình cao (tên lửa, pháo hoa, trăng, kim tự tháp) sẽ đè lên cửa sổ. Cách xử lý: phần hình cao hơn 30 ô tính từ chân bé
   bị ép thấp lại theo chiều dọc sao cho đỉnh (60 ô) dừng dưới bậu cửa sổ (hàng WIN_Y); phần dưới 30 ô (quanh thân bé) giữ nguyên nên vẫn khớp với bé.
   Bé đứng cách tường từ 20 ô trở lên thì không ép gì. Vẽ hai lượt có cắt vùng (dưới mốc: nguyên; trên mốc: ép), hạt thì đổi toạ độ lúc sinh. */
const WIN_Y=66,LOWH=30,sq=p=>clamp((p.y-WIN_Y-LOWH)/30,.25,1);
const lowDraw=fn=>fn&&function(g,e,p,k){const c=sq(p);if(c>=1)return fn(g,e,p,k);const y0=p.y-LOWH;
  g.save();g.beginPath();g.rect(p.x-240,y0,480,240);g.clip();fn(g,e,p,k);g.restore();
  g.save();g.beginPath();g.rect(p.x-240,y0-240,480,240);g.clip();g.translate(0,y0);g.scale(1,c);g.translate(0,-y0);fn(g,e,p,k);g.restore()};
const lowFx=fn=>fn&&function(e,p,k){const c=sq(p);if(c>=1)return fn(e,p,k);const y0=p.y-LOWH,n0=rparts.length,r=fn(e,p,k);
  for(let i=n0;i<rparts.length;i++){const q=rparts[i];if(q.y<y0)q.y=y0-(y0-q.y)*c}return r};   // hạt vừa sinh nằm cuối mảng rparts
// đăng ký form cho một bé: bọc save/restore để độ mờ không lọt ra sprite, nối start/end/md/look của bản gốc
function reg(sp,def){
  const base=S5[sp];if(!base)return;
  const f=Object.assign({pose:'sit'},def),wrap=fn=>fn&&function(g,e,p,k){g.save();try{fn(g,e,p,k,k*f.dur)}finally{g.restore()}};
  f.draw=lowDraw(wrap(def.draw));f.over=lowDraw(wrap(def.over));
  if(def.fx)f.fx=lowFx((e,p,k)=>def.fx(e,p,k,k*f.dur));
  f.start=e=>{e.rr={};const b=S5[sp].start;if(b)b(e);if(def.start)def.start(e)};
  f.end=e=>{e.rr=null;if(def.end)def.end(e);const b=S5[sp].end;if(b)b(e)};
  Object.defineProperty(f,'md',{get:()=>S5[sp].md,enumerable:true});
  if(!def.look&&base.look)f.look=base.look;
  base.form=f;
}

{const s=S5.v_itadori&&S5.v_itadori.form;if(s&&!s.low){s.low=1;s.draw=lowDraw(s.draw);s.over=lowDraw(s.over);s.fx=lowFx(s.fx)}}   // đền của Itadori dạng Sukuna cũng ép thấp khi bé sát tường

/* ---------- Khao Manee · Mão vàng hoàng cung: hào quang vàng hình ngọn lửa, hai viên ngọc lớn mang màu mắt xoay quanh rồi lóe tia ---------- */
function kmGems(g,e,p,k,t,front){
  const c=entCat(e),Lk=look(lk(c)),cols=[Lk.eye,Lk.eye2||Lk.eye],v=fd(k,.04,.97,.1),pk=fd(k,.46,.9,.1);
  for(let i=0;i<2;i++){const a=t*2.3+i*PI,z=Math.sin(a);if((z>=0)!==!!front)continue;
    const x=p.x+Math.cos(a)*25,y=p.y-21+z*7,s=1.1+.22*z,hw=4*s,hh=6*s,col=cols[i];
    A(g,.28*v+.2*pk);C(g,x,y,8+2*pk,col);
    A(g,v);P(g,[x,y-hh,x+hw,y,x,y+hh,x-hw,y],col);
    A(g,.5*v);P(g,[x,y-hh,x-hw,y,x,y-hh*.1],'#ffffff');A(g,.22*v);P(g,[x-hw,y,x+hw,y,x,y+hh],'#20102a');
    A(g,v);R(g,x-hw*.45,y-hh*.55,1,1,'#ffffff');
    if(pk>0){const r=11*pk*(.8+.2*Math.sin(t*14+i));A(g,pk*.9);R(g,x-r,y-.5,2*r,1,col);R(g,x-.5,y-r,1,2*r,col);R(g,x-r*.5,y-.5,r,1,'#ffffff');R(g,x-.5,y-r*.5,1,r,'#ffffff')}
  }
}
reg('khaomanee',{n:'ngọc hai màu rực sáng trong hào quang hoàng cung',dur:4.2,
  draw(g,e,p,k,t){const v=fd(k,.03,.97,.12),cx=p.x,cy=p.y-23,pk=fd(k,.46,.9,.1),y=p.y;
    A(g,.2*v+.14*pk);rays(g,cx,cy,12,t*.5,35,25,.11,'#ffe07a',.88);
    A(g,.42*v);P(g,[cx,y-58,cx+3,y-51,cx+9,y-46,cx+12,y-38,cx+18,y-31,cx+18,y-22,cx+21,y-14,cx+13,y-3,cx-13,y-3,cx-21,y-14,cx-18,y-22,cx-18,y-31,cx-12,y-38,cx-9,y-46,cx-3,y-51],'#f2b930');
    A(g,.5*v+.2*pk);P(g,[cx,y-53,cx+6,y-44,cx+9,y-36,cx+14,y-29,cx+14,y-21,cx+16,y-14,cx+10,y-6,cx-10,y-6,cx-16,y-14,cx-14,y-21,cx-14,y-29,cx-9,y-36,cx-6,y-44],'#fff1b0');
    A(g,.75*v);g.strokeStyle='#ffd24a';g.lineWidth=.8;g.beginPath();g.ellipse(cx,cy,25,7,0,0,TAU);g.stroke();
    kmGems(g,e,p,k,t,0)},
  over(g,e,p,k,t){kmGems(g,e,p,k,t,1)},
  fx(e,p,k){const Lk=look(lk(entCat(e)));
    if(on(9))rp(p.x+rnd(-20,20),p.y-rnd(4,50),pick(['#ffe07a','#fff7d0']),{sh:'star',life:.5,vy:-6});
    if(k>.46&&once(e,'a')){ring(p.x,p.y-22,Lk.eye,80,.6);ring(p.x,p.y-22,Lk.eye2||'#ffe07a',55,.7);burst(p.x,p.y-22,['#ffe07a','#ffffff',Lk.eye,Lk.eye2||Lk.eye],16,30,70)}
    if(k>.46&&k<.9&&on(14))rp(p.x+rnd(-8,8),p.y-rnd(30,54),'#fff1b0',{vy:-rnd(10,24),life:.5})}});

/* ---------- Lykoi · Khăn đỏ: trăng máu mọc lên, bóng sói lớn ngửa cổ hú sau lưng, lá đỏ rơi ---------- */
reg('lykoi',{n:'gọi bóng sói hú dưới trăng máu',dur:4.6,
  draw(g,e,p,k,t){const d=dir(e),v=fd(k,.02,.98,.1),mx=p.x+d*15,my=p.y-41+(1-ease(k/.26))*16,X=x=>p.x-d*3+d*x,y=p.y;
    A(g,.3*v);C(g,p.x,y-1,32,'#3a0a14',6);
    A(g,.22*v);C(g,mx,my,23,'#e0283a',21);
    g.save();g.beginPath();g.rect(p.x-48,y-60,96,59);g.clip();
    A(g,v);C(g,mx,my,14,'#ff5a50');C(g,mx-1.5,my-1.5,12,'#ff7a66');
    A(g,.8*v);C(g,mx-5,my-4,2.6,'#e0403a');C(g,mx+4,my+3,3.2,'#e0403a');C(g,mx+2,my-7,1.5,'#e0403a');C(g,mx-4,my+6,1.4,'#e0403a');
    g.restore();
    const w=fd(k,.24,.94,.1);if(w>0){const hy=-Math.sin(t*5)*.8*(k>.4&&k<.85?1:0);   // bóng sói: thân, cổ vươn, mõm ngửa lên trời
      // dáng sói ngồi hú: đuôi cong sau lưng, lưng, gáy, hai tai nhọn, mõm dài ngửa lên, hàm há có nanh, bờm ngực răng cưa
      const W=[-17,0,-24,-3,-26,-11,-22,-16,-20,-10,-18,-17,-14,-28,-8,-35,-7,-42,-10,-51,-5,-46,-2,-54,2,-47,8,-52,13,-57,17,-61,19,-58,14,-52,18,-51,17,-48,11,-46,8,-42,11,-38,8,-34,12,-30,9,-25,13,-20,10,-14,15,-9,13,-4,17,0];
      const pts=[];for(let i=0;i<W.length;i+=2)pts.push(X(W[i]),y+W[i+1]+(W[i+1]<-34?hy:0));
      A(g,.9*w);P(g,pts,'#1c0c16');
      g.globalAlpha=.75*w;g.strokeStyle='#8a2438';g.lineWidth=1;g.lineJoin='round';g.beginPath();for(let i=0;i<pts.length;i+=2)i?g.lineTo(pts[i],pts[i+1]):g.moveTo(pts[i],pts[i+1]);g.stroke();   // viền đỏ sẫm cho rõ dáng
      A(g,.5*w);for(let i=0;i<4;i++)L(g,X(-13+i*5),y-9-i*5,X(-10+i*5),y-15-i*5,'#3a1626',1.2);                                                                // vài nét lông
      A(g,w);P(g,[X(3.5),y-48.5+hy,X(7.5),y-50+hy,X(6.5),y-47.5+hy],'#ff5a50');A(g,.45*w);C(g,X(5.5),y-48.6+hy,3,'#ff5a50');                                  // mắt xếch đỏ
      A(g,w);P(g,[X(13.5),y-52.5+hy,X(15.5),y-51.8+hy,X(14.6),y-49.6+hy],'#fff0e8');P(g,[X(15),y-50.6+hy,X(16.6),y-50.4+hy,X(15.8),y-52+hy],'#fff0e8')}},        // nanh
  fx(e,p,k){const d=dir(e);
    if(on(11))rp(p.x+rnd(-30,30),p.y-rnd(40,57),pick(['#c8323c','#e0283a','#ff8a8a','#8a1020']),{vx:-d*rnd(4,16),vy:rnd(12,26),life:rnd(.9,1.4),sz:2});
    if(k>.38&&k<.86&&on(4))rp(p.x+d*rnd(8,16),p.y-rnd(46,54),'#ff8a8a',{sh:'note',vy:-10,vx:d*8,life:.8});
    if(k>.38&&once(e,'a')){ring(p.x+d*8,p.y-50,'#ff5a50',70,.7);ring(p.x+d*8,p.y-50,'#ffb0a8',45,.8)}
    if(k>.6&&once(e,'b'))ring(p.x+d*8,p.y-50,'#ff5a50',70,.7);
    if(on(6))rp(p.x+rnd(-24,24),e.y-rnd(0,5),pick(['#5a1a28','#8a3040']),{vx:rnd(-6,6),vy:-rnd(1,5),life:rnd(.6,1),sz:3,a:.45})}});

/* ---------- Savannah · Mèo của Pharaoh: kim tự tháp vàng trồi lên, cột sáng và đĩa mặt trời trên đỉnh, bọ hung bay vòng, cát vàng cuốn ---------- */
function svScarab(g,e,k,t,front){
  const v=fd(k,.3,.93,.06);if(v<=0)return;const a=t*2.6,z=Math.sin(a);if((z>=0)!==!!front)return;
  const x=Math.round(e.x+Math.cos(a)*23),y=Math.round(e.y-30+z*7-6*Math.sin(t*1.3)),f=Math.floor(t*14)%2;
  A(g,v*.35);C(g,x,y,5,'#ffd24a');A(g,v);
  R(g,x-5,y-(f?3:1),4,2,'#58d0e0');R(g,x+2,y-(f?3:1),4,2,'#58d0e0');R(g,x-5,y-(f?3:1),1,1,'#e8fbff');R(g,x+5,y-(f?3:1),1,1,'#e8fbff');
  R(g,x-2,y-2,5,5,'#14605e');R(g,x-1,y-3,3,1,'#f2c230');R(g,x-1,y-1,1,3,'#2a9a8e');R(g,x,y+3,1,1,'#14605e');
}
reg('savannah',{n:'gọi kim tự tháp vàng của Pharaoh',dur:4.4,pose:k=>k>.82?'leap'+Math.min(3,Math.floor((k-.82)/.18*4)):'sit',hover:k=>k>.82?Math.sin(PI*(k-.82)/.18)*24:0,
  draw(g,e,p,k,t){const x=e.x,y=e.y-2,r=ease(seg(k,.05,.36)),out=sat((.985-k)/.07),H=36,B=27,sh=r<1?Math.sin(t*60)*.5:0,ay=y-H*r;
    A(g,.34*out*r);C(g,x,y+1,33,'#f2c230',6);
    g.save();g.beginPath();g.rect(x-34,y-62,68,62);g.clip();g.translate(sh,(1-r)*H);
    A(g,out);P(g,[x-B,y,x+4,y-H,x+8,y],'#f0c04a');P(g,[x+4,y-H,x+B,y,x+8,y],'#b88a2c');
    g.save();g.beginPath();g.moveTo(x-B,y);g.lineTo(x+4,y-H);g.lineTo(x+B,y);g.closePath();g.clip();
    A(g,.3*out);for(let i=1;i<7;i++){R(g,x-B,y-i*5.2,2*B,.8,'#7a5418');for(let j=0;j<8;j++)R(g,x-B+j*7+(i%2)*3.5,y-i*5.2,.8,5.2,'#7a5418')}
    g.restore();A(g,out);P(g,[x+4,y-H,x+.4,y-H+5,x+4.6,y-H+5,x+7.2,y-H+5],'#fff1b0');
    g.restore();
    const b=fd(k,.38,.92,.06);if(b>0){const fl=.75+.25*Math.sin(t*20);   // cột sáng và đĩa mặt trời có cánh
      A(g,.22*b*fl);R(g,x-1,y-60,10,60-H,'#ffe07a');A(g,.5*b*fl);R(g,x+2,y-60,4,60-H,'#fff7d0');
      A(g,.3*b);C(g,x+4,ay-11,9,'#ffd24a');A(g,b);C(g,x+4,ay-11,5,'#ff9a2a');C(g,x+4,ay-11,3.6,'#ffe07a');
      A(g,.9*b);[-1,1].forEach(s=>{R(g,x+4+s*5.5-(s<0?7:0),ay-12,7,1.4,'#f2c230');R(g,x+4+s*6-(s<0?5:0),ay-10.4,5,1.2,'#58d0e0');R(g,x+4+s*6.5-(s<0?3:0),ay-9,3,1,'#f2c230')})}
    svScarab(g,e,k,t,0)},
  over(g,e,p,k,t){svScarab(g,e,k,t,1)},
  fx(e,p,k){const d=dir(e);
    if(k<.95&&on(26))rp(e.x-d*rnd(20,36),e.y-rnd(0,5),pick(['#e8c070','#f2d898','#c9a050']),{vx:d*rnd(30,64),vy:-rnd(2,12),life:rnd(.4,.7),sz:ch(.35)?2:1});
    if(k<.36&&on(24)){const s=ch(.5)?1:-1;rp(e.x+s*rnd(8,26),e.y-2,pick(['#c9a050','#8a6a3a']),{vx:s*rnd(6,22),vy:-rnd(10,30),g:90,life:rnd(.3,.5),sz:2})}
    if(k>.38&&once(e,'a')){ring(e.x+4,e.y-49,'#ffe07a',70,.6);burst(e.x+4,e.y-49,['#ffe07a','#ffffff','#ff9a2a'],14,24,60)}
    if(k>.38&&k<.92&&on(10))rp(e.x+4+rnd(-3,3),e.y-rnd(40,58),'#fff7d0',{sh:'star',vy:-10,life:.45})}});

/* ---------- Sokoke · Thần rừng: bốn cây mọc lên sau lưng, thảm rêu, lá xoáy thành cột, đom đóm ---------- */
const SK_T=[[-25,34,5],[-12,47,7],[12,43,6.5],[25,31,5]];
function skFly(g,e,p,k,t,front){
  const v=fd(k,.18,.96,.1);if(v<=0)return;
  for(let i=front?0:1;i<9;i+=2){const x=p.x+Math.sin(t*(.7+hr(i)*.6)+i*2.1)*(14+hr(i,2)*16),y=p.y-10-hr(i,3)*38+Math.sin(t*1.3+i)*4,b=.5+.5*Math.sin(t*(3+hr(i,4)*3)+i);
    A(g,.3*v*b);C(g,x,y,2.6,'#f6ff8a');A(g,v*(.35+.65*b));R(g,x-.6,y-.6,1.2,1.2,'#fbffd0')}
}
reg('sokoke',{n:'gọi rừng thiêng mọc lên quanh mình',dur:4.6,
  draw(g,e,p,k,t){const y=p.y-1,out=sat((.99-k)/.09),v=fd(k,.02,.98,.1);
    A(g,.4*v);C(g,p.x,y,33,'#3f9a55',6);A(g,.5*v);C(g,p.x-4,y,22,'#6fd26f',3.4);
    A(g,.18*v);C(g,p.x,p.y-24,30,'#8ee08a',27);
    SK_T.forEach((q,i)=>{const gr=ease(seg(k,.05+i*.045,.4+i*.045))*out;if(gr<=0)return;const x=p.x+q[0]+Math.sin(t*1.6+i)*.6*gr,h=q[1]*gr,r=q[2]*gr,ty=y-h;
      A(g,1);R(g,x-1.5,y-h*.6,3,h*.6,'#7a5234');R(g,x-1.5,y-h*.6,1,h*.6,'#9a6e48');
      C(g,x,ty+r*2.1,r*1.5,'#2f7a45',r*1.05);C(g,x-r*.5,ty+r*1.3,r*1.15,'#3f9a55',r*.95);C(g,x+r*.55,ty+r*1.5,r*1.05,'#3f9a55',r*.9);C(g,x,ty+r*.8,r*.95,'#55b860',r*.8);
      C(g,x-r*.3,ty+r*.55,r*.45,'#8ee08a',r*.35);
      if(gr>.9){R(g,x+r*.7,ty+r*1.6,1.4,1.4,i%2?'#ff8a9a':'#ffe07a');R(g,x-r*.9,ty+r*2,1.4,1.4,i%2?'#ffe07a':'#ff8a9a')}});
    A(g,v);for(let i=0;i<9;i++){const x=p.x-30+i*7.5+hr(i)*3,h=2+hr(i,5)*3;R(g,x,y-h+2,1,h,'#3f9a55');R(g,x+1,y-h+3,1,h-1,'#6fd26f');if(i%3===1)R(g,x-1,y-h+1,2,2,'#fff3c4')}
    skFly(g,e,p,k,t,0)},
  over(g,e,p,k,t){skFly(g,e,p,k,t,1)},
  fx(e,p,k,t){
    if(k>.3&&k<.9){const u=seg(k,.3,.5);for(let i=0;i<2;i++){const f=(t*.9+i*.5)%1,a=t*6+i*PI,r=(9+13*f)*u;if(ch(.75))rp(p.x+Math.cos(a)*r,p.y-3-f*46,pick(['#6fd26f','#3f9a55','#b5e08a']),{life:.28,sz:ch(.5)?2:1,vy:-8})}}
    if(k<.4&&on(22)){const q=pick(SK_T);rp(p.x+q[0]+rnd(-5,5),p.y-1,pick(['#7a5234','#3f9a55','#b5e08a']),{vx:rnd(-12,12),vy:-rnd(12,34),g:80,life:rnd(.3,.55)})}
    if(k>.88&&once(e,'a')){burst(p.x,p.y-26,['#6fd26f','#3f9a55','#b5e08a','#fff3c4'],22,24,70,{sz:2,g:40});ring(p.x,p.y-20,'#8ee08a',70,.6)}
    if(on(5))rp(p.x+rnd(-28,28),p.y-rnd(30,52),pick(['#6fd26f','#b5e08a']),{vx:rnd(-8,8),vy:rnd(8,18),life:rnd(.6,1),sz:2})}});

/* ---------- Suphalak · Vòng hoa nhài: vầng đồng đỏ rực, vòng hoa kết dần quanh mình, hoa nhài rơi ---------- */
const jasmine=(g,x,y,s)=>{x=Math.round(x);y=Math.round(y);R(g,x-s,y,2*s+1,1,'#ffffff');R(g,x,y-s,1,2*s+1,'#ffffff');if(s>1){R(g,x-1,y-1,3,3,'#fff8e0')}R(g,x,y,1,1,'#f2c230')};
function spBody(g,e,p,k,t,front){
  const v=fd(k,.02,.98,.08),n=20,sh=Math.floor(n*seg(k,.12,.58)+.001),pk=fd(k,.58,.95,.08);
  for(let i=front?0:1;i<14;i+=2){const f=((t*.26+hr(i))%1),x=p.x+(hr(i,2)-.5)*58+Math.sin(t*2+i)*3,y=p.y-57+f*56;A(g,v*sat(f*8)*sat((1-f)*6));jasmine(g,x,y,i%3?1:2)}
  for(let i=0;i<sh;i++){const a=t*.8+i*TAU/n,z=Math.sin(a);if((z>=0)!==!!front)continue;const x=p.x+Math.cos(a)*(21+pk*2),y=p.y-11+z*(6.5+pk)-pk*2;
    A(g,v);if(i%5===0){R(g,x-1.5,y-1.5,3,3,'#e0403a');R(g,x-.5,y-.5,1,1,'#ff9a8a')}else if(i%5===2){R(g,x-1.5,y-1.5,3,3,'#f2a830');R(g,x-.5,y-.5,1,1,'#fff1b0')}else jasmine(g,x,y,1)}
}
reg('suphalak',{n:'kết vòng hoa nhài giữa vầng đồng đỏ',dur:4.2,
  draw(g,e,p,k,t){const v=fd(k,.02,.98,.1),pk=fd(k,.58,.95,.08),cx=p.x,cy=p.y-20,r=27+2*Math.sin(t*4)+5*pk;
    A(g,.2*v+.12*pk);C(g,cx,cy,r+5,'#ff7a2a',r+2);
    A(g,.26*v+.18*pk);rays(g,cx,cy,18,-t*.45,r+6,r-3,.1,'#ff9a3a',.95);
    A(g,.3*v+.22*pk);rays(g,cx,cy,18,-t*.45+TAU/36,r-2,r-9,.07,'#ffe2b0',.95);
    A(g,.45*v+.25*pk);C(g,cx,cy,15+3*pk,'#ffc27a',17+3*pk);
    spBody(g,e,p,k,t,0)},
  over(g,e,p,k,t){spBody(g,e,p,k,t,1)},
  fx(e,p,k){
    if(on(2.4))ring(p.x,p.y-16,'#ffb060',30,.7);
    if(on(10))rp(p.x+rnd(-18,18),p.y-rnd(4,40),pick(['#ffd89a','#ffffff']),{sh:'star',life:.45});
    if(k>.58&&once(e,'a')){ring(p.x,p.y-14,'#ffffff',75,.6);ring(p.x,p.y-14,'#ff9a3a',55,.7);burst(p.x,p.y-14,['#ffffff','#fff3c4','#ffb060'],18,26,64)}
    if(k>.58&&k<.95&&on(16))rp(p.x+rnd(-14,14),p.y-rnd(0,30),pick(['#ff9a3a','#ffd89a']),{vy:-rnd(20,40),life:rnd(.3,.5),sz:ch(.4)?2:1})}});

/* ---------- Naruto · Tiên nhân Cửu Vĩ: chín đuôi chakra xòe ra, Vĩ Thú Ngọc đen tụ trên đầu rồi phóng đi ---------- */
const KUR={
  draw(g,e,p,k,t){const d=dir(e),v=fd(k,.02,.99,.08),bx=p.x-d,by=p.y-7;
    A(g,.22*v);C(g,p.x,p.y-18,30,'#ffd83a',26);
    for(let i=0;i<9;i++){const u=ease(seg(k,.06+i*.014,.38+i*.014))*v;if(u<=.02)continue;const ang=-PI/2+(i-4)*.34,pts=[];let x=bx,y=by;
      for(let s=1;s<=9;s++){const f=s/9,a=ang+Math.sin(t*2.8+i*.9+f*2.4)*.3*f+(i-4)*.035*f;x+=Math.cos(a)*4.1*u;y+=Math.sin(a)*4.1*u;pts.push(x,y,3.5*(1-f*.6))}
      A(g,.95);for(let s=0;s<pts.length;s+=3)C(g,pts[s],pts[s+1],pts[s+2]+.7,'#f07a1a');
      for(let s=0;s<pts.length;s+=3)C(g,pts[s],pts[s+1],pts[s+2],'#ffb42e');
      for(let s=0;s<pts.length;s+=3)C(g,pts[s],pts[s+1],pts[s+2]*.5,'#fff2a6')}},
  over(g,e,p,k,t){const d=dir(e),q=seg(k,.44,.8),fly=seg(k,.86,1),x=p.x+d*fly*fly*70,y=p.y-52-fly*2,r=6*ease(q),a=1-seg(k,.95,1);
    if(r<=.3)return;
    if(fly>0){A(g,.5*a);R(g,Math.min(p.x,x),y-r*.6,Math.abs(x-p.x),r*1.2,'#8a4ae0');A(g,.6*a);R(g,Math.min(p.x,x),y-r*.25,Math.abs(x-p.x),r*.5,'#ffffff')}
    A(g,.35*a);C(g,x,y,r+3.5,'#8a4ae0');A(g,a);C(g,x,y,r+.9,'#b98bff');C(g,x,y,r,'#140c20');C(g,x+r*.2,y+r*.2,r*.6,'#2a1a44');
    R(g,x-r*.5,y-r*.55,1.4,1.4,'#ffffff');
    g.strokeStyle='#ffffff';g.lineWidth=.7;A(g,.8*a);for(let i=0;i<3;i++){g.beginPath();g.arc(x,y,r+2.2,t*7+i*2.094,t*7+i*2.094+.9);g.stroke()}},
  fx(e,p,k){const d=dir(e);
    if(k>.44&&k<.84&&on(34)){const a=rnd(0,TAU),r=rnd(12,18);rp(p.x+Math.cos(a)*r,p.y-52+Math.sin(a)*r*.7,pick(['#4a8cff','#ff4a5a','#ffffff','#140c20']),{vx:-Math.cos(a)*r*3,vy:-Math.sin(a)*r*2.1,life:.3,sz:ch(.4)?2:1})}
    if(k>.38&&once(e,'a')){ring(p.x,p.y-16,'#ffd83a',85,.6);burst(p.x,p.y-16,['#ffd83a','#fff2a6','#f07a1a'],18,30,74)}
    if(k>.86&&once(e,'b')){ring(p.x,p.y-52,'#b98bff',90,.5);burst(p.x,p.y-52,['#b98bff','#ffffff','#140c20'],12,20,60)}
    if(on(16))rp(p.x+rnd(-20,20),p.y-rnd(0,34),pick(['#ffd83a','#fff2a6','#f07a1a']),{vy:-rnd(22,46),life:rnd(.3,.55),sz:ch(.4)?2:1})}};
/* ---------- Naruto · Hokage Đệ Thất: biểu tượng làng Lá sáng dần sau lưng, áo choàng trắng viền lửa phất, lá xoáy ---------- */
// biểu tượng làng Lá: xoáy ốc ở giữa, nét vòng ra ngoài chạy qua phải và đáy, kéo thành mũi lá nhọn chĩa sang trái rồi khép lại ở đỉnh; cuống tam giác nhỏ dưới mũi lá
const LEAF=(()=>{const q=[];for(let a=0;a<=3.5*PI+.01;a+=.28){const r=.52*a;q.push([Math.cos(a)*r,Math.sin(a)*r])}   // xoáy ốc từ tâm ra, kết thúc ở đỉnh
  for(let a=3.5*PI;a<=4.86*PI+.01;a+=.2){const r=5.7+3.3*seg(a,3.5*PI,4*PI);q.push([Math.cos(a)*r,Math.sin(a)*r])}      // vòng ngoài: phải, đáy, tới góc dưới trái
  q.push([-16,-.5]);                                                                                                    // mũi lá
  for(let a=5.16*PI;a<=5.5*PI+.01;a+=.2)q.push([Math.cos(a)*9,Math.sin(a)*9]);return q})();                             // về lại đỉnh
const HOK={
  draw(g,e,p,k,t){const d=dir(e),v=fd(k,.02,.98,.08),cx0=p.x+d*26,cy0=p.y-41,cx=0,cy=0,q=seg(k,.14,.5),pk=fd(k,.5,.94,.08),n=Math.max(2,Math.ceil(LEAF.length*q));
    g.save();g.translate(cx0,cy0);g.scale(1.2,1.2);
    A(g,.22*v+.16*pk);C(g,cx,cy,15+2*pk,'#58c868',14+2*pk);
    if(pk>0){A(g,.3*pk);rays(g,cx,cy,12,t*.6,17,13.5,.1,'#d8ffd0',.95)}
    [[2.6,'#2f8a48',.9],[1.2,'#eaffe0',1]].forEach(s=>{A(g,s[2]*v);g.strokeStyle=s[1];g.lineWidth=s[0];g.lineJoin='round';g.lineCap='round';g.beginPath();
      for(let i=0;i<n;i++)i?g.lineTo(cx+LEAF[i][0],cy+LEAF[i][1]):g.moveTo(cx+LEAF[i][0],cy+LEAF[i][1]);g.stroke();
      if(q>=1){g.beginPath();g.moveTo(cx-10.4,cy+5.6);g.lineTo(cx-13.6,cy+10.4);g.lineTo(cx-7.4,cy+9.4);g.closePath();g.fillStyle=s[1];g.fill();g.stroke()}});
    g.restore();
    // áo choàng phất về phía sau lưng
    const u=ease(seg(k,.04,.3))*sat((.99-k)/.07);if(u>.02){const N=8,bx=p.x-d*5,T=[],B=[];
      for(let j=0;j<=N;j++){const f=j/N,x=bx-d*f*31*u,w=Math.sin(t*8-f*4.6)*3.2*f;T.push(x,p.y-25+f*5+w*.5);B.push(x,p.y-4-f*4+w*1.5)}
      const pg=T.slice();for(let j=N;j>=0;j--)pg.push(B[j*2],B[j*2+1]);
      A(g,1);P(g,pg,'#f4f4f8');
      for(let j=0;j<N;j++){const x0=B[j*2],y0=B[j*2+1],x1=B[j*2+2],y1=B[j*2+3];P(g,[x0,y0,x1,y1,x1,y1-2,(x0+x1)/2,(y0+y1)/2-5.4,x0,y0-2],'#e0283a')}
      A(g,.4);for(let j=1;j<N;j+=2)L(g,T[j*2],T[j*2+1]+2,B[j*2],B[j*2+1]-5,'#c8c8d8',.6)}},
  over(g,e,p,k,t){const v=fd(k,.1,.95,.08);if(v<=0)return;   // lá xoáy quanh mình (phần phía trước)
    for(let i=0;i<10;i++){const a=t*4.4+i*.628+(i%2)*.2,z=Math.sin(a);if(z<0)continue;const lv=i%2,x=Math.round(p.x+Math.cos(a)*(22-lv*4)),y=Math.round(p.y-8-lv*17+z*5+Math.sin(t*3+i)*2);
      A(g,v);R(g,x-1,y,3,2,'#3f9a55');R(g,x,y-1,2,1,'#6fd26f');R(g,x+1,y+1,1,1,'#2a6a3a')}},
  fx(e,p,k,t){
    if(k>.1&&k<.95&&on(24)){const a=t*4.4+rnd(0,TAU),lv=ch(.5)?1:0;if(Math.sin(a)<0)rp(p.x+Math.cos(a)*(22-lv*4),p.y-8-lv*17+Math.sin(a)*5,pick(['#3f9a55','#6fd26f']),{life:.3,sz:2})}
    if(k>.5&&once(e,'a')){ring(p.x+dir(e)*26,p.y-41,'#d8ffd0',80,.6);ring(p.x+dir(e)*26,p.y-41,'#58c868',55,.7);burst(p.x+dir(e)*26,p.y-41,['#6fd26f','#eaffe0','#3f9a55'],16,26,66)}
    if(on(7))rp(p.x+rnd(-26,26),p.y-rnd(36,56),pick(['#6fd26f','#3f9a55','#b5e08a']),{vx:-dir(e)*rnd(10,26),vy:rnd(6,16),life:rnd(.6,1),sz:2})}};
const nrPick=e=>coatOfE(e)==='nrHokage'?HOK:KUR;
reg('v_naruto',{n:'bung sức mạnh (Cửu Vĩ xòe chín đuôi / Hokage gọi biểu tượng làng Lá) rồi phân thân thành ba',dur:4.4,
  draw(g,e,p,k,t){nrPick(e).draw(g,e,p,k,t)},over(g,e,p,k,t){nrPick(e).over(g,e,p,k,t)},
  fx(e,p,k,t){nrPick(e).fx(e,p,k,t);if(k>.84&&on(18))rp(p.x+rnd(-14,14),p.y-rnd(2,30),pick(SMOKE),{vx:rnd(-8,8),vy:-rnd(4,16),life:rnd(.3,.6),sz:ch(.5)?3:2,a:.8})}});

/* ---------- Zenitsu · Hỏa Lôi Thần: ngủ gật, rồi rồng sét đỏ cam uốn quanh mình, sét đỏ giáng xuống, cuối cùng lóe sáng lao đi ---------- */
function ztDragon(g,e,p,k,t,front){
  const n=Math.floor(26*seg(k,.3,.52)),out=sat((.975-k)/.05);if(n<2||out<=0)return;
  const A0=t*3.5,pos=i=>{const a=A0-i*.2;return [p.x+Math.cos(a)*(22+2*Math.sin(a*2)),p.y-21+14*Math.sin(a*.5+1),Math.sin(a)]};
  let q=pos(0);const h=q;
  for(let i=1;i<n;i++){const c=pos(i);c[0]+=rnd(-.7,.7);c[1]+=rnd(-.9,.9);
    if((c[2]>=0)===!!front){const w=4-i*.12;A(g,out);L(g,q[0],q[1],c[0],c[1],'#e0281a',w+1.2);L(g,q[0],q[1],c[0],c[1],'#ff7a1a',w);L(g,q[0],q[1],c[0],c[1],'#ffe07a',w*.4);
      if(i%4===2){L(g,c[0],c[1],c[0]+rnd(-2,2),c[1]-4.5,'#ff7a1a',1);L(g,c[0],c[1],c[0]+rnd(-2,2),c[1]+4,'#ff7a1a',.8)}}
    q=c}
  if((h[2]>=0)===!!front){const sx=-Math.sin(A0)>=0?1:-1,x=h[0],y=h[1];A(g,.4*out);C(g,x,y,7,'#ff7a1a');A(g,out);   // đầu rồng: sừng, mõm, mắt, râu sét
    R(g,x-3.5,y-3.5,7,7,'#e0281a');R(g,x-3,y-3,6,6,'#ff7a1a');R(g,x+(sx>0?2:-6),y-1.5,4,4,'#ff7a1a');R(g,x+(sx>0?3:-6),y+1.5,3,1.2,'#ffe07a');
    L(g,x-sx*1,y-3,x-sx*5,y-7.5,'#ffe07a',1.2);L(g,x-sx*2.5,y-2,x-sx*7,y-4.5,'#ffe07a',1);
    R(g,x+(sx>0?.5:-2),y-2,1.6,1.6,'#ffffff');L(g,x+sx*5,y,x+sx*9,y-2+rnd(-2,2),'#ffe07a',.7)}
}
reg('v_thunder',{n:'ngủ gật rồi gọi rồng sét Hỏa Lôi Thần, lóe sáng lao đi',dur:4.6,pose:k=>k<.28?'sleep'+(Math.floor(k*14)%2):'sit',
  draw(g,e,p,k,t){const v=fd(k,.28,.98,.08);
    A(g,.24*v);C(g,p.x,p.y-18,29,'#ff5a1a',25);A(g,.3*v);C(g,p.x,e.y-1,28,'#ff9a2a',5.5);
    ztDragon(g,e,p,k,t,0)},
  over(g,e,p,k,t){ztDragon(g,e,p,k,t,1);const f=seg(k,.93,1);if(f>0){A(g,.75*Math.sin(PI*f));C(g,p.x,p.y-18,20+26*f,'#fff3b0',18+20*f)}},
  fx(e,p,k){
    if(k<.28){if(on(1.8))rp(p.x+8,p.y-30,'#a58e7a',{sh:'zz',vy:-6,life:.8});if(on(10))rp(p.x+rnd(-14,14),p.y-rnd(2,26),pick(['#ff7a1a','#ffe07a']),{sh:'bolt',pts:zig(ch(.5)?1:-1,6,3,3),life:.08})}
    else{if(k<.95&&on(7)){const x=p.x+rnd(-26,26);rp(x,e.y-56,pick(['#ff3a2a','#ff7a1a']),{sh:'bolt',pts:zig(1,0,6,5).map((q,i)=>[q[1],(i+1)*9.2]),life:.12});burst(x,e.y-1,['#ff7a1a','#ffe07a','#ffffff'],4,20,50,{g:170,life:.25})}
      if(on(20))rp(p.x+rnd(-12,12),e.y-1,pick(['#ff7a1a','#ffd83a','#ffffff']),{vx:rnd(-34,34),vy:-rnd(18,48),g:170,life:.28})}
    if(k>.3&&once(e,'a')){ring(p.x,p.y-18,'#ff7a1a',85,.6);ring(p.x,p.y-18,'#ffe07a',55,.7)}
    if(k>.92&&once(e,'b')){ring(p.x,p.y-18,'#ffffff',120,.5);burst(p.x,p.y-18,['#ff7a1a','#ffe07a','#ffffff','#e0281a'],22,40,100)}}});

/* ---------- Gojo · Lục Nhãn: Xích đỏ và Thương xanh hiện hai bên, nhập làm một thành quả cầu tím lớn rồi phóng đi ---------- */
const orb=(g,x,y,r,c,c2,a)=>{if(r<=.2)return;A(g,.3*a);C(g,x,y,r+3,c);A(g,a);C(g,x,y,r,c);C(g,x-r*.15,y-r*.15,r*.62,c2);C(g,x-r*.3,y-r*.3,r*.26,'#ffffff')};
reg('v_gojo',{n:'nhập Xích và Thương thành Hư Thức Tím rồi phóng đi',dur:5,
  draw(g,e,p,k,t){const v=Math.sin(PI*sat(k/.97));A(g,.46*v);C(g,p.x,p.y-20,31,'#1c0a44',27);A(g,.3*v);C(g,p.x,p.y-20,22,'#5a3ac8',20);
    A(g,.6*v);g.strokeStyle='#c4aaff';g.lineWidth=.6;g.beginPath();g.ellipse(p.x,p.y-20,31,27,0,0,TAU);g.stroke();
    for(let i=0;i<10;i++){const b=.5+.5*Math.sin(t*4+i*1.7);A(g,v*b);R(g,p.x+(hr(i)-.5)*52,p.y-42+(hr(i,2)-.5)*30,1,1,'#ffffff')}},
  over(g,e,p,k,t){const d=dir(e),mx=p.x,my=p.y-49,gr=ease(seg(k,.06,.3)),m=seg(k,.34,.52),mm=m*m*(3-2*m),
      rx=p.x-23+(mx-(p.x-23))*mm,bx=p.x+23+(mx-(p.x+23))*mm,oy=p.y-25+(my-(p.y-25))*mm+Math.sin(t*5)*1.2*(1-mm);
    if(k<.53){orb(g,rx,oy,4.8*gr,'#e0283a','#ff8a8a',1);orb(g,bx,oy,4.8*gr,'#2a6ae6','#8ac4ff',1);
      [[rx,'#ff4a5a'],[bx,'#4a8cff']].forEach((q,j)=>{A(g,gr);g.strokeStyle=q[1];g.lineWidth=.7;for(let i=0;i<2;i++){g.beginPath();g.arc(q[0],oy,6.6*gr,(j?-1:1)*t*6+i*PI,(j?-1:1)*t*6+i*PI+1.3);g.stroke()}});
      if(m>0&&bx-rx>4){A(g,.9);g.strokeStyle='#d9b0ff';g.lineWidth=.8;g.beginPath();g.moveTo(rx,oy);for(let i=1;i<5;i++)g.lineTo(rx+(bx-rx)*i/5,oy+rnd(-3,3));g.lineTo(bx,oy);g.stroke()}}
    else{const q=seg(k,.52,.76),fly=seg(k,.8,.98),r=5+4.4*ease(q)+Math.sin(t*16)*.5,x=mx+d*fly*fly*86,a=1-seg(k,.94,.99);
      if(fly>0){A(g,.4*a);R(g,Math.min(mx,x),my-r*.8,Math.abs(x-mx),r*1.6,'#8a4ae0');A(g,.5*a);R(g,Math.min(mx,x),my-r*.35,Math.abs(x-mx),r*.7,'#e8d4ff')}
      A(g,.3*a);C(g,x,my,r+4,'#8a4ae0');A(g,a);C(g,x,my,r,'#7a3ae0');C(g,x,my,r*.72,'#b98bff');C(g,x-r*.1,my-r*.1,r*.42,'#ffffff');
      A(g,.9*a);g.strokeStyle='#e8d4ff';g.lineWidth=.8;for(let i=0;i<3;i++){const an=t*8+i*2.094;g.beginPath();g.ellipse(x,my,r+2.4,(r+2.4)*.45,an*.3+i,an,an+1.4);g.stroke()}
      if(q<1&&ch(.6)){const an=rnd(0,TAU);A(g,.9);L(g,x+Math.cos(an)*r,my+Math.sin(an)*r,x+Math.cos(an)*(r+6),my+Math.sin(an)*(r+5),'#ffffff',.7)}}},
  fx(e,p,k){const d=dir(e);
    if(k>.06&&k<.5&&on(26)){const s=ch(.5)?1:-1,a=rnd(0,TAU);rp(p.x+s*23+Math.cos(a)*10,p.y-25+Math.sin(a)*10,s<0?'#ff4a5a':'#4a8cff',{vx:-Math.cos(a)*30,vy:-Math.sin(a)*30,life:.3})}
    if(k>.52&&once(e,'a')){ring(p.x,p.y-49,'#ffffff',95,.5);ring(p.x,p.y-49,'#b46aff',65,.7);burst(p.x,p.y-49,['#b46aff','#ffffff','#ff4a5a','#4a8cff'],20,30,80)}
    if(k>.52&&k<.8&&on(30)){const a=rnd(0,TAU),r=rnd(14,20);rp(p.x+Math.cos(a)*r,p.y-49+Math.sin(a)*r*.6,pick(['#b46aff','#e8d4ff']),{vx:-Math.cos(a)*r*3,vy:-Math.sin(a)*r*1.8,life:.3})}
    if(k>.8&&once(e,'b')){ring(p.x,p.y-49,'#b46aff',110,.5);burst(p.x-d*4,p.y-49,['#b46aff','#ffffff'],12,20,60)}
    if(k>.8&&k<.97&&on(40)){const f=seg(k,.8,.98);rp(p.x+d*f*f*86+rnd(-3,3),p.y-49+rnd(-6,6),pick(['#b46aff','#e8d4ff','#7a3ae0']),{vx:-d*rnd(10,40),vy:rnd(-14,14),life:.35,sz:ch(.4)?2:1})}
    if(on(6))rp(p.x+rnd(-24,24),p.y-rnd(0,40),pick(['#b46aff','#5a8cff','#ffffff']),{vy:-rnd(4,12),life:.6})}});

/* ---------- Harry · Tầm thủ Gryffindor: ba vòng gôn Quidditch sau lưng, trái Snitch vàng bay vòng, bé nhảy bắt, pháo hoa đỏ vàng ---------- */
const hpHov=k=>k>.6&&k<.76?Math.sin(PI*(k-.6)/.16)*13:0;
function hpSnitch(e,p,k,t){const d=dir(e),a=t*4.4,fx=p.x+Math.cos(a)*27,fy=e.y-27+Math.sin(a*2)*11-6*Math.sin(a*.5),cx=p.x+d*17,cy=p.y-35,m=seg(k,.56,.68),mm=m*m*(3-2*m);
  return [fx+(cx-fx)*mm,fy+(cy-fy)*mm,m>=1]}
reg('v_harry',{n:'nhảy bắt trái Snitch vàng giữa pháo hoa Gryffindor',dur:4.6,hover:hpHov,
  draw(g,e,p,k){const v=fd(k,.03,.98,.08),y=e.y-1,win=fd(k,.68,.99,.06);
    A(g,.2*v+.2*win);C(g,e.x,e.y-22,30,'#ffd24a',26);
    [[-23,43],[0,56],[23,43]].forEach((q,i)=>{const x=e.x+q[0],h=q[1]*ease(seg(k,.03+i*.03,.25+i*.03));if(h<8)return;A(g,v);
      R(g,x-.8,y-h+9,1.6,h-9,'#c89a2a');R(g,x-.8,y-h+9,.7,h-9,'#ffe07a');
      g.strokeStyle='#c89a2a';g.lineWidth=2;g.beginPath();g.arc(x,y-h+4.6,4.6,0,TAU);g.stroke();g.strokeStyle='#ffe07a';g.lineWidth=.8;g.beginPath();g.arc(x,y-h+4.6,4.6,2.6,5.2);g.stroke();
      if(win>0){A(g,.35*win);C(g,x,y-h+4.6,3.4,i%2?'#ffe07a':'#e0283a')}})},
  over(g,e,p,k,t){const v=fd(k,.02,.99,.05);if(v<=0)return;const s=hpSnitch(e,p,k,t),x=s[0],y=s[1],f=s[2]?Math.floor(t*6)%2:Math.floor(t*22)%2;
    A(g,.4*v);C(g,x,y,5,'#ffe07a');A(g,v);
    [-1,1].forEach(sd=>{const wy=f?-3.4:1.2;P(g,[x+sd*1.5,y-.6,x+sd*8,y+wy-1,x+sd*7,y+wy+1.4,x+sd*1.5,y+.8],'#ffffff');L(g,x+sd*2,y,x+sd*7.4,y+wy,'#d8d8e8',.5)});
    C(g,x,y,2.5,'#c88a1a');C(g,x,y,2.1,'#f2c230');R(g,x-1.4,y-1.4,1.2,1.2,'#fff7d0');
    if(s[2]){const r=4+2*Math.sin(t*12);A(g,.9*v);spark(g,x,y,r+3,'#ffe07a')}},
  fx(e,p,k,t){const s=hpSnitch(e,p,k,t);
    if(k<.68&&ch(.7))rp(s[0]+rnd(-1,1),s[1]+rnd(-1,1),pick(['#ffe9a0','#ffffff','#f2c230']),{life:.34,sz:ch(.3)?2:1});
    if(k>.68&&once(e,'c')){ring(s[0],s[1],'#ffe07a',70,.5);burst(s[0],s[1],['#ffe07a','#ffffff'],12,24,60)}
    [[.72,-22,-48,0],[.79,20,-52,1],[.86,-6,-55,0],[.92,24,-40,1]].forEach((q,i)=>{if(k>q[0]&&once(e,'f'+i)){const C2=q[3]?['#ffd24a','#fff3b0','#ffffff']:['#e0283a','#ff8a8a','#ffd24a'],x=e.x+q[1],y=e.y+q[2];
      ring(x,y,C2[0],60,.5);for(let j=0;j<12;j++){const a=j*TAU/12,v=rnd(26,36);rp(x,y,pick(C2),{vx:Math.cos(a)*v,vy:Math.sin(a)*v,g:50,life:rnd(.5,.75),sz:j%2?2:1})}rp(x,y,'#ffffff',{sh:'star',life:.4})}});
    if(k>.68&&on(10))rp(e.x+rnd(-26,26),e.y-rnd(44,56),pick(['#e0283a','#ffd24a']),{vy:rnd(14,26),vx:rnd(-5,5),life:1,sz:2})}});

/* ---------- Vader Trắng: Thần lực băng nâng sáu tinh thể băng lên xoay quanh, kiếm ánh sáng trắng xanh bật sáng rồi chém một vòng ---------- */
const VD=[[14,5],[30,6.5],[22,4.5],[38,6],[18,5],[33,5.5]];
function vdIce(g,e,p,k,t,front){
  const out=sat((.86-k)/.02);if(out<=0)return;
  VD.forEach((q,i)=>{const a=i*TAU/6+t*.55,z=Math.sin(a);if((z>=0)!==!!front)return;const up=ease(seg(k,.06+i*.03,.4+i*.03)),x=p.x+Math.cos(a)*(24+2*Math.sin(i)),w=q[1]*(1+.15*z),h=w*2.3,y=e.y-1+z*4-q[0]*up+Math.sin(t*2.2+i)*1.6*up+h*.5;
    A(g,.3*up);C(g,x,e.y-1+z*4,w*.9,'#5a8ab8',1.4);
    A(g,up);P(g,[x,y-h,x+w/2,y-h*.72,x+w/2,y-h*.26,x,y,x-w/2,y-h*.26,x-w/2,y-h*.72],'#8ecbf8');P(g,[x,y-h,x,y,x-w/2,y-h*.26,x-w/2,y-h*.72],'#dff3ff');
    R(g,x-w*.3,y-h*.68,.8,h*.36,'#ffffff');L(g,x,y-h,x,y,'#6aa8e0',.4)});
}
reg('v_vader',{n:'dùng Thần lực băng nâng tinh thể, vung kiếm ánh sáng trắng',dur:4.6,
  draw(g,e,p,k,t){const v=fd(k,.02,.98,.09);A(g,.42*v);C(g,p.x,e.y-1,31,'#bfe6ff',6);A(g,.5*v);C(g,p.x+3,e.y-1,20,'#ffffff',3);
    A(g,.2*v);C(g,p.x,p.y-20,29,'#9ad4ff',26);
    A(g,.5*v);for(let i=0;i<7;i++){const x=p.x-27+i*9+hr(i)*3,h=3+hr(i,2)*5;P(g,[x-1.5,e.y,x,e.y-h,x+1.5,e.y],'#e4f6ff')}
    vdIce(g,e,p,k,t,0)},
  over(g,e,p,k,t){vdIce(g,e,p,k,t,1);
    const d=dir(e),on2=ease(seg(k,.44,.54)),off=sat((.97-k)/.04),len=31*on2*off;if(len<=.5)return;
    const sw=seg(k,.62,.8),sm=sw*sw*(3-2*sw),ang=-PI/2+d*(-.85+sm*2.5)+(sw>=1?d*.05*Math.sin(t*6):0),hx=p.x+d*9,hy=p.y-11,c=Math.cos(ang),s=Math.sin(ang);
    if(sw>0&&k<.9){const a0=-PI/2+d*(-.85),fa=1-seg(k,.8,.9);A(g,.3*fa);g.fillStyle='#bfe6ff';g.beginPath();g.moveTo(hx,hy);g.arc(hx,hy,31,Math.min(a0,ang),Math.max(a0,ang));g.closePath();g.fill();
      A(g,.7*fa);g.strokeStyle='#ffffff';g.lineWidth=1;g.beginPath();g.arc(hx,hy,31,Math.min(a0,ang),Math.max(a0,ang));g.stroke()}
    A(g,.3);L(g,hx,hy,hx+c*len,hy+s*len,'#9ad4ff',5.5);A(g,1);L(g,hx,hy,hx+c*len,hy+s*len,'#bfe6ff',2.8);L(g,hx+c*2,hy+s*2,hx+c*len,hy+s*len,'#ffffff',1.3);
    L(g,hx-c*3.5,hy-s*3.5,hx+c*1.5,hy+s*1.5,'#3a3848',2.4);L(g,hx-c*1,hy-s*1,hx+c*.5,hy+s*.5,'#c8ccd8',2.6)},
  fx(e,p,k,t){const d=dir(e);
    if(on(9))rp(p.x+rnd(-30,30),p.y-rnd(34,56),pick(['#ffffff','#dff3ff']),{vx:rnd(-6,6),vy:rnd(10,22),life:rnd(.8,1.2),sz:ch(.3)?2:1});
    if(k<.42&&on(20))rp(p.x+rnd(-26,26),e.y-1,pick(['#bfe6ff','#ffffff']),{vy:-rnd(14,34),life:rnd(.3,.5)});
    if(k>.46&&once(e,'a')){ring(p.x+d*9,p.y-26,'#ffffff',70,.5);burst(p.x+d*9,p.y-28,['#ffffff','#bfe6ff'],10,20,50)}
    if(k>.86&&once(e,'b')){VD.forEach((q,i)=>{const a=i*TAU/6+t*.55;burst(p.x+Math.cos(a)*24,e.y-q[0]-4,['#dff3ff','#8ecbf8','#ffffff'],4,20,60,{g:90,sz:2})});ring(p.x,p.y-20,'#ffffff',110,.5);ring(p.x,p.y-20,'#9ad4ff',75,.6)}}});

/* ---------- Nyan · Tac Nayn: bay kéo hai dải cầu vồng tối xoắn vào nhau, vòng tối quấn quanh mình, sao tối và nhiễu pixel ---------- */
const TAC=['#8a1f3a','#8a4a1f','#7a741f','#1f6a3a','#1f3f8a','#4a1f8a'];
function tacRing(g,p,t,v,front){for(let j=0;j<2;j++){A(g,.9*v);g.strokeStyle=j?'#8a1f3a':'#4a1f8a';g.lineWidth=1.6;g.beginPath();const tl=(j?-.5:.5),a0=front?0:PI;g.ellipse(p.x,p.y-15,20+2*Math.sin(t*5+j),8,tl+Math.sin(t*2)*.2,a0,a0+PI);g.stroke();
  A(g,.8*v);g.strokeStyle='#e04ad0';g.lineWidth=.5;g.stroke()}}
reg('v_nyan',{n:'bay kéo cầu vồng tối xoắn và nhiễu pixel',dur:4.4,pose:k=>'run'+Math.floor(k*18)%8,hover:k=>9+Math.sin(k*20)*2,glide:30,
  draw(g,e,p,k,t){const r=st(e),H=r.h||(r.h=[]),v=fd(k,.01,.99,.06),l=H[H.length-1];
    if(!l||Math.abs(l[0]-p.x)>=2.2){H.push([p.x,p.y,e.flip]);if(H.length>30)H.shift()}
    A(g,.3*v);C(g,p.x,p.y-15,26,'#2a1040',20);
    for(let i=H.length-2;i>=0;i--){const q=H[i],age=H.length-1-i,f=1-(age/30)*(age/30),w=2.6,ph=age*.42-t*9;if(age<4)continue;   // hai dải ba màu xoắn vào nhau phía sau
      for(let s=0;s<2;s++){const oy=Math.sin(ph+s*PI)*5.5,front=Math.cos(ph+s*PI)>0;A(g,v*f*(front?1:.8));for(let c=0;c<3;c++)R(g,q[0]-w/2,q[1]-17+oy+(c-1.5)*2,w+.3,2,TAC[s*3+c])}}
    tacRing(g,p,t,v,0)},
  over(g,e,p,k,t){const v=fd(k,.01,.99,.06);tacRing(g,p,t,v,1);
    for(let i=0;i<7;i++){const sl=Math.floor(t*2.2+i*.37),f=(t*2.2+i*.37)%1,x=Math.round(p.x+(hr(sl,i)-.5)*58),y=Math.round(p.y-18+(hr(sl,i+9)-.5)*44),s=f<.5?f*2:2-f*2;if(s<.2)continue;   // sao tối nhấp nháy
      A(g,v*s);const r=s>.7?3:2;R(g,x-r,y,2*r+1,1,'#16101e');R(g,x,y-r,1,2*r+1,'#16101e');R(g,x-1,y-1,3,3,'#16101e');R(g,x,y,1,1,'#e04ad0')}
    const gs=Math.floor(t*11);if(hr(gs)<.55)for(let i=0;i<4;i++){const x=Math.round(p.x+(hr(gs,i)-.5)*50),y=Math.round(p.y-18+(hr(gs,i+5)-.5)*40),w=4+Math.floor(hr(gs,i+11)*14);   // nhiễu pixel: các vạch ngang lệch màu
      A(g,.85*v);R(g,x,y,w,i%2?2:1,['#ff2ad4','#2ae6ff','#16101e','#ffffff'][Math.floor(hr(gs,i+17)*4)]);if(i<2){A(g,.5*v);R(g,x+2,y+1,w,1,'#2ae6ff')}}},
  fx(e,p,k){if(on(12))rp(p.x+rnd(-20,20),p.y-rnd(-2,36),pick(['#e04ad0','#4a1f8a','#16101e','#ff3a3a']),{vy:rnd(-12,12),vx:(e.flip?-1:1)*rnd(10,30),life:.5,sz:ch(.5)?2:1});
    if(on(1.6))ring(p.x,p.y-15,'#4a1f8a',50,.5)}});

/* ---------- Thần Tài · Vàng ròng: cột sáng vàng, mưa thỏi vàng xếp thành đống hai bên, xu rơi dày, nén vàng lớn nổi trên đầu ---------- */
const MK=[[-23,0],[23,0],[-15,0],[15,0],[-19,-4],[19,-4],[-27,-4],[27,-4],[-23,-8],[23,-8],[-31,0],[31,0]];
const ingot=(g,x,y)=>{x=Math.round(x);y=Math.round(y);R(g,x-4,y-4,8,4,'#b87a14');R(g,x-4,y-4,8,3,'#f0b93a');R(g,x-3,y-5,6,2,'#ffe07a');R(g,x-2,y-5,3,1,'#fff7d0');R(g,x-4,y-1,8,1,'#c88a1a')};
reg('v_maneki',{n:'gọi mưa thỏi vàng xếp thành núi vàng',dur:4.4,hover:k=>Math.abs(Math.sin(k*24))*2,
  draw(g,e,p,k,t){const v=fd(k,.02,.98,.08),y=e.y,fl=.85+.15*Math.sin(t*9);
    A(g,.16*v*fl);R(g,e.x-17,y-60,34,60,'#ffe07a');A(g,.2*v*fl);R(g,e.x-12,y-60,24,60,'#ffe07a');A(g,.24*v*fl);R(g,e.x-6,y-60,12,60,'#fff7d0');
    A(g,.5*v);C(g,e.x,y-1,34,'#ffd24a',6.5);A(g,.5*v);C(g,e.x,y-1,22,'#fff1b0',3.6);
    A(g,.2*v);for(let i=0;i<5;i++){const x=e.x-14+i*7+Math.sin(t*2+i)*1.5,f=(t*.9+hr(i))%1;R(g,x,y-58+f*52,1,6,'#ffffff')}},
  over(g,e,p,k,t){const out=sat((.985-k)/.06),y=e.y;
    MK.forEach((q,i)=>{const t0=.1+i*.055,f=seg(k,t0,t0+.1);if(f<=0)return;const fy=f<1?(1-f*f)*52:0;A(g,out*(f<1?.5+.5*f:1));ingot(g,e.x+q[0],y+1+q[1]-fy);
      if(f>=1&&Math.floor(t*5+i*1.7)%6===0){A(g,out);spark(g,e.x+q[0]-2,y-4+q[1],2,'#fff7d0')}});
    const b=ease(seg(k,.5,.66))*out;if(b>0){const x=e.x,by=p.y-49-Math.sin(t*4)*1.5+(1-b)*8;A(g,.3*b);rays(g,x,by-2,10,t*.8,13,9,.12,'#fff1b0');A(g,.35*b);C(g,x,by-2,9,'#ffe07a',7);   // nén vàng lớn hình thuyền
      A(g,b);P(g,[x-9,by-5,x-6,by-3,x+6,by-3,x+9,by-5,x+7,by+1,x-7,by+1],'#f0b93a');R(g,x-7,by,14,1.2,'#b87a14');C(g,x,by-3.4,4.2,'#ffe07a',3.2);C(g,x-1,by-4.4,1.6,'#fff7d0',1.1);R(g,x-8,by-4.4,2,1,'#fff1b0')}},
  fx(e,p,k){
    if(k<.94&&on(24))rp(e.x+rnd(-28,28),e.y-rnd(46,58),'#f2c230',{sh:'coin',vx:rnd(-6,6),vy:rnd(20,40),g:110,gy:e.y-1,life:1});
    if(on(9))rp(e.x+rnd(-26,26),e.y-rnd(4,50),pick(['#ffe9a0','#ffffff']),{sh:'star',life:.5});
    MK.forEach((q,i)=>{if(k>.2+i*.055&&once(e,'i'+i))burst(e.x+q[0],e.y+q[1]-1,['#ffe07a','#fff7d0'],3,14,34,{life:.3})});
    if(k>.62&&once(e,'a')){ring(e.x,p.y-51,'#ffe07a',70,.6);burst(e.x,p.y-51,['#ffe07a','#ffffff','#f0b93a'],14,26,60)}}});

/* ---------- Phi Hành Gia · Bộ đồ phóng tàu cam: tên lửa nhỏ bên cạnh, đếm 3-2-1, phụt lửa khói rồi phóng lên; bé trôi lơ lửng nhìn theo ---------- */
const DIG={3:'111001111001111',2:'111001111100111',1:'010110010010111'};
const digit=(g,n,x,y,s,c)=>{const m=DIG[n];for(let i=0;i<15;i++)if(m[i]==='1')R(g,x+(i%3-1.5)*s,y+Math.floor(i/3)*s,s,s,c)};
function rocket(g,x,y,fl,t){
  if(fl>0){const h=(7+3*Math.sin(t*40))*fl;P(g,[x-2.4,y,x+2.4,y,x,y+h+3],'#ff5a1a');P(g,[x-1.6,y,x+1.6,y,x,y+h],'#ffb347');P(g,[x-.8,y,x+.8,y,x,y+h*.55],'#fff7d0')}
  P(g,[x-5.5,y,x-3,y-6,x-3,y],'#e0602a');P(g,[x+5.5,y,x+3,y-6,x+3,y],'#e0602a');R(g,x-2,y-1,4,1.6,'#6a6478');
  R(g,x-3,y-14,6,13,'#f4f4f8');R(g,x+1,y-14,2,13,'#d0d4e0');R(g,x-3,y-5.5,6,1.6,'#f08a3a');
  P(g,[x-3,y-14,x,y-20,x+3,y-14],'#f08a3a');P(g,[x,y-20,x+3,y-14,x+1,y-14],'#d06a24');
  C(g,x,y-10.5,1.9,'#3a4a6a');C(g,x,y-10.5,1.3,'#8ad4ff');R(g,x-.9,y-11.4,.8,.8,'#ffffff');
}
const asH=k=>{const f=seg(k,.54,.92);return f*f*74};
reg('v_astro',{n:'đếm 3-2-1 phóng tên lửa nhỏ',dur:5.2,hover:k=>Math.sin(PI*seg(k,.56,1))*13,
  draw(g,e,p,k,t){const v=fd(k,.56,.99,.1);A(g,.2*v);C(g,p.x,p.y-18,26,'#ffb347',24)},
  over(g,e,p,k,t){const d=dir(e),x=e.x+d*21,y=e.y,inn=seg(k,.01,.07),h=asH(k),ig=seg(k,.44,.5),a=inn*sat((60-h)/16),sh=k>.44&&k<.6?Math.sin(t*70)*.6:0;
    A(g,inn*sat((.985-k)/.05));R(g,x-7,y-1.5,14,2.5,'#6a6478');R(g,x-7,y-1.5,14,1,'#9a94a8');R(g,x-8,y+.4,2,1.6,'#4a4458');R(g,x+6,y+.4,2,1.6,'#4a4458');
    if(a>0){g.save();g.beginPath();g.rect(x-20,e.y-62,40,62+8);g.clip();A(g,a);rocket(g,x+sh,y-2-h,ig,t);g.restore()}
    const n=k>=.08&&k<.2?3:k>=.2&&k<.32?2:k>=.32&&k<.44?1:0;if(n){const f=n===3?seg(k,.08,.2):n===2?seg(k,.2,.32):seg(k,.32,.44),s=f<.15?1.4+f*6:2.3-(f>.8?(f-.8)*3:0),cy=y-34-s*2.5;   // số đếm nổi phía trên tên lửa
      A(g,sat((1-f)*6));digit(g,n,x+.7,cy+.7,s,'#5a2a0a');digit(g,n,x,cy,s,n===1?'#ff5a1a':'#ffb347');}
    if(k>.5&&k<.62){A(g,.5*fd(k,.5,.62,.03));C(g,x,y-1,13,'#fff3b0',4)}},
  fx(e,p,k){const d=dir(e),x=e.x+d*21,y=e.y,h=asH(k);
    if(k>.07&&once(e,'p'))for(let i=0;i<10;i++)rp(x+rnd(-7,7),y-rnd(2,20),pick(SMOKE),{vx:rnd(-14,14),vy:-rnd(4,18),life:rnd(.35,.7),sz:ch(.5)?3:2,a:.9});
    [.08,.2,.32].forEach((q,i)=>{if(k>q&&once(e,'d'+i))ring(x,y-30,'#ffb347',40,.4)});
    if(k>.44&&k<.7&&on(32)){const s=ch(.5)?1:-1;rp(x+s*rnd(1,5),y-2,pick(['#e8e4ee','#c8c2d0','#ffffff','#a8a2b4']),{vx:s*rnd(14,46),vy:-rnd(2,14),life:rnd(.5,.9),sz:ch(.6)?3:2,a:.85})}
    if(k>.5&&h<58&&on(28))rp(x+rnd(-2,2),y-2-h+rnd(2,8),pick(['#ffb347','#ff5a1a','#fff3b0','#c8c2d0']),{vy:rnd(16,40),vx:rnd(-5,5),life:rnd(.3,.6),sz:ch(.4)?2:1});
    if(k>.54&&once(e,'a')){ring(x,y-2,'#ffb347',80,.5);ring(x,y-2,'#ffffff',55,.6)}
    if(k>.6&&on(12))rp(p.x+rnd(-18,18),p.y-rnd(0,40),'#ffffff',{sh:ch(.5)?'star':undefined,life:.6})}});

/* ---------- Hoàng Gia · Hoàng bào tím: thảm tím trải ra, hai luồng sáng rọi, vương miện lớn hạ xuống tỏa tia, hoa giấy tím vàng ---------- */
reg('v_royal',{n:'đăng quang trên thảm tím giữa pháo hoa giấy',dur:4.4,
  draw(g,e,p,k,t){const v=fd(k,.02,.985,.07),w=31*ease(seg(k,0,.22))*sat((.995-k)/.06),y=Math.round(e.y-3),x=e.x,pk=fd(k,.5,.95,.08);
    A(g,.18*v+.1*pk);P(g,[x-34,y-57,x-22,y-57,x+8,y+2,x-12,y+2],'#e6d0ff');P(g,[x+34,y-57,x+22,y-57,x-8,y+2,x+12,y+2],'#e6d0ff');
    A(g,.22*v+.14*pk);C(g,x,p.y-20,27,'#b98bff',25);
    if(w>1){A(g,1);R(g,x-w,y,2*w,7,'#6a2ac0');R(g,x-w,y,2*w,1,'#f2c230');R(g,x-w,y+6,2*w,1,'#f2c230');R(g,x-w,y+3,2*w,1,'#8a4ae0');
      for(let i=-4;i<=4;i++){const dx=i*7;if(Math.abs(dx)<w-3){R(g,x+dx-1,y+2.5,2,2,'#f2c230');R(g,x+dx-.5,y+3,1,1,'#fff1b0')}}
      R(g,x-w-1.5,y-.5,2,8,'#c89a2a');R(g,x+w-.5,y-.5,2,8,'#c89a2a')}},
  over(g,e,p,k,t){const dn=ease(seg(k,.2,.52)),out=sat((.985-k)/.05),a=sat(seg(k,.2,.3))*out;if(a<=0)return;
    const x=Math.round(p.x),y=Math.round(p.y-57+dn*13+(dn>=1?Math.sin(t*4)*1.2:0)),pk=fd(k,.5,.95,.08);
    if(pk>0){A(g,.4*pk*a);rays(g,x,y-3,12,t*.9,17,11,.1,'#fff1b0');A(g,.35*pk*a);C(g,x,y-3,11,'#ffe07a',8)}
    A(g,a);R(g,x-8,y-3,16,4,'#c88a1a');R(g,x-8,y-4,16,4,'#f2c230');R(g,x-8,y-4,16,1,'#ffe07a');
    [-8,-4,0,4,8].forEach((dx,i)=>{const hh=i%2?5:8;P(g,[x+dx-2.2,y-4,x+dx,y-4-hh,x+dx+2.2,y-4],'#f2c230');R(g,x+dx-.8,y-5-hh,1.6,1.6,i===2?'#e0283a':'#fff7d0')});
    R(g,x-6,y-3,2,2,'#b46aff');R(g,x-1,y-3,2,2,'#e0283a');R(g,x+4,y-3,2,2,'#b46aff');R(g,x-7,y-4,3,1,'#fff7d0');
    if(pk>0&&Math.floor(t*6)%2){A(g,pk*a);spark(g,x+(Math.floor(t*3)%2?7:-6),y-9,2.5,'#ffffff')}},
  fx(e,p,k){
    if(k>.08&&k<.96&&on(24))rp(p.x+rnd(-30,30),p.y-rnd(46,57),pick(['#b46aff','#8a4ae0','#ffd24a','#fff1b0','#ffffff','#e6d0ff']),{vy:rnd(22,36),vx:rnd(-8,8),life:rnd(.9,1.3),sz:ch(.6)?2:1});
    if(k>.52&&once(e,'a')){ring(p.x,p.y-49,'#ffe07a',80,.6);ring(p.x,p.y-49,'#b46aff',55,.7);for(let s=-1;s<=1;s+=2)for(let i=0;i<7;i++)rp(e.x+s*28,e.y-4,pick(['#b46aff','#ffd24a','#ffffff']),{vx:-s*rnd(4,30),vy:-rnd(50,96),g:120,life:rnd(.7,1),sz:2})}
    if(k>.78&&once(e,'b')){for(let s=-1;s<=1;s+=2)for(let i=0;i<7;i++)rp(e.x+s*28,e.y-4,pick(['#8a4ae0','#ffe07a','#e6d0ff']),{vx:-s*rnd(4,30),vy:-rnd(50,96),g:120,life:rnd(.7,1),sz:2});ring(p.x,p.y-20,'#b98bff',90,.6)}
    if(on(6))rp(p.x+rnd(-14,14),p.y-rnd(40,54),'#fff1b0',{sh:'star',life:.45})}});
})();
