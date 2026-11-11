"use strict";
/* Module mẫu do phần lõi giữ: mắt nhắm (trait closed), Mèo "Huh?" và Mèo Grumpy.
   Đây cũng là ví dụ chuẩn cho ba kiểu đăng ký của CatKit: trait, costume có draw, costume có paint. */
(()=>{
const K=CatKit,{P,FT,R}=K;

/* ---- trait closed: mèo luôn nhắm mắt (Zenitsu, Thần Tài) ----
   Khung nhìn thẳng: lõi tự chọn khung nhắm mắt có sẵn của Xoài (xem frameOf trong catkit.js).
   Khung nhìn ngang: xoá con mắt mở rồi vẽ một nét cong bằng màu viền. */
K.trait('closed',{
  side(F,s,FX){
    const [ex,ey]=F.A.eye;
    FX.each(F,(i,x,y)=>{if(Math.abs(x-ex)<=4&&Math.abs(y-ey)<=4&&(F.part[i]===P.HEAD)&&(F.feat[i]===FT.EYEL||F.role[i]>=R.K||F.role[i]===R.B||F.role[i]===R.C)){F.role[i]=R.D;F.feat[i]=0}});
    [[-3,1],[-2,0],[-1,-1],[0,-1],[1,-1],[2,0],[3,1]].forEach(d=>FX.put(F,ex+d[0],ey+1+d[1],R.A,P.HEAD));
  }
});

/* ---- Mèo "Huh?": dấu hỏi lơ lửng cạnh đầu, trễ 1 khung so với đầu ---- */
const QM=[".##.","#..#","...#","..#.","..#.","....","..#."];
K.costume('v_huh',{
  draw(G,s){
    const A=G.lag(1),side=G.side,x0=side?A.earN[0]+7:A.earR[0]+8,y0=(side?A.earN[1]:A.earR[1])-6,L=G.layer();
    QM.forEach((row,j)=>{for(let i=0;i<4;i++)if(row[i]==='#')L.rect(x0+i*2,y0+j*2,2,2,[200,120,90])});
    L.stamp({outline:false});
  }
});

/* ---- Mèo Grumpy: mày cau, miệng trễ. Dùng paint để đổi màu vài ô sẵn có, draw để vẽ thêm nét ---- */
K.costume('v_grumpy',{
  draw(G,s){
    const A=G.A,ink=[120,74,54],L=G.layer();
    if(G.side){const [ex,ey]=A.eye;L.line(ex-4,ey-7,ex+3,ey-4,ink,1);L.line(A.nose[0]-6,A.nose[1]+8,A.nose[0]-2,A.nose[1]+6,ink,1)}
    else{[[A.eyeL,1],[A.eyeR,-1]].forEach(([e,k])=>L.line(e[0]-4*k,e[1]-8,e[0]+3*k,e[1]-5,ink,1));
      const [nx,ny]=A.nose;L.line(nx-4,ny+7,nx-1,ny+5,ink,1);L.line(nx+1,ny+5,nx+4,ny+7,ink,1)}
    L.stamp({outline:false});
  }
});
})();
