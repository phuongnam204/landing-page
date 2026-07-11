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
    isVip: true,
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
  },
  {
    id: 'laser-scar-treatment',
    name: 'Laser trị sẹo rỗ & tái tạo da',
    description: 'Sẹo rỗ mờ dần, lỗ chân lông se khít sau 7 buổi — da đều màu và sáng hơn nhìn thấy rõ.',
    isVip: true,
    primaryConditionIds: ['lo-chan-long'],
    secondaryConditionIds: ['da-nhay-cam'],
    sessions: 7,
    o2skinComboRef: 'o2skin Combo Laser thật (đối chiếu)',
    referenceLink: '/programs/laser-tri-seo',
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
    name: 'Phác đồ mụn nội tiết',
    description: 'Mụn cằm và quai hàm không tái phát sau 8 buổi — phác đồ tập trung vào nguyên nhân nội tiết gốc rễ.',
    isVip: true,
    primaryConditionIds: ['mun-noi-tiet'],
    secondaryConditionIds: ['da-nhon-mun-viem'],
    sessions: 8,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
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
    sessions: 3,
    o2skinComboRef: 'o2skin Combo thật (đối chiếu)',
    referenceLink: '/programs/cham-soc-da-trang-sang',
  },
];
