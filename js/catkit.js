"use strict";
/* CatKit: dựng MỌI mèo trên khung hoạt ảnh của Xoài (js/sprites.js).
   Xem docs/cat-sprite-spec.md. Tóm tắt:
   - Khung (frame) F: lưới mịn 72x80 (nhìn thẳng) hoặc 100x80 (nhìn ngang, đầu quay PHẢI), mỗi ô có
     role (vai màu 1..13 = A..M của bảng màu Xoài), part (bộ phận), feat (chi tiết), u/v (toạ độ "nghỉ" để hoa văn bám theo thân).
   - Toạ độ kit = toạ độ sheet Xoài + (0,4) với khung nhìn thẳng, + (8,4) với khung nhìn ngang. Lông chạm đất ở hàng 75, viền dưới ở hàng 77.
   - Đi, chạy, nhảy dựng bằng bộ khớp (rig) từ khung đứng: cùng nhịp chân với Xoài cho mọi mèo.
   - Module ngoài đăng ký: CatKit.pattern(tên, fn), CatKit.trait(tên, def), CatKit.costume(id, def). */
const CatKit=(()=>{
const U=Art.U,{Buf,hex,mix,lt,lum}=U;
const X=SHEETS.xoai,RO='.ABCDEFGHIJKLM',H=80,OY=4,OXS=8,GROUND=71;
const P={NONE:0,HEAD:1,EAR:2,BODY:3,TAIL:4,LEG:5,NH:6,FH:7,NF:8,FF:9};
const FT={NONE:0,EYEL:1,EYER:2,NOSE:3,CHEEK:4,EARIN:5,MUZ:6,CHEST:7,PAW:8,TIP:9,MOUTH:10,RIM:11};
const R={A:1,B:2,C:3,D:4,E:5,F:6,G:7,H:8,I:9,J:10,K:11,L:12,M:13};
const isPink=r=>r>=8&&r<=10,isEyeR=r=>r>=11,isLight=r=>r>=5&&r<=7,isFur=r=>r>=2&&r<=7,isLeg=p=>p>=5;
const pyround=x=>{const f=Math.floor(x),d=x-f;return d>.5?f+1:d<.5?f:(f%2===0?f:f+1)}; // làm tròn kiểu Python để khung rig trùng từng ô với tools/xoai_rig.py
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));

/* ================= 1. Đọc khung gốc và gắn nhãn bộ phận (toạ độ sheet) ================= */
function raw(anim,i){const a=X.a[anim],W=a.w,f=a.f[i],N=W*H,role=new Uint8Array(N);for(let k=0;k<N;k++)role[k]=RO.indexOf(f[k]);return {W,role,part:new Uint8Array(N),feat:new Uint8Array(N),A:{}}}
function comps(g,ok){const {W}=g,N=W*H,seen=new Uint8Array(N),out=[];
  for(let s=0;s<N;s++){if(seen[s]||!ok(s))continue;const c=[s];seen[s]=1;
    for(let h=0;h<c.length;h++){const i=c[h],x=i%W,y=(i-x)/W;[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{const u=x+d[0],v=y+d[1];if(u<0||v<0||u>=W||v>=H)return;const j=v*W+u;if(!seen[j]&&ok(j)){seen[j]=1;c.push(j)}})}
    out.push(c)}
  return out}
function flood(g,seed,ok){const {W}=g,m=new Uint8Array(W*H);if(seed<0||!ok(seed))return m;const q=[seed];m[seed]=1;
  for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=(i-x)/W;[[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>{const u=x+d[0],v=y+d[1];if(u<0||v<0||u>=W||v>=H)return;const j=v*W+u;if(!m[j]&&ok(j)){m[j]=1;q.push(j)}})}
  return m}
// ô viền (role A) nhận bộ phận của ô lông gần nhất; đầu ưu tiên hơn chân, thân, đuôi
const PRI=[0,9,8,5,3,7,6,6,6,6];
function outlineParts(g){const {W,role,part}=g;
  for(let i=0;i<W*H;i++){if(role[i]!==1)continue;const x=i%W,y=(i-x)/W;let best=0,bd=99;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const u=x+dx,v=y+dy;if(u<0||v<0||u>=W||v>=H)continue;const j=v*W+u;if(role[j]<2)continue;const d=dx*dx+dy*dy;if(d<bd||(d===bd&&PRI[part[j]]>PRI[best])){bd=d;best=part[j]}}
    part[i]=best}}
const bbox=(g,ok)=>{const {W}=g;let x0=999,y0=999,x1=-1,y1=-1,n=0;for(let i=0;i<W*H;i++)if(ok(i)){const x=i%W,y=(i-x)/W;if(x<x0)x0=x;if(x>x1)x1=x;if(y<y0)y0=y;if(y>y1)y1=y;n++}return {x0,y0,x1,y1,n,cx:(x0+x1)/2,cy:(y0+y1)/2}};
/* Nét miệng và viền mắt của Xoài được vẽ bằng các ô lông tối (B, C, D) nằm lọt trong vùng mõm sáng hoặc sát con mắt.
   Trên lông sáng màu các ô này sẽ chìm mất, nên gắn nhãn riêng (MOUTH, RIM) để lõi tô bằng màu nét thay vì màu lông. */
function faceLines(g,nose){const {W,role,part,feat}=g,rx={},cy={};
  for(let i=0;i<W*H;i++)if(feat[i]===FT.MUZ){const x=i%W,y=(i-x)/W;(rx[y]=rx[y]||[x,x]);if(x<rx[y][0])rx[y][0]=x;if(x>rx[y][1])rx[y][1]=x;(cy[x]=cy[x]||[y,y]);if(y<cy[x][0])cy[x][0]=y;if(y>cy[x][1])cy[x][1]=y}
  for(let i=0;i<W*H;i++){const r=role[i];if(feat[i]||part[i]!==P.HEAD||r<2||r>4)continue;const x=i%W,y=(i-x)/W;
    if(rx[y]&&cy[x]&&x>rx[y][0]&&x<rx[y][1]&&y>cy[x][0]&&y<cy[x][1]&&Math.abs(x-nose[0])<=9&&y>=nose[1]-1&&y<=nose[1]+10){feat[i]=FT.MOUTH;continue}
    if(r===4)continue;
    let near=false;for(let dy=-1;dy<=1&&!near;dy++)for(let dx=-1;dx<=1;dx++){const u=x+dx,v=y+dy;if(u<0||v<0||u>=W||v>=H)continue;const f=feat[v*W+u];if(f===FT.EYEL||f===FT.EYER){near=true;break}}
    if(near)feat[i]=FT.RIM}}
// chi tiết trên đầu khung nhìn thẳng: tai, mắt, mũi, má, mõm trắng
function headFront(g,cx,crownY,ny){const {W,role,part,feat,A}=g;
  for(let i=0;i<W*H;i++)if(part[i]===P.HEAD&&((i/W)|0)<crownY)part[i]=P.EAR;
  const tip=l=>{for(let y=0;y<crownY;y++){let s=0,n=0;for(let x=0;x<W;x++)if(part[y*W+x]===P.EAR&&(x<cx)===l){s+=x;n++}if(n)return [Math.round(s/n),y]}return [Math.round(cx+(l?-11:11)),crownY-7]};
  A.head=[Math.round(cx),Math.round((crownY+ny)/2)];A.crown=[Math.round(cx),crownY];A.earL=tip(true);A.earR=tip(false);A.chin=[Math.round(cx),ny];A.neck=[Math.round(cx),ny+1];
  const hd=i=>part[i]===P.HEAD||part[i]===P.EAR;
  [true,false].forEach(l=>{const b=bbox(g,i=>hd(i)&&isEyeR(role[i])&&((i%W)<cx)===l);
    if(b.n){for(let y=b.y0;y<=b.y1;y++)for(let x=b.x0;x<=b.x1;x++){const i=y*W+x;if(hd(i)&&(isEyeR(role[i])||isLight(role[i])||role[i]===R.B||role[i]===R.C))feat[i]=l?FT.EYEL:FT.EYER}A[l?'eyeL':'eyeR']=[Math.round(b.cx),Math.round(b.cy)]}
    else A[l?'eyeL':'eyeR']=[Math.round(cx+(l?-11:11)),crownY+16]});
  const ey=(A.eyeL[1]+A.eyeR[1])/2;let ns=0,nx=0,nyy=0;
  for(let i=0;i<W*H;i++){if(!hd(i)||feat[i])continue;const x=i%W,y=(i-x)/W,r=role[i];
    if(isPink(r)){if(y<=crownY+7&&Math.abs(x-cx)>=5)feat[i]=FT.EARIN;else if(Math.abs(x-cx)<=6){feat[i]=FT.NOSE;ns++;nx+=x;nyy+=y}else feat[i]=FT.CHEEK}
    else if(isLight(r)&&y>=ey+1&&part[i]===P.HEAD)feat[i]=FT.MUZ}
  A.nose=ns?[Math.round(nx/ns),Math.round(nyy/ns)]:[Math.round(cx),Math.round(ey+6)];
  faceLines(g,A.nose);
}
// tâm đầu ước lượng từ hai chóp tai (4 hàng trên cùng của vùng ok)
function earMid(g,ok){const {W}=g;let y0=-1;for(let i=0;i<W*H&&y0<0;i++)if(ok(i))y0=(i/W)|0;const xs=[];for(let y=y0;y<y0+4;y++)for(let x=0;x<W;x++)if(ok(y*W+x))xs.push(x);xs.sort((a,b)=>a-b);
  let gi=1,gap=0;for(let k=1;k<xs.length;k++)if(xs[k]-xs[k-1]>gap){gap=xs[k]-xs[k-1];gi=k}
  if(gap<6)return null;const m=a=>a.reduce((s,v)=>s+v,0)/a.length;return (m(xs.slice(0,gi))+m(xs.slice(gi)))/2}
const crownAt=(g,cx,ok)=>{const {W}=g,x=Math.round(cx);for(let y=0;y<H;y++)if(ok(y*W+x))return y;return 0};
function labelFront(g,ny){const {W,role,part,feat,A}=g,N=W*H,inr=i=>role[i]>1;
  const tail=new Uint8Array(N);comps(g,inr).forEach(c=>{let x1=0,y0=99;c.forEach(i=>{x1=Math.max(x1,i%W);y0=Math.min(y0,(i/W)|0)});if(x1<=28&&y0>=47)c.forEach(i=>tail[i]=1)});
  for(let i=0;i<N;i++)if(inr(i))part[i]=tail[i]?P.TAIL:((i/W)|0)<=ny?P.HEAD:P.BODY;
  outlineParts(g);
  const hb=bbox(g,i=>part[i]===P.HEAD&&((i/W)|0)>=ny-22&&((i/W)|0)<=ny-10),cx=earMid(g,i=>part[i]===P.HEAD)??hb.cx,crownY=crownAt(g,cx,i=>part[i]===P.HEAD);
  // chân trước giơ lên (liếm lông): mảng lông kín trong vùng đầu mà không nối với trán
  const hm=flood(g,(crownY+5)*W+Math.round(cx),i=>inr(i)&&part[i]===P.HEAD);
  comps(g,i=>inr(i)&&part[i]===P.HEAD&&!hm[i]).forEach(c=>{if(c.length>=18&&!c.some(i=>isEyeR(role[i]))){let t=99;c.forEach(i=>t=Math.min(t,(i/W)|0));c.forEach(i=>{part[i]=P.LEG;if(((i/W)|0)<=t+7)feat[i]=FT.PAW})}});
  outlineParts(g);
  headFront(g,cx,crownY,ny);
  const bb=bbox(g,i=>part[i]===P.BODY&&inr(i)),tb=bbox(g,i=>part[i]===P.TAIL&&inr(i));let ts=0,tx=0,ty=0;
  for(let i=0;i<N;i++){const y=(i/W)|0,r=role[i];
    if(part[i]===P.BODY&&r>1){if(y>=67)feat[i]=FT.PAW;else if(isLight(r))feat[i]=FT.CHEST}
    if(part[i]===P.TAIL&&isLight(r)){feat[i]=FT.TIP;ts++;tx+=i%W;ty+=y}}
  const bx=Math.round(bb.cx);
  Object.assign(A,{chest:[bx,bb.y0+7],body:[bx,Math.round(bb.cy)],pawL:[bx-6,GROUND],pawR:[bx+6,GROUND],tail:[Math.round(tb.cx),Math.round(tb.cy)],tailTip:ts?[Math.round(tx/ts),Math.round(ty/ts)]:[tb.x0,tb.y0]});
  g.ref={head:A.head,body:[bx,bb.y1],tail:A.tail};
}
function labelSleep(g){const {W,role,part,feat,A}=g,N=W*H,inr=i=>role[i]>1,any=i=>role[i]>0;
  const cx=earMid(g,any),crownY=crownAt(g,cx,any),hm=flood(g,(crownY+8)*W+Math.round(cx),i=>inr(i)&&((i/W)|0)<=66);
  for(let i=0;i<N;i++){if(!inr(i))continue;const x=i%W,y=(i-x)/W;
    part[i]=hm[i]?P.HEAD:y<=66?P.BODY:x<=cx-20?P.TAIL:(isLight(role[i])&&Math.abs(x-cx)<=9)?P.HEAD:P.LEG}
  outlineParts(g);headFront(g,cx,crownY,69);
  const bb=bbox(g,i=>part[i]===P.BODY&&inr(i)),tb=bbox(g,i=>part[i]===P.TAIL&&inr(i));let ts=0,tx=0,ty=0;
  for(let i=0;i<N;i++){if(part[i]===P.LEG&&inr(i))feat[i]=FT.PAW;if(part[i]===P.TAIL&&isLight(role[i])){feat[i]=FT.TIP;ts++;tx+=i%W;ty+=(i/W)|0}}
  Object.assign(A,{chest:[A.chin[0],A.chin[1]-2],body:[Math.round(bb.cx),Math.round(bb.cy)],pawL:[Math.round(cx-17),GROUND],pawR:[Math.round(cx+5),GROUND],tail:[Math.round(tb.cx),Math.round(tb.cy)],tailTip:ts?[Math.round(tx/ts),Math.round(ty/ts)]:[tb.x0,tb.y0]});
  g.ref={head:A.head,body:[Math.round(bb.cx),bb.y1+5],tail:A.tail};
}
// khung đứng nhìn ngang (đầu quay phải): cắt đầu, đuôi, thân, bốn chân theo đúng ranh giới mà tools/xoai_rig.py dùng
const sHead=(x,y)=>(y<=37&&x>=46)||(y>=38&&y<=44&&x>=48)||(y>=45&&y<=48&&x>=55);
const sTail=(x,y)=>x<=(y<=43?27:y===44?26:y<=46?24:-1);
function labelStand(g){const {W,role,part,feat,A}=g,N=W*H;
  for(let i=0;i<N;i++){const r=role[i];if(!r)continue;const x=i%W,y=(i-x)/W;
    if(sHead(x,y))part[i]=y<=15?P.EAR:P.HEAD;
    else if(sTail(x,y))part[i]=P.TAIL;
    else if(r<2)continue;
    else if(y<=61)part[i]=P.BODY;
    else if(x<45)part[i]=(y>=63&&(x>=34||(x>=32&&y>=66&&r===R.B)))?P.FH:P.NH;
    else part[i]=(x<=57||(y===70&&x===58))?P.NF:P.FF}
  // viền của đầu và đuôi đã có nhãn; viền còn lại nhận theo ô lông gần nhất
  for(let i=0;i<N;i++){if(role[i]!==1||part[i])continue;const x=i%W,y=(i-x)/W;let best=0,bd=99;
    for(let dy=-3;dy<=3;dy++)for(let dx=-3;dx<=3;dx++){const u=x+dx,v=y+dy;if(u<0||v<0||u>=W||v>=H)continue;const j=v*W+u;if(role[j]<2||part[j]===P.HEAD||part[j]===P.EAR||part[j]===P.TAIL)continue;const d=dx*dx+dy*dy;if(d<bd){bd=d;best=part[j]}}
    part[i]=best||P.BODY}
  const eb=bbox(g,i=>(part[i]===P.HEAD)&&isEyeR(role[i]));
  for(let i=0;i<N;i++){const r=role[i],p=part[i],x=i%W,y=(i-x)/W;if(r<2)continue;
    if(p===P.HEAD||p===P.EAR){
      if(x>=eb.x0&&x<=eb.x1&&y>=eb.y0&&y<=eb.y1&&(isEyeR(r)||isLight(r)||r===R.B||r===R.C))feat[i]=FT.EYEL;
      else if(isPink(r))feat[i]=y<=25?FT.EARIN:x>=82?FT.NOSE:FT.CHEEK;
      else if(isLight(r)&&y>=29&&p===P.HEAD)feat[i]=FT.MUZ}
    else if(p===P.BODY){if(isLight(r))feat[i]=FT.CHEST}
    else if(p===P.TAIL){if(isLight(r))feat[i]=FT.TIP}
    else if(y>=69)feat[i]=FT.PAW}
  Object.assign(A,{head:[68,31],crown:[66,16],earN:[73,8],earF:[57,11],eye:[Math.round(eb.cx),Math.round(eb.cy)],nose:[85,31],chin:[73,47],cheek:[69,34],
    neck:[50,41],throat:[60,48],chest:[65,53],back:[44,40],hip:[25,42],belly:[44,61],tailBase:[27,46],tailTip:[18,21],footNH:[28,GROUND],footFH:[34,GROUND],footNF:[54,GROUND],footFF:[61,GROUND]});
  faceLines(g,A.nose);
}

/* ================= 2. Bộ khớp (rig): bản JS của tools/xoai_rig.py, giữ nhãn và toạ độ nghỉ của từng ô ================= */
const KX=40,KW=200,key=(x,y)=>(y+KX)*KW+x+KX,kxy=k=>[k%KW-KX,((k/KW)|0)-KX];
const TX0=22,TX1=66,TCX=44,HIP={nh:[28,60],fh:[35,60],nf:[53,60],ff:[59,60]},LEGW={nh:8,fh:5,nf:7,ff:5},LEGP={nh:P.NH,fh:P.FH,nf:P.NF,ff:P.FF};
const RING=[];for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)if(Math.abs(dx)+Math.abs(dy)<=3&&(dx||dy))RING.push([dx,dy]);
let ST0=null,HEADP,TAILP,TORSOP,TCEN;
function rigParts(){ if(ST0)return;
  ST0=raw('stand',0);labelStand(ST0);const {W,role,part,feat}=ST0;HEADP=new Map();TAILP=new Map();TORSOP=new Map();TCEN={};const acc={};
  for(let i=0;i<W*H;i++){const r=role[i];if(!r)continue;const x=i%W,y=(i-x)/W,e={r,p:part[i],f:feat[i],u:x,v:y};
    if(sHead(x,y))HEADP.set(key(x,y),e);
    else if(sTail(x,y)){TAILP.set(key(x,y),e);if(r>1){(acc[y]=acc[y]||[]).push(x)}}
    else if(y>=38&&y<=61&&r>1)TORSOP.set(key(x,y),e)}
  for(const y in acc)TCEN[y]=acc[y].reduce((a,b)=>a+b,0)/acc[y].length;
  HEADP.forEach((e,k)=>{const [x,y]=kxy(k);if(y>=39&&y<=48&&x<=62)TORSOP.set(k,{r:R.D,p:P.BODY,f:0,u:x,v:y})}); // phần thân bị đầu che: tô lông để khi đầu nhích đi không hở
}
const tshift=(t,p)=>(p.dy||0)+(p.dyr||0)*(1-t)+(p.dyf||0)*t-(p.arch||0)*4*t*(1-t);
const tmap=(x,y,p)=>{const t=clamp((x-TX0)/(TX1-TX0),0,1);return [TCX+(x-TCX)*(p.sx??1)+(p.dx||0),y+tshift(t,p)]};
class Cv{ // vải vẽ của rig, toạ độ sheet (có thể âm)
  constructor(){this.m=new Map()}
  fill(pix,kind,over,rp){
    pix.forEach((e,k)=>{const [x,y]=kxy(k);RING.forEach(d=>{const kk=key(x+d[0],y+d[1]);if(pix.has(kk))return;const o=this.m.get(kk);if(!o||o.k===9||over.includes(o.k))this.m.set(kk,{r:1,k:9,p:rp,f:0,u:x+d[0],v:y+d[1]})})});
    pix.forEach((e,k)=>this.m.set(k,Object.assign({k:kind},e)))}
  paste(pix,kind,dx,dy){pix.forEach((e,k)=>{const [x,y]=kxy(k);this.m.set(key(x+dx,y+dy),Object.assign({k:kind},e))})}
}
function legPix(nm,hip,fx,lift){
  const near=nm[0]==='n',w=LEGW[nm],[main,edge,toe]=near?[R.D,R.C,R.E]:[R.C,R.B,R.D],hx=hip[0],hy=hip[1],fy=GROUND-lift;
  const r0=w/2+(nm[1]==='h'?1:.3),r1=w/2-.6,fy2=fy-r1+.5,pix=new Map(),dx=fx-hx,dy=fy2-hy,L=dx*dx+dy*dy||1,p=LEGP[nm],H0=HIP[nm];
  for(let y=Math.trunc(Math.min(hy,fy2)-6);y<Math.trunc(fy)+1;y++)for(let x=Math.trunc(Math.min(hx,fx)-8);x<Math.trunc(Math.max(hx,fx)+9);x++){
    const t=clamp(((x-hx)*dx+(y-hy)*dy)/L,0,1),r=r0+(r1-r0)*t,px=hx+dx*t,py=hy+dy*t;
    if(Math.hypot(x-px,y-py)<=r&&y<=fy)pix.set(key(x,y),{r:(x-px)<-r+1.2?edge:main,p,f:0,u:Math.round(H0[0]+x-px),v:Math.round(H0[1]+t*(GROUND-H0[1])+(y-py))})}
  const by=pyround(fy),k1=pyround(fx+r1);
  for(let k=pyround(fx-r1);k<k1+3;k++)for(let j=0;j<2;j++)pix.set(key(k,by-j),{r:main,p,f:FT.PAW,u:Math.round(H0[0]+k-fx),v:GROUND-j});
  [k1+2,k1+1].forEach(k=>pix.set(key(k,by),{r:toe,p,f:FT.PAW,u:Math.round(H0[0]+k-fx),v:GROUND}));
  pix.forEach(e=>{if(e.v>=GROUND-2)e.f=FT.PAW});
  return pix}
function tailPix(base,ang,wave,n,rad){n=n||22;rad=rad||3;
  const pix=new Map();let x=base[0],y=base[1],tip=[x,y];
  for(let i=0;i<n;i++){const a=(ang+wave*Math.sin(i/n*Math.PI*1.5))*Math.PI/180;x-=Math.cos(a);y-=Math.sin(a);
    const r=i>=n-4?R.G:(Math.floor(i/4)%2?R.B:R.D),lim=rad*rad+(i<n-6?0:-rad),v0=clamp(46-Math.round(i*24/n),22,46),ix=pyround(x),iy=pyround(y);
    for(let dx=-rad;dx<=rad;dx++)for(let dy=-rad;dy<=rad;dy++)if(dx*dx+dy*dy<=lim)pix.set(key(ix+dx,iy+dy),{r,p:P.TAIL,f:r===R.G?FT.TIP:0,u:Math.round((TCEN[v0]||20)+dy),v:v0});
    tip=[ix,iy]}
  pix.tip=tip;return pix}
/* p: tham số thân (sx, arch, dy, dyf, dyr, dx), đầu (hdx, hdy), đuôi (['orig',dx,dy] hoặc ['run',góc,sóng]), chân {tên:[lệch bàn chân so với hông, độ nhấc]} hoặc {tên:['abs',x,độ nhấc]}.
   sh: dáng thân {drop: hạ thân (chân ngắn), k: tỉ lệ sải chân}. Trả về khung ở toạ độ kit. */
function rigFrame(p,sh){rigParts();
  sh=sh||SHAPES.std;p=Object.assign({},p,{dy:(p.dy||0)+sh.drop});
  const cv=new Cv(),hips={},A={},sx=p.sx??1,feet={};
  for(const nm in HIP){const q=tmap(HIP[nm][0],HIP[nm][1],p);hips[nm]=q}
  const leg=nm=>{const s=p.legs[nm];let fx,lift;if(s[0]==='abs'){fx=HIP[nm][0]+(s[1]-HIP[nm][0])*sh.k;lift=s[2]}else{fx=hips[nm][0]+s[0]*sh.k;lift=s[1]*sh.kl}feet[nm]=[Math.round(fx),Math.round(GROUND-lift)];return legPix(nm,hips[nm],fx,lift)};
  cv.fill(leg('fh'),1,[],P.FH);cv.fill(leg('ff'),1,[],P.FF);
  const tl=p.tail||['orig',0,0];
  if(tl[0]==='orig'){const ty=tl[2]+pyround(tshift(0,p));cv.paste(TAILP,2,tl[1],ty);A.tailTip=[18+tl[1],21+ty]}
  else{const b=tmap(27,46,p),tp=tailPix(b,tl[1],tl[2]);cv.fill(tp,2,[1],P.TAIL);A.tailTip=tp.tip}
  const tor=new Map(),pdx=p.dx||0;
  for(let Y=30;Y<76;Y++)for(let Xx=-8;Xx<108;Xx++){const u=TCX+(Xx-pdx-TCX)/sx,t=clamp((u-TX0)/(TX1-TX0),0,1),v=Y-tshift(t,p),e=TORSOP.get(key(pyround(u),pyround(v)));if(e)tor.set(key(Xx,Y),e)}
  cv.fill(tor,3,[1,2],P.BODY);
  cv.fill(leg('nh'),4,[1],P.NH);cv.fill(leg('nf'),4,[1],P.NF);
  const hx=pyround((sx-1)*14+pdx+(p.hdx||0)),hy=pyround(tshift(1,p)+(p.hdy||0));
  cv.paste(HEADP,5,hx,hy);
  const F=mkF(100,p.anim,p.i,8,sh);
  cv.m.forEach((e,k)=>{const [x,y]=kxy(k),X2=x+OXS,Y2=y+OY;if(X2<0||Y2<0||X2>=100||Y2>=H)return;const i=Y2*100+X2;F.role[i]=e.r;F.part[i]=e.p;F.feat[i]=e.f;F.u[i]=e.u+OXS;F.v[i]=e.v+OY});
  const SA=ST0.A,sft=(q,dx,dy)=>[Math.round(q[0]+dx)+OXS,Math.round(q[1]+dy)+OY];
  ['head','crown','earN','earF','eye','nose','chin','cheek'].forEach(n=>F.A[n]=sft(SA[n],hx,hy));
  ['neck','throat','chest','back','hip','belly','tailBase'].forEach(n=>{const q=tmap(SA[n][0],SA[n][1],p);F.A[n]=sft(q,0,0)});
  F.A.tailTip=sft(A.tailTip,0,0);
  F.A.footNH=sft(feet.nh,0,0);F.A.footFH=sft(feet.fh,0,0);F.A.footNF=sft(feet.nf,0,0);F.A.footFF=sft(feet.ff,0,0);
  return F}
// ĐI: 8 khung, bốn nhịp. Thứ tự chạm đất: sau xa (trái) -> trước xa (trái) -> sau gần (phải) -> trước gần (phải)
const WPOSE=[[5,0],[2.5,0],[0,0],[-2.5,0],[-5,0],[-4,2],[0,4],[4,1.5]],WOFF={fh:0,ff:2,nh:4,nf:6};
function walkP(f){const legs={};for(const nm in WOFF)legs[nm]=WPOSE[((f-WOFF[nm])%8+8)%8];
  const hip=(f===1||f===5)?1:0,shd=(f===3||f===7)?1:0,sway=pyround(Math.sin((f-2)/8*2*Math.PI)*1.2);
  return {dyr:hip,dyf:shd,hdy:-shd,tail:['orig',sway,-hip],legs}}
// CHẠY: 8 khung phi nước đại xoay vòng, mỗi khung mèo tiến 4,75 ô
const V=4.75,g=x=>['g',x];
const RUN=[
 {sx:.90,arch:3,dy:0,tail:[8,10],legs:{fh:g(36),nh:g(37),ff:[0,6],nf:[-2,5]}},
 {sx:.97,arch:1.5,dy:0,tail:[4,6],legs:{fh:[-7,2],nh:g(37-V),ff:[6,5],nf:[4,4]}},
 {sx:1.10,arch:-1,dy:-3,tail:[0,-4],legs:{fh:[-9,4],nh:[-11,3],ff:[9,4],nf:[11,3]}},
 {sx:1.06,arch:0,dy:-1,dyf:1,tail:[-3,-8],legs:{fh:[-7,5],nh:[-9,4],ff:g(68),nf:[9,2]}},
 {sx:1.0,arch:1,dy:0,dyf:1,tail:[0,-4],legs:{fh:[-2,5],nh:[-4,5],ff:[-3,1.5],nf:g(62)}},
 {sx:.93,arch:2,dy:0,tail:[4,4],legs:{fh:[2,5],nh:[0,5],ff:[-5,5],nf:g(62-V)}},
 {sx:.86,arch:4,dy:-2,tail:[8,10],legs:{fh:[5,5],nh:[3,5],ff:[-1,6],nf:[-3,6]}},
 {sx:.88,arch:3.5,dy:-1,tail:[10,12],legs:{fh:[6,1],nh:[5,3],ff:[0,6],nf:[-2,6]}}];
function runP(f){const q=RUN[f],p=Object.assign({},q,{tail:['run',q.tail[0],q.tail[1]]});p.hdy=-(q.dyf||0)*.5+((q.dy||0)<-2?1:0);
  p.legs={};for(const nm in q.legs){const s=q.legs[nm];p.legs[nm]=s[0]==='g'?['abs',s[1],0]:s}return p}
// NHẢY: lấy đà (2), bật lên, trên không (2), chuẩn bị đáp, tiếp đất, đứng lại
const JUMP=[
 {sx:1.04,arch:1,dy:2,dyf:1,dyr:-1,tail:[20,6],legs:{fh:[1,0],nh:[1,0],ff:[2,0],nf:[2,0]}},
 {sx:1.05,arch:1,dy:3,dyf:1,dyr:-2,dx:-1,tail:[26,8],legs:{fh:[2,0],nh:[2,0],ff:[3,0],nf:[3,0]}},
 {sx:1.09,arch:-.5,dy:-2,dyf:-3,dyr:1,tail:[-12,-4],legs:{fh:[-5,0],nh:[-6,0],ff:[4,5],nf:[5,4]}},
 {sx:1.10,arch:-1,dy:-2,dyf:-2,tail:[-6,-6],legs:{fh:[-9,3],nh:[-10,3],ff:[8,4],nf:[10,3]}},
 {sx:1.07,arch:0,dy:-2,tail:[2,-4],legs:{fh:[-8,4],nh:[-9,4],ff:[8,3],nf:[9,3]}},
 {sx:1.0,arch:1,dy:-1,dyf:2,dyr:-1,tail:[14,6],legs:{fh:[-4,5],nh:[-5,5],ff:[6,1],nf:[7,1]}},
 {sx:.95,arch:2,dy:1,dyf:2,dyr:-1,tail:[22,8],legs:{fh:[2,3],nh:[1,3],ff:[3,0],nf:[4,0]}},
 {sx:1.03,arch:.5,dy:1,tail:[16,6],legs:{fh:[0,0],nh:[0,0],ff:[1,0],nf:[1,0]}}];
function jumpP(f){const q=JUMP[f],p=Object.assign({},q,{tail:['run',q.tail[0],q.tail[1]]});p.hdy=-(q.dyf||0)*.4;return p}
const STANDP={tail:['orig',0,0],legs:{fh:[0,0],nh:[0,0],ff:[1,0],nf:[1,0]}};
// dáng thân: std = Xoài; short = giống chân ngắn (thân hạ 5 ô, sải chân ngắn hơn nên một vòng đi được 6 ô lưới gốc, chạy 13 ô)
const SHAPES={std:{id:'std',drop:0,k:1,kl:1,stride:{walk:10,run:19}},short:{id:'short',drop:5,k:.6,kl:.6,kr:13/19,stride:{walk:6,run:13}}};

/* ================= 3. Khung chuẩn (đã gắn nhãn, toạ độ kit), có đệm ================= */
const NF={sit:4,sleep:4,groom:6,stand:1,walk:8,run:8,jump:8};
function mkF(W,anim,i,n,sh){const N=W*H;return {anim,i,n,W,H,view:W===100?'side':'front',shape:sh?sh.id:'std',role:new Uint8Array(N),part:new Uint8Array(N),feat:new Uint8Array(N),u:new Int16Array(N),v:new Int16Array(N),A:{}}}
let REF0=null;
function handFrame(anim,i){
  const g=raw(anim,i),side=g.W===100;
  if(side)labelStand(g);else if(anim==='sleep')labelSleep(g);else labelFront(g,51);
  if(!side&&!REF0){if(anim==='sit'&&i===0)REF0=g.ref;else{const r=raw('sit',0);labelFront(r,51);REF0=r.ref}}
  const W=g.W,F=mkF(W,anim,i,NF[anim]),ox=side?OXS:0;
  for(let k=0;k<W*H;k++){const r=g.role[k];if(!r)continue;const x=k%W,y=(k-x)/W,X2=x+ox,Y2=y+OY;if(X2>=W||Y2>=H)continue;const j=Y2*W+X2,p=g.part[k];
    F.role[j]=r;F.part[j]=p;F.feat[j]=g.feat[k];
    let du=0,dv=0;
    if(!side){const a=(p===P.HEAD||p===P.EAR)?'head':p===P.TAIL?'tail':'body';du=REF0[a][0]-g.ref[a][0];dv=REF0[a][1]-g.ref[a][1]}
    F.u[j]=X2+du;F.v[j]=Y2+dv}
  for(const n in g.A)F.A[n]=[g.A[n][0]+ox,g.A[n][1]+OY];
  return F}
const BASEC={};
function baseFrame(shape,anim,i){
  const id=shape+'|'+anim+'|'+i;if(BASEC[id])return BASEC[id];
  const sh=SHAPES[shape];let F;
  if(anim==='walk')F=rigFrame(Object.assign(walkP(i),{anim,i}),sh);
  else if(anim==='run'){const p=runP(i);F=rigFrame(Object.assign(p,{anim,i}),Object.assign({},sh,{k:sh.kr||sh.k}))}
  else if(anim==='jump')F=rigFrame(Object.assign(jumpP(i),{anim,i}),sh);
  else if(anim==='stand'&&shape!=='std'){F=rigFrame(Object.assign({},STANDP,{anim,i:0}),sh);F.n=1}
  else F=handFrame(anim,i);
  return BASEC[id]=F}
const cloneF=F=>Object.assign({},F,{role:F.role.slice(),part:F.part.slice(),feat:F.feat.slice(),u:F.u.slice(),v:F.v.slice(),A:JSON.parse(JSON.stringify(F.A))});
// tư thế trong game -> [hoạt ảnh, số khung]
function poseFrame(pose){
  let m;
  if(pose==='sit'||!pose)return ['sit',0]; if(pose==='sitb')return ['sit',2]; if(pose==='sitt')return ['sit',3];
  if(m=/^sleep(\d)$/.exec(pose))return ['sleep',+m[1]*2%4];
  if(m=/^groom(\d)$/.exec(pose))return ['groom',1+ +m[1]%4];
  if(pose==='stand')return ['stand',0];
  if(m=/^(sit|walk|run|groom|sleep|jump)(\d+)s$/.exec(pose))return [m[1],+m[2]%NF[m[1]]]; // gọi thẳng số khung của bộ sprite
  if(m=/^walk(\d+)$/.exec(pose))return ['walk',Math.floor(+m[1]*8/12)%8];
  if(m=/^run(\d)$/.exec(pose))return ['run',+m[1]%8];
  // nhảy 8 khung: 0-1 lấy đà, 2 bật lên, 3-4 trên không, 5 chuẩn bị đáp, 6 tiếp đất, 7 đứng lại
  if(m=/^crouch(\d)$/.exec(pose))return ['jump',+m[1]%2];
  if(m=/^leap(\d)$/.exec(pose))return ['jump',2+ +m[1]%4];
  if(pose==='land0')return ['jump',6]; if(pose==='land1')return ['jump',7];
  return null;
}

/* ================= 4. Tiện ích sửa khung cho trait/costume (trước khi tô màu) ================= */
const FX={
  idx:(F,x,y)=>x>=0&&y>=0&&x<F.W&&y<F.H?y*F.W+x:-1,
  put(F,x,y,role,part,feat,u,v){const i=FX.idx(F,x,y);if(i<0)return;F.role[i]=role;F.part[i]=part||0;F.feat[i]=feat||0;F.u[i]=u??x;F.v[i]=v??y},
  erase(F,test){for(let i=0;i<F.W*F.H;i++)if(F.role[i]&&test(i,i%F.W,(i/F.W)|0)){F.role[i]=0;F.part[i]=0;F.feat[i]=0}},
  each(F,f){for(let i=0;i<F.W*F.H;i++)if(F.role[i])f(i,i%F.W,(i/F.W)|0)},
  // thêm viền (role A) dày 2 ô quanh các ô lông đang giáp ô trống; test chọn ô lông cần viền (mặc định mọi ô)
  seal(F,test){const W=F.W,add=[];for(let i=0;i<W*H;i++){if(F.role[i]<2||(test&&!test(i,i%W,(i/W)|0)))continue;const x=i%W,y=(i-x)/W;RING.forEach(d=>{const u=x+d[0],v=y+d[1];if(u<0||v<0||u>=W||v>=H)return;const j=v*W+u;if(!F.role[j])add.push([j,F.part[i]])})}
    add.forEach(a=>{F.role[a[0]]=1;F.part[a[0]]=a[1];F.feat[a[0]]=0;F.u[a[0]]=a[0]%W;F.v[a[0]]=(a[0]/W)|0})},
  // xoá viền mồ côi (ô viền không còn ô lông nào trong bán kính 2)
  prune(F){const W=F.W;for(let i=0;i<W*H;i++){if(F.role[i]!==1)continue;const x=i%W,y=(i-x)/W;let ok=false;for(let dy=-2;dy<=2&&!ok;dy++)for(let dx=-2;dx<=2;dx++){const u=x+dx,v=y+dy;if(u>=0&&v>=0&&u<W&&v<H&&F.role[v*W+u]>1){ok=true;break}}if(!ok){F.role[i]=0;F.part[i]=0}}},
};

/* ================= 5. Tô màu ================= */
const WHITE=[253,250,244],NATIVE={};for(const k in X.pal)if(X.pal[k])NATIVE[RO.indexOf(k)]=hex(X.pal[k]);
const isNative=s=>s.c==='#9aa3b5'&&s.c2==='#646c80';
// đậm/nhạt theo bậc: -2,-1 tối dần (ngả lạnh), +1..+3 sáng dần
function shade(c,lv){if(!lv)return c;if(lv<0){const t=lv<=-2?.5:.26;return mix(c,[c[0]*.5,c[1]*.47,c[2]*.58],t)}return lt(c,lv>=3?.72:lv===2?.45:.24)}
const outlineOf=c=>lum(c)<90?[40,34,46]:c[2]>c[0]+6?[48,48,63]:U.OC;
const PAT={},TRAIT={},COS={};
// ô lông thuộc "vằn gốc" của Xoài: màu tối B/C nằm sâu trong thân hoặc trên trán. Giống không vằn sẽ tô phẳng các ô này.
function markMap(F){if(F.mark)return F.mark;const W=F.W,m=new Uint8Array(W*H),A=F.A,side=F.view==='side';
  for(let i=0;i<W*H;i++){const r=F.role[i];if(r!==2&&r!==3)continue;const x=i%W,y=(i-x)/W,p=F.part[i];
    if(isLeg(p)&&side)continue;
    let edge=false;for(let dy=-2;dy<=2&&!edge;dy++)for(let dx=-2;dx<=2;dx++){const u=x+dx,v=y+dy;if(u<0||v<0||u>=W||v>=H||!F.role[v*W+u]){edge=true;break}}
    const u0=F.u[i],v0=F.v[i];
    const brow=(p===P.HEAD||p===P.EAR)&&(side?(v0<=A0s.eye[1]-2&&u0>=A0s.crown[0]-9&&u0<=A0s.crown[0]+12):(Math.abs(u0-A0f.head[0])<=9&&v0<A0f.eyeL[1]-2));
    if(brow||!edge)m[i]=1}
  return F.mark=m}
let A0f=null,A0s=null;
function refs(){if(!A0f){A0f=baseFrame('std','sit',0).A;A0s=baseFrame('std','stand',0).A}}
// hoa văn dựng sẵn. fn(ctx) trả màu nền [r,g,b] cho ô lông; ctx.lv là bậc đậm nhạt sẽ áp sau đó (đổi được), ctx.zone=false để bỏ luật vùng trắng/nhạt.
PAT.solid=ctx=>{if(ctx.mark)ctx.lv=0;return ctx.c};
PAT.tabby=ctx=>{const r=ctx.role;if(r===R.B){ctx.lv=0;return ctx.c2}if(r===R.C){ctx.lv=0;return mix(ctx.c,ctx.c2,.4)}return ctx.c};
PAT.tiger=PAT.tabby;
function painter(s,F,hooks){
  refs();
  const c=hex(s.c),c2=hex(s.c2||s.c),c3=hex(s.c3||s.c2||s.c),w=s.w||0,nat=isNative(s)&&(!s.pat||s.pat==='tabby')&&!hooks.length;
  const e1=hex(s.eye||'#6fcf5f'),e2=hex(s.eye2||s.eye||'#6fcf5f'),soft=lum(c)>100?.38:.12,oc=nat?NATIVE[1]:outlineOf(c),pat=PAT[s.pat||'solid']||PAT.solid,mark=markMap(F),side=F.view==='side';
  const ctx={s,F,P,FT,R,c,c2,c3,white:WHITE,oc,view:F.view,side,x:0,y:0,i:0,role:0,part:0,feat:0,u:0,v:0,lv:0,mark:0,zone:true,kind:'',A0:side?A0s:A0f};
  const LV=[0,0,-2,-1,0,1,2,3];
  return i=>{
    const r=F.role[i];ctx.i=i;ctx.x=i%F.W;ctx.y=(i/F.W)|0;ctx.role=r;ctx.part=F.part[i];ctx.feat=F.feat[i];ctx.u=F.u[i];ctx.v=F.v[i];ctx.mark=mark[i];ctx.zone=true;
    ctx.kind=r===1?'line':isEyeR(r)||ctx.feat===FT.EYEL||ctx.feat===FT.EYER?'eye':isPink(r)?'pink':'fur';ctx.lv=ctx.kind==='fur'?LV[r]:0;
    if(nat)return NATIVE[r];
    let o;for(let k=0;k<hooks.length&&!o;k++)o=hooks[k](ctx);
    if(ctx.kind!=='fur'){
      if(o)return o;
      if(r===1)return oc;
      if(ctx.kind==='pink')return NATIVE[r];
      const e=ctx.feat===FT.EYER?e2:e1;return r===R.K?mix(e,[20,30,30],.75):r===R.L?e:r===R.M?lt(e,.6):r===R.B?mix(e,[20,30,30],.62):r===R.C?mix(e,[20,30,30],.42):WHITE}
    if(o)return shade(o,ctx.lv);
    let b=pat(ctx)||c;
    // nét miệng và viền mắt: luôn sẫm hơn nền quanh nó một mức cố định, kể cả trên lông trắng
    if(ctx.zone&&(ctx.feat===FT.MOUTH||ctx.feat===FT.RIM)){const m=ctx.feat===FT.MOUTH?(w>=1?WHITE:lt(b,soft)):b;return mix(m,oc,ctx.feat===FT.RIM?(r===R.B?.5:.32):(r===R.B?.55:r===R.C?.45:.34))}
    if(ctx.zone){const f=ctx.feat,li=isLight(r),u=ctx.u,v=ctx.v,A=ctx.A0;
      const blaze=w>=2&&ctx.part===P.HEAD&&(side?(u>=A.eye[0]+3&&v>=A.eye[1]-4):(v>=A.eyeL[1]-4&&Math.abs(u-A.head[0])<=(v-A.eyeL[1]+5)*.75));
      if(blaze||((f===FT.MUZ||f===FT.CHEST)&&li&&w>=1)||(f===FT.PAW&&(w>=2||s.mit))){b=WHITE;if(li)ctx.lv-=2;else if(ctx.mark)ctx.lv=0}
      else if(li&&(f===FT.MUZ||f===FT.CHEST)){b=lt(b,soft);ctx.lv-=2}
      else if(li&&(f===FT.TIP||f===FT.PAW))ctx.lv-=2}
    return shade(b,ctx.lv)}}

/* ================= 6. Vải vẽ phụ kiện (sau khi tô màu) ================= */
class Layer{
  constructor(G){this.G=G;this.m=new Map()}
  set(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.G.W&&y<H&&c)this.m.set(y*this.G.W+x,c);return this}
  rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.set(x+i,y+j,c);return this}
  ell(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)this.set(x,y,typeof c==='function'?c(x,y):c);return this}
  line(x0,y0,x1,y1,c,th){th=th||1;const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2)),r=(th-1)/2;for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;if(th<=1)this.set(x,y,c);else for(let dy=-Math.ceil(r);dy<=Math.ceil(r);dy++)for(let dx=-Math.ceil(r);dx<=Math.ceil(r);dx++)if(dx*dx+dy*dy<=r*r+.3)this.set(x+dx,y+dy,c)}return this}
  poly(pts,c){let y0=1e9,y1=-1e9;pts.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const xs=[];for(let k=0;k<pts.length;k++){const a=pts[k],b=pts[(k+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))}xs.sort((p,q)=>p-q);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<=Math.round(xs[k+1]);x++)this.set(x,y,typeof c==='function'?c(x,y):c)}return this}
  /* dán lớp lên mèo. o.behind: chỉ vẽ vào ô trống (nằm sau mèo). o.outline: màu viền (mặc định màu viền của mèo, false = không viền).
     Viền dày 2 ô ở phía ô trống; chỗ đè lên mèo có viền 1 ô (o.edge=false để bỏ). o.clip(x,y): chỉ dán các ô thoả điều kiện. */
  stamp(o){o=o||{};const G=this.G,W=G.W,oc=o.outline===undefined?G.oc:o.outline,px=[];
    this.m.forEach((c,i)=>{const x=i%W,y=(i-x)/W;if(o.clip&&!o.clip(x,y))return;if(o.behind&&G.col[i])return;px.push(i)});
    const mine=new Set(px);
    if(oc)px.forEach(i=>{const x=i%W,y=(i-x)/W;RING.forEach(d=>{const u=x+d[0],v=y+d[1];if(u<0||v<0||u>=W||v>=H)return;const j=v*W+u;if(mine.has(j))return;
      if(!G.col[j]){G.col[j]=oc;G.own[j]=2}
      else if(!o.behind&&o.edge!==false&&Math.abs(d[0])+Math.abs(d[1])===1&&G.own[j]!==1){G.col[j]=oc;G.own[j]=2}})});
    px.forEach(i=>{G.col[i]=this.m.get(i);G.own[i]=1});
    return this}
}
class Canvas{
  constructor(F,s,col,oc){this.F=F;this.s=s;this.W=F.W;this.H=H;this.col=col;this.own=new Uint8Array(F.W*H);this.oc=oc;this.A=F.A;this.view=F.view;this.side=F.view==='side';this.fx=[]}
  layer(){return new Layer(this)}
  get(x,y){return x>=0&&y>=0&&x<this.W&&y<H?this.col[y*this.W+x]:null}
  set(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.W&&y<H)this.col[y*this.W+x]=c}
  // đổi màu các ô mèo đã tô: fn({x,y,i,part,feat,role,col}) trả màu mới hoặc undefined
  recolor(fn){const F=this.F,q={};for(let i=0;i<this.W*H;i++){if(!F.role[i]||this.own[i])continue;q.i=i;q.x=i%this.W;q.y=(i/this.W)|0;q.part=F.part[i];q.feat=F.feat[i];q.role=F.role[i];q.col=this.col[i];q.u=F.u[i];q.v=F.v[i];const c=fn(q);if(c)this.col[i]=c}}
  aura(c){this.fx.push(['aura',typeof c==='string'?hex(c):c])}
  spark(x,y,c){this.fx.push(['spark',x,y,c||[255,255,255]])}
  // mỏ neo của khung trước đó k bước trong cùng hoạt ảnh (để phụ kiện trễ nhịp theo thân)
  lag(k){const F=this.F,n=NF[F.anim];if(n<2)return F.A;const j=F.anim==='jump'?Math.max(0,F.i-k):(((F.i-k)%n)+n)%n;return baseFrame(F.shape,F.anim,j).A}
}

/* ================= 7. Lắp ráp ================= */
const TRAITS_OF=s=>{const t=[];if(s.ear)t.push('ear');if(s.tail)t.push('tail');if(s.fur)t.push('fur');if(s.flat)t.push('flat');if(s.closed)t.push('closed');if(s.gem)t.push('gem');if(s.hl||s.pat==='hairless')t.push('hairless');return t};
const cosKey=s=>(Array.isArray(s.cos)?s.cos.length:s.cos)?(s.bid||s.id):null;
// các module còn thiếu để dựng ngoại hình s (rỗng = sẵn sàng)
function missing(s){const m=[];if(s.pat&&!PAT[s.pat]&&s.pat!=='hairless')m.push('pattern:'+s.pat);TRAITS_OF(s).forEach(t=>{if(!TRAIT[t])m.push('trait:'+t)});const k=cosKey(s);if(k&&!COS[k])m.push('costume:'+k);return m}
const shapeOf=s=>s.short?'short':'std';
const opt={strict:true}; // strict: thiếu module thì trả null để game vẽ kiểu cũ; tắt đi khi xem trước từng phần
function frameOf(s,pose){const fr=poseFrame(pose);if(!fr)return null;
  if(s.closed){if(fr[0]==='sit')fr[1]=2;else if(fr[0]==='groom')fr[1]=[3,2,2,3,4,3][fr[1]]} // mèo luôn nhắm mắt: dùng các khung nhắm mắt có sẵn
  const F=cloneF(baseFrame(shapeOf(s),fr[0],fr[1]));F.pose=pose;
  TRAITS_OF(s).forEach(t=>{const d=TRAIT[t];if(d){const f=d[F.view]||d.shape;if(f)f(F,s,FX)}});
  const k=cosKey(s),cd=k&&COS[k];if(cd&&cd.shape)cd.shape(F,s,FX);
  return F}
function render(s,pose){
  if(opt.strict&&missing(s).length)return null;
  const F=frameOf(s,pose);if(!F)return null;
  const W=F.W,k=cosKey(s),cd=k&&COS[k],hooks=[];
  if(cd&&cd.paint)hooks.push(c=>cd.paint(c,s));
  TRAITS_OF(s).forEach(t=>{const d=TRAIT[t];if(d&&d.paint)hooks.push(c=>d.paint(c,s))});
  const pf=painter(s,F,hooks),col=new Array(W*H).fill(null);
  for(let i=0;i<W*H;i++)if(F.role[i])col[i]=pf(i);
  const G=new Canvas(F,s,col,outlineOf(hex(s.c)));
  TRAITS_OF(s).forEach(t=>{const d=TRAIT[t];if(d&&d.draw)d.draw(G,s)});
  if(cd&&cd.draw)cd.draw(G,s);
  if(Array.isArray(s.cos)){const au=s.cos.find(q=>q[0]==='aura');if(au)G.aura(au[1])} // luồng khí của trang phục hiếm: lõi tự vẽ
  // ra Buf của game: khung nhìn ngang lật lại vì game quay mặt trái
  const b=new Buf(W/2,40),side=F.view==='side';
  for(let i=0;i<W*H;i++){const c=col[i];if(!c)continue;const x=i%W,y=(i-x)/W,j=y*W+(side?W-1-x:x);b.c[j]=c;b.r[j]=G.own[i]?'x':F.role[i]===1?'o':'body'}
  G.fx.forEach(f=>{if(f[0]==='aura')U.auraFx(b,f[1],side?F.i+1:0);else U.spark(b,(side?W-1-f[1]:f[1])/2,f[2]/2,f[3])});
  if(s.rare)(side?[[4,8],[30,16],[42,30]]:[[2,9],[33,6],[34,29],[1,31]]).forEach((p,i)=>U.spark(b,p[0]+.5,p[1]+.5,i%2?[255,236,150]:[255,255,255]));
  return b}
// thông số bước chân cho game (quãng đường mỗi vòng, số khung); null nếu ngoại hình này chưa dựng được bằng kit
function sheetOf(s){if(opt.strict&&missing(s).length)return null;return {stride:SHAPES[shapeOf(s)].stride,n:X.n}}

return {P,FT,R,U,FX,NF,H,GROUND:GROUND+OY,BASE:X.base+OY,shade,opt,bbox,outlineOf,WHITE,
  pattern:(n,f)=>{PAT[n]=f},trait:(n,d)=>{TRAIT[n]=d},costume:(id,d)=>{COS[id]=d},
  has:{pattern:n=>!!PAT[n],trait:n=>!!TRAIT[n],costume:n=>!!COS[n]},
  missing,render,sheetOf,poseFrame,baseFrame,frameOf,cloneF,rigFrame,shapeOf,isLeg,isFur,isLight,isPink};
})();
