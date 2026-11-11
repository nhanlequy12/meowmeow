"use strict";
(()=>{
const P=CatKit.P,{hex}=CatKit.U;
const PINK=hex('#f0508a'),RIM=hex('#862c50'),MASK=hex('#302d3d'),WHITE=hex('#ffffff'),ZIP=hex('#a72e59');
CatKit.costume('v_guard',{
  shape(){},
  paint(c){
    if(c.part===P.HEAD||c.part===P.EAR){
      c.lv=0;
      const h=c.F.A.head,dx=(c.x-h[0]-(c.side?6:0))/(c.side?14:18),dy=(c.y-h[1]-3)/14;
      if(c.part===P.HEAD&&dx*dx+dy*dy<1)return MASK;
      return c.kind==='line'?RIM:PINK;
    }
    if(c.part===P.BODY||CatKit.isLeg(c.part)){
      if(c.kind==='line')return RIM;
      c.lv=c.mark?0:Math.max(-1,Math.min(c.lv,1));return PINK;
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),h=A.head,x=h[0]+(G.side?7:0),y=h[1]+3,w=G.side?6:9;
    // Tam giác kín, không để mắt mèo lọt qua mặt nạ.
    L.line(x,y-8,x-w,y+7,WHITE,2);
    L.line(x,y-8,x+w,y+7,WHITE,2);
    L.line(x-w,y+7,x+w,y+7,WHITE,2);
    if(!G.side&&G.F.anim!=='sleep')L.line(A.chest[0],A.chest[1]-5,A.chest[0],A.chest[1]+8,ZIP);
    L.stamp({outline:false,clip:(x,y)=>!!G.get(x,y)&&y<=73});
  }
});
})();
