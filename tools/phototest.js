"use strict";
/* Kiểm thử luật sticker của tính năng chụp ảnh phòng (chạy: node tools/phototest.js).
   Dùng đúng mã game: data.js, photo-data.js, game.js, photo.js. Phần giao diện (chụp từ canvas, album, tải về) thử bằng Playwright.
   Thoát mã 1 nếu có phần hỏng. */
const fs=require('fs'),path=require('path');const R=path.join(__dirname,'..');
let STORE=null;globalThis.localStorage={getItem(k){return k==='meoxu_v2'?STORE:null},setItem(k,v){if(k==='meoxu_v2')STORE=v},removeItem(){}};
(0,eval)(['js/data.js','js/photo-data.js','js/game.js','js/photo.js'].map(f=>fs.readFileSync(path.join(R,f),'utf8')).join('\n;\n')+
  `\n;globalThis.T={get S(){return S},set S(v){S=v},fresh,load,save,phMatch,photoAward,phPage,phCount,phHas,phUnlink,photoOpen,phS,PH_STK,PH_STK_BY,PH_PAGES,PHC,PHOTO_LV,FEATS,unlocksAt};`);
let fail=0;const ok=(name,cond,info)=>{console.log((cond?'ĐẠT ':'HỎNG')+'  '+name+(info!=null?'  ('+info+')':''));if(!cond)fail++};
const has=(snap,id)=>T.phMatch(snap).includes(id);
const cat=o=>Object.assign({uid:1,sp:'muop',star:1,v:false,rare:false,form:false,age:1,st:'idle',sleep:false,bed:false,groom:false,eat:false,drink:false,jump:false,run:false,lv:-1,heart:false,chase:false,sig:false,md:false,clone:false,wx:[]},o);
const snap=(cats,o)=>Object.assign({room:'living',out:false,wx:'sunny',hr:12,crit:false,cats},o);

// 1. dữ liệu
{const ids=T.PH_STK.map(k=>k.id);
  ok('Id sticker không trùng',new Set(ids).size===ids.length,ids.length+' sticker');
  ok('Mỗi sticker thuộc một trang có thật, có tên, biểu tượng, gợi ý',T.PH_STK.every(k=>T.PH_PAGES.some(p=>p.id===k.pg)&&k.n&&k.ic&&k.h&&typeof k.t==='function'));
  ok('Mỗi trang có 8 sticker',T.PH_PAGES.every(p=>T.PH_STK.filter(k=>k.pg===p.id).length===8));
  ok('Tính năng có trong FEATS ở cấp '+T.PHOTO_LV,T.FEATS.some(f=>f.id==='photo'&&f.lv===T.PHOTO_LV)&&T.unlocksAt(T.PHOTO_LV).includes('Chụp ảnh phòng'));
}
// 2. luật sticker (hàm thuần)
{
  ok('Ảnh phòng vắng vẫn có sticker "Tấm ảnh đầu tiên" và không có sticker mèo',JSON.stringify(T.phMatch(snap([])))==='["first"]',T.phMatch(snap([])).join(','));
  ok('Đầu vào hỏng không làm lỗi',Array.isArray(T.phMatch(null))&&T.phMatch(null).length===0&&T.phMatch({}).length===0);
  ok('Bé đang ngủ → Giấc ngủ trưa',has(snap([cat({sleep:true,st:'nap'})]),'nap'));
  ok('Bé ngủ trong ổ → Ổ ấm',has(snap([cat({sleep:true,bed:true,st:'bed'})]),'bed'));
  ok('Bé ngủ trên sàn không phải Ổ ấm',!has(snap([cat({sleep:true,st:'nap'})]),'bed'));
  ok('Liếm lông → Chải chuốt',has(snap([cat({groom:true})]),'groom'));
  ok('2 bé cùng ăn chưa đủ Bữa tiệc',!has(snap([cat({eat:true}),cat({uid:2,eat:true})]),'feast'));
  ok('3 bé cùng ăn → Bữa tiệc',has(snap([cat({eat:true}),cat({uid:2,eat:true}),cat({uid:3,eat:true})]),'feast'));
  ok('Phân thân không tính vào Bữa tiệc',!has(snap([cat({eat:true}),cat({uid:2,eat:true}),cat({uid:2,eat:true,clone:true})]),'feast'));
  ok('Uống nước → Ngụm nước mát, không phải Bữa tiệc',has(snap([cat({drink:true})]),'drink')&&!has(snap([cat({drink:true})]),'feast'));
  ok('Đang nhảy → Bay lên nào',has(snap([cat({jump:true,st:'jump'})]),'jump'));
  ok('Tầng thấp nhất của tháp chưa phải Trên đỉnh cao',!has(snap([cat({lv:0})]),'high'));
  ok('Tầng 2 trở lên → Trên đỉnh cao',has(snap([cat({lv:1})]),'high'));
  const five=n=>Array.from({length:n},(_,i)=>cat({uid:i+1}));
  ok('4 bé chưa đủ Cả nhà, 5 bé thì đủ',!has(snap(five(4)),'crowd')&&has(snap(five(5)),'crowd'));
  ok('Vừa được vuốt (tim bay) → Được cưng',has(snap([cat({heart:true})]),'pet'));
  ok('Mèo con, mèo già, ông cháu',has(snap([cat({age:0})]),'kitten')&&has(snap([cat({age:2})]),'elder')&&!has(snap([cat({age:0})]),'family')&&has(snap([cat({age:0}),cat({uid:2,age:2})]),'family'));
  ok('2 bé cùng chạy → Chạy loạn; 1 bé thì không',has(snap([cat({run:true}),cat({uid:2,run:true})]),'zoom')&&!has(snap([cat({run:true})]),'zoom'));
  ok('Đuổi khách lạ → Đi săn; có khách lạ → Khách lạ',has(snap([cat({chase:true})]),'hunt')&&has(snap([],{crit:true}),'guest')&&!has(snap([]),'guest'));
  ok('Bé 5★ → Huyền thoại; 4★ thì không',has(snap([cat({star:5})]),'star5')&&!has(snap([cat({star:4})]),'star5'));
  ok('5★ đang diễn → Khoảnh khắc vàng',has(snap([cat({star:5,sig:true,st:'sig'})]),'sig'));
  ok('Trạng thái 60 giây → Sức mạnh bùng nổ (phân thân không tính)',has(snap([cat({star:5,md:true})]),'aura')&&!has(snap([cat({star:5,md:true,clone:true})]),'aura'));
  ok('Phân thân → Phân thân',has(snap([cat({sp:'v_naruto',star:5}),cat({sp:'v_naruto',star:5,clone:true})]),'clone'));
  ok('Sao cầu vồng, trang phục hiếm',has(snap([cat({rare:true})]),'rare')&&has(snap([cat({star:5,form:true})]),'form'));
  ok('3 bé 5★ → Hội tụ; 2 bé 5★ + phân thân thì không',has(snap([cat({star:5}),cat({uid:2,star:5}),cat({uid:3,star:5})]),'trio5')&&!has(snap([cat({star:5}),cat({uid:2,star:5}),cat({uid:2,star:5,clone:true})]),'trio5'));
  ok('4 mèo trang phục → Dạ hội hóa trang',has(snap([1,2,3,4].map(u=>cat({uid:u,v:true})),),'party')&&!has(snap([1,2,3].map(u=>cat({uid:u,v:true}))),'party'));
  ok('Mưa nhẹ, mưa giông → Ngày mưa; nắng thì không',has(snap([],{wx:'drizzle'}),'rain')&&has(snap([],{wx:'storm'}),'rain')&&!has(snap([],{wx:'sunny'}),'rain'));
  ok('Tuyết, bão tuyết → Tuyết trắng',has(snap([],{wx:'snow'}),'snow')&&has(snap([],{wx:'blizzard'}),'snow'));
  ok('Chưa mở thời tiết (wx null) không có sticker thời tiết trời',['rain','snow','sun'].every(id=>!has(snap([],{wx:null,out:true}),id)));
  ok('Nắng đẹp: chỉ phòng ngoài trời, ban ngày',has(snap([],{out:true,wx:'sunny',hr:10}),'sun')&&!has(snap([],{out:false,wx:'sunny',hr:10}),'sun')&&!has(snap([],{out:true,wx:'sunny',hr:20}),'sun'));
  ok('Đêm yên: 22 giờ tới trước 5 giờ',has(snap([],{hr:23}),'night')&&has(snap([],{hr:2}),'night')&&!has(snap([],{hr:5}),'night')&&!has(snap([],{hr:21}),'night'));
  ok('Bé lạnh, nóng, ướt',has(snap([cat({wx:['cold']})]),'cold')&&has(snap([cat({wx:['hot','wet']})]),'hot')&&has(snap([cat({wx:['wet']})]),'wet'));
  ok('Thiếu trường wx của mèo không làm lỗi',!has(snap([{uid:1}]),'cold'));
  ok('Dã ngoại: 3 bé ở phòng ngoài trời',has(snap(five(3),{out:true}),'garden')&&!has(snap(five(3)),'garden')&&!has(snap(five(2),{out:true}),'garden'));
}
// 3. thưởng
{T.fresh();const S=T.S;S.level=1;
  ok('Cấp 1 chưa mở chụp ảnh, cấp 2 mở',!T.photoOpen()&&(S.level=2,T.photoOpen()));
  ok('Bản lưu cũ không có S.photo vẫn chạy',T.phCount().got===0&&!T.phHas('first'));
  const c0=S.coins,t0=S.tickets;
  let r=T.photoAward(['first','nap'],'p1',1000);
  ok('Sticker mới: +'+T.PHC.coin+' xu mỗi cái, ghi ảnh nhận',r.nw.join()==='first,nap'&&S.coins===c0+2*T.PHC.coin&&S.photo.st.first.p==='p1'&&S.photo.st.nap.t===1000);
  ok('Đếm số lần bấm máy',S.photo.n===1);
  r=T.photoAward(['first','nap'],'p2',2000);
  ok('Sticker đã có: không thưởng lại, không đổi ảnh gốc',r.nw.length===0&&r.coins===0&&S.coins===c0+2*T.PHC.coin&&S.photo.st.first.p==='p1'&&S.photo.n===2);
  r=T.photoAward(['zzz','nap','nap'],'p3',3000);
  ok('Id lạ và trùng bị bỏ qua',r.nw.length===0);
  const day=T.PH_STK.filter(k=>k.pg==='day').map(k=>k.id);
  r=T.photoAward(day,'p4',4000);
  ok('Đủ trang: +'+T.PHC.page+' vé đúng một lần',r.pages.join()==='day'&&r.tickets===T.PHC.page&&S.tickets===t0+T.PHC.page&&T.phPage('day').done);
  r=T.photoAward(day,'p5',5000);ok('Đủ trang rồi không thưởng lại',r.tickets===0&&S.tickets===t0+T.PHC.page);
  r=T.photoAward(T.PH_STK.map(k=>k.id),null,6000);
  ok('Đủ cả sổ: thêm 3 trang + '+T.PHC.book+' vé',r.pages.length===3&&r.book&&r.tickets===3*T.PHC.page+T.PHC.book&&T.phCount().got===T.PH_STK.length);
  ok('Sticker nhận khi ảnh không được lưu (album đầy) có p=null',S.photo.st.party.p===null);
  const all=T.PH_STK.length*T.PHC.coin,tk=T.PH_PAGES.length*T.PHC.page+T.PHC.book;
  ok('Tổng thưởng cả sổ nhỏ (xu '+all+', vé '+tk+')',S.coins-c0===all&&S.tickets-t0===tk&&all<=1000&&tk<=8);
  T.phUnlink('p1');ok('Xóa ảnh: sticker vẫn giữ, chỉ bỏ liên kết',T.phHas('first')&&S.photo.st.first.p===null&&S.photo.st.groom.p==='p4');
  T.save();S.photo=null;T.load();
  ok('Lưu và tải lại giữ sổ sticker',T.phCount().got===T.PH_STK.length&&T.S.photo.pg.day===4000,JSON.stringify(T.S.photo).length+' byte');
  ok('Bản lưu không chứa ảnh (S.photo nhỏ)',JSON.stringify(T.S.photo).length<4000&&!/blob|data:image/.test(JSON.stringify(T.S.photo)));
  T.S.photo='hỏng';ok('S.photo hỏng được dựng lại',T.phS().n===0&&T.phCount().got===0);
}
console.log(fail?'\n'+fail+' phần HỎNG':'\nTất cả đều đạt');process.exit(fail?1:0);
