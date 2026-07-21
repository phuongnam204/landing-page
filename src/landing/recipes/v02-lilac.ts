import type { Recipe } from '../validateRecipe';

export const vPreviewWizard: Recipe = {
  id: 'v02-lilac',
  label: 'Lilac',
  theme: 'lilac',
  slots: {
    hook:         'face-dual',
    teaserPayoff: 'bold-classic',
    minigame:     'electric-soft-swipe',
    payoff:       'playful-immersive',
    programs:     'playful-immersive',
    conversion:   'playful-immersive',
    done:         'playful-immersive',
  },
  copy: {
    hook: {
      badge:         'Chẩn đoán da cá nhân',
      heading:       'Làn da bạn',
      headingAccent: 'xứng đáng được hiểu đúng.',
      subtext:       'Một bài test ngắn — để tìm ra điều da bạn thực sự cần được chú ý.',
      cta:           'Bắt đầu test',
    },
    minigame: {
      intro: {
        heading: 'Tình trạng da hiện tại của bạn?',
        subtext:  'Vuốt qua để khám phá — chọn điều đúng với bạn nhất.',
        cta:      'Khám phá ngay',
      },
      wheel: {
        heading: 'Vuốt để duyệt, nhấn để chọn',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã nhìn thấy rõ hơn về da của bạn.',
        positive: 'Có một hướng đi phù hợp đang chờ bạn.',
      },
    },
    teaserPayoff: {
      heading:       'Xoay để khám phá da —',
      headingAccent: 'nhận ngay phác đồ cho riêng mình!',
      subtext:       'Vuốt qua các thẻ tình trạng da. Phác đồ cá nhân hóa đang chờ bạn ngay khi xong — miễn phí.',
      cta:           'Khám phá ngay →',
    },
  },
};
