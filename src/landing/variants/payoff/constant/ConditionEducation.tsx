import { ConditionId } from "../../../../content/quiz";

export type ConditionEducation = {
  whyTitle: string;
  steps: { title: string; body: string }[];
  expertQuote: string;
  expertName: string;
};


export const CONDITION_EDUCATION: Record<ConditionId, ConditionEducation> = {
  'da-nhon-mun-viem': {
    whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
    steps: [
      { title: 'Tuyến bã nhờn hoạt động quá mức', body: 'Da sản xuất bã nhờn nhiều hơn cần thiết, bịt lỗ chân lông và tạo điều kiện cho vi khuẩn P.acnes phát triển bên trong — nguyên nhân trực tiếp của mụn viêm.' },
      { title: 'Viêm nhiễm hình thành dưới da', body: 'Vi khuẩn kích hoạt phản ứng miễn dịch — tạo ra nốt mụn sưng đỏ và mủ. Đây là giai đoạn gây tổn thương da và thâm nếu không can thiệp sớm.' },
      { title: 'Thâm và sẹo là hậu quả của viêm kéo dài', body: 'Mỗi nốt viêm để lại vết thâm và có nguy cơ gây sẹo rỗ. Điều trị sớm và đúng hướng giảm đáng kể rủi ro này — không nên để mặc hoặc tự nặn.' },
    ],
    expertQuote: 'Mụn viêm do bã nhờn và vi khuẩn là tình trạng điều trị được. Khi can thiệp đúng phác đồ ngay từ sớm, kết quả thường tốt hơn rất nhiều so với để kéo dài.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'lo-chan-long': {
    whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
    steps: [
      { title: 'Bã nhờn và tế bào chết tích tụ trong lỗ chân lông', body: 'Lỗ chân lông bị nhồi đầy dần, giãn to theo thời gian và hình thành đầu đen — ngay cả khi da được rửa sạch hàng ngày.' },
      { title: 'Collagen xung quanh lỗ chân lông suy giảm', body: 'Mô da giữ thành lỗ chân lông săn chắc bị mỏng đi theo tuổi và tổn thương — khiến lỗ chân lông nhìn to hơn kể cả khi sạch.' },
      { title: 'Skincare thông thường không đủ để giải quyết', body: 'Toner và kem thu lỗ chân lông chỉ có tác dụng tạm thời — không thể tác động vào cấu trúc collagen và bã nhờn tầng sâu bên trong.' },
    ],
    expertQuote: 'Lỗ chân lông to cần điều trị từ bên trong — tái tạo collagen và làm sạch sâu. Sản phẩm bôi ngoài không thể thu nhỏ vĩnh viễn, chỉ che phủ tạm thời.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-nhay-cam': {
    whyTitle: 'Điều gì đang xảy ra với làn da của bạn?',
    steps: [
      { title: 'Hàng rào bảo vệ da bị suy yếu', body: 'Da nhạy cảm có lớp lipid mỏng hơn bình thường — khiến tác nhân bên ngoài như UV, khói bụi và mỹ phẩm xâm nhập sâu dễ dàng hơn mức bình thường.' },
      { title: 'Hệ miễn dịch trong da phản ứng quá mức', body: 'Khi gặp kích thích dù nhỏ, hệ miễn dịch kích hoạt phản ứng viêm — gây mẩn đỏ và ngứa ngay cả với sản phẩm được quảng cáo là nhẹ nhàng.' },
      { title: 'Vòng lặp kích ứng khó thoát', body: 'Dùng nhiều sản phẩm để che triệu chứng → da kích ứng thêm → da nhạy cảm hơn. Phá vỡ vòng lặp này cần phục hồi hàng rào bảo vệ đúng cách, không phải che phủ.' },
    ],
    expertQuote: 'Da nhạy cảm cần được phục hồi hàng rào bảo vệ, không phải đè nén triệu chứng. Khi hàng rào mạnh lên, da tự điều chỉnh được nhiều hơn và ít kích ứng hơn đáng kể.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'mun-noi-tiet': {
    whyTitle: 'Điều gì đang xảy ra trên da của bạn?',
    steps: [
      { title: 'Hormone androgen kích thích tuyến bã nhờn tăng tiết', body: 'Sự thay đổi hormone — trước kỳ kinh, khi stress hoặc thay đổi thuốc — khiến tuyến bã nhờn ở cằm và quai hàm tiết nhiều bất thường, tạo điều kiện cho mụn bùng phát.' },
      { title: 'Mụn nội tiết không phải lỗi của việc chăm sóc da', body: 'Ngay cả với routine đúng chuẩn, mụn nội tiết vẫn tái phát — vì nguyên nhân nằm bên trong cơ thể, không phải bề mặt da. Đây không phải do bạn chăm sóc da sai.' },
      { title: 'Tại sao skincare đơn thuần không đủ', body: 'Sản phẩm bôi ngoài chỉ kiểm soát triệu chứng tạm thời. Điều trị hiệu quả cần kết hợp phương pháp tác động đến viêm tại chỗ và cân bằng tuyến nhờn từ bên trong.' },
    ],
    expertQuote: 'Mụn nội tiết là phản ứng của cơ thể với hormone — không phải do chăm sóc da sai. Điều trị đúng hướng giúp kiểm soát dài hạn, không chỉ dập tắt tạm thời từng đợt.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'clean-skin': {
    whyTitle: 'Tại sao phòng ngừa quan trọng hơn điều trị?',
    steps: [
      { title: 'Collagen bắt đầu suy giảm từ tuổi 25', body: 'Da ổn định hiện tại không có nghĩa là tự bảo vệ mãi. Collagen giảm dần mỗi năm — xây dựng thói quen chăm sóc từ sớm giúp duy trì nền da tốt lâu hơn đáng kể.' },
      { title: 'Phòng ngừa tiết kiệm hơn điều trị từ 3 đến 5 lần', body: 'Một liệu trình duy trì ngắn định kỳ giúp tránh chi phí điều trị sẹo, thâm và lão hóa sớm — những vấn đề cao hơn rất nhiều lần về chi phí nếu để xảy ra.' },
      { title: 'Đô thị hóa liên tục tấn công da mỗi ngày', body: 'UV, ô nhiễm không khí và căng thẳng là các yếu tố gây lão hóa da không thể tránh hoàn toàn — chỉ có thể giảm thiểu bằng cách chăm sóc đúng và đều đặn.' },
    ],
    expertQuote: 'Da khỏe hôm nay là kết quả của thói quen 6 tháng trước. Đầu tư vào da khi đang ổn là cách khôn ngoan nhất để không phải điều trị tốn kém sau này.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-moi-bat-dau': {
    whyTitle: 'Tại sao bắt đầu đúng cách ngay bây giờ là quan trọng?',
    steps: [
      { title: 'Không có routine không có nghĩa là da đang tốt', body: 'Da chưa bộc lộ vấn đề không có nghĩa là không có gì bên dưới. Tổn thương tích lũy âm thầm và chỉ hiện ra khi đã nặng — thường khó và tốn kém hơn để điều trị.' },
      { title: 'Giai đoạn sớm là thời điểm can thiệp tốt nhất', body: 'Xây dựng routine từ khi da chưa có vấn đề giúp phòng ngừa mụn, thâm và lão hóa sớm hiệu quả hơn bất kỳ điều trị nào sau này.' },
      { title: 'Kiến thức về da giúp tránh sai lầm tốn kém', body: 'Nhiều người mua sản phẩm sai với da vì chưa biết loại da và nhu cầu thật sự. Tư vấn đúng từ đầu tiết kiệm thời gian và chi phí đáng kể về lâu dài.' },
    ],
    expertQuote: 'Da chưa có vấn đề là cơ hội vàng để xây dựng thói quen đúng. Bắt đầu sớm với phác đồ phù hợp giúp duy trì làn da khỏe mạnh mà không cần điều trị sau này.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
};