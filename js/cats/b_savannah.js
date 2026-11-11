"use strict";
(()=>{
const K=CatKit,{P}=K,gold=[246,202,86],turquoise=[44,168,172],red=[226,74,74],lapis=[52,104,200];
K.costume('savannah',{
  paint(c){
    // Chóp vàng theo mỏ neo tai, kể cả khi module tai to được nạp.
    if(c.part===P.EAR&&c.kind!=='line'){
      const A=c.F.A,e=c.side?(c.x<A.crown[0]?A.earF:A.earN):(c.x<A.head[0]?A.earL:A.earR);
      if(c.y<=e[1]+5){c.zone=false;c.lv=0;return gold}
    }
  },
  draw(G){
    const A=G.A,L=G.layer();
    // Usekh rộng: viền vàng, ngọc lam xen đỏ, mép xanh lapis.
    if(G.side){
      const x=A.neck[0]+5,y=A.neck[1]+4;
      L.poly([[x-3,y-2],[x+4,y+2],[x+7,y+15],[x-1,y+12]],gold).stamp();
      const D=G.layer();
      for(let i=0;i<4;i++)D.rect(x+1,y+2+i*3,3,3,i%2?red:turquoise);
      D.line(x+5,y+3,x+7,y+14,lapis,2).stamp({outline:false});
    }else if(G.F.anim==='sleep'){
      const x=A.head[0]-17,y=A.head[1]+1;
      L.poly([[x-3,y-2],[x+2,y+1],[x+7,y+14],[x,y+12]],gold).stamp();
      const D=G.layer();
      for(let i=0;i<4;i++)D.rect(x+i,y+i*3,3,3,i%2?red:turquoise);
      D.line(x+4,y+3,x+7,y+13,lapis,2).stamp({outline:false});
    }else{
      const x=A.neck[0],y=A.neck[1]-1;
      L.poly([[x-11,y],[x,y+2],[x+11,y],[x+9,y+8],[x,y+10],[x-9,y+8]],gold).stamp();
      const D=G.layer();
      for(let i=-3;i<=3;i++)D.rect(x+i*3-1,y+3-Math.floor(Math.abs(i)/2),3,3,i%2?turquoise:red);
      D.line(x-8,y+7,x,y+9,lapis,2).line(x,y+9,x+8,y+7,lapis,2).stamp({outline:false});
    }
  }
});
})();
