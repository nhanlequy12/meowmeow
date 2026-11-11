#!/usr/bin/env node
/* Vẽ biểu tượng ứng dụng (thư mục icons/) từ chính hình mèo của game, để cài Mèo Xu lên màn hình chính (manifest.json).

   node tools/mkicons.js [khoá mèo]        mặc định: muop (ví dụ khác: v_naruto, khaomanee~kmIce)
   Ghi: icons/icon-192.png, icons/icon-512.png (nền bo góc), icons/maskable-512.png (nền tràn mép, mèo nằm trong vùng an toàn),
        icons/apple-touch-icon.png (180, nền đặc), icons/badge-96.png (bóng mèo trắng cho thanh trạng thái Android).
   Không dùng thư viện ngoài. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ROOT=path.dirname(__dirname),OUT=path.join(ROOT,'icons'),key=process.argv[2]||'muop';
const files=['data','sprites','art','catkit'].map(f=>path.join(ROOT,'js',f+'.js')),cdir=path.join(ROOT,'js','cats');
fs.readdirSync(cdir).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push(path.join(cdir,f)));
(0,eval)(files.map(f=>fs.readFileSync(f,'utf8')).join('\n;')+'\n;globalThis.__G={Art,look}');
const {Art,look}=globalThis.__G;
function png(w,h,d){const T=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c>>>0}
  const crc=b=>{let c=~0;for(const x of b)c=T[(c^x)&255]^(c>>>8);return(~c)>>>0};
  const ch=(t,b)=>{const l=Buffer.alloc(4);l.writeUInt32BE(b.length);const td=Buffer.concat([Buffer.from(t),b]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;
  const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(d.buffer,y*w*4,w*4).copy(raw,y*(w*4+1)+1)}
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(raw)),ch('IEND',Buffer.alloc(0))])}

const cat=Art.cat(look(key),'sit');if(!cat)throw new Error('Không vẽ được mèo: '+key);
const CW=cat.W,CH=cat.H,cpx=cat.rgba();
// khung bao phần có hình của mèo, để căn giữa theo hình chứ không theo khung sprite
let x0=CW,x1=0,y0=CH,y1=0;for(let y=0;y<CH;y++)for(let x=0;x<CW;x++)if(cpx[(y*CW+x)*4+3]>8){x0=Math.min(x0,x);x1=Math.max(x1,x);y0=Math.min(y0,y);y1=Math.max(y1,y)}
const BW=x1-x0+1,BH=y1-y0+1;
const BG=[246,222,178],RING=[253,241,214],EDGE=[160,118,84];
/* size: cạnh ảnh; fill: phần cạnh mà mèo được chiếm (0–1); round: bán kính bo góc theo cạnh (0 = nền tràn mép); white: chỉ vẽ bóng trắng */
function icon(size,fill,round,white){
  const d=new Uint8ClampedArray(size*size*4),k=Math.max(1,Math.floor(size*fill/Math.max(BW,BH))),ox=Math.round((size-BW*k)/2),oy=Math.round((size-BH*k)/2+(white?0:size*.02));
  const put=(x,y,c,a)=>{if(x<0||y<0||x>=size||y>=size)return;const i=(y*size+x)*4;d[i]=c[0];d[i+1]=c[1];d[i+2]=c[2];d[i+3]=a==null?255:a};
  if(!white){const R=round*size,cx=size/2,cy=size/2,rr=size*.4;
    for(let y=0;y<size;y++)for(let x=0;x<size;x++){
      let inside=true,edge=false;
      if(R>0){const dx=Math.max(R-x-.5,x+.5-(size-R),0),dy=Math.max(R-y-.5,y+.5-(size-R),0),q=Math.hypot(dx,dy);inside=q<=R;edge=q>R-size*.03}
      const b=Math.min(x,y,size-1-x,size-1-y);if(R>0&&b<size*.03)edge=true;
      if(!inside)continue;
      put(x,y,edge?EDGE:Math.hypot(x-cx,y-cy)<rr?RING:BG)}}
  for(let y=0;y<BH;y++)for(let x=0;x<BW;x++){const i=((y+y0)*CW+x+x0)*4,a=cpx[i+3];if(a<=8)continue;
    const c=white?[255,255,255]:[cpx[i],cpx[i+1],cpx[i+2]];for(let v=0;v<k;v++)for(let u=0;u<k;u++)put(ox+x*k+u,oy+y*k+v,c)}
  return png(size,size,d);
}
fs.mkdirSync(OUT,{recursive:true});
[['icon-192.png',192,.7,.2],['icon-512.png',512,.7,.2],['maskable-512.png',512,.56,0],['apple-touch-icon.png',180,.7,0],['badge-96.png',96,.9,0,1]].forEach(([n,s,f,r,w])=>{fs.writeFileSync(path.join(OUT,n),icon(s,f,r,w));console.log('icons/'+n)});
