import type { Recipe } from '../validateRecipe';

export const v09ClinicalClassic: Recipe = {
  id: 'v09-clinical-classic',
  label: 'v09 — Clinical Ocean / Classic',
  theme: 'ocean',
  slots: {
    hook: 'clinical-classic',
    minigame: 'clinical-classic',
    payoff: 'clinical-classic',
    programs: 'clinical-classic',
    conversion: 'clinical-classic',
    done: 'clinical-classic',
  },
  copy: {
    hook: {
      badge:         'Chẩn đoán lâm sàng',
      heading:       'Điều trị mụn hiệu quả',
      headingAccent: 'bắt đầu từ chẩn đoán đúng.',
      subtext:       'Không phải thử sản phẩm cho đến khi tìm được — là xác định nguyên nhân ngay từ đầu.',
      cta:           'Bắt đầu chẩn đoán',
    },
    minigame: {
      intro: {
        heading: 'Cho chúng tôi biết tình trạng da của bạn',
        subtext:  'Thông tin càng chính xác, hướng điều trị càng phù hợp.',
        cta:      'Tiếp theo',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã xác định được tình trạng da của bạn.',
        positive: 'Và có phác đồ điều trị phù hợp đang chờ.',
      },
    },
  },
};
