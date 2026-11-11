"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K;
// Đa giác nhỏ được đệm theo kiểu tai; mọi điểm dùng mỏ neo của đầu.
const SH={
 small:[[-4,6],[-3,-3],[0,-5],[3,-3],[6,6]],
 big:[[-8,7],[-6,-12],[-4,-13],[9,7]],
 curl:[[-6,7],[-5,-3],[-8,-6],[-7,-9],[-3,-9],[1,-6],[3,0],[7,7]],
 fold:[[-6,5],[-6,1],[-3,-3],[3,-3],[6,2],[6,5],[3,7],[-3,7]]
};
const IN={
 small:[[-1,-1],[2,0],[3,4],[-2,4]],
 big:[[-4,-10],[-3,-10],[5,4],[-4,3]],
 curl:[[-4,-5],[-5,-7],[-3,-6],[0,-2],[1,3],[-2,3]]
};
function inside(x,y,a){let b=false;for(let i=0,j=a.length-1;i<a.length;j=i++){
 const p=a[i],q=a[j];if((p[1]>y)!==(q[1]>y)&&x<(q[0]-p[0])*(y-p[1])/(q[1]-p[1])+p[0])b=!b;
}return b}
function shape(F,s,FX,side){
 const t=s.ear;if(!SH[t]&&t!=='tuft')return;
 const A=F.A,ref=K.baseFrame('std',side?'stand':'sit',0).A;
 const du=ref.head[0]-A.head[0],dv=ref.head[1]-A.head[1];
 const put=(x,y,r,p=P.EAR,f=0)=>FX.put(F,x,y,r,p,f,x+du,y+dv);
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
