import type { Recipe } from '../validateRecipe';

export const v03Facemap: Recipe = {
  id: 'v03-facemap',
  label: 'Face-map tự khai + ocean',
  theme: 'opal',
  slots: {
    hook:       'bold-single',
    minigame:   'skin-scan-chat',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
  copy: {
    hook: {
      badge:         'Soi da AI',
      heading:       'Hãy để da bạn',
      headingAccent: 'tự kể câu chuyện của nó.',
      subtext:       'Mô tả tình trạng da bằng lời — AI sẽ phân tích và tìm đúng vấn đề cho bạn.',
      cta:           'Bắt đầu soi da',
    },
    minigame: {
      intro: {
        heading: 'Mô tả da bạn đang gặp phải',
        subtext:  'Cứ tự nhiên — chúng tôi sẽ đọc và phân tích ngay lập tức.',
        cta:      'Bắt đầu',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định được vấn đề từ mô tả của bạn.',
        positive: 'Và có hướng điều trị rõ ràng phù hợp với bạn.',
      },
    },
  },
};
