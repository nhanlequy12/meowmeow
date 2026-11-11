"use strict";
(()=>{
const K=CatKit,{P}=K,CREAM=[246,238,220],MARK=[119,124,139],LEAF=[130,196,120],VEIN=[78,135,75];
K.costume('v_totoro',{
  shape(F){
    // Tính mảng bụng một lần cho mỗi khung, kể cả lúc cuộn mình ngủ.
    const A=F.A;
    F.totoroBelly=F.view==='side'?[A.belly[0]+4,A.belly[1]-4,19,11]:
      F.anim==='sleep'?[A.body[0]+4,A.body[1]+7,11,10]:[A.body[0],A.body[1]-2,12,10];
  },
  paint(c){
    if(c.kind!=='fur'||c.part!==P.BODY)return;
    const b=c.F.totoroBelly,dx=(c.x-b[0])/b[2],dy=(c.y-b[1])/b[3];
    if(dx*dx+dy*dy<=1){c.lv=c.mark?0:Math.max(-1,Math.min(1,c.lv));return CREAM}
  },
  draw(G){
    const A=G.A,b=G.F.totoroBelly,L=G.layer(),sleep=G.F.anim==='sleep';
    // Các dấu V nằm trong mảng bụng, bị đầu và chân che tự nhiên.
    const vy=b[1]-(sleep?2:4),xs=G.side?[-5,5]:sleep?[-2,5]:[-5,4];
    xs.forEach(dx=>{const x=b[0]+dx;L.line(x-2,vy,x,vy+2,MARK,2).line(x,vy+2,x+2,vy,MARK,2)});
    L.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x,dx=(x-b[0])/b[2],dy=(y-b[1])/b[3];
      return G.F.part[i]===P.BODY&&G.F.role[i]>1&&dx*dx+dy*dy<=1;
    }});
    const x=A.crown[0],y=A.crown[1]-1,H=G.layer();
    H.poly([[x-8,y],[x-3,y-5],[x+4,y-5],[x+9,y-1],[x+4,y+2],[x-2,y+2]],LEAF).stamp();
    G.layer().line(x,y+3,x+1,y-3,VEIN,2).line(x+1,y-1,x+6,y-3,VEIN,1).stamp({outline:false});
  }
});
})();
