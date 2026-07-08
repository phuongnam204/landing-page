'use client';
import { useState, useEffect, useRef } from 'react';
import type { ConversionSlotProps } from '../../slots';
import { getPrograms } from '../../../content/catalog';
import { branches } from '../../../content/branches';
import { trackEvent } from '../../../lib/trackEvent';

const PHONE_RE = /(^0[0-9]{9}$)|(^\+84[0-9]{9}$)/;
type UXState = 'idle' | 'pending' | 'error';

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

function PendingSpinner() {
  return (
    <svg className="inline-block animate-spin -ml-1 mr-2" width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="6" stroke="currentColor" strokeWidth="2" strokeOpacity="0.25" />
      <path d="M14 8A6 6 0 0 1 2 8" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

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
          <p className="text-xs font-semibold text-cta">{name}, {age} tuổi</p>
          <p className="text-xs text-cta/50">{branch}</p>
        </div>
      </div>
    </div>
  );
}

function BranchDropdown({ value, onChange }: { value: string; onChange: (code: string) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const selected = branches.find(b => b.code === value);

  useEffect(() => {
    if (!open) return;
    function onMouseDown(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onMouseDown);
    return () => document.removeEventListener('mousedown', onMouseDown);
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen(o => !o)}
        className="w-full flex items-center justify-between border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm bg-white text-left"
      >
        <span className={selected ? 'text-cta' : 'text-cta/40'}>
          {selected?.name ?? 'Chọn chi nhánh gần bạn'}
        </span>
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}>
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      <div
        className="absolute left-0 right-0 top-full mt-1 z-20 bg-white rounded-2xl border border-[var(--lp-border)] shadow-lg overflow-hidden transition-all duration-200"
        style={{ maxHeight: open ? '280px' : '0px', opacity: open ? 1 : 0 }}
      >
        {branches.map(b => (
          <button
            key={b.code}
            type="button"
            onClick={() => { onChange(b.code); setOpen(false); }}
            className="w-full text-left px-4 py-3 text-sm flex items-center justify-between hover:bg-[var(--lp-bg-hero)] transition-colors"
          >
            <span className={value === b.code ? 'font-semibold text-cta' : 'text-cta/70'}>{b.name}</span>
            {value === b.code && (
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                <path d="M3 7l3 3 5-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

function BookingForm({ selectedProgramId, minigameResult, onSuccess }: {
  selectedProgramId: string | null;
  minigameResult: ConversionSlotProps['minigameResult'];
  onSuccess: (name: string, phone: string) => void;
}) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uxState, setUxState] = useState<UXState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const programName = selectedProgramId
    ? getPrograms().find(p => p.id === selectedProgramId)?.name ?? null
    : null;

  function validatePhone(val: string): boolean {
    if (!val.trim()) { setPhoneError(''); return false; }
    if (!PHONE_RE.test(val.trim())) {
      setPhoneError('Số điện thoại không hợp lệ (10 số, bắt đầu 0 hoặc +84)');
      return false;
    }
    setPhoneError('');
    return true;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (uxState === 'pending') return;
    if (!name.trim() || !validatePhone(phone) || !branch) return;
    setUxState('pending');
    setErrorMessage('');
    try {
      const res = await fetch('/api/lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(), phone: phone.trim(), branch,
          skinCondition: minigameResult?.condition.label ?? '',
          programId: selectedProgramId ?? '',
          recipeId: 'v04-combined',
        }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data.error || 'Không thể gửi thông tin, thử lại sau.');
      onSuccess(name.trim(), phone.trim());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể gửi thông tin, thử lại sau.');
      setUxState('error');
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center md:text-left">
        Đặt lịch tư vấn miễn phí
      </p>
      {programName && (
        <p className="text-sm text-cta/70 -mt-2 text-center md:text-left">
          Chuyên viên sẽ liên hệ tư vấn chương trình{' '}
          <span className="font-semibold text-cta">{programName}</span>.
        </p>
      )}
      <form onSubmit={handleSubmit} className="bg-[var(--lp-bg-card)] rounded-soft p-5 shadow-lg shadow-cta/10 flex flex-col gap-3">
        <input
          type="text" placeholder="Tên của bạn" value={name}
          onChange={e => setName(e.target.value)} required
          className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
        />
        <div>
          <input
            type="tel" placeholder="Số điện thoại" value={phone}
            onChange={e => { setPhone(e.target.value); setPhoneError(''); }}
            onBlur={e => validatePhone(e.target.value)} required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
          />
          {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
        </div>

        <BranchDropdown value={branch} onChange={setBranch} />

        {minigameResult && (
          <div className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta/60 bg-[var(--lp-bg-hero)]">
            <div className="font-semibold text-cta">{minigameResult.condition.label}</div>
            <div className="text-[11px] mt-0.5">Dựa trên kết quả kiểm tra của bạn</div>
          </div>
        )}

        <button
          type="submit" disabled={uxState === 'pending'}
          className="bg-cta text-white font-bold text-sm py-3.5 rounded-soft mt-1 disabled:opacity-60 hover:enabled:opacity-90 transition-opacity flex items-center justify-center gap-2"
        >
          {uxState === 'pending' ? <><PendingSpinner />Đang gửi...</> : 'Gửi thông tin'}
        </button>

        {uxState === 'error' && errorMessage && (
          <p className="text-xs text-red-500 text-center">{errorMessage}</p>
        )}

        <p className="text-xs text-cta/50 text-center">
          Bằng cách gửi thông tin, bạn đồng ý để o2skin liên hệ tư vấn.
        </p>
      </form>
    </div>
  );
}

function TestimonialColumn() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <hr className="flex-1 border-[var(--lp-border)]" />
        <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Khách hàng nói gì</span>
        <hr className="flex-1 border-[var(--lp-border)]" />
      </div>
      <p className="text-xs text-cta/40 text-center md:hidden">&#8595; Kéo xuống để xem review</p>
      <div className="flex flex-col gap-3">
        {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} />)}
      </div>
    </div>
  );
}

export function ShortFormWithTestimonialsConversion({ selectedProgramId, minigameResult, onSubmit }: ConversionSlotProps) {
  useEffect(() => { trackEvent('conversion_social_view'); }, []);

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-5xl mx-auto px-5 py-8">
        <div className="flex flex-col gap-4 md:grid md:grid-cols-2 md:gap-8 md:items-start">
          <BookingForm
            selectedProgramId={selectedProgramId}
            minigameResult={minigameResult}
            onSuccess={onSubmit}
          />
          <TestimonialColumn />
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
