"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U,FUR=hex('#c2c2c4'),STRIPE=hex('#8f8f93'),GREEN=hex('#9acb9b'),EDGE=hex('#65996f'),YARN=hex('#c7a8ca'),THREAD=hex('#886c94');
K.costume('v_pip',{
  paint(c){
    if(c.kind!=='fur')return;const A=c.A0;c.zone=false;if(c.mark)c.lv=0;
    if(c.part===P.HEAD&&c.v>=A.crown[1]+1&&c.v<=A.crown[1]+9){const dx=c.u-A.crown[0];if(Math.abs(dx)<=9&&Math.abs((dx+10)%7-3)<=1)return STRIPE}
    if(c.part===P.BODY){if(c.side&&c.v<A.back[1]+8&&c.u>A.hip[0]+4&&c.u<A.neck[0]&&((c.u-A.hip[0])%10)<3)return STRIPE;if(!c.side&&c.u<A.body[0]-9&&c.v>A.body[1]-10&&c.v<A.body[1]+1&&(c.v-A.body[1]+10)%5<2)return STRIPE}
    if(c.part===P.TAIL){const t=A.tailTip,d=Math.hypot(c.u-t[0],c.v-t[1]);if((d>6&&d<9)||(d>14&&d<17))return STRIPE}
    return FUR;
  },
  draw(G){
    const A=G.A,B=G.lag(1),sleep=G.F.anim==='sleep',n=sleep?[A.neck[0]-13,A.neck[1]-5]:A.neck,b=sleep?[B.neck[0]-13,B.neck[1]-5]:B.neck,L=G.layer();
    // Nút khăn theo cổ, hai vạt trễ một khung.
    L.poly(G.side||sleep?[[b[0]+1,b[1]+2],[b[0]-9,Math.min(75,b[1]+13)],[b[0]+4,Math.min(74,b[1]+10)],[b[0]+9,b[1]+3]]:[[b[0]-7,b[1]],[b[0]+9,b[1]],[b[0]+4,Math.min(71,b[1]+14)],[b[0]-1,b[1]+9]],GREEN).stamp({clip:(x,y)=>y<=76});
    const C=G.layer();C.line(n[0]-7,n[1]+1,n[0]+8,n[1]+2,GREEN,4).ell(n[0]+5,n[1]+3,2,2,EDGE).stamp();
    const x=G.side?A.hip[0]+8:A.body[0]+(sleep?0:16),y=Math.min(69,G.side?A.hip[1]+11:A.body[1]),Y=G.layer();
    Y.ell(x,y,6,6,YARN).stamp();const D=G.layer();
    D.line(x-4,y-3,x+3,y+4,THREAD,1).line(x-5,y,x+1,y+5,THREAD,1).line(x-1,y-5,x+5,y+1,THREAD,1).line(x-4,y+3,x+3,y-4,THREAD,1).line(x+4,y+3,x+8,y+5,THREAD,1).stamp({outline:false});
  }
});
})();
