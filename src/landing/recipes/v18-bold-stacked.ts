import type { Recipe } from '../validateRecipe';

export const v18BoldStacked: Recipe = {
  id: 'v18-bold-stacked',
  label: 'v18 — Bold Rose / Stacked',
  theme: 'rose-vivid',
  slots: {
    hook:       'editorial-portrait',
    minigame:   'bold-stacked',
    payoff:     'confetti-card-why-circles-video',
    programs:   'bold-stacked',
    conversion: 'bold-stacked',
    done:       'bold-stacked',
    pathChooser: 'bold-stacked',
  },
  copy: {
    hook: {
      badge:         'Phân tích da cá nhân',
      heading:       'Da bạn xứng đáng',
      headingAccent: 'được hiểu đúng hơn.',
      subtext:       'Không cần thêm sản phẩm — cần đúng hướng. Chúng tôi giúp bạn tìm ra điều da mình thực sự cần.',
      cta:           'Tìm hiểu ngay',
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
