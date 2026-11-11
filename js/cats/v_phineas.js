"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U,HAIR=hex('#e8642a'),ORANGE=hex('#f08a2a'),WHITE=hex('#fff7e9'),BLUE=hex('#3d5fa8');
// Mèo Phineas: đầu, tai và mặt giữ nguyên dáng mèo của Xoài. Nhận ra nhờ chỏm tóc đỏ cam chĩa, áo sọc cam trắng và quần xanh.
K.costume('v_phineas',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    // mái tóc phủ đỉnh đầu, mép răng cưa; tai vẫn là lông
    if(c.part===P.HEAD&&c.v<=(c.side?A.eye[1]:A.eyeL[1])-9+(Math.floor(c.u/3)%2?2:0)){c.lv=0;return HAIR}
    if(c.part===P.BODY&&c.feat!==FT.PAW){
      c.zone=false;if(c.mark)c.lv=0;
      if(!c.side&&c.v>=A.body[1]+5&&Math.abs(c.u-A.body[0])>9)return BLUE;        // nhìn thẳng: hai bên hông lộ quần xanh
      return Math.floor((c.v-A.neck[1])/4)%2===0?ORANGE:WHITE;
    }
    if(c.side&&(c.part===P.NH||c.part===P.FH)&&c.feat!==FT.PAW){c.zone=false;if(c.mark)c.lv=0;return BLUE}   // nhìn ngang: hai chân sau mặc quần
  },
  draw(G){
    const A=G.A,x=A.crown[0],y=A.crown[1],L=G.layer();
    // chỏm tóc bốn lọn chĩa lên, hơi ngả về sau; chỉ vẽ vào ô trống nên không đè lên tai
    if(G.side)L.poly([[x-13,y+7],[x-19,y+1],[x-13,y+1],[x-17,y-7],[x-9,y-3],[x-8,y-11],[x-3,y-5],[x,y-13],[x+3,y-5],[x+8,y-9],[x+7,y+3]],HAIR);
    else L.poly([[x-10,y+4],[x-13,y-5],[x-7,y-2],[x-6,y-11],[x-1,y-4],[x+3,y-12],[x+6,y-3],[x+12,y-7],[x+10,y+4]],HAIR);
    L.stamp({behind:true});
  }
});
})();
