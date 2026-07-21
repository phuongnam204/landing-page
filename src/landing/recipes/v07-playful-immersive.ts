import type { Recipe } from '../validateRecipe';

export const v07PlayfulImmersive: Recipe = {
  id: 'v07-playful-immersive',
  label: 'v07 — Playful Blossom / Immersive',
  theme: 'berry',
  slots: {
    hook:       'playful-immersive-photo',
    minigame:   'playful-immersive',
    payoff:     'confetti-card-why-video-split',
    programs:   'playful-immersive',
    conversion: 'playful-immersive',
    done:       'playful-immersive',
  },
  copy: {
    hook: {
      badge:         'Phân tích da chuyên sâu',
      heading:       'Da bạn đang',
      headingAccent: 'cố gắng nói điều gì đó.',
      subtext:       'Mụn, dầu, lỗ chân lông — mỗi dấu hiệu đều có nghĩa. Hãy cùng giải mã.',
      cta:           'Giải mã da ngay',
    },
    minigame: {
      intro: {
        heading: 'Dấu hiệu nào đang xuất hiện trên da bạn?',
        subtext:  'Chọn chính xác — kết quả phân tích sẽ sâu hơn nhiều.',
        cta:      'Phân tích',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Da bạn đang gửi tín hiệu cần được xử lý.',
        positive: 'Chúng tôi đọc được — và có phác đồ phù hợp cho bạn.',
      },
    },
  },
};
