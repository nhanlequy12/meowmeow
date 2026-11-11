"use strict";
/* Hình thiết bị thời tiết nhóm 01 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,dk,lt}=Art.K;
const CREAM=[250,235,208],MILK=[255,247,227],CORAL=[222,141,122],MINT=[154,190,170],
  TEAL=[87,130,125],INK=[105,79,73],HONEY=[242,187,104],HOT=[243,139,83],
  WOOL=[233,210,175],LILAC=[185,174,201];
const round=(b,x,y,w,h,r,c,reg)=>{
  b.rect(x+r,y,w-2*r,h,c,reg);b.rect(x,y+r,w,h-2*r,c,reg);
  for(const cx of [x+r,x+w-r])for(const cy of [y+r,y+h-r])b.ell(cx,cy,r-.25,r-.25,c,reg);
};
const stitch=(b,x0,x1,y,c,step=2)=>{for(let x=x0;x<x1;x+=step)b.cap(x,y,Math.min(x+.7,x1),y,.18,c,'x')};
const paw=(b,x,y,c,s=1)=>{
  b.ell(x,y+.5*s,1.25*s,.85*s,c,'x');
  [[-1.4,-.7],[-.5,-1.3],[.6,-1.3],[1.5,-.6]].forEach(([dx,dy])=>b.ell(x+dx*s,y+dy*s,.45*s,.55*s,c,'x'));
};
const lamp=(b,x,y,on)=>{b.ell(x,y,.7,.7,TEAL,'x');b.ell(x,y,.35,.35,on?HONEY:[184,221,165],'x')};
const digit2=(b,x,y,c)=>{
  [[0,0,1.6,0],[1.6,0,1.6,1.3],[0,1.4,1.6,1.4],[0,1.4,0,2.8],[0,2.8,1.6,2.8]]
    .forEach(p=>b.cap(x+p[0],y+p[1],x+p[2],y+p[3],.22,c,'x'));
};
Art.addFurn({
  heatmini(b,v,a){
    const c=C(a,0,CORAL),on=v==='a1';
    // A low, cordless silhouette leaves the cat's spot to the right clear.
    round(b,5,1.5,6,3.5,1,dk(c,.16));round(b,6,2.5,4,2,.5,CREAM,'x');
    b.rect(3.5,15,2.5,2,TEAL);b.rect(10,15,2.5,2,TEAL);
    round(b,2,4,12,12,2,c);b.cap(4.5,5,11.5,5,.25,lt(c,.48),'x');
    b.ell(8,10,4.65,4.65,CREAM,'x');b.ell(8,10,3.8,3.8,[151,102,83],'x');
    for(let k=0;k<3;k++){
      const t=k*Math.PI*2/3+(on?.65:0),p=t+.85;
      b.tri(8,10,8+Math.cos(t)*3.2,10+Math.sin(t)*3.2,8+Math.cos(p)*2.8,10+Math.sin(p)*2.8,HOT,'x');
      b.cap(8+Math.cos(t)*1.7,10+Math.sin(t)*1.7,8+Math.cos(p)*2.4,10+Math.sin(p)*2.4,.5,HONEY,'x');
    }
    for(let x=5;x<=11;x+=2)b.cap(x,7.7-Math.abs(x-8)*-.15,x,12.3-Math.abs(x-8)*.15,.22,CREAM,'x');
    b.ell(8,10,.85,.85,CREAM,'x');b.ell(8,10,.3,.3,dk(c,.24),'x');
    b.ell(5,14.8,.7,.7,CREAM,'x');b.cap(5,14.8,5.3,14.3,.2,INK,'x');
    lamp(b,11,14.7,on);b.rect(7,14.5,2,.5,lt(c,.5),'x');
  },
  heatpro(b,v,a){
    const c=C(a,0,MINT),on=v==='a1';
    round(b,6,1.5,8,3,1,TEAL);round(b,7.5,2.3,5,1.8,.5,CREAM,'x');
    b.ell(5,23.8,1.5,1,INK);b.ell(15,23.8,1.5,1,INK);
    b.rect(4,22,2,2,TEAL);b.rect(14,22,2,2,TEAL);
    round(b,2.5,4,15,19,2,c);b.cap(4.5,4.8,15.5,4.8,.25,lt(c,.5),'x');
    round(b,4.5,5.8,9.5,4.8,1,TEAL,'x');
    digit2(b,5.5,6.5,[226,239,189]);digit2(b,9,6.5,[226,239,189]);
    b.ell(12,6.6,.3,.3,HONEY,'x');lamp(b,15.5,7,on);
    b.ell(15.5,9.5,.65,.65,CREAM,'x');b.cap(15.5,9.5,15.8,9.1,.2,TEAL,'x');
    round(b,4,11.5,12,10,1,[124,150,132],'x');
    for(let i=0;i<5;i++){
      const x=4.5+i*2.3;
      round(b,x,11.8,1.8,9, .75,i%2?CREAM:lt(c,.44),'x');
      b.cap(x+.8,13,x+.8,19.4,.25,HONEY,'x');
      b.cap(x+.8,15+(on?i%2:1-i%2),x+.8,16.4+(on?i%2:1-i%2),.3,HOT,'x');
      b.set(x+.4,12.5,MILK,'x');
    }
    b.cap(4.5,21.5,15.5,21.5,.3,TEAL,'x');
    b.ell(10,22.2,.85,.35,CREAM,'x');
  },
  heatlamp(b,v,a){
    const c=C(a,0,CORAL),on=v==='a1';
    b.ell(7,37.3,5.1,1.2,TEAL);b.ell(7,36.8,4.2,.65,MINT,'x');
    b.cap(7,10.5,7,36,1,[191,155,108]);b.cap(6.7,12,6.7,35,.25,HONEY,'x');
    round(b,5.5,25,3,3.5,.75,TEAL,'x');b.rect(6.5,26,1,1.5,CREAM,'x');
    lamp(b,7,29.8,on);
    b.ell(7,8.5,4.3,3.1,CREAM);b.ell(7,8.6,3.5,2.3,[169,112,81],'x');
    b.ell(7,8.3,2.8,1.6,HOT,'x');b.ell(7,8.1,on?2.1:1.6,1,HONEY,'x');
    for(let x=4;x<=10;x+=1.5)b.cap(x,7.5,x,9.8,.22,CREAM,'x');
    b.cap(3.8,9.5,10.2,9.5,.22,CREAM,'x');
    b.cap(10.5,10,10.5,17,.22,INK);b.ell(10.5,17.5,.6,.85,HONEY);
    b.ell(7,5.7,5,3.5,c,undefined,(x,y)=>y<=6);
    b.ell(7,2.7,1.2,.55,TEAL);b.cap(2,6.4,12,6.4,.65,lt(c,.18));
    b.cap(4,4.5,5.5,3.7,.25,lt(c,.55),'x');
    b.cap(4.5,11,9.5,11,.35,TEAL,'x');
  },
  eblanket(b,v,a){
    const c=C(a,0,CORAL),on=v==='a1';
    round(b,1.5,1.5,37,7.2,2,dk(c,.12));
    round(b,1.5,1.5,37,5.5,2,lt(c,.2),'x');
    // The front seam is the y=7 sleeping surface for both cats.
    b.cap(4,7,35.5,7,.25,dk(c,.25),'x');
    for(let x=5;x<37;x+=6){
      b.cap(x,2.2,x,6.4,.23,CREAM,'x');
      b.cap(x+2,2.5,x+3,3.5,.2,lt(c,.52),'x');
    }
    for(const y of [3.8,5.5])b.cap(3,y,36.5,y,.2,lt(c,.46),'x');
    paw(b,11,4.4,CREAM,.8);paw(b,29,4.4,CREAM,.8);
    stitch(b,4,34,7.9,CREAM);
    round(b,34,6,3.5,2.5,.6,CREAM,'x');b.rect(34.8,6.5,1.5,.7,TEAL,'x');
    b.set(on?35.5:34.8,6.5,HONEY,'x');b.cap(35,8,35,8.5,.2,TEAL,'x');
    b.tri(2.5,2.8,5.5,2,3.5,5,lt(c,.48),'x');
  },
  furblanket(b,v,a){
    const c=C(a,0,WOOL),under=C(a,1,LILAC);
    round(b,1.8,3,40.4,7.5,2,under);
    round(b,2,2.3,40,6.3,2,c,'x');
    for(let x=4;x<=40;x+=3){
      b.ell(x,2.9,1.6,1.1,lt(c,.24),'x');
      b.ell(x,8.6,1.6,1.4,lt(c,.14),'x');
      b.ell(x+.3,8.5,.6,.45,MILK,'x');
    }
    for(const x of [3,41])for(let y=4;y<=7;y+=1.8)b.ell(x,y,1.1,1.1,lt(c,.16),'x');
    // Short curls give the broad, level y=8 surface a sherpa pile.
    for(let row=0;row<3;row++)for(let x=6+row%2*2;x<40;x+=4){
      const y=4+row*1.15;
      b.cap(x-.5,y-.3,x,y+.2,.2,dk(c,.12),'x');
      b.cap(x,y+.2,x+.7,y-.3,.2,MILK,'x');
    }
    paw(b,12,5.8,lt(under,.2),.8);paw(b,32,5.8,lt(under,.2),.8);
    b.tri(3,3.8,9,3.1,4,6.9,under,'x');
    b.cap(4.2,4.5,6.9,3.9,.22,lt(under,.55),'x');
    stitch(b,5,39,9.7,CREAM,2.5);
    b.rect(36.5,8.7,2,1.5,MILK,'x');b.cap(37,9,37.8,9.4,.2,CORAL,'x');
  },
  heatcatbed(b,v,a){
    const c=C(a,0,MINT),on=v==='a1',plush=C(a,1,CORAL);
    b.rect(6,15,3,2,INK);b.rect(27,15,3,2,INK);
    b.tri(5,7,7.5,2.8,12,6.5,c);b.tri(24,6.5,28.5,2.8,31,7,c);
    b.tri(7,6,7.7,4.5,9.5,6,lt(plush,.3),'x');
    b.tri(26.5,6,28.3,4.5,29,6,lt(plush,.3),'x');
    b.ell(18,10,16.1,5.8,c);
    b.ell(18,8.1,13.5,3.8,lt(c,.27),'x');
    b.cap(9,7,11,6.3,.25,lt(c,.56),'x');b.cap(25,6.3,27,7,.25,lt(c,.56),'x');
    b.ell(18,10.7,12.4,3,dk(plush,.14),'x');
    b.ell(18,10.3,11.6,2.7,CREAM,'x');
    for(const x of [11,18,25]){
      b.cap(x-1,9.2,x,10.2,.2,WOOL,'x');b.cap(x,10.2,x+1,9.2,.2,WOOL,'x');
    }
    // Cushion reaches y=13, matching the single sleeping anchor.
    b.cap(8,13.8,28,13.8,1.6,plush);b.ell(5.2,11.2,2.9,3.4,plush);b.ell(30.8,11.2,2.9,3.4,plush);
    b.cap(8.5,13.1,27.5,13.1,.25,lt(plush,.55),'x');
    stitch(b,10,23,14.6,CREAM);
    round(b,24,13.7,4,1.8,.5,CREAM,'x');
    lamp(b,25,14.5,on);b.rect(26.3,14.1,.7,.8,HOT,'x');
    b.cap(4.5,10.5,4.5,12.5,.25,lt(plush,.5),'x');
    b.cap(31,10.5,31,12.5,.25,lt(plush,.5),'x');
    paw(b,18,6.8,CREAM,.55);
  },
  heatmat(b,v,a){
    const c=C(a,0,LILAC),on=v==='a1';
    round(b,1.5,1.5,53,5.4,1.5,dk(c,.12));
    round(b,1.5,1.5,53,4.5,1.5,lt(c,.25),'x');
    // Three woven panels; their front edge is the y=6 sleeping surface.
    for(let i=0;i<3;i++){
      const x=4+i*16;
      round(b,x,2,15.5,3.6,.5,i===1?CREAM:lt(MINT,.24),'x');
      for(let xx=x+1;xx<x+15;xx+=2)b.cap(xx,2.5,xx,5.1,.18,i===1?WOOL:lt(MINT,.54),'x');
      b.cap(x+1,3.7,x+14.5,3.7,.18,i===1?lt(WOOL,.4):MINT,'x');
      paw(b,12+i*16,3.7,i===1?CORAL:TEAL,.5);
    }
    b.cap(3,6,52.5,6,.22,dk(c,.25),'x');stitch(b,4,50,6.5,CREAM);
    round(b,50.5,2,3,3.5,.6,CREAM,'x');
    b.rect(51.4,2.7,1.2,1,TEAL,'x');b.set(on?52:51.4,2.7,HONEY,'x');
    b.cap(51.5,4.4,52.3,4.4,.2,CORAL,'x');
    for(const x of [2.5,53.5])for(const y of [3,4.5])b.cap(x,y,x+.3,y+.4,.18,CREAM,'x');
  }
});
})();
