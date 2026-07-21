import type { Recipe } from '../validateRecipe';

export const v13NaturalClassic: Recipe = {
  id: 'v13-natural-classic',
  label: 'v13 — Natural Sage / Classic',
  theme: 'sage',
  slots: {
    hook:       'natural-classic',
    minigame:   'story-day',
    payoff:     'natural-classic',
    programs:   'natural-classic',
    conversion: 'natural-classic',
    done:       'natural-classic',
  },
  copy: {
    hook: {
      badge:         'Chăm da từ gốc rễ',
      heading:       'Da khoẻ thật sự',
      headingAccent: 'đến từ bên trong.',
      subtext:       'Không chỉ che đi — là tìm và xử lý đúng nguyên nhân gốc rễ của vấn đề.',
      cta:           'Tìm nguyên nhân',
      hookImage:     '/face-map-v2/face-map-hook-2.svg',
    },
    minigame: {
      intro: {
        heading: 'Tình trạng da bạn muốn cải thiện?',
        subtext:  'Lắng nghe cơ thể — chọn điều da bạn đang cần được chú ý nhất.',
        cta:      'Tiếp theo',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định điều da bạn đang thiếu.',
        positive: 'Có một hướng tiếp cận tự nhiên và phù hợp cho bạn.',
      },
    },
  },
};
