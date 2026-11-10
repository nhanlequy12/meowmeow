"use strict";
/* Bộ vẽ thuần JS theo style hạt cườm: ghép hình khối vào lưới, làm nhạt màu, đổ bóng nhẹ rồi viền nâu. */
const Art=(()=>{
const hex=h=>[parseInt(h.slice(1,3),16),parseInt(h.slice(3,5),16),parseInt(h.slice(5,7),16)];
const H=c=>typeof c==='string'?hex(c):c;
const mix=(a,b,t)=>[0,1,2].map(i=>Math.round(a[i]+(b[i]-a[i])*t));
const dk=(c,t)=>mix(c,[120,70,50],t), lt=(c,t)=>mix(c,[255,252,246],t);
const lum=c=>.3*c[0]+.59*c[1]+.11*c[2];
const OUT=[152,98,64],WH=[255,253,248],EY=[120,74,54],RED=[226,72,78],NAVY=[62,68,110],GOLDC=[248,206,90],PINK=[250,172,188];

class Buf{
  constructor(w,h){this.w=w;this.h=h;this.c=new Array(w*h).fill(null);this.r=new Array(w*h).fill(null)}
  in(x,y){return x>=0&&y>=0&&x<this.w&&y<this.h}
  get(x,y){return this.in(x,y)?this.c[y*this.w+x]:null}
  reg(x,y){return this.in(x,y)?this.r[y*this.w+x]:null}
  set(x,y,col,reg){
    x=Math.round(x);y=Math.round(y); if(!this.in(x,y))return;
    if(typeof col==='function')col=col(x,y,reg); if(!col)return;
    const i=y*this.w+x,o=this.c[i];
    if(col.length===4&&col[3]<255&&o){const a=col[3]/255;col=[0,1,2].map(k=>Math.round(o[k]+(col[k]-o[k])*a));if(o.length===4)col.push(o[3])}
    this.c[i]=col; if(reg!==undefined)this.r[i]=reg;
  }
  rect(x,y,w,h,col,reg){for(let j=0;j<h;j++)for(let i=0;i<w;i++)this.set(x+i,y+j,col,reg)}
  ell(cx,cy,rx,ry,col,reg,clip){
    for(let y=Math.floor(cy-ry);y<=Math.ceil(cy+ry);y++)for(let x=Math.floor(cx-rx);x<=Math.ceil(cx+rx);x++)
      if(((x-cx)/rx)**2+((y-cy)/ry)**2<=1&&(!clip||clip(x,y)))this.set(x,y,col,reg);
  }
  tri(ax,ay,bx,by,cx,cy,col,reg){
    const s=(px,py,qx,qy,rx,ry)=>(px-rx)*(qy-ry)-(qx-rx)*(py-ry);
    for(let y=Math.floor(Math.min(ay,by,cy));y<=Math.ceil(Math.max(ay,by,cy));y++)
      for(let x=Math.floor(Math.min(ax,bx,cx));x<=Math.ceil(Math.max(ax,bx,cx));x++){
        const d1=s(x,y,ax,ay,bx,by),d2=s(x,y,bx,by,cx,cy),d3=s(x,y,cx,cy,ax,ay);
        if(!((d1<0||d2<0||d3<0)&&(d1>0||d2>0||d3>0)))this.set(x,y,col,reg);
      }
  }
  line(x0,y0,x1,y1,col,reg){
    x0=Math.round(x0);y0=Math.round(y0);x1=Math.round(x1);y1=Math.round(y1);
    const dx=Math.abs(x1-x0),dy=-Math.abs(y1-y0),sx=x0<x1?1:-1,sy=y0<y1?1:-1;let e=dx+dy;
    for(;;){this.set(x0,y0,col,reg);if(x0===x1&&y0===y1)break;const e2=2*e;if(e2>=dy){e+=dy;x0+=sx}if(e2<=dx){e+=dx;y0+=sy}}
  }
  pastel(t){this.c.forEach((c,i)=>{if(c&&c.length===3)this.c[i]=mix(c,[255,250,243],t)})}
  shade(t){
    for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){
      const i=y*this.w+x,c=this.c[i]; if(!c||this.r[i]==='x'||c.length===4)continue;
      if(!this.get(x,y+1))this.c[i]=dk(c,t);
    }
  }
  outline(col){
    const add=[];
    for(let y=0;y<this.h;y++)for(let x=0;x<this.w;x++){
      if(this.c[y*this.w+x])continue;
      if(this.get(x-1,y)||this.get(x+1,y)||this.get(x,y-1)||this.get(x,y+1))add.push(y*this.w+x);
    }
    add.forEach(i=>{this.c[i]=col;this.r[i]='o'});
  }
  rgba(){
    const d=new Uint8ClampedArray(this.w*this.h*4);
    this.c.forEach((c,i)=>{if(c){d[i*4]=c[0];d[i*4+1]=c[1];d[i*4+2]=c[2];d[i*4+3]=c.length===4?c[3]:255}});
    return d;
  }
}

/* ---------- màu lông theo vùng ---------- */
function colorer(s){
  const c=hex(s.c),c2=hex(s.c2||s.c),c3=hex(s.c3||s.c2||s.c),W=hex('#fdfaf4'),w=s.w||0,p=s.pat;
  const h2=(x,y,n)=>((((x>>1)*73856093)^((y>>1)*19349663))>>>0)%n;
  const h1=(x,y,n)=>(((x*73856093)^(y*19349663))>>>0)%n;
  const soft=lum(c)>100?.38:.12;
  return (x,y,reg)=>{
    if(w>=1&&(reg==='muz'||reg==='chest'))return W;
    if((w>=2||s.mit)&&reg==='paw')return W;
    if(w>=2&&reg==='head'&&y>=16&&Math.abs(x-17.5)<=(y-14)*.9)return W;
    if(p==='van')return (reg==='tail'||((reg==='head'||reg==='ear')&&y<14))?c2:W;
    if(p==='calico'){
      if(reg==='tail')return c3; if(reg==='ear')return x<18?c2:c3;
      if(reg==='head'){if(x<15&&y<17)return c2;if(x>21&&y<15)return c3}
      if(reg==='body'){if(x>20&&y<33)return c2;if(x<13&&y>30)return c3}
      return c;
    }
    if(p==='cow'){
      if(reg==='tail')return c2; if(reg==='ear')return x>18?c2:c;
      if(reg==='head'&&((x>20&&y<16)||(x<12&&y<13)))return c2;
      if(reg==='body'&&x<14&&y<33)return c2;
      return c;
    }
    if(p==='tortie')return h2(x,y,5)<2?c2:c;
    if(p==='lykoi'){
      if(reg==='muz'||(reg==='head'&&y>=15&&y<=20&&Math.abs(x-17.5)<8))return c3;
      return h1(x,y,3)===0?c2:c;
    }
    if(p==='point'){
      if(reg==='ear'||reg==='tail'||reg==='paw')return c2;
      if((reg==='head'||reg==='muz')&&((x-17.5)/6.5)**2+((y-19.5)/5.5)**2<1)return c2;
      return reg==='chest'?lt(c,.3):c;
    }
    let b=(reg==='muz'||reg==='chest')?lt(c,soft):c;
    if(p==='smoke'&&(reg==='ear'||reg==='tail'||(reg==='head'&&y<15)||(reg==='body'&&y<28)))b=c2;
    if(p==='ticked'){
      if((reg==='head'&&y<13)||reg==='ear')b=dk(c,.18);
      if(reg==='tail'&&y<29)b=c2;
      if(reg==='head'&&(y===19||y===22)&&(x<=9||x>=26))b=c2;
    }
    if(p==='tabby'||p==='tiger'){
      const T=p==='tiger';
      if(reg==='head'&&((y>=9&&y<=12&&(x===14||x===21))||(y>=9&&y<=13&&(x===17||x===18))||((y===19||y===22)&&(x<=9||x>=26))||(T&&(y===15||y===17)&&(x<=9||x>=26))))b=c2;
      if(reg==='body'&&(T?(y%2===0&&(x<=13||x>=22)):((y===28||y===31||y===34)&&(x<=12||x>=23))))b=c2;
      if(reg==='tail'&&y%3===0)b=c2;
    }
    if(p==='spot'&&(reg==='body'||reg==='tail'||(reg==='head'&&y<14))&&h2(x,y,4)===0)b=c2;
    return b;
  };
}

const each=(b,f)=>{for(let y=0;y<b.h;y++)for(let x=0;x<b.w;x++)f(x,y,b.reg(x,y))};
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
      for(let y=1;y<=30;y++)for(let x=2;x<=33;x++){const d=Math.hypot(x-17.5,y-15.5);if(d<=13.6){if(d>12.4)b.set(x,y,[196,230,248],'x');else b.set(x,y,[170,225,255,60],b.reg(x,y)||'x')}}
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
    mid(b){const D=[92,92,120];for(let y=2;y<13;y++)for(let x=3;x<=32;x++){const o=((x-17.5)/13)**2+((y-16)/12)**2,i=((x-17.5)/11.2)**2+((y-16)/10.2)**2;if(o<=1&&i>1)b.set(x,y,D,'hat')}
      b.rect(3,13,4,8,D,'hat');b.rect(29,13,4,8,D,'hat');b.rect(4,15,2,4,[130,230,230],'x');b.rect(30,15,2,4,[130,230,230],'x')},
    front(b){const D=[70,60,90];b.rect(10,15,7,4,D,'x');b.rect(19,15,7,4,D,'x');b.rect(17,16,2,1,D,'x');b.set(11,16,WH,'x');b.set(20,16,WH,'x');b.rect(12,18,4,1,[240,120,210],'x');b.rect(21,18,4,1,[240,120,210],'x')}
  }
};

/* ---------- bộ phận trang phục ghép được: tên -> [giai đoạn, hàm vẽ] ---------- */
const DARK=[72,62,86];
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
  glasses:['front',(b,s,c)=>{const C=H(c||'#4a3f55');[10,20].forEach(x0=>{for(let i=1;i<5;i++){b.set(x0+i,14,C,'x');b.set(x0+i,20,C,'x')}for(let j=15;j<20;j++){b.set(x0,j,C,'x');b.set(x0+5,j,C,'x')}});b.rect(16,16,4,1,C,'x')}],
  blindfold:['front',(b,s,c)=>each(b,(x,y,r)=>{if(r&&r!=='o'&&y>=15&&y<=19&&x>=7&&x<=28&&r!=='prop')b.set(x,y,H(c),'x')})],
  scar:['front',(b,s,k)=>{
    if(k==='bolt')[[19,10],[18,11],[19,12],[18,13]].forEach(p=>b.set(p[0],p[1],RED,'x'));
    if(k==='under')b.rect(11,20,3,1,EY,'x');
    if(k==='tanjiro')b.rect(11,10,4,3,[176,70,76],'x');
  }],
  marks:['front',b=>{[19,21,23].forEach(y=>{b.rect(8,y,3,1,EY,'x');b.rect(25,y,3,1,EY,'x')})}],
  lenses:['front',(b,s,c,w,h)=>{b.rect(11,15,w||4,h||4,H(c),'x');b.rect(25-(w||4),15,w||4,h||4,H(c),'x')}],
  pupils:['front',(b,s,c)=>{b.rect(13,17,1,2,H(c),'x');b.rect(22,17,1,2,H(c),'x')}],
  lids:['front',(b,s,c)=>{const C=c?H(c):hex(s.c);b.rect(11,14,4,3,C,'x');b.rect(21,14,4,3,C,'x');b.rect(11,17,4,1,EY,'x');b.rect(21,17,4,1,EY,'x')}],
  mustache:['front',b=>{[[12,20],[13,21],[14,22],[15,22],[16,21],[19,21],[20,22],[21,22],[22,21],[23,20]].forEach(p=>b.set(p[0],p[1],DARK,'x'))}],
  beard:['front',(b,s,c)=>b.ell(17.5,25,5.6,6.5,H(c),'x',(x,y)=>y>=22)],
  bamboo:['front',b=>{b.rect(13,21,10,2,[166,210,146],'x');b.rect(13,21,1,2,[120,170,110],'x');b.rect(22,21,1,2,[120,170,110],'x');b.rect(17,21,1,2,[120,170,110],'x')}],
  number:['front',(b,s,str,c)=>{const G={'4':["#.#","#.#","###","..#","..#"],'5':["###","#..","###","..#","###"],'6':["###","#..","###","#.#","###"]};
    [...str].forEach((ch,k)=>G[ch].forEach((row,j)=>{for(let i=0;i<3;i++)if(row[i]==='#')b.set(12+k*4+i,28+j,H(c),'x')}))}],
  shape:['front',(b,s,k)=>{if(k==='tri'){b.line(17,15,14,20,WH,'x');b.line(18,15,21,20,WH,'x');b.line(14,21,21,21,WH,'x')}else{for(let i=0;i<6;i++){b.set(15+i,15,WH,'x');b.set(15+i,21,WH,'x');b.set(14,16+i-1,WH,'x');b.set(21,16+i-1,WH,'x')}}}],
  cheeks:['front',(b,s,c)=>{b.rect(8,20,3,2,H(c),'x');b.rect(25,20,3,2,H(c),'x')}],
  eartips:['front',(b,s,c)=>recolor(b,(x,y,r)=>r==='ear'&&y<=7,H(c),'ear')],
  tailbase:['front',(b,s,c)=>recolor(b,(x,y,r)=>r==='tail'&&y>=33,H(c),'tail')],
  belly:['front',(b,s,c)=>{b.ell(17.5,31,5.6,5.6,H(c),'chest',(x,y)=>y<=36&&isBody(b.reg(x,y)));[[14,28],[15,27],[16,28],[19,28],[20,27],[21,28]].forEach(p=>b.set(p[0],p[1],[150,150,165],'x'))}],
  pocket:['front',b=>{[[14,31],[15,32],[16,33],[17,33],[18,33],[19,33],[20,32],[21,31]].forEach(p=>b.set(p[0],p[1],EY,'x'));b.rect(14,30,8,1,EY,'x')}],
  poptart:['front',b=>{recolor(b,(x,y,r)=>(isBody(r)||r==='paw')&&y>=25&&y<=35,[244,206,160],'body');recolor(b,(x,y,r)=>r==='body'&&y>=27&&y<=34&&x>=12&&x<=23,(x,y)=>(x*7+y*13)%11===0?[236,80,160]:[255,170,206],'x')}],
  paw:['front',b=>{b.ell(28,14.5,2.6,3.6,WH,'paw');b.rect(27,13,2,1,PINK,'x');b.set(27,15,PINK,'x');b.set(29,15,PINK,'x')}],
  coin:['front',b=>{b.ell(17.5,31.5,3.6,4.2,GOLDC,'x');b.rect(17,29,2,5,[214,160,60],'x')}],
  frown:['front',b=>{[[15,23],[16,22],[17,22],[18,22],[19,22],[20,23],[10,14],[11,15],[12,15],[25,14],[24,15],[23,15]].forEach(p=>b.set(p[0],p[1],EY,'x'))}],
  earrings:['front',b=>{b.rect(5,21,2,4,WH,'x');b.set(5,22,RED,'x');b.set(6,22,RED,'x');b.rect(29,21,2,4,WH,'x');b.set(29,22,RED,'x');b.set(30,22,RED,'x')}],
  web:['front',b=>{b.line(17,9,17,13,DARK,'x');b.line(12,11,15,14,DARK,'x');b.line(23,11,20,14,DARK,'x');b.line(9,21,13,22,DARK,'x');b.line(26,21,22,22,DARK,'x')}],
  fr:['front',(b,s,x,y,w,h,c)=>b.rect(x,y,w,h,H(c),'x')],
  // sau khi viền
  qmark:['post',b=>{[".##.","#..#","...#","..#.","..#.","....","..#."].forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='#')b.set(30+i,1+j,[200,120,90],'x')})}],
  sparks:['post',(b,s,c)=>{[[2,9],[3,10],[2,11],[33,22],[34,23],[33,24],[1,27],[2,28]].forEach(p=>b.set(p[0],p[1],H(c),'x'))}],
};

/* ---------- vẽ mèo: lưới 36x40, chân chạm hàng 38 ---------- */
function cat(s,pose){
  const b=new Buf(36,40),col=colorer(s),M=x=>35-x,sym=f=>{f(x=>x);f(M)};
  const parts=Array.isArray(s.cos)?s.cos:[],old=typeof s.cos==='string'?(COS[s.cos]||{}):{};
  const flag={};parts.forEach(p=>{if(p[0]==='flag')flag[p[1]]=1});if(old.noEars)flag.noEars=1;
  const run=st=>{if(old[st])old[st](b,s);parts.forEach(p=>{const d=P[p[0]];if(d&&d[0]===st)d[1](b,s,...p.slice(1))})};
  // tư thế: [chân trước trái, chân trước phải, kiểu đuôi]
  const PZ={walk0:[-1,0,1],walk1:[0,-1,0],run0:[-2,0,2],run1:[0,-2,2],jump:[-2,-2,2]},pz=PZ[pose]||[0,0,0],tm=pz[2];
  const groom=pose==='groom0'||pose==='groom1';
  const long=s.fur===1,closed=pose==='sleep'||s.closed||groom;
  run('back');
  const tl=s.tail||'n';
  if(tl==='n'){b.ell(28,33.5,3.2,4,col,'tail');if(tm===2)b.ell(29.2,26.6,2,4.2,col,'tail');else b.ell(29.6+(tm?.9:0),28.5,2,2.7,col,'tail')}
  else if(tl==='fluff'){b.ell(28.5,32.5,4.6,5,col,'tail');b.ell(30.2+(tm===1?.9:0),26.5-(tm===2?2:0),3,3.6+(tm===2?1:0),col,'tail')}
  else if(tl==='bob')b.ell(26.6,34,2.4,2.4,col,'tail');
  b.ell(10.5,36.3+pz[1],2.8,1.7,col,'body');b.ell(24.5,36.3+pz[0],2.8,1.7,col,'body');
  b.ell(17.5,30.5,long?8.2:7.3,7,col,'body',(x,y)=>y<=37);
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
    const eye=(x0,ic)=>{
      const u=b.get(x0,17)||[230,230,230],dark=lum(u)<110;
      if(closed){const lc=dark?lt(u,.6):EY;b.rect(x0,18,2,1,lc,'x');b.set(x0-1,17,lc,'x');b.set(x0+2,17,lc,'x');return}
      if(dark){b.rect(x0,16,2,3,lt(ic,.25),'x');b.rect(x0,17,2,1,EY,'x')}
      else{b.rect(x0,16,2,2,EY,'x');b.rect(x0,18,2,1,lt(ic,.15),'x')}
    };
    eye(12,hex(s.eye||'#f59ab0'));eye(22,hex(s.eye2||s.eye||'#f59ab0'));
    const ny=my-1;
    b.rect(17,ny,2,1,[232,110,120],'x');
    sym(m=>{b.rect(Math.min(m(9),m(10)),my-1,2,2,PINK,'x')});
    b.rect(10,36+pz[1],2,1,PINK,'x');b.rect(24,36+pz[0],2,1,PINK,'x');
  }
  if(groom){const gy=pose==='groom0'?24.5:23;b.ell(13.5,gy,3.2,3.1,dk(col(13,30,'body'),.4),'x');b.ell(13.5,gy,2.4,2.3,col,'paw');b.rect(13,Math.round(gy)-1,2,1,PINK,'x');if(pose==='groom1'&&!flag.noFace)b.rect(15,22,2,1,[245,130,140],'x')}
  if(s.pat==='hairless'){const wr=dk(hex(s.c),.25);b.rect(15,11,6,1,wr,'x');b.rect(16,13,4,1,wr,'x')}
  run('front');
  b.pastel(.2);
  b.shade(.12);
  b.outline(OUT);
  sym(m=>{[[4,19],[5,19],[4,22],[5,22]].forEach(p=>{if(!b.get(m(p[0]),p[1]))b.set(m(p[0]),p[1],OUT,'o')})});
  if(ear==='tuft')sym(m=>{b.set(m(8),3,OUT,'o');b.set(m(7),2,OUT,'o')});
  run('post');
  return b;
}

/* ---------- nội thất ---------- */
const PUR=[168,146,214],WOOD=[232,204,160],WOOD2=[200,168,120],CRMF=[250,242,226];
const FART={
  box(b){b.rect(1,7,28,14,[214,172,116]);b.rect(1,4,28,4,[232,198,144]);b.rect(4,5,22,2,[150,104,70],'x');b.rect(14,8,2,13,CRMF,'x')},
  yarn(b){b.ell(6.5,6.5,5.5,5.5,[250,130,156]);b.line(3,5,10,5,[255,196,208],'x');b.line(3,8,10,8,[255,196,208],'x');b.line(11,10,13,12,[250,130,156])},
  mouse(b){b.ell(6,5.2,4.6,3,[176,182,196]);b.ell(4,2.6,1.6,1.6,PINK);b.line(10,6,13,4,PINK);b.set(3,5,EY,'x')},
  picture(b){b.rect(1,1,22,18,[232,198,144]);b.rect(3,3,18,14,[255,248,236],'x');b.ell(11,10,5,3,[150,196,250],'x');b.tri(15,10,19,7,19,13,[150,196,250],'x');b.set(8,9,EY,'x')},
  bed(b){b.ell(22,12,21,6,PUR);b.ell(22,9,17,5,[255,220,228]);b.ell(22,9,11,2.5,[255,238,242],'x')},
  plant(b){b.ell(10,14,4,12,[110,180,120]);b.ell(5,17,3,8,[140,206,146]);b.ell(15,16,3,9,[140,206,146]);b.rect(5,26,10,9,[250,246,238]);b.rect(4,25,12,2,[230,222,210])},
  rug(b){b.ell(35,11,34,10,[244,150,170]);b.ell(35,11,29,7.6,[250,178,194],'x');b.ell(35,11,18,4,[255,214,222],'x')},
  lamp(b){b.rect(7,14,2,28,WOOD);b.rect(3,42,10,3,PUR);b.rect(3,7,10,7,[255,232,160]);b.rect(5,3,6,4,[255,232,160]);b.rect(4,12,8,1,[255,248,214],'x')},
  post(b){b.rect(1,39,18,4,PUR);b.rect(7,5,6,34,WOOD);for(let y=7;y<38;y+=3)b.rect(7,y,6,1,WOOD2,'x');b.rect(4,1,12,4,PUR)},
  shelf(b){b.rect(1,1,38,4,[206,160,116]);b.rect(5,5,2,2,[170,124,86]);b.rect(33,5,2,2,[170,124,86])},
  window(b){b.rect(1,1,44,34,CRMF);b.rect(4,4,38,28,[176,222,250],'x');b.ell(13,11,5,2.4,WH,'x');b.ell(17,9,3,2,WH,'x');b.rect(30,23,4,3,PINK,'x');b.set(34,24,[255,196,110],'x');b.rect(4,29,38,3,[160,216,160],'x');b.rect(22,4,2,28,CRMF,'x');b.rect(4,17,38,2,CRMF,'x');b.rect(0,35,46,2,[232,218,196])},
  sofa(b,v){const A=[150,200,190],D=[128,180,170],L=[178,220,210];b.ell(32,10,28,8,A);b.rect(4,10,56,12,A);b.rect(1,12,9,18,D);b.rect(54,12,9,18,D);b.rect(9,17,46,11,L);b.rect(31,17,2,11,A,'x');b.rect(5,30,4,3,[170,124,86]);b.rect(55,30,4,3,[170,124,86]);
    if(v==='broken'){[[14,6],[20,8],[40,5],[46,9],[24,20],[42,21]].forEach(p=>{b.line(p[0],p[1],p[0]+3,p[1]+6,[100,140,134],'x');b.set(p[0]+4,p[1]+3,WH,'x');b.set(p[0]+5,p[1]+4,WH,'x')})}},
  tank(b){b.rect(3,26,30,3,[190,144,104]);b.rect(5,29,3,14,[170,124,86]);b.rect(28,29,3,14,[170,124,86]);b.rect(4,4,28,22,[150,216,240]);b.rect(4,22,28,4,[240,226,180],'x');b.rect(10,10,4,3,[255,190,100],'x');b.set(14,11,[255,190,100],'x');b.rect(21,15,4,3,[255,136,136],'x');b.set(20,16,[255,136,136],'x');b.rect(26,12,2,10,[120,196,126],'x');b.rect(3,2,30,2,[150,140,176]);b.rect(6,6,2,6,[214,242,252],'x')},
  catnip(b){b.ell(10,10,3,7,[120,196,126]);b.ell(5.5,12,2.5,4.5,[150,220,150]);b.ell(14.5,11,2.5,5,[150,220,150]);b.rect(5,19,10,10,[230,150,110]);b.rect(4,17,12,3,[240,174,138])},
  tree(b){b.rect(4,70,38,5,PUR);b.rect(20,8,6,62,WOOD);for(let y=10;y<70;y+=3)b.rect(20,y,6,1,WOOD2,'x');b.rect(2,40,30,4,PUR);b.rect(12,5,26,4,PUR);b.rect(24,50,18,20,[150,128,200]);b.ell(33,61,5,6,[110,90,150],'x');b.line(8,44,8,50,WOOD);b.ell(8,52.5,2,2,PINK)},
  bowl(b,v){b.ell(9,6,8,3.4,[160,204,250]);b.rect(2,6,14,2,[130,176,236],'x');if(v==='full')b.ell(9,3.6,6,2,[214,160,100])},
  gift(b,v){const C=v?hex(v):[190,196,206],Rb=lum(C)>180?RED:[255,248,236];b.rect(3,11,22,15,C);b.rect(1,6,26,6,lt(C,.3));b.rect(12,6,4,20,Rb,'x');b.ell(9.5,3.6,3.6,2.6,Rb);b.ell(18.5,3.6,3.6,2.6,Rb);b.rect(13,3,2,3,dk(Rb,.25),'x')},
};
const FSIZE={bowl:[18,10],gift:[28,28]};
function furn(id,v){
  const f=(typeof FURN!=='undefined'&&FURN[id])||{},sz=FSIZE[id]||[f.w,f.h],b=new Buf(sz[0],sz[1]);
  FART[id](b,v);b.pastel(.1);b.shade(.1);b.outline(OUT);return b;
}
return {cat,furn,Buf,hex};
})();
