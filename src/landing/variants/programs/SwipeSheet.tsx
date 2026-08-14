'use client';
import { useEffect, useImperativeHandle, useRef, type ReactNode, type Ref, type RefObject } from 'react';
import { useVerticalDrag, touchIsAtScrollTop } from './useVerticalDrag';

// Full-screen sheet that slides over an underlay screen (the carousel, the
// relevant-programs grid). It can be dismissed by dragging it down, and it can
// be pulled open from the underlay — both follow the finger.

export const SHEET_LEAVE_MS = 340;

const ENTER_MS   = 430;
const ENTER_EASE = 'cubic-bezier(0.32, 0.72, 0, 1)';
const LEAVE_EASE = 'cubic-bezier(0.4, 0, 1, 1)';

const enterTransition = `transform ${ENTER_MS}ms ${ENTER_EASE}, border-radius ${ENTER_MS}ms ${ENTER_EASE}`;
const leaveTransition = `transform ${SHEET_LEAVE_MS}ms ${LEAVE_EASE}, border-radius ${SHEET_LEAVE_MS}ms ${LEAVE_EASE}`;

export interface SwipeSheetHandle {
  /** Position the sheet: 0 = fully open, viewport height = fully dismissed. */
  setTravel: (px: number) => void;
  /** Animate to the open or the dismissed resting position. */
  settle: (toOpen: boolean) => void;
}

export interface SwipeSheetProps {
  /** False starts the leave animation; the parent unmounts after SHEET_LEAVE_MS. */
  open: boolean;
  onClose: () => void;
  /** Screen behind the sheet — scaled and dimmed in step with the drag. */
  underlayRef: RefObject<HTMLElement | null>;
  /** True when the parent is driving an open-pull, so we skip the enter animation. */
  pulling?: boolean;
  handleRef?: Ref<SwipeSheetHandle>;
  children: ReactNode;
}

export function SwipeSheet({ open, onClose, underlayRef, pulling = false, handleRef, children }: SwipeSheetProps) {
  const sheetRef  = useRef<HTMLDivElement>(null);
  const travelRef = useRef(0);
  const closingRef = useRef(false);

  function viewportHeight() {
    return sheetRef.current?.offsetHeight || window.innerHeight;
  }

  function paint(travel: number) {
    travelRef.current = travel;
    const height  = viewportHeight();
    const p       = Math.max(0, Math.min(1, travel / Math.max(1, height)));
    const radius  = Math.min(24, Math.max(0, travel) * 0.4);
    const sheet   = sheetRef.current;
    if (sheet) {
      sheet.style.transform    = `translateY(${travel}px)`;
      sheet.style.borderRadius = `${radius}px ${radius}px 0 0`;
    }
    const under = underlayRef.current;
    if (under) {
      under.style.transform = `scale(${0.91 + 0.09 * p}) translateY(${-18 * (1 - p)}px)`;
      under.style.opacity   = `${0.42 + 0.58 * p}`;
    }
  }

  function animateTo(travel: number, transition: string) {
    // Following the finger is direct manipulation, so it stays; only the
    // released-snap animation is dropped for reduced-motion users.
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const sheet = sheetRef.current;
    const under = underlayRef.current;
    if (sheet) sheet.style.transition = reduced ? 'none' : transition;
    if (under) under.style.transition = reduced
      ? 'none'
      : 'transform 420ms cubic-bezier(0.32, 0.72, 0, 1), opacity 380ms ease';
    paint(travel);
  }

  function stopTransition() {
    if (sheetRef.current) sheetRef.current.style.transition = 'none';
    if (underlayRef.current) underlayRef.current.style.transition = 'none';
  }

  useImperativeHandle(handleRef, () => ({
    setTravel: (px: number) => { stopTransition(); paint(px); },
    settle: (toOpen: boolean) => {
      if (toOpen) animateTo(0, enterTransition);
      else {
        closingRef.current = true;
        animateTo(viewportHeight() * 1.05, leaveTransition);
      }
    },
  }));

  // Entrance. A pull-driven open is already positioned by the finger, so it
  // only gets the resting styles — no animation to fight with.
  useEffect(() => {
    const under = underlayRef.current;
    stopTransition();
    paint(viewportHeight());
    if (!pulling) {
      // Force a reflow so the browser has the closed position to animate from.
      // Deliberately not requestAnimationFrame: rAF is starved while the tab is
      // hidden, which would leave the sheet parked off-screen.
      void sheetRef.current?.offsetHeight;
      animateTo(0, enterTransition);
    }
    return () => {
      // The sheet is going away — hand the underlay back untouched.
      if (under) {
        under.style.transition = '';
        under.style.transform  = '';
        under.style.opacity    = '';
      }
    };
    // Mount-only: `pulling` flips to false once the pull commits, and re-running
    // then would replay the entrance over an already-open sheet.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (open || closingRef.current) return;
    closingRef.current = true;
    animateTo(viewportHeight() * 1.05, leaveTransition);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  useVerticalDrag({
    targetRef: sheetRef,
    direction: 'down',
    distance: viewportHeight,
    canStart: (e) => !closingRef.current && touchIsAtScrollTop(e, sheetRef.current),
    onStart: stopTransition,
    onMove: paint,
    onEnd: (commit) => {
      if (commit) {
        closingRef.current = true;
        animateTo(viewportHeight() * 1.05, leaveTransition);
        onClose();
      } else {
        animateTo(0, enterTransition);
      }
    },
  });

  return (
    <div
      ref={sheetRef}
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 40,
        overflow: 'hidden',
        willChange: 'transform',
        boxShadow: '0 -12px 48px rgba(0,0,0,0.20)',
      }}
    >
      {children}
    </div>
  );
}
