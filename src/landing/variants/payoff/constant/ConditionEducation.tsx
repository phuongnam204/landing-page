import { ConditionId } from "../../../../content/quiz";

export type ConditionEducation = {
  whyTitle: string;
  steps: { title: string; body: string }[];
  expertQuote: string;
  expertName: string;
};


export const CONDITION_EDUCATION: Partial<Record<ConditionId, ConditionEducation>> = {
  'da-nhon-mun-viem': {
    whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
    steps: [
      { title: 'Tuyến bã nhờn hoạt động quá mức', body: 'Da sản xuất bã nhờn nhiều hơn cần thiết, bịt lỗ chân lông và tạo điều kiện cho vi khuẩn P.acnes phát triển bên trong — nguyên nhân trực tiếp của mụn viêm.' },
      { title: 'Viêm nhiễm hình thành dưới da', body: 'Vi khuẩn kích hoạt phản ứng miễn dịch — tạo ra nốt mụn sưng đỏ và mủ. Đây là giai đoạn gây tổn thương da và thâm nếu không can thiệp sớm.' },
      { title: 'Nếu viêm nhiễm kéo dài, có thể dẫn tới thâm và sẹo', body: 'Mỗi nốt viêm để lại vết thâm và có nguy cơ gây sẹo rỗ. Điều trị sớm và đúng hướng giảm đáng kể rủi ro này — không nên để mặc hoặc tự nặn.' },
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
    whyTitle: 'Da của bạn ổn, vậy có nên phòng ngừa bệnh không?',
    steps: [
      { title: 'Collagen bắt đầu suy giảm từ tuổi 25', body: 'Da ổn định hiện tại không có nghĩa là tự bảo vệ mãi. Collagen giảm dần mỗi năm — xây dựng thói quen chăm sóc từ sớm giúp duy trì nền da tốt lâu hơn đáng kể.' },
      { title: 'Phòng ngừa tiết kiệm hơn điều trị từ 3 đến 5 lần', body: 'Một liệu trình duy trì ngắn định kỳ giúp tránh chi phí điều trị sẹo, thâm và lão hóa sớm — những vấn đề cao hơn rất nhiều lần về chi phí nếu để xảy ra.' },
      { title: 'Đô thị hóa liên tục tấn công da mỗi ngày', body: 'UV, ô nhiễm không khí và căng thẳng là các yếu tố gây lão hóa da không thể tránh hoàn toàn — chỉ có thể giảm thiểu bằng cách chăm sóc đúng và đều đặn.' },
    ],
    expertQuote: 'Câu trả lời là có ! Da khỏe hôm nay là kết quả của thói quen 6 tháng trước. Đầu tư vào da khi đang ổn là cách khôn ngoan nhất để không phải điều trị tốn kém sau này.',
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
  'mun-trung-ca': {
    whyTitle: 'Điều gì xảy ra bên dưới làn da của bạn?',
    steps: [
      { title: 'Tuyến bã nhờn tiết quá mức', body: 'Tuyến bã nhờn sản xuất nhiều dầu hơn cần thiết, bít lỗ chân lông và tạo môi trường cho vi khuẩn P.acnes sinh sôi — đây là bước đầu tiên hình thành mụn trứng cá.' },
      { title: 'Vi khuẩn gây viêm và sưng', body: 'Vi khuẩn trong lỗ chân lông bị bít kích hoạt phản ứng viêm của cơ thể, dẫn đến mụn sưng đỏ, đau và có mủ. Nặn sai cách có thể đẩy viêm sâu hơn và gây sẹo.' },
      { title: 'Vết thâm hình thành nếu không điều trị đúng', body: 'Mỗi nốt mụn viêm để lại tổn thương mô da, gây thâm sau mụn kéo dài nhiều tuần. Can thiệp sớm và đúng phác đồ giảm đáng kể nguy cơ để lại dấu vết.' },
    ],
    expertQuote: 'Mụn trứng cá là tình trạng phổ biến và hoàn toàn điều trị được. Quan trọng là điều trị đúng nguyên nhân gốc rễ thay vì chỉ dập tắt từng nốt mụn bề mặt.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-mun-tham-seo': {
    whyTitle: 'Tại sao mụn để lại thâm và sẹo?',
    steps: [
      { title: 'Viêm nhiễm gây tổn thương tế bào sắc tố', body: 'Khi mụn viêm lành, tế bào melanin phản ứng bằng cách sản xuất nhiều sắc tố hơn tại vùng tổn thương — tạo ra vết thâm nâu đỏ kéo dài sau khi mụn đã hết.' },
      { title: 'Sẹo rỗ hình thành do mất collagen', body: 'Viêm nhiễm sâu phá hủy cấu trúc collagen bên dưới da. Khi da lành, thiếu hụt collagen tạo ra vết lõm — thứ mà chăm sóc da thông thường không thể phục hồi được.' },
      { title: 'Nặn mụn sai cách làm tổn thương nặng hơn', body: 'Tự nặn mụn đẩy viêm sâu vào mô da, tăng nguy cơ sẹo rỗ và thâm lâu dài. Điều trị chuyên sâu giúp tái tạo collagen và làm mờ thâm từ bên trong.' },
    ],
    expertQuote: 'Thâm và sẹo sau mụn cần được điều trị chủ động bằng phương pháp tái tạo da — không tự mờ hoàn toàn chỉ với skincare thông thường.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-tham-do': {
    whyTitle: 'Tại sao da xuất hiện vùng thâm đỏ?',
    steps: [
      { title: 'Tăng sắc tố sau viêm (PIH)', body: 'Sau mỗi tổn thương — mụn, xước, kích ứng — da phản ứng bằng cách tăng sản xuất melanin tại chỗ, tạo ra các mảng thâm tối hơn vùng da xung quanh.' },
      { title: 'Mạch máu giãn nở tạo vùng đỏ', body: 'Kích ứng kéo dài hoặc điều trị không đúng cách làm giãn mạch máu dưới da, tạo ra các mảng đỏ dai dẳng. Đây không phải viêm — cần phương pháp điều trị khác với mụn thông thường.' },
      { title: 'UV làm thâm đỏ đậm hơn theo thời gian', body: 'Tia UVA kích thích sắc tố da hoạt động mạnh hơn, khiến vùng thâm đỏ ngày càng đậm nếu không chống nắng đúng cách. Chống nắng SPF 50+ là bước không thể thiếu trong điều trị.' },
    ],
    expertQuote: 'Thâm đỏ sau tổn thương da có thể cải thiện đáng kể nếu điều trị đúng giai đoạn và duy trì bảo vệ da khỏi UV mỗi ngày.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-nep-nhan': {
    whyTitle: 'Tại sao da xuất hiện nếp nhăn sớm?',
    steps: [
      { title: 'Collagen và elastin suy giảm theo tuổi', body: 'Từ tuổi 25, cơ thể sản xuất ít collagen hơn mỗi năm. Da mất độ đàn hồi dần, hình thành nếp nhăn — đặc biệt ở vùng hay cử động như mắt, miệng và trán.' },
      { title: 'UV tích lũy phá hủy cấu trúc collagen', body: 'Tia UVA xâm nhập sâu vào lớp bì, phá vỡ cấu trúc collagen và elastin — ngay cả khi không có cảm giác nắng bỏng rõ ràng.' },
      { title: 'Tổn thương thường thấy rõ sau nhiều năm', body: 'Tổn thương tích lũy từ tuổi 20 nhưng chỉ biểu hiện ra ngoài ở tuổi 30–40. Can thiệp sớm bằng các liệu trình kích thích collagen giúp làm chậm quá trình này rõ rệt.' },
    ],
    expertQuote: 'Nếp nhăn sớm là dấu hiệu collagen suy giảm và tổn thương UV — điều trị hiệu quả nhất khi can thiệp sớm bằng liệu pháp tái tạo collagen kết hợp bảo vệ da đúng cách.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'tan-nhang': {
    whyTitle: 'Tại sao da xuất hiện tàn nhang và đốm nâu?',
    steps: [
      { title: 'UV kích thích melanin tập trung tại chỗ', body: 'Tia UVA kích hoạt tế bào hắc tố sản xuất melanin cục bộ tại vùng da bị tổn thương, tạo ra đốm nâu và tàn nhang — ngay cả khi không có cảm giác bỏng nắng.' },
      { title: 'Tổn thương UV tích lũy từ nhiều năm', body: 'Mỗi lần tiếp xúc UV không được bảo vệ đều để lại dấu ấn tích lũy. Đốm nâu thường xuất hiện ở tuổi 30+ nhưng nguyên nhân đến từ thói quen không chống nắng từ nhiều năm trước.' },
      { title: 'Skincare thông thường không đủ để làm mờ', body: 'Kem dưỡng chỉ có tác dụng tạm thời trên bề mặt. Điều trị triệt để cần tác động đến tế bào hắc tố tầng sâu và bảo vệ da khỏi UV liên tục.' },
    ],
    expertQuote: 'Tàn nhang và đốm nâu do UV có thể cải thiện đáng kể khi kết hợp điều trị làm mờ sắc tố chuyên sâu và duy trì chống nắng SPF 50+ mỗi ngày.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-tho-rap': {
    whyTitle: 'Tại sao da trở nên thô ráp và kém mịn màng?',
    steps: [
      { title: 'Tế bào chết tích tụ trên bề mặt da', body: 'Da liên tục sản sinh tế bào mới và đẩy tế bào cũ lên bề mặt. Khi quá trình này chậm lại, tế bào chết tích tụ khiến da trông xỉn và sờ vào cảm giác thô.' },
      { title: 'Collagen suy giảm làm mất độ đàn hồi', body: 'Collagen và elastin giúp da mềm mại và có kết cấu. Khi các thành phần này suy giảm theo tuổi hoặc do tổn thương, da mất đi sự mịn màng từ bên trong.' },
      { title: 'Tẩy da chết thông thường chỉ xử lý bề mặt', body: 'Scrub và tẩy tế bào chết vật lý chỉ làm sạch lớp ngoài cùng. Điều trị hiệu quả cần tái tạo cấu trúc da từ bên trong và kích thích collagen mới.' },
    ],
    expertQuote: 'Da thô ráp cần được tái tạo từ bên trong — không chỉ tẩy tế bào chết bề mặt. Kích thích collagen và phục hồi cấu trúc da mới mang lại độ mịn bền vững.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-seo-ro': {
    whyTitle: 'Điều gì xảy ra bên dưới vết sẹo rỗ?',
    steps: [
      { title: 'Mụn viêm sâu phá hủy mô collagen', body: 'Mụn viêm nặng hoặc nặn sai cách có thể tổn thương tầng collagen bên dưới da — để lại hố lõm ngay cả sau khi mụn đã lành hoàn toàn.' },
      { title: 'Sẹo rỗ không tự lành theo thời gian', body: 'Khác với thâm mụn có thể mờ dần, sẹo rỗ là tổn thương cấu trúc — không thể phục hồi bằng sản phẩm dưỡng thông thường hay để tự khỏi.' },
      { title: 'Can thiệp sớm cho kết quả tốt hơn rõ rệt', body: 'Công nghệ tái tạo da hiện đại có thể cải thiện sẹo rỗ đáng kể — nhưng hiệu quả phụ thuộc nhiều vào việc can thiệp sớm trước khi cấu trúc da bị tổn thương quá sâu.' },
    ],
    expertQuote: 'Sẹo rỗ là tổn thương cấu trúc collagen — không phải vấn đề bề mặt. Điều trị hiệu quả cần tác động đến tầng collagen dưới da, không chỉ làm mờ bề mặt.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'da-san-sui': {
    whyTitle: 'Tại sao bề mặt da không đều và sần sùi?',
    steps: [
      { title: 'Sẹo và tổn thương làm mất cấu trúc da', body: 'Mụn viêm, tổn thương hoặc vết thương để lại vùng da không đều — nơi collagen bị phá hủy và tái tạo không hoàn chỉnh, tạo ra bề mặt lõm hoặc sần.' },
      { title: 'Sợi collagen tổng hợp không đồng đều', body: 'Khi da lành sau tổn thương, collagen mới không luôn được tổng hợp đều đặn. Sự khác biệt trong mật độ collagen tạo ra các vùng bề mặt không nhẵn.' },
      { title: 'Không thể tự phục hồi hoàn toàn bằng skincare', body: 'Sản phẩm bôi ngoài không thể tái tạo cấu trúc collagen đã bị phá hủy. Cần các phương pháp kích thích collagen chuyên sâu để làm đều bề mặt da.' },
    ],
    expertQuote: 'Da sần sùi sau tổn thương là kết quả của collagen không đều — cần điều trị kích thích tái tạo collagen mới để cải thiện bề mặt da từ bên dưới.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
  'sau-dieu-tri': {
    whyTitle: 'Tại sao duy trì sau điều trị lại quan trọng?',
    steps: [
      { title: 'Kết quả điều trị cần thời gian để ổn định', body: 'Da vừa hoàn thành liệu trình đang trong giai đoạn phục hồi — collagen mới được tổng hợp và tế bào da đang tái tạo. Giai đoạn này cần chăm sóc đúng để giữ kết quả bền lâu.' },
      { title: 'Nguy cơ tái phát cao nếu không duy trì', body: 'Nhiều nguyên nhân gây ra tình trạng da ban đầu vẫn còn đó — hormone, UV, stress, chế độ ăn. Không có liệu trình duy trì, da có thể quay trở lại trạng thái trước điều trị trong vài tháng.' },
      { title: 'Liệu trình duy trì nhẹ hơn, tiết kiệm hơn', body: 'Một liệu trình duy trì định kỳ ngắn giúp giữ kết quả mà không cần lặp lại toàn bộ phác đồ điều trị ban đầu — tiết kiệm thời gian và chi phí đáng kể về lâu dài.' },
    ],
    expertQuote: 'Duy trì sau điều trị không phải là tùy chọn — đó là phần thiết yếu để giữ kết quả bền lâu. Da được chăm sóc đúng sau điều trị có thể duy trì trạng thái tốt lâu hơn gấp đôi.',
    expertName: 'BS. Chuyên khoa Da liễu, o2skin',
  },
};