"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[244,246,251],SHADE=[191,201,218],WHITE=[251,251,255],GOLD=[224,176,64],WOOD=[168,117,74],RED=[224,72,60];
K.costume('v_frieren',{
  paint(c){
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<c.A0.crown[1]+10){c.zone=false;c.lv=c.mark?0:c.lv;return HAIR}
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<c.A0.belly?.[1]-3)){
      if(c.feat===FT.PAW)return;
      c.zone=false;if(c.mark)c.lv=0;
      const y=c.v-(c.side?c.A0.back[1]:c.A0.chin[1]);
      return c.side?(c.u<c.A0.neck[0]-2&&y>=11&&y<=13?GOLD:WHITE):(y>=3&&y<=4||y>=10&&y<=12?GOLD:WHITE);
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),side=G.side,L=G.layer();
    // Gậy gỗ và đá đỏ trễ hai khung, luôn chừa đường chân.
    const bx=side?A.hip[0]+9:A.chest[0]-29,by=Math.min(73,(side?A.belly[1]:A.chest[1])+7);
    const tx=side?B.neck[0]-10:B.crown[0]-31,ty=Math.max(7,B.crown[1]-9);
    L.line(bx,by,tx,ty,WOOD,3).ell(tx,ty,4,4,RED);
    L.rect(tx-1,ty-2,2,2,[255,159,130]).stamp({behind:true});
    // Hai bím dài bám đầu; đầu bím gắn cứng, ngọn bím trễ nhịp.
    const T=G.layer(),ends=side?[-1]:[-1,1];
    ends.forEach(k=>{
      const x=side?A.crown[0]-17:A.head[0]+k*24,y=A.crown[1]+8;
      const ex=side?B.crown[0]-22:B.head[0]+k*25,ey=Math.min(71,B.chin[1]+13);
      T.poly([[x-4,y],[x+4,y],[ex+4,ey-5],[ex,ey],[ex-4,ey-5]],HAIR);
      T.line(x-2,y+4,ex-2,ey-5,SHADE,1);
    });
    T.stamp({behind:true});
    const D=G.layer(),x=A.crown[0],y=A.crown[1];
    D.line(x-8,y+9,x-2,y+11,SHADE,1).line(x+2,y+11,x+8,y+9,SHADE,1);
    D.stamp({outline:false});
    // Viền cổ áo chỉ tô trên áo, không đè bàn chân hay mặt đang liếm.
    const C=G.layer(),n=side?A.throat:A.chin;
    C.line(n[0]-6,n[1]+3,n[0]+5,n[1]+3,GOLD,2);
    C.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.BODY});
  }
});
})();
