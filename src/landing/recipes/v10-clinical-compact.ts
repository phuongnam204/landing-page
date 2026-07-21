import type { Recipe } from '../validateRecipe';

export const v10ClinicalCompact: Recipe = {
  id: 'v10-clinical-compact',
  label: 'v10 — Clinical Ocean / Compact',
  theme: 'ice',
  slots: {
    hook:       'clinical-compact',
    minigame:   'clinical-compact',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'clinical-compact',
    conversion: 'clinical-compact',
    done:       'clinical-compact',
  },
  copy: {
    hook: {
      badge:         'Phân tích da nhanh',
      heading:       'Vấn đề da của bạn',
      headingAccent: 'có nguyên nhân cụ thể.',
      subtext:       '30 giây để xác định — thay vì nhiều tháng thử sản phẩm.',
      cta:           'Phân tích ngay',
      hookImage:     '/face-map-v2/face-map-hook-1.svg',
    },
    minigame: {
      intro: {
        heading: 'Chọn tình trạng da của bạn',
        subtext:  'Chọn điều gần nhất với tình trạng bạn đang gặp.',
        cta:      'Tiếp tục',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Vấn đề đã được xác định rõ.',
        positive: 'Có hướng điều trị cụ thể cho bạn.',
      },
    },
  },
};
