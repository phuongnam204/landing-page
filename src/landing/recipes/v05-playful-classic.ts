import type { Recipe } from '../validateRecipe';

export const v05PlayfulClassic: Recipe = {
  id: 'v05-playful-classic',
  label: 'v05 — Playful Blossom / Classic',
  theme: 'cotton-candy',
  slots: {
    hook: 'playful-classic-photo',
    minigame: 'electric-soft-swipe',
    payoff: 'playful-classic',
    programs: 'playful-classic',
    conversion: 'playful-classic',
    done: 'playful-classic',
  },
  copy: {
    hook: {
      badge:         'Phân tích da nhanh',
      heading:       'Mọi làn da đẹp',
      headingAccent: 'đều bắt đầu từ hiểu đúng.',
      subtext:       'Phân tích tình trạng da trong 30 giây — nhận phác đồ cá nhân hoá, không cần đoán mò.',
      cta:           'Khám phá ngay',
      hookImage:     '/image-hook/Picture6.jpg',
    },
    minigame: {
      intro: {
        heading: 'Da bạn đang như thế nào?',
        subtext:  'Xoay bánh xe để duyệt, chạm vào thẻ ở giữa để chọn.',
      },
      wheel: {
        heading: 'Vuốt sang phải để lựa chọn tình trạng da của bạn',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Tìm ra rồi — da bạn đang cần được chú ý đúng cách.',
        positive: 'Và chúng tôi có giải pháp phù hợp cho bạn.',
      },
    },
  },
};
