"use strict";
/* Hình vườn nhỏ nhóm 02 (Codex vẽ). Nạp sau js/art.js. */
(()=>{const {C,dk,lt}=Art.K;
Art.addFurn({
  gbed(b,v,a){
    const m=/^(grass|carrot|pump)([123])(d?)$/.exec(v||'');
    const crop=m?m[1]:'',stage=m?+m[2]:0,thirst=!!(m&&m[3]);
    const dry=v==='dry'||v==='dead'||thirst;
    const wood=C(a,0,[198,145,99]),grain=[151,103,74],nail=[239,214,163];
    const soil=dry?[182,142,105]:[111,79,65];
    const green=thirst?[169,162,85]:[108,167,91];
    const light=thirst?[206,184,108]:[163,202,111];
    const stem=thirst?[138,125,69]:[83,135,79];
    const leaf=(x,y,rx,ry,c)=>b.ell(x,y,rx,ry,c,'x');
    const twig=(x,y,X,Y,r,c)=>b.cap(x,y,X,Y,r,c,'x');

    // Chân thấp và thành sau; đất nằm lọt trong vành gỗ.
    b.rect(4.5,16.5,3,3,dk(wood,.18));
    b.rect(36.5,16.5,3,3,dk(wood,.18));
    b.rect(5,18,1,1.5,lt(wood,.12),'x');
    b.rect(37,18,1,1.5,lt(wood,.12),'x');
    b.rect(2,8,40,9.5,wood);
    b.ell(22,8.5,20,.9,lt(wood,.17));
    b.ell(22,9.5,18.8,1.8,soil,'x');
    b.rect(4,9,36,2,soil,'x');
    twig(4,8.3,40,8.3,.2,dk(wood,.22));
    for(const [x,y] of [[5,9.5],[13,8.5],[18,10],[26,8.5],[30,10],[38,9]]){
      b.rect(x,y,1,.5,dry?lt(soil,.2):[170,133,91],'x');
    }
    if(dry){
      for(const x of [7,17,28,37]){
        twig(x-1,9,x,9.5,.19,[139,103,78]);
        twig(x,9.5,x-.5,10.5,.18,[139,103,78]);
        twig(x,9.5,x+1.5,9.5,.18,[139,103,78]);
      }
    }

    // Chaque touffe garde son ancrage mais possède sa propre silhouette.
    for(let i=0;i<3;i++){
      const x=10+i*12,y=9.6+(i===1?-.4:0),s=i===1?1.08:i===2?.93:1;
      if(v==='dead'){
        const brown=[148,113,76],pale=[191,162,112];
        twig(x,y,x-.6,6.3+i*.4,.35,brown);
        twig(x-.6,6.3+i*.4,x+1.5,7.5,.3,brown);
        twig(x,y,x-2.2,8,.3,brown);
        twig(x-2.2,8,x-3,8.7,.26,pale);
        twig(x-.5,7,x-2,6.6,.24,pale);
        leaf(x+1.6,8,.8,.35,pale);
        leaf(x-2.6,10,1,.35,brown);
        continue;
      }
      if(!m)continue;
      if(crop==='grass'){
        const n=stage===1?3:stage===2?7:11;
        for(let j=0;j<n;j++){
          const t=n===1?0:j/(n-1)*2-1;
          const h=(stage===1?2:stage===2?4.3:6.8)*s*(1-.28*Math.abs(t));
          const spread=(stage===1?1.3:stage===2?2.8:3.6)*t;
          const bend=thirst?(1.2+Math.abs(t)*.7):0;
          const X=x+spread,Y=y-h;
          twig(x+t*.6,y,X,Y+bend,.3,j%3===0?light:green);
          if(thirst)twig(X,Y+bend,X+(t<0?-.7:.7),Y+bend+1.2,.28,light);
          else twig(X,Y+.8,X+(j%2?.3:-.3),Y,.24,light);
          if(stage===3&&(j===2||j===7)){
            leaf(X,Y+.1,.4,.85,thirst?[204,174,109]:[219,213,139]);
            b.dot(Math.round(X*2),Math.round((Y-.3)*2),[244,228,170],'x');
          }
        }
      }else if(crop==='carrot'){
        if(stage===3){
          b.tri(x-1.5,y-.4,x+1.6,y-.4,x+.3,y+1.3,[222,137,72],'x');
          leaf(x,y-.5,1.6,1.1,[239,158,78]);
          twig(x-.7,y-.9,x+.4,y-.9,.19,[255,199,111]);
          twig(x+.1,y+.1,x+1,y+.1,.18,[186,109,58]);
        }
        if(stage===1){
          twig(x,y,x,y-1.7,.25,stem);
          leaf(x-.9,y-1.8,1,.5,green);
          leaf(x+.9,y-(thirst?1.4:2.2),1,.6,light);
        }else{
          for(let j=-2;j<=2;j++){
            const h=(stage===3?5.8:3.8)*s-Math.abs(j)*.6;
            const X=x+j*(stage===3?1.35:1),Y=y-h;
            twig(x,y-.5,X,Y+(thirst?1.6:0),.25,stem);
            for(let k=1;k<=3;k++){
              const t=k/3,px=x+(X-x)*t,py=y-.5+(Y-y+.5)*t+(thirst?1.6*t:0);
              const w=(stage===3?1.1:.85)*(1-.12*k);
              twig(px,py,px-w,py+(thirst?.8:-.65),.35,k%2?green:light);
              twig(px,py,px+w,py+(thirst?1:-.6),.35,k%2?light:green);
            }
          }
        }
      }else if(crop==='pump'){
        if(stage===1){
          twig(x,y,x,y-1.6,.3,stem);
          leaf(x-1.2,y-(thirst?1.1:2),1.25,.8,green);
          leaf(x+1.2,y-(thirst?.8:2.2),1.25,.9,light);
          twig(x-.6,y-1.9,x-.1,y-1.6,.17,stem);
        }else{
          const reach=stage===3?4.2:3.5;
          twig(x-reach,y+.1,x+reach,y-.2,.35,stem);
          twig(x-2,y,x-2.9,y-1,.25,stem);
          twig(x,y,x-.6,y-(thirst?2:3.6),.35,stem);
          twig(x+2,y,x+2.3,y-2,.28,stem);
          for(const [dx,dy,r] of [[-3,-1.6,1.5],[-.7,-3.1,1.8],[2.5,-2.2,1.5]]){
            const Y=y+dy+(thirst?1.1:0),X=x+dx;
            leaf(X,Y,r,thirst?.65:1.2,dx<0?green:light);
            b.tri(X-r,Y,X,Y-1.5+(thirst?.8:0),X+r,Y,dx<0?green:light,'x');
            twig(X,Y+.4,X,Y-.6,.18,stem);
            twig(X,Y,X-.6,Y-.4,.17,stem);
          }
          if(stage===2){
            const X=x+3.8,Y=y-1;
            for(const [dx,dy] of [[-.7,0],[.7,0],[0,-.7],[0,.7]])leaf(X+dx,Y+dy,.55,.55,[246,209,112]);
            leaf(X,Y,.45,.45,[221,155,73]);
          }else{
            const X=x+1,Y=y-.2,R=(i===1?2.9:2.5);
            leaf(X,Y,R,1.8,[215,127,64]);
            leaf(X-.8,Y-.1,R*.5,1.65,[238,158,77]);
            leaf(X+.8,Y-.1,R*.43,1.65,[232,147,68]);
            leaf(X,Y-.2,.65,1.6,[246,174,89]);
            twig(X-1.6,Y-.8,X-1.8,Y+.4,.18,[196,116,59]);
            twig(X+1.5,Y-.9,X+1.8,Y+.5,.18,[196,116,59]);
            twig(X,Y-1.6,X-.3,Y-2.4,.38,stem);
            twig(X-.3,Y-2.4,X+.3,Y-2.6,.28,stem);
            leaf(X-.7,Y-.9,.5,.3,[255,205,126]);
          }
        }
      }
    }

    // Deux planches, veinage discret, nœuds et montants cloués.
    b.rect(2,11.5,40,6,wood);
    b.cap(2.7,11.5,41.3,11.5,.55,lt(wood,.22));
    twig(3,12.3,41,12.3,.2,grain);
    twig(3,14.8,41,14.8,.23,grain);
    twig(6,13,16,13,.19,lt(wood,.27));
    twig(23,13.5,35,13.5,.18,dk(wood,.13));
    twig(7,16.3,20,16.3,.18,lt(wood,.24));
    twig(28,15.7,37,15.7,.18,lt(wood,.26));
    b.ell(18.5,13.6,1.3,.45,dk(wood,.15),'x');
    twig(18,13.6,19,13.6,.18,grain);
    b.ell(30,16.4,.9,.4,dk(wood,.14),'x');
    twig(29.7,16.4,30.4,16.4,.17,grain);
    for(const x of [3.5,38.5]){
      b.rect(x,11,2,7,dk(wood,.12),'x');
      b.rect(x,11,.5,6.5,lt(wood,.25),'x');
      for(const y of [12,16.5]){
        leaf(x+1,y,.4,.4,grain);
        b.dot((x+1)*2,y*2,nail,'x');
      }
    }

    // Petite étiquette de semis au coin, avec un pictogramme lisible.
    b.rect(39,6,1,4.7,grain,'x');
    b.rect(37.5,4,4.5,2.8,lt(wood,.2));
    twig(38,4.4,41.5,4.4,.18,[239,204,153]);
    if(crop==='carrot'){
      b.tri(39,5,40.8,5,39.8,6.3,[223,133,66],'x');
      twig(39.8,5,39.3,4.6,.2,stem);
    }else if(crop==='pump'){
      leaf(39.8,5.5,1.1,.7,[232,149,72]);
      twig(39.8,4.8,39.8,4.5,.2,stem);
    }else{
      twig(39.8,6,39.8,5,.2,stem);
      leaf(39.1,5.1,.6,.3,green);
      leaf(40.4,5.4,.6,.3,green);
    }
  },
});
})();
