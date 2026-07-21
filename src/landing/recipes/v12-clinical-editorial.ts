import type { Recipe } from '../validateRecipe';

export const v12ClinicalEditorial: Recipe = {
  id: 'v12-clinical-editorial',
  label: 'v12 — Clinical Ocean / Editorial',
  theme: 'periwinkle',
  slots: {
    hook: 'clinical-editorial',
    minigame: 'clinical-editorial',
    payoff: 'clinical-editorial',
    programs: 'clinical-editorial',
    conversion: 'clinical-editorial',
    done: 'clinical-editorial',
  },
  copy: {
    hook: {
      badge:         'Chuyên mục da mặt',
      heading:       'Tại sao da bạn',
      headingAccent: 'chưa ổn dù đã cố gắng?',
      subtext:       'Có những điều về da mà không có sản phẩm nào trên thị trường nói với bạn.',
      cta:           'Tìm hiểu ngay',
      hookImage:     '/face-map-v2/face-map-hook-1.svg',
    },
    minigame: {
      intro: {
        heading: 'Da bạn đang gặp vấn đề gì?',
        subtext:  'Chọn tình trạng để chúng tôi phân tích sâu hơn cho bạn.',
        cta:      'Tiếp theo',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã tìm ra điều đằng sau tình trạng da đó.',
        positive: 'Và có câu trả lời thực sự đang chờ bạn.',
      },
    },
  },
};
