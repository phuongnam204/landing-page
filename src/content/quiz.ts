export type ProgramId = 'khoi-dau' | 'toan-dien' | 'chuyen-sau';
export type Tone = 'positive' | 'concern';

export interface QuizResult {
  id: string;
  tone: Tone;
  body: string;
  solution: string;
  suggestedProgram: ProgramId;
}

export const quizResults: Record<string, QuizResult> = {
  'clean-skin': {
    id: 'clean-skin',
    tone: 'positive',
    body: 'Da bạn <b>đang ổn định</b> — chưa có dấu hiệu mụn viêm hay lỗ chân lông to rõ ràng. Đây là nền tảng tốt để xây dựng thói quen chăm sóc da bền vững.',
    solution:
      'Xây dựng routine đơn giản: cleanser nhẹ, moisturizer phù hợp da, SPF hàng ngày. Phòng ngừa tốt hơn điều trị.',
    suggestedProgram: 'khoi-dau',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    tone: 'concern',
    body: 'Da bạn <b>nhạy cảm, dễ kích ứng</b> — dễ nổi mẩn đỏ, ửng đỏ từng mảng khi thay đổi thời tiết hoặc dùng sản phẩm không phù hợp.',
    solution:
      'Phục hồi hàng rào bảo vệ da (ceramide, niacinamide) trước, sau đó mới điều trị chuyên sâu. Tránh acid mạnh và scrub vật lý.',
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
