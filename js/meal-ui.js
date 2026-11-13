"use strict";
/* ============ BỮA ĂN VÀ NƯỚC UỐNG: BẢNG MUA VÀ CHIA (2026-11-12) ============
   Nạp sau js/water-ui.js, js/med-ui.js và các file meal-*. Luật ở js/meal.js (mSuggest, mealPlan, mealBuy, mealPour); file này chỉ vẽ và gọi các hàm đó.
   - openMeal(k, iid): một bảng dùng chung cho thức ăn (k 'f', 🍚 tông cam nâu) và nước (k 'w', 💧 tông xanh).
     openFeed() và openWater() đều mở bảng này. Có iid thì chỉ làm việc với đúng bát đó (chạm vào bát trong phòng).
   - Số lượng mặc định là số gợi ý (mSuggest): đủ cho số bé cần ăn/uống trừ phần còn trong bát; không bé nào cần thì làm đầy chỗ trống.
     "✎ Tùy chỉnh số lượng" mở ô nhập, nút − và +, nút "Dùng số lượng gợi ý". Không ép đổ đầy, không tự làm tròn lên.
   - Đổ n suất: lấy từ kho trước, kho thiếu thì mua đúng phần còn thiếu. "Chỉ mua vào kho" mua n suất mà không đổ.
   - Phòng có nhiều bát: Chia đều (mặc định), Ưu tiên bát 1, Tự chọn (đặt từng bát, không vượt chỗ trống, không vượt số đã chọn).
   - Món dùng lần trước nhớ ở S.mealPick = {f: id, w: id}.
   - Hướng dẫn tân thủ: nút đổ thức ăn luôn có onclick="doFeed('<món>')"; doFeed khi bảng đang mở thì đổ theo bảng,
     khi bảng đóng thì vẫn là cho ăn nhanh theo gợi ý như cũ (feedRoom). */
// gốc bảng có lớp ml-f hoặc ml-w (không dùng .f/.w: index.html đã có .f{color:hồng} cho dấu giới tính)
const ML={k:'f',id:null,n:1,cus:0,mode:'even',per:{},iid:null,msg:''}; // msg: dòng báo ngay trong bảng (mua vào kho xong), không dùng thông báo nổi vì nó che bảng
const mlU=k=>k==='f'?'suất':'chai';
const mlXu=n=>Math.round(n).toLocaleString('vi-VN');
const mlOn=()=>$('modal').style.display==='flex'&&!!$('mbox').querySelector('.ml');
const mlItem=(k,id)=>k==='f'?FOOD[id]:DRINK[id];
// đang cho một bé ăn/uống (ML.cat) thì js/compat-meal.js xếp món hợp với bé lên đầu
const mlItems=k=>{const L=k==='f'?FOODS.slice().sort((a,b)=>locked(a)-locked(b)):DRINKS;return typeof cpfSort==='function'?cpfSort(k,L):L};
const mlTut=()=>typeof TUT!=='undefined'&&TUT.active&&TUT.active();
// tình trạng các bát (cả phòng, hoặc một bát khi có iid): sức chứa, còn lại (suất nguyên + phần ăn dở), chỗ trống
function mlStat(k,rid,iid){
  const all=mBowls(k,rid),bs=iid!=null?all.filter(b=>b.iid===iid):all;
  return {all,bs,cap:bs.reduce((a,b)=>a+MK[k].cap(b),0),have:bs.reduce((a,b)=>a+mHave(k,b)+mPartN(k,b),0),free:bs.reduce((a,b)=>a+mFree(k,b),0)};
}
// món mặc định: món dùng lần trước; hướng dẫn tân thủ chọn sẵn món đã mở khóa hợp nhất với bé khởi đầu (CP.tutFood, js/compat.js), không có thì Hạt khô
function mlDef(k){
  const P=S.mealPick||{};let id=P[k];
  if(k==='f'){if(mlTut()){const c=typeof CP!=='undefined'&&S.tut&&catBy(S.tut.cat);id=c?CP.tutFood(c):'kibble'}else if(!FOOD[id]||locked(FOOD[id]))id='kibble'}
  else if(!DRINK[id])id=typeof medS==='function'&&DRINK[medS().wd]?medS().wd:'w_plain';
  return id;
}
const mlIid=()=>ML.iid==null?undefined:ML.iid;
const mlSugRaw=()=>mSuggest(ML.k,cur,mlIid());
// số gợi ý; bát đã đầy thì gợi ý một lốc để mua vào kho (8 suất hoặc 10 chai)
const mlSugN=()=>mlSugRaw()||(ML.k==='f'?8:10);
const mlMax=()=>{const f=mlStat(ML.k,cur,ML.iid).free;return f>0?f:99};
// kế hoạch đổ theo lựa chọn hiện tại: {plan:[{iid,add}], n}
function mlPlan(){
  const k=ML.k,bs=mBowls(k,cur);
  if(ML.iid!=null){const c={};c[ML.iid]=ML.n;return mealPlan(k,cur,0,'custom',c)}
  if(bs.length>1&&ML.mode==='custom')return mealPlan(k,cur,0,'custom',ML.per);
  return mealPlan(k,cur,ML.n,bs.length>1?ML.mode:'even');
}
const mlPerSum=()=>Object.values(ML.per).reduce((a,v)=>a+(v|0),0);
// tự chọn: tổng các bát không vượt số đã chọn, bớt từ bát cuối lên
function mlTrim(){
  if(ML.mode!=='custom')return;const bs=mBowls(ML.k,cur);let over=mlPerSum()-ML.n;
  for(let i=bs.length-1;i>=0&&over>0;i--){const v=ML.per[bs[i].iid]|0,d=Math.min(v,over);ML.per[bs[i].iid]=v-d;over-=d}
}

/* ---------- mở bảng ---------- */
function openMeal(k,iid){
  const F=k==='f',all=mBowls(k,cur),any=F?bowlsIn(cur).length:wbowls(cur).length;
  if(!all.length){toast(any?(F?'Bát ăn':'Bát nước')+' trong phòng đang hỏng. Sửa bát trước rồi mới đổ được.':F?'Phòng này chưa có bát ăn. Mua ở Cửa hàng, mục Bát ăn.':'Phòng này chưa có bát nước. Mua ở Cửa hàng, mục 💧 Tiện nghi.',
    {type:'warn',icon:F?'🍚':'💧',title:F?'Cho ăn':'Nước uống'});return}
  ML.k=k;ML.iid=iid!=null&&all.some(b=>b.iid===iid)?iid:null;ML.id=mlDef(k);ML.cat=null;if(typeof cpfOpen==='function')cpfOpen(k);ML.cus=0;ML.mode='even';ML.per={};ML.msg='';ML.n=mlSugN();
  modal(mlHtml());
  // chú thích (data-tip) của nút trên thanh không được nằm đè lên bảng; bộ chú thích bật lại sau cú bấm nên ẩn ở nhịp sau
  if(typeof hideTip==='function'){hideTip();setTimeout(()=>{if(mlOn())hideTip()},40)}
}
openFeed=function(){openMeal('f')};
openWater=function(){openMeal('w')};
doWater=openWater;

/* ---------- vẽ ---------- */
function mlHtml(){
  const F=ML.k==='f';
  return '<div class="ml ml-'+ML.k+'"><div class="ml-hd" id="ml-hd">'+mlHd()+'</div>'+
    '<div class="ml-cols"><div class="ml-ls" id="ml-ls" role="listbox">'+mlLs()+'</div>'+
    '<div class="ml-r"><div class="ml-sel" id="ml-sel">'+mlSel()+'</div><div class="ml-box" id="ml-q">'+mlQ()+'</div>'+
    '<div id="ml-sp">'+mlSp()+'</div><div id="ml-ac">'+mlAc()+'</div>'+
    (F?'':'<div class="dim ml-ft">Mỗi chai là một lượt uống. Máy lọc nước chỉ rót nước đang có trong kho.</div>')+'</div></div></div>';
}
// vẽ lại từng phần, giữ vị trí cuộn; keepQ: đang gõ số thì không thay ô nhập (giữ bàn phím trên điện thoại)
function mlDraw(keepQ){
  if(!mlOn())return;const set=(id,h)=>{const e=$(id);if(e)e.innerHTML=emo(h)};
  set('ml-hd',mlHd());set('ml-ls',mlLs());set('ml-sel',mlSel());set('ml-sp',mlSp());set('ml-ac',mlAc());
  if(!keepQ)set('ml-q',mlQ());
  else{const mx=mlMax(),a=$('ml-dn'),b=$('ml-up'),h=$('ml-hint');if(a)a.disabled=ML.n<=1;if(b)b.disabled=ML.n>=mx;if(h)h.innerHTML=emo(mlHint())}
}
function mlHd(){
  const k=ML.k,F=k==='f',st=mlStat(k,cur,ML.iid),hm=homeCats(cur).length,nd=mNeedy(k,cur).length;
  let nm;
  if(ML.iid!=null){const b=st.bs[0],i=st.all.indexOf(b);nm='Bát '+(i+1)+' · '+FURN[b.fid].n}
  else nm=(F?'Bát ăn':'Bát nước')+' · <b>'+st.all.length+'</b> bát';
  const it=ML.iid!=null?S.items.find(i=>i.iid===ML.iid):null,pw=it&&(FURN[it.fid].pw||FURN[it.fid].pwx)&&typeof openPw==='function';
  return '<span class="ml-badge">'+(F?'🍚':'💧')+'</span><div class="ml-ht"><h3>Cho '+ROOM[cur].n+(F?' ăn':' uống')+'</h3>'+
    '<div class="ml-sum">'+nm+' · sức chứa <b>'+st.cap+'</b> · còn <b>'+st.have+'</b> · trống <b>'+st.free+'</b></div>'+
    '<div class="dim ml-cats">'+(hm?nd+'/'+hm+' bé '+(F?'cần ăn':'đang khát'):'Không có bé nào ở nhà')+
    (ML.iid!=null&&st.all.length>1?' · <button class="ml-lk" onclick="mlFocus(null)">↺ Cả phòng ('+st.all.length+' bát)</button>':'')+
    (pw?' · <button class="ml-lk" onclick="openPw('+it.iid+')">🔋 Pin máy</button>':'')+'</div></div>';
}
function mlLs(){
  const k=ML.k,F=k==='f',cats=homeCats(cur),X=typeof cpfItem==='function';
  // X: js/compat-meal.js vẽ icon mặt các bé hợp món (thay dấu ❤), dấu mức hợp và dòng "Hợp nhất với <bé>"
  return (X?cpfHead(k):'')+mlItems(k).map(f=>{
    const lk=F&&locked(f),on=f.id===ML.id,fav=!X&&F&&cats.some(c=>favs(c).includes(f.id)),n=mInvN(k,f.id),x=X?cpfItem(k,f,cats):{cls:'',mk:'',fans:''};
    return '<button class="ml-it'+(on?' on':'')+(lk?' lk':'')+x.cls+'" role="option" aria-selected="'+(on?'true':'false')+'" onclick="mlPick(\''+f.id+'\')">'+
      '<span class="ic">'+f.ic+'</span><span class="nm">'+f.n+(fav?'<i title="Khoái khẩu">❤</i>':'')+'</span>'+x.mk+x.fans+
      (lk?'<span class="pr">🔒 Cấp '+f.ul+'</span>':'<span class="kh">kho <b>'+n+'</b></span><span class="pr">🪙'+f.price+(F?'<small>/8</small>':'')+'</span>')+'</button>';
  }).join('');
}
function mlSel(){
  // có js/compat-meal.js thì câu "❤ Khoái khẩu của…" thành hàng icon các bé hợp và không hợp món (cpfSel), nằm ngoài <small> vì <small> bị cắt còn hai dòng
  const k=ML.k,f=mlItem(k,ML.id),X=typeof cpfSel==='function',lv=!X&&k==='f'?homeCats(cur).filter(c=>favs(c).includes(f.id)).map(c=>esc(c.name)):[];
  return '<b>'+f.ic+' '+f.n+'</b> <span class="dim">· '+f.price+' xu '+(k==='f'?'cho 8 suất':'một chai')+'</span><small>'+f.d+(lv.length?' <span class="ml-fav">❤ Khoái khẩu của '+lv.join(', ')+'</span>':'')+'</small>'+(X?cpfSel(k,f):'');
}
// vì sao gợi ý số này
function mlWhy(){
  const k=ML.k,F=k==='f',st=mlStat(k,cur,ML.iid),u=mlU(k);
  if(!st.free)return (ML.iid!=null?'Bát này':'Các bát')+' đang đầy, chỉ mua vào kho được.';
  const nd=mNeedy(k,cur).length,av=mBowls(k,cur).reduce((a,b)=>a+Math.max(0,mAvail(k,b)),0),want=nd-av;
  if(want>0)return 'Gợi ý cho '+nd+' bé '+(F?'cần ăn':'đang khát')+(av?', trừ '+av+' '+u+' còn trong bát':'')+(want>st.free?', vừa đủ chỗ trống':'')+'.';
  return (nd?'Trong bát đã đủ cho các bé':'Chưa bé nào '+(F?'cần ăn':'khát'))+', gợi ý làm đầy chỗ trống.';
}
function mlHint(){const s=mlSugN(),st=mlStat(ML.k,cur,ML.iid);return 'Gợi ý <b>'+s+'</b>'+(st.free?' · tối đa <b>'+st.free+'</b> (chỗ trống)':'')}
function mlQ(){
  const k=ML.k,u=mlU(k),lab=k==='f'?'Số suất':'Số chai';
  if(!ML.cus)return '<div class="ml-q"><span>'+lab+' <b class="ml-big">'+ML.n+'</b></span>'+
    '<button class="ml-lk" onclick="mlCus(1)">✎ Tùy chỉnh số lượng</button><div class="dim ml-why">'+mlWhy()+'</div></div>';
  const mx=mlMax();
  return '<div class="ml-q"><span>'+lab+'</span><div class="ml-step"><button class="ml-pm" id="ml-dn" aria-label="Bớt một" '+(ML.n<=1?'disabled':'')+' onclick="mlAdd(-1)">−</button>'+
    '<input id="ml-n" type="text" inputmode="numeric" pattern="[0-9]*" maxlength="2" aria-label="'+lab+'" value="'+ML.n+'" oninput="mlIn(this)" onchange="mlCh(this)" onkeydown="if(event.key===\'Enter\')this.blur()">'+
    '<button class="ml-pm" id="ml-up" aria-label="Thêm một" '+(ML.n>=mx?'disabled':'')+' onclick="mlAdd(1)">+</button><span>'+u+'</span></div>'+
    '<button class="sm" onclick="mlSug()">Dùng số lượng gợi ý</button><div class="dim ml-why" id="ml-hint">'+mlHint()+'</div></div>';
}
// phần chia: chỉ khi phòng có nhiều hơn một bát và không đang chọn riêng một bát
function mlSp(){
  const k=ML.k,bs=mBowls(k,cur),u=mlU(k);
  if(ML.iid!=null||bs.length<2||!mlStat(k,cur).free)return '';
  const M=[['even','Chia đều'],['first','Ưu tiên bát 1'],['custom','Tự chọn']];
  let h='<div class="ml-box"><div class="ml-seg" role="radiogroup" aria-label="Cách chia">'+M.map(m=>'<button class="sm'+(ML.mode===m[0]?' on':'')+'" role="radio" aria-checked="'+(ML.mode===m[0])+'" onclick="mlMode(\''+m[0]+'\')">'+m[1]+'</button>').join('')+'</div>';
  if(ML.mode==='custom'){
    const sum=mlPerSum();
    h+=bs.map((b,i)=>{const v=ML.per[b.iid]|0,fr=mFree(k,b);
      return '<div class="ml-bw"><span class="g"><b>Bát '+(i+1)+'</b> <small>'+FURN[b.fid].n+' · còn '+(mHave(k,b)+mPartN(k,b))+'/'+MK[k].cap(b)+' · trống '+fr+'</small></span>'+
        '<button class="ml-pm" aria-label="Bớt ở bát '+(i+1)+'" '+(v<=0?'disabled':'')+' onclick="mlPer('+b.iid+',-1)">−</button><b class="v">'+v+'</b>'+
        '<button class="ml-pm" aria-label="Thêm ở bát '+(i+1)+'" '+(v>=fr||sum>=ML.n?'disabled':'')+' onclick="mlPer('+b.iid+',1)">+</button></div>'}).join('')+
      '<div class="dim ml-why">Đã chia <b>'+sum+'</b>/'+ML.n+' '+u+(sum<ML.n?' · còn '+(ML.n-sum)+' '+u+' chưa vào bát nào, sẽ không đổ':'')+'</div>';
  }else{
    const P=mlPlan();
    h+='<div class="ml-pv">'+bs.map((b,i)=>{const a=(P.plan.find(p=>p.iid===b.iid)||{}).add||0,hv=mHave(k,b)+mPartN(k,b);
      return '<span'+(a?'':' class="z"')+'>Bát '+(i+1)+' <b>+'+a+'</b> → '+(hv+a)+'/'+MK[k].cap(b)+'</span>'}).join('')+'</div>';
  }
  return h+'</div>';
}
function mlAc(){
  const k=ML.k,F=k==='f',id=ML.id,f=mlItem(k,id),u=mlU(k),lk=F&&locked(f),P=mlPlan(),n=P.n,st=mInvN(k,id),lack=Math.max(0,n-st),cost=mPrice(k,id,lack),buyC=mPrice(k,id,ML.n);
  const full=!mlStat(k,cur,ML.iid).free,ok=!lk&&n>0&&S.coins>=cost,on='\''+id+'\'';
  const cl=lk?'<span class="ml-bad">'+f.n+' mở ở cấp '+f.ul+'.</span>':full?'Kho có <b>'+st+'</b> '+u+' '+f.n+'.':
    (lack?'Kho có <b>'+st+'</b> · mua thêm <b>'+lack+'</b> '+u:'Lấy đủ từ kho (có <b>'+st+'</b>)')+' · Tổng <b class="tot">'+mlXu(cost)+' xu</b>'+(S.coins<cost?' <span class="ml-bad">· không đủ xu</span>':'');
  return (ML.msg?'<div class="ml-msg" role="status">'+ML.msg+'</div>':'')+'<div class="ml-cost">'+cl+'</div><div class="ml-ac">'+
    '<button class="ml-go" '+(ok?'':'disabled')+' onclick="'+(F?'doFeed('+on+')':'mlGo('+on+')')+'">'+(full?(F?'🍚':'💧')+' Bát đã đầy':(F?'🍚':'💧')+' Đổ <b>'+n+'</b> '+u+(cost?' · 🪙 '+mlXu(cost):''))+'</button>'+
    '<button class="ml-buy" '+(lk||S.coins<buyC?'disabled':'')+' onclick="mlBuy('+on+')">📦 Chỉ mua '+ML.n+' vào kho<small>🪙 '+mlXu(buyC)+'</small></button></div>';
}

/* ---------- thao tác ---------- */
function mlPick(id){const f=mlItem(ML.k,id);if(!f)return;ML.msg='';if(ML.k==='f'&&locked(f)){toast(f.n+' mở ở cấp '+f.ul+'.',{icon:'🔒',title:'Chưa mở khóa',key:'mllock'});return}ML.id=id;mlDraw()}
function mlCus(on){ML.cus=on?1:0;mlDraw();if(on){const e=$('ml-n');if(e&&matchMedia('(pointer:fine)').matches){e.focus();e.select()}}}
function mlSug(){ML.n=mlSugN();ML.cus=0;mlTrim();mlDraw()}
function mlAdd(d){ML.n=clamp(ML.n+d,1,mlMax());mlTrim();mlDraw()}
// gõ số: chỉ vẽ lại khi số thật sự đổi. Rời ô nhập (change) thường không đổi gì nên không thay nút, tránh mất cú bấm đang diễn ra
function mlIn(e){const v=parseInt(String(e.value).replace(/\D/g,''),10);if(isNaN(v))return;const n=clamp(v,1,mlMax());if(n===ML.n)return;ML.n=n;mlTrim();mlDraw(1)}
function mlCh(e){mlIn(e);if(String(e.value)!==String(ML.n))e.value=ML.n}
function mlFocus(iid){ML.iid=iid;ML.mode='even';ML.per={};ML.n=mlSugN();mlDraw()}
function mlMode(m){
  if(m==='custom'&&ML.mode!=='custom'){const p=mealPlan(ML.k,cur,ML.n,ML.mode);ML.per={};p.plan.forEach(x=>{ML.per[x.iid]=x.add})}
  ML.mode=m;mlDraw();
}
function mlPer(iid,d){
  const b=mBowls(ML.k,cur).find(x=>x.iid===iid);if(!b)return;const v=(ML.per[iid]|0)+d;
  if(v<0||v>mFree(ML.k,b)||(d>0&&mlPerSum()>=ML.n))return;ML.per[iid]=v;mlDraw();
}
const mlRemember=(k,id)=>{(S.mealPick=S.mealPick||{})[k]=id};
// chỉ mua vào kho, không đổ; bảng vẫn mở
function mlBuy(id){
  const k=ML.k,f=mlItem(k,id),r=mealBuy(k,id,ML.n);if(r.err){toast(r.err,{type:'warn'});return}
  mlRemember(k,id);save();
  ML.msg='✓ Đã mua <b>'+r.n+'</b> '+mlU(k)+' '+f.n+' vào kho · −'+mlXu(r.cost)+' xu. Kho có <b>'+mInvN(k,id)+'</b>.';
  render();mlDraw();
}
// đổ theo bảng: kho trước, thiếu thì mua đúng phần còn thiếu, rồi rót theo kế hoạch chia
function mlGo(id){
  const k=ML.k,F=k==='f',rid=cur;id=id||ML.id;const f=mlItem(k,id);if(!f)return;
  if(F&&locked(f)){toast(f.n+' mở ở cấp '+f.ul+'.',{type:'warn'});return}
  const P=mlPlan();if(!P.n){toast(mlStat(k,rid,ML.iid).free?'Chưa chia suất nào vào bát.':'Các bát đều đang đầy.',{icon:F?'🍚':'💧',title:F?'Cho ăn':'Nước uống'});mlDraw();return}
  const lack=Math.max(0,P.n-mInvN(k,id));let cost=0;
  if(lack){const b=mealBuy(k,id,lack);if(b.err){toast(b.err,{type:'warn'});mlDraw();return}cost=b.cost}
  const was=new Set(S.cats.filter(c=>mealOf(c)).map(c=>c.uid));
  if(F&&typeof dispel==='function')dispel(); // cho ăn thì mọi phân thân của Naruto trong phòng biến lại thành một
  const r=mealPour(k,rid,id,P.plan);
  if(r.err){toast(r.err,{type:'warn'});render();mlDraw();return}
  mlRemember(k,id);save();closeModal();
  const go=homeCats(rid).filter(c=>mealOf(c)&&c.meal.k===k&&!was.has(c.uid)),loved=F?go.filter(c=>favs(c).includes(id)).map(c=>c.name):[],u=mlU(k);
  // toast tự esc() nội dung: không chèn thẻ HTML, không esc() trước (từng hiện nguyên chữ "<b>1</b>")
  toast('Đã đổ '+r.n+' '+u+' vào '+r.bowls.length+' bát'+(cost?' (mua thêm '+lack+' '+u+', −'+mlXu(cost)+' xu)':'')+'. Kho còn '+mInvN(k,id)+' '+u+'.'+
    (go.length?' '+go.length+' bé chạy ra '+(F?'ăn':'uống')+'.':'')+(loved.length?' ❤ Món khoái khẩu của '+loved.join(', ')+'.':''),
    F?{type:'feed',title:f.n+' · '+ROOM[rid].n}:{icon:'💧',title:f.n+' · '+ROOM[rid].n,key:'water'});
  render();
}
// doFeed: bảng đang mở thì đổ theo bảng; bảng đóng thì cho ăn nhanh theo gợi ý như cũ (feedRoom)
{const QF=doFeed;doFeed=function(fid){if(mlOn()&&ML.k==='f'&&FOOD[fid])return mlGo(fid);return QF.apply(this,arguments)}}
// chạm vào bát trong phòng (ngoài chế độ sắp xếp): mở đúng bảng, chọn sẵn bát đó
{const D0=wxDevTap;wxDevTap=function(it){const k=it&&!edit&&!it.broken&&mbOf(it);if(k){openMeal(k,it.iid);return true}return D0.apply(this,arguments)}}

/* ---------- nút Cho ăn trên thanh của tab Phòng: ghi còn/sức chứa ---------- */
{const H0=PANEL.home;PANEL.home=function(){
  const h=H0.apply(this,arguments);if(edit||!bowlsIn(cur).length)return h;
  const st=mlStat('f',cur),sg=st.free?mSuggest('f',cur):0,nd=mNeedy('f',cur).length,av=st.all.reduce((a,b)=>a+Math.max(0,mAvail('f',b)),0),go=st.free>0&&(!st.have||nd>av);
  const btn='<button class="fdgo'+(go?' go':'')+'" onclick="openFeed()" data-tip="'+(st.all.length?'Bát ăn còn '+st.have+'/'+st.cap+' suất, trống '+st.free+'. ':'Bát ăn đang hỏng. ')+'Kho thức ăn có '+fdStock()+' suất.'+(sg?' Gợi ý đổ '+sg+' suất.':'')+'">🍚 '+
    (st.all.length?'Cho ăn <small>'+st.have+'/'+st.cap+'</small>':'Bát ăn hỏng')+'</button>';
  return h.replace(/<button class="fdgo[^"]*"[^>]*onclick="openFeed\(\)">[\s\S]*?<\/button>/,btn);
}}

document.head.insertAdjacentHTML('beforeend','<style>'+
'.ml{text-align:left;--mc:#c46a28;--mk:#8a4310;--mt:color-mix(in srgb,var(--mc) 15%,var(--panel))}'+
'.ml.ml-w{--mc:#2f7cc0;--mk:#17578f}'+
'html[data-theme=dark] .ml.ml-f{--mc:#e2985a;--mk:#f2bb8a}html[data-theme=dark] .ml.ml-w{--mc:#6aaee8;--mk:#a6d0f4}'+
'.mwrap:has(>#mbox>.ml),#modal .box:has(>.ml){max-width:min(820px,100%)}'+
'.ml-hd{display:flex;gap:9px;align-items:center;padding-right:28px;margin-bottom:7px}'+
'.ml-badge{flex:none;width:40px;height:40px;border-radius:12px;display:grid;place-items:center;font-size:23px;background:var(--mt);border:2px solid var(--mc)}'+
'.ml-ht{min-width:0}.ml-hd h3{margin:0 0 1px;font-size:16px;color:var(--mk)}'+
'.ml-sum{font-size:13px}.ml-sum b,.ml-cost b,.ml-why b{color:var(--mk);font-size:1.12em}'+
'.ml-cols{display:grid;grid-template-columns:minmax(0,.92fr) minmax(0,1.08fr);gap:10px;align-items:start}'+
'.ml-ls{display:flex;flex-direction:column;gap:4px;max-height:min(440px,calc(var(--vvh,100dvh) - 150px));overflow-y:auto;overflow-x:hidden;padding:2px 3px 2px 1px}'+
'.ml-it{display:flex;align-items:center;gap:6px;width:100%;min-height:38px;padding:3px 8px;text-align:left;font-size:13px;border-bottom-width:3px;flex:none}'+
'.ml-it .ic{font-size:19px;flex:none;width:24px;text-align:center}.ml-it .nm{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}'+
'.ml-it .nm i{font-style:normal;color:#d0466a;margin-left:4px}.ml-it .kh{flex:none;font-size:11.5px;color:var(--dim)}.ml-it .pr{flex:none;font-size:12px;min-width:44px;text-align:right}.ml-it .pr small{font-size:10px;color:var(--dim)}'+
'.ml-it.on,html[data-theme=dark] .ml-it.on{color:var(--ink);background:var(--mt);border-color:var(--mc);box-shadow:inset 5px 0 0 var(--mc)}.ml-it.lk{opacity:.55}'+
'.ml-r{display:flex;flex-direction:column;gap:7px;min-width:0;max-height:min(600px,calc(var(--vvh,100dvh) - 150px));overflow-y:auto;overflow-x:hidden;padding-right:2px}'+'#ml-ac{position:sticky;bottom:0;z-index:1;background:var(--bg);padding-top:4px;margin-top:auto;box-shadow:0 -8px 8px -6px var(--bg)}'+
'.ml-sel{font-size:13.5px;line-height:1.3}.ml-sel small{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;color:var(--dim);font-size:12px}.ml-fav{color:#c0405f}'+
'.ml-box{background:var(--panel);border:2px solid var(--soft);border-radius:12px;padding:7px 9px}'+
'.ml-q{display:flex;flex-wrap:wrap;align-items:center;gap:5px 10px}.ml-why{flex:1 1 100%;font-size:12px}'+
'.ml-big{font-size:24px;color:var(--mk);margin-left:3px}'+
'button.ml-lk{background:none;border:0;padding:2px 2px;min-height:30px;color:var(--mk);text-decoration:underline dotted;text-underline-offset:3px;font-size:12.5px}'+
'.ml-step{display:flex;align-items:center;gap:6px}'+
'.ml-pm{min-width:40px;min-height:40px;padding:0;font-size:22px;line-height:1;flex:none}'+
'.ml-step input{flex:none;width:58px;text-align:center;font-size:19px;padding:5px 4px}'+
'.ml-seg{display:flex;gap:4px}.ml-seg button{flex:1 1 0;min-width:0;min-height:36px;padding:3px 4px;font-size:12.5px}'+
'.ml-seg button.on{background:var(--mc);color:#fff;border-color:var(--mk)}html[data-theme=dark] .ml-seg button.on{color:#1d140e}'+
'.ml-pv{display:flex;flex-wrap:wrap;gap:4px;margin-top:6px;font-size:12px}.ml-pv span{padding:2px 8px;border-radius:8px;background:var(--mt);border:1px solid var(--mc)}.ml-pv span.z{opacity:.6;border-style:dashed}'+
'.ml-bw{display:flex;align-items:center;gap:6px;margin-top:5px}.ml-bw .g{flex:1;min-width:0;font-size:12.5px;line-height:1.2}.ml-bw small{display:block}.ml-bw b.v{min-width:24px;text-align:center;font-size:17px}'+
'.ml-cost{font-size:13px}.ml-cost b.tot{font-size:16px}.ml-bad{color:var(--bad)}'+
'.ml-ac{display:flex;gap:6px;flex-wrap:wrap;margin-top:5px}'+
'.ml-go{flex:1 1 55%;min-height:44px;background:var(--mc);color:#fff;border-color:var(--mk);font-size:14.5px}html[data-theme=dark] .ml-go{color:#1d140e}'+
'.ml-buy{flex:1 1 35%;min-height:44px;font-size:12.5px;padding:4px 8px;line-height:1.2}.ml-buy small{display:block;font-size:12px}'+
'.ml-ft{font-size:11.5px}.ml-msg{font-size:12.5px;padding:3px 8px;margin-bottom:4px;border-radius:8px;background:color-mix(in srgb,var(--good,#1c6340) 14%,var(--panel));border:1px solid var(--good,#1c6340)}'+
'@media(max-width:560px){.ml-cols{grid-template-columns:1fr}.ml-ls,.ml-r{max-height:none;overflow:visible}}'+
'@media(max-height:520px){.ml-hd{margin-bottom:4px}.ml-badge{width:30px;height:30px;font-size:18px}.ml-hd h3{display:inline;font-size:15px;margin-right:6px}.ml-sum,.ml-cats{display:inline}.ml-cats::before{content:" · "}'+'.ml-r{gap:5px}.ml-box{padding:5px 8px}.ml-go,.ml-buy{min-height:40px}.ml-sel small{-webkit-line-clamp:1}.ml-ls,.ml-r{max-height:calc(var(--vvh,100dvh) - 92px)}}'+
'</style>');
// ui.js vẽ giao diện lần đầu ngay khi nạp xong chính nó, trước khi các file nạp sau (nút Cho uống, nút Nhà thuốc ở thanh bên trái...) kịp bọc PANEL.home
// và renderTop; vẽ lại một lần khi trang đã nạp đủ để những nút đó hiện ngay, không phải đợi lần vẽ lại kế tiếp
addEventListener('load',()=>{try{render()}catch(e){}});
