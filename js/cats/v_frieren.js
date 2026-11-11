"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[244,246,251],SHADE=[191,201,218],WHITE=[218,222,231],GOLD=[224,176,64],WOOD=[168,117,74],RED=[224,72,60];
K.costume('v_frieren',{
  paint(c){
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<c.A0.crown[1]+10){c.zone=false;c.lv=c.mark?0:c.lv;return HAIR}
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<c.A0.belly?.[1]-3)){
      if(c.feat===FT.PAW)return;
      c.zone=false;if(c.mark)c.lv=0;
      const y=c.v-(c.side?c.A0.back[1]:c.A0.chin[1]);
      const trim=c.side?(c.u<c.A0.neck[0]-2&&y>=11&&y<=13||c.v>=c.A0.belly[1]-2&&c.v<=c.A0.belly[1]):(y>=3&&y<=5||y>=10&&y<=12||c.v>=c.A0.body[1]+6);
      if(trim){c.lv=0;return GOLD}return WHITE;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),side=G.side,L=G.layer();
    // Gậy gỗ và đá đỏ trễ hai khung, luôn chừa đường chân.
    const bx=side?B.neck[0]+12:B.chest[0]-29,by=Math.min(73,side?B.belly[1]-3:B.chest[1]+7);
    const tx=side?B.back[0]-9:B.crown[0]-31,ty=Math.max(7,side?B.back[1]-25:B.crown[1]-9);
    L.line(bx,by,tx,ty,WOOD,3).ell(tx,ty,4,4,RED);
    L.rect(tx-1,ty-2,2,2,[255,159,130]).stamp({behind:true});
    // Bím thon từ sau tai, ôm má; một bím sau gáy khi nhìn ngang.
    const T=G.layer();
    if(side){
      const x=A.earF[0],y=A.earF[1]+8,ex=B.neck[0]-8,ey=Math.min(70,B.throat[1]+10);
      T.poly([[x-2,y],[x+1,y+2],[A.head[0]-18,A.head[1]+6],[ex+3,ey-6],[ex,ey],[ex-2,ey-5],[A.head[0]-23,A.head[1]+3]],HAIR);
      T.line(A.head[0]-22,A.head[1]+5,ex-1,ey-5,SHADE,1);
      T.stamp({edge:false,clip:(x,y)=>!G.F.part[y*G.W+x]||G.F.part[y*G.W+x]===P.BODY});
    }else{
      [-1,1].forEach(k=>{
        const e=k<0?A.earL:A.earR,x=e[0],y=e[1]+8,m=A.head[0]+k*22,ex=B.head[0]+k*19,ey=Math.min(70,B.chin[1]+9);
        T.poly([[x-k*2,y],[x+k*2,y],[m+k*2,A.head[1]+3],[ex+k*2,ey-5],[ex,ey],[ex-k*2,ey-5],[m-k*2,A.head[1]+3]],HAIR);
        T.line(m+k,A.head[1]+5,ex+k,ey-5,SHADE,1);
      });
      // Tóc nằm trước đuôi, sau mặt và bàn chân đang liếm.
      T.stamp({edge:false,clip:(x,y)=>{const p=G.F.part[y*G.W+x];return p!==P.HEAD&&p!==P.EAR&&!K.isLeg(p)&&y<74}});
    }
    const D=G.layer(),x=A.crown[0],y=A.crown[1];
    D.line(x-8,y+9,x-2,y+11,SHADE,1).line(x+2,y+11,x+8,y+9,SHADE,1);
    D.stamp({outline:false});
    // Viền cổ áo chỉ tô trên áo, không đè bàn chân hay mặt đang liếm.
    const C=G.layer(),n=side?A.throat:A.chin;
    C.line(n[0]-9,n[1]+3,n[0]+8,n[1]+3,GOLD,3);
    C.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
