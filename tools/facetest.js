"use strict";
/* Kiểm thử icon mặt mèo (chạy: node tools/facetest.js [--png]).
   Dựng icon cho MỌI ngoại hình: 86 giống × mọi màu lông × 9 màu hiếm, 64 mèo trang phục × mọi trang phục (kể cả trang phục hiếm), bằng đúng mã game
   (data.js, sprites.js, art.js, catkit.js, js/cats/*.js, face.js). Kiểm: đủ, cùng khung 52×52, hai mắt và mũi nằm trong khung (không lệch),
   màu hiếm và cặp mắt quý hiếm cho ra icon khác màu thường. --png: xuất bảng mọi icon ra preview/tut/faces.png để soát bằng mắt. Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path'),zlib=require('zlib'),ROOT=path.dirname(__dirname);
const files=['data','sprites','art','catkit'].map(f=>path.join(ROOT,'js',f+'.js'));
fs.readdirSync(path.join(ROOT,'js','cats')).filter(f=>f.endsWith('.js')).sort().forEach(f=>files.push(path.join(ROOT,'js','cats',f)));
files.push(path.join(ROOT,'js','compat-data.js'),path.join(ROOT,'js','face.js'));
(0,eval)(files.map(f=>fs.readFileSync(f,'utf8')).join('\n;')+'\n;globalThis.__G={Art,look,CatKit,BREEDS,VARIANTS,COATS,RARES,FACE,faceBuf}');
const {look,CatKit:K,BREEDS,VARIANTS,COATS,RARES,FACE,faceBuf}=globalThis.__G;
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
// mọi khóa ngoại hình
const keys=[],rare=[],forms=[];
BREEDS.forEach(b=>{keys.push(b.id);b.coats.forEach(c=>keys.push(b.id+'~'+c));if(!b.noRare)RARES.forEach(r=>{keys.push(b.id+'~'+r.id);rare.push([b.id,b.id+'~'+r.id])})});
VARIANTS.forEach(v=>{keys.push(v.id);(v.coats||[]).forEach(c=>{keys.push(v.id+'~'+c);if(COATS[c]&&COATS[c].form)forms.push([v.id+'~'+v.coats[0],v.id+'~'+c])})});
BREEDS.forEach(b=>b.coats.forEach(c=>{if(COATS[c]&&COATS[c].form)forms.push([b.id+'~'+b.coats[0],b.id+'~'+c])}));
const n=FACE.n,solid=p=>p&&(p.length<4||p[3]>200);
const sig=b=>b.c.map(p=>p?p[0]+','+p[1]+','+p[2]:'').join('|');
let miss=[],size=[],thin=[],eyes=[],err=[];const B={};
keys.forEach(k=>{let b;try{b=faceBuf(k)}catch(e){err.push(k+': '+e.message);return}
  if(!b){miss.push(k);return}B[k]=b;
  if(b.W!==n||b.H!==n||b.c.length!==n*n)size.push(k);
  const fill=b.c.filter(solid).length/(n*n);if(fill<.45)thin.push(k+' '+Math.round(fill*100)+'%');
  // mỏ neo mắt và mũi của khung ngồi phải nằm trong ô cắt, cách mép ít nhất 3 ô
  const F=K.frameOf(look(k),'sit0s');if(F&&F.A){['eyeL','eyeR','nose'].forEach(a=>{const p=F.A[a];if(!p)return;const x=p[0]-FACE.x,y=p[1]-FACE.y;if(x<3||y<3||x>n-4||y>n-4)eyes.push(k+' '+a+'@'+x+','+y)})}});
ok('Dựng được icon cho mọi ngoại hình ('+keys.length+' khóa: 86 giống, 64 mèo trang phục, mọi màu lông, màu hiếm, trang phục hiếm)',!miss.length&&!err.length,miss.concat(err).slice(0,5).join('; ')||null);
ok('Số loài: 86 giống thật, 64 mèo trang phục',BREEDS.length===86&&VARIANTS.length===64);
ok('Mọi icon cùng khung '+n+'×'+n+' ô mịn',!size.length,size.slice(0,5).join(', ')||null);
ok('Mắt và mũi nằm trong khung ở mọi icon (không lệch khung)',!eyes.length,eyes.slice(0,5).join('; ')||null);
ok('Icon nào cũng có hình (đầu chiếm từ 45% khung)',!thin.length,thin.slice(0,5).join('; ')||null);
// màu hiếm khác màu thường; trang phục hiếm khác trang phục thường; cặp mắt quý hiếm của Khao Manee khác nhau
// ngoại lệ đúng: Tam thể đực (r_mcalico) trên giống vốn đã là tam thể thì bộ lông y hệt, chỉ khác giới tính và viền sáng (lớp rareglow của faceTag)
const same=rare.filter(p=>B[p[0]]&&B[p[1]]&&sig(B[p[0]])===sig(B[p[1]])),odd=same.filter(p=>!/~r_mcalico$/.test(p[1]));
ok('Màu hiếm cho ra icon khác màu thường ('+rare.length+' cặp giống × màu hiếm; '+same.length+' cặp Tam thể đực trên giống vốn tam thể giống hệt là đúng)',!odd.length&&same.length<=4,odd.slice(0,4).map(p=>p[1]).join(', ')||null);
const sameF=forms.filter(p=>B[p[0]]&&B[p[1]]&&sig(B[p[0]])===sig(B[p[1]]));
ok('Trang phục hiếm cho ra icon khác trang phục thường ('+forms.length+' cặp)',forms.length>=28&&!sameF.length,sameF.slice(0,4).map(p=>p[1]).join(', ')||null);
const km=BREEDS.find(b=>b.id==='khaomanee').coats.filter(c=>COATS[c]&&(COATS[c].jewel||c==='kmIce')),ks=new Set(km.map(c=>sig(B['khaomanee~'+c])));
ok('Khao Manee: mỗi cặp màu mắt một icon riêng ('+km.length+' cặp)',km.length>=5&&ks.size===km.length);
const coatDiff=BREEDS.filter(b=>b.coats.length>1&&new Set(b.coats.map(c=>sig(B[b.id+'~'+c]))).size<2).map(b=>b.id);
ok('Giống có nhiều màu lông: icon đổi theo màu lông',!coatDiff.length,coatDiff.slice(0,5).join(', ')||null);
ok('Gọi lần hai lấy từ bộ nhớ đệm (cùng một đối tượng)',faceBuf(keys[5])===B[keys[5]]);

if(process.argv.includes('--png')){
  // bảng mọi icon: 30 cột, nền kem, mỗi ô 52px cách nhau 4px
  const cols=30,g=4,rows=Math.ceil(keys.length/cols),W=cols*(n+g)+g,H=rows*(n+g)+g,px=Buffer.alloc(W*H*4);
  for(let i=0;i<W*H;i++){px[i*4]=250;px[i*4+1]=240;px[i*4+2]=222;px[i*4+3]=255}
  keys.forEach((k,i)=>{const b=B[k];if(!b)return;const ox=g+(i%cols)*(n+g),oy=g+Math.floor(i/cols)*(n+g);
    for(let y=0;y<n;y++)for(let x=0;x<n;x++){const p=b.c[y*n+x];if(!p)continue;const a=p.length===4?p[3]/255:1,j=((oy+y)*W+ox+x)*4;for(let c=0;c<3;c++)px[j+c]=Math.round(p[c]*a+px[j+c]*(1-a))}});
  const raw=Buffer.alloc((W*4+1)*H);for(let y=0;y<H;y++){raw[y*(W*4+1)]=0;px.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4)}
  const crc=b=>{let c,r=0xffffffff;for(let i=0;i<b.length;i++){c=(r^b[i])&255;for(let k=0;k<8;k++)c=c&1?0xedb88320^(c>>>1):c>>>1;r=(r>>>8)^c}return (r^0xffffffff)>>>0};
  const chunk=(t,d)=>{const l=Buffer.alloc(4);l.writeUInt32BE(d.length);const td=Buffer.concat([Buffer.from(t),d]),c=Buffer.alloc(4);c.writeUInt32BE(crc(td));return Buffer.concat([l,td,c])};
  const ih=Buffer.alloc(13);ih.writeUInt32BE(W,0);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
  const out=path.join(ROOT,'preview','tut');fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'faces.png'),Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
  console.log('Đã xuất preview/tut/faces.png ('+keys.length+' icon, '+W+'×'+H+')');
}
console.log(fail?'\nCÓ '+fail+' PHẦN HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
