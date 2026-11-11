"use strict";
(()=>{
const P=CatKit.P,{hex}=CatKit.U;
const HAIR=hex('#8a6a4a'),PINK=hex('#f5a8c0'),BLUE=hex('#4a6fb0'),SEAM=hex('#344c7a'),BLOOD=hex('#e0302a');
CatKit.costume('v_eleven',{
  // Giữ nguyên khung và nhịp chân Xoài.
  shape(){},
  paint(c){
    const A=c.A0;
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<=(c.side?A.head[1]-8:A.crown[1]+5)){
      if(c.mark)c.lv=0;return HAIR;
    }
    if(c.part===P.BODY){
      c.lv=c.mark?0:Math.max(-1,Math.min(c.lv,1));
      return c.side?(c.v<A.belly[1]-5?BLUE:PINK):(Math.abs(c.u-A.chest[0])>8?BLUE:PINK);
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),n=A.nose;
    // Vệt máu mũi nhỏ nhưng tương phản ở cả hai góc nhìn.
    L.rect(n[0]-(G.side?2:1),n[1]+2,2,4,BLOOD);
    if(!G.side&&G.F.anim!=='sleep'){
      const c=A.chest;
      L.line(c[0]-9,c[1]-4,c[0]-9,c[1]+5,SEAM);
      L.line(c[0]+9,c[1]-4,c[0]+9,c[1]+5,SEAM);
    }
    L.stamp({outline:false,clip:(x,y)=>!!G.get(x,y)&&y<=73});
  }
});
})();
