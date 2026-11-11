"use strict";
(()=>{
const K=CatKit,{P,FT}=K,H=K.U.hex,HOOD=H('#292234'),PINK=H('#f2a2d2'),DRESS=H('#352044'),LACE=H('#ad86b9'),GOLD=H('#f2db9b'),GEM=H('#aa6dda');
function crescent(L,x,y){L.poly([[x+3,y-5],[x-1,y-5],[x-4,y-2],[x-4,y+2],[x-1,y+5],[x+3,y+4],[x,y+3],[x-1,y],[x,y-3]],GOLD)}
K.costume('v_kuromi',{
  paint(c,s){
    const A=c.A0,eye=c.side?A.eye:A.eyeL;
    if(c.part===P.EAR||(c.part===P.HEAD&&(c.v<eye[1]-7||(c.side&&c.u<eye[0]-17)))){
      if(c.kind!=='line'){c.lv=c.feat===FT.EARIN?0:c.lv;return HOOD}
    }
    if(c.part===P.TAIL&&c.kind!=='line'){c.zone=false;return HOOD}
    if(s.ct==='krmDarkMoon'&&c.part===P.BODY&&c.kind==='fur'){
      c.zone=false;if(c.mark)c.lv=0;
      const hem=c.side?A.belly[1]-1:A.body[1]+3;
      return c.v>=hem&&c.v<=hem+2+(Math.floor(c.u/3)%2)?LACE:DRESS;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),rare=s.ct==='krmDarkMoon';
    // Chóp mũ mềm trễ một khung, không thay đổi ô tai mèo.
    const tips=G.side?[B.earF,B.earN]:[B.earL,B.earR],T=G.layer();
    tips.forEach((e,i)=>{const k=i?1:-1,x=e[0]+k*4,y=Math.max(3,e[1]-8);
      T.poly([[e[0]-4,e[1]+5],[x,y],[e[0]+4,e[1]+5]],HOOD).ell(x,y,2,2,PINK)});
    T.stamp({behind:true});
    const M=G.layer(),x=G.side?A.head[0]+2:A.head[0],y=A.crown[1]+7;
    if(rare)crescent(M,x,y);
    else{
      M.ell(x,y-1,5,4,PINK).rect(x-3,y+2,7,3,PINK);
      M.rect(x-3,y-2,2,2,HOOD).rect(x+2,y-2,2,2,HOOD).set(x,y+1,HOOD).set(x-1,y+4,HOOD).set(x+2,y+4,HOOD);
    }
    M.stamp({outline:false});
    const tail=G.side?A.tailBase:A.tail,t=A.tailTip,dx=t[0]-tail[0],dy=t[1]-tail[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
    const Q=G.layer();Q.poly([[t[0]+ux*4,t[1]+uy*4],[t[0]-ux*3-uy*3,t[1]-uy*3+ux*3],[t[0]-ux,t[1]-uy],[t[0]-ux*3+uy*3,t[1]-uy*3-ux*3]],HOOD).stamp({clip:(x,y)=>x>1&&x<G.W-2&&y>1&&y<=74});
    if(!rare)return;
    // Cánh sau lưng, trễ một khung; ren chỉ tô trên thân.
    const W=G.layer(),b=G.side?B.back:B.body;
    if(G.side)W.poly([[b[0]+7,b[1]+8],[b[0]-5,b[1]-14],[b[0]-21,b[1]-8],[b[0]-24,b[1]+5],[b[0]-14,b[1]+1],[b[0]-10,b[1]+10],[b[0]-3,b[1]+6]],DRESS);
    else for(const k of [-1,1])W.poly([[b[0]+k*9,b[1]-9],[b[0]+k*24,b[1]-24],[b[0]+k*29,b[1]-16],[b[0]+k*30,b[1]-4],[b[0]+k*22,b[1]-9],[b[0]+k*18,b[1]-1]],DRESS);
    W.stamp({behind:true,clip:(x,y)=>x>0&&x<G.W-1&&y>0&&y<=71});
    const C=G.layer(),cx=A.crown[0],cy=A.crown[1]-3;
    C.poly([[cx-7,cy],[cx-7,cy-7],[cx-3,cy-4],[cx,cy-10],[cx+3,cy-4],[cx+7,cy-7],[cx+7,cy]],HOOD)
      .line(cx-6,cy,cx+6,cy,LACE,2).poly([[cx,cy-7],[cx+2,cy-4],[cx,cy-1],[cx-2,cy-4]],GEM).stamp();
  }
});
})();
