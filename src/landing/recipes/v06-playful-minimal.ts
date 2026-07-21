import type { Recipe } from '../validateRecipe';

export const v06PlayfulMinimal: Recipe = {
  id: 'v06-playful-minimal',
  label: 'v06 — Playful Blossom / Minimal',
  theme: 'lilac',
  slots: {
    hook: 'playful-minimal',
    minigame: 'playful-minimal',
    payoff: 'playful-minimal',
    programs: 'playful-minimal',
    conversion: 'playful-minimal',
    done: 'playful-minimal',
  },
  copy: {
    hook: {
      badge:         'Chăm da đúng cách',
      heading:       'Làn da khoẻ',
      headingAccent: 'bắt đầu từ việc hiểu nó.',
      subtext:       'Một bài test nhỏ — để tìm ra điều da bạn thực sự cần được chú ý.',
      cta:           'Bắt đầu',
    },
    minigame: {
      intro: {
        heading: 'Tình trạng da của bạn hiện tại?',
        subtext:  'Chọn điều gần đúng nhất — không cần hoàn hảo.',
        cta:      'Tiếp tục',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã có góc nhìn rõ hơn về da bạn.',
        positive: 'Và có một hướng đi phù hợp hơn đang chờ bạn.',
      },
    },
  },
};
