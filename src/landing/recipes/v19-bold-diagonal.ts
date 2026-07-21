import type { Recipe } from '../validateRecipe';

export const v19BoldDiagonal: Recipe = {
  id: 'v19-bold-diagonal',
  label: 'v19 — Bold Golden / Diagonal',
  theme: 'tropical',
  slots: {
    hook:       'bold-diagonal',
    minigame:   'electric-light-pop',
    payoff:     'bold-diagonal',
    programs:   'bold-diagonal',
    conversion: 'bold-diagonal',
    done:       'bold-diagonal',
  },
  copy: {
    hook: {
      badge:         'Chẩn đoán vùng da',
      heading:       'Làn da của bạn',
      headingAccent: 'xứng đáng hơn thế này.',
      subtext:       'Tìm đúng vấn đề — xử lý đúng cách. Bắt đầu bằng 30 giây phân tích.',
      cta:           'Phân tích da tôi',
    },
    minigame: {
      intro: {
        heading: 'Da bạn đang gặp điều gì?',
        subtext:  'Chọn tình trạng đúng nhất — kết quả sẽ chính xác hơn.',
        cta:      'Tiếp theo',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã tìm ra điều da bạn đang cần.',
        positive: 'Và có cách để da bạn thật sự khoẻ hơn.',
      },
    },
  },
};
