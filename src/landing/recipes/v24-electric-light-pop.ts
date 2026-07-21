import type { Recipe } from '../validateRecipe';

export const v24ElectricLightPop: Recipe = {
  id: 'v24-electric-light-pop',
  label: 'v24 — Electric Magenta / Light Pop',
  theme: 'jade',
  slots: {
    hook:       'electric-light-pop',
    minigame:   'electric-light-pop',
    payoff:     'electric-light-pop',
    programs:   'electric-light-pop',
    conversion: 'electric-light-pop',
    done:       'electric-light-pop',
  },
  copy: {
    hook: {
      badge:         'Phân tích da tươi sáng',
      heading:       'Da sáng, khoẻ',
      headingAccent: 'bắt đầu từ bước đầu đúng.',
      subtext:       'Một vài câu hỏi nhanh — để biết chính xác da bạn cần gì ngay bây giờ.',
      cta:           'Bắt đầu phân tích',
    },
    minigame: {
      intro: {
        heading: 'Da bạn đang gặp điều gì?',
        subtext:  'Chọn nhanh — để chúng tôi phân tích và đưa ra hướng đi ngay.',
        cta:      'Chọn ngay',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định được điều da bạn cần cải thiện.',
        positive: 'Có một hướng đi tươi sáng hơn đang chờ bạn.',
      },
    },
  },
};
