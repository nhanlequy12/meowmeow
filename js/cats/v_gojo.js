"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[250,251,255],SHADOW=[218,218,236],SUIT=[47,53,82],DARK=[31,29,43],PURPLE=[122,90,224],BAND=[40,36,51],EDGE=[67,61,82],ORB=[164,92,255],LIGHT=[231,207,255];
K.costume('v_gojo',{
  paint(c,s){
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<c.A0.crown[1]+10+(Math.floor(c.u/4)%2)*2){c.lv=0;return HAIR}
    if(c.part===P.EAR){c.lv=0;return HAIR}
    if(c.part===P.BODY||K.isLeg(c.part)){
      c.zone=false;if(c.mark||c.lv>0)c.lv=0;
      return s.ct==='gjSix'?DARK:SUIT;
    }
  },
  draw(G,s){
    const A=G.A,side=G.side,h=A.crown,H=G.layer(),ey=side?A.eye[1]:Math.min(A.eyeL[1],A.eyeR[1]);
    // Ba chỏm tóc lớn; đỉnh luôn nằm trong khoảng trống trên đầu.
    const w=side?13:17,y=h[1]+7;
    H.poly([[h[0]-w,y],[h[0]-w+3,Math.max(3,h[1]-7)],[h[0]-5,h[1]+1],[h[0],Math.max(3,h[1]-12)],[h[0]+6,h[1]+1],[h[0]+w-2,Math.max(3,h[1]-6)],[h[0]+w,y]],HAIR).stamp();
    const fringe=G.layer();fringe.line(h[0]-w+2,y,h[0]+w-2,y,SHADOW,2).stamp({outline:false});
    // Cổ cao chỉ phủ ô áo, không che cằm ở dáng ngủ.
    const col=s.ct==='gjSix'?PURPLE:SUIT;
    G.recolor(q=>q.part===P.BODY&&q.role>1&&q.y<(side?A.throat[1]+5:A.chest[1]+2)&&q.y>(side?A.throat[1]-3:A.chest[1]-5)&&Math.abs(q.x-(side?A.throat[0]:A.chest[0]))<(side?8:12)?col:undefined);
    const blind=s.cos.some(p=>p[0]==='blindfold');
    if(blind){
      const L=G.layer(),x0=side?A.head[0]-15:A.eyeL[0]-9,x1=side?A.eye[0]+7:A.eyeR[0]+9;
      L.rect(x0,ey-4,x1-x0+1,9,BAND).line(x0,ey-4,x1,ey-4,EDGE,1).stamp({outline:false,clip:(x,y)=>{
        const i=y*G.W+x;return G.F.part[i]===P.HEAD&&!!G.F.role[i];
      }});
    }
    if(s.cos.some(p=>p[0]==='orb')){
      const B=G.lag(2),p=side?B.back:B.head,x=Math.max(9,Math.min(G.W-9,p[0]+(side?-5:25))),y=Math.max(10,p[1]-16),L=G.layer();
      L.ell(x,y,7,7,PURPLE).ell(x,y,5,5,ORB).ell(x-1,y-1,2,3,LIGHT).stamp({outline:[70,42,103]});
    }
  }
});
})();
