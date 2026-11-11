"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const BLUE=hex('#3d6fd0'),RED=hex('#d0342c'),GOLD=hex('#f2c230'),HAIR=hex('#292637'),INK=hex('#44304a');
K.costume('v_hero',{
  shape(){}, // Giữ nguyên khung và nhịp chân Xoài.
  paint(c){
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<=A.crown[1]+7&&c.kind==='fur'){c.lv=0;return HAIR}
    if(c.part===P.BODY||K.isLeg(c.part)){
      if(c.kind==='line')return INK;
      c.lv=c.mark?0:Math.max(-1,Math.min(1,c.lv));
      if(K.isLeg(c.part)&&c.v>=(c.side?A.footNF[1]-7:A.pawL[1]-5))return RED;
      if(c.part===P.BODY&&(c.side?Math.abs(c.u-(A.hip[0]+11))<=2:Math.abs(c.v-(A.chest[1]+7))<=1))return GOLD;
      return BLUE;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(1),n=B.neck,L=G.layer(),b=B.body||B.hip;
    // Vạt áo ở sau thân, trễ nhịp và dừng trên đường bàn chân.
    if(G.side){const h=B.hip,y=Math.min(71,h[1]+21);L.poly([[n[0],n[1]-3],[h[0]-12,h[1]+6],[h[0]-17,y],[n[0]-6,Math.min(70,n[1]+17)]],RED)}
    else{const y=Math.min(72,b[1]+7);L.poly([[n[0]-12,n[1]-2],[n[0]+12,n[1]-2],[Math.min(G.W-4,b[0]+23),y],[Math.max(3,b[0]-23),y]],RED)}
    L.stamp({behind:true,outline:INK});
    const D=G.layer(),x=G.side?A.chest[0]-14:A.chest[0],y=G.side?A.chest[1]+1:A.chest[1]-2;
    D.poly([[x-5,y-3],[x+5,y-3],[x+6,y],[x,y+5],[x-6,y]],RED);
    D.poly([[x-4,y-2],[x+4,y-2],[x+4,y],[x,y+3],[x-4,y]],GOLD);
    D.line(x+2,y-1,x-2,y-1,RED);D.line(x-2,y-1,x+2,y+1,RED);D.line(x+2,y+1,x-1,y+2,RED);
    D.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
    const H=G.layer(),cx=A.crown[0],cy=A.crown[1]+6;
    H.line(cx-2,cy,cx+3,cy+2,HAIR,3);H.line(cx+3,cy+2,cx+2,cy+5,HAIR,2);
    H.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD});
  }
});
})();
