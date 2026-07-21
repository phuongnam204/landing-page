import type { Recipe } from '../validateRecipe';

export const v22ElectricGlowHeavy: Recipe = {
  id: 'v22-electric-glow-heavy',
  label: 'v22 — Electric Magenta / Glow Heavy',
  theme: 'crimson',
  slots: {
    hook:       'electric-glow-heavy',
    minigame:   'electric-glow-scratch',
    payoff:     'electric-glow-heavy',
    conversion: 'electric-glow-heavy',
    done:       'electric-glow-heavy',
  },
  copy: {
    hook: {
      badge:         'Phân tích da chuyên sâu',
      heading:       'Da bạn đang cầu cứu',
      headingAccent: 'hay chỉ bạn không để ý?',
      subtext:       'Cào lên để xem điều da bạn đang thực sự cần — câu trả lời ngay phía dưới.',
      cta:           'Cào xem ngay',
    },
    minigame: {
      intro: {
        heading: 'Điều gì đang xảy ra với da bạn?',
        subtext:  'Cào thẻ để tiết lộ tình trạng — và tìm ra hướng đi.',
        cta:      'Cào ngay',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Bức màn đã được vén lên — đây là vấn đề của bạn.',
        positive: 'Và chúng tôi có hướng xử lý phù hợp ngay lập tức.',
      },
    },
  },
};
