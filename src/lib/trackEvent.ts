export type TrackEventName =
  | 'interactive_core_view'
  | 'minigame_complete'
  | 'payoff_view'
  | 'form_submit'
  | 'socialproof_view'
  | 'programs_faq_view'
  | 'faq_item_open'
  | 'conversion_social_view';

export function trackEvent(name: TrackEventName, payload: Record<string, unknown> = {}): void {
  console.log(`[track] ${name}`, payload);
}
