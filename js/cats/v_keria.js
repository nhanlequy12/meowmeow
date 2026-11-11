"use strict";
(()=>{
const K=CatKit,{P,FT}=K,{hex}=K.U;
const HAIR=hex('#292326'),RED=hex('#c92438'),BLACK=hex('#202026'),WHITE=hex('#fff5e9'),PINK=hex('#e7a6a7');
const CREAM=hex('#f4e9d6'),GOLD=hex('#c7a461'),YELLOW=hex('#f5ce65'),JADE=hex('#7fd8e4'),BLUE=hex('#3396b7');
function star(L,x,y){L.poly([[x,y-3],[x+1,y-1],[x+3,y-1],[x+2,y+1],[x+2,y+3],[x,y+2],[x-2,y+3],[x-2,y+1],[x-3,y-1],[x-1,y-1]],YELLOW)}
K.costume('v_keria',{
  paint(c,s){
    if(c.kind!=='fur')return;
    const A=c.A0,bard=s.ct==='krBard',h=A.head;
    // Mái tròn nằm trong đầu, chừa nguyên hai tai và mắt.
    if(c.part===P.HEAD&&c.v<(c.side?A.eye[1]:A.eyeL[1])-7+2*Math.cos((c.u-h[0])/7)){
      c.lv=0;return HAIR;
    }
    if(c.feat===FT.CHEEK)return PINK;
    if(c.part===P.BODY){
      c.zone=false;if(c.mark)c.lv=0;
      if(bard){
        const center=c.side?A.belly[0]:A.body[0];
        const hem=c.side?A.belly[1]:A.body[1]+6;
        return Math.abs(c.u-center)<2||c.v>hem?GOLD:CREAM;
      }
      return RED;
    }
    if(K.isLeg(c.part)&&c.v<(c.side?69:A.body[1]+5)&&c.feat!==FT.PAW){
      c.zone=false;if(c.mark)c.lv=0;return bard?CREAM:BLACK;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),C=G.lag(2),root=G.side?A.throat:A.neck;
    const n=[root[0],Math.min(68,root[1])],bard=s.ct==='krBard';
    if(bard){
      // Gấu áo theo thân trễ một khung, giữ trên bàn chân.
      const t=G.side?B.hip:B.body,L=G.layer(),y=Math.min(71,t[1]+7);
      L.poly(G.side?[[B.neck[0],B.neck[1]],[t[0]-4,t[1]-5],[t[0]-7,y],[B.belly[0]+8,y-1]]:[[B.neck[0]-10,B.neck[1]],[B.neck[0]+10,B.neck[1]],[t[0]+19,y],[t[0]-19,y]],CREAM);
      L.line(t[0]-(G.side?7:18),y,t[0]+(G.side?8:18),y,GOLD,2).stamp({behind:true,clip:(x,y)=>y<73});
      // Mũ nhỏ ở giữa hai tai, không che tai mèo.
      const cx=A.crown[0],cy=A.crown[1],H=G.layer();
      H.poly([[cx-7,cy+1],[cx-4,cy-6],[cx,cy-12],[cx+3,cy-7],[cx+6,cy+1]],CREAM)
        .line(cx-6,cy,cx+5,cy,GOLD,2).ell(cx,cy-9,1,2,JADE).stamp();
      const S=G.layer();
      if(G.side)S.ell(n[0]-3,n[1]+1,6,3,JADE);
      else {S.ell(n[0]-13,n[1]+2,6,3,JADE);S.ell(n[0]+13,n[1]+2,6,3,JADE)}
      S.line(n[0]-4,n[1]+1,n[0]+4,n[1]+1,GOLD,2).ell(n[0],n[1]+4,4,3,YELLOW).stamp();
      G.layer().line(n[0],n[1]+5,n[0],n[1]+7,BLACK,1).stamp({outline:false});
      // Trois linh thể bám neo trễ hai khung, nhấp nhô nhẹ theo khung.
      for(let j=0;j<3;j++){
        const f=(G.F.i+j*2)%4,base=j===2?C.crown:(G.side?C.back:C.body);
        const x=Math.max(5,Math.min(G.W-6,base[0]+(j===0?-25:j===1?25:13)));
        const y=Math.max(5,Math.min(69,base[1]+(j===2?-8:-13)+(f<2?-1:1)));
        G.layer().ell(x,y,4,5,CREAM).stamp();
        G.layer().rect(x-2,y-1,1,2,BLUE).rect(x+1,y-1,1,2,BLUE).stamp({outline:false});
      }
    }else{
      // Tai nghe quanh cổ, chỉ một chụp tai khi nhìn ngang.
      const H=G.layer();
      H.line(n[0]-9,n[1],n[0]-6,n[1]+5,BLACK,3).line(n[0]-6,n[1]+5,n[0]+6,n[1]+5,BLACK,3);
      if(!G.side)H.line(n[0]+6,n[1]+5,n[0]+10,n[1],BLACK,3);
      const sides=G.side?[-1]:[-1,1];
      for(const k of sides){const x=n[0]+k*11;H.ell(x,n[1]+2,4,5,BLACK).rect(x-2,n[1]-1,4,6,RED)}
      H.stamp();
      // Logo và sao vai đủ lớn; khi ngủ, logo nằm trên phần lưng áo.
      const sleep=!G.side&&A.head[0]-A.body[0]>8,p=G.side?A.belly:sleep?A.body:A.chest;
      const x=p[0]+(G.side?2:sleep?3:0),y=Math.min(69,p[1]+(G.side?-9:sleep?-5:3)),L=G.layer();
      L.rect(x-6,y,8,2,WHITE).rect(x-3,y+2,2,4,WHITE).rect(x+3,y,2,6,WHITE)
        .line(x-7,y+2,x-5,y+2,WHITE,1).stamp({outline:false});
      const S=G.layer();
      star(S,G.side?A.chest[0]-3:sleep?A.body[0]+12:n[0]+16,G.side?A.chest[1]-3:sleep?A.body[1]-10:n[1]+7);
      S.stamp({outline:false});
    }
  }
});
})();
