'use client';
import { useState, useEffect, useRef } from 'react';
import type { ExpertHandoffSlotProps } from '../../../slots';
import { trackEvent } from '../../../../lib/trackEvent';

const BUBBLES = [
  { text: 'Cam on ban da danh thong tin!', delay: 300 },
  { text: 'Duoi day la nhan xet so bo ve tinh trang da cua ban...', delay: 1800 },
  { text: 'Chung toi se lien he trong vong 24h de tu van chi tiet hon.', delay: 3200 },
  { text: 'Ban cung co the dat lich ngay ben duoi.', delay: 4600 },
];

export function NaturalSpaExpertHandoff({ result, programId, onContinue }: ExpertHandoffSlotProps) {
  const [visibleBubbles, setVisibleBubbles] = useState<number[]>([]);
  const [showCta, setShowCta] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    BUBBLES.forEach((b, i) => {
      setTimeout(() => {
        setVisibleBubbles(prev => [...prev, i]);
        if (i === BUBBLES.length - 1) {
          setTimeout(() => setShowCta(true), 600);
        }
      }, b.delay);
    });
  }, []);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [visibleBubbles]);

  return (
    <div className="h-[100dvh] flex flex-col bg-[var(--lp-bg-hero)] overflow-hidden"
      style={{ animation: 'fade-in 350ms ease-out both' }}
    >
      <style>{`
        @keyframes fade-in { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes bubble-in { from { opacity: 0; transform: translateY(10px) scale(0.95); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>

      <div className="sticky top-0 z-10 flex items-center gap-3 px-4 py-3 border-b"
        style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 12%, transparent)', background: 'var(--lp-bg-hero)' }}>
        <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-accent)' }}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
            <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          </svg>
        </div>
        <div>
          <div className="text-sm font-bold" style={{ color: 'var(--lp-primary)' }}>Chuyen vien O2skin</div>
          <div className="text-xs" style={{ color: 'color-mix(in srgb, var(--lp-primary) 55%, transparent)' }}>Dang tra loi...</div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 flex flex-col gap-3">
        {visibleBubbles.map((_, i) => (
          <div key={i} className="flex gap-2.5 items-end" style={{ animation: 'bubble-in 350ms cubic-bezier(0.22, 1, 0.36, 1) both' }}>
            {i === 0 && (
              <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: 'var(--lp-accent)' }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                </svg>
              </div>
            )}
            <div className={i > 0 ? 'ml-9' : ''}>
              <div className="max-w-[80%] rounded-2xl rounded-bl-sm px-4 py-2.5 text-sm leading-relaxed"
                style={{ background: 'color-mix(in srgb, var(--lp-accent) 8%, white)', color: 'var(--lp-primary)' }}>
                {BUBBLES[i].text}
              </div>
            </div>
          </div>
        ))}
        {!showCta && visibleBubbles.length < BUBBLES.length && (
          <div className="flex gap-2.5 items-end ml-9">
            <div className="rounded-2xl rounded-bl-sm px-4 py-2.5 flex gap-1"
              style={{ background: 'color-mix(in srgb, var(--lp-accent) 8%, white)' }}>
              {[0, 1, 2].map(i => (
                <div key={i} className="w-1.5 h-1.5 rounded-full" style={{ background: 'var(--lp-accent)', opacity: 0.4, animation: `typing 1.2s ease-in-out ${i * 0.2}s infinite` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {showCta && (
        <div className="px-4 py-4 border-t" style={{ borderColor: 'color-mix(in srgb, var(--lp-primary) 10%, transparent)' }}>
          <button onClick={() => { trackEvent('expert_handoff_continue', { programId }); onContinue(); }}
            className="w-full rounded-full py-3.5 text-base font-bold text-white transition-all active:scale-[0.98]"
            style={{ background: 'var(--lp-accent)' }}>
            Dat lich tu van ngay
          </button>
          <p className="text-xs text-center mt-2" style={{ color: 'color-mix(in srgb, var(--lp-primary) 45%, transparent)' }}>
            Hoan toan mien phi, khong cam ket
          </p>
        </div>
      )}

      <style>{`
        @keyframes typing {
          0%, 60%, 100% { transform: translateY(0); opacity: 0.4; }
          30% { transform: translateY(-3px); opacity: 1; }
        }
      `}</style>
    </div>
  );
}
