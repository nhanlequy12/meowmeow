"use strict";
(()=>{
const K=CatKit,{P}=K;
const HAIR=[250,251,255],SHADOW=[218,218,236],SUIT=[47,53,82],DARK=[31,29,43],PURPLE=[122,90,224],BAND=[40,36,51],EDGE=[67,61,82],ORB=[164,92,255],LIGHT=[231,207,255];
K.costume('v_gojo',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const ey=c.side?c.F.A.eye[1]:Math.min(c.F.A.eyeL[1],c.F.A.eyeR[1]);
    if(c.part===P.HEAD&&c.y<Math.min(ey-5,c.F.A.crown[1]+10)+(Math.floor(c.u/4)%2)){c.lv=0;return c.y>=ey-7?SHADOW:HAIR}
    if(c.part===P.EAR){c.lv=0;return HAIR}
    if(c.part===P.BODY||K.isLeg(c.part)){
      c.zone=false;if(c.mark||c.lv>0)c.lv=0;
      return s.ct==='gjSix'?DARK:SUIT;
    }
  },
  draw(G,s){
    const A=G.A,side=G.side,h=A.crown,ey=side?A.eye[1]:Math.min(A.eyeL[1],A.eyeR[1]),six=s.ct==='gjSix';
    // Cổ áo ôm phần gáy, che cổ; sọc tím chỉ dày bốn ô.
    const top=side?A.neck[1]-2:Math.max(A.chin[1],A.neck[1]-2);
    G.recolor(q=>{
      if(q.part!==P.HEAD&&q.part!==P.BODY)return;
      const t=side?top+Math.floor((q.x-A.neck[0])/3):top;
      if(side?(q.x<A.neck[0]-4||q.x>A.throat[0]+4):(Math.abs(q.x-A.neck[0])>13))return;
      if(q.y<t||q.y>(side?A.throat[1]+4:A.chest[1]))return;
      return six&&q.y<t+4?PURPLE:(six?DARK:SUIT);
    });
    const blind=s.cos.some(p=>p[0]==='blindfold');
    if(blind){
      // Tô cả viền HEAD: băng quấn tới đường bao đầu, hai đầu cong một ô.
      G.recolor(q=>{
        if(q.part!==P.HEAD)return;
        const turn=side?(q.x<A.head[0]-10?1:0):(Math.abs(q.x-A.head[0])>17?1:0),dy=q.y-(ey-4+turn);
        if(dy>=0&&dy<9)return dy===0||dy===8?EDGE:BAND;
      });
    }
    // Năm chỏm tách rõ, mỗi chỏm có một mặt bóng nhạt.
    const H=G.layer(),base=Math.min(h[1]+7,ey-5),xs=side?[-12,-5,2,9,15]:[-17,-9,-1,7,15],heights=[7,11,8,13,6],w=side?4:5;
    xs.forEach((dx,i)=>{
      const x=h[0]+dx,y=Math.max(3,h[1]-heights[i]);
      H.poly([[x-w,base],[x,y],[x+w,base]],HAIR);
      H.poly([[x+1,y+4],[x+2,base],[x+w,base]],SHADOW);
    });
    H.stamp({edge:false});
    // Mái chạm nhẹ mép trên băng, luôn chừa mắt pha lê.
    const fringe=G.layer(),fy=blind?ey-4:ey-7;
    for(let k=-1;k<=1;k++){
      const x=h[0]+k*10;
      fringe.poly([[x-4,fy-3],[x+3,fy-3],[x+1,fy+1]],HAIR);
    }
    fringe.stamp({outline:false,clip:(x,y)=>G.F.part[y*G.W+x]===P.HEAD});
    if(s.cos.some(p=>p[0]==='orb')){
      const B=G.lag(2),p=side?B.back:B.body,x=Math.max(8,p[0]-(side?13:27)),y=Math.min(67,Math.max(10,p[1]-(side?9:20))),L=G.layer();
      L.ell(x,y,5,5,PURPLE).ell(x,y,4,4,ORB).ell(x-1,y-1,1,2,LIGHT).stamp({outline:[70,42,103],behind:true});
    }
  }
});
})();
