export type TrackEventName =
  | 'interactive_core_view'
  | 'quiz_complete'
  | 'payoff_view'
  | 'form_submit';

export function trackEvent(name: TrackEventName, payload: Record<string, unknown> = {}): void {
  console.log(`[track] ${name}`, payload);
}
