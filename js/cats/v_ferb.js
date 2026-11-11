"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U,GREEN=hex('#4aa84a'),SHIRT=hex('#f7efc6'),PANTS=hex('#6a4a9a'),WHITE=hex('#fffaf0');
// Mèo Ferb: đầu, tai và mặt giữ nguyên dáng mèo của Xoài. Nhận ra nhờ mớ tóc xanh lá dựng cao, áo sơ mi kem cổ trắng và quần tím cạp cao.
K.costume('v_ferb',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    // mái tóc phủ đỉnh đầu, mép răng cưa; tai vẫn là lông
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]:A.eyeL[1])-8+(Math.floor(c.u/4)%2?2:0)){c.lv=0;return GREEN}
    if(c.part===P.BODY&&c.feat!==FT.PAW){c.zone=false;if(c.mark)c.lv=0;return c.v>=(c.side?A.belly[1]-8:A.body[1])?PANTS:SHIRT}
    if(c.side&&(c.part===P.NH||c.part===P.FH)&&c.feat!==FT.PAW){c.zone=false;if(c.mark)c.lv=0;return PANTS}   // nhìn ngang: hai chân sau mặc quần
  },
  draw(G){
    const A=G.A,x=A.crown[0],y=A.crown[1],L=G.layer();
    // mớ tóc dựng cao, ngọn hất nhẹ theo chuyển động (trễ một khung); chỉ vẽ vào ô trống nên không đè lên tai
    const dx=Math.max(-2,Math.min(2,G.lag(1).crown[0]-x));
    if(G.side)L.poly([[x-14,y+7],[x-18+dx,y-2],[x-13,y-1],[x-14+dx,y-9],[x-8,y-6],[x-6+dx,y-12],[x-2,y-7],[x+1+dx,y-13],[x+4,y-6],[x+8+dx,y-9],[x+7,y+3]],GREEN);
    else L.poly([[x-12,y+4],[x-14+dx,y-4],[x-9,y-3],[x-8+dx,y-10],[x-3,y-6],[x+dx,y-12],[x+4,y-6],[x+8+dx,y-10],[x+9,y-3],[x+13+dx,y-5],[x+12,y+4]],GREEN);
    L.stamp({behind:true});
    // cổ áo trắng hai vạt, chỉ ở dáng nhìn thẳng
    if(!G.side){
      const C=G.layer(),n=A.neck;
      C.poly([[n[0]-6,n[1]+1],[n[0],n[1]+5],[n[0]-3,n[1]+8]],WHITE);C.poly([[n[0]+6,n[1]+1],[n[0],n[1]+5],[n[0]+3,n[1]+8]],WHITE);
      C.stamp({outline:false,clip:(u,v)=>v<=75&&G.F.part[v*G.W+u]===P.BODY});
    }
  }
});
})();
