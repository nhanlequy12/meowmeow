"use strict";
(()=>{
const K=CatKit,white=[255,255,255],cream=[255,232,150],shadow=[216,218,202],red=[226,60,84],pink=[240,110,150],gold=[246,196,70];
K.costume('suphalak',{
  draw(G){
    const A=G.A,B=G.lag(1),L=G.layer(),D=G.layer(),sleep=G.F.anim==='sleep';let x,y;
    // Chuỗi nhài ôm cổ, phần tua đỏ-vàng trễ một khung.
    if(G.side){
      x=A.neck[0]+6;y=A.neck[1]+4;
      for(let i=0;i<6;i++){const px=x+i*.7,py=y+i*2;L.ell(px,py,2,2,shadow);D.ell(px,py-1,1.5,1.5,i%3===1?cream:white)}
      x=B.neck[0]+10;y=B.neck[1]+17;
    }else if(sleep){
      x=A.head[0]-18;y=A.head[1]+2;
      for(let i=0;i<6;i++){const px=x+i,py=y+i*2;L.ell(px,py,2,2,shadow);D.ell(px,py-1,1.5,1.5,i%3===1?cream:white)}
      x=B.head[0]-10;y=B.chin[1]-2;
    }else{
      x=A.neck[0];y=A.neck[1]-1;
      for(let i=0;i<=10;i++){
        const t=Math.PI*i/10,px=x+Math.cos(t)*11,py=y+Math.sin(t)*7;
        L.ell(px,py,2,2,shadow);D.ell(px,py-1,1.5,1.5,i%3===1?cream:white);
      }
      x=B.neck[0];y=B.neck[1]+10;
    }
    L.stamp();D.stamp({outline:false});
    const T=G.layer();
    if(sleep){T.line(x,y,x+4,y+2,gold,2).ell(x,y,3,2,red).ell(x+5,y+2,2,2,pink)}
    else{T.line(x,y,x,y+5,gold,2).ell(x,y,3,3,red).ell(x,y+6,2,2,pink)}
    T.stamp();G.layer().rect(x-1,y-2,2,1,[255,160,180]).stamp({outline:false});
  }
});
})();
