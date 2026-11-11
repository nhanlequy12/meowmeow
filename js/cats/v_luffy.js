"use strict";
(()=>{
const K=CatKit,{P,FT}=K,HAIR=[58,52,72],RED=[224,72,60],GOLD=[242,208,74],STRAW=[244,214,120],SCAR=[112,67,57];
K.costume('v_luffy',{
  // Mũ che tai; giữ nguyên đầu và toàn bộ bộ khớp chân.
  shape(F,s,FX){FX.erase(F,i=>F.part[i]===P.EAR);FX.seal(F,i=>F.part[i]===P.HEAD)},
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]:A.eyeL[1])-7+(Math.floor(c.u/3)%2?2:0)){c.lv=0;return HAIR}
    if(c.part!==P.BODY||c.feat===FT.PAW)return;
    c.zone=false;if(c.mark)c.lv=0;
    if(c.side)return Math.abs(c.u-A.hip[0]-12)<=2?GOLD:RED;
    if(c.v>=A.body[1]-3&&c.v<=A.body[1])return GOLD;
    if(Math.abs(c.u-A.head[0])<=3&&c.v<A.chest[1])return;
    return RED;
  },
  draw(G){
    const A=G.A,x=A.crown[0]-(G.side?3:0),y=A.crown[1],L=G.layer();
    L.ell(x,y-6,14,7,STRAW).rect(x-14,y-4,29,4,RED).ell(x,y+2,G.side?21:25,3,STRAW).stamp();
    const D=G.layer();D.line(x-18,y+2,x+18,y+2,[216,175,84],1).stamp({outline:false});
    // Sẹo dưới mắt trái, luôn bám mắt kể cả lúc chớp.
    const e=G.side?A.eye:A.eyeL,S=G.layer();
    S.line(e[0]-4,e[1]+7,e[0]+3,e[1]+7,SCAR,1).line(e[0]-2,e[1]+6,e[0]-2,e[1]+8,SCAR,1).line(e[0]+1,e[1]+6,e[0]+1,e[1]+8,SCAR,1).stamp({outline:false});
  }
});
})();
