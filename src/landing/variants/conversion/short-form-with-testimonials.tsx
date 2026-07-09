'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';

const TESTIMONIALS = [
  {
    quote: 'Sau 3 buoi IPL mun viem giam ro, tham mun cung mo dan. Bac si giai thich ky tung buoc.',
    name: 'Thanh Ha', age: 22, branch: 'Chi nhanh Quan 3',
    letter: 'T', bg: '#fde68a', fg: '#92400e',
  },
  {
    quote: 'Khong ep uong thuoc, khong ban them. Thay da tot len that su sau lieu trinh.',
    name: 'Minh Chau', age: 25, branch: 'Chi nhanh Binh Thanh',
    letter: 'M', bg: '#ddd6fe', fg: '#5b21b6',
  },
  {
    quote: 'Da nhay cam nhung IPL khong bi kich ung. Duoc dan do ky truoc va sau buoi tri.',
    name: 'Phuong Linh', age: 20, branch: 'Chi nhanh Thu Duc',
    letter: 'P', bg: '#d1fae5', fg: '#065f46',
  },
] as const;

function TestimonialCard({ quote, name, age, branch, letter, bg, fg }: typeof TESTIMONIALS[number]) {
  return (
    <div className="bg-[var(--lp-bg-card)] rounded-soft border border-[var(--lp-border)] p-4 shadow-sm">
      <p className="text-amber-400 text-sm mb-2" aria-label="5 sao">{'★'.repeat(5)}</p>
      <p className="text-sm text-cta/80 italic leading-relaxed mb-3">&ldquo;{quote}&rdquo;</p>
      <div className="flex items-center gap-3">
        <svg width="32" height="32" viewBox="0 0 32 32" aria-hidden="true" className="flex-shrink-0">
          <circle cx="16" cy="16" r="16" fill={bg} />
          <text x="16" y="21" textAnchor="middle" fontSize="14" fontWeight="700" fill={fg}>{letter}</text>
        </svg>
        <div>
          <p className="text-xs font-semibold text-cta">{name}, {age} tuoi</p>
          <p className="text-xs text-cta/50">{branch}</p>
        </div>
      </div>
    </div>
  );
}

function TestimonialsBlock() {
  return (
    <div className="max-w-lg w-full mt-6 flex flex-col gap-3 animate-fade-in-up">
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Khach hang noi gi</span>
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
