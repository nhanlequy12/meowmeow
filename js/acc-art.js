"use strict";
/* ============ PHỤ KIỆN ĐỘI: HÌNH (2026-11-14) ============
   Vẽ phụ kiện (js/acc-data.js) đè lên sprite mèo do CatKit dựng, bám theo mỏ neo của TỪNG khung (F.A) nên đi theo đầu, cổ
   ở mọi dáng: ngồi, chớp mắt, vẫy đuôi, ngủ, liếm lông, đứng, đi, chạy, nhảy. Không đổi một ô nào của đầu, tai, thân mèo:
   phụ kiện chỉ phủ lên trên (vòng cổ, khăn thì bị cằm và chân giơ lên che, như đeo thật).
   Cách móc (không sửa catkit.js, ui.js):
   - Khóa ngoại hình có thêm hậu tố "~@<đầu>.<cổ>", ví dụ "muop~mackerel~@bow.bell", "v_grumpy~@.scarf". Hàm accSfx(c) (js/acc.js) sinh hậu tố.
     Hậu tố đứng sau "~" nên các chỗ tách khóa theo "~" (catTag, KITONLY, look) vẫn đọc đúng giống và màu.
   - Bọc look(key): bỏ hậu tố, lấy ngoại hình gốc, trả bản sao có thêm s.acc={h,n}.
   - Bọc CatKit.render(s,pose): dựng mèo như cũ, rồi vẽ phụ kiện lên Buf trả về. Bộ nhớ đệm catCv theo khóa nên khóa có hậu tố được đệm riêng.
   - Gacha (vẽ kiểu cũ, old=1) không qua CatKit.render nên không có phụ kiện, đúng yêu cầu giữ nguyên gacha.
   Toạ độ là toạ độ kit (lưới mịn 72x80 nhìn thẳng, 100x80 nhìn ngang quay PHẢI); Buf của khung nhìn ngang đã lật nên ghi lại phải lật. */
const ACC_RE=/~@[^~!]*/;
const ACC_OC=[78,48,38];   // viền nâu đậm chung của game
function accParse(key){const m=String(key).match(ACC_RE);if(!m)return null;const [h,n]=m[0].slice(2).split('.');return {base:String(key).replace(ACC_RE,''),h:ACC[h]?h:'',n:ACC[n]?n:''}}
// ô nào của ngoại hình s bị ẩn (mèo trang phục đã có mũ, băng trán, vòng cổ...)
function accHidden(s,sl){if(!s)return false;const bid=s.bid||s.id;
  if(ACC_HIDE[sl].includes(bid)||(s.ct&&ACC_HIDE_CT[sl].includes(s.ct)))return true;
  const P=sl==='h'?ACC_HEAD_PARTS:ACC_NECK_PARTS,cos=s.cos;
  if(!cos)return false;if(!Array.isArray(cos))return P.includes(cos);
  return cos.some(p=>{const n=Array.isArray(p)?(p[0]==='old'?p[1]:p[0]):p;return P.includes(n)})}

const ACCART=(()=>{
const H=80,K=CatKit,P=K.P,BASE=K.BASE||77;   // không vẽ dưới hàng đáy 77
const RING=[];for(let dx=-2;dx<=2;dx++)for(let dy=-2;dy<=2;dy++)if(Math.abs(dx)+Math.abs(dy)<=3&&(dx||dy))RING.push([dx,dy]);
const hx=s=>{s=s.replace('#','');return [parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)]};
const mix=(a,b,t)=>[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t));
const dk=(a,t)=>mix(a,[40,24,20],t),lt=(a,t)=>mix(a,[255,255,255],t);
/* ---- lớp vẽ (giống Layer của CatKit) ---- */
class L{
  constructor(W){this.W=W;this.m=new Map()}
  set(x,y,c){x=Math.round(x);y=Math.round(y);if(x>=0&&y>=0&&x<this.W&&y<=BASE&&c){const v=typeof c==='function'?c(x,y):c;if(v)this.m.set(y*this.W+x,v)}return this}
  rect(x,y,w,h,c){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.set(x+i,y+j,c);return this}
  ell(cx,cy,rx,ry,c){for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1)this.set(x,y,c);return this}
  line(x0,y0,x1,y1,c,th){th=th||1;const n=Math.max(1,Math.ceil(Math.hypot(x1-x0,y1-y0)*2)),r=(th-1)/2;
    for(let k=0;k<=n;k++){const x=x0+(x1-x0)*k/n,y=y0+(y1-y0)*k/n;if(th<=1)this.set(x,y,c);else for(let dy=-Math.ceil(r);dy<=Math.ceil(r);dy++)for(let dx=-Math.ceil(r);dx<=Math.ceil(r);dx++)if(dx*dx+dy*dy<=r*r+.3)this.set(x+dx,y+dy,c)}return this}
  poly(pts,c){let y0=1e9,y1=-1e9;pts.forEach(p=>{y0=Math.min(y0,p[1]);y1=Math.max(y1,p[1])});
    for(let y=Math.floor(y0);y<=Math.ceil(y1);y++){const xs=[];for(let k=0;k<pts.length;k++){const a=pts[k],b=pts[(k+1)%pts.length];if((a[1]<=y&&b[1]>y)||(b[1]<=y&&a[1]>y))xs.push(a[0]+(y-a[1])/(b[1]-a[1])*(b[0]-a[0]))}
      xs.sort((p,q)=>p-q);for(let k=0;k+1<xs.length;k+=2)for(let x=Math.round(xs[k]);x<=Math.round(xs[k+1]);x++)this.set(x,y,c)}return this}
  // vẽ đè (bỏ qua ô đã có) để thêm chi tiết lên chính lớp này
  over(x,y,c){x=Math.round(x);y=Math.round(y);const i=y*this.W+x;if(this.m.has(i))this.m.set(i,typeof c==='function'?c(x,y):c);return this}
  has(x,y){return this.m.has(Math.round(y)*this.W+Math.round(x))}
}
/* T: ảnh mèo ở toạ độ kit. own: 0 của mèo, 1 phụ kiện, 2 viền phụ kiện.
   stamp: o.clip(x,y) chỉ dán ô thỏa; o.under: chỉ dán lên ô có mèo (vòng cổ ôm theo thân, không viền ra ngoài);
   viền 2 ô ra phía ô trống, 1 ô chỗ đè lên mèo. */
function stamp(T,l,o){o=o||{};const W=T.W,px=[];
  l.m.forEach((c,i)=>{const x=i%W,y=(i-x)/W;if(o.clip&&!o.clip(x,y))return;if(o.under&&!T.cat[i])return;if(o.behind&&T.col[i])return;px.push(i)});
  const mine=new Set(px),oc=o.outline===undefined?ACC_OC:o.outline;
  if(oc)px.forEach(i=>{const x=i%W,y=(i-x)/W;RING.forEach(d=>{const u=x+d[0],v=y+d[1];if(u<0||v<0||u>=W||v>BASE)return;const j=v*W+u;if(mine.has(j))return;
    if(o.clip&&!o.clip(u,v)&&T.col[j])return;
    if(!T.col[j]){if(o.under)return;T.col[j]=oc;T.own[j]=2}
    else if(!o.behind&&Math.abs(d[0])+Math.abs(d[1])===1&&T.own[j]!==1){T.col[j]=oc;T.own[j]=2}})});
  px.forEach(i=>{T.col[i]=l.m.get(i);T.own[i]=1})}
// mỏ neo của khung trước đó k bước (đồ treo như đuôi khăn trễ nhịp theo thân), giống G.lag của CatKit
function lag(F,k){const n=K.NF[F.anim];if(!n||n<2)return F.A;const j=F.anim==='jump'?Math.max(0,F.i-k):(((F.i-k)%n)+n)%n;try{return K.baseFrame(F.shape,F.anim,j).A}catch(e){return F.A}}

/* ---- bảng màu ---- */
const C={pink:hx('f28fb0'),pinkD:hx('d0577f'),pinkL:hx('ffc6d8'),red:hx('d8463e'),redD:hx('a52e2e'),gold:hx('f2c84b'),goldD:hx('c8922a'),goldL:hx('fff0a8'),
  blue:hx('6fa8e8'),blueL:hx('cfe6ff'),mint:hx('7fcfb8'),mintD:hx('4e9e8a'),cream:hx('fff3d6'),creamD:hx('e8d2a8'),black:hx('2b2630'),glass:hx('3a3448'),
  white:hx('fbf8f2'),grey:hx('c9c3cf'),straw:hx('e9c77a'),strawD:hx('c79a4a'),strawL:hx('f6e2a8'),leaf:hx('6cc070'),yel:hx('ffd84a'),lilac:hx('c8a6f0'),navy:hx('3d4f8f')};
// tô có khối: sáng ở trên, sẫm ở dưới theo khoảng [y0,y1]
const grad=(c,y0,y1)=>(x,y)=>{const t=(y-y0)/Math.max(1,y1-y0);return t<.25?lt(c,.28):t>.78?dk(c,.18):c};

/* ---- khung đầu: điểm đặt mũ ----
   nhìn thẳng: tâm giữa hai tai, đáy mũ ở đỉnh sọ; nhìn ngang: giữa hai chóp tai */
function headBox(F){const A=F.A;
  if(F.view==='side')return {x:Math.round((A.earN[0]+A.earF[0])/2),y:A.crown[1]+1,w:13,side:1,ear:A.earN,ear2:A.earF};
  return {x:A.crown[0],y:A.crown[1]+1,w:14,side:0,ear:A.earR,ear2:A.earL}}
// cột ô mèo bên trái/phải ở một hàng (để vòng cổ ôm đúng bề ngang thân)
function span(T,y,x0,x1,ok){let a=-1,b=-1;for(let x=x0;x<=x1;x++){const i=y*T.W+x;if(T.cat[i]&&ok(i)){if(a<0)a=x;b=x}}return a<0?null:[a,b]}
const notHead=T=>(x,y)=>{const p=T.F.part[y*T.W+x];return p!==P.HEAD&&p!==P.EAR};

/* ================= ĐỒ ĐỘI ĐẦU ================= */
const HEAD={
  bow(T,F){const A=F.A,l=new L(T.W);let x,y;
    if(F.view==='side'){x=A.earN[0]-4;y=A.earN[1]+8}else{x=A.earR[0]-3;y=A.earR[1]+8}
    const c=grad(C.pink,y-4,y+4);
    l.poly([[x,y],[x-7,y-4],[x-7,y+4]],c).poly([[x,y],[x+7,y-4],[x+7,y+4]],c);
    l.over(x-5,y-2,C.pinkL).over(x+5,y-2,C.pinkL).over(x-6,y-2,C.pinkL).over(x+4,y-2,C.pinkL);
    l.poly([[x-1,y+1],[x-4,y+7],[x-2,y+7]],C.pinkD).poly([[x+1,y+1],[x+4,y+7],[x+2,y+7]],C.pinkD);
    l.ell(x,y,1.8,1.8,C.pinkD);stamp(T,l)},
  party(T,F){const b=headBox(F),l=new L(T.W),x=b.x,y=b.y,w=6,h=17;
    l.poly([[x-w,y],[x+w,y],[x,y-h]],(u,v)=>{const s=((u-x)+(y-v)*.9)/4;return Math.floor(s+20)%2?C.blue:C.blueL});
    l.rect(x-w,y-1,2*w+1,2,C.gold);
    l.ell(x,y-h-1,2.6,2.6,(u,v)=>v<y-h-1?C.goldL:C.gold);stamp(T,l)},
  beanie(T,F){const b=headBox(F),l=new L(T.W),x=b.x,y=b.y;
    l.ell(x,y-3,8,7.5,(u,v)=>v>y-4?null:((u+40)%3===0?C.mintD:(v<y-8?lt(C.mint,.2):C.mint)));
    l.rect(x-8,y-4,17,4,(u,v)=>(u+40)%2?C.cream:C.creamD);
    l.ell(x,y-11,3,2.6,(u,v)=>v<y-11?C.white:C.cream);stamp(T,l)},
  shades(T,F){const A=F.A,l=new L(T.W),g=(cx,cy)=>(u,v)=>(u===cx-2&&v===cy-1)||(u===cx-1&&v===cy-2)?hx('9a90b0'):C.glass;
    if(F.view==='side'){const [ex,ey]=A.eye;l.ell(ex+1,ey,4.5,3.4,g(ex+1,ey));l.line(ex-4,ey-1,A.head[0]-6,ey-3,C.black,1.4);stamp(T,l);return}
    const [ax,ay]=A.eyeL,[bx,by]=A.eyeR;l.ell(ax,ay,5.2,3.8,g(ax,ay)).ell(bx,by,5.2,3.8,g(bx,by));
    l.line(ax+5,Math.min(ay,by)-1,bx-5,Math.min(ay,by)-1,C.black,1.4);stamp(T,l)},
  flowers(T,F){const A=F.A,l=new L(T.W),side=F.view==='side',pts=[];
    if(side){const x0=A.earF[0]+1,x1=A.earN[0]+1,y=A.crown[1]+2;for(let k=0;k<4;k++){const t=k/3;pts.push([x0+(x1-x0)*t,y+1-Math.sin(t*Math.PI)*2])}}
    else{const cx=A.crown[0],y=A.crown[1]+2;for(let k=0;k<5;k++){const t=k/4,dx=(t-.5)*26;pts.push([cx+dx,y+Math.abs(dx)*.28-1])}}
    const col=[C.pink,C.white,C.lilac,C.pink,C.white];
    // lá xanh nối giữa các bông
    for(let k=0;k+1<pts.length;k++)l.line(pts[k][0],pts[k][1]+1,pts[k+1][0],pts[k+1][1]+1,C.leaf,2);
    pts.forEach((p,k)=>{const [x,y]=p.map(Math.round),c=col[k];l.ell(x-2,y,1.6,1.6,c).ell(x+2,y,1.6,1.6,c).ell(x,y-2,1.6,1.6,c).ell(x,y+2,1.6,1.6,c);l.rect(x-1,y-1,2,2,C.yel)});
    stamp(T,l)},
  straw(T,F){const b=headBox(F),l=new L(T.W),x=b.x,y=b.y,R=b.side?12:14;
    l.ell(x,y-6,7,6.5,(u,v)=>v>y-3?null:((u+v)%4===0?C.strawD:v<y-10?C.strawL:C.straw));
    l.rect(x-7,y-5,15,2,C.red);
    l.ell(x,y-2,R,2.6,(u,v)=>v>y-2?C.strawD:((u+v)%5===0?C.strawD:C.straw));
    stamp(T,l)},
  crown(T,F){const b=headBox(F),l=new L(T.W),x=b.x,y=b.y,w=7;
    l.poly([[x-w,y],[x+w,y],[x+w,y-9],[x+3,y-4],[x,y-11],[x-3,y-4],[x-w,y-9]],(u,v)=>v>y-3?C.goldD:v<y-7?C.goldL:C.gold);
    l.rect(x-w,y-3,2*w+1,2,C.gold);l.over(x,y-2,C.red).over(x+1,y-2,C.red).over(x-4,y-2,C.blue).over(x+4,y-2,C.blue).over(x+5,y-2,C.blue).over(x-3,y-2,C.blue);
    [[x-w,y-10],[x,y-12],[x+w,y-10]].forEach(p=>l.ell(p[0],p[1],1.3,1.3,C.white));
    stamp(T,l)}
};

/* ================= ĐỒ ĐEO CỔ =================
   Dải vòng cổ: nhìn thẳng là các hàng ngay dưới cằm, ôm đúng bề ngang thân; nhìn ngang là dải chéo từ gáy (A.neck) xuống cổ họng (A.throat).
   Chỉ tô lên ô có mèo và không phải đầu, tai (cằm, chân đang giơ lên che vòng như thật). */
function band(T,F,rows,colF){const A=F.A,l=new L(T.W),ok=notHead(T);
  if(F.view==='side'){
    /* nhìn ngang, đầu che gần hết cổ: vòng cổ là dải ô thân ôm sát mép sau và mép dưới của đầu (khoảng cách tới ô đầu 1..rows),
       từ gáy (A.neck) tới trước ngực. Đo khoảng cách bằng loang từ các ô đầu sang ô thân. */
    const W=T.W,N=W*H,d=new Uint8Array(N).fill(255),q=[],[nx,ny]=A.neck,fp=T.F.part,body=i=>T.cat[i]&&fp[i]!==P.HEAD&&fp[i]!==P.EAR;
    for(let i=0;i<N;i++)if(T.cat[i]&&(fp[i]===P.HEAD||fp[i]===P.EAR)){d[i]=0;q.push(i)}
    for(let h=0;h<q.length;h++){const i=q[h],x=i%W,y=(i-x)/W;if(d[i]>=rows)continue;
      for(let dy=-1;dy<=1;dy++)for(let dx=-1;dx<=1;dx++){const u=x+dx,v=y+dy;if(u<0||v<0||u>=W||v>=H)continue;const j=v*W+u;if(d[j]!==255||!body(j))continue;d[j]=d[i]+1;q.push(j)}}
    for(let i=0;i<N;i++){if(d[i]<1||d[i]>rows)continue;const x=i%W,y=(i-x)/W;if(x<nx-3||y<ny-3)continue;l.set(x,y,colF(d[i]-1,x+y))}
    return l}
  const [cx,ny]=A.neck;for(let r=0;r<rows;r++){const y=ny+r,s=span(T,y,cx-16,cx+16,i=>ok(i%T.W,y));if(!s)continue;for(let x=s[0];x<=s[1];x++)l.set(x,y,colF(r,x))}
  return l}
// điểm giữa trước cổ (treo chuông, mặt dây, nút nơ) và điểm gáy (đuôi khăn bay ra sau)
function neckPts(T,F){const A=F.A;
  if(F.view!=='side')return {front:[A.neck[0],A.neck[1]+2],back:A.neck,mid:[]};
  const l=band(T,F,3,r=>r===1?[1,1,1]:[2,2,2]);let fr=null,bk=null;const mid=[];
  l.m.forEach((c,i)=>{const x=i%T.W,y=(i-x)/T.W;if(!fr||x>fr[0]||(x===fr[0]&&y>fr[1]))fr=[x,y];if(!bk||y<bk[1]||(y===bk[1]&&x<bk[0]))bk=[x,y];if(c[0]===1)mid.push([x,y])});
  if(!fr)return {front:[A.throat[0]+2,A.throat[1]+1],back:A.neck,mid:[]};
  // đường giữa dải, xếp theo góc quanh tâm đầu: từ gáy vòng xuống trước ngực
  const hc=A.head;mid.sort((a,b)=>Math.atan2(b[0]-hc[0],b[1]-hc[1])-Math.atan2(a[0]-hc[0],a[1]-hc[1]));
  return {front:[fr[0]-2,fr[1]],back:bk,mid}}
const NECK={
  bell(T,F){const l=band(T,F,3,r=>r===2?C.redD:r===0?lt(C.red,.2):C.red);stamp(T,l,{under:1,clip:notHead(T),outline:false});
    if(F.anim==='sleep')return;
    const [x,y]=neckPts(T,F).front,b=new L(T.W);b.ell(x,y+2.5,2.8,2.8,(u,v)=>v<y+2?C.goldL:v>y+4?C.goldD:C.gold);b.over(x,y+4,C.goldD);stamp(T,b,{clip:notHead(T)})},
  bandana(T,F){const ok=notHead(T),l=band(T,F,2,()=>C.red);stamp(T,l,{under:1,clip:ok,outline:false});
    if(F.anim==='sleep')return;
    const [x,y]=neckPts(T,F).front,t=new L(T.W),dot=(u,v)=>((u+v*3)%5===0&&(v%3===0))?C.white:C.red;
    if(F.view==='side')t.poly([[x-5,y-2],[x+3,y-2],[x-1,y+7]],dot);else t.poly([[x-10,y],[x+10,y],[x,y+11]],dot);
    stamp(T,t,{clip:ok})},
  bowtie(T,F){if(F.anim==='sleep')return;const ok=notHead(T),[x,y]=neckPts(T,F).front,t=new L(T.W),c=grad(C.navy,y-3,y+4);
    if(F.view==='side'){t.poly([[x,y],[x+4,y-3],[x+4,y+3]],c).poly([[x,y],[x-4,y-3],[x-4,y+3]],c);t.ell(x,y,1.6,1.6,dk(C.navy,.3))}
    else{t.poly([[x,y+1],[x-7,y-3],[x-7,y+5]],c).poly([[x,y+1],[x+7,y-3],[x+7,y+5]],c);t.ell(x,y+1,2,2,dk(C.navy,.3))}
    stamp(T,t,{clip:ok})},
  scarf(T,F){const ok=notHead(T),st=(r,k)=>Math.floor((k+40)/3)%2?C.red:C.cream,l=band(T,F,4,st);stamp(T,l,{under:1,clip:ok,outline:false});
    if(F.anim==='sleep')return;
    const B=lag(F,1),B2=lag(F,2),t=new L(T.W),stripe=(u,v)=>Math.floor((u+40)/3)%2?C.red:C.cream;
    if(F.view==='side'){const [nx,ny]=neckPts(T,F).back,dy=(B2.neck[1]-F.A.neck[1])*1.5,dy1=(B.neck[1]-F.A.neck[1]);
      // đuôi khăn bay ra sau gáy, trễ nhịp 1-2 khung theo thân
      t.poly([[nx+2,ny],[nx+2,ny+4],[nx-8,ny+4+dy1],[nx-13,ny+2+dy],[nx-11,ny-1+dy]],stripe);
      t.set(nx-13,ny+1+dy,C.creamD).set(nx-12,ny+dy,C.creamD);stamp(T,t);return}
    const [cx,ny]=F.A.neck,sw=(B.neck[0]-F.A.neck[0]);
    t.poly([[cx+4,ny+1],[cx+9,ny+1],[cx+10+sw,ny+13],[cx+5+sw,ny+13]],(u,v)=>Math.floor((v+40)/3)%2?C.red:C.cream);
    t.rect(cx+5+sw,ny+14,6,1,C.creamD);stamp(T,t,{clip:ok})},
  pearls(T,F){const ok=notHead(T),t=new L(T.W),A=F.A;let pts=[];
    if(F.view==='side'){const m=neckPts(T,F).mid;for(let k=0;k<m.length;k+=3)pts.push(m[k])}
    else{const [cx,ny]=A.neck;for(let k=-4;k<=4;k++){const dx=k*2.6;pts.push([cx+dx,ny+1+3*(1-(dx/11)**2)])}}
    pts.forEach(p=>{const [x,y]=p.map(Math.round);t.rect(x,y,2,2,(u,v)=>u===x&&v===y?C.white:C.grey)});
    if(F.anim!=='sleep'){const [x,y]=neckPts(T,F).front;t.ell(x,y+(F.view==='side'?2:3),1.8,2.2,(u,v)=>v<y+3?C.pinkL:C.pink)}
    stamp(T,t,{clip:ok})}
};

/* vẽ phụ kiện của ngoại hình s lên Buf b (đã dựng bởi CatKit) ở tư thế pose */
function draw(b,s,pose){
  const a=s.acc;if(!a||(!a.h&&!a.n))return b;
  const F=K.frameOf(s,pose);if(!F||!F.A||!F.A.crown)return b;
  const W=F.W,side=F.view==='side',N=W*H,idx=i=>{const x=i%W,y=(i-x)/W;return y*W+(side?W-1-x:x)};
  const T={W,F,col:new Array(N),own:new Uint8Array(N),cat:new Uint8Array(N)};
  for(let i=0;i<N;i++){const j=idx(i);T.col[i]=b.c[j]||null;if(b.c[j])T.cat[i]=1}
  if(a.h&&HEAD[a.h]&&!accHidden(s,'h'))HEAD[a.h](T,F);
  if(a.n&&NECK[a.n]&&!accHidden(s,'n'))NECK[a.n](T,F);
  for(let i=0;i<N;i++)if(T.own[i]){const j=idx(i);b.c[j]=T.col[i];b.r[j]=T.own[i]===2?'o':'x'}
  return b}
return {draw,HEAD,NECK,headBox};
})();

// móc: look(key) hiểu hậu tố phụ kiện; CatKit.render vẽ thêm phụ kiện
{const L0=look,LC={};look=function(key){const p=accParse(key);if(!p)return L0.apply(this,arguments);
  if(LC[key])return LC[key];const b=L0(p.base);return LC[key]=(p.h||p.n)?Object.assign({},b,{acc:{h:p.h,n:p.n}}):b}}
{const R0=CatKit.render;CatKit.render=function(s,pose){const b=R0.apply(this,arguments);if(!b||!s||!s.acc)return b;
  try{ACCART.draw(b,s,pose)}catch(e){if(typeof console!=='undefined')console.warn('acc',e)}return b}}
