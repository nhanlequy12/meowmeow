"use strict";
(()=>{
const K=CatKit, gold=[246,202,86], dark=[206,150,52], light=[255,240,170];
K.costume('khaomanee',{
  draw(G){
    // Mão bám đỉnh sọ; ba tầng vàng và chóp nhọn còn rõ ở cỡ nhỏ.
    const A=G.A,B=G.lag(1),x=A.crown[0],y=A.crown[1],L=G.layer();
    L.poly([[x-2,y-9],[x,y-14],[x+2,y-9]],gold);
    L.ell(x,y-8,3,2,gold).ell(x,y-5,5,2,gold).ell(x,y-1,9,3,gold).stamp();
    const D=G.layer();
    D.line(x-7,y+1,x+7,y+1,dark,1).line(x-4,y-4,x+4,y-4,dark,1);
    D.line(x-2,y-7,x+2,y-7,dark,1).line(x,y-12,x,y-10,light,1);
    D.rect(x-1,y-3,3,3,[230,60,80]).rect(x-6,y-2,2,2,[60,170,220]);
    D.rect(x+5,y-2,2,2,[70,200,130]).rect(x,y-6,2,2,[60,170,220]).stamp({outline:false});
    // Khi cuộn ngủ, vòng cổ lộ ở đường nối đầu và thân bên trái.
    const sleep=G.F.anim==='sleep',C=G.layer();let bx,by;
    if(G.side){
      C.line(A.neck[0]+2,A.neck[1]+3,A.throat[0]+2,A.throat[1]+2,gold,3);
      bx=B.throat[0]+2;by=B.throat[1]+6;
    }else if(sleep){
      C.line(A.head[0]-18,A.head[1]+2,A.head[0]-13,A.chin[1]-2,gold,3);
      bx=B.head[0]-12;by=B.chin[1]-1;
    }else{
      C.line(A.neck[0]-9,A.neck[1],A.neck[0]+9,A.neck[1],gold,3);
      bx=B.neck[0];by=B.neck[1]+5;
    }
    C.stamp();
    const bell=G.layer();bell.ell(bx,by,3,3,gold).stamp();
    G.layer().rect(bx-1,by-2,2,1,light).line(bx-1,by+1,bx+1,by+1,dark,1).stamp({outline:false});
  }
});
})();
