'use client';
import { useEffect, useRef, type RefObject } from 'react';

// Touch-only vertical drag with axis locking. Mouse/trackpad is deliberately
// excluded: the carousel already owns horizontal pointer drag, and hijacking
// mouse-down on desktop would break text selection.

const AXIS_LOCK_PX    = 8;    // movement needed before we commit to an axis
const COMMIT_RATIO    = 0.28; // fraction of `distance` that counts as "far enough"
const COMMIT_VELOCITY = 0.5;  // px/ms — a fast flick commits regardless of distance
const FLICK_MIN_PX    = 12;   // ...but it still has to actually move
const BACK_DAMPING    = 0.28; // rubber-band when dragged against `direction`

export interface VerticalDragOptions {
  /** Element that receives the touch listeners. */
  targetRef: RefObject<HTMLElement | null>;
  /** The direction that counts as travel. Dragging the other way rubber-bands. */
  direction: 'down' | 'up';
  /** Full travel distance in px, used for the commit threshold and progress. */
  distance: () => number;
  /** Listeners are attached once; this must not change across the gesture. */
  enabled?: boolean;
  /** Veto a gesture before it starts (scrolled content, nested sheets…). */
  canStart?: (e: TouchEvent) => boolean;
  onStart?: () => void;
  /** `travel` is px moved in `direction` (negative means rubber-banded back). */
  onMove?: (travel: number, progress: number) => void;
  onEnd?: (commit: boolean, travel: number) => void;
}

export function useVerticalDrag(options: VerticalDragOptions) {
  // Callbacks change every render; the listeners are attached once and read
  // the latest ones through this ref.
  const latest = useRef(options);
  latest.current = options;

  const { targetRef, enabled = true } = options;

  useEffect(() => {
    const el = targetRef.current;
    if (!el || !enabled) return;

    let axis: 'none' | 'vertical' | 'horizontal' = 'none';
    let active   = false;
    let startX   = 0;
    let startY   = 0;
    let travel   = 0;
    let lastY    = 0;
    let lastTime = 0;
    let velocity = 0;

    const sign = () => (latest.current.direction === 'down' ? 1 : -1);

    function onTouchStart(e: TouchEvent) {
      if (e.touches.length !== 1) return;
      if (latest.current.canStart && !latest.current.canStart(e)) return;
      axis     = 'none';
      active   = true;
      travel   = 0;
      velocity = 0;
      startX   = e.touches[0].clientX;
      startY   = e.touches[0].clientY;
      lastY    = startY;
      lastTime = e.timeStamp;
    }

    function onTouchMove(e: TouchEvent) {
      if (!active) return;
      const y  = e.touches[0].clientY;
      const dy = y - startY;
      const dx = e.touches[0].clientX - startX;

      if (axis === 'none') {
        if (Math.abs(dx) < AXIS_LOCK_PX && Math.abs(dy) < AXIS_LOCK_PX) return;
        // A mostly-horizontal move belongs to the carousel, and a first move
        // against `direction` belongs to native scrolling. Drop both.
        if (Math.abs(dy) <= Math.abs(dx) || Math.sign(dy) !== sign()) {
          active = false;
          return;
        }
        axis = 'vertical';
        latest.current.onStart?.();
      }

      e.preventDefault();
      const raw = dy * sign();
      travel = raw >= 0 ? raw : raw * BACK_DAMPING;

      const dt = e.timeStamp - lastTime;
      if (dt > 0) velocity = ((y - lastY) * sign()) / dt;
      lastY    = y;
      lastTime = e.timeStamp;

      const dist = Math.max(1, latest.current.distance());
      latest.current.onMove?.(travel, Math.max(0, Math.min(1, travel / dist)));
    }

    function onTouchEnd() {
      if (!active) return;
      const wasVertical = axis === 'vertical';
      active = false;
      axis   = 'none';
      if (!wasVertical) return;
      const dist   = Math.max(1, latest.current.distance());
      const commit = travel > dist * COMMIT_RATIO
        || (travel > FLICK_MIN_PX && velocity > COMMIT_VELOCITY);
      latest.current.onEnd?.(commit, travel);
    }

    el.addEventListener('touchstart',  onTouchStart, { passive: true });
    el.addEventListener('touchmove',   onTouchMove,  { passive: false });
    el.addEventListener('touchend',    onTouchEnd,   { passive: true });
    el.addEventListener('touchcancel', onTouchEnd,   { passive: true });
    return () => {
      el.removeEventListener('touchstart',  onTouchStart);
      el.removeEventListener('touchmove',   onTouchMove);
      el.removeEventListener('touchend',    onTouchEnd);
      el.removeEventListener('touchcancel', onTouchEnd);
    };
  }, [targetRef, enabled]);
}

/**
 * True when the touch may start a sheet drag — i.e. it did not land inside a
 * nested sheet (`data-sheet-no-drag`) and no scrollable ancestor below `root`
 * is scrolled away from its top.
 */
export function touchIsAtScrollTop(e: TouchEvent, root: HTMLElement | null): boolean {
  let node = e.target as HTMLElement | null;
  while (node && node !== root) {
    if (node.dataset?.sheetNoDrag !== undefined) return false;
    const overflowY = getComputedStyle(node).overflowY;
    if ((overflowY === 'auto' || overflowY === 'scroll')
      && node.scrollHeight > node.clientHeight + 1
      && node.scrollTop > 0) return false;
    node = node.parentElement;
  }
  return true;
}
