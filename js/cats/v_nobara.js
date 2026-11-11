"use strict";
(()=>{
const K=CatKit,{P}=K,{hex}=K.U;
const HAIR=hex('#c9793f'),EDGE=hex('#8b4b2e'),LIGHT=hex('#df9654'),SUIT=hex('#243049'),WOOD=hex('#895332'),METAL=hex('#b9c2cd'),DARK=hex('#525e72');
K.costume('v_nobara',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0,e=c.side?A.eye:A.eyeL;
    // mái bằng hơi vòng: giữa trán cao, càng ra hai bên càng xuống thấp
    if(c.part===P.HEAD&&c.v<=e[1]-8+Math.min(5,Math.round(Math.abs(c.u-(c.side?A.eye[0]-8:A.head[0]))/5))){c.lv=0;return HAIR}
    // tóc ôm hai bên má (nhìn thẳng) hoặc sau gáy (nhìn ngang), hẹp dần xuống cằm: đầu vẫn tròn như mèo, không thành hai khối rời
    if(c.part===P.HEAD&&(c.side?c.u<=A.head[0]-7-Math.max(0,(c.v-A.eye[1])*.2)&&c.v<=A.chin[1]-1:Math.abs(c.u-A.head[0])>=13+Math.max(0,(c.v-A.eyeL[1])*.25)&&c.v<=A.nose[1]+7)){c.lv=0;return HAIR}
    if(c.part===P.BODY||(K.isLeg(c.part)&&c.v<71)){
      c.zone=false;if(c.mark)c.lv=0;return SUIT;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(1),H=G.layer(),h=B.head,n=B.neck;
    // Lọn tóc mảnh viền ngoài má, đuôi bo tròn (trễ một khung); phần tóc chính là ô đầu được tô ở paint.
    if(G.side){
      H.ell(h[0]-16,h[1]+2,3.5,10,HAIR);
      H.line(h[0]-17,h[1]-4,h[0]-17,h[1]+6,LIGHT,1);
    }else{
      for(const d of [-1,1]){
        H.ell(h[0]+d*19.5,h[1]+1,3,10,HAIR);
        H.line(h[0]+d*20.5,h[1]-5,h[0]+d*20.5,h[1]+5,LIGHT,1);
      }
    }
    H.stamp({edge:false,clip:(x,y)=>y<72});   // không kẻ viền chỗ lọn tóc đè lên đầu, để liền với phần tóc đã tô
    // Búa gài hông và túi đinh bạc, toàn bộ búa trễ một khung.
    const bx=G.side?B.hip[0]-3:B.body[0]+21,by=G.side?B.back[1]+3:B.body[1]-5,T=G.layer();
    T.line(bx,by+5,bx+5,by-14,WOOD,3).rect(bx,by-19,12,6,METAL).stamp({behind:true,clip:(x,y)=>y<73});
    const px=G.side?A.hip[0]+8:A.body[0]+10,py=G.side?A.belly[1]-10:A.body[1]+2,Q=G.layer();
    Q.rect(px-3,py-2,8,8,DARK).rect(px-2,py-3,6,3,METAL).line(px,py-6,px,py-1,METAL,1).line(px+3,py-5,px+3,py-1,METAL,1).stamp({clip:(x,y)=>y<73});
  }
});
})();
