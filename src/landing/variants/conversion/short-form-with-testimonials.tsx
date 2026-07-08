'use client';
import { useState, useEffect } from 'react';
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
      <p className="text-amber-400 text-sm mb-2" aria-label="5 sao">{'\u2605'.repeat(5)}</p>
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

export function ShortFormWithTestimonialsConversion({ selectedProgramId, minigameResult, onSubmit }: ConversionSlotProps) {
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [branch, setBranch] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [uxState, setUxState] = useState<UXState>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => { trackEvent('conversion_social_view'); }, []);

  const programName = selectedProgramId
    ? getPrograms().find(p => p.id === selectedProgramId)?.name
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
    if (!name.trim()) return;
    if (!validatePhone(phone)) return;
    if (!branch) return;

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
      onSubmit(name.trim(), phone.trim());
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Không thể gửi thông tin, thử lại sau.');
      setUxState('error');
    }
  }

  return (
    <div className="h-[100dvh] w-full bg-[var(--lp-bg-payoff)] overflow-y-auto">
      <div className="max-w-lg mx-auto px-5 py-8 flex flex-col gap-4">
        <p className="text-xs font-bold uppercase tracking-widest text-cta/50 text-center">
          Đặt lịch tư vấn miễn phí
        </p>
        {programName && (
          <p className="text-sm text-cta/70 text-center -mt-2">
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
              onBlur={e => validatePhone(e.target.value)}
              required
              className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta w-full"
            />
            {phoneError && <p className="text-[11px] text-red-500 mt-1 px-1">{phoneError}</p>}
          </div>

          <select
            value={branch} onChange={e => setBranch(e.target.value)} required
            className="border-2 border-[var(--lp-border)] rounded-2xl py-3 px-4 text-sm text-cta bg-white w-full"
          >
            <option value="" disabled>Chọn chi nhánh gần bạn</option>
            {branches.map(b => <option key={b.code} value={b.code}>{b.name}</option>)}
          </select>

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

        <div className="flex items-center gap-3 mt-2">
          <hr className="flex-1 border-[var(--lp-border)]" />
          <span className="text-xs text-cta/40 font-semibold whitespace-nowrap">Khách hàng nói gì</span>
          <hr className="flex-1 border-[var(--lp-border)]" />
        </div>

        <p className="text-xs text-cta/40 text-center -mt-2">&#8595; Kéo xuống để xem review</p>

        <div className="flex flex-col gap-3">
          {TESTIMONIALS.map((t, i) => <TestimonialCard key={i} {...t} />)}
        </div>
        <div className="h-4" />
      </div>
    </div>
  );
}
