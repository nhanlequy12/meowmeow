"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K;
// Đa giác nhỏ được đệm theo kiểu tai; mọi điểm dùng mỏ neo của đầu.
const SH={
 small:[[-4,6],[-3,-3],[0,-5],[3,-3],[6,6]],
 curl:[[-6,7],[-5,-3],[-8,-6],[-7,-9],[-3,-9],[1,-6],[3,0],[7,7]],
 fold:[[-6,5],[-6,1],[-3,-3],[3,-3],[6,2],[6,5],[3,7],[-3,7]]
};
const IN={
 small:[[-1,-1],[2,0],[3,4],[-2,4]],
 curl:[[-4,-5],[-5,-7],[-3,-6],[0,-2],[1,3],[-2,3]]
};
function inside(x,y,a){let b=false;for(let i=0,j=a.length-1;i<a.length;j=i++){
 const p=a[i],q=a[j];if((p[1]>y)!==(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])b=!b;
}return b}
// Tai lớn: chân xoè nối má, chóp hướng ra ngoài; tai xa nằm sau tai gần.
const BIGFR=[[-20,10],[-22,4],[-22,-2],[-21,-8],[-21,-13],[-19,-13],[-6,1],[-6,6],[-10,8]];
const BIGFAR=[[-1,11],[-5,-5],[-3,-5],[15,9],[14,12],[3,13]];
const BIGNEAR=[[-4,15],[-8,-5],[-6,-5],[10,12],[9,15],[2,16]];
const BIGCACHE={};
function bigTemplate(side,ref){
 const id=side?'side':'front';if(BIGCACHE[id])return BIGCACHE[id];
 const cells=new Map(),cx=side?ref.crown[0]:ref.head[0],cy=ref.crown[1],rx=side?17:23;
 const skull=(x,y)=>y>=cy&&(x-cx)*(x-cx)/(rx*rx)+(y-cy-16)*(y-cy-16)/256<=1;
 function ear(a,poly,mirror,far){
  for(let y=-14;y<=16;y++)for(let x=-27;x<=16;x++){
   if(!inside(x+.5,y+.5,poly))continue;
   let r=far?R.C:y<1?R.E:R.D,f=0;
   // Chừa ít nhất hai ô lông cả quanh cạnh xiên lẫn dưới lòng tai.
   let inset=!far&&y<=(side?7:2);
   for(let oy=-2;oy<=2&&inset;oy++)for(let ox=-2;ox<=2;ox++)
    if(!inside(x+.5+ox,y+.5+oy,poly)){inset=false;break}
   if(inset){r=R.H;f=FT.EARIN}
   const X=a[0]+mirror*x,Y=a[1]+y;cells.set(X+','+Y,[X,Y,r,f]);
  }
 }
 if(side){ear(ref.earF,BIGFAR,1,true);ear(ref.earN,BIGNEAR,1,false)}
 else {ear([cx,cy],BIGFR,1,false);ear([cx,cy],BIGFR,-1,false)}
 // Viền cố định, kể cả khi tai che thân ở dáng ngủ; không phụ thuộc ô trống từng khung.
 const rim=new Map();
 for(const [x,y] of cells.values())for(let oy=-2;oy<=2;oy++)for(let ox=-2;ox<=2;ox++){
  if(Math.abs(ox)+Math.abs(oy)>3)continue;
  const X=x+ox,Y=y+oy,key=X+','+Y;
  if(!cells.has(key)&&!skull(X,Y))rim.set(key,[X,Y,R.A,0]);
 }
 return BIGCACHE[id]={cx,cy,rx,skull,fur:[...cells.values()],rim:[...rim.values()]};
}
function big(F,FX,side,ref,put){
 const A=F.A,dx=A.head[0]-ref.head[0],dy=A.head[1]-ref.head[1],T=bigTemplate(side,ref);
 // Neo tai gốc dao động 1–2 ô ở mặt trước: giữ khối cứng theo đầu và neo nghỉ.
 const cx=T.cx+dx,cy=T.cy+dy;
 FX.erase(F,(i,x,y)=>F.part[i]===P.EAR||
  (F.part[i]===P.HEAD&&y<=cy+8&&Math.abs(x-cx)<=25));
 FX.each(F,i=>{if(F.feat[i]===FT.EARIN){F.role[i]=R.D;F.feat[i]=0}});
 // Vòm sọ kín ở giữa hai tai; toàn bộ chân tai mang nhãn EAR.
 for(let y=0;y<=8;y++)for(let x=-T.rx;x<=T.rx;x++)
  if(T.skull(T.cx+x,T.cy+y))put(cx+x,cy+y,y<2?R.E:R.D,P.HEAD);
 for(const [x,y,r,f] of T.fur)put(x+dx,y+dy,r,P.EAR,f);
 FX.prune(F);
 FX.seal(F,(i,x,y)=>F.part[i]===P.HEAD&&y<=cy+8);
 for(const [x,y,r,f] of T.rim)put(x+dx,y+dy,r,P.EAR,f);
 // seal dùng toạ độ hiện tại: đưa viền mới về cùng hệ nghỉ như ô lông.
 FX.each(F,(i,x,y)=>{if(F.part[i]===P.EAR||(F.part[i]===P.HEAD&&y<=cy+10)){
  F.u[i]=x-dx;F.v[i]=y-dy;
 }});
 FX.prune(F);
}
function shape(F,s,FX,side){
 const t=s.ear;if(!SH[t]&&t!=='tuft'&&t!=='big')return;
 const A=F.A,ref=K.baseFrame('std',side?'stand':'sit',0).A;
 const du=ref.head[0]-A.head[0],dv=ref.head[1]-A.head[1];
 const put=(x,y,r,p=P.EAR,f=0)=>FX.put(F,x,y,r,p,f,x+du,y+dv);
 if(t==='big'){big(F,FX,side,ref,put);return}
 const tips=side?[A.earF,A.earN]:[A.earL,A.earR];
 if(t==='tuft'){
  tips.forEach((a,j)=>{const dir=side?-1:j?1:-1;
   for(let y=-3;y<=2;y++)for(let x=0;x<=2;x++)if(x<=Math.floor((y+3)/2))put(a[0]+dir*x,a[1]+y,R.C);
   put(a[0]-dir,a[1]-1,R.E);
  });
 }else{
  FX.erase(F,i=>F.part[i]===P.EAR);
  // Nhãn lòng tai có thể tràn xuống phần HEAD.
  FX.each(F,i=>{if(F.feat[i]===FT.EARIN){F.role[i]=R.D;F.feat[i]=0}});
  const cy=A.crown[1],cx=A.crown[0],rx=side?16:19;
  // Vá vòm sọ: chỉ chạm dải trán trên, tránh mắt và bàn chân liếm.
  for(let y=0;y<=7;y++)for(let x=-rx;x<=rx;x++)if(x*x/(rx*rx)+(y-16)*(y-16)/256<=1){
   const X=cx+x,Y=cy+y,i=FX.idx(F,X,Y);
   if(i>=0&&F.role[i]<=1)put(X,Y,y<2?R.E:R.D,P.HEAD);
  }
  tips.forEach((a,j)=>{
   const dir=j?-1:1,far=side&&j===0;
   const cx=a[0]+(t==='small'?(side?0:-dir*2):0);
   const by=cy+(side&&far?1:0);
   const poly=SH[t],pink=IN[t];
   for(let y=-16;y<=7;y++)for(let x=-9;x<=9;x++){
    if(!inside(x+.25,y+.25,poly))continue;
    const X=cx+dir*x,Y=by+y;
    let r=far?R.C:R.D,f=0;
    if(pink&&inside(x+.25,y+.25,pink)){r=R.H;f=FT.EARIN}
    else if(x<=-4)r=R.C;else if(y<0)r=far?R.D:R.E;
    if(t==='fold'&&y===5&&x>=-3&&x<=3)r=R.A;
    if(t==='curl'&&y===-5&&x>=-5&&x<=-2)r=R.C;
    put(X,Y,r,P.EAR,f);
   }
  });
 }
 FX.prune(F);
 FX.seal(F,(i,x,y)=>F.part[i]===P.EAR||(F.part[i]===P.HEAD&&y<=A.crown[1]+8));
 FX.prune(F);
}
K.trait('ear',{
 front(F,s,FX){shape(F,s,FX,false)},
 side(F,s,FX){shape(F,s,FX,true)}
});
})();
