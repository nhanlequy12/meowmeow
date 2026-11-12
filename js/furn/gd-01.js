"use strict";
/* Hình vườn nhỏ nhóm 01 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,dk,lt}=Art.K;
Art.addFurn({
  gpot(b,v,a){
    const m=/^(grass|carrot|pump)([123])(d?)$/.exec(v||'');
    const dry=v==='dry'||v==='dead'||!!(m&&m[3]);
    const clay=C(a,0,[215,139,105]),cream=[252,223,171];
    const soil=dry?[187,148,108]:[113,83,67];
    const green=dry?[165,159,88]:[105,164,100];
    const light=dry?[205,181,111]:[163,204,118];
    const dark=dry?[138,119,78]:[76,133,88];
    const stem=(x,y,X,Y,r=.3,c=dark)=>b.cap(x,y,X,Y,r,c,'x');

    // Đĩa hứng nước, thân đất nung tròn và vành miệng dày.
    b.ell(8,18.8,6,.9,dk(clay,.15));
    b.ell(8,18.3,5.8,.65,lt(clay,.17),'x');
    b.ell(8,17.1,4.2,1.35,clay);
    b.tri(2.9,11,13.1,11,8,18.4,clay);
    b.rect(4,11,8,5.8,clay);
    b.ell(8,15.8,4.1,1.65,clay);
    b.cap(4.5,12.4,4.9,15.9,.4,lt(clay,.2),'x');
    b.cap(11.9,12.5,11.2,16.2,.35,dk(clay,.13),'x');
    b.ell(8,10.6,6,1.65,clay);
    b.ell(8,9.8,6,1.45,lt(clay,.2));
    b.ell(8,9.65,4.8,.95,dk(clay,.25),'x');
    b.ell(8,9.55,4.35,.7,soil,'x');

    // Hạt khoáng và các khe đất khô nằm trong lòng chậu.
    if(dry){
      const crack=dk(soil,.28);
      stem(5,9.35,6.4,9.8,.18,crack);
      stem(6.4,9.8,6,10,.18,crack);
      stem(10.4,9.15,9.5,9.7,.18,crack);
      stem(9.5,9.7,10.5,9.95,.18,crack);
    }else{
      b.set(4.5,9.5,[180,143,100],'x');
      b.dot(21,19,[208,171,119],'x');
      b.dot(13,18,[151,113,81],'x');
    }

    if(v==='dead'){
      stem(7.8,9.5,7.2,6.4,.4,[144,106,76]);
      stem(7.2,6.4,5.5,7.3,.3,[166,125,82]);
      stem(8.3,9.5,9.7,7.1,.3,[144,106,76]);
      stem(9.7,7.1,10.6,8,.3,[166,125,82]);
      b.ell(5.4,7.8,.6,1,[185,146,94]);
      b.ell(10.7,8.5,.7,.55,[194,155,100]);
      stem(7.2,6.3,7.8,5.6,.22,[198,163,111]);
    }

    if(m){
      const type=m[1],s=+m[2];
      if(type==='grass'){
        // Lá cùng mọc từ một bụi, đầu lá nhọn và sáng màu.
        const blades=s===1?[[6.2,7],[8,6.2],[9.6,7.1]]:
          s===2?[[4.5,6],[5.5,4.6],[7.3,3.7],[8.7,4.6],[10,4.2],[11.8,6]]:
          [[3.2,5.1],[4.1,3.8],[5.4,2.7],[6.5,1.6],[7.7,3.1],
            [8.6,1.5],[9.6,2.8],[10.8,2],[11.5,4],[12.7,5.3]];
        blades.forEach(([x,y],i)=>{
          const root=7.1+(i%4)*.55,c=i%2?light:green;
          if(dry){
            const joint=8+(x-8)*.65,top=y+1.1;
            stem(root,9.5,joint,top,.32,c);
            b.tri(joint-.35,top,joint+.35,top,x,top+2,c);
            stem(joint,top,x,top+2,.2,light);
          }else{
            b.tri(root-.45,9.6,root+.45,9.6,x,y,c);
            stem(root,9.2,x,y+.4,.2,c);
            b.dot(Math.round(x*2),Math.round(y*2),light,'x');
          }
        });
        if(s===3){
          for(const [x,y] of (dry?[[6.3,4],[10.1,4.4]]:[[6.5,2.1],[10.8,2.5]])){
            b.cap(x,y,x+.1,y+.8,.3,dry?[205,173,111]:[223,216,143],'x');
          }
        }
      }else if(type==='carrot'){
        if(s===3){
          b.ell(8,8.5,1.7,1.5,[234,149,74]);
          b.ell(7.7,8.1,1.15,1,[250,178,93],'x');
          stem(8.5,8.6,9.1,8.6,.18,[199,115,62]);
          stem(6.7,9.2,7.4,9.2,.18,[199,115,62]);
        }
        if(s===1){
          stem(8,9.4,8,7,.32,green);
          b.ell(6.8,dry?7.9:6.9,1.3,.65,light);
          b.ell(9.2,dry?8:6.4,1.2,.7,green);
        }else{
          const tips=s===2?[[4.7,5.2],[7.5,3.8],[10.7,4.9]]:
            [[3.8,4.5],[5.5,2.5],[8,1.6],[10,2.7],[12.1,4.6]];
          tips.forEach(([x,y],i)=>{
            const X=dry?8+(x-8)*.65:x,Y=dry?y+1.3:y;
            stem(8,9,X,Y,.3,green);
            for(let j=0;j<3;j++){
              const t=.35+j*.24,px=8+(X-8)*t,py=9+(Y-9)*t;
              const spread=s===3?1.25:1;
              stem(px,py,px-spread,py+(dry?.9:-.65),.4,i%2?light:green);
              stem(px,py,px+spread,py+(dry?1:-.65),.4,i%2?green:light);
            }
            stem(X,Y,X+(x<8?-.5:.5),Y+(dry?1.5:-.1),.4,light);
          });
        }
      }else{
        if(s===1){
          stem(8,9.5,8,7.4,.35,green);
          b.ell(6.6,dry?8.1:6.9,1.45,.9,light);
          b.ell(9.5,dry?8.2:6.7,1.45,1,green);
          stem(6.6,dry?8.1:6.9,8,7.6,.2,dark);
        }else{
          // Một dây bí mang lá, tua cuốn và hoa hoặc quả.
          stem(7.7,9.6,5.4,7.1,.42,green);
          stem(5.4,7.1,6.3,s===3?3.3:5,.38,green);
          stem(6.3,s===3?3.3:5,9.6,s===3?2.5:4.9,.3,green);
          stem(6,6.4,11.2,6.7,.3,green);
          const leaves=s===3?[[5,3.4,1.4],[9.1,2.8,1.35],[4.3,6.6,1.3]]:
            [[5.4,5.3,1.55],[9.8,6.9,1.3]];
          leaves.forEach(([x,y,r],i)=>{
            if(dry)y+=1.3;
            const c=i%2?light:green;
            b.ell(x,y,r,r*.8,c);
            b.ell(x-r*.55,y+.45,r*.65,r*.65,c);
            b.ell(x+r*.55,y+.45,r*.65,r*.65,c);
            b.tri(x-r*.8,y+.3,x+r*.8,y+.3,x,y+r*1.1,c);
            stem(x,y-.4,x,y+r*.6,.2,dark);
            stem(x,y+.3,x-.65,y,.18,dark);
          });
          stem(10.9,6.7,11.7,5.7,.22,green);
          stem(11.7,5.7,12.5,6,.22,green);
          if(s===2){
            const y=dry?6:4.8;
            stem(9.1,6.5,10.2,y,.3,green);
            b.ell(10.3,y,1.2,.55,[246,205,105]);
            b.ell(10.3,y,.55,1.1,[250,217,124]);
            b.ell(10.3,y,.45,.45,[213,148,73],'x');
          }else{
            const orange=dry?[208,154,87]:[239,158,77];
            b.ell(9.6,8,2.9,2.1,orange);
            b.ell(8.7,8,1.25,2,lt(orange,.13),'x');
            b.ell(10.5,8,1.15,2,dk(orange,.08),'x');
            b.ell(9.6,8,1.05,2.1,lt(orange,.21),'x');
            stem(8.2,6.7,8,8.9,.2,dk(orange,.22));
            stem(11,6.7,11.2,8.9,.2,dk(orange,.22));
            stem(9.6,6.1,9.2,5.3,.4,dark);
            stem(9.2,5.3,9.8,5,.3,green);
            b.dot(18,14,[255,216,136],'x');
          }
        }
      }
    }

    // Gờ miệng phía trước và dấu chân mèo màu kem trên thân chậu.
    b.cap(3.2,10.7,12.8,10.7,.35,lt(clay,.26),'x');
    b.cap(5.4,14.5,10.6,14.5,.45,lt(clay,.15),'x');
    b.ell(8,15.2,1,.7,cream,'x');
    b.ell(6.9,14.1,.38,.45,cream,'x');
    b.ell(8,13.8,.38,.45,cream,'x');
    b.ell(9.1,14.1,.38,.45,cream,'x');
    b.dot(10,30,lt(clay,.4),'x');
    b.dot(21,30,lt(clay,.4),'x');
    b.cap(5.2,17.3,10.8,17.3,.2,dk(clay,.2),'x');
  },
});
})();
