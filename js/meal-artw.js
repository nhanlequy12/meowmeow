"use strict";
/* Mức nước nằm trong khoá canvas; ghép khung máy lọc bằng dấu |.
   Phòng gọi furnCv(it.fid, mealVarW(it)), không ghép thêm wxVar/pwVar.
   Ví dụ mw4:w_plain|a1; không có | là khung đứng yên. */
function mealVarW(it){
  if(it.broken)return 'broken';
  const r=Math.max(0,Math.min(1,fillRatio(it)||0));
  const n=r>0?Math.max(1,Math.round(r*8)):0;
  let frame='';
  if(it.fid==='waterfilter'&&n&&!it.off&&
    !(typeof pwDead==='function'&&pwDead(it))){
    // Ưu tiên luật điện; wxVar hiện trả full sớm cho mọi đồ có water.
    if(typeof pwVar==='function')frame=pwVar(it)==='a1'?'a1':'';
    else if(Math.floor(performance.now()/220+(Number(it.iid)||0))%2)frame='a1';
  }
  return 'mw'+n+':'+(mTop('w',it)||'w_plain')+(frame?'|'+frame:'');
}

(()=>{
  const {mix,lt,dk}=Art.K,white=[253,253,242],blue=[153,199,215];
  const drinks={
    w_plain:{c:[163,218,235],alpha:132},
    w_mineral:{c:[145,203,226],alpha:155,bubble:1},
    w_pure:{c:[94,217,209],alpha:170,star:1},
    w_electro:{c:[196,223,128],alpha:180},
    w_nutri:{c:[247,240,215],alpha:224},
    w_special:{c:[218,157,221],alpha:180,star:1}
  };
  const ids=['waterbowl','thermobottle','waterfilter'],old={};
  // FART kín trong Art: gọi hàm gốc qua Art.furn trước addFurn, giữ lớp vẽ
  // trước pastel/shade/outline để hình cũ không bị tô bóng và viền hai lần.
  // Ba hàm gốc chỉ phân biệt full, a1 và phần còn lại (kể cả broken).
  const pastel=Art.Buf.prototype.pastel;
  try{
    for(const id of ids){
      const cache={};
      for(const v of ['', 'full','a1']){
        Art.Buf.prototype.pastel=function(t){
          cache[v]={c:this.c.map(c=>c&&c.slice()),r:this.r.slice()};
          return pastel.call(this,t);
        };
        Art.furn(id,v);
      }
      old[id]=(b,v)=>{
        const s=cache[v==='full'||v==='a1'?v:''];
        b.c=s.c.map(c=>c&&c.slice());b.r=s.r.slice();
      };
    }
  }finally{Art.Buf.prototype.pastel=pastel}

  const seam=(b,x,y,X,Y,c)=>b.cap(x,y,X,Y,.22,c,'x');
  function glint(b,x,y,p,small){
    b.dot(x,y,white,'x');
    if(p.star&&!small){
      seam(b,x-.65,y,x+.65,y,white);seam(b,x,y-.65,x,y+.65,white);
    }
  }
  // Đáy men vẫn hiện xuyên lớp nước; chỉ nước sữa che gần hết đáy.
  function tray(b,x,y,rx,ry,n,p){
    const floor=[213,203,182];
    b.ell(x,y,rx,ry,[151,160,155],'x');
    b.ell(x,y+.25,rx-.65,Math.max(.2,ry-.35),floor,'x');
    seam(b,x-rx*.42,y+.25,x+rx*.42,y+.25,[184,174,153]);
    if(!n)return;
    const f=n/8,sy=y+.5-f,sx=rx*(.32+.63*f),sh=ry*(.27+.59*f);
    b.ell(x,sy,sx,sh,p.c.concat(p.alpha),'x');
    seam(b,x-sx*.6,sy-sh*.35,x-sx*.1,sy-sh*.6,lt(p.c,.75));
    seam(b,x+sx*.22,sy+sh*.5,x+sx*.62,sy+sh*.3,lt(p.c,.5));
    glint(b,x+sx*.58,sy-sh*.38,p,n<3);
    if(p.bubble){
      [[-.48,.25],[.05,-.2],[.32,.4]].forEach(([u,v])=>{
        const X=x+sx*u,Y=sy+sh*v;
        b.ell(X,Y,.28,.28,lt(p.c,.7),'x');b.dot(X,Y,dk(p.c,.08),'x');
      });
    }
    if(p.star&&n>=4)b.dot(x-sx*.65,sy+sh*.35,white,'x');
  }
  function reservoir(b,x,y,w,h,n,p){
    b.rect(x-.5,y-.5,w+1,h+1,white,'x');
    b.rect(x,y,w,h,[181,177,155],'x');
    b.rect(x+.5,y+.5,Math.max(.5,w-1),h-.5,[220,211,188],'x');
    if(n){
      const height=Math.max(.5,h*n/8),top=y+h-height;
      b.rect(x,top,w,height,p.c.concat(p.alpha),'x');
      b.rect(x,top,w,.5,lt(p.c,.65),'x');
      glint(b,x+w-.75,Math.min(y+h-.5,top+.75),p,true);
      if(p.bubble&&height>1.5)b.dot(x+.5,y+h-1,white,'x');
    }
    seam(b,x+.25,y+.5,x+.25,y+h-.5,[242,249,239]);
  }
  const defs={};
  ids.forEach(id=>{
    defs[id]=(b,v,a)=>{
      const m=typeof v==='string'&&/^mw([0-8]):([\w]+)(?:\|(a1))?$/.exec(v);
      if(!m){old[id](b,v,a);return}
      const n=Number(m[1]),p=drinks[m[2]]||drinks.w_plain,on=n>0&&m[3]==='a1';
      if(id==='waterbowl'){
        // Bát sứ nông màu xanh, gợn nước nhỏ thay cho hoạ tiết hạt thức ăn.
        b.ell(8,6,5.7,.35,dk(blue,.2));b.ell(8,4.8,6.4,1.6,blue);
        b.ell(8,3.2,6.5,1.7,[230,242,233],'x');
        tray(b,8,3.1,5.3,1.15,n,p);
        seam(b,3,5,4,5.5,lt(blue,.55));
        seam(b,7,5.6,8,5.85,white);seam(b,8,5.85,9,5.6,white);
      }else if(id==='thermobottle'){
        old[id](b,'',a);
        reservoir(b,4,8,3.5,4.5,n,p);
        // Nắp trước là khay uống nông; chân khay chung chân bình.
        b.ell(7.5,14.15,3.35,.6,dk(blue,.13));
        b.ell(7.5,13.5,3.4,1.05,blue);
        b.ell(7.5,13.05,3.15,.85,[230,242,233],'x');
        tray(b,7.5,13.05,2.5,.55,n,p);
      }else{
        old[id](b,on?'a1':'',a);
        reservoir(b,13.5,4.5,2,3,n,p);
        tray(b,10,11.5,7,1.1,n,p);
        if(on){
          b.cap(6,8.7,6,9.4,.35,mix(p.c,white,.22),'x');
          b.dot(5.5,10.5,lt(p.c,.65),'x');b.dot(6.5,10.5,lt(p.c,.65),'x');
        }
      }
    };
  });
  Art.addFurn(defs);
})();
