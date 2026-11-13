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
    // {food}: món đã mở khóa hợp nhất với bé khởi đầu; {fav}: món khoái khẩu của bé. foodLock dùng khi món khoái khẩu còn khóa (Mèo trắng)
    food:['Món có ❤ kèm mặt {cat} là món bé khoái nhất. Tớ chọn sẵn {food} rồi, bấm Đổ nhé!'],
    foodLock:['Món {cat} khoái nhất là {fav}, lên cấp nữa mới mở. Giờ đổ {food} cho bé đã nhé!'],
    fed:[
      'Bé tự đi tới bát. Ăn hết một suất thì bát mới vơi, rồi bé cảm ơn bạn 4 xu.',
      'Đổ thêm lúc nào cũng được. Bé đói dưới 20 thì không đi viễn chinh được đâu.'
    ],
    water:['Ăn xong thì phải uống. Bấm 💧 Cho uống nào!'],
    wpour:['Tớ để sẵn Nước lọc trong kho rồi. Bấm Đổ để rót vào bát nước.'],
    wfull:['Bát nước đang đầy nên chưa cần rót. Khi bát vơi, bạn mở bảng này rồi bấm Đổ, nước lấy từ kho trước.'],
    wdone:['Khát là bé tự ra bát uống. Hết nước trong kho thì mua thêm ngay trong bảng Cho uống.'],
    compat:[
      'Bí kíp của tớ đây: dấu trên mặt mèo cho biết bé hợp tới đâu với một căn phòng, một món ăn hay một loại nước.',
      'Bạn sẽ gặp các dấu này dưới mỗi phòng, trong bảng Cho ăn và ở màn thông tin của bé. Rê chuột hoặc nhấn giữ để xem lý do.'
    ],
    ticket:['Giờ tới phần vui nhất: hộp quà mèo! Tớ tặng bạn 1 vé 🎟 để mở thử.'],
    gtab:['Bấm vào tab Gacha nào.'],
    stars:[
      'Số sao là độ hiếm, mỗi bậc một màu. Sao càng nhiều, bé càng kiếm được nhiều xu.',
      'Bé màu lông hiếm, mắt quý hiếm hay trang phục hiếm thì sao lấp lánh đủ 7 màu!',
      'Có bảo hiểm: quá 9 lượt chưa ra 4★ thì lượt thứ 10 chắc chắn từ 4★ trở lên; quá 39 lượt chưa ra 5★ thì lượt thứ 40 chắc chắn 5★.'
    ],
    pull:['Bấm Dùng vé để mở hộp. Lần đầu tớ ém sẵn rồi: chắc chắn ra một bé 4★ Sử thi!'],
    reveal:['Xem ai tới này! Muốn thì đặt tên, rồi bấm Đón về nhà.'],
    dhead:['Đây là màn thông tin của {new}. Viền và hàng sao cho biết bé hiếm cỡ nào.'],
    dprof:['Hồ sơ ghi giống, màu lông, tuổi và món khoái khẩu. Cho ăn đúng món khoái khẩu, bé no hơn và vui hơn.'],
    dtrait:[
      'Thuộc tính là tài lẻ của bé, số thuộc tính bằng số sao. Xanh là tốt, hồng là tật xấu, vàng là độc quyền.',
      'Chạm vào một thuộc tính để đọc nó làm được gì.'
    ],
    dlike:['Khung Hợp với bé gom sẵn phòng, món ăn và nước uống tốt nhất cho {new}. Bấm vào một ô là tới ngay chỗ đó.'],
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
    mtab:['Còn một chỗ hay nữa. Bấm tab Mèo nào!'],
    arrange:[
      'Đây là nơi quản lý cả đàn: lọc theo phòng, đổi phòng, tìm bé hợp một căn phòng hay một món ăn.',
      'Nhà đông lên thì bấm ✨ Xếp gợi ý. Tớ tính giúp bé nào nên ở phòng nào, bạn xem trước rồi mới quyết.'
    ],
    more:['Còn nhiều thứ hay sẽ mở dần theo cấp. Tới lúc đó tớ lại chỉ cho, bạn chưa cần nhớ đâu!'],
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
    // khối "Hợp với bé" trên thẻ mèo khởi đầu: đọc từ module tương thích (CP.spInfo), chữ ở đây
    fitL:'Hợp với bé',
    roomL:'Phòng',
    foodL:'Đồ ăn',
    drinkL:'Nước uống',
    anyRoom:'Ở đâu cũng vui',
    anyDrink:'Loại nào cũng uống',
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
    pity:'Chắc chắn 4★ trở lên sau 10 lượt',
    pity5:'chắc chắn 5★ sau 40 lượt'
  },

  /* ---------- quà và kết thúc ---------- */
  gift:{
    title:'🎁 Quà tân thủ',
    btn:'Nhận quà',
    got:'Đã nhận quà tân thủ',
    ticketToast:'Xoài tặng 1 vé gacha'
  },
  /* ---------- thẻ chú giải dấu tương thích (bước compat) ---------- */
  compat:{
    title:'Dấu tương thích',
    rows:{'2':'Bé thích hẳn: món khoái khẩu, phòng có thứ bé mê.','1':'Có lợi nhẹ, ví dụ món giúp bé đang mệt.','0':'Không có dấu: ở đâu, ăn gì cũng được.','-1':'Bé kém vui hoặc chịu thiệt, nên đổi.'},
    foot:'Icon mờ là bé bạn chưa có, bóng đen là bé chưa từng gặp.'
  },
  /* ---------- thẻ "còn gì phía trước" (bước more); phần mở theo cấp đọc từ FEATS ---------- */
  more:{
    title:'Còn gì phía trước',
    nowL:'Có ngay sau hướng dẫn',
    now:['📜 Nhiệm vụ trong giờ, nhiệm vụ hôm nay và khách lạ ghé phòng','📅 Điểm danh 7 ngày · 🏆 Thành tựu · 💭 Ước muốn của mèo'],
    lvL:'Cấp {v}'
  },
  nextTitle:'Việc nên làm tiếp',
  nextList:[
    '🎒 Khi bé viễn chinh về, vào tab Viễn chinh bấm Nhận quà.',
    '🍚 Cứ 10 phút cho cả phòng ăn một lần, và vuốt ve từng bé.',
    '❤ Để ý dấu ❤ trên mặt mèo: đó là phòng và món ăn hợp nhất với từng bé.',
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
    room2:['Giờ bạn có nhiều phòng. Bấm ◀ ▶ hoặc tên phòng để chuyển qua lại.','Mỗi phòng có hiệu ứng riêng, chuyển mèo ở tab Mèo.'],
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
        'Chạm một lần vào mèo để vuốt ve: mỗi bé 10 phút một lần cho số xu bằng số sao, thêm 3 độ vui. Chạm hai lần liền để quan sát (camera theo dõi bé), chạm chỗ trống để thôi quan sát.',
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
        'Thức ăn mua vào kho trước, rồi mới đổ vào bát. Bấm Cho ăn và chọn món: game gợi ý số suất vừa đủ cho các bé đang cần ăn. Muốn số khác thì bấm ✎ Tùy chỉnh số lượng.',
        'Giá niêm yết là cho 8 suất; mua bao nhiêu suất trả bấy nhiêu. Lúc đổ, game lấy trong kho trước, thiếu thì mua thêm đúng số còn thiếu. Muốn mua để dành thì bấm Chỉ mua vào kho. Suất chưa đổ nằm lại trong kho, lần sau dùng tiếp.',
        'Phòng có nhiều bát thì chọn cách chia: Chia đều (bát nào cũng có), Ưu tiên bát 1 (đổ đầy bát đầu rồi mới tới bát sau) hoặc Tự chọn (tự đặt số suất cho từng bát). Chạm vào một bát trong phòng để đổ riêng cho bát đó.',
        'Đổ xong, các bé tự đi tới bát. Bé ăn hết một suất thì bát mới vơi đi, rồi bé cảm ơn bạn 4 xu. Mỗi bát cho 2 bé ăn cùng lúc, bé tới sau đứng chờ.',
        'Đổ thêm lúc nào cũng được. Vừa đổ thì bé nào cũng ra ăn, nhưng mỗi bé 10 phút chỉ ăn một lần; ngoài lúc đó chỉ bé đói dưới 50 mới tự ra ăn. Bé đang ăn mà bị gọi đi thì phần còn lại vẫn nằm trong bát.',
        'Bát ăn và bát nước là hai thứ riêng, kho cũng riêng: thức ăn chỉ đổ vào bát ăn, nước chỉ rót vào bát nước.',
        'Mỗi món có tác dụng riêng: hạt khô rẻ và no lâu, cá ngừ tăng xu viễn chinh, ức gà thêm năng lượng... Món khoái khẩu ❤ cho no và vui hơn.',
        'Mỗi bát có số suất giới hạn. Thiếu suất thì có bé phải nhịn: mua thêm bát ở Cửa hàng. Lúc bạn vắng, bé đói tự ra ăn suất còn thừa, Máy cho ăn tự động còn tự đổ hạt khô.']},
      {id:'gacha',ic:'🥚',t:'Gacha và độ hiếm',p:[
        'Một lượt tốn 100 xu hoặc 1 vé; Mở ×10 tốn 1.000 xu hoặc 10 vé.',
        'Tỉ lệ: 1★ Phổ thông 50%, 2★ Không phổ biến 30%, 3★ Hiếm 14%, 4★ Sử thi 5%, 5★ Huyền thoại 1%.',
        'Màu sao: 1 trắng, 2 xanh lục, 3 xanh biển, 4 tím, 5 vàng lấp lánh. Màu lông hiếm, mắt quý hiếm và trang phục hiếm có sao 7 màu.',
        'Bảo hiểm: quá 9 lượt liên tiếp chưa ra 4★ thì lượt thứ 10 chắc chắn từ 4★ trở lên (vẫn có thể là 5★, khoảng 1 trên 6).',
        'Bảo hiểm 5★: tối đa 40 lượt liền nhau chưa ra 5★ thì lượt thứ 40 chắc chắn 5★. Ra 5★ thì đếm lại từ 0. Tab Gacha luôn ghi còn bao nhiêu lượt; bộ đếm được lưu.',
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
        'Lên cấp mở thêm ô viễn chinh, điểm đến, phòng, món ăn và nội thất. Cửa hàng luôn ghi cấp kế tiếp sẽ mở gì.',
        'Bấm vào ô Cấp trên cùng để xem lộ trình: mỗi cấp mở những gì. Cấp 2 mở thời tiết, khí hậu phòng và thiết bị sưởi, làm mát. Thứ đã mở thì không khóa lại.']},
      {id:'quest',ic:'📜',t:'Nhiệm vụ và khách lạ',p:[
        'Bấm 📜 Nhiệm vụ trên thanh trên cùng. Mỗi giờ có 2 nhiệm vụ nhanh, mỗi ngày có 3 nhiệm vụ lớn; xong cả ba nhiệm vụ trong ngày được thêm xu và 2 vé.',
        'Nhiệm vụ xong thì bấm Nhận. Quên nhận cũng không sao: hết giờ hay sang ngày, thưởng được cộng tự động.',
        'Ở tab Phòng, thỉnh thoảng có khách lạ chạy qua: chuột nhắt, bướm, cuộn len vàng, hiếm khi có bướm vàng. Chạm vào để bắt, được xu; cuộn len vàng và bướm vàng còn có vé.']},
      {id:'wish',ic:'💭',t:'Ước muốn của mèo',p:[
        'Khi bạn đang xem tab Phòng, thỉnh thoảng một bé hiện bong bóng 💭 trên đầu: muốn được vuốt ve, thèm một món ăn, hoặc muốn xem bạn bắt khách lạ.',
        'Dòng 💭 ngay dưới nút Cho ăn ghi bé muốn gì và còn bao lâu. Làm đúng trước khi hết giờ được xu và +8 độ vui cho bé. Hết giờ thì thôi, không bị phạt.']},
      {id:'checkin',ic:'📅',t:'Điểm danh 7 ngày',p:[
        'Mỗi ngày mở bảng 📜 Nhiệm vụ và bấm Điểm danh. Ngày đầu tiên vào game trong ngày, bảng tự mở để nhắc.',
        'Thưởng tăng dần qua 7 ngày, ngày 3 và 5 có vé, ngày 7 có 3 vé. Bỏ lỡ một ngày thì quay về Ngày 1.']},
      {id:'ach',ic:'🏆',t:'Thành tựu',p:[
        'Có 111 thành tựu, chia bốn mức: Dễ, Vừa, Khó, Rất khó. Mỗi thành tựu đạt được thưởng ngay 30 xu, không cần bấm nhận.',
        'Xem ở tab 🏆 Thành tựu trên thanh điều hướng: mỗi dòng ghi việc cần làm, mức khó và thanh tiến độ.',
        'Thành tựu tính theo số lần viễn chinh, cho ăn, vuốt ve, quay gacha, bắt khách lạ, làm nhiệm vụ, và theo những gì bạn đang có: cấp, số mèo, giống đã gặp, phòng, nội thất, xu.']},
      {id:'weather',ic:'🌦',t:'Thời tiết và mùa',p:[
        'Chip thời tiết trên cùng cho biết trời, nhiệt độ và mùa; bấm vào để xem dự báo các đợt tới. Thời tiết đổi mỗi 5 giờ (đợt cuối ngày 4 giờ), mỗi mùa kéo dài một ngày (xuân, hạ, thu, đông), và giống nhau với mọi người chơi cùng máy chủ.',
        'Nắng đẹp, lý tưởng thì mèo vui; nắng nóng làm mèo mệt và khát; mưa, tuyết làm ướt và lạnh mèo ở phòng ngoài trời; mưa giông ồn ào; gió mạnh khó chịu; sương mù làm viễn chinh dễ lạc. Sau một đợt xấu thì trời thường đẹp trở lại, hiếm khi xấu liên tục. Thỉnh thoảng có thời tiết cực đoan.',
        'Trời sắp xấu thì game báo trước (chip có dấu ⚠). Lắp Trạm dự báo thời tiết để xem 6 đợt tới và được báo sớm hơn. Phần lớn các phòng có cửa sổ nhìn ra ngoài (trừ tầng hầm và các phòng vốn ở ngoài trời): trời sáng tối theo giờ, mây, mưa, tuyết, sấm, cây đổi màu theo mùa.']},
      {id:'climate',ic:'🌡',t:'Khí hậu phòng và thiết bị',p:[
        'Mỗi phòng có nhiệt độ, độ ẩm và độ thoải mái riêng (dòng 🌡 dưới nút Cho ăn, bấm vào để xem chi tiết). Ban công, sân vườn, sân thượng, hồ bơi chịu thời tiết mạnh nhất; phòng ngủ, thư viện, phòng hoàng gia kín đáo nhất.',
        'Cửa hàng có thêm các mục Giữ ấm, Làm mát, Chống thời tiết và Tiện nghi: máy sưởi, quạt, điều hòa, rèm, mái che, lều trú mưa, máy sấy lông, máy tạo tiếng ồn trắng… Mỗi món ghi rõ độ hiếm, phòng dùng được và số món cùng loại tối đa có tác dụng.',
        'Mùa đông phòng trong nhà vẫn lạnh (khoảng 11–15°C, ấm hơn ngoài trời nhiều) nên cần sưởi. Máy sưởi, quạt thường chạy liên tục khi bật (chạm vào món trong phòng hoặc bấm dòng 🌡 để bật tắt). Mọi thiết bị dùng điện đều chạy pin và phải sạc tay ở ổ điện (xem chương Điện năng); loại giá rẻ (máy sưởi, đèn sưởi, quạt tích điện) yếu hơn nhiều; loại cao cấp và Bộ điều chỉnh nhiệt độ thì tự bật khi cần. Chăn, thảm, giường sưởi hoặc làm mát là ổ ngủ chỉnh nhiệt riêng cho bé nằm trên.']},
      {id:'climstat',ic:'📊',t:'Đọc bảng khí hậu và độ thoải mái',p:[
        'Mở bảng: bấm dòng 🌡 dưới nút Cho ăn (hoặc nút 📖 trong bảng đó để quay lại trang này).',
        'Ngoài trời: thời tiết chung của mọi người chơi. Mọi chỉ số trong phòng đều tính từ đây.',
        'Thông với ngoài (hở %): nhiệt độ phòng khi chưa có thiết bị nằm giữa nhiệt độ nền của nhà (22°C) và nhiệt độ ngoài trời, lệch về phía ngoài trời đúng bằng mức hở. Ví dụ hở 50%, ngoài trời 15°C: phòng khoảng 18,5°C. Cách nhiệt (rèm giữ nhiệt, cửa kính, cửa chống gió) làm giảm mức hở. Phòng trong nhà hở khoảng 40–50%, gác mái 70%, phòng hoàng gia 30%, tầng hầm 15%; ban công, sân vườn, sân thượng, hồ bơi là ngoài trời.',
        'Sưởi / làm mát: tổng số độ các thiết bị đang chạy cộng vào hoặc trừ đi. Máy tự động (điều hòa, máy sưởi cao cấp, hoặc có Bộ điều chỉnh nhiệt độ) chỉ chạy khi phòng dưới 21°C hoặc trên 25°C. Máy bật tay chạy liên tục: trời lạnh mà để quạt bật thì phòng lạnh thêm.',
        'Trong phòng: nhiệt độ dễ chịu là 20–26°C, độ ẩm dễ chịu là 35–65%. Độ ẩm chỉ làm giảm độ thoải mái, không gây hại gì khác.',
        'Mưa tạt ☔: phần mưa lọt vào phòng, làm mèo ướt dần (lông khô 2 điểm mỗi phút, ấm trên 24°C thì khô nhanh hơn; mưa tạt dưới khoảng 25% thì khô nhanh hơn ướt). Gió lùa 🌬: mèo thấy lạnh hơn 4°C nhân với mức gió. Sấm ⚡: mỗi bé mất khoảng 0,2–0,3 độ vui mỗi phút; Máy tạo tiếng ồn trắng át được.',
        'Cảm thấy (ở từng bé): nhiệt độ phòng, trừ gió lùa, trừ thêm 4°C nếu bé bị ướt; bé nằm trên chăn điện, giường sưởi, thảm mát, giường thông minh thì cộng hoặc trừ theo món đó. Đây mới là con số quyết định bé có bị lạnh hay nóng.',
        'Dưới 16°C cảm thấy: mỗi độ thiếu làm bé mất 0,25 vui và 0,19 năng lượng mỗi phút, đói nhanh hơn 3,5%. Lạnh lâu thì bị Lạnh 🥶, lạnh rất lâu hoặc vừa ướt vừa lạnh có thể bị Ốm 🤒. Dưới 5°C còn mất sức khỏe.',
        'Trên 28°C cảm thấy: mỗi độ thừa làm bé mất 0,15 vui và 0,2 năng lượng mỗi phút, khát nhanh hơn 10%. Nóng lâu thì bị Nóng quá 🥵. Trên 36°C còn mất sức khỏe.',
        'Độ thoải mái của phòng: bắt đầu từ 100 rồi trừ 6 điểm cho mỗi độ ngoài khoảng 20–26°C, 0,5 điểm cho mỗi % độ ẩm ngoài khoảng 35–65%, tới 20 điểm khi gió lùa mạnh, tới 20 điểm khi mưa tạt mạnh, tới 10 điểm khi có sấm. Lò sưởi, quạt trần, máy lọc không khí, chăn, đệm… cộng lại, tối đa +15. Phòng thoải mái từ 40 thì các bé tự hồi sức khỏe; từ 60 thì bé ốm mới khỏi dần.',
        'Độ thoải mái của từng bé: mỗi phút nhích tối đa 3 điểm về phía mức của phòng, nhưng bị trừ khi bé ướt (−25), lạnh (−15), nóng (−15), ốm (−20), khát (−10); nằm trên ổ thì +5. Nên hai bé cùng phòng có thể khác nhau.',
        'Ảnh hưởng của độ thoải mái của bé: độ vui bé hướng tới cộng thêm (thoải mái − 50) × 0,25, tức 66 được +4, 30 bị −5; hồi năng lượng nhân từ ×0,75 (thoải mái 0) tới ×1,25 (thoải mái 100); từ 75 trở lên có trạng thái Thoải mái 😌 (+5 vui, hồi năng lượng nhanh hơn 10%); ngủ dậy với thoải mái từ 60 trở lên được Ngủ ngon 🌙 (viễn chinh +5% xu, tốn ít năng lượng hơn 10%).']},
      {id:'climfix',ic:'🛠',t:'Hướng dẫn xử lý khi phòng khó chịu',p:[
        'Phòng lạnh (dưới 20°C): tắt quạt nếu đang bật; đặt máy sưởi (rẻ nhất là Máy sưởi tích điện +2°C, Máy sưởi mini +4°C, Lò sưởi +10°C); lắp rèm giữ nhiệt hoặc cửa kính cách nhiệt để phòng ít bị kéo theo ngoài trời; cho bé nằm chăn lông, chăn điện, giường sưởi; hoặc chuyển bé sang phòng kín hơn (phòng ngủ, thư viện, phòng hoàng gia). Bé đang Lạnh: Súp nóng chữa ngay.',
        'Phòng nóng (trên 26°C): tắt máy sưởi; đặt quạt (Quạt tích điện −2°C, Quạt đứng −5°C, Điều hòa tới −10°C); rèm chống nắng; thảm hoặc giường làm mát; nhớ rót nước vào bát nước vì bé khát nhanh. Bé đang Nóng quá: Gel làm mát hoặc Bình nước điện giải.',
        'Mưa tạt, bé bị ướt: ở phòng ngoài trời lắp mái che ban công, rèm chắn mưa, lều trú mưa; trong nhà mưa tạt thường không đủ làm ướt. Máy sấy lông làm khô ngay, máy hút ẩm và máy nước nóng (phòng tắm) làm khô nhanh hơn.',
        'Gió lùa: cửa chống gió, cửa kính cách nhiệt, rèm chắn mưa. Sấm: Máy tạo tiếng ồn trắng. Phòng ẩm quá: máy hút ẩm; khô quá: máy tạo độ ẩm.',
        'Bé ốm: chữa ở Nhà thuốc & Bệnh viện thú y, hoặc để bé ở phòng ấm (19–28°C cảm thấy), khô, thoải mái từ 60; nằm ổ thì khỏi nhanh gấp đôi. Bé khát: bấm Cho uống cạnh nút Cho ăn, hoặc đặt Máy lọc nước tự rót nước trong kho.',
        'Mẹo: Bộ cảm biến nhiệt độ báo cho bạn khi phòng khó chịu; Bộ điều chỉnh nhiệt độ biến máy sưởi, quạt trong phòng thành tự động; Trạm dự báo cho xem trước 6 đợt thời tiết để chuẩn bị. Lúc bạn vắng, thời tiết không làm mèo tụt quá sâu và không làm mèo bị ốm mới.']},
      {id:'power',ic:'🔌',t:'Điện năng: pin và sạc tay',p:[
        'Mọi thiết bị điện (quạt, máy sưởi, đèn sưởi, điều hòa, máy lọc không khí, máy hút ẩm, máy tạo độ ẩm, máy nước nóng, máy sấy lông, máy cho ăn tự động, máy lọc nước, cảm biến, trạm dự báo…) đều có pin tích hợp. Pin tụt khi máy chạy; máy tự động (điều hòa, máy sưởi cao cấp) chỉ tốn pin lúc đang thật sự sưởi hoặc làm mát; chăn điện, giường sưởi chỉ tốn pin khi có bé nằm. Hết pin thì máy ngừng chạy và mất tác dụng. Chăn, rèm, giường gỗ, mái che không dùng điện.',
        'Pin KHÔNG BAO GIỜ tự sạc: không tự sạc khi pin yếu, khi đăng nhập hay lúc bạn vắng. Dưới 20% game báo, ô ⚡ trên cùng hiện số 🪫, và trên đầu máy hiện vạch pin đỏ.',
        'Cách sạc: chạm vào thiết bị trong phòng (hoặc chọn nó trong ✏ Sắp xếp đồ, hoặc trong Sách điện) → 🔌 Sạc thiết bị → chọn một ổ còn cổng trống trong cùng phòng → xem phí → Xác nhận. Xu bị trừ một lần lúc xác nhận. Dây cắm nối ổ với máy; đầy thì tự rút. Rút sạc giữa chừng được hoàn phần xu của lượng pin chưa nạp.',
        'Phí tính theo lượng pin nạp (làm tròn lên): pin còn một nửa thì trả khoảng nửa phí sạc đầy. Phí sạc đầy: quạt mini 10 xu, quạt đứng 20, đèn sưởi 25, máy lọc không khí 30, máy hút ẩm 35, máy sưởi 45, máy nước nóng 50, điều hòa 70, điều hòa hai chiều 90, thiết bị cao cấp 120. Đang cắm sạc và có điện thì máy chạy bằng điện của ổ, không tốn pin.',
        'Ổ điện gắn tường (mục ⚡ Điện năng trong Cửa hàng): đơn 1 cổng, đôi 2 cổng, 4 cổng, thông minh (hiện % và thời gian sạc ngay trên tường, báo khi xong), chống nước (bắt buộc ở phòng tắm và phòng ngoài trời), cao cấp (sạc nhanh gấp 2). Ổ tự bám sát chân tường, không lơ lửng, không chồng lên đồ khác. Đèn cây, đèn ngủ, dây đèn… nối điện lưới của nhà nên không cần sạc.']},
      {id:'solar',ic:'☀️',t:'Điện mặt trời',p:[
        'Mở ở cấp '+SOLAR_LV+'. Tấm pin chỉ lắp ở Ban công (tối đa 2 tấm có tác dụng) hoặc Sân thượng (tối đa 4 tấm), không lắp trong nhà hay tầng hầm, và không chồng lên đồ khác.',
        'Tấm pin tạo điện vào bộ lưu trữ tích hợp (80 đơn vị khi có ít nhất một tấm; Bộ lưu trữ nâng cấp +150 mỗi bộ, tối đa 2 bộ; Hệ mặt trời thông minh +200). Nắng đẹp giữa trưa: tấm cơ bản 20, cao cấp 45, hệ thông minh 60 đơn vị mỗi giờ. Nhiều mây (gió, sương) giảm, mưa giảm mạnh, ban đêm không tạo điện.',
        'Khi sạc, nếu bộ lưu trữ còn đủ điện thì phí giảm 50%, làm tròn lên (45 xu còn 23 xu) và bộ lưu trữ trừ đúng phần được giảm. Không đủ thì trả giá thường. Nhiều tấm pin không giảm quá 50%, chỉ làm đầy bộ lưu trữ nhanh hơn. Sách điện ghi tổng số xu đã tiết kiệm.']},
      {id:'outage',ic:'⛈',t:'Sét đánh, mất điện và mèo hoảng sợ',p:[
        'Khi mưa giông, mỗi đợt có khoảng 5% bị sét đánh (mỗi đợt chỉ xét một lần, không xảy ra khi đang mất điện). Trời tối lại, chớp sáng, sấm nổ và cả nhà mất điện 15 phút thật; thời gian vẫn trôi khi bạn thoát game, tải lại trang không làm sét đánh lại.',
        'Lúc mất điện: đèn điện lưới tắt, phòng tối; không sạc được bằng điện lưới (thiết bị đang cắm thì tạm dừng, có điện chạy tiếp); đồ chạy pin vẫn chạy tới khi hết pin; đồ không dùng điện vẫn bình thường. Ô ⚡ đếm ngược tới lúc có điện.',
        'Mèo ở nhà bị Hoảng sợ 😱: mất 5 vui lúc sét đánh, rồi khoảng 1 vui mỗi phút, tốn năng lượng hơn; bé đang ngủ bị đánh thức, giật mình, run, cúi rạp và trốn vào ổ, nhà mèo hoặc góc phòng. Phòng tối thì sợ lâu và mất vui nhanh hơn. Có điện lại thì nỗi sợ giảm dần. Mèo không bao giờ bị mất hay chết vì chuyện này.',
        'Làm dịu: vuốt ve từng bé (vỗ về), Đèn khẩn cấp dùng pin (tự sáng khi mất điện), soi Đèn pin (vật phẩm Sinh tồn, sáng một phòng 15 phút), cho bé nằm ổ hoặc nhà mèo, và máy phát dự phòng.']},
      {id:'generator',ic:'🔋',t:'Máy phát dự phòng',p:[
        'Mở ở cấp '+GEN_LV+' và chỉ dùng được khi đặt trong Tầng hầm (phải mở Tầng hầm trước). Đây là bộ lưu điện an toàn, không có khí thải. Mini chạy 5 phút (sạc 80 xu), tiêu chuẩn 15 phút (150 xu), cao cấp 30 phút (250 xu); máy mini không đủ cho cả một lần mất điện 15 phút.',
        'Máy có thanh năng lượng riêng; bạn tự sạc bằng xu khi đang có điện (bấm vào máy hoặc trong Sách điện). Máy không bao giờ tự sạc, kể cả lúc bạn vắng.',
        'Khi mất điện, máy đã sạc tự chuyển sang nguồn dự phòng: đèn sáng lại, ổ điện sạc tiếp được, các bé hết sợ nhanh hơn. Có điện lại thì máy đã chạy về 0% và chuyển sang trạng thái cần sạc; game không tự trừ xu.']},
      {id:'health',ic:'❤️',t:'Sức khỏe, nước uống và trạng thái',p:[
        'Mèo có thêm Sức khỏe ❤️, Nước uống 💧 và Độ thoải mái. Mỗi phòng được tặng một bát nước, riêng với bát ăn. Nước mua vào kho rồi mới rót vào bát: bấm 💧 Cho uống cạnh nút Cho ăn, chọn loại nước (mỗi chai một lượt uống). Bé khát tự đi tới bát, uống hết một lượt thì bát mới vơi. Máy lọc nước tự rót nước đang có trong kho.',
        'Trạng thái tạm thời: Lạnh 🥶, Nóng quá 🥵, Ướt 💦, Kiệt sức 😵, Ốm 🤒, Khát 💧, Thoải mái 😌, Ngủ ngon 🌙. Màn chi tiết của bé ghi rõ lý do, cách chữa và thời gian còn lại; vật phẩm như thuốc chống cảm, súp nóng dùng được ngay ở đó.',
        'Lúc bạn vắng, thời tiết không làm mèo tụt quá sâu và không làm mèo bị ốm mới.']},
      {id:'supply',ic:'🎒',t:'Viễn chinh và vật phẩm sinh tồn',p:[
        'Trước khi đi, màn chọn mèo cho biết thời tiết ở điểm đến, nhiệt độ, mức nguy hiểm, thời tiết từng chặng và tỉ lệ thành công của từng bé. Rừng núi lạnh hơn, đồi cát nóng hơn thành phố.',
        'Thời tiết xấu có thể gây sự cố nhỏ (lạnh, nóng, ướt, lạc đường) hoặc buộc rút lui sớm: bé vẫn về nhà an toàn và vẫn có một phần phần thưởng. Thời tiết lý tưởng được thưởng thêm. Xem lại ở Nhật ký viễn chinh cuối tab Viễn chinh.',
        'Mua vật phẩm sinh tồn ở Cửa hàng, mục 🎒 Sinh tồn, rồi chọn mang theo (tối đa 4 loại). Loại dùng khi xuất phát bị trừ lúc đi; loại tự dùng khi cần (thuốc, sơ cứu, cứu hộ, thanh năng lượng) chỉ bị trừ khi thật sự dùng.']},
      {id:'shop',ic:'🛋',t:'Cửa hàng và nội thất',p:[
        'Có 17 phòng; phòng sau đắt hơn nhưng chứa nhiều mèo hơn và có hiệu ứng riêng như hồi năng lượng, thêm vui, thêm xu.',
        'Nội thất chia nhiều mục. Mỗi loại đồ chỉ tính hiệu ứng một lần; độ vui từ nội thất trong một phòng tối đa +35. Xu và tốc độ tính cho cả nhà.',
        'Đồ mua được đặt thẳng vào phòng đang xem.']},
      {id:'edit',ic:'✏',t:'Sắp xếp đồ',p:[
        'Ở tab Phòng, bấm ✏ Sắp xếp đồ. Kéo đồ để di chuyển, đồ bám theo lưới.',
        'Chạm một món để xoay, cất kho hoặc xóa (hoàn 25% giá). Đồ trong Kho đặt lại được vào phòng bất kỳ.',
        'Mèo có tật cào có thể làm rách sofa; sửa tốn 30% giá. Trụ cào cùng phòng giảm khả năng bị cào.']},
      {id:'cats',ic:'🐈',t:'Quản lý mèo và phóng sinh',p:[
        'Tab Mèo: lọc theo phòng, sắp xếp, đổi phòng bằng ô chọn hoặc kéo thả thẻ vào ô phòng.',
        'Hết chỗ thì bé mới vào Phòng chờ (không giới hạn nhưng bị trừ 10 vui).',
        'Phóng sinh: nhận xu theo sao ('+[1,2,3,4,5].map(n=>n+'★ '+STAR[n].sell.toLocaleString('vi-VN')+' xu').join(', ')+'; bé 5★ thêm 1 vé). Bé 4★–5★ được hỏi lại lần hai. Luôn giữ lại ít nhất một bé.']},
      {id:'album',ic:'📖',t:'Sưu tập',p:[
        'Ghi lại mọi giống và mèo trang phục bạn từng gặp, chia nhóm Giống thật, Anime, Phim, Meme & Đặc biệt, Esports, Game, Dễ thương, Màu hiếm.',
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
        'Bản lưu tự sao lên máy chủ 30 giây một lần. Quà và thông báo của quản trị viên hiện ngay khi đồng bộ.']},
      {id:'xfer',ic:'📱',t:'Chơi tiếp trên máy khác',net:1,p:[
        'Đổi từ điện thoại sang máy tính (hay ngược lại): ở máy cũ chọn Cài đặt › Chuyển sang máy khác để lấy mã 8 ký tự. Ở máy mới chọn Nhận tiến độ từ máy khác rồi nhập mã; máy mới tinh thì game tự hỏi ngay lúc mở. Mã dùng một lần, hết hạn sau 10 phút.',
        'Máy mới nhận đúng bản lưu máy chủ đang giữ: đủ mèo, xu, vé, phòng, đồ đạc, bảo hiểm gacha. Mỗi lúc chỉ một máy chơi được: nhận xong thì máy cũ thôi lưu tiến độ, những gì chơi thêm ở máy cũ không được giữ.',
        'Phòng khi mất máy: tạo mã khôi phục 12 ký tự trong Cài đặt và ghi lại. Mã chỉ hiện một lần và dùng được một lần. Không có mã khôi phục thì nhờ quản trị viên tạo mã chuyển máy.',
        'Đừng đưa mã cho người khác: ai có mã là lấy được tiến độ của bạn.']}
    ]
  }
};
