import type { Recipe } from '../validateRecipe';

export const v15NaturalEditorial: Recipe = {
  id: 'v15-natural-editorial',
  label: 'v15 — Natural Sage / Editorial',
  theme: 'cherry-jp',
  slots: {
    hook:       'natural-editorial',
    minigame:   'natural-editorial',
    payoff:     'natural-editorial',
    programs:   'natural-editorial-journey',
    conversion: 'natural-editorial',
    done:       'natural-editorial',
  },
  copy: {
    hook: {
      badge:         'Biên tập: chăm da',
      heading:       'Quy trình chăm da của bạn',
      headingAccent: 'cần được biên tập lại.',
      subtext:       'Ít bước hơn, đúng bước hơn — bắt đầu từ việc hiểu đúng tình trạng da.',
      cta:           'Biên tập quy trình của tôi',
    },
    minigame: {
      intro: {
        heading: 'Tình trạng da chính của bạn là gì?',
        subtext:  'Chọn đúng — để chúng tôi biên tập lại quy trình phù hợp nhất.',
        cta:      'Tiếp tục',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định điểm cần chỉnh trong quy trình của bạn.',
        positive: 'Và có một phác đồ tinh gọn hơn, hiệu quả hơn.',
      },
    },
  },
};
