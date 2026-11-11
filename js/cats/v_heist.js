"use strict";
(()=>{
const P=CatKit.P,{hex}=CatKit.U;
const RED=hex('#d0342c'),RIM=hex('#752724'),MASK=hex('#f6efe2'),DARK=hex('#34292b'),ZIP=hex('#8f2827'),NOSE=hex('#d0ac8f');
CatKit.costume('v_heist',{
  shape(){},
  paint(c){
    if(c.part===P.HEAD||c.part===P.EAR){
      c.lv=0;
      const h=c.F.A.head,dx=(c.x-h[0]-(c.side?6:0))/(c.side?14:18),dy=(c.y-h[1]-3)/14;
      if(c.part===P.HEAD&&dx*dx+dy*dy<1)return MASK;
      return c.kind==='line'?RIM:RED;
    }
    if(c.part===P.BODY||CatKit.isLeg(c.part)){
      if(c.kind==='line')return RIM;
      c.lv=c.mark?0:Math.max(-1,Math.min(c.lv,1));return RED;
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),h=A.head,n=A.nose,closed=G.F.anim==='sleep'||G.F.anim==='groom';
    // Lông mày và ria Dalí: nét dày, đầu ria vểnh.
    if(G.side){
      const e=A.eye;
      L.line(e[0]-3,e[1]-3,e[0]+2,e[1]-4,DARK,2);
      L.rect(e[0]-1,e[1],3,closed?1:3,DARK);
      L.line(n[0]-3,n[1]+7,n[0]-8,n[1]+8,DARK,3);
      L.line(n[0]-8,n[1]+8,n[0]-11,n[1]+4,DARK,3);
    }else{
      for(const e of [A.eyeL,A.eyeR]){
        L.line(e[0]-3,e[1]-4,e[0]+2,e[1]-4,DARK,2);
        L.rect(e[0]-1,e[1],3,closed?1:3,DARK);
      }
      for(const k of [-1,1]){
        L.line(h[0]+k,h[1]+9,h[0]+k*7,h[1]+11,DARK,3);
        L.line(h[0]+k*7,h[1]+11,h[0]+k*12,h[1]+6,DARK,3);
      }
      L.line(n[0],n[1]-1,n[0],n[1]+4,NOSE,2);
      if(G.F.anim!=='sleep')L.line(A.chest[0],A.chest[1]-5,A.chest[0],A.chest[1]+7,ZIP);
    }
    L.stamp({outline:false,clip:(x,y)=>!!G.get(x,y)&&y<=73});
  }
});
})();
