import type { Recipe } from '../validateRecipe';

export const v08NavyMint: Recipe = {
  id: 'v08-navy-mint',
  label: 'v08 — Navy × Mint',
  theme: 'navy-mint',
  chipColor: { bg: '#2D2640', text: '#8FE3BC', label: 'Navy × Mint' },
  slots: {
    hook: 'playful-dark-accent',
    minigame: 'playful-dark-accent',
    payoff: 'playful-dark-accent',
    programs: 'playful-dark-accent',
    conversion: 'playful-dark-accent',
    done: 'playful-dark-accent',
  },
  copy: {
    hook: {
      badge:         'Phác đồ cá nhân hoá',
      heading:       'Không phải ai cũng',
      headingAccent: 'có cùng vấn đề về da.',
      subtext:       'Tình trạng da của bạn là duy nhất. Giải pháp cũng phải vậy.',
      cta:           'Tìm giải pháp của tôi',
      hookImage:     '/face-map-v1/face-map-hook-2.svg',
    },
    minigame: {
      intro: {
        heading: 'Tình trạng da của bạn là gì?',
        subtext:  'Câu trả lời của bạn quyết định phác đồ điều trị.',
        cta:      'Bắt đầu phân tích',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định được vấn đề cốt lõi.',
        positive: 'Phác đồ phù hợp đang được chuẩn bị cho bạn.',
      },
    },
  },
};
