export type TrackEventName =
  | 'interactive_core_view'
  | 'minigame_complete'
  | 'payoff_view'
  | 'form_submit'
  | 'socialproof_view'
  | 'programs_faq_view'
  | 'faq_item_open'
  | 'program_detail_open'
  | 'conversion_social_view'
  | 'program_selected'
  | 'programs_journey_continue'
  | 'programs_commitment'
  | 'expert_handoff_continue'
  | 'teaser_book'
  | 'teaser_skip'
  | 'path_chosen';

export function trackEvent(name: TrackEventName, payload: Record<string, unknown> = {}): void {
  console.log(`[track] ${name}`, payload);
}
