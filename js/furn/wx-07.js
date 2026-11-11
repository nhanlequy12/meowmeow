"use strict";
/* Hình thiết bị thời tiết nhóm 07: bốn món giá rẻ chạy pin (Claude vẽ). Nạp sau js/art.js.
   Biến thể 'a1' là khung hoạt ảnh khi đang chạy; đèn pin nhỏ góc dưới: xanh là đang chạy. */
(()=>{const {C,dk,lt}=Art.K;
const CREAM=[250,238,214],INK=[105,79,73],HOT=[243,139,83],HONEY=[242,187,104],ICE=[176,220,240],MINT=[150,200,180],LEAF=[150,205,120];
const pill=(b,x,y,w,h,c,reg)=>{const r=Math.min(w,h)/2;b.rect(x+r,y,w-2*r,h,c,reg);b.ell(x+r,y+r,r-.2,r-.2,c,reg);b.ell(x+w-r,y+h-r,r-.2,r-.2,c,reg);b.rect(x,y+r,w,h-2*r,c,reg)};
const batt=(b,x,y,on)=>{b.rect(x,y,3,1.6,INK,'x');b.rect(x+3,y+.4,.5,.8,INK,'x');b.rect(x+.4,y+.4,on?2.2:.8,.8,on?LEAF:HOT,'x')};
Art.addFurn({
  // máy sưởi gốm nhỏ: thân tròn, lưới đỏ cam, quai xách
  bheater(b,v,a){
    const c=C(a,0,[226,150,120]),on=v==='a1';
    b.cap(4,2.5,8,2.5,.6,INK);b.cap(4,2.5,4,4.5,.6,INK);b.cap(8,2.5,8,4.5,.6,INK);
    pill(b,1.5,4,9,8.5,c);b.rect(2.5,12,2,1.6,INK);b.rect(7.5,12,2,1.6,INK);
    b.ell(6,8,3.1,3,CREAM,'x');b.ell(6,8,2.4,2.3,on?HOT:[190,120,100],'x');
    for(let y=6.6;y<=9.6;y+=1.5)b.cap(4.2,y,7.8,y,.2,on?HONEY:[170,110,95],'x');
    batt(b,2.6,4.8,on);b.cap(3,5,9,5,.2,lt(c,.4),'x');
  },
  // đèn sưởi đứng nhỏ: chụp đèn có dây tóc sáng
  bwarmlamp(b,v,a){
    const c=C(a,0,[235,200,140]),on=v==='a1';
    b.ell(5,18.6,3.6,1.2,INK);b.rect(4.4,8,1.2,10.5,[160,130,110]);
    b.tri(1,8.5,9,8.5,5,2,c);b.ell(5,8.4,4,1.4,c);
    b.ell(5,8.6,2.8,.9,on?[255,226,150]:[200,170,130],'x');
    b.cap(3.6,6,6.4,6,.25,on?HOT:[180,130,100],'x');b.cap(3.6,7.2,6.4,7.2,.25,on?HOT:[180,130,100],'x');
    b.cap(2.6,6.8,4.4,3.6,.2,lt(c,.45),'x');batt(b,3.5,15.3,on);
  },
  // quạt mini tích điện: lồng tròn, cánh xoay
  bfan(b,v,a){
    const c=C(a,0,MINT),on=v==='a1';
    b.ell(6,13,4,1.2,dk(c,.2));b.rect(5.3,9.5,1.4,3.5,dk(c,.12));
    b.ell(6,6,5,5,c);b.ell(6,6,4,4,CREAM,'x');
    for(let k=0;k<3;k++){const t=k*Math.PI*2/3+(on?1.05:0);b.ell(6+Math.cos(t)*1.9,6+Math.sin(t)*1.9,1.4,1.4,lt(c,.15),'x')}
    for(let k=0;k<6;k++){const t=k*Math.PI/3;b.cap(6+Math.cos(t)*1,6+Math.sin(t)*1,6+Math.cos(t)*3.9,6+Math.sin(t)*3.9,.12,dk(c,.25),'x')}
    b.ell(6,6,.9,.9,dk(c,.3),'x');batt(b,4.5,11.6,on);
  },
  // quạt hơi đá tích điện: hộp có khay nước đá, cửa gió
  bicefan(b,v,a){
    const c=C(a,0,[150,190,225]),on=v==='a1';
    pill(b,1.5,1.5,9,16,c);b.rect(2.5,17,2,1,INK);b.rect(7.5,17,2,1,INK);
    b.rect(3,3,6,5.5,CREAM,'x');for(let y=3.8;y<8;y+=1.2)b.cap(3.6,y+(on?.4:0),8.4,y+(on?.4:0),.18,dk(c,.2),'x');
    b.rect(3,10,6,4.5,ICE,'x');b.rect(3.6,10.6,1.6,1.6,[230,245,255],'x');b.rect(6,11.6,1.8,1.8,[230,245,255],'x');b.rect(4.4,13,1.4,1,[230,245,255],'x');
    batt(b,4.5,15.3,on);b.cap(2.6,2.6,9.4,2.6,.2,lt(c,.45),'x');
  },
},{bheater:[12,14],bwarmlamp:[10,20],bfan:[12,14],bicefan:[12,18]});
})();
