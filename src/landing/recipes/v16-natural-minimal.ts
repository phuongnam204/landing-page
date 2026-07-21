import type { Recipe } from '../validateRecipe';

export const v16NaturalMinimal: Recipe = {
  id: 'v16-natural-minimal',
  label: 'v16 — Natural Sage / Minimal',
  theme: 'matcha',
  slots: {
    hook:       'natural-minimal',
    minigame:   'story-day',
    payoff:     'natural-minimal',
    programs:   'natural-minimal',
    conversion: 'natural-minimal',
    done:       'natural-minimal',
  },
  copy: {
    hook: {
      badge:         'Một ngày cùng da bạn',
      heading:       'Hiểu đúng da bạn',
      headingAccent: 'qua một ngày',
      subtext:       'Chúng tôi sẽ theo bạn qua một ngày để hiểu đúng tình trạng da của bạn.',
      cta:           'Bắt đầu hành trình',
      hookImage:     '/face-map-v1/face-map-hook-2.svg',
    },
    minigame: {
      intro: {
        heading: 'Hôm nay da bạn thế nào?',
        subtext:  'Chọn cảnh huống gần nhất với ngày thường của bạn.',
        cta:      'Bắt đầu',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã thấy rõ câu chuyện da của bạn.',
        positive: 'Và biết chính xác bước tiếp theo phù hợp cho bạn.',
      },
    },
  },
};
