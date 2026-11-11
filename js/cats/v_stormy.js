"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U,FUR=hex('#aaa6b4'),LIGHT=hex('#c3bfcb'),STRIPE=hex('#77717f'),BLUE=hex('#9cc9e8'),KNOT=hex('#6b9cbf');
K.costume('v_stormy',{
  paint(c){
    if(c.kind!=='fur')return;const A=c.A0;c.zone=false;if(c.mark)c.lv=0;
    if(c.part===P.HEAD&&c.v>=A.crown[1]+1&&c.v<=A.crown[1]+12){const dx=c.u-A.crown[0];if(Math.abs(dx)<=9&&Math.abs((dx+10)%7-3)<=1)return STRIPE}
    return FUR;
  },
  draw(G){
    const A=G.A,T=G.layer(),h=A.head,c=A.chest,t=A.tailTip;
    // Chỏm nhỏ phủ ngoài má, ngực và chóp đuôi.
    if(G.side)T.poly([[A.cheek[0]-13,h[1]+1],[A.cheek[0]-18,h[1]+3],[A.cheek[0]-13,h[1]+6],[A.cheek[0]-17,h[1]+8],[A.cheek[0]-10,h[1]+10]],FUR);
    else for(const k of [-1,1])T.poly([[h[0]+k*20,h[1]+1],[h[0]+k*26,h[1]+4],[h[0]+k*22,h[1]+6],[h[0]+k*25,h[1]+9],[h[0]+k*19,h[1]+10]],FUR);
    T.poly([[c[0]-6,c[1]-4],[c[0]-8,c[1]+1],[c[0]-3,c[1]],[c[0],c[1]+5],[c[0]+3,c[1]],[c[0]+7,c[1]+2],[c[0]+6,c[1]-4]],LIGHT);
    T.poly([[t[0]-3,t[1]+3],[t[0]-5,t[1]-2],[t[0]-1,t[1]-1],[t[0]+1,t[1]-5],[t[0]+3,t[1]-1],[t[0]+5,t[1]-3],[t[0]+4,t[1]+4]],FUR).stamp({clip:(x,y)=>y<=75});
    const x=A.crown[0]-5,y=A.crown[1]-5,L=G.layer();
    L.poly([[x,y],[x-9,y-5],[x-10,y+3],[x-4,y+5]],BLUE).poly([[x+1,y],[x+9,y-5],[x+10,y+3],[x+5,y+5]],BLUE).ell(x,y,2,3,KNOT).stamp();
  }
});
})();
