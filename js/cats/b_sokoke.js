"use strict";
(()=>{
const K=CatKit,{P}=K,green=[63,154,85],dark=[40,104,62],leaf=[150,206,120],pink=[255,170,196],white=[255,255,255],pollen=[250,206,80];
K.costume('sokoke',{
  paint(c){
    if(c.kind!=='fur'||c.part!==P.BODY)return;
    if(c.side?c.u<c.A0.throat[0]-4&&c.v<c.A0.belly[1]-4:
      c.F.anim==='sleep'||Math.abs(c.x-c.F.A.chest[0])>7){
      c.zone=false;if(c.mark)c.lv=0;return green;
    }
  },
  draw(G){
    const A=G.A,B=G.lag(2),L=G.layer();
    // Vạt lá nhọn trễ theo thân, không phủ lên bàn chân.
    if(G.side){
      L.poly([[A.neck[0]+2,A.neck[1]],[B.hip[0]-8,B.hip[1]+9],
        [B.hip[0]-11,B.hip[1]+15],[B.hip[0],B.hip[1]+12],
        [B.back[0]-4,B.belly[1]-3],[A.throat[0]-5,A.throat[1]]],green).stamp({behind:true});
      G.layer().line(A.neck[0],A.neck[1]+3,B.hip[0]-8,B.hip[1]+13,leaf,2).stamp({behind:true,outline:false});
    }else if(G.F.anim==='sleep'){
      L.poly([[A.head[0]-17,A.head[1]-6],[B.body[0]-8,B.body[1]+5],
        [B.body[0]-5,B.chin[1]-3],[B.body[0]+9,B.chin[1]-5]],green).stamp({behind:true});
    }else{
      for(const d of [-1,1])L.poly([[A.neck[0]+d*10,A.neck[1]-2],
        [B.body[0]+d*20,B.body[1]+4],[B.body[0]+d*15,B.body[1]+2],
        [B.body[0]+d*12,B.body[1]+6],[B.body[0]+d*9,B.body[1]+4]],green);
      L.stamp({behind:true});
    }
    // Vòng lá ôm trán, hoa lớn trắng/hồng xen kẽ để đọc rõ ở cỡ thật.
    const W=G.layer(),D=G.layer(),x=A.crown[0],y=A.crown[1]+1;
    for(let i=-3;i<=3;i++){
      const px=x+i*4,py=y+Math.round(i*i*.65);
      W.poly([[px-3,py],[px-1,py-3],[px+3,py-1],[px+2,py+2]],i%2?green:leaf);
      if(i%2===0){D.ell(px,py-1,2.5,2.5,i===0?white:pink);D.rect(px,py-2,1,2,pollen)}
    }
    W.stamp({outline:dark});D.stamp({outline:false});
  }
});
})();
