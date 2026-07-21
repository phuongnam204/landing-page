import type { Recipe } from '../validateRecipe';

export const v01Baseline: Recipe = {
  id: 'v01-baseline',
  label: 'v01 — Facemap + blossom + v04 workflow',
  theme: 'blossom',
  slots: {
    hook:         'two-column',
    teaserPayoff: 'bold-classic',
    minigame:     'electric-soft-swipe',
    payoff:       'confetti-card-why',
    programs:     'grid-with-faq',
    conversion:   'short-form-with-testimonials',
    done:         'contact-info-with-video',
  },
  copy: {
    hook: {
      badge:         'Phân tích da miễn phí',
      heading:       'Da bạn đang cần',
      headingAccent: 'một giải pháp đúng.',
      subtext:       'Không phải dùng thêm sản phẩm — là tìm đúng nguyên nhân da bạn chưa khoẻ.',
      cta:           'Phân tích da ngay',
    },
    minigame: {
      intro: {
        heading: 'Da bạn đang gặp vấn đề gì?',
        subtext:  'Vuốt qua các thẻ để tìm tình trạng gần nhất với bạn.',
        cta:      'Bắt đầu',
      },
      wheel: {
        heading: 'Vuốt để duyệt, nhấn để chọn',
      },
    },
    payoff: {
      resultCard: {
        concern:  'Chúng tôi đã hiểu vấn đề của bạn.',
        positive: 'Và có hướng xử lý phù hợp đang chờ bạn.',
      },
    },
    teaserPayoff: {
      heading:       'Vuốt qua tình trạng da —',
      headingAccent: 'nhận ngay phác đồ cho riêng mình!',
      subtext:       'Vuốt qua các thẻ để chọn tình trạng gần nhất với bạn. Phác đồ cá nhân hóa sẽ chờ bạn ngay sau khi xong — miễn phí.',
      cta:           'Bắt đầu khám phá →',
    },
  },
};
