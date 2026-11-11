"use strict";
(()=>{
const H=CatKit.U.hex,P=CatKit.P,NAVY=H('#242936'),RED=H('#db4252'),EDGE=H('#444c68');
CatKit.costume('v_ninja',{
  shape(){}, // Không đổi bộ khung hoạt ảnh.
  paint(q){
    const A=q.A0;
    if(q.kind==='line')return;
    if(q.part===P.HEAD||q.part===P.EAR){
      const e=q.side?A.eye:A.eyeL;
      // Dải mắt hẹp; mũ kín cả mõm và tai.
      if(q.v>=e[1]-3&&q.v<=e[1]+3&&q.part!==P.EAR)return;
      q.lv=0;
      if(q.v>=e[1]-8&&q.v<=e[1]-6)return RED;
      return NAVY;
    }
    if(q.part===P.BODY||CatKit.isLeg(q.part)||q.part===P.TAIL){
      q.lv=0;
      if(q.part===P.BODY&&Math.abs(q.v-(q.side?A.belly[1]-6:A.body[1]))<=1)return RED;
      return NAVY;
    }
  },
  draw(G){
    const A=G.lag(2),L=G.layer();
    const eye=G.side?A.eye:A.eyeR,x=G.side?A.head[0]-15:A.head[0]+18,y=eye[1]-7;
    // Hai đuôi băng bay sau đầu, trễ hai khung.
    L.poly([[x,y-1],[x+(G.side?-14:12),y+3],[x+(G.side?-12:10),y+6],[x,y+2]],RED);
    L.poly([[x,y+1],[x+(G.side?-10:9),y+9],[x+(G.side?-13:6),y+11],[x-2,y+3]],RED);
    L.stamp({behind:true});
    const n=G.A.neck;
    G.recolor(q=>q.part===P.BODY&&q.role!==1&&Math.abs(q.x-(G.side?n[0]-2:n[0]+4))<1&&q.y<n[1]+10?EDGE:undefined);
  }
});
})();
