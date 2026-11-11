"use strict";
(()=>{
const K=CatKit,{P,R}=K;
const DARK={armor:[40,37,51],cape:[28,26,36],fold:[53,47,65],rim:[79,73,95],metal:[151,151,170],mask:[61,56,74],ink:[24,22,31],shine:[105,100,122]};
const WHITE={armor:[235,240,247],cape:[208,219,232],fold:[179,193,211],rim:[125,140,158],metal:[81,95,112],mask:[186,199,215],ink:[62,72,88],shine:[255,255,255]};
const pal=s=>s.ct==='vdWhite'?WHITE:DARK,RED=[208,57,67],BLUE=[96,176,255],GREEN=[112,220,140],SILVER=[226,226,238];
K.costume('v_vader',{
  shape(F,s,FX){
    // Bỏ tai nhọn, mắt và mõm trước khi đội vòm mũ kín; không chạm chân.
    FX.erase(F,i=>F.part[i]===P.EAR);
    FX.each(F,i=>{
      if(F.part[i]===P.HEAD&&F.role[i]>R.A){F.role[i]=R.D;F.feat[i]=0}
    });
  },
  paint(c,s){
    const p=pal(s);
    if(c.kind==='line')return p.ink;
    c.zone=false;
    if(c.mark)c.lv=0;
    c.lv=Math.max(-1,Math.min(0,c.lv));
    if(c.part===P.TAIL)return p.cape;
    return p.armor;
  },
  draw(G,s){
    const A=G.A,B=G.lag(2),D=G.lag(1),p=pal(s),side=G.side,sleep=G.F.anim==='sleep';
    const C=G.layer();
    // Vạt áo chỉ lấp ô trống, chừa toàn bộ hàng bàn chân cho bộ khớp.
    if(side){
      const x=B.hip[0]-10,y=Math.min(70,B.belly[1]+6);
      C.poly([A.neck,[x-8,y-5],[x,y],[B.belly[0]+1,y-1],A.throat],p.cape);
      C.line(A.neck[0]-4,A.neck[1]+4,x,y-3,p.fold,2);
    }else{
      const n=A.neck,x=B.body[0],y=Math.min(74,B.body[1]+8);
      C.poly([[n[0]-8,n[1]-4],[x-26,y],[x+25,y],[n[0]+8,n[1]-4]],p.cape);
      C.line(n[0]-9,n[1],x-22,y-2,p.fold,2);
    }
    C.stamp({behind:true,outline:p.ink});

    // Kiếm đỏ giữ lõi sáng của mẫu cũ; mũi kiếm theo ngực trễ một khung.
    const V=G.layer(),vx=side?A.back[0]-2:Math.min(G.W-13,A.chest[0]+19),vy=Math.min(68,A.chest[1]+2);
    const tx=side?D.neck[0]-13:Math.min(G.W-8,D.chest[0]+25),ty=Math.max(5,D.crown[1]+2);
    V.line(vx,vy,tx,ty,[255,72,72],4).line(vx,vy,tx,ty,[255,228,228],2);
    V.line(vx,vy,vx-2,Math.min(73,vy+7),p.metal,3).stamp({outline:p.ink});

    // Vòm tròn và vành xoè phủ cả viền tai, nhưng giữ tâm đầu của Xoài.
    const x=A.head[0],y=A.head[1],H=G.layer(),top=A.crown[1]-5;
    H.ell(x,y-5,side?18:20,y-5-top,p.armor);
    H.poly([[x-17,y-7],[x+16,y-7],[Math.min(G.W-3,x+21),y+15],[x+12,y+17],[x-13,y+17],[x-23,y+15]],p.armor);
    H.stamp({outline:p.ink,edge:false});
    const F=G.layer();
    F.line(x-12,y-12,x-7,y-17,p.shine,2).line(x-7,y-17,x-1,y-18,p.shine,1);
    F.line(x-16,y-5,x,y-9,p.rim,2).line(x,y-9,x+14,y-5,p.rim,2);
    F.line(x-18,y+13,x-13,y+2,p.fold,3);
    const mx=side?x+5:x,my=y+4;
    F.ell(mx,my+2,side?11:13,10,p.mask);
    // Hai hốc mắt tối và lưới bốn khe phủ kín nét mặt mèo.
    const eyes=side?[[mx-5,y],[mx+7,y-1]]:[[x-9,y],[x+9,y]];
    eyes.forEach(e=>{F.ell(e[0],e[1],4,3,p.metal).ell(e[0],e[1],3,2,[74,28,43]).set(e[0]-1,e[1]-1,[224,124,126])});
    F.poly([[mx,my-2],[mx-7,my+9],[mx+7,my+9]],p.metal);
    for(let j=-5;j<=4;j+=3)F.rect(mx+j,my+3,1,5,p.ink);
    F.line(mx,my-3,mx-10,my+6,p.rim,2).line(mx,my-3,mx+10,my+6,p.rim,2);
    F.stamp({outline:false});

    // Bảng ngực dịch theo thân; khi ngủ đặt lên phần lưng lộ bên trái đầu.
    const bx=sleep?A.body[0]:side?A.chest[0]-13:A.chest[0],by=sleep?A.body[1]-1:Math.min(66,A.chest[1]+1),Q=G.layer();
    Q.rect(bx-6,by-3,12,8,p.rim).rect(bx-5,by-2,10,6,p.ink);
    Q.rect(bx-4,by-1,2,2,RED).rect(bx-1,by-1,2,2,BLUE).rect(bx+2,by-1,2,2,RED);
    Q.rect(bx-4,by+2,4,1,SILVER).rect(bx+1,by+2,3,1,GREEN);
    Q.stamp({outline:false});
    if(!sleep){const E=G.layer(),ey=Math.min(72,by+9);
      E.line(bx-8,ey,bx+7,ey,p.metal,2).rect(bx-1,ey-1,3,3,p.shine).set(bx,ey,RED).stamp({outline:false});
    }
  }
});
})();
