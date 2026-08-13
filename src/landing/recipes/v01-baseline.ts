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
      skipIntro: true,
      wheel: {
        heading: 'Da bạn hiện tại bị tình trạng nào?',
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
