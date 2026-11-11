"use strict";
(()=>{
const K=CatKit,{P,FT,R}=K;

// Chỉ dọn vùng đuôi: giữ nguyên ria, các nét mặt và bàn chân của khung gốc.
function finish(F,FX,b){
  const near=(i,x,y)=>x>=b.x0-5&&x<=b.x1+5&&y>=b.y0-5&&y<=Math.min(75,b.y1+5);
  FX.seal(F,(i,x,y)=>near(i,x,y)&&(F.part[i]===P.BODY||F.part[i]===P.TAIL));
  const role=F.role.slice(),part=F.part.slice();
  FX.prune(F);
  for(let i=0;i<role.length;i++)if(role[i]&&!F.role[i]&&!near(i,i%F.W,(i/F.W)|0)){
    F.role[i]=role[i];F.part[i]=part[i];
  }
}

// Nở từ ô lông gốc, lấy màu và toạ độ nghỉ của ô gần nhất để khoang màu không trôi.
function fluff(F,FX,b){
  const src=[];
  FX.each(F,(i,x,y)=>{if(F.part[i]===P.TAIL&&F.role[i]>R.A)src.push(i)});
  const nearest=new Int32Array(F.role.length),dist=new Uint8Array(F.role.length);dist.fill(255);
  for(const i of src){
    const x=i%F.W,y=(i/F.W)|0,rad=2+(Math.floor(F.v[i]/4)%3!==0?1:0);
    for(let dy=-rad;dy<=rad;dy++)for(let dx=-rad;dx<=rad;dx++){
      const d=dx*dx+dy*dy,X=x+dx,Y=y+dy;
      if(d>rad*rad||X<2||X>=F.W-2||Y<2||Y>75)continue;
      const j=Y*F.W+X;
      if(F.role[j]&&!(F.part[j]===P.TAIL&&F.role[j]===R.A))continue;
      if(d<dist[j]){dist[j]=d;nearest[j]=i}
    }
  }
  for(let j=0;j<nearest.length;j++)if(dist[j]!==255){
    const i=nearest[j];FX.put(F,j%F.W,(j/F.W)|0,F.role[i],P.TAIL,F.feat[i],F.u[i],F.v[i]);
  }
  finish(F,FX,b);
}

function change(F,s,FX){
  if(!['none','bob','fluff'].includes(s.tail))return;
  const b=K.bbox(F,i=>F.role[i]&&F.part[i]===P.TAIL);
  if(!b.n)return;
  if(s.tail==='fluff'){fluff(F,FX,b);return}
  const side=F.view==='side',A=F.A,tip=A.tailTip;
  let root=side?A.tailBase:null;
  if(!side){
    // Nhìn thẳng không có tailBase: tìm đầu đuôi gần tâm thân nhất.
    let best=Infinity;
    FX.each(F,(i,x,y)=>{if(F.part[i]!==P.TAIL||F.role[i]===R.A)return;
      const d=(x-A.body[0])**2+(y-A.body[1])**2;
      if(d<best){best=d;root=[x,y]}
    });
  }
  FX.erase(F,i=>F.part[i]===P.TAIL);
  if(s.tail==='bob'&&root){
    const dx=tip[0]-root[0],dy=tip[1]-root[1],len=Math.hypot(dx,dy)||1;
    const tx=dx/len,ty=dy/len,sleep=F.anim==='sleep';
    const cx=Math.round(side?root[0]+tx*5:sleep?root[0]:root[0]+1);
    const cy=Math.min(72,Math.round(side?root[1]+ty*5:sleep?A.tail[1]-2:root[1]));
    const rest=K.baseFrame('std',side?'stand':'sit',0).A,ref=side?rest.tailBase:rest.tail;
    // Cục bông 7 ô, hơi xoay theo hướng đuôi đang dựng hoặc duỗi.
    for(let y=cy-4;y<=cy+4;y++)for(let x=cx-4;x<=cx+4;x++){
      const X=x-cx,Y=y-cy;
      if(X*X+Y*Y>14||y>75||x<2||x>=F.W-2)continue;
      const j=FX.idx(F,x,y);if(j<0||F.role[j])continue;
      const along=X*tx+Y*ty,across=-X*ty+Y*tx;
      const u=Math.round(ref[0]-1-across),v=Math.round(ref[1]-3-along);
      FX.put(F,x,y,Y>1?R.C:Y<-1?R.E:R.D,P.TAIL,FT.NONE,u,v);
    }
  }
  finish(F,FX,b);
}

K.trait('tail',{front:change,side:change});
})();
