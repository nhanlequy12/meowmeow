"use strict";
(()=>{
const K=CatKit,{P,R}=K,WHITE=[255,255,255],INK=[58,52,72];
K.costume('v_garfield',{
  draw(G,s){
    const A=G.A,L=G.layer(),lid=K.U.hex(s.c);
    const eye=e=>{
      const ex=e[0],ey=e[1];let open=false;
      for(let y=ey-5;y<=ey+5&&!open;y++)for(let x=ex-5;x<=ex+5;x++){
        const i=y*G.W+x;
        if(G.F.part[i]===P.HEAD&&G.F.role[i]>=R.K){open=true;break}
      }
      // Ngủ và chớp mắt giữ nét nhắm của Xoài, không ép mắt mở.
      if(!open)return;
      L.ell(ex,ey,7,7,(x,y)=>{
        if(((x-ex)/6)**2+((y-ey)/6)**2>1)return INK;
        if(y<ey)return lid;
        if(y===ey||(x>=ex+1&&x<=ex+2&&y<=ey+4))return INK;
        return WHITE;
      });
    };
    if(G.side)eye(A.eye);else{eye(A.eyeL);eye(A.eyeR)}
    L.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return G.F.part[i]===P.HEAD&&G.F.role[i]>0;
    }});
  }
});
})();
