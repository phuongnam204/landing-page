import type { Recipe } from '../validateRecipe';

export const v18BoldStacked: Recipe = {
  id: 'v18-bold-stacked',
  label: 'v18 — Bold Golden / Stacked',
  theme: 'rose-vivid',
  slots: {
    hook:       'bold-stacked',
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
      heading:       'Da bạn.',
      headingAccent: 'Vấn đề thật. Giải pháp thật.',
      subtext:       'Không quảng cáo thêm. Chỉ cần xác định đúng — và xử lý đúng.',
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
