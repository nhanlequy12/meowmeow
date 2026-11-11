"use strict";
/* Bộ vẽ thuần JS theo style hạt cườm: ghép hình khối vào lưới, làm nhạt màu, đổ bóng nhẹ rồi viền nâu. */
const Art=(()=>{
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const H=c=>typeof c==='string'?hex(c):c;
const mix=(a,b,t)=>[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t));
const dk=(c,t)=>mix(c,[120,70,50],t), lt=(c,t)=>mix(c,[255,252,246],t);
const lum=c=>.3*c[0]+.59*c[1]+.11*c[2];
const OC=[78,48,38]; // viền đậm riêng cho mèo để tách khỏi nền
const OUT=[152,98,64],WH=[255,253,248],EY=[120,74,54],RED=[226,72,78],NAVY=[62,68,110],GOLDC=[248,206,90],PINK=[250,172,188];

const Q=2; // lưới mịn: mỗi ô của lưới gốc chia thành QxQ ô. Toạ độ vẽ vẫn theo lưới gốc, hình khối được tô ở lưới mịn nên cong tròn hơn
class Buf{
  constructor(w,h){this.w=w;this.h=h;this.q=Q;this.W=w*Q;this.H=h*Q;this.c=new Array(this.W*this.H).fill(null);this.r=new Array(this.W*this.H).fill(null);this.fX=-1}
  in(x,y){return x>=0&&y>=0&&x<this.w&&y<this.h}
  getF(X,Y){return X>=0&&Y>=0&&X<this.W&&Y<this.H?this.c[Y*this.W+X]:null}
  regF(X,Y){return X>=0&&Y>=0&&X<this.W&&Y<this.H?this.r[Y*this.W+X]:null}
  blk(a,x,y){x=Math.round(x)*Q;y=Math.round(y)*Q;for(let j=0;j<Q;j++)for(let i=0;i<Q;i++){const X=x+i,Y=y+j;if(X>=0&&Y>=0&&X<this.W&&Y<this.H){const v=a[Y*this.W+X];if(v)return v}}return null}
  get(x,y){return this.blk(this.c,x,y)}
  reg(x,y){return this.blk(this.r,x,y)}
  // tô 1 ô mịn; hàm màu nhận (cột gốc, hàng gốc, vùng, toạ độ thực u, v)
  put(X,Y,col,reg){
    if(X<0||Y<0||X>=this.W||Y>=this.H)return;
    if(typeof col==='function')col=col(X>>1,Y>>1,reg,(X+.5)/Q-.5,(Y+.5)/Q-.5); if(!col)return;
    const i=Y*this.W+X,o=this.c[i];
    if(col.length===4&&col[3]<255&&o){const a=col[3]/255;col=[0,1,2].map(k=>Math.round(o[k]+(col[k]-o[k])*a));if(o.length===4)col.push(o[3])}
    this.c[i]=col; if(reg!==undefined)this.r[i]=reg;
  }
  // tô 1 ô mịn theo toạ độ tâm (ô gốc x có 2 ô mịn tâm x-.25 và x+.25)
  dot(u,v,col,reg){this.put(Math.round(u*Q+.5),Math.round(v*Q+.5),col,reg)}
  set(x,y,col,reg){
    if(this.fX>=0&&x===this.fx&&y===this.fy){this.put(this.fX,this.fY,col,reg);return} // đang duyệt each(): chỉ đổi đúng ô mịn hiện tại
    const X=Math.round(x*Q),Y=Math.round(y*Q);
    for(let j=0;j<Q;j++)for(let i=0;i<Q;i++)this.put(X+i,Y+j,col,reg);
  }
  rect(x,y,w,h,col,reg){const X0=Math.round(x*Q),Y0=Math.round(y*Q),X1=Math.round((x+w)*Q),Y1=Math.round((y+h)*Q);for(let Y=Y0;Y<Y1;Y++)for(let X=X0;X<X1;X++)this.put(X,Y,col,reg)}
  ell(cx,cy,rx,ry,col,reg,clip){
    const RX=rx+.25,RY=ry+.25;
    for(let Y=Math.floor((cy-RY)*Q);Y<=Math.ceil((cy+RY)*Q)+1;Y++)for(let X=Math.floor((cx-RX)*Q);X<=Math.ceil((cx+RX)*Q)+1;X++){
      const u=(X+.5)/Q-.5,v=(Y+.5)/Q-.5;
      if(((u-cx)/RX)**2+((v-cy)/RY)**2<=1&&(!clip||clip(X>>1,Y>>1)))this.put(X,Y,col,reg);
    }
  }
  tri(ax,ay,bx,by,cx,cy,col,reg){
    const E=.25,sg=((bx-ax)*(cy-ay)-(cx-ax)*(by-ay))<0?-1:1,ed=[[ax,ay,bx,by],[bx,by,cx,cy],[cx,cy,ax,ay]].map(e=>[e[0],e[1],e[2]-e[0],e[3]-e[1],Math.hypot(e[2]-e[0],e[3]-e[1])||1]);
    const x0=Math.min(ax,bx,cx)-E,x1=Math.max(ax,bx,cx)+E,y0=Math.min(ay,by,cy)-E,y1=Math.max(ay,by,cy)+E;
    for(let Y=Math.floor(y0*Q);Y<=Math.ceil(y1*Q)+1;Y++)for(let X=Math.floor(x0*Q);X<=Math.ceil(x1*Q)+1;X++){
      const u=(X+.5)/Q-.5,v=(Y+.5)/Q-.5; if(u<x0-.25||u>x1+.25||v<y0-.25||v>y1+.25)continue;
      if(ed.every(e=>sg*(e[2]*(v-e[1])-e[3]*(u-e[0]))/e[4]>=-E))this.put(X,Y,col,reg);
    }
  }
  // đoạn thẳng bo tròn hai đầu, bán kính rad
  cap(x0,y0,x1,y1,rad,col,reg){
    const dx=x1-x0,dy=y1-y0,L=dx*dx+dy*dy;
    for(let Y=Math.floor((Math.min(y0,y1)-rad)*Q);Y<=Math.ceil((Math.max(y0,y1)+rad)*Q)+1;Y++)for(let X=Math.floor((Math.min(x0,x1)-rad)*Q);X<=Math.ceil((Math.max(x0,x1)+rad)*Q)+1;X++){
      const u=(X+.5)/Q-.5,v=(Y+.5)/Q-.5,t=L?Math.max(0,Math.min(1,((u-x0)*dx+(v-y0)*dy)/L)):0;
      if(Math.hypot(u-x0-dx*t,v-y0-dy*t)<=rad)this.put(X,Y,col,reg);
    }
  }
  line(x0,y0,x1,y1,col,reg){this.cap(x0,y0,x1,y1,.5,col,reg)}
  cutRows(y0,n){y0*=Q;n*=Q;for(let y=y0+n-1;y>=0;y--)for(let x=0;x<this.W;x++){const i=y*this.W+x,j=(y-n)*this.W+x;this.c[i]=y>=n?this.c[j]:null;this.r[i]=y>=n?this.r[j]:null}}
  pastel(t){this.c.forEach((c,i)=>{if(c&&c.length===3)this.c[i]=mix(c,[255,250,243],t)})}
  shade(t){
    for(let y=0;y<this.H;y++)for(let x=0;x<this.W;x++){
      const i=y*this.W+x,c=this.c[i]; if(!c||this.r[i]==='x'||c.length===4)continue;
      if(!this.getF(x,y+1)||!this.getF(x,y+2))this.c[i]=dk(c,t);
    }
  }
  // viền dày bằng 1 ô gốc (2 ô mịn), lượt hai lấy cả ô chéo cho góc tròn
  outline(col){
    for(let p=0;p<Q;p++){
      const add=[];
      for(let y=0;y<this.H;y++)for(let x=0;x<this.W;x++){
        if(this.c[y*this.W+x])continue;
        if(this.getF(x-1,y)||this.getF(x+1,y)||this.getF(x,y-1)||this.getF(x,y+1)||(p&&(this.getF(x-1,y-1)||this.getF(x+1,y-1)||this.getF(x-1,y+1)||this.getF(x+1,y+1))))add.push(y*this.W+x);
      }
      add.forEach(i=>{this.c[i]=col;this.r[i]='o'});
    }
  }
  rgba(){
    const d=new Uint8ClampedArray(this.W*this.H*4);
    this.c.forEach((c,i)=>{if(c){d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=c.length===4?c[3]:255}});
    return d;
  }
}

/* ---------- hoa văn lông ở lưới mịn: tính theo toạ độ thực (u,v) nên vằn cong, đốm tròn, mảng loang mềm ---------- */
const hsh=(i,j)=>{let n=(Math.imul(i,374761393)+Math.imul(j,668265263))|0;n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967296};
// nhiễu mượt: nội suy giữa các nút lưới ngẫu nhiên, sz = cỡ mảng tính theo ô gốc
const vnoise=(u,v,sz)=>{const x=u/sz,y=v/sz,i=Math.floor(x),j=Math.floor(y),fx=x-i,fy=y-j,a=fx*fx*(3-2*fx),b=fy*fy*(3-2*fy);
  return (hsh(i,j)*(1-a)+hsh(i+1,j)*a)*(1-b)+(hsh(i,j+1)*(1-a)+hsh(i+1,j+1)*a)*b};
// đốm tròn: mỗi ô lưới 3,4 x 3,4 có thể có một đốm, tâm và cỡ lệch ngẫu nhiên
const spotAt=(u,v)=>{const sz=3.4,i0=Math.floor(u/sz),j0=Math.floor(v/sz);
  for(let j=j0-1;j<=j0+1;j++)for(let i=i0-1;i<=i0+1;i++){if(hsh(i+7,j+3)>.64)continue;
    const cx=(i+.5+(hsh(i,j+11)-.5)*.6)*sz,cy=(j+.5+(hsh(i+5,j)-.5)*.6)*sz,r=.78+hsh(i+2,j+9)*.42;if(((u-cx)/(r*1.15))**2+((v-cy)/r)**2<=1)return true}
  return false};
const bandC=(t,p,w)=>Math.abs((((t%p)+p)%p)-p/2)<w/2;               // dải lặp chu kỳ p, dày w
const blob=(u,v,cx,cy,rx,ry)=>((u-cx)/rx)**2+((v-cy)/ry)**2<1+(vnoise(u+cx,v+cy,1.6)-.5)*.55; // mảng màu mép lượn tự nhiên
const fleck=(u,v,k)=>hsh(Math.floor(u*2+1),Math.floor(v*2+1))<k;     // lấm tấm từng ô mịn
const marble=(u,v)=>vnoise(u,v,3)*.62+vnoise(u+40,v+17,1.4)*.38;      // loang hai lớp cho đồi mồi, xà cừ
const nacreC=(u,v,c)=>{const n=marble(u*1.15,v*1.15);return n<.4?[255,206,228]:n>.6?[206,244,224]:Math.abs(n-.5)<.04?[198,224,255]:c};
/* ---------- màu lông theo vùng ---------- */
function colorer(s){
  const c=hex(s.c),c2=hex(s.c2||s.c),c3=hex(s.c3||s.c2||s.c),W=hex('#fdfaf4'),w=s.w||0,p=s.pat;
  const soft=lum(c)>100?.38:.12;
  // hai vạch má xoè ra hai bên
  const cheek=(d,v)=>d>=7.9&&(Math.abs(v-19+(d-8)*.3)<.5||Math.abs(v-22-(d-8)*.3)<.5);
  return (x,y,reg,u,v)=>{
    if(u===undefined){u=x;v=y}
    const d=Math.abs(u-17.5);
    if(w>=1&&(reg==='muz'||reg==='chest'))return W;
    if((w>=2||s.mit)&&reg==='paw')return W;
    if(w>=2&&reg==='head'&&v>=15.5&&d<=(v-14)*.9+.25)return W;
    if(p==='van')return (reg==='tail'||((reg==='head'||reg==='ear')&&v<13.6+Math.sin(u*.9)*.6))?c2:W;
    if(p==='calico'){
      if(reg==='tail')return c3; if(reg==='ear')return u<17.5?c2:c3;
      if(reg==='head'){if(blob(u,v,9.5,11.5,7,6.2))return c2;if(blob(u,v,26.5,10,6.5,5.6))return c3}
      if(reg==='body'){if(blob(u,v,24.5,28,4.6,5.2))return c2;if(blob(u,v,10.5,34.5,4.2,4))return c3}
      return c;
    }
    if(p==='cow'){
      if(reg==='tail')return c2; if(reg==='ear')return u>17.5?c2:c;
      if(reg==='head'&&(blob(u,v,26,10.5,7,6.4)||blob(u,v,8.5,9.5,4.6,4.2)))return c2;
      if(reg==='body'&&blob(u,v,11,28.5,4.4,5))return c2;
      return c;
    }
    if(p==='tortie')return marble(u,v)<.47?c2:c;
    if(p==='nacre')return nacreC(u,v,c);
    if(p==='sheen')return (reg==='ear'||bandC(u+2*v+4.5,9,1.1))?c2:c;
    if(p==='lykoi'){
      if(reg==='muz'||(reg==='head'&&v>=14.6&&v<=20.4&&d<8))return c3;
      return fleck(u,v,.12+vnoise(u,v,2)*.28)?c2:c;
    }
    if(p==='point'){
      if(reg==='ear'||reg==='tail'||reg==='paw')return c2;
      if(reg==='head'||reg==='muz'){const m=((u-17.5)/6.8)**2+((v-19.5)/5.8)**2;if(m<1)return c2;if(m<1.2)return mix(c,c2,.42)} // mặt nạ có viền chuyển màu
      return reg==='chest'?lt(c,.3):c;
    }
    let b=(reg==='muz'||reg==='chest')?lt(c,soft):c;
    if(p==='smoke'){const n=(vnoise(u,v,1.5)-.5)*1.6;if(reg==='ear'||reg==='tail'||(reg==='head'&&v<14.6+n)||(reg==='body'&&v<27.6+n))b=c2}
    if(p==='ticked'){
      if((reg==='head'&&v<12.6)||reg==='ear')b=dk(c,.18);
      if(reg==='tail'&&v<28.6)b=c2;
      if(reg==='head'&&cheek(d,v))b=c2;
      if((reg==='body'||(reg==='head'&&v<12.6))&&fleck(u,v,.15))b=mix(b,c2,.5); // lông agouti lấm tấm
    }
    if(p==='tabby'||p==='tiger'){
      const T=p==='tiger';
      if(reg==='head'){
        if(v>=8.6&&v<=13.6&&d<.95)b=c2;                                          // vạch giữa trán
        if(v>=8.6&&v<=12.7&&Math.abs(d-(3.5+(12.7-v)*.28))<.5)b=c2;              // hai vạch bên xoè lên thành chữ M
        if(cheek(d,v))b=c2;
        if(T&&d>=7.9&&(Math.abs(v-15+(d-8)*.3)<.5||Math.abs(v-17+(d-8)*.15)<.5))b=c2;
      }
      // vằn sườn cong xuống về phía ngoài, đầu vằn thon lại
      if(reg==='body'){
        if(T){if(d>=4.2&&bandC(v+1-(d-4.2)*.5,2,Math.min(.95,.4+(d-4.2)*.3)))b=c2}
        else if(d>=5.2&&[28,31,34].some(y0=>Math.abs(v-y0-(d-5.2)*.5)<Math.min(.52,.26+(d-5.2)*.22)))b=c2;
      }
      if(reg==='tail'&&bandC(v+1.5-(u-28)*.25,3,1))b=c2;
    }
    if(p==='spot'&&(reg==='body'||reg==='tail'||(reg==='head'&&v<14))&&spotAt(u,v))b=c2;
    return b;
  };
}

const each=(b,f)=>{for(let Y=0;Y<b.H;Y++)for(let X=0;X<b.W;X++){b.fX=X;b.fY=Y;b.fx=X>>1;b.fy=Y>>1;f(X>>1,Y>>1,b.r[Y*b.W+X])}b.fX=-1};
// duyệt ô mịn trong một khung, f nhận toạ độ thực (u,v) và chỉ số ô mịn (X,Y)
const fine=(b,x0,y0,x1,y1,f)=>{for(let Y=Math.floor(y0*Q);Y<(y1+1)*Q;Y++)for(let X=Math.floor(x0*Q);X<(x1+1)*Q;X++)f((X+.5)/Q-.5,(Y+.5)/Q-.5,X,Y)};
/* ---------- chi tiết mặt vẽ ở lưới mịn ---------- */
// mắt "đá quý" 6x6 ô mịn: mí trên sẫm, mống mắt chuyển sắc từ đậm (trên) xuống nhạt (dưới), con ngươi, hai điểm sáng và quầng sáng nhẹ nhuộm lên lông quanh mắt.
// lash: thêm hàng lông mi trắng phía trên (mắt Gojo)
const GEM=['.KKKK.','KWWaaK','rWPPir','riPPir','rliiwr','.lLLl.'];
function gemEye(b,x0,y,ic,lash){
  const X0=2*x0-1,Y0=2*y-2,D=[26,22,58],W1=[255,255,255],
    pal={K:mix(ic,D,lash?.5:.6),a:mix(ic,D,.2),r:mix(ic,D,.32),P:mix(ic,[16,14,40],.78),i:ic,l:lt(ic,.4),L:lt(ic,.66),w:W1,W:W1};
  for(let j=-1;j<=6;j++)for(let i=-1;i<=6;i++){
    const ch=(GEM[j]||'')[i]; if((ch&&ch!=='.')||Math.hypot(i-2.5,j-2.5)>4.1)continue;
    const o=b.getF(X0+i,Y0+j),rg=b.regF(X0+i,Y0+j); if(o&&rg!=='o'&&o.length===3)b.put(X0+i,Y0+j,mix(o,ic,.24),rg);
  }
  GEM.forEach((row,j)=>{for(let i=0;i<6;i++)if(row[i]!=='.')b.put(X0+i,Y0+j,pal[row[i]],'x')});
  if(lash){for(let i=0;i<6;i++)b.put(X0+i,Y0-1,W1,'x');[-1,6].forEach(i=>{b.put(X0+i,Y0,W1,'x');b.put(X0+i,Y0+1,W1,'x')})}
}
// mắt tròn có đốm sáng: x0 = cột trái (mắt rộng 2 ô), y = hàng giữa
function drawEye(b,x0,y,ic,closed,gem){
  const u=b.get(x0,y)||[230,230,230],dark=lum(u)<110,cx=x0+.5;
  if(closed){const lc=dark?lt(u,.6):EY;for(let i=0;i<8;i++){const d=(i-3.5)/3.5,v=y+1.25-d*d*1.25;b.dot(x0-1.25+i*.5,v,lc,'x');b.dot(x0-1.25+i*.5,v-.5,lc,'x')}return}
  if(gem){gemEye(b,x0,Math.round(y),ic,gem>1);return}
  const ir=lt(ic,dark?.25:.15),PU=lum(u)>170?EY:[86,52,44];
  if(dark){b.ell(cx,y,1.25,1.3,ir,'x');b.ell(cx,y+.1,.3,.9,PU,'x')}
  else b.ell(cx,y,1.25,1.3,(X,Y,r,uu,vv)=>vv>y+.5?ir:PU,'x');
  [[-.75,-.75],[-.25,-.75],[-.75,-.25]].forEach(d=>b.dot(cx+d[0],y+d[1],WH,'x'));
}
// mũi hình thang nhỏ và miệng chữ w
function drawNose(b,cx,y,mouth){
  const N=[232,110,120];[-.75,-.25,.25,.75].forEach(d=>b.dot(cx+d,y-.25,N,'x'));[-.25,.25].forEach(d=>b.dot(cx+d,y+.25,N,'x'));
  if(mouth){const m=mix(b.get(Math.floor(cx),y+1)||[240,230,220],EY,.62);[-.25,.25,-1.75,1.75].forEach(d=>b.dot(cx+d,y+.75,m,'x'));[-1.25,-.75,.75,1.25].forEach(d=>b.dot(cx+d,y+1.25,m,'x'))}
}
// ria mảnh 1 ô mịn, chỉ vẽ lên chỗ trống
const wsk=(b,u,v,dir,tilt)=>{for(let i=0;i<6;i++){const X=Math.round((u+dir*i*.5)*Q+.5),Y=Math.round((v+(i>2?tilt*.5:0))*Q+.5);if(X>=0&&X<b.W&&!b.getF(X,Y))b.put(X,Y,OC,'o')}};
const spark=(b,x,y,c)=>{const X=Math.round(x*Q),Y=Math.round(y*Q);[[0,0],[1,0],[-1,0],[0,1],[0,-1]].forEach(d=>b.put(X+d[0],Y+d[1],c,'x'))};
const ring=(b,cx,cy,rx,ry,t,col,reg,clip)=>fine(b,cx-rx-1,cy-ry-1,cx+rx+1,cy+ry+1,(u,v,X,Y)=>{if(((u-cx)/rx)**2+((v-cy)/ry)**2<=1&&((u-cx)/(rx-t))**2+((v-cy)/(ry-t))**2>1&&(!clip||clip(u,v)))b.put(X,Y,col,reg)});
// chữ số 6x10 ô mịn (bằng 3x5 ô gốc), nét bo góc
const DIG={'4':['...###','..####','.##.##','##..##','##..##','######','######','....##','....##','....##'],'5':['######','######','##....','#####.','######','....##','....##','##..##','######','.####.'],'6':['.####.','######','##....','#####.','######','##..##','##..##','##..##','######','.####.']};
const recolor=(b,test,col,reg)=>each(b,(x,y,r)=>{if(r&&r!=='o'&&test(x,y,r))b.set(x,y,col,reg||r)});
const isBody=r=>r==='body'||r==='chest';

/* ---------- trang phục kiểu cũ (vẽ tay từng bộ) ---------- */
const COS={
  tank:{front(b){each(b,(x,y,r)=>{if(isBody(r)&&y>=26&&y<=35&&x>=11&&x<=24&&!(y<=28&&x>=15&&x<=20)&&!(y<=28&&(x<=12||x>=23)))b.set(x,y,y===31||y===32?RED:[250,250,255],'body')})}},
  ninja:{
    back(b){b.line(27,13,33,16,RED,'x');b.line(27,14,32,19,RED,'x')},
    mid(b){each(b,(x,y,r)=>{if((r==='head'||r==='ear')&&!(y>=15&&y<=20))b.set(x,y,NAVY,r)})},
    front(b){each(b,(x,y,r)=>{if(y>=21&&y<=26&&(r==='muz'||r==='x'||r==='head'))b.set(x,y,NAVY,'head');if((y===13||y===14)&&(r==='head'))b.set(x,y,RED,'x')})}
  },
  chef:{
    mid(b){const C=[252,252,255];b.ell(17.5,4.5,6,3.6,C,'hat');b.ell(13,6,3,3,C,'hat');b.ell(22,6,3,3,C,'hat');b.rect(13,7,10,4,C,'hat');b.rect(13,10,10,1,[214,216,228],'x')},
    front(b){each(b,(x,y,r)=>{if(y>=25&&y<=26&&x>=12&&x<=23&&r)b.set(x,y,RED,'x')});b.rect(17,27,2,2,RED,'x')}
  },
  astro:{
    front(b){
      b.rect(11,25,14,2,[200,206,224],'x');b.rect(15,29,6,3,[122,132,166],'x');b.set(16,30,[255,110,110],'x');b.set(19,30,[110,220,140],'x');
      fine(b,2,1,33,30,(u,v,X,Y)=>{const d=Math.hypot(u-17.5,v-15.5);if(d<=13.85){if(d>12.6)b.put(X,Y,[196,230,248],'x');else b.put(X,Y,[170,225,255,60],b.regF(X,Y)||'x')}});
      b.set(9,7,WH,'x');b.set(10,6,WH,'x');b.set(8,8,WH,'x');
    }
  },
  royal:{
    back(b){b.tri(17.5,21,2,38,33,38,[200,70,90],'cape')},
    mid(b){b.rect(12,5,12,4,GOLDC,'hat');b.rect(12,2,2,3,GOLDC,'hat');b.rect(17,1,2,4,GOLDC,'hat');b.rect(22,2,2,3,GOLDC,'hat');b.rect(17,6,2,2,RED,'x');b.set(14,7,[110,170,255],'x');b.set(21,7,[110,170,255],'x')},
    front(b){b.ell(17.5,25.5,8.5,1.8,[255,255,255],'x');[[12,25],[17,26],[23,25],[15,25],[20,25]].forEach(p=>b.set(p[0],p[1],EY,'x'))}
  },
  bread:{noEars:1,
    back(b){const C=[214,156,96],I=[250,228,180];b.rect(3,6,30,22,C,'hat');b.ell(10,7,7,5,C,'hat');b.ell(25,7,7,5,C,'hat');b.rect(10,2,15,6,C,'hat');b.rect(5,7,26,19,I,'hat');b.ell(10,8,5,3.6,I,'hat');b.ell(25,8,5,3.6,I,'hat');b.rect(10,4,15,5,I,'hat')}
  },
  dj:{
    mid(b){const D=[92,92,120];fine(b,3,2,32,12,(u,v,X,Y)=>{const o=((u-17.5)/13.25)**2+((v-16)/12.25)**2,i=((u-17.5)/11.2)**2+((v-16)/10.2)**2;if(o<=1&&i>1)b.put(X,Y,D,'hat')});
      b.rect(3,13,4,8,D,'hat');b.rect(29,13,4,8,D,'hat');b.rect(4,15,2,4,[130,230,230],'x');b.rect(30,15,2,4,[130,230,230],'x')},
    front(b){const D=[70,60,90];b.rect(10,15,7,4,D,'x');b.rect(19,15,7,4,D,'x');b.rect(17,16,2,1,D,'x');b.set(11,16,WH,'x');b.set(20,16,WH,'x');b.rect(12,18,4,1,[240,120,210],'x');b.rect(21,18,4,1,[240,120,210],'x')}
  }
};

/* ---------- bộ phận trang phục ghép được: tên -> [giai đoạn, hàm vẽ] ---------- */
const DARK=[72,62,86];
const VK=[46,42,56],VK2=[36,32,44],VHL=[104,98,124],VSI=[150,146,170],VGL=[96,26,34],VRD=[240,74,74],VLN=[150,40,56]; // bảng màu Darth Vader
const TART=[244,206,146],TART2=[222,172,106],TART3=[252,226,176],FROST=[255,160,208],FROST2=[255,204,230],SPRK=[232,60,150],SPRK2=[196,44,128];                                                      // bánh pop-tart của Nyan Cat
// hình chữ nhật bo góc: tâm (cx,cy), nửa rộng w, nửa cao h, bán kính góc c
const rrect=(u,v,cx,cy,w,h,c)=>{const dx=Math.abs(u-cx),dy=Math.abs(v-cy);return dx<=w&&dy<=h&&!(dx>w-c&&dy>h-c&&Math.hypot(dx-w+c,dy-h+c)>c)};
// bánh pop-tart: vỏ bánh bo góc (mép trên sáng, đáy sẫm), lớp kem hồng mép lượn tự nhiên có vệt bóng, cốm rắc hai tông hồng
const tart=(b,cx,cy,w,h,skip,alt)=>{
  const T1=alt?[150,98,58]:TART,T2=alt?[118,74,44]:TART2,T3=alt?[182,128,78]:TART3; // alt: bánh waffle nướng sẫm của Tac Nayn
  fine(b,cx-w-1,cy-h-1,cx+w+1,cy+h+1,(u,v,X,Y)=>{
    if(!rrect(u,v,cx,cy,w,h,2.2)||(skip&&skip(u,v,X,Y)))return;
    const n=(vnoise(u+cx,v+cy,2.6)-.5)*1.5;
    if(rrect(u,v,cx,cy,w-1.6+n,h-1.5+n,1.9))b.put(X,Y,alt?((Math.floor(u+40)%3===0||Math.floor(v+40)%3===0)?[168,110,58]:(u+40)%3<1.6&&(v+40)%3<1.6?[240,190,104]:[222,166,84]):v<cy-h+3.1&&v>cy-h+2.2&&u>cx-w+2.6&&u<cx-w*.2?FROST2:FROST,'body');
    else b.put(X,Y,v>cy+h-1.1?T2:v<cy-h+.8?T3:T1,'body');
  });
};
// lưới thở của Vader: tấm bạc bo góc có bốn khe dọc cách đều, phía trên là sống mũi nhỏ, hai gân chéo toả ra má
const vgrille=(b,cx,cy,w,h)=>{
  [1,-1].forEach(k=>b.cap(cx+k*1.4,cy-h-.9,cx+k*(w+1.1),cy+.3,.3,VHL,'x'));
  fine(b,cx-w-1,cy-h-1,cx+w+1,cy+h+1,(u,v,X,Y)=>{const d=Math.abs(u-cx);if(rrect(u,v,cx,cy,w,h,.9))b.put(X,Y,(d===.75||d===2.25)&&Math.abs(v-cy)<h-.4?VK2:VSI,'x')});
  [-.25,.25].forEach(d=>{b.dot(cx+d,cy-h-.75,[196,192,210],'x');b.dot(cx+d,cy-h-.25,[196,192,210],'x')});
};
/* ---------- Goku và Naruto (5★): tóc chĩa của Naruto, võ phục và các dạng biến hình ---------- */
// Mỗi chỏm tóc là một tam giác [x1,y1,x2,y2,xĐỉnh,yĐỉnh] tính từ tâm đầu. Tóc vẽ ở lớp 'back' nên tai mèo và khuôn mặt nằm đè lên trên.
// SPK: nhìn thẳng (tâm đầu 17.5, 17). SPKS: nhìn ngang, mặt quay trái nên tóc chĩa về phía sau (+x).
const SPK={
  naruto:[[-9,-5,-8,-9,-14.5,-11],[-10,-2,-9.5,-6,-16,-5.5],[-9.5,1,-10,-2.5,-15,0],[-6.5,-7.5,-2.5,-9,-6.5,-15.5],[-3.5,-8.5,3.5,-8.5,0,-16.5],[2.5,-9,6.5,-7.5,6.5,-15.5],[9,-5,8,-9,14.5,-11],[10,-2,9.5,-6,16,-5.5],[9.5,1,10,-2.5,15,0]],
};
SPK.kurama=SPK.naruto.concat([[-7,-7,-3.5,-9,-8,-17],[3.5,-9,7,-7,8,-17]]);   // hai chỏm dài như sừng của dạng Cửu Vĩ
const SPKS={
  naruto:[[-9,-3.5,-5,-7.5,-10.5,-10.5],[-5.5,-7.5,-.5,-8.5,-3.5,-15],[.5,-8.5,6,-6.5,6.5,-14.5],[5.5,-7,9,-2.5,13.5,-10],[8.5,-3.5,9.8,1,15.5,-2.5],[9,.5,7.5,5,13.5,4.5]],
};
SPKS.kurama=SPKS.naruto.concat([[-6,-7,-2,-8.5,-6.5,-16.5],[2,-8.5,6,-6.5,8,-16]]);
// tóc mái: các lọn nhọn rủ xuống trán. BANG: nhìn thẳng (toạ độ tuyệt đối). BANGS: nhìn ngang (tính từ tâm đầu)
const BANG={
  naruto:[[10.4,9.8,13.5,9.8,10.9,13.2],[21.5,9.8,24.6,9.8,24.1,13.2]],
  kurama:[[10.4,10.5,14,10.5,11.4,14],[21,10.5,24.6,10.5,23.6,14],[15.5,10.5,19.5,10.5,17.5,13]],
};
const BANGS={naruto:[[-7.8,-5,-5,-5,-8,-1.8]],kurama:[[-7.8,-5,-4.5,-5,-7,-1.8],[-4,-5,0,-5,-1.4,-2.2]]};
const spikes2=(b,list,ox,oy,C)=>{const hl=lt(C,.3);list.forEach(t=>{
  b.tri(ox+t[0],oy+t[1],ox+t[2],oy+t[3],ox+t[4],oy+t[5],C,'hair');
  const mx=(t[0]+t[2])/2,my=(t[1]+t[3])/2;b.cap(ox+mx+(t[4]-mx)*.2,oy+my+(t[5]-my)*.2,ox+mx+(t[4]-mx)*.62,oy+my+(t[5]-my)*.62,.3,hl,'hair')})};   // vệt sáng dọc mỗi chỏm
const GO=[244,134,40],GBL=[52,84,186],GTAIL=[156,100,64];                                       // Goku: võ phục cam, áo lót và đai xanh, đuôi nâu
const NO=[244,138,40],NK=[52,48,66],NB=[46,62,124],NB2=[34,46,96];                              // Naruto: cam, đen, xanh băng trán
const KY=[255,208,64],KY2=[255,236,146],KK=[44,40,56];                                          // áo choàng chakra Cửu Vĩ
const HW=[250,248,244],HW2=[222,218,212],HR=[214,52,58];                                        // áo choàng và mũ Hokage
const HFL=(u,v,y0)=>v>y0-1.6*Math.abs(Math.sin(u*1.15+.4));                                     // mép các ngọn lửa đỏ ở gấu áo Hokage
// vòng hào quang lơ lửng trên đầu Goku: vẽ sau viền nên không có viền nâu, lõi vàng sáng giữa hai mép hổ phách sẫm
const haloRing=(b,cx,cy,rx)=>{ring(b,cx,cy,rx+.25,2.05,1.05,[196,126,22],'x');ring(b,cx,cy,rx,1.8,.55,[255,228,112],'x');[-.5,0,.5].forEach(k=>b.dot(cx-rx*.55+k,cy-1.5,[255,250,214],'x'))};
// nét chữ nhỏ từ bảng điểm: tâm (cx, cy) nằm giữa các ô mịn
const glyph=(b,cx,cy,rows,col)=>rows.forEach((row,j)=>{for(let i=0;i<row.length;i++)if(row[i]==='#')b.dot(cx-(row.length-1)*.25+i*.5,cy-(rows.length-1)*.25+j*.5,col,'x')});
const GK_MARK=["#.##","#.#.","#.##","#..#"];                              // gợi chữ "悟" trên ngực áo Goku
const LEAF=["..##..","##..#.",".#.##.","##.##.","#.##.."];                // ký hiệu làng Lá: vòng xoáy có đuôi nhọn
const FIRE=["#.##.#","..##..","..##..",".####.","##..##","#....#"];       // chữ "火" trên mũ Hokage
// mắt tiên nhân Cửu Vĩ: mống cam, con ngươi chữ thập (khe dọc của cáo và vạch ngang của cóc), quầng cam phía trên
const kEye=(b,cx,cy)=>{b.ell(cx,cy,1.25,1.3,[255,180,48],'x');
  for(let i=-1.25;i<=1.25;i+=.5){b.dot(cx+i,cy-.25,KK,'x');b.dot(cx+i,cy+.25,KK,'x');b.dot(cx-.25,cy+i,KK,'x');b.dot(cx+.25,cy+i,KK,'x');b.dot(cx+i,cy-1.75,[236,112,40],'x')}};
// băng trán: tấm kim loại bo góc có ký hiệu làng Lá
const plate=(b,cx,cy,w)=>{fine(b,cx-w-1,cy-3,cx+w+1,cy+3,(u,v,X,Y)=>{if(rrect(u,v,cx,cy,w,1.75,.7))b.put(X,Y,Math.abs(u-cx)>w-.7||Math.abs(v-cy)>1.2?[150,156,172]:[216,220,230],'x')});glyph(b,cx,cy+.25,LEAF,[92,98,120])};
// tô lại thân và chân ở góc nhìn ngang mà vẫn giữ chân phía xa sẫm hơn chân phía gần. f(vùng, xa?, cột gốc) trả màu mới, hoặc null để giữ nguyên
const dress=(b,s,f)=>{const base=lum(hex(s.c));each(b,(x,y,r)=>{if(!r||r==='o')return;const o=b.getF(b.fX,b.fY),c=f(r,(r==='leg'||r==='paw')&&lum(o)<base-10,x);if(c)b.set(x,y,c,r)})};
// Luồng khí bốc quanh thân: vẽ sau cùng (sau viền) lên các ô còn trống quanh hình. Ngọn lửa cao thấp theo nhiễu kéo dọc, vươn lên trên nhiều hơn xuống dưới; càng xa thân càng trong.
function auraFx(b,C,seed){
  const W=b.W,Hh=b.H,D=new Int8Array(W*Hh).fill(99),q=[];
  for(let i=0;i<W*Hh;i++)if(b.c[i]){D[i]=0;q.push(i)}
  for(let h=0;h<q.length;h++){const i=q[h],d=D[i];if(d>=10)continue;const x=i%W,y=(i-x)/W;
    [[1,0],[-1,0],[0,1],[0,-1]].forEach(o=>{const X=x+o[0],Y=y+o[1];if(X<0||Y<0||X>=W||Y>=Hh)return;const j=Y*W+X;if(D[j]>d+1){D[j]=d+1;q.push(j)}})}
  const hi=lt(C,.62);
  for(let Y=0;Y<Hh;Y++)for(let X=0;X<W;X++){const d=D[Y*W+X];if(!d||d>10)continue;
    const u=X/2,v=Y/2,above=Y+d<Hh&&b.c[(Y+d)*W+X]?1.3:.75,low=v>b.h-7?.4:1,ed=Math.min(X,W-1-X,Y),A=(1.8+7.5*vnoise(u+seed*5.3,v*.42+seed*2.1,1.7))*above*low*Math.min(1,ed/8);   // ed: khoảng cách tới mép khung sprite; sát mép thì luồng khí ngắn và mờ dần để không lộ khung vuông
    if(d<=A){const t=d/A,al=Math.min(1,(ed+1)/6);b.put(X,Y,[...(t<.38?hi:C),Math.round((t<.38?235:t<.72?185:115)*al)],'x')}}
}
const P={
  // sau lưng
  cape:['back',(b,s,c)=>b.tri(17.5,21,2,38,33,38,H(c),'cape')],
  twintails:['back',(b,s,c)=>{b.ell(4.5,22,3,8,H(c),'hair');b.ell(30.5,22,3,8,H(c),'hair')}],
  longhair:['back',(b,s,c,rx,ry,cy)=>b.ell(17.5,cy||20,rx||13,ry||10,H(c),'hair')],
  sword:['back',b=>{b.line(24,23,33,5,[205,210,222],'x');b.line(25,23,34,5,[170,176,190],'x');b.line(21,27,24,23,[120,80,60],'x');b.line(22,27,25,23,[120,80,60],'x')}],
  staff:['back',(b,s,c,top)=>{b.rect(31,5,2,33,H(c),'prop');if(top)b.ell(31.5,4,2.4,2.4,H(top),'prop')}],
  saber:['back',(b,s,c)=>{b.line(27,30,33,5,H(c),'x');b.line(28,30,34,5,H(c),'x');b.line(25,34,27,30,[150,150,165],'x');b.line(26,34,28,30,[150,150,165],'x')}],
  wand:['back',b=>{b.line(27,29,33,21,[150,104,66],'prop');b.set(34,19,[255,236,140],'x');b.set(33,18,[255,236,140],'x');b.set(35,20,[255,236,140],'x')}],
  rainbow:['back',b=>{[[255,128,128],[255,196,120],[255,240,140],[156,226,150],[140,196,255],[196,160,240]].forEach((c,i)=>b.rect(0,24+i*2,11,2,c,'x'))}],
  br:['back',(b,s,x,y,w,h,c)=>b.rect(x,y,w,h,H(c),'x')],
  // trên đầu, trước khi vẽ mặt
  haircap:['mid',(b,s,c,y1,jag)=>recolor(b,(x,y,r)=>r==='head'&&y<=(y1||12)+(jag&&x%4<2?1:0),H(c),'hair')],
  spikes:['mid',(b,s,c)=>{const C=H(c);b.tri(7,12,10,2,15,10,C,'hair');b.tri(12,10,17.5,0,23,10,C,'hair');b.tri(20,10,25,2,28,12,C,'hair');recolor(b,(x,y,r)=>r==='head'&&y<=12+(x%4<2?1:0),C,'hair')}],
  hood:['mid',(b,s,c)=>each(b,(x,y,r)=>{if((r==='head'||r==='ear'||(r==='x'&&y<14))&&!(((x-17.5)/8)**2+((y-18.5)/6)**2<1))b.set(x,y,H(c),'hood')})],
  fullmask:['mid',(b,s,c)=>each(b,(x,y,r)=>{if(r==='head'||r==='ear'||(r==='x'&&y<14))b.set(x,y,H(c),'head')})],
  faceplate:['mid',(b,s,c)=>recolor(b,(x,y,r)=>(r==='head'||r==='hood')&&((x-17.5)/7)**2+((y-18.5)/5.5)**2<1,H(c),'head')],
  flare:['mid',(b,s,c)=>b.ell(17.5,22.5,12.5,3.5,H(c),'head')],
  strawhat:['mid',b=>{const Y=[244,214,120];b.ell(17.5,10,13.5,2.4,Y,'hat');b.ell(17.5,6.5,7.5,4.5,Y,'hat');b.rect(10,8,16,2,RED,'x')}],
  pointhat:['mid',(b,s,c,band)=>{const C=H(c);b.ell(17.5,10,13.5,2.3,C,'hat');b.tri(10,10,19,-1,25,10,C,'hat');if(band)b.rect(11,8,14,1,H(band),'x')}],
  tricorn:['mid',b=>{const C=[92,80,112];b.ell(17.5,8,12.5,2.2,C,'hat');b.ell(17.5,5,7.5,4,C,'hat');b.rect(8,8,20,1,GOLDC,'x')}],
  headband:['mid',(b,s,c,plate)=>{recolor(b,(x,y,r)=>(r==='head'||r==='hair')&&(y===11||y===12),H(c),'x');if(plate){b.rect(14,10,8,4,[205,210,222],'x');b.rect(16,11,4,2,[150,156,170],'x')}}],
  leaf:['mid',b=>{b.ell(17.5,7,3.6,1.8,[130,196,120],'hat');b.rect(17,8,1,2,[110,160,100],'hat')}],
  buns:['mid',(b,s,c)=>{b.ell(8.5,6.5,3,3,H(c),'hair');b.ell(26.5,6.5,3,3,H(c),'hair')}],
  tiara:['mid',b=>{b.rect(13,10,10,1,GOLDC,'x');b.rect(17,9,2,3,[240,110,130],'x')}],
  horns:['mid',(b,s,c)=>{b.rect(10,7,3,3,H(c),'hat');b.rect(23,7,3,3,H(c),'hat')}],
  mr:['mid',(b,s,x,y,w,h,c)=>b.rect(x,y,w,h,H(c),'x')],
  // phía trước, sau khi vẽ mặt
  suit:['front',(b,s,c,top,paws)=>recolor(b,(x,y,r)=>(isBody(r)||(paws&&r==='paw'))&&y>=(top||25),H(c),'body')],
  checker:['front',(b,s,c1,c2)=>recolor(b,(x,y,r)=>isBody(r)&&y>=25,(x,y)=>((x>>1)+(y>>1))%2?H(c1):H(c2),'body')],
  tripat:['front',(b,s,c1,c2)=>recolor(b,(x,y,r)=>isBody(r)&&y>=25,(x,y)=>(x+2*y)%6===0?WH:(y>=32?H(c2):H(c1)),'body')],
  sides:['front',(b,s,c)=>recolor(b,(x,y,r)=>isBody(r)&&y>=25&&(x<=13||x>=22),H(c),'body')],
  belt:['front',(b,s,c,y0)=>recolor(b,(x,y,r)=>isBody(r)&&y===(y0||32),H(c),'x')],
  emblem:['front',(b,s,c,c2)=>{b.rect(16,28,4,3,H(c),'x');if(c2)b.rect(17,29,2,1,H(c2),'x')}],
  scarf:['front',(b,s,c,c2)=>{each(b,(x,y,r)=>{if(r&&r!=='o'&&y>=24&&y<=25&&x>=10&&x<=25)b.set(x,y,c2&&x%4<2?H(c2):H(c),'x')});b.rect(21,26,3,5,H(c),'x');if(c2){b.rect(21,27,3,1,H(c2),'x');b.rect(21,29,3,1,H(c2),'x')}}],
  collar:['front',(b,s,c,bell)=>{each(b,(x,y,r)=>{if(r&&r!=='o'&&y===25&&x>=11&&x<=24)b.set(x,y,H(c),'x')});if(bell)b.rect(17,26,2,2,GOLDC,'x')}],
  sailor:['front',(b,s,c)=>{each(b,(x,y,r)=>{if(r&&r!=='o'&&y>=24&&y<=26&&x>=10&&x<=25)b.set(x,y,y===26?WH:H(c),'x')})}],
  tie:['front',(b,s,c,c2)=>{[[15,25],[16,25],[19,25],[20,25]].forEach(p=>b.set(p[0],p[1],WH,'x'));for(let y=25;y<31;y++)b.rect(17,y,2,1,y%2?H(c):H(c2),'x')}],
  bow:['front',(b,s,c)=>{b.rect(14,25,3,3,H(c),'x');b.rect(19,25,3,3,H(c),'x');b.rect(17,26,2,1,dk(H(c),.3),'x')}],
  cravat:['front',b=>{b.rect(15,24,6,2,WH,'x');b.rect(16,26,4,2,WH,'x')}],
  glasses:['front',(b,s,c)=>{const C=H(c||'#4a3f55');[12.5,22.5].forEach(cx=>ring(b,cx,17,3.1,3.5,.62,C,'x'));b.rect(15.5,16.25,4,.5,C,'x')}], // gọng tròn mảnh
  blindfold:['front',(b,s,c)=>each(b,(x,y,r)=>{if(r&&r!=='o'&&y>=15&&y<=19&&x>=7&&x<=28&&r!=='prop')b.set(x,y,H(c),'x')})],
  scar:['front',(b,s,k)=>{
    if(k==='bolt'){b.cap(19.4,9.4,18.1,11.1,.3,RED,'x');b.cap(18.1,11.1,19.4,11.5,.3,RED,'x');b.cap(19.4,11.5,18.2,13.4,.3,RED,'x')} // tia chớp nét mảnh
    if(k==='under')b.rect(11,20,3,1,EY,'x');
    if(k==='tanjiro')b.rect(11,10,4,3,[176,70,76],'x');
  }],
  marks:['front',b=>{[-1,0,1].forEach(k=>{b.cap(7.6,21+k*2.3,10.4,21+k*1.7,.3,EY,'x');b.cap(27.4,21+k*2.3,24.6,21+k*1.7,.3,EY,'x')})}], // ba vạch ria mảnh, hơi xoè
  lenses:['front',(b,s,c,w,h)=>{w=w||4;h=h||4;[11+(w-1)/2,25-w+(w-1)/2].forEach(cx=>b.ell(cx,15+(h-1)/2,w/2-.2,h/2-.2,H(c),'x'))}], // mắt kính bo tròn
  pupils:['front',(b,s,c)=>{b.rect(13,17,1,2,H(c),'x');b.rect(22,17,1,2,H(c),'x')}],
  lids:['front',(b,s,c)=>{const C=c?H(c):hex(s.c);b.rect(11,14,4,3,C,'x');b.rect(21,14,4,3,C,'x');b.rect(11,17,4,1,EY,'x');b.rect(21,17,4,1,EY,'x')}],
  mustache:['front',b=>{[1,-1].forEach(k=>{const X=x=>17.5+k*x;b.cap(X(1.2),21.2,X(3),22.3,.32,DARK,'x');b.cap(X(3),22.3,X(4.6),21.6,.32,DARK,'x');b.cap(X(4.6),21.6,X(5.6),20,.3,DARK,'x')})}], // ria cong vểnh
  beard:['front',(b,s,c)=>b.ell(17.5,25,5.6,6.5,H(c),'x',(x,y)=>y>=22)],
  bamboo:['front',b=>{b.rect(13,21,10,2,[166,210,146],'x');b.rect(13,21,1,2,[120,170,110],'x');b.rect(22,21,1,2,[120,170,110],'x');b.rect(17,21,1,2,[120,170,110],'x')}],
  number:['front',(b,s,str,c)=>{const G={'4':["#.#","#.#","###","..#","..#"],'5':["###","#..","###","..#","###"],'6':["###","#..","###","#.#","###"]};
    [...str].forEach((ch,k)=>(DIG[ch]||[]).forEach((row,j)=>{for(let i=0;i<6;i++)if(row[i]==='#')b.put((12+k*4)*Q+i,28*Q+j,H(c),'x')}))}],
  shape:['front',(b,s,k)=>{if(k==='tri'){b.line(17,15,14,20,WH,'x');b.line(18,15,21,20,WH,'x');b.line(14,21,21,21,WH,'x')}else{for(let i=0;i<6;i++){b.set(15+i,15,WH,'x');b.set(15+i,21,WH,'x');b.set(14,16+i-1,WH,'x');b.set(21,16+i-1,WH,'x')}}}],
  cheeks:['front',(b,s,c)=>{b.rect(8,20,3,2,H(c),'x');b.rect(25,20,3,2,H(c),'x')}],
  eartips:['front',(b,s,c)=>recolor(b,(x,y,r)=>r==='ear'&&y<=7,H(c),'ear')],
  tailbase:['front',(b,s,c)=>recolor(b,(x,y,r)=>r==='tail'&&y>=33,H(c),'tail')],
  belly:['front',(b,s,c)=>{b.ell(17.5,31,5.6,5.6,H(c),'chest',(x,y)=>y<=36&&isBody(b.reg(x,y)));[[14,28],[15,27],[16,28],[19,28],[20,27],[21,28]].forEach(p=>b.set(p[0],p[1],[150,150,165],'x'))}],
  pocket:['front',b=>{ring(b,17.5,30.4,4.2,3.4,.6,EY,'x',(u,v)=>v>=30.4);b.rect(13.5,30,8,.5,EY,'x')}], // túi nửa vòng tròn
  poptart:['front',b=>{recolor(b,(x,y,r)=>(isBody(r)||r==='paw')&&y>=25&&y<=35,[244,206,160],'body');recolor(b,(x,y,r)=>r==='body'&&y>=27&&y<=34&&x>=12&&x<=23,(x,y)=>(x*7+y*13)%11===0?[236,80,160]:[255,170,206],'x')}],
  paw:['front',b=>{b.ell(28,14.5,2.6,3.6,WH,'paw');b.rect(27,13,2,1,PINK,'x');b.set(27,15,PINK,'x');b.set(29,15,PINK,'x')}],
  coin:['front',b=>{b.ell(17.5,31.5,3.6,4.2,GOLDC,'x');b.rect(17,29,2,5,[214,160,60],'x')}],
  frown:['front',b=>{[1,-1].forEach(k=>{const X=x=>17.5+k*x;b.cap(X(.4),22.1,X(1.6),22.2,.3,EY,'x');b.cap(X(1.6),22.2,X(2.7),23.2,.3,EY,'x');b.cap(X(7.6),13.8,X(5.2),15.2,.34,EY,'x')})}], // miệng trễ, mày cau
  earrings:['front',b=>{b.rect(5,21,2,4,WH,'x');b.set(5,22,RED,'x');b.set(6,22,RED,'x');b.rect(29,21,2,4,WH,'x');b.set(29,22,RED,'x');b.set(30,22,RED,'x')}],
  web:['front',b=>{b.line(17,9,17,13,DARK,'x');b.line(12,11,15,14,DARK,'x');b.line(23,11,20,14,DARK,'x');b.line(9,21,13,22,DARK,'x');b.line(26,21,22,22,DARK,'x')}],
  fr:['front',(b,s,x,y,w,h,c)=>b.rect(x,y,w,h,H(c),'x')],
  // Darth Vader: mũ bóng phủ cả tai mèo, vành mũ xoè, sống mũ, mặt nạ, mắt kính đỏ sẫm, lưới thở tam giác, bảng điều khiển ngực, kiếm có lõi sáng
  vcape:['back',b=>{b.tri(17.5,21,2,38,33,38,VK2,'cape');b.tri(17.5,24.5,5.5,38,29.5,38,VLN,'cape')}],
  vhelm:['mid',b=>{
    each(b,(x,y,r)=>{if(r==='head'||r==='ear'||(r==='x'&&y<14))b.set(x,y,VK,r==='ear'?'ear':'head')});
    b.ell(17.5,22.4,13,3.5,VK,'head');
    b.cap(10.2,13.4,13.6,10.4,.4,VHL,'x');b.dot(15.25,9.75,VHL,'x');b.dot(15.75,9.75,VHL,'x');
    b.cap(8.6,15.2,17.5,13.4,.32,[84,78,102],'x');b.cap(17.5,13.4,26.4,15.2,.32,[84,78,102],'x');
  }],
  vface:['front',b=>{
    b.ell(17.5,19,6.4,4.4,[62,57,76],'head');
    [13,22].forEach(cx=>{b.ell(cx,17,2.25,1.7,VSI,'x');b.ell(cx,17,1.7,1.2,VGL,'x');b.dot(cx-.75,16.25,[255,206,196],'x');b.dot(cx-.25,16.25,[255,120,110],'x');b.dot(cx+.75,17.25,[176,52,58],'x')});
    vgrille(b,17.5,21.4,3,1.6);
  }],
  vsuit:['front',b=>{
    recolor(b,(x,y,r)=>isBody(r)&&y>=24,VK,'body');recolor(b,(x,y,r)=>r==='paw',[62,57,76],'paw');
    recolor(b,(x,y,r)=>r==='body'&&y===27,[84,78,102],'x');
    b.rect(15,28,6,3.5,[84,78,102],'x');
    b.rect(15.5,28.5,1.5,1,VRD,'x');b.rect(17.5,28.5,1,1,[96,176,255],'x');b.rect(19,28.5,1.5,1,VRD,'x');
    b.rect(15.5,30,2,.5,[226,226,238],'x');b.rect(18.5,30,2,.5,[112,220,140],'x');
    recolor(b,(x,y,r)=>r==='body'&&y===33,VSI,'x');
    b.rect(17,32.5,2,2,[196,192,210],'x');b.rect(17.5,33,1,1,VRD,'x');
    b.cap(27.5,30.5,33.5,5.3,1,[255,72,72],'x');b.cap(27.5,30.5,33.5,5.3,.4,[255,228,228],'x');
    b.cap(26.2,35.4,27.3,31.4,.85,VSI,'x');b.cap(26.6,34,26.9,33,.85,[70,66,84],'x');
  }],
  // Nyan Cat: cầu vồng bậc thang, thân là chiếc bánh pop-tart chữ nhật bo góc phủ kem hồng rắc cốm
  nrainbow:['back',(b,s,alt)=>{for(let x=0;x<11;x++){const o=(x>>1)%2;rbOf(alt).forEach((c,i)=>b.rect(x,24+o+i*2,1,2,c,'x'))}}],
  npoptart:['front',(b,s,alt)=>{
    tart(b,17.5,31.1,8.2,5.4,null,alt);
    if(!alt)[[11.75,29.25,0],[15.25,28.25,1],[19.25,29.75,0],[22.75,28.75,1],[12.75,32.25,1],[16.25,31.25,0],[20.25,32.75,1],[23.25,31.75,0],[14.25,34.25,0],[18.75,34.25,1]].forEach(p=>{b.dot(p[0],p[1],p[2]?SPRK2:SPRK,'x');b.dot(p[0]+.5,p[1],p[2]?SPRK2:SPRK,'x')});
    // hai chân trước ôm mép dưới chiếc bánh
    const g=hex(s.c),tc=dk(g,.3);[14.4,20.6].forEach(px=>{b.ell(px,36.5,2.1,1.5,g,'paw');[-.6,.6].forEach(d=>{b.dot(px+d,36.75,tc,'paw');b.dot(px+d,37.25,tc,'paw')})});
  }],
  nstars:['post',b=>{spark(b,3,8,[255,255,255]);spark(b,33,5,[255,236,150]);spark(b,33.5,16,[255,255,255])}],
  // mèo quỷ (chỉ xuất hiện trong intro của Zenitsu)
  // --- Goku và Naruto ---
  spk:['back',(b,s,c,st)=>spikes2(b,SPK[st],17.5,17,H(c))],
  gears:['mid',(b,s,c)=>recolor(b,(x,y,r)=>r==='ear',H(c),'ear')],       // Goku không có tóc: hai tai mang màu của dạng (đen, vàng Siêu Saiyan, đỏ Siêu Saiyan God)
  halo:['post',b=>haloRing(b,17.5,2.6,6.2)],
  hcap:['mid',(b,s,c,st)=>{const C=H(c);recolor(b,(x,y,r)=>r==='head'&&y<=(st==='naruto'?9:10),C,'hair');BANG[st].forEach(t=>b.tri(t[0],t[1],t[2],t[3],t[4],t[5],C,'hair'))}],
  // võ phục cam của Goku: cổ chữ V lộ áo lót xanh, đai xanh thắt nút, phù hiệu trắng trên ngực, băng cổ tay và giày xanh viền vàng, đuôi nâu. shiny: bản lấp lánh của dạng hiếm
  ggi:['front',(b,s,shiny)=>{
    const O=shiny?[255,152,48]:GO,O2=dk(O,.36),BL=shiny?[64,108,226]:GBL,BL2=dk(BL,.3),TR=shiny?GOLDC:O2;
    recolor(b,(x,y,r)=>isBody(r)&&y>=25,(x,y,r,u,v)=>v>33.4&&Math.abs(u-17.5)<.6?O2:O,'body');
    recolor(b,(x,y,r)=>r==='body'&&y>=35&&(x<=12||x>=23),(x,y,r,u,v)=>v<35.4?GOLDC:BL,'body');
    [10,24].forEach(x=>b.rect(x,36,2,1,BL2,'x'));
    recolor(b,(x,y,r)=>r==='paw'&&y>=34&&y<=35,BL,'paw');
    fine(b,13,24.5,22,29,(u,v,X,Y)=>{const d=Math.abs(u-17.5),h=(28.6-v)*.8;if(h>0&&isBody(b.regF(X,Y))){if(d<h)b.put(X,Y,BL,'x');else if(d<h+.7)b.put(X,Y,TR,'x')}});
    recolor(b,(x,y,r)=>isBody(r)&&y===32,shiny?(x,y,r,u,v)=>v<31.9?GOLDC:BL:BL,'x');
    b.rect(21,31.5,1.5,2,BL2,'x');b.rect(21,33.5,.5,2,BL,'x');b.rect(22,33.5,.5,1.5,BL,'x');
    b.ell(21,28.5,1.5,1.5,WH,'x');glyph(b,21,28.5,GK_MARK,NK);
    recolor(b,(x,y,r)=>r==='tail',GTAIL,'tail');
    if(shiny)[[12.5,30.5],[23.5,30.5],[15,34.5]].forEach(p=>spark(b,p[0],p[1],[255,246,200]));
  }],
  // Naruto: băng trán làng Lá (hai dải băng bay sau đầu), áo cam vai đen có khoá kéo, xoáy đỏ Uzumaki, túi kunai, dép ninja
  nbandT:['back',b=>{b.cap(27,12,32.5,14.5,.75,NB,'cape');b.cap(27,13,31.5,19,.75,NB2,'cape')}],
  nband:['mid',b=>{recolor(b,(x,y,r)=>(r==='head'||r==='hair')&&(y===11||y===12),NB,'x');plate(b,17.5,11.5,4.6)}],
  nsuit:['front',b=>{
    recolor(b,(x,y,r)=>isBody(r)&&y>=25,(x,y,r,u,v)=>v<28.4||Math.abs(u-17.5)<1.1?NK:NO,'body');
    [26.75,27.25,27.75].forEach(v=>{b.dot(17.25,v,[204,208,220],'x');b.dot(17.75,v,[204,208,220],'x')});
    recolor(b,(x,y,r)=>r==='body'&&y>=35&&(x<=12||x>=23),NB,'body');[10,24].forEach(x=>b.rect(x,36,2,1,NB2,'x'));
    b.ell(12,30.5,1,1,[226,60,60],'x');b.dot(11.75,30.25,WH,'x');
    b.rect(22,33.5,2.5,1,[240,236,226],'x');b.rect(22.5,34.5,1.5,1,NK,'x');
  }],
  // Tiên nhân Cửu Vĩ: áo choàng chakra vàng có gấu như ngọn lửa, áo trong đen, sáu dấu magatama quanh cổ, vòng ấn trên bụng, ria đậm, mắt chữ thập
  kcape:['back',b=>{b.tri(17.5,21,3,32,32,32,kGrad,'cape');[[5.2,38.4],[11.4,37.2],[17.5,38.6],[23.6,37.2],[29.8,38.4]].forEach(p=>b.tri(p[0]-3.6,31.5,p[0]+3.6,31.5,p[0],p[1],kGrad,'cape'))}],
  korbs:['post',b=>[[3,5.5],[32,5.5],[1.8,14.5],[33.2,14.5]].forEach(p=>kOrb(b,p[0],p[1]))],
  kface:['front',b=>{[-1,0,1].forEach(k=>{b.cap(7.4,21+k*2.4,10.6,21+k*1.7,.45,KK,'x');b.cap(27.6,21+k*2.4,24.4,21+k*1.7,.45,KK,'x')});kEye(b,12.5,17);kEye(b,22.5,17)}],
  kcloak:['front',b=>{
    recolor(b,(x,y,r)=>isBody(r)&&y>=25,(x,y,r,u,v)=>{const d=Math.abs(u-17.5);return d<3?KK:d<3.6?KY2:kGrad(x,y,r,u,v)},'body');
    recolor(b,(x,y,r)=>r==='body'&&y>=35&&(x<=12||x>=23),KK,'body');
    [[13.25,26.25],[12.25,27.75],[11.25,29.75]].forEach(p=>[1,-1].forEach(k=>{const u=k>0?p[0]:35-p[0];b.dot(u,p[1],KK,'x');b.dot(u+k*.5,p[1],KK,'x');b.dot(u,p[1]+.5,KK,'x')}));
    ring(b,17.5,31,1.9,1.9,.55,KY,'x');b.dot(17.25,31.25,KY,'x');b.dot(17.75,30.75,KY,'x');
  }],
  // Hokage Đệ Thất: mũ trắng có mảng đỏ mang chữ "火", khăn trắng rủ sau mũ, áo choàng trắng gấu lửa đỏ khoác ngoài áo cam
  hcape:['back',b=>b.tri(17.5,21,2.5,38,32.5,38,(x,y,r,u,v)=>HFL(u,v,37.7)?HR:HW,'cape')],
  hveil:['back',b=>b.ell(17.5,16.5,13.2,9.5,HW,'cape')],
  hbangs:['mid',(b,s,c)=>[[10.4,11.5,13.5,11.5,11.3,14.8],[13.5,11.5,17,11.5,15.8,14.2],[18.5,11.5,22,11.5,20.2,14.2],[22,11.5,24.8,11.5,24.2,14.8]].forEach(t=>b.tri(t[0],t[1],t[2],t[3],t[4],t[5],H(c),'hair'))],
  hhat:['mid',b=>{b.tri(8.5,10.5,17.5,1.2,26.5,10.5,HW,'hat');b.ell(17.5,10.4,14.2,2.3,HW,'hat');b.tri(12.6,10.6,17.5,3.4,22.4,10.6,HR,'hat');glyph(b,17.5,7.5,FIRE,WH);
    b.cap(4.6,11.6,30.4,11.6,.3,HW2,'x')}],
  hcloak:['front',b=>{
    recolor(b,(x,y,r)=>isBody(r)&&y>=25,(x,y,r,u,v)=>{const d=Math.abs(u-17.5);return d<2.3?(d<.6?NK:NO):d<2.9?HW2:HFL(u,v,37.3)?HR:HW},'body');
  }],
  // ninja phản bội (kẻ địch trong intro của Naruto): mây đỏ viền trắng trên áo choàng đen
  aclouds:['front',b=>[[12.8,30],[21.8,33.2]].forEach(p=>{b.ell(p[0],p[1],2,1.3,WH,'x');b.ell(p[0],p[1],1.5,.8,HR,'x')})],
  aura:['post',(b,s,c)=>auraFx(b,H(c),0)],
  dhorns:['mid',b=>{[1,-1].forEach(k=>b.tri(17.5+k*4.6,8.8,17.5+k*3.4,2.6,17.5+k*1.2,8.2,[230,218,198],'hat'))}],
  fangs:['front',b=>{b.rect(16,22.5,1,1.5,WH,'x');b.rect(19,22.5,1,1.5,WH,'x')}],
  // sau khi viền
  qmark:['post',b=>{[".##.","#..#","...#","..#.","..#.","....","..#."].forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='#')b.set(30+i,1+j,[200,120,90],'x')})}],
  sparks:['post',(b,s,c)=>{[[2,9],[3,10],[2,11],[33,22],[34,23],[33,24],[1,27],[2,28]].forEach(p=>b.set(p[0],p[1],H(c),'x'))}],
};

/* ---------- mèo dựng trên khung Xoài: xem js/catkit.js ---------- */
// thông số bước chân của ngoại hình s nếu CatKit dựng được, ngược lại null (game vẽ kiểu cũ)
function sheetOf(s){return typeof CatKit!=='undefined'?CatKit.sheetOf(s):null}
/* ---------- vẽ mèo kiểu cũ: lưới 36x40, chân chạm hàng 38 ---------- */
// legacy=true: luôn vẽ kiểu cũ (dùng cho hoạt ảnh gacha, giữ nguyên như trước)
function cat(s,pose,legacy){
  if(!legacy&&typeof CatKit!=='undefined'){const kb=CatKit.render(s,pose);if(kb)return kb}
  if(sidePose(pose||''))return side(s,pose);
  const b=new Buf(36,40),col=colorer(s),M=x=>35-x,sym=f=>{f(x=>x);f(M)};
  const parts=Array.isArray(s.cos)?s.cos:[],oldP=parts.find(p=>p[0]==='old'),old=typeof s.cos==='string'?(COS[s.cos]||{}):oldP?(COS[oldP[1]]||{}):{}; // ['old', tên]: dùng bộ kiểu cũ trong COS rồi vẽ thêm các bộ phận khác
  const flag={};parts.forEach(p=>{if(p[0]==='flag')flag[p[1]]=1});if(old.noEars)flag.noEars=1;
  const run=st=>{if(old[st])old[st](b,s);parts.forEach(p=>{const d=P[p[0]];if(d&&d[0]===st)d[1](b,s,...p.slice(1))})};
  // tư thế: [chân trước trái, chân trước phải, kiểu đuôi]
  const PZ={sitt:[0,0,1]},pz=PZ[pose]||[0,0,0],tm=pz[2];
  const gi=/^groom\d$/.test(pose||'')?+pose.slice(5):-1,groom=gi>=0;
  const long=s.fur===1,closed=/^sleep/.test(pose||'')||pose==='sitb'||s.closed||groom;
  run('back');
  const tl=s.tail||'n';
  if(tl==='n'){b.ell(28,33.5,3.2,4,col,'tail');if(tm===2)b.ell(29.2,26.6,2,4.2,col,'tail');else b.ell(29.6+(tm?.9:0),28.5,2,2.7,col,'tail')}
  else if(tl==='fluff'){b.ell(28.5,32.5,4.6,5,col,'tail');b.ell(30.2+(tm===1?.9:0),26.5-(tm===2?2:0),3,3.6+(tm===2?1:0),col,'tail')}
  else if(tl==='bob')b.ell(26.6,34,2.4,2.4,col,'tail');
  b.ell(10.5,36.3+pz[1],2.8,1.7,col,'body');b.ell(24.5,36.3+pz[0],2.8,1.7,col,'body');
  b.ell(17.5,30.5,(long?8.2:7.3)+(pose==='sleep1'?.7:0),7,col,'body',(x,y)=>y<=37);
  b.ell(17.5,30.5,4,5,col,'chest',(x,y)=>y<=35);
  if(long)b.ell(17.5,26.5,6.5,2.6,col,'chest');
  if(!groom)b.ell(14.6,36.2+pz[0],2.3,1.9,col,'paw');b.ell(20.4,36.2+pz[1],2.3,1.9,col,'paw');
  const sep=dk(col(17,33,'body'),.4);
  [36,37].forEach(y=>{b.set(17,y,sep,'x');b.set(18,y,sep,'x')});
  const ear=s.ear||'n',inE=mix(col(9,8,'ear'),PINK,.8);
  if(!flag.noEars)sym(m=>{
    if(ear==='fold'){b.ell(m(10),10.2,3.4,2.1,col,'ear');return}
    const g=ear==='big'?[6.5,2.5,6.5,14,16,9.5]:ear==='small'?[10,7,7.5,14,14.5,10.5]:ear==='curl'?[11,4,7,13.5,15,9.5]:[8.5,4.5,7,14,15.5,9.5];
    b.tri(m(g[0]),g[1],m(g[2]),g[3],m(g[4]),g[5],col,'ear');
    b.tri(m(g[0]+1.3),g[1]+3.2,m(g[2]+2),g[3]-2.5,m(g[4]-2.8),g[5]+.6,inE,'x');
  });
  b.ell(17.5,17,s.flat?11:10.5,8.5,col,'head');
  if(long)sym(m=>b.ell(m(8.4),21.2,3,3.2,col,'head'));
  if(ear==='fold')sym(m=>b.rect(Math.min(m(8),m(11)),11,4,1,dk(col(9,11,'head'),.3),'x'));
  run('mid');
  const my=s.flat?20:21;
  if(!flag.noMuz)b.ell(17.5,my,4.2,2.8,col,'muz');
  if(!flag.noFace){
    const eye=(x0,ic)=>drawEye(b,x0,17,ic,closed,s.gem?(s.lash?2:1):0);
    eye(12,hex(s.eye||'#f59ab0'));eye(22,hex(s.eye2||s.eye||'#f59ab0'));
    const ny=my-1;
    drawNose(b,17.5,ny,!flag.noMuz);
    sym(m=>b.ell(m(9.5),my-.5,.8,.65,PINK,'x'));
    const tc=dk(col(20,36,'paw'),.28);[groom?null:14.6,20.4].forEach(px=>{if(px)[-.6,.6].forEach(d=>{b.dot(px+d,36.75,tc,'paw');b.dot(px+d,37.25,tc,'paw')})});
    b.rect(10,36+pz[1],2,1,PINK,'x');b.rect(24,36+pz[0],2,1,PINK,'x');
  }
  if(groom){
    const gy=[24.6,23.8,23,23.8][gi],sepc=dk(col(13,30,'body'),.42),pc=col(14,36,'paw'),tc2=dk(pc,.3);
    b.cap(11.6,32,13.3,gy+1.2,2.2,sepc,'x');b.ell(13.5,gy,2.7,2.5,sepc,'x');   // nét tách mảnh quanh cẳng chân
    b.cap(11.6,32.3,13.3,gy+1.2,1.7,pc,'paw');b.ell(13.5,gy,2.2,2,pc,'paw');      // cẳng chân và bàn chân cùng màu lông
    [-.75,.75].forEach(d=>{b.dot(13.5+d,gy-1.75,tc2,'paw');b.dot(13.5+d,gy-1.25,tc2,'paw')}); // vạch ngón
    if(gi===2&&!flag.noFace)b.rect(15,22,2,1,[245,130,140],'x');                  // lưỡi
  }
  if(s.pat==='hairless'||s.hl){const wr=dk(hex(s.c),.25);b.rect(15,11,6,1,wr,'x');b.rect(16,13,4,1,wr,'x')}
  run('front');
  const sh=s.short?2:0;
  if(sh)b.cutRows(29,sh); // giống chân ngắn: bớt 2 hàng thân để dáng ngồi thấp hơn
  b.pastel(.06);
  b.shade(.14);
  b.outline(OC);
  [[19,-1],[22,1]].forEach(w=>{wsk(b,5.25,w[0]+sh,-1,w[1]);wsk(b,29.75,w[0]+sh,1,w[1])});
  if(ear==='tuft')sym(m=>{b.set(m(8),3+sh,OC,'o');b.set(m(7),2+sh,OC,'o')});
  run('post');
  if(s.rare)[[2,9+sh],[33,6+sh],[34,29],[1,31]].forEach((p,i)=>spark(b,p[0]+.5,p[1]+.5,i%2?[255,236,150]:[255,255,255]));
  return b;
}

/* ---------- nội thất ---------- */
const PUR=[168,146,214],WOOD=[232,204,160],WOOD2=[200,168,120],CRMF=[250,242,226],DWOOD=[170,124,86],GRN=[110,180,120],GRN2=[140,206,146];
const C=(a,i,d)=>a&&a[i]!=null&&a[i]!==''?H(a[i]):d; // màu tham số, có mặc định
const FART={
  box(b){b.rect(1,7,28,14,[214,172,116]);b.rect(1,4,28,4,[232,198,144]);b.rect(4,5,22,2,[150,104,70],'x');b.rect(14,8,2,13,CRMF,'x')},
  yarn(b){b.ell(6.5,6.5,5.5,5.5,[250,130,156]);b.line(3,5,10,5,[255,196,208],'x');b.line(3,8,10,8,[255,196,208],'x');b.line(11,10,13,12,[250,130,156])},
  mouse(b){b.ell(6,5.2,4.6,3,[176,182,196]);b.ell(4,2.6,1.6,1.6,PINK);b.line(10,6,13,4,PINK);b.set(3,5,EY,'x')},
  picture(b){FART.pic(b,0,['#e8c690','#fff8ec','fish','#96c4fa'])},
  pic(b,v,a){b.rect(1,1,22,18,C(a,0,[232,198,144]));b.rect(3,3,18,14,C(a,1,[255,248,236]),'x');const c=C(a,3,[150,196,250]),k=a[2];
    if(k==='fish'){b.ell(11,10,5,3,c,'x');b.tri(15,10,19,7,19,13,c,'x');b.set(8,9,EY,'x')}
    if(k==='paw'){b.ell(12,12,3.4,2.8,c,'x');[[8,8],[11,6],[14,6],[17,8]].forEach(p=>b.rect(p[0],p[1],2,2,c,'x'))}
    if(k==='moon'){b.ell(12,10,5,5,c,'x');b.ell(14,9,4,4,C(a,1,WH),'x');[[6,6],[17,14],[8,14]].forEach(p=>b.set(p[0],p[1],c,'x'))}
    if(k==='heart'){b.ell(9.5,8.5,2.6,2.6,c,'x');b.ell(14.5,8.5,2.6,2.6,c,'x');b.tri(7,9,17,9,12,15,c,'x')}},
  bed(b,v,a){b.ell(22,12,21,6,C(a,0,PUR));b.ell(22,9,17,5,C(a,1,[255,220,228]));b.ell(22,9,11,2.5,lt(C(a,1,[255,220,228]),.5),'x')},
  cushion(b,v,a){const c=C(a,0,PUR);b.ell(12,5.5,11,4,c);b.ell(12,4.5,7,2,lt(c,.4),'x')},
  basket(b,v,a){b.ell(17,9,16,6.4,[206,164,112]);for(let x=3;x<32;x+=4)b.rect(x,9,1,5,[170,128,84],'x');b.ell(17,7,12,3.8,C(a,0,PINK),'x')},
  plant(b,v,a){b.ell(10,14,4,12,C(a,0,GRN));b.ell(5,17,3,8,C(a,1,GRN2));b.ell(15,16,3,9,C(a,1,GRN2));b.rect(5,26,10,9,C(a,2,[250,246,238]));b.rect(4,25,12,2,dk(C(a,2,[250,246,238]),.12))},
  flower(b,v,a){b.rect(7,9,2,9,GRN);b.ell(4.5,13,2.5,1.5,GRN2);b.ell(8,6,5,5,C(a,0,PINK));b.rect(7,5,2,2,[250,210,90],'x');b.rect(4,17,8,8,C(a,1,[230,150,110]));b.rect(3,16,10,2,lt(C(a,1,[230,150,110]),.25))},
  cactus(b){b.ell(7,10,3,8,GRN);b.ell(3,10,1.8,3.5,GRN2);b.ell(11,8,1.8,3,GRN2);[[6,5],[8,9],[6,13]].forEach(p=>b.set(p[0],p[1],WH,'x'));b.rect(3,17,8,6,[230,150,110]);b.set(7,2,PINK,'x')},
  bonsai(b){b.rect(5,20,16,5,[130,110,160]);b.rect(3,19,20,2,[150,130,180]);b.line(13,19,11,12,[150,104,70]);b.line(12,19,10,12,[150,104,70]);b.line(11,13,17,9,[150,104,70]);b.ell(8,8,6,4,GRN);b.ell(18,7,5,3.4,GRN2);b.ell(12,4,4,2.6,GRN2)},
  peach(b){b.rect(9,36,10,7,[200,90,80]);b.rect(8,35,12,2,[226,120,100]);b.rect(13,16,3,20,[150,104,70]);b.line(14,22,6,14,[150,104,70]);b.line(14,20,22,12,[150,104,70]);
    b.ell(14,10,12,9,[250,180,196]);[[6,8],[12,4],[18,9],[22,13],[9,14],[15,12],[20,5]].forEach(p=>b.rect(p[0],p[1],2,2,[240,120,150],'x'));[[10,9],[17,6],[13,15]].forEach(p=>b.set(p[0],p[1],[250,220,110],'x'))},
  xmastree(b){b.rect(13,38,4,7,DWOOD);b.tri(15,4,5,18,25,18,[80,160,110]);b.tri(15,12,3,28,27,28,[80,160,110]);b.tri(15,22,1,39,29,39,[80,160,110]);
    [[10,15],[19,24],[8,34],[16,31],[22,35],[13,23]].forEach((p,i)=>b.rect(p[0],p[1],2,2,i%2?RED:GOLDC,'x'));b.rect(14,1,3,3,GOLDC);b.set(15,0,GOLDC)},
  rug(b,v,a){const w=b.w,h=b.h;b.ell(w/2,h/2,w/2-1,h/2-1,C(a,0,[244,150,170]));b.ell(w/2,h/2,w/2-6,h/2-3.4,C(a,1,[250,178,194]),'x');b.ell(w/2,h/2,w/4,h/5.5,C(a,2,[255,214,222]),'x')},
  rugr(b,v,a){const w=b.w,h=b.h,c1=C(a,0,PUR),c2=C(a,1,WH);b.rect(1,1,w-2,h-2,c1);b.rect(3,3,w-6,1,c2,'x');b.rect(3,h-4,w-6,1,c2,'x');if(a[2])for(let x=8;x<w-6;x+=8)b.rect(x,5,3,h-10,c2,'x');else for(let x=w/4;x<w-4;x+=w/4)b.rect(Math.round(x),4,1,h-8,dk(c1,.15),'x')},
  lamp(b,v,a){const c=C(a,0,[255,232,160]);b.rect(7,14,2,28,WOOD);b.rect(3,42,10,3,PUR);b.rect(3,7,10,7,c);b.rect(5,3,6,4,c);b.rect(4,12,8,1,lt(c,.5),'x')},
  lantern(b,v,a){const c=C(a,0,RED);b.rect(6,0,2,3,DWOOD);b.ell(7,10.5,6,7,c);b.rect(2,7,10,1,GOLDC,'x');b.rect(2,14,10,1,GOLDC,'x');b.rect(6,17,2,4,GOLDC)},
  candles(b){b.rect(1,10,28,3,DWOOD);[4,13,22].forEach((x,i)=>{const h=i===1?7:5;b.rect(x,10-h,3,h,CRMF);b.rect(x+1,8-h,1,2,[255,190,90]);b.set(x+1,7-h,[255,240,160])})},
  neon(b,v,a){const c=C(a,0,[240,106,208]);b.rect(1,1,28,14,[72,62,96]);[[5,4],[9,4],[5,8],[9,8]].forEach(p=>b.set(p[0],p[1],c,'x'));b.rect(5,5,6,3,c,'x');b.rect(14,4,2,8,c,'x');b.rect(18,4,2,8,c,'x');b.rect(18,4,6,2,c,'x');b.rect(18,10,6,2,c,'x')},
  post(b,v,a){const c=C(a,0,PUR);b.rect(1,39,18,4,c);b.rect(7,5,6,34,WOOD);for(let y=7;y<38;y+=3)b.rect(7,y,6,1,WOOD2,'x');b.rect(4,1,12,4,c)},
  tree(b,v,a){const c=C(a,0,PUR);b.rect(4,70,38,5,c);b.rect(20,8,6,62,WOOD);for(let y=10;y<70;y+=3)b.rect(20,y,6,1,WOOD2,'x');b.rect(2,40,30,4,c);b.rect(12,5,26,4,c);b.rect(24,50,18,20,dk(c,.15));b.ell(33,61,5,6,dk(c,.45),'x');b.line(8,44,8,50,WOOD);b.ell(8,52.5,2,2,PINK)},
  tunnel(b,v,a){const c=C(a,0,[134,178,220]);b.rect(6,3,28,13,c);b.ell(6,9.5,5,6.5,c);b.ell(34,9.5,5,6.5,c);b.ell(6,9.5,3.4,4.8,dk(c,.5),'x');for(let x=12;x<32;x+=6)b.rect(x,3,2,13,lt(c,.35),'x')},
  ball(b,v,a){const c=C(a,0,RED);b.ell(4.5,4.5,4,4,c);b.rect(2,4,6,1,WH,'x');b.set(3,2,lt(c,.6),'x')},
  fishtoy(b,v,a){const c=C(a,0,[240,160,80]);b.ell(6,4,5,3,c);b.tri(10,4,14,1,14,7,c);b.set(3,3,EY,'x');b.rect(6,2,1,4,lt(c,.4),'x')},
  shelf(b,v,a){const c=C(a,0,[206,160,116]);b.rect(1,1,38,4,c);b.rect(5,5,2,2,dk(c,.25));b.rect(33,5,2,2,dk(c,.25))},
  bookshelf(b){b.rect(1,9,38,4,[206,160,116]);[[3,RED,7],[6,[110,170,230],8],[9,GOLDC,6],[12,GRN,8],[16,PUR,7],[19,[240,150,110],8]].forEach(p=>b.rect(p[0],9-p[2],3,p[2],p[1]));b.rect(5,13,2,1,DWOOD);b.rect(33,13,2,1,DWOOD)},
  bookcase(b){b.rect(1,1,32,48,[190,144,104]);[4,19,34].forEach(y=>{b.rect(3,y,28,12,[120,86,62],'x');[[4,RED],[7,[110,170,230]],[10,GOLDC],[13,GRN],[17,PUR],[20,[240,150,110]],[24,[150,200,220]],[27,RED]].forEach((p,i)=>b.rect(p[0],y+2+(i%3),3,10-(i%3),p[1],'x'))})},
  window(b,v,a){const k=a&&a[0],sky=k==='night'?[62,70,120]:k==='space'?[40,36,70]:k==='snow'?[200,224,240]:[176,222,250];
    b.rect(1,1,44,34,CRMF);b.rect(4,4,38,28,sky,'x');
    if(k==='night'){b.ell(32,11,4,4,[255,240,180],'x');[[8,8],[14,14],[20,7],[26,20],[10,22]].forEach(p=>b.set(p[0],p[1],WH,'x'));b.rect(4,27,38,5,[50,60,90],'x')}
    else if(k==='space'){b.ell(14,13,5,5,[240,160,80],'x');b.rect(7,13,14,1,[250,220,160],'x');[[26,8],[34,12],[30,22],[10,24],[38,26],[22,18]].forEach(p=>b.set(p[0],p[1],WH,'x'));b.ell(33,24,3,3,[130,190,255],'x')}
    else if(k==='snow'){b.rect(4,26,38,6,WH,'x');[[8,8],[15,12],[27,7],[34,14],[11,19],[30,20],[20,22],[38,9]].forEach(p=>b.set(p[0],p[1],WH,'x'));b.tri(28,26,33,15,38,26,[90,150,110],'x')}
    else{b.ell(13,11,5,2.4,WH,'x');b.ell(17,9,3,2,WH,'x');b.rect(30,23,4,3,PINK,'x');b.set(34,24,[255,196,110],'x');b.rect(4,29,38,3,[160,216,160],'x')}
    b.rect(22,4,2,28,CRMF,'x');b.rect(4,17,38,2,CRMF,'x');b.rect(0,35,46,2,[232,218,196])},
  roundwin(b){b.ell(17,17,16,16,DWOOD);b.ell(17,17,13,13,[196,226,236],'x');b.rect(16,4,2,26,DWOOD,'x');b.rect(4,16,26,2,DWOOD,'x');b.line(8,26,12,10,GRN,'x');b.line(10,26,14,12,GRN,'x');b.ell(24,10,3,3,[250,170,190],'x')},
  sofa(b,v,a){const A=C(a,0,[150,200,190]),D=C(a,1,[128,180,170]),L=C(a,2,[178,220,210]);b.ell(32,10,28,8,A);b.rect(4,10,56,12,A);b.rect(1,12,9,18,D);b.rect(54,12,9,18,D);b.rect(9,17,46,11,L);b.rect(31,17,2,11,A,'x');b.rect(5,30,4,3,DWOOD);b.rect(55,30,4,3,DWOOD);
    if(v==='broken'){[[14,6],[20,8],[40,5],[46,9],[24,20],[42,21]].forEach(p=>{b.line(p[0],p[1],p[0]+3,p[1]+6,dk(A,.45),'x');b.set(p[0]+4,p[1]+3,WH,'x');b.set(p[0]+5,p[1]+4,WH,'x')})}},
  chair(b,v,a){const c=C(a,0,[200,154,106]),s=C(a,1,[226,199,156]);b.rect(3,1,16,15,c);b.rect(6,4,10,8,dk(c,.2),'x');b.rect(1,15,20,5,s);b.rect(2,20,3,9,c);b.rect(17,20,3,9,c)},
  table(b,v,a){const c=C(a,0,[185,138,94]);b.rect(1,5,38,5,c);b.rect(4,10,3,13,dk(c,.15));b.rect(33,10,3,13,dk(c,.15));b.rect(8,3,24,3,C(a,1,CRMF));b.ell(20,2.5,3,2,[240,150,110])},
  kotatsu(b,v,a){const c=C(a,0,RED);b.rect(3,1,38,5,[200,154,106]);b.rect(1,6,42,13,c);for(let x=4;x<40;x+=6)b.rect(x,8,3,3,lt(c,.6),'x');b.rect(1,17,42,2,dk(c,.2),'x');b.ell(22,2,3,1.5,[240,160,80],'x')},
  throne(b){const R=[200,70,90];b.rect(5,3,20,24,GOLDC);b.rect(7,5,16,20,R,'x');b.tri(15,0,9,4,21,4,GOLDC);b.rect(3,26,24,9,R);b.rect(1,22,5,16,GOLDC);b.rect(24,22,5,16,GOLDC);b.rect(4,35,4,9,GOLDC);b.rect(22,35,4,9,GOLDC);b.rect(13,10,4,4,GOLDC,'x')},
  gchair(b,v,a){const c=C(a,0,[72,62,86]),s=C(a,1,RED);b.rect(4,1,14,20,c);b.rect(9,1,4,20,s,'x');b.rect(2,19,18,6,c);b.rect(9,25,4,5,[120,120,140]);b.rect(3,30,16,3,[120,120,140])},
  gdesk(b){const D=[92,80,112];b.rect(1,14,42,4,D);b.rect(3,18,3,11,dk(D,.2));b.rect(38,18,3,11,dk(D,.2));b.rect(12,1,20,11,[60,54,80]);b.rect(14,3,16,7,[110,200,230],'x');b.rect(16,5,4,3,[240,106,208],'x');b.rect(21,12,2,2,[60,54,80]);b.rect(14,13,14,1,[150,150,170],'x');b.rect(33,10,5,4,[240,106,208])},
  tv(b){b.rect(1,1,34,20,[72,62,86]);b.rect(3,3,30,16,[90,150,210],'x');b.rect(3,14,30,5,[110,190,120],'x');b.ell(24,8,3,3,[255,236,150],'x');b.rect(8,10,4,4,[240,150,110],'x');b.rect(15,21,6,3,[72,62,86]);b.rect(6,24,24,4,DWOOD)},
  rocket(b){b.ell(8,15,5,11,WH);b.tri(8,1,3,9,13,9,RED);b.ell(8,13,2.4,2.4,[130,190,255],'x');b.tri(3,20,0,28,5,26,RED);b.tri(13,20,16,28,11,26,RED);b.rect(6,26,4,3,[255,190,90])},
  planet(b,v,a){const c=C(a,0,[240,160,80]);b.rect(10,0,2,3,DWOOD);b.ell(11,9,6,6,c);b.rect(7,7,8,1,lt(c,.4),'x');b.rect(6,11,9,1,dk(c,.2),'x');b.rect(1,9,20,1,[250,220,160]);b.rect(3,10,16,1,[250,220,160])},
  cauldron(b){const D=[80,74,100];b.ell(12,12,11,8,D);b.rect(2,3,20,3,dk(D,.2));b.ell(12,4,8.5,2,[130,220,140],'x');b.rect(4,19,3,3,D);b.rect(17,19,3,3,D);[[8,1],[14,0],[11,2]].forEach(p=>b.set(p[0],p[1],[170,240,170]))},
  banner(b,v,a){const c=C(a,0,RED),c2=C(a,1,GOLDC);b.rect(0,0,14,2,DWOOD);b.rect(1,2,12,22,c);b.tri(1,24,13,24,7,29,c);b.rect(1,9,12,3,c2,'x');b.rect(5,14,4,5,c2,'x')},
  garland(b,v,a){const w=b.w;for(let x=1;x<w-1;x++)b.set(x,1+Math.round(Math.sin(x/w*Math.PI)*3),DWOOD);for(let i=0;i<6;i++){const x=5+i*9,y=3+Math.round(Math.sin((x+2)/w*Math.PI)*3);b.tri(x,y,x+5,y,x+2.5,y+6,C(a,i%2,RED))}},
  wreath(b){for(let y=0;y<20;y++)for(let x=0;x<20;x++){const d=Math.hypot(x-9.5,y-9.5);if(d<=9&&d>=5)b.set(x,y,(x*3+y*5)%7===0?RED:[80,160,110])}b.rect(7,15,6,3,RED,'x');b.rect(9,15,2,5,dk(RED,.25),'x')},
  snowman(b){b.ell(9,20,7.5,7,WH);b.ell(9,10,5,5,WH);b.rect(5,3,8,3,[72,62,86]);b.rect(3,6,12,1,[72,62,86]);b.set(7,9,EY,'x');b.set(11,9,EY,'x');b.rect(8,11,3,1,[240,150,80],'x');b.rect(5,14,8,2,RED,'x');[18,21].forEach(y=>b.set(9,y,EY,'x'))},
  giftpile(b){b.rect(1,7,14,10,RED);b.rect(7,7,2,10,GOLDC,'x');b.rect(13,3,12,14,[110,170,230]);b.rect(18,3,2,14,WH,'x');b.rect(13,8,12,2,WH,'x');b.ell(8,5.5,3,2,GOLDC)},
  banhchung(b){b.rect(1,1,14,10,[110,170,100]);b.rect(7,1,2,10,[240,226,170],'x');b.rect(1,5,14,2,[240,226,170],'x')},
  pumpkin(b){b.ell(10,10.5,9,7,[240,150,70]);b.rect(9,1,2,4,[110,160,90]);[5,10,15].forEach(x=>b.rect(x,5,1,11,[220,124,50],'x'));b.tri(5,8,8,8,6.5,11,EY,'x');b.tri(12,8,15,8,13.5,11,EY,'x');b.rect(6,13,9,2,EY,'x');b.rect(8,13,2,1,[240,150,70],'x');b.rect(12,14,2,1,[240,150,70],'x')},
  clock(b){b.ell(8,8,7,7,DWOOD);b.ell(8,8,5.4,5.4,CRMF,'x');b.rect(8,4,1,5,EY,'x');b.rect(8,8,4,1,EY,'x')},
  mirror(b,v,a){const c=C(a,0,[200,154,106]);b.ell(8,12,7,11,c);b.ell(8,12,5,9,[200,228,240],'x');b.line(5,9,8,6,WH,'x');b.line(6,13,9,10,WH,'x')},
  fountain(b){b.ell(11,17,10,4.4,[170,180,200]);b.ell(11,16,8,3,[150,210,240],'x');b.rect(9,6,4,10,[170,180,200]);b.ell(11,5,5,2.4,[170,180,200]);b.ell(11,4.4,3.4,1.4,[150,210,240],'x');[[6,9],[16,9],[5,12],[17,12]].forEach(p=>b.set(p[0],p[1],[190,230,250]))},
  tank(b){b.rect(3,26,30,3,[190,144,104]);b.rect(5,29,3,14,DWOOD);b.rect(28,29,3,14,DWOOD);b.rect(4,4,28,22,[150,216,240]);b.rect(4,22,28,4,[240,226,180],'x');b.rect(10,10,4,3,[255,190,100],'x');b.set(14,11,[255,190,100],'x');b.rect(21,15,4,3,[255,136,136],'x');b.set(20,16,[255,136,136],'x');b.rect(26,12,2,10,[120,196,126],'x');b.rect(3,2,30,2,[150,140,176]);b.rect(6,6,2,6,[214,242,252],'x')},
  catnip(b){b.ell(10,10,3,7,[120,196,126]);b.ell(5.5,12,2.5,4.5,[150,220,150]);b.ell(14.5,11,2.5,5,[150,220,150]);b.rect(5,19,10,10,[230,150,110]);b.rect(4,17,12,3,[240,174,138])},
  bowl(b,v,a){const w=b.w,m=w/2,c=C(a,0,[160,204,250]),c2=C(a,1,[130,176,236]);b.ell(m,b.h-4,m-1,3.4,c);b.rect(2,b.h-4,w-4,2,c2,'x');b.ell(m,b.h-6.2,m-3,1.6,dk(c2,.25),'x');if(v==='full')b.ell(m,b.h-6.6,m-3,2,[214,160,100],'x')},
  feeder(b,v){const G=[150,196,236],D=[110,150,200];b.rect(4,2,12,14,[236,240,248]);b.rect(3,1,14,2,D);b.rect(6,4,8,9,[200,226,250],'x');b.rect(6,v==='full'?6:10,8,v==='full'?7:3,[214,160,100],'x');b.rect(5,16,10,4,D);b.ell(10,23,9,3.4,G);b.rect(2,23,16,2,D,'x');b.ell(10,21,6,1.6,dk(D,.25),'x');if(v==='full')b.ell(10,20.6,6,2,[214,160,100],'x');b.set(15,17,[110,220,140],'x')},
  tower(b,v,a){const c=C(a,0,PUR),n=a[1]||3,w=b.w,h=b.h,m=w/2;b.rect(4,h-5,w-8,5,c);b.rect(m-3,6,6,h-11,WOOD);for(let y=9;y<h-6;y+=3)b.rect(m-3,y,6,1,WOOD2,'x');
    for(let i=0;i<n-1;i++){const y=h-22-20*i,L=i%2===0;b.rect(L?2:m-4,y,m+2,4,c);b.rect(L?2:m-4,y+4,m+2,1,dk(c,.25),'x');if(i===0){b.line(L?7:w-7,y+5,L?7:w-7,y+10,WOOD);b.ell(L?7:w-7,y+12,2,2,PINK)}}
    b.rect(m-14,5,28,4,c);b.rect(m-14,9,28,1,dk(c,.25),'x');b.rect(m-14,3,3,2,c);b.rect(m+11,3,3,2,c)},
  rack(b){const W=[214,172,120],D=[170,124,86];b.rect(3,4,4,62,D);b.rect(41,4,4,62,D);b.line(7,60,41,10,dk(D,.1));b.rect(3,44,26,4,W);b.rect(19,24,26,4,W);b.rect(1,3,46,4,W);[[3,48,26],[19,28,26],[1,7,46]].forEach(p=>b.rect(p[0],p[1],p[2],1,dk(W,.25),'x'));b.rect(1,62,8,4,D);b.rect(39,62,8,4,D)},
  tallcase(b){const W=[190,144,104],I=[120,86,62];b.rect(1,1,34,83,W);b.rect(0,0,36,2,dk(W,.15));[4,18,32,60,72].forEach((y,k)=>{b.rect(3,y,30,k===2?25:11,I,'x');if(k!==2)[[4,RED],[7,[110,170,230]],[10,GOLDC],[13,GRN],[17,PUR],[20,[240,150,110]],[24,[150,200,220]],[27,RED]].forEach((p,i)=>b.rect(p[0],y+1+((i+k)%3),3,10-((i+k)%3),p[1],'x'))});b.rect(3,56,30,2,dk(W,.1),'x')},
  hammock(b,v,a){const c=C(a,0,GOLDC),D=[170,124,86];b.rect(3,4,3,30,D);b.rect(48,4,3,30,D);b.rect(1,32,8,3,D);b.rect(45,32,8,3,D);for(let x=6;x<=48;x++){const y=10+Math.sin((x-6)/42*Math.PI)*11;b.rect(x,y,1,4,(x>>2)%2?c:lt(c,.45))}b.line(6,7,8,11,WH,'x');b.line(48,7,46,11,WH,'x')},
  treehouse(b){const W=[214,172,120],D=[150,104,70],R=[206,90,84];b.rect(10,52,4,48,D);b.rect(48,52,4,48,D);b.line(14,70,48,96,dk(D,.1));b.rect(2,52,56,4,W);b.rect(2,56,56,1,dk(W,.25),'x');
    b.rect(0,76,16,3,W);b.rect(2,56,2,44,D);[62,69,83,90].forEach(y=>b.rect(2,y,10,1,W,'x'));
    b.rect(24,28,30,24,[236,208,160]);b.ell(33,43,4,6.5,[110,78,60],'x',(x,y)=>y<=51);b.rect(43,34,7,7,[160,204,250],'x');b.rect(46,34,1,7,W,'x');
    b.tri(19,29,39,9,59,29,R);b.rect(34,10,10,3,dk(R,.12));for(let x=22;x<56;x+=5)b.rect(x,26,2,2,dk(R,.2),'x')},
  gtree(b){const T=[150,104,70],L=[110,180,120],L2=[140,206,146],L3=[86,150,104];b.rect(32,22,8,102,T);for(let y=26;y<122;y+=5)b.rect(33+(y%2),y,3,1,dk(T,.2),'x');b.ell(36,121,14,3,dk(T,.1));
    [[16,100,-1],[56,78,1],[16,56,-1],[56,34,1]].forEach((p,i)=>{b.line(36,p[1]+6,p[0],p[1]+2,T);b.line(36,p[1]+7,p[0],p[1]+3,T);b.ell(p[0],p[1]+2,15,4.5,i%2?L2:L);b.ell(p[0]+p[2]*4,p[1]+4.5,9,2.2,L3,'x');b.rect(p[0]-11,p[1],22,2,[214,172,120])});
    b.ell(36,13,22,10,L);b.ell(26,9,10,6,L2);b.ell(46,15,11,6,L2);b.ell(36,20,16,3,L3,'x');b.rect(24,10,24,2,[214,172,120]);[[20,6],[44,5],[52,14],[30,16]].forEach(p=>b.rect(p[0],p[1],2,2,[250,180,196],'x'))},
  stairs(b,v,a){const c=C(a,0,[206,160,116]);[[2,30],[23,18],[44,6]].forEach(p=>{b.rect(p[0],p[1],18,4,c);b.rect(p[0],p[1]+4,18,1,dk(c,.25),'x');b.rect(p[0]+3,p[1]+5,2,3,dk(c,.3));b.rect(p[0]+13,p[1]+5,2,3,dk(c,.3))})},
  bridge(b){const W=[214,172,120],D=[150,104,70];b.rect(1,1,4,14,D);b.rect(75,1,4,14,D);for(let x=5;x<75;x+=5){const y=9+Math.sin((x-5)/70*Math.PI)*2.5;b.rect(x,y,4,3,(x/5)%2?W:dk(W,.12))}b.line(4,3,40,7,WH,'x');b.line(40,7,76,3,WH,'x')},
  gift(b,v){const Cc=v?hex(v):[190,196,206],Rb=lum(Cc)>180?RED:[255,248,236];b.rect(3,11,22,15,Cc);b.rect(1,6,26,6,lt(Cc,.3));b.rect(12,6,4,20,Rb,'x');b.ell(9.5,3.6,3.6,2.6,Rb);b.ell(18.5,3.6,3.6,2.6,Rb);b.rect(13,3,2,3,dk(Rb,.25),'x')},
};
const FSIZE={bowl:[18,10],gift:[28,28]};
function furn(id,v){
  const f=(typeof FURN!=='undefined'&&FURN[id])||{},sz=FSIZE[id]||[f.w,f.h],b=new Buf(sz[0],sz[1]);
  FART[f.art||id](b,v,f.a||[]);b.pastel(.06);b.shade(.12);b.outline([112,74,52]);return b;
}
/* ---------- mèo nhìn ngang (đầu quay trái): dùng khi đi, chạy, nhảy. Lưới 50x40, chân chạm hàng 38 ---------- */
// legs: [chân trước xa, chân trước gần, chân sau xa, chân sau gần], mỗi chân [lệch bàn chân, độ dài]
// Tư thế nhìn ngang. legs: [chân trước xa, chân trước gần, chân sau xa, chân sau gần], mỗi chân [lệch bàn chân, độ dài]
const RX0=9; // nửa chiều dài thân: thân gọn, đầu to sát vai (chibi nhẹ)
const STAND={legs:[[0,7],[0,7],[0,7],[0,7]]};
const RUNK=[ // 4 khung chính của dáng phi; các khung xen giữa được nội suy
  {rx:10.5,ry:5,legs:[[-6,5],[-5,5],[5,5],[6,5]],hx:-1,hy:-1,tail:'back',up:2},
  {rx:9.5,ry:5.6,sl:-.06,legs:[[-3,7],[-1,6],[3,5],[5,4]],tail:'back'},
  {rx:8.3,ry:6.6,legs:[[3,6],[2,6],[-4,6],[-3,6]],hx:1,hy:1,tail:'back',up:1},
  {rx:9.5,ry:5.6,sl:.06,legs:[[-1,5],[1,4],[1,7],[3,7]],tail:'back'}];
const CROUCH={rx:9.5,cy:3,ry:5,sl:-.1,legs:[[-1,5],[1,5],[0,5],[1,5]],hy:3,tail:'low'};
const LEAPU={rx:11,ry:4.8,sl:.2,legs:[[-6,4],[-5,4],[5,5],[6,5]],hx:-1,hy:-3,tail:'back',up:3};
const LEAPD={rx:11,ry:4.8,sl:-.18,legs:[[-5,6],[-4,6],[5,4],[6,4]],hx:-1,hy:2,tail:'up',up:2};
const LAND={rx:9,ry:5.6,sl:-.12,cy:1,legs:[[-1,6],[0,6],[3,4],[4,4]],hy:2,tail:'up'};
const lerpQ=(a,b,t)=>{const L=(k,d)=>(a[k]??d)+((b[k]??d)-(a[k]??d))*t;
  return {rx:L('rx',RX0),ry:L('ry',6),sl:L('sl',0),hx:L('hx',0),hy:L('hy',0),up:L('up',0),cy:L('cy',0),rear:L('rear',0),tail:t<.5?a.tail:b.tail,legs:a.legs.map((l,i)=>[l[0]+(b.legs[i][0]-l[0])*t,l[1]+(b.legs[i][1]-l[1])*t])}};
// đi bộ 12 khung: mỗi chân chạm đất 60% chu kỳ rồi nhấc lên đưa về trước; chân trước bên này bước gần như cùng lúc chân sau bên kia
const WPH=[.5,0,.05,.55],WN=12;
function walkQ(i){
  const ph=i/WN,legs=WPH.map(o=>{const p=(ph+o)%1;if(p<.6)return [-3+6*p/.6,7];const u=(p-.6)/.4;return [3-6*u,7-Math.sin(Math.PI*u)*2]});
  return {legs,hx:-1,hy:i%6===3?1:0,sl:.05*Math.sin(ph*4*Math.PI),sway:Math.sin(ph*2*Math.PI)*1.6};
}
// đi 12 khung, chạy 8, thu mình 4, bật nhảy 4, tiếp đất 2
function sidePose(pose){
  let m;
  if(m=/^walk(\d+)$/.exec(pose))return walkQ(+m[1]);
  if(m=/^run(\d)$/.exec(pose)){const i=+m[1];return lerpQ(RUNK[i>>1],RUNK[((i>>1)+1)%4],(i&1)/2)}
  if(m=/^crouch(\d)$/.exec(pose))return Object.assign({},CROUCH,{rear:[0,1,0,-1][+m[1]]});
  if(m=/^leap(\d)$/.exec(pose))return lerpQ(LEAPU,LEAPD,+m[1]/3);
  if(pose==='land0')return LAND;
  if(pose==='land1')return lerpQ(LAND,STAND,.55);
  if(pose==='stand')return STAND;
  return null;
}
function shEll(b,cx,cy,rx,ry,sl,col,reg){
  const m=Math.abs(sl)*rx+1,RX=rx+.25,RY=ry+.25;
  for(let X=Math.floor((cx-RX)*Q);X<=Math.ceil((cx+RX)*Q)+1;X++)for(let Y=Math.floor((cy-RY-m)*Q);Y<=Math.ceil((cy+RY+m)*Q)+1;Y++){
    const u=(X+.5)/Q-.5,v=(Y+.5)/Q-.5,yy=v-cy-sl*(u-cx);if(((u-cx)/RX)**2+(yy/RY)**2<=1)b.put(X,Y,col,reg(u,v,yy));
  }
}
function sideCol(s){
  const c=hex(s.c),c2=hex(s.c2||s.c),c3=hex(s.c3||s.c2||s.c),W=hex('#fdfaf4'),w=s.w||0,p=s.pat;
  const soft=lum(c)>100?.38:.12,limb=r=>r==='leg'||r==='paw';
  // hoa văn bám theo thân và đầu: toạ độ được trừ đi độ lệch của tư thế (f.hx, f.hy cho đầu; f.by cho thân) nên không "trôi" khi mèo nhún
  const f=(x,y,reg,u0,v0)=>{
    if(u0===undefined){u0=x;v0=y}
    const hd=reg==='head'||reg==='ear'||reg==='muz',u=u0-(hd?f.hx:0),v=v0-(hd?f.hy:f.by);
    if(w>=1&&(reg==='muz'||reg==='chest'))return W;
    if((w>=2||s.mit)&&reg==='paw')return W;
    if(w>=2&&reg==='head'&&v>=20.5&&u<=13.4)return W;
    if(p==='van')return (reg==='tail'||(hd&&v<16.6+Math.sin(u*.9)*.6))?c2:W;
    if(p==='calico'){
      if(reg==='tail')return c3;if(reg==='ear')return u<11.6?c2:c3;
      if(reg==='head'&&v<18.6+(vnoise(u,v,1.6)-.5)*1.2)return u<11.6+(vnoise(u+3,v,1.6)-.5)*1.2?c2:c3;
      if((reg==='body'||reg==='chest')&&u>30.4+(vnoise(u,v+5,1.6)-.5)*1.6)return c2;if(reg==='body'&&u<23.6+(vnoise(u,v+9,1.6)-.5)*1.6)return c3;
      return c;
    }
    if(p==='cow'){if(reg==='tail')return c2;if(reg==='ear')return u>11.6?c2:c;if(reg==='head'&&u>13.4+(vnoise(u,v,1.6)-.5)*1.2&&v<18.6+(vnoise(u+3,v,1.6)-.5)*1.2)return c2;if(reg==='body'&&u>29.4+(vnoise(u,v+5,1.6)-.5)*1.6)return c2;return c}
    if(p==='tortie')return marble(u,v)<.47?c2:c;
    if(p==='nacre')return nacreC(u,v,c);
    if(p==='sheen')return (reg==='ear'||bandC(u+2*v+4.5,9,1.1))?c2:c;
    if(p==='lykoi'){if(reg==='muz'||(reg==='head'&&v>=16.6&&u<16))return c3;return fleck(u,v,.12+vnoise(u,v,2)*.28)?c2:c}
    if(p==='point'){
      if(reg==='ear'||reg==='tail'||limb(reg))return c2;
      if(reg==='head'||reg==='muz'){const m=((u-10)/7.2)**2+((v-21)/6.2)**2;if(m<1)return c2;if(m<1.2)return mix(c,c2,.42)}
      return reg==='chest'?lt(c,.3):c;
    }
    let b=(reg==='muz'||reg==='chest')?lt(c,soft):c;
    if(p==='smoke'&&(reg==='ear'||reg==='tail'||(reg==='head'&&v<16.6+(vnoise(u,v,1.5)-.5)*1.6)||reg==='body'))b=c2;
    if(p==='ticked'){if((reg==='head'&&v<14.6)||reg==='ear')b=dk(c,.18);if(reg==='tail'&&(u>42.4||v<16.6))b=c2;if((reg==='body'||(reg==='head'&&v<14.6))&&fleck(u,v,.15))b=mix(b,c2,.5)}
    if(p==='tabby'||p==='tiger'){
      const T=p==='tiger',P=T?3:4;
      if(reg==='head'&&v<=15.4&&[8,11,14].some(x0=>Math.abs(u-x0-(15.4-v)*.1*(x0-11))<.5))b=c2;   // ba vạch trán hơi xoè
      if(reg==='body'&&bandC(u+(v-27)*.3+P/2,P,clamp01(1.2-(v-23)*.1)))b=c2;                        // vằn thân nghiêng, thon dần về phía bụng
      if(reg==='tail'&&bandC(u+v+1.5,3,1))b=c2;
      if(T&&reg==='leg'&&bandC(v+1.5,3,1))b=c2;
    }
    if(p==='spot'&&(reg==='body'||reg==='tail'||(reg==='head'&&v<15.6))&&spotAt(u,v))b=c2;
    return b;
  };
  f.hx=f.hy=f.by=0;
  return f;
}
const clamp01=t=>Math.max(.35,Math.min(1.05,t));
const RB=[[255,128,128],[255,196,120],[255,240,140],[156,226,150],[140,196,255],[196,160,240]];
const faceZ=(G,x,y)=>((x-(G.hcx-3))/6.5)**2+((y-(G.hcy+1.5))/5)**2<1;
const neck=(b,G,c)=>recolor(b,(x,y,r)=>isBody(r)&&x<=G.cx-G.rx+5,c,'x');
const inHead=(G,u,v)=>((u-G.hcx)/10.3)**2+((v-G.hcy)/8.8)**2<1;
// áo choàng phủ lưng ở góc nhìn ngang: từ x0 tới x1, mép trên bám theo lưng rồi dốc xuống thành đuôi áo, gấu áo thấp dần về phía sau.
// colF(u, v, khoảng cách tới gấu áo, khoảng cách tới mép trước) trả màu từng ô mịn
const drape=(b,G,x0,x1,drop,colF)=>{
  const {cx,cy,rx,ry}=G,xb=cx+rx-1.5,hem=u=>cy+ry+drop+(u-x0)*.1,t0=cy-ry*.55,
    top=u=>u<=xb?cy-ry*Math.sqrt(Math.max(0,1-((u-cx)/rx)**2))-.4:t0+(u-xb)/(x1-xb)*(hem(x1)-t0);
  fine(b,x0,cy-ry-1,x1,hem(x1)+1,(u,v,X,Y)=>{if(u<x0||u>x1||v<top(u)||v>hem(u)||inHead(G,u,v))return;b.put(X,Y,colF(u,v,hem(u)-v,u-x0),'cape')});
};
const backStick=(b,G,c)=>{b.line(G.cx-4,G.cy-4,G.cx+8,G.cy-13,c,'x');b.line(G.cx-3,G.cy-4,G.cx+9,G.cy-13,c,'x')};
// phiên bản rút gọn của trang phục cho góc nhìn ngang: giữ màu áo, tóc, mũ và vài đạo cụ chính
const PS={
  twintails:['back',(b,s,G,c)=>b.ell(G.hcx+8,G.hcy+3,2.6,6.5,H(c),'hair')],
  longhair:['back',(b,s,G,c)=>b.ell(G.hcx+5,G.hcy+2,7.5,9,H(c),'hair')],
  rainbow:['back',(b,s,G)=>RB.forEach((c,i)=>b.rect(G.cx+G.rx-2,G.cy-5+i*2,30,2,c,'x'))],
  breadhead:['back',(b,s,G)=>{b.rect(G.hcx-12,G.hcy-12,24,23,[214,156,96],'hat');b.rect(G.hcx-10,G.hcy-10,20,19,[250,228,180],'hat')}],
  haircap:['mid',(b,s,G,c,y1,jag)=>recolor(b,(x,y,r)=>r==='head'&&y<=G.hcy-4+(jag&&x%4<2?1:0),H(c),'hair')],
  spikes:['mid',(b,s,G,c)=>{const C=H(c),x=G.hcx,y=G.hcy;b.tri(x-8,y-4,x-5,y-13,x-1,y-6,C,'hair');b.tri(x-3,y-6,x+1,y-15,x+5,y-6,C,'hair');b.tri(x+3,y-6,x+7,y-12,x+9,y-3,C,'hair');recolor(b,(X,Y,r)=>r==='head'&&Y<=y-4+(X%4<2?1:0),C,'hair')}],
  hood:['mid',(b,s,G,c)=>each(b,(x,y,r)=>{if((r==='head'||r==='ear'||(r==='x'&&y<G.hcy-3))&&!faceZ(G,x,y))b.set(x,y,H(c),'hood')})],
  fullmask:['mid',(b,s,G,c)=>each(b,(x,y,r)=>{if(r==='head'||r==='ear'||(r==='x'&&y<G.hcy-3))b.set(x,y,H(c),'head')})],
  faceplate:['mid',(b,s,G,c)=>recolor(b,(x,y,r)=>(r==='head'||r==='hood')&&faceZ(G,x,y),H(c),'head')],
  strawhat:['mid',(b,s,G)=>{const Y=[244,214,120];b.ell(G.hcx,G.hcy-8,12.5,2.2,Y,'hat');b.ell(G.hcx,G.hcy-11,7,3.8,Y,'hat');b.rect(G.hcx-7,G.hcy-10,15,2,RED,'x')}],
  pointhat:['mid',(b,s,G,c)=>{b.ell(G.hcx,G.hcy-8,12.5,2.2,H(c),'hat');b.tri(G.hcx-6,G.hcy-8,G.hcx+3,G.hcy-19,G.hcx+6,G.hcy-8,H(c),'hat')}],
  tricorn:['mid',(b,s,G)=>{const C=[92,80,112];b.ell(G.hcx,G.hcy-8,11,2.1,C,'hat');b.ell(G.hcx,G.hcy-11,6.5,3.6,C,'hat');b.rect(G.hcx-8,G.hcy-8,17,1,GOLDC,'x')}],
  headband:['mid',(b,s,G,c,plate)=>{recolor(b,(x,y,r)=>(r==='head'||r==='hair')&&(y===G.hcy-4||y===G.hcy-3),H(c),'x');if(plate)b.rect(G.hcx-7,G.hcy-5,6,3,[205,210,222],'x')}],
  leaf:['mid',(b,s,G)=>{b.ell(G.hcx,G.hcy-9,3.4,1.7,[130,196,120],'hat');b.rect(G.hcx,G.hcy-8,1,2,[110,160,100],'hat')}],
  buns:['mid',(b,s,G,c)=>b.ell(G.hcx+6,G.hcy-9,3,3,H(c),'hair')],
  horns:['mid',(b,s,G,c)=>{b.rect(G.hcx-6,G.hcy-10,3,3,H(c),'hat');b.rect(G.hcx+4,G.hcy-10,3,3,H(c),'hat')}],
  crown:['mid',(b,s,G)=>{const x=G.hcx,y=G.hcy;b.rect(x-5,y-11,10,4,GOLDC,'hat');b.rect(x-5,y-14,2,3,GOLDC,'hat');b.rect(x-1,y-15,2,4,GOLDC,'hat');b.rect(x+3,y-14,2,3,GOLDC,'hat');b.rect(x-1,y-10,2,2,RED,'x')}],
  chefhat:['mid',(b,s,G)=>{const C=[252,252,255],x=G.hcx,y=G.hcy;b.ell(x,y-13,6,3.6,C,'hat');b.rect(x-5,y-11,10,4,C,'hat');b.rect(x-5,y-8,10,1,[214,216,228],'x')}],
  phones:['mid',(b,s,G)=>{const D=[92,92,120],x=G.hcx,y=G.hcy;b.rect(x-3,y-10,9,2,D,'hat');b.ell(x+5,y-1,2.6,4,D,'hat');b.rect(x+5,y-2,1,3,[130,230,230],'x')}],
  suit:['front',(b,s,G,c,top,paws)=>recolor(b,(x,y,r)=>isBody(r)||(paws&&(r==='leg'||r==='paw')),H(c))],
  checker:['front',(b,s,G,c1,c2)=>recolor(b,(x,y,r)=>isBody(r),(x,y)=>((x>>1)+(y>>1))%2?H(c1):H(c2))],
  tripat:['front',(b,s,G,c1,c2)=>recolor(b,(x,y,r)=>isBody(r),(x,y)=>(x+2*y)%6===0?WH:(y>G.cy+1?H(c2):H(c1)))],
  sides:['front',(b,s,G,c)=>recolor(b,(x,y,r)=>r==='body',H(c))],
  poptart:['front',(b,s,G)=>{recolor(b,(x,y,r)=>isBody(r),[244,206,160]);recolor(b,(x,y,r)=>isBody(r)&&Math.abs(y-G.cy)<G.ry-1.5&&Math.abs(x-G.cx)<G.rx-2.5,(x,y)=>(x*7+y*13)%11===0?[236,80,160]:[255,170,206],'x')}],
  cape:['front',(b,s,G,c)=>{recolor(b,(x,y,r)=>r==='body'&&x>=G.cx-5,H(c));b.tri(G.cx+G.rx-4,G.cy-4,G.cx+G.rx+4,G.cy+4,G.cx+G.rx-4,G.cy+4,H(c),'cape')}],
  belly:['front',(b,s,G,c)=>recolor(b,(x,y,r)=>r==='chest',H(c))],
  collar:['front',(b,s,G,c)=>neck(b,G,H(c))],scarf:['front',(b,s,G,c)=>neck(b,G,H(c))],sailor:['front',(b,s,G,c)=>neck(b,G,H(c))],
  bow:['front',(b,s,G,c)=>neck(b,G,H(c))],tie:['front',(b,s,G,c)=>neck(b,G,H(c))],cravat:['front',(b,s,G)=>neck(b,G,WH)],
  sword:['front',(b,s,G)=>backStick(b,G,[205,210,222])],saber:['front',(b,s,G,c)=>backStick(b,G,H(c))],staff:['front',(b,s,G,c)=>backStick(b,G,H(c))],
  glasses:['front',(b,s,G,c)=>{const C=H(c||'#4a3f55');[G.hcx-5.5,G.hcx+1.5].forEach(cx=>ring(b,cx,G.hcy,2.25,2.75,.6,C,'x'));b.rect(G.hcx-3.5,G.hcy-.75,1,.5,C,'x')}],
  shades:['front',(b,s,G)=>{b.rect(G.hcx-8,G.hcy-2,11,3,[70,60,90],'x');b.set(G.hcx-7,G.hcy-1,WH,'x')}],
  blindfold:['front',(b,s,G,c)=>recolor(b,(x,y,r)=>(r==='head'||r==='hair'||r==='x')&&y>=G.hcy-2&&y<=G.hcy+1&&x<=G.hcx+9,H(c),'x')],
  lenses:['front',(b,s,G,c)=>{b.ell(G.hcx-6,G.hcy,1.3,1.3,H(c),'x');b.ell(G.hcx+1,G.hcy,1.3,1.3,H(c),'x')}],
  cheeks:['front',(b,s,G,c)=>b.rect(G.hcx+3,G.hcy+2,3,2,H(c),'x')],
  eartips:['front',(b,s,G,c)=>recolor(b,(x,y,r)=>r==='ear'&&y<=G.hcy-9,H(c))],
  tailbase:['front',(b,s,G,c)=>recolor(b,(x,y,r)=>r==='tail'&&x<=G.cx+G.rx+3&&y>=G.cy-5,H(c))],
  beard:['front',(b,s,G,c)=>b.ell(G.hcx-2,G.hcy+7,4.5,4,H(c),'x',(x,y)=>y>=G.hcy+4)],
  bamboo:['front',(b,s,G)=>{b.rect(G.hcx-7,G.hcy+3,7,2,[166,210,146],'x');b.rect(G.hcx-7,G.hcy+3,1,2,[120,170,110],'x')}],
  marks:['front',(b,s,G)=>{[0,1.8,3.6].forEach(k=>b.cap(G.hcx+3,G.hcy+.6+k,G.hcx+5.8,G.hcy+.2+k*1.25,.3,EY,'x'))}],
  scar:['front',(b,s,G,k)=>{if(k==='bolt'){const x=G.hcx,y=G.hcy;b.cap(x-1.7,y-6.5,x-2.9,y-5,.3,RED,'x');b.cap(x-2.9,y-5,x-1.7,y-4.7,.3,RED,'x');b.cap(x-1.7,y-4.7,x-2.8,y-3,.3,RED,'x')}if(k==='tanjiro')b.rect(G.hcx-6,G.hcy-6,3,2,[176,70,76],'x')}],
  helmet:['front',(b,s,G)=>{fine(b,G.hcx-13,G.hcy-14,G.hcx+13,G.hcy+13,(u,v,X,Y)=>{const d=Math.hypot(u-G.hcx,v-G.hcy+1);if(d<=12.85){if(d>11.7)b.put(X,Y,[196,230,248],'x');else b.put(X,Y,[170,225,255,60],b.regF(X,Y)||'x')}});}],
  vhelm:['mid',(b,s,G)=>{const x=G.hcx,y=G.hcy;
    each(b,(X,Y,r)=>{if(r==='head'||r==='ear'||(r==='x'&&Y<y-3))b.set(X,Y,VK,r==='ear'?'ear':'head')});
    b.ell(x+2.5,y+6,9.6,3.3,VK,'head');
    b.cap(x-5.5,y-5.2,x-1,y-7.2,.4,VHL,'x');b.cap(x-9.2,y-2.4,x+4,y-3.2,.32,[84,78,102],'x')}],
  vface:['front',(b,s,G)=>{const x=G.hcx,y=G.hcy;
    b.ell(x-3,y+2,5.8,4,[62,57,76],'head');
    [x-5.5,x+1.5].forEach(cx=>{b.ell(cx,y,1.75,1.45,VSI,'x');b.ell(cx,y,1.2,.95,VGL,'x');b.dot(cx-.75,y-.25,[255,206,196],'x');b.dot(cx+.25,y+.25,[176,52,58],'x')});
    vgrille(b,x-2.5,y+4,3,1.5)}],
  vsuit:['front',(b,s,G)=>{const {cx,cy,rx}=G;
    drape(b,G,cx-5,cx+rx+5,.2,(u,v,d)=>d<.75?VLN:VK2);
    b.rect(cx-7,cy+2,1,1,VRD,'x');b.rect(cx-5.5,cy+2,1,1,[96,176,255],'x');
    b.cap(cx-2,cy-5,cx+9,cy-14.5,.95,[255,72,72],'x');b.cap(cx-2,cy-5,cx+9,cy-14.5,.4,[255,228,228],'x');b.cap(cx-4,cy-3.4,cx-2.4,cy-4.7,.8,VSI,'x')}],
  nrainbow:['back',(b,s,G,alt)=>{const x0=G.cx+G.rx-2;for(let i=0;x0+i<50;i++){const o=((i>>1)+(G.ph>>1))%2;rbOf(alt).forEach((c,k)=>b.rect(x0+i,G.cy-6+o+k*2,1,2,c,'x'))}}],
  npoptart:['front',(b,s,G,alt)=>{const X0=G.cx+1,Y0=G.cy-.6,hw=G.rx+1.6,hh=G.ry-.2;
    tart(b,X0,Y0,hw,hh,(u,v,X,Y)=>inHead(G,u,v)||b.regF(X,Y)==='ear',alt);
    if(!alt)[[-3.25,-2.75,0],[.75,-3.25,1],[5.25,-2.25,0],[8.25,-.75,1],[-1.25,-.25,1],[3.25,.75,0],[7.25,2.25,0],[-.25,2.75,0],[4.75,3.25,1],[-5.25,1.25,1]].forEach(p=>{const u=X0+p[0],v=Y0+p[1];if(!inHead(G,u-1.2,v)){b.dot(u,v,p[2]?SPRK2:SPRK,'x');b.dot(u+.5,v,p[2]?SPRK2:SPRK,'x')}})}],
  // Hoàng Gia nhìn ngang: vương miện ba chóp đính ngọc, áo choàng nhung đỏ viền lông chồn trắng đốm đen và chỉ vàng, cổ áo lông có khuy vàng
  rcrown:['mid',(b,s,G)=>{const x=G.hcx,y=G.hcy-8;
    b.ell(x,y-3,4.2,2.2,[188,42,66],'hat');
    b.tri(x-5.5,y-2,x-4.3,y-5.2,x-2.3,y-2,GOLDC,'hat');b.tri(x-2,y-2,x,y-6.2,x+2,y-2,GOLDC,'hat');b.tri(x+2.3,y-2,x+4.3,y-5.2,x+5.5,y-2,GOLDC,'hat');
    b.rect(x-5,y-2.5,11,2.5,GOLDC,'hat');b.rect(x-5,y-.5,11,.5,[214,160,60],'x');
    b.ell(x-4.3,y-5.4,.5,.5,WH,'x');b.ell(x+4.3,y-5.4,.5,.5,WH,'x');b.ell(x,y-6.6,.7,.7,[240,70,96],'x');
    b.rect(x,y-2,1,1,[230,60,80],'x');b.rect(x-3,y-2,1,1,[90,160,255],'x');b.rect(x+3,y-2,1,1,[80,200,130],'x');
    [x-.25,x-3.25,x+2.75].forEach(u=>b.dot(u,y-1.75,WH,'x'))}],
  rcape:['front',(b,s,G)=>{const {cx,cy,rx}=G,x0=cx-5,V=[188,42,66],V2=[156,30,54],GD=[240,196,80],SP=[72,58,70];
    recolor(b,(x,y,r)=>isBody(r)&&x<x0&&y<=cy+2,(x,y,r,u,v)=>hsh(Math.floor(u*2)+7,Math.floor(v*2))<.11?SP:WH,'x');
    drape(b,G,x0,cx+rx+6,1,(u,v,d,du)=>d<1.5?(Math.floor(u)%3===0&&u-Math.floor(u)<.5&&d>.35&&d<1.15?SP:WH):d<2.1||du<.55?GD:(Math.floor(u*2+v)%8===0?V2:V));
    b.ell(x0-.3,cy-2.4,1,1,GD,'x');b.dot(x0-.5,cy-2.5,[230,60,80],'x');b.dot(x0,cy-2.5,[230,60,80],'x')}],
  // --- Goku và Naruto ---
  spk:['back',(b,s,G,c,st)=>spikes2(b,SPKS[st],G.hcx,G.hcy,H(c))],
  gears:['mid',(b,s,G,c)=>recolor(b,(x,y,r)=>r==='ear',H(c),'ear')],
  halo:['post',(b,s,G)=>haloRing(b,G.hcx,Math.max(2.6,G.hcy-13.5),5.6)],
  hcap:['mid',(b,s,G,c,st)=>{const C=H(c),x=G.hcx,y=G.hcy;recolor(b,(X,Y,r)=>r==='head'&&Y<=y-5,C,'hair');BANGS[st].forEach(t=>b.tri(x+t[0],y+t[1],x+t[2],y+t[3],x+t[4],y+t[5],C,'hair'))}],
  ggi:['front',(b,s,G,shiny)=>{const O=shiny?[255,152,48]:GO,BL=shiny?[64,108,226]:GBL,{cx,cy,ry}=G;
    dress(b,s,(r,far)=>isBody(r)?O:r==='leg'?(far?dk(O,.24):O):r==='paw'?(far?dk(BL,.24):BL):r==='tail'?GTAIL:null);
    recolor(b,(x,y,r)=>isBody(r)&&x<=cx-G.rx+4&&y<=cy+1,BL,'x');
    recolor(b,(x,y,r)=>isBody(r)&&x===cx+2,BL,'x');b.ell(cx+2,cy+ry-.6,.9,.9,dk(BL,.3),'x');
    b.ell(cx-3,cy-1.5,1.5,1.5,WH,'x');glyph(b,cx-3,cy-1.5,GK_MARK,NK);
    if(shiny)[[cx+5.5,cy-2.5],[cx-1,cy+3]].forEach(p=>spark(b,p[0],p[1],[255,246,200]));
  }],
  nband:['mid',(b,s,G)=>{const x=G.hcx,y=G.hcy,w=(G.ph>>1)%2;
    b.cap(x+9.4,y-3.6,x+15.5,y-2.2+w,.7,NB,'x');b.cap(x+9.4,y-3.2,x+14.5,y+2-w,.7,NB2,'x');
    recolor(b,(X,Y,r)=>(r==='head'||r==='hair')&&(Y===y-4||Y===y-3),NB,'x');plate(b,x-4.5,y-3.5,3.4)}],
  nsuit:['front',(b,s,G)=>{const {cx,cy,rx}=G;
    dress(b,s,(r,far,x)=>isBody(r)?(x<=cx-rx+8?NK:NO):r==='leg'?(far?dk(NO,.24):NO):r==='paw'?(far?NB2:NB):null);
    b.ell(cx-2.5,cy-1.5,1.1,1.1,[226,60,60],'x');b.dot(cx-2.75,cy-1.75,WH,'x');
    b.rect(cx+4,cy+1.5,2.5,1,[240,236,226],'x');
  }],
  kface:['front',(b,s,G)=>{const x=G.hcx,y=G.hcy;[0,1.8,3.6].forEach(k=>b.cap(x+2.8,y+.6+k,x+6,y+.2+k*1.25,.45,KK,'x'));kEye(b,x-5.5,y);kEye(b,x+1.5,y)}],
  kcloak:['front',(b,s,G)=>{const {cx,cy,rx}=G,x0=cx-6;
    dress(b,s,(r,far)=>isBody(r)?KK:r==='leg'?(far?[34,30,44]:KK):null);
    drape(b,G,x0,cx+rx+6,1.4,(u,v,d,du)=>d<1.9*Math.abs(Math.sin(u*.95+G.ph*.9))?null:du<.6?KY2:d<2.6?KO2:d<4.2?KO1:KY);
    [-2.5,-.5,1.5].forEach(k=>{b.dot(x0+1.25,cy+k,KK,'x');b.dot(x0+1.75,cy+k,KK,'x');b.dot(x0+1.25,cy+k+.5,KK,'x')});
  }],
  hveil:['back',(b,s,G)=>b.ell(G.hcx+5.5,G.hcy+1,6.5,9,HW,'cape')],
  hbangs:['mid',(b,s,G,c)=>{const x=G.hcx,y=G.hcy;[[-7.8,-5,-4.5,-5,-7.4,-1.6],[-4.5,-5,-1,-5,-2.4,-2]].forEach(t=>b.tri(x+t[0],y+t[1],x+t[2],y+t[3],x+t[4],y+t[5],H(c),'hair'))}],
  hhat:['mid',(b,s,G)=>{const x=G.hcx,y=G.hcy-6.5;b.tri(x-8.5,y,x,y-9.5,x+8.5,y,HW,'hat');b.ell(x,y,13,2.2,HW,'hat');b.tri(x-7.5,y+.2,x-1.5,y-7.6,x+1.5,y+.2,HR,'hat');glyph(b,x-2.5,y-2.5,FIRE,WH)}],
  hcloak:['front',(b,s,G)=>{const {cx,rx}=G;
    dress(b,s,(r,far)=>isBody(r)?NO:r==='leg'?(far?dk(NO,.24):NO):r==='paw'?(far?NB2:NB):null);
    neck(b,G,HW2);
    drape(b,G,cx-6,cx+rx+6,1.6,(u,v,d,du)=>d<.4+1.6*Math.abs(Math.sin(u*1.15+.4))?HR:du<.6?HW2:HW);
  }],
  aura:['post',(b,s,G,c)=>auraFx(b,H(c),G.ph+1)],
  dhorns:['mid',(b,s,G)=>{const x=G.hcx,y=G.hcy;b.tri(x-3.4,y-7.6,x-2.4,y-13,x+.4,y-8,[230,218,198],'hat')}],
  fangs:['front',(b,s,G)=>b.rect(G.hcx-4,G.hcy+5,1,1.5,WH,'x')],
  qmark:['post',(b,s,G)=>{[".##.","#..#","...#","..#.","..#.","....","..#."].forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='#')b.set(G.hcx+10+i,G.hcy-17+j,[200,120,90],'x')})}],
};
/* ---------- trang phục hiếm của mèo 5★ (mỗi bé một bộ, xem FORMS và BREED_COATS trong data.js) ----------
   hue: đổi sắc độ của các ô đủ đậm màu (áo choàng đỏ thành tím). inv: đảo sáng tối các ô xám đen (giáp Vader thành trắng).
   Các món vẽ ở lớp 'post' (quả cầu, tia sét, trái Snitch) nằm ngoài viền nâu nên trông như đang phát sáng. */
const rgb2hsv=c=>{const r=c[0]/255,g=c[1]/255,bl=c[2]/255,mx=Math.max(r,g,bl),mn=Math.min(r,g,bl),d=mx-mn;let h=0;if(d){h=mx===r?((g-bl)/d+6)%6:mx===g?(bl-r)/d+2:(r-g)/d+4;h*=60}return [h,mx?d/mx:0,mx]};
const hsv2rgb=(h,s,v)=>{const f=n=>{const k=(n+h/60)%6;return Math.round(255*(v-v*s*Math.max(0,Math.min(k,4-k,1))))};return [f(5),f(3),f(1)]};
const cellsMap=(b,f)=>{for(let i=0;i<b.c.length;i++){const c=b.c[i];if(c&&b.r[i]!=='o'){const n=f(c,b.r[i]);if(n)b.c[i]=c.length===4?[n[0],n[1],n[2],c[3]]:n}}};
const hueP=(b,lo,hi,to,smin,vm,sm)=>cellsMap(b,c=>{const [h,s,v]=rgb2hsv(c);if(s>=(smin||.35)&&(lo<=hi?h>=lo&&h<=hi:h>=lo||h<=hi))return hsv2rgb(to,Math.min(1,s*(sm||1)),Math.min(1,v*(vm||1)))});
// bảng đảo sáng tối cho giáp trắng: nền giáp thành trắng, mặt nạ xám nhạt, các nét gân và viền thành xám xanh đậm, chi tiết kim loại thành thép sẫm
const INVT=[[.12,216],[.19,226],[.225,250],[.30,206],[.40,132],[.49,156],[.67,90],[.85,62]],mewless=(T,v)=>{let i=0;while(i<T.length-2&&v>T[i+1][0])i++;const a=T[i],b=T[i+1],k=Math.max(0,Math.min(1,(v-a[0])/(b[0]-a[0])));return a[1]+(b[1]-a[1])*k};
const invP=b=>cellsMap(b,c=>{const [h,s,v]=rgb2hsv(c);if(s<.32&&v<.92){const L=Math.round(mewless(INVT,v));return [L-8,L-3,Math.min(255,L+4)]}});
const rbOf=alt=>alt?RB.map(c=>mix(c,[44,38,66],.58)):RB;
const inB=(b,X,Y)=>X>=0&&Y>=0&&X<b.W&&Y<b.H;
const glowBall=(b,cx,cy,r,C)=>fine(b,cx-r-2.5,cy-r-2.5,cx+r+2.5,cy+r+2.5,(u,v,X,Y)=>{if(!inB(b,X,Y))return;const d=Math.hypot(u-cx,v-cy);
  if(d<=r)b.put(X,Y,Math.hypot(u-cx+r*.3,v-cy+r*.3)<r*.42?lt(C,.78):d<r*.72?lt(C,.25):C,'x');else if(d<=r+2.2&&!b.c[Y*b.W+X])b.put(X,Y,[C[0],C[1],C[2],d<r+1.1?165:80],'x')});
const zap=(b,pts,C)=>{for(let i=1;i<pts.length;i++)b.cap(pts[i-1][0],pts[i-1][1],pts[i][0],pts[i][1],.34,C,'x')};
const snitchAt=(b,x,y)=>{const W1=[255,255,255],W2=[206,214,236];
  [[-1,1],[1,-1]].forEach(k=>{const s=k[0];b.ell(x+s*2.9,y-1,2.3,.95,W2,'x');b.ell(x+s*2.7,y-1.1,1.9,.6,W1,'x');b.ell(x+s*3.6,y-.1,1.5,.6,W2,'x');b.ell(x+s*3.4,y-.2,1.1,.35,W1,'x')});
  b.ell(x,y,1.5,1.5,[214,160,60],'x');b.ell(x,y-.1,1.15,1.15,[250,206,84],'x');b.dot(x-.5,y-.75,[255,246,196],'x')};
const chadaAt=(b,x,y)=>{const G1=[246,202,86],G2=[206,150,52],G3=[255,240,170];   // mão vàng nhiều tầng kiểu Xiêm, chóp nhọn, đính đá
  b.tri(x-1.05,y-4.9,x+1.05,y-4.9,x,y-8.8,G1,'hat');b.ell(x,y-4.8,1.9,1.05,G1,'hat');b.ell(x,y-3.3,2.9,1.25,G1,'hat');b.ell(x,y-1.5,4.3,1.6,G1,'hat');
  b.rect(x-4.3,y-1.1,8.6,.5,G2,'x');b.rect(x-2.9,y-3.05,5.8,.5,G2,'x');b.rect(x-1.9,y-4.65,3.8,.5,G2,'x');
  [[0,-1.9,[230,60,80]],[-2.6,-1.9,[60,170,220]],[2.6,-1.9,[70,200,130]],[0,-3.8,[60,170,220]]].forEach(q=>b.ell(x+q[0],y+q[1],.55,.55,q[2],'x'));
  b.dot(x-.25,y-7.25,G3,'x');b.dot(x-.25,y-6.75,G3,'x');b.dot(x-1.75,y-2.25,G3,'x');b.dot(x-.75,y-4.25,G3,'x')};
const wreathAt=(b,pts)=>{const LG=[[86,170,96],[58,140,82],[150,206,120]];                       // vòng lá và hoa rừng
  pts.forEach((p,i)=>{b.ell(p[0],p[1],1.5,1,LG[i%3],'hat');b.ell(p[0]+.7,p[1]-.9,1,.75,LG[(i+1)%3],'hat')});
  pts.forEach((p,i)=>{if(i%2===0&&i>0&&i<pts.length-1){b.ell(p[0],p[1]-.2,1,1,i%4===0?[255,255,255]:[255,170,196],'x');b.dot(p[0]-.25,p[1]-.45,[250,206,80],'x');b.dot(p[0]+.25,p[1]-.45,[250,206,80],'x')}})};
const usekhC=(k,j)=>k===1?(j%2?[44,168,172]:[226,74,74]):k===3?[52,104,200]:[246,202,86];        // vòng cổ rộng Ai Cập: vàng, ngọc lam xen đỏ, vàng, xanh lapis
// Tiên nhân Cửu Vĩ: màu áo chakra chuyển dần xuống cam, và các quả cầu đen (Cầu Đạo Ngọc) lơ lửng quanh người
const KO1=[255,196,60],KO2=[255,150,44],kGrad=(x,y,r,u,v)=>v>34.6?KO2:v>31.4?KO1:KY;
const kOrb=(b,x,y)=>{b.ell(x,y,1.45,1.45,[30,26,40],'x');b.ell(x,y,1,1,[52,46,68],'x');b.dot(x-.75,y-.75,[150,140,180],'x')};
Object.assign(P,{
  hue:['front',(b,s,lo,hi,to,sm,vm,sx)=>hueP(b,lo,hi,to,sm,vm,sx)],
  inv:['front',b=>invP(b)],
  astroF:['front',b=>COS.astro.front(b)],
  bolts:['post',(b,s,c)=>{const C=H(c||'#ffe14a');zap(b,[[3.5,16],[5.6,19.6],[3,21.6],[5.4,26]],C);zap(b,[[32,5],[30,8.6],[32.6,10.6],[30.6,15]],C);zap(b,[[31,27],[33.4,30],[31.4,32.4]],C)}],
  orb:['post',(b,s,c)=>glowBall(b,30.6,8.4,2.8,H(c))],
  snitch:['post',b=>snitchAt(b,29.5,7.5)],
  chada:['mid',b=>chadaAt(b,17.5,9.6)],
  usekh:['front',b=>fine(b,8,22,27,32,(u,v,X,Y)=>{const r=b.regF(X,Y);if(!isBody(r))return;const d=Math.hypot(u-17.5,(v-19.4)*1.05);if(d<5.4||d>11)return;
    b.put(X,Y,usekhC(Math.floor((d-5.4)/1.4),Math.floor(Math.atan2(v-19.4,u-17.5)*7)),'x')})],
  wreath:['front',b=>wreathAt(b,[[8.6,12],[10.4,10.2],[12.6,9],[15,8.3],[17.5,8],[20,8.3],[22.4,9],[24.6,10.2],[26.4,12]])],
  malai:['front',b=>{for(let i=0;i<=12;i++){const t=Math.PI*i/12;b.ell(17.5+Math.cos(t)*6.4,24.2+Math.sin(t)*5.6,.8,.8,i%3===1?[255,232,150]:[255,255,255],'x')}
    b.rect(17,31,1,2.6,[246,196,70],'x');b.ell(17.5,30.3,1.6,1.5,[226,60,84],'x');b.dot(17.25,29.75,[255,160,180],'x');b.ell(17.5,34,1.1,1,[240,110,150],'x')}],
});
Object.assign(PS,{
  hue:['front',(b,s,G,lo,hi,to,sm,vm,sx)=>hueP(b,lo,hi,to,sm,vm,sx)],
  inv:['front',b=>invP(b)],
  bolts:['post',(b,s,G,c)=>{const C=H(c||'#ffe14a'),x=G.cx,y=G.cy;zap(b,[[x-1,y-14],[x+1.4,y-11.4],[x-.8,y-9.8],[x+1.4,y-7.6]],C);zap(b,[[x+13,y-9],[x+15.4,y-6],[x+13.4,y-4.2]],C);zap(b,[[G.hcx-11,G.hcy+5],[G.hcx-9,G.hcy+8],[G.hcx-11.4,G.hcy+10]],C)}],
  orb:['post',(b,s,G,c)=>glowBall(b,G.cx+5,G.cy-12.5,2.8,H(c))],
  korbs:['post',(b,s,G)=>[[G.cx+3,G.cy-13.5],[G.cx+9,G.cy-12],[G.cx+14,G.cy-8.5]].forEach(p=>kOrb(b,p[0],p[1]))],
  snitch:['post',(b,s,G)=>snitchAt(b,G.cx+5,G.cy-12)],
  chada:['mid',(b,s,G)=>chadaAt(b,G.hcx+1,G.hcy-7.2)],
  usekh:['front',(b,s,G)=>{const x0=G.cx-G.rx;recolor(b,(x,y,r)=>isBody(r)&&x>=x0&&x<=x0+6,(x,y)=>usekhC(Math.min(3,Math.floor((x-x0)/1.75)),y),'x')}],
  wreath:['front',(b,s,G)=>wreathAt(b,[-152,-132,-112,-90,-68,-48,-28].map(d=>[G.hcx+Math.cos(d*Math.PI/180)*9,G.hcy+Math.sin(d*Math.PI/180)*7.6]))],
  malai:['front',(b,s,G)=>{const x=G.cx-G.rx+3.6;for(let i=0;i<7;i++)b.ell(x+Math.sin(i*.5)*.6,G.cy-5.4+i*1.5,.8,.8,i%3===1?[255,232,150]:[255,255,255],'x');
    b.rect(x-.5,G.cy+4.6,1,2.2,[246,196,70],'x');b.ell(x,G.cy+4.4,1.5,1.4,[226,60,84],'x');b.dot(x-.25,G.cy+3.9,[255,160,180],'x')}],
});
const OLD2={tank:[['suit','#fafaff']],ninja:[['hood','#3e446e'],['headband','#e2484e']],chef:[['chefhat'],['collar','#e2484e']],astro:[['suit','#f2f4fa',0,1],['helmet']],royal:[['flag','proud'],['rcrown'],['rcape']],bread:[['flag','noEars'],['breadhead']],dj:[['phones'],['shades']]};
function side(s,pose){
  const q=sidePose(pose),b=new Buf(50,40),col=sideCol(s),up=q.up||0,low=s.short?3:0;
  // giống chân ngắn: chân ngắn hơn 3 ô, bước ngắn hơn, thân dài và thấp sát đất
  const legs=s.short?q.legs.map(l=>[l[0]*.6,Math.max(2,l[1]-3)]):q.legs,sw=q.sway||0;
  const parts=Array.isArray(s.cos)?s.cos.flatMap(p=>p[0]==='old'?(OLD2[p[1]]||[]):[p]):(OLD2[s.cos]||[]);
  const flag={};parts.forEach(p=>{if(p[0]==='flag')flag[p[1]]=1});
  const cx=25,cy=27+(q.cy||0)-up+low,rx=(q.rx||RX0)+(s.short?1:0),ry=q.ry||6,sl=q.sl||0,rear=q.rear||0;
  // flag proud: ngẩng cao đầu (đầu cao hơn 2 ô và lùi về phía ngực 1 ô). ph: số thứ tự khung, để cầu vồng Nyan gợn sóng theo bước chạy
  const hcx=Math.round(13+(q.hx||0))+(flag.proud?1:0),hcy=Math.round(19+(q.hy||0)-up+low)-(flag.proud?2:0),G={hcx,hcy,cx,cy,rx,ry,ph:+(/\d+$/.exec(pose)||[0])[0]};
  col.hx=hcx-13;col.hy=hcy-19;col.by=cy-27;
  const run=st=>parts.forEach(p=>{const d=PS[p[0]];if(d&&d[0]===st)d[1](b,s,G,...p.slice(1))});
  run('back');
  const tl=s.tail||'n',tm=q.tail||'up',f=tl==='fluff'?1.2:0,tx=cx+rx-1+rear,ty=Math.round(cy+sl*rx-2);
  if(tl==='bob')b.ell(tx+1.5,ty,2.3,2.3,col,'tail');
  else if(tl!=='none'){
    if(tm==='back')b.ell(tx+4.5,ty,5,1.9+f,col,'tail');
    else if(tm==='low')b.ell(tx+4,ty+3,4.5,1.8+f,col,'tail');
    else{b.ell(tx+2.5+sw*.4,ty-3,2+f,5,col,'tail');b.ell(tx+4+sw,ty-8.5,1.9+f,2.6,col,'tail')}
  }
  const HX=[20,17,29+rear,32+rear],far=(x,y,r)=>dk(col(x,y,r),.22);
  const leg=(i,isFar)=>{
    const c=isFar?far:col,hy=cy+sl*(HX[i]-cx)+ry-2,fx=HX[i]+legs[i][0],fy=hy+legs[i][1];
    b.cap(HX[i],hy,fx,fy-2.25,1.5,c,'leg');b.cap(fx,fy-2,fx,fy-1,1.5,c,'paw');b.ell(fx-.75,fy-.25,1.75,.5,c,'paw');
  };
  leg(0,1);leg(2,1);
  shEll(b,cx,cy,rx,ry,sl,col,(x,y,yy)=>yy>ry*.3?'chest':'body');
  leg(1);leg(3);
  const ear=s.ear||'n',eh=ear==='big'?2:ear==='small'?-2:0,inE=mix(col(hcx-5,hcy-8,'ear'),PINK,.8);
  if(!flag.noEars){
    if(ear==='fold'){b.ell(hcx-5,hcy-7.5,3,1.8,col,'ear');b.ell(hcx+4,hcy-8,3,1.8,col,'ear')}
    else{
      b.tri(hcx+5,hcy-12-eh,hcx+1,hcy-7,hcx+8.5,hcy-4.5,col,'ear');
      b.tri(hcx-5,hcy-12-eh,hcx-9,hcy-4,hcx-1,hcy-7.5,col,'ear');
      b.tri(hcx-4.6,hcy-9.5-eh,hcx-6.8,hcy-5.5,hcx-3,hcy-7,inE,'x');
    }
  }
  b.ell(hcx,hcy,10,8.5,col,'head');
  if(s.fur===1)b.ell(hcx+6,hcy+4,3.5,3,col,'head');
  run('mid');
  if(!flag.noMuz)b.ell(hcx-2.5,hcy+3,3.6,2.4,col,'muz');
  const eye=(x0,ic)=>drawEye(b,x0,hcy,ic,s.closed,s.gem?(s.lash?2:1):0);
  if(!flag.noFace){eye(hcx-6,hex(s.eye||'#f59ab0'));eye(hcx+1,hex(s.eye2||s.eye||'#f59ab0'));drawNose(b,hcx-2.5,hcy+2,!flag.noMuz);b.ell(hcx+4.5,hcy+2.5,.8,.65,PINK,'x')}
  else if(!parts.some(p=>p[0]==='lenses')){const ec=s.eye?hex(s.eye):WH;b.rect(hcx-6,hcy-1,2,2,ec,'x');b.rect(hcx+1,hcy-1,2,2,ec,'x')}
  run('front');
  b.pastel(.06);b.shade(.14);b.outline(OC);
  wsk(b,hcx-11.75,hcy+2,-1,-1);wsk(b,hcx-11.75,hcy+5,-1,1);
  if(ear==='tuft'){b.set(hcx-5,hcy-14-eh,OC,'o');b.set(hcx+5,hcy-14-eh,OC,'o')}
  run('post');
  if(s.rare)[[hcx-9,hcy-11],[cx+6,cy-10],[cx+rx+6,cy+4]].forEach((p,i)=>spark(b,p[0]+.5,p[1]+.5,i%2?[255,236,150]:[255,255,255]));
  return b;
}
/* ---------- bộ icon riêng của game: lưới 12x12, cùng kiểu hạt cườm và viền nâu với mèo ---------- */
const IC=(()=>{
  const GO=[248,200,76],GO2=[216,152,44],RD=[228,92,96],PK=[246,154,174],BL=[122,172,232],BL2=[90,136,204],GR=[112,184,124],GR2=[150,212,156],BR=[172,122,86],CR=[253,246,230],GY=[176,182,196],GY2=[136,142,160],DK=[88,70,80],PU=[170,148,216],OR=[242,164,84],TAN=[216,172,118];
  const dot=(b,x,y,c)=>b.rect(x-.5,y-.5,1,1,c,'x');
  const star4=(b,x,y,r,c)=>{b.tri(x,y-r,x-r*.3,y,x+r*.3,y,c);b.tri(x,y+r,x-r*.3,y,x+r*.3,y,c);b.tri(x-r,y,x,y-r*.3,x,y+r*.3,c);b.tri(x+r,y,x,y-r*.3,x,y+r*.3,c)};
  const heart=(b,c)=>{b.ell(3.5,4.3,2.4,2.4,c);b.ell(7.5,4.3,2.4,2.4,c);b.tri(1.1,5.4,9.9,5.4,5.5,10.4,c);b.ell(3,3.6,.8,.6,lt(c,.55),'x')};
  const catHead=(b,c,c2)=>{b.tri(1.2,5.5,1.8,1.2,4.8,3.4,c);b.tri(9.8,5.5,9.2,1.2,6.2,3.4,c);b.tri(2.2,4.4,2.5,2.6,3.8,3.6,PK,'x');b.tri(8.8,4.4,8.5,2.6,7.2,3.6,PK,'x');b.ell(5.5,6.6,4.6,3.8,c);b.ell(5.5,8.2,2,1.4,c2,'x');b.rect(5,7.4,1,.5,[232,110,120],'x')};
  const bowl=(b,c,food)=>{if(food){b.ell(5.5,5.2,3.6,2.2,food);dot(b,4,4.5,dk(food,.3));dot(b,6.5,4,dk(food,.3));dot(b,7.5,5,lt(food,.3))}b.ell(5.5,6,4.8,4,c,undefined,(x,y)=>y>=6);b.rect(.8,5.6,9.4,1,lt(c,.45),'x');b.rect(3.5,9.6,4,.9,dk(c,.2))};
  const fish=(b,c)=>{b.tri(7,5.5,10.6,2.4,10.6,8.6,c);b.ell(4.6,5.5,3.8,2.7,c);b.ell(4,6.4,2.4,1.2,lt(c,.5),'x');dot(b,2.8,4.8,DK);b.rect(5.6,3.6,.5,3.6,dk(c,.2),'x')};
  return {
    coin(b){b.ell(5.5,5.5,4.8,4.8,GO);b.ell(5.5,5.5,3.4,3.4,GO2,'x');b.ell(5.5,5.5,2.9,2.9,[255,226,128],'x');b.tri(3.6,5,3.9,3.4,5,4.4,GO2,'x');b.tri(7.4,5,7.1,3.4,6,4.4,GO2,'x');b.ell(5.5,6,1.9,1.5,GO2,'x')},
    ticket(b){b.rect(.8,3,9.4,6,[252,218,128]);b.rect(.8,3,9.4,1,[255,236,170],'x');for(let y=3.5;y<9;y+=1.5)b.rect(7,y,.5,.75,GO2,'x');star4(b,3.9,6,2.2,RD);b.rect(8.2,5,1.2,2,GO2,'x')},
    cat(b){catHead(b,OR,CR);b.rect(3.4,5.6,1,1.5,DK,'x');b.rect(6.6,5.6,1,1.5,DK,'x');[2.6,5.5,8.4].forEach(x=>b.rect(x-.25,3.2,.5,1.2,dk(OR,.35),'x'))},
    grumpy(b){catHead(b,GY,CR);b.rect(3.2,6.2,1.4,1,DK,'x');b.rect(6.4,6.2,1.4,1,DK,'x');b.line(2.8,5,4.6,5.8,DK,'x');b.line(8.2,5,6.4,5.8,DK,'x')},
    drum(b){b.cap(6.6,6.8,9.2,9.4,.7,CR);b.ell(9.9,9.2,.9,.8,CR);b.ell(9.2,10,.8,.9,CR);b.ell(4.6,4.4,3.8,3.4,[216,150,92]);b.ell(3.6,3.4,1.5,1,[240,190,134],'x');b.ell(6.6,6.4,1.4,1.2,dk([216,150,92],.25),'x')},
    bolt(b){b.tri(7.4,.4,1.8,6.6,5.8,6.6,GO);b.tri(5.2,4.8,9.6,4.8,3.8,10.8,GO);b.line(6.4,2,4,5.4,[255,236,160],'x')},
    smile(b){b.ell(5.5,5.5,4.8,4.8,[252,216,116]);b.rect(3.3,3.8,1,1.6,DK,'x');b.rect(6.7,3.8,1,1.6,DK,'x');b.cap(3.6,7,5.5,8.2,.3,DK,'x');b.cap(5.5,8.2,7.4,7,.3,DK,'x');b.ell(2.4,6.6,.9,.6,PK,'x');b.ell(8.6,6.6,.9,.6,PK,'x')},
    heart(b){heart(b,RD)},
    house(b){b.rect(7.6,1.2,1.4,3,BR);b.rect(1.8,5,7.4,5.6,CR);b.tri(5.5,.4,.2,5.6,10.8,5.6,RD);b.rect(4.6,7.2,1.8,3.4,BR,'x');b.rect(2.6,6.6,1.4,1.4,BL,'x');b.rect(7,6.6,1.4,1.4,BL,'x')},
    gacha(b){b.tri(1.6,3.4,1.9,.3,4.6,1.6,PU);b.tri(9.4,3.4,9.1,.3,6.4,1.6,PU);b.ell(5.5,6,4.8,4.6,CR);b.ell(5.5,6,4.8,4.6,PU,undefined,(x,y)=>y<=5);b.rect(1,5.1,9,1,GO2,'x');b.ell(5.5,5.6,1.7,1.7,GO2,'x');b.ell(5.5,5.6,1.1,1.1,[255,236,150],'x');b.ell(3.4,3.2,1.1,.7,lt(PU,.55),'x');star4(b,8,8.6,1.3,PK)},
    pack(b){b.cap(4,1.6,7,1.6,.5,DK);b.ell(5.5,6.4,4.2,4.4,[116,176,146]);b.rect(1.6,4.2,7.8,1,[92,150,124],'x');b.rect(3.4,6.8,4.2,3,[92,150,124],'x');b.rect(3.4,6.8,4.2,.7,[146,204,176],'x');b.rect(5,5,1,1.2,GO,'x')},
    sofa(b){b.ell(5.5,4.6,4.4,3,PU);b.rect(1.4,5.6,8.2,4,PU);b.ell(1.5,7,1.4,2.2,dk(PU,.18));b.ell(9.5,7,1.4,2.2,dk(PU,.18));b.rect(2.8,6.6,5.4,2,lt(PU,.45),'x');b.rect(5.3,6.6,.4,2,PU,'x');b.rect(1.8,10,1.2,1,BR);b.rect(8,10,1.2,1,BR)},
    book(b){b.rect(1.8,1,7.8,9.8,BL);b.rect(1.8,1,1.6,9.8,BL2,'x');b.rect(3.4,9.2,6.2,1.6,CR,'x');b.ell(6.4,4.2,1.3,1.1,CR,'x');[[5,2.4],[6.4,2],[7.8,2.4]].forEach(p=>b.ell(p[0],p[1],.5,.6,CR,'x'))},
    gear(b){b.rect(4.5,.4,2,10.2,GY);b.rect(.4,4.5,10.2,2,GY);b.cap(2.2,2.2,8.8,8.8,1,GY);b.cap(8.8,2.2,2.2,8.8,1,GY);b.ell(5.5,5.5,3.5,3.5,GY);b.ell(5.5,5.5,2.4,2.4,lt(GY,.4),'x');b.ell(5.5,5.5,1.3,1.3,DK,'x')},
    lock(b){b.cap(3.1,5.4,3.1,3.4,.65,GY);b.cap(7.9,5.4,7.9,3.4,.65,GY);b.cap(3.1,3.4,5.5,1.3,.65,GY);b.cap(5.5,1.3,7.9,3.4,.65,GY);b.rect(1.4,5.2,8.2,5.6,GO);b.rect(1.4,5.2,8.2,1,[255,226,128],'x');b.ell(5.5,7.6,.9,.9,DK,'x');b.rect(5.15,7.8,.7,1.8,DK,'x')},
    sparkle(b){star4(b,4.6,5.2,4.4,[255,226,120]);star4(b,9,2.4,1.8,[255,244,190]);star4(b,8.8,9,1.5,[255,244,190])},
    gem(b){const C=[126,204,242],L=[186,232,252],D=[86,160,216];b.rect(3,1.4,5,2.8,L);b.tri(.6,4.2,3,1.4,3,4.2,C);b.tri(10.4,4.2,8,1.4,8,4.2,C);b.tri(.6,4.2,10.4,4.2,5.5,10.8,C);b.tri(3.4,4.2,7.6,4.2,5.5,10.2,L,'x');b.tri(7.6,4.2,10,4.2,5.9,10,D,'x')},
    door(b){b.rect(2.2,.8,6.6,10.2,BR);b.rect(3.2,1.8,4.6,3.6,lt(BR,.3),'x');b.rect(3.2,6.4,4.6,3.6,lt(BR,.3),'x');b.ell(7.2,5.9,.6,.6,GO,'x')},
    gift(b){b.ell(3.9,2,1.6,1.2,RD);b.ell(7.1,2,1.6,1.2,RD);b.rect(1.6,4.6,7.8,6,[252,218,128]);b.rect(.9,3,9.2,2,GO);b.rect(4.9,3,1.2,7.6,RD,'x');b.rect(1.6,7,7.8,.9,RD,'x')},
    wrench(b){b.cap(3,8.4,7.2,4.2,1,GY);b.ell(8,3.2,2.2,2.2,GY);b.ell(8.8,2.4,1,1,DK,'x');b.ell(2.7,8.8,1.3,1.3,GY2);b.line(4,7.2,6.4,4.8,lt(GY,.5),'x')},
    bird(b){b.tri(.4,4.6,3,6,2.2,8.4,CR);b.ell(5.4,6.6,3.6,2.6,CR);b.ell(8.5,4.4,1.7,1.7,CR);b.tri(2.4,6,5.6,.8,7,6.2,[212,226,244]);b.tri(10,4,11.4,4.7,10,5.2,OR);dot(b,8.9,4.1,DK);b.ell(5.4,8,2.4,.9,[236,226,214],'x')},
    warn(b){b.tri(5.5,.6,.3,10.2,10.7,10.2,GO);b.rect(5,3.8,1,3.6,DK,'x');b.rect(5,8.2,1,1,DK,'x')},
    moon(b){fine(b,0,0,11,11,(u,v,X,Y)=>{if(Math.hypot(u-5.2,v-5.5)<=4.9&&Math.hypot(u-7.6,v-4.2)>3.9)b.put(X,Y,[252,228,140])});star4(b,8.6,3.4,1.5,[255,246,200])},
    dice(b){b.rect(1.4,1.4,8.2,8.2,CR);b.rect(1.4,8.6,8.2,1,[226,214,196],'x');[[3.4,3.4],[7.6,3.4],[5.5,5.5],[3.4,7.6],[7.6,7.6]].forEach(p=>b.ell(p[0],p[1],.6,.6,RD,'x'))},
    pencil(b){b.cap(3,8,7.8,3.2,1.1,GO);b.tri(.8,10.4,1.6,7.6,3.6,9.6,[244,214,176]);dot(b,1.4,9.8,DK);b.ell(8.6,2.4,1.2,1.2,PK);b.line(6.4,3.6,7.8,5,GY,'x')},
    ff(b){b.tri(.8,1.8,.8,9.2,5.4,5.5,BL);b.tri(5.4,1.8,5.4,9.2,10.2,5.5,BL)},
    excl(b){b.cap(5.5,1.6,5.5,6.2,1.1,RD);b.ell(5.5,9.4,1.2,1.2,RD)},
    trash(b){b.rect(4.4,.8,2.2,1.2,GY2);b.rect(1.4,2,8.2,1.6,GY2);b.rect(2.4,3.6,6.2,7,GY);[3.6,5.2,6.8].forEach(x=>b.rect(x,4.8,.6,4.6,GY2,'x'))},
    bowl(b){bowl(b,BL)},
    kibble(b){bowl(b,BL,[204,150,96])},
    rice(b){bowl(b,PK,CR)},
    can(b){b.rect(2.4,2.2,6.2,8,GY);b.ell(5.5,2.2,3.1,1.1,lt(GY,.5));b.rect(2.4,4.2,6.2,4,RD,'x');b.ell(5,6.2,1.5,1,CR,'x');b.tri(6.2,6.2,7.6,5.2,7.6,7.2,CR,'x')},
    fish(b){fish(b,BL)},
    salmon(b){b.ell(5.5,7.8,4.4,2.4,CR);b.ell(5.5,4.8,4.6,2.4,[250,150,112]);[3,5.2,7.4].forEach(x=>b.line(x,3.4,x+1.2,6.2,[255,206,180],'x'))},
    churu(b){b.ell(5.5,5.5,4.8,4.8,CR);b.ell(5.5,5.5,3,3,PK,'x');b.ell(5.5,5.5,1.9,1.9,CR,'x');b.ell(5.5,5.5,.9,.9,PK,'x');b.rect(5.5,5.2,3,.6,CR,'x');[[1.4,5.5],[9.6,5.5],[5.5,1.4],[5.5,9.6]].forEach(p=>dot(b,p[0],p[1],PK))},
    leaf(b){b.cap(2,10,8.6,2.6,.35,[78,140,96]);[[3.4,6.6,-1],[6.8,7.6,1],[5.6,4,-1],[8.6,5.2,1],[8.4,2.4,-1]].forEach(p=>b.ell(p[0],p[1],1.7,1,p[2]<0?GR:GR2))},
    bento(b){b.rect(.8,2.2,9.4,7.6,DK);b.rect(1.8,3.2,3.4,2.6,CR,'x');b.rect(5.8,3.2,3.4,2.6,[250,150,112],'x');b.rect(1.8,6.4,7.4,2.4,GR,'x');dot(b,3.5,4.5,RD);dot(b,4,7.6,GO);dot(b,7,7.4,GO)},
    town(b){b.rect(1,5,4.2,5.6,CR);b.tri(3.1,1.6,.3,5.2,5.9,5.2,RD);b.rect(6,6.4,4.2,4.2,CR);b.tri(8.1,3.4,5.4,6.6,10.8,6.6,BL);b.rect(2.4,7.6,1.4,3,BR,'x');b.rect(7.4,7.8,1.4,1.4,GO,'x')},
    tree(b){b.rect(4.7,6.4,1.6,4.4,BR);b.ell(5.5,4.2,4.4,3.8,GR);b.ell(3.8,3,1.8,1.2,GR2,'x');b.ell(7.2,5.4,1.6,1,[84,150,104],'x')},
    lake(b){b.ell(5.5,8,5,2.6,BL);b.line(2.4,7.6,4.4,7.6,CR,'x');b.line(6.2,8.8,8.4,8.8,CR,'x');b.tri(6.8,3.4,9.4,1.6,9.4,5.2,OR);b.ell(4.8,3.4,2.4,1.6,OR);dot(b,3.6,3,DK)},
    anchor(b){b.ell(5.5,1.9,1.5,1.5,GY);b.ell(5.5,1.9,.6,.6,DK,'x');b.rect(4.9,3,1.2,7.4,GY);b.rect(3.2,4.2,4.6,1.1,GY);b.cap(1.4,6.8,3.4,9.8,.6,GY);b.cap(3.4,9.8,7.6,9.8,.6,GY);b.cap(7.6,9.8,9.6,6.8,.6,GY)},
    pin(b){b.tri(2.6,5.6,8.4,5.6,5.5,10.8,RD);b.ell(5.5,4,3.4,3.4,RD);b.ell(5.5,4,1.2,1.2,CR,'x')},
    check(b){b.ell(5.5,5.5,4.8,4.8,GR);b.cap(3,5.8,4.8,7.6,.6,CR,'x');b.cap(4.8,7.6,8.2,3.8,.6,CR,'x')},
    box(b){b.rect(1.6,4,7.8,6.6,TAN);b.rect(.9,2.4,9.2,2,[236,200,148]);b.rect(4.9,2.4,1.2,8.2,CR,'x')},
    paw(b){b.ell(5.5,8,2.7,2,PK);b.ell(5.5,8.4,1.4,.8,lt(PK,.4),'x');[[1.6,5.6],[4,2.6],[7,2.6],[9.4,5.6]].forEach(p=>b.ell(p[0],p[1],.8,1.05,PK))},
    party(b){b.tri(.8,10.6,2.4,5.4,6,9,GO);b.rect(1.8,7.6,2.6,.7,RD,'x');[[6,2,RD],[9,4,BL],[7.6,6.4,GR],[4.6,3.6,PU],[9.6,8.4,PK],[3,1.4,BL]].forEach(p=>b.rect(p[0]-.6,p[1]-.6,1.2,1.2,p[2]))},
    star(b){const C=[255,214,90];b.tri(5.5,.4,3.4,6.8,7.6,6.8,C);b.tri(.3,4.2,10.7,4.2,5.5,7.8,C);b.tri(2.2,10.6,3.6,5.4,6.6,7.8,C);b.tri(8.8,10.6,7.4,5.4,4.4,7.8,C)},
    crown(b){b.tri(1.2,6.4,1.2,2.4,4.2,6.4,GO);b.tri(3.2,6.4,5.5,1.2,7.8,6.4,GO);b.tri(6.8,6.4,9.8,2.4,9.8,6.4,GO);b.rect(1.2,6,8.6,3.8,GO);b.rect(1.2,8.6,8.6,1.2,GO2,'x');dot(b,5.5,7.4,RD);dot(b,3,7.4,BL);dot(b,8,7.4,BL)},
    sun(b){for(let i=0;i<8;i++){const a=i*Math.PI/4;b.cap(5.5+Math.cos(a)*3.6,5.5+Math.sin(a)*3.6,5.5+Math.cos(a)*4.8,5.5+Math.sin(a)*4.8,.45,GO)}b.ell(5.5,5.5,2.8,2.8,[255,218,100])},
    hourglass(b){b.tri(1.8,1.6,9.2,1.6,5.5,6,[252,232,170]);b.tri(1.8,9.4,9.2,9.4,5.5,5,[252,232,170]);b.tri(3.2,9.4,7.8,9.4,5.5,7,GO2,'x');b.rect(1.2,.8,8.6,1.2,BR);b.rect(1.2,9.2,8.6,1.2,BR)},
    bottle(b){b.ell(5.5,2,1.2,1.5,PK);b.rect(3.2,3.2,4.6,1.1,BL);b.rect(3.4,4.3,4.2,6.4,CR);b.rect(3.4,7,4.2,3.7,[255,240,200],'x');[5.4,7,8.6].forEach(y=>b.rect(6.4,y,1.2,.4,GY,'x'))}
  };
})();
function icon(name){const b=new Buf(12,12);(IC[name]||IC.paw)(b);b.shade(.12);b.outline([96,62,46]);return b}
return {cat,furn,sheetOf,icon,icons:Object.keys(IC),Buf,hex,
  U:{Buf,Q,hex,H,mix,dk,lt,lum,OC,PINK,WH,hsh,vnoise,spotAt,bandC,blob,fleck,marble,nacreC,auraFx,spark}};
})();
