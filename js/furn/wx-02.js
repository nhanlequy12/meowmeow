"use strict";
/* Hình thiết bị thời tiết nhóm 02 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,H,mix,dk,lt,hex,WH,EY,RED,NAVY,GOLDC,PINK,PUR,WOOD,WOOD2,CRMF,DWOOD,GRN,GRN2,STEM,TERRA,SAND,GLASS,HOLE,arch,star5}=Art.K;
const cream=[252,239,215],chalk=[254,248,234],brass=[226,180,99],seam=[126,99,87],mint=[155,199,179],ice=[191,220,226],rose=[222,151,157];
const box=(b,x,y,w,h,r,c,reg)=>{b.rect(x+r,y,w-2*r,h,c,reg);b.rect(x,y+r,w,h-2*r,c,reg);[x+r,x+w-r].forEach(cx=>[y+r,y+h-r].forEach(cy=>b.ell(cx,cy,r,r,c,reg)))};
const poly=(b,p,c,reg)=>{for(let i=1;i<p.length-1;i++)b.tri(p[0][0],p[0][1],p[i][0],p[i][1],p[i+1][0],p[i+1][1],c,reg)};
const flake=(b,x,y,r,c)=>{b.cap(x-r,y,x+r,y,.22,c,'x');b.cap(x-r*.55,y-r*.8,x+r*.55,y+r*.8,.22,c,'x');b.cap(x+r*.55,y-r*.8,x-r*.55,y+r*.8,.22,c,'x')};
const paw=(b,x,y,c)=>{b.ell(x,y+.6,1.2,.85,c,'x');[[-1,-.8],[0,-1.3],[1,-.8]].forEach(p=>b.ell(x+p[0],y+p[1],.42,.5,c,'x'))};
const quilt=(b,x,y,w,c)=>{box(b,x-w/2,y-1,w,2.5,.9,c,'x');b.cap(x-w/2+1,y-.5,x+w/2-1,y-.5,.25,lt(c,.55),'x');for(let k=x-w/2+2;k<x+w/2-1;k+=3)b.cap(k,y+.5,k+.8,y+1,.18,dk(c,.16),'x')};
Art.addFurn({
  fireplace(b,v,a){
    const stone=C(a,0,[225,180,154]),wood=C(a,1,[181,125,99]),brick=[203,142,122],ember=[246,164,91],on=v==='a1';
    // Cheminée de briques, manteau en bois et petits objets de salon.
    b.rect(14,2,20,13,stone);
    [4,7.5,11].forEach((y,i)=>{b.cap(14.5,y,33.5,y,.25,dk(stone,.18),'x');for(let x=16+(i%2)*4;x<34;x+=8)b.cap(x,y,x,y+3,.22,dk(stone,.18),'x')});
    b.rect(14,2,20,1,lt(stone,.3),'x');
    box(b,5,16,38,24,1.2,stone);
    [19,23.5,28,32.5,37].forEach((y,i)=>{b.cap(5.5,y,11.5,y,.23,dk(stone,.22),'x');b.cap(36.5,y,42,y,.23,dk(stone,.22),'x');b.cap(i%2?8:10,y,i%2?8:10,y+3.8,.2,dk(stone,.17),'x');b.cap(i%2?38:40,y,i%2?38:40,y+3.8,.2,dk(stone,.17),'x')});
    arch(b,24,18,13.4,40,cream,'x');
    arch(b,24,20,11.5,40,[103,78,76],'x');
    arch(b,24,22,10,39,[131,87,78],'x');
    b.cap(14,31,34,31,.24,brick,'x');b.cap(14,35,34,35,.24,brick,'x');
    [19,27].forEach(x=>b.cap(x,27,x,31,.22,brick,'x'));
    [15,23,31].forEach(x=>b.cap(x,31,x,35,.22,brick,'x'));
    b.ell(24,36,9,2.2,[185,105,76],'x');
    // Lửa đổi hướng, khối đá và củi giữ nguyên giữa hai khung.
    const flames=on?[[18.5,28.5,3.1],[25,23,4.1],[30,28,2.5]]:[[18,27,2.8],[23,24.5,4.2],[30,26,2.7]];
    flames.forEach(([x,t,r])=>{b.ell(x,33,r,4.1,ember,'x');b.tri(x-r,33,x+(on?1.1:-.8),t,x+r,33,ember,'x');b.ell(x,34,r*.52,2.5,[255,218,124],'x');b.tri(x-r*.5,34,x+.4,t+3,x+r*.5,34,[255,228,154],'x')});
    b.dot(on?28:20,on?24:23,[255,219,134],'x');b.dot(on?19:28,26,[250,195,113],'x');
    b.cap(17,37,31,35.8,1.25,[126,87,67],'x');b.cap(17,35.8,31,37.3,1.25,[157,104,73],'x');
    b.ell(17,35.8,.8,1,[218,165,111],'x');b.dot(17,35.8,seam,'x');b.ell(31,37.2,.8,1,[218,165,111],'x');
    [16,20,24,28,32].forEach(x=>{b.cap(x,35.5,x,39,.3,seam,'x');b.ell(x,35.5,.4,.45,brass,'x')});b.cap(15,38.5,33,38.5,.35,seam,'x');
    box(b,2,39.5,44,3.5,.6,lt(stone,.18));b.cap(3.5,40.2,44.5,40.2,.3,cream,'x');
    box(b,2.5,13.5,43,3, .5,wood);b.rect(5,16.5,38,1,dk(wood,.19),'x');
    b.cap(4,14.2,44,14.2,.25,lt(wood,.35),'x');[[8,15,17],[29,15,36]].forEach(p=>b.cap(p[0],p[1],p[2],p[1],.2,dk(wood,.18),'x'));
    b.rect(6.5,11.5,5,1.5,brass,'x');b.rect(8,8.5,2,3,cream,'x');b.ell(9,7.8,.7,1.1,[255,202,113],'x');
    b.ell(24,10.5,3.5,3.2,wood,'x');b.ell(24,10.2,2.5,2.4,cream,'x');b.cap(24,10.2,24,8.7,.23,seam,'x');b.cap(24,10.2,25.3,10.8,.23,seam,'x');b.rect(20,13,8,.5,wood,'x');
    b.ell(38.5,11.5,2,2,[145,183,169],'x');b.rect(37,9.7,3,1,[145,183,169],'x');b.cap(38.5,9.5,38.8,6,.22,STEM,'x');b.ell(37.4,7,1.2,.6,STEM,'x');b.ell(40,6,1.2,.65,lt(STEM,.25),'x');
  },
  waterheater(b,v,a){
    const shell=C(a,0,[241,230,217]),panel=C(a,1,[163,199,196]),hot=[208,143,111],on=v==='a1';
    // Ống nóng, van và vòi sen nhỏ nằm sau bình treo tường.
    b.cap(5,15,5,21,.65,hot);b.cap(5,21,9,21,.65,hot);b.cap(12.5,15,12.5,18.5,.6,panel);b.cap(12.5,18.5,14.8,18.5,.6,panel);
    b.cap(3.5,19,6.5,19,.3,rose,'x');b.ell(5,19,.55,.55,brass,'x');
    b.cap(13.8,19.5,15.4,19.5,.55,lt(panel,.2),'x');
    [13.8,14.6,15.4].forEach((x,i)=>{const y=on?21+(i%2)*.5:20.8+(i%2)*.6;b.cap(x,y,x-.25,y+.7,.2,[151,198,221],'x')});
    box(b,2,2,14,14.5,2.5,shell);b.rect(3,5,1,7,lt(shell,.65),'x');
    b.cap(3.5,13,14.5,13,.25,dk(shell,.23),'x');box(b,3,13.5,12,2,.5,panel,'x');
    b.ell(9,7,3.1,3.1,brass,'x');b.ell(9,7,2.35,2.35,chalk,'x');
    b.cap(7.4,5.9,7.8,6.2,.2,panel,'x');b.cap(10.4,5.9,10,6.2,.2,rose,'x');b.cap(9,7,10,5.7,.25,seam,'x');b.dot(9,7,seam,'x');
    b.ell(9,11,1,1,panel,'x');b.cap(9,10.5,9,11.4,.22,chalk,'x');
    b.ell(12.8,11,.55,.55,on?[248,186,108]:[177,191,136],'x');b.dot(12.6,10.8,chalk,'x');
    b.cap(6,14.5,8,14.5,.2,chalk,'x');b.cap(10,14.5,12,14.5,.2,chalk,'x');
  },
  glassdoor(b,v,a){
    const frame=C(a,0,[165,197,181]),glass=C(a,1,[180,214,224]),seal=[117,148,143];
    box(b,2.5,2,27,35.5,.7,cream);
    b.rect(4,3.5,24,32.5,seal,'x');
    [4.5,16.5].forEach((x,i)=>{
      b.rect(x,4,11,31.5,frame,'x');b.rect(x+1,5,9,23.5,glass,'x');
      b.rect(x+1.5,5.5,8,1,lt(glass,.45),'x');b.rect(x+1,6,1,22,lt(glass,.5),'x');
      b.rect(x+2,7,6.5,20.5,lt(glass,.13),'x');
      poly(b,[[x+2,17],[x+7.5,7],[x+9,7],[x+3.5,17]],lt(glass,.65),'x');
      b.cap(x+3.5,23.5,x+8,15.5,.4,lt(glass,.55),'x');
      flake(b,x+(i?7:4),25.5,1.4,lt(glass,.75));
      b.rect(x+1,29.5,9,4.5,lt(frame,.22),'x');b.rect(x+2,30.5,7,2.5,frame,'x');
      [10,28].forEach(y=>b.rect(i?26.5:4,y,1,2,brass,'x'));
    });
    b.cap(16,4,16,35.5,.3,seal,'x');
    [13.5,18.5].forEach(x=>{box(b,x-.7,20,1.4,5,.45,brass,'x');b.cap(x,20.8,x,24.2,.25,chalk,'x');b.dot(x,26,seal,'x')});
    b.rect(3.5,36,25,1.2,dk(frame,.16),'x');b.cap(4.5,36.2,27.5,36.2,.25,cream,'x');
    b.cap(3.5,3,28.5,3,.25,chalk,'x');
  },
  thermcurtain(b,v,a){
    const cloth=C(a,0,[213,153,166]),fold=dk(cloth,.16),lining=[243,216,195],rod=[170,123,96];
    // Cửa sổ ở sau khe rèm, mép lót dày và dây buộc có tua.
    b.rect(8,6,14,24,cream);b.rect(9,7,12,21,ice,'x');b.rect(14.5,7,1,21,cream,'x');b.rect(9,16,12,1,cream,'x');
    b.cap(11,14,13,10,.4,lt(ice,.6),'x');b.cap(17,25,19,21,.4,lt(ice,.6),'x');
    b.cap(3,3,27,3,.65,rod);b.ell(3,3,.7,.7,brass);b.ell(27,3,.7,.7,brass);
    [4,7.5,11,19,22.5,26].forEach(x=>{b.ell(x,4.5,.75,1.1,brass,'x');b.ell(x,4.3,.3,.5,rod,'x')});
    const left=[[3,5.5],[14,5.5],[11.5,13],[9,22],[12,31.5],[3,31.5]];
    const right=left.map(p=>[30-p[0],p[1]]);
    poly(b,left,cloth);poly(b,right,cloth);
    [false,true].forEach(flip=>{const X=x=>flip?30-x:x;
      b.cap(X(13),7,X(9),22,.65,lining,'x');b.cap(X(9),22,X(11),30.5,.65,lining,'x');
      b.cap(X(4.5),7,X(4.5),30,.45,lt(cloth,.3),'x');
      b.cap(X(7),8,X(6),21,.5,fold,'x');b.cap(X(10),8,X(8),20,.4,lt(cloth,.3),'x');
      b.cap(X(6),23,X(7),30,.45,fold,'x');b.cap(X(8),24,X(9),30,.35,lt(cloth,.24),'x');
      b.cap(X(3.5),30.5,X(11),30.5,.25,lining,'x');
      b.cap(X(3.5),22,X(9),22,.55,brass,'x');b.ell(X(9),22,.8,.75,cream,'x');
      b.cap(X(9.5),22.5,X(11),26,.25,brass,'x');b.ell(X(11),27,.65,1.3,brass,'x');
      [[5,12],[5.5,17],[5,27]].forEach(p=>{b.cap(X(p[0]-.5),p[1],X(p[0]+.5),p[1],.18,lining,'x');b.cap(X(p[0]),p[1]-.5,X(p[0]),p[1]+.5,.18,lining,'x')});
    });
    b.rect(3,5.5,24,1.7,cloth,'x');[6,12,18,24].forEach(x=>b.ell(x,7,3,1.5,lt(cloth,.15),'x'));
    b.cap(4,5.8,26,5.8,.25,lining,'x');
  },
  wintercathouse(b,v,a){
    const wood=C(a,0,[218,168,117]),roof=C(a,1,[193,116,122]),dark=[118,82,75],snow=[242,243,230];
    b.rect(3,13,34,21,wood);
    for(let y=16;y<33;y+=3.5){b.cap(3.5,y,36.5,y,.25,dk(wood,.2),'x');[4.5,35.5].forEach(x=>b.ell(x,y+1.3,1,.8,lt(wood,.15),'x'))}
    b.rect(28,4,4,8,dk(roof,.12));b.rect(27,3.5,6,1.5,snow);
    b.tri(20,2,2.5,15,37.5,15,roof);
    [[9,10,16,10],[21,7,26,7],[22,12,32,12]].forEach(p=>b.cap(p[0],p[1],p[2],p[3],.24,dk(roof,.19),'x'));
    b.cap(3.2,14.2,20,2.5,.85,cream);b.cap(20,2.5,36.8,14.2,.85,cream);
    b.cap(3.5,12.8,20,2,1,snow,'x');b.cap(20,2,36.5,12.8,1,snow,'x');
    [7,12,29,34].forEach(x=>{const y=2+Math.abs(x-20)*.635;b.ell(x,y+1,.9,1.25,snow,'x')});
    // Hai cửa rộng và nệm ở y=34, đúng chỗ đặt mèo.
    [12,28].forEach((x,i)=>{
      arch(b,x,17,8.8,34,cream,'x');arch(b,x,18.5,7.9,34,dark,'x');
      arch(b,x,20,6.8,33,[141,96,82],'x');
      b.cap(x-5.5,26,x+5.5,26,.25,[164,113,89],'x');
      quilt(b,x,33.5,17.5,i?[221,157,141]:[233,181,136]);
      [-5,0,5].forEach(dx=>b.cap(x+dx,33.6,x+dx+.7,34.3,.2,cream,'x'));
    });
    box(b,16,11,8,4.5,1,cream,'x');paw(b,20,13.4,roof);
    [4.5,35.5].forEach(x=>{b.cap(x,17,x,19,.25,seam,'x');box(b,x-1,18,2,2.5,.4,brass,'x');b.dot(x,19,chalk,'x')});
    b.rect(2,34.5,36,.5,dk(wood,.1));b.cap(3,34.7,37,34.7,.25,cream,'x');
  },
  insulcathouse(b,v,a){
    const shell=C(a,0,[156,199,182]),rim=C(a,1,[195,190,215]),inside=[92,132,130];
    // Coque arrondie, double joint isolant et petit thermostat de toit.
    b.ell(20,12,17.5,10,shell);box(b,2.5,12,35,22,3,shell);
    b.ell(20,11.5,15.5,7.6,lt(shell,.22),'x');
    b.cap(5,14,35,14,1.1,rim,'x');b.cap(5,13.4,35,13.4,.3,cream,'x');
    [12,28].forEach((x,i)=>{
      arch(b,x,16.5,8.7,34.5,cream,'x');arch(b,x,17.8,7.9,34.5,rim,'x');arch(b,x,19,7.1,34,inside,'x');
      arch(b,x,20.5,6.2,33,lt(inside,.11),'x');
      b.cap(x-5,28,x+5,28,.25,lt(inside,.24),'x');
      quilt(b,x,33.5,17.5,i?[232,184,161]:[186,186,220]);
      [-4,0,4].forEach(dx=>b.dot(x+dx,34,cream,'x'));
    });
    box(b,16.5,7,7,4.5,1,cream,'x');box(b,17.5,8,5,2.5,.5,[117,161,149],'x');
    b.cap(19,8.6,19,9.7,.25,chalk,'x');b.ell(19,10,.45,.45,chalk,'x');b.cap(20.5,8.8,21.5,8.8,.25,[241,206,135],'x');b.dot(24.8,9.5,[239,189,105],'x');
    flake(b,11.5,10,1.5,cream);b.ell(28.5,10,1.2,1.2,brass,'x');
    [[28.5,7.7,28.5,8],[28.5,12,28.5,12.3],[26.2,10,26.5,10],[30.5,10,30.8,10]].forEach(p=>b.cap(p[0],p[1],p[2],p[3],.2,brass,'x'));
    [4,36].forEach(x=>{[25,27,29].forEach(y=>b.cap(x-.4,y,x+.4,y,.2,dk(shell,.25),'x'));b.dot(x,31,brass,'x')});
    b.rect(2.5,34.5,35,.5,rim);b.cap(4,34.7,36,34.7,.25,cream,'x');
  },
  gardenhouse(b,v,a){
    const frame=C(a,0,[155,192,165]),glass=C(a,1,[190,219,218]),timber=[196,159,116],deep=[109,148,132];
    // Panoramic glazing above a low, open sleeping gallery.
    b.rect(5,20,70,32,glass);
    [7,24,41,58].forEach((x,i)=>{
      b.rect(x,21,15,28,i%2?lt(glass,.09):glass,'x');
      poly(b,[[x+1,33],[x+8,22],[x+11,22],[x+4,33]],lt(glass,.5),'x');
      b.cap(x+9,34,x+13,28,.45,lt(glass,.5),'x');
      b.rect(x,39,15,10,[173,199,170],'x');
    });
    b.tri(40,2.5,3.5,20,76.5,20,glass);
    b.tri(40,4.5,8,19,39,19,lt(glass,.15),'x');
    b.tri(41,5,41,19,71,19,lt(glass,.04),'x');
    b.cap(23,12,32,19,.55,lt(glass,.6),'x');b.cap(54,12,65,18,.55,lt(glass,.55),'x');
    // Roof ribs, gutters and a round opening vent.
    [[4,20,40,3],[40,3,76,20]].forEach(p=>{b.cap(p[0],p[1],p[2],p[3],1.2,frame);b.cap(p[0],p[1]-.3,p[2],p[3]-.3,.3,cream,'x')});
    b.cap(22,11.5,22,19,.6,frame,'x');b.cap(58,11.5,58,19,.6,frame,'x');
    b.ell(40,12.5,4.5,4.5,cream,'x');b.ell(40,12.5,3.35,3.35,lt(glass,.12),'x');
    b.cap(40,9.5,40,15.5,.3,frame,'x');b.cap(37,12.5,43,12.5,.3,frame,'x');b.cap(38,14,39.5,11,.3,chalk,'x');
    b.cap(3,20,77,20,.9,frame);b.cap(4,19.6,76,19.6,.3,cream,'x');
    [5,23,40,57,75].forEach(x=>b.rect(x-.6,21,1.2,30,frame,'x'));
    b.rect(5,35,70,1,frame,'x');
    // Hanging fern and flowering basket, both clear of the four beds.
    [12,68].forEach((x,i)=>{
      b.cap(x,21,x,27,.25,seam,'x');b.cap(x,25,x-2.5,29,.22,seam,'x');b.cap(x,25,x+2.5,29,.22,seam,'x');
      b.tri(x-3,29,x+3,29,x+2,32,TERRA,'x');b.tri(x-3,29,x+2,32,x-2,32,TERRA,'x');
      b.cap(x-3,29,x+3,29,.4,lt(TERRA,.25),'x');
      [-2,0,2].forEach(d=>{b.ell(x+d,28,1.6,1,STEM,'x');b.cap(x+d,28,x+d+(d<0?-1:1),30,.3,STEM,'x')});
      if(i){b.ell(x-1,27.3,.7,.7,rose,'x');b.ell(x+1.6,28,.7,.7,[247,214,138],'x')}else b.cap(x-1,29,x-2,33,.35,STEM,'x');
    });
    // A warm string of lights below the ceiling.
    [[20,24,30,26],[30,26,40,27],[40,27,50,26],[50,26,60,24]].forEach(p=>b.cap(p[0],p[1],p[2],p[3],.23,deep,'x'));
    [[23,25],[32,27],[40,28],[48,27],[57,25]].forEach(p=>{b.cap(p[0],p[1]-1,p[0],p[1],.2,brass,'x');b.ell(p[0],p[1]+.4,.65,.85,[252,221,145],'x');b.dot(p[0]-.2,p[1],chalk,'x')});
    // Plants stand behind the gallery; the cushions meet the anchors at y=53.
    [10,70].forEach((x,i)=>{
      b.rect(x-2.5,45,5,5,TERRA,'x');b.rect(x-3,44.5,6,1.2,lt(TERRA,.25),'x');
      b.cap(x,44.5,x,38,.3,STEM,'x');b.ell(x-1.8,40,2.1,1,STEM,'x');b.ell(x+1.8,38.8,2.1,1,lt(STEM,.17),'x');
      if(i)b.ell(x,37.5,1,1.1,rose,'x');
    });
    b.rect(3,51,74,4,timber);b.cap(4,51.4,76,51.4,.3,cream,'x');
    const colors=[[224,172,157],[235,208,145],[177,204,175],[191,186,216]];
    [16,32,48,64].forEach((x,i)=>{quilt(b,x,52.8,17.5,colors[i]);[-4,0,4].forEach(d=>b.dot(x+d,53,cream,'x'))});
    b.cap(4,54.5,76,54.5,.3,lt(timber,.32),'x');
    [5,75].forEach(x=>{b.rect(x-1,21,2,31,frame);b.cap(x-.4,22,x-.4,50,.25,cream,'x');b.rect(x-1.5,50.5,3,2.5,cream,'x')});
    box(b,35.5,30,9,4,1,cream,'x');paw(b,40,32,deep);
  }
});
})();
