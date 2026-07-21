import type { Recipe } from '../validateRecipe';

export const v04Combined: Recipe = {
  id: 'v04-combined',
  label: 'v04 — Programs+FAQ / Conversion+Testimonial',
  theme: 'coral',
  slots: {
    hook:       'bold-single',
    minigame:   'face-map',
    payoff:     'confetti-card-why-video-split',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
  copy: {
    hook: {
      badge:         'Bản đồ vùng mụn',
      heading:       'Mụn của bạn',
      headingAccent: 'không phải ngẫu nhiên.',
      subtext:       'Vị trí mụn tiết lộ nhiều hơn bạn nghĩ về nguyên nhân bên trong cơ thể.',
      cta:           'Xem bản đồ da của tôi',
    },
    minigame: {
      intro: {
        heading: 'Mụn của bạn hay mọc ở vùng nào?',
        subtext:  'Chỉ vào vùng da trên bản đồ — chúng tôi sẽ giải mã nguyên nhân.',
        cta:      'Bắt đầu chỉ',
      },
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
