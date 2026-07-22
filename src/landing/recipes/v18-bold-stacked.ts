import type { Recipe } from '../validateRecipe';

export const v18BoldStacked: Recipe = {
  id: 'v18-bold-stacked',
  label: 'v18 — Bold Rose / Stacked',
  theme: 'rose-vivid',
  slots: {
    hook:       'editorial-portrait',
    minigame:   'bold-stacked',
    payoff:     'bold-stacked',
    programs:   'bold-stacked',
    conversion: 'bold-stacked',
    done:       'bold-stacked',
    pathChooser: 'bold-stacked',
  },
  copy: {
    hook: {
      badge:         'Phân tích da tức thì',
      heading:       'Dùng đủ thứ',
      headingAccent: 'vẫn nổi mụn?',
      subtext:       'Không phải sản phẩm sai — có thể là chưa đúng nguyên nhân. Chúng tôi giúp bạn tìm ra.',
      cta:           'Bắt đầu ngay',
    },
    minigame: {
      intro: {
        heading: 'Vấn đề da của bạn là gì?',
        subtext:  'Chọn thẳng — chúng tôi sẽ trả lời thẳng.',
        cta:      'Chọn ngay',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Rõ rồi — đây là vấn đề thật của bạn.',
        positive: 'Và đây là hướng xử lý dành cho bạn.',
      },
    },
  },
};
