"use strict";
/* Chín mức đầy dùng chung với bộ nhớ đệm nội thất. Phần đang ăn vẫn còn trong bát. */
function mealVarF(it){
  if(it.broken)return 'broken';
  const r=fillRatio(it),n=Math.min(8,Math.max(r>0?1:0,Math.round(r*8)));
  return 'mf'+n+':'+(mTop('f',it)||'kibble');
}

(()=>{
  const ids=['bowl','bowlsteel','bowlclay','bowlgold','bowldouble','bowlraised','feeder'];
  const saved=new Map(),variants=['','full','broken','a1'];
  const signature=(key,w,h,a)=>key+'/'+w+'/'+h+'/'+a.join(',');
  /* FART không được Art xuất ra ngoài. Giữ nét gốc trước pastel/bóng/viền,
     rồi phát lại trong hàm mới; các biến thể cũ không bị xử lý màu hai lần. */
  const pastel=Art.Buf.prototype.pastel;
  let raw;
  Art.Buf.prototype.pastel=function(t){
    raw={c:this.c.slice(),r:this.r.slice()};
    return pastel.call(this,t);
  };
  try{
    for(const id of ids){
      const f=FURN[id],old={};
      for(const v of variants){
        const b=Art.furn(id,v);old[v]=raw;
        saved.set(signature(f.art||id,b.w,b.h,f.a||[]),old);
      }
    }
  }finally{Art.Buf.prototype.pastel=pastel}

  const palettes={
    kibble:[[164,102,58],[211,156,92],[119,75,49]],
    pate:[[184,117,112],[215,157,143],[151,94,91]],
    tuna:[[205,111,111],[244,171,161],[162,83,91]],
    salmon:[[237,143,82],[255,235,202],[194,103,66]],
    chicken:[[247,230,192],[255,249,228],[202,177,142]],
    churu:[[236,179,110],[255,224,166],[203,145,90]],
    catnip:[[100,160,82],[171,205,110],[67,118,69]],
    premium:[[193,118,93],[247,202,81],[104,155,95]]
  };
  /* Mỗi loại món có một vân riêng; mọi hạt đều được cắt theo mặt thức ăn. */
  function grain(id,u,v){
    const p=palettes[id],x=Math.floor(u),y=Math.floor(v);
    const cell=(Math.floor(u/2)+Math.floor(v/1.5)*3)%5;
    switch(id){
      case 'kibble':return ((x+2*y)%3===0)?p[2]:((x-y)%3===0?p[1]:p[0]);
      case 'pate':return ((x+2*y)%7===0)?p[1]:p[0];
      case 'tuna':return Math.floor((v+u*.42)*2)%4===0?p[1]:(cell===0?p[2]:p[0]);
      case 'salmon':return Math.floor((v+u*.65)*2)%5===0?p[1]:p[0];
      case 'chicken':return (Math.floor((u+v*.3)/2)+Math.floor(v*1.2))%3===0?p[2]:((x+y)%3?p[0]:p[1]);
      case 'churu':return Math.floor((v+Math.sin(u*.8)*.4)*2)%6===0?p[1]:p[0];
      case 'catnip':return Math.floor((u-v)*2)%4===0?p[2]:(cell%2?p[1]:p[0]);
      case 'premium':return cell===0?p[1]:cell===1?p[2]:cell===2?[238,188,148]:p[0];
    }
  }
  function food(b,cx,cy,r,n,id){
    if(!n)return;
    const t=n/8,mound=Math.max(0,(n-4)/4);
    const rx=r*(.34+.66*t),ry=.8+mound,my=cy+.1-mound;
    const p=palettes[id];
    /* Hai mức thấp để lộ đáy bát, chỉ còn vài hạt hoặc vài miếng. */
    if(n<=2){
      const points=n===1?[[-.9,.35],[.9,.1]]:[[-1.9,.35],[0,.15],[1.9,.3],[-.7,-.45],[1.1,-.5]];
      for(let i=0;i<points.length;i++){
        const [dx,dy]=points[i],x=cx+dx,y=cy+dy;
        if(id==='catnip'){
          b.cap(x-.45,y+.15,x+.45,y-.25,.3,p[i%2],'mf');
          b.dot(x,y,p[2],'mf');
        }else{
          b.ell(x,y,id==='churu'?.5:.45,.25,p[i%2],'mf');
          if(id==='salmon'||id==='tuna')b.dot(x,y,p[1],'mf');
        }
      }
      return;
    }
    for(let Y=Math.floor((my-ry)*b.q);Y<Math.ceil((my+ry+1)*b.q);Y++){
      for(let X=Math.floor((cx-rx)*b.q);X<Math.ceil((cx+rx+1)*b.q);X++){
        const u=(X+.5)/b.q-.5,v=(Y+.5)/b.q-.5;
        if(((u-cx)/rx)**2+((v-my)/ry)**2>1)continue;
        /* Hạt khô và lá có khe nhỏ; pate và súp là mặt mềm liền nhau. */
        if(id==='kibble'&&Math.floor(u*2)%5===0&&Math.floor(v*2)%3===0)continue;
        if(id==='catnip'&&(Math.floor(u*2)+Math.floor(v*2)*2)%7===0)continue;
        b.put(X,Y,grain(id,u-cx+12,v-cy+8),'mf');
      }
    }
  }
  const defs={};
  for(const key of ['bowl','bowldouble','bowlraised','feeder']){
    defs[key]=(b,v,a)=>{
      const old=saved.get(signature(key,b.w,b.h,a));
      const m=/^mf([0-8]):([a-z]+)$/.exec(v||'');
      const layer=old[m?'':Object.prototype.hasOwnProperty.call(old,v)?v:''];
      b.c=layer.c.slice();b.r=layer.r.slice();
      if(!m)return;
      const n=Number(m[1]),id=palettes[m[2]]?m[2]:'kibble';
      if(key==='bowldouble'){
        food(b,8,5,4.4,Math.min(8,n*2),id);
        food(b,22,5,4.4,Math.max(0,n*2-8),id);
      }else if(key==='bowlraised')food(b,10,5.6,5,n,id);
      else if(key==='feeder')food(b,10,21,6,n,id);
      else food(b,b.w/2,b.h-6.2,b.w/2-3,n,id);
    };
  }
  Art.addFurn(defs);
})();
