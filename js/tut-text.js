"use strict";
/* ============ CHỮ CỦA HƯỚNG DẪN TÂN THỦ ============
   Toàn bộ lời thoại, thẻ mèo khởi đầu, mẹo theo ngữ cảnh và Sổ tay nằm ở đây để dễ sửa.
   - Mỗi bước là một mảng câu thoại; mỗi phần tử là một khung, tối đa 2 câu.
   - Chỗ giữ tên: {cat} = tên bé khởi đầu, {new} = tên bé vừa mở từ gacha, {breed} = tên giống.
   - Emoji có trong bảng icon của game (🪙 🎟 🍗 ⚡ 😊 ⚙ 🔒 ✨ ❤ ...) tự đổi thành icon hạt cườm.
   Thứ tự các bước và việc từng bước làm nằm ở js/tutorial.js; thiết kế ở docs/tutorial-plan.md. */
const TUT_TEXT={
  guide:{name:'Xoài',key:'venxam'},   // người dẫn đường: mèo vện xám Xoài (bộ khung gốc của mọi mèo)

  ui:{
    skip:'Bỏ qua',
    tap:'Chạm để tiếp',
    next:'Tiếp',
    ok:'Đã hiểu',
    skipTitle:'Bỏ qua hướng dẫn?',
    skipText:'Bạn vẫn nhận đủ quà tân thủ. Mọi phần đều xem lại được trong Sổ tay ở ⚙ Cài đặt.',
    skipNeedPick:'Chỉ cần chọn bé khởi đầu nữa là xong.',
    skipYes:'Bỏ qua',
    skipNo:'Học tiếp',
    replayTag:'Xem lại hướng dẫn',
    replayEnd:'Hết phần xem lại rồi. Sổ tay vẫn luôn ở trong ⚙ Cài đặt nhé!'
  },

  /* ---------- luồng chính ---------- */
  steps:{
    hi:[
      'Meo chào bạn! Tớ là Xoài, mèo vện xám giữ nhà ở Mèo Xu.',
      'Ở đây bạn nuôi mèo, cho các bé đi viễn chinh kiếm xu, rồi mở hộp quà để đón thêm bạn mới.',
      'Nhà mình đang trống trơn. Chọn một bé về ở cùng bạn trước đã nhé!'
    ],
    room:['{cat} về tới phòng khách rồi! Từ nay đây là nhà của bé.'],
    pet:['Chạm vào {cat} để vuốt ve. Được cưng là bé tặng bạn vài xu 🪙.'],
    fol:[
      'Bé kêu grừ grừ kìa! Chạm vào bé nào thì camera đi theo bé đó.',
      'Thẻ này hiện độ no 🍗, năng lượng ⚡ và độ vui 😊. Mỗi bé 10 phút mới cho xu vuốt ve một lần.',
      'Độ no 🍗 tụt dần, hơn 3 tiếng là cạn. Dưới 20 là bé đói, không đi viễn chinh được.',
      'Năng lượng ⚡ là sức để đi viễn chinh, mỗi chuyến tốn 25 tới 50. Ở nhà bé hồi khoảng 1 điểm mỗi phút.',
      'Độ vui 😊 càng cao, chuyến đi càng nhiều xu: bé vui nhất kiếm gấp rưỡi bé buồn nhất. Phòng đẹp, đủ đồ chơi thì bé vui lâu.'
    ],
    poses:[
      'Bé tự sinh hoạt cả ngày: ngồi, vẫy đuôi, liếm lông, ngủ, đi dạo, chạy, nhảy.',
      'Có đồ leo trèo là bé trèo lên tận tầng cao. Mèo con hiếu động, còn mèo già thì hay ngủ.'
    ],
    view:[
      'Kéo khung phòng để xem khắp nơi, bấm ＋ － để phóng to thu nhỏ.',
      'Trên máy tính giữ Ctrl rồi lăn chuột; trên điện thoại chụm 2 ngón cũng được.'
    ],
    feed:['Bé hơi đói rồi. Bấm Cho ăn nào!'],
    food:['Hạt khô rẻ mà no lâu. Chọn Hạt khô nhé!'],
    fed:[
      'Ngon quá! Ăn xong mỗi bé cảm ơn bạn 4 xu.',
      'Bát đổ lại được sau 10 phút. Bé đói dưới 20 thì không đi viễn chinh được đâu.'
    ],
    ticket:['Giờ tới phần vui nhất: hộp quà mèo! Tớ tặng bạn 1 vé 🎟 để mở thử.'],
    gtab:['Bấm vào tab Gacha nào.'],
    stars:[
      'Số sao là độ hiếm, mỗi bậc một màu. Sao càng nhiều, bé càng kiếm được nhiều xu.',
      'Bé màu lông hiếm, mắt quý hiếm hay trang phục hiếm thì sao lấp lánh đủ 7 màu!',
      'Có bảo hiểm: quá 9 lượt chưa ra 4★ thì lượt thứ 10 chắc chắn từ 4★ trở lên.'
    ],
    pull:['Bấm Dùng vé để mở hộp. Lần đầu tớ ém sẵn rồi: chắc chắn ra một bé 4★ Sử thi!'],
    reveal:['Xem ai tới này! Muốn thì đặt tên, rồi bấm Đón về nhà.'],
    dhead:['Đây là màn thông tin của {new}. Viền và hàng sao cho biết bé hiếm cỡ nào.'],
    dprof:['Hồ sơ ghi giống, màu lông, tuổi và món khoái khẩu. Cho ăn đúng món khoái khẩu, bé no hơn và vui hơn.'],
    dtrait:[
      'Thuộc tính là tài lẻ của bé, số thuộc tính bằng số sao. Xanh là tốt, hồng là tật xấu, vàng là độc quyền.',
      'Chạm vào một thuộc tính để đọc nó làm được gì.'
    ],
    atab:['Giờ ghé Sưu tập xem nào.'],
    album:['Giống nào bạn từng gặp đều sáng lên ở đây. Chạm vào để xem các màu lông, bé 5★ còn xem lại được intro.'],
    rare:['Có 9 màu lông hiếm, mỗi lượt khoảng 4% cơ hội. Bé màu hiếm luôn 4★ và có thuộc tính riêng của màu.'],
    ttab:['Xu chủ yếu đến từ viễn chinh. Bấm tab Viễn chinh nào!'],
    slot:['Bấm Chọn mèo để cử một bé lên đường.'],
    trip:['Mỗi điểm đến khác nhau về thời gian, xu và năng lượng ⚡. Chạm vào một bé để lên đường.'],
    tinfo:[
      'Bé đi rồi! Hết giờ thì bấm Nhận quà để lấy xu, kinh nghiệm, đôi khi cả vé.',
      'Lên cấp 3, 5, 7, 9 sẽ mở thêm ô, cử được nhiều bé cùng lúc.'
    ],
    stab:['Có xu rồi thì ghé Cửa hàng.'],
    shop:[
      'Ở đây bán phòng mới và nội thất. Đồ đạc làm mèo vui hơn, hồi sức nhanh hơn, có món còn tăng xu cho cả nhà.',
      'Món có ổ khóa 🔒 sẽ mở khi bạn lên đủ cấp.'
    ],
    level:[
      'Đây là cấp của bạn. Viễn chinh, cho ăn, vuốt ve, gacha hay mua sắm đều cho kinh nghiệm.',
      'Lên cấp sẽ mở thêm ô viễn chinh, điểm đến, phòng và món mới.'
    ],
    gift:['Bạn học nhanh ghê! Đây là quà tân thủ tớ chuẩn bị sẵn.'],
    next:['Tớ ghi sẵn vài việc nên làm tiếp. Quên gì thì mở Sổ tay trong ⚙ Cài đặt nhé!'],
    bye:['Chúc bạn nuôi mèo vui vẻ! Meo~']
  },

  /* ---------- chọn mèo khởi đầu ---------- */
  pick:{
    title:'Chọn bé đầu tiên',
    sub:'Bé nào cũng giỏi, mỗi bé một kiểu. Chạm vào thẻ để xem kỹ.',
    persL:'Tính cách',
    strongL:'Điểm mạnh',
    traitL:'Thuộc tính',
    favL:'Khoái khẩu',
    confirm:'Đón {breed} về nhà?',
    nameL:'Đặt tên cho bé',
    namePh:'Tên của bé',
    nameEmpty:'Bé cần một cái tên đã!',
    yes:'Chọn bé này',
    no:'Xem bé khác',
    note:'Bé về nhà là mèo con 1★, mang thuộc tính khởi đầu riêng như trên.'
  },
  // ba bé khởi đầu: cùng 1★, cùng mèo con, mỗi bé một thuộc tính khởi đầu riêng, mỗi bé một lối chơi; số liệu thuộc tính nằm ở TRAITS (js/data.js)
  starters:[
    {sp:'muop',coat:'brownTabbyW',name:'Mướp ta',role:'Lữ khách đầu ngõ',style:'Đi nhiều chuyến',
      pers:'Lanh lợi, lì lợm, chuyện gì trong xóm cũng muốn ló mặt vào.',
      strong:'Viễn chinh nhanh và ít tốn sức. Hợp với người hay ghé game.',
      traits:['s_muop'],names:['Mướp','Tiêu','Gạo','Sóc']},
    {sp:'vang',coat:'redTabbyW',name:'Mèo vàng',role:'Cục cưng cả xóm',style:'Ở nhà, được cưng',
      pers:'Ham ăn, tình cảm, ai đi ngang cũng đòi được gãi cằm.',
      strong:'Vuốt ve ra nhiều xu, cả phòng vui lây. Hợp với người thích ở nhà cưng mèo.',
      traits:['s_vang'],names:['Vàng','Cam','Bắp','Mít']},
    {sp:'trang',coat:'white',name:'Mèo trắng',role:'Bông tuyết may mắn',style:'Săn vé, chơi đêm',
      pers:'Nhẹ nhàng, hơi nhát, nhưng lúc nào cũng gặp may.',
      strong:'Hay nhặt được vé gacha, đi đêm kiếm thêm xu. Hợp với người hay chơi buổi tối.',
      traits:['s_trang'],names:['Bông','Sữa','Tuyết','Gạo']}
  ],

  /* ---------- bảng dáng của mèo (bước poses) ---------- */
  poses:{
    title:'Các dáng của {cat}',
    list:[['sit','Ngồi'],['tail','Vẫy đuôi'],['groom','Liếm lông'],['sleep','Ngủ'],['walk','Đi'],['run','Chạy'],['jump','Nhảy']]
  },

  /* ---------- bảng màu sao (bước stars) ---------- */
  stars:{
    title:'Màu sao và tỉ lệ mỗi lượt',
    colors:['trắng','xanh lục','xanh biển','tím','vàng lấp lánh'],
    rainbow:'Màu lông hiếm · mắt quý hiếm · trang phục hiếm',
    rainbowP:'7 màu lấp lánh',
    pity:'Bảo hiểm 10 lượt'
  },

  /* ---------- quà và kết thúc ---------- */
  gift:{
    title:'🎁 Quà tân thủ',
    btn:'Nhận quà',
    got:'Đã nhận quà tân thủ',
    ticketToast:'Xoài tặng 1 vé gacha'
  },
  nextTitle:'Việc nên làm tiếp',
  nextList:[
    '🎒 Khi bé viễn chinh về, vào tab Viễn chinh bấm Nhận quà.',
    '🍚 Cứ 10 phút cho cả phòng ăn một lần, và vuốt ve từng bé.',
    '🎟 Dùng vé vừa nhận để mở thêm bạn mới ở tab Gacha.',
    '🧶 Đặt Chuột đồ chơi vào phòng: bấm ✏ Sắp xếp đồ, chọn trong Kho đồ.',
    '🚪 Gom xu mua Phòng ngủ khi lên cấp 2, nhà sẽ rộng hơn.'
  ],

  /* ---------- mẹo theo ngữ cảnh: hiện một lần, lúc người chơi chạm tới lần đầu ---------- */
  hints:{
    edit:['Chế độ sắp xếp: kéo đồ để di chuyển, đồ tự bám theo lưới.','Chạm một món để xoay, cất kho hoặc xóa (hoàn 25% giá).'],
    cats:['Đây là nơi quản lý cả đàn. Chạm ô phòng để lọc, đổi phòng bằng ô chọn trên thẻ hoặc kéo thẻ thả vào ô phòng.','Bật ☑ Chọn nhiều để phóng sinh nhiều bé một lúc.'],
    release:['Phóng sinh thì bé rời nhà mãi mãi, bạn nhận lại ít xu theo số sao; bé 5★ tặng thêm 1 vé.','Sưu tập vẫn ghi là bạn đã từng nuôi bé.'],
    wait:['Các phòng đã đầy nên bé mới phải ngồi Phòng chờ, bị trừ 10 độ vui.','Mua thêm phòng ở Cửa hàng rồi chuyển bé sang nhé.'],
    levelup:['Lên cấp rồi! Ghé Cửa hàng xem món nào vừa mở khóa.'],
    claim:['Có bé viễn chinh về rồi! Vào tab Viễn chinh bấm Nhận quà.'],
    popup:['Bé mang xu về kèm kinh nghiệm. Dòng thuộc tính bên dưới cho biết tài lẻ nào của bé vừa giúp sức.'],
    x10:['Đủ xu hoặc vé rồi thì thử Mở ×10: quay 10 lượt một lần rồi xem cả bảng kết quả.'],
    rare:['Sao 7 màu! Bé này mang màu lông hiếm, mắt quý hiếm hoặc trang phục hiếm.','Bé có ô riêng trong Sưu tập đấy.'],
    five:['Huyền thoại 5★! Trong phòng, bé có hành động riêng và trạng thái đặc biệt kéo dài 60 giây.','Muốn xem lại intro thì vào Sưu tập.'],
    broken:['Ối, đồ bị cào rách nên mất hiệu ứng. Sửa tốn 30% giá.','Đặt trụ cào trong cùng phòng thì bé ít cào hơn.'],
    bowl:['Số suất trong bát ít hơn số mèo, có bé sẽ phải nhịn.','Mua thêm bát ở Cửa hàng, mục Bát ăn nhé.'],
    food:['Món mới đã mở! Mỗi món có tác dụng riêng, như thêm năng lượng hay tăng xu viễn chinh.','Dòng ❤ cho biết món đó là khoái khẩu của bé nào.'],
    room2:['Giờ bạn có nhiều phòng. Bấm ◀ ▶ hoặc tên phòng để chuyển qua lại.','Mỗi phòng có hiệu ứng riêng, chuyển mèo ở tab Quản lý mèo.'],
    away:['Lúc bạn vắng, bé đói sẽ tự ra ăn suất còn thừa trong bát.','Có Máy cho ăn tự động thì máy còn tự đổ hạt khô giúp bạn.'],
    settings:['Đổi giao diện sáng tối và cỡ hạt cườm ở đây.','Sổ tay hướng dẫn cũng nằm trong này, xem lại lúc nào cũng được.'],
    tags:['Mỗi điểm đến có thẻ riêng như đông người, gần nước, thiên nhiên.','Thuộc tính của bé có thể cộng hoặc trừ xu theo thẻ đó, và theo ngày hay đêm.']
  },

  /* ---------- Sổ tay (Cài đặt) ---------- */
  book:{
    title:'📖 Sổ tay hướng dẫn',
    sub:'Mọi điều Xoài đã kể, gom lại một chỗ.',
    replay:'▶ Chơi lại hướng dẫn tân thủ',
    replayQ:'Xem lại toàn bộ hướng dẫn? Chế độ xem lại không tốn xu, vé và không phát quà lần nữa.',
    hintsReset:'Bật lại các mẹo',
    hintsDone:'Các mẹo sẽ hiện lại khi bạn chạm tới.',
    back:'‹ Mục lục',
    close:'Đóng',
    pages:[
      {id:'start',ic:'🐾',t:'Bắt đầu',p:[
        'Mèo Xu là game nuôi mèo kiểu nhàn: khoảng 10 phút ghé một lần để nhận xu viễn chinh, cho ăn và vuốt ve các bé.',
        'Xu 🪙 dùng để mở hộp quà gacha, mua thức ăn, phòng và nội thất. Vé 🎟 mở được một lượt gacha.',
        'Game tự lưu 10 giây một lần và sau mỗi hành động.']},
      {id:'room',ic:'🏠',t:'Phòng và mèo',p:[
        'Kéo khung phòng để xem khắp nơi. Bấm ＋ －, giữ Ctrl rồi lăn chuột, hoặc chụm 2 ngón để phóng to thu nhỏ.',
        'Chạm vào mèo để theo dõi và vuốt ve: mỗi bé 10 phút một lần cho số xu bằng số sao, thêm 3 độ vui. Chạm chỗ trống để thôi theo dõi.',
        'Mỗi bé có độ no 🍗, năng lượng ⚡, độ vui 😊; xem chương Ba chỉ số của mèo.',
        'Bé tự sinh hoạt: ngồi, liếm lông, ngủ, đi dạo, chạy, nhảy, trèo đồ nhiều tầng. Mèo con (dưới 3 ngày) hiếu động, mèo già (từ 30 ngày) hay ngủ và ít trèo. Tuổi chỉ đổi cách sinh hoạt, không đổi xu.']},
      {id:'stats',ic:'😊',t:'Ba chỉ số của mèo',p:[
        'Cả ba chỉ số đều phục vụ viễn chinh: no để được đi, năng lượng để trả cho chuyến đi, vui để chuyến đi mang về nhiều xu.',
        'Độ no 🍗: tụt dần, từ đầy tới cạn mất khoảng 3 giờ 20 phút. Dưới 20 là bé đói: không đi viễn chinh được và bị trừ 25 độ vui. Đói hẳn về 0 thì năng lượng chỉ hồi 30% tốc độ thường. Cho ăn để làm đầy lại.',
        'Năng lượng ⚡: mỗi chuyến viễn chinh tốn 25 tới 50 tùy điểm đến, thiếu thì không đi được. Ở nhà bé hồi khoảng 1 điểm mỗi phút; đang đi thì không hồi. Nệm ngủ, Phòng ngủ và một vài thuộc tính giúp hồi nhanh hơn; ức gà, cá hồi, hộp cao cấp hồi ngay.',
        'Độ vui 😊: nhân xu viễn chinh từ ×0,8 (vui 0) qua ×1 (vui 50) tới ×1,2 (vui 100). Vuốt ve (+3), món ngon và món khoái khẩu cộng vui ngay.',
        'Về lâu dài, độ vui trôi dần (1 điểm mỗi phút) về một mức do phòng quyết định: nội thất, thuộc tính của bé, bạn cùng phòng. Bé đói hoặc ngồi Phòng chờ thì mức này thấp đi.',
        'Thuộc tính, buff thức ăn và đồ đạc làm các con số trên nhanh hoặc chậm hơn; chạm vào nhãn thuộc tính để xem.']},
      {id:'feed',ic:'🍚',t:'Cho ăn',p:[
        'Bấm Cho ăn để đổ đầy mọi bát đang sẵn sàng trong phòng. Mỗi bé ra ăn một suất rồi cảm ơn bạn 4 xu.',
        'Giá niêm yết là cho 8 suất; bạn chỉ trả cho số suất cần đổ thêm. Bát đổ lại được sau 10 phút.',
        'Mỗi món có tác dụng riêng: hạt khô rẻ và no lâu, cá ngừ tăng xu viễn chinh, ức gà thêm năng lượng... Món khoái khẩu ❤ cho no và vui hơn.',
        'Mỗi bát có số suất giới hạn. Thiếu suất thì có bé phải nhịn: mua thêm bát ở Cửa hàng. Lúc bạn vắng, bé đói tự ra ăn suất còn thừa.']},
      {id:'gacha',ic:'🥚',t:'Gacha và độ hiếm',p:[
        'Một lượt tốn 100 xu hoặc 1 vé; Mở ×10 tốn 1.000 xu hoặc 10 vé.',
        'Tỉ lệ: 1★ Phổ thông 50%, 2★ Không phổ biến 30%, 3★ Hiếm 14%, 4★ Sử thi 5%, 5★ Huyền thoại 1%.',
        'Màu sao: 1 trắng, 2 xanh lục, 3 xanh biển, 4 tím, 5 vàng lấp lánh. Màu lông hiếm, mắt quý hiếm và trang phục hiếm có sao 7 màu.',
        'Bảo hiểm: quá 9 lượt liên tiếp chưa ra 4★ thì lượt thứ 10 chắc chắn từ 4★ trở lên.',
        'Ở 4★ và 5★, khoảng 45% là mèo trang phục (anime, phim, meme). Sao càng nhiều, xu viễn chinh càng cao: 5★ gấp 3,2 lần 1★.']},
      {id:'trait',ic:'✨',t:'Thuộc tính',p:[
        'Mỗi bé có số thuộc tính bằng số sao. Sao càng cao, càng dễ ra thuộc tính tốt.',
        'Nhãn xanh là tốt, hồng là tật xấu, vàng là độc quyền (của mèo trang phục, màu hiếm, trang phục hiếm hay mèo khởi đầu).',
        'Chạm vào nhãn để đọc tác dụng. Khi bé viễn chinh về, popup ghi rõ thuộc tính nào vừa cộng hay trừ xu.']},
      {id:'detail',ic:'🐱',t:'Màn thông tin mèo',p:[
        'Chạm vào thẻ mèo để mở: ảnh, sao, bậc hiếm; Hồ sơ (giống, màu lông, tuổi, nơi ở, khoái khẩu); Chỉ số; Thuộc tính.',
        'Ở cuối có Đổi tên, Chuyển phòng và Phóng sinh.']},
      {id:'trip',ic:'🎒',t:'Viễn chinh',p:[
        'Chọn một ô trống, chọn điểm đến rồi chạm vào bé để lên đường. Bé cần no trên 20 và đủ năng lượng.',
        'Điểm đến: Quanh xóm, Công viên (cấp 1), Chợ cá (cấp 2), Bờ hồ (cấp 3), Bến cảng (cấp 5). Chuyến dài tiện hơn, chuyến ngắn nhiều xu mỗi phút hơn.',
        'Thẻ đông người, gần nước, thiên nhiên và giờ ban đêm (19h–5h) làm thuộc tính của bé cộng hoặc trừ xu.',
        'Hết giờ bấm Nhận quà: xu, kinh nghiệm, món đồ ngậm về, đôi khi có vé. Ô viễn chinh mở thêm ở cấp 3, 5, 7, 9.']},
      {id:'level',ic:'⭐',t:'Cấp và mở khóa',p:[
        'Viễn chinh, cho ăn, vuốt ve, gacha và mua sắm đều cho kinh nghiệm. Cấp cao nhất là 18.',
        'Lên cấp mở thêm ô viễn chinh, điểm đến, phòng, món ăn và nội thất. Cửa hàng luôn ghi cấp kế tiếp sẽ mở gì.']},
      {id:'quest',ic:'📜',t:'Nhiệm vụ và khách lạ',p:[
        'Bấm 📜 Nhiệm vụ trên thanh trên cùng. Mỗi giờ có 2 nhiệm vụ nhanh, mỗi ngày có 3 nhiệm vụ lớn; xong cả ba nhiệm vụ trong ngày được thêm xu và 2 vé.',
        'Nhiệm vụ xong thì bấm Nhận. Quên nhận cũng không sao: hết giờ hay sang ngày, thưởng được cộng tự động.',
        'Ở tab Phòng, thỉnh thoảng có khách lạ chạy qua: chuột nhắt, bướm, cuộn len vàng, hiếm khi có bướm vàng. Chạm vào để bắt, được xu; cuộn len vàng và bướm vàng còn có vé.']},
      {id:'ach',ic:'🏆',t:'Thành tựu',p:[
        'Có 105 thành tựu, chia bốn mức: Dễ, Vừa, Khó, Rất khó. Mỗi thành tựu đạt được thưởng ngay 30 xu, không cần bấm nhận.',
        'Xem ở tab Sưu tập, mục 🏆 Thành tựu: mỗi dòng ghi việc cần làm, mức khó và thanh tiến độ.',
        'Thành tựu tính theo số lần viễn chinh, cho ăn, vuốt ve, quay gacha, bắt khách lạ, làm nhiệm vụ, và theo những gì bạn đang có: cấp, số mèo, giống đã gặp, phòng, nội thất, xu.']},
      {id:'shop',ic:'🛋',t:'Cửa hàng và nội thất',p:[
        'Có 17 phòng; phòng sau đắt hơn nhưng chứa nhiều mèo hơn và có hiệu ứng riêng như hồi năng lượng, thêm vui, thêm xu.',
        'Nội thất chia nhiều mục. Mỗi loại đồ chỉ tính hiệu ứng một lần; độ vui từ nội thất trong một phòng tối đa +35. Xu và tốc độ tính cho cả nhà.',
        'Đồ mua được đặt thẳng vào phòng đang xem.']},
      {id:'edit',ic:'✏',t:'Sắp xếp đồ',p:[
        'Ở tab Phòng, bấm ✏ Sắp xếp đồ. Kéo đồ để di chuyển, đồ bám theo lưới.',
        'Chạm một món để xoay, cất kho hoặc xóa (hoàn 25% giá). Đồ trong Kho đặt lại được vào phòng bất kỳ.',
        'Mèo có tật cào có thể làm rách sofa; sửa tốn 30% giá. Trụ cào cùng phòng giảm khả năng bị cào.']},
      {id:'cats',ic:'🐈',t:'Quản lý mèo và phóng sinh',p:[
        'Tab Quản lý mèo: lọc theo phòng, sắp xếp, đổi phòng bằng ô chọn hoặc kéo thả thẻ vào ô phòng.',
        'Hết chỗ thì bé mới vào Phòng chờ (không giới hạn nhưng bị trừ 10 vui).',
        'Phóng sinh: nhận xu theo sao (1★ 20 xu tới 5★ 1.000 xu và 1 vé). Bé 4★–5★ được hỏi lại lần hai. Luôn giữ lại ít nhất một bé.']},
      {id:'album',ic:'📖',t:'Sưu tập',p:[
        'Ghi lại mọi giống và mèo trang phục bạn từng gặp, chia nhóm Giống thật, Anime, Phim, Meme & Đặc biệt, Màu hiếm.',
        'Chạm vào một giống đã gặp để xem các màu lông. Bé 5★ có nút xem lại intro.']},
      {id:'five',ic:'👑',t:'Mèo 5★ và trang phục hiếm',p:[
        'Mỗi bé 5★ có intro riêng khi mở hộp, hành động riêng trong phòng và trạng thái đặc biệt kéo dài 60 giây.',
        'Mọi 5★ có ít nhất một trang phục hiếm (khoảng 10%): đẹp hơn, có luồng khí, sao 7 màu và thuộc tính riêng.',
        'Màu lông hiếm (9 màu, 4% mỗi lượt) chỉ rơi vào giống thật, luôn là 4★.']},
      {id:'settings',ic:'⚙',t:'Cài đặt',p:[
        'Giao diện Trầm dịu hoặc Tối; cỡ hạt cườm Tự động hoặc Hạt to, rõ; độ tối nền phòng.',
        'Công cụ thử nghiệm: tua nhanh 10 phút và chơi lại từ đầu (xóa toàn bộ dữ liệu).']},
      {id:'net',ic:'👥',t:'Chơi qua máy chủ chung',net:1,p:[
        'Khi game chạy qua máy chủ chung, lần đầu vào bạn đặt một cái tên để quản trị viên nhận ra.',
        'Bản lưu tự sao lên máy chủ 30 giây một lần. Quà và thông báo của quản trị viên hiện ngay khi đồng bộ.']}
    ]
  }
};
