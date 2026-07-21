import type { Recipe } from '../validateRecipe';

export const v21ElectricClassic: Recipe = {
  id: 'v21-electric-classic',
  label: 'v21 — Electric Magenta / Classic',
  theme: 'magenta',
  slots: {
    hook:       'electric-classic',
    minigame:   'face-map',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'electric-classic',
    conversion: 'electric-classic',
    done:       'electric-classic',
  },
  copy: {
    hook: {
      badge:         'Bản đồ vùng da',
      heading:       'Mụn của bạn',
      headingAccent: 'có bản đồ riêng.',
      subtext:       'Vị trí mụn tiết lộ nguyên nhân — bản đồ da giúp bạn hiểu đúng hơn.',
      cta:           'Soi bản đồ da',
    },
    minigame: {
      intro: {
        heading: 'Mụn của bạn thường xuất hiện ở đâu?',
        subtext:  'Chỉ vào vùng da trên bản đồ để bắt đầu phân tích.',
        cta:      'Bắt đầu',
      },
      faceMap: {
        heading: 'Chọn vùng da đang có vấn đề',
        subtext:  'Có thể chọn nhiều vùng cùng lúc',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Vùng mụn đó đang tiết lộ điều gì đó quan trọng.',
        positive: 'Chúng tôi đã giải mã và có hướng xử lý đúng.',
      },
    },
  },
};
