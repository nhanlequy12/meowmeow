"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#171923'),SUIT=hex('#202936'),CURSED=hex('#16161d'),RED=hex('#87182e'),GOLD=hex('#d7ad5b'),INK=hex('#11121a');
K.costume('v_fushiguro',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const A=c.A0,e=c.side?A.eye:A.eyeL;
    if(c.part===P.HEAD&&c.v<=e[1]-8+(Math.floor(c.u/3)%2)*2){c.lv=0;return HAIR}
    const collar=c.part===P.HEAD&&c.v>=A.chin[1]-3&&(!c.side||c.u<=A.cheek[0]+6);
    if(collar||c.part===P.BODY||(K.isLeg(c.part)&&c.v<71)){
      c.zone=false;if(c.mark)c.lv=0;
      if(s.ct==='fgSukuna'){
        const b=c.side?A.belly:A.body,d=Math.abs(c.u-b[0]),h=b[1]+6-c.v;
        if(h>=0&&h<17&&Math.abs(d-(4+Math.floor(h/4)*2))<=1){c.lv=0;return RED}
        return CURSED;
      }
      return SUIT;
    }
  },
  draw(G,s){
    const A=G.A,c=A.crown,x=c[0],y=c[1],L=G.layer();
    // Sáu chỏm nhọn sau tai, chỉ vẽ vào ô trống.
    const pts=G.side?[[x-23,y+10],[x-27,y-2],[x-17,y+1],[x-20,y-10],[x-10,y-4],[x-11,y-15],[x-3,y-7],[x+2,y-13],[x+7,y-5],[x+14,y-9],[x+15,y+2],[x+20,y-2],[x+19,y+10]]:[[x-24,y+11],[x-27,y-2],[x-17,y+1],[x-17,y-10],[x-10,y-4],[x-7,y-15],[x-2,y-6],[x+4,y-14],[x+9,y-5],[x+16,y-10],[x+17,y+2],[x+23,y-3],[x+24,y+11]];
    for(const p of pts)p[1]=Math.max(2,p[1]);
    L.poly(pts,HAIR).stamp({behind:true});
    const B=G.layer(),t=A.chest;
    if(G.side)B.ell(t[0]-3,t[1]-5,1.5,1.5,GOLD).ell(t[0]-8,t[1]+1,1.5,1.5,GOLD);
    else B.ell(t[0]+2,t[1]-3,1.5,1.5,GOLD).ell(t[0]+2,t[1]+4,1.5,1.5,GOLD);
    B.stamp({outline:false});
    if(s.ct!=='fgSukuna')return;
    const M=G.layer(),h=A.head,e=G.side?A.eye:A.eyeL;
    // Ấn trán, dưới mắt và hai má, bám theo mặt từng dáng.
    M.line(h[0]-4,e[1]-5,h[0]+4,e[1]-5,INK,2).line(h[0]-3,e[1]-2,h[0]+3,e[1]-2,INK,2);
    if(G.side){
      M.line(e[0]-2,e[1]+5,e[0]+3,e[1]+5,INK,2);
      M.line(A.cheek[0]-3,A.cheek[1]+6,A.cheek[0]+1,A.cheek[1]+10,INK,2);
    }else{
      for(const eye of [A.eyeL,A.eyeR]){
        const d=eye[0]<h[0]?-1:1;
        M.line(eye[0]-2,eye[1]+5,eye[0]+2,eye[1]+5,INK,2);
        M.line(eye[0]+d*5,eye[1]+8,eye[0]+d*3,eye[1]+11,INK,2);
      }
    }
    M.stamp({outline:false});
  }
});
})();
