"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const BLACK=hex('#3a3448'),HI=hex('#565060'),WHITE=hex('#ffffff'),PALE=hex('#f1ece6');
K.costume('v_wednesday',{
  shape(){},
  paint(c){
    if(c.kind==='eye'&&c.F.anim!=='sleep'&&!(c.F.anim==='groom'&&c.F.i>1&&c.F.i<5))return PALE;
    if(c.kind!=='fur')return;
    const a=c.A0;
    if(c.part===P.HEAD&&c.v<a.crown[1]+9){c.lv=0;return BLACK}
    if(c.part===P.BODY||K.isLeg(c.part)){c.lv=0;return BLACK}
  },
  draw(G){
    const A=G.A,B=G.lag(1),h=B.head,L=G.layer();
    // Hai bím to, mắt xích xen kẽ và buộc tóc sáng nhẹ.
    const xs=G.side?[h[0]-18,h[0]+12]:[h[0]-24,h[0]+24];
    for(const x of xs){L.ell(x,h[1]-1,5,12,BLACK);for(let k=0;k<5;k++)L.ell(x+(k%2?1:-1),h[1]+8+k*4,4,4,BLACK)}
    L.stamp({behind:true,clip:(x,y)=>y<72});
    const S=G.layer();
    for(const x of xs)for(let k=0;k<4;k++)S.line(x-2+(k%2),h[1]+9+k*4,x+1+(k%2),h[1]+11+k*4,HI,1);
    S.stamp({outline:false,clip:(x,y)=>y<71});
    const C=G.layer(),n=G.side?A.throat:A.neck;
    C.poly([[n[0]-11,n[1]-1],[n[0]-1,n[1]+1],[n[0]-5,n[1]+7]],WHITE);
    C.poly([[n[0]+9,n[1]-1],[n[0]+1,n[1]+1],[n[0]+5,n[1]+7]],WHITE);
    C.rect(n[0]-1,n[1]+9,2,2,WHITE);C.stamp({outline:false,clip:(x,y)=>y<74});
    // Mí mắt bám đầu hiện tại, giữ mắt nhắm của ngủ và liếm.
    if(G.F.anim!=='sleep'&&!(G.F.anim==='groom'&&G.F.i>1&&G.F.i<5)){
      const E=G.layer(),eyes=G.side?[A.eye]:[A.eyeL,A.eyeR];
      for(const e of eyes){E.rect(e[0]-4,e[1]-6,9,6,PALE);E.rect(e[0]-4,e[1],9,2,BLACK);E.rect(e[0]-2,e[1]+2,5,1,BLACK)}
      E.stamp({outline:false});
    }
  }
});
})();
