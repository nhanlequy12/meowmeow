"use strict";
/* node tools/mealprev-w.js [--quiet]: soát bát × loại nước × mức đầy.
   Hàng: BOWL / THERMO / FILTER, mỗi món sáu loại; cột: 0,1,2,4,6,8. */
const fs=require('fs'),path=require('path'),zlib=require('zlib'),vm=require('vm');
const root=path.join(__dirname,'..'),quiet=process.argv.includes('--quiet');
const ctx=vm.createContext({console,performance:{now:()=>220},localStorage:{getItem(){return null},setItem(){}}});
const load=f=>vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
['js/data.js','js/wx-data.js','js/pw-data.js','js/sprites.js','js/art.js','js/furn/wx-05.js'].forEach(load);
const Art=vm.runInContext('Art',ctx),ids=['waterbowl','thermobottle','waterfilter'];
const liquids=['plain','mineral','pure','electro','nutri','special'],levels=[0,1,2,4,6,8];
const variants=['','full','a1','broken','unknown'];
const before=ids.map(id=>variants.map(v=>Buffer.from(Art.furn(id,v).rgba())));
load('js/meal-artw.js');
const assert=(ok,msg)=>{if(!ok)throw Error(msg)};
ids.forEach((id,i)=>variants.forEach((v,j)=>assert(Buffer.from(Art.furn(id,v).rgba()).equals(before[i][j]),'Hình cũ đổi: '+id+'/'+v)));
// Duyệt đủ chín mức, cả khung máy chạy; cạn thì sáu loại phải cùng đáy trống.
for(const id of ids){
  for(const type of liquids){
    let prev;
    for(let n=0;n<=8;n++){
      const b=Art.furn(id,'mw'+n+':w_'+type),px=Buffer.from(b.rgba());
      assert(b.c.some(Boolean),'Hình rỗng: '+id);
      assert(b.c.every(c=>!c||c.every(Number.isFinite)),'Màu lỗi: '+id);
      assert(!prev||!px.equals(prev),'Hai mức giống nhau: '+id+'/'+type+'/'+n);
      prev=px;
      if(id==='waterfilter'){
        const anim=Buffer.from(Art.furn(id,'mw'+n+':w_'+type+'|a1').rgba());
        assert(n? !anim.equals(px):anim.equals(px),'Khung chạy sai: '+n);
      }
    }
  }
  const empty=Buffer.from(Art.furn(id,'mw0:w_plain').rgba());
  liquids.forEach(t=>assert(Buffer.from(Art.furn(id,'mw0:w_'+t).rgba()).equals(empty),'Cạn còn màu nước: '+id));
}
vm.runInContext(`
  var testRatio=0,testTop=null,testDead=false,testFrame='a1';
  function fillRatio(){return testRatio}
  function mTop(){return testTop}
  function pwDead(){return testDead}
  function pwVar(){return testFrame}
`,ctx);
const checkVar=(expr,want)=>assert(vm.runInContext(expr,ctx)===want,'Biến thể sai: '+expr);
checkVar("mealVarW({fid:'waterbowl'})",'mw0:w_plain');
checkVar("testRatio=.001;testTop='w_mineral';mealVarW({fid:'waterbowl'})",'mw1:w_mineral');
checkVar("testRatio=.5;testTop='w_plain';mealVarW({fid:'waterfilter'})",'mw4:w_plain|a1');
checkVar("mealVarW({fid:'waterfilter',off:true})",'mw4:w_plain');
checkVar("testDead=true;mealVarW({fid:'waterfilter'})",'mw4:w_plain');
checkVar("mealVarW({fid:'waterfilter',broken:true})",'broken');
checkVar("testDead=false;testRatio=1;testFrame='';mealVarW({fid:'waterfilter'})",'mw8:w_plain');
checkVar("testRatio=0;testFrame='a1';mealVarW({fid:'waterfilter'})",'mw0:w_plain');

// Chữ bitmap nhỏ để đọc được chú giải ngay trong PNG, không cần thư viện.
const font={
  A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',
  E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',
  I:'111010010010111',L:'100100100100111',M:'101111111101101',N:'101111111111101',
  O:'010101101101010',P:'110101110100100',R:'110101110101101',S:'011100010001110',
  T:'111010010010010',U:'101101101101111',W:'101101111111101',Y:'101101010010010',
  '0':'111101101101111','1':'010110010010111','2':'110001010100111',
  '4':'101101111001001','6':'011100111101111','8':'111101111101111'
};
const left=86,cw=82,rh=54,top=28,W=left+cw*6,H=top+rh*18+12;
const img=Buffer.alloc(W*H*4);
function dot(x,y,c){if(x<0||y<0||x>=W||y>=H)return;const i=(y*W+x)*4;img[i]=c[0];img[i+1]=c[1];img[i+2]=c[2];img[i+3]=255}
function rect(x,y,w,h,c){for(let Y=y;Y<y+h;Y++)for(let X=x;X<x+w;X++)dot(X,Y,c)}
function text(s,x,y,c=[106,78,65]){for(const ch of s){const bits=font[ch];if(bits)for(let i=0;i<15;i++)if(bits[i]==='1')dot(x+i%3,y+Math.floor(i/3),c);x+=4}}
rect(0,0,W,H,[247,238,220]);text('WATER',8,9);
levels.forEach((n,j)=>text(String(n),left+j*cw+cw/2,9));
ids.forEach((id,i)=>liquids.forEach((type,t)=>{
  const row=i*6+t,y=top+row*rh;
  rect(0,y,W,rh-1,i%2?[230,232,218]:[239,226,207]);
  text(['BOWL','THERMO','FILTER'][i],8,y+14);text(type.toUpperCase(),8,y+25);
  levels.forEach((n,j)=>{
    const b=Art.furn(id,'mw'+n+':w_'+type+(id==='waterfilter'?'|a1':'')),px=b.rgba();
    const zoom=1.5,w=Math.round(b.W*zoom),h=Math.round(b.H*zoom);
    const ox=left+j*cw+Math.floor((cw-w)/2),oy=y+rh-h-4;
    for(let Y=0;Y<h;Y++)for(let X=0;X<w;X++){
      const k=(Math.floor(Y/zoom)*b.W+Math.floor(X/zoom))*4;
      if(px[k+3])dot(ox+X,oy+Y,[px[k],px[k+1],px[k+2]]);
    }
  });
}));
const raw=Buffer.alloc((W*4+1)*H);
for(let y=0;y<H;y++)img.copy(raw,y*(W*4+1)+1,y*W*4,(y+1)*W*4);
const table=Array.from({length:256},(_,n)=>{for(let k=0;k<8;k++)n=n&1?0xedb88320^(n>>>1):n>>>1;return n>>>0});
const crc=b=>{let n=0xffffffff;for(const x of b)n=table[(n^x)&255]^(n>>>8);return(n^0xffffffff)>>>0};
function chunk(type,data){const len=Buffer.alloc(4),body=Buffer.concat([Buffer.from(type),data]),sum=Buffer.alloc(4);len.writeUInt32BE(data.length);sum.writeUInt32BE(crc(body));return Buffer.concat([len,body,sum])}
const ih=Buffer.alloc(13);ih.writeUInt32BE(W);ih.writeUInt32BE(H,4);ih[8]=8;ih[9]=6;
const out=path.join(root,'preview/meal/water.png');fs.mkdirSync(path.dirname(out),{recursive:true});
fs.writeFileSync(out,Buffer.concat([Buffer.from([137,80,78,71,13,10,26,10]),chunk('IHDR',ih),chunk('IDAT',zlib.deflateSync(raw)),chunk('IEND',Buffer.alloc(0))]));
if(!quiet)console.log('Đạt kiểm tra hình cũ, 9 mức, 6 loại, hoạt ảnh và khoá biến thể; xuất '+path.relative(root,out));
