"use strict";
(()=>{
const K=CatKit,{P,FT}=K,BLACK=[58,52,72],RED=[240,72,60],BROWN=[168,106,58];
K.costume('v_pika',{
  paint(c){
    // Chóp tai và gốc đuôi dùng toạ độ nghỉ nên không trượt hoa văn.
    if(c.part===P.EAR){
      const a=c.side?(c.u<c.A0.crown[0]?c.A0.earF:c.A0.earN):(c.u<c.A0.head[0]?c.A0.earL:c.A0.earR);
      if(c.v<=a[1]+5){c.lv=0;return BLACK}
    }
    if(c.kind==='fur'&&c.part===P.TAIL&&c.v>=(c.side?c.A0.tailBase[1]-7:c.A0.tail[1]+2)){
      if(c.mark)c.lv=0;return BROWN;
    }
  },
  draw(G){
    const A=G.A,L=G.layer();
    if(G.side)L.ell(A.cheek[0],A.cheek[1]+2,3.5,3.5,RED);
    else{
      L.ell(A.eyeL[0]-5,A.eyeL[1]+6,3.5,3.5,RED);
      L.ell(A.eyeR[0]+5,A.eyeR[1]+6,3.5,3.5,RED);
    }
    // Má là mảng lông đỏ, không đè mõm hay bàn chân đang liếm.
    L.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return G.F.part[i]===P.HEAD&&G.F.role[i]>1&&G.F.feat[i]!==FT.NOSE;
    }});
  }
});
})();
