import type { Recipe } from '../validateRecipe';

export const v14NaturalSpa: Recipe = {
  id: 'v14-natural-spa',
  label: 'v14 — Natural Sage / Spa',
  theme: 'dusty-rose',
  slots: {
    hook:          'natural-spa',
    minigame:      'natural-spa',
    payoff:        'confetti-card-why-video-split',
    programs:      'natural-spa',
    conversion:    'natural-spa',
    done:          'natural-spa',
    expertHandoff: 'natural-spa',
  },
  copy: {
    hook: {
      badge:         'Liệu trình spa tại nhà',
      heading:       'Da bạn xứng đáng',
      headingAccent: 'được chăm sóc đúng cách.',
      subtext:       'Không phải hy sinh — là tìm ra liệu trình phù hợp nhất với làn da của bạn.',
      cta:           'Tìm liệu trình của tôi',
    },
    minigame: {
      intro: {
        heading: 'Da bạn đang cần điều gì nhất?',
        subtext:  'Hãy chia sẻ với chúng tôi — để chúng tôi tìm liệu trình phù hợp nhất.',
        cta:      'Bắt đầu',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã hiểu nhu cầu của làn da bạn.',
        positive: 'Và có liệu trình được thiết kế riêng cho bạn.',
      },
    },
  },
};
