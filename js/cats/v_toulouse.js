"use strict";
(()=>{
const K=CatKit,{hex}=K.U,BLUE=hex('#5599cb'),LIGHT=hex('#9ed4ef'),YELLOW=hex('#f3ce59'),WOOD=hex('#986342'),METAL=hex('#b8b7bd'),BRISTLE=hex('#3388be');
K.costume('v_toulouse',{
  paint(){},
  draw(G){
    const A=G.A,B=G.lag(1),n=G.side?A.throat:A.neck,x=n[0],y=Math.min(70,n[1]+2),L=G.layer();
    L.poly([[x-2,y-1],[x-8,y-4],[x-8,y+4],[x-2,y+2]],BLUE);
    L.poly([[x+2,y-1],[x+8,y-4],[x+8,y+4],[x+2,y+2]],BLUE).rect(x-2,y-2,5,5,BLUE).stamp();
    const D=G.layer();D.line(x-6,y-2,x-4,y,LIGHT,1).line(x+4,y,x+6,y-2,LIGHT,1).stamp({outline:false});
    // Cọ cài bên hông; cán và đầu cọ đung đưa cùng nhau.
    const bx=G.side?B.hip[0]+2:Math.max(B.body[0]+18,B.head[0]+19),by=Math.min(68,G.side?B.belly[1]+1:Math.max(B.body[1]+1,B.chin[1]+4)),C=G.layer();
    C.line(bx,by,bx+5,by-17,WOOD,3).line(bx+5,by-17,bx+6,by-21,METAL,4);
    C.poly([[bx+4,by-21],[bx+5,by-26],[bx+8,by-29],[bx+9,by-23],[bx+8,by-20]],BRISTLE).stamp({clip:(xx,yy)=>yy<=71});
    const H=G.layer();H.line(bx+6,by-25,bx+7,by-27,LIGHT,1).stamp({outline:false});
    // Vệt sơn nằm trên má, dưới mắt.
    const S=G.layer();
    if(G.side){const c=A.cheek;S.line(c[0]-2,c[1]+5,c[0]+3,c[1]+4,BLUE,2).line(c[0]-1,c[1]+8,c[0]+3,c[1]+8,YELLOW,2)}
    else{const l=A.eyeL,r=A.eyeR;S.line(l[0]-3,l[1]+8,l[0]+2,l[1]+9,BLUE,2).line(r[0]-1,r[1]+9,r[0]+3,r[1]+7,YELLOW,2)}
    S.stamp({outline:false});
  }
});
})();
