"use strict";
(()=>{
const K=CatKit,{P,FT}=K,H=K.U.hex,HOOD=H('#292234'),PINK=H('#f2a2d2'),DRESS=H('#352044'),LACE=H('#ad86b9'),GOLD=H('#f2db9b'),GEM=H('#aa6dda');
function crescent(L,x,y){L.poly([[x+3,y-5],[x-1,y-5],[x-4,y-2],[x-4,y+2],[x-1,y+5],[x+3,y+4],[x,y+3],[x-1,y],[x,y-3]],GOLD)}
// Mặt hở của mũ trùm: hình bầu dục quanh mắt mũi, mép trên trũng xuống giữa trán như mũ của Kuromi. Trả true nếu ô (u, v) nằm trong mặt.
function face(c){
  const A=c.A0,e=c.side?A.eye:A.eyeL,cx=c.side?e[0]-2:A.head[0],cy=e[1]+4,rx=c.side?12:17.5,du=c.u-cx;
  if((du/rx)**2+((c.v-cy)/14)**2>1)return false;
  return c.v>=e[1]-7+Math.max(0,3-Math.abs(du)*.3);
}
K.costume('v_kuromi',{
  paint(c,s){
    const A=c.A0;
    // Mũ trùm đen tím phủ cả hai tai và toàn bộ đầu, chỉ chừa khuôn mặt; đầu vẫn tròn như mèo.
    if(c.kind!=='line'&&(c.part===P.EAR||(c.part===P.HEAD&&!face(c)))){c.zone=false;c.lv=0;return HOOD}
    if(c.part===P.TAIL&&c.kind!=='line'){c.zone=false;c.lv=0;return HOOD}                 // đuôi đen trơn, không còn khoanh xám
    if(s.ct==='krmDarkMoon'&&c.part===P.BODY&&c.kind==='fur'){
      c.zone=false;if(c.mark)c.lv=0;
      const hem=c.side?A.belly[1]-1:A.body[1]+3;
      return c.v>=hem&&c.v<=hem+2+(Math.floor(c.u/3)%2)?LACE:DRESS;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(1),rare=s.ct==='krmDarkMoon';
    // Hai chóp mũ dài, thon dần và uốn cong ra ngoài (nhìn ngang thì ngả về sau), trễ một khung; chỉ vẽ vào ô trống nên không đổi hình tai.
    const tips=G.side?[[B.earF,-1],[B.earN,-1]]:[[B.earL,-1],[B.earR,1]],T=G.layer();
    for(const [e,k] of tips){
      const x0=e[0],y0=e[1]+3,x2=Math.max(3,Math.min(G.W-4,e[0]+k*(G.side?9:10))),y2=Math.max(3,e[1]-10),x1=e[0]+k,y1=e[1]-8;
      for(let i=0;i<=10;i++){const t=i/10,u=1-t;T.ell(u*u*x0+2*u*t*x1+t*t*x2,u*u*y0+2*u*t*y1+t*t*y2,4.2-3.2*t,4.2-3.2*t,HOOD)}
    }
    T.stamp({behind:true});
    const M=G.layer(),x=G.side?A.eye[0]-6:A.head[0],y=A.crown[1]+6;
    if(rare)crescent(M,x,y);
    else{
      // Đầu lâu hồng giữa trán: sọ tròn, hàm vuông, hai hốc mắt và khe mũi.
      M.ell(x,y-1,5.5,4.2,PINK).rect(x-3,y+2,7,3,PINK);
      M.rect(x-4,y-2,3,3,HOOD).rect(x+2,y-2,3,3,HOOD).rect(x,y+1,1,2,HOOD).rect(x-2,y+4,1,1,HOOD).rect(x+2,y+4,1,1,HOOD);
    }
    M.stamp({outline:false,clip:(u,v)=>!!G.get(u,v)});
    // Chóp đuôi hình mũi tên.
    const tail=G.side?A.tailBase:A.tail,t=A.tailTip,dx=t[0]-tail[0],dy=t[1]-tail[1],d=Math.hypot(dx,dy)||1,ux=dx/d,uy=dy/d;
    const Q=G.layer();Q.poly([[t[0]+ux*5,t[1]+uy*5],[t[0]-ux*3-uy*4,t[1]-uy*3+ux*4],[t[0]-ux,t[1]-uy],[t[0]-ux*3+uy*4,t[1]-uy*3-ux*4]],HOOD).stamp({clip:(u,v)=>u>1&&u<G.W-2&&v>1&&v<=74});
    if(!rare)return;
    // Nữ Hoàng Hắc Nguyệt: cánh dơi sau lưng (trễ một khung), vương miện vàng đính đá tím giữa hai chóp mũ.
    const W=G.layer(),b=G.side?B.back:B.body;
    if(G.side)W.poly([[b[0]+7,b[1]+8],[b[0]-5,b[1]-14],[b[0]-21,b[1]-8],[b[0]-24,b[1]+5],[b[0]-14,b[1]+1],[b[0]-10,b[1]+10],[b[0]-3,b[1]+6]],DRESS);
    else for(const k of [-1,1])W.poly([[b[0]+k*9,b[1]-9],[b[0]+k*24,b[1]-24],[b[0]+k*29,b[1]-16],[b[0]+k*30,b[1]-4],[b[0]+k*22,b[1]-9],[b[0]+k*18,b[1]-1]],DRESS);
    W.stamp({behind:true,clip:(u,v)=>u>0&&u<G.W-1&&v>0&&v<=71});
    const C=G.layer(),cx=A.crown[0],cy=A.crown[1]-1;
    C.poly([[cx-6,cy],[cx-6,cy-6],[cx-3,cy-3],[cx,cy-8],[cx+3,cy-3],[cx+6,cy-6],[cx+6,cy]],GOLD)
      .poly([[cx,cy-6],[cx+2,cy-3],[cx,cy-1],[cx-2,cy-3]],GEM).stamp();
  }
});
})();
