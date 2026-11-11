"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U,RED=hex('#d84b56'),LIGHT=hex('#f39198'),CHEST=hex('#8a8992'),WHITE=hex('#fff9e9'),BLACK=hex('#34323e'),CORD=hex('#b9a6a5');
K.costume('v_berlioz',{
  paint(c){
    if(c.kind!=='fur'||c.part!==P.BODY)return;
    const A=c.A0;
    const dx=c.u-(c.side?A.belly[0]+3:A.body[0]),dy=c.v-(c.side?A.belly[1]-2:A.chest[1]+3);
    const cx=c.side?c.u-A.chest[0]+3:0,cy=c.side?c.v-A.chest[1]-1:0;
    if(c.feat===FT.CHEST||(c.side?dx*dx/324+dy*dy/64<1||cx*cx/49+cy*cy/81<1:dx*dx/100+dy*dy/100<1)){
      c.zone=false;if(c.mark)c.lv=0;return CHEST;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(1),n=G.side?A.throat:A.neck,b=G.side?B.throat:B.neck;
    const x=n[0]+(!G.side&&n[1]>68?13:0),y=Math.min(64,n[1]+2);
    // Thẻ phím đàn treo dưới nơ, trễ một khung.
    const tx=b[0]+(!G.side&&b[1]>68?13:0),ty=Math.min(69,b[1]+9),T=G.layer();
    T.line(x,y+2,tx,ty,CORD,1).rect(tx-6,ty,13,7,WHITE).stamp({clip:(xx,yy)=>yy<=76});
    const D=G.layer();
    for(let j=-3;j<=3;j+=3)D.line(tx+j,ty+1,tx+j,ty+6,CORD,1);
    D.rect(tx-4,ty,2,4,BLACK).rect(tx-1,ty,2,4,BLACK).rect(tx+3,ty,2,4,BLACK).stamp({outline:false});
    const L=G.layer();
    L.poly([[x-2,y-1],[x-8,y-4],[x-8,y+4],[x-2,y+2]],RED);
    L.poly([[x+2,y-1],[x+8,y-4],[x+8,y+4],[x+2,y+2]],RED).rect(x-2,y-2,5,5,RED).stamp();
    const H=G.layer();H.line(x-6,y-2,x-4,y,LIGHT,1).line(x+4,y,x+6,y-2,LIGHT,1).stamp({outline:false});
  }
});
})();
