export type Testimonial = {
  quote: string;
  name: string;
  age: number;
  branch: string;
  letter: string;
  bg: string;
  fg: string;
  programIds: string[];
};

export const TESTIMONIALS: Testimonial[] = [
  // ─── Peel da trị mụn ────────────────────────────────────────────────────────
  {
    quote: 'Peel xong da mịn ngay hôm sau. Mụn viêm xẹp sau buổi đầu, thâm mờ dần từ buổi 2. Không đau như tôi tưởng.',
    name: 'Lan Anh', age: 19, branch: 'Chi nhánh Quận 1',
    letter: 'L', bg: '#fde68a', fg: '#78350f',
    programIds: ['peel-acne'],
  },
  {
    quote: 'Trước hay dùng kem trị mụn mà không đỡ. Thử peel 4 buổi, thâm đỏ giảm rõ, mụn ẩn cũng ít hẳn. Bác sĩ tư vấn thật, không ép mua thêm gì.',
    name: 'Thu Hương', age: 24, branch: 'Chi nhánh Bình Thạnh',
    letter: 'T', bg: '#fef3c7', fg: '#92400e',
    programIds: ['peel-acne'],
  },

  // ─── IPL kiểm soát nhờn & mụn ───────────────────────────────────────────────
  {
    quote: 'Sau 3 buổi IPL mụn viêm giảm rõ, thâm mụn cũng mờ dần. Bác sĩ giải thích kỹ từng bước, tôi yên tâm hoàn toàn.',
    name: 'Thanh Hà', age: 22, branch: 'Chi nhánh Quận 3',
    letter: 'T', bg: '#fde68a', fg: '#92400e',
    programIds: ['ipl-oil-control'],
  },
  {
    quote: 'Da nhạy cảm nhưng IPL không bị kích ứng gì. Được dặn dò kỹ trước và sau buổi trị, tôi hoàn toàn yên tâm.',
    name: 'Phương Linh', age: 20, branch: 'Chi nhánh Thủ Đức',
    letter: 'P', bg: '#d1fae5', fg: '#065f46',
    programIds: ['ipl-oil-control', 'hormonal-acne-plan'],
  },
  {
    quote: 'Kiểm soát nhờn tốt hơn nhiều sau 6 buổi. Lỗ chân lông cũng nhỏ lại, giờ ra đường tự tin hơn hẳn.',
    name: 'Minh Châu', age: 25, branch: 'Chi nhánh Bình Thạnh',
    letter: 'M', bg: '#ddd6fe', fg: '#5b21b6',
    programIds: ['ipl-oil-control'],
  },

  // ─── Laser trị sẹo rỗ ───────────────────────────────────────────────────────
  {
    quote: 'Sẹo rỗ lâu năm nhưng sau 5 buổi laser, da phẳng hơn rõ rệt. Tôi không ngờ hiệu quả lại nhanh như vậy.',
    name: 'Trúc Lam', age: 27, branch: 'Chi nhánh Quận 10',
    letter: 'T', bg: '#fee2e2', fg: '#991b1b',
    programIds: ['laser-scar-treatment'],
  },
  {
    quote: 'Tôi lo laser sẽ đau lắm nhưng thực ra chỉ hơi nóng nhẹ. Da hồng khoảng 1 ngày rồi bình thường, không cần nghỉ làm.',
    name: 'Ngọc Hân', age: 23, branch: 'Chi nhánh Tân Bình',
    letter: 'N', bg: '#fce7f3', fg: '#9d174d',
    programIds: ['laser-scar-treatment'],
  },

  // ─── Lăn kim phục hồi ───────────────────────────────────────────────────────
  {
    quote: 'Lăn kim để phục hồi hàng rào da sau thời gian dùng kem corticoid. 5 buổi da ít kích ứng hơn hẳn, bắt đầu ổn định.',
    name: 'Thảo Nguyên', age: 26, branch: 'Chi nhánh Gò Vấp',
    letter: 'T', bg: '#dcfce7', fg: '#166534',
    programIds: ['microneedling-repair'],
  },
  {
    quote: 'Da tôi khô và thô ráp, sau lăn kim 4 buổi mịn màng hơn rõ, thâm cũng dần mờ. Không bị đau hay sưng nhiều.',
    name: 'Mai Chi', age: 21, branch: 'Chi nhánh Quận 7',
    letter: 'M', bg: '#e0f2fe', fg: '#075985',
    programIds: ['microneedling-repair'],
  },

  // ─── Lấy nhân mụn ───────────────────────────────────────────────────────────
  {
    quote: 'Mụn nội tiết vùng cằm và quai hàm rất nhiều. Sau liệu trình, da sạch hơn thấy rõ và không để lại sẹo như mấy chỗ trước tôi làm.',
    name: 'Ngọc Anh', age: 23, branch: 'Chi nhánh Phú Nhuận',
    letter: 'N', bg: '#ede9fe', fg: '#5b21b6',
    programIds: ['hormonal-acne-plan'],
  },
  {
    quote: 'Không ép uống thuốc, không bán thêm. Bác sĩ giải thích rõ nguyên nhân mụn nội tiết rồi mới làm. Da tốt lên thật sự sau liệu trình.',
    name: 'Bảo Châu', age: 28, branch: 'Chi nhánh Bình Thạnh',
    letter: 'B', bg: '#fce7f3', fg: '#9d174d',
    programIds: ['hormonal-acne-plan'],
  },

  // ─── Chăm sóc da trắng sáng ─────────────────────────────────────────────────
  {
    quote: 'Sau khi trị mụn xong, tôi làm thêm gói dưỡng sáng. Thâm mờ nhanh hơn nhiều so với tự dùng serum ở nhà.',
    name: 'Khánh Ly', age: 22, branch: 'Chi nhánh Quận 3',
    letter: 'K', bg: '#fef9c3', fg: '#854d0e',
    programIds: ['maintenance-skin-health'],
  },
  {
    quote: 'Da đều màu hơn sau 3 buổi, không còn vùng sậm vùng sáng không đều như trước. Thủ thuật nhẹ nhàng, không cần nghỉ dưỡng.',
    name: 'Mỹ Linh', age: 28, branch: 'Chi nhánh Bình Thạnh',
    letter: 'M', bg: '#e0f2fe', fg: '#075985',
    programIds: ['maintenance-skin-health'],
  },

  // ─── Trẻ hóa & thu nhỏ lỗ chân lông ────────────────────────────────────────
  {
    quote: 'Lỗ chân lông vùng mũi và cằm to, tôi tự ti lâu năm. Sau 6 buổi nhìn bé lại rõ, da mịn hơn nhiều. Rất hài lòng.',
    name: 'Hoàng Yến', age: 30, branch: 'Chi nhánh Quận 1',
    letter: 'H', bg: '#d1fae5', fg: '#065f46',
    programIds: ['treatment-tighten-pores'],
  },
  {
    quote: 'Kết hợp trẻ hóa da + thu nhỏ lỗ chân lông, da tôi sáng ra và săn chắc hơn rõ rệt sau mỗi buổi.',
    name: 'Thu Minh', age: 25, branch: 'Chi nhánh Thủ Đức',
    letter: 'T', bg: '#f0fdf4', fg: '#166534',
    programIds: ['treatment-tighten-pores'],
  },
];

export function getTestimonialsForPrograms(programIds: string[]): Testimonial[] {
  const matched = TESTIMONIALS.filter(t =>
    t.programIds.some(pid => programIds.includes(pid))
  );
  if (matched.length >= 3) return matched.slice(0, 3);
  const fallback = TESTIMONIALS.filter(t =>
    !t.programIds.some(pid => programIds.includes(pid))
  );
  return [...matched, ...fallback].slice(0, 3);
}
