import { O2SKIN_FEATURES } from '../constant/Features';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function CardListCirclesLeft({ onContinue }: { onContinue: () => void }) {
  return (
    <div
      className="relative min-h-[100dvh] flex flex-col items-center justify-center overflow-hidden px-5 py-12"
      style={{ background: 'linear-gradient(135deg, var(--lp-primary) 0%, color-mix(in srgb, var(--lp-primary) 50%, var(--lp-accent)) 50%, var(--lp-accent) 100%)' }}
    >
      <div className="absolute inset-0 pointer-events-none" aria-hidden="true"
        style={{ background: 'radial-gradient(circle at 85% 15%, rgba(255,255,255,0.07) 0%, transparent 55%)' }} />

      <div className="relative z-10 max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-10 md:grid md:grid-cols-2 md:gap-16 md:items-center">

          {/* ─── Left: overlapping circle images + IPL badge ─── */}
          <div className="relative h-[300px] md:h-[460px]">
            <div className="absolute top-0 left-0 w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white/20 shadow-2xl">
              <img
                src="/feature/IMG_1619.jpg"
                alt="Điều trị IPL tại O2Skin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 left-20 md:left-28 w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-white/10 shadow-xl">
              <img
                src="/feature/co-so-vat-chat-hien-dai-3.jpg"
                alt="Cơ sở vật chất hiện đại tại O2skin"
                className="w-full h-full object-cover"
              />
            </div>
            {/* Floating tech badge */}
            <div className="absolute bottom-6 right-0 bg-white rounded-soft px-4 py-2.5 shadow-xl">
              <p className="text-xs font-black text-cta uppercase tracking-wider leading-none">IPL / Laser</p>
              <p className="text-xs text-cta/55 mt-1">Thiết bị nhập khẩu chính hãng</p>
            </div>
          </div>

          {/* ─── Right: title + feature cards + CTA ─── */}
          <div className="flex flex-col gap-7">
            <h2 className="font-extrabold text-2xl md:text-3xl text-white leading-tight">
              Những gì O2skin có
            </h2>

            <div className="flex flex-col gap-4">
              {O2SKIN_FEATURES.map((f, i) => (
                <div key={i} className="bg-white/90 rounded-soft p-4 md:p-5 flex flex-col gap-1.5">
                  <p className="font-extrabold text-xs md:text-sm text-cta uppercase tracking-wider leading-snug">
                    {f.title}
                  </p>
                  <p className="text-sm text-cta/70 leading-relaxed">{f.body}</p>
                </div>
              ))}
            </div>

            <CtaButton variant="dark" size="lg" onClick={onContinue} className="shadow-lg">
              Xem chương trình phù hợp &#8594;
            </CtaButton>
          </div>

        </div>
      </div>
    </div>
  );
}
