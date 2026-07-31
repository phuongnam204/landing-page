import type { Recipe } from '../validateRecipe';

export const v27PlayfulStory: Recipe = {
  id: 'v27-playful-story',
  label: 'v27 — Playful Story (TikTok Slides)',
  theme: 'lilac',
  slots: {
    hook:       'playful-minimal',
    minigame:   'playful-story',
    payoff:     'playful-minimal',
    programs:   'playful-minimal',
    conversion: 'playful-minimal',
    done:       'playful-minimal',
  },
  copy: {
    hook: {
      badge:         'Chăm da đúng cách',
      heading:       'Làn da khoẻ',
      headingAccent: 'bắt đầu từ việc hiểu nó.',
      subtext:       'Hai câu hỏi thôi — để tìm ra điều da bạn thực sự cần.',
      cta:           'Bắt đầu',
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã có góc nhìn rõ hơn về da bạn.',
        positive: 'Và có một hướng đi phù hợp hơn đang chờ bạn.',
      },
    },
  },
};
