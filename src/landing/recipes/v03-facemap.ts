import type { Recipe } from '../validateRecipe';

export const v03Facemap: Recipe = {
  id: 'v03-facemap',
  label: 'Face-map tự khai + ocean',
  theme: 'opal',
  slots: {
    hook:       'bold-single',
    minigame:   'skin-scan-chat',
    payoff:     'confetti-card-why-circles-quad',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info-with-video',
  },
};
