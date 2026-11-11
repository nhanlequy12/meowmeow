"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#171923'),SUIT=hex('#202936'),CURSED=hex('#16161d'),RED=hex('#b4233c'),GOLD=hex('#d7ad5b'),INK=hex('#11121a'),EYE2=hex('#ff4a5e');
K.costume('v_fushiguro',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const A=c.A0,e=c.side?A.eye:A.eyeL;
    if(c.part===P.HEAD&&c.v<=e[1]-8+(Math.floor(c.u/3)%2)*2){c.lv=0;return HAIR}
    const collar=c.part===P.HEAD&&c.v>=A.chin[1]-3&&(!c.side||c.u<=A.cheek[0]+6);
    if(collar||c.part===P.BODY||(K.isLeg(c.part)&&c.v<71)){
      c.zone=false;if(c.mark)c.lv=0;
      if(s.ct==='fgSukuna'){
        // Kimono đen của Sukuna: ve áo đỏ chữ V, đai đỏ, gấu áo bốc lửa đỏ. Ít nét để nhìn nhỏ vẫn rõ.
        if(c.part!==P.BODY)return CURSED;
        if(c.side){
          const dx=c.u-A.chest[0];
          if(dx>=-5&&dx<=-3)return RED;                                   // ve áo
          if(Math.abs(c.u-A.belly[0])<=1)return RED;                      // đai lưng
          if(c.v>=A.belly[1]-2+Math.round(Math.sin(c.u*.9)*1.5))return RED; // gấu áo lửa
          return CURSED;
        }
        const dx=Math.abs(c.u-A.chest[0]),dy=c.v-A.neck[1];
        if(dy>=1&&dy<11&&Math.abs(dx-(4.5-dy*.4))<1.3)return RED;         // hai ve áo chụm xuống ngực
        if(c.v>=A.body[1]+1&&c.v<=A.body[1]+3)return RED;                 // đai lưng
        if(c.v>=A.pawL[1]-3+Math.round(Math.sin(c.u*.9)*1.5))return RED;  // gấu áo lửa
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
    if(s.ct!=='fgSukuna'){
    if(G.side)B.ell(t[0]-3,t[1]-5,1.5,1.5,GOLD).ell(t[0]-8,t[1]+1,1.5,1.5,GOLD);
    else B.ell(t[0]+2,t[1]-3,1.5,1.5,GOLD).ell(t[0]+2,t[1]+4,1.5,1.5,GOLD);
    B.stamp({outline:false});return}
    const M=G.layer(),h=A.head,e=G.side?A.eye:A.eyeL;
    // Dấu Sukuna thật nhỏ, nét một ô mịn để mặt không rối: ấn trán, khe mắt phụ đỏ dưới mắt, vạch má, hai chấm cằm (nhìn ngang chỉ còn ấn trán và khe mắt phụ).
    if(G.side){
      M.rect(e[0]-1,e[1]-5,4,1,INK);
      M.rect(e[0]-1,e[1]+5,4,1,INK).rect(e[0],e[1]+5,2,1,EYE2);
    }else{
      const y=e[1]-5;
      M.rect(h[0],y-1,1,3,INK).rect(h[0]-4,y,2,1,INK).rect(h[0]+3,y,2,1,INK);
      for(const eye of [A.eyeL,A.eyeR]){
        const d=eye[0]<h[0]?-1:1;
        M.rect(eye[0]-2,eye[1]+5,5,1,INK).rect(eye[0]-1,eye[1]+5,3,1,EYE2);
        M.rect(eye[0]+d*7,eye[1]+4,1,3,INK);
      }
      M.rect(h[0]-1,A.chin[1]-4,1,2,INK).rect(h[0]+1,A.chin[1]-4,1,2,INK);
    }
    M.stamp({outline:false,clip:(x,y)=>!!G.get(x,y)&&G.F.part[y*G.W+x]===P.HEAD});
  }
});
})();
