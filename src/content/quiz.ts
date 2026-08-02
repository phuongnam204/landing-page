export type Tone = 'positive' | 'concern';

export type ConditionId =
  | 'mun-noi-tiet'
  | 'mun-trung-ca'
  | 'da-mun-tham-seo'
  | 'da-tham-mun'
  | 'lan-da-xin-mau'
  | 'da-nhon-mun-viem'
  | 'da-nhay-cam'
  | 'da-nhay-cam-san-pham'
  | 'tan-nhang'
  | 'da-tham-do'
  | 'da-tho-rap'
  | 'da-san-sui'
  | 'da-nep-nhan'
  | 'lo-chan-long'
  | 'clean-skin'
  | 'sau-dieu-tri'
  | 'da-moi-bat-dau'
  | 'da-seo-ro'
  | 'da-seo-ro-nan-mun'
  | 'da-seo-ro-khong-nan';

export interface SkinCondition {
  id: ConditionId;
  label?: string;
  tone: Tone;
  body?: string;
  bridge?: string;
  color: string;
  // Ghi chú đối chiếu sang category thật của o2skin (AcneType/SkinType/pathology). Placeholder.
  o2skinRef?: string;
}

export const skinConditions: Partial<Record<ConditionId, SkinCondition>> = {
  'mun-noi-tiet': {
    id: 'mun-noi-tiet',
    label: 'Mụn nội tiết',
    tone: 'concern',
    color: '#FF5C9E',
    body: 'Da bạn có dấu hiệu <b>mụn nội tiết</b> — mụn tập trung ở vùng cằm và quai hàm, thường nặng hơn theo chu kỳ. Đây là kiểu mụn liên quan đến thay đổi nội tiết bên trong.',
    bridge: 'Tình trạng này không hiếm — và có thể kiểm soát tốt khi được xử lý đúng nguyên nhân từ gốc.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-nhon-mun-viem': {
    id: 'da-nhon-mun-viem',
    label: 'Da nhờn + mụn viêm',
    tone: 'concern',
    color: '#FFCD78',
    body: 'Da bạn <b>nhờn + mụn viêm</b> — tuyến bã nhờn hoạt động mạnh, lỗ chân lông dễ tắc, mụn viêm liên tục đặc biệt vùng chữ T.',
    bridge: 'Tình trạng như của bạn không hiếm — và có cách xử lý đúng hướng từ gốc rễ.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-nhay-cam': {
    id: 'da-nhay-cam',
    label: 'Da nhạy cảm (thời tiết)',
    tone: 'concern',
    color: '#7DD9C0',
    body: 'Da bạn <b>nhạy cảm với môi trường</b> — dễ ửng đỏ, ngứa rát khi thay đổi thời tiết hoặc tiếp xúc khói bụi, không liên quan đến sản phẩm chăm sóc.',
    bridge: 'Da nhạy cảm kiểu này cần củng cố hàng rào bảo vệ — chọn đúng sản phẩm sẽ giúp da ổn định hơn rõ rệt.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-nhay-cam-san-pham': {
    id: 'da-nhay-cam-san-pham',
    label: 'Da nhạy cảm (sản phẩm)',
    tone: 'concern',
    color: '#5BC4B0',
    body: 'Da bạn <b>nhạy cảm với thành phần mỹ phẩm</b> — tình trạng đỏ rát, kích ứng xuất hiện sau khi dùng sản phẩm chăm sóc, cho thấy hàng rào da đang yếu hoặc sản phẩm chưa phù hợp.',
    bridge: 'Kích ứng do sản phẩm thường cải thiện nhanh khi xác định đúng thành phần gây vấn đề và chuyển sang routine phù hợp hơn.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'lo-chan-long': {
    id: 'lo-chan-long',
    label: 'Lỗ chân lông to',
    tone: 'concern',
    color: '#8B6BFF',
    body: 'Da bạn có <b>lỗ chân lông to + mụn đầu đen</b> — không có mụn viêm nhưng lỗ chân lông rõ và mụn đầu đen xuất hiện ở mũi, trán, cằm.',
    bridge: 'Lỗ chân lông to có thể cải thiện rõ rệt khi được làm sạch đúng cách và kiểm soát bã nhờn.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'clean-skin': {
    id: 'clean-skin',
    label: 'Da ổn định',
    tone: 'positive',
    color: '#B39DFF',
    body: 'Da bạn <b>đang ổn định</b> — chưa có dấu hiệu mụn viêm hay lỗ chân lông to rõ ràng. Đây là nền tảng tốt để xây dựng thói quen chăm sóc da bền vững.',
    bridge: 'Da bạn đang ở điểm khởi đầu tốt — và chúng tôi có thể giúp bạn duy trì điều đó lâu dài.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-moi-bat-dau': {
    id: 'da-moi-bat-dau',
    label: 'Chưa có routine',
    tone: 'positive',
    color: '#A0AEC0',
    body: 'Da bạn <b>chưa có routine rõ ràng</b> — chưa có dấu hiệu cụ thể hoặc da tương đối ổn định. Chưa xác định được vấn đề cụ thể.',
    bridge: 'Bắt đầu sớm luôn có lợi — xây dựng routine đúng từ đầu dễ hơn nhiều so với điều trị sau.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'mun-trung-ca': {
    id: 'mun-trung-ca',
    label: 'Mụn trứng cá',
    tone: 'concern',
    color: '#FF6B35',
    body: 'Da bạn có <b>mụn trứng cá</b> — tình trạng phổ biến do tuyến bã nhờn hoạt động quá mức kết hợp vi khuẩn, gây ra mụn đầu đen, đầu trắng và mụn viêm trên mặt.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-mun-tham-seo': {
    id: 'da-mun-tham-seo',
    label: 'Da mụn thâm sẹo',
    tone: 'concern',
    color: '#C06050',
    body: 'Da bạn có <b>mụn kèm thâm và sẹo</b> — hậu quả của mụn viêm để lại vết thâm nâu đỏ và sẹo rỗ, khiến da không đều màu và bề mặt sần sùi.',
    o2skinRef: 'o2skin AcneType (đối chiếu tên thật)',
  },
  'da-tham-do': {
    id: 'da-tham-do',
    label: 'Da thâm đỏ',
    tone: 'concern',
    color: '#E85D5D',
    body: 'Da bạn có <b>vùng thâm đỏ</b> — xuất hiện sau viêm nhiễm, tổn thương da hoặc do tăng sắc tố, khiến da không đều màu và thiếu sức sống.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-nep-nhan': {
    id: 'da-nep-nhan',
    label: 'Nếp nhăn',
    tone: 'concern',
    color: '#D4A544',
    body: 'Da bạn có <b>nếp nhăn</b> — dấu hiệu lão hóa sớm do collagen suy giảm, khiến da mất độ đàn hồi và hình thành nếp ở vùng mắt, miệng và trán.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'tan-nhang': {
    id: 'tan-nhang',
    label: 'Tàn nhang',
    tone: 'concern',
    color: '#C4944A',
    body: 'Da bạn có <b>tàn nhang</b> — đốm sắc tố do tổn thương UV tích lũy kích thích melanin, tạo ra các đốm nâu trên da, đặc biệt vùng gò má và mũi.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-tho-rap': {
    id: 'da-tho-rap',
    label: 'Da thô ráp',
    tone: 'concern',
    color: '#A08060',
    body: 'Da bạn có <b>bề mặt thô ráp</b> — tế bào chết tích tụ và collagen suy giảm khiến da mất độ mịn màng, sờ vào cảm giác không đều.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-san-sui': {
    id: 'da-san-sui',
    label: 'Da sần sùi',
    tone: 'concern',
    color: '#9B7B5A',
    body: 'Da bạn có <b>bề mặt sần sùi</b> — do tổn thương da, sẹo lõm hoặc cấu trúc da không đều, ảnh hưởng đến vẻ ngoài và độ mịn của làn da.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'sau-dieu-tri': {
    id: 'sau-dieu-tri',
    label: 'Sau điều trị',
    tone: 'positive',
    color: '#34A97A',
  },
  'da-tham-mun': {
    id: 'da-tham-mun',
    label: 'Da thâm mụn',
    tone: 'concern',
    color: '#C97A5B',
  },
  'lan-da-xin-mau': {
    id: 'lan-da-xin-mau',
    label: 'Làn da xỉn màu',
    tone: 'concern',
    color: '#A09080',
  },
  'da-seo-ro': {
    id: 'da-seo-ro',
    label: 'Sẹo rỗ',
    tone: 'concern',
    color: '#9C7A5F',
    body: 'Da bạn có <b>sẹo rỗ</b> — tổn thương sau khi mụn viêm mạnh để lại các lỗ nhỏ lõm trên bề mặt, khiến da không đều và thiếu mịn màng dù mụn đã hết.',
    bridge: 'Sẹo rỗ có thể cải thiện rõ rệt với công nghệ laser — không cần phải sống chung với nó mãi.',
  },
  'da-seo-ro-nan-mun': {
    id: 'da-seo-ro-nan-mun',
    label: 'Sẹo rỗ (do nặn mụn)',
    tone: 'concern',
    color: '#A0705A',
    body: 'Da bạn có <b>sẹo rỗ do nặn mụn</b> — khi nặn không đúng cách, da bị tổn thương nghiêm trọng làm đứt gãy collagen và elastin, khiến bề mặt lõm sâu và mất đi sự mịn màng vốn có. Mụn trứng cá, mụn bọc và mụn mủ đều có thể gây sẹo nếu can thiệp sai cách.',
    bridge: 'Sẹo do nặn mụn có thể cải thiện tốt với laser và microneedling — quan trọng hơn là dừng nặn từ bây giờ để ngăn sẹo mới tiếp tục hình thành.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },
  'da-seo-ro-khong-nan': {
    id: 'da-seo-ro-khong-nan',
    label: 'Sẹo rỗ (viêm sâu)',
    tone: 'concern',
    color: '#8A6A50',
    body: 'Da bạn có <b>sẹo rỗ do viêm sâu</b> — dù không nặn mụn, các ổ viêm từ mụn bọc và mụn nang kéo dài vẫn có thể phá hủy collagen và elastin bên trong, khiến da không kịp tái tạo sau khi mụn lành và để lại lỗ lõm. Nguy cơ này cao hơn ở người bị mụn nặng hoặc mụn viêm kéo dài.',
    bridge: 'Sẹo hình thành từ viêm sâu thường cần can thiệp chuyên sâu — nên thăm khám da liễu để được tư vấn phác đồ phù hợp thay vì tự xử lý tại nhà.',
    o2skinRef: 'o2skin SkinType (đối chiếu tên thật)',
  },

};
