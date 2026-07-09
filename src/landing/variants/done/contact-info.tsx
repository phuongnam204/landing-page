'use client';
import type { DoneSlotProps } from '../../slots';
import { SectionShell } from '../../../components/atoms/SectionShell';

export function ContactInfoDone({ selectedProgramId }: DoneSlotProps) {
  return (
    <SectionShell bgVar="--lp-bg-payoff" center>
      <div className="max-w-lg w-full bg-[var(--lp-bg-card)] rounded-soft p-6 md:p-10 shadow-lg shadow-cta/10 animate-fade-in-up">
        <div className="text-center mb-6">
          <div className="flex items-center justify-center mb-3">
            <svg viewBox="0 0 48 48" className="w-12 h-12 text-teal-500" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="24" cy="24" r="21" strokeOpacity="0.25" />
              <circle cx="24" cy="24" r="21" strokeDasharray="132" strokeDashoffset="132" style={{ animation: 'dashIn 0.6s ease-out forwards', strokeOpacity: 0.8 }} />
              <path d="M14 25l7 7 13-14" style={{ animation: 'fadeIn 0.3s ease-out 0.5s both' }} />
            </svg>
          </div>
          <div className="font-extrabold text-xl md:text-2xl text-cta mb-2">Da nhan thong tin cua ban!</div>
          <p className="text-sm md:text-base text-cta/70 leading-relaxed">
            Chuyen vien o2skin se lien he trong vong <b className="text-cta">24 gio</b> de tu van va dat lich phu hop.
          </p>
        </div>
        <div className="border-t border-cta/10 pt-5 flex flex-col gap-4">
          <p className="text-xs font-bold text-cta/40 uppercase tracking-widest">Trong khi cho doi</p>
          <div className="flex items-start gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5 text-cta/50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 21s-7-6.3-7-11a7 7 0 1 1 14 0c0 4.7-7 11-7 11z" />
              <circle cx="12" cy="10" r="2" />
            </svg>
            <div>
              <p className="text-sm font-bold text-cta">Dia chi phong kham</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">Lien he hotline de biet chi nhanh gan nhat.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <svg viewBox="0 0 24 24" className="w-5 h-5 shrink-0 mt-0.5 text-cta/50" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07A19.5 19.5 0 0 1 4.6 12.27a19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 3.51 1.5h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L7.91 9.22a16 16 0 0 0 6.29 6.29l1.18-.37a2 2 0 0 1 2.11.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 18.06z" />
            </svg>
            <div>
              <p className="text-sm font-bold text-cta">Hotline</p>
              <p className="text-xs md:text-sm text-cta/60 mt-0.5">Goi hotline de dat lich truc tiep neu can tu van gap.</p>
            </div>
          </div>
        </div>
      </div>
    </SectionShell>
  );
}
