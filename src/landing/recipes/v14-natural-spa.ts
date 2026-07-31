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
      heading:       'Da bạn nhạy cảm ?',
      headingAccent: 'không cần sống chung mãi với nó.',
      subtext:       'Chỉ cần lớp bảo vệ được phục hồi đúng cách, da sẽ ngừng phản ứng quá mức — và bạn không còn phải lo lắng nữa.',
      cta:           'Tìm giải pháp cho da tôi',
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
