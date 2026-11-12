"use strict";
/* ============ GÓI 17 MÈO MỚI (2026-11-11): phần hiển thị ============
   Dữ liệu (hồ sơ, thuộc tính, trang phục hiếm) nằm trong data.js; hình mèo là các module CatKit trong js/cats/.
   File này nạp sau ui.js và nối thêm vào các bảng có sẵn của ui.js:
     GLY    ký hiệu nhỏ cho hạt (chân mèo, nơ, trăng, đầu lâu, donut, cuộn len, T1, Z)
     PROP   đạo cụ hạt cườm vẽ bằng Art.Buf (cúp, Nue, pizza, nhật ký...), dùng cả trong phòng (propAt) lẫn intro (fxProp)
     TRAIL  vệt di chuyển của 17 bé
     S5     hành động riêng trong phòng của 10 bé 5★; mỗi bé có thêm S5[id].alt là hành động phụ ngắn
            (file nhân vật gọi là "sau 60 giây": game chọn ngẫu nhiên giữa hành động chính và hành động phụ, xem sigOf trong ui.js)
     INTRO, MEOW  cảnh mở gacha và nhịp meo của 10 bé 5★
   Chữ trong intro giữ nguyên như file nhân vật của chủ game (có câu tiếng Anh). */
(()=>{
const H=Art.hex,fade=(k,a,b)=>clamp(Math.min(k-a,b-k)/.07,0,1),d5=e=>e.flip?1:-1,ctOf=e=>{const c=entCat(e);return c?c.coat:''},rare=e=>!!formOf(entCat(e)),end5=e=>{e.cd=rnd(90,180)};

/* ---------- ký hiệu hạt ---------- */
Object.assign(GLY,{paw:[".#.#.","#.#.#",".###.","#####",".###."],t1:["###.#",".#.##",".#..#",".#..#",".#..#"],bow:["#...#","##.##","#####","##.##","#...#"],
  moon:["..##.",".##..",".#...",".##..","..##."],skull:[".###.","#.#.#","#####",".#.#."],donut:[".###.","##.##","#...#","##.##",".###."],yarn:[".###.","#.#.#","##.##","#.#.#",".###."],zz:["###","..#",".#.","#..","###"]});

/* ---------- đạo cụ ---------- */
const SIL=H('#d9dee8'),SILD=H('#a4adbe'),GOLD=H('#f2c94a'),GOLDD=H('#c9962a'),WHT=[255,255,255],INK=[70,52,60];
const cup=(b,C,D)=>{b.ell(6,4,4.2,3.4,C);b.rect(1.8,1,8.4,1.6,C);b.rect(5,7.2,2,3,D)};
const bowD=(C,D)=>b=>{b.tri(8,5,1,1,1,9,C);b.tri(8,5,15,1,15,9,C);b.ell(8,5,2,2,D)};
const moonD=C=>b=>{for(let y=0;y<14;y+=.5)for(let x=0;x<14;x+=.5){const a=Math.hypot(x-7,y-7),c=Math.hypot(x-10,y-5.6);if(a<=6.2&&c>5)b.rect(x,y,.5,.5,C)}};
const dogD=(C,E)=>b=>{b.ell(7,6.6,5,2.8,C);b.ell(12.4,4.4,2.8,2.5,C);b.tri(11,2.4,11.6,.4,12.8,2.2,C);b.tri(13,2.2,14,.6,14.6,2.8,C);b.rect(3,8.4,1.4,2.4,C);b.rect(5.6,8.6,1.4,2.2,C);b.rect(8.6,8.6,1.4,2.2,C);b.rect(10.8,8.4,1.4,2.4,C);b.cap(2.2,5.6,.8,3,.7,C);b.set(13,4,E,'x')};
const PROP={
  // năm mẫu cúp khác hẳn nhau: CKTG (bạc, hai quai), MSI (cao, có cánh, lõi xanh), LCK (vàng, đai xanh, đế vuông), EWC (lăng trụ vàng), KeSPA (ly đồng có sao)
  cupW:{w:14,h:14,d:b=>{b.ell(7,4.6,4.4,3.6,SIL);b.rect(2.6,1.2,8.8,1.8,SIL);b.cap(2.2,3,1,5.4,.6,SILD);b.cap(1,5.4,3.6,7,.6,SILD);b.cap(11.8,3,13,5.4,.6,SILD);b.cap(13,5.4,10.4,7,.6,SILD);b.rect(6,8,2,2.6,SILD);b.rect(4,10.6,6,1.4,SIL);b.rect(3,12,8,1.6,SILD);b.rect(4.6,2.8,1,3,WHT,'x')}},
  cupM:{w:10,h:16,d:b=>{b.tri(5,.6,2,7,8,7,SIL);b.tri(2.4,4,.4,9.4,3.2,9,SILD);b.tri(7.6,4,9.6,9.4,6.8,9,SILD);b.rect(3.4,7,3.2,5,H('#4a8fe0'));b.rect(2,12,6,1.6,SILD);b.rect(1,13.6,8,1.8,SIL)}},
  cupL:{w:12,h:14,d:b=>{cup(b,GOLD,GOLDD);b.rect(2.4,3.6,7.2,1.4,H('#3a6fd0'),'x');b.rect(2.6,10.2,6.8,3,GOLD)}},
  cupE:{w:12,h:14,d:b=>{b.tri(6,.6,1.4,10,10.6,10,GOLD);b.tri(6,3.6,3.8,8.6,8.2,8.6,H('#fff3b0'),'x');b.rect(2,10,8,1.4,GOLDD);b.rect(1,11.4,10,2,GOLD)}},
  cupK:{w:12,h:13,d:b=>{const B=H('#c98a4a'),D=H('#96602c');cup(b,B,D);b.ell(6,11.2,4,1.5,B);[[6,3],[5,3],[7,3],[6,2],[6,4]].forEach(q=>b.set(q[0],q[1],[255,240,160],'x'))}},
  star:{w:9,h:9,d:b=>{b.tri(4.5,.4,2.6,5,6.4,5,GOLD);b.tri(.4,3.4,8.6,3.4,4.5,6.4,GOLD);b.tri(2,8.4,2.8,4.6,5,6,GOLD);b.tri(7,8.4,6.2,4.6,4,6,GOLD)}},
  // Nue: thức thần cú mặt nạ trắng, hai khung vỗ cánh
  nue:{w:24,h:18,d:(b,f)=>{const B=[44,42,70],W=[62,60,98],M=[240,238,230];
    if(f){b.tri(8.6,10,.6,13.4,6,15,W);b.tri(15.4,10,23.4,13.4,18,15,W)}else{b.tri(8.6,10,.6,2.6,5.4,13,W);b.tri(15.4,10,23.4,2.6,18.6,13,W)}
    b.ell(12,11.6,4,5,B);b.tri(10,16,12,17.6,14,16,B);b.ell(12,7,3.4,3,M);b.set(10,7,INK,'x');b.set(13,7,INK,'x');b.tri(11.4,8,12.6,8,12,9.2,[230,170,80],'x')}},
  dogW:{w:16,h:11,d:dogD([238,238,240],INK)},dogB:{w:16,h:11,d:dogD([46,46,58],[230,60,70])},
  rabbit:{w:8,h:8,d:b=>{const W=[246,246,248];b.ell(4,5.6,2.8,2.1,W);b.ell(4,3.6,2,1.8,W);b.rect(2.6,.4,1,2.8,W);b.rect(4.4,.4,1,2.8,W);b.set(3,3,INK,'x');b.set(4,3,INK,'x')}},
  // thức thần của dạng Sukuna (trang phục hiếm fgSukuna): to hơn, đen đỏ, mắt xếch đỏ, có sừng, nanh và gai
  nueX:{w:30,h:24,ol:[96,14,28],d:(b,f)=>{const B=[26,18,28],W=[86,22,38],W2=[52,14,26],M=[232,226,214],RED=[240,40,50];
    if(f){b.tri(11,13,.6,19,8,20.4,W);b.tri(19,13,29.4,19,22,20.4,W);b.tri(6,15,1,22.6,8,19,W2);b.tri(24,15,29,22.6,22,19,W2)}
    else{b.tri(11,13,.6,2,7,17,W);b.tri(19,13,29.4,2,23,17,W);b.tri(5,9,.4,11.6,6,14,W2);b.tri(25,9,29.6,11.6,24,14,W2);b.tri(7,12,2,16.6,8,17,W2);b.tri(23,12,28,16.6,22,17,W2)}
    b.ell(15,15,5,6.4,B);b.tri(12,21,15,23.6,18,21,B);b.rect(12.4,20.4,1,2.4,M);b.rect(16.6,20.4,1,2.4,M);
    b.tri(11.6,7.4,9.4,1.6,13.4,6,B);b.tri(18.4,7.4,20.6,1.6,16.6,6,B);
    b.ell(15,9.4,4.6,3.8,M);b.tri(11.4,8,14.4,9.8,11.8,10.2,RED,'x');b.tri(18.6,8,15.6,9.8,18.2,10.2,RED,'x');
    b.rect(12.6,11.6,4.8,.8,INK,'x');b.tri(13,12.2,14.2,12.2,13.6,13.8,M);b.tri(15.8,12.2,17,12.2,16.4,13.8,M);b.rect(14.6,14.6,.8,3,RED,'x')}},
  dogX:{w:20,h:14,ol:[96,14,28],d:b=>{const C=[24,20,30],RED=[240,40,50];b.ell(8.6,8.4,6.2,3.4,C);b.ell(15.4,5.6,3.4,3,C);b.tri(13.6,3.2,14.2,.2,15.8,2.8,C);b.tri(16,2.8,17.6,.4,18.2,3.8,C);
    b.rect(17,5.6,2.8,1.8,C);b.rect(16.4,8.6,3,1,C);b.rect(17.4,7.4,.6,1.2,WHT,'x');b.rect(18.6,7.4,.6,1.2,WHT,'x');
    b.rect(3.6,10.6,1.8,3.2,C);b.rect(6.8,10.8,1.8,3,C);b.rect(10.6,10.8,1.8,3,C);b.rect(13,10.6,1.8,3.2,C);b.cap(2.6,7,.8,2.6,.9,C);
    b.tri(5,5.8,6,2.8,7,5.4,C);b.tri(8,5.2,9,2.2,10,5.2,C);b.tri(11,5.4,12,3,12.8,5.6,C);b.rect(15.4,4.6,1.8,1,RED,'x');b.rect(6,8,5,.8,[86,22,38],'x')}},
  rabbitX:{w:10,h:10,ol:[96,14,28],d:b=>{const C=[30,22,34],RED=[240,40,50];b.ell(5,7,3.4,2.6,C);b.ell(5,4.6,2.6,2.2,C);b.rect(3.2,.4,1.2,3.4,C);b.rect(5.6,.4,1.2,3.4,C);b.set(4,4,RED,'x');b.set(6,4,RED,'x');b.rect(4.4,6,.6,1,WHT,'x');b.rect(5.2,6,.6,1,WHT,'x')}},
  dragon:{w:16,h:14,d:b=>{const G=[74,160,140],D=[48,112,100];b.tri(4,5,3,.6,6.6,4,D);b.tri(10,4,13,.6,12,5,D);b.ell(8,8,5.6,4.6,G);b.ell(11.6,9.8,3.2,2.4,G);b.rect(9,6,2,2,[255,214,74],'x');b.set(10,6,INK,'x');b.set(13,9,D,'x');b.rect(9.6,11.4,1,1,WHT,'x');b.rect(11.6,11.6,1,1,WHT,'x');b.rect(3.4,7,1.4,1,D,'x');b.rect(3,9,1.4,1,D,'x')}},
  tiger:{w:16,h:14,d:b=>{const O=[240,150,60],K=[70,44,40];b.tri(2,6,2.4,1,6,3.6,O);b.tri(14,6,13.6,1,10,3.6,O);b.ell(8,8,6.2,5,O);b.ell(8,10.4,3,2.2,[252,240,224]);b.rect(7.4,3,1.2,2.6,K,'x');b.rect(5,3.6,1,2,K,'x');b.rect(10,3.6,1,2,K,'x');b.rect(2,8,2,1,K,'x');b.rect(12,8,2,1,K,'x');b.rect(5,7,1.6,1.2,[255,230,120],'x');b.rect(9.4,7,1.6,1.2,[255,230,120],'x');b.set(8,10,K,'x')}},
  smite:{w:12,h:12,d:b=>{const O=[255,122,42],Y=[255,214,90];b.tri(6,.4,3.6,6,8.4,6,O);b.tri(6,11.6,3.6,6,8.4,6,O);b.tri(.4,6,6,3.6,6,8.4,O);b.tri(11.6,6,6,3.6,6,8.4,O);b.ell(6,6,2.4,2.4,Y)}},
  heart:{w:12,h:11,d:b=>{const R=[224,48,66];b.ell(3.6,3.6,3,3,R);b.ell(8.4,3.6,3,3,R);b.tri(.8,5,11.2,5,6,10.6,R);b.rect(2.4,2.4,1.2,1.2,[255,170,180],'x')}},
  bow:{w:16,h:10,d:bowD(H('#df263c'),H('#a8182c'))},bowP:{w:16,h:10,d:bowD(H('#ed98b7'),H('#d2708f'))},
  skull:{w:10,h:9,d:b=>{const P=H('#f2a2d2');b.ell(5,3.8,4,3.4,P);b.rect(3,6,4,2.2,P);b.rect(2.6,3,1.6,1.8,INK,'x');b.rect(5.8,3,1.6,1.8,INK,'x');b.set(4,6,INK,'x')}},
  moon:{w:14,h:14,d:moonD(H('#f4e7a0'))},moonP:{w:14,h:14,d:moonD(H('#b98bff'))},
  bat:{w:12,h:7,d:b=>{const P=[58,36,80];b.tri(5,3,.4,.8,2.6,6,P);b.tri(7,3,11.6,.8,9.4,6,P);b.ell(6,3.6,1.7,2.1,P);b.tri(5,2,5.2,.6,6,1.8,P);b.tri(7,2,6.8,.6,6,1.8,P)}},
  // pizza: nguyên miếng, bị cắn, còn vỏ
  pizza:{w:12,h:11,d:(b,f)=>{const C=[244,196,84],K=[214,150,70];if(f<2)b.tri(1,1.6,11,1.6,6,f?6.4:10.4,C);b.rect(.6,.6,10.8,1.6,K);if(!f){b.rect(4,3.4,1.4,1.4,[224,72,60],'x');b.rect(7,4.4,1.4,1.4,[224,72,60],'x');b.rect(5.4,6.6,1.2,1.2,[224,72,60],'x')}else if(f===1)b.rect(5,3,1.4,1.4,[224,72,60],'x')}},
  donut:{w:12,h:12,d:b=>{b.ell(6,6.4,5.4,5,[200,138,84]);b.ell(6,5.6,5,4.4,[245,154,181]);b.ell(6,6,1.6,1.4,[122,84,62],'x');[[3,4,[255,255,255]],[8,3,[140,196,255]],[9,7,[255,226,122]],[3,8,[140,220,160]],[6,9,[255,255,255]]].forEach(q=>b.set(q[0],q[1],q[2],'x'))}},
  cake:{w:12,h:11,d:b=>{[[255,143,163],[255,179,122],[255,226,122],[143,214,160],[127,183,255],[185,139,255]].forEach((c,i)=>b.rect(1,3+i*1.2,10,1.2,c));b.ell(6,3,5,1.4,[255,250,240]);b.set(6,1,[224,48,66],'x')}},
  pie:{w:14,h:8,d:b=>{b.ell(7,6.6,6.8,1.2,[250,250,250]);b.ell(7,4.4,5.8,3,[224,170,90]);b.line(3,3.4,11,5.4,[190,130,60],'x');b.line(3,5.4,11,3.4,[190,130,60],'x')}},
  cupcake:{w:10,h:11,d:b=>{b.tri(1.6,6,8.4,6,5,13,[255,187,210]);b.rect(1.6,6,6.8,1,[255,187,210]);b.ell(5,4.8,3.8,2.4,[255,250,240]);b.ell(5,2.8,2.4,1.8,[255,250,240]);b.ell(5,1.4,1.2,1.2,[224,48,66])}},
  teacup:{w:9,h:7,d:b=>{b.rect(1.6,1,5,4,[255,255,255]);b.cap(6.6,2,7.8,3.4,.5,[255,255,255]);b.ell(4,5.8,4,1,[255,214,224]);b.rect(1.6,1,5,1,[214,150,110],'x')}},
  cushion:{w:22,h:7,d:b=>{b.ell(11,3.8,10,3,[255,170,196]);b.ell(11,3,6,1.4,[255,200,216],'x')}},
  diary:{w:10,h:10,d:b=>{b.rect(1,1,8,8.4,H('#6e407d'));b.rect(8.2,1.4,.8,7.6,[250,246,240]);b.rect(3.4,3.4,3,2.4,H('#f2a2d2'),'x');b.rect(1,1,1,8.4,H('#4a2a56'),'x')}},
  mirror:{w:8,h:12,d:b=>{b.ell(4,4.4,3.2,4,GOLD);b.ell(4,4.4,2.2,3,[196,226,244]);b.rect(3.4,8,1.2,3.6,GOLDD);b.rect(3,3,1,1.6,WHT,'x')}},
  yarn:{w:10,h:10,d:b=>{b.ell(5,5,4.3,4.3,[240,170,74]);b.line(2,3.6,8,3.6,[255,214,150],'x');b.line(2,6.4,8,6.4,[255,214,150],'x');b.line(3.6,1.6,6.4,8.4,[212,132,50],'x')}},
  globe:{w:10,h:10,d:b=>{b.ell(5,5,4.3,4.3,[98,160,224]);b.ell(3.6,3.8,1.8,1.4,[120,196,130],'x');b.ell(6.4,6.2,2,1.6,[120,196,130],'x')}},
  box:{w:20,h:13,d:b=>{const C=[206,164,112],D=[168,124,78];b.rect(1.4,3.4,17.2,9,C);b.tri(1.4,3.4,.2,.8,6,3.4,D);b.tri(18.6,3.4,19.8,.8,14,3.4,D);b.rect(9.2,3.4,1.6,9,[232,206,160],'x');b.rect(1.4,3.4,17.2,1,D,'x')}},
  chest:{w:20,h:13,d:b=>{const C=[150,98,58],D=[110,70,40];b.rect(1.4,5,17.2,7.4,C);b.ell(10,5,8.6,3.4,D);b.rect(1.4,5,17.2,1.4,GOLD,'x');b.rect(8.8,5,2.4,3.4,GOLD,'x');b.rect(9.4,6,1.2,1.2,INK,'x')}},
  piano:{w:20,h:12,d:b=>{b.rect(1,1.6,18,5.4,[250,250,252]);b.rect(1,7,18,2.4,[255,255,255]);for(let i=0;i<8;i++)b.rect(2.4+i*2.1,7,1,1.4,INK,'x');b.rect(2,9.4,1.4,2.4,[230,230,236]);b.rect(16.6,9.4,1.4,2.4,[230,230,236]);b.rect(1,1.6,18,1,GOLD,'x')}},
  throne:{w:22,h:24,d:b=>{const P=[92,54,134],L=[128,78,172];b.ell(11,5,7.4,4.6,P);b.rect(3.6,5,14.8,12,P);b.rect(5.6,6,10.8,10,L);b.rect(1.6,15,18.8,5,P);b.rect(1.6,20,3,3.6,P);b.rect(17.4,20,3,3.6,P);b.rect(1.6,15,18.8,1.2,GOLD,'x');b.ell(11,2.4,1.6,1.6,GOLD)}},
  drone:{w:10,h:6,d:b=>{b.rect(2.4,2,5.2,3,[120,130,144]);b.rect(.4,1,3.6,.8,[200,206,216]);b.rect(6,1,3.6,.8,[200,206,216]);b.rect(4.4,3,1.2,1.2,[103,229,190],'x')}},
  knife:{w:10,h:4,d:b=>{b.tri(4,1,4,3,9.6,2,[214,220,230]);b.rect(.6,1.2,3.6,1.6,[36,44,53]);b.rect(4,1.8,4,.5,[103,229,190],'x')}},
  meep:{w:7,h:7,d:b=>{b.ell(3.5,3.8,2.8,2.8,[250,240,214]);b.set(2,3,[90,200,224],'x');b.set(4,3,[90,200,224],'x');b.tri(2.6,1.6,3.5,.2,4.4,1.6,[199,164,97])}},
  cloudp:{w:26,h:9,d:b=>{const W=[250,250,255];b.ell(13,6,11,2.6,W);b.ell(7,4.6,4.4,3,W);b.ell(13.4,3.8,5.6,3.4,W);b.ell(19.6,4.8,4.2,2.8,W)}},
};
const PCV={},PURL={};
function propCv(name,f,q){const key=name+'|'+(f||0)+'|'+q;if(PCV[key])return PCV[key];const P=PROP[name],b=new Art.Buf(P.w,P.h);P.d(b,f||0);b.pastel(.05);b.shade(.13);b.outline(P.ol||[112,74,52]);return PCV[key]=bufCanvas(b,q)}
// đạo cụ trong phòng: tâm ngang x, đáy y (ô thế giới). o: f khung, s cỡ, a độ mờ, flip, rot
function propAt(g,name,x,y,o){
  o=o||{};const P=PROP[name],cv=propCv(name,o.f,fk(BS)),s=o.s||1,w=P.w*s,h=P.h*s,px=Math.round((x-w/2)*ZC)/ZC,py=Math.round((y-h)*ZC)/ZC;
  if(o.a!=null){if(o.a<=0)return;g.globalAlpha=Math.min(1,o.a)}
  if(o.rot){g.save();g.translate(px+w/2,py+h/2);g.rotate(o.rot);g.drawImage(cv,-w/2,-h/2,w,h);g.restore()}
  else if(o.flip){g.save();g.translate(px+w,py);g.scale(-1,1);g.drawImage(cv,0,0,w,h);g.restore()}
  else g.drawImage(cv,px,py,w,h);
  g.globalAlpha=1;
}
// đạo cụ trong intro: tâm tại (x, y) của màn hình; o.s là cỡ so với sprite mèo cùng k
const propSrc=(name,f,n)=>{const key=name+'|'+(f||0)+'|'+n;return PURL[key]||(PURL[key]=propCv(name,f,Math.max(1,Math.round(n/2))).toDataURL())};
function fxProp(name,k,x,y,css,o){
  o=o||{};const P=PROP[name],n=kk(k),s=o.s||1,w=P.w*n/DPR()*s,h=P.h*n/DPR()*s;
  return fxEl('left:'+pct(x)+';top:'+pct(y)+';width:'+w+'px;height:'+h+'px;margin:'+(-h/2)+'px 0 0 '+(-w/2)+'px;'+(css||''),'<img class="px" src="'+propSrc(name,o.f,n)+'" style="width:100%;height:100%;display:block;'+(o.flip?'transform:scaleX(-1);':'')+(o.img||'')+'">');
}
// đổi dáng của sprite trong intro. Dáng nhìn thẳng và nhìn ngang rộng khác nhau nên phải dựng lại phần tử thay vì chỉ đổi ảnh
function reSpr(el,pose,k,o){o=o||{};const n=fxSpr(pose,k,el.style.left,el.style.top,'z-index:'+(el.style.zIndex||0)+';'+(o.css||''),o);el.remove();return n}
const big=(t,y,col,sh,sz,anim)=>fxTxt(t,50,y,'color:'+col+';font-size:min('+sz+'vw,'+Math.round(sz*6.5)+'px);letter-spacing:2px;text-shadow:'+sh,anim||'pop .5s ease-out both');
const chr=(t,x,y,sz,col,css)=>fxEl('left:'+x+'%;top:'+y+'%;font-size:min('+sz+'vw,'+Math.round(sz*6)+'px);line-height:1;margin:-.5em 0 0 -.5em;color:'+col+';font-weight:900;'+(css||''),t);

/* ---------- vệt di chuyển ---------- */
Object.assign(TRAIL,{
  v_fushiguro:[['mist',{c:['#15151f','#2a2740']}],['bolt',{c:'#9363eb',thin:1,r:3}]],
  v_faker:[['sparkle',{c:['#f6d987','#ffffff'],r:4}],['glyph',{c:['#c92438'],g:'t1',r:1.6}]],
  v_oner:[['petals',{c:['#4acba6','#2f8f6f']}],['lines',{c:['#c92438']}],['glyph',{c:['#f6d987'],g:'paw',r:1.4}]],
  v_keria:[['glyph',{c:['#e0303f'],g:'heart',r:2}],['sparkle',{c:['#f6d987'],r:3}],['pixels',{c:['#7fd8e4','#ffffff']}]],
  v_hackclaw:[['pixels',{c:['#67e5be','#2a8f73','#ffffff']}],['glyph',{c:['#67e5be'],g:'paw',r:1.5}]],
  v_hellokitty:[['glyph',{c:['#ff9db5'],g:'heart',r:2}],['sparkle',{c:['#ffffff'],r:3}],['glyph',{c:['#df263c'],g:'bow',r:1.2}]],
  v_kuromi:[['sparkle',{c:['#b98bff','#8a4fc0'],r:4}],['glyph',{c:['#f4e7a0'],g:'moon',r:1.3}],['glyph',{c:['#f2a2d2'],g:'skull',r:1}]],
  v_pusheen:[['glyph',{c:['#f59ab5','#c98a55'],g:'donut',r:1.5}],['crumbs',{c:['#d69c60','#fae4b4']}],['glyph',{c:['#ff9db5'],g:'heart',r:1}]],
  v_marie:[['petals',{c:['#ed98b7','#ffd6e0']}],['glyph',{c:['#ffffff'],g:'note',r:1.6}]],
  v_chi:[['glyph',{c:['#9ca3a8'],g:'paw',r:1.8}],['glyph',{c:['#e0a04a'],g:'yarn',r:.8}],['sparkle',{c:['#fff08c'],r:2.5}]],
  v_nobara:[['lines',{c:['#f08a3a']}],['pixels',{c:['#c8ccd6','#ffffff']}]],
  v_inumaki:[['cosmos',{c:['#a98bea','#d6c8ff']}],['crumbs',{c:['#ffffff','#f2efe6']}]],
  v_luna:[['glyph',{c:['#f4d56b'],g:'moon',r:1.6}],['sparkle',{c:['#b98bff','#e6c8ff'],r:4}]],
  v_stormy:[['cloud',{c:['#ffffff','#eef0f6']}],['glyph',{c:['#8f8f93'],g:'paw',r:1.2}]],
  v_pip:[['glyph',{c:['#8f8f93'],g:'paw',r:1.8}],['lines',{c:['#9acb9b']}]],
  v_toulouse:[['pixels',{c:['#5599cb','#f2c84a']}]],
  v_berlioz:[['glyph',{c:['#e9e9ef'],g:'note',r:2}],['sparkle',{c:['#d6d9e6'],r:3}]],
});

/* ---------- chín đuôi linh lực của Faker Ahri trong phòng ----------
   Hình trong phòng dùng ngoại hình riêng không có đuôi (s.rt); chín đuôi được vẽ mỗi khung hình bằng các ô nửa đơn vị (bằng một ô mịn của sprite)
   nên luôn phấp phới, kể cả lúc bé ngồi yên. Đuôi dựng lên, không rủ xuống dưới gốc. Ảnh ở thẻ gacha, màn chi tiết và intro vẫn có đuôi vẽ sẵn trong sprite. */
function plume(g,bx,by,ux,uy,len,curl,fill,edge){
  for(let pass=0;pass<2;pass++){g.fillStyle=pass?fill:edge;
    for(let i=1;i<=10;i++){const t=i/10,w=Math.sin(Math.PI*t),r=(pass?0:.6)+2.5*Math.pow(Math.sin(Math.PI*Math.min(1,t*1.06)),.7);if(r<.5)continue;
      const cx=bx+ux*len*t-uy*curl*w,cy=by+uy*len*t+ux*curl*w;
      for(let dy=-r;dy<=r;dy+=.5){const hw=Math.sqrt(Math.max(0,r*r-dy*dy));if(hw>=.25)g.fillRect(Math.round((cx-hw)*2)/2,Math.round((cy+dy)*2)/2,Math.max(.5,Math.round(hw*4)/2),.5)}}}
}
const AHRI='v_faker~fkAhriHall';
LOOKS[AHRI+'!rt']=Object.assign({},look(AHRI),{rt:1});RKEY[AHRI]=AHRI+'!rt';
LOOKFX[AHRI]={under(g,e,p){
  const t=NOW(),front=!/^(stand|walk|run|crouch|leap|land)/.test(p.pose||'sit'),d=e.flip?1:-1,act=e.state==='sig'?1.25:1,bx=front?p.x:p.x-d*12,by=front?p.y-9:p.y-15;
  for(const j of [0,8,1,7,2,6,3,5,4]){
    const m=(j-4)/4,th=(front?m*1.08*act:-.14+j*.19)+Math.sin(t*2.4+j*.8)*.1;        // góc lệch khỏi phương thẳng đứng
    const ux=front?Math.sin(th):-d*Math.sin(th),uy=-Math.cos(th),len=(front?24+10*(1-Math.abs(m)):19+1.5*Math.sin(j))*act;   // trong phòng không bị khung sprite giới hạn nên đuôi dài hơn, nhô hẳn khỏi đầu
    plume(g,bx,by,ux,uy,len,Math.sin(t*1.8+j)*1.6,j%2?'#fffaf0':'#f3e6d6','#dfb768');
  }
}};

/* ---------- hành động riêng trong phòng ---------- */
const heartUp=(p,col)=>{if(on(5))rp(p.x+rnd(-8,8),p.y-rnd(30,38),col||'#ff8fa3',{sh:'heart',vy:-8,life:.7})};
Object.assign(S5,{
  // Fushiguro: chập chân, bóng đen lan ra, Nue mọc sau lưng vỗ cánh phát điện rồi tan
  v_fushiguro:{n:'chập chân gọi Nue từ bóng tối',dur:3.2,pose:k=>k>.12&&k<.9?'sitb':'sit',
    draw(g,e,p,k){const a=fade(k,.28,.92);glowAt(g,p.x,p.y-1,14+10*a,3+2*a,'#0b0a14',.55*a);if(k>.44&&k<.9)propAt(g,rare(e)?'nueX':'nue',p.x,p.y-(rare(e)?36:30)-3*Math.sin(k*22),{f:Math.floor(k*26)%2,a:fade(k,.44,.9),s:rare(e)?1.5:1})},
    fx(e,p,k){if(k>.68&&k<.86&&on(14))rp(p.x+rnd(-14,14),p.y-rnd(26,46),rare(e)?'#e0405a':'#9363eb',{sh:'bolt',pts:zig(ch(.5)?1:-1,10,3,5),life:.1});if(k>.28&&k<.92&&on(8))rp(p.x+rnd(-14,14),p.y-1,'#1c1a2c',{vy:-rnd(4,10),life:.5,sz:2,a:.6})},end:end5,
    alt:{n:'Nue hiện ra sau lưng',dur:4,pose:'sit',draw(g,e,p,k){propAt(g,rare(e)?'nueX':'nue',p.x+3*Math.sin(k*6),p.y-(rare(e)?36:30),{s:rare(e)?1.4:1,f:k>.35&&k<.75?Math.floor(k*22)%2:0,a:.9*fade(k,.05,.95),rot:k<.35?.18*Math.sin(k*9):0})},
      fx(e,p){if(on(5))rp(p.x+rnd(-12,12),p.y-rnd(24,44),'#9363eb',{life:.4})},end:end5}},
  // Faker: chỉnh kính, đưa chân lên miệng "Shhh", sáu sao sáng sau lưng (Ahri: chín đuôi linh lực và quả cầu)
  v_faker:{n:'ra dấu Shhh',dur:3.5,pose:k=>k>.28&&k<.72?'groom1':'sit',
    draw(g,e,p,k){const c=ctOf(e),a=fade(k,.5,.78);if(a<=0)return;
      if(c==='fkAhriHall'){glowAt(g,p.x,p.y-18,24,22,'#b92137',.16*a);glowAt(g,p.x+d5(e)*14,p.y-13,3.2,3.2,'#b92137',.9*a);glowAt(g,p.x+d5(e)*14,p.y-13,1.6,1.6,'#ffd98a',a)}   // chín đuôi do LOOKFX vẽ, lúc này xòe rộng hơn
      else for(let i=0;i<6;i++){const t=-1+i*.4;propAt(g,'star',p.x+Math.sin(t)*21,p.y-24-Math.cos(t)*15,{a,s:c==='fkWhite2026'?.9:.7})}},
    fx(e,p,k){if(k>.5&&k<.78&&on(6))rp(p.x+rnd(-18,18),p.y-rnd(20,44),pick(['#f6d987','#ffffff']),{sh:'star',life:.5})},end:end5,
    alt:{n:'ngồi bên cúp vô địch',dur:4,pose:'sit',draw(g,e,p,k){const a=fade(k,.04,.96);if(ctOf(e)==='fkAhriHall')glowAt(g,p.x,p.y-16,21,19,'#7d1228',.22*a);propAt(g,'cupW',p.x-d5(e)*18,p.y+1,{a})},
      fx(e,p){if(on(5))rp(p.x-d5(e)*18+rnd(-5,5),p.y-rnd(4,16),'#ffffff',{sh:'star',life:.4})},end:end5}},
  // Oner: mục tiêu rồng hiện ra, lấy đà, đá xoay, Trừng Phạt nổ vào mục tiêu
  v_oner:{n:'tung cú Trừng Phạt',dur:3.5,pose:k=>k<.3?'sit':k<.48?'crouch1':k<.66?'leap1':k<.8?'land0':'sit',hover:k=>k>.48&&k<.66?Math.sin((k-.48)/.18*Math.PI)*12:0,
    draw(g,e,p,k){const d=d5(e);if(k>.14&&k<.64)propAt(g,'dragon',e.x+d*26,e.y-12,{a:fade(k,.14,.64),flip:d>0});if(rare(e)&&k>.4&&k<.8)propAt(g,'tiger',e.x-d*6,e.y-18,{a:.45*fade(k,.4,.8),s:1.7,flip:d<0})},
    fx(e,p,k){const d=d5(e),R=rare(e);if(k>.48&&k<.66&&on(40))rp(p.x+d*rnd(4,14),p.y-rnd(4,20),R?pick(['#ff5a8a','#5aa9ff']):pick(['#ff7a2a','#ffd24a']),{vx:-d*rnd(10,30),life:.25,sz:2});
      if(k>.6&&k<.7&&on(60))rp(e.x+d*26+rnd(-6,6),e.y-rnd(14,30),pick(['#ff7a2a','#ffd24a','#ffffff']),{vx:rnd(-40,40),vy:-rnd(10,50),g:120,life:.4,sz:2})},end:end5,
    alt:{n:'nhảy lên đầu rồng con',dur:5,pose:'sit',hover:k=>17*clamp(Math.min(k-.28,.74-k)/.06,0,1),draw(g,e,p,k){propAt(g,'dragon',e.x,e.y+1,{a:fade(k,.05,.95),s:1.4,flip:d5(e)>0})},
      fx(e,p){if(on(4))rp(p.x+rnd(-12,12),e.y-rnd(4,20),pick(['#4acba6','#ffffff']),{vy:-8,life:.5})},end:end5}},
  // Keria: trái tim đỏ, ba tim nhỏ, khiên vàng chặn tia đỏ thành hoa (Bard: cổng xanh và ba linh thể)
  v_keria:{n:'dựng khiên che đồng đội',dur:3.6,pose:k=>k>.76&&k<.92?'sitb':'sit',
    draw(g,e,p,k){const C=rare(e)?'#7fd8e4':'#f6d987',a=fade(k,.42,.92);if(a>0){glowAt(g,p.x,p.y-17,21,23,C,.13*a);g.globalAlpha=.85*a;g.strokeStyle=C;g.lineWidth=1.6;g.beginPath();g.ellipse(p.x,p.y-17,21,23,0,0,6.283);g.stroke();g.globalAlpha=1}
      if(k>.12&&k<.44)propAt(g,'heart',p.x,p.y-40-3*Math.sin(k*30),{a:fade(k,.12,.44),s:.8})},
    over(g,e,p,k){if(rare(e)&&k>.42&&k<.92){const t=NOW()*2.4;for(let i=0;i<3;i++)propAt(g,'meep',p.x+Math.cos(t+i*2.09)*23,p.y-13+Math.sin(t+i*2.09)*8,{a:fade(k,.42,.92)})}},
    fx(e,p,k){const d=d5(e);if(k>.28&&k<.44)orbit(p,14,3,['#e0303f','#ff8fa3'],5);
      if(k>.55&&k<.68&&on(30))rp(p.x+d*(40-(k-.55)/.13*18),p.y-17+rnd(-3,3),'#e0303f',{vx:-d*60,life:.12,sz:2});
      if(k>.64&&k<.8&&on(16))rp(p.x+d*22+rnd(-3,3),p.y-17+rnd(-10,10),pick(['#ffb6c8','#ffffff','#ffd6e0']),{vx:d*rnd(4,16),vy:rnd(-14,14),life:.7,sz:2});
      if(k>.76&&k<.92)heartUp(p)},end:end5,
    alt:{n:'lau cúp rồi ôm vào lòng',dur:6,pose:k=>k>.56&&k<.94?'sitb':'sit',
      over(g,e,p,k){const d=d5(e),m=clamp((k-.5)/.08,0,1);propAt(g,'cupW',p.x+d*(15-10*m),p.y+1,{a:fade(k,.03,.97),s:.8});if(rare(e)){const t=NOW()*2;for(let i=0;i<3;i++)propAt(g,'meep',p.x+Math.cos(t+i*2.09)*22,p.y-30+Math.sin(t+i*2.09)*5,{a:fade(k,.05,.95)})}},
      fx(e,p,k){if(k<.5&&on(6))rp(p.x+d5(e)*15+rnd(-5,5),p.y-rnd(2,14),'#ffffff',{sh:'star',life:.35});if(k>.56)heartUp(p)},end:end5}},
  // Hackclaw: ba đường quét, rút dao xoay, phóng dao, mục tiêu vỡ thành mã dữ liệu (Mặc Ảnh: vỡ thành vệt mực)
  v_hackclaw:{n:'quét mục tiêu rồi phóng dao',dur:3.4,pose:'sit',
    draw(g,e,p,k){const d=d5(e);if(k>.12&&k<.36){g.strokeStyle=rare(e)?'#e6e3e0':'#67e5be';g.lineWidth=.6;g.globalAlpha=.75;for(let i=0;i<3;i++){const y=p.y-36+((k-.12)/.24*36+i*12)%36;g.beginPath();g.moveTo(p.x-18,y);g.lineTo(p.x+18,y);g.stroke()}g.globalAlpha=1}
      if(k>.34&&k<.58)propAt(g,'knife',p.x+d*14,p.y-12,{rot:k*44});else if(k>=.58&&k<.72)propAt(g,'knife',p.x+d*(14+(k-.58)/.14*34),p.y-12,{flip:d<0})},
    fx(e,p,k){const d=d5(e);if(k>.7&&k<.8&&on(70))rp(p.x+d*48+rnd(-4,4),p.y-14+rnd(-6,6),rare(e)?pick(['#1b1b20','#e6e3e0']):pick(['#67e5be','#2a8f73','#ffffff']),{vx:rnd(-30,30),vy:rnd(-40,10),g:60,life:.5,sz:2})},end:end5,
    alt:{n:'tàng hình',dur:5,pose:'sit',alpha:k=>1-.5*fade(k,.1,.9),fx(e,p){if(on(6))rp(p.x+rnd(-12,12),p.y-rnd(2,34),'#67e5be',{life:.3})},end:end5}},
  // Hello Kitty: bày bánh táo ra đĩa, nghiêng đầu mời, nhắm mắt vui (Dâu Tây: cupcake dâu)
  v_hellokitty:{n:'mời bánh táo',dur:2.8,pose:k=>k>.76?'sitb':'sit',over(g,e,p,k){propAt(g,rare(e)?'cupcake':'pie',p.x+d5(e)*16,p.y+1,{a:fade(k,.04,.96)})},
    fx(e,p,k){if(k>.5)heartUp(p,'#ff9db5')},end:end5,
    alt:{n:'ngồi đệm tim uống trà',dur:5,pose:k=>k>.4&&k<.8?'sitb':'sit',draw(g,e,p,k){propAt(g,'cushion',p.x,p.y+2,{a:fade(k,.04,.96)})},over(g,e,p,k){propAt(g,'teacup',p.x+d5(e)*14,p.y-1,{a:fade(k,.08,.92)})},
      fx(e,p){if(on(4))rp(p.x+d5(e)*14,p.y-10,'#ffffff',{vy:-10,life:.6,a:.6})},end:end5}},
  // Kuromi: lấy nhật ký ra viết, bị nhìn thấy, đóng lại đỏ má (Hắc Nguyệt: dơi bay ra từ nhật ký)
  v_kuromi:{n:'lén viết nhật ký',dur:3,pose:k=>k>.66?'sitb':'sit',over(g,e,p,k){if(k<.72)propAt(g,'diary',p.x+d5(e)*14,p.y+1,{a:fade(k,.03,.72)})},
    fx(e,p,k){if(k>.2&&k<.5&&on(5))rp(p.x+d5(e)*14,p.y-12,'#b98bff',{sh:'note',vy:-10,life:.6});e.emo=k>.5&&k<.62?'excl':null;if(k>.66)heartUp(p);
      if(rare(e)&&k>.6&&k<.8&&on(10))rp(p.x+d5(e)*14,p.y-10,'#3a2450',{sh:'bat',vx:rnd(-20,20),vy:-rnd(14,30),life:.8})},end(e){e.emo=null;e.cd=rnd(90,180)},
    alt:{n:'ngồi ngai tím chống cằm',dur:5,pose:'sit',hover:k=>5*fade(k,.04,.96),draw(g,e,p,k){propAt(g,'throne',e.x,e.y+1,{a:fade(k,.04,.96)})},fx(e,p){if(on(3))rp(p.x+rnd(-12,12),p.y-rnd(20,44),'#b98bff',{sh:'star',life:.5})},end:end5}},
  // Pusheen: cắn pizza liên tiếp, bụng phồng, xoa bụng (Kỳ Lân: bánh kem cầu vồng)
  v_pusheen:{n:'ăn pizza no căng bụng',dur:3.2,pose:k=>k>.78?'sitb':'sit',hover:k=>k>.56&&k<.78?Math.abs(Math.sin(k*40))*1.5:0,
    over(g,e,p,k){if(k<.56)propAt(g,rare(e)?'cake':'pizza',p.x+d5(e)*13,p.y-3,{f:rare(e)?0:k<.22?0:k<.4?1:2,a:fade(k,.02,.56)})},
    fx(e,p,k){if(k>.2&&k<.56&&on(12))rp(p.x+d5(e)*11,p.y-10,pick(['#d69c60','#fae4b4','#e0483c']),{vx:rnd(-12,12),vy:-rnd(4,14),g:120,gy:e.y-1,life:.5});if(k>.78)heartUp(p,'#ff9db5')},end:end5,
    alt:{n:'ngủ một giấc',dur:6,pose:k=>'sleep'+Math.floor(k*8)%2,draw(g,e,p,k){if(rare(e))propAt(g,'cloudp',p.x,p.y+3,{a:fade(k,.04,.96)})},fx(e,p){if(on(1.6))rp(p.x+8,p.y-18,'#8a84a0',{sh:'zz',vy:-9,vx:4,life:1})},end:end5}},
  // Marie: soi gương, chỉnh nơ, xoay một vòng, ngồi lại thanh lịch (Vũ Hội: hoa bay)
  v_marie:{n:'soi gương rồi xoay một vòng',dur:3.4,pose:k=>k>.44&&k<.72?'stand':'sit',over(g,e,p,k){if(k<.42)propAt(g,'mirror',p.x+d5(e)*15,p.y+1,{a:fade(k,.03,.42)})},
    fx(e,p,k){if(k>.2&&k<.42&&on(8))rp(p.x+rnd(-6,6),p.y-rnd(30,40),'#ffffff',{sh:'star',life:.4});
      if(k>.44&&k<.72){e.flip=Math.floor((k-.44)/.07)%2===0;if(on(14))rp(p.x+rnd(-14,14),p.y-rnd(4,30),pick(['#ed98b7','#ffd6e0']),{vy:rnd(6,16),life:.7,sz:2})}
      if(rare(e)&&on(5))rp(p.x+rnd(-18,18),p.y-rnd(20,44),pick(['#f5b8d1','#ffffff']),{vy:rnd(8,18),life:.9,sz:2})},end:end5,
    alt:{n:'gõ phím đàn piano',dur:6,pose:'sit',over(g,e,p,k){propAt(g,'piano',p.x+d5(e)*18,p.y+1,{a:fade(k,.04,.96),flip:d5(e)<0})},
      fx(e,p,k){if(k>.1&&k<.9&&on(3))rp(p.x+d5(e)*18+rnd(-6,6),p.y-14,pick(['#ffffff','#ed98b7']),{sh:'note',vy:-12,vx:rnd(-4,4),life:.9})},end:end5}},
  // Chi: bóng len lăn tới, nghiêng đầu, nhào theo, ôm bóng, bóng bật đi (Thám Hiểm: quả địa cầu)
  v_chi:{n:'vồ bóng len',dur:3,pose:k=>k<.3?'sit':k<.42?'crouch1':k<.56?'leap1':'sit',hover:k=>k>.42&&k<.56?Math.sin((k-.42)/.14*Math.PI)*9:0,
    over(g,e,p,k){const d=d5(e),x=k<.3?e.x+d*(36-k/.3*20):k<.8?e.x+d*(k<.56?16:10):e.x+d*(10+(k-.8)/.2*12),y=e.y+1-(k>.78?Math.abs(Math.sin((k-.78)*28))*6:0);propAt(g,rare(e)?'globe':'yarn',x,y,{rot:k<.3?-d*k*30:0,a:fade(k,.01,.99)})},
    fx(e,p,k){if(k>.56&&k<.62&&on(30))rp(p.x+d5(e)*9+rnd(-4,4),p.y-6,'#fff08c',{sh:'star',life:.4})},end:end5,
    alt:{n:'chui vào hộp giấy',dur:5,pose:'sit',alpha:k=>k>.24&&k<.56?0:1,over(g,e,p,k){propAt(g,rare(e)?'chest':'box',p.x+(k>.5&&k<.6?Math.sin(k*200)*1.2:0),p.y+2,{a:fade(k,.04,.96)})},
      fx(e,p,k){if(k>.56&&k<.62&&on(30))rp(p.x+rnd(-8,8),p.y-rnd(14,26),'#fff08c',{sh:'star',life:.4})},end:end5}},
});

/* ---------- giọng meo trong intro: theo các mốc của file nhân vật ---------- */
const M={low:{f:440,d:.35},lowL:{f:430,d:.8,c:[1,1.05,.95,.85]},vlow:{f:360,d:.2,v:.14},hi:{f:760,d:.35},hiL:{f:740,d:.8,c:[.9,1.25,1.2,1]},hiS:{f:800,d:.55,v:.26,c:[.9,1.3,1.1]},mid:{f:620,d:.35},soft:{f:600,d:.35,v:.12},
  light:{f:700,d:.35,v:.14},lightL:{f:700,d:.8,v:.14,c:[1,1.15,1.1,.95]},play:{f:680,d:.4,c:[.9,1.2,1,1.3]}};
Object.assign(MEOW,{
  v_fushiguro:[[350,M.low],[2800,M.hiL],[4600,M.low]],v_faker:[[400,M.low],[5800,M.vlow]],v_oner:[[700,M.low],[2000,M.hiS],[5700,M.lowL]],v_keria:[[800,M.soft],[2300,M.hiL],[5800,M.hi]],
  v_hackclaw:[[900,M.mid],[2200,M.hi],[4000,M.low]],v_hellokitty:[[800,M.hi],[2000,M.hi],[3500,M.lightL]],v_kuromi:[[500,M.low],[2100,M.hi],[3300,M.play]],
  v_pusheen:[[1000,M.mid],[2400,M.hi],[3900,M.lowL]],v_marie:[[1500,M.light],[2600,M.hi],[4000,M.lightL]],v_chi:[[800,M.mid],[1600,M.hi],[2600,M.hiL],[3800,M.mid]],
});

/* ---------- cảnh mở gacha ---------- */
const tailsFan=(x,y,sz,css)=>{let h='';for(let i=0;i<9;i++)h+='<div style="position:absolute;left:0;bottom:0;width:'+sz*.17+'vmin;height:'+sz+'vmin;margin-left:'+(-sz*.085)+'vmin;border-radius:50% 50% 35% 35%;background:linear-gradient(#fffaf0,#f1dfc0);border:2px solid #dfb768;box-sizing:border-box;transform-origin:50% 100%;transform:rotate('+(-80+i*20)+'deg)"></div>';
  return fxEl('left:'+x+'%;top:'+y+'%;width:0;height:0;'+(css||''),h)};
const hearts=(n,cols)=>{for(let i=0;i<n;i++)chr('♥',rnd(14,86),rnd(18,62),8,pick(cols),'animation:pop .3s ease-out '+(i*.05)+'s both, ghost .5s ease-in '+(.55+i*.05)+'s forwards')};
Object.assign(INTRO,{
  // Fushiguro: vòng bóng đen, chập chân, hai Ngọc Khuyển chạy vòng, đàn thỏ, Nue xòe cánh, điện tím quét màn hình, bóng tối thu lại
  v_fushiguro:{dur:5000,run(T){
    const R=gz.cat.coat==='fgSukuna',k=K5(),key=lk(gz.cat),BOLT=R?'#d2304e':'#9363eb';
    fxTint('radial-gradient(circle,#1c1a34 0,#05050c 78%)');
    const ring=fxEl('left:50%;top:68%;width:64vmin;height:18vmin;margin:-9vmin 0 0 -32vmin;border-radius:50%;background:radial-gradient(#000 35%,rgba(0,0,0,0) 70%);animation:pop .5s ease-out both');
    let me,t1,nue;const NU=R?'nueX':'nue',Z=R?1.5:1;   // dạng Sukuna: thức thần bản hung dữ, to gấp rưỡi
    T(350,()=>{me=fxSpr('sit',k,50,58,'animation:pop .4s ease-out both',{key:R?'v_fushiguro~v_fushiguro_0':key})});
    T(800,()=>{t1=big('THẬP CHỦNG ẢNH PHÁP THUẬT',13,'#e6dcff','0 0 14px #7a4ae0,3px 3px 0 #1a1030',5);seq([220,262,311],.12,.3,'triangle',.05)});
    T(1200,()=>{fxProp(R?'dogX':'dogW',k,0,R?72:76,'animation:fly 1s linear both',{s:1.5*Z});fxProp(R?'dogX':'dogB',k,0,84,'animation:fly 1s linear .1s reverse both',{s:1.5*Z,flip:1})});
    for(let i=0;i<7;i++)T(1800+i*55,()=>fxProp(R?'rabbitX':'rabbit',k,10+i*13.5,72+(i%2)*9,'animation:pop .25s ease-out both, ghost .35s ease-in .45s forwards',{s:1.4*Z}));
    T(2300,()=>{nue=fxProp(NU,k,50,R?32:34,'animation:rise .45s ease-out both',{s:R?3.4:3});let f=0;every(T,0,2100,140,()=>{if(nue.isConnected)nue.firstChild.src=propSrc(NU,f^=1,kk(k))});glide(200,520,.5,'sawtooth',.05);
      if(R){flash();fxTint('radial-gradient(circle,#3a0c18 0,#070308 78%)');me.firstChild.src=sprSrc(key,'sit',k)}});
    T(2800,()=>{flash();for(let i=0;i<4;i++)T(i*90,()=>bolt(innerWidth*(.14+.24*i),BOLT))});
    every(T,2300,4000,50,()=>part({x:rnd(0,innerWidth),y:rnd(0,innerHeight),vy:-rnd(.5,2),life:rnd(20,40),col:pick([BOLT,'#2a2740','#ffffff']),sz:pick([4,6])}));
    T(3300,()=>{if(t1)t1.remove();big(R?'PHỤC MA NGỰ TRÙ TỬ':'BỒN ÁM ẢNH ĐÌNH',20,R?'#ffffff':'#d9ccff','0 0 18px '+BOLT+',4px 4px 0 #120a24',8,'skewIn 1.2s ease-out both');
      fxEl('left:50%;top:62%;width:20vmin;height:20vmin;margin:-10vmin 0 0 -10vmin;border-radius:50%;background:'+(R?'radial-gradient(#000 50%,#5a0c1c)':'#000')+';animation:grow .7s ease-out both');glide(300,90,.6,'sawtooth',.05)});
    // trang phục hiếm: lãnh địa của Sukuna (tên tiếng Việt quen thuộc), các nhát chém trắng quét khắp màn hình
    if(R)every(T,3350,4000,70,()=>fxEl('left:-10%;top:'+rnd(8,92)+'%;width:120%;height:0;transform:rotate('+rnd(-38,38)+'deg)','<div style="height:4px;background:#fff;box-shadow:0 0 14px 4px #ffb0b0;transform-origin:'+pick(['left','right'])+';animation:slash .32s ease-out forwards"></div>'));
    T(4000,()=>{if(me)me.remove();if(nue)nue.remove();ring.style.animation='ghost .4s ease-in forwards'});
    T(4500,()=>{flash();fxProp(NU,k,50,R?36:38,'animation:pop .4s ease-out both',{s:R?2.6:2.2});fxSpr('sit',k,50,62,'animation:pop .4s ease-out both');fount([BOLT,'#ffffff'],10)});
  }},
  // Faker: đại sảnh tối, 6 cúp CKTG, 2 cúp MSI, 10 cúp LCK (đúng ba mẫu cúp), cận mặt, Shhh trong im lặng, sáu sao vàng
  v_faker:{dur:6500,run(T){
    const ct=gz.cat.coat,W=ct==='fkWhite2026',A=ct==='fkAhriHall',k=K5(),key=lk(gz.cat),cups=[];
    fxTint(W?'radial-gradient(circle,#fff6dc 0,#c9ae72 85%)':'radial-gradient(circle,#3a0a14 0,#070205 78%)');
    if(!W)[-1,1].forEach(s=>fxEl('left:50%;top:0;width:26vw;height:100vh;margin-left:-13vw;background:linear-gradient(rgba(220,40,60,.34),rgba(220,40,60,0) 80%);transform-origin:50% 0;transform:rotate('+s*24+'deg)'));
    let me,tt,fan;
    T(400,()=>{me=fxSpr('sit',k,50,80,'animation:pop .4s ease-out both;transition:transform .5s ease-out;z-index:2',{key:A?'v_faker~v_faker_0':key})});
    T(900,()=>{tt=big('THE UNKILLABLE DEMON KING',7,W?'#792936':'#f6d987','0 0 14px '+(W?'#fff':'#c92438')+',2px 2px 0 '+(W?'#fff':'#3a0a14'),4.4);seq([196,247,294,392],.14,.4,'triangle',.05)});
    const cup=(name,x,y,t)=>T(t,()=>cups.push(fxProp(name,k,x,y,'animation:pop .3s ease-out both;transition:opacity .4s,filter .4s;z-index:1',{s:.85})));
    if(A)T(1300,()=>{fan=tailsFan(50,46,40,'opacity:.4;animation:pop .5s ease-out both')});
    for(let i=0;i<6;i++)cup('cupW',20+i*12,19,1300+i*70);
    for(let i=0;i<2;i++)cup('cupM',44+i*12,32,2000+i*140);
    for(let i=0;i<10;i++)cup('cupL',26+(i%5)*12,45+Math.floor(i/5)*10,2700+i*50);
    T(1300,()=>seq([523,587,659,698,784,880],.07,.2,'square',.035));T(2000,()=>seq([659,784],.14,.25,'square',.035));T(2700,()=>seq([392,440,494,523,587,659,698,784,880,988],.05,.15,'square',.03));
    T(3300,()=>{cups.forEach(c=>c.style.filter='drop-shadow(0 0 8px #ffd24a) brightness(1.15)');for(let i=0;i<4;i++)fount(['#ffd24a','#fff3b0'],8);seq([523,659,784,1047],.08,.3,'square',.04)});
    T(3900,()=>{cups.forEach(c=>c.style.opacity=.2);if(fan)fan.remove();if(tt)tt.remove();me.style.animation='none';me.style.transform='translateY(-20vh) scale(1.6)';if(A){flash();me.firstChild.src=sprSrc(key,'sit',k)}});
    T(4500,()=>{me.firstChild.src=sprSrc(key,'groom1',k);
      if(A){const o=fxEl('left:58%;top:58%;width:7vmin;height:7vmin;margin:-3.5vmin;border-radius:50%;background:radial-gradient(#ffe9a0,#b92137);box-shadow:0 0 18px #b92137;z-index:3;animation:pop .25s ease-out both, burst .4s ease-in .25s forwards');T(380,()=>fxProp('cupW',k,62,56,'animation:pop .3s ease-out both;z-index:3',{s:.9}))}});
    T(4900,()=>{big('SHHH…',24,W?'#792936':'#ffffff','0 0 16px '+(W?'#f6d987':'#c92438'),11,'fadeIn .5s ease-out both');if(A){tailsFan(50,74,46,'z-index:1;animation:pop .5s ease-out both');fxTint('radial-gradient(circle,#4a0a1a 0,#0a0204 78%)')}});
    T(5500,()=>{for(let i=0;i<6;i++){const a=-1+i*.4;chr('★',50+Math.sin(a)*30,40-Math.cos(a)*14,W?10:8,'#f6d987','text-shadow:0 0 '+(W?22:12)+'px #ffd24a;animation:pop .3s ease-out '+i*.06+'s both')}seq([784,988,1175,1319,1568,2093],.06,.25,'triangle',.04);
      if(A)chr('◆',50,31,9,'#b92137','text-shadow:0 0 16px #dfb768,0 0 4px #dfb768;animation:pop .4s ease-out .4s both')});
  }},
  // Oner: rừng tối, mắt sáng trong bụi, bước ra, ba rồng, ba đòn Trừng Phạt thành ba cúp CKTG, thêm LCK, EWC, KeSPA, cú đá nổ đỏ vàng
  v_oner:{dur:6200,run(T){
    const R=gz.cat.coat==='onLeeSin',k=K5(),key=lk(gz.cat),k0=R?'v_oner~v_oner_0':key,cups=[],dr=[];
    fxTint('radial-gradient(circle,#123222 0,#030a06 80%)');
    for(let i=0;i<7;i++)fxEl('left:'+(i*16-6)+'%;bottom:0;width:22vw;height:'+(34+((i*37)%22))+'vh;background:#06170e;clip-path:polygon(50% 0,100% 100%,0 100%);opacity:.9');
    const eyes=fxEl('left:22%;top:70%;animation:fadeIn .25s .35s both','<div style="display:flex;gap:3vmin"><i style="width:2.2vmin;height:2.2vmin;border-radius:50%;background:#ffe14a;box-shadow:0 0 10px #ffe14a"></i><i style="width:2.2vmin;height:2.2vmin;border-radius:50%;background:#ffe14a;box-shadow:0 0 10px #ffe14a"></i></div>');
    let me,tt;
    T(700,()=>{eyes.remove();me=fxSpr('walk0',k,50,72,'animation:runIn .45s ease-out both;z-index:2',{flip:1,key:k0});let fr=0;every(T,0,440,70,()=>{if(me.isConnected)me.firstChild.src=sprSrc(k0,'walk'+(fr=(fr+2)%12),k)});T(460,()=>{me=reSpr(me,'sit',k,{key:k0})})});
    T(1100,()=>{tt=big('KING OF THE JUNGLE',9,'#bff5dc','0 0 14px #2fbf8f,3px 3px 0 #04140c',5.6)});
    T(1500,()=>{[30,50,70].forEach((x,i)=>dr.push(fxProp('dragon',k,x,26,'animation:pop .3s ease-out '+i*.08+'s both',{s:1.1})));if(R){flash();me=reSpr(me,'sit',k)}});
    [0,1,2].forEach(i=>T(2000+i*230,()=>{const x=30+i*20;fxEl('left:'+x+'%;top:0;width:1.8vmin;height:28%;margin-left:-.9vmin;background:linear-gradient(#fff,#ff7a2a);box-shadow:0 0 16px #ff7a2a;animation:ghost .35s ease-out forwards');
      if(dr[i])dr[i].remove();cups.push(fxProp('cupW',k,x,26,'animation:pop .3s ease-out both;transition:left .5s,top .5s',{s:.9}));glide(900,200,.2,'sawtooth',.05)}));
    [['cupL',2800,30],['cupE',3300,50],['cupK',3800,70]].forEach(q=>T(q[1],()=>{cups.push(fxProp(q[0],k,q[2],43,'animation:pop .3s ease-out both;transition:left .5s,top .5s',{s:.9}));seq([659,880],.08,.2,'square',.04)}));
    T(4800,()=>{if(tt)tt.remove();fxProp('smite',k,50,9,'animation:pop .3s ease-out both',{s:1.3,img:'filter:drop-shadow(0 0 10px #ff7a2a)'})});
    T(5200,()=>{flash();me=reSpr(me,'leap1',k,{flip:1,css:'transition:transform .25s ease-out'});requestAnimationFrame(()=>{me.style.transform='translateY(-10vh)'});for(let i=0;i<5;i++)fount(R?['#ff5a8a','#5aa9ff','#fff']:['#ff5a2a','#ffd24a','#fff'],8);glide(700,120,.4,'sawtooth',.06);
      if(R)fxProp('tiger',k,50,56,'animation:burst .7s ease-out forwards',{s:4,img:'opacity:.6'})});
    T(5550,()=>{me=reSpr(me,'sit',k)});
    T(5700,()=>{cups.forEach((c,i)=>{const a=-1.1+i*2.2/5;c.style.left=(50+Math.sin(a)*34)+'%';c.style.top=(44-Math.cos(a)*18)+'%'});big('ONER',11,'#ffe9b0','0 0 16px #ff7a2a,4px 4px 0 #04140c',12);
      if(R)fxProp('tiger',k,50,66,'animation:fadeIn .4s both;z-index:1',{s:5,img:'opacity:.26'})});
  }},
  // Keria: sao tách thành chữ T1, ôm trái tim, ba bóng đồng đội, khiên vàng chặn năng lượng đỏ, khiên hóa cúp, sáu cúp xếp hình tim rồi thành sáu sao
  v_keria:{dur:6400,run(T){
    const B=gz.cat.coat==='krBard',k=K5(),key=lk(gz.cat),cups=[],SH=B?'#7fd8e4':'#f6d987';
    fxTint('radial-gradient(circle,#2a1420 0,#07040a 80%)');
    const st=chr('★',50,44,16,'#f6d987','text-shadow:0 0 18px #f6d987;animation:pop .35s ease-out both');
    T(350,()=>{st.remove();const t=fxTxt('T1',50,44,'color:#e0303f;font-size:min(22vw,120px);text-shadow:0 0 22px #e0303f','pop .35s ease-out both');T(430,()=>t.remove())});
    let me,hrt,tt,sh;
    T(800,()=>{me=fxSpr('sit',k,50,72,'animation:pop .4s ease-out both;z-index:2');hrt=fxProp('heart',k,50,77,'animation:pop .4s ease-out both;z-index:3',{s:1.1})});
    T(1200,()=>{tt=big('THE PERFECT SUPPORT',8,'#ffe9b0','0 0 14px #e0303f,3px 3px 0 #2a0a12',5.4)});
    T(1600,()=>{[['v_faker',18],['v_oner',31],['v_faker',83]].forEach((q,i)=>fxSpr('sit',Math.max(2,k-1),q[1],76,'animation:fadeIn .4s ease-out '+i*.08+'s both;z-index:1',{key:q[0],img:'filter:brightness(0);opacity:.55'}))});
    T(2000,()=>every(T,0,420,30,()=>part({x:innerWidth+10,y:innerHeight*rnd(.6,.85),vx:-rnd(14,22),life:40,col:pick(['#e0303f','#ff6a7a']),sz:8})));
    T(2300,()=>{if(hrt)hrt.remove();sh=fxEl('left:50%;top:72%;width:84vmin;height:44vmin;margin:-22vmin 0 0 -42vmin;border-radius:50%;border:5px solid '+SH+';box-sizing:border-box;background:radial-gradient(rgba(255,255,255,.04),rgba(246,217,135,.2));box-shadow:0 0 26px '+SH+';z-index:3;animation:pop .35s ease-out both');
      seq(B?[784,988,1175,1568]:[523,659,784],.08,.3,'triangle',.05);if(B)[30,50,70].forEach((x,i)=>fxProp('meep',k,x,34-(i%2)*6,'animation:pop .3s ease-out both, floaty 1.4s ease-in-out '+i*.2+'s infinite alternate',{s:1.3}))});
    const cup=(n,x,y)=>cups.push(fxProp(n,k,x,y,'animation:pop .3s ease-out both;transition:left .5s,top .5s',{s:.9}));
    T(2700,()=>{if(sh)sh.style.animation='ghost .4s ease-in forwards';[34,50,66].forEach(x=>cup('cupW',x,24));seq([523,659,784],.09,.3,'square',.04)});
    T(3300,()=>{cup('cupL',34,40);seq([659,880],.08,.2,'square',.04)});T(3700,()=>{cup('cupE',50,40);cup('cupK',66,40);seq([784,1047],.08,.2,'square',.04)});
    T(4200,()=>{const P=[[41,22],[59,22],[31,32],[69,32],[42,45],[58,45]];cups.forEach((c,i)=>{c.style.left=P[i][0]+'%';c.style.top=P[i][1]+'%'})});
    T(4800,()=>{me.firstChild.src=sprSrc(key,'groom1',k);fxProp('heart',k,50,56,'animation:pop .3s ease-out both;z-index:3',{s:.8});hearts(5,['#ff6a8a','#e0303f'])});
    T(5300,()=>{if(tt)tt.remove();tt=big('6 TITLES – 3 WORLDS',8,'#ffe9b0','0 0 14px #f6d987,3px 3px 0 #2a0a12',5.4)});
    T(5800,()=>{cups.forEach(c=>{chr('★',parseFloat(c.style.left),parseFloat(c.style.top),9,'#f6d987','text-shadow:0 0 12px #f6d987;animation:pop .3s ease-out both');c.remove()});seq([1047,1319,1568],.07,.25,'triangle',.04);
      if(B)for(let i=0;i<3;i++)fxEl('left:50%;top:72%;width:10vmin;height:10vmin;margin:-5vmin;border-radius:50%;border:3px solid #7fd8e4;animation:ring .9s ease-out '+i*.18+'s both')});
    T(6100,()=>{if(tt)tt.remove();big('KERIA – THE PERFECT SUPPORT',8,'#ffffff','0 0 14px #e0303f,3px 3px 0 #2a0a12',4.2)});
  }},
  // Hackclaw: màn đen mã xanh, NO SIGNAL, vạch quét đỏ, drone, hiện ra từ bóng tối, phi dao về phía người xem, ACCESS GRANTED, vuốt dữ liệu
  v_hackclaw:{dur:4600,run(T){
    const I=gz.cat.coat==='hcInky',k=K5(),C=I?['#f2f0ee','#8a8a90','#1b1b20']:['#67e5be','#2a8f73','#bff7e6'];
    fxTint(I?'radial-gradient(circle,#8f8f95 0,#2a2a30 80%)':'#020806');
    every(T,0,4500,45,()=>{for(let i=0;i<3;i++)part({x:rnd(0,innerWidth),y:-10,vy:rnd(5,11),life:120,col:pick(C),sz:pick([4,6])})});
    let ns;T(400,()=>{ns=fxTxt('NO SIGNAL',50,30,'color:#fff;font-size:min(9vw,56px);letter-spacing:4px;font-family:monospace;text-shadow:2px 0 '+C[0]+',-2px 0 #e0303f','trem .12s linear infinite')});
    T(900,()=>{if(ns)ns.remove();fxEl('left:0;top:56%;width:100%;height:3px;background:#ff3a4a;box-shadow:0 0 14px #ff3a4a;animation:drop .45s ease-in both, ghost .3s ease-in .7s forwards');glide(900,300,.4,'square',.03);
      T(450,()=>fxEl('left:50%;top:56%;width:22vmin;height:22vmin;margin:-11vmin 0 0 -11vmin;border:3px solid #ff3a4a;border-radius:50%;box-sizing:border-box;box-shadow:0 0 12px #ff3a4a;animation:pop .25s ease-out both, ghost .4s ease-in .8s forwards'))});
    T(1300,()=>{flash();fxProp('drone',k,0,20,'animation:fly .8s linear both',{s:1.6})});
    T(1800,()=>{fxSpr('sit',k,50,60,'animation:fadeIn .45s ease-out both;z-index:2')});
    T(2200,()=>{glide(400,1400,.3,'sawtooth',.05);
      if(I){const half=(l,dx)=>fxEl('left:50%;top:40%;width:12vmin;height:24vmin;margin:-12vmin 0 0 '+(l?-12:0)+'vmin;background:'+(l?'#1b1b20':'#f2f0ee')+';border-radius:'+(l?'12vmin 0 0 12vmin':'0 12vmin 12vmin 0')+';z-index:1;--dx:'+dx+'vw;--dy:0;animation:hopTo .5s ease-out .3s forwards');half(1,-14);half(0,14)}
      fxProp('knife',k,50,56,'z-index:3;animation:grow .45s ease-in both',{s:1.2});T(320,()=>flash())});
    T(2700,()=>fxTxt('ACCESS GRANTED',50,20,'color:'+C[0]+';font-size:min(7.5vw,46px);letter-spacing:3px;font-family:monospace;text-shadow:0 0 14px '+C[0],'typing .5s steps(14) both'));
    T(3200,()=>{for(let i=0;i<3;i++)fxEl('left:'+(18+i*7)+'%;top:'+(34+i*7)+'%;width:62%;height:0;transform:rotate(-22deg);transform-origin:left;z-index:3','<div style="height:5px;background:'+C[0]+';box-shadow:0 0 14px '+C[0]+';transform-origin:left;animation:slash .45s ease-out '+i*.07+'s both"></div>');seq([880,988,1175],.06,.15,'square',.04)});
    T(3800,()=>fount(C,10));
  }},
  // Hello Kitty: nền mây hồng, nơ đỏ lớn bung thành tim, đáp xuống đệm, bánh táo, HELLO, FRIEND!
  v_hellokitty:{dur:4200,run(T){
    const S=gz.cat.coat==='hkStrawberry',k=K5(),key=lk(gz.cat);
    fxTint(S?'linear-gradient(#ffe1ec,#ffd0e0 62%,#bfe6b0)':'linear-gradient(#fff6fa,#ffdbe8)');
    for(let i=0;i<5;i++)fxEl('left:'+(2+i*21)+'%;top:'+(7+(i%2)*10)+'%;width:22vmin;height:8vmin;border-radius:50%;background:#fff;opacity:.85;animation:floaty '+(2+i*.3)+'s ease-in-out infinite alternate');
    const b0=fxProp('bow',k,50,44,'animation:pop .4s ease-out .4s both',{s:4});
    T(900,()=>{b0.style.animation='burst .35s ease-out forwards';for(let i=0;i<4;i++)fount(['#ff6a8a','#ffb6c8','#df263c','#fff'],8);hearts(8,['#ff6a8a','#df263c','#ffb6c8']);seq([784,988,1175],.08,.2,'square',.04)});
    let me;T(1400,()=>{fxProp('cushion',k,50,76,'animation:pop .3s ease-out both;z-index:1',{s:2});me=fxSpr('sit',k,50,62,'animation:drop .45s cubic-bezier(.34,1.56,.64,1) both;z-index:2')});
    T(2000,()=>{fxProp(S?'cupcake':'pie',k,70,74,'animation:pop .3s ease-out both;z-index:3',{s:1.7});seq([1047,1319],.09,.2,'triangle',.04)});
    T(2600,()=>big('HELLO, FRIEND!',15,'#df263c','0 0 12px #fff,3px 3px 0 #fff',8));
    T(3200,()=>{me.firstChild.src=sprSrc(key,'sitb',k);hearts(4,['#ff9db5','#ffb6c8'])});
    every(T,S?0:2600,4100,70,()=>{if(S)part({x:rnd(0,innerWidth),y:-10,vy:rnd(2,4),g:.04,life:160,col:pick(['#e0304a','#ff9db5','#fff','#7fbf6a']),sz:pick([6,8])});else rain(['#ff9db5','#fff','#ffd6e0'],2)});
  }},
  // Kuromi: trăng khuyết trên nền tím đen, dơi bay, đầu lâu hồng sáng lên, bước ra từ khói, sao tím xoay, nhếch mép
  v_kuromi:{dur:4400,run(T){
    const D=gz.cat.coat==='krmDarkMoon',k=K5(),key=lk(gz.cat);
    fxTint('radial-gradient(circle at 70% 25%,#4a2a6a 0,#150a22 60%,#07040c 100%)');
    fxProp(D?'moonP':'moon',k,D?50:74,D?42:22,'animation:fadeIn .5s ease-out both',{s:D?7:3.2,img:'filter:drop-shadow(0 0 16px #c9a6ff)'});
    T(500,()=>{for(let i=0;i<5;i++)fxProp('bat',k,0,14+i*11,'animation:fly '+(1+i*.12)+'s linear '+i*.1+'s both',{s:1.5})});
    let sk,me;T(1000,()=>{sk=fxProp('skull',k,50,54,'animation:pop .35s ease-out both',{s:3,img:'filter:drop-shadow(0 0 14px #f2a2d2)'});seq([330,392,466],.1,.3,'triangle',.05)});
    T(1500,()=>{if(sk)sk.style.animation='burst .4s ease-out forwards';for(let i=0;i<5;i++)fount(['#6a5a86','#3a2a50','#b98bff'],8);if(D)fxProp('throne',k,50,60,'animation:fadeIn .4s both;z-index:1',{s:2});me=fxSpr('sit',k,50,64,'animation:fadeIn .5s ease-out both;z-index:2')});
    T(2100,()=>{let h='';for(let i=0;i<5;i++){const a=i*1.2566;h+='<i style="position:absolute;left:'+(Math.cos(a)*30).toFixed(1)+'vmin;top:'+(Math.sin(a)*30).toFixed(1)+'vmin;margin:-3vmin;font-size:6vmin;line-height:1;font-style:normal;color:#b98bff;text-shadow:0 0 10px #b98bff">★</i>'}
      fxEl('left:50%;top:60%;width:0;height:0;z-index:1;animation:spin 2.4s linear infinite',h);seq([587,740,880,1175],.08,.25,'triangle',.04)});
    T(2700,()=>big('LITTLE DEVIL PRINCESS',11,'#f2a2d2','0 0 14px #8a4fc0,3px 3px 0 #1a0a2a',5.2));
    T(3200,()=>hearts(6,['#f2a2d2','#ff8fc8']));
    T(3700,()=>{me.firstChild.src=sprSrc(key,'sitt',k)});
    if(D)T(1500,()=>{for(let i=0;i<4;i++)fxProp('bat',k,0,24+i*13,'animation:fly '+(1.2+i*.15)+'s linear '+(1+i*.2)+'s both',{s:1.3})});
  }},
  // Pusheen: nền hồng bánh bay, donut khổng lồ lăn tới, ló đầu, nhảy ra, pizza rơi, ôm pizza cắn, xoa bụng ngủ
  v_pusheen:{dur:4500,run(T){
    const U=gz.cat.coat==='psUnicorn',k=K5(),key=lk(gz.cat);
    fxTint(U?'linear-gradient(#e6f0ff,#ffe6f4)':'linear-gradient(#ffe3ee,#ffd0e2)');
    ['donut','cupcake','cake','donut','pie','cupcake'].forEach((n,i)=>fxProp(n,k,8+i*17,0,'animation:fallSpin '+(2.6+i*.3)+'s linear '+i*.25+'s both',{s:1.2}));
    const dn=fxProp('donut',k,50,58,'z-index:2;transition:opacity .3s;animation:runIn .5s ease-out .5s both',{s:5,img:'animation:spin .5s linear .5s 1'});
    let me,pz;
    T(1000,()=>{me=fxSpr('sit',k,50,50,'animation:pop .35s ease-out both;z-index:1')});
    T(1500,()=>{dn.style.opacity=0;me.style.setProperty('--dy','-16vh');me.style.zIndex=3;me.style.animation='leapY .5s both';seq([523,784],.1,.2,'square',.04);
      if(U){fxEl('left:50%;top:70%;width:86vmin;height:43vmin;margin:-43vmin 0 0 -43vmin;border-radius:43vmin 43vmin 0 0;z-index:0;animation:fadeIn .5s ease-out both;background:radial-gradient(circle at 50% 100%,rgba(0,0,0,0) 58%,#b98bff 59% 64%,#7fb7ff 64% 69%,#8fd6a0 69% 74%,#ffe27a 74% 79%,#ffb37a 79% 84%,#ff8fa3 84% 89%,rgba(0,0,0,0) 90%)');
        [30,50,70].forEach((x,i)=>fxProp('cloudp',k,x,74+(i%2)*4,'animation:fadeIn .5s ease-out both;z-index:2',{s:2}))}});
    T(2000,()=>{pz=fxProp('pizza',k,50,34,'animation:drop .4s ease-in both;transition:left .3s,top .3s;z-index:4',{s:2.2})});
    T(2400,()=>{pz.style.left='60%';pz.style.top='58%';T(260,()=>{pz.firstChild.src=propSrc('pizza',1,kk(k))});T(500,()=>{pz.firstChild.src=propSrc('pizza',2,kk(k))});seq([330,0,330,0,330],.12,.08,'square',.04)});
    T(3000,()=>{if(pz)pz.remove();big('EAT. SLEEP. MEOW.',13,'#7a5a52','0 0 10px #fff,3px 3px 0 #fff',7)});
    T(3600,()=>{me.style.animation='none';me.firstChild.src=sprSrc(key,'sleep0',k);[0,1,2].forEach(i=>chr('Z',60+i*5,46-i*7,5+i*2,'#8a84a0','animation:pop .3s ease-out '+i*.2+'s both'))});
  }},
  // Marie: nền Paris hồng kem, cánh hoa, nơ hồng xoay, hiện ra, xoay duyên dáng, ba nốt nhạc thành tim, nghiêng đầu
  v_marie:{dur:4600,run(T){
    const P=gz.cat.coat==='mrParis',k=K5();
    fxTint(P?'linear-gradient(#3a2a52,#7a4a7a 60%,#d6b070)':'linear-gradient(#ffeef2,#ffe1d6)');
    fxEl('right:8%;bottom:0;width:20vmin;height:62vmin;background:'+(P?'rgba(255,230,170,.22)':'rgba(214,150,170,.3)')+';clip-path:polygon(50% 0,58% 34%,66% 62%,100% 100%,0 100%,34% 62%,42% 34%)');   // tháp Eiffel mờ phía xa
    if(P)for(let i=0;i<5;i++)fxEl('left:0;bottom:'+i*4+'vh;width:100%;height:1.2vh;background:rgba(255,224,150,'+(.5-i*.08)+')');          // bậc thềm vũ hội
    let late=0;every(T,500,4500,90,()=>part({x:rnd(0,innerWidth),y:-10,vx:rnd(-1,1),vy:rnd(2,4),g:.03,life:170,col:P&&late?pick(['#ffe9a0','#fff','#ffd24a']):pick(['#ed98b7','#ffd6e0','#fff']),sz:pick([6,8])}));
    const bw=fxProp('bowP',k,50,46,'animation:pop .4s ease-out 1s both',{s:3.4,img:'animation:spin .5s linear 1s 1'});
    let me;T(1500,()=>{bw.style.animation='burst .35s ease-out forwards';me=fxSpr('sit',k,50,62,'animation:pop .4s ease-out both;z-index:2');seq([784,988,1319],.09,.25,'triangle',.05)});
    T(2000,()=>{let f=0;every(T,0,600,120,()=>{me.firstChild.style.transform=(f^=1)?'scaleX(-1)':''})});
    T(2600,()=>{late=1;[0,1,2].forEach(i=>{const n=chr('♪',40+i*10,36,9,P?'#ffe9a0':'#e06a94','animation:pop .3s ease-out '+i*.1+'s both');T(450,()=>{n.textContent='♥'})});seq([659,784,988],.1,.2,'triangle',.05)});
    T(3200,()=>big('PETITE PRINCESSE',12,P?'#ffe9a0':'#d2527e','0 0 12px '+(P?'#7a4a7a':'#fff')+',3px 3px 0 '+(P?'#2a1a3a':'#fff'),7));
    T(3800,()=>{me.style.animation='none';me.style.transition='transform .4s ease-out';me.style.transform='rotate(8deg)'});
  }},
  // Chi: phòng khách và hộp giấy, hộp rung lộ tai, thò đầu, bóng len lăn tới, đuổi theo, ôm bóng lăn
  v_chi:{dur:4300,run(T){
    const X=gz.cat.coat==='chiExplorer',k=K5();
    fxTint('linear-gradient(#fff3dc 0,#fde6c0 62%,#d9b98a 62%,#c9a474 100%)');
    const bx=fxProp(X?'chest':'box',k,50,68,'z-index:3',{s:2.4});
    if(X){fxEl('left:10%;top:22%;width:26vmin;height:18vmin;background:#f1e2bc;border:3px solid #b8935a;box-sizing:border-box;border-radius:4px;transform:rotate(-8deg);animation:fadeIn .5s ease-out both','<div style="margin:5vmin 3vmin;border-top:3px dashed #c0524a;transform:rotate(12deg)"></div>');chr('✦',82,26,11,'#c0524a','animation:spin 3s linear infinite')}
    T(500,()=>{bx.style.animation='trem .1s linear 5'});
    let me,yn;
    T(1000,()=>{me=fxSpr('sit',k,50,56,'animation:pop .3s ease-out both;z-index:2')});
    T(1600,()=>{yn=fxProp(X?'globe':'yarn',k,76,78,'animation:runIn .45s ease-out both;transition:left .4s;z-index:4',{s:1.6,img:'animation:spin .45s linear 1'})});
    T(2000,()=>{me=reSpr(me,'run0',k,{flip:1,css:'transition:left .5s ease-in,top .5s ease-in'});me.style.zIndex=4;requestAnimationFrame(()=>{me.style.left='67%';me.style.top='70%'});let fr=0;every(T,0,500,60,()=>{if(me.isConnected)me.firstChild.src=sprSrc(lk(gz.cat),'run'+(fr=(fr+1)%8),k)})});
    T(2600,()=>{me=reSpr(me,'sit',k,{css:'animation:trem .12s linear 4'});yn.style.left='72%';yn.firstChild.style.animation='none';requestAnimationFrame(()=>{yn.firstChild.style.animation='spin .5s linear 1'});fount(['#fff08c','#fff'],8);seq([988,1319],.08,.2,'triangle',.05)});
    T(3100,()=>big('CHI’S SWEET HOME',12,'#b8743a','0 0 10px #fff,3px 3px 0 #fff',7));
    T(3600,()=>{me.firstChild.src=sprSrc(lk(gz.cat),'sitt',k)});
  }},
});
})();
