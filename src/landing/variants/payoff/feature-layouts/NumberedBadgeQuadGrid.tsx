import type { PayoffItem } from './types';
import { benefitsAsItems } from '../constant/Benefit';
import { CtaButton } from '../../../../components/atoms/CtaButton';

const DEFAULT_ACCENT_IMAGES: [string, string] = [
  '/benefit/dieu-tri-theo-phac-do-chuan-o2-skin.jpg',
  '/benefit/soi-ba-nhon-3n.jpg',
];

export function NumberedBadgeQuadGrid({
  onContinue,
  items = benefitsAsItems,
  accentImages = DEFAULT_ACCENT_IMAGES,
}: {
  onContinue: () => void;
  items?: PayoffItem[];
  accentImages?: [string, string];
}) {
  const rows = [0, 1].map((ri) => ({
    left: items[ri * 2],
    right: items[ri * 2 + 1],
    img: accentImages[ri],
    leftNum: String(ri * 2 + 1).padStart(2, '0'),
    rightNum: String(ri * 2 + 2).padStart(2, '0'),
  }));

  return (
    <div
      className="min-h-[100dvh] flex flex-col items-center justify-center py-14"
      style={{ background: 'var(--lp-primary)' }}
    >
      {/* Section header */}
      <div className="px-6 mb-10 text-center">
        <p
          className="text-[10px] font-semibold uppercase tracking-[2.5px] mb-3"
          style={{ color: 'rgba(255,255,255,0.45)' }}
        >
          Tại sao chọn chúng tôi
        </p>
        <h2 className="font-extrabold text-2xl md:text-3xl text-white leading-tight tracking-tight">
          Lợi ích khi chọn<br className="hidden md:block" /> trị mụn ở O2skin
        </h2>
      </div>

      {/* Grid */}
      <div
        className="w-full max-w-5xl"
        style={{
          borderTop: '1px solid rgba(255,255,255,0.10)',
          borderBottom: '1px solid rgba(255,255,255,0.10)',
        }}
      >
        {rows.map((row, ri) => (
          <div
            key={ri}
            className="relative flex"
            style={{
              minHeight: '240px',
              ...(ri < rows.length - 1
                ? { borderBottom: '1px solid rgba(255,255,255,0.10)' }
                : {}),
            }}
          >
            {/* Left cell */}
            <div
              className="flex-1 flex flex-col justify-center py-8 pl-5 md:pl-10 lg:pl-14 pr-[60px] md:pr-[128px]"
              style={{ borderRight: '1px solid rgba(255,255,255,0.10)' }}
            >
              <p
                className="text-[10px] font-bold tracking-[2px] mb-2.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {row.leftNum}
              </p>
              <h3 className="font-extrabold text-lg md:text-xl text-white leading-tight mb-2">
                {row.left?.title}
              </h3>
              <p
                className="text-xs md:text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.62)' }}
              >
                {row.left?.body}
              </p>
            </div>

            {/* Circle at column junction — z-10 covers the border-right divider */}
            <div
              className="absolute top-1/2 z-10 w-24 h-24 md:w-56 md:h-56 rounded-full overflow-hidden"
              style={{
                left: '50%',
                transform: 'translate(-50%, -50%)',
                border: '3px solid rgba(255,255,255,0.18)',
                outline: '1px solid rgba(255,255,255,0.07)',
              }}
            >
              <img
                src={row.img}
                alt=""
                aria-hidden="true"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Right cell */}
            <div className="flex-1 flex flex-col justify-center py-8 pr-5 md:pr-10 lg:pr-14 pl-[60px] md:pl-[128px]">
              <p
                className="text-[10px] font-bold tracking-[2px] mb-2.5"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {row.rightNum}
              </p>
              <h3 className="font-extrabold text-lg md:text-xl text-white leading-tight mb-2">
                {row.right?.title}
              </h3>
              <p
                className="text-xs md:text-sm leading-relaxed"
                style={{ color: 'rgba(255,255,255,0.62)' }}
              >
                {row.right?.body}
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* CTA — inverse variant (white bg) để nổi trên nền tối */}
      <div className="mt-10 px-6">
        <CtaButton variant="inverse" onClick={onContinue}>
          O2skin có gì đặc biệt ?
        </CtaButton>
      </div>
    </div>
  );
}
