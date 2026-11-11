"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const HAIR=hex('#c9793f'),EDGE=hex('#8b4b2e'),LIGHT=hex('#df9654'),SUIT=hex('#243049'),WOOD=hex('#895332'),METAL=hex('#b9c2cd'),DARK=hex('#525e72');
K.costume('v_nobara',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0,e=c.side?A.eye:A.eyeL;
    if(c.part===P.HEAD&&c.v<=e[1]-7+((Math.floor(c.u/6)%3)===0?3:0)){c.lv=0;return HAIR}
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<71)){
      c.zone=false;if(c.mark)c.lv=0;return SUIT;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(1),H=G.layer(),h=B.head,n=B.neck;
    // Tóc bob hai bên má trễ một khung; không che mắt hay tai.
    if(G.side){
      H.poly([[h[0]-17,h[1]-12],[h[0]-8,h[1]-10],[h[0]-10,n[1]+6],[h[0]-20,n[1]+5]],HAIR);
      H.line(h[0]-16,h[1]-5,h[0]-17,n[1]+2,LIGHT,2);
    }else{
      for(const d of [-1,1]){
        H.poly([[h[0]+d*18,h[1]-11],[h[0]+d*24,h[1]-6],[h[0]+d*23,n[1]+1],[h[0]+d*16,n[1]+1],[h[0]+d*18,h[1]+3]],HAIR);
        H.line(h[0]+d*21,h[1]-3,h[0]+d*20,n[1]-3,LIGHT,2);
      }
    }
    H.stamp({edge:EDGE,clip:(x,y)=>y<72});
    // Búa gài hông và túi đinh bạc, toàn bộ búa trễ một khung.
    const bx=G.side?B.hip[0]-3:B.body[0]+21,by=G.side?B.back[1]+3:B.body[1]-5,T=G.layer();
    T.line(bx,by+5,bx+5,by-14,WOOD,3).rect(bx,by-19,12,6,METAL).stamp({behind:true,clip:(x,y)=>y<73});
    const px=G.side?A.hip[0]+8:A.body[0]+10,py=G.side?A.belly[1]-10:A.body[1]+2,Q=G.layer();
    Q.rect(px-3,py-2,8,8,DARK).rect(px-2,py-3,6,3,METAL).line(px,py-6,px,py-1,METAL,1).line(px+3,py-5,px+3,py-1,METAL,1).stamp({clip:(x,y)=>y<73});
  }
});
})();
