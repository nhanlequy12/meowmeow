"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[58,52,72],LIGHT=[99,94,114],WHITE=[244,240,230],GREEN=[79,122,82],DARK=[55,88,63],BELT=[107,74,52];
K.costume('v_levi',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<A.crown[1]+10+(c.u<A.crown[0]-2?2:0)){
      c.zone=false;if(c.mark)c.lv=0;return HAIR;
    }
    if(c.part===P.BODY){
      if(c.feat===FT.PAW)return;
      c.zone=false;if(c.mark)c.lv=0;
      if(c.side){if(c.u<A.neck[0]-3&&c.v<A.belly[1]-3)return GREEN;return c.v>=A.belly[1]-5&&c.v<=A.belly[1]-3?BELT:WHITE}
      if(Math.abs(c.u-A.body[0])>=7&&c.v<A.body[1]+3)return GREEN;
      return c.v>=A.body[1]-1&&c.v<=A.body[1]+1?BELT:WHITE;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),side=G.side,C=G.layer();
    // Áo choàng xanh bay sau lưng, gấu áo giữ cao hơn bàn chân.
    if(side){
      C.poly([[A.neck[0],A.neck[1]],[B.back[0]-6,B.back[1]-3],[B.hip[0]-13,Math.min(71,B.belly[1]+3)],[B.hip[0]+2,Math.min(71,B.belly[1])],[A.neck[0]-1,A.throat[1]+9]],GREEN);
      C.line(B.back[0]-4,B.back[1]+2,B.hip[0]-8,Math.min(69,B.belly[1]),DARK,2);
    }else{
      const nx=A.body[0],ny=Math.min(A.chin[1],A.body[1]-8),y=Math.min(72,B.body[1]+6);
      [-1,1].forEach(k=>{
        C.poly([[nx+k*11,ny],[nx+k*17,ny+2],[B.body[0]+k*23,y-2],[B.body[0]+k*13,y]],GREEN);
        C.line(nx+k*15,ny+4,B.body[0]+k*19,y-3,DARK,1);
      });
    }
    C.stamp({behind:true});
    const H=G.layer(),x=A.crown[0],y=A.crown[1];
    // Ngôi lệch và hai lọn mái, không che mắt.
    H.line(x+2,y+1,x-3,y+8,LIGHT,2).line(x-3,y+8,x-10,y+11,HAIR,2);
    H.stamp({outline:false});
    const N=side?A.throat:A.chin,D=G.layer(),nx=N[0],ny=Math.min(69,N[1]+2);
    D.poly([[nx-5,ny],[nx+5,ny],[nx+3,ny+4],[nx,ny+7],[nx-3,ny+4]],[255,253,247]);
    D.line(nx,ny+2,nx,ny+5,[204,203,199],1);
    D.stamp({outline:[139,149,143],edge:false,clip:(x,y)=>y<74&&G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
