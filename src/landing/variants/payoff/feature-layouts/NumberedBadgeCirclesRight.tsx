import { O2SKIN_BENEFIT } from '../constant/Benefit';
import { CtaButton } from '../../../../components/atoms/CtaButton';

export function NumberedBadgeCirclesRight({ onContinue }: { onContinue: () => void }) {
  return (
    <div className="relative min-h-[100dvh] bg-[var(--lp-bg-minigame)] flex items-center overflow-hidden px-5 py-16">
      <div className="max-w-5xl mx-auto w-full">
        <div className="flex flex-col gap-12 md:grid md:grid-cols-2 md:gap-16 md:items-center">

          {/* ─── Left: title + numbered benefit list + CTA ─── */}
          <div className="flex flex-col gap-7 relative">
            {/* Orbit / radar decoration */}
            <div className="absolute -top-8 -left-10 w-52 h-52 text-cta opacity-[0.08] pointer-events-none" aria-hidden="true">
              <svg viewBox="0 0 134.5 134.5" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                <circle cx="67.25" cy="67.25" r="17.88" stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="67.25" cy="67.25" r="33.24" stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="67.25" cy="67.25" r="54"    stroke="currentColor" strokeWidth="0.8"/>
                <circle cx="67.25" cy="67.25" r="67.24" stroke="currentColor" strokeWidth="0.8"/>
              </svg>
            </div>

            <div className="relative">
              <h2 className="font-extrabold text-2xl md:text-3xl text-cta leading-tight">
                Lợi ích khi chọn<br className="hidden md:block" /> trị mụn ở O2skin
              </h2>
            </div>

            <div className="flex flex-col gap-5">
              {O2SKIN_BENEFIT.map((stat, i) => (
                <div key={i} className="flex items-center gap-4">
                  <div className="w-11 h-11 rounded-full bg-cta text-white font-black text-base flex items-center justify-center shrink-0">
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-black text-xl md:text-2xl text-cta leading-none">{stat.value}</p>
                    <p className="text-sm text-cta/75 leading-snug mt-0.5">{stat.label}</p>
                  </div>
                </div>
              ))}
            </div>

            <CtaButton onClick={onContinue}>
              Xem chương trình phù hợp &#8594;
            </CtaButton>
          </div>

          {/* ─── Right: overlapping circle images ─── */}
          <div className="relative h-[320px] md:h-[420px]">
            <div className="absolute top-0 right-0 w-56 h-56 md:w-72 md:h-72 rounded-full overflow-hidden border-4 border-white shadow-2xl">
              <img
                src="/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg"
                alt="Điều trị theo phác đồ chuẩn tại O2skin"
                className="w-full h-full object-cover"
              />
            </div>
            <div className="absolute bottom-0 right-20 md:right-28 w-40 h-40 md:w-52 md:h-52 rounded-full overflow-hidden border-4 border-[var(--lp-border)] shadow-2xl">
              <img
                src="/benefit/soi-ba-nhon-3n.jpg"
                alt="Soi da cùng chuyên viên O2skin"
                className="w-full h-full object-cover"
              />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
