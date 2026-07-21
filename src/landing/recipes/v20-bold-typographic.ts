import type { Recipe } from '../validateRecipe';

export const v20BoldTypographic: Recipe = {
  id: 'v20-bold-typographic',
  label: 'v20 — Bold Golden / Typographic',
  theme: 'lilac',
  slots: {
    hook:       'bold-typographic',
    minigame:   'electric-soft-swipe',
    payoff:     'bold-typographic',
    programs:   'bold-typographic-commitment',
    conversion: 'bold-typographic',
    done:       'bold-typographic',
  },
  copy: {
    hook: {
      badge:         'Đọc — để hiểu da bạn',
      heading:       'Da bạn không nói bằng lời.',
      headingAccent: 'Nhưng chúng tôi đọc được.',
      subtext:       'Chọn đúng tình trạng — chúng tôi sẽ phân tích và trả lời bằng giải pháp cụ thể.',
      cta:           'Để chúng tôi đọc da bạn',
    },
    minigame: {
      intro: {
        heading: 'Tình trạng da bạn đang gặp?',
        subtext:  'Một lựa chọn — một phác đồ. Chọn đúng ngay từ đầu.',
        cta:      'Tiếp tục',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã đọc được điều da bạn đang nói.',
        positive: 'Và viết ra giải pháp phù hợp nhất cho bạn.',
      },
    },
  },
};
