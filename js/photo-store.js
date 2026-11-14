"use strict";
/* ============ CHỤP ẢNH PHÒNG: kho ảnh (2026-11-14) ============
   Ảnh lưu ở IndexedDB riêng (cơ sở 'meoxu_photo', kho 'p'), không nằm trong bản lưu S (máy chủ đồng bộ S, ảnh sẽ làm phình bản lưu).
   Mỗi bản ghi: {id, t, room, rn (tên phòng), names (tên các bé), stk (sticker khớp), nw (sticker mới nhận nhờ ảnh này), fav, w, h, size, type, blob}.
   Trình duyệt chặn IndexedDB (cửa sổ ẩn danh của vài trình duyệt) thì ảnh chỉ giữ trong bộ nhớ tới khi tắt game (PHDB.mem=true).
   PHDB.list() trả mảng đã nạp (mới nhất trước), PHDB.ready là Promise nạp lần đầu. Mọi hàm ghi trả Promise. */
const PHDB=(()=>{
  const DB='meoxu_photo',ST='p';let db=null,L=[];
  const api={mem:false,list:()=>L,get:id=>L.find(r=>r.id===id),bytes:()=>L.reduce((a,r)=>a+(r.size||0),0)};
  const req=r=>new Promise((ok,no)=>{r.onsuccess=()=>ok(r.result);r.onerror=()=>no(r.error)});
  const tx=(mode,f)=>new Promise((ok,no)=>{if(!db){ok();return}try{const t=db.transaction(ST,mode);f(t.objectStore(ST));t.oncomplete=()=>ok();t.onerror=t.onabort=()=>no(t.error)}catch(e){no(e)}});
  const sort=()=>L.sort((a,b)=>b.t-a.t);
  api.ready=new Promise(done=>{
    try{
      if(typeof indexedDB==='undefined')throw 0;
      const o=indexedDB.open(DB,1);
      o.onupgradeneeded=()=>{if(!o.result.objectStoreNames.contains(ST))o.result.createObjectStore(ST,{keyPath:'id'})};
      o.onsuccess=()=>{db=o.result;db.onversionchange=()=>{try{db.close()}catch(e){}db=null};
        const t=db.transaction(ST,'readonly');req(t.objectStore(ST).getAll()).then(a=>{L=(a||[]).filter(r=>r&&r.id&&r.blob);sort();done()},()=>done())};
      o.onerror=o.onblocked=()=>{api.mem=true;done()};
    }catch(e){api.mem=true;done()}
  });
  api.put=r=>api.ready.then(()=>tx('readwrite',s=>s.put(r))).then(()=>{L=L.filter(x=>x.id!==r.id);L.push(r);sort()});
  api.del=id=>api.ready.then(()=>tx('readwrite',s=>s.delete(id))).then(()=>{L=L.filter(x=>x.id!==id)});
  api.patch=(id,o)=>{const r=api.get(id);if(!r)return Promise.resolve();Object.assign(r,o);return api.ready.then(()=>tx('readwrite',s=>s.put(r)))};
  api.clear=()=>api.ready.then(()=>tx('readwrite',s=>s.clear())).then(()=>{L=[]});
  return api;
})();
