"use strict";
(()=>{
const K=CatKit,{P,FT}=K,HAIR=[122,42,46],GREEN=[63,160,106],DARK=[58,52,72],SCAR=[176,70,76],PAPER=[253,245,223],RED=[204,57,64];
K.costume('v_tanjiro',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]:A.eyeL[1])-8+(Math.floor(c.u/4)%2?2:0)){c.lv=0;return HAIR}
    if(c.part===P.BODY&&c.feat!==FT.PAW){c.zone=false;if(c.mark)c.lv=0;return (Math.floor((c.u-A.body?.[0]||c.u)/5)+Math.floor((c.v-(c.side?A.back[1]:A.body[1]))/5))%2?GREEN:DARK}
  },
  draw(G){
    const A=G.A,B=G.lag(1),x=G.side?A.eye[0]-10:A.eyeL[0]+1,y=A.crown[1]+4,S=G.layer();
    S.poly([[x-3,y],[x+2,y-2],[x+5,y+2],[x+2,y+4],[x+3,y+7],[x-4,y+6]],SCAR).stamp({outline:false});
    // Hoa tai hanafuda: đầu dây theo tai, mặt thẻ trễ một khung.
    const roots=G.side?[[A.neck,B.neck,-1]]:[[A.head,B.head,-1],[A.head,B.head,1]];
    for(const [a,b,k] of roots){
      const rx=a[0]+(G.side?1:23*k),ry=G.side?a[1]-4:a[1]+4;
      const ex=b[0]+(G.side?0:25*k),ey=Math.min(65,(G.side?b[1]:b[1]+10));
      const E=G.layer();E.line(rx,ry,ex,ey,DARK,1).rect(ex-2,ey,5,10,PAPER).stamp();
      const D=G.layer();D.rect(ex-1,ey+1,3,3,RED).line(ex,ey+5,ex,ey+8,DARK,1).stamp({outline:false});
    }
  }
});
})();
