import type { Recipe } from '../validateRecipe';

export const v04Combined: Recipe = {
  id: 'v04-combined',
  label: 'v04 — Programs+FAQ / Conversion+Testimonial',
  theme: 'coral',
  slots: {
    hook:        'playful-circle-blob',
    pathChooser: 'natural-editorial',
    minigame:    'face-map',
    payoff:      'confetti-card-why-video-split',
    programs:    'grid-with-faq',
    conversion:  'short-form-with-testimonials',
    done:        'contact-info-with-video',
  },
  copy: {
    hook: {
      badge:         '',
      heading:       'Hiểu đúng da,',
      headingAccent: 'mọi thứ thay đổi.',
      subtext:       'Bản đồ vùng mụn phân tích chính xác nguyên nhân — 60 giây để biết da bạn đang cần gì.',
      cta:           'Xem bản đồ da của tôi',
      hookImage:     '/image-hook/Picture7.jpg',
    },
    minigame: {
      conditionVariant: 'b',
      faceMap: {
        heading: 'Chọn vùng da đang có vấn đề',
        subtext:  'Có thể chọn nhiều vùng cùng lúc',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Vùng mụn đó đang tiết lộ điều gì đó quan trọng.',
        positive: 'Chúng tôi đọc được — và biết cách xử lý đúng hướng.',
      },
    },
  },
};
