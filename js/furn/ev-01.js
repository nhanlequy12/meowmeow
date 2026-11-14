"use strict";
/* Hình món độc quyền của sự kiện (js/event-data.js), Claude vẽ. Nạp sau js/art.js. */
(()=>{const {C,dk,lt,GOLDC,RED,WOOD,DWOOD,GRN}=Art.K;
const CREAM=[250,238,214],INK=[88,64,58];
Art.addFurn({
  // mâm ngũ quả: đĩa gỗ sơn son trên chân cao, bưởi, chuối, quýt, phật thủ, lá xanh
  evmam(b){
    const lac=[196,60,52],gold=[240,196,92];
    b.rect(9,14,8,3,dk(lac,.15));b.ell(13,17,7,1.1,dk(lac,.25));b.rect(11,12,4,3,lac);
    b.ell(13,11.6,12,2.4,lac);b.ell(13,11.2,11,1.6,gold,'x');
    b.cap(4,11.4,22,11.4,.2,dk(gold,.2),'x');
    // chuối nải vàng uốn hai bên
    for(let i=0;i<4;i++){b.cap(2.5+i*1.2,10.6,5+i*1.4,4.6+i*.4,.85,[246,214,96]);b.set(5+i*1.4,4.6+i*.4,[120,150,70],'x')}
    for(let i=0;i<3;i++){b.cap(23.5-i*1.2,10.6,21-i*1.3,5.2+i*.4,.85,[240,206,88])}
    // bưởi xanh ở giữa, quýt và phật thủ quanh
    b.ell(13,6.8,4.4,4.2,[150,196,96]);b.ell(11.6,5.4,1.4,1,lt([150,196,96],.35),'x');b.rect(12.6,2,1,1.6,[120,90,60]);
    b.ell(15.4,1.9,1.6,.8,[110,170,80]);
    b.ell(7.6,8.6,2.4,2.2,[244,150,60]);b.ell(7,7.8,.8,.6,lt([244,150,60],.4),'x');
    b.ell(18.6,8.6,2.4,2.2,[244,150,60]);b.ell(18,7.8,.8,.6,lt([244,150,60],.4),'x');
    b.ell(10.4,9.6,1.6,1.4,[230,80,70]);b.ell(16,9.8,1.6,1.4,[236,170,70]);
    b.cap(5.6,6.6,4.4,5.2,.5,[110,170,80]);b.cap(20.4,6.6,21.6,5.4,.5,[110,170,80]);
  },
  // đèn cá chép treo tường: thân cam đỏ, vảy vàng, vây và đuôi xòe, dây treo và tua rua
  evcarp(b){
    const red=[232,92,60],org=[246,150,70],gold=[250,210,110];
    b.cap(14,0,14,3.4,.25,DWOOD);b.rect(13,3,2,1.2,gold);
    b.tri(22,9.5,27.4,4.6,27.4,14.6,org);b.tri(23,9.5,26.4,6.6,25.4,9.5,lt(org,.25),'x');b.tri(23,9.6,25.4,9.6,26.4,12.6,lt(org,.25),'x');
    b.ell(13,9.6,10,5.2,red);
    b.tri(10,5,15,1.2,17,5,org);b.tri(9,14,13,18.4,15,14,org);
    for(let x=9;x<=19;x+=3.2)for(let y=7.6;y<=11.6;y+=2.6)b.ell(x+(y>9?1.6:0),y,1.1,.9,gold,'x');
    b.ell(5.2,9.4,2.6,3.6,lt(red,.12),'x');b.ell(4.6,8.2,1.1,1.1,CREAM,'x');b.set(4.6,8.4,INK,'x');
    b.cap(3.2,11.6,1.6,13.4,.25,gold,'x');b.cap(3.6,11.8,4.2,14.2,.25,gold,'x');
    b.ell(13,6.2,6,1,lt(red,.4),'x');
    b.cap(14,14.6,14,17,.25,gold);b.tri(12.6,17,15.4,17,14,19.6,[226,62,62]);
  },
  // vạc phù thủy: nồi gang đen bóng, nước thuốc xanh sủi bọt, ba chân, củi lửa cháy bên dưới
  evcauldron(b){
    const iron=[74,64,82],goo=[132,214,96];
    b.cap(4,19,18,19,.5,[150,104,70]);b.cap(5,18.4,17,19.4,.45,DWOOD);
    b.tri(8,19,11,13.6,14,19,[248,150,60]);b.tri(9.6,19,11,15.6,12.4,19,[255,214,110],'x');
    b.cap(5,13,4,18,.6,iron);b.cap(17,13,18,18,.6,iron);
    b.ell(11,11,9,6,iron);b.ell(8,9,2.2,2.6,lt(iron,.3),'x');
    b.ell(11,5.6,9.4,2.2,dk(iron,.2));b.ell(11,5.4,7.8,1.4,goo,'x');
    b.ell(8,5,1,.7,lt(goo,.4),'x');b.ell(14,5.6,.8,.6,lt(goo,.4),'x');
    b.ell(9.4,2.4,1.2,1.2,lt(goo,.15));b.ell(13.6,1.2,.9,.9,lt(goo,.25));b.ell(12,3.4,.7,.7,lt(goo,.3));
    b.cap(5.4,12.6,16.6,12.6,.3,lt(iron,.18),'x');[7,11,15].forEach(x=>b.set(x,12.6,[184,140,220],'x'));
  },
  // xe trượt tuyết: thùng đỏ viền vàng, ghế đệm, càng trượt cong, chồng quà phía sau
  evsleigh(b){
    const red=[214,62,60],gold=[244,196,92],cush=[250,226,200];
    b.cap(2,20.6,36,20.6,.6,gold);b.cap(36,20.6,38.2,17.6,.6,gold);b.ell(38,16.8,1.2,1.2,gold);
    b.cap(10,20,10,16,.45,dk(gold,.2));b.cap(28,20,28,16,.45,dk(gold,.2));
    b.rect(6,10,30,7,red);b.ell(36,13,3.2,4.2,red);b.tri(4,10,8,10,6,17,red);
    b.rect(14,4,22,7,red);b.ell(35.6,7.4,3.4,3.6,red);
    b.cap(7,16.6,36,16.6,.3,gold,'x');b.cap(14,4.4,34,4.4,.3,gold,'x');
    for(let x=10;x<=32;x+=6)b.ell(x,13.4,1.3,1.3,lt(red,.2),'x');
    b.rect(15.4,6.6,15,3,cush,'x');b.rect(15.4,9,15,1,dk(cush,.15),'x');
    // chồng quà phía sau
    b.rect(3.4,4.8,7.6,5.4,[110,170,210]);b.rect(6.8,4.8,.8,5.4,gold,'x');
    b.rect(5,0.6,5.4,4.4,[130,190,120]);b.rect(7.2,.6,.8,4.4,[236,90,90],'x');b.ell(7.6,.6,1.3,.6,[236,90,90]);
  },
},{evmam:[26,18],evcarp:[28,20],evcauldron:[22,20],evsleigh:[40,22]});
})();
