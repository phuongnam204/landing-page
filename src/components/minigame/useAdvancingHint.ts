import { useEffect, useRef, useState } from 'react';
import { HINT_ESCALATE_MS, SAFETY_NET_MS } from './gameConstants';

/**
 * Theo dõi thời gian kể từ tiến triển gần nhất trong 1 pha.
 * - `showInitialHint`: true cho đến khi user tương tác lần đầu (markInteracted).
 * - `escalate`: true khi kẹt quá HINT_ESCALATE_MS (highlight lại đối tượng).
 * - Gọi `onSafetyNet` một lần khi kẹt quá SAFETY_NET_MS.
 * Gọi `markProgress()` mỗi lần hoàn thành 1 đối tượng để reset đồng hồ.
 */
export function useAdvancingHint(onSafetyNet: () => void) {
  const [showInitialHint, setShowInitialHint] = useState(true);
  const [escalate, setEscalate] = useState(false);
  const lastProgressRef = useRef(Date.now());
  const firedRef = useRef(false);
  const onSafetyNetRef = useRef(onSafetyNet);
  onSafetyNetRef.current = onSafetyNet;

  useEffect(() => {
    const timer = setInterval(() => {
      if (firedRef.current) return;
      const elapsed = Date.now() - lastProgressRef.current;
      if (elapsed >= SAFETY_NET_MS) {
        firedRef.current = true;
        onSafetyNetRef.current();
      } else if (elapsed >= HINT_ESCALATE_MS) {
        setEscalate(true);
      }
    }, 500);
    return () => clearInterval(timer);
  }, []);

  function markInteracted() {
    setShowInitialHint(false);
  }
  function markProgress() {
    lastProgressRef.current = Date.now();
    setEscalate(false);
  }

  return { showInitialHint, escalate, markInteracted, markProgress };
}
