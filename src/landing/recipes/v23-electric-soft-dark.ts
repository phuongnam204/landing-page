import type { Recipe } from '../validateRecipe';

export const v23ElectricSoftDark: Recipe = {
  id: 'v23-electric-soft-dark',
  label: 'v23 — Electric Magenta / Soft Dark',
  theme: 'periwinkle',
  slots: {
    hook:       'electric-soft-dark',
    minigame:   'electric-soft-swipe',
    payoff:     'electric-soft-dark',
    programs:   'electric-soft-dark',
    conversion: 'electric-soft-dark',
    done:       'electric-soft-dark',
  },
  copy: {
    hook: {
      heading:       'Da bạn chưa khỏi hẳn?',
      headingAccent: 'Cùng tìm hiểu nguyên nhân nhé!',
      cta:           'Bắt đầu →',
    },
    minigame: {
      intro: {
        heading: 'Cho chúng tôi biết tình trạng da của bạn nha!',
        subtext: 'Xoay bánh xe để duyệt, chạm vào thẻ ở giữa để chọn.',
      },
      wheel: {
        heading: 'Vuốt sang phải để lựa chọn tình trạng da của bạn',
      },
    },
    payoff: {
      resultCard: {
        concern: 'Hmm, da của bạn đang cần được chú ý...',
      },
    },
  },
};
