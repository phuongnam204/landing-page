export type Tone = 'positive' | 'concern';

export type ConditionId =
  | 'mun-noi-tiet'
  | 'da-nhon-mun-viem'
  | 'da-nhay-cam'
  | 'lo-chan-long'
  | 'clean-skin'
  | 'da-moi-bat-dau';

export interface SkinCondition {
  id: ConditionId;
  label: string;
  tone: Tone;
  body: string;
  color: string;
  // Ghi chú đối chiếu sang category thật của o2skin (AcneType/SkinType/pathology). Placeholder.
  o2skinRef?: string;
}

export const skinConditions: Record<ConditionId, SkinCondition> = {
  'mun-noi-tiet': {
    id: 'mun-noi-tiet',
    label: 'Mụn nội tiết',
    tone: 'concern',
    color: '#FF5C9E',
    body: 'Da bạn có dấu hiệu <b>mụn nội tiết</b> — mụn tập trung ở vùng cằm và quai hàm, thường nặng hơn theo chu kỳ. Đây là kiểu mụn liên quan đến thay đổi nội tiết bên trong.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-nhon-mun-viem': {
    id: 'da-nhon-mun-viem',
    label: 'Da nhờn + mụn viêm',
    tone: 'concern',
    color: '#FFCD78',
    body: 'Da bạn <b>nhờn + mụn viêm</b> — tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm liên tục đặc biệt vùng chữ T.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    label: 'Da nhạy cảm',
    tone: 'concern',
    color: '#7DD9C0',
    body: 'Da bạn <b>nhạy cảm, dễ kích ứng</b> — dễ nổi mẩn đỏ, ửng đỏ từng mảng khi thay đổi thời tiết hoặc dùng sản phẩm không phù hợp.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'lo-chan-long': {
    id: 'lo-chan-long',
    label: 'Lỗ chân lông to',
    tone: 'concern',
    color: '#8B6BFF',
    body: 'Da bạn có <b>lỗ chân lông to + mụn đầu đen</b> — không có mụn viêm nhưng lỗ chân lông rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'clean-skin': {
    id: 'clean-skin',
    label: 'Da ổn định',
    tone: 'positive',
    color: '#B39DFF',
    body: 'Da bạn <b>đang ổn định</b> — chưa có dấu hiệu mụn viêm hay lỗ chân lông to rõ ràng. Đây là nền tảng tốt để xây dựng thói quen chăm sóc da bền vững.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-moi-bat-dau': {
    id: 'da-moi-bat-dau',
    label: 'Chưa có routine',
    tone: 'positive',
    color: '#A0AEC0',
    body: 'Da bạn <b>chưa có routine rõ ràng</b> — chưa có dấu hiệu cụ thể hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
};
