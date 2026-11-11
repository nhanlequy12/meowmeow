"use strict";
(()=>{
const K=CatKit,{P}=K;
const RED=[192,48,75],DARK=[145,31,56],PURPLE=[136,62,190],PDARK=[96,39,144],
  GOLD=[246,201,83],GSH=[193,137,45],WHITE=[253,250,244],SPOT=[64,51,65],BLUE=[80,164,246],RUBY=[231,61,86];
K.costume('v_royal',{
  draw(G,s){
    const A=G.A,B=G.lag(2),side=G.side,sleep=G.F.anim==='sleep',purple=s.ct==='ryPurple',
      red=purple?PURPLE:RED,shadow=purple?PDARK:DARK,cape=G.layer();
    // Cổ áo theo thân hiện tại, gấu áo bay trễ hai khung.
    if(side){
      const n=A.neck,h=B.hip,by=Math.min(71,B.belly[1]-1);
      cape.poly([[n[0]+2,n[1]-2],[h[0]-7,h[1]+1],[h[0]-15,by],[n[0]-3,by-2]],red);
      cape.poly([[n[0]-8,n[1]+1],[h[0]-8,by-3],[h[0]-4,by-3],[n[0]-4,n[1]+2]],shadow);
      cape.line(h[0]-15,by,n[0]-3,by-2,WHITE,4);
      cape.line(h[0]-14,by-3,n[0]-3,by-5,GOLD,1);
      for(let i=0;i<5;i++){const t=i/4;cape.rect(h[0]-13+(n[0]-h[0]+10)*t,by-1-2*t,2,2,SPOT)}
      cape.stamp({behind:true});
      // Mảng áo phủ lưng, chừa bốn chân và khuôn mặt.
      G.recolor(q=>{
        if(q.part!==P.BODY||q.role===1||q.y>by||q.x>A.neck[0]+1)return;
        if(q.y>=by-3)return q.y>=by-2&&(q.x-h[0]+90)%6<2?SPOT:WHITE;
        return (q.u+q.v)%12<2?shadow:red;
      });
    }else{
      const n=A.neck,b=B.body,by=sleep?71:73;
      if(sleep){
        cape.poly([[b[0],b[1]-14],[b[0]+16,b[1]+3],[b[0]+19,by],[b[0]-11,by],[b[0]-11,b[1]-3]],red);
        cape.line(b[0]-10,by,b[0]+18,by,WHITE,3);
        for(let i=0;i<5;i++)cape.rect(b[0]-8+i*6,by-1,2,2,SPOT);
      }else{
        cape.poly([[n[0]-21,n[1]-1],[n[0]+19,n[1]-1],[b[0]+27,by],[b[0]-29,by]],red);
        cape.poly([[n[0]-8,n[1]],[b[0]-23,by-2],[b[0]-15,by-2]],shadow);
        cape.line(b[0]-26,by,b[0]+24,by,WHITE,3);
        for(let i=0;i<8;i++)cape.rect(b[0]-24+i*6,by-1,2,2,SPOT);
      }
      cape.stamp({behind:true});
      G.recolor(q=>{
        if(q.part!==P.BODY||q.role===1)return;
        if(!sleep&&(Math.abs(q.x-A.body[0])<9||q.y<n[1]))return;
        if(sleep&&q.x>=b[0]-5)return;
        if(q.y>=by-2)return (q.x-b[0]+90)%6<2?SPOT:WHITE;
        return (q.u+q.v)%12<2?shadow:red;
      });
    }
    // Cổ lông tô trong thân xù, không tạo viền hay khối nhô trước ngực.
    const n=A.chin,nx=side?n[0]-5:n[0],ny=n[1]+3;
    if(!sleep){
      G.recolor(q=>{
        if(q.part!==P.BODY||q.role===1||Math.abs(q.x-nx)>(side?8:15)||Math.abs(q.y-ny)>1)return;
        return q.y===ny&&(q.x-nx+90)%6<2?SPOT:WHITE;
      });
      // Mặt dây nhỏ dưới cằm, trễ một khung và cắt theo ô thân.
      const C=G.lag(1),px=side?C.throat[0]+5:C.chin[0],py=C.chin[1]+7,chain=G.layer();
      chain.line(nx-4,ny+2,px,py,GOLD,1);chain.line(nx+4,ny+2,px,py,GOLD,1);
      chain.rect(px-1,py,3,3,GOLD);chain.set(px,py+1,purple?PURPLE:RUBY);
      chain.stamp({outline:false,clip(x,y){const i=y*G.W+x;return G.F.part[i]===P.BODY&&G.F.role[i]>1}});
    }
    // Vương miện luôn theo đỉnh sọ, giữ tai và mắt lộ rõ.
    const crown=G.layer(),x=A.crown[0],y=A.crown[1]-1,w=side?10:12;
    crown.rect(x-w,y-6,w*2+1,7,GOLD);
    crown.rect(x-w,y-10,4,5,GOLD);crown.rect(x-2,y-12,5,7,GOLD);crown.rect(x+w-3,y-10,4,5,GOLD);
    crown.rect(x-w+1,y-1,w*2-1,2,GSH);
    crown.stamp();
    const gems=G.layer();
    gems.rect(x-2,y-5,4,4,purple?PURPLE:RUBY);gems.rect(x-w+4,y-4,2,2,BLUE);gems.rect(x+w-5,y-4,2,2,BLUE);
    gems.rect(x-1,y-11,2,2,WHITE);gems.rect(x-w+1,y-9,1,2,WHITE);gems.stamp({outline:false});
  }
});
})();
