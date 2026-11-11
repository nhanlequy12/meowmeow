"use strict";
/* ============ THÀNH TỰU (2026-11-11) ============
   105 thành tựu chia 5 nhóm, bốn mức Dễ, Vừa, Khó, Rất khó; đạt mỗi cái được ACH_XU xu (tự cộng, có thông báo).
   Số liệu đếm dồn lưu ở S.st (cộng qua onAct mà game.js và quest.js gọi); phần còn lại đọc thẳng từ trạng thái (cấp, số mèo, sưu tập, phòng, đồ...).
   Thành tựu đã đạt lưu ở S.ach[id] = thời điểm đạt. Trang xem nằm trong tab Sưu tập, mục 🏆 Thành tựu (achPage).
   Chỉ xét sau khi xong hướng dẫn tân thủ. */
const ACH_XU=30;
const ACH_DIFF=[['Dễ','#5f9e6e'],['Vừa','#4f86c0'],['Khó','#8a64c8'],['Rất khó','#c98a10']];
const ACH_CAT=[['trip','🎒 Viễn chinh và cột mốc'],['care','🍖 Chăm sóc'],['coll','🥚 Gacha và sưu tập'],['home','🏠 Nhà cửa'],['play','🦋 Khách lạ và nhiệm vụ']];
const stv=k=>()=>(S.st&&S.st[k])||0;
const ACH=[];
// một chuỗi thành tựu cùng thước đo: tiers = [[mốc, độ khó, tên], ...]; dsc(n) = mô tả
function achSer(cat,key,val,dsc,tiers){tiers.forEach(([n,df,t])=>ACH.push({id:key+'_'+n,cat,t,d:dsc(n),diff:df,goal:n,val}))}
const fN=n=>n.toLocaleString('vi-VN');
// --- Viễn chinh và cột mốc ---
achSer('trip','trip',stv('trip'),n=>'Hoàn thành '+fN(n)+' chuyến viễn chinh.',[[1,0,'Chuyến đi đầu tiên'],[10,0,'Mèo xê dịch'],[50,1,'Dân phượt'],[200,2,'Nhà thám hiểm'],[500,2,'Lữ khách lão luyện'],[1000,3,'Vạn dặm đường mèo'],[2500,3,'Huyền thoại du hành']]);
achSer('trip','tcoin',stv('tripcoin'),n=>'Kiếm tổng cộng '+fN(n)+' xu từ viễn chinh.',[[1000,0,'Túi xu đầu tiên'],[10000,1,'Hũ vàng nhỏ'],[50000,1,'Két sắt mini'],[200000,2,'Đại gia xóm mèo'],[1000000,3,'Triệu phú meo'],[3000000,3,'Tỷ phú lông xù']]);
achSer('trip','lv',()=>S.level,n=>'Đạt cấp '+n+'.',[[3,0,'Chập chững'],[5,0,'Nhà nuôi mèo'],[10,1,'Sen lành nghề'],[15,2,'Sen kỳ cựu'],[18,2,'Đỉnh cấp 18']]);
// --- Chăm sóc ---
achSer('care','feed',stv('feed'),n=>'Cho mèo ăn '+fN(n)+' lần.',[[1,0,'Bữa đầu tiên'],[10,0,'Đầu bếp tập sự'],[100,1,'Bếp trưởng'],[500,2,'Nhà hàng meo'],[2000,2,'Bếp ăn tập thể'],[6000,3,'Thần bếp']]);
achSer('care','fav',stv('fav'),n=>'Cho bé ăn đúng món khoái khẩu '+fN(n)+' lần.',[[1,0,'Trúng món khoái khẩu'],[25,1,'Hiểu khẩu vị'],[100,2,'Sành ăn'],[500,3,'Tri kỷ ẩm thực']]);
achSer('care','pet',stv('pet'),n=>'Vuốt ve mèo '+fN(n)+' lần.',[[1,0,'Cái vuốt đầu tiên'],[100,0,'Bàn tay ấm'],[1000,1,'Chuyên gia gãi cằm'],[5000,2,'Bậc thầy vuốt ve'],[20000,3,'Bàn tay vàng'],[60000,3,'Thánh vuốt mèo']]);
achSer('care','hp100',()=>S.cats.some(c=>c.hp>=99.5)?1:0,()=>'Có một bé vui 100%.',[[1,0,'Bé vui hết cỡ']]);
achSer('care','hpall',()=>S.cats.length>=10&&S.cats.reduce((a,c)=>a+c.hp,0)/S.cats.length>=90?1:0,()=>'Nhà có từ 10 bé, độ vui trung bình từ 90% trở lên.',[[1,2,'Cả nhà hạnh phúc']]);
achSer('care','kit',()=>S.cats.some(c=>ageStage(c)===0)?1:0,()=>'Nuôi một bé mèo con.',[[1,0,'Mèo con nhà mình']]);
achSer('care','old',()=>S.cats.some(c=>ageStage(c)===2)?1:0,()=>'Có một bé mèo già trong nhà.',[[1,1,'Bạn già']]);
// --- Gacha và sưu tập ---
const allSp=()=>BREEDS.concat(VARIANTS);
achSer('coll','gacha',stv('gacha'),n=>'Quay gacha '+fN(n)+' lượt.',[[1,0,'Quả trứng đầu tiên'],[10,0,'Ghiền quay'],[50,1,'Tay quay cứng'],[200,2,'Nghiện gacha'],[500,2,'Máy quay trứng'],[1000,3,'Vua gacha']]);
achSer('coll','cats',()=>S.cats.length,n=>'Nuôi cùng lúc '+n+' bé.',[[5,0,'Năm bé một nhà'],[20,1,'Nhà đông vui'],[50,2,'Trại mèo'],[100,3,'Vương quốc mèo'],[150,3,'Đế chế lông xù']]);
achSer('coll','breed',()=>BREEDS.filter(b=>S.seen[b.id]).length,n=>n>=BREEDS.length?'Gặp đủ mọi giống mèo thật.':'Gặp '+n+' giống mèo thật.',[[10,0,'Nhà sưu tầm'],[30,1,'Bách khoa giống mèo'],[60,2,'Chuyên gia giống'],[BREEDS.length,3,'Đủ mọi giống thật']]);
achSer('coll','cos',()=>VARIANTS.filter(v=>S.seen[v.id]).length,n=>n>=VARIANTS.length?'Gặp đủ mọi mèo trang phục.':'Gặp '+n+' mèo trang phục.',[[5,1,'Mèo cosplay'],[20,2,'Hội cosplay'],[VARIANTS.length,3,'Đủ dàn cosplay']]);
achSer('coll','rare',()=>Object.keys(S.seenRare||{}).length,n=>n>=RARES.length?'Gặp đủ mọi màu lông hiếm.':'Gặp '+n+' màu lông hiếm.',[[1,1,'Màu hiếm đầu tiên'],[5,2,'Bảng màu quý'],[RARES.length,3,'Cầu vồng trọn vẹn']]);
achSer('coll','five',()=>allSp().filter(s=>s.r===5&&S.seen[s.id]).length,n=>n>=allSp().filter(s=>s.r===5).length?'Gặp đủ mọi bé 5★.':'Gặp '+n+' bé 5★ khác nhau.',[[1,1,'Huyền thoại đầu tiên'],[5,2,'Ngũ huyền thoại'],[allSp().filter(s=>s.r===5).length,3,'Đại sảnh huyền thoại']]);
achSer('coll','form',()=>Object.keys(S.seenCoat||{}).filter(k=>(ALLCOAT[k.split('~')[1]]||{}).form).length,n=>'Gặp '+n+' trang phục hiếm của bé 5★.',[[1,2,'Trang phục hiếm'],[5,3,'Tủ đồ huyền thoại']]);
achSer('coll','rel',()=>S.released||0,n=>'Phóng sinh '+fN(n)+' bé về mái ấm mới.',[[1,0,'Lời tạm biệt'],[10,1,'Mái ấm mới'],[50,2,'Trạm cứu hộ'],[200,3,'Sứ giả nhân ái']]);
// --- Nhà cửa ---
const furnOwned=()=>new Set(S.items.map(i=>i.fid));
const SETS=[...new Set(FURNS.filter(f=>f.set).map(f=>f.set))];
const setsDone=()=>{const o=furnOwned();return SETS.filter(s=>FURNS.filter(f=>f.set===s).every(f=>o.has(f.id))).length};
achSer('home','room',()=>Object.keys(S.rooms).length,n=>n>=ROOMS.length?'Sở hữu đủ mọi phòng.':'Sở hữu '+n+' phòng.',[[3,0,'Nhà ba phòng'],[6,1,'Nhà rộng'],[10,2,'Biệt thự'],[ROOMS.length,3,'Lâu đài mèo']]);
achSer('home','buy',stv('buy'),n=>'Mua '+fN(n)+' món nội thất.',[[1,0,'Món đồ đầu tiên'],[10,0,'Thích mua sắm'],[30,1,'Tín đồ nội thất'],[75,2,'Nhà trang trí'],[150,3,'Cuồng mua sắm']]);
achSer('home','furn',()=>furnOwned().size,n=>n>=FURNS.length?'Có đủ mọi món nội thất trong cửa hàng.':'Có '+n+' món nội thất khác nhau.',[[10,0,'Mười món khác nhau'],[40,1,'Bộ sưu tập nội thất'],[80,2,'Nhà đầy đồ'],[FURNS.length,3,'Đủ mọi món']]);
achSer('home','set',setsDone,n=>n>=SETS.length?'Có trọn mọi bộ theo mùa và bộ chủ đề.':'Có trọn '+n+' bộ theo mùa hoặc bộ chủ đề.',[[1,1,'Trọn bộ'],[SETS.length,3,'Bậc thầy trang trí']]);
achSer('home','coin',()=>S.coins,n=>'Có '+fN(n)+' xu cùng lúc.',[[10000,1,'Có của ăn của để'],[100000,2,'Két đầy xu'],[1000000,3,'Núi vàng']]);
achSer('home','tk',()=>S.tickets,n=>'Để dành '+n+' vé gacha cùng lúc.',[[10,1,'Sưu tầm vé'],[50,2,'Kho vé']]);
// --- Khách lạ và nhiệm vụ ---
achSer('play','catch',stv('catch'),n=>'Bắt '+fN(n)+' vị khách lạ trong phòng.',[[1,0,'Bắt được rồi!'],[10,0,'Thợ săn nhỏ'],[50,1,'Thợ săn lành nghề'],[200,2,'Mắt diều hâu'],[500,2,'Phản xạ mèo'],[1000,3,'Thần săn']]);
achSer('play','gold',stv('gold'),n=>'Bắt '+n+' con bướm vàng.',[[1,2,'Bướm vàng'],[10,3,'Kẻ săn bướm vàng']]);
achSer('play','quest',stv('quest'),n=>'Hoàn thành '+fN(n)+' nhiệm vụ.',[[1,0,'Nhiệm vụ đầu tiên'],[10,0,'Người chăm chỉ'],[50,1,'Chiến binh nhiệm vụ'],[200,2,'Không bỏ sót'],[500,3,'Cỗ máy nhiệm vụ']]);
achSer('play','qday',stv('qday'),n=>'Xong cả ba nhiệm vụ trong '+n+' ngày.',[[1,0,'Trọn một ngày'],[7,1,'Một tuần chăm chỉ'],[30,2,'Một tháng bền bỉ'],[100,3,'Trăm ngày như một']]);

function achSeed(){S.st=S.st||{};if(S.q&&S.q.n>(S.st.catch||0))S.st.catch=S.q.n}
const achN=()=>ACH.filter(a=>S.ach&&S.ach[a.id]).length;
function achCheck(){
  if(!qOn())return;S.ach=S.ach||{};achSeed();const got=[];
  ACH.forEach(a=>{if(!S.ach[a.id]&&a.val()>=a.goal){S.ach[a.id]=now();got.push(a)}});
  if(!got.length)return;
  S.coins+=got.length*ACH_XU;save();
  if(got.length===1){const a=got[0];toast(a.t+' · '+a.d,{type:'level',title:'Thành tựu '+ACH_DIFF[a.diff][0].toLowerCase(),icon:'🏆',coins:ACH_XU})}
  else toast(got.slice(0,3).map(a=>a.t).join(', ')+(got.length>3?' và '+(got.length-3)+' thành tựu khác':'')+'. Xem ở Sưu tập.',{type:'level',title:'Mở '+got.length+' thành tựu',icon:'🏆',coins:got.length*ACH_XU});
  if(tab==='album'&&albumG==='ach')renderPanel();
}
let achT=0;
// đếm dồn: mọi lời gọi onAct (quest.js đã gán trước) đều được cộng vào S.st; xét thành tựu sau 0,4 giây để các việc liền nhau gộp thành một thông báo
{const prev=onAct;onAct=(k,v)=>{prev(k,v);if(!qOn())return;S.st=S.st||{};S.st[k]=(S.st[k]||0)+(v==null?1:v);clearTimeout(achT);achT=setTimeout(achCheck,400)}}
setInterval(()=>{if(S&&qOn())achCheck()},3000);   // thành tựu đọc từ trạng thái (xu, độ vui, số mèo...) xét định kỳ

function achPage(){
  S.ach=S.ach||{};const n=achN();
  const row=a=>{const done=S.ach[a.id],v=Math.min(a.val(),a.goal),D=ACH_DIFF[a.diff];
    return '<div class="achc'+(done?' done':'')+'"><div class="aic">'+(done?'🏆':'🔒')+'</div><div class="g"><b>'+a.t+'</b> <span class="adf" style="background:'+D[1]+'">'+D[0]+'</span><br><small>'+a.d+'</small>'+
      (done?'<br><small class="dim">✅ Đạt ngày '+new Date(done).toLocaleDateString('vi-VN')+' · +'+ACH_XU+' xu</small>':a.goal>1?'<div class="bar"><i style="width:'+Math.floor(v/a.goal*100)+'%"></i></div><small class="dim">'+fN(Math.floor(v))+'/'+fN(a.goal)+'</small>':'')+'</div></div>'};
  return '<div class="dim" style="margin-bottom:8px">🏆 Đã đạt <b>'+n+'/'+ACH.length+'</b> thành tựu, nhận '+fN(n*ACH_XU)+' xu. Mỗi thành tựu thưởng '+ACH_XU+' xu, tự cộng khi đạt. Mức khó: '+ACH_DIFF.map(d=>'<span class="adf" style="background:'+d[1]+'">'+d[0]+'</span>').join(' ')+'</div>'+
    ACH_CAT.map(([c,lb])=>{const L=ACH.filter(a=>a.cat===c);return '<div class="achh"><b>'+lb+'</b> <small class="dim">· '+L.filter(a=>S.ach[a.id]).length+'/'+L.length+'</small></div><div class="achg">'+L.map(row).join('')+'</div>'}).join('');
}
if(typeof S!=='undefined'&&S)achCheck();
