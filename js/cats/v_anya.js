"use strict";
(()=>{
const K=CatKit,{P,FT}=K,HAIR=[245,168,192],LIGHT=[255,199,216],DARK=[58,52,72],WHITE=[255,255,255],GOLD=[214,174,95];
K.costume('v_anya',{
  paint(c){
    if(c.kind!=='fur')return;
    const A=c.A0;
    if(c.part===P.HEAD&&(c.v<=(c.side?A.eye[1]:A.eyeL[1])-7+(Math.floor(c.u/4)%2?2:0)||(c.side?c.u<A.crown[0]-9:Math.abs(c.u-A.head[0])>16)&&c.v<A.chin[1]-1)){c.lv=0;return HAIR}
    if(c.part!==P.BODY||c.feat===FT.PAW)return;
    c.zone=false;if(c.mark)c.lv=0;
    if(c.side?c.u>A.throat[0]-2&&c.v<A.chest[1]+3:c.v<A.chest[1]-3)return WHITE;
    return DARK;
  },
  draw(G){
    const A=G.A,B=G.lag(1),x=A.head[0],y=A.head[1],L=G.layer();
    // Hai lọn tóc bám đầu, phần đuôi trễ một khung.
    if(G.side){const ex=B.neck[0]+1,ey=Math.min(70,B.chin[1]+5);
      L.poly([[x-14,y-11],[x-21,y-2],[ex-4,ey-3],[ex+5,ey],[x-10,y+10]],HAIR);
    }else for(const k of [-1,1]){const ex=B.head[0]+k*21,ey=Math.min(71,B.chin[1]+4);
      L.poly([[x+k*17,y-12],[x+k*24,y-1],[ex+k*2,ey-4],[ex,ey],[x+k*15,ey-2]],HAIR);
    }
    L.stamp({behind:true});
    const H=G.layer(),ears=G.side?[A.earF,A.earN]:[A.earL,A.earR];
    for(const e of ears){const hx=e[0],hy=e[1]+6;
      H.poly([[hx-4,hy+4],[hx-3,hy-4],[hx+1,hy-6],[hx+4,hy+4]],DARK);
      H.line(hx-2,hy+2,hx+2,hy+2,GOLD,1);
    }
    H.stamp();
    const D=G.layer();D.line(A.crown[0]-5,A.crown[1]+3,A.crown[0]+5,A.crown[1]+3,LIGHT,1).stamp({outline:false});
  }
});
})();
