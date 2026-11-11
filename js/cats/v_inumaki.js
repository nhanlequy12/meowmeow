"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#e9e8e7'),EDGE=hex('#a7b2c3'),SUIT=hex('#243049'),SEAM=hex('#44536e'),ZIP=hex('#c6cdd7');
K.costume('v_inumaki',{
  paint(c){
    const A=c.A0,e=c.side?A.eye:A.eyeL;
    // Cổ áo kín từ dưới mũi, tô luôn ô miệng và mõm.
    if(c.part===P.HEAD&&c.v>=A.nose[1]+2){
      if(c.kind!=='line'||c.feat===FT.MOUTH||c.feat===FT.MUZ){c.zone=false;if(c.mark)c.lv=0;return SUIT}
      return;
    }
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD){
      const hem=e[1]-7+(Math.floor(c.u/4)%2)*3;
      if(c.v<=hem){c.lv=0;return c.v>=hem-1?EDGE:HAIR}
    }
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<71)){
      c.zone=false;if(c.mark)c.lv=0;return SUIT;
    }
  },
  draw(G){
    const A=G.A,L=G.layer(),n=A.nose,t=A.chest;
    // Mép cổ áo và khóa bạc bám theo mặt, ngực.
    if(G.side){
      L.line(A.cheek[0]-10,n[1]+3,n[0]-4,n[1]+3,SEAM,2);
      L.line(t[0]-6,A.throat[1]+1,t[0]-9,t[1]+8,ZIP,2).rect(t[0]-8,A.throat[1]+1,4,4,ZIP);
    }else{
      L.line(A.eyeL[0]-5,n[1]+3,A.eyeR[0]+4,n[1]+3,SEAM,2);
      L.line(A.head[0],n[1]+6,A.head[0],t[1]+9,ZIP,2).rect(A.head[0]-1,n[1]+7,4,4,ZIP);
    }
    L.stamp({outline:false,clip:(x,y)=>y<73});
  }
});
})();
