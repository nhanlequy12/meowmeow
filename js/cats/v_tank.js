"use strict";
(()=>{
const H=CatKit.U.hex,P=CatKit.P,WHITE=H('#fafaff'),RED=H('#e34b52'),FUR=H('#f0a050'),MUSCLE=H('#c96f28');
CatKit.costume('v_tank',{
  shape(){}, // Giữ bàn chân và dáng của Xoài.
  paint(q){
    if(q.kind!=='fur'||q.part!==P.BODY)return;
    const A=q.A0;
    if(q.side){
      if(q.u<A.hip[0]+4||q.u>A.chest[0]-5||q.v<A.back[1]+2||q.v>A.belly[1]-1)return;
      // Khoét nách rộng, để lộ vai và chân cam.
      if(q.u>A.chest[0]-14&&q.v>A.back[1]+8)return;
      q.lv=0;
      return Math.abs(q.v-(A.belly[1]-6))<=1?RED:WHITE;
    }
    const dx=Math.abs(q.u-A.body[0]),top=A.neck[1]+1;
    if(q.v<top||q.v>A.body[1]+6||dx>14)return;
    if(q.v<top+5&&(dx<6||dx>11))return;
    q.lv=0;
    return Math.abs(q.v-(A.body[1]+1))<=1?RED:WHITE;
  },
  draw(G){
    const A=G.A,L=G.layer(),n=A.neck;
    // Vai u ngắn, tránh chạm mặt và giữ nguyên hàng bàn chân.
    if(G.side){
      const c=A.chest;
      L.ell(c[0]-5,c[1]-3,5,6,FUR);
      L.line(c[0]-3,c[1]-6,c[0]-1,c[1]-3,MUSCLE,1);
    }else{
      L.ell(n[0]-13,n[1]+7,5,5,FUR);
      L.ell(n[0]+12,n[1]+7,5,5,FUR);
      L.line(n[0]-15,n[1]+5,n[0]-13,n[1]+7,MUSCLE,1);
      L.line(n[0]+13,n[1]+5,n[0]+15,n[1]+7,MUSCLE,1);
    }
    L.stamp({behind:true,clip:(x,y)=>y<=75});
  }
});
})();
