'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';

const TESTIMONIALS = [
  {
    quote: 'Sau 3 buổi IPL mụn viêm giảm rõ, thâm mụn cũng mờ dần. Bác sĩ giải thích kỹ từng bước.',
    name: 'Thanh Hà', age: 22, branch: 'Chi nhánh Quận 3',
    letter: 'T', bg: '#fde68a', fg: '#92400e',
  },
  {
    quote: 'Không ép uống thuốc, không bán thêm. Thấy da tốt lên thật sự sau liệu trình.',
    name: 'Minh Châu', age: 25, branch: 'Chi nhánh Bình Thạnh',
    letter: 'M', bg: '#ddd6fe', fg: '#5b21b6',
  },
  {
    quote: 'Da nhạy cảm nhưng IPL không bị kích ứng. Được dặn dò kỹ trước và sau buổi trị.',
    name: 'Phương Linh', age: 20, branch: 'Chi nhánh Thủ Đức',
    letter: 'P', bg: '#d1fae5', fg: '#065f46',
  },
] as const;

function TestimonialCard({ quote, name, age, branch, letter, bg, fg }: typeof TESTIMONIALS[number]) {
  return (
    <div className="bg-[var(--lp-bg-card)] rounded-soft border border-[var(--lp-border)] p-4 shadow-sm">
      <div className="flex gap-0.5 mb-2" aria-label="5 sao">
        {Array.from({ length: 5 }).map((_, i) => (
          <svg key={i} width="14" height="14" viewBox="0 0 14 14" fill="#fbbf24" aria-hidden="true">
            <path d="M7 1l1.6 3.3 3.6.5-2.6 2.5.6 3.6L7 9.3l-3.2 1.6.6-3.6L1.8 4.8l3.6-.5L7 1z" />
          </svg>
        ))}
      </div>
      <p className="text-sm text-cta/80 italic leading-relaxed mb-3">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="flex-shrink-0">
          <circle cx="16" cy="16" r="16" fill={bg} />
          <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill={fg}>{letter}</text>
        </svg>
        <div>
          <p className="text-xs font-semibold text-cta">{name}, {age} tuổi</p>
          <p className="text-xs text-cta/50">{branch}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsBlock() {
  return (
    <div className="w-full flex flex-col gap-3 md:mt-0 animate-fade-in-up">
      <div className="hidden md:block mb-2">
        <p className="text-sm font-bold text-cta/60 uppercase tracking-widest">Khách hàng nói gì</p>
      </div>
      <div className="flex items-center gap-3 md:hidden">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-sm font-bold text-cta/60 whitespace-nowrap">Khách hàng nói gì</span>
        <hr className="flex-1 border-[var(--lp-border)]" />
      </div>
      <div className="flex flex-col gap-3">
        {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
}

export function ShortFormWithTestimonialsConversion(props: ConversionSlotProps) {
  return (
    <ConversionOrganism
      {...props}
      showTestimonials
      testimonialsSlot={<TestimonialsBlock />}
    />
  );
}
