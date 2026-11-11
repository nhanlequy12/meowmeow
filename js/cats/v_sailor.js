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
    // Bím mọc dưới búi; ngọn thon bay sau gáy, trễ hai khung.
    if(side){
      const x=A.crown[0]-14,y=A.crown[1]+2,ex=B.back[0]-17,ey=Math.min(70,B.back[1]+15);
      T.poly([[x-2,y],[x+2,y],[A.head[0]-17,A.head[1]+4],[B.neck[0]-7,B.neck[1]+8],[ex+4,ey-1],[ex,ey+2],[ex+1,ey-3],[B.neck[0]-12,B.neck[1]+5],[A.head[0]-23,A.head[1]+2]],HAIR);
      T.line(A.head[0]-22,A.head[1]+5,B.neck[0]-10,B.neck[1]+7,SHADE,1).line(B.neck[0]-10,B.neck[1]+7,ex+3,ey-1,SHADE,1);
      T.stamp({edge:false,clip:(x,y)=>!G.F.part[y*G.W+x]||G.F.part[y*G.W+x]===P.BODY});
    }else{
      [-1,1].forEach(k=>{
        const e=k<0?A.earL:A.earR,x=e[0]+(k<0?-2:3),y=e[1]+5,m=A.head[0]+k*22,ex=B.head[0]+k*21,ey=Math.min(72,B.chin[1]+17);
        T.poly([[x-k*2,y],[x+k*2,y],[m+k*2,A.head[1]+3],[ex+k*2,ey-6],[ex-k,ey],[ex-k*2,ey-6],[m-k*2,A.head[1]+3]],HAIR);
        T.line(m+k,A.head[1]+5,ex+k,ey-6,SHADE,1);
      });
      // Giữ bím trái thấy được cả khi đuôi dựng trước vai.
      T.stamp({edge:false,clip:(x,y)=>{const p=G.F.part[y*G.W+x];return p!==P.HEAD&&p!==P.EAR&&!K.isLeg(p)&&y<74}});
    }
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
