import type { Recipe } from '../validateRecipe';

export const v17BoldClassic: Recipe = {
  id: 'v17-bold-classic',
  label: 'v17 — Bold Golden / Classic',
  theme: 'golden',
  slots: {
    hook:         'editorial-gallery',
    teaserPayoff: 'bold-classic',
    minigame:     'bold-classic',
    payoff:       'bold-classic',
    programs:     'bold-classic',
    conversion:   'bold-classic',
    done:         'bold-classic',
  },
  copy: {
    hook: {
      badge:         '',
      heading:       'Da bạn',
      headingAccent: 'có bản đồ riêng.',
      subtext:       'Mỗi loại mụn có một lý do khác nhau. Tìm đúng lý do, chọn đúng cách điều trị.',
      cta:           'Xác định nguyên nhân',
    },
    minigame: {
      intro: {
        heading: 'Mụn đang xuất hiện ở vùng nào?',
        subtext:  'Chỉ ra vùng da trên bản đồ — chúng tôi phân tích và đưa ra hướng xử lý phù hợp.',
        cta:      'Chọn vùng da',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định được nguyên nhân cụ thể.',
        positive: 'Và có giải pháp điều trị phù hợp cho bạn.',
      },
    },
    teaserPayoff: {
      heading:       'Chọn đúng vùng da —',
      headingAccent: 'nhận ngay phác đồ điều trị riêng!',
      subtext:       'Chỉ ra vùng mụn trên bản đồ da mặt. Hệ thống phân tích và gợi ý liệu trình điều trị phù hợp ngay sau đó — miễn phí.',
      cta:           'Xác định ngay →',
    },
  },
};
