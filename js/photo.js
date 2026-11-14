"use strict";
/* ============ CHỤP ẢNH PHÒNG: luật sticker và thưởng (2026-11-14) ============
   Không đụng DOM, chạy được trong Node (tools/phototest.js). Nạp sau js/compat.js, trước js/ui.js. Dữ liệu ở js/photo-data.js.
   Bản lưu chỉ giữ siêu dữ liệu nhỏ: S.photo={n (số lần bấm máy), st:{id sticker:{t, p (id ảnh nhận sticker, null nếu ảnh không được lưu)}},
   pg:{id trang: lúc nhận vé}, all (lúc đủ cả sổ)}. Ảnh nằm ở IndexedDB của trình duyệt (js/photo-store.js), không lên máy chủ.
   - phMatch(snap): danh sách id sticker mà ảnh chụp trạng thái snap thỏa (hàm thuần, thứ tự như PH_STK).
   - photoAward(ids, pid, t): ghi sticker mới, cộng xu, cộng vé khi đủ trang hoặc đủ sổ; trả {nw, coins, tickets, pages, book}.
   - phHas(id), phPage(pid) {got, all, done}, phCount() {got, all}. photoOpen(): đã tới cấp mở. */
const phS=()=>{
  if(!S.photo||typeof S.photo!=='object')S.photo={};
  const p=S.photo;p.n=Math.max(0,p.n|0);
  if(!p.st||typeof p.st!=='object')p.st={};
  if(!p.pg||typeof p.pg!=='object')p.pg={};
  return p;
};
const photoOpen=()=>!!S&&S.level>=PHOTO_LV;
function phMatch(snap){
  if(!snap||!Array.isArray(snap.cats))return [];
  const s=Object.assign({room:'',out:false,wx:null,hr:12,crit:false},snap);
  s.cats=snap.cats.map(c=>Object.assign({star:1,age:1,lv:-1,wx:[]},c,{wx:Array.isArray(c.wx)?c.wx:[]}));
  return PH_STK.filter(k=>{try{return !!k.t(s)}catch(e){return false}}).map(k=>k.id);
}
const phHas=id=>!!(S&&S.photo&&S.photo.st&&S.photo.st[id]);
function phPage(pid){const L=PH_STK.filter(k=>k.pg===pid),got=L.filter(k=>phHas(k.id)).length;return {got,all:L.length,done:got===L.length&&L.length>0}}
const phCount=()=>({got:PH_STK.filter(k=>phHas(k.id)).length,all:PH_STK.length});
function photoAward(ids,pid,t){
  const p=phS();t=t||now();p.n++;
  const nw=[];
  (ids||[]).forEach(id=>{if(PH_STK_BY[id]&&!p.st[id]&&!nw.includes(id)){p.st[id]={t,p:pid||null};nw.push(id)}});
  const coins=nw.length*PHC.coin,pages=[];let tickets=0,book=false;
  if(nw.length){
    PH_PAGES.forEach(pg=>{if(!p.pg[pg.id]&&phPage(pg.id).done){p.pg[pg.id]=t;tickets+=PHC.page;pages.push(pg.id)}});
    if(!p.all&&PH_STK.every(k=>p.st[k.id])){p.all=t;tickets+=PHC.book;book=true}
  }
  S.coins+=coins;S.tickets+=tickets;
  return {nw,coins,tickets,pages,book};
}
// ảnh bị xóa: sticker vẫn giữ, chỉ bỏ liên kết tới ảnh
function phUnlink(pid){const p=phS();for(const id in p.st)if(p.st[id].p===pid)p.st[id].p=null}
