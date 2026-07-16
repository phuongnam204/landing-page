'use client';
import type { PayoffItem } from './types';
import { o2skinStats } from '../constant/Stats';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function CirclesWithBackground({
  onContinue,
  items = o2skinStats,
  bgImage = '/benefit/hinh-co-so-vat-chat.jpg',
}: {
  onContinue: () => void;
  items?: PayoffItem[];
  bgImage?: string;
}) {
  return (
    <div className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden">
      {/* Background image + overlay */}
      <div className="absolute inset-0">
        <img src={bgImage} alt="" className="w-full h-full object-cover" />
        <div
          className="absolute inset-0"
          style={{ background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.35) 55%, rgba(0,0,0,0.65) 100%)' }}
        />
      </div>

      <div className="relative z-10 max-w-5xl mx-auto w-full px-5 py-16 flex flex-col items-center gap-10">
        <h2 className="font-black text-3xl md:text-4xl text-white text-center leading-tight">
          Chúng tôi luôn đảm bảo<br className="hidden md:block" /> chất lượng dịch vụ
        </h2>

        {/* Stat circles */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 w-full">
          {items.map((item, i) => (
            <div key={i} className="flex justify-center">
              <div
                className="w-36 h-36 md:w-44 md:h-44 rounded-full flex flex-col items-center justify-center px-4 shadow-2xl"
                style={{ background: 'rgba(255,255,255,0.95)' }}
              >
                <p
                  className="font-black text-2xl md:text-3xl leading-none text-center"
                  style={{ color: 'var(--lp-accent)' }}
                >
                  {item.title}
                  {item.unit && (
                    <span className="text-lg md:text-xl">{item.unit}</span>
                  )}
                </p>
                <p
                  className="text-xs md:text-sm text-center font-semibold mt-2 leading-snug"
                  style={{ color: 'var(--lp-primary)' }}
                >
                  {item.body}
                </p>
              </div>
            </div>
          ))}
        </div>

        <CtaButton variant="dark" size="lg" onClick={onContinue}>
          Xem chương trình phù hợp &#8594;
        </CtaButton>
      </div>
    </div>
  );
}
