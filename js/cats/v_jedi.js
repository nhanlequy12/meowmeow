"use strict";
(()=>{
const H=CatKit.U.hex,P=CatKit.P,BROWN=H('#8a6a4a'),TAN=H('#d9c7a6'),BELT=H('#5e3d28'),BLUE=H('#6ab8ff'),WHITE=H('#f4fcff'),STEEL=H('#9696a5');
CatKit.costume('v_jedi',{
  shape(){}, // Giữ nguyên khung và nhịp chân Xoài.
  paint(q){
    const A=q.A0;
    if(q.part===P.HEAD||q.part===P.EAR){
      const hx=A.head[0],hy=A.head[1],dx=q.u-hx,dy=q.v-hy-2;
      const face=q.side?((dx-5)*(dx-5)/225+dy*dy/169<1):(dx*dx/324+dy*dy/169<1);
      if(!face&&q.kind!=='line'){q.lv=0;return BROWN}
    }
    if(q.kind==='fur'&&(q.part===P.BODY||CatKit.isLeg(q.part))){
      q.lv=0;
      const waist=q.side?A.belly[1]-7:A.body[1];
      if(q.part===P.BODY&&Math.abs(q.v-waist)<=1){q.lv=0;return BELT}
      if(q.part===P.BODY&&(q.side?q.v<A.belly[1]-9:Math.abs(q.u-A.body[0])>8))return BROWN;
      return TAN;
    }
  },
  draw(G){
    const A=G.lag(2),L=G.layer();
    const x=G.side?A.hip[0]+9:A.head[0]+20,y=G.side?A.back[1]+11:A.neck[1]+5;
    const tx=G.side?A.neck[0]-7:A.head[0]+27,ty=Math.max(3,A.crown[1]-8);
    L.line(x-2,y+6,x,y,STEEL,3);
    L.line(x,y,tx,ty,BLUE,4);
    L.line(x,y-1,tx,ty,WHITE,1);
    L.stamp({behind:true,clip:(x,y)=>y<=75});
    // Le áo bám cổ, chỉ tô trong thân để không lấp chân.
    const n=G.A.neck;
    G.recolor(q=>q.part===P.BODY&&q.role!==1&&Math.abs(q.x-(G.side?n[0]+3:n[0]))<2&&q.y<n[1]+10?TAN:undefined);
  }
});
})();
