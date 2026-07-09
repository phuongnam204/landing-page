'use client';
import { useEffect, useRef, useState } from 'react';
import type { SocialProofSlotProps } from '../../slots';
import { trackEvent } from '../../../lib/trackEvent';
import { SectionShell } from '../../../components/atoms/SectionShell';
import { CtaButton } from '../../../components/atoms/CtaButton';

function VideoStage() {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [reducedMotion, setReducedMotion] = useState(false);
  const [userStarted, setUserStarted] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  function handlePlay() {
    videoRef.current?.play();
    setUserStarted(true);
  }

  if (reducedMotion && !userStarted) {
    return (
      <div className="relative w-full rounded-soft overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img src="/videos/o2skin-quy-trinh-poster.jpg" alt=""
          className="absolute inset-0 w-full h-full object-cover" />
        <button onClick={handlePlay}
          className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
          <svg width="52" height="52" viewBox="0 0 52 52" aria-hidden="true">
            <circle cx="26" cy="26" r="22" fill="white" fillOpacity="0.92" />
            <path d="M20 16v20l18-10z" fill="var(--lp-primary, #2D2640)" />
          </svg>
        </button>
      </div>
    );
  }

  return (
    <div className="relative w-full rounded-soft overflow-hidden" style={{ aspectRatio: '16/9' }}>
      <video ref={videoRef} autoPlay muted loop playsInline preload="metadata"
        poster="/videos/o2skin-quy-trinh-poster.jpg"
        src="/videos/o2skin-quy-trinh.mp4"
        className="absolute inset-0 w-full h-full object-cover" />
    </div>
  );
}

export function VideoProofSocial({ onContinue }: SocialProofSlotProps) {
  useEffect(() => { trackEvent('socialproof_view'); }, []);

  return (
    <SectionShell bgVar="--lp-bg-payoff" center>
      <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-8 shadow-lg shadow-cta/10 flex flex-col gap-4 animate-fade-in-up">
        <p className="font-extrabold text-lg text-cta text-center leading-snug">
          Tri mun chuan y khoa cung bac si da lieu
        </p>
        <VideoStage />
        <CtaButton onClick={onContinue} fullWidth>
          Hoan tat
        </CtaButton>
      </div>
    </SectionShell>
  );
}
