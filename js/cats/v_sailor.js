"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[245,207,58],SHADE=[211,159,43],WHITE=[255,255,255],BLUE=[61,95,192],RED=[224,72,60],GOLD=[242,194,48];
K.costume('v_sailor',{
  paint(c){
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<c.A0.crown[1]+10+(Math.abs(c.u-c.A0.crown[0])>4?1:0)){
      c.zone=false;if(c.mark)c.lv=0;return HAIR;
    }
    if(c.part===P.BODY&&c.feat!==FT.PAW){
      c.zone=false;if(c.mark)c.lv=0;
      const A=c.A0;
      return c.side?(c.u>A.neck[0]-3&&c.v<A.throat[1]+6?BLUE:WHITE):(c.v<A.chin[1]+6?BLUE:WHITE);
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),side=G.side,T=G.layer();
    // Hai bím vàng dài; ngọn gập nhẹ khi ngủ để không xuyên nền.
    (side?[-1]:[-1,1]).forEach(k=>{
      const x=side?A.crown[0]-17:A.head[0]+k*24,y=A.crown[1]+6;
      const ex=side?B.crown[0]-23:B.head[0]+k*25,ey=Math.min(71,B.chin[1]+14);
      T.poly([[x-4,y],[x+4,y],[ex+4,ey-5],[ex,ey],[ex-4,ey-5]],HAIR);
      T.line(x-2,y+5,ex-2,ey-6,SHADE,1);
    });
    T.stamp({behind:true});
    const H=G.layer();
    if(side){H.ell(A.crown[0]-14,A.crown[1]-1,5,5,HAIR).ell(A.crown[0]+8,A.crown[1]-6,4,4,HAIR)}
    else{H.ell(A.earL[0]-2,A.earL[1]+2,5,5,HAIR).ell(A.earR[0]+3,A.earR[1]+2,5,5,HAIR)}
    H.stamp();
    const D=G.layer(),x=A.crown[0]+(side?5:0),y=A.crown[1]+8;
    // Vương miện vàng chữ V, viên đá đỏ ở giữa trán.
    D.line(x-9,y-2,x,y+2,GOLD,2).line(x,y+2,x+9,y-2,GOLD,2).ell(x,y+1,2,2,RED);
    D.stamp({outline:false});
    const N=side?A.throat:A.chin,nx=N[0],ny=Math.min(69,N[1]+3),C=G.layer();
    C.poly([[nx-9,ny-2],[nx,ny+3],[nx+9,ny-2],[nx+7,ny+5],[nx-7,ny+5]],BLUE);
    C.line(nx-7,ny,nx,ny+4,WHITE,1).line(nx,ny+4,nx+7,ny,WHITE,1);
    C.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
    const R=G.layer();
    R.poly([[nx-8,ny+2],[nx-2,ny+3],[nx-2,ny+6],[nx-8,ny+7]],RED);
    R.poly([[nx+8,ny+2],[nx+2,ny+3],[nx+2,ny+6],[nx+8,ny+7]],RED).rect(nx-1,ny+3,3,3,[166,44,57]);
    R.stamp({outline:false,clip:(x,y)=>y<=75&&G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
