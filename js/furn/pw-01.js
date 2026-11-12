"use strict";
/* Hình đồ điện nhóm 01: ổ điện gắn tường, đèn khẩn cấp, điện mặt trời, máy phát dự phòng (Claude vẽ). Nạp sau js/art.js.
   Biến thể 'a1' là khung đang chạy/đang sáng. Máy phát là bộ lưu điện an toàn: không ống xả, không khói. */
(()=>{const {C,dk,lt}=Art.K;
const CREAM=[250,238,214],INK=[105,79,73],HOT=[243,139,83],HONEY=[242,187,104],LEAF=[150,205,120],TEAL=[110,196,190],
  SUN=[255,214,110],GLOW=[255,236,160],RUB=[150,150,160],CELL=[78,104,160],DEEP=[52,64,100];
const pill=(b,x,y,w,h,c,reg)=>{const r=Math.min(w,h)/2;b.rect(x+r,y,w-2*r,h,c,reg);b.ell(x+r,y+r,r-.2,r-.2,c,reg);b.ell(x+w-r,y+h-r,r-.2,r-.2,c,reg);b.rect(x,y+r,w,h-2*r,c,reg)};
const rrect=(b,x,y,w,h,r,c,reg)=>{b.rect(x+r,y,w-2*r,h,c,reg);b.rect(x,y+r,w,h-2*r,c,reg);[[x+r,y+r],[x+w-r,y+r],[x+r,y+h-r],[x+w-r,y+h-r]].forEach(p=>b.ell(p[0]-.25,p[1]-.25,r-.25,r-.25,c,reg))};
const batt=(b,x,y,on)=>{b.rect(x,y,3,1.6,INK,'x');b.rect(x+3,y+.4,.5,.8,INK,'x');b.rect(x+.4,y+.4,on?2.2:.8,.8,on?LEAF:HOT,'x')};
// lỗ cắm: mặt tròn hơi lõm, hai khe dọc và lỗ tiếp đất
const sock=(b,cx,cy,r,c)=>{b.ell(cx-.25,cy-.25,r,r,dk(c,.3),'x');b.ell(cx-.25,cy-.25,r-.5,r-.5,lt(c,.3),'x');
  const s=r*.38;b.rect(cx-s-.25,cy-r*.42,.5,r*.62,INK,'x');b.rect(cx+s-.25,cy-r*.42,.5,r*.62,INK,'x');b.dot(cx,cy+r*.5,INK,'x')};
const screw=(b,x,y,c)=>{b.ell(x,y,.45,.45,dk(c,.2),'x')};
// tia sét nhỏ
const bolt=(b,x,y,s,c)=>{b.tri(x+.6*s,y,x-.9*s,y+1.7*s,x+.2*s,y+1.7*s,c,'x');b.tri(x-.2*s,y+1.3*s,x+.9*s,y+1.3*s,x-.6*s,y+3*s,c,'x')};
const sparkle=(b,x,y,s,c)=>{b.cap(x-s,y,x+s,y,.18,c,'x');b.cap(x,y-s,x,y+s,.18,c,'x');b.dot(x,y,[255,255,250],'x')};
// tấm pin: tứ giác (trên hẹp hơn dưới: tấm nghiêng ra sau), lưới ô nx x ny
const L2=(p,q,t)=>[p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t];
const quad=(b,p,q,r,s,c,reg)=>{b.tri(p[0],p[1],q[0],q[1],r[0],r[1],c,reg);b.tri(p[0],p[1],r[0],r[1],s[0],s[1],c,reg)};
const panel=(b,TL,TR,BR,BL,frame,cell,nx,ny,on)=>{
  const P=(u,v)=>L2(L2(TL,TR,u),L2(BL,BR,u),v),W=BR[0]-BL[0],H=BL[1]-TL[1],eu=.9/W,ev=.9/H,gu=.42/W,gv=.42/H;
  quad(b,TL,TR,BR,BL,frame);
  quad(b,P(eu,ev),P(1-eu,ev),P(1-eu,1-ev),P(eu,1-ev),lt(cell,.45),'x');
  for(let i=0;i<nx;i++)for(let j=0;j<ny;j++){
    const u0=eu+(1-2*eu)*i/nx+gu,u1=eu+(1-2*eu)*(i+1)/nx-gu,v0=ev+(1-2*ev)*j/ny+gv,v1=ev+(1-2*ev)*(j+1)/ny-gv;
    const k=(i+j)%2?0:.06;quad(b,P(u0,v0),P(u1,v0),P(u1,v1),P(u0,v1),lt(cell,k+(j===0?.06:0)),'x');
  }
  // vệt bóng mờ chéo; khi nắng thì sáng lấp lánh
  const a=P(.12,.15),z=P(.3,.85);b.cap(a[0],a[1],z[0],z[1],.35,on?[255,255,240,170]:[255,255,255,50],'x');
  if(on){const a2=P(.62,.12),z2=P(.74,.6);b.cap(a2[0],a2[1],z2[0],z2[1],.25,[255,255,240,140],'x');
    const s1=P(.82,.25),s2=P(.2,.62);sparkle(b,s1[0],s1[1],1.1,[255,248,200]);sparkle(b,s2[0],s2[1],.8,[255,248,200])}
};
const leg=(b,x0,y0,x1,y1,c)=>{b.cap(x0,y0,x1,y1,.55,c)};
const led=(b,x,y,on,c)=>{b.ell(x,y,.6,.6,on?(c||LEAF):[150,150,150],'x');if(on)b.dot(x-.2,y-.2,[240,255,230],'x')};
const gauge=(b,cx,cy,r,on,c)=>{b.ell(cx,cy,r,r,dk(c,.25),'x');b.ell(cx,cy,r-.5,r-.5,CREAM,'x');
  for(let k=0;k<5;k++){const t=Math.PI*(1+k/4);b.dot(cx+Math.cos(t)*(r-.9),cy+Math.sin(t)*(r-.9),INK,'x')}
  const t=Math.PI*(on?1.75:1.2);b.cap(cx,cy,cx+Math.cos(t)*(r-1),cy+Math.sin(t)*(r-1),.18,HOT,'x');b.dot(cx,cy,INK,'x')};
const vents=(b,x,y,w,n,c)=>{for(let k=0;k<n;k++)b.cap(x,y+k*1.1,x+w,y+k*1.1,.22,dk(c,.22),'x')};
const outlet=(b,a,w,h,n,r,y0)=>{const c=C(a,0,CREAM);rrect(b,1.5,1.5,w-3,h-2.5,1.3,c);b.cap(2.6,2.3,w-2.6,2.3,.2,lt(c,.6),'x');
  const sp=(w-3)/n;for(let k=0;k<n;k++)sock(b,1.5+sp*(k+.5),y0,r,c);return c};
Art.addFurn({
  // ổ điện đơn: mặt kem, 1 lỗ cắm
  out1(b,v,a){const c=outlet(b,a,8,9,1,1.8,5);screw(b,4,2.6,c);screw(b,4,7.5,c)},
  // ổ đôi
  out2(b,v,a){const c=outlet(b,a,12,9,2,1.9,5);screw(b,6,5,c)},
  // ổ 4 cổng nằm ngang
  out4(b,v,a){outlet(b,a,18,9,4,1.6,5)},
  // ổ thông minh: màn hình xanh ngọc phía trên, 2 cổng phía dưới
  outsmart(b,v,a){
    const c=C(a,0,CREAM),on=v==='a1';rrect(b,1.5,1.5,9,9,1.3,c);
    rrect(b,2.4,2.2,7.2,3.2,.6,dk(c,.35),'x');b.rect(2.9,2.7,6.2,2.2,on?lt(TEAL,.25):dk(TEAL,.25),'x');
    if(on){b.rect(3.2,2.8,3.4,1.4,INK,'x');b.rect(6.6,3.2,.4,.6,INK,'x');[0,1,2].forEach(k=>b.rect(3.5+k*1,3.05,.7,.9,LEAF,'x'));b.dot(8.1,3.2,[255,255,240],'x');b.dot(8.6,3.7,[255,255,240],'x')}
    else b.cap(3.2,3.5,8.6,3.5,.2,dk(TEAL,.1),'x');
    sock(b,4,7.9,1.6,c);sock(b,8,7.9,1.6,c);
  },
  // ổ chống nước: gioăng cao su, nắp nhựa trong che phía trên
  outwet(b,v,a){
    const c=C(a,0,[214,232,240]);rrect(b,1.5,1.5,9,7.8,1.3,c);
    rrect(b,2.1,3,7.8,5.7,1,RUB,'x');rrect(b,2.6,3.5,6.8,4.7,.8,lt(c,.3),'x');
    sock(b,4.2,6,1.5,lt(c,.3));sock(b,7.8,6,1.5,lt(c,.3));
    rrect(b,1.9,1.9,8.2,4.2,.8,[180,215,245,150],'x');b.rect(2.2,1.9,7.6,.8,[120,160,200],'x');
    b.cap(3,3.2,4.6,3.2,.2,[255,255,255,190],'x');b.rect(5.3,5.6,1.4,.6,[120,160,200],'x');
  },
  // ổ cao cấp: vàng kim, tia sét ở giữa
  outpro(b,v,a){
    const c=C(a,0,[236,196,118]),on=v==='a1';rrect(b,1.5,1.5,11,7.8,1.3,c);b.cap(2.6,2.3,11.4,2.3,.2,lt(c,.6),'x');
    rrect(b,2.2,3,9.6,5.6,1,dk(c,.12),'x');
    sock(b,4.2,5.8,1.6,lt(c,.15));sock(b,9.8,5.8,1.6,lt(c,.15));
    if(on)b.ell(7,5.8,1.4,2,[255,246,190],'x');bolt(b,7,4.2,1,on?[255,214,60]:dk(c,.4));
    if(on){sparkle(b,6,3.6,.6,[255,250,210]);sparkle(b,8.2,7.8,.6,[255,250,210])}
  },
  // đèn khẩn cấp: đèn lồng nhỏ có quai xách, vạch pin ở đế
  elamp(b,v,a){
    const c=C(a,0,[240,170,140]),on=v==='a1';
    b.cap(2.8,4.2,3.3,1.6,.45,INK);b.cap(3.3,1.6,6.7,1.6,.45,INK);b.cap(6.7,1.6,7.2,4.2,.45,INK);
    pill(b,1.8,3.6,6.4,2,dk(c,.1));
    b.rect(2.4,5.4,5.2,5.8,on?GLOW:[226,234,240]);
    b.ell(5,8.3,1.5,1.9,on?[255,250,215]:[200,206,214],'x');b.ell(5,8.1,.6,.9,on?HONEY:[170,170,175],'x');
    b.cap(3.2,5.9,3.2,10.8,.22,dk(c,.3),'x');b.cap(6.8,5.9,6.8,10.8,.22,dk(c,.3),'x');
    if(on)b.dot(3.9,6.4,[255,255,245],'x');
    pill(b,1.4,10.9,7.2,4.6,c);b.cap(2.4,11.8,7.6,11.8,.2,lt(c,.45),'x');batt(b,3.3,12.9,on);
  },
  // tấm pin cơ bản: lưới 6x3 xanh đậm, chân đỡ nghiêng
  solar1(b,v,a){
    const c=C(a,0,[200,206,216]),on=v==='a1',S=dk(c,.25);
    leg(b,6,12,6.5,18.6,S);leg(b,22,12,21.5,18.6,S);leg(b,14,8,14,18.6,S);b.cap(6.3,16,21.7,16,.4,S);
    pill(b,3.5,18.2,6,1.6,dk(c,.35));pill(b,18.5,18.2,6,1.6,dk(c,.35));
    panel(b,[5,1.6],[23,1.6],[26.8,12.8],[1.2,12.8],c,CELL,6,3,on);
  },
  // bộ lưu trữ: tủ nhỏ xám xanh, mặt trời nhỏ, đèn mức pin
  solarbat(b,v,a){
    const c=C(a,0,[168,190,200]);
    b.rect(2.4,16.4,2.4,1.4,INK);b.rect(9.2,16.4,2.4,1.4,INK);
    rrect(b,1.5,1,11,15.8,1.2,c);b.cap(2.6,2,11.4,2,.22,lt(c,.5),'x');
    b.ell(7,4.6,1.4,1.4,SUN,'x');for(let k=0;k<8;k++){const t=k*Math.PI/4;b.cap(7+Math.cos(t)*2,4.6+Math.sin(t)*2,7+Math.cos(t)*2.6,4.6+Math.sin(t)*2.6,.2,HONEY,'x')}
    rrect(b,3,8,8,3.8,.6,dk(c,.35),'x');[0,1,2,3].forEach(k=>b.rect(3.7+k*1.75,8.7,1.3,2.4,k<3?LEAF:[120,130,140],'x'));
    vents(b,3.4,13,7.2,3,c);
  },
  // tấm pin cao cấp: khung bạc, ô đen-xanh bóng
  solar2(b,v,a){
    const c=C(a,0,[222,228,236]),on=v==='a1',S=dk(c,.3);
    leg(b,6,13.5,6.6,20.6,S);leg(b,24,13.5,23.4,20.6,S);leg(b,15,9,15,20.6,S);b.cap(6.4,17.6,23.6,17.6,.4,S);
    pill(b,3.5,20.2,6.5,1.6,dk(c,.4));pill(b,20,20.2,6.5,1.6,dk(c,.4));
    panel(b,[5,1.4],[25,1.4],[28.8,14.2],[1.2,14.2],c,DEEP,8,4,on);
  },
  // hệ thông minh: 2 tấm pin + hộp điều khiển có màn hình
  solarsmart(b,v,a){
    const c=C(a,0,[214,220,230]),on=v==='a1',S=dk(c,.3),box=C(a,1,[200,226,214]);
    [[5,12.6,5.6,22.6],[17,12.6,16.6,22.6],[23,12.6,23.4,22.6],[35,12.6,34.4,22.6]].forEach(l=>leg(b,l[0],l[1],l[2],l[3],S));
    pill(b,2.8,22.2,5.8,1.6,dk(c,.4));pill(b,31.4,22.2,5.8,1.6,dk(c,.4));
    panel(b,[4,1.4],[18,1.4],[19.4,12.8],[1.2,12.8],c,CELL,4,3,on);
    panel(b,[22,1.4],[36,1.4],[38.8,12.8],[20.6,12.8],c,CELL,4,3,on);
    b.cap(14,13.2,16,16.2,.3,INK);b.cap(26,13.2,24,16.2,.3,INK);
    rrect(b,13.5,15.5,13,12,1.2,box);b.cap(14.8,16.5,25.2,16.5,.22,lt(box,.5),'x');
    rrect(b,15,17.6,10,5,.6,dk(box,.4),'x');b.rect(15.6,18.2,8.8,3.8,on?lt(TEAL,.25):dk(TEAL,.25),'x');
    if(on){b.ell(17.6,19.6,.9,.9,SUN,'x');[0,1,2,3].forEach(k=>b.rect(19.6+k*1.1,21.4-k*.6-.6,.7,k*.6+.6,LEAF,'x'))}
    else b.cap(16.4,20.1,23.6,20.1,.2,dk(TEAL,.1),'x');
    led(b,16.2,24.8,on);led(b,18.2,24.8,on,HONEY);vents(b,20.4,24,4,2,box);
  },
  // máy phát mini: bộ lưu điện cầm tay có quai xách, đồng hồ đo
  gen1(b,v,a){
    const c=C(a,0,[150,206,192]),on=v==='a1';
    b.rect(3,14.6,3,1.2,INK);b.rect(14,14.6,3,1.2,INK);
    b.cap(5.5,5,6.2,2.3,.6,dk(c,.35));b.cap(6.2,2.3,13.8,2.3,.6,dk(c,.35));b.cap(13.8,2.3,14.5,5,.6,dk(c,.35));
    rrect(b,1.6,4.4,16.8,10.6,1.6,c);b.cap(3,5.4,17,5.4,.22,lt(c,.5),'x');
    gauge(b,5.6,9.8,3,on,c);
    rrect(b,10,7,7,6.2,.6,lt(c,.35),'x');sock(b,12,9.2,1.2,CREAM);sock(b,15,9.2,1.2,CREAM);
    led(b,11.6,12,on);batt(b,13.4,11.2,on);
  },
  // máy phát tiêu chuẩn: to hơn, có bánh xe và tay kéo
  gen2(b,v,a){
    const c=C(a,0,[156,184,228]),on=v==='a1';
    b.cap(20,5.5,21.6,2.2,.55,INK);b.cap(21.6,2.2,22.2,2.2,.55,INK);
    rrect(b,1.4,3.6,20.2,13.4,1.6,c);b.cap(2.8,4.6,20.2,4.6,.22,lt(c,.5),'x');
    vents(b,3,6,6,3,c);gauge(b,6.2,12.6,2.8,on,c);
    rrect(b,10.6,6,9.4,9,.6,lt(c,.35),'x');b.rect(11.4,6.8,7.8,2.4,on?lt(TEAL,.25):dk(TEAL,.25),'x');
    if(on)[0,1,2,3].forEach(k=>b.rect(11.9+k*1.6,7.3,1.1,1.4,LEAF,'x'));
    sock(b,13.2,11.6,1.3,CREAM);sock(b,17.2,11.6,1.3,CREAM);led(b,15.2,14,on);
    b.ell(5.4,17.4,2.2,2.2,INK);b.ell(5.4,17.4,.9,.9,[190,190,196],'x');b.ell(17.6,17.4,2.2,2.2,INK);b.ell(17.6,17.4,.9,.9,[190,190,196],'x');
  },
  // máy phát cao cấp: tủ lớn, màn hình, hai đồng hồ, dãy đèn
  gen3(b,v,a){
    const c=C(a,0,[196,180,226]),on=v==='a1';
    b.rect(3,22,4,1.6,INK);b.rect(23,22,4,1.6,INK);
    rrect(b,1.6,1.6,26.8,20.8,1.8,c);b.cap(3.2,2.7,26.8,2.7,.25,lt(c,.5),'x');
    rrect(b,3.4,3.8,14.4,7.2,.8,dk(c,.4),'x');b.rect(4.2,4.6,12.8,5.6,on?lt(TEAL,.25):dk(TEAL,.25),'x');
    if(on){b.cap(5,8.6,8,6.4,.25,LEAF,'x');b.cap(8,6.4,10.6,7.6,.25,LEAF,'x');b.cap(10.6,7.6,13.4,5.4,.25,LEAF,'x');batt(b,13,8.2,on);b.dot(15.8,5,[255,255,240],'x')}
    else b.cap(5,7.3,16.2,7.3,.22,dk(TEAL,.1),'x');
    gauge(b,21.4,6.4,2.7,on,c);
    [0,1,2,3].forEach(k=>led(b,20.2+k*1.5,10.4,on,k===3?HONEY:LEAF));
    rrect(b,3.4,12.6,23.2,8.4,.8,lt(c,.3),'x');
    sock(b,6.6,15.6,1.4,CREAM);sock(b,10.6,15.6,1.4,CREAM);sock(b,14.6,15.6,1.4,CREAM);
    vents(b,18,13.8,7,4,lt(c,.3));bolt(b,6.4,18.3,.7,on?[255,214,60]:dk(c,.3));b.rect(9,19.2,8.6,.8,dk(c,.25),'x');
  },
},{out1:[8,9],out2:[12,9],out4:[18,9],outsmart:[12,11],outwet:[12,10],outpro:[14,10],elamp:[10,16],
  solar1:[28,20],solarbat:[14,18],solar2:[30,22],solarsmart:[40,28],gen1:[20,16],gen2:[24,20],gen3:[30,24]});
})();
