"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K,BLACK=[58,52,72],RED=[240,72,60],BROWN=[168,106,58],YELLOW=[249,220,92];
K.costume('v_pika',{
  shape(F,s,FX){
    // Tia chớp xoay theo gốc và chóp đuôi của từng khung Xoài.
    const A=F.A,sleep=F.anim==='sleep',side=F.view==='side';
    const b=side?A.tailBase:[A.tail[0]+7,A.tail[1]+(sleep?-1:6)];
    const t=sleep?[A.tail[0]-6,A.tail[1]-4]:A.tailTip;
    const dx=t[0]-b[0],dy=t[1]-b[1],len=Math.hypot(dx,dy),nx=-dy/len,ny=dx/len,w=sleep?.5:.8;
    const pts=[[0,-2],[.25,-2],[.40,2],[.58,-7],[1.15,-7],[1.15,2],[.72,2],[.43,10],[.18,2],[0,2]]
      .map(([u,v])=>[b[0]+dx*u+nx*v*w,b[1]+dy*u+ny*v*w]);
    F.pikaTail=[b[0],b[1],dx,dy,len*len];
    FX.erase(F,i=>F.part[i]===P.TAIL);
    for(let y=Math.max(0,Math.floor(Math.min(...pts.map(p=>p[1]))));y<=Math.min(75,Math.ceil(Math.max(...pts.map(p=>p[1]))));y++){
      for(let x=1;x<F.W-1;x++){
        let inside=false;
        for(let i=0,j=pts.length-1;i<pts.length;j=i++){
          const a=pts[i],b=pts[j];
          if((a[1]>y)!==(b[1]>y)&&x<(b[0]-a[0])*(y-a[1])/(b[1]-a[1])+a[0])inside=!inside;
        }
        const i=y*F.W+x;
        if(inside&&!F.role[i])FX.put(F,x,y,R.D,P.TAIL,0,x,y);
      }
    }
    FX.seal(F,i=>F.part[i]===P.TAIL);
  },
  paint(c){
    // Chóp tai và gốc đuôi dùng toạ độ nghỉ nên không trượt hoa văn.
    if(c.part===P.EAR){
      const a=c.side?(c.u<c.A0.crown[0]?c.A0.earF:c.A0.earN):(c.u<c.A0.head[0]?c.A0.earL:c.A0.earR);
      if(c.v<=a[1]+8){c.lv=0;return BLACK}
    }
    if(c.kind==='fur'&&c.part===P.TAIL){
      const b=c.F.pikaTail,t=((c.x-b[0])*b[2]+(c.y-b[1])*b[3])/b[4];
      c.lv=0;return t<.35?BROWN:YELLOW;
    }
  },
  draw(G){
    const A=G.A,L=G.layer();
    if(G.side)L.ell(A.cheek[0],A.cheek[1]+2,3.5,3.5,RED);
    else{
      L.ell(A.eyeL[0]-5,A.eyeL[1]+6,3.5,3.5,RED);
      L.ell(A.eyeR[0]+5,A.eyeR[1]+6,3.5,3.5,RED);
    }
    // Má là mảng lông đỏ, không đè mõm hay bàn chân đang liếm.
    L.stamp({outline:false,clip:(x,y)=>{
      const i=y*G.W+x;return G.F.part[i]===P.HEAD&&G.F.role[i]>1&&G.F.feat[i]!==FT.NOSE;
    }});
  }
});
})();
