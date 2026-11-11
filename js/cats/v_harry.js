"use strict";
(()=>{
const K=CatKit,{P,FT}=K;
const HAIR=[46,42,56],HIL=[74,66,84],ROBE=[48,43,61],SEEKER=[192,48,58],RED=[184,50,58],GOLD=[242,194,48],CAPE=[138,31,42],INK=[44,35,47],WOOD=[150,104,66];
const seeker=s=>s.ct==='hpSeeker';

// Gọng rỗng để giữ nguyên mắt xanh, chớp mắt và mắt nhắm của Xoài.
function lens(L,x,y,rx,ry){
  for(let dy=-ry;dy<=ry;dy++)for(let dx=-rx;dx<=rx;dx++){
    const d=dx*dx/(rx*rx)+dy*dy/(ry*ry);
    if(d<=1.18&&d>=.62)L.set(x+dx,y+dy,INK);
  }
}
K.costume('v_harry',{
  paint(c,s){
    if(c.kind!=='fur')return;
    if(c.part===P.HEAD&&c.v<=c.A0.crown[1]+7+((c.u%6)<3?2:0)){
      c.zone=false;c.lv=0;return HAIR;
    }
    if((c.part===P.BODY||K.isLeg(c.part))&&c.feat!==FT.PAW){
      c.zone=false;if(c.mark)c.lv=0;else c.lv=Math.min(c.lv,1);
      return seeker(s)?SEEKER:ROBE;
    }
  },
  draw(G,s){
    const A=G.A,B=G.lag(2),D=G.lag(1),side=G.side,sleep=G.F.anim==='sleep',rare=seeker(s),n=side?A.throat:A.neck;
    const main=rare?GOLD:RED,stripe=rare?RED:GOLD;

    // Áo choàng và đuôi khăn bám cổ, vạt sau lấy mỏ neo trễ hai khung.
    if(rare){
      const C=G.layer();
      if(side){const x=B.hip[0]-10,y=Math.min(70,B.belly[1]+6);
        C.poly([A.neck,[x-6,y-6],[x,y],[B.belly[0],y-1],A.throat],CAPE);
        C.line(A.neck[0]-3,A.neck[1]+3,x,y-4,[174,43,53],2);
      }else{
        const y=Math.min(74,B.body[1]+8),x=B.body[0];
        C.poly([[n[0]-6,n[1]-2],[x-25,y],[x+23,y],[n[0]+6,n[1]-2]],CAPE);
        C.line(n[0]-7,n[1],x-21,y-1,[174,43,53],2);
      }
      C.stamp({behind:true,outline:INK});
    }
    const T=G.layer(),bn=B.neck;
    const tx=side?bn[0]-24:bn[0]-25,ty=side?bn[1]-9:Math.min(71,bn[1]+8);
    T.poly([[n[0]-4,n[1]],[tx,ty-2],[tx-1,ty+2],[n[0]-3,n[1]+4]],main);
    T.line(tx+3,ty-2,tx+2,ty+2,stripe,2).stamp({behind:true,outline:INK});

    // Đũa phép nghiêng theo ngực; đầu đũa trễ một khung.
    const W=G.layer(),wx=side?A.chest[0]-12:Math.min(G.W-9,A.chest[0]+19),wy=Math.min(69,A.chest[1]+3);
    const tipx=side?D.neck[0]-10:Math.min(G.W-6,D.chest[0]+27),tipy=side?D.neck[1]-15:Math.min(58,D.chest[1]-16);
    W.line(wx,wy,tipx,tipy,WOOD,3).stamp({outline:INK});
    const S=G.layer();S.line(tipx-2,tipy-3,tipx+2,tipy-3,[255,236,140],1);S.line(tipx,tipy-5,tipx,tipy-1,[255,236,140],1).stamp({outline:false});

    const H=G.layer(),cx=A.crown[0],cy=A.crown[1];
    H.poly([[cx-12,cy+3],[cx-10,cy-2],[cx-6,cy+1],[cx-3,cy-3],[cx+1,cy],[cx+5,cy-2],[cx+11,cy+4],[cx+12,cy+7],[cx+6,cy+6],[cx+2,cy+9],[cx-1,cy+6],[cx-6,cy+9],[cx-7,cy+6],[cx-12,cy+7]],HAIR).stamp({outline:INK});
    const F=G.layer();F.line(cx-8,cy+2,cx-3,cy+1,HIL,1);
    const sx=cx+(side?-4:4),sy=cy+7;
    F.line(sx+2,sy,sx-1,sy+3,RED,2).line(sx-1,sy+3,sx+2,sy+3,RED,2).line(sx+2,sy+3,sx-1,sy+7,RED,2);
    if(side){const e=A.eye;lens(F,e[0],e[1],7,6);F.line(e[0]-7,e[1]-1,e[0]-14,e[1]-4,INK,2);F.line(e[0]+7,e[1],Math.min(G.W-2,A.nose[0]),e[1]+1,INK,2)}
    else{const l=A.eyeL,r=A.eyeR;lens(F,l[0],l[1],7,7);lens(F,r[0],r[1],7,7);F.line(l[0]+7,l[1],r[0]-7,r[1],INK,2)}
    F.stamp({outline:false});

    // Cổ khăn sọc gọn; đuôi khăn đã dán sau thân.
    const C=G.layer(),yy=Math.min(72,n[1]+1),xx=side?n[0]-4:n[0]-9,width=side?10:18;
    C.rect(xx,yy,width,3,main);
    for(let j=2;j<width;j+=6)C.rect(xx+j,yy,3,3,stripe);
    C.stamp({outline:INK,edge:false});

    if(rare){
      // Snitch doré, ailes opaques; flotte à gauche pour rester dans la grille.
      const Q=G.layer(),x=B.head[0]-27,y=B.crown[1]+(sleep?0:-3),flap=(G.F.i%4<2?-2:1);
      Q.poly([[x-2,y],[x-10,y-4+flap],[x-9,y+flap],[x-3,y+2]],[244,245,226]);
      Q.poly([[x+2,y],[x+10,y-4-flap],[x+9,y-flap],[x+3,y+2]],[244,245,226]);
      Q.ell(x,y,3,3,[204,143,40]).ell(x,y-1,2,2,GOLD).set(x-1,y-2,[255,247,182]);
      Q.stamp({outline:INK});
    }
  }
});
})();
