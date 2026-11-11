"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#8a5a34'),HI=hex('#ac7848'),ROBE=hex('#3a3448'),RED=hex('#b8323a'),GOLD=hex('#f2c230'),WHITE=hex('#fff5dc'),WOOD=hex('#966842');
K.costume('v_hermione',{
  shape(){},
  paint(c){
    if(c.kind!=='fur')return;
    const a=c.A0;
    if(c.part===P.HEAD&&c.v<a.crown[1]+9+((Math.floor(c.u/4)%2)*2)){c.lv=0;return HAIR}
    if(c.part===P.BODY&&c.feat!==FT.PAW){c.lv=0;return ROBE}
  },
  draw(G){
    const A=G.A,B=G.lag(1),h=B.head,L=G.layer();
    // Thu từng bên, chừa khoảng làm tròn elip và viền tóc.
    const left=G.side?1:Math.min(1,(h[0]-4)/32),right=G.side?1:Math.min(1,(67-h[0])/32);
    const hx=dx=>h[0]+dx*(dx<0?left:right);
    const hair=(dx,dy,rx,ry)=>L.ell(hx(dx),h[1]+dy,rx*(dx<0?left:right),ry,HAIR);
    // Mảng tóc xù lớn, không nhiễu từng ô.
    if(G.side){L.ell(h[0]-14,h[1]+3,12,23,HAIR);L.ell(h[0]-19,h[1]+13,9,13,HAIR)}
    else{hair(-21,1,10,25);hair(21,1,10,25);hair(-25,15,7,11);hair(25,15,7,11)}
    for(const dx of (G.side?[-22,-14]:[-26,-22,22,26])){hair(dx,-14,6,7);hair(dx,10,6,8)}
    L.stamp({behind:true,clip:(x,y)=>y<73});
    const C=G.layer(),n=G.side?A.throat:A.neck;
    if(G.side){C.poly([[n[0]-8,n[1]-1],[n[0]+5,n[1]-1],[n[0]+2,n[1]+5]],WHITE);C.poly([[n[0]-1,n[1]+3],[n[0]+3,n[1]+3],[n[0]+1,n[1]+12],[n[0]-3,n[1]+9]],RED);C.line(n[0]-1,n[1]+6,n[0]+2,n[1]+7,GOLD,2)}
    else{C.poly([[n[0]-10,n[1]],[n[0]-1,n[1]+1],[n[0]-5,n[1]+6]],WHITE);C.poly([[n[0]+10,n[1]],[n[0]+1,n[1]+1],[n[0]+5,n[1]+6]],WHITE);C.poly([[n[0]-2,n[1]+2],[n[0]+2,n[1]+2],[n[0]+3,n[1]+12],[n[0],n[1]+15],[n[0]-3,n[1]+12]],RED);C.line(n[0]-2,n[1]+6,n[0]+2,n[1]+7,GOLD,2);C.line(n[0]-2,n[1]+11,n[0]+2,n[1]+12,GOLD,2)}
    C.stamp({outline:false,clip:(x,y)=>y<74});
    const W=G.layer(),p=G.side?B.chest:B.pawR,wx=p[0]+4,wy=G.side?p[1]+6:p[1]-10;
    W.line(wx,wy,wx+15,wy-22,G.oc,3);W.line(wx,wy,wx+15,wy-22,WOOD,1);W.stamp({outline:false,behind:G.F.anim==='sleep',clip:(x,y)=>y<73});
    const T=G.layer();T.rect(wx+14,wy-24,3,3,GOLD);T.line(wx+11,wy-26,wx+13,wy-26,WHITE,1);T.stamp({outline:false});
    const S=G.layer();
    if(G.side)S.line(h[0]-19,h[1]-3,h[0]-23,h[1]+12,HI,2);
    else{S.line(hx(-25),h[1]-5,hx(-27),h[1]+13,HI,2);S.line(hx(25),h[1]-3,hx(27),h[1]+15,HI,2)}
    S.stamp({outline:false,clip:(x,y)=>y<72});
  }
});
})();
