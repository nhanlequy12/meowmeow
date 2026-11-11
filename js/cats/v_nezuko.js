"use strict";
(()=>{
const K=CatKit,{P,FT}=K,HAIR=[58,52,72],TIP=[204,112,61],PINK=[247,179,198],BOW=[245,154,181],RED=[192,57,43],BAMBOO=[166,210,146],NODE=[104,153,89];
K.costume('v_nezuko',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&(c.v<=(c.side?A.eye[1]:A.eyeL[1])-8+(Math.floor(c.u/4)%2?1:0)||(c.side?c.u<A.crown[0]-10:Math.abs(c.u-A.head[0])>17)&&c.v<A.chin[1]-2)){c.lv=0;return HAIR}
    if(c.part!==P.BODY||c.feat===FT.PAW)return;
    c.zone=false;if(c.mark)c.lv=0;
    if(c.side?Math.abs(c.u-A.hip[0]-14)<=3:Math.abs(c.v-A.body[1]+4)<=2)return RED;
    return PINK;
  },
  draw(G){
    const A=G.A,B=G.lag(2),L=G.layer(),x=A.head[0],y=A.head[1];
    // Tóc đen dài, ngọn cam trễ thân hai khung, không chạm bàn chân.
    if(G.side){const ex=B.neck[0]-3,ey=Math.min(70,B.chin[1]+12);
      L.poly([[x-15,y-10],[x-22,y],[ex-5,ey-5],[ex+6,ey],[x-9,y+10]],(u,v)=>v>ey-8?TIP:HAIR);
    }else for(const k of [-1,1]){const ex=B.head[0]+k*22,ey=Math.min(71,B.chin[1]+13);
      L.poly([[x+k*17,y-12],[x+k*25,y-2],[ex+k*4,ey-7],[ex,ey],[x+k*16,ey-5]],(u,v)=>v>ey-8?TIP:HAIR);
    }
    L.stamp({behind:true});
    const R=G.layer(),rx=G.side?A.crown[0]-8:A.crown[0]+12,ry=A.crown[1]+2;
    R.poly([[rx-6,ry-3],[rx,ry],[rx-6,ry+4]],BOW).poly([[rx+6,ry-3],[rx,ry],[rx+6,ry+4]],BOW).rect(rx-1,ry-1,3,3,[210,100,135]).stamp();
    // Lõi tre nằm ngang miệng; khung liếm lông dùng chính mỏ neo mũi.
    const bx=G.side?A.nose[0]-7:A.nose[0],by=A.nose[1]+5,T=G.layer(),w=G.side?13:20;
    T.rect(bx-w/2,by,w,4,BAMBOO).stamp();
    const D=G.layer();D.rect(bx-w/2,by,2,4,NODE).rect(bx-1,by,2,4,NODE).rect(bx+w/2-2,by,2,4,NODE).stamp({outline:false});
  }
});
})();
