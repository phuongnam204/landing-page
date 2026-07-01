export interface QuizOption {
  id: string;
  label: string;
}

export interface QuizQuestion {
  id: string;
  question: string;
  options: QuizOption[];
}

export type ProgramId = 'khoi-dau' | 'toan-dien' | 'chuyen-sau';
export type Tone = 'positive' | 'concern';

export interface QuizResult {
  id: string;
  tone: Tone;
  body: string; // HTML fragment — internal data only, never user input
  solution: string;
  suggestedProgram: ProgramId;
}

export const quizQuestions: QuizQuestion[] = [
  {
    id: 'q1',
    question: 'Bạn là nam hay nữ?',
    options: [
      { id: 'nu', label: 'Nữ' },
      { id: 'nam', label: 'Nam' },
    ],
  },
  {
    id: 'q2',
    question: 'Da bạn có đang bị mụn sưng đỏ, đau không?',
    options: [
      { id: 'co', label: 'Có' },
      { id: 'khong', label: 'Không' },
    ],
  },
  {
    id: 'q3',
    question: 'Bạn có bị mụn đầu đen hoặc lỗ chân lông to không?',
    options: [
      { id: 'co', label: 'Có' },
      { id: 'khong', label: 'Không' },
    ],
  },
  {
    id: 'q4',
    question: 'Bạn đã từng dùng sữa rửa mặt hoặc sản phẩm chăm sóc da chưa?',
    options: [
      { id: 'da-dung', label: 'Đã dùng' },
      { id: 'chua-bao-gio', label: 'Chưa bao giờ' },
    ],
  },
  {
    id: 'q5',
    question: 'Sau khi rửa mặt, da bạn thường cảm thấy thế nào?',
    options: [
      { id: 'nhon', label: '💧 Nhờn bóng trở lại sau 1–2 tiếng' },
      { id: 'cang-rat', label: '🌵 Căng rát, đôi khi hơi đỏ' },
      { id: 'binh-thuong', label: 'Da tôi cảm thấy bình thường' },
    ],
  },
  {
    id: 'q6',
    question: 'Mụn hay nổi nhiều hơn vào lúc nào?',
    options: [], // provided at render time via q6Options[answers.q1]
  },
];

export const q6Options: Record<'nu' | 'nam', QuizOption[]> = {
  nu: [
    { id: 'ky-kinh', label: '🌙 Trước hoặc trong kỳ kinh' },
    { id: 'stress', label: '😩 Khi stress, thức khuya' },
    { id: 'khong-ro', label: 'Tôi cũng không rõ nữa' },
  ],
  nam: [
    { id: 'do-ngot', label: '🍕 Sau khi ăn đồ ngọt, chiên xào' },
    { id: 'stress', label: '😩 Khi stress, thức khuya' },
    { id: 'khong-ro', label: 'Tôi cũng không rõ nữa' },
  ],
};

export const quizResults: Record<string, QuizResult> = {
  'clean-skin': {
    id: 'clean-skin',
    tone: 'positive',
    body: 'Da bạn <b>đang ổn định</b> — chưa có dấu hiệu mụn viêm hay lỗ chân lông to rõ ràng. Đây là nền tảng tốt để xây dựng thói quen chăm sóc da bền vững.',
    solution:
      'Xây dựng routine đơn giản: cleanser nhẹ, moisturizer phù hợp da, SPF hàng ngày. Phòng ngừa tốt hơn điều trị.',
    suggestedProgram: 'khoi-dau',
  },
  'mun-noi-tiet': {
    id: 'mun-noi-tiet',
    tone: 'concern',
    body: 'Da bạn đang bị <b>mụn nội tiết</b> — mụn nổi theo chu kỳ kinh nguyệt, tập trung vùng cằm và má dưới. Thường sưng đỏ trước kỳ kinh rồi tự giảm.',
    solution:
      'Ưu tiên liệu trình nhẹ nhàng, kháng viêm. Tập trung cân bằng da thay vì tấn công mụn trực tiếp.',
    suggestedProgram: 'chuyen-sau',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    tone: 'concern',
    body: 'Da bạn <b>nhạy cảm + mụn dai dẳng</b> — skin barrier yếu, da căng rát sau rửa mặt, dễ kích ứng với sản phẩm mới. Mụn viêm tái đi tái lại dù đã thử nhiều cách.',
    solution:
      'Phục hồi barrier trước (ceramide, niacinamide), sau đó mới điều trị mụn. Tránh acid mạnh và scrub vật lý.',
    suggestedProgram: 'toan-dien',
  },
  'da-nhon-mun-viem': {
    id: 'da-nhon-mun-viem',
    tone: 'concern',
    body: 'Da bạn <b>nhờn + mụn viêm</b> — tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm liên tục đặc biệt vùng chữ T.',
    solution:
      'Kiểm soát dầu + kháng khuẩn nhẹ, BHA thông tắc lỗ chân lông, niacinamide giảm bã nhờn.',
    suggestedProgram: 'chuyen-sau',
  },
  'lo-chan-long': {
    id: 'lo-chan-long',
    tone: 'concern',
    body: 'Da bạn có <b>lỗ chân lông to + mụn đầu đen</b> — không có mụn viêm nhưng lỗ chân lông rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm.',
    solution:
      'Exfoliating routine nhẹ (BHA 1–2%), clay mask 1–2 lần/tuần. Không cần kháng sinh hay kháng viêm.',
    suggestedProgram: 'khoi-dau',
  },
  'da-moi-bat-dau': {
    id: 'da-moi-bat-dau',
    tone: 'positive',
    body: 'Da bạn <b>chưa có routine rõ ràng</b> — chưa có dấu hiệu cụ thể hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.',
    solution:
      'Bắt đầu từ basic routine: cleanser nhẹ + moisturizer + SPF. Tư vấn 1:1 để xác định nhu cầu.',
    suggestedProgram: 'khoi-dau',
  },
};
