'use client';
import type { ConversionSlotProps } from '../../slots';
import { ConversionOrganism } from '../../organisms/ConversionOrganism';
import { type Testimonial, getTestimonialsForPrograms } from './constant/testimonials';

function TestimonialCard({ quote, name, age, branch, letter, bg, fg }: Testimonial) {
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

function TestimonialsBlock({ programIds }: { programIds: string[] }) {
  const testimonials = getTestimonialsForPrograms(programIds);
  return (
    <div className="w-full flex flex-col gap-3 md:mt-0 animate-fade-in-up">
      <div className="hidden md:block mb-2">
        <p className="text-sm font-bold text-cta/60 uppercase whitespace-nowrap">Khách hàng nói gì về chương trình ?</p>
      </div>
      <div className="flex items-center gap-3 md:hidden">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-sm font-bold text-cta/60 whitespace-nowrap">Khách hàng nói gì về chương trình ?</span>
        <hr className="flex-1 border-[var(--lp-border)]" />
      </div>
      <div className="flex flex-col gap-3">
        {testimonials.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
}

export function ShortFormWithTestimonialsConversion(props: ConversionSlotProps) {
  const programIds = props.selectedProgramId ? [props.selectedProgramId] : [];
  return (
    <ConversionOrganism
      {...props}
      showTestimonials
      testimonialsSlot={<TestimonialsBlock programIds={programIds} />}
    />
  );
}
