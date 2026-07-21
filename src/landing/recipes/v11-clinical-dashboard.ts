import type { Recipe } from '../validateRecipe';

export const v11ClinicalDashboard: Recipe = {
  id: 'v11-clinical-dashboard',
  label: 'v11 — Clinical Ocean / Dashboard',
  theme: 'ocean',
  slots: {
    hook: 'clinical-dashboard',
    minigame: 'electric-soft-swipe',
    payoff: 'clinical-dashboard',
    programs: 'clinical-dashboard',
    conversion: 'clinical-dashboard',
    done: 'clinical-dashboard',
  },
  copy: {
    hook: {
      badge:         'Dashboard da cá nhân',
      heading:       'Hiểu da bạn',
      headingAccent: 'như một chuyên gia.',
      subtext:       'Dữ liệu từ tình trạng da của bạn — phân tích tức thì, phác đồ tức thì.',
      cta:           'Mở dashboard da của tôi',
      hookImage:     '/face-map-v3/face-map-hook-1.svg',
    },
    minigame: {
      intro: {
        heading: 'Nhập tình trạng da của bạn',
        subtext:  'Chọn chính xác để hệ thống phân tích đúng nhất.',
        cta:      'Phân tích',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Phân tích hoàn tất — đây là kết quả của bạn.',
        positive: 'Hệ thống đã tìm được hướng điều trị phù hợp.',
      },
    },
  },
};
