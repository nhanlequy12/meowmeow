"use strict";
/* Kiểm thử bảo hiểm gacha (chạy: node tools/pitytest.js). Dùng đúng mã game: data.js, wx-data.js, game.js, wx.js.
   Bảo hiểm 5★: tối đa PITY5 (40) lượt liền nhau chưa ra 5★ thì lượt thứ 40 chắc chắn 5★. Bảo hiểm 4★ sau PITY (10) lượt giữ nguyên. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let store={};globalThis.localStorage={getItem:k=>store[k]||null,setItem:(k,v)=>{store[k]=v},removeItem:k=>{delete store[k]}};
(0,eval)(['js/data.js','js/wx-data.js','js/game.js','js/wx.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},fresh,load,save,gachaRoll,gachaCore,prng,PITY,PITY5,KEY,setNotify:f=>{notify=f}};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info?'  ('+info+')':''));if(!cond)fail++};
T.setNotify(()=>{});
const R0=Math.random;
const reset=()=>{T.fresh();const S=T.S;S.tut={done:1,hints:{}};S.coins=1e9;S.tickets=1000;return S};
const roll=(tk)=>{const r=T.gachaRoll(!!tk);T.S.cats.length=Math.min(T.S.cats.length,2);return r.cat.star};
// "xui": Math.random luôn trả 0,5 nên không bao giờ tự ra 5★ (và không ra màu hiếm)
const unlucky=f=>{Math.random=()=>.5;try{return f()}finally{Math.random=R0}};

{ const S=reset();ok('Ván mới: bộ đếm bắt đầu từ 0',(S.pity5||0)===0);
  const st=unlucky(()=>{const a=[];for(let i=0;i<40;i++)a.push(roll());return a});
  ok('39 lượt đầu không có 5★, bộ đếm tăng dần',st.slice(0,39).every(s=>s<5),'sao cao nhất '+Math.max(...st.slice(0,39)));
  ok('Lượt thứ 40 chắc chắn 5★',st[39]===5);ok('Ra 5★ thì bộ đếm về 0',S.pity5===0);
  ok('Bảo hiểm 4★ sau 10 lượt vẫn còn',st[9]===4&&st[19]===4&&st[29]===4,'lượt 10, 20, 30 = '+[st[9],st[19],st[29]].join(',')); }
{ const S=reset();unlucky(()=>{for(let i=0;i<10;i++)roll()});ok('10 lượt chưa có 5★: còn tối đa 30 lượt',T.PITY5-S.pity5===30);
  unlucky(()=>{for(let i=0;i<15;i++)roll()});ok('25 lượt chưa có 5★: còn tối đa 15 lượt',T.PITY5-S.pity5===15);
  unlucky(()=>{for(let i=0;i<14;i++)roll()});ok('39 lượt chưa có 5★: lượt tiếp theo chắc chắn 5★',S.pity5===39&&unlucky(()=>roll())===5); }
{ const S=reset();unlucky(()=>{for(let i=0;i<16;i++)roll()});const c=T.gachaRoll(false,{free:1,star:5}).cat;
  ok('Lượt thứ 17 ra 5★ thì bộ đếm về 0',c.star===5&&S.pity5===0); }
{ const S=reset();S.pity5=35;const st=unlucky(()=>{const a=[];for(let i=0;i<10;i++){const r=T.gachaRoll(false);a.push(r.cat.star)}return a});
  ok('Mở 10 lượt khi bộ đếm = 35: 5★ ở lượt thứ 5 của chuỗi',st.indexOf(5)===4,st.join(''));ok('Sau chuỗi đó bộ đếm = 5',S.pity5===5); }
{ const S=reset();unlucky(()=>{for(let i=0;i<23;i++)roll(1)});T.save();const raw=store[T.KEY];T.fresh();store[T.KEY]=raw;T.load();
  ok('Lưu rồi tải lại: bộ đếm giữ nguyên',T.S.pity5===23,'pity5='+T.S.pity5+', pity='+T.S.pity); }
{ reset();const S=T.S;unlucky(()=>roll());S.pity=7;delete S.pity5;T.save();const raw=store[T.KEY];T.fresh();store[T.KEY]=raw;T.load();
  ok('Bản lưu cũ (chưa có bộ đếm 5★): giữ bộ đếm 4★ cũ, bộ đếm 5★ từ 0',T.S.pity===7&&(T.S.pity5||0)===0); }
{ const S=reset();let gap=0,max=0,n5=0;const N=300000;for(let i=0;i<N;i++){const s=roll();if(s===5){n5++;gap=0}else{gap++;if(gap>max)max=gap}}
  ok('300.000 lượt ngẫu nhiên: không chuỗi nào dài quá 39 lượt chưa có 5★',max<=39,'chuỗi dài nhất '+max+', tỉ lệ 5★ thực tế '+(n5/N*100).toFixed(2)+'%'); }
{ // lượt đầu của hướng dẫn tân thủ (min 4, max 4) không bị bảo hiểm ép lên 5★
  const S=reset();S.pity5=39;const c=T.gachaRoll(false,{free:1,min:4,max:4}).cat;ok('Lượt gacha tân thủ (ép 4★) không bị đổi thành 5★',c.star===4&&S.pity5===40);
  ok('Lượt thường ngay sau đó ra 5★',unlucky(()=>roll())===5); }
{ // trọng tài máy chủ: chạy lại bằng hạt giống phải ra cùng kết quả và cùng số gộp pity4 + 100*pity5
  const S=reset();S.pity=3;S.pity5=38;const seed=123456,M0=Math.random;Math.random=T.prng(seed);let a;try{a=T.gachaCore({}).cat}finally{Math.random=M0}
  const enc1=S.pity+100*S.pity5;reset();const S2=T.S;S2.pity=3;S2.pity5=38;Math.random=T.prng(seed);let b;try{b=T.gachaCore({}).cat}finally{Math.random=M0}
  ok('Cùng hạt giống và cùng bộ đếm thì ra cùng mèo (máy chủ kiểm lại được)',a.sp===b.sp&&a.star===b.star&&enc1===S2.pity+100*S2.pity5,a.sp+' '+a.star+'★, số gộp '+enc1); }
{ // lượt bảo hiểm 10: ra 4★ TRỞ LÊN (bốc giữa 4★ và 5★ theo tỉ lệ gốc 5:1), không ép cứng 4★
  let n4=0,n5=0;for(let i=0;i<6000;i++){const S=reset();S.pity=T.PITY-1;S.pity5=0;const s=roll();if(s===5)n5++;else if(s===4)n4++}
  ok('Lượt bảo hiểm thứ 10 luôn từ 4★ trở lên',n4+n5===6000,'4★ '+n4+', 5★ '+n5);
  ok('Lượt bảo hiểm thứ 10 có thể ra 5★ (khoảng 17–18%)',n5/6000>.14&&n5/6000<.22,(n5/60).toFixed(1)+'%'); }
console.log(fail?fail+' phần HỎNG':'Tất cả đều ĐẠT');process.exit(fail?1:0);
