'use client';
import { useEffect, useRef, useState } from 'react';
import type { DoneSlotProps } from '../../slots';
import { branches } from '../../../content/branches';
import { SectionShell } from '../../../components/atoms/SectionShell';

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

  function handlePlay() { videoRef.current?.play(); setUserStarted(true); }

  if (reducedMotion && !userStarted) {
    return (
      <div className="relative w-full rounded-soft overflow-hidden" style={{ aspectRatio: '16/9' }}>
        <img src="/videos/o2skin-quy-trinh-poster.jpg" alt="" className="absolute inset-0 w-full h-full object-cover" />
        <button onClick={handlePlay} className="absolute inset-0 flex items-center justify-center bg-black/20 hover:bg-black/30 transition-colors cursor-pointer">
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

export function ContactInfoWithVideoDone({ selectedProgramId: _ }: DoneSlotProps) {
  return (
    <SectionShell bgVar="--lp-bg-payoff" overflow="auto">
      <div className="max-w-5xl mx-auto px-5 py-8 md:py-12 animate-fade-in-up">

        <div className="text-center mb-8">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" strokeDasharray="132" strokeDashoffset="132"
                style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <h1 className="font-extrabold text-2xl md:text-3xl text-cta mb-2">Đã nhận thông tin của bạn!</h1>
          <p className="text-sm md:text-base text-cta/70 max-w-sm mx-auto">
            Chuyên viên O2skin sẽ liên hệ trong vòng <b className="text-cta">24 giờ</b> để tư vấn và đặt lịch phù hợp.
          </p>
        </div>

        <div className="flex flex-col md:grid md:grid-cols-2 md:gap-10 md:items-start gap-6">
          <div className="md:order-2 bg-[var(--lp-bg-card)] rounded-soft p-5 md:p-6 shadow-sm shadow-cta/10">
            <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-4">Thông tin liên hệ</p>

            <div className="flex items-center gap-3 mb-5 pb-5 border-b border-[var(--lp-border)]">
              <div className="w-10 h-10 rounded-full bg-cta/10 flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-5 h-5 text-cta" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.6 12.27a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.51 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.22a16 16 0 0 0 6.29 6.29l1.18-.37a2 2 0 0 1 2.11.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.06z" />
                </svg>
              </div>
              <div>
                <p className="text-xs text-cta/50 font-medium">Hotline miễn phí!</p>
                <p className="font-extrabold text-xl text-cta leading-tight">1800 9292</p>
              </div>
            </div>

            <p className="text-xs font-bold text-cta/40 uppercase tracking-widest mb-3">Địa chỉ phòng khám</p>
            <div className="flex flex-col gap-4">
              {branches.map(b => (
                <div key={b.code} className="flex items-start gap-3">
                  <div className="w-1.5 h-1.5 rounded-full bg-cta/40 mt-2 shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-cta">{b.name}</p>
                    {b.mapsUrl ? (
                      <a
                        href={b.mapsUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-cta/55 mt-0.5 leading-relaxed inline-flex items-center gap-1 hover:text-[var(--lp-accent,#2D2640)] transition-colors hover:underline underline-offset-2"
                      >
                        {b.address}
                        <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                      </a>
                    ) : (
                      <p className="text-xs text-cta/55 mt-0.5 leading-relaxed">{b.address}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="md:order-1 flex flex-col gap-3">
            <h2 className="text-xl font-bold text-cta text-center md:text-left">
              Trị mụn chuẩn y khoa cùng bác sĩ da liễu
            </h2>
            <VideoStage />
            <p className="text-sm text-cta/50 text-center md:text-left leading-relaxed">
              Quy trình khám và trị liệu tại o2skin được thực hiện bởi bác sĩ có chuyên môn sâu.
            </p>
          </div>
        </div>

        <div className="h-8" />
      </div>
    </SectionShell>
  );
}
