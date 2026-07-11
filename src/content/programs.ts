import type { ConditionId } from './quiz';

export type ProgramId = string;

export interface Program {
  id: ProgramId;
  name: string;
  summary?: string[];
  description: string;
  benenif?: string[];
  isVip?: boolean;
  primaryConditionIds: ConditionId[];
  secondaryConditionIds?: ConditionId[];
  sessions?: number;
  o2skinComboRef?: string;
  referenceLink?: string;
  images?: string[];
}

export const getAllConditionIds = (p: Program): ConditionId[] =>
  [...p.primaryConditionIds, ...(p.secondaryConditionIds ?? [])];

export const programs: Program[] = [
  {
    id: 'peel-acne',
    name: 'Peel da trị mụn',
    summary: [
      "Điều trị mụn trứng cá, mụn ẩn, mụn viêm.",
      "Làm mờ vết thâm và sẹo sau mụn hiệu quả.",
      "Tái tạo lớp da mới, trắng sáng, sạch mụn.",
      "Không gây đau và không cần nghỉ dưỡng."
    ],
    description: 'Peel da trị mụn là phương pháp được nhiều người yêu thích bởi hiệu quả cao và \
    không tốn nhiều thời gian. Một số người vì muốn tiết kiệm chi phí mà tự peel da tại nhà, \
    thực hiện không đúng cách nên dẫn đến tổn thương da như kích ứng, bỏng rát, mụn nặng hơn,… \
    Khi peel trị mụn với bác sĩ da liễu, bạn sẽ được tư vấn cẩn thận và cá nhân hóa liệu trình peel để đảm bảo an toàn và đạt hiệu quả điều trị mụn tối đa.',
    primaryConditionIds: ['mun-trung-ca', 'da-nhon-mun-viem', 'da-mun-tham-seo'],
    secondaryConditionIds: ['lo-chan-long'],
    benenif: [
      'Liệu trình peel phù hợp với tình trạng mụn',
      'Hỗ trợ điều trị mụn và giảm thâm sẹo hiệu quả',
      'Tiết kiệm chi phí điều trị tối đa',
      'Hướng dẫn chăm sóc da sau peel đúng chuẩn'
    ],
    sessions: 4,
    o2skinComboRef: 'Combo 4: Sạch Mụn Và Điều Trị Mụn, Thâm Lấy Nhân Mụn & Peel Da',
    referenceLink: '/programs/peel-da-tri-mun',
    images:['/programs/hinh-gioi-thieu-peel-da-tri-mun-2.jpg', '/programs/hinh-gioi-thieu-peel-da-3.jpg']
  },
  {
    id: 'ipl-oil-control',
    name: 'IPL kiểm soát nhờn & mụn',
    description: 'Bạn đang tìm một phương pháp trị mụn không xâm lấn, an toàn và hiệu quả cao? \
    IPL trị mụn và kiểm soát nhờn chính là giải pháp dành riêng cho bạn. \
    Phương pháp không chỉ phù hợp với những tình trạng mụn mức độ nhẹ đến \
    trung bình mà còn đạt kết quả ấn tượng với trường hợp da mụn nặng và đổ \
    nhờn nhiều.\
    Không chỉ có ưu điểm ít xâm lấn, ít gây tổn thương cho da, trị mụn bằng IPL còn sở hữu rất nhiều công dụng nổi bật với thời gian điều trị ngắn và hồi phục nhanh và không có tác dụng phụ.',
    isVip: false,
    summary: [
      "Hỗ trợ trị mụn mức độ nhẹ đến trung bình.",
      "Điều tiết hoạt động tuyến bã nhờn, thu nhỏ lỗ chân lông.",
      "Cải thiện các dấu hiệu lão hóa sớm như nếp nhăn, sạm da…",
      "Tăng độ đàn hồi tự nhiên, giúp da săn chắc."
    ],
    primaryConditionIds: ['da-nhon-mun-viem', 'da-tham-do'],
    secondaryConditionIds: ['da-nep-nhan', 'tan-nhang'],
    benenif: [
      'Điều trị mụn viêm, mụn ẩn từ nhẹ đến trung bình',
      'Điều trị da dày sừng và da mụn tổn thương do ánh nắng',
      'Điều trị thâm đỏ do mụn, giúp da đều màu hơn',
      'Trẻ hóa da, giúp da mịn màng và căng đầy sức sống',
      'Kiểm soát mụn trứng cá đỏ và ngăn ngừa mụn trứng cá',
      'Điều trị tình trạng da giãn mạch do nhiễm Corticoid'
    ],
    sessions: 6,
    o2skinComboRef: 'o2skin Combo IPL thật (đối chiếu)',
    referenceLink: '/programs/ipl-kiem-soat-nhon-mun',
    images:[
      '/programs/hinh-gioi-thieu-ipl-tri-mun-va-kiem-soat-nhon-3.jpg',
      '/programs/hinh-gioi-thieu-ipl-tri-mun-va-kiem-soat-nhon-2.jpg'
    ]
  },
  {
    id: 'laser-scar-treatment',
    name: 'Trị Sẹo Rỗ Nhẹ – Trung Bình – Nặng Hiệu Quả Cao',
    description: '',
    isVip: false,
    summary:[
      'Lấp đầy sẹo rỗ, hiệu quả với nhiều loại sẹo, kể cả sẹo sâu, sẹo lâu năm.',
      'Se khít lỗ chân lông và cải thiện kết cấu da, trẻ hóa da',
      'Hiệu quả cao, lên đến 90%, giảm thiểu tối đa tình trạng tái phát sẹo.',
      'Áp dụng với mọi loại da, kể cả da nhạy cảm.'
    ],
    benenif:[
      'Bác sĩ da liễu giàu kinh nghiệm trực tiếp thăm khám và điều trị',
      'Thiết bị laser, lăn kim nhập khẩu, riêng biệt cho mỗi khách hàng',
      'Hiệu quả điều trị sẹo rỗ tối đa khi kết hợp Serum chính hãng',
      'Quy trình giúp trẻ hóa và thu nhỏ lỗ chân lông đảm bảo an toàn',
      'Chi phí điều trị tiết kiệm, phù hợp mọi đối tượng khách hàng'
    ],
    primaryConditionIds: ['da-seo-ro'],
    // secondaryConditionIds: [''],
    sessions: 7,
    o2skinComboRef: '',
    referenceLink: '/programs/laser-tri-seo',
    images: ['/programs/hinh-anh-gioi-thieu-tri-seo-ro-3.jpg']
  },
  {
    id: 'microneedling-repair',
    name: 'Lăn kim phục hồi & cấp ẩm',
    description: 'Làn da thô ráp, nhiều khuyết điểm là nỗi lo của rất nhiều khách hàng. Trong \
    trường hợp này, quý khách có thể áp dụng phương pháp lăn kim nông giúp tái tạo da tự \
    nhiên, an toàn và mang lại làn da khoẻ hơn, ít kích ứng và sáng dần sau 5 buổi — phục hồi hàng rào bảo vệ tự nhiên.',
    summary: [
      "Giúp da trắng sáng, đều màu.",
      "Thu nhỏ lỗ chân lông, điều tiết hoạt động bã nhờn.",
      "Cải thiện màu sắc ở các vết thâm, sạm, nám…",
      "Giúp làn da mịn màng, căng bóng."
    ],
    primaryConditionIds: ['da-tho-rap', 'da-san-sui', 'da-nep-nhan'],
    secondaryConditionIds: ['lo-chan-long'],
    sessions: 5,
    o2skinComboRef: 'o2skin Combo Lăn kim thật (đối chiếu)',
    referenceLink: '/programs/lan-kim-phuc-hoi',
  },
  {
    id: 'hormonal-acne-plan',
    name: 'Lấy Nhân Mụn Chuẩn Y Khoa',
    summary:[
      "Loại bỏ nhanh cồi mụn, bụi bẩn, tế bào chết.",
      "Hạn chế tổn thương da, ít gây sẹo rỗ, sẹo xấu.",
      "Rút ngắn thời gian điều trị mụn.",
      "Ngăn ngừa mụn mới hình thành."
    ],
    description: 'Lấy nhân mụn là một trong những phương pháp cải thiện mụn trên da \
    được nhiều bạn áp dụng. Tuy nhiên, nếu lấy nhân mụn không đúng cách tại nhà có \
    thể khiến da sưng đỏ, viêm nhiễm, để lại sẹo thâm, sẹo rỗ. Do đó, để đảm bảo an \
    toàn và hiệu quả bạn nên chọn địa chỉ lấy nhân mụn uy tín, có bác sĩ da liễu thăm khám và chỉ định.\
    Phương pháp lấy nhân mụn mang lại nhiều lợi ích cho việc điều trị mụn nếu được thực hiện theo đúng chuẩn Y khoa.',
    isVip: false,
    benenif: [
      "Hạn chế nhiễm trùng, sẹo thâm, sẹo rỗ",
      "Lấy sạch nhân mụn, cải thiện bề mặt da tức thì",
      "Thời gian phục hồi nhanh chóng",
      "Ngừa mụn mới hình thành, hiệu quả lâu dài",
      "Rút ngắn thời gian và tiết kiệm chi phí"
    ],
    primaryConditionIds: ['mun-noi-tiet'],
    secondaryConditionIds: ['da-nhon-mun-viem'],
    sessions: 8,
    o2skinComboRef: '',
    referenceLink: '/programs/phac-do-mun-noi-tiet',
  },
  {
    id: 'maintenance-skin-health',
    name: 'Chăm Sóc Da Trắng Sáng Chuyên Sâu',
    description: 'Chăm sóc da trắng sáng chuyên sâu là phương pháp giúp lấy lại làn da trắng mịn, \
    căng bóng sau khi điều trị da thành công, chẳng hạn như sau khi điều trị hết mụn, nám, sạm, \
    cháy nắng,… Đây là phương pháp an toàn, đã được ứng dụng trên các khách hàng có tình trạng da không đều màu, thâm, sạm,… và cho hiệu quả cải thiện rõ rệt..',
    summary:[
      'Xóa mờ các vết thâm sau mụn.',
      'Giúp da đều màu, mịn màng, tươi sáng.',
      'An toàn, không gây tổn thương cho da.',
      'Thời gian thực hiện nhanh chóng.'
    ],
    benenif: [
      'Tăng khả năng hấp thu dưỡng chất gấp nhiều lần',
      'Làm sáng da, giảm thâm và cải thiện nám tàn nhang',
      'Da săn chắc, căng mịn, ngừa lão hóa',
      'Không xâm lấn và an toàn cho làn da',
      'Thực hiện nhanh, không đau, không cần nghỉ dưỡng'
    ],
    primaryConditionIds: ['clean-skin', 'da-moi-bat-dau'],
    secondaryConditionIds: ['sau-dieu-tri'],
    sessions: 9,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
    referenceLink: '/programs/cham-soc-da-trang-sang',
  },

  {
    id: 'treatment-tighten-pores',
    name: 'Trẻ Hóa Da Mặt Và Hỗ Trợ Thu Nhỏ Lỗ Chân Lông',
    description: 'Nhiều khách hàng băn khoăn về khuyết điểm lỗ chân lông to, bề mặt \
     da sần sùi, có vết thâm mụn,… khiến gương mặt trở nên kém sắc, già nua. Do đó, O2 SKIN cung \
     cấp gói dịch vụ trẻ hóa da và hỗ trợ thu nhỏ lỗ chân lông giúp khách hàng \
     lấy lại vẻ đẹp mịn màng, trẻ trung cho làn da. Phương pháp trẻ hóa da và hỗ trợ thu nhỏ \
     lỗ chân lông được tin chọn phổ biến nhờ quy trình điều trị chuẩn \
     Y khoa, đảm bảo an toàn cho khách hàng. Đặc biệt, liệu pháp này mang \
     đến những lợi ích cải thiện đáng kể cho làn da.',
    summary:[
      'Kết hợp serum trắng sáng, đều màu da.',
      'Hỗ trợ thu nhỏ lỗ chân lông',
      'Tăng độ đàn hồi, săn chắc da và giúp da mịn màng hơn.',
    ],
    benenif: [
      'Giúp da trắng tự nhiên và đều màu, lấy lại vẻ tươi sáng',
      'Cải thiện vùng da tăng sắc tố, giảm thâm và sạm nám',
      'Tăng độ đàn hồi, giúp da săn chắc và căng bóng hơn',
      'Hỗ trợ thu nhỏ lỗ chân lông, làm bề mặt da mịn màng',
      'Làm chậm quá trình lão hóa da, hạn chế các nếp nhăn',
      'Dưỡng da hồng hào, khỏe mạnh, tràn đầy sức sống'
    ],
    primaryConditionIds: ['lo-chan-long', 'da-tham-mun'],
    secondaryConditionIds: ['lan-da-xin-mau'],
    sessions: 10,
    o2skinComboRef: '',
    referenceLink: '/programs/dieu-tri-seo-ro-vet-tham-va-se-khit-lo-chan-long/tre-hoa-da-va-ho-tro-thu-nho-lo-chan-long/',
  },


];
