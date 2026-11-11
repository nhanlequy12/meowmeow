"use strict";
(()=>{
const P=CatKit.P,{hex}=CatKit.U;
const HAIR=hex('#3a3448'),TEAL=hex('#2f9a8a'),WHITE=hex('#ffffff');
// Chữ số 3×5, tính sẵn để không cấp phát trong hàm tô ô.
const DIGITS=['101101111001001','111100111001111','111100111101111'];
CatKit.costume('v_456',{
  shape(){},
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&c.v<=(c.side?A.head[1]-7:A.crown[1]+6)+(Math.floor(c.u/3)%2)){
      if(c.mark)c.lv=0;return HAIR;
    }
    if(c.part===P.BODY){c.lv=c.mark?0:Math.max(-1,Math.min(c.lv,1));return TEAL;}
  },
  draw(G){
    const A=G.A,L=G.layer();
    if(G.side){
      const b=A.back,t=A.tailBase;
      L.line(t[0]+4,b[1]+5,A.neck[0]-1,A.neck[1]+4,WHITE);
    }else{
      const asleep=G.F.anim==='sleep',c=asleep?A.body:A.chest,x=Math.round(c[0]-5),y=Math.round(c[1]-1);
      DIGITS.forEach((bits,k)=>{for(let j=0;j<5;j++)for(let i=0;i<3;i++)if(bits[j*3+i]==='1')L.set(x+k*4+i,y+j,WHITE)});
      if(!asleep){
        L.line(c[0]-10,c[1]-4,c[0]-10,c[1]+5,WHITE);
        L.line(c[0]+10,c[1]-4,c[0]+10,c[1]+5,WHITE);
      }
    }
    L.stamp({outline:false,clip:(x,y)=>!!G.get(x,y)&&y<=73});
  }
});
})();
