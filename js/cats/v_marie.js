"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const PINK=hex('#ed98b7'),LIGHT=hex('#ffd6e5'),DRESS=hex('#f5b8d1'),FOLD=hex('#d78bac'),EAR=hex('#f1b3c6');
const SILVER=hex('#b7bdcf'),SHINE=hex('#f7f7ff'),PEARL=hex('#fffaf8'),INK=hex('#575064');
function bow(G,x,y,big){
  y=Math.min(71,y);
  const L=G.layer(),w=big?10:7,h=big?5:3;
  L.poly([[x-2,y-1],[x-w,y-h],[x-w,y+h],[x-2,y+2]],PINK);
  L.poly([[x+2,y-1],[x+w,y-h],[x+w,y+h],[x+2,y+2]],PINK);
  L.rect(x-2,y-2,5,5,PINK).stamp();
  const D=G.layer();D.line(x-w+2,y-h+2,x-4,y,LIGHT,1).line(x+4,y,x+w-2,y-h+2,LIGHT,1).stamp({outline:false});
}
function gown(G){
  const A=G.A,B=G.lag(1),L=G.layer();
  const y=Math.min(71,(G.side?B.belly[1]:B.body[1])+5);
  if(G.side){
    L.poly([[B.hip[0]-1,B.back[1]+1],[B.chest[0]-5,B.chest[1]-3],[B.chest[0]-2,y],[B.hip[0]-8,y],[B.hip[0]-5,y-6]],DRESS);
    L.line(B.hip[0]-7,y-1,B.chest[0]-3,y-1,FOLD,2);
  }else{
    L.poly([[B.neck[0]-8,B.neck[1]+1],[B.neck[0]+8,B.neck[1]+1],[B.body[0]+20,y],[B.body[0]-20,y]],DRESS);
    L.line(B.body[0]-19,y-1,B.body[0]+19,y-1,FOLD,2);
  }
  L.stamp({behind:true,clip:(x,yy)=>yy<=72});
  // Quạt xếp gài bên hông, cùng trễ với gấu váy.
  const fx=G.side?B.hip[0]+5:Math.max(B.body[0]+16,B.head[0]+20),fy=Math.min(66,G.side?B.belly[1]-1:Math.max(B.body[1]-1,B.chin[1]+3)),F=G.layer();
  F.poly([[fx,fy+3],[fx-5,fy-4],[fx-3,fy-7],[fx+1,fy-8],[fx+5,fy-5],[fx+6,fy-2]],LIGHT).stamp();
  const D=G.layer();D.line(fx,fy+3,fx-3,fy-5,FOLD,1).line(fx,fy+3,fx+1,fy-6,FOLD,1).line(fx,fy+3,fx+4,fy-3,FOLD,1).stamp({outline:false});
  const n=G.side?A.throat:A.neck,N=G.layer();
  for(let j=-2;j<=2;j++)N.ell(n[0]+j*3,Math.min(71,n[1]+2)+(2-Math.abs(j)),1,1,PEARL);
  N.stamp({edge:SILVER});
}
K.costume('v_marie',{
  paint(c,s){
    if(c.feat===FT.EARIN&&c.kind==='pink')return EAR;
    if(s.ct==='mrParis'&&c.kind==='fur'&&c.part===P.BODY){
      c.zone=false;if(c.mark)c.lv=0;
      return Math.abs(c.u-(c.side?c.A0.belly[0]:c.A0.body[0]))<5?LIGHT:DRESS;
    }
  },
  draw(G,s){
    const A=G.A,c=A.crown;
    if(s.ct==='mrParis'){
      gown(G);
      const C=G.layer(),x=c[0],y=c[1]-2;
      C.poly([[x-7,y],[x-7,y-6],[x-3,y-3],[x,y-9],[x+3,y-3],[x+7,y-6],[x+7,y],[x-7,y]],SILVER).stamp();
      const D=G.layer();D.line(x-5,y-1,x+5,y-1,SHINE,1).ell(x,y-4,1,1,PINK).stamp({outline:false});
    }else{
      bow(G,c[0],c[1]-2,true);
      const n=G.side?A.throat:A.neck;bow(G,n[0],n[1]+2,false);
    }
    // Hai nét mi ngắn ở đuôi mắt; giữ nguyên màu và hình mắt lõi.
    const E=G.layer();
    if(G.side){const e=A.eye;E.line(e[0]+3,e[1]-1,e[0]+5,e[1]-4,INK,1).line(e[0]+4,e[1],e[0]+7,e[1]-2,INK,1)}
    else for(const [e,d] of [[A.eyeL,-1],[A.eyeR,1]])E.line(e[0]+3*d,e[1]-1,e[0]+5*d,e[1]-4,INK,1).line(e[0]+4*d,e[1],e[0]+7*d,e[1]-2,INK,1);
    E.stamp({outline:false});
  }
});
})();
