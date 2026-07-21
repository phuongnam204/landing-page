import type { Recipe } from '../validateRecipe';

export const v25PlayfulCottonCandy: Recipe = {
  id: 'v25-playful-cotton-candy',
  label: 'v25 — Playful Cotton Candy',
  theme: 'cotton-candy',
  slots: {
    hook:       'playful-classic',
    minigame:   'story-day',
    payoff:     'confetti-card-why-video-split',
    programs:   'playful-classic',
    conversion: 'playful-classic',
    done:       'playful-classic',
  },
  copy: {
    hook: {
      badge:         'Story của da bạn',
      heading:       'Mỗi ngày da bạn',
      headingAccent: 'đều có một câu chuyện.',
      subtext:       'Kể cho chúng tôi nghe ngày hôm nay của bạn — chúng tôi sẽ tìm giải pháp đúng nhất.',
      cta:           'Kể câu chuyện của tôi',
    },
    minigame: {
      intro: {
        heading: 'Hôm nay của bạn như thế nào?',
        subtext:  'Chọn cảnh huống đúng nhất — chúng tôi sẽ đọc từng khoảnh khắc.',
        cta:      'Bắt đầu kể',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã nghe hết câu chuyện của bạn.',
        positive: 'Và biết chính xác điều da bạn cần ngay lúc này.',
      },
    },
  },
};
