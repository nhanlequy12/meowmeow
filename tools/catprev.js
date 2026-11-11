#!/usr/bin/env node
/* Xuất ảnh xem trước và soát lỗi cho mèo dựng bằng CatKit (js/catkit.js + js/cats/*.js).

   node tools/catprev.js <khoá> [<khoá>...] [--out preview] [--strict] [--quiet]
     --strict: ngoại hình còn thiếu module (hoa văn, đặc điểm, trang phục) thì tính là lỗi và không vẽ tạm
     khoá: id giống hoặc mèo đặc biệt, có thể kèm màu lông / trang phục:  siamese   siamese~bluePt   v_gojo   v_goku~gkGod   british~r_nacre
   Mỗi khoá ghi vào <out>/<khoá>/:
     sheet.png              mọi dáng, mỗi dáng một hàng (hàng trên cùng của mỗi cặp là Xoài để so), phóng 2 lần
     sit.gif sleep.gif groom.gif walk.gif run.gif jump.gif   đúng tốc độ trong game (mèo trưởng thành), phóng 4 lần
     stand.png              dáng đứng (game chỉ dùng 1 khung)
     old.png                con mèo này vẽ theo kiểu cũ (ngồi, ngủ, liếm lông, đứng, đi, chạy, nhảy; quay trái) để đối chiếu
     peek.png               ảnh soát nhanh, nhỏ: hàng trên mèo mới, hàng dưới bản cũ, 7 dáng chính (xem ảnh này trước, chỉ mở sheet.png khi cần soát từng khung)
     check.json             kết quả soát: lưới, đường đáy, bàn chân chạm đất so với Xoài, module còn thiếu
   Không cần cài gì thêm (không dùng thư viện ngoài). Mã thoát 1 nếu có lỗi soát. */
const fs=require('fs'),path=require('path'),zlib=require('zlib');
const ROOT=path.dirname(__dirname),argv=process.argv.slice(2);
const flag=n=>argv.includes('--'+n),val=(n,d)=>{const i=argv.indexOf('--'+n);return i>=0?argv[i+1]:d};
const OUT=path.resolve(ROOT,val('out','preview')),keys=argv.filter((a,i)=>!a.startsWith('--')&&argv[i-1]!=='--out');
if(!keys.length){console.log(fs.readFileSync(__filename,'utf8').split('*/')[0].slice(22));process.exit(0)}

// nạp mã game theo đúng thứ tự trong index.html, rồi mọi module mèo trong js/cats
const files=['data','sprites','art','catkit'].map(f=>path.join(ROOT,'js',f+'.js'));
const cdir=path.join(ROOT,'js','cats');
if(fs.existsSync(cdir))fs.readdirSync(cdir).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push(path.join(cdir,f)));
const ctx={};(0,eval)(files.map(f=>fs.readFileSync(f,'utf8')).join('\n;')+'\n;globalThis.__G={Art,look,CatKit,BREEDS,VARIANTS,COATS}');
const {Art,look,CatKit:K}=globalThis.__G;
K.opt.strict=flag('strict');

/* ---------- PNG và GIF tối giản ---------- */
function png(w,h,d){const T=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;T[n]=c>>>0}
  const crc=b=>{let c=~0;for(const x of b)c=T[(c^x)&255]^(c>>>8);return(~c)>>>0};
  const ch=(t,b)=>{const l=Buffer.alloc(4);l.writeUInt32BE(b.length);const td=Buffer.concat([Buffer.from(t),b]);const c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(w,0);ih.writeUInt32BE(h,4);ih[8]=8;ih[9]=6;
  const raw=Buffer.alloc((w*4+1)*h);for(let y=0;y<h;y++){raw[y*(w*4+1)]=0;Buffer.from(d.buffer,y*w*4,w*4).copy(raw,y*(w*4+1)+1)}
  return Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),ch('IHDR',ih),ch('IDAT',zlib.deflateSync(raw)),ch('IEND',Buffer.alloc(0))])}
function gif(w,h,frames,delays){ // frames: mảng Uint8ClampedArray RGBA (đã đặc), delays: ms
  const pal=[],idx=new Map(),fi=frames.map(f=>{const o=new Uint8Array(w*h);for(let i=0;i<w*h;i++){const k=(f[i*4]>>2<<12)|(f[i*4+1]>>2<<6)|(f[i*4+2]>>2);let n=idx.get(k);if(n===undefined){if(pal.length<256){n=pal.length;pal.push([f[i*4],f[i*4+1],f[i*4+2]]);idx.set(k,n)}else n=0}o[i]=n}return o});
  let bits=1;while((1<<bits)<Math.max(2,pal.length))bits++;const out=[];const w16=v=>out.push(v&255,v>>8);
  out.push(...Buffer.from('GIF89a'));w16(w);w16(h);out.push(0x80|(bits-1),0,0);
  for(let i=0;i<(1<<bits);i++){const c=pal[i]||[0,0,0];out.push(c[0],c[1],c[2])}
  out.push(0x21,0xFF,11,...Buffer.from('NETSCAPE2.0'),3,1,0,0,0);
  let acc=0;fi.forEach((px,n)=>{out.push(0x21,0xF9,4,0);const b0=Math.round(acc/10);acc+=delays[n];w16(Math.round(acc/10)-b0);out.push(0,0,0x2C);w16(0);w16(0);w16(w);w16(h);out.push(0);
    const min=Math.max(2,bits);out.push(min);const clear=1<<min,eoi=clear+1;let size=min+1,next=eoi+1,dict=new Map(),cur=0,nb=0;const bytes=[];
    const emit=c=>{cur|=c<<nb;nb+=size;while(nb>=8){bytes.push(cur&255);cur>>>=8;nb-=8}};
    emit(clear);let s=px[0];
    for(let i=1;i<px.length;i++){const c=px[i],k=s*256+c;if(dict.has(k))s=dict.get(k);else{emit(s);if(next<4096){dict.set(k,next++);if(next>(1<<size)&&size<12)size++}else{emit(clear);dict=new Map();size=min+1;next=eoi+1}s=c}}
    emit(s);emit(eoi);if(nb>0)bytes.push(cur&255);
    for(let i=0;i<bytes.length;i+=255){const n2=Math.min(255,bytes.length-i);out.push(n2);for(let k=0;k<n2;k++)out.push(bytes[i+k])}out.push(0)});
  out.push(0x3B);return Buffer.from(out)}

/* ---------- dựng khung ---------- */
const BG=[160,125,88];
// trả RGBA 72x80 / 100x80, đầu quay PHẢI như sheet Xoài (game lật khi quay trái)
function frame(s,pose){const b=K.render(s,pose);if(!b)return null;const W=b.W,d=b.rgba(),o=new Uint8ClampedArray(W*80*4);
  for(let y=0;y<80;y++)for(let x=0;x<W;x++){const sx=W===100?W-1-x:x,i=(y*W+sx)*4,j=(y*W+x)*4;o[j]=d[i];o[j+1]=d[i+1];o[j+2]=d[i+2];o[j+3]=d[i+3]}
  return {W,d:o}}
function blit(dst,DW,f,ox,oy,sc){for(let y=0;y<80;y++)for(let x=0;x<f.W;x++){const a=f.d[(y*f.W+x)*4+3];if(!a)continue;const t=a/255;
  for(let dy=0;dy<sc;dy++)for(let dx=0;dx<sc;dx++){const j=((oy+y*sc+dy)*DW+ox+x*sc+dx)*4;for(let k=0;k<3;k++)dst[j+k]=Math.round(dst[j+k]*(1-t)+f.d[(y*f.W+x)*4+k]*t);dst[j+3]=255}}}
const fill=(W,Hh)=>{const d=new Uint8ClampedArray(W*Hh*4);for(let i=0;i<W*Hh;i++){d[i*4]=BG[0];d[i*4+1]=BG[1];d[i*4+2]=BG[2];d[i*4+3]=255}return d};
// hoạt ảnh: [tên, số khung, tư thế(i), thời lượng mỗi khung ms]. Thời lượng là của mèo trưởng thành ở tốc độ gốc, đúng như docs/cat-sprite-spec.md
// giống chân ngắn: một vòng đi 6 ô ở 10 ô/giây, chạy 13 ô ở 48 ô/giây nên khung ngắn hơn
const animsOf=short=>[
  ['sit',4,i=>'sit'+i+'s',[1500,140,1500,450]],
  ['sleep',4,i=>'sleep'+i+'s',[625,625,625,625]],
  ['groom',6,i=>'groom'+i+'s',Array(6).fill(133)],
  ['stand',1,()=>'stand',[1000]],
  ['walk',8,i=>'walk'+i+'s',Array(8).fill(short?75:96)],
  ['run',8,i=>'run'+i+'s',Array(8).fill(short?34:41)],
  ['jump',8,i=>'jump'+i+'s',[180,180,110,150,150,110,130,130]]];
const XOAI=look('venxam~grayTabby');

let fail=0;
for(const key of keys){
  let s;try{s=look(key)}catch(e){s=null}
  if(!s){console.error('không có ngoại hình:',key);fail++;continue}
  const dir=path.join(OUT,key.replace(/[^\w~.-]/g,'_'));fs.mkdirSync(dir,{recursive:true});
  const rep={key,name:s.n,missing:K.missing(s),errors:[],warnings:[],anims:{}};
  const ANIMS=animsOf(K.shapeOf(s)==='short');
  // sheet: mỗi dáng 2 hàng (Xoài, mèo này)
  const SC=2,CW=100*SC,RH=80*SC,SW=8*CW,SH=7*2*RH,sheet=fill(SW,SH);
  ANIMS.forEach(([name,n,pose,dur],r)=>{
    const fr=[];
    for(let i=0;i<n;i++){
      const fx=frame(XOAI,pose(i)),f=frame(s,pose(i));
      if(!f){rep.errors.push(name+' '+i+': không dựng được (thiếu '+rep.missing.join(', ')+')');continue}
      if(f.W!==(['sit','sleep','groom'].includes(name)?72:100))rep.errors.push(name+' '+i+': sai lưới '+f.W+'x80');
      blit(sheet,SW,fx,i*CW,r*2*RH,SC);blit(sheet,SW,f,i*CW,(r*2+1)*RH,SC);fr.push(f);
      // soát: đường đáy (không ô nào dưới hàng 77), ô bán trong suốt
      let low=-1,semi=0;for(let y=0;y<80;y++)for(let x=0;x<f.W;x++){const a=f.d[(y*f.W+x)*4+3];if(a===255)low=y;else if(a)semi++}
      if(low>77)rep.errors.push(name+' '+i+': có ô dưới đường đáy (hàng '+low+' > 77)');
      if(semi)rep.warnings.push(name+' '+i+': '+semi+' ô bán trong suốt (chỉ chấp nhận cho hào quang do lõi vẽ)');
      // soát: bàn chân chạm đất phải trùng khung Xoài (không trượt chân). So các ô chân ở hai hàng lông cuối (74, 75).
      if(['walk','run','jump','stand'].includes(name)){
        const F=K.frameOf(s,pose(i)),B=K.baseFrame(K.shapeOf(s),name,name==='stand'?0:i);let diff=0;
        for(let y=74;y<=75;y++)for(let x=0;x<100;x++){const a=K.isLeg(F.part[y*100+x])&&F.role[y*100+x]>1,b=K.isLeg(B.part[y*100+x])&&B.role[y*100+x]>1;if(a!==b)diff++}
        if(diff)rep.errors.push(name+' '+i+': bàn chân lệch khung Xoài '+diff+' ô (sẽ trượt chân)');
      }
    }
    rep.anims[name]={frames:fr.length,ms:dur,total:dur.reduce((a,b)=>a+b,0)};
    if(fr.length!==n)return;
    const W=fr[0].W,G=4;
    if(n===1){const d=fill(W*G,80*G);blit(d,W*G,fr[0],0,0,G);fs.writeFileSync(path.join(dir,name+'.png'),png(W*G,80*G,d))}
    else fs.writeFileSync(path.join(dir,name+'.gif'),gif(W*G,80*G,fr.map(f=>{const d=fill(W*G,80*G);blit(d,W*G,f,0,0,G);return d}),dur));
  });
  fs.writeFileSync(path.join(dir,'sheet.png'),png(SW,SH,sheet));
  // old.png: chính con mèo này vẽ theo kiểu cũ (art.js), để đối chiếu đặc điểm riêng cần giữ
  {const OP=['sit','sleep0','groom2','stand','walk3','run2','leap1'],G=4,d=fill(OP.length*100*G,80*G);
   OP.forEach((po,n)=>{try{const b=Art.cat(s,po,true);blit(d,OP.length*100*G,{W:b.W,d:b.rgba()},n*100*G,0,G)}catch(e){}});
   fs.writeFileSync(path.join(dir,'old.png'),png(OP.length*100*G,80*G,d))}
  // peek.png: MỘT ảnh nhỏ để soát bằng mắt (ít token nhất): hàng trên là mèo mới, hàng dưới là bản cũ, 7 dáng chính, quay trái như trong game, phóng 2 lần
  {const NP=['sit0s','sleep0s','groom2s','stand','walk2s','run2s','jump3s'],OP=['sit','sleep0','groom2','stand','walk3','run2','leap1'],G=2,PW=NP.length*100*G,d=fill(PW,160*G);
   NP.forEach((po,n)=>{const f=frame(s,po);if(!f)return;const m={W:f.W,d:new Uint8ClampedArray(f.d.length)};
     for(let y=0;y<80;y++)for(let x=0;x<f.W;x++){const sx=f.W===100?f.W-1-x:x;for(let k=0;k<4;k++)m.d[(y*f.W+x)*4+k]=f.d[(y*f.W+sx)*4+k]}
     blit(d,PW,m,n*100*G,0,G)});
   OP.forEach((po,n)=>{try{const b=Art.cat(s,po,true);blit(d,PW,{W:b.W,d:b.rgba()},n*100*G,80*G,G)}catch(e){}});
   fs.writeFileSync(path.join(dir,'peek.png'),png(PW,160*G,d))}
  rep.ok=!rep.errors.length&&!(flag('strict')&&rep.missing.length); // thiếu module của nhóm khác thì vẫn tính đạt ở nhánh riêng; --strict (sau khi gộp) mới bắt buộc đủ
  fs.writeFileSync(path.join(dir,'check.json'),JSON.stringify(rep,null,1));
  if(!rep.ok)fail++;
  if(!flag('quiet'))console.log((rep.ok?'ĐẠT   ':'CHƯA  ')+key+(rep.missing.length?'  (chờ module: '+rep.missing.join(', ')+')':'')+(rep.errors.length?'\n   '+rep.errors.slice(0,6).join('\n   '):'')+(rep.warnings.length?'\n   (lưu ý) '+rep.warnings.length+' cảnh báo, xem check.json':''));
}
process.exit(fail?1:0);
