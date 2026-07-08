import type { Recipe } from '../validateRecipe';

export const v04Combined: Recipe = {
  id: 'v04-combined',
  label: 'v04 — Programs+FAQ / Conversion+Testimonial',
  theme: 'ocean',
  slots: {
    hook:       'bold-single',
    minigame:   'face-map',
    payoff:     'confetti-card',
    programs:   'grid-with-faq',
    conversion: 'short-form-with-testimonials',
    done:       'contact-info',
  },
};
